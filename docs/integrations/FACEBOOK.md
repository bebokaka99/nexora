# Tích hợp nền tảng Meta (Facebook & Instagram)

> Trạng thái thông tin: `[PROPOSED]` Đặc tả kỹ thuật kết nối Meta Graph API v21.0+.

Tài liệu này hướng dẫn cách kết nối hệ thống NEXORA với Facebook Fanpage và Instagram Direct phục vụ chức năng quản lý hội thoại tập trung và tạo đơn hàng từ khung chat.

## 1. Yêu cầu thiết lập ứng dụng Meta (Meta App Setup)

Để kết nối với API của Meta, doanh nghiệp cần sở hữu tài khoản Meta for Developers và một ứng dụng đã được phê duyệt các quyền sau:

- `pages_show_list`: Đọc danh sách các Fanpage do người dùng quản trị.
- `pages_read_engagement`: Đọc các lượt tương tác và bình luận trên bài viết của Fanpage.
- `pages_manage_metadata`: Đăng ký Webhook nhận tin nhắn và bình luận.
- `pages_messaging`: Gửi và nhận tin nhắn trực tiếp qua Messenger.

## 2. Luồng ủy quyền OAuth2

1. Người dùng bấm nút **Kết nối Facebook** trên giao diện NEXORA.
2. Trình duyệt chuyển hướng đến màn hình đăng nhập của Meta kèm theo các quyền yêu cầu.
3. Sau khi người dùng đồng ý, Meta chuyển hướng về URL Callback của NEXORA kèm mã `authorization_code`.
4. Máy chủ backend gọi API Meta để đổi mã code lấy User Access Token ngắn hạn.
5. Máy chủ tiếp tục gọi API để đổi sang Page Access Token dài hạn (vô thời hạn cho đến khi người dùng đổi mật khẩu hoặc hủy ủy quyền).
6. Mã hóa Page Access Token bằng khóa bảo mật của Tenant và lưu vào bảng `channel_connections`.

## 3. Cấu hình và tiếp nhận Webhook

NEXORA cung cấp endpoint công khai để nhận Webhook từ Meta:

`POST /api/v1/channels/webhook/facebook`

### Xác minh Webhook ban đầu (Webhook Verification)
Meta thực hiện gửi yêu cầu HTTP `GET` để xác thực quyền sở hữu máy chủ với các tham số:

- `hub.mode=subscribe`
- `hub.challenge`: Chuỗi ký tự ngẫu nhiên từ Meta.
- `hub.verify_token`: Chuỗi bí mật do NEXORA thiết lập sẵn trong tệp biến môi trường.

Nếu `hub.verify_token` trùng khớp, backend phản hồi chuỗi `hub.challenge` với mã trạng thái `200`.

### Xác thực chữ ký số trên từng gói tin gửi đến
Với mỗi yêu cầu `POST` chứa tin nhắn, Meta gửi kèm tiêu đề HTTP `X-Hub-Signature-256`. Backend tính toán mã băm HMAC-SHA256 của toàn bộ nội dung Request Body với `APP_SECRET` của ứng dụng. Nếu mã băm không khớp với tiêu đề nhận được, hệ thống từ chối yêu cầu với mã lỗi `401 Unauthorized`.

## 4. Chính sách cửa sổ tin nhắn 24 giờ (24-Hour Messaging Window)

Meta áp dụng chính sách nghiêm ngặt về quyền gửi tin nhắn:

- Doanh nghiệp chỉ được phép gửi tin nhắn phản hồi tự do trong vòng 24 giờ kể từ tin nhắn cuối cùng do khách hàng gửi.
- Khi vượt quá 24 giờ, tin nhắn gửi đi bắt buộc phải gắn thẻ hợp lệ (`Message Tag`):
  - `CONFIRMED_OWNER_UPDATE`: Thông báo cập nhật trạng thái đơn hàng đã thanh toán.
  - `POST_PURCHASE_UPDATE`: Thông báo vận chuyển hoặc hóa đơn điện tử.
  - `ACCOUNT_UPDATE`: Cập nhật thông tin tài khoản hội viên.
- Không sử dụng các thẻ trên để gửi tin nhắn quảng cáo hoặc tiếp thị sản phẩm mới. Vi phạm quy định này sẽ khiến Fanpage bị Meta khóa quyền gửi tin nhắn vĩnh viễn.
