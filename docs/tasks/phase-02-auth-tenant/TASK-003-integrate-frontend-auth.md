# TASK-003: Tích hợp xác thực và bảo vệ tuyến đường trên Frontend (Frontend Auth Integration)

- **Mã nhiệm vụ**: `TASK-003`
- **Giai đoạn**: `Phase 02 - Auth & Multi-Tenancy`
- **Epic**: `EPIC-02-D`
- **Trạng thái**: `TODO`
- **Người thực hiện**: Frontend Engineer
- **Độ ưu tiên**: Cao nhất (P0)

## 1. Mục đích công việc
Kết nối ứng dụng Next.js 15 ở thư mục `frontend/` trực tiếp với các API xác thực vừa hoàn thành của backend NestJS (`http://localhost:4000/api/v1/auth`). 

Thay thế trạng thái đăng nhập giả lập bằng luồng xác thực thực tế. Bảo vệ các trang quản trị `/dashboard` và `/pos`, tự động chuyển hướng người dùng chưa đăng nhập về trang `/login`.

## 2. Phạm vi thay đổi (Scope)
- **Tạo các trang giao diện mới trong `frontend/app/`**:
  - `app/(auth)/login/page.tsx`: Màn hình Đăng nhập (Email, Mật khẩu, nút Đăng nhập, liên kết Đăng ký, hiển thị thông báo lỗi khi sai thông tin).
  - `app/(auth)/register/page.tsx`: Màn hình Đăng ký doanh nghiệp mới (Tên công ty, Slug subdomain, Họ tên quản trị viên, Email, Mật khẩu).
- **Thư viện và tiện ích trong `frontend/lib/`**:
  - `lib/api-client.ts`: Module gọi API tập trung, tự động gắn `Authorization: Bearer <token>` vào mọi yêu cầu và xử lý mã lỗi `401 Unauthorized`.
  - `lib/auth-context.tsx`: React Context quản lý trạng thái đăng nhập, thông tin người dùng, thông tin Tenant và hàm đăng xuất (`logout`).
- **Bảo vệ tuyến đường (Route Protection)**:
  - Middleware hoặc Client Route Guard kiểm tra trạng thái Token. Nếu chưa có Token hoặc Token hết hạn, tự động chuyển hướng về `/login`.
  - Nạp thông tin tài khoản thật từ `/api/v1/auth/me` lên thanh Header và Sidebar của Dashboard thay vì chữ cứng demo.

## 3. Các bước thực hiện chi tiết
1. Tạo module gọi API `frontend/lib/api-client.ts` sử dụng `fetch` hỗ trợ lưu và đọc Token từ `localStorage` hoặc `cookie`.
2. Tạo `AuthContext` quản lý dữ liệu phiên người dùng và trạng thái nạp dữ liệu.
3. Xây dựng màn hình `/login` với giao diện chuyên nghiệp, hỗ trợ phím tắt và thông báo lỗi tiếng Việt.
4. Xây dựng màn hình `/register` cho phép doanh nghiệp mới đăng ký dùng thử 14 ngày.
5. Cập nhật Sidebar và Header trong `/dashboard` để hiển thị tên thật của người dùng, tên Tenant và nút Đăng xuất an toàn.

## 4. Tiêu chí nghiệm thu (Acceptance Criteria)
- [ ] Người dùng truy cập `http://localhost:3000/login` và nhập đúng tài khoản mẫu `admin@nexora.vn` / `Nexora@2026` được chuyển hướng vào `/dashboard`.
- [ ] Nhập sai mật khẩu hiển thị thông báo lỗi rõ ràng `"Email hoặc mật khẩu không chính xác"`.
- [ ] Header và Sidebar hiển thị đúng tên người dùng `Nguyễn Văn Quản Trị` và tên doanh nghiệp `Gia Dụng Hiện Đại`.
- [ ] Bấm nút Đăng xuất xóa sạch Token và chuyển hướng về màn hình `/login`.
- [ ] Người dùng chưa đăng nhập cố tình gõ trực tiếp `http://localhost:3000/dashboard` hoặc `/pos` bị chuyển hướng về `/login`.
