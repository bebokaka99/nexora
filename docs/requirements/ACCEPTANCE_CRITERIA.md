# Tiêu Chí Nghiệm Thu — Acceptance Criteria (Given/When/Then)

> Trạng thái thông tin: `[PROPOSED]` Bộ tiêu chí nghiệm thu kiểm thử được (Gherkin format) cho các tính năng trọng điểm.

Mọi chức năng cốt lõi trước khi được nghiệm thu hoặc chuyển trạng thái sang `DONE` đều phải thỏa mãn toàn bộ các kịch bản kiểm thử hành vi dưới đây.

---

## 1. Tính Năng Xác Thực & Cô Lập Multi-Tenant

### Kịch bản AC-AUTH-001: Đăng nhập thành công và nạp đúng ngữ cảnh Tenant
- **Given:** Người dùng có tài khoản hợp lệ thuộc doanh nghiệp Tenant A (`tenant_id: "tenant-a"`).
- **When:** Người dùng gửi thông tin email và mật khẩu chính xác lên endpoint `/api/v1/auth/login`.
- **Then:** Hệ thống trả về mã trạng thái HTTP 200, cấp Access Token có chứa `sub`, `tenant_id` và danh sách quyền hạn `permissions`.
- **And:** Mọi yêu cầu dữ liệu tiếp theo với token này chỉ trả về dữ liệu thuộc Tenant A, hoàn toàn không thấy dữ liệu của Tenant B.

### Kịch bản AC-AUTH-002: Chặn truy cập trái phép chéo Tenant
- **Given:** Người dùng đang đăng nhập với tài khoản hợp lệ thuộc Tenant A.
- **When:** Người dùng cố tình gọi API `/api/v1/orders/ord-999` (với `ord-999` là đơn hàng thuộc Tenant B).
- **Then:** Hệ thống chặn yêu cầu và trả về mã lỗi HTTP 404 Not Found hoặc HTTP 403 Forbidden.
- **And:** Ghi lại nhật ký cảnh báo an ninh vào `audit_logs`.

---

## 2. Tính Năng Bán Hàng Tại Quầy (POS)

### Kịch bản AC-POS-001: Quét mã vạch và tạo đơn hàng tại quầy
- **Given:** Thu ngân đang ở màn hình POS tại Cửa hàng 1 (Kho 1 có 5 chiếc Chảo chống dính mã SKU: `CD-28CM`).
- **When:** Thu ngân quét mã vạch của sản phẩm, chọn số lượng là 2 và chọn phương thức thanh toán "Tiền mặt".
- **And:** Bấm nút "Thanh toán & In hóa đơn".
- **Then:** Hệ thống tạo đơn hàng thành công với trạng thái `COMPLETED`.
- **And:** Số lượng tồn kho khả dụng của `CD-28CM` tại Kho 1 giảm ngay lập tức từ 5 xuống còn 3 chiếc.
- **And:** Lệnh in hóa đơn được gửi đến máy in với đầy đủ thông tin: Tên cửa hàng, mã đơn, danh sách món, tổng tiền.

### Kịch bản AC-POS-002: Chặn bán khi sản phẩm không đủ tồn kho
- **Given:** Sản phẩm Nồi cơm điện `NC-18L` chỉ còn 1 chiếc khả dụng tại Kho Cửa hàng 2.
- **When:** Thu ngân nhập số lượng mua là 2 chiếc.
- **Then:** Giao diện POS hiển thị thông báo lỗi màu đỏ: *"Số lượng yêu cầu (2) vượt quá tồn kho khả dụng (1)"*.
- **And:** Nút "Thanh toán" bị vô hiệu hóa, không cho phép gửi yêu cầu tạo đơn lên máy chủ.

---

## 3. Tính Năng Đồng Bộ Đa Kênh (Omnichannel Sync)

### Kịch bản AC-OMNI-001: Tiếp nhận đơn hàng từ sàn Shopee và khấu trừ tồn kho
- **Given:** Kênh Shopee đã được kết nối hợp lệ; sản phẩm Nồi chiên không dầu có mã SKU sàn `SP-NCKD-5L` đã được ánh xạ với mã SKU hệ thống `NCKD-05L`.
- **And:** Tồn kho khả dụng của `NCKD-05L` tại Kho Tổng đang là 20 chiếc.
- **When:** Shopee bắn Webhook thông báo đơn hàng mới gồm 1 chiếc `SP-NCKD-5L`.
- **Then:** Webhook Receiver xác thực chữ ký hợp lệ và trả về HTTP 200 trong vòng < 2 giây.
- **And:** Worker trong BullMQ tạo đơn hàng mới trên NEXORA với mã nguồn `SHOPEE`.
- **And:** Tồn kho khả dụng của `NCKD-05L` tại Kho Tổng giảm từ 20 xuống 19 chiếc.
- **And:** Hệ thống tự động tạo job đẩy số lượng tồn mới (19 chiếc) sang các kênh bán hàng khác (TikTok Shop).

---

## 4. Tính Năng Hộp Thư Hội Thoại & Chốt Đơn (Social Commerce)

### Kịch bản AC-CONV-001: Tạo đơn hàng thành công trực tiếp từ khung chat Messenger
- **Given:** Nhân viên trực chat đang trao đổi với khách hàng trên màn hình Unified Inbox.
- **When:** Khách hàng xác nhận mua 1 Ấm siêu tốc `AST-18L`.
- **And:** Nhân viên chọn sản phẩm `AST-18L` trên bảng bên phải, điền thông tin Họ tên, SĐT và Địa chỉ của khách rồi bấm "Tạo Đơn Hàng".
- **Then:** Hệ thống tạo đơn hàng thành công với nguồn `FACEBOOK_MESSENGER`.
- **And:** Tự động gửi một tin nhắn phản hồi vào khung chat Messenger cho khách hàng với nội dung: *"Đơn hàng #ORD-XXXX của bạn đã được tiếp nhận thành công. Tổng tiền: 350,000đ."*
