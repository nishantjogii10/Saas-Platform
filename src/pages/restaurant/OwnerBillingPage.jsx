import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Receipt,
  CreditCard,
  Building2,
  CalendarCheck,
  TrendingUp,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Filter,
  FileText,
  Store,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { InvoiceModal } from '../../components/common/InvoiceModal';
import { formatINR } from '../../data/branchData';

export const OwnerBillingPage = () => {
  const navigate = useNavigate();
  const {
    branches,
    branchInvoices,
    addToast,
  } = useApp();

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('all');

  // Invoice Modal State
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Financial calculations
  const totalSpendYTD = branchInvoices.reduce((acc, inv) => acc + (inv.amount || 0), 0);
  const totalTaxPaid = branchInvoices.reduce((acc, inv) => acc + (inv.tax || 0), 0);

  const monthlyRunRate = branches.reduce((acc, b) => {
    if (b.status !== 'active') return acc;
    if (b.billingCycle === 'Yearly') {
      return acc + Math.round(b.price / 12);
    }
    return acc + b.price;
  }, 0);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return branchInvoices.filter((inv) => {
      const matchesSearch =
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.transactionId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesBranch = selectedBranchFilter === 'all' || inv.branchId === selectedBranchFilter;

      return matchesSearch && matchesBranch;
    });
  }, [branchInvoices, searchTerm, selectedBranchFilter]);

  const handleOpenInvoice = (inv) => {
    setSelectedInvoice(inv);
    setIsInvoiceModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Billing & Subscription Invoices"
        subtitle="Access tax-compliant GST invoices, payment receipts, and branch-specific subscription billing summaries."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={CalendarCheck}
              onClick={() => navigate('/branch-subscriptions')}
            >
              Subscription Dashboard
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Sparkles}
              onClick={() => navigate('/branch-plans')}
            >
              Manage Plans
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Paid YTD"
          value={formatINR(totalSpendYTD)}
          subtitle="All Outlets Combined"
          icon={Receipt}
          variant="success"
        />
        <StatCard
          title="Monthly Run-Rate"
          value={formatINR(monthlyRunRate)}
          subtitle="Normalized Subscription Cost"
          icon={TrendingUp}
          variant="default"
        />
        <StatCard
          title="GST Input Credit (18%)"
          value={formatINR(totalTaxPaid)}
          subtitle="Eligible for Business ITC"
          icon={ShieldCheck}
          variant="default"
        />
        <StatCard
          title="Subscribed Outlets"
          value={`${branches.length} Branches`}
          subtitle="Independent Plans"
          icon={Store}
          variant="default"
        />
      </div>

      {/* Branch Subscription Ledger Summary */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">
              Active Branch Subscription Ledger
            </h4>
            <p className="text-xs text-slate-500">
              Each outlet's active tier, billing cycle, next auto-renewal date, and recurring charges.
            </p>
          </div>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => navigate('/branch-subscriptions')}
            className="text-xs text-emerald-700 self-start sm:self-auto"
          >
            Change Tiers &rarr;
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {branches.map((b) => (
            <div
              key={b.id}
              className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold bg-white px-1.5 py-0.5 rounded border text-slate-700">
                    {b.code}
                  </span>
                  <h5 className="font-bold text-slate-900 text-xs sm:text-sm mt-1">
                    {b.name.replace('Spice Garden — ', '')}
                  </h5>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    b.planName === 'Enterprise'
                      ? 'bg-purple-100 text-purple-800'
                      : b.planName === 'Professional'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {b.planName}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Cycle:</span>
                  <strong className="text-slate-800">{b.billingCycle}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Base Cost:</span>
                  <strong className="text-slate-800">{formatINR(b.price)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>18% GST:</span>
                  <strong className="text-slate-800">
                    {formatINR(b.gstAmount || Math.round(b.price * 0.18))}
                  </strong>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Renewal Total:</span>
                  <span className="text-emerald-700">{formatINR(b.totalRenewalPrice)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Renews: {b.renewalDate}</span>
                <span className="text-emerald-700 font-semibold">
                  {b.autoRenewal ? 'AutoPay ON' : 'Manual'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invoices & Receipts Table */}
      <div className="space-y-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search invoices by number, branch, or transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedBranchFilter}
                onChange={(e) => setSelectedBranchFilter(e.target.value)}
                className="text-xs font-medium py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="all">All Branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Invoice No.</th>
                  <th className="py-3.5 px-4">Branch Outlet</th>
                  <th className="py-3.5 px-4">Plan &amp; Period</th>
                  <th className="py-3.5 px-4">Base + 18% GST</th>
                  <th className="py-3.5 px-4">Total Paid (₹)</th>
                  <th className="py-3.5 px-4">Payment Method &amp; Txn ID</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-xs text-slate-500">
                      No invoices match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {inv.invoiceNumber}
                        <div className="text-[10px] text-slate-400 font-sans font-normal">
                          {inv.issueDate}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{inv.branchName}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{inv.planName}</div>
                        <div className="text-[10px] text-slate-400">{inv.period}</div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">
                        <div>Base: {formatINR(inv.baseAmount)}</div>
                        <div className="text-[10px] text-slate-400">GST: {formatINR(inv.tax)}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 text-sm">
                          {formatINR(inv.amount)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{inv.paymentMethod}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {inv.transactionId}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Paid</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => handleOpenInvoice(inv)}
                          className="text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                        >
                          <Printer className="w-3 h-3 mr-1" />
                          Tax Invoice
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Invoice Modal Preview */}
      {selectedInvoice && (
        <InvoiceModal
          isOpen={isInvoiceModalOpen}
          onClose={() => {
            setIsInvoiceModalOpen(false);
            setSelectedInvoice(null);
          }}
          invoice={{
            ...selectedInvoice,
            restaurantName: selectedInvoice.branchName,
            plan: selectedInvoice.planName,
            status: selectedInvoice.status,
          }}
        />
      )}
    </div>
  );
};

