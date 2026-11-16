# TASK-009: Tạo Migration Prisma Đầu Tiên & Chạy PostgreSQL Thật, Bỏ Dần Fallback In-Memory

- **Mã nhiệm vụ**: `TASK-009`
- **Giai đoạn**: `Phase 06.5 — Foundation Hardening (Củng cố nền tảng)`
- **Epic**: `EPIC-06-5-A`
- **Trạng thái**: `TODO`
- **Người thực hiện**: Backend Engineer
- **Độ ưu tiên**: Cao nhất (P0)

## 1. Mục đích công việc

Hiện tại backend NEXORA chưa có bất kỳ migration Prisma nào (`backend/prisma/migrations/` không tồn tại) và nhiều service (`auth`, `channel`, `inventory`, `order`, `product`, `store`, `tenant`, `warehouse`) đang chạy bằng fallback in-memory / dữ liệu seed hardcode. Điều này có nghĩa là dữ liệu không bền vững, không thể kiểm chứng đồng bộ thật và mọi tính năng Phase 07/08 xây trên đó đều đứng trên nền cát.

Nhiệm vụ này tạo migration Prisma đầu tiên, đưa backend chạy với PostgreSQL thật và loại bỏ dần fallback in-memory, bắt đầu từ các module lõi.

> **Căn cứ kiểm chứng**: Rà soát repo `bebokaka99/nexora` ngày 16/11/2026, commit `08b9602`. `backend/prisma/migrations/` không tồn tại; fallback in-memory xuất hiện trong `backend/src/modules/{auth,channel,inventory,order,product,store,tenant,warehouse}/*.service.ts`.

## 2. Phạm vi thay đổi (Scope)
- **Tệp mã nguồn bị tác động**:
  - `backend/prisma/schema.prisma` (rà soát, chốt lược đồ cho các thực thể đã có)
  - `backend/prisma/migrations/0001_init/migration.sql` (migration đầu tiên)
  - `backend/prisma/seed.ts` (seed dữ liệu thật qua Prisma thay cho seed hardcode trong service)
  - `backend/src/modules/*/*.service.ts` (bỏ fallback in-memory, chuyển sang Prisma Client)
- **Các API cần tạo mới hoặc chỉnh sửa**:
  - Không thêm API mới; các API hiện có phải giữ nguyên hợp đồng (contract) nhưng đọc/ghi PostgreSQL thật.
- **Thay đổi cơ sở dữ liệu (nếu có)**:
  - Tạo toàn bộ bảng từ `schema.prisma` bằng migration `0001_init`.
  - Bổ sung biến môi trường `DATABASE_URL` (xem thêm `TASK-010` về `.env.example`).

## 3. Các bước thực hiện chi tiết
1. Bước 1: Rà soát `schema.prisma`, đối chiếu với các thực thể service đang dùng (Tenant, User, Store, Warehouse, Product, Order, ChannelConnection) và sửa lệch (nếu có) trước khi migrate.
2. Bước 2: Khởi động PostgreSQL thật (local hoặc qua `docker-compose` ở `TASK-010`), đặt `DATABASE_URL` và chạy `npx prisma migrate dev --name 0001_init`.
3. Bước 3: Chuyển seed dữ liệu từ hardcode trong service sang `prisma/seed.ts`, chạy `prisma db seed` để kiểm chứng.
4. Bước 4: Bỏ fallback in-memory theo từng module, ưu tiên `auth` và `channel` trước, sau đó `store`, `warehouse`, `product`, `inventory`, `order`, `tenant`; mỗi module bỏ fallback phải kèm kiểm thử khói (smoke test) API tương ứng.
5. Bước 5: Thêm cơ chế fail-fast: nếu `DATABASE_URL` thiếu hoặc PostgreSQL không kết nối được, backend dừng khởi động với lỗi rõ ràng thay vì lặng lẽ chạy bằng dữ liệu giả.

## 4. Tiêu chí nghiệm thu (Acceptance Criteria)
- [ ] Lệnh `npx prisma migrate dev` chạy thành công trên database trống và tạo đủ bảng; `npx prisma migrate status` báo không còn migration chờ.
- [ ] Backend khởi động và phục vụ API với PostgreSQL thật; dữ liệu tạo qua API vẫn còn sau khi restart backend.
- [ ] Không còn đường code fallback in-memory trong các module đã chuyển đổi; tìm `grep -rn "inMemory\|in-memory\|fallback" backend/src` không trả về kết quả trong các module đó.
- [ ] Backend không khởi động được khi `DATABASE_URL` sai/thiếu, với thông báo lỗi rõ ràng (không rơi về dữ liệu giả).
