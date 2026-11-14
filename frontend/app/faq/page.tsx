'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Phone,
  Mail,
} from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
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
    {
      q: 'Hệ thống có giới hạn số lượng sản phẩm hay số lượng đơn hàng không?',
      a: 'Không. Các gói dịch vụ của NEXORA được thiết kế để mở rộng linh hoạt theo quy mô kinh doanh của bạn, đáp ứng hàng chục nghìn mã sản phẩm (SKU) và xử lý hàng nghìn đơn hàng mỗi ngày trong các dịp siêu sale của sàn TMĐT.',
    },
    {
      q: 'Tôi có thể điều chuyển hàng hóa giữa các kho chi nhánh không?',
      a: 'Hoàn toàn được. Hệ thống hỗ trợ lập phiếu điều chuyển kho nội bộ giữa kho tổng và các kho cửa hàng (hoặc giữa 2 cửa hàng với nhau). Tồn kho sẽ được ghi nhận trạng thái Đang chuyển (In Transit) và chỉ tăng ở kho nhận khi người quản lý xác nhận nhập kho.',
    },
    {
      q: 'Nhân viên thu ngân có xem được báo cáo doanh thu tổng của toàn bộ công ty không?',
      a: 'Không. Hệ thống có cơ chế phân quyền vai trò (RBAC) chặt chẽ. Nhân viên thu ngân chỉ có quyền thực hiện bán hàng và xem doanh thu ca trực của mình; chỉ có tài khoản Quản trị viên (Admin) hoặc Chủ doanh nghiệp mới có quyền truy cập toàn bộ báo cáo tài chính và lợi nhuận.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans transition-colors duration-200">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 sm:py-20 bg-gradient-to-b from-emerald-50/50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-b border-emerald-100/60 dark:border-slate-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-xs font-bold shadow-sm">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Trung Tâm Hỗ Trợ & Giải Đáp</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.2]">
              Những Câu Hỏi Thường Gặp <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600">
                Về Nền Tảng NEXORA
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Giải đáp chi tiết mọi câu hỏi về tính năng, thiết bị phần cứng, chi phí và cơ chế bảo mật trước khi vận hành.
            </p>
          </div>
        </section>

        {/* FAQ Accordion List */}
        <section className="py-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 overflow-hidden shadow-sm transition-all duration-200 hover:border-emerald-300 dark:hover:border-emerald-700"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full py-4 sm:py-5 px-6 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <HelpCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{faq.q}</span>
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200/60 dark:border-slate-700/60 animate-in fade-in duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-14 bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-center">
          <div className="max-w-4xl mx-auto px-4 space-y-4">
            <h2 className="text-2xl font-extrabold">Bạn Đã Sẵn Sàng Bắt Đầu?</h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl mx-auto">
              Đăng nhập để vào hệ thống điều hành hoặc đăng ký dùng thử 14 ngày miễn phí ngay hôm nay.
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
