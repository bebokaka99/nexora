import { Layers, Barcode, Printer } from "lucide-react";
import type { OrderItem } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export interface ReceiptModalProps {
  receipt: OrderItem;
  onClose: () => void;
}

/** Modal 3: Hoa don nhiet POS (K80) — chi tiet don vua thanh toan tai quay. */
export function ReceiptModal({ receipt: completedReceipt, onClose }: ReceiptModalProps) {
  return (
    <Modal size="sm" overlayClassName="bg-slate-950/70" className="flex flex-col font-mono text-xs">
        {/* Thermal Receipt Header */}
        <div className="text-center pb-4 border-b-2 border-dashed border-slate-300 dark:border-slate-600">
          <div className="flex items-center justify-center gap-1.5 font-sans font-black text-lg text-slate-900 dark:text-slate-100 tracking-tight">
            <Layers className="w-5 h-5 text-emerald-600" />
            NEXORA HOME
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
            {completedReceipt.channelLabel}
          </p>
          <p className="text-xs text-slate-400 font-sans">
            Hotline: 028 3822 1199 • TP. Hồ Chí Minh
          </p>
          <div className="text-sm font-black text-slate-800 dark:text-slate-200 font-sans mt-2">
            HÓA ĐƠN BÁN LẺ
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
            Số HĐ: {completedReceipt.id}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Ngày: {new Date().toLocaleDateString("vi-VN")} {new Date().toLocaleTimeString("vi-VN")}
          </div>
        </div>

        {/* Receipt Items Table */}
        <div className="py-3 border-b-2 border-dashed border-slate-300 dark:border-slate-600 space-y-2">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex justify-between uppercase">
            <span>Tên Sản Phẩm</span>
            <span>T.Tiền</span>
          </div>
          {completedReceipt.items.map((item, idx) => (
            <div key={idx} className="text-xs">
              <div className="font-sans font-bold text-slate-900 dark:text-slate-100">{item.name}</div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400 text-xs">
                <span>
                  {item.qty} x {item.price.toLocaleString("vi-VN")} ₫
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {(item.qty * item.price).toLocaleString("vi-VN")} ₫
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Receipt Totals */}
        <div className="py-3 border-b-2 border-dashed border-slate-300 dark:border-slate-600 space-y-1.5 text-xs">
          {completedReceipt.discountAmount && completedReceipt.discountAmount > 0 && (
            <div className="flex justify-between text-rose-600">
              <span>Chiết khấu:</span>
              <span>-{completedReceipt.discountAmount.toLocaleString("vi-VN")} ₫</span>
            </div>
          )}
          <div className="flex justify-between font-black text-sm text-slate-900 dark:text-slate-100 pt-1">
            <span>TỔNG CỘNG:</span>
            <span className="text-emerald-700 dark:text-emerald-300">{completedReceipt.totalAmount.toLocaleString("vi-VN")} ₫</span>
          </div>
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Phương thức:</span>
            <span className="font-sans font-semibold text-slate-800 dark:text-slate-200">{completedReceipt.paymentMethod}</span>
          </div>
        </div>

        {/* Receipt Footer */}
        <div className="text-center pt-4 pb-2 text-xs text-slate-500 dark:text-slate-400 font-sans">
          <div className="font-bold text-slate-800 dark:text-slate-200">Cảm ơn quý khách và hẹn gặp lại!</div>
          <p className="mt-0.5 text-slate-400">Đổi trả trong 7 ngày nếu lỗi từ nhà sản xuất</p>
          {/* Barcode Graphic */}
          <div className="mt-3 flex flex-col items-center">
            <Barcode className="w-36 h-10 text-slate-800 dark:text-slate-200" />
            <span className="text-xs font-mono tracking-widest">{completedReceipt.id}</span>
          </div>
        </div>

        {/* Print & Close Buttons */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex gap-2 font-sans">
          <Button
                    onClick={() => {
                      window.print();
                    }}
                    className="flex-1 py-2"
                  >
            <Printer className="w-3.5 h-3.5" />
            <span>In Hóa Đơn</span>
                  </Button>
          <button
            onClick={() => onClose()}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800"
          >
            Đóng
          </button>
        </div>
    </Modal>
  );
}
