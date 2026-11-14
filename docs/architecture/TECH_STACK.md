# Lựa Chọn Công Nghệ & Phiên Bản — Tech Stack

> Trạng thái thông tin: `[PROPOSED]` Đánh giá và lựa chọn công nghệ bởi Senior Technical Lead.

Tài liệu này ghi nhận toàn bộ các công nghệ, thư viện thành phần và lý do lựa chọn phiên bản cho nền tảng **NEXORA**. Dự án tuân thủ nghiêm ngặt nguyên tắc sử dụng các phiên bản ổn định hiện hành (LTS) và đảm bảo tính tương thích dài hạn.

---

## 1. Bảng Tổng Hợp Công Nghệ Chủ Chốt

| Phân Vùng | Công Nghệ / Thư Viện | Phiên Bản Lựa Chọn | Lý Do Kỹ Thuật & Khả Năng Mở Rộng |
| :--- | :--- | :--- | :--- |
| **Runtime** | Node.js | v22 LTS (Active LTS) | Hiệu năng V8 vượt trội, hỗ trợ native fetch, tích hợp module ESM hiện đại và độ ổn định bảo mật cao. |
| **Package Manager**| pnpm | v10.x / v9.x | Tốc độ cài đặt nhanh gấp 2–3 lần npm, tiết kiệm dung lượng ổ đĩa nhờ cơ chế hard link, hỗ trợ Monorepo hoàn hảo. |
| **Frontend Framework**| Next.js | v15+ (App Router) | Hỗ trợ Server Components giảm dung lượng bundle tải về phía client, tối ưu hóa hình ảnh và SSR/SSG. |
| **Giao Diện UI** | Tailwind CSS + shadcn/ui | Tailwind v3.4+, Radix UI | Hệ thống Design System đồng bộ, khả năng tùy biến cao, không phụ thuộc vào thư viện CSS-in-JS cồng kềnh. |
| **Quản Lý Form** | React Hook Form + Zod | RHF v7+, Zod v3+ | Hiệu năng render form tối ưu (uncontrolled inputs), validate schema đồng nhất giữa frontend và backend DTO. |
| **Data Fetching** | TanStack Query | v5+ | Quản lý server state, tự động cache, refetch thông minh khi cửa sổ active, xử lý optimistic updates mượt mà. |
| **Backend Framework**| NestJS | v10+ | Khung kiến trúc vững chắc theo mô hình Modular Monolith, tích hợp Dependency Injection, Decorators và hệ sinh thái phong phú. |
| **Tài Liệu API** | Swagger / OpenAPI | v7+ (`@nestjs/swagger`) | Tự động sinh tài liệu API trực quan từ DTO, hỗ trợ kiểm thử API trực tiếp trên giao diện web. |
| **Realtime Gateway**| Socket.IO | v4.x | Hỗ trợ WebSocket hai chiều kèm cơ chế dự phòng HTTP long-polling, xử lý room theo Tenant và User. |
| **Cơ Sở Dữ Liệu** | PostgreSQL | v16+ | Hệ quản trị CSDL quan hệ mạnh mẽ, hỗ trợ chuẩn ACID, JSONB linh hoạt và cơ chế Row-Level Security (RLS) cho Multi-Tenancy. |
| **ORM** | Prisma | v5.x / v6.x | Type-safe tuyệt đối từ database schema đến TypeScript types, hệ thống migration tự động tin cậy. |
| **Bộ Nhớ Đệm & Queue**| Redis + BullMQ | Redis 7+ Alpine, BullMQ v5+| Hàng đợi công việc nền phân tán (Distributed Job Queue), hỗ trợ delay, retry, backoff và lưu trữ phiên làm việc nhanh. |
| **Containerization**| Docker + Docker Compose| Docker Engine v24+ | Đóng gói môi trường đồng nhất giữa máy phát triển của lập trình viên và máy chủ triển khai thực tế. |
| **Web Server** | Nginx | v1.26+ (Mainline/Stable) | Máy chủ web reverse proxy hiệu năng cao, xử lý SSL termination, nén gzip và điều phối luồng WebSocket. |

---

## 2. Ma Trận Tương Thích & Đánh Giá Rủi Ro

### 2.1. Node.js 22 LTS với NestJS v10 & Next.js 15
- **Đánh giá:** Hoàn toàn tương thích. NestJS v10 và Next.js 15 đều hỗ trợ chính thức Node.js 20 và 22 LTS.
- **Rủi ro:** Một số thư viện phụ thuộc cũ có thể phát cảnh báo deprecation; giải pháp là luôn chọn các thư viện được bảo trì tích cực.

### 2.2. Prisma ORM với Kiến Trúc Multi-Tenant
- **Đánh giá:** Prisma hỗ trợ mạnh mẽ cơ chế Client Extensions (`$extends`) cho phép tự động tiêm điều kiện `WHERE tenant_id = currentTenantId` vào mọi câu truy vấn `findMany`, `findFirst`, `update`, `delete`.
- **Lưu ý:** Cần viết middleware kiểm soát chặt chẽ để không vô tình gọi các phương thức Raw Query bỏ qua bộ lọc Tenant.

### 2.3. Redis & BullMQ Cho Xử Lý Đồng Bộ Sàn TMĐT
- **Đánh giá:** BullMQ là thư viện quản lý hàng đợi chuẩn mực nhất trong hệ sinh thái Node.js/TypeScript, hỗ trợ gom cụm (concurrency limit) để không vi phạm quy định giới hạn tần suất (Rate Limit) của Shopee và TikTok Shop.
