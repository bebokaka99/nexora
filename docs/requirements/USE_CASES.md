# Kịch Bản Sử Dụng Chi Tiết — Use Cases

> Trạng thái thông tin: `[CONFIRMED]` cho nghiệp vụ cốt lõi | `[PROPOSED]` cho các trường hợp biên và ngoại lệ.

Tài liệu này mô tả chi tiết các ca sử dụng tiêu biểu của hệ thống NEXORA kèm tiền điều kiện, luồng xử lý chính, luồng phụ và hậu điều kiện.

---

## 1. Use Case UC-001: Tạo Đơn Hàng Tại Quầy Thu Ngân (In-Store POS Sale)

- **Actor chính:** Thu ngân (Cashier).
- **Tiền điều kiện (Preconditions):**
  - Thu ngân đã đăng nhập thành công vào phiên làm việc tại Cửa hàng tương ứng.
  - Ca làm việc đã được mở (Session is Open).
- **Hậu điều kiện (Postconditions):**
  - Đơn hàng được lưu vào hệ thống với trạng thái `COMPLETED`.
  - Tồn kho tại Kho gắn với Cửa hàng đó được trừ tương ứng.
  - Hóa đơn bán lẻ được in ra.

### Luồng Xử Lý Chính (Main Success Scenario)
1. Thu ngân dùng máy quét mã vạch quét mã Barcode trên bao bì sản phẩm gia dụng (hoặc gõ tìm kiếm theo tên).
2. Hệ thống tìm kiếm và thêm sản phẩm vào giỏ hàng, hiển thị tên sản phẩm, biến thể, giá bán và số lượng mặc định là 1.
3. Thu ngân điều chỉnh số lượng nếu khách mua nhiều sản phẩm.
4. Thu ngân hỏi khách hàng số điện thoại để tích điểm hoặc tạo hồ sơ khách hàng mới (nếu chưa có).
5. Hệ thống tính tổng tiền cần thanh toán (đã bao gồm thuế/giảm giá nếu có).
6. Khách hàng chọn hình thức thanh toán (Tiền mặt hoặc Chuyển khoản VietQR).
7. Thu ngân xác nhận nhận đủ tiền và nhấn "Thanh toán & In hóa đơn".
8. Hệ thống ghi nhận đơn hàng, trừ số lượng tồn kho khả dụng và phát lệnh in hóa đơn ra máy in nhiệt.

### Luồng Rẽ Nhánh & Ngoại Lệ (Extensions)
- **3a. Sản phẩm hết tồn kho trong hệ thống:** Hệ thống hiển thị cảnh báo đỏ *"Sản phẩm đã hết hàng trong kho cửa hàng"* và chặn việc thanh toán (trừ khi có quyền đặc biệt cho phép bán âm kho).
- **6a. Khách hàng hủy mua giữa chừng:** Thu ngân nhấn "Hủy giỏ hàng", hệ thống xóa giỏ hàng tạm thời và sẵn sàng cho khách hàng kế tiếp mà không ảnh hưởng đến tồn kho.

---

## 2. Use Case UC-002: Đồng Bộ Tồn Kho Đa Kênh Tự Động (Omnichannel Stock Sync)

- **Actor chính:** Hệ thống (System Trigger / Worker).
- **Tiền điều kiện:**
  - Kênh bán hàng (Shopee, TikTok Shop) đã được ủy quyền kết nối hợp lệ.
  - Mã SKU trên sàn đã được ánh xạ (Mapped) với mã SKU trong NEXORA.
- **Hậu điều kiện:**
  - Số lượng tồn kho trên sàn TMĐT trùng khớp với số lượng tồn thực tế của NEXORA.

### Luồng Xử Lý Chính
1. Một biến động tồn kho phát sinh trong NEXORA (ví dụ: bán 2 chiếc nồi cơm tại Cửa hàng 1, hoặc nhập thêm 50 chiếc vào Kho Tổng).
2. Hệ thống phát ra sự kiện nghiệp vụ nội bộ `InventoryChangedEvent(sku, availableQty)`.
3. Worker hàng đợi BullMQ tiếp nhận sự kiện và tìm kiếm danh sách các kênh sàn TMĐT có liên kết với mã SKU này.
4. Với mỗi kênh, Worker chuẩn bị payload cập nhật tồn kho theo định dạng chuẩn của Shopee Open API hoặc TikTok Shop Open API.
5. Worker gửi yêu cầu cập nhật tồn kho sang API của sàn kèm chữ ký xác thực (Signature).
6. Sàn TMĐT trả về kết quả thành công HTTP 200.
7. Worker ghi nhận trạng thái đồng bộ thành công vào bảng `channel_sync_logs`.

### Luồng Ngoại Lệ
- **6a. Sàn TMĐT trả về mã lỗi Rate Limit (HTTP 429) hoặc mạng bị ngắt (503):** Worker tự động bắt lỗi và hoãn job lại (Delay), sau đó thử lại theo thuật toán Exponential Backoff tối đa 5 lần. Nếu sau 5 lần vẫn thất bại, hệ thống gửi thông báo cảnh báo đến Dashboard của Tenant Admin.

---

## 3. Use Case UC-003: Phân Công Xử Lý Hội Thoại & Chốt Đơn (Social Commerce Agent)

- **Actor chính:** Nhân viên trực chat (Chat Agent).
- **Tiền điều kiện:**
  - Trang Facebook Fanpage hoặc TikTok Shop đã kết nối Webhook tin nhắn.
- **Hậu điều kiện:**
  - Hội thoại được xử lý, đơn hàng phát sinh được chuyển sang trạng thái chờ đóng gói.

### Luồng Xử Lý Chính
1. Khách hàng gửi tin nhắn vào Fanpage Facebook hỏi mua sản phẩm.
2. Hệ thống tiếp nhận qua Webhook và hiển thị trên màn hình Hộp thư tập trung (Unified Inbox).
3. Nhân viên trực chat tiếp nhận cuộc trò chuyện (hoặc hệ thống tự động gán theo cơ chế luân phiên).
4. Nhân viên tư vấn sản phẩm, sử dụng danh mục tin nhắn mẫu (Quick Replies) để báo giá và chính sách giao hàng.
5. Khách hàng chốt mua và gửi địa chỉ, số điện thoại.
6. Nhân viên mở khung tạo đơn nhanh ngay bên phải màn hình chat, chọn sản phẩm, kiểm tra tồn kho, nhập thông tin giao hàng của khách.
7. Nhân viên nhấn nút "Tạo Đơn Hàng".
8. Hệ thống tạo đơn hàng, tự động gửi lại tin nhắn tóm tắt đơn hàng cho khách trong khung chat để xác nhận lần cuối.
