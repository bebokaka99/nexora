import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TenantService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(tenantId: string) {
    try {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
        include: {
          stores: true,
          warehouses: true,
          plan: true,
        },
      });

      if (tenant) {
        return {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          status: tenant.status,
          trialEndsAt: tenant.trialEndsAt,
          plan: tenant.plan
            ? {
                code: tenant.plan.code,
                name: tenant.plan.name,
                maxStores: tenant.plan.maxStores,
                maxWarehouses: tenant.plan.maxWarehouses,
                maxUsers: tenant.plan.maxUsers,
              }
            : {
                code: 'GROWTH',
                name: 'Gói Tăng Trưởng',
                maxStores: 3,
                maxWarehouses: 3,
                maxUsers: 10,
              },
          stores: tenant.stores,
          warehouses: tenant.warehouses,
        };
      }
    } catch {
      // Ignore DB error, use fallback
    }

    // In-memory fallback
    return {
      id: tenantId,
      name: 'Gia Dụng Hiện Đại',
      slug: 'gia-dung-hien-dai',
      status: 'ACTIVE',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      plan: {
        code: 'GROWTH',
        name: 'Gói Tăng Trưởng',
        maxStores: 3,
        maxWarehouses: 3,
        maxUsers: 10,
      },
      stores: [
        {
          id: 'store-1',
          name: 'NEXORA Store — Chi Nhánh 1 (Quận 1)',
          code: 'CN1',
          address: 'Số 142 Nguyễn Thị Minh Khai, P. Bến Nghé, Quận 1, TP. HCM',
          phoneNumber: '028 3822 1199',
          isActive: true,
        },
        {
          id: 'store-2',
          name: 'NEXORA Store — Chi Nhánh 2 (Bình Thạnh)',
          code: 'CN2',
          address: 'Số 305 Bạch Đằng, Phường 15, Quận Bình Thạnh, TP. HCM',
          phoneNumber: '028 3511 8822',
          isActive: true,
        },
      ],
      warehouses: [
        {
          id: 'wh-1',
          name: 'Kho Cửa Hàng 1 (Tại chỗ)',
          code: 'KHO-CN1',
          type: 'STORE_ATTACHED',
          isActive: true,
        },
        {
          id: 'wh-2',
          name: 'Kho Cửa Hàng 2 (Tại chỗ)',
          code: 'KHO-CN2',
          type: 'STORE_ATTACHED',
          isActive: true,
        },
      ],
    };
  }

  async getUsage(tenantId: string) {
    return {
      tenantId,
      storesCount: 2,
      maxStores: 3,
      warehousesCount: 2,
      maxWarehouses: 3,
      usersCount: 4,
      maxUsers: 10,
      channelsCount: 3,
      maxChannels: 5,
      usagePercent: {
        stores: 66.7,
        warehouses: 66.7,
        users: 40.0,
        channels: 60.0,
      },
    };
  }
}
