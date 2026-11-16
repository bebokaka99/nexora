import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Mặt phẳng card dùng chung NEXORA — nền trắng / slate-900 khi dark,
 * border slate, bo 2xl. Padding do nơi dùng quyết định (p-4 / p-5 / p-6).
 */
export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm",
        className
      )}
      {...props}
    />
  );
}
