import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Job, Worker } from 'bullmq';
import { PrismaService } from '../../database/prisma.service';
import { CHANNEL_SYNC_QUEUE, ChannelSyncJobData, redisConnectionOptions } from './sync.queue';
import { ShopeeClient, shopeeConfigFromEnv } from '../channel/shopee.client';
import { TikTokClient, tikTokConfigFromEnv } from '../channel/tiktok.client';
import { decryptToken, encryptToken } from './token-crypto';
import {
  normalizeShopeeOrderDetail,
  normalizeTikTokOrder,
} from './order-mapper';
import { MarketplaceOrderImporter } from './marketplace-order-importer';

/**
 * SyncProcessor — BullMQ worker đồng bộ sàn thật (TASK-013, củng cố TASK-017).
 *
 * Chạy trên Redis thật (REDIS_URL). Mỗi job:
 *   1. Tạo SyncLog PENDING → RUNNING.
 *   2. Nạp ChannelConnection; giải mã token (TASK-017 — token trong DB luôn
 *      ở dạng mã hóa AES-256-GCM, chỉ giải mã trong bộ nhớ khi gọi API);
 *      refresh token nếu sắp hết hạn (Shopee 4h, TikTok 7 ngày) và lưu token
 *      mới ĐÃ MÃ HÓA vào DB ngay.
 *   3. sync-inventory: đọc tồn kho NEXORA (Inventory.availableQty) rồi đẩy
 *      lên sàn qua client.updateStock — CHỈ cho variant đã có
 *      ChannelProductMapping; variant chưa map được đếm vào failure_count
 *      (không đoán item sàn).
 *   4. pull-orders (TASK-017): kéo đơn từ sàn trong 24h gần nhất, lấy chi
 *      tiết từng đơn (Shopee: getOrderDetail theo lô 50; TikTok: line_items
 *      trong kết quả search), chuẩn hóa rồi lưu vào bảng orders qua
 *      MarketplaceOrderImporter — idempotent theo (tenant, kênh,
 *      externalOrderId): kéo lại lần 2 không tạo đơn trùng. Đơn không map
 *      được SKU thì không lưu, đếm lỗi (không đoán variant).
 *   5. Ghi SyncLog SUCCESS / PARTIAL / FAILED với đủ 4 số
 *      pulled/saved/skipped/errors. CHỈ khi SUCCESS mới cập nhật
 *      ChannelConnection.lastSyncAt — đúng tiêu chí nghiệm thu TASK-013.
 *
 * Chưa có Redis → Worker phát lỗi 'error', job không chạy; lỗi được log rõ,
 * không giả vờ thành công. Chưa có key sàn → client throw lỗi credential
 * rõ ràng trước khi gọi mạng, job fail với message đó trong SyncLog.
 * Thiếu SYNC_TOKEN_ENCRYPTION_KEY → job fail với lỗi rõ ràng (TASK-017),
 * không đọc/ghi token plaintext.
 */
@Injectable()
export class SyncProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SyncProcessor.name);
  private worker: Worker<ChannelSyncJobData> | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly orderImporter: MarketplaceOrderImporter,
  ) {}

  onModuleInit() {
    this.worker = new Worker<ChannelSyncJobData>(
      CHANNEL_SYNC_QUEUE,
      async (job) => this.process(job),
      {
        connection: redisConnectionOptions(),
        // Điểm khởi đầu thận trọng (xem SPIKE §2.5): 10 job/phút/queue.
        // Chỉnh sau khi có số liệu sandbox thật của từng sàn.
        concurrency: 2,
        limiter: { max: 10, duration: 60_000 },
      },
    );
    this.worker.on('completed', (job) => {
      this.logger.log(`Job ${job.name} [${job.id}] hoàn thành.`);
    });
    this.worker.on('failed', (job, err) => {
      this.logger.error(`Job ${job?.name} [${job?.id}] thất bại: ${err.message}`);
    });
    this.worker.on('error', (err) => {
      this.logger.error(
        `Worker "${CHANNEL_SYNC_QUEUE}" lỗi Redis (${process.env.REDIS_URL || 'redis://localhost:6379'}): ${err.message}. ` +
          'Kiểm tra Redis đã chạy chưa (`docker compose up redis`, TASK-010).',
      );
    });
  }

  async onModuleDestroy() {
    if (this.worker) await this.worker.close();
  }

  private async process(job: Job<ChannelSyncJobData>): Promise<{ success: boolean }> {
    const { channelId, tenantId, channelType } = job.data;
    const jobType = job.name === 'sync-inventory' ? 'SYNC_INVENTORY' : 'PULL_ORDERS';

    const log = await this.prisma.syncLog.create({
      data: {
        channelId,
        tenantId,
        jobType: jobType as 'SYNC_INVENTORY' | 'PULL_ORDERS',
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });

    try {
      const stored = await this.prisma.channelConnection.findFirst({
        where: { id: channelId, tenantId },
      });
      if (!stored) throw new Error(`Không tìm thấy kênh [${channelId}] của tenant.`);
      if (stored.status !== 'CONNECTED') {
        throw new Error(`Kênh [${stored.accountName}] đang ở trạng thái ${stored.status}, không đồng bộ.`);
      }
      // TASK-017: giải mã token 1 lần tại đây. Token trong DB luôn ở dạng
      // mã hóa AES-256-GCM; mọi code phía dưới chỉ thấy token đã giải mã
      // trong bộ nhớ (không bao giờ log token). Thiếu khóa mã hóa, sai khóa,
      // hoặc token plaintext cũ → decryptToken() throw lỗi rõ ràng và job
      // fail với message đó trong SyncLog.
      const channel = {
        ...stored,
        accessToken: decryptToken(stored.accessToken),
        refreshToken: decryptToken(stored.refreshToken),
      };

      let result: {
        successCount: number;
        failureCount: number;
        pulledCount?: number;
        skippedCount?: number;
        note?: string;
      };
      if (job.name === 'sync-inventory') {
        result = await this.syncInventory(channel, channelType);
      } else if (job.name === 'pull-orders') {
        result = await this.pullOrders(channel, channelType, job.data.sinceHours ?? 24);
      } else {
        throw new Error(`Loại job không hỗ trợ: ${job.name}`);
      }

      const status = result.failureCount === 0 ? 'SUCCESS' : 'PARTIAL';
      await this.prisma.syncLog.update({
        where: { id: log.id },
        data: {
          status,
          // TASK-017: successCount = số đơn lưu MỚI (pull-orders) / số
          // variant đẩy tồn thành công (sync-inventory); pulledCount và
          // skippedCount chỉ có ý nghĩa với pull-orders.
          pulledCount: result.pulledCount ?? 0,
          successCount: result.successCount,
          skippedCount: result.skippedCount ?? 0,
          failureCount: result.failureCount,
          errorMessage: result.note ?? null,
          finishedAt: new Date(),
        },
      });
      if (status === 'SUCCESS') {
        await this.prisma.channelConnection.update({
          where: { id: channelId },
          data: { lastSyncAt: new Date() },
        });
      }
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await this.prisma.syncLog.update({
        where: { id: log.id },
        data: { status: 'FAILED', errorMessage: message, finishedAt: new Date() },
      });
      throw err;
    }
  }

  // ---------------------------------------------------------------------------
  // Token: refresh khi sắp hết hạn, lưu token mới vào DB ngay.
  // ---------------------------------------------------------------------------

  private async ensureShopeeToken(channel: {
    id: string;
    accountId: string;
    accessToken: string | null;
    refreshToken: string | null;
    tokenExpiresAt: Date | null;
  }): Promise<{ client: ShopeeClient; accessToken: string; shopId: string }> {
    const client = new ShopeeClient(shopeeConfigFromEnv());
    if (!channel.accessToken || !channel.refreshToken) {
      throw new Error(
        'Shop Shopee chưa ủy quyền OAuth: chưa có access_token/refresh_token trong DB. ' +
          'Chạy luồng ủy quyền (buildAuthUrl → đổi code lấy token) rồi lưu token vào ChannelConnection.',
      );
    }
    let accessToken = channel.accessToken;
    const expiresSoon =
      !channel.tokenExpiresAt ||
      channel.tokenExpiresAt.getTime() - Date.now() < 5 * 60 * 1000;
    if (expiresSoon) {
      // Shopee: refresh token rotating — ghi cả 2 token mới trong 1 lần update.
      // TASK-017: mã hóa trước khi ghi vào DB (không lưu plaintext).
      const pair = await client.refreshAccessToken(channel.refreshToken, channel.accountId);
      accessToken = pair.accessToken;
      await this.prisma.channelConnection.update({
        where: { id: channel.id },
        data: {
          accessToken: encryptToken(pair.accessToken),
          refreshToken: encryptToken(pair.refreshToken),
          tokenExpiresAt: new Date(Date.now() + pair.expireIn * 1000),
        },
      });
      this.logger.log(`Đã refresh access token Shopee cho shop [${channel.accountId}].`);
    }
    return { client, accessToken, shopId: channel.accountId };
  }

  private async ensureTikTokToken(channel: {
    id: string;
    accountId: string;
    accessToken: string | null;
    refreshToken: string | null;
    tokenExpiresAt: Date | null;
  }): Promise<{ client: TikTokClient; accessToken: string }> {
    const client = new TikTokClient(tikTokConfigFromEnv());
    if (!channel.accessToken || !channel.refreshToken) {
      throw new Error(
        'Shop TikTok chưa ủy quyền OAuth: chưa có access_token/refresh_token trong DB. ' +
          'Chạy luồng ủy quyền (buildAuthUrl → đổi code lấy token) rồi lưu token vào ChannelConnection.',
      );
    }
    let accessToken = channel.accessToken;
    const expiresSoon =
      !channel.tokenExpiresAt ||
      channel.tokenExpiresAt.getTime() - Date.now() < 5 * 60 * 1000;
    if (expiresSoon) {
      // TASK-017: mã hóa trước khi ghi vào DB (không lưu plaintext).
      const pair = await client.refreshAccessToken(channel.refreshToken);
      accessToken = pair.accessToken;
      await this.prisma.channelConnection.update({
        where: { id: channel.id },
        data: {
          accessToken: encryptToken(pair.accessToken),
          refreshToken: encryptToken(pair.refreshToken),
          tokenExpiresAt: new Date(pair.accessTokenExpireIn * 1000),
        },
      });
      this.logger.log(`Đã refresh access token TikTok Shop cho shop [${channel.accountId}].`);
    }
    return { client, accessToken };
  }

  /** TikTok: shop_cipher lấy từ Get Authorized Shops (không lưu sẵn trong DB). */
  private async getTikTokShopCipher(
    client: TikTokClient,
    accessToken: string,
    accountId: string,
  ): Promise<string> {
    const shops = await client.getAuthorizedShops(accessToken);
    const match = shops.find((s) => s.id === accountId || s.code === accountId) ?? shops[0];
    if (!match) {
      throw new Error('TikTok không trả về shop nào đã ủy quyền cho app này (getAuthorizedShops rỗng).');
    }
    return match.cipher;
  }

  // ---------------------------------------------------------------------------
  // Job: sync-inventory — NEXORA → sàn
  // ---------------------------------------------------------------------------

  private async syncInventory(
    channel: { id: string; tenantId: string; accountId: string; accessToken: string | null; refreshToken: string | null; tokenExpiresAt: Date | null },
    channelType: string,
  ): Promise<{ successCount: number; failureCount: number; note?: string }> {
    if (channelType !== 'SHOPEE' && channelType !== 'TIKTOK_SHOP') {
      throw new Error(`Kênh ${channelType} chưa hỗ trợ đồng bộ tồn kho (chỉ SHOPEE và TIKTOK_SHOP).`);
    }

    // Tồn kho NEXORA: cộng availableQty theo từng variant (mọi kho).
    const inventories = await this.prisma.inventory.findMany({
      where: { tenantId: channel.tenantId },
      select: { variantId: true, availableQty: true },
    });
    const stockByVariant = new Map<string, number>();
    for (const inv of inventories) {
      stockByVariant.set(inv.variantId, (stockByVariant.get(inv.variantId) ?? 0) + inv.availableQty);
    }

    const mappings = await this.prisma.channelProductMapping.findMany({
      where: { channelId: channel.id },
    });

    let successCount = 0;
    let failureCount = 0;
    const failures: string[] = [];

    if (channelType === 'SHOPEE') {
      const { client, accessToken, shopId } = await this.ensureShopeeToken(channel);
      for (const [variantId, qty] of stockByVariant) {
        const map = mappings.find((m) => m.variantId === variantId);
        if (!map) {
          failureCount++;
          failures.push(`variant ${variantId}: chưa map với item Shopee`);
          continue;
        }
        try {
          await client.updateStock(accessToken, shopId, {
            itemId: Number(map.externalItemId),
            modelId: map.externalModelId ? Number(map.externalModelId) : 0,
            stock: qty,
          });
          successCount++;
        } catch (err) {
          failureCount++;
          failures.push(`variant ${variantId}: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
    } else {
      const { client, accessToken } = await this.ensureTikTokToken(channel);
      const shopCipher = await this.getTikTokShopCipher(client, accessToken, channel.accountId);
      for (const [variantId, qty] of stockByVariant) {
        const map = mappings.find((m) => m.variantId === variantId);
        if (!map) {
          failureCount++;
          failures.push(`variant ${variantId}: chưa map với product TikTok`);
          continue;
        }
        if (!map.externalSkuId || !map.externalWarehouseId) {
          failureCount++;
          failures.push(
            `variant ${variantId}: map thiếu external_sku_id hoặc external_warehouse_id (TikTok đẩy tồn theo SKU/kho)`,
          );
          continue;
        }
        try {
          await client.updateStock(accessToken, shopCipher, map.externalItemId, [
            { skuId: map.externalSkuId, warehouseId: map.externalWarehouseId, quantity: qty },
          ]);
          successCount++;
        } catch (err) {
          failureCount++;
          failures.push(`variant ${variantId}: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
    }

    const note =
      failures.length > 0
        ? `Đẩy tồn: ${successCount} variant thành công, ${failureCount} lỗi — ` + failures.slice(0, 5).join(' | ')
        : undefined;
    return { successCount, failureCount, note };
  }

  // ---------------------------------------------------------------------------
  // Job: pull-orders — sàn → NEXORA (TASK-017: lưu đơn về bảng orders).
  //
  // Luồng: kéo danh sách đơn trong khoảng thời gian → lấy chi tiết từng đơn
  // (Shopee: getOrderDetail theo lô 50 mã; TikTok: line_items đã có trong
  // kết quả search) → chuẩn hóa (order-mapper) → lưu qua
  // MarketplaceOrderImporter (idempotent theo (tenant, kênh,
  // externalOrderId): kéo lại lần 2 không tạo đơn trùng).
  // successCount ở đây = số đơn lưu MỚI (ghi vào SyncLog.successCount).
  // ---------------------------------------------------------------------------

  private async pullOrders(
    channel: { id: string; tenantId: string; accountId: string; accessToken: string | null; refreshToken: string | null; tokenExpiresAt: Date | null },
    channelType: string,
    sinceHours: number,
  ): Promise<{
    successCount: number;
    failureCount: number;
    pulledCount: number;
    skippedCount: number;
    note?: string;
  }> {
    if (channelType !== 'SHOPEE' && channelType !== 'TIKTOK_SHOP') {
      throw new Error(`Kênh ${channelType} chưa hỗ trợ kéo đơn hàng (chỉ SHOPEE và TIKTOK_SHOP).`);
    }
    const nowSec = Math.floor(Date.now() / 1000);
    const fromSec = nowSec - sinceHours * 3600;

    let imported: { pulled: number; saved: number; skipped: number; errors: number; errorNotes: string[] };
    let listedCount = 0;

    if (channelType === 'SHOPEE') {
      const { client, accessToken, shopId } = await this.ensureShopeeToken(channel);
      // 1. Kéo danh sách order_sn theo trang (cursor).
      const orderSnList: string[] = [];
      let cursor = '';
      do {
        const page = await client.getOrders(accessToken, shopId, {
          timeFrom: fromSec,
          timeTo: nowSec,
          cursor,
        });
        orderSnList.push(...page.orders.map((o) => o.order_sn));
        cursor = page.nextCursor;
        if (!page.more) break;
      } while (cursor);
      listedCount = orderSnList.length;
      // 2. Lấy chi tiết theo lô 50 mã (giới hạn Shopee).
      const details: import('../channel/shopee.client').ShopeeOrderDetail[] = [];
      for (let i = 0; i < orderSnList.length; i += 50) {
        const chunk = orderSnList.slice(i, i + 50);
        details.push(...(await client.getOrderDetail(accessToken, shopId, chunk)));
      }
      // 3. Chuẩn hóa + lưu (dedup trong importer).
      imported = await this.orderImporter.importOrders({
        tenantId: channel.tenantId,
        channelType: 'SHOPEE',
        orders: details.map(normalizeShopeeOrderDetail),
      });
    } else {
      const { client, accessToken } = await this.ensureTikTokToken(channel);
      const shopCipher = await this.getTikTokShopCipher(client, accessToken, channel.accountId);
      // TikTok: kết quả search đã kèm line_items nên chuẩn hóa trực tiếp.
      const normalized: import('./order-mapper').NormalizedMarketplaceOrder[] = [];
      let pageToken = '';
      do {
        const page = await client.getOrders(accessToken, shopCipher, {
          createTimeGe: fromSec,
          createTimeLt: nowSec,
          pageToken,
        });
        normalized.push(...page.orders.map(normalizeTikTokOrder));
        pageToken = page.nextPageToken;
        if (!pageToken) break;
      } while (pageToken);
      listedCount = normalized.length;
      imported = await this.orderImporter.importOrders({
        tenantId: channel.tenantId,
        channelType: 'TIKTOK_SHOP',
        orders: normalized,
      });
    }

    const detailGap =
      listedCount > imported.pulled
        ? ` (danh sách trả ${listedCount} đơn nhưng chỉ lấy được chi tiết ${imported.pulled} đơn)`
        : '';
    const note =
      `pull-orders: kéo ${imported.pulled} đơn${detailGap}, lưu mới ${imported.saved}, ` +
      `trùng bỏ qua ${imported.skipped}, lỗi ${imported.errors}` +
      (imported.errorNotes.length > 0 ? ` — ${imported.errorNotes.join(' | ')}` : '');
    this.logger.log(`pull-orders kênh [${channel.accountId}]: ${note}`);
    return {
      successCount: imported.saved,
      failureCount: imported.errors,
      pulledCount: imported.pulled,
      skippedCount: imported.skipped,
      note,
    };
  }
}
