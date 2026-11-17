import { useState } from "react";
import {
  MOCK_PRODUCTS,
  MOCK_ORDERS,
  MOCK_CHANNELS,
  MOCK_ACTIVITIES,
  type ProductItem,
  type OrderItem,
  type ChannelConnectionItem,
  type ActivityEvent,
} from "@/lib/mock-data";

/**
 * State dữ liệu dùng chung của dashboard (TASK-012 tách từ page.tsx):
 * sản phẩm/đơn/kênh/hoạt động (mock), toast, bộ lọc đơn hàng, chỉ số tổng quan,
 * phiếu chuyển kho và đồng bộ kênh. Không chứa state POS hay cửa hàng —
 * xem use-pos.ts và use-stores.ts.
 */
export function useDashboardData() {
  // Dynamic Live State (simulates local real-time mutations)
  const [products, setProducts] = useState<ProductItem[]>(MOCK_PRODUCTS);
  const [orders, setOrders] = useState<OrderItem[]>(MOCK_ORDERS);
  const [channels, setChannels] = useState<ChannelConnectionItem[]>(MOCK_CHANNELS);
  const [activities, setActivities] = useState<ActivityEvent[]>(MOCK_ACTIVITIES);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  // TASK-016: phân biệt toast lỗi (nền đỏ) với toast thành công.
  const [toastVariant, setToastVariant] = useState<"success" | "error">("success");

  // Syncing simulation
  const [isSyncingChannels, setIsSyncingChannels] = useState(false);

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
    setToastVariant("success");
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // TASK-016: toast lỗi (phương án A — chặn checkout khi backend down):
  // nền đỏ, nội dung giữ nguyên giỏ / không tạo đơn.
  const triggerErrorToast = (msg: string) => {
    setToastVariant("error");
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 6000);
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
        tagColor: "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200",
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
          tagColor: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200",
        },
        ...prev,
      ]);
      triggerToast("Đã đồng bộ thành công số lượng tồn khả dụng lên Shopee và TikTok Shop!");
    }, 1200);
  };

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

  return {
    products,
    setProducts,
    orders,
    setOrders,
    channels,
    activities,
    setActivities,
    toastMessage,
    toastVariant,
    triggerToast,
    triggerErrorToast,
    clearToast: () => setToastMessage(null),
    isSyncingChannels,
    handleTriggerChannelSync,
    showTransferModal,
    setShowTransferModal,
    transferProductId,
    setTransferProductId,
    transferFrom,
    setTransferFrom,
    transferQty,
    setTransferQty,
    handleExecuteTransfer,
    orderChannelFilter,
    setOrderChannelFilter,
    orderStatusFilter,
    setOrderStatusFilter,
    orderSearchText,
    setOrderSearchText,
    filteredOrders,
    totalRevenue,
    totalOrdersCount,
    totalAvailableStock,
    lowStockCount,
  };
}

export type DashboardData = ReturnType<typeof useDashboardData>;
