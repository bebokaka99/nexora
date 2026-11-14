'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  Store,
  Building2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export default function TargetAudiencePage() {
  const audiences = [
    {
      icon: Users,
      title: 'Chủ Shop & Cá Nhân Bán Hàng Online',
      role: 'Dành cho nhà bán lẻ trên Shopee, TikTok Shop, Facebook',
      painPoint: 'Tốn 3-4 giờ mỗi ngày để đối soát đơn hàng và thường xuyên bị sàn phạt vì hết hàng hủy đơn.',
      benefit: 'Tự động trừ tồn kho khi phát sinh đơn trên sàn, quản lý hội thoại tập trung và biết chính xác doanh thu thực nhận sau khi trừ phí sàn.',
      features: [
        'Đồng bộ đơn hàng Shopee và TikTok Shop tự động.',
        'Hộp thư gom chat Fanpage & TikTok một màn hình.',
        'Cảnh báo tồn kho sắp hết tức thì.',
        'Báo cáo dòng tiền thực tế sau chiết khấu sàn.',
      ],
    },
    {
      icon: Store,
      title: 'Cửa Hàng Bán Lẻ & Điểm Bán Vật Lý',
      role: 'Dành cho các cửa hàng thiết bị, đồ gia dụng, thời trang',
      painPoint: 'Quầy thu ngân thủ công chậm chạp, nhân viên tính nhầm tiền, khó mở rộng thêm kênh bán online vì sợ lệch kho.',
      benefit: 'Màn hình POS quét mã vạch 0.2s, in bill K80, thanh toán VietQR động tự động khớp tiền và mở rộng bán online mà kho vẫn đồng bộ 100%.',
      features: [
        'Quầy POS bán hàng siêu tốc hỗ trợ Barcode.',
        'Thanh toán chuyển khoản quét mã VietQR động.',
        'Phân quyền nhân viên ca kíp rõ ràng.',
        'Lưu trữ hóa đơn offline khi mất mạng Internet.',
      ],
      highlight: true,
    },
    {
      icon: Building2,
      title: 'Chuỗi Cửa Hàng & Doanh Nghiệp Phân Phối',
      role: 'Dành cho đơn vị vận hành từ 2 chi nhánh cửa hàng trở lên',
      painPoint: 'Khó khăn khi theo dõi ma trận tồn kho giữa các kho chi nhánh và kho tổng, dữ liệu nội bộ dễ bị rò rỉ.',
      benefit: 'Quản trị tập trung toàn bộ chi nhánh và kho hàng, luân chuyển hàng hóa dễ dàng với phiếu điều chuyển kho và cô lập dữ liệu chuẩn Multi-Tenant.',
      features: [
        'Quản trị ma trận tồn kho đa điểm (Kho Tổng & Cửa Hàng).',
        'Phiếu điều chuyển kho nội bộ minh bạch.',
        'Bảo mật phân tách dữ liệu chuẩn Multi-Tenant.',
        'So sánh chỉ số tăng trưởng giữa các chi nhánh.',
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans transition-colors duration-200">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 sm:py-20 bg-gradient-to-b from-emerald-50/50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-b border-emerald-100/60 dark:border-slate-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-xs font-bold shadow-sm">
              <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Đối Tượng Phù Hợp</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.2]">
              NEXORA Phù Hợp Với <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600">
                Mọi Quy Mô Kinh Doanh Bán Lẻ
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Giải pháp được thiết kế linh hoạt, sẵn sàng mở rộng từ 1 cửa hàng cá nhân đến chuỗi hàng chục chi nhánh.
            </p>
          </div>
        </section>

        {/* Detailed Audience Cards */}
        <section className="py-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            {audiences.map((aud, idx) => {
              const IconComp = aud.icon;
              return (
                <div
                  key={idx}
                  className={`p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border ${
                    aud.highlight
                      ? 'border-2 border-emerald-500 shadow-xl relative'
                      : 'border-slate-200 dark:border-slate-700 shadow-sm'
                  } flex flex-col justify-between hover:shadow-lg transition-all duration-300`}
                >
                  <div className="space-y-4">
                    {aud.highlight && (
                      <span className="absolute -top-3.5 right-6 text-[10px] uppercase font-extrabold px-3 py-1 rounded-full bg-emerald-600 text-white shadow-sm">
                        Lựa Chọn Phổ Biến
                      </span>
                    )}

                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center font-bold">
                      <IconComp className="w-6 h-6" />
                    </div>

                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      {aud.title}
                    </h2>
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      {aud.role}
                    </p>

                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      <strong className="text-slate-900 dark:text-white block mb-1">Thách thức gặp phải:</strong>
                      {aud.painPoint}
                    </div>

                    <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      <strong className="text-emerald-800 dark:text-emerald-300 block mb-1">NEXORA giải quyết:</strong>
                      {aud.benefit}
                    </div>

                    <div className="space-y-2 pt-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                        Tính năng then chốt:
                      </span>
                      {aud.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-200 dark:border-slate-700/80 mt-6">
                    <Link
                      href="/dang-nhap"
                      className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white flex items-center justify-center gap-1.5 transition-all shadow-sm"
                    >
                      <span>Bắt đầu trải nghiệm</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-14 bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-center">
          <div className="max-w-4xl mx-auto px-4 space-y-4">
            <h2 className="text-2xl font-extrabold">Bắt Đầu Quản Trị Cửa Hàng Của Bạn</h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl mx-auto">
              Đăng nhập để vào hệ thống điều hành hoặc đăng ký dùng thử 14 ngày miễn phí.
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
