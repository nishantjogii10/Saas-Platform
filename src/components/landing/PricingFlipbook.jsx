import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Check,
  Sparkles,
  Sliders,
  ChefHat,
  Monitor,
  ShieldCheck,
  Building2,
  Users,
  UtensilsCrossed,
  ArrowRight,
  HelpCircle,
  Clock,
  Layers,
  Table,
  Bike,
  Plus,
  Store,
  Tablet,
  Award,
} from 'lucide-react';
import { BASE_PLANS } from '../../services/pricingEngine';

/**
 * StockMate 3D Interactive Subscription Pricing Flipbook
 *
 * An editorial magazine-style 3D page-flip brochure presenting StockMate's
 * restaurant inventory and kitchen OS subscription plans.
 *
 * Palette:
 * - Deep forest green: #0b1d16
 * - Dark green (casing): #071510
 * - Emerald accent: #10B981
 * - Warm cream page: #f4f1ea
 * - Dark editorial text: #17231d
 */
export const PricingFlipbook = ({
  plans: dynamicPlans,
  billingCycle = 'monthly',
  setBillingCycle,
  customPlanModules = [],
  pricingUnitRates = {},
  onOpenCustomBuilder,
  onToggleDetailedComparison,
  formatINR,
}) => {
  // Format currency helper fallback
  const currencyFormatter = useCallback(
    (num) => {
      if (typeof formatINR === 'function') return formatINR(num);
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(num);
    },
    [formatINR]
  );

  // Normalize active standard plans
  const standardPlans = useMemo(() => {
    const list = dynamicPlans && dynamicPlans.length > 0 ? dynamicPlans : Object.values(BASE_PLANS);
    return {
      starter: list.find((p) => p.id === 'plan-starter') || BASE_PLANS['plan-starter'],
      pro: list.find((p) => p.id === 'plan-pro') || BASE_PLANS['plan-pro'],
      enterprise: list.find((p) => p.id === 'plan-enterprise') || BASE_PLANS['plan-enterprise'],
      custom: list.find((p) => p.id === 'plan-custom') || BASE_PLANS['plan-custom'],
    };
  }, [dynamicPlans]);

  // Total pages: 6
  // Spread 0: Left = Page 0 (Cover), Right = Page 1 (Starter)
  // Spread 1: Left = Page 2 (Professional), Right = Page 3 (Enterprise)
  // Spread 2: Left = Page 4 (Custom Plan), Right = Page 5 (Comparison & Closing)
  const TOTAL_PAGES = 6;
  const TOTAL_SPREADS = 3;

  // Viewport & device detection
  const [isMobile, setIsMobile] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Pagination states
  const [currentSpread, setCurrentSpread] = useState(0); // For 2-page desktop (0, 1, 2)
  const [currentPage, setCurrentPage] = useState(0); // For 1-page mobile (0 to 5)

  // Flip animation states
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState('next'); // 'next' | 'prev'
  const [flipProgress, setFlipProgress] = useState(0); // 0 to 1

  // Container refs for fullscreen and pointer tracking
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragDeltaXRef = useRef(0);
  const animFrameRef = useRef(null);

  // Screen size detection
  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreen();
    window.addEventListener('resize', checkScreen, { passive: true });
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  // Reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'f' || e.key === 'F') {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Animated turn execution
  const executeFlip = useCallback(
    (direction, onComplete) => {
      if (isFlipping) return;

      if (prefersReducedMotion) {
        onComplete();
        return;
      }

      setIsFlipping(true);
      setFlipDirection(direction);
      setFlipProgress(0);

      const duration = 650; // ms
      const startTime = performance.now();

      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Smooth cubic ease out
        const eased = 1 - Math.pow(1 - progress, 3);
        setFlipProgress(eased);

        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(step);
        } else {
          setIsFlipping(false);
          setFlipProgress(0);
          onComplete();
        }
      };

      animFrameRef.current = requestAnimationFrame(step);
    },
    [isFlipping, prefersReducedMotion]
  );

  // Turn Forward (Next)
  const handleNext = useCallback(() => {
    if (isFlipping) return;

    if (isMobile) {
      if (currentPage < TOTAL_PAGES - 1) {
        executeFlip('next', () => setCurrentPage((p) => p + 1));
      }
    } else {
      if (currentSpread < TOTAL_SPREADS - 1) {
        executeFlip('next', () => setCurrentSpread((s) => s + 1));
      }
    }
  }, [isFlipping, isMobile, currentPage, currentSpread, executeFlip]);

  // Turn Backward (Prev)
  const handlePrev = useCallback(() => {
    if (isFlipping) return;

    if (isMobile) {
      if (currentPage > 0) {
        executeFlip('prev', () => setCurrentPage((p) => p - 1));
      }
    } else {
      if (currentSpread > 0) {
        executeFlip('prev', () => setCurrentSpread((s) => s - 1));
      }
    }
  }, [isFlipping, isMobile, currentPage, currentSpread, executeFlip]);

  // Direct Jump to a specific spread / page
  const jumpToSpread = (spreadIdx) => {
    if (isFlipping || spreadIdx === currentSpread) return;
    const dir = spreadIdx > currentSpread ? 'next' : 'prev';
    executeFlip(dir, () => setCurrentSpread(spreadIdx));
  };

  const jumpToPage = (pageIdx) => {
    if (isFlipping || pageIdx === currentPage) return;
    const dir = pageIdx > currentPage ? 'next' : 'prev';
    executeFlip(dir, () => setCurrentPage(pageIdx));
  };

  // Pointer / Drag gesture handlers
  const handlePointerDown = (clientX, isRightSide) => {
    if (isFlipping) return;
    isDraggingRef.current = true;
    dragStartXRef.current = clientX;
    dragDeltaXRef.current = 0;
  };

  const handlePointerMove = (clientX) => {
    if (!isDraggingRef.current) return;
    dragDeltaXRef.current = clientX - dragStartXRef.current;
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const delta = dragDeltaXRef.current;

    // Drag threshold: 45px
    if (delta < -45) {
      // Swiped left -> Next
      handleNext();
    } else if (delta > 45) {
      // Swiped right -> Prev
      handlePrev();
    }
  };

  // Cleanup anim frame
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Compute pricing values dynamically based on selected billing cycle
  const getPlanPricing = (plan) => {
    if (!plan) return { displayMonthly: 0, annualTotal: 0, annualSavings: 0, savingsPercent: 20 };
    const monthlyRate = Number(plan.monthlyPrice) || 0;
    const annualRate = plan.annualPrice ?? Math.round(monthlyRate * 12 * 0.8);
    const annualSavings = plan.annualSavings ?? Math.max(0, monthlyRate * 12 - annualRate);
    const savingsPercent =
      plan.savingsPercent ?? (monthlyRate > 0 ? Math.round((annualSavings / (monthlyRate * 12)) * 100) : 20);
    const effectiveMonthly = plan.effectiveMonthlyAnnual ?? Math.round(annualRate / 12);

    return {
      monthlyRate,
      annualRate,
      annualSavings,
      savingsPercent,
      effectiveMonthly,
      displayMonthly: billingCycle === 'annual' ? effectiveMonthly : monthlyRate,
    };
  };

  const starterPricing = getPlanPricing(standardPlans.starter);
  const proPricing = getPlanPricing(standardPlans.pro);
  const enterprisePricing = getPlanPricing(standardPlans.enterprise);

  // Custom Plan base module pricing
  const basePosMod = (customPlanModules || []).find((m) => m.id === 'pos_billing');
  const baseMonthlyRate = basePosMod?.monthlyPrice || 599;
  const baseAnnualRate = basePosMod?.annualPrice || 5748;
  const customBaseEffective = Math.round(baseAnnualRate / 12);
  const customDisplayPrice = billingCycle === 'annual' ? customBaseEffective : baseMonthlyRate;

  // ==========================================================================
  // RENDER INDIVIDUAL BROCHURE PAGES (0 to 5)
  // ==========================================================================

  // PAGE 0: EDITORIAL COVER
  const renderCoverPage = (side = 'left') => (
    <div className="h-full flex flex-col justify-between p-6 sm:p-8 lg:p-10 select-none relative overflow-hidden bg-[#f4f1ea] text-[#17231d]">
      {/* Editorial Watermark & Filigree Corners */}
      <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#10B981]/40 pointer-events-none" />
      <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#10B981]/40 pointer-events-none" />
      <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#10B981]/40 pointer-events-none" />
      <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#10B981]/40 pointer-events-none" />

      {/* Top Header Masthead */}
      <div>
        <div className="flex items-center justify-between border-b border-[#17231d]/15 pb-3">
          <span className="text-[10px] sm:text-[11px] font-mono tracking-widest uppercase text-[#17231d]/70 font-semibold">
            StockMate Systems • Vol. IV
          </span>
          <span className="text-[10px] sm:text-[11px] font-mono tracking-wider uppercase text-[#10B981] font-bold">
            Subscription Portfolio • 2026
          </span>
        </div>

        {/* Brand Crest */}
        <div className="mt-8 sm:mt-10 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#0b1d16] flex items-center justify-center text-[#10B981] shadow-md border border-[#10B981]/30">
            <UtensilsCrossed className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black tracking-tight text-[#0b1d16] font-serif-editorial">
              StockMate
            </div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#17231d]/60">
              Kitchen OS &amp; Inventory Suite
            </div>
          </div>
        </div>
      </div>

      {/* Centerpiece Title & Architectural Sketch */}
      <div className="my-auto py-6 sm:py-8 space-y-4">
        <div className="inline-block px-3 py-1 rounded-full bg-[#10B981]/15 text-[#0b1d16] text-[10px] font-mono uppercase font-bold tracking-wider border border-[#10B981]/30">
          Executive Edition
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif-editorial text-[#0b1d16] font-bold leading-[1.1] tracking-tight">
          Inventory Clarity.{' '}
          <span className="italic font-normal text-[#059669] block mt-1">Restaurant Growth.</span>
        </h1>

        <p className="text-xs sm:text-sm text-[#17231d]/80 leading-relaxed font-sans max-w-md">
          A unified operational platform for high-volume restaurants, cloud commissaries, and expanding dining rooms.
          Continuous ingredient traceability, automated FEFO dispatch, live dock receiving, and real-time recipe margins.
        </p>

        {/* Minimal Culinary Geometry Emblem */}
        <div className="pt-2 flex items-center gap-4 text-[#17231d]/60 text-xs">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <Check className="w-3.5 h-3.5 text-[#10B981]" />
            <span>14-Day Free Commercial Trial</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <Check className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Single Source-of-Truth</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer & Page Turn Affordance */}
      <div className="pt-4 border-t border-[#17231d]/15 flex items-center justify-between text-xs">
        <span className="text-[11px] font-mono text-[#17231d]/60">Published for Executive Chefs &amp; Operators</span>
        <span className="font-mono text-[11px] font-bold text-[#059669] flex items-center gap-1">
          <span>Turn Page</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );

  // PAGE 1: STARTER PLAN
  const renderStarterPage = (side = 'right') => (
    <div className="h-full flex flex-col justify-between p-6 sm:p-8 lg:p-10 select-none relative overflow-hidden bg-[#f4f1ea] text-[#17231d]">
      {/* Page Header */}
      <div>
        <div className="flex items-center justify-between border-b border-[#17231d]/15 pb-2.5">
          <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#17231d]/60 font-semibold">
            Section 01 • The Foundation Tier
          </span>
          <span className="text-[10px] font-mono bg-[#0b1d16] text-[#f4f1ea] px-2 py-0.5 rounded font-bold">
            Page 02
          </span>
        </div>

        <div className="mt-4 flex items-baseline justify-between">
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#059669]">
            Single-Outlet Specialty
          </span>
          <span className="text-[10px] font-mono text-[#17231d]/60 border border-[#17231d]/20 px-2 py-0.5 rounded-full">
            Entry Standard
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif-editorial text-[#0b1d16] font-bold mt-1">
          {standardPlans.starter.name} Plan
        </h2>

        <p className="text-xs text-[#17231d]/75 mt-1.5 leading-relaxed font-sans line-clamp-2">
          {standardPlans.starter.target || 'Ideal for boutique cafes, bakeries, and single-unit cloud kitchens.'}
        </p>
      </div>

      {/* Pricing Module Box */}
      <div className="my-3 p-3.5 sm:p-4 rounded-2xl bg-[#0b1d16]/5 border border-[#0b1d16]/10">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-serif-editorial font-bold text-[#0b1d16]">
            {currencyFormatter(starterPricing.displayMonthly)}
          </span>
          <span className="text-xs font-mono text-[#17231d]/60">/ month</span>
        </div>

        <div className="text-[11px] font-mono text-[#059669] font-semibold mt-1">
          {billingCycle === 'annual' ? (
            <span>
              Billed annually at {currencyFormatter(starterPricing.annualRate)}/yr (Save{' '}
              {currencyFormatter(starterPricing.annualSavings)}/yr • {starterPricing.savingsPercent}% off)
            </span>
          ) : (
            <span className="text-[#17231d]/60">Billed monthly, switch to annual anytime for 20% savings</span>
          )}
        </div>
      </div>

      {/* Resource Allocation Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="p-2 sm:p-2.5 rounded-xl bg-white/70 border border-[#17231d]/10">
          <span className="text-[10px] text-[#17231d]/60 block">Included Outlets</span>
          <strong className="text-xs text-[#0b1d16] font-bold">1 Location</strong>
        </div>
        <div className="p-2 sm:p-2.5 rounded-xl bg-white/70 border border-[#17231d]/10">
          <span className="text-[10px] text-[#17231d]/60 block">Staff User Seats</span>
          <strong className="text-xs text-[#0b1d16] font-bold">5 Staff Accounts</strong>
        </div>
        <div className="p-2 sm:p-2.5 rounded-xl bg-white/70 border border-[#17231d]/10">
          <span className="text-[10px] text-[#17231d]/60 block">Tracked Pantry SKUs</span>
          <strong className="text-xs text-[#0b1d16] font-bold">Up to 500 Ingredients</strong>
        </div>
        <div className="p-2 sm:p-2.5 rounded-xl bg-white/70 border border-[#17231d]/10">
          <span className="text-[10px] text-[#17231d]/60 block">POS Terminals</span>
          <strong className="text-xs text-[#0b1d16] font-bold">1 Station Included</strong>
        </div>
      </div>

      {/* Included Features Bullet Points */}
      <div className="my-2 space-y-1.5 text-xs text-[#17231d]/85">
        <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#17231d]/50 block">
          Core Capabilities:
        </span>
        {standardPlans.starter.features?.slice(0, 5).map((f, i) => (
          <div key={i} className="flex items-start gap-2">
            <Check className="w-3.5 h-3.5 text-[#059669] shrink-0 mt-0.5" />
            <span className="leading-tight text-[11px] sm:text-xs font-sans">{f}</span>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <div className="pt-2">
        <Link
          to="/signup?plan=plan-starter"
          onClick={(e) => e.stopPropagation()}
          className="w-full py-2.5 sm:py-3 rounded-xl bg-[#0b1d16] hover:bg-[#071510] text-[#f4f1ea] font-sans font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] border border-[#10B981]/30"
        >
          <span>Choose Starter Plan</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#10B981]" />
        </Link>
        <div className="text-[10px] font-mono text-center text-[#17231d]/50 mt-1.5">
          14-Day Free Commercial Trial • Instant Tenant Provisioning
        </div>
      </div>
    </div>
  );

  // PAGE 2: PROFESSIONAL PLAN (MOST POPULAR)
  const renderProPage = (side = 'left') => (
    <div className="h-full flex flex-col justify-between p-6 sm:p-8 lg:p-10 select-none relative overflow-hidden bg-[#f4f1ea] text-[#17231d]">
      {/* Decorative Gold / Emerald Foil Accent Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#059669] via-[#10B981] to-[#047857]" />

      {/* Page Header */}
      <div>
        <div className="flex items-center justify-between border-b border-[#17231d]/15 pb-2.5">
          <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#059669] font-bold flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-[#059669]" />
            <span>Section 02 • Most Popular Choice</span>
          </span>
          <span className="text-[10px] font-mono bg-[#059669] text-white px-2 py-0.5 rounded font-bold">
            Page 03
          </span>
        </div>

        <div className="mt-4 flex items-baseline justify-between">
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#059669]">
            The Multi-Outlet Standard
          </span>
          <span className="text-[10px] font-mono bg-[#10B981]/20 text-[#065F46] border border-[#10B981]/40 px-2 py-0.5 rounded-full font-bold">
            Recommended
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif-editorial text-[#0b1d16] font-bold mt-1">
          {standardPlans.pro.name} Plan
        </h2>

        <p className="text-xs text-[#17231d]/75 mt-1.5 leading-relaxed font-sans line-clamp-2">
          {standardPlans.pro.target ||
            'The operational benchmark for growing restaurants, busy bistros, and multi-station kitchens.'}
        </p>
      </div>

      {/* Pricing Module Box (Highlighted Emerald Tint) */}
      <div className="my-3 p-3.5 sm:p-4 rounded-2xl bg-[#059669]/10 border border-[#059669]/25">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-serif-editorial font-bold text-[#0b1d16]">
            {currencyFormatter(proPricing.displayMonthly)}
          </span>
          <span className="text-xs font-mono text-[#17231d]/60">/ month</span>
        </div>

        <div className="text-[11px] font-mono text-[#059669] font-semibold mt-1">
          {billingCycle === 'annual' ? (
            <span>
              Billed annually at {currencyFormatter(proPricing.annualRate)}/yr (Save{' '}
              {currencyFormatter(proPricing.annualSavings)}/yr • {proPricing.savingsPercent}% off)
            </span>
          ) : (
            <span className="text-[#17231d]/60">Billed monthly, cancel or upgrade anytime</span>
          )}
        </div>
      </div>

      {/* Resource Allocation Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="p-2 sm:p-2.5 rounded-xl bg-white/80 border border-[#059669]/20 shadow-xs">
          <span className="text-[10px] text-[#17231d]/60 block">Included Outlets</span>
          <strong className="text-xs text-[#059669] font-bold">Up to 3 Locations</strong>
        </div>
        <div className="p-2 sm:p-2.5 rounded-xl bg-white/80 border border-[#059669]/20 shadow-xs">
          <span className="text-[10px] text-[#17231d]/60 block">Staff User Seats</span>
          <strong className="text-xs text-[#059669] font-bold">15 Staff Accounts</strong>
        </div>
        <div className="p-2 sm:p-2.5 rounded-xl bg-white/80 border border-[#059669]/20 shadow-xs">
          <span className="text-[10px] text-[#17231d]/60 block">Tracked Pantry SKUs</span>
          <strong className="text-xs text-[#059669] font-bold">Unlimited SKUs</strong>
        </div>
        <div className="p-2 sm:p-2.5 rounded-xl bg-white/80 border border-[#059669]/20 shadow-xs">
          <span className="text-[10px] text-[#17231d]/60 block">POS Terminals</span>
          <strong className="text-xs text-[#059669] font-bold">2 Stations Included</strong>
        </div>
      </div>

      {/* Included Features Bullet Points */}
      <div className="my-2 space-y-1.5 text-xs text-[#17231d]/85">
        <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#17231d]/50 block">
          Everything in Starter, plus:
        </span>
        {standardPlans.pro.features?.slice(1, 6).map((f, i) => (
          <div key={i} className="flex items-start gap-2">
            <Check className="w-3.5 h-3.5 text-[#059669] shrink-0 mt-0.5" />
            <span className="leading-tight text-[11px] sm:text-xs font-sans">{f}</span>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <div className="pt-2">
        <Link
          to="/signup?plan=plan-pro"
          onClick={(e) => e.stopPropagation()}
          className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#059669] via-[#10B981] to-[#047857] hover:from-[#047857] hover:to-[#065F46] text-white font-sans font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#059669]/25 transition-all active:scale-[0.99]"
        >
          <span>Choose Professional Plan</span>
          <ArrowRight className="w-3.5 h-3.5 text-white" />
        </Link>
        <div className="text-[10px] font-mono text-center text-[#17231d]/50 mt-1.5">
          14-Day Free Trial • Priority 2h SLA Support
        </div>
      </div>
    </div>
  );

  // PAGE 3: ENTERPRISE PLAN
  const renderEnterprisePage = (side = 'right') => (
    <div className="h-full flex flex-col justify-between p-6 sm:p-8 lg:p-10 select-none relative overflow-hidden bg-[#f4f1ea] text-[#17231d]">
      {/* Page Header */}
      <div>
        <div className="flex items-center justify-between border-b border-[#17231d]/15 pb-2.5">
          <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#17231d]/60 font-semibold">
            Section 03 • Institutional Scale
          </span>
          <span className="text-[10px] font-mono bg-[#0b1d16] text-[#f4f1ea] px-2 py-0.5 rounded font-bold">
            Page 04
          </span>
        </div>

        <div className="mt-4 flex items-baseline justify-between">
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#059669]">
            Franchise &amp; Commissary
          </span>
          <span className="text-[10px] font-mono text-[#17231d]/60 border border-[#17231d]/20 px-2 py-0.5 rounded-full">
            Full Operations
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif-editorial text-[#0b1d16] font-bold mt-1">
          {standardPlans.enterprise.name} Plan
        </h2>

        <p className="text-xs text-[#17231d]/75 mt-1.5 leading-relaxed font-sans line-clamp-2">
          {standardPlans.enterprise.target ||
            'Architected for restaurant groups, central commissaries, and multi-unit franchises.'}
        </p>
      </div>

      {/* Pricing Module Box */}
      <div className="my-3 p-3.5 sm:p-4 rounded-2xl bg-[#0b1d16]/5 border border-[#0b1d16]/10">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-serif-editorial font-bold text-[#0b1d16]">
            {currencyFormatter(enterprisePricing.displayMonthly)}
          </span>
          <span className="text-xs font-mono text-[#17231d]/60">/ month</span>
        </div>

        <div className="text-[11px] font-mono text-[#059669] font-semibold mt-1">
          {billingCycle === 'annual' ? (
            <span>
              Billed annually at {currencyFormatter(enterprisePricing.annualRate)}/yr (Save{' '}
              {currencyFormatter(enterprisePricing.annualSavings)}/yr • {enterprisePricing.savingsPercent}% off)
            </span>
          ) : (
            <span className="text-[#17231d]/60">Dedicated account manager with 1h SLA</span>
          )}
        </div>
      </div>

      {/* Resource Allocation Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="p-2 sm:p-2.5 rounded-xl bg-white/70 border border-[#17231d]/10">
          <span className="text-[10px] text-[#17231d]/60 block">Included Outlets</span>
          <strong className="text-xs text-[#0b1d16] font-bold">10 Locations (Expandable)</strong>
        </div>
        <div className="p-2 sm:p-2.5 rounded-xl bg-white/70 border border-[#17231d]/10">
          <span className="text-[10px] text-[#17231d]/60 block">Staff User Seats</span>
          <strong className="text-xs text-[#0b1d16] font-bold">50+ Staff Accounts</strong>
        </div>
        <div className="p-2 sm:p-2.5 rounded-xl bg-white/70 border border-[#17231d]/10">
          <span className="text-[10px] text-[#17231d]/60 block">Tracked SKUs &amp; Lots</span>
          <strong className="text-xs text-[#0b1d16] font-bold">Unlimited SKUs &amp; Batches</strong>
        </div>
        <div className="p-2 sm:p-2.5 rounded-xl bg-white/70 border border-[#17231d]/10">
          <span className="text-[10px] text-[#17231d]/60 block">POS Terminals</span>
          <strong className="text-xs text-[#0b1d16] font-bold">5 Stations Included</strong>
        </div>
      </div>

      {/* Included Features Bullet Points */}
      <div className="my-2 space-y-1.5 text-xs text-[#17231d]/85">
        <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#17231d]/50 block">
          Enterprise Capabilities:
        </span>
        {standardPlans.enterprise.features?.slice(1, 6).map((f, i) => (
          <div key={i} className="flex items-start gap-2">
            <Check className="w-3.5 h-3.5 text-[#059669] shrink-0 mt-0.5" />
            <span className="leading-tight text-[11px] sm:text-xs font-sans">{f}</span>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <div className="pt-2">
        <Link
          to="/signup?plan=plan-enterprise"
          onClick={(e) => e.stopPropagation()}
          className="w-full py-2.5 sm:py-3 rounded-xl bg-[#0b1d16] hover:bg-[#071510] text-[#f4f1ea] font-sans font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] border border-[#10B981]/30"
        >
          <span>Choose Enterprise Plan</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#10B981]" />
        </Link>
        <div className="text-[10px] font-mono text-center text-[#17231d]/50 mt-1.5">
          Custom SLA Agreements • ERP &amp; Tally / SAP Integration
        </div>
      </div>
    </div>
  );

  // PAGE 4: CUSTOM PLAN (MODULAR WORKSHOP)
  const renderCustomPage = (side = 'left') => (
    <div className="h-full flex flex-col justify-between p-6 sm:p-8 lg:p-10 select-none relative overflow-hidden bg-[#f4f1ea] text-[#17231d]">
      {/* Page Header */}
      <div>
        <div className="flex items-center justify-between border-b border-[#17231d]/15 pb-2.5">
          <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#17231d]/60 font-semibold">
            Section 04 • Modular Deployment
          </span>
          <span className="text-[10px] font-mono bg-[#0b1d16] text-[#f4f1ea] px-2 py-0.5 rounded font-bold">
            Page 05
          </span>
        </div>

        <div className="mt-4 flex items-baseline justify-between">
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#059669]">
            Bespoke Architecture
          </span>
          <span className="text-[10px] font-mono bg-[#10B981]/15 text-[#065F46] border border-[#10B981]/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
            <Sliders className="w-2.5 h-2.5" />
            <span>Interactive Builder</span>
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif-editorial text-[#0b1d16] font-bold mt-1">
          Build Your Own Plan
        </h2>

        <p className="text-xs text-[#17231d]/75 mt-1.5 leading-relaxed font-sans line-clamp-2">
          Select only the modules your kitchen uses. Assemble your technology stack with transparent prorated billing.
        </p>
      </div>

      {/* Pricing Module Box */}
      <div className="my-3 p-3.5 sm:p-4 rounded-2xl bg-[#0b1d16]/5 border border-[#0b1d16]/10">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-mono text-[#17231d]/60">Starts at</span>
          <span className="text-3xl sm:text-4xl font-serif-editorial font-bold text-[#0b1d16]">
            {currencyFormatter(customDisplayPrice)}
          </span>
          <span className="text-xs font-mono text-[#17231d]/60">/ month</span>
        </div>

        <div className="text-[11px] font-mono text-[#059669] font-semibold mt-1">
          {billingCycle === 'annual' ? (
            <span>Base starts at {currencyFormatter(baseAnnualRate)}/yr (Save ~20% on all modules)</span>
          ) : (
            <span className="text-[#17231d]/60">Select only what you use, cancel anytime</span>
          )}
        </div>
      </div>

      {/* Modular Chips Sample Grid */}
      <div>
        <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#17231d]/50 block mb-1.5">
          Configurable Capabilities:
        </span>
        <div className="grid grid-cols-2 gap-1.5 text-[11px] font-sans">
          <div className="p-2 rounded-xl bg-white/80 border border-[#17231d]/10 flex items-center justify-between">
            <span className="font-bold text-[#0b1d16] truncate">Base Cloud POS</span>
            <span className="font-mono text-[#059669] text-[10px] font-bold">₹599/mo</span>
          </div>
          <div className="p-2 rounded-xl bg-white/80 border border-[#17231d]/10 flex items-center justify-between">
            <span className="font-bold text-[#0b1d16] truncate">Recipe Costing</span>
            <span className="font-mono text-[#059669] text-[10px] font-bold">+₹600/mo</span>
          </div>
          <div className="p-2 rounded-xl bg-white/80 border border-[#17231d]/10 flex items-center justify-between">
            <span className="font-bold text-[#0b1d16] truncate">Aggregator Sync</span>
            <span className="font-mono text-[#059669] text-[10px] font-bold">+₹400/mo</span>
          </div>
          <div className="p-2 rounded-xl bg-white/80 border border-[#17231d]/10 flex items-center justify-between">
            <span className="font-bold text-[#0b1d16] truncate">Captain Tablet</span>
            <span className="font-mono text-[#059669] text-[10px] font-bold">+₹300/mo</span>
          </div>
          <div className="p-2 rounded-xl bg-white/80 border border-[#17231d]/10 flex items-center justify-between">
            <span className="font-bold text-[#0b1d16] truncate">Multi-Store</span>
            <span className="font-mono text-[#059669] text-[10px] font-bold">+₹800/mo</span>
          </div>
          <div className="p-2 rounded-xl bg-white/80 border border-[#17231d]/10 flex items-center justify-between">
            <span className="font-bold text-[#0b1d16] truncate">Extra Terminal</span>
            <span className="font-mono text-[#059669] text-[10px] font-bold">+₹250/ea</span>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (typeof onOpenCustomBuilder === 'function') onOpenCustomBuilder();
          }}
          className="w-full py-2.5 sm:py-3 rounded-xl bg-[#0b1d16] hover:bg-[#071510] text-[#f4f1ea] font-sans font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] border border-[#10B981]/30 cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Launch Interactive Plan Builder</span>
        </button>
        <div className="text-[10px] font-mono text-center text-[#17231d]/50 mt-1.5">
          Live Real-Time Pricing Calculator • Instant Automated Setup
        </div>
      </div>
    </div>
  );

  // PAGE 5: COMPARISON & CLOSING
  const renderComparisonPage = (side = 'right') => (
    <div className="h-full flex flex-col justify-between p-6 sm:p-8 lg:p-10 select-none relative overflow-hidden bg-[#f4f1ea] text-[#17231d]">
      {/* Page Header */}
      <div>
        <div className="flex items-center justify-between border-b border-[#17231d]/15 pb-2.5">
          <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#17231d]/60 font-semibold">
            Section 05 • Decision Matrix
          </span>
          <span className="text-[10px] font-mono bg-[#0b1d16] text-[#f4f1ea] px-2 py-0.5 rounded font-bold">
            Page 06
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif-editorial text-[#0b1d16] font-bold mt-3">
          Plan Decision Matrix
        </h2>

        <p className="text-[11px] sm:text-xs text-[#17231d]/70 leading-relaxed font-sans mt-0.5">
          Side-by-side comparison of essential capabilities across tiers.
        </p>
      </div>

      {/* Condensed Editorial Comparison Table */}
      <div className="my-2 rounded-xl border border-[#17231d]/15 overflow-hidden bg-white/70">
        <table className="w-full text-[10px] sm:text-[11px] text-left border-collapse font-sans">
          <thead>
            <tr className="bg-[#0b1d16] text-[#f4f1ea] font-mono">
              <th className="py-1.5 px-2.5 font-bold">Feature</th>
              <th className="py-1.5 px-2 text-center">Starter</th>
              <th className="py-1.5 px-2 text-center bg-[#059669]">Pro</th>
              <th className="py-1.5 px-2 text-center">Enterprise</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#17231d]/10 text-[#17231d]">
            <tr>
              <td className="py-1.5 px-2.5 font-bold text-[#0b1d16]">Monthly Price</td>
              <td className="py-1.5 px-2 text-center font-mono">₹999</td>
              <td className="py-1.5 px-2 text-center font-mono font-bold bg-[#059669]/10 text-[#059669]">₹2,499</td>
              <td className="py-1.5 px-2 text-center font-mono">₹5,499</td>
            </tr>
            <tr>
              <td className="py-1.5 px-2.5 font-bold text-[#0b1d16]">Outlets Included</td>
              <td className="py-1.5 px-2 text-center">1</td>
              <td className="py-1.5 px-2 text-center font-bold bg-[#059669]/10 text-[#059669]">Up to 3</td>
              <td className="py-1.5 px-2 text-center">10+</td>
            </tr>
            <tr>
              <td className="py-1.5 px-2.5 font-bold text-[#0b1d16]">Staff Accounts</td>
              <td className="py-1.5 px-2 text-center">5</td>
              <td className="py-1.5 px-2 text-center font-bold bg-[#059669]/10 text-[#059669]">15</td>
              <td className="py-1.5 px-2 text-center">50+</td>
            </tr>
            <tr>
              <td className="py-1.5 px-2.5 font-bold text-[#0b1d16]">Pantry Ingredients</td>
              <td className="py-1.5 px-2 text-center">500 SKUs</td>
              <td className="py-1.5 px-2 text-center font-bold bg-[#059669]/10 text-[#059669]">Unlimited</td>
              <td className="py-1.5 px-2 text-center">Unlimited</td>
            </tr>
            <tr>
              <td className="py-1.5 px-2.5 font-bold text-[#0b1d16]">Live Recipe BOMs</td>
              <td className="py-1.5 px-2 text-center text-[#17231d]/40">—</td>
              <td className="py-1.5 px-2 text-center font-bold bg-[#059669]/10 text-[#059669]">Included</td>
              <td className="py-1.5 px-2 text-center">Advanced</td>
            </tr>
            <tr>
              <td className="py-1.5 px-2.5 font-bold text-[#0b1d16]">Central Commissary</td>
              <td className="py-1.5 px-2 text-center text-[#17231d]/40">—</td>
              <td className="py-1.5 px-2 text-center text-[#17231d]/40 bg-[#059669]/10">—</td>
              <td className="py-1.5 px-2 text-center font-bold text-[#059669]">Included</td>
            </tr>
            <tr>
              <td className="py-1.5 px-2.5 font-bold text-[#0b1d16]">Support SLA</td>
              <td className="py-1.5 px-2 text-center">24h Email</td>
              <td className="py-1.5 px-2 text-center font-bold bg-[#059669]/10 text-[#059669]">2h Live Chat</td>
              <td className="py-1.5 px-2 text-center">1h Dedicated</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* StockMate Guarantee Banner */}
      <div className="p-3 rounded-xl bg-[#059669]/10 border border-[#059669]/25 text-xs">
        <strong className="text-[#059669] font-bold font-mono block text-[10px] uppercase">
          The StockMate Guarantee
        </strong>
        <p className="text-[11px] text-[#17231d]/80 mt-0.5 leading-snug">
          All subscriptions include a 14-day fully featured commercial trial. No hardware lock-in. Cancel or upgrade
          anytime.
        </p>
      </div>

      {/* Closing Actions */}
      <div className="pt-2 space-y-1.5">
        <Link
          to="/signup"
          onClick={(e) => e.stopPropagation()}
          className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#059669] to-[#047857] hover:from-[#047857] hover:to-[#065F46] text-white font-sans font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
        >
          <span>Start 14-Day Free Commercial Trial</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        {typeof onToggleDetailedComparison === 'function' && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleDetailedComparison();
            }}
            className="w-full text-center text-[11px] text-[#059669] hover:underline font-mono py-1 cursor-pointer"
          >
            Expand Detailed Specifications Table &darr;
          </button>
        )}
      </div>
    </div>
  );

  // Map page index to page component
  const getPageComponent = (pageIndex, side) => {
    switch (pageIndex) {
      case 0:
        return renderCoverPage(side);
      case 1:
        return renderStarterPage(side);
      case 2:
        return renderProPage(side);
      case 3:
        return renderEnterprisePage(side);
      case 4:
        return renderCustomPage(side);
      case 5:
        return renderComparisonPage(side);
      default:
        return null;
    }
  };

  // ==========================================================================
  // DESKTOP DOUBLE-PAGE SPREAD CALCULATION
  // ==========================================================================
  // Spread S:
  // Left page index = 2 * S
  // Right page index = 2 * S + 1
  const leftPageIndex = currentSpread * 2;
  const rightPageIndex = currentSpread * 2 + 1;

  // Next and Prev Spreads
  const nextLeftPage = (currentSpread + 1) * 2;
  const nextRightPage = (currentSpread + 1) * 2 + 1;
  const prevLeftPage = (currentSpread - 1) * 2;
  const prevRightPage = (currentSpread - 1) * 2 + 1;

  // In-flight flipping angles and dynamic shadows
  // For 'next': rotationAngle goes 0 -> -180deg
  // For 'prev': rotationAngle goes 0 -> +180deg
  const flipAngle = isFlipping
    ? flipDirection === 'next'
      ? -180 * flipProgress
      : 180 * flipProgress
    : 0;

  // Dynamic shadow opacity: peaks around 90deg (progress = 0.5)
  const flipShadowOpacity = isFlipping ? Math.sin(flipProgress * Math.PI) * 0.45 : 0;

  return (
    <div
      ref={containerRef}
      className={`relative select-none outline-none ${
        isFullscreen ? 'fixed inset-0 z-50 bg-[#071510] flex flex-col items-center justify-center p-4 sm:p-8' : ''
      }`}
      role="region"
      aria-label="StockMate Interactive 3D Subscription Pricing Brochure Flipbook"
    >
      {/* Background Ambient Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#10B981]/8 rounded-full blur-[160px] pointer-events-none" />

      {/* ==================================================================
          1. TOP BILLING TOGGLE (Integrated into Section)
         ================================================================== */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-5xl mx-auto mb-6 px-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-widest text-[#10B981] font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span>Interactive 3D Brochure</span>
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-xs text-slate-300 font-sans">Click or drag pages to flip</span>
        </div>

        {/* Monthly vs Annual Billing Switch */}
        {typeof setBillingCycle === 'function' && (
          <div className="inline-flex items-center gap-1.5 p-1 rounded-2xl bg-[#071510] border border-[#10B981]/30 shadow-inner">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                billingCycle === 'annual'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] bg-[#10B981] text-slate-950 font-black px-1.5 py-0.5 rounded shadow-xs">
                Save ~20%
              </span>
            </button>
          </div>
        )}
      </div>

      {/* ==================================================================
          2. THE 3D FLIPBOOK STAGE
         ================================================================== */}
      <div className="relative max-w-5xl mx-auto px-2 sm:px-4 flex items-center justify-center">
        {/* Outer Hardcover Casing (The Obsidian/Forest Leather Binding Behind) */}
        <div className="relative w-full rounded-[24px] sm:rounded-[28px] p-2 sm:p-3.5 bg-[#071510] border border-[#10B981]/30 shadow-[0_30px_80px_-15px_rgba(0,0,0,0.9),0_0_50px_rgba(16,185,129,0.08)]">
          {/* Subtle perimeter gold/emerald stitching line */}
          <div className="absolute inset-2 sm:inset-3 rounded-[20px] sm:rounded-[22px] border border-[#10B981]/20 pointer-events-none" />

          {/* --------------------------------------------------------------
              MOBILE VIEW: SINGLE PAGE DISPLAY (Viewport < 768px)
             -------------------------------------------------------------- */}
          {isMobile ? (
            <div
              className="relative w-full h-[580px] rounded-2xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing touch-pan-y"
              onPointerDown={(e) => handlePointerDown(e.clientX, true)}
              onPointerMove={(e) => handlePointerMove(e.clientX)}
              onPointerUp={handlePointerUp}
              onClick={(e) => {
                // Left third of screen taps Prev; right two-thirds taps Next
                const rect = e.currentTarget.getBoundingClientRect();
                const tapX = e.clientX - rect.left;
                if (tapX < rect.width * 0.35) {
                  handlePrev();
                } else {
                  handleNext();
                }
              }}
            >
              {/* Render Current Mobile Page */}
              <div className="w-full h-full">{getPageComponent(currentPage, 'single')}</div>

              {/* Edge Stack Shadow */}
              <div className="absolute top-0 bottom-0 right-0 w-3 pointer-events-none spine-shadow-right" />
            </div>
          ) : (
            /* --------------------------------------------------------------
               DESKTOP VIEW: TWO-PAGE SPREAD WITH REALISTIC 3D FLIPPING
               -------------------------------------------------------------- */
            <div
              className="relative w-full h-[620px] sm:h-[650px] lg:h-[680px] rounded-2xl overflow-visible flipbook-perspective select-none"
              onPointerDown={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const isRight = e.clientX - rect.left > rect.width / 2;
                handlePointerDown(e.clientX, isRight);
              }}
              onPointerMove={(e) => handlePointerMove(e.clientX)}
              onPointerUp={handlePointerUp}
            >
              {/* ----------------------------------------------------------
                  UNDERLAY: STATIC BASE SPREAD
                 ---------------------------------------------------------- */}
              <div className="absolute inset-0 flex rounded-2xl overflow-hidden shadow-2xl">
                {/* Left Page (Current Spread Left, or Prev Spread Left if flipping back) */}
                <div
                  className="relative w-1/2 h-full overflow-hidden paper-edge-left cursor-pointer"
                  onClick={(e) => {
                    // Turn prev if clicked on left page margin
                    handlePrev();
                  }}
                  title="Click left page to turn back"
                >
                  {isFlipping && flipDirection === 'prev'
                    ? getPageComponent(prevLeftPage, 'left')
                    : getPageComponent(leftPageIndex, 'left')}

                  {/* Inner Spine Shadow (Right edge of Left Page) */}
                  <div className="absolute top-0 bottom-0 right-0 w-12 pointer-events-none spine-shadow-left" />
                </div>

                {/* Center Book Spine (Vertical Gutter & Wire Crease) */}
                <div className="relative w-[3px] h-full bg-[#071510]/40 z-20 shrink-0 shadow-md">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-white/10 to-black/30" />
                </div>

                {/* Right Page (Current Spread Right, or Next Spread Right if flipping forward) */}
                <div
                  className="relative w-1/2 h-full overflow-hidden paper-edge-right cursor-pointer"
                  onClick={(e) => {
                    // Turn next if clicked on right page margin
                    handleNext();
                  }}
                  title="Click right page to turn forward"
                >
                  {isFlipping && flipDirection === 'next'
                    ? getPageComponent(nextRightPage, 'right')
                    : getPageComponent(rightPageIndex, 'right')}

                  {/* Inner Spine Shadow (Left edge of Right Page) */}
                  <div className="absolute top-0 bottom-0 left-0 w-12 pointer-events-none spine-shadow-right" />

                  {/* Subtle Dog-Ear Turn Hint on Bottom-Right Corner */}
                  {currentSpread < TOTAL_SPREADS - 1 && (
                    <div className="absolute bottom-2 right-2 w-8 h-8 pointer-events-none opacity-40 hover:opacity-100 transition-opacity">
                      <div className="w-full h-full border-b-2 border-r-2 border-[#10B981] rounded-br" />
                    </div>
                  )}
                </div>
              </div>

              {/* ----------------------------------------------------------
                  DYNAMIC 3D FLIPPING LEAF (ACTIVE DURING TURN)
                 ---------------------------------------------------------- */}
              {isFlipping && flipDirection === 'next' && (
                /* Flipping Forward: Right page lifts up, flips to Left side */
                <div
                  className="absolute top-0 right-0 w-1/2 h-full preserve-3d pointer-events-none z-30"
                  style={{
                    transformOrigin: 'left center',
                    transform: `rotateY(${flipAngle}deg)`,
                  }}
                >
                  {/* Front Face: The Page Being Turned Away (Current Right Page) */}
                  <div className="absolute inset-0 backface-hidden overflow-hidden paper-edge-right rounded-r-2xl">
                    {getPageComponent(rightPageIndex, 'right')}
                    {/* Dynamic Darkening Shadow */}
                    <div
                      className="absolute inset-0 bg-black pointer-events-none transition-opacity"
                      style={{ opacity: flipShadowOpacity }}
                    />
                    {/* Spine Shadow on hinge */}
                    <div className="absolute top-0 bottom-0 left-0 w-12 pointer-events-none spine-shadow-right" />
                  </div>

                  {/* Back Face: The Incoming Left Page (Next Left Page) */}
                  <div
                    className="absolute inset-0 backface-hidden overflow-hidden paper-edge-left rounded-l-2xl"
                    style={{ transform: 'rotateY(180deg)' }}
                  >
                    {getPageComponent(nextLeftPage, 'left')}
                    {/* Dynamic Lightening Shadow */}
                    <div
                      className="absolute inset-0 bg-black pointer-events-none transition-opacity"
                      style={{ opacity: flipShadowOpacity }}
                    />
                    {/* Spine Shadow on hinge */}
                    <div className="absolute top-0 bottom-0 right-0 w-12 pointer-events-none spine-shadow-left" />
                  </div>
                </div>
              )}

              {isFlipping && flipDirection === 'prev' && (
                /* Flipping Backward: Left page lifts up, flips to Right side */
                <div
                  className="absolute top-0 left-0 w-1/2 h-full preserve-3d pointer-events-none z-30"
                  style={{
                    transformOrigin: 'right center',
                    transform: `rotateY(${flipAngle}deg)`,
                  }}
                >
                  {/* Front Face: The Page Being Turned Away (Current Left Page) */}
                  <div className="absolute inset-0 backface-hidden overflow-hidden paper-edge-left rounded-l-2xl">
                    {getPageComponent(leftPageIndex, 'left')}
                    {/* Dynamic Darkening Shadow */}
                    <div
                      className="absolute inset-0 bg-black pointer-events-none transition-opacity"
                      style={{ opacity: flipShadowOpacity }}
                    />
                    {/* Spine Shadow on hinge */}
                    <div className="absolute top-0 bottom-0 right-0 w-12 pointer-events-none spine-shadow-left" />
                  </div>

                  {/* Back Face: The Incoming Right Page (Prev Right Page) */}
                  <div
                    className="absolute inset-0 backface-hidden overflow-hidden paper-edge-right rounded-r-2xl"
                    style={{ transform: 'rotateY(180deg)' }}
                  >
                    {getPageComponent(prevRightPage, 'right')}
                    {/* Dynamic Lightening Shadow */}
                    <div
                      className="absolute inset-0 bg-black pointer-events-none transition-opacity"
                      style={{ opacity: flipShadowOpacity }}
                    />
                    {/* Spine Shadow on hinge */}
                    <div className="absolute top-0 bottom-0 left-0 w-12 pointer-events-none spine-shadow-right" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ==================================================================
          3. MINIMAL FLOATING CONTROLS BAR (BELOW BROCHURE)
         ================================================================== */}
      <div className="mt-8 flex items-center justify-center">
        <div className="inline-flex items-center gap-3 sm:gap-4 px-4 py-2.5 rounded-2xl bg-[#0b1d16]/90 border border-[#10B981]/25 backdrop-blur-xl shadow-2xl">
          {/* Previous Page Button */}
          <button
            type="button"
            onClick={handlePrev}
            disabled={isMobile ? currentPage === 0 : currentSpread === 0}
            className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
              (isMobile ? currentPage === 0 : currentSpread === 0)
                ? 'opacity-30 cursor-not-allowed text-slate-500'
                : 'bg-[#071510] hover:bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 hover:scale-105 active:scale-95'
            }`}
            title="Previous Page (Left Arrow or Page Up)"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page Counter Badge */}
          <div className="px-3 py-1 rounded-xl bg-[#071510]/80 border border-white/5 font-mono text-xs text-slate-200">
            {isMobile ? (
              <span>
                Page <strong className="text-[#10B981]">0{currentPage + 1}</strong> of 0{TOTAL_PAGES}
              </span>
            ) : (
              <span>
                Spread <strong className="text-[#10B981]">0{currentSpread + 1}</strong> of 0{TOTAL_SPREADS} &bull;{' '}
                <span className="text-[#10B981] font-bold">
                  {currentSpread === 0
                    ? 'Cover & Starter'
                    : currentSpread === 1
                    ? 'Pro & Enterprise'
                    : 'Custom & Decision Matrix'}
                </span>{' '}
                (Pages 0{leftPageIndex + 1}–0{rightPageIndex + 1})
              </span>
            )}
          </div>

          {/* Quick Jump Thumbnail Dots */}
          <div className="hidden sm:flex items-center gap-1.5 px-1">
            {Array.from({ length: isMobile ? TOTAL_PAGES : TOTAL_SPREADS }).map((_, idx) => {
              const isActive = isMobile ? currentPage === idx : currentSpread === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => (isMobile ? jumpToPage(idx) : jumpToSpread(idx))}
                  className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                    isActive ? 'bg-[#10B981] scale-125 ring-2 ring-[#10B981]/30' : 'bg-slate-700 hover:bg-slate-500'
                  }`}
                  title={isMobile ? `Jump to Page 0${idx + 1}` : `Jump to Spread 0${idx + 1}`}
                  aria-label={isMobile ? `Page 0${idx + 1}` : `Spread 0${idx + 1}`}
                />
              );
            })}
          </div>

          {/* Next Page Button */}
          <button
            type="button"
            onClick={handleNext}
            disabled={isMobile ? currentPage === TOTAL_PAGES - 1 : currentSpread === TOTAL_SPREADS - 1}
            className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
              (isMobile ? currentPage === TOTAL_PAGES - 1 : currentSpread === TOTAL_SPREADS - 1)
                ? 'opacity-30 cursor-not-allowed text-slate-500'
                : 'bg-[#071510] hover:bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 hover:scale-105 active:scale-95'
            }`}
            title="Next Page (Right Arrow or Page Down)"
            aria-label="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <span className="w-[1px] h-4 bg-white/10 mx-0.5" />

          {/* Fullscreen Toggle Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-[#071510] hover:bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center"
            title={isFullscreen ? 'Exit Fullscreen' : 'View Brochure in Fullscreen'}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'View Brochure in Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingFlipbook;

