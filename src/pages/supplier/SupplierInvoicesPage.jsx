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
  ShieldCheck,
  RotateCcw,
  Check,
  Plus,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { formatINR } from '../../data/inventoryBillingData';

export const SupplierInvoicesPage = () => {
  const navigate = useNavigate();
  const {
    supplierInvoices,
    supplierPayments,
    recordSupplierPayment,
    addToast,
    currentUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState('invoices'); // 'invoices' | 'payments'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Payment Settlement Modal
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [targetInvoiceForPay, setTargetInvoiceForPay] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('NEFT Bank Transfer');
  const [transactionRef, setTransactionRef] = useState('');

  // Filter invoices for this supplier
  const currentSupplierId = currentUser?.supplierId;
  const currentSupplierName = currentUser?.supplierName;
  const myInvoices = useMemo(() => {
    return (supplierInvoices || []).filter(
      (inv) =>
        !currentSupplierId ||
        inv.supplierId === currentSupplierId ||
        (currentSupplierName && inv.supplierName === currentSupplierName)
    );
  }, [supplierInvoices, currentSupplierId, currentSupplierName]);

  const myPayments = useMemo(() => {
    return (supplierPayments || []).filter(
      (pay) =>
        !currentSupplierId ||
        pay.supplierId === currentSupplierId ||
        (currentSupplierName && pay.supplierName === currentSupplierName)
    );
  }, [supplierPayments, currentSupplierId, currentSupplierName]);

  const displayInvoices = myInvoices;
  const displayPayments = myPayments;

  const totalInvoiced = displayInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const totalReceivables = displayInvoices.reduce((sum, inv) => sum + (inv.outstandingBalance || 0), 0);
  const totalSettled = displayInvoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
  const totalDeductions = displayInvoices.reduce(
    (sum, inv) => sum + (inv.damageDeduction || 0) + (inv.creditNoteApplied || 0),
    0
  );

  const filteredInvoices = displayInvoices.filter((inv) => {
    const matchSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.poNumber && inv.poNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inv.transactionRef && inv.transactionRef.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchStatus = statusFilter === 'all' || inv.paymentStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredPayments = displayPayments.filter((pay) => {
    return (
      pay.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pay.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pay.restaurantName && pay.restaurantName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (pay.transactionRef && pay.transactionRef.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const handleOpenReceivePayment = (inv) => {
    setTargetInvoiceForPay(inv);
    setPayAmount(inv.outstandingBalance ? inv.outstandingBalance.toString() : '');
    setPayMethod('NEFT Bank Transfer');
    setTransactionRef(`UTR-${Date.now().toString().slice(-6)}`);
    setIsPayModalOpen(true);
  };

  const handleConfirmReceivePayment = (e) => {
    e.preventDefault();
    if (!targetInvoiceForPay) return;

    const amt = Number(payAmount);
    if (!amt || amt <= 0) {
      addToast('Please enter a valid positive payment amount.', 'error');
      return;
    }

    if (amt > targetInvoiceForPay.outstandingBalance) {
      addToast(
        `Payment amount cannot exceed outstanding balance of ${formatINR(targetInvoiceForPay.outstandingBalance)}.`,
        'error'
      );
      return;
    }

    if (!transactionRef.trim()) {
      addToast('Transaction reference / UTR is required.', 'error');
      return;
    }

    recordSupplierPayment({
      invoiceId: targetInvoiceForPay.id,
      amount: amt,
      paymentMethod: payMethod,
      transactionRef: transactionRef.trim(),
    });

    setIsPayModalOpen(false);
    setTargetInvoiceForPay(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return <Badge status="success" label="Paid in Full" />;
      case 'Partially Paid':
        return <Badge status="info" label="Partially Paid" />;
      case 'Pending':
        return <Badge status="warning" label="Pending Payment" />;
      case 'Overdue':
        return <Badge status="error" label="Overdue" />;
      default:
        return <Badge status="default" label={status} />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supplier Sales Invoices & Receivables"
        subtitle={`Issued sales invoices, restaurant disbursements & payment settlement tracking for ${currentUser?.supplierName || 'Partner'}`}
        breadcrumbs={[
          { label: 'Supplier Portal', href: '#/supplier' },
          { label: 'Invoices & Receivables' },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={Printer}
            onClick={() => window.print()}
          >
            Print Receivables
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Invoiced"
          value={formatINR(totalInvoiced)}
          subtext="Billed sales orders"
          icon={Receipt}
          accentColor="slate"
        />
        <StatCard
          title="Outstanding Receivables"
          value={formatINR(totalReceivables)}
          subtext="Pending restaurant payment"
          icon={Clock}
          accentColor="amber"
        />
        <StatCard
          title="Settled Receipts"
          value={formatINR(totalSettled)}
          subtext={`Verified bank transfers (${displayPayments.length} payments)`}
          icon={CheckCircle2}
          accentColor="emerald"
        />
        <StatCard
          title="Credit & Damage Deductions"
          value={formatINR(totalDeductions)}
          subtext="Dock write-offs & fresh returns"
          icon={RotateCcw}
          accentColor="rose"
        />
      </div>

      {/* Navigation Tabs between Invoices and Settlement Receipts */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2.5 font-bold text-xs border-b-2 transition-all ${
            activeTab === 'invoices'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Sales Invoices ({displayInvoices.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2.5 font-bold text-xs border-b-2 transition-all ${
            activeTab === 'payments'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Received Payments & UTR Receipts ({displayPayments.length})
        </button>
      </div>

      {/* View 1: Invoices Table */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Table Filters */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search invoice #, restaurant, PO, or UTR ref..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-emerald-700"
              >
                <option value="all">All Invoices</option>
                <option value="Pending">Pending Payment</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Paid">Paid in Full</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Billed Restaurant</th>
                  <th className="py-3 px-4">PO Reference</th>
                  <th className="py-3 px-4">GRN Ref</th>
                  <th className="py-3 px-4 text-right">Gross Amount</th>
                  <th className="py-3 px-4 text-right">Deductions</th>
                  <th className="py-3 px-4 text-right">Net Payable</th>
                  <th className="py-3 px-4 text-right">Received</th>
                  <th className="py-3 px-4 text-right">Outstanding</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">UTR Ref</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="py-10 text-center text-slate-400">
                      <div className="font-bold text-slate-700 text-sm">
                        {myInvoices.length === 0 ? 'No Invoices Found' : 'No Invoices Match Filter'}
                      </div>
                      <div className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
                        {myInvoices.length === 0
                          ? 'Invoices are automatically created whenever a restaurant places a purchase order.'
                          : 'Try adjusting your search query or status filter.'}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 font-mono">
                        {inv.invoiceNumber}
                      </td>

                      <td className="py-3 px-4 text-slate-600 font-mono">
                        {inv.issueDate}
                      </td>

                      <td className="py-3 px-4 text-amber-700 font-semibold font-mono">
                        {inv.dueDate}
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {inv.restaurantName}
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-700 font-mono">
                        {inv.poNumber}
                      </td>

                      <td className="py-3 px-4 font-mono text-emerald-800">
                        {inv.verificationStatus || inv.grnNumber || 'Order Placed'}
                      </td>

                      <td className="py-3 px-4 text-right font-semibold text-slate-800">
                        <div>{formatINR(inv.totalAmount)}</div>
                        <div className="text-[10px] text-slate-400">Tax: {formatINR(inv.taxAmount)}</div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {(inv.damageDeduction > 0 || inv.creditNoteApplied > 0) ? (
                          <div className="text-[11px] text-rose-600 font-semibold">
                            -{formatINR((inv.damageDeduction || 0) + (inv.creditNoteApplied || 0))}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">₹0</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {formatINR(inv.netPayable)}
                      </td>

                      <td className="py-3 px-4 text-right text-emerald-700 font-bold">
                        {formatINR(inv.paidAmount || 0)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span
                          className={`font-bold ${
                            inv.outstandingBalance > 0 ? 'text-amber-700 text-sm' : 'text-slate-400'
                          }`}
                        >
                          {formatINR(inv.outstandingBalance)}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        {getStatusBadge(inv.paymentStatus)}
                      </td>

                      <td className="py-3 px-4">
                        {inv.transactionRef ? (
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded inline-block">
                            {inv.transactionRef}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="xs"
                            icon={Eye}
                            onClick={() => setSelectedInvoice(inv)}
                          >
                            View
                          </Button>
                          {inv.outstandingBalance > 0 && (
                            <Button
                              variant="brand"
                              size="xs"
                              icon={CreditCard}
                              onClick={() => handleOpenReceivePayment(inv)}
                            >
                              Receive
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
      )}

      {/* View 2: Received Payments & UTR Receipts */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search receipt #, invoice #, or UTR ref..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
              />
            </div>
            <div className="text-xs font-semibold text-slate-600">
              Showing {filteredPayments.length} Verified Payment Receipts
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Payment & Receipt #</th>
                  <th className="py-3 px-4">Invoice & PO</th>
                  <th className="py-3 px-4">Paying Restaurant</th>
                  <th className="py-3 px-4 text-right">Amount Received</th>
                  <th className="py-3 px-4">Method & Date</th>
                  <th className="py-3 px-4">UTR / Ref</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400">
                      <div className="font-bold text-slate-700 text-sm">No Payment Receipts Yet</div>
                      <div className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
                        Payments recorded by the restaurant or verified by supplier will be logged here.
                      </div>
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
                        <div className="font-semibold text-slate-800">{pay.restaurantName || 'Client Restaurant'}</div>
                        <div className="text-[11px] text-slate-400">Verified Client</div>
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
                          onClick={() => setSelectedPayment(pay)}
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
        </div>
      )}

      {/* Record Payment Settlement Modal */}
      {isPayModalOpen && targetInvoiceForPay && (
        <Modal
          isOpen={isPayModalOpen}
          onClose={() => {
            setIsPayModalOpen(false);
            setTargetInvoiceForPay(null);
          }}
          title="Record Received Payment Settlement"
          subtitle={`Log client payment receipt for ${targetInvoiceForPay.invoiceNumber}`}
          size="md"
        >
          <form onSubmit={handleConfirmReceivePayment} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 block text-[11px]">Invoice Number:</span>
                <span className="font-bold text-slate-800">{targetInvoiceForPay.invoiceNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Billed Client:</span>
                <span className="font-bold text-slate-800">{targetInvoiceForPay.restaurantName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Net Payable:</span>
                <span className="font-bold text-slate-800">{formatINR(targetInvoiceForPay.netPayable)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Outstanding Due:</span>
                <span className="font-bold text-amber-700 text-sm">{formatINR(targetInvoiceForPay.outstandingBalance)}</span>
              </div>
            </div>

            <FormInput
              label="Settlement Amount Received (₹) *"
              type="number"
              min="1"
              max={targetInvoiceForPay.outstandingBalance}
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Settlement Transfer Method *
              </label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
              >
                <option value="NEFT Bank Transfer">NEFT Bank Transfer</option>
                <option value="RTGS Transfer">RTGS High-Value Transfer</option>
                <option value="IMPS Instant Settlement">IMPS Instant Settlement</option>
                <option value="UPI Merchant Payment">UPI Merchant Payment</option>
                <option value="Cheque / Direct Clearing">Cheque / Direct Clearing</option>
                <option value="Corporate Credit Card">Corporate Credit Card</option>
              </select>
            </div>

            <FormInput
              label="Bank UTR / Transaction Reference Number *"
              type="text"
              placeholder="e.g. UTR-982144 or NEFT-ICICI-1044"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              required
            />

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsPayModalOpen(false);
                  setTargetInvoiceForPay(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="brand"
                size="sm"
                icon={CheckCircle2}
              >
                Verify & Record Payment
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* View Invoice Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title={`Sales Invoice — ${selectedInvoice.invoiceNumber}`}
          subtitle={`Billing statement for ${selectedInvoice.restaurantName}`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
              <div>
                <span className="text-slate-400 block text-[11px]">Invoice #</span>
                <span className="font-bold text-slate-900 text-sm">{selectedInvoice.invoiceNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[11px]">Payment Status</span>
                <div className="mt-0.5">{getStatusBadge(selectedInvoice.paymentStatus)}</div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-500">Supplier:</span>
                <span className="font-bold text-slate-800 ml-1">{selectedInvoice.supplierName}</span>
              </div>
              <div>
                <span className="text-slate-500">Customer:</span>
                <span className="font-bold text-slate-800 ml-1">{selectedInvoice.restaurantName}</span>
              </div>
              <div>
                <span className="text-slate-500">PO Ref:</span>
                <span className="font-bold text-slate-800 ml-1">{selectedInvoice.poNumber || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-slate-800 ml-1">{selectedInvoice.verificationStatus || selectedInvoice.grnNumber || 'N/A'}</span>
              </div>
            </div>

            <div className="space-y-2 p-3 bg-white border border-slate-200 rounded-xl">
              <div className="flex justify-between">
                <span className="text-slate-500">Billed Gross Total:</span>
                <span className="font-bold text-slate-800">{formatINR(selectedInvoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Damage Deductions (Dock GRN):</span>
                <span className="font-semibold text-rose-600">-{formatINR(selectedInvoice.damageDeduction)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Credit Notes Applied:</span>
                <span className="font-semibold text-emerald-700">-{formatINR(selectedInvoice.creditNoteApplied)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 font-bold">
                <span className="text-slate-800">Net Payable:</span>
                <span className="text-slate-900">{formatINR(selectedInvoice.netPayable)}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-700">
                <span>Received via Bank:</span>
                <span>{formatINR(selectedInvoice.paidAmount || 0)}</span>
              </div>
              <div className="flex justify-between font-bold text-amber-700 pt-1 border-t border-slate-200">
                <span>Outstanding Balance:</span>
                <span>{formatINR(selectedInvoice.outstandingBalance)}</span>
              </div>
            </div>

            {selectedInvoice.transactionRef && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
                <div className="font-bold mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Payment Confirmation Record
                </div>
                <div>UTR / Ref: <strong className="font-mono">{selectedInvoice.transactionRef}</strong></div>
                <div>Method: <strong>{selectedInvoice.paymentMethod}</strong></div>
                <div>Date: <strong>{selectedInvoice.paymentDate}</strong></div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
              {selectedInvoice.outstandingBalance > 0 && (
                <Button
                  variant="brand"
                  size="sm"
                  icon={CreditCard}
                  onClick={() => {
                    const inv = selectedInvoice;
                    setSelectedInvoice(null);
                    handleOpenReceivePayment(inv);
                  }}
                >
                  Receive Payment
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedInvoice(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* View Payment Receipt Modal */}
      {selectedPayment && (
        <Modal
          isOpen={!!selectedPayment}
          onClose={() => setSelectedPayment(null)}
          title={`Settlement Receipt — ${selectedPayment.receiptNumber || selectedPayment.paymentNumber}`}
          subtitle={`Verified bank settlement from ${selectedPayment.restaurantName}`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center text-emerald-950">
              <div>
                <span className="text-emerald-700 block text-[11px]">Payment Receipt Number</span>
                <span className="font-mono font-bold text-sm">{selectedPayment.receiptNumber || selectedPayment.paymentNumber}</span>
              </div>
              <Badge status="success" label="Payment Settled" />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Paying Restaurant:</span>
                <span className="font-bold text-slate-800">{selectedPayment.restaurantName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice Number:</span>
                <span className="font-mono font-bold text-slate-800">{selectedPayment.invoiceNumber}</span>
              </div>
              {selectedPayment.poNumber && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Purchase Order Ref:</span>
                  <span className="font-bold text-slate-800">{selectedPayment.poNumber}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Settlement Amount:</span>
                <span className="font-bold text-emerald-700 text-sm">{formatINR(selectedPayment.amountPaid)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transfer Method:</span>
                <span className="font-semibold text-slate-800">{selectedPayment.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bank UTR / Transaction Ref:</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {selectedPayment.transactionRef}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Date:</span>
                <span className="text-slate-800 font-semibold">{selectedPayment.paymentDate}</span>
              </div>
              {selectedPayment.verifiedBy && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Verified By:</span>
                  <span className="text-slate-700">{selectedPayment.verifiedBy}</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedPayment(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
