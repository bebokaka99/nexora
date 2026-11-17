# TASK-017 (DỰ THẢO): Củng Cố Đồng Bộ Sàn — Mã Hóa Token At-Rest + Job Kéo Đơn Lưu Về Bảng Orders

- **Mã nhiệm vụ**: `TASK-017`
- **Giai đoạn**: `Phase 06.5 — Foundation Hardening (Củng cố nền tảng)`
- **Epic**: `EPIC-06-A`, `EPIC-06-B`
- **Trạng thái**: `DONE (mức code)` — hoàn thành ngày 17/11/2026, commit xem §5
- **Người thực hiện**: Backend Engineer
- **Độ ưu tiên**: Cao (P1 — điều kiện để dùng đồng bộ sàn thật, chặn trước Phase 07)

## 1. Mục đích công việc

Báo cáo TASK-013 ngày 16/11/2026 ghi rõ 2 hạn chế còn lại của spike Shopee/TikTok + BullMQ, đều là điều kiện bắt buộc trước khi dùng thật:

1. **Token đồng bộ đang lưu plaintext** trong `channel_connections.access_token/refresh_token` — phải mã hóa at-rest trước khi dùng thật (SPIKE §5.1).
2. **Job kéo đơn chỉ kéo và đếm, chưa lưu đơn về bảng `orders`** — đơn sàn không về được NEXORA thì luồng e2e DoD #6 vẫn thiếu chân cuối (SPIKE §5.6, TASK-013 §4).

Nhiệm vụ này đóng cả 2 hạn chế ở mức code làm được trong VM (không có Postgres/Redis/API key sàn). Việc cần môi trường thật (OAuth thật, chạy worker trên Redis thật, gọi sandbox thật) vẫn thuộc về bước e2e sau này.

## 2. Hiện trạng đã kiểm chứng (nhánh `main`, HEAD `c61fa5b`)

- Token chỉ được ghi vào DB ở 2 chỗ: `sync.processor.ts` khi refresh (Shopee `ensureShopeeToken`, TikTok `ensureTikTokToken`). Chưa có endpoint OAuth callback nào lưu token lần đầu (xem `channel.service.ts` — `connect()` không chạm token); callback sau này phải dùng đúng helper mã hóa của task này.
- `ChannelConnection.accessToken/refreshToken` là `@db.Text` plaintext (schema + comment TODO). Seed tạo 1 kết nối Shopee demo `shopee_mall_98214` KHÔNG có token (null).
- Job `pull-orders` (`sync.processor.ts`): kéo danh sách đơn 24h qua qua `getOrders` rồi chỉ đếm (`count`), ghi `SyncLog` với `successCount = số đơn kéo được`. Đơn chưa lưu `orders`.
- `ShopeeClient.getOrders` trả `ShopeeOrderItem` (order_sn, order_status, create_time, total_amount) — chưa có chi tiết mặt hàng. Endpoint chi tiết `GET /api/v2/order/get_order_detail` đã ghi trong SPIKE §1.4 nhưng chưa có trong client.
- `TikTokClient.getOrders` trả `TikTokOrderItem` (id, status, create_time, payment) — interface chưa có `line_items`/`recipient_address`.
- `OrderService.create()` đã có sẵn để tái dùng: sinh `orderNumber` (`ORD-SP-`/`ORD-TT-`), resolve kho theo TASK-015, resolve variant theo id → SKU theo TASK-016, chỉ trừ tồn cho POS COMPLETED (đơn sàn không bị trừ tồn lặng lẽ). `Order.externalOrderId` đã có field nhưng chưa có unique constraint nào để chống đơn trùng.
- `SyncLog` chỉ có `successCount`/`failureCount`/`errorMessage` — chưa có field riêng cho số đơn kéo về / số đơn trùng bỏ qua.
- `OrderModule` export `OrderService`; `SyncModule` chưa import `OrderModule`. Không có import vòng tròn: Sync → Order → Inventory/Warehouse → Database; Channel → Sync.

## 3. Các bước thực hiện chi tiết

1. **Mã hóa token at-rest** — file mới `backend/src/modules/sync/token-crypto.ts` (hàm thuần, dùng `crypto` của Node, không thêm dependency):
   - AES-256-GCM; khóa 32 byte lấy từ env `SYNC_TOKEN_ENCRYPTION_KEY` (nhận hex 64 ký tự hoặc base64 44 ký tự); thiếu khóa hoặc sai độ dài thì throw lỗi rõ ràng bằng tiếng Việt (fail-fast), KHÔNG bao giờ lặng lẽ lưu plaintext.
   - Định dạng lưu: `v1:<iv-base64>:<ciphertext-base64>:<authTag-base64>` (IV ngẫu nhiên 12 byte mỗi lần mã hóa; prefix version để xoay khóa sau này).
   - `decryptToken(null)` → `null`; giá trị lưu không đúng định dạng `v1:` (token plaintext cũ) → throw lỗi rõ ràng yêu cầu ủy quyền lại, không tự "đoán" là plaintext; sai khóa hoặc ciphertext bị sửa → lỗi xác thực GCM rõ ràng.
   - Không log token ở bất kỳ đâu (cả token đã mã hóa cũng không log).
2. **Nối mã hóa vào đường token hiện có** (`sync.processor.ts`): giải mã 1 lần ngay sau khi nạp `ChannelConnection` trong `process()` (mọi code phía dưới chỉ thấy token đã giải mã trong bộ nhớ); mã hóa lại trước khi ghi token mới ở cả 2 nhánh refresh (Shopee + TikTok). Thêm `SYNC_TOKEN_ENCRYPTION_KEY` vào `.env.example` (chỉ tên + cách sinh `openssl rand -hex 32`, KHÔNG ghi giá trị thật). Cập nhật comment schema `ChannelConnection` (bỏ TODO plaintext).
3. **Chi tiết đơn sàn** — `ShopeeClient.getOrderDetail()` mới (`GET /api/v2/order/get_order_detail`, `order_sn_list` tối đa 50 mã/lần, `response_optional_fields=item_list,recipient_address`); mở rộng interface `TikTokOrderItem` thêm `line_items` (seller_sku, quantity, sale_price...), `recipient_address`, `is_on_hold_order` theo contract 202309 (ghi rõ chưa đối chiếu sandbox).
4. **Map đơn sàn → đơn NEXORA** — file mới `backend/src/modules/sync/order-mapper.ts` (hàm thuần, không phụ thuộc DB):
   - Map trạng thái sàn sang `OrderStatus` nội bộ (Shopee: UNPAID→PENDING, READY_TO_SHIP→CONFIRMED, PROCESSED→PROCESSING, SHIPPED→SHIPPED, COMPLETED→COMPLETED, CANCELLED/IN_CANCEL→CANCELLED; TikTok: UNPAID→PENDING, ON_HOLD→PENDING, AWAITING_SHIPMENT→CONFIRMED, PARTIALLY_SHIPPING/AWAITING_COLLECTION→PROCESSING, IN_TRANSIT→SHIPPED, DELIVERED→SHIPPED, COMPLETED→COMPLETED, CANCELLED→CANCELLED; trạng thái lạ → PENDING).
   - Chuẩn hóa thành `NormalizedMarketplaceOrder` (externalOrderId, channelType, status, paymentStatus, paymentMethod, totalAmount, buyerName/Phone, shippingAddress, items[{sku, productName, quantity, unitPrice}]).
5. **Job kéo đơn lưu về DB** — file mới `backend/src/modules/sync/marketplace-order-importer.ts` (injectable, nhận `PrismaService` + `OrderService`):
   - Với mỗi đơn đã chuẩn hóa: dedup bằng `findFirst` theo (tenantId, channelType, externalOrderId) — đã có thì bỏ qua tạo mới, đếm `skipped` (nếu trạng thái đổi thì cập nhật status/paymentStatus cho đồng bộ, vẫn đếm là skipped); chưa có thì gọi `OrderService.create()` với DTO đã map (variant resolve theo SKU như TASK-016, kho resolve theo TASK-015, `paymentMethod` = `Shopee`/`TikTok Shop`).
   - Đơn không có mặt hàng hoặc SKU không map được variant → không lưu, đếm `errors` kèm lý do (không đoán variant, không lưu đơn thiếu mặt hàng).
   - Lỗi unique P2002 (2 worker cùng lưu 1 đơn) → đếm là `skipped`, không phải lỗi.
   - Trả về `{ pulled, saved, skipped, errors, errorNotes }`.
6. **Nối importer vào processor** (`sync.processor.ts` — `pullOrders`): Shopee: list theo trang → `getOrderDetail` theo lô 50 → normalize → importer; TikTok: list theo trang → normalize trực tiếp từ `line_items` → importer. `SyncLog` ghi đủ 4 số: `pulledCount`/`successCount(saved)`/`skippedCount`/`failureCount(errors)` + note. Giữ nguyên: `POST /channels/:id/sync` vẫn enqueue 2 job BullMQ, `GET /channels/:id/sync-status` vẫn hoạt động (trả thêm 2 số mới), `lastSyncAt` chỉ cập nhật khi job SUCCESS.
7. **Schema + migration 0003** (`database/prisma/migrations/0003_sync_orders/`):
   - `SyncLog` thêm `pulled_count`, `skipped_count` (Int, default 0).
   - `Order` thêm `@@unique([tenantId, channelType, externalOrderId])` — chống đơn trùng ở tầng DB (Postgres coi NULL là khác nhau nên đơn POS không bị ảnh hưởng).
   - Migration sinh bằng `prisma migrate diff` (datamodel cũ từ git → datamodel mới, không bịa SQL), `prisma validate` PASS, `prisma generate` làm mới client.
8. **Kiểm chứng trong VM** (không Postgres/Redis/API key — nói rõ giới hạn): build backend PASS; test mã hóa round-trip; test importer bằng payload mock Shopee/TikTok + fake Prisma/OrderService (chạy 2 lần cùng payload → số đơn không tăng lần 2).

## 4. Tiêu chí nghiệm thu (Acceptance Criteria)

- [x] Không còn đường code nào ghi token plaintext vào DB (grep kiểm chứng: mọi `accessToken`/`refreshToken` ghi vào `channelConnection` đều qua `encryptToken()`; đọc đều qua `decryptToken()`).
  - Grep ngày 17/11/2026: `accessToken: pair`/`refreshToken: pair` còn **0**; `encryptToken()` ở cả 2 điểm ghi refresh (Shopee + TikTok, `sync.processor.ts:194-195,229-230`); `decryptToken()` ở điểm đọc duy nhất sau khi nạp channel (`:112-113`). Log duy nhất nhắc token là 2 dòng "Đã refresh access token ... cho shop [accountId]" — không có giá trị token.
- [x] Thiếu `SYNC_TOKEN_ENCRYPTION_KEY` thì job fail với lỗi rõ ràng bằng tiếng Việt, không lưu plaintext; sai khóa / ciphertext bị sửa / token plaintext cũ đều lỗi rõ ràng.
  - Test A (`/tmp/task017-test-a-token-crypto.js`, chạy trên bản build `dist/`): **12/12 PASS** — round-trip đúng; ciphertext không chứa token gốc, định dạng `v1:iv:ct:tag`; cùng token mã hóa 2 lần khác nhau (IV ngẫu nhiên); sai khóa → lỗi "Không giải mã được token"; sửa 1 ký tự ciphertext → lỗi xác thực GCM; thiếu khóa (mã hóa lẫn giải mã) → lỗi "Thiếu biến môi trường SYNC_TOKEN_ENCRYPTION_KEY"; khóa sai độ dài → lỗi "không hợp lệ"; token plaintext cũ → lỗi "chưa được mã hóa... ủy quyền lại"; `decryptToken(null)` → `null`; khóa base64 cũng dùng được.
- [x] `pull-orders` lưu đơn về bảng `orders` + `order_items` qua `OrderService.create()`; chạy 2 lần cùng payload mock thì lần 2 không tạo đơn trùng (dedup), `SyncLog` ghi đúng `pulled/saved/skipped/errors`.
  - Test B (`/tmp/task017-test-b-importer.js`, payload mock Shopee/TikTok + fake Prisma/OrderService, không gọi mạng): **9/9 PASS** — lần 1: pulled=3, saved=2, skipped=0, errors=1 (đơn SKU lạ `SKU-KHONG-CO` không lưu); lần 2 cùng payload: saved=0, skipped=2, DB vẫn 2 đơn, `OrderService.create` không gọi thêm; kéo lại đơn đã đổi trạng thái (READY_TO_SHIP→SHIPPED) thì cập nhật status, vẫn đếm skipped; race P2002 (worker khác lưu trước) → đếm skipped, không đếm errors. Map trạng thái kiểm chứng: Shopee READY_TO_SHIP→CONFIRMED, TikTok ON_HOLD→PENDING, DELIVERED→SHIPPED, trạng thái lạ→PENDING.
  - `SyncLog` ghi đủ 4 số (processor trả `pulledCount/successCount(saved)/skippedCount/failureCount(errors)`); `GET /channels/:id/sync-status` trả thêm `pulledCount`/`skippedCount`.
- [x] `npm run build` backend PASS; `prisma validate` PASS; migration 0003 sinh bằng `prisma migrate diff`.
  - `nest build` PASS. `prisma validate` PASS với `DATABASE_URL` giả (chạy không env thì lỗi P1012 do thiếu env, không phải do code — như TASK-016). Migration `0003_sync_orders/migration.sql` sinh bằng `migrate diff` từ schema git HEAD → schema mới: `sync_logs` thêm `pulled_count`, `skipped_count`; unique index `orders_tenant_id_channel_type_external_order_id_key`. `prisma generate` đã làm mới client (grep `pulledCount` trong client mới: 43 chỗ).
  - Kiểm chứng thêm: boot thử backend (`node dist/main.js`, env giả) — mọi module khởi động được, **không lỗi DI** (`SyncModule` + `OrderModule` đều "dependencies initialized"); dừng đúng ở fail-fast quen thuộc "không kết nối được PostgreSQL... Can't reach database server at localhost:5432" (VM không có Postgres — đúng kỳ vọng).
- [x] `POST /channels/:id/sync` vẫn enqueue 2 job BullMQ; `GET /channels/:id/sync-status` vẫn hoạt động.
  - `channel.service.ts` không sửa trong task này (enqueue giữ nguyên); `sync.service.ts` chỉ thêm 2 field vào response `getLatestSyncStatus`.
- [x] KHÔNG nói đã e2e sandbox thật (chưa có key sandbox + Postgres + Redis trong VM).
  - Chưa kiểm chứng: OAuth thật, worker chạy trên Redis thật, gọi sandbox Shopee/TikTok thật, đơn thật lưu về DB thật. VM không có Docker/Postgres/Redis/API key sàn.

## 5. Kết quả thực hiện (17/11/2026, nhánh `main`, chỉ local — chưa push)

- Commit trên nhánh `main`: "feat(sync): TASK-017 mã hóa token at-rest + job kéo đơn lưu về orders" (code) và "docs: TASK-017 DONE..." (docs) — xem `git log`.

**Mã hóa token at-rest — `backend/src/modules/sync/token-crypto.ts` (mới):**
- AES-256-GCM, khóa 32 byte từ env `SYNC_TOKEN_ENCRYPTION_KEY` (hex 64 ký tự hoặc base64 44 ký tự), IV ngẫu nhiên 12 byte/lần mã hóa, định dạng lưu `v1:<iv>:<ciphertext>:<tag>` (base64). Thiếu/sai khóa → throw lỗi tiếng Việt rõ ràng, không fallback plaintext. Token plaintext cũ → từ chối, yêu cầu ủy quyền lại. Không log token ở đâu.
- Nối vào `sync.processor.ts`: giải mã 1 lần sau khi nạp `ChannelConnection`; mã hóa lại ở cả 2 nhánh refresh (Shopee + TikTok). `.env.example` thêm `SYNC_TOKEN_ENCRYPTION_KEY` (chỉ tên + cách sinh `openssl rand -hex 32`, không giá trị thật). Comment schema `ChannelConnection` cập nhật theo.

**Job kéo đơn lưu về DB:**
- `backend/src/modules/channel/shopee.client.ts`: thêm `ShopeeOrderDetail` + `getOrderDetail()` (`GET /api/v2/order/get_order_detail`, tối đa 50 mã/lần, `response_optional_fields=item_list,recipient_address`). `tiktok.client.ts`: mở rộng `TikTokOrderItem` thêm `line_items`, `recipient_address`, `is_on_hold_order`.
- `backend/src/modules/sync/order-mapper.ts` (mới, hàm thuần): map trạng thái sàn → `OrderStatus` nội bộ; chuẩn hóa thành `NormalizedMarketplaceOrder` (externalOrderId, buyer, items theo SKU).
- `backend/src/modules/sync/marketplace-order-importer.ts` (mới): dedup theo (tenantId, channelType, externalOrderId) — đã có thì bỏ qua tạo mới (cập nhật status nếu đổi), chưa có thì lưu qua `OrderService.create()` (resolve kho TASK-015 + variant theo SKU TASK-016, không trừ tồn cho đơn sàn); SKU không map được → không lưu, đếm lỗi; race P2002 → đếm skipped.
- `sync.processor.ts` — `pullOrders()` viết lại: Shopee list → detail theo lô 50 → normalize → importer; TikTok list → normalize trực tiếp → importer. `SyncLog` ghi đủ pulled/saved/skipped/errors. `sync.module.ts` import `OrderModule` + provider `MarketplaceOrderImporter` (không có import vòng tròn).

**Schema + migration 0003:** `SyncLog` thêm `pulled_count`, `skipped_count`; `Order` thêm `@@unique([tenantId, channelType, externalOrderId])`.

**Còn thiếu/blocker để e2e thật (không đổi so với TASK-013):** (1) API key/app sandbox Shopee + TikTok Shop; (2) môi trường Postgres + Redis (`docker compose up`); (3) URL public cho OAuth redirect. Ngoài ra còn tồn đọng trong code, ghi rõ để task sau: chưa có endpoint OAuth callback thật (khi viết callback phải dùng `encryptToken()` trước khi lưu — hiện token chỉ được ghi ở 2 nhánh refresh); refresh token Shopee rotating chưa có lock theo shop (SPIKE §1.3); trạng thái thanh toán suy từ trạng thái đơn (đối soát tiền thật thuộc Phase 08); phí ship/phí sàn chưa tách (Order không có field); `externalCreatedAt` chưa lưu (Order không có field).
