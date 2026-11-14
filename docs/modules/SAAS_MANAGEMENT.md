# Phân Hệ Quản Trị Nền Tảng SaaS — SaaS Management Module

> Trạng thái thông tin: `[PROPOSED]` Khung quản trị nền tảng SaaS phục vụ thương mại hóa.

## 1. Mục Đích
Phân hệ SaaS Management cung cấp công cụ cho đơn vị chủ quản nền tảng NEXORA (Platform Owner) quản lý toàn bộ các doanh nghiệp thuê bao (Tenants), định nghĩa các gói dịch vụ (Subscription Plans) và giám sát sức khỏe vận hành toàn hệ thống.

## 2. Phạm Vi Nghiệp Vụ
- Quản lý danh mục Tenant (tạo mới, kích hoạt, khóa, mở khóa, gia hạn).
- Cấu hình gói cước và hạn mức tài nguyên (số cửa hàng, số kho, số tài khoản, số kênh kết nối).
- Giám sát chỉ số kinh doanh SaaS: Monthly Recurring Revenue (MRR), Annual Recurring Revenue (ARR), Churn Rate.

## 3. Đối Tượng Sử Dụng
- Platform Super Administrator.
- Platform Support & Operations Team.

## 4. Các Chức Năng Chính
- **Dashboard Quản Trị Nền Tảng:** Thống kê tổng số Tenant đang hoạt động, doanh thu thuê bao trong tháng, cảnh báo các Tenant sắp hết hạn gói.
- **Quản Lý Tenant:** Danh sách tìm kiếm, lọc theo trạng thái (`ACTIVE`, `TRIAL`, `SUSPENDED`). Xem chi tiết thông tin chủ shop, gói cước đang dùng và ngày hết hạn.
- **Quản Trị Gói Dịch Vụ:** Tạo và chỉnh sửa thông số gói Starter, Growth, Enterprise.
- **Thao Tác Cưỡng Chế (Platform Overrides):** Khóa tạm thời một Tenant vi phạm chính sách hoặc mở gia hạn thủ công (Manual Extension).

## 5. Quy Tắc Nghiệp Vụ (Business Rules)
- `BR-SAAS-001`: Chỉ tài khoản có vai trò `ROLE_PLATFORM_SUPER_ADMIN` mới có quyền truy cập module này.
- `BR-SAAS-002`: Khi một Tenant bị chuyển sang trạng thái `SUSPENDED`, toàn bộ người dùng thuộc Tenant đó sẽ bị từ chối truy cập API nghiệp vụ ngay lập tức.
- `BR-SAAS-003`: Không thể xóa vĩnh viễn một gói cước nếu đang có ít nhất 1 Tenant sử dụng gói đó (chỉ cho phép ẩn hoặc đánh dấu ngưng phát hành).

## 6. Dữ Liệu Liên Quan
- `tenants`, `subscription_plans`, `subscriptions`, `invoices`, `platform_audit_logs`.

## 7. Quan Hệ Với Module Khác
- Cung cấp dữ liệu định danh và trạng thái cho `AuthenticationModule` và `TenantGuard`.
- Liên kết chặt chẽ với `SubscriptionBillingModule`.

## 8. API Dự Kiến
- `GET /api/v1/saas/dashboard`: Thống kê tổng quan nền tảng.
- `GET /api/v1/saas/tenants`: Danh sách doanh nghiệp thuê bao.
- `POST /api/v1/saas/tenants`: Tạo thủ công một Tenant mới.
- `PATCH /api/v1/saas/tenants/{id}/status`: Khóa hoặc kích hoạt lại Tenant.
- `GET /api/v1/saas/plans`: Danh mục các gói cước.

## 9. Quyền Truy Cập
- Bắt buộc vai trò: `ROLE_PLATFORM_SUPER_ADMIN`.
- Quyền: `saas:manage_tenants`, `saas:manage_plans`, `saas:view_analytics`.

## 10. Các Trường Hợp Biên (Edge Cases)
- Tenant bị khóa do quá hạn thanh toán nhưng đang có đơn hàng từ Shopee bắn về qua Webhook: Hệ thống vẫn lưu đơn vào cơ sở dữ liệu để tránh mất dữ liệu bán lẻ của khách, nhưng nhân viên không thể đăng nhập xử lý cho đến khi thanh toán cước.

## 11. Tiêu Chí Nghiệm Thu (Acceptance Criteria)
- Super Admin khóa Tenant A thành công -> Nhân viên Tenant A đang đăng nhập trên trình duyệt lập tức bị điều hướng về màn hình thông báo: *"Tài khoản doanh nghiệp tạm thời bị khóa. Vui lòng liên hệ bộ phận hỗ trợ."*

## 12. Những Điểm Cần Xác Nhận Với Khách Hàng `[UNDECIDED]`
- Quy định thời gian lưu trữ dữ liệu của Tenant sau khi hủy hợp đồng (30 ngày hay 90 ngày trước khi xóa vĩnh viễn khỏi DB)?
- Chính sách hoàn tiền khi Tenant hủy gói dịch vụ giữa chừng?
