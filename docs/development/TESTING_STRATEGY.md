# Chiến lược kiểm thử phần mềm (Testing Strategy)

> Trạng thái thông tin: `[PROPOSED]` Chiến lược kiểm thử đa tầng cho NEXORA.

Tài liệu này xác định phương pháp kiểm thử tự động nhằm đảm bảo tính ổn định và ngăn ngừa lỗi hồi quy (regression) trong quá trình phát triển nền tảng NEXORA.

## 1. Kim tự tháp kiểm thử (Testing Pyramid)

Hệ thống áp dụng ba cấp độ kiểm thử chính:

1. **Unit Tests (Kiểm thử đơn vị - 70%)**: Kiểm thử các hàm tính toán thuần túy, bộ chuyển đổi dữ liệu và logic nghiệp vụ độc lập trong Services. Sử dụng Jest cho NestJS và Vitest cho Next.js.
2. **Integration Tests (Kiểm thử tích hợp - 20%)**: Kiểm thử luồng tương tác giữa Service và cơ sở dữ liệu PostgreSQL thực tế (sử dụng container kiểm thử), kiểm thử các endpoint API với Supertest.
3. **End-to-End Tests (Kiểm thử đầu-cuối - 10%)**: Kiểm thử các luồng trải nghiệm người dùng trọng yếu nhất (như Đăng nhập, Tạo đơn hàng tại quầy POS, Đồng bộ tồn kho) bằng Playwright.

## 2. Quy chuẩn viết kiểm thử

- Đặt tên tệp kiểm thử nằm ngay cạnh tệp mã nguồn được kiểm thử:
  - `order.service.ts` -> `order.service.spec.ts`
  - `pos-terminal.tsx` -> `pos-terminal.test.tsx`
- Cấu trúc ca kiểm thử theo mô hình AAA (Arrange - Act - Assert):
  - **Arrange**: Chuẩn bị dữ liệu mẫu và thiết lập trạng thái ban đầu.
  - **Act**: Thực thi hàm hoặc phương thức cần kiểm tra.
  - **Assert**: So sánh kết quả trả về với giá trị kỳ vọng.
- Kiểm thử tập trung vào hành vi quan sát được của người dùng hoặc của API, không kiểm thử chi tiết triển khai nội bộ.

## 3. Quy chuẩn kiểm thử Multi-Tenancy

Mọi ca kiểm thử API đều bắt buộc phải có ít nhất một kịch bản kiểm tra an toàn dữ liệu Tenant:
- Người dùng thuộc Tenant A thực hiện truy vấn với mã `id` thuộc Tenant B phải nhận về mã lỗi `404 Not Found` hoặc `403 Forbidden`.
- Tuyệt đối không để rò rỉ dữ liệu của Tenant này sang Tenant khác trong các truy vấn danh sách.
