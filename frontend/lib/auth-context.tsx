'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  apiClient,
  getStoredAccessToken,
  getStoredRefreshToken,
  setStoredTokens,
  clearStoredTokens,
} from './api-client';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: string;
  status?: string;
}

export interface AuthTenant {
  id: string;
  name: string;
  slug: string;
  status: string;
  trialEndsAt?: string;
}

export interface RegisterPayload {
  companyName: string;
  slug: string;
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

interface AuthResponseData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: AuthUser;
  tenant: AuthTenant;
}

interface AuthContextType {
  user: AuthUser | null;
  tenant: AuthTenant | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResponseData>;
  register: (payload: RegisterPayload) => Promise<AuthResponseData>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'nexora_user_cache';
const TENANT_STORAGE_KEY = 'nexora_tenant_cache';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tenant, setTenant] = useState<AuthTenant | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Khôi phục phiên làm việc khi ứng dụng tải lên
  useEffect(() => {
    async function initAuth() {
      if (typeof window === 'undefined') return;

      const token = getStoredAccessToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      setAccessToken(token);

      // Nạp dữ liệu bộ nhớ đệm trước để tránh giật lag giao diện
      try {
        const cachedUser = localStorage.getItem(USER_STORAGE_KEY);
        const cachedTenant = localStorage.getItem(TENANT_STORAGE_KEY);
        if (cachedUser) setUser(JSON.parse(cachedUser));
        if (cachedTenant) setTenant(JSON.parse(cachedTenant));
      } catch (err) {
        console.warn('Lỗi đọc bộ nhớ đệm user:', err);
      }

      // Xác thực token thực tế với máy chủ backend
      try {
        const profile = await apiClient.get<any>('/auth/me');
        if (profile) {
          const freshUser: AuthUser = {
            id: profile.id,
            email: profile.email,
            fullName: profile.fullName,
            phoneNumber: profile.phoneNumber,
            role: profile.role || 'ADMIN',
            status: profile.status,
          };
          setUser(freshUser);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(freshUser));

          if (profile.tenant) {
            setTenant(profile.tenant);
            localStorage.setItem(TENANT_STORAGE_KEY, JSON.stringify(profile.tenant));
          }
        }
      } catch (error: any) {
        console.warn('Phiên làm việc hết hạn hoặc không hợp lệ:', error.message);

        // Thử làm mới token nếu có Refresh Token
        const refreshToken = getStoredRefreshToken();
        if (refreshToken) {
          try {
            const refreshRes = await apiClient.post<any>(
              '/auth/refresh',
              { refreshToken },
              { skipAuth: true }
            );
            if (refreshRes?.accessToken) {
              setStoredTokens(refreshRes.accessToken);
              setAccessToken(refreshRes.accessToken);
              // Thử lại getMe
              const retryProfile = await apiClient.get<any>('/auth/me');
              if (retryProfile) {
                const refreshedUser: AuthUser = {
                  id: retryProfile.id,
                  email: retryProfile.email,
                  fullName: retryProfile.fullName,
                  phoneNumber: retryProfile.phoneNumber,
                  role: retryProfile.role || 'ADMIN',
                  status: retryProfile.status,
                };
                setUser(refreshedUser);
                if (retryProfile.tenant) setTenant(retryProfile.tenant);
              }
              setIsLoading(false);
              return;
            }
          } catch {
            // Refresh thất bại
          }
        }

        // Hủy phiên nếu không thể khôi phục
        clearStoredTokens();
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(TENANT_STORAGE_KEY);
        setUser(null);
        setTenant(null);
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResponseData> => {
      const data = await apiClient.post<AuthResponseData>(
        '/auth/login',
        { email, password },
        { skipAuth: true }
      );

      setStoredTokens(data.accessToken, data.refreshToken);
      setAccessToken(data.accessToken);
      setUser(data.user);
      setTenant(data.tenant);

      try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
        localStorage.setItem(TENANT_STORAGE_KEY, JSON.stringify(data.tenant));
      } catch (err) {
        console.warn('Lỗi ghi bộ nhớ đệm user:', err);
      }

      return data;
    },
    []
  );

  const register = useCallback(
    async (payload: RegisterPayload): Promise<AuthResponseData> => {
      const data = await apiClient.post<AuthResponseData>(
        '/auth/register',
        payload,
        { skipAuth: true }
      );

      setStoredTokens(data.accessToken, data.refreshToken);
      setAccessToken(data.accessToken);
      setUser(data.user);
      setTenant(data.tenant);

      try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
        localStorage.setItem(TENANT_STORAGE_KEY, JSON.stringify(data.tenant));
      } catch (err) {
        console.warn('Lỗi ghi bộ nhớ đệm user:', err);
      }

      return data;
    },
    []
  );

  const logout = useCallback(() => {
    clearStoredTokens();
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(TENANT_STORAGE_KEY);
      } catch (err) {
        console.warn('Lỗi xóa bộ nhớ đệm:', err);
      }
    }
    setUser(null);
    setTenant(null);
    setAccessToken(null);
    router.push('/dang-nhap');
  }, [router]);

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await apiClient.get<any>('/auth/me');
      if (profile) {
        const updatedUser: AuthUser = {
          id: profile.id,
          email: profile.email,
          fullName: profile.fullName,
          phoneNumber: profile.phoneNumber,
          role: profile.role || 'ADMIN',
          status: profile.status,
        };
        setUser(updatedUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
        if (profile.tenant) {
          setTenant(profile.tenant);
          localStorage.setItem(TENANT_STORAGE_KEY, JSON.stringify(profile.tenant));
        }
      }
    } catch (err) {
      console.error('Không thể cập nhật hồ sơ người dùng:', err);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        accessToken,
        isAuthenticated: !!user && !!accessToken,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
}
