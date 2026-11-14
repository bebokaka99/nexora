import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { WarehouseModule } from './modules/warehouse/warehouse.module';
import { StoreModule } from './modules/store/store.module';

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
  ],
})
export class AppModule {}
