# Phân hệ báo cáo thông minh và phân tích kinh doanh (Business Intelligence Module)

> Trạng thái thông tin: `[CONFIRMED]` cho báo cáo doanh thu và đối soát phí sàn | `[PROPOSED]` cho công cụ cảnh báo tồn kho và dự báo nhu cầu nhập hàng.

## 1. Mục đích
Phân hệ Business Intelligence (BI) cung cấp các biểu đồ trực quan, số liệu thống kê và báo cáo phân tích tài chính chuyên sâu cho doanh nghiệp bán lẻ đa kênh. Phân hệ giúp chủ cửa hàng nắm bắt doanh thu thuần thực tế sau khi đã trừ toàn bộ phí sàn thương mại điện tử, chi phí vận chuyển, chiết khấu và giá vốn hàng bán.

## 2. Phạm vi nghiệp vụ
- Tổng hợp và trực quan hóa doanh thu, lợi nhuận gộp theo từng kênh bán hàng (Cửa hàng 1, Cửa hàng 2, Shopee, TikTok Shop, Facebook).
- Báo cáo đối soát chi tiết các khoản phí trừ từ sàn: Phí thanh toán, phí cố định, phí dịch vụ Freeship Extra, phí quảng cáo.
- Phân tích hiệu suất bán lẻ: Tốc độ quay vòng tồn kho, danh sách các mặt hàng gia dụng bán chạy nhất (Top Sellers) và các mặt hàng tồn kho đọng lâu ngày (Dead Stock).
- Dự báo nhu cầu bổ sung hàng hóa vào kho dựa trên tốc độ bán trung bình trong 30 ngày gần nhất.

## 3. Đối tượng sử dụng
- Chủ doanh nghiệp (Tenant Owner).
- Giám đốc tài chính / Kế toán trưởng.
- Quản lý kho và Quản lý chuỗi cửa hàng.

## 4. Các chức năng chính
- **Bảng điều khiển kinh doanh tổng hợp (Executive Dashboard):** Xem doanh thu trong ngày, so sánh với cùng kỳ tuần trước hoặc tháng trước, tỷ lệ chuyển đổi đơn hàng và giá trị trung bình trên một đơn hàng (AOV).
- **Báo cáo đối soát doanh thu sàn (Marketplace Settlement Report):** So sánh giữa doanh thu bán hàng ghi nhận trên hệ thống và số tiền thực nhận về tài khoản ngân hàng sau khi sàn đã khấu trừ mọi khoản phí.
- **Báo cáo phân tích tồn kho (Inventory Intelligence):** Cảnh báo các sản phẩm có số ngày bán còn lại dưới 7 ngày để nhân viên kịp thời làm phiếu nhập hàng.
- **Xuất dữ liệu báo cáo:** Xuất các bảng số liệu tài chính ra định dạng tệp Excel hoặc CSV phục vụ công tác kế toán nội bộ.

## 5. Quy tắc nghiệp vụ (Business Rules)
- `BR-BI-001`: Doanh thu báo cáo chỉ được tính dựa trên các đơn hàng đã chuyển sang trạng thái hoàn tất `COMPLETED`. Các đơn hàng đã bị `CANCELLED` hoặc đang trong quá trình hoàn hàng sẽ được tách vào mục báo cáo thất thoát riêng.
- `BR-BI-002`: Lợi nhuận gộp được tính bằng công thức: `Doanh thu thực nhận - Giá vốn hàng bán (Cost of Goods Sold) - Chi phí đóng gói và giao vận`.
- `BR-BI-003`: Dữ liệu báo cáo tổng hợp theo ngày được hệ thống tự động tính toán lại và lưu vào bảng đệm (Aggregated Materialized Table) vào lúc 02:00 sáng mỗi ngày để tăng tốc độ tải trang.
- `BR-BI-004`: Quyền xem báo cáo lợi nhuận và giá vốn chỉ được cấp cho Quản trị viên doanh nghiệp và kế toán trưởng, nhân viên thu ngân tại quầy không được phép xem số liệu này.

## 6. Thực thể dữ liệu liên quan
- `orders`, `order_items`: Nguồn dữ liệu thô về doanh thu, số lượng bán và chiết khấu.
- `product_variants`: Cung cấp thông tin giá vốn (`cost_price`) để tính toán tỷ suất lợi nhuận.
- `daily_sales_summaries`: Bảng tổng hợp số liệu theo ngày, theo chi nhánh và theo kênh bán hàng.

## 7. Mối quan hệ với module khác
- Liên kết với `OrderManagementModule`: Thu thập dữ liệu đơn hàng và trạng thái thanh toán.
- Liên kết với `InventoryManagementModule`: Thu thập số liệu biến động kho và giá trị hàng tồn.
- Liên kết với `OmnichannelModule`: Thu thập thông tin chi phí và biểu phí khấu trừ từ các sàn thương mại điện tử.

## 8. Danh mục API dự kiến
- `GET /api/v1/analytics/overview`: Lấy các chỉ số tóm tắt (KPIs) cho màn hình Dashboard chính.
- `GET /api/v1/analytics/revenue-by-channel`: Doanh thu và số lượng đơn hàng phân bổ theo từng kênh.
- `GET /api/v1/analytics/top-products`: Danh sách 10 sản phẩm đồ gia dụng có doanh số cao nhất theo khoảng thời gian.
- `GET /api/v1/analytics/stock-turnover`: Báo cáo vòng quay hàng tồn kho và cảnh báo thiếu hàng.
- `GET /api/v1/analytics/export`: Tạo yêu cầu xuất tệp báo cáo chi tiết ra định dạng Excel.

## 9. Quyền truy cập
- Quyền: `analytics:view_revenue`, `analytics:view_profit`, `analytics:export_reports`.

## 10. Các trường hợp biên (Edge Cases)
- Giá vốn sản phẩm bị thay đổi giữa các đợt nhập hàng: Hệ thống ghi nhận giá vốn tại đúng thời điểm đơn hàng được tạo để đảm bảo số liệu lợi nhuận lịch sử không bị sai lệch khi giá nhập biến động.
- Sàn thương mại điện tử thay đổi chính sách thu phí nhưng không thông báo trước: Hệ thống cho phép quản trị viên nhập bảng điều chỉnh phí thủ công để đối soát lại các đợt quyết toán cũ.

## 11. Tiêu chí nghiệm thu (Acceptance Criteria)
- [ ] Màn hình Dashboard tải toàn bộ các biểu đồ và chỉ số tổng quan trong thời gian dưới 1 giây cho tập dữ liệu 100.000 đơn hàng.
- [ ] Báo cáo lợi nhuận gộp tính toán chính xác tuyệt đối theo công thức định nghĩa khi đối chiếu với số liệu kế toán mẫu.
- [ ] Người dùng có vai trò Thu ngân khi đăng nhập không thể thấy các thẻ thông tin về Giá vốn và Lợi nhuận.

## 12. Những điểm còn bỏ ngỏ cần xác nhận (Pending Decisions)
- `[UNDECIDED]`: Tích hợp thêm biểu đồ phân tích nhiệt (Heatmap) thể hiện khung giờ cao điểm phát sinh đơn hàng trong tuần.
