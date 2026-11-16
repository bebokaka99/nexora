# TASK-011: Gỡ Tài Khoản Demo Hardcode Khỏi Auth & Trang Đăng Nhập

- **Mã nhiệm vụ**: `TASK-011`
- **Giai đoạn**: `Phase 06.5 — Foundation Hardening (Củng cố nền tảng)`
- **Epic**: `EPIC-06-5-B`
- **Trạng thái**: `Đạt một phần` (xem §5 — code đã xong và build PASS, còn tiêu chí đăng nhập trên Postgres thật chưa kiểm chứng được vì VM không có Postgres)
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
- [x] Tìm `grep -rni "demo" backend/src/modules/auth/` không còn tài khoản demo hardcode hay nhánh đăng nhập demo. — Chỉ còn 1 comment ghi chú việc đã xóa (xem §5).
- [x] Trang đăng nhập không hiển thị bất kỳ tài khoản/mật khẩu mẫu nào. — Kiểm chứng bằng grep trên `frontend/app/(auth)/dang-nhap/page.tsx` và `frontend/app/(auth)/login/page.tsx`: không còn chuỗi demo/mật khẩu mẫu (banner demo đã gỡ từ commit 48b4153, xác nhận lại trong task này).
- [ ] Đăng nhập bằng tài khoản demo cũ bị từ chối; đăng nhập bằng tài khoản thật trong PostgreSQL thành công. — **Chưa kiểm chứng được**: VM không có Postgres (blocker đã biết, xem §5). Code đã bảo đảm: `AuthService.login` chỉ đọc user từ PostgreSQL (TASK-009), không còn nhánh demo; token ký bằng secret từ biến môi trường.
- [x] Không có mật khẩu hay secret nào được commit trong quá trình làm nhiệm vụ này. — Chỉ đổi example Swagger thành `MatKhauManh123!` (ví dụ chung chung, không phải credential hoạt động); JWT secret hardcode bị xóa, không thay bằng secret khác.

## 5. Kết quả thực hiện (16/11/2026, nhánh `feat/fe-vibe-and-docs-priority`, commit xem cuối §5)

### 5.1. Rà soát trước khi sửa (grep, đã kiểm chứng)
- `Nexora@2026`: 3 chỗ, đều là example Swagger — `backend/src/modules/auth/dto/auth.dto.ts:10`, `login.dto.ts:14`, `register.dto.ts:48`.
- Secret JWT hardcode `nexora_super_secret_jwt_key_2026_modular_monolith`: `backend/src/common/guards/auth.guard.ts:39`, `jwt-auth.guard.ts:26`, `auth.service.ts:69,107`; refresh secret `nexora_super_secret_refresh_jwt_key_2026`: `auth.service.ts:72,110`.
- `mockUsers`: không còn code, chỉ còn comment ghi chú việc đã xóa ở `auth.service.ts:13` (TASK-009).
- Trang đăng nhập FE: không còn khối demo (đã gỡ ở commit 48b4153); `frontend/app/dang-nhap/` không tồn tại — đường dẫn thật là `frontend/app/(auth)/dang-nhap/page.tsx` và `frontend/app/(auth)/login/page.tsx`.
- Seed dev `database/prisma/seed.ts`: **không sửa** — đã xác nhận fail-fast khi thiếu `SEED_ADMIN_PASSWORD`, không chứa mật khẩu thật (mật khẩu chỉ đi qua biến môi trường, hash PBKDF2 rồi mới lưu).

### 5.2. Thay đổi đã làm
- **DTO examples** (`auth.dto.ts`, `login.dto.ts`, `register.dto.ts`): `Nexora@2026` → `MatKhauManh123!` (ví dụ chung chung, không gắn với tài khoản nào).
- **Mới: `backend/src/common/utils/jwt-secrets.ts`** — `getJwtSecret()` / `getJwtRefreshSecret()` đọc từ `ConfigService`, thiếu thì throw lỗi rõ ràng (hướng dẫn tạo secret bằng `openssl rand -base64 48`). Dùng chung cho cả 4 chỗ cũ, tránh lặp logic fail-fast.
- **`auth.service.ts` (`login`, `refreshToken`)**: dùng 2 helper trên, xóa toàn bộ fallback secret hardcode; cập nhật comment đầu file (ghi rõ TASK-011).
- **`auth.guard.ts`, `jwt-auth.guard.ts`**: dùng `getJwtSecret()`, xóa fallback secret hardcode.
- **`main.ts`**: fail-fast lúc khởi động theo đúng mẫu TASK-009 (`DATABASE_URL`): thiếu `JWT_SECRET` hoặc `JWT_REFRESH_SECRET` trong `process.env` thì throw trước khi tạo Nest app. Lưu ý đã ghi trong comment code: kiểm tra này đọc `process.env` trực tiếp (file `.env` chỉ được `ConfigModule` nạp sau khi tạo app) — khi chạy qua docker-compose, secret được cấp qua `environment` của service backend; helper ở §5.2 là lớp phòng thủ thứ hai cho trường hợp secret chỉ có trong file `.env`.
- **Không sửa FE**: không còn khối demo nào trên trang đăng nhập; `frontend/lib/services/channel-service.ts` vẫn còn mock fallback với `tenantId: 'tenant-demo-giadung'` — đó là dữ liệu kênh mẫu ở FE, không phải tài khoản demo auth, ngoài phạm vi TASK-011 (ghi nhận để xử lý riêng, xem §5.4).

### 5.3. Kiểm chứng (đều PASS, ngày 16/11/2026)
- `npm run build` (backend, trước sửa — baseline): PASS.
- `npm run build` (backend, sau sửa): PASS.
- `grep -rni "Nexora@2026" backend/src frontend/app frontend/lib database/`: không còn kết quả.
- `grep -rn "nexora_super_secret" backend/src frontend/app frontend/lib database/ docs/ docker-compose.yml .env.example`: không còn kết quả.
- `grep -rni "demo" backend/src/modules/auth/`: chỉ còn 1 comment ghi chú việc đã xóa (không phải tài khoản/nhánh demo).
- `grep -rni "demo"` trên `frontend/app/(auth)/dang-nhap/page.tsx` và `frontend/app/(auth)/login/page.tsx`: không còn kết quả.
- Khói fail-fast (dùng `node dist/main` biên dịch từ code mới, secret test chỉ đặt trong shell tạm, không commit): `DATABASE_URL` có + thiếu `JWT_SECRET` → throw `...thiếu biến môi trường JWT_SECRET...` ngay ở `bootstrap`, trước khi chạm DB; thêm `JWT_SECRET`, thiếu `JWT_REFRESH_SECRET` → throw tương tự. Helper biên dịch: thiếu secret → throw, đủ secret → trả đúng giá trị.
- `npm run build` frontend: **không chạy lại** (không sửa FE, theo đúng phạm vi task).

### 5.4. Còn thiếu / blocker / rủi ro đã biết
- **Blocker — chưa kiểm chứng đăng nhập trên Postgres thật**: VM không có Postgres nên không chạy được migration/seed/login thật; tiêu chí "demo cũ bị từ chối / tài khoản thật thành công" vẫn mở, cần kiểm chứng khi có Postgres (docker-compose TASK-010 hoặc máy có Postgres).
- **Mặc định secret dev trong `docker-compose.yml`**: `JWT_SECRET: ${JWT_SECRET:-change-me-dev-only-jwt-secret}` (và tương tự cho refresh) — giá trị mặc định yếu, gắn nhãn dev-only, thuộc TASK-010, **không đổi trong task này** vì đổi thành bắt buộc sẽ làm backend compose fail khi chưa có file `.env`. Trước khi deploy thật phải xóa default này (bắt buộc đặt secret qua `.env`) — ghi nhận làm follow-up, không thuộc TASK-011.
- **Còn `tenant-demo-giadung` ngoài auth**: `backend/src/modules/channel/channel.controller.ts` (5 chỗ fallback `tenantId || 'tenant-demo-giadung'`) và mock fallback FE `frontend/lib/services/channel-service.ts` — là tenant mặc định/dữ liệu kênh mẫu, không phải credential auth; ngoài phạm vi TASK-011, cần task riêng dọn mock channel (nối tiếp TASK-009 đã gỡ `memoryChannels` ở backend service).
- **Commit**: xem §6 (message + SHA trong `git log -1` trên nhánh).

## 6. Commit
- Nhánh: `feat/fe-vibe-and-docs-priority` (chỉ làm việc local, không push, không sửa main, không tạo PR).
- Message: `feat(auth): TASK-011 gỡ demo hardcode + JWT secret fallback, fail-fast JWT_SECRET (chưa kiểm chứng login trên Postgres thật)`.
- SHA: xem `git log -1` trên nhánh (ghi trong báo cáo bàn giao task).
