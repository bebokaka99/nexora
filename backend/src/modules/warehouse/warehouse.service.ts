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


  constructor(private readonly prisma: PrismaService) {}


  /**
   * Lấy danh sách toàn bộ kho hàng của Tenant
   */
  async findAll(tenantId: string): Promise<WarehouseEntity[]> {
    return (await this.prisma.warehouse.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'asc' },
    })) as WarehouseEntity[];
  }

  /**
   * Lấy chi tiết kho hàng theo ID
   */
  async findById(tenantId: string, id: string): Promise<WarehouseEntity> {
    const warehouse = await this.prisma.warehouse.findFirst({
      where: { id, tenantId },
    });
    if (!warehouse) {
      throw new NotFoundException(`Không tìm thấy kho hàng với ID: ${id}`);
    }
    return warehouse as WarehouseEntity;
  }

  /**
   * Thêm mới một kho hàng
   */
  async create(tenantId: string, dto: CreateWarehouseDto): Promise<WarehouseEntity> {
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
  }

  /**
   * Cập nhật thông tin kho hàng
   */
  async update(tenantId: string, id: string, dto: UpdateWarehouseDto): Promise<WarehouseEntity> {
    await this.findById(tenantId, id);

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
  }
}
