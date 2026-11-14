'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  KeyRound,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Nếu người dùng đã đăng nhập, tự động chuyển về dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace(redirectUrl);
    }
  }, [authLoading, isAuthenticated, redirectUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Vui lòng nhập địa chỉ email');
      return;
    }

    if (!password) {
      setErrorMessage('Vui lòng nhập mật khẩu');
      return;
    }

    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
      router.replace(redirectUrl);
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemoCredentials = () => {
    setEmail('admin@nexora.vn');
    setPassword('Nexora@2026');
    setErrorMessage(null);
  };

  return (
    <div className="w-full max-w-md bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl">
      {/* Card Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Đăng nhập hệ thống
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Nhập thông tin tài khoản doanh nghiệp của bạn để tiếp tục
        </p>
      </div>

      {/* Quick Demo Fill Helper Banner */}
      <div className="mb-5 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
            <KeyRound className="w-3.5 h-3.5" />
          </div>
          <div className="text-[11px] leading-relaxed text-slate-300">
            <div className="font-semibold text-emerald-300">Tài khoản quản trị mẫu:</div>
            <div className="text-slate-400">admin@nexora.vn • Nexora@2026</div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleFillDemoCredentials}
          className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-md border border-emerald-500/30 transition-colors"
        >
          <Sparkles className="w-3 h-3" />
          <span>Điền nhanh</span>
        </button>
      </div>

      {/* Error Message Box */}
      {errorMessage && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-start gap-2.5 text-xs text-rose-300 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Địa chỉ Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ten@doanhnghiep.vn"
              autoComplete="email"
              required
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Mật khẩu
            </label>
            <span className="text-[11px] text-slate-400 cursor-not-allowed">
              Quên mật khẩu?
            </span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="current-password"
              required
              className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-slate-900"
            />
            <span className="text-xs text-slate-300">Ghi nhớ đăng nhập</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || authLoading}
          className="w-full mt-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang xác thực tài khoản...</span>
            </>
          ) : (
            <>
              <span>Đăng nhập vào Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Register */}
      <div className="mt-6 pt-5 border-t border-slate-700/60 text-center">
        <p className="text-xs text-slate-400">
          Chưa có tài khoản doanh nghiệp?{' '}
          <Link
            href="/register"
            className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors underline-offset-4 hover:underline"
          >
            Đăng ký dùng thử 14 ngày
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md bg-slate-800/90 rounded-2xl p-8 text-center text-slate-300 flex flex-col items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500 mb-2" />
          <p className="text-xs">Đang tải trang đăng nhập...</p>
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
