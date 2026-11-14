'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  Zap,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Store,
  Boxes,
  Users,
  Target,
  Award,
} from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans transition-colors duration-200">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 sm:py-20 bg-gradient-to-b from-emerald-50/50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-b border-emerald-100/60 dark:border-slate-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-xs font-bold shadow-sm">
              <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Về Chúng Tôi — NEXORA Commerce OS</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.2]">
              Đồng Hành Cùng Doanh Nghiệp <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600">
                Làm Chủ Hoạt Động Bán Lẻ Hợp Nhất
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              NEXORA ra đời với sứ mệnh đơn giản hóa và tự động hóa toàn bộ dòng chảy bán hàng, giúp các chủ shop và doanh nghiệp tập trung vào tăng trưởng doanh thu thay vì vướng bận sổ sách thủ công.
            </p>
          </div>
        </section>

        {/* Detailed Who We Are & What We Do */}
        <section className="py-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              {/* Box 1: Chúng tôi là ai */}
              <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-emerald-100 dark:border-slate-700 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Chúng tôi là ai?
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    NEXORA là nền tảng công nghệ quản trị kinh doanh bán lẻ hợp nhất (Omnichannel Commerce OS), được phát triển bởi đội ngũ kỹ sư và chuyên gia vận hành chuỗi bán buôn - bán lẻ tại Việt Nam.
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Chúng tôi thấu hiểu sâu sắc bài toán nhức nhối của các nhà bán hàng: bán trên nhiều kênh (Shopee, TikTok Shop, Cửa hàng vật lý, Facebook) nhưng số liệu tồn kho bị phân mảnh, đối soát công nợ chậm trễ và tốn quá nhiều nhân lực kiểm đếm.
                  </p>
                </div>
                <div className="pt-6 border-t border-slate-200 dark:border-slate-700/80 mt-6 flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <Target className="w-4 h-4" />
                  <span>Mục tiêu: Đưa công nghệ quản trị chuẩn doanh nghiệp đến tay mọi nhà bán lẻ</span>
                </div>
              </div>

              {/* Box 2: Chúng tôi làm gì */}
              <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-emerald-100 dark:border-slate-700 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-md shadow-teal-600/20">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Chúng tôi làm gì?
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    NEXORA cung cấp giải pháp trọn gói tự động kết nối mọi điểm bán của bạn thành một thể thống nhất duy nhất:
                  </p>
                  <ul className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-2.5">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Bán lẻ thu ngân tại quầy (POS):</strong> Quét mã vạch 0.2s, in hóa đơn K80 và thanh toán VietQR động tự động khớp số tiền.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Đồng bộ tồn kho đa sàn:</strong> Cập nhật số lượng khả dụng tức thời lên Shopee & TikTok Shop ngay khi có đơn tại cửa hàng.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Hộp thư chốt đơn tập trung:</strong> Gom tin nhắn Facebook và TikTok về 1 màn hình, chốt đơn gửi khách 1-click.</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-6 border-t border-slate-200 dark:border-slate-700/80 mt-6 flex items-center gap-2 text-xs font-bold text-teal-700 dark:text-teal-400">
                  <Award className="w-4 h-4" />
                  <span>Cam kết: Giảm 90% sai lệch tồn kho và tiết kiệm 4 giờ vận hành mỗi ngày</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="py-14 bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-center">
          <div className="max-w-4xl mx-auto px-4 space-y-4">
            <h2 className="text-2xl font-extrabold">Trải Nghiệm Ngay Nền Tảng NEXORA</h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl mx-auto">
              Đăng nhập để vào hệ thống điều hành hoặc liên hệ với chúng tôi để nhận tư vấn triển khai cho cửa hàng của bạn.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                href="/dang-nhap"
                className="px-6 py-3 rounded-xl bg-white text-emerald-800 font-bold text-xs hover:bg-emerald-50 active:scale-95 transition-all shadow-md"
              >
                Đăng nhập Workspace
              </Link>
              <Link
                href="/dang-ky"
                className="px-6 py-3 rounded-xl bg-emerald-800/80 text-white font-bold text-xs hover:bg-emerald-800 border border-emerald-400/40 active:scale-95 transition-all"
              >
                Đăng ký dùng thử 14 ngày
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
