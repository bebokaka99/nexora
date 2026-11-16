import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Barcode,
  ShoppingBag,
  Boxes,
  Globe2,
  Package,
  MessageSquare,
  Store,
  ChevronDown,
  LogOut,
} from "lucide-react";
import type { DashboardTab } from "./types";

export interface DashboardSidebarProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  ordersCount: number;
  lowStockCount: number;
  storesCount: number;
  tenant: { name?: string; slug?: string } | null;
  user: { fullName?: string; role?: string } | null;
  onLogout: () => void;
}

/** Sidebar dieu huong dashboard — 8 tab noi bo, tenant switcher, user footer. */
export function DashboardSidebar({
  activeTab,
  onTabChange,
  ordersCount,
  lowStockCount,
  storesCount,
  tenant,
  user,
  onLogout,
}: DashboardSidebarProps) {
  return (
    <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
      {/* Sidebar Brand Header */}
      <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between">
        <Link href="/" className="flex items-center group">
          <Image
            src="/logo.png"
            alt="NEXORA"
            width={1024}
            height={572}
            className="h-7 w-auto object-contain transition-transform group-hover:scale-105"
          />
        </Link>
        <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          PRO
        </span>
      </div>

      {/* Tenant Switcher Card */}
      <div className="p-3 mx-3 my-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-7 h-7 rounded-md bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Store className="w-3.5 h-3.5" />
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-bold text-white truncate" title={tenant?.name || "Gia Dụng Hiện Đại"}>
              {tenant?.name || "Gia Dụng Hiện Đại"}
            </div>
            <div className="text-xs text-slate-400 truncate">
              {tenant?.slug ? `@${tenant.slug}` : "2 Cửa Hàng • 3 Kênh Sàn"}
            </div>
          </div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto text-xs">
        {/* Màn hình 1: Dashboard */}
        <button
          onClick={() => onTabChange("overview")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${
            activeTab === "overview"
              ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/20 font-semibold"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          <span>1. Dashboard Tổng Quan</span>
        </button>

        {/* Màn hình 2: POS Terminal */}
        <button
          onClick={() => onTabChange("pos")}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-all ${
            activeTab === "pos"
              ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/20 font-semibold"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <div className="flex items-center gap-3">
            <Barcode className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>2. Quầy Bán Lẻ (POS)</span>
          </div>
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-xs font-bold">
            2 Quầy
          </span>
        </button>

        {/* Màn hình 3: Quản lý đơn hàng */}
        <button
          onClick={() => onTabChange("orders")}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-all ${
            activeTab === "orders"
              ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/20 font-semibold"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span>3. Đơn Hàng Đa Kênh</span>
          </div>
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-xs font-bold">
            {ordersCount}
          </span>
        </button>

        {/* Màn hình 4: Tồn kho đa điểm */}
        <button
          onClick={() => onTabChange("inventory")}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-all ${
            activeTab === "inventory"
              ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/20 font-semibold"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <div className="flex items-center gap-3">
            <Boxes className="w-4 h-4 shrink-0" />
            <span>4. Tồn Kho Đa Điểm</span>
          </div>
          {lowStockCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
              {lowStockCount} Sắp hết
            </span>
          )}
        </button>

        {/* Màn hình 5: Kênh bán hàng */}
        <button
          onClick={() => onTabChange("channels")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${
            activeTab === "channels"
              ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/20 font-semibold"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <Globe2 className="w-4 h-4 shrink-0" />
          <span>5. Kết Nối Kênh Sàn</span>
        </button>

        <div className="pt-3 pb-1 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Phân Hệ Bổ Trợ
        </div>

        {/* Màn hình bổ trợ: Sản phẩm */}
        <button
          onClick={() => onTabChange("products")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${
            activeTab === "products"
              ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/20 font-semibold"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <Package className="w-4 h-4 shrink-0" />
          <span>Danh Mục Sản Phẩm</span>
        </button>

        {/* Màn hình bổ trợ: Hộp thư hội thoại */}
        <button
          onClick={() => onTabChange("chat")}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-all ${
            activeTab === "chat"
              ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/20 font-semibold"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <div className="flex items-center gap-3">
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span>Hộp Thư Hội Thoại</span>
          </div>
          <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-xs font-bold animate-pulse">
            18
          </span>
        </button>

        {/* Màn hình bổ trợ: Cửa hàng */}
        <button
          onClick={() => onTabChange("stores")}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-all ${
            activeTab === "stores"
              ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/20 font-semibold"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <div className="flex items-center gap-3">
            <Store className="w-4 h-4 shrink-0" />
            <span>Hệ Thống Cửa Hàng</span>
          </div>
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
            {storesCount || 2}
          </span>
        </button>
      </nav>

      {/* Sidebar Footer User Info & Logout */}
      <div className="p-3 border-t border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-blue-600 flex items-center justify-center font-bold text-xs text-white shadow-sm shrink-0">
            {user?.fullName
              ? user.fullName
                  .split(" ")
                  .slice(-2)
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
              : "AD"}
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-bold text-white truncate" title={user?.fullName || "Quản Trị Viên"}>
              {user?.fullName || "Quản Trị Viên"}
            </div>
            <div className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="truncate">{user?.role || "ADMIN"} • Trực Tuyến</span>
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="text-slate-400 hover:text-rose-400 hover:bg-slate-800 p-1.5 rounded-lg transition-colors shrink-0"
          title="Đăng xuất khỏi Workspace"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
