# TASK-014: Đóng Gap Còn Lại Của Phase 06.5 (Gỡ Hết Fallback In-Memory, Demo Tenant, Secret Yếu, Click-Through Dashboard)

- **Mã nhiệm vụ**: `TASK-014`
- **Giai đoạn**: `Phase 06.5 — Foundation Hardening (Củng cố nền tảng)`
- **Epic**: `EPIC-06-5-D`
- **Trạng thái**: `Đang thực hiện` (bắt đầu ngày 16/11/2026)
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
- [ ] Grep `inMemory|inMemory*` trong `backend/src/modules/store|warehouse|product|inventory|order|tenant` còn 0 (trừ comment lịch sử nếu có, phải ghi rõ).
- [ ] Grep `tenant-demo-giadung` trong `backend/src` và `frontend/lib|frontend/app|frontend/components` còn 0.
- [ ] Grep chuỗi secret yếu cũ trong `docker-compose.yml` còn 0; `docker compose config` báo lỗi rõ ràng khi thiếu `JWT_SECRET` trong `.env` (hoặc ghi rõ chưa kiểm chứng được vì không có Docker).
- [ ] `npm run build` backend PASS và `npm run build` frontend PASS sau khi gỡ fallback.
- [ ] Click-through dashboard: ghi lại từng tương tác PASS/FAIL kèm ảnh chụp; không còn tương tác nào chưa thử trong danh sách bước 4.
- [ ] `npm audit` đã thử lại cho cả 2 phía và có kết quả ghi rõ (PASS / vẫn bị chặn / danh sách CVE).
- [ ] Mỗi việc xong có commit riêng trên nhánh `feat/fe-vibe-and-docs-priority`, message tiếng Việt rõ ràng; **không push, không tạo PR** (PR tạm gác theo quyết định ngày 16/11/2026).

## 5. Kết quả thực hiện
- (Cập nhật sau khi làm xong từng bước — ghi commit, lệnh kiểm chứng và kết quả.)

## 6. DoD Phase 06.5 sau TASK-014 (đánh giá lại)
- (Cập nhật sau khi làm xong: đạt mấy/6 điểm, còn thiếu điểm nào và cần gì từ user/môi trường thật.)
