import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Boxes,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Shield,
  ArrowRight,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  CreditCard,
  CalendarCheck,
  Check,
  AlertCircle,
  Clock,
  ShieldCheck,
  Store,
  Sliders,
  ChevronRight,
  HelpCircle,
  FileText,
  CheckSquare,
  Square,
  Info,
  RefreshCw,
  Cpu,
  Layers,
  Send,
  ArrowUpRight,
  Plus,
  Minus,
  CheckCircle,
  AlertTriangle,
  BadgePercent,
  Receipt,
  Download,
  Building,
  Monitor,
  Users,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { formatINR } from '../../data/inventoryBillingData';
import {
  BASE_PLANS,
  MODULE_CATALOG,
  PRICING_UNIT_RATES,
  calculateCustomPlanPricing,
  evaluateApprovalPath,
  validateAndAuthorizePricing,
} from '../../services/pricingEngine';

export const SignUpPage = () => {
  const { registerAndActivateRestaurant, submitCustomPlanRequest, plans: appPlans } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Multi-Step Registration Journey:
  // Step 1: Restaurant & Account Details
  // Step 2: Choose Your Plan (Starter, Pro, Enterprise, Build Your Own Plan)
  // Step 3: Configure Custom Plan (if Build Your Own Plan chosen)
  // Step 4: Review Subscription & Itemized Breakdown
  // Step 5: Checkout & Payment Verification (or Custom Quote Submission for Path C)
  // Step 6: Workspace Activated & Launch Dashboard
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    name: 'Saffron Bistro & Lounge',
    cuisine: 'North Indian & Mediterranean Grill',
    address: 'Plot 18, Senapati Bapat Road, Pune, Maharashtra 411016',
    phone: '+91 98220 55441',
    branches: 1,
    ownerName: 'Arman Zadeh',
    ownerEmail: 'arman@saffronbistro.com',
    password: 'password123',
    confirmPassword: 'password123',
    planId: 'plan-pro', // Default: Professional (Most Popular)
    billingCycle: 'annual', // Requirement: Default to Yearly with ~20% savings badge
    isTrial: false,
    paymentMethod: 'Corporate Credit Card (Visa/Mastercard)',
    transactionRef: `TXN-${Date.now().toString().slice(-6)}`,
    authorizedTrialAgreement: false,
  });

  // Custom Plan Builder State
  const [customConfig, setCustomConfig] = useState({
    outlets: 2,
    staffAccounts: 8,
    terminals: 2,
    selectedModuleIds: [
      'pos_billing',
      'inventory_mgmt',
      'expiry_fefo',
      'recipe_costing',
      'po_goods_receiving',
      'qr_batch_matrix',
    ],
    customNotes: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [stepErrors, setStepErrors] = useState({});
  const [activationResult, setActivationResult] = useState(null);
  const [customQuoteResult, setCustomQuoteResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle URL Query Params on mount (e.g., /signup?plan=plan-starter or /signup?plan=plan-custom)
  useEffect(() => {
    const planParam = searchParams.get('plan');
    if (planParam && (BASE_PLANS[planParam] || planParam === 'plan-custom')) {
      setFormData((prev) => ({
        ...prev,
        planId: planParam,
        isTrial: planParam === 'plan-custom' ? false : prev.isTrial,
      }));
    }
  }, [searchParams]);

  // Centralized Custom Pricing Calculation
  const customPricing = useMemo(() => {
    return calculateCustomPlanPricing({
      basePlanId: 'plan-custom',
      outlets: customConfig.outlets,
      staffCount: customConfig.staffAccounts,
      posTerminals: customConfig.terminals,
      selectedModuleIds: customConfig.selectedModuleIds,
      billingCycle: formData.billingCycle,
    });
  }, [customConfig, formData.billingCycle]);

  // Centralized Approval Path Evaluation
  const approvalEval = useMemo(() => {
    return evaluateApprovalPath({
      outlets: customConfig.outlets,
      staffCount: customConfig.staffAccounts,
      posTerminals: customConfig.terminals,
      selectedModuleIds: customConfig.selectedModuleIds,
      billingCycle: formData.billingCycle,
      hasCustomNotes: !!customConfig.customNotes.trim(),
    });
  }, [customConfig, formData.billingCycle]);

  // Selected Standard Plan Object
  const selectedStandardPlan = useMemo(() => {
    const fromContext = (appPlans || []).find((p) => p.id === formData.planId);
    if (fromContext) {
      const isAnnual = formData.billingCycle === 'annual';
      const annualPrice = fromContext.annualPrice ?? Math.round(fromContext.monthlyPrice * 12 * 0.8);
      const annualSavings = fromContext.annualSavings ?? Math.max(0, fromContext.monthlyPrice * 12 - annualPrice);
      const effectiveMonthlyAnnual = fromContext.effectiveMonthlyAnnual ?? Math.round(annualPrice / 12);
      return {
        ...fromContext,
        annualPrice,
        annualSavings,
        effectiveMonthlyAnnual,
        includedOutlets: fromContext.limits?.branches ?? 1,
        includedStaff: fromContext.limits?.maxStaff ?? 5,
        includedTerminals: fromContext.limits?.terminals ?? 1,
        includedModuleIds: BASE_PLANS[fromContext.id]?.includedModuleIds || ['pos_billing', 'inventory_mgmt'],
      };
    }
    return BASE_PLANS[formData.planId] || BASE_PLANS['plan-pro'];
  }, [appPlans, formData.planId, formData.billingCycle]);
  const isCustomPlanSelected = formData.planId === 'plan-custom';

  // Computed Pricing Summary for Review & Checkout
  const currentPlanSummary = useMemo(() => {
    const isAnnual = formData.billingCycle === 'annual';
    if (isCustomPlanSelected) {
      return {
        id: 'plan-custom',
        name: 'Custom Engineered Plan',
        badge: approvalEval.pathName,
        target: 'Tailored kitchen architecture configured by customer.',
        outlets: customConfig.outlets,
        staff: customConfig.staffAccounts,
        terminals: customConfig.terminals,
        activeModules: customConfig.selectedModuleIds,
        baseSubtotal: customPricing.grossSubtotal,
        discountAmount: customPricing.totalDiscountAmount,
        netPreTax: customPricing.netPreTaxAmount,
        gstAmount: customPricing.gstAmount,
        totalPayable: customPricing.totalAmount,
        effectiveMonthlyRate: customPricing.effectiveMonthlyAnnual,
        annualSavings: customPricing.annualSavings,
        approvalPath: approvalEval.path,
        requiresManualReview: approvalEval.requiresManualReview,
      };
    }

    const plan = selectedStandardPlan;
    const baseSubtotal = isAnnual ? plan.annualPrice : plan.monthlyPrice;
    const gstAmount = Math.round(baseSubtotal * PRICING_UNIT_RATES.gstRate);
    const totalPayable = baseSubtotal + gstAmount;
    const effectiveMonthlyRate = isAnnual
      ? Math.round(totalPayable / 12)
      : totalPayable;
    const annualSavings = isAnnual ? plan.annualSavings : 0;

    return {
      id: plan.id,
      name: `${plan.name} Plan`,
      badge: plan.badge,
      target: plan.target,
      outlets: plan.includedOutlets,
      staff: plan.includedStaff,
      terminals: plan.includedTerminals,
      activeModules: plan.includedModuleIds,
      baseSubtotal,
      discountAmount: 0,
      netPreTax: baseSubtotal,
      gstAmount,
      totalPayable,
      effectiveMonthlyRate,
      annualSavings,
      approvalPath: 'PATH_A_INSTANT',
      requiresManualReview: false,
    };
  }, [formData.planId, formData.billingCycle, isCustomPlanSelected, customConfig, customPricing, approvalEval, selectedStandardPlan]);

  // Validation per step
  const validateStep = (stepNumber) => {
    const errors = {};

    if (stepNumber === 1) {
      if (!formData.name.trim()) errors.name = 'Restaurant name is required';
      if (!formData.cuisine.trim()) errors.cuisine = 'Cuisine / concept is required';
      if (!formData.address.trim()) errors.address = 'Primary location address is required';
      if (!formData.phone.trim()) errors.phone = 'Contact phone number is required';
      if (!formData.ownerName.trim()) errors.ownerName = 'Owner full name is required';
      if (!formData.ownerEmail.trim()) {
        errors.ownerEmail = 'Work email address is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.ownerEmail.trim())) {
        errors.ownerEmail = 'Please enter a valid work email';
      }
      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    if (stepNumber === 2) {
      if (!formData.planId) {
        errors.planId = 'Please select a subscription plan or choose Build Your Own Plan';
      }
    }

    if (stepNumber === 3) {
      if (isCustomPlanSelected && customConfig.selectedModuleIds.length === 0) {
        errors.modules = 'Please select at least one core kitchen module';
      }
    }

    if (stepNumber === 5) {
      if (!currentPlanSummary.requiresManualReview) {
        if (!formData.isTrial) {
          if (!formData.transactionRef.trim()) {
            errors.transactionRef = 'Payment Transaction Reference ID or UTR number is required';
          }
        } else {
          if (!formData.authorizedTrialAgreement) {
            errors.authorizedTrialAgreement = 'You must acknowledge the authorized commercial trial terms';
          }
        }
      }
    }

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step Forward Navigation
  const handleNextStep = (e) => {
    if (e) e.preventDefault();
    if (!validateStep(currentStep)) return;

    setStepErrors({});

    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (isCustomPlanSelected) {
        setCurrentStep(3); // Go to Custom Config
      } else {
        setCurrentStep(4); // Skip directly to Review Subscription
      }
    } else if (currentStep === 3) {
      setCurrentStep(4); // Custom Config done -> Review Subscription
    } else if (currentStep === 4) {
      setCurrentStep(5); // Review -> Checkout
    }
  };

  // Step Backward Navigation (Preserves all state!)
  const handlePrevStep = () => {
    setStepErrors({});
    if (currentStep === 5) {
      setCurrentStep(4);
    } else if (currentStep === 4) {
      if (isCustomPlanSelected) {
        setCurrentStep(3);
      } else {
        setCurrentStep(2);
      }
    } else if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  // Module toggle for Custom Plan Builder
  const toggleModule = (moduleId) => {
    if (moduleId === 'pos_billing') return; // Base module required
    setCustomConfig((prev) => {
      const exists = prev.selectedModuleIds.includes(moduleId);
      return {
        ...prev,
        selectedModuleIds: exists
          ? prev.selectedModuleIds.filter((id) => id !== moduleId)
          : [...prev.selectedModuleIds, moduleId],
      };
    });
  };

  // Step 5 Completion: Checkout & Payment Verification OR Super Admin Review Queue Submission
  const handleFinalActivation = (e) => {
    e.preventDefault();
    if (!validateStep(5)) return;

    setIsSubmitting(true);

    setTimeout(() => {
      // If Path C (Manual Review Required)
      if (currentPlanSummary.requiresManualReview) {
        const quoteResult = submitCustomPlanRequest(
          {
            outlets: customConfig.outlets,
            staffAccounts: customConfig.staffAccounts,
            terminals: customConfig.terminals,
            selectedModuleIds: customConfig.selectedModuleIds,
            billingCycle: formData.billingCycle,
            notes: customConfig.customNotes,
          },
          {
            restaurantName: formData.name,
            ownerName: formData.ownerName,
            ownerEmail: formData.ownerEmail,
            ownerPhone: formData.phone,
          }
        );
        setCustomQuoteResult(quoteResult);
        setIsSubmitting(false);
        setCurrentStep(6);
        return;
      }

      // Authoritative Backend Price Validation Check
      const clientAmount = formData.isTrial ? 0 : currentPlanSummary.totalPayable;
      const authValidation = validateAndAuthorizePricing(
        {
          basePlanId: formData.planId,
          outlets: isCustomPlanSelected ? customConfig.outlets : selectedStandardPlan.includedOutlets,
          staffCount: isCustomPlanSelected ? customConfig.staffAccounts : selectedStandardPlan.includedStaff,
          posTerminals: isCustomPlanSelected ? customConfig.terminals : selectedStandardPlan.includedTerminals,
          selectedModuleIds: isCustomPlanSelected ? customConfig.selectedModuleIds : selectedStandardPlan.includedModuleIds,
          billingCycle: formData.billingCycle,
        },
        clientAmount
      );

      // Perform Activation
      const result = registerAndActivateRestaurant({
        ...formData,
        branches: currentPlanSummary.outlets,
        planName: currentPlanSummary.name,
        priceINR: currentPlanSummary.totalPayable,
        customConfig: isCustomPlanSelected ? customConfig : null,
      });

      setActivationResult(result);
      setIsSubmitting(false);
      setCurrentStep(6);
    }, 450);
  };

  // Stepper labels
  const stepperSteps = [
    { num: 1, label: 'Restaurant' },
    { num: 2, label: 'Choose Plan' },
    ...(isCustomPlanSelected ? [{ num: 3, label: 'Custom Config' }] : []),
    { num: 4, label: 'Review' },
    { num: 5, label: 'Checkout' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative selection:bg-emerald-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl w-full mx-auto">
        {/* Top Navigation */}
        <div className="mb-4 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors bg-slate-900 hover:bg-slate-850 px-3 py-1.5 rounded-xl border border-slate-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
          <div className="text-xs text-slate-400">
            <span>Already registered? </span>
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-bold">
              Sign In
            </Link>
          </div>
        </div>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white shadow-xl shadow-emerald-500/20 mb-2">
            <Boxes className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Register Your Restaurant &amp; Activate Plan
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl mx-auto">
            Experience high-performance pantry governance, SVG QR batch tracking, and predictive kitchen operations.
          </p>
        </div>

        {/* Dynamic Stepper Bar */}
        {currentStep < 6 && (
          <div className="mb-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 shadow-md">
            <div className={`grid grid-cols-${stepperSteps.length} gap-1 sm:gap-2 text-center text-xs`}>
              {stepperSteps.map((s) => {
                const isActive = currentStep === s.num;
                const isPassed = currentStep > s.num;
                return (
                  <div
                    key={s.num}
                    className={`flex items-center justify-center gap-1 sm:gap-2 py-2 px-2 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-emerald-600 text-white font-bold shadow-md ring-1 ring-emerald-400/40'
                        : isPassed
                        ? 'text-emerald-400 bg-emerald-950/40 font-semibold'
                        : 'text-slate-500'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        isPassed
                          ? 'bg-emerald-500 text-slate-950'
                          : isActive
                          ? 'bg-white text-emerald-900'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isPassed ? <Check className="w-3 h-3" /> : s.num}
                    </span>
                    <span className="hidden sm:inline truncate">{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Step Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 animate-fade-in-up">
          {/* ========================================================================= */}
          {/* STEP 1: Restaurant Details & Owner Account */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <form onSubmit={handleNextStep} className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-400" />
                  <span>Step 1: Restaurant Details &amp; Administrator Account</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Enter your restaurant location details and primary admin login credentials.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Restaurant / Concept Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Saffron Bistro & Lounge"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 transition-colors"
                  />
                  {stepErrors.name && <p className="text-[11px] text-rose-400 mt-1">{stepErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Cuisine / Dining Format *
                  </label>
                  <input
                    type="text"
                    value={formData.cuisine}
                    onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                    placeholder="e.g. North Indian & Mediterranean Grill"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 transition-colors"
                  />
                  {stepErrors.cuisine && <p className="text-[11px] text-rose-400 mt-1">{stepErrors.cuisine}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Primary Restaurant Address *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. Plot 18, Senapati Bapat Road, Pune, Maharashtra 411016"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 transition-colors"
                  />
                  {stepErrors.address && <p className="text-[11px] text-rose-400 mt-1">{stepErrors.address}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Contact Phone Number *
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +91 98220 55441"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 transition-colors"
                  />
                  {stepErrors.phone && <p className="text-[11px] text-rose-400 mt-1">{stepErrors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Owner / Managing Partner Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    placeholder="e.g. Arman Zadeh"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 transition-colors"
                  />
                  {stepErrors.ownerName && <p className="text-[11px] text-rose-400 mt-1">{stepErrors.ownerName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Owner Work Email (Admin Login) *
                  </label>
                  <input
                    type="email"
                    value={formData.ownerEmail}
                    onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                    placeholder="e.g. arman@saffronbistro.com"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 transition-colors"
                  />
                  {stepErrors.ownerEmail && <p className="text-[11px] text-rose-400 mt-1">{stepErrors.ownerEmail}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Create Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="At least 6 characters"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 pr-10 focus:outline-hidden focus:border-emerald-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {stepErrors.password && <p className="text-[11px] text-rose-400 mt-1">{stepErrors.password}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Re-enter your password"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 pr-10 focus:outline-hidden focus:border-emerald-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {stepErrors.confirmPassword && (
                    <p className="text-[11px] text-rose-400 mt-1">{stepErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <Button type="submit" variant="brand" iconRight={ArrowRight}>
                  Proceed to Plan Selection
                </Button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: Choose Your Plan (4 Options with Annual Default Toggle) */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-emerald-400" />
                    <span>Step 2: Choose Your Plan</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select a standard kitchen tier or engineer a custom multi-outlet configuration.
                  </p>
                </div>

                {/* Monthly / Yearly Toggle defaulting to Yearly with ~20% label */}
                <div className="inline-flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner shrink-0">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, billingCycle: 'monthly' })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                      formData.billingCycle === 'monthly'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Monthly Billing
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, billingCycle: 'annual' })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                      formData.billingCycle === 'annual'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>Annual Billing</span>
                    <span className="text-[10px] bg-emerald-400 text-slate-950 font-black px-1.5 py-0.5 rounded-md">
                      Save ~20%
                    </span>
                  </button>
                </div>
              </div>

              {/* 4 Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
                {/* 1, 2, 3: Dynamic Standard Plans */}
                {((appPlans && appPlans.length > 0 ? appPlans : Object.values(BASE_PLANS))
                  .filter((p) => p.status !== 'inactive' && p.id !== 'plan-custom'))
                  .map((plan) => {
                    const isSelected = formData.planId === plan.id;
                    const isPopular = plan.popular || plan.id === 'plan-pro';
                    const annualPrice = plan.annualPrice ?? Math.round(plan.monthlyPrice * 12 * 0.8);
                    const annualSavings = plan.annualSavings ?? Math.max(0, plan.monthlyPrice * 12 - annualPrice);
                    const effectiveMonthly = plan.effectiveMonthlyAnnual ?? Math.round(annualPrice / 12);
                    const price = formData.billingCycle === 'annual' ? effectiveMonthly : plan.monthlyPrice;

                    return (
                      <div
                        key={plan.id}
                        onClick={() => setFormData({ ...formData, planId: plan.id })}
                        className={`cursor-pointer rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between relative ${
                          isSelected
                            ? isPopular
                              ? 'border-emerald-500 bg-gradient-to-b from-emerald-950/40 to-slate-950 ring-2 ring-emerald-500/50 shadow-2xl'
                              : 'border-emerald-500 bg-emerald-950/30 ring-2 ring-emerald-500/40 shadow-xl'
                            : isPopular
                            ? 'border-emerald-800/70 bg-slate-950/80 hover:border-emerald-600'
                            : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                        }`}
                      >
                        {isPopular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md animate-pulse-glow">
                            Most Popular
                          </div>
                        )}

                        <div>
                          <div className="flex items-center justify-between mb-1 mt-1">
                            <span className="font-bold text-sm text-white">{plan.name}</span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-md border ${
                                isPopular
                                  ? 'text-emerald-300 bg-emerald-900/60 border-emerald-700'
                                  : 'text-slate-400 bg-slate-900 border-slate-800'
                              }`}
                            >
                              {plan.badge || (isPopular ? 'Most Popular' : 'Essential')}
                            </span>
                          </div>

                          <div className="mt-2">
                            <span className="text-2xl font-black text-white">{formatINR(price)}</span>
                            <span className="text-xs text-slate-400 font-normal"> / month</span>
                          </div>

                          <div className="text-[11px] text-emerald-400 font-medium mt-1">
                            {formData.billingCycle === 'annual' ? (
                              <span>
                                Billed annually at {formatINR(annualPrice)}/yr (Save {formatINR(annualSavings)})
                              </span>
                            ) : (
                              <span className="text-slate-400">Billed monthly, cancel anytime</span>
                            )}
                          </div>

                          <p className="text-[11px] text-slate-300 mt-2 leading-relaxed min-h-[30px]">
                            {plan.description || plan.target}
                          </p>

                          <div className="mt-3 p-2 rounded-xl bg-slate-900/80 border border-slate-800/80 text-[10px] space-y-1 text-slate-300">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Ingredients:</span>
                              <span className="font-bold text-white">
                                {(plan.limits?.maxIngredients ?? plan.maxIngredients ?? 500) > 1000 ? 'Unlimited' : `Up to ${plan.limits?.maxIngredients ?? plan.maxIngredients ?? 500}`}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Staff Seats:</span>
                              <span className="font-bold text-white">
                                {(plan.limits?.maxStaff ?? plan.includedStaff ?? 5) > 1000 ? 'Unlimited' : `Up to ${plan.limits?.maxStaff ?? plan.includedStaff ?? 5} users`}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Branches:</span>
                              <span className="font-bold text-white">
                                {(plan.limits?.branches ?? plan.includedOutlets ?? 1) > 50 ? 'Unlimited' : `${plan.limits?.branches ?? plan.includedOutlets ?? 1} outlet`}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2 text-[11px] text-slate-300">
                            {plan.features?.slice(0, 6).map((feat, idx) => (
                              <div key={idx} className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span className="leading-snug">{feat}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-5 pt-3 border-t border-slate-800">
                          <span
                            className={`block text-center py-2 rounded-xl text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-emerald-600 text-white shadow-md'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                            }`}
                          >
                            {isSelected ? '✓ Selected Plan' : `Select ${plan.name}`}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                {/* 4. Build Your Own Plan (Interactive Custom Option) */}
                {(() => {
                  const isSelected = isCustomPlanSelected;
                  return (
                    <div
                      key="plan-custom"
                      onClick={() => setFormData({ ...formData, planId: 'plan-custom', isTrial: false })}
                      className={`cursor-pointer rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between relative ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-950/30 ring-2 ring-emerald-500/40 shadow-xl'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-800 text-emerald-400 font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-slate-700 shadow-xs">
                        Modular Architecture
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1 mt-1">
                          <span className="font-bold text-sm text-white">Build Your Own Plan</span>
                          <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-800">
                            Custom Scale
                          </span>
                        </div>

                        <div className="mt-2">
                          <span className="text-xl font-black text-white">Live Calculated</span>
                          <span className="block text-xs text-slate-400 font-normal">starts at ₹599/mo</span>
                        </div>

                        <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                          Tailor branch count, staff seats, and choose only the kitchen modules your operation needs.
                        </p>

                        <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-[11px] text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Select exact branch &amp; staff limits</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Select modular kitchen add-ons</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Automated Rule-Based Approval</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Custom Quotations for &gt;10 outlets</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-800">
                        <span
                          className={`block text-center py-2 rounded-xl text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-md'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                          }`}
                        >
                          {isSelected ? '✓ Selected Builder' : 'Configure Custom Plan'}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* 14-Day Free Commercial Trial Option (Available on Standard Plans) */}
              {!isCustomPlanSelected && (
                <div
                  onClick={() => setFormData({ ...formData, isTrial: !formData.isTrial })}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    formData.isTrial
                      ? 'border-teal-500 bg-teal-950/40 ring-2 ring-teal-500/30'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-900/60 text-teal-400 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-xs sm:text-sm text-white block">
                        Activate 14-Day Free Commercial Trial ({selectedStandardPlan.name} Plan)
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Explore all kitchen modules including SVG QR batch tracking and FEFO queueing without immediate credit card charge.
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isTrial}
                    onChange={() => {}}
                    className="w-4 h-4 text-teal-600 rounded shrink-0 pointer-events-none"
                  />
                </div>
              )}

              <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                <Button type="button" variant="outline" onClick={handlePrevStep} icon={ArrowLeft}>
                  Back to Details
                </Button>
                <Button
                  type="button"
                  variant="brand"
                  iconRight={ArrowRight}
                  onClick={handleNextStep}
                >
                  {isCustomPlanSelected ? 'Proceed to Custom Configuration →' : 'Review Subscription →'}
                </Button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: Configure Custom Plan (Active ONLY if Build Your Own Plan selected) */}
          {/* ========================================================================= */}
          {currentStep === 3 && isCustomPlanSelected && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-emerald-400" />
                  <span>Step 3: Configure Your Custom Subscription Plan</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select your exact operational scale and choose modular kitchen add-ons. Price recalculates in real-time.
                </p>
              </div>

              {/* Step A: Business Size Parameters */}
              <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  <span>Step A: Business Size &amp; Operational Capacity</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Outlets */}
                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 block mb-1">Restaurant Outlets</span>
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setCustomConfig((p) => ({ ...p, outlets: Math.max(1, p.outlets - 1) }))}
                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xl font-black text-white">{customConfig.outlets}</span>
                      <button
                        type="button"
                        onClick={() => setCustomConfig((p) => ({ ...p, outlets: p.outlets + 1 }))}
                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block text-center">
                      +₹499/mo per extra outlet
                    </span>
                  </div>

                  {/* Staff Accounts */}
                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 block mb-1">Staff Accounts</span>
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setCustomConfig((p) => ({ ...p, staffAccounts: Math.max(2, p.staffAccounts - 1) }))}
                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xl font-black text-white">{customConfig.staffAccounts}</span>
                      <button
                        type="button"
                        onClick={() => setCustomConfig((p) => ({ ...p, staffAccounts: p.staffAccounts + 1 }))}
                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block text-center">
                      5 included (+₹99/mo extra)
                    </span>
                  </div>

                  {/* POS Terminals */}
                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 block mb-1">Dedicated Terminals</span>
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setCustomConfig((p) => ({ ...p, terminals: Math.max(1, p.terminals - 1) }))}
                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xl font-black text-white">{customConfig.terminals}</span>
                      <button
                        type="button"
                        onClick={() => setCustomConfig((p) => ({ ...p, terminals: p.terminals + 1 }))}
                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block text-center">
                      1 included (+₹250/mo extra)
                    </span>
                  </div>
                </div>
              </div>

              {/* Step B: Modular Kitchen Add-on Modules */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    <span>Step B: Select Kitchen Modules &amp; Governance Tools</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    {customConfig.selectedModuleIds.length} modules enabled
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {MODULE_CATALOG.map((module) => {
                    const isChecked = customConfig.selectedModuleIds.includes(module.id);
                    const isBase = module.isBaseModule;
                    const price = formData.billingCycle === 'annual'
                      ? Math.round(module.annualPrice / 12)
                      : module.monthlyPrice;

                    return (
                      <div
                        key={module.id}
                        onClick={() => toggleModule(module.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-150 flex items-start gap-3 ${
                          isChecked
                            ? 'bg-slate-950 border-emerald-500/70 shadow-sm'
                            : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 opacity-75'
                        }`}
                      >
                        <div className="mt-0.5">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-500" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-white truncate">
                              {module.name}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-400 shrink-0">
                              +{formatINR(price)}/mo
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                            {module.description}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-[9px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded-md border border-slate-800">
                              {module.category}
                            </span>
                            {isBase && (
                              <span className="text-[9px] text-emerald-400 font-semibold">
                                Core Base Module
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step C: Live Pricing & Automated Approval Routing Feedback */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Live Calculated Price ({formData.billingCycle === 'annual' ? 'Annual Billing' : 'Monthly Billing'})
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-2xl font-black text-white">
                        {formatINR(customPricing.effectiveMonthlyAnnual)}
                      </span>
                      <span className="text-xs text-slate-400">/ month</span>
                    </div>
                  </div>

                  <div className="text-right sm:text-right">
                    <span className="text-xs text-slate-300 font-semibold block">
                      Total Payable Today: {formatINR(customPricing.totalAmount)}
                    </span>
                    {formData.billingCycle === 'annual' && customPricing.annualSavings > 0 && (
                      <span className="text-[11px] text-emerald-400 font-bold block">
                        Annual Savings: {formatINR(customPricing.annualSavings)} (~20%)
                      </span>
                    )}
                  </div>
                </div>

                {/* Rule-Based Approval Path Badge & Explanation */}
                <div
                  className={`p-3 rounded-xl border flex items-start gap-3 ${
                    approvalEval.requiresManualReview
                      ? 'bg-amber-950/40 border-amber-800/80 text-amber-200'
                      : 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                  }`}
                >
                  {approvalEval.requiresManualReview ? (
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {approvalEval.pathName}
                      </span>
                      <span
                        className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                          approvalEval.requiresManualReview
                            ? 'bg-amber-900 text-amber-200 border border-amber-700'
                            : 'bg-emerald-900 text-emerald-200 border border-emerald-700'
                        }`}
                      >
                        {approvalEval.requiresManualReview ? 'Super Admin Review' : 'Auto-Approved'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1">
                      {approvalEval.requiresManualReview
                        ? 'This configuration exceeds standard automated limits (e.g. >10 outlets or custom dev). Submitting will route to the Super Admin queue for a formal custom quotation.'
                        : 'Your customized branch capacity and kitchen modules satisfy all system business rules. Eligible for immediate checkout and instant workspace activation.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Step D: Optional Custom Requirements / SLA Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Custom Software / Integration Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={customConfig.customNotes}
                  onChange={(e) => setCustomConfig({ ...customConfig, customNotes: e.target.value })}
                  placeholder="e.g. Need legacy Oracle Micros POS data pipeline or dedicated VPC data residency..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-between">
                <Button type="button" variant="outline" onClick={handlePrevStep} icon={ArrowLeft}>
                  Back to Plan Selection
                </Button>
                <Button type="button" variant="brand" iconRight={ArrowRight} onClick={handleNextStep}>
                  Review Custom Subscription →
                </Button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: Review Subscription & Itemized Breakdown */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-emerald-400" />
                  <span>Step 4: Review Your Subscription Order</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verify your restaurant configuration, itemized costs, and statutory taxes before authorization.
                </p>
              </div>

              {/* Subscription Order Card */}
              <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs text-slate-400">Selected SaaS Architecture:</span>
                    <h4 className="text-base font-black text-white">{currentPlanSummary.name}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 px-3 py-1 rounded-full">
                      {formData.billingCycle === 'annual' ? 'Annual Billing (~20% Saved)' : 'Monthly Billing'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(isCustomPlanSelected ? 3 : 2)}
                      className="text-xs text-slate-400 hover:text-emerald-400 underline font-medium"
                    >
                      Edit Plan
                    </button>
                  </div>
                </div>

                {/* Restaurant & Account Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400">Restaurant:</span>
                    <p className="font-bold text-white">{formData.name}</p>
                    <p className="text-slate-400 text-[11px]">{formData.cuisine} • {formData.phone}</p>
                  </div>
                  <div className="space-y-1 sm:text-right">
                    <span className="text-slate-400">Primary Administrator:</span>
                    <p className="font-bold text-white">{formData.ownerName}</p>
                    <p className="text-slate-400 text-[11px]">{formData.ownerEmail}</p>
                  </div>
                </div>

                {/* Provisioned Capacity Specs */}
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Outlets</span>
                    <span className="font-black text-white text-base">{currentPlanSummary.outlets}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Staff Accounts</span>
                    <span className="font-black text-white text-base">{currentPlanSummary.staff}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">POS Stations</span>
                    <span className="font-black text-white text-base">{currentPlanSummary.terminals}</span>
                  </div>
                </div>

                {/* Active Kitchen Modules List */}
                <div>
                  <span className="text-xs font-bold text-slate-300 block mb-2">
                    Active Kitchen Modules Included ({currentPlanSummary.activeModules.length}):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-300">
                    {currentPlanSummary.activeModules.map((modId) => {
                      const mod = MODULE_CATALOG.find((m) => m.id === modId);
                      return (
                        <div key={modId} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/60 border border-slate-850">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">{mod ? mod.name : modId}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Financial Itemized Breakdown */}
                <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Base Subscription &amp; Included Modules:</span>
                    <span className="font-mono">{formatINR(currentPlanSummary.baseSubtotal)}</span>
                  </div>

                  {currentPlanSummary.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Volume &amp; Promotional Discount:</span>
                      <span className="font-mono">-{formatINR(currentPlanSummary.discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-300">
                    <span>Net Pre-Tax Subtotal:</span>
                    <span className="font-mono">{formatINR(currentPlanSummary.netPreTax)}</span>
                  </div>

                  <div className="flex justify-between text-slate-300">
                    <span>Statutory GST (18%):</span>
                    <span className="font-mono">{formatINR(currentPlanSummary.gstAmount)}</span>
                  </div>

                  <div className="flex justify-between items-baseline pt-2 border-t border-slate-800">
                    <div>
                      <span className="text-sm font-bold text-white block">Total Amount Due Today:</span>
                      <span className="text-[11px] text-slate-400">
                        {formData.billingCycle === 'annual'
                          ? `Full annual payment (${formatINR(currentPlanSummary.effectiveMonthlyRate)}/mo effective)`
                          : 'Billed on a monthly recurring basis'}
                      </span>
                    </div>
                    <span className="text-xl font-black text-emerald-400 font-mono">
                      {formData.isTrial ? '₹0 (14-Day Free Trial)' : formatINR(currentPlanSummary.totalPayable)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-between">
                <Button type="button" variant="outline" onClick={handlePrevStep} icon={ArrowLeft}>
                  {isCustomPlanSelected ? 'Back to Custom Configuration' : 'Back to Plan Selection'}
                </Button>
                <Button type="button" variant="brand" iconRight={ArrowRight} onClick={handleNextStep}>
                  Proceed to Checkout &amp; Verification →
                </Button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 5: Checkout & Payment Verification (or Super Admin Quote Submission) */}
          {/* ========================================================================= */}
          {currentStep === 5 && (
            <form onSubmit={handleFinalActivation} className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  <span>
                    {currentPlanSummary.requiresManualReview
                      ? 'Step 5: Submit Custom Plan for Super Admin Quotation'
                      : 'Step 5: Payment Verification & Workspace Activation'}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {currentPlanSummary.requiresManualReview
                    ? 'Your configuration exceeds automated limits and requires Super Admin review. A formal quotation reference will be issued.'
                    : formData.isTrial
                    ? 'Authorize commercial trial agreement to activate your restaurant workspace immediately.'
                    : 'StockMate verifies payment reference status before automated tenant workspace activation.'}
                </p>
              </div>

              {/* Order Quick Summary */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-white text-sm block">{formData.name}</span>
                  <span className="text-slate-400">{currentPlanSummary.name} • {currentPlanSummary.outlets} Outlets</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Total Due Today</span>
                  <span className="text-base font-black text-emerald-400 font-mono">
                    {formData.isTrial ? '₹0 (Free Trial)' : formatINR(currentPlanSummary.totalPayable)}
                  </span>
                </div>
              </div>

              {/* Path C: Manual Review Queue Routing Notice */}
              {currentPlanSummary.requiresManualReview ? (
                <div className="p-4 bg-amber-950/40 rounded-2xl border border-amber-800/80 space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                        Super Admin Exception Review Required
                      </h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        This custom plan requires specialized engineering review due to{' '}
                        <strong>
                          {customConfig.outlets > 10
                            ? `large outlet volume (${customConfig.outlets} branches)`
                            : 'custom integrations / software requests'}
                        </strong>
                        . Your request will be directly queued in our Super Admin manual review console.
                      </p>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-xl text-xs space-y-1 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Review Queue SLA:</span>
                      <span className="font-semibold text-emerald-400">Within 2 Business Hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Quotation Delivery:</span>
                      <span className="font-semibold text-white">{formData.ownerEmail}</span>
                    </div>
                  </div>
                </div>
              ) : formData.isTrial ? (
                /* Authorized 14-Day Free Commercial Trial Agreement */
                <div className="p-4 bg-teal-950/40 rounded-2xl border border-teal-800/80 space-y-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="trialAgree"
                      checked={formData.authorizedTrialAgreement}
                      onChange={(e) => setFormData({ ...formData, authorizedTrialAgreement: e.target.checked })}
                      className="mt-1 w-4 h-4 text-emerald-600 rounded shrink-0 cursor-pointer"
                    />
                    <label htmlFor="trialAgree" className="text-xs text-teal-200 cursor-pointer leading-relaxed">
                      <strong>Authorized Commercial Trial Agreement:</strong> I authorize the activation of a 14-day full-featured commercial trial for "{formData.name}". I understand that multi-branch inventory, SVG QR batch tracking, and FEFO expiry features will be enabled immediately without credit card charge.
                    </label>
                  </div>
                  {stepErrors.authorizedTrialAgreement && (
                    <p className="text-[11px] text-rose-400 pl-7">{stepErrors.authorizedTrialAgreement}</p>
                  )}
                </div>
              ) : (
                /* Paid Subscription: Payment Method & Mandatory UTR Verification */
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Payment Channel *
                    </label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-emerald-500"
                    >
                      <option value="Corporate Credit Card (Visa/Mastercard)">Corporate Credit Card (Visa / Mastercard)</option>
                      <option value="HDFC / ICICI Business NetBanking">HDFC / ICICI Business NetBanking</option>
                      <option value="Razorpay UPI Instant Transfer">Razorpay UPI Instant Transfer</option>
                      <option value="Corporate Cheque / Bank NEFT Transfer">Corporate Cheque / Bank NEFT Transfer</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-slate-300">
                        Payment Transaction Reference / UTR Number *
                      </label>
                      <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                        Verification Required
                      </span>
                    </div>
                    <input
                      type="text"
                      value={formData.transactionRef}
                      onChange={(e) => setFormData({ ...formData, transactionRef: e.target.value })}
                      placeholder="e.g. TXN-998811 or UTR-HDFC-00129"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                    />
                    {stepErrors.transactionRef && (
                      <p className="text-[11px] text-rose-400 mt-1">{stepErrors.transactionRef}</p>
                    )}
                    <p className="text-[11px] text-slate-500 mt-1">
                      Authoritative pricing engine verifies submitted transaction references before database workspace provisioning.
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                <Button type="button" variant="outline" onClick={handlePrevStep} disabled={isSubmitting} icon={ArrowLeft}>
                  Back to Review
                </Button>
                <Button
                  type="submit"
                  variant="brand"
                  disabled={isSubmitting}
                  icon={currentPlanSummary.requiresManualReview ? Send : ShieldCheck}
                >
                  {isSubmitting
                    ? 'Verifying & Provisioning Workspace...'
                    : currentPlanSummary.requiresManualReview
                    ? 'Submit Request for Quotation →'
                    : 'Verify Payment & Activate Workspace'}
                </Button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* STEP 6: Workspace Activated OR Custom Quote Reference Received */}
          {/* ========================================================================= */}
          {currentStep === 6 && (
            <div className="text-center py-6 space-y-5 animate-fade-in">
              {customQuoteResult ? (
                /* Custom Quote Submitted (Path C) Confirmation */
                <div className="space-y-4 max-w-lg mx-auto">
                  <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
                    <Send className="w-8 h-8" />
                  </div>

                  <div>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800 mb-2">
                      Review Status: Queued in Super Admin Console
                    </span>
                    <h2 className="text-2xl font-black text-white">
                      Custom Plan Request Submitted!
                    </h2>
                    <p className="text-xs text-slate-300 mt-1">
                      Your custom multi-outlet plan request has been assigned to our enterprise team.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-left text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tracking Reference ID:</span>
                      <span className="font-mono font-bold text-amber-400">{customQuoteResult.request.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Restaurant:</span>
                      <span className="font-bold text-white">{formData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Configured Outlets:</span>
                      <span className="font-semibold text-white">{customConfig.outlets} Branches</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Estimated Total:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {formatINR(customQuoteResult.request.systemCalculatedAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-800">
                      <span className="text-slate-400">Notification Contact:</span>
                      <span className="text-slate-300">{formData.ownerEmail}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      variant="brand"
                      iconRight={ArrowRight}
                      onClick={() => navigate('/admin/custom-plan-requests')}
                    >
                      View in Super Admin Queue (Demo) →
                    </Button>
                  </div>
                </div>
              ) : activationResult ? (
                /* Successful Paid / Trial Workspace Activation */
                <div className="space-y-4 max-w-lg mx-auto">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 mb-2">
                      Workspace Status: Active &amp; Verified
                    </span>
                    <h2 className="text-2xl font-black text-white">
                      Welcome to StockMate, {formData.ownerName}!
                    </h2>
                    <p className="text-xs text-slate-300 mt-1">
                      Your restaurant workspace for <strong>"{activationResult.restaurant.name}"</strong> has been provisioned and authorized.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-left text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Restaurant:</span>
                      <span className="font-bold text-white">{activationResult.restaurant.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Authenticated Role:</span>
                      <span className="font-bold text-emerald-400">Restaurant Owner</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Active Plan:</span>
                      <span className="font-bold text-white">
                        {formData.isTrial ? `${currentPlanSummary.name} (14-Day Free Trial)` : currentPlanSummary.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Billing Cycle:</span>
                      <span className="text-slate-300 capitalize">{formData.billingCycle}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-800">
                      <span className="text-slate-400">Verification Reference:</span>
                      <span className="font-mono text-emerald-400">
                        {activationResult.restaurant.subscriptionInfo?.transactionRef}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      variant="brand"
                      className="px-6 py-2.5 text-xs font-bold"
                      iconRight={ArrowRight}
                      onClick={() => navigate('/dashboard')}
                    >
                      Enter Restaurant Owner Dashboard →
                    </Button>
                    <p className="text-[11px] text-slate-500 mt-2">
                      Primary branch and inventory modules are active. You can now manage ingredients and add branches.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
