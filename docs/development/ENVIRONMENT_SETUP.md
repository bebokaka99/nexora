# Thiết lập môi trường phát triển cục bộ

Tài liệu này hướng dẫn bạn cài đặt các công cụ cần thiết và khởi chạy môi trường phát triển dự án NEXORA trên máy tính cá nhân.

## 1. Yêu cầu hệ thống

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt các công cụ sau:

- **Node.js**: Phiên bản 22 LTS trở lên.
- **pnpm**: Phiên bản 9.0 trở lên.
- **Docker Desktop**: Phiên bản 24.0 trở lên với Docker Compose v2.
- **Git**: Phiên bản 2.40 trở lên.
- **Trình soạn thảo**: Visual Studio Code với các tiện ích mở rộng được gợi ý trong `.vscode/extensions.json`.

Kiểm tra phiên bản các công cụ bằng lệnh sau:

```bash
node -v
pnpm -v
docker -v
docker compose version
git --version
```

## 2. Các bước cài đặt chi tiết

### Bước 1. Cài đặt các gói phụ thuộc

Dự án tổ chức mã nguồn theo dạng Monorepo với hai thư mục độc lập là `backend` và `frontend`. Chạy lệnh cài đặt cho từng phần:

Cài đặt phụ thuộc cho backend:

```bash
cd backend
pnpm install
cd ..
```

Cài đặt phụ thuộc cho frontend:

```bash
cd frontend
pnpm install
cd ..
```

### Bước 2. Cấu hình biến môi trường

Tạo các tệp cấu hình môi trường từ tệp mẫu:

Tạo tệp `.env` cho backend:

```bash
cp infrastructure/env-templates/.env.backend.example backend/.env
```

Nếu tệp mẫu chưa có sẵn trong thư mục hạ tầng, tạo tệp `backend/.env` với nội dung tối thiểu sau:

```env
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nexora_dev?schema=public
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
JWT_EXPIRES_IN=1d
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_key_32_chars
REFRESH_TOKEN_EXPIRES_IN=7d
REDIS_HOST=localhost
REDIS_PORT=6379
```

Tạo tệp `.env.local` cho frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
PORT=3000
```

### Bước 3. Khởi động cơ sở dữ liệu và cache

Khởi chạy cụm PostgreSQL và Redis bằng Docker Compose:

```bash
docker compose -f infrastructure/docker-compose/docker-compose.dev.yml up -d
```

Nếu bạn chưa sử dụng tệp Docker Compose có sẵn, khởi chạy hai container riêng lẻ:

```bash
docker run -d --name nexora-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=nexora_dev -p 5432:5432 postgres:16-alpine
docker run -d --name nexora-redis -p 6379:6379 redis:7-alpine
```

### Bước 4. Đồng bộ lược đồ cơ sở dữ liệu với Prisma

Di chuyển vào thư mục backend và chạy lệnh đồng bộ schema Prisma vào cơ sở dữ liệu PostgreSQL:

```bash
cd backend
pnpm prisma:generate
pnpm prisma:migrate
cd ..
```

Lệnh `prisma:generate` sẽ tạo mã TypeScript Client trong `node_modules/@prisma/client`. Lệnh `prisma:migrate` áp dụng các migration hiện có vào cơ sở dữ liệu cục bộ.

### Bước 5. Khởi động dịch vụ backend

Chạy backend ở chế độ theo dõi thay đổi mã nguồn:

```bash
cd backend
pnpm dev
```

Máy chủ backend lắng nghe tại cổng `http://localhost:4000`. Mở đường dẫn `http://localhost:4000/api/health` trên trình duyệt. Kết quả trả về phải chứa mã trạng thái `200` và thông tin `ok`.

### Bước 6. Khởi động dịch vụ frontend

Mở một cửa sổ dòng lệnh mới và khởi chạy frontend:

```bash
cd frontend
pnpm dev
```

Giao diện người dùng mở tại địa chỉ `http://localhost:3000`.

## 3. Khắc phục sự cố thường gặp

### Không thể kết nối đến PostgreSQL

1. Kiểm tra trạng thái container bằng lệnh `docker ps`.
2. Đảm bảo cổng `5432` trên máy tính của bạn không bị chiếm dụng bởi phiên bản PostgreSQL cục bộ khác.
3. Kiểm tra biến `DATABASE_URL` trong tệp `backend/.env`.

### Lỗi xung đột phiên bản Node.js

Dự án yêu cầu Node.js 20 trở lên, khuyến nghị Node.js 22. Sử dụng công cụ quản lý phiên bản `nvm` để chuyển đúng phiên bản:

```bash
nvm install 22
nvm use 22
```
