import React from 'react';
import Link from 'next/link';
import {
  Layers,
  ShieldCheck,
  Zap,
  Store,
  Boxes,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between text-slate-100">
      {/* Top Navbar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">
                NEXORA
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Commerce OS
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              One Platform. Every Channel. Complete Control.
            </p>
          </div>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Về trang chủ</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Brand Showcase (Visible on Large Screens) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-center space-y-6 pr-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold w-fit">
              <Zap className="w-3.5 h-3.5" />
              <span>Nền tảng Quản trị Bán lẻ Hợp nhất</span>
            </div>

            <h2 className="text-3xl font-extrabold text-white tracking-tight leading-snug">
              Kiểm soát toàn diện chuỗi cửa hàng & kênh bán trực tuyến
            </h2>

            <p className="text-sm text-slate-400 leading-relaxed">
              Giải pháp SaaS Multi-Tenant chuyên biệt cho doanh nghiệp bán lẻ gia dụng. Đồng bộ tồn kho tức thời giữa cửa hàng vật lý và sàn Shopee, TikTok Shop, Facebook.
            </p>

            <div className="space-y-3 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Cô lập dữ liệu bảo mật chuẩn Multi-Tenant</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Màn hình thu ngân POS quét mã vạch và in bill K80</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Khóa chống bán vượt tồn kho đa kênh thời gian thực</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Hộp thư hợp nhất Unified Inbox chốt đơn Messenger</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-[11px] text-slate-300">
                <span className="font-semibold text-white">Bảo mật chuẩn JWT & RLS</span>
                <p className="text-slate-400">Token xoay vòng 15 phút kèm mã hóa mật khẩu bcrypt cấp độ cao.</p>
              </div>
            </div>
          </div>

          {/* Right Auth Card Form */}
          <div className="w-full lg:col-span-7 flex justify-center">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 text-center text-xs text-slate-500 border-t border-slate-800/60">
        <p>© 2026 NEXORA Commerce OS. Bản quyền thuộc về nền tảng điều hành bán lẻ hợp nhất.</p>
      </footer>
    </div>
  );
}
