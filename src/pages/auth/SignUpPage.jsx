import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { formatINR } from '../../data/inventoryBillingData';

export const SignUpPage = () => {
  const { registerAndActivateRestaurant, plans } = useApp();
  const navigate = useNavigate();

  // Multi-step Registration Workflow:
  // 1: Restaurant Info -> 2: Account Creation -> 3: Subscription Selection -> 4: Payment / Trial Authorization -> 5: Activated
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
    planId: 'plan-pro',
    billingCycle: 'monthly',
    isTrial: false,
    paymentMethod: 'Corporate Credit Card (Visa/Mastercard)',
    transactionRef: `TXN-${Date.now().toString().slice(-6)}`,
    authorizedTrialAgreement: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [stepErrors, setStepErrors] = useState({});
  const [activationResult, setActivationResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available SaaS Plans with INR Pricing
  const SAAS_PLANS = [
    {
      id: 'plan-starter',
      name: 'Starter',
      priceMonthly: 999,
      priceAnnual: 9990,
      description: 'Ideal for single cafes & emerging restaurant outlets.',
      features: ['Up to 2 Branches', '500 Ingredient Items', 'Standard Expiry Alerts', 'Basic Purchase Orders'],
      popular: false,
    },
    {
      id: 'plan-pro',
      name: 'Professional',
      priceMonthly: 2499,
      priceAnnual: 24990,
      description: 'Full kitchen control with QR tracking, FEFO rotation & multi-branch.',
      features: ['Up to 5 Branches', 'Unlimited Ingredients', 'Pure SVG QR & Batch Matrix', 'FEFO Kitchen Rotation', 'Supplier Invoicing & Claims'],
      popular: true,
    },
    {
      id: 'plan-ent',
      name: 'Enterprise',
      priceMonthly: 4999,
      priceAnnual: 49990,
      description: 'For restaurant chains, hotel kitchens & franchise networks.',
      features: ['Unlimited Branches', 'Multi-Branch Staff Transfers', 'Custom Supplier SLA Agreements', 'Dedicated Account Governance', 'Audit Trail Export'],
      popular: false,
    },
  ];

  const selectedPlanObj = SAAS_PLANS.find((p) => p.id === formData.planId) || SAAS_PLANS[1];

  // Validation per step
  const validateStep = (stepNumber) => {
    const errors = {};

    if (stepNumber === 1) {
      if (!formData.name.trim()) errors.name = 'Restaurant name is required';
      if (!formData.cuisine.trim()) errors.cuisine = 'Cuisine / concept is required';
      if (!formData.address.trim()) errors.address = 'Primary location address is required';
      if (!formData.phone.trim()) errors.phone = 'Contact phone number is required';
    }

    if (stepNumber === 2) {
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

    if (stepNumber === 4) {
      if (!formData.isTrial) {
        if (!formData.transactionRef.trim()) {
          errors.transactionRef = 'Payment Transaction Reference ID is required for verification';
        }
      } else {
        if (!formData.authorizedTrialAgreement) {
          errors.authorizedTrialAgreement = 'You must authorize the commercial trial agreement';
        }
      }
    }

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      setStepErrors({});
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setStepErrors({});
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  // Step 4 Completion: Activate Restaurant Owner Account
  const handleFinalActivation = (e) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const result = registerAndActivateRestaurant(formData);
      setActivationResult(result);
      setIsSubmitting(false);
      setCurrentStep(5);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative selection:bg-emerald-500 selection:text-white">
      {/* Background glow decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-600/15 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-3xl w-full mx-auto">
        {/* Top Navigation */}
        <div className="mb-4 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
          <div className="text-xs text-slate-400">
            <span>Already have an account? </span>
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
          <h1 className="text-2xl font-black text-white tracking-tight">Register Your Restaurant</h1>
          <p className="text-slate-400 text-xs mt-1">
            Set up your multi-branch pantry workspace and activate your subscription
          </p>
        </div>

        {/* Progress Stepper Bar */}
        {currentStep < 5 && (
          <div className="mb-6 bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-md">
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              {[
                { num: 1, label: 'Restaurant' },
                { num: 2, label: 'Account' },
                { num: 3, label: 'Subscription' },
                { num: 4, label: 'Activation' },
              ].map((s) => (
                <div
                  key={s.num}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl transition-all ${
                    currentStep === s.num
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : currentStep > s.num
                      ? 'text-emerald-400 bg-emerald-950/50 font-semibold'
                      : 'text-slate-500'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      currentStep > s.num
                        ? 'bg-emerald-500 text-slate-950'
                        : currentStep === s.num
                        ? 'bg-white text-emerald-900'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {currentStep > s.num ? <Check className="w-3 h-3" /> : s.num}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Card Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8">
          {/* STEP 1: Restaurant Registration */}
          {currentStep === 1 && (
            <form onSubmit={handleNextStep} className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white">Step 1: Restaurant Details</h3>
                <p className="text-xs text-slate-400">
                  Enter your business details. You can manage multiple branches from this workspace.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Restaurant Brand Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Spice Garden Bistro"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                    required
                  />
                  {stepErrors.name && <p className="text-[11px] text-rose-400 mt-1">{stepErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Cuisine / Dining Concept *
                  </label>
                  <input
                    type="text"
                    value={formData.cuisine}
                    onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                    placeholder="e.g. Modern Indian & Tandoor"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                    required
                  />
                  {stepErrors.cuisine && <p className="text-[11px] text-rose-400 mt-1">{stepErrors.cuisine}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Primary Location / Flagship Address *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. Plot 45, FC Road, Shivaji Nagar, Pune"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                  required
                />
                {stepErrors.address && <p className="text-[11px] text-rose-400 mt-1">{stepErrors.address}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Contact Phone Number *
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98200 00000"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                    required
                  />
                  {stepErrors.phone && <p className="text-[11px] text-rose-400 mt-1">{stepErrors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Initial Branch Count (Can expand later)
                  </label>
                  <select
                    value={formData.branches}
                    onChange={(e) => setFormData({ ...formData, branches: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value={1}>1 Primary Branch</option>
                    <option value={2}>2 Multi-Branch Locations</option>
                    <option value={3}>3 Locations</option>
                    <option value={5}>5 Locations (Regional Chain)</option>
                    <option value={10}>10+ Locations (Enterprise)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <Button type="submit" variant="brand" iconRight={ArrowRight}>
                  Continue to Owner Account
                </Button>
              </div>
            </form>
          )}

          {/* STEP 2: Owner Account Creation */}
          {currentStep === 2 && (
            <form onSubmit={handleNextStep} className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white">Step 2: Restaurant Owner Account</h3>
                <p className="text-xs text-slate-400">
                  Create administrative credentials for the primary account owner.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Owner Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    placeholder="e.g. Vikramaditya Singhania"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                    required
                  />
                  {stepErrors.ownerName && <p className="text-[11px] text-rose-400 mt-1">{stepErrors.ownerName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Work Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.ownerEmail}
                    onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                    placeholder="owner@restaurant.com"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                    required
                  />
                  {stepErrors.ownerEmail && <p className="text-[11px] text-rose-400 mt-1">{stepErrors.ownerEmail}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Minimum 6 characters"
                      className="w-full pr-10 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {stepErrors.password && <p className="text-[11px] text-rose-400 mt-1">{stepErrors.password}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Re-enter password"
                      className="w-full pr-10 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {stepErrors.confirmPassword && (
                    <p className="text-[11px] text-rose-400 mt-1">{stepErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-between">
                <Button type="button" variant="outline" onClick={handlePrevStep}>
                  Back
                </Button>
                <Button type="submit" variant="brand" iconRight={ArrowRight}>
                  Select Subscription Plan
                </Button>
              </div>
            </form>
          )}

          {/* STEP 3: Subscription Plan Selection */}
          {currentStep === 3 && (
            <form onSubmit={handleNextStep} className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-white">Step 3: Select Subscription Plan</h3>
                  <p className="text-xs text-slate-400">
                    Choose the plan that suits your operational scale. Can be upgraded anytime.
                  </p>
                </div>

                {/* Billing Cycle Toggle */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, billingCycle: 'monthly' })}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                      formData.billingCycle === 'monthly'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, billingCycle: 'annual' })}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                      formData.billingCycle === 'annual'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Annual (Save 17%)
                  </button>
                </div>
              </div>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                {SAAS_PLANS.map((plan) => {
                  const isSelected = formData.planId === plan.id && !formData.isTrial;
                  const price = formData.billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;
                  const period = formData.billingCycle === 'annual' ? '/year' : '/month';

                  return (
                    <div
                      key={plan.id}
                      onClick={() => setFormData({ ...formData, planId: plan.id, isTrial: false })}
                      className={`cursor-pointer rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-950/40 ring-2 ring-emerald-500/30'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-sm text-white">{plan.name}</span>
                          {plan.popular && (
                            <span className="text-[10px] font-bold text-emerald-300 bg-emerald-900/80 px-2 py-0.5 rounded-full border border-emerald-700">
                              Popular
                            </span>
                          )}
                        </div>
                        <div className="text-xl font-extrabold text-white mt-1">
                          {formatINR(price)}
                          <span className="text-xs text-slate-400 font-normal">{period}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{plan.description}</p>

                        <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5 text-[11px] text-slate-300">
                          {plan.features.map((feat, idx) => (
                            <div key={idx} className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800">
                        <span
                          className={`block text-center py-1.5 rounded-xl text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {isSelected ? '✓ Selected Plan' : 'Select Plan'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 14-Day Free Commercial Trial Option */}
              <div
                onClick={() => setFormData({ ...formData, isTrial: !formData.isTrial })}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                  formData.isTrial
                    ? 'border-teal-500 bg-teal-950/40 ring-2 ring-teal-500/20'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-900/60 text-teal-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-white block">
                      Activate 14-Day Free Commercial Trial (Professional Plan)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Explore all features including QR batch matrix and FEFO tracking without immediate charge.
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isTrial}
                  onChange={() => {}}
                  className="w-4 h-4 text-teal-600 rounded"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-between">
                <Button type="button" variant="outline" onClick={handlePrevStep}>
                  Back
                </Button>
                <Button type="submit" variant="brand" iconRight={ArrowRight}>
                  Proceed to Payment &amp; Activation
                </Button>
              </div>
            </form>
          )}

          {/* STEP 4: Payment & Account Activation */}
          {currentStep === 4 && (
            <form onSubmit={handleFinalActivation} className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white">Step 4: Payment Verification &amp; Activation</h3>
                <p className="text-xs text-slate-400">
                  {formData.isTrial
                    ? 'Verify authorized trial terms to activate your restaurant workspace.'
                    : 'Subscription activation requires verified payment status or an authorized trial.'}
                </p>
              </div>

              {/* Order Summary Box */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-2">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <div>
                    <span className="font-bold text-white text-sm">{formData.name}</span>
                    <span className="block text-slate-400 text-[11px]">{formData.cuisine}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {formData.isTrial ? '14-Day Free Trial' : `${selectedPlanObj.name} Plan`}
                  </span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Owner Account:</span>
                  <span className="text-white font-medium">{formData.ownerName} ({formData.ownerEmail})</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Billing Cycle:</span>
                  <span className="text-white font-medium capitalize">{formData.billingCycle}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800 font-bold text-sm">
                  <span className="text-white">Amount Due Today:</span>
                  <span className="text-emerald-400">
                    {formData.isTrial
                      ? '₹0 (14-Day Free Trial)'
                      : formatINR(formData.billingCycle === 'annual' ? selectedPlanObj.priceAnnual : selectedPlanObj.priceMonthly)}
                  </span>
                </div>
              </div>

              {/* Paid Plan: Payment Method & Mandatory Transaction Verification */}
              {!formData.isTrial ? (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Payment Channel *
                    </label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-emerald-500"
                    >
                      <option value="Corporate Credit Card (Visa/Mastercard)">Corporate Credit Card (Visa / Mastercard)</option>
                      <option value="HDFC / ICICI Business NetBanking">HDFC / ICICI Business NetBanking</option>
                      <option value="Razorpay UPI Instant Transfer">Razorpay UPI Instant Transfer</option>
                      <option value="Corporate Cheque / Bank Transfer">Corporate Cheque / Bank Transfer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                      <span>Payment Transaction Reference / UTR Number *</span>
                      <span className="text-[10px] text-amber-400 font-bold uppercase">Payment Verification</span>
                    </label>
                    <input
                      type="text"
                      value={formData.transactionRef}
                      onChange={(e) => setFormData({ ...formData, transactionRef: e.target.value })}
                      placeholder="e.g. TXN-998811 or UTR-HDFC-00129"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                      required
                    />
                    {stepErrors.transactionRef && (
                      <p className="text-[11px] text-rose-400 mt-1">{stepErrors.transactionRef}</p>
                    )}
                    <p className="text-[11px] text-slate-500 mt-1">
                      Per multi-tenant SaaS security requirements, subscriptions are activated exclusively upon verified transaction confirmation.
                    </p>
                  </div>
                </div>
              ) : (
                /* Trial Agreement Authorization */
                <div className="p-3.5 bg-teal-950/40 rounded-2xl border border-teal-800/80 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      id="trialAgreement"
                      checked={formData.authorizedTrialAgreement}
                      onChange={(e) => setFormData({ ...formData, authorizedTrialAgreement: e.target.checked })}
                      className="mt-1 w-4 h-4 text-emerald-600 rounded"
                    />
                    <label htmlFor="trialAgreement" className="text-xs text-teal-200 cursor-pointer">
                      <strong>Explicit Authorized Trial Agreement:</strong> I authorize the activation of a 14-day commercial trial for "{formData.name}". I understand that multi-branch and QR inventory features will remain active throughout the trial period.
                    </label>
                  </div>
                  {stepErrors.authorizedTrialAgreement && (
                    <p className="text-[11px] text-rose-400 pl-6">{stepErrors.authorizedTrialAgreement}</p>
                  )}
                </div>
              )}

              <div className="pt-4 border-t border-slate-800 flex justify-between">
                <Button type="button" variant="outline" onClick={handlePrevStep} disabled={isSubmitting}>
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="brand"
                  disabled={isSubmitting}
                  icon={ShieldCheck}
                >
                  {isSubmitting ? 'Verifying & Provisioning Workspace...' : 'Activate Subscription & Launch Workspace'}
                </Button>
              </div>
            </form>
          )}

          {/* STEP 5: Account Activated & Success Confirmation */}
          {currentStep === 5 && activationResult && (
            <div className="text-center py-4 space-y-4">
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
                <p className="text-xs text-slate-300 max-w-md mx-auto mt-1">
                  Your restaurant workspace for <strong>"{activationResult.restaurant.name}"</strong> has been provisioned. Primary branch and inventory modules are fully operational.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-left max-w-md mx-auto text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Restaurant:</span>
                  <span className="font-bold text-white">{activationResult.restaurant.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Authenticated Role:</span>
                  <span className="font-bold text-emerald-400">Restaurant Owner</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Primary Branch:</span>
                  <span className="font-semibold text-slate-300">{activationResult.branch.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Subscription Status:</span>
                  <span className="font-bold text-emerald-400">
                    {formData.isTrial ? 'Authorized 14-Day Trial' : `${selectedPlanObj.name} (Active)`}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Verification Ref:</span>
                  <span className="font-mono text-slate-300">
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
                  You can now manage inventory, track supplier deliveries, and add additional branches.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
