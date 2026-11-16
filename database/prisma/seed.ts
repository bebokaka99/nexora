/**
 * NEXORA — Prisma seed (TASK-009).
 *
 * Seed tối thiểu qua Prisma Client (thay cho dữ liệu hardcode trong service):
 *  - 1 gói SubscriptionPlan (GROWTH)
 *  - 1 tenant demo (gia-dung-hien-dai)
 *  - 1 admin user (admin@nexora.vn) + roles TENANT_ADMIN / STORE_MANAGER
 *  - 1 store (CN1) + 1 warehouse (KHO-CN1)
 *  - 2 category + 3 sản phẩm mẫu kèm variant, tồn kho và 1 kết nối Shopee demo
 *
 * Yêu cầu biến môi trường:
 *  - DATABASE_URL: chuỗi kết nối PostgreSQL đã migrate 0001_init
 *    (chạy `prisma migrate dev` / `prisma migrate deploy` trước).
 *  - SEED_ADMIN_PASSWORD: mật khẩu admin seed. BẮT BUỘC — không có mật khẩu
 *    mặc định hardcode trong file này.
 *
 * Mật khẩu được hash bằng PBKDF2 (salt:hash, sha512, 1000 vòng, 64 byte),
 * đúng định dạng của JwtHelper.hashPassword() mà AuthService dùng để
 * đối chiếu khi đăng nhập.
 *
 * Chạy:  cd backend && npm run db:seed
 *        (hoặc: npx prisma db seed --schema=../database/prisma/schema.prisma)
 * Seed dùng upsert theo khóa unique nên chạy lại nhiều lần vẫn an toàn.
 */
import * as crypto from 'node:crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  // Giữ đồng bộ với backend/src/common/utils/jwt.helper.ts (JwtHelper.hashPassword)
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'Seed thất bại: thiếu biến môi trường DATABASE_URL. ' +
        'Đặt DATABASE_URL trỏ tới PostgreSQL đã chạy migration 0001_init rồi chạy lại.',
    );
  }

  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error(
      'Seed thất bại: thiếu biến môi trường SEED_ADMIN_PASSWORD. ' +
        'Đặt mật khẩu admin seed (VD: SEED_ADMIN_PASSWORD="..." npm run db:seed). ' +
        'Không dùng mật khẩu mặc định hardcode.',
    );
  }

  // 1. Gói đăng ký GROWTH
  const plan = await prisma.subscriptionPlan.upsert({
    where: { code: 'GROWTH' },
    update: {},
    create: {
      name: 'Gói Tăng Trưởng',
      code: 'GROWTH',
      maxStores: 3,
      maxWarehouses: 3,
      maxUsers: 10,
      maxChannels: 5,
      priceMonthly: 299000,
      priceYearly: 2990000,
    },
  });

  // 2. Tenant demo
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'gia-dung-hien-dai' },
    update: { planId: plan.id, status: 'ACTIVE' },
    create: {
      name: 'Gia Dụng Hiện Đại',
      slug: 'gia-dung-hien-dai',
      status: 'ACTIVE',
      planId: plan.id,
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  // 3. Roles của tenant
  const adminRole = await prisma.role.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'TENANT_ADMIN' } },
    update: {},
    create: {
      tenantId: tenant.id,
      code: 'TENANT_ADMIN',
      name: 'Quản trị tenant',
      description: 'Toàn quyền quản trị tenant',
      isSystem: true,
    },
  });
  const managerRole = await prisma.role.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'STORE_MANAGER' } },
    update: {},
    create: {
      tenantId: tenant.id,
      code: 'STORE_MANAGER',
      name: 'Quản lý cửa hàng',
      isSystem: true,
    },
  });
  await prisma.role.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'CASHIER' } },
    update: {},
    create: {
      tenantId: tenant.id,
      code: 'CASHIER',
      name: 'Thu ngân',
      isSystem: true,
    },
  });

  // 4. Warehouse + Store (store trỏ defaultWarehouse về kho CN1)
  const warehouse = await prisma.warehouse.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'KHO-CN1' } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Kho Cửa Hàng 1 (Tại chỗ)',
      code: 'KHO-CN1',
      type: 'STORE_ATTACHED',
      address: 'Số 142 Nguyễn Thị Minh Khai, P. Bến Nghé, Quận 1, TP. HCM',
      isActive: true,
    },
  });

  const store = await prisma.store.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'CN1' } },
    update: { defaultWarehouseId: warehouse.id },
    create: {
      tenantId: tenant.id,
      name: 'NEXORA Store — Chi Nhánh 1 (Quận 1)',
      code: 'CN1',
      address: 'Số 142 Nguyễn Thị Minh Khai, P. Bến Nghé, Quận 1, TP. HCM',
      phoneNumber: '028 3822 1199',
      defaultWarehouseId: warehouse.id,
      isActive: true,
    },
  });

  // 5. Admin user + gán role
  const admin = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'admin@nexora.vn' } },
    update: { passwordHash: hashPassword(adminPassword), storeId: store.id },
    create: {
      tenantId: tenant.id,
      email: 'admin@nexora.vn',
      passwordHash: hashPassword(adminPassword),
      fullName: 'Quản Trị Viên NEXORA',
      status: 'ACTIVE',
      storeId: store.id,
    },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
    update: {},
    create: { userId: admin.id, roleId: adminRole.id },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: managerRole.id } },
    update: {},
    create: { userId: admin.id, roleId: managerRole.id },
  });

  // 6. Category + sản phẩm mẫu
  const catGiaDung = await prisma.category.upsert({
    where: { tenantId_slug: { tenantId: tenant.id, slug: 'do-gia-dung' } },
    update: {},
    create: { tenantId: tenant.id, name: 'Đồ gia dụng', slug: 'do-gia-dung' },
  });
  const catNhaBep = await prisma.category.upsert({
    where: { tenantId_slug: { tenantId: tenant.id, slug: 'nha-bep' } },
    update: {},
    create: { tenantId: tenant.id, name: 'Nhà bếp', slug: 'nha-bep' },
  });

  const sampleProducts = [
    {
      name: 'Nồi chiên không dầu 5.5L',
      slug: 'noi-chien-khong-dau-55l',
      categoryId: catNhaBep.id,
      sku: 'NCKD-55L-001',
      variantName: 'Mặc định',
      costPrice: 990000,
      sellingPrice: 1490000,
      onHandQty: 50,
    },
    {
      name: 'Máy xay sinh tố đa năng 1.5L',
      slug: 'may-xay-sinh-to-da-nang-15l',
      categoryId: catNhaBep.id,
      sku: 'MXST-15L-001',
      variantName: 'Mặc định',
      costPrice: 590000,
      sellingPrice: 890000,
      onHandQty: 35,
    },
    {
      name: 'Bộ nồi inox 5 món cao cấp',
      slug: 'bo-noi-inox-5-mon-cao-cap',
      categoryId: catGiaDung.id,
      sku: 'BNI-5M-001',
      variantName: 'Mặc định',
      costPrice: 1490000,
      sellingPrice: 2190000,
      onHandQty: 20,
    },
  ];

  for (const p of sampleProducts) {
    const product = await prisma.product.upsert({
      where: { tenantId_slug: { tenantId: tenant.id, slug: p.slug } },
      update: {},
      create: {
        tenantId: tenant.id,
        categoryId: p.categoryId,
        name: p.name,
        slug: p.slug,
        status: 'ACTIVE',
      },
    });
    const variant = await prisma.productVariant.upsert({
      where: { tenantId_sku: { tenantId: tenant.id, sku: p.sku } },
      update: {},
      create: {
        tenantId: tenant.id,
        productId: product.id,
        sku: p.sku,
        variantName: p.variantName,
        costPrice: p.costPrice,
        sellingPrice: p.sellingPrice,
      },
    });
    await prisma.inventory.upsert({
      where: {
        tenantId_warehouseId_variantId: {
          tenantId: tenant.id,
          warehouseId: warehouse.id,
          variantId: variant.id,
        },
      },
      update: {},
      create: {
        tenantId: tenant.id,
        warehouseId: warehouse.id,
        variantId: variant.id,
        onHandQty: p.onHandQty,
        committedQty: 0,
        availableQty: p.onHandQty,
      },
    });
  }

  // 7. Kết nối Shopee demo (dữ liệu thật trong DB, chưa phải tích hợp sàn thật — xem TASK-013)
  await prisma.channelConnection.upsert({
    where: {
      tenantId_channelType_accountId: {
        tenantId: tenant.id,
        channelType: 'SHOPEE',
        accountId: 'shopee_mall_98214',
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      channelType: 'SHOPEE',
      accountName: 'Shopee Mall - Gia Dụng Cao Cấp',
      accountId: 'shopee_mall_98214',
      status: 'CONNECTED',
    },
  });

  console.log('Seed xong:');
  console.log(`  - Tenant: ${tenant.name} (${tenant.slug})`);
  console.log(`  - Admin: admin@nexora.vn (mật khẩu lấy từ SEED_ADMIN_PASSWORD)`);
  console.log(`  - Store: ${store.code} | Warehouse: ${warehouse.code}`);
  console.log(`  - Sản phẩm mẫu: ${sampleProducts.length} (kèm variant + tồn kho)`);
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
