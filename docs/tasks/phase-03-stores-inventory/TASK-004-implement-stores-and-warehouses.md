# TASK-004: Xây dựng Module Quản lý Cửa hàng & Kho hàng (Stores & Warehouses Core)

- **Mã nhiệm vụ**: `TASK-004`
- **Giai đoạn**: `Phase 03 - Stores & Warehouses Core`
- **Epic**: `EPIC-03-A`, `EPIC-03-B`
- **Trạng thái**: `DONE` (Hoàn thành)
- **Người thực hiện**: Fullstack Engineer
- **Độ ưu tiên**: Cao nhất (P0)

## 1. Mục đích công việc
Xây dựng phân hệ quản lý thông tin các chi nhánh cửa hàng vật lý (`Store`) và hệ thống kho hàng liên kết (`Warehouse`) cho backend NestJS và tích hợp trực tiếp lên giao diện Dashboard của Next.js 15.

Đảm bảo:
1. Mọi truy vấn và tạo mới cửa hàng/kho hàng đều bị cô lập chặt chẽ theo `tenantId` của doanh nghiệp đang đăng nhập.
2. Mỗi cửa hàng liên kết với một kho xuất hàng mặc định (`defaultWarehouseId`).
3. Cung cấp API quản lý cửa hàng và kho hàng có tài liệu Swagger đầy đủ.
4. Giao diện người dùng trong tab **"Hệ Thống Cửa Hàng"** trên Dashboard hiển thị dữ liệu động từ API thực tế thay vì mock data tĩnh.

## 2. Phạm vi thay đổi (Scope)

### A. Tầng Backend (`backend/src/modules/`)
1. **Module `warehouse/`**:
   - `dto/create-warehouse.dto.ts`: Tên kho, mã kho (`code`), loại kho (`CENTRAL` | `STORE_ATTACHED`), địa chỉ.
   - `dto/update-warehouse.dto.ts`: Cập nhật tên, địa chỉ, trạng thái hoạt động (`isActive`).
   - `warehouse.service.ts`: Xử lý nghiệp vụ kho, kiểm tra trùng mã `code` trong cùng `tenantId`, hỗ trợ Dual-Mode (Prisma + In-Memory Fallback có sẵn 3 kho mẫu).
   - `warehouse.controller.ts`: Các endpoint `GET /api/v1/warehouses`, `POST /api/v1/warehouses`, `GET /api/v1/warehouses/:id`, `PATCH /api/v1/warehouses/:id`.
   - `warehouse.module.ts`: Đăng ký module.

2. **Module `store/`**:
   - `dto/create-store.dto.ts`: Tên chi nhánh, mã code, địa chỉ, số điện thoại, kho mặc định (`defaultWarehouseId`).
   - `dto/update-store.dto.ts`: Cập nhật thông tin chi nhánh và kho mặc định.
   - `store.service.ts`: Xử lý nghiệp vụ cửa hàng, kiểm tra tính hợp lệ của `defaultWarehouseId` thuộc cùng Tenant, hỗ trợ Dual-Mode (Prisma + In-Memory Fallback có sẵn 2 cửa hàng mẫu: Quận 1 & Bình Thạnh).
   - `store.controller.ts`: Các endpoint `GET /api/v1/stores`, `POST /api/v1/stores`, `GET /api/v1/stores/:id`, `PATCH /api/v1/stores/:id`.
   - `store.module.ts`: Đăng ký module.

3. **Cập nhật `backend/src/app.module.ts`**:
   - Nhập `StoreModule` và `WarehouseModule`.

### B. Tầng Frontend (`frontend/`)
1. **Dịch vụ `frontend/lib/services/store-service.ts`**:
   - `getStores()`: Gọi `GET /api/v1/stores`.
   - `createStore(data)`: Gọi `POST /api/v1/stores`.
   - `updateStore(id, data)`: Gọi `PATCH /api/v1/stores/:id`.
   - `getWarehouses()`: Gọi `GET /api/v1/warehouses`.
   - `createWarehouse(data)`: Gọi `POST /api/v1/warehouses`.

2. **Giao diện Dashboard (`frontend/app/dashboard/page.tsx` & `frontend/app/quan-tri/page.tsx`)**:
   - Tab **"Hệ Thống Cửa Hàng"**: Tải danh sách cửa hàng thực tế từ `storeService`.
   - Modal thêm mới chi nhánh cửa hàng: Biểu mẫu nhập tên chi nhánh, mã code, địa chỉ, số hotline và chọn kho hàng mặc định.
   - Bộ chọn chi nhánh (Store Selector) trên thanh tiêu đề POS Terminal: Đồng bộ theo danh sách chi nhánh thực tế từ backend.

## 3. Tiêu chí nghiệm thu (Acceptance Criteria)
- [x] Gọi API `GET /api/v1/stores` với JWT Token trả về danh sách 2 cửa hàng ban đầu của Tenant `Gia Dụng Hiện Đại`.
- [x] Gọi API `POST /api/v1/stores` tạo chi nhánh mới thành công, ngăn chặn trùng mã `code` trong cùng Tenant (Status 409 ConflictException).
- [x] Gọi API `GET /api/v1/warehouses` trả về danh sách kho hàng (Kho Q.1, Kho Bình Thạnh, Kho Tổng).
- [x] Màn hình Dashboard tab Cửa Hàng hiển thị danh sách chi nhánh động kèm thông tin kho liên kết và danh mục toàn bộ kho hàng.
- [x] Thêm chi nhánh mới thành công trên giao diện thông qua Modal và đồng bộ ngay lập tức vào danh sách hiển thị và bộ chọn POS.

## 4. Kết quả nghiệm thu thực tế
- Backend Swagger: Đã xuất bản 8 endpoint mới cho `Stores` và `Warehouses` tại `http://localhost:4000/docs`.
- Kiểm thử E2E: Đã chạy kiểm thử tự động 7/7 bước, xác thực cô lập Tenant, chống trùng mã code, liên kết kho và cập nhật chi nhánh.
- Frontend: Đã biên dịch Next.js 15 thành công (15/15 routes), tích hợp modal tạo chi nhánh và liên kết kho.
