import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Sliders,
  Sparkles,
  Building2,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  Check,
  Zap,
  Info,
  CreditCard,
  Receipt,
  FileCheck,
  RotateCcw,
  Tag,
  Lock,
  ChevronRight,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { formatINR } from '../../data/inventoryBillingData';
import {
  BASE_PLANS,
  FEATURE_ADDONS,
  AUTOMATION_LIMITS,
  calculateCustomPlanPricing,
  evaluateApprovalPath,
} from '../../services/pricingEngine';

export const CustomPlanBuilderPage = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    currentRestaurantId,
    restaurants,
    customPlanRequests,
    submitCustomPlanRequest,
    acceptQuotation,
    activateCustomSubscription,
    addToast,
  } = useApp();

  const currentRestaurant = restaurants.find((r) => r.id === currentRestaurantId) || restaurants[0];

  // --------------------------------------------------------------------------
  // Configurator State
  // --------------------------------------------------------------------------
  const [basePlanId, setBasePlanId] = useState('plan-pro');
  const [branches, setBranches] = useState(3);
  const [staffCount, setStaffCount] = useState(15);
  const [billingCycle, setBillingCycle] = useState('annual'); // 'monthly' | 'annual'
  const [selectedFeatureIds, setSelectedFeatureIds] = useState([
    'fefo_expiry',
    'qr_batch_matrix',
    'grn_dock_verification',
    'supplier_portal_billing',
  ]);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');
  const [manualDiscountPercent, setManualDiscountPercent] = useState(0);
  const [requestedCustomTerms, setRequestedCustomTerms] = useState('');

  // Checkout & Submission Modal States
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentGateway, setPaymentGateway] = useState('Razorpay - UPI / QR');
  const [paymentStep, setPaymentStep] = useState('review'); // 'review' | 'processing' | 'success'
  const [activeCreatedRequest, setActiveCreatedRequest] = useState(null);
  const [activatedResult, setActivatedResult] = useState(null);

  // Check if restaurant has existing custom plan requests
  const existingRestaurantRequests = useMemo(() => {
    return (customPlanRequests || []).filter(
      (r) => r.restaurantId === currentRestaurant?.id || r.restaurantName === currentRestaurant?.name
    );
  }, [customPlanRequests, currentRestaurant]);

  const activeExistingRequest = existingRestaurantRequests[0] || null;

  // --------------------------------------------------------------------------
  // Live Pricing Calculation
  // --------------------------------------------------------------------------
  const currentConfig = useMemo(() => {
    return {
      basePlanId,
      branches,
      staffCount,
      selectedFeatureIds,
      billingCycle,
      discountCode: appliedPromo,
      manualDiscountPercent,
      requestedCustomTerms,
    };
  }, [
    basePlanId,
    branches,
    staffCount,
    selectedFeatureIds,
    billingCycle,
    appliedPromo,
    manualDiscountPercent,
    requestedCustomTerms,
  ]);

  const pricing = useMemo(() => {
    return calculateCustomPlanPricing(currentConfig);
  }, [currentConfig]);

  const approvalEvaluation = useMemo(() => {
    return evaluateApprovalPath(currentConfig);
  }, [currentConfig]);

  // Toggle feature add-on
  const handleToggleFeature = (featureId) => {
    setSelectedFeatureIds((prev) => {
      if (prev.includes(featureId)) {
        return prev.filter((id) => id !== featureId);
      }
      return [...prev, featureId];
    });
  };

  // Apply promo code
  const handleApplyPromo = (e) => {
    e.preventDefault();
    const cleanCode = discountCode.trim().toUpperCase();
    if (!cleanCode) return;

    if (cleanCode === 'LAUNCH2026') {
      setAppliedPromo('LAUNCH2026');
      addToast('Promo code LAUNCH2026 applied! 10% promotional discount activated.', 'success');
    } else if (cleanCode === 'STOCKMATEVIP') {
      setAppliedPromo('STOCKMATEVIP');
      addToast('VIP code STOCKMATEVIP applied! 15% partner discount activated.', 'success');
    } else {
      addToast('Invalid promo code. Try LAUNCH2026 or STOCKMATEVIP.', 'error');
    }
  };

  // Submit Configuration (Handles Path A, B, and C)
  const handleSubmitConfiguration = () => {
    setIsSubmitting(true);

    const customerInfo = {
      restaurantId: currentRestaurant?.id,
      restaurantName: currentRestaurant?.name,
      ownerName: currentUser?.name || currentRestaurant?.ownerName,
      ownerEmail: currentUser?.email || currentRestaurant?.ownerEmail,
      ownerPhone: currentRestaurant?.phone || '+91 98201 23456',
      logo: currentRestaurant?.logo || '🌿',
    };

    const result = submitCustomPlanRequest(currentConfig, customerInfo);
    setIsSubmitting(false);

    if (result.success) {
      setActiveCreatedRequest(result.request);

      if (result.approvalEval.canCheckoutImmediately) {
        // Open instant checkout modal directly for Path A and Path B
        setPaymentStep('review');
        setIsCheckoutModalOpen(true);
      }
    }
  };

  // Handle Quotation Acceptance
  const handleAcceptQuotation = (requestId) => {
    const updated = acceptQuotation(requestId);
    if (updated) {
      setActiveCreatedRequest(updated);
      setPaymentStep('review');
      setIsCheckoutModalOpen(true);
    }
  };

  // Execute Payment and Activate Subscription
  const handleExecutePayment = () => {
    const targetRequestId = activeCreatedRequest?.id || activeExistingRequest?.id;
    if (!targetRequestId) return;

    setPaymentStep('processing');

    setTimeout(() => {
      const result = activateCustomSubscription(targetRequestId, {
        gateway: paymentGateway,
        method: 'Corporate NetBanking (HDFC Bank)',
      });

      if (result.success) {
        setActivatedResult(result);
        setPaymentStep('success');
      } else {
        setPaymentStep('review');
      }
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Custom Subscription Plan Builder"
        subtitle="Tailor your multi-branch restaurant infrastructure with automated pricing rules, scalable allowances, and instant self-serve activation."
        breadcrumbs={[
          { label: 'Dashboard', href: '#/dashboard' },
          { label: 'Plans & Billing', href: '#/branch-plans' },
          { label: 'Custom Plan Builder' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Building2}
              onClick={() => navigate('/branch-plans')}
            >
              Standard Plans
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Receipt}
              onClick={() => navigate('/billing')}
            >
              Invoices &amp; Billing
            </Button>
          </div>
        }
      />

      {/* Active Request Status Banner (if customer already submitted a request) */}
      {activeExistingRequest && activeExistingRequest.status !== 'activated' && (
        <div
          className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            activeExistingRequest.status === 'quoted'
              ? 'bg-emerald-50/90 border-emerald-300 shadow-sm'
              : activeExistingRequest.status === 'pending_review'
              ? 'bg-amber-50/90 border-amber-300'
              : 'bg-blue-50/90 border-blue-300'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  activeExistingRequest.status === 'quoted'
                    ? 'bg-emerald-600 text-white'
                    : activeExistingRequest.status === 'pending_review'
                    ? 'bg-amber-600 text-white'
                    : 'bg-blue-600 text-white'
                }`}
              >
                {activeExistingRequest.status === 'quoted' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : activeExistingRequest.status === 'pending_review' ? (
                  <Clock className="w-5 h-5" />
                ) : (
                  <FileCheck className="w-5 h-5" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-300">
                    {activeExistingRequest.id}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      activeExistingRequest.status === 'quoted'
                        ? 'bg-emerald-100 text-emerald-800'
                        : activeExistingRequest.status === 'pending_review'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {activeExistingRequest.status === 'quoted'
                      ? '⭐ Quotation Issued by Super Admin'
                      : activeExistingRequest.status === 'pending_review'
                      ? '⏳ Under Super Admin Review (Path C)'
                      : '✅ Approved by Administration'}
                  </span>
                  <span className="text-xs text-slate-500">
                    Submitted on {activeExistingRequest.requestDate}
                  </span>
                </div>

                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  {activeExistingRequest.status === 'quoted' ? (
                    <>
                      Super Admin reviewed your custom request and proposed a tailored executive rate of{' '}
                      <strong className="text-emerald-800 text-sm font-bold">
                        {formatINR(activeExistingRequest.proposedQuotation)}
                      </strong>{' '}
                      ({activeExistingRequest.config.billingCycle} billing cycle).
                      {activeExistingRequest.adminNotes && (
                        <span className="block text-slate-600 italic mt-0.5">
                          Note: "{activeExistingRequest.adminNotes}"
                        </span>
                      )}
                    </>
                  ) : activeExistingRequest.status === 'pending_review' ? (
                    <>
                      Your custom requirements require engineering feasibility assessment.
                      {activeExistingRequest.reviewReasons?.length > 0 && (
                        <span className="block font-medium text-amber-900 mt-0.5">
                          Trigger: {activeExistingRequest.reviewReasons[0]}
                        </span>
                      )}
                    </>
                  ) : (
                    <>Your custom plan has been approved and is ready for payment verification.</>
                  )}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2 w-full sm:w-auto">
              {activeExistingRequest.status === 'quoted' && (
                <Button
                  variant="brand"
                  size="sm"
                  icon={Check}
                  className="w-full sm:w-auto"
                  onClick={() => handleAcceptQuotation(activeExistingRequest.id)}
                >
                  Accept Quote &amp; Checkout ({formatINR(activeExistingRequest.proposedQuotation)})
                </Button>
              )}

              {activeExistingRequest.status === 'approved' && (
                <Button
                  variant="brand"
                  size="sm"
                  icon={CreditCard}
                  className="w-full sm:w-auto"
                  onClick={() => {
                    setActiveCreatedRequest(activeExistingRequest);
                    setPaymentStep('review');
                    setIsCheckoutModalOpen(true);
                  }}
                >
                  Proceed to Payment ({formatINR(activeExistingRequest.proposedQuotation || activeExistingRequest.systemCalculatedAmount)})
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Builder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Configuration Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Base Tier Selection */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Step 1 • Foundation
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-2">
                  Select Base Plan Archetype
                </h3>
              </div>
              <span className="text-xs text-slate-400">Determines included feature allowances</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Object.values(BASE_PLANS).map((p) => {
                const isSelected = basePlanId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setBasePlanId(p.id)}
                    className={`p-4 rounded-xl text-left border transition-all relative ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">{p.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200/80 text-slate-700 font-semibold">
                        {p.badge}
                      </span>
                    </div>
                    <div className="text-lg font-black text-slate-900">
                      {formatINR(billingCycle === 'annual' ? Math.round(p.baseAnnualPrice / 12) : p.baseMonthlyPrice)}
                      <span className="text-[11px] font-normal text-slate-500">/mo</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Includes {p.includedBranches} branches &amp; {p.includedStaff} staff
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Capacity & Scaling Controls */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Step 2 • Kitchen Capacity
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-2">
                Outlets &amp; Staff Account Scaling
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Scale smoothly from single dining spots to multi-city restaurant franchises.
              </p>
            </div>

            {/* Branches Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>Number of Restaurant Branches / Outlets:</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={branches}
                    onChange={(e) => setBranches(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 px-2 py-1 text-center font-bold text-sm text-slate-900 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-slate-500">Branches</span>
                </div>
              </div>

              <input
                type="range"
                min="1"
                max="50"
                value={branches}
                onChange={(e) => setBranches(parseInt(e.target.value) || 1)}
                className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />

              <div className="flex justify-between text-[11px] text-slate-400">
                <span>1 Branch (Single)</span>
                <span>10 Branches (Path A Auto)</span>
                <span>25 Branches (Path B Enterprise)</span>
                <span className="text-amber-600 font-semibold">&gt;25 (Path C Review)</span>
              </div>
            </div>

            {/* Staff Accounts Slider */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Staff &amp; Line-Cook Account Capacity:</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="2"
                    max="300"
                    value={staffCount}
                    onChange={(e) => setStaffCount(Math.max(2, parseInt(e.target.value) || 2))}
                    className="w-16 px-2 py-1 text-center font-bold text-sm text-slate-900 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-slate-500">Staff</span>
                </div>
              </div>

              <input
                type="range"
                min="5"
                max="150"
                step="5"
                value={staffCount}
                onChange={(e) => setStaffCount(parseInt(e.target.value) || 5)}
                className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />

              <div className="flex justify-between text-[11px] text-slate-400">
                <span>5 Users</span>
                <span>50 Users (Path A Auto)</span>
                <span>100 Users (Path B Auto)</span>
                <span className="text-amber-600 font-semibold">&gt;100 (Path C Review)</span>
              </div>
            </div>
          </div>

          {/* Step 3: Modular Feature Add-ons */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Step 3 • Modular Capabilities
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-2">
                  Feature Modules &amp; Enterprise Add-ons
                </h3>
              </div>
              <span className="text-xs text-slate-400">Select required operational tools</span>
            </div>

            <div className="space-y-3">
              {FEATURE_ADDONS.map((addon) => {
                const isChecked = selectedFeatureIds.includes(addon.id);
                const isIncludedInBase = Boolean(
                  (addon.includedIn && Array.isArray(addon.includedIn) && addon.includedIn.includes(basePlanId)) ||
                  (BASE_PLANS[basePlanId]?.includedModuleIds?.includes(addon.id))
                );
                const priceLabel = isIncludedInBase
                  ? 'Included in Base'
                  : `+${formatINR(billingCycle === 'annual' ? addon.annualPrice : addon.monthlyPrice)} / ${
                      billingCycle === 'annual' ? 'yr' : 'mo'
                    }`;

                return (
                  <div
                    key={addon.id}
                    onClick={() => handleToggleFeature(addon.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                      isChecked
                        ? addon.requiresCustomDev
                          ? 'border-amber-400 bg-amber-50/40 ring-1 ring-amber-300'
                          : 'border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-300'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by parent onClick
                        className="mt-1 h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900">{addon.name}</span>
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.2 rounded-md">
                            {addon.category}
                          </span>
                          {addon.requiresCustomDev && (
                            <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.2 rounded-md flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-amber-700" />
                              Requires Lead Dev Scoping (Path C)
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          {addon.description}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs font-bold block ${
                          isIncludedInBase ? 'text-emerald-700' : 'text-slate-900'
                        }`}
                      >
                        {priceLabel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 4: Billing Cycle & Commercial Options */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Step 4 • Commercial Terms
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-2">
              Billing Frequency &amp; Discounts
            </h3>

            {/* Cycle Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Billing Cadence</span>
                <span className="text-[11px] text-slate-500">
                  Annual billing includes 2 months free (~16.7% automated discount).
                </span>
              </div>

              <div className="flex items-center bg-white p-1 rounded-lg border border-slate-200 shadow-xs">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('annual')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${
                    billingCycle === 'annual'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Annual</span>
                  <span className="text-[10px] bg-amber-400 text-slate-950 px-1 py-0.2 rounded font-black">
                    Save 2 Mos
                  </span>
                </button>
              </div>
            </div>

            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Promo code (e.g. LAUNCH2026 or STOCKMATEVIP)"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono uppercase rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <Button type="submit" variant="outline" size="sm">
                Apply Code
              </Button>
            </form>

            {appliedPromo && (
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
                <span>Code <strong>{appliedPromo}</strong> applied successfully!</span>
                <button
                  type="button"
                  onClick={() => {
                    setAppliedPromo('');
                    setDiscountCode('');
                  }}
                  className="text-emerald-700 hover:underline font-bold text-[11px]"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Custom Notes / Requests */}
            <div className="space-y-1 pt-2">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Special Requirements or Legacy POS Notes (Optional):</span>
                <span className="text-[10px] text-slate-400">Specifying custom software dev triggers Path C</span>
              </label>
              <textarea
                rows={2}
                placeholder="Mention any custom POS brand, custom ERP specifications, or unique branch grouping requirements..."
                value={requestedCustomTerms}
                onChange={(e) => setRequestedCustomTerms(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Centralized Pricing Summary & Rule Approval Engine (5 cols) */}
        <div className="lg:col-span-5 sticky top-24 space-y-5">
          <div className="rounded-3xl bg-slate-950 text-white p-6 border border-slate-800 shadow-2xl relative overflow-hidden">
            {/* Ambient emerald backlight */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[90px] rounded-full pointer-events-none"></div>

            {/* Card Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                  ₹
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Centralized Pricing Engine</h3>
                  <span className="text-[10px] text-slate-400">Authoritative Single Source of Truth</span>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                {pricing.billingCycle} Billing
              </span>
            </div>

            {/* Itemized Calculation Breakdown */}
            <div className="py-4 space-y-2.5 text-xs border-b border-slate-800/80">
              <div className="flex justify-between items-center text-slate-300">
                <span>
                  Base Plan ({pricing.basePlanName}):
                </span>
                <span className="font-mono text-white">{formatINR(pricing.baseCost)}</span>
              </div>

              {pricing.extraBranches > 0 && (
                <div className="flex justify-between items-center text-slate-300">
                  <span>
                    Additional Outlets (+{pricing.extraBranches} branches):
                  </span>
                  <span className="font-mono text-white">{formatINR(pricing.branchesCost)}</span>
                </div>
              )}

              {pricing.extraStaff > 0 && (
                <div className="flex justify-between items-center text-slate-300">
                  <span>
                    Staff Capacity (+{pricing.extraStaff} seats):
                  </span>
                  <span className="font-mono text-white">{formatINR(pricing.staffCost)}</span>
                </div>
              )}

              {pricing.featuresCost > 0 && (
                <div className="flex justify-between items-center text-slate-300">
                  <span>
                    Feature Modules ({pricing.itemizedFeatures.filter((f) => !f.isIncludedInBase).length} add-ons):
                  </span>
                  <span className="font-mono text-white">{formatINR(pricing.featuresCost)}</span>
                </div>
              )}

              {/* Subtotal */}
              <div className="flex justify-between items-center text-slate-400 pt-1 border-t border-slate-800/60 font-medium">
                <span>Gross Subtotal:</span>
                <span className="font-mono">{formatINR(pricing.grossSubtotal)}</span>
              </div>

              {/* Discounts */}
              {pricing.volumeDiscountAmount > 0 && (
                <div className="flex justify-between items-center text-emerald-400">
                  <span>Multi-Location Volume Discount ({pricing.volumeDiscountPercent}%):</span>
                  <span className="font-mono">-{formatINR(pricing.volumeDiscountAmount)}</span>
                </div>
              )}

              {pricing.promoDiscountAmount > 0 && (
                <div className="flex justify-between items-center text-emerald-400">
                  <span>Promotional Discount ({pricing.promoDiscountPercent}%):</span>
                  <span className="font-mono">-{formatINR(pricing.promoDiscountAmount)}</span>
                </div>
              )}

              {/* Pre-tax */}
              <div className="flex justify-between items-center text-slate-300 pt-1 font-semibold">
                <span>Net Pre-Tax Base:</span>
                <span className="font-mono text-white">{formatINR(pricing.netPreTaxAmount)}</span>
              </div>

              {/* 18% GST */}
              <div className="flex justify-between items-center text-slate-400">
                <span>GST (18% Statutory Tax):</span>
                <span className="font-mono">{formatINR(pricing.gstAmount)}</span>
              </div>
            </div>

            {/* Total Display */}
            <div className="py-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Total Authorized Subscription Price
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {formatINR(pricing.totalAmount)}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {pricing.isAnnual ? (
                    <>
                      Equiv. <strong className="text-emerald-400 font-bold">{formatINR(pricing.monthlyEquivalent)}</strong> / mo
                    </>
                  ) : (
                    '/ month'
                  )}
                </span>
              </div>
            </div>

            {/* Rule-Based Approval Engine Routing Card */}
            <div
              className={`p-4 rounded-2xl border text-xs space-y-2 mb-6 ${
                approvalEvaluation.path === 'PATH_A'
                  ? 'bg-emerald-950/70 border-emerald-600/60 text-emerald-200'
                  : approvalEvaluation.path === 'PATH_B'
                  ? 'bg-teal-950/70 border-teal-600/60 text-teal-200'
                  : 'bg-amber-950/70 border-amber-600/60 text-amber-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {approvalEvaluation.path === 'PATH_A' ? (
                    <Zap className="w-4 h-4 text-emerald-400" />
                  ) : approvalEvaluation.path === 'PATH_B' ? (
                    <Sparkles className="w-4 h-4 text-teal-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  )}
                  <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                    {approvalEvaluation.pathName}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    approvalEvaluation.status === 'auto_approved'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {approvalEvaluation.status === 'auto_approved' ? '⚡ Instant Approval' : '⏳ Review Required'}
                </span>
              </div>

              <div className="text-[11px] leading-relaxed opacity-90 space-y-1">
                {approvalEvaluation.reasons.map((r, i) => (
                  <p key={i} className="flex items-start gap-1.5">
                    <span className="text-xs">•</span>
                    <span>{r}</span>
                  </p>
                ))}
              </div>
            </div>

            {/* Primary Action Button */}
            {approvalEvaluation.canCheckoutImmediately ? (
              <button
                type="button"
                onClick={handleSubmitConfiguration}
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/30 hover:shadow-emerald-600/40 transition-all flex items-center justify-center gap-2"
              >
                <span>Confirm &amp; Proceed to Instant Checkout ⚡</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitConfiguration}
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-extrabold text-sm shadow-xl shadow-amber-600/30 transition-all flex items-center justify-center gap-2"
              >
                <span>Submit for Super Admin Review &amp; Quotation</span>
                <Clock className="w-4 h-4" />
              </button>
            )}

            {/* Trust Footer */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                Authoritative Validation
              </span>
              <span>18% GST Compliant Invoice</span>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout & Gateway Verification Modal */}
      <Modal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        title={
          paymentStep === 'success'
            ? 'Subscription Successfully Activated!'
            : 'Authorize Subscription Payment & Checkout'
        }
        subtitle={
          paymentStep === 'success'
            ? 'Your custom plan has been provisioned across all restaurant branches.'
            : 'Authoritative backend revalidation & gateway settlement.'
        }
        maxWidth="max-w-xl"
      >
        {paymentStep === 'review' && (
          <div className="space-y-5">
            {/* Invoice Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Restaurant Tenant:</span>
                <span className="font-bold text-slate-900">{currentRestaurant?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Configured Scale:</span>
                <span className="font-bold text-slate-900">
                  {currentConfig.branches} Branches • {currentConfig.staffCount} Staff Accounts
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Billing Cycle:</span>
                <span className="font-bold text-slate-900">{pricing.billingCycle}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-900">Total Authorized Amount:</span>
                <span className="text-base font-black text-emerald-800 font-mono">
                  {formatINR(activeCreatedRequest?.proposedQuotation || pricing.totalAmount)}
                </span>
              </div>
            </div>

            {/* Gateway Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Select Payment Method / Gateway:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Razorpay - UPI / QR Code',
                  'HDFC Corporate Credit Card',
                  'Axis Bank NetBanking',
                  'Stripe India Corporate Card',
                ].map((gw) => (
                  <button
                    key={gw}
                    type="button"
                    onClick={() => setPaymentGateway(gw)}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                      paymentGateway === gw
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    {gw}
                  </button>
                ))}
              </div>
            </div>

            {/* Anti-tamper notice */}
            <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center gap-2 text-[11px] text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Backend verifies pricing integrity, idempotency keys, and tenant authorization before activating features.
              </span>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setIsCheckoutModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="brand"
                size="sm"
                icon={CreditCard}
                onClick={handleExecutePayment}
              >
                Authorize &amp; Pay {formatINR(activeCreatedRequest?.proposedQuotation || pricing.totalAmount)}
              </Button>
            </div>
          </div>
        )}

        {paymentStep === 'processing' && (
          <div className="py-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin mx-auto"></div>
            <h4 className="text-base font-bold text-slate-900">
              Verifying Payment &amp; Provisioning Subscription...
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Validating transaction reference with payment gateway and initializing branch allowances.
            </p>
          </div>
        )}

        {paymentStep === 'success' && (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Custom Subscription Activated!
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                Thank you! Your custom subscription has been verified and activated for{' '}
                <strong>{currentRestaurant?.name}</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Subscription ID:</span>
                <span className="font-bold text-slate-900">{activatedResult?.subscriptionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction Ref:</span>
                <span className="font-bold text-slate-900">{activatedResult?.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tax Invoice Number:</span>
                <span className="font-bold text-emerald-700">{activatedResult?.invoiceId}</span>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                icon={Receipt}
                onClick={() => {
                  setIsCheckoutModalOpen(false);
                  navigate('/billing');
                }}
              >
                View GST Tax Invoice
              </Button>
              <Button
                variant="brand"
                size="sm"
                icon={Check}
                onClick={() => {
                  setIsCheckoutModalOpen(false);
                  navigate('/branch-subscriptions');
                }}
              >
                Go to Branch Subscriptions
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

