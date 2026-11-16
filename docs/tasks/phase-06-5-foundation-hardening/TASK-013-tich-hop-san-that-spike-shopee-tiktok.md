# TASK-013: Tích Hợp Sàn Thật — Spike Shopee/TikTok Shop API + BullMQ/Redis Worker (Hoàn Thiện Phase 06)

- **Mã nhiệm vụ**: `TASK-013`
- **Giai đoạn**: `Phase 06.5 — Foundation Hardening (Củng cố nền tảng)` (hoàn thiện phần còn thiếu của Phase 06)
- **Epic**: `EPIC-06-A`, `EPIC-06-B`, `EPIC-06-C`
- **Trạng thái**: `TODO`
- **Người thực hiện**: Backend Engineer
- **Độ ưu tiên**: Cao (P1)

## 1. Mục đích công việc

`TASK-008` đã DONE phần CRUD kết nối kênh và cập nhật mốc `lastSyncAt`, nhưng đó mới là vỏ quản lý kết nối — chưa có một lời gọi API sàn thật nào. Phase 06 vì vậy chỉ **DONE một phần**: chưa đồng bộ sản phẩm, chưa kéo đơn hàng, chưa đẩy tồn kho lên sàn. Nhiệm vụ này là phần còn thiếu của Phase 06 và là **điều kiện bắt buộc trước khi vào Phase 07/08**: chứng minh được một luồng end-to-end thật chạy được với ít nhất một sàn.

Nhiệm vụ này phụ thuộc `TASK-009` (PostgreSQL thật — token và dữ liệu đồng bộ phải lưu bền vững) và `TASK-010` (Redis thật qua `docker-compose` cho BullMQ worker).

> **Căn cứ kiểm chứng**: Rà soát repo `bebokaka99/nexora` ngày 16/11/2026, commit `08b9602`. `ChannelService.sync()` chỉ cập nhật `lastSyncAt` bằng thời gian hiện tại; `lastSyncAt` trong dữ liệu seed được gán sẵn (`1 phút trước`, `3 phút trước`) mà không qua API sàn nào; không có BullMQ worker hay Redis nào đang chạy.

## 2. Phạm vi thay đổi (Scope)
- **Tệp mã nguồn bị tác động**:
  - `backend/src/modules/channel/` (mới: `shopee.client.ts`, `tiktok.client.ts`, OAuth/refresh token thật, lưu token vào PostgreSQL)
  - `backend/src/modules/sync/` (mới: BullMQ queue + worker đồng bộ tồn kho/đơn hàng, chạy trên Redis thật)
  - `backend/src/modules/channel/channel.service.ts` (nối `sync()` vào queue thật thay vì chỉ cập nhật `lastSyncAt`)
- **Các API cần tạo mới hoặc chỉnh sửa**:
  - `POST /api/v1/channels/:id/sync` — đổi từ cập nhật mốc thời gian sang enqueue job đồng bộ thật, trả về trạng thái job.
  - `GET /api/v1/channels/:id/sync-status` (mới, tùy chọn) — trạng thái job đồng bộ gần nhất.
  - Webhook nhận đơn hàng mới từ sàn (tùy chọn trong spike, bắt buộc ở bản hoàn thiện nếu sàn hỗ trợ).
- **Thay đổi cơ sở dữ liệu (nếu có)**:
  - Bảng/field lưu token sàn (`access_token`, `refresh_token`, `token_expires_at`) và nhật ký đồng bộ (`sync_logs`) trong `schema.prisma` (migration mới sau `TASK-009`).

## 3. Các bước thực hiện chi tiết
1. Bước 1 (Spike, tối đa 2–3 ngày): Đăng ký app sandbox Shopee Open Platform và TikTok Shop Open API; gọi thử API lấy danh sách sản phẩm/đơn hàng bằng token sandbox; ghi lại giới hạn, quy trình OAuth và refresh token của từng sàn vào `docs/` (ghi chú spike).
2. Bước 2: Cài đặt OAuth thật cho ít nhất một sàn (ưu tiên sàn nào spike xong trước): lưu token vào PostgreSQL, tự động refresh khi hết hạn.
3. Bước 3: Dựng BullMQ queue + worker trên Redis thật (`TASK-010`): job đồng bộ tồn kho một chiều NEXORA → sàn và job kéo đơn hàng sàn → NEXORA.
4. Bước 4: Nối `POST /api/v1/channels/:id/sync` vào queue thật; ghi `sync_logs` (thời gian, số bản ghi thành công/thất bại, lỗi).
5. Bước 5: Chạy luồng end-to-end thật trên sandbox: đổi tồn kho trong NEXORA → tồn kho trên sàn đổi theo; có đơn mới trên sàn → đơn xuất hiện trong NEXORA. Ghi lại bằng chứng (log, ảnh chụp màn hình) vào ghi chú nghiệm thu.

## 4. Tiêu chí nghiệm thu (Acceptance Criteria)
- [ ] Spike hoàn thành cho Shopee và TikTok Shop: có ghi chú OAuth, scope, giới hạn API và kết quả gọi thử sandbox.
- [ ] Ít nhất một sàn chạy OAuth thật, token lưu trong PostgreSQL và tự refresh được.
- [ ] Worker BullMQ/Redis chạy thật: job đồng bộ tồn kho và kéo đơn hàng hoàn thành, có bản ghi trong `sync_logs`.
- [ ] Luồng end-to-end thật chạy được trên sandbox: đổi tồn trong NEXORA → sàn cập nhật; đơn mới trên sàn → về NEXORA.
- [ ] `POST /api/v1/channels/:id/sync` không còn chỉ cập nhật `lastSyncAt` giả — mốc thời gian chỉ cập nhật khi job đồng bộ thật thành công.
