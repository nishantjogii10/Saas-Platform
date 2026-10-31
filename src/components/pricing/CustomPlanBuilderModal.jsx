import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Sliders,
  Check,
  Plus,
  Minus,
  Store,
  Layers,
  ChefHat,
  Monitor,
  Tablet,
  Bike,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  RotateCcw,
  X,
  ChevronDown,
  ChevronUp,
  Lock,
  Boxes,
  QrCode,
  FileText,
  BarChart3,
  CalendarCheck,
} from 'lucide-react';
import { formatINR } from '../../data/inventoryBillingData';
import {
  calculateCustomPlanPricing,
  MODULE_CATALOG,
  PRICING_UNIT_RATES,
} from '../../services/pricingEngine';

// Primary 4 configurable add-on modules specified in requirements
const PRIMARY_MODULE_IDS = [
  'recipe_costing',
  'aggregator_integration',
  'table_captain_ordering',
  'multi_store_mgmt',
];

// Helper map for visual icons
const MODULE_ICON_MAP = {
  pos_billing: Monitor,
  recipe_costing: ChefHat,
  aggregator_integration: Bike,
  table_captain_ordering: Tablet,
  multi_store_mgmt: Store,
  inventory_mgmt: Boxes,
  expiry_fefo: CalendarCheck,
  supplier_mgmt: Store,
  po_goods_receiving: FileText,
  qr_batch_matrix: QrCode,
  advanced_reports: BarChart3,
};

/**
 * CustomPlanBuilderModal
 * Premium interactive configuration modal for custom restaurant plans.
 * Integrates single source of truth pricing with real-time recalculations.
 */
export const CustomPlanBuilderModal = ({
  isOpen,
  onClose,
  defaultBillingCycle = 'annual',
}) => {
  const navigate = useNavigate();

  // Configurator selections
  const [billingCycle, setBillingCycle] = useState(defaultBillingCycle);
  const [selectedModuleIds, setSelectedModuleIds] = useState([
    'recipe_costing',
    'aggregator_integration',
  ]);
  const [additionalTerminals, setAdditionalTerminals] = useState(1);
  const [showAdvancedModules, setShowAdvancedModules] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showMobileSummary, setShowMobileSummary] = useState(false);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const { customPlanModules, pricingUnitRates } = useApp();

  // Active catalog synchronized with Super Admin settings
  const activeCatalog = useMemo(() => {
    const list = customPlanModules && customPlanModules.length > 0 ? customPlanModules : MODULE_CATALOG;
    return list.filter((m) => m.status !== 'inactive');
  }, [customPlanModules]);

  // Base POS module info from catalog
  const baseModule = useMemo(() => {
    return activeCatalog.find((m) => m.id === 'pos_billing') || {
      id: 'pos_billing',
      name: 'Base POS & Cloud Billing',
      monthlyPrice: 599,
      annualPrice: 5748,
      isBaseModule: true,
      isRequired: true,
    };
  }, [activeCatalog]);

  // Primary operational add-ons (only active ones)
  const primaryModules = useMemo(() => {
    return activeCatalog.filter((m) => PRIMARY_MODULE_IDS.includes(m.id));
  }, [activeCatalog]);

  // Secondary/advanced kitchen add-ons (only active ones)
  const advancedModules = useMemo(() => {
    return activeCatalog.filter(
      (m) =>
        !PRIMARY_MODULE_IDS.includes(m.id) &&
        m.id !== 'pos_billing' &&
        !m.requiresCustomDev
    );
  }, [activeCatalog]);

  // Calculate authoritative pricing using single source of truth
  const pricing = useMemo(() => {
    const allActiveModules = Array.from(new Set(['pos_billing', ...selectedModuleIds]));
    return calculateCustomPlanPricing({
      basePlanId: 'plan-custom',
      outlets: 1,
      staffCount: 5,
      posTerminals: 1 + additionalTerminals,
      selectedModuleIds: allActiveModules,
      billingCycle,
    });
  }, [selectedModuleIds, additionalTerminals, billingCycle]);

  // Calculate monthly equivalent un-discounted for comparison
  const monthlyAlternativePricing = useMemo(() => {
    const allActiveModules = Array.from(new Set(['pos_billing', ...selectedModuleIds]));
    return calculateCustomPlanPricing({
      basePlanId: 'plan-custom',
      outlets: 1,
      staffCount: 5,
      posTerminals: 1 + additionalTerminals,
      selectedModuleIds: allActiveModules,
      billingCycle: 'monthly',
    });
  }, [selectedModuleIds, additionalTerminals]);

  const potentialAnnualSavings = Math.max(
    0,
    monthlyAlternativePricing.totalAmount * 12 -
      calculateCustomPlanPricing({
        basePlanId: 'plan-custom',
        outlets: 1,
        staffCount: 5,
        posTerminals: 1 + additionalTerminals,
        selectedModuleIds: Array.from(new Set(['pos_billing', ...selectedModuleIds])),
        billingCycle: 'annual',
      }).totalAmount
  );

  // Toggle selection of a module (protect required/base modules)
  const handleToggleModule = (modId) => {
    const mod = activeCatalog.find((m) => m.id === modId);
    if (mod?.isBaseModule || mod?.isRequired || modId === 'pos_billing') {
      return; // Required modules cannot be removed
    }
    setSelectedModuleIds((prev) => {
      if (prev.includes(modId)) {
        return prev.filter((id) => id !== modId);
      }
      return [...prev, modId];
    });
  };

  // Stepper adjustments for terminals
  const handleDecrementTerminals = () => {
    setAdditionalTerminals((prev) => Math.max(0, prev - 1));
  };

  const handleIncrementTerminals = () => {
    setAdditionalTerminals((prev) => Math.min(20, prev + 1));
  };

  // Reset to initial builder defaults
  const handleResetDefaults = () => {
    setSelectedModuleIds(['recipe_costing', 'aggregator_integration']);
    setAdditionalTerminals(1);
    setBillingCycle('annual');
  };

  // Handoff to registration workflow
  const handleProceedToSignUp = () => {
    setIsRedirecting(true);

    const configToPersist = {
      basePlanId: 'plan-custom',
      billingCycle,
      selectedModuleIds: Array.from(new Set(['pos_billing', ...selectedModuleIds])),
      additionalTerminals,
      totalTerminals: 1 + additionalTerminals,
      outlets: 1,
      staffSeats: 5,
      configuredAt: new Date().toISOString(),
      pricingSummary: {
        baseCost: pricing.baseCost,
        modulesCost: pricing.modulesCost,
        terminalsCost: pricing.terminalsCost,
        grossSubtotal: pricing.grossSubtotal,
        netPreTaxAmount: pricing.netPreTaxAmount,
        gstAmount: pricing.gstAmount,
        totalAmount: pricing.totalAmount,
        effectiveMonthlyAnnual: pricing.effectiveMonthlyAnnual,
        annualSavings: pricing.annualSavings,
      },
    };

    try {
      localStorage.setItem('stockmate_custom_plan_config', JSON.stringify(configToPersist));
    } catch (e) {
      console.warn('Could not persist stockmate_custom_plan_config to localStorage', e);
    }

    setTimeout(() => {
      onClose();
      navigate('/signup?plan=plan-custom');
    }, 400);
  };

  if (!isOpen) return null;

  const isAnnual = billingCycle === 'annual';
  const totalSelectedCount = selectedModuleIds.length;
  const progressPercent = Math.min(100, Math.round((totalSelectedCount / 4) * 100));

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-plan-title"
    >
      {/* Dark Ambient Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Dialog Container */}
      <div className="flex min-h-full items-center justify-center p-3 sm:p-6 text-center">
        <div
          className="relative w-full max-w-5xl my-4 sm:my-8 transform overflow-hidden rounded-3xl bg-slate-950/95 border border-emerald-500/30 text-white shadow-2xl backdrop-blur-2xl transition-all duration-200 animate-scale-in text-left flex flex-col max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="px-6 py-5 border-b border-white/10 bg-slate-900/60 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                  <Sparkles className="w-3 h-3 text-emerald-300" />
                  Custom Plan Builder
                </span>
                <span className="text-[11px] text-slate-400 hidden sm:inline">&bull; Real-Time Live Pricing</span>
              </div>
              <h2 id="custom-plan-title" className="text-xl sm:text-2xl font-black text-white mt-1 tracking-tight">
                Build Your Own Restaurant Plan
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Choose the features your restaurant needs. Pay only for the capabilities you select.
              </p>
            </div>

            {/* Billing Toggle & Close */}
            <div className="flex items-center gap-3">
              {/* Monthly / Annual Toggle */}
              <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-white/10">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                    !isAnnual
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('annual')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                    isAnnual
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Annual</span>
                  <span className="text-[10px] bg-emerald-400 text-slate-950 font-black px-1.5 py-0.2 rounded shadow-xs">
                    -20%
                  </span>
                </button>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/10 flex items-center justify-center transition-colors"
                aria-label="Close custom plan builder"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Selection Progress Strip */}
          <div className="px-6 py-2.5 bg-slate-900/40 border-b border-white/5 flex items-center justify-between gap-4 text-xs shrink-0">
            <div className="flex items-center gap-2 text-slate-300">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>
                <strong className="text-white">{totalSelectedCount}</strong> of 4 core operational add-ons selected
              </span>
            </div>
            <div className="w-36 sm:w-48 h-2 bg-slate-800 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Modal Main Body Grid */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Configurator Panels (lg:col-span-7) */}
              <div className="lg:col-span-7 space-y-6">
                {/* 1. Base POS Foundation (Included) */}
                <div className="rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950 border border-emerald-500/40 p-4 sm:p-5 relative shadow-lg">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Monitor className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">Base POS &amp; Cloud Billing</h3>
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5 text-emerald-400" />
                            Foundation Included
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          High-velocity cloud point-of-sale, touch cash register, digital KOTs, split billing, and 1 included terminal station.
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-black text-white">
                        {isAnnual
                          ? formatINR(Math.round(baseModule.annualPrice / 12))
                          : formatINR(baseModule.monthlyPrice)}
                        <span className="text-[10px] text-slate-400 font-normal">/mo</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-medium">
                        {isAnnual ? `Billed ${formatINR(baseModule.annualPrice)}/yr` : 'Base subscription'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Core Configurable Add-On Modules */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                      <Sliders className="w-4 h-4" />
                      <span>Configure Operational Modules</span>
                    </h3>
                    <span className="text-[11px] text-slate-400">Click to select or deselect</span>
                  </div>

                  <div className="space-y-3">
                    {primaryModules.map((module) => {
                      const isSelected = selectedModuleIds.includes(module.id);
                      const IconComponent = MODULE_ICON_MAP[module.id] || Boxes;
                      const displayPrice = isAnnual
                        ? Math.round(module.annualPrice / 12)
                        : module.monthlyPrice;

                      return (
                        <div
                          key={module.id}
                          onClick={() => handleToggleModule(module.id)}
                          role="checkbox"
                          aria-checked={isSelected}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === ' ' || e.key === 'Enter') {
                              e.preventDefault();
                              handleToggleModule(module.id);
                            }
                          }}
                          className={`rounded-2xl p-4 border transition-all duration-200 cursor-pointer flex items-start justify-between gap-4 select-none ${
                            isSelected
                              ? 'bg-slate-900/90 border-emerald-500/80 shadow-md ring-1 ring-emerald-500/20'
                              : 'bg-slate-950/70 border-white/10 hover:border-white/20 hover:bg-slate-900/40 opacity-80'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                isSelected
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-800 text-transparent border border-slate-700'
                              }`}
                            >
                              <Check className="w-4 h-4" />
                            </div>

                            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-white/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                              <IconComponent className="w-4 h-4" />
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs sm:text-sm font-bold text-white">{module.name}</h4>
                                <span className="text-[10px] text-slate-400 bg-slate-900 border border-white/10 px-1.5 py-0.2 rounded">
                                  {module.category}
                                </span>
                              </div>
                              <p className="text-xs text-slate-300 mt-1 leading-snug">
                                {module.description}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-sm font-black text-white">
                              +{formatINR(displayPrice)}
                              <span className="text-[10px] text-slate-400 font-normal">/mo</span>
                            </div>
                            <span className="text-[10px] text-emerald-400 font-medium">
                              {isAnnual ? `${formatINR(module.annualPrice)}/yr` : 'Monthly add-on'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. POS Hardware Terminal Stations Stepper */}
                <div className="rounded-2xl bg-slate-900/70 border border-white/10 p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Tablet className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-sm font-bold text-white">Additional POS Terminal Stations</h4>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">
                        1 Primary station included in base. Add extra counter displays or captain tablets.
                      </p>
                      <div className="text-[11px] text-emerald-400 font-medium mt-1">
                        +₹{pricingUnitRates?.additionalTerminalMonthly || 250} per extra device / month ({isAnnual ? `₹${pricingUnitRates?.additionalTerminalAnnual || 2400}/yr • Save ~20%` : 'Billed monthly'})
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <div className="flex items-center bg-slate-950 rounded-xl border border-white/10 p-1 shadow-inner">
                        <button
                          type="button"
                          onClick={handleDecrementTerminals}
                          disabled={additionalTerminals <= 0}
                          className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-white flex items-center justify-center transition-colors font-bold"
                          aria-label="Decrease terminal count"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-12 text-center">
                          <span className="text-base font-black text-white">
                            {additionalTerminals}
                          </span>
                          <span className="text-[9px] text-slate-400 block -mt-1">extra</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleIncrementTerminals}
                          disabled={additionalTerminals >= 20}
                          className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-white flex items-center justify-center transition-colors font-bold"
                          aria-label="Increase terminal count"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right min-w-[70px]">
                        <span className="text-xs font-black text-white block">
                          {additionalTerminals === 0
                            ? '₹0'
                            : formatINR(
                                isAnnual
                                  ? additionalTerminals * Math.round((pricingUnitRates?.additionalTerminalAnnual || PRICING_UNIT_RATES.additionalTerminalAnnual) / 12)
                                  : additionalTerminals * (pricingUnitRates?.additionalTerminalMonthly || PRICING_UNIT_RATES.additionalTerminalMonthly)
                              )}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {additionalTerminals + 1} total station{additionalTerminals > 0 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Optional Advanced Capabilities Expander */}
                <div className="rounded-2xl border border-white/10 overflow-hidden bg-slate-900/30">
                  <button
                    type="button"
                    onClick={() => setShowAdvancedModules((prev) => !prev)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Boxes className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white">
                        Additional Kitchen Capabilities ({advancedModules.length} optional add-ons)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                      <span>{showAdvancedModules ? 'Hide' : 'Explore'}</span>
                      {showAdvancedModules ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {showAdvancedModules && (
                    <div className="p-4 border-t border-white/10 space-y-2.5">
                      {advancedModules.map((module) => {
                        const isSelected = selectedModuleIds.includes(module.id);
                        const IconComponent = MODULE_ICON_MAP[module.id] || Boxes;
                        const displayPrice = isAnnual
                          ? Math.round(module.annualPrice / 12)
                          : module.monthlyPrice;

                        return (
                          <div
                            key={module.id}
                            onClick={() => handleToggleModule(module.id)}
                            className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between gap-3 transition-colors ${
                              isSelected
                                ? 'bg-slate-900 border-emerald-500/80 shadow-xs'
                                : 'bg-slate-950/50 border-white/5 hover:border-white/15'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-800 text-transparent border border-slate-700'
                                }`}
                              >
                                <Check className="w-3.5 h-3.5" />
                              </div>
                              <IconComponent className="w-4 h-4 text-slate-400 shrink-0" />
                              <div>
                                <span className="font-bold text-white block">{module.name}</span>
                                <span className="text-[10px] text-slate-400">{module.description}</span>
                              </div>
                            </div>

                            <span className="font-black text-white shrink-0">
                              +{formatINR(displayPrice)}/mo
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Sticky Live Pricing Summary (lg:col-span-5) */}
              <div className="lg:col-span-5 sticky top-2">
                <div className="rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 border border-emerald-500/30 p-5 sm:p-6 shadow-2xl space-y-5">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                        Authoritative Calculation
                      </span>
                      <h3 className="text-base font-black text-white">Live Pricing Summary</h3>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-bold text-slate-300 bg-slate-900 border border-white/10 px-2 py-0.5 rounded-md">
                        {isAnnual ? 'Annual Billing (-20%)' : 'Monthly Billing'}
                      </span>
                    </div>
                  </div>

                  {/* Itemized Line Items */}
                  <div className="space-y-2 text-xs">
                    {/* Base POS */}
                    <div className="flex items-center justify-between text-slate-300 py-1 border-b border-white/5">
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Base POS &amp; Cloud Billing</span>
                      </div>
                      <span className="font-mono font-bold text-white">
                        {formatINR(isAnnual ? Math.round(baseModule.annualPrice / 12) : baseModule.monthlyPrice)}
                        <span className="text-[10px] text-slate-500 font-normal">/mo</span>
                      </span>
                    </div>

                    {/* Selected Modules */}
                    {pricing.itemizedModules
                      .filter((m) => !m.isIncludedInBase)
                      .map((mod) => (
                        <div key={mod.id} className="flex items-center justify-between text-slate-300 py-1 border-b border-white/5">
                          <div className="flex items-center gap-1.5 truncate max-w-[210px]">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="truncate">{mod.name}</span>
                          </div>
                          <span className="font-mono font-bold text-white shrink-0">
                            +{formatINR(isAnnual ? Math.round(mod.price / 12) : mod.price)}
                            <span className="text-[10px] text-slate-500 font-normal">/mo</span>
                          </span>
                        </div>
                      ))}

                    {/* Additional Terminals */}
                    {additionalTerminals > 0 && (
                      <div className="flex items-center justify-between text-slate-300 py-1 border-b border-white/5">
                        <div className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{additionalTerminals} Extra POS Terminal{additionalTerminals > 1 ? 's' : ''}</span>
                        </div>
                        <span className="font-mono font-bold text-white">
                          +{formatINR(isAnnual ? Math.round(pricing.terminalsCost / 12) : pricing.terminalsCost)}
                          <span className="text-[10px] text-slate-500 font-normal">/mo</span>
                        </span>
                      </div>
                    )}

                    {/* Pre-tax Subtotal */}
                    <div className="flex items-center justify-between text-slate-400 pt-2">
                      <span>Pre-Tax Subtotal</span>
                      <span className="font-mono font-bold text-white">
                        {formatINR(isAnnual ? Math.round(pricing.netPreTaxAmount / 12) : pricing.netPreTaxAmount)}
                        <span className="text-[10px] text-slate-500 font-normal">/mo</span>
                      </span>
                    </div>

                    {/* 18% GST Statutory */}
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Indian Statutory GST (18%)</span>
                      <span className="font-mono font-bold text-white">
                        +{formatINR(isAnnual ? Math.round(pricing.gstAmount / 12) : pricing.gstAmount)}
                        <span className="text-[10px] text-slate-500 font-normal">/mo</span>
                      </span>
                    </div>
                  </div>

                  {/* Total Highlight Box */}
                  <div className="rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 p-4 border border-emerald-500/30 space-y-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                        {isAnnual ? 'Effective Monthly Rate' : 'Total Monthly Amount'}
                      </span>
                      <div className="text-right">
                        <span className="text-3xl font-black text-white font-mono">
                          {formatINR(pricing.effectiveMonthlyAnnual)}
                        </span>
                        <span className="text-xs text-slate-400">/mo</span>
                      </div>
                    </div>

                    {isAnnual ? (
                      <div className="pt-2 border-t border-emerald-800/40 space-y-0.5">
                        <div className="flex justify-between text-[11px] text-slate-300">
                          <span>Total Billed Annually (Incl. 18% GST):</span>
                          <span className="font-mono font-bold text-emerald-300">{formatINR(pricing.totalAmount)}/yr</span>
                        </div>
                        <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Actual Annual Savings: {formatINR(potentialAnnualSavings)}/yr (20% off)</span>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-emerald-800/40 text-[11px] text-slate-400 flex items-center justify-between">
                        <span>Billed monthly with flexible cancellation</span>
                        <button
                          type="button"
                          onClick={() => setBillingCycle('annual')}
                          className="text-emerald-400 hover:text-emerald-300 font-bold underline"
                        >
                          Switch to Annual &amp; Save ~20%
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Primary CTA Button */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleProceedToSignUp}
                      disabled={isRedirecting}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm text-center shadow-lg shadow-emerald-600/30 hover:shadow-emerald-500/50 transition-all flex items-center justify-center gap-2 disabled:opacity-75"
                    >
                      {isRedirecting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          <span>Preparing Your Workspace...</span>
                        </>
                      ) : (
                        <>
                          <span>Proceed to Sign Up with Custom Plan</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                      <button
                        type="button"
                        onClick={handleResetDefaults}
                        className="hover:text-slate-200 transition-colors flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset Selection</span>
                      </button>

                      <div className="flex items-center gap-1 text-slate-400">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>14-Day Risk-Free Trial</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Bottom Accessible Pricing Dock (visible on mobile/tablet) */}
          <div className="lg:hidden p-3.5 bg-slate-900 border-t border-white/10 shrink-0 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-slate-400 block -mb-0.5">
                {isAnnual ? 'Effective Monthly' : 'Total Monthly'}
              </span>
              <span className="text-xl font-black text-white font-mono">
                {formatINR(pricing.effectiveMonthlyAnnual)}
                <span className="text-xs text-slate-400 font-normal">/mo</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowMobileSummary((prev) => !prev)}
                className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold border border-white/10 hover:text-white"
              >
                {showMobileSummary ? 'Hide' : 'Details'}
              </button>

              <button
                type="button"
                onClick={handleProceedToSignUp}
                disabled={isRedirecting}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-md flex items-center gap-1.5"
              >
                <span>Sign Up</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Mobile Summary Drawer */}
          {showMobileSummary && (
            <div className="lg:hidden p-4 bg-slate-950 border-t border-emerald-500/30 text-xs space-y-2 animate-fade-in shrink-0">
              <div className="flex justify-between text-slate-300">
                <span>Base POS Foundation:</span>
                <span className="font-mono text-white">
                  {formatINR(isAnnual ? Math.round(baseModule.annualPrice / 12) : baseModule.monthlyPrice)}/mo
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>{selectedModuleIds.length} Modular Add-ons:</span>
                <span className="font-mono text-white">
                  +{formatINR(isAnnual ? Math.round(pricing.modulesCost / 12) : pricing.modulesCost)}/mo
                </span>
              </div>
              {additionalTerminals > 0 && (
                <div className="flex justify-between text-slate-300">
                  <span>{additionalTerminals} Extra Terminals:</span>
                  <span className="font-mono text-white">
                    +{formatINR(isAnnual ? Math.round(pricing.terminalsCost / 12) : pricing.terminalsCost)}/mo
                  </span>
                </div>
              )}
              <div className="flex justify-between text-slate-300 pt-1 border-t border-white/5">
                <span>18% GST:</span>
                <span className="font-mono text-white">
                  +{formatINR(isAnnual ? Math.round(pricing.gstAmount / 12) : pricing.gstAmount)}/mo
                </span>
              </div>
              {isAnnual && (
                <div className="text-[11px] text-emerald-400 font-bold pt-1">
                  Annual total: {formatINR(pricing.totalAmount)}/yr (You save {formatINR(potentialAnnualSavings)}/yr)
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
