// TASK-014 Gap 4 — Click-through dashboard NEXORA bằng headless Chrome + CDP thuần (Node 24, không cần puppeteer).
// Cách chạy: (1) cd frontend && npm run build && npm run start -- -p 3000
//            (2) node frontend/scripts/clickthrough-dashboard.mjs  (tự mở chrome headless cổng 9222)
// Backend cổng 4000 KHÔNG chạy: script chặn request /auth/me qua Fetch domain và
// trả profile giả, đồng thời seed token + user/tenant cache vào localStorage TRƯỚC khi
// page load — chỉ là dữ liệu giả trong trình duyệt chụp, KHÔNG sửa code FE.
// Kết quả: screenshots/dashboard-click-*.png + in bảng PASS/FAIL ra stdout.
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";

const BASE = "http://localhost:3000";
const SHOT_DIR = (process.env.CLICK_SHOT_DIR || new URL("../../screenshots/", import.meta.url).pathname).replace(/\/?$/, "/");
const PLAYWRIGHT_CHROME = `${process.env.HOME}/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome`;
// Thứ tự ưu tiên: CHROME_BIN > google-chrome hệ thống > chromium stock của
// Playwright (không bị Hatch WebGL policy / LNA chặn) > meta-chromium.
const CHROME = process.env.CHROME_BIN
  || (existsSync("/usr/bin/google-chrome") ? "/usr/bin/google-chrome"
    : existsSync(PLAYWRIGHT_CHROME) ? PLAYWRIGHT_CHROME : "/opt/meta-chromium/chrome");
const IS_HATCH_CHROME = CHROME.includes("meta-chromium");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const FAKE_PROFILE = {
  id: "u-clickthrough",
  email: "admin@nexora.test",
  fullName: "Quản Trị Viên",
  phoneNumber: "0900000000",
  role: "ADMIN",
  status: "ACTIVE",
  tenant: { id: "t-clickthrough", name: "Gia Dụng Hiện Đại", slug: "gia-dung-hien-dai", status: "ACTIVE" },
};

const SEED_JS = `
  try {
    localStorage.setItem('nexora_access_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.clickthrough-fake-token');
    localStorage.setItem('nexora_user_cache', JSON.stringify(${JSON.stringify({
      id: FAKE_PROFILE.id, email: FAKE_PROFILE.email, fullName: FAKE_PROFILE.fullName,
      phoneNumber: FAKE_PROFILE.phoneNumber, role: FAKE_PROFILE.role, status: FAKE_PROFILE.status,
    })}));
    localStorage.setItem('nexora_tenant_cache', JSON.stringify(${JSON.stringify(FAKE_PROFILE.tenant)}));
  } catch (e) { console.warn('seed localStorage failed', e); }
`;

// ---------- CDP client tối giản qua WebSocket global của Node 24 ----------
class Cdp {
  constructor(wsUrl) { this.ws = new WebSocket(wsUrl); this.id = 0; this.pending = new Map(); this.handlers = []; this.sessionId = null; }
  async connect() {
    await new Promise((res, rej) => { this.ws.onopen = res; this.ws.onerror = rej; });
    this.ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) { const { res, rej } = this.pending.get(msg.id); this.pending.delete(msg.id); msg.error ? rej(new Error(JSON.stringify(msg.error))) : res(msg.result); }
      else if (msg.method) { for (const h of this.handlers) h(msg); }
    };
  }
  send(method, params = {}, sessionId = this.sessionId) {
    const id = ++this.id;
    return new Promise((res, rej) => {
      this.pending.set(id, { res, rej });
      this.ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
      setTimeout(() => { if (this.pending.has(id)) { this.pending.delete(id); rej(new Error("CDP timeout " + method)); } }, 30000);
    });
  }
  on(fn) { this.handlers.push(fn); }
  async eval(expression) {
    const r = await this.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error("JS eval failed: " + JSON.stringify(r.exceptionDetails).slice(0, 500));
    return r.result?.value;
  }
  async shot(name) {
    const r = await this.send("Page.captureScreenshot", { format: "png" });
    const p = SHOT_DIR + name;
    writeFileSync(p, Buffer.from(r.data, "base64"));
    return p;
  }
  async clickAt(x, y) {
    await this.send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
    await this.send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
  }
  // Tìm element bằng JS, trả về rect giữa màn hình; click thật bằng chuột tại đó.
  async clickByJs(findExpr, label) {
    const rect = await this.eval(`(() => { const el = ${findExpr}; if (!el) return null;
      const r = el.getBoundingClientRect(); if (r.width === 0 && r.height === 0) return { zero: true };
      return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height, text: (el.innerText || el.title || '').slice(0, 80) }; })()`);
    if (!rect) return { ok: false, reason: `không tìm thấy element: ${label}` };
    if (rect.zero) return { ok: false, reason: `element có kích thước 0 (có thể bị ẩn): ${label}` };
    await this.clickAt(Math.round(rect.x), Math.round(rect.y));
    return { ok: true, detail: `clicked "${rect.text.trim()}" tại (${Math.round(rect.x)}, ${Math.round(rect.y)})` };
  }
  async waitFor(expr, timeoutMs = 12000, label = "") {
    const t0 = Date.now();
    while (Date.now() - t0 < timeoutMs) { try { if (await this.eval(expr)) return true; } catch {} await sleep(400); }
    throw new Error(`timeout ${timeoutMs}ms chờ: ${label || expr}`);
  }
}

const results = [];
const consoleErrors = [];
const failedRequests = [];
function record(name, ok, detail = "") { results.push({ name, ok, detail }); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`); }

async function main() {
  mkdirSync(SHOT_DIR, { recursive: true });
  // Chrome Hatch (meta-chromium) yêu cầu WebGL domain policy mới khởi động
  // được: file contract + SHA-256 của file. Nằm ngoài NEXORA, chỉ để chạy
  // headless Chrome trong VM này (dashboard không dùng WebGL).
  const POLICY_FILE = process.env.HATCH_WEBGL_POLICY_FILE || "/tmp/shot/webgl-domains.txt";
  const chromeArgs = ["--headless=new", "--remote-debugging-port=9222", "--no-sandbox",
    "--disable-gpu", "--hide-scrollbars", "--user-data-dir=/tmp/shot-profile",
    "--window-size=1440,900",
    // Chrome 157 chặn điều hướng từ about:blank sang localhost (Local
    // Network Access checks) — tắt check này cho test local.
    "--disable-features=LocalNetworkAccessChecks"];
  if (IS_HATCH_CHROME) {
    if (!existsSync(POLICY_FILE)) writeFileSync(POLICY_FILE, "hatch-webgl-allowed-domains-v1\nexample.com\n");
    const POLICY_SHA = createHash("sha256").update(readFileSync(POLICY_FILE)).digest("hex");
    chromeArgs.push(
      `--hatch-webgl-allowed-domains-file=${POLICY_FILE}`,
      `--hatch-webgl-allowed-domains-sha256=${POLICY_SHA}`);
  }
  const chrome = spawn(CHROME, [...chromeArgs, "about:blank"], { stdio: "ignore" });
  try {
    let version;
    for (let i = 0; i < 30; i++) { try { version = await (await fetch("http://127.0.0.1:9222/json/version")).json(); break; } catch { await sleep(500); } }
    if (!version) throw new Error("Chrome không mở được cổng debug 9222");
    const cdp = new Cdp(version.webSocketDebuggerUrl);
    await cdp.connect();
    const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
    const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
    cdp.sessionId = sessionId;

    cdp.on((msg) => {
      if (msg.method === "Runtime.consoleAPICalled" && (msg.params.type === "error" || msg.params.type === "warning"))
        consoleErrors.push(`[${msg.params.type}] ` + msg.params.args.map((a) => a.value ?? a.description ?? "").join(" ").slice(0, 300));
      if (msg.method === "Runtime.exceptionThrown")
        consoleErrors.push("[exception] " + JSON.stringify(msg.params.exceptionDetails).slice(0, 300));
      if (msg.method === "Network.loadingFailed")
        failedRequests.push(`${msg.params.errorText} — ${(msg.params.canceled ? "(cancelled) " : "")}${msg.params.type}`);
      if (msg.method === "Fetch.requestPaused") {
        const { requestId, request } = msg.params;
        const CORS = [
          { name: "Access-Control-Allow-Origin", value: "http://localhost:3000" },
          { name: "Access-Control-Allow-Methods", value: "GET, POST, PUT, PATCH, DELETE, OPTIONS" },
          { name: "Access-Control-Allow-Headers", value: "authorization, content-type, accept" },
          { name: "Access-Control-Max-Age", value: "86400" },
        ];
        if (request.method === "OPTIONS") {
          // Preflight CORS: phải trả CORS headers, nếu không fetch thật bị chặn ngay
          // cả khi fulfill OPTIONS bằng profile JSON (lỗi ở lần chạy đầu).
          cdp.send("Fetch.fulfillRequest", { requestId, responseCode: 200,
            responseHeaders: CORS, body: "" }).catch(() => {});
        } else if (request.url.includes("/auth/me")) {
          cdp.send("Fetch.fulfillRequest", { requestId, responseCode: 200,
            responseHeaders: [{ name: "Content-Type", value: "application/json" }, ...CORS],
            body: Buffer.from(JSON.stringify(FAKE_PROFILE)).toString("base64") }).catch(() => {});
        } else if (request.url.includes("/auth/refresh")) {
          cdp.send("Fetch.fulfillRequest", { requestId, responseCode: 401,
            responseHeaders: [{ name: "Content-Type", value: "application/json" }, ...CORS],
            body: Buffer.from(JSON.stringify({ message: "refresh không dùng trong test" })).toString("base64") }).catch(() => {});
        } else {
          cdp.send("Fetch.continueRequest", { requestId }).catch(() => {});
        }
      }
    });

    await cdp.send("Page.enable"); await cdp.send("Runtime.enable");
    await cdp.send("Network.enable");
    await cdp.send("Fetch.enable", { patterns: [{ urlPattern: "*://localhost:4000/*" }] });
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await cdp.send("Page.addScriptToEvaluateOnNewDocument", { source: SEED_JS });
    await cdp.send("Page.navigate", { url: BASE + "/dashboard" });

    // --- 1. Dashboard load (Tổng quan mặc định) ---
    try {
      await cdp.waitFor(`document.body.innerText.includes('Dashboard Tổng Quan') && !document.body.innerText.includes('Đang đồng bộ Workspace')`, 15000, "dashboard render");
      record("Dashboard load (đã đăng nhập giả, tab Tổng quan mặc định)", true, "sidebar + header render, không redirect về /dang-nhap");
    } catch (e) { record("Dashboard load (đã đăng nhập giả, tab Tổng quan mặc định)", false, e.message); }
    await sleep(1500);
    await cdp.shot("dashboard-click-overview.png");

    // --- 2. Chuyển tab POS ---
    let r = await cdp.clickByJs(`[...document.querySelectorAll('aside nav button')].find(b => b.textContent.includes('Quầy Bán Lẻ'))`, "tab POS");
    try { await cdp.waitFor(`document.querySelector('button[title="Thêm vào giỏ"]') !== null`, 8000, "lưới sản phẩm POS"); record("Chuyển tab Tổng quan → Quầy Bán Lẻ (POS)", r.ok, r.detail || r.reason); }
    catch (e) { record("Chuyển tab Tổng quan → Quầy Bán Lẻ (POS)", false, (r.reason || "") + " | " + e.message); }
    await sleep(800);

    // --- 3. POS: thêm 1 sản phẩm vào giỏ ---
    const cartBefore = await cdp.eval(`(() => { const t = document.body.innerText; const m = t.match(/Tổng Thanh Toán:\\s*([\\d.]+)\\s*₫/); return { empty: t.includes('Giỏ hàng đang trống'), total: m ? m[1] : null }; })()`);
    const firstProduct = await cdp.eval(`(() => { const b = document.querySelector('button[title="Thêm vào giỏ"]:not([disabled])'); if (!b) return null; const card = b.closest('div[class*="rounded-2xl"]'); return card ? card.innerText.split('\\n').slice(0, 6).join(' | ') : b.title; })()`);
    r = await cdp.clickByJs(`document.querySelector('button[title="Thêm vào giỏ"]:not([disabled])')`, "nút + Thêm vào giỏ");
    await sleep(1000);
    const cartAfter = await cdp.eval(`(() => { const t = document.body.innerText; const m = t.match(/Tổng Thanh Toán:\\s*([\\d.]+)\\s*₫/); const pay = t.match(/Thanh Toán & In Hóa Đơn \\(([\\d.]+) ₫\\)/); return { empty: t.includes('Giỏ hàng đang trống'), total: m ? m[1] : null, payBtn: pay ? pay[1] : null }; })()`);
    const posOk = r.ok && cartAfter.total && cartAfter.total !== "0" && !cartAfter.empty;
    record("POS: thêm 1 sản phẩm vào giỏ", posOk,
      `SP: ${(firstProduct || "?").slice(0, 90)} | giỏ trước: trống=${cartBefore.empty}, tổng=${cartBefore.total} | sau: trống=${cartAfter.empty}, tổng=${cartAfter.total} ₫` + (r.ok ? "" : " | " + r.reason));
    await cdp.shot("dashboard-click-pos.png");

    // --- 3b. TASK-016 (phương án A): bấm Thanh toán khi backend down ---
    // Backend cổng 4000 KHÔNG chạy: POST /orders lỗi kết nối, POS phải chặn
    // cứng — toast lỗi đỏ, giỏ giữ nguyên món + tổng tiền, không mở hóa đơn,
    // không sinh đơn giả, không trừ tồn local.
    const cartBeforeCheckout = await cdp.eval(`(() => { const t = document.body.innerText;
      const cart = t.match(/GIỎ HÀNG QUẦY \\((\\d+)\\)/); const total = t.match(/Tổng Thanh Toán:\\s*([\\d.]+)\\s*₫/);
      return { count: cart ? cart[1] : null, total: total ? total[1] : null }; })()`);
    r = await cdp.clickByJs(`[...document.querySelectorAll('button')].find(b => b.textContent.includes('Thanh Toán & In Hóa Đơn'))`, "nút Thanh Toán & In Hóa Đơn");
    await sleep(2500);
    const blocked = await cdp.eval(`(() => { const t = document.body.innerText;
      const cart = t.match(/GIỎ HÀNG QUẦY \\((\\d+)\\)/); const total = t.match(/Tổng Thanh Toán:\\s*([\\d.]+)\\s*₫/);
      return { toast: t.includes('Không thể kết nối') && t.includes('giỏ hàng vẫn giữ nguyên'),
        toastText: (t.match(/Không thể kết nối[^\\n]*/) || [null])[0],
        receiptOpen: t.includes('HÓA ĐƠN BÁN LẺ'),
        count: cart ? cart[1] : null, total: total ? total[1] : null }; })()`);
    const blockedOk = r.ok && blocked.toast && !blocked.receiptOpen
      && blocked.count === cartBeforeCheckout.count && blocked.total === cartBeforeCheckout.total;
    record("TASK-016 (A): backend down -> chặn checkout, giữ giỏ, không tạo đơn", blockedOk,
      `trước: ${cartBeforeCheckout.count} món, ${cartBeforeCheckout.total} ₫ | sau: ${blocked.count} món, ${blocked.total} ₫ | toast lỗi: ${blocked.toast ? "có" : "KHÔNG"} | hóa đơn mở: ${blocked.receiptOpen ? "CÓ (sai)" : "không"} | toast: ${(blocked.toastText || "?").slice(0, 140)}` + (r.ok ? "" : " | " + r.reason));
    await cdp.shot("dashboard-pos-blocked.png");
    await sleep(1000);

    // --- 4. Chuyển tab Đơn hàng + mở drawer chi tiết ---
    r = await cdp.clickByJs(`[...document.querySelectorAll('aside nav button')].find(b => b.textContent.includes('Đơn Hàng Đa Kênh'))`, "tab Đơn hàng");
    try { await cdp.waitFor(`document.querySelector('button[title="Xem chi tiết"]') !== null`, 8000, "bảng đơn hàng"); record("Chuyển tab POS → Đơn hàng", r.ok, r.detail || r.reason); }
    catch (e) { record("Chuyển tab POS → Đơn hàng", false, (r.reason || "") + " | " + e.message); }
    await sleep(800);
    const firstOrder = await cdp.eval(`(() => { const b = document.querySelector('button[title="Xem chi tiết"]'); if (!b) return null; const row = b.closest('tr'); return row ? row.innerText.split('\\n').slice(0, 4).join(' | ') : null; })()`);
    r = await cdp.clickByJs(`document.querySelector('button[title="Xem chi tiết"]')`, "nút Xem chi tiết đơn đầu tiên");
    try { await cdp.waitFor(`document.body.innerText.includes('Chi Tiết Đơn Hàng')`, 8000, "drawer chi tiết đơn"); record("Đơn hàng: mở drawer chi tiết 1 đơn", r.ok, `đơn: ${(firstOrder || "?").slice(0, 100)}` + (r.ok ? "" : " | " + r.reason)); }
    catch (e) { record("Đơn hàng: mở drawer chi tiết 1 đơn", false, (r.reason || "") + " | " + e.message); }
    // TASK-016 (A): đơn đầu tiên vẫn là đơn mock cũ ORD-SP-9821 — checkout bị
    // chặn ở bước 3b không được prepend đơn giả nào vào đầu danh sách.
    record("TASK-016 (A): không có đơn giả mới trong tab Đơn hàng", (firstOrder || "").includes("ORD-SP-9821"), `đơn đầu tiên vẫn là: ${(firstOrder || "?").slice(0, 80)}`);
    await sleep(600);
    await cdp.shot("dashboard-click-orders.png");
    // Đóng drawer
    const rc = await cdp.clickByJs(`[...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Đóng')`, "nút Đóng drawer");
    await sleep(500);
    record("Đóng drawer chi tiết đơn", rc.ok, rc.detail || rc.reason);

    // --- 5. Chuyển tab Tồn kho + mở modal chuyển kho ---
    r = await cdp.clickByJs(`[...document.querySelectorAll('aside nav button')].find(b => b.textContent.includes('Tồn Kho Đa Điểm'))`, "tab Tồn kho");
    try { await cdp.waitFor(`document.body.innerText.includes('Ma Trận Tồn Kho')`, 8000, "ma trận tồn kho"); record("Chuyển tab Đơn hàng → Tồn kho", r.ok, r.detail || r.reason); }
    catch (e) { record("Chuyển tab Đơn hàng → Tồn kho", false, (r.reason || "") + " | " + e.message); }
    await sleep(800);
    r = await cdp.clickByJs(`[...document.querySelectorAll('button')].find(b => b.textContent.includes('Tạo Phiếu Chuyển Kho'))`, "nút Tạo Phiếu Chuyển Kho");
    try { await cdp.waitFor(`document.body.innerText.includes('Tạo Phiếu Chuyển Kho Nội Bộ')`, 8000, "modal chuyển kho"); record("Tồn kho: mở modal chuyển kho", r.ok, r.detail || r.reason); }
    catch (e) { record("Tồn kho: mở modal chuyển kho", false, (r.reason || "") + " | " + e.message); }
    await sleep(600);
    await cdp.shot("dashboard-click-transfer.png");

    // --- 6. Quay lại Tổng quan ---
    r = await cdp.clickByJs(`[...document.querySelectorAll('aside nav button')].find(b => b.textContent.includes('Dashboard Tổng Quan'))`, "tab Tổng quan");
    await sleep(800);
    record("Quay lại tab Tổng quan", r.ok, r.detail || r.reason);

    console.log("\n--- Console errors/warnings (" + consoleErrors.length + ") ---");
    [...new Set(consoleErrors)].forEach((e) => console.log(" • " + e));
    console.log("\n--- Failed network requests (" + failedRequests.length + ") ---");
    [...new Set(failedRequests)].forEach((e) => console.log(" • " + e));
    const passed = results.filter((x) => x.ok).length;
    console.log(`\nTỔNG: ${passed}/${results.length} tương tác PASS`);
    writeFileSync("/tmp/shot/results.json", JSON.stringify({ results, consoleErrors: [...new Set(consoleErrors)], failedRequests: [...new Set(failedRequests)] }, null, 2));
    await cdp.send("Target.closeTarget", { targetId });
  } finally {
    chrome.kill("SIGKILL");
  }
}

main().catch((e) => { console.error("SCRIPT LỖI:", e.message); process.exit(1); });
