# NEXORA — Backend Architecture

Thư mục `backend/` chứa toàn bộ mã nguồn xử lý logic nghiệp vụ, quản lý dữ liệu, phân quyền và tích hợp đa kênh của nền tảng NEXORA. Hệ thống được xây dựng theo mô hình **Modular Monolith** trên nền tảng **NestJS** và **TypeScript**.

## 1. Công Nghệ Sử Dụng

- **Framework**: NestJS v10+ (Node.js 22 LTS).
- **Ngôn ngữ**: TypeScript 5+.
- **Giao thức API**: REST API (tuân thủ chuẩn OpenAPI 3.0 / Swagger).
- **Realtime**: Socket.IO Gateway.
- **ORM**: Prisma v5+/v6+.
- **Database**: PostgreSQL 16+.
- **Cache & Message Broker**: Redis 7+ kết hợp BullMQ cho hàng đợi xử lý nền (Background Queues).
- **Bảo mật & Xác thực**: Passport.js, JWT (Access Token + Refresh Token Rotation), bcrypt.

## 2. Quy Chuẩn Cấu Trúc Thư Mục

```text
backend/
├── src/
│   ├── modules/              # Các Business Domain Modules độc lập
│   │   ├── auth/             # Xác thực, đăng ký, đăng nhập, refresh token
│   │   ├── users/            # Quản lý tài khoản người dùng và thông tin cá nhân
│   │   ├── tenants/          # Quản lý định danh doanh nghiệp (Tenants)
│   │   ├── roles/            # Quản trị vai trò (Role Management)
│   │   ├── permissions/      # Quản trị danh mục quyền hạn (Permissions)
│   │   ├── stores/           # Quản lý các điểm bán hàng trực tiếp (Stores)
│   │   ├── warehouses/       # Quản lý hệ thống kho hàng (Warehouses)
│   │   ├── products/         # Quản lý sản phẩm, danh mục, thuộc tính, biến thể
│   │   ├── inventory/        # Quản lý tồn kho, giao dịch nhập/xuất/chuyển kho
│   │   ├── orders/           # Quản lý đơn hàng, quy trình xử lý đơn, hủy đơn
│   │   ├── customers/        # Quản lý hồ sơ khách hàng và lịch sử mua sắm
│   │   ├── channels/         # Kết nối tài khoản bán hàng (Shopee, TikTok, Facebook)
│   │   ├── conversations/    # Quản lý hộp thư tập trung, tin nhắn, bình luận
│   │   ├── subscriptions/    # Quản lý gói cước và trạng thái thuê bao SaaS
│   │   ├── billing/          # Quản lý hóa đơn dịch vụ và thanh toán gói phần mềm
│   │   ├── reports/          # Thống kê, báo cáo doanh thu, tồn kho và hiệu suất
│   │   ├── notifications/    # Hệ thống thông báo in-app, email, webhook
│   │   └── audit-logs/       # Ghi vết nhật ký kiểm toán hành vi hệ thống
│   │
│   ├── common/               # Shared Utilities, Interfaces, Constants, Types
│   ├── config/               # Cấu hình môi trường (AppConfig, DatabaseConfig, RedisConfig)
│   ├── database/             # Prisma Service, Prisma Module, Database extensions
│   ├── guards/               # AuthGuard, RolesGuard, TenantGuard, SubscriptionGuard
│   ├── decorators/           # @CurrentUser(), @CurrentTenant(), @Roles(), @Public()
│   ├── interceptors/         # LoggingInterceptor, TenantInterceptor, TransformResponseInterceptor
│   ├── filters/              # GlobalExceptionFilter, PrismaClientExceptionFilter
│   ├── strategies/           # JwtStrategy, JwtRefreshStrategy, LocalStrategy
│   ├── queues/               # BullMQ Producers, Processors, Queue Schedulers
│   └── gateways/             # Socket.IO Realtime Gateway (Events, Handlers)
│
└── test/                     # Unit tests, integration tests, E2E tests
```

## 3. Nguyên Tắc Thiết Kế Modular Monolith

1. **Ranh giới Domain độc lập**: Mỗi module trong `src/modules/` tự quản lý Service, Controller, DTO, Entity riêng biệt. Module bên ngoài chỉ được giao tiếp thông qua Service công khai được `export` trong file `.module.ts`.
2. **Cô lập Dữ liệu Multi-Tenant**: Mọi câu truy vấn dữ liệu nghiệp vụ bắt buộc phải gắn liền với ngữ cảnh `tenant_id` được trích xuất từ JWT token thông qua `TenantInterceptor` hoặc `TenantGuard`.
3. **Xử lý nền qua Queue (BullMQ)**: Các tác vụ tốn thời gian như đồng bộ đơn hàng sàn TMĐT, cập nhật số lượng tồn kho lớn, gửi email thông báo đều phải được đẩy vào hàng đợi bất đồng bộ Redis / BullMQ.
