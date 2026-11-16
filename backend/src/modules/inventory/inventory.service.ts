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


  constructor(
    private readonly prisma: PrismaService,
    private readonly warehouseService: WarehouseService,
  ) {}


  /**
   * 1. Tra cứu ma trận tồn kho toàn bộ hoặc theo bộ lọc (Warehouse, SKU, Low Stock)
   */
  async findAll(tenantId: string, query: QueryInventoryDto): Promise<InventoryItemEntity[]> {
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

      if (!sourceInv || sourceInv.availableQty < item.quantity) {
        throw new ConflictException(
          `ORDER_INSUFFICIENT_STOCK: Kho xuất không đủ tồn khả dụng cho mặt hàng SKU: ${item.sku}. Tồn hiện có: ${sourceInv?.availableQty || 0}, yêu cầu chuyển: ${item.quantity}`,
        );
      }
    }

    const transferNumber = `TR-${Date.now().toString().slice(-6)}`;

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
  }

  /**
   * 5. Xác nhận Xuất Hàng Chuyển Kho (Ship Transfer)
   * Trạng thái: PENDING -> IN_TRANSIT
   * Trừ tồn thực tế tại kho xuất và ghi nhận nhật ký TRANSFER_OUT
   */
  async shipTransfer(tenantId: string, id: string): Promise<StockTransferEntity> {
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
  }

  /**
   * 6. Xác nhận Đã Nhận Hàng Chuyển Kho (Receive Transfer)
   * Trạng thái: IN_TRANSIT -> COMPLETED
   * Cộng tồn thực tế tại kho đích và ghi nhận nhật ký TRANSFER_IN
   */
  async receiveTransfer(tenantId: string, id: string): Promise<StockTransferEntity> {
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
  }

  /**
   * 7. Concurrency Lock & Stock Reserve / Deduction (Khóa chống bán vượt tồn kho)
   * Phục vụ POS Terminal và Webhook Đơn hàng sàn TMĐT
   */
  async reserveOrDeductStock(
    tenantId: string,
    dto: ReserveStockDto,
  ): Promise<{ success: boolean; remainingAvailable: number }> {
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
  }

  /**
   * 8. Lấy lịch sử biến động kho (Inventory Transactions Log)
   */
  async findTransactions(
    tenantId: string,
    warehouseId?: string,
  ): Promise<InventoryTransactionEntity[]> {
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
  }
}
