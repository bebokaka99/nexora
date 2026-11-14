'use client';

import React from 'react';
import Link from 'next/link';
import {
  Globe2,
  CheckCircle2,
  ArrowRight,
  Zap,
  ShoppingBag,
  MessageSquare,
  Store,
  QrCode,
  Truck,
} from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export default function ChannelsPage() {
  const channels = [
    {
      name: 'Shopee Open Platform',
      tag: 'Sàn Thương Mại Điện Tử',
      color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800',
      desc: 'Đồng bộ hai chiều tự động sản phẩm, đơn hàng và số lượng tồn kho khả dụng ngay khi có biến động.',
      items: [
        'Kéo đơn hàng mới về hệ thống tức thời.',
        'Tự động trừ kho tại chi nhánh tương ứng.',
        'Cập nhật trạng thái giao vận theo thời gian thực.',
      ],
    },
    {
      name: 'TikTok Shop Open API',
      tag: 'Social Commerce & Video Shop',
      color: 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700',
      desc: 'Kết nối trực tiếp gian hàng TikTok Shop, tự động kéo đơn phát sinh từ livestream và video sản phẩm.',
      items: [
        'Đồng bộ đơn hàng từ livestream 24/7.',
        'Khóa tồn kho chống bán vượt số lượng.',
        'In phiếu giao hàng và đẩy vận chuyển 1-click.',
      ],
    },
    {
      name: 'Meta (Facebook & Messenger)',
      tag: 'Mạng Xã Hội & Hội Thoại',
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
      desc: 'Hộp thư hội thoại tập trung gom toàn bộ tin nhắn Fanpage và Messenger, hỗ trợ chốt đơn ngay trong chat.',
      items: [
        'Tra cứu tồn kho thực tế gửi khách ngay lập tức.',
        'Tạo đơn hàng trực tiếp trong khung trò chuyện.',
        'Tự động phân chia tin nhắn cho nhân viên ca trực.',
      ],
    },
    {
      name: 'Quầy Thu Ngân Bán Lẻ (POS)',
      tag: 'Chi Nhánh Cửa Hàng Vật Lý',
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800',
      desc: 'Quầy bán lẻ tại các cửa hàng, hỗ trợ máy quét mã vạch và máy in nhiệt hóa đơn K80.',
      items: [
        'Quét mã vạch bán hàng 0.2s siêu tốc.',
        'In hóa đơn nhiệt và tự động trừ kho chi nhánh.',
        'Hỗ trợ chế độ bán hàng ngoại tuyến (offline).',
      ],
    },
    {
      name: 'Cổng Thanh Toán VietQR',
      tag: 'Thanh Toán Không Tiền Mặt',
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
      desc: 'Tự động tạo mã QR chuyển khoản ngân hàng chính xác số tiền cho từng hóa đơn bán hàng.',
      items: [
        'Khách quét mã chuyển khoản không cần nhập số tiền.',
        'Tự động kiểm tra và khớp lệnh trong 1 giây.',
        'Không mất phí trung gian cổng thanh toán.',
      ],
    },
    {
      name: 'Đối Tác Giao Hàng & Vận Chuyển',
      tag: 'GHN, GHTK, Viettel Post',
      color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
      desc: 'Kết nối các hãng vận chuyển hàng đầu tại Việt Nam để tự động tạo mã vận đơn và theo dõi trạng thái giao hàng.',
      items: [
        'Tự động tạo vận đơn ngay khi đơn được duyệt.',
        'Theo dõi hành trình bưu tá giao hàng.',
        'Đối soát tiền thu hộ (COD) minh bạch.',
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
              <Globe2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Hệ Sinh Thái Kênh Bán</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.2]">
              Kết Nối Thông Suốt Với <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600">
                Mọi Kênh Bán Hàng & Thanh Toán
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Tích hợp sẵn sàng các nền tảng thương mại điện tử, mạng xã hội và đơn vị vận chuyển hàng đầu giúp bạn bán hàng ở mọi nơi.
            </p>
          </div>
        </section>

        {/* Channels Grid */}
        <section className="py-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {channels.map((ch, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${ch.color}`}>
                      {ch.tag}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {ch.name}
                  </h2>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {ch.desc}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    {ch.items.map((it, iIdx) => (
                      <div key={iIdx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{it}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Tự động 24/7</span>
                  <Link href="/dang-nhap" className="font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 flex items-center gap-1">
                    <span>Kết nối ngay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-14 bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-center">
          <div className="max-w-4xl mx-auto px-4 space-y-4">
            <h2 className="text-2xl font-extrabold">Đồng Bộ Kênh Bán Của Bạn Ngay Hôm Nay</h2>
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
