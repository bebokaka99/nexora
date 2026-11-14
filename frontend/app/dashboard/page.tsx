"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { DarkModeToggle } from "@/components/dark-mode-toggle";
import {
  Layers,
  LayoutDashboard,
  ShoppingBag,
  Package,
  Boxes,
  MessageSquare,
  Globe2,
  Store,
  Users,
  Settings,
  Bell,
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Printer,
  Barcode,
  RefreshCw,
  Eye,
  X,
  CreditCard,
  QrCode,
  MapPin,
  Truck,
  Phone,
  Mail,
  UserCheck,
  Trash2,
  ArrowLeftRight,
  Check,
  Minus,
  ShoppingCart,
  Receipt,
  Sparkles,
  LogOut,
  Loader2,
  Building2
} from "lucide-react";
import {
  MOCK_PRODUCTS,
  MOCK_ORDERS,
  MOCK_CHANNELS,
  MOCK_ACTIVITIES,
  MOCK_CONVERSATIONS,
  MOCK_STORES,
  ProductItem,
  OrderItem,
  ChannelConnectionItem,
  ActivityEvent,
  ConversationItem,
  StoreItem
} from "@/lib/mock-data";
import {
  storeService,
  Store as StoreEntity,
  Warehouse as WarehouseEntity,
} from "@/lib/services/store-service";

// =============================================================================
// MAIN COMPONENT: INTERACTIVE DASHBOARD DEMO
// =============================================================================

export default function DashboardDemoPage() {
  const router = useRouter();
  const { user, tenant, isAuthenticated, isLoading, logout } = useAuth();

  // Route Guard: Tự động chuyển hướng về trang đăng nhập nếu chưa xác thực
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/dang-nhap?redirect=/quan-tri");
    }
  }, [isLoading, isAuthenticated, router]);

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<
    "overview" | "pos" | "orders" | "products" | "inventory" | "chat" | "channels" | "stores"
  >("overview");

  // Dynamic Live State (simulates local real-time mutations)
  const [products, setProducts] = useState<ProductItem[]>(MOCK_PRODUCTS);
  const [orders, setOrders] = useState<OrderItem[]>(MOCK_ORDERS);
  const [channels, setChannels] = useState<ChannelConnectionItem[]>(MOCK_CHANNELS);
  const [activities, setActivities] = useState<ActivityEvent[]>(MOCK_ACTIVITIES);

  // Modals & Drawers state
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [selectedConv, setSelectedConv] = useState<ConversationItem>(MOCK_CONVERSATIONS[0]);
  const [chatMessage, setChatMessage] = useState("");
  const [showOrderDrawer, setShowOrderDrawer] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Syncing simulation
  const [isSyncingChannels, setIsSyncingChannels] = useState(false);

  // ---------------------------------------------------------------------------
  // STORES & WAREHOUSES STATE (TASK-004)
  // ---------------------------------------------------------------------------
  const [stores, setStores] = useState<StoreEntity[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseEntity[]>([]);
  const [isStoresLoading, setIsStoresLoading] = useState(false);
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [isSubmittingStore, setIsSubmittingStore] = useState(false);
  const [addStoreError, setAddStoreError] = useState<string | null>(null);
  const [newStoreForm, setNewStoreForm] = useState({
    name: "",
    code: "",
    address: "",
    phoneNumber: "",
    defaultWarehouseId: "",
  });

  const fetchStoresAndWarehouses = async () => {
    setIsStoresLoading(true);
    try {
      const [stData, whData] = await Promise.all([
        storeService.getStores(),
        storeService.getWarehouses(),
      ]);

      const enrichedStores = stData.map((st, idx) => ({
        ...st,
        todayRevenue: st.todayRevenue ?? (idx === 0 ? 15400000 : idx === 1 ? 9800000 : 4200000),
        ordersCount: st.ordersCount ?? (idx === 0 ? 12 : idx === 1 ? 8 : 4),
        cashiers: st.cashiers ?? ["Nhân viên trực ca"],
      }));

      setStores(enrichedStores);
      setWarehouses(whData);
      if (whData.length > 0) {
        setNewStoreForm((prev) => ({
          ...prev,
          defaultWarehouseId: prev.defaultWarehouseId || whData[0].id,
        }));
      }
      if (enrichedStores.length > 0 && !enrichedStores.some((s) => s.id === posStore)) {
        setPosStore(enrichedStores[0].id);
      }
    } catch (err: any) {
      console.error("Không thể tải danh sách cửa hàng & kho:", err);
    } finally {
      setIsStoresLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchStoresAndWarehouses();
    }
  }, [isAuthenticated]);

  // ---------------------------------------------------------------------------
  // POS TERMINAL STATE
  // ---------------------------------------------------------------------------
  const [posStore, setPosStore] = useState<string>("store-001-q1");
  const [posCategory, setPosCategory] = useState<string>("all");
  const [posSearch, setPosSearch] = useState("");
  const [posCart, setPosCart] = useState<{ product: ProductItem; qty: number }[]>([]);
  const [posCustomerPhone, setPosCustomerPhone] = useState("0988 777 666");
  const [posDiscountPercent, setPosDiscountPercent] = useState<number>(0);
  const [posPaymentMethod, setPosPaymentMethod] = useState<"CASH" | "VIETQR" | "CARD">("CASH");
  const [posCashTendered, setPosCashTendered] = useState<number>(0);
  const [completedReceipt, setCompletedReceipt] = useState<OrderItem | null>(null);
  const [barcodeFlash, setBarcodeFlash] = useState(false);

  // Helper helper to determine active POS store
  const getActivePosStore = () => {
    return stores.find((s) => s.id === posStore) || stores[0];
  };

  const getProductStockForCurrentPos = (product: ProductItem) => {
    const isFirst = stores.length > 0 ? (posStore === stores[0]?.id || posStore === "store1") : (posStore === "store1");
    return isFirst ? product.stockStore1 : product.stockStore2;
  };

  // ---------------------------------------------------------------------------
  // INVENTORY TRANSFER MODAL STATE
  // ---------------------------------------------------------------------------
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferProductId, setTransferProductId] = useState<string>(MOCK_PRODUCTS[0].id);
  const [transferFrom, setTransferFrom] = useState<"store1" | "store2">("store1");
  const [transferQty, setTransferQty] = useState<number>(5);

  // ---------------------------------------------------------------------------
  // ORDERS FILTER STATE
  // ---------------------------------------------------------------------------
  const [orderChannelFilter, setOrderChannelFilter] = useState<string>("ALL");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("ALL");
  const [orderSearchText, setOrderSearchText] = useState("");

  // Helper trigger toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // ---------------------------------------------------------------------------
  // POS ACTIONS
  // ---------------------------------------------------------------------------
  const addToCart = (product: ProductItem) => {
    const currentStock = getProductStockForCurrentPos(product);
    if (currentStock <= 0) {
      triggerToast(`Sản phẩm ${product.name} đã hết hàng tại chi nhánh đang chọn!`);
      return;
    }

    setPosCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.qty >= currentStock) {
          triggerToast(`Số lượng trong giỏ đã đạt tối đa tồn quầy (${currentStock} cái).`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const updateCartQty = (productId: string, delta: number) => {
    setPosCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const currentStock = getProductStockForCurrentPos(item.product);
            const newQty = item.qty + delta;
            if (newQty > currentStock) {
              triggerToast(`Số lượng không được vượt quá tồn quầy (${currentStock} cái).`);
              return item;
            }
            return { ...item, qty: newQty };
          }
          return item;
        })
        .filter((item) => item.qty > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setPosCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setPosCart([]);
    setPosDiscountPercent(0);
    setPosCashTendered(0);
  };

  // Barcode Scanner Simulator
  const handleSimulateBarcodeScan = () => {
    setBarcodeFlash(true);
    setTimeout(() => setBarcodeFlash(false), 800);

    // Pick a random product with stock
    const available = products.filter((p) => getProductStockForCurrentPos(p) > 0);
    if (available.length === 0) return;
    const randomProduct = available[Math.floor(Math.random() * available.length)];
    addToCart(randomProduct);
    triggerToast(`Đã quét mã vạch [${randomProduct.barcode}] — Thêm ${randomProduct.name}`);
  };

  // Calculations for POS Cart
  const cartSubtotal = posCart.reduce(
    (sum, item) => sum + item.product.sellingPrice * item.qty,
    0
  );
  const cartDiscountAmount = Math.round((cartSubtotal * posDiscountPercent) / 100);
  const cartTotalAmount = Math.max(0, cartSubtotal - cartDiscountAmount);
  const cartChangeDue = Math.max(0, posCashTendered - cartTotalAmount);

  // POS Complete Checkout
  const handleCompletePosCheckout = () => {
    if (posCart.length === 0) {
      triggerToast("Giỏ hàng đang trống. Vui lòng chọn sản phẩm!");
      return;
    }

    const activeStoreObj = getActivePosStore();
    const isFirst = stores.length > 0 ? (posStore === stores[0]?.id || posStore === "store1") : (posStore === "store1");
    const orderSeq = Math.floor(1000 + Math.random() * 9000);
    const storeCode = activeStoreObj ? activeStoreObj.code.replace('STORE-', '') : (isFirst ? "CN1" : "CN2");
    const newOrderId = `POS-${storeCode}-${orderSeq}`;

    // 1. Deduct stock from products
    setProducts((prev) =>
      prev.map((prod) => {
        const inCart = posCart.find((ci) => ci.product.id === prod.id);
        if (!inCart) return prod;
        if (isFirst) {
          return { ...prod, stockStore1: Math.max(0, prod.stockStore1 - inCart.qty) };
        } else {
          return { ...prod, stockStore2: Math.max(0, prod.stockStore2 - inCart.qty) };
        }
      })
    );

    // 2. Create Order Record
    const storeLabel = activeStoreObj ? `POS — ${activeStoreObj.name}` : (isFirst ? "POS — Chi Nhánh 1 (Q.1)" : "POS — Chi Nhánh 2 (Bình Thạnh)");
    const whName = activeStoreObj?.defaultWarehouse?.name || (isFirst ? "Kho Q.1" : "Kho Bình Thạnh");

    const newOrder: OrderItem = {
      id: newOrderId,
      customer: posCustomerPhone ? `Khách tại quầy (${posCustomerPhone})` : "Khách lẻ tại quầy",
      phone: posCustomerPhone || "0988 777 666",
      channel: isFirst ? "POS_STORE_1" : "POS_STORE_2",
      channelLabel: storeLabel,
      channelBadgeColor: "bg-purple-100 text-purple-800 border-purple-300",
      items: posCart.map((item) => ({
        name: item.product.name,
        sku: item.product.sku,
        qty: item.qty,
        price: item.product.sellingPrice,
      })),
      totalAmount: cartTotalAmount,
      discountAmount: cartDiscountAmount,
      status: "COMPLETED",
      statusLabel: "Hoàn tất tại quầy",
      statusColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      paymentStatus: "PAID",
      paymentMethod:
        posPaymentMethod === "CASH"
          ? "Tiền mặt"
          : posPaymentMethod === "VIETQR"
          ? "Chuyển khoản VietQR"
          : "Thẻ ngân hàng (POS Card)",
      createdAt: "Vừa xong",
      timeline: [
        { time: "Vừa xong", event: `Thu ngân hoàn tất thanh toán hóa đơn ${newOrderId}` },
        { time: "Vừa xong", event: `Trừ tồn kho trực tiếp tại ${whName}` },
      ],
    };

    setOrders((prev) => [newOrder, ...prev]);

    // 3. Add to Activities feed
    setActivities((prev) => [
      {
        id: `ACT-${Date.now()}`,
        time: "Vừa xong",
        type: "pos",
        title: `Thanh toán thành công ${newOrderId}`,
        description: `Đã thu ${cartTotalAmount.toLocaleString("vi-VN")} ₫ bằng ${newOrder.paymentMethod}. Trừ ${posCart.reduce((s, i) => s + i.qty, 0)} sản phẩm tồn kho.`,
        tag: activeStoreObj ? activeStoreObj.code : (isFirst ? "POS CN1" : "POS CN2"),
        tagColor: "bg-purple-100 text-purple-800",
      },
      ...prev,
    ]);

    // 4. Open Thermal Receipt Modal
    setCompletedReceipt(newOrder);

    // 5. Clear Cart
    clearCart();
    triggerToast(`Đã thanh toán thành công hóa đơn ${newOrderId}!`);
  };

  // ---------------------------------------------------------------------------
  // CREATE STORE ACTION (TASK-004)
  // ---------------------------------------------------------------------------
  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddStoreError(null);
    if (!newStoreForm.name.trim() || !newStoreForm.code.trim() || !newStoreForm.address.trim()) {
      setAddStoreError("Vui lòng điền đầy đủ Tên, Mã cửa hàng và Địa chỉ");
      return;
    }

    setIsSubmittingStore(true);
    try {
      await storeService.createStore({
        name: newStoreForm.name.trim(),
        code: newStoreForm.code.trim().toUpperCase(),
        address: newStoreForm.address.trim(),
        phoneNumber: newStoreForm.phoneNumber.trim() || undefined,
        defaultWarehouseId: newStoreForm.defaultWarehouseId || undefined,
      });

      triggerToast(`Đã thêm chi nhánh mới: ${newStoreForm.name}`);
      setShowAddStoreModal(false);
      setNewStoreForm({
        name: "",
        code: "",
        address: "",
        phoneNumber: "",
        defaultWarehouseId: warehouses[0]?.id || "",
      });
      await fetchStoresAndWarehouses();
    } catch (err: any) {
      setAddStoreError(err.message || "Không thể tạo cửa hàng. Vui lòng kiểm tra lại!");
    } finally {
      setIsSubmittingStore(false);
    }
  };

  // ---------------------------------------------------------------------------
  // INVENTORY TRANSFER ACTION
  // ---------------------------------------------------------------------------
  const handleExecuteTransfer = () => {
    const prod = products.find((p) => p.id === transferProductId);
    if (!prod) return;

    const sourceStock = transferFrom === "store1" ? prod.stockStore1 : prod.stockStore2;
    if (transferQty <= 0 || transferQty > sourceStock) {
      triggerToast(`Số lượng chuyển không hợp lệ (Tồn kho xuất hiện tại chỉ còn ${sourceStock} cái).`);
      return;
    }

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === transferProductId) {
          if (transferFrom === "store1") {
            return {
              ...p,
              stockStore1: p.stockStore1 - transferQty,
              stockStore2: p.stockStore2 + transferQty,
            };
          } else {
            return {
              ...p,
              stockStore1: p.stockStore1 + transferQty,
              stockStore2: p.stockStore2 - transferQty,
            };
          }
        }
        return p;
      })
    );

    setActivities((prev) => [
      {
        id: `ACT-${Date.now()}`,
        time: "Vừa xong",
        type: "stock",
        title: `Phiếu chuyển kho nội bộ hoàn tất`,
        description: `Đã chuyển ${transferQty}x ${prod.name} từ ${
          transferFrom === "store1" ? "Kho Q.1 -> Kho Bình Thạnh" : "Kho Bình Thạnh -> Kho Q.1"
        }.`,
        tag: "Chuyển kho",
        tagColor: "bg-blue-100 text-blue-800",
      },
      ...prev,
    ]);

    setShowTransferModal(false);
    triggerToast(`Đã chuyển thành công ${transferQty} sản phẩm ${prod.sku}!`);
  };

  // ---------------------------------------------------------------------------
  // CHANNEL SYNC ACTION
  // ---------------------------------------------------------------------------
  const handleTriggerChannelSync = () => {
    setIsSyncingChannels(true);
    setTimeout(() => {
      setIsSyncingChannels(false);
      setChannels((prev) =>
        prev.map((ch) => ({
          ...ch,
          lastSyncedAt: "Vừa xong",
        }))
      );
      setActivities((prev) => [
        {
          id: `ACT-${Date.now()}`,
          time: "Vừa xong",
          type: "stock",
          title: "Đồng bộ tồn kho đa sàn hoàn tất",
          description: "Đã cập nhật số lượng tồn khả dụng của toàn bộ danh mục sản phẩm lên Shopee và TikTok Shop.",
          tag: "Sync Engine",
          tagColor: "bg-emerald-100 text-emerald-800",
        },
        ...prev,
      ]);
      triggerToast("Đã đồng bộ thành công số lượng tồn khả dụng lên Shopee và TikTok Shop!");
    }, 1200);
  };

  // Filtered products for POS
  const filteredPosProducts = products.filter((p) => {
    const matchCategory = posCategory === "all" || p.category === posCategory;
    const matchSearch =
      !posSearch.trim() ||
      p.name.toLowerCase().includes(posSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(posSearch.toLowerCase()) ||
      p.barcode.includes(posSearch);
    return matchCategory && matchSearch;
  });

  // Filtered Orders for Order Hub
  const filteredOrders = orders.filter((o) => {
    const matchChannel = orderChannelFilter === "ALL" || o.channel === orderChannelFilter;
    const matchStatus = orderStatusFilter === "ALL" || o.status === orderStatusFilter;
    const matchSearch =
      !orderSearchText.trim() ||
      o.id.toLowerCase().includes(orderSearchText.toLowerCase()) ||
      o.customer.toLowerCase().includes(orderSearchText.toLowerCase()) ||
      o.phone.includes(orderSearchText);
    return matchChannel && matchStatus && matchSearch;
  });

  // Calculate Dashboard Summary Metrics dynamically
  const totalRevenue = orders
    .filter((o) => o.status === "COMPLETED")
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrdersCount = orders.length;
  const totalAvailableStock = products.reduce(
    (sum, p) => sum + Math.max(0, p.stockStore1 + p.stockStore2 - p.committed),
    0
  );
  const lowStockCount = products.filter(
    (p) => Math.max(0, p.stockStore1 + p.stockStore2 - p.committed) <= 5
  ).length;

  // Trạng thái kiểm tra xác thực và bảo vệ tuyến đường
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
        <p className="text-sm font-medium text-slate-300">Đang đồng bộ Workspace NEXORA...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
        <p className="text-sm font-medium text-slate-300">Chưa đăng nhập. Đang chuyển hướng tới trang Đăng nhập...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 font-sans overflow-hidden">
      {/* =======================================================================
          SIDEBAR
      ======================================================================= */}
      <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
        {/* Sidebar Brand Header */}
        <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <img
              src="/logo.png"
              alt="NEXORA"
              className="h-7 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            PRO
          </span>
        </div>

        {/* Tenant Switcher Card */}
        <div className="p-3 mx-3 my-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-md bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Store className="w-3.5 h-3.5" />
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate" title={tenant?.name || "Gia Dụng Hiện Đại"}>
                {tenant?.name || "Gia Dụng Hiện Đại"}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {tenant?.slug ? `@${tenant.slug}` : "2 Cửa Hàng • 3 Kênh Sàn"}
              </div>
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto text-xs">
          {/* Màn hình 1: Dashboard */}
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === "overview"
                ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/20 font-semibold"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>1. Dashboard Tổng Quan</span>
          </button>

          {/* Màn hình 2: POS Terminal */}
          <button
            onClick={() => setActiveTab("pos")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === "pos"
                ? "bg-purple-600 text-white shadow-sm shadow-purple-500/20 font-semibold"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <div className="flex items-center gap-3">
              <Barcode className="w-4 h-4 shrink-0 text-purple-400" />
              <span>2. Quầy Bán Lẻ (POS)</span>
            </div>
            <span className="px-1.5 py-0.5 rounded-full bg-purple-500/30 text-purple-300 text-[9px] font-bold">
              2 Quầy
            </span>
          </button>

          {/* Màn hình 3: Quản lý đơn hàng */}
          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === "orders"
                ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/20 font-semibold"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span>3. Đơn Hàng Đa Kênh</span>
            </div>
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-[10px] font-bold">
              {orders.length}
            </span>
          </button>

          {/* Màn hình 4: Tồn kho đa điểm */}
          <button
            onClick={() => setActiveTab("inventory")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === "inventory"
                ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/20 font-semibold"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <div className="flex items-center gap-3">
              <Boxes className="w-4 h-4 shrink-0" />
              <span>4. Tồn Kho Đa Điểm</span>
            </div>
            {lowStockCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                {lowStockCount} Sắp hết
              </span>
            )}
          </button>

          {/* Màn hình 5: Kênh bán hàng */}
          <button
            onClick={() => setActiveTab("channels")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === "channels"
                ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/20 font-semibold"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Globe2 className="w-4 h-4 shrink-0" />
            <span>5. Kết Nối Kênh Sàn</span>
          </button>

          <div className="pt-3 pb-1 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Phân Hệ Bổ Trợ
          </div>

          {/* Màn hình bổ trợ: Sản phẩm */}
          <button
            onClick={() => setActiveTab("products")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === "products"
                ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/20 font-semibold"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Package className="w-4 h-4 shrink-0" />
            <span>Danh Mục Sản Phẩm</span>
          </button>

          {/* Màn hình bổ trợ: Hộp thư hội thoại */}
          <button
            onClick={() => setActiveTab("chat")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === "chat"
                ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/20 font-semibold"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span>Hộp Thư Hội Thoại</span>
            </div>
            <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-bold animate-pulse">
              18
            </span>
          </button>

          {/* Màn hình bổ trợ: Cửa hàng */}
          <button
            onClick={() => setActiveTab("stores")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === "stores"
                ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/20 font-semibold"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <div className="flex items-center gap-3">
              <Store className="w-4 h-4 shrink-0" />
              <span>Hệ Thống Cửa Hàng</span>
            </div>
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
              {stores.length || 2}
            </span>
          </button>
        </nav>

        {/* Sidebar Footer User Info & Logout */}
        <div className="p-3 border-t border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center font-bold text-xs text-white shadow-sm shrink-0">
              {user?.fullName
                ? user.fullName
                    .split(" ")
                    .slice(-2)
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()
                : "AD"}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate" title={user?.fullName || "Quản Trị Viên"}>
                {user?.fullName || "Quản Trị Viên"}
              </div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="truncate">{user?.role || "ADMIN"} • Trực Tuyến</span>
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="text-slate-400 hover:text-rose-400 hover:bg-slate-800 p-1.5 rounded-lg transition-colors shrink-0"
            title="Đăng xuất khỏi Workspace"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* =======================================================================
          MAIN CONTENT AREA
      ======================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              {activeTab === "overview" && "Dashboard Tổng Quan Hoạt Động Kinh Doanh"}
              {activeTab === "pos" && "Quầy Thu Ngân Bán Lẻ Tại Cửa Hàng (POS Terminal)"}
              {activeTab === "orders" && "Quản Lý Đơn Hàng Đa Kênh Hợp Nhất"}
              {activeTab === "products" && "Danh Mục Sản Phẩm Đồ Gia Dụng & Biến Thể"}
              {activeTab === "inventory" && "Ma Trận Tồn Kho Đa Điểm & Điều Chuyển Kho"}
              {activeTab === "chat" && "Unified Inbox — Hộp Thư Hội Thoại & Chốt Đơn"}
              {activeTab === "channels" && "Trung Tâm Kết Nối Kênh Sàn & Đồng Bộ Dữ Liệu"}
              {activeTab === "stores" && `Hệ Thống ${stores.length || 2} Cửa Hàng Vật Lý & Điểm Bán`}
            </h1>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-3">
            {/* Quick POS Button */}
            <button
              onClick={() => setActiveTab("pos")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all ${
                activeTab === "pos"
                  ? "bg-purple-700 text-white"
                  : "bg-purple-600 hover:bg-purple-700 text-white"
              }`}
            >
              <Barcode className="w-3.5 h-3.5" />
              <span>Bán Tại Quầy (POS)</span>
            </button>

            {/* Quick Sync Button */}
            <button
              onClick={handleTriggerChannelSync}
              disabled={isSyncingChannels}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isSyncingChannels ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Đồng Bộ Sàn</span>
            </button>

            {/* Dark Mode Toggle */}
            <DarkModeToggle />

            {/* Notification Bell */}
            <div className="relative">
              <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 relative">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
              </button>
            </div>

            {/* Header User Badge & Logout */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800 leading-tight">
                  {user?.fullName || "Nguyễn Văn Quản Trị"}
                </span>
                <span className="text-[10px] text-slate-500 leading-tight">
                  {tenant?.name || "Gia Dụng Hiện Đại"}
                </span>
              </div>
              <button
                onClick={logout}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
                title="Đăng xuất khỏi Workspace"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Đăng xuất</span>
              </button>
            </div>
          </div>
        </header>

        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="bg-emerald-600 text-white text-xs font-semibold py-2 px-6 flex items-center justify-between shadow-md animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="p-0.5 hover:text-emerald-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Scrollable Content Container */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-100">
          {/* ===================================================================
              TAB 1: OVERVIEW DASHBOARD (MÀN HÌNH 1)
          =================================================================== */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Metric Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Metric 1: Doanh thu hôm nay */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow transition-shadow">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
                    <span>Tổng Doanh Thu Hôm Nay</span>
                    <span className="flex items-center text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                      <TrendingUp className="w-3 h-3 mr-0.5" /> +18.4%
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">
                    {totalRevenue.toLocaleString("vi-VN")} ₫
                  </div>
                  <div className="mt-2 text-[11px] text-slate-500">
                    Hôm qua: <span className="font-semibold text-slate-700">40.750.000 ₫</span>
                  </div>
                </div>

                {/* Metric 2: Đơn hàng mới */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow transition-shadow">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
                    <span>Số Đơn Hàng Mới</span>
                    <span className="flex items-center text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                      Đa kênh
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">
                    {totalOrdersCount} Đơn
                  </div>
                  <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
                    <span>Shopee: <strong className="text-amber-600">64</strong></span>
                    <span>•</span>
                    <span>TikTok: <strong className="text-sky-600">42</strong></span>
                    <span>•</span>
                    <span>POS: <strong className="text-purple-600">20</strong></span>
                  </div>
                </div>

                {/* Metric 3: Tồn kho khả dụng */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow transition-shadow">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
                    <span>Tồn Khả Dụng Toàn Hệ Thống</span>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      2 Kho
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">
                    {totalAvailableStock} Cái
                  </div>
                  <div className="mt-2 text-[11px] text-slate-500">
                    Đang giữ cho đơn online: <span className="font-semibold text-emerald-600">28 cái</span>
                  </div>
                </div>

                {/* Metric 4: Cảnh báo sắp hết */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow transition-shadow">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
                    <span>Cảnh Báo Sắp Hết Hàng</span>
                    <span className="flex items-center text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded">
                      <AlertTriangle className="w-3 h-3 mr-0.5" /> Chú ý
                    </span>
                  </div>
                  <div className="text-2xl font-black text-rose-600 tracking-tight">
                    {lowStockCount} Mặt Hàng
                  </div>
                  <div className="mt-2 text-[11px] text-slate-500">
                    Tồn khả dụng &le; 5 chiếc tại các kho
                  </div>
                </div>
              </div>

              {/* Chart & Live Stream Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 2-Column: Doanh thu theo kênh */}
                <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                        Phân Bổ Doanh Thu Theo Kênh Bán Hàng
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Tỷ trọng doanh số từ 2 cửa hàng vật lý và các sàn TMĐT
                      </p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                      Hôm nay
                    </span>
                  </div>

                  {/* Channel Revenue Bars */}
                  <div className="space-y-4">
                    {/* Shopee */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-slate-700 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                          Shopee Mall (64 đơn)
                        </span>
                        <span className="font-bold text-slate-900">24.900.000 ₫ (51.6%)</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: "51.6%" }} />
                      </div>
                    </div>

                    {/* TikTok Shop */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-slate-700 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                          TikTok Shop Live (42 đơn)
                        </span>
                        <span className="font-bold text-slate-900">12.350.000 ₫ (25.6%)</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-500 rounded-full transition-all" style={{ width: "25.6%" }} />
                      </div>
                    </div>

                    {/* POS CN1 */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-slate-700 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                          POS Chi Nhánh 1 — Quận 1 (12 đơn)
                        </span>
                        <span className="font-bold text-slate-900">7.200.000 ₫ (14.9%)</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-600 rounded-full transition-all" style={{ width: "14.9%" }} />
                      </div>
                    </div>

                    {/* POS CN2 */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-slate-700 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                          POS Chi Nhánh 2 — Bình Thạnh (8 đơn)
                        </span>
                        <span className="font-bold text-slate-900">3.800.000 ₫ (7.9%)</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: "7.9%" }} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Đối soát chi phí sàn: Shopee (-11.5%), TikTok Shop (-9.8%)</span>
                    <button
                      onClick={() => setActiveTab("channels")}
                      className="text-emerald-600 font-semibold hover:underline flex items-center gap-1"
                    >
                      Chi tiết kênh <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 1-Column: Live Stream Activity */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Sự Kiện Trực Tiếp
                    </h2>
                    <span className="text-[10px] text-slate-400">Thời gian thực</span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3">
                    {activities.map((act) => (
                      <div key={act.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${act.tagColor}`}>
                            {act.tag}
                          </span>
                          <span className="text-[10px] text-slate-400">{act.time}</span>
                        </div>
                        <div className="font-bold text-slate-900 text-xs">{act.title}</div>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{act.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              TAB 2: QUẦY BÁN LẺ TẠI CỬA HÀNG (POS TERMINAL - MÀN HÌNH 2)
          =================================================================== */}
          {activeTab === "pos" && (
            <div className="space-y-4">
              {/* POS Top Control Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Store Selector */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Điểm Bán Hiện Tại:
                  </span>
                  <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
                    {stores.length > 0 ? (
                      stores.map((st) => (
                        <button
                          key={st.id}
                          onClick={() => setPosStore(st.id)}
                          className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                            posStore === st.id
                              ? "bg-purple-600 text-white shadow-sm"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          {st.name.replace("NEXORA Store — ", "").replace("Cửa Hàng ", "CH ")}
                        </button>
                      ))
                    ) : (
                      <>
                        <button
                          onClick={() => setPosStore("store1")}
                          className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                            posStore === "store1"
                              ? "bg-purple-600 text-white shadow-sm"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          Chi Nhánh 1 (Quận 1)
                        </button>
                        <button
                          onClick={() => setPosStore("store2")}
                          className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                            posStore === "store2"
                              ? "bg-purple-600 text-white shadow-sm"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          Chi Nhánh 2 (Bình Thạnh)
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Cashier and Barcode Sim Button */}
                <div className="flex items-center gap-3">
                  <div className="text-xs text-slate-600 hidden sm:block">
                    Thu ngân: <strong className="text-slate-900">Nguyễn Lan (Ca sáng)</strong>
                  </div>
                  <button
                    onClick={handleSimulateBarcodeScan}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all ${
                      barcodeFlash
                        ? "bg-emerald-600 scale-105"
                        : "bg-slate-900 hover:bg-slate-800"
                    }`}
                  >
                    <Barcode className="w-4 h-4 text-emerald-400" />
                    <span>Quét Barcode Mẫu</span>
                  </button>
                </div>
              </div>

              {/* Main Split Layout: Left Products Grid (8 cols), Right Cart & Checkout (4 cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* LEFT: PRODUCTS SELECTOR (Col 8) */}
                <div className="lg:col-span-7 xl:col-span-8 space-y-4">
                  {/* Category Filter Pills & Search */}
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={posSearch}
                        onChange={(e) => setPosSearch(e.target.value)}
                        placeholder="Tìm sản phẩm theo tên, mã SKU hoặc quét mã vạch..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50/50"
                      />
                    </div>

                    {/* Quick Category Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                      {[
                        { id: "all", label: "Tất cả" },
                        { id: "noichien", label: "Nồi chiên không dầu" },
                        { id: "chao", label: "Chảo chống dính" },
                        { id: "amsieutoc", label: "Ấm siêu tốc" },
                        { id: "mayxay", label: "Máy xay sinh tố" },
                        { id: "noicom", label: "Nồi cơm điện" },
                        { id: "khac", label: "Thiết bị khác" },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setPosCategory(cat.id)}
                          className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
                            posCategory === cat.id
                              ? "bg-purple-600 text-white shadow-sm font-semibold"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Product Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
                    {filteredPosProducts.map((p) => {
                      const stock = getProductStockForCurrentPos(p);
                      const isOutOfStock = stock <= 0;

                      return (
                        <div
                          key={p.id}
                          onClick={() => !isOutOfStock && addToCart(p)}
                          className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                            isOutOfStock
                              ? "bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed"
                              : "bg-white border-slate-200 hover:border-purple-400 hover:shadow-md cursor-pointer group"
                          }`}
                        >
                          <div>
                            {/* Card Header Tag */}
                            <div className="flex items-center justify-between text-[10px] mb-2">
                              <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                                {p.categoryName}
                              </span>
                              <span className="text-slate-400 font-mono text-[9px]">{p.sku}</span>
                            </div>

                            {/* Product Name & Brand */}
                            <h3 className="font-bold text-xs text-slate-900 group-hover:text-purple-600 transition-colors line-clamp-2 leading-snug">
                              {p.name}
                            </h3>
                            <div className="text-[10px] text-slate-500 mt-1">{p.brand}</div>
                          </div>

                          {/* Price & Stock Footer */}
                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                            <div>
                              <div className="text-sm font-black text-slate-900">
                                {p.sellingPrice.toLocaleString("vi-VN")} ₫
                              </div>
                              <div className="text-[10px] font-semibold flex items-center gap-1 mt-0.5">
                                {isOutOfStock ? (
                                  <span className="text-rose-600">Hết hàng tại quầy</span>
                                ) : (
                                  <span className="text-emerald-600">
                                    Tồn quầy: {stock} cái
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              disabled={isOutOfStock}
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(p);
                              }}
                              className={`p-2 rounded-xl text-xs font-bold transition-all ${
                                isOutOfStock
                                  ? "bg-slate-200 text-slate-400"
                                  : "bg-purple-600 hover:bg-purple-700 text-white shadow-sm group-hover:scale-105"
                              }`}
                              title="Thêm vào giỏ"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* RIGHT: CART & CHECKOUT PANEL (Col 4) */}
                <div className="lg:col-span-5 xl:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sticky top-20">
                  {/* Cart Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-purple-600" />
                      <h2 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                        Giỏ Hàng Quầy ({posCart.reduce((sum, item) => sum + item.qty, 0)})
                      </h2>
                    </div>
                    {posCart.length > 0 && (
                      <button
                        onClick={clearCart}
                        className="text-[11px] text-rose-600 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Trash2 className="w-3 h-3" /> Xóa tất cả
                      </button>
                    )}
                  </div>

                  {/* Customer Phone Input */}
                  <div className="mt-3">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Số Điện Thoại Khách Hàng:
                    </label>
                    <input
                      type="text"
                      value={posCustomerPhone}
                      onChange={(e) => setPosCustomerPhone(e.target.value)}
                      placeholder="Nhập số điện thoại khách..."
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none bg-slate-50/50"
                    />
                  </div>

                  {/* Cart Items List */}
                  <div className="mt-4 flex-1 max-h-64 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-xl">
                    {posCart.length === 0 ? (
                      <div className="p-8 text-center text-slate-400">
                        <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <div className="text-xs font-semibold">Giỏ hàng đang trống</div>
                        <p className="text-[10px] mt-1 text-slate-400">
                          Nhấp chọn sản phẩm bên trái hoặc quét mã vạch
                        </p>
                      </div>
                    ) : (
                      posCart.map((item) => (
                        <div key={item.product.id} className="p-3 bg-white flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-slate-900 truncate">
                              {item.product.name}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {item.product.sellingPrice.toLocaleString("vi-VN")} ₫ / cái
                            </div>
                          </div>

                          {/* Qty Control Buttons */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => updateCartQty(item.product.id, -1)}
                              className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center text-xs font-bold"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-slate-900">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => updateCartQty(item.product.id, 1)}
                              className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center text-xs font-bold"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="p-1 text-slate-300 hover:text-rose-600 transition-colors ml-1"
                              title="Xóa"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Discount Selector */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-semibold text-slate-600">Chiết Khấu (Giảm giá):</span>
                      <div className="flex items-center gap-1">
                        {[0, 5, 10, 15].map((pct) => (
                          <button
                            key={pct}
                            onClick={() => setPosDiscountPercent(pct)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                              posDiscountPercent === pct
                                ? "bg-purple-600 text-white"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Payment Method Selector */}
                    <div className="mt-3">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                        Phương Thức Thanh Toán:
                      </span>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <button
                          onClick={() => setPosPaymentMethod("CASH")}
                          className={`py-2 px-2 rounded-xl font-bold flex flex-col items-center gap-1 border transition-all ${
                            posPaymentMethod === "CASH"
                              ? "bg-purple-50 border-purple-500 text-purple-700 shadow-sm"
                              : "border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span className="text-[10px]">Tiền Mặt</span>
                        </button>

                        <button
                          onClick={() => setPosPaymentMethod("VIETQR")}
                          className={`py-2 px-2 rounded-xl font-bold flex flex-col items-center gap-1 border transition-all ${
                            posPaymentMethod === "VIETQR"
                              ? "bg-purple-50 border-purple-500 text-purple-700 shadow-sm"
                              : "border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span className="text-[10px]">VietQR</span>
                        </button>

                        <button
                          onClick={() => setPosPaymentMethod("CARD")}
                          className={`py-2 px-2 rounded-xl font-bold flex flex-col items-center gap-1 border transition-all ${
                            posPaymentMethod === "CARD"
                              ? "bg-purple-50 border-purple-500 text-purple-700 shadow-sm"
                              : "border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span className="text-[10px]">Thẻ POS</span>
                        </button>
                      </div>
                    </div>

                    {/* Dynamic Cash Tender Box or VietQR Display */}
                    {posPaymentMethod === "CASH" && posCart.length > 0 && (
                      <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Khách Đưa:</span>
                          <input
                            type="number"
                            value={posCashTendered || ""}
                            onChange={(e) => setPosCashTendered(Number(e.target.value))}
                            placeholder={cartTotalAmount.toString()}
                            className="w-32 px-2 py-1 rounded border border-slate-200 text-right font-bold text-slate-900 bg-white"
                          />
                        </div>
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => setPosCashTendered(cartTotalAmount)}
                            className="px-1.5 py-0.5 rounded bg-slate-200 text-[9px] font-bold hover:bg-slate-300"
                          >
                            Đủ tiền
                          </button>
                          <button
                            onClick={() => setPosCashTendered(500000)}
                            className="px-1.5 py-0.5 rounded bg-slate-200 text-[9px] font-bold hover:bg-slate-300"
                          >
                            500k
                          </button>
                          <button
                            onClick={() => setPosCashTendered(1000000)}
                            className="px-1.5 py-0.5 rounded bg-slate-200 text-[9px] font-bold hover:bg-slate-300"
                          >
                            1M
                          </button>
                          <button
                            onClick={() => setPosCashTendered(2000000)}
                            className="px-1.5 py-0.5 rounded bg-slate-200 text-[9px] font-bold hover:bg-slate-300"
                          >
                            2M
                          </button>
                        </div>
                        {posCashTendered > 0 && (
                          <div className="flex items-center justify-between pt-1 border-t border-slate-200 font-bold">
                            <span className="text-slate-600">Tiền Thối Lại:</span>
                            <span className="text-emerald-600">{cartChangeDue.toLocaleString("vi-VN")} ₫</span>
                          </div>
                        )}
                      </div>
                    )}

                    {posPaymentMethod === "VIETQR" && posCart.length > 0 && (
                      <div className="mt-3 p-3 bg-purple-50 rounded-xl border border-purple-200 text-center text-xs">
                        <div className="font-bold text-purple-900 mb-1">Quét Mã VietQR Chuyển Khoản</div>
                        <div className="w-28 h-28 mx-auto bg-white p-2 rounded-lg border border-purple-200 shadow-sm flex items-center justify-center my-1.5">
                          {/* Simulated Dynamic VietQR Box */}
                          <div className="text-center">
                            <QrCode className="w-16 h-16 text-slate-800 mx-auto" />
                            <div className="text-[8px] font-mono font-bold text-purple-700">NAPAS 247</div>
                          </div>
                        </div>
                        <div className="text-[10px] text-slate-600">
                          MBBank • 0988 777 666 • NEXORA STORE
                        </div>
                        <div className="text-[10px] font-mono text-purple-700 font-bold mt-0.5">
                          Số tiền: {cartTotalAmount.toLocaleString("vi-VN")} ₫
                        </div>
                      </div>
                    )}

                    {/* Price Breakdown Summary */}
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Tiền hàng:</span>
                        <span>{cartSubtotal.toLocaleString("vi-VN")} ₫</span>
                      </div>
                      {cartDiscountAmount > 0 && (
                        <div className="flex items-center justify-between text-rose-600">
                          <span>Chiết khấu ({posDiscountPercent}%):</span>
                          <span>-{cartDiscountAmount.toLocaleString("vi-VN")} ₫</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm font-black text-slate-900 pt-1.5 border-t border-slate-100">
                        <span>Tổng Thanh Toán:</span>
                        <span className="text-purple-700 text-base">
                          {cartTotalAmount.toLocaleString("vi-VN")} ₫
                        </span>
                      </div>
                    </div>

                    {/* Complete Checkout Button */}
                    <button
                      onClick={handleCompletePosCheckout}
                      disabled={posCart.length === 0}
                      className={`w-full mt-4 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all ${
                        posCart.length === 0
                          ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                          : "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/25 active:scale-95"
                      }`}
                    >
                      <Receipt className="w-4 h-4" />
                      <span>Thanh Toán & In Hóa Đơn ({cartTotalAmount.toLocaleString("vi-VN")} ₫)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              TAB 3: ĐƠN HÀNG ĐA KÊNH (ORDERS - MÀN HÌNH 3)
          =================================================================== */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 flex-1 max-w-md">
                  <div className="relative w-full">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={orderSearchText}
                      onChange={(e) => setOrderSearchText(e.target.value)}
                      placeholder="Tìm theo mã đơn, tên hoặc SĐT khách..."
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none bg-slate-50/50"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Channel Filter */}
                  <select
                    value={orderChannelFilter}
                    onChange={(e) => setOrderChannelFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 font-medium focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="ALL">Tất cả kênh bán</option>
                    <option value="SHOPEE">Shopee Mall</option>
                    <option value="TIKTOK">TikTok Shop</option>
                    <option value="FACEBOOK">Facebook Chat</option>
                    <option value="POS_STORE_1">POS Chi Nhánh 1 (Q.1)</option>
                    <option value="POS_STORE_2">POS Chi Nhánh 2 (Bình Thạnh)</option>
                  </select>

                  {/* Status Filter */}
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 font-medium focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="PENDING">Chờ xử lý</option>
                    <option value="CONFIRMED">Đã xác nhận</option>
                    <option value="PROCESSING">Đang đóng gói</option>
                    <option value="SHIPPED">Đang giao hàng</option>
                    <option value="COMPLETED">Đã hoàn thành</option>
                  </select>
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3.5 px-4">Mã Đơn Hàng</th>
                        <th className="py-3.5 px-4">Khách Hàng</th>
                        <th className="py-3.5 px-4">Kênh Bán</th>
                        <th className="py-3.5 px-4">Sản Phẩm</th>
                        <th className="py-3.5 px-4">Tổng Tiền</th>
                        <th className="py-3.5 px-4">Trạng Thái</th>
                        <th className="py-3.5 px-4 text-right">Hành Động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400">
                            Không tìm thấy đơn hàng nào phù hợp với bộ lọc
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((ord) => (
                          <tr
                            key={ord.id}
                            onClick={() => setSelectedOrder(ord)}
                            className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                          >
                            <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">
                              {ord.id}
                              <div className="text-[10px] text-slate-400 font-sans font-normal">{ord.createdAt}</div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900">{ord.customer}</div>
                              <div className="text-slate-400 text-[11px]">{ord.phone}</div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${ord.channelBadgeColor}`}>
                                {ord.channelLabel}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 max-w-xs truncate">
                              <div className="text-slate-900 font-medium truncate">
                                {ord.items[0]?.name}
                              </div>
                              {ord.items.length > 1 && (
                                <div className="text-[10px] text-slate-400 font-medium">
                                  + {ord.items.length - 1} sản phẩm khác
                                </div>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900">
                                {ord.totalAmount.toLocaleString("vi-VN")} ₫
                              </div>
                              <div className="text-[10px] text-slate-400">{ord.paymentMethod}</div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${ord.statusColor}`}>
                                {ord.statusLabel}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOrder(ord);
                                }}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                                title="Xem chi tiết"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              TAB 4: TỒN KHO ĐA ĐIỂM (INVENTORY - MÀN HÌNH 4)
          =================================================================== */}
          {activeTab === "inventory" && (
            <div className="space-y-6">
              {/* Header with Transfer Action Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Ma Trận Tồn Kho Đa Chi Nhánh</h2>
                  <p className="text-xs text-slate-500">
                    Theo dõi tồn thực tế, số lượng đang giữ và tồn khả dụng thời gian thực
                  </p>
                </div>
                <button
                  onClick={() => setShowTransferModal(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 flex items-center gap-2 shadow-sm shadow-emerald-500/20"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>Tạo Phiếu Chuyển Kho</span>
                </button>
              </div>

              {/* Warehouse Quick Summary Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-slate-200">
                  <div className="text-[10px] font-bold text-purple-600 uppercase">Kho Chi Nhánh 1 (Quận 1)</div>
                  <div className="text-xl font-black text-slate-900 mt-1">
                    {products.reduce((s, p) => s + p.stockStore1, 0)} Sản phẩm
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Phục vụ bán lẻ trực tiếp tại quầy POS 1</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200">
                  <div className="text-[10px] font-bold text-indigo-600 uppercase">Kho Chi Nhánh 2 (Bình Thạnh)</div>
                  <div className="text-xl font-black text-slate-900 mt-1">
                    {products.reduce((s, p) => s + p.stockStore2, 0)} Sản phẩm
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Phục vụ bán lẻ trực tiếp tại quầy POS 2</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200">
                  <div className="text-[10px] font-bold text-emerald-600 uppercase">Đang Giữ Cho Sàn (Committed)</div>
                  <div className="text-xl font-black text-emerald-600 mt-1">
                    {products.reduce((s, p) => s + p.committed, 0)} Sản phẩm
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Đơn hàng Shopee, TikTok chờ đóng gói</p>
                </div>
              </div>

              {/* Inventory Matrix Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3.5 px-4">Sản Phẩm Gia Dụng</th>
                        <th className="py-3.5 px-4">Mã SKU & Barcode</th>
                        <th className="py-3.5 px-4 text-center">Kho Q.1</th>
                        <th className="py-3.5 px-4 text-center">Kho Bình Thạnh</th>
                        <th className="py-3.5 px-4 text-center">Đang Giữ</th>
                        <th className="py-3.5 px-4 text-center">Tồn Khả Dụng</th>
                        <th className="py-3.5 px-4 text-right">Trạng Thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {products.map((p) => {
                        const available = Math.max(0, p.stockStore1 + p.stockStore2 - p.committed);
                        const isLow = available <= 5;

                        return (
                          <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900">{p.name}</div>
                              <div className="text-slate-400 text-[11px]">{p.brand}</div>
                            </td>
                            <td className="py-3.5 px-4 font-mono">
                              <span className="font-bold text-slate-800">{p.sku}</span>
                              <div className="text-slate-400 text-[10px]">{p.barcode}</div>
                            </td>
                            <td className="py-3.5 px-4 text-center font-bold text-purple-700">
                              {p.stockStore1}
                            </td>
                            <td className="py-3.5 px-4 text-center font-bold text-indigo-700">
                              {p.stockStore2}
                            </td>
                            <td className="py-3.5 px-4 text-center text-slate-500 font-semibold">
                              {p.committed}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className={`font-black text-sm ${isLow ? "text-rose-600" : "text-emerald-600"}`}>
                                {available}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              {isLow ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                  Sắp hết hàng
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  Đủ bán
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              TAB 5: KẾT NỐI KÊNH SÀN (CHANNELS - MÀN HÌNH 5)
          =================================================================== */}
          {activeTab === "channels" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Trung Tâm Kết Nối Kênh Bán Hàng</h2>
                  <p className="text-xs text-slate-500">
                    Quản lý ủy quyền API và đồng bộ 2 chiều với Shopee, TikTok Shop, Facebook
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTriggerChannelSync}
                    disabled={isSyncingChannels}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 flex items-center gap-2 shadow-sm shadow-emerald-500/20"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncingChannels ? "animate-spin" : ""}`} />
                    <span>{isSyncingChannels ? "Đang đồng bộ..." : "Đồng bộ tồn kho ngay"}</span>
                  </button>
                </div>
              </div>

              {/* Channel Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {channels.map((ch) => (
                  <div key={ch.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                            {ch.platform === "Shopee" && <span className="text-amber-600 font-extrabold">SP</span>}
                            {ch.platform === "TikTok Shop" && <span className="text-sky-600 font-extrabold">TT</span>}
                            {ch.platform === "Facebook" && <span className="text-emerald-600 font-extrabold">FB</span>}
                            {ch.platform === "Lazada" && <span className="text-indigo-600 font-extrabold">LZ</span>}
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-slate-900">{ch.name}</h3>
                            <div className="text-[11px] text-slate-400 font-mono">ID: {ch.accountId}</div>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            ch.status === "CONNECTED"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                              : "bg-amber-100 text-amber-800 border-amber-200"
                          }`}
                        >
                          {ch.status === "CONNECTED" ? "Đang Kết Nối" : "Cần Chú Ý"}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-slate-50 rounded-xl">
                          <span className="text-slate-400 text-[10px] block">Sản phẩm đã đồng bộ</span>
                          <span className="font-bold text-slate-900 text-sm">{ch.totalSyncedProducts} SKU</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl">
                          <span className="text-slate-400 text-[10px] block">Đơn hàng chờ xử lý</span>
                          <span className="font-bold text-emerald-600 text-sm">{ch.pendingOrders} Đơn</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>Đồng bộ gần nhất: <strong className="text-slate-700">{ch.lastSyncedAt}</strong></span>
                      <button
                        onClick={handleTriggerChannelSync}
                        className="text-emerald-600 font-semibold hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" /> Đồng bộ lại
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================
              TAB BỔ TRỢ: SẢN PHẨM & BIẾN THỂ (PRODUCTS)
          =================================================================== */}
          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Danh Mục Sản Phẩm Đồ Gia Dụng</h2>
                  <p className="text-xs text-slate-500">Quản lý giá vốn, giá bán lẻ và phân loại danh mục</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {products.map((p) => (
                  <div key={p.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[10px] mb-2">
                        <span className="font-bold text-blue-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {p.categoryName}
                        </span>
                        <span className="text-slate-400 font-mono">{p.sku}</span>
                      </div>
                      <h3 className="font-bold text-xs text-slate-900 leading-snug">{p.name}</h3>
                      <div className="text-[11px] text-slate-500 mt-1">{p.brand}</div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400">Giá bán lẻ</div>
                        <div className="font-bold text-slate-900 text-sm">
                          {p.sellingPrice.toLocaleString("vi-VN")} ₫
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400">Giá vốn</div>
                        <div className="font-medium text-slate-600">
                          {p.costPrice.toLocaleString("vi-VN")} ₫
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================
              TAB BỔ TRỢ: HỘP THƯ HỘI THOẠI (CHAT)
          =================================================================== */}
          {activeTab === "chat" && (
            <div className="h-[calc(100vh-140px)] flex bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="w-80 border-r border-slate-200 flex flex-col shrink-0">
                <div className="p-3 border-b border-slate-200 text-xs font-bold text-slate-700">
                  Hội Thoại Mới Nhất
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                  {MOCK_CONVERSATIONS.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedConv(c)}
                      className={`p-3.5 cursor-pointer transition-colors ${
                        selectedConv.id === c.id ? "bg-emerald-50/70 border-l-4 border-blue-600" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">{c.customerName}</span>
                        <span className="text-[10px] text-slate-400">{c.lastTime}</span>
                      </div>
                      <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">{c.platform}</div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-1">{c.lastMessage}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat View */}
              <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
                <div className="h-14 px-5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
                  <div>
                    <h3 className="font-bold text-xs text-slate-900">{selectedConv.customerName}</h3>
                    <p className="text-[10px] text-slate-400">Kênh: {selectedConv.platform}</p>
                  </div>
                  <button
                    onClick={() => setActiveTab("pos")}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-1 shadow-sm"
                  >
                    <Barcode className="w-3.5 h-3.5" />
                    <span>Mở POS Chốt Đơn</span>
                  </button>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
                  <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-md">
                    <div className="text-slate-800">{selectedConv.lastMessage}</div>
                    <div className="text-[9px] text-slate-400 mt-1 text-right">{selectedConv.lastTime}</div>
                  </div>
                </div>

                <div className="p-3 bg-white border-t border-slate-200 flex gap-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Nhập tin nhắn trả lời khách hàng..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      if (!chatMessage.trim()) return;
                      triggerToast("Đã gửi tin nhắn phản hồi thành công!");
                      setChatMessage("");
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              TAB BỔ TRỢ: CỬA HÀNG VẬT LÝ & KHO HÀNG (STORES & WAREHOUSES - TASK-004)
          =================================================================== */}
          {activeTab === "stores" && (
            <div className="space-y-6">
              {/* Header with Title and Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                    <span>Hệ Thống {stores.length} Cửa Hàng & Điểm Bán Vật Lý</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Quản lý mạng lưới chi nhánh bán lẻ, gắn kết kho hàng mặc định và đồng bộ trực tiếp với quầy POS
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={fetchStoresAndWarehouses}
                    disabled={isStoresLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isStoresLoading ? "animate-spin text-emerald-600" : ""}`} />
                    <span>{isStoresLoading ? "Đang tải..." : "Làm Mới"}</span>
                  </button>

                  <button
                    onClick={() => {
                      setAddStoreError(null);
                      setShowAddStoreModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Chi Nhánh Mới</span>
                  </button>
                </div>
              </div>

              {/* KPI Strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <span className="text-[11px] font-medium text-slate-500 block">Tổng Điểm Bán</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">{stores.length}</div>
                  <div className="text-[10px] text-emerald-600 font-semibold mt-1">
                    {stores.filter((s) => s.isActive).length} Đang hoạt động
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <span className="text-[11px] font-medium text-slate-500 block">Tổng Kho Lưu Trữ</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">{warehouses.length}</div>
                  <div className="text-[10px] text-purple-600 font-semibold mt-1">
                    {warehouses.filter((w) => w.type === "CENTRAL").length} Kho tổng •{" "}
                    {warehouses.filter((w) => w.type === "STORE_ATTACHED").length} Kho quầy
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <span className="text-[11px] font-medium text-slate-500 block">Doanh Số Quầy Toàn Hệ Thống</span>
                  <div className="text-2xl font-black text-emerald-700 mt-1">
                    {stores
                      .reduce((sum, s) => sum + (s.todayRevenue || 0), 0)
                      .toLocaleString("vi-VN")}{" "}
                    ₫
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Cập nhật theo thời gian thực</div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <span className="text-[11px] font-medium text-slate-500 block">Tỷ Lệ Khóa Kho Mặc Định</span>
                  <div className="text-2xl font-black text-purple-700 mt-1">
                    {stores.length > 0
                      ? Math.round(
                          (stores.filter((s) => s.defaultWarehouseId).length / stores.length) * 100
                        )
                      : 100}
                    %
                  </div>
                  <div className="text-[10px] text-emerald-600 font-semibold mt-1">Tránh bán vượt tồn kho</div>
                </div>
              </div>

              {/* Stores Cards Grid */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Danh Sách Chi Nhánh Cửa Hàng
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Nhấn &quot;Bán Tại Quầy&quot; để mở giao diện POS của chi nhánh
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {stores.map((st) => (
                    <div
                      key={st.id}
                      className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                          <div>
                            <span className="font-mono text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {st.code}
                            </span>
                            <h3 className="font-bold text-slate-900 text-sm mt-1.5">{st.name}</h3>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              st.isActive
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {st.isActive ? "Đang Mở Cửa" : "Tạm Dừng"}
                          </span>
                        </div>

                        {/* Store Info */}
                        <div className="mt-4 space-y-2.5 text-xs text-slate-600">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{st.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                            <span>Hotline: {st.phoneNumber || "028 3822 1199"}</span>
                          </div>
                          <div className="flex items-start gap-2 pt-1 border-t border-slate-100">
                            <Store className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-slate-400 text-[11px]">Kho hàng xuất mặc định:</span>
                              <div className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                                <span>{st.defaultWarehouse?.name || "Kho mặc định (Tại chỗ)"}</span>
                                {st.defaultWarehouse?.code && (
                                  <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-purple-50 text-purple-700">
                                    {st.defaultWarehouse.code}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Financial Snapshot */}
                        <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3">
                          <div>
                            <div className="text-[10px] text-slate-400">Doanh Số Hôm Nay</div>
                            <div className="text-sm font-bold text-slate-900">
                              {(st.todayRevenue || 0).toLocaleString("vi-VN")} ₫
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-400">Số Lượng Hóa Đơn</div>
                            <div className="text-sm font-bold text-slate-900">
                              {st.ordersCount || 0} HĐ
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Action Button */}
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setPosStore(st.id);
                            setActiveTab("pos");
                          }}
                          className="w-full py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                        >
                          <Barcode className="w-3.5 h-3.5" />
                          <span>Mở POS Thu Ngân Chi Nhánh Này</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Warehouses Section */}
              <div className="pt-2">
                <div className="mb-3">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-emerald-600" />
                    <span>Danh Mục {warehouses.length} Kho Hàng Vận Hành Toàn Hệ Thống</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hệ thống kho đa điểm gồm kho tổng lưu trữ hàng lớn phục vụ sàn Shopee / TikTok Shop và kho vệ tinh tại từng cửa hàng
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {warehouses.map((wh) => (
                    <div
                      key={wh.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                            {wh.code}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              wh.type === "CENTRAL"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {wh.type === "CENTRAL" ? "Kho Tổng Trung Tâm" : "Kho Tại Cửa Hàng"}
                          </span>
                        </div>

                        <h4 className="font-bold text-slate-900 text-xs mt-2.5 line-clamp-1">
                          {wh.name}
                        </h4>

                        <div className="flex items-start gap-1.5 mt-2 text-[11px] text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{wh.address}</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">Trạng thái:</span>
                        <span className="font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Sẵn Sàng Xuất Hàng
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* =======================================================================
          MODAL 1: ORDER DETAIL MODAL
      ======================================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="font-mono text-xs font-bold text-emerald-600">{selectedOrder.id}</span>
                <h3 className="font-bold text-base text-slate-900 mt-0.5">Chi Tiết Đơn Hàng</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">
                <div>
                  <span className="text-slate-400 text-[10px] block">Khách hàng</span>
                  <strong className="text-slate-900">{selectedOrder.customer}</strong>
                  <div className="text-slate-500 text-[11px]">{selectedOrder.phone}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Kênh bán & Trạng thái</span>
                  <strong className="text-emerald-600">{selectedOrder.channelLabel}</strong>
                  <div className="text-slate-500 text-[11px]">{selectedOrder.statusLabel}</div>
                </div>
              </div>

              {selectedOrder.address && (
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-slate-400 text-[10px] block">Địa chỉ giao hàng</span>
                  <span className="text-slate-800 font-medium">{selectedOrder.address}</span>
                </div>
              )}

              <div>
                <span className="font-bold text-slate-700 block mb-2">Danh sách sản phẩm xuất kho:</span>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {selectedOrder.items.map((it, i) => (
                    <div key={i} className="p-3 flex items-center justify-between bg-white">
                      <div>
                        <div className="font-bold text-slate-900">{it.name}</div>
                        <div className="text-[10px] font-mono text-slate-400">SKU: {it.sku}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900">{it.price.toLocaleString("vi-VN")} ₫</div>
                        <div className="text-[10px] text-slate-400">Số lượng: x{it.qty}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 text-sm font-bold border-t border-slate-100">
                <span>Tổng tiền thanh toán:</span>
                <span className="text-emerald-600 text-base">{selectedOrder.totalAmount.toLocaleString("vi-VN")} ₫</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => {
                  triggerToast(`Đã in phiếu đóng gói cho đơn hàng ${selectedOrder.id}`);
                  setSelectedOrder(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>In Phiếu Đóng Gói</span>
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL 2: INVENTORY TRANSFER MODAL (CHUYỂN KHO)
      ======================================================================= */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">Tạo Phiếu Chuyển Kho Nội Bộ</h3>
              </div>
              <button
                onClick={() => setShowTransferModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              {/* Product Select */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Chọn sản phẩm cần chuyển:</label>
                <select
                  value={transferProductId}
                  onChange={(e) => setTransferProductId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:ring-1 focus:ring-blue-500"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (SKU: {p.sku})
                    </option>
                  ))}
                </select>
              </div>

              {/* Source & Destination Warehouses */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kho xuất hàng:</label>
                  <select
                    value={transferFrom}
                    onChange={(e) => setTransferFrom(e.target.value as "store1" | "store2")}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                  >
                    <option value="store1">Kho Chi Nhánh 1 (Q.1)</option>
                    <option value="store2">Kho Chi Nhánh 2 (Bình Thạnh)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kho nhập hàng:</label>
                  <div className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 text-slate-700">
                    {transferFrom === "store1" ? "Kho Chi Nhánh 2" : "Kho Chi Nhánh 1"}
                  </div>
                </div>
              </div>

              {/* Transfer Qty */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Số lượng chuyển:</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={transferQty}
                  onChange={(e) => setTransferQty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex gap-3">
              <button
                onClick={handleExecuteTransfer}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>Xác Nhận Chuyển Kho</span>
              </button>
              <button
                onClick={() => setShowTransferModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL 3: POS THERMAL RECEIPT MODAL (HÓA ĐƠN BÁN LẺ K80)
      ======================================================================= */}
      {completedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col font-mono text-xs">
            {/* Thermal Receipt Header */}
            <div className="text-center pb-4 border-b-2 border-dashed border-slate-300">
              <div className="flex items-center justify-center gap-1.5 font-sans font-black text-lg text-slate-900 tracking-tight">
                <Layers className="w-5 h-5 text-purple-600" />
                NEXORA HOME
              </div>
              <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                {completedReceipt.channelLabel}
              </p>
              <p className="text-[10px] text-slate-400 font-sans">
                Hotline: 028 3822 1199 • TP. Hồ Chí Minh
              </p>
              <div className="text-sm font-black text-slate-800 font-sans mt-2">
                HÓA ĐƠN BÁN LẺ
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                Số HĐ: {completedReceipt.id}
              </div>
              <div className="text-[10px] text-slate-500">
                Ngày: {new Date().toLocaleDateString("vi-VN")} {new Date().toLocaleTimeString("vi-VN")}
              </div>
            </div>

            {/* Receipt Items Table */}
            <div className="py-3 border-b-2 border-dashed border-slate-300 space-y-2">
              <div className="text-[10px] font-bold text-slate-500 flex justify-between uppercase">
                <span>Tên Sản Phẩm</span>
                <span>T.Tiền</span>
              </div>
              {completedReceipt.items.map((item, idx) => (
                <div key={idx} className="text-xs">
                  <div className="font-sans font-bold text-slate-900">{item.name}</div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>
                      {item.qty} x {item.price.toLocaleString("vi-VN")} ₫
                    </span>
                    <span className="font-bold text-slate-900">
                      {(item.qty * item.price).toLocaleString("vi-VN")} ₫
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Receipt Totals */}
            <div className="py-3 border-b-2 border-dashed border-slate-300 space-y-1.5 text-xs">
              {completedReceipt.discountAmount && completedReceipt.discountAmount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Chiết khấu:</span>
                  <span>-{completedReceipt.discountAmount.toLocaleString("vi-VN")} ₫</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm text-slate-900 pt-1">
                <span>TỔNG CỘNG:</span>
                <span className="text-purple-700">{completedReceipt.totalAmount.toLocaleString("vi-VN")} ₫</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Phương thức:</span>
                <span className="font-sans font-semibold text-slate-800">{completedReceipt.paymentMethod}</span>
              </div>
            </div>

            {/* Receipt Footer */}
            <div className="text-center pt-4 pb-2 text-[10px] text-slate-500 font-sans">
              <div className="font-bold text-slate-800">Cảm ơn quý khách và hẹn gặp lại!</div>
              <p className="mt-0.5 text-slate-400">Đổi trả trong 7 ngày nếu lỗi từ nhà sản xuất</p>
              {/* Barcode Graphic */}
              <div className="mt-3 flex flex-col items-center">
                <Barcode className="w-36 h-10 text-slate-800" />
                <span className="text-[9px] font-mono tracking-widest">{completedReceipt.id}</span>
              </div>
            </div>

            {/* Print & Close Buttons */}
            <div className="pt-4 border-t border-slate-200 flex gap-2 font-sans">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In Hóa Đơn</span>
              </button>
              <button
                onClick={() => setCompletedReceipt(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL 4: ADD STORE BRANCH MODAL (TASK-004)
      ======================================================================= */}
      {showAddStoreModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Thêm Chi Nhánh Cửa Hàng Mới</h3>
                  <p className="text-xs text-slate-500">Khai báo điểm bán vật lý và gắn kho xuất hàng mặc định</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddStoreModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStore} className="py-4 space-y-4 text-xs">
              {addStoreError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{addStoreError}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tên Chi Nhánh / Cửa Hàng <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Cửa Hàng 3 — Chi nhánh Thủ Đức"
                  value={newStoreForm.name}
                  onChange={(e) => setNewStoreForm({ ...newStoreForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Mã Chi Nhánh <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="STORE-HCM-03"
                    value={newStoreForm.code}
                    onChange={(e) => setNewStoreForm({ ...newStoreForm, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs uppercase font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số Điện Thoại Hotline</label>
                  <input
                    type="text"
                    placeholder="028 3722 5555"
                    value={newStoreForm.phoneNumber}
                    onChange={(e) => setNewStoreForm({ ...newStoreForm, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Địa Chỉ Cửa Hàng <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: 215 Võ Văn Ngân, P. Linh Chiểu, TP. Thủ Đức, TP. HCM"
                  value={newStoreForm.address}
                  onChange={(e) => setNewStoreForm({ ...newStoreForm, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kho Hàng Xuất Mặc Định (POS)
                </label>
                <select
                  value={newStoreForm.defaultWarehouseId}
                  onChange={(e) => setNewStoreForm({ ...newStoreForm, defaultWarehouseId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="">-- Không liên kết kho --</option>
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      [{wh.code}] {wh.name} ({wh.type === "CENTRAL" ? "Kho tổng" : "Kho tại chỗ"})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Khi nhân viên thanh toán tại quầy, hệ thống tự động trừ tồn kho từ kho hàng này.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddStoreModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-all"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingStore}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmittingStore ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang Tạo...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tạo Chi Nhánh Mới</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
