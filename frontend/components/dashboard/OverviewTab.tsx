import { AlertTriangle, ChevronRight, TrendingUp } from "lucide-react";
import type { ActivityEvent } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { StatCard } from "./StatCard";
import { ChannelBar } from "./ChannelBar";

export interface OverviewTabProps {
  totalRevenue: number;
  totalOrdersCount: number;
  totalAvailableStock: number;
  lowStockCount: number;
  activities: ActivityEvent[];
  onGoChannels: () => void;
}

/** Tab 1: Dashboard tổng quan — 4 thẻ chỉ số, doanh thu theo kênh, sự kiện trực tiếp. */
export function OverviewTab({
  totalRevenue,
  totalOrdersCount,
  totalAvailableStock,
  lowStockCount,
  activities,
  onGoChannels,
}: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Doanh thu hôm nay */}
        <StatCard
          label="Tổng Doanh Thu Hôm Nay"
          value={`${totalRevenue.toLocaleString("vi-VN")} ₫`}
          badge={
            <span className="flex items-center text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +18.4%
            </span>
          }
          sub={
            <>
              Hôm qua: <span className="font-semibold text-slate-700 dark:text-slate-300">40.750.000 ₫</span>
            </>
          }
        />

        {/* Metric 2: Đơn hàng mới */}
        <StatCard
          label="Số Đơn Hàng Mới"
          value={`${totalOrdersCount} Đơn`}
          badge={
            <span className="flex items-center text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
              Đa kênh
            </span>
          }
          sub={
            <span className="flex items-center gap-1.5">
              <span>Shopee: <strong className="text-amber-600">64</strong></span>
              <span>•</span>
              <span>TikTok: <strong className="text-sky-600">42</strong></span>
              <span>•</span>
              <span>POS: <strong className="text-emerald-600">20</strong></span>
            </span>
          }
        />

        {/* Metric 3: Tồn kho khả dụng */}
        <StatCard
          label="Tồn Khả Dụng Toàn Hệ Thống"
          value={`${totalAvailableStock} Cái`}
          badge={
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
              2 Kho
            </span>
          }
          sub={
            <>
              Đang giữ cho đơn online: <span className="font-semibold text-emerald-600">28 cái</span>
            </>
          }
        />

        {/* Metric 4: Cảnh báo sắp hết */}
        <StatCard
          label="Cảnh Báo Sắp Hết Hàng"
          value={`${lowStockCount} Mặt Hàng`}
          valueClassName="text-rose-600"
          badge={
            <span className="flex items-center text-rose-600 font-bold bg-rose-50 dark:bg-rose-950/50 px-1.5 py-0.5 rounded">
              <AlertTriangle className="w-3 h-3 mr-0.5" /> Chú ý
            </span>
          }
          sub={<>Tồn khả dụng &le; 5 chiếc tại các kho</>}
        />
      </div>

      {/* Chart & Live Stream Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2-Column: Doanh thu theo kênh */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Phân Bổ Doanh Thu Theo Kênh Bán Hàng
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Tỷ trọng doanh số từ 2 cửa hàng vật lý và các sàn TMĐT
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-1 rounded-lg">
              Hôm nay
            </span>
          </div>

          {/* Channel Revenue Bars */}
          <div className="space-y-4">
            <ChannelBar
              label="Shopee Mall (64 đơn)"
              amountLabel="24.900.000 ₫ (51.6%)"
              percent={51.6}
              barClassName="bg-amber-500"
              dotClassName="bg-amber-500"
            />
            <ChannelBar
              label="TikTok Shop Live (42 đơn)"
              amountLabel="12.350.000 ₫ (25.6%)"
              percent={25.6}
              barClassName="bg-sky-500"
              dotClassName="bg-sky-500"
            />
            <ChannelBar
              label="POS Chi Nhánh 1 — Quận 1 (12 đơn)"
              amountLabel="7.200.000 ₫ (14.9%)"
              percent={14.9}
              barClassName="bg-emerald-600"
              dotClassName="bg-emerald-600"
            />
            <ChannelBar
              label="POS Chi Nhánh 2 — Bình Thạnh (8 đơn)"
              amountLabel="3.800.000 ₫ (7.9%)"
              percent={7.9}
              barClassName="bg-indigo-500"
              dotClassName="bg-indigo-500"
            />
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Đối soát chi phí sàn: Shopee (-11.5%), TikTok Shop (-9.8%)</span>
            <button
              onClick={onGoChannels}
              className="text-emerald-600 font-semibold hover:underline flex items-center gap-1"
            >
              Chi tiết kênh <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </Card>

        {/* 1-Column: Live Stream Activity */}
        <Card className="p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sự Kiện Trực Tiếp
            </h2>
            <span className="text-xs text-slate-400">Thời gian thực</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3">
            {activities.map((act) => (
              <div key={act.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${act.tagColor}`}>
                    {act.tag}
                  </span>
                  <span className="text-xs text-slate-400">{act.time}</span>
                </div>
                <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">{act.title}</div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{act.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
