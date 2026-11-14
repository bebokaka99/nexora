# Phân Hệ Quản Lý Sản Phẩm & Danh Mục — Product Management Module

> Trạng thái thông tin: `[CONFIRMED]` cho ngành hàng đồ gia dụng & biến thể | `[PROPOSED]` cho chuẩn hóa SKU đa kênh.

## 1. Mục Đích
Phân hệ Product Management quản lý toàn bộ dữ liệu danh mục hàng hóa, thông tin chi tiết sản phẩm đồ gia dụng, các biến thể (màu sắc, kích thước, công suất), mã vạch Barcode và bảng giá niêm yết/giá vốn.

## 2. Phạm Vi Nghiệp Vụ
- Quản lý danh mục sản phẩm đồ gia dụng nhiều cấp (ví dụ: Gia Dụng Nhà Bếp -> Nồi Chiên Không Dầu).
- Quản lý sản phẩm đơn giản (Simple Product) và sản phẩm có biến thể (Configurable Product with Variants).
- Quản lý mã SKU, mã Barcode phục vụ quét tại quầy POS.
- Quản lý giá bán lẻ, giá bán buôn, giá vốn và tỷ lệ thuế VAT.
- Lưu trữ hình ảnh sản phẩm, thông số kỹ thuật và tài liệu bảo hành.

## 3. Đối Tượng Sử Dụng
- Tenant Administrator.
- Store Manager.
- Cashier & Chat Agent (chỉ xem thông tin sản phẩm và giá).

## 4. Các Chức Năng Chính
- **Thêm Mới Sản Phẩm Đa Biến Thể:** Nhập tên sản phẩm, chọn danh mục, tự động sinh ma trận biến thể dựa trên các thuộc tính (ví dụ: Màu: Đen, Trắng; Dung tích: 5L, 7L -> sinh 4 biến thể).
- **Quản Lý Mã SKU & Barcode:** Thiết lập mã SKU duy nhất và mã vạch cho từng biến thể; hỗ trợ tự động sinh mã vạch chuẩn EAN-13 hoặc Code-128.
- **Quản Lý Bảng Giá:** Thiết lập giá bán lẻ tại quầy, giá bán trên các sàn TMĐT và giá vốn ước tính.
- **Nhập / Xuất Dữ Liệu Hàng Loạt:** Hỗ trợ nhập (Import) và xuất (Export) danh mục sản phẩm từ file Excel chuẩn.

## 5. Quy Tắc Nghiệp Vụ (Business Rules)
- `BR-PROD-001`: Mã SKU của từng biến thể phải là duy nhất trong phạm vi doanh nghiệp (`tenant_id`).
- `BR-PROD-002`: Giá bán lẻ không được nhỏ hơn 0; giá vốn (`cost_price`) chỉ người dùng có quyền quản trị mới được nhìn thấy.
- `BR-PROD-003`: Khi xóa một sản phẩm, hệ thống áp dụng cơ chế xóa mềm (`deleted_at`); các đơn hàng trong quá khứ vẫn giữ nguyên thông tin sản phẩm tại thời điểm giao dịch.

## 6. Dữ Liệu Liên Quan
- `products`, `product_variants`, `categories`, `brands`, `inventories`.

## 7. Quan Hệ Với Module Khác
- Cung cấp dữ liệu sản phẩm cho `InventoryManagementModule`, `OrderManagementModule`, `OmnichannelModule` (ghép nối SKU sàn) và `POSModule`.

## 8. API Dự Kiến
- `GET /api/v1/products`: Danh sách sản phẩm (có phân trang, tìm kiếm, lọc danh mục).
- `POST /api/v1/products`: Tạo sản phẩm mới kèm biến thể.
- `GET /api/v1/products/{id}`: Chi tiết sản phẩm.
- `PATCH /api/v1/products/{id}`: Cập nhật thông tin sản phẩm.
- `DELETE /api/v1/products/{id}`: Xóa mềm sản phẩm.
- `GET /api/v1/products/barcode/{barcode}`: Tìm nhanh sản phẩm theo mã vạch cho máy quét POS.

## 9. Quyền Truy Cập
- Quyền: `products:read`, `products:create`, `products:update`, `products:delete`, `products:view_cost_price`.
- Cashier và Chat Agent không có quyền xem `cost_price`.

## 10. Các Trường Hợp Biên (Edge Cases)
- Sản phẩm được đổi tên hoặc đổi giá sau khi khách hàng đã đặt đơn: Đơn hàng cũ giữ nguyên giá và tên tại thời điểm đặt; chỉ các đơn hàng mới phát sinh mới áp dụng giá mới.

## 11. Tiêu Chí Nghiệm Thu (Acceptance Criteria)
- Tạo sản phẩm Nồi cơm điện có 2 biến thể (1.8L và 2.2L) -> Hệ thống tự động tạo 2 bản ghi trong `product_variants` và khởi tạo bản ghi tồn kho tương ứng bằng 0 tại tất cả các kho hiện có.

## 12. Những Điểm Cần Xác Nhận Với Khách Hàng `[UNDECIDED]`
- Các sản phẩm gia dụng có cần quản lý số Seri/IMEI cho từng máy cụ thể để phục vụ kích hoạt bảo hành điện tử hay chỉ quản lý theo mã SKU chung?
