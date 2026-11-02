import React, { useState, useMemo } from 'react';
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
  Layers,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  X,
  PackageCheck,
  Utensils,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { DataTable } from '../../components/common/DataTable';
import { ColumnExportDialog } from '../../components/common/ColumnExportDialog';

export const StockMovementsPage = () => {
  const { restaurantMovements = [], currentBranch, addToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all'); // all | received | consumption | wastage | adjustment

  const summary = useMemo(() => {
    let received = 0;
    let consumption = 0;
    let wastage = 0;
    let adjustment = 0;

    (restaurantMovements || []).forEach((m) => {
      if (m.type === 'received') received++;
      else if (m.type === 'consumption') consumption++;
      else if (m.type === 'wastage') wastage++;
      else if (m.type === 'adjustment') adjustment++;
    });

    return {
      total: (restaurantMovements || []).length,
      received,
      consumption,
      wastage,
      adjustment,
    };
  }, [restaurantMovements]);

  const filteredMovements = useMemo(() => {
    return (restaurantMovements || []).filter((m) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        (m.ingredientName && m.ingredientName.toLowerCase().includes(q)) ||
        (m.performedBy && m.performedBy.toLowerCase().includes(q)) ||
        (m.reason && m.reason.toLowerCase().includes(q)) ||
        (m.batchNumber && m.batchNumber.toLowerCase().includes(q));

      const matchesType = typeFilter === 'all' || m.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [restaurantMovements, searchTerm, typeFilter]);

  const columns = [
    {
      header: 'Date & Time',
      accessor: 'timestamp',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900 text-xs block">
            {new Date(row.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      ),
    },
    {
      header: 'Ingredient & Batch',
      accessor: 'ingredientName',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900 text-sm block">
            {row.ingredientName}
          </span>
          <span className="text-[11px] font-mono text-emerald-700 font-semibold">
            {row.batchNumber || 'Batch N/A'}
          </span>
        </div>
      ),
    },
    {
      header: 'Movement Type',
      accessor: 'type',
      sortable: true,
      render: (row) => {
        switch (row.type) {
          case 'received':
            return (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Restock (GRN)
              </span>
            );
          case 'consumption':
            return (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Kitchen Prep
              </span>
            );
          case 'wastage':
            return (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                Wastage / Expired
              </span>
            );
          default:
            return (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Adjustment
              </span>
            );
        }
      },
    },
    {
      header: 'Qty Change',
      accessor: 'quantity',
      sortable: true,
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => {
        const isPositive = row.type === 'received' || Number(row.quantity) > 0;
        return (
          <span className={`text-sm font-bold ${isPositive ? 'text-emerald-700' : 'text-slate-800'}`}>
            {isPositive ? `+${Math.abs(row.quantity)}` : `-${Math.abs(row.quantity)}`} {row.unit}
          </span>
        );
      },
    },
    {
      header: 'Balance',
      accessor: 'qtyAfter',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <div className="text-xs">
          <span className="font-bold text-slate-800">{row.qtyAfter} {row.unit}</span>
          <span className="text-[10px] text-slate-400 block">From {row.qtyBefore} {row.unit}</span>
        </div>
      ),
    },
    {
      header: 'Logged By',
      accessor: 'performedBy',
      sortable: true,
      render: (row) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-800">{row.performedBy}</span>
          <span className="text-[10px] text-slate-400 block capitalize">{row.role?.replace('_', ' ')}</span>
        </div>
      ),
    },
    {
      header: 'Reason / Purpose',
      accessor: 'reason',
      render: (row) => (
        <span className="text-xs text-slate-600 max-w-xs truncate block" title={row.reason}>
          {row.reason || 'Routine operation'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Stock Movement Ledger"
        subtitle="Complete chronological audit trail of all receipts, kitchen consumptions, wastage, and inventory reconciliations."
        breadcrumbs={[
          { label: 'Restaurant', href: '#/dashboard' },
          { label: 'Stock Movements' },
        ]}
        actions={
          <button
            type="button"
            onClick={() => setIsExportOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export to Excel</span>
          </button>
        }
      />

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Movements"
          value={summary.total}
          subtitle="All logged ledger events"
          icon={Layers}
          variant="default"
          onClick={() => setTypeFilter('all')}
          className={typeFilter === 'all' ? 'border-emerald-500 ring-2 ring-emerald-500/10' : ''}
        />
        <StatCard
          title="Restocked (GRN)"
          value={summary.received}
          subtitle="Dock intake receipts"
          icon={PackageCheck}
          variant="success"
          onClick={() => setTypeFilter('received')}
          className={typeFilter === 'received' ? 'border-emerald-500 ring-2 ring-emerald-500/10' : ''}
        />
        <StatCard
          title="Kitchen Usage"
          value={summary.consumption}
          subtitle="Service prep consumption"
          icon={Utensils}
          variant="info"
          onClick={() => setTypeFilter('consumption')}
          className={typeFilter === 'consumption' ? 'border-blue-500 ring-2 ring-blue-500/10' : ''}
        />
        <StatCard
          title="Wastage / Discards"
          value={summary.wastage}
          subtitle="Spoilage or expiry discards"
          icon={Trash2}
          variant="danger"
          onClick={() => setTypeFilter('wastage')}
          className={typeFilter === 'wastage' ? 'border-rose-500 ring-2 ring-rose-500/10' : ''}
        />
      </div>

      {/* Search and Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by ingredient, staff, batch, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/70 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Segmented Filter Chips */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            {[
              { id: 'all', label: 'All Movements', count: summary.total },
              { id: 'received', label: 'Restock (GRN)', count: summary.received },
              { id: 'consumption', label: 'Kitchen Prep', count: summary.consumption },
              { id: 'wastage', label: 'Wastage', count: summary.wastage },
              { id: 'adjustment', label: 'Adjustments', count: summary.adjustment },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTypeFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all select-none cursor-pointer ${
                  typeFilter === tab.id
                    ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${
                      typeFilter === tab.id
                        ? 'bg-emerald-700 text-white'
                        : tab.id === 'wastage' && tab.count > 0
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {(searchTerm || typeFilter !== 'all') && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>
              Showing <strong className="text-slate-700">{filteredMovements.length}</strong> of{' '}
              <strong className="text-slate-700">{(restaurantMovements || []).length}</strong> movements
            </span>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('all');
              }}
              className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
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
