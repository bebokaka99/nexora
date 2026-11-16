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
    // TASK-014: không còn mock fallback — API lỗi thì throw để UI hiện trạng thái lỗi thật.
    return apiClient.get<ChannelConnection[]>('/channels');
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
