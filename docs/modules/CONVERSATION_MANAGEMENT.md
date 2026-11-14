# Phân hệ quản lý hội thoại đa kênh (Conversation Management Module)

> Trạng thái thông tin: `[CONFIRMED]` cho hộp thư hợp nhất Facebook và TikTok | `[PROPOSED]` cho kiến trúc WebSocket và công cụ chốt đơn trong hội thoại.

## 1. Mục đích
Phân hệ Conversation Management (Unified Inbox) hợp nhất toàn bộ tin nhắn, bình luận từ các trang mạng xã hội (Facebook Fanpage, Instagram, TikTok Shop) vào một màn hình trực tuyến duy nhất. Phân hệ giúp nhân viên tư vấn phản hồi khách hàng tức thì, tra cứu nhanh sản phẩm và tạo đơn hàng ngay trong luồng trò chuyện.

## 2. Phạm vi nghiệp vụ
- Thu nhận tin nhắn và bình luận trực tiếp từ Facebook Graph API và TikTok Chat API qua cơ chế Webhook.
- Phân phối tin nhắn theo thời gian thực tới trình duyệt của nhân viên thông qua giao thức WebSockets (Socket.IO).
- Cung cấp giao diện tạo đơn hàng nhanh bằng cách chọn sản phẩm trong kho và điền thông tin người nhận trực tiếp từ nội dung hội thoại.
- Điều phối và gán cuộc hội thoại cho nhân viên tư vấn theo ca làm việc hoặc theo nguyên tắc xoay vòng (Round-Robin).

## 3. Đối tượng sử dụng
- Nhân viên trực chat và tư vấn bán hàng (Chat Agent).
- Quản lý đội ngũ chăm sóc khách hàng (Customer Service Lead).
- Quản trị viên doanh nghiệp (Tenant Administrator).

## 4. Các chức năng chính
- **Hộp thư hợp nhất (Unified Inbox):** Danh sách cuộc trò chuyện được phân loại theo kênh (Facebook, TikTok), trạng thái (Chưa trả lời, Đang xử lý, Đã đóng) và nhãn phân loại (Khách hỏi giá, Khiếu nại, Khách sỉ).
- **Khung chat tương tác thời gian thực:** Gửi và nhận tin nhắn văn bản, hình ảnh sản phẩm, tệp đính kèm và tin nhắn mẫu (Quick Replies).
- **Thanh công cụ chốt đơn bên cạnh chat (Side Panel):** Tìm kiếm sản phẩm gia dụng theo tên hoặc SKU, chọn chi nhánh xuất kho, nhập địa chỉ nhận hàng và tạo đơn hàng gửi về hệ thống chỉ với một thao tác.
- **Hồ sơ khách hàng theo ngữ cảnh:** Hiển thị số điện thoại, tổng tiền đã mua và các đơn hàng gần nhất của khách ngay bên phải màn hình chat.

## 5. Quy tắc nghiệp vụ (Business Rules)
- `BR-CON-001`: Mọi tin nhắn gửi đến từ khách hàng phải được phát qua Socket.IO tới nhân viên được phân công trong thời gian dưới 500ms.
- `BR-CON-002`: Tuân thủ nghiêm ngặt chính sách cửa sổ tin nhắn 24 giờ của Meta (Standard Messaging Window). Khi quá 24 giờ kể từ tin nhắn cuối của khách, hệ thống khóa khung nhập liệu thông thường và yêu cầu sử dụng Message Tag hợp lệ theo quy định của Facebook.
- `BR-CON-003`: Khi nhân viên bấm nút tạo đơn trong khung chat, hệ thống tự động liên kết mã đơn hàng đó với phiên hội thoại hiện tại để phục vụ tra cứu sau này.
- `BR-CON-004`: Một cuộc trò chuyện chỉ được gán cho một nhân viên xử lý chính tại một thời điểm để tránh tình trạng hai nhân viên cùng trả lời một khách hàng.

## 6. Thực thể dữ liệu liên quan
- `conversations`: Lưu phiên trò chuyện, mã người dùng trên kênh bên ngoài, kênh xuất phát (`FACEBOOK`, `TIKTOK`), trạng thái và nhân viên phụ trách.
- `messages`: Lưu từng tin nhắn (nội dung văn bản, hình ảnh, chiều gửi/nhận, thời gian nhận).
- `quick_replies`: Lưu các mẫu tin nhắn trả lời nhanh được cài đặt sẵn của cửa hàng.

## 7. Mối quan hệ với module khác
- Liên kết với `CustomerManagementModule`: Nhận diện khách hàng qua số điện thoại thu thập được trong hội thoại để cập nhật hồ sơ khách.
- Liên kết với `OrderManagementModule`: Gọi API tạo đơn hàng trực tiếp từ khung chat.
- Liên kết với `InventoryManagementModule`: Hiển thị số lượng tồn kho khả dụng thời gian thực khi nhân viên chọn sản phẩm gửi khách.

## 8. Danh mục API dự kiến
- `GET /api/v1/conversations`: Danh sách các cuộc trò chuyện kèm bộ lọc trạng thái và kênh.
- `GET /api/v1/conversations/{id}/messages`: Lịch sử tin nhắn của một cuộc trò chuyện.
- `POST /api/v1/conversations/{id}/messages`: Gửi tin nhắn trả lời tới khách hàng qua API của sàn hoặc mạng xã hội.
- `POST /api/v1/conversations/{id}/assign`: Gán cuộc trò chuyện cho một nhân viên cụ thể.
- `POST /api/v1/conversations/{id}/create-order`: Tạo nhanh đơn hàng từ ngữ cảnh cuộc trò chuyện.

## 9. Quyền truy cập
- Quyền: `conversations:read`, `conversations:reply`, `conversations:assign`, `conversations:create_order`.

## 10. Các trường hợp biên (Edge Cases)
- Khách hàng gửi số điện thoại dưới dạng viết chữ (ví dụ: "không chín một hai...") để lách kiểm duyệt của sàn: Hệ thống sử dụng biểu thức chính quy (Regex) và logic xử lý ngôn ngữ cơ bản để nhận diện số điện thoại tự động.
- Mất kết nối WebSocket giữa trình duyệt của nhân viên và máy chủ: Trình duyệt tự động kích hoạt cơ chế kết nối lại và gửi yêu cầu đồng bộ các tin nhắn đã bỏ lỡ trong khoảng thời gian gián đoạn.

## 11. Tiêu chí nghiệm thu (Acceptance Criteria)
- [ ] Khi khách hàng gửi tin nhắn trên Fanpage Facebook, tin nhắn xuất hiện trên màn hình Unified Inbox của nhân viên trong vòng dưới 1 giây.
- [ ] Nhân viên chọn một sản phẩm gia dụng trong thanh công cụ bên cạnh chat và bấm tạo đơn thành công, hệ thống sinh ra mã đơn hàng hợp lệ.
- [ ] Không cho phép hai nhân viên cùng mở quyền trả lời một cuộc trò chuyện cùng lúc mà không có cảnh báo xung đột.

## 12. Những điểm còn bỏ ngỏ cần xác nhận (Pending Decisions)
- `[UNDECIDED]`: Đề xuất tích hợp tính năng tự động ẩn bình luận chứa số điện thoại trên Facebook Fanpage để phòng tránh đối thủ cướp khách.
