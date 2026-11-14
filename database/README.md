# NEXORA — Database Architecture & Data Strategy

Thư mục `database/` quản lý toàn bộ các định nghĩa cơ sở dữ liệu, công cụ ORM (Prisma), dữ liệu mẫu (seeds), tài liệu thiết kế ERD và các tập lệnh hỗ trợ bảo trì hệ thống cho **PostgreSQL**.

## 1. Công Nghệ & Công Cụ

- **Database Engine**: PostgreSQL 16+.
- **ORM & Schema Engine**: Prisma v5+ / v6+.
- **Data Isolation Model**: Shared Database, Shared Schema with Discriminator Column (`tenant_id`) kết hợp PostgreSQL Row-Level Security (RLS).
- **Migration Engine**: Prisma Migrate (`prisma migrate dev`, `prisma migrate deploy`).

## 2. Quy Chuẩn Cấu Trúc Thư Mục

```text
database/
├── prisma/
│   ├── schema.prisma         # File schema chính thức (sẽ được tạo tại Phase 01 Task 04)
│   └── migrations/           # Lịch sử các migration phiên bản được tạo tự động
│
├── seeds/                    # Kịch bản nạp dữ liệu mẫu
│   ├── dev/                  # Dữ liệu phục vụ phát triển cục bộ (Mock Tenant, Products)
│   └── prod/                 # Dữ liệu khởi tạo hệ thống (Super Admin, System Roles, Permissions)
│
├── docs/                     # Tài liệu thiết kế Database
│   ├── ERD.md                # Sơ đồ quan hệ thực thể chi tiết
│   ├── DICTIONARY.md         # Từ điển dữ liệu (Data Dictionary giải thích từng trường)
│   └── CONCURRENCY.md        # Chiến lược khóa lạc quan/bi quan khi trừ kho
│
└── scripts/                  # Kịch bản bảo trì & vận hành
    ├── backup.sh             # Script sao lưu tự động PostgreSQL
    ├── restore.sh            # Script phục hồi dữ liệu
    └── rls-setup.sql         # Kịch bản kích hoạt Row-Level Security cho Postgres
```

## 3. Nguyên Tắc Quản Trị Cơ Sở Dữ Liệu

1. **Tuyệt đối không can thiệp trực tiếp vào DB Production**: Mọi thay đổi cấu trúc bảng, thêm cột, tạo index đều phải thông qua Prisma Migration file có gắn mã phiên bản.
2. **Khóa an toàn Tenant**: Tất cả bảng nghiệp vụ (trừ bảng cấu hình toàn cục như `subscription_plans`, `system_permissions`) đều bắt buộc có trường `tenant_id` làm Foreign Key trỏ đến bảng `tenants` và phải được đánh Index `(tenant_id, id)`.
3. **Cơ chế Soft Delete**: Các thực thể cốt lõi như `products`, `orders`, `customers` áp dụng cơ chế đánh dấu xóa mềm `deleted_at: DateTime?` để phục vụ đối soát và khôi phục khi cần.
