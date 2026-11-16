import { Search, Eye } from "lucide-react";
import type { OrderItem } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/table";

export interface OrdersTabProps {
  filteredOrders: OrderItem[];
  orderSearchText: string;
  setOrderSearchText: (v: string) => void;
  orderChannelFilter: string;
  setOrderChannelFilter: (v: string) => void;
  orderStatusFilter: string;
  setOrderStatusFilter: (v: string) => void;
  onSelectOrder: (order: OrderItem) => void;
}

/** Tab 3: Don hang da kenh — loc/tim kiem + bang don, bam dong mo chi tiet. */
export function OrdersTab({
  filteredOrders,
  orderSearchText,
  setOrderSearchText,
  orderChannelFilter,
  setOrderChannelFilter,
  orderStatusFilter,
  setOrderStatusFilter,
  onSelectOrder,
}: OrdersTabProps) {
  return (
    <div className="space-y-6">
      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <Input
              type="text"
              value={orderSearchText}
              onChange={(e) => setOrderSearchText(e.target.value)}
              placeholder="Tìm theo mã đơn, tên hoặc SĐT khách..."
              className="pl-9 pr-4 focus:ring-1 focus:ring-blue-500 bg-slate-50/50 dark:bg-slate-800/50"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Channel Filter */}
          <select
            value={orderChannelFilter}
            onChange={(e) => setOrderChannelFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">Tất cả kênh bán</option>
            <option value="SHOPEE">Shopee Mall</option>
            <option value="TIKTOK">TikTok Shop</option>
            <option value="FACEBOOK">Facebook Chat</option>
            <option value="POS_STORE_1">POS Chi Nhánh 1 (Q.1)</option>
            <option value="POS_STORE_2">POS Chi Nhánh 2 (Bình Thạnh)</option>
          </select>

          {/* Status Filter */}
          <select
            value={orderStatusFilter}
            onChange={(e) => setOrderStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xử lý</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="PROCESSING">Đang đóng gói</option>
            <option value="SHIPPED">Đang giao hàng</option>
            <option value="COMPLETED">Đã hoàn thành</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <Table>
            <TableHead>
              <tr>
                <TableHeaderCell className="py-3.5 px-4">Mã Đơn Hàng</TableHeaderCell>
                <TableHeaderCell className="py-3.5 px-4">Khách Hàng</TableHeaderCell>
                <TableHeaderCell className="py-3.5 px-4">Kênh Bán</TableHeaderCell>
                <TableHeaderCell className="py-3.5 px-4">Sản Phẩm</TableHeaderCell>
                <TableHeaderCell className="py-3.5 px-4">Tổng Tiền</TableHeaderCell>
                <TableHeaderCell className="py-3.5 px-4">Trạng Thái</TableHeaderCell>
                <TableHeaderCell className="py-3.5 px-4 text-right">Hành Động</TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-slate-400">
                    Không tìm thấy đơn hàng nào phù hợp với bộ lọc
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((ord) => (
                  <TableRow
                    key={ord.id}
                    onClick={() => onSelectOrder(ord)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/80 dark:bg-slate-800/80 cursor-pointer transition-colors"
                  >
                    <TableCell className="py-3.5 px-4 font-mono font-bold text-emerald-600">
                      {ord.id}
                      <div className="text-xs text-slate-400 font-sans font-normal">{ord.createdAt}</div>
                    </TableCell>
                    <TableCell className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{ord.customer}</div>
                      <div className="text-slate-400 text-xs">{ord.phone}</div>
                    </TableCell>
                    <TableCell className="py-3.5 px-4">
                      <Badge className={ord.channelBadgeColor}>
                                    {ord.channelLabel}
                                  </Badge>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 max-w-xs truncate">
                      <div className="text-slate-900 dark:text-slate-100 font-medium truncate">
                        {ord.items[0]?.name}
                      </div>
                      {ord.items.length > 1 && (
                        <div className="text-xs text-slate-400 font-medium">
                          + {ord.items.length - 1} sản phẩm khác
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {ord.totalAmount.toLocaleString("vi-VN")} ₫
                      </div>
                      <div className="text-xs text-slate-400">{ord.paymentMethod}</div>
                    </TableCell>
                    <TableCell className="py-3.5 px-4">
                      <Badge className={ord.statusColor}>
                                    {ord.statusLabel}
                                  </Badge>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectOrder(ord);
                        }}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 dark:bg-emerald-950/50 rounded-lg"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
      </div>
    </div>
  );
}
