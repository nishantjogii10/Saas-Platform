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
    <div className={`w-full overflow-hidden rounded-2xl border border-[#DCE5EF] bg-white shadow-xs ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#DCE5EF] bg-[#F7F9FC] text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`py-3.5 px-4 select-none ${col.className || ''} ${
                    col.sortable ? 'cursor-pointer hover:bg-slate-100/80 transition-colors' : ''
                  }`}
                  onClick={() => col.sortable && handleSort(col.accessor)}
                >
                  <div className={`flex items-center gap-1.5 ${col.className?.includes('text-right') ? 'justify-end' : col.className?.includes('text-center') ? 'justify-center' : ''}`}>
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="text-slate-400">
                        {sortField === col.accessor ? (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="w-3.5 h-3.5 text-[#075E4B]" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-[#075E4B]" />
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
          <tbody className="divide-y divide-[#DCE5EF] text-sm">
            {paginatedData.map((row, rowIdx) => (
              <tr
                key={row[keyField] || rowIdx}
                className="hover:bg-[#F7F9FC]/80 transition-colors duration-100"
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
        <div className="flex items-center justify-between border-t border-[#DCE5EF] px-4 py-3 bg-[#F7F9FC]/60 text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-700">{(currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-semibold text-slate-700">
              {Math.min(currentPage * pageSize, sortedData.length)}
            </span>{' '}
            of <span className="font-semibold text-slate-700">{sortedData.length}</span> records
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-[#DCE5EF] bg-white text-slate-600 hover:bg-[#F7F9FC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-[#DCE5EF] bg-white text-slate-600 hover:bg-[#F7F9FC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
