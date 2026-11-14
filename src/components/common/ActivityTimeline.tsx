import React from 'react';
import { Clock } from 'lucide-react';
import { formatDateTime } from '../../utils/format';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  actor?: string;
}

export const ActivityTimeline: React.FC<{ items: TimelineItem[] }> = ({ items }) => {
  if (items.length === 0) {
    return <p className="text-sm text-[#64748B]">No activity recorded yet.</p>;
  }

  return (
    <ol className="space-y-4">
      {items.map((item, idx) => (
        <li key={item.id} className="relative pl-6">
          {idx < items.length - 1 && (
            <span
              aria-hidden="true"
              className="absolute left-[7px] top-5 bottom-[-16px] w-px bg-[#E2E8F0]"
            />
          )}
          <span
            aria-hidden="true"
            className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full bg-[#EFEAFF] border-2 border-[#7050F5]"
          />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <p className="text-sm font-medium text-[#0F172A]">{item.title}</p>
            <span className="inline-flex items-center gap-1 text-xs text-[#64748B] tabular-nums whitespace-nowrap">
              <Clock className="w-3 h-3" />
              {formatDateTime(item.timestamp)}
            </span>
          </div>
          {item.description && (
            <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">{item.description}</p>
          )}
          {item.actor && (
            <p className="text-[11px] text-slate-500 mt-0.5">Actor: {item.actor}</p>
          )}
        </li>
      ))}
    </ol>
  );
};
