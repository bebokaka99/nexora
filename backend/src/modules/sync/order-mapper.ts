import type { ShopeeOrderDetail } from '../channel/shopee.client';
import type { TikTokOrderItem } from '../channel/tiktok.client';

/**
 * Map đơn sàn → đơn NEXORA (TASK-017) — hàm thuần, không phụ thuộc DB.
 *
 * Hai sàn trả payload khác nhau nên mỗi sàn có một hàm chuẩn hóa riêng, cùng
 * cho ra `NormalizedMarketplaceOrder` để `MarketplaceOrderImporter` lưu qua
 * `OrderService.create()` (tái dùng resolve kho TASK-015 + resolve variant
 * theo SKU TASK-016).
 *
 * Giới hạn (ghi rõ, không giấu):
 * - Trạng thái thanh toán suy từ trạng thái đơn (sàn không trả trạng thái
 *   thanh toán riêng trong response kéo đơn): UNPAID → UNPAID, còn lại →
 *   PAID. Đối soát tiền thật (phí sàn, phí ship, hoàn tiền) thuộc Phase 08.
 * - `Order` không có field ngày tạo ngoại vi nên `externalCreatedAt` chỉ
 *   mang theo để log, không lưu vào DB.
 * - Tiền tệ: Shopee trả số (VNĐ); TikTok trả chuỗi thập phân — đều parse về
 *   number VNĐ. Đơn ngoại tệ khác VNĐ chưa xử lý (shop Việt bán VNĐ).
 */

export type InternalOrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface NormalizedMarketplaceOrderItem {
  /** SKU sàn (dùng để resolve variant NEXORA theo TASK-016). */
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  /** ID mặt hàng trên sàn (phục vụ debug, không dùng làm khóa). */
  externalItemId?: string;
}

export interface NormalizedMarketplaceOrder {
  /** Mã đơn ngoại vi: Shopee `order_sn`, TikTok `id`. Khóa dedup. */
  externalOrderId: string;
  channelType: 'SHOPEE' | 'TIKTOK_SHOP';
  status: InternalOrderStatus;
  paymentStatus: 'UNPAID' | 'PAID';
  totalAmount: number;
  buyerName?: string;
  buyerPhone?: string;
  shippingAddress?: string;
  /** Ngày tạo trên sàn (chỉ để log — Order không có field này). */
  externalCreatedAt?: Date;
  items: NormalizedMarketplaceOrderItem[];
}

/** Shopee: UNPAID→PENDING, READY_TO_SHIP→CONFIRMED, PROCESSED→PROCESSING, ... */
export function mapShopeeOrderStatus(status: string | undefined): InternalOrderStatus {
  switch ((status || '').toUpperCase()) {
    case 'UNPAID':
      return 'PENDING';
    case 'READY_TO_SHIP':
      return 'CONFIRMED';
    case 'PROCESSED':
      return 'PROCESSING';
    case 'SHIPPED':
      return 'SHIPPED';
    case 'COMPLETED':
      return 'COMPLETED';
    case 'CANCELLED':
    case 'IN_CANCEL':
      return 'CANCELLED';
    default:
      return 'PENDING';
  }
}

/**
 * TikTok 202309: UNPAID→PENDING, ON_HOLD→PENDING (đơn bị giữ 1h sau thanh
 * toán, buyer vẫn hủy được — SPIKE §2.1), AWAITING_SHIPMENT→CONFIRMED,
 * PARTIALLY_SHIPPING/AWAITING_COLLECTION→PROCESSING, IN_TRANSIT→SHIPPED,
 * DELIVERED→SHIPPED (đã giao nhưng chưa hoàn tất), COMPLETED→COMPLETED.
 */
export function mapTikTokOrderStatus(status: string | undefined): InternalOrderStatus {
  switch ((status || '').toUpperCase()) {
    case 'UNPAID':
    case 'ON_HOLD':
      return 'PENDING';
    case 'AWAITING_SHIPMENT':
      return 'CONFIRMED';
    case 'PARTIALLY_SHIPPING':
    case 'AWAITING_COLLECTION':
      return 'PROCESSING';
    case 'IN_TRANSIT':
    case 'DELIVERED':
      return 'SHIPPED';
    case 'COMPLETED':
      return 'COMPLETED';
    case 'CANCELLED':
      return 'CANCELLED';
    default:
      return 'PENDING';
  }
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

/** Chuẩn hóa 1 đơn Shopee (đã lấy chi tiết qua getOrderDetail). */
export function normalizeShopeeOrderDetail(detail: ShopeeOrderDetail): NormalizedMarketplaceOrder {
  const status = mapShopeeOrderStatus(detail.order_status);
  const items: NormalizedMarketplaceOrderItem[] = (detail.item_list ?? []).map((it) => ({
    sku: it.model_sku || String(it.model_id ?? it.item_id),
    productName: it.model_name || it.item_name || `Sản phẩm Shopee ${it.item_id}`,
    quantity: Math.max(1, it.model_quantity_purchased ?? 1),
    unitPrice: toNumber(it.model_discounted_price ?? it.model_original_price, 0),
    externalItemId: String(it.item_id),
  }));
  const recipient = detail.recipient_address;
  return {
    externalOrderId: detail.order_sn,
    channelType: 'SHOPEE',
    status,
    paymentStatus: detail.order_status === 'UNPAID' ? 'UNPAID' : 'PAID',
    totalAmount: toNumber(detail.total_amount, 0),
    buyerName: recipient?.name,
    buyerPhone: recipient?.phone,
    shippingAddress: recipient?.full_address,
    externalCreatedAt: detail.create_time ? new Date(detail.create_time * 1000) : undefined,
    items,
  };
}

/** Chuẩn hóa 1 đơn TikTok từ kết quả orders/search (đã có line_items). */
export function normalizeTikTokOrder(order: TikTokOrderItem): NormalizedMarketplaceOrder {
  const status = mapTikTokOrderStatus(order.status);
  const items: NormalizedMarketplaceOrderItem[] = (order.line_items ?? []).map((li) => ({
    sku: li.seller_sku || li.sku_id || li.id || 'UNKNOWN',
    productName: li.product_name || li.sku_name || `Sản phẩm TikTok ${li.id ?? ''}`.trim(),
    quantity: Math.max(1, li.quantity ?? 1),
    unitPrice: toNumber(li.sale_price, 0),
    externalItemId: li.product_id ?? li.id,
  }));
  const recipient = order.recipient_address;
  return {
    externalOrderId: order.id,
    channelType: 'TIKTOK_SHOP',
    status,
    // Đơn ON_HOLD là đơn buyer đã trả tiền nhưng bị giữ 1h (SPIKE §2.1).
    paymentStatus: order.status === 'UNPAID' ? 'UNPAID' : 'PAID',
    totalAmount: toNumber(order.payment?.total_amount, 0),
    buyerName: recipient?.name,
    buyerPhone: recipient?.phone,
    shippingAddress: recipient?.full_address,
    externalCreatedAt: order.create_time ? new Date(order.create_time * 1000) : undefined,
    items,
  };
}
