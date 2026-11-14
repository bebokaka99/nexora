import { Module } from '@nestjs/common';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';
import { DatabaseModule } from '../../database/database.module';
import { WarehouseModule } from '../warehouse/warehouse.module';

@Module({
  imports: [DatabaseModule, WarehouseModule],
  controllers: [StoreController],
  providers: [StoreService],
  exports: [StoreService],
})
export class StoreModule {}
