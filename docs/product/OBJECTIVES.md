# Mục Tiêu Dự Án — NEXORA Objectives

> Trạng thái thông tin: `[CONFIRMED]` cho mục tiêu doanh nghiệp khởi đầu | `[PROPOSED]` cho chỉ số đo lường hiệu năng kỹ thuật và kinh doanh.

## 1. Mục Tiêu Kinh Doanh (Business Objectives)

1. **Tự chủ công nghệ `[CONFIRMED]`:** Thay thế hoàn toàn phần mềm thuê ngoài hiện tại bằng hệ thống NEXORA tự phát triển, chấm dứt phụ thuộc vào nhà cung cấp bên thứ ba.
2. **Tối ưu chi phí vận hành:** Cắt giảm ít nhất 30% chi phí bản quyền phần mềm và phí kết nối kênh bán hàng so với phương án thuê ngoài hiện tại.
3. **Thương mại hóa giải pháp SaaS `[CONFIRMED]`:** Đóng gói hệ thống thành sản phẩm SaaS đa người dùng, sẵn sàng mở bán gói thuê bao cho các doanh nghiệp bán lẻ khác trong vòng 6 tháng kể từ khi hệ thống vận hành ổn định.
4. **Tăng trưởng năng suất bán hàng:** Giảm 50% thời gian xử lý đơn hàng đa kênh và tăng 25% tỷ lệ chốt đơn thành công từ các cuộc hội thoại trên Facebook/TikTok Shop nhờ hộp thư tập trung.

---

## 2. Mục Tiêu Sản Phẩm (Product Objectives)

1. **Quản lý đa kênh hợp nhất:** Kết nối thông suốt tối thiểu 3 kênh trực tuyến trọng điểm (Facebook, TikTok Shop, Shopee) và 2 cửa hàng vật lý.
2. **Đồng bộ thời gian thực (Near Real-time Sync):**
   - Đơn hàng mới từ sàn TMĐT đồng bộ về NEXORA trong vòng tối đa 30 giây kể từ khi nhận webhook.
   - Số lượng tồn kho biến động được phản ánh và cập nhật ngược lại lên các sàn trong vòng 60 giây để ngăn chặn tình trạng bán quá tồn (overselling).
3. **Hộp thư hội thoại tập trung (Unified Inbox):** Tập hợp tin nhắn và bình luận từ nhiều trang Facebook Fanpage và TikTok Shop vào một màn hình duy nhất, hỗ trợ gắn thẻ (tagging), phân công nhân viên và tạo đơn hàng chỉ trong 3 cú nhấp chuột.
4. **Vận hành cửa hàng (POS) tin cậy:** Giao diện POS mượt mà, hỗ trợ tìm kiếm sản phẩm bằng mã vạch, quét barcode, tính tiền, in hóa đơn nhanh chóng.

---

## 3. Mục Tiêu Kỹ Thuật (Technical Objectives)

1. **Kiến trúc Modular Monolith chuẩn mực:** Hệ thống được tổ chức thành các module có ranh giới rõ ràng, dễ bảo trì, dễ kiểm thử và có khả năng tách rời thành Microservices trong tương lai khi lưu lượng tăng trưởng vượt bậc.
2. **Multi-Tenancy cách ly an toàn:** Đảm bảo 100% dữ liệu giữa các doanh nghiệp (Tenant) được cô lập triệt để ở tầng cơ sở dữ liệu. Không xảy ra bất kỳ lỗi rò rỉ dữ liệu chéo (Zero Data Leakage).
3. **Hiệu năng và độ sẵn sàng cao:**
   - Thời gian phản hồi API trung bình (p95) < 200ms cho các tác vụ nghiệp vụ thông thường.
   - Hỗ trợ tải đồng thời tối thiểu 500 yêu cầu/giây (500 RPS) trên một cụm máy chủ tiêu chuẩn.
   - Tỷ lệ thời gian hoạt động (Availability SLA) đạt 99.9%.
4. **Khả năng chịu lỗi và tự hồi phục:** Tích hợp cơ chế hàng đợi xử lý nền (BullMQ) với cơ chế Retry có Exponential Backoff cho tất cả các kết nối API sàn TMĐT bên thứ ba.

---

## 4. Mục Tiêu Giai Đoạn MVP (Minimum Viable Product Scope)

- **Mục tiêu 1:** Hoàn thiện bản **NEXORA Visual Demo (TASK-001)** để thống nhất toàn bộ ngôn ngữ thiết kế, bố cục Dashboard, cấu trúc menu điều hướng và trải nghiệm người dùng với các bên liên quan.
- **Mục tiêu 2:** Triển khai luồng nghiệp vụ cốt lõi: Đăng nhập/Phân quyền (RBAC) -> Quản lý sản phẩm & biến thể -> Quản lý kho & tồn kho -> Tạo đơn hàng tại quầy (POS) -> Xem báo cáo doanh thu cơ bản.
- **Mục tiêu 3:** Kết nối thử nghiệm thành công 1 kênh Shopee hoặc Facebook để kiểm chứng cơ chế đồng bộ đơn hàng và tồn kho trước khi mở rộng toàn diện.
