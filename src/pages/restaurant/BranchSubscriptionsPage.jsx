import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  CalendarCheck,
  Building2,
  Users,
  CreditCard,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  Search,
  Filter,
  CheckCircle2,
  Check,
  X,
  FileText,
  Download,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  Info,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { formatINR, BRANCH_PLANS_CONFIG } from '../../data/branchData';

export const BranchSubscriptionsPage = () => {
  const navigate = useNavigate();
  const {
    branches,
    currentBranchId,
    branchStaff,
    updateBranchSubscription,
    addToast,
  } = useApp();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [cycleFilter, setCycleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Selected branch for detail panel / modal
  const [selectedBranchDetail, setSelectedBranchDetail] = useState(null);

  // Upgrade / Change Plan Modal
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [targetBranchForUpgrade, setTargetBranchForUpgrade] = useState(null);
  const [upgradePlanId, setUpgradePlanId] = useState('plan-pro');
  const [upgradeCycle, setUpgradeCycle] = useState('Monthly');

  // --------------------------------------------------------------------------
  // KPI Calculations (Prompt requirement: 7 specific KPI cards)
  // 1. Total Branches
  // 2. Active Branches
  // 3. Total Managers
  // 4. Total Staff Members
  // 5. Monthly Subscription Cost
  // 6. Pending Payments
  // 7. Subscriptions Expiring Soon
  // --------------------------------------------------------------------------
  const totalBranches = branches.length;
  const activeBranches = branches.filter((b) => b.status === 'active').length;
  const totalManagers = branchStaff.filter((s) => s.isManager).length;
  const totalStaffMembers = branchStaff.length;

  const monthlySubscriptionCost = branches.reduce((acc, b) => {
    if (b.status !== 'active') return acc;
    if (b.billingCycle === 'Yearly') {
      return acc + Math.round(b.price / 12);
    }
    return acc + b.price;
  }, 0);

  const pendingPayments = branches.reduce((acc, b) => {
    if (b.paymentStatus === 'Pending' || b.paymentStatus === 'Failed') {
      return acc + b.totalRenewalPrice;
    }
    return acc;
  }, 0);

  // Expiring soon: within next 30 days
  const now = new Date();
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expiringSoonCount = branches.filter((b) => {
    if (!b.renewalDate) return false;
    const renDate = new Date(b.renewalDate);
    return renDate >= now && renDate <= thirtyDaysLater;
  }).length;

  // Filtered branches
  const filteredBranches = useMemo(() => {
    return branches.filter((b) => {
      const matchesSearch =
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.managerName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPlan = planFilter === 'all' || b.planId === planFilter;
      const matchesCycle = cycleFilter === 'all' || b.billingCycle === cycleFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && b.status === 'active') ||
        (statusFilter === 'inactive' && b.status === 'inactive') ||
        (statusFilter === 'expiring' && expiringSoonCount > 0);

      return matchesSearch && matchesPlan && matchesCycle && matchesStatus;
    });
  }, [branches, searchTerm, planFilter, cycleFilter, statusFilter, expiringSoonCount]);

  // Paginated data
  const totalPages = Math.ceil(filteredBranches.length / itemsPerPage) || 1;
  const paginatedBranches = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBranches.slice(start, start + itemsPerPage);
  }, [filteredBranches, currentPage]);

  // Handle Open Upgrade
  const handleOpenUpgrade = (branch) => {
    setTargetBranchForUpgrade(branch);
    setUpgradePlanId(branch.planId || 'plan-pro');
    setUpgradeCycle(branch.billingCycle || 'Monthly');
    setIsUpgradeModalOpen(true);
  };

  // Submit Upgrade
  const handleUpgradeSubmit = (e) => {
    e.preventDefault();
    if (!targetBranchForUpgrade) return;

    updateBranchSubscription(targetBranchForUpgrade.id, upgradePlanId, upgradeCycle);
    setIsUpgradeModalOpen(false);
    setTargetBranchForUpgrade(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Branch-Wise Subscription Dashboard"
        subtitle="Manage independent subscription tiers, renewal dates, seat allocations, and invoices for each restaurant outlet."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Sparkles}
              onClick={() => navigate('/branch-plans')}
            >
              Compare Plan Tiers
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={CreditCard}
              onClick={() => navigate('/billing')}
            >
              Billing &amp; Receipts
            </Button>
          </div>
        }
      />

      {/* 7 KPI Cards (as specified in prompt) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <StatCard
          title="Total Branches"
          value={totalBranches}
          subtitle="All Outlets"
          icon={Building2}
          variant="default"
        />
        <StatCard
          title="Active Outlets"
          value={activeBranches}
          subtitle="Operational"
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title="Total Managers"
          value={totalManagers}
          subtitle="Branch Leads"
          icon={Users}
          variant="default"
        />
        <StatCard
          title="Staff Members"
          value={totalStaffMembers}
          subtitle="Active Roster"
          icon={Users}
          variant="default"
        />
        <StatCard
          title="Monthly Cost"
          value={formatINR(monthlySubscriptionCost)}
          subtitle="Run Rate"
          icon={TrendingUp}
          variant="default"
        />
        <StatCard
          title="Pending Dues"
          value={formatINR(pendingPayments)}
          subtitle="Awaiting Mandate"
          icon={Clock}
          variant={pendingPayments > 0 ? "warning" : "default"}
        />
        <StatCard
          title="Expiring Soon"
          value={expiringSoonCount}
          subtitle="Next 30 Days"
          icon={AlertTriangle}
          variant={expiringSoonCount > 0 ? "warning" : "default"}
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by branch name, code, or manager..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Plan Filter */}
            <select
              value={planFilter}
              onChange={(e) => {
                setPlanFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs font-medium py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">All Plans</option>
              <option value="plan-starter">Starter</option>
              <option value="plan-pro">Professional</option>
              <option value="plan-enterprise">Enterprise</option>
            </select>

            {/* Cycle Filter */}
            <select
              value={cycleFilter}
              onChange={(e) => {
                setCycleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs font-medium py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">All Billing Cycles</option>
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs font-medium py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
              <option value="expiring">Expiring Soon</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subscription Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Branch Outlet</th>
                <th className="py-3.5 px-4">Manager</th>
                <th className="py-3.5 px-4">Staff Quota</th>
                <th className="py-3.5 px-4">Assigned Plan</th>
                <th className="py-3.5 px-4">Billing Cycle</th>
                <th className="py-3.5 px-4">Subscription Price</th>
                <th className="py-3.5 px-4">Renewal Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedBranches.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-xs text-slate-500">
                    No branch subscriptions match the selected criteria.
                  </td>
                </tr>
              ) : (
                paginatedBranches.map((branch) => {
                  const isCurrent = branch.id === currentBranchId;
                  const staffInBranch = branchStaff.filter((s) => s.branchId === branch.id);
                  const planConfig = BRANCH_PLANS_CONFIG[branch.planId] || BRANCH_PLANS_CONFIG['plan-starter'];
                  const isQuotaNear = staffInBranch.length >= planConfig.maxStaff;

                  return (
                    <tr
                      key={branch.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isCurrent ? 'bg-emerald-50/30' : ''
                      }`}
                    >
                      {/* Branch Name & Code */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{branch.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                          <span>{branch.code}</span>
                          <span>•</span>
                          <span className="text-slate-600">{branch.type}</span>
                        </div>
                      </td>

                      {/* Manager */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{branch.managerName}</div>
                        <div className="text-[11px] text-slate-400">{branch.managerEmail}</div>
                      </td>

                      {/* Staff Quota */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">
                            {staffInBranch.length} / {planConfig.maxStaff === 999 ? '∞' : planConfig.maxStaff}
                          </span>
                          {isQuotaNear && planConfig.maxStaff !== 999 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                              Full
                            </span>
                          )}
                        </div>
                        <div className="w-24 bg-slate-200 rounded-full h-1.5 mt-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              isQuotaNear ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{
                              width: `${Math.min(
                                100,
                                Math.round((staffInBranch.length / planConfig.maxStaff) * 100)
                              )}%`,
                            }}
                          />
                        </div>
                      </td>

                      {/* Plan */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block font-semibold px-2.5 py-1 rounded-full text-xs ${
                            branch.planName === 'Enterprise'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : branch.planName === 'Professional'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {branch.planName}
                        </span>
                      </td>

                      {/* Billing Cycle */}
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {branch.billingCycle}
                        </span>
                      </td>

                      {/* Price in INR */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{formatINR(branch.price)}</div>
                        <div className="text-[10px] text-slate-400">
                          +18% GST ({formatINR(branch.gstAmount || Math.round(branch.price * 0.18))})
                        </div>
                      </td>

                      {/* Renewal Date */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{branch.renewalDate}</div>
                        <div className="text-[10px] text-slate-400">
                          {branch.autoRenewal ? 'Auto-Pay Active' : 'Manual Renewal'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <Badge status={branch.status} size="sm" />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => setSelectedBranchDetail(branch)}
                            className="text-slate-600 hover:text-slate-900"
                          >
                            Details
                          </Button>
                          <Button
                            variant="primary"
                            size="xs"
                            onClick={() => handleOpenUpgrade(branch)}
                            className="text-xs bg-emerald-600 hover:bg-emerald-700"
                          >
                            Change Plan
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

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50/70 border-t border-slate-200 text-xs text-slate-500">
          <span>
            Showing {paginatedBranches.length} of {filteredBranches.length} branch subscriptions
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white disabled:opacity-50 hover:bg-slate-50 transition-colors"
            >
              Previous
            </button>
            <span className="px-2 font-semibold text-slate-800">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white disabled:opacity-50 hover:bg-slate-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Plan Feature Comparison Guide */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/60 via-white to-emerald-50/50 border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Branch Subscription Plan Comparison Matrix
            </h4>
            <p className="text-xs text-slate-500">
              StockMate allows independent tier allocation per outlet. Upgrade busy outlets to Professional or Enterprise while keeping express kitchens on Starter.
            </p>
          </div>
          <Button
            variant="outline"
            size="xs"
            onClick={() => navigate('/branch-plans')}
            icon={ArrowRight}
            className="text-xs self-start sm:self-auto"
          >
            Full Tier Specifications
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.values(BRANCH_PLANS_CONFIG).map((plan) => (
            <div
              key={plan.id}
              className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{plan.name}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {plan.badge}
                </span>
              </div>
              <div>
                <span className="text-lg font-black text-slate-900">
                  {formatINR(plan.monthlyPrice)}
                </span>
                <span className="text-xs text-slate-500"> / month</span>
                <div className="text-[11px] text-emerald-700 font-medium">
                  or {formatINR(plan.yearlyPrice)} / year (Save ~17%)
                </div>
              </div>
              <ul className="text-xs space-y-1.5 text-slate-600">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    Up to <strong>{plan.maxStaff === 999 ? 'Unlimited' : plan.maxStaff} staff members</strong>
                  </span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    Up to <strong>{plan.maxIngredients} inventory items</strong>
                  </span>
                </li>
                {plan.features.slice(4, 8).map((f, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    {f.included ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    )}
                    <span className={f.included ? 'text-slate-700' : 'text-slate-400 line-through'}>
                      {f.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade / Change Plan Modal */}
      {targetBranchForUpgrade && (
        <Modal
          isOpen={isUpgradeModalOpen}
          onClose={() => {
            setIsUpgradeModalOpen(false);
            setTargetBranchForUpgrade(null);
          }}
          title={`Change Subscription Plan: ${targetBranchForUpgrade.name}`}
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleUpgradeSubmit} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="text-slate-500">Currently Assigned Plan:</div>
              <div className="font-bold text-slate-900">
                {targetBranchForUpgrade.planName} ({targetBranchForUpgrade.billingCycle}) —{' '}
                {formatINR(targetBranchForUpgrade.price)}
              </div>
            </div>

            {/* Billing Cycle Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Billing Interval
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setUpgradeCycle('Monthly')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    upgradeCycle === 'Monthly'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Monthly Billing
                </button>
                <button
                  type="button"
                  onClick={() => setUpgradeCycle('Yearly')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    upgradeCycle === 'Yearly'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Yearly Billing (Save ~17%)
                </button>
              </div>
            </div>

            {/* Plan Tier Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Choose New Plan Tier
              </label>
              <div className="space-y-2">
                {Object.values(BRANCH_PLANS_CONFIG).map((plan) => {
                  const isSelected = upgradePlanId === plan.id;
                  const price =
                    upgradeCycle === 'Yearly' ? plan.yearlyPrice : plan.monthlyPrice;

                  return (
                    <div
                      key={plan.id}
                      onClick={() => setUpgradePlanId(plan.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-500'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">{plan.name}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            Max {plan.maxStaff === 999 ? 'Unlimited' : `${plan.maxStaff} staff`}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Includes {plan.maxIngredients} ingredients &amp; {plan.badge} features
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm text-slate-900">
                          {formatINR(price)}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          /{upgradeCycle === 'Yearly' ? 'year' : 'month'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Price Breakdown */}
            {(() => {
              const selectedPlan = BRANCH_PLANS_CONFIG[upgradePlanId];
              const basePrice =
                upgradeCycle === 'Yearly'
                  ? selectedPlan?.yearlyPrice
                  : selectedPlan?.monthlyPrice;
              const gst = Math.round(basePrice * 0.18);
              const total = basePrice + gst;

              return (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-600">
                    <span>Base Subscription Cost:</span>
                    <strong className="text-slate-900">{formatINR(basePrice)}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>CGST + SGST (18%):</span>
                    <strong className="text-slate-900">{formatINR(gst)}</strong>
                  </div>
                  <div className="flex justify-between text-emerald-800 font-bold pt-1 border-t border-slate-200 text-sm">
                    <span>Total Renewal Price:</span>
                    <span>{formatINR(total)}</span>
                  </div>
                </div>
              );
            })()}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsUpgradeModalOpen(false);
                  setTargetBranchForUpgrade(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Confirm &amp; Apply Plan
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Detailed Branch Information Panel Modal */}
      {selectedBranchDetail && (
        <Modal
          isOpen={!!selectedBranchDetail}
          onClose={() => setSelectedBranchDetail(null)}
          title={`Subscription Breakdown: ${selectedBranchDetail.name}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white border text-slate-700">
                  {selectedBranchDetail.code}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {selectedBranchDetail.name}
                </h3>
                <p className="text-xs text-slate-500">{selectedBranchDetail.address}</p>
              </div>
              <Badge status={selectedBranchDetail.status} size="sm" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Current Plan</span>
                <strong className="text-slate-900 text-sm">{selectedBranchDetail.planName}</strong>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Cycle</span>
                <strong className="text-slate-900 text-sm">{selectedBranchDetail.billingCycle}</strong>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Staff Quota</span>
                <strong className="text-slate-900 text-sm">
                  {branchStaff.filter((s) => s.branchId === selectedBranchDetail.id).length} Active
                </strong>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Next Renewal</span>
                <strong className="text-emerald-700 text-sm">{selectedBranchDetail.renewalDate}</strong>
              </div>
            </div>

            {/* Financial Details */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 text-xs">
              <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Subscription Billing Specifications
              </h5>
              <div className="divide-y divide-slate-100 text-slate-600">
                <div className="py-1.5 flex justify-between">
                  <span>Base Plan Fee:</span>
                  <strong className="text-slate-900">{formatINR(selectedBranchDetail.price)}</strong>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span>GST Applicable (18%):</span>
                  <strong className="text-slate-900">
                    {formatINR(selectedBranchDetail.gstAmount || Math.round(selectedBranchDetail.price * 0.18))}
                  </strong>
                </div>
                <div className="py-1.5 flex justify-between font-bold text-slate-900 text-sm">
                  <span>Gross Renewal Cost:</span>
                  <span className="text-emerald-700">
                    {formatINR(selectedBranchDetail.totalRenewalPrice || Math.round(selectedBranchDetail.price * 1.18))}
                  </span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span>Mandate / Auto-Renewal:</span>
                  <span className="font-semibold text-emerald-700">
                    {selectedBranchDetail.autoRenewal ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span>Last Transaction ID:</span>
                  <span className="font-mono text-slate-700">{selectedBranchDetail.lastTransactionId}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setSelectedBranchDetail(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const b = selectedBranchDetail;
                  setSelectedBranchDetail(null);
                  handleOpenUpgrade(b);
                }}
              >
                Change Plan Tier
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

