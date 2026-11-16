import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ConnectChannelDto, UpdateChannelDto, ChannelTypeEnum } from './dto/channel.dto';
import { SyncService } from '../sync/sync.service';

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
 *
 * TASK-013: sync() KHÔNG còn cập nhật lastSyncAt giả. Nó enqueue 2 job thật
 * (sync-inventory + pull-orders) vào BullMQ queue "channel-sync"; worker
 * (SyncProcessor) mới là nơi gọi API sàn, ghi SyncLog và chỉ cập nhật
 * lastSyncAt khi job thành công. Nếu Redis chưa chạy, enqueue throw lỗi
 * kết nối và lỗi đó trả về cho client (không trả "thành công" giả).
 */
@Injectable()
export class ChannelService {
  private readonly logger = new Logger(ChannelService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly syncService: SyncService,
  ) {}

  private toChannelItem(c: {
    id: string;
    tenantId: string;
    channelType: string;
    accountName: string;
    accountId: string;
    status: string;
    lastSyncAt: Date | null;
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
      // lastSyncAt thật từ DB (null = chưa từng đồng bộ thành công).
      // Trước TASK-013 field này lấy từ updatedAt nên mọi lần update đều
      // làm "vừa đồng bộ" giả; giờ chỉ processor mới ghi khi job thành công.
      lastSyncAt: c.lastSyncAt ?? c.updatedAt,
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

  /**
   * TASK-013: enqueue job đồng bộ thật thay vì cập nhật lastSyncAt giả.
   * Trả về job id + trạng thái QUEUED; trạng thái chạy thật xem ở
   * GET /channels/:id/sync-status. Redis chưa chạy → throw lỗi kết nối.
   */
  async sync(
    tenantId: string,
    id: string,
  ): Promise<{ success: boolean; message: string; channel: ChannelItem; jobs: Array<{ jobType: string; jobId: string; status: string }> }> {
    const channel = await this.findById(tenantId, id);

    const jobs = await this.syncService.enqueueChannelSync({
      channelId: channel.id,
      tenantId,
      channelType: channel.channelType,
    });

    this.logger.log(
      `Channel [${channel.accountName}] đã enqueue ${jobs.length} job đồng bộ: ${jobs.map((j) => j.jobId).join(', ')}.`,
    );

    return {
      success: true,
      message: `Đã đưa gian hàng [${channel.accountName}] vào hàng đợi đồng bộ (job ${jobs.map((j) => j.jobId).join(', ')}). Kiểm tra tiến độ ở GET /channels/${channel.id}/sync-status.`,
      channel,
      jobs,
    };
  }

  /** Trạng thái SyncLog gần nhất của kênh (null = chưa từng chạy job nào). */
  async getSyncStatus(tenantId: string, id: string) {
    const channel = await this.findById(tenantId, id);
    const latest = await this.syncService.getLatestSyncStatus(channel.id, tenantId);
    return { channelId: channel.id, accountName: channel.accountName, latest };
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
