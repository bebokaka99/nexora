import { ArrowLeftRight } from "lucide-react";
import type { ProductItem } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/table";

export interface InventoryTabProps {
  products: ProductItem[];
  onOpenTransfer: () => void;
}

/** Tab 4: Ton kho da diem — huy hieu kho, ma tran ton theo san pham. */
export function InventoryTab({ products, onOpenTransfer }: InventoryTabProps) {
  return (
    <div className="space-y-6">
      {/* Header with Transfer Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Ma Trận Tồn Kho Đa Chi Nhánh</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Theo dõi tồn thực tế, số lượng đang giữ và tồn khả dụng thời gian thực
          </p>
        </div>
        <Button
                      onClick={onOpenTransfer}
                      className="px-4 py-2 shadow-emerald-500/20"
                    >
          <ArrowLeftRight className="w-4 h-4" />
          <span>Tạo Phiếu Chuyển Kho</span>
                    </Button>
      </div>

      {/* Warehouse Quick Summary Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
          <div className="text-xs font-bold text-emerald-600 uppercase">Kho Chi Nhánh 1 (Quận 1)</div>
          <div className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">
            {products.reduce((s, p) => s + p.stockStore1, 0)} Sản phẩm
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Phục vụ bán lẻ trực tiếp tại quầy POS 1</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
          <div className="text-xs font-bold text-indigo-600 uppercase">Kho Chi Nhánh 2 (Bình Thạnh)</div>
          <div className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">
            {products.reduce((s, p) => s + p.stockStore2, 0)} Sản phẩm
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Phục vụ bán lẻ trực tiếp tại quầy POS 2</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
          <div className="text-xs font-bold text-emerald-600 uppercase">Đang Giữ Cho Sàn (Committed)</div>
          <div className="text-xl font-black text-emerald-600 mt-1">
            {products.reduce((s, p) => s + p.committed, 0)} Sản phẩm
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Đơn hàng Shopee, TikTok chờ đóng gói</p>
        </div>
      </div>

      {/* Inventory Matrix Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <Table>
            <TableHead>
              <tr>
                <TableHeaderCell className="py-3.5 px-4">Sản Phẩm Gia Dụng</TableHeaderCell>
                <TableHeaderCell className="py-3.5 px-4">Mã SKU & Barcode</TableHeaderCell>
                <TableHeaderCell className="py-3.5 px-4 text-center">Kho Q.1</TableHeaderCell>
                <TableHeaderCell className="py-3.5 px-4 text-center">Kho Bình Thạnh</TableHeaderCell>
                <TableHeaderCell className="py-3.5 px-4 text-center">Đang Giữ</TableHeaderCell>
                <TableHeaderCell className="py-3.5 px-4 text-center">Tồn Khả Dụng</TableHeaderCell>
                <TableHeaderCell className="py-3.5 px-4 text-right">Trạng Thái</TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {products.map((p) => {
                const available = Math.max(0, p.stockStore1 + p.stockStore2 - p.committed);
                const isLow = available <= 5;

                return (
                  <TableRow key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/80 dark:bg-slate-800/80 transition-colors">
                    <TableCell className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{p.name}</div>
                      <div className="text-slate-400 text-xs">{p.brand}</div>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 font-mono">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{p.sku}</span>
                      <div className="text-slate-400 text-xs">{p.barcode}</div>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 text-center font-bold text-emerald-700 dark:text-emerald-300">
                      {p.stockStore1}
                    </TableCell>
                    <TableCell className="py-3.5 px-4 text-center font-bold text-indigo-700">
                      {p.stockStore2}
                    </TableCell>
                    <TableCell className="py-3.5 px-4 text-center text-slate-500 dark:text-slate-400 font-semibold">
                      {p.committed}
                    </TableCell>
                    <TableCell className="py-3.5 px-4 text-center">
                      <span className={`font-black text-sm ${isLow ? "text-rose-600" : "text-emerald-600"}`}>
                        {available}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 text-right">
                      {isLow ? (
                        <Badge variant="rose">
                                      Sắp hết hàng
                                    </Badge>
                      ) : (
                        <Badge variant="emerald">
                                      Đủ bán
                                    </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
      </div>
    </div>
  );
}
