import { apiClient } from '../api-client';

export interface ChannelConnection {
  id: string;
  tenantId: string;
  channelType: 'POS' | 'SHOPEE' | 'TIKTOK_SHOP' | 'FACEBOOK' | 'MANUAL';
  accountName: string;
  accountId: string;
  status: string;
  syncedOrdersToday?: number;
  activeProducts?: number;
  lastSyncAt?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ConnectChannelDto {
  channelType: string;
  accountName: string;
  accountId: string;
  accessToken?: string;
  refreshToken?: string;
}

export const channelService = {
  async getChannels(): Promise<ChannelConnection[]> {
    try {
      return await apiClient.get<ChannelConnection[]>('/channels');
    } catch {
      // Fallback
      return [
        {
          id: 'chan-001',
          tenantId: 'tenant-demo-giadung',
          channelType: 'SHOPEE',
          accountName: 'Shopee Mall - Gia Dụng Cao Cấp',
          accountId: 'shopee_mall_98214',
          status: 'CONNECTED',
          syncedOrdersToday: 64,
          activeProducts: 50,
          lastSyncAt: new Date(Date.now() - 60 * 1000).toISOString(),
        },
        {
          id: 'chan-002',
          tenantId: 'tenant-demo-giadung',
          channelType: 'TIKTOK_SHOP',
          accountName: 'TikTok Shop - NEXORA Home Store',
          accountId: 'tt_shop_55109',
          status: 'CONNECTED',
          syncedOrdersToday: 42,
          activeProducts: 35,
          lastSyncAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        },
        {
          id: 'chan-003',
          tenantId: 'tenant-demo-giadung',
          channelType: 'FACEBOOK',
          accountName: 'Facebook Page - Thế Giới Đồ Gia Dụng',
          accountId: 'fb_page_102948',
          status: 'CONNECTED',
          syncedOrdersToday: 12,
          activeProducts: 45,
          lastSyncAt: new Date().toISOString(),
        },
      ];
    }
  },

  async connectChannel(dto: ConnectChannelDto): Promise<ChannelConnection> {
    return apiClient.post<ChannelConnection>('/channels/connect', dto);
  },

  async syncChannel(id: string): Promise<{ success: boolean; message: string; channel: ChannelConnection }> {
    return apiClient.post<{ success: boolean; message: string; channel: ChannelConnection }>(
      `/channels/${id}/sync`,
      {},
    );
  },

  async disconnectChannel(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(`/channels/${id}`);
  },
};
