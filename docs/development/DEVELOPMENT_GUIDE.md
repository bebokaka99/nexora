# Hướng dẫn phát triển dự án NEXORA

Tài liệu này cung cấp các quy chuẩn kỹ thuật và quy trình làm việc hàng ngày cho kỹ sư tham gia phát triển nền tảng NEXORA.

## 1. Cấu trúc mã nguồn

Dự án sử dụng mô hình Monorepo phân tách rõ ràng giữa backend và frontend:

- `backend/`: Hệ thống NestJS Modular Monolith. Xử lý API, xác thực, phân quyền, tích hợp kênh bán và logic nghiệp vụ cốt lõi.
- `frontend/`: Ứng dụng Next.js 15 App Router. Xử lý giao diện người dùng, đồng bộ trạng thái máy chủ và hiển thị trực quan.
- `database/`: Quản lý tệp `prisma/schema.prisma`, lịch sử migration và dữ liệu mẫu.
- `infrastructure/`: Quản lý Dockerfile, Docker Compose và cấu hình máy chủ Nginx.
- `docs/`: Kho tài liệu kỹ thuật, kiến trúc và phân tích nghiệp vụ.

## 2. Nguyên tắc viết mã Backend (NestJS)

### Tuân thủ ranh giới module
Hệ thống được thiết kế theo kiến trúc Modular Monolith. Mỗi module nghiệp vụ trong `backend/src/modules/` phải giữ ranh giới độc lập:

- Không truy cập trực tiếp vào cơ sở dữ liệu của module khác. Hãy gọi thông qua Service công khai được export của module đó.
- Sử dụng Domain Events khi cần thông báo thay đổi trạng thái giữa các module có tính phụ thuộc lỏng lẻo.

### Bắt buộc gắn tenant_id trong mọi thao tác dữ liệu
NEXORA là nền tảng SaaS Multi-Tenant. Để ngăn ngừa rò rỉ dữ liệu giữa các doanh nghiệp, hãy áp dụng các quy tắc sau:

- Mọi truy vấn cơ sở dữ liệu qua Prisma bắt buộc phải chứa điều kiện lọc `tenantId`.
- Đọc `tenantId` từ đối tượng Request đã được xác thực qua Authentication Guard, không tin cậy giá trị do client gửi lên trong Request Body.
- Kiểm tra tính toàn vẹn của khóa ngoại trỏ đến Store hoặc Warehouse cùng thuộc về Tenant hiện tại.

### Kiểm thực dữ liệu đầu vào bằng DTO
Mọi API nhận dữ liệu phải khai báo Data Transfer Object (DTO) đi kèm các decorator kiểm thực từ thư viện `class-validator`:

```typescript
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
	@IsNotEmpty({ message: 'Tên danh mục không được để trống' })
	@IsString()
	@MaxLength(100)
	name: string;
}
```

### Xử lý ngoại lệ chuẩn hóa
Ném các ngoại lệ chuẩn của NestJS như `NotFoundException`, `BadRequestException`, `ForbiddenException`. Bộ lọc `AllExceptionsFilter` sẽ tự động chuyển đổi thành cấu trúc JSON chuẩn `/api/v1/`.

## 3. Nguyên tắc viết mã Frontend (Next.js)

### Sử dụng Next.js App Router
- Đặt các trang giao diện trong thư mục `frontend/app/`.
- Phân chia Server Components cho việc lấy dữ liệu ban đầu và Client Components (với chỉ thị `'use client'`) cho các khối giao diện có tương tác người dùng.

### Quản lý giao diện với Tailwind CSS
- Sử dụng tiện ích kết hợp lớp `clsx` và `tailwind-merge` thông qua hàm tiện ích `cn()`.
- Giữ bảng màu và khoảng cách đồng bộ theo hệ thống thiết kế chung của dự án.
- Không viết CSS tùy biến khi Tailwind đã cung cấp sẵn lớp tiện ích tương đương.

## 4. Chiến lược phát triển theo lát cắt dọc (Vertical Slicing)

Dự án áp dụng phương pháp phát triển theo lát cắt dọc thay vì xây dựng toàn bộ backend rồi mới chuyển sang frontend.

Với mỗi phân hệ nghiệp vụ:
1. Xây dựng tầng backend: Hoàn thiện DTO, Service, Controller, cơ sở dữ liệu và tài liệu Swagger.
2. Tích hợp ngay vào tầng frontend: Thay thế dữ liệu giả lập bằng các lệnh gọi API thực tế, xử lý trạng thái tải dữ liệu, thông báo lỗi và cập nhật giao diện người dùng.
3. Kiểm chứng toàn bộ luồng: Người dùng thao tác trên giao diện, dữ liệu ghi nhận chính xác vào cơ sở dữ liệu và phản hồi lại màn hình.

Phương pháp này giúp phát hiện sớm các điểm lệch pha về cấu trúc dữ liệu giữa client và server. Đội ngũ phát triển luôn có tính năng chạy được trên thực tế để nghiệm thu sau mỗi nhiệm vụ.

## 5. Quy trình thay đổi lược đồ cơ sở dữ liệu

Khi cần thêm bảng mới hoặc sửa đổi cột trong cơ sở dữ liệu:

1. Chỉnh sửa tệp `database/prisma/schema.prisma`.
2. Chạy lệnh tạo migration tại thư mục `backend/`:
   ```bash
   cd backend
   pnpm prisma:migrate
   ```
3. Đặt tên migration ngắn gọn, mô tả đúng hành động, ví dụ: `add_customer_debt_tracking`.
4. Kiểm tra tệp SQL vừa được sinh ra trong thư mục `database/prisma/migrations/`.
5. Cập nhật tài liệu thiết kế cơ sở dữ liệu trong `docs/database/` tương ứng.

## 6. Quy trình làm việc với Git

- Phân nhánh từ nhánh chính `main` theo quy ước:
  - `feat/<ten-tinh-nang>`: Tính năng mới.
  - `fix/<ten-loi>`: Sửa lỗi hệ thống.
  - `docs/<noi-dung>`: Cập nhật tài liệu.
- Viết thông điệp commit theo chuẩn Conventional Commits:
  - `feat: them chuc nang huy don hang va hoan ton kho`
  - `fix: sua loi tinh sai thue trong don pos`
  - `docs: cap nhat huong dan cai dat moi truong`
- Tạo Pull Request và yêu cầu ít nhất một thành viên rà soát trước khi gộp vào nhánh chính.
