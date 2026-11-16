import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

export interface StatCardProps {
  label: string;
  value: string;
  /** Nội dung dòng phụ dưới giá trị (đã có text-xs). */
  sub: ReactNode;
  /** Chip nhỏ ở góc phải header (vd: +18.4%, "Đa kênh"). */
  badge?: ReactNode;
  /** Màu giá trị — mặc định slate-900, vd: text-rose-600 cho cảnh báo. */
  valueClassName?: string;
}

/** Thẻ chỉ số tổng quan — dùng cho 4 thẻ metric của tab Overview. */
export function StatCard({ label, value, sub, badge, valueClassName }: StatCardProps) {
  return (
    <Card className="p-5 hover:shadow transition-shadow">
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">
        <span>{label}</span>
        {badge}
      </div>
      <div
        className={`text-2xl font-black tracking-tight ${valueClassName ?? "text-slate-900 dark:text-slate-100"}`}
      >
        {value}
      </div>
      <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">{sub}</div>
    </Card>
  );
}
