# Danh mục các Epic phát triển (Epics Catalog)

> Trạng thái thông tin: `[PROPOSED]` Phân bổ các chủ đề lớn theo từng giai đoạn.

Tài liệu này liệt kê danh sách các Epic (khối tính năng lớn) phân bổ theo 8 giai đoạn phát triển của dự án NEXORA.

## Giai đoạn 01. Nền tảng và Bản mẫu trực quan (Foundation & Visual Demo)
- `EPIC-01-A`: Khởi tạo Monorepo, cấu hình NestJS và Next.js 15.
- `EPIC-01-B`: Thiết kế cơ sở dữ liệu Prisma Schema toàn hệ thống.
- `EPIC-01-C`: Dựng bản mẫu trực quan tương tác (Visual Demo).

## Giai đoạn 02. Xác thực và Phân quyền Tenant (Auth & Multi-Tenancy)
- `EPIC-02-A`: Quản lý vòng đời Tenant và các gói dùng thử.
- `EPIC-02-B`: Hệ thống xác thực JWT, cơ chế làm mới Token và bảo mật mật khẩu.
- `EPIC-02-C`: Phân quyền dựa trên vai trò (RBAC) và kiểm soát truy cập dữ liệu.
- `EPIC-02-D`: Tích hợp giao diện Đăng nhập, Đăng ký và Quản trị phiên trên Frontend.

## Giai đoạn 03. Quản lý cửa hàng và Kho hàng (Stores & Warehouses)
- `EPIC-03-A`: Quản trị 2 chi nhánh cửa hàng gia dụng và liên kết kho.
- `EPIC-03-B`: Quản lý tồn kho đa kho, phiếu nhập và chuyển kho.
- `EPIC-03-C`: Cơ chế khóa an toàn chống bán vượt tồn kho (Stock Concurrency Lock).

## Giai đoạn 04. Quản lý sản phẩm và Biến thể (Product & Catalog)
- `EPIC-04-A`: Danh mục sản phẩm đồ gia dụng và phân cấp danh mục.
- `EPIC-04-B`: Quản lý biến thể (kích thước, màu sắc), mã SKU và mã vạch Barcode.
- `EPIC-04-C`: Quản lý bảng giá bán lẻ, giá khuyến mãi và giá sỉ.

## Giai đoạn 05. Bán hàng tại quầy và Đơn hàng (POS & Orders)
- `EPIC-05-A`: Màn hình bán hàng thu ngân POS và tích hợp máy quét mã vạch.
- `EPIC-05-B`: Vòng đời đơn hàng tập trung từ mọi kênh bán.
- `EPIC-05-C`: Tự động trừ tồn kho hoặc giữ tồn kho theo trạng thái đơn.

## Giai đoạn 06. Kết nối sàn thương mại điện tử (Omnichannel Sync)
- `EPIC-06-A`: Tích hợp Shopee Open Platform API v2.
- `EPIC-06-B`: Tích hợp TikTok Shop Open API.
- `EPIC-06-C`: Hàng đợi đồng bộ tồn kho hai chiều với BullMQ và Redis.

## Giai đoạn 06.5. Củng cố nền tảng (Foundation Hardening)
- `EPIC-06-5-A`: Migration Prisma, PostgreSQL thật và hạ tầng Docker/CI.
- `EPIC-06-5-B`: Bảo mật — gỡ tài khoản demo hardcode khỏi auth và giao diện.
- `EPIC-06-5-C`: Frontend P0 — tách dashboard, dark mode, animation, nâng cấp Next, thống nhất accent.
- `EPIC-06-5-D`: Hoàn thiện Phase 06 — tích hợp sàn thật (spike Shopee/TikTok Shop API + BullMQ/Redis worker).

> Cập nhật ngày 16/11/2026: Phase 06.5 được chèn giữa Phase 06 và Phase 07 theo quyết định đổi ưu tiên "củng cố nền trước, thêm tính năng sau" (căn cứ kiểm chứng repo ngày 16/11/2026, commit `08b9602`). `EPIC-06-A/B/C` của Phase 06 giữ nguyên; phần tích hợp sàn thật của các epic này được hoàn thiện trong Phase 06.5 qua `TASK-013`.

## Giai đoạn 07. Hộp thư hội thoại tập trung (Unified Inbox)
- `EPIC-07-A`: Tích hợp Meta Graph API (Facebook Fanpage & Messenger).
- `EPIC-07-B`: Hệ thống WebSockets thời gian thực với Socket.IO.
- `EPIC-07-C`: Công cụ chốt đơn và tra cứu tồn kho trực tiếp từ khung chat.

## Giai đoạn 08. Báo cáo thông minh và Thu phí SaaS (BI & Billing)
- `EPIC-08-A`: Bảng điều khiển kinh doanh và phân tích doanh thu đa kênh.
- `EPIC-08-B`: Báo cáo đối soát phí sàn thương mại điện tử và lợi nhuận gộp.
- `EPIC-08-C`: Quản lý gói cước SaaS, hóa đơn chu kỳ và cổng thanh toán VietQR.
