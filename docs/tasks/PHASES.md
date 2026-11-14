# Lộ trình 8 giai đoạn phát triển NEXORA

Tài liệu này định nghĩa chi tiết lộ trình phát triển nền tảng NEXORA qua 8 giai đoạn có tính kế thừa và kiểm chứng độc lập.

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
  - `TASK-003: Integrate Frontend Authentication & Route Protection` (Kế tiếp).

## Giai đoạn 03. Quản lý cửa hàng và Kho hàng (Stores & Inventory Core)

- **Mục tiêu**: Xây dựng phân hệ quản trị 2 cửa hàng vật lý ban đầu, liên kết kho gắn với cửa hàng và xử lý biến động tồn kho.
- **Hiện vật bàn giao**:
  - Giao diện và API quản lý thông tin cửa hàng, kho hàng.
  - Cơ chế ghi nhận phiếu nhập kho, phiếu xuất kho và phiếu chuyển kho nội bộ.
  - Xử lý khóa phân tán ngăn chặn bán vượt tồn kho.

## Giai đoạn 04. Quản lý sản phẩm và Danh mục hàng gia dụng (Product Catalog)

- **Mục tiêu**: Quản lý cây danh mục sản phẩm, biến thể sản phẩm theo kích thước, màu sắc, mã SKU và mã vạch Barcode.
- **Hiện vật bàn giao**:
  - Biểu mẫu tạo sản phẩm đa biến thể với hình ảnh và thông số kỹ thuật.
  - Công cụ tìm kiếm sản phẩm nhanh bằng mã vạch phục vụ quầy bán lẻ.
  - Cấu trúc giá bán sỉ, giá bán lẻ và giá khuyến mãi.

## Giai đoạn 05. Bán hàng tại quầy và Quản lý đơn hàng (POS & Order Lifecycle)

- **Mục tiêu**: Cung cấp giao diện màn hình thu ngân POS mượt mà và hệ thống quản trị vòng đời đơn hàng tập trung.
- **Hiện vật bàn giao**:
  - Giao diện POS tối ưu hóa cho màn hình cảm ứng, hỗ trợ quét mã vạch và in hóa đơn nhiệt.
  - Máy trạng thái quản lý đơn hàng từ lúc đặt đến khi hoàn tất hoặc hủy đơn.
  - Cơ chế tự động trừ tồn thực tế tại quầy hoặc giữ tồn đối với đơn online.

## Giai đoạn 06. Kết nối đa kênh trực tuyến (Omnichannel Integrations)

- **Mục tiêu**: Kết nối trực tiếp với Open API của Shopee, TikTok Shop và Meta (Facebook) để đồng bộ sản phẩm và kéo đơn hàng về tự động.
- **Hiện vật bàn giao**:
  - Trình quản lý kết nối và ủy quyền tài khoản gian hàng trực tuyến.
  - Worker chạy nền với BullMQ và Redis để xử lý webhook đơn hàng mới.
  - Luồng tự động đẩy số lượng tồn kho khả dụng lên các sàn theo thời gian thực.

## Giai đoạn 07. Hộp thư hội thoại tập trung (Unified Conversation Inbox)

- **Mục tiêu**: Gom toàn bộ tin nhắn và bình luận từ Facebook Fanpage, Instagram và TikTok Shop vào một giao diện làm việc duy nhất.
- **Hiện vật bàn giao**:
  - Giao diện hội thoại thời gian thực sử dụng WebSocket.
  - Công cụ tra cứu sản phẩm và tạo đơn hàng gửi khách ngay trong khung chat.
  - Phân bổ hội thoại tự động cho nhân viên trực ca.

## Giai đoạn 08. Báo cáo thông minh và Thu phí dịch vụ (BI & Subscription Billing)

- **Mục tiêu**: Cung cấp báo cáo tài chính, phân tích lợi nhuận thực tế sau khi trừ phí sàn và tự động hóa việc thu phí thuê bao phần mềm SaaS.
- **Hiện vật bàn giao**:
  - Bảng điều khiển tài chính tổng hợp doanh thu theo từng kênh và từng chi nhánh.
  - Báo cáo đối soát chi phí vận chuyển và phí sàn thương mại điện tử.
  - Cổng thanh toán quét mã VietQR tự động gia hạn gói cước SaaS.
