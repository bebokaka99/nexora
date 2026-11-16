import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { WarehouseService } from '../warehouse/warehouse.service';
import { CreateGoodsReceiptDto } from './dto/create-goods-receipt.dto';
import { CreateStockTransferDto } from './dto/create-stock-transfer.dto';
import { QueryInventoryDto } from './dto/query-inventory.dto';
import { ReserveStockDto } from './dto/reserve-stock.dto';

export interface InventoryItemEntity {
  id: string;
  tenantId: string;
  warehouseId: string;
  variantId: string;
  sku: string;
  productName: string;
  onHandQty: number;
  committedQty: number;
  availableQty: number;
  updatedAt: Date;
}

export interface StockTransferEntity {
  id: string;
  tenantId: string;
  transferNumber: string;
  sourceWarehouseId: string;
  targetWarehouseId: string;
  status: 'PENDING' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: {
    variantId: string;
    sku: string;
    productName?: string;
    quantity: number;
  }[];
}

export interface InventoryTransactionEntity {
  id: string;
  tenantId: string;
  warehouseId: string;
  variantId: string;
  sku: string;
  type:
    | 'RECEIPT'
    | 'TRANSFER_OUT'
    | 'TRANSFER_IN'
    | 'POS_SALE'
    | 'COMMITTED_RESERVE'
    | 'COMMITTED_RELEASE'
    | 'ADJUSTMENT';
  quantity: number;
  balanceOnHand: number;
  referenceId?: string | null;
  note?: string | null;
  createdAt: Date;
}

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  // In-Memory Fallback Seed Data cho 9 mặt hàng đồ gia dụng
  private inMemoryInventories: InventoryItemEntity[] = [
    // 1. Nồi chiên không dầu Tefal 5.6L (PROD-01, NCKD-TF-56L)
    {
      id: 'inv-01-wh1',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      warehouseId: 'wh-001-q1',
      variantId: 'PROD-01',
      sku: 'NCKD-TF-56L',
      productName: 'Nồi chiên không dầu điện tử Tefal 5.6L Easy Fry',
      onHandQty: 14,
      committedQty: 2,
      availableQty: 12,
      updatedAt: new Date(),
    },
    {
      id: 'inv-01-wh2',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      warehouseId: 'wh-002-binh-thanh',
      variantId: 'PROD-01',
      sku: 'NCKD-TF-56L',
      productName: 'Nồi chiên không dầu điện tử Tefal 5.6L Easy Fry',
      onHandQty: 8,
      committedQty: 1,
      availableQty: 7,
      updatedAt: new Date(),
    },
    {
      id: 'inv-01-wh3',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      warehouseId: 'wh-003-central',
      variantId: 'PROD-01',
      sku: 'NCKD-TF-56L',
      productName: 'Nồi chiên không dầu điện tử Tefal 5.6L Easy Fry',
      onHandQty: 45,
      committedQty: 5,
      availableQty: 40,
      updatedAt: new Date(),
    },

    // 2. Nồi chiên không dầu Lock&Lock 5.2L (PROD-02, NCKD-LL-52L)
    {
      id: 'inv-02-wh1',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      warehouseId: 'wh-001-q1',
      variantId: 'PROD-02',
      sku: 'NCKD-LL-52L',
      productName: 'Nồi chiên không dầu Lock&Lock 5.2L EJF351BLK',
      onHandQty: 8,
      committedQty: 2,
      availableQty: 6,
      updatedAt: new Date(),
    },
    {
      id: 'inv-02-wh2',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      warehouseId: 'wh-002-binh-thanh',
      variantId: 'PROD-02',
      sku: 'NCKD-LL-52L',
      productName: 'Nồi chiên không dầu Lock&Lock 5.2L EJF351BLK',
      onHandQty: 12,
      committedQty: 2,
      availableQty: 10,
      updatedAt: new Date(),
    },
    {
      id: 'inv-02-wh3',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      warehouseId: 'wh-003-central',
      variantId: 'PROD-02',
      sku: 'NCKD-LL-52L',
      productName: 'Nồi chiên không dầu Lock&Lock 5.2L EJF351BLK',
      onHandQty: 35,
      committedQty: 4,
      availableQty: 31,
      updatedAt: new Date(),
    },

    // 3. Chảo xào chống dính Ceramic Elmich 28cm (PROD-03, CD-EM-28)
    {
      id: 'inv-03-wh1',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      warehouseId: 'wh-001-q1',
      variantId: 'PROD-03',
      sku: 'CD-EM-28',
      productName: 'Chảo xào chống dính Ceramic Elmich 28cm đáy từ',
      onHandQty: 22,
      committedQty: 1,
      availableQty: 21,
      updatedAt: new Date(),
    },
    {
      id: 'inv-03-wh2',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      warehouseId: 'wh-002-binh-thanh',
      variantId: 'PROD-03',
      sku: 'CD-EM-28',
      productName: 'Chảo xào chống dính Ceramic Elmich 28cm đáy từ',
      onHandQty: 18,
      committedQty: 1,
      availableQty: 17,
      updatedAt: new Date(),
    },
    {
      id: 'inv-03-wh3',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      warehouseId: 'wh-003-central',
      variantId: 'PROD-03',
      sku: 'CD-EM-28',
      productName: 'Chảo xào chống dính Ceramic Elmich 28cm đáy từ',
      onHandQty: 60,
      committedQty: 2,
      availableQty: 58,
      updatedAt: new Date(),
    },

    // 4. Chảo chiên vân đá siêu bền Sunhouse 26cm (PROD-04, CD-SH-26)
    {
      id: 'inv-04-wh1',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      warehouseId: 'wh-001-q1',
      variantId: 'PROD-04',
      sku: 'CD-SH-26',
      productName: 'Chảo chiên vân đá siêu bền Sunhouse 26cm',
      onHandQty: 30,
      committedQty: 3,
      availableQty: 27,
      updatedAt: new Date(),
    },
    {
      id: 'inv-04-wh2',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      warehouseId: 'wh-002-binh-thanh',
      variantId: 'PROD-04',
      sku: 'CD-SH-26',
      productName: 'Chảo chiên vân đá siêu bền Sunhouse 26cm',
      onHandQty: 25,
      committedQty: 2,
      availableQty: 23,
      updatedAt: new Date(),
    },

    // 5. Ấm siêu tốc thủy tinh Philips 1.7L (PROD-05, AST-PL-17)
    {
      id: 'inv-05-wh1',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      warehouseId: 'wh-001-q1',
      variantId: 'PROD-05',
      sku: 'AST-PL-17',
      productName: 'Ấm siêu tốc thủy tinh Philips 1.7L LED HD9339',
      onHandQty: 16,
      committedQty: 1,
      availableQty: 15,
      updatedAt: new Date(),
    },
    {
      id: 'inv-05-wh2',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      warehouseId: 'wh-002-binh-thanh',
      variantId: 'PROD-05',
      sku: 'AST-PL-17',
      productName: 'Ấm siêu tốc thủy tinh Philips 1.7L LED HD9339',
      onHandQty: 10,
      committedQty: 1,
      availableQty: 9,
      updatedAt: new Date(),
    },

    // 6. Ấm siêu tốc Inox 304 Sunhouse 1.8L (PROD-06, AST-SH-18)
    {
      id: 'inv-06-wh1',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      warehouseId: 'wh-001-q1',
      variantId: 'PROD-06',
      sku: 'AST-SH-18',
      productName: 'Ấm siêu tốc Inox 304 Sunhouse 1.8L giữ nhiệt 2 lớp',
      onHandQty: 25,
      committedQty: 2,
      availableQty: 23,
      updatedAt: new Date(),
    },
    {
      id: 'inv-06-wh2',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      warehouseId: 'wh-002-binh-thanh',
      variantId: 'PROD-06',
      sku: 'AST-SH-18',
      productName: 'Ấm siêu tốc Inox 304 Sunhouse 1.8L giữ nhiệt 2 lớp',
      onHandQty: 20,
      committedQty: 1,
      availableQty: 19,
      updatedAt: new Date(),
    },

    // 7. Máy xay sinh tố đa năng Sunhouse (PROD-07, MXST-3C-WHT)
    {
      id: 'inv-07-wh1',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      warehouseId: 'wh-001-q1',
      variantId: 'PROD-07',
      sku: 'MXST-3C-WHT',
      productName: 'Máy xay sinh tố đa năng Sunhouse 3 cối thủy tinh',
      onHandQty: 9,
      committedQty: 1,
      availableQty: 8,
      updatedAt: new Date(),
    },
    {
      id: 'inv-07-wh2',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      warehouseId: 'wh-002-binh-thanh',
      variantId: 'PROD-07',
      sku: 'MXST-3C-WHT',
      productName: 'Máy xay sinh tố đa năng Sunhouse 3 cối thủy tinh',
      onHandQty: 7,
      committedQty: 0,
      availableQty: 7,
      updatedAt: new Date(),
    },

    // 8. Máy xay cầm tay Braun MultiQuick 5 (PROD-08, MX-BR-MQ)
    {
      id: 'inv-08-wh1',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      warehouseId: 'wh-001-q1',
      variantId: 'PROD-08',
      sku: 'MX-BR-MQ',
      productName: 'Máy xay cầm tay Braun MultiQuick 5 1000W',
      onHandQty: 4,
      committedQty: 1,
      availableQty: 3,
      updatedAt: new Date(),
    },
    {
      id: 'inv-08-wh2',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      warehouseId: 'wh-002-binh-thanh',
      variantId: 'PROD-08',
      sku: 'MX-BR-MQ',
      productName: 'Máy xay cầm tay Braun MultiQuick 5 1000W',
      onHandQty: 3,
      committedQty: 1,
      availableQty: 2,
      updatedAt: new Date(),
    },

    // 9. Nồi cơm điện cao tần Cuckoo 1.8L (PROD-09, NC-CK-18L)
    {
      id: 'inv-09-wh1',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      warehouseId: 'wh-001-q1',
      variantId: 'PROD-09',
      sku: 'NC-CK-18L',
      productName: 'Nồi cơm điện cao tần Cuckoo 1.8L CRP-PK1000S',
      onHandQty: 5,
      committedQty: 1,
      availableQty: 4,
      updatedAt: new Date(),
    },
    {
      id: 'inv-09-wh2',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      warehouseId: 'wh-002-binh-thanh',
      variantId: 'PROD-09',
      sku: 'NC-CK-18L',
      productName: 'Nồi cơm điện cao tần Cuckoo 1.8L CRP-PK1000S',
      onHandQty: 6,
      committedQty: 1,
      availableQty: 5,
      updatedAt: new Date(),
    },
  ];

  // In-Memory Fallback Seed Data cho Phiếu chuyển kho
  private inMemoryTransfers: StockTransferEntity[] = [
    {
      id: 'tr-001',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      transferNumber: 'TR-2026-001',
      sourceWarehouseId: 'wh-003-central',
      targetWarehouseId: 'wh-001-q1',
      status: 'COMPLETED',
      notes: 'Bổ sung tồn kho đầu tuần từ Kho Tổng sang Chi Nhánh 1',
      createdAt: new Date('2026-01-12T08:00:00Z'),
      updatedAt: new Date('2026-01-12T14:30:00Z'),
      items: [
        {
          variantId: 'PROD-01',
          sku: 'NCKD-TF-56L',
          productName: 'Nồi chiên không dầu điện tử Tefal 5.6L Easy Fry',
          quantity: 10,
        },
      ],
    },
    {
      id: 'tr-002',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      transferNumber: 'TR-2026-002',
      sourceWarehouseId: 'wh-001-q1',
      targetWarehouseId: 'wh-002-binh-thanh',
      status: 'IN_TRANSIT',
      notes: 'Điều phối hàng gấp hỗ trợ đơn bán lẻ tại Bình Thạnh',
      createdAt: new Date('2026-01-14T09:15:00Z'),
      updatedAt: new Date('2026-01-14T10:00:00Z'),
      items: [
        {
          variantId: 'PROD-08',
          sku: 'MX-BR-MQ',
          productName: 'Máy xay cầm tay Braun MultiQuick 5 1000W',
          quantity: 2,
        },
      ],
    },
  ];

  // In-Memory Transactions Log
  private inMemoryTransactions: InventoryTransactionEntity[] = [];

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
   * 1. Tra cứu ma trận tồn kho toàn bộ hoặc theo bộ lọc (Warehouse, SKU, Low Stock)
   */
  async findAll(tenantId: string, query: QueryInventoryDto): Promise<InventoryItemEntity[]> {
    if (await this.isPrismaReady()) {
      const where: any = { tenantId };
      if (query.warehouseId) {
        where.warehouseId = query.warehouseId;
      }
      if (query.sku) {
        where.variant = { sku: query.sku };
      }
      if (query.lowStockOnly) {
        where.availableQty = { lte: 5 };
      }

      const rows = await this.prisma.inventory.findMany({
        where,
        include: {
          variant: true,
          warehouse: true,
        },
        orderBy: { updatedAt: 'desc' },
      });

      return rows.map((r: any) => ({
        id: r.id,
        tenantId: r.tenantId,
        warehouseId: r.warehouseId,
        variantId: r.variantId,
        sku: r.variant?.sku || '',
        productName: r.variant?.variantName || '',
        onHandQty: r.onHandQty,
        committedQty: r.committedQty,
        availableQty: r.availableQty,
        updatedAt: r.updatedAt,
      }));
    } else {
      let filtered = this.inMemoryInventories.filter((i) => i.tenantId === tenantId);
      if (query.warehouseId) {
        filtered = filtered.filter((i) => i.warehouseId === query.warehouseId);
      }
      if (query.sku) {
        filtered = filtered.filter(
          (i) => i.sku.toLowerCase() === query.sku!.toLowerCase(),
        );
      }
      if (query.lowStockOnly) {
        filtered = filtered.filter((i) => i.availableQty <= 5);
      }
      return filtered;
    }
  }

  /**
   * 2. Lập Phiếu Nhập Hàng (Goods Receipt) — Tăng tồn thực tế và ghi transaction
   */
  async createReceipt(
    tenantId: string,
    dto: CreateGoodsReceiptDto,
  ): Promise<{ receiptNumber: string; updatedItems: InventoryItemEntity[] }> {
    // Xác thực kho hàng thuộc về Tenant
    await this.warehouseService.findById(tenantId, dto.warehouseId);

    const receiptNumber = `RC-${Date.now().toString().slice(-6)}`;
    const updatedItems: InventoryItemEntity[] = [];

    for (const item of dto.items) {
      if (await this.isPrismaReady()) {
        const inv = await this.prisma.inventory.upsert({
          where: {
            tenantId_warehouseId_variantId: {
              tenantId,
              warehouseId: dto.warehouseId,
              variantId: item.variantId,
            },
          },
          update: {
            onHandQty: { increment: item.quantity },
            availableQty: { increment: item.quantity },
          },
          create: {
            tenantId,
            warehouseId: dto.warehouseId,
            variantId: item.variantId,
            onHandQty: item.quantity,
            committedQty: 0,
            availableQty: item.quantity,
          },
          include: { variant: true },
        });

        // Ghi transaction
        await this.prisma.inventoryTransaction.create({
          data: {
            tenantId,
            warehouseId: dto.warehouseId,
            variantId: item.variantId,
            type: 'RECEIPT',
            quantity: item.quantity,
            balanceOnHand: inv.onHandQty,
            referenceId: receiptNumber,
            note: dto.notes || `Nhập hàng theo phiếu ${receiptNumber}`,
          },
        });

        updatedItems.push({
          id: inv.id,
          tenantId: inv.tenantId,
          warehouseId: inv.warehouseId,
          variantId: inv.variantId,
          sku: inv.variant?.sku || item.sku,
          productName: inv.variant?.variantName || item.productName || item.sku,
          onHandQty: inv.onHandQty,
          committedQty: inv.committedQty,
          availableQty: inv.availableQty,
          updatedAt: inv.updatedAt,
        });
      } else {
        // Fallback in-memory
        let inv = this.inMemoryInventories.find(
          (i) =>
            i.tenantId === tenantId &&
            i.warehouseId === dto.warehouseId &&
            (i.variantId === item.variantId || i.sku === item.sku),
        );

        if (inv) {
          inv.onHandQty += item.quantity;
          inv.availableQty = Math.max(0, inv.onHandQty - inv.committedQty);
          inv.updatedAt = new Date();
        } else {
          inv = {
            id: `inv-gen-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            tenantId,
            warehouseId: dto.warehouseId,
            variantId: item.variantId,
            sku: item.sku,
            productName: item.productName || item.sku,
            onHandQty: item.quantity,
            committedQty: 0,
            availableQty: item.quantity,
            updatedAt: new Date(),
          };
          this.inMemoryInventories.push(inv);
        }

        this.inMemoryTransactions.push({
          id: `tx-${Date.now()}`,
          tenantId,
          warehouseId: dto.warehouseId,
          variantId: item.variantId,
          sku: item.sku,
          type: 'RECEIPT',
          quantity: item.quantity,
          balanceOnHand: inv.onHandQty,
          referenceId: receiptNumber,
          note: dto.notes || `Nhập hàng theo phiếu ${receiptNumber}`,
          createdAt: new Date(),
        });

        updatedItems.push({ ...inv });
      }
    }

    this.logger.log(
      `[Receipt Created] ${receiptNumber} into Warehouse: ${dto.warehouseId} for Tenant: ${tenantId}`,
    );

    return { receiptNumber, updatedItems };
  }

  /**
   * 3. Lấy danh sách các Phiếu Chuyển Kho (Stock Transfers)
   */
  async findTransfers(tenantId: string): Promise<StockTransferEntity[]> {
    if (await this.isPrismaReady()) {
      const transfers = await this.prisma.stockTransfer.findMany({
        where: { tenantId },
        include: {
          items: {
            include: { variant: true },
          },
          sourceWarehouse: true,
          targetWarehouse: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return transfers.map((t: any) => ({
        id: t.id,
        tenantId: t.tenantId,
        transferNumber: t.transferNumber,
        sourceWarehouseId: t.sourceWarehouseId,
        targetWarehouseId: t.targetWarehouseId,
        status: t.status,
        notes: t.notes,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        items: t.items.map((item: any) => ({
          variantId: item.variantId,
          sku: item.variant?.sku || '',
          productName: item.variant?.variantName || '',
          quantity: item.quantity,
        })),
      }));
    } else {
      return this.inMemoryTransfers
        .filter((t) => t.tenantId === tenantId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  }

  /**
   * 4. Tạo Phiếu Chuyển Kho Mới (Stock Transfer)
   * Kiểm tra tính khả dụng của tồn kho nguồn trước khi khởi tạo
   */
  async createTransfer(
    tenantId: string,
    dto: CreateStockTransferDto,
  ): Promise<StockTransferEntity> {
    if (dto.sourceWarehouseId === dto.targetWarehouseId) {
      throw new BadRequestException('Kho xuất và kho nhập không được trùng nhau');
    }

    // Xác thực cả 2 kho hàng
    await this.warehouseService.findById(tenantId, dto.sourceWarehouseId);
    await this.warehouseService.findById(tenantId, dto.targetWarehouseId);

    // Kiểm tra tồn kho tại kho xuất
    for (const item of dto.items) {
      let sourceInv: InventoryItemEntity | undefined;
      if (await this.isPrismaReady()) {
        const inv = await this.prisma.inventory.findUnique({
          where: {
            tenantId_warehouseId_variantId: {
              tenantId,
              warehouseId: dto.sourceWarehouseId,
              variantId: item.variantId,
            },
          },
        });
        if (inv) {
          sourceInv = {
            id: inv.id,
            tenantId: inv.tenantId,
            warehouseId: inv.warehouseId,
            variantId: inv.variantId,
            sku: item.sku,
            productName: item.productName || item.sku,
            onHandQty: inv.onHandQty,
            committedQty: inv.committedQty,
            availableQty: inv.availableQty,
            updatedAt: inv.updatedAt,
          };
        }
      } else {
        sourceInv = this.inMemoryInventories.find(
          (i) =>
            i.tenantId === tenantId &&
            i.warehouseId === dto.sourceWarehouseId &&
            (i.variantId === item.variantId || i.sku === item.sku),
        );
      }

      if (!sourceInv || sourceInv.availableQty < item.quantity) {
        throw new ConflictException(
          `ORDER_INSUFFICIENT_STOCK: Kho xuất không đủ tồn khả dụng cho mặt hàng SKU: ${item.sku}. Tồn hiện có: ${sourceInv?.availableQty || 0}, yêu cầu chuyển: ${item.quantity}`,
        );
      }
    }

    const transferNumber = `TR-${Date.now().toString().slice(-6)}`;

    if (await this.isPrismaReady()) {
      const transfer = await this.prisma.stockTransfer.create({
        data: {
          tenantId,
          transferNumber,
          sourceWarehouseId: dto.sourceWarehouseId,
          targetWarehouseId: dto.targetWarehouseId,
          status: 'PENDING',
          notes: dto.notes,
          items: {
            create: dto.items.map((i) => ({
              variantId: i.variantId,
              quantity: i.quantity,
            })),
          },
        },
        include: {
          items: { include: { variant: true } },
        },
      });

      return {
        id: transfer.id,
        tenantId: transfer.tenantId,
        transferNumber: transfer.transferNumber,
        sourceWarehouseId: transfer.sourceWarehouseId,
        targetWarehouseId: transfer.targetWarehouseId,
        status: transfer.status,
        notes: transfer.notes,
        createdAt: transfer.createdAt,
        updatedAt: transfer.updatedAt,
        items: transfer.items.map((item: any) => ({
          variantId: item.variantId,
          sku: item.variant?.sku || '',
          productName: item.variant?.variantName || '',
          quantity: item.quantity,
        })),
      };
    } else {
      const transfer: StockTransferEntity = {
        id: `tr-${Date.now()}`,
        tenantId,
        transferNumber,
        sourceWarehouseId: dto.sourceWarehouseId,
        targetWarehouseId: dto.targetWarehouseId,
        status: 'PENDING',
        notes: dto.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: dto.items,
      };
      this.inMemoryTransfers.push(transfer);
      return transfer;
    }
  }

  /**
   * 5. Xác nhận Xuất Hàng Chuyển Kho (Ship Transfer)
   * Trạng thái: PENDING -> IN_TRANSIT
   * Trừ tồn thực tế tại kho xuất và ghi nhận nhật ký TRANSFER_OUT
   */
  async shipTransfer(tenantId: string, id: string): Promise<StockTransferEntity> {
    let transfer: StockTransferEntity | undefined;

    if (await this.isPrismaReady()) {
      const dbTransfer = await this.prisma.stockTransfer.findFirst({
        where: { id, tenantId },
        include: { items: { include: { variant: true } } },
      });
      if (!dbTransfer) {
        throw new NotFoundException(`Không tìm thấy phiếu chuyển kho: ${id}`);
      }
      if (dbTransfer.status !== 'PENDING') {
        throw new BadRequestException(
          `Phiếu chuyển kho đang ở trạng thái ${dbTransfer.status}, không thể xuất kho`,
        );
      }

      // Xử lý trừ tồn kho xuất trong Transaction
      await this.prisma.$transaction(async (tx: any) => {
        for (const item of dbTransfer.items) {
          const inv = await tx.inventory.findUnique({
            where: {
              tenantId_warehouseId_variantId: {
                tenantId,
                warehouseId: dbTransfer.sourceWarehouseId,
                variantId: item.variantId,
              },
            },
          });

          if (!inv || inv.onHandQty < item.quantity) {
            throw new ConflictException(
              `ORDER_INSUFFICIENT_STOCK: Kho xuất không đủ tồn để thực hiện xuất hàng`,
            );
          }

          const updated = await tx.inventory.update({
            where: { id: inv.id },
            data: {
              onHandQty: { decrement: item.quantity },
              availableQty: { decrement: item.quantity },
            },
          });

          await tx.inventoryTransaction.create({
            data: {
              tenantId,
              warehouseId: dbTransfer.sourceWarehouseId,
              variantId: item.variantId,
              type: 'TRANSFER_OUT',
              quantity: -item.quantity,
              balanceOnHand: updated.onHandQty,
              referenceId: dbTransfer.transferNumber,
              note: `Xuất kho điều chuyển sang kho đích`,
            },
          });
        }

        await tx.stockTransfer.update({
          where: { id },
          data: { status: 'IN_TRANSIT' },
        });
      });

      return (await this.findTransfers(tenantId)).find((t) => t.id === id)!;
    } else {
      // In-memory fallback
      transfer = this.inMemoryTransfers.find((t) => t.id === id && t.tenantId === tenantId);
      if (!transfer) {
        throw new NotFoundException(`Không tìm thấy phiếu chuyển kho: ${id}`);
      }
      if (transfer.status !== 'PENDING') {
        throw new BadRequestException(
          `Phiếu chuyển kho đang ở trạng thái ${transfer.status}, không thể xuất kho`,
        );
      }

      // Trừ tồn kho xuất
      for (const item of transfer.items) {
        const inv = this.inMemoryInventories.find(
          (i) =>
            i.tenantId === tenantId &&
            i.warehouseId === transfer!.sourceWarehouseId &&
            (i.variantId === item.variantId || i.sku === item.sku),
        );
        if (!inv || inv.onHandQty < item.quantity) {
          throw new ConflictException(
            `ORDER_INSUFFICIENT_STOCK: Tồn kho xuất không đủ để xuất kho`,
          );
        }
        inv.onHandQty -= item.quantity;
        inv.availableQty = Math.max(0, inv.onHandQty - inv.committedQty);
        inv.updatedAt = new Date();

        this.inMemoryTransactions.push({
          id: `tx-${Date.now()}-${Math.random()}`,
          tenantId,
          warehouseId: transfer.sourceWarehouseId,
          variantId: item.variantId,
          sku: item.sku,
          type: 'TRANSFER_OUT',
          quantity: -item.quantity,
          balanceOnHand: inv.onHandQty,
          referenceId: transfer.transferNumber,
          note: `Xuất điều chuyển sang kho đích`,
          createdAt: new Date(),
        });
      }

      transfer.status = 'IN_TRANSIT';
      transfer.updatedAt = new Date();
      return transfer;
    }
  }

  /**
   * 6. Xác nhận Đã Nhận Hàng Chuyển Kho (Receive Transfer)
   * Trạng thái: IN_TRANSIT -> COMPLETED
   * Cộng tồn thực tế tại kho đích và ghi nhận nhật ký TRANSFER_IN
   */
  async receiveTransfer(tenantId: string, id: string): Promise<StockTransferEntity> {
    if (await this.isPrismaReady()) {
      const dbTransfer = await this.prisma.stockTransfer.findFirst({
        where: { id, tenantId },
        include: { items: { include: { variant: true } } },
      });
      if (!dbTransfer) {
        throw new NotFoundException(`Không tìm thấy phiếu chuyển kho: ${id}`);
      }
      if (dbTransfer.status !== 'IN_TRANSIT') {
        throw new BadRequestException(
          `Chỉ phiếu chuyển kho ở trạng thái IN_TRANSIT mới có thể bấm Nhận hàng`,
        );
      }

      await this.prisma.$transaction(async (tx: any) => {
        for (const item of dbTransfer.items) {
          const inv = await tx.inventory.upsert({
            where: {
              tenantId_warehouseId_variantId: {
                tenantId,
                warehouseId: dbTransfer.targetWarehouseId,
                variantId: item.variantId,
              },
            },
            update: {
              onHandQty: { increment: item.quantity },
              availableQty: { increment: item.quantity },
            },
            create: {
              tenantId,
              warehouseId: dbTransfer.targetWarehouseId,
              variantId: item.variantId,
              onHandQty: item.quantity,
              committedQty: 0,
              availableQty: item.quantity,
            },
          });

          await tx.inventoryTransaction.create({
            data: {
              tenantId,
              warehouseId: dbTransfer.targetWarehouseId,
              variantId: item.variantId,
              type: 'TRANSFER_IN',
              quantity: item.quantity,
              balanceOnHand: inv.onHandQty,
              referenceId: dbTransfer.transferNumber,
              note: `Nhập kho từ điều chuyển thành công`,
            },
          });
        }

        await tx.stockTransfer.update({
          where: { id },
          data: { status: 'COMPLETED' },
        });
      });

      return (await this.findTransfers(tenantId)).find((t) => t.id === id)!;
    } else {
      const transfer = this.inMemoryTransfers.find(
        (t) => t.id === id && t.tenantId === tenantId,
      );
      if (!transfer) {
        throw new NotFoundException(`Không tìm thấy phiếu chuyển kho: ${id}`);
      }
      if (transfer.status !== 'IN_TRANSIT') {
        throw new BadRequestException(
          `Chỉ phiếu chuyển kho ở trạng thái IN_TRANSIT mới có thể bấm Nhận hàng`,
        );
      }

      for (const item of transfer.items) {
        let inv = this.inMemoryInventories.find(
          (i) =>
            i.tenantId === tenantId &&
            i.warehouseId === transfer!.targetWarehouseId &&
            (i.variantId === item.variantId || i.sku === item.sku),
        );

        if (inv) {
          inv.onHandQty += item.quantity;
          inv.availableQty = Math.max(0, inv.onHandQty - inv.committedQty);
          inv.updatedAt = new Date();
        } else {
          inv = {
            id: `inv-target-${Date.now()}`,
            tenantId,
            warehouseId: transfer.targetWarehouseId,
            variantId: item.variantId,
            sku: item.sku,
            productName: item.productName || item.sku,
            onHandQty: item.quantity,
            committedQty: 0,
            availableQty: item.quantity,
            updatedAt: new Date(),
          };
          this.inMemoryInventories.push(inv);
        }

        this.inMemoryTransactions.push({
          id: `tx-${Date.now()}-${Math.random()}`,
          tenantId,
          warehouseId: transfer.targetWarehouseId,
          variantId: item.variantId,
          sku: item.sku,
          type: 'TRANSFER_IN',
          quantity: item.quantity,
          balanceOnHand: inv.onHandQty,
          referenceId: transfer.transferNumber,
          note: `Nhập kho từ phiếu chuyển ${transfer.transferNumber}`,
          createdAt: new Date(),
        });
      }

      transfer.status = 'COMPLETED';
      transfer.updatedAt = new Date();
      return transfer;
    }
  }

  /**
   * 7. Concurrency Lock & Stock Reserve / Deduction (Khóa chống bán vượt tồn kho)
   * Phục vụ POS Terminal và Webhook Đơn hàng sàn TMĐT
   */
  async reserveOrDeductStock(
    tenantId: string,
    dto: ReserveStockDto,
  ): Promise<{ success: boolean; remainingAvailable: number }> {
    if (await this.isPrismaReady()) {
      // Sử dụng Prisma Transaction với Pessimistic Lock logic
      return await this.prisma.$transaction(async (tx: any) => {
        // Raw query SELECT FOR UPDATE để khóa bản ghi tồn kho
        const rows: any[] = await tx.$queryRaw`
          SELECT id, on_hand_qty, committed_qty, available_qty
          FROM inventories
          WHERE tenant_id = ${tenantId}
            AND warehouse_id = ${dto.warehouseId}
            AND variant_id = ${dto.variantId}
          FOR UPDATE
        `;

        if (!rows || rows.length === 0) {
          throw new NotFoundException('Không tìm thấy bản ghi tồn kho cho mặt hàng này');
        }

        const current = rows[0];
        const currentAvailable = Number(current.available_qty);

        if (currentAvailable < dto.quantity) {
          throw new ConflictException(
            `ORDER_INSUFFICIENT_STOCK: Tồn kho khả dụng không đủ. Hiện có: ${currentAvailable}, yêu cầu: ${dto.quantity}`,
          );
        }

        const newOnHand = Number(current.on_hand_qty) - dto.quantity;
        const newAvailable = currentAvailable - dto.quantity;

        await tx.inventory.update({
          where: { id: current.id },
          data: {
            onHandQty: newOnHand,
            availableQty: newAvailable,
          },
        });

        await tx.inventoryTransaction.create({
          data: {
            tenantId,
            warehouseId: dto.warehouseId,
            variantId: dto.variantId,
            type: 'POS_SALE',
            quantity: -dto.quantity,
            balanceOnHand: newOnHand,
            referenceId: dto.referenceId || 'POS-SALE',
            note: 'Trừ tồn bán hàng tại quầy POS',
          },
        });

        return {
          success: true,
          remainingAvailable: newAvailable,
        };
      });
    } else {
      // In-Memory atomic check & deduction
      const inv = this.inMemoryInventories.find(
        (i) =>
          i.tenantId === tenantId &&
          i.warehouseId === dto.warehouseId &&
          (i.variantId === dto.variantId || i.sku === dto.variantId),
      );

      if (!inv) {
        throw new NotFoundException('Không tìm thấy bản ghi tồn kho');
      }

      if (inv.availableQty < dto.quantity) {
        throw new ConflictException(
          `ORDER_INSUFFICIENT_STOCK: Tồn kho khả dụng không đủ. Hiện có: ${inv.availableQty}, yêu cầu: ${dto.quantity}`,
        );
      }

      inv.onHandQty -= dto.quantity;
      inv.availableQty = Math.max(0, inv.onHandQty - inv.committedQty);
      inv.updatedAt = new Date();

      this.inMemoryTransactions.push({
        id: `tx-${Date.now()}`,
        tenantId,
        warehouseId: dto.warehouseId,
        variantId: dto.variantId,
        sku: inv.sku,
        type: 'POS_SALE',
        quantity: -dto.quantity,
        balanceOnHand: inv.onHandQty,
        referenceId: dto.referenceId || 'POS-SALE',
        note: 'Trừ tồn bán hàng trực tiếp tại quầy',
        createdAt: new Date(),
      });

      return {
        success: true,
        remainingAvailable: inv.availableQty,
      };
    }
  }

  /**
   * 8. Lấy lịch sử biến động kho (Inventory Transactions Log)
   */
  async findTransactions(
    tenantId: string,
    warehouseId?: string,
  ): Promise<InventoryTransactionEntity[]> {
    if (await this.isPrismaReady()) {
      const where: any = { tenantId };
      if (warehouseId) where.warehouseId = warehouseId;

      const txs = await this.prisma.inventoryTransaction.findMany({
        where,
        include: { variant: true },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });

      return txs.map((t: any) => ({
        id: t.id,
        tenantId: t.tenantId,
        warehouseId: t.warehouseId,
        variantId: t.variantId,
        sku: t.variant?.sku || '',
        type: t.type,
        quantity: t.quantity,
        balanceOnHand: t.balanceOnHand,
        referenceId: t.referenceId,
        note: t.note,
        createdAt: t.createdAt,
      }));
    } else {
      let filtered = this.inMemoryTransactions.filter((t) => t.tenantId === tenantId);
      if (warehouseId) {
        filtered = filtered.filter((t) => t.warehouseId === warehouseId);
      }
      return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  }
}
