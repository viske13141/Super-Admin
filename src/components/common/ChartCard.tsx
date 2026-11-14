import React from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  action,
  children,
  className = '',
}) => {
  return (
    <section
      className={`bg-white rounded-2xl border border-[#E8EBF4] p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)] flex flex-col ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h2 className="text-[16px] font-semibold text-[#0F172A] tracking-tight truncate">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[13px] text-[#64748B] mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </section>
  );
};
