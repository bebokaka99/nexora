'use client';

import React from 'react';
import Link from 'next/link';
import {
  Store,
  Boxes,
  MessageSquare,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Barcode,
  QrCode,
  RefreshCw,
  TrendingUp,
  XCircle,
  Zap,
} from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export default function SolutionsPage() {
  const solutions = [
    {
      icon: Store,
      title: '1. Bán Hàng Tại Quầy (POS Terminal)',
      desc: 'Màn hình thu ngân siêu tốc tối ưu cho mọi loại thiết bị cảm ứng hoặc máy tính thông thường.',
      points: [
        'Quét mã vạch sản phẩm chỉ 0.2s, hỗ trợ mọi loại máy quét USB và Bluetooth.',
        'In hóa đơn nhiệt chuẩn K80 tức thời, tự động lưu thông tin khách hàng.',
        'Tạo mã thanh toán VietQR động tự động điền sẵn số tiền, giảm thiểu sai sót thu ngân.',
        'Hỗ trợ chế độ bán hàng ngoại tuyến (offline) khi cửa hàng gặp sự cố mạng.',
      ],
    },
    {
      icon: Boxes,
      title: '2. Khóa Tồn Kho Đa Sàn Thời Gian Thực',
      desc: 'Cơ chế khóa an toàn thông minh chống bán vượt tồn kho (Stock Concurrency Lock).',
      points: [
        'Vừa bán 1 sản phẩm tại quầy, tồn kho trên Shopee và TikTok Shop tự động trừ sau 1 giây.',
        'Quản lý linh hoạt nhiều kho: Kho Tổng, Kho Cửa Hàng 1, Kho Cửa Hàng 2.',
        'Lập phiếu điều chuyển kho nội bộ nhanh chóng, minh bạch vết hàng di chuyển.',
        'Tự động cảnh báo khi tồn kho giảm xuống dưới định mức an toàn.',
      ],
    },
    {
      icon: MessageSquare,
      title: '3. Hộp Thư Hội Thoại & Chốt Đơn Tập Trung',
      desc: 'Gom toàn bộ tin nhắn từ Facebook Fanpage, Messenger và TikTok Shop về một nơi làm việc duy nhất.',
      points: [
        'Quản lý đồng thời nhiều Fanpage và gian hàng trên cùng một giao diện.',
        'Nhân viên trực chat tra cứu tồn kho khả dụng và tạo đơn hàng gửi khách ngay trong khung chat.',
        'Tự động phân bổ khách hàng vào ca trực cho nhân viên bán hàng.',
        'Lưu lịch sử mua sắm của từng khách hàng để tư vấn chăm sóc cá nhân hóa.',
      ],
    },
    {
      icon: BarChart3,
      title: '4. Báo Cáo Doanh Thu & Đối Soát Lợi Nhuận',
      desc: 'Theo dõi dòng tiền thực tế sau khi đã trừ toàn bộ chiết khấu sàn, phí vận chuyển và chi phí đóng gói.',
      points: [
        'Báo cáo doanh thu đa kênh tổng hợp theo thời gian thực (Shopee, TikTok, Cửa hàng).',
        'Tự động đối soát tiền hàng thực nhận từ các sàn thương mại điện tử.',
        'Phân tích tỷ suất lợi nhuận gộp theo từng dòng sản phẩm và từng chi nhánh.',
        'Đo lường năng suất bán hàng và hiệu quả của từng nhân viên thu ngân.',
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
              <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Giải Pháp Vận Hành Cốt Lõi</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.2]">
              Chúng Tôi Làm Gì Giúp Doanh Nghiệp <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600">
                Tối Ưu Hóa Dòng Chảy Bán Hàng?
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Khám phá 4 phân hệ cốt lõi được thiết kế chuyên biệt để giải quyết triệt để các rủi ro vận hành bán lẻ đa kênh.
            </p>
          </div>
        </section>

        {/* 4 Solutions Detailed Cards */}
        <section className="py-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            {solutions.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={idx}
                  className="p-8 sm:p-10 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-emerald-100 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
                >
                  <div className="lg:col-span-4 space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20">
                      <IconComponent className="w-7 h-7" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                      {item.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">
                      Lợi ích và tính năng chi tiết:
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {item.points.map((pt, pIdx) => (
                        <div key={pIdx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Before vs After comparison */}
        <section className="py-16 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Sự Khác Biệt Khi Sử Dụng NEXORA
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
                So sánh hiệu quả trước và sau khi tự động hóa quy trình quản trị bán lẻ
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Before */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 space-y-3.5">
                <div className="flex items-center gap-2 text-rose-600 font-bold text-sm pb-2 border-b border-rose-100 dark:border-rose-900/40">
                  <XCircle className="w-5 h-5" />
                  <span>Cách làm truyền thống rời rạc</span>
                </div>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2.5">
                  <li>• Ghi chép sổ sách và Excel thủ công, dễ thất thoát số liệu.</li>
                  <li>• Tồn kho cập nhật chậm 2-3 giờ, thường xuyên bị hủy đơn do hết hàng.</li>
                  <li>• Nhân viên trực nhiều cửa sổ chat riêng lẻ, dễ sót khách.</li>
                  <li>• Mất nhiều ngày để đối soát công nợ và chiết khấu sàn cuối tháng.</li>
                </ul>
              </div>

              {/* After */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500 shadow-md space-y-3.5">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm pb-2 border-b border-emerald-100 dark:border-emerald-900/40">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Vận hành cùng NEXORA Commerce OS</span>
                </div>
                <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-2.5 font-medium">
                  <li>• Dữ liệu tập trung trên một màn hình duy nhất, chính xác 100%.</li>
                  <li>• Tồn kho đồng bộ 2 chiều tự động trong dưới 1 giây sau khi phát sinh đơn.</li>
                  <li>• Gom mọi hội thoại Facebook và TikTok về 1 nơi, chốt đơn 1-click.</li>
                  <li>• Báo cáo lợi nhuận thực nhận tự động cập nhật liên tục 24/7.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-14 bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-center">
          <div className="max-w-4xl mx-auto px-4 space-y-4">
            <h2 className="text-2xl font-extrabold">Bắt Đầu Trải Nghiệm Ngay</h2>
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
