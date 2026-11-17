# TASK-018 (DỰ THẢO): Click-Through 4 Tab Dashboard Còn Lại + Hồi Quy Nút Thanh Toán POS

- **Mã nhiệm vụ**: `TASK-018`
- **Giai đoạn**: `Phase 06.5 — Foundation Hardening (Củng cố nền tảng)`
- **Trạng thái**: `DONE` — hoàn thành ngày 17/11/2026, commit xem §5
- **Người thực hiện**: Frontend Engineer
- **Độ ưu tiên**: Cao (P0 — đóng nốt phần click-through còn dở từ TASK-014 trước khi vào Phase 07)

## 1. Mục đích công việc

Báo cáo TASK-014 ngày 16/11/2026 ghi rõ: click-through dashboard đạt 9/9 PASS nhưng chỉ gồm Tổng quan / POS / Đơn hàng / Tồn kho / chuyển kho; 4 tab **Kênh, Sản phẩm, Hộp thư, Cửa hàng** vẫn chưa được click-through, và thanh toán POS chưa bấm tới cùng (sau đó TASK-016 đã chứng minh nút chặn khi backend down 11/11 PASS). Nhiệm vụ này thử nốt 4 tab còn lại bằng click chuột thật, và hồi quy nút thanh toán POS sau TASK-016/017.

## 2. Hiện trạng đã kiểm chứng (nhánh `main`, HEAD `1d35428`)

- Cả 4 component đều tồn tại và đã import trong `frontend/app/dashboard/page.tsx`: `ChannelsTab`, `ProductsTab`, `ChatTab`, `StoresTab` (dòng 166–199).
- Script click-through cũ còn tại `frontend/scripts/clickthrough-dashboard.mjs` (headless Chrome + CDP thuần Node, backend cổng 4000 down).
- `ChannelsTab`: nút "Đồng bộ tồn kho ngay" + "Đồng bộ lại" từng kênh, gọi `handleTriggerChannelSync` (mock 1200ms, toast "Đã đồng bộ thành công...", `lastSyncedAt` → "Vừa xong").
- `ProductsTab`: lưới 12 thẻ sản phẩm, ảnh thật qua `next/image`, giá bán/giá vốn, SKU — **không có ô tìm/lọc và không có modal chi tiết** trong code hiện tại, nên tab này chỉ kiểm chứng render + ảnh load được, ghi rõ giới hạn này thay vì bịa tương tác tìm/lọc.
- `ChatTab`: danh sách 3 hội thoại mock (`MOCK_CONVERSATIONS`), click chọn hội thoại, ô nhập + nút "Gửi" (toast "Đã gửi tin nhắn phản hồi thành công!", xóa ô nhập), nút "Mở POS Chốt Đơn".
- `StoresTab`: `storeService.getStores()/getWarehouses()` gọi API thật, không có fallback mock — backend down thì danh sách cửa hàng/kho rỗng (0 cửa hàng), tab vẫn render KPI + lưới trống, không crash. Nút "Làm Mới" gọi lại API; "Thêm Chi Nhánh Mới" mở `AddStoreModal` (đóng bằng nút X hoặc "Hủy Bỏ"). Vì 0 cửa hàng nên không thử được nút "Mở POS" trên thẻ cửa hàng — thay bằng thử đổi điểm bán ở tab POS (nút "Chi Nhánh 1 (Quận 1)" / "Chi Nhánh 2 (Bình Thạnh)" đã hardcode trong `PosTab`).

## 3. Các bước thực hiện chi tiết

1. Mở rộng script click-through (script mới `frontend/scripts/clickthrough-tabs-018.mjs`, cùng mẫu CDP với script cũ) để thử lần lượt 4 tab, mỗi tab ít nhất 2 tương tác chính, ghi PASS/FAIL từng tương tác, chụp ảnh `screenshots/dashboard-click-channels.png`, `dashboard-click-products.png`, `dashboard-click-chat.png`, `dashboard-click-stores.png`, chạy lại 2 lần như TASK-014:
   - **Kênh**: mở tab (chờ "Trung Tâm Kết Nối Kênh Bán Hàng"), bấm "Đồng bộ tồn kho ngay" (chờ toast thành công + "Vừa xong"), bấm "Đồng bộ lại" trên thẻ kênh đầu tiên.
   - **Sản phẩm**: mở tab, đếm đủ 12 thẻ sản phẩm, kiểm tra toàn bộ ảnh sản phẩm load được (`complete && naturalWidth > 0`).
   - **Hộp thư**: mở tab, chọn hội thoại thứ 2 (header đổi tên khách), gõ tin nhắn + bấm "Gửi" (toast thành công, ô nhập được xóa).
   - **Cửa hàng**: mở tab (ghi rõ số cửa hàng render được khi backend down), bấm "Làm Mới" (loading xong, không exception), mở modal "Thêm Chi Nhánh Mới" rồi đóng bằng "Hủy Bỏ".
2. Hồi quy nút thanh toán POS sau TASK-016/017 với backend down: thêm 1 sản phẩm vào giỏ, bấm thanh toán — phải hiện banner lỗi đỏ, giữ giỏ, không mở hóa đơn (chỉ kiểm tra lại, TASK-016 đã chứng minh 11/11 PASS). Thử đổi điểm bán POS "Chi Nhánh 1" → "Chi Nhánh 2".
3. Phụ: `.env.example` vẫn còn placeholder mật khẩu seed (`SEED_ADMIN_PASSWORD=change-me-dev-only-...`, ghi từ TASK-014) — thay bằng hướng dẫn sinh mật khẩu mạnh, KHÔNG ghi giá trị thật.
4. Cập nhật tracking goal `goal_2b029143f0ce` đang lỗi thời (vẫn ghi "Waiting for your choice on offline POS checkout" dù user đã chọn phương án A ngày 17/11 và TASK-016/017 đã DONE).
5. Cập nhật file task này thành DONE với kết quả kiểm chứng thật.

## 4. Tiêu chí nghiệm thu (Acceptance Criteria)

- [x] 4 tab đều render không exception JS; mỗi tab ≥2 tương tác được thử và ghi kết quả.
  - Script mới `frontend/scripts/clickthrough-tabs-018.mjs` chạy **4 lần, lần nào cũng 18/18 PASS** (2 lần đầu với check đếm cửa hàng đọc nhầm tiêu đề header; đã sửa check đọc đúng tiêu đề tab rồi chạy lại 2 lần, kết quả giống hệt). Console chỉ có 2 lỗi dự kiến (dedup): `Không thể tải danh sách cửa hàng & kho` do backend 4000 down; failed requests: 5× `ERR_CONNECTION_REFUSED` tới backend 4000 — không có JS exception nào.
- [x] Đủ 4 ảnh chụp đã xem trực tiếp: `screenshots/dashboard-click-channels.png`, `dashboard-click-products.png`, `dashboard-click-chat.png`, `dashboard-click-stores.png` (+ `dashboard-pos-blocked.png` hồi quy).
- [x] Hồi quy POS: backend down → banner lỗi đỏ, giữ giỏ, không mở hóa đơn.
  - Trước: 1 món, 2.490.000 ₫ | sau: 1 món, 2.490.000 ₫ | toast lỗi: có | hóa đơn mở: không. Đổi điểm bán Chi Nhánh 1 → Chi Nhánh 2 cũng PASS (CN2 active, CN1 hết active).
- [x] Frontend build PASS (13 route trong output build lần này, `/dashboard` 150 kB — các báo cáo trước ghi "15 trang", con số đo được lần này là 13 route; không bịa lại 15).
- [x] KHÔNG nói đã e2e thành công tới cùng (cần Postgres thật + SKU đúng trong DB; đồng bộ sàn thật cần key sandbox Shopee/TikTok + Redis).

## 5. Kết quả thực hiện (17/11/2026, nhánh `main`, chỉ local — chưa push)

- Commit trên nhánh `main`: "test(fe): TASK-018 click-through 4 tab còn lại + hồi quy POS" (script mới + sửa `.env.example`) và "docs: TASK-018 DONE..." — xem `git log`.

**Kênh — 3/3 PASS** (ảnh `dashboard-click-channels.png`, đã xem trực tiếp):
- Mở tab: render "Trung Tâm Kết Nối Kênh Bán Hàng" + 4 thẻ kênh (Shopee 45 SKU, TikTok 38 SKU, Facebook 45 SKU, Lazada 30 SKU).
- Bấm "Đồng bộ tồn kho ngay": toast xanh "Đã đồng bộ thành công số lượng tồn khả dụng lên Shopee và TikTok Shop!" + `lastSyncedAt` → "Vừa xong" trên cả 4 thẻ (mock 1200ms — đồng bộ sàn thật vẫn cần key sandbox + Redis, chưa kiểm chứng).
- Bấm "Đồng bộ lại" trên thẻ Shopee: toast thành công lần 2.

**Sản phẩm — 3/3 PASS** (ảnh `dashboard-click-products.png`, đã xem trực tiếp):
- Mở tab: render đủ 12 thẻ sản phẩm (nồi chiên, chảo, ấm, máy xay, nồi cơm, bếp từ, lò vi sóng) kèm giá bán/giá vốn/SKU.
- Toàn bộ 12/12 ảnh thật load được (`complete && naturalWidth > 0`).
- Giới hạn ghi rõ: tab này **không có ô tìm/lọc và không có modal chi tiết** trong code hiện tại, nên không thử được 2 tương tác đó — chỉ kiểm chứng render + ảnh.

**Hộp thư — 3/3 PASS** (ảnh `dashboard-click-chat.png`, đã xem trực tiếp):
- Mở tab: danh sách 3 hội thoại (Nguyễn Hoàng Nam/Facebook, Lê Thúy Hằng/TikTok, Phạm Quốc Bảo/Shopee).
- Chọn hội thoại thứ 2: header khung chat đổi thành "Lê Thúy Hằng / Kênh: TikTok".
- Gõ "Xin chào, shop còn nồi chiên Tefal không ạ?" + bấm "Gửi": toast "Đã gửi tin nhắn phản hồi thành công!", ô nhập được xóa.

**Cửa hàng — 4/4 PASS** (ảnh `dashboard-click-stores.png`, đã xem trực tiếp):
- Mở tab: render graceful khi backend down — tiêu đề tab "Hệ Thống 0 Cửa Hàng", KPI 0 điểm bán / 0 kho / 0 ₫, lưới chi nhánh và kho trống, không crash, không exception JS. Console chỉ có lỗi dự kiến `Không thể tải danh sách cửa hàng & kho` (API `/stores`, `/warehouses` lỗi kết nối).
- Bấm "Làm Mới": fetch lại xong, nút hết loading, không exception.
- Mở modal "Thêm Chi Nhánh Cửa Hàng Mới" rồi đóng bằng "Hủy Bỏ": modal mở và đóng đúng.
- **Phát hiện nhỏ (không chặn):** badge sidebar và tiêu đề header vẫn hiện "2 cửa hàng" khi danh sách rỗng, do code dùng fallback `storesCount || 2` (`DashboardSidebar.tsx`, `DashboardHeader.tsx:38`) — tab nội dung thì hiện đúng 0. Ghi lại cho task sau, không sửa trong task này.
- Nút "Mở POS" trên thẻ cửa hàng không thử được vì 0 cửa hàng khi backend down — thay bằng thử đổi điểm bán ở tab POS (xem hồi quy dưới).

**Hồi quy POS sau TASK-016/017 — 3/3 PASS** (ảnh `dashboard-pos-blocked.png`, đã xem trực tiếp):
- Đổi điểm bán Chi Nhánh 1 → Chi Nhánh 2: CN2 active (nền xanh), CN1 hết active.
- Thêm nồi chiên Tefal vào giỏ rồi bấm "Thanh Toán & In Hóa Đơn" khi backend down: banner lỗi đỏ "Không thể kết nối tới máy chủ backend... Đơn chưa được tạo, giỏ hàng vẫn giữ nguyên.", giỏ giữ nguyên 1 món 2.490.000 ₫, không mở hóa đơn, không có đơn giả.

**Phụ — `.env.example`:** placeholder `SEED_ADMIN_PASSWORD=change-me-dev-only-seed-password` đã đổi thành hướng dẫn sinh mật khẩu mạnh (`openssl rand -base64 32`) + giá trị giữ chỗ `dat-mat-khau-manh-cua-ban-o-day`, không ghi mật khẩu thật.

**Tracking goal:** `goal_2b029143f0ce` đã cập nhật — current_state cũ "Waiting for your choice on offline POS checkout" đã thay bằng trạng thái mới (user chọn phương án A ngày 17/11; TASK-016/017 DONE ở local main).

**Kiểm chứng tổng:** script chạy 4 lần, mỗi lần **18/18 tương tác PASS** (2 lần đầu + 2 lần sau khi sửa check đếm cửa hàng đọc nhầm tiêu đề header). `npm run build` frontend PASS (13 route, `/dashboard` 150 kB).

**Chưa kiểm chứng — nói rõ:** luồng thành công tới cùng (đơn lưu bảng `orders`, tồn kho giảm đúng 1 lần) vẫn cần Postgres thật + SKU đúng trong DB; đồng bộ sàn thật vẫn cần key sandbox Shopee/TikTok + Redis. DoD Phase 06.5 vẫn 2/6 sau TASK-018, vẫn chưa vào Phase 07.
