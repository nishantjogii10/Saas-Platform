import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  CreditCard,
  Building2,
  Sparkles,
  Sliders,
  Receipt,
  TrendingUp,
  CalendarCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { formatINR } from '../../data/branchData';

// Sub-components
import { BranchSubscriptionsPage } from './BranchSubscriptionsPage';
import { BranchPlansPage } from './BranchPlansPage';
import { CustomPlanBuilderPage } from './CustomPlanBuilderPage';
import { OwnerBillingPage } from './OwnerBillingPage';

export const PlansAndBillingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { branches, branchStaff, branchInvoices } = useApp();

  // Tab state: 'overview' | 'subscriptions' | 'comparison' | 'custom' | 'invoices'
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // High-level aggregate metrics for the Overview
  const totalBranches = branches.length;
  const activeBranches = branches.filter((b) => b.status === 'active').length;
  const totalStaff = branchStaff.length;
  const totalManagers = branchStaff.filter((s) => s.isManager).length;

  const monthlyRunRate = branches.reduce((acc, b) => {
    if (b.status !== 'active') return acc;
    if (b.billingCycle === 'Yearly') {
      return acc + Math.round((b.price || 0) / 12);
    }
    return acc + (b.price || 0);
  }, 0);

  const pendingPayments = branches.reduce((acc, b) => {
    return b.paymentStatus === 'Pending' ? acc + (b.price || 0) : acc;
  }, 0);

  const totalSpendYTD = branchInvoices.reduce((acc, inv) => acc + (inv.amount || 0), 0);

  // Group branches by plan
  const branchesByPlan = {
    'plan-starter': branches.filter((b) => b.planId === 'plan-starter'),
    'plan-pro': branches.filter((b) => b.planId === 'plan-pro'),
    'plan-enterprise': branches.filter((b) => b.planId === 'plan-enterprise'),
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Plans, Subscriptions &amp; Billing"
        subtitle="Comprehensive SaaS billing management: multi-outlet subscription tiers, plan comparison, custom pricing builder, and GST invoices."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Sparkles}
              onClick={() => handleTabChange('comparison')}
            >
              Compare Plans
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={Receipt}
              onClick={() => handleTabChange('invoices')}
            >
              Tax Invoices
            </Button>
            <Button
              variant="brand"
              size="sm"
              icon={Sliders}
              onClick={() => handleTabChange('custom')}
            >
              Build Custom Plan ⚡
            </Button>
          </div>
        }
      />

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          title="Monthly SaaS Run-Rate"
          value={formatINR(monthlyRunRate)}
          subtitle="Normalized Subscriptions"
          icon={TrendingUp}
          variant="success"
          onClick={() => handleTabChange('overview')}
        />
        <StatCard
          title="Active Outlets"
          value={`${activeBranches} / ${totalBranches}`}
          subtitle={`${branches.length} Registered Outlets`}
          icon={Building2}
          variant="default"
          onClick={() => handleTabChange('subscriptions')}
        />
        <StatCard
          title="Pending Dues"
          value={formatINR(pendingPayments)}
          subtitle={pendingPayments > 0 ? 'Action Required' : 'All Settled'}
          icon={Clock}
          variant={pendingPayments > 0 ? 'warning' : 'default'}
          onClick={() => handleTabChange('subscriptions')}
        />
        <StatCard
          title="YTD Total Spend"
          value={formatINR(totalSpendYTD)}
          subtitle="All Disbursed Invoices"
          icon={Receipt}
          variant="default"
          onClick={() => handleTabChange('invoices')}
        />
        <StatCard
          title="Custom Plan Builder"
          value="Automated"
          subtitle="Instant Pricing Engine"
          icon={Sliders}
          variant="default"
          onClick={() => handleTabChange('custom')}
        />
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 overflow-x-auto">
          {/* Tab 1: Overview */}
          <button
            onClick={() => handleTabChange('overview')}
            className={`py-3 px-1 border-b-2 font-semibold text-xs flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Overview &amp; Distribution</span>
          </button>

          {/* Tab 2: Branch Subscriptions */}
          <button
            onClick={() => handleTabChange('subscriptions')}
            className={`py-3 px-1 border-b-2 font-semibold text-xs flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'subscriptions'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Branch Subscriptions ({branches.length})</span>
          </button>

          {/* Tab 3: Plan Comparison */}
          <button
            onClick={() => handleTabChange('comparison')}
            className={`py-3 px-1 border-b-2 font-semibold text-xs flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'comparison'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Plan Comparison &amp; Tiers</span>
          </button>

          {/* Tab 4: Custom Plan */}
          <button
            onClick={() => handleTabChange('custom')}
            className={`py-3 px-1 border-b-2 font-semibold text-xs flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'custom'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Custom Plan Builder</span>
          </button>

          {/* Tab 5: Invoices */}
          <button
            onClick={() => handleTabChange('invoices')}
            className={`py-3 px-1 border-b-2 font-semibold text-xs flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'invoices'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Tax Invoices &amp; Receipts ({branchInvoices.length})</span>
          </button>
        </nav>
      </div>

      {/* TAB 1: OVERVIEW & DISTRIBUTION */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Summary Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 text-white shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ENTERPRISE MULTI-OUTLET BILLING
                </span>
                <h3 className="text-lg font-bold text-white tracking-tight mt-1">
                  Independent Tier Management Per Outlet
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Each restaurant outlet runs on an optimized tier to prevent overspending on smaller express kitchens.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-center">
              <Button
                size="sm"
                variant="brand"
                onClick={() => handleTabChange('custom')}
              >
                Configure Custom Plan
              </Button>
            </div>
          </div>

          {/* Plan Tier Distribution Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Starter Plan Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    Starter Tier
                  </span>
                  <span className="text-xs text-slate-500 font-mono">₹999/mo</span>
                </div>
                <h4 className="text-base font-bold text-slate-900 mt-2">
                  {branchesByPlan['plan-starter'].length} Outlets Assigned
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Ideal for cloud kitchens and express takeout stations (up to 5 staff, core inventory).
                </p>
                <div className="mt-3 space-y-1.5">
                  {branchesByPlan['plan-starter'].map((b) => (
                    <div key={b.id} className="text-xs font-medium text-slate-700 flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span>{b.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{b.billingCycle}</span>
                    </div>
                  ))}
                  {branchesByPlan['plan-starter'].length === 0 && (
                    <div className="text-xs text-slate-400 italic">No outlets on Starter tier.</div>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="xs"
                onClick={() => handleTabChange('subscriptions')}
                className="w-full text-xs"
              >
                View Subscriptions
              </Button>
            </div>

            {/* Professional Plan Card */}
            <div className="p-5 rounded-2xl bg-white border border-indigo-200 shadow-xs flex flex-col justify-between space-y-4 ring-1 ring-indigo-500/10">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                    Professional Tier
                  </span>
                  <span className="text-xs text-indigo-700 font-mono font-bold">₹2,499/mo</span>
                </div>
                <h4 className="text-base font-bold text-slate-900 mt-2">
                  {branchesByPlan['plan-pro'].length} Outlets Assigned
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Mid-sized dine-in outlets with up to 15 staff, expiry tracking &amp; purchase approvals.
                </p>
                <div className="mt-3 space-y-1.5">
                  {branchesByPlan['plan-pro'].map((b) => (
                    <div key={b.id} className="text-xs font-medium text-slate-700 flex items-center justify-between p-2 rounded-lg bg-indigo-50/50 border border-indigo-100">
                      <span>{b.name}</span>
                      <span className="text-[10px] text-indigo-600 font-mono font-bold">{b.billingCycle}</span>
                    </div>
                  ))}
                  {branchesByPlan['plan-pro'].length === 0 && (
                    <div className="text-xs text-slate-400 italic">No outlets on Pro tier.</div>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="xs"
                onClick={() => handleTabChange('subscriptions')}
                className="w-full text-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50"
              >
                Manage Pro Outlets
              </Button>
            </div>

            {/* Enterprise Plan Card */}
            <div className="p-5 rounded-2xl bg-white border border-purple-200 shadow-xs flex flex-col justify-between space-y-4 ring-1 ring-purple-500/10">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                    Enterprise Tier
                  </span>
                  <span className="text-xs text-purple-700 font-mono font-bold">₹4,999/mo</span>
                </div>
                <h4 className="text-base font-bold text-slate-900 mt-2">
                  {branchesByPlan['plan-enterprise'].length} Outlets Assigned
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Full flagship operations: unlimited staff, multi-location transfers, automated GRN dock &amp; supplier billing.
                </p>
                <div className="mt-3 space-y-1.5">
                  {branchesByPlan['plan-enterprise'].map((b) => (
                    <div key={b.id} className="text-xs font-medium text-slate-700 flex items-center justify-between p-2 rounded-lg bg-purple-50/50 border border-purple-100">
                      <span>{b.name}</span>
                      <span className="text-[10px] text-purple-600 font-mono font-bold">{b.billingCycle}</span>
                    </div>
                  ))}
                  {branchesByPlan['plan-enterprise'].length === 0 && (
                    <div className="text-xs text-slate-400 italic">No outlets on Enterprise tier.</div>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="xs"
                onClick={() => handleTabChange('subscriptions')}
                className="w-full text-xs text-purple-700 border-purple-200 hover:bg-purple-50"
              >
                Manage Enterprise Outlets
              </Button>
            </div>
          </div>

          {/* Quick Action Link Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div
              onClick={() => handleTabChange('comparison')}
              className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-3">Compare Features &amp; Limits</h4>
              <p className="text-xs text-slate-500 mt-1">
                Side-by-side feature matrix covering staff limits, QR batches, automated receiving, and AI forecasts.
              </p>
            </div>

            <div
              onClick={() => handleTabChange('custom')}
              className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Sliders className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-3">Custom Enterprise Plan Builder</h4>
              <p className="text-xs text-slate-500 mt-1">
                Slider-based interactive pricing calculator with instant quotation approval for multi-chain brands.
              </p>
            </div>

            <div
              onClick={() => handleTabChange('invoices')}
              className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Receipt className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-3">Tax Invoices &amp; Receipts</h4>
              <p className="text-xs text-slate-500 mt-1">
                GST-compliant tax invoices, PDF downloads, Razorpay transaction references, and renewal history.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BRANCH SUBSCRIPTIONS */}
      {activeTab === 'subscriptions' && (
        <div>
          <BranchSubscriptionsPage />
        </div>
      )}

      {/* TAB 3: PLAN COMPARISON */}
      {activeTab === 'comparison' && (
        <div>
          <BranchPlansPage />
        </div>
      )}

      {/* TAB 4: CUSTOM PLAN */}
      {activeTab === 'custom' && (
        <div>
          <CustomPlanBuilderPage />
        </div>
      )}

      {/* TAB 5: INVOICES */}
      {activeTab === 'invoices' && (
        <div>
          <OwnerBillingPage />
        </div>
      )}
    </div>
  );
};
export default PlansAndBillingPage;

