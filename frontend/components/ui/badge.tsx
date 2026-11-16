import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "emerald"
  | "amber"
  | "rose"
  | "slate"
  | "indigo"
  | "sky"
  | "blue";

const variantClasses: Record<BadgeVariant, string> = {
  emerald:
    "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800",
  amber:
    "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800",
  rose:
    "bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800",
  slate:
    "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700",
  indigo:
    "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800",
  sky:
    "bg-sky-100 dark:bg-sky-900/40 text-sky-800 dark:text-sky-200 border-sky-200 dark:border-sky-800",
  blue:
    "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

/**
 * Badge/chip trạng thái dùng chung — màu theo variant, hỗ trợ dark mode.
 * Khi màu lấy từ dữ liệu mock (vd: order.channelBadgeColor), bỏ variant và
 * truyền toàn bộ class màu qua className — cn() giữ nguyên màu đó.
 */
export function Badge({ variant, className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border",
        variant ? variantClasses[variant] : undefined,
        className
      )}
      {...props}
    />
  );
}
