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


  constructor(
    private readonly prisma: PrismaService,
    private readonly warehouseService: WarehouseService,
  ) {}


  /**
   * Lấy danh sách toàn bộ cửa hàng của Tenant kèm thông tin kho mặc định
   */
  async findAll(tenantId: string): Promise<StoreEntity[]> {
    return (await this.prisma.store.findMany({
      where: { tenantId },
      include: { defaultWarehouse: true },
      orderBy: { createdAt: 'asc' },
    })) as StoreEntity[];
  }

  /**
   * Xem thông tin chi tiết một cửa hàng
   */
  async findById(tenantId: string, id: string): Promise<StoreEntity> {
    const store = await this.prisma.store.findFirst({
      where: { id, tenantId },
      include: { defaultWarehouse: true },
    });
    if (!store) {
      throw new NotFoundException(`Không tìm thấy cửa hàng với ID: ${id}`);
    }
    return store as StoreEntity;
  }

  /**
   * Thêm mới một cửa hàng
   */
  async create(tenantId: string, dto: CreateStoreDto): Promise<StoreEntity> {
    if (dto.defaultWarehouseId) {
      await this.warehouseService.findById(tenantId, dto.defaultWarehouseId);
    }

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
  }

  /**
   * Cập nhật thông tin cửa hàng
   */
  async update(tenantId: string, id: string, dto: UpdateStoreDto): Promise<StoreEntity> {
    await this.findById(tenantId, id);

    if (dto.defaultWarehouseId) {
      await this.warehouseService.findById(tenantId, dto.defaultWarehouseId);
    }

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
  }
}
