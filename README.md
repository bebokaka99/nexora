# NEXORA — Commerce Management Platform

> **"One Platform. Every Channel. Complete Control."**

NEXORA là nền tảng quản lý hoạt động kinh doanh đa kênh (Omnichannel Commerce Management Platform) được thiết kế theo mô hình **SaaS Multi-Tenant**. Nền tảng hợp nhất toàn diện hoạt động kinh doanh từ các kênh bán hàng trực tuyến (Shopee, TikTok Shop, Facebook/Messenger) đến hệ thống bán lẻ tại cửa hàng vật lý (POS, Kho hàng, Khách hàng, Doanh thu) trong một hệ sinh thái quản trị tập trung.

---

## 1. Kiến Trúc & Cấu Trúc Dự Án

Dự án áp dụng kiến trúc **Modular Monolith** kết hợp phân tách Monorepo cho Frontend và Backend:

```text
NEXORA/
├── frontend/             # Ứng dụng Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui
├── backend/              # Hệ thống NestJS Modular Monolith, REST API, WebSockets, BullMQ
├── database/             # Quản lý Prisma ORM, migrations, seed data, database docs
├── infrastructure/       # Docker, Docker Compose, Nginx, CI/CD templates
├── docs/                 # Toàn bộ hệ thống tài liệu kỹ thuật & nghiệp vụ
├── .vscode/              # Cấu hình workspace VS Code (extensions, settings, debug launch)
├── .editorconfig         # Chuẩn hóa định dạng file cho các IDE
├── .gitattributes        # Quản lý ký tự ngắt dòng LF/CRLF tự động
├── .gitignore            # Danh sách loại trừ khi commit Git
└── README.md             # Giới thiệu tổng quan dự án
```

---

## 2. Công Nghệ Chủ Chốt (Tech Stack)

| Lớp | Công nghệ | Phiên bản khuyến nghị | Mục đích |
| :--- | :--- | :--- | :--- |
| **Frontend** | Next.js (App Router), React, TypeScript | Next.js 15+ / React 19 / TS 5.x | Giao diện quản trị hiện đại, SSR/SSG tối ưu |
| **UI Components** | Tailwind CSS, shadcn/ui, Lucide Icons | Tailwind v3.4+, Radix UI | Hệ thống Design System đồng bộ, khả năng tùy biến cao |
| **State & Fetching**| TanStack Query (React Query), React Hook Form, Zod | v5+ | Đồng bộ server state, quản lý form và validate dữ liệu |
| **Backend** | NestJS, TypeScript, Express | NestJS 10.x / Node.js 22 LTS | Cấu trúc Modular Monolith, DI container, Clean Architecture |
| **Realtime** | Socket.IO | v4.x | Cập nhật tin nhắn hội thoại, thông báo đơn hàng realtime |
| **Database** | PostgreSQL | v16+ | Hệ quản trị cơ sở dữ liệu quan hệ, hỗ trợ Row-Level Security |
| **ORM** | Prisma | v5.x / v6.x | Type-safe ORM, migrations tự động |
| **Cache & Queue** | Redis, BullMQ | Redis 7+, BullMQ v5+ | Caching dữ liệu, xử lý background jobs đồng bộ sàn |
| **Containerization**| Docker, Docker Compose | v24+ | Đóng gói môi trường đồng nhất giữa Dev và Production |

---

## 3. Hệ Thống Tài Liệu Kỹ Thuật (`/docs`)

Dự án sở hữu kho tài liệu kỹ thuật và nghiệp vụ toàn diện được lưu trữ tại thư mục [`/docs`](./docs/README.md):

- 📘 [**Product Overview & Strategy**](./docs/product/PRODUCT.md): Tầm nhìn, định vị sản phẩm, mô hình kinh doanh SaaS.
- 📋 [**Requirements**](./docs/requirements/REQUIREMENTS.md): Danh mục Functional Requirements (`FR-*`) và Non-functional Requirements (`NFR-*`).
- 🏗️ [**Architecture**](./docs/architecture/ARCHITECTURE.md): Kiến trúc Modular Monolith, Multi-Tenancy, Bảo mật và Sơ đồ C4.
- 🗄️ [**Database Design**](./docs/database/DATABASE.md): Thiết kế thực thể dữ liệu, sơ đồ ERD, chiến lược cô lập dữ liệu.
- 🔌 [**API Conventions**](./docs/api/API.md): Quy chuẩn REST API, xác thực JWT, mã lỗi chuẩn.
- 📦 [**Business Modules**](./docs/modules/README.md): Chi tiết 13 module chức năng cốt lõi.
- 🌐 [**Integrations**](./docs/integrations/INTEGRATIONS.md): Kết nối Meta (Facebook), TikTok Shop, Shopee, Vận chuyển, Cổng thanh toán.
- 💻 [**Development Guide**](./docs/development/DEVELOPMENT_GUIDE.md): Hướng dẫn thiết lập môi trường, coding conventions, Git workflow.
- 🎯 [**Tasks & Roadmap**](./docs/tasks/README.md): Bảng phân rã task qua 8 Phase phát triển, bắt đầu từ **TASK-001: Build NEXORA Visual Demo**.

---

## 4. Bắt Đầu Phát Triển

### Yêu Cầu Môi Trường
- **Node.js**: >= 20.x (Khuyến nghị phiên bản Node.js 22 LTS).
- **Trình quản lý gói**: `pnpm` (>= 9.x) hoặc `npm` (>= 10.x).
- **Git**: >= 2.40.
- **Docker Desktop** (cho môi trường local PostgreSQL & Redis).

### Các Bước Cài Đặt Ban Đầu (Dự trù khi khởi động Phase 01)
1. Mở workspace trong Visual Studio Code:
   ```bash
   code .
   ```
2. Cài đặt các extension được khuyến nghị trong `.vscode/extensions.json`.
3. Xem tài liệu hướng dẫn bắt đầu tại [`docs/development/ENVIRONMENT_SETUP.md`](./docs/development/ENVIRONMENT_SETUP.md).
4. Xem nhiệm vụ đầu tiên tại [`docs/tasks/phase-01-foundation/TASK-001-build-nexora-visual-demo.md`](./docs/tasks/phase-01-foundation/TASK-001-build-nexora-visual-demo.md).

---

## 5. Bản Quyền & Giấy Phép
Dự án được bảo hộ quyền sở hữu trí tuệ nội bộ bởi đơn vị phát triển nền tảng NEXORA.
Mọi quyền được bảo lưu (All Rights Reserved).
