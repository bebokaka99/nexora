# Quy Chuẩn Thiết Kế API — API Conventions

> Trạng thái thông tin: `[PROPOSED]` Chuẩn mực giao tiếp RESTful API bởi Senior Technical Lead.

Tài liệu này xác định các quy ước bắt buộc khi xây dựng và sử dụng các điểm cuối REST API trong hệ sinh thái **NEXORA**.

---

## 1. Phương Thức HTTP & Mã Trạng Thái (HTTP Methods & Status Codes)

| Phương Thức | Mục Đích Sử Dụng | Mã Trạng Thái Thành Công Mặc Định |
| :--- | :--- | :--- |
| `GET` | Đọc hoặc truy vấn dữ liệu (không làm thay đổi trạng thái hệ thống) | `200 OK` |
| `POST` | Tạo mới một tài nguyên hoặc kích hoạt một hành động nghiệp vụ | `201 Created` hoặc `200 OK` |
| `PATCH` | Cập nhật một phần các trường của tài nguyên hiện có | `200 OK` |
| `PUT` | Thay thế toàn bộ nội dung của tài nguyên hiện có | `200 OK` |
| `DELETE`| Xóa mềm hoặc xóa một tài nguyên | `200 OK` hoặc `204 No Content` |

---

## 2. Quy Chuẩn Đặt Tên Đường Dẫn (URI Design)

- Đường dẫn luôn sử dụng chữ thường (lowercase) và danh từ số nhiều: `/api/v1/products`, `/api/v1/orders`.
- Tài nguyên lồng nhau (Nested Resources) thể hiện mối quan hệ sở hữu:
  - `/api/v1/orders/{orderId}/items`: Lấy danh sách món hàng trong đơn.
  - `/api/v1/stores/{storeId}/registers`: Danh sách quầy thu ngân của cửa hàng.
- Tránh lồng quá 2 cấp; nếu cần truy vấn độc lập, chuyển thành tài nguyên gốc kết hợp query param (ví dụ: `/api/v1/order-items?orderId={orderId}`).

---

## 3. Cấu Trúc Khung Dữ Liệu Chuẩn (Response Envelope)

Mọi phản hồi từ backend NestJS đều được đóng gói qua `TransformInterceptor` thành một cấu trúc đồng nhất:

### Phản hồi thành công cho một đối tượng (Single Object):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Chi tiết đơn hàng",
  "data": {
    "id": "ord-1234",
    "orderNumber": "#ORD-202611-0001",
    "totalAmount": 1500000,
    "status": "COMPLETED"
  },
  "timestamp": "2026-11-14T10:30:00.000Z"
}
```

### Phản hồi thành công cho danh sách có phân trang (Paginated List):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Danh sách sản phẩm",
  "data": [
    { "id": "prod-1", "name": "Nồi chiên không dầu" },
    { "id": "prod-2", "name": "Nồi cơm điện cao tần" }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalItems": 150,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "timestamp": "2026-11-14T10:30:00.000Z"
}
```

---

## 4. Chuẩn Phân Trang, Lọc & Sắp Xếp (Pagination, Filtering & Sorting)

- **Phân trang:**
  - `page`: Số trang hiện tại (mặc định = `1`).
  - `limit`: Số bản ghi trên mỗi trang (mặc định = `20`, tối đa = `100`).
- **Sắp xếp (Sorting):**
  - Cú pháp: `sortBy=createdAt&sortOrder=DESC` hoặc `sort=-createdAt,name`.
- **Lọc dữ liệu (Filtering):**
  - Tìm kiếm từ khóa: `q=nồi+chiên`.
  - Lọc theo trạng thái: `status=ACTIVE&channelType=SHOPEE`.
  - Lọc theo khoảng ngày: `startDate=2026-11-01&endDate=2026-11-30`.
