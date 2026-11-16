# SPIKE: Tích hợp sàn thật — Shopee Open Platform & TikTok Shop Open API

- **Task**: `TASK-013` (Phase 06.5 — Foundation Hardening)
- **Ngày spike**: 16/11/2026
- **Trạng thái**: Spike (nghiên cứu + code client/worker) HOÀN THÀNH — **chưa gọi thử sandbox** vì chưa có tài khoản/app sandbox và chưa có API key. Không có lời gọi API sàn thật nào được thực hiện trong spike này.
- **Code đi kèm**: `backend/src/modules/channel/shopee.client.ts`, `tiktok.client.ts`, `backend/src/modules/sync/` (BullMQ queue + worker), migration `0002_sync_tokens`.

## 0. Nguồn tài liệu — mức độ xác minh

| Nguồn | Dùng cho | Xác minh |
|---|---|---|
| Docs chính thức Shopee Open Platform (`open.shopee.com`) | — | **KHÔNG truy cập được**: portal yêu cầu đăng nhập tài khoản Partner Center. Các chi tiết Shopee dưới đây lấy từ tài liệu thứ cấp (xem dưới) và **phải đối chiếu lại với docs chính thức khi có tài khoản**. |
| Docs chính thức TikTok Shop Partner Center (`partner.tiktokshop.com`) | — | **KHÔNG truy cập được trực tiếp** (yêu cầu đăng nhập). Chi tiết dưới đây lấy từ tài liệu thứ cấp đối chiếu chéo 3 nguồn độc lập. |
| netalith.com — Shopee Open Platform API Integration (cập nhật ~10/2026) | OAuth, ký HMAC, token lifetime, sandbox, webhook | Đã đọc toàn văn 16/11/2026 |
| developer.inlinex.com.sg — Shopee API Integration Guide | Ký request, đổi code lấy token | Đối chiếu khớp với netalith |
| netalith.com — TikTok Shop API Integration Guide (cập nhật 02/10/2026) | OAuth, ký HMAC, rate limit, webhook, mã lỗi | Đã đọc toàn văn 16/11/2026; bài ghi rõ đã đối chiếu Partner Center ngày 10/11/2026 |
| deltologic.com — TikTok Shop API Integration Guide (2026) | OAuth, endpoint 202309 | Đối chiếu khớp với netalith |
| docs.intelligent.page — TikTok Shop (đọc từ source `EcomPHP/tiktokshop-php`, 21/09/2026) | Path endpoint product/order/inventory | Đối chiếu khớp với netalith/deltologic |

**Kết luận về độ tin cậy**: Luồng OAuth, công thức ký HMAC, host và vòng đời token của cả hai sàn **khớp nhau giữa ≥ 2 nguồn độc lập** → đủ tin để viết client. **Tên endpoint chi tiết, tham số từng API và con số rate limit của Shopee chưa được xác minh từ docs chính thức** → client ghi rõ "cần đối chiếu Partner Center" và mọi lỗi từ sàn đều được log kèm `request_id`/body để debug khi có key sandbox.

---

## 1. Shopee Open Platform (API v2)

### 1.1 Đăng ký & môi trường

- Đăng ký tại Shopee Open Platform với 2 loại: **Third-Party Partner** (làm phần mềm cho nhiều seller) hoặc **Registered Business Seller** (tích hợp shop của chính mình).
- **Chọn category của app lúc tạo là quyết định vĩnh viễn**: category cố định toàn bộ API/quyền app được dùng; Open Platform **không bật thêm API lẻ, không đổi category** cho app đã tạo. Phải liệt kê đủ endpoint cần dùng (product, order, logistics…) rồi mới tạo app.
- **Chat API (Customer Service) đã đóng đăng ký mới cho third-party từ 18/11/2024** → Phase 07 Unified Inbox KHÔNG được mặc định hứa hẹn nhắn tin buyer qua Shopee API.
- Host:
  - Sandbox: `https://partner.test-stable.shopeemobile.com`
  - Production: `https://partner.shopeemobile.com`
- Sandbox được Shopee mô tả là "functional nhưng không phải bản sao đầy đủ của production": dùng để kiểm tra ký request, OAuth, refresh token và shape payload; **không dùng để đánh giá throughput hay hành vi edge-case**. Tạo đơn test trên sandbox có thể lỗi (`error_sandbox_order_checkout_cart_item`, `invalid product`…) — Shopee khuyên tạo sản phẩm mới, thử category khác rồi lặp lại trước khi kết luận code sai.
- **IP whitelist**: dữ liệu buyer trong đơn hàng bị mask nếu IP egress của server chưa được whitelist trong app settings. Shopee không mở mask thủ công.

### 1.2 OAuth & token

1. NEXORA tạo link ủy quyền: `GET /api/v2/shop/auth_partner` với `partner_id`, `timestamp` (giây), `sign` (HMAC, xem 1.3) và `redirect`.
2. Seller đăng nhập Shopee, chọn thời hạn ủy quyền: 7 / 30 / 90 / 180 / 365 ngày hoặc tùy chỉnh (≤ 365 ngày). **Hạn ủy quyền là đồng hồ riêng, khác với hạn token** — seller chọn 7 ngày thì sau 7 ngày kết nối đứt dù refresh token vẫn chạy tốt. Phải lưu hạn ủy quyền và nhắc seller kết nối lại trước hạn.
3. Shopee redirect về `redirect` với `code` + `shop_id` trong query. `code` sống **10 phút, dùng 1 lần**.
4. Đổi code lấy token: `POST /api/v2/auth/token/get` (body: `code`, `shop_id`, `partner_id`) → `access_token` + `refresh_token`.
5. Refresh: `POST /api/v2/auth/access_token/get` (body: `refresh_token`, `shop_id`, `partner_id`).
6. Vòng đời: `access_token` **4 giờ**, `refresh_token` **30 ngày**. Refresh chủ động trước hạn, không chờ gọi API lỗi giữa chừng.
7. **Partner Key hết hạn sau 180 ngày** kể từ lúc tạo, không tự gia hạn. Reset key có hiệu lực ngay, key cũ sống thêm tối đa 72 giờ. Reset không làm mất ủy quyền của seller. → Cần lịch nhắc rotate key trước ngày 180.

### 1.3 Ký request (HMAC-SHA256)

- Base string nối theo đúng thứ tự, **không có ký tự phân cách**:
  - Public API (auth link, đổi token, refresh): `partner_id + api_path + timestamp`
  - Shop API: `partner_id + api_path + timestamp + access_token + shop_id`
  - Merchant API: `partner_id + api_path + timestamp + access_token + merchant_id`
- `api_path` chỉ là path, VD `/api/v2/shop/get_shop_info` (không host, không query).
- `sign` = hex HMAC-SHA256(base string, key = `partner_key`), gửi kèm query `partner_id`, `timestamp`, `sign`; shop API thêm `access_token`, `shop_id`.
- Timestamp tính bằng **giây** (`Math.floor(Date.now() / 1000)`), hiệu lực ~5 phút. Lỗi ký thường gặp: sai môi trường (key sandbox gọi host production), timestamp trong base string khác timestamp trên URL, lệch giờ server (giữ NTP).
- **Refresh token là rotating**: nếu 2 worker refresh cùng lúc, worker thua có thể ghi đè cặp token tốt bằng cặp cũ. Phải refresh dưới lock theo từng shop và ghi cả 2 token trong cùng một transaction. (Worker hiện tại chạy concurrency thấp và refresh ngay trước mỗi job; lock phân tán là việc follow-up.)

### 1.4 Endpoint dùng cho đồng bộ (v2, chưa đối chiếu docs chính thức)

| Việc | Endpoint | Ghi chú |
|---|---|---|
| Lấy danh sách sản phẩm | `GET /api/v2/product/get_item_list` | Phân trang `offset`/`page_size`, lọc `item_status` |
| Chi tiết sản phẩm | `GET /api/v2/product/get_item_base_info` | Theo `item_id` |
| Đẩy tồn kho | `POST /api/v2/product/update_stock` | Body `item_id`, `model_id` (0 nếu không có phân loại), `stock` |
| Lấy danh sách đơn | `GET /api/v2/order/get_order_list` | Lọc theo khoảng thời gian (`time_from`/`time_to`), `order_status`, phân trang bằng `cursor` |
| Chi tiết đơn | `GET /api/v2/order/get_order_detail` | Theo `order_sn` |
| Thông tin shop | `GET /api/v2/shop/get_shop_info` | Kiểm tra kết nối sau OAuth |

### 1.5 Rate limit

- **Chưa xác minh được con số cố định từ docs chính thức.** Shopee áp giới hạn theo từng API và theo shop; vượt giới hạn trả lỗi rate limit (HTTP 429 / mã lỗi tương ứng). Client hiện tại chưa throttle chủ động — worker dùng BullMQ limiter (tối đa 1 job đồng thời/shop trong bản spike) và backoff khi gặp 429. **Con số giới hạn từng endpoint phải lấy từ trang reference của endpoint đó trong Partner Center khi có tài khoản.**

### 1.6 Webhook (Push Mechanism)

- Shopee có Push Mechanism: webhook báo thay đổi trạng thái đơn về callback URL đã đăng ký cho app. Thiết kế đúng là **push + đối soát định kỳ**: verify chữ ký push, ack nhanh, đưa event vào queue; job định kỳ query đơn theo khoảng thời gian cập nhật để đối chiếu. Push có thể đến muộn, trùng hoặc mất. Handler phải idempotent theo mã đơn.
- Webhook **chưa triển khai** trong TASK-013 (tùy chọn theo task); job `pull-orders` chạy theo lịch/kích hoạt thủ công là nguồn đồng bộ đơn chính trong spike.

### 1.7 Scope/quyền

- Shopee không dùng scope string kiểu OAuth2 truyền thống; quyền đi theo **category của app** (xem 1.1). Lỗi `permission denied` thường là sai category hoặc endpoint đã nghỉ hưu — không phải lỗi ký.

---

## 2. TikTok Shop Open API (phiên bản 202309)

### 2.1 Đăng ký & môi trường

- Đăng ký tại **TikTok Shop Partner Center** → mục App & Service → tạo app (custom app cho shop của mình hoặc public app cho nhiều seller). Trang chi tiết app cho 3 giá trị: `app_key`, `app_secret`, `service_id`.
- Host:
  - Business API: `https://open-api.tiktokglobalshop.com`
  - Token API: `https://auth.tiktok-shops.com` (host khác business API)
  - Trang ủy quyền (seller): `https://services.tiktokshop.com/open/authorize` (toàn cầu) hoặc `https://services.us.tiktokshop.com/open/authorize` (shop Mỹ)
- Sandbox/dev: Partner Center cung cấp **development shop trong Seller Center** và API testing tool để gọi thử; mục Development Kits có **Webhook Log** để debug webhook. (Chưa dùng được vì chưa có tài khoản Partner Center.)
- Thị trường: 16 thị trường, gồm Việt Nam. API version gắn theo tháng phát hành (`202309` là bộ ổn định hiện tại cho Order/Product/Fulfillment/Return & Refund/Finance). Version cũ còn sống ít nhất 2 tháng sau khi version mới ra; việc nghỉ hưu được báo trước ít nhất 2 tháng trong changelog.
- Lưu ý thay đổi lớn: từ Q1/2026 TikTok tự bật xử lý đơn **On-Hold** (đơn bị giữ 1 giờ sau thanh toán, buyer được hủy không cần seller duyệt, `is_on_hold_order` chỉ có ở response v202309). Đồng bộ đơn phải đọc field này.

### 2.2 OAuth & token

1. Đưa seller tới link ủy quyền `https://services.tiktokshop.com/open/authorize?service_id=...&state=...` (`state` là giá trị ngẫu nhiên dùng một lần, lưu server-side để chống CSRF).
2. Seller duyệt → TikTok redirect về Redirect URL với `?code=...&state=...`; nếu từ chối thì `code=null&error=auth_denied`. `auth_code` hết hạn sau **30 phút, dùng 1 lần** (dùng lại/trễ → lỗi `36004004`).
3. Đổi code lấy token: `GET https://auth.tiktok-shops.com/api/v2/token/get?app_key=...&app_secret=...&auth_code=...&grant_type=authorized_code`.
   - ⚠️ **3 điểm khác OAuth2 chuẩn**: dùng `GET` (không phải POST); `app_secret` gửi **trong query string**; `grant_type` phải đúng là `authorized_code` (không phải `authorization_code`).
   - Vì app secret đi trong query, **không để 2 URL token này lọt vào access log / APM / error report**.
4. Refresh: `GET https://auth.tiktok-shops.com/api/v2/token/refresh?app_key=...&app_secret=...&refresh_token=...&grant_type=refresh_token`.
5. Thành công là `code: 0` **trong JSON body**, không chỉ HTTP status. Response trả `access_token`, `access_token_expire_in`, `refresh_token_expire_in` (là **Unix timestamp tuyệt đối**, không phải số giây), `open_id`, `seller_name`, `seller_base_region`, `user_type`, `granted_scopes`.
6. Vòng đời: `access_token` mặc định **7 ngày**; `refresh_token` hết hạn khi thời hạn ủy quyền seller đã cấp kết thúc (không phải vĩnh viễn). Refresh theo lịch dựa trên timestamp đã lưu, đừng chờ lỗi `105002` giữa ca đồng bộ. Mỗi lần refresh đều thay **cả 2 token** bằng giá trị mới trả về.
7. TikTok gửi webhook `UPCOMING_AUTHORIZATION_EXPIRATION` 30 ngày trước khi ủy quyền hết hạn, rồi nhắc hàng ngày cho tới khi seller ủy quyền lại.

### 2.3 Ký request (HMAC-SHA256)

Mọi business API call đều cần query `sign`. Thuật toán (6 bước):

1. Lấy toàn bộ query param **trừ** `sign` và `access_token`, sắp xếp key theo alphabet.
2. Nối thành `{key}{value}` không phân cách.
3. Đặt **request path** (gồm category + version + resource, VD `/authorization/202309/shops`) lên đầu.
4. Trừ `multipart/form-data`, nối thêm **request body** (đúng bytes sẽ gửi).
5. Bọc toàn bộ bằng app secret ở cả hai đầu: `secret + string + secret`.
6. HMAC-SHA256 với key = app secret, hex-encode.

Ví dụ kiểm chứng (từ signing guide của TikTok, dùng để unit test client): app secret `e59af819cc`, path `/authorization/202309/shops`, `app_key=29a39d`, `timestamp=1623812664` → chuỗi ký là `e59af819cc/authorization/202309/shopsapp_key29a39dtimestamp1623812664e59af819cc` → signature `b596b73e0cc6de07ac26f036364178ab16b0a907af13d43f0a0cd2345f582dc8`.

Lỗi ký thường gặp: serialize lại JSON body sau khi ký (phải ký đúng bytes gửi đi), đưa access token vào chuỗi ký (từ 202309 token nằm ở header `x-tts-access-token`, không nằm trong chuỗi ký), dùng SHA-256 thường thay vì HMAC-SHA256, quên path/version, timestamp sai (phải là Unix giây 10 chữ số, trong khoảng 5 phút trước → 30 giây sau giờ platform).

### 2.4 Endpoint dùng cho đồng bộ (202309, đối chiếu 3 nguồn)

| Việc | Endpoint | Ghi chú |
|---|---|---|
| Lấy shop đã ủy quyền (+ `shop_cipher`) | `GET /authorization/202309/shops` | Gọi đầu tiên sau OAuth; `shop_cipher` là định danh shop đã mã hóa, **từng endpoint yêu cầu khác nhau** — có endpoint thiếu thì lỗi `106013`, có endpoint thừa thì lỗi `36009004`. Client giữ cờ `shop_cipher` theo từng endpoint |
| Tìm sản phẩm | `POST /product/202309/products/search` | Lọc theo trạng thái (VD `DRAFT`); phân trang |
| Chi tiết sản phẩm | `GET /product/202309/products/{product_id}` | |
| Tìm tồn kho | `POST /product/202309/inventory/search` | Tồn nằm theo SKU/kho: `skus[].inventory[] {warehouse_id, quantity}`; không có endpoint đọc tồn của 1 SKU riêng |
| Đẩy tồn kho | `POST /product/202309/products/{product_id}/inventory/update` | Body `skus: [{id, inventory: [{warehouse_id, quantity}]}]` |
| Đổi giá | `POST /product/202309/products/{product_id}/prices/update` | |
| Tìm đơn hàng | `POST /order/202309/orders/search` | Lọc theo thời gian tạo/cập nhật, tối đa 100 đơn/trang, phân trang bằng token |
| Chi tiết đơn | `GET /order/202309/orders/{order_id}` | |
| Trạng thái đơn | `UNPAID`, `ON_HOLD`, `AWAITING_SHIPMENT`, `PARTIALLY_SHIPPING`, `AWAITING_COLLECTION`, `IN_TRANSIT`, `DELIVERED`, `COMPLETED`, `CANCELLED` | |

Scope đi theo nhóm API: `order`, `product`, `fulfilment`, `return and refund`, `finance`, `logistics`, `promotion`, `analytics`, `affiliate`. Chỉ xin scope đúng tính năng ship đầu tiên (xin thừa làm chậm duyệt app và giảm tỉ lệ seller đồng ý). Scope seller thực sự cấp trả về trong `granted_scopes`; thiếu scope → lỗi `105005`.

### 2.5 Rate limit

- **Không có một con số QPS cố định.** TikTok dùng cấp phát QPS động theo số shop đã ủy quyền, loại endpoint và tải hệ thống; trang reference của từng endpoint (nếu ghi limit) được ưu tiên.
- Đơn vị cô lập nhỏ nhất là **app × shop đã ủy quyền** (một shop bận không làm đói quota shop khác; một số endpoint giới hạn theo app).
- Điểm khởi đầu thận trọng (theo docs TikTok, không phải quota đảm bảo): ghi nặng/phân tích phức tạp 0,2–1 req/s; ghi thường 1–3 req/s; đọc/đồng bộ thường 3–10 req/s; đọc nhẹ/batch 5–20 req/s. Tăng dần 20–30% mỗi 10–15 phút, dừng khi bị throttle.
- Rate limit biểu hiện bằng HTTP **429** hoặc business code **`36009002`**. Retry theo exponential backoff + jitter, base 1s, cap 60s, ~5 lần, **không retry sớm hơn header `Retry-After`**. Ưu tiên endpoint batch và đồng bộ tăng dần (lọc theo thời gian thay đổi) thay vì kéo toàn bộ.
- Worker hiện tại: BullMQ limiter 10 job/phút/queue + backoff của BullMQ; giới hạn này là điểm khởi đầu thận trọng, chỉnh sau khi có số liệu sandbox thật.

### 2.6 Webhook

- Đăng ký URL webhook HTTPS (TLS 1.2+, domain — không IP, không port tùy chỉnh) trong Partner Center hoặc qua Events API `PUT /event/202309/webhooks` (body `address`, `event_type`).
- Trả **HTTP 200 body rỗng trong 3 giây**; sai chữ ký trả 401 (tính là delivery thất bại, không phải ack). Bảo đảm giao **ít nhất một lần** → trùng lặp sẽ xảy ra, dedupe theo `tts_notification_id`.
- Retry khi lỗi: sau 2 phút, rồi 30 phút, 3 giờ, 12 giờ; dừng sau lần retry thứ 4.
- Verify chữ ký webhook (khác chữ ký API request): header `Authorization` (không prefix `Bearer`) = hex HMAC-SHA256 của `app_key + raw_body`, key = app secret. Verify trên raw bytes trước khi parse, so sánh constant-time.
- Event cần đăng ký trước: `ORDER_STATUS_CHANGE`, `SELLER_DEAUTHORIZATION` (dừng gọi API, đánh dấu kết nối inactive), `UPCOMING_AUTHORIZATION_EXPIRATION`, `PRODUCT_STATUS_CHANGE`, `CANCELLATION_STATUS_CHANGE`, `RETURN_STATUS_CHANGE`.
- TikTok khuyến nghị **không coi webhook là nguồn duy nhất**: giữ job poll định kỳ đối soát đơn/package/sản phẩm/return.
- Webhook **chưa triển khai** trong TASK-013; job `pull-orders` là nguồn đồng bộ đơn chính trong spike.

### 2.7 Mã lỗi thường gặp

| Mã | Ý nghĩa | Kiểm tra đầu tiên |
|---|---|---|
| `106001` | Sai `sign` | Path đã ký, đúng bytes body, timestamp, app secret |
| `105002` | Access token hết hạn | Chạy refresh rồi retry 1 lần |
| `105005` | Thiếu scope | Scope app trong Manage API, rồi `granted_scopes` của token |
| `101000` | Query/header không hợp lệ (token/cipher) | `user_type` của token, token có thuộc shop trong `shop_cipher` không |
| `106013` | Thiếu `shop_cipher` | Lấy từ Get Authorized Shops |
| `36009002` | Rate limited | Backoff, tôn trọng `Retry-After` |
| `36009004` | Nhiều lỗi validate request | Đọc message: thiếu sign, token header sai, app key sai, timestamp, `shop_cipher` thừa |
| `36009010` | Sai HTTP method | Dùng đúng method trên trang reference |
| `36009014` | Sai API version | Đoạn version trong path |
| `36009033` | IP không nằm trong allow list | Cài đặt App & Service trong Partner Center |
| `36004004` | Auth code không hợp lệ | Code đã dùng, quá 30 phút, hoặc sai |

---

## 3. Thiết kế đã triển khai trong spike (code, chưa chạy thật)

- **Token**: `ChannelConnection` thêm `access_token`, `refresh_token`, `token_expires_at`, `last_sync_at` (migration `0002_sync_tokens`). Token lưu **plaintext** trong spike — xem §5.
- **Client**: `shopee.client.ts` / `tiktok.client.ts` — class thuần (không phụ thuộc Nest), dùng `fetch` có sẵn của Node 22 (không thêm axios). Mọi credential đọc từ biến môi trường (`SHOPEE_PARTNER_ID`, `SHOPEE_PARTNER_KEY`, `TIKTOK_SHOP_APP_KEY`, `TIKTOK_SHOP_APP_SECRET`); thiếu key → throw lỗi rõ ràng **trước khi gọi mạng**, không gọi API sàn. Có hàm `getProducts`, `getOrders`, `updateStock`, `getAccessToken`/`refreshAccessToken` theo đúng contract §1–2.
- **Queue/worker**: BullMQ queue `channel-sync` trên Redis (`REDIS_URL`, mặc định `redis://localhost:6379`). Job `sync-inventory` (NEXORA → sàn) và `pull-orders` (sàn → NEXORA). Mỗi job ghi một dòng `SyncLog` (trạng thái, số thành công/thất bại, lỗi, thời gian bắt đầu/kết thúc). `POST /channels/:id/sync` chỉ enqueue job và trả job id; `last_sync_at` chỉ được processor cập nhật khi job thành công. `GET /channels/:id/sync-status` trả `SyncLog` gần nhất.
- **Chưa làm trong spike**: OAuth callback endpoint thật (chưa có redirect URL public + chưa có app sandbox để đăng ký), webhook receiver, mã hóa token at-rest, lưu đơn sàn về bảng `orders` của NEXORA (job `pull-orders` hiện chỉ đếm đơn kéo về và ghi `SyncLog`; map SKU sàn ↔ variant NEXORA cần quyết định riêng — xem §6).

## 4. Sandbox: cần gì để gọi thử

| Thứ cần | Shopee | TikTok Shop |
|---|---|---|
| Tài khoản developer | Shopee Open Platform (Partner / Business Seller) | TikTok Shop Partner Center |
| App | Tạo app, chọn đúng category (không đổi được) | Tạo app, xin scope order + product |
| Key/secret | `partner_id` / `partner_key` (sandbox) | `app_key` / `app_secret` / `service_id` |
| Shop test | Shop sandbox trên `partner.test-stable` | Development shop trong Seller Center |
| Redirect URL | URL public (production không cho localhost/IP private) | URL public (callback sau ủy quyền) |
| IP whitelist | Cấu hình IP egress nếu cần xem dữ liệu buyer | Cấu hình IP allow list nếu bật |

## 5. Rủi ro & việc tồn đọng (đọc trước khi production)

1. **Token lưu plaintext** trong `channel_connections.access_token/refresh_token`. Trước production phải mã hóa at-rest (VD: AES-256-GCM với key từ secret manager/env, chỉ giải mã trong bộ nhớ khi gọi API) và không bao giờ log token.
2. **Refresh token Shopee là rotating** — cần lock theo shop khi refresh (xem 1.3). Worker hiện tại chưa có lock phân tán.
3. **Endpoint Shopee chưa đối chiếu docs chính thức** (portal yêu cầu đăng nhập). Đối chiếu lại toàn bộ path/tham số khi có tài khoản Partner Center.
4. **Rate limit Shopee chưa có con số** — lấy từ trang reference từng endpoint khi có tài khoản.
5. **Chưa có webhook** cho cả 2 sàn → đơn mới chỉ về khi job `pull-orders` chạy (thủ công qua `POST /channels/:id/sync` hoặc lịch sau này).
6. **Chưa lưu đơn sàn về bảng `orders`**: cần map `external_order_id` + SKU sàn ↔ `ProductVariant` NEXORA và quyết định xử lý đơn trùng/lỗi map. Đây là việc của bản hoàn thiện TASK-013, không thuộc spike.
7. **Partner Key Shopee hết hạn 180 ngày** — đặt lịch nhắc rotate.
8. **Ủy quyền seller có hạn riêng** (Shopee ≤ 365 ngày; TikTok theo thời hạn cấp) — lưu hạn, nhắc seller ủy quyền lại trước hạn; webhook `UPCOMING_AUTHORIZATION_EXPIRATION` (TikTok) và job quét hạn (Shopee) cần làm ở bản hoàn thiện.

## 6. Kết luận spike

- Đã xác minh được (qua ≥ 2 nguồn độc lập) luồng OAuth, công thức ký, host, vòng đời token và danh sách endpoint cốt lõi của cả 2 sàn → đủ để viết client + worker đúng contract.
- **Chưa xác minh được bằng gọi thử**: chưa có tài khoản sandbox/key nên không có request/response thật nào; endpoint Shopee và con số rate limit Shopee cần đối chiếu lại docs chính thức.
- Bước tiếp theo để e2e thật: user cung cấp (1) tài khoản/app sandbox Shopee + TikTok (hoặc key sandbox), (2) môi trường chạy được Postgres + Redis (VD: `docker compose up` từ TASK-010), (3) URL public cho OAuth redirect (hoặc chạy tunnel). Khi đó: đăng ký app → chạy OAuth thật → gọi thử `getProducts`/`getOrders` → chạy worker → đối chiếu kết quả vào ghi chú này.
