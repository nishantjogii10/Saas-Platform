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
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { formatINR } from '../../data/inventoryBillingData';

export const SupplierInvoicesPage = () => {
  const navigate = useNavigate();
  const { supplierInvoices, currentUser } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Filter invoices for this supplier
  const currentSupplierId = currentUser?.supplierId || 'sup-1';
  const myInvoices = useMemo(() => {
    return (supplierInvoices || []).filter(
      (inv) => inv.supplierId === currentSupplierId || inv.supplierName === currentUser?.supplierName
    );
  }, [supplierInvoices, currentSupplierId, currentUser]);

  // If no direct matches, show all supplier invoices for demo convenience
  const displayInvoices = myInvoices.length > 0 ? myInvoices : supplierInvoices || [];

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
          subtext="Verified bank transfers"
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

      {/* Invoices Table */}
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
                <th className="py-3 px-4">Invoice # & Date</th>
                <th className="py-3 px-4">Billed Restaurant</th>
                <th className="py-3 px-4">PO & GRN Ref</th>
                <th className="py-3 px-4 text-right">Gross Amount</th>
                <th className="py-3 px-4 text-right">Deductions</th>
                <th className="py-3 px-4 text-right">Net Payable</th>
                <th className="py-3 px-4 text-right">Outstanding</th>
                <th className="py-3 px-4">Status & UTR</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    No invoices match your filter.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{inv.invoiceNumber}</div>
                      <div className="text-[11px] text-slate-400">Issued: {inv.issueDate}</div>
                      <div className="text-[11px] font-medium text-amber-700">Due: {inv.dueDate}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{inv.restaurantName}</div>
                      <div className="text-[11px] text-slate-400">Commercial Client</div>
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
                        <div className="text-[11px] text-rose-600 font-semibold">
                          -{formatINR((inv.damageDeduction || 0) + (inv.creditNoteApplied || 0))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">₹0</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="font-bold text-slate-900">{formatINR(inv.netPayable)}</div>
                      <div className="text-[11px] text-emerald-700 font-semibold">
                        Received: {formatINR(inv.paidAmount)}
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
                      <div className="mb-1">{getStatusBadge(inv.paymentStatus)}</div>
                      {inv.transactionRef ? (
                        <div className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded inline-block">
                          Ref: {inv.transactionRef}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Pending Transfer</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <Button
                        variant="ghost"
                        size="xs"
                        icon={Eye}
                        onClick={() => setSelectedInvoice(inv)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
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
                <span>{formatINR(selectedInvoice.paidAmount)}</span>
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

            <div className="pt-2 border-t border-slate-200 flex justify-end">
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
    </div>
  );
};

