import Image from "next/image";
import type { ProductItem } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";

export interface ProductsTabProps {
  products: ProductItem[];
}

/** Tab bo tro: Danh muc san pham — gia von/gia ban, anh that san pham. */
export function ProductsTab({ products }: ProductsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Danh Mục Sản Phẩm Đồ Gia Dụng</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Quản lý giá vốn, giá bán lẻ và phân loại danh mục</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {products.map((p) => (
          <Card key={p.id} className="p-4 flex flex-col justify-between">
            <div>
              {/* Ảnh thật của sản phẩm */}
              <div className="relative h-36 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 mb-3">
                <Image
                  src={p.image}
                  alt={`Ảnh sản phẩm ${p.name}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-blue-700 dark:text-blue-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                  {p.categoryName}
                </span>
                <span className="text-slate-400 font-mono">{p.sku}</span>
              </div>
              <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100 leading-snug">{p.name}</h3>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{p.brand}</div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <div>
                <div className="text-xs text-slate-400">Giá bán lẻ</div>
                <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {p.sellingPrice.toLocaleString("vi-VN")} ₫
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Giá vốn</div>
                <div className="font-medium text-slate-600 dark:text-slate-400">
                  {p.costPrice.toLocaleString("vi-VN")} ₫
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
