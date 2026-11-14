# Danh Mục Yêu Cầu Phi Chức Năng — Non-Functional Requirements

> Trạng thái thông tin: `[PROPOSED]` Tiêu chuẩn kỹ thuật áp dụng cho toàn bộ nền tảng NEXORA.

Các yêu cầu phi chức năng (NFR) xác định các ràng buộc chất lượng của hệ thống, bao gồm bảo mật, hiệu năng, khả năng mở rộng, độ sẵn sàng và tính tương thích.

---

## 1. Bảo Mật & Cách Ly Dữ Liệu (Security & Data Isolation)

| ID | Tiêu Chí | Yêu Cầu Kỹ Thuật | Phương Pháp Đo Lường / Kiểm Thử |
| :--- | :--- | :--- | :--- |
| `NFR-SEC-001` | Cô lập dữ liệu Multi-Tenant | Dữ liệu của mỗi Tenant phải được phân lập tuyệt đối bằng `tenant_id` và Row-Level Security ở tầng PostgreSQL. Tuyệt đối không cho phép truy vấn không có bộ lọc Tenant. | Kiểm thử tự động E2E với nhiều user thuộc các Tenant khác nhau. |
| `NFR-SEC-002` | Mã hóa dữ liệu đường truyền | 100% kết nối giữa Client và Server bắt buộc sử dụng giao thức HTTPS (TLS 1.3) và WSS (Secure WebSocket). | Đánh giá chứng chỉ SSL và kiểm tra HTTP Strict Transport Security (HSTS). |
| `NFR-SEC-003` | Quản lý mật khẩu an toàn | Mật khẩu người dùng phải được mã hóa bằng thuật toán `bcrypt` với cost factor tối thiểu là 10; không bao giờ lưu trữ mật khẩu dưới dạng văn bản thô (Plaintext). | Review mã nguồn và database inspection. |
| `NFR-SEC-004` | Xác thực JWT & Rotation | Access Token có thời hạn ngắn (15 phút), Refresh Token có thời hạn 7 ngày và được lưu vết trong Redis. Áp dụng Refresh Token Rotation để phát hiện tái sử dụng trái phép. | Kiểm thử kịch bản token replay attack. |
| `NFR-SEC-005` | Nhật ký kiểm toán (Audit Logging) | Mọi hành vi nhạy cảm (thay đổi giá sản phẩm, xóa đơn hàng, điều chỉnh số lượng tồn kho, cấp quyền vai trò) đều phải được ghi lại nhật ký gồm: Ai, Làm gì, Vào lúc nào, IP nào. | Kiểm tra bảng `audit_logs` khi thực hiện các tác vụ quản trị. |

---

## 2. Hiệu Năng & Độ Trễ (Performance & Latency)

| ID | Tiêu Chí | Yêu Cầu Kỹ Thuật | Phương Pháp Đo Lường / Kiểm Thử |
| :--- | :--- | :--- | :--- |
| `NFR-PERF-001` | Thời gian phản hồi API | Thời gian phản hồi trung bình (p95) cho các truy vấn dữ liệu thông thường phải < 200ms; với các API phức tạp (báo cáo doanh thu) phải < 1000ms. | Đo kiểm bằng k6 hoặc Apache JMeter tại mức tải 200 RPS. |
| `NFR-PERF-002` | Tốc độ tìm kiếm tại quầy POS | Thao tác tìm kiếm sản phẩm bằng mã vạch (Barcode Scanner) tại màn hình POS phải hiển thị kết quả trong vòng < 50ms. | Đo bằng công cụ Performance Profiler trên trình duyệt. |
| `NFR-PERF-003` | Tốc độ render giao diện (Core Web Vitals) | Điểm Largest Contentful Paint (LCP) của trang quản trị < 2.5 giây, First Input Delay (FID) < 100ms trên đường truyền internet tiêu chuẩn. | Kiểm tra bằng Google Lighthouse và Chrome DevTools. |
| `NFR-PERF-004` | Tối ưu hóa truy vấn Database | 100% các cột tham gia vào mệnh đề `WHERE`, `JOIN` và lọc theo `tenant_id` đều phải được đánh chỉ mục (Index); không chấp nhận truy vấn Seq Scan trên bảng có > 10,000 dòng. | Chạy `EXPLAIN ANALYZE` định kỳ trên staging. |

---

## 3. Khả Năng Mở Rộng & Chịu Tải (Scalability)

| ID | Tiêu Chí | Yêu Cầu Kỹ Thuật | Phương Pháp Đo Lường / Kiểm Thử |
| :--- | :--- | :--- | :--- |
| `NFR-SCA-001` | Kiến trúc Modular Monolith linh hoạt | Các module trong NestJS phải duy trì tính ghép nối lỏng (Loose Coupling), giao tiếp qua Service interface công khai để sẵn sàng tách thành Microservices độc lập khi cần. | Phân tích phụ thuộc mã nguồn (Dependency Graph). |
| `NFR-SCA-002` | Xử lý bất đồng bộ qua Queue | Các tác vụ nặng (đồng bộ sản phẩm sàn, tạo phiếu in hàng loạt, gửi thông báo) bắt buộc xử lý qua hàng đợi BullMQ và Redis worker, không gây nghẽn tiến trình HTTP chính. | Kiểm tra thời gian phản hồi API khi hàng đợi có 10,000 jobs. |
| `NFR-SCA-003` | Khả năng mở rộng chiều ngang (Stateless Backend) | Máy chủ NestJS được thiết kế hoàn toàn Stateless (không lưu session trong bộ nhớ local), cho phép nhân bản nhiều instance chạy sau Nginx Load Balancer. | Kiểm tra cân bằng tải giữa 2 instance NestJS. |

---

## 4. Độ Sẵn Sàng & Tin Cậy (Reliability & Availability)

| ID | Tiêu Chí | Yêu Cầu Kỹ Thuật | Phương Pháp Đo Lường / Kiểm Thử |
| :--- | :--- | :--- | :--- |
| `NFR-REL-001` | Cam kết thời gian hoạt động (SLA) | Tỷ lệ sẵn sàng phục vụ của hệ thống đạt tối thiểu **99.9%** (tổng thời gian ngừng hoạt động không theo kế hoạch không quá 43 phút/tháng). | Giám sát Uptime thông qua công cụ Uptime Kuma hoặc Better Stack. |
| `NFR-REL-002` | Chiến lược sao lưu dữ liệu (Backup & Recovery) | Cơ sở dữ liệu PostgreSQL được sao lưu tự động hàng ngày (Daily Full Backup) và lưu trữ bản ghi WAL (Write-Ahead Logging) cho phép khôi phục dữ liệu về bất kỳ thời điểm nào trong 7 ngày gần nhất (Point-in-Time Recovery - PITR). | Kiểm thử kịch bản diễn tập phục hồi dữ liệu từ bản backup hàng tháng. |
| `NFR-REL-003` | Chống chịu lỗi từ sàn TMĐT | Khi API của Shopee hoặc TikTok Shop bị lỗi hoặc quá tải (Rate Limit), hệ thống áp dụng cơ chế Retry với Exponential Backoff và Circuit Breaker, không làm sập tiến trình đồng bộ chung. | Giả lập mã lỗi 429 và 503 từ mock sàn TMĐT. |
