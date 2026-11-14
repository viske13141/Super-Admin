import React, { useEffect, useRef, useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { DateRangePreset, DateRangeSelection } from '../../types';

interface DateRangePickerProps {
  value: DateRangeSelection;
  onChange: (val: DateRangeSelection) => void;
}

const PRESET_OPTIONS: { preset: DateRangePreset; label: string; startDate: string; endDate: string }[] = [
  { preset: 'today', label: 'Today (Jan 31, 2025)', startDate: '2025-01-31', endDate: '2025-01-31' },
  { preset: 'yesterday', label: 'Yesterday (Jan 30, 2025)', startDate: '2025-01-30', endDate: '2025-01-30' },
  { preset: 'last_7_days', label: 'Last 7 days', startDate: '2025-01-25', endDate: '2025-01-31' },
  { preset: 'last_30_days', label: 'Last 30 days', startDate: '2025-01-02', endDate: '2025-01-31' },
  { preset: 'this_month', label: 'Jan 1, 2025 – Jan 31, 2025', startDate: '2025-01-01', endDate: '2025-01-31' },
  { preset: 'last_month', label: 'Last month (Dec 2024)', startDate: '2024-12-01', endDate: '2024-12-31' },
  { preset: 'this_quarter', label: 'This quarter (Q4 FY25)', startDate: '2025-01-01', endDate: '2025-03-31' },
  { preset: 'this_year', label: 'This year (FY 2024–25)', startDate: '2024-04-01', endDate: '2025-03-31' },
];

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [customStart, setCustomStart] = useState(value.startDate);
  const [customEnd, setCustomEnd] = useState(value.endDate);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="h-9 px-3.5 bg-white border border-[#E2E8F0] rounded-xl text-[13px] font-medium text-[#0F172A] inline-flex items-center gap-2 hover:border-[#7050F5]/50 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-colors whitespace-nowrap"
      >
        <Calendar className="w-4 h-4 text-[#64748B]" />
        <span>{value.label}</span>
        <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-[#E2E8F0] shadow-xl p-2 z-40">
          <div className="space-y-0.5">
            {PRESET_OPTIONS.map((opt) => {
              const active = value.preset === opt.preset;
              return (
                <button
                  key={opt.preset}
                  type="button"
                  onClick={() => {
                    onChange({
                      preset: opt.preset,
                      label: opt.label,
                      startDate: opt.startDate,
                      endDate: opt.endDate,
                    });
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-[13px] transition-colors ${
                    active
                      ? 'bg-[#EFEAFF] text-[#5B3CE6] font-semibold'
                      : 'text-[#0F172A] hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div className="mt-2 pt-2 border-t border-[#E8EBF4] px-2 pb-1">
            <p className="text-[11px] font-semibold text-[#64748B] mb-2">Custom range</p>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="h-8 px-2 text-xs border border-[#E2E8F0] rounded-lg"
              />
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="h-8 px-2 text-xs border border-[#E2E8F0] rounded-lg"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if (!customStart || !customEnd) return;
                onChange({
                  preset: 'custom',
                  label: `${customStart} – ${customEnd}`,
                  startDate: customStart,
                  endDate: customEnd,
                });
                setOpen(false);
              }}
              className="mt-2 w-full h-8 rounded-lg bg-[#7050F5] hover:bg-[#5E3DE6] text-white text-xs font-medium transition-colors"
            >
              Apply Custom Range
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
