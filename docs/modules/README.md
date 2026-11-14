# Danh Mục Phân Hệ Nghiệp Vụ — Modules Catalog

> Trạng thái thông tin: `[PROPOSED]` Bản đồ module nghiệp vụ theo chuẩn Modular Monolith.

Thư mục `docs/modules/` chứa tài liệu phân tích chi tiết của **13 module chức năng cốt lõi** trong hệ thống **NEXORA — Commerce Management Platform**.

Mỗi tài liệu module tuân thủ cấu trúc 12 phần chuẩn mực:
1. Mục đích (Purpose)
2. Phạm vi nghiệp vụ (Business Scope)
3. Đối tượng sử dụng (Target Users)
4. Các chức năng chính (Core Features)
5. Quy tắc nghiệp vụ (Business Rules - `BR-*`)
6. Thực thể dữ liệu liên quan (Data Entities)
7. Mối quan hệ với module khác (Inter-Module Dependencies)
8. Danh mục API dự kiến (Endpoints)
9. Quyền truy cập & Phân quyền (Permissions)
10. Các trường hợp biên & Ngoại lệ (Edge Cases)
11. Tiêu chí nghiệm thu (Acceptance Criteria)
12. Những điểm còn bỏ ngỏ cần xác nhận (Pending Decisions)

---

## Danh Sách Các Tài Liệu Module

| Module | Tên File Tài Liệu | Trọng Tâm Nghiệp Vụ |
| :--- | :--- | :--- |
| **SaaS Management** | [SAAS_MANAGEMENT.md](./SAAS_MANAGEMENT.md) | Quản trị toàn hệ sinh thái SaaS, cấu hình nền tảng |
| **Authentication** | [AUTHENTICATION.md](./AUTHENTICATION.md) | Đăng nhập, JWT rotation, bảo mật tài khoản |
| **Tenant Management** | [TENANT_MANAGEMENT.md](./TENANT_MANAGEMENT.md) | Vòng đời doanh nghiệp, hồ sơ công ty |
| **User Management** | [USER_MANAGEMENT.md](./USER_MANAGEMENT.md) | Quản trị nhân sự, gán vai trò nhân viên |
| **Store Management** | [STORE_MANAGEMENT.md](./STORE_MANAGEMENT.md) | Quản lý 2 chi nhánh cửa hàng và quầy POS |
| **Product Management**| [PRODUCT_MANAGEMENT.md](./PRODUCT_MANAGEMENT.md)| Quản lý danh mục sản phẩm đồ gia dụng, biến thể, SKU |
| **Inventory Management**| [INVENTORY_MANAGEMENT.md](./INVENTORY_MANAGEMENT.md)| Tồn kho đa kho, phiếu nhập/chuyển, xử lý concurrency lock |
| **Order Management** | [ORDER_MANAGEMENT.md](./ORDER_MANAGEMENT.md) | Quản lý vòng đời đơn hàng POS & Online |
| **Customer Management**| [CUSTOMER_MANAGEMENT.md](./CUSTOMER_MANAGEMENT.md)| Hồ sơ khách hàng, công nợ, lịch sử mua sắm |
| **Omnichannel** | [OMNICHANNEL.md](./OMNICHANNEL.md) | Kết nối Open API Shopee, TikTok Shop, đồng bộ 2 chiều |
| **Conversation** | [CONVERSATION_MANAGEMENT.md](./CONVERSATION_MANAGEMENT.md)| Unified Inbox, gom chat Facebook/TikTok, tạo đơn từ chat |
| **Subscription & Billing**| [SUBSCRIPTION_BILLING.md](./SUBSCRIPTION_BILLING.md)| Gói cước, thu phí định kỳ, gia hạn, hóa đơn |
| **Business Intelligence**| [BUSINESS_INTELLIGENCE.md](./BUSINESS_INTELLIGENCE.md)| Dashboard thống kê, báo cáo doanh thu thực sau phí sàn |
