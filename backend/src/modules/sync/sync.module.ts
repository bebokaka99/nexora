import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { SyncService } from './sync.service';
import { SyncProcessor } from './sync.processor';

/**
 * SyncModule — BullMQ queue + worker đồng bộ sàn (TASK-013).
 * SyncProcessor tự tạo Worker khi module khởi động (onModuleInit) và đóng
 * khi tắt (onModuleDestroy). Cần Redis chạy (REDIS_URL) thì worker mới
 * nhận job; chưa có Redis thì worker log lỗi rõ ràng, không crash app.
 */
@Module({
  imports: [DatabaseModule],
  providers: [SyncService, SyncProcessor],
  exports: [SyncService],
})
export class SyncModule {}
