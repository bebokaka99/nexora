# Danh Mục Yêu Cầu Chức Năng — Functional Requirements

> Trạng thái thông tin: `[CONFIRMED]` cho nghiệp vụ bán lẻ và kết nối sàn | `[PROPOSED]` cho các tính năng SaaS chuẩn hóa.

Mỗi yêu cầu chức năng (FR) được mô tả theo cấu trúc chuẩn: **ID**, **Tên yêu cầu**, **Mô tả**, **Độ ưu tiên (Priority)**, **Trạng thái**, và **Quy tắc nghiệp vụ liên quan (BR)**.

---

## 1. Phân Hệ Xác Thực & Phân Quyền (Authentication & Authorization)

| ID | Tên Yêu Cầu | Mô Tả Nghiệp Vụ | Ưu Tiên | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- |
| `FR-AUTH-001` | Đăng nhập tài khoản | Cho phép người dùng đăng nhập bằng Email và Mật khẩu; trả về Access Token (JWT) và Refresh Token an toàn. | `CRITICAL` | `[CONFIRMED]` |
| `FR-AUTH-002` | Làm mới phiên (Refresh Token) | Tự động cấp Access Token mới khi token cũ hết hạn mà không làm gián đoạn trải nghiệm người dùng; hỗ trợ Refresh Token Rotation. | `HIGH` | `[PROPOSED]` |
| `FR-AUTH-003` | Đăng xuất an toàn | Hủy hiệu lực của Refresh Token trên máy chủ (Redis blacklist) và xóa bỏ token tại máy khách. | `HIGH` | `[PROPOSED]` |
| `FR-AUTH-004` | Quản trị vai trò (Role Management) | Cho phép Tenant Admin tạo, sửa, xóa các vai trò tùy chỉnh và gán danh mục quyền hạn (Permissions) cụ thể. | `HIGH` | `[PROPOSED]` |
| `FR-AUTH-005` | Kiểm soát truy cập RBAC | Hệ thống chặn các thao tác API và ẩn các nút bấm giao diện nếu người dùng không có quyền tương ứng. | `CRITICAL` | `[CONFIRMED]` |

---

## 2. Phân Hệ Quản Trị SaaS & Doanh Nghiệp (SaaS Management)

| ID | Tên Yêu Cầu | Mô Tả Nghiệp Vụ | Ưu Tiên | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- |
| `FR-TENANT-001` | Khởi tạo doanh nghiệp (Tenant Registration) | Cho phép đăng ký một Tenant mới, thiết lập subdomain/slug duy nhất, tên doanh nghiệp và tài khoản quản trị đầu tiên. | `HIGH` | `[PROPOSED]` |
| `FR-TENANT-002` | Quản lý thông tin Tenant | Cập nhật tên công ty, số điện thoại, địa chỉ trụ sở, mã số thuế và logo hiển thị trên hóa đơn. | `MEDIUM` | `[PROPOSED]` |
| `FR-TENANT-003` | Quản lý gói thuê bao (Subscriptions) | Theo dõi gói cước hiện tại, ngày bắt đầu, ngày hết hạn và lịch sử gia hạn của Tenant. | `HIGH` | `[PROPOSED]` |
| `FR-TENANT-004` | Khóa/Mở tài khoản Tenant | Platform Super Admin có quyền khóa quyền truy cập của một Tenant khi vi phạm điều khoản hoặc quá hạn thanh toán. | `HIGH` | `[PROPOSED]` |

---

## 3. Phân Hệ Quản Trị Chi Nhánh & Kho Hàng (Store & Warehouse Management)

| ID | Tên Yêu Cầu | Mô Tả Nghiệp Vụ | Ưu Tiên | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- |
| `FR-STORE-001` | Quản lý cửa hàng (Store Management) | Cho phép khai báo danh sách cửa hàng vật lý (mặc định 2 cửa hàng cho khách hàng khởi đầu), gán địa chỉ và người phụ trách. | `CRITICAL` | `[CONFIRMED]` |
| `FR-STORE-002` | Thiết lập điểm bán (POS Register) | Khai báo máy thu ngân/quầy thu ngân tại từng cửa hàng để theo dõi dòng tiền mặt đầu ca/cuối ca. | `MEDIUM` | `[PROPOSED]` |
| `FR-WH-001` | Quản lý kho hàng (Warehouse Management) | Khai báo các kho hàng độc lập hoặc kho gắn liền với từng cửa hàng để theo dõi số lượng tồn. | `CRITICAL` | `[CONFIRMED]` |
| `FR-WH-002` | Điều chuyển hàng giữa các kho (Stock Transfer) | Tạo phiếu chuyển kho giữa Kho Tổng và 2 Cửa hàng, hỗ trợ trạng thái: Chờ duyệt -> Đang chuyển -> Đã nhận. | `HIGH` | `[CONFIRMED]` |

---

## 4. Phân Hệ Quản Trị Sản Phẩm & Tồn Kho (Product & Inventory)

| ID | Tên Yêu Cầu | Mô Tả Nghiệp Vụ | Ưu Tiên | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- |
| `FR-PROD-001` | Quản lý sản phẩm & biến thể | Tạo sản phẩm đơn lẻ hoặc sản phẩm có nhiều biến thể (ví dụ: Nồi chiên không dầu dung tích 5L, 7L; màu Đen, Bạc). | `CRITICAL` | `[CONFIRMED]` |
| `FR-PROD-002` | Quản lý mã SKU & Barcode | Mỗi biến thể sở hữu một mã SKU duy nhất và mã vạch (Barcode) phục vụ quét tại quầy POS. | `CRITICAL` | `[CONFIRMED]` |
| `FR-PROD-003` | Quản lý danh mục & thương hiệu | Phân cấp danh mục sản phẩm đồ gia dụng (Nhà bếp, Phòng khách, Thiết bị điện tử). | `MEDIUM` | `[CONFIRMED]` |
| `FR-INV-001` | Theo dõi tồn kho đa kho | Xem số lượng tồn thực tế (On-hand), số lượng đang giao dịch (Committed), và số lượng sẵn sàng bán (Available) tại từng kho. | `CRITICAL` | `[CONFIRMED]` |
| `FR-INV-002` | Nhập kho từ nhà cung cấp | Tạo phiếu nhập hàng kèm số lượng, giá vốn sản phẩm, tính toán giá vốn bình quân gia quyền. | `HIGH` | `[CONFIRMED]` |
| `FR-INV-003` | Cảnh báo tồn kho dưới định mức | Cảnh báo màu vàng/đỏ khi số lượng tồn của một món hàng giảm xuống dưới ngưỡng an toàn thiết lập. | `MEDIUM` | `[PROPOSED]` |

---

## 5. Phân Hệ Bán Hàng Tại Quầy (Point of Sale - POS)

| ID | Tên Yêu Cầu | Mô Tả Nghiệp Vụ | Ưu Tiên | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- |
| `FR-POS-001` | Màn hình bán hàng siêu tốc | Tìm sản phẩm bằng cách quét barcode hoặc gõ ký tự; hiển thị danh sách giỏ hàng và tổng tiền tức thì. | `CRITICAL` | `[CONFIRMED]` |
| `FR-POS-002` | Thanh toán đa hình thức | Hỗ trợ tiền mặt, chuyển khoản ngân hàng (hiển thị mã VietQR động theo đơn) hoặc thanh toán kết hợp. | `CRITICAL` | `[CONFIRMED]` |
| `FR-POS-003` | In hóa đơn bán lẻ | Tự động định dạng và in phiếu thu qua máy in nhiệt chuẩn khổ giấy 80mm hoặc 58mm. | `CRITICAL` | `[CONFIRMED]` |
| `FR-POS-004` | Quản lý ca thu ngân | Bắt đầu ca nhập số dư đầu, kết thúc ca kiểm đếm tiền mặt thực tế và đối soát chênh lệch. | `HIGH` | `[PROPOSED]` |

---

## 6. Phân Hệ Đồng Bộ Đa Kênh (Omnichannel Sync)

| ID | Tên Yêu Cầu | Mô Tả Nghiệp Vụ | Ưu Tiên | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- |
| `FR-OMNI-001` | Kết nối tài khoản sàn TMĐT | Cho phép ủy quyền liên kết tài khoản bán hàng Shopee và TikTok Shop thông qua quy trình chuẩn OAuth 2.0. | `CRITICAL` | `[CONFIRMED]` |
| `FR-OMNI-002` | Đồng bộ đơn hàng tự động | Hứng Webhook từ Shopee và TikTok Shop, tự động tạo đơn hàng tương ứng trên NEXORA trong vòng 30 giây. | `CRITICAL` | `[CONFIRMED]` |
| `FR-OMNI-003` | Khấu trừ tồn kho tự động | Khi phát sinh đơn hàng từ bất kỳ kênh nào, tồn kho tại kho được chỉ định tự động giảm ngay lập tức. | `CRITICAL` | `[CONFIRMED]` |
| `FR-OMNI-004` | Cập nhật số lượng tồn lên sàn | Khi tồn kho tại NEXORA thay đổi (do bán tại cửa hàng hoặc nhập thêm), hệ thống đẩy số lượng mới lên Shopee và TikTok. | `HIGH` | `[CONFIRMED]` |
| `FR-OMNI-005` | Ghép nối SKU sàn (SKU Mapping) | Cung cấp giao diện ánh xạ giữa mã SKU trên Shopee/TikTok với mã SKU gốc trên hệ thống NEXORA. | `CRITICAL` | `[CONFIRMED]` |

---

## 7. Phân Hệ Hộp Thư Hội Thoại & Chốt Đơn (Conversation & Social Commerce)

| ID | Tên Yêu Cầu | Mô Tả Nghiệp Vụ | Ưu Tiên | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- |
| `FR-CONV-001` | Kết nối Fanpage Facebook | Liên kết một hoặc nhiều Fanpage Facebook qua Meta Graph API để tiếp nhận tin nhắn và bình luận. | `CRITICAL` | `[CONFIRMED]` |
| `FR-CONV-002` | Hộp thư tập trung (Unified Inbox) | Hiển thị toàn bộ tin nhắn từ Facebook Messenger và TikTok Shop trên một danh sách thời gian thực. | `CRITICAL` | `[CONFIRMED]` |
| `FR-CONV-003` | Phân công xử lý hội thoại | Trưởng nhóm có thể phân công hội thoại cho nhân viên trực chat hoặc hệ thống phân bổ luân phiên (Round-robin). | `HIGH` | `[CONFIRMED]` |
| `FR-CONV-004` | Tạo đơn hàng ngay trong ô chat | Cửa sổ bên phải hiển thị giỏ hàng: nhân viên chọn sản phẩm, nhập tên/SĐT/địa chỉ của khách và bấm tạo đơn tức thì. | `CRITICAL` | `[CONFIRMED]` |
| `FR-CONV-005` | Tin nhắn mẫu phản hồi nhanh | Cung cấp kho mẫu tin nhắn (Quick Replies) để nhân viên trả lời nhanh các câu hỏi thường gặp về giá, phí ship, bảo hành. | `MEDIUM` | `[PROPOSED]` |

---

## 8. Phân Hệ Báo Cáo Phân Tích (Business Intelligence)

| ID | Tên Yêu Cầu | Mô Tả Nghiệp Vụ | Ưu Tiên | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- |
| `FR-BI-001` | Dashboard tổng quan thời gian thực | Biểu đồ doanh thu hôm nay, số đơn hàng mới, số lượng khách tại cửa hàng, doanh thu theo từng kênh bán. | `CRITICAL` | `[CONFIRMED]` |
| `FR-BI-002` | Báo cáo doanh thu & lợi nhuận | Thống kê doanh thu theo ngày/tuần/tháng, trừ giá vốn hàng bán và ước tính phí hoa hồng sàn TMĐT. | `HIGH` | `[CONFIRMED]` |
| `FR-BI-003` | Báo cáo tốc độ luân chuyển tồn kho | Thống kê top sản phẩm bán chạy nhất, sản phẩm tồn kho lâu ngày không phát sinh giao dịch. | `HIGH` | `[CONFIRMED]` |
| `FR-BI-004` | Báo cáo hiệu suất nhân viên | Đánh giá doanh số chốt được của từng nhân viên thu ngân và nhân viên trực chat. | `MEDIUM` | `[CONFIRMED]` |
