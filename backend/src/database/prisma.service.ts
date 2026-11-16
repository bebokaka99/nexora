import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * PrismaService — TASK-009 fail-fast:
 * Backend KHÔNG được khởi động khi thiếu DATABASE_URL hoặc khi PostgreSQL
 * không kết nối được. Trước đây onModuleInit chỉ warn rồi backend vẫn chạy
 * bằng dữ liệu giả (fallback in-memory); hành vi đó đã bị xóa.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: ['warn', 'error'],
    });
  }

  async onModuleInit() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error(
        'NEXORA Backend không thể khởi động: thiếu biến môi trường DATABASE_URL. ' +
          'Đặt DATABASE_URL trỏ tới PostgreSQL đã chạy migration 0001_init ' +
          '(VD: postgresql://nexora:nexora@localhost:5432/nexora). ' +
          'Backend không chạy bằng dữ liệu giả khi thiếu DATABASE_URL.',
      );
    }
    this.logger.log('Prisma client initializing...');
    try {
      await this.$connect();
      this.logger.log('Prisma connected to PostgreSQL successfully.');
    } catch (error) {
      throw new Error(
        'NEXORA Backend không thể khởi động: không kết nối được PostgreSQL qua DATABASE_URL. ' +
          `Kiểm tra PostgreSQL đã chạy, DATABASE_URL đúng và migration 0001_init đã áp dụng. Lỗi gốc: ${error.message}`,
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma disconnected.');
  }
}
