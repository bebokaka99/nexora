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
  Smartphone,
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
  Menu,
  X,
} from 'lucide-react';
import { DarkModeToggle } from '@/components/dark-mode-toggle';

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      a: 'NEXORA sử dụng kiến trúc hàng đợi xử lý sự kiện thời gian thực (Redis & BullMQ). Khi phát sinh đơn hàng tại quầy POS hoặc trên sàn, số lượng tồn kho khả dụng của sản phẩm sẽ được tự động đồng bộ hai chiều đến tất cả các kênh chỉ trong dưới 1 giây.',
    },
    {
      q: 'Dữ liệu kinh doanh và khách hàng của tôi có được bảo mật an toàn không?',
      a: 'Tuyệt đối an toàn. Hệ thống ứng dụng kiến trúc SaaS Multi-Tenant với cơ chế cô lập dữ liệu theo từng Tenant ID và chính sách PostgreSQL Row-Level Security (RLS). Mật khẩu được băm bằng thuật toán bcrypt cấp cao, phiên làm việc được bảo vệ bằng JWT token xoay vòng.',
    },
    {
      q: 'Nếu cửa hàng bị mất kết nối Internet, máy POS có bán hàng được không?',
      a: 'Có. Giao diện thu ngân POS hỗ trợ cơ chế lưu tạm hóa đơn vào bộ nhớ cục bộ khi mạng gặp sự cố. Ngay khi có kết nối mạng trở lại, hệ thống sẽ tự động đồng bộ hóa đơn và trừ tồn kho lên máy chủ trung tâm.',
    },
    {
      q: 'Tôi cần chuẩn bị thiết bị phần cứng gì để bắt đầu sử dụng?',
      a: 'Bạn chỉ cần bất kỳ thiết bị nào có trình duyệt web như máy tính bảng, điện thoại di động, laptop hoặc PC. Hệ thống tương thích hoàn toàn với các loại máy in nhiệt K80 và máy quét mã vạch cổng USB hoặc Bluetooth thông dụng trên thị trường.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* =========================================================================
          HEADER
      ========================================================================= */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border-b border-emerald-100 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo — Clean logo only, no slogans */}
          <Link href="/" className="flex items-center group">
            <img
              src="/logo.png"
              alt="NEXORA"
              className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a href="#about" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Giới thiệu
            </a>
            <a href="#solutions" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Chúng tôi làm gì
            </a>
            <a href="#audience" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Dành cho ai
            </a>
            <a href="#channels" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Kênh kết nối
            </a>
            <a href="#faq" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Hỏi đáp nhanh
            </a>
          </nav>

          {/* Header Actions: DarkMode Toggle & Single Compact Login Button */}
          <div className="flex items-center gap-2.5">
            <DarkModeToggle />

            {/* Single Prominent Login Button replacing old multi-buttons to optimize header space */}
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-sm shadow-emerald-600/25 transition-all hover:scale-[1.02]"
            >
              <span>Đăng nhập</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pt-2 pb-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-300 animate-in slide-in-from-top-2">
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 rounded-lg hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-600"
            >
              Giới thiệu
            </a>
            <a
              href="#solutions"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 rounded-lg hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-600"
            >
              Chúng tôi làm gì
            </a>
            <a
              href="#audience"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 rounded-lg hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-600"
            >
              Dành cho ai
            </a>
            <a
              href="#channels"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 rounded-lg hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-600"
            >
              Kênh kết nối
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 rounded-lg hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-600"
            >
              Hỏi đáp nhanh
            </a>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2 px-3 rounded-lg text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800"
              >
                Đăng ký dùng thử 14 ngày
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          HERO SECTION: CHÚNG TÔI LÀ AI & CHÚNG TÔI LÀM GÌ
      ========================================================================= */}
      <section id="about" className="relative pt-16 pb-20 overflow-hidden bg-gradient-to-b from-emerald-50/50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-b border-emerald-100/60 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            {/* Emerald Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Nền Tảng Quản Trị Bán Lẻ Hợp Nhất Đa Kênh</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.2]">
              Làm chủ mọi kênh bán lẻ. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600">
                Chính xác từng sản phẩm, tức thời từng đơn hàng.
              </span>
            </h1>

            {/* Clear introduction answering: Who we are & What we do */}
            <div className="mt-6 text-sm sm:text-base text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed text-left sm:text-center max-w-2xl mx-auto">
              <p>
                <strong>Chúng tôi là ai?</strong> NEXORA là nền tảng công nghệ quản trị kinh doanh bán lẻ hợp nhất (Omnichannel Commerce OS), được xây dựng chuyên biệt cho các chủ shop, chuỗi cửa hàng bán lẻ và doanh nghiệp thương mại hiện đại.
              </p>
              <p>
                <strong>Chúng tôi làm gì?</strong> Chúng tôi hợp nhất toàn bộ dòng chảy vận hành từ bán hàng thu ngân tại quầy (POS), kiểm soát kho hàng đa điểm, đến đồng bộ tồn kho hai chiều tự động với Shopee, TikTok Shop và mạng xã hội Facebook.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/login"
                className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-2 hover:scale-[1.02]"
              >
                <span>Bắt đầu ngay — Đăng nhập</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#solutions"
                className="px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shadow-sm transition-all"
              >
                Tìm hiểu các giải pháp
              </a>
            </div>
          </div>

          {/* =========================================================================
              VISUAL SHOWCASE MOCKUP (Bản xem trước giao diện hợp nhất chuẩn Xanh Lá & Trắng)
          ========================================================================= */}
          <div className="relative mx-auto max-w-5xl rounded-2xl p-2 bg-gradient-to-b from-emerald-100 via-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 shadow-2xl ring-1 ring-emerald-900/10 dark:ring-slate-700">
            <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 text-slate-100 shadow-inner">
              {/* Window Header */}
              <div className="h-10 px-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-3 font-mono text-[11px] text-slate-300">
                    nexora.vn/workspace — Doanh Nghiệp: Gia Dụng Hiện Đại
                  </span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Đồng bộ thời gian thực
                  </span>
                  <span className="font-mono text-[11px] hidden sm:inline">2 Chi Nhánh • 3 Kênh Sàn</span>
                </div>
              </div>

              {/* Window Body Mockup */}
              <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-900">
                {/* Metric 1 */}
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Doanh Thu Hôm Nay</span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-white mt-2">48.250.000 ₫</div>
                  <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                    <span>+18.4%</span>
                    <span className="text-slate-400">tăng trưởng</span>
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Đơn Hàng Đa Kênh</span>
                    <ShoppingBag className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-white mt-2">126 Đơn</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Shopee: <span className="text-emerald-400 font-bold">64</span> • TikTok: <span className="text-sky-400 font-bold">42</span> • POS: <span className="text-purple-400 font-bold">20</span>
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Hội Thoại Chờ Chốt</span>
                    <MessageSquare className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="text-2xl font-bold text-white mt-2">18 Khách</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    10 FB Messenger • 8 TikTok Chat
                  </div>
                </div>

                {/* Metric 4 */}
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Cảnh Báo Tồn Kho</span>
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold text-amber-300 mt-2">3 Mã SKU</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Nồi chiên 5L (Kho Q.1 còn 2 cái)
                  </div>
                </div>

                {/* Realtime Stream Rows */}
                <div className="sm:col-span-2 lg:col-span-4 rounded-xl bg-slate-950/70 border border-slate-800 p-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                      Dòng Đơn Hàng Tự Động Hợp Nhất
                    </span>
                    <span className="text-[11px] text-emerald-400">
                      Tự động cập nhật 24/7
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50 border border-slate-700/40">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          SHOPEE
                        </span>
                        <span className="font-semibold text-slate-200">#ORD-SP-9821</span>
                        <span className="text-slate-400 hidden md:inline">Nồi cơm điện cao tần 1.8L (x1)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-200 font-semibold">1.890.000 ₫</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300">Đã Trừ Kho</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50 border border-slate-700/40">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          POS CỬA HÀNG 1
                        </span>
                        <span className="font-semibold text-slate-200">#POS-CN1-0422</span>
                        <span className="text-slate-400 hidden md:inline">Chảo chống dính Ceramic 28cm (x2)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-200 font-semibold">700.000 ₫</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300">Đã Thanh Toán</span>
                      </div>
                    </div>
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
      <section id="solutions" className="py-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2 block">
              Giải Pháp Toàn Diện
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Chúng Tôi Làm Gì Giúp Doanh Nghiệp Của Bạn?
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Loại bỏ các khâu ghi chép thủ công rời rạc bằng một hệ thống điều hành thông minh, tự động hóa từ quầy thu ngân đến các sàn thương mại điện tử.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: POS Thu Ngân */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-600 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">
                1. Bán Hàng Tại Quầy (POS)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Màn hình cảm ứng thu ngân siêu tốc. Quét mã vạch sản phẩm chỉ 0.2s, in hóa đơn nhiệt K80 và tự động tạo mã thanh toán VietQR động chính xác từng đồng.
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

            {/* Card 2: Quản Lý & Khóa Tồn Kho */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-600 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Boxes className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">
                2. Đồng Bộ Tồn Kho Đa Sàn
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Cơ chế khóa an toàn chống bán vượt tồn kho (Stock Concurrency Lock). Vừa bán 1 món tại quầy, tồn kho trên Shopee và TikTok Shop tự động giảm ngay lập tức.
              </p>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 font-medium">
                <li className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>Triệt tiêu lỗi hủy đơn do hết hàng</span>
                </li>
                <li className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>Điều chuyển giữa kho tổng & cửa hàng</span>
                </li>
                <li className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>Cảnh báo tồn kho tối thiểu</span>
                </li>
              </ul>
            </div>

            {/* Card 3: Unified Inbox Chốt Đơn */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-600 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">
                3. Hộp Thư Hội Thoại Tập Trung
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Gom toàn bộ tin nhắn từ Facebook Fanpage, Messenger và TikTok Shop về một giao diện làm việc duy nhất. Nhân viên tra cứu kho và chốt đơn ngay trong khung chat.
              </p>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 font-medium">
                <li className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>Một màn hình quản lý nhiều Fanpage</span>
                </li>
                <li className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>Chốt đơn và đẩy giao vận 1-click</span>
                </li>
                <li className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>Phân bổ hội thoại tự động cho ca trực</span>
                </li>
              </ul>
            </div>

            {/* Card 4: Báo Cáo & Đối Soát */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-600 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">
                4. Báo Cáo Tài Chính & Dòng Tiền
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Theo dõi chính xác doanh thu thực nhận sau khi khấu trừ chiết khấu sàn, phí vận chuyển và chi phí đóng gói. Đánh giá lợi nhuận gộp theo từng kênh và từng chi nhánh.
              </p>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 font-medium">
                <li className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>Đối soát phí sàn Shopee & TikTok</span>
                </li>
                <li className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>Báo cáo doanh thu đa kênh tức thì</span>
                </li>
                <li className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>Xếp hạng sản phẩm bán chạy nhất</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: NEXORA DÀNH CHO AI (DOANH NGHIỆP & CÁ NHÂN)
      ========================================================================= */}
      <section id="audience" className="py-20 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2 block">
              Đối Tượng Sử Dụng
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              NEXORA Phù Hợp Với Mô Hình Nào?
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Dù bạn là cá nhân bán hàng online hay chuỗi bán lẻ nhiều chi nhánh, NEXORA luôn có cấu hình phù hợp với quy mô của bạn.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Audience 1: Cá nhân kinh doanh Online */}
            <div className="p-7 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center font-bold text-lg mb-5">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Chủ Shop & Cá Nhân Bán Online
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Dành cho các nhà bán hàng trên Shopee, TikTok Shop và Facebook cá nhân/Fanpage cần một công cụ gom đơn và kiểm kho tự động.
              </p>
              <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Tiết kiệm 3-4 giờ kiểm kho và đối soát mỗi ngày</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Không còn nỗi lo bị sàn phạt vì hết hàng hủy đơn</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Quản lý dòng tiền và lợi nhuận thực nhận minh bạch</span>
                </div>
              </div>
            </div>

            {/* Audience 2: Cửa hàng bán lẻ truyền thống */}
            <div className="p-7 rounded-2xl bg-white dark:bg-slate-800 border-2 border-emerald-500 shadow-lg relative">
              <span className="absolute -top-3 right-6 text-[10px] uppercase font-extrabold px-3 py-1 rounded-full bg-emerald-600 text-white shadow-sm">
                Phổ biến nhất
              </span>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center font-bold text-lg mb-5">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Cửa Hàng Bán Lẻ & Điểm Bán
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Dành cho các cửa hàng thiết bị, đồ gia dụng, thời trang muốn chuyên nghiệp hóa quầy thu ngân và mở rộng kênh bán hàng trực tuyến.
              </p>
              <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Màn hình POS quét mã vạch và in bill K80 tốc độ cao</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Thanh toán quét mã VietQR tự động không lo sai số tiền</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Quản lý ca kíp, phân quyền nhân viên bán hàng chặt chẽ</span>
                </div>
              </div>
            </div>

            {/* Audience 3: Chuỗi cửa hàng & Doanh nghiệp */}
            <div className="p-7 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center font-bold text-lg mb-5">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Chuỗi Cửa Hàng & Doanh Nghiệp
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Dành cho các đơn vị vận hành từ 2 chi nhánh cửa hàng trở lên, có kho tổng và bán buôn/bán lẻ trên nhiều nền tảng số cùng lúc.
              </p>
              <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Quản trị tập trung ma trận tồn kho đa điểm và chuyển kho</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Kiến trúc Multi-Tenant bảo mật và cô lập dữ liệu độc lập</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Báo cáo hiệu suất kinh doanh so sánh giữa các chi nhánh</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: HỆ SINH THÁI KẾT NỐI
      ========================================================================= */}
      <section id="channels" className="py-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">
              Hệ Sinh Thái Mở
            </h2>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Tích Hợp Sẵn Sàng Với Mọi Nền Tảng Phổ Biến
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="text-orange-500 font-extrabold text-base mb-1">Shopee</div>
              <p className="text-[11px] text-slate-500">Đồng bộ Đơn & Tồn</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="text-slate-900 dark:text-white font-extrabold text-base mb-1">TikTok Shop</div>
              <p className="text-[11px] text-slate-500">Đồng bộ Đơn & Tồn</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="text-blue-600 font-extrabold text-base mb-1">Facebook</div>
              <p className="text-[11px] text-slate-500">Messenger & Chốt Đơn</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="text-purple-600 font-extrabold text-base mb-1">POS Quầy</div>
              <p className="text-[11px] text-slate-500">Mã Vạch & Hóa Đơn</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="text-emerald-600 font-extrabold text-base mb-1">VietQR</div>
              <p className="text-[11px] text-slate-500">Mã Chuyển Khoản Tự Động</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="text-rose-600 font-extrabold text-base mb-1">Giao Vận</div>
              <p className="text-[11px] text-slate-500">GHN, GHTK, Viettel Post</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: CÂU HỎI NHANH THƯỜNG GẶP (QUICK FAQ)
      ========================================================================= */}
      <section id="faq" className="py-20 bg-emerald-50/30 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2 block">
              Giải Đáp Thắc Mắc
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Những Câu Hỏi Nhanh Thường Gặp
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Mọi điều bạn cần biết trước khi bắt đầu sử dụng nền tảng NEXORA.
            </p>
          </div>

          <div className="space-y-3.5">
            {faqList.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm transition-all"
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

          <div className="mt-10 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Còn câu hỏi khác chưa được giải đáp?{' '}
              <a href="#about" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                Liên hệ đội ngũ hỗ trợ kỹ thuật
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          BOTTOM CTA BANNER
      ========================================================================= */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Sẵn Sàng Làm Chủ Toàn Bộ Kênh Bán Hàng Ngay Hôm Nay?
          </h2>
          <p className="mt-3 text-sm text-emerald-100 max-w-xl mx-auto leading-relaxed">
            Đăng nhập vào hệ thống để trải nghiệm ngay giải pháp quản trị bán lẻ đồng bộ tức thời dành cho cửa hàng của bạn.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login"
              className="px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm bg-white text-emerald-800 hover:bg-emerald-50 active:bg-emerald-100 shadow-lg shadow-black/10 transition-all flex items-center gap-2 hover:scale-[1.02]"
            >
              <span>Đăng nhập vào Workspace</span>
              <ArrowRight className="w-4 h-4 text-emerald-700" />
            </Link>
            <Link
              href="/register"
              className="px-6 py-3.5 rounded-xl font-semibold text-xs sm:text-sm bg-emerald-800/60 hover:bg-emerald-800/80 text-white border border-emerald-400/40 transition-all"
            >
              Đăng ký dùng thử 14 ngày
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FOOTER (TÔNG XANH LÁ & TRẮNG ĐỒNG NHẤT)
      ========================================================================= */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Column 1: Brand Logo only */}
            <div className="md:col-span-2">
              <Link href="/" className="inline-block mb-4">
                <img
                  src="/logo.png"
                  alt="NEXORA"
                  className="h-9 w-auto object-contain brightness-110"
                />
              </Link>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                Nền tảng quản trị hoạt động kinh doanh đa kênh hợp nhất dành cho doanh nghiệp bán buôn, bán lẻ và các nhà bán hàng hiện đại.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Hệ thống hoạt động ổn định 99.9% SLA</span>
              </div>
            </div>

            {/* Column 2: Liên kết nhanh */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3.5">
                Khám Phá
              </h4>
              <ul className="text-xs space-y-2.5">
                <li>
                  <a href="#about" className="hover:text-emerald-400 transition-colors">
                    Về NEXORA
                  </a>
                </li>
                <li>
                  <a href="#solutions" className="hover:text-emerald-400 transition-colors">
                    Giải pháp POS & Đa kênh
                  </a>
                </li>
                <li>
                  <a href="#audience" className="hover:text-emerald-400 transition-colors">
                    Đối tượng phù hợp
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-emerald-400 transition-colors">
                    Câu hỏi thường gặp
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Tài khoản & Hệ thống */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3.5">
                Bắt Đầu
              </h4>
              <ul className="text-xs space-y-2.5">
                <li>
                  <Link href="/login" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 font-medium">
                    <span>Đăng nhập hệ thống</span>
                    <ArrowRight className="w-3 h-3 text-emerald-500" />
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-emerald-400 transition-colors">
                    Đăng ký doanh nghiệp mới
                  </Link>
                </li>
                <li>
                  <span className="text-slate-500">Chính sách bảo mật dữ liệu</span>
                </li>
                <li>
                  <span className="text-slate-500">Điều khoản dịch vụ SaaS</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
            <p>© 2026 NEXORA. Bản quyền thuộc về nền tảng điều hành bán lẻ hợp nhất.</p>
            <p className="mt-2 sm:mt-0 font-mono text-[11px] text-slate-400">
              Công nghệ: Next.js 15 • NestJS • PostgreSQL RLS • Redis BullMQ
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
