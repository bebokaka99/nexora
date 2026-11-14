'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Store,
  Boxes,
  ShoppingBag,
  MessageSquare,
  BarChart3,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Barcode,
  ChevronDown,
  TrendingUp,
  AlertTriangle,
  Building2,
  Users,
  CreditCard,
  QrCode,
  Truck,
  HelpCircle,
  Check,
  Sparkles,
} from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export default function HomePage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqList = [
    {
      q: 'NEXORA có hỗ trợ dùng thử miễn phí không?',
      a: 'Có. Mọi cá nhân kinh doanh và doanh nghiệp khi đăng ký đều được kích hoạt gói dùng thử đầy đủ tính năng trong 14 ngày. Không cần thẻ tín dụng, không mất phí khởi tạo và có chuyên viên hỗ trợ kết nối dữ liệu ban đầu.',
    },
    {
      q: 'Đồng bộ tồn kho với Shopee và TikTok Shop có bị trễ không?',
      a: 'NEXORA sử dụng kiến trúc xử lý sự kiện thời gian thực. Khi phát sinh đơn hàng tại quầy POS hoặc trên sàn, số lượng tồn kho khả dụng của sản phẩm sẽ được tự động đồng bộ hai chiều đến tất cả các kênh chỉ trong dưới 1 giây.',
    },
    {
      q: 'Dữ liệu kinh doanh và khách hàng của tôi có được bảo mật an toàn không?',
      a: 'Tuyệt đối an toàn. Hệ thống ứng dụng kiến trúc bảo mật phân tách dữ liệu độc lập cho từng doanh nghiệp. Dữ liệu cửa hàng của bạn hoàn toàn cô lập, mật khẩu được mã hóa an toàn và kiểm soát phân quyền chặt chẽ theo từng nhân viên.',
    },
    {
      q: 'Nếu cửa hàng bị mất kết nối Internet, máy POS có bán hàng được không?',
      a: 'Có. Màn hình thu ngân POS hỗ trợ lưu tạm hóa đơn vào bộ nhớ cục bộ khi mạng gặp sự cố. Ngay khi có kết nối mạng trở lại, hệ thống sẽ tự động đồng bộ hóa đơn và trừ tồn kho lên máy chủ trung tâm.',
    },
    {
      q: 'Tôi cần chuẩn bị thiết bị phần cứng gì để bắt đầu sử dụng?',
      a: 'Bạn chỉ cần bất kỳ thiết bị nào có trình duyệt web như máy tính bảng, điện thoại di động, laptop hoặc PC. Hệ thống tương thích hoàn toàn với các loại máy in nhiệt K80 và máy quét mã vạch cổng USB hoặc Bluetooth thông dụng trên thị trường.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* =========================================================================
          SITE HEADER (With prominent logo, clean routes without '#', DarkMode & Login CTA)
      ========================================================================= */}
      <SiteHeader />

      {/* =========================================================================
          HERO SECTION: 2 COLUMNS (Trái: Nội dung rõ ràng • Phải: Minh họa trực quan)
      ========================================================================= */}
      <section className="relative pt-12 pb-20 overflow-hidden bg-gradient-to-b from-emerald-50/40 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-b border-emerald-100/60 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* CỘT TRÁI: Nội dung giới thiệu Chúng tôi là ai & Chúng tôi làm gì */}
            <div className="lg:col-span-6 space-y-6 text-left">
              {/* Commercial Enterprise Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-bold shadow-sm animate-in fade-in duration-300">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Nền Tảng Quản Trị Bán Lẻ Hợp Nhất Đa Kênh</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.18]">
                Làm chủ mọi kênh bán lẻ. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600">
                  Chính xác từng sản phẩm, tức thời từng đơn hàng.
                </span>
              </h1>

              {/* Two clear paragraphs: Who we are & What we do */}
              <div className="space-y-3.5 text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 shadow-sm">
                  <p className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Chúng tôi là ai?
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-normal">
                    NEXORA là giải pháp công nghệ quản trị kinh doanh bán lẻ hợp nhất (Omnichannel Commerce), đồng hành cùng các chủ shop, chuỗi cửa hàng bán lẻ và doanh nghiệp thương mại phát triển bền vững.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 shadow-sm">
                  <p className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Chúng tôi làm gì?
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-normal">
                    Chúng tôi kết nối và tự động hóa toàn diện từ thu ngân bán lẻ tại quầy (POS), quản trị kho hàng đa điểm, đến đồng bộ đơn và tồn kho tức thì với Shopee, TikTok Shop và Facebook Messenger.
                  </p>
                </div>
              </div>

              {/* Call to action buttons with smooth hover/active animations */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  href="/dang-nhap"
                  className="px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-lg shadow-emerald-600/25 transition-all duration-200 flex items-center gap-2 hover:-translate-y-0.5"
                >
                  <span>Bắt đầu trải nghiệm ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/giai-phap"
                  className="px-5 py-3.5 rounded-xl font-bold text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-all duration-200 active:scale-95"
                >
                  Tìm hiểu giải pháp
                </Link>
              </div>

              {/* Quick trust highlights */}
              <div className="pt-2 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Đồng bộ tức thì dưới 1s
                </span>
                <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Khóa an toàn chống quá bán
                </span>
                <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Dùng thử 14 ngày miễn phí
                </span>
              </div>
            </div>

            {/* CỘT PHẢI: Hình ảnh minh họa trực quan sinh động theo tông Xanh lá & Trắng */}
            <div className="lg:col-span-6">
              <div className="relative mx-auto rounded-3xl p-3 bg-gradient-to-b from-emerald-100 via-emerald-50 to-slate-200 dark:from-slate-800 dark:to-slate-900 shadow-2xl ring-1 ring-emerald-500/20">
                <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 text-white p-5 sm:p-6 space-y-5">
                  {/* Mockup Top Status Bar */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-bold text-emerald-400">Bán Lẻ Hợp Nhất Đang Vận Hành</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700">
                      2 Cửa Hàng • 3 Kênh Sàn
                    </span>
                  </div>

                  {/* Feature Highlight 1: POS Screen Card */}
                  <div className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 hover:border-emerald-500/50 transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                          <Barcode className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">Quầy Thu Ngân Bán Lẻ (POS)</div>
                          <div className="text-[10px] text-slate-400">Chi nhánh 1 — Quận 1</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Quét 0.2s • In Bill K80
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs bg-slate-950/60 p-2.5 rounded-lg font-mono">
                      <span className="text-slate-300">Nồi chiên không dầu 5.5L (x1)</span>
                      <span className="text-emerald-400 font-bold">1.450.000 ₫</span>
                    </div>
                  </div>

                  {/* Feature Highlight 2: Omnichannel Sync Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                      <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-between">
                        <span>Đơn Shopee mới</span>
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      </div>
                      <div className="font-bold text-sm text-white">#ORD-SP-9821</div>
                      <div className="text-[10px] text-emerald-400 mt-1">Đã tự động trừ kho Q.1</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                      <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-between">
                        <span>Đơn TikTok Shop</span>
                        <span className="w-2 h-2 rounded-full bg-sky-400" />
                      </div>
                      <div className="font-bold text-sm text-white">#ORD-TT-5510</div>
                      <div className="text-[10px] text-emerald-400 mt-1">Đang chờ đóng gói</div>
                    </div>
                  </div>

                  {/* Feature Highlight 3: VietQR Dynamic Payment Badge */}
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/80 to-slate-800 border border-emerald-800/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-600 text-white shadow-sm">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Thanh Toán VietQR Tự Động Khớp Tiền</div>
                        <div className="text-[10px] text-emerald-300">Khách quét mã, hóa đơn hoàn tất tức thì</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-400">100% Khớp Lệnh</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: CHÚNG TÔI LÀM GÌ (4 TRỤ CỘT GIẢI PHÁP CỐT LÕI)
      ========================================================================= */}
      <section className="py-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2 block">
              Giải Pháp Thực Tiễn
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Chúng Tôi Làm Gì Cho Hoạt Động Bán Lẻ Của Bạn?
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Loại bỏ hoàn toàn sổ sách thủ công và tình trạng lệch kho bằng 4 phân hệ thông minh, liên kết chặt chẽ trong một hệ thống duy nhất.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. Bán hàng tại quầy */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-emerald-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">
                1. Bán Tại Quầy (POS)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Thu ngân mượt mà trên mọi thiết bị. Quét mã vạch 0.2s, in hóa đơn nhiệt K80 và thanh toán tự động qua mã VietQR động chính xác từng đồng.
              </p>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 font-medium">
                <li className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>Quét Barcode & In bill K80</span>
                </li>
                <li className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>Tự động trừ kho tại chi nhánh</span>
                </li>
                <li className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>Thanh toán VietQR động</span>
                </li>
              </ul>
            </div>

            {/* 2. Đồng bộ tồn kho đa sàn */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-emerald-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Boxes className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">
                2. Khóa Tồn Kho Đa Sàn
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Cơ chế khóa an toàn chống bán vượt tồn kho (Stock Lock). Đơn phát sinh ở cửa hàng, tồn kho Shopee & TikTok Shop lập tức được cập nhật sau 1 giây.
              </p>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 font-medium">
                <li className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>Triệt tiêu lỗi hủy đơn do hết hàng</span>
                </li>
                <li className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>Điều chuyển kho tổng & cửa hàng</span>
                </li>
                <li className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>Cảnh báo hết hàng tự động</span>
                </li>
              </ul>
            </div>

            {/* 3. Hộp thư chốt đơn */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-emerald-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">
                3. Hộp Thư Chốt Đơn Tập Trung
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Gom tin nhắn từ Facebook Fanpage, Messenger và TikTok Shop về một nơi. Nhân viên tra cứu tồn kho thực tế và tạo đơn gửi khách ngay trong khung chat.
              </p>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 font-medium">
                <li className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>Quản lý nhiều Fanpage trên 1 màn hình</span>
                </li>
                <li className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>Tạo đơn và đẩy giao vận 1-click</span>
                </li>
                <li className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>Chia hội thoại tự động cho ca trực</span>
                </li>
              </ul>
            </div>

            {/* 4. Báo cáo & Lợi nhuận thực nhận */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-emerald-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">
                4. Doanh Thu & Lợi Nhuận Thực
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Theo dõi dòng tiền thực nhận sau khi tự động trừ phí sàn Shopee/TikTok và cước vận chuyển. Phân tích lợi nhuận gộp theo từng kênh và từng cửa hàng.
              </p>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 font-medium">
                <li className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>Tự động đối soát chiết khấu sàn</span>
                </li>
                <li className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>Báo cáo doanh thu đa kênh tức thời</span>
                </li>
                <li className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>Xếp hạng mặt hàng bán chạy nhất</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: DÀNH CHO AI (DOANH NGHIỆP & CÁ NHÂN)
      ========================================================================= */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2 block">
              Khách Hàng Mục Tiêu
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              NEXORA Phù Hợp Với Ai?
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Giải pháp được may đo linh hoạt để vừa vặn hoàn hảo với cả cá nhân bán online lẫn chuỗi cửa hàng bán lẻ quy mô lớn.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 1. Chủ Shop Online */}
            <div className="p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center font-bold text-lg mb-5">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Chủ Shop & Người Bán Online
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Dành cho các chủ shop kinh doanh trên Shopee, TikTok Shop, Facebook cần tự động gom đơn và đồng bộ kho hàng mà không tốn công kiểm đếm thủ công.
              </p>
              <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Tiết kiệm 3-4 giờ kiểm kho và đối soát mỗi ngày</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Chấm dứt nguy cơ bị sàn phạt vì hết hàng hủy đơn</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Kiểm soát dòng tiền thực nhận sau phí sàn minh bạch</span>
                </div>
              </div>
            </div>

            {/* 2. Cửa hàng bán lẻ */}
            <div className="p-7 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500 shadow-xl relative hover:-translate-y-1 transition-all duration-300">
              <span className="absolute -top-3 right-6 text-[10px] uppercase font-extrabold px-3 py-1 rounded-full bg-emerald-600 text-white shadow-sm">
                Được Lựa Chọn Nhiều Nhất
              </span>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center font-bold text-lg mb-5">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Cửa Hàng Bán Lẻ & Điểm Bán
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Dành cho các cửa hàng đồ gia dụng, thiết bị, thời trang cần chuyên nghiệp hóa quầy thu ngân, in bill K80 và mở rộng thêm kênh bán online.
              </p>
              <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Quét mã vạch và in hóa đơn nhiệt siêu tốc tại quầy</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Thanh toán quét mã VietQR tự động không lo sai số tiền</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Quản lý nhân viên bán hàng và phân quyền ca kíp</span>
                </div>
              </div>
            </div>

            {/* 3. Chuỗi cửa hàng & Doanh nghiệp */}
            <div className="p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center font-bold text-lg mb-5">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Chuỗi Cửa Hàng & Doanh Nghiệp
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Dành cho các đơn vị vận hành từ 2 chi nhánh cửa hàng trở lên, có kho tổng và bán buôn/bán lẻ song song trên nhiều kênh số.
              </p>
              <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Quản trị ma trận tồn kho đa điểm và điều chuyển kho</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Cô lập dữ liệu bảo mật chuẩn doanh nghiệp Multi-Tenant</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Báo cáo so sánh tăng trưởng doanh thu giữa các chi nhánh</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: CÂU HỎI NHANH THƯỜNG GẶP (QUICK FAQ)
      ========================================================================= */}
      <section className="py-20 bg-emerald-50/30 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2 block">
              Giải Đáp Nhanh
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Những Câu Hỏi Nhanh Thường Gặp
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Mọi băn khoăn phổ biến của các chủ shop và doanh nghiệp trước khi đưa NEXORA vào vận hành.
            </p>
          </div>

          <div className="space-y-3.5">
            {faqList.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{item.q}</span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-emerald-600' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-200">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          BOTTOM CTA BANNER
      ========================================================================= */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Sẵn Sàng Nâng Tầm Quản Trị Bán Lẻ Của Bạn?
          </h2>
          <p className="text-sm text-emerald-100 max-w-xl mx-auto leading-relaxed">
            Đăng nhập ngay để trực tiếp trải nghiệm quầy thu ngân POS, quản lý kho hàng và cơ chế đồng bộ đa sàn tự động.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/dang-nhap"
              className="px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm bg-white text-emerald-800 hover:bg-emerald-50 active:scale-95 shadow-lg shadow-black/10 transition-all duration-200 flex items-center gap-2"
            >
              <span>Đăng nhập hệ thống</span>
              <ArrowRight className="w-4 h-4 text-emerald-700" />
            </Link>
            <Link
              href="/dang-ky"
              className="px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm bg-emerald-800/70 hover:bg-emerald-800 text-white border border-emerald-400/40 active:scale-95 transition-all duration-200"
            >
              Đăng ký dùng thử 14 ngày
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SITE FOOTER (Synchronized emerald & white commercial theme)
      ========================================================================= */}
      <SiteFooter />
    </div>
  );
}
