'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, Menu, X } from 'lucide-react';
import { DarkModeToggle } from './dark-mode-toggle';

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: 'Giới thiệu', href: '/gioi-thieu' },
    { name: 'Chúng tôi làm gì', href: '/giai-phap' },
    { name: 'Dành cho ai', href: '/doi-tuong' },
    { name: 'Kênh kết nối', href: '/kenh-ban' },
    { name: 'Hỏi đáp FAQ', href: '/faq' },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border-b border-emerald-100 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo — Noticeably larger as requested */}
        <Link href="/" className="flex items-center group py-2">
          <img
            src="/logo.png"
            alt="NEXORA"
            className="h-11 sm:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
          />
        </Link>

        {/* Navigation Links — No '#' symbols, pure clean routes */}
        <nav className="hidden lg:flex items-center gap-8 text-xs font-bold text-slate-600 dark:text-slate-300">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-1 transition-all duration-200 hover:text-emerald-600 dark:hover:text-emerald-400 group ${
                  isActive ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : ''
                }`}
              >
                <span>{link.name}</span>
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-emerald-600 dark:bg-emerald-400 transition-all duration-300 ${
                    isActive ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Header Actions: Dark Mode Toggle & Compact Login CTA */}
        <div className="flex items-center gap-3">
          <DarkModeToggle />

          {/* Unified Compact Login CTA */}
          <Link
            href="/dang-nhap"
            className="inline-flex items-center gap-2 text-xs font-bold px-4 sm:px-5 py-2.5 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] shadow-md shadow-emerald-600/25 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-600/30"
          >
            <span>Đăng nhập</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-3 pb-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 space-y-2 text-xs font-bold text-slate-700 dark:text-slate-200 animate-in slide-in-from-top-2 duration-200">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block py-2.5 px-3 rounded-lg transition-colors ${
                pathname === link.href
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <Link
              href="/dang-ky"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center py-2.5 px-3 rounded-xl text-emerald-700 dark:text-emerald-400 font-extrabold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800"
            >
              Đăng ký dùng thử 14 ngày
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
