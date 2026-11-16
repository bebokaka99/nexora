# NEXORA — Design System (MASTER)

> **Nguồn sự thật duy nhất (Single Source of Truth)** cho mọi giao diện NEXORA.
> Stack: **Next.js 15 + Tailwind CSS 3.4** · Ngôn ngữ UI: **tiếng Việt** · Vibe: **SaaS B2B xanh lá – trắng**.
> Mọi component mới/sửa đều phải tuân thủ file này. Quy tắc trang riêng (nếu có) nằm trong `pages/`
> và được ưu tiên hơn MASTER, nhưng không được mâu thuẫn với các quy tắc bắt buộc (mục 7).

## 0. Nguồn gốc của hệ thống này (minh bạch)

Được tổng hợp ngày **16/11/2026** từ skill `ui-ux-pro-max-skill` bằng các lệnh tìm kiếm thật
(không bịa palette), cộng với identity đã chốt của dự án:

| Lệnh đã chạy | Kết quả |
|---|---|
| `search.py "SaaS admin dashboard ecommerce Vietnam" --design-system -p "NEXORA"` | Pattern: **Real-Time / Operations Landing** · Style: **Glassmorphism** (light + dark đều hỗ trợ) · Accent xanh lá `#22C55E` · Typography gợi ý: Fira Sans / Fira Code · Checklist pre-delivery (xem mục 8) |
| `search.py "dark mode dashboard contrast" --domain ux` | 3 kết quả: tương phản tối thiểu **4.5:1**, `#333` trên trắng đạt 7:1, focus indicator ≥ 2px chu vi + tương phản 3:1 (WCAG 2.2) |
| `search.py "Vietnamese sans serif clean readable" --domain typography` | 5 kết quả — top 1: pairing **"Vietnamese Friendly": Be Vietnam Pro (heading) + Noto Sans (body)**, "Be Vietnam Pro excellent Vietnamese support" |
| `search.py "green emerald SaaS dashboard" --domain color` | 5 kết quả — Result 1 (Micro SaaS): Accent **`#059669`** (emerald-600) · Result 5 (SaaS General, light): bg `#F8FAFC`, card `#FFFFFF`, fg `#1E293B`, muted-fg `#475569`, border `#E2E8F0`, destructive `#DC2626` · Các result dark: bg `#0F172A`/`#020617`, card `#1B2336`, border `#475569`, muted-fg `#94A3B8` |
| `search.py "dark mode tailwind nextjs" --stack nextjs` | **0 kết quả** → thử lại `"dark mode" --stack nextjs`: 1 kết quả nhưng **lạc đề** (chỉ nói `reactStrictMode: true`). Kết luận: **không có hướng dẫn dark-mode nào từ DB cho stack Next.js** → dark mode trong file này lấy từ `references/quick-reference.md` §6 (`color-dark-mode`, `color-accessible-pairs`) và các token dark của DB color (mục 5). |
| `references/quick-reference.md` §6 | `font-scale` 12·14·16·18·24·32 · `line-height` 1.5–1.75 · `color-dark-mode`: dark dùng **biến thể nhạt hơn / kém bão hòa hơn, không đảo ngược màu**; kiểm tra tương phản riêng · `color-accessible-pairs`: 4.5:1 (AA) / 7:1 (AAA) · `color-not-decorative-only`: màu chức năng phải kèm icon/chữ · `number-tabular`: số liệu dùng tabular figures · `elevation-consistent`: một thang shadow thống nhất · `icon-style-consistent`: một bộ icon duy nhất · `dark-mode-pairing`: thiết kế light/dark cùng lúc |

### Điểm lệch có chủ đích so với kết quả `--design-system`

Tool trả về style **Glassmorphism nền tối** (bg `#0F172A`, primary `#1E293B`) và font Fira Sans —
điều này **mâu thuẫn với identity đã chốt của NEXORA (sáng, xanh lá–trắng, emerald-600)**.
Quyết định: **giữ emerald-600 `#059669` làm primary** (được DB xác nhận là accent emerald của
Micro SaaS, Result 1) và giữ nền sáng làm mặc định; chỉ lấy từ Glassmorphism phần **áp dụng được**:
backdrop-blur 10–20px + border 1px mờ **chỉ cho modal / nav overlay**, không phủ kính lên toàn bộ
dashboard (dashboard dày dữ liệu, kính mờ làm giảm tương phản và khả năng đọc). Dark mode là
**chế độ phụ, thiết kế cùng lúc với light** (`dark-mode-pairing`), không phải đảo ngược màu light.

---

## 1. Palette — Token màu

### 1.1 Nguyên tắc

- **Không hardcode hex trong component.** Mọi màu đi qua token (CSS variable) hoặc class Tailwind
  đặt tên theo token (vd `bg-primary`, `text-muted-foreground`). Hex chỉ xuất hiện trong file này
  và trong file định nghĩa token.
- Màu chức năng (success/warning/error/info) **không bao giờ chỉ dùng màu để truyền nghĩa** —
  luôn kèm icon + chữ (`color-not-decorative-only`).
- Nền sáng là mặc định; dark là biến thể cùng brand, không đảo ngược (`color-dark-mode`).

### 1.2 Brand — Emerald (chủ đạo)

Lấy từ thang Tailwind emerald; primary đã chốt **`#059669` (emerald-600)** — trùng accent emerald
của DB color Result 1 (Micro SaaS).

| Token | Giá trị | Dùng cho |
|---|---|---|
| `--color-primary` / `emerald-600` | `#059669` | Nút chính, link, trạng thái active, accent CTA |
| `--color-primary-hover` / `emerald-700` | `#047857` | Hover/pressed của nút chính |
| `--color-primary-soft` / `emerald-50` | `#ECFDF5` | Nền nhạt của badge/chip/alert emerald |
| `--color-primary-strong` / `emerald-500` | `#10B981` | Chỉ dùng cho fill/biểu đồ, không làm màu chữ trên trắng |
| `--color-primary-border` / `emerald-100` | `#D1FAE5` | Border của card/badge tông emerald |
| `--color-on-primary` | `#FFFFFF` | Chữ/icon trên nền primary (trắng trên `#059669` đạt ~4.5:1, kiểm tra lại khi đổi) |

> ⚠️ **Cấm:** `purple-600` và mọi tông tím trong POS và toàn bộ app — tím lạc tông brand.
> POS dùng emerald làm màu hành động chính (xem mục 9.2).

### 1.3 Neutrals — Slate (nền / chữ)

Lấy từ DB color Result 5 (SaaS General, light) + Result 2/3 (dark).

| Token | Light | Dark | Dùng cho |
|---|---|---|---|
| `--color-background` | `#F8FAFC` (slate-50) | `#0F172A` (slate-900) | Nền trang |
| `--color-card` | `#FFFFFF` | `#1B2336` | Nền card/panel/modal |
| `--color-foreground` | `#1E293B` (slate-800) | `#F8FAFC` (slate-50) | Chữ chính |
| `--color-muted` | `#E9EFF8` | `#272F42` | Nền phụ (hover row, skeleton, badge trung tính) |
| `--color-muted-foreground` | `#475569` (slate-600) | `#94A3B8` (slate-400) | Chữ phụ / label / placeholder — **không dùng màu nhạt hơn cho chữ body** |
| `--color-border` | `#E2E8F0` (slate-200) | `#475569` (slate-600) | Border, divider |
| `--color-ring` | `#059669` | `#34D399` (emerald-400) | Focus ring (xem mục 7) |

Chữ body trên nền trắng: dùng `#1E293B` (tối) hoặc `#475569` (phụ). **Cấm** `text-slate-400`
(`#94A3B8`) làm chữ trên nền sáng và **cấm** xám-trên-xám (`contrast-readability`).

### 1.4 Màu sàn / kênh — chỉ dùng cho badge & nhãn kênh

Màu thương hiệu chính thức của sàn, **chỉ dùng để nhận diện kênh** (badge, dot, logo kênh),
tuyệt đối không dùng làm màu UI chung, màu nút hay màu trạng thái.

| Kênh | Màu | Ghi chú |
|---|---|---|
| Shopee | `#EE4D2D` (cam Shopee) | Badge "Shopee", dot kênh |
| TikTok Shop | `#000000` + accent `#FE2C55` / `#25F4EE` | Badge "TikTok Shop" — nền đen, chữ trắng, accent đỏ/cyan chỉ làm điểm nhấn nhỏ |
| Facebook | `#1877F2` | Badge "Facebook", dot kênh |
| Lazada | `#0F156D` / `#FF6A00` | Badge "Lazada" (nếu hiển thị kênh) |
| Website / POS | `#059669` (emerald-600) | Kênh nội bộ dùng đúng màu brand |

### 1.5 Màu trạng thái (semantic)

| Trạng thái | Token | Light | Dark | Kèm theo |
|---|---|---|---|---|
| Success | `--color-success` | `#16A34A` (green-600) | `#4ADE80` (green-400) | Icon check + chữ |
| Warning | `--color-warning` | `#D97706` (amber-600) | `#FBBF24` (amber-400) | Icon cảnh báo + chữ |
| Error / Destructive | `--color-destructive` | `#DC2626` (red-600, DB color R1/R5) | `#F87171` (red-400) | Icon lỗi + chữ, đặt gần field lỗi |
| Info | `--color-info` | `#0284C7` (sky-600) | `#38BDF8` (sky-400) | Icon info + chữ |

Quy tắc dark: trạng thái ở dark dùng **biến thể sáng hơn của cùng hue** (green-400 thay vì
green-600) để giữ tương phản trên nền tối — không đảo ngược, không dùng nguyên màu light.

### 1.6 Token CSS (đặt trong `globals.css` / `tailwind.config`)

```css
:root {
  --color-primary: #059669;
  --color-primary-hover: #047857;
  --color-primary-soft: #ECFDF5;
  --color-background: #F8FAFC;
  --color-card: #FFFFFF;
  --color-foreground: #1E293B;
  --color-muted: #E9EFF8;
  --color-muted-foreground: #475569;
  --color-border: #E2E8F0;
  --color-success: #16A34A;
  --color-warning: #D97706;
  --color-destructive: #DC2626;
  --color-info: #0284C7;
  --color-ring: #059669;
}
.dark {
  --color-primary: #10B981;          /* emerald-500: sáng hơn 1 nấc để nổi trên nền tối */
  --color-primary-hover: #34D399;    /* emerald-400 cho hover/focus trên nền tối */
  --color-primary-soft: #064E3B;     /* emerald-900 làm nền nhạt trên dark */
  --color-background: #0F172A;
  --color-card: #1B2336;
  --color-foreground: #F8FAFC;
  --color-muted: #272F42;
  --color-muted-foreground: #94A3B8;
  --color-border: #475569;
  --color-success: #4ADE80;
  --color-warning: #FBBF24;
  --color-destructive: #F87171;
  --color-info: #38BDF8;
  --color-ring: #34D399;
}
```

---

## 2. Typography — Font & thang chữ

### 2.1 Font — Be Vietnam Pro (đã xác minh từ DB)

Pairing **"Vietnamese Friendly"** (top 1, `--domain typography`): **Be Vietnam Pro** làm font duy
nhất cho cả heading lẫn body (Noto Sans chỉ làm fallback), vì Be Vietnam Pro hỗ trợ dấu tiếng Việt
tốt và đủ các weight cho cả UI dày dữ liệu.

```ts
// app/layout.tsx — dùng next/font, KHÔNG @import Google Fonts trong CSS
import { Be_Vietnam_Pro } from 'next/font/google';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-sans',
});
```

Fallback (khi font chưa tải): `font-family: 'Be Vietnam Pro', 'Noto Sans', system-ui, -apple-system,
'Segoe UI', sans-serif` — **không dùng font hệ thống làm font chính** (lỗi đã biết), chỉ làm fallback.
Font mono (mã đơn, SKU, số liệu code): `ui-monospace, 'Fira Code', monospace` — chỉ cho code/SKU,
không dùng Fira Sans làm font UI (đó chỉ là gợi ý lạc tông của tool `--design-system`).

### 2.2 Thang typography — base 16px, chữ nhỏ nhất 12px

Theo `font-scale` của skill: **12 · 14 · 16 · 18 · 24 · 32**, line-height body **1.5–1.75**.

| Token | Size / Line-height | Weight | Dùng cho |
|---|---|---|---|
| `text-display` | 32px / 1.25 | 700 | Số liệu hero landing, tiêu đề trang lớn |
| `text-h1` | 24px / 1.33 | 700 | Tiêu đề trang (dashboard, POS, settings) |
| `text-h2` | 20px / 1.4 | 600 | Tiêu đề section / card lớn |
| `text-h3` | 18px / 1.4 | 600 | Tiêu đề card, tiêu đề modal |
| `text-body` | **16px** / 1.5 | 400 | **Body mặc định — base 16px** |
| `text-body-sm` | 14px / 1.5 | 400 | Mô tả phụ, nội dung bảng |
| `text-caption` | **12px** / 1.5 | 500 | **Nhỏ nhất cho phép** — label, caption, timestamp, badge |
| `text-number` | theo ngữ cảnh | 600–700 | Số liệu KPI/doanh thu — bắt buộc `font-variant-numeric: tabular-nums` |

**Luật cứng:**

- **Cấm chữ < 12px** (kể cả `text-[9px]`, `text-[10px]`, `text-[11px]` — lỗi đã biết, 103 vị trí
  trong dashboard cũ phải nâng lên ≥ 12px).
- Body 16px, line-height 1.5–1.75; độ dài dòng 65–75 ký tự (`line-length`).
- Số liệu, giá tiền, cột dữ liệu: **tabular-nums** để không nhảy layout (`number-tabular`).
- Heading ngắn: cho phép `text-wrap: balance`; không chèn `&nbsp;` ép dòng.
- Truncation: ưu tiên wrap; khi truncate thì ellipsis + tooltip/expand xem đủ (`truncation-strategy`).

---

## 3. Spacing / Radius / Shadow

- **Spacing:** lưới 4px — `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64`. Khoảng cách giữa các
  phần tử tương tác ≥ 8px; padding trong card 16–24px; gap giữa các section 24–32px.
- **Radius:** `sm 6px` (badge, input nhỏ) · `md 8px` (button, input — mặc định) ·
  `lg 12px` (card — mặc định) · `xl 16px` (modal, panel lớn) · `full` (avatar, pill).
- **Shadow — một thang thống nhất** (`elevation-consistent`, không tự bịa giá trị lẻ):

| Token | Giá trị | Dùng cho |
|---|---|---|
| `shadow-sm` | `0 1px 2px rgb(15 23 42 / 0.05)` | Card phẳng, input |
| `shadow-md` | `0 4px 12px rgb(15 23 42 / 0.08)` | Card nổi, dropdown |
| `shadow-lg` | `0 12px 32px rgb(15 23 42 / 0.12)` | Modal, popover |
| Dark mode | giảm opacity ~50% + tăng blur 1 nấc | Shadow trên nền tối phải nhạt hơn, không đen đặc |

- **Border:** 1px, dùng `--color-border`; card dùng `border + shadow-sm`, không double-border.

---

## 4. Dark mode — Tokens & luật

Dark mode là **chế độ đầy đủ, thiết kế cùng lúc với light** (`dark-mode-pairing`), không phải
class `dark:` rải rác sau này. Lỗi đã biết: dashboard cũ có **0 class `dark:`** nên dark vỡ hoàn toàn.

| Thành phần | Light | Dark |
|---|---|---|
| Nền trang (`background`) | `#F8FAFC` | `#0F172A` |
| Nền card (`card`) | `#FFFFFF` | `#1B2336` |
| Nền phụ / hover (`muted`) | `#E9EFF8` | `#272F42` |
| Border | `#E2E8F0` | `#475569` |
| Chữ chính (`foreground`) | `#1E293B` | `#F8FAFC` |
| Chữ phụ (`muted-foreground`) | `#475569` | `#94A3B8` |
| Primary (nút/chữ nhấn) | `#059669` | `#10B981` (sáng hơn 1 nấc) |
| Primary hover | `#047857` | `#34D399` |
| Focus ring | `#059669` | `#34D399` |
| Trạng thái (success/warning/error/info) | green-600 / amber-600 / red-600 / sky-600 | green-400 / amber-400 / red-400 / sky-400 |

**Luật dark mode:**

1. **Mọi màu trong component phải có cặp `dark:`** — không có ngoại lệ cho dashboard, sidebar,
   bảng, modal, toast. Dùng token CSS (mục 1.6) thay vì hardcode từng class `dark:` nếu được.
2. Dark dùng **biến thể nhạt/kém bão hòa hơn của cùng hue** (`color-dark-mode`) — ví dụ emerald-400/500
   thay emerald-600; **cấm** đảo ngược (nền trắng → chữ đen trên nền đen giữ nguyên hue đậm).
3. Kiểm tra tương phản **riêng cho dark** — mục tiêu vẫn 4.5:1; chữ phụ dark `#94A3B8` trên `#0F172A`
   đạt ~7:1, đạt chuẩn; không dùng slate-500 (`#64748B`) làm chữ trên nền tối.
4. Chart/biểu đồ: đổi sang palette dark (xem mục 9.1) — không giữ nguyên màu light trên nền tối.
5. Ảnh/logo: logo trắng trên dark phải có phiên bản riêng; không dùng `invert` bừa bãi.

---

## 5. Quy tắc chính từ skill (bắt buộc)

Ưu tiên theo bảng của skill (1 → 10). Các mục sau là **luật cứng**, vi phạm là lỗi review:

| # | Quy tắc | Chi tiết |
|---|---|---|
| 1 | **Tương phản 4.5:1** (AA) | Text thường ≥ 4.5:1, text lớn ≥ 3:1; mục tiêu AAA 7:1 cho body. Kiểm tra bằng công cụ đo, không ước lượng bằng mắt. Cấm xám-trên-xám. |
| 2 | **Touch tối thiểu 44×44px** | Mọi nút, icon-button, checkbox, tab, row bấm được: hit-area ≥ 44px. Icon 20px thì padding đệm lên 44px. Khoảng cách giữa các target ≥ 8px. **Đặc biệt bắt buộc ở POS** (màn cảm ứng). |
| 3 | **Focus ring thống nhất** | `outline: 2px solid var(--color-ring); outline-offset: 2px` — **cấm xóa focus ring** (`outline: none` không kèm thay thế). Mọi phần tử tương tác phải focus được bằng bàn phím, thứ tự focus theo DOM. |
| 4 | **Không emoji làm icon** | Icon = SVG từ **một bộ duy nhất: Lucide** (ưu tiên) — `icon-style-consistent`. Emoji chỉ xuất hiện trong nội dung do user nhập (vd tên sản phẩm), không bao giờ trong UI chrome. Icon trang trí: `aria-hidden="true"`; icon-button: bắt buộc `aria-label` tiếng Việt. |
| 5 | **Không hardcode hex trong component** | Mọi màu qua token (mục 1) hoặc class Tailwind theo token. Hex chỉ có trong file token + file này. |
| 6 | **Tôn trọng `prefers-reduced-motion`** | Xem mục 6. |
| 7 | **Chữ nhỏ nhất 12px, base 16px** | Xem mục 2.2. |
| 8 | **Trạng thái rõ ràng** | Hover / pressed / disabled / loading phải khác nhau rõ bằng mắt; không đổi trạng thái tức thì 0ms; loading luôn có feedback (spinner/skeleton), không để nút "chết". |
| 9 | **Mobile-first, không scroll ngang** | Breakpoint kiểm tra: **375 / 768 / 1024 / 1440px**; cấm `fixed px` cho container; cấm `user-scalable=no`. |
| 10 | **Alt text & label** | Ảnh có `alt` tiếng Việt; form có `<label>` hiển thị (cấm placeholder-only); lỗi đặt **ngay dưới field** + tóm tắt lỗi ở đầu form khi cần. |

---

## 6. Animation & Motion

- **Thời lượng:** micro-interaction **150–300ms** (`ease-out`); enter chậm hơn exit
  (`exit-faster-than-enter`); không dùng một duration cho mọi transition.
- **Easing:** `ease-out` cho enter, `ease-in` cho exit; tránh `linear` trừ progress/spinner.
- **Cấm:** animate `width`/`height` (gây layout thrash) — dùng `transform`/`opacity`; cấm animation
  chỉ chạy bằng hover (phải có trạng thái tương đương cho touch/keyboard).
- **`prefers-reduced-motion: reduce`:** tắt mọi animation/transition không cần thiết, render
  snapshot tĩnh cuối cùng; ticker/preview tự cập nhật phải có nút pause/hide và tần suất điều chỉnh.
- **Lỗi đã biết cần sửa:** class `animate-in` đang chết vì thiếu `tailwindcss-animate` và
  `plugins: []` trống — hoặc cài `tailwindcss-animate` đúng cách, hoặc gỡ toàn bộ `animate-in`
  khỏi codebase; **không để class animation chết trong code**.
- **Hiệu ứng kính (Glassmorphism):** chỉ dùng `backdrop-blur 10–20px` + border mờ cho **modal/nav
  overlay**; không áp lên card dữ liệu hay toàn trang.

---

## 7. Quy tắc dùng chung cho Dashboard / POS / Landing

### 9.1 Dashboard (`/dashboard`, `/don-hang`, `/san-pham`, `/khach-hang`, `/bao-cao`...)

- Mật độ: dùng thang spacing dày vừa phải (gap 16px, padding card 16–24px) nhưng **không hy sinh
  chữ ≥ 12px và touch ≥ 44px** để nhét thêm dữ liệu.
- KPI: số lớn 24–32px, weight 700, `tabular-nums`; label 12px uppercase tracking-wide
  (`text-muted-foreground`); delta tăng/giảm kèm icon mũi tên + chữ (+12,4%), không chỉ màu.
- Bảng: header 12px semibold uppercase; row height ≥ 44px; hover row `bg-muted`; cột số
  canh phải + `tabular-nums`; trạng thái đơn hàng = badge (màu + icon + chữ).
- Chart: legend + tooltip đầy đủ; màu chart lấy từ palette (emerald `#059669`, sky `#0284C7`,
  amber `#D97706`, red `#DC2626`); dark mode đổi sang biến thể -400; không truyền nghĩa chỉ bằng màu.
- Sidebar: item cao 44px, active = nền `emerald-50` + chữ `emerald-700` + vạch trái 3px emerald;
  dark: nền `emerald-900` + chữ `emerald-300`.
- **Sửa ngay:** tách file dashboard 2.602 dòng thành component nhỏ; thêm `dark:` cho mọi token;
  nâng toàn bộ chữ 9–11px lên ≥ 12px; thêm `aria-label` cho icon-button (hiện chỉ có 2).

### 9.2 POS (bán hàng tại quầy)

- **Màu hành động duy nhất: emerald.** Gỡ toàn bộ `purple-600` khỏi POS (nút thanh toán, CTA,
  badge) → `emerald-600` / hover `emerald-700`.
- Nút bấm lớn: nút sản phẩm ≥ 56px, nút thanh toán ≥ 56px chiều cao, font 16px semibold;
  tổng tiền 32px bold `tabular-nums`.
- Giỏ hàng: mỗi dòng ≥ 56px, nút +/− là target 44×44px riêng biệt; xóa dòng có xác nhận.
- Trạng thái thanh toán: thành công = emerald + icon check + chữ "Thanh toán thành công";
  lỗi = red + icon + chữ + lý do; không chỉ đổi màu nút.
- POS chạy trên màn cảm ứng → mọi target ≥ 44px là luật cứng, không ngoại lệ.

### 9.3 Landing (`/`)

- Theo pattern **Real-Time / Operations Landing** (DB): Hero (sản phẩm + preview/status) →
  Key metrics → How it works → CTA (dùng thử / liên hệ). Primary CTA có trong nav **và** sau metrics.
- CTA chính: `bg-emerald-600 hover:bg-emerald-700 text-white`, 16px semibold, cao 48–52px.
- Trust signals: logo sàn (Shopee/TikTok/Facebook với đúng màu mục 1.4), số liệu thật có ghi
  thời gian cập nhật; **chỉ ghi "trực tiếp/live" khi có nguồn dữ liệu thật** kèm trạng thái stale.
- Giữ vibe xanh lá–trắng đã làm tốt: nền trắng/`#F8FAFC`, section xen kẽ emerald-50, chữ slate-800.
- Copy tiếng Việt nhất quán; không trộn tiếng Anh vào UI trừ thuật ngữ chuyên môn đã quen (POS, SKU).

---

## 8. Pre-Delivery Checklist (từ kết quả `--design-system` + skill)

- [ ] Không emoji làm icon (SVG Lucide, một bộ duy nhất)
- [ ] `cursor-pointer` trên mọi phần tử bấm được
- [ ] Hover có transition mượt 150–300ms
- [ ] Light mode: tương phản text ≥ 4.5:1
- [ ] **Dark mode: tương phản text ≥ 4.5:1 (kiểm tra riêng, không suy từ light)**
- [ ] Focus ring nhìn thấy được khi tab bằng bàn phím
- [ ] `prefers-reduced-motion` được tôn trọng
- [ ] Responsive: 375px, 768px, 1024px, 1440px — không scroll ngang
- [ ] Chữ nhỏ nhất 12px, body 16px; số liệu `tabular-nums`
- [ ] Mọi màu qua token, không hex hardcode trong component
- [ ] Icon-button có `aria-label` tiếng Việt; ảnh có `alt`
- [ ] Không còn `purple-600` trong POS; không còn class `animate-in` chết
- [ ] Không còn tài khoản demo hardcode hiển thị ở login (lỗi đã biết, ngoài phạm vi file này
      nhưng phải sửa cùng đợt FE)

---

## 9. Ghi chú triển khai (cho người sửa FE)

1. **Thứ tự sửa theo impact:** (a) token + dark mode dashboard, (b) gỡ `animate-in` chết hoặc
   cài `tailwindcss-animate`, (c) nâng chữ 9–11px lên ≥ 12px, (d) POS tím → emerald,
   (e) font Be Vietnam Pro qua `next/font`, (f) tách dashboard + dựng `components/ui` tối thiểu.
2. **Dark mode:** bật `darkMode: 'class'` trong `tailwind.config` (Tailwind 3.4), toggle đổi class
   `dark` trên `<html>`; mọi màu mới viết phải kèm cặp `dark:` ngay từ đầu.
3. **Token:** định nghĩa CSS variables (mục 1.6) trong `globals.css` và map vào `tailwind.config`
   (`colors: { primary: 'var(--color-primary)', ... }`) để dùng class `bg-primary` thay vì
   `bg-emerald-600` rải rác — đổi brand sau này chỉ sửa một chỗ.
4. **Font:** `next/font/google` với `subsets: ['vietnamese', 'latin']`; kiểm tra dấu tiếng Việt
   (đ, ă, â, ê, ô, ơ, ư + dấu thanh) render đúng ở weight 400/500/600/700 trước khi merge.
5. **Không sửa ngoài phạm vi:** file này thuộc `design-system/`; việc sửa `frontend/` và `docs/`
   do agent FE thực hiện theo file này, không tự ý đổi token khi sửa component — muốn đổi token
   thì sửa MASTER.md trước, rồi mới áp xuống component.
