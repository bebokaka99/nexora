# Hệ thống quản lý nhiệm vụ phát triển NEXORA

Tài liệu này quy định cấu trúc tổ chức nhiệm vụ và cách thức theo dõi tiến độ phát triển nền tảng NEXORA.

## 0. Quyết định đổi ưu tiên ngày 16/11/2026 — Củng cố nền trước, thêm tính năng sau

> **Căn cứ kiểm chứng**: Rà soát repo `bebokaka99/nexora` ngày 16/11/2026, commit `08b9602`. TASK-001 đến TASK-008 ghi DONE (Phase 01–06), Phase 07/08 chưa bắt đầu. Nhưng kiểm chứng thực tế cho thấy nền chưa vững: chưa có migration Prisma nào, backend nhiều module chạy bằng fallback in-memory, `infrastructure/` chỉ có README (không Docker/CI), tích hợp sàn thật chưa có (đồng bộ chỉ cập nhật `lastSyncAt`), tài khoản demo hardcode trong `auth.service.ts`.

Vì vậy, lộ trình chèn thêm **Phase 06.5 — Foundation Hardening (Củng cố nền tảng)** ngay sau Phase 06 và **trước Phase 07/08**. Phase 07/08 chỉ bắt đầu khi đạt Definition of Done của Phase 06.5 (xem mục Phase 06.5 dưới đây). Không xóa lịch sử TASK-001..008 và không sửa trạng thái DONE của chúng; chỉ Phase 06 được ghi chú thêm là "DONE một phần" (xem mục Phase 06).

## 1. Cấu trúc phân rã công việc

Các hạng mục phát triển được tổ chức theo cấu trúc phân cấp ba tầng:

1. **Phases (Giai đoạn)**: 8 giai đoạn chiến lược phát triển sản phẩm từ thiết lập nền tảng đến sẵn sàng vận hành thương mại, cộng thêm Phase 06.5 củng cố nền tảng chèn giữa Phase 06 và Phase 07. Chi tiết xem tại [PHASES.md](./PHASES.md).
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
- `phase-06-omnichannel/`: Kết nối đồng bộ với Shopee, TikTok Shop và Facebook. **DONE một phần** (xong CRUD kết nối + `lastSyncAt`, chưa có tích hợp sàn thật — xem ghi chú ngày 16/11/2026 trong `TASK-008`).
- `phase-06-5-foundation-hardening/`: Củng cố nền tảng trước Phase 07/08 — migration Prisma + PostgreSQL thật, Docker/CI, gỡ tài khoản demo, tách dashboard + sửa lỗi FE P0, tích hợp sàn thật (hoàn thiện Phase 06).
- `phase-07-conversation/`: Hộp thư hội thoại đa kênh tập trung (Unified Inbox). **Chưa bắt đầu — chỉ vào sau khi đạt Definition of Done của Phase 06.5** (xem [PHASES.md](./PHASES.md)).
- `phase-08-bi-billing/`: Báo cáo quản trị, doanh thu thực và thu phí gói SaaS. **Chưa bắt đầu — chỉ vào sau khi đạt Definition of Done của Phase 06.5** (xem [PHASES.md](./PHASES.md)).

## 3. Trạng thái vòng đời nhiệm vụ

- `TODO`: Nhiệm vụ chưa bắt đầu thực hiện.
- `IN_PROGRESS`: Nhiệm vụ đang được triển khai.
- `IN_REVIEW`: Mã nguồn đã hoàn thiện và đang chờ rà soát qua Pull Request.
- `DONE`: Nhiệm vụ đã hoàn thành, vượt qua toàn bộ kiểm thử và được gộp vào nhánh chính.
- `BLOCKED`: Nhiệm vụ bị tạm dừng do phụ thuộc vào yếu tố kỹ thuật hoặc đối tác bên ngoài.

Nhiệm vụ đầu tiên cần thực hiện là [TASK-001: Build NEXORA Visual Demo](./phase-01-foundation/TASK-001-build-nexora-visual-demo.md).
