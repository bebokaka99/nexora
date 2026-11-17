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
   * TASK-015: resolve kho xuất kho cho đơn hàng mà không dùng ID hardcode.
   * - dto.warehouseId có thì dùng luôn (caller chịu trách nhiệm ID tồn tại).
   * - Không có thì lấy Store.defaultWarehouseId của cửa hàng (seed tạo
   *   store CN1 trỏ về kho KHO-CN1 bằng uuid thật).
   * - Cửa hàng không có kho mặc định (hoặc storeId là ID mock cũ như
   *   'store1' không có trong DB) thì lấy kho active đầu tiên của tenant.
   * - Tenant chưa có kho active nào thì throw BadRequestException với
   *   thông báo rõ ràng, thay vì để reserveOrDeductStock / FK lỗi khó hiểu.
   * TASK-016: warehouseId gửi lên mà không tồn tại cho tenant thì cũng bỏ
   * qua và đi tiếp chuỗi fallback, thay vì để FK lỗi ở lúc tạo đơn.
   */
  private async resolveWarehouseId(
    tenantId: string,
    warehouseId?: string | null,
    storeId?: string | null,
  ): Promise<string> {
    if (warehouseId) {
      const wh = await this.prisma.warehouse.findFirst({
        where: { tenantId, id: warehouseId },
        select: { id: true },
      });
      if (wh) return warehouseId;
      this.logger.warn(
        `warehouseId "${warehouseId}" không tồn tại cho tenant — bỏ qua và resolve kho theo chuỗi fallback.`,
      );
    }

    if (storeId) {
      const store = await this.prisma.store.findFirst({
        where: { tenantId, id: storeId },
        select: { defaultWarehouseId: true },
      });
      if (store?.defaultWarehouseId) return store.defaultWarehouseId;
    }

    const firstActive = await this.prisma.warehouse.findFirst({
      where: { tenantId, isActive: true },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });
    if (firstActive) return firstActive.id;

    throw new BadRequestException(
      'Tenant chưa có kho hàng active nào để xuất kho. Vui lòng tạo kho trước khi tạo đơn hàng.',
    );
  }

  /**
   * TASK-016 (hướng (b) — backend resolve biến thể theo SKU, thay vì hướng
   * (a) POS load sản phẩm thật): POS gửi `variantId` là id mock của frontend
   * (PROD-01…) và `sku` thật của sản phẩm; backend tra biến thể thật theo
   * thứ tự id → sku (sku unique theo tenant). Hướng (a) không chọn vì: POS
   * phải thay toàn bộ danh mục mock 12 sản phẩm (có ảnh, tồn theo chi nhánh)
   * bằng tối đa 3 sản phẩm seed (không ảnh, không tồn theo chi nhánh trong
   * FE), chạm tới cả tab Sản phẩm/Tồn kho, và không kiểm chứng được trong VM
   * (không có Postgres). Giới hạn còn lại: SKU mock (vd NCKD-TF-56L) không có
   * trong DB seed (NCKD-55L-001…) thì vẫn lỗi rõ ràng ở dưới — muốn e2e tới
   * cùng, danh mục trong DB phải có đúng SKU mà quầy đang bán.
   */
  private async resolveVariantId(
    tenantId: string,
    variantId: string,
    sku: string,
  ): Promise<string> {
    const byId = await this.prisma.productVariant.findFirst({
      where: { tenantId, id: variantId },
      select: { id: true },
    });
    if (byId) return byId.id;

    const bySku = await this.prisma.productVariant.findFirst({
      where: { tenantId, sku },
      select: { id: true },
    });
    if (bySku) return bySku.id;

    throw new BadRequestException(
      `Không tìm thấy biến thể sản phẩm với SKU "${sku}". Vui lòng đồng bộ danh mục sản phẩm (tạo sản phẩm + biến thể với đúng SKU) trước khi bán tại quầy.`,
    );
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

    // TASK-016: storeId lạ (id mock cũ như 'store-001-q1', hoặc store đã xóa)
    // thì bỏ qua thay vì để FK lỗi ở lúc tạo đơn — kho đã có fallback theo
    // TASK-015 nên đơn vẫn xuất được kho đúng của tenant.
    let effectiveStoreId = dto.storeId;
    if (effectiveStoreId) {
      const storeExists = await this.prisma.store.findFirst({
        where: { tenantId, id: effectiveStoreId },
        select: { id: true },
      });
      if (!storeExists) {
        this.logger.warn(
          `storeId "${effectiveStoreId}" không tồn tại cho tenant — bỏ qua storeId khi tạo đơn.`,
        );
        effectiveStoreId = undefined;
      }
    }

    // Xác định kho hàng xử lý (TASK-015): không dùng ID hardcode nữa.
    // Thứ tự: kho DTO gửi lên -> kho mặc định của cửa hàng -> kho active
    // đầu tiên của tenant. Không có kho nào thì lỗi rõ ràng thay vì lỗi FK.
    const warehouseId = await this.resolveWarehouseId(
      tenantId,
      dto.warehouseId,
      effectiveStoreId,
    );

    // TASK-016 (hướng (b)): resolve từng mặt hàng về variant uuid thật
    // (theo id rồi theo sku) TRƯỚC khi trừ tồn và tạo đơn, vì OrderItem
    // .variantId là FK tới ProductVariant — id mock PROD-01… sẽ lỗi FK.
    const resolvedItems = [];
    for (const item of dto.items) {
      const realVariantId = await this.resolveVariantId(
        tenantId,
        item.variantId,
        item.sku,
      );
      resolvedItems.push({ ...item, variantId: realVariantId });
    }

    // 1. Áp dụng quy tắc tồn kho tương ứng
    for (const item of resolvedItems) {
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
        storeId: effectiveStoreId,
        warehouseId,
        subtotal,
        discountAmount: discount,
        totalAmount,
        status: initialStatus as any,
        paymentStatus: initialPaymentStatus as any,
        paymentMethod: dto.paymentMethod || (isPos ? 'Tiền mặt' : 'COD'),
        items: {
          create: resolvedItems.map((i) => ({
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
