import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Receipt,
  Search,
  Filter,
  Download,
  Printer,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Calendar,
  IndianRupee,
  ShieldCheck,
  X,
  FileText,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { InvoiceModal } from '../../components/common/InvoiceModal';
import { formatINR } from '../../data/financeData';

export const InvoicesPage = () => {
  const { invoices, addToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // --------------------------------------------------------------------------
  // Summary Metrics
  // --------------------------------------------------------------------------
  const totalInvoicedAmount = invoices.reduce((acc, inv) => acc + (inv.amount || 0), 0);
  const paidInvoicesAmount = invoices
    .filter((inv) => inv.status === 'Paid')
    .reduce((acc, inv) => acc + (inv.amount || 0), 0);
  const pendingInvoicesAmount = invoices
    .filter((inv) => inv.status === 'Pending')
    .reduce((acc, inv) => acc + (inv.amount || 0), 0);
  const overdueInvoicesAmount = invoices
    .filter((inv) => inv.status === 'Overdue')
    .reduce((acc, inv) => acc + (inv.amount || 0), 0);
  const totalTaxCollected = invoices
    .filter((inv) => inv.status === 'Paid')
    .reduce((acc, inv) => acc + (inv.tax || 0), 0);

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        (inv.invoiceNumber && inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (inv.restaurantName && inv.restaurantName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (inv.ownerName && inv.ownerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (inv.transactionId && inv.transactionId.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredInvoices.length / pageSize) || 1;
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredInvoices.slice(start, start + pageSize);
  }, [filteredInvoices, currentPage, pageSize]);

  const handleOpenInvoice = (inv) => {
    setSelectedInvoice(inv);
    setIsInvoiceModalOpen(true);
  };

  const handleExportCSV = () => {
    const headers = [
      'Invoice Number',
      'Restaurant Name',
      'Owner',
      'Transaction ID',
      'Plan Description',
      'Base Amount (INR)',
      'Tax Amount (INR)',
      'Total Amount (INR)',
      'Issue Date',
      'Due Date',
      'Status',
    ];
    const rows = filteredInvoices.map((inv) => [
      `"${inv.invoiceNumber || inv.id}"`,
      `"${inv.restaurantName}"`,
      `"${inv.ownerName}"`,
      `"${inv.transactionId}"`,
      `"${inv.planName}"`,
      `"${inv.baseAmount}"`,
      `"${inv.tax}"`,
      `"${inv.amount}"`,
      `"${inv.issueDate}"`,
      `"${inv.dueDate}"`,
      `"${inv.status}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StockMate_Invoices_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Invoices exported to CSV.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Invoices & Receipts"
        subtitle="Official GST Tax invoices, SAC-998313 software licensing receipts, and tenant billing statements"
        badge={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Receipt className="w-3.5 h-3.5 text-blue-600" />
            GST Compliant Invoicing
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <StatCard
          title="Total Invoiced"
          value={formatINR(totalInvoicedAmount)}
          subtext="Cumulative billed"
          icon={Receipt}
          accentColor="blue"
        />

        <StatCard
          title="Paid Invoices"
          value={formatINR(paidInvoicesAmount)}
          subtext={`${invoices.filter((i) => i.status === 'Paid').length} cleared receipts`}
          icon={CheckCircle2}
          accentColor="emerald"
        />

        <StatCard
          title="Pending Due"
          value={formatINR(pendingInvoicesAmount)}
          subtext="Awaiting settlement"
          icon={Clock}
          accentColor="amber"
        />

        <StatCard
          title="Overdue Invoices"
          value={formatINR(overdueInvoicesAmount)}
          subtext="Action required"
          icon={AlertTriangle}
          accentColor="rose"
        />

        <StatCard
          title="Total GST (18%)"
          value={formatINR(totalTaxCollected)}
          subtext="Output tax liability"
          icon={IndianRupee}
          accentColor="purple"
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by invoice #, restaurant, owner, or TXN-ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/60 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Invoice Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
          </select>

          {(searchTerm || statusFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setCurrentPage(1);
              }}
              className="px-2.5 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 font-semibold"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[840px]">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Invoice Number</th>
                <th className="py-3.5 px-3">Restaurant & Owner</th>
                <th className="py-3.5 px-3">Transaction ID</th>
                <th className="py-3.5 px-3 text-right">Taxable Base (₹)</th>
                <th className="py-3.5 px-3 text-right">18% GST (₹)</th>
                <th className="py-3.5 px-3 text-right">Total Amount (₹)</th>
                <th className="py-3.5 px-3">Issue Date</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedInvoices.map((inv) => (
                <tr
                  key={inv.id}
                  onClick={() => handleOpenInvoice(inv)}
                  className="hover:bg-blue-50/40 cursor-pointer transition-colors duration-100 group"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-xs text-blue-600 group-hover:underline">
                    {inv.invoiceNumber || inv.id}
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-slate-900">{inv.restaurantName}</div>
                    <div className="text-xs text-slate-500">{inv.ownerName}</div>
                  </td>

                  <td className="py-3.5 px-3 font-mono text-xs text-slate-600">
                    {inv.transactionId}
                  </td>

                  <td className="py-3.5 px-3 text-right font-mono text-slate-700 text-xs">
                    {formatINR(inv.baseAmount || Math.round(inv.amount / 1.18))}
                  </td>

                  <td className="py-3.5 px-3 text-right font-mono text-slate-500 text-xs">
                    {formatINR(inv.tax || Math.round(inv.amount - inv.amount / 1.18))}
                  </td>

                  <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900 text-sm">
                    {formatINR(inv.amount)}
                  </td>

                  <td className="py-3.5 px-3 text-xs text-slate-600">
                    <div>{inv.issueDate}</div>
                    <div className="text-[10px] text-slate-400">Due: {inv.dueDate || 'On Receipt'}</div>
                  </td>

                  <td className="py-3.5 px-3">
                    {inv.status === 'Paid' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Paid
                      </span>
                    ) : inv.status === 'Pending' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        {inv.status}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div
                      className="flex items-center justify-end gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="outline"
                        size="xs"
                        icon={Eye}
                        onClick={() => handleOpenInvoice(inv)}
                        title="View Official Tax Invoice"
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="xs"
                        icon={Printer}
                        onClick={() => handleOpenInvoice(inv)}
                        title="Print / Save PDF"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-700">{filteredInvoices.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to <strong className="text-slate-700">{Math.min(currentPage * pageSize, filteredInvoices.length)}</strong> of <strong className="text-slate-700">{filteredInvoices.length}</strong> invoices
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="xs"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="xs"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        invoice={selectedInvoice}
      />
    </div>
  );
};

