# NEXORA — Frontend Architecture

Thư mục `frontend/` chứa toàn bộ mã nguồn giao diện người dùng của nền tảng NEXORA, được xây dựng trên nền tảng **Next.js (App Router)** và **TypeScript**.

## 1. Công Nghệ Sử Dụng

- **Framework**: Next.js 15+ (App Router).
- **Core Library**: React 19 / TypeScript 5+.
- **Styling**: Tailwind CSS v3.4+, PostCSS, Autoprefixer.
- **Component Library**: shadcn/ui (dựa trên Radix UI primitives).
- **Icons**: Lucide React.
- **Data Fetching & Server State**: TanStack Query (React Query v5).
- **Form Management & Validation**: React Hook Form kết hợp Zod schema.
- **Client State**: Zustand (chỉ sử dụng cho UI state nhẹ).
- **Data Visualization**: Recharts / Chart.js (cho dashboard báo cáo).

## 2. Quy Chuẩn Cấu Trúc Thư Mục

```text
frontend/
├── app/                  # Next.js App Router (Layouts, Route Groups, Pages)
│   ├── (auth)/           # Route group cho luồng đăng nhập, quên mật khẩu
│   ├── (dashboard)/      # Route group giao diện quản trị chính
│   ├── api/              # Route handlers (BFF - Backend For Frontend nếu cần)
│   ├── globals.css       # File cấu hình CSS toàn cục
│   └── layout.tsx        # Root layout ứng dụng
│
├── components/           # Reusable UI Components
│   ├── ui/               # Nguyên tử shadcn/ui (Button, Dialog, Dropdown, Table, Input, ...)
│   ├── common/           # Thành phần dùng chung (EmptyState, LoadingSpinner, ConfirmModal, ...)
│   └── layout/           # Thành phần khung trang (Header, Sidebar, UserNav, TenantSwitcher, ...)
│
├── features/             # Feature-based Domain Modules (Đóng gói logic theo nghiệp vụ)
│   ├── auth/             # Component, hooks, services của xác thực
│   ├── orders/           # Quản lý đơn hàng (OrderTable, OrderDetail, CreateOrderDialog)
│   ├── products/         # Quản lý sản phẩm & biến thể
│   ├── inventory/        # Quản lý tồn kho & phiếu xuất/nhập
│   ├── conversations/    # Hộp thư hội thoại đa kênh (ChatBox, MessageFeed)
│   ├── channels/         # Kết nối sàn TMĐT (Shopee, TikTok, Facebook)
│   └── reports/          # Biểu đồ và widget thống kê
│
├── hooks/                # Custom React Hooks dùng chung (useMediaQuery, useDebounce, ...)
├── lib/                  # Helpers, utilities, axios/fetch client instance (utils.ts, api-client.ts)
├── services/             # Lớp gọi REST API tập trung
├── types/                # Type definitions và interfaces dùng chung
├── config/               # Cấu hình tĩnh phía frontend (menu navigation, site metadata)
├── providers/            # React Context Providers (ThemeProvider, QueryProvider, AuthProvider)
├── styles/               # File định kiểu mở rộng
└── public/               # Static assets (logos, images, favicon)
```

## 3. Quy Tắc Phát Triển

1. **Phân tách Server & Client Components**: Ưu tiên Server Components cho việc render khung và tối ưu SEO/tải trang; chỉ dùng `'use client'` khi có tương tác DOM, state hoặc event listeners.
2. **Co-location trong Features**: Gom nhóm logic gắn liền với nghiệp vụ vào thư mục `features/` tương ứng nhằm giảm tải sự phụ thuộc chéo.
3. **Form & Validation**: Mọi form nhập liệu phải sử dụng `react-hook-form` kèm schema định nghĩa bằng `zod`.
4. **Clean Types**: Không sử dụng `any`, luôn định nghĩa kiểu tường minh cho props và API responses.
