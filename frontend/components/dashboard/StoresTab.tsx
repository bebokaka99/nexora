import { Building2, RefreshCw, Plus, MapPin, Phone, Store, Boxes, CheckCircle2, Barcode } from "lucide-react";
import type { Store as StoreEntity, Warehouse as WarehouseEntity } from "@/lib/services/store-service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export interface StoresTabProps {
  stores: StoreEntity[];
  warehouses: WarehouseEntity[];
  isStoresLoading: boolean;
  onRefresh: () => void;
  onAddStore: () => void;
  onOpenPosForStore: (storeId: string) => void;
}

/** Tab bo tro: He thong cua hang & kho — the chi nhanh, KPI, danh muc kho. */
export function StoresTab({
  stores,
  warehouses,
  isStoresLoading,
  onRefresh,
  onAddStore,
  onOpenPosForStore,
}: StoresTabProps) {
  return (
    <div className="space-y-6">
      {/* Header with Title and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <span>Hệ Thống {stores.length} Cửa Hàng & Điểm Bán Vật Lý</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Quản lý mạng lưới chi nhánh bán lẻ, gắn kết kho hàng mặc định và đồng bộ trực tiếp với quầy POS
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
                        onClick={onRefresh}
                        disabled={isStoresLoading}
                        variant="secondary"
                        className="px-3 py-2 font-semibold"
                      >
            <RefreshCw className={`w-3.5 h-3.5 ${isStoresLoading ? "animate-spin text-emerald-600" : ""}`} />
            <span>{isStoresLoading ? "Đang tải..." : "Làm Mới"}</span>
                      </Button>

          <Button
                        onClick={onAddStore}
                        className="px-4 py-2"
                      >
            <Plus className="w-4 h-4" />
            <span>Thêm Chi Nhánh Mới</span>
                      </Button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Tổng Điểm Bán</span>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{stores.length}</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">
            {stores.filter((s) => s.isActive).length} Đang hoạt động
          </div>
        </Card>

        <Card className="p-4">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Tổng Kho Lưu Trữ</span>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{warehouses.length}</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">
            {warehouses.filter((w) => w.type === "CENTRAL").length} Kho tổng •{" "}
            {warehouses.filter((w) => w.type === "STORE_ATTACHED").length} Kho quầy
          </div>
        </Card>

        <Card className="p-4">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Doanh Số Quầy Toàn Hệ Thống</span>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
            {stores
              .reduce((sum, s) => sum + (s.todayRevenue || 0), 0)
              .toLocaleString("vi-VN")}{" "}
            ₫
          </div>
          <div className="text-xs text-slate-400 mt-1">Cập nhật theo thời gian thực</div>
        </Card>

        <Card className="p-4">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Tỷ Lệ Khóa Kho Mặc Định</span>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
            {stores.length > 0
              ? Math.round(
                  (stores.filter((s) => s.defaultWarehouseId).length / stores.length) * 100
                )
              : 100}
            %
          </div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">Tránh bán vượt tồn kho</div>
        </Card>
      </div>

      {/* Stores Cards Grid */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Danh Sách Chi Nhánh Cửa Hàng
          </h3>
          <span className="text-xs text-slate-400">
            Nhấn &quot;Bán Tại Quầy&quot; để mở giao diện POS của chi nhánh
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {stores.map((st) => (
            <Card key={st.id} className="p-5 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all flex flex-col justify-between">
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {st.code}
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-1.5">{st.name}</h3>
                  </div>
                  <Badge variant={st.isActive ? "emerald" : "slate"}>
                                {st.isActive ? "Đang Mở Cửa" : "Tạm Dừng"}
                              </Badge>
                </div>

                {/* Store Info */}
                <div className="mt-4 space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{st.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Hotline: {st.phoneNumber || "028 3822 1199"}</span>
                  </div>
                  <div className="flex items-start gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <Store className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 text-xs">Kho hàng xuất mặc định:</span>
                      <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                        <span>{st.defaultWarehouse?.name || "Kho mặc định (Tại chỗ)"}</span>
                        {st.defaultWarehouse?.code && (
                          <span className="font-mono text-xs px-1 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                            {st.defaultWarehouse.code}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Snapshot */}
                <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-slate-400">Doanh Số Hôm Nay</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {(st.todayRevenue || 0).toLocaleString("vi-VN")} ₫
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Số Lượng Hóa Đơn</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {st.ordersCount || 0} HĐ
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => onOpenPosForStore(st.id)}
                  className="w-full py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Barcode className="w-3.5 h-3.5" />
                  <span>Mở POS Thu Ngân Chi Nhánh Này</span>
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Warehouses Section */}
      <div className="pt-2">
        <div className="mb-3">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Boxes className="w-4 h-4 text-emerald-600" />
            <span>Danh Mục {warehouses.length} Kho Hàng Vận Hành Toàn Hệ Thống</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Hệ thống kho đa điểm gồm kho tổng lưu trữ hàng lớn phục vụ sàn Shopee / TikTok Shop và kho vệ tinh tại từng cửa hàng
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {warehouses.map((wh) => (
            <Card key={wh.id} className="p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {wh.code}
                  </span>
                  <Badge variant={wh.type === "CENTRAL" ? "amber" : "blue"}>
                                {wh.type === "CENTRAL" ? "Kho Tổng Trung Tâm" : "Kho Tại Cửa Hàng"}
                              </Badge>
                </div>

                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs mt-2.5 line-clamp-1">
                  {wh.name}
                </h4>

                <div className="flex items-start gap-1.5 mt-2 text-xs text-slate-500 dark:text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{wh.address}</span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Trạng thái:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Sẵn Sàng Xuất Hàng
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
