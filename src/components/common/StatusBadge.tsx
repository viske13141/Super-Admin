import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  PauseCircle,
  ShieldAlert,
  XCircle,
} from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<
  string,
  { bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  Active: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200/80',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />,
  },
  Operational: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200/80',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />,
  },
  Verified: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200/80',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />,
  },
  Paid: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200/80',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />,
  },
  Succeeded: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200/80',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />,
  },
  Success: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200/80',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />,
  },
  Connected: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200/80',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />,
  },
  Published: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200/80',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />,
  },
  Resolved: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200/80',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />,
  },
  Processed: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200/80',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />,
  },
  Approved: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200/80',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />,
  },
  Healthy: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200/80',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />,
  },
  Enforced: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200/80',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />,
  },
  Trial: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200/80',
    icon: <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />,
  },
  Scheduled: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200/80',
    icon: <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />,
  },
  'In Progress': {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200/80',
    icon: <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />,
  },
  Open: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200/80',
    icon: <AlertTriangle className="w-3.5 h-3.5 text-blue-600 shrink-0" />,
  },
  Pending: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200/80',
    icon: <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />,
  },
  'Pending Verification': {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200/80',
    icon: <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />,
  },
  'Pending Review': {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200/80',
    icon: <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />,
  },
  'Pending Approval': {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200/80',
    icon: <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />,
  },
  'Pending Invitation': {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200/80',
    icon: <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />,
  },
  'Expiring Soon': {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200/80',
    icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />,
  },
  'Waiting for Customer': {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200/80',
    icon: <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />,
  },
  Degraded: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200/80',
    icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />,
  },
  High: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200/80',
    icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />,
  },
  Paused: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    icon: <PauseCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />,
  },
  Inactive: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-200',
    icon: <PauseCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />,
  },
  Draft: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    icon: <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />,
  },
  Archived: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-200',
    icon: <PauseCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />,
  },
  Closed: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-200',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />,
  },
  Suspended: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200/80',
    icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />,
  },
  Deactivated: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200/80',
    icon: <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />,
  },
  Locked: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200/80',
    icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />,
  },
  Critical: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200/80',
    icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />,
  },
  Overdue: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200/80',
    icon: <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />,
  },
  Failed: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200/80',
    icon: <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />,
  },
  Denied: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200/80',
    icon: <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />,
  },
  Rejected: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200/80',
    icon: <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />,
  },
  Disconnected: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200/80',
    icon: <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />,
  },
  Down: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200/80',
    icon: <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />,
  },
  Cancelled: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-200',
    icon: <XCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />,
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const cfg = STATUS_CONFIG[status] ?? {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    icon: null,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-medium whitespace-nowrap shrink-0 ${cfg.bg} ${cfg.text} ${cfg.border} ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      }`}
    >
      {cfg.icon}
      <span>{status}</span>
    </span>
  );
};
