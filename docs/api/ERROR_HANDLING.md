# Xử Lý Lỗi & Định Dạng Mã Lỗi — Error Handling

> Trạng thái thông tin: `[PROPOSED]` Chuẩn hóa phản hồi lỗi toàn cục bởi Senior Technical Lead.

Tài liệu này định nghĩa cấu trúc chuẩn của thông báo lỗi do **NEXORA API** trả về, giúp lập trình viên Frontend và các hệ thống tích hợp dễ dàng bắt lỗi và hiển thị thông điệp thân thiện cho người dùng.

---

## 1. Cấu Trúc Khung Lỗi Chuẩn (Standard Error Envelope)

Mọi ngoại lệ (Exceptions) trong NestJS đều được chặn lại bởi `GlobalExceptionFilter` và định dạng theo mẫu:

```json
{
  "success": false,
  "statusCode": 400,
  "errorCode": "ORDER_INSUFFICIENT_STOCK",
  "message": "Số lượng tồn kho không đủ để tạo đơn hàng",
  "details": [
    {
      "field": "items[0].quantity",
      "issue": "Yêu cầu 5 chiếc, tồn kho khả dụng chỉ còn 2 chiếc",
      "sku": "NCKD-05L"
    }
  ],
  "path": "/api/v1/orders",
  "timestamp": "2026-11-14T10:45:00.000Z"
}
```

- **`success`:** Luôn luôn là `false`.
- **`statusCode`:** Mã trạng thái HTTP chuẩn (400, 401, 403, 404, 409, 422, 500).
- **`errorCode`:** Chuỗi định danh lỗi duy nhất (Error Code) viết hoa theo kiểu SNAKE_CASE, dùng cho lập trình viên frontend lập trình logic rẽ nhánh.
- **`message`:** Thông điệp mô tả lỗi ngắn gọn bằng tiếng Việt.
- **`details`:** Mảng chi tiết các trường vi phạm (đặc biệt hữu ích khi validate biểu mẫu).
- **`path`:** Đường dẫn API phát sinh lỗi.
- **`timestamp`:** Mốc thời gian xảy ra lỗi theo chuẩn ISO 8601.

---

## 2. Danh Mục Các Mã Lỗi Nghiệp Vụ Phổ Biến (Standard Business Error Codes)

| HTTP Status | Error Code | Ý Nghĩa / Tình Huống Gặp Phải |
| :--- | :--- | :--- |
| `400 Bad Request` | `VALIDATION_FAILED` | Dữ liệu gửi lên sai định dạng (ví dụ: email không hợp lệ, thiếu trường bắt buộc). |
| `401 Unauthorized` | `AUTH_UNAUTHORIZED` | Không có token hoặc token không hợp lệ. |
| `401 Unauthorized` | `AUTH_TOKEN_EXPIRED` | Access Token đã hết hạn, cần gọi refresh token. |
| `403 Forbidden` | `AUTH_FORBIDDEN` | Người dùng không đủ quyền hạn (Roles/Permissions) để thực hiện hành động này. |
| `403 Forbidden` | `TENANT_SUSPENDED` | Tài khoản doanh nghiệp đang bị khóa do nợ cước hoặc vi phạm điều khoản. |
| `404 Not Found` | `RESOURCE_NOT_FOUND` | Không tìm thấy bản ghi tương ứng trong phạm vi Tenant hiện tại. |
| `409 Conflict` | `RESOURCE_ALREADY_EXISTS` | Bản ghi đã tồn tại (ví dụ: trùng mã SKU sản phẩm hoặc trùng số điện thoại). |
| `409 Conflict` | `ORDER_INSUFFICIENT_STOCK`| Tồn kho khả dụng không đủ đáp ứng số lượng trong đơn hàng. |
| `429 Too Many Requests`| `RATE_LIMIT_EXCEEDED` | Gọi API quá số lần cho phép trong một đơn vị thời gian. |
| `500 Internal Error` | `INTERNAL_SERVER_ERROR` | Lỗi máy chủ không mong muốn; chi tiết stack trace chỉ được ghi vào log, không lộ ra client. |
