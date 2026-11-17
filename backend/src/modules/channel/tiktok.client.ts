import { createHmac, timingSafeEqual } from 'crypto';

/**
 * TikTok Shop Open API (202309) — client HTTP thật (TASK-013).
 *
 * Nguồn contract: docs/tasks/phase-06-5-foundation-hardening/SPIKE-shopee-tiktok.md
 * §2. Docs chính thức (partner.tiktokshop.com) yêu cầu đăng nhập nên chưa đối
 * chiếu trực tiếp — các path dưới đây đã đối chiếu chéo 3 nguồn độc lập
 * (netalith, deltologic, docs.intelligent.page đọc từ source EcomPHP/tiktokshop-php)
 * và PHẢI kiểm tra lại với Partner Center khi có key sandbox. Luồng OAuth,
 * công thức ký HMAC, vòng đời token và mã lỗi đã khớp giữa các nguồn.
 *
 * Mọi credential đọc từ biến môi trường, KHÔNG hardcode key/secret nào:
 *   TIKTOK_SHOP_APP_KEY, TIKTOK_SHOP_APP_SECRET,
 *   TIKTOK_SHOP_SERVICE_ID (để tạo link ủy quyền),
 *   TIKTOK_API_BASE_URL (mặc định https://open-api.tiktokglobalshop.com),
 *   TIKTOK_AUTH_BASE_URL (mặc định https://auth.tiktok-shops.com)
 *
 * ⚠️ Token endpoint dùng GET và gửi app_secret TRONG QUERY STRING (đặc thù của
 * TikTok, khác OAuth2 chuẩn). Không log URL của 2 endpoint này, không để lọt
 * vào APM/error report (xem SPIKE §2.2).
 *
 * Thiếu credential → throw lỗi rõ ràng TRƯỚC KHI gọi mạng (không gọi API sàn).
 * Dùng fetch có sẵn của Node 22 — không thêm dependency.
 */

export const TIKTOK_API_HOST = 'https://open-api.tiktokglobalshop.com';
export const TIKTOK_AUTH_HOST = 'https://auth.tiktok-shops.com';
export const TIKTOK_AUTHORIZE_HOST = 'https://services.tiktokshop.com';

export interface TikTokConfig {
  appKey: string;
  appSecret: string;
  serviceId?: string;
  apiBaseUrl?: string;
  authBaseUrl?: string;
}

export interface TikTokTokenPair {
  accessToken: string;
  /** Unix timestamp (giây) lúc access token hết hạn — TikTok trả timestamp tuyệt đối. */
  accessTokenExpireIn: number;
  refreshToken: string;
  /** Unix timestamp (giây) lúc refresh token hết hạn. */
  refreshTokenExpireIn: number;
  openId?: string;
  sellerName?: string;
  grantedScopes?: string[];
}

export interface TikTokShopInfo {
  id: string;
  cipher: string;
  name?: string;
  code?: string;
  region?: string;
}

export interface TikTokProductItem {
  id: string;
  name?: string;
  status?: string;
  skus?: Array<{ id: string; seller_sku?: string; inventory?: Array<{ warehouse_id: string; quantity: number }> }>;
  [key: string]: unknown;
}

export interface TikTokOrderItem {
  id: string;
  status?: string;
  create_time?: number;
  update_time?: number;
  payment?: { total_amount?: string; currency?: string };
  /**
   * TASK-017: mặt hàng trong đơn (trả kèm trong orders/search, contract
   * 202309 — chưa đối chiếu sandbox). `seller_sku` là khóa để resolve
   * variant NEXORA; thiếu thì fallback `sku_id`.
   */
  line_items?: Array<{
    id?: string;
    product_id?: string;
    sku_id?: string;
    seller_sku?: string;
    product_name?: string;
    sku_name?: string;
    quantity?: number;
    sale_price?: string;
    [key: string]: unknown;
  }>;
  recipient_address?: {
    name?: string;
    phone?: string;
    full_address?: string;
    [key: string]: unknown;
  };
  /** Đơn bị giữ 1 giờ sau thanh toán (từ Q1/2026, SPIKE §2.1). */
  is_on_hold_order?: boolean;
  [key: string]: unknown;
}

export class TikTokCredentialsError extends Error {
  constructor(message: string) {
    super(`[TikTok Shop] ${message}`);
    this.name = 'TikTokCredentialsError';
  }
}

export class TikTokApiError extends Error {
  constructor(
    message: string,
    public readonly tiktokCode?: number,
    public readonly requestId?: string,
  ) {
    super(`[TikTok Shop] ${message}`);
    this.name = 'TikTokApiError';
  }
}

/** Đọc cấu hình TikTok Shop từ biến môi trường. Thiếu key → throw ngay. */
export function tikTokConfigFromEnv(): TikTokConfig {
  const appKey = process.env.TIKTOK_SHOP_APP_KEY;
  const appSecret = process.env.TIKTOK_SHOP_APP_SECRET;
  if (!appKey || !appSecret) {
    throw new TikTokCredentialsError(
      'Thiếu TIKTOK_SHOP_APP_KEY hoặc TIKTOK_SHOP_APP_SECRET trong biến môi trường. ' +
        'Tạo app tại TikTok Shop Partner Center rồi đặt 2 biến này (xem .env.example). ' +
        'Client từ chối gọi API sàn khi chưa có key.',
    );
  }
  return {
    appKey,
    appSecret,
    serviceId: process.env.TIKTOK_SHOP_SERVICE_ID,
    apiBaseUrl: process.env.TIKTOK_API_BASE_URL || TIKTOK_API_HOST,
    authBaseUrl: process.env.TIKTOK_AUTH_BASE_URL || TIKTOK_AUTH_HOST,
  };
}

export class TikTokClient {
  private readonly appKey: string;
  private readonly appSecret: string;
  private readonly serviceId?: string;
  private readonly apiBaseUrl: string;
  private readonly authBaseUrl: string;

  constructor(config: TikTokConfig) {
    if (!config.appKey || !config.appSecret) {
      throw new TikTokCredentialsError(
        'Thiếu appKey hoặc appSecret. Đặt TIKTOK_SHOP_APP_KEY / TIKTOK_SHOP_APP_SECRET.',
      );
    }
    this.appKey = config.appKey;
    this.appSecret = config.appSecret;
    this.serviceId = config.serviceId;
    this.apiBaseUrl = (config.apiBaseUrl || TIKTOK_API_HOST).replace(/\/$/, '');
    this.authBaseUrl = (config.authBaseUrl || TIKTOK_AUTH_HOST).replace(/\/$/, '');
  }

  /**
   * Ký request theo chuẩn TikTok Shop (HMAC-SHA256, hex).
   * Chuỗi ký: app_secret + path + {key}{value} đã sort (trừ sign/access_token)
   * + body (đúng bytes gửi đi, trừ multipart) + app_secret.
   * Access token KHÔNG nằm trong chuỗi ký (đi ở header x-tts-access-token).
   *
   * Ví dụ kiểm chứng từ signing guide (dùng cho unit test):
   * secret=e59af819cc, path=/authorization/202309/shops,
   * app_key=29a39d, timestamp=1623812664
   * → sign = b596b73e0cc6de07ac26f036364178ab16b0a907af13d43f0a0cd2345f582dc8
   */
  sign(path: string, query: Record<string, string>, bodyString = ''): string {
    const keys = Object.keys(query)
      .filter((k) => k !== 'sign' && k !== 'access_token')
      .sort();
    const base = path + keys.map((k) => `${k}${query[k]}`).join('') + bodyString;
    const wrapped = this.appSecret + base + this.appSecret;
    return createHmac('sha256', this.appSecret).update(wrapped).digest('hex');
  }

  /** Link ủy quyền cho seller. `state` chống CSRF — caller phải lưu và kiểm tra khi callback. */
  buildAuthUrl(state: string, redirectUrl?: string): string {
    if (!this.serviceId) {
      throw new TikTokCredentialsError(
        'Thiếu TIKTOK_SHOP_SERVICE_ID: không tạo được link ủy quyền TikTok Shop.',
      );
    }
    const params = new URLSearchParams({ service_id: this.serviceId, state });
    if (redirectUrl) params.set('redirect_uri', redirectUrl);
    return `${TIKTOK_AUTHORIZE_HOST}/open/authorize?${params.toString()}`;
  }

  /**
   * Gọi token endpoint (GET, app_secret trong query). Thành công là code=0
   * TRONG BODY, không chỉ HTTP status. Không log URL (chứa app_secret).
   */
  private async tokenCall<T>(
    path: string,
    params: Record<string, string>,
  ): Promise<T> {
    const url = `${this.authBaseUrl}${path}?${new URLSearchParams(params).toString()}`;
    const res = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(15_000) });
    let payload: any;
    try {
      payload = await res.json();
    } catch {
      throw new TikTokApiError(`TikTok ${path} trả về body không phải JSON (HTTP ${res.status}).`);
    }
    if (payload?.code !== 0) {
      throw new TikTokApiError(
        `TikTok ${path} lỗi code=${payload?.code}: ${payload?.message || ''} ` +
          `(request_id: ${payload?.request_id || 'không có'}). ` +
          'Gợi ý: 36004004 → auth code đã dùng/quá 30 phút; kiểm tra grant_type = authorized_code.',
        payload?.code,
        payload?.request_id,
      );
    }
    return payload.data as T;
  }

  /** Đổi auth_code (30 phút, dùng 1 lần) lấy access/refresh token. */
  async getAccessToken(authCode: string): Promise<TikTokTokenPair> {
    if (!authCode) throw new TikTokCredentialsError('Thiếu auth_code từ callback OAuth.');
    const data = await this.tokenCall<{
      access_token: string;
      access_token_expire_in: number;
      refresh_token: string;
      refresh_token_expire_in: number;
      open_id?: string;
      seller_name?: string;
      granted_scopes?: string;
    }>('/api/v2/token/get', {
      app_key: this.appKey,
      app_secret: this.appSecret,
      auth_code: authCode,
      grant_type: 'authorized_code',
    });
    return {
      accessToken: data.access_token,
      accessTokenExpireIn: data.access_token_expire_in,
      refreshToken: data.refresh_token,
      refreshTokenExpireIn: data.refresh_token_expire_in,
      openId: data.open_id,
      sellerName: data.seller_name,
      grantedScopes: data.granted_scopes ? data.granted_scopes.split(',') : [],
    };
  }

  /** Refresh access token (7 ngày) bằng refresh token. Thay CẢ 2 token bằng giá trị mới. */
  async refreshAccessToken(refreshToken: string): Promise<TikTokTokenPair> {
    if (!refreshToken) {
      throw new TikTokCredentialsError('Thiếu refresh_token: shop cần ủy quyền lại từ đầu.');
    }
    const data = await this.tokenCall<{
      access_token: string;
      access_token_expire_in: number;
      refresh_token: string;
      refresh_token_expire_in: number;
      open_id?: string;
      seller_name?: string;
      granted_scopes?: string;
    }>('/api/v2/token/refresh', {
      app_key: this.appKey,
      app_secret: this.appSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });
    return {
      accessToken: data.access_token,
      accessTokenExpireIn: data.access_token_expire_in,
      refreshToken: data.refresh_token,
      refreshTokenExpireIn: data.refresh_token_expire_in,
      openId: data.open_id,
      sellerName: data.seller_name,
      grantedScopes: data.granted_scopes ? data.granted_scopes.split(',') : [],
    };
  }

  /**
   * Gọi business API. Query bắt buộc: app_key, timestamp (giây), sign.
   * Access token đi ở header x-tts-access-token (từ 202309, không nằm trong query).
   * `shopCipher` là query param thường và ĐƯỢC tính vào chuỗi ký (khi endpoint yêu cầu).
   */
  private async apiCall<T>(
    method: 'GET' | 'POST',
    path: string,
    accessToken: string,
    query: Record<string, string> = {},
    body?: Record<string, unknown>,
  ): Promise<T> {
    if (!accessToken) {
      throw new TikTokCredentialsError(
        'Thiếu access_token của shop: shop chưa ủy quyền OAuth hoặc token chưa được lưu. ' +
          'Chạy luồng ủy quyền trước.',
      );
    }
    const timestamp = String(Math.floor(Date.now() / 1000));
    const unsigned: Record<string, string> = { app_key: this.appKey, timestamp, ...query };
    const bodyString = body ? JSON.stringify(body) : '';
    const sign = this.sign(path, unsigned, bodyString);
    const url =
      `${this.apiBaseUrl}${path}?` +
      new URLSearchParams({ ...unsigned, sign }).toString();
    const res = await fetch(url, {
      method,
      headers: { 'x-tts-access-token': accessToken, 'content-type': 'application/json' },
      body: method === 'POST' ? bodyString : undefined,
      signal: AbortSignal.timeout(20_000),
    });
    let payload: any;
    try {
      payload = await res.json();
    } catch {
      throw new TikTokApiError(
        `TikTok ${path} trả về body không phải JSON (HTTP ${res.status}).`,
        undefined,
        undefined,
      );
    }
    if (!res.ok || payload?.code !== 0) {
      const code = payload?.code;
      throw new TikTokApiError(
        `TikTok ${path} lỗi code=${code}: ${payload?.message || `HTTP ${res.status}`} ` +
          `(request_id: ${payload?.request_id || 'không có'}). ` +
          'Gợi ý: 106001 → kiểm tra chữ ký; 105002 → token hết hạn, refresh rồi retry; ' +
          '105005 → thiếu scope; 106013 → thiếu shop_cipher; 36009002 → rate limit, backoff.',
        code,
        payload?.request_id,
      );
    }
    return payload.data as T;
  }

  /** Lấy shop đã ủy quyền + shop_cipher (gọi đầu tiên sau OAuth). */
  async getAuthorizedShops(accessToken: string): Promise<TikTokShopInfo[]> {
    const data = await this.apiCall<{ shops?: Array<{ id: string; cipher: string; name?: string; code?: string; region?: string }> }>(
      'GET',
      '/authorization/202309/shops',
      accessToken,
    );
    return (data.shops ?? []).map((s) => ({
      id: s.id,
      cipher: s.cipher,
      name: s.name,
      code: s.code,
      region: s.region,
    }));
  }

  /** Tìm sản phẩm của shop (POST, phân trang page_size/page_token). */
  async getProducts(
    accessToken: string,
    shopCipher: string,
    opts: { pageSize?: number; pageToken?: string; status?: string } = {},
  ): Promise<{ products: TikTokProductItem[]; nextPageToken: string; totalCount: number }> {
    if (!shopCipher) {
      throw new TikTokCredentialsError('Thiếu shop_cipher: gọi getAuthorizedShops trước để lấy cipher của shop.');
    }
    const data = await this.apiCall<{
      products?: TikTokProductItem[];
      next_page_token?: string;
      total_count?: number;
    }>(
      'POST',
      '/product/202309/products/search',
      accessToken,
      { shop_cipher: shopCipher },
      {
        page_size: opts.pageSize ?? 50,
        ...(opts.pageToken ? { page_token: opts.pageToken } : {}),
        ...(opts.status ? { status: opts.status } : {}),
      },
    );
    return {
      products: data.products ?? [],
      nextPageToken: data.next_page_token ?? '',
      totalCount: data.total_count ?? 0,
    };
  }

  /** Tìm đơn hàng theo khoảng thời gian tạo (tối đa 100 đơn/trang). */
  async getOrders(
    accessToken: string,
    shopCipher: string,
    opts: { createTimeGe: number; createTimeLt: number; pageSize?: number; pageToken?: string },
  ): Promise<{ orders: TikTokOrderItem[]; nextPageToken: string; totalCount: number }> {
    if (!shopCipher) {
      throw new TikTokCredentialsError('Thiếu shop_cipher: gọi getAuthorizedShops trước để lấy cipher của shop.');
    }
    const data = await this.apiCall<{
      orders?: TikTokOrderItem[];
      next_page_token?: string;
      total_count?: number;
    }>(
      'POST',
      '/order/202309/orders/search',
      accessToken,
      { shop_cipher: shopCipher },
      {
        create_time_ge: opts.createTimeGe,
        create_time_lt: opts.createTimeLt,
        page_size: opts.pageSize ?? 100,
        ...(opts.pageToken ? { page_token: opts.pageToken } : {}),
      },
    );
    return {
      orders: data.orders ?? [],
      nextPageToken: data.next_page_token ?? '',
      totalCount: data.total_count ?? 0,
    };
  }

  /**
   * Đẩy tồn kho: POST /product/202309/products/{product_id}/inventory/update.
   * Body: skus: [{ id, inventory: [{ warehouse_id, quantity }] }].
   */
  async updateStock(
    accessToken: string,
    shopCipher: string,
    productId: string,
    skus: Array<{ skuId: string; warehouseId: string; quantity: number }>,
  ): Promise<{ success: boolean }> {
    if (!shopCipher) {
      throw new TikTokCredentialsError('Thiếu shop_cipher: gọi getAuthorizedShops trước để lấy cipher của shop.');
    }
    const bySku = new Map<string, Array<{ warehouse_id: string; quantity: number }>>();
    for (const s of skus) {
      const list = bySku.get(s.skuId) ?? [];
      list.push({ warehouse_id: s.warehouseId, quantity: s.quantity });
      bySku.set(s.skuId, list);
    }
    await this.apiCall(
      'POST',
      `/product/202309/products/${productId}/inventory/update`,
      accessToken,
      { shop_cipher: shopCipher },
      {
        skus: [...bySku.entries()].map(([id, inventory]) => ({ id, inventory })),
      },
    );
    return { success: true };
  }

  /**
   * Verify chữ ký webhook: HMAC-SHA256(app_key + raw_body, key=app_secret),
   * header Authorization (không prefix Bearer). So sánh constant-time.
   */
  verifyWebhookSignature(rawBody: Buffer, authorizationHeader: string | undefined): boolean {
    if (!authorizationHeader) return false;
    const expected = createHmac('sha256', this.appSecret)
      .update(Buffer.concat([Buffer.from(this.appKey), rawBody]))
      .digest('hex');
    const received = authorizationHeader.trim().toLowerCase();
    if (received.length !== expected.length) return false;
    return timingSafeEqual(Buffer.from(received), Buffer.from(expected));
  }
}
