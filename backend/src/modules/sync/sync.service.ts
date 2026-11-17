import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  CHANNEL_SYNC_QUEUE,
  ChannelSyncJobData,
  SyncJobType,
  createChannelSyncQueue,
} from './sync.queue';
import type { Queue } from 'bullmq';

/**
 * SyncService — API phía backend cho queue đồng bộ sàn (TASK-013).
 * Chỉ enqueue job vào BullMQ; worker (SyncProcessor) mới là nơi gọi API sàn
 * và ghi SyncLog. Nếu Redis chưa chạy, `queue.add()` throw lỗi kết nối và
 * lỗi đó lan ra ngoài (không trả "thành công" giả).
 */
@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  private readonly queue: Queue<ChannelSyncJobData>;

  constructor(private readonly prisma: PrismaService) {
    this.queue = createChannelSyncQueue();
    // Không để lỗi kết nối Redis làm crash process âm thầm: BullMQ phát
    // 'error' trên Queue khi Redis rớt; log rõ để biết job không chạy được.
    this.queue.on('error', (err) => {
      this.logger.error(
        `BullMQ queue "${CHANNEL_SYNC_QUEUE}" lỗi Redis (${process.env.REDIS_URL || 'redis://localhost:6379'}): ${err.message}. ` +
          'Job đồng bộ sẽ không chạy cho tới khi Redis lên — kiểm tra `docker compose up redis` (TASK-010).',
      );
    });
  }

  /** Enqueue 1 job đồng bộ tồn kho + 1 job kéo đơn cho một kênh. Trả về job id từng job. */
  async enqueueChannelSync(input: {
    channelId: string;
    tenantId: string;
    channelType: string;
  }): Promise<Array<{ jobType: SyncJobType; jobId: string; status: string }>> {
    const jobs: Array<{ jobType: SyncJobType; jobId: string; status: string }> = [];
    const jobTypes: SyncJobType[] = ['sync-inventory', 'pull-orders'];
    for (const jobType of jobTypes) {
      // Job id cố định theo kênh + loại job: gọi sync 2 lần liên tiếp không
      // tạo job trùng đang chờ trong queue (BullMQ dedupe theo jobId).
      const job = await this.queue.add(
        jobType,
        { channelId: input.channelId, tenantId: input.tenantId, channelType: input.channelType },
        { jobId: `${input.channelId}:${jobType}` },
      );
      jobs.push({ jobType, jobId: String(job.id), status: 'QUEUED' });
      this.logger.log(`Enqueued job ${jobType} [${job.id}] cho channel [${input.channelId}].`);
    }
    return jobs;
  }

  /** SyncLog gần nhất của một kênh (cho GET /channels/:id/sync-status). */
  async getLatestSyncStatus(channelId: string, tenantId: string) {
    const log = await this.prisma.syncLog.findFirst({
      where: { channelId, tenantId },
      orderBy: { createdAt: 'desc' },
    });
    if (!log) return null;
    return {
      jobType: log.jobType,
      status: log.status,
      // TASK-017: successCount = số đơn đã lưu MỚI (pull-orders) hoặc số
      // variant đẩy tồn thành công (sync-inventory); pulledCount/skippedCount
      // chỉ có ý nghĩa với job pull-orders (job sync-inventory để 0).
      pulledCount: log.pulledCount,
      successCount: log.successCount,
      skippedCount: log.skippedCount,
      failureCount: log.failureCount,
      errorMessage: log.errorMessage,
      startedAt: log.startedAt,
      finishedAt: log.finishedAt,
      createdAt: log.createdAt,
    };
  }
}
