'use client';

import React from 'react';
import Link from 'next/link';
import Image from "next/image";
import {
  ShieldCheck,
  Zap,
  ArrowLeft,
  CheckCircle2,
  Store,
  Boxes,
  MessageSquare,
} from 'lucide-react';
import { DarkModeToggle } from '@/components/dark-mode-toggle';
import { SiteFooter } from '@/components/site-footer';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200">
      {/* Top Navbar */}
      <header className="px-6 sm:px-8 h-20 flex items-center justify-between border-b border-emerald-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors">
        <Link href="/" className="flex items-center group py-2">
          <Image
            src="/logo.png"
            alt="NEXORA"
            width={1024}
            height={572}
            className="h-11 sm:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
          />
        </Link>

        <div className="flex items-center gap-3">
          <DarkModeToggle />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors py-2 px-3.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Về trang chủ</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 my-4">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Brand Showcase (Visible on Large Screens) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-center space-y-6 pr-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-bold w-fit shadow-sm">
              <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Nền Tảng Quản Trị Bán Lẻ Hợp Nhất</span>
            </div>

            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
              Kiểm soát toàn diện chuỗi cửa hàng & kênh bán trực tuyến
            </h2>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Giải pháp SaaS chuyên biệt cho doanh nghiệp và nhà bán lẻ hiện đại. Đồng bộ tồn kho tức thời giữa cửa hàng vật lý và các sàn Shopee, TikTok Shop, Facebook.
            </p>

            <div className="space-y-3 pt-2 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Cô lập dữ liệu bảo mật chuẩn Multi-Tenant</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
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

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-slate-900 dark:text-white block">Bảo mật chuẩn doanh nghiệp</span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">Mã hóa an toàn dữ liệu, phân quyền nhân viên bán hàng nghiêm ngặt.</p>
              </div>
            </div>
          </div>

          {/* Right Auth Card Form */}
          <div className="w-full lg:col-span-7 flex justify-center">
            {children}
          </div>
        </div>
      </main>

      {/* Synchronized Site Footer */}
      <SiteFooter />
    </div>
  );
}
