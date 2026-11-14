# Lộ Trình Phát Triển Sản Phẩm — NEXORA Roadmap

> Trạng thái thông tin: `[CONFIRMED]` cho Giai đoạn 1 & Demo UI | `[PROPOSED]` cho các giai đoạn tiếp theo.

## 1. Tổng Quan Lộ Trình Phát Triển

Lộ trình phát triển của NEXORA được chia làm 4 giai đoạn chiến lược nhằm đảm bảo tính khả thi cao, quản trị rủi ro tốt và sớm mang lại giá trị thực tế cho nhà bán lẻ:

```mermaid
gantt
    title Lộ Trình Triển Khai NEXORA
    dateFormat  YYYY-MM-DD
    section Giai đoạn 1: Foundation & Demo
    Khởi tạo Nền tảng & Docs          :done,    des1, 2026-11-01, 2026-11-15
    TASK-001: Visual Demo UI (Mock)    :active,  des2, 2026-11-16, 2026-11-30
    Core Auth, RBAC & Multi-Tenant    :         des3, 2026-12-01, 2026-12-20
    section Giai đoạn 2: Commerce MVP
    Sản phẩm, Tồn kho & Quản lý Kho    :         des4, 2026-12-21, 2027-01-15
    POS Bán hàng tại quầy (2 Store)   :         des5, 2027-01-16, 2027-02-05
    Đơn hàng & Khách hàng             :         des6, 2027-02-06, 2027-02-25
    section Giai đoạn 3: Omnichannel
    Kết nối Shopee & TikTok Shop API   :         des7, 2027-02-26, 2027-03-20
    Kết nối Meta (FB Page & Chat)     :         des8, 2027-03-21, 2027-04-10
    Unified Inbox & Đồng bộ Tồn kho    :         des9, 2027-04-11, 2027-04-30
    section Giai đoạn 4: SaaS Commercial
    Gói cước, Thuê bao & Cổng thanh toán:        des10, 2027-05-01, 2027-05-25
    Hệ thống Báo cáo Nâng cao (BI)     :        des11, 2027-05-26, 2027-06-15
    Sẵn sàng Thương mại hóa (Public)   :        des12, 2027-06-16, 2027-06-30
```

---

## 2. Chi Tiết Các Giai Đoạn

### Giai Đoạn 1: Nền Móng Kỹ Thuật & Bản Mẫu Trực Quan (Foundation & Visual Prototype)
- **Mục tiêu:** Thống nhất toàn bộ thiết kế giao diện, luồng thao tác và kiến trúc kỹ thuật.
- **Hạng mục chính:**
  - Hoàn tất tài liệu kỹ thuật, kiến trúc và phân tích nghiệp vụ.
  - Xây dựng **TASK-001: Build NEXORA Visual Demo** với giao diện Next.js, shadcn/ui hoàn chỉnh và dữ liệu mẫu (Mock data), không cần backend.
  - Thiết lập hạ tầng Docker, NestJS backend boilerplate, kết nối PostgreSQL và Prisma.

### Giai Đoạn 2: Vận Hành Bán Lẻ Cốt Lõi (Commerce Core & POS)
- **Mục tiêu:** Đưa hệ thống vào sử dụng thực tế cho 2 cửa hàng đồ gia dụng của khách hàng ban đầu để thay thế phần mềm cũ ở khâu bán tại quầy.
- **Hạng mục chính:**
  - Quản lý danh mục, sản phẩm, nhiều biến thể (màu sắc, kích cỡ, chất liệu).
  - Quản lý tồn kho đa kho (Kho Store 1, Kho Store 2, Kho Tổng).
  - Màn hình POS bán hàng siêu tốc, in hóa đơn nhiệt (80mm/58mm), hỗ trợ quét mã vạch.
  - Quản lý ca làm việc của thu ngân và tiền mặt.

### Giai Đoạn 3: Hợp Nhất Đa Kênh & Hội Thoại (Omnichannel & Social Commerce)
- **Mục tiêu:** Đồng bộ tự động toàn bộ đơn hàng và tồn kho từ Shopee, TikTok Shop và Facebook.
- **Hạng mục chính:**
  - Đăng ký và kết nối Open API chính thức của Shopee, TikTok Shop và Meta Graph API.
  - Xây dựng cơ chế hứng Webhook, xếp hàng đợi BullMQ để xử lý đơn hàng về tức thì.
  - Cơ chế đồng bộ tồn kho 2 chiều tránh bán vượt số lượng.
  - Màn hình **Unified Inbox**: Gộp toàn bộ chat từ Fanpage Facebook và TikTok Shop, hỗ trợ tạo đơn ngay tại chat.

### Giai Đoạn 4: Đóng Gói SaaS & Tự Động Hóa Thanh Toán (SaaS Commercialization)
- **Mục tiêu:** Mở cổng đăng ký tự động và thu phí thuê bao định kỳ từ các doanh nghiệp bên ngoài.
- **Hạng mục chính:**
  - Quản lý gói cước (Pricing Plans), chu kỳ thuê bao (Monthly/Yearly).
  - Tích hợp cổng thanh toán (VietQR tự động đối soát, VNPAY, MoMo).
  - Module báo cáo tài chính chuyên sâu (Business Intelligence): Doanh thu thực tế sau phí sàn, phân tích sản phẩm bán chạy, đánh giá KPI nhân viên.
  - Tối ưu hóa hiệu năng, bảo mật và hoàn tất kiểm thử tải (Load Testing).
