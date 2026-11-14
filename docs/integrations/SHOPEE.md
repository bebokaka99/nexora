# Tích hợp sàn Shopee (Shopee Open Platform API v2)

> Trạng thái thông tin: `[PROPOSED]` Đặc tả kỹ thuật kết nối Shopee Open Platform API v2.

Tài liệu này hướng dẫn cách kết nối hệ thống NEXORA với sàn thương mại điện tử Shopee để đồng bộ danh mục hàng gia dụng, đơn hàng và xử lý tồn kho hai chiều.

## 1. Yêu cầu thiết lập ứng dụng Shopee Open Platform

Để kết nối với Shopee, doanh nghiệp đăng ký tài khoản tại `https://open.shopee.com/` và tạo ứng dụng để nhận cặp thông tin định danh:

- `partner_id`: Mã định danh đối tác do Shopee cấp (kiểu số nguyên).
- `partner_key`: Khóa bí mật đối tác dùng để ký mã băm (dạng chuỗi bí mật).

## 2. Luồng ủy quyền OAuth2 cho Shop

1. Chủ cửa hàng bấm **Kết nối Shopee** trên màn hình quản trị NEXORA.
2. Hệ thống tính toán chữ ký số ủy quyền theo công thức:
   `sign = HMAC_SHA256(partner_key, partner_id + path + timestamp)`
3. Chuyển hướng người dùng tới trang ủy quyền chính thức của Shopee:
   `https://partner.shopeemobile.com/api/v2/shop/auth_partner?partner_id={partner_id}&timestamp={timestamp}&sign={sign}&redirect={redirect_url}`
4. Sau khi chủ shop đăng nhập và đồng ý cấp quyền, Shopee chuyển hướng về `redirect_url` kèm theo hai tham số: `code` và `shop_id`.
5. Backend gọi API `/api/v2/auth/token/get` để nhận:
   - `access_token`: Có hiệu lực trong vòng 4 giờ.
   - `refresh_token`: Có hiệu lực trong vòng 30 ngày.
6. Hệ thống lưu `access_token` và thiết lập cron job chạy mỗi 3 giờ để gọi API `/api/v2/auth/access_token/get` gia hạn phiên làm việc liên tục.

## 3. Quy chuẩn ký số cho các cuộc gọi API v2

Mọi yêu cầu gửi tới Shopee bắt buộc phải chứa các tham số truy vấn sau trên URL:

- `partner_id`: Mã đối tác.
- `timestamp`: Thời gian hiện tại tính bằng giây (Epoch Timestamp). Timestamp không được lệch quá 5 phút so với đồng hồ của máy chủ Shopee.
- `access_token`: Mã truy cập của shop.
- `shop_id`: Mã định danh cửa hàng trên Shopee.
- `sign`: Chuỗi băm HMAC-SHA256 theo công thức:
  `sign = HMAC_SHA256(partner_key, partner_id + path + timestamp + access_token + shop_id)`

## 4. Đồng bộ sản phẩm và cập nhật số lượng tồn kho

### Lấy danh sách đơn hàng mới
Sử dụng API `/api/v2/order/get_order_list` với tham số `time_range_field=create_time` kết hợp Webhook thông báo đơn hàng để kéo thông tin chi tiết qua `/api/v2/order/get_order_detail`.

### Cập nhật tồn kho tự động (Update Stock)
Khi kho hàng của NEXORA có biến động (do bán lẻ tại cửa hàng hoặc bán trên TikTok Shop), Worker trong BullMQ gọi API `/api/v2/product/update_stock` với danh sách mã mặt hàng:

```json
{
	"item_id": 12345678,
	"stock_list": [
		{
			"model_id": 87654321,
			"normal_stock": 25
		}
	]
}
```

## 5. Giới hạn tần suất và cơ chế an toàn

- **Giới hạn tần suất:** Shopee áp dụng giới hạn tối đa 50 requests/phút trên mỗi `shop_id`. Worker của NEXORA sử dụng thuật toán Token Bucket để kiểm soát tốc độ gửi lệnh.
- **Giới hạn thử lại:** Khi gặp mã lỗi `error_param` hoặc `error_auth`, hệ thống không thử lại tự động mà ghi log lỗi để kỹ sư kiểm tra. Khi gặp lỗi nghẽn mạng `error_server`, hệ thống thử lại tối đa 3 lần sau 5 giây.
