import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";

// Be Vietnam Pro (hỗ trợ tiếng Việt); nếu Google Fonts không tải được lúc
// build, Next sẽ lỗi — khi đó revert về font hệ thống trong globals.css.
const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-be-vietnam",
});

export const metadata: Metadata = {
  title: "NEXORA — Nền Tảng Quản Trị Bán Lẻ Đa Kênh Hợp Nhất",
  description: "NEXORA kết nối và tự động hóa toàn bộ hoạt động kinh doanh: quầy thu ngân POS, quản lý kho hàng và đồng bộ sàn Shopee, TikTok Shop, Facebook.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${beVietnamPro.variable} font-sans antialiased min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 selection:bg-emerald-600 selection:text-white transition-colors duration-200`}
      >
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
