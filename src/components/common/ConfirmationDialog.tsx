import React, { useEffect, useState } from 'react';
import { AlertTriangle, ShieldCheck, X } from 'lucide-react';

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  requireReason?: boolean;
  reasonPlaceholder?: string;
  requireReauth?: boolean;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  requireReason = false,
  reasonPlaceholder = 'Enter audit reason / justification...',
  requireReauth = false,
  onConfirm,
  onCancel,
}) => {
  const [reason, setReason] = useState('');
  const [reauthCode, setReauthCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setReason('');
      setReauthCode('');
      setError('');
    }
  }, [open]);

  if (!open) return null;

  const handleConfirm = () => {
    if (requireReason && reason.trim().length < 4) {
      setError('Please enter a brief justification (min 4 characters) for the audit log.');
      return;
    }
    if (requireReauth && reauthCode.trim().length < 4) {
      setError('Enter your 6-digit MFA code or admin password to authorize this privileged operation.');
      return;
    }
    onConfirm(reason.trim() || undefined);
  };

  const btnStyle =
    variant === 'danger'
      ? 'bg-rose-600 hover:bg-rose-700 text-white'
      : variant === 'warning'
      ? 'bg-amber-600 hover:bg-amber-700 text-white'
      : 'bg-[#7050F5] hover:bg-[#5E3DE6] text-white';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  variant === 'danger'
                    ? 'bg-rose-50 text-rose-600'
                    : variant === 'warning'
                    ? 'bg-amber-50 text-amber-600'
                    : 'bg-[#EFEAFF] text-[#7050F5]'
                }`}
              >
                {requireReauth ? (
                  <ShieldCheck className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 id="confirm-dialog-title" className="text-base font-semibold text-[#0F172A]">
                  {title}
                </h3>
                <p className="mt-1.5 text-sm text-[#64748B] leading-relaxed">{description}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onCancel}
              aria-label="Close dialog"
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {requireReason && (
            <div className="mt-4">
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                Audit Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setError('');
                }}
                placeholder={reasonPlaceholder}
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7050F5]/30 focus:border-[#7050F5]"
              />
            </div>
          )}

          {requireReauth && (
            <div className="mt-4">
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                Privileged Re-Authentication (MFA / Admin Passcode){' '}
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                value={reauthCode}
                onChange={(e) => {
                  setReauthCode(e.target.value);
                  setError('');
                }}
                placeholder="Enter 6-digit TOTP or admin password (demo: any 4+ chars)"
                className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7050F5]/30 focus:border-[#7050F5]"
              />
            </div>
          )}

          {error && <p className="mt-2 text-xs text-rose-600 font-medium">{error}</p>}
        </div>

        <div className="px-5 py-3.5 bg-[#F8FAFC] border-t border-[#E8EBF4] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-[#0F172A] bg-white border border-[#E2E8F0] rounded-lg hover:bg-slate-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${btnStyle}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
