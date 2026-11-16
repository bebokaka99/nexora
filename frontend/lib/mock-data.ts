// =============================================================================
// NEXORA COMMERCE OS — MOCK DATA: THỰC TẾ CHUỖI ĐỒ GIA DỤNG (2 CỬA HÀNG & 3 SÀN)
// =============================================================================

export interface ProductItem {
  id: string;
  name: string;
  category: "noichien" | "chao" | "amsieutoc" | "mayxay" | "noicom" | "khac";
  categoryName: string;
  sku: string;
  barcode: string;
  brand: string;
  costPrice: number;
  sellingPrice: number;
  imageColor: string;
  stockStore1: number; // Kho Cửa Hàng 1 (Quận 1)
  stockStore2: number; // Kho Cửa Hàng 2 (Bình Thạnh)
  stockCentral?: number; // Kho Tổng Trung Tâm Tân Bình
  committed: number;   // Đang giữ cho đơn online
}

export interface OrderItem {
  id: string;
  customer: string;
  phone: string;
  address?: string;
  channel: "SHOPEE" | "TIKTOK" | "FACEBOOK" | "POS_STORE_1" | "POS_STORE_2";
  channelLabel: string;
  channelBadgeColor: string;
  items: {
    name: string;
    sku: string;
    qty: number;
    price: number;
  }[];
  totalAmount: number;
  discountAmount?: number;
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "COMPLETED" | "CANCELLED";
  statusLabel: string;
  statusColor: string;
  paymentStatus: "PAID" | "UNPAID" | "REFUNDED";
  paymentMethod: string;
  createdAt: string;
  timeline?: { time: string; event: string }[];
}

export interface ChannelConnectionItem {
  id: string;
  name: string;
  platform: "Shopee" | "TikTok Shop" | "Facebook" | "Lazada";
  accountName: string;
  accountId: string;
  status: "CONNECTED" | "WARNING" | "DISCONNECTED";
  statusLabel: string;
  lastSyncedAt: string;
  totalSyncedProducts: number;
  pendingOrders: number;
}

export interface ActivityEvent {
  id: string;
  time: string;
  type: "order" | "stock" | "chat" | "pos";
  title: string;
  description: string;
  tag: string;
  tagColor: string;
}

export interface StoreItem {
  id: string;
  name: string;
  address: string;
  phone: string;
  defaultWarehouse: string;
  todayRevenue: number;
  ordersCount: number;
  cashiers: string[];
}

export interface ConversationItem {
  id: string;
  customerName: string;
  avatarColor: string;
  platform: "Facebook" | "TikTok" | "Shopee";
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  status: "OPEN" | "RESOLVED";
  tag: string;
  tagColor: string;
  phone?: string;
  suggestedItems?: { name: string; sku: string; price: number }[];
}

export const MOCK_STORES: StoreItem[] = [
  {
    id: "store-1",
    name: "NEXORA Store — Chi Nhánh 1 (Quận 1)",
    address: "Số 142 Nguyễn Thị Minh Khai, P. Bến Nghé, Quận 1, TP. HCM",
    phone: "028 3822 1199",
    defaultWarehouse: "Kho Cửa Hàng 1 (Tại chỗ)",
    todayRevenue: 15400000,
    ordersCount: 12,
    cashiers: ["Nguyễn Lan (Ca sáng)", "Phạm Đức (Ca chiều)"],
  },
  {
    id: "store-2",
    name: "NEXORA Store — Chi Nhánh 2 (Bình Thạnh)",
    address: "Số 305 Bạch Đằng, Phường 15, Quận Bình Thạnh, TP. HCM",
    phone: "028 3511 8822",
    defaultWarehouse: "Kho Cửa Hàng 2 (Tại chỗ)",
    todayRevenue: 9800000,
    ordersCount: 8,
    cashiers: ["Võ Minh Anh (Ca sáng)", "Đặng Tuấn (Ca chiều)"],
  },
];

// -----------------------------------------------------------------------------
// 1. DANH MỤC SẢN PHẨM GIA DỤNG
// -----------------------------------------------------------------------------
export const MOCK_PRODUCTS: ProductItem[] = [
  {
    id: "PROD-01",
    name: "Nồi chiên không dầu điện tử Tefal 5.6L Easy Fry",
    category: "noichien",
    categoryName: "Nồi chiên không dầu",
    sku: "NCKD-TF-56L",
    barcode: "8938501230012",
    brand: "Tefal (Pháp)",
    costPrice: 1750000,
    sellingPrice: 2490000,
    imageColor: "from-amber-500 to-orange-600",
    stockStore1: 14,
    stockStore2: 8,
    stockCentral: 45,
    committed: 3,
  },
  {
    id: "PROD-02",
    name: "Nồi chiên không dầu Lock&Lock 5.2L EJF351BLK",
    category: "noichien",
    categoryName: "Nồi chiên không dầu",
    sku: "NCKD-LL-52L",
    barcode: "8938501230029",
    brand: "Lock&Lock",
    costPrice: 1390000,
    sellingPrice: 1950000,
    imageColor: "from-stone-700 to-slate-900",
    stockStore1: 8,
    stockStore2: 12,
    stockCentral: 35,
    committed: 4,
  },
  {
    id: "PROD-03",
    name: "Chảo xào chống dính Ceramic Elmich 28cm đáy từ",
    category: "chao",
    categoryName: "Chảo chống dính",
    sku: "CD-EM-28",
    barcode: "8938501230036",
    brand: "Elmich",
    costPrice: 240000,
    sellingPrice: 380000,
    imageColor: "from-teal-600 to-emerald-700",
    stockStore1: 22,
    stockStore2: 18,
    stockCentral: 60,
    committed: 2,
  },
  {
    id: "PROD-04",
    name: "Chảo chiên vân đá siêu bền Sunhouse 26cm",
    category: "chao",
    categoryName: "Chảo chống dính",
    sku: "CD-SH-26",
    barcode: "8938501230043",
    brand: "Sunhouse",
    costPrice: 165000,
    sellingPrice: 260000,
    imageColor: "from-zinc-700 to-stone-800",
    stockStore1: 30,
    stockStore2: 25,
    stockCentral: 80,
    committed: 5,
  },
  {
    id: "PROD-05",
    name: "Ấm siêu tốc thủy tinh Philips 1.7L LED HD9339",
    category: "amsieutoc",
    categoryName: "Ấm siêu tốc",
    sku: "AST-PL-17",
    barcode: "8938501230050",
    brand: "Philips",
    costPrice: 580000,
    sellingPrice: 890000,
    imageColor: "from-cyan-500 to-blue-600",
    stockStore1: 16,
    stockStore2: 10,
    stockCentral: 40,
    committed: 2,
  },
  {
    id: "PROD-06",
    name: "Ấm siêu tốc Inox 304 Sunhouse 1.8L giữ nhiệt 2 lớp",
    category: "amsieutoc",
    categoryName: "Ấm siêu tốc",
    sku: "AST-SH-18",
    barcode: "8938501230067",
    brand: "Sunhouse",
    costPrice: 195000,
    sellingPrice: 320000,
    imageColor: "from-slate-400 to-slate-600",
    stockStore1: 25,
    stockStore2: 20,
    stockCentral: 55,
    committed: 3,
  },
  {
    id: "PROD-07",
    name: "Máy xay sinh tố đa năng Sunhouse 3 cối thủy tinh",
    category: "mayxay",
    categoryName: "Máy xay sinh tố",
    sku: "MXST-3C-WHT",
    barcode: "8938501230074",
    brand: "Sunhouse",
    costPrice: 420000,
    sellingPrice: 690000,
    imageColor: "from-sky-400 to-indigo-500",
    stockStore1: 9,
    stockStore2: 7,
    stockCentral: 25,
    committed: 1,
  },
  {
    id: "PROD-08",
    name: "Máy xay cầm tay Braun MultiQuick 5 1000W",
    category: "mayxay",
    categoryName: "Máy xay sinh tố",
    sku: "MX-BR-MQ",
    barcode: "8938501230081",
    brand: "Braun (Đức)",
    costPrice: 1150000,
    sellingPrice: 1650000,
    imageColor: "from-blue-600 to-slate-800",
    stockStore1: 4,
    stockStore2: 3,
    stockCentral: 18,
    committed: 2,
  },
  {
    id: "PROD-09",
    name: "Nồi cơm điện cao tần Cuckoo 1.8L CRP-PK1000S",
    category: "noicom",
    categoryName: "Nồi cơm điện",
    sku: "NC-CK-18L",
    barcode: "8938501230098",
    brand: "Cuckoo (Hàn Quốc)",
    costPrice: 2450000,
    sellingPrice: 3490000,
    imageColor: "from-red-600 to-rose-700",
    stockStore1: 5,
    stockStore2: 4,
    stockCentral: 15,
    committed: 1,
  },
  {
    id: "PROD-10",
    name: "Nồi cơm điện tử nắp gài Panasonic 1.8L SR-CL188",
    category: "noicom",
    categoryName: "Nồi cơm điện",
    sku: "NC-PN-18L",
    barcode: "8938501230104",
    brand: "Panasonic",
    costPrice: 920000,
    sellingPrice: 1390000,
    imageColor: "from-neutral-600 to-zinc-800",
    stockStore1: 12,
    stockStore2: 9,
    committed: 2,
  },
  {
    id: "PROD-11",
    name: "Bếp từ đơn cảm ứng Bluestone ICB-6617 tặng chảo",
    category: "khac",
    categoryName: "Thiết bị bếp khác",
    sku: "BT-BS-2100",
    barcode: "8938501230111",
    brand: "Bluestone",
    costPrice: 650000,
    sellingPrice: 990000,
    imageColor: "from-blue-700 to-cyan-800",
    stockStore1: 7,
    stockStore2: 6,
    committed: 2,
  },
  {
    id: "PROD-12",
    name: "Lò vi sóng cơ có nướng Sharp 20L R-G222VN-S",
    category: "khac",
    categoryName: "Thiết bị bếp khác",
    sku: "LVS-SP-20L",
    barcode: "8938501230128",
    brand: "Sharp",
    costPrice: 1280000,
    sellingPrice: 1790000,
    imageColor: "from-slate-600 to-zinc-900",
    stockStore1: 3,
    stockStore2: 2,
    committed: 1,
  },
];

// -----------------------------------------------------------------------------
// 2. DANH SÁCH ĐƠN HÀNG MẪU ĐA KÊNH
// -----------------------------------------------------------------------------
export const MOCK_ORDERS: OrderItem[] = [
  {
    id: "ORD-SP-9821",
    customer: "Trần Minh Tuấn",
    phone: "0912 345 678",
    address: "Số 45, Đường Lê Duẩn, P. Bến Nghé, Quận 1, TP. HCM",
    channel: "SHOPEE",
    channelLabel: "Shopee Mall",
    channelBadgeColor: "bg-amber-100 text-amber-800 border-amber-300",
    items: [
      { name: "Nồi chiên không dầu Tefal 5.6L Easy Fry", sku: "NCKD-TF-56L", qty: 1, price: 2490000 },
    ],
    totalAmount: 2490000,
    discountAmount: 100000,
    status: "CONFIRMED",
    statusLabel: "Đã xác nhận",
    statusColor: "bg-blue-100 text-blue-800 border-blue-200",
    paymentStatus: "PAID",
    paymentMethod: "Shopee Pay (Ví điện tử)",
    createdAt: "Hôm nay 10:45",
    timeline: [
      { time: "10:45", event: "Đơn hàng phát sinh từ Shopee, đồng bộ qua Webhook" },
      { time: "10:46", event: "Hệ thống tự động giữ 1 tồn kho khả dụng tại Kho 1" },
      { time: "10:50", event: "Nhân viên xác nhận đơn và in phiếu nhặt hàng" },
    ],
  },
  {
    id: "POS-CN1-0422",
    customer: "Khách lẻ tại quầy",
    phone: "0988 777 666",
    channel: "POS_STORE_1",
    channelLabel: "POS — Chi Nhánh 1 (Q.1)",
    channelBadgeColor: "bg-purple-100 text-purple-800 border-purple-300",
    items: [
      { name: "Chảo xào chống dính Ceramic Elmich 28cm", sku: "CD-EM-28", qty: 2, price: 380000 },
    ],
    totalAmount: 760000,
    discountAmount: 0,
    status: "COMPLETED",
    statusLabel: "Hoàn tất tại quầy",
    statusColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    paymentStatus: "PAID",
    paymentMethod: "Chuyển khoản VietQR",
    createdAt: "Hôm nay 10:30",
    timeline: [
      { time: "10:28", event: "Thu ngân quét mã Barcode 8938501230036" },
      { time: "10:29", event: "Khách quét mã VietQR chuyển 760.000 ₫" },
      { time: "10:30", event: "Nhận biến động số dư, in hóa đơn và trừ tồn kho Q.1" },
    ],
  },
  {
    id: "ORD-TT-4319",
    customer: "Lê Thị Thanh Mai",
    phone: "0909 888 999",
    address: "Chung cư Vinhomes Central Park, P. 22, Bình Thạnh, TP. HCM",
    channel: "TIKTOK",
    channelLabel: "TikTok Shop",
    channelBadgeColor: "bg-sky-100 text-sky-800 border-sky-300",
    items: [
      { name: "Ấm siêu tốc thủy tinh Philips 1.7L LED", sku: "AST-PL-17", qty: 1, price: 890000 },
    ],
    totalAmount: 890000,
    discountAmount: 50000,
    status: "PROCESSING",
    statusLabel: "Đang đóng gói",
    statusColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
    paymentStatus: "PAID",
    paymentMethod: "TikTok ZaloPay",
    createdAt: "Hôm nay 09:15",
    timeline: [
      { time: "09:15", event: "Đơn hàng từ TikTok Shop Live Session" },
      { time: "09:20", event: "Nhân viên kho in phiếu đóng gói" },
    ],
  },
  {
    id: "ORD-FB-1045",
    customer: "Nguyễn Hoàng Nam",
    phone: "0977 123 456",
    address: "128 Đường Xô Viết Nghệ Tĩnh, P. 21, Bình Thạnh, TP. HCM",
    channel: "FACEBOOK",
    channelLabel: "Facebook Chat",
    channelBadgeColor: "bg-blue-100 text-blue-800 border-blue-300",
    items: [
      { name: "Nồi chiên không dầu Lock&Lock 5.2L", sku: "NCKD-LL-52L", qty: 1, price: 1950000 },
    ],
    totalAmount: 1950000,
    discountAmount: 0,
    status: "SHIPPED",
    statusLabel: "Đang giao hàng",
    statusColor: "bg-amber-100 text-amber-800 border-amber-200",
    paymentStatus: "UNPAID",
    paymentMethod: "COD (Thu tiền khi nhận hàng)",
    createdAt: "Hôm nay 08:40",
    timeline: [
      { time: "08:35", event: "Khách chốt đơn qua Facebook Messenger" },
      { time: "08:40", event: "Tạo đơn nhanh từ khung chat" },
      { time: "09:30", event: "Bàn giao kiện hàng cho shipper GHTK" },
    ],
  },
  {
    id: "POS-CN2-0198",
    customer: "Vũ Đình Trọng",
    phone: "0934 111 222",
    channel: "POS_STORE_2",
    channelLabel: "POS — Chi Nhánh 2 (Bình Thạnh)",
    channelBadgeColor: "bg-purple-100 text-purple-800 border-purple-300",
    items: [
      { name: "Máy xay sinh tố đa năng Sunhouse 3 cối", sku: "MXST-3C-WHT", qty: 1, price: 690000 },
    ],
    totalAmount: 690000,
    discountAmount: 0,
    status: "COMPLETED",
    statusLabel: "Hoàn tất tại quầy",
    statusColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    paymentStatus: "PAID",
    paymentMethod: "Tiền mặt",
    createdAt: "Hôm nay 08:20",
    timeline: [
      { time: "08:20", event: "Thanh toán tiền mặt thành công tại Quầy POS 2" },
    ],
  },
];

// -----------------------------------------------------------------------------
// 3. DANH SÁCH KÊNH BÁN HÀNG
// -----------------------------------------------------------------------------
export const MOCK_CHANNELS: ChannelConnectionItem[] = [
  {
    id: "CH-01",
    name: "Shopee Mall Gia Dụng Cao Cấp",
    platform: "Shopee",
    accountName: "nexora_home_official",
    accountId: "shopee_vn_94821",
    status: "CONNECTED",
    statusLabel: "Đang kết nối bình thường",
    lastSyncedAt: "2 phút trước",
    totalSyncedProducts: 45,
    pendingOrders: 14,
  },
  {
    id: "CH-02",
    name: "TikTok Shop Siêu Thị Gia Dụng",
    platform: "TikTok Shop",
    accountName: "nexora.vietnam",
    accountId: "tts_vn_30219",
    status: "CONNECTED",
    statusLabel: "Đang kết nối bình thường",
    lastSyncedAt: "Vừa xong",
    totalSyncedProducts: 38,
    pendingOrders: 9,
  },
  {
    id: "CH-03",
    name: "Fanpage NEXORA — Đồ Gia Dụng Thông Minh",
    platform: "Facebook",
    accountName: "nexora.vietnam.page",
    accountId: "fb_page_102938475",
    status: "CONNECTED",
    statusLabel: "Đang kết nối bình thường",
    lastSyncedAt: "5 phút trước",
    totalSyncedProducts: 45,
    pendingOrders: 6,
  },
  {
    id: "CH-04",
    name: "Gian Hàng Lazada LazMall",
    platform: "Lazada",
    accountName: "nexora_home_laz",
    accountId: "laz_vn_88102",
    status: "WARNING",
    statusLabel: "Token ủy quyền sắp hết hạn (còn 2 ngày)",
    lastSyncedAt: "3 giờ trước",
    totalSyncedProducts: 30,
    pendingOrders: 0,
  },
];

// -----------------------------------------------------------------------------
// 4. BẢNG TIN HOẠT ĐỘNG TRỰC TIẾP (ACTIVITY STREAM)
// -----------------------------------------------------------------------------
export const MOCK_ACTIVITIES: ActivityEvent[] = [
  {
    id: "ACT-01",
    time: "10:45",
    type: "order",
    title: "Đơn hàng mới từ Shopee Mall",
    description: "Khách hàng Trần Minh Tuấn vừa đặt 1x Nồi chiên không dầu Tefal 5.6L (2.490.000 ₫).",
    tag: "Shopee",
    tagColor: "bg-amber-100 text-amber-800",
  },
  {
    id: "ACT-02",
    time: "10:30",
    type: "pos",
    title: "Thanh toán thành công tại Quầy POS 1 (Quận 1)",
    description: "Hóa đơn POS-CN1-0422 trị giá 760.000 ₫ đã thanh toán qua VietQR. Trừ 2 chảo Elmich tồn kho.",
    tag: "POS CN1",
    tagColor: "bg-purple-100 text-purple-800",
  },
  {
    id: "ACT-03",
    time: "10:15",
    type: "stock",
    title: "Đồng bộ tồn kho đa kênh thành công",
    description: "Đã cập nhật số lượng tồn khả dụng của 12 SKU gia dụng lên Shopee và TikTok Shop sau biến động kho.",
    tag: "Sync Engine",
    tagColor: "bg-emerald-100 text-emerald-800",
  },
  {
    id: "ACT-04",
    time: "09:40",
    type: "chat",
    title: "Khách hỏi tư vấn trên Facebook Messenger",
    description: "Khách hàng Nguyễn Hoàng Nam đang hỏi về dung tích nồi chiên Lock&Lock 5.2L tại chi nhánh Bình Thạnh.",
    tag: "Facebook",
    tagColor: "bg-blue-100 text-blue-800",
  },
];

// -----------------------------------------------------------------------------
// 5. CUỘC TRÒ CHUYỆN HỘI THOẠI (UNIFIED INBOX)
// -----------------------------------------------------------------------------
export const MOCK_CONVERSATIONS: ConversationItem[] = [
  {
    id: "CONV-01",
    customerName: "Nguyễn Hoàng Nam",
    avatarColor: "bg-blue-600",
    platform: "Facebook",
    lastMessage: "Shop ơi nồi chiên Lock&Lock 5.2L này bên chi nhánh Bình Thạnh còn hàng sẵn không?",
    lastTime: "10:40",
    unreadCount: 1,
    status: "OPEN",
    tag: "Hỏi tồn kho",
    tagColor: "bg-blue-100 text-blue-800",
    phone: "0977 123 456",
    suggestedItems: [
      { name: "Nồi chiên không dầu Lock&Lock 5.2L", sku: "NCKD-LL-52L", price: 1950000 },
    ],
  },
  {
    id: "CONV-02",
    customerName: "Lê Thúy Hằng",
    avatarColor: "bg-sky-600",
    platform: "TikTok",
    lastMessage: "Ấm siêu tốc thủy tinh Philips có được bảo hành chính hãng 24 tháng không shop?",
    lastTime: "10:12",
    unreadCount: 0,
    status: "OPEN",
    tag: "Hỏi bảo hành",
    tagColor: "bg-purple-100 text-purple-800",
    phone: "0908 555 444",
    suggestedItems: [
      { name: "Ấm siêu tốc thủy tinh Philips 1.7L LED", sku: "AST-PL-17", price: 890000 },
    ],
  },
  {
    id: "CONV-03",
    customerName: "Phạm Quốc Bảo",
    avatarColor: "bg-amber-600",
    platform: "Shopee",
    lastMessage: "Đơn hàng ORD-SP-9821 của mình dự kiến bao giờ shipper giao tới nơi vậy?",
    lastTime: "09:30",
    unreadCount: 0,
    status: "RESOLVED",
    tag: "Tra cứu vận đơn",
    tagColor: "bg-slate-100 text-slate-700",
    phone: "0918 222 333",
  },
];
