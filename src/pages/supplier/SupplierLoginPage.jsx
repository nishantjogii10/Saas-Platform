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
  Phone,
  Building2,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  SUPPLIER_SUBSCRIPTION_PLANS,
  SUPPLIER_CATEGORIES,
} from '../../data/supplierMarketplaceData';

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

  const handleDemoSupplierLogin = (email, name) => {
    setAuthError(null);
    setIsSubmitting(true);
    setLoginEmail(email);
    setLoginPassword('password123');

    setTimeout(() => {
      const result = login(email, 'password123', 'supplier', null, 'supplier_portal');
      setIsSubmitting(false);
      if (result.success) {
        addToast(`Logged in as verified vendor: ${name}`, 'success');
        navigate('/supplier', { replace: true });
      } else {
        setAuthError(result.error || 'Could not log into demo vendor account.');
      }
    }, 300);
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
      <main className="relative z-10 flex-1 flex items-center justify-center py-10 px-4 sm:px-6">
        <div className={`w-full ${activeTab === 'register' ? 'max-w-2xl' : 'max-w-md'} transition-all duration-300`}>

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

          {/* Portal Card Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-sky-500 text-slate-950 shadow-xl shadow-emerald-500/25 mb-3">
              <Truck className="w-7 h-7 text-slate-950" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-2">
              <Store className="w-3.5 h-3.5" />
              <span>Third-Party Supplier Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {activeTab === 'login' ? 'Supplier Sign In' : 'Register New Vendor Account'}
            </h1>
            <p className="text-slate-400 text-xs mt-1.5 max-w-sm mx-auto">
              {activeTab === 'login'
                ? 'Sign in to access assigned purchase orders, product catalogs, delivery challans & invoices'
                : 'Join StockMate B2B network and supply ingredients directly to certified restaurants'}
            </p>
          </div>

          {/* Card Container */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl">

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

            {/* View 1: Supplier Login (Default View) */}
            {activeTab === 'login' && (
              <>
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Supplier Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                      Registered Supplier Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        disabled={isSubmitting}
                        placeholder="david@metrofoods.com"
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
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
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

                {/* Instant 1-Click Demo Vendor Logins */}
                <div className="mt-6 pt-5 border-t border-slate-800/80">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Instant Demo Vendor Access</span>
                    </span>
                    <span className="text-[10px] text-slate-500">1-Click Test</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleDemoSupplierLogin('david@metrofoods.com', 'Metro Food Distributors')}
                      className="p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800/60 border border-slate-800 hover:border-emerald-500/50 text-left transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="truncate pr-2">
                        <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                          Metro Food Distributors
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span className="text-emerald-400 font-medium">David Miller</span>
                          <span>•</span>
                          <span>Dairy, Poultry & Meat</span>
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-bold border border-emerald-500/20">Pro Vendor</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleDemoSupplierLogin('elena@freshfarmorganics.com', 'FreshFarm Organics')}
                      className="p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800/60 border border-slate-800 hover:border-teal-500/50 text-left transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="truncate pr-2">
                        <div className="text-xs font-bold text-white group-hover:text-teal-300 transition-colors truncate">
                          FreshFarm Organics
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span className="text-teal-400 font-medium">Elena Rossi</span>
                          <span>•</span>
                          <span>Fresh Vegetables & Greens</span>
                          <span className="px-1.5 py-0.2 rounded bg-teal-500/10 text-teal-400 text-[9px] font-bold border border-teal-500/20">Enterprise</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleDemoSupplierLogin('tariq@royalspicetraders.com', 'Royal Spice Traders')}
                      className="p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800/60 border border-slate-800 hover:border-amber-500/50 text-left transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="truncate pr-2">
                        <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                          Royal Spice Traders
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span className="text-amber-400 font-medium">Tariq Khan</span>
                          <span>•</span>
                          <span>Spices, Oils & Dry Pantry</span>
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 text-[9px] font-bold border border-amber-500/20">Free Starter</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  </div>
                </div>

                {/* Footer Switch to Register */}
                <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400 space-y-2">
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
              </>
            )}

            {/* View 2: Quick Supplier Registration Form */}
            {activeTab === 'register' && (
              <div>
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
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 border-t border-slate-800/80 text-center text-xs text-slate-500">
        <p>© 2026 StockMate SaaS Technologies Inc. • Enterprise Food Supply B2B Vendor Portal</p>
      </footer>
    </div>
  );
};

