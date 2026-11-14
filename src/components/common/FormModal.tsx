import React from 'react';
import { X } from 'lucide-react';

interface FormModalProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidthClass?: string;
}

export const FormModal: React.FC<FormModalProps> = ({
  open,
  title,
  subtitle,
  onClose,
  children,
  footer,
  maxWidthClass = 'max-w-2xl',
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl w-full ${maxWidthClass} max-h-[90vh] flex flex-col overflow-hidden`}
      >
        <div className="px-6 py-4 border-b border-[#E8EBF4] flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-[#0F172A]">{title}</h3>
            {subtitle && <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
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
      </div>
    </div>
  );
};
