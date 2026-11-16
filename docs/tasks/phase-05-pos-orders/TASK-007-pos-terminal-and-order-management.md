# TASK-007: Xây dựng Quầy Thu Ngân Bán Lẻ POS & Quản lý Vòng Đời Đơn Hàng Tập Trung (POS Terminal & Unified Order Lifecycle)

- **Mã nhiệm vụ**: `TASK-007`
- **Giai đoạn**: `Phase 05 — POS & Order Lifecycle (Bán hàng tại quầy và Quản lý đơn hàng)`
- **Epic**: `EPIC-05-A`, `EPIC-05-B`, `EPIC-05-C`
- **Trạng thái**: `DONE` (Hoàn thành)
- **Người thực hiện**: Fullstack Engineer
- **Độ ưu tiên**: Cao nhất (P0)

## 1. Mục đích công việc
Xây dựng phân hệ bán lẻ tại quầy POS (`POSTerminal`), xuất hóa đơn bán lẻ, in hóa đơn nhiệt K80 và quản lý tập trung toàn bộ vòng đời đơn hàng đa kênh (`OrderManagement`) từ các kênh POS, Shopee, TikTok Shop và Facebook Fanpage.

Đảm bảo:
1. **Quy tắc trừ kho bán lẻ tại quầy (BR-ORD-001)**: Đơn hàng tạo từ POS thanh toán ngay tại quầy (`status: COMPLETED`) lập tức trừ trực tiếp số lượng tồn kho thực tế (`on_hand_qty`) và khả dụng (`available_qty`) tại kho của cửa hàng tương ứng, ghi nhận nhật ký giao dịch `POS_SALE`.
2. **Quy tắc giữ tồn đơn hàng online (BR-ORD-002)**: Đơn hàng phát sinh từ sàn thương mại điện tử hoặc chat (`status: PENDING` / `CONFIRMED`) tự động giữ tồn kho: `committed_qty += quantity` và `available_qty -= quantity`, đảm bảo không bị bán vượt tồn kho đa kênh.
3. **Quy tắc xuất kho bàn giao vận chuyển (BR-ORD-003)**: Khi đơn hàng online chuyển sang trạng thái `SHIPPED`, hệ thống xuất kho hàng: `on_hand_qty -= quantity` và `committed_qty -= quantity`.
4. **Quy tắc hủy đơn và hoàn trả tồn kho (BR-ORD-004)**: Khi đơn hàng bị hủy (`status: CANCELLED`), hệ thống tự động hoàn trả số lượng đã giữ về tồn khả dụng.
5. **Giao diện người dùng POS Terminal & Quản Lý Đơn Hàng**:
   - Quầy thu ngân POS hỗ trợ chọn cửa hàng, quét mã vạch sản phẩm, tính toán chiết khấu, chọn phương thức thanh toán (Tiền mặt, VietQR, Thẻ ngân hàng), tính tiền thối lại và in hóa đơn nhiệt.
   - Tab "Quản Lý Đơn Hàng" hiển thị danh sách đơn hàng đa kênh, hỗ trợ lọc theo kênh, trạng thái xử lý, xem chi tiết và thao tác chuyển trạng thái máy vòng đời (Xác nhận đơn, Bắt đầu đóng gói, Xuất kho giao hàng, Hoàn tất hoặc Hủy đơn).

## 2. Phạm vi thay đổi (Scope)

### A. Tầng Backend (`backend/src/modules/order/`)
1. **DTOs với kiểm thực dữ liệu nghiêm ngặt (`class-validator`)**:
   - `CreateOrderItemDto`: Biến thể sản phẩm, mã SKU, tên sản phẩm, số lượng, đơn giá.
   - `CreateOrderDto`: Kênh bán (`ChannelTypeEnum`), mã đơn sàn ngoại vi (`externalOrderId`), chi nhánh cửa hàng, kho hàng xử lý, thông tin khách hàng, danh sách sản phẩm, chiết khấu, trạng thái, hình thức thanh toán.
   - `UpdateOrderStatusDto`: Trạng thái mới (`OrderStatusEnum`), trạng thái thanh toán (`PaymentStatusEnum`), ghi chú lịch sử.
   - `QueryOrderDto`: Lọc đơn hàng theo từ khóa (mã đơn, tên, số điện thoại khách), kênh bán, trạng thái xử lý, trạng thái thanh toán, cửa hàng.
2. **`OrderService`**:
   - Kiến trúc **Dual-Mode**: Hỗ trợ đồng thời Prisma ORM và In-Memory Fallback Seed Data có sẵn đơn hàng đa kênh tiêu biểu (Shopee Mall, TikTok Live Flash Sale, POS Chi Nhánh 1, Facebook Fanpage Unified Inbox).
   - `findAll(tenantId, query)`: Tìm kiếm và lọc danh sách đơn hàng đa kênh.
   - `findById(tenantId, id)`: Xem chi tiết đơn hàng, danh sách món và lịch sử vòng đời.
   - `create(tenantId, dto)`: Khởi tạo đơn hàng đa kênh và tự động áp dụng quy tắc tồn kho tương ứng (BR-ORD-001 hoặc BR-ORD-002).
   - `updateStatus(tenantId, id, dto)`: Máy trạng thái chuyển tiếp vòng đời đơn hàng (`PENDING` -> `CONFIRMED` -> `PROCESSING` -> `SHIPPED` -> `COMPLETED`).
   - `cancel(tenantId, id, reason)`: Hủy đơn hàng và tự động giải phóng tồn kho đã giữ (BR-ORD-004).
3. **`OrderController`**: Xuất bản 5 RESTful API endpoints có tài liệu Swagger OpenAPI đầy đủ và bảo vệ bằng `JwtAuthGuard`.
4. **`OrderModule`**: Đăng ký vào `AppModule`, liên kết cùng `InventoryModule` và `WarehouseModule`.

### B. Tầng Frontend (`frontend/`)
1. **Dịch vụ `frontend/lib/services/order-service.ts`**:
   - Cung cấp các phương thức SDK: `getOrders`, `getOrderById`, `createOrder`, `updateOrderStatus`, `cancelOrder`.
2. **Tích hợp POS Terminal (`frontend/app/dashboard/page.tsx`)**:
   - Kết nối thanh toán POS với `orderService.createOrder` và `inventoryService.reserveOrDeductStock`.
   - Sinh hóa đơn POS tức thời và cập nhật bảng tin hoạt động (Activity Feed).
3. **Nâng cấp Phân hệ Quản Lý Đơn Hàng (`frontend/app/dashboard/page.tsx`)**:
   - Tải đơn hàng động từ backend qua `fetchOrders`.
   - Modal chi tiết đơn hàng hiển thị lịch sử vòng đời đơn hàng (`timeline`).
   - Các nút tương tác chuyển trạng thái vòng đời trực quan: "Xác Nhận Đơn", "Đóng Gói Hàng", "Xuất Kho Giao Hàng", "Hoàn Tất Giao Hàng", "Hủy Đơn".

## 3. Tiêu chí nghiệm thu (Acceptance Criteria)
- [x] Gọi API `GET /api/v1/orders` trả về danh sách đơn hàng đa kênh của Tenant.
- [x] Gọi API `POST /api/v1/orders` tạo đơn bán lẻ POS thành công, trạng thái `COMPLETED` và trừ tồn trực tiếp tại kho cửa hàng (BR-ORD-001).
- [x] Gọi API `GET /api/v1/orders/:id` trả về đầy đủ chi tiết đơn hàng, khách hàng và danh sách món hàng.
- [x] Gọi API `POST /api/v1/orders` tạo đơn hàng từ sàn TMĐT (Shopee, TikTok Shop) với trạng thái `PENDING` và tự động giữ tồn kho (BR-ORD-002).
- [x] Gọi API `PATCH /api/v1/orders/:id/status` chuyển tiếp máy trạng thái thành công qua các bước `CONFIRMED` -> `PROCESSING` -> `SHIPPED` -> `COMPLETED`.
- [x] Gọi API `POST /api/v1/orders/:id/cancel` hủy đơn hàng thành công và tự động giải phóng tồn kho đã giữ (BR-ORD-004).
- [x] Giao diện Next.js 15 trên cổng 3000 và NestJS Backend trên cổng 4000 hoạt động trơn tru không có lỗi.
- [x] Kịch bản kiểm thử E2E tự động `scripts/test-task-007.mjs` chạy vượt qua toàn bộ 9/9 bước kiểm thử.
