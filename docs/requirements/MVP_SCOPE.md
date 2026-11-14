# Phạm Vi Phiên Bản Đầu Tiên — MVP Scope

> Trạng thái thông tin: `[CONFIRMED]` cho phạm vi phục vụ khách hàng ban đầu | `[PROPOSED]` cho ranh giới In-Scope vs Out-of-Scope.

Tài liệu này xác định rõ ràng ranh giới phạm vi triển khai cho phiên bản thử nghiệm khả dụng tối thiểu (Minimum Viable Product - MVP) của NEXORA, tránh hiện tượng phình to phạm vi (Scope Creep).

---

## 1. Mục Tiêu Trọng Tâm Của Giai Đoạn MVP

MVP của NEXORA tập trung giải quyết trọn vẹn nhu cầu của khách hàng khởi đầu (kinh doanh thiết bị & đồ gia dụng, 2 cửa hàng, kênh Shopee, TikTok Shop, Facebook) đồng thời thiết lập khung kiến trúc Multi-Tenant sẵn sàng thương mại hóa.

---

## 2. Bảng Ranh Giới Tính Năng (In-Scope vs. Out-of-Scope)

| Phân Hệ Nghiệp Vụ | Trong Phạm Vi MVP (IN-SCOPE) | Ngoài Phạm Vi MVP (OUT-OF-SCOPE) |
| :--- | :--- | :--- |
| **Xác thực & Người dùng** | - Đăng nhập / Đăng xuất bằng Email/Mật khẩu.<br/>- Cơ chế JWT + Refresh Token Rotation.<br/>- 5 vai trò cơ bản (Admin, Store Manager, Cashier, Warehouse, Chat Agent). | - Đăng nhập mạng xã hội (Google/Facebook SSO).<br/>- Xác thực 2 bước (2FA / OTP qua SMS).<br/>- Đăng nhập sinh trắc học. |
| **Quản trị SaaS & Multi-Tenant** | - Khởi tạo Tenant thủ công và phân lập dữ liệu qua `tenant_id`.<br/>- Quản lý hồ sơ doanh nghiệp.<br/>- Quản lý 2 cửa hàng vật lý và 2 kho tương ứng. | - Cổng đăng ký tự phục vụ (Self-service Registration).<br/>- Tùy biến tên miền riêng cho từng khách hàng (Custom Domains).<br/>- Hóa đơn điện tử tự động kết nối cơ quan thuế. |
| **Sản phẩm & Tồn kho** | - Quản lý sản phẩm đơn lẻ và sản phẩm có biến thể (màu sắc, kích cỡ).<br/>- Quản lý mã SKU và Barcode.<br/>- Nhập kho từ nhà cung cấp kèm giá vốn.<br/>- Theo dõi tồn kho thực tế và khả dụng theo từng kho. | - Quản lý số seri / IMEI từng máy gia dụng.<br/>- Quản lý hạn sử dụng chi tiết từng lô hàng.<br/>- Tự động dự báo nhu cầu đặt hàng bằng AI. |
| **Bán hàng tại quầy (POS)** | - Giao diện POS bán hàng nhanh qua trình duyệt.<br/>- Quét mã vạch tìm kiếm sản phẩm.<br/>- Thanh toán Tiền mặt & Chuyển khoản VietQR.<br/>- In hóa đơn bán lẻ chuẩn 80mm/58mm. | - Hoạt động ngoại tuyến hoàn toàn khi mất mạng (Offline-first sync).<br/>- Tích hợp máy quẹt thẻ POS ngân hàng qua giao thức phần cứng. |
| **Đồng bộ Đa kênh (Omnichannel)**| - Kết nối 1 tài khoản Shopee và 1 tài khoản TikTok Shop qua API chính thức.<br/>- Tiếp nhận Webhook đơn hàng mới và tạo đơn trên NEXORA.<br/>- Đồng bộ số lượng tồn kho tự động 2 chiều. | - Đăng tải sản phẩm mới đồng loạt lên nhiều sàn (Mass Listing).<br/>- Tự động đồng bộ chương trình khuyến mãi/Flash Sale của sàn. |
| **Hội thoại & Social Commerce** | - Kết nối 1-2 Fanpage Facebook tiếp nhận tin nhắn Messenger.<br/>- Màn hình hộp thư tập trung hiển thị tin nhắn thời gian thực.<br/>- Tạo đơn hàng trực tiếp ngay trong màn hình chat. | - Chatbot tự động trả lời bằng AI.<br/>- Quét bình luận livestream chốt đơn tự động.<br/>- Gửi tin nhắn tiếp thị hàng loạt (Broadcast Messaging). |
| **Báo cáo & Phân tích** | - Dashboard doanh thu tổng quan hôm nay/tuần này.<br/>- Báo cáo doanh thu theo kênh bán hàng.<br/>- Báo cáo số lượng tồn kho theo sản phẩm. | - Báo cáo dòng tiền kế toán chuyên sâu (P&L, Balance Sheet).<br/>- Phân tích hành vi khách hàng RFM nâng cao. |
