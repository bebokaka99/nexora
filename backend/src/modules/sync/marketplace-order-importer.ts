import { Injectable, Logger } from '@nestjs/common';
import type {
  ChannelType as PrismaChannelType,
  OrderStatus as PrismaOrderStatus,
  PaymentStatus as PrismaPaymentStatus,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { OrderService } from '../order/order.service';
import {
  ChannelTypeEnum,
  OrderStatusEnum,
  PaymentStatusEnum,
} from '../order/dto/create-order.dto';
import type { NormalizedMarketplaceOrder } from './order-mapper';

/**
 * MarketplaceOrderImporter — lưu đơn sàn kéo về vào bảng orders (TASK-017).
 *
 * Nhận đơn đã chuẩn hóa (order-mapper) và lưu qua `OrderService.create()`
 * để tái dùng toàn bộ logic đã có: sinh orderNumber (ORD-SP-/ORD-TT-),
 * resolve kho theo TASK-015, resolve variant theo id → SKU theo TASK-016.
 * Đơn sàn KHÔNG bị trừ tồn ở đây (OrderService chỉ trừ tồn cho POS
 * COMPLETED) — tồn kho sàn/NEXORA đối soát bằng job sync-inventory riêng.
 *
 * Idempotent theo (tenantId, channelType, externalOrderId):
 *   - Đơn đã có trong DB → KHÔNG tạo mới (đếm `skipped`); nếu trạng thái
 *     trên sàn đã đổi thì cập nhật status/paymentStatus cho đồng bộ.
 *   - Lỗi unique P2002 (2 worker cùng lưu 1 đơn) → đếm là `skipped`,
 *     không phải lỗi — unique index trên bảng orders là chốt chặn cuối.
 *   - Đơn không có mặt hàng, hoặc SKU không map được variant → KHÔNG lưu,
 *     đếm `errors` kèm lý do (không đoán variant, không lưu đơn thiếu hàng).
 */

export interface ImportOrdersResult {
  /** Tổng số đơn sàn trả về trong lần kéo này. */
  pulled: number;
  /** Số đơn mới đã lưu vào bảng orders. */
  saved: number;
  /** Số đơn trùng đã có (bỏ qua tạo mới). */
  skipped: number;
  /** Số đơn lỗi (không lưu được). */
  errors: number;
  /** Lý do từng lỗi (tối đa 10 dòng đầu — phần còn lại xem log). */
  errorNotes: string[];
}

const MAX_ERROR_NOTES = 10;

@Injectable()
export class MarketplaceOrderImporter {
  private readonly logger = new Logger(MarketplaceOrderImporter.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly orderService: OrderService,
  ) {}

  async importOrders(input: {
    tenantId: string;
    channelType: 'SHOPEE' | 'TIKTOK_SHOP';
    orders: NormalizedMarketplaceOrder[];
  }): Promise<ImportOrdersResult> {
    const { tenantId, channelType, orders } = input;
    const result: ImportOrdersResult = {
      pulled: orders.length,
      saved: 0,
      skipped: 0,
      errors: 0,
      errorNotes: [],
    };

    for (const order of orders) {
      try {
        if (!order.items || order.items.length === 0) {
          result.errors++;
          this.noteError(result, `Đơn ${order.externalOrderId}: không có mặt hàng — bỏ qua, không lưu.`);
          continue;
        }

        const existing = await this.prisma.order.findFirst({
          where: {
            tenantId,
            channelType: channelType as PrismaChannelType,
            externalOrderId: order.externalOrderId,
          },
          select: { id: true, status: true, paymentStatus: true },
        });
        if (existing) {
          // Đã có: chỉ cập nhật trạng thái nếu sàn đã đổi (giữ NEXORA đồng
          // bộ), vẫn đếm là skipped — không tạo đơn trùng.
          if (existing.status !== order.status || existing.paymentStatus !== order.paymentStatus) {
            await this.prisma.order.update({
              where: { id: existing.id },
              data: {
                status: order.status as PrismaOrderStatus,
                paymentStatus: order.paymentStatus as PrismaPaymentStatus,
              },
            });
          }
          result.skipped++;
          continue;
        }

        await this.orderService.create(tenantId, {
          channelType: channelType as ChannelTypeEnum,
          externalOrderId: order.externalOrderId,
          customerName: order.buyerName,
          customerPhone: order.buyerPhone,
          shippingAddress: order.shippingAddress,
          items: order.items.map((item) => ({
            // TASK-016: resolveVariantId thử id rồi SKU — gửi SKU làm cả 2
            // để variant thật được tìm theo SKU của sàn.
            variantId: item.sku,
            sku: item.sku,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
          discountAmount: 0,
          status: order.status as OrderStatusEnum,
          paymentStatus: order.paymentStatus as PaymentStatusEnum,
          paymentMethod: channelType === 'SHOPEE' ? 'Shopee' : 'TikTok Shop',
        });
        result.saved++;
      } catch (err) {
        // Race: worker khác đã lưu đơn này trước (unique index bắt được).
        if (this.isUniqueViolation(err)) {
          result.skipped++;
          continue;
        }
        result.errors++;
        const message = err instanceof Error ? err.message : String(err);
        this.noteError(result, `Đơn ${order.externalOrderId}: ${message}`);
      }
    }

    return result;
  }

  private noteError(result: ImportOrdersResult, note: string): void {
    if (result.errorNotes.length < MAX_ERROR_NOTES) result.errorNotes.push(note);
    this.logger.warn(`[import-orders] ${note}`);
  }

  /** Prisma unique violation (P2002) — đơn đã được lưu bởi worker khác. */
  private isUniqueViolation(err: unknown): boolean {
    if (err && typeof err === 'object') {
      const code = (err as { code?: unknown }).code;
      if (code === 'P2002') return true;
      const message = err instanceof Error ? err.message : '';
      if (message.includes('orders_tenant_id_channel_type_external_order_id_key')) return true;
    }
    return false;
  }
}
