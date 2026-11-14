import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { WarehouseService } from '../warehouse/warehouse.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

export interface StoreEntity {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  address: string;
  phoneNumber?: string | null;
  defaultWarehouseId?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  defaultWarehouse?: any;
}

@Injectable()
export class StoreService {
  private readonly logger = new Logger(StoreService.name);

  // In-memory fallback repository
  private inMemoryStores: StoreEntity[] = [
    {
      id: 'store-001-q1',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      name: 'Cửa Hàng 1 — Chi nhánh Quận 1',
      code: 'STORE-HCM-01',
      address: '120 Hai Bà Trưng, P. Đa Kao, Q.1, TP. Hồ Chí Minh',
      phoneNumber: '028 3822 9999',
      defaultWarehouseId: 'wh-001-q1',
      isActive: true,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    },
    {
      id: 'store-002-binh-thanh',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      name: 'Cửa Hàng 2 — Chi nhánh Bình Thạnh',
      code: 'STORE-HCM-02',
      address: '45 Bạch Đằng, P.15, Q. Bình Thạnh, TP. Hồ Chí Minh',
      phoneNumber: '028 3511 8888',
      defaultWarehouseId: 'wh-002-binh-thanh',
      isActive: true,
      createdAt: new Date('2026-01-05'),
      updatedAt: new Date('2026-01-05'),
    },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly warehouseService: WarehouseService,
  ) {}

  private async isPrismaReady(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Lấy danh sách toàn bộ cửa hàng của Tenant kèm thông tin kho mặc định
   */
  async findAll(tenantId: string): Promise<StoreEntity[]> {
    if (await this.isPrismaReady()) {
      return (await this.prisma.store.findMany({
        where: { tenantId },
        include: { defaultWarehouse: true },
        orderBy: { createdAt: 'asc' },
      })) as StoreEntity[];
    } else {
      const stores = this.inMemoryStores.filter((s) => s.tenantId === tenantId);
      const warehouses = await this.warehouseService.findAll(tenantId);

      return stores.map((s) => ({
        ...s,
        defaultWarehouse: warehouses.find((w) => w.id === s.defaultWarehouseId) || null,
      }));
    }
  }

  /**
   * Xem thông tin chi tiết một cửa hàng
   */
  async findById(tenantId: string, id: string): Promise<StoreEntity> {
    if (await this.isPrismaReady()) {
      const store = await this.prisma.store.findFirst({
        where: { id, tenantId },
        include: { defaultWarehouse: true },
      });
      if (!store) {
        throw new NotFoundException(`Không tìm thấy cửa hàng với ID: ${id}`);
      }
      return store as StoreEntity;
    } else {
      const store = this.inMemoryStores.find(
        (s) => s.id === id && s.tenantId === tenantId,
      );
      if (!store) {
        throw new NotFoundException(`Không tìm thấy cửa hàng với ID: ${id}`);
      }
      const warehouse = store.defaultWarehouseId
        ? await this.warehouseService.findById(tenantId, store.defaultWarehouseId).catch(() => null)
        : null;

      return {
        ...store,
        defaultWarehouse: warehouse,
      };
    }
  }

  /**
   * Thêm mới một cửa hàng
   */
  async create(tenantId: string, dto: CreateStoreDto): Promise<StoreEntity> {
    if (dto.defaultWarehouseId) {
      await this.warehouseService.findById(tenantId, dto.defaultWarehouseId);
    }

    if (await this.isPrismaReady()) {
      const existing = await this.prisma.store.findFirst({
        where: { tenantId, code: dto.code },
      });
      if (existing) {
        throw new ConflictException(`Mã cửa hàng '${dto.code}' đã tồn tại trong doanh nghiệp`);
      }

      return (await this.prisma.store.create({
        data: {
          tenantId,
          name: dto.name,
          code: dto.code,
          address: dto.address,
          phoneNumber: dto.phoneNumber,
          defaultWarehouseId: dto.defaultWarehouseId,
          isActive: true,
        },
        include: { defaultWarehouse: true },
      })) as StoreEntity;
    } else {
      const existing = this.inMemoryStores.find(
        (s) => s.tenantId === tenantId && s.code.toLowerCase() === dto.code.toLowerCase(),
      );
      if (existing) {
        throw new ConflictException(`Mã cửa hàng '${dto.code}' đã tồn tại trong doanh nghiệp`);
      }

      const newStore: StoreEntity = {
        id: `store-${Date.now()}`,
        tenantId,
        name: dto.name,
        code: dto.code.toUpperCase(),
        address: dto.address,
        phoneNumber: dto.phoneNumber || null,
        defaultWarehouseId: dto.defaultWarehouseId || null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const warehouse = dto.defaultWarehouseId
        ? await this.warehouseService.findById(tenantId, dto.defaultWarehouseId).catch(() => null)
        : null;

      this.inMemoryStores.push(newStore);
      this.logger.log(`Tạo cửa hàng mới thành công: [${newStore.code}] ${newStore.name}`);

      return {
        ...newStore,
        defaultWarehouse: warehouse,
      };
    }
  }

  /**
   * Cập nhật thông tin cửa hàng
   */
  async update(tenantId: string, id: string, dto: UpdateStoreDto): Promise<StoreEntity> {
    await this.findById(tenantId, id);

    if (dto.defaultWarehouseId) {
      await this.warehouseService.findById(tenantId, dto.defaultWarehouseId);
    }

    if (await this.isPrismaReady()) {
      if (dto.code) {
        const existingCode = await this.prisma.store.findFirst({
          where: { tenantId, code: dto.code, NOT: { id } },
        });
        if (existingCode) {
          throw new ConflictException(`Mã cửa hàng '${dto.code}' đã được sử dụng`);
        }
      }

      return (await this.prisma.store.update({
        where: { id },
        data: {
          ...(dto.name && { name: dto.name }),
          ...(dto.code && { code: dto.code }),
          ...(dto.address && { address: dto.address }),
          ...(dto.phoneNumber !== undefined && { phoneNumber: dto.phoneNumber }),
          ...(dto.defaultWarehouseId !== undefined && { defaultWarehouseId: dto.defaultWarehouseId }),
          ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        },
        include: { defaultWarehouse: true },
      })) as StoreEntity;
    } else {
      const index = this.inMemoryStores.findIndex(
        (s) => s.id === id && s.tenantId === tenantId,
      );
      if (index === -1) {
        throw new NotFoundException(`Không tìm thấy cửa hàng với ID: ${id}`);
      }

      if (dto.code) {
        const duplicate = this.inMemoryStores.find(
          (s) =>
            s.tenantId === tenantId &&
            s.id !== id &&
            s.code.toLowerCase() === dto.code.toLowerCase(),
        );
        if (duplicate) {
          throw new ConflictException(`Mã cửa hàng '${dto.code}' đã được sử dụng`);
        }
      }

      const current = this.inMemoryStores[index];
      const updated: StoreEntity = {
        ...current,
        ...(dto.name && { name: dto.name }),
        ...(dto.code && { code: dto.code.toUpperCase() }),
        ...(dto.address && { address: dto.address }),
        ...(dto.phoneNumber !== undefined && { phoneNumber: dto.phoneNumber }),
        ...(dto.defaultWarehouseId !== undefined && { defaultWarehouseId: dto.defaultWarehouseId }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        updatedAt: new Date(),
      };

      this.inMemoryStores[index] = updated;
      const warehouse = updated.defaultWarehouseId
        ? await this.warehouseService.findById(tenantId, updated.defaultWarehouseId).catch(() => null)
        : null;

      return {
        ...updated,
        defaultWarehouse: warehouse,
      };
    }
  }
}
