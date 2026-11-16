import type { ProductItem } from "@/lib/mock-data";

/** 8 tab nội bộ của route /dashboard — TASK-012 giữ nguyên route, không tách URL. */
export type DashboardTab =
  | "overview"
  | "pos"
  | "orders"
  | "products"
  | "inventory"
  | "chat"
  | "channels"
  | "stores";

export type PosCartItem = { product: ProductItem; qty: number };

export type PosPaymentMethod = "CASH" | "VIETQR" | "CARD";
