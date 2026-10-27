import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  CreditCard,
  Check,
  Edit3,
  Building2,
  Plus,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  FileCheck,
  RotateCcw,
  X,
  Trash2,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Eye,
  Info,
  Sliders,
  Store,
  Users,
  Package,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { formatINR } from '../../data/inventoryBillingData';
import { calculatePlanSavings } from '../../services/pricingEngine';

export const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const {
    plans,
    restaurants,
    updatePlan,
    resetPlansToDefaults,
    assignPlanToRestaurant,
    customPlanRequests,
    currentUser,
  } = useApp();

  const pendingReviewsCount = (customPlanRequests || []).filter(
    (r) => (r.path === 'PATH_C' || r.requiresManualReview) && r.status === 'pending_review'
  ).length;

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [showComparisonTable, setShowComparisonTable] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [activeModalTab, setActiveModalTab] = useState('general'); // 'general' | 'pricing' | 'limits' | 'features' | 'preview'
  const [newFeatureText, setNewFeatureText] = useState('');
  const [validationError, setValidationError] = useState('');

  // Edit Plan Form State
  const [editFormData, setEditFormData] = useState({
    id: '',
    name: '',
    badge: '',
    status: 'active',
    monthlyPrice: 0,
    annualPrice: 0,
    description: '',
    maxIngredients: 0,
    maxStaff: 0,
    branches: 1,
    support: '',
    popular: false,
    features: [],
  });

  // Assign Plan Form State
  const [assignFormData, setAssignFormData] = useState({
    restaurantId: restaurants[0]?.id || '',
    planId: plans[0]?.id || '',
  });

  const handleOpenEdit = (plan) => {
    setSelectedPlan(plan);
    setEditFormData({
      id: plan.id,
      name: plan.name || '',
      badge: plan.badge || '',
      status: plan.status || 'active',
      monthlyPrice: plan.monthlyPrice ?? 0,
      annualPrice: plan.annualPrice ?? (plan.monthlyPrice ? Math.round(plan.monthlyPrice * 12 * 0.8) : 0),
      description: plan.description || '',
      maxIngredients: plan.limits?.maxIngredients ?? 100,
      maxStaff: plan.limits?.maxStaff ?? 5,
      branches: plan.limits?.branches ?? 1,
      support: plan.limits?.support || 'Standard Email (24h SLA)',
      popular: !!plan.popular,
      features: Array.isArray(plan.features) ? [...plan.features] : [],
    });
    setNewFeatureText('');
    setValidationError('');
    setActiveModalTab('general');
    setEditModalOpen(true);
  };

  // Feature Manager Handlers
  const handleAddFeature = (e) => {
    if (e) e.preventDefault();
    const trimmed = newFeatureText.trim();
    if (!trimmed) return;
    setEditFormData((prev) => ({
      ...prev,
      features: [...prev.features, trimmed],
    }));
    setNewFeatureText('');
  };

  const handleUpdateFeature = (index, value) => {
    setEditFormData((prev) => {
      const next = [...prev.features];
      next[index] = value;
      return { ...prev, features: next };
    });
  };

  const handleRemoveFeature = (index) => {
    setEditFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleMoveFeature = (index, direction) => {
    setEditFormData((prev) => {
      const next = [...prev.features];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return { ...prev, features: next };
    });
  };

  const handleAutoDiscount = () => {
    const monthly = Number(editFormData.monthlyPrice) || 0;
    const computedAnnual = Math.round(monthly * 12 * 0.8);
    setEditFormData((prev) => ({ ...prev, annualPrice: computedAnnual }));
  };

  const handleSavePlan = (e) => {
    if (e) e.preventDefault();

    if (!editFormData.name.trim()) {
      setValidationError('Plan display name cannot be empty.');
      setActiveModalTab('general');
      return;
    }
    if (Number(editFormData.monthlyPrice) < 0) {
      setValidationError('Monthly price cannot be negative.');
      setActiveModalTab('pricing');
      return;
    }
    if (Number(editFormData.annualPrice) < 0) {
      setValidationError('Annual price cannot be negative.');
      setActiveModalTab('pricing');
      return;
    }
    if (editFormData.features.length === 0) {
      setValidationError('Plan must have at least one included feature.');
      setActiveModalTab('features');
      return;
    }

    setValidationError('');

    const monthlyPrice = Number(editFormData.monthlyPrice);
    const annualPrice = Number(editFormData.annualPrice);

    const success = updatePlan(editFormData.id, {
      name: editFormData.name.trim(),
      badge: editFormData.badge.trim(),
      status: editFormData.status,
      monthlyPrice,
      annualPrice,
      description: editFormData.description.trim(),
      popular: editFormData.popular,
      limits: {
        maxIngredients: Number(editFormData.maxIngredients) || 100,
        maxStaff: Number(editFormData.maxStaff) || 5,
        branches: Number(editFormData.branches) || 1,
        support: editFormData.support.trim() || 'Standard Email (24h SLA)',
      },
      features: editFormData.features.filter((f) => f.trim().length > 0),
    });

    if (success !== false) {
      setEditModalOpen(false);
    }
  };

  const handleConfirmReset = () => {
    resetPlansToDefaults();
    setResetModalOpen(false);
  };

  const handleAssignPlan = (e) => {
    if (e) e.preventDefault();
    assignPlanToRestaurant(assignFormData.restaurantId, assignFormData.planId);
    setAssignModalOpen(false);
  };

  // Metrics Quick Bar
  const activeSubs = restaurants.filter((r) => r.status === 'active').length;
  const trialSubs = restaurants.filter((r) => r.status === 'trial' || r.isTrial).length || 1;

  // Real-time savings preview for Edit Modal
  const editSavingsPreview = calculatePlanSavings(editFormData.monthlyPrice, editFormData.annualPrice);

  return (
    <div className="space-y-4 sm:space-y-5">
      <PageHeader
        title="Subscription Tier Management"
        subtitle="Configure dynamic SaaS pricing, resource limits, features, and platform status"
        breadcrumbs={[
          { label: 'Admin', href: '#/admin/dashboard' },
          { label: 'Subscription Plans' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RotateCcw}
              onClick={() => setResetModalOpen(true)}
              title="Reset all plans to default factory prices"
            >
              Reset to Defaults
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={FileCheck}
              onClick={() => navigate('/admin/custom-plan-requests')}
            >
              Review Queue ({pendingReviewsCount})
            </Button>
            <Button
              variant="brand"
              size="sm"
              icon={Building2}
              onClick={() => {
                setAssignFormData({
                  restaurantId: restaurants[0]?.id || '',
                  planId: plans[0]?.id || '',
                });
                setAssignModalOpen(true);
              }}
            >
              Assign Plan to Restaurant
            </Button>
          </div>
        }
      />

      {/* Subscription Metrics Quick Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Subscriptions</span>
          <div className="text-xl font-bold text-emerald-800 mt-1">{activeSubs} Accounts</div>
        </div>
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Trial Accounts</span>
          <div className="text-xl font-bold text-blue-700 mt-1">{trialSubs} Account</div>
        </div>
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg Plan ARPU</span>
          <div className="text-xl font-bold text-slate-800 mt-1">₹2,499 / mo</div>
        </div>
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Tiers</span>
          <div className="text-xl font-bold text-slate-800 mt-1">
            {plans.filter((p) => p.status !== 'inactive').length} Active of {plans.length}
          </div>
        </div>
      </div>

      {/* Dynamic Sync Helper Notice */}
      <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 flex items-start gap-3 text-xs text-indigo-950">
        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 font-bold text-[11px]">
          D
        </span>
        <div className="leading-relaxed">
          <strong className="font-semibold">Dynamic Platform-Wide Subscription Engine:</strong>
          Any modifications made to plan names, monthly/annual rates, resource allowances, or features below propagate in real time across the public Landing Page, Signup checkout, Custom Plan builder, Tenant billing, and active Restaurant limit checks.
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const assignedRestaurants = restaurants.filter((r) => r.planId === plan.id);
          const isInactive = plan.status === 'inactive';
          const annualSavings = plan.annualSavings ?? Math.max(0, (plan.monthlyPrice * 12) - plan.annualPrice);
          const savingsPercent = plan.savingsPercent ?? (plan.monthlyPrice > 0 ? Math.round((annualSavings / (plan.monthlyPrice * 12)) * 100) : 0);
          const effectiveMonthly = plan.effectiveMonthlyAnnual ?? (plan.annualPrice > 0 ? Math.round(plan.annualPrice / 12) : plan.monthlyPrice);

          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-6 bg-white border transition-all duration-200 shadow-xs flex flex-col justify-between ${
                isInactive
                  ? 'border-dashed border-amber-300 bg-amber-50/20 opacity-80'
                  : plan.popular
                  ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-md'
                  : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Header Badge & Status */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        plan.popular ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {plan.badge || plan.name}
                    </span>
                    {isInactive ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        Inactive
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenEdit(plan)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-slate-100 transition-colors"
                    title={`Edit ${plan.name} Pricing & Limits`}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                <p className="text-xs text-slate-500 mt-1 min-h-[36px] leading-relaxed">
                  {plan.description}
                </p>

                {/* Price Display */}
                <div className="my-4 pt-2 border-t border-slate-100">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold text-slate-900">
                      {plan.monthlyPrice > 0 ? formatINR(plan.monthlyPrice) : 'Custom Quote'}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {plan.monthlyPrice > 0 ? '/ month billed monthly' : 'tailored to scale'}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">
                      Annual:{' '}
                      <strong className="text-slate-900">
                        {plan.annualPrice > 0 ? `${formatINR(plan.annualPrice)}/yr` : 'Flexible Billing'}
                      </strong>
                    </span>
                    {annualSavings > 0 ? (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
                        Save {formatINR(annualSavings)}/yr ({savingsPercent}%)
                      </span>
                    ) : plan.monthlyPrice === 0 ? (
                      <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/80">
                        Interactive SLA
                      </span>
                    ) : null}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {plan.annualPrice > 0
                      ? `(Effective ${formatINR(effectiveMonthly)}/mo on annual billing)`
                      : '(Configure pricing & limits via Edit Plan)'}
                  </div>
                </div>

                {/* Limits summary */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 mb-5 text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-slate-400" />
                      Tracked Ingredients:
                    </span>
                    <span className="font-bold text-slate-800">
                      {plan.limits?.maxIngredients > 1000 ? 'Unlimited' : `Up to ${plan.limits?.maxIngredients}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      Staff Accounts:
                    </span>
                    <span className="font-bold text-slate-800">
                      {plan.limits?.maxStaff > 1000 ? 'Unlimited' : `Up to ${plan.limits?.maxStaff} users`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-slate-400" />
                      Branches Supported:
                    </span>
                    <span className="font-bold text-slate-800">
                      {plan.limits?.branches > 50 ? 'Unlimited' : `${plan.limits?.branches} location(s)`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200/60 text-[11px]">
                    <span className="text-slate-500">Support SLA:</span>
                    <span className="font-semibold text-emerald-700">{plan.limits?.support || 'Standard Email'}</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Included Features ({plan.features?.length || 0})
                    </span>
                  </div>
                  {plan.features?.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-700">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span className="leading-snug">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assigned Restaurants list */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-slate-600">Assigned Tenants:</span>
                  <span className="font-bold text-emerald-800">{assignedRestaurants.length}</span>
                </div>

                <div className="flex flex-wrap gap-1.5 min-h-[30px] mb-4">
                  {assignedRestaurants.length === 0 ? (
                    <span className="text-[11px] text-slate-400 italic">No restaurants currently on this tier</span>
                  ) : (
                    assignedRestaurants.map((r) => (
                      <span
                        key={r.id}
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {r.name}
                      </span>
                    ))
                  )}
                </div>

                <div>
                  <Button
                    variant={plan.popular ? 'brand' : 'outline'}
                    size="sm"
                    className="w-full"
                    icon={Edit3}
                    onClick={() => handleOpenEdit(plan)}
                  >
                    Edit Plan Pricing &amp; Features
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expandable Comparison Matrix Toggle */}
      <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
        <button
          onClick={() => setShowComparisonTable((prev) => !prev)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Platform Subscription Comparison Matrix</h4>
              <p className="text-xs text-slate-500">Side-by-side feature and limit comparison across all active plans</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
            <span>{showComparisonTable ? 'Hide Table' : 'Compare All Plans'}</span>
            {showComparisonTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showComparisonTable && (
          <div className="p-4 border-t border-slate-100 overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold">
                  <th className="py-3 px-4">Plan Specification</th>
                  {plans.map((p) => (
                    <th key={p.id} className="py-3 px-4 text-center">
                      <div className="font-extrabold text-sm text-slate-900">{p.name}</div>
                      <div className="text-[11px] font-semibold text-emerald-700">{formatINR(p.monthlyPrice)}/mo</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr className="bg-slate-50/50 font-bold text-slate-800">
                  <td colSpan={plans.length + 1} className="py-2 px-4 uppercase text-[10px] tracking-wider text-slate-400">
                    Pricing &amp; Discounts
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-medium">Monthly Billed Rate</td>
                  {plans.map((p) => (
                    <td key={p.id} className="py-2.5 px-4 text-center font-bold text-slate-900">
                      {formatINR(p.monthlyPrice)} / month
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-medium">Annual Billed Rate</td>
                  {plans.map((p) => (
                    <td key={p.id} className="py-2.5 px-4 text-center font-semibold text-slate-800">
                      {formatINR(p.annualPrice)} / year
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-medium">Annual Savings</td>
                  {plans.map((p) => (
                    <td key={p.id} className="py-2.5 px-4 text-center font-bold text-emerald-700">
                      Save {formatINR(p.annualSavings)}/yr ({p.savingsPercent}%)
                    </td>
                  ))}
                </tr>

                <tr className="bg-slate-50/50 font-bold text-slate-800">
                  <td colSpan={plans.length + 1} className="py-2 px-4 uppercase text-[10px] tracking-wider text-slate-400">
                    Resource Allocations &amp; Limits
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-medium">Tracked Pantry Ingredients</td>
                  {plans.map((p) => (
                    <td key={p.id} className="py-2.5 px-4 text-center font-semibold text-slate-800">
                      {p.limits?.maxIngredients > 1000 ? 'Unlimited' : `Up to ${p.limits?.maxIngredients}`}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-medium">Allowed Staff Accounts</td>
                  {plans.map((p) => (
                    <td key={p.id} className="py-2.5 px-4 text-center font-semibold text-slate-800">
                      {p.limits?.maxStaff > 1000 ? 'Unlimited' : `Up to ${p.limits?.maxStaff} users`}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-medium">Supported Outlets &amp; Branches</td>
                  {plans.map((p) => (
                    <td key={p.id} className="py-2.5 px-4 text-center font-semibold text-slate-800">
                      {p.limits?.branches > 50 ? 'Unlimited' : `${p.limits?.branches} branch`}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-medium">Customer Support SLA</td>
                  {plans.map((p) => (
                    <td key={p.id} className="py-2.5 px-4 text-center font-semibold text-emerald-700">
                      {p.limits?.support || 'Standard'}
                    </td>
                  ))}
                </tr>

                <tr className="bg-slate-50/50 font-bold text-slate-800">
                  <td colSpan={plans.length + 1} className="py-2 px-4 uppercase text-[10px] tracking-wider text-slate-400">
                    Core Modules &amp; Capabilities
                  </td>
                </tr>
                {[
                  { name: 'POS & Cloud Billing', starter: true, pro: true, ent: true },
                  { name: 'Pantry Inventory & Low Stock Alerts', starter: true, pro: true, ent: true },
                  { name: 'FEFO Expiry Color Tracking', starter: true, pro: true, ent: true },
                  { name: 'Digital Purchase Orders & Basic GRN', starter: true, pro: true, ent: true },
                  { name: 'Pure SVG QR Lot Traceability Matrix', starter: false, pro: true, ent: true },
                  { name: 'Standardized Recipe Costing & BOMs', starter: false, pro: true, ent: true },
                  { name: 'Dockside Verified GRN & Claims', starter: false, pro: true, ent: true },
                  { name: 'Table & Captain Ordering Terminal', starter: false, pro: true, ent: true },
                  { name: 'Multi-Store Central Commissary Sync', starter: false, pro: false, ent: true },
                  { name: 'Swiggy / Zomato Aggregator Sync', starter: false, pro: false, ent: true },
                  { name: 'Predictive Consumption & Wastage BI', starter: false, pro: false, ent: true },
                  { name: 'Dedicated Customer Success Manager', starter: false, pro: false, ent: true },
                ].map((row, rIdx) => (
                  <tr key={rIdx}>
                    <td className="py-2.5 px-4 font-medium text-slate-800">{row.name}</td>
                    {plans.map((p) => {
                      const isIncluded =
                        p.id === 'plan-starter' ? row.starter : p.id === 'plan-pro' ? row.pro : row.ent;
                      return (
                        <td key={p.id} className="py-2.5 px-4 text-center">
                          {isIncluded ? (
                            <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-800">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          ) : (
                            <span className="text-slate-300 font-bold">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* COMPREHENSIVE EDIT PLAN MODAL */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit ${selectedPlan?.name || 'Subscription'} Plan`}
        subtitle="Update pricing, resource limits, features, and platform status"
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="text-xs text-rose-600 font-semibold">{validationError}</div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="brand" onClick={handleSavePlan}>
                Save Plan Changes
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Modal Tab Switcher */}
          <div className="flex border-b border-slate-200 gap-2 pb-2">
            {[
              { id: 'general', label: 'Basic Info & Status' },
              { id: 'pricing', label: 'Pricing & Savings' },
              { id: 'limits', label: 'Resource Limits' },
              { id: 'features', label: `Features (${editFormData.features.length})` },
              { id: 'preview', label: 'Live Card Preview' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveModalTab(tab.id);
                  setValidationError('');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeModalTab === tab.id
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: BASIC INFO & STATUS */}
          {activeModalTab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Plan Display Name"
                  name="name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="e.g. Starter, Professional, Enterprise"
                  required
                />
                <FormInput
                  label="Header Badge Text"
                  name="badge"
                  value={editFormData.badge}
                  onChange={(e) => setEditFormData({ ...editFormData, badge: e.target.value })}
                  placeholder="e.g. Essential, Most Popular"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Plan Platform Status</label>
                  <p className="text-[11px] text-slate-500">
                    Inactive plans will be hidden from public pricing and new signups.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                    <input
                      type="radio"
                      name="planStatus"
                      value="active"
                      checked={editFormData.status === 'active'}
                      onChange={() => setEditFormData({ ...editFormData, status: 'active' })}
                      className="text-emerald-700 focus:ring-emerald-600"
                    />
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Active
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                    <input
                      type="radio"
                      name="planStatus"
                      value="inactive"
                      checked={editFormData.status === 'inactive'}
                      onChange={() => setEditFormData({ ...editFormData, status: 'inactive' })}
                      className="text-amber-700 focus:ring-amber-600"
                    />
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300">
                      Inactive
                    </span>
                  </label>
                </div>
              </div>

              <FormInput
                label="Target Audience & Plan Description"
                name="description"
                type="textarea"
                rows={2}
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                placeholder="Brief summary of whom this plan is designed for..."
              />
            </div>
          )}

          {/* TAB 2: PRICING & SAVINGS */}
          {activeModalTab === 'pricing' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FormInput
                    label="Monthly Price (₹ INR)"
                    name="monthlyPrice"
                    type="number"
                    min="0"
                    value={editFormData.monthlyPrice}
                    onChange={(e) => setEditFormData({ ...editFormData, monthlyPrice: e.target.value })}
                    required
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">Standard monthly billing rate</span>
                </div>

                <div>
                  <FormInput
                    label="Yearly / Annual Price (₹ INR)"
                    name="annualPrice"
                    type="number"
                    min="0"
                    value={editFormData.annualPrice}
                    onChange={(e) => setEditFormData({ ...editFormData, annualPrice: e.target.value })}
                    required
                  />
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[11px] text-slate-400">Total upfront yearly charge</span>
                    <button
                      type="button"
                      onClick={handleAutoDiscount}
                      className="text-[11px] font-bold text-emerald-700 hover:underline"
                    >
                      Set 20% Discount
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Savings Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border border-emerald-200/80 text-xs">
                <div className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  Live Dynamic Savings Calculation Preview:
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Annual Savings</span>
                    <span className="text-sm font-extrabold text-emerald-700">
                      {formatINR(editSavingsPreview.annualSavings)} / yr
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Discount %</span>
                    <span className="text-sm font-extrabold text-emerald-700">
                      {editSavingsPreview.savingsPercent}% OFF
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Effective Rate</span>
                    <span className="text-sm font-extrabold text-slate-900">
                      {formatINR(editSavingsPreview.effectiveMonthlyAnnual)} / mo
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 text-center">
                  Formula: 12 months &times; ₹{Number(editFormData.monthlyPrice) || 0} = ₹
                  {((Number(editFormData.monthlyPrice) || 0) * 12).toLocaleString('en-IN')}. Annual price is ₹
                  {Number(editFormData.annualPrice) || 0}.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: RESOURCE LIMITS */}
          {activeModalTab === 'limits' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <FormInput
                    label="Max Tracked Ingredients"
                    name="maxIngredients"
                    type="number"
                    min="10"
                    value={editFormData.maxIngredients}
                    onChange={(e) => setEditFormData({ ...editFormData, maxIngredients: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setEditFormData({ ...editFormData, maxIngredients: 9999 })}
                    className="text-[11px] text-emerald-700 font-bold hover:underline mt-0.5"
                  >
                    Set Unlimited (9999)
                  </button>
                </div>

                <div>
                  <FormInput
                    label="Max Staff Accounts"
                    name="maxStaff"
                    type="number"
                    min="1"
                    value={editFormData.maxStaff}
                    onChange={(e) => setEditFormData({ ...editFormData, maxStaff: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setEditFormData({ ...editFormData, maxStaff: 9999 })}
                    className="text-[11px] text-emerald-700 font-bold hover:underline mt-0.5"
                  >
                    Set Unlimited (9999)
                  </button>
                </div>

                <div>
                  <FormInput
                    label="Max Branches Allowed"
                    name="branches"
                    type="number"
                    min="1"
                    value={editFormData.branches}
                    onChange={(e) => setEditFormData({ ...editFormData, branches: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setEditFormData({ ...editFormData, branches: 999 })}
                    className="text-[11px] text-emerald-700 font-bold hover:underline mt-0.5"
                  >
                    Set Unlimited (999)
                  </button>
                </div>
              </div>

              <FormInput
                label="Support SLA Level"
                name="support"
                value={editFormData.support}
                onChange={(e) => setEditFormData({ ...editFormData, support: e.target.value })}
                placeholder="e.g. Standard Email (24h SLA), Priority Live Chat (2h SLA), 24/7 Dedicated CSM"
              />

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Tenant Protection:</strong> Changing these limits immediately updates active restaurants
                  subscribed to this plan, allowing staff seat expansion or higher ingredient thresholds.
                </span>
              </div>
            </div>
          )}

          {/* TAB 4: FEATURES MANAGER */}
          {activeModalTab === 'features' && (
            <div className="space-y-4">
              {/* Add New Feature */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFeatureText}
                  onChange={(e) => setNewFeatureText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFeature();
                    }
                  }}
                  placeholder="Enter a new feature description and press Add..."
                  className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
                <Button variant="brand" size="sm" icon={Plus} onClick={handleAddFeature}>
                  Add Feature
                </Button>
              </div>

              {/* Reorderable Feature List */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {editFormData.features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors"
                  >
                    <span className="text-[10px] font-bold text-slate-400 w-4 text-center shrink-0">{idx + 1}</span>
                    <input
                      type="text"
                      value={feat}
                      onChange={(e) => handleUpdateFeature(idx, e.target.value)}
                      className="flex-1 text-xs bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-800"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveFeature(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveFeature(idx, 'down')}
                        disabled={idx === editFormData.features.length - 1}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="p-1 rounded text-rose-400 hover:text-rose-700 hover:bg-rose-50"
                        title="Delete Feature"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: LIVE CARD PREVIEW */}
          {activeModalTab === 'preview' && (
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Customer Plan Card Preview
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700">
                  {editFormData.badge || 'Standard Tier'}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black">{editFormData.name || 'Untitled Plan'}</h3>
                <p className="text-xs text-slate-400 mt-1">{editFormData.description}</p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{formatINR(editFormData.monthlyPrice)}</span>
                <span className="text-xs text-slate-400">/ month (Annual: {formatINR(editFormData.annualPrice)}/yr)</span>
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold">
                Save {formatINR(editSavingsPreview.annualSavings)}/yr ({editSavingsPreview.savingsPercent}% OFF)
              </div>
              <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs text-slate-300">
                {editFormData.features.slice(0, 5).map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
                {editFormData.features.length > 5 && (
                  <div className="text-[11px] text-slate-500 italic pl-5">
                    + {editFormData.features.length - 5} more features included
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* RESET PLANS TO DEFAULTS CONFIRMATION MODAL */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Reset Subscription Plans to Platform Defaults"
        subtitle="Restore baseline pricing, limits, and feature sets for all tiers"
        footer={
          <>
            <Button variant="secondary" onClick={() => setResetModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmReset}>
              Yes, Reset All Plans
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs text-slate-700">
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">Factory Reset Confirmation:</strong>
              This action will revert Starter (₹999/mo, ₹9,588/yr), Professional (₹2,499/mo, ₹23,988/yr), Enterprise (₹5,499/mo, ₹53,988/yr), and Custom (Tailored Scale) to their initial approved pricing and resource limits.
            </div>
          </div>
          <p className="text-slate-500">
            Tenant accounts currently assigned to these plans will have their ingredient and staff limits synchronized back to the factory defaults.
          </p>
        </div>
      </Modal>

      {/* ASSIGN PLAN TO RESTAURANT MODAL (Workflow D Step 5-6) */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Subscription Plan to Restaurant"
        subtitle="Upgrades or migrates a restaurant tenant to a different package"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="brand" onClick={handleAssignPlan}>
              Apply &amp; Update Subscription
            </Button>
          </>
        }
      >
        <form onSubmit={handleAssignPlan} className="space-y-4">
          <FormInput
            label="Select Restaurant"
            name="restaurantId"
            type="select"
            value={assignFormData.restaurantId}
            onChange={(e) => setAssignFormData({ ...assignFormData, restaurantId: e.target.value })}
            options={restaurants.map((r) => ({
              label: `${r.name} (Currently on ${r.planName})`,
              value: r.id,
            }))}
          />

          <FormInput
            label="Target Subscription Plan"
            name="planId"
            type="select"
            value={assignFormData.planId}
            onChange={(e) => setAssignFormData({ ...assignFormData, planId: e.target.value })}
            options={plans.map((p) => ({
              label: `${p.name} (${formatINR(p.monthlyPrice)}/mo)`,
              value: p.id,
            }))}
          />

          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950">
            <strong>Instant Provisioning:</strong> The tenant's limits for ingredient counts and allowed staff seats will be automatically updated immediately upon confirmation.
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default SubscriptionPlans;
