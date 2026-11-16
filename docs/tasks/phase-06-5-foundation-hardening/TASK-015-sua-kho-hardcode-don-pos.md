# TASK-015: Sửa Heuristic Kho Hardcode Làm Vỡ Đơn POS Trên DB Thật

- **Mã nhiệm vụ**: `TASK-015`
- **Giai đoạn**: `Phase 06.5 — Foundation Hardening (Củng cố nền tảng)`
- **Epic**: `EPIC-06-5-D`
- **Trạng thái**: `DONE một phần` (hoàn thành ngày 16/11/2026 trong VM; e2e trên Postgres thật chưa kiểm chứng được — xem mục 5)
- **Người thực hiện**: Backend Engineer
- **Độ ưu tiên**: Cao (P0 — chặn đơn POS trên DB thật)

## 1. Mục đích công việc

Báo cáo TASK-014 (16/11/2026, commit `1eb9358`) ghi lại một phát hiện ngoài phạm vi: `backend/src/modules/order/order.service.ts:210` chọn kho bằng ID hardcode khi DTO không kèm `warehouseId`:

```ts
const warehouseId = dto.warehouseId
  || (dto.storeId === 'store-002-binh-thanh' ? 'wh-002-binh-thanh'
  : isPos ? 'wh-001-q1' : 'wh-003-central');
```

Các ID này không tồn tại trên DB thật: seed (`database/prisma/seed.ts`) tạo kho bằng `uuid()`, 1 store CN1 + 1 warehouse KHO-CN1, và gán `store.defaultWarehouseId = warehouse.id`. Với đơn POS `COMPLETED`, `create()` gọi `inventoryService.reserveOrDeductStock()` **trước** khi tạo đơn; hàm này throw `NotFoundException('Không tìm thấy bản ghi tồn kho cho mặt hàng này')` khi không có dòng inventory cho `warehouseId` đó (`inventory.service.ts:469-471`). Nên đơn POS không kèm kho sẽ lỗi ngay trên DB thật, trước cả lỗi FK của `Order.warehouseId` (`schema.prisma:391-411`).

Task này sửa đúng chỗ đó, không cần migration mới (hạ tầng đã có sẵn: `Store.defaultWarehouseId` trong schema, `PrismaService` đã inject trong `OrderService`, `BadRequestException` đã import).

## 2. Phạm vi thay đổi (Scope)

- **Tệp mã nguồn bị tác động**:
  - `backend/src/modules/order/order.service.ts` — thêm `resolveWarehouseId()` private, thay dòng 210 bằng lời gọi nó.
  - File task này (`docs/tasks/phase-06-5-foundation-hardening/TASK-015-sua-kho-hardcode-don-pos.md`).
- **Không thay đổi**: schema Prisma, migration 0001/0002, API contract (DTO, endpoint), logic trừ tồn / tạo đơn trong `create()` (chỉ đổi cách tính `warehouseId`).
- **Không làm trong task này**: nối POS frontend với API thật (xem mục 5 — checkout POS hiện vẫn mock hoàn toàn), chạy e2e trên Postgres thật, dọn example Swagger trong DTO (chỉ là example, không ảnh hưởng runtime), đổi placeholder mật khẩu seed trong `.env.example`.

## 3. Thiết kế sửa

Thứ tự resolve kho trong `OrderService.create()`:

1. `dto.warehouseId` nếu có thì dùng luôn.
2. Không có thì lấy `Store.defaultWarehouseId` của cửa hàng (`prisma.store.findFirst` theo `tenantId` + `dto.storeId`).
3. Cửa hàng không có kho mặc định — hoặc `storeId` là ID mock cũ không có trong DB — thì lấy kho active đầu tiên của tenant (`prisma.warehouse.findFirst` với `isActive: true`, `orderBy createdAt asc`).
4. Tenant chưa có kho active nào thì throw `BadRequestException` với thông báo rõ ràng ("Tenant chưa có kho hàng active nào để xuất kho. Vui lòng tạo kho trước khi tạo đơn hàng."), thay vì để `reserveOrDeductStock` / FK lỗi khó hiểu.

## 4. Tiêu chí nghiệm thu (Acceptance Criteria)

- [x] Grep `wh-001-q1|wh-002-binh-thanh|wh-003-central` trong `backend/src/modules/order/order.service.ts` còn 0 ngoài DTO (DTO `create-order.dto.ts:85` vẫn còn example `wh-001-q1` — chỉ là Swagger example, không phải code chạy).
  - Kiểm chứng ngày 16/11/2026: grep toàn `backend/src` trừ thư mục `dto/` còn 0.
- [x] `npx prisma validate` PASS (cần `DATABASE_URL` trong shell; không có thì báo lỗi `P1012 Environment variable not found` — đây là lỗi môi trường, không phải lỗi schema).
- [x] `npm run build` backend PASS; `dist/modules/order/order.service.js` chứa `resolveWarehouseId`.
- [x] Test logic resolve kho bằng mock Prisma trên bản build: 4/4 PASS — (1) DTO gửi warehouseId thì dùng đúng ID đó; (2) store có `defaultWarehouseId` thì dùng kho đó; (3) storeId mock `store1` không có trong DB thì rơi xuống kho active đầu tiên của tenant; (4) tenant không có kho nào thì throw `BadRequestException` với message rõ ràng.
- [ ] E2E thật: tạo đơn POS không kèm `warehouseId` trên Postgres thật và kiểm tra đơn được tạo + tồn kho trừ đúng — **chưa làm được**, cần user chạy Docker (xem runbook) vì VM không có Postgres/Docker.
- [x] Commit local trên nhánh `feat/fe-vibe-and-docs-priority`; **không push, không tạo PR** (PR tạm gác theo quyết định ngày 16/11/2026).

## 5. Kết quả thực hiện

Hoàn thành ngày 16/11/2026, nhánh `feat/fe-vibe-and-docs-priority`, 1 commit code + 1 commit cập nhật file task này, chỉ local — chưa push, chưa tạo PR.

- **Sửa kho hardcode**: `order.service.ts` thêm `resolveWarehouseId()` (khoảng 40 dòng) và thay dòng 210. Build backend PASS, test mock 4/4 PASS (xem mục 4).
- **Phát hiện quan trọng khi kiểm chứng (ngoài phạm vi task)**: checkout POS ở frontend **hiện vẫn mock hoàn toàn, không gọi API**. `frontend/components/dashboard/use-pos.ts:handleCompletePosCheckout()` tự tạo `OrderItem` local, trừ tồn mock trong state, mở receipt modal — không hề gọi `orderService.createOrder()` (hàm này tồn tại trong `frontend/lib/services/order-service.ts:117` nhưng không có nơi nào gọi). `PosTab` có biết cửa hàng đang chọn (`posStore`, `getActivePosStore()`) và hiển thị tên kho mặc định (`activeStoreObj?.defaultWarehouse?.name`), nhưng không gửi `storeId`/`warehouseId` lên backend. Vì vậy **không thể chứng minh sửa backend bằng click-through FE** như kế hoạch ban đầu; muốn chứng minh tới cùng cần 1 trong 2 việc: (a) chạy e2e backend trực tiếp trên Postgres thật, hoặc (b) nối POS frontend với `createOrder` thật — cả hai đều là việc cho task sau, không làm trong TASK-015 để giữ scope nhỏ.
- **Còn mở**: example `wh-001-q1` trong các DTO (`create-order.dto.ts`, `create-goods-receipt.dto.ts`, `create-stock-transfer.dto.ts`, `query-inventory.dto.ts`, `reserve-stock.dto.ts`, `create-store.dto.ts`) — chỉ là Swagger example, dọn sau cho sạch; `.env.example` vẫn còn placeholder mật khẩu seed (ghi từ TASK-014), đổi trước khi deploy thật; token đồng bộ TASK-013 vẫn lưu plaintext, job kéo đơn chỉ đếm chưa lưu về bảng `orders` (ghi từ TASK-013).

## 6. DoD Phase 06.5 sau TASK-015 (đánh giá lại)

**Kết quả: vẫn 2/6 điểm đạt hoàn toàn, 1 điểm đạt một phần (phía code), 3 điểm chưa đạt — không đổi so với sau TASK-014.** TASK-015 chỉ gỡ 1 lỗi chặn đơn POS ở tầng code; các điểm DoD còn lại vẫn cần môi trường thật nên **vẫn chưa vào được Phase 07**.

| # | Điểm DoD Phase 06.5 | Trạng thái sau TASK-015 |
|---|---|---|
| 1 | Migration chạy được trên DB trống; `prisma migrate status` không còn migration chờ | ❌ Chưa đạt — migration 0001+0002 tồn tại, `prisma validate` PASS, nhưng chưa chạy trên Postgres thật |
| 2 | Backend chạy với Postgres thật, không còn fallback in-memory ở module lõi; fail-fast khi `DATABASE_URL` sai/thiếu | ⚠️ Đạt một phần (phía code) — in-memory còn 0, fail-fast đã có, heuristic kho hardcode đã sửa; nhưng chưa chạy thử trên Postgres thật |
| 3 | CI xanh; `docker compose up` trên máy sạch đưa hệ thống lên | ❌ Chưa đạt — file CI + compose tồn tại nhưng CI chưa từng chạy (không có PR) và compose chưa từng chạy (không có Docker) |
| 4 | Dashboard đã tách (file lớn nhất < 500 dòng) và dark mode đúng | ✅ Đạt — `page.tsx` 251 dòng, file lớn nhất 292 dòng; dark mode đúng; click-through 9/9 PASS sau tách |
| 5 | Không còn tài khoản demo hardcode; Next đã vá CVE | ✅ Đạt — demo gỡ hết, Next 15.1.9 |
| 6 | 1 luồng e2e thật: login → tạo cửa hàng → nhập kho → bán POS → trừ tồn trên Postgres thật | ❌ Chưa đạt — TASK-015 sửa xong phần kho ở backend, nhưng POS frontend vẫn mock (không gọi API) và chưa có Postgres thật để chạy |

Muốn vào Phase 07 thì vẫn cần 3 việc từ phía user và môi trường thật (xem runbook): sửa quyền GitHub App hoặc tự push nhánh để CI chạy lần đầu, chạy `docker compose up` trên máy có Docker để áp migration và kiểm chứng login thật, và cung cấp app/key sandbox Shopee/TikTok để làm e2e thật.
