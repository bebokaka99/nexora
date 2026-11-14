import React from "react";
import Link from "next/link";
import {
  Layers,
  Store,
  Warehouse,
  ShoppingBag,
  MessageSquare,
  BarChart3,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Boxes,
  Cpu,
  Globe2,
  Database,
  ExternalLink,
  Smartphone,
  ChevronRight,
  TrendingUp,
  PackageCheck,
  AlertTriangle,
  Building2,
  Users
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* =========================================================================
          HEADER
      ========================================================================= */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/85 border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 ring-1 ring-blue-600/30">
              <Layers className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  NEXORA
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  Commerce OS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                One Platform. Every Channel. Complete Control.
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a href="#overview" className="hover:text-blue-600 transition-colors">
              Tổng quan
            </a>
            <a href="#architecture" className="hover:text-blue-600 transition-colors">
              Kiến trúc
            </a>
            <a href="#features" className="hover:text-blue-600 transition-colors">
              Tính năng
            </a>
            <a href="#channels" className="hover:text-blue-600 transition-colors">
              Kênh tích hợp
            </a>
            <a href="#roadmap" className="hover:text-blue-600 transition-colors">
              Lộ trình
            </a>
          </nav>

          {/* CTA Actions */}
          <div className="flex items-center gap-3">
            <a
              href="#overview"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all border border-slate-300"
            >
              <span>Tài liệu /docs</span>
            </a>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/30 transition-all hover:scale-[1.02]"
            >
              <span>Vào Demo Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* =========================================================================
          HERO SECTION
      ========================================================================= */}
      <section id="overview" className="relative pt-16 pb-20 overflow-hidden bg-gradient-to-b from-blue-50/60 via-slate-50 to-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-semibold mb-6 shadow-sm">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span>Giai Đoạn Khởi Tạo Nền Tảng (Phase 01 — Foundation)</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              One Platform. Every Channel. <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600">
                Complete Control.
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed">
              NEXORA là nền tảng quản trị hoạt động kinh doanh đa kênh (Omnichannel Commerce) theo mô hình <strong>SaaS Multi-Tenant</strong>. Hợp nhất hoạt động bán buôn, bán lẻ từ <strong>2 cửa hàng vật lý</strong> và toàn bộ các kênh trực tuyến <strong>Shopee, TikTok Shop, Facebook/Messenger</strong> trong một hệ thống điều hành duy nhất.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="px-6 py-3.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 group"
              >
                <span>Vào Trải Nghiệm Demo Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#architecture"
                className="px-6 py-3.5 rounded-xl font-semibold text-sm bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm transition-all"
              >
                Kiến trúc Modular Monolith
              </a>
            </div>
          </div>

          {/* =========================================================================
              VISUAL PREVIEW MOCKUP CARD (Bản xem trước giao diện hợp nhất)
          ========================================================================= */}
          <div id="demo-preview" className="relative mx-auto max-w-5xl rounded-2xl p-2 bg-gradient-to-b from-slate-200 to-slate-300 shadow-2xl ring-1 ring-slate-900/10">
            <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 text-slate-100 shadow-inner">
              {/* Window Header */}
              <div className="h-10 px-4 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-3 font-mono text-[11px] text-slate-400">
                    nexora-app.internal/dashboard — Tenant: Gia Dụng Hiện Đại
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Live Syncing
                  </span>
                  <span className="font-mono text-[11px]">2 Chi Nhánh / 3 Kênh Online</span>
                </div>
              </div>

              {/* Window Body Mockup */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6 bg-slate-900">
                {/* Metric 1 */}
                <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/60">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Tổng Doanh Thu Hôm Nay</span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-white mt-2">48.250.000 ₫</div>
                  <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                    <span>+18.4%</span>
                    <span className="text-slate-400">so với hôm qua</span>
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/60">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Đơn Hàng Đa Kênh</span>
                    <ShoppingBag className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-white mt-2">126 Đơn</div>
                  <div className="text-xs text-slate-400 mt-1">
                    Shopee: <span className="text-amber-400 font-semibold">64</span> | TikTok: <span className="text-sky-400 font-semibold">42</span> | POS: <span className="text-purple-400 font-semibold">20</span>
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/60">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Hộp Thư Đang Chờ</span>
                    <MessageSquare className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="text-2xl font-bold text-white mt-2">18 Khách</div>
                  <div className="text-xs text-sky-300 mt-1">
                    9 FB Messenger • 9 TikTok Chat
                  </div>
                </div>

                {/* Metric 4 */}
                <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/60">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Cảnh Báo Tồn Kho</span>
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold text-amber-300 mt-2">3 Mã SKU</div>
                  <div className="text-xs text-slate-400 mt-1">
                    Nồi chiên 5L (Kho Cửa Hàng 1 còn 2 cái)
                  </div>
                </div>

                {/* Inner Preview Table */}
                <div className="md:col-span-4 rounded-xl bg-slate-950/60 border border-slate-800 p-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Dòng Đơn Hàng Thời Gian Thực (Omnichannel Feed)
                    </span>
                    <span className="text-[11px] text-blue-400 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Tự động làm mới qua Socket.IO
                    </span>
                  </div>

                  <div className="mt-3 space-y-2.5 font-mono text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/30">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          SHOPEE
                        </span>
                        <span className="font-semibold text-slate-200">#ORD-SP-9821</span>
                        <span className="text-slate-400 hidden sm:inline">Nồi cơm điện cao tần 1.8L (x1)</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-slate-300 font-semibold">1.890.000 ₫</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300">Chờ Đóng Gói</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/30">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          POS CHI NHÁNH 1
                        </span>
                        <span className="font-semibold text-slate-200">#POS-CN1-0422</span>
                        <span className="text-slate-400 hidden sm:inline">Chảo chống dính Ceramic 28cm (x2)</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-slate-300 font-semibold">700.000 ₫</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300">Đã Hoàn Tất</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/30">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30">
                          TIKTOK SHOP
                        </span>
                        <span className="font-semibold text-slate-200">#ORD-TT-5510</span>
                        <span className="text-slate-400 hidden sm:inline">Ấm siêu tốc giữ nhiệt 1.7L (x1)</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-slate-300 font-semibold">450.000 ₫</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300">Chờ Đóng Gói</span>
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
          SECTION 1: BỐI CẢNH & ĐỊNH HƯỚNG NGHIỆP VỤ
      ========================================================================= */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-4">
                <Store className="w-3.5 h-3.5 text-blue-600" />
                <span>Bối Cảnh Khách Hàng Ban Đầu</span>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Giải Quyết Bài Toán Vận Hành Chuỗi 2 Cửa Hàng & 3 Kênh Sàn Trực Tuyến
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Doanh nghiệp kinh doanh trong ngành <strong>Thiết Bị & Đồ Gia Dụng</strong>, đang vận hành 2 cửa hàng vật lý và các gian hàng trên Facebook, TikTok Shop, Shopee. Việc thuê phần mềm đóng gói bên ngoài gây tốn kém, phụ thuộc và thường xuyên xảy ra tình trạng lệch tồn kho.
              </p>

              <div className="mt-6 space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm text-slate-700">
                    <strong>Tự chủ nền tảng:</strong> Chấm dứt phụ thuộc nhà cung cấp phần mềm bên ngoài; sẵn sàng thương mại hóa bán gói SaaS cho các đơn vị bán lẻ khác.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm text-slate-700">
                    <strong>Đồng bộ thời gian thực:</strong> Trừ tồn kho tự động khi phát sinh đơn trên sàn hoặc bán tại quầy, triệt tiêu nguy cơ bán vượt tồn (overselling).
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm text-slate-700">
                    <strong>Hộp thư chốt đơn (Social Commerce):</strong> Gom tin nhắn/bình luận Facebook và TikTok vào một màn hình, hỗ trợ nhân viên chốt đơn chỉ trong vài cú nhấp chuột.
                  </span>
                </div>
              </div>
            </div>

            {/* Architecture Hierarchy Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl border border-slate-700">
              <h3 className="text-sm font-semibold tracking-wider uppercase text-blue-400 mb-6 flex items-center gap-2">
                <Boxes className="w-4 h-4" />
                Mô Hình Phân Cấp Vận Hành NEXORA
              </h3>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/70">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-2">
                      <Globe2 className="w-4 h-4 text-blue-400" />
                      1. PLATFORM LEVEL
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                      NEXORA Master
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Đơn vị chủ quản phần mềm quản lý gói cước, hạ tầng, giám sát toàn bộ hệ sinh thái Tenants.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/70 ml-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-300 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-400" />
                      2. TENANT LEVEL
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      Doanh Nghiệp Thuê Bao
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Khách hàng đăng ký (ví dụ: Chuỗi Gia Dụng). Dữ liệu được phân tách và cô lập tuyệt đối.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 ml-8">
                  <div className="p-3.5 rounded-lg bg-slate-800/60 border border-slate-700">
                    <span className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5" />
                      3. STORE (Cửa hàng)
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Chi nhánh 1, Chi nhánh 2 (Quầy POS, Máy in)
                    </p>
                  </div>
                  <div className="p-3.5 rounded-lg bg-slate-800/60 border border-slate-700">
                    <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                      <Warehouse className="w-3.5 h-3.5" />
                      4. WAREHOUSE (Kho)
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Kho Tổng, Kho gắn cửa hàng, phiếu điều chuyển
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: BỐN TRỤ CỘT TÍNH NĂNG CHỦ CHỐT
      ========================================================================= */}
      <section id="features" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
              Năng Lực Sản Phẩm
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Bốn Trụ Cột Năng Lực Toàn Diện Của NEXORA
            </h3>
            <p className="mt-3 text-sm text-slate-600">
              Được thiết kế chuẩn hóa để vận hành trơn tru từ khâu nhập hàng, quản lý kho bãi, chốt đơn đến đối soát dòng tiền.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar A */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-5">
                <Building2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-2">
                A. SaaS Management
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Quản lý doanh nghiệp đa người dùng, gói thuê bao (Plans), thanh toán định kỳ, phân quyền vai trò (RBAC) và cô lập dữ liệu chuẩn bảo mật.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5 font-medium">
                <li>• Quản lý Tenant & Vòng đời</li>
                <li>• Cấu hình Subscription Plans</li>
                <li>• Quản lý người dùng & phân quyền</li>
              </ul>
            </div>

            {/* Pillar B */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-2">
                B. Commerce Core & POS
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Quản lý danh mục sản phẩm đồ gia dụng đa biến thể, quản lý tồn kho đa điểm, bán hàng siêu tốc tại quầy với máy quét mã vạch và in hóa đơn.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5 font-medium">
                <li>• POS bán hàng quầy & VietQR</li>
                <li>• Tồn kho đa kho & chuyển kho</li>
                <li>• Quản lý SKU & Barcode</li>
              </ul>
            </div>

            {/* Pillar C */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-5">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-2">
                C. Omnichannel & Chat
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Đồng bộ hai chiều đơn hàng, sản phẩm và tồn kho từ Shopee, TikTok Shop. Hộp thư tập trung (Unified Inbox) tiếp nhận chat và chốt đơn ngay tại chỗ.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5 font-medium">
                <li>• Kết nối Shopee, TikTok, Meta API</li>
                <li>• Đồng bộ tồn kho tự động</li>
                <li>• Hộp thư hội thoại & chốt đơn nhanh</li>
              </ul>
            </div>

            {/* Pillar D */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-5">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-2">
                D. Business Intelligence
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Dashboard thời gian thực đo lường doanh thu, đơn hàng, lợi nhuận thực tế sau phí sàn TMĐT, tốc độ luân chuyển kho và hiệu suất bán hàng của nhân viên.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5 font-medium">
                <li>• Báo cáo doanh thu đa kênh</li>
                <li>• Phân tích sản phẩm bán chạy</li>
                <li>• Đánh giá hiệu suất nhân viên</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: HỆ THỐNG KÊNH TÍCH HỢP
      ========================================================================= */}
      <section id="channels" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
              Hệ Sinh Thái Tích Hợp
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Kết Nối Thông Suốt Với Các Nền Tảng Hàng Đầu
            </h3>
            <p className="mt-3 text-sm text-slate-600">
              Kiến trúc Adapter Pattern tách biệt logic kết nối bên thứ ba, xử lý Webhook tốc độ cao qua hàng đợi BullMQ.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 transition-colors">
              <div className="text-orange-600 font-extrabold text-lg mb-1">Shopee</div>
              <p className="text-[11px] text-slate-500">Open Platform v2</p>
              <span className="mt-2 inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Đơn & Tồn</span>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 transition-colors">
              <div className="text-slate-900 font-extrabold text-lg mb-1">TikTok Shop</div>
              <p className="text-[11px] text-slate-500">Open API</p>
              <span className="mt-2 inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Đơn & Tồn</span>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 transition-colors">
              <div className="text-blue-600 font-extrabold text-lg mb-1">Meta</div>
              <p className="text-[11px] text-slate-500">Facebook Messenger</p>
              <span className="mt-2 inline-block text-[10px] font-semibold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">Chat & Đơn</span>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 transition-colors">
              <div className="text-purple-600 font-extrabold text-lg mb-1">POS Quầy</div>
              <p className="text-[11px] text-slate-500">In-Store Barcode</p>
              <span className="mt-2 inline-block text-[10px] font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">2 Chi Nhánh</span>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 transition-colors">
              <div className="text-rose-600 font-extrabold text-lg mb-1">Giao Vận</div>
              <p className="text-[11px] text-slate-500">GHN, GHTK, Viettel</p>
              <span className="mt-2 inline-block text-[10px] font-semibold text-slate-700 bg-slate-200 px-2 py-0.5 rounded">Đang thiết kế</span>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 transition-colors">
              <div className="text-emerald-600 font-extrabold text-lg mb-1">Thanh Toán</div>
              <p className="text-[11px] text-slate-500">VietQR, MoMo, VNPAY</p>
              <span className="mt-2 inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">QR Động</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: KIẾN TRÚC KỸ THUẬT & TECH STACK
      ========================================================================= */}
      <section id="architecture" className="py-20 bg-slate-900 text-slate-100 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">
              Technology Stack
            </h2>
            <h3 className="text-3xl font-extrabold tracking-tight text-white">
              Định Hướng Kiến Trúc Modular Monolith
            </h3>
            <p className="mt-3 text-sm text-slate-400">
              Sử dụng các công nghệ hiện đại, ổn định (LTS) nhằm tối ưu hiệu năng và chi phí vận hành.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Frontend Layer</h4>
                  <p className="text-xs text-slate-400">Giao diện người dùng</p>
                </div>
              </div>
              <ul className="text-xs text-slate-300 space-y-2">
                <li>• <strong>Next.js 15+ (App Router)</strong> & React 19</li>
                <li>• <strong>TypeScript 5.x</strong> kiểm soát kiểu chặt chẽ</li>
                <li>• <strong>Tailwind CSS</strong> & shadcn/ui components</li>
                <li>• <strong>TanStack Query v5</strong> quản lý server state</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Backend Services</h4>
                  <p className="text-xs text-slate-400">Lõi xử lý nghiệp vụ</p>
                </div>
              </div>
              <ul className="text-xs text-slate-300 space-y-2">
                <li>• <strong>NestJS v10+</strong> (Node.js 22 LTS)</li>
                <li>• <strong>Modular Monolith</strong> ranh giới domain rõ ràng</li>
                <li>• <strong>REST API & Swagger</strong> OpenAPI chuẩn</li>
                <li>• <strong>Socket.IO</strong> cập nhật hội thoại & đơn realtime</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Database & Queues</h4>
                  <p className="text-xs text-slate-400">Lưu trữ & hàng đợi</p>
                </div>
              </div>
              <ul className="text-xs text-slate-300 space-y-2">
                <li>• <strong>PostgreSQL 16</strong> Row-Level Security (RLS)</li>
                <li>• <strong>Prisma ORM</strong> type-safe database queries</li>
                <li>• <strong>Redis 7 & BullMQ</strong> xử lý webhook & sync sàn</li>
                <li>• <strong>Docker Compose</strong> môi trường chuẩn hóa</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: LỘ TRÌNH TRIỂN KHAI (ROADMAP)
      ========================================================================= */}
      <section id="roadmap" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
              Kế Hoạch & Tiến Độ
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Lộ Trình Phát Triển Qua 8 Phase
            </h3>
            <p className="mt-3 text-sm text-slate-600">
              Được phân rã thành các task rõ ràng, có tiêu chí nghiệm thu độc lập.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white border-2 border-blue-500 shadow-sm relative">
              <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                ĐANG LÀM
              </span>
              <div className="text-xs font-bold text-blue-600">Phase 01</div>
              <h4 className="font-bold text-slate-900 text-sm mt-1">Foundation & Demo UI</h4>
              <p className="text-xs text-slate-500 mt-2">
                Môi trường VS Code, File Tree, Tài liệu /docs và Bản Demo UI trực quan (TASK-001).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <div className="text-xs font-bold text-slate-400">Phase 02</div>
              <h4 className="font-bold text-slate-700 text-sm mt-1">Auth & RBAC</h4>
              <p className="text-xs text-slate-500 mt-2">
                Đăng nhập, làm mới token rotation, phân quyền vai trò cho 5 đối tượng người dùng.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <div className="text-xs font-bold text-slate-400">Phase 03</div>
              <h4 className="font-bold text-slate-700 text-sm mt-1">SaaS Core & Multi-Tenant</h4>
              <p className="text-xs text-slate-500 mt-2">
                Quản lý doanh nghiệp, cô lập dữ liệu theo tenant_id, quản lý 2 chi nhánh cửa hàng.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <div className="text-xs font-bold text-slate-400">Phase 04</div>
              <h4 className="font-bold text-slate-700 text-sm mt-1">Commerce Core & POS</h4>
              <p className="text-xs text-slate-500 mt-2">
                Quản lý sản phẩm gia dụng, tồn kho đa điểm, khóa tranh chấp và màn hình POS.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <div className="text-xs font-bold text-slate-400">Phase 05</div>
              <h4 className="font-bold text-slate-700 text-sm mt-1">Omnichannel Sync</h4>
              <p className="text-xs text-slate-500 mt-2">
                Kết nối Shopee, TikTok Shop, Meta; xử lý Webhook và hộp thư hội thoại tập trung.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <div className="text-xs font-bold text-slate-400">Phase 06</div>
              <h4 className="font-bold text-slate-700 text-sm mt-1">Business Intelligence</h4>
              <p className="text-xs text-slate-500 mt-2">
                Dashboard thời gian thực, báo cáo doanh thu thực sau phí sàn và hiệu suất nhân viên.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <div className="text-xs font-bold text-slate-400">Phase 07</div>
              <h4 className="font-bold text-slate-700 text-sm mt-1">Subscription & Billing</h4>
              <p className="text-xs text-slate-500 mt-2">
                Đóng gói gói cước, cổng thanh toán tự động VietQR/MoMo, quản trị vòng đời thuê bao.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <div className="text-xs font-bold text-slate-400">Phase 08</div>
              <h4 className="font-bold text-slate-700 text-sm mt-1">Production Readiness</h4>
              <p className="text-xs text-slate-500 mt-2">
                Kiểm thử tải, tối ưu bảo mật, giám sát SLA 99.9% và phát hành chính thức.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FOOTER
      ========================================================================= */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                  N
                </div>
                <span className="font-extrabold text-lg tracking-tight text-white">NEXORA</span>
              </div>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                Commerce Management Platform — Nền tảng quản lý hoạt động kinh doanh đa kênh hợp nhất dành cho các doanh nghiệp bán lẻ hiện đại.
              </p>
              <p className="text-[11px] text-slate-500 mt-3">
                Tagline: <em>"One Platform. Every Channel. Complete Control."</em>
              </p>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
                Kho Tài Liệu /docs
              </h5>
              <ul className="text-xs space-y-2">
                <li><span className="hover:text-white transition-colors cursor-pointer">• docs/product/PRODUCT.md</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">• docs/architecture/ARCHITECTURE.md</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">• docs/database/ENTITY_RELATIONSHIPS.md</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">• docs/tasks/TASK_TEMPLATE.md</span></li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
                Công Nghệ Sử Dụng
              </h5>
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">Next.js 15</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">React 19</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">TypeScript 5</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">Tailwind CSS</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">NestJS v10</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">PostgreSQL 16</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">Prisma</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">Redis & BullMQ</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
            <p>© {new Date().getFullYear()} NEXORA Platform. All rights reserved.</p>
            <p className="mt-2 sm:mt-0 font-mono text-[11px]">
              Branch: main • Environment: Local Development • Node: v22.14 LTS
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
