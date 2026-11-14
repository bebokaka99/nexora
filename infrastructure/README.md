# NEXORA — Infrastructure & DevOps Architecture

Thư mục `infrastructure/` lưu trữ cấu hình môi trường, container hóa Docker, máy chủ Reverse Proxy Nginx, các mẫu biến môi trường và tự động hóa quy trình CI/CD.

## 1. Công Nghệ Hạ Tầng

- **Containerization**: Docker, Docker Compose v2+.
- **Web Server & Reverse Proxy**: Nginx (cấu hình SSL/TLS, gzip, websocket proxying).
- **CI/CD Platform**: GitHub Actions.
- **Cache & Broker**: Redis Alpine container.
- **Relational Database**: PostgreSQL Alpine container.
- **Mail Testing**: Mailpit container (giả lập SMTP server cho môi trường dev).

## 2. Quy Chuẩn Cấu Trúc Thư Mục

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
