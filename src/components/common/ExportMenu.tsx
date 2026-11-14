import React, { useEffect, useRef, useState } from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';

interface ExportMenuProps {
  onExportCSV: () => void;
  onExportPrintPDF?: () => void;
  label?: string;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({
  onExportCSV,
  onExportPrintPDF,
  label = 'Export',
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
        className="h-9 px-3.5 bg-white border border-[#E2E8F0] rounded-lg text-sm font-medium text-[#0F172A] hover:bg-slate-50 inline-flex items-center gap-2 transition-colors whitespace-nowrap"
      >
        <Download className="w-3.5 h-3.5 text-[#64748B]" />
        <span>{label}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl border border-[#E2E8F0] shadow-lg py-1.5 z-40">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onExportCSV();
            }}
            className="w-full px-3.5 py-2 text-left text-[13px] text-[#0F172A] hover:bg-slate-50 flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Download CSV</span>
          </button>
          {onExportPrintPDF && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onExportPrintPDF();
              }}
              className="w-full px-3.5 py-2 text-left text-[13px] text-[#0F172A] hover:bg-slate-50 flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-[#7050F5]" />
              <span>Export / Print PDF</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
