import React, { useEffect, useRef, useState } from 'react';
import { Filter } from 'lucide-react';

interface FilterPopoverProps {
  activeCount: number;
  onClear: () => void;
  children: React.ReactNode;
}

export const FilterPopover: React.FC<FilterPopoverProps> = ({
  activeCount,
  onClear,
  children,
}) => {
  const [open, setOpen] = useState(false);
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
        className={`h-9 px-3.5 rounded-lg border text-sm font-medium inline-flex items-center gap-2 transition-colors whitespace-nowrap ${
          activeCount > 0
            ? 'bg-[#F4F2FF] border-[#7050F5]/40 text-[#5B3CE6]'
            : 'bg-white border-[#E2E8F0] text-[#0F172A] hover:bg-slate-50'
        }`}
      >
        <Filter className="w-3.5 h-3.5" />
        <span>Filters</span>
        {activeCount > 0 && (
          <span className="px-1.5 py-0.5 text-[11px] font-semibold rounded bg-[#7050F5] text-white tabular-nums">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-[#E2E8F0] shadow-xl p-4 z-40">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-[#0F172A]">Filter Records</span>
            {activeCount > 0 && (
              <button
                type="button"
                onClick={onClear}
                className="text-xs font-medium text-[#7050F5] hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">{children}</div>
        </div>
      )}
    </div>
  );
};
