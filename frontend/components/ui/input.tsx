import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * Ô nhập liệu dùng chung NEXORA — ring emerald-600 khi focus, hỗ trợ dark mode.
 * className truyền vào (vd: pl-9 cho icon search, bg-slate-50/50) luôn thắng base.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500",
          className
        )}
        {...props}
      />
    );
  }
);
