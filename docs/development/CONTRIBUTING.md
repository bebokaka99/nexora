# Hướng dẫn đóng góp mã nguồn (Contributing Guide)

> Trạng thái thông tin: `[CONFIRMED]` Cẩm nang dành cho lập trình viên tham gia dự án.

Chào mừng bạn đến với dự án phát triển nền tảng NEXORA. Tài liệu này hướng dẫn các bước tiêu chuẩn để đóng góp mã nguồn chất lượng cao vào kho lưu trữ.

## 1. Chuẩn bị trước khi viết mã

1. Đọc kỹ tài liệu kiến trúc tại `docs/architecture/ARCHITECTURE.md` và hướng dẫn thiết lập môi trường tại `docs/development/ENVIRONMENT_SETUP.md`.
2. Kiểm tra danh sách nhiệm vụ được phân công trong `docs/tasks/` để đảm bảo nhiệm vụ đã được phê duyệt.
3. Tạo nhánh mới từ nhánh `main` mới nhất theo cú pháp `feat/<ten-tinh-nang>` hoặc `fix/<ten-loi>`.

## 2. Kiểm tra chất lượng mã trước khi tạo PR

Trước khi mở Pull Request, chạy các lệnh kiểm tra sau tại thư mục cục bộ của bạn:

Kiểm tra định dạng và linter cho backend:
```bash
cd backend
pnpm format
pnpm build
```

Kiểm tra linter và build cho frontend:
```bash
cd frontend
pnpm lint
pnpm build
```

Chạy toàn bộ các ca kiểm thử:
```bash
cd backend
pnpm test
```

## 3. Quy trình Review mã nguồn (Code Review Checklist)

Người rà soát PR sẽ đối chiếu các tiêu chí sau:

- [ ] Mã nguồn có tuân thủ quy tắc cô lập dữ liệu Multi-Tenant (`tenantId`) không?
- [ ] Dữ liệu đầu vào từ người dùng có được kiểm thực đầy đủ bằng DTO không?
- [ ] Các tác vụ gọi API sàn bên ngoài có được đưa vào hàng đợi BullMQ không?
- [ ] Có phát sinh lỗi biên dịch hoặc cảnh báo linter nào không?
- [ ] Tài liệu kỹ thuật tương ứng trong thư mục `docs/` đã được cập nhật đồng bộ với mã nguồn mới chưa?
