/**
 * NEXORA Commerce OS — Store & Warehouse Service
 * API client methods to manage physical retail branches and attached warehouses.
 */

import { apiClient } from '../api-client';

export type WarehouseType = 'STORE_ATTACHED' | 'CENTRAL' | 'TRANSIT';

export interface Warehouse {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  type: WarehouseType;
  address: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Store {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  address: string;
  phoneNumber?: string | null;
  defaultWarehouseId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  defaultWarehouse?: Warehouse | null;
  todayRevenue?: number;
  ordersCount?: number;
  cashiers?: string[];
}

export interface CreateStoreInput {
  name: string;
  code: string;
  address: string;
  phoneNumber?: string;
  defaultWarehouseId?: string;
}

export interface UpdateStoreInput {
  name?: string;
  code?: string;
  address?: string;
  phoneNumber?: string;
  defaultWarehouseId?: string;
  isActive?: boolean;
}

export interface CreateWarehouseInput {
  name: string;
  code: string;
  type?: WarehouseType;
  address: string;
}

export const storeService = {
  /**
   * Lấy danh sách toàn bộ chi nhánh cửa hàng
   */
  async getStores(): Promise<Store[]> {
    return apiClient.get<Store[]>('/stores');
  },

  /**
   * Xem chi tiết 1 chi nhánh cửa hàng theo ID
   */
  async getStoreById(id: string): Promise<Store> {
    return apiClient.get<Store>(`/stores/${id}`);
  },

  /**
   * Tạo chi nhánh cửa hàng mới
   */
  async createStore(payload: CreateStoreInput): Promise<Store> {
    return apiClient.post<Store>('/stores', payload);
  },

  /**
   * Cập nhật thông tin chi nhánh cửa hàng
   */
  async updateStore(id: string, payload: UpdateStoreInput): Promise<Store> {
    return apiClient.patch<Store>(`/stores/${id}`, payload);
  },

  /**
   * Lấy danh sách toàn bộ kho hàng
   */
  async getWarehouses(): Promise<Warehouse[]> {
    return apiClient.get<Warehouse[]>('/warehouses');
  },

  /**
   * Xem chi tiết 1 kho hàng
   */
  async getWarehouseById(id: string): Promise<Warehouse> {
    return apiClient.get<Warehouse>(`/warehouses/${id}`);
  },

  /**
   * Tạo kho hàng mới
   */
  async createWarehouse(payload: CreateWarehouseInput): Promise<Warehouse> {
    return apiClient.post<Warehouse>('/warehouses', payload);
  },
};
