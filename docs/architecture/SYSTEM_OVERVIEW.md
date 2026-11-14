# Tổng Quan Hệ Thống — System Overview & C4 Diagrams

> Trạng thái thông tin: `[PROPOSED]` Mô hình hóa kiến trúc theo chuẩn C4 (Context & Container).

Tài liệu này sử dụng mô hình C4 để biểu diễn bức tranh toàn cảnh về cách các thành phần trong hệ thống NEXORA tương tác với người dùng và các nền tảng bên ngoài.

---

## 1. C4 Cấp Độ 1: System Context Diagram (Bối Cảnh Hệ Thống)

Sơ đồ thể hiện hệ thống NEXORA trong mối quan hệ với các nhóm tác nhân người dùng và hệ thống đối tác bên thứ ba:

```mermaid
graph TD
    subgraph Users [Người Dùng Hệ Thống]
        Admin[Chủ Doanh Nghiệp / Tenant Admin]
        Staff[Nhân Viên Bán Hàng & Kho Vận]
        PlatformAdmin[Platform Super Administrator]
    end

    subgraph NEXORA_System [NEXORA Commerce Management Platform]
        Core[NEXORA Core Application]
    end

    subgraph External_Platforms [Hệ Thống & Sàn Đối Tác Bên Thứ Ba]
        Shopee[Shopee Open Platform]
        TikTok[TikTok Shop Open API]
        Meta[Meta Graph API / Messenger]
        Payment[Cổng Thanh Toán / VietQR Hub]
        Logistics[Hãng Vận Chuyển: GHN, GHTK]
    end

    Admin -->|Quản trị doanh nghiệp, xem báo cáo, thiết lập kênh| Core
    Staff -->|Bán hàng tại quầy POS, xử lý hội thoại, đóng gói đơn| Core
    PlatformAdmin -->|Quản lý Tenant, cấu hình gói cước SaaS| Core

    Core <-->|Đồng bộ đơn hàng, sản phẩm, tồn kho| Shopee
    Core <-->|Đồng bộ đơn hàng, sản phẩm, tồn kho| TikTok
    Core <-->|Webhook tin nhắn, bình luận, gửi phản hồi| Meta
    Core <-->|Sinh mã QR thanh toán động, đối soát tự động| Payment
    Core <-->|Đẩy đơn giao hàng, tra cứu mã vận đơn| Logistics
```

---

## 2. C4 Cấp Độ 2: Container Diagram (Kiến Trúc Thành Phần Container)

Sơ đồ phân rã hệ thống NEXORA thành các container phần mềm cụ thể và các kênh giao tiếp:

```mermaid
graph TD
    Client[Web Browser / POS Terminal]

    subgraph Infrastructure_Boundary [Hạ Tầng NEXORA]
        Nginx[Nginx Reverse Proxy & SSL Termination]
        
        subgraph Web_Application [Giao Diện Người Dùng]
            FrontendApp[Next.js App Router Container<br/>Port 3000]
        end

        subgraph Backend_Application [Khối Xử Lý Trung Tâm]
            BackendAPI[NestJS Modular Monolith Container<br/>Port 4000]
            BackgroundWorker[NestJS BullMQ Background Worker]
        end

        subgraph Data_Stores [Khối Lưu Trữ & Hàng Đợi]
            Postgres[(PostgreSQL 16 Multi-Tenant DB)]
            Redis[(Redis 7 Cache & Job Queue Broker)]
        end
    end

    Client -->|HTTPS:443 / WSS| Nginx
    Nginx -->|Proxy HTTP /_next, /dashboard| FrontendApp
    Nginx -->|Proxy /api/v1/*, /socket.io| BackendAPI

    FrontendApp -.->|Server-Side Rendering API Fetch| BackendAPI
    BackendAPI -->|Prisma Client SQL Queries| Postgres
    BackendAPI -->|Cache Session, Enqueue Background Jobs| Redis

    BackgroundWorker -->|Pop Job & Process Task| Redis
    BackgroundWorker -->|Update Sync State & Orders| Postgres

    BackgroundWorker <-->|Outbound REST Calls / Retries| External_Platforms[Shopee, TikTok, Meta APIs]
```

---

## 3. Dòng Chảy Dữ Liệu Cốt Lõi (Key Data Flows)

1. **Truy vấn đọc/ghi thông thường (Synchronous HTTP):** Client gửi yêu cầu -> Nginx định tuyến đến NestJS -> `TenantInterceptor` gắn ngữ cảnh `tenant_id` -> Service xử lý nghiệp vụ -> Prisma truy vấn PostgreSQL -> Trả kết quả JSON về cho Frontend render.
2. **Sự kiện thời gian thực (Realtime WebSocket):** Tin nhắn mới từ Facebook/TikTok về Webhook -> NestJS xác thực -> Phát qua `Socket.IO Gateway` -> Trình duyệt của nhân viên trực chat tự động hiển thị tin nhắn mới mà không cần F5 tải lại trang.
3. **Đồng bộ tải nặng (Asynchronous Queue):** Webhook đơn hàng hoặc yêu cầu đẩy tồn kho hàng loạt -> NestJS đẩy vào hàng đợi Redis BullMQ -> Trả về HTTP 200 ngay lập tức -> Worker tiến hành xử lý ngầm và cập nhật trạng thái vào PostgreSQL.
