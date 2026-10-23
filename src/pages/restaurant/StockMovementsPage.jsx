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

export const StockMovementsPage = () => {
  const { restaurantMovements, addToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
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
      header: 'Date & Time',
      accessor: 'timestamp',
      sortable: true,
      render: (row) => (
        <div className="text-xs">
          <div className="font-semibold text-slate-800">
            {new Date(row.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <div className="text-slate-400">
            {new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      ),
    },
    {
      header: 'Ingredient & Batch',
      accessor: 'ingredientName',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.ingredientName}</div>
          <div className="text-[11px] font-mono text-emerald-800 font-semibold mt-0.5">
            {row.batchNumber || 'Batch N/A'}
          </div>
        </div>
      ),
    },
    {
      header: 'Movement Type',
      accessor: 'type',
      sortable: true,
      render: (row) => <Badge status={row.type} />,
    },
    {
      header: 'Delta Quantity',
      accessor: 'quantity',
      sortable: true,
      render: (row) => (
        <div className="font-bold text-sm">
          {row.quantity > 0 ? (
            <span className="text-emerald-700 flex items-center gap-0.5">
              <ArrowUpRight className="w-4 h-4 inline" /> +{row.quantity} {row.unit}
            </span>
          ) : (
            <span className="text-rose-600 flex items-center gap-0.5">
              <ArrowDownRight className="w-4 h-4 inline" /> {row.quantity} {row.unit}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Stock Before -> After',
      accessor: 'qtyAfter',
      render: (row) => (
        <div className="text-xs text-slate-600">
          <span>{row.qtyBefore} {row.unit}</span>
          <span className="mx-1 text-slate-400">→</span>
          <span className="font-bold text-slate-900">{row.qtyAfter} {row.unit}</span>
        </div>
      ),
    },
    {
      header: 'Staff & Reason',
      accessor: 'performedBy',
      render: (row) => (
        <div className="text-xs max-w-xs">
          <div className="font-semibold text-slate-800">
            {row.performedBy} <span className="text-[10px] text-slate-400 font-normal">({row.role})</span>
          </div>
          <div className="text-slate-500 truncate mt-0.5">{row.reason}</div>
        </div>
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
            onClick={handleExportCSV}
          >
            Export Ledger (CSV)
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
    </div>
  );
};

