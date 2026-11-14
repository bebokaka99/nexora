# Phân Hệ Quản Lý Doanh Nghiệp — Tenant Management Module

> Trạng thái thông tin: `[CONFIRMED]` cho mô hình Tenant -> Store -> Warehouse | `[PROPOSED]` cho cấu hình thương hiệu đa chi nhánh.

## 1. Mục Đích
Phân hệ Tenant Management quản lý toàn bộ vòng đời của một doanh nghiệp bán lẻ trên nền tảng NEXORA, lưu trữ hồ sơ công ty, cấu hình các tham số vận hành chung và đảm bảo cách ly dữ liệu.

## 2. Phạm Vi Nghiệp Vụ
- Thiết lập thông tin doanh nghiệp (Tên công ty, Logo, Địa chỉ, Mã số thuế, Hotline).
- Cấu hình quy tắc bán hàng chung (cho phép bán âm kho hay không, quy cách in hóa đơn).
- Quản lý hạn mức tài nguyên đã sử dụng so với gói cước thuê bao.

## 3. Đối Tượng Sử Dụng
- Tenant Administrator (Chủ doanh nghiệp bán lẻ).
- Platform Super Administrator.

## 4. Các Chức Năng Chính
- **Hồ Sơ Doanh Nghiệp:** Cập nhật thông tin công ty hiển thị trên hóa đơn và chứng từ xuất kho.
- **Cấu Hình Hệ Thống:** Bật/tắt các tính năng đồng bộ tồn kho tự động, cấu hình thời gian giữ đơn hàng từ mạng xã hội.
- **Thống Kê Tài Nguyên Sử Dụng:** Xem số cửa hàng đã tạo (e.g. 2/3), số kho (e.g. 2/3), số lượng tài khoản nhân viên (e.g. 6/10) theo gói cước.

## 5. Quy Tắc Nghiệp Vụ (Business Rules)
- `BR-TENANT-001`: Mã `slug` (subdomain) của Tenant là duy nhất trên toàn hệ thống và không thể thay đổi sau khi tạo.
- `BR-TENANT-002`: Không thể tạo thêm Cửa hàng hoặc Tài khoản nhân viên mới nếu số lượng đã chạm mức trần của gói cước đang thuê.
- `BR-TENANT-003`: Mọi thao tác chỉnh sửa hồ sơ doanh nghiệp đều được ghi lại trong nhật ký kiểm toán.

## 6. Dữ Liệu Liên Quan
- `tenants`, `stores`, `warehouses`, `users`, `subscriptions`.

## 7. Quan Hệ Với Module Khác
- Là thực thể cha của `StoreManagementModule`, `UserManagementModule`, `ProductManagementModule`.

## 8. API Dự Kiến
- `GET /api/v1/tenant/profile`: Lấy thông tin chi tiết doanh nghiệp hiện tại.
- `PATCH /api/v1/tenant/profile`: Cập nhật thông tin doanh nghiệp.
- `GET /api/v1/tenant/usage`: Xem định mức tài nguyên đã sử dụng.
- `PATCH /api/v1/tenant/settings`: Cập nhật cấu hình vận hành nội bộ.

## 9. Quyền Truy Cập
- Yêu cầu quyền: `tenant:manage_profile`, `tenant:view_settings`, `tenant:update_settings`.
- Chỉ vai trò `ROLE_TENANT_ADMIN` mới có toàn quyền thao tác.

## 10. Các Trường Hợp Biên (Edge Cases)
- Tenant hạ cấp gói dịch vụ khi số lượng cửa hàng hiện tại đang vượt quá gói mới: Hệ thống yêu cầu Tenant Admin phải chuyển trạng thái ít nhất 1 cửa hàng thành `INACTIVE` trước khi lệnh hạ cấp được phê duyệt.

## 11. Tiêu Chí Nghiệm Thu (Acceptance Criteria)
- Cập nhật logo và số điện thoại công ty -> Phiếu in hóa đơn tại quầy POS của cả 2 cửa hàng lập tức hiển thị thông tin mới trong lần in kế tiếp.

## 12. Những Điểm Cần Xác Nhận Với Khách Hàng `[UNDECIDED]`
- Doanh nghiệp có nhu cầu xuất hóa đơn điện tử VAT trực tiếp qua các nhà cung cấp như VNPT, Viettel, MISA từ nền tảng NEXORA không?
