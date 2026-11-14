# Phân Hệ Xác Thực & Bảo Mật — Authentication Module

> Trạng thái thông tin: `[CONFIRMED]` cho luồng đăng nhập Email/Mật khẩu | `[PROPOSED]` cho JWT Rotation và cơ chế khóa an toàn.

## 1. Mục Đích
Phân hệ Authentication đảm bảo việc xác thực danh tính người dùng, cấp phát và quản lý vòng đời token, đồng thời thiết lập ngữ cảnh doanh nghiệp (`tenant_id`) an toàn cho từng yêu cầu nghiệp vụ.

## 2. Phạm Vi Nghiệp Vụ
- Đăng nhập, đăng xuất, cấp lại Access Token qua Refresh Token.
- Quản lý phiên làm việc đa thiết bị và thu hồi phiên (Session Revocation).
- Đổi mật khẩu, quên mật khẩu và đặt lại mật khẩu qua email.

## 3. Đối Tượng Sử Dụng
- Tất cả người dùng hệ thống (Super Admin, Tenant Admin, Thu ngân, Thủ kho, Trực chat).

## 4. Các Chức Năng Chính
- **Đăng Nhập Chuẩn:** Xác thực email/mật khẩu, kiểm tra trạng thái hoạt động của tài khoản và doanh nghiệp.
- **Refresh Token Rotation:** Tự động gia hạn Access Token 15 phút mà không ngắt quãng phiên người dùng.
- **Đăng Xuất Mọi Thiết Bị:** Thu hồi toàn bộ token của tài khoản khi có nghi vấn lộ mật khẩu.
- **Khóa Tài Khoản Tạm Thời:** Tự động khóa sau 5 lần nhập sai mật khẩu liên tiếp trong 15 phút.

## 5. Quy Tắc Nghiệp Vụ (Business Rules)
- `BR-AUTH-001`: Mật khẩu tối thiểu 8 ký tự, bao gồm ít nhất 1 chữ hoa, 1 chữ thường và 1 chữ số.
- `BR-AUTH-002`: Access Token có hiệu lực 15 phút; Refresh Token có hiệu lực 7 ngày.
- `BR-AUTH-003`: Mỗi người dùng chỉ thuộc về 1 Tenant duy nhất (trừ tài khoản đặc thù Super Admin).
- `BR-AUTH-004`: Khi người dùng bị đổi vai trò hoặc bị khóa bởi quản trị viên, phiên làm việc hiện tại phải bị vô hiệu hóa trong vòng tối đa 1 phút.

## 6. Dữ Liệu Liên Quan
- `users`, `tenants`, `user_roles`, `roles`, `permissions`, `refresh_tokens` (trong Redis).

## 7. Quan Hệ Với Module Khác
- Cung cấp `UserContext` và `TenantContext` cho tất cả các Controller và Service trong toàn hệ thống.

## 8. API Dự Kiến
- `POST /api/v1/auth/login`: Đăng nhập hệ thống.
- `POST /api/v1/auth/refresh`: Làm mới token.
- `POST /api/v1/auth/logout`: Đăng xuất phiên hiện tại.
- `POST /api/v1/auth/change-password`: Đổi mật khẩu tài khoản.
- `POST /api/v1/auth/forgot-password`: Yêu cầu link đặt lại mật khẩu.

## 9. Quyền Truy Cập
- `POST /login`, `POST /refresh`, `POST /forgot-password` là các endpoint công khai (Public).
- Các endpoint còn lại bắt buộc có `Authorization: Bearer <token>`.

## 10. Các Trường Hợp Biên (Edge Cases)
- Đăng nhập khi mạng chập chờn: Phía client áp dụng cơ chế retry thông minh với idempotency key.
- Refresh token rotation bị gọi đồng thời 2 lần từ 2 tab trình duyệt cùng lúc: Áp dụng cơ chế ân hạn 10 giây (Grace period) trong Redis để không vô hiệu hóa nhầm phiên hợp lệ.

## 11. Tiêu Chí Nghiệm Thu (Acceptance Criteria)
- Đăng nhập đúng thông tin -> Nhận được Access Token và Refresh Token trong vòng < 300ms.
- Thử refresh token cũ đã qua sử dụng -> Server từ chối và ghi nhận cảnh báo vi phạm an ninh.

## 12. Những Điểm Cần Xác Nhận Với Khách Hàng `[UNDECIDED]`
- Có yêu cầu bắt buộc đăng nhập bằng số điện thoại kết hợp mã OTP qua Zalo/SMS trong tương lai không?
- Thời gian tự động đăng xuất khi không có tương tác tại quầy POS là bao lâu (ví dụ: sau 30 phút)?
