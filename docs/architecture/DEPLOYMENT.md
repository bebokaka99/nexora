# Kiến Trúc Triển Khai & Vận Hành — Deployment Architecture

> Trạng thái thông tin: `[PROPOSED]` Phương án hạ tầng Docker Compose & Nginx bởi Senior Technical Lead.

Tài liệu này xác định phương án đóng gói, triển khai hạ tầng, thiết lập mạng nội bộ và quy trình tự động hóa phát hành (CI/CD) cho nền tảng **NEXORA**.

---

## 1. Mô Hình Hạ Tầng Triển Khai (Containerized Architecture)

Hệ thống được đóng gói thành các container Docker độc lập, điều phối bằng **Docker Compose** trên một cụm máy chủ ảo (VPS/Cloud Instance):

```mermaid
graph TD
    Internet((Internet / End Users)) -->|Port 80 / 443| Nginx[Nginx Reverse Proxy & SSL Engine]

    subgraph Internal_Docker_Network [Mạng Nội Bộ Docker: nexora-network]
        Nginx -->|http://frontend:3000| Frontend[Next.js Frontend Container]
        Nginx -->|http://backend:4000| Backend[NestJS Backend API Container]
        
        Backend -->|postgres://db:5432| Postgres[(PostgreSQL 16 Database)]
        Backend -->|redis://redis:6379| Redis[(Redis 7 Cache & BullMQ)]
        
        Worker[NestJS Background Worker Container] --> Postgres
        Worker --> Redis
    end

    Postgres -.->|Mounted Volume| Host_Storage[(Host SSD Storage: /var/lib/postgresql/data)]
    Redis -.->|Mounted Volume| Host_Redis[(Host SSD Storage: /data)]
```

### Ưu điểm của mô hình Docker Compose:
- **Tối ưu chi phí:** Toàn bộ hệ thống chạy trơn tru trên 1 máy chủ Cloud VPS (cấu hình khuyến nghị: 4 vCPU, 8GB RAM, SSD 100GB) cho giai đoạn đầu, tiết kiệm hàng nghìn USD chi phí cloud so với Kubernetes.
- **Dễ bảo trì & sao lưu:** Khối dữ liệu PostgreSQL và Redis được mount trực tiếp ra ổ đĩa máy chủ ngoài container, đảm bảo không bao giờ mất dữ liệu khi container khởi động lại hoặc nâng cấp mã nguồn.
- **Đồng nhất môi trường:** Cấu hình chạy trên máy chủ Staging và Production hoàn toàn tương thích với môi trường phát triển cục bộ của lập trình viên.

---

## 2. Cấu Hình Nginx Reverse Proxy & Định Tuyến Tên Miền

Nginx đóng vai trò tiếp nhận toàn bộ lưu lượng cổng 80/443 từ internet:
- **Tự động chuyển hướng:** 100% yêu cầu HTTP (Port 80) được chuyển hướng sang HTTPS (Port 443).
- **Định tuyến Frontend:** Mọi yêu cầu truy cập giao diện thông thường được chuyển tiếp về `frontend:3000`.
- **Định tuyến Backend API:** Mọi yêu cầu có tiền tố `/api/*` hoặc `/swagger` được chuyển tiếp về `backend:4000`.
- **Định tuyến WebSocket:** Các kết nối `/socket.io/*` được Nginx thiết lập header `Upgrade $http_upgrade` và `Connection "upgrade"` để duy trì kết nối thời gian thực ổn định.
- **Nén Gzip:** Nén toàn bộ tài nguyên tĩnh (JS, CSS, HTML, JSON) giảm 70% dung lượng truyền tải.

---

## 3. Quy Trình Tự Động Hóa Phát Hành (CI/CD Pipeline)

Quy trình phát hành tự động qua GitHub Actions:

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Lập Trình Viên
    participant Git as GitHub Repository
    participant Action as GitHub Actions CI
    participant Server as Máy Chủ Staging / Production

    Dev->>Git: Push code lên nhánh develop / main
    Git->>Action: Kích hoạt CI Workflow
    Action->>Action: 1. Chạy ESLint & TypeScript Check
    Action->>Action: 2. Chạy Jest Unit Tests
    Action->>Action: 3. Build thử nghiệm Frontend & Backend
    alt Có lỗi xảy ra
        Action-->>Dev: Báo lỗi qua email / Slack, chặn merge
    else Thành công
        Action->>Server: SSH vào máy chủ triển khai:
        Note over Action,Server: 1. git pull origin main<br/>2. docker compose build --no-cache<br/>3. npx prisma migrate deploy<br/>4. docker compose up -d --remove-orphans
        Server-->>Action: Hoàn tất phát hành không gián đoạn
        Action-->>Dev: Thông báo Deploy thành công!
    end
```

---

## 4. Giám Sát Hệ Thống & Kiểm Tra Sức Khỏe (Healthchecks)

- Cả Frontend và Backend đều cung cấp endpoint kiểm tra trạng thái:
  - Frontend: `GET /api/health`
  - Backend: `GET /api/v1/health` (kiểm tra trạng thái kết nối PostgreSQL và Redis).
- Docker Compose cấu hình `healthcheck` tự động khởi động lại container nếu sau 3 lần kiểm tra liên tiếp không nhận được phản hồi HTTP 200.
