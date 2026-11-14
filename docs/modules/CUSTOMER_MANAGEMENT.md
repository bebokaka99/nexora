# Phân hệ quản lý khách hàng (Customer Management Module)

> Trạng thái thông tin: `[CONFIRMED]` cho hồ sơ khách hàng hợp nhất đa kênh | `[PROPOSED]` cho chính sách tích điểm và phân hạng hội viên.

## 1. Mục đích
Phân hệ Customer Management đóng vai trò là kho lưu trữ tập trung dữ liệu khách hàng của từng doanh nghiệp bán lẻ. Phân hệ hợp nhất thông tin người mua từ quầy POS tại 2 chi nhánh cửa hàng, từ đơn hàng sàn Shopee, TikTok Shop và các cuộc trò chuyện trên Facebook Messenger vào một hồ sơ 360 độ duy nhất.

## 2. Phạm vi nghiệp vụ
- Thu thập và chuẩn hóa dữ liệu định danh khách hàng (Họ tên, Số điện thoại, Địa chỉ giao hàng, Kênh mua ban đầu).
- Hợp nhất các khách hàng trùng số điện thoại giữa kênh bán online và kênh bán lẻ tại cửa hàng.
- Theo dõi toàn bộ lịch sử mua sắm, giá trị vòng đời khách hàng (Customer Lifetime Value - LTV) và công nợ mua hàng chưa thanh toán.
- Thiết lập phân nhóm khách hàng theo doanh số mua và hỗ trợ chính sách tích lũy điểm thưởng.

## 3. Đối tượng sử dụng
- Quản trị viên doanh nghiệp (Tenant Administrator).
- Quản lý cửa hàng (Store Manager).
- Thu ngân (Cashier - tra cứu thông tin khách hàng tại quầy POS để áp dụng chiết khấu).
- Nhân viên chăm sóc khách hàng (Customer Support / Chat Agent).

## 4. Các chức năng chính
- **Hồ sơ khách hàng hợp nhất:** Xem tổng số đơn đã mua, tổng tiền đã chi, tần suất mua sắm và ghi chú đặc điểm của khách.
- **Quản lý công nợ khách sỉ và khách quen:** Ghi nhận số tiền nợ, hạn trả nợ, lịch sử các lần trả nợ và in phiếu thu tiền nợ.
- **Phân hạng hội viên tự động:** Phân cấp hạng thành viên (Đồng, Bạc, Vàng, Kim Cương) dựa trên ngưỡng chi tiêu tích lũy.
- **Tìm kiếm nhanh tại quầy:** Tìm khách hàng bằng số điện thoại hoặc mã vạch thẻ thành viên trong thời gian dưới 1 giây.

## 5. Quy tắc nghiệp vụ (Business Rules)
- `BR-CUS-001`: Số điện thoại là trường định danh duy nhất của khách hàng trong phạm vi một Tenant. Hai khách hàng cùng số điện thoại sẽ được gộp tự động vào một hồ sơ duy nhất.
- `BR-CUS-002`: Đơn hàng từ các sàn Shopee và TikTok Shop có số điện thoại bị mã hóa bảo mật từ sàn sẽ được lưu tạm dưới định danh mã khách hàng của sàn đó cho đến khi có dữ liệu đối soát.
- `BR-CUS-003`: Tổng chi tiêu của khách hàng chỉ được cộng dồn khi đơn hàng chuyển sang trạng thái hoàn tất `COMPLETED`.
- `BR-CUS-004`: Khách hàng có công nợ vượt hạn mức tín dụng được cấu hình sẽ bị cảnh báo đỏ khi thu ngân tạo đơn bán lẻ mới.

## 6. Thực thể dữ liệu liên quan
- `customers`: Lưu trữ hồ sơ định danh chính, số điện thoại, địa chỉ, hạng thành viên và tổng tiền tích lũy.
- `customer_debts`: Bản ghi phát sinh công nợ và lịch sử thanh toán nợ.
- `orders`: Liên kết khóa ngoại trỏ về `customer_id`.

## 7. Mối quan hệ với module khác
- Liên kết với `OrderManagementModule`: Nhận sự kiện đơn hàng hoàn tất để cập nhật doanh số tích lũy cho khách.
- Liên kết với `ConversationManagementModule`: Hiển thị bảng tóm tắt lịch sử mua hàng bên cạnh khung chat khi khách nhắn tin.
- Liên kết với `BusinessIntelligenceModule`: Cung cấp dữ liệu báo cáo tỷ lệ khách hàng quay lại mua sắm.

## 8. Danh mục API dự kiến
- `GET /api/v1/customers`: Danh sách khách hàng kèm bộ lọc nâng cao theo chi nhánh, hạng hội viên, công nợ.
- `POST /api/v1/customers`: Thêm mới hồ sơ khách hàng thủ công.
- `GET /api/v1/customers/{id}`: Xem chi tiết hồ sơ 360 độ và toàn bộ lịch sử đơn hàng.
- `PATCH /api/v1/customers/{id}`: Cập nhật thông tin địa chỉ hoặc số điện thoại.
- `GET /api/v1/customers/lookup?phone={phoneNumber}`: Tra cứu nhanh khách hàng theo số điện thoại phục vụ quầy POS.

## 9. Quyền truy cập
- Quyền: `customers:read`, `customers:create`, `customers:update`, `customers:manage_debt`.

## 10. Các trường hợp biên (Edge Cases)
- Khách hàng đổi số điện thoại: Hệ thống cho phép nhân viên cập nhật số điện thoại mới sau khi nhập mã xác nhận gửi về điện thoại cũ hoặc có sự phê duyệt từ quản lý cửa hàng.
- Hai đơn hàng từ sàn gửi về cùng lúc với cùng số điện thoại nhưng họ tên gõ khác nhau: Hệ thống giữ lại tên từ giao dịch mới nhất và ghi nhận tên cũ vào danh sách tên phụ.

## 11. Tiêu chí nghiệm thu (Acceptance Criteria)
- [ ] Nhân viên thu ngân nhập số điện thoại tại màn hình POS tìm thấy khách hàng trong vòng 300ms.
- [ ] Khi hoàn tất một đơn hàng 1.000.000 VNĐ, trường tổng chi tiêu trong hồ sơ khách hàng tăng thêm đúng 1.000.000 VNĐ.
- [ ] Không thể tạo hai bản ghi khách hàng có cùng số điện thoại trong cùng một Tenant.

## 12. Những điểm còn bỏ ngỏ cần xác nhận (Pending Decisions)
- `[UNDECIDED]`: Tỷ lệ quy đổi điểm thưởng sang tiền mặt khi thanh toán tại quầy POS cần chốt với chủ doanh nghiệp chuỗi gia dụng.
