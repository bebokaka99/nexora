# Tích hợp TikTok Shop (TikTok Shop Open API)

> Trạng thái thông tin: `[PROPOSED]` Đặc tả kỹ thuật kết nối TikTok Shop Open API v202309+.

Tài liệu này hướng dẫn cách kết nối hệ thống NEXORA với nền tảng bán hàng TikTok Shop phục vụ chức năng đồng bộ sản phẩm, quản lý đơn hàng và cập nhật tồn kho tự động.

## 1. Yêu cầu thiết lập ứng dụng TikTok Shop Partner Center

Doanh nghiệp cần đăng ký tài khoản nhà phát triển trên cổng TikTok Shop Partner Center và tạo ứng dụng tùy chỉnh (Custom App) với các phạm vi quyền (Scopes):

- `seller.product.read`, `seller.product.write`: Đọc và cập nhật sản phẩm, giá bán, số lượng tồn kho.
- `seller.order.read`, `seller.order.write`: Đồng bộ đơn hàng và cập nhật trạng thái đóng gói.
- `seller.fulfillment.read`, `seller.fulfillment.write`: In phiếu vận chuyển và bàn giao cho shipper.

## 2. Luồng ủy quyền OAuth2 cho nhà bán hàng

1. Chủ cửa hàng truy cập màn hình Cài đặt kết nối trên NEXORA và chọn **Kết nối TikTok Shop**.
2. Hệ thống tạo đường dẫn ủy quyền kèm tham số `app_key`, `state` và chuyển hướng chủ cửa hàng đến trang đăng nhập của TikTok Shop.
3. Chủ cửa hàng chọn tài khoản shop và xác nhận cấp quyền cho ứng dụng NEXORA.
4. TikTok Shop chuyển hướng về Callback URL kèm tham số `code`.
5. Backend gọi API `https://auth.tiktok-shops.com/api/v2/token/get` để lấy:
   - `access_token`: Có hiệu lực trong vòng 7 ngày.
   - `refresh_token`: Có hiệu lực trong vòng 365 ngày.
   - `seller_base_region`: Khu vực thị trường (Ví dụ: `VN` cho thị trường Việt Nam).
6. Hệ thống lên lịch định kỳ bằng cron job kiểm tra và tự động làm mới `access_token` trước khi hết hạn 24 giờ.

## 3. Quy chuẩn tính toán chữ ký số (Signature Calculation)

Mọi yêu cầu gửi tới TikTok Shop API bắt buộc phải kèm theo tham số `sign` trong chuỗi truy vấn (Query String). Quy trình tính toán chữ ký gồm 5 bước:

1. Trích xuất toàn bộ các tham số trong URL (trừ `sign` và `access_token`).
2. Sắp xếp các tham số theo thứ tự bảng chữ cái alphabet tăng dần theo tên tham số.
3. Nối các cặp `key=value` lại thành một chuỗi liên tục, ngăn cách bằng ký tự rỗng.
4. Nối thêm đường dẫn API (Path) ở đầu chuỗi và toàn bộ nội dung JSON Body ở cuối chuỗi (nếu có).
5. Sử dụng thuật toán HMAC-SHA256 với `app_secret` làm khóa để mã hóa chuỗi trên. Kết quả trả về là chuỗi Hex viết thường và được gán vào tham số `sign`.

## 4. Xử lý sự kiện Webhook đơn hàng mới

NEXORA đăng ký lắng nghe các sự kiện Webhook sau từ TikTok Shop:

- `ORDER_STATUS_CHANGE`: Kích hoạt khi có đơn hàng mới chuyển sang trạng thái đã thanh toán hoặc khi người mua yêu cầu hủy đơn.
- `PACKAGE_STATUS_CHANGE`: Kích hoạt khi đơn vị vận chuyển của TikTok lấy hàng thành công hoặc giao hàng thất bại.

Khi nhận Webhook:
1. Bộ lọc kiểm tra tiêu đề `Authorization` trên Header của Webhook để đảm bảo tính xác thực từ máy chủ TikTok.
2. Trích xuất mã đơn hàng `order_id` và đẩy vào hàng đợi BullMQ để xử lý bất đồng bộ.
3. Phản hồi mã `200` với cấu trúc JSON `{"code": 0, "message": "success"}` trong vòng 3 giây để tránh TikTok gửi lại Webhook lặp lại.
