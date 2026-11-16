/**
 * NEXORA Commerce OS — Unified Order Management Service
 * API client methods to manage POS retail orders, multi-channel marketplace orders,
 * lifecycle state machine, and inventory stock synchronizations.
 */

import { apiClient } from '../api-client';

export type ChannelType = 'POS' | 'SHOPEE' | 'TIKTOK_SHOP' | 'FACEBOOK' | 'MANUAL';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED';

export interface OrderItem {
  id: string;
  orderId: string;
  variantId: string;
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderTimeline {
  time: string;
  event: string;
}

export interface Order {
  id: string;
  tenantId: string;
  orderNumber: string;
  channelType: ChannelType;
  externalOrderId?: string | null;
  storeId?: string | null;
  warehouseId?: string | null;
  customerId?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  shippingAddress?: string | null;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  timeline?: OrderTimeline[];
}

export interface CreateOrderItemInput {
  variantId: string;
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderInput {
  channelType?: ChannelType;
  externalOrderId?: string;
  storeId?: string;
  warehouseId?: string;
  customerName?: string;
  customerPhone?: string;
  shippingAddress?: string;
  items: CreateOrderItemInput[];
  discountAmount?: number;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: string;
}

export interface UpdateOrderStatusInput {
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
  notes?: string;
}

export interface QueryOrderParams {
  search?: string;
  channelType?: ChannelType;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  storeId?: string;
}

export const orderService = {
  /**
   * Tra cứu danh sách đơn hàng đa kênh
   */
  async getOrders(params?: QueryOrderParams): Promise<Order[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.channelType) query.append('channelType', params.channelType);
    if (params?.status) query.append('status', params.status);
    if (params?.paymentStatus) query.append('paymentStatus', params.paymentStatus);
    if (params?.storeId) query.append('storeId', params.storeId);

    const queryString = query.toString();
    const endpoint = queryString ? `/orders?${queryString}` : '/orders';
    return apiClient.get<Order[]>(endpoint);
  },

  /**
   * Xem chi tiết một đơn hàng theo ID
   */
  async getOrderById(id: string): Promise<Order> {
    return apiClient.get<Order>(`/orders/${id}`);
  },

  /**
   * Tạo đơn hàng mới (POS Bán lẻ hoặc Đơn hàng online)
   */
  async createOrder(data: CreateOrderInput): Promise<Order> {
    return apiClient.post<Order>('/orders', data);
  },

  /**
   * Cập nhật trạng thái vòng đời đơn hàng
   */
  async updateOrderStatus(id: string, data: UpdateOrderStatusInput): Promise<Order> {
    return apiClient.patch<Order>(`/orders/${id}/status`, data);
  },

  /**
   * Hủy đơn hàng và hoàn trả tồn kho
   */
  async cancelOrder(id: string, reason?: string): Promise<Order> {
    return apiClient.post<Order>(`/orders/${id}/cancel`, { reason });
  },
};
