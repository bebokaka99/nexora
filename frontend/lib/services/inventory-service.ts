/**
 * NEXORA Commerce OS — Inventory & Stock Transfer Service
 * API client methods to manage multi-warehouse inventory matrix, goods receipts, and stock transfers.
 */

import { apiClient } from '../api-client';

export interface InventoryItem {
  id: string;
  tenantId: string;
  warehouseId: string;
  variantId: string;
  sku: string;
  productName: string;
  onHandQty: number;
  committedQty: number;
  availableQty: number;
  updatedAt: string;
}

export type TransferStatus = 'PENDING' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';

export interface StockTransferItem {
  variantId: string;
  sku: string;
  productName?: string;
  quantity: number;
}

export interface StockTransfer {
  id: string;
  tenantId: string;
  transferNumber: string;
  sourceWarehouseId: string;
  targetWarehouseId: string;
  status: TransferStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  items: StockTransferItem[];
}

export interface CreateGoodsReceiptInput {
  warehouseId: string;
  items: {
    variantId: string;
    sku: string;
    productName?: string;
    quantity: number;
    costPrice?: number;
  }[];
  notes?: string;
}

export interface CreateStockTransferInput {
  sourceWarehouseId: string;
  targetWarehouseId: string;
  items: {
    variantId: string;
    sku: string;
    productName?: string;
    quantity: number;
  }[];
  notes?: string;
}

export interface ReserveStockInput {
  warehouseId: string;
  variantId: string;
  quantity: number;
  referenceId?: string;
}

export interface InventoryTransaction {
  id: string;
  tenantId: string;
  warehouseId: string;
  variantId: string;
  sku: string;
  type: string;
  quantity: number;
  balanceOnHand: number;
  referenceId?: string | null;
  note?: string | null;
  createdAt: string;
}

export const inventoryService = {
  /**
   * Tra cứu ma trận tồn kho (hỗ trợ lọc theo kho, mã SKU, hoặc sắp hết hàng)
   */
  async getInventories(params?: {
    warehouseId?: string;
    sku?: string;
    lowStockOnly?: boolean;
  }): Promise<InventoryItem[]> {
    const query = new URLSearchParams();
    if (params?.warehouseId) query.set('warehouseId', params.warehouseId);
    if (params?.sku) query.set('sku', params.sku);
    if (params?.lowStockOnly) query.set('lowStockOnly', 'true');

    const queryString = query.toString();
    const endpoint = queryString ? `/inventories?${queryString}` : '/inventories';
    return apiClient.get<InventoryItem[]>(endpoint);
  },

  /**
   * Lập phiếu nhập hàng mới (Goods Receipt)
   */
  async createGoodsReceipt(
    payload: CreateGoodsReceiptInput,
  ): Promise<{ receiptNumber: string; updatedItems: InventoryItem[] }> {
    return apiClient.post<{ receiptNumber: string; updatedItems: InventoryItem[] }>(
      '/inventories/receipts',
      payload,
    );
  },

  /**
   * Lấy danh sách các phiếu chuyển kho nội bộ
   */
  async getTransfers(): Promise<StockTransfer[]> {
    return apiClient.get<StockTransfer[]>('/inventories/transfers');
  },

  /**
   * Khởi tạo phiếu chuyển kho nội bộ mới
   */
  async createStockTransfer(
    payload: CreateStockTransferInput,
  ): Promise<StockTransfer> {
    return apiClient.post<StockTransfer>('/inventories/transfers', payload);
  },

  /**
   * Xác nhận xuất hàng chuyển kho (PENDING -> IN_TRANSIT)
   */
  async shipTransfer(id: string): Promise<StockTransfer> {
    return apiClient.patch<StockTransfer>(`/inventories/transfers/${id}/ship`, {});
  },

  /**
   * Xác nhận đã nhận hàng chuyển kho (IN_TRANSIT -> COMPLETED)
   */
  async receiveTransfer(id: string): Promise<StockTransfer> {
    return apiClient.patch<StockTransfer>(`/inventories/transfers/${id}/receive`, {});
  },

  /**
   * Kiểm tra & Khóa/Trừ tồn kho bán lẻ hoặc đơn hàng chống bán vượt tồn (Concurrency Lock)
   */
  async reserveOrDeductStock(
    payload: ReserveStockInput,
  ): Promise<{ success: boolean; remainingAvailable: number }> {
    return apiClient.post<{ success: boolean; remainingAvailable: number }>(
      '/inventories/reserve',
      payload,
    );
  },

  /**
   * Lấy nhật ký biến động kho (Audit Trail)
   */
  async getTransactions(warehouseId?: string): Promise<InventoryTransaction[]> {
    const endpoint = warehouseId
      ? `/inventories/transactions?warehouseId=${encodeURIComponent(warehouseId)}`
      : '/inventories/transactions';
    return apiClient.get<InventoryTransaction[]>(endpoint);
  },
};
