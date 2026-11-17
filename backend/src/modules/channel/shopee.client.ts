import { createHmac } from 'crypto';

/**
 * Shopee Open Platform API v2 — client HTTP thật (TASK-013).
 *
 * Nguồn contract: docs/tasks/phase-06-5-foundation-hardening/SPIKE-shopee-tiktok.md
 * §1. Docs chính thức (open.shopee.com) yêu cầu đăng nhập nên chưa đối chiếu
 * trực tiếp — endpoint/tham số dưới đây lấy từ tài liệu thứ cấp đã đối chiếu
 * chéo (netalith, inlinex) và PHẢI kiểm tra lại với Partner Center khi có key
 * sandbox. Luồng OAuth, công thức ký HMAC và vòng đời token đã khớp ≥ 2 nguồn.
 *
 * Mọi credential đọc từ biến môi trường, KHÔNG hardcode key/secret nào:
 *   SHOPEE_PARTNER_ID, SHOPEE_PARTNER_KEY,
 *   SHOPEE_BASE_URL (mặc định sandbox https://partner.test-stable.shopeemobile.com;
 *   production: https://partner.shopeemobile.com)
 *
 * Thiếu credential → throw lỗi rõ ràng TRƯỚC KHI gọi mạng (không gọi API sàn).
 * Dùng fetch có sẵn của Node 22 — không thêm dependency.
 */

export const SHOPEE_SANDBOX_HOST = 'https://partner.test-stable.shopeemobile.com';
export const SHOPEE_PRODUCTION_HOST = 'https://partner.shopeemobile.com';

export interface ShopeeConfig {
  partnerId: string;
  partnerKey: string;
  baseUrl?: string;
}

export interface ShopeeTokenPair {
  accessToken: string;
  refreshToken: string;
  /** Số giây tới khi access token hết hạn (Shopee trả `expire_in`). */
  expireIn: number;
}

export interface ShopeeProductItem {
  item_id: number;
  item_name?: string;
  item_status?: string;
  stock?: number;
  [key: string]: unknown;
}

export interface ShopeeOrderItem {
  order_sn: string;
  order_status?: string;
  create_time?: number;
  update_time?: number;
  total_amount?: number;
  [key: string]: unknown;
}

/** Chi tiết 1 đơn Shopee (GET /api/v2/order/get_order_detail). */
export interface ShopeeOrderDetailItem {
  item_id: number;
  item_name?: string;
  model_id?: number;
  model_name?: string;
  /** SKU phân loại — khóa để resolve variant NEXORA (TASK-016/017). */
  model_sku?: string;
  model_quantity_purchased?: number;
  model_discounted_price?: number;
  model_original_price?: number;
  [key: string]: unknown;
}

export interface ShopeeOrderDetail {
  order_sn: string;
  order_status?: string;
  create_time?: number;
  update_time?: number;
  total_amount?: number;
  item_list?: ShopeeOrderDetailItem[];
  recipient_address?: {
    name?: string;
    phone?: string;
    full_address?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export class ShopeeCredentialsError extends Error {
  constructor(message: string) {
    super(`[Shopee] ${message}`);
    this.name = 'ShopeeCredentialsError';
  }
}

export class ShopeeApiError extends Error {
  constructor(
    message: string,
    public readonly shopeeError?: string,
  ) {
    super(`[Shopee] ${message}`);
    this.name = 'ShopeeApiError';
  }
}

/** Đọc cấu hình Shopee từ biến môi trường. Thiếu key → throw ngay. */
export function shopeeConfigFromEnv(): ShopeeConfig {
  const partnerId = process.env.SHOPEE_PARTNER_ID;
  const partnerKey = process.env.SHOPEE_PARTNER_KEY;
  if (!partnerId || !partnerKey) {
    throw new ShopeeCredentialsError(
      'Thiếu SHOPEE_PARTNER_ID hoặc SHOPEE_PARTNER_KEY trong biến môi trường. ' +
        'Đăng ký app sandbox tại Shopee Open Platform rồi đặt 2 biến này (xem .env.example). ' +
        'Client từ chối gọi API sàn khi chưa có key.',
    );
  }
  return {
    partnerId,
    partnerKey,
    baseUrl: process.env.SHOPEE_BASE_URL || SHOPEE_SANDBOX_HOST,
  };
}

export class ShopeeClient {
  private readonly partnerId: string;
  private readonly partnerKey: string;
  private readonly baseUrl: string;

  constructor(config: ShopeeConfig) {
    if (!config.partnerId || !config.partnerKey) {
      throw new ShopeeCredentialsError(
        'Thiếu partnerId hoặc partnerKey. Đặt SHOPEE_PARTNER_ID / SHOPEE_PARTNER_KEY.',
      );
    }
    this.partnerId = config.partnerId;
    this.partnerKey = config.partnerKey;
    this.baseUrl = (config.baseUrl || SHOPEE_SANDBOX_HOST).replace(/\/$/, '');
  }

  /**
   * Ký request theo chuẩn Shopee v2 (HMAC-SHA256, hex).
   * Base string: partner_id + api_path + timestamp [+ access_token + shop_id]
   * (shop API). Timestamp tính bằng giây, hiệu lực ~5 phút.
   */
  sign(path: string, timestamp: number, accessToken = '', shopId = ''): string {
    const base = `${this.partnerId}${path}${timestamp}${accessToken}${shopId}`;
    return createHmac('sha256', this.partnerKey).update(base).digest('hex');
  }

  /** Link ủy quyền cho seller: GET /api/v2/shop/auth_partner (ký public API). */
  buildAuthUrl(redirectUrl: string): string {
    const path = '/api/v2/shop/auth_partner';
    const timestamp = Math.floor(Date.now() / 1000);
    const params = new URLSearchParams({
      partner_id: this.partnerId,
      timestamp: String(timestamp),
      sign: this.sign(path, timestamp),
      redirect: redirectUrl,
    });
    return `${this.baseUrl}${path}?${params.toString()}`;
  }

  private async postPublic<T>(path: string, body: Record<string, unknown>): Promise<T> {
    const timestamp = Math.floor(Date.now() / 1000);
    const url =
      `${this.baseUrl}${path}?` +
      new URLSearchParams({
        partner_id: this.partnerId,
        timestamp: String(timestamp),
        sign: this.sign(path, timestamp),
      }).toString();
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, partner_id: Number(this.partnerId) }),
      signal: AbortSignal.timeout(15_000),
    });
    return this.handleResponse<T>(res, path);
  }

  private async shopCall<T>(
    method: 'GET' | 'POST',
    path: string,
    accessToken: string,
    shopId: string | number,
    query: Record<string, string | number> = {},
    body?: Record<string, unknown>,
  ): Promise<T> {
    if (!accessToken) {
      throw new ShopeeCredentialsError(
        'Thiếu access_token của shop: shop chưa ủy quyền OAuth hoặc token chưa được lưu. ' +
          'Chạy luồng ủy quyền (buildAuthUrl → đổi code lấy token) trước.',
      );
    }
    if (!shopId && shopId !== 0) {
      throw new ShopeeCredentialsError('Thiếu shop_id: không biết gọi API cho gian hàng nào.');
    }
    const timestamp = Math.floor(Date.now() / 1000);
    const params = new URLSearchParams({
      partner_id: this.partnerId,
      timestamp: String(timestamp),
      access_token: accessToken,
      shop_id: String(shopId),
      sign: this.sign(path, timestamp, accessToken, String(shopId)),
    });
    for (const [k, v] of Object.entries(query)) params.set(k, String(v));
    const res = await fetch(`${this.baseUrl}${path}?${params.toString()}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(15_000),
    });
    return this.handleResponse<T>(res, path);
  }

  /**
   * Shopee trả HTTP 200 kèm body { error, message, response }.
   * `error` rỗng = thành công. Log cả body khi lỗi để debug với request_id.
   */
  private async handleResponse<T>(res: Response, path: string): Promise<T> {
    let payload: any;
    try {
      payload = await res.json();
    } catch {
      throw new ShopeeApiError(
        `Shopee ${path} trả về body không phải JSON (HTTP ${res.status}).`,
      );
    }
    if (!res.ok) {
      throw new ShopeeApiError(
        `Shopee ${path} lỗi HTTP ${res.status}: ${JSON.stringify(payload)}`,
        payload?.error,
      );
    }
    if (payload?.error) {
      throw new ShopeeApiError(
        `Shopee ${path} lỗi ${payload.error}: ${payload.message || ''} ` +
          `(request_id: ${payload.request_id || 'không có'}). ` +
          'Gợi ý: invalid sign → kiểm tra môi trường key/host + timestamp; ' +
          'permission denied → kiểm tra category của app.',
        payload.error,
      );
    }
    return payload.response as T;
  }

  /** Đổi authorization code (10 phút, dùng 1 lần) lấy access/refresh token. */
  async getAccessToken(code: string, shopId: string | number): Promise<ShopeeTokenPair> {
    if (!code) throw new ShopeeCredentialsError('Thiếu authorization code từ callback OAuth.');
    const res = await this.postPublic<{
      access_token: string;
      refresh_token: string;
      expire_in: number;
    }>('/api/v2/auth/token/get', { code, shop_id: Number(shopId) });
    return { accessToken: res.access_token, refreshToken: res.refresh_token, expireIn: res.expire_in };
  }

  /** Refresh access token (4 giờ) bằng refresh token (30 ngày). */
  async refreshAccessToken(refreshToken: string, shopId: string | number): Promise<ShopeeTokenPair> {
    if (!refreshToken) {
      throw new ShopeeCredentialsError('Thiếu refresh_token: shop cần ủy quyền lại từ đầu.');
    }
    const res = await this.postPublic<{
      access_token: string;
      refresh_token: string;
      expire_in: number;
    }>('/api/v2/auth/access_token/get', { refresh_token: refreshToken, shop_id: Number(shopId) });
    return { accessToken: res.access_token, refreshToken: res.refresh_token, expireIn: res.expire_in };
  }

  /** Lấy danh sách sản phẩm của shop (phân trang offset/page_size). */
  async getProducts(
    accessToken: string,
    shopId: string | number,
    opts: { offset?: number; pageSize?: number; itemStatus?: string } = {},
  ): Promise<{ items: ShopeeProductItem[]; totalCount: number; hasNextPage: boolean }> {
    const res = await this.shopCall<{
      item: ShopeeProductItem[];
      total_count: number;
      has_next_page: boolean;
    }>('GET', '/api/v2/product/get_item_list', accessToken, shopId, {
      offset: opts.offset ?? 0,
      page_size: opts.pageSize ?? 50,
      ...(opts.itemStatus ? { item_status: opts.itemStatus } : {}),
    });
    return { items: res.item ?? [], totalCount: res.total_count ?? 0, hasNextPage: res.has_next_page ?? false };
  }

  /** Lấy danh sách đơn theo khoảng thời gian (phân trang bằng cursor). */
  async getOrders(
    accessToken: string,
    shopId: string | number,
    opts: {
      timeFrom: number;
      timeTo: number;
      orderStatus?: string;
      pageSize?: number;
      cursor?: string;
    },
  ): Promise<{ orders: ShopeeOrderItem[]; nextCursor: string; more: boolean }> {
    const res = await this.shopCall<{
      order_list: ShopeeOrderItem[];
      next_cursor: string;
      more: boolean;
    }>('GET', '/api/v2/order/get_order_list', accessToken, shopId, {
      time_range_field: 'create_time',
      time_from: opts.timeFrom,
      time_to: opts.timeTo,
      page_size: opts.pageSize ?? 100,
      cursor: opts.cursor ?? '',
      ...(opts.orderStatus ? { order_status: opts.orderStatus } : {}),
    });
    return {
      orders: res.order_list ?? [],
      nextCursor: res.next_cursor ?? '',
      more: res.more ?? false,
    };
  }

  /**
   * Chi tiết đơn theo danh sách order_sn (TASK-017).
   * Shopee giới hạn tối đa 50 mã/lần gọi — caller tự chia lô. Trả về
   * `order_list` kèm `item_list` + `recipient_address` (xin qua
   * `response_optional_fields`). Endpoint/chưa đối chiếu docs chính thức
   * (xem SPIKE §1.4); field thiếu thì client để undefined, mapper xử lý.
   */
  async getOrderDetail(
    accessToken: string,
    shopId: string | number,
    orderSnList: string[],
  ): Promise<ShopeeOrderDetail[]> {
    if (orderSnList.length === 0) return [];
    if (orderSnList.length > 50) {
      throw new ShopeeApiError('getOrderDetail tối đa 50 order_sn/lần gọi (giới hạn Shopee).');
    }
    const res = await this.shopCall<{ order_list: ShopeeOrderDetail[] }>(
      'GET',
      '/api/v2/order/get_order_detail',
      accessToken,
      shopId,
      {
        order_sn_list: JSON.stringify(orderSnList),
        response_optional_fields: 'item_list,recipient_address',
      },
    );
    return res.order_list ?? [];
  }

  /**
   * Đẩy tồn kho lên Shopee: POST /api/v2/product/update_stock.
   * model_id = 0 khi sản phẩm không có phân loại (model).
   */
  async updateStock(
    accessToken: string,
    shopId: string | number,
    input: { itemId: number; modelId?: number; stock: number },
  ): Promise<{ success: boolean }> {
    const res = await this.shopCall<{ success?: boolean }>(
      'POST',
      '/api/v2/product/update_stock',
      accessToken,
      shopId,
      {},
      { item_id: input.itemId, model_id: input.modelId ?? 0, stock: input.stock },
    );
    return { success: res.success ?? true };
  }
}
