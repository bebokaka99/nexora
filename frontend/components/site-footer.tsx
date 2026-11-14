'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, ShieldCheck, Phone, Mail, MapPin } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="bg-emerald-950 dark:bg-slate-950 text-emerald-100/80 dark:text-slate-400 py-14 border-t-2 border-emerald-500 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Column 1: Brand Logo & Business Value */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <img
                src="/logo.png"
                alt="NEXORA"
                className="h-10 sm:h-11 w-auto object-contain brightness-110"
              />
            </Link>
            <p className="text-xs text-emerald-100/70 dark:text-slate-400 max-w-sm leading-relaxed">
              Nền tảng công nghệ quản trị kinh doanh bán lẻ hợp nhất. Tự động hóa đồng bộ tồn kho đa kênh, kết nối trơn tru từ quầy thu ngân (POS) đến Shopee, TikTok Shop và Facebook.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Vận hành 99.9% ổn định
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Bảo mật dữ liệu Multi-Tenant
              </span>
            </div>
          </div>

          {/* Column 2: Khám Phá */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white mb-4">
              Khám Phá
            </h4>
            <ul className="text-xs space-y-3">
              <li>
                <Link href="/gioi-thieu" className="hover:text-white transition-colors duration-200">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link href="/giai-phap" className="hover:text-white transition-colors duration-200">
                  Giải pháp POS & Đa kênh
                </Link>
              </li>
              <li>
                <Link href="/doi-tuong" className="hover:text-white transition-colors duration-200">
                  Đối tượng sử dụng
                </Link>
              </li>
              <li>
                <Link href="/kenh-ban" className="hover:text-white transition-colors duration-200">
                  Kênh tích hợp sàn
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors duration-200">
                  Hỏi đáp nhanh (FAQ)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Bắt Đầu & Tài Khoản */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white mb-4">
              Bắt Đầu
            </h4>
            <ul className="text-xs space-y-3">
              <li>
                <Link
                  href="/dang-nhap"
                  className="hover:text-white transition-colors duration-200 flex items-center gap-1.5 font-bold text-emerald-300"
                >
                  <span>Đăng nhập hệ thống</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </li>
              <li>
                <Link href="/dang-ky" className="hover:text-white transition-colors duration-200">
                  Đăng ký dùng thử 14 ngày
                </Link>
              </li>
              <li>
                <Link href="/quan-tri" className="hover:text-white transition-colors duration-200">
                  Trang quản trị bán lẻ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits & Copyright */}
        <div className="pt-8 border-t border-emerald-900/60 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-200/60 dark:text-slate-500 gap-3">
          <p>© 2026 NEXORA. Bản quyền thuộc về nền tảng điều hành bán lẻ hợp nhất.</p>
          <p className="font-medium text-emerald-300/80 dark:text-slate-400">
            Giải pháp chuyên biệt cho chuỗi cửa hàng và doanh nghiệp bán lẻ hiện đại
          </p>
        </div>
      </div>
    </footer>
  );
}
