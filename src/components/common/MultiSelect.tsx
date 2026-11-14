import React from 'react';
import { Check } from 'lucide-react';

interface MultiSelectProps<T extends string> {
  options: T[];
  selected: T[];
  onChange: (next: T[]) => void;
  columns?: 1 | 2 | 3;
}

export function MultiSelect<T extends string>({
  options,
  selected,
  onChange,
  columns = 2,
}: MultiSelectProps<T>) {
  const toggle = (opt: T) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((x) => x !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  const gridClass =
    columns === 3
      ? 'grid-cols-1 sm:grid-cols-3'
      : columns === 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : 'grid-cols-1';

  return (
    <div className={`grid gap-2 ${gridClass}`}>
      {options.map((opt) => {
        const isOn = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`px-3 py-2 rounded-xl border text-left text-xs font-medium flex items-center justify-between gap-2 transition-colors ${
              isOn
                ? 'bg-[#F4F2FF] border-[#7050F5]/50 text-[#5B3CE6]'
                : 'bg-white border-[#E2E8F0] text-[#0F172A] hover:bg-slate-50'
            }`}
          >
            <span className="truncate">{opt}</span>
            <span
              className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                isOn ? 'bg-[#7050F5] text-white' : 'border border-slate-300 bg-white'
              }`}
            >
              {isOn && <Check className="w-3 h-3" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
