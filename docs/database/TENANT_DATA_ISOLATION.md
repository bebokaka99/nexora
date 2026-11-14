# Cơ Chế Cô Lập Dữ Liệu Tầng Database — Tenant Data Isolation

> Trạng thái thông tin: `[PROPOSED]` Giải pháp kỹ thuật bảo vệ dữ liệu Multi-Tenant bởi Senior Technical Lead.

Tài liệu này chi tiết hóa cách thức hiện thực hóa việc phân tách dữ liệu nhiều doanh nghiệp trên cùng một cơ sở dữ liệu PostgreSQL của **NEXORA**.

---

## 1. Nguyên Tắc Thiết Kế Khóa Ngoại & Cascade

- Mọi bảng dữ liệu nghiệp vụ đều có cột `tenant_id` là Foreign Key trỏ đến bảng `tenants(id)`.
- Ràng buộc khóa ngoại được thiết lập: `ON DELETE CASCADE`. Khi một Tenant bị xóa hoàn toàn khỏi hệ thống (sau thời gian lưu trữ theo hợp đồng), PostgreSQL sẽ tự động xóa sạch toàn bộ sản phẩm, đơn hàng, khách hàng thuộc doanh nghiệp đó mà không để lại dữ liệu rác (Orphan Records).

---

## 2. Chiến Lược Đánh Chỉ Mục (Composite Indexing Strategy)

Để đảm bảo hiệu năng truy vấn dữ liệu trong mô hình Shared Table có hàng triệu dòng bản ghi, tất cả các chỉ mục (Index) trên bảng nghiệp vụ bắt buộc phải đặt `tenant_id` làm cột dẫn đầu (Leading Column):

| Tên Bảng | Cột Chỉ Mục (Index Columns) | Mục Đích Tối Ưu |
| :--- | :--- | :--- |
| `products` | `(tenant_id, status)` | Lọc nhanh danh sách sản phẩm đang bán của shop |
| `product_variants` | `(tenant_id, sku)` (UNIQUE) | Tra cứu nhanh sản phẩm khi quét mã vạch và đảm bảo SKU không trùng lặp trong cùng 1 shop |
| `inventories` | `(tenant_id, warehouse_id, variant_id)` (UNIQUE) | Truy vấn tồn kho tức thời khi tạo đơn |
| `orders` | `(tenant_id, created_at DESC)` | Tải trang danh sách đơn hàng mới nhất của shop |
| `orders` | `(tenant_id, status)` | Thống kê số lượng đơn theo trạng thái (chờ đóng, đang giao) |
| `conversations` | `(tenant_id, assigned_user_id, status)`| Lọc hộp thư theo nhân viên trực chat |

Nhờ có `tenant_id` làm cột dẫn đầu, PostgreSQL chỉ cần quét trên một phân đoạn chỉ mục (Index B-Tree segment) rất nhỏ của riêng doanh nghiệp đó, tốc độ truy vấn đạt < 5ms ngay cả khi tổng bảng có hàng chục triệu dòng.

---

## 3. Cấu Hình PostgreSQL Row-Level Security (RLS)

Để tạo "bức tường lửa" an toàn tuyệt đối dưới tầng Database:

```sql
-- 1. Bật tính năng RLS trên bảng orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 2. Buộc người dùng ứng dụng phải tuân thủ chính sách RLS
ALTER TABLE orders FORCE ROW LEVEL SECURITY;

-- 3. Tạo chính sách cô lập dữ liệu theo biến phiên app.current_tenant_id
CREATE POLICY tenant_isolation_policy ON orders
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id', true));
```

Trước mỗi câu lệnh truy vấn từ NestJS, kết nối sẽ gửi kèm lệnh:
```sql
SET LOCAL app.current_tenant_id = 'tenant-uuid-1234';
```
Nếu có bất kỳ lỗ hổng nào trong mã nguồn cố tình truy vấn `SELECT * FROM orders WHERE id = 'ord-belong-to-other-tenant'`, PostgreSQL sẽ tự động trả về tập kết quả rỗng (0 dòng) mà không cần lập trình viên phải nhớ viết điều kiện WHERE.
