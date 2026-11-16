import { useState } from "react";
import type {
  ActivityEvent,
  OrderItem,
  ProductItem,
} from "@/lib/mock-data";
import type { Store as StoreEntity } from "@/lib/services/store-service";
import type { PosCartItem, PosPaymentMethod } from "./types";

export interface UsePosOptions {
  products: ProductItem[];
  setProducts: React.Dispatch<React.SetStateAction<ProductItem[]>>;
  setOrders: React.Dispatch<React.SetStateAction<OrderItem[]>>;
  setActivities: React.Dispatch<React.SetStateAction<ActivityEvent[]>>;
  stores: StoreEntity[];
  posStore: string;
  triggerToast: (msg: string) => void;
}

/**
 * State & hành động của quầy POS (TASK-012 tách từ page.tsx):
 * giỏ hàng, chiết khấu, phương thức thanh toán, quét barcode mô phỏng,
 * thanh toán + trừ tồn kho + in hóa đơn nhiệt. Dữ liệu vẫn là mock.
 */
export function usePos({
  products,
  setProducts,
  setOrders,
  setActivities,
  stores,
  posStore,
  triggerToast,
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
      channelBadgeColor: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700",
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
      statusColor: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800",
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
        tagColor: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200",
      },
      ...prev,
    ]);

    // 4. Open Thermal Receipt Modal
    setCompletedReceipt(newOrder);

    // 5. Clear Cart
    clearCart();
    triggerToast(`Đã thanh toán thành công hóa đơn ${newOrderId}!`);
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
    handleCompletePosCheckout,
    filteredPosProducts,
  };
}

export type PosApi = ReturnType<typeof usePos>;
