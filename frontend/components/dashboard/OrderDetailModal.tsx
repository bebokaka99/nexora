import { X, Printer } from "lucide-react";
import type { OrderItem } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export interface OrderDetailModalProps {
  order: OrderItem;
  triggerToast: (msg: string) => void;
  onClose: () => void;
}

/** Modal 1: Chi tiet don hang — san pham xuat kho, in phieu dong goi. */
export function OrderDetailModal({ order: selectedOrder, triggerToast, onClose }: OrderDetailModalProps) {
  return (
    <Modal size="lg">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="font-mono text-xs font-bold text-emerald-600">{selectedOrder.id}</span>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mt-0.5">Chi Tiết Đơn Hàng</h3>
          </div>
          <button
            onClick={() => onClose()}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
            <div>
              <span className="text-slate-400 text-xs block">Khách hàng</span>
              <strong className="text-slate-900 dark:text-slate-100">{selectedOrder.customer}</strong>
              <div className="text-slate-500 dark:text-slate-400 text-xs">{selectedOrder.phone}</div>
            </div>
            <div>
              <span className="text-slate-400 text-xs block">Kênh bán & Trạng thái</span>
              <strong className="text-emerald-600">{selectedOrder.channelLabel}</strong>
              <div className="text-slate-500 dark:text-slate-400 text-xs">{selectedOrder.statusLabel}</div>
            </div>
          </div>

          {selectedOrder.address && (
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
              <span className="text-slate-400 text-xs block">Địa chỉ giao hàng</span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">{selectedOrder.address}</span>
            </div>
          )}

          <div>
            <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">Danh sách sản phẩm xuất kho:</span>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              {selectedOrder.items.map((it, i) => (
                <div key={i} className="p-3 flex items-center justify-between bg-white dark:bg-slate-900">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">{it.name}</div>
                    <div className="text-xs font-mono text-slate-400">SKU: {it.sku}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900 dark:text-slate-100">{it.price.toLocaleString("vi-VN")} ₫</div>
                    <div className="text-xs text-slate-400">Số lượng: x{it.qty}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 text-sm font-bold border-t border-slate-100 dark:border-slate-800">
            <span>Tổng tiền thanh toán:</span>
            <span className="text-emerald-600 text-base">{selectedOrder.totalAmount.toLocaleString("vi-VN")} ₫</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
          <Button
                    onClick={() => {
                      triggerToast(`Đã in phiếu đóng gói cho đơn hàng ${selectedOrder.id}`);
                      onClose();
                    }}
                    className="flex-1 py-2.5"
                  >
            <Printer className="w-4 h-4" />
            <span>In Phiếu Đóng Gói</span>
                  </Button>
          <button
            onClick={() => onClose()}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800"
          >
            Đóng
          </button>
        </div>
    </Modal>
  );
}
