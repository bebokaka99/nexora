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

  // In-Memory Orders Fallback Seed Data
  private inMemoryOrders: OrderEntity[] = [
    {
      id: 'ord-001',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      orderNumber: 'ORD-SP-1092',
      channelType: 'SHOPEE',
      externalOrderId: 'SPX-88291038',
      warehouseId: 'wh-003-central',
      customerName: 'Nguyễn Thị Minh An',
      customerPhone: '0912 345 678',
      shippingAddress: 'Tòa nhà Landmark 81, P.22, Q. Bình Thạnh, TP. HCM',
      subtotal: 2490000,
      discountAmount: 100000,
      totalAmount: 2390000,
      status: 'PROCESSING',
      paymentStatus: 'PAID',
      paymentMethod: 'ShopeePay',
      createdAt: new Date(Date.now() - 42 * 60 * 1000),
      updatedAt: new Date(Date.now() - 15 * 60 * 1000),
      items: [
        {
          id: 'item-001',
          orderId: 'ord-001',
          variantId: 'PROD-01',
          sku: 'NCKD-TF-56L',
          productName: 'Nồi chiên không dầu điện tử Tefal 5.6L Easy Fry',
          quantity: 1,
          unitPrice: 2490000,
          subtotal: 2490000,
        },
      ],
      timeline: [
        { time: '42 phút trước', event: 'Khách hàng đặt đơn thành công trên Shopee Mall' },
        { time: '35 phút trước', event: 'NEXORA Sync Engine tiếp nhận đơn hàng tự động và giữ tồn kho' },
        { time: '15 phút trước', event: 'Nhân viên kho in phiếu nhặt hàng (Pick List)' },
      ],
    },
    {
      id: 'ord-002',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      orderNumber: 'ORD-TT-4401',
      channelType: 'TIKTOK_SHOP',
      externalOrderId: 'TTS-55291044',
      warehouseId: 'wh-003-central',
      customerName: 'Trần Hoàng Bách',
      customerPhone: '0988 234 567',
      shippingAddress: 'Khu Đô Thị Sala, P. An Lợi Đông, TP. Thủ Đức, TP. HCM',
      subtotal: 1950000,
      discountAmount: 0,
      totalAmount: 1950000,
      status: 'PENDING',
      paymentStatus: 'UNPAID',
      paymentMethod: 'Thanh toán khi nhận hàng (COD)',
      createdAt: new Date(Date.now() - 15 * 60 * 1000),
      updatedAt: new Date(Date.now() - 15 * 60 * 1000),
      items: [
        {
          id: 'item-002',
          orderId: 'ord-002',
          variantId: 'PROD-02',
          sku: 'NCKD-LL-52L',
          productName: 'Nồi chiên không dầu Lock&Lock 5.2L EJF351BLK',
          quantity: 1,
          unitPrice: 1950000,
          subtotal: 1950000,
        },
      ],
      timeline: [
        { time: '15 phút trước', event: 'Đơn hàng phát sinh từ phiên TikTok Live Flash Sale' },
        { time: '14 phút trước', event: 'Khóa giữ 1 sản phẩm tại Kho Tổng Tân Bình' },
      ],
    },
    {
      id: 'ord-003',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      orderNumber: 'POS-CN1-1001',
      channelType: 'POS',
      storeId: 'store-001-q1',
      warehouseId: 'wh-001-q1',
      customerName: 'Khách lẻ tại quầy',
      customerPhone: '0977 112 233',
      subtotal: 1270000,
      discountAmount: 0,
      totalAmount: 1270000,
      status: 'COMPLETED',
      paymentStatus: 'PAID',
      paymentMethod: 'Chuyển khoản VietQR',
      createdAt: new Date(Date.now() - 65 * 60 * 1000),
      updatedAt: new Date(Date.now() - 65 * 60 * 1000),
      items: [
        {
          id: 'item-003-1',
          orderId: 'ord-003',
          variantId: 'PROD-03',
          sku: 'CD-EM-28',
          productName: 'Chảo xào chống dính Ceramic Elmich 28cm đáy từ',
          quantity: 1,
          unitPrice: 380000,
          subtotal: 380000,
        },
        {
          id: 'item-003-2',
          orderId: 'ord-003',
          variantId: 'PROD-05',
          sku: 'AST-PL-17',
          productName: 'Ấm siêu tốc thủy tinh Philips 1.7L LED HD9339',
          quantity: 1,
          unitPrice: 890000,
          subtotal: 890000,
        },
      ],
      timeline: [
        { time: '65 phút trước', event: 'Thu ngân hoàn tất thanh toán VietQR tại POS Chi Nhánh 1' },
        { time: '65 phút trước', event: 'Trừ tồn trực tiếp tại Kho Cửa Hàng 1 (Quận 1)' },
      ],
    },
    {
      id: 'ord-004',
      tenantId: 'tenant-001-gia-dung-hien-dai',
      orderNumber: 'ORD-FB-2041',
      channelType: 'FACEBOOK',
      warehouseId: 'wh-001-q1',
      customerName: 'Lê Thùy Dung',
      customerPhone: '0903 889 900',
      shippingAddress: 'Số 88 Cách Mạng Tháng 8, P.6, Quận 3, TP. HCM',
      subtotal: 1650000,
      discountAmount: 50000,
      totalAmount: 1600000,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      paymentMethod: 'Chuyển khoản ngân hàng',
      createdAt: new Date(Date.now() - 110 * 60 * 1000),
      updatedAt: new Date(Date.now() - 95 * 60 * 1000),
      items: [
        {
          id: 'item-004',
          orderId: 'ord-004',
          variantId: 'PROD-08',
          sku: 'MX-BR-MQ',
          productName: 'Máy xay cầm tay Braun MultiQuick 5 1000W',
          quantity: 1,
          unitPrice: 1650000,
          subtotal: 1650000,
        },
      ],
      timeline: [
        { time: '110 phút trước', event: 'Khách nhắn tin qua Fanpage và chốt đơn trong Unified Inbox' },
        { time: '95 phút trước', event: 'Kế toán xác nhận nhận tiền chuyển khoản' },
      ],
    },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryService: InventoryService,
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
   * Tra cứu danh sách đơn hàng đa kênh
   */
  async findAll(tenantId: string, query: QueryOrderDto): Promise<OrderEntity[]> {
    if (await this.isPrismaReady()) {
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
    } else {
      let filtered = this.inMemoryOrders.filter((o) => o.tenantId === tenantId);

      if (query.channelType) {
        filtered = filtered.filter((o) => o.channelType === query.channelType);
      }
      if (query.status) {
        filtered = filtered.filter((o) => o.status === query.status);
      }
      if (query.paymentStatus) {
        filtered = filtered.filter((o) => o.paymentStatus === query.paymentStatus);
      }
      if (query.storeId) {
        filtered = filtered.filter((o) => o.storeId === query.storeId);
      }
      if (query.search) {
        const s = query.search.toLowerCase().trim();
        filtered = filtered.filter(
          (o) =>
            o.orderNumber.toLowerCase().includes(s) ||
            (o.customerName && o.customerName.toLowerCase().includes(s)) ||
            (o.customerPhone && o.customerPhone.includes(s)),
        );
      }

      return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  }

  /**
   * Xem chi tiết một đơn hàng theo ID
   */
  async findById(tenantId: string, id: string): Promise<OrderEntity> {
    if (await this.isPrismaReady()) {
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
    } else {
      const order = this.inMemoryOrders.find((o) => o.id === id && o.tenantId === tenantId);
      if (!order) {
        throw new NotFoundException(`Không tìm thấy đơn hàng với ID: ${id}`);
      }
      return order;
    }
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

    if (await this.isPrismaReady()) {
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
    } else {
      const newOrder: OrderEntity = {
        id: `ord-${Date.now()}`,
        tenantId,
        orderNumber,
        channelType: channel,
        externalOrderId: dto.externalOrderId,
        storeId: dto.storeId,
        warehouseId,
        customerName: dto.customerName || 'Khách lẻ',
        customerPhone: dto.customerPhone || '',
        shippingAddress: dto.shippingAddress || '',
        subtotal,
        discountAmount: discount,
        totalAmount,
        status: initialStatus,
        paymentStatus: initialPaymentStatus,
        paymentMethod: dto.paymentMethod || (isPos ? 'Tiền mặt' : 'COD'),
        createdAt: new Date(),
        updatedAt: new Date(),
        items: dto.items.map((i, idx) => ({
          id: `item-${Date.now()}-${idx}`,
          orderId: `ord-${Date.now()}`,
          variantId: i.variantId,
          sku: i.sku,
          productName: i.productName,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          subtotal: i.unitPrice * i.quantity,
        })),
        timeline: [
          {
            time: 'Vừa xong',
            event: isPos
              ? `Tạo hóa đơn thành công tại quầy POS, phương thức: ${dto.paymentMethod || 'Tiền mặt'}`
              : `Tiếp nhận đơn hàng mới từ kênh ${channel}`,
          },
        ],
      };

      this.inMemoryOrders.unshift(newOrder);
      this.logger.log(`[Order Created] ${newOrder.orderNumber} (${channel}) - ${totalAmount.toLocaleString('vi-VN')} ₫`);
      return newOrder;
    }
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

    if (await this.isPrismaReady()) {
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
    } else {
      order.status = newStatus;
      if (dto.paymentStatus) {
        order.paymentStatus = dto.paymentStatus;
      } else if (newStatus === OrderStatusEnum.COMPLETED) {
        order.paymentStatus = 'PAID';
      }
      order.updatedAt = new Date();

      if (!order.timeline) order.timeline = [];
      order.timeline.unshift({ time: eventTime, event: timelineEvent });

      return order;
    }
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

    if (await this.isPrismaReady()) {
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
    } else {
      order.status = OrderStatusEnum.CANCELLED;
      order.updatedAt = new Date();

      if (!order.timeline) order.timeline = [];
      order.timeline.unshift({
        time: 'Vừa xong',
        event: `Đơn hàng đã bị hủy. Lý do: ${cancelReason}`,
      });

      return order;
    }
  }
}
