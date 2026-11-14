/**
 * NEXORA Commerce OS — API Client
 * Centralized HTTP request utility with JWT token injection and error handling.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const TOKEN_STORAGE_KEY = 'nexora_access_token';
export const REFRESH_TOKEN_STORAGE_KEY = 'nexora_refresh_token';

export class ApiError extends Error {
  statusCode: number;
  payload?: any;

  constructor(message: string, statusCode: number, payload?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.payload = payload;
  }
}

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  data: T;
  timestamp: string;
}

export function getStoredAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredTokens(accessToken: string, refreshToken?: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
    }
  } catch (error) {
    console.error('Không thể lưu token vào localStorage:', error);
  }
}

export function clearStoredTokens(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  } catch (error) {
    console.error('Không thể xóa token khỏi localStorage:', error);
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  skipAuth?: boolean;
}

async function request<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, skipAuth = false, headers = {}, ...restOptions } = options;

  let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(headers as Record<string, string>),
  };

  if (!skipAuth) {
    const token = getStoredAccessToken();
    if (token) {
      reqHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...restOptions,
      headers: reqHeaders,
    });
  } catch (err: any) {
    throw new ApiError(
      'Không thể kết nối tới máy chủ backend. Vui lòng kiểm tra lại dịch vụ tại cổng 4000.',
      0,
      err
    );
  }

  let json: any = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      json = await response.json();
    } catch {
      json = null;
    }
  }

  if (!response.ok) {
    let errorMessage = 'Yêu cầu không thành công';

    if (json?.error) {
      if (typeof json.error === 'string') {
        errorMessage = json.error;
      } else if (Array.isArray(json.error.message)) {
        errorMessage = json.error.message.join('. ');
      } else if (typeof json.error.message === 'string') {
        errorMessage = json.error.message;
      } else if (json.error.error) {
        errorMessage = String(json.error.error);
      }
    } else if (json?.message) {
      errorMessage = Array.isArray(json.message) ? json.message.join('. ') : json.message;
    }

    if (response.status === 401 && !skipAuth) {
      // Token expired or invalid
      clearStoredTokens();
    }

    throw new ApiError(errorMessage, response.status, json);
  }

  if (json && typeof json === 'object' && 'data' in json && 'success' in json) {
    return json.data as T;
  }

  return json as T;
}

export const apiClient = {
  get: <T = any>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  put: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),

  setTokens: setStoredTokens,
  getAccessToken: getStoredAccessToken,
  getRefreshToken: getStoredRefreshToken,
  clearTokens: clearStoredTokens,
};
