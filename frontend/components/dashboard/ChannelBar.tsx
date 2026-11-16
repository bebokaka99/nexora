export interface ChannelBarProps {
  label: string;
  amountLabel: string;
  percent: number;
  /** Class màu của thanh (vd: bg-amber-500, bg-emerald-600). */
  barClassName: string;
  /** Class màu của chấm tròn (vd: bg-amber-500). */
  dotClassName: string;
}

/** Một dòng thanh tỷ trọng doanh thu theo kênh — dùng ở tab Overview. */
export function ChannelBar({ label, amountLabel, percent, barClassName, dotClassName }: ChannelBarProps) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${dotClassName}`} />
          {label}
        </span>
        <span className="font-bold text-slate-900 dark:text-slate-100">{amountLabel}</span>
      </div>
      <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${barClassName}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
