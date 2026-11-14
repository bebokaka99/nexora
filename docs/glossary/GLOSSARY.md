# Từ điển thuật ngữ hệ thống (Glossary)

> Trạng thái thông tin: `[CONFIRMED]` Từ điển chuẩn hóa nghĩa các thuật ngữ kỹ thuật và nghiệp vụ trong dự án NEXORA.

Tài liệu này định nghĩa chính xác ý nghĩa của các thuật ngữ chuyên ngành để đảm bảo sự thống nhất giữa đội ngũ phát triển, kiến trúc sư và khách hàng.

---

### Thuật ngữ nghiệp vụ bán lẻ và SaaS

- **Tenant (Doanh nghiệp thuê bao)**: Một tổ chức hoặc doanh nghiệp kinh doanh bán lẻ đăng ký sử dụng phần mềm NEXORA. Toàn bộ dữ liệu của một Tenant được cô lập và phân quyền độc lập với các Tenant khác.
- **Store (Cửa hàng / Điểm bán)**: Địa điểm bán hàng vật lý nơi khách hàng trực tiếp đến xem đồ gia dụng và thực hiện thanh toán tại quầy POS.
- **Warehouse (Kho hàng)**: Nơi lưu trữ vật lý của hàng hóa. Một cửa hàng có thể có một kho gắn liền (`STORE_ATTACHED`) hoặc sử dụng chung kho tổng (`CENTRAL`).
- **Product (Sản phẩm cha)**: Khái niệm đại diện chung cho một mặt hàng (Ví dụ: "Nồi chiên không dầu Lock&Lock 5.5L").
- **Product Variant (Biến thể sản phẩm)**: Mặt hàng thực tế cụ thể được định danh bằng mã SKU duy nhất, khác biệt về thông số như màu sắc, công suất hoặc kích thước (Ví dụ: "Nồi chiên không dầu 5.5L màu Đen").
- **SKU (Stock Keeping Unit)**: Mã định danh duy nhất của từng biến thể sản phẩm trong kho phục vụ kiểm kê hàng hóa.
- **Barcode (Mã vạch)**: Chuỗi mã số được in trên bao bì sản phẩm, cho phép máy quét tại quầy POS đọc nhanh thông tin biến thể.

---

### Thuật ngữ quản lý tồn kho

- **On-hand Quantity (`on_hand_qty` - Tồn thực tế)**: Tổng số lượng hàng hóa vật lý thực sự đang nằm trên kệ trong kho.
- **Committed Quantity (`committed_qty` - Hàng đang giữ)**: Số lượng hàng hóa đã có khách đặt qua kênh online (Shopee, TikTok, Facebook) nhưng chưa đóng gói xuất kho.
- **Available Quantity (`available_qty` - Tồn khả dụng)**: Số lượng hàng hóa còn lại thực sự có thể tiếp tục bán. Công thức tính: `available_qty = on_hand_qty - committed_qty`.
- **Overselling (Bán vượt tồn kho)**: Tình trạng bán nhiều hơn số lượng hàng thực tế có trong kho do tồn kho không được đồng bộ kịp thời giữa các kênh.

---

### Thuật ngữ kỹ thuật và kiến trúc

- **Modular Monolith**: Kiến trúc phần mềm trong đó toàn bộ hệ thống được đóng gói trong một ứng dụng duy nhất, nhưng mã nguồn được phân chia thành các Module có ranh giới dữ liệu và nghiệp vụ độc lập tuyệt đối.
- **Row-Level Security (RLS)**: Tính năng an toàn ở tầng cơ sở dữ liệu PostgreSQL cho phép tự động kiểm tra quyền và chỉ trả về các hàng dữ liệu khớp với `tenant_id` của phiên truy vấn hiện tại.
- **BullMQ**: Thư viện quản lý hàng đợi tác vụ chạy nền trên nền tảng Node.js, sử dụng Redis làm kho lưu trữ thông điệp.
- **Idempotency (Tính lũy đẳng)**: Tính chất của một thao tác hoặc hàm mà khi thực thi nhiều lần với cùng một tham số đầu vào vẫn cho ra cùng một kết quả cuối cùng mà không làm nhân bản dữ liệu.
- **VietQR**: Tiêu chuẩn định dạng mã phản hồi nhanh (QR Code) quốc gia phục vụ thanh toán chuyển khoản liên ngân hàng tự động tại Việt Nam.
