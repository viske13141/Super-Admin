import React, { useRef } from 'react';
import { FileText, Trash2, UploadCloud } from 'lucide-react';

interface FileUploadProps {
  files: string[];
  onChange: (files: string[]) => void;
  label?: string;
  accept?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  files,
  onChange,
  label = 'Upload supporting files',
  accept = '.pdf,.png,.jpg,.jpeg,.csv',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const names = Array.from(fileList).map((f) => f.name);
    onChange(Array.from(new Set([...files, ...names])));
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        className="border border-dashed border-[#CBD5E1] hover:border-[#7050F5] rounded-xl p-4 bg-[#F9FAFD] cursor-pointer text-center transition-colors"
      >
        <UploadCloud className="w-6 h-6 text-[#7050F5] mx-auto mb-1.5" />
        <p className="text-xs font-medium text-[#0F172A]">Click to attach document</p>
        <p className="text-[11px] text-[#64748B] mt-0.5">PDF, PNG, JPG, CSV supported (demo attachment metadata)</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {files.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {files.map((f) => (
            <li
              key={f}
              className="flex items-center justify-between px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs"
            >
              <span className="inline-flex items-center gap-2 text-[#0F172A] truncate">
                <FileText className="w-3.5 h-3.5 text-[#7050F5] shrink-0" />
                <span className="truncate">{f}</span>
              </span>
              <button
                type="button"
                onClick={() => onChange(files.filter((x) => x !== f))}
                aria-label={`Remove ${f}`}
                className="text-slate-400 hover:text-rose-600 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
