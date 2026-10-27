import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Boxes,
  ChefHat,
  Building2,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  ClockAlert,
  Sparkles,
  Check,
  ChevronDown,
  ChevronUp,
  IndianRupee,
  Menu,
  X,
  PackageCheck,
  Truck,
  Store,
  QrCode,
  FileText,
  Sliders,
  Wrench,
  ArrowUpRight,
} from 'lucide-react';
import { formatINR } from '../data/inventoryBillingData';
import { BASE_PLANS } from '../services/pricingEngine';

export const LandingPage = () => {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ROI Calculator state
  const [calcLocations, setCalcLocations] = useState(2);
  const [calcMonthlySpend, setCalcMonthlySpend] = useState(150000); // in INR
  const [calcSpoilageRate, setCalcSpoilageRate] = useState(6.5);

  // Pricing billing cycle: 'monthly' | 'annual'
  const [billingCycle, setBillingCycle] = useState('annual');

  // FAQ open item tracker
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Helper to determine destination for current authenticated user
  const getUserDashboardRoute = (role) => {
    switch (role) {
      case 'super_admin':
        return '/admin/dashboard';
      case 'supplier':
        return '/supplier';
      case 'kitchen_staff':
        return '/kitchen';
      case 'inventory_manager':
      case 'restaurant_manager':
      case 'restaurant_owner':
      default:
        return '/dashboard';
    }
  };

  // ROI calculations
  const annualFoodSpend = calcMonthlySpend * 12 * calcLocations;
  const currentAnnualLoss = annualFoodSpend * (calcSpoilageRate / 100);
  const estimatedAnnualSavings = Math.round(currentAnnualLoss * 0.36 + annualFoodSpend * 0.042);
  const hoursSavedWeekly = calcLocations * 14;
  const estimatedRoiRatio = Math.max(3, Math.round(estimatedAnnualSavings / (calcLocations * 2499 * 12)));

  // FAQ Items - Professional & Clear
  const FAQ_ITEMS = [
    {
      q: 'Do I need special or expensive barcode hardware to use StockMate?',
      a: 'Not at all! StockMate runs directly in any modern web browser. You can use standard smartphones, iPads, Android tablets, laptops, or POS terminals you already own. Camera scanning and SVG QR codes work out of the box.',
    },
    {
      q: 'Will my kitchen staff and line cooks find this easy to use during peak rush?',
      a: 'Yes, absolutely. The kitchen station was designed specifically for busy line cooks with large touch buttons. Recording ingredient usage or reporting low stock takes less than 5 seconds with zero complex menus.',
    },
    {
      q: 'How does StockMate stop food from spoiling in my pantry?',
      a: 'Whenever deliveries are checked in, expiry dates are recorded into an automated FEFO (First-Expired, First-Out) queue. Color-coded alerts (red, amber, green) instruct staff to consume older lots first before fresh deliveries are touched.',
    },
    {
      q: 'How does supplier billing and invoice verification work?',
      a: 'When deliveries arrive at the dock, managers record accepted vs damaged quantities on a Goods Received Note (GRN). Only verified accepted items enter available inventory, and the system automatically reconciles supplier invoices with credit notes for damaged goods.',
    },
    {
      q: 'Can I manage multiple restaurant branches under one account?',
      a: 'Yes! Restaurant Owners can seamlessly operate multiple branches (e.g. Pune Central, Hinjawadi, Mumbai) with independent pantries, branch managers, staff assignments, and inter-branch transfers while maintaining unified financial reports.',
    },
    {
      q: 'How quickly can our restaurant get up and running?',
      a: 'Registration takes less than 3 minutes. You can sign up, select a plan or 14-day free trial, add your primary branch, and start recording ingredients and purchase orders immediately.',
    },
  ];

  return (
    <div id="hero" className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
      {/* 1. MAIN NAVIGATION HEADER */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Boxes className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                    StockMate
                  </span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    SaaS Platform
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block font-medium">
                  Smart Restaurant Inventory &amp; Multi-Branch
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-300">
              <a href="#hero" className="hover:text-emerald-400 transition-colors">
                Home
              </a>
              <a href="#features" className="hover:text-emerald-400 transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">
                How It Works
              </a>
              <a href="#calculator" className="hover:text-emerald-400 transition-colors">
                Savings Calculator
              </a>
              <a href="#pricing" className="hover:text-emerald-400 transition-colors">
                Pricing
              </a>
              <a href="#faq" className="hover:text-emerald-400 transition-colors">
                FAQ
              </a>
            </nav>
          </div>

          {/* Right Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(getUserDashboardRoute(currentUser.role))}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-all shadow-xs"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Dashboard ({currentUser.name?.split(' ')[0] || 'User'})</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="px-3 py-2 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/supplier-portal"
                  className="px-3 py-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Supplier Portal</span>
                </Link>

                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>

                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 hover:-translate-y-0.5 transition-all"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            {!currentUser && (
              <Link
                to="/signup"
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white"
              >
                Get Started
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-4 space-y-3">
            <a
              href="#hero"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-emerald-400 py-1"
            >
              Home
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-300 py-1"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-300 py-1"
            >
              How It Works
            </a>
            <a
              href="#calculator"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-300 py-1"
            >
              Savings Calculator
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-300 py-1"
            >
              Pricing
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-300 py-1"
            >
              FAQ
            </a>
            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              {currentUser ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate(getUserDashboardRoute(currentUser.role));
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs text-center"
                >
                  Open Dashboard
                </button>
              ) : (
                <>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs text-center"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 font-semibold text-xs text-center"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/supplier-portal"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-slate-900 border border-emerald-500/30 text-emerald-400 font-semibold text-xs text-center flex items-center justify-center gap-1.5"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Supplier Portal</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 lg:pt-32 lg:pb-36 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[900px] h-[450px] bg-gradient-to-tr from-emerald-600/20 via-teal-500/10 to-indigo-600/10 blur-[140px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-8 shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Smart Restaurant Inventory &amp; Multi-Branch Platform</span>
              <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
              <span className="text-emerald-400 font-bold">Enterprise SaaS</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.12] mb-6 sm:mb-8">
              Stop Food Waste.{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
                Save Money.
              </span>{' '}
              Keep Your Kitchen Stocked.
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10 sm:mb-12">
              The complete kitchen inventory management suite. Track expiry with FEFO rotation, generate verified Goods Received Notes (GRNs) with pure SVG QR codes, reconcile supplier invoices, and control food costs across all restaurant branches.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-base shadow-xl shadow-emerald-600/30 hover:shadow-emerald-600/40 hover:-translate-y-0.5 transition-all"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-base border border-slate-700/80 transition-all hover:-translate-y-0.5"
              >
                <span>Sign In to Your Kitchen</span>
              </Link>

              <a
                href="#how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 hover:text-white font-semibold text-sm border border-emerald-800/80 transition-all hover:-translate-y-0.5"
              >
                <span>See How It Works</span>
              </a>
            </div>

            {/* Micro Trust Indicators */}
            <div className="mt-10 pt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs font-medium text-slate-400">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Quick 3-minute setup</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BRAND TRACTION BAR */}
      <section className="py-8 border-y border-slate-800/80 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
            Powering Leading Restaurant Groups, Artisan Cafes &amp; Wholesale Food Suppliers
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-80">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-300">
              <span className="text-xl">🌿</span> Spice Garden Bistro Group
            </div>
            <div className="flex items-center gap-2 font-bold text-sm text-slate-300">
              <span className="text-xl">🥑</span> Green Bowl Organics
            </div>
            <div className="flex items-center gap-2 font-bold text-sm text-slate-300">
              <span className="text-xl">🔥</span> Urban Tandoor &amp; Grills
            </div>
            <div className="flex items-center gap-2 font-bold text-sm text-slate-300">
              <span className="text-xl">🍕</span> Bella Italia Hospitality
            </div>
            <div className="flex items-center gap-2 font-bold text-sm text-slate-300">
              <span className="text-xl">🚚</span> Metro Wholesale Logistics
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-slate-900/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-3 py-1 rounded-full">
              Streamlined Kitchen Operations
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mt-4 tracking-tight">
              From Receiving Dock to Table in 4 Simple Steps
            </h2>
            <p className="text-base text-slate-300 mt-4 leading-relaxed">
              StockMate replaces handwritten logs and missing clipboards with an automated digital workflow built for real commercial kitchens.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 hover:border-emerald-600/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black text-lg">
                    01
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    Setup
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Connect Branches &amp; Catalog</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Register your restaurants, add branch locations, set up pantry ingredients, configure reorder levels, and invite your kitchen crew with secure role permissions.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Multi-branch isolated pantries</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 hover:border-teal-600/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-black text-lg">
                    02
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    Receiving
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Digital POs &amp; Dock GRN</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Send orders to wholesale suppliers. When goods arrive, dock managers inspect quantities, log damaged items, and auto-generate credit notes before adding verified stock.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs text-teal-400 font-semibold">
                <QrCode className="w-4 h-4 text-teal-400" />
                <span>Pure SVG QR batch tags</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 hover:border-amber-600/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-black text-lg">
                    03
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    Prep
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">FEFO Prioritized Cooking</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Line cooks use kitchen tablet stations to record usage. The system prioritizes expiring batches first (FEFO) so perishable goods are never forgotten or wasted.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs text-amber-400 font-semibold">
                <ChefHat className="w-4 h-4 text-amber-400" />
                <span>Touch-friendly cook terminal</span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 hover:border-indigo-600/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-black text-lg">
                    04
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    Control
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Real-Time Cost &amp; Reorders</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Restaurant owners access real-time food cost margins, automated low-stock reorders, supplier billing ledgers, and staff branch transfer controls in one place.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs text-indigo-400 font-semibold">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span>Automated supplier billing</span>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all"
            >
              <span>Create Restaurant Account Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. FEATURE DEEP-DIVE MATRIX */}
      <section id="features" className="py-20 lg:py-28 bg-slate-900/50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950 border border-emerald-800 px-3 py-1 rounded-full">
              Enterprise Kitchen Architecture
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mt-4 tracking-tight">
              Purpose-Built for Food Operators &amp; Suppliers
            </h2>
            <p className="text-base text-slate-300 mt-4 leading-relaxed">
              Everything required to run a spotless, profitable commercial kitchen with zero inventory leakage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 hover:border-emerald-600/50 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
                <ClockAlert className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">FEFO &amp; Expiry Prioritization</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Red, yellow, and green warnings alert cooks to items expiring soon, enforcing First-Expired, First-Out cooking to eliminate waste before it occurs.
              </p>
              <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Zero Spoilage Engine</span>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 hover:border-teal-600/50 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-6">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Pure SVG QR Batch Matrix</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Generate and print standards-compliant QR code labels for every delivery batch. Scan with camera or phone to view origin, supplier, and remaining weight.
              </p>
              <div className="text-[11px] font-bold text-teal-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Instant Lot Traceability</span>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 hover:border-amber-600/50 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-6">
                <ChefHat className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Cook Touchscreen Station</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Large, touch-friendly buttons built for kitchen tablets. Tap what you used in prep or report waste in under 5 seconds with zero clutter.
              </p>
              <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Designed for Busy Line Cooks</span>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 hover:border-sky-600/50 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-6">
                <PackageCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Goods Receiving Dock &amp; GRN</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Verify incoming deliveries against purchase orders. Track accepted, damaged, and missing items. Never add unverified goods to available stock.
              </p>
              <div className="text-[11px] font-bold text-sky-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Strict Delivery Verification</span>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 hover:border-indigo-600/50 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-6">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Multi-Branch &amp; Staff Transfers</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Manage multiple locations with dedicated branch managers, isolated pantries, branch subscriptions, and seamless staff transfer workflows.
              </p>
              <div className="text-[11px] font-bold text-indigo-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Multi-Tenant Architecture</span>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 hover:border-emerald-600/50 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Supplier Billing &amp; Credit Notes</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Reconcile supplier invoices against Goods Received Notes, manage pending dues, record payments with transaction IDs, and log credit note deductions.
              </p>
              <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Transparent Financial Ledger</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. INTERACTIVE ROI CALCULATOR */}
      <section id="calculator" className="py-20 lg:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-emerald-800/40 p-6 sm:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-8">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
                    Food Waste ROI Calculator
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black text-white mt-4 tracking-tight">
                    See How Much Money You Can Save Every Year
                  </h2>
                  <p className="text-sm text-slate-300 mt-2">
                    Move the sliders to match your restaurant profile and calculate how much money you save by catching expiring food early and ordering accurately.
                  </p>
                </div>

                {/* Slider 1: Number of Locations */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <label className="font-bold text-slate-200 flex items-center gap-2">
                      <Store className="w-4 h-4 text-emerald-400" />
                      Number of Restaurant Branches
                    </label>
                    <span className="text-base font-black text-emerald-400 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                      {calcLocations} {calcLocations === 1 ? 'Branch' : 'Branches'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    step="1"
                    value={calcLocations}
                    onChange={(e) => setCalcLocations(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>1 (Single Cafe)</span>
                    <span>5 (Regional Group)</span>
                    <span>15+ (Franchise Network)</span>
                  </div>
                </div>

                {/* Slider 2: Average Monthly Food & Beverage Spend */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <label className="font-bold text-slate-200 flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-emerald-400" />
                      Monthly Ingredient Spend (per branch)
                    </label>
                    <span className="text-base font-black text-emerald-400 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                      {formatINR(calcMonthlySpend)} / mo
                    </span>
                  </div>
                  <input
                    type="range"
                    min="25000"
                    max="600000"
                    step="5000"
                    value={calcMonthlySpend}
                    onChange={(e) => setCalcMonthlySpend(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>₹25,000/mo</span>
                    <span>₹2,50,000/mo</span>
                    <span>₹6,00,000/mo</span>
                  </div>
                </div>

                {/* Slider 3: Current Spoilage Rate */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <label className="font-bold text-slate-200 flex items-center gap-2">
                      <ClockAlert className="w-4 h-4 text-emerald-400" />
                      Estimated Food Waste Percentage (Typical is 6-8%)
                    </label>
                    <span className="text-base font-black text-amber-400 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                      {calcSpoilageRate}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="14"
                    step="0.5"
                    value={calcSpoilageRate}
                    onChange={(e) => setCalcSpoilageRate(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>2% (Tight Control)</span>
                    <span>6-8% (Typical Kitchen)</span>
                    <span>14% (High Spoilage)</span>
                  </div>
                </div>
              </div>

              {/* Right: Calculated Savings Card */}
              <div className="lg:col-span-5">
                <div className="rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 p-6 sm:p-8 border border-emerald-500/30 shadow-2xl relative">
                  <div className="text-center pb-6 border-b border-emerald-800/40">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                      Estimated Annual Cost Savings
                    </span>
                    <div className="text-4xl sm:text-5xl font-black text-white mt-2">
                      {formatINR(estimatedAnnualSavings)}
                    </div>
                    <span className="text-xs text-emerald-400 font-semibold block mt-1">
                      Direct food cost savings returned to your bottom line
                    </span>
                  </div>

                  <div className="py-6 space-y-4 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Current annual food spoilage loss:</span>
                      <span className="font-bold text-rose-400 font-mono">
                        {formatINR(Math.round(currentAnnualLoss))} / yr
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Ordering &amp; stocktaking time saved:</span>
                      <span className="font-bold text-emerald-300 font-mono">
                        {hoursSavedWeekly} hrs / week
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Estimated Return on Investment:</span>
                      <span className="font-bold text-white font-mono bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-700">
                        {estimatedRoiRatio}x Platform Subscription
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      to="/signup"
                      className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all"
                    >
                      <span>Start Free 14-Day Trial</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SUBSCRIPTION PRICING */}
      <section id="pricing" className="py-20 lg:py-28 bg-slate-900/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950 border border-emerald-800 px-3 py-1 rounded-full">
              Authoritative SaaS Pricing
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mt-4 tracking-tight">
              Predictable Plans Engineered for High-Volume Kitchens
            </h2>
            <p className="text-base text-slate-300 mt-4 leading-relaxed">
              Transparent tier options with single source-of-truth pricing rules. Every plan includes SVG QR lot tracking, FEFO dispatch, and a 14-day free trial.
            </p>

            {/* Monthly / Annual Toggle defaulting to Annual with clear ~20% discount badge */}
            <div className="mt-8 inline-flex items-center gap-3 p-1.5 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  billingCycle === 'monthly'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                  billingCycle === 'annual'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Annual Billing</span>
                <span className="text-[10px] bg-emerald-400 text-slate-950 font-black px-2 py-0.5 rounded-md shadow-xs animate-pulse-glow">
                  Save approximately 20%
                </span>
              </button>
            </div>
          </div>

          {/* 3 Core Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-10">
            {/* Starter Plan */}
            <div className="rounded-3xl bg-slate-950 border border-slate-800 p-8 flex flex-col justify-between hover:border-slate-700 hover:shadow-xl transition-all duration-300">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {BASE_PLANS['plan-starter'].name} Plan
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                    {BASE_PLANS['plan-starter'].badge}
                  </span>
                </div>
                
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl font-black text-white">
                    {billingCycle === 'annual'
                      ? formatINR(BASE_PLANS['plan-starter'].effectiveMonthlyAnnual)
                      : formatINR(BASE_PLANS['plan-starter'].monthlyPrice)}
                  </span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>

                <div className="text-[11px] text-emerald-400 font-medium mb-3">
                  {billingCycle === 'annual' ? (
                    <span>Billed annually at {formatINR(BASE_PLANS['plan-starter'].annualPrice)}/yr (Save {formatINR(BASE_PLANS['plan-starter'].annualSavings)}/yr)</span>
                  ) : (
                    <span className="text-slate-400">Billed monthly, cancel or upgrade anytime</span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                  {BASE_PLANS['plan-starter'].target}
                </p>

                <div className="space-y-3 text-xs text-slate-300 pt-4 border-t border-slate-800">
                  {BASE_PLANS['plan-starter'].features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                to="/signup?plan=plan-starter"
                className="mt-8 w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs text-center transition-all block shadow-sm"
              >
                Start 14-Day Free Trial
              </Link>
            </div>

            {/* Professional Plan (Highlighted - Most Popular) */}
            <div className="rounded-3xl bg-gradient-to-b from-emerald-950/80 via-slate-950 to-slate-950 border-2 border-emerald-500 p-8 flex flex-col justify-between shadow-2xl relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-[10px] uppercase tracking-widest px-3.5 py-1 rounded-full shadow-md animate-pulse-glow">
                Most Popular
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    {BASE_PLANS['plan-pro'].name} Plan
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded-md border border-emerald-700">
                    {BASE_PLANS['plan-pro'].badge}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl font-black text-white">
                    {billingCycle === 'annual'
                      ? formatINR(BASE_PLANS['plan-pro'].effectiveMonthlyAnnual)
                      : formatINR(BASE_PLANS['plan-pro'].monthlyPrice)}
                  </span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>

                <div className="text-[11px] text-emerald-400 font-medium mb-3">
                  {billingCycle === 'annual' ? (
                    <span>Billed annually at {formatINR(BASE_PLANS['plan-pro'].annualPrice)}/yr (Save {formatINR(BASE_PLANS['plan-pro'].annualSavings)}/yr)</span>
                  ) : (
                    <span className="text-slate-400">Billed monthly, cancel or upgrade anytime</span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                  {BASE_PLANS['plan-pro'].target}
                </p>

                <div className="space-y-3 text-xs text-slate-300 pt-4 border-t border-emerald-900/60">
                  {BASE_PLANS['plan-pro'].features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                to="/signup?plan=plan-pro"
                className="mt-8 w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-sm text-center shadow-lg shadow-emerald-600/30 transition-all block"
              >
                Start 14-Day Free Trial
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="rounded-3xl bg-slate-950 border border-slate-800 p-8 flex flex-col justify-between hover:border-slate-700 hover:shadow-xl transition-all duration-300">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {BASE_PLANS['plan-enterprise'].name} Plan
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                    {BASE_PLANS['plan-enterprise'].badge}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl font-black text-white">
                    {billingCycle === 'annual'
                      ? formatINR(BASE_PLANS['plan-enterprise'].effectiveMonthlyAnnual)
                      : formatINR(BASE_PLANS['plan-enterprise'].monthlyPrice)}
                  </span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>

                <div className="text-[11px] text-emerald-400 font-medium mb-3">
                  {billingCycle === 'annual' ? (
                    <span>Billed annually at {formatINR(BASE_PLANS['plan-enterprise'].annualPrice)}/yr (Save {formatINR(BASE_PLANS['plan-enterprise'].annualSavings)}/yr)</span>
                  ) : (
                    <span className="text-slate-400">Billed monthly, cancel or upgrade anytime</span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                  {BASE_PLANS['plan-enterprise'].target}
                </p>

                <div className="space-y-3 text-xs text-slate-300 pt-4 border-t border-slate-800">
                  {BASE_PLANS['plan-enterprise'].features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                to="/signup?plan=plan-enterprise"
                className="mt-8 w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs text-center transition-all block shadow-sm"
              >
                Get Started with Enterprise
              </Link>
            </div>
          </div>

          {/* 4th Option: Build Your Own Plan (Interactive Banner) */}
          <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/40 border border-emerald-800/60 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-400 text-xs font-bold">
                <Sliders className="w-3.5 h-3.5" />
                <span>Option 4: Build Your Own Plan</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Need a Custom Combination of Outlets &amp; Modules?
              </h3>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Configure your exact branch count, staff account capacity, dedicated POS terminals, and specific kitchen add-ons. Centralized pricing engine calculates real-time rates with automated approval for standard configurations.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
              <Link
                to="/custom-plan"
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold text-center border border-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <span>Live Plan Builder</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link
                to="/signup?plan=plan-custom"
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-black text-center shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
              >
                <span>Configure in Signup</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ ACCORDION */}
      <section id="faq" className="py-20 lg:py-28 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950 border border-emerald-800 px-3 py-1 rounded-full">
              Got Questions?
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-4 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-900/50 transition-colors"
                  >
                    <span className="text-sm sm:text-base font-bold text-white">
                      {item.q}
                    </span>
                    <span className="p-1 rounded-lg bg-slate-800 text-slate-300 shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-900/80 pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. BOTTOM CALL TO ACTION */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-900 p-8 sm:p-14 border border-emerald-500/40 shadow-2xl relative overflow-hidden text-center">
            <div className="relative max-w-3xl mx-auto">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-300 bg-emerald-950/80 px-4 py-1.5 rounded-full border border-emerald-500/40">
                ⚡ Ready to eliminate kitchen food waste?
              </span>

              <h2 className="text-3xl sm:text-5xl font-black text-white mt-6 tracking-tight">
                Get Your Kitchen Running with Pure Precision
              </h2>

              <p className="text-base text-emerald-100/90 mt-4 leading-relaxed">
                Join high-performing restaurants and commercial food operators who save money, time, and ingredients every single day with StockMate.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/signup"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-extrabold text-base shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  <span>Start 14-Day Free Trial</span>
                  <ArrowRight className="w-5 h-5 text-slate-950" />
                </Link>

                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-950/90 hover:bg-emerald-950 text-white font-bold text-base border border-emerald-400/50 transition-all hover:-translate-y-0.5"
                >
                  <span>Sign In to Your Account</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. ENTERPRISE SAAS FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-900 pt-16 pb-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800/80">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md">
                  <Boxes className="w-5 h-5" />
                </div>
                <span className="text-lg font-black tracking-tight text-white">StockMate</span>
              </div>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-4">
                Smart restaurant inventory management, QR batch tracking, and supplier billing for multi-branch food operators.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Production Ready • Role-Based Security</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Product</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="hover:text-emerald-400 transition-colors">
                    Core Features
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#calculator" className="hover:text-emerald-400 transition-colors">
                    Savings Calculator
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-emerald-400 transition-colors">
                    Pricing Plans
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Solutions</h4>
              <ul className="space-y-2">
                <li>
                  <span className="text-slate-400">Multi-Branch Management</span>
                </li>
                <li>
                  <span className="text-slate-400">Pure SVG QR Batch Matrix</span>
                </li>
                <li>
                  <span className="text-slate-400">Goods Receiving &amp; GRN</span>
                </li>
                <li>
                  <span className="text-slate-400">Supplier Invoicing &amp; Claims</span>
                </li>
                <li>
                  <span className="text-slate-400">Cook Touchscreen Terminals</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Account</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/login" className="hover:text-emerald-400 transition-colors">
                    Log In
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="hover:text-emerald-400 transition-colors">
                    Register Restaurant
                  </Link>
                </li>
                <li>
                  <Link to="/forgot-password" className="hover:text-emerald-400 transition-colors">
                    Forgot Password
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
            <div>© 2026 StockMate SaaS Technologies. All rights reserved.</div>
            <div className="flex items-center gap-6">
              <span>Enterprise RBAC</span>
              <span>Encrypted Data</span>
              <span>Isolated Branch Storage</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
