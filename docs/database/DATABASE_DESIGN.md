# Thiết Kế Chi Tiết Thực Thể Cơ Sở Dữ Liệu — Database Design

> Trạng thái thông tin: `[PROPOSED]` Danh mục thực thể và thuộc tính trường được thiết kế bởi Senior Technical Lead.

Tài liệu này chi tiết hóa cấu trúc các bảng dữ liệu chính, kiểu dữ liệu PostgreSQL tương ứng và các ràng buộc toàn vẹn cho nền tảng **NEXORA**.

---

## 1. Nhóm Quản Trị Hệ Thống & SaaS (Platform & SaaS)

### 1.1. Bảng `tenants` (Doanh Nghiệp Thuê Bao)
| Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(36) | PRIMARY KEY | Định danh duy nhất của doanh nghiệp (UUID) |
| `name` | VARCHAR(255) | NOT NULL | Tên công ty hoặc tên thương hiệu bán lẻ |
| `slug` | VARCHAR(100) | UNIQUE, NOT NULL | Tên miền con duy nhất (subdomain) |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'ACTIVE' | `TRIAL`, `ACTIVE`, `PAST_DUE`, `SUSPENDED` |
| `plan_id` | VARCHAR(36) | FOREIGN KEY | Gói cước đang sử dụng trỏ về `subscription_plans(id)` |
| `trial_ends_at`| TIMESTAMPTZ | NULL | Ngày kết thúc thời gian dùng thử |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Thời điểm đăng ký |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Thời điểm cập nhật cuối |

### 1.2. Bảng `subscription_plans` (Gói Cước Dịch Vụ)
| Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(36) | PRIMARY KEY | Định danh gói cước |
| `name` | VARCHAR(100) | NOT NULL | Tên gói: `Starter`, `Growth`, `Enterprise` |
| `max_stores` | INT | NOT NULL | Giới hạn số lượng cửa hàng cho phép |
| `max_warehouses`| INT | NOT NULL | Giới hạn số lượng kho hàng cho phép |
| `max_users` | INT | NOT NULL | Giới hạn số lượng tài khoản nhân viên |
| `max_channels` | INT | NOT NULL | Giới hạn số lượng kênh sàn TMĐT kết nối |
| `price_monthly`| DECIMAL(12,2)| NOT NULL | Giá thuê bao theo tháng (VND) |
| `price_yearly` | DECIMAL(12,2)| NOT NULL | Giá thuê bao theo năm (VND) |

---

## 2. Nhóm Người Dùng & Phân Quyền (Identity & RBAC)

### 2.1. Bảng `users` (Tài Khoản Người Dùng)
| Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(36) | PRIMARY KEY | Định danh người dùng (UUID) |
| `tenant_id` | VARCHAR(36) | NULL, INDEX | Foreign Key trỏ về `tenants(id)` (NULL nếu là Super Admin) |
| `email` | VARCHAR(255) | NOT NULL, INDEX | Email đăng nhập (Unique trong cùng 1 Tenant) |
| `password_hash`| VARCHAR(255) | NOT NULL | Mật khẩu đã băm bằng bcrypt |
| `full_name` | VARCHAR(150) | NOT NULL | Họ và tên người dùng |
| `phone_number` | VARCHAR(20) | NULL | Số điện thoại liên hệ |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'ACTIVE' | `ACTIVE`, `INACTIVE`, `BLOCKED` |
| `store_id` | VARCHAR(36) | NULL, FOREIGN KEY | Cửa hàng được chỉ định làm việc (nếu là Cashier/Manager) |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Thời điểm tạo |

### 2.2. Bảng `roles` & `permissions`
- `roles`: `id`, `tenant_id`, `name`, `description`, `is_system_role` (vai trò mặc định không cho xóa).
- `permissions`: `id`, `code` (e.g. `products:read`), `module`, `description`.
- `role_permissions`: Bảng trung gian n-n giữa `roles` và `permissions`.
- `user_roles`: Bảng trung gian n-n giữa `users` và `roles`.

---

## 3. Nhóm Chi Nhánh & Kho Vận (Stores & Warehouses)

### 3.1. Bảng `stores` (Cửa Hàng Vật Lý)
| Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(36) | PRIMARY KEY | Định danh cửa hàng (UUID) |
| `tenant_id` | VARCHAR(36) | NOT NULL, FOREIGN KEY | Thuộc doanh nghiệp nào |
| `name` | VARCHAR(150) | NOT NULL | Tên cửa hàng (Ví dụ: Chi nhánh 1 - Quận 1) |
| `address` | TEXT | NOT NULL | Địa chỉ thực tế |
| `phone` | VARCHAR(20) | NULL | Hotline cửa hàng |
| `default_warehouse_id`| VARCHAR(36)| NULL, FOREIGN KEY | Kho hàng mặc định phục vụ bán lẻ tại cửa hàng này |

### 3.2. Bảng `warehouses` (Kho Hàng)
| Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(36) | PRIMARY KEY | Định danh kho hàng |
| `tenant_id` | VARCHAR(36) | NOT NULL, FOREIGN KEY | Thuộc doanh nghiệp nào |
| `name` | VARCHAR(150) | NOT NULL | Tên kho (Ví dụ: Kho Tổng Gia Dụng, Kho Cửa Hàng 1) |
| `type` | VARCHAR(20) | NOT NULL | `CENTRAL` (Kho tổng), `STORE_ATTACHED` (Kho tại shop) |
| `address` | TEXT | NULL | Địa chỉ kho |

---

## 4. Nhóm Sản Phẩm & Tồn Kho (Catalog & Inventory)

### 4.1. Bảng `products` & `product_variants`
- `products`: `id`, `tenant_id`, `name`, `category_id`, `brand`, `description`, `status` (`ACTIVE`, `DRAFT`, `ARCHIVED`).
- `product_variants`: `id`, `tenant_id`, `product_id`, `sku` (Mã SKU duy nhất trong Tenant), `barcode`, `variant_name` (Ví dụ: "Đen - 5L"), `cost_price` (Giá vốn), `selling_price` (Giá niêm yết).

### 4.2. Bảng `inventories` (Số Lượng Tồn Kho Đa Điểm)
| Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(36) | PRIMARY KEY | Định danh bản ghi tồn kho |
| `tenant_id` | VARCHAR(36) | NOT NULL, FOREIGN KEY | Thuộc doanh nghiệp |
| `warehouse_id` | VARCHAR(36) | NOT NULL, FOREIGN KEY | Thuộc kho nào |
| `variant_id` | VARCHAR(36) | NOT NULL, FOREIGN KEY | Thuộc biến thể sản phẩm nào |
| `on_hand_qty` | INT | NOT NULL, DEFAULT 0 | Số lượng thực tế trong kho |
| `committed_qty`| INT | NOT NULL, DEFAULT 0 | Số lượng đã giữ cho đơn hàng chờ đóng gói |
| `available_qty`| INT | GENERATED ALWAYS AS (on_hand_qty - committed_qty) STORED | Số lượng sẵn sàng bán |
| Ràng buộc duy nhất: `UNIQUE (tenant_id, warehouse_id, variant_id)` |

### 4.3. Bảng `inventory_transactions` (Lịch Sử Nhập / Xuất / Chuyển Kho)
- Lưu vết từng lần tăng/giảm tồn kho: `id`, `tenant_id`, `warehouse_id`, `variant_id`, `type` (`PURCHASE_RECEIPT`, `SALE_ORDER`, `STOCK_TRANSFER`, `ADJUSTMENT`), `quantity_delta` (+/-), `reason`, `reference_id` (Mã đơn hàng hoặc mã phiếu chuyển), `created_at`.

---

## 5. Nhóm Bán Hàng & Đơn Hàng Đa Kênh (Orders & Omnichannel)

### 5.1. Bảng `orders` (Đơn Hàng Hợp Nhất)
| Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(36) | PRIMARY KEY | Định danh đơn hàng |
| `tenant_id` | VARCHAR(36) | NOT NULL, FOREIGN KEY | Thuộc doanh nghiệp |
| `order_number` | VARCHAR(50) | NOT NULL, INDEX | Mã hiển thị (Ví dụ: `#ORD-202611-0001`) |
| `channel_type` | VARCHAR(30) | NOT NULL | `POS`, `SHOPEE`, `TIKTOK_SHOP`, `FACEBOOK`, `MANUAL` |
| `external_order_id`| VARCHAR(100)| NULL, INDEX | Mã đơn gốc trên sàn Shopee/TikTok |
| `store_id` | VARCHAR(36) | NULL, FOREIGN KEY | Cửa hàng phát sinh đơn (nếu là POS) |
| `warehouse_id` | VARCHAR(36) | NOT NULL, FOREIGN KEY | Kho chịu trách nhiệm xuất hàng |
| `customer_id` | VARCHAR(36) | NULL, FOREIGN KEY | Khách hàng mua hàng |
| `subtotal` | DECIMAL(12,2)| NOT NULL | Tiền hàng trước chiết khấu |
| `discount_amount`| DECIMAL(12,2)| DEFAULT 0 | Tiền giảm giá |
| `total_amount` | DECIMAL(12,2)| NOT NULL | Tổng tiền phải thanh toán |
| `status` | VARCHAR(30) | NOT NULL | `PENDING`, `CONFIRMED`, `PACKED`, `SHIPPED`, `COMPLETED`, `CANCELLED` |
| `payment_status`| VARCHAR(30) | NOT NULL | `UNPAID`, `PAID`, `REFUNDED` |
| `payment_method`| VARCHAR(30) | NOT NULL | `CASH`, `VIETQR`, `BANK_TRANSFER`, `CREDIT_CARD`, `PLATFORM_ESCROW` |

### 5.2. Bảng `order_items` (Chi Tiết Món Hàng)
- `id`, `tenant_id`, `order_id`, `variant_id`, `product_name`, `sku`, `quantity`, `unit_price`, `subtotal`.

---

## 6. Nhóm Kênh Bán Hàng & Hội Thoại (Channels & Conversations)

### 6.1. Bảng `channel_connections` (Liên Kết Kênh Sàn & Fanpage)
- `id`, `tenant_id`, `channel_type` (`SHOPEE`, `TIKTOK`, `FACEBOOK_PAGE`), `account_name`, `account_id` (Shop ID hoặc Page ID), `access_token` (Mã hóa AES-256), `refresh_token`, `expires_at`, `status` (`CONNECTED`, `EXPIRED`, `REVOKED`).

### 6.2. Bảng `conversations` & `messages` (Hộp Thư Tập Trung)
- `conversations`: `id`, `tenant_id`, `connection_id`, `external_sender_id`, `sender_name`, `avatar_url`, `assigned_user_id` (Nhân viên được phân công), `status` (`OPEN`, `RESOLVED`, `SPAM`), `last_message_at`.
- `messages`: `id`, `tenant_id`, `conversation_id`, `sender_type` (`CUSTOMER`, `AGENT`), `content`, `attachments` (JSONB), `is_read`, `created_at`.
