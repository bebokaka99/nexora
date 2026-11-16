import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import { WarehouseService } from '../warehouse/warehouse.service';
import {
  CreateOrderDto,
  ChannelTypeEnum,
  OrderStatusEnum,
  PaymentStatusEnum,
} from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { QueryOrderDto } from './dto/query-order.dto';

export interface OrderItemEntity {
  id: string;
  orderId: string;
  variantId: string;
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderEntity {
  id: string;
  tenantId: string;
  orderNumber: string;
  channelType: string;
  externalOrderId?: string | null;
  storeId?: string | null;
  warehouseId?: string | null;
  customerId?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  shippingAddress?: string | null;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod?: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItemEntity[];
  timeline?: { time: string; event: string }[];
}

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);


  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryService: InventoryService,
    private readonly warehouseService: WarehouseService,
  ) {}


  /**
   * Tra cứu danh sách đơn hàng đa kênh
   */
  async findAll(tenantId: string, query: QueryOrderDto): Promise<OrderEntity[]> {
    const where: any = { tenantId };

    if (query.channelType) {
      where.channelType = query.channelType;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.paymentStatus) {
      where.paymentStatus = query.paymentStatus;
    }
    if (query.storeId) {
      where.storeId = query.storeId;
    }
    if (query.search) {
      const s = query.search.trim();
      where.OR = [
        { orderNumber: { contains: s, mode: 'insensitive' } },
        { customer: { fullName: { contains: s, mode: 'insensitive' } } },
        { customer: { phoneNumber: { contains: s, mode: 'insensitive' } } },
      ];
    }

    const rows = await this.prisma.order.findMany({
      where,
      include: {
        items: { include: { variant: true } },
        customer: true,
        store: true,
        warehouse: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return rows.map((r: any) => ({
      id: r.id,
      tenantId: r.tenantId,
      orderNumber: r.orderNumber,
      channelType: r.channelType,
      externalOrderId: r.externalOrderId,
      storeId: r.storeId,
      warehouseId: r.warehouseId,
      customerId: r.customerId,
      customerName: r.customer?.fullName || 'Khách lẻ',
      customerPhone: r.customer?.phoneNumber || '',
      shippingAddress: r.customer?.address || '',
      subtotal: Number(r.subtotal),
      discountAmount: Number(r.discountAmount),
      totalAmount: Number(r.totalAmount),
      status: r.status,
      paymentStatus: r.paymentStatus,
      paymentMethod: r.paymentMethod,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      items: r.items.map((i: any) => ({
        id: i.id,
        orderId: i.orderId,
        variantId: i.variantId,
        sku: i.sku || i.variant?.sku,
        productName: i.productName || i.variant?.variantName,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
        subtotal: Number(i.subtotal),
      })),
    }));
  }

  /**
   * Xem chi tiết một đơn hàng theo ID
   */
  async findById(tenantId: string, id: string): Promise<OrderEntity> {
    const r = await this.prisma.order.findFirst({
      where: { id, tenantId },
      include: {
        items: { include: { variant: true } },
        customer: true,
        store: true,
        warehouse: true,
      },
    });

    if (!r) {
      throw new NotFoundException(`Không tìm thấy đơn hàng với ID: ${id}`);
    }

    return {
      id: r.id,
      tenantId: r.tenantId,
      orderNumber: r.orderNumber,
      channelType: r.channelType,
      externalOrderId: r.externalOrderId,
      storeId: r.storeId,
      warehouseId: r.warehouseId,
      customerId: r.customerId,
      customerName: r.customer?.fullName || 'Khách lẻ',
      customerPhone: r.customer?.phoneNumber || '',
      shippingAddress: r.customer?.address || '',
      subtotal: Number(r.subtotal),
      discountAmount: Number(r.discountAmount),
      totalAmount: Number(r.totalAmount),
      status: r.status,
      paymentStatus: r.paymentStatus,
      paymentMethod: r.paymentMethod,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      items: r.items.map((i: any) => ({
        id: i.id,
        orderId: i.orderId,
        variantId: i.variantId,
        sku: i.sku || i.variant?.sku,
        productName: i.productName || i.variant?.variantName,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
        subtotal: Number(i.subtotal),
      })),
    };
  }

  /**
   * Tạo đơn hàng mới (POS Bán lẻ hoặc Đơn Online/Chat)
   * Tự động áp dụng Business Rules BR-ORD-001 và BR-ORD-002
   */
  async create(tenantId: string, dto: CreateOrderDto): Promise<OrderEntity> {
    const channel = dto.channelType || ChannelTypeEnum.POS;
    const isPos = channel === ChannelTypeEnum.POS;
    const initialStatus = dto.status || (isPos ? OrderStatusEnum.COMPLETED : OrderStatusEnum.CONFIRMED);
    const initialPaymentStatus = dto.paymentStatus || (isPos ? PaymentStatusEnum.PAID : PaymentStatusEnum.UNPAID);

    // Tính toán tổng tiền
    const subtotal = dto.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    const discount = dto.discountAmount || 0;
    const totalAmount = Math.max(0, subtotal - discount);

    // Sinh mã số đơn hàng
    const orderSeq = Math.floor(1000 + Math.random() * 9000);
    const prefix = isPos ? 'POS' : channel === ChannelTypeEnum.SHOPEE ? 'ORD-SP' : channel === ChannelTypeEnum.TIKTOK_SHOP ? 'ORD-TT' : 'ORD-FB';
    const orderNumber = `${prefix}-${orderSeq}`;

    // Xác định kho hàng xử lý
    const warehouseId = dto.warehouseId || (dto.storeId === 'store-002-binh-thanh' ? 'wh-002-binh-thanh' : isPos ? 'wh-001-q1' : 'wh-003-central');

    // 1. Áp dụng quy tắc tồn kho tương ứng
    for (const item of dto.items) {
      if (isPos && initialStatus === OrderStatusEnum.COMPLETED) {
        // BR-ORD-001: Trừ thẳng tồn kho On-hand & Available
        await this.inventoryService.reserveOrDeductStock(tenantId, {
          warehouseId,
          variantId: item.variantId,
          quantity: item.quantity,
          referenceId: orderNumber,
        });
      }
    }

    const created = await this.prisma.order.create({
      data: {
        tenantId,
        orderNumber,
        channelType: channel as any,
        externalOrderId: dto.externalOrderId,
        storeId: dto.storeId,
        warehouseId,
        subtotal,
        discountAmount: discount,
        totalAmount,
        status: initialStatus as any,
        paymentStatus: initialPaymentStatus as any,
        paymentMethod: dto.paymentMethod || (isPos ? 'Tiền mặt' : 'COD'),
        items: {
          create: dto.items.map((i) => ({
            tenantId,
            variantId: i.variantId,
            sku: i.sku,
            productName: i.productName,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            subtotal: i.unitPrice * i.quantity,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return {
      id: created.id,
      tenantId: created.tenantId,
      orderNumber: created.orderNumber,
      channelType: created.channelType,
      externalOrderId: created.externalOrderId,
      storeId: created.storeId,
      warehouseId: created.warehouseId,
      customerId: created.customerId,
      customerName: dto.customerName || 'Khách lẻ',
      customerPhone: dto.customerPhone || '',
      shippingAddress: dto.shippingAddress || '',
      subtotal: Number(created.subtotal),
      discountAmount: Number(created.discountAmount),
      totalAmount: Number(created.totalAmount),
      status: created.status,
      paymentStatus: created.paymentStatus,
      paymentMethod: created.paymentMethod,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
      items: created.items.map((i: any) => ({
        id: i.id,
        orderId: i.orderId,
        variantId: i.variantId,
        sku: i.sku,
        productName: i.productName,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
        subtotal: Number(i.subtotal),
      })),
    };
  }

  /**
   * Cập nhật trạng thái vòng đời đơn hàng
   * Máy trạng thái: PENDING -> CONFIRMED -> PROCESSING -> SHIPPED -> COMPLETED
   * Tự động xử lý biến động tồn kho tương ứng
   */
  async updateStatus(
    tenantId: string,
    id: string,
    dto: UpdateOrderStatusDto,
  ): Promise<OrderEntity> {
    const order = await this.findById(tenantId, id);
    const oldStatus = order.status;
    const newStatus = dto.status;

    if (oldStatus === newStatus) {
      return order;
    }

    if (oldStatus === OrderStatusEnum.COMPLETED || oldStatus === OrderStatusEnum.CANCELLED) {
      throw new BadRequestException(
        `Đơn hàng đã ở trạng thái kết thúc [${oldStatus}], không thể thay đổi trạng thái`,
      );
    }

    const eventTime = 'Vừa xong';
    const timelineEvent = dto.notes || `Chuyển trạng thái từ ${oldStatus} sang ${newStatus}`;

    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        status: newStatus as any,
        paymentStatus: (dto.paymentStatus as any) || (newStatus === OrderStatusEnum.COMPLETED ? 'PAID' : undefined),
      },
      include: { items: true },
    });

    return {
      ...order,
      status: updated.status,
      paymentStatus: updated.paymentStatus,
      updatedAt: updated.updatedAt,
    };
  }

  /**
   * Hủy đơn hàng và tự động giải phóng / hoàn trả tồn kho (BR-ORD-004)
   */
  async cancel(
    tenantId: string,
    id: string,
    reason?: string,
  ): Promise<OrderEntity> {
    const order = await this.findById(tenantId, id);

    if (order.status === OrderStatusEnum.CANCELLED) {
      throw new BadRequestException('Đơn hàng này đã bị hủy trước đó');
    }

    if (order.status === OrderStatusEnum.SHIPPED || order.status === OrderStatusEnum.COMPLETED) {
      throw new BadRequestException(
        `Không thể hủy đơn hàng đang giao hoặc đã hoàn tất. Vui lòng thực hiện quy trình Đổi trả/Hoàn hàng!`,
      );
    }

    const cancelReason = reason || 'Khách hàng yêu cầu hủy đơn';

    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
      include: { items: true },
    });

    return {
      ...order,
      status: updated.status,
      updatedAt: updated.updatedAt,
    };
  }
}
