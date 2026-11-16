# TASK-008: Xây dựng Phân hệ Kết nối Đa Kênh & Đồng Bộ Sàn TMĐT (Omnichannel Channel Connections & Sync Engine)

- **Mã nhiệm vụ**: `TASK-008`
- **Giai đoạn**: `Phase 06 — Omnichannel Integrations (Kết nối đa kênh trực tuyến)`
- **Epic**: `EPIC-06-A`, `EPIC-06-B`, `EPIC-06-C`
- **Trạng thái**: `DONE` (Hoàn thành)
- **Người thực hiện**: Fullstack Engineer
- **Độ ưu tiên**: Cao (P1)

## 1. Mục đích công việc
Xây dựng phân hệ quản trị kết nối đa kênh (`channel_connections`) cho phép liên kết tài khoản bán hàng trực tuyến (Shopee Open Platform, TikTok Shop Open API, Facebook Fanpage / Messenger Platform), theo dõi trạng thái ủy quyền token, kiểm tra webhook và thực hiện đồng bộ tồn kho hai chiều giữa NEXORA và các sàn TMĐT.

## 2. Phạm vi thực hiện (Scope)

### A. Tầng Backend (`backend/src/modules/channel/`)
1. **DTOs**:
   - `ConnectChannelDto`: Loại kênh (`ChannelType`: `SHOPEE`, `TIKTOK_SHOP`, `FACEBOOK`), Tên tài khoản gian hàng, App ID / Shop ID, Access Token, Refresh Token.
   - `UpdateChannelDto`: Tên hiển thị, trạng thái (`CONNECTED`, `EXPIRED`, `DISCONNECTED`).
2. **`ChannelService`**:
   - Quản lý danh sách kết nối gian hàng theo từng `tenant_id` (hỗ trợ Dual-Mode Prisma ORM và Mock seed dữ liệu khởi tạo).
   - `findAll(tenantId)`: Lấy toàn bộ các kênh bán hàng đã kết nối.
   - `connect(tenantId, dto)`: Khởi tạo hoặc cập nhật kết nối sàn TMĐT.
   - `disconnect(tenantId, id)`: Hủy kết nối gian hàng.
   - `sync(tenantId, id)`: Kích hoạt đồng bộ và cập nhật mốc thời gian `lastSyncAt`.
3. **`ChannelController`**: Xuất bản RESTful API endpoints có gắn thẻ Swagger OpenAPI và bảo vệ bằng `JwtAuthGuard`.
4. **`ChannelModule`**: Đăng ký vào `AppModule`.

### B. Tầng Frontend (`frontend/app/dashboard/` & API Client)
1. Thêm API kết nối và đồng bộ kênh bán hàng.
2. Tích hợp dữ liệu API vào tab **"Kênh Bán Hàng (Sàn TMĐT)"** trong Dashboard (`frontend/app/dashboard/page.tsx`).
3. Cung cấp Modal kết nối gian hàng mới (Shopee Mall, TikTok Shop, Facebook Fanpage) và nút bấm đồng bộ ngay có thông báo Toast phản hồi tức thì.

## 3. Tiêu chí nghiệm thu (Acceptance Criteria)
- [x] API `GET /api/v1/channels` trả về danh sách các gian hàng đã kết nối của Tenant kèm trạng thái `CONNECTED`.
- [x] API `POST /api/v1/channels/connect` cho phép thêm mới hoặc cập nhật liên kết gian hàng.
- [x] API `POST /api/v1/channels/:id/sync` kích hoạt đồng bộ thành công và ghi nhận mốc thời gian đồng bộ mới.
- [x] Giao diện Frontend hiển thị danh sách kênh sàn thật từ backend, có nút "Kết nối kênh mới" và "Đồng bộ ngay".

## 4. Ghi chú cập nhật ngày 16/11/2026 — DONE một phần, cần hoàn thiện trước Phase 07/08

> **Căn cứ kiểm chứng**: Rà soát repo `bebokaka99/nexora` ngày 16/11/2026, commit `08b9602`. Trạng thái `DONE` của nhiệm vụ này được giữ nguyên — phần đã làm (CRUD kết nối kênh, API, giao diện tab "Kênh Bán Hàng") vẫn được ghi nhận. Ghi chú này chỉ bổ sung phạm vi còn thiếu, không sửa trạng thái.

- **Hiện trạng thực tế**: `ChannelService.sync()` chỉ cập nhật mốc thời gian `lastSyncAt` bằng thời gian hiện tại; dữ liệu seed gán sẵn `lastSyncAt` ("1 phút trước", "3 phút trước") mà không qua API sàn nào. Chưa có lời gọi API sàn thật, chưa có BullMQ worker hay Redis đang chạy.
- **Kết luận**: Phase 06 mới **DONE một phần** — xong lớp quản lý kết nối, chưa xong đồng bộ thật.
- **Phần còn thiếu** chuyển sang Phase 06.5, `TASK-013: Tích hợp sàn thật — Spike Shopee/TikTok Shop API + BullMQ/Redis Worker`, và phải hoàn thành **trước khi bắt đầu Phase 07/08** (xem điều kiện vào Phase 07/08 tại [PHASES.md](./../PHASES.md)).
