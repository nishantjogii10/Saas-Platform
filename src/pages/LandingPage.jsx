import React, { useState, useEffect, useMemo } from 'react';
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
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  BarChart3,
  Layers,
  Clock,
  Users,
  ArrowLeftRight,
  ShieldAlert,
  Zap,
  Activity,
  Calendar,
  Search,
  Scale,
  Printer,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Filter,
} from 'lucide-react';
import { formatINR } from '../data/inventoryBillingData';
import { BASE_PLANS } from '../services/pricingEngine';

export const LandingPage = () => {
  const { currentUser, logout, plans: dynamicPlans } = useApp();
  const [showFeatureComparison, setShowFeatureComparison] = useState(false);
  const navigate = useNavigate();

  // Scroll detection for sticky navbar dynamic backdrop elevation
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Coordinated Scroll-Triggered Reveal System (IntersectionObserver)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Respect reduced motion preference
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
        el.classList.add('is-revealed');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            // Unobserve once revealed so it does not re-trigger repeatedly on scroll jitter
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Mobile drawer menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hero Showcase Tab ('pantry' | 'fefo' | 'grn' | 'branches')
  const [heroActiveTab, setHeroActiveTab] = useState('pantry');

  // Hero Live Pantry category filter ('all' | 'dairy' | 'bakery' | 'grains' | 'produce')
  const [pantryCategory, setPantryCategory] = useState('all');

  // Hero Live Pantry search query
  const [pantrySearch, setPantrySearch] = useState('');

  // 4-Step Operational Flow interactive step (1 | 2 | 3 | 4)
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(2);

  // Multi-Branch showcase tab ('pune' | 'hinjawadi' | 'mumbai')
  const [activeBranchTab, setActiveBranchTab] = useState('pune');

  // ROI Calculator state
  const [calcLocations, setCalcLocations] = useState(2);
  const [calcMonthlySpend, setCalcMonthlySpend] = useState(150000); // in INR
  const [calcSpoilageRate, setCalcSpoilageRate] = useState(6.5);

  // Pricing billing cycle: 'monthly' | 'annual'
  const [billingCycle, setBillingCycle] = useState('annual');

  // FAQ Accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Helper route mapping
  const getUserDashboardRoute = (role) => {
    switch (role) {
      case 'super_admin':
        return '/admin/dashboard';
      case 'restaurant_owner':
      case 'inventory_manager':
        return '/dashboard';
      case 'restaurant_manager':
        return '/workforce';
      case 'supplier':
        return '/supplier';
      case 'kitchen_staff':
        return '/kitchen';
      default:
        return '/dashboard';
    }
  };

  // Authentic Sample Inventory Dataset (Demonstrating StockMate Pantry Engine)
  const PANTRY_ITEMS = [
    {
      id: 'ing-1',
      name: 'Amul Salted Butter (Pasteurized)',
      sku: 'SKU-AMUL-01',
      category: 'dairy',
      supplier: 'Dairy Direct Logistics',
      qty: 32.0,
      unit: 'kg',
      minThreshold: 10.0,
      costPerUnit: 480,
      storage: 'Walk-In Chiller 2 (4°C)',
      status: 'optimal',
    },
    {
      id: 'ing-2',
      name: 'Fresh Pav / Buns (Daily Batch)',
      sku: 'SKU-PAV-1041',
      category: 'bakery',
      supplier: 'Golden Crust Artisan Bakery',
      qty: 60,
      unit: 'packs',
      minThreshold: 20,
      costPerUnit: 25,
      storage: 'Bakery Rack B (Dry Shelf 1)',
      status: 'optimal',
    },
    {
      id: 'ing-3',
      name: 'Premium Aged Basmati Rice',
      sku: 'SKU-RICE-04',
      category: 'grains',
      supplier: 'Metro Food Distributors',
      qty: 48.0,
      unit: 'kg',
      minThreshold: 50.0,
      costPerUnit: 110,
      storage: 'Dry Pantry A-1 (Pallet 3)',
      status: 'low',
    },
    {
      id: 'ing-4',
      name: 'Fresh Malai Paneer (Cow Milk)',
      sku: 'SKU-PAN-9021',
      category: 'dairy',
      supplier: 'Dairy Direct Logistics',
      qty: 12.0,
      unit: 'kg',
      minThreshold: 15.0,
      costPerUnit: 340,
      storage: 'Walk-In Cold Storage (2°C)',
      status: 'low',
    },
    {
      id: 'ing-5',
      name: 'Extra Virgin Olive Oil (Cold Pressed)',
      sku: 'SKU-OIL-11',
      category: 'grains',
      supplier: 'Spice Garden Wholesale',
      qty: 45.0,
      unit: 'L',
      minThreshold: 15.0,
      costPerUnit: 820,
      storage: 'Dry Stores (Ambient Oil Bay)',
      status: 'optimal',
    },
    {
      id: 'ing-6',
      name: 'Organic Bell Peppers (Red & Yellow)',
      sku: 'SKU-VEG-441',
      category: 'produce',
      supplier: 'FarmFresh Agri Supplies',
      qty: 18.0,
      unit: 'kg',
      minThreshold: 8.0,
      costPerUnit: 95,
      storage: 'Crisper Unit B (8°C)',
      status: 'optimal',
    },
  ];

  // Filtered Pantry items
  const filteredPantryItems = useMemo(() => {
    return PANTRY_ITEMS.filter((item) => {
      const matchesCategory = pantryCategory === 'all' || item.category === pantryCategory;
      const matchesSearch =
        pantrySearch === '' ||
        item.name.toLowerCase().includes(pantrySearch.toLowerCase()) ||
        item.sku.toLowerCase().includes(pantrySearch.toLowerCase()) ||
        item.supplier.toLowerCase().includes(pantrySearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [pantryCategory, pantrySearch]);

  // Authentic FEFO Expiry Queue Data
  const FEFO_QUEUE = [
    {
      batchId: 'BATCH-2026-PAV-1041',
      productName: 'Fresh Pav / Buns (Daily Batch)',
      supplierName: 'Golden Crust Artisan Bakery',
      expiryText: 'Expires in 28 hrs',
      remainingQty: '60 packs',
      urgency: 'critical',
      fefoRank: 1,
      station: 'Curry & Quick-Service Line',
      action: 'Shift to Lunch Pav Bhaji Prep Queue',
    },
    {
      batchId: 'BATCH-2026-PAN-9021',
      productName: 'Fresh Malai Paneer (Cow Milk)',
      supplierName: 'Dairy Direct Logistics',
      expiryText: '3 Days Left',
      remainingQty: '12.0 kg',
      urgency: 'warning',
      fefoRank: 2,
      station: 'Tandoor & Curry Station',
      action: 'Prioritize in Dinner Tikka & Gravy Batches',
    },
    {
      batchId: 'BATCH-2026-PRW-101',
      productName: 'Jumbo Tiger Prawns (Deep Frozen)',
      supplierName: 'Metro Food Distributors',
      expiryText: '10 Days Left',
      remainingQty: '15.0 kg',
      urgency: 'safe',
      fefoRank: 3,
      station: 'Deep Freezer Unit 1 (-18°C)',
      action: 'Verified Safe • Routine Rotation',
    },
    {
      batchId: 'BATCH-2026-BAS-101',
      productName: 'Premium Aged Basmati Rice',
      supplierName: 'Metro Food Distributors',
      expiryText: '11 Months Left',
      remainingQty: '48.0 kg',
      urgency: 'safe',
      fefoRank: 4,
      station: 'Dry Pantry A-1',
      action: 'Verified Safe • Pallet Stored',
    },
  ];

  // Authentic Dock GRN Inspection Data (PO #PO-1041)
  const GRN_REPORT = {
    grnNumber: 'GRN-2026-MTK-1041',
    poNumber: 'PO-1041',
    supplierName: 'Golden Crust Artisan Bakery',
    invoiceNumber: 'SINV-GC-2026-891',
    receivingTime: '09:15 AM (Today)',
    storeManager: 'Rahul Verma (Dock Supervisor)',
    orderedTotal: 2500,
    acceptedTotal: 2375,
    damageCreditClaim: 125,
    items: [
      {
        name: 'Fresh Pav / Buns (Daily Batch)',
        orderedQty: '100 packs',
        acceptedQty: '95 packs',
        damagedQty: '5 packs',
        damageReason: '5 packets crushed & packaging split in transit',
        creditNoteStatus: 'Claim Dispatched',
      },
      {
        name: 'Artisan Burger Buns (Sesame)',
        orderedQty: '50 packs',
        acceptedQty: '50 packs',
        damagedQty: '0 packs',
        damageReason: 'None — Pristine condition',
        creditNoteStatus: '100% Passed',
      },
    ],
  };

  // Multi-Branch Network Dataset
  const BRANCHES_DATA = {
    pune: {
      name: 'Pune Central (HQ & Commissary)',
      type: 'Primary Central Kitchen',
      valuation: 142850,
      activeStaff: 14,
      posStations: 2,
      todayConsumption: 38200,
      lowStockAlerts: 2,
      status: 'Optimal Operations',
    },
    hinjawadi: {
      name: 'Hinjawadi IT Hub',
      type: 'Cloud Kitchen & Delivery Express',
      valuation: 78400,
      activeStaff: 8,
      posStations: 1,
      todayConsumption: 22100,
      lowStockAlerts: 1,
      status: 'Optimal Operations',
    },
    mumbai: {
      name: 'Mumbai Bandra West',
      type: 'Flagship Dine-In Bistro & Bar',
      valuation: 118900,
      activeStaff: 12,
      posStations: 3,
      todayConsumption: 41500,
      lowStockAlerts: 0,
      status: 'Optimal Operations',
    },
  };

  // 4-Step Operational Flow descriptions
  const WORKFLOW_STEPS = [
    {
      step: 1,
      id: 'setup',
      tag: 'Step 01: Setup',
      title: 'Catalog & Isolated Branch Setup',
      summary: 'Register multi-branch restaurants, establish unit costs, configure low-stock safety thresholds, and assign role permissions.',
      metricLabel: 'Setup Speed',
      metricValue: '< 3 Minutes',
      bullet: 'Granular permissions for owners, managers, line cooks & suppliers',
    },
    {
      step: 2,
      id: 'grn',
      tag: 'Step 02: Receiving',
      title: 'Digital POs, Dock GRN & Credit Claims',
      summary: 'Receive deliveries with barcode scanning. Log damages, generate verified Goods Received Notes, and auto-deduct credit claims from supplier ledgers.',
      metricLabel: 'Dispute Recovery',
      metricValue: '100% Reconciled',
      bullet: 'Pure SVG QR codes printed directly to thermal labels',
    },
    {
      step: 3,
      id: 'fefo',
      tag: 'Step 03: Kitchen Execution',
      title: 'First-Expired, First-Out (FEFO) Dispatch',
      summary: 'Touch-optimized kitchen tablet stations route expiring batches first. Reduces spoilage by ensuring oldest expiring perishables are prepped first.',
      metricLabel: 'Spoilage Reduction',
      metricValue: '72% Average',
      bullet: 'Automatic batch rotation alerts in prep queues',
    },
    {
      step: 4,
      id: 'finance',
      tag: 'Step 04: Control',
      title: 'Real-Time Food Costing & Branch Transfers',
      summary: 'Live variance reports, supplier payment ledgers, inter-branch stock transfers, and automated inventory valuation across all outlets.',
      metricLabel: 'Audit Speed',
      metricValue: 'Instant',
      bullet: 'Consolidated commissary and multi-branch ledger reports',
    },
  ];

  // ROI Calculations
  const annualIngredientSpend = calcLocations * calcMonthlySpend * 12;
  const currentAnnualLoss = annualIngredientSpend * (calcSpoilageRate / 100);
  const estimatedAnnualSavings = Math.round(currentAnnualLoss * 0.72);
  const estimatedMonthlySavings = Math.round(estimatedAnnualSavings / 12);
  const annualSoftwareInvestment = 1999 * 12 * Math.max(1, Math.ceil(calcLocations / 3));
  const netAnnualProfitIncrease = Math.max(0, estimatedAnnualSavings - annualSoftwareInvestment);
  const calculatedROI = Math.round((netAnnualProfitIncrease / (annualSoftwareInvestment || 1)) * 100);

  const FAQ_ITEMS = [
    {
      q: 'Do I need special or expensive barcode hardware to use StockMate?',
      a: 'Not at all! StockMate runs directly in any modern web browser. You can use standard smartphones, iPads, Android tablets, laptops, or POS terminals you already own. Camera scanning and SVG QR codes work out of the box with zero proprietary hardware required.',
    },
    {
      q: 'Will my kitchen staff and line cooks find this easy to use during peak rush?',
      a: 'Yes. StockMate includes a streamlined Touchscreen Kitchen Terminal mode with large tap targets, high-contrast buttons, and single-click recipe batch logging so prep cooks can record usage in seconds without slowing down service.',
    },
    {
      q: 'How does FEFO (First-Expired, First-Out) save money over standard FIFO?',
      a: 'Standard FIFO assumes older deliveries should be consumed first, but perishable food often arrives with variable shelf lives. FEFO prioritizes ingredient batches strictly by their true expiration dates, preventing milk, cheeses, meats, and fresh produce from spoiling in hidden corners of your walk-in.',
    },
    {
      q: 'Can StockMate handle multi-branch restaurants and central commissaries?',
      a: 'Yes. Enterprise and Multi-Branch plans support branch-to-branch stock transfers, central commissary dispatch with dispatch notes, and consolidated food-cost reporting across all outlets from a single dashboard.',
    },
    {
      q: 'How does StockMate handle supplier disputes and damaged deliveries?',
      a: 'When an order arrives at your receiving dock, staff record accepted and rejected quantities directly in the Goods Received Note (GRN) workflow. StockMate automatically calculates the variance and generates an instant credit note claim for your supplier ledger.',
    },
    {
      q: 'How quickly can our restaurant get up and running?',
      a: 'Registration takes less than 3 minutes. You can sign up, select a plan or 14-day free trial, add your primary branch, and start recording ingredients and purchase orders immediately.',
    },
  ];

  return (
    <div id="hero" className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 relative scroll-mt-24">
      {/* Dynamic Ambient Background Lights */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-64 right-10 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[1200px] left-10 w-[600px] h-[600px] bg-indigo-500/8 rounded-full blur-[150px] pointer-events-none" />

      {/* 1. STICKY LIQUID GLASS FLOATING NAVBAR */}
      <div className="sticky top-0 z-50 w-full pt-3 pb-2 px-3 sm:px-6 pointer-events-none transition-all duration-200">
        <header
          className={`max-w-7xl mx-auto rounded-2xl px-4 sm:px-6 h-18 sm:h-20 flex items-center justify-between pointer-events-auto transition-all duration-200 border ${
            isScrolled
              ? 'liquid-glass-nav bg-slate-950/90 backdrop-blur-2xl border-white/20 shadow-2xl shadow-slate-950/70'
              : 'liquid-glass-nav bg-slate-950/75 backdrop-blur-xl border-white/10 shadow-xl'
          }`}
        >
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-7">
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
            <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-300 tracking-wide">
              <a href="#hero" className="hover:text-emerald-400 transition-colors py-1.5 px-2 rounded-lg hover:bg-white/5">
                Home
              </a>
              <a href="#features" className="hover:text-emerald-400 transition-colors py-1.5 px-2 rounded-lg hover:bg-white/5">
                Features
              </a>
              <a href="#how-it-works" className="hover:text-emerald-400 transition-colors py-1.5 px-2 rounded-lg hover:bg-white/5">
                How It Works
              </a>
              <a href="#calculator" className="hover:text-emerald-400 transition-colors py-1.5 px-2 rounded-lg hover:bg-white/5">
                Savings Calculator
              </a>
              <a href="#pricing" className="hover:text-emerald-400 transition-colors py-1.5 px-2 rounded-lg hover:bg-white/5">
                Pricing
              </a>
              <a href="#faq" className="hover:text-emerald-400 transition-colors py-1.5 px-2 rounded-lg hover:bg-white/5">
                FAQ
              </a>
            </nav>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/supplier-portal"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-emerald-400 border border-emerald-500/25 text-xs font-bold transition-all shadow-xs"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Supplier Portal</span>
            </Link>

            {/* Requirement 2: Sign In option directly routing to main login page */}
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-white bg-slate-800 hover:bg-slate-700 text-xs font-bold border border-slate-700 hover:border-emerald-500/50 transition-all flex items-center gap-1.5 shadow-xs"
            >
              <span>Sign In</span>
            </Link>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(getUserDashboardRoute(currentUser.role))}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={logout}
                  className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
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
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </header>

        {/* Mobile dropdown drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-2 max-w-7xl mx-auto liquid-glass-card rounded-2xl px-4 sm:px-6 py-4 space-y-3 backdrop-blur-2xl shadow-2xl pointer-events-auto border border-white/15">
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
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs text-center border border-slate-700"
              >
                Sign In
              </Link>
              <Link
                to="/supplier-portal"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-emerald-400 font-bold text-xs text-center border border-emerald-500/30"
              >
                Supplier Portal
              </Link>
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
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs text-center"
                >
                  Get Started Free
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. HERO SECTION — Compelling Value Proposition & Hierarchy */}
      <section className="relative pt-8 pb-16 sm:pt-12 sm:pb-24 lg:pt-14 lg:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Eyebrow Pill Badge */}
            <div className="animate-hero-eyebrow inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-6 shadow-inner backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Smart Restaurant Inventory &amp; Multi-Branch Platform</span>
              <span className="w-1 h-1 rounded-full bg-emerald-400" />
              <span className="text-emerald-400 font-bold">Enterprise SaaS</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.12] mb-6">
              <span className="block animate-hero-title-1">
                Stop Food Waste.{' '}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
                  Save Money.
                </span>
              </span>
              <span className="block animate-hero-title-2 mt-1 sm:mt-2">
                Keep Your Kitchen Stocked.
              </span>
            </h1>

            {/* Subheading */}
            <p className="animate-hero-desc text-base sm:text-lg lg:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8">
              The complete kitchen inventory management suite. Track expiry with FEFO rotation, generate verified Goods Received Notes (GRNs) with pure SVG QR codes, reconcile supplier invoices, and control food costs across all restaurant branches.
            </p>

            {/* Primary Action Buttons */}
            <div className="animate-hero-cta flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                to="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/30 hover:shadow-emerald-600/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-sm border border-slate-700/80 transition-all hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <span>See How It Works</span>
              </a>

              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 hover:text-white font-semibold text-xs border border-emerald-800/80 transition-colors"
              >
                <ChefHat className="w-4 h-4" />
                <span>Kitchen Terminal Login</span>
              </Link>
            </div>

            {/* Verifiable Trust Indicators */}
            <div className="animate-hero-trust mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs font-medium text-slate-400">
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
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Pure SVG QR batch labels</span>
              </div>
            </div>
          </div>

          {/* 🌟 GENUINELY INTERACTIVE REALISTIC INVENTORY DASHBOARD WINDOW 🌟 */}
          <div className="animate-hero-preview mt-12 max-w-5xl mx-auto relative text-left">
            {/* Outer Radiant Refraction Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/25 via-teal-400/20 to-blue-500/20 rounded-3xl blur-xl opacity-70 pointer-events-none" />

            {/* Floating Top-Left Status Badge */}
            <div className="absolute -top-3.5 -left-2 sm:-left-4 z-20 hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/95 border border-emerald-500/40 text-xs font-bold text-emerald-300 shadow-xl backdrop-blur-xl hover:scale-105 transition-transform duration-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-live-beacon" />
              <span>Dock GRN Reconciled • Batch #LOT-9024</span>
            </div>

            {/* Floating Bottom-Right Status Badge */}
            <div className="absolute -bottom-3.5 -right-2 sm:-right-4 z-20 hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/95 border border-teal-500/40 text-xs font-bold text-teal-300 shadow-xl backdrop-blur-xl hover:scale-105 transition-transform duration-200">
              <QrCode className="w-3.5 h-3.5 text-teal-400" />
              <span>FEFO Lot Rotation Verified • 0 Spoilage</span>
            </div>

            {/* Main Window Frame */}
            <div className="liquid-glass-card rounded-3xl p-4 sm:p-6 relative z-10 border border-white/20 shadow-2xl backdrop-blur-2xl overflow-hidden preview-card-hover motion-card">
              {/* Window Header & Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10 mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/90 shadow-xs" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/90 shadow-xs" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/90 shadow-xs" />
                  <span className="ml-3 text-xs font-mono text-slate-300 flex items-center gap-1.5">
                    <span className="text-slate-400">stockmate.saas</span>
                    <span className="text-slate-600">/</span>
                    <span className="text-emerald-400 font-bold">pune-central/live-station</span>
                  </span>
                </div>

                {/* Interactive Showcase Tabs */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/80 border border-white/10 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setHeroActiveTab('pantry')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      heroActiveTab === 'pantry'
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Live Pantry
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeroActiveTab('fefo')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      heroActiveTab === 'fefo'
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    FEFO Expiry Queue
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeroActiveTab('grn')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      heroActiveTab === 'grn'
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Dock GRN
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeroActiveTab('branches')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      heroActiveTab === 'branches'
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Multi-Branch
                  </button>
                </div>
              </div>

              {/* 4 Frosted KPI Metric Tiles */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Pantry Valuation
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white tracking-tight">₹1,42,850</div>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold mt-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+14.2% optimized</span>
                  </div>
                </div>

                <div className="p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    FEFO Accuracy
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight">99.8%</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    <span>Strict First-In First-Out</span>
                  </div>
                </div>

                <div className="p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Verified GRNs
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-teal-300 tracking-tight">18 Cleared</div>
                  <div className="text-[11px] text-teal-400/90 font-medium mt-1">
                    <span>Auto Credit Notes</span>
                  </div>
                </div>

                <div className="p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Active Branches
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white tracking-tight">4 Outlets</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    <span>Central Commissary</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Tab Panes */}

              {/* TAB 1: LIVE PANTRY WITH FILTERS & HIGH-DENSITY TABLE */}
              {heroActiveTab === 'pantry' && (
                <div key="pantry" className="animate-panel-switch rounded-2xl border border-white/10 bg-slate-950/80 overflow-hidden shadow-inner">
                  {/* Category Pill Filters & Live Search */}
                  <div className="p-3.5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-slate-900/60">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-slate-400 font-semibold mr-1 flex items-center gap-1">
                        <Filter className="w-3 h-3 text-emerald-400" /> Filter:
                      </span>
                      {[
                        { id: 'all', label: 'All Items' },
                        { id: 'dairy', label: 'Dairy & Cheese' },
                        { id: 'bakery', label: 'Bakery' },
                        { id: 'grains', label: 'Grains & Oils' },
                        { id: 'produce', label: 'Produce' },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setPantryCategory(cat.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                            pantryCategory === cat.id
                              ? 'bg-emerald-600 text-white font-bold'
                              : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={pantrySearch}
                        onChange={(e) => setPantrySearch(e.target.value)}
                        placeholder="Search item, SKU or supplier..."
                        className="bg-slate-950/80 border border-white/10 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 w-44 sm:w-56"
                      />
                    </div>
                  </div>

                  {/* Dense, High-Readability Inventory Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse min-w-[650px]">
                      <thead>
                        <tr className="border-b border-white/10 text-slate-400 font-semibold bg-slate-900/40">
                          <th className="py-2.5 px-3.5">Ingredient Name &amp; SKU</th>
                          <th className="py-2.5 px-3.5">Supplier Partner</th>
                          <th className="py-2.5 px-3.5">Storage Bay</th>
                          <th className="py-2.5 px-3.5 text-right">In Stock / Min</th>
                          <th className="py-2.5 px-3.5 text-right">Unit Rate</th>
                          <th className="py-2.5 px-3.5 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300">
                        {filteredPantryItems.map((item) => (
                          <tr key={item.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-2.5 px-3.5">
                              <div className="font-bold text-white">{item.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{item.sku}</div>
                            </td>
                            <td className="py-2.5 px-3.5 text-slate-300 font-medium">{item.supplier}</td>
                            <td className="py-2.5 px-3.5 text-slate-400 text-[11px]">{item.storage}</td>
                            <td className="py-2.5 px-3.5 text-right font-mono font-bold text-white">
                              {item.qty} {item.unit}{' '}
                              <span className="text-[10px] text-slate-400 font-normal">/ {item.minThreshold}</span>
                            </td>
                            <td className="py-2.5 px-3.5 text-right font-mono text-emerald-400 font-semibold">
                              ₹{item.costPerUnit}
                            </td>
                            <td className="py-2.5 px-3.5 text-center">
                              {item.status === 'optimal' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                  Optimal
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                  Low Stock
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: FEFO EXPIRY QUEUE */}
              {heroActiveTab === 'fefo' && (
                <div key="fefo" className="animate-panel-switch rounded-2xl border border-white/10 bg-slate-950/80 p-4 space-y-3 shadow-inner">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-200 pb-2 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <ClockAlert className="w-4 h-4 text-emerald-400" />
                      <span>FEFO Expiry Queue (First-Expired, First-Out Kitchen Dispatch)</span>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-mono">Ranked by Shelf Life</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {FEFO_QUEUE.map((lot) => (
                      <div
                        key={lot.batchId}
                        className={`p-3.5 rounded-xl border transition-all ${
                          lot.urgency === 'critical'
                            ? 'bg-rose-500/10 border-rose-500/30'
                            : lot.urgency === 'warning'
                            ? 'bg-amber-500/10 border-amber-500/30'
                            : 'bg-emerald-500/10 border-emerald-500/30'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1.5">
                          <div>
                            <span className="font-bold text-white text-sm block">{lot.productName}</span>
                            <span className="font-mono text-[10px] text-slate-400">{lot.batchId}</span>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              lot.urgency === 'critical'
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                : lot.urgency === 'warning'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            }`}
                          >
                            {lot.expiryText}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-300 mt-2">
                          <span className="text-slate-400">Remaining:</span>{' '}
                          <strong className="text-white font-mono">{lot.remainingQty}</strong> &bull; {lot.supplierName}
                        </div>
                        <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Station: {lot.station}</span>
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <ArrowRight className="w-3 h-3" /> {lot.action}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: DOCK GRN & DISCREPANCY CLAIMS */}
              {heroActiveTab === 'grn' && (
                <div key="grn" className="animate-panel-switch rounded-2xl border border-white/10 bg-slate-950/80 overflow-hidden shadow-inner">
                  <div className="p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-200 border-b border-white/10 bg-slate-900/60">
                    <div className="flex items-center gap-2">
                      <PackageCheck className="w-4 h-4 text-emerald-400" />
                      <span>Dock GRN Reconciled with PO #{GRN_REPORT.poNumber}</span>
                      <span className="font-mono text-[10px] text-slate-400">({GRN_REPORT.grnNumber})</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="text-slate-400">Verified by: {GRN_REPORT.storeManager}</span>
                      <span className="font-bold text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                        Damage Credit Claim: -₹{GRN_REPORT.damageCreditClaim}
                      </span>
                    </div>
                  </div>

                  <div className="divide-y divide-white/5 text-xs">
                    {GRN_REPORT.items.map((row, idx) => (
                      <div key={idx} className="p-3.5 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="font-bold text-white text-sm">{row.name}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Ordered: <strong className="text-slate-200 font-mono">{row.orderedQty}</strong> &bull;
                            Accepted: <strong className="text-emerald-400 font-mono">{row.acceptedQty}</strong> &bull;
                            Damaged:{' '}
                            <strong className="text-rose-400 font-mono">{row.damagedQty}</strong>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">Notes: {row.damageReason}</div>
                        </div>

                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                            row.damagedQty === '0 packs'
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {row.creditNoteStatus}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 border-t border-white/10 bg-slate-900/40 flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-mono text-[11px]">
                      Supplier Ledger: {GRN_REPORT.invoiceNumber} adjusted automatically
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Reconciled Net Payable:</span>
                      <span className="text-emerald-400 font-mono font-bold text-sm">
                        ₹{GRN_REPORT.acceptedTotal}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: MULTI-BRANCH CONSOLIDATED NETWORK */}
              {heroActiveTab === 'branches' && (
                <div key="branches" className="animate-panel-switch rounded-2xl border border-white/10 bg-slate-950/80 overflow-hidden shadow-inner p-4 space-y-4">
                  {/* Branch Tab Switcher */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                      <Store className="w-4 h-4 text-emerald-400" />
                      <span>Consolidated Commissary &amp; Multi-Outlet Footprint</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-white/10 text-xs">
                      {['pune', 'hinjawadi', 'mumbai'].map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setActiveBranchTab(key)}
                          className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                            activeBranchTab === key
                              ? 'bg-emerald-600 text-white font-bold'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {key.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Branch Detail Card */}
                  {BRANCHES_DATA[activeBranchTab] && (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                        <div>
                          <div className="text-base font-bold text-white flex items-center gap-2">
                            <span>{BRANCHES_DATA[activeBranchTab].name}</span>
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          </div>
                          <div className="text-xs text-slate-400">{BRANCHES_DATA[activeBranchTab].type}</div>
                        </div>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          {BRANCHES_DATA[activeBranchTab].status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
                        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5">
                          <span className="text-slate-400 text-[10px] block">Live Pantry Valuation</span>
                          <span className="font-mono font-bold text-white text-base">
                            ₹{BRANCHES_DATA[activeBranchTab].valuation.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5">
                          <span className="text-slate-400 text-[10px] block">Active Kitchen Staff</span>
                          <span className="font-mono font-bold text-emerald-400 text-base">
                            {BRANCHES_DATA[activeBranchTab].activeStaff} Crew
                          </span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5">
                          <span className="text-slate-400 text-[10px] block">Connected POS Stations</span>
                          <span className="font-mono font-bold text-teal-300 text-base">
                            {BRANCHES_DATA[activeBranchTab].posStations} Stations
                          </span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5">
                          <span className="text-slate-400 text-[10px] block">Today's Consumption</span>
                          <span className="font-mono font-bold text-white text-base">
                            ₹{BRANCHES_DATA[activeBranchTab].todayConsumption.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. BRAND TRACTION / PARTNER LOGO BAR */}
      <section className="reveal-on-scroll py-8 border-y border-white/10 liquid-glass-nav my-8 max-w-7xl mx-auto rounded-3xl px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
            Powering Leading Restaurant Groups, Artisan Cafes &amp; Wholesale Food Suppliers
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-xs sm:text-sm text-slate-200 font-semibold opacity-90">
            <div className="flex items-center gap-2">
              <span className="text-lg">🌿</span> Spice Garden Bistro Group
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🥑</span> Green Bowl Organics
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🔥</span> Urban Tandoor &amp; Grills
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🍕</span> Bella Italia Hospitality
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🚚</span> Metro Wholesale Logistics
            </div>
          </div>
        </div>
      </section>

      {/* 4. GENUINELY INTERACTIVE 4-STEP OPERATIONAL FLOW */}
      <section id="how-it-works" className="py-20 lg:py-28 relative scroll-mt-24 sm:scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="reveal-on-scroll text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-3.5 py-1 rounded-full">
              Interactive Operational Flow
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mt-4 tracking-tight">
              From Receiving Dock to Table in 4 Simple Steps
            </h2>
            <p className="text-base text-slate-300 mt-4 leading-relaxed">
              Click on each operational stage below to see how StockMate automates real kitchen workflows.
            </p>
          </div>

          {/* Interactive Step Switcher Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {WORKFLOW_STEPS.map((ws, index) => (
              <button
                key={ws.step}
                type="button"
                onClick={() => setActiveWorkflowStep(ws.step)}
                className={`reveal-on-scroll stagger-${index + 1} motion-card p-5 rounded-2xl border text-left transition-all duration-200 relative focus-visible:ring-2 focus-visible:ring-emerald-400 outline-none ${
                  activeWorkflowStep === ws.step
                    ? 'liquid-glass-card border-emerald-500/60 shadow-xl ring-2 ring-emerald-500/30 scale-[1.01]'
                    : 'bg-slate-900/40 border-white/10 hover:border-white/20 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs border ${
                      activeWorkflowStep === ws.step
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                        : 'bg-white/5 text-slate-400 border-white/10'
                    }`}
                  >
                    0{ws.step}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    {ws.metricValue}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{ws.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{ws.summary}</p>
              </button>
            ))}
          </div>

          {/* Active Step Detailed Showcase Panel */}
          {WORKFLOW_STEPS.find((w) => w.step === activeWorkflowStep) && (
            <div key={activeWorkflowStep} className="animate-panel-switch liquid-glass-card rounded-3xl p-6 sm:p-8 border border-emerald-500/30 shadow-2xl backdrop-blur-xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
                    {WORKFLOW_STEPS[activeWorkflowStep - 1].tag}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    {WORKFLOW_STEPS[activeWorkflowStep - 1].title}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {WORKFLOW_STEPS[activeWorkflowStep - 1].summary}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 pt-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{WORKFLOW_STEPS[activeWorkflowStep - 1].bullet}</span>
                  </div>
                </div>

                <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-950/80 border border-white/10 shadow-inner space-y-3 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-white/10">
                    <span className="text-slate-400 font-medium">Core Metric:</span>
                    <span className="text-emerald-400 font-mono font-bold text-sm">
                      {WORKFLOW_STEPS[activeWorkflowStep - 1].metricLabel} ({WORKFLOW_STEPS[activeWorkflowStep - 1].metricValue})
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Automated by StockMate without requiring manual spreadsheet data entry or paper clipboards.
                  </div>
                  <Link
                    to="/signup"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                  >
                    <span>Test This Workflow with 14-Day Trial</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. BENTO-STYLE PRODUCT CAPABILITIES MATRIX */}
      <section id="features" className="py-20 lg:py-28 relative scroll-mt-24 sm:scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="reveal-on-scroll text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-3.5 py-1 rounded-full">
              Enterprise Kitchen Architecture
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mt-4 tracking-tight">
              Purpose-Built for Food Operators &amp; Suppliers
            </h2>
            <p className="text-base text-slate-300 mt-4 leading-relaxed">
              Everything required to run a spotless, profitable commercial kitchen with zero inventory leakage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Bento Card 1: Wide Card — FEFO Expiry Engine */}
            <div className="reveal-on-scroll stagger-1 motion-card group md:col-span-7 liquid-glass-card rounded-3xl p-7 flex flex-col justify-between border border-white/15 hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-950/30 focus-visible:ring-2 focus-visible:ring-emerald-400 outline-none">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <ClockAlert className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                    Zero Spoilage Guarantee
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">FEFO &amp; Expiry Prioritization</h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  Automated First-Expired, First-Out queueing. Red (&lt;24h), amber (&lt;3d), and green badges tell prep cooks exactly which lot to consume first, preventing forgotten pantry waste.
                </p>
              </div>

              {/* Visual FEFO Mini Queue */}
              <div className="rounded-2xl bg-slate-950/80 border border-white/10 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between text-xs bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                    <span className="font-bold text-white">Full Cream Milk Pouches</span>
                  </div>
                  <span className="font-mono text-rose-300 font-bold text-[11px]">Expires Tomorrow • Rotate Now</span>
                </div>
                <div className="flex items-center justify-between text-xs bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="font-bold text-white">Fresh Buffalo Paneer (14 kg)</span>
                  </div>
                  <span className="font-mono text-amber-300 font-bold text-[11px]">3 Days Left • Prep Queue #2</span>
                </div>
              </div>
            </div>

            {/* Bento Card 2: Pure SVG QR Batch Tags */}
            <div className="reveal-on-scroll stagger-2 motion-card group md:col-span-5 liquid-glass-card rounded-3xl p-7 flex flex-col justify-between border border-white/15 hover:border-teal-500/40 hover:shadow-2xl hover:shadow-emerald-950/30 focus-visible:ring-2 focus-visible:ring-emerald-400 outline-none">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/30">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-teal-500/15 text-teal-300 text-xs font-bold border border-teal-500/30">
                    Pure SVG Engine
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">QR Code Batch Tags</h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  Generate vector QR labels for incoming deliveries. Print directly to thermal label makers or scan instantly using standard smartphone cameras.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center">
                    <QrCode className="w-8 h-8 text-teal-400" />
                  </div>
                  <div>
                    <div className="font-mono font-bold text-white text-xs">LOT-9024-AMUL</div>
                    <div className="text-[11px] text-slate-400">Verified QR • 32 Units</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/30">
                  Ready to Print
                </span>
              </div>
            </div>

            {/* Bento Card 3: Multi-Branch & Commissary Sync */}
            <div className="reveal-on-scroll stagger-3 motion-card group md:col-span-4 liquid-glass-card rounded-3xl p-7 flex flex-col justify-between border border-white/15 hover:border-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-950/30 focus-visible:ring-2 focus-visible:ring-emerald-400 outline-none">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/30 mb-4">
                  <Store className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Multi-Branch Sync</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Manage multiple dining outlets, cloud kitchens, and a central commissary kitchen with isolated stock visibility and one-click transfers.
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
                  <span className="text-slate-300">Pune Central HQ</span>
                  <span className="font-mono font-bold text-emerald-400">₹1,42,850</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
                  <span className="text-slate-300">Hinjawadi Cloud</span>
                  <span className="font-mono font-bold text-teal-400">₹78,400</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
                  <span className="text-slate-300">Mumbai Bistro</span>
                  <span className="font-mono font-bold text-blue-400">₹1,18,900</span>
                </div>
              </div>
            </div>

            {/* Bento Card 4: Supplier B2B Billing & Dispute Ledgers */}
            <div className="reveal-on-scroll stagger-4 motion-card group md:col-span-4 liquid-glass-card rounded-3xl p-7 flex flex-col justify-between border border-white/15 hover:border-teal-500/40 hover:shadow-2xl hover:shadow-teal-950/30 focus-visible:ring-2 focus-visible:ring-emerald-400 outline-none">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/30 mb-4">
                  <Truck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Supplier Dispute Claims</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Match supplier invoices against Goods Received Notes. Automatically deduct damaged items and generate credit claims instantly.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Invoice Amount:</span>
                  <span className="text-white font-mono font-bold">₹24,500</span>
                </div>
                <div className="flex justify-between text-rose-300">
                  <span>Damaged Claim:</span>
                  <span className="font-mono font-bold">- ₹850</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-white/10 text-emerald-400 font-bold">
                  <span>Reconciled Net Pay:</span>
                  <span className="font-mono text-sm">₹23,650</span>
                </div>
              </div>
            </div>

            {/* Bento Card 5: Touchscreen Kitchen Station */}
            <div className="reveal-on-scroll stagger-5 motion-card group md:col-span-4 liquid-glass-card rounded-3xl p-7 flex flex-col justify-between border border-white/15 hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-950/30 focus-visible:ring-2 focus-visible:ring-emerald-400 outline-none">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/30 mb-4">
                  <ChefHat className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Kitchen Tablet Terminal</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Simplified touch interface designed for hot line cooks. Record dish usage and ingredient spoilage with oversized buttons and zero keyboard typing.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <span className="text-emerald-400 font-bold block text-sm">1-Tap</span>
                  <span className="text-[11px] text-slate-300">Batch Usage</span>
                </div>
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
                  <span className="text-rose-400 font-bold block text-sm">Instant</span>
                  <span className="text-[11px] text-slate-300">Damage Log</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE ROI CALCULATOR */}
      <section id="calculator" className="py-20 lg:py-28 relative scroll-mt-24 sm:scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="reveal-on-scroll motion-card rounded-3xl liquid-glass-card border border-emerald-500/30 p-6 sm:p-12 shadow-2xl relative overflow-hidden backdrop-blur-2xl hover:border-emerald-500/50 hover:shadow-emerald-950/40">
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

                {/* Slider 2: Monthly Ingredient Spend */}
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
                      <span className="font-mono text-rose-400 font-bold">{formatINR(Math.round(currentAnnualLoss))}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Estimated monthly savings:</span>
                      <span className="font-mono text-emerald-400 font-black text-base">{formatINR(estimatedMonthlySavings)} / mo</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Est. StockMate annual subscription:</span>
                      <span className="font-mono text-slate-300 font-bold">{formatINR(annualSoftwareInvestment)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-slate-800 text-sm">
                      <span className="font-extrabold text-white">Projected First-Year ROI:</span>
                      <span className="font-mono font-black text-emerald-400 text-lg">{calculatedROI}% Return</span>
                    </div>
                  </div>

                  <Link
                    to="/signup"
                    className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xs text-center transition-all block shadow-lg shadow-emerald-600/30"
                  >
                    Start Saving Now with Free Trial
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SUBSCRIPTION PRICING */}
      <section id="pricing" className="py-20 lg:py-28 relative scroll-mt-24 sm:scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="reveal-on-scroll text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950 border border-emerald-800 px-3 py-1 rounded-full">
              Transparent Pricing
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mt-4 tracking-tight">
              Predictable Plans Engineered for High-Volume Kitchens
            </h2>
            <p className="text-base text-slate-300 mt-4 leading-relaxed">
              Transparent tier options with single source-of-truth pricing rules. Every plan includes SVG QR lot tracking, FEFO dispatch, and a 14-day free trial.
            </p>

            {/* Monthly / Annual Toggle */}
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
                <span className="text-[10px] bg-emerald-400 text-slate-950 font-black px-2 py-0.5 rounded-md shadow-xs">
                  Save ~20%
                </span>
              </button>
            </div>
          </div>

          {/* 3 Core Dynamic Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-10">
            {((dynamicPlans && dynamicPlans.length > 0 ? dynamicPlans : Object.values(BASE_PLANS))
              .filter((p) => p.status !== 'inactive' && p.id !== 'plan-custom'))
              .map((plan) => {
                const isPopular = plan.popular || plan.id === 'plan-pro';
                const annualPrice = plan.annualPrice ?? Math.round(plan.monthlyPrice * 12 * 0.8);
                const annualSavings = plan.annualSavings ?? Math.max(0, (plan.monthlyPrice * 12) - annualPrice);
                const savingsPercent = plan.savingsPercent ?? (plan.monthlyPrice > 0 ? Math.round((annualSavings / (plan.monthlyPrice * 12)) * 100) : 0);
                const effectiveMonthly = plan.effectiveMonthlyAnnual ?? Math.round(annualPrice / 12);
                const maxIngredients = plan.limits?.maxIngredients ?? plan.maxIngredients ?? 500;
                const maxStaff = plan.limits?.maxStaff ?? plan.includedStaff ?? 5;
                const maxBranches = plan.limits?.branches ?? plan.includedOutlets ?? 1;

                return (
                  <div
                    key={plan.id}
                    className={`reveal-on-scroll motion-card rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative liquid-glass-card hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-950/30 ${
                      isPopular
                        ? 'border-2 border-emerald-500 shadow-2xl ring-2 ring-emerald-500/20'
                        : 'border border-white/10 hover:border-emerald-500/40'
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-[10px] uppercase tracking-widest px-3.5 py-1 rounded-full shadow-md">
                        Most Popular Choice
                      </div>
                    )}

                    <div>
                      {/* Header Badge */}
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-xs font-bold uppercase tracking-wider ${
                            isPopular ? 'text-emerald-400' : 'text-slate-400'
                          }`}
                        >
                          {plan.name} Plan
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                            isPopular
                              ? 'text-emerald-300 bg-emerald-900/60 border-emerald-700'
                              : 'text-slate-400 bg-slate-900 border-slate-800'
                          }`}
                        >
                          {plan.badge || (isPopular ? 'Most Popular' : 'Essential')}
                        </span>
                      </div>

                      {/* Price Display */}
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-4xl font-black text-white">
                          {billingCycle === 'annual'
                            ? formatINR(effectiveMonthly)
                            : formatINR(plan.monthlyPrice)}
                        </span>
                        <span className="text-xs text-slate-400">/ month</span>
                      </div>

                      {/* Annual Savings Notice */}
                      <div className="text-[11px] text-emerald-400 font-medium mb-3">
                        {billingCycle === 'annual' ? (
                          <span>
                            Billed annually at {formatINR(annualPrice)}/yr (Save {formatINR(annualSavings)}/yr &bull; {savingsPercent}% off)
                          </span>
                        ) : (
                          <span className="text-slate-400">Billed monthly, cancel or upgrade anytime</span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed mb-5 min-h-[34px]">
                        {plan.description || plan.target}
                      </p>

                      {/* Resource Limits Pill Box */}
                      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 mb-6 text-xs space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Tracked Ingredients:</span>
                          <span className="font-bold text-white">
                            {maxIngredients > 1000 ? 'Unlimited' : `Up to ${maxIngredients}`}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Staff Accounts:</span>
                          <span className="font-bold text-white">
                            {maxStaff > 1000 ? 'Unlimited' : `Up to ${maxStaff} users`}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Outlets / Branches:</span>
                          <span className="font-bold text-white">
                            {maxBranches > 50 ? 'Unlimited' : `${maxBranches} location${maxBranches > 1 ? 's' : ''}`}
                          </span>
                        </div>
                      </div>

                      {/* Included Features List */}
                      <div className={`space-y-3 text-xs text-slate-300 pt-4 border-t ${
                        isPopular ? 'border-emerald-900/60' : 'border-slate-800'
                      }`}>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Included Features:
                        </span>
                        {plan.features?.map((feature, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span className="leading-snug">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Link
                      to={`/signup?plan=${plan.id}`}
                      className={`mt-8 w-full py-3.5 rounded-xl font-bold text-xs text-center transition-all block shadow-sm ${
                        isPopular
                          ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-sm shadow-lg shadow-emerald-600/30'
                          : 'bg-slate-800 hover:bg-slate-700 text-white'
                      }`}
                    >
                      {plan.id === 'plan-enterprise' ? 'Get Started with Enterprise' : 'Start 14-Day Free Trial'}
                    </Link>
                  </div>
                );
              })}
          </div>

          {/* View All Features & Plan Comparison Expandable Section */}
          <div className="mb-10 rounded-3xl liquid-glass-card border border-white/10 overflow-hidden shadow-xl">
            <button
              type="button"
              onClick={() => setShowFeatureComparison((prev) => !prev)}
              className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center shrink-0">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Compare All Features, Modules &amp; Resource Limits
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Detailed side-by-side breakdown of operational capabilities for every kitchen scale
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 shrink-0 bg-emerald-950/80 px-3.5 py-2 rounded-xl border border-emerald-800/80">
                <span>{showFeatureComparison ? 'Hide Comparison' : 'View Full Comparison'}</span>
                {showFeatureComparison ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showFeatureComparison && (
              <div className="p-6 border-t border-white/10 overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 font-bold">
                      <th className="py-3.5 px-4 text-white text-sm">Capability / Feature</th>
                      <th className="py-3.5 px-4 text-center">
                        <div className="text-white font-extrabold text-sm">Starter</div>
                        <div className="text-emerald-400 font-bold text-xs">
                          {billingCycle === 'annual' ? '₹799/mo' : '₹999/mo'}
                        </div>
                      </th>
                      <th className="py-3.5 px-4 text-center bg-emerald-950/20 rounded-t-xl">
                        <div className="text-emerald-400 font-extrabold text-sm">Professional</div>
                        <div className="text-emerald-300 font-bold text-xs">
                          {billingCycle === 'annual' ? '₹1,999/mo' : '₹2,499/mo'}
                        </div>
                      </th>
                      <th className="py-3.5 px-4 text-center">
                        <div className="text-white font-extrabold text-sm">Enterprise</div>
                        <div className="text-emerald-400 font-bold text-xs">
                          {billingCycle === 'annual' ? '₹4,499/mo' : '₹5,499/mo'}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    <tr className="bg-slate-900/60 font-bold text-white">
                      <td colSpan={4} className="py-2.5 px-4 uppercase text-[10px] tracking-wider text-emerald-400">
                        Resource Allocations &amp; Tenant Limits
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-slate-200">Tracked Pantry Ingredients</td>
                      <td className="py-3 px-4 text-center font-bold text-white">Up to 100 SKUs</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-300 bg-emerald-950/20">Up to 500 SKUs</td>
                      <td className="py-3 px-4 text-center font-bold text-white">Unlimited SKUs</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-slate-200">Included Staff User Seats</td>
                      <td className="py-3 px-4 text-center font-bold text-white">Up to 5 seats</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-300 bg-emerald-950/20">Up to 15 seats</td>
                      <td className="py-3 px-4 text-center font-bold text-white">Unlimited seats</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-slate-200">Included Restaurant Outlets</td>
                      <td className="py-3 px-4 text-center font-bold text-white">1 Location</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-300 bg-emerald-950/20">Up to 3 Locations</td>
                      <td className="py-3 px-4 text-center font-bold text-white">Unlimited Outlets</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-slate-200">POS Terminals Included</td>
                      <td className="py-3 px-4 text-center font-bold text-white">1 Terminal</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-300 bg-emerald-950/20">2 Terminals</td>
                      <td className="py-3 px-4 text-center font-bold text-white">5+ Terminals</td>
                    </tr>

                    <tr className="bg-slate-900/60 font-bold text-white">
                      <td colSpan={4} className="py-2.5 px-4 uppercase text-[10px] tracking-wider text-emerald-400">
                        Core POS &amp; Dining Room Management
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-slate-200">Fast Cloud Point-of-Sale (POS)</td>
                      <td className="py-3 px-4 text-center text-emerald-400 font-bold">✔ Included</td>
                      <td className="py-3 px-4 text-center text-emerald-400 font-bold bg-emerald-950/20">✔ Included</td>
                      <td className="py-3 px-4 text-center text-emerald-400 font-bold">✔ Included</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-slate-200">Interactive Table Layout Editor</td>
                      <td className="py-3 px-4 text-center text-slate-500">—</td>
                      <td className="py-3 px-4 text-center text-emerald-400 font-bold bg-emerald-950/20">✔ Included</td>
                      <td className="py-3 px-4 text-center text-emerald-400 font-bold">✔ Included</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-slate-200">Split-Bill &amp; Multi-Payment Engine</td>
                      <td className="py-3 px-4 text-center text-slate-500">—</td>
                      <td className="py-3 px-4 text-center text-emerald-400 font-bold bg-emerald-950/20">✔ Included</td>
                      <td className="py-3 px-4 text-center text-emerald-400 font-bold">✔ Included</td>
                    </tr>

                    <tr className="bg-slate-900/60 font-bold text-white">
                      <td colSpan={4} className="py-2.5 px-4 uppercase text-[10px] tracking-wider text-emerald-400">
                        Inventory &amp; FEFO Expiry Control
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-slate-200">FEFO Expiry Queue &amp; Tracking</td>
                      <td className="py-3 px-4 text-center text-emerald-400 font-bold">✔ Standard</td>
                      <td className="py-3 px-4 text-center text-emerald-400 font-bold bg-emerald-950/20">✔ Real-time</td>
                      <td className="py-3 px-4 text-center text-emerald-400 font-bold">✔ Automated</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-slate-200">Pure SVG QR Batch Labels</td>
                      <td className="py-3 px-4 text-center text-emerald-400 font-bold">✔ Unlimited</td>
                      <td className="py-3 px-4 text-center text-emerald-400 font-bold bg-emerald-950/20">✔ Unlimited</td>
                      <td className="py-3 px-4 text-center text-emerald-400 font-bold">✔ Unlimited</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-slate-200">Central Commissary &amp; Outlet Transfers</td>
                      <td className="py-3 px-4 text-center text-slate-500">—</td>
                      <td className="py-3 px-4 text-center text-emerald-400 font-bold bg-emerald-950/20">✔ Up to 3 outlets</td>
                      <td className="py-3 px-4 text-center text-emerald-400 font-bold">✔ Multi-commissary</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-slate-200">Dock GRN &amp; Damaged Credit Claims</td>
                      <td className="py-3 px-4 text-center text-slate-500">—</td>
                      <td className="py-3 px-4 text-center text-emerald-400 font-bold bg-emerald-950/20">✔ Included</td>
                      <td className="py-3 px-4 text-center text-emerald-400 font-bold">✔ Included</td>
                    </tr>

                    <tr className="bg-slate-900/60 font-bold text-white">
                      <td colSpan={4} className="py-2.5 px-4 uppercase text-[10px] tracking-wider text-emerald-400">
                        Kitchen Execution &amp; Staff Operations
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-slate-200">Touchscreen Kitchen Station Mode</td>
                      <td className="py-3 px-4 text-center text-emerald-400 font-bold">✔ Included</td>
                      <td className="py-3 px-4 text-center text-emerald-400 font-bold bg-emerald-950/20">✔ Multi-station</td>
                      <td className="py-3 px-4 text-center text-emerald-400 font-bold">✔ Multi-station</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-slate-200">Staff Shift Clock &amp; Attendance</td>
                      <td className="py-3 px-4 text-center text-emerald-400 font-bold">✔ Included</td>
                      <td className="py-3 px-4 text-center text-emerald-400 font-bold bg-emerald-950/20">✔ Included</td>
                      <td className="py-3 px-4 text-center text-emerald-400 font-bold">✔ Included</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-slate-200">Role-Based Security &amp; Permissions</td>
                      <td className="py-3 px-4 text-center text-emerald-400 font-bold">✔ Included</td>
                      <td className="py-3 px-4 text-center text-emerald-400 font-bold bg-emerald-950/20">✔ Granular RBAC</td>
                      <td className="py-3 px-4 text-center text-emerald-400 font-bold">✔ Enterprise RBAC</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Custom Enterprise Callout */}
          <div className="rounded-3xl liquid-glass-card border border-white/10 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
                Large Restaurant Group or Multi-Branch Commissary?
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Build a Custom Plan Tailored to Your Specific Kitchen Scale
              </h3>
              <p className="text-xs text-slate-300 max-w-xl">
                Configure your exact number of locations, user seats, POS terminals, and dedicated central commissaries with volume pricing.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <Link
                to="/signup?plan=plan-custom"
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 transition-colors flex items-center justify-center gap-2"
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

      {/* 8. FAQ ACCORDION */}
      <section id="faq" className="py-20 lg:py-28 relative scroll-mt-24 sm:scroll-mt-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="reveal-on-scroll text-center mb-16">
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
                  className={`reveal-on-scroll stagger-${Math.min(idx + 1, 6)} motion-card rounded-2xl liquid-glass-card border ${
                    isOpen ? 'border-emerald-500/40 shadow-lg shadow-emerald-950/20' : 'border-white/10'
                  } overflow-hidden transition-all duration-200`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-white/5 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 outline-none"
                    aria-expanded={isOpen}
                  >
                    <span className={`text-sm sm:text-base font-bold transition-colors ${isOpen ? 'text-emerald-300' : 'text-white'}`}>
                      {item.q}
                    </span>
                    <span className="p-1 rounded-lg bg-slate-800 text-slate-300 shrink-0">
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-400' : ''}`} />
                    </span>
                  </button>

                  <div className={`accordion-content ${isOpen ? 'is-open' : ''}`}>
                    <div className="accordion-inner">
                      <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-3">
                        {item.a}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. BOTTOM CALL TO ACTION BANNER */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="reveal-on-scroll motion-card rounded-3xl bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-900 p-8 sm:p-14 border border-emerald-500/40 shadow-2xl relative overflow-hidden text-center backdrop-blur-xl hover:border-emerald-400/60 hover:shadow-emerald-950/50">
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
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-extrabold text-base shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <span>Start 14-Day Free Trial</span>
                  <ArrowRight className="w-5 h-5 text-slate-950" />
                </Link>

                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-950/90 hover:bg-emerald-950 text-white font-bold text-base border border-emerald-400/50 transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  <span>Sign In to Your Account</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. ENTERPRISE SAAS FOOTER */}
      <footer className="border-t border-white/10 pt-16 pb-12 text-slate-400 text-xs bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-white/10">
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
              <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
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
                <li>
                  <Link to="/supplier-portal" className="hover:text-emerald-400 transition-colors">
                    Supplier Portal
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

export default LandingPage;
