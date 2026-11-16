# TASK-013: Tích Hợp Sàn Thật — Spike Shopee/TikTok Shop API + BullMQ/Redis Worker (Hoàn Thiện Phase 06)

- **Mã nhiệm vụ**: `TASK-013`
- **Giai đoạn**: `Phase 06.5 — Foundation Hardening (Củng cố nền tảng)` (hoàn thiện phần còn thiếu của Phase 06)
- **Epic**: `EPIC-06-A`, `EPIC-06-B`, `EPIC-06-C`
- **Trạng thái**: `ĐẠT MỘT PHẦN (spike)` — xem §5 Kết quả thực hiện ngày 16/11/2026
- **Người thực hiện**: Backend Engineer
- **Độ ưu tiên**: Cao (P1)

## 1. Mục đích công việc

`TASK-008` đã DONE phần CRUD kết nối kênh và cập nhật mốc `lastSyncAt`, nhưng đó mới là vỏ quản lý kết nối — chưa có một lời gọi API sàn thật nào. Phase 06 vì vậy chỉ **DONE một phần**: chưa đồng bộ sản phẩm, chưa kéo đơn hàng, chưa đẩy tồn kho lên sàn. Nhiệm vụ này là phần còn thiếu của Phase 06 và là **điều kiện bắt buộc trước khi vào Phase 07/08**: chứng minh được một luồng end-to-end thật chạy được với ít nhất một sàn.

Nhiệm vụ này phụ thuộc `TASK-009` (PostgreSQL thật — token và dữ liệu đồng bộ phải lưu bền vững) và `TASK-010` (Redis thật qua `docker-compose` cho BullMQ worker).

> **Căn cứ kiểm chứng**: Rà soát repo `bebokaka99/nexora` ngày 16/11/2026, commit `08b9602`. `ChannelService.sync()` chỉ cập nhật `lastSyncAt` bằng thời gian hiện tại; `lastSyncAt` trong dữ liệu seed được gán sẵn (`1 phút trước`, `3 phút trước`) mà không qua API sàn nào; không có BullMQ worker hay Redis nào đang chạy.

## 2. Phạm vi thay đổi (Scope)
- **Tệp mã nguồn bị tác động**:
  - `backend/src/modules/channel/` (mới: `shopee.client.ts`, `tiktok.client.ts`, OAuth/refresh token thật, lưu token vào PostgreSQL)
  - `backend/src/modules/sync/` (mới: BullMQ queue + worker đồng bộ tồn kho/đơn hàng, chạy trên Redis thật)
  - `backend/src/modules/channel/channel.service.ts` (nối `sync()` vào queue thật thay vì chỉ cập nhật `lastSyncAt`)
- **Các API cần tạo mới hoặc chỉnh sửa**:
  - `POST /api/v1/channels/:id/sync` — đổi từ cập nhật mốc thời gian sang enqueue job đồng bộ thật, trả về trạng thái job.
  - `GET /api/v1/channels/:id/sync-status` (mới, tùy chọn) — trạng thái job đồng bộ gần nhất.
  - Webhook nhận đơn hàng mới từ sàn (tùy chọn trong spike, bắt buộc ở bản hoàn thiện nếu sàn hỗ trợ).
- **Thay đổi cơ sở dữ liệu (nếu có)**:
  - Bảng/field lưu token sàn (`access_token`, `refresh_token`, `token_expires_at`) và nhật ký đồng bộ (`sync_logs`) trong `schema.prisma` (migration mới sau `TASK-009`).

## 3. Các bước thực hiện chi tiết
1. Bước 1 (Spike, tối đa 2–3 ngày): Đăng ký app sandbox Shopee Open Platform và TikTok Shop Open API; gọi thử API lấy danh sách sản phẩm/đơn hàng bằng token sandbox; ghi lại giới hạn, quy trình OAuth và refresh token của từng sàn vào `docs/` (ghi chú spike).
2. Bước 2: Cài đặt OAuth thật cho ít nhất một sàn (ưu tiên sàn nào spike xong trước): lưu token vào PostgreSQL, tự động refresh khi hết hạn.
3. Bước 3: Dựng BullMQ queue + worker trên Redis thật (`TASK-010`): job đồng bộ tồn kho một chiều NEXORA → sàn và job kéo đơn hàng sàn → NEXORA.
4. Bước 4: Nối `POST /api/v1/channels/:id/sync` vào queue thật; ghi `sync_logs` (thời gian, số bản ghi thành công/thất bại, lỗi).
5. Bước 5: Chạy luồng end-to-end thật trên sandbox: đổi tồn kho trong NEXORA → tồn kho trên sàn đổi theo; có đơn mới trên sàn → đơn xuất hiện trong NEXORA. Ghi lại bằng chứng (log, ảnh chụp màn hình) vào ghi chú nghiệm thu.

## 4. Tiêu chí nghiệm thu (Acceptance Criteria)
- [x] Spike hoàn thành cho Shopee và TikTok Shop: có ghi chú OAuth, scope, giới hạn API — **NHƯNG chưa có kết quả gọi thử sandbox** (thiếu tài khoản/app sandbox và API key). Ghi chú spike: `docs/tasks/phase-06-5-foundation-hardening/SPIKE-shopee-tiktok.md`.
- [ ] Ít nhất một sàn chạy OAuth thật, token lưu trong PostgreSQL và tự refresh được. — Code lưu token + tự refresh đã có (migration `0002_sync_tokens`, `SyncProcessor.ensureShopeeToken/ensureTikTokToken`); **chưa chạy OAuth thật** vì chưa có app sandbox/key và chưa có redirect URL public.
- [ ] Worker BullMQ/Redis chạy thật: job đồng bộ tồn kho và kéo đơn hàng hoàn thành, có bản ghi trong `sync_logs`. — Queue + worker + ghi `SyncLog` đã code xong và build PASS; **chưa chạy thật** vì VM không có Redis/Postgres (xem §5).
- [ ] Luồng end-to-end thật chạy được trên sandbox: đổi tồn trong NEXORA → sàn cập nhật; đơn mới trên sàn → về NEXORA. — **Chưa làm được** (thiếu key sandbox + Postgres + Redis). Ngoài ra đơn kéo về hiện chỉ đếm, chưa lưu vào bảng `orders` (cần map SKU — xem SPIKE §3/§5).
- [x] `POST /api/v1/channels/:id/sync` không còn chỉ cập nhật `lastSyncAt` giả — mốc thời gian chỉ cập nhật khi job đồng bộ thật thành công. — `sync()` giờ enqueue 2 job BullMQ và trả job id; `lastSyncAt` chỉ được `SyncProcessor` cập nhật khi job SUCCESS; `GET /channels/:id/sync-status` mới trả `SyncLog` gần nhất.

## 5. Kết quả thực hiện (16/11/2026 — spike, chưa e2e sandbox)

- **Nhánh/commit**: `feat/fe-vibe-and-docs-priority`, commit `eda80e6` — `feat(sync): TASK-013 spike Shopee/TikTok + BullMQ worker + SyncLog (chưa có API key, chưa e2e sandbox)` (local, KHÔNG push).
- **Spike**: `SPIKE-shopee-tiktok.md` — OAuth/refresh, scope, endpoint, rate limit, webhook, sandbox của cả 2 sàn. Docs chính thức (open.shopee.com, partner.tiktokshop.com) yêu cầu đăng nhập nên **không truy cập trực tiếp được**; chi tiết lấy từ tài liệu thứ cấp đối chiếu chéo ≥ 2 nguồn (netalith, inlinex, deltologic, docs.intelligent.page). Endpoint Shopee và con số rate limit Shopee **chưa đối chiếu docs chính thức** — phải kiểm tra lại khi có tài khoản Partner Center.
- **Migration**: `database/prisma/migrations/0002_sync_tokens/migration.sql` — sinh bằng `prisma migrate diff` (schema HEAD → schema mới, không bịa SQL): `channel_connections` thêm `access_token`, `refresh_token`, `token_expires_at`, `last_sync_at`; bảng mới `sync_logs` (+ enum `SyncJobType`, `SyncStatus`); bảng mới `channel_product_mappings` (map variant NEXORA ↔ item sàn — bắt buộc để job đẩy tồn biết đẩy variant nào lên item nào). `prisma validate` PASS. **Chưa áp migration lên Postgres thật** (VM không có Postgres).
- **Client thật**: `backend/src/modules/channel/shopee.client.ts` (ký HMAC-SHA256 Shopee, `getProducts`/`getOrders`/`updateStock`, đổi/refresh token) và `tiktok.client.ts` (ký HMAC TikTok, `getAuthorizedShops`/`getProducts`/`getOrders`/`updateStock`, verify webhook). Dùng `fetch` của Node 22, không thêm axios. Mọi credential từ env (`SHOPEE_PARTNER_ID/KEY`, `TIKTOK_SHOP_APP_KEY/SECRET/SERVICE_ID`); thiếu key → throw rõ ràng trước khi gọi mạng; không hardcode key nào.
- **Worker**: `backend/src/modules/sync/` (`sync.queue.ts`, `sync.service.ts`, `sync.processor.ts`, `sync.module.ts`) — queue `channel-sync` (BullMQ 6.7.6 + ioredis 6.0.0, mới cài), job `sync-inventory` (NEXORA → sàn qua mapping) và `pull-orders` (sàn → NEXORA, hiện chỉ kéo + đếm, chưa lưu `orders`), mỗi job ghi `SyncLog`. `SyncModule` đã đăng ký vào `app.module.ts`.
- **Kiểm chứng 16/11/2026** (VM: có node/npm, KHÔNG docker/postgres/redis, KHÔNG API key):
  - `prisma validate` — PASS.
  - `npm run build` backend — PASS.
  - `npm run build` frontend — KHÔNG chạy (không sửa FE).
  - Test khói `node /tmp/task013-smoke.js` — **10/10 PASS**: lỗi thiếu key rõ ràng cho cả 2 sàn (không gọi mạng); chữ ký TikTok khớp ví dụ chuẩn của signing guide (`b596b73e…`); chữ ký Shopee đúng định dạng HMAC-SHA256; Redis `localhost:6379` trả `ECONNREFUSED` (chưa có Redis). Script test ở `/tmp` (không commit).
  - `grep`: `sync()` không còn chạm `updatedAt`/`lastSyncAt`; `lastSyncAt` chỉ còn được ghi ở `sync.processor.ts` khi job SUCCESS. `lastSyncAt` không còn ở seed (seed không đặt mốc giả).
  - Thử chạy backend (`node dist/main.js`, `REDIS_URL=redis://localhost:6379`): **FAIL như kỳ vọng theo chuỗi fail-fast** — thiếu `JWT_SECRET` thì dừng ở lỗi JWT (TASK-011); đủ JWT thì dừng ở `không kết nối được PostgreSQL… Can't reach database server at localhost:5432` (TASK-009). `SyncModule` khởi động được (không crash vì thiếu Redis — Worker kết nối lazy). **Chưa quan sát được worker báo lỗi Redis khi chạy thật** vì boot dừng ở Postgres trước; lỗi enqueue khi thiếu Redis đã chứng minh ở tầng ioredis trong test khói.
- **Còn thiếu/blocker để e2e thật**: (1) API key/app sandbox Shopee + TikTok Shop (hoặc tài khoản Partner Center để tạo app + development shop); (2) môi trường có Postgres + Redis (VD: `docker compose up` từ TASK-010 — VM hiện không có docker); (3) URL public cho OAuth redirect (production không cho localhost); (4) lưu đơn sàn về bảng `orders` (cần map SKU — việc follow-up); (5) mã hóa token at-rest + lock refresh theo shop (Shopee refresh token rotating); (6) đối chiếu lại endpoint/rate limit Shopee với docs chính thức.
