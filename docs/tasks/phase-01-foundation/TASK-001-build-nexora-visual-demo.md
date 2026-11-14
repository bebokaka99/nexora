# TASK-001: Xây dựng bản mẫu trực quan NEXORA (Visual Demo)

- **Mã nhiệm vụ**: `TASK-001`
- **Giai đoạn**: `Phase 01 - Foundation`
- **Trạng thái**: `DONE` (Hoàn thành)
- **Người thực hiện**: Frontend Engineer / Fullstack Engineer
- **Độ ưu tiên**: Cao nhất (P0)

## 1. Mục đích công việc

Xây dựng bản mẫu trực quan tương tác hoàn chỉnh (Interactive Visual Demo) trên ứng dụng Next.js 15 ở thư mục `frontend/`. Bản demo này thể hiện toàn bộ luồng trải nghiệm người dùng cốt lõi của NEXORA trước khi tích hợp sâu với cơ sở dữ liệu và API sàn bên ngoài.

Bản demo giúp chủ doanh nghiệp và đội ngũ phát triển nhìn thấy trực quan cách nền tảng hợp nhất hoạt động bán lẻ tại 2 cửa hàng gia dụng và các kênh Shopee, TikTok Shop, Facebook.

## 2. Phạm vi màn hình cần xây dựng

Bản demo bao gồm 5 màn hình chính trong bố cục ứng dụng quản trị tập trung:

### Màn hình 1. Bảng điều khiển tổng quan (Omnichannel Dashboard)
- Thẻ chỉ số tổng hợp: Tổng doanh thu hôm nay, số đơn hàng mới, số lượng khách đang phục vụ, cảnh báo mặt hàng sắp hết hàng.
- Biểu đồ phân bổ doanh thu theo từng kênh bán hàng: Cửa hàng 1, Cửa hàng 2, Shopee, TikTok Shop, Facebook.
- Bảng tin trực tiếp: Các sự kiện mới nhất (đơn hàng mới từ Shopee, khách bình luận trên Facebook, đơn vừa thanh toán tại quầy).

### Màn hình 2. Quầy bán lẻ tại cửa hàng (POS Terminal)
- Danh mục chọn nhanh sản phẩm ngành gia dụng: Nồi chiên không dầu, chảo chống dính, ấm siêu tốc, máy xay sinh tố.
- Ô tìm kiếm và giả lập quét mã vạch Barcode để thêm hàng vào giỏ.
- Giỏ hàng bên phải: Tăng giảm số lượng, chọn chiết khấu, chọn phương thức thanh toán (Tiền mặt, Chuyển khoản VietQR, Thẻ).
- Nút bấm thanh toán in hóa đơn và mô phỏng trừ ngay tồn kho của cửa hàng đang chọn.

### Màn hình 3. Quản lý đơn hàng tập trung (Order Management Hub)
- Danh sách đơn hàng hợp nhất từ tất cả các kênh với nhãn nhận diện kênh rõ ràng (Logo Shopee, TikTok, Facebook, POS).
- Bộ lọc đơn hàng theo trạng thái: Chờ duyệt, Đang đóng gói, Đang giao hàng, Hoàn thành, Đã hủy.
- Chi tiết một đơn hàng mẫu: Danh sách sản phẩm, địa chỉ giao hàng và lịch sử chuyển trạng thái.

### Màn hình 4. Quản lý tồn kho đa chi nhánh (Inventory Matrix)
- Bảng ma trận tồn kho: Cột hiển thị Tên sản phẩm, SKU, Tồn thực tế Kho 1, Tồn thực tế Kho 2, Số lượng đang giữ cho đơn online, Số lượng khả dụng.
- Cảnh báo trực quan bằng màu sắc khi số lượng khả dụng xuống dưới mức tối thiểu 5 sản phẩm.
- Nút mô phỏng tạo phiếu chuyển hàng giữa Kho 1 và Kho 2.

### Màn hình 5. Trung tâm kết nối kênh bán (Channel Connections)
- Danh sách các thẻ kết nối: Gian hàng Shopee, TikTok Shop, Fanpage Facebook.
- Trạng thái kết nối hiển thị rõ: Đang kết nối, Cần ủy quyền lại, Lỗi kết nối.
- Nút bấm giả lập đồng bộ thủ công để quan sát hiệu ứng tải dữ liệu.

## 3. Yêu cầu kỹ thuật

- **Khung giao diện**: Next.js 15 App Router, React 19, TypeScript.
- **Phong cách giao diện**: Tailwind CSS v3.4 kết hợp các thành phần giao diện mẫu shadcn/ui và bộ biểu tượng Lucide Icons.
- **Dữ liệu mẫu (Mock Data)**: Xây dựng tệp dữ liệu giả lập chi tiết về sản phẩm đồ gia dụng, đơn hàng và lịch sử tương tác đặt tại `frontend/lib/mock-data.ts`.
- **Thiết kế thích ứng (Responsive)**: Tối ưu cho màn hình máy tính bảng và màn hình máy tính bàn từ độ phân giải 1024px trở lên.

## 4. Tiêu chí nghiệm thu (Acceptance Criteria)

- [x] Lập trình viên khởi chạy lệnh `pnpm dev` hoặc `pnpm start` trong thư mục `frontend/` và truy cập `http://localhost:3000` không gặp lỗi biên dịch.
- [x] Người dùng chuyển đổi qua lại giữa 5 màn hình chính thông qua thanh điều hướng bên trái một cách mượt mà.
- [x] Tại màn hình POS, người dùng có thể nhấp chọn sản phẩm để thêm vào giỏ hàng, nhập số tiền khách đưa và bấm thanh toán thành công (có hiển thị hóa đơn in nhiệt K80 và trừ tồn kho tự động).
- [x] Tại màn hình Đơn hàng, bộ lọc trạng thái và bộ lọc theo kênh hoạt động chính xác trên tập dữ liệu mẫu.
- [x] Giao diện có bố cục gọn gàng, sử dụng phông chữ tiếng Việt hiển thị rõ ràng, không bị vỡ khung.
