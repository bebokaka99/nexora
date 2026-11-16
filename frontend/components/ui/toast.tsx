import { CheckCircle2, X } from "lucide-react";

export interface ToastBannerProps {
  message: string;
  onClose: () => void;
}

/**
 * Banner toast dùng chung ở đầu dashboard — nền emerald-600, tự tắt sau 4s
 * (nơi dùng lo setTimeout qua triggerToast), bấm X để đóng ngay.
 */
export function ToastBanner({ message, onClose }: ToastBannerProps) {
  return (
    <div className="bg-emerald-600 text-white text-xs font-semibold py-2 px-6 flex items-center justify-between shadow-md animate-in slide-in-from-top duration-200">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 shrink-0" />
        <span>{message}</span>
      </div>
      <button onClick={onClose} className="p-0.5 hover:text-emerald-200" aria-label="Đóng thông báo">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
