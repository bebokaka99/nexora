# Phân hệ kết nối đa kênh (Omnichannel Integration Module)

> Trạng thái thông tin: `[CONFIRMED]` cho tích hợp Shopee, TikTok Shop và Facebook | `[PROPOSED]` cho kiến trúc hàng đợi BullMQ đồng bộ tồn kho thời gian thực.

## 1. Mục đích
Phân hệ Omnichannel chịu trách nhiệm kết nối, điều phối và duy trì dòng dữ liệu hai chiều liên tục giữa nền tảng NEXORA và các sàn thương mại điện tử (Shopee, TikTok Shop) cùng nền tảng mạng xã hội (Facebook/Instagram). Phân hệ đảm bảo sản phẩm, giá bán và tồn kho trên mọi kênh luôn khớp với dữ liệu thực tế tại kho hàng.

## 2. Phạm vi nghiệp vụ
- Quản lý vòng đời kết nối và ủy quyền OAuth2 cho các gian hàng trực tuyến của doanh nghiệp.
- Nhận và xử lý Webhook sự kiện đơn hàng mới, cập nhật trạng thái đơn và yêu cầu hủy đơn từ sàn.
- Đồng bộ tồn kho khả dụng từ NEXORA lên tất cả các kênh được liên kết khi có biến động kho.
- Ánh xạ mã định danh sản phẩm (SKU Mapping) giữa mã nội bộ của NEXORA và mã hàng trên từng sàn.

## 3. Đối tượng sử dụng
- Quản trị viên doanh nghiệp (Tenant Administrator).
- Quản lý vận hành thương mại điện tử (E-commerce Operations Manager).
- Kỹ sư tích hợp hệ thống.

## 4. Các chức năng chính
- **Trung tâm kết nối kênh (Channel Hub):** Giao diện thêm mới gian hàng Shopee, TikTok Shop, liên kết Fanpage qua OAuth2 và theo dõi hạn sử dụng của Access Token.
- **Bảng ánh xạ sản phẩm (Product SKU Mapping):** Khớp nối danh mục sản phẩm trên sàn với sản phẩm trong kho NEXORA. Hỗ trợ ánh xạ một SKU kho cho nhiều gian hàng.
- **Hàng đợi đồng bộ tồn kho tự động (Stock Sync Engine):** Mỗi khi có đơn hàng tại quầy POS hoặc đơn online, hệ thống tạo tác vụ đẩy số lượng khả dụng mới lên sàn qua hàng đợi BullMQ.
- **Nhật ký đồng bộ (Sync Audit Log):** Bảng ghi chi tiết từng lần gọi API sàn, thời gian phản hồi, trạng thái thành công và nguyên nhân lỗi nếu bị sàn từ chối.

## 5. Quy tắc nghiệp vụ (Business Rules)
- `BR-OMN-001`: Mọi thao tác gọi API sàn có thời gian xử lý lâu bắt buộc phải đưa vào hàng đợi Redis / BullMQ, không thực hiện trong luồng xử lý Request chính của API.
- `BR-OMN-002`: Hệ thống phải tuân thủ nghiêm ngặt giới hạn tần suất gọi API (Rate Limit) của từng nền tảng: Shopee (tối đa 50 requests/phút trên mỗi shop), TikTok Shop (tối đa 10 requests/giây).
- `BR-OMN-003`: Khi một sản phẩm chưa được ánh xạ SKU với kho NEXORA mà phát sinh đơn trên sàn, hệ thống tạo đơn hàng tạm và gửi thông báo cảnh báo yêu cầu nhân viên ánh xạ thủ công.
- `BR-OMN-004`: Nếu Access Token của gian hàng hết hạn, hệ thống tự động làm mới bằng Refresh Token. Nếu làm mới thất bại, hệ thống gửi thông báo yêu cầu chủ shop ủy quyền lại.

## 6. Thực thể dữ liệu liên quan
- `channel_connections`: Lưu thông tin định danh gian hàng, loại kênh (`SHOPEE`, `TIKTOK_SHOP`, `FACEBOOK`), mã Access Token mã hóa và trạng thái kết nối.
- `channel_product_mappings`: Bảng ánh xạ giữa `ProductVariant.id` nội bộ và mã sản phẩm/SKU trên sàn.
- `channel_sync_logs`: Lưu vết lịch sử các đợt đồng bộ tồn kho và giá bán.

## 7. Mối quan hệ với module khác
- Liên kết với `InventoryManagementModule`: Lắng nghe sự kiện thay đổi tồn kho khả dụng để kích hoạt đồng bộ lên sàn.
- Liên kết với `OrderManagementModule`: Đẩy đơn hàng nhận được từ Webhook sàn vào trung tâm xử lý đơn hàng.
- Liên kết với `ProductManagementModule`: Lấy thông tin giá bán và thuộc tính sản phẩm để đồng bộ lên sàn.

## 8. Danh mục API dự kiến
- `GET /api/v1/channels`: Danh sách các kênh bán hàng đã kết nối của Tenant.
- `POST /api/v1/channels/authorize`: Bắt đầu luồng ủy quyền OAuth2 cho một gian hàng mới.
- `POST /api/v1/channels/webhook/{channelType}`: Endpoint công khai tiếp nhận Webhook từ Shopee và TikTok Shop.
- `GET /api/v1/channels/{id}/mappings`: Danh sách các sản phẩm đã được ánh xạ giữa kho và sàn.
- `POST /api/v1/channels/{id}/mappings`: Thiết lập ánh xạ thủ công cho một SKU.
- `POST /api/v1/channels/{id}/sync-stock`: Kích hoạt đồng bộ toàn bộ tồn kho thủ công khi cần kiểm tra.

## 9. Quyền truy cập
- Quyền: `channels:read`, `channels:connect`, `channels:map_sku`, `channels:trigger_sync`.

## 10. Các trường hợp biên (Edge Cases)
- Sự cố mất mạng Internet hoặc sàn phản hồi lỗi 500: Tác vụ đồng bộ trong BullMQ tự động thử lại tối đa 5 lần theo cơ chế giãn cách thời gian tăng dần (Exponential Backoff).
- Khách đặt hàng đồng thời trên cả Shopee và TikTok Shop trong khi kho chỉ còn đúng 1 sản phẩm: Đơn hàng nào gửi Webhook đến NEXORA trước sẽ được giữ tồn. Đơn hàng đến sau sẽ rơi vào trạng thái thiếu hàng (Out of Stock) và cảnh báo cho nhân viên xử lý.

## 11. Tiêu chí nghiệm thu (Acceptance Criteria)
- [ ] Khi một đơn hàng POS thanh toán trừ tồn kho tại cửa hàng, hệ thống phát lệnh cập nhật tồn kho mới lên Shopee và TikTok Shop trong vòng 3 giây.
- [ ] Khi có đơn hàng mới trên Shopee, webhook sàn kích hoạt và tạo bản ghi đơn hàng trong NEXORA trong vòng dưới 2 giây.
- [ ] Không làm sập hệ thống khi hàng đợi nhận cùng lúc 500 webhook sự kiện từ các sàn trong sự kiện Flash Sale.

## 12. Những điểm còn bỏ ngỏ cần xác nhận (Pending Decisions)
- `[UNDECIDED]`: Chính sách giữ lại số lượng tồn kho đệm an toàn (Buffer Stock) cho từng sàn để tránh hoàn toàn rủi ro bán vượt tồn.
