# TASK-012: Tách Dashboard 130KB & Sửa Lỗi Frontend Ưu Tiên P0 (Dark Mode, Animation, Nâng Cấp Next, Thống Nhất Accent)

- **Mã nhiệm vụ**: `TASK-012`
- **Giai đoạn**: `Phase 06.5 — Foundation Hardening (Củng cố nền tảng)`
- **Epic**: `EPIC-06-5-C`
- **Trạng thái**: `TODO`
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
- [ ] `npm run build` PASS sau nâng cấp Next; `npm audit` không còn báo CVE-2025-66478.
- [ ] Class `animate-in` có hiệu ứng thật trên giao diện (không còn "chết").
- [ ] File dashboard lớn nhất còn dưới 500 dòng; các tab dashboard vẫn hiển thị đủ dữ liệu như trước khi tách.
- [ ] Bật dark mode: toàn bộ dashboard hiển thị đúng, không còn nền/chữ trắng trên trắng hay đen trên đen; kiểm chứng bằng tay trên `/dashboard`.
- [ ] Trang đăng nhập không còn hiển thị tài khoản demo; accent emerald-600 `#059669` thống nhất trên dashboard.
- [ ] Không thêm tính năng mới trong nhiệm vụ này — chỉ tách, sửa lỗi và chuẩn hóa.
