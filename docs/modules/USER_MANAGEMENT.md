# Phân Hệ Quản Lý Người Dùng & Nhân Sự — User Management Module

> Trạng thái thông tin: `[CONFIRMED]` cho quản lý nhân sự 2 cửa hàng | `[PROPOSED]` cho RBAC linh hoạt.

## 1. Mục Đích
Phân hệ User Management cho phép chủ doanh nghiệp quản lý danh sách nhân viên, phân công công việc theo từng chi nhánh/cửa hàng và thiết lập phân quyền truy cập chức năng.

## 2. Phạm Vi Nghiệp Vụ
- Tạo tài khoản nhân viên mới, cập nhật thông tin cá nhân.
- Khóa/Mở khóa tài khoản nhân viên (khi nhân viên nghỉ việc hoặc chuyển công tác).
- Phân công chi nhánh làm việc cố định hoặc luân chuyển.
- Gán vai trò (Roles) và quyền hạn (Permissions) cho nhân viên.

## 3. Đối Tượng Sử Dụng
- Tenant Administrator.
- Store Manager (giới hạn quyền xem danh sách nhân viên chi nhánh mình).

## 4. Các Chức Năng Chính
- **Danh Sách Nhân Sự:** Tìm kiếm theo tên, số điện thoại, lọc theo vai trò (Thu ngân, Thủ kho, Quản lý chi nhánh) hoặc theo cửa hàng làm việc.
- **Tạo Tài Khoản Mới:** Nhập họ tên, email, mật khẩu khởi tạo, chọn cửa hàng công tác và gán vai trò.
- **Phân Quyền Vai Trò:** Tùy biến quyền hạn hoặc gán các vai trò mẫu có sẵn.
- **Đặt Lại Mật Khẩu Cho Nhân Viên:** Cho phép Admin tạo mật khẩu mới cho thu ngân khi quên.

## 5. Quy Tắc Nghiệp Vụ (Business Rules)
- `BR-USER-001`: Email nhân viên là duy nhất trong phạm vi Tenant.
- `BR-USER-002`: Không thể xóa hoàn toàn tài khoản nhân viên nếu người đó đã từng thực hiện tạo đơn hàng hoặc lập phiếu kho (chỉ được phép chuyển sang trạng thái `INACTIVE` để bảo tồn lịch sử đối soát).
- `BR-USER-003`: Tổng số nhân viên đang `ACTIVE` không được vượt quá giới hạn gói cước.

## 6. Dữ Liệu Liên Quan
- `users`, `roles`, `permissions`, `user_roles`, `stores`, `tenants`.

## 7. Quan Hệ Với Module Khác
- Cung cấp thông tin nhân sự cho `StoreManagementModule`, `OrderManagementModule` (người tạo đơn) và `AuditLogModule`.

## 8. API Dự Kiến
- `GET /api/v1/users`: Danh sách nhân viên trong doanh nghiệp.
- `POST /api/v1/users`: Tạo tài khoản nhân viên mới.
- `GET /api/v1/users/{id}`: Chi tiết nhân viên.
- `PATCH /api/v1/users/{id}`: Cập nhật thông tin / vai trò / cửa hàng.
- `PATCH /api/v1/users/{id}/status`: Kích hoạt hoặc vô hiệu hóa tài khoản.
- `POST /api/v1/users/{id}/reset-password`: Đặt lại mật khẩu.

## 9. Quyền Truy Cập
- Yêu cầu quyền: `users:read`, `users:create`, `users:update`, `users:delete`, `roles:manage`.
- Chỉ vai trò `ROLE_TENANT_ADMIN` mới có toàn quyền thao tác.

## 10. Các Trường Hợp Biên (Edge Cases)
- Vô hiệu hóa tài khoản của một thu ngân đang trong ca làm việc: Hệ thống lập tức hủy phiên truy cập của thu ngân đó; các đơn hàng đã tạo trước đó vẫn giữ nguyên vẹn.

## 11. Tiêu Chí Nghiệm Thu (Acceptance Criteria)
- Admin gán vai trò "Thu ngân" cho nhân viên A -> Nhân viên A đăng nhập chỉ thấy màn hình POS và danh mục đơn hàng của quầy, hoàn toàn bị ẩn mục Cài đặt doanh nghiệp và Báo cáo tài chính.

## 12. Những Điểm Cần Xác Nhận Với Khách Hàng `[UNDECIDED]`
- Có cần quản lý lịch chấm công, chia ca làm việc và tính hoa hồng/thưởng theo doanh số bán lẻ cho nhân viên trong hệ thống NEXORA không?
