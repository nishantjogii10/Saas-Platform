import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  QrCode,
  Scan,
  Search,
  Filter,
  Calendar,
  Clock,
  Boxes,
  MapPin,
  TrendingDown,
  History,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Download,
  Printer,
  ChevronRight,
  ShieldCheck,
  Building2,
  PackageCheck,
  Camera,
  Layers,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { QRCodeView } from '../../components/common/QRCodeView';
import { formatINR } from '../../data/inventoryBillingData';

export const BatchTrackingPage = () => {
  const navigate = useNavigate();
  const {
    productBatches,
    consumeFromBatch,
    addToast,
    currentUser,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Currently selected / scanned batch for inspection
  const [selectedBatch, setSelectedBatch] = useState(() => productBatches[0] || null);

  // Consume modal
  const [isConsumeModalOpen, setIsConsumeModalOpen] = useState(false);
  const [consumeQty, setConsumeQty] = useState('');
  const [consumeReason, setConsumeReason] = useState('Kitchen Preparation');

  // Camera Scanner Simulation State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scanMessage, setScanMessage] = useState('');

  // KPI Calculations
  const totalBatches = productBatches.length;
  const activeBatches = productBatches.filter((b) => b.batchStatus === 'Active').length;
  const nearExpiryBatches = productBatches.filter((b) => {
    if (!b.expiryDate) return false;
    const diffDays = Math.ceil((new Date(b.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  }).length;
  const expiredBatches = productBatches.filter((b) => {
    if (!b.expiryDate) return false;
    return new Date(b.expiryDate) < new Date();
  }).length;

  // Filtered Batches
  const filteredBatches = useMemo(() => {
    return productBatches.filter((b) => {
      const matchesSearch =
        b.batchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.storageLocation.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = categoryFilter === 'all' || b.category === categoryFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && b.batchStatus === 'Active') ||
        (statusFilter === 'near_expiry' && nearExpiryBatches > 0) ||
        (statusFilter === 'depleted' && b.batchStatus === 'Depleted');

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [productBatches, searchTerm, categoryFilter, statusFilter, nearExpiryBatches]);

  // Handle Scanning Simulation
  const handleSimulateScan = (batch) => {
    setSelectedBatch(batch);
    setScanMessage(`QR Decoded: ${batch.batchId} (${batch.productName})`);
    setIsCameraActive(false);
    addToast(`QR Scan Successful: Loaded Batch ${batch.batchId}`, 'success');
  };

  // Submit Consume
  const handleConsumeSubmit = (e) => {
    e.preventDefault();
    if (!selectedBatch) return;

    const ok = consumeFromBatch(selectedBatch.batchId, consumeQty, consumeReason);
    if (ok) {
      setIsConsumeModalOpen(false);
      setConsumeQty('');
      // Refresh current selected batch reference
      const updated = productBatches.find((b) => b.batchId === selectedBatch.batchId);
      if (updated) setSelectedBatch(updated);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="QR Code &amp; Batch-Wise Inventory Tracking"
        subtitle="Unique QR labels for every received batch, FEFO &amp; FIFO consumption intelligence, real-time expiry tracking, and storage location records."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={PackageCheck}
              onClick={() => navigate('/goods-receiving')}
            >
              Goods Receiving (GRN)
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Scan}
              onClick={() => setIsCameraActive(!isCameraActive)}
            >
              {isCameraActive ? 'Close Scanner' : 'Open QR Scanner'}
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Tracked Batches"
          value={totalBatches}
          subtitle="Unique QR Labels"
          icon={QrCode}
          variant="default"
        />
        <StatCard
          title="Active Stock Batches"
          value={activeBatches}
          subtitle="Available for Prep"
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title="Near Expiry (FEFO)"
          value={nearExpiryBatches}
          subtitle="Priority Usage (Next 72h)"
          icon={AlertTriangle}
          variant={nearExpiryBatches > 0 ? "warning" : "default"}
        />
        <StatCard
          title="Expired / Wasted"
          value={expiredBatches}
          subtitle={expiredBatches > 0 ? "Immediate Return/Waste" : "Zero Expired Stock"}
          icon={AlertCircle}
          variant={expiredBatches > 0 ? "danger" : "default"}
        />
      </div>

      {/* Live QR Scanner & Quick Lookup Console */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white shadow-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">QR Batch Scanner &amp; Quick Lookup</h3>
              <p className="text-[11px] text-slate-400">Scan via terminal camera, drop an image tag, or select a Batch ID below.</p>
            </div>
          </div>

          {/* Quick Batch Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Quick Lookup:</span>
            <select
              value={selectedBatch?.batchId || ''}
              onChange={(e) => {
                const b = productBatches.find((item) => item.batchId === e.target.value);
                if (b) setSelectedBatch(b);
              }}
              className="py-1.5 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              {productBatches.map((b) => (
                <option key={b.batchId} value={b.batchId}>
                  {b.batchId} — {b.productName} ({b.remainingQty} {b.unit})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Camera Scanner Simulation View */}
        {isCameraActive && (
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Terminal Camera Feed Active
                </span>
              </div>
              <span className="text-[11px] text-slate-400">Simulate scanning by tapping any batch below:</span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {productBatches.slice(0, 5).map((b) => (
                <button
                  key={b.batchId}
                  onClick={() => handleSimulateScan(b)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-900/40 text-xs text-slate-200 hover:text-emerald-300 border border-slate-700 transition-all font-mono"
                >
                  [Scan {b.batchId}]
                </button>
              ))}
            </div>
          </div>
        )}

        {scanMessage && (
          <div className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center justify-between">
            <span>{scanMessage}</span>
            <button onClick={() => setScanMessage('')} className="text-xs text-slate-400 hover:text-white">&times;</button>
          </div>
        )}
      </div>

      {/* Main Inspection View: QR Code Details + Batch Metadata */}
      {selectedBatch && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: QR Code Card & Print Sticker */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col items-center justify-between space-y-4">
            <div className="text-center w-full">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Unique Batch Tag
              </span>
              <h4 className="font-bold text-base text-slate-900 mt-1.5">{selectedBatch.productName}</h4>
              <p className="font-mono text-xs font-bold text-slate-600 mt-0.5">{selectedBatch.batchId}</p>
            </div>

            {/* Real SVG QR Generator */}
            <QRCodeView
              value={selectedBatch.batchId}
              size={150}
              title={selectedBatch.productName}
              subtitle={`${selectedBatch.supplierName} • Exp: ${selectedBatch.expiryDate || 'N/A'}`}
              batchInfo={selectedBatch}
              showDownload={true}
              showPrint={true}
              className="w-full"
            />

            {/* Quick Actions */}
            <div className="w-full space-y-2 pt-2 border-t border-slate-100">
              <Button
                variant="primary"
                size="sm"
                className="w-full text-xs bg-emerald-600 hover:bg-emerald-700"
                onClick={() => setIsConsumeModalOpen(true)}
              >
                Log FEFO Kitchen Consumption
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs text-slate-700"
                onClick={() => navigate('/supplier-returns')}
              >
                Return Unsold / Damaged Goods
              </Button>
            </div>
          </div>

          {/* Right: Detailed Batch Metadata & Movement Logs */}
          <div className="lg:col-span-2 space-y-4">
            {/* Metadata Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {selectedBatch.batchId}
                    </span>
                    <Badge status={selectedBatch.batchStatus === 'Active' ? 'active' : 'warning'} size="sm" />
                    {selectedBatch.fefoRank === 1 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        FEFO Priority #1 (Earliest Expiry)
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedBatch.productName}</h3>
                  <p className="text-xs text-slate-500 font-medium">{selectedBatch.supplierName}</p>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Remaining Stock</div>
                  <div className="text-xl font-black text-emerald-700">
                    {selectedBatch.remainingQty}{' '}
                    <span className="text-xs font-normal text-slate-500">{selectedBatch.unit}</span>
                  </div>
                </div>
              </div>

              {/* Grid Specifications */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-slate-100">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Received Date</span>
                  <strong className="text-slate-800">{selectedBatch.receivedDate}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Expiry Date</span>
                  <strong className={selectedBatch.isPerishable ? 'text-amber-800 font-bold' : 'text-slate-800'}>
                    {selectedBatch.expiryDate || 'Non-Perishable'}
                  </strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">PO &amp; Invoice</span>
                  <strong className="font-mono text-[11px] text-slate-800">{selectedBatch.poNumber}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Storage Location</span>
                  <strong className="text-slate-800 truncate block">{selectedBatch.storageLocation}</strong>
                </div>
              </div>

              {/* Quantities Ledger */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <div>
                  <span className="text-[10px] text-slate-400 block">Received</span>
                  <span className="font-bold text-slate-700">{selectedBatch.receivedQty}</span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-600 font-medium block">Accepted</span>
                  <span className="font-bold text-emerald-700">{selectedBatch.acceptedQty}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Consumed</span>
                  <span className="font-bold text-slate-800">{selectedBatch.consumedQty}</span>
                </div>
                <div>
                  <span className="text-[10px] text-rose-500 block">Damaged/Returned</span>
                  <span className="font-bold text-rose-700">{selectedBatch.damagedQty + selectedBatch.returnedQty}</span>
                </div>
              </div>
            </div>

            {/* Batch Movement History */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-4 h-4 text-slate-400" />
                <span>Batch Movement &amp; Consumption Audit Trail</span>
              </h4>

              <div className="relative border-l border-slate-200 ml-3 space-y-3 pl-4 py-1 text-xs">
                {selectedBatch.movements?.map((m) => (
                  <div key={m.id} className="relative">
                    <span
                      className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white ${
                        m.type === 'received'
                          ? 'bg-emerald-500'
                          : m.type === 'consumed'
                          ? 'bg-blue-500'
                          : 'bg-amber-500'
                      }`}
                    />
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 capitalize">
                        {m.type}: {m.quantity} {selectedBatch.unit}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{m.date}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5">{m.reason}</p>
                    <span className="text-[10px] text-slate-400">By: {m.by}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Batches Table */}
      <div className="space-y-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search batches by ID, product, supplier, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs font-medium py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-700"
            >
              <option value="all">All Categories</option>
              <option value="Bakery">Bakery &amp; Pav</option>
              <option value="Dairy">Dairy Products</option>
              <option value="Poultry">Poultry &amp; Meats</option>
              <option value="Produce">Fresh Produce</option>
              <option value="Dry Spices">Dry Spices</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Batch ID &amp; QR</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Remaining Stock</th>
                  <th className="py-3 px-4">Expiry Date (FEFO)</th>
                  <th className="py-3 px-4">Storage Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBatches.map((b) => {
                  const isSelected = selectedBatch?.batchId === b.batchId;

                  return (
                    <tr
                      key={b.batchId}
                      className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                        isSelected ? 'bg-emerald-50/40' : ''
                      }`}
                      onClick={() => setSelectedBatch(b)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                            <QrCode className="w-4 h-4" />
                          </div>
                          <span className="font-mono font-bold text-slate-900">{b.batchId}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {b.productName}
                        <div className="text-[10px] text-slate-400 font-normal">{b.category}</div>
                      </td>

                      <td className="py-3 px-4 text-slate-700">{b.supplierName}</td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-emerald-800">{b.remainingQty} {b.unit}</span>
                        <div className="text-[10px] text-slate-400">Accepted: {b.acceptedQty}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className={b.isPerishable ? 'font-bold text-amber-800' : 'text-slate-600'}>
                          {b.expiryDate || 'N/A (Spices)'}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600">{b.storageLocation}</td>

                      <td className="py-3 px-4">
                        <Badge status={b.batchStatus === 'Active' ? 'active' : 'warning'} size="sm" />
                      </td>

                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBatch(b);
                          }}
                          className="text-xs text-emerald-700 hover:bg-emerald-50"
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Log FEFO Kitchen Consumption Modal */}
      {selectedBatch && (
        <Modal
          isOpen={isConsumeModalOpen}
          onClose={() => setIsConsumeModalOpen(false)}
          title={`FEFO Consumption: ${selectedBatch.productName}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleConsumeSubmit} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Selected Batch ID:</span>
                <strong className="font-mono text-slate-900">{selectedBatch.batchId}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Expiry Date:</span>
                <strong className="text-amber-800">{selectedBatch.expiryDate || 'N/A'}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Remaining in Batch:</span>
                <strong className="text-emerald-700">{selectedBatch.remainingQty} {selectedBatch.unit}</strong>
              </div>
            </div>

            <FormInput
              label={`Quantity to Consume (${selectedBatch.unit}) *`}
              type="number"
              step="any"
              placeholder={`Max ${selectedBatch.remainingQty}`}
              value={consumeQty}
              onChange={(e) => setConsumeQty(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Usage Reason / Recipe
              </label>
              <input
                type="text"
                placeholder="e.g. Lunch Service Pav Bhaji, Butter Chicken Batch 1"
                value={consumeReason}
                onChange={(e) => setConsumeReason(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setIsConsumeModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Deduct from Batch
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

