import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { OrderModule } from '../order/order.module';
import { SyncService } from './sync.service';
import { SyncProcessor } from './sync.processor';
import { MarketplaceOrderImporter } from './marketplace-order-importer';

/**
 * SyncModule — BullMQ queue + worker đồng bộ sàn (TASK-013).
 * SyncProcessor tự tạo Worker khi module khởi động (onModuleInit) và đóng
 * khi tắt (onModuleDestroy). Cần Redis chạy (REDIS_URL) thì worker mới
 * nhận job; chưa có Redis thì worker log lỗi rõ ràng, không crash app.
 *
 * TASK-017: import OrderModule để MarketplaceOrderImporter lưu đơn sàn về
 * bảng orders qua OrderService (tái dùng resolve kho/variant). Không có
 * import vòng tròn: Sync → Order → Inventory/Warehouse → Database.
 */
@Module({
  imports: [DatabaseModule, OrderModule],
  providers: [SyncService, SyncProcessor, MarketplaceOrderImporter],
  exports: [SyncService],
})
export class SyncModule {}
