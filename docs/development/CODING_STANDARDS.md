# Tiêu chuẩn lập trình (Coding Standards)

> Trạng thái thông tin: `[CONFIRMED]` Quy chuẩn mã nguồn TypeScript cho Backend và Frontend.

Tài liệu này xác lập các tiêu chuẩn viết mã thống nhất cho toàn bộ kỹ sư tham gia phát triển nền tảng NEXORA.

## 1. Tiêu chuẩn TypeScript chung

- **Bật Strict Mode**: Mọi tệp `tsconfig.json` trong dự án bắt buộc phải bật `"strict": true`.
- **Tuyệt đối không dùng kiểu `any`**: Sử dụng `unknown` khi chưa rõ cấu trúc dữ liệu và thực hiện kiểm tra kiểu (Type Narrowing) trước khi truy cập thuộc tính.
- **Quy ước đặt tên**:
  - `PascalCase`: Dành cho tên Class, Interface, Type alias, Enum và React Components.
  - `camelCase`: Dành cho tên hàm, phương thức, biến và thuộc tính đối tượng.
  - `UPPER_SNAKE_CASE`: Dành cho các hằng số cấu hình toàn cục.
  - `kebab-case`: Dành cho tên tệp mã nguồn và tên thư mục (Ví dụ: `order-status.enum.ts`, `customer-card.tsx`).

## 2. Tiêu chuẩn Backend (NestJS)

- Mỗi phương thức trong Service chỉ thực hiện một trách nhiệm duy nhất (Single Responsibility).
- Các phương thức Service có thực hiện ghi/sửa dữ liệu phức tạp bắt buộc phải bọc trong giao dịch `this.prisma.$transaction()`.
- Tách bạch rõ ranh giới giữa DTO (Data Transfer Object) đầu vào và Entity cơ sở dữ liệu. Không trả trực tiếp đối tượng thực thể chứa trường nhạy cảm như `passwordHash` về phía client.

## 3. Tiêu chuẩn Frontend (React & Next.js)

- Ưu tiên viết Functional Components với các Hook chuẩn của React.
- Chia nhỏ các Component lớn hơn 200 dòng thành các Component con có phạm vi sử dụng cục bộ.
- Trích xuất toàn bộ logic xử lý dữ liệu phức tạp thành các Custom Hooks bắt đầu bằng tiền tố `use*` (Ví dụ: `useOmnichannelSync`).
- Đặt tên thuộc tính Boolean theo dạng câu hỏi: `isLoading`, `hasError`, `isCompleted`.
