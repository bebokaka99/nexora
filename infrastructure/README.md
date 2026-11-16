# NEXORA — Infrastructure & DevOps Architecture

Thư mục `infrastructure/` lưu trữ cấu hình môi trường, container hóa Docker, máy chủ Reverse Proxy Nginx, các mẫu biến môi trường và tự động hóa quy trình CI/CD.

## 0. Chạy Bằng Docker Compose (TASK-010, Phase 06.5)

Toàn bộ hệ thống chạy bằng một lệnh, từ máy sạch chỉ cần Docker + file `.env`:

```bash
cp .env.example .env
docker compose up --build
```

| Dịch vụ | Địa chỉ | Ghi chú |
| :--- | :--- | :--- |
| Frontend (Next.js) | http://localhost:3000 | Build từ `frontend/Dockerfile` |
| Backend (NestJS) | http://localhost:4000/api/v1 | Swagger: http://localhost:4000/docs |
| PostgreSQL 16 | localhost:5432 | Volume `postgres-data`, healthcheck `pg_isready` |
| Redis 7 | localhost:6379 | Volume `redis-data`, healthcheck `redis-cli ping` |

Backend tự chạy `prisma migrate deploy` trước khi khởi động nên database luôn
ở đúng migration mới nhất (migration `0001_init` từ TASK-009). Dừng và xóa
dữ liệu dev: `docker compose down -v`.

Các file hạ tầng thực tế (không nằm trong `infrastructure/` mà ở gốc repo và
từng service, theo quy ước của dự án):

```text
.env.example            # Mẫu biến môi trường (CHỈ giá trị mẫu, không secret thật)
docker-compose.yml      # Postgres + Redis + backend + frontend (dev)
backend/Dockerfile      # Multi-stage NestJS; build context là GỐC repo
frontend/Dockerfile     # Multi-stage Next.js 15 (không dùng output standalone
                        # vì next.config.mjs hiện chưa bật standalone)
.dockerignore           # Áp cho backend build (context gốc repo)
frontend/.dockerignore  # Áp cho frontend build (context frontend/)
.github/workflows/ci.yml
```

⚠️ Các giá trị mặc định trong `docker-compose.yml` (mật khẩu Postgres,
JWT secret mẫu) **CHỈ DÙNG CHO DEV**. Deploy thật phải đặt secret qua `.env`.

### CI — GitHub Actions (`.github/workflows/ci.yml`)

Workflow `CI` chạy trên **mọi pull request** và mọi push lên `main`, gồm 2 job
song song (Node.js 22, cache npm):

- **Backend**: `npm ci` → `prisma validate` → `npm run build`.
- **Frontend**: `npm ci` → `npm run build`.

Workflow báo đỏ khi build lỗi. Lint/test **chưa** có trong CI: backend chưa có
script lint/test trong `package.json`, frontend có script `lint` nhưng repo
chưa có cấu hình ESLint nên `next lint` không chạy được trên CI — bổ sung sau
khi có ESLint config / test suite.

## 1. Công Nghệ Hạ Tầng

- **Containerization**: Docker, Docker Compose v2+.
- **Web Server & Reverse Proxy**: Nginx (cấu hình SSL/TLS, gzip, websocket proxying).
- **CI/CD Platform**: GitHub Actions.
- **Cache & Broker**: Redis Alpine container.
- **Relational Database**: PostgreSQL Alpine container.
- **Mail Testing**: Mailpit container (giả lập SMTP server cho môi trường dev).

## 2. Quy Chuẩn Cấu Trúc Thư Mục

> Trạng thái TASK-010: cấu trúc bên dưới là **định hướng** ban đầu; các file
> Docker/Compose/CI đã triển khai hiện nằm ở gốc repo và từng service (xem
> mục 0 bên trên). Nginx, Mailpit và script deploy staging/production
> **chưa triển khai**.

```text
infrastructure/
├── docker/
│   ├── frontend.Dockerfile   # Multi-stage build cho Next.js (Standalone output)
│   └── backend.Dockerfile    # Multi-stage build cho NestJS (Node.js production image)
│
├── docker-compose/
│   ├── docker-compose.yml    # Cấu hình cụm dịch vụ hoàn chỉnh (FE, BE, DB, Redis, Nginx)
│   └── docker-compose.dev.yml# Cấu hình cụm hỗ trợ phát triển local (Postgres, Redis, Mailpit)
│
├── nginx/
│   ├── nginx.conf            # Cấu hình Nginx chính
│   └── conf.d/
│       ├── nexora.conf       # Reverse proxy định tuyến frontend (port 3000) & backend (port 4000)
│       └── ssl.conf          # Cấu hình mã hóa bảo mật SSL/TLS
│
├── env-templates/
│   ├── .env.root.example     # Biến môi trường chung cho Docker Compose
│   ├── .env.frontend.example # Biến môi trường cho Next.js
│   └── .env.backend.example  # Biến môi trường cho NestJS & Prisma
│
└── ci-cd/
    ├── deploy-staging.sh     # Script deploy tự động môi trường Staging
    └── deploy-production.sh  # Script deploy tự động môi trường Production
```

## 3. Quy Tắc Bảo Mật Hạ Tầng

1. **Không commit file `.env`**: Tất cả secret keys, JWT secrets, mật khẩu database chỉ được lưu trữ dưới dạng biến môi trường hoặc Secret Manager.
2. **Multi-stage Docker Builds**: Đảm bảo image production có dung lượng nhẹ nhất, không chứa devDependencies, source maps nhạy cảm hoặc công cụ build thừa thãi.
3. **Health Check Services**: Mọi container đều phải cấu hình healthcheck endpoints để Docker Compose và điều phối viên biết được trạng thái sẵn sàng phục vụ.
