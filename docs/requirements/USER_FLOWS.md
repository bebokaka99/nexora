# Sơ Đồ Luồng Người Dùng — Core User Flows

> Trạng thái thông tin: `[CONFIRMED]` cho luồng bán hàng & chat chốt đơn | `[PROPOSED]` cho luồng đồng bộ đa kênh.

Tài liệu này trực quan hóa các luồng thao tác cốt lõi của người dùng và hệ thống bằng sơ đồ Mermaid.

---

## 1. Luồng Bán Hàng Tại Quầy POS (In-Store Checkout Flow)

Luồng thao tác của nhân viên thu ngân tại 2 cửa hàng đồ gia dụng:

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Khách Hàng Tại Cửa Hàng
    actor Cashier as Thu Ngân (POS)
    participant POS as NEXORA POS UI
    participant Backend as NestJS Backend
    participant DB as PostgreSQL DB
    participant Printer as Máy In Hóa Đơn

    Customer->>Cashier: Đưa sản phẩm gia dụng cần mua
    Cashier->>POS: Quét mã vạch (Barcode) hoặc gõ SKU
    POS->>POS: Cập nhật danh sách giỏ hàng & tính tổng tiền
    Cashier->>Customer: Báo tổng tiền, hỏi phương thức thanh toán
    alt Thanh toán Chuyển khoản (VietQR)
        Cashier->>POS: Chọn Chuyển khoản VietQR
        POS->>Backend: Yêu cầu sinh mã VietQR động theo đơn
        Backend-->>POS: Trả về mã QR kèm cú pháp chuyển khoản
        Customer->>Customer: Quét mã QR thanh toán trên Mobile App
        Cashier->>POS: Xác nhận đã nhận tiền
    else Thanh toán Tiền mặt
        Cashier->>POS: Nhập số tiền khách đưa
        POS->>POS: Tính tiền thừa trả lại
    end
    Cashier->>POS: Bấm "Hoàn tất đơn hàng"
    POS->>Backend: Gửi yêu cầu tạo đơn (Create Order API)
    Backend->>DB: Ghi đơn hàng, trừ tồn kho tại Cửa hàng tương ứng (Transaction)
    DB-->>Backend: Thành công
    Backend-->>POS: Trả về kết quả hoàn tất đơn
    POS->>Printer: Lệnh in hóa đơn bán lẻ (80mm)
    Printer-->>Customer: Nhận hóa đơn bán lẻ
```

---

## 2. Luồng Xử Lý Hội Thoại & Chốt Đơn Trực Tiếp (Chat-to-Order Flow)

Luồng thao tác của nhân viên trực Fanpage / TikTok Shop:

```mermaid
sequenceDiagram
    autonumber
    actor Buyer as Khách Hàng Trực Tuyến
    participant Meta as Facebook / TikTok API
    participant Webhook as NEXORA Webhook Receiver
    participant Socket as Socket.IO Gateway
    actor Agent as Nhân Viên Trực Chat
    participant UI as NEXORA Unified Inbox
    participant Backend as NestJS Order Service

    Buyer->>Meta: Gửi tin nhắn hỏi mua Nồi chiên không dầu
    Meta->>Webhook: Bắn Webhook payload tin nhắn mới
    Webhook->>Socket: Phát sự kiện realtime `new_message`
    Socket-->>UI: Cập nhật tin nhắn lên màn hình hộp thư tập trung
    Agent->>UI: Mở cuộc hội thoại, trả lời tư vấn giá và bảo hành
    Buyer->>Agent: Đồng ý mua, cung cấp Tên + SĐT + Địa chỉ
    Agent->>UI: Thao tác trên khung "Tạo Đơn Nhanh" bên phải ô chat:
    Note over Agent,UI: Chọn sản phẩm -> Hệ thống báo còn tồn kho -> Điền địa chỉ khách
    Agent->>UI: Bấm nút "Tạo Đơn Hàng"
    UI->>Backend: Gửi yêu cầu tạo đơn hàng từ kênh Social
    Backend->>Backend: Trừ tồn kho tạm giữ (Hold Stock)
    Backend-->>UI: Đơn hàng tạo thành công (Mã đơn: #ORD-XXXX)
    UI->>Meta: Tự động gửi tin nhắn xác nhận đơn kèm mã đơn cho khách qua chat
    Meta-->>Buyer: Nhận tin nhắn xác nhận đơn hàng thành công
```

---

## 3. Luồng Đồng Bộ Đơn Hàng Sàn TMĐT (Shopee / TikTok Shop Sync Flow)

Luồng xử lý tự động khi có đơn hàng mới phát sinh trên sàn thương mại điện tử:

```mermaid
sequenceDiagram
    autonumber
    participant Platform as Shopee / TikTok Shop
    participant Gateway as NEXORA Webhook Gateway
    participant Queue as BullMQ (Order Sync Queue)
    participant Worker as Background Sync Worker
    participant DB as PostgreSQL
    participant SyncJob as BullMQ (Inventory Update Queue)

    Platform->>Gateway: Gửi Webhook thông báo đơn hàng mới phát sinh
    Gateway->>Gateway: Xác thực chữ ký điện tử (Signature Verification)
    Gateway->>Queue: Đẩy đơn hàng vào hàng đợi (Enqueue Job)
    Gateway-->>Platform: Trả về HTTP 200 OK ngay lập tức (< 2s)
    
    Queue->>Worker: Worker nhận job xử lý đơn hàng
    Worker->>Worker: Ánh xạ mã SKU sàn với SKU hệ thống NEXORA
    Worker->>DB: Bắt đầu Database Transaction:
    Note over Worker,DB: 1. Tạo đơn hàng mới trạng thái "Chờ đóng gói"<br/>2. Trừ số lượng tồn kho khả dụng tại Kho được phân bổ
    DB-->>Worker: Transaction Commit thành công
    
    Worker->>SyncJob: Kích hoạt Job đồng bộ số lượng tồn mới lên các kênh khác
    SyncJob-->>Platform: Cập nhật tồn kho khả dụng mới sang các kênh còn lại
```
