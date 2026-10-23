import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CalendarCheck,
  Building2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  ArrowRight,
  Edit3,
  Search,
  Filter,
  Check,
  X,
  CreditCard,
  RefreshCw,
  TrendingUp,
  Receipt,
  Download,
  IndianRupee,
  ShieldCheck,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { InvoiceModal } from '../../components/common/InvoiceModal';
import {
  formatINR,
  PLAN_PRICING_INR,
} from '../../data/financeData';

export const SubscriptionsPage = () => {
  const {
    subscriptions,
    restaurants,
    invoices,
    updateSubscriptionPlan,
    toggleAutoRenewal,
    addToast,
  } = useApp();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [cycleFilter, setCycleFilter] = useState('all');

  // Plan Management Modal
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [selectedSubForPlan, setSelectedSubForPlan] = useState(null);
  const [planForm, setPlanForm] = useState({
    planId: 'plan-pro',
    billingCycle: 'Monthly',
  });

  // Invoice Modal
  const [invoiceModalData, setInvoiceModalData] = useState({
    isOpen: false,
    invoice: null,
  });

  // Details Modal
  const [selectedSubDetails, setSelectedSubDetails] = useState(null);

  // --------------------------------------------------------------------------
  // Summary Metrics
  // --------------------------------------------------------------------------
  const activeSubsCount = subscriptions.filter((s) => s.status === 'Active').length;
  const expiringSoonCount = subscriptions.filter((s) => s.status === 'Expiring Soon').length;
  const overdueCount = subscriptions.filter((s) => s.status === 'Overdue').length;
  const annualSubsCount = subscriptions.filter((s) => s.billingCycle === 'Yearly').length;
  const monthlySubsCount = subscriptions.filter((s) => s.billingCycle === 'Monthly').length;

  const totalMonthlyRunRate = subscriptions.reduce((acc, s) => {
    if (s.status !== 'Active') return acc;
    if (s.billingCycle === 'Yearly') {
      return acc + Math.round(s.renewalAmount / 12);
    }
    return acc + s.renewalAmount;
  }, 0);

  // Filtered Subscriptions
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((s) => {
      const matchesSearch =
        s.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      const matchesPlan = planFilter === 'all' || s.planId === planFilter;
      const matchesCycle = cycleFilter === 'all' || s.billingCycle === cycleFilter;

      return matchesSearch && matchesStatus && matchesPlan && matchesCycle;
    });
  }, [subscriptions, searchTerm, statusFilter, planFilter, cycleFilter]);

  // Open Manage Plan Modal
  const handleOpenManagePlan = (sub) => {
    setSelectedSubForPlan(sub);
    setPlanForm({
      planId: sub.planId,
      billingCycle: sub.billingCycle,
    });
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = (e) => {
    e.preventDefault();
    if (!selectedSubForPlan) return;
    updateSubscriptionPlan(selectedSubForPlan.id, planForm.planId, planForm.billingCycle);
    setIsPlanModalOpen(false);
  };

  const handleViewInvoice = (sub) => {
    const matchedInv =
      invoices.find((inv) => inv.restaurantId === sub.restaurantId) || {
        invoiceNumber: `STM-INV-${sub.id}`,
        restaurantName: sub.restaurantName,
        ownerName: sub.ownerName,
        ownerEmail: sub.ownerEmail,
        ownerPhone: sub.ownerPhone,
        address: 'Bandra Kurla Complex, Mumbai, MH',
        gstin: '27AABCU9603R1ZM',
        transactionId: sub.lastTransactionId || 'TXN-IND-90211',
        planName: `${sub.planName} Plan (${sub.billingCycle})`,
        amount: sub.renewalAmount,
        baseAmount: Math.round(sub.renewalAmount / 1.18),
        tax: Math.round(sub.renewalAmount - sub.renewalAmount / 1.18),
        issueDate: sub.lastPaymentDate || '2026-10-14',
        dueDate: sub.expiryDate,
        status: sub.paymentStatus === 'Success' ? 'Paid' : sub.paymentStatus,
      };

    setInvoiceModalData({
      isOpen: true,
      invoice: matchedInv,
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Tenant Subscription Management"
        subtitle="Manage active subscription tiers, billing frequencies, renewal dates, and tenant feature allowances"
        badge={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
            Recurring Subscriptions
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={() => {
                setStatusFilter('Expiring Soon');
                addToast('Filtered to expiring subscriptions.', 'info');
              }}
            >
              Expiring Soon ({expiringSoonCount})
            </Button>
          </div>
        }
      />

      {/* Expiring Soon / Action Alert Banner */}
      {expiringSoonCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-950">
                {expiringSoonCount} Subscription{expiringSoonCount > 1 ? 's' : ''} Expiring in the Next 7 Days
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Automated AutoPay mandates will execute 48 hours prior to expiry. Review tenant card health to prevent disruption.
              </p>
            </div>
          </div>
          <Button
            variant="brand"
            size="xs"
            onClick={() => setStatusFilter('Expiring Soon')}
            className="bg-amber-600 hover:bg-amber-700 text-white shrink-0"
          >
            Review Expiring Subscriptions
          </Button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <StatCard
          title="Active Subscriptions"
          value={activeSubsCount}
          subtext="Healthy recurring base"
          icon={CheckCircle2}
          accentColor="emerald"
        />

        <StatCard
          title="Expiring Soon"
          value={expiringSoonCount}
          subtext="Renewing in 7–14 days"
          icon={Clock}
          accentColor="amber"
        />

        <StatCard
          title="Overdue / Suspended"
          value={overdueCount}
          subtext="Payment required"
          icon={AlertCircle}
          accentColor="rose"
        />

        <StatCard
          title="Annual Billing"
          value={annualSubsCount}
          subtext="Long-term contracts"
          icon={Calendar}
          accentColor="purple"
        />

        <StatCard
          title="Monthly Billing"
          value={monthlySubsCount}
          subtext="Month-to-month"
          icon={CreditCard}
          accentColor="blue"
        />

        <StatCard
          title="MRR Run-Rate (₹)"
          value={formatINR(totalMonthlyRunRate)}
          subtext="Normalized monthly total"
          icon={TrendingUp}
          accentColor="emerald"
        />
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search subscriptions by restaurant or owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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

        <div className="flex flex-wrap items-center gap-2">
          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Expiring Soon">Expiring Soon</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
          </select>

          {/* Plan */}
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Plans</option>
            <option value="plan-starter">Starter</option>
            <option value="plan-pro">Professional</option>
            <option value="plan-enterprise">Enterprise</option>
          </select>

          {/* Cycle */}
          <select
            value={cycleFilter}
            onChange={(e) => setCycleFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Cycles</option>
            <option value="Monthly">Monthly</option>
            <option value="Yearly">Yearly</option>
          </select>

          {(searchTerm || statusFilter !== 'all' || planFilter !== 'all' || cycleFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                planFilter !== 'all' && setPlanFilter('all');
                setCycleFilter('all');
              }}
              className="px-2.5 py-1.5 rounded-xl text-xs text-rose-600 hover:bg-rose-50 font-semibold"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[920px]">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Restaurant & Owner</th>
                <th className="py-3.5 px-3">Subscription Tier</th>
                <th className="py-3.5 px-3">Billing Cycle</th>
                <th className="py-3.5 px-3">Duration (Start – Expiry)</th>
                <th className="py-3.5 px-3">Subscription Status</th>
                <th className="py-3.5 px-3">Renewal Amount (₹)</th>
                <th className="py-3.5 px-3">Auto-Renewal</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredSubscriptions.map((sub) => {
                return (
                  <tr
                    key={sub.id}
                    className="hover:bg-slate-50/70 transition-colors duration-100 group"
                  >
                    {/* Restaurant & Owner */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl shrink-0">{sub.logo || '🌿'}</span>
                        <div>
                          <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {sub.restaurantName}
                          </div>
                          <div className="text-xs text-slate-500">
                            {sub.ownerName} • {sub.ownerEmail}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Plan */}
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {sub.planName}
                      </span>
                    </td>

                    {/* Billing Cycle */}
                    <td className="py-3.5 px-3">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          sub.billingCycle === 'Yearly'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {sub.billingCycle}
                      </span>
                    </td>

                    {/* Dates */}
                    <td className="py-3.5 px-3 text-xs">
                      <div className="text-slate-800 font-medium">
                        Expires: <strong className="text-slate-900">{sub.expiryDate}</strong>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Since {sub.startDate}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      {sub.status === 'Active' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      ) : sub.status === 'Expiring Soon' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Expiring Soon
                        </span>
                      ) : sub.status === 'Overdue' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Overdue
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                          {sub.status}
                        </span>
                      )}
                    </td>

                    {/* Renewal Amount INR */}
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-900 text-sm">
                      {formatINR(sub.renewalAmount)}
                    </td>

                    {/* Auto-Renewal Status & Toggle */}
                    <td className="py-3.5 px-3">
                      <button
                        type="button"
                        onClick={() => toggleAutoRenewal(sub.id)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold transition-colors ${
                          sub.autoRenewal
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                        title="Click to toggle auto-renewal mandate"
                      >
                        {sub.autoRenewal ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Enabled</span>
                          </>
                        ) : (
                          <>
                            <X className="w-3 h-3 text-slate-400" />
                            <span>Paused</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="xs"
                          icon={Edit3}
                          onClick={() => handleOpenManagePlan(sub)}
                          title="Change Plan or Billing Frequency"
                        >
                          Manage Plan
                        </Button>
                        <Button
                          variant="outline"
                          size="xs"
                          icon={Receipt}
                          onClick={() => handleViewInvoice(sub)}
                          title="View Invoices"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manage Plan / Upgrade Modal */}
      <Modal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        title="Manage Subscription Plan"
        subtitle={`Configure subscription tier and billing frequency for ${selectedSubForPlan?.restaurantName}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSavePlan} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Subscription Tier
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(PLAN_PRICING_INR).map((plan) => {
                const isSelected = planForm.planId === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setPlanForm((prev) => ({ ...prev, planId: plan.id }))}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 text-blue-900 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs">{plan.name}</div>
                    <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                      {formatINR(plan.monthlyPrice)}/mo
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Billing Frequency
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPlanForm((prev) => ({ ...prev, billingCycle: 'Monthly' }))}
                className={`p-3 rounded-xl border text-center transition-all ${
                  planForm.billingCycle === 'Monthly'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-900 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold text-xs">Monthly Billing</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Flexible Month-to-Month</div>
              </button>

              <button
                type="button"
                onClick={() => setPlanForm((prev) => ({ ...prev, billingCycle: 'Yearly' }))}
                className={`p-3 rounded-xl border text-center transition-all ${
                  planForm.billingCycle === 'Yearly'
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-center gap-1">
                  <span>Yearly Billing</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 rounded">Save 16%</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Annual Advance Package</div>
              </button>
            </div>
          </div>

          {/* Pricing Calculation Preview */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Base Plan Fee:</span>
              <span className="font-mono font-semibold">
                {formatINR(
                  planForm.billingCycle === 'Yearly'
                    ? PLAN_PRICING_INR[planForm.planId]?.annualPrice
                    : PLAN_PRICING_INR[planForm.planId]?.monthlyPrice
                )}
              </span>
            </div>
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>Goods & Services Tax (18% GST):</span>
              <span className="font-mono">
                {formatINR(
                  Math.round(
                    (planForm.billingCycle === 'Yearly'
                      ? PLAN_PRICING_INR[planForm.planId]?.annualPrice
                      : PLAN_PRICING_INR[planForm.planId]?.monthlyPrice) * 0.18
                  )
                )}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
              <span>Next Renewal Payable:</span>
              <span className="font-mono text-emerald-700">
                {formatINR(
                  Math.round(
                    (planForm.billingCycle === 'Yearly'
                      ? PLAN_PRICING_INR[planForm.planId]?.annualPrice
                      : PLAN_PRICING_INR[planForm.planId]?.monthlyPrice) * 1.18
                  )
                )}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => setIsPlanModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="brand"
              size="sm"
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Update Subscription Plan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Invoice Viewer Modal */}
      <InvoiceModal
        isOpen={invoiceModalData.isOpen}
        onClose={() => setInvoiceModalData({ isOpen: false, invoice: null })}
        invoice={invoiceModalData.invoice}
      />
    </div>
  );
};

