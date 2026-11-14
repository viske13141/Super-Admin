import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { TableSkeleton } from './LoadingSkeleton';
import { Pagination } from './Pagination';

export interface ColumnDef<T> {
  key: string;
  header: string;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  render: (row: T) => React.ReactNode;
  widthClass?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  rowKey: (row: T) => string;
  loading?: boolean;
  error?: string | null;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  selectable?: boolean;
  selectedKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;
  onRowClick?: (row: T) => void;
  initialPageSize?: number;
  toolbar?: React.ReactNode;
  bulkActions?: React.ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  rowKey,
  loading = false,
  error = null,
  emptyTitle = 'No matching records',
  emptyDescription = 'Try adjusting your search or filter criteria.',
  emptyAction,
  selectable = false,
  selectedKeys = [],
  onSelectionChange,
  onRowClick,
  initialPageSize = 10,
  toolbar,
  bulkActions,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col || !col.sortValue) return data;
    const copy = [...data];
    copy.sort((a, b) => {
      const va = col.sortValue!(a);
      const vb = col.sortValue!(b);
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortDir === 'asc' ? va - vb : vb - va;
      }
      return sortDir === 'asc'
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });
    return copy;
  }, [data, columns, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageData = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, safePage, pageSize]);

  const allPageKeys = pageData.map(rowKey);
  const allPageSelected =
    allPageKeys.length > 0 && allPageKeys.every((k) => selectedKeys.includes(k));

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const toggleAllOnPage = () => {
    if (!onSelectionChange) return;
    if (allPageSelected) {
      onSelectionChange(selectedKeys.filter((k) => !allPageKeys.includes(k)));
    } else {
      const merged = Array.from(new Set([...selectedKeys, ...allPageKeys]));
      onSelectionChange(merged);
    }
  };

  const toggleOne = (key: string) => {
    if (!onSelectionChange) return;
    if (selectedKeys.includes(key)) {
      onSelectionChange(selectedKeys.filter((k) => k !== key));
    } else {
      onSelectionChange([...selectedKeys, key]);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E8EBF4] shadow-[0_1px_3px_rgba(15,23,42,0.03)] overflow-hidden">
      {(toolbar || (selectable && selectedKeys.length > 0 && bulkActions)) && (
        <div className="px-4 py-3 border-b border-[#E8EBF4] flex flex-col gap-3">
          {toolbar}
          {selectable && selectedKeys.length > 0 && bulkActions && (
            <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 rounded-xl bg-[#F4F2FF] border border-[#7050F5]/20 text-xs">
              <span className="font-semibold text-[#5B3CE6] tabular-nums">
                {selectedKeys.length} row{selectedKeys.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-2 flex-wrap">{bulkActions}</div>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={6} cols={columns.length} />
      ) : error ? (
        <div className="p-8 text-center text-sm text-rose-600">{error}</div>
      ) : pageData.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E8EBF4] bg-[#F9FAFD] text-[12px] font-semibold text-[#64748B]">
                {selectable && (
                  <th className="py-3 pl-4 pr-2 w-10">
                    <input
                      type="checkbox"
                      aria-label="Select all rows on page"
                      checked={allPageSelected}
                      onChange={toggleAllOnPage}
                      className="w-4 h-4 rounded border-slate-300 text-[#7050F5] focus:ring-[#7050F5]"
                    />
                  </th>
                )}
                {columns.map((col) => {
                  const alignClass =
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                      ? 'text-center'
                      : 'text-left';
                  return (
                    <th
                      key={col.key}
                      className={`py-3 px-3.5 whitespace-nowrap ${alignClass} ${col.widthClass ?? ''}`}
                    >
                      {col.sortable && col.sortValue ? (
                        <button
                          type="button"
                          onClick={() => toggleSort(col.key)}
                          className="inline-flex items-center gap-1 hover:text-[#0F172A] transition-colors"
                        >
                          <span>{col.header}</span>
                          {sortKey === col.key ? (
                            sortDir === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-[#7050F5]" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-[#7050F5]" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-400" />
                          )}
                        </button>
                      ) : (
                        col.header
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F3F9] text-[13px] text-[#0F172A]">
              {pageData.map((row) => {
                const key = rowKey(row);
                const isSelected = selectedKeys.includes(key);
                return (
                  <tr
                    key={key}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={`transition-colors ${
                      isSelected ? 'bg-[#F6F4FF]' : 'hover:bg-[#F9FAFD]'
                    } ${onRowClick ? 'cursor-pointer' : ''}`}
                  >
                    {selectable && (
                      <td
                        className="py-3 pl-4 pr-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          aria-label={`Select row ${key}`}
                          checked={isSelected}
                          onChange={() => toggleOne(key)}
                          className="w-4 h-4 rounded border-slate-300 text-[#7050F5] focus:ring-[#7050F5]"
                        />
                      </td>
                    )}
                    {columns.map((col) => {
                      const alignClass =
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left';
                      return (
                        <td
                          key={col.key}
                          className={`py-3 px-3.5 align-middle ${alignClass}`}
                        >
                          {col.render(row)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && sortedData.length > 0 && (
        <Pagination
          page={safePage}
          pageSize={pageSize}
          totalItems={sortedData.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}
    </div>
  );
}
