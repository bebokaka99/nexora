# TASK-011: Gỡ Tài Khoản Demo Hardcode Khỏi Auth & Trang Đăng Nhập

- **Mã nhiệm vụ**: `TASK-011`
- **Giai đoạn**: `Phase 06.5 — Foundation Hardening (Củng cố nền tảng)`
- **Epic**: `EPIC-06-5-B`
- **Trạng thái**: `TODO`
- **Người thực hiện**: Backend Engineer / Frontend Engineer
- **Độ ưu tiên**: Cao nhất (P0)

## 1. Mục đích công việc

Tài khoản demo đang bị hardcode trong `backend/src/modules/auth/auth.service.ts` (danh sách tài khoản demo dùng khi "DB chưa migrate", tenant `tenant-demo-giadung`) và hiển thị sẵn trên trang đăng nhập. Đây là cửa hậu bảo mật: bất kỳ ai đọc code cũng đăng nhập được, và nó che giấu việc database chưa thật — auth "chạy được" mà không cần PostgreSQL. Nhiệm vụ này gỡ hoàn toàn tài khoản demo khỏi code và giao diện, thay bằng cơ chế seed có kiểm soát (nếu cần tài khoản thử nghiệm).

> **Căn cứ kiểm chứng**: Rà soát repo `bebokaka99/nexora` ngày 16/11/2026, commit `08b9602`. `backend/src/modules/auth/auth.service.ts` chứa danh sách tài khoản demo hardcode với ghi chú "cho môi trường dev/local nếu DB chưa migrate"; trang đăng nhập hiển thị tài khoản demo.

## 2. Phạm vi thay đổi (Scope)
- **Tệp mã nguồn bị tác động**:
  - `backend/src/modules/auth/auth.service.ts` (xóa danh sách tài khoản demo hardcode và nhánh đăng nhập demo)
  - `frontend/app/dang-nhap/page.tsx` (gỡ khối hiển thị tài khoản demo)
  - `backend/prisma/seed.ts` (tùy chọn: tạo tài khoản seed qua biến môi trường, chỉ dùng cho dev, xem bước 3)
- **Các API cần tạo mới hoặc chỉnh sửa**:
  - `POST /api/v1/auth/login`: chỉ xác thực user có trong PostgreSQL thật; sai thông tin đăng nhập trả lỗi chung, không tiết lộ user có tồn tại hay không.
- **Thay đổi cơ sở dữ liệu (nếu có)**:
  - Không thay đổi lược đồ; tài khoản seed (nếu có) đi qua `prisma/seed.ts` sau `TASK-009`.

## 3. Các bước thực hiện chi tiết
1. Bước 1: Xóa toàn bộ danh sách tài khoản demo hardcode và mọi nhánh logic đăng nhập demo trong `auth.service.ts`.
2. Bước 2: Gỡ khối hiển thị tài khoản demo khỏi trang đăng nhập; trang chỉ còn form đăng nhập chuẩn.
3. Bước 3: Nếu vẫn cần tài khoản thử nghiệm cho dev, tạo bằng `prisma/seed.ts` với mật khẩu lấy từ biến môi trường (không commit mật khẩu), và ghi rõ trong tài liệu đây là seed dev, không phải tài khoản hardcode.
4. Bước 4: Rà soát toàn repo (`grep -rni "demo" backend/src frontend/app --include=*.ts --include=*.tsx`) để bảo đảm không còn tài khoản demo hay dữ liệu demo nào lọt vào luồng xác thực.

## 4. Tiêu chí nghiệm thu (Acceptance Criteria)
- [ ] Tìm `grep -rni "demo" backend/src/modules/auth/` không còn tài khoản demo hardcode hay nhánh đăng nhập demo.
- [ ] Trang đăng nhập không hiển thị bất kỳ tài khoản/mật khẩu mẫu nào.
- [ ] Đăng nhập bằng tài khoản demo cũ bị từ chối; đăng nhập bằng tài khoản thật trong PostgreSQL thành công.
- [ ] Không có mật khẩu hay secret nào được commit trong quá trình làm nhiệm vụ này.
