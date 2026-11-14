# Quy trình làm việc với Git (Git Workflow)

> Trạng thái thông tin: `[CONFIRMED]` Quy chuẩn quản lý nhánh và lịch sử mã nguồn.

Tài liệu này quy định cách thức phân nhánh, đặt tên nhánh và tạo Pull Request trong dự án NEXORA.

## 1. Chiến lược phân nhánh (Branching Strategy)

Dự án áp dụng mô hình Trunk-Based Development tinh gọn:

- `main`: Nhánh chính duy nhất chứa mã nguồn ổn định, luôn ở trạng thái sẵn sàng triển khai. Không commit trực tiếp lên nhánh `main`.
- `feat/*`: Nhánh phát triển tính năng mới (Ví dụ: `feat/pos-barcode-scanner`).
- `fix/*`: Nhánh sửa lỗi phát sinh (Ví dụ: `fix/inventory-concurrency-lock`).
- `docs/*`: Nhánh cập nhật tài liệu kỹ thuật (Ví dụ: `docs/api-conventions`).

## 2. Tiêu chuẩn thông điệp Commit (Conventional Commits)

Mỗi commit phải có tiêu đề rõ ràng, mô tả đúng hành động và nằm trong giới hạn 72 ký tự:

- `feat`: Thêm tính năng hoặc hành vi mới.
- `fix`: Sửa lỗi trong mã nguồn.
- `docs`: Thêm hoặc cập nhật tài liệu.
- `refactor`: Tái cấu trúc mã nguồn mà không làm thay đổi hành vi bên ngoài.
- `test`: Thêm hoặc chỉnh sửa các ca kiểm thử.
- `chore`: Cập nhật cấu hình build, thêm thư viện hoặc dọn dẹp tệp rác.

Ví dụ commit hợp lệ:
```text
feat(order): them co che tu dong tinh phi freeship extra cho shopee
fix(inventory): sua loi am ton kho khi hai thu ngan cung thanh toan
docs(api): bo sung dac ta endpoint tao hoa don vietqr
```

## 3. Quy chuẩn Pull Request (PR)

- Tiêu đề PR phải tuân theo cú pháp: `[<MÃ_NHIỆM_VỤ>] <Mô tả ngắn gọn>` (Ví dụ: `[TASK-001] Xây dựng bản mẫu trực quan NEXORA`).
- Mô tả PR phải nêu rõ: Mục đích thay đổi, danh sách màn hình/file bị tác động và bằng chứng kiểm thử thành công (kèm ảnh chụp hoặc log chạy thử).
- Bắt buộc phải có ít nhất 1 phê duyệt (Approval) từ đồng nghiệp trước khi bấm nút gộp nhánh (Squash and Merge).
