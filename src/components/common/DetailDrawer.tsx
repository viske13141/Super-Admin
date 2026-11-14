import React from 'react';
import { X } from 'lucide-react';

interface DetailDrawerProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  widthClass?: string;
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({
  open,
  title,
  subtitle,
  onClose,
  children,
  footer,
  widthClass = 'max-w-xl',
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-[1px]">
      <div className="fixed inset-0" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        className={`relative bg-white w-full ${widthClass} h-full shadow-2xl border-l border-[#E2E8F0] flex flex-col z-10`}
      >
        <div className="px-6 py-4 border-b border-[#E8EBF4] flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-[#0F172A] truncate">{title}</h3>
            {subtitle && <p className="text-xs text-[#64748B] mt-0.5 truncate">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">{children}</div>

        {footer && (
          <div className="px-6 py-3.5 bg-[#F8FAFC] border-t border-[#E8EBF4] flex items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </aside>
    </div>
  );
};
