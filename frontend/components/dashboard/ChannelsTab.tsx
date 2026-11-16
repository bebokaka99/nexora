import { RefreshCw } from "lucide-react";
import type { ChannelConnectionItem } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export interface ChannelsTabProps {
  channels: ChannelConnectionItem[];
  isSyncingChannels: boolean;
  onSync: () => void;
}

/** Tab 5: Ket noi kenh san — the kenh, dong bo ton kho 2 chieu (mo phong). */
export function ChannelsTab({ channels, isSyncingChannels, onSync }: ChannelsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Trung Tâm Kết Nối Kênh Bán Hàng</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Quản lý ủy quyền API và đồng bộ 2 chiều với Shopee, TikTok Shop, Facebook
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
                        onClick={onSync}
                        disabled={isSyncingChannels}
                        className="px-4 py-2 shadow-emerald-500/20"
                      >
            <RefreshCw className={`w-4 h-4 ${isSyncingChannels ? "animate-spin" : ""}`} />
            <span>{isSyncingChannels ? "Đang đồng bộ..." : "Đồng bộ tồn kho ngay"}</span>
                      </Button>
        </div>
      </div>

      {/* Channel Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {channels.map((ch) => (
          <Card key={ch.id} className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300">
                    {ch.platform === "Shopee" && <span className="text-amber-600 font-extrabold">SP</span>}
                    {ch.platform === "TikTok Shop" && <span className="text-sky-600 font-extrabold">TT</span>}
                    {ch.platform === "Facebook" && <span className="text-emerald-600 font-extrabold">FB</span>}
                    {ch.platform === "Lazada" && <span className="text-indigo-600 font-extrabold">LZ</span>}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{ch.name}</h3>
                    <div className="text-xs text-slate-400 font-mono">ID: {ch.accountId}</div>
                  </div>
                </div>

                <Badge
                              className={
                                ch.status === "CONNECTED"
                                  ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800"
                                  : "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800"
                              }
                            >
                              {ch.status === "CONNECTED" ? "Đang Kết Nối" : "Cần Chú Ý"}
                            </Badge>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-400 text-xs block">Sản phẩm đã đồng bộ</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{ch.totalSyncedProducts} SKU</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-400 text-xs block">Đơn hàng chờ xử lý</span>
                  <span className="font-bold text-emerald-600 text-sm">{ch.pendingOrders} Đơn</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Đồng bộ gần nhất: <strong className="text-slate-700 dark:text-slate-300">{ch.lastSyncedAt}</strong></span>
              <button
                onClick={onSync}
                className="text-emerald-600 font-semibold hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Đồng bộ lại
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
