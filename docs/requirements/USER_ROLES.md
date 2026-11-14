# Ma Trận Phân Quyền Người Dùng — User Roles & Permissions (RBAC)

> Trạng thái thông tin: `[CONFIRMED]` cho vai trò bán lẻ nội bộ | `[PROPOSED]` cho hệ thống danh mục quyền phân cấp (Granular Permissions).

NEXORA áp dụng mô hình phân quyền dựa trên vai trò (Role-Based Access Control - RBAC). Mỗi người dùng được gán một hoặc nhiều Vai trò (Roles), và mỗi Vai trò bao gồm một tập hợp các Quyền hạn cụ thể (Permissions).

---

## 1. Danh Mục Các Vai Trò Mặc Định Trong Hệ Thống

| Mã Vai Trò | Tên Vai Trò | Cấp Độ | Phạm Vi Truy Cập (Scope) |
| :--- | :--- | :--- | :--- |
| `ROLE_PLATFORM_SUPER_ADMIN` | Quản trị viên tối cao nền tảng | Platform | Toàn hệ thống NEXORA (tất cả Tenants, Subscription, System Settings) |
| `ROLE_TENANT_ADMIN` | Chủ doanh nghiệp / Quản trị viên Tenant | Tenant | Toàn bộ dữ liệu của Tenant đó (tất cả Cửa hàng, Kho, Nhân sự, Báo cáo) |
| `ROLE_STORE_MANAGER` | Cửa hàng trưởng / Quản lý chi nhánh | Store | Dữ liệu thuộc Cửa hàng và Kho gắn với cửa hàng được phân công |
| `ROLE_CASHIER` | Thu ngân / Nhân viên bán hàng tại quầy | POS | Màn hình POS, tạo đơn tại quầy, quản lý ca tiền mặt của mình |
| `ROLE_WAREHOUSE_STAFF` | Thủ kho / Nhân viên kho vận | Warehouse | Quản lý phiếu nhập/xuất/chuyển kho, kiểm kê và đóng gói đơn hàng |
| `ROLE_CHAT_AGENT` | Nhân viên trực chat & chốt đơn | Channel | Hộp thư hội thoại (Unified Inbox), tạo đơn hàng từ chat, xem tồn kho |

---

## 2. Ma Trận Phân Quyền Chi Tiết (Role-Permission Matrix)

Ký hiệu:
- `FULL`: Có đầy đủ quyền Xem, Tạo, Sửa, Xóa.
- `VIEW`: Chỉ có quyền Xem dữ liệu.
- `LIMITED`: Giới hạn phạm vi thao tác (được ghi chú cụ thể).
- `-`: Không có quyền truy cập.

| Nhóm Chức Năng / Quyền Hạn | Platform Super Admin | Tenant Admin | Store Manager | Cashier | Warehouse Staff | Chat Agent |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Quản trị nền tảng (Tenants & Plans)** | `FULL` | - | - | - | - | - |
| **Cấu hình doanh nghiệp & Chi nhánh** | `FULL` | `FULL` | `VIEW` | - | - | - |
| **Quản lý Nhân sự & Gán vai trò** | `FULL` | `FULL` | `LIMITED` (chỉ thu ngân) | - | - | - |
| **Quản lý Sản phẩm & Bảng giá** | `VIEW` | `FULL` | `VIEW` | `VIEW` | `VIEW` | `VIEW` |
| **Quản lý Tồn kho & Phiếu nhập/chuyển** | - | `FULL` | `LIMITED` (kho của mình)| `VIEW` | `FULL` | `VIEW` |
| **Bán hàng tại quầy (POS)** | - | `FULL` | `FULL` | `FULL` | - | - |
| **Quản lý Đơn hàng đa kênh** | - | `FULL` | `LIMITED` (đơn tại shop) | `VIEW` | `LIMITED` (đóng gói) | `LIMITED` (đơn từ chat) |
| **Hộp thư hội thoại (Facebook/TikTok)**| - | `FULL` | `VIEW` | - | - | `FULL` |
| **Kết nối Sàn TMĐT (Shopee/TikTok)** | - | `FULL` | - | - | - | - |
| **Báo cáo tài chính & Doanh thu** | `FULL` (MRR) | `FULL` | `LIMITED` (doanh số shop)| - | - | - |
| **Nhật ký kiểm toán (Audit Logs)** | `FULL` | `FULL` | - | - | - | - |

---

## 3. Cấu Trúc Khóa Quyền Hạn (Permission Key Convention)

Mọi quyền hạn trong hệ thống backend và frontend được định danh theo quy tắc:
`[resource]:[action]`

Ví dụ:
- `products:read`, `products:create`, `products:update`, `products:delete`
- `orders:read`, `orders:create`, `orders:cancel`, `orders:refund`
- `inventory:transfer`, `inventory:adjust`, `inventory:view_cost_price`
- `channels:connect`, `channels:disconnect`, `channels:sync`
- `pos:open_session`, `pos:close_session`, `pos:apply_discount`
