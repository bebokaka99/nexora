# Sơ Đồ Quan Hệ Thực Thể — Entity Relationship Diagram (ERD)

> Trạng thái thông tin: `[PROPOSED]` Mô hình thực thể cơ sở dữ liệu quan hệ được trực quan hóa bằng Mermaid ER Diagram.

Tài liệu này thể hiện toàn bộ quan hệ ràng buộc (Foreign Keys, Quan hệ 1-n, n-n) giữa các thực thể trong nền tảng **NEXORA**.

---

## 1. Sơ Đồ ERD Tổng Thể Hệ Thống

```mermaid
erDiagram
    TENANTS ||--o{ USERS : "has many"
    TENANTS ||--o{ STORES : "owns"
    TENANTS ||--o{ WAREHOUSES : "owns"
    TENANTS ||--o{ PRODUCTS : "catalogs"
    TENANTS ||--o{ ORDERS : "manages"
    TENANTS ||--o{ CUSTOMERS : "tracks"
    TENANTS ||--o{ CHANNEL_CONNECTIONS : "integrates"
    SUBSCRIPTION_PLANS ||--o{ TENANTS : "subscribes to"

    USERS ||--o{ USER_ROLES : "assigned"
    ROLES ||--o{ USER_ROLES : "has"
    ROLES ||--o{ ROLE_PERMISSIONS : "includes"
    PERMISSIONS ||--o{ ROLE_PERMISSIONS : "defined in"
    STORES ||--o{ USERS : "employs"

    STORES ||--|| WAREHOUSES : "linked default warehouse"

    PRODUCTS ||--|{ PRODUCT_VARIANTS : "has variants"
    CATEGORIES ||--o{ PRODUCTS : "categorizes"

    PRODUCT_VARIANTS ||--o{ INVENTORIES : "stocked in"
    WAREHOUSES ||--o{ INVENTORIES : "holds stock of"
    INVENTORIES ||--o{ INVENTORY_TRANSACTIONS : "logs changes"

    CUSTOMERS ||--o{ ORDERS : "places"
    STORES ||--o{ ORDERS : "processes POS"
    WAREHOUSES ||--o{ ORDERS : "fulfills from"
    ORDERS ||--|{ ORDER_ITEMS : "contains"
    PRODUCT_VARIANTS ||--o{ ORDER_ITEMS : "ordered as"

    CHANNEL_CONNECTIONS ||--o{ ORDERS : "sources from"
    CHANNEL_CONNECTIONS ||--o{ CONVERSATIONS : "receives"
    CONVERSATIONS ||--|{ MESSAGES : "contains"
    USERS ||--o{ CONVERSATIONS : "assigned agent"

    TENANTS {
        string id PK
        string name
        string slug UK
        string status
        string plan_id FK
        datetime trial_ends_at
    }

    USERS {
        string id PK
        string tenant_id FK
        string email
        string password_hash
        string full_name
        string store_id FK
    }

    STORES {
        string id PK
        string tenant_id FK
        string name
        string default_warehouse_id FK
    }

    WAREHOUSES {
        string id PK
        string tenant_id FK
        string name
        string type
    }

    PRODUCTS {
        string id PK
        string tenant_id FK
        string name
        string category_id FK
        string status
    }

    PRODUCT_VARIANTS {
        string id PK
        string tenant_id FK
        string product_id FK
        string sku UK
        string barcode
        decimal cost_price
        decimal selling_price
    }

    INVENTORIES {
        string id PK
        string tenant_id FK
        string warehouse_id FK
        string variant_id FK
        int on_hand_qty
        int committed_qty
        int available_qty
    }

    ORDERS {
        string id PK
        string tenant_id FK
        string order_number UK
        string channel_type
        string warehouse_id FK
        string customer_id FK
        decimal total_amount
        string status
        string payment_status
    }

    ORDER_ITEMS {
        string id PK
        string tenant_id FK
        string order_id FK
        string variant_id FK
        int quantity
        decimal unit_price
    }

    CONVERSATIONS {
        string id PK
        string tenant_id FK
        string connection_id FK
        string sender_name
        string assigned_user_id FK
        string status
    }
```

---

## 2. Các Mối Quan Hệ Nghiệp Vụ Trọng Điểm

1. **Phân cấp Tổ chức: `Tenant -> Store -> Warehouse`**
   - Một `Tenant` sở hữu nhiều `Store` và nhiều `Warehouse`.
   - Mỗi `Store` được liên kết với một `Warehouse` mặc định để phục vụ trừ kho tức thì khi bán hàng tại quầy POS.
2. **Quản lý Hàng Hóa: `Product -> ProductVariant -> Inventory`**
   - Sản phẩm cha (`Product`) chỉ chứa thông tin chung (tên, danh mục, thương hiệu, mô tả).
   - Biến thể (`ProductVariant`) chứa thông tin kinh doanh cụ thể (SKU, barcode, giá vốn, giá bán).
   - Tồn kho (`Inventory`) là bảng trung gian liên kết giữa `ProductVariant` và `Warehouse` theo quan hệ n-n, đảm bảo theo dõi chính xác số lượng của từng biến thể tại từng kho riêng biệt.
3. **Đơn Hàng Đa Kênh: `ChannelConnection -> Order -> OrderItem`**
   - Mỗi đơn hàng đều ghi nhận `channel_type` (Shopee, TikTok, POS, Facebook) và liên kết đến kho xuất hàng `warehouse_id`.
