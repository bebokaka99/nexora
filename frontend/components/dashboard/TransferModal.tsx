import { ArrowLeftRight, X, Check } from "lucide-react";
import type { ProductItem } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

export interface TransferModalProps {
  products: ProductItem[];
  transferProductId: string;
  setTransferProductId: (v: string) => void;
  transferFrom: "store1" | "store2";
  setTransferFrom: (v: "store1" | "store2") => void;
  transferQty: number;
  setTransferQty: (v: number) => void;
  onExecute: () => void;
  onClose: () => void;
}

/** Modal 2: Phieu chuyen kho noi bo — chon san pham, kho xuat/nhap, so luong. */
export function TransferModal({
  products,
  transferProductId,
  setTransferProductId,
  transferFrom,
  setTransferFrom,
  transferQty,
  setTransferQty,
  onExecute,
  onClose,
}: TransferModalProps) {
  return (
    <Modal size="md">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Tạo Phiếu Chuyển Kho Nội Bộ</h3>
          </div>
          <button
            onClick={() => onClose()}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-4 text-xs">
          {/* Product Select */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Chọn sản phẩm cần chuyển:</label>
            <select
              value={transferProductId}
              onChange={(e) => setTransferProductId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium bg-white dark:bg-slate-900 focus:ring-1 focus:ring-blue-500"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (SKU: {p.sku})
                </option>
              ))}
            </select>
          </div>

          {/* Source & Destination Warehouses */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Kho xuất hàng:</label>
              <select
                value={transferFrom}
                onChange={(e) => setTransferFrom(e.target.value as "store1" | "store2")}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium bg-white dark:bg-slate-900"
              >
                <option value="store1">Kho Chi Nhánh 1 (Q.1)</option>
                <option value="store2">Kho Chi Nhánh 2 (Bình Thạnh)</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Kho nhập hàng:</label>
              <div className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {transferFrom === "store1" ? "Kho Chi Nhánh 2" : "Kho Chi Nhánh 1"}
              </div>
            </div>
          </div>

          {/* Transfer Qty */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Số lượng chuyển:</label>
            <Input
              type="number"
              min="1"
              max="100"
              value={transferQty}
              onChange={(e) => setTransferQty(Number(e.target.value))}
              className="font-bold text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-3">
          <Button
                    onClick={onExecute}
                    className="flex-1 py-2.5"
                  >
            <Check className="w-4 h-4" />
            <span>Xác Nhận Chuyển Kho</span>
                  </Button>
          <button
            onClick={() => onClose()}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800"
          >
            Hủy
          </button>
        </div>
    </Modal>
  );
}
