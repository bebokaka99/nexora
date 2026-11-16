import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

// Giới hạn mặc định khi tenant chưa gắn gói (khớp gói GROWTH mẫu trước đây).
const DEFAULT_LIMITS = {
  code: 'GROWTH',
  name: 'Gói Tăng Trưởng',
  maxStores: 3,
  maxWarehouses: 3,
  maxUsers: 10,
  maxChannels: 5,
};

@Injectable()
export class TenantService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        stores: true,
        warehouses: true,
        plan: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException(`Không tìm thấy doanh nghiệp với ID: ${tenantId}`);
    }

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
            code: DEFAULT_LIMITS.code,
            name: DEFAULT_LIMITS.name,
            maxStores: DEFAULT_LIMITS.maxStores,
            maxWarehouses: DEFAULT_LIMITS.maxWarehouses,
            maxUsers: DEFAULT_LIMITS.maxUsers,
          },
      stores: tenant.stores,
      warehouses: tenant.warehouses,
    };
  }

  async getUsage(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { plan: true },
    });

    if (!tenant) {
      throw new NotFoundException(`Không tìm thấy doanh nghiệp với ID: ${tenantId}`);
    }

    const [storesCount, warehousesCount, usersCount, channelsCount] = await Promise.all([
      this.prisma.store.count({ where: { tenantId } }),
      this.prisma.warehouse.count({ where: { tenantId } }),
      this.prisma.user.count({ where: { tenantId } }),
      this.prisma.channelConnection.count({ where: { tenantId } }),
    ]);

    const maxStores = tenant.plan?.maxStores ?? DEFAULT_LIMITS.maxStores;
    const maxWarehouses = tenant.plan?.maxWarehouses ?? DEFAULT_LIMITS.maxWarehouses;
    const maxUsers = tenant.plan?.maxUsers ?? DEFAULT_LIMITS.maxUsers;
    const maxChannels = tenant.plan?.maxChannels ?? DEFAULT_LIMITS.maxChannels;

    const percent = (used: number, max: number) =>
      max > 0 ? Math.round((used / max) * 1000) / 10 : 0;

    return {
      tenantId,
      storesCount,
      maxStores,
      warehousesCount,
      maxWarehouses,
      usersCount,
      maxUsers,
      channelsCount,
      maxChannels,
      usagePercent: {
        stores: percent(storesCount, maxStores),
        warehouses: percent(warehousesCount, maxWarehouses),
        users: percent(usersCount, maxUsers),
        channels: percent(channelsCount, maxChannels),
      },
    };
  }
}
