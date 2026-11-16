import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { StoreModule } from './modules/store/store.module';
import { WarehouseModule } from './modules/warehouse/warehouse.module';
import { ProductModule } from './modules/product/product.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { OrderModule } from './modules/order/order.module';
import { ChannelModule } from './modules/channel/channel.module';
import { SyncModule } from './modules/sync/sync.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.development', '.env.local'],
    }),
    DatabaseModule,
    HealthModule,
    AuthModule,
    TenantModule,
    WarehouseModule,
    StoreModule,
    ProductModule,
    InventoryModule,
    OrderModule,
    ChannelModule,
    SyncModule,
  ],
})
export class AppModule {}
