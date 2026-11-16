# TASK-006: Xây dựng Module Quản lý Sản phẩm & Biến thể hàng gia dụng (Product Catalog Core)

- **Mã nhiệm vụ**: `TASK-006`
- **Giai đoạn**: `Phase 04 — Product Catalog (Quản lý sản phẩm & Danh mục hàng gia dụng)`
- **Epic**: `EPIC-04-A`, `EPIC-04-B`, `EPIC-04-C`
- **Trạng thái**: `DONE` (Hoàn thành)
- **Người thực hiện**: Fullstack Engineer
- **Độ ưu tiên**: Cao nhất (P0)

## 1. Mục đích công việc
Xây dựng phân hệ quản lý danh mục sản phẩm đồ gia dụng (`Category`), danh mục sản phẩm cốt lõi (`Product`), các biến thể sản phẩm đa thuộc tính (`ProductVariant`), định danh mã SKU duy nhất trong doanh nghiệp (`tenantId`), mã vạch Barcode phục vụ quét tại quầy thu ngân POS (`findByBarcode`) và quản lý cấu trúc giá bán lẻ niêm yết/giá vốn ước tính.

Đảm bảo:
1. Mỗi biến thể sản phẩm có một mã SKU duy nhất trong phạm vi doanh nghiệp (`tenant_id`), ngăn chặn trùng mã với HTTP 409 `ConflictException`.
2. Hỗ trợ tra cứu nhanh sản phẩm qua Barcode EAN-13 / Code-128 phục vụ quẹt mã tại quầy thu ngân POS.
3. Khi xóa sản phẩm, hệ thống áp dụng cơ chế xóa mềm (`deletedAt` per `BR-PROD-003`), đảm bảo tính toàn vẹn dữ liệu cho các đơn hàng trong quá khứ.
4. Cung cấp API quản lý danh mục và sản phẩm có tài liệu Swagger OpenAPI đầy đủ.
5. Giao diện người dùng trong tab **"Sản Phẩm"** trên Dashboard hiển thị dữ liệu động, hỗ trợ tìm kiếm đa năng, lọc theo ngành hàng và thêm mới sản phẩm kèm biến thể qua Modal.

## 2. Phạm vi thay đổi (Scope)

### A. Tầng Backend (`backend/src/modules/product/`)
1. **DTOs với kiểm thực dữ liệu nghiêm ngặt (`class-validator`)**:
   - `CreateCategoryDto`: Tên danh mục, slug định danh.
   - `CreateProductVariantDto`: Tên biến thể, mã SKU, mã Barcode, giá vốn (`costPrice`), giá bán lẻ (`sellingPrice`).
   - `CreateProductDto`: Tên sản phẩm, slug, categoryId, thương hiệu (`brand`), mô tả, trạng thái (`status`), mảng biến thể (`variants`).
   - `UpdateProductDto`: Cập nhật tên, danh mục, thương hiệu, mô tả, trạng thái.
   - `QueryProductDto`: Tìm kiếm đa năng theo từ khóa, lọc theo categoryId, thương hiệu, trạng thái.
2. **`ProductService`**:
   - Kiến trúc **Dual-Mode**: Hỗ trợ đầy đủ Prisma ORM kết hợp In-Memory Fallback có sẵn 5 danh mục ngành hàng gia dụng mẫu và 10 sản phẩm đồ gia dụng tiêu biểu (Nồi chiên không dầu, Chảo chống dính, Ấm siêu tốc, Máy xay, Nồi cơm điện).
   - `findAllCategories(tenantId)` & `createCategory(tenantId, dto)`: Quản lý danh mục ngành hàng.
   - `findAll(tenantId, query)`: Tra cứu sản phẩm kèm danh mục và các biến thể.
   - `findById(tenantId, id)`: Chi tiết sản phẩm.
   - `findByBarcode(tenantId, barcode)`: Tra cứu nhanh theo mã vạch cho máy quét POS.
   - `create(tenantId, dto)`: Tạo sản phẩm mới kèm các biến thể, kiểm tra SKU duy nhất và tự động khởi tạo bản ghi tồn kho ban đầu tại các kho hàng của Tenant.
   - `update(tenantId, id, dto)`: Cập nhật thông tin sản phẩm.
   - `remove(tenantId, id)`: Xóa mềm sản phẩm bằng cách gán `deletedAt = new Date()`.
3. **`ProductController`**: Xuất bản 8 REST API endpoints có Swagger OpenAPI và phân quyền `JwtAuthGuard`.
4. **`ProductModule`**: Đăng ký vào `AppModule`.

### B. Tầng Frontend (`frontend/`)
1. **Dịch vụ `frontend/lib/services/product-service.ts`**:
   - Cung cấp các hàm gọi API: `getCategories`, `createCategory`, `getProducts`, `getProductById`, `getProductByBarcode`, `createProduct`, `updateProduct`, `deleteProduct`.
2. **Cập nhật Giao diện Dashboard (`frontend/app/dashboard/page.tsx`)**:
   - **Tab Sản Phẩm**:
     - Tích hợp tải danh mục và sản phẩm thực tế từ backend thông qua `productService`.
     - Thanh tìm kiếm sản phẩm đa năng theo tên, thương hiệu, mã SKU hoặc Barcode.
     - Bộ lọc dropdown theo từng ngành hàng gia dụng (Nồi chiên, Chảo, Ấm siêu tốc, Máy xay, Nồi cơm).
     - Thẻ sản phẩm hiển thị nhãn danh mục, mã SKU, mã Barcode kèm biểu tượng, thương hiệu, giá bán lẻ niêm yết và giá vốn.
   - **Modal Thêm Mới Sản Phẩm**:
     - Biểu mẫu nhập tên sản phẩm, chọn ngành hàng, thương hiệu, mô tả.
     - Phân vùng cấu hình biến thể: Tên biến thể, mã SKU duy nhất, mã vạch Barcode (tự sinh nếu để trống), giá bán lẻ và giá vốn.
     - Nút lưu kết nối trực tiếp với API backend, cập nhật ngay lập tức vào danh sách hiển thị và bảng tin hoạt động (Activity Feed).

## 3. Tiêu chí nghiệm thu (Acceptance Criteria)
- [x] Gọi API `GET /api/v1/products/categories` trả về danh sách các danh mục đồ gia dụng của Tenant.
- [x] Gọi API `POST /api/v1/products/categories` tạo danh mục mới thành công, ngăn chặn trùng `slug` trong cùng Tenant (HTTP 409 Conflict).
- [x] Gọi API `GET /api/v1/products` hỗ trợ tìm kiếm theo từ khóa tên, thương hiệu, SKU hoặc Barcode.
- [x] Gọi API `POST /api/v1/products` tạo sản phẩm mới kèm danh sách biến thể, ngăn chặn trùng mã SKU trong toàn Tenant (HTTP 409 Conflict).
- [x] Gọi API `GET /api/v1/products/barcode/:barcode` trả về chính xác biến thể sản phẩm tương ứng với tốc độ cao phục vụ quầy thu ngân POS.
- [x] Gọi API `DELETE /api/v1/products/:id` thực hiện xóa mềm (`deletedAt`), ẩn sản phẩm khỏi các truy vấn kinh doanh thông thường.
- [x] Giao diện Dashboard tab Sản Phẩm hiển thị danh sách sản phẩm động, tích hợp bộ lọc tìm kiếm và modal thêm mới sản phẩm hoạt động trơn tru.
- [x] Kịch bản kiểm thử tự động `node scripts/test-task-006.mjs` vượt qua 100% (9/9 bước kiểm thử).

## 4. Kết quả nghiệm thu thực tế
- Backend: Đã biên dịch NestJS thành công, xuất bản 8 endpoint mới cho `Products` & `Categories` có tài liệu Swagger đầy đủ.
- Frontend: Đã biên dịch Next.js 15 thành công (15/15 routes), tích hợp `productService` và Modal tạo sản phẩm.
- Kiểm thử E2E: Đã chạy thành công 9/9 bước kiểm thử độc lập, xác nhận trọn vẹn nghiệp vụ danh mục, biến thể, mã vạch và xóa mềm.
