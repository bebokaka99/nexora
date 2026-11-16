import { Barcode, RefreshCw, Bell, LogOut } from "lucide-react";
import { DarkModeToggle } from "@/components/dark-mode-toggle";
import type { DashboardTab } from "./types";

export interface DashboardHeaderProps {
  activeTab: DashboardTab;
  storesCount: number;
  isSyncingChannels: boolean;
  onSync: () => void;
  onGoPos: () => void;
  user: { fullName?: string } | null;
  tenant: { name?: string } | null;
  onLogout: () => void;
}

/** Header dashboard — tieu de theo tab, nut POS nhanh, dong bo san, dark mode. */
export function DashboardHeader({
  activeTab,
  storesCount,
  isSyncingChannels,
  onSync,
  onGoPos,
  user,
  tenant,
  onLogout,
}: DashboardHeaderProps) {
  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          {activeTab === "overview" && "Dashboard Tổng Quan Hoạt Động Kinh Doanh"}
          {activeTab === "pos" && "Quầy Thu Ngân Bán Lẻ Tại Cửa Hàng (POS Terminal)"}
          {activeTab === "orders" && "Quản Lý Đơn Hàng Đa Kênh Hợp Nhất"}
          {activeTab === "products" && "Danh Mục Sản Phẩm Đồ Gia Dụng & Biến Thể"}
          {activeTab === "inventory" && "Ma Trận Tồn Kho Đa Điểm & Điều Chuyển Kho"}
          {activeTab === "chat" && "Unified Inbox — Hộp Thư Hội Thoại & Chốt Đơn"}
          {activeTab === "channels" && "Trung Tâm Kết Nối Kênh Sàn & Đồng Bộ Dữ Liệu"}
          {activeTab === "stores" && `Hệ Thống ${storesCount || 2} Cửa Hàng Vật Lý & Điểm Bán`}
        </h1>
      </div>

      {/* Quick Header Actions */}
      <div className="flex items-center gap-3">
        {/* Quick POS Button */}
        <button
          onClick={() => onGoPos()}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all ${
            activeTab === "pos"
              ? "bg-emerald-700 text-white"
              : "bg-emerald-600 hover:bg-emerald-700 text-white"
          }`}
        >
          <Barcode className="w-3.5 h-3.5" />
          <span>Bán Tại Quầy (POS)</span>
        </button>

        {/* Quick Sync Button */}
        <button
          onClick={onSync}
          disabled={isSyncingChannels}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isSyncingChannels ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Đồng Bộ Sàn</span>
        </button>

        {/* Dark Mode Toggle */}
        <DarkModeToggle />

        {/* Notification Bell */}
        <div className="relative">
          <button className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-800 relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
          </button>
        </div>

        {/* Header User Badge & Logout */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200 dark:border-slate-700">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
              {user?.fullName || "Nguyễn Văn Quản Trị"}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
              {tenant?.name || "Gia Dụng Hiện Đại"}
            </span>
          </div>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:bg-rose-950/50 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Đăng xuất khỏi Workspace"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Đăng xuất</span>
          </button>
        </div>
      </div>
    </header>
  );
}
