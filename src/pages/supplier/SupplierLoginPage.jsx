import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Truck,
  Boxes,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Store,
  ClipboardList,
  Receipt,
  RotateCcw,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  SUPPLIER_SUBSCRIPTION_PLANS,
  SUPPLIER_CATEGORIES,
} from '../../data/supplierMarketplaceData';

// Supplier Portal Capabilities & Features
const SUPPLIER_PORTAL_FEATURES = [
  {
    id: 'purchase-orders',
    title: 'Purchase Orders',
    description: 'View and manage purchase orders received from restaurants.',
    icon: ClipboardList,
    tag: 'Live POs',
  },
  {
    id: 'order-fulfillment',
    title: 'Order Fulfillment',
    description: 'Accept or reject orders and update fulfillment status.',
    icon: CheckCircle2,
    tag: 'Real-Time',
  },
  {
    id: 'dispatch-delivery',
    title: 'Dispatch & Delivery',
    description: 'Record dispatch details, delivery dates, and delivery challans.',
    icon: Truck,
    tag: 'e-Challans',
  },
  {
    id: 'invoices-payments',
    title: 'Invoices & Payments',
    description: 'View submitted invoices, payment status, and payment history.',
    icon: Receipt,
    tag: 'Automated',
  },
  {
    id: 'product-catalog',
    title: 'Product Catalog',
    description: 'Manage products, categories, prices, units, and availability.',
    icon: Boxes,
    tag: 'Catalog Sync',
  },
  {
    id: 'return-refunds',
    title: 'Return & Refund Claims',
    description: 'Review restaurant claims for damaged or incorrect goods and respond to them.',
    icon: RotateCcw,
    tag: 'Dispute Guard',
  },
];

export const SupplierLoginPage = () => {
  const navigate = useNavigate();
  const { login, registerSupplierAccount, currentUser, logout, addToast } = useApp();

  // Mode: 'login' (default) | 'register'
  const [activeTab, setActiveTab] = useState('login');

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Registration Form State
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlanId, setSelectedPlanId] = useState('plan-sup-pro');
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

  const selectedPlan =
    SUPPLIER_SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlanId) ||
    SUPPLIER_SUBSCRIPTION_PLANS[1];

  const handleToggleCategory = (cat) => {
    if (cat === 'All Categories') return;
    setRegForm((prev) => {
      const exists = prev.categories.includes(cat);
      if (exists) {
        if (prev.categories.length === 1) return prev;
        return { ...prev, categories: prev.categories.filter((c) => c !== cat) };
      } else {
        return { ...prev, categories: [...prev.categories, cat] };
      }
    });
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
      const result = login(loginEmail, loginPassword, 'supplier', null, 'supplier_portal');
      setIsSubmitting(false);

      if (!result.success) {
        setAuthError(result.error || 'Authentication failed. Please verify credentials.');
      } else {
        addToast(`Signed in as ${result.user.name}. Welcome to Supplier Portal!`, 'success');
        navigate('/supplier', { replace: true });
      }
    }, 400);
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
          supplierType: 'Third-Party Supplier',
          registeredVia: 'supplier_portal',
          isFirstTimePortalRegistration: true,
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative selection:bg-emerald-500 selection:text-white">
      {/* Background radial glow decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[550px] h-[550px] bg-emerald-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -left-40 w-[550px] h-[550px] bg-teal-600/10 rounded-full blur-[160px]" />
        <div className="absolute -bottom-40 right-1/4 w-[450px] h-[450px] bg-sky-600/10 rounded-full blur-[150px]" />
      </div>

      {/* Top Header / Navigation */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                StockMate <span className="text-emerald-400 font-semibold text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">Vendor Portal</span>
              </span>
              <span className="text-[10px] text-slate-400 block -mt-0.5">B2B Wholesale Supplier Access</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-800"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to</span> Home
            </Link>
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
            >
              Restaurant Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className={`w-full ${activeTab === 'register' ? 'max-w-2xl' : 'max-w-6xl'} transition-all duration-300`}>

          {/* Active Session Notice if already logged in */}
          {currentUser?.role === 'supplier' && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-200 text-xs shadow-xl backdrop-blur-md">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold text-white block">Active Supplier Session</span>
                    <span className="text-emerald-300 text-[11px]">
                      Currently signed in as {currentUser.name} ({currentUser.supplierName || 'Vendor Partner'})
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="brand"
                    onClick={() => navigate('/supplier')}
                  >
                    Open Dashboard
                  </Button>
                  <button
                    onClick={() => {
                      logout();
                      addToast('Signed out of supplier portal.', 'info');
                    }}
                    className="text-[11px] text-slate-400 hover:text-white underline px-2 py-1"
                  >
                    Switch
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* View 1: Supplier Login & Feature Showcase (Default View) */}
          {activeTab === 'login' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
              {/* Left Column: Supplier Login Card */}
              <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl flex flex-col justify-between">
                <div>
                  {/* Card Header */}
                  <div className="mb-6">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-3">
                      <Store className="w-3.5 h-3.5" />
                      <span>Vendor Portal Gateway</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      Supplier Sign In
                    </h1>
                    <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                      Sign in to access assigned purchase orders, product catalogs, delivery challans &amp; invoices.
                    </p>
                  </div>

                  {/* Error Banner */}
                  {authError && (
                    <div className="mb-5 p-3.5 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-start gap-2.5 shadow-xs animate-in fade-in">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="font-bold block text-white">Authentication Failed</span>
                        <span className="opacity-90 block mt-0.5">{authError}</span>
                      </div>
                    </div>
                  )}

                  {/* Login Form */}
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    {/* Supplier Email */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider font-mono">
                        Registered Supplier Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          disabled={isSubmitting}
                          placeholder="supplier@company.com"
                          value={loginEmail}
                          onChange={(e) => {
                            setLoginEmail(e.target.value);
                            if (authError) setAuthError(null);
                          }}
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                          Password
                        </label>
                        <Link
                          to="/forgot-password"
                          className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          disabled={isSubmitting}
                          placeholder="••••••••••••"
                          value={loginPassword}
                          onChange={(e) => {
                            setLoginPassword(e.target.value);
                            if (authError) setAuthError(null);
                          }}
                          className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      variant="brand"
                      className="w-full justify-center py-2.5 text-xs font-bold mt-2"
                      disabled={isSubmitting}
                      iconRight={isSubmitting ? null : ArrowRight}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Signing in to Vendor Portal...</span>
                        </div>
                      ) : (
                        'Sign In to Supplier Portal'
                      )}
                    </Button>
                  </form>
                </div>

                {/* Footer Switch to Register */}
                <div className="mt-8 pt-5 border-t border-slate-800/80 text-center text-xs text-slate-400 space-y-2.5">
                  <div>
                    <span>New supplier or farm producer? </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthError(null);
                        setActiveTab('register');
                      }}
                      className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                    >
                      Register New Vendor Business →
                    </button>
                  </div>
                  <div>
                    <span>Looking for restaurant or kitchen login? </span>
                    <Link
                      to="/login"
                      className="font-semibold text-slate-300 hover:text-white transition-colors"
                    >
                      Main Login Page
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right Column: Supplier Portal Features Section */}
              <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl flex flex-col justify-between">
                <div>
                  {/* Header */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Supplier Portal Capabilities</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono hidden sm:inline-block">
                      B2B Wholesale Network
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    What You Can Do as a Verified Supplier
                  </h2>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                    Collaborate directly with multi-branch restaurants, fulfill supply contracts, and streamline wholesale operations through dedicated vendor tooling.
                  </p>

                  {/* 6 Supplier Portal Features Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-6">
                    {SUPPLIER_PORTAL_FEATURES.map((feat) => {
                      const Icon = feat.icon;
                      return (
                        <div
                          key={feat.id}
                          className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-emerald-500/40 hover:bg-slate-950/90 transition-all duration-200 group flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2.5">
                              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:scale-105 transition-all">
                                <Icon className="w-4 h-4" />
                              </div>
                              <span className="text-[10px] font-mono text-emerald-400/90 bg-emerald-950/50 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                                {feat.tag}
                              </span>
                            </div>
                            <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                              {feat.title}
                            </h3>
                            <p className="text-xs text-slate-400 leading-relaxed mt-1">
                              {feat.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Trust & Operational Assurance Banner */}
                <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-[11px] text-slate-300">
                      Direct Ledger Settlement • Digital Goods Received Notes (GRN) Certified
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Real-Time Sync</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* View 2: Quick Supplier Registration Form */}
          {activeTab === 'register' && (
            <div className="w-full max-w-2xl mx-auto">
              {/* Portal Card Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-sky-500 text-slate-950 shadow-xl shadow-emerald-500/25 mb-3">
                  <Truck className="w-7 h-7 text-slate-950" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-2">
                  <Store className="w-3.5 h-3.5" />
                  <span>Vendor Portal Gateway</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Register New Vendor Account
                </h1>
                <p className="text-slate-400 text-xs mt-1.5 max-w-sm mx-auto">
                  Join StockMate B2B network and supply ingredients directly to certified restaurants
                </p>
              </div>

              {/* Card Container */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
                {/* Error Banner */}
                {authError && (
                  <div className="mb-5 p-3.5 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-start gap-2.5 shadow-xs animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="font-bold block text-white">Registration Error</span>
                      <span className="opacity-90 block mt-0.5">{authError}</span>
                    </div>
                  </div>
                )}
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  {/* Selected Tier Banner */}
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-slate-300">
                        Vendor Plan: <strong className="text-white">{selectedPlan.name}</strong> (₹{billingCycle === 'yearly' ? selectedPlan.yearlyPrice : selectedPlan.price}/{billingCycle === 'yearly' ? 'yr' : 'mo'})
                      </span>
                    </div>
                    <div className="flex items-center gap-1 self-end sm:self-auto">
                      {SUPPLIER_SUBSCRIPTION_PLANS.map((plan) => (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => setSelectedPlanId(plan.id)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                            selectedPlanId === plan.id
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {plan.name.replace(' Vendor', '')}
                        </button>
                      ))}
                    </div>
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
                      <label className="block text-xs font-bold text-slate-300 mb-1">Create Password *</label>
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

                  {/* Supply Categories */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Supply Categories (Click to toggle)
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {SUPPLIER_CATEGORIES.filter((c) => c !== 'All Categories').map((cat) => {
                        const isSelected = regForm.categories.includes(cat);
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => handleToggleCategory(cat)}
                            className={`text-xs px-2.5 py-1 rounded-xl font-medium transition-all cursor-pointer ${
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

                  {/* Submit Registration Button */}
                  <Button
                    type="submit"
                    variant="brand"
                    className="w-full justify-center py-2.5 text-xs font-bold mt-2"
                    disabled={isSubmitting}
                    iconRight={isSubmitting ? null : ArrowRight}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Activating Vendor Account...</span>
                      </div>
                    ) : (
                      'Complete Registration & Launch Vendor Portal'
                    )}
                  </Button>
                </form>

                {/* Switch back to Login */}
                <div className="mt-5 pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
                  <span>Already have a supplier account? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthError(null);
                      setActiveTab('login');
                    }}
                    className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    Back to Sign In →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 border-t border-slate-800/80 text-center text-xs text-slate-500">
        <p>© 2026 StockMate SaaS Technologies Inc. • Enterprise Food Supply B2B Vendor Portal</p>
      </footer>
    </div>
  );
};

