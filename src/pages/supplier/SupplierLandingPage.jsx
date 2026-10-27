import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Truck,
  Boxes,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Building2,
  Lock,
  Mail,
  Phone,
  Store,
  MapPin,
  Clock,
  ChevronRight,
  Star,
  Users,
  ShoppingBag,
  Award,
  Zap,
  HelpCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { SUPPLIER_SUBSCRIPTION_PLANS, SUPPLIER_CATEGORIES } from '../../data/supplierMarketplaceData';

export const SupplierLandingPage = () => {
  const navigate = useNavigate();
  const { registerSupplierAccount, login, currentUser, logout, addToast } = useApp();

  // Active Tab: 'register' | 'login'
  const [activeAuthTab, setActiveAuthTab] = useState('register');

  // Billing Cycle: 'monthly' | 'yearly'
  const [billingCycle, setBillingCycle] = useState('monthly');

  // Selected Plan: defaults to 'plan-sup-pro' (Most Popular)
  const [selectedPlanId, setSelectedPlanId] = useState('plan-sup-pro');

  // Registration Form State
  const [regForm, setRegForm] = useState({
    name: '',
    contactPerson: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    city: 'Pune',
    gstin: '',
    leadTimeDays: '1',
    categories: ['Dairy & Cheese', 'Fresh Vegetables & Greens'],
  });

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedPlan =
    SUPPLIER_SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlanId) ||
    SUPPLIER_SUBSCRIPTION_PLANS[1];

  const handleToggleCategory = (cat) => {
    if (cat === 'All Categories') return;
    setRegForm((prev) => {
      const exists = prev.categories.includes(cat);
      if (exists) {
        if (prev.categories.length === 1) return prev; // keep at least 1
        return { ...prev, categories: prev.categories.filter((c) => c !== cat) };
      } else {
        return { ...prev, categories: [...prev.categories, cat] };
      }
    });
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setAuthError(null);

    if (!regForm.name.trim() || !regForm.contactPerson.trim() || !regForm.email.trim()) {
      setAuthError('Please fill in all mandatory business contact fields.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      try {
        const result = registerSupplierAccount({
          ...regForm,
          planId: selectedPlanId,
          billingCycle,
        });

        setIsSubmitting(false);

        if (result.success) {
          navigate('/supplier', { replace: true });
        }
      } catch (err) {
        setIsSubmitting(false);
        setAuthError(err.message || 'Registration failed. Please try again.');
      }
    }, 600);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setAuthError(null);

    if (!loginEmail.trim() || !loginPassword) {
      setAuthError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const result = login(loginEmail, loginPassword, 'supplier');
      setIsSubmitting(false);

      if (!result.success) {
        setAuthError(result.error || 'Authentication failed. Please verify credentials.');
      } else {
        addToast(`Signed in as ${result.user.name}. Welcome back!`, 'success');
        navigate('/supplier', { replace: true });
      }
    }, 400);
  };

  const handleDemoSupplierLogin = (email, name) => {
    setIsSubmitting(true);
    setLoginEmail(email);
    setLoginPassword('password123');

    setTimeout(() => {
      const result = login(email, 'password123', 'supplier');
      setIsSubmitting(false);
      if (result.success) {
        addToast(`Logged in as verified vendor: ${name}`, 'success');
        navigate('/supplier', { replace: true });
      } else {
        setAuthError('Could not log into demo account.');
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Background radial glow decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -left-40 w-[600px] h-[600px] bg-teal-600/10 rounded-full blur-[160px]" />
        <div className="absolute -bottom-40 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px]" />
      </div>

      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-4 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Boxes className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                  StockMate <span className="text-emerald-400 font-semibold text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">B2B Vendor Portal</span>
                </span>
                <span className="text-[10px] text-slate-400 block -mt-0.5">Wholesale Supplier Network</span>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#benefits" className="hover:text-emerald-400 transition-colors">Vendor Benefits</a>
            <a href="#plans" className="hover:text-emerald-400 transition-colors">Subscription Plans</a>
            <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">PO Workflow</a>
            <a href="#faq" className="hover:text-emerald-400 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setActiveAuthTab('login');
                document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-xl transition-colors"
            >
              Supplier Sign In
            </button>
            <button
              onClick={() => {
                setActiveAuthTab('register');
                document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
            >
              Join as Supplier →
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6 animate-pulse">
            <Sparkles className="w-4 h-4" />
            <span>India's Premier Restaurant Procurement & B2B Wholesale Marketplace</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight sm:leading-tight">
            Sell Fresh Ingredients &amp; Supplies <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
              Directly to 500+ Busy Restaurants
            </span>
          </h1>

          <p className="mt-5 text-sm sm:text-base text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Eliminate traditional wholesale middlemen. List your farm produce, dairy, poultry, meats, spices, and bakery items on StockMate. Receive digital Purchase Orders, manage deliveries with digital challans, and enjoy guaranteed <strong className="text-white">48-hour settlements</strong>.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                setActiveAuthTab('register');
                document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 group transition-all"
            >
              <span>Onboard Your Business (Free Trial)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href="#plans"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-sm transition-all"
            >
              Compare Vendor Plans
            </a>
          </div>

          {/* Live Metrics Grid */}
          <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xs">
              <span className="text-2xl sm:text-3xl font-black text-white block">₹4.8 Cr+</span>
              <span className="text-xs text-slate-400 mt-0.5 block">Monthly Procurement Volume</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xs">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 block">500+</span>
              <span className="text-xs text-slate-400 mt-0.5 block">Multi-Branch Outlets</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xs">
              <span className="text-2xl sm:text-3xl font-black text-white block">48 Hours</span>
              <span className="text-xs text-slate-400 mt-0.5 block">Guaranteed Settlement</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xs">
              <span className="text-2xl sm:text-3xl font-black text-teal-400 block">0%</span>
              <span className="text-xs text-slate-400 mt-0.5 block">Upfront Listing Fee</span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-16 sm:py-24 bg-slate-900/50 border-y border-slate-800/80 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Why Partner With StockMate</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
              Transform Your Food Supply Business with Digital Procurement
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Everything you need to scale from local farm distributor to national restaurant supplier.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Guaranteed Restaurant Demand</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Connect directly with head chefs, kitchen managers, and restaurant owners actively reordering ingredients daily for 500+ commercial kitchens.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <span>Zero sales prospecting required</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Fast 48-Hour Bank Settlements</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Never chase late restaurant invoices again. Payments are processed through automated smart escrow and deposited into your registered bank account upon delivery acceptance.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-teal-400">
                <span>Direct NEFT / RTGS transfers</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Structured PO &amp; QR Logistics</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Every transaction follows a clean 4-stage PO workflow with digital delivery challans, vehicle dispatch notes, temperature tags, and QR batch tracking.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
                <span>FSSAI compliance ready</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Plans Section */}
      <section id="plans" className="py-16 sm:py-24 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Transparent Vendor Plans</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
              Choose the Subscription That Fits Your Distribution Scale
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Simple monthly or discounted annual pricing with ultra-low order commissions.
            </p>

            {/* Monthly vs Yearly Toggle */}
            <div className="mt-6 inline-flex items-center p-1 rounded-2xl bg-slate-900 border border-slate-800">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  billingCycle === 'yearly'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Yearly Billing</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded-full font-extrabold">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SUPPLIER_SUBSCRIPTION_PLANS.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              const isYearly = billingCycle === 'yearly';
              const price = isYearly ? plan.yearlyPrice : plan.price;

              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`relative p-6 sm:p-7 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-emerald-500 ring-2 ring-emerald-500/50 shadow-2xl shadow-emerald-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md">
                      Most Popular Tier
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{plan.badge}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {plan.commissionRate}% Commission
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-white mt-2">{plan.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 min-h-[36px]">{plan.description}</p>

                    <div className="mt-5 pb-5 border-b border-slate-800">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-white">
                          ₹{price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          /{isYearly ? 'year' : 'month'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-1">
                        Settlement: <strong className="text-slate-300">{plan.payoutDays}</strong> • Listing limit: <strong className="text-slate-300">{plan.maxProducts} SKUs</strong>
                      </span>
                    </div>

                    <ul className="mt-5 space-y-2.5 text-xs text-slate-300">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlanId(plan.id);
                      document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`mt-6 w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    <span>{isSelected ? 'Selected Plan (Proceed Below)' : `Select ${plan.name}`}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works: 4-Stage Purchase Order Flow */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-slate-900/40 border-y border-slate-800 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">End-to-End Procurement</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
              Structured 4-Stage Purchase Order Lifecycle
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Experience transparent, audit-ready ordering with zero disputes or miscommunications.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 relative">
              <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-200 font-mono font-bold text-xs flex items-center justify-center mb-3">
                01
              </div>
              <h4 className="text-sm font-bold text-white">PO Request Placed</h4>
              <p className="text-xs text-slate-400 mt-1.5">
                Restaurant inventory manager or chef browses your catalog in the B2B Marketplace and generates a formal PO.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 relative">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 font-mono font-bold text-xs flex items-center justify-center mb-3">
                02
              </div>
              <h4 className="text-sm font-bold text-white">Manager Sign-off</h4>
              <p className="text-xs text-slate-400 mt-1.5">
                The restaurant's authorized general manager or owner reviews budget limits and approves the requisition.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 relative">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center mb-3">
                03
              </div>
              <h4 className="text-sm font-bold text-white">Supplier Fulfillment</h4>
              <p className="text-xs text-slate-400 mt-1.5">
                You receive instant real-time alerts. Accept the PO, generate the digital delivery challan, and dispatch goods.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 relative">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 font-mono font-bold text-xs flex items-center justify-center mb-3">
                04
              </div>
              <h4 className="text-sm font-bold text-white">Dock Check &amp; Payout</h4>
              <p className="text-xs text-slate-400 mt-1.5">
                Restaurant scans QR batch, verifies quantities, and automatically updates their live stock. Escrow funds unlock into your account!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Authentication & Registration Section */}
      <section id="auth-section" className="py-16 sm:py-24 px-4 sm:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Onboarding Portal</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Start Selling as an Authorized Vendor
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Selected Plan: <strong className="text-emerald-400">{selectedPlan.name}</strong> ({billingCycle === 'yearly' ? 'Annual' : 'Monthly'} Billing)
            </p>
          </div>

          {/* Form Tabs */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="flex p-1 rounded-2xl bg-slate-950 border border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => {
                  setActiveAuthTab('register');
                  setAuthError(null);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeAuthTab === 'register'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Register New Vendor Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveAuthTab('login');
                  setAuthError(null);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeAuthTab === 'login'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Existing Vendor Sign In
              </button>
            </div>

            {/* Error Banner */}
            {authError && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* TAB 1: REGISTRATION FORM */}
            {activeAuthTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {/* Plan reminder badge */}
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-300">
                      Tier: <strong className="text-white">{selectedPlan.name}</strong> (₹{billingCycle === 'yearly' ? selectedPlan.yearlyPrice : selectedPlan.price}/{billingCycle === 'yearly' ? 'yr' : 'mo'})
                    </span>
                  </div>
                  <a href="#plans" className="text-emerald-400 hover:underline text-[11px] font-semibold">Change Plan</a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Company / Business Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kisan Fresh Farms Pvt Ltd"
                      value={regForm.name}
                      onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Contact Person *</label>
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={regForm.contactPerson}
                      onChange={(e) => setRegForm({ ...regForm, contactPerson: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Work Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="orders@kisanfresh.com"
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="Create secure password"
                      value={regForm.password}
                      onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Phone / WhatsApp *</label>
                    <input
                      type="text"
                      required
                      placeholder="+91 98220 XXXXX"
                      value={regForm.phone}
                      onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">GSTIN Number</label>
                    <input
                      type="text"
                      placeholder="27AABCU9603R1ZM"
                      value={regForm.gstin}
                      onChange={(e) => setRegForm({ ...regForm, gstin: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Delivery Lead Time</label>
                    <select
                      value={regForm.leadTimeDays}
                      onChange={(e) => setRegForm({ ...regForm, leadTimeDays: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-emerald-500"
                    >
                      <option value="1">1 Day (Next-day Delivery)</option>
                      <option value="2">2 Days Delivery</option>
                      <option value="0">Same Day Express</option>
                    </select>
                  </div>
                </div>

                {/* Warehouse Location & City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Hub / Warehouse City</label>
                    <input
                      type="text"
                      value={regForm.city}
                      onChange={(e) => setRegForm({ ...regForm, city: e.target.value })}
                      placeholder="e.g. Pune, Mumbai, Bengaluru"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Facility Address</label>
                    <input
                      type="text"
                      value={regForm.address}
                      onChange={(e) => setRegForm({ ...regForm, address: e.target.value })}
                      placeholder="Warehouse address, industrial area"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Product Categories Multi-Select Pills */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    Supply Categories (Click to select)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {SUPPLIER_CATEGORIES.filter((c) => c !== 'All Categories').map((cat) => {
                      const isSelected = regForm.categories.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => handleToggleCategory(cat)}
                          className={`text-xs px-2.5 py-1 rounded-xl font-medium transition-all ${
                            isSelected
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-xs'
                              : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submission CTA */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Onboarding &amp; Activating Plan...</span>
                    </div>
                  ) : (
                    <>
                      <span>Complete Registration &amp; Launch Vendor Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-[11px] text-center text-slate-500 mt-2">
                  Upon registration, automatic notification alerts are instantly sent to Platform Admins, Restaurant Owners &amp; Managers.
                </p>
              </form>
            )}

            {/* TAB 2: LOGIN FORM */}
            {activeAuthTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Registered Supplier Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="david@metrofoods.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer mt-3"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Authenticating...</span>
                    </div>
                  ) : (
                    <>
                      <span>Sign In to Supplier Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Quick Demo Supplier Logins */}
                <div className="mt-6 pt-5 border-t border-slate-800/80">
                  <span className="text-[11px] font-bold text-slate-400 block mb-2 uppercase tracking-wider text-center">
                    Instant Demo Vendor Logins
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleDemoSupplierLogin('david@metrofoods.com', 'Metro Food Distributors')}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-left transition-all"
                    >
                      <span className="text-xs font-bold text-white block">Metro Food Distributors</span>
                      <span className="text-[10px] text-emerald-400 block">Dairy, Poultry &amp; Meat (Pro Vendor)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDemoSupplierLogin('elena@freshfarmorganics.com', 'FreshFarm Organics')}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-left transition-all"
                    >
                      <span className="text-xs font-bold text-white block">FreshFarm Organics</span>
                      <span className="text-[10px] text-teal-400 block">Vegetables &amp; Greens (Enterprise)</span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 sm:py-24 bg-slate-900/40 border-t border-slate-800 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Frequently Asked Questions</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">Vendor Network Common Questions</h2>
          </div>

          <div className="space-y-3.5">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                How quickly do I get paid for delivered restaurant orders?
              </h4>
              <p className="text-xs text-slate-400 mt-2 pl-6 leading-relaxed">
                Settlements depend on your plan: Free Starter settles in 14 days, Pro Vendor accelerates to 48 hours, and Enterprise Distributors receive same-day automated payout upon receiving dock verification.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                Who sees my catalog once I sign up?
              </h4>
              <p className="text-xs text-slate-400 mt-2 pl-6 leading-relaxed">
                As soon as you register, your catalog is published directly to the StockMate B2B Marketplace. All restaurant owners, general managers, and inventory receiving docks within your city can view your items and issue Purchase Orders.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                What notification is sent when I register?
              </h4>
              <p className="text-xs text-slate-400 mt-2 pl-6 leading-relaxed">
                The platform automatically fires real-time alerts to Platform Admins, Restaurant Owners, and General Managers informing them of your brand, delivery lead times, and verified product categories.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800 text-center text-xs text-slate-500">
        <p>© 2026 StockMate SaaS Technologies Inc. • Enterprise Food Supply B2B Network</p>
      </footer>
    </div>
  );
};

