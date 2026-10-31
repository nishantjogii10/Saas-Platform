import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  RotateCcw,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Plus,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  Printer,
  ChevronRight,
  PackageX,
  CreditCard,
  Eye,
  Info,
  Truck,
  Check,
  Receipt,
  Globe,
  Handshake,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { formatINR } from '../../data/inventoryBillingData';

export const SupplierReturnsPage = () => {
  const navigate = useNavigate();
  const {
    supplierReturns,
    supplierAgreements,
    productBatches,
    restaurantIngredients,
    suppliers,
    purchaseOrders,
    createSupplierReturn,
    updateReturnTrackingStatus,
    processReturnPaymentRefund,
    addToast,
    currentUser,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedReturnDetails, setSelectedReturnDetails] = useState(null);

  // Return Tracking & Payment Management Modals
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [actionTargetReturn, setActionTargetReturn] = useState(null);

  const [trackingForm, setTrackingForm] = useState({
    trackingStatus: 'Pickup Scheduled / In Transit',
    carrierName: 'FastTrack Agri-Logistics',
    trackingNumber: '',
    note: 'Carrier pickup dispatched from receiving dock.',
  });

  const [paymentForm, setPaymentForm] = useState({
    paymentType: 'Direct Bank Refund',
    amount: '',
    paymentMethod: 'Direct Bank Transfer (NEFT/IMPS)',
    referenceNumber: '',
    notes: 'Refund settled against damaged lot.',
  });

  const handleOpenTrackingModal = (ret) => {
    setActionTargetReturn(ret);
    setTrackingForm({
      trackingStatus: ret.trackingStatus || 'Pickup Scheduled / In Transit',
      carrierName: ret.carrierName || 'FastTrack Agri-Logistics',
      trackingNumber: ret.trackingNumber || `TRK-${Math.floor(100000 + Math.random() * 900000)}`,
      note: '',
    });
    setIsTrackingModalOpen(true);
  };

  const handleSaveTracking = (e) => {
    e.preventDefault();
    if (!actionTargetReturn) return;
    updateReturnTrackingStatus(actionTargetReturn.id, trackingForm);
    setIsTrackingModalOpen(false);
    if (selectedReturnDetails && selectedReturnDetails.id === actionTargetReturn.id) {
      setSelectedReturnDetails((prev) => ({
        ...prev,
        trackingStatus: trackingForm.trackingStatus,
        carrierName: trackingForm.carrierName,
        trackingNumber: trackingForm.trackingNumber,
      }));
    }
  };

  const handleOpenPaymentModal = (ret) => {
    setActionTargetReturn(ret);
    setPaymentForm({
      paymentType: ret.settlementType || 'Direct Bank Refund',
      amount: (ret.totalLossAmount || 0).toString(),
      paymentMethod: 'Direct Bank Transfer (NEFT/IMPS)',
      referenceNumber: `UTR-${Math.floor(10000000 + Math.random() * 90000000)}`,
      notes: `Reimbursement processed for ${ret.returnNumber}`,
    });
    setIsPaymentModalOpen(true);
  };

  const handleSavePayment = (e) => {
    e.preventDefault();
    if (!actionTargetReturn) return;
    processReturnPaymentRefund({
      returnId: actionTargetReturn.id,
      paymentType: paymentForm.paymentType,
      amount: Number(paymentForm.amount),
      paymentMethod: paymentForm.paymentMethod,
      referenceNumber: paymentForm.referenceNumber,
      notes: paymentForm.notes,
    });
    setIsPaymentModalOpen(false);
    if (selectedReturnDetails && selectedReturnDetails.id === actionTargetReturn.id) {
      setSelectedReturnDetails((prev) => ({
        ...prev,
        status: 'Completed',
        trackingStatus: 'Refund Processed & Settled',
        refundStatus: 'Processed',
        refundAmount: Number(paymentForm.amount),
        refundMethod: paymentForm.paymentMethod,
        refundTransactionId: paymentForm.referenceNumber,
      }));
    }
  };

  const getTrackingBadge = (trackingStatus, status) => {
    const s =
      trackingStatus ||
      (status === 'Completed'
        ? 'Refund Processed & Settled'
        : status === 'Approved'
        ? 'Return Approved'
        : 'Return Requested');

    if (s.includes('Settled') || s.includes('Processed') || status === 'Completed') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Refund Processed
        </span>
      );
    }
    if (s.includes('Transit') || s.includes('Pickup')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
          <Truck className="w-3 h-3 text-sky-600" /> In Transit
        </span>
      );
    }
    if (s.includes('Inspected') || s.includes('Received')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
          <Building2 className="w-3 h-3 text-indigo-600" /> Inspected
        </span>
      );
    }
    if (s.includes('Approved')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
          <Check className="w-3 h-3 text-teal-600" /> Approved
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
        <Clock className="w-3 h-3 text-amber-600" /> {s}
      </span>
    );
  };

  // Form state for creating a return request
  const [returnType, setReturnType] = useState('Damaged on Delivery'); // Damaged on Delivery | Unsold Fresh Goods Agreement | Expired / Quality Failure
  const [sourceMode, setSourceMode] = useState('batch'); // 'batch' | 'ingredient' | 'order'
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const [selectedPOId, setSelectedPOId] = useState('');
  const [selectedPOItemIndex, setSelectedPOItemIndex] = useState(0);
  const [returnQty, setReturnQty] = useState(1);
  const [returnReason, setReturnReason] = useState('Dock rejection: damaged transit packaging');
  const [preferredSettlement, setPreferredSettlement] = useState('Credit Note');

  // Selected batch object
  const activeBatch = useMemo(() => {
    return productBatches.find((b) => b.batchId === selectedBatchId) || null;
  }, [productBatches, selectedBatchId]);

  // Selected return target based on sourceMode
  const selectedItem = useMemo(() => {
    if (sourceMode === 'batch') {
      const b = (productBatches || []).find((item) => item.batchId === selectedBatchId);
      if (!b) return null;
      return {
        sourceType: 'batch',
        batchId: b.batchId,
        poId: b.poId || 'po-batch',
        poNumber: b.poNumber || 'PO-BATCH',
        grnId: b.grnNumber || 'GRN-BATCH',
        grnNumber: b.grnNumber || 'GRN-BATCH',
        ingredientId: b.ingredientId,
        productName: b.productName,
        supplierId: b.supplierId,
        supplierName: b.supplierName,
        unit: b.unit,
        unitCost: Number(b.unitCost || 0),
        maxQty: Number(b.remainingQty || 0),
      };
    }

    if (sourceMode === 'ingredient') {
      const ing = (restaurantIngredients || []).find((i) => i.id === selectedIngredientId);
      if (!ing) return null;
      const sup = (suppliers || []).find((s) => s.id === ing.supplierId) || { id: ing.supplierId || 'sup-1', name: ing.supplierName || 'Primary Supplier' };
      const currentStock = ing.quantity !== undefined ? ing.quantity : (ing.currentStock || 0);
      return {
        sourceType: 'ingredient',
        batchId: ing.batchNumber || null,
        poId: 'po-stock',
        poNumber: 'PO-STOCK',
        grnId: 'GRN-INV',
        grnNumber: 'GRN-INV',
        ingredientId: ing.id,
        productName: ing.name,
        supplierId: sup.id,
        supplierName: sup.name,
        unit: ing.unit || 'units',
        unitCost: Number(ing.costPerUnit || ing.unitCost || 0),
        maxQty: Number(currentStock),
      };
    }

    if (sourceMode === 'order') {
      const po = (purchaseOrders || []).find((p) => p.id === selectedPOId);
      if (!po || !po.items || !po.items[selectedPOItemIndex]) return null;
      const item = po.items[selectedPOItemIndex];
      return {
        sourceType: 'order',
        batchId: null,
        poId: po.id,
        poNumber: po.poNumber,
        grnId: po.grnNumber || 'GRN-PO',
        grnNumber: po.grnNumber || 'GRN-PO',
        ingredientId: item.ingredientId,
        productName: item.name,
        supplierId: po.supplierId,
        supplierName: po.supplierName,
        unit: item.unit || 'units',
        unitCost: Number(item.unitCost || item.price || 0),
        maxQty: Number(item.quantity || 0),
      };
    }

    return null;
  }, [sourceMode, selectedBatchId, productBatches, selectedIngredientId, restaurantIngredients, suppliers, selectedPOId, selectedPOItemIndex, purchaseOrders]);

  // Associated agreement for active batch supplier
  const batchSupplierAgreement = useMemo(() => {
    const targetSupId = selectedItem?.supplierId || activeBatch?.supplierId;
    if (!targetSupId) return null;
    return (supplierAgreements || []).find((a) => a.supplierId === targetSupId) || null;
  }, [activeBatch, supplierAgreements]);

  // Summary Metrics
  const totalClaims = (supplierReturns || []).length;
  const totalClaimValue = (supplierReturns || []).reduce(
    (acc, ret) => acc + (ret.totalLossAmount || 0),
    0
  );
  const totalCreditNotesIssued = (supplierReturns || [])
    .filter((ret) => ret.status === 'Approved' || ret.status === 'Completed')
    .reduce((acc, ret) => acc + (ret.creditNoteAmount || ret.totalLossAmount || 0), 0);
  const pendingApprovals = (supplierReturns || []).filter((r) => r.status === 'Pending').length;

  // Filtered Returns Table Data
  const filteredReturns = useMemo(() => {
    return (supplierReturns || []).filter((ret) => {
      const matchSearch =
        ret.returnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ret.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ret.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ret.poNumber && ret.poNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (ret.batchId && ret.batchId.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = statusFilter === 'all' || ret.status === statusFilter;
      const matchType = typeFilter === 'all' || ret.returnType === typeFilter;

      return matchSearch && matchStatus && matchType;
    });
  }, [supplierReturns, searchTerm, statusFilter, typeFilter]);

  const handleOpenCreateModal = (prefillAgreement = null) => {
    if ((productBatches || []).length > 0) {
      setSourceMode('batch');
    } else if ((restaurantIngredients || []).length > 0) {
      setSourceMode('ingredient');
      setSelectedIngredientId(restaurantIngredients[0].id);
    } else if ((purchaseOrders || []).length > 0) {
      setSourceMode('order');
      setSelectedPOId(purchaseOrders[0].id);
      setSelectedPOItemIndex(0);
    }
    if (prefillAgreement) {
      setReturnType('Unsold Fresh Goods Agreement');
      // Find matching batch for this supplier
      const matching = productBatches.find(
        (b) => b.supplierId === prefillAgreement.supplierId && (b.remainingQty || 0) > 0
      );
      if (matching) {
        setSelectedBatchId(matching.batchId);
      } else if (productBatches.length > 0) {
        setSelectedBatchId(productBatches[0].batchId);
      }
      setReturnReason(
        `Unsold stock returned under ${prefillAgreement.supplierName} ${prefillAgreement.returnWindowHours}h agreement.`
      );
      setPreferredSettlement(prefillAgreement.settlementMode || 'Credit Note');
    } else {
      setReturnType('Damaged on Delivery');
      if (productBatches.length > 0 && !selectedBatchId) {
        setSelectedBatchId(productBatches[0].batchId);
      }
      setReturnReason('Damaged / defective stock identified during dock inspection.');
      setPreferredSettlement('Credit Note');
    }
    setReturnQty(1);
    setIsCreateModalOpen(true);
  };

  const handleFormBatchChange = (bId) => {
    setSelectedBatchId(bId);
    const b = productBatches.find((item) => item.batchId === bId);
    if (b) {
      const agr = (supplierAgreements || []).find((a) => a.supplierId === b.supplierId);
      if (agr && returnType === 'Unsold Fresh Goods Agreement') {
        setPreferredSettlement(agr.settlementMode || 'Credit Note');
      }
    }
  };

  const handleSubmitReturn = (e) => {
    e.preventDefault();

    if (!selectedItem) {
      addToast('Please select a valid item to return from available batches, inventory, or orders.', 'error');
      return;
    }

    const qty = Number(returnQty);
    if (qty <= 0) {
      addToast('Return quantity must be greater than zero.', 'error');
      return;
    }

    if (selectedItem.maxQty && qty > selectedItem.maxQty) {
      addToast(
        `Return quantity (${qty}) exceeds available stock (${selectedItem.maxQty} ${selectedItem.unit}).`,
        'error'
      );
      return;
    }

    // If Unsold Fresh Goods, validate against agreement max %
    if (returnType === 'Unsold Fresh Goods Agreement' && batchSupplierAgreement) {
      const maxAllowed = Math.ceil(
        ((activeBatch?.acceptedQty || selectedItem?.maxQty || 100) * (batchSupplierAgreement.maxReturnPercent || 20)) / 100
      );
      if (qty > maxAllowed) {
        const proceed = window.confirm(
          `Notice: Return qty (${qty}) exceeds agreed return threshold of ${batchSupplierAgreement.maxReturnPercent}% (${maxAllowed} ${selectedItem.unit}). Submit as special supplier concession?`
        );
        if (!proceed) return;
      }
    }

    const totalLoss = Number((qty * (selectedItem.unitCost || 0)).toFixed(2));

    const newReturnData = {
      poId: selectedItem.poId || 'po-manual',
      poNumber: selectedItem.poNumber || 'PO-MANUAL',
      grnId: selectedItem.grnNumber || 'GRN-MANUAL',
      grnNumber: selectedItem.grnNumber || 'GRN-MANUAL',
      batchId: selectedItem.batchId,
      ingredientId: selectedItem.ingredientId,
      productName: selectedItem.productName,
      supplierId: selectedItem.supplierId,
      supplierName: selectedItem.supplierName,
      returnType: returnType,
      returnQty: qty,
      unit: selectedItem.unit,
      unitCost: selectedItem.unitCost,
      totalLossAmount: totalLoss,
      reason: returnReason,
      settlementType: preferredSettlement,
      requestedBy: `${currentUser?.name || 'Inventory Manager'} (${currentUser?.role?.replace('_', ' ') || 'inventory manager'})`,
    };

    createSupplierReturn(newReturnData);
    setIsCreateModalOpen(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <Badge status="success" label="Approved" />;
      case 'Completed':
        return <Badge status="info" label="Credit Settled" />;
      case 'Rejected':
        return <Badge status="error" label="Rejected" />;
      default:
        return <Badge status="warning" label="Pending Review" />;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'Unsold Fresh Goods Agreement':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Sparkles className="w-3 h-3" /> Unsold Fresh Goods
          </span>
        );
      case 'Damaged on Delivery':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <PackageX className="w-3 h-3" /> Damaged on Delivery
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3" /> Quality Failure
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Damaged Goods & Supplier Returns"
        subtitle="Dock damage tracking, Fresh Bread unsold return claims & Credit Note reconciliations"
        breadcrumbs={[
          { label: 'Restaurant', href: '#/dashboard' },
          { label: 'Inventory', href: '#/inventory' },
          { label: 'Supplier Returns' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Printer}
              onClick={() => window.print()}
            >
              Print Summary
            </Button>
            <Button
              variant="brand"
              size="sm"
              icon={Plus}
              onClick={() => handleOpenCreateModal()}
            >
              Log Damaged / Return
            </Button>
          </div>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Return Claims"
          value={totalClaims}
          subtext="Dock rejects & fresh returns"
          icon={RotateCcw}
          accentColor="slate"
        />
        <StatCard
          title="Total Claimed Loss"
          value={formatINR(totalClaimValue)}
          subtext="Cost of damaged/unsold goods"
          icon={AlertTriangle}
          accentColor="rose"
        />
        <StatCard
          title="Credit Notes Issued"
          value={formatINR(totalCreditNotesIssued)}
          subtext="Supplier verified credits"
          icon={CreditCard}
          accentColor="emerald"
        />
        <StatCard
          title="Pending Supplier Review"
          value={pendingApprovals}
          subtext="Awaiting credit approval"
          icon={Clock}
          accentColor="amber"
        />
      </div>

      {/* Fresh Bread & Unsold Goods Agreements Showcase Card */}
      <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-emerald-950 rounded-2xl p-6 text-white shadow-lg border border-emerald-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-800/50 pb-5 mb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" /> Fresh Bread & Perishables Contract Protection
            </div>
            <h3 className="text-xl font-bold tracking-tight text-white">
              Active Supplier Unsold Return Agreements
            </h3>
            <p className="text-xs text-emerald-200/80 mt-1 max-w-2xl">
              Configurable supplier agreements guarantee credit notes for unsold fresh pav, bread, and dairy returned within their contractual freshness windows.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-300 bg-emerald-950/80 px-3 py-1.5 rounded-lg border border-emerald-700/50">
              {supplierAgreements.length} Active SLA Agreements
            </span>
          </div>
        </div>

        {/* Agreements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {supplierAgreements.map((agr) => (
            <div
              key={agr.supplierId}
              className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-emerald-700/30 hover:border-emerald-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="font-bold text-sm text-white">{agr.supplierName}</h4>
                    <span className="text-xs text-emerald-400 font-medium">{agr.category}</span>
                  </div>
                  {agr.unsoldReturnAllowed ? (
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Returns OK
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-700 text-slate-300">
                      Dock Only
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 mt-3 pt-3 border-t border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Return Window:</span>
                    <span className="font-bold text-white">{agr.returnWindowHours} Hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Daily Cutoff Time:</span>
                    <span className="font-bold text-amber-300">{agr.returnCutoffTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Max Allowed Return:</span>
                    <span className="font-bold text-emerald-300">
                      {agr.maxReturnPercent > 0 ? `Up to ${agr.maxReturnPercent}% of Order` : 'Dock Rejection Only'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Settlement Mode:</span>
                    <span className="font-bold text-cyan-300">{agr.settlementMode}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 mt-3 italic line-clamp-2">
                  "{agr.agreementNotes}"
                </p>
              </div>

              {agr.unsoldReturnAllowed && (
                <button
                  onClick={() => handleOpenCreateModal(agr)}
                  className="mt-4 w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Return Unsold Fresh Goods
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Returns Log Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Filters Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Return #, PO #, batch ID, or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Filter className="w-3.5 h-3.5" /> Filters:
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-emerald-700"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending Review</option>
              <option value="Approved">Approved</option>
              <option value="Completed">Credit Settled</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-emerald-700"
            >
              <option value="all">All Return Types</option>
              <option value="Damaged on Delivery">Damaged on Delivery</option>
              <option value="Unsold Fresh Goods Agreement">Unsold Fresh Goods Agreement</option>
              <option value="Quality Failure">Quality Failure</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Return ID & Date</th>
                <th className="py-3 px-4">Product & Batch Ref</th>
                <th className="py-3 px-4">Supplier Partner</th>
                <th className="py-3 px-4">Return Category</th>
                <th className="py-3 px-4 text-right">Return Qty</th>
                <th className="py-3 px-4 text-right">Loss Claimed</th>
                <th className="py-3 px-4">Tracking & Logistics</th>
                <th className="py-3 px-4">Settlement & Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <PackageX className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700 text-sm">No return records found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try adjusting search filters or log a new damage claim.</p>
                  </td>
                </tr>
              ) : (
                filteredReturns.map((ret) => (
                  <tr key={ret.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{ret.returnNumber}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" /> {ret.requestDate}
                      </div>
                      <div className="text-[11px] font-mono text-emerald-800">{ret.poNumber}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{ret.productName}</div>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                        Batch: {ret.batchId}
                      </div>
                      <div className="text-[11px] text-slate-400">GRN: {ret.grnNumber}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{ret.supplierName}</div>
                      {(() => {
                        const sup = (suppliers || []).find((s) => s.id === ret.supplierId || s.name === ret.supplierName);
                        const isTieUp = (sup?.supplierType === 'Tie-up Supplier') || ret.supplierType === 'Tie-up Supplier' || sup?.registeredVia === 'main_system' || sup?.id === 'sup-4' || sup?.id === 'sup-5' || ret.supplierName?.toLowerCase().includes('golden crust') || ret.supplierName?.toLowerCase().includes('amrit dairy');
                        const isThirdParty = !isTieUp;
                        return (
                          <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 rounded mt-0.5 ${
                            isThirdParty ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-teal-50 text-teal-700 border border-teal-200'
                          }`}>
                            {isThirdParty ? <Globe className="w-2.5 h-2.5" /> : <Handshake className="w-2.5 h-2.5" />}
                            <span>{isThirdParty ? 'Third-Party Supplier' : 'Tie-up Supplier'}</span>
                          </span>
                        );
                      })()}
                      <div className="text-[11px] text-slate-500 mt-0.5">By: {ret.requestedBy}</div>
                    </td>

                    <td className="py-3 px-4">
                      {getTypeBadge(ret.returnType)}
                      <div className="text-[11px] text-slate-500 mt-1 max-w-[180px] truncate" title={ret.reason}>
                        {ret.reason}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span className="font-bold text-slate-900">
                        {ret.returnQty} {ret.unit}
                      </span>
                      <div className="text-[11px] text-slate-400">@{formatINR(ret.unitCost)}</div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="font-bold text-rose-600">
                        {formatINR(ret.totalLossAmount)}
                      </div>
                      {ret.creditNoteAmount && (
                        <div className="text-[11px] text-emerald-600 font-medium">
                          Credit: {formatINR(ret.creditNoteAmount)}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="mb-1">{getTrackingBadge(ret.trackingStatus, ret.status)}</div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        {ret.carrierName || 'Fleet Logistics'}
                      </div>
                      {ret.trackingNumber && (
                        <div className="text-[10px] font-mono text-slate-400">
                          #{ret.trackingNumber}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 mb-1">
                        {getStatusBadge(ret.status)}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <span>Mode:</span>
                        <span className="font-semibold text-slate-700">{ret.settlementType}</span>
                      </div>
                      {ret.refundStatus === 'Processed' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded mt-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Refund Settled
                        </span>
                      ) : ret.creditNoteId ? (
                        <div className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded inline-block mt-0.5">
                          {ret.creditNoteId}
                        </div>
                      ) : null}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="xs"
                          icon={Eye}
                          onClick={() => setSelectedReturnDetails(ret)}
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="xs"
                          icon={Truck}
                          title="Update Tracking Status"
                          onClick={() => handleOpenTrackingModal(ret)}
                        >
                          Track
                        </Button>
                        {ret.refundStatus !== 'Processed' && ret.status !== 'Completed' && (
                          <Button
                            variant="primary"
                            size="xs"
                            icon={CreditCard}
                            title="Process Refund & Payment Settlement"
                            onClick={() => handleOpenPaymentModal(ret)}
                          >
                            Refund
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Log Damaged Stock / Unsold Fresh Goods Return */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Log Damaged Stock / Supplier Return Request"
        subtitle="Submit dock damage or fresh bread agreement return claim to vendor"
        size="lg"
      >
        <form onSubmit={handleSubmitReturn} className="space-y-4">
          {/* Return Type Toggle */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Return Classification
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setReturnType('Damaged on Delivery')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  returnType === 'Damaged on Delivery'
                    ? 'border-rose-500 bg-rose-50/60 ring-2 ring-rose-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <PackageX className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-xs text-slate-900">Damaged on Delivery</div>
                  <div className="text-[11px] text-slate-500">
                    Crushed goods, breached seals, cold chain excursion at receiving dock.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setReturnType('Unsold Fresh Goods Agreement')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  returnType === 'Unsold Fresh Goods Agreement'
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-xs text-slate-900">Unsold Fresh Goods Agreement</div>
                  <div className="text-[11px] text-slate-500">
                    Golden Crust 24h pav / Amrit Dairy 36h contract returns before cutoff.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Select Return Source Mode */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Select Item Source
            </label>
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setSourceMode('batch')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                  sourceMode === 'batch'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Product Batches ({productBatches.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setSourceMode('ingredient');
                  if (!selectedIngredientId && (restaurantIngredients || []).length > 0) {
                    setSelectedIngredientId(restaurantIngredients[0].id);
                  }
                }}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                  sourceMode === 'ingredient'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Inventory Stock ({(restaurantIngredients || []).length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setSourceMode('order');
                  if (!selectedPOId && (purchaseOrders || []).length > 0) {
                    setSelectedPOId(purchaseOrders[0].id);
                    setSelectedPOItemIndex(0);
                  }
                }}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                  sourceMode === 'order'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Purchase Orders ({(purchaseOrders || []).length})
              </button>
            </div>
          </div>

          {/* Conditional Dropdown based on Source Mode */}
          {sourceMode === 'batch' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Product Batch with Available Stock *
              </label>
              {productBatches.length === 0 ? (
                <div className="p-3 bg-amber-50 text-amber-800 text-xs rounded-xl border border-amber-200">
                  No active product batches found for current branch. Click <strong>"Inventory Stock"</strong> or <strong>"Purchase Orders"</strong> above to return items.
                </div>
              ) : (
                <select
                  value={selectedBatchId}
                  onChange={(e) => handleFormBatchChange(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                  required
                >
                  <option value="">-- Choose Received Batch --</option>
                  {productBatches.map((b) => (
                    <option key={b.batchId} value={b.batchId}>
                      {b.productName} ({b.batchId}) — {b.remainingQty} {b.unit} left | {b.supplierName} (Expiry: {b.expiryDate})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {sourceMode === 'ingredient' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Inventory Stock Item to Return *
              </label>
              <select
                value={selectedIngredientId}
                onChange={(e) => setSelectedIngredientId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                required
              >
                <option value="">-- Choose Inventory Item --</option>
                {(restaurantIngredients || []).map((ing) => (
                  <option key={ing.id} value={ing.id}>
                    {ing.name} — {ing.quantity !== undefined ? ing.quantity : ing.currentStock} {ing.unit} in stock | {ing.supplierName || 'Vendor'} ({formatINR(ing.costPerUnit || ing.unitCost || 0)}/{ing.unit})
                  </option>
                ))}
              </select>
            </div>
          )}

          {sourceMode === 'order' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Purchase Order *
                </label>
                <select
                  value={selectedPOId}
                  onChange={(e) => {
                    setSelectedPOId(e.target.value);
                    setSelectedPOItemIndex(0);
                  }}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                  required
                >
                  <option value="">-- Choose PO --</option>
                  {(purchaseOrders || []).map((po) => (
                    <option key={po.id} value={po.id}>
                      {po.poNumber} — {po.supplierName} ({po.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Line Item *
                </label>
                <select
                  value={selectedPOItemIndex}
                  onChange={(e) => setSelectedPOItemIndex(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                  required
                >
                  {((purchaseOrders || []).find((p) => p.id === selectedPOId)?.items || []).map((item, idx) => (
                    <option key={idx} value={idx}>
                      {item.name} ({item.quantity} {item.unit}) — {formatINR(item.unitCost || item.price || 0)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          {/* Selected Item Details Card */}
          {selectedItem && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800">{selectedItem.productName}</span>
                <span className="font-mono text-[11px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                  {selectedItem.batchId || selectedItem.poNumber}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-200">
                <div>
                  <span className="text-slate-400 block">Supplier:</span>
                  <span className="font-semibold text-slate-800 truncate block">{selectedItem.supplierName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">PO / GRN:</span>
                  <span className="font-semibold text-slate-800">{selectedItem.poNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Unit Cost:</span>
                  <span className="font-semibold text-slate-800">{formatINR(selectedItem.unitCost)} / {selectedItem.unit}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Remaining Stock:</span>
                  <span className="font-bold text-emerald-700">{selectedItem.maxQty} {selectedItem.unit}</span>
                </div>
              </div>

              {/* Agreement Notice if applicable */}
              {batchSupplierAgreement && (
                <div className="mt-2 p-2 rounded-lg bg-emerald-100/70 text-emerald-900 text-[11px] flex items-center justify-between border border-emerald-200">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>
                      Agreement: <strong>{batchSupplierAgreement.returnWindowHours}h</strong> return window | Cutoff: <strong>{batchSupplierAgreement.returnCutoffTime}</strong> | Max: <strong>{batchSupplierAgreement.maxReturnPercent}%</strong>
                    </span>
                  </div>
                  <span className="font-bold text-emerald-800 uppercase text-[10px]">Contracted</span>
                </div>
              )}
            </div>
          )}

          {/* Qty & Settlement Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FormInput
                label={`Return Quantity (${selectedItem?.unit || 'units'}) *`}
                type="number"
                min="1"
                max={selectedItem?.maxQty || 9999}
                value={returnQty}
                onChange={(e) => setReturnQty(e.target.value)}
                required
              />
              {selectedItem && (
                <p className="text-[11px] text-slate-500 mt-1">
                  Total loss value: <strong className="text-rose-600">{formatINR(Number(returnQty) * (selectedItem.unitCost || 0))}</strong>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Requested Settlement Mode *
              </label>
              <select
                value={preferredSettlement}
                onChange={(e) => setPreferredSettlement(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
              >
                <option value="Credit Note">Credit Note (Deducted from Invoice)</option>
                <option value="Replacement Delivery">Replacement Delivery Next Day</option>
                <option value="Invoice Adjustment">Direct Invoice Line Reduction</option>
                <option value="Direct Refund">Bank / UPI Refund</option>
              </select>
            </div>
          </div>

          {/* Return Reason */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Inspection Notes / Reason for Return *
            </label>
            <textarea
              rows={2}
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
              placeholder="State reason, damage description, or SLA clause..."
              required
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="brand"
              size="sm"
              icon={RotateCcw}
            >
              Submit Return Claim
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: View Return Claim Details */}
      {selectedReturnDetails && (
        <Modal
          isOpen={!!selectedReturnDetails}
          onClose={() => setSelectedReturnDetails(null)}
          title={`Return Claim ${selectedReturnDetails.returnNumber}`}
          subtitle="Audit trail, settlement notes, and supplier credit verification"
          size="lg"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-xs text-slate-400">Claim ID</span>
                <div className="font-bold text-slate-900 text-sm">{selectedReturnDetails.returnNumber}</div>
              </div>
              <div>
                <span className="text-xs text-slate-400">Request Date</span>
                <div className="font-semibold text-slate-800 text-xs">{selectedReturnDetails.requestDate}</div>
              </div>
              <div>
                <span className="text-xs text-slate-400">Classification</span>
                <div className="mt-0.5">{getTypeBadge(selectedReturnDetails.returnType)}</div>
              </div>
              <div>
                <span className="text-xs text-slate-400">Current Status</span>
                <div className="mt-0.5">{getStatusBadge(selectedReturnDetails.status)}</div>
              </div>
            </div>

            {/* Visual Tracking Lifecycle Stepper */}
            <div className="p-4 bg-slate-900 rounded-2xl text-white">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Live Return Tracking & Refund Lifecycle
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400">Carrier:</span>
                  <span className="text-xs font-bold text-emerald-300">
                    {selectedReturnDetails.carrierName || 'FastTrack Agri-Logistics'}
                  </span>
                </div>
              </div>

              {/* 5-Step Stepper Bar */}
              {(() => {
                const s = (selectedReturnDetails.trackingStatus || selectedReturnDetails.status || '').toLowerCase();
                const isStep5 =
                  selectedReturnDetails.refundStatus === 'Processed' ||
                  selectedReturnDetails.status === 'Completed' ||
                  s.includes('settled') ||
                  s.includes('refund');
                const isStep4 = isStep5 || selectedReturnDetails.status === 'Approved' || s.includes('approved');
                const isStep3 = isStep4 || s.includes('inspected') || s.includes('warehouse') || s.includes('received');
                const isStep2 = isStep3 || s.includes('transit') || s.includes('pickup') || s.includes('dispatched');
                const isStep1 = true;

                const steps = [
                  { num: 1, title: 'Claim Logged', desc: 'Dock rejected / filed', done: isStep1 },
                  { num: 2, title: 'In Transit', desc: 'Carrier pickup en route', done: isStep2 },
                  { num: 3, title: 'Inspected', desc: 'Warehouse condition verified', done: isStep3 },
                  { num: 4, title: 'Approved', desc: 'Supplier claim approved', done: isStep4 },
                  { num: 5, title: 'Refund Settled', desc: 'Payment / Credit credited', done: isStep5 },
                ];

                return (
                  <div className="grid grid-cols-5 gap-2 relative">
                    {steps.map((st) => (
                      <div key={st.num} className="flex flex-col items-center text-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                            st.done
                              ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/20'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {st.done ? <Check className="w-3.5 h-3.5" /> : st.num}
                        </div>
                        <div className="text-[11px] font-bold text-slate-100 mt-1.5">{st.title}</div>
                        <div className="text-[9px] text-slate-400 leading-tight hidden sm:block mt-0.5">{st.desc}</div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="text-xs text-slate-300 flex items-center gap-2">
                  <span className="font-mono text-[11px] bg-slate-800 px-2 py-0.5 rounded text-emerald-400 border border-slate-700">
                    Waybill #{selectedReturnDetails.trackingNumber || 'TRK-984210'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Current: <strong>{selectedReturnDetails.trackingStatus || 'Pickup Scheduled / In Transit'}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="xs"
                    variant="outline"
                    className="border-slate-700 text-slate-200 hover:bg-slate-800"
                    icon={Truck}
                    onClick={() => handleOpenTrackingModal(selectedReturnDetails)}
                  >
                    Update Tracking
                  </Button>
                  {selectedReturnDetails.refundStatus !== 'Processed' && selectedReturnDetails.status !== 'Completed' && (
                    <Button
                      size="xs"
                      variant="brand"
                      icon={CreditCard}
                      onClick={() => handleOpenPaymentModal(selectedReturnDetails)}
                    >
                      Process Refund
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Product & Financial Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-white border border-slate-200 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block">Product:</span>
                <span className="font-bold text-slate-800">{selectedReturnDetails.productName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Batch / PO:</span>
                <span className="font-mono text-slate-700">{selectedReturnDetails.batchId}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Return Quantity:</span>
                <span className="font-bold text-slate-900">
                  {selectedReturnDetails.returnQty} {selectedReturnDetails.unit}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Loss Claimed:</span>
                <span className="font-bold text-rose-600 text-sm">
                  {formatINR(selectedReturnDetails.totalLossAmount)}
                </span>
              </div>
            </div>

            {/* Payment & Refund Settlement Section */}
            <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                  <Receipt className="w-4 h-4 text-emerald-700" />
                  <span>Payment Settlement & Refund Management</span>
                </div>
                {selectedReturnDetails.refundStatus === 'Processed' || selectedReturnDetails.status === 'Completed' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Refund Disbursed & Settled
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    <Clock className="w-3 h-3 text-amber-600" /> Awaiting Payment Processing
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-200/60 text-[11px]">
                <div>
                  <span className="text-emerald-800/70 block">Refund Amount:</span>
                  <span className="font-bold text-emerald-900 text-sm">
                    {formatINR(selectedReturnDetails.refundAmount || selectedReturnDetails.totalLossAmount)}
                  </span>
                </div>
                <div>
                  <span className="text-emerald-800/70 block">Settlement Channel:</span>
                  <span className="font-semibold text-emerald-950">
                    {selectedReturnDetails.refundMethod || selectedReturnDetails.settlementType || 'Direct Bank Refund'}
                  </span>
                </div>
                <div>
                  <span className="text-emerald-800/70 block">Transaction / UTR:</span>
                  <span className="font-mono font-bold text-emerald-800">
                    {selectedReturnDetails.refundTransactionId || selectedReturnDetails.creditNoteId || 'Pending'}
                  </span>
                </div>
                <div>
                  <span className="text-emerald-800/70 block">Disbursal Date:</span>
                  <span className="font-semibold text-emerald-950">
                    {selectedReturnDetails.refundDate || (selectedReturnDetails.refundStatus === 'Processed' ? 'Settled' : 'Pending')}
                  </span>
                </div>
              </div>
            </div>

            {/* Supplier & Settlement */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Supplier:</span>
                <span className="font-bold text-slate-800">{selectedReturnDetails.supplierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Reason / Logged Description:</span>
                <span className="font-medium text-slate-700 max-w-md text-right">{selectedReturnDetails.reason}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Settlement Preference:</span>
                <span className="font-bold text-indigo-700">{selectedReturnDetails.settlementType}</span>
              </div>
              {selectedReturnDetails.creditNoteId && (
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="text-slate-500">Issued Credit Note:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {selectedReturnDetails.creditNoteId} ({formatINR(selectedReturnDetails.creditNoteAmount)})
                  </span>
                </div>
              )}
            </div>

            {/* Audit Timeline */}
            <div>
              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Audit Trail & Event Timeline
              </h5>
              <div className="space-y-2 border-l-2 border-emerald-600 pl-3 ml-2 text-xs">
                {(selectedReturnDetails.timeline || [
                  { date: selectedReturnDetails.requestDate, action: 'Return claim logged by inventory staff', by: selectedReturnDetails.requestedBy }
                ]).map((t, idx) => (
                  <div key={idx} className="relative">
                    <div className="w-2 h-2 rounded-full bg-emerald-600 absolute -left-[17px] top-1" />
                    <div className="text-[11px] text-slate-400 font-mono">{t.date}</div>
                    <div className="font-semibold text-slate-800">{t.action}</div>
                    <div className="text-[11px] text-slate-500">By: {t.by}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                icon={Printer}
                onClick={() => window.print()}
              >
                Print Debit Note
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedReturnDetails(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Update Return Tracking Status */}
      {isTrackingModalOpen && actionTargetReturn && (
        <Modal
          isOpen={isTrackingModalOpen}
          onClose={() => setIsTrackingModalOpen(false)}
          title={`Update Return Tracking — ${actionTargetReturn.returnNumber}`}
          subtitle={`Logistics carrier, dock dispatch, and receiving warehouse milestones for ${actionTargetReturn.supplierName}`}
          size="md"
        >
          <form onSubmit={handleSaveTracking} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Product:</span>
                <span className="font-bold text-slate-800">{actionTargetReturn.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Return Qty:</span>
                <span className="font-bold text-slate-900">{actionTargetReturn.returnQty} {actionTargetReturn.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vendor:</span>
                <span className="font-semibold text-slate-800">{actionTargetReturn.supplierName}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tracking Lifecycle Stage *
              </label>
              <select
                value={trackingForm.trackingStatus}
                onChange={(e) => setTrackingForm({ ...trackingForm, trackingStatus: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
              >
                <option value="Claim Logged / Pending Pickup">1. Claim Logged / Pending Pickup</option>
                <option value="Pickup Scheduled / In Transit">2. Pickup Scheduled / In Transit</option>
                <option value="Received & Warehouse Inspected">3. Received & Warehouse Inspected</option>
                <option value="Return Approved">4. Return Approved by Supplier</option>
                <option value="Refund Processed & Settled">5. Refund Processed & Settled</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assigned Logistics Carrier *
                </label>
                <input
                  type="text"
                  value={trackingForm.carrierName}
                  onChange={(e) => setTrackingForm({ ...trackingForm, carrierName: e.target.value })}
                  placeholder="e.g. FastTrack Agri-Logistics"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Waybill / Tracking Number *
                </label>
                <input
                  type="text"
                  value={trackingForm.trackingNumber}
                  onChange={(e) => setTrackingForm({ ...trackingForm, trackingNumber: e.target.value })}
                  placeholder="e.g. TRK-842910"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Dispatch / Inspection Milestone Notes
              </label>
              <textarea
                rows={2}
                value={trackingForm.note}
                onChange={(e) => setTrackingForm({ ...trackingForm, note: e.target.value })}
                placeholder="Dispatched from cold dock, seals verified..."
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
              />
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsTrackingModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="brand"
                size="sm"
                icon={Truck}
              >
                Save Tracking Milestone
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Process Return Payment & Refund */}
      {isPaymentModalOpen && actionTargetReturn && (
        <Modal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          title={`Process Return Refund & Payment — ${actionTargetReturn.returnNumber}`}
          subtitle={`Disburse payment refund or formal credit note for ${actionTargetReturn.supplierName}`}
          size="md"
        >
          <form onSubmit={handleSavePayment} className="space-y-4 text-xs">
            <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 text-emerald-950 space-y-1">
              <div className="flex justify-between">
                <span>Product Claim:</span>
                <span className="font-bold">{actionTargetReturn.productName} ({actionTargetReturn.returnQty} {actionTargetReturn.unit})</span>
              </div>
              <div className="flex justify-between">
                <span>Original Claim Loss:</span>
                <span className="font-bold text-rose-700">{formatINR(actionTargetReturn.totalLossAmount)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-emerald-200">
                <span>Refund Recipient:</span>
                <span className="font-semibold">{actionTargetReturn.requestedBy || 'Spice Garden Central Inventory'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Settlement Mode *
                </label>
                <select
                  value={paymentForm.paymentType}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentType: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                >
                  <option value="Direct Bank Refund">Direct Bank Refund</option>
                  <option value="Credit Note">Credit Note / Ledger Credit</option>
                  <option value="UPI Instant Settlement">UPI Instant Settlement</option>
                  <option value="Invoice Adjustment">Invoice Adjustment</option>
                </select>
              </div>

              <div>
                <FormInput
                  label="Refund Amount (INR ₹) *"
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Disbursal Method *
                </label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                >
                  <option value="Direct Bank Transfer (NEFT/IMPS)">Direct Bank Transfer (NEFT/IMPS)</option>
                  <option value="UPI / Instant Bank Pay">UPI / Instant Bank Pay</option>
                  <option value="Credit Note Issued">Credit Note Offset</option>
                  <option value="Corporate Cheque">Corporate Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  UTR / Reference ID *
                </label>
                <input
                  type="text"
                  value={paymentForm.referenceNumber}
                  onChange={(e) => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })}
                  placeholder="e.g. UTR-98214758"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Settlement Confirmation Notes
              </label>
              <textarea
                rows={2}
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
              />
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsPaymentModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="brand"
                size="sm"
                icon={Receipt}
              >
                Confirm & Disburse Refund
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

