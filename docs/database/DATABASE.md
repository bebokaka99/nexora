# Tổng Quan Thiết Kế Cơ Sở Dữ Liệu — Database Overview

> Trạng thái thông tin: `[PROPOSED]` Định hướng thiết kế cơ sở dữ liệu PostgreSQL & Prisma ORM bởi Senior Technical Lead.

Tài liệu này xác định các nguyên lý cốt lõi, quy chuẩn đặt tên và chiến lược quản lý dữ liệu cho hệ thống **NEXORA — Commerce Management Platform** sử dụng **PostgreSQL 16** và **Prisma ORM**.

---

## 1. Các Nguyên Lý Thiết Kế Cơ Sở Dữ Liệu Cốt Lõi

1. **Chuẩn hóa cơ sở dữ liệu (Normalization 3NF):** Dữ liệu được thiết kế đạt chuẩn chuẩn hóa bậc 3 (Third Normal Form) để giảm thiểu dư thừa dữ liệu, chống dị thường khi cập nhật và đảm bảo tính nhất quán toàn vẹn.
2. **Khóa an toàn Tenant (Tenant Ownership):** 100% các bảng dữ liệu nghiệp vụ (trừ bảng cấu hình toàn cục hệ thống) bắt buộc phải sở hữu cột `tenant_id VARCHAR(36) NOT NULL` và có Foreign Key trỏ về bảng `tenants(id)` với hành vi `ON DELETE CASCADE`.
3. **Chiến lược định danh khóa chính (Primary Keys):** Sử dụng chuẩn **UUIDv4** hoặc **CUID2** làm khóa chính cho các bảng, giúp ngăn chặn hành vi đoán mã ID liên tiếp (ID enumeration attacks) và hỗ trợ sinh khóa an toàn ngay tại tầng ứng dụng trước khi lưu vào database.
4. **Xóa mềm (Soft Delete):** Các thực thể quan trọng (`products`, `orders`, `customers`, `stores`, `warehouses`) bắt buộc có trường `deleted_at TIMESTAMP WITH TIME ZONE NULL`. Dữ liệu khi bị xóa chỉ cập nhật mốc thời gian này, không bao giờ bị `DELETE` vĩnh viễn khỏi đĩa nhằm phục vụ công tác đối soát kế toán và khôi phục khi cần.
5. **Dấu vết thời gian (Timestamps):** Tất cả các bảng đều phải có 2 trường chuẩn `created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP` và `updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`.

---

## 2. Quy Chuẩn Đặt Tên (Naming Conventions)

- **Tên bảng:** Viết thường, phân cách bằng dấu gạch dưới (snake_case), sử dụng danh từ số nhiều (ví dụ: `tenants`, `users`, `products`, `product_variants`, `orders`, `order_items`).
- **Tên cột:** Viết thường, snake_case (ví dụ: `first_name`, `phone_number`, `tenant_id`, `created_at`).
- **Khóa ngoại (Foreign Keys):** Tên bảng số ít kết hợp `_id` (ví dụ: `tenant_id`, `user_id`, `order_id`, `warehouse_id`).
- **Khóa chỉ mục (Indexes):** Tiền tố `idx_[table]_[columns]` (ví dụ: `idx_orders_tenant_status`).
- **Ràng buộc duy nhất (Unique Constraints):** Tiền tố `uq_[table]_[columns]` (ví dụ: `uq_products_tenant_sku`).

---

## 3. Bản Đồ Tài Liệu Database Chi Tiết

- [**DATABASE_DESIGN.md**](./DATABASE_DESIGN.md): Chi tiết từng thực thể dữ liệu, kiểu dữ liệu và mô tả trường.
- [**ENTITY_RELATIONSHIPS.md**](./ENTITY_RELATIONSHIPS.md): Sơ đồ quan hệ thực thể (ERD) hoàn chỉnh bằng Mermaid.
- [**TENANT_DATA_ISOLATION.md**](./TENANT_DATA_ISOLATION.md): Cơ chế cô lập dữ liệu Multi-Tenant tại tầng PostgreSQL.
- [**MIGRATION_STRATEGY.md**](./MIGRATION_STRATEGY.md): Chiến lược Prisma Migrations và quy trình triển khai không gián đoạn.
