# Lộ trình phát triển NEXORA (8 giai đoạn + Phase 06.5 củng cố nền tảng)

Tài liệu này định nghĩa chi tiết lộ trình phát triển nền tảng NEXORA qua 8 giai đoạn có tính kế thừa và kiểm chứng độc lập, cộng thêm Phase 06.5 chèn giữa Phase 06 và Phase 07.

## Quyết định đổi ưu tiên ngày 16/11/2026 — Củng cố nền trước, thêm tính năng sau

> **Căn cứ kiểm chứng**: Rà soát repo `bebokaka99/nexora` ngày 16/11/2026, commit `08b9602`. TASK-001 đến TASK-008 ghi DONE (Phase 01–06), Phase 07 Unified Inbox và Phase 08 BI & Billing chưa bắt đầu. Nhưng kiểm chứng thực tế cho thấy nền chưa vững: chưa có migration Prisma, backend có fallback in-memory, `infrastructure/` chỉ có README (không Docker/CI), tích hợp sàn thật chưa có, tài khoản demo hardcode trong `auth.service.ts`.

User đã chấp nhận hướng đổi ưu tiên: **củng cố nền trước, thêm tính năng sau**. Vì vậy lộ trình chèn thêm **Phase 06.5 — Foundation Hardening** ngay sau Phase 06 và trước Phase 07/08. Phase 07/08 **lùi lại** và chỉ bắt đầu khi đạt Definition of Done của Phase 06.5 (xem mục Phase 06.5). Không xóa lịch sử TASK-001..008 và không sửa trạng thái DONE của chúng; chỉ Phase 06 được ghi chú thêm là "DONE một phần".

## Giai đoạn 01. Nền tảng và Bản mẫu trực quan (Foundation & Visual Demo)

- **Mục tiêu**: Xây dựng cấu trúc dự án chuẩn mực, thiết lập cơ sở dữ liệu PostgreSQL với Prisma và tạo bản Demo giao diện tương tác hoàn chỉnh.
- **Hiện vật bàn giao**: 
  - Khung dự án NestJS backend và Next.js 15 frontend hoạt động ổn định.
  - Lược đồ Prisma Schema cho toàn bộ các thực thể cốt lõi.
  - Bản Visual Demo tương tác trực quan mô phỏng dòng chảy nghiệp vụ từ POS đến đồng bộ sàn.
- **Nhiệm vụ trọng tâm**: `TASK-001: Build NEXORA Visual Demo`.

## Giai đoạn 02. Xác thực và Quản trị Tenant (Authentication & Multi-Tenancy)

- **Mục tiêu**: Thiết lập cơ chế đăng ký tenant, đăng nhập đa nhân sự, luân chuyển JWT, phân quyền theo vai trò (RBAC) và tích hợp hoàn chỉnh luồng xác thực vào giao diện người dùng.
- **Hiện vật bàn giao**:
  - Tầng Backend: API tạo Tenant, đăng nhập, cấp Access/Refresh Token và Guard cô lập dữ liệu doanh nghiệp (`TASK-002`).
  - Tầng Frontend: Màn hình Đăng nhập (`/login`), Đăng ký (`/register`), cơ chế lưu trữ Token an toàn và bảo vệ các trang Dashboard, POS (`TASK-003`).
- **Nhiệm vụ trọng tâm**:
  - `TASK-002: Implement Auth & Multi-Tenancy Backend Core` (Đã hoàn thành).
  - `TASK-003: Integrate Frontend Authentication & Route Protection` (Đã hoàn thành).

## Giai đoạn 03. Quản lý cửa hàng và Kho hàng (Stores & Inventory Core)

- **Mục tiêu**: Xây dựng phân hệ quản trị 2 cửa hàng vật lý ban đầu, liên kết kho gắn với cửa hàng và xử lý biến động tồn kho.
- **Hiện vật bàn giao**:
  - Giao diện và API quản lý thông tin cửa hàng, kho hàng (`TASK-004`).
  - Cơ chế ghi nhận phiếu nhập kho, phiếu xuất kho và phiếu chuyển kho nội bộ.
  - Xử lý khóa phân tán ngăn chặn bán vượt tồn kho.
- **Nhiệm vụ trọng tâm**:
  - `TASK-004: Implement Stores & Warehouses Core` (Đã hoàn thành).
  - `TASK-005: Implement Inventory Management & Stock Transfers` (Đã hoàn thành).

## Giai đoạn 04. Quản lý sản phẩm và Danh mục hàng gia dụng (Product Catalog)

- **Mục tiêu**: Quản lý cây danh mục sản phẩm, biến thể sản phẩm theo kích thước, màu sắc, mã SKU và mã vạch Barcode.
- **Hiện vật bàn giao**:
  - Biểu mẫu tạo sản phẩm đa biến thể với hình ảnh và thông số kỹ thuật.
  - Công cụ tìm kiếm sản phẩm nhanh bằng mã vạch phục vụ quầy bán lẻ.
  - Cấu trúc giá bán sỉ, giá bán lẻ và giá khuyến mãi.
- **Nhiệm vụ trọng tâm**:
  - `TASK-006: Implement Product Catalog & Multi-Variants Management` (Đã hoàn thành).

## Giai đoạn 05. Bán hàng tại quầy và Quản lý đơn hàng (POS & Order Lifecycle)

- **Mục tiêu**: Cung cấp giao diện màn hình thu ngân POS mượt mà và hệ thống quản trị vòng đời đơn hàng tập trung.
- **Hiện vật bàn giao**:
  - Giao diện POS tối ưu hóa cho màn hình cảm ứng, hỗ trợ quét mã vạch và in hóa đơn nhiệt.
  - Máy trạng thái quản lý đơn hàng từ lúc đặt đến khi hoàn tất hoặc hủy đơn.
  - Cơ chế tự động trừ tồn thực tế tại quầy hoặc giữ tồn đối với đơn online.
- **Nhiệm vụ trọng tâm**:
  - `TASK-007: Implement POS Terminal & Unified Order Management Lifecycle` (Đã hoàn thành).

## Giai đoạn 06. Kết nối đa kênh trực tuyến (Omnichannel Integrations) — DONE một phần, cần hoàn thiện

- **Mục tiêu**: Kết nối trực tiếp với Open API của Shopee, TikTok Shop và Meta (Facebook) để đồng bộ sản phẩm và kéo đơn hàng về tự động.
- **Hiện vật bàn giao**:
  - Trình quản lý kết nối và ủy quyền tài khoản gian hàng trực tuyến.
  - Worker chạy nền với BullMQ và Redis để xử lý webhook đơn hàng mới.
  - Luồng tự động đẩy số lượng tồn kho khả dụng lên các sàn theo thời gian thực.
- **Trạng thái cập nhật ngày 16/11/2026 — DONE một phần**: `TASK-008` giữ trạng thái DONE cho phần đã làm (CRUD kết nối kênh, API, giao diện tab "Kênh Bán Hàng"), nhưng kiểm chứng repo ngày 16/11/2026 (commit `08b9602`) cho thấy hiện trạng chỉ là CRUD kết nối + cập nhật mốc `lastSyncAt` — chưa có lời gọi API sàn thật, chưa có BullMQ/Redis worker. Phần tích hợp sàn thật chuyển sang `TASK-013` trong Phase 06.5 và **phải xong trước khi làm Phase 07/08**.

## Giai đoạn 06.5. Củng cố nền tảng (Foundation Hardening) — Ưu tiên cao nhất, làm trước Phase 07/08

- **Mục tiêu**: Đưa nền tảng từ "chạy được bằng dữ liệu giả" sang "chạy được bằng dữ liệu thật, tái lập được, kiểm soát được" trước khi thêm tính năng mới. Đây là giai đoạn bắt buộc, không phải giai đoạn tùy chọn.
- **Hiện vật bàn giao**:
  - Migration Prisma đầu tiên chạy được trên PostgreSQL thật; backend không còn fallback in-memory ở các module lõi (`TASK-009`).
  - Docker/CI: `docker-compose.yml`, `Dockerfile` backend/frontend, `.env.example`, GitHub Actions chạy lint/build/test trên mọi PR (`TASK-010`).
  - Tài khoản demo hardcode được gỡ khỏi `auth.service.ts` và trang đăng nhập (`TASK-011`).
  - Dashboard 130KB (2.602 dòng) được tách thành route/component; sửa xong lỗi FE P0: dark mode dashboard, animation `animate-in` chết, nâng cấp Next khỏi CVE-2025-66478, gỡ demo khỏi login, thống nhất accent emerald-600 `#059669` (`TASK-012`).
  - Tích hợp sàn thật: spike Shopee/TikTok Shop API + BullMQ/Redis worker, ít nhất một luồng end-to-end thật chạy được trên sandbox (`TASK-013` — đồng thời hoàn thiện phần còn thiếu của Phase 06).
- **Nhiệm vụ trọng tâm**:
  - `TASK-009: Prisma Migration Đầu Tiên & PostgreSQL Thật, Bỏ Dần Fallback In-Memory` (P0).
  - `TASK-010: Docker, docker-compose & CI (GitHub Actions)` (P0).
  - `TASK-011: Gỡ Tài Khoản Demo Hardcode Khỏi Auth & Trang Đăng Nhập` (P0).
  - `TASK-012: Tách Dashboard 130KB & Sửa Lỗi Frontend Ưu Tiên P0` (P0).
  - `TASK-013: Tích Hợp Sàn Thật — Spike Shopee/TikTok Shop API + BullMQ/Redis Worker` (P1, hoàn thiện Phase 06).
- **Definition of Done của Phase 06.5 (điều kiện vào Phase 07/08)** — tất cả các điểm sau phải đạt, không được bỏ qua điểm nào:
  1. Migration Prisma đầu tiên chạy được trên database trống; `prisma migrate status` không còn migration chờ.
  2. Backend chạy với PostgreSQL thật, không còn fallback in-memory ở các module lõi; backend dừng khởi động (fail-fast) khi `DATABASE_URL` sai/thiếu thay vì rơi về dữ liệu giả.
  3. CI xanh: workflow GitHub Actions chạy lint/build/test trên mọi PR; `docker compose up` trên máy sạch đưa cả hệ thống lên hoạt động.
  4. Dashboard đã tách (file lớn nhất dưới 500 dòng) và dark mode hiển thị đúng trên toàn bộ dashboard.
  5. Tài khoản demo hardcode đã gỡ khỏi code và trang đăng nhập; Next đã nâng cấp khỏi CVE-2025-66478.
  6. Ít nhất một luồng end-to-end thật chạy được: đổi tồn kho trong NEXORA → tồn kho trên sàn (sandbox) cập nhật theo, hoặc đơn mới trên sàn → đơn xuất hiện trong NEXORA.

## Giai đoạn 07. Hộp thư hội thoại tập trung (Unified Conversation Inbox) — Chưa bắt đầu, lùi sau Phase 06.5

> **Điều kiện vào**: Chỉ bắt đầu khi đạt toàn bộ Definition of Done của Phase 06.5 (xem mục Phase 06.5). Lý do: Unified Inbox cần webhook/đơn hàng thật và dữ liệu bền vững — xây trên nền fallback in-memory và đồng bộ giả sẽ phải làm lại.

- **Mục tiêu**: Gom toàn bộ tin nhắn và bình luận từ Facebook Fanpage, Instagram và TikTok Shop vào một giao diện làm việc duy nhất.
- **Hiện vật bàn giao**:
  - Giao diện hội thoại thời gian thực sử dụng WebSocket.
  - Công cụ tra cứu sản phẩm và tạo đơn hàng gửi khách ngay trong khung chat.
  - Phân bổ hội thoại tự động cho nhân viên trực ca.

## Giai đoạn 08. Báo cáo thông minh và Thu phí dịch vụ (BI & Subscription Billing) — Chưa bắt đầu, lùi sau Phase 06.5

> **Điều kiện vào**: Chỉ bắt đầu khi đạt toàn bộ Definition of Done của Phase 06.5 (xem mục Phase 06.5). Lý do: báo cáo doanh thu/lợi nhuận và thu phí SaaS chỉ có ý nghĩa khi số liệu đến từ đơn hàng và đồng bộ thật, trên database thật.

- **Mục tiêu**: Cung cấp báo cáo tài chính, phân tích lợi nhuận thực tế sau khi trừ phí sàn và tự động hóa việc thu phí thuê bao phần mềm SaaS.
- **Hiện vật bàn giao**:
  - Bảng điều khiển tài chính tổng hợp doanh thu theo từng kênh và từng chi nhánh.
  - Báo cáo đối soát chi phí vận chuyển và phí sàn thương mại điện tử.
  - Cổng thanh toán quét mã VietQR tự động gia hạn gói cước SaaS.
