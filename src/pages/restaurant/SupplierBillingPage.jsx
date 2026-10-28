import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Receipt,
  CreditCard,
  Building2,
  Calendar,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileText,
  IndianRupee,
  Printer,
  Eye,
  Plus,
  ArrowRight,
  ShieldCheck,
  PackageCheck,
  RotateCcw,
  Percent,
  Download,
  AlertCircle,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { formatINR } from '../../data/inventoryBillingData';

export const SupplierBillingPage = () => {
  const navigate = useNavigate();
  const {
    supplierInvoices,
    creditNotes,
    supplierPayments,
    goodsReceivedNotes,
    recordSupplierPayment,
    addToast,
    currentUser,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('invoices'); // 'invoices' | 'payments'
  const [statusFilter, setStatusFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');

  // Modals
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedInvoiceForPay, setSelectedInvoiceForPay] = useState(null);
  const [selectedInvoiceDetails, setSelectedInvoiceDetails] = useState(null);
  const [selectedPaymentDetails, setSelectedPaymentDetails] = useState(null);

  // Payment Form State
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('ICICI Current A/c (NEFT)');
  const [transactionRef, setTransactionRef] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Summary Metrics
  const totalBilledPurchases = useMemo(() => {
    return (supplierInvoices || []).reduce((acc, inv) => acc + (inv.totalAmount || 0), 0);
  }, [supplierInvoices]);

  const totalOutstandingDues = useMemo(() => {
    return (supplierInvoices || []).reduce((acc, inv) => acc + (inv.outstandingBalance || 0), 0);
  }, [supplierInvoices]);

  const totalPaidToSuppliers = useMemo(() => {
    return (supplierInvoices || []).reduce((acc, inv) => acc + (inv.paidAmount || 0), 0);
  }, [supplierInvoices]);

  const totalDamageDeductions = useMemo(() => {
    return (supplierInvoices || []).reduce((acc, inv) => acc + (inv.damageDeduction || 0), 0);
  }, [supplierInvoices]);

  const totalCreditNotesApplied = useMemo(() => {
    return (supplierInvoices || []).reduce((acc, inv) => acc + (inv.creditNoteApplied || 0), 0);
  }, [supplierInvoices]);

  // Unique Suppliers list for filter
  const uniqueSuppliers = useMemo(() => {
    const map = new Map();
    (supplierInvoices || []).forEach((inv) => {
      if (inv.supplierId && !map.has(inv.supplierId)) {
        map.set(inv.supplierId, inv.supplierName);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [supplierInvoices]);

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return (supplierInvoices || []).filter((inv) => {
      const matchSearch =
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inv.poNumber && inv.poNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (inv.grnNumber && inv.grnNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (inv.transactionRef && inv.transactionRef.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = statusFilter === 'all' || inv.paymentStatus === statusFilter;
      const matchSupplier = supplierFilter === 'all' || inv.supplierId === supplierFilter;

      return matchSearch && matchStatus && matchSupplier;
    });
  }, [supplierInvoices, searchTerm, statusFilter, supplierFilter]);

  const filteredPayments = useMemo(() => {
    return (supplierPayments || []).filter((pay) => {
      const matchSearch =
        !searchTerm ||
        (pay.paymentNumber && pay.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (pay.receiptNumber && pay.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (pay.invoiceNumber && pay.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (pay.supplierName && pay.supplierName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (pay.transactionRef && pay.transactionRef.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchSupplier = supplierFilter === 'all' || pay.supplierId === supplierFilter;

      return matchSearch && matchSupplier;
    });
  }, [supplierPayments, searchTerm, supplierFilter]);

  const handleOpenPayModal = (inv) => {
    setSelectedInvoiceForPay(inv);
    setPaymentAmount(inv.outstandingBalance.toString());
    setPaymentMethod('ICICI Current A/c (NEFT)');
    setTransactionRef(`NEFT-${Date.now().toString().slice(-6)}`);
    setPaymentNotes(`Verified payment settlement for ${inv.invoiceNumber}`);
    setIsPayModalOpen(true);
  };

  const handleProcessPayment = (e) => {
    e.preventDefault();

    if (!selectedInvoiceForPay) return;

    const amount = Number(paymentAmount);
    if (!amount || amount <= 0) {
      addToast('Please enter a valid positive payment amount.', 'error');
      return;
    }

    if (amount > selectedInvoiceForPay.outstandingBalance) {
      addToast(
        `Payment amount cannot exceed outstanding balance of ${formatINR(
          selectedInvoiceForPay.outstandingBalance
        )}.`,
        'error'
      );
      return;
    }

    if (!transactionRef.trim()) {
      addToast(
        'A verified Transaction Reference / UTR Number is required to record supplier payments.',
        'error'
      );
      return;
    }

    recordSupplierPayment({
      invoiceId: selectedInvoiceForPay.id,
      amount: amount,
      paymentMethod: paymentMethod,
      transactionRef: transactionRef.trim(),
    });

    setIsPayModalOpen(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return <Badge status="success" label="Paid in Full" />;
      case 'Partially Paid':
        return <Badge status="info" label="Partially Paid" />;
      case 'Pending':
        return <Badge status="warning" label="Payment Pending" />;
      case 'Overdue':
        return <Badge status="error" label="Overdue" />;
      case 'Disputed':
        return <Badge status="error" label="Disputed" />;
      default:
        return <Badge status="default" label={status} />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supplier Billing & Invoice Settlements"
        subtitle="Vendor tax invoices, GRN line-item reconciliations, damage adjustments & verified bank payments"
        breadcrumbs={[
          { label: 'Restaurant', href: '#/dashboard' },
          { label: 'Purchases', href: '#/purchase-orders' },
          { label: 'Supplier Billing' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Printer}
              onClick={() => window.print()}
            >
              Print Ledger
            </Button>
            <Button
              variant="brand"
              size="sm"
              icon={PackageCheck}
              onClick={() => navigate('/goods-receiving')}
            >
              Receiving Dock (GRN)
            </Button>
          </div>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Purchases"
          value={formatINR(totalBilledPurchases)}
          subtext="Gross billed procurement"
          icon={Receipt}
          accentColor="slate"
        />
        <StatCard
          title="Outstanding Dues"
          value={formatINR(totalOutstandingDues)}
          subtext="Pending vendor payments"
          icon={Clock}
          accentColor="amber"
        />
        <StatCard
          title="Settled Payments"
          value={formatINR(totalPaidToSuppliers)}
          subtext="Verified bank transfers"
          icon={CheckCircle2}
          accentColor="emerald"
        />
        <StatCard
          title="Damage Deductions"
          value={formatINR(totalDamageDeductions)}
          subtext="Dock rejection write-offs"
          icon={AlertTriangle}
          accentColor="rose"
        />
        <StatCard
          title="Credit Notes Applied"
          value={formatINR(totalCreditNotesApplied)}
          subtext="Fresh returns / concessions"
          icon={RotateCcw}
          accentColor="emerald"
        />
      </div>

      {/* Strict Accounting & Integrity Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-emerald-950 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-emerald-800/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              GRN-Linked Three-Way Match & Verified UTR Settlement
            </h4>
            <p className="text-xs text-slate-300">
              Only accepted quantities from verified GRNs are authorized for payment. Damaged goods are automatically deducted before settlement.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-900/60 text-emerald-200 border border-emerald-700/50">
            Tax Compliance: 5% & 12% GST Auto-Calculated
          </span>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Navigation Tabs: Invoices vs Settled Payments */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 px-4 pt-3 gap-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('invoices')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'invoices'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Supplier Invoices ({filteredInvoices.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('payments')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'payments'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Settled Payments &amp; UTR Receipts ({(supplierPayments || []).length})</span>
          </button>
        </div>

        {/* Table Filters Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={activeTab === 'invoices' ? "Search Invoice #, PO #, GRN #, UTR ref, or supplier..." : "Search Payment #, Receipt #, Invoice #, or UTR ref..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Filter className="w-3.5 h-3.5" /> Filters:
            </div>

            {activeTab === 'invoices' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-emerald-700"
              >
                <option value="all">All Payment Statuses</option>
                <option value="Pending">Pending Payment</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Paid">Paid in Full</option>
                <option value="Overdue">Overdue</option>
                <option value="Disputed">Disputed</option>
              </select>
            )}

            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-emerald-700"
            >
              <option value="all">All Suppliers</option>
              {uniqueSuppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Content: Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Invoice & Due Date</th>
                  <th className="py-3 px-4">Supplier Partner</th>
                  <th className="py-3 px-4">PO & GRN Ref</th>
                  <th className="py-3 px-4 text-right">Billed Amount</th>
                  <th className="py-3 px-4 text-right">Deductions</th>
                  <th className="py-3 px-4 text-right">Net Payable</th>
                  <th className="py-3 px-4 text-right">Outstanding</th>
                  <th className="py-3 px-4">Status & UTR</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-700 text-sm">No supplier invoices found</p>
                      <p className="text-xs text-slate-400 mt-0.5">Try adjusting your filters or complete a delivery GRN.</p>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{inv.invoiceNumber}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" /> Issued: {inv.issueDate}
                        </div>
                        <div className="text-[11px] font-medium text-amber-700">Due: {inv.dueDate}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{inv.supplierName}</div>
                        <div className="text-[11px] font-mono text-slate-400">
                          GST: {inv.supplierGstin || '27AABC...'}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-700">{inv.poNumber}</div>
                        <div className="text-[11px] font-mono text-emerald-800">{inv.grnNumber}</div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="font-semibold text-slate-800">{formatINR(inv.totalAmount)}</div>
                        <div className="text-[11px] text-slate-400">Tax: {formatINR(inv.taxAmount)}</div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {(inv.damageDeduction > 0 || inv.creditNoteApplied > 0) ? (
                          <div>
                            {inv.damageDeduction > 0 && (
                              <div className="text-[11px] text-rose-600 font-medium">
                                -Damages: {formatINR(inv.damageDeduction)}
                              </div>
                            )}
                            {inv.creditNoteApplied > 0 && (
                              <div className="text-[11px] text-emerald-600 font-medium">
                                -Credit: {formatINR(inv.creditNoteApplied)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">₹0</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="font-bold text-slate-900">{formatINR(inv.netPayable)}</div>
                        <div className="text-[11px] text-emerald-700 font-medium">
                          Paid: {formatINR(inv.paidAmount)}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div
                          className={`font-bold ${
                            inv.outstandingBalance > 0 ? 'text-amber-700 text-sm' : 'text-slate-400'
                          }`}
                        >
                          {formatINR(inv.outstandingBalance)}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 mb-1">
                          {getStatusBadge(inv.paymentStatus)}
                        </div>
                        {inv.transactionRef ? (
                          <div className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded inline-block">
                            Ref: {inv.transactionRef}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No payment record</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="xs"
                            icon={Eye}
                            onClick={() => setSelectedInvoiceDetails(inv)}
                          >
                            Invoice
                          </Button>

                          {inv.outstandingBalance > 0 && (
                            <Button
                              variant="brand"
                              size="xs"
                              icon={CreditCard}
                              onClick={() => handleOpenPayModal(inv)}
                            >
                              Pay
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
        )}

        {/* Table Content: Settled Payments Tab */}
        {activeTab === 'payments' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Payment &amp; Receipt #</th>
                  <th className="py-3 px-4">Invoice &amp; PO</th>
                  <th className="py-3 px-4">Supplier Partner</th>
                  <th className="py-3 px-4 text-right">Amount Settled</th>
                  <th className="py-3 px-4">Method &amp; Date</th>
                  <th className="py-3 px-4">Bank UTR / Ref</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <CreditCard className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-700 text-sm">No supplier payment records found</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Verified settlements and bank UTR transfers for this branch will appear here.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{pay.paymentNumber}</div>
                        <div className="text-[11px] font-mono text-emerald-700">{pay.receiptNumber || 'RCPT-SETTLED'}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{pay.invoiceNumber}</div>
                        <div className="text-[11px] text-slate-400">{pay.poNumber || 'PO-LINKED'}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{pay.supplierName}</div>
                        <div className="text-[11px] text-slate-400">{pay.restaurantName || 'Current Branch'}</div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="font-bold text-emerald-700 text-sm">{formatINR(pay.amountPaid)}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{pay.paymentMethod}</div>
                        <div className="text-[11px] text-slate-400">{pay.paymentDate}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                          {pay.transactionRef}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <Badge status="success" label={pay.status || 'Settled'} />
                      </td>

                      <td className="py-3 px-4 text-center">
                        <Button
                          variant="ghost"
                          size="xs"
                          icon={Eye}
                          onClick={() => setSelectedPaymentDetails(pay)}
                        >
                          Receipt
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Record Verified Supplier Payment */}
      {selectedInvoiceForPay && (
        <Modal
          isOpen={isPayModalOpen}
          onClose={() => setIsPayModalOpen(false)}
          title={`Record Supplier Payment — ${selectedInvoiceForPay.invoiceNumber}`}
          subtitle={`Disbursement to ${selectedInvoiceForPay.supplierName}`}
          size="md"
        >
          <form onSubmit={handleProcessPayment} className="space-y-4">
            {/* Invoice summary info */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Supplier:</span>
                <span className="font-bold text-slate-800">{selectedInvoiceForPay.supplierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Linked PO / GRN:</span>
                <span className="font-semibold text-slate-800">
                  {selectedInvoiceForPay.poNumber} • {selectedInvoiceForPay.grnNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Net Payable:</span>
                <span className="font-semibold text-slate-800">
                  {formatINR(selectedInvoiceForPay.netPayable)}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-700 font-bold">Outstanding Balance:</span>
                <span className="text-amber-700 font-bold text-sm">
                  {formatINR(selectedInvoiceForPay.outstandingBalance)}
                </span>
              </div>
            </div>

            {/* Payment Input */}
            <FormInput
              label="Settlement Amount in INR (₹) *"
              type="number"
              min="1"
              max={selectedInvoiceForPay.outstandingBalance}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              required
            />

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Payment Channel / Source Account *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
              >
                <option value="ICICI Current A/c (NEFT)">ICICI Bank Current A/c (NEFT/RTGS)</option>
                <option value="HDFC Corporate Visa Card">HDFC Corporate Visa Credit Card</option>
                <option value="SBI Corporate NetBanking">SBI Corporate NetBanking</option>
                <option value="Razorpay Business UPI">UPI / Instant Transfer</option>
                <option value="Company Cheque">Company Cheque / Demand Draft</option>
              </select>
            </div>

            {/* Mandatory UTR / Transaction Ref */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Bank UTR / Transaction Reference ID *</span>
                <span className="text-[10px] text-rose-600 font-bold uppercase">Mandatory</span>
              </label>
              <input
                type="text"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="e.g. NEFT-ICICI-0099882 or TXN-998811"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">
                StockMate requires a valid payment confirmation record before marking invoices as paid.
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Remarks</label>
              <input
                type="text"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                placeholder="Remarks or internal accounting notes..."
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsPayModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="brand"
                size="sm"
                icon={CheckCircle2}
              >
                Confirm Payment ({formatINR(Number(paymentAmount) || 0)})
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Formal Supplier Tax Invoice & Reconciliation Breakdown */}
      {selectedInvoiceDetails && (
        <Modal
          isOpen={!!selectedInvoiceDetails}
          onClose={() => setSelectedInvoiceDetails(null)}
          title={`Supplier Tax Invoice — ${selectedInvoiceDetails.invoiceNumber}`}
          subtitle="Three-way reconciled purchase audit document"
          size="lg"
        >
          <div className="space-y-4 printable-area">
            {/* Header info */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span className="text-emerald-400 text-xs font-bold tracking-wider uppercase">
                  Tax Invoice & Delivery Reconciliation
                </span>
                <h3 className="text-xl font-black text-white">{selectedInvoiceDetails.invoiceNumber}</h3>
                <div className="text-xs text-slate-300 mt-0.5">
                  Supplier: <strong>{selectedInvoiceDetails.supplierName}</strong>{selectedInvoiceDetails.supplierGstin ? ` (GSTIN: ${selectedInvoiceDetails.supplierGstin})` : ''}
                </div>
              </div>
              <div className="text-right sm:text-right">
                <div className="text-xs text-slate-300">Status</div>
                <div className="mt-1">{getStatusBadge(selectedInvoiceDetails.paymentStatus)}</div>
                <div className="text-[11px] text-slate-400 mt-1">Due: {selectedInvoiceDetails.dueDate}</div>
              </div>
            </div>

            {/* Bill To & Order References */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 font-bold block mb-1 uppercase text-[10px]">Billed To Customer:</span>
                <div className="font-bold text-slate-900">{selectedInvoiceDetails.restaurantName}</div>
                <div className="text-slate-500">FSSAI / GST Registered Commercial Kitchen</div>
              </div>
              <div>
                <span className="text-slate-400 font-bold block mb-1 uppercase text-[10px]">Verification References:</span>
                <div>PO Number: <strong className="font-mono">{selectedInvoiceDetails.poNumber}</strong></div>
                <div>GRN Ref: <strong className="font-mono text-emerald-800">{selectedInvoiceDetails.grnNumber}</strong></div>
                <div>Verification: <span className="text-emerald-700 font-semibold">{selectedInvoiceDetails.verificationStatus}</span></div>
              </div>
            </div>

            {/* Line items & deductions breakdown */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-right">Gross Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2 px-3 text-slate-800">
                      Procured Goods Subtotal (Per agreed PO purchase price)
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-slate-800">
                      {formatINR(selectedInvoiceDetails.subtotal)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-slate-800">
                      Goods & Services Tax (GST)
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-slate-800">
                      {formatINR(selectedInvoiceDetails.taxAmount)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-slate-800">
                      Cold-Chain Logistics / Delivery Handling
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-slate-800">
                      {formatINR(selectedInvoiceDetails.shippingFee)}
                    </td>
                  </tr>

                  {selectedInvoiceDetails.damageDeduction > 0 && (
                    <tr className="bg-rose-50/60">
                      <td className="py-2 px-3 font-semibold text-rose-700 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" /> Less: Dock Damaged Goods Deduction (GRN Rejection)
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-rose-600">
                        -{formatINR(selectedInvoiceDetails.damageDeduction)}
                      </td>
                    </tr>
                  )}

                  {selectedInvoiceDetails.creditNoteApplied > 0 && (
                    <tr className="bg-emerald-50/60">
                      <td className="py-2 px-3 font-semibold text-emerald-800 flex items-center gap-1.5">
                        <RotateCcw className="w-3.5 h-3.5" /> Less: Credit Notes / Fresh Unsold Agreement Offsets
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-700">
                        -{formatINR(selectedInvoiceDetails.creditNoteApplied)}
                      </td>
                    </tr>
                  )}

                  <tr className="bg-slate-50 font-bold border-t border-slate-300">
                    <td className="py-2.5 px-3 text-slate-900">Net Reconciled Payable</td>
                    <td className="py-2.5 px-3 text-right text-slate-900 text-sm">
                      {formatINR(selectedInvoiceDetails.netPayable)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Payment Audit Record */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="font-bold text-slate-800 mb-1 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Payment & Disbursement Audit
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-bold text-emerald-700">{formatINR(selectedInvoiceDetails.paidAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Remaining Due:</span>
                <span className="font-bold text-amber-700">{formatINR(selectedInvoiceDetails.outstandingBalance)}</span>
              </div>
              {selectedInvoiceDetails.transactionRef && (
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-500">Bank UTR / Transaction Ref:</span>
                  <span className="font-mono font-bold text-indigo-700">{selectedInvoiceDetails.transactionRef}</span>
                </div>
              )}
              {selectedInvoiceDetails.paymentDate && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Settlement Date:</span>
                  <span className="text-slate-700 font-medium">{selectedInvoiceDetails.paymentDate}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                icon={Printer}
                onClick={() => window.print()}
              >
                Print Tax Receipt
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedInvoiceDetails(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: View Supplier Payment Settlement Voucher */}
      {selectedPaymentDetails && (
        <Modal
          isOpen={!!selectedPaymentDetails}
          onClose={() => setSelectedPaymentDetails(null)}
          title={`Settlement Voucher: ${selectedPaymentDetails.paymentNumber}`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Total Amount Settled</span>
                <span className="text-2xl font-black text-emerald-950">{formatINR(selectedPaymentDetails.amountPaid)}</span>
              </div>
              <Badge status="success" label={selectedPaymentDetails.status || 'Settled'} />
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Supplier</span>
                <span className="font-bold text-slate-800">{selectedPaymentDetails.supplierName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Receipt Number</span>
                <span className="font-mono font-bold text-emerald-700">{selectedPaymentDetails.receiptNumber || 'RCPT-SETTLED'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Invoice Number</span>
                <span className="font-mono font-bold text-slate-700">{selectedPaymentDetails.invoiceNumber}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Payment Method</span>
                <span className="font-medium text-slate-700">{selectedPaymentDetails.paymentMethod}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Settlement Date</span>
                <span className="font-medium text-slate-700">{selectedPaymentDetails.paymentDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Bank UTR / Ref</span>
                <span className="font-mono font-bold text-indigo-700">{selectedPaymentDetails.transactionRef}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-600">
              Verified by: <strong>{selectedPaymentDetails.verifiedBy || 'Authorized Finance Officer'}</strong>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-200">
              <Button variant="outline" size="sm" icon={Printer} onClick={() => window.print()}>
                Print Voucher
              </Button>
              <Button variant="primary" size="sm" onClick={() => setSelectedPaymentDetails(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

