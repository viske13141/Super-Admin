import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface KPIStatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgClass?: string;
  deltaText?: string;
  deltaDirection?: 'up' | 'down' | 'neutral';
  deltaPositive?: boolean;
  subText?: string;
  onClick?: () => void;
  loading?: boolean;
}

export const KPIStatCard: React.FC<KPIStatCardProps> = ({
  label,
  value,
  icon,
  iconBgClass = 'bg-[#EFEAFF] text-[#7050F5]',
  deltaText,
  deltaDirection = 'up',
  deltaPositive = true,
  subText,
  onClick,
  loading = false,
}) => {
  const isClickable = Boolean(onClick);
  const Wrapper = isClickable ? 'button' : 'div';

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#E8EBF4] p-4 shadow-[0_1px_3px_rgba(15,23,42,0.03)] animate-pulse">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-slate-100 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-24 bg-slate-100 rounded" />
            <div className="h-7 w-28 bg-slate-200 rounded" />
            <div className="h-3 w-32 bg-slate-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Wrapper
      type={isClickable ? 'button' : undefined}
      onClick={onClick}
      className={`w-full text-left bg-white rounded-2xl border border-[#E8EBF4] p-4 shadow-[0_1px_3px_rgba(15,23,42,0.03)] transition-all duration-150 ${
        isClickable
          ? 'hover:border-[#7050F5]/40 hover:shadow-[0_4px_14px_rgba(112,80,245,0.08)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7050F5]'
          : ''
      }`}
    >
      <div className="flex items-start gap-3.5">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBgClass}`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-[#64748B] truncate">{label}</p>
          <p className="mt-1 text-[24px] leading-tight font-bold text-[#0F172A] tabular-nums tracking-tight truncate">
            {value}
          </p>
          <div className="mt-1.5 flex items-center gap-1.5 text-xs flex-wrap">
            {deltaText && (
              <span
                className={`inline-flex items-center gap-0.5 font-semibold tabular-nums whitespace-nowrap ${
                  deltaPositive ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {deltaDirection === 'up' ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                )}
                {deltaText}
              </span>
            )}
            {subText && <span className="text-[#64748B] truncate">{subText}</span>}
          </div>
        </div>
      </div>
    </Wrapper>
  );
};
