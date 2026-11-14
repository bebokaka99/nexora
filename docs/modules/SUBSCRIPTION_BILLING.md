# Phân hệ quản lý gói cước và hóa đơn SaaS (Subscription & Billing Module)

> Trạng thái thông tin: `[CONFIRMED]` cho mô hình thanh toán thuê bao định kỳ | `[PROPOSED]` cho cơ chế thanh toán tự động qua mã VietQR động.

## 1. Mục đích
Phân hệ Subscription & Billing quản lý toàn bộ vòng đời thương mại hóa nền tảng NEXORA dưới dạng phần mềm dịch vụ (SaaS). Phân hệ kiểm soát các gói cước dịch vụ, hạn mức tài nguyên (số cửa hàng, số nhân viên, số kênh kết nối), tạo hóa đơn chu kỳ và điều phối việc gia hạn thuê bao của các Tenant.

## 2. Phạm vi nghiệp vụ
- Định nghĩa danh mục các gói thuê bao dịch vụ (Ví dụ: Gói Cơ Bản, Gói Tăng Trưởng, Gói Doanh Nghiệp).
- Theo dõi thời gian dùng thử (Trial), ngày đến hạn thanh toán và trạng thái thuê bao của từng Tenant.
- Tạo hóa đơn thu phí định kỳ theo tháng hoặc theo năm.
- Tích hợp cổng thanh toán VietQR động để tự động đối soát giao dịch chuyển khoản ngân hàng và kích hoạt gói cước ngay lập tức.
- Áp dụng các chính sách hạn chế tính năng hoặc tạm khóa tài khoản khi Tenant quá hạn thanh toán.

## 3. Đối tượng sử dụng
- Quản trị viên cấp cao của nền tảng NEXORA (Super Administrator).
- Đội ngũ tài chính và kế toán vận hành SaaS.
- Quản trị viên của từng doanh nghiệp sử dụng phần mềm (Tenant Owner).

## 4. Các chức năng chính
- **Cấu hình bảng giá và gói dịch vụ:** Thiết lập giá tiền theo tháng, giá tiền theo năm và các hạn mức tài nguyên đi kèm (Số chi nhánh tối đa, số kho hàng tối đa, số tài khoản người dùng tối đa).
- **Trang thanh toán thuê bao (Tenant Billing Portal):** Cho phép chủ doanh nghiệp xem gói hiện tại, thời hạn còn lại, nâng cấp gói và tải hóa đơn điện tử.
- **Tạo mã thanh toán VietQR động:** Sinh mã QR chuyển khoản chứa sẵn số tiền và nội dung chuyển khoản duy nhất cho từng hóa đơn.
- **Tự động đối soát và kích hoạt:** Nhận thông báo biến động số dư qua Webhook từ cổng thanh toán ngân hàng, khớp mã hóa đơn và tự động cộng thêm ngày sử dụng cho Tenant.

## 5. Quy tắc nghiệp vụ (Business Rules)
- `BR-SUB-001`: Mọi Tenant mới đăng ký được cấp quyền dùng thử miễn phí (Trial) trong thời hạn 14 ngày với đầy đủ tính năng của gói Cơ Bản.
- `BR-SUB-002`: Khi Tenant hết hạn dùng thử hoặc hết hạn gói cước mà chưa gia hạn, hệ thống chuyển trạng thái sang `PAST_DUE` trong vòng 7 ngày (vẫn cho phép tra cứu dữ liệu nhưng không cho tạo mới đơn hàng).
- `BR-SUB-003`: Sau 7 ngày ở trạng thái `PAST_DUE`, nếu Tenant vẫn không thanh toán, hệ thống tự động chuyển sang trạng thái tạm khóa `SUSPENDED` và khóa toàn bộ quyền truy cập của nhân viên.
- `BR-SUB-004`: Khi nâng cấp lên gói cao hơn trong kỳ hạn đang chạy, hệ thống tính toán số tiền chênh lệch dựa trên số ngày sử dụng còn lại của gói cũ (Prorated Billing).

## 6. Thực thể dữ liệu liên quan
- `subscription_plans`: Định nghĩa các gói dịch vụ, đơn giá và giới hạn tài nguyên (`max_stores`, `max_warehouses`, `max_users`, `max_channels`).
- `tenants`: Lưu `plan_id`, ngày hết hạn dùng thử `trial_ends_at` và trạng thái `TenantStatus` (`TRIAL`, `ACTIVE`, `PAST_DUE`, `SUSPENDED`).
- `invoices`: Lưu bản ghi hóa đơn thu tiền, số tiền, phương thức thanh toán, mã đối soát và ngày thanh toán.

## 7. Mối quan hệ với module khác
- Liên kết với `TenantManagementModule`: Cập nhật trạng thái hoạt động của Tenant và điều chỉnh hạn mức tài nguyên khi đổi gói.
- Liên kết với `AuthenticationModule`: Chặn quyền đăng nhập của người dùng khi Tenant rơi vào trạng thái `SUSPENDED`.

## 8. Danh mục API dự kiến
- `GET /api/v1/billing/plans`: Danh mục các gói cước đang mở bán công khai.
- `GET /api/v1/billing/subscription`: Thông tin gói cước và ngày hết hạn hiện tại của Tenant.
- `POST /api/v1/billing/upgrade`: Gửi yêu cầu nâng cấp hoặc gia hạn gói dịch vụ.
- `POST /api/v1/billing/invoices/{id}/create-qr`: Tạo mã thanh toán VietQR cho một hóa đơn.
- `POST /api/v1/billing/webhook/payment`: Tiếp nhận Webhook thông báo chuyển khoản thành công từ ngân hàng/cổng thanh toán.

## 9. Quyền truy cập
- Quyền: `billing:read`, `billing:manage_subscription`, `saas:manage_plans` (Chỉ dành cho Super Admin).

## 10. Các trường hợp biên (Edge Cases)
- Khách chuyển khoản thừa hoặc thiếu tiền so với số tiền trên hóa đơn: Hệ thống không tự động kích hoạt gói mà đánh dấu trạng thái `PAYMENT_MISMATCH` và gửi cảnh báo đến nhân viên kế toán xử lý thủ công.
- Tenant đang có 3 chi nhánh nhưng yêu cầu hạ cấp xuống gói dịch vụ chỉ cho phép 1 chi nhánh: Hệ thống từ chối hạ cấp cho đến khi chủ doanh nghiệp tự thao tác vô hiệu hóa bớt 2 chi nhánh dư thừa.

## 11. Tiêu chí nghiệm thu (Acceptance Criteria)
- [ ] Chủ doanh nghiệp bấm chọn gia hạn gói 1 năm, hệ thống hiển thị mã VietQR chính xác số tiền và cú pháp nội dung chuyển khoản trong vòng 500ms.
- [ ] Khi nhận Webhook thanh toán thành công, trạng thái của Tenant chuyển ngay từ `PAST_DUE` sang `ACTIVE` và ngày hết hạn được gia hạn thêm đúng 365 ngày.
- [ ] Hệ thống chặn thành công hành vi tạo thêm chi nhánh vượt quá hạn mức `max_stores` được quy định trong gói cước.

## 12. Những điểm còn bỏ ngỏ cần xác nhận (Pending Decisions)
- `[UNDECIDED]`: Tích hợp thêm cổng thanh toán thẻ quốc tế (Stripe hoặc OnePay) song song với hình thức chuyển khoản VietQR.
