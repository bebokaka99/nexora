import Image from "next/image";
import { Search, Plus, Barcode } from "lucide-react";
import type { Store as StoreEntity } from "@/lib/services/store-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PosApi } from "./use-pos";
import { PosCartPanel } from "./PosCartPanel";

export interface PosTabProps {
  pos: PosApi;
  stores: StoreEntity[];
  posStore: string;
  setPosStore: (v: string) => void;
}

/** Tab 2: Quay POS — chon diem ban, loc/tim san pham, luoi san pham anh that. */
export function PosTab({ pos, stores, posStore, setPosStore }: PosTabProps) {
  const {
      posCategory,
      setPosCategory,
      posSearch,
      setPosSearch,
      filteredPosProducts,
      getProductStockForCurrentPos,
      addToCart,
      barcodeFlash,
      handleSimulateBarcodeScan,
    } = pos;

  return (
    <div className="space-y-4">
      {/* POS Top Control Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Store Selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Điểm Bán Hiện Tại:
          </span>
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 text-xs">
            {stores.length > 0 ? (
              stores.map((st) => (
                <button
                  key={st.id}
                  onClick={() => setPosStore(st.id)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    posStore === st.id
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white dark:text-slate-100"
                  }`}
                >
                  {st.name.replace("NEXORA Store — ", "").replace("Cửa Hàng ", "CH ")}
                </button>
              ))
            ) : (
              <>
                <button
                  onClick={() => setPosStore("store1")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    posStore === "store1"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white dark:text-slate-100"
                  }`}
                >
                  Chi Nhánh 1 (Quận 1)
                </button>
                <button
                  onClick={() => setPosStore("store2")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    posStore === "store2"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white dark:text-slate-100"
                  }`}
                >
                  Chi Nhánh 2 (Bình Thạnh)
                </button>
              </>
            )}
          </div>
        </div>

        {/* Cashier and Barcode Sim Button */}
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-600 dark:text-slate-400 hidden sm:block">
            Thu ngân: <strong className="text-slate-900 dark:text-slate-100">Nguyễn Lan (Ca sáng)</strong>
          </div>
          <Button
                        onClick={handleSimulateBarcodeScan}
                        className={`text-white shadow-sm ${
                          barcodeFlash ? "bg-emerald-600 scale-105" : "bg-slate-900 hover:bg-slate-800"
                        }`}
                      >
            <Barcode className="w-4 h-4 text-emerald-400" />
                        <span>Quét Barcode Mẫu</span>
                      </Button>
        </div>
      </div>

      {/* Main Split Layout: Left Products Grid (8 cols), Right Cart & Checkout (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT: PRODUCTS SELECTOR (Col 8) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Category Filter Pills & Search */}
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <Input
                type="text"
                value={posSearch}
                onChange={(e) => setPosSearch(e.target.value)}
                placeholder="Tìm sản phẩm theo tên, mã SKU hoặc quét mã vạch..."
                className="pl-9 pr-4 bg-slate-50/50 dark:bg-slate-800/50"
              />
            </div>

            {/* Quick Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { id: "all", label: "Tất cả" },
                { id: "noichien", label: "Nồi chiên không dầu" },
                { id: "chao", label: "Chảo chống dính" },
                { id: "amsieutoc", label: "Ấm siêu tốc" },
                { id: "mayxay", label: "Máy xay sinh tố" },
                { id: "noicom", label: "Nồi cơm điện" },
                { id: "khac", label: "Thiết bị khác" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setPosCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
                    posCategory === cat.id
                      ? "bg-emerald-600 text-white shadow-sm font-semibold"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 dark:bg-slate-700"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {filteredPosProducts.map((p) => {
              const stock = getProductStockForCurrentPos(p);
              const isOutOfStock = stock <= 0;

              return (
                <div
                  key={p.id}
                  onClick={() => !isOutOfStock && addToCart(p)}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isOutOfStock
                      ? "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-60 cursor-not-allowed"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-emerald-400 hover:shadow-md cursor-pointer group"
                  }`}
                >
                  <div>
                    {/* Ảnh thật của sản phẩm */}
                    <div className="relative h-32 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 mb-3">
                      <Image
                        src={p.image}
                        alt={`Ảnh sản phẩm ${p.name}`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    {/* Card Header Tag */}
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                        {p.categoryName}
                      </span>
                      <span className="text-slate-400 font-mono text-xs">{p.sku}</span>
                    </div>

                    {/* Product Name & Brand */}
                    <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors line-clamp-2 leading-snug">
                      {p.name}
                    </h3>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{p.brand}</div>
                  </div>

                  {/* Price & Stock Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-black text-slate-900 dark:text-slate-100">
                        {p.sellingPrice.toLocaleString("vi-VN")} ₫
                      </div>
                      <div className="text-xs font-semibold flex items-center gap-1 mt-0.5">
                        {isOutOfStock ? (
                          <span className="text-rose-600">Hết hàng tại quầy</span>
                        ) : (
                          <span className="text-emerald-600">
                            Tồn quầy: {stock} cái
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      disabled={isOutOfStock}
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(p);
                      }}
                      className={`p-2 rounded-xl text-xs font-bold transition-all ${
                        isOutOfStock
                          ? "bg-slate-200 dark:bg-slate-700 text-slate-400"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm group-hover:scale-105"
                      }`}
                      title="Thêm vào giỏ"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
              <PosCartPanel pos={pos} />
            </div>
          </div>
  );
}
