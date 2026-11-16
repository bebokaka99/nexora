import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Bảng dùng chung kiểu dashboard NEXORA — header xám nhạt, hàng hover,
 * chữ xs, hỗ trợ dark mode. Dùng ở tab Đơn hàng và tab Tồn kho.
 */

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full text-left text-xs", className)}>{children}</table>
    </div>
  );
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs">
      {children}
    </thead>
  );
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{children}</tbody>;
}

export function TableRow({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        "hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHeaderCell({
  children,
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn("py-3.5 px-4", className)} {...props}>{children}</th>;
}

export function TableCell({
  children,
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("py-3.5 px-4", className)} {...props}>{children}</td>;
}
