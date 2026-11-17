# TASK-016: Nối Checkout POS Với createOrder Thật (Phương án A)

- **Mã nhiệm vụ**: `TASK-016`
- **Giai đoạn**: `Phase 06.5 — Foundation Hardening (Củng cố nền tảng)`
- **Trạng thái**: `DONE` (hoàn thành ngày 17/11/2026, commit xem mục 8)
- **Nguồn**: Phát hiện ngoài phạm vi trong TASK-015 §5 (báo cáo TASK-015 ngày 16/11/2026): checkout POS ở frontend vẫn mock hoàn toàn, `createOrder` có 0 nơi gọi.
- **Độ ưu tiên**: Cao (P0 — đây là chân cuối của luồng e2e DoD #6: login → tạo cửa hàng → nhập kho → bán POS → trừ tồn trên Postgres thật)

## 1. Mục đích

Cho đơn POS đi qua backend thật (`POST /orders`) thay vì tự sinh đơn trong state frontend, để:
- Chứng minh được sửa kho TASK-015 (`resolveWarehouseId()`) bằng click-through FE, thay vì chỉ bằng test mock.
- Đơn POS được lưu vào bảng `orders` + trừ tồn thật qua `reserveOrDeductStock()`, thay vì chỉ trừ `stockStore1/stockStore2` trong state local.

## 2. Quyết định của user (17/11/2026): phương án A

Khi backend (`localhost:4000`) đang down — như lúc click-through TASK-014 — POS **chặn checkout cứng, báo lỗi và giữ giỏ**. Không fallback mock, không tạo đơn giả. User chọn A qua widget lựa chọn ngày 17/11/2026.

## 3. Hướng đã chọn cho rào cản variant identity: (b) backend resolve theo SKU

Rào cản (đã kiểm chứng lúc chuẩn bị task): `reserveOrDeductStock()` tìm đúng 1 dòng inventory bằng `variant_id`; seed tạo variant bằng `uuid()` với SKU `NCKD-55L-001`, `MXST-15L-001`, `BNI-5M-001`; frontend mock dùng `ProductItem.id` dạng `PROD-01…PROD-12`, SKU dạng `NCKD-TF-56L` — không trùng cả ID lẫn SKU với seed. `OrderItem.variantId` lại là FK tới `ProductVariant` (onDelete Restrict) nên gửi `product.id` làm `variantId` sẽ lỗi FK.

- **Đã chọn (b) — backend resolve biến thể theo SKU**, ghi rõ trong code (`order.service.ts`, `resolveVariantId()`): tra biến thể thật theo thứ tự id → sku (sku unique theo tenant); không thấy thì throw `BadRequestException` với thông báo tiếng Việt nêu rõ SKU.
- **Không chọn (a) — POS load sản phẩm thật qua `productService`**, vì: phải thay toàn bộ danh mục mock 12 sản phẩm (có ảnh thật, tồn theo chi nhánh) bằng tối đa 3 sản phẩm seed (không ảnh, không tồn theo chi nhánh trong FE), chạm tới cả tab Sản phẩm/Tồn kho, và không kiểm chứng được trong VM (không có Postgres — khi backend down thì lưới POS sẽ trống). Phạm vi quá lớn cho một task nối checkout.
- **Không làm (c)** — căn lại seed/mock SKU như fix demo tạm.

**Giới hạn còn lại của hướng (b), nói rõ không giấu**: SKU mock (`NCKD-TF-56L`…) không có trong DB seed (`NCKD-55L-001`…), nên đối với DB đã seed, checkout POS với giỏ mock sẽ lỗi rõ ràng `Không tìm thấy biến thể sản phẩm với SKU "NCKD-TF-56L"` thay vì lỗi FK khó hiểu — muốn e2e tới cùng, danh mục trong DB phải có đúng SKU mà quầy đang bán (tạo sản phẩm qua API hoặc seed thêm). Luồng thành công tới cùng (đơn lưu DB + tồn giảm đúng 1 lần) vì vậy **chưa kiểm chứng được trong VM** (xem mục 7).

Kèm theo hướng (b), backend còn chịu thêm 2 trường hợp id lạ từ FE để tránh lỗi FK ở lúc tạo đơn (cùng tinh thần fallback của TASK-015, có log warn):
- `storeId` gửi lên mà không tồn tại cho tenant (vd id mock cũ `store-001-q1`) thì bỏ qua `storeId` khi tạo đơn.
- `warehouseId` gửi lên mà không tồn tại thì đi tiếp chuỗi fallback của TASK-015 thay vì trả về thẳng như trước.

## 4. Phạm vi đã làm

### Backend — `backend/src/modules/order/order.service.ts`
- Thêm `resolveVariantId(tenantId, variantId, sku)`: id → sku → throw `BadRequestException` rõ ràng.
- `create()`: resolve từng mặt hàng về variant uuid thật TRƯỚC khi trừ tồn và tạo đơn; dùng danh sách đã resolve cho cả `reserveOrDeductStock()` và `prisma.order.create()` (tránh trừ 2 lần / sai FK).
- `resolveWarehouseId()`: kiểm tra `warehouseId` gửi lên có tồn tại không, không thì fallback tiếp.
- `create()`: `storeId` không tồn tại thì bỏ qua (log warn) thay vì lỗi FK.

### Frontend — checkout thật + chặn cứng (phương án A)
- `frontend/components/dashboard/use-pos.ts`: `handleCompletePosCheckout()` thành `async`, gọi `orderService.createOrder()` với `channelType: 'POS'`, `storeId` + `warehouseId` (từ `getActivePosStore()`, chỉ gửi khi có id thật), `customerPhone`, `items` từ giỏ (`variantId` = id mock, `sku`, `productName`, `quantity`, `unitPrice`), `discountAmount`, `status: 'COMPLETED'`, `paymentStatus: 'PAID'`, `paymentMethod` theo nhãn đã chọn. Thêm state `isCheckingOut` khóa nút khi đang gọi API (tránh bấm 2 lần tạo 2 đơn).
  - Thành công: dùng `orderNumber` backend sinh qua adapter `adaptApiOrderToOrderItem()` (đơn thật → `OrderItem` mock cho tab Đơn hàng + receipt modal), prepend vào `setOrders`, ghi activity, mở receipt, xóa giỏ, toast thành công với mã đơn thật.
  - Lỗi (backend down, hết tồn, sai SKU…): `triggerErrorToast()` với thông báo lỗi từ API + câu `Đơn chưa được tạo, giỏ hàng vẫn giữ nguyên.` — **giữ nguyên giỏ, không tạo đơn, không trừ tồn**.
  - Đã xóa hẳn: tự sinh mã `POS-<storeCode>-<random>`, trừ tồn local bằng `setProducts` (tránh trừ 2 lần: 1 lần ở state, 1 lần ở DB). `setProducts` vì vậy gỡ khỏi `UsePosOptions` và khỏi `page.tsx`.
- `frontend/components/dashboard/PosCartPanel.tsx`: nút thanh toán disabled khi `isCheckingOut`, nhãn đổi thành `Đang xử lý thanh toán...` trong lúc gọi API.
- `frontend/components/ui/toast.tsx` + `use-dashboard-data.ts` + `page.tsx`: thêm `triggerErrorToast()` / `toastVariant` — toast lỗi hiện nền đỏ + icon XCircle thay vì nền xanh lá + icon check như toast thành công (trước đây lỗi cũng hiện xanh lá, dễ hiểu nhầm là thành công).

### Test — `frontend/scripts/clickthrough-dashboard.mjs`
- Thêm bước 3b (TASK-016, phương án A): bấm `Thanh Toán & In Hóa Đơn` khi backend down → assert toast lỗi có nội dung `Không thể kết nối` + `giỏ hàng vẫn giữ nguyên`, giỏ giữ nguyên số món + tổng tiền, không mở hóa đơn (`HÓA ĐƠN BÁN LẺ`), và bước 4 assert đơn đầu tiên trong tab Đơn hàng vẫn là `ORD-SP-9821` (không có đơn giả mới).
- Script tự nhận diện Chrome: ưu tiên `CHROME_BIN` → `/usr/bin/google-chrome` → chromium stock của Playwright (`~/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome`) → `/opt/meta-chromium/chrome`; chỉ gắn cờ Hatch WebGL policy khi dùng meta-chromium.

## 5. Kết quả thực hiện (17/11/2026, nhánh `feat/fe-vibe-and-docs-priority`, chỉ local — chưa push, chưa merge main)

- **Grep `createOrder`**: `frontend/components/dashboard/use-pos.ts:224` là nơi gọi duy nhất ngoài định nghĩa (`order-service.ts:117`) — tiêu chí ≥ 1 caller đạt.
- **`npm run build` backend PASS** (`nest build`, không lỗi TS). **`npm run build` frontend PASS** (15 trang, `/dashboard` 150 kB).
- **`prisma validate` PASS** với `DATABASE_URL` giả (schema không đổi trong task này; validate gốc lỗi `P1012 Environment variable not found: DATABASE_URL` do thiếu env, không phải do code).
- **Click-through POS 11/11 PASS** (chạy 2 lần giống nhau, lần 2 sau khi sửa regex đếm giỏ): dashboard load, chuyển tab POS, thêm nồi chiên Tefal vào giỏ (tổng 2.490.000 ₫), **bước 3b TASK-016 PASS — trước: 1 món, 2.490.000 ₫ | sau: 1 món, 2.490.000 ₫ | toast lỗi: có | hóa đơn mở: không**, chuyển tab Đơn hàng (đơn đầu vẫn `ORD-SP-9821`), đóng drawer, chuyển tab Tồn kho, mở modal chuyển kho, quay lại Tổng quan. Lỗi duy nhất trong console là backend cổng 4000 down (`ERR_CONNECTION_REFUSED`, app xử lý graceful).
  - Toast lỗi thật trong ảnh: `Không thể kết nối tới máy chủ backend. Vui lòng kiểm tra lại dịch vụ tại cổng 4000. Đơn chưa được tạo, giỏ hàng vẫn giữ nguyên.` — banner đỏ, giỏ vẫn `GIỎ HÀNG QUẦY (1)` với đúng 1 nồi chiên 2.490.000 ₫, nút thanh toán bấm lại được (không kẹt ở `Đang xử lý...`).
  - Ảnh: `screenshots/dashboard-pos-blocked.png` (xem trực tiếp, banner đỏ + giỏ nguyên vẹn).
- **Chưa kiểm chứng**: luồng thành công tới cùng — đơn lưu bảng `orders`, tồn kho variant giảm đúng 1 lần, receipt hiện `orderNumber` backend sinh. Cần Postgres thật + danh mục có đúng SKU (xem mục 3 và 7).

## 6. Tiêu chí nghiệm thu (Acceptance Criteria)

- [x] Grep `createOrder` trong frontend có ≥ 1 nơi gọi ngoài định nghĩa (`use-pos.ts`).
- [x] `npm run build` frontend PASS; `npm run build` backend PASS.
- [x] Click-through POS khi backend down: giỏ giữ nguyên, toast lỗi rõ ràng, không sinh đơn giả (phương án A).
- [ ] Click-through POS thành công tới cùng: receipt hiện `orderNumber` do backend sinh, đơn xuất hiện trong tab Đơn hàng — **chưa làm được trong VM** (cần Postgres thật, xem mục 7).
- [ ] Kiểm tra DB: đơn có trong bảng `orders` với đúng `storeId`/`warehouseId`/tổng tiền; tồn kho giảm đúng số lượng, không trừ 2 lần — **chưa làm được trong VM**.
- [x] Ghi rõ hướng đã chọn ở mục 3 (b) + bằng chứng kiểm chứng; commit local trên nhánh `feat/fe-vibe-and-docs-priority`, **không push, không tạo PR** (PR vẫn gác; user dặn 17/11/2026 đưa thẳng lên main sau khi TASK-016 xong — việc merge/push main do parent agent thực hiện, không làm trong task này).

## 7. Vẫn chặn bởi môi trường thật (không đổi so với TASK-015)

- E2E thành công tới cùng cần Postgres + Docker để chạy migration/seed và backend thật — VM hiện không có Docker/Postgres. Không có Redis thì BullMQ cũng không chạy, nhưng checkout POS không cần Redis.
- 14 commit trước đó + 2 commit TASK-016 vẫn chưa push (thẻ phê duyệt GitHub App hết hạn tối 16/11/2026, không còn thẻ chờ); CI vẫn chưa từng chạy. User dặn 17/11/2026: sau khi TASK-016 xong thì đưa thẳng lên nhánh `main` (không qua PR) để họ pull về review — TASK-016 phụ thuộc TASK-009..015 nên khi lên main sẽ đi cùng cả 14 commit trước đó, không tách riêng được.
- DoD Phase 06.5 vẫn 2/6 đạt hoàn toàn sau TASK-016 (điểm 4 dashboard, điểm 5 demo/Next), 1 đạt một phần phía code (điểm 2); TASK-016 chỉ đóng chân POS của điểm 6 ở mức code + chặn lỗi, chưa đóng hết điểm 6 vì chưa có e2e thành công trên Postgres thật.
- Ghi chú hạ tầng test: Chromium Hatch (`/opt/meta-chromium/chrome`) trong VM này không mở được `localhost:3000` — bị chặn bởi Local Network Access checks dù đã thử `--disable-features=LocalNetworkAccessChecks`, `--disable-web-security`, `--disable-field-trial-config` và enterprise policy `LocalNetworkAccessAllowedForUrls` (đã gỡ policy thử nghiệm, trả về bản gốc). Đã cài chromium stock qua `npx playwright install chromium` (159.0.8154.6, `~/.cache/ms-playwright/chromium-1255/`) và click-through chạy bằng nó — không phải code NEXORA, chỉ là công cụ test trong VM.

## 8. Kết quả commit

Nhánh `feat/fe-vibe-and-docs-priority`, working tree sạch sau khi xong, **không push, không merge main** (theo lệnh — việc đưa lên main do parent agent làm sau):

- Code + test click-through (xem `git log` trong báo cáo TASK-016).
- Docs: file TASK-016 này (DỰ THẢO → DONE).
