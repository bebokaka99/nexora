import { useState } from "react";
import type {
  ActivityEvent,
  OrderItem,
  ProductItem,
} from "@/lib/mock-data";
import type { Store as StoreEntity } from "@/lib/services/store-service";
import {
  orderService,
  type Order as ApiOrder,
} from "@/lib/services/order-service";
import { ApiError } from "@/lib/api-client";
import type { PosCartItem, PosPaymentMethod } from "./types";

export interface UsePosOptions {
  products: ProductItem[];
  setOrders: React.Dispatch<React.SetStateAction<OrderItem[]>>;
  setActivities: React.Dispatch<React.SetStateAction<ActivityEvent[]>>;
  stores: StoreEntity[];
  posStore: string;
  triggerToast: (msg: string) => void;
  triggerErrorToast: (msg: string) => void;
}

/**
 * TASK-016: adapter đơn thật (backend trả về) -> OrderItem mock mà tab Đơn
 * hàng và ReceiptModal đang dùng, để đơn thật hiển thị được trong UI cũ mà
 * không phải viết lại 2 component đó. id của OrderItem mock lấy đúng
 * orderNumber do backend sinh (không còn mã POS-…-random của frontend).
 */
function adaptApiOrderToOrderItem(
  order: ApiOrder,
  opts: {
    storeLabel: string;
    whName: string;
    isFirst: boolean;
    paymentMethodLabel: string;
  }
): OrderItem {
  return {
    id: order.orderNumber,
    customer: order.customerName
      ? `${order.customerName}${order.customerPhone ? ` (${order.customerPhone})` : ""}`
      : order.customerPhone
        ? `Khách tại quầy (${order.customerPhone})`
        : "Khách lẻ tại quầy",
    phone: order.customerPhone || "0988 777 666",
    channel: opts.isFirst ? "POS_STORE_1" : "POS_STORE_2",
    channelLabel: opts.storeLabel,
    channelBadgeColor:
      "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700",
    items: order.items.map((i) => ({
      name: i.productName,
      sku: i.sku,
      qty: i.quantity,
      price: i.unitPrice,
    })),
    totalAmount: order.totalAmount,
    discountAmount: order.discountAmount,
    status: "COMPLETED",
    statusLabel: "Hoàn tất tại quầy",
    statusColor:
      "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800",
    paymentStatus: "PAID",
    paymentMethod: opts.paymentMethodLabel,
    createdAt: "Vừa xong",
    timeline: [
      {
        time: "Vừa xong",
        event: `Thu ngân hoàn tất thanh toán hóa đơn ${order.orderNumber}`,
      },
      { time: "Vừa xong", event: `Trừ tồn kho trực tiếp tại ${opts.whName}` },
    ],
  };
}

/**
 * State & hành động của quầy POS (TASK-012 tách từ page.tsx):
 * giỏ hàng, chiết khấu, phương thức thanh toán, quét barcode mô phỏng,
 * thanh toán + in hóa đơn nhiệt. TASK-016: thanh toán gọi POST /orders thật
 * (phương án A — backend down thì chặn cứng, giữ giỏ); danh mục hiển thị
 * vẫn là mock, tồn kho thật do backend trừ.
 */
export function usePos({
  products,
  setOrders,
  setActivities,
  stores,
  posStore,
  triggerToast,
  triggerErrorToast,
}: UsePosOptions) {
  const [posCategory, setPosCategory] = useState<string>("all");
  const [posSearch, setPosSearch] = useState("");
  const [posCart, setPosCart] = useState<PosCartItem[]>([]);
  const [posCustomerPhone, setPosCustomerPhone] = useState("0988 777 666");
  const [posDiscountPercent, setPosDiscountPercent] = useState<number>(0);
  const [posPaymentMethod, setPosPaymentMethod] = useState<PosPaymentMethod>("CASH");
  const [posCashTendered, setPosCashTendered] = useState<number>(0);
  const [completedReceipt, setCompletedReceipt] = useState<OrderItem | null>(null);
  const [barcodeFlash, setBarcodeFlash] = useState(false);
  // TASK-016 (phương án A): đang gọi POST /orders thì khóa nút thanh toán
  // để tránh bấm 2 lần tạo 2 đơn.
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Helper helper to determine active POS store
  const getActivePosStore = () => {
    return stores.find((s) => s.id === posStore) || stores[0];
  };

  const getProductStockForCurrentPos = (product: ProductItem) => {
    const isFirst = stores.length > 0 ? (posStore === stores[0]?.id || posStore === "store1") : (posStore === "store1");
    return isFirst ? product.stockStore1 : product.stockStore2;
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

  // POS Complete Checkout — TASK-016 (phương án A, user chọn 17/11/2026):
  // thanh toán đi qua backend thật POST /orders. Backend down hoặc lỗi thì
  // CHẶN CỨNG: báo lỗi, GIỮ NGUYÊN giỏ, không tạo đơn, không trừ tồn.
  // Khi API thành công mới dùng orderNumber backend sinh và KHÔNG trừ tồn
  // local nữa (backend đã trừ 1 lần qua reserveOrDeductStock — trừ local
  // thêm sẽ thành trừ 2 lần).
  const handleCompletePosCheckout = async () => {
    if (posCart.length === 0) {
      triggerToast("Giỏ hàng đang trống. Vui lòng chọn sản phẩm!");
      return;
    }
    if (isCheckingOut) return;

    const activeStoreObj = getActivePosStore();
    const isFirst = stores.length > 0 ? (posStore === stores[0]?.id || posStore === "store1") : (posStore === "store1");
    const paymentMethodLabel =
      posPaymentMethod === "CASH"
        ? "Tiền mặt"
        : posPaymentMethod === "VIETQR"
          ? "Chuyển khoản VietQR"
          : "Thẻ ngân hàng (POS Card)";
    const storeLabel = activeStoreObj
      ? `POS — ${activeStoreObj.name}`
      : isFirst
        ? "POS — Chi Nhánh 1 (Q.1)"
        : "POS — Chi Nhánh 2 (Bình Thạnh)";
    const whName =
      activeStoreObj?.defaultWarehouse?.name ||
      (isFirst ? "Kho Q.1" : "Kho Bình Thạnh");

    setIsCheckingOut(true);
    try {
      const created = await orderService.createOrder({
        channelType: "POS",
        // storeId/warehouseId chỉ gửi khi có id thật từ API (khi backend
        // down, stores = [] nên 2 field này undefined — backend tự resolve
        // kho theo TASK-015; còn request sẽ lỗi kết nối và bị chặn ở dưới).
        storeId: activeStoreObj?.id,
        warehouseId: activeStoreObj?.defaultWarehouseId ?? undefined,
        customerPhone: posCustomerPhone || undefined,
        items: posCart.map((item) => ({
          // variantId ở đây là id mock (PROD-01…); backend resolve về uuid
          // thật theo SKU ở TASK-016 hướng (b).
          variantId: item.product.id,
          sku: item.product.sku,
          productName: item.product.name,
          quantity: item.qty,
          unitPrice: item.product.sellingPrice,
        })),
        discountAmount: cartDiscountAmount,
        status: "COMPLETED",
        paymentStatus: "PAID",
        paymentMethod: paymentMethodLabel,
      });

      const newOrder = adaptApiOrderToOrderItem(created, {
        storeLabel,
        whName,
        isFirst,
        paymentMethodLabel,
      });

      setOrders((prev) => [newOrder, ...prev]);

      setActivities((prev) => [
        {
          id: `ACT-${Date.now()}`,
          time: "Vừa xong",
          type: "pos",
          title: `Thanh toán thành công ${created.orderNumber}`,
          description: `Đã thu ${created.totalAmount.toLocaleString("vi-VN")} ₫ bằng ${paymentMethodLabel}. Đơn đã lưu vào hệ thống, tồn kho trừ trực tiếp tại ${whName}.`,
          tag: activeStoreObj ? activeStoreObj.code : isFirst ? "POS CN1" : "POS CN2",
          tagColor:
            "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200",
        },
        ...prev,
      ]);

      // Mở Thermal Receipt Modal với đơn thật
      setCompletedReceipt(newOrder);

      // Xóa giỏ sau khi backend đã nhận đơn
      clearCart();
      triggerToast(`Đã thanh toán thành công hóa đơn ${created.orderNumber}!`);
    } catch (err) {
      // Phương án A: lỗi thì giữ nguyên giỏ, không tạo đơn giả, không trừ tồn.
      const detail =
        err instanceof ApiError
          ? err.message
          : "Đã xảy ra lỗi không xác định khi tạo đơn hàng.";
      triggerErrorToast(
        `${detail} Đơn chưa được tạo, giỏ hàng vẫn giữ nguyên.`
      );
    } finally {
      setIsCheckingOut(false);
    }
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

  return {
    posCategory,
    setPosCategory,
    posSearch,
    setPosSearch,
    posCart,
    posCustomerPhone,
    setPosCustomerPhone,
    posDiscountPercent,
    setPosDiscountPercent,
    posPaymentMethod,
    setPosPaymentMethod,
    posCashTendered,
    setPosCashTendered,
    completedReceipt,
    setCompletedReceipt,
    barcodeFlash,
    getActivePosStore,
    getProductStockForCurrentPos,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    handleSimulateBarcodeScan,
    cartSubtotal,
    cartDiscountAmount,
    cartTotalAmount,
    cartChangeDue,
    isCheckingOut,
    handleCompletePosCheckout,
    filteredPosProducts,
  };
}

export type PosApi = ReturnType<typeof usePos>;
