# TASK-005: Xây dựng Module Quản lý Tồn kho & Phiếu Chuyển kho (Stores & Inventory Core)

- **Mã nhiệm vụ**: `TASK-005`
- **Giai đoạn**: `Phase 03 - Stores & Inventory Core`
- **Epic**: `EPIC-03-B`, `EPIC-03-C`
- **Trạng thái**: `DONE` (Hoàn thành)
- **Người thực hiện**: Fullstack Engineer
- **Độ ưu tiên**: Cao nhất (P0)

## 1. Mục đích công việc
Xây dựng phân hệ quản lý tồn kho đa điểm (`Inventory Management`), quy trình lập phiếu nhập hàng (`Goods Receipt`), quy trình điều chuyển hàng giữa các kho (`Stock Transfer`) theo vòng đời 3 bước chuẩn (`PENDING` -> `IN_TRANSIT` -> `COMPLETED`), nhật ký biến động kho (`Inventory Transactions Audit Trail`) và cơ chế khóa an toàn chống bán vượt tồn kho (`Concurrency Lock / Pessimistic Locking`).

Đảm bảo:
1. Mọi nghiệp vụ tồn kho đều tuân thủ công thức chuẩn:  
   $$\text{Available Qty} = \text{On-Hand Qty} - \text{Committed Qty}$$
2. Cơ chế khóa bi quan / kiểm tra đồng thời chặn đứng tình trạng bán âm khi tồn khả dụng không đủ (trả về HTTP 409 `ORDER_INSUFFICIENT_STOCK`).
3. Quy trình chuyển kho 3 bước rõ ràng: Khởi tạo phiếu -> Kho xuất bấm xuất hàng (trừ tồn kho xuất, chuyển In-Transit) -> Kho nhận kiểm đếm bấm nhận hàng (cộng tồn kho đích, hoàn tất).
4. Mọi biến động kho (nhập, xuất điều chuyển, nhận điều chuyển, bán lẻ tại quầy POS) đều được tự động lưu vào sổ nhật ký `inventory_transactions`.
5. Tích hợp trực tiếp lên giao diện Dashboard tab **"Tồn Kho Đa Điểm"** và kết nối vào luồng thanh toán tại màn hình quầy POS.

## 2. Phạm vi thay đổi (Scope)

### A. Tầng Database & Schema (`database/prisma/schema.prisma`)
1. **Enum & Model mới**:
   - `enum StockTransferStatus`: `PENDING`, `IN_TRANSIT`, `COMPLETED`, `CANCELLED`.
   - `enum InventoryTransactionType`: `RECEIPT`, `TRANSFER_OUT`, `TRANSFER_IN`, `POS_SALE`, `COMMITTED_RESERVE`, `COMMITTED_RELEASE`, `ADJUSTMENT`.
   - `model StockTransfer`: Quản lý phiếu chuyển kho với số phiếu (`transferNumber`), kho nguồn (`sourceWarehouseId`), kho đích (`targetWarehouseId`), trạng thái, ghi chú.
   - `model StockTransferItem`: Chi tiết các mặt hàng và số lượng điều chuyển.
   - `model InventoryTransaction`: Sổ cái ghi nhận mọi biến động số lượng và số dư sau giao dịch (`balanceOnHand`).
2. **Cập nhật quan hệ (Relations)** trong các model `Tenant`, `Warehouse`, `ProductVariant`.

### B. Tầng Backend (`backend/src/modules/inventory/`)
1. **DTOs với kiểm thực dữ liệu nghiêm ngặt (`class-validator`)**:
   - `CreateGoodsReceiptDto`: Kho nhận, danh sách sản phẩm, số lượng, đơn giá vốn, ghi chú.
   - `CreateStockTransferDto`: Kho xuất, kho nhận (ngăn trùng lặp), danh sách mặt hàng, số lượng, ghi chú.
   - `QueryInventoryDto`: Lọc tồn kho theo kho, theo SKU, hoặc chỉ xem hàng sắp hết (`lowStockOnly`).
   - `ReserveStockDto`: Kho hàng, biến thể sản phẩm, số lượng, mã đơn tham chiếu.
2. **`InventoryService`**:
   - Kiến trúc **Dual-Mode**: Hỗ trợ đầy đủ Prisma ORM (với `SELECT ... FOR UPDATE` trong Transaction) kết hợp In-Memory Fallback có sẵn dữ liệu 9 mặt hàng gia dụng mẫu phân bổ trên 3 kho hàng (`Kho Q.1`, `Kho Bình Thạnh`, `Kho Tổng Tân Bình`).
   - `findAll(tenantId, query)`: Tra cứu ma trận tồn kho.
   - `createReceipt(tenantId, dto)`: Lập phiếu nhập kho, tăng tồn kho và ghi log `RECEIPT`.
   - `findTransfers(tenantId)`: Lấy danh sách phiếu chuyển kho.
   - `createTransfer(tenantId, dto)`: Kiểm tra tồn kho xuất, tạo phiếu trạng thái `PENDING`.
   - `shipTransfer(tenantId, id)`: Trừ tồn kho xuất, ghi log `TRANSFER_OUT`, đổi trạng thái sang `IN_TRANSIT`.
   - `receiveTransfer(tenantId, id)`: Cộng tồn kho nhận, ghi log `TRANSFER_IN`, đổi trạng thái sang `COMPLETED`.
   - `reserveOrDeductStock(tenantId, dto)`: Khóa bi quan / kiểm tra nguyên tử, ném lỗi 409 `ORDER_INSUFFICIENT_STOCK` nếu thiếu hàng, trừ tồn và ghi log `POS_SALE`.
   - `findTransactions(tenantId, warehouseId)`: Lấy lịch sử biến động sổ cái.
3. **`InventoryController`**: Xuất bản 8 REST API có tài liệu OpenAPI / Swagger chuẩn chỉnh.
4. **`InventoryModule`**: Đăng ký vào `AppModule`.

### C. Tầng Frontend (`frontend/`)
1. **Dịch vụ `frontend/lib/services/inventory-service.ts`**:
   - Cung cấp toàn bộ các hàm gọi API: `getInventories`, `createGoodsReceipt`, `getTransfers`, `createStockTransfer`, `shipTransfer`, `receiveTransfer`, `reserveOrDeductStock`, `getTransactions`.
2. **Cập nhật Giao diện Dashboard (`frontend/app/dashboard/page.tsx` & `frontend/app/quan-tri/page.tsx`)**:
   - **Tab Tồn Kho Đa Điểm**:
     - 4 thẻ KPI tổng quan: Kho Q.1, Kho Bình Thạnh, Kho Tổng Trung Tâm, Đang Giữ Cho Sàn (Committed).
     - Bảng ma trận đối chiếu tồn kho toàn hệ thống (Kho Q.1, Bình Thạnh, Kho Tổng, Committed, Tồn Khả Dụng, Nhãn cảnh báo Sắp hết hàng / Đủ bán).
     - Phân vùng quản lý phiếu điều chuyển kho: Bảng danh sách phiếu kèm bộ đếm trạng thái, nút thao tác trực tiếp: "Xuất Kho" cho phiếu `PENDING`, "Nhận Hàng" cho phiếu `IN_TRANSIT`.
   - **Các Modal nghiệp vụ**:
     - Modal Tạo Phiếu Chuyển Kho: Chọn kho xuất, kho nhận động từ danh sách kho thực tế, chọn sản phẩm (kèm hiển thị tồn thực tế hiện có tại kho xuất để tránh nhập quá), nhập số lượng và ghi chú.
     - Modal Lập Phiếu Nhập Hàng: Nhập hàng bổ sung vào bất kỳ kho nào với số lượng và đơn giá vốn.
     - Modal Nhật Ký Biến Động Kho: Xem sổ cái audit trail 100 giao dịch phát sinh gần nhất.
   - **Quầy POS Terminal**: Tự động đồng bộ trừ tồn kho an toàn với backend thông qua `reserveOrDeductStock`.

## 3. Tiêu chí nghiệm thu (Acceptance Criteria)
- [x] Gọi API `GET /api/v1/inventories` trả về ma trận tồn kho của 9 sản phẩm gia dụng trên cả 3 kho hàng (`Kho Q.1`, `Kho Bình Thạnh`, `Kho Tổng`).
- [x] Gọi API `POST /api/v1/inventories/receipts` tạo phiếu nhập hàng thành công, tự động cộng tồn kho On-Hand và Available, ghi nhận nhật ký `RECEIPT`.
- [x] Gọi API `POST /api/v1/inventories/transfers` tạo phiếu chuyển kho trạng thái `PENDING`.
- [x] Gọi API `PATCH /api/v1/inventories/transfers/:id/ship` trừ tồn kho xuất, chuyển trạng thái sang `IN_TRANSIT` và ghi nhận nhật ký `TRANSFER_OUT`.
- [x] Gọi API `PATCH /api/v1/inventories/transfers/:id/receive` cộng tồn kho đích, chuyển trạng thái sang `COMPLETED` và ghi nhận nhật ký `TRANSFER_IN`.
- [x] Kiểm tra Concurrency Lock: Khi trừ tồn vượt quá số lượng khả dụng, hệ thống lập tức chặn lại và phản hồi HTTP 409 `ORDER_INSUFFICIENT_STOCK`.
- [x] Giao diện Dashboard tab Tồn Kho hiển thị dữ liệu động, hỗ trợ tạo phiếu chuyển kho, lập phiếu nhập hàng và xem nhật ký biến động kho thời gian thực.
- [x] Kịch bản kiểm thử tự động `node scripts/test-task-005.mjs` vượt qua 100% (9/9 bước kiểm thử).

## 4. Kết quả nghiệm thu thực tế
- Backend: Đã biên dịch NestJS thành công, bổ sung 8 API endpoints cho Inventories & Transfers có Swagger đầy đủ.
- Frontend: Đã biên dịch Next.js 15 thành công (15/15 routes), tích hợp dịch vụ `inventoryService` và toàn bộ các modal nghiệp vụ.
- Kiểm thử E2E: Đã chạy thành công 9/9 bước kiểm thử, xác nhận quy trình chuyển kho 3 bước, phiếu nhập hàng và cơ chế chống bán âm.
