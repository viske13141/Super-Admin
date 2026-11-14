import React from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { usePlatformStore } from '../../services/platformStore';

export const ToastNotifications: React.FC = () => {
  const { toasts, dismissToast } = usePlatformStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-[60] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        const icon =
          toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : toast.type === 'error' ? (
            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
          ) : toast.type === 'warning' ? (
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-[#7050F5] shrink-0" />
          );

        return (
          <div
            key={toast.id}
            className="pointer-events-auto bg-white border border-[#E2E8F0] rounded-xl shadow-lg px-4 py-3 flex items-start gap-3"
          >
            <div className="mt-0.5">{icon}</div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#0F172A]">{toast.title}</p>
              {toast.message && (
                <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">{toast.message}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
