# TASK-012: Tách Dashboard 130KB & Sửa Lỗi Frontend Ưu Tiên P0 (Dark Mode, Animation, Nâng Cấp Next, Thống Nhất Accent)

- **Mã nhiệm vụ**: `TASK-012`
- **Giai đoạn**: `Phase 06.5 — Foundation Hardening (Củng cố nền tảng)`
- **Epic**: `EPIC-06-5-C`
- **Trạng thái**: `DONE` (hoàn thành ngày 16/11/2026, commit xem mục 5)
- **Người thực hiện**: Frontend Engineer
- **Độ ưu tiên**: Cao nhất (P0)

## 1. Mục đích công việc

Đánh giá frontend ngày 16/11/2026 (clone commit `08b9602`, chạy thật: `npm install` và `npm run build` đều PASS, 15 trang tĩnh, First Load JS 105–134 kB) cho thấy giao diện chạy được nhưng có 5 lỗi P0 cần sửa trước khi thêm tính năng mới:

1. **Dark mode vỡ hoàn toàn ở dashboard**: file `frontend/app/dashboard/page.tsx` dài 2.602 dòng (~130KB) có 0 class `dark:`, dù nút toggle dark mode vẫn hiển thị.
2. **Animation chết**: class `animate-in` được dùng nhưng thiếu package `tailwindcss-animate` và `plugins: []` trong cấu hình Tailwind.
3. **Next.js 15.1.0 dính CVE-2025-66478**: cần nâng cấp lên bản đã vá.
4. **Trang đăng nhập hiển thị tài khoản demo** (xử lý cùng `TASK-011`, phần giao diện thuộc nhiệm vụ này).
5. **Chưa có design system**: không có `components/ui`, màu accent chưa thống nhất — chuẩn là emerald-600 `#059669` (xanh lá–trắng) theo vibe SaaS B2B hiện tại.

Đồng thời, dashboard 2.602 dòng phải được tách thành route/component nhỏ để còn bảo trì được: không thể sửa dark mode hay thêm tính năng trên một file khổng lồ như vậy.

> **Căn cứ kiểm chứng**: Đánh giá frontend NEXORA ngày 16/11/2026, clone commit `08b9602`, chạy thật trên port 3000 (`/` , `/dang-nhap`, `/dashboard` đều trả 200).

## 2. Phạm vi thay đổi (Scope)
- **Tệp mã nguồn bị tác động**:
  - `frontend/app/dashboard/page.tsx` (tách thành nhiều route/component: ví dụ `app/dashboard/overview/`, `app/dashboard/channels/`, `components/dashboard/*`)
  - `frontend/components/ui/` (mới: design system tối thiểu — Button, Card, Input, Badge, Modal/Toast dùng chung)
  - `frontend/tailwind.config.*` (thêm `tailwindcss-animate` vào `plugins`)
  - `frontend/package.json` (nâng cấp `next` khỏi 15.1.0 lên bản đã vá CVE-2025-66478; thêm `tailwindcss-animate`)
  - `frontend/app/dang-nhap/page.tsx` (gỡ hiển thị tài khoản demo — phối hợp `TASK-011`)
  - `frontend/app/globals.css` (thống nhất accent emerald-600 `#059669`, bổ sung biến màu dark mode)
- **Các API cần tạo mới hoặc chỉnh sửa**:
  - Không thay đổi API; chỉ tách và sửa giao diện, giữ nguyên dữ liệu mock hiện có cho đến khi backend thật sẵn sàng (`TASK-009`, `TASK-013`).
- **Thay đổi cơ sở dữ liệu (nếu có)**:
  - Không có.

## 3. Các bước thực hiện chi tiết
1. Bước 1: Nâng cấp `next` lên bản đã vá CVE-2025-66478 và cài `tailwindcss-animate`; chạy `npm run build` để xác nhận không vỡ.
2. Bước 2: Thêm `tailwindcss-animate` vào `plugins` của cấu hình Tailwind; kiểm chứng class `animate-in` hoạt động trở lại.
3. Bước 3: Tách `frontend/app/dashboard/page.tsx` (2.602 dòng) thành các route/component theo tab chức năng hiện có (tổng quan, kênh bán hàng, đơn hàng, tồn kho…); mỗi component một file, dùng chung `components/ui/`.
4. Bước 4: Dựng design system tối thiểu trong `frontend/components/ui/` và chuẩn hóa accent về emerald-600 `#059669` trên toàn bộ dashboard.
5. Bước 5: Sửa dark mode dashboard: bổ sung class `dark:` cho toàn bộ component sau khi tách, kiểm chứng bật/tắt toggle không còn vỡ giao diện.
6. Bước 6: Gỡ hiển thị tài khoản demo khỏi trang đăng nhập (phối hợp `TASK-011`); dọn các class chữ quá nhỏ (text 9–11px) về tối thiểu 12px ở các vị trí chính.

## 4. Tiêu chí nghiệm thu (Acceptance Criteria)
- [x] `npm run build` PASS sau nâng cấp Next; `npm audit` không còn báo CVE-2025-66478.
  - Build PASS ngày 16/11/2026 với Next 15.1.9, 15 trang tĩnh (`/dashboard` First Load JS 149 kB).
  - Next 15.1.0 → **15.1.9** (bản vá chính thức cho nhánh 15.1.x theo advisory GHSA-9qr9-h5gf-34mp: 15.0.5, 15.1.9, 15.2.6, 15.3.6, 15.4.8, 15.5.7, 16.0.7). React đã ở 19.3.1 (vượt bản vá 19.2.1). `package-lock.json` xác nhận `next: 15.1.9`.
  - ⚠️ `npm audit` **không chạy được** trong môi trường này: registry chặn endpoint audit (`403 Forbidden - POST /-/npm/v1/security/audits/quick - policy_denied`, kiểm chứng ngày 16/11/2026). Việc hết CVE được xác minh bằng phiên bản đã cài (15.1.9 ∈ danh sách bản vá của vendor), không phải bằng `npm audit`. Cần chạy lại `npm audit` ở môi trường registry mở để xác nhận độc lập.
- [x] Class `animate-in` có hiệu ứng thật trên giao diện (không còn "chết").
  - `tailwindcss-animate@1.0.7` đã có trong `package.json` + `plugins: [animate]` trong `tailwind.config.ts` (xác minh lại ngày 16/11/2026 — đã xong từ commit 48b4153). CSS build `.next/static/css/*.css` chứa `@keyframes enter`, `tw-enter-opacity`, `animate-in`, `slide-in-from-top` (Modal/ToastBanner dùng `animate-in fade-in zoom-in-95` / `slide-in-from-top`).
- [x] File dashboard lớn nhất còn dưới 500 dòng; các tab dashboard vẫn hiển thị đủ dữ liệu như trước khi tách.
  - `page.tsx` 2.635 dòng → **251 dòng**; file lớn nhất mới là `PosCartPanel.tsx` **292 dòng** (kế tiếp `use-pos.ts` 260, `page.tsx` 251, `DashboardSidebar.tsx` 246). Toàn bộ 37 chỗ `text-[11px]` đã lên `text-xs` (grep còn 0).
  - Tách bằng trích xuất cơ học từ file gốc (script `/tmp/split_dashboard.py`): JSX các tab giữ nguyên văn, chỉ đổi tên callback theo props; state dùng chung chuyển vào `use-dashboard-data` / `use-pos` / `use-stores`. Route vẫn `/dashboard` với 8 tab nội bộ, dữ liệu vẫn mock, mọi tương tác giữ nguyên (giỏ POS, modal, drawer, toast, chat gợi ý). Bỏ 2 đoạn code chết: state `showOrderDrawer` (khai báo nhưng không dùng) và import `MOCK_STORES` (không dùng).
  - Ảnh chụp kiểm chứng: `screenshots/dashboard-split-light.png`, `dashboard-split-dark.png`, `dashboard-pos-v3.png` (tab Tổng quan đủ 4 thẻ chỉ số + biểu đồ kênh + sự kiện trực tiếp; tab POS đủ lưới sản phẩm + giỏ hàng).
- [x] Bật dark mode: toàn bộ dashboard hiển thị đúng, không còn nền/chữ trắng trên trắng hay đen trên đen; kiểm chứng bằng tay trên `/dashboard`.
  - Ảnh `dashboard-split-dark.png` (class `dark` trên `<html>`): card slate-900, chữ sáng đọc được, không vỡ. Tổng 380 class `dark:` trong các file dashboard mới.
- [x] Trang đăng nhập không còn hiển thị tài khoản demo; accent emerald-600 `#059669` thống nhất trên dashboard.
  - Đã xác minh lại ngày 16/11/2026: `app/(auth)/dang-nhap/page.tsx` không còn chuỗi demo/tài khoản mẫu (đã gỡ ở commit 48b4153); grep `purple` trong dashboard = 0; `dark:`/emerald đã thống nhất theo `design-system/nexora/MASTER.md`.
- [x] Không thêm tính năng mới trong nhiệm vụ này — chỉ tách, sửa lỗi và chuẩn hóa.

## 5. Kết quả thực hiện (16/11/2026, nhánh `feat/fe-vibe-and-docs-priority`, chỉ local — chưa push)
- Commit trên nhánh `feat/fe-vibe-and-docs-priority`: "feat(fe): TASK-012 tách dashboard 2635 dòng + components/ui + nâng cấp Next 15.1.0 lên 15.1.9 (vá CVE-2025-66478)" (32 file, +3477/−2588, chỉ local — chưa push).

**Nâng cấp Next**: `next` 15.1.0 → **15.1.9** (`package.json` + `package-lock.json`).

**Design system mới — `frontend/components/ui/`** (dùng `cn()`, token emerald/slate, dark mode; tất cả đều đang được dashboard dùng thật):
- `button.tsx` (Button: primary/secondary/outline/ghost/danger), `card.tsx` (Card), `input.tsx` (Input), `badge.tsx` (Badge: emerald/amber/rose/slate/indigo/sky/blue + className màu động từ mock), `modal.tsx` (Modal), `toast.tsx` (ToastBanner), `table.tsx` (Table/TableHead/TableBody/TableRow/TableHeaderCell/TableCell).

**Cấu trúc dashboard mới — `frontend/components/dashboard/`** (route `/dashboard` giữ nguyên, 8 tab nội bộ):
- `page.tsx` (251 dòng): route guard + ghép Sidebar/Header/tabs/modals.
- `types.ts` (DashboardTab, PosCartItem, PosPaymentMethod), `use-dashboard-data.ts` (198 dòng: products/orders/channels/activities, toast, lọc đơn, chỉ số, chuyển kho, đồng bộ kênh), `use-pos.ts` (260 dòng: giỏ POS, chiết khấu, thanh toán, hóa đơn), `use-stores.ts` (133 dòng: cửa hàng/kho, điểm bán POS, thêm chi nhánh).
- `DashboardSidebar.tsx` (246), `DashboardHeader.tsx` (100), `OverviewTab.tsx` (184), `PosTab.tsx` (226), `PosCartPanel.tsx` (292), `OrdersTab.tsx` (159), `InventoryTab.tsx` (122), `ChannelsTab.tsx` (92), `ProductsTab.tsx` (63), `ChatTab.tsx` (97), `StoresTab.tsx` (238), `OrderDetailModal.tsx` (94), `TransferModal.tsx` (115), `ReceiptModal.tsx` (108), `AddStoreModal.tsx` (167), `StatCard.tsx`, `ChannelBar.tsx`.

**Kiểm chứng** (chạy thật ngày 16/11/2026): `npm run build` PASS (15 trang); `curl` 200 cho `/`, `/dashboard`, `/dang-nhap` trên port 3000; ảnh chụp headless Chrome đã xem bằng mắt (light/dark/POS). Hạn chế kiểm chứng: chưa click thử từng tương tác (thanh toán POS, chuyển kho, thêm chi nhánh) trên trình duyệt thật sau khi tách — chỉ kiểm chứng build + render + ảnh; nên click-through nhanh trước khi merge. `npm audit` không chạy được do policy registry (xem ghi chú ở tiêu chí đầu).
