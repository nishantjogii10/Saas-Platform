import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  Download,
  X,
  Check,
  CheckSquare,
  Square,
  ArrowUp,
  ArrowDown,
  FileSpreadsheet,
  FileText,
  Filter,
  Eye,
  Info,
  Layers,
} from 'lucide-react';
import { Button } from './Button';

/**
 * Sensitive fields to never export
 */
const SENSITIVE_KEYS = new Set([
  'password',
  'passwordHash',
  'pin',
  'secret',
  'token',
  'apiKey',
  'internalId',
  'isDeleted',
  'deletedAt',
]);

export const ColumnExportDialog = ({
  isOpen,
  onClose,
  data = [],
  currentPageData = null,
  availableColumns = [],
  reportTitle = 'StockMate Report',
  fileNamePrefix = 'stockmate_report',
  filtersSummary = null,
}) => {
  // Columns state (allows reordering)
  const [columns, setColumns] = useState([]);
  const [selectedColIds, setSelectedColIds] = useState(new Set());
  const [exportFormat, setExportFormat] = useState('xlsx'); // 'xlsx' | 'csv'
  const [exportScope, setExportScope] = useState('all'); // 'all' | 'page'
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  // Initialize columns when dialog opens or availableColumns change
  useEffect(() => {
    if (isOpen && availableColumns.length > 0) {
      // Filter out sensitive columns
      const safeCols = availableColumns.filter(
        (col) => !SENSITIVE_KEYS.has(col.key || col.id || col.accessor)
      );
      setColumns(safeCols);

      // Select default columns (or all by default)
      const initialSelected = new Set(
        safeCols
          .filter((col) => col.defaultSelected !== false)
          .map((col) => col.key || col.id || col.accessor)
      );
      setSelectedColIds(initialSelected);
      setExportScope('all');
    }
  }, [isOpen, availableColumns]);

  if (!isOpen) return null;

  const totalRecordCount = data.length;
  const pageRecordCount = currentPageData ? currentPageData.length : totalRecordCount;
  const effectiveData = exportScope === 'page' && currentPageData ? currentPageData : data;

  const toggleColumn = (colId) => {
    setSelectedColIds((prev) => {
      const next = new Set(prev);
      if (next.has(colId)) {
        if (next.size > 1) {
          next.delete(colId);
        }
      } else {
        next.add(colId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    const allIds = new Set(columns.map((c) => c.key || c.id || c.accessor));
    setSelectedColIds(allIds);
  };

  const handleClearAll = () => {
    // Keep at least the first column selected to avoid empty export
    if (columns.length > 0) {
      setSelectedColIds(new Set([columns[0].key || columns[0].id || columns[0].accessor]));
    }
  };

  // Move column up in order
  const moveColumn = (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= columns.length) return;

    const updated = [...columns];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setColumns(updated);
  };

  // The active columns in user order that are selected
  const activeColumns = useMemo(() => {
    return columns.filter((col) => {
      const id = col.key || col.id || col.accessor;
      return selectedColIds.has(id);
    });
  }, [columns, selectedColIds]);

  // Format value for Excel cell
  const getFormattedValue = (row, col) => {
    const key = col.key || col.id || col.accessor;
    if (col.format && typeof col.format === 'function') {
      return col.format(row[key], row);
    }
    const val = row[key];
    if (val === null || val === undefined) return '';
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    if (Array.isArray(val)) return val.join(', ');
    if (typeof val === 'object') return JSON.stringify(val);
    return val;
  };

  // Perform the actual export
  const handleExport = () => {
    if (activeColumns.length === 0 || effectiveData.length === 0) return;

    const wb = XLSX.utils.book_new();

    // Prepare table rows
    const exportRows = [];

    // Optional metadata header rows
    if (includeMetadata) {
      exportRows.push([reportTitle.toUpperCase()]);
      exportRows.push([`Generated On: ${new Date().toLocaleString('en-IN')}`]);
      exportRows.push([`Records Exported: ${effectiveData.length} records`]);

      if (filtersSummary) {
        if (typeof filtersSummary === 'object') {
          const filterParts = Object.entries(filtersSummary)
            .filter(([_, v]) => v && v !== 'all')
            .map(([k, v]) => `${k}: ${v}`)
            .join(' | ');
          if (filterParts) {
            exportRows.push([`Applied Filters: ${filterParts}`]);
          }
        } else {
          exportRows.push([`Applied Filters: ${filtersSummary}`]);
        }
      }

      exportRows.push([]); // blank separator row
    }

    // Column Headers
    const headerRow = activeColumns.map((col) => col.header || col.label || col.name || col.key);
    exportRows.push(headerRow);

    // Data Rows
    effectiveData.forEach((row) => {
      const rowData = activeColumns.map((col) => getFormattedValue(row, col));
      exportRows.push(rowData);
    });

    // Create Sheet
    const ws = XLSX.utils.aoa_to_sheet(exportRows);

    // Auto-fit column widths
    const colWidths = activeColumns.map((col, idx) => {
      let maxLen = (col.header || col.label || '').length + 4;
      effectiveData.slice(0, 50).forEach((row) => {
        const val = String(getFormattedValue(row, col) || '');
        if (val.length > maxLen) maxLen = Math.min(val.length + 3, 40);
      });
      return { wch: Math.max(maxLen, 12) };
    });
    ws['!cols'] = colWidths;

    // Append sheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Report Data');

    // Build timestamped filename
    const dateStamp = new Date().toISOString().split('T')[0];
    const cleanPrefix = (fileNamePrefix || 'stockmate_report').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${cleanPrefix}_${dateStamp}.${exportFormat}`;

    if (exportFormat === 'csv') {
      XLSX.writeFile(wb, filename, { bookType: 'csv' });
    } else {
      XLSX.writeFile(wb, filename, { bookType: 'xlsx' });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Export to Excel / CSV
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {reportTitle} • Customize columns, scope, and file format
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Export Settings: Format & Record Scope */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Format Selector */}
            <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                File Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setExportFormat('xlsx')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    exportFormat === 'xlsx'
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Excel (.xlsx)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setExportFormat('csv')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    exportFormat === 'csv'
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>CSV (.csv)</span>
                </button>
              </div>
            </div>

            {/* Scope Selector */}
            <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Export Scope
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setExportScope('all')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border text-xs font-semibold transition-all ${
                    exportScope === 'all'
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>All Filtered</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                    {totalRecordCount}
                  </span>
                </button>
                <button
                  type="button"
                  disabled={!currentPageData}
                  onClick={() => setExportScope('page')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border text-xs font-semibold transition-all ${
                    !currentPageData
                      ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent'
                      : exportScope === 'page'
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>Current Page</span>
                  {currentPageData && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                      {pageRecordCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Column Selection & Reordering */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Select Columns to Export
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {selectedColIds.size} of {columns.length} selected
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  Select All
                </button>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Columns List with Reorder Controls */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800/80 max-h-60 overflow-y-auto bg-slate-50/30 dark:bg-slate-900/30">
              {columns.map((col, idx) => {
                const id = col.key || col.id || col.accessor;
                const isSelected = selectedColIds.has(id);
                return (
                  <div
                    key={id}
                    className={`flex items-center justify-between px-3.5 py-2.5 transition-colors ${
                      isSelected
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <label className="flex items-center gap-3 cursor-pointer select-none flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleColumn(id)}
                        className="w-4 h-4 rounded text-emerald-800 focus:ring-emerald-700 border-slate-300 dark:border-slate-700"
                      />
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {col.header || col.label || col.name || col.key}
                      </span>
                    </label>

                    {/* Column Reordering buttons */}
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveColumn(idx, 'up')}
                        title="Move column up"
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === columns.length - 1}
                        onClick={() => moveColumn(idx, 'down')}
                        title="Move column down"
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Options: Include Report Header Metadata */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 text-xs">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeMetadata}
                onChange={(e) => setIncludeMetadata(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-800 focus:ring-emerald-700 border-slate-300 dark:border-slate-700"
              />
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Include summary header (title, export timestamp, active filters)
              </span>
            </label>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showPreview ? 'Hide Preview' : 'Preview Data'}</span>
            </button>
          </div>

          {/* Live Quick Preview */}
          {showPreview && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                First 3 Sample Rows (Selected Columns Only)
              </div>
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl max-h-40">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold sticky top-0">
                    <tr>
                      {activeColumns.map((col, idx) => (
                        <th key={idx} className="p-2 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap">
                          {col.header || col.label || col.key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                    {effectiveData.slice(0, 3).map((row, rIdx) => (
                      <tr key={rIdx}>
                        {activeColumns.map((col, cIdx) => (
                          <td key={cIdx} className="p-2 whitespace-nowrap">
                            {String(getFormattedValue(row, col) ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="text-xs text-slate-500">
            Exporting <strong className="text-slate-800 dark:text-slate-200">{effectiveData.length}</strong> records across{' '}
            <strong className="text-slate-800 dark:text-slate-200">{selectedColIds.size}</strong> columns
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="brand"
              size="sm"
              icon={Download}
              onClick={handleExport}
              disabled={selectedColIds.size === 0 || effectiveData.length === 0}
            >
              Download {exportFormat.toUpperCase()}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
