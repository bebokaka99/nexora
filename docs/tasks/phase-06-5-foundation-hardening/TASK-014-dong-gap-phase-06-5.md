# TASK-014: Đóng Gap Còn Lại Của Phase 06.5 (Gỡ Hết Fallback In-Memory, Demo Tenant, Secret Yếu, Click-Through Dashboard)

- **Mã nhiệm vụ**: `TASK-014`
- **Giai đoạn**: `Phase 06.5 — Foundation Hardening (Củng cố nền tảng)`
- **Epic**: `EPIC-06-5-D`
- **Trạng thái**: `DONE một phần` (hoàn thành ngày 16/11/2026 trong VM; phần cần môi trường thật chưa kiểm chứng được — xem mục 6)
- **Người thực hiện**: Backend + Frontend Engineer
- **Độ ưu tiên**: Cao nhất (P0)

## 1. Mục đích công việc

Theo `docs/tasks/PHASES.md`, Phase 07 Unified Inbox **chỉ bắt đầu khi đạt toàn bộ Definition of Done của Phase 06.5 (6 điểm)**. Sau TASK-009..013, DoD chưa đủ: migration chưa chạy trên Postgres thật, `docker compose up` chưa chạy, chưa có luồng e2e thật — những việc này cần Docker/Postgres/Redis/API key sàn mà VM hiện không có, nên **không nhảy sang Phase 07 trong lần này**.

Task này đóng các gap còn lại của Phase 06.5 **mà làm được trong VM**, để tiến gần DoD nhất có thể. Các gap đã liệt kê ở báo cáo Phase 06.5 ngày 16/11/2026 (nhánh `feat/fe-vibe-and-docs-priority`, commit `97ee3cf`):

1. Fallback in-memory còn lại ở store, warehouse, product, inventory, order, tenant (đếm bằng grep `inMemory|InMemory|memory` trong `backend/src/modules/<tên>`: store 10, warehouse 10, product 18, inventory 22, order 4, tenant 1 — tổng 65 chỗ; auth và channel đã gỡ xong ở TASK-009, chỉ còn 1 dòng comment nhắc việc đã xóa ở mỗi module).
2. `tenant-demo-giadung` còn lại: 6 chỗ trong `backend/src/modules/channel/channel.controller.ts` (mẫu `tenantId || 'tenant-demo-giadung'`) và 3 chỗ trong `frontend/lib/services/channel-service.ts` (dữ liệu mock fallback khi API lỗi).
3. Default JWT secret yếu trong `docker-compose.yml` (`JWT_SECRET: ${JWT_SECRET:-change-me-dev-only-jwt-secret}`, tương tự cho refresh) — cố tình giữ ở TASK-010/011 để compose không fail khi chưa có `.env`, phải xóa trước khi deploy thật.
4. Chưa click-through từng tương tác dashboard sau khi tách ở TASK-012 (thanh toán POS, chuyển kho, mở drawer đơn) — chỉ kiểm chứng build + render + ảnh.
5. `npm audit` chưa chạy được (lần trước registry chặn `403 policy_denied`).
6. Ba ảnh thật chưa dùng (`pos-counter.jpg`, `store-shelf.jpg`, `packing-parcel.jpg` trong `frontend/public/images/`) và logo gốc vẫn mờ trên nền sáng (cần biến thể logo tối).

> **Căn cứ kiểm chứng**: Báo cáo Phase 06.5 ngày 16/11/2026, 6 commit local trên nhánh `feat/fe-vibe-and-docs-priority` (`48b4153`, `6e3febc`, `88eec59`, `02838dd`, `15c7e90`, `97ee3cf`), working tree sạch, chưa push (GitHub App bị 403 khi tạo branch — PR tạm gác).

## 2. Phạm vi thay đổi (Scope)
- **Tệp mã nguồn bị tác động**:
  - `backend/src/modules/store/store.service.ts`, `warehouse/warehouse.service.ts`, `product/product.service.ts`, `inventory/inventory.service.ts`, `order/order.service.ts`, `tenant/tenant.service.ts` (gỡ fallback in-memory, chỉ giữ nhánh Prisma; lỗi DB thì throw thay vì rơi về dữ liệu giả).
  - `backend/src/modules/channel/channel.controller.ts` (bỏ fallback tenant demo; thiếu tenant thì trả 401 thay vì dùng tenant demo).
  - `frontend/lib/services/channel-service.ts` (bỏ dữ liệu mock fallback khi API lỗi; lỗi thì throw để UI hiện trạng thái lỗi thật).
  - `docker-compose.yml`, `.env.example` (JWT secret bắt buộc qua `.env`, không còn default yếu).
  - `frontend/app/page.tsx` (dùng 3 ảnh chưa dùng cho section "Dành cho ai" nếu còn thời gian).
  - File task này (`docs/tasks/phase-06-5-foundation-hardening/TASK-014-dong-gap-phase-06-5.md`).
- **Không thay đổi**: schema Prisma, migration 0001/0002, API contract (tên endpoint, DTO), logic nghiệp vụ trong nhánh Prisma (chỉ xóa nhánh else in-memory).
- **Không làm trong task này**: chạy migration trên Postgres thật, `docker compose up`, OAuth/e2e sàn thật (cần môi trường thật + API key — xem mục 4), nhảy sang Phase 07.

## 3. Các bước thực hiện chi tiết
1. Bước 1 — Gỡ fallback in-memory: với mỗi service store/warehouse/product/inventory/order/tenant, xóa mảng `inMemory*` và toàn bộ nhánh else dùng nó; xóa hàm `isPrismaReady()` nếu không còn dùng; giữ nguyên nhánh Prisma và message lỗi tiếng Việt hiện có. Tenant: `getProfile` không tìm thấy tenant thì throw `NotFoundException` thay vì trả profile demo hardcode; `getUsage` đếm thật từ DB thay vì trả số cố định.
2. Bước 2 — Gỡ demo tenant: controller channel dùng `tenantId` từ `@CurrentTenant()` trực tiếp, thiếu thì throw `UnauthorizedException`; frontend `channel-service.ts` xóa mảng mock fallback, `getChannels()` lỗi thì throw.
3. Bước 3 — Secret bắt buộc: `docker-compose.yml` đổi `JWT_SECRET: ${JWT_SECRET:?JWT_SECRET chưa đặt trong .env}` (tương tự refresh); cập nhật `.env.example` và ghi chú trong `infrastructure/README.md` nếu có nhắc default cũ.
4. Bước 4 — Click-through dashboard: chạy frontend port 3000, dùng headless Chrome click thử: chuyển tab POS/Đơn hàng/Tồn kho, thêm sản phẩm vào giỏ POS, mở drawer chi tiết đơn, mở modal chuyển kho; chụp ảnh `screenshots/dashboard-click-pos.png`, `screenshots/dashboard-click-orders.png`.
5. Bước 5 — Chạy lại `npm audit` cho frontend và backend; nếu registry vẫn chặn thì ghi rõ, nếu chạy được thì liệt kê CVE còn lại (đặc biệt Next).
6. Bước 6 — Nếu còn thời gian: dùng 3 ảnh chưa dùng cho section "Dành cho ai" trên landing; ghi rõ logo mờ vẫn chưa sửa được vì cần biến thể logo tối.

## 4. Tiêu chí nghiệm thu (Acceptance Criteria)
- [x] Grep `inMemory|inMemory*` trong `backend/src/modules/store|warehouse|product|inventory|order|tenant` còn 0 (trừ comment lịch sử nếu có, phải ghi rõ).
  - Trước/sau: store 10→0, warehouse 10→0, product 18→0, inventory 22→0, order 4→0, tenant 1→0 — tổng 65→0, không còn comment lịch sử nào nhắc in-memory trong 6 file (kiểm chứng lại ngày 16/11/2026). Commit `5ffdcb2`.
- [x] Grep `tenant-demo-giadung` trong `backend/src` và `frontend/lib|frontend/app|frontend/components` còn 0.
  - Controller channel dùng `requireTenantId()` throw `UnauthorizedException` khi thiếu tenant; `frontend/lib/services/channel-service.ts` bỏ mảng mock fallback, `getChannels()` lỗi thì throw. `tenant-001-gia-dung-hien-dai` cũng còn 0. Commit `660d390`.
- [x] Grep chuỗi secret yếu cũ trong `docker-compose.yml` còn 0; `docker compose config` báo lỗi rõ ràng khi thiếu `JWT_SECRET` trong `.env` (hoặc ghi rõ chưa kiểm chứng được vì không có Docker).
  - `docker-compose.yml` dùng `${JWT_SECRET:?JWT_SECRET chưa đặt trong .env}` (tương tự refresh); `.env.example` và `infrastructure/README.md` cập nhật theo. Chưa kiểm chứng bằng `docker compose config` vì VM không có Docker (`docker: command not found`). Commit `8f05fa0`.
- [x] `npm run build` backend PASS và `npm run build` frontend PASS sau khi gỡ fallback.
  - Backend build PASS sau cả 3 commit backend; frontend build PASS 15 trang sau click-through và sau khi thêm ảnh.
- [x] Click-through dashboard: ghi lại từng tương tác PASS/FAIL kèm ảnh chụp; không còn tương tác nào chưa thử trong danh sách bước 4.
  - 9/9 PASS (xem mục 5). Commit `0e79799`.
- [ ] `npm audit` đã thử lại cho cả 2 phía và có kết quả ghi rõ (PASS / vẫn bị chặn / danh sách CVE).
  - Đã thử lại cả 2 phía ngày 16/11/2026: **vẫn bị chặn** — registry trả `403 Forbidden - POST /-/npm/v1/security/audits/quick - policy_denied` (`zz_managed_internal_spaces_package_registries`), giống lần trước. Không liệt kê được CVE nào. Next đã ở 15.1.9 từ TASK-012 (CVE-2025-66478 đã vá ở tầng version) nhưng chưa xác nhận độc lập bằng audit. Cần chạy lại ở môi trường registry mở.
- [x] Mỗi việc xong có commit riêng trên nhánh `feat/fe-vibe-and-docs-priority`, message tiếng Việt rõ ràng; **không push, không tạo PR** (PR tạm gác theo quyết định ngày 16/11/2026).
  - 5 commit TASK-014: `5ffdcb2`, `660d390`, `8f05fa0`, `0e79799`, `3d7c8a3` (+ commit cập nhật file task này). Working tree sạch, không push.

## 5. Kết quả thực hiện
Hoàn thành ngày 16/11/2026, nhánh `feat/fe-vibe-and-docs-priority`, 5 commit + 1 commit cập nhật file task này, chỉ local — chưa push, chưa tạo PR (PR tạm gác).

- **Gap 1 — Gỡ fallback in-memory (commit `5ffdcb2`)**: xóa mảng `inMemory*` và nhánh else ở 6 service (store/warehouse/product/inventory/order/tenant), xóa `isPrismaReady()`; `tenant.getProfile()` không thấy tenant thì throw `NotFoundException`, `getUsage()` đếm thật từ DB. Trước/sau 65→0 chỗ. `npm run build` backend PASS.
- **Gap 2 — Gỡ demo tenant (commit `660d390`)**: controller channel dùng `requireTenantId()` (thiếu thì 401); FE `channel-service.ts` bỏ mock fallback. Grep `tenant-demo-giadung` còn 0.
- **Gap 3 — Secret bắt buộc (commit `8f05fa0`)**: compose dùng `${JWT_SECRET:?...}` / `${JWT_REFRESH_SECRET:?...}`; `.env.example` + `infrastructure/README.md` cập nhật. Chưa kiểm chứng `docker compose config` (không có Docker).
- **Gap 4 — Click-through dashboard (commit `0e79799`)**: script mới `frontend/scripts/clickthrough-dashboard.mjs` (CDP thuần Node, seed token + chặn `/auth/me` trong trình duyệt chụp). **9/9 PASS**, tái lập 2 lần: load Tổng quan, chuyển tab POS, thêm nồi chiên Tefal vào giỏ (giỏ 0→1 món, tổng 2.490.000 ₫), chuyển tab Đơn hàng, mở drawer đơn ORD-SP-9821, đóng drawer, chuyển tab Tồn kho, mở modal chuyển kho, quay lại Tổng quan. Ảnh: `screenshots/dashboard-click-pos.png`, `dashboard-click-orders.png` (+ overview/transfer). Lỗi duy nhất trong console là backend cổng 4000 down (`ERR_CONNECTION_REFUSED` tới `/stores`, `/warehouses`) — app xử lý graceful, không có exception JS. Chưa click-through các tab Kênh/Sản phẩm/Hộp thư/Cửa hàng và chưa bấm thanh toán POS tới cùng.
- **Gap 5 — npm audit**: cả 2 phía đều bị chặn `403 policy_denied` như lần trước, không có số liệu CVE. Không commit.
- **Gap 6 — 3 ảnh còn lại (commit `3d7c8a3`)**: `frontend/app/page.tsx` thêm `packing-parcel.jpg` (Chủ Shop Online), `pos-counter.jpg` (Cửa Hàng Bán Lẻ), `store-shelf.jpg` (Chuỗi Cửa Hàng) vào section "Dành cho ai", `next/image` + alt tiếng Việt. Build PASS, cả 3 ảnh `loaded: true`. Ảnh: `screenshots/home-light-v3.png`. Logo gốc **vẫn mờ** trên nền sáng, chưa sửa — cần biến thể logo tối.

**Lưu ý ngoài phạm vi task (phát hiện khi làm)**: `order.service.ts` vẫn có heuristic kho mặc định dùng ID hardcode (`store-002-binh-thanh` → `wh-002-binh-thanh`, mặc định `wh-001-q1`/`wh-003-central`) khi DTO không có `warehouseId` — các ID này không tồn tại trên DB thật nên đơn POS tạo không kèm kho sẽ lỗi FK; cần xử lý ở task sau. `SEED_ADMIN_PASSWORD=change-me-dev-only-...` vẫn còn trong `.env.example` (dòng 56) — là placeholder mật khẩu seed, không phải JWT nên không đụng trong task này; nên đổi trước khi deploy thật.

## 6. DoD Phase 06.5 sau TASK-014 (đánh giá lại)
**Kết quả: 2/6 điểm đạt hoàn toàn, 1 điểm đạt một phần (phía code), 3 điểm chưa đạt.** Vì vậy **vẫn chưa vào được Phase 07** — đúng như dự kiến khi giao task này.

| # | Điểm DoD Phase 06.5 | Trạng thái sau TASK-014 |
|---|---|---|
| 1 | Migration chạy được trên DB trống; `prisma migrate status` không còn migration chờ | ❌ Chưa đạt — migration 0001+0002 tồn tại, `prisma validate` PASS, nhưng chưa chạy trên Postgres thật (không có Postgres/Docker trên VM) |
| 2 | Backend chạy với Postgres thật, không còn fallback in-memory ở module lõi; fail-fast khi `DATABASE_URL` sai/thiếu | ⚠️ Đạt một phần (phía code) — in-memory còn 0 trong toàn bộ module lõi (auth/channel từ TASK-009 + 6 module từ TASK-014); fail-fast đã có; nhưng chưa chạy thử trên Postgres thật |
| 3 | CI xanh; `docker compose up` trên máy sạch đưa hệ thống lên | ❌ Chưa đạt — file CI + compose tồn tại nhưng CI chưa từng chạy (không có PR) và compose chưa từng chạy (không có Docker) |
| 4 | Dashboard đã tách (file lớn nhất < 500 dòng) và dark mode đúng | ✅ Đạt — `page.tsx` 251 dòng, file lớn nhất 292 dòng; dark mode đúng; click-through 9/9 PASS sau tách |
| 5 | Demo hardcode đã gỡ khỏi code + login; Next đã nâng cấp khỏi CVE-2025-66478 | ✅ Đạt (với lưu ý) — demo gỡ hết backend + FE (TASK-011 + TASK-014); Next 15.1.9; nhưng `npm audit` không chạy được để xác nhận độc lập (registry chặn 403) |
| 6 | Ít nhất một luồng e2e thật (đổi tồn → sàn cập nhật, hoặc đơn mới trên sàn → về NEXORA) | ❌ Chưa đạt — cần API key sandbox Shopee/TikTok + Postgres/Redis thật |

**Cần gì từ user/môi trường thật để đạt đủ 6/6**: (1) sửa quyền GitHub App (Contents: write) hoặc tự push nhánh để mở PR và cho CI chạy lần đầu; (2) chạy `docker compose up` trên máy có Docker để áp migration, chạy seed, kiểm chứng login/CRUD thật; (3) cung cấp app/key sandbox Shopee Open Platform và TikTok Shop Open API để làm e2e thật cho TASK-013. Khi 3 việc này xong mới bắt đầu Phase 07.
