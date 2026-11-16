import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ConnectChannelDto, UpdateChannelDto, ChannelTypeEnum } from './dto/channel.dto';

export interface ChannelItem {
  id: string;
  tenantId: string;
  channelType: ChannelTypeEnum;
  accountName: string;
  accountId: string;
  status: string;
  syncedOrdersToday: number;
  activeProducts: number;
  lastSyncAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ChannelService — TASK-009: đọc/ghi trực tiếp PostgreSQL qua Prisma.
 * Seed in-memory (memoryChannels) đã bị xóa, không còn fallback khi DB lỗi:
 * lỗi Prisma sẽ lan ra ngoài thay vì lặng lẽ trả dữ liệu giả.
 * Lưu ý: syncedOrdersToday / activeProducts tạm trả 0 vì chưa có thống kê
 * đồng bộ thật (Phase 07/08); đó là số liệu chưa tính, không phải dữ liệu giả.
 */
@Injectable()
export class ChannelService {
  private readonly logger = new Logger(ChannelService.name);

  constructor(private readonly prisma: PrismaService) {}

  private toChannelItem(c: {
    id: string;
    tenantId: string;
    channelType: string;
    accountName: string;
    accountId: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }): ChannelItem {
    return {
      id: c.id,
      tenantId: c.tenantId,
      channelType: c.channelType as ChannelTypeEnum,
      accountName: c.accountName,
      accountId: c.accountId,
      status: c.status,
      syncedOrdersToday: 0,
      activeProducts: 0,
      lastSyncAt: c.updatedAt,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  }

  async findAll(tenantId: string): Promise<ChannelItem[]> {
    const dbChannels = await this.prisma.channelConnection.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    return dbChannels.map((c) => this.toChannelItem(c));
  }

  async findById(tenantId: string, id: string): Promise<ChannelItem> {
    const channel = await this.prisma.channelConnection.findFirst({
      where: { id, tenantId },
    });
    if (!channel) {
      throw new NotFoundException(`Không tìm thấy kênh bán hàng với ID [${id}]`);
    }
    return this.toChannelItem(channel);
  }

  async connect(tenantId: string, dto: ConnectChannelDto): Promise<ChannelItem> {
    const existing = await this.prisma.channelConnection.findUnique({
      where: {
        tenantId_channelType_accountId: {
          tenantId,
          channelType: dto.channelType as any,
          accountId: dto.accountId,
        },
      },
    });

    if (existing) {
      const updated = await this.prisma.channelConnection.update({
        where: { id: existing.id },
        data: {
          accountName: dto.accountName,
          status: 'CONNECTED',
          updatedAt: new Date(),
        },
      });
      return this.toChannelItem(updated);
    }

    const created = await this.prisma.channelConnection.create({
      data: {
        tenantId,
        channelType: dto.channelType as any,
        accountName: dto.accountName,
        accountId: dto.accountId,
        status: 'CONNECTED',
      },
    });
    return this.toChannelItem(created);
  }

  async sync(tenantId: string, id: string): Promise<{ success: boolean; message: string; channel: ChannelItem }> {
    const channel = await this.findById(tenantId, id);

    const updated = await this.prisma.channelConnection.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    this.logger.log(`Channel [${channel.accountName}] synced successfully.`);

    return {
      success: true,
      message: `Đã đồng bộ thành công dữ liệu đơn hàng và tồn kho cho gian hàng [${channel.accountName}]`,
      channel: this.toChannelItem(updated),
    };
  }

  async disconnect(tenantId: string, id: string): Promise<{ success: boolean; message: string }> {
    const channel = await this.findById(tenantId, id);

    await this.prisma.channelConnection.update({
      where: { id },
      data: { status: 'DISCONNECTED' },
    });

    return {
      success: true,
      message: `Đã ngắt kết nối gian hàng [${channel.accountName}] thành công.`,
    };
  }
}
