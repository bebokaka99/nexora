# Phân Hệ Quản Lý Cửa Hàng & Điểm Bán — Store Management Module

> Trạng thái thông tin: `[CONFIRMED]` cho 2 cửa hàng vật lý hiện tại | `[PROPOSED]` cho quản lý quầy thu ngân và chi nhánh mở rộng.

## 1. Mục Đích
Phân hệ Store Management quản trị danh sách các cửa hàng vật lý trực thuộc doanh nghiệp bán lẻ, thiết lập quầy thu ngân (POS Registers) và liên kết từng cửa hàng với kho hàng phục vụ bán lẻ.

## 2. Phạm Vi Nghiệp Vụ
- Khai báo và quản lý danh sách cửa hàng (hiện tại: 2 cửa hàng đồ gia dụng).
- Thiết lập thông tin chi nhánh: Tên hiển thị, địa chỉ, số hotline, giờ mở cửa.
- Liên kết kho hàng mặc định (Default Warehouse) cho từng cửa hàng.
- Quản lý các quầy thu ngân (POS Registers) thuộc cửa hàng.

## 3. Đối Tượng Sử Dụng
- Tenant Administrator.
- Store Manager (Quản lý chi nhánh).

## 4. Các Chức Năng Chính
- **Quản Lý Chi Nhánh:** Thêm mới, chỉnh sửa thông tin cửa hàng, kích hoạt/tạm ngừng hoạt động.
- **Liên Kết Kho Hàng:** Cấu hình kho xuất hàng tự động khi nhân viên bán hàng tại quầy tạo đơn.
- **Quản Lý Quầy Thu Ngân (Registers):** Khai báo máy POS 1, máy POS 2 tại từng chi nhánh để đối soát dòng tiền theo ca.

## 5. Quy Tắc Nghiệp Vụ (Business Rules)
- `BR-STORE-001`: Mỗi cửa hàng bắt buộc phải gắn liền với ít nhất một kho hàng mặc định (`default_warehouse_id`).
- `BR-STORE-002`: Khi một đơn hàng được tạo tại quầy POS của Cửa hàng X, hàng hóa sẽ được tự động trừ vào kho mặc định của Cửa hàng X.
- `BR-STORE-003`: Không thể xóa cửa hàng nếu đang có đơn hàng hoặc phiếu chuyển kho đang ở trạng thái xử lý dở dang.

## 6. Dữ Liệu Liên Quan
- `stores`, `warehouses`, `users`, `orders`, `tenants`.

## 7. Quan Hệ Với Module Khác
- Liên kết trực tiếp với `WarehouseManagementModule` và `OrderManagementModule` (nguồn gốc đơn hàng POS).

## 8. API Dự Kiến
- `GET /api/v1/stores`: Danh sách cửa hàng của doanh nghiệp.
- `POST /api/v1/stores`: Tạo cửa hàng mới.
- `GET /api/v1/stores/{id}`: Chi tiết cửa hàng.
- `PATCH /api/v1/stores/{id}`: Cập nhật thông tin cửa hàng.
- `GET /api/v1/stores/{id}/registers`: Danh sách quầy thu ngân của cửa hàng.

## 9. Quyền Truy Cập
- Quyền: `stores:read`, `stores:create`, `stores:update`, `stores:delete`.
- Tenant Admin có toàn quyền; Store Manager chỉ có quyền xem và cập nhật chi nhánh mình quản lý.

## 10. Các Trường Hợp Biên (Edge Cases)
- Cửa hàng tạm thời đóng cửa bảo trì: Quản trị viên chuyển trạng thái sang `MAINTENANCE` -> Các thu ngân thuộc cửa hàng đó bị chặn không cho mở ca bán hàng mới trên giao diện POS.

## 11. Tiêu Chí Nghiệm Thu (Acceptance Criteria)
- Tạo thành công Cửa hàng số 2 và gán Kho 2 -> Nhân viên thu ngân chọn Cửa hàng 2 đăng nhập -> Màn hình POS hiển thị đúng tồn kho của Kho 2.

## 12. Những Điểm Cần Xác Nhận Với Khách Hàng `[UNDECIDED]`
- Khách hàng có kế hoạch mở thêm bao nhiêu cửa hàng mới trong năm tới?
- Có cho phép nhân viên bán hàng tại Cửa hàng 1 tạo đơn và yêu cầu Cửa hàng 2 giao hàng cho khách không (Bán chéo liên chi nhánh)?
