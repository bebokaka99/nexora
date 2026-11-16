import { Queue } from 'bullmq';

/**
 * BullMQ queue "channel-sync" (TASK-013).
 * Chạy trên Redis thật qua REDIS_URL (mặc định redis://localhost:6379).
 * Docker compose (TASK-010) đã có service `redis`; khi chạy bằng compose thì
 * REDIS_URL=redis://redis:6379 (xem .env.example).
 *
 * BullMQ yêu cầu connection có maxRetriesPerRequest: null (blocking commands).
 */

export const CHANNEL_SYNC_QUEUE = 'channel-sync';

export type SyncJobType = 'sync-inventory' | 'pull-orders';

export interface ChannelSyncJobData {
  channelId: string;
  tenantId: string;
  /** SHOPEE | TIKTOK_SHOP — các kênh khác chưa hỗ trợ, processor sẽ fail rõ ràng. */
  channelType: string;
  /** Đồng bộ đơn trong khoảng thời gian nào (mặc định 24h gần nhất). */
  sinceHours?: number;
}

/** Parse REDIS_URL thành option cho ioredis/BullMQ (không dùng URL string trực tiếp). */
export function redisConnectionOptions(): {
  host: string;
  port: number;
  password?: string;
  db: number;
  maxRetriesPerRequest: null;
} {
  const raw = process.env.REDIS_URL || 'redis://localhost:6379';
  let host = 'localhost';
  let port = 6379;
  let password: string | undefined;
  let db = 0;
  try {
    const u = new URL(raw);
    host = u.hostname || host;
    port = u.port ? Number(u.port) : port;
    password = u.password ? decodeURIComponent(u.password) : undefined;
    const dbPart = u.pathname.replace(/^\//, '');
    if (dbPart) db = Number(dbPart) || 0;
  } catch {
    // REDIS_URL sai định dạng → giữ mặc định localhost:6379; lỗi kết nối
    // sẽ hiện rõ khi enqueue (không giấu bằng fallback).
  }
  return { host, port, password, db, maxRetriesPerRequest: null };
}

export function createChannelSyncQueue(): Queue<ChannelSyncJobData> {
  return new Queue<ChannelSyncJobData>(CHANNEL_SYNC_QUEUE, {
    connection: redisConnectionOptions(),
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5_000 },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 100 },
    },
  });
}
