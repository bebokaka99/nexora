import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "NEXORA — Commerce Management Platform",
  description: "One Platform. Every Channel. Complete Control. Nền tảng quản lý hoạt động kinh doanh đa kênh hợp nhất dành cho doanh nghiệp bán lẻ hiện đại.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="scroll-smooth">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
