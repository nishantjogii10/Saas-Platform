import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  PackageCheck,
  ShoppingBag,
  Truck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  Plus,
  ArrowRight,
  ShieldCheck,
  Printer,
  Calendar,
  Clock,
  Boxes,
  QrCode,
  IndianRupee,
  AlertCircle,
  Eye,
  Check,
  X,
  Store,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { formatINR } from '../../data/inventoryBillingData';

export const GoodsReceivingPage = () => {
  const navigate = useNavigate();
  const {
    goodsReceivedNotes,
    purchaseOrders,
    restaurantOrders,
    currentBranch,
    currentBranchId,
    suppliers,
    createGoodsReceivedNote,
    addToast,
    currentUser,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [isCreateGRNOpen, setIsCreateGRNOpen] = useState(false);
  const [selectedGRNDetails, setSelectedGRNDetails] = useState(null);

  // Form State for new GRN
  const [selectedPOId, setSelectedPOId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [deliveryChallan, setDeliveryChallan] = useState('');
  const [grnNotes, setGrnNotes] = useState('');
  const [grnItems, setGrnItems] = useState([]);

  // Filtered GRNs
  const filteredGRNs = useMemo(() => {
    return goodsReceivedNotes.filter((grn) => {
      const matchesSearch =
        grn.grnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grn.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grn.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grn.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || grn.verificationStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [goodsReceivedNotes, searchTerm, statusFilter]);

  // KPI Calculations
  const totalDeliveries = goodsReceivedNotes.length;
  const verifiedAccepted = goodsReceivedNotes.filter((g) => g.verificationStatus === 'Verified & Accepted').length;
  const partiallyAccepted = goodsReceivedNotes.filter((g) => g.verificationStatus === 'Partially Accepted').length;
  const totalAcceptedValue = goodsReceivedNotes.reduce((acc, g) => acc + (g.totalAcceptedAmount || 0), 0);
  const totalDamageLoss = goodsReceivedNotes.reduce((acc, g) => acc + (g.totalDamageLoss || 0), 0);

  // Available POs strictly scoped to active branch
  const activeBranchPOs = useMemo(() => {
    const list = restaurantOrders || purchaseOrders || [];
    return list.filter((p) => !p.branchId || !currentBranchId || p.branchId === currentBranchId);
  }, [restaurantOrders, purchaseOrders, currentBranchId]);

  // Eligible POs for delivery receiving (dispatched, accepted, or pending)
  const eligiblePOs = useMemo(() => {
    return activeBranchPOs.filter((po) => po.status !== 'delivered');
  }, [activeBranchPOs]);

  // Itemized damaged items across this branch's GRNs
  const damagedItems = useMemo(() => {
    const list = [];
    goodsReceivedNotes.forEach((grn) => {
      (grn.items || []).forEach((item) => {
        if (Number(item.damagedQty) > 0) {
          list.push({
            id: `${grn.id}-${item.ingredientId || item.name}`,
            grnNumber: grn.grnNumber,
            grnId: grn.id,
            supplierName: grn.supplierName,
            supplierId: grn.supplierId,
            receivedDate: grn.receivedDate,
            name: item.name,
            unit: item.unit,
            damagedQty: item.damagedQty,
            unitCost: item.unitCost,
            lossAmount: (Number(item.damagedQty) || 0) * (Number(item.unitCost) || 0),
            damageReason: item.damageReason || grn.notes || 'Transit packaging defect / temperature deviation at dock',
            status: 'Return / Credit Filed',
          });
        }
      });
    });
    return list;
  }, [goodsReceivedNotes]);

  // Handle PO Selection in Create GRN Modal
  const handleSelectPO = (poId) => {
    setSelectedPOId(poId);
    const po = activeBranchPOs.find((p) => p.id === poId) || purchaseOrders.find((p) => p.id === poId);
    if (!po) return;

    setInvoiceNumber(po.invoiceNumber || `SINV-${po.supplierName?.slice(0, 3).toUpperCase() || 'SUP'}-${Math.floor(1000 + Math.random() * 9000)}`);
    setDeliveryChallan(`DC-${po.supplierName?.slice(0, 3).toUpperCase() || 'SUP'}-${Math.floor(1000 + Math.random() * 9000)}`);

    // Map items from PO
    const mapped = (po.items || []).map((it) => ({
      ingredientId: it.ingredientId,
      name: it.name,
      unit: it.unit,
      unitCost: it.unitCost,
      orderedQty: it.quantity,
      receivedQty: it.quantity,
      acceptedQty: it.quantity,
      damagedQty: 0,
      missingQty: 0,
      mfgDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      storageLocation: 'Kitchen Storage Rack 1',
      damageReason: '',
    }));
    setGrnItems(mapped);
  };

  // Update line item in modal
  const handleItemChange = (index, field, value) => {
    setGrnItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };

      // Auto-calculate accepted and damaged
      if (field === 'receivedQty' || field === 'damagedQty') {
        const rec = Number(field === 'receivedQty' ? value : item.receivedQty) || 0;
        const dam = Number(field === 'damagedQty' ? value : item.damagedQty) || 0;
        item.acceptedQty = Math.max(0, rec - dam);
        item.missingQty = Math.max(0, item.orderedQty - rec);
      }

      updated[index] = item;
      return updated;
    });
  };

  // Submit GRN
  const handleGRNSubmit = (e) => {
    e.preventDefault();
    if (!selectedPOId || grnItems.length === 0) {
      addToast('Please select a purchase order and verify items', 'error');
      return;
    }

    createGoodsReceivedNote({
      poId: selectedPOId,
      invoiceNumber,
      deliveryChallan,
      items: grnItems,
      notes: grnNotes,
    });

    setIsCreateGRNOpen(false);
    setSelectedPOId('');
    setInvoiceNumber('');
    setDeliveryChallan('');
    setGrnNotes('');
    setGrnItems([]);
  };

  const handlePrintGRN = (grn) => {
    const printWindow = window.open('', '_blank', 'width=800,height=800');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Goods Received Note - ${grn.grnNumber}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #0f172a; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
            .title { font-size: 20px; font-weight: 900; }
            .badge { display: inline-block; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; background: #e2e8f0; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 12px; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 12px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
            th { background: #f8fafc; font-weight: bold; }
            .summary { margin-top: 16px; text-align: right; font-size: 13px; line-height: 1.8; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">StockMate — Goods Received Note (GRN)</div>
              <div style="font-size: 12px; color: #64748b;">Restaurant Receiving & Stock Verification Protocol</div>
            </div>
            <div style="text-align: right;">
              <div style="font-family: monospace; font-size: 16px; font-weight: bold;">${grn.grnNumber}</div>
              <div style="font-size: 11px; color: #64748b;">Date: ${grn.receivedDate} ${grn.receivedTime || ''}</div>
            </div>
          </div>

          <div class="grid">
            <div>
              <strong>Restaurant Outlet:</strong> ${grn.restaurantName}${grn.branchName ? ` — ${grn.branchName}` : (currentBranch?.name ? ` — ${currentBranch.name}` : '')}<br/>
              <strong>Verified By:</strong> ${grn.verifiedBy}<br/>
              <strong>Status:</strong> <span class="badge">${grn.verificationStatus}</span>
            </div>
            <div>
              <strong>Supplier:</strong> ${grn.supplierName}<br/>
              <strong>PO Number:</strong> ${grn.poNumber}<br/>
              <strong>Invoice #:</strong> ${grn.invoiceNumber} | <strong>Challan:</strong> ${grn.deliveryChallan}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Ordered</th>
                <th>Received</th>
                <th>Accepted (Stocked)</th>
                <th>Damaged</th>
                <th>Batch ID</th>
                <th>Expiry</th>
                <th>Storage</th>
              </tr>
            </thead>
            <tbody>
              ${grn.items.map(it => `
                <tr>
                  <td><strong>${it.name}</strong></td>
                  <td>${it.orderedQty} ${it.unit}</td>
                  <td>${it.receivedQty} ${it.unit}</td>
                  <td style="color: #047857; font-weight: bold;">${it.acceptedQty} ${it.unit}</td>
                  <td style="color: ${it.damagedQty > 0 ? '#b91c1c' : '#64748b'}; font-weight: ${it.damagedQty > 0 ? 'bold' : 'normal'};">${it.damagedQty} ${it.unit}</td>
                  <td style="font-family: monospace;">${it.batchId || 'N/A'}</td>
                  <td>${it.expiryDate || 'N/A'}</td>
                  <td>${it.storageLocation || 'Kitchen Dry'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="summary">
            <div>Total Accepted Stock Value: <strong>₹${Number(grn.totalAcceptedAmount || 0).toLocaleString('en-IN')}</strong></div>
            <div style="color: #b91c1c;">Damaged Goods Loss: <strong>₹${Number(grn.totalDamageLoss || 0).toLocaleString('en-IN')}</strong></div>
            <div style="font-size: 11px; color: #64748b; margin-top: 8px;">Note: Only accepted quantities have been incremented in live inventory stock. Damaged items logged for credit note/return.</div>
          </div>

          <script>
            window.onload = () => { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Goods Receiving & Delivery Verification (GRN)"
        subtitle="Verify incoming supplier deliveries, inspect damaged goods, generate Goods Received Notes (GRNs), and issue QR-tracked batches."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={QrCode}
              onClick={() => navigate('/batch-tracking')}
            >
              QR &amp; Batch Console
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={ShoppingBag}
              onClick={() => navigate('/purchase-orders')}
            >
              Purchase Orders
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => {
                if (eligiblePOs.length > 0) {
                  handleSelectPO(eligiblePOs[0].id);
                }
                setIsCreateGRNOpen(true);
              }}
            >
              Receive Delivery &amp; Issue GRN
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          title="Total Deliveries"
          value={totalDeliveries}
          subtitle="Processed GRNs"
          icon={PackageCheck}
          variant="default"
        />
        <StatCard
          title="100% Accepted"
          value={verifiedAccepted}
          subtitle="Zero Damage Deliveries"
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title="Partial / Damaged"
          value={partiallyAccepted}
          subtitle="Damage Claims Filed"
          icon={AlertTriangle}
          variant={partiallyAccepted > 0 ? "warning" : "default"}
        />
        <StatCard
          title="Stock Accepted"
          value={formatINR(totalAcceptedValue)}
          subtitle="Added to Active Inventory"
          icon={Boxes}
          variant="default"
        />
        <StatCard
          title="Damaged Stock Loss"
          value={formatINR(totalDamageLoss)}
          subtitle={totalDamageLoss > 0 ? "Claimed for Return / Credit" : "Zero Damaged Items"}
          icon={IndianRupee}
          variant={totalDamageLoss > 0 ? "danger" : "default"}
        />
      </div>

      {/* Crucial Verification Notice */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 text-amber-950 text-xs flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-amber-950 text-sm">Strict Stock Verification Protocol Enforced</h4>
          <p className="mt-0.5 text-amber-900 leading-relaxed">
            Unverified goods are <strong>never automatically added to active stock</strong>. Every delivery must be inspected at the dock. Only quantities verified as <strong>Accepted</strong> are added to inventory and given unique QR batch labels. Damaged or rejected items are segregated and immediately logged for supplier credit note or return.
          </p>
        </div>
      </div>

      {/* Main Delivery Records & Empty State */}
      {totalDeliveries === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-10 sm:p-14 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <PackageCheck className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            No deliveries recorded for this branch yet.
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
            Purchase orders and verified supplier deliveries for this branch will appear here.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              icon={ShoppingBag}
              onClick={() => navigate('/purchase-orders')}
            >
              View Purchase Orders
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => {
                if (eligiblePOs.length > 0) {
                  handleSelectPO(eligiblePOs[0].id);
                }
                setIsCreateGRNOpen(true);
              }}
            >
              Receive Delivery &amp; Issue GRN
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Search and Filters */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by GRN number, PO number, supplier, or invoice..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs font-medium py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="all">All Verification Statuses</option>
                  <option value="Verified & Accepted">Verified &amp; Accepted</option>
                  <option value="Partially Accepted">Partially Accepted (Damaged)</option>
                  <option value="Rejected">Rejected at Dock</option>
                </select>
              </div>
            </div>
          </div>

          {/* GRN Records Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">GRN Number</th>
                    <th className="py-3.5 px-4">Received Date</th>
                    <th className="py-3.5 px-4">Supplier Name</th>
                    <th className="py-3.5 px-4">Purchase Order ID</th>
                    <th className="py-3.5 px-4">Invoice Number</th>
                    <th className="py-3.5 px-4">Delivery Challan</th>
                    <th className="py-3.5 px-4 text-center">Product Lines</th>
                    <th className="py-3.5 px-4 text-right">Accepted Value</th>
                    <th className="py-3.5 px-4 text-right">Damage Loss</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredGRNs.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-8 text-center text-xs text-slate-500">
                        No Goods Received Notes match your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredGRNs.map((grn) => {
                      const isPartial = grn.verificationStatus === 'Partially Accepted';

                      return (
                        <tr key={grn.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                            {grn.grnNumber}
                          </td>

                          <td className="py-3.5 px-4 text-slate-600">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{grn.receivedDate}</span>
                            </div>
                            <span className="text-[10px] text-slate-400">{grn.receivedTime || '10:00 AM'}</span>
                          </td>

                          <td className="py-3.5 px-4 font-semibold text-slate-900">
                            {grn.supplierName}
                          </td>

                          <td className="py-3.5 px-4 font-mono text-slate-700">
                            {grn.poNumber}
                          </td>

                          <td className="py-3.5 px-4 text-slate-800 font-mono">
                            {grn.invoiceNumber || '—'}
                          </td>

                          <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                            {grn.deliveryChallan || '—'}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span className="font-bold text-slate-800 px-2 py-0.5 bg-slate-100 rounded-md">
                              {grn.items.length} Lines
                            </span>
                            <div className="text-[10px] text-slate-500 truncate max-w-[160px] mx-auto mt-0.5" title={grn.items.map((it) => `${it.name} (${it.acceptedQty}/${it.receivedQty})`).join(', ')}>
                              {grn.items.map((it) => `${it.name}`).join(', ')}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <span className="font-bold text-emerald-800 text-sm">
                              {formatINR(grn.totalAcceptedAmount)}
                            </span>
                            <div className="text-[10px] text-emerald-600">Stocked</div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            {grn.totalDamageLoss > 0 ? (
                              <div>
                                <span className="text-rose-600 font-bold">
                                  {formatINR(grn.totalDamageLoss)}
                                </span>
                                <div className="text-[10px] text-rose-500">Return Claim</div>
                              </div>
                            ) : (
                              <span className="text-slate-400 font-medium">₹0</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                isPartial
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {isPartial ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                              <span>{grn.verificationStatus}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => setSelectedGRNDetails(grn)}
                                className="text-slate-600"
                              >
                                <Eye className="w-3.5 h-3.5 mr-1" />
                                Details
                              </Button>
                              <Button
                                variant="outline"
                                size="xs"
                                onClick={() => handlePrintGRN(grn)}
                                className="text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                              >
                                <Printer className="w-3.5 h-3.5 mr-1" />
                                Print GRN
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Honest Damaged Items & Rejections Section */}
      {totalDamageLoss === 0 ? (
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 text-emerald-950 text-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-emerald-950 text-sm">No damaged items recorded</span>
              <p className="text-emerald-800 text-xs mt-0.5">
                All deliveries received at <strong>{currentBranch?.name || 'this branch'}</strong> passed physical dock verification with ₹0 damage loss and zero rejected stock.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0">
            ₹0 Loss
          </span>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-rose-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 bg-rose-50/60 border-b border-rose-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wider">
                Itemized Damage Details &amp; Dock Rejections ({damagedItems.length} Records)
              </h4>
            </div>
            <span className="text-xs font-bold text-rose-700 bg-rose-100/80 px-2.5 py-1 rounded-full border border-rose-200">
              Total Loss: {formatINR(totalDamageLoss)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Damaged Product</th>
                  <th className="py-3 px-4 text-right">Damaged Qty</th>
                  <th className="py-3 px-4 text-right">Unit Cost</th>
                  <th className="py-3 px-4 text-right">Calculated Loss</th>
                  <th className="py-3 px-4">Damage Reason</th>
                  <th className="py-3 px-4">Linked GRN</th>
                  <th className="py-3 px-4">Supplier Name</th>
                  <th className="py-3 px-4">Received Date</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {damagedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-rose-50/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {item.name}
                    </td>
                    <td className="py-3 px-4 font-bold text-rose-700 text-right">
                      {item.damagedQty} {item.unit}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-right">
                      {formatINR(item.unitCost)}
                    </td>
                    <td className="py-3 px-4 font-bold text-rose-600 font-mono text-right">
                      {formatINR(item.lossAmount)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={item.damageReason}>
                      {item.damageReason}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {item.grnNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {item.supplierName}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {item.receivedDate}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create GRN / Verify Delivery Modal */}
      <Modal
        isOpen={isCreateGRNOpen}
        onClose={() => setIsCreateGRNOpen(false)}
        title="Verify Goods Delivery & Issue Goods Received Note (GRN)"
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleGRNSubmit} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <span className="font-bold text-slate-800 uppercase tracking-wider block text-[10px]">
              Inventory Manager Receiving Protocol
            </span>
            <p>
              Inspect all packages physically at the dock. Enter actual received, accepted, and damaged quantities. Accepted stock will be incremented with QR-batch IDs. Damaged stock will automatically generate return requests.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Purchase Order *
              </label>
              <select
                value={selectedPOId}
                onChange={(e) => handleSelectPO(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                required
              >
                <option value="">Choose dispatched purchase order...</option>
                {eligiblePOs.map((po) => (
                  <option key={po.id} value={po.id}>
                    {po.poNumber} — {po.supplierName} ({po.status.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <FormInput
              label="Supplier Invoice Number *"
              placeholder="e.g. SINV-GC-8812"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              required
            />

            <FormInput
              label="Delivery Challan Number *"
              placeholder="e.g. DC-GC-4401"
              value={deliveryChallan}
              onChange={(e) => setDeliveryChallan(e.target.value)}
              required
            />
          </div>

          {/* Line Items Verification Table */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Line Items Verification &amp; Batch Assignment
              </h5>
              <span className="text-[11px] text-slate-500">
                {grnItems.length} Product Line(s) in Order
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                    <th className="py-2.5 px-3">Product Name</th>
                    <th className="py-2.5 px-3 w-20">Ordered</th>
                    <th className="py-2.5 px-3 w-24">Received</th>
                    <th className="py-2.5 px-3 w-24">Accepted (Stock)</th>
                    <th className="py-2.5 px-3 w-24">Damaged</th>
                    <th className="py-2.5 px-3">Expiry Date</th>
                    <th className="py-2.5 px-3">Storage Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {grnItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-semibold text-slate-800">
                        {item.name}
                        <div className="text-[10px] text-slate-400">Unit: {item.unit} • Cost: {formatINR(item.unitCost)}</div>
                      </td>
                      <td className="py-2 px-3 text-slate-600 font-medium">
                        {item.orderedQty} {item.unit}
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          step="any"
                          value={item.receivedQty}
                          onChange={(e) => handleItemChange(idx, 'receivedQty', e.target.value)}
                          className="w-full p-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-900"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          step="any"
                          value={item.acceptedQty}
                          onChange={(e) => handleItemChange(idx, 'acceptedQty', e.target.value)}
                          className="w-full p-1.5 rounded-lg border border-emerald-300 bg-emerald-50/40 text-xs font-bold text-emerald-800"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          step="any"
                          value={item.damagedQty}
                          onChange={(e) => handleItemChange(idx, 'damagedQty', e.target.value)}
                          className="w-full p-1.5 rounded-lg border border-rose-300 bg-rose-50/40 text-xs font-bold text-rose-700"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="date"
                          value={item.expiryDate || ''}
                          onChange={(e) => handleItemChange(idx, 'expiryDate', e.target.value)}
                          className="w-full p-1.5 rounded-lg border border-slate-200 text-xs"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={item.storageLocation}
                          onChange={(e) => handleItemChange(idx, 'storageLocation', e.target.value)}
                          placeholder="Storage shelf/rack"
                          className="w-full p-1.5 rounded-lg border border-slate-200 text-xs"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Receiving Notes / Damage Observations
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Temperature checked at dock: 4°C. 5 packets of pav had torn outer wraps and were rejected."
              value={grnNotes}
              onChange={(e) => setGrnNotes(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" size="sm" onClick={() => setIsCreateGRNOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Generate GRN &amp; Add Accepted Stock
            </Button>
          </div>
        </form>
      </Modal>

      {/* GRN Details Modal */}
      {selectedGRNDetails && (
        <Modal
          isOpen={!!selectedGRNDetails}
          onClose={() => setSelectedGRNDetails(null)}
          title={`GRN Details: ${selectedGRNDetails.grnNumber}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2 py-0.5 rounded border">
                  {selectedGRNDetails.grnNumber}
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-1">{selectedGRNDetails.supplierName}</h4>
                <p className="text-slate-500 text-[11px]">PO Ref: {selectedGRNDetails.poNumber} • Invoice: {selectedGRNDetails.invoiceNumber}</p>
              </div>
              <Badge status={selectedGRNDetails.verificationStatus === 'Partially Accepted' ? 'warning' : 'active'} size="sm" />
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 text-[11px]">
                    <th className="p-2.5">Item</th>
                    <th className="p-2.5">Accepted Qty</th>
                    <th className="p-2.5">Damaged Qty</th>
                    <th className="p-2.5">Batch Assigned</th>
                    <th className="p-2.5">Expiry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedGRNDetails.items.map((it, i) => (
                    <tr key={i}>
                      <td className="p-2.5 font-semibold text-slate-800">{it.name}</td>
                      <td className="p-2.5 font-bold text-emerald-700">{it.acceptedQty} {it.unit}</td>
                      <td className="p-2.5 font-bold text-rose-600">{it.damagedQty || 0} {it.unit}</td>
                      <td className="p-2.5 font-mono text-[11px] text-slate-700">{it.batchId}</td>
                      <td className="p-2.5">{it.expiryDate || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => handlePrintGRN(selectedGRNDetails)}>
                <Printer className="w-3.5 h-3.5 mr-1" />
                Print GRN Document
              </Button>
              <Button variant="primary" size="sm" onClick={() => setSelectedGRNDetails(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

