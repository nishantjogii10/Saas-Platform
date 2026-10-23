import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Check,
  X,
  Building2,
  CalendarCheck,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Layers,
  HelpCircle,
  Store,
  Users,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { formatINR, BRANCH_PLANS_CONFIG } from '../../data/branchData';

export const BranchPlansPage = () => {
  const navigate = useNavigate();
  const {
    branches,
    updateBranchSubscription,
    addToast,
  } = useApp();

  const [billingCycle, setBillingCycle] = useState('Monthly'); // 'Monthly' | 'Yearly'

  // Modal to assign plan
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedPlanForAssign, setSelectedPlanForAssign] = useState(null);
  const [selectedBranchId, setSelectedBranchId] = useState('');

  const plans = Object.values(BRANCH_PLANS_CONFIG);

  // Group branches by plan
  const branchesByPlan = {
    'plan-starter': branches.filter((b) => b.planId === 'plan-starter'),
    'plan-pro': branches.filter((b) => b.planId === 'plan-pro'),
    'plan-enterprise': branches.filter((b) => b.planId === 'plan-enterprise'),
  };

  const handleOpenAssignModal = (plan) => {
    setSelectedPlanForAssign(plan);
    setSelectedBranchId(branches[0]?.id || '');
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    if (!selectedBranchId || !selectedPlanForAssign) return;

    updateBranchSubscription(selectedBranchId, selectedPlanForAssign.id, billingCycle);
    setIsAssignModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Branch Plans & Feature Comparison"
        subtitle="StockMate enables independent tier configuration per outlet. Optimize SaaS expenditure by matching plans to kitchen capacity."
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
              icon={CreditCard}
              onClick={() => navigate('/billing')}
            >
              Billing &amp; Tax Invoices
            </Button>
          </div>
        }
      />

      {/* Billing Cycle Toggle Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Select Billing Interval
          </h3>
          <p className="text-xs text-slate-500">
            Annual billing includes 2 months free (~17% discount across all tiers).
          </p>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200">
          <button
            type="button"
            onClick={() => setBillingCycle('Monthly')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              billingCycle === 'Monthly'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('Yearly')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              billingCycle === 'Yearly'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Yearly Billing</span>
            <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-amber-400 text-slate-900">
              Save 17%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isPro = plan.id === 'plan-pro';
          const price = billingCycle === 'Yearly' ? plan.yearlyPrice : plan.monthlyPrice;
          const assignedOutlets = branchesByPlan[plan.id] || [];

          return (
            <div
              key={plan.id}
              className={`rounded-2xl border transition-all duration-200 bg-white flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-lg ${
                isPro
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 relative'
                  : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              {isPro && (
                <div className="bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-widest text-center py-1">
                  Most Popular For Dining Outlets
                </div>
              )}

              <div className="p-6 space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{plan.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{plan.badge}</p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      plan.id === 'plan-enterprise'
                        ? 'bg-purple-100 text-purple-800'
                        : isPro
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {plan.maxStaff === 999 ? 'Unlimited Staff' : `Up to ${plan.maxStaff} Staff`}
                  </span>
                </div>

                {/* Price Display */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900">
                      {formatINR(price)}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      /{billingCycle === 'Yearly' ? 'year' : 'month'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    +18% GST ({formatINR(Math.round(price * 0.18))}) applicable
                  </div>
                </div>

                {/* Key Inclusions */}
                <div className="space-y-2.5 pt-3 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Plan Specifications:
                  </div>
                  <ul className="text-xs space-y-2 text-slate-600">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Max Staff: <strong>{plan.maxStaff === 999 ? 'Unlimited' : plan.maxStaff} members</strong>
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Max Ingredients: <strong>{plan.maxIngredients} SKUs</strong>
                      </span>
                    </li>
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        {feat.included ? (
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-slate-300 shrink-0" />
                        )}
                        <span className={feat.included ? 'text-slate-800' : 'text-slate-400 line-through'}>
                          {feat.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Assigned Outlets */}
                <div className="pt-3 border-t border-slate-100 text-xs">
                  <span className="font-semibold text-slate-700 block mb-1">
                    Enrolled Outlets ({assignedOutlets.length}):
                  </span>
                  {assignedOutlets.length === 0 ? (
                    <span className="text-slate-400 italic">No outlets currently on this tier.</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {assignedOutlets.map((b) => (
                        <span
                          key={b.id}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-medium"
                        >
                          {b.name.replace('Spice Garden — ', '')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="p-4 bg-slate-50/70 border-t border-slate-100">
                <Button
                  variant={isPro ? 'primary' : 'outline'}
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => handleOpenAssignModal(plan)}
                >
                  Assign {plan.name} to Branch
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden space-y-4 p-5 sm:p-6">
        <div>
          <h4 className="text-base font-bold text-slate-900 tracking-tight">
            Comprehensive Module Access &amp; Quota Matrix
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare granular features, operational access, and quotas across StockMate tiers.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Feature / Module Capability</th>
                <th className="py-3 px-4 text-center">Starter Plan</th>
                <th className="py-3 px-4 text-center">Professional Plan</th>
                <th className="py-3 px-4 text-center">Enterprise Plan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800">
                  Maximum Staff Accounts per Branch
                </td>
                <td className="py-3 px-4 text-center font-bold text-slate-700">5 Staff</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-700">15 Staff</td>
                <td className="py-3 px-4 text-center font-bold text-purple-700">Unlimited</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800">
                  Ingredient &amp; Raw Material Items
                </td>
                <td className="py-3 px-4 text-center font-bold text-slate-700">100 SKUs</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-700">500 SKUs</td>
                <td className="py-3 px-4 text-center font-bold text-purple-700">Unlimited</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-slate-700">Real-Time Inventory &amp; Stock Count</td>
                <td className="py-3 px-4 text-center text-emerald-600">✓ Included</td>
                <td className="py-3 px-4 text-center text-emerald-600">✓ Included</td>
                <td className="py-3 px-4 text-center text-emerald-600">✓ Included</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-slate-700">Expiry Tracking &amp; Batch Control</td>
                <td className="py-3 px-4 text-center text-emerald-600">✓ Included</td>
                <td className="py-3 px-4 text-center text-emerald-600">✓ Included</td>
                <td className="py-3 px-4 text-center text-emerald-600">✓ Included</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-slate-700">Purchase Orders &amp; Supplier Catalog</td>
                <td className="py-3 px-4 text-center text-emerald-600">✓ Included</td>
                <td className="py-3 px-4 text-center text-emerald-600">✓ Included</td>
                <td className="py-3 px-4 text-center text-emerald-600">✓ Included</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-slate-700">Staff Transfer Between Branches</td>
                <td className="py-3 px-4 text-center text-slate-400">Receive Only</td>
                <td className="py-3 px-4 text-center text-emerald-600">✓ Full Transfer</td>
                <td className="py-3 px-4 text-center text-emerald-600">✓ Full Transfer</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-slate-700">Analytics, Wastage &amp; Costing Reports</td>
                <td className="py-3 px-4 text-center text-slate-300">—</td>
                <td className="py-3 px-4 text-center text-emerald-600">✓ Included</td>
                <td className="py-3 px-4 text-center text-emerald-600">✓ Included</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-slate-700">Central Commissary &amp; Multi-Outlet Sync</td>
                <td className="py-3 px-4 text-center text-slate-300">—</td>
                <td className="py-3 px-4 text-center text-slate-300">—</td>
                <td className="py-3 px-4 text-center text-purple-700 font-bold">✓ Included</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-slate-700">24/7 Dedicated Account Manager &amp; SLA</td>
                <td className="py-3 px-4 text-center text-slate-300">—</td>
                <td className="py-3 px-4 text-center text-slate-300">—</td>
                <td className="py-3 px-4 text-center text-purple-700 font-bold">✓ Included</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Modal */}
      {selectedPlanForAssign && (
        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          title={`Assign ${selectedPlanForAssign.name} Plan to Branch`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleAssignSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Restaurant Branch
              </label>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} (Current: {b.planName} - {b.billingCycle})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="text-slate-500">Plan to be applied:</div>
              <div className="font-bold text-slate-900">
                {selectedPlanForAssign.name} ({billingCycle})
              </div>
              <div className="text-emerald-700 font-bold">
                {formatINR(
                  billingCycle === 'Yearly'
                    ? selectedPlanForAssign.yearlyPrice
                    : selectedPlanForAssign.monthlyPrice
                )}{' '}
                / {billingCycle === 'Yearly' ? 'year' : 'month'} (+18% GST)
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setIsAssignModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Confirm Plan Upgrade
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

