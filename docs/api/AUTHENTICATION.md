# Quy Chuẩn Xác Thực API — API Authentication

> Trạng thái thông tin: `[PROPOSED]` Cơ chế xác thực JWT và bảo mật phiên bởi Senior Technical Lead.

Tài liệu này hướng dẫn cách thức xác thực, truyền thông tin định danh và quản lý phiên làm việc khi gọi các điểm cuối API của nền tảng **NEXORA**.

---

## 1. Cơ Chế Xác Thực Bằng Bearer Token (HTTP Authorization Header)

Mọi yêu cầu đến các API được bảo vệ (Private Endpoints) bắt buộc phải đính kèm Access Token trong tiêu đề HTTP:

```http
Authorization: Bearer <access_token>
X-Tenant-ID: <tenant_id_hoac_slug>
```

- **`Authorization: Bearer <access_token>`:** Chuỗi JWT được mã hóa do server cấp sau khi đăng nhập thành công.
- **`X-Tenant-ID` (Tùy chọn):** Sử dụng khi gọi API từ các ứng dụng tích hợp bên ngoài hoặc webhook đặc thù; đối với người dùng thông thường, hệ thống tự động giải mã `tenant_id` từ bên trong JWT payload.

---

## 2. Cấu Trúc Payload Của Access Token (JWT Claims)

```json
{
  "sub": "user-uuid-1234",
  "email": "quanly@giadunghiendai.vn",
  "fullName": "Nguyễn Văn Quản Lý",
  "tenantId": "tenant-uuid-5678",
  "roles": ["STORE_MANAGER"],
  "permissions": [
    "products:read",
    "orders:read",
    "orders:create",
    "pos:access"
  ],
  "storeId": "store-uuid-001",
  "iat": 1794825000,
  "exp": 1794825900
}
```

- Thời hạn hiệu lực của Access Token (`exp` - `iat`): **15 phút**.

---

## 3. Quy Trình Cấp Lại Phiên Làm Việc (Refresh Token Flow)

Khi Access Token hết hạn, API trả về mã lỗi HTTP 401 Unauthorized kèm mã lỗi `AUTH_TOKEN_EXPIRED`. Máy khách (Client) tự động gọi endpoint làm mới token mà không đăng xuất người dùng:

- **Endpoint:** `POST /api/v1/auth/refresh`
- **Request Body:**
  ```json
  {
    "refreshToken": "rf-token-uuid-long-string"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "new-jwt-access-token",
      "refreshToken": "new-rotated-refresh-token",
      "expiresIn": 900
    }
  }
  ```
- **Lưu ý an ninh (Token Rotation):** Mỗi Refresh Token chỉ được sử dụng đúng 1 lần. Khi được dùng, hệ thống lập tức thu hồi token đó và sinh ra một Refresh Token mới. Nếu phát hiện Refresh Token cũ bị gửi lại lần thứ hai, hệ thống đánh giá đây là hành vi đánh cắp phiên và lập tức vô hiệu hóa toàn bộ các token liên quan.
