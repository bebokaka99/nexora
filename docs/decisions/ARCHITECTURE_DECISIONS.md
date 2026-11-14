# Nhật ký quyết định kiến trúc (Architectural Decision Records - ADR)

> Trạng thái thông tin: `[CONFIRMED]` Nhật ký chính thức ghi nhận các quyết định kiến trúc của NEXORA.

Tài liệu này lưu trữ các quyết định kiến trúc quan trọng, lý do lựa chọn và các đánh đổi kỹ thuật được chấp nhận trong quá trình phát triển nền tảng.

---

## ADR-001: Lựa chọn kiến trúc Modular Monolith thay vì Microservices

- **Trạng thái**: Đã chấp thuận (`ACCEPTED`).
- **Ngày quyết định**: 2025-01-10.
- **Bối cảnh**: NEXORA phục vụ 2 cửa hàng gia dụng ban đầu kết hợp bán đa kênh online và chuẩn bị mở rộng SaaS. Đội ngũ kỹ sư cần tối ưu tốc độ phát triển và tiết kiệm chi phí máy chủ hạ tầng.
- **Quyết định**: Xây dựng toàn bộ hệ thống backend bằng một ứng dụng NestJS Modular Monolith duy nhất. Các module (Auth, Store, Product, Inventory, Order, Omnichannel) giữ ranh giới dữ liệu và giao tiếp qua Service công khai hoặc Domain Events.
- **Hệ quả**:
  - Tích cực: Đơn giản hóa việc triển khai bằng Docker Compose, giao dịch dữ liệu ACID an toàn và không tốn chi phí vận hành mạng vi dịch vụ.
  - Đánh đổi: Nếu một module bị rò rỉ bộ nhớ, toàn bộ ứng dụng Monolith có thể bị ảnh hưởng. Cần giám sát chặt chẽ tài nguyên bộ nhớ.

---

## ADR-002: Lựa chọn mô hình Multi-Tenant Shared Database, Shared Schema

- **Trạng thái**: Đã chấp thuận (`ACCEPTED`).
- **Ngày quyết định**: 2025-01-12.
- **Bối cảnh**: Nền tảng cần phục vụ hàng trăm đến hàng nghìn doanh nghiệp vừa và nhỏ với chi phí vận hành cơ sở dữ liệu tiết kiệm nhất.
- **Quyết định**: Sử dụng mô hình một cơ sở dữ liệu PostgreSQL duy nhất, chia sẻ chung một Schema. Mọi bảng nghiệp vụ đều có cột `tenant_id` làm khóa ngoại kết hợp đánh chỉ mục `(tenant_id, id)` và áp dụng PostgreSQL Row-Level Security (RLS).
- **Hệ quả**:
  - Tích cực: Chi phí vận hành database thấp, việc chạy Prisma migration diễn ra đồng loạt trong một lệnh duy nhất.
  - Đánh đổi: Cần kiểm tra nghiêm ngặt mọi câu truy vấn ở tầng backend để không bỏ quên điều kiện lọc `tenant_id`.

---

## ADR-003: Xử lý tác vụ tích hợp bên ngoài bằng hàng đợi BullMQ và Redis

- **Trạng thái**: Đã chấp thuận (`ACCEPTED`).
- **Ngày quyết định**: 2025-01-15.
- **Bối cảnh**: Việc gọi API đến Shopee, TikTok Shop, Meta và các đơn vị giao vận tiềm ẩn nguy cơ độ trễ cao, lỗi mạng và giới hạn tần suất gọi API (Rate Limit).
- **Quyết định**: Toàn bộ thao tác gọi API bên ngoài và xử lý Webhook gửi đến đều được đẩy vào hàng đợi BullMQ lưu trên Redis để Worker chạy nền xử lý bất đồng bộ.
- **Hệ quả**:
  - Tích cực: Người dùng tại quầy POS không bị treo màn hình khi thanh toán. Hệ thống có khả năng tự động thử lại khi sàn TMĐT bị nghẽn mạng.
  - Đánh đổi: Cần duy trì cụm Redis hoạt động liên tục và theo dõi dung lượng RAM của Redis.
