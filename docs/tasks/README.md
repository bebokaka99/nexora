# Hệ thống quản lý nhiệm vụ phát triển NEXORA

Tài liệu này quy định cấu trúc tổ chức nhiệm vụ và cách thức theo dõi tiến độ phát triển nền tảng NEXORA.

## 1. Cấu trúc phân rã công việc

Các hạng mục phát triển được tổ chức theo cấu trúc phân cấp ba tầng:

1. **Phases (Giai đoạn)**: 8 giai đoạn chiến lược phát triển sản phẩm từ thiết lập nền tảng đến sẵn sàng vận hành thương mại. Chi tiết xem tại [PHASES.md](./PHASES.md).
2. **Epics (Chủ đề lớn)**: Các khối tính năng lớn thuộc về từng Phase, ví dụ: Quản lý kho đa chi nhánh, Đồng bộ sàn Shopee.
3. **Tasks (Nhiệm vụ cụ thể)**: Các đơn vị công việc độc lập có thể hoàn thành và kiểm chứng trong khoảng thời gian từ một đến ba ngày.

## 2. Quy ước đặt tên và mã nhiệm vụ

Mỗi nhiệm vụ có một mã định danh duy nhất theo cú pháp:

`TASK-<SO_THU_TU>-<ten-nhiem-vu-viet-thuong-ngan-gon>.md`

Ví dụ: `TASK-001-build-nexora-visual-demo.md`.

Các nhiệm vụ được đặt trong thư mục tương ứng với từng giai đoạn phát triển:

- `phase-01-foundation/`: Thiết lập nền tảng, cơ sở dữ liệu và bản demo trực quan ban đầu.
- `phase-02-auth-tenant/`: Phân hệ xác thực, phân quyền RBAC và quản lý Tenant.
- `phase-03-store-inventory/`: Quản lý 2 chi nhánh cửa hàng và tồn kho đa kho.
- `phase-04-product-catalog/`: Quản lý danh mục hàng gia dụng, biến thể và bảng giá.
- `phase-05-pos-orders/`: Quầy thu ngân POS và xử lý đơn hàng tập trung.
- `phase-06-omnichannel/`: Kết nối đồng bộ với Shopee, TikTok Shop và Facebook.
- `phase-07-conversation/`: Hộp thư hội thoại đa kênh tập trung (Unified Inbox).
- `phase-08-bi-billing/`: Báo cáo quản trị, doanh thu thực và thu phí gói SaaS.

## 3. Trạng thái vòng đời nhiệm vụ

- `TODO`: Nhiệm vụ chưa bắt đầu thực hiện.
- `IN_PROGRESS`: Nhiệm vụ đang được triển khai.
- `IN_REVIEW`: Mã nguồn đã hoàn thiện và đang chờ rà soát qua Pull Request.
- `DONE`: Nhiệm vụ đã hoàn thành, vượt qua toàn bộ kiểm thử và được gộp vào nhánh chính.
- `BLOCKED`: Nhiệm vụ bị tạm dừng do phụ thuộc vào yếu tố kỹ thuật hoặc đối tác bên ngoài.

Nhiệm vụ đầu tiên cần thực hiện là [TASK-001: Build NEXORA Visual Demo](./phase-01-foundation/TASK-001-build-nexora-visual-demo.md).
