import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { formatINR } from '../../data/inventoryBillingData';

export const ExpiryTrackingPage = () => {
  const navigate = useNavigate();
  const { restaurantIngredients, recordWastage, currentUser, productBatches, supplierAgreements } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
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
      header: 'Ingredient & Batch Details',
      accessor: 'name',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.name}</div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span className="font-mono text-emerald-800 font-semibold">{row.batchNumber}</span>
            <span>•</span>
            <span>Loc: {row.storageLocation}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'On-Hand Qty',
      accessor: 'quantity',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-slate-800">
          {row.quantity} {row.unit}
        </span>
      ),
    },
    {
      header: 'Expiry Date',
      accessor: 'expiryDate',
      sortable: true,
      render: (row) => (
        <div className="text-xs">
          <div className="font-semibold text-slate-800">{row.expiryDate}</div>
          <div className="text-slate-400">Restocked {row.lastRestocked}</div>
        </div>
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
            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
              Expired {Math.abs(d)} day{Math.abs(d) > 1 ? 's' : ''} ago
            </span>
          );
        }
        if (d === 0) {
          return (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              Expires TODAY
            </span>
          );
        }
        if (d <= 3) {
          return (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              {d} day{d > 1 ? 's' : ''} remaining
            </span>
          );
        }
        return (
          <span className="text-xs font-medium text-slate-600">
            {d} days remaining
          </span>
        );
      },
    },
    {
      header: 'Status',
      accessor: 'daysUntilExpiry',
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Batch Expiry & Shelf-Life Tracking"
        subtitle="Enforce FIFO & FEFO inventory rotation, prevent food waste, and enforce fresh bread return agreements"
        breadcrumbs={[
          { label: 'Restaurant', href: '#/dashboard' },
          { label: 'Expiry Tracking' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RotateCcw}
              onClick={() => navigate('/supplier-returns')}
            >
              Fresh Goods Returns
            </Button>
            <Button
              variant="brand"
              size="sm"
              icon={QrCode}
              onClick={() => navigate('/batch-tracking')}
            >
              QR & Batch Console
            </Button>
          </div>
        }
      />

      {/* FEFO Priority Queue & Policy Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-emerald-950 rounded-2xl p-5 text-white border border-emerald-800/40 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-800/50 pb-4 mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-1 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" /> Food Safety Standard: FEFO & FIFO Rotation
            </div>
            <h3 className="text-lg font-bold text-white">FEFO Priority Queue (First-Expired, First-Out)</h3>
            <p className="text-xs text-slate-300">
              Perishable ingredients must be consumed strictly by earliest expiration date. Non-perishables follow FIFO. Never invent expiry dates.
            </p>
          </div>
          <Button
            variant="outline"
            size="xs"
            className="text-white border-emerald-600 hover:bg-emerald-900"
            iconRight={ArrowRight}
            onClick={() => navigate('/batch-tracking')}
          >
            Open Batch Matrix
          </Button>
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
                  className="bg-slate-900/90 rounded-xl p-3 border border-emerald-700/40 text-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                        FEFO Priority #{idx + 1}
                      </span>
                      <span className={`text-[11px] font-bold ${daysLeft <= 2 ? 'text-amber-400' : 'text-slate-300'}`}>
                        {daysLeft <= 0 ? 'Expires Today' : `${daysLeft}d remaining`}
                      </span>
                    </div>
                    <div className="font-bold text-white text-sm truncate">{b.productName}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Batch: <span className="font-mono text-slate-300">{b.batchId}</span> • Stock: <span className="font-bold text-emerald-300">{b.remainingQty} {b.unit}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Expiry: <strong className="text-amber-300">{b.expiryDate}</strong> ({b.storageLocation})
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                    {isBakeryOrDairy ? (
                      <button
                        onClick={() => navigate('/supplier-returns')}
                        className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Return Unsold Fresh Stock
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate('/batch-tracking')}
                        className="text-[11px] font-semibold text-slate-300 hover:text-white flex items-center gap-1"
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

      {/* Expiry Overview Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">Expiring in &le; 3 Days</span>
            <div className="text-2xl font-bold text-amber-950 mt-1">{urgentCount} Items</div>
            <p className="text-[11px] text-amber-800 mt-0.5">Prioritize on kitchen prep stations</p>
          </div>
          <ClockAlert className="w-8 h-8 text-amber-600" />
        </div>

        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">Expired Batches</span>
            <div className="text-2xl font-bold text-rose-950 mt-1">{expiredCount} Items</div>
            <p className="text-[11px] text-rose-800 mt-0.5">Must be discarded & logged as wastage</p>
          </div>
          <AlertTriangle className="w-8 h-8 text-rose-600" />
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Good Condition</span>
            <div className="text-2xl font-bold text-emerald-950 mt-1">
              {restaurantIngredients.length - urgentCount - expiredCount} Items
            </div>
            <p className="text-[11px] text-emerald-800 mt-0.5">Healthy shelf-life buffer</p>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by ingredient or batch number..."
          className="w-full sm:w-80"
        />

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Batches' },
            { id: 'urgent', label: 'Expiring <= 3 Days', count: urgentCount },
            { id: 'week', label: 'Expiring <= 7 Days' },
            { id: 'expired', label: 'Expired', count: expiredCount },
            { id: 'safe', label: 'Safe / Good' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterMode(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all select-none ${
                filterMode === tab.id
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  tab.id === 'expired' ? 'bg-rose-500 text-white' : 'bg-amber-400 text-amber-950'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
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
    </div>
  );
};

