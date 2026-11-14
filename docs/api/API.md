# Tổng Quan Danh Mục REST API — API Overview

> Trạng thái thông tin: `[PROPOSED]` Định nghĩa chuẩn RESTful API cho nền tảng NEXORA.

Tài liệu này cung cấp danh mục khái quát các nhóm tài nguyên (Resources) và điểm cuối (Endpoints) trong hệ thống REST API của **NEXORA**. Toàn bộ tài liệu chi tiết được tự động sinh và kiểm thử tương tác thông qua Swagger UI tại đường dẫn `/swagger`.

---

## 1. Bản Đồ Tài Nguyên REST API (API Resources Map)

Tất cả các endpoint đều có tiền tố phiên bản: `/api/v1/`

| Nhóm Tài Nguyên | Đường Dẫn Gốc (Base Path) | Mục Đích Nghiệp Vụ |
| :--- | :--- | :--- |
| **Xác thực (Auth)** | `/api/v1/auth` | Đăng nhập, đăng xuất, làm mới token, quên mật khẩu |
| **Doanh nghiệp (Tenants)** | `/api/v1/tenants` | Quản lý thông tin doanh nghiệp, cấu hình thương hiệu |
| **Người dùng (Users)** | `/api/v1/users` | Quản lý danh sách nhân sự, gán vai trò, đổi mật khẩu |
| **Vai trò (Roles)** | `/api/v1/roles` | Quản lý vai trò tùy chỉnh và danh mục quyền hạn |
| **Cửa hàng (Stores)** | `/api/v1/stores` | Quản lý các chi nhánh cửa hàng vật lý |
| **Kho hàng (Warehouses)** | `/api/v1/warehouses` | Quản lý danh sách kho và loại kho (Tổng/Chi nhánh) |
| **Sản phẩm (Products)** | `/api/v1/products` | Quản lý sản phẩm, biến thể, giá bán, giá vốn |
| **Tồn kho (Inventory)** | `/api/v1/inventories` | Tra cứu tồn, tạo phiếu nhập/xuất/chuyển kho |
| **Bán hàng tại quầy (POS)** | `/api/v1/pos` | Quản lý ca thu ngân, thanh toán nhanh, in hóa đơn |
| **Đơn hàng (Orders)** | `/api/v1/orders` | Quản lý đơn hàng đa kênh, đổi trạng thái, hủy đơn |
| **Khách hàng (Customers)** | `/api/v1/customers` | Quản lý hồ sơ khách hàng, địa chỉ, lịch sử mua sắm |
| **Kênh bán hàng (Channels)** | `/api/v1/channels` | Kết nối OAuth Shopee, TikTok Shop, Facebook Fanpage |
| **Hội thoại (Conversations)**| `/api/v1/conversations` | Hộp thư tập trung, danh sách tin nhắn, tạo đơn từ chat |
| **Gói cước (Subscriptions)**| `/api/v1/subscriptions` | Quản lý gói cước, gia hạn, nâng cấp, lịch sử hóa đơn |
| **Báo cáo (Reports)** | `/api/v1/reports` | Dữ liệu dashboard, báo cáo doanh thu, tồn kho, nhân viên |
| **Nhật ký (Audit Logs)** | `/api/v1/audit-logs` | Tra cứu lịch sử thao tác hệ thống |

---

## 2. Bản Đồ Tài Liệu API Chi Tiết

- [**API_CONVENTIONS.md**](./API_CONVENTIONS.md): Quy chuẩn phương thức HTTP, cấu trúc Envelope, phân trang, lọc và sắp xếp.
- [**AUTHENTICATION.md**](./AUTHENTICATION.md): Hướng dẫn truyền Token xác thực và cơ chế luân chuyển phiên.
- [**ERROR_HANDLING.md**](./ERROR_HANDLING.md): Cấu trúc mã lỗi chuẩn và danh mục mã lỗi nghiệp vụ.
- [**API_VERSIONING.md**](./API_VERSIONING.md): Chiến lược đánh phiên bản API và chính sách deprecation.
