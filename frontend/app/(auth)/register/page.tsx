'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Globe,
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Gift,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated, isLoading: authLoading } = useAuth();

  const [companyName, setCompanyName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEditedManually, setSlugEditedManually] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Nếu người dùng đã đăng nhập, tự động chuyển về dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [authLoading, isAuthenticated, router]);

  // Tự động tạo slug từ tên doanh nghiệp
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  };

  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCompanyName(val);
    if (!slugEditedManually) {
      setSlug(generateSlug(val));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugEditedManually(true);
    setSlug(
      e.target.value
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '')
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!companyName.trim()) {
      setErrorMessage('Vui lòng nhập tên doanh nghiệp');
      return;
    }

    if (!slug.trim()) {
      setErrorMessage('Vui lòng nhập mã định danh slug cho doanh nghiệp');
      return;
    }

    if (!/^[a-z0-9-]+$/.test(slug.trim())) {
      setErrorMessage('Mã slug chỉ được chứa chữ cái thường, số và dấu gạch ngang');
      return;
    }

    if (!fullName.trim()) {
      setErrorMessage('Vui lòng nhập họ và tên quản trị viên');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Vui lòng nhập địa chỉ email');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Mật khẩu phải có tối thiểu 8 ký tự');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('Vui lòng đồng ý với điều khoản sử dụng dịch vụ');
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        companyName: companyName.trim(),
        slug: slug.trim(),
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        phoneNumber: phoneNumber.trim() || undefined,
      });

      router.replace('/dashboard');
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Đăng ký tài khoản không thành công. Vui lòng thử lại.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl my-4">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold mb-2">
          <Gift className="w-3.5 h-3.5" />
          <span>Miễn phí 14 ngày trải nghiệm đầy đủ tính năng</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Đăng ký Doanh nghiệp mới
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Khởi tạo Workspace cô lập hoàn toàn cho thương hiệu bán lẻ của bạn
        </p>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-start gap-2.5 text-xs text-rose-300 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Company Name & Slug */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tên Doanh nghiệp <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Building2 className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={companyName}
                onChange={handleCompanyNameChange}
                placeholder="Gia Dụng An Thịnh"
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Mã Slug Subdomain <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Globe className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={slug}
                onChange={handleSlugChange}
                placeholder="an-thinh-store"
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Admin Full Name & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Họ và tên Quản trị viên <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn An"
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Số điện thoại liên hệ
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="0912 345 678"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Row 3: Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Email Quản trị Workspace <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@anthinh.vn"
              required
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Row 4: Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Mật khẩu (tối thiểu 8 ký tự) <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              minLength={8}
              required
              className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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

        {/* Terms checkbox */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-[11px] text-slate-300 leading-relaxed">
              Tôi đồng ý với Quy chế sử dụng dịch vụ và Chính sách bảo mật dữ liệu khách hàng của NEXORA Commerce OS.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || authLoading}
          className="w-full mt-3 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:from-blue-700 active:to-indigo-700 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang thiết lập Workspace doanh nghiệp...</span>
            </>
          ) : (
            <>
              <span>Hoàn tất đăng ký & Bắt đầu dùng thử</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Login */}
      <div className="mt-6 pt-5 border-t border-slate-700/60 text-center">
        <p className="text-xs text-slate-400">
          Đã có tài khoản doanh nghiệp?{' '}
          <Link
            href="/login"
            className="font-semibold text-blue-400 hover:text-blue-300 transition-colors underline-offset-4 hover:underline"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
