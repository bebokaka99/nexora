import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

export interface WarehouseEntity {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  type: string;
  address?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class WarehouseService {
  private readonly logger = new Logger(WarehouseService.name);

  // In-memory fallback repository
  private inMemoryWarehouses: WarehouseEntity[] = [
    {
      id: 'wh-001-q1',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      name: 'Kho Cửa Hàng 1 — Quận 1',
      code: 'WH-HCM-01',
      type: 'STORE_ATTACHED',
      address: '120 Hai Bà Trưng, P. Đa Kao, Q.1, TP. Hồ Chí Minh',
      isActive: true,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    },
    {
      id: 'wh-002-binh-thanh',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      name: 'Kho Cửa Hàng 2 — Bình Thạnh',
      code: 'WH-HCM-02',
      type: 'STORE_ATTACHED',
      address: '45 Bạch Đằng, P.15, Q. Bình Thạnh, TP. Hồ Chí Minh',
      isActive: true,
      createdAt: new Date('2026-01-05'),
      updatedAt: new Date('2026-01-05'),
    },
    {
      id: 'wh-003-central',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      name: 'Kho Tổng Trung Tâm & Thương Mại Điện Tử',
      code: 'WH-CENTRAL-01',
      type: 'CENTRAL',
      address: 'Lô B2 Cụm Kho Logistics Tân Bình, TP. Hồ Chí Minh',
      isActive: true,
      createdAt: new Date('2026-01-10'),
      updatedAt: new Date('2026-01-10'),
    },
  ];

  constructor(private readonly prisma: PrismaService) {}

  private async isPrismaReady(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Lấy danh sách toàn bộ kho hàng của Tenant
   */
  async findAll(tenantId: string): Promise<WarehouseEntity[]> {
    if (await this.isPrismaReady()) {
      return (await this.prisma.warehouse.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'asc' },
      })) as WarehouseEntity[];
    } else {
      return this.inMemoryWarehouses.filter((w) => w.tenantId === tenantId);
    }
  }

  /**
   * Lấy chi tiết kho hàng theo ID
   */
  async findById(tenantId: string, id: string): Promise<WarehouseEntity> {
    if (await this.isPrismaReady()) {
      const warehouse = await this.prisma.warehouse.findFirst({
        where: { id, tenantId },
      });
      if (!warehouse) {
        throw new NotFoundException(`Không tìm thấy kho hàng với ID: ${id}`);
      }
      return warehouse as WarehouseEntity;
    } else {
      const warehouse = this.inMemoryWarehouses.find(
        (w) => w.id === id && w.tenantId === tenantId,
      );
      if (!warehouse) {
        throw new NotFoundException(`Không tìm thấy kho hàng với ID: ${id}`);
      }
      return warehouse;
    }
  }

  /**
   * Thêm mới một kho hàng
   */
  async create(tenantId: string, dto: CreateWarehouseDto): Promise<WarehouseEntity> {
    if (await this.isPrismaReady()) {
      const existing = await this.prisma.warehouse.findFirst({
        where: { tenantId, code: dto.code },
      });
      if (existing) {
        throw new ConflictException(`Mã kho '${dto.code}' đã tồn tại trong doanh nghiệp`);
      }

      return (await this.prisma.warehouse.create({
        data: {
          tenantId,
          name: dto.name,
          code: dto.code,
          type: (dto.type as any) || 'STORE_ATTACHED',
          address: dto.address,
          isActive: true,
        },
      })) as WarehouseEntity;
    } else {
      const existing = this.inMemoryWarehouses.find(
        (w) => w.tenantId === tenantId && w.code.toLowerCase() === dto.code.toLowerCase(),
      );
      if (existing) {
        throw new ConflictException(`Mã kho '${dto.code}' đã tồn tại trong doanh nghiệp`);
      }

      const newWarehouse: WarehouseEntity = {
        id: `wh-${Date.now()}`,
        tenantId,
        name: dto.name,
        code: dto.code.toUpperCase(),
        type: dto.type || 'STORE_ATTACHED',
        address: dto.address || null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.inMemoryWarehouses.push(newWarehouse);
      this.logger.log(`Tạo kho hàng mới thành công: [${newWarehouse.code}] ${newWarehouse.name}`);
      return newWarehouse;
    }
  }

  /**
   * Cập nhật thông tin kho hàng
   */
  async update(tenantId: string, id: string, dto: UpdateWarehouseDto): Promise<WarehouseEntity> {
    await this.findById(tenantId, id);

    if (await this.isPrismaReady()) {
      if (dto.code) {
        const existingCode = await this.prisma.warehouse.findFirst({
          where: { tenantId, code: dto.code, NOT: { id } },
        });
        if (existingCode) {
          throw new ConflictException(`Mã kho '${dto.code}' đã được sử dụng`);
        }
      }

      return (await this.prisma.warehouse.update({
        where: { id },
        data: {
          ...(dto.name && { name: dto.name }),
          ...(dto.code && { code: dto.code }),
          ...(dto.type && { type: dto.type as any }),
          ...(dto.address !== undefined && { address: dto.address }),
          ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        },
      })) as WarehouseEntity;
    } else {
      const index = this.inMemoryWarehouses.findIndex(
        (w) => w.id === id && w.tenantId === tenantId,
      );
      if (index === -1) {
        throw new NotFoundException(`Không tìm thấy kho hàng với ID: ${id}`);
      }

      if (dto.code) {
        const duplicate = this.inMemoryWarehouses.find(
          (w) =>
            w.tenantId === tenantId &&
            w.id !== id &&
            w.code.toLowerCase() === dto.code.toLowerCase(),
        );
        if (duplicate) {
          throw new ConflictException(`Mã kho '${dto.code}' đã được sử dụng`);
        }
      }

      const current = this.inMemoryWarehouses[index];
      const updated: WarehouseEntity = {
        ...current,
        ...(dto.name && { name: dto.name }),
        ...(dto.code && { code: dto.code.toUpperCase() }),
        ...(dto.type && { type: dto.type }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        updatedAt: new Date(),
      };

      this.inMemoryWarehouses[index] = updated;
      return updated;
    }
  }
}
