import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  ClockAlert,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Filter,
  Search,
  Scale,
  Calendar,
  Layers,
  Sparkles,
  QrCode,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { SearchBar } from '../../components/common/SearchBar';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { ColumnExportDialog } from '../../components/common/ColumnExportDialog';
import { Download } from 'lucide-react';
import { formatINR } from '../../data/inventoryBillingData';

export const ExpiryTrackingPage = () => {
  const navigate = useNavigate();
  const { restaurantIngredients, recordWastage, currentUser, currentBranch, productBatches, supplierAgreements } = useApp();

  const [searchParams] = useSearchParams();

  // Auto-filter by ingredient from alert deep links
  useEffect(() => {
    const targetIngId = searchParams.get('ingredientId');
    if (targetIngId && (restaurantIngredients || []).length > 0) {
      const match = restaurantIngredients.find(
        (ing) =>
          String(ing.id).toLowerCase() === String(targetIngId).toLowerCase() ||
          (ing.batchNumber && String(ing.batchNumber).toLowerCase() === String(targetIngId).toLowerCase())
      );
      if (match) {
        setSearchTerm(match.name);
      }
    }
  }, [searchParams, restaurantIngredients]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [filterMode, setFilterMode] = useState('all'); // all | urgent (<=3d) | week (<=7d) | expired | safe

  const [wastageModalOpen, setWastageModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [wasteAmount, setWasteAmount] = useState(1);
  const [wasteReason, setWasteReason] = useState('Expired past safe use window');

  // Categorize ingredient expiry status
  const getExpiryCategory = (days) => {
    if (days < 0) return 'expired';
    if (days <= 3) return 'expiring_soon';
    if (days <= 7) return 'expiring_soon';
    return 'safe';
  };

  const filteredItems = restaurantIngredients.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const days = item.daysUntilExpiry;
    let matchesFilter = true;
    if (filterMode === 'urgent') matchesFilter = days >= 0 && days <= 3;
    else if (filterMode === 'week') matchesFilter = days >= 0 && days <= 7;
    else if (filterMode === 'expired') matchesFilter = days < 0;
    else if (filterMode === 'safe') matchesFilter = days > 7;

    return matchesSearch && matchesFilter;
  });

  const handleOpenWastage = (item) => {
    setSelectedItem(item);
    setWasteAmount(item.quantity > 0 ? item.quantity : 1);
    setWasteReason(item.daysUntilExpiry < 0 ? 'Spoiled/Expired past safety date' : 'Prep degradation');
    setWastageModalOpen(true);
  };

  const handleSaveWastage = (e) => {
    e.preventDefault();
    if (selectedItem) {
      recordWastage({
        ingredientId: selectedItem.id,
        amount: Number(wasteAmount),
        reason: wasteReason,
        staffName: currentUser.name,
        roleName: currentUser.role,
      });
      setWastageModalOpen(false);
    }
  };

  const urgentCount = restaurantIngredients.filter(i => i.daysUntilExpiry >= 0 && i.daysUntilExpiry <= 3).length;
  const expiredCount = restaurantIngredients.filter(i => i.daysUntilExpiry < 0).length;

  const columns = [
    {
      header: 'Ingredient Name',
      accessor: 'name',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-slate-900 dark:text-white text-xs">
          {row.name}
        </span>
      ),
    },
    {
      header: 'Batch Number',
      accessor: 'batchNumber',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-emerald-800 dark:text-emerald-400 font-semibold">
          {row.batchNumber || '—'}
        </span>
      ),
    },
    {
      header: 'Storage Location',
      accessor: 'storageLocation',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-400">
          {row.storageLocation}
        </span>
      ),
    },
    {
      header: 'On-Hand Qty',
      accessor: 'quantity',
      sortable: true,
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
          {row.quantity} {row.unit}
        </span>
      ),
    },
    {
      header: 'Restocked Date',
      accessor: 'lastRestocked',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {row.lastRestocked || '—'}
        </span>
      ),
    },
    {
      header: 'Expiry Date',
      accessor: 'expiryDate',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
          {row.expiryDate}
        </span>
      ),
    },
    {
      header: 'Time Remaining',
      accessor: 'daysUntilExpiry',
      sortable: true,
      render: (row) => {
        const d = row.daysUntilExpiry;
        if (d < 0) {
          return (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800">
              Expired {Math.abs(d)} day{Math.abs(d) > 1 ? 's' : ''} ago
            </span>
          );
        }
        if (d === 0) {
          return (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
              Expires TODAY
            </span>
          );
        }
        if (d <= 3) {
          return (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
              {d} day{d > 1 ? 's' : ''} remaining
            </span>
          );
        }
        return (
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {d} days remaining
          </span>
        );
      },
    },
    {
      header: 'FEFO Status',
      accessor: 'status',
      sortable: true,
      render: (row) => {
        const cat = getExpiryCategory(row.daysUntilExpiry);
        return <Badge status={cat} />;
      },
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant={row.daysUntilExpiry < 0 ? 'danger' : 'outline'}
            size="xs"
            icon={Trash2}
            onClick={() => handleOpenWastage(row)}
          >
            {row.daysUntilExpiry < 0 ? 'Discard (Wastage)' : 'Record Wastage'}
          </Button>
        </div>
      ),
    },
  ];

  const safeCount = Math.max(0, restaurantIngredients.length - urgentCount - expiredCount);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Batch Expiry & Shelf-Life Tracking"
        subtitle="Enforce FIFO & FEFO inventory rotation, prevent food waste, and enforce fresh bread return agreements."
        breadcrumbs={[
          { label: 'Restaurant', href: '#/dashboard' },
          { label: 'Expiry Tracking' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsExportOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all active:scale-[0.98] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/supplier-returns')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all active:scale-[0.98] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Fresh Goods Returns</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/batch-tracking')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs hover:shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>QR & Batch Console</span>
            </button>
          </div>
        }
      />

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Monitored"
          value={restaurantIngredients.length}
          unit="batches"
          subtitle="Active stock batches"
          icon={Layers}
          variant="default"
          onClick={() => setFilterMode('all')}
          className={filterMode === 'all' ? 'border-emerald-500 ring-2 ring-emerald-500/10' : ''}
        />
        <StatCard
          title="Expiring <= 3 Days"
          value={urgentCount}
          unit="items"
          subtitle="Prioritize on prep lines"
          icon={ClockAlert}
          variant="warning"
          onClick={() => setFilterMode('urgent')}
          className={filterMode === 'urgent' ? 'border-amber-500 ring-2 ring-amber-500/10' : ''}
        />
        <StatCard
          title="Expired Batches"
          value={expiredCount}
          unit="items"
          subtitle="Requires discard / wastage"
          icon={AlertTriangle}
          variant="danger"
          onClick={() => setFilterMode('expired')}
          className={filterMode === 'expired' ? 'border-rose-500 ring-2 ring-rose-500/10' : ''}
        />
        <StatCard
          title="Safe & Fresh (> 7d)"
          value={safeCount}
          unit="items"
          subtitle="Optimal shelf-life"
          icon={CheckCircle2}
          variant="success"
          onClick={() => setFilterMode('safe')}
          className={filterMode === 'safe' ? 'border-emerald-500 ring-2 ring-emerald-500/10' : ''}
        />
      </div>

      {/* FEFO Priority Queue & Policy Clean White Panel */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-1 border border-emerald-200/80">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Food Safety Standard: FEFO & FIFO Rotation</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">FEFO Priority Queue (First-Expired, First-Out)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Perishable ingredients must be consumed strictly by earliest expiration date. Non-perishables follow FIFO.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/batch-tracking')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all cursor-pointer self-start md:self-auto"
          >
            <span>Open Batch Matrix</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Top 3 Earliest Expiring Batches */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(productBatches || [])
            .filter((b) => (b.remainingQty || 0) > 0)
            .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
            .slice(0, 3)
            .map((b, idx) => {
              const daysLeft = Math.ceil((new Date(b.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
              const isBakeryOrDairy = b.category === 'Bakery' || b.category === 'Dairy';
              return (
                <div
                  key={b.batchId}
                  className="bg-slate-50/80 hover:bg-slate-100/70 rounded-xl p-3.5 border border-slate-200/80 text-xs flex flex-col justify-between transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        FEFO #{idx + 1}
                      </span>
                      <span className={`text-[11px] font-bold ${daysLeft <= 2 ? 'text-amber-700' : 'text-slate-600'}`}>
                        {daysLeft <= 0 ? 'Expires Today' : `${daysLeft}d left`}
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm truncate">{b.productName}</div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Batch: <span className="font-mono text-slate-700">{b.batchId}</span> • Stock: <span className="font-bold text-slate-800">{b.remainingQty} {b.unit}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Expiry: <strong className="text-amber-700">{b.expiryDate}</strong> ({b.storageLocation})
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between gap-2">
                    {isBakeryOrDairy ? (
                      <button
                        type="button"
                        onClick={() => navigate('/supplier-returns')}
                        className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" /> Return Fresh Stock
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => navigate('/batch-tracking')}
                        className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                      >
                        <QrCode className="w-3 h-3" /> Scan / Log Prep
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Search and Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ingredient or batch number..."
              className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/70 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                title="Clear search"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            {[
              { id: 'all', label: 'All Batches', count: restaurantIngredients.length },
              { id: 'urgent', label: 'Expiring <= 3 Days', count: urgentCount },
              { id: 'week', label: 'Expiring <= 7 Days' },
              { id: 'expired', label: 'Expired', count: expiredCount },
              { id: 'safe', label: 'Safe / Good', count: safeCount },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterMode(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all select-none cursor-pointer ${
                  filterMode === tab.id
                    ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${
                      filterMode === tab.id
                        ? 'bg-emerald-700 text-white'
                        : tab.id === 'expired' && tab.count > 0
                        ? 'bg-rose-100 text-rose-700'
                        : tab.id === 'urgent' && tab.count > 0
                        ? 'bg-amber-100 text-amber-800'
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

        {/* Reset Filter indicator */}
        {(searchTerm || filterMode !== 'all') && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>
              Showing <strong className="text-slate-700">{filteredItems.length}</strong> of{' '}
              <strong className="text-slate-700">{restaurantIngredients.length}</strong> batches
            </span>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setFilterMode('all');
              }}
              className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={filteredItems}
        pageSize={8}
        emptyTitle="No expiring batches matching filter"
        emptyDescription="All batches in this view are healthy."
      />

      {/* Record Wastage Modal */}
      {selectedItem && (
        <Modal
          isOpen={wastageModalOpen}
          onClose={() => setWastageModalOpen(false)}
          title={`Record Wastage: ${selectedItem.name}`}
          subtitle={`Batch ${selectedItem.batchNumber} • Current on-hand: ${selectedItem.quantity} ${selectedItem.unit}`}
          maxWidth="max-w-md"
          footer={
            <>
              <Button variant="secondary" onClick={() => setWastageModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" icon={Trash2} onClick={handleSaveWastage}>
                Log Food Wastage
              </Button>
            </>
          }
        >
          <form onSubmit={handleSaveWastage} className="space-y-4">
            <FormInput
              label={`Wasted Quantity (${selectedItem.unit})`}
              name="wasteAmount"
              type="number"
              step="any"
              min="0.1"
              max={selectedItem.quantity}
              value={wasteAmount}
              onChange={(e) => setWasteAmount(e.target.value)}
              required
            />

            <FormInput
              label="Reason for Spoilage / Wastage"
              name="wasteReason"
              type="select"
              value={wasteReason}
              onChange={(e) => setWasteReason(e.target.value)}
              options={[
                'Expired past safe use window',
                'Visual mold / discoloration',
                'Dropped or damaged container',
                'Over-prepped dinner line surplus',
                'Cold storage temperature variance',
              ]}
              required
            />

            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900">
              <strong>Audit Trail:</strong> Discarding this stock will automatically create a negative movement record in the <em>Stock Movements</em> log and adjust the restaurant's wastage metrics in reports.
            </div>
          </form>
        </Modal>
      )}

      {/* Customizable Excel Export Dialog */}
      <ColumnExportDialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        data={filteredItems}
        availableColumns={[
          { key: 'name', header: 'Ingredient Name' },
          { key: 'category', header: 'Category' },
          { key: 'batchNumber', header: 'Batch Number' },
          { key: 'quantity', header: 'Current Stock', format: (val, row) => `${val} ${row.unit || ''}` },
          { key: 'storageLocation', header: 'Storage Location' },
          { key: 'expiryDate', header: 'Expiry Date' },
          { key: 'daysUntilExpiry', header: 'Days Remaining', format: (val) => val < 0 ? `Expired (${Math.abs(val)}d ago)` : `${val} days left` },
          { key: 'valueAtRisk', header: 'Value at Risk (INR)', format: (_, row) => formatINR((row.quantity || 0) * (row.costPerUnit || 0)) },
          { key: 'supplierName', header: 'Supplier' },
        ]}
        reportTitle={`Batch Expiry & Shelf-Life Audit — ${currentBranch?.name || 'Active Branch'}`}
        fileNamePrefix="stockmate_expiry_audit"
        filtersSummary={{
          Filter: filterMode.toUpperCase(),
          Search: searchTerm || 'All Items',
          Outlet: currentBranch?.name || 'All Outlets',
        }}
      />
    </div>
  );
};

