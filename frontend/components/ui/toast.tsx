import { CheckCircle2, X, XCircle } from "lucide-react";

export interface ToastBannerProps {
  message: string;
  onClose: () => void;
  /** TASK-016: toast lỗi hiện nền đỏ để phân biệt với toast thành công. */
  variant?: "success" | "error";
}

/**
 * Banner toast dùng chung ở đầu dashboard — nền emerald-600 (thành công)
 * hoặc rose-600 (lỗi), tự tắt sau 4s (nơi dùng lo setTimeout qua
 * triggerToast), bấm X để đóng ngay.
 */
export function ToastBanner({ message, onClose, variant = "success" }: ToastBannerProps) {
  const isError = variant === "error";
  return (
    <div className={`${isError ? "bg-rose-600" : "bg-emerald-600"} text-white text-xs font-semibold py-2 px-6 flex items-center justify-between shadow-md animate-in slide-in-from-top duration-200`}>
      <div className="flex items-center gap-2">
        {isError ? (
          <XCircle className="w-4 h-4 shrink-0" />
        ) : (
          <CheckCircle2 className="w-4 h-4 shrink-0" />
        )}
        <span>{message}</span>
      </div>
      <button onClick={onClose} className={`p-0.5 ${isError ? "hover:text-rose-200" : "hover:text-emerald-200"}`} aria-label="Đóng thông báo">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
