import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  History,
  Download,
  Filter,
  Search,
  ArrowDownRight,
  ArrowUpRight,
  Trash2,
  Sliders,
  User,
  Calendar,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { SearchBar } from '../../components/common/SearchBar';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ColumnExportDialog } from '../../components/common/ColumnExportDialog';

export const StockMovementsPage = () => {
  const { restaurantMovements, currentBranch, addToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all'); // all | received | consumption | wastage | adjustment

  const filteredMovements = restaurantMovements.filter((m) => {
    const matchesSearch =
      m.ingredientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.performedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.reason.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || m.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'ID,Timestamp,Ingredient,Type,Quantity,Unit,Before,After,PerformedBy,Role,Reason,BatchNumber\n' +
      filteredMovements
        .map(
          (m) =>
            `"${m.id}","${m.timestamp}","${m.ingredientName}","${m.type}","${m.quantity}","${m.unit}","${m.qtyBefore}","${m.qtyAfter}","${m.performedBy}","${m.role}","${m.reason}","${m.batchNumber}"`
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StockMate_Stock_Movements_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Stock movement ledger exported to CSV.', 'success');
  };

  const columns = [
    {
      header: 'Date',
      accessor: 'timestamp',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
          {new Date(row.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      ),
    },
    {
      header: 'Time',
      accessor: 'time',
      render: (row) => (
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          {new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      ),
    },
    {
      header: 'Ingredient Name',
      accessor: 'ingredientName',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-slate-900 dark:text-white text-xs">
          {row.ingredientName}
        </span>
      ),
    },
    {
      header: 'Batch Number',
      accessor: 'batchNumber',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-mono text-emerald-800 dark:text-emerald-400 font-semibold">
          {row.batchNumber || 'Batch N/A'}
        </span>
      ),
    },
    {
      header: 'Movement Type',
      accessor: 'type',
      sortable: true,
      render: (row) => <Badge status={row.type} />,
    },
    {
      header: 'Quantity Changed',
      accessor: 'quantity',
      sortable: true,
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <div className="font-bold text-xs inline-block">
          {row.quantity > 0 ? (
            <span className="text-emerald-700 dark:text-emerald-400 flex items-center justify-end gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5 inline" /> +{row.quantity} {row.unit}
            </span>
          ) : (
            <span className="text-rose-600 dark:text-rose-400 flex items-center justify-end gap-0.5">
              <ArrowDownRight className="w-3.5 h-3.5 inline" /> {row.quantity} {row.unit}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Stock Before',
      accessor: 'qtyBefore',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          {row.qtyBefore} {row.unit}
        </span>
      ),
    },
    {
      header: 'Stock After',
      accessor: 'qtyAfter',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
          {row.qtyAfter} {row.unit}
        </span>
      ),
    },
    {
      header: 'Performed By',
      accessor: 'performedBy',
      sortable: true,
      render: (row) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-800 dark:text-slate-200">{row.performedBy}</span>
          <span className="text-[10px] text-slate-400 block font-normal capitalize">{row.role?.replace('_', ' ')}</span>
        </div>
      ),
    },
    {
      header: 'Reason / Purpose',
      accessor: 'reason',
      render: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 max-w-xs truncate block" title={row.reason}>
          {row.reason}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Movement Ledger"
        subtitle="Complete chronological audit trail of all receipts, kitchen consumptions, wastage, and inventory reconciliations"
        breadcrumbs={[
          { label: 'Restaurant', href: '#/dashboard' },
          { label: 'Stock Movements' },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={() => setIsExportOpen(true)}
          >
            Export to Excel
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by ingredient, staff, or reason..."
          className="w-full sm:w-80"
        />

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['all', 'received', 'consumption', 'wastage', 'adjustment'].map((typeKey) => (
            <button
              key={typeKey}
              onClick={() => setTypeFilter(typeKey)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap capitalize transition-all select-none ${
                typeFilter === typeKey
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {typeKey === 'all' ? 'All Movements' : typeKey}
            </button>
          ))}
        </div>
      </div>

      {/* Movements Table */}
      <DataTable
        columns={columns}
        data={filteredMovements}
        pageSize={10}
        emptyTitle="No stock movements recorded"
        emptyDescription="When stock is received, consumed, or recorded as wastage, events appear here."
      />

      <ColumnExportDialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        data={filteredMovements}
        availableColumns={[
          { key: 'timestamp', header: 'Timestamp', format: (val) => new Date(val).toLocaleString('en-IN') },
          { key: 'ingredientName', header: 'Ingredient Name' },
          { key: 'type', header: 'Movement Type', format: (val) => (val || '').toUpperCase() },
          { key: 'quantity', header: 'Quantity Changed', format: (val, row) => `${val > 0 ? '+' : ''}${val} ${row.unit || ''}` },
          { key: 'qtyBefore', header: 'Stock Before', format: (val, row) => `${val} ${row.unit || ''}` },
          { key: 'qtyAfter', header: 'Stock After', format: (val, row) => `${val} ${row.unit || ''}` },
          { key: 'performedBy', header: 'Performed By' },
          { key: 'role', header: 'Operator Role' },
          { key: 'reason', header: 'Reason / Usage Note' },
          { key: 'batchNumber', header: 'Batch Number' },
        ]}
        reportTitle={`Stock Movement Ledger — ${currentBranch?.name || 'Active Branch'}`}
        fileNamePrefix="stockmate_stock_movements"
        filtersSummary={{
          Type: typeFilter.toUpperCase(),
          Search: searchTerm || 'All Logs',
          Outlet: currentBranch?.name || 'All Outlets',
        }}
      />
    </div>
  );
};

