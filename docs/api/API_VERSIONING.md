# Chiến Lược Đánh Phiên Bản API — API Versioning

> Trạng thái thông tin: `[PROPOSED]` Chiến lược quản lý phiên bản API bởi Senior Technical Lead.

Tài liệu này xác định phương pháp quản lý phiên bản (Versioning Strategy) cho toàn bộ hệ thống API của **NEXORA**, nhằm đảm bảo khả năng nâng cấp tính năng liên tục mà không gây gián đoạn (Breaking Changes) cho các ứng dụng Client, máy quầy POS hoặc các sàn TMĐT đang kết nối.

---

## 1. Phương Pháp Lựa Chọn: URI Path Versioning

NEXORA áp dụng chiến lược **Đánh phiên bản trực tiếp trên đường dẫn URL (URI Path Versioning)**:

- **Định dạng:** `/api/v{major_version}/[resource]`
- **Ví dụ hiện tại:** `/api/v1/orders`, `/api/v1/products`

### Lý do lựa chọn URI Path Versioning:
1. **Trực quan & Dễ kiểm thử:** Lập trình viên và đối tác dễ dàng nhận biết phiên bản API ngay trên thanh địa chỉ, Swagger UI và log Nginx mà không cần phân tích Header HTTP phức tạp.
2. **Khả năng định tuyến (Routing) linh hoạt:** Dễ dàng cấu hình Nginx hoặc NestJS Router để chuyển tiếp lưu lượng v1 và v2 sang các cụm xử lý khác nhau nếu cần nâng cấp kiến trúc sau này.

---

## 2. Quy Tắc Phân Biệt Thay Đổi Tương Thích vs. Thay Đổi Đột Phá

### 2.1. Thay đổi tương thích (Non-Breaking Changes) — Giữ nguyên `/api/v1/`
Các thay đổi sau đây KHÔNG làm tăng số phiên bản API:
- Thêm endpoint mới (ví dụ: `POST /api/v1/products/bulk-export`).
- Bổ sung trường mới trong response JSON (phía client được yêu cầu phải bỏ qua các trường không xác định).
- Bổ sung query param tùy chọn (Optional Query Parameters).

### 2.2. Thay đổi đột phá (Breaking Changes) — Bắt buộc nâng lên `/api/v2/`
Các thay đổi sau đây BẮT BUỘC phải tạo phiên bản mới:
- Xóa bỏ hoặc đổi tên một trường dữ liệu trong response.
- Thay đổi kiểu dữ liệu của một trường (ví dụ: từ `string` sang `array`).
- Thêm trường bắt buộc (Required Field) vào request payload.
- Thay đổi cấu trúc mã lỗi hoặc logic nghiệp vụ cốt lõi làm sai lệch kết quả xử lý của client.

---

## 3. Chính Sách Hết Hạn Phiên Bản Cũ (Deprecation Policy)

Khi một phiên bản API mới (`v2`) được phát hành:
1. Phiên bản cũ (`v1`) được đánh dấu là `Deprecated` trong tài liệu Swagger và phản hồi kèm HTTP Header:
   ```http
   Deprecation: true
   Sunset: 2027-12-31T23:59:59Z
   Link: </api/v2/orders>; rel="successor-version"
   ```
2. Phiên bản cũ tiếp tục được duy trì hoạt động song song tối thiểu **6 tháng** để đối tác và các ứng dụng client có đủ thời gian nâng cấp trước khi ngừng hỗ trợ hoàn toàn.
