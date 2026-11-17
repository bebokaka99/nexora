// TASK-018 — Click-through 4 tab dashboard còn lại (Kênh / Sản phẩm / Hộp thư /
// Cửa hàng) + hồi quy nút thanh toán POS sau TASK-016/017.
// Cùng mẫu CDP với frontend/scripts/clickthrough-dashboard.mjs (TASK-014/016):
// headless Chrome + CDP thuần Node 24, không cần puppeteer.
// Cách chạy: (1) cd frontend && npm run build && npm run start -- -p 3000
//            (2) node frontend/scripts/clickthrough-tabs-018.mjs
// Backend cổng 4000 KHÔNG chạy: script chặn request /auth/me qua Fetch domain và
// trả profile giả, đồng thời seed token + user/tenant cache vào localStorage TRƯỚC khi
// page load — chỉ là dữ liệu giả trong trình duyệt chụp, KHÔNG sửa code FE.
// Lưu ý: ProductsTab không có ô tìm/lọc và không có modal chi tiết trong code hiện
// tại — tab này chỉ kiểm chứng render 12 thẻ + ảnh thật load được, ghi rõ giới hạn.
// StoresTab gọi API thật, không fallback mock — backend down thì 0 cửa hàng, tab vẫn
// phải render graceful; nút "Mở POS" trên thẻ cửa hàng không thử được khi 0 cửa hàng,
// thay bằng thử đổi điểm bán ở tab POS (Chi Nhánh 1 → Chi Nhánh 2).
// Kết quả: screenshots/dashboard-click-{channels,products,chat,stores}.png,
// dashboard-pos-blocked.png (hồi quy) + in bảng PASS/FAIL ra stdout.
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";

const BASE = "http://localhost:3000";
const SHOT_DIR = (process.env.CLICK_SHOT_DIR || new URL("../../screenshots/", import.meta.url).pathname).replace(/\/?$/, "/");
const PLAYWRIGHT_CHROME = `${process.env.HOME}/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome`;
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
  const POLICY_FILE = process.env.HATCH_WEBGL_POLICY_FILE || "/tmp/shot/webgl-domains.txt";
  const chromeArgs = ["--headless=new", "--remote-debugging-port=9222", "--no-sandbox",
    "--disable-gpu", "--hide-scrollbars", "--user-data-dir=/tmp/shot-profile-018",
    "--window-size=1440,900",
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

    // --- 0. Dashboard load ---
    try {
      await cdp.waitFor(`document.body.innerText.includes('Dashboard Tổng Quan') && !document.body.innerText.includes('Đang đồng bộ Workspace')`, 15000, "dashboard render");
      record("Dashboard load (đã đăng nhập giả, tab Tổng quan mặc định)", true, "sidebar + header render, không redirect về /dang-nhap");
    } catch (e) { record("Dashboard load (đã đăng nhập giả, tab Tổng quan mặc định)", false, e.message); }
    await sleep(1500);

    const goTab = async (label, waitText) => {
      const r = await cdp.clickByJs(`[...document.querySelectorAll('aside nav button')].find(b => b.textContent.includes(${JSON.stringify(label)}))`, `tab ${label}`);
      try { await cdp.waitFor(`document.body.innerText.includes(${JSON.stringify(waitText)})`, 8000, waitText); return { ok: r.ok, detail: r.detail || r.reason }; }
      catch (e) { return { ok: false, detail: (r.reason || "") + " | " + e.message }; }
    };

    // ================= TAB 5 — KÊNH =================
    let t = await goTab("Kết Nối Kênh Sàn", "Trung Tâm Kết Nối Kênh Bán Hàng");
    record("Kênh: mở tab Kết Nối Kênh Sàn", t.ok, t.detail);
    await sleep(800);
    // 1) Bấm "Đồng bộ tồn kho ngay" — mock 1200ms, toast thành công + "Vừa xong".
    let r = await cdp.clickByJs(`[...document.querySelectorAll('button')].find(b => b.textContent.includes('Đồng bộ tồn kho ngay'))`, "nút Đồng bộ tồn kho ngay");
    let syncOk = false, syncDetail = "";
    try {
      await cdp.waitFor(`document.body.innerText.includes('Đã đồng bộ thành công') && document.body.innerText.includes('Vừa xong')`, 6000, "toast đồng bộ + Vừa xong");
      syncOk = r.ok;
      syncDetail = "toast 'Đã đồng bộ thành công...' + lastSyncedAt 'Vừa xong'";
    } catch (e) { syncDetail = (r.reason || "") + " | " + e.message; }
    record("Kênh: bấm 'Đồng bộ tồn kho ngay' (mock)", syncOk, syncDetail);
    await sleep(1500);
    // 2) Bấm "Đồng bộ lại" trên thẻ kênh đầu tiên.
    r = await cdp.clickByJs(`[...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Đồng bộ lại')`, "nút Đồng bộ lại (thẻ kênh đầu)");
    let resyncOk = false, resyncDetail = "";
    try {
      await cdp.waitFor(`document.body.innerText.includes('Đã đồng bộ thành công')`, 6000, "toast đồng bộ lần 2");
      resyncOk = r.ok;
      resyncDetail = "toast 'Đã đồng bộ thành công...' lần 2";
    } catch (e) { resyncDetail = (r.reason || "") + " | " + e.message; }
    record("Kênh: bấm 'Đồng bộ lại' trên thẻ kênh đầu tiên", resyncOk, resyncDetail);
    await sleep(800);
    await cdp.shot("dashboard-click-channels.png");

    // ================= TAB SẢN PHẨM =================
    t = await goTab("Danh Mục Sản Phẩm", "Danh Mục Sản Phẩm Đồ Gia Dụng");
    record("Sản phẩm: mở tab Danh Mục Sản Phẩm", t.ok, t.detail);
    await sleep(1200); // chờ next/image tải xong
    const prod = await cdp.eval(`(() => {
      const imgs = [...document.querySelectorAll('img')].filter(i => (i.alt || '').startsWith('Ảnh sản phẩm'));
      const loaded = imgs.filter(i => i.complete && i.naturalWidth > 0).length;
      const cards = [...document.querySelectorAll('h3')].filter(h => h.textContent.trim().length > 3).length;
      return { imgTotal: imgs.length, imgLoaded: loaded, h3Count: cards,
        sample: imgs.slice(0, 3).map(i => i.alt).join(' | ') };
    })()`);
    record("Sản phẩm: render đủ 12 thẻ sản phẩm", prod.imgTotal === 12,
      `ảnh sản phẩm: ${prod.imgTotal}/12 | mẫu: ${(prod.sample || "?").slice(0, 120)}`);
    record("Sản phẩm: toàn bộ ảnh thật load được", prod.imgLoaded === 12 && prod.imgTotal === 12,
      `ảnh load được: ${prod.imgLoaded}/${prod.imgTotal} (naturalWidth > 0)`);
    await cdp.shot("dashboard-click-products.png");

    // ================= TAB HỘP THƯ =================
    t = await goTab("Hộp Thư Hội Thoại", "Hội Thoại Mới Nhất");
    record("Hộp thư: mở tab Hộp Thư Hội Thoại", t.ok, t.detail);
    await sleep(800);
    // 1) Chọn hội thoại thứ 2 (Lê Thúy Hằng) — header khung chat đổi tên.
    const conv2 = await cdp.eval(`(() => { const items = [...document.querySelectorAll('div')].filter(d => d.onclick !== null); return null; })()`);
    void conv2;
    r = await cdp.clickByJs(`[...document.querySelectorAll('div[class*="cursor-pointer"]')].find(d => d.textContent.includes('Lê Thúy Hằng'))`, "hội thoại Lê Thúy Hằng");
    let convOk = false, convDetail = "";
    try {
      await cdp.waitFor(`[...document.querySelectorAll('h3')].some(h => h.textContent.trim() === 'Lê Thúy Hằng')`, 6000, "header chat đổi tên");
      convOk = r.ok; convDetail = "header khung chat đổi thành 'Lê Thúy Hằng'";
    } catch (e) { convDetail = (r.reason || "") + " | " + e.message; }
    record("Hộp thư: chọn hội thoại thứ 2 (Lê Thúy Hằng)", convOk, convDetail);
    await sleep(500);
    // 2) Gõ tin nhắn + bấm Gửi — toast thành công, ô nhập được xóa.
    const typed = await cdp.eval(`(() => {
      const input = document.querySelector('input[placeholder*="Nhập tin nhắn"]');
      if (!input) return false;
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(input, 'Xin chào, shop còn nồi chiên Tefal không ạ?');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      return input.value.includes('nồi chiên');
    })()`);
    r = await cdp.clickByJs(`[...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Gửi')`, "nút Gửi tin nhắn");
    let sendOk = false, sendDetail = "";
    try {
      await cdp.waitFor(`document.body.innerText.includes('Đã gửi tin nhắn phản hồi thành công!')`, 6000, "toast gửi tin nhắn");
      const cleared = await cdp.eval(`(() => { const input = document.querySelector('input[placeholder*="Nhập tin nhắn"]'); return input ? input.value === '' : false; })()`);
      sendOk = r.ok && typed && cleared;
      sendDetail = `gõ được tin nhắn: ${typed ? "có" : "KHÔNG"} | ô nhập sau khi gửi: ${cleared ? "đã xóa" : "CHƯA xóa"}`;
    } catch (e) { sendDetail = (r.reason || "") + " | " + e.message; }
    record("Hộp thư: gõ + gửi tin nhắn trả lời khách", sendOk, sendDetail);
    await sleep(800);
    await cdp.shot("dashboard-click-chat.png");

    // ================= TAB CỬA HÀNG =================
    t = await goTab("Hệ Thống Cửa Hàng", "Hệ Thống");
    record("Cửa hàng: mở tab Hệ Thống Cửa Hàng", t.ok, t.detail);
    await sleep(1200);
    const storeCount = await cdp.eval(`(() => { const m = document.body.innerText.match(/Hệ Thống (\\d+) Cửa Hàng & Điểm Bán Vật Lý/); return m ? m[1] : null; })()`);
    record("Cửa hàng: render graceful khi backend down (0 cửa hàng, không crash)", storeCount === "0",
      `tiêu đề tab: 'Hệ Thống ${storeCount} Cửa Hàng' (backend 4000 down, API /stores lỗi kết nối — kỳ vọng 0) | lưu ý: badge sidebar + tiêu đề header vẫn hiện 2 do fallback 'storesCount || 2' trong code`);
    // 1) Bấm "Làm Mới" — loading xong, không exception.
    r = await cdp.clickByJs(`[...document.querySelectorAll('button')].find(b => b.textContent.includes('Làm Mới'))`, "nút Làm Mới");
    let refreshOk = false, refreshDetail = "";
    try {
      await cdp.waitFor(`[...document.querySelectorAll('button')].some(b => b.textContent.includes('Làm Mới') && !b.disabled)`, 8000, "nút Làm Mới hết loading");
      refreshOk = r.ok; refreshDetail = "fetch lại xong, nút hết loading, không exception";
    } catch (e) { refreshDetail = (r.reason || "") + " | " + e.message; }
    record("Cửa hàng: bấm 'Làm Mới' tải lại danh sách", refreshOk, refreshDetail);
    await sleep(500);
    // 2) Mở modal "Thêm Chi Nhánh Mới" rồi đóng bằng "Hủy Bỏ".
    r = await cdp.clickByJs(`[...document.querySelectorAll('button')].find(b => b.textContent.includes('Thêm Chi Nhánh Mới'))`, "nút Thêm Chi Nhánh Mới");
    let modalOk = false, modalDetail = "";
    try {
      await cdp.waitFor(`document.body.innerText.includes('Thêm Chi Nhánh Cửa Hàng Mới')`, 6000, "modal thêm chi nhánh");
      const rc = await cdp.clickByJs(`[...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Hủy Bỏ')`, "nút Hủy Bỏ trong modal");
      await sleep(700);
      const closed = await cdp.eval(`!document.body.innerText.includes('Thêm Chi Nhánh Cửa Hàng Mới')`);
      modalOk = r.ok && rc.ok && closed;
      modalDetail = `modal mở: có | đóng bằng Hủy Bỏ: ${rc.ok ? "có" : "KHÔNG"} | modal đã đóng: ${closed ? "có" : "KHÔNG"}`;
    } catch (e) { modalDetail = (r.reason || "") + " | " + e.message; }
    record("Cửa hàng: mở modal thêm chi nhánh rồi đóng bằng 'Hủy Bỏ'", modalOk, modalDetail);
    await sleep(500);
    await cdp.shot("dashboard-click-stores.png");

    // ================= HỒI QUY POS (TASK-016 phương án A) =================
    t = await goTab("Quầy Bán Lẻ", "Quầy Thu Ngân Bán Lẻ");
    record("Hồi quy POS: mở tab Quầy Bán Lẻ", t.ok, t.detail);
    await sleep(800);
    // Đổi điểm bán Chi Nhánh 1 -> Chi Nhánh 2 (thay cho nút "Mở POS" trên thẻ
    // cửa hàng — không thử được vì StoresTab 0 cửa hàng khi backend down).
    const storeBefore = await cdp.eval(`(() => { const b = [...document.querySelectorAll('button')].find(x => x.textContent.includes('Chi Nhánh 2')); return b ? b.className.includes('emerald') || b.className.includes('bg-emerald') : null; })()`);
    r = await cdp.clickByJs(`[...document.querySelectorAll('button')].find(b => b.textContent.includes('Chi Nhánh 2 (Bình Thạnh)'))`, "nút Chi Nhánh 2 (Bình Thạnh)");
    await sleep(800);
    const storeAfter = await cdp.eval(`(() => { const b2 = [...document.querySelectorAll('button')].find(x => x.textContent.includes('Chi Nhánh 2')); const b1 = [...document.querySelectorAll('button')].find(x => x.textContent.includes('Chi Nhánh 1')); return { b2Active: b2 ? (b2.className.includes('emerald') || b2.className.includes('bg-emerald')) : null, b1Active: b1 ? (b1.className.includes('emerald') || b1.className.includes('bg-emerald')) : null }; })()`);
    record("Cửa hàng (POS): đổi điểm bán Chi Nhánh 1 → Chi Nhánh 2", r.ok && storeAfter.b2Active === true,
      `trước: CN2 active=${storeBefore} | sau: CN2 active=${storeAfter.b2Active}, CN1 active=${storeAfter.b1Active}` + (r.ok ? "" : " | " + r.reason));
    // Thêm 1 sản phẩm vào giỏ rồi bấm thanh toán khi backend down.
    r = await cdp.clickByJs(`document.querySelector('button[title="Thêm vào giỏ"]:not([disabled])')`, "nút + Thêm vào giỏ");
    await sleep(1000);
    const cartBeforeCheckout = await cdp.eval(`(() => { const t = document.body.innerText;
      const cart = t.match(/GIỎ HÀNG QUẦY \\((\\d+)\\)/); const total = t.match(/Tổng Thanh Toán:\\s*([\\d.]+)\\s*₫/);
      return { count: cart ? cart[1] : null, total: total ? total[1] : null }; })()`);
    r = await cdp.clickByJs(`[...document.querySelectorAll('button')].find(b => b.textContent.includes('Thanh Toán & In Hóa Đơn'))`, "nút Thanh Toán & In Hóa Đơn");
    await sleep(2500);
    const blocked = await cdp.eval(`(() => { const t = document.body.innerText;
      const cart = t.match(/GIỎ HÀNG QUẦY \\((\\d+)\\)/); const total = t.match(/Tổng Thanh Toán:\\s*([\\d.]+)\\s*₫/);
      return { toast: t.includes('Không thể kết nối') && t.includes('giỏ hàng vẫn giữ nguyên'),
        receiptOpen: t.includes('HÓA ĐƠN BÁN LẺ'),
        count: cart ? cart[1] : null, total: total ? total[1] : null }; })()`);
    const blockedOk = r.ok && blocked.toast && !blocked.receiptOpen
      && blocked.count === cartBeforeCheckout.count && blocked.total === cartBeforeCheckout.total;
    record("Hồi quy POS (TASK-016 A): backend down -> chặn checkout, giữ giỏ", blockedOk,
      `trước: ${cartBeforeCheckout.count} món, ${cartBeforeCheckout.total} ₫ | sau: ${blocked.count} món, ${blocked.total} ₫ | toast lỗi: ${blocked.toast ? "có" : "KHÔNG"} | hóa đơn mở: ${blocked.receiptOpen ? "CÓ (sai)" : "không"}` + (r.ok ? "" : " | " + r.reason));
    await cdp.shot("dashboard-pos-blocked.png");
    await sleep(1000);

    // --- Quay lại Tổng quan ---
    r = await cdp.clickByJs(`[...document.querySelectorAll('aside nav button')].find(b => b.textContent.includes('Dashboard Tổng Quan'))`, "tab Tổng quan");
    await sleep(800);
    record("Quay lại tab Tổng quan", r.ok, r.detail || r.reason);

    console.log("\n--- Console errors/warnings (" + consoleErrors.length + ") ---");
    [...new Set(consoleErrors)].forEach((e) => console.log(" • " + e));
    console.log("\n--- Failed network requests (" + failedRequests.length + ") ---");
    [...new Set(failedRequests)].forEach((e) => console.log(" • " + e));
    const passed = results.filter((x) => x.ok).length;
    console.log(`\nTỔNG TASK-018: ${passed}/${results.length} tương tác PASS`);
    writeFileSync("/tmp/shot/results-018.json", JSON.stringify({ results, consoleErrors: [...new Set(consoleErrors)], failedRequests: [...new Set(failedRequests)] }, null, 2));
    await cdp.send("Target.closeTarget", { targetId });
  } finally {
    chrome.kill("SIGKILL");
  }
}

main().catch((e) => { console.error("SCRIPT LỖI:", e.message); process.exit(1); });
