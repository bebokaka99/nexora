# TASK-002: Triển khai phân hệ Xác thực và Quản trị Tenant (Auth & Multi-Tenancy)

- **Mã nhiệm vụ**: `TASK-002`
- **Giai đoạn**: `Phase 02 - Auth & Multi-Tenancy`
- **Epic**: `EPIC-02-A`, `EPIC-02-B`, `EPIC-02-C`
- **Trạng thái**: `DONE` (Hoàn thành)
- **Người thực hiện**: Backend Engineer / Fullstack Engineer
- **Độ ưu tiên**: Cao nhất (P0)

## 1. Mục đích công việc
Xây dựng nền tảng xác thực danh tính và phân tách dữ liệu doanh nghiệp (Multi-Tenancy) cho backend NestJS. Đảm bảo mọi yêu cầu nghiệp vụ đều được xác thực danh tính qua JWT và gắn chặt với ngữ cảnh của một Tenant cụ thể.

## 2. Phạm vi thay đổi (Scope)
- **Các module backend cần xây dựng trong `backend/src/modules/`**:
  - `auth/`: Xử lý đăng ký, đăng nhập, cấp Access/Refresh Token và mã hóa mật khẩu.
  - `tenant/`: Quản lý hồ sơ công ty và định mức tài nguyên doanh nghiệp.
- **Thành phần dùng chung trong `backend/src/common/`**:
  - `decorators/tenant.decorator.ts`: Decorator trích xuất `tenantId` từ request.
  - `decorators/current-user.decorator.ts`: Decorator trích xuất thông tin người dùng.
  - `guards/jwt-auth.guard.ts`: Guard bảo vệ các endpoint yêu cầu đăng nhập.
  - `strategies/jwt.strategy.ts`: Passport JWT Strategy.
- **Dữ liệu mẫu khởi tạo (Database Seed)**:
  - Script nạp dữ liệu mẫu ban đầu: Gói dịch vụ `BASIC` & `GROWTH`, Tenant `Gia Dụng Hiện Đại` (slug: `gia-dung-hien-dai`), tài khoản quản trị `admin@nexora.vn`.

## 3. Danh mục API cần triển khai
- `POST /api/v1/auth/register`: Đăng ký tài khoản Tenant mới và cấp phát gói dùng thử.
- `POST /api/v1/auth/login`: Xác thực email và mật khẩu, trả về Access Token (15m) và Refresh Token (7d).
- `GET /api/v1/auth/me`: Lấy thông tin người dùng và quyền hạn hiện tại từ Bearer Token.
- `POST /api/v1/auth/refresh`: Cấp lại Access Token mới từ Refresh Token.
- `GET /api/v1/tenant/profile`: Lấy thông tin hồ sơ doanh nghiệp của Tenant hiện tại.

## 4. Tiêu chí nghiệm thu (Acceptance Criteria)
- [x] Lập trình viên chạy lệnh nạp seed dữ liệu mẫu thành công hoặc khởi động với dữ liệu mặc định an toàn.
- [x] Gọi API `POST /api/v1/auth/login` với thông tin hợp lệ nhận về `accessToken`, `refreshToken`, `user` và `tenant` trong thời gian dưới 300ms.
- [x] Gọi API `GET /api/v1/auth/me` kèm tiêu đề `Authorization: Bearer <accessToken>` trả về đúng thông tin tài khoản và `tenantId`.
- [x] Gửi yêu cầu không có Token hoặc Token hết hạn đến endpoint được bảo vệ nhận về mã lỗi chuẩn `401 Unauthorized`.
- [x] Đăng ký Tenant mới qua `POST /api/v1/auth/register` tự động thiết lập hạn dùng thử 14 ngày và băm mật khẩu an toàn với bcrypt.
