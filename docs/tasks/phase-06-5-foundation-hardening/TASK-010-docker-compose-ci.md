# TASK-010: Thiết Lập Docker, docker-compose & CI (GitHub Actions)

- **Mã nhiệm vụ**: `TASK-010`
- **Giai đoạn**: `Phase 06.5 — Foundation Hardening (Củng cố nền tảng)`
- **Epic**: `EPIC-06-5-A`
- **Trạng thái**: `TODO`
- **Người thực hiện**: DevOps / Backend Engineer
- **Độ ưu tiên**: Cao nhất (P0)

## 1. Mục đích công việc

Thư mục `infrastructure/` hiện chỉ có một file `README.md`, không có `Dockerfile`, `docker-compose.yml`, `.env.example` hay pipeline CI nào. Mọi kiểm chứng đến nay đều làm thủ công trên máy cá nhân, không tái lập được và không có cửa kiểm soát chất lượng trước khi gộp code. Nhiệm vụ này dựng hạ tầng chạy local bằng một lệnh và CI chạy kiểm thử/build trên mọi pull request.

> **Căn cứ kiểm chứng**: Rà soát repo `bebokaka99/nexora` ngày 16/11/2026, commit `08b9602`. `docker-compose*`, `Dockerfile*`, `.github/workflows/` đều không tồn tại; `infrastructure/` chỉ chứa `README.md`.

## 2. Phạm vi thay đổi (Scope)
- **Tệp mã nguồn bị tác động**:
  - `docker-compose.yml` (PostgreSQL + Redis + backend + frontend, dùng cho dev)
  - `backend/Dockerfile`, `frontend/Dockerfile`
  - `.env.example` (mẫu đầy đủ: `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, … — chỉ chứa giá trị mẫu, không chứa secret thật)
  - `.github/workflows/ci.yml` (lint + test + build backend/frontend trên mọi PR)
  - `infrastructure/README.md` (cập nhật hướng dẫn chạy bằng Docker)
- **Các API cần tạo mới hoặc chỉnh sửa**:
  - Không thay đổi API.
- **Thay đổi cơ sở dữ liệu (nếu có)**:
  - Không thay đổi lược đồ; `docker-compose` cấp PostgreSQL cho migration ở `TASK-009`.

## 3. Các bước thực hiện chi tiết
1. Bước 1: Viết `.env.example` liệt kê toàn bộ biến môi trường backend/frontend đang dùng, kèm ghi chú biến nào bắt buộc.
2. Bước 2: Viết `Dockerfile` cho backend (NestJS) và frontend (Next.js 15), build thử local.
3. Bước 3: Viết `docker-compose.yml` chạy PostgreSQL, Redis, backend, frontend; kiểm chứng `docker compose up` đưa cả hệ thống lên và API trả lời được.
4. Bước 4: Thêm GitHub Actions `ci.yml`: cài đặt, lint, chạy kiểm thử (nếu có), `npm run build` cho cả backend và frontend trên mọi pull request.
5. Bước 5: Cập nhật `infrastructure/README.md` và `README.md` gốc với hướng dẫn chạy một lệnh (`docker compose up`) và quy trình CI.

## 4. Tiêu chí nghiệm thu (Acceptance Criteria)
- [ ] Chạy `docker compose up` trên máy sạch (chỉ cần Docker + file `.env` theo mẫu) đưa PostgreSQL, Redis, backend và frontend lên hoạt động.
- [ ] Lệnh `npm run build` của backend và frontend đều pass trong Docker và trên CI.
- [ ] Mọi pull request đều kích hoạt workflow CI; workflow báo đỏ khi build hoặc lint lỗi.
- [ ] Không có secret thật nào được commit trong `.env.example`, `Dockerfile` hay workflow CI.
