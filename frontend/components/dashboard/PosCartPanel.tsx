import Image from "next/image";
import { Minus, Plus, X, Trash2, ShoppingCart, Receipt, QrCode, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PosApi } from "./use-pos";

/** Panel gio hang & thanh toan cua tab POS (cot phai). */
export function PosCartPanel({ pos }: { pos: PosApi }) {
  const {
      posCart,
      posCustomerPhone,
      setPosCustomerPhone,
      updateCartQty,
      removeFromCart,
      clearCart,
      posDiscountPercent,
      setPosDiscountPercent,
      posPaymentMethod,
      setPosPaymentMethod,
      posCashTendered,
      setPosCashTendered,
      cartSubtotal,
      cartDiscountAmount,
      cartTotalAmount,
      cartChangeDue,
      isCheckingOut,
      handleCompletePosCheckout,
    } = pos;

  return (
    <div className="lg:col-span-5 xl:col-span-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sticky top-20">
      {/* Cart Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-emerald-600" />
          <h2 className="font-bold text-xs text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Giỏ Hàng Quầy ({posCart.reduce((sum, item) => sum + item.qty, 0)})
          </h2>
        </div>
        {posCart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-rose-600 hover:underline flex items-center gap-1 font-semibold"
          >
            <Trash2 className="w-3 h-3" /> Xóa tất cả
          </button>
        )}
      </div>

      {/* Customer Phone Input */}
      <div className="mt-3">
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
          Số Điện Thoại Khách Hàng:
        </label>
        <Input
          type="text"
          value={posCustomerPhone}
          onChange={(e) => setPosCustomerPhone(e.target.value)}
          placeholder="Nhập số điện thoại khách..."
          className="px-3 py-1.5 rounded-lg focus:ring-1 bg-slate-50/50 dark:bg-slate-800/50"
        />
      </div>

      {/* Cart Items List */}
      <div className="mt-4 flex-1 max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl">
        {posCart.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <div className="text-xs font-semibold">Giỏ hàng đang trống</div>
            <p className="text-xs mt-1 text-slate-400">
              Nhấp chọn sản phẩm bên trái hoặc quét mã vạch
            </p>
          </div>
        ) : (
          posCart.map((item) => (
            <div key={item.product.id} className="p-3 bg-white dark:bg-slate-900 flex items-center justify-between gap-2">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                <Image
                  src={item.product.image}
                  alt={`Ảnh sản phẩm ${item.product.name}`}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {item.product.name}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {item.product.sellingPrice.toLocaleString("vi-VN")} ₫ / cái
                </div>
              </div>

              {/* Qty Control Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => updateCartQty(item.product.id, -1)}
                  className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 dark:bg-slate-700 flex items-center justify-center text-xs font-bold"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-6 text-center text-xs font-bold text-slate-900 dark:text-slate-100">
                  {item.qty}
                </span>
                <button
                  onClick={() => updateCartQty(item.product.id, 1)}
                  className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 dark:bg-slate-700 flex items-center justify-center text-xs font-bold"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="p-1 text-slate-300 hover:text-rose-600 transition-colors ml-1"
                  title="Xóa"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Discount Selector */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-slate-600 dark:text-slate-400">Chiết Khấu (Giảm giá):</span>
          <div className="flex items-center gap-1">
            {[0, 5, 10, 15].map((pct) => (
              <button
                key={pct}
                onClick={() => setPosDiscountPercent(pct)}
                className={`px-2 py-0.5 rounded text-xs font-bold transition-all ${
                  posDiscountPercent === pct
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 dark:bg-slate-700"
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="mt-3">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
            Phương Thức Thanh Toán:
          </span>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              onClick={() => setPosPaymentMethod("CASH")}
              className={`py-2 px-2 rounded-xl font-bold flex flex-col items-center gap-1 border transition-all ${
                posPaymentMethod === "CASH"
                  ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-sm"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800"
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span className="text-xs">Tiền Mặt</span>
            </button>

            <button
              onClick={() => setPosPaymentMethod("VIETQR")}
              className={`py-2 px-2 rounded-xl font-bold flex flex-col items-center gap-1 border transition-all ${
                posPaymentMethod === "VIETQR"
                  ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-sm"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800"
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span className="text-xs">VietQR</span>
            </button>

            <button
              onClick={() => setPosPaymentMethod("CARD")}
              className={`py-2 px-2 rounded-xl font-bold flex flex-col items-center gap-1 border transition-all ${
                posPaymentMethod === "CARD"
                  ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-sm"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span className="text-xs">Thẻ POS</span>
            </button>
          </div>
        </div>

        {/* Dynamic Cash Tender Box or VietQR Display */}
        {posPaymentMethod === "CASH" && posCart.length > 0 && (
          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Khách Đưa:</span>
              <Input
                type="number"
                value={posCashTendered || ""}
                onChange={(e) => setPosCashTendered(Number(e.target.value))}
                placeholder={cartTotalAmount.toString()}
                className="w-32 px-2 py-1 rounded text-right font-bold text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="flex items-center gap-1 justify-end">
              <button
                onClick={() => setPosCashTendered(cartTotalAmount)}
                className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-600"
              >
                Đủ tiền
              </button>
              <button
                onClick={() => setPosCashTendered(500000)}
                className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-600"
              >
                500k
              </button>
              <button
                onClick={() => setPosCashTendered(1000000)}
                className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-600"
              >
                1M
              </button>
              <button
                onClick={() => setPosCashTendered(2000000)}
                className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-600"
              >
                2M
              </button>
            </div>
            {posCashTendered > 0 && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700 font-bold">
                <span className="text-slate-600 dark:text-slate-400">Tiền Thối Lại:</span>
                <span className="text-emerald-600">{cartChangeDue.toLocaleString("vi-VN")} ₫</span>
              </div>
            )}
          </div>
        )}

        {posPaymentMethod === "VIETQR" && posCart.length > 0 && (
          <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center text-xs">
            <div className="font-bold text-emerald-900 dark:text-emerald-200 mb-1">Quét Mã VietQR Chuyển Khoản</div>
            <div className="w-28 h-28 mx-auto bg-white dark:bg-slate-900 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800 shadow-sm flex items-center justify-center my-1.5">
              {/* Simulated Dynamic VietQR Box */}
              <div className="text-center">
                <QrCode className="w-16 h-16 text-slate-800 dark:text-slate-200 mx-auto" />
                <div className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300">NAPAS 247</div>
              </div>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              MBBank • 0988 777 666 • NEXORA STORE
            </div>
            <div className="text-xs font-mono text-emerald-700 dark:text-emerald-300 font-bold mt-0.5">
              Số tiền: {cartTotalAmount.toLocaleString("vi-VN")} ₫
            </div>
          </div>
        )}

        {/* Price Breakdown Summary */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span>Tiền hàng:</span>
            <span>{cartSubtotal.toLocaleString("vi-VN")} ₫</span>
          </div>
          {cartDiscountAmount > 0 && (
            <div className="flex items-center justify-between text-rose-600">
              <span>Chiết khấu ({posDiscountPercent}%):</span>
              <span>-{cartDiscountAmount.toLocaleString("vi-VN")} ₫</span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm font-black text-slate-900 dark:text-slate-100 pt-1.5 border-t border-slate-100 dark:border-slate-800">
            <span>Tổng Thanh Toán:</span>
            <span className="text-emerald-700 dark:text-emerald-300 text-base">
              {cartTotalAmount.toLocaleString("vi-VN")} ₫
            </span>
          </div>
        </div>

        {/* Complete Checkout Button — TASK-016: khóa khi đang gọi API để
            tránh bấm 2 lần tạo 2 đơn; backend down thì nút vẫn bấm được để
            hiện lỗi chặn cứng (phương án A), giỏ giữ nguyên. */}
        <Button
          onClick={handleCompletePosCheckout}
          disabled={posCart.length === 0 || isCheckingOut}
          className={`w-full mt-4 py-3 shadow-emerald-500/25 active:scale-95 ${
                            posCart.length === 0 || isCheckingOut
                              ? "bg-slate-200 dark:bg-slate-700 text-slate-400"
                              : ""
                          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>
            {isCheckingOut
              ? "Đang xử lý thanh toán..."
              : `Thanh Toán & In Hóa Đơn (${cartTotalAmount.toLocaleString("vi-VN")} ₫)`}
          </span>
                        </Button>
      </div>
    </div>
  );
}
