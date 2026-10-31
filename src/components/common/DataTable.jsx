import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { EmptyState } from './EmptyState';

export const DataTable = ({
  columns = [],
  data = [],
  keyField = 'id',
  pageSize = 10,
  emptyTitle = 'No data available',
  emptyDescription = 'There are no records matching your current filter.',
  className = '',
}) => {
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = (field) => {
    if (!field) return;
    if (sortField === field) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else {
        setSortField(null);
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortField) return data;
    return [...data].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  if (!data || data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className={`w-full overflow-hidden rounded-2xl glass-table shadow-xs ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/90 bg-slate-50/90 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`py-3.5 px-4 select-none ${col.className || ''} ${
                    col.sortable ? 'cursor-pointer hover:bg-slate-100/90 transition-colors' : ''
                  }`}
                  onClick={() => col.sortable && handleSort(col.accessor)}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="text-slate-400">
                        {sortField === col.accessor ? (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="w-3.5 h-3.5 text-emerald-700" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-emerald-700" />
                          )
                        ) : (
                          <ChevronsUpDown className="w-3.5 h-3.5" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/90 text-sm">
            {paginatedData.map((row, rowIdx) => (
              <tr
                key={row[keyField] || rowIdx}
                className="hover:bg-emerald-50/30 transition-colors duration-150"
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={`py-3.5 px-4 text-slate-700 ${col.cellClassName || ''}`}>
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100/90 px-4 py-3 bg-slate-50/80 text-xs text-slate-500 font-medium">
          <div>
            Showing <span className="font-bold text-slate-700">{(currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-bold text-slate-700">
              {Math.min(currentPage * pageSize, sortedData.length)}
            </span>{' '}
            of <span className="font-bold text-slate-700">{sortedData.length}</span> records
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-xl border border-slate-200/90 bg-white/80 text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-semibold text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-xl border border-slate-200/90 bg-white/80 text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
