# Phân Hệ Quản Lý Đơn Hàng — Order Management Module

> Trạng thái thông tin: `[CONFIRMED]` cho đơn hàng đa kênh (POS, Shopee, TikTok, FB) | `[PROPOSED]` cho trạng thái xử lý đơn chuẩn hóa.

## 1. Mục Đích
Phân hệ Order Management đóng vai trò là trung tâm điều phối toàn bộ vòng đời của đơn hàng từ tất cả các kênh (bán lẻ tại quầy POS, sàn Shopee, sàn TikTok Shop và chốt đơn qua Facebook Messenger), quản lý trạng thái thanh toán, giao vận và khấu trừ tồn kho.

## 2. Phạm Vi Nghiệp Vụ
- Tiếp nhận đơn hàng từ các nguồn kênh khác nhau vào một danh sách hợp nhất.
- Quản lý các trạng thái đơn: Chờ xử lý -> Đã xác nhận -> Đang đóng gói -> Đang giao hàng -> Hoàn tất -> Đã hủy -> Hoàn hàng/Trả lại.
- Xử lý hủy đơn và hoàn trả tồn kho tự động.
- Tính toán tổng tiền, chiết khấu, phí giao hàng, thuế và phí dịch vụ sàn.

## 3. Đối Tượng Sử Dụng
- Tenant Administrator, Store Manager.
- Thu ngân (Cashier - đơn POS).
- Nhân viên kho (Warehouse Staff - in phiếu đóng gói, xuất kho).
- Nhân viên trực chat (Chat Agent - tạo đơn từ hội thoại).

## 4. Các Chức Năng Chính
- **Quản Lý Đơn Hàng Tập Trung:** Màn hình danh sách đơn hàng có bộ lọc mạnh mẽ theo kênh bán, chi nhánh, trạng thái thanh toán, khoảng thời gian.
- **Quy Trình Xử Lý Đơn (Fulfillment Flow):** Duyệt đơn -> In phiếu nhặt hàng (Pick List) -> In phiếu đóng gói (Packing Slip) -> Bàn giao cho đơn vị vận chuyển.
- **Hủy Đơn Hàng & Đối Soát:** Hủy đơn trước khi đóng gói, tự động hoàn trả số lượng `committed_qty` về lại `available_qty` trong kho.
- **Chi Tiết Đơn Hàng:** Xem thông tin khách hàng, địa chỉ nhận hàng, lịch sử chuyển trạng thái đơn (Timeline/Audit Log).

## 5. Quy Tắc Nghiệp Vụ (Business Rules)
- `BR-ORD-001`: Đơn hàng tại quầy POS thanh toán thành công chuyển ngay sang trạng thái `COMPLETED` và trừ thẳng tồn `on_hand_qty`.
- `BR-ORD-002`: Đơn hàng online từ sàn hoặc chat khi mới tạo chuyển sang trạng thái `PENDING` hoặc `CONFIRMED` và thực hiện giữ tồn `committed_qty += quantity`.
- `BR-ORD-003`: Khi đơn hàng online chuyển sang `SHIPPED` (đã xuất kho bàn giao vận chuyển), hệ thống chuyển `on_hand_qty -= quantity` và `committed_qty -= quantity`.
- `BR-ORD-004`: Nếu đơn hàng bị `CANCELLED`, hệ thống tự động hoàn trả `committed_qty -= quantity`.

## 6. Dữ Liệu Liên Quan
- `orders`, `order_items`, `customers`, `stores`, `warehouses`, `channel_connections`, `inventories`.

## 7. Quan Hệ Với Module Khác
- Tác động trực tiếp đến `InventoryManagementModule` (khấu trừ tồn).
- Cung cấp dữ liệu gốc cho `BusinessIntelligenceModule` (báo cáo doanh thu).

## 8. API Dự Kiến
- `GET /api/v1/orders`: Danh sách đơn hàng đa kênh.
- `POST /api/v1/orders`: Tạo đơn hàng thủ công / từ chat.
- `GET /api/v1/orders/{id}`: Chi tiết đơn hàng.
- `PATCH /api/v1/orders/{id}/status`: Cập nhật trạng thái đơn hàng.
- `POST /api/v1/orders/{id}/cancel`: Hủy đơn hàng và hoàn tồn kho.

## 9. Quyền Truy Cập
- Quyền: `orders:read`, `orders:create`, `orders:update_status`, `orders:cancel`.

## 10. Các Trường Hợp Biên (Edge Cases)
- Khách hủy đơn trên Shopee trong lúc nhân viên tại kho vừa dán xong mã vận đơn: Hệ thống nhận Webhook hủy đơn -> Lập tức đổi trạng thái đơn trên NEXORA sang `CANCELLED_BY_BUYER` và phát thông báo cảnh báo đỏ trên màn hình đóng gói của nhân viên kho để chặn không bàn giao gói hàng cho shipper.

## 11. Tiêu Chí Nghiệm Thu (Acceptance Criteria)
- Đơn hàng bị hủy -> Số lượng `committed_qty` của sản phẩm giảm đi đúng bằng số lượng hủy; số lượng `available_qty` tăng lại ngay lập tức.

## 12. Những Điểm Cần Xác Nhận Với Khách Hàng `[UNDECIDED]`
- Quy trình đối soát tiền COD và phí dịch vụ sàn TMĐT được thực hiện định kỳ theo tuần hay theo từng đơn hàng cụ thể?
