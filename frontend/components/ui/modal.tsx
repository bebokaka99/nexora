import * as React from "react";
import { cn } from "@/lib/utils";

export type ModalSize = "sm" | "md" | "lg";

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

export interface ModalProps {
  children: React.ReactNode;
  /** sm = receipt, md = transfer, lg = order/store (mặc định lg) */
  size?: ModalSize;
  className?: string;
  overlayClassName?: string;
}

/**
 * Khung modal dùng chung — overlay mờ + panel trắng/slate-900, animation
 * animate-in (tailwindcss-animate đã có trong plugins). Nơi dùng render
 * có điều kiện ({open && <Modal>}) và tự lo header/body/footer.
 */
export function Modal({
  children,
  size = "lg",
  className,
  overlayClassName,
}: ModalProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4",
        overlayClassName
      )}
    >
      <div
        className={cn(
          "bg-white dark:bg-slate-900 rounded-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-150",
          sizeClasses[size],
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
