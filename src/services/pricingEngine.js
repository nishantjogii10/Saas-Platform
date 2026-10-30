// StockMate Centralized Subscription Pricing & Approval Engine
// Authoritative single source of truth for pricing calculations, business rules, and approval paths.

export const BASE_PLANS = {
  'plan-starter': {
    id: 'plan-starter',
    name: 'Starter',
    badge: 'Single Outlet',
    target: 'Small cafes, cloud kitchens, and food trucks.',
    monthlyPrice: 999,
    annualPrice: 9588, // Total annual payable
    effectiveMonthlyAnnual: 799, // ₹9,588 / 12 = ₹799/month
    annualSavings: 2400, // ₹11,988 - ₹9,588 = ₹2,400/year (20% savings)
    savingsPercent: 20,
    includedOutlets: 1,
    includedStaff: 5,
    includedTerminals: 1,
    maxIngredients: 500,
    supportLevel: 'Standard Email (24h SLA)',
    popular: false,
    includedModuleIds: ['pos_billing', 'inventory_mgmt', 'expiry_fefo', 'po_goods_receiving'],
    features: [
      'Full POS & Cloud Billing',
      'Core Pantry Inventory Management',
      'FEFO Color-Coded Expiry Tracking',
      'Digital Purchase Orders & Basic GRN',
      '1 Restaurant Outlet & 5 Staff Seats',
      '1 POS Terminal Station Included',
    ],
  },
  'plan-pro': {
    id: 'plan-pro',
    name: 'Professional',
    badge: 'Most Popular',
    target: 'Growing restaurants and bistros.',
    monthlyPrice: 2499,
    annualPrice: 23988, // Total annual payable
    effectiveMonthlyAnnual: 1999, // ₹23,988 / 12 = ₹1,999/month
    annualSavings: 6000, // ₹29,988 - ₹23,988 = ₹6,000/year (20% savings)
    savingsPercent: 20,
    includedOutlets: 3,
    includedStaff: 15,
    includedTerminals: 2,
    maxIngredients: 999999,
    supportLevel: 'Priority Live Chat (2h SLA)',
    popular: true,
    includedModuleIds: [
      'pos_billing',
      'inventory_mgmt',
      'expiry_fefo',
      'recipe_costing',
      'supplier_mgmt',
      'po_goods_receiving',
      'qr_batch_matrix',
      'table_captain_ordering',
    ],
    features: [
      'Everything in Starter, plus:',
      'Up to 3 Restaurant Outlets Included',
      'Up to 15 Staff Accounts & 2 POS Terminals',
      'Advanced Recipe Costing & Food Waste Alerts',
      'Pure SVG QR Batch Traceability Matrix',
      'Dock GRN Verification & Supplier Claims',
      'Table & Captain Ordering Terminal',
      'Supplier Invoicing & Automated Ledgers',
    ],
  },
  'plan-enterprise': {
    id: 'plan-enterprise',
    name: 'Enterprise',
    badge: 'Multi-Unit Scale',
    target: 'Multi-outlet restaurants and franchises.',
    monthlyPrice: 5499,
    annualPrice: 53988, // Total annual payable
    effectiveMonthlyAnnual: 4499, // ₹53,988 / 12 = ₹4,499/month
    annualSavings: 12000, // ₹65,988 - ₹53,988 = ₹12,000/year (18.2% ~ 20% savings)
    savingsPercent: 18,
    includedOutlets: 10,
    includedStaff: 50,
    includedTerminals: 5,
    maxIngredients: 999999,
    supportLevel: 'Dedicated Success Mgr (1h SLA)',
    popular: false,
    includedModuleIds: [
      'pos_billing',
      'inventory_mgmt',
      'expiry_fefo',
      'recipe_costing',
      'supplier_mgmt',
      'po_goods_receiving',
      'qr_batch_matrix',
      'table_captain_ordering',
      'multi_store_mgmt',
      'advanced_reports',
      'aggregator_integration',
      'dedicated_account_manager',
    ],
    features: [
      'Everything in Professional, plus:',
      'Up to 10 Outlets & 50 Staff Accounts',
      'Up to 5 Dedicated POS Terminals',
      'Multi-Store Staff Transfers & Central Commissary',
      'Swiggy / Zomato Online Aggregator Sync',
      'Predictive Consumption & Wastage BI',
      'Dedicated Account Manager & 24/7 Phone SLA',
      'Audit Trail Export & Role Matrix RBAC',
    ],
  },
  'plan-custom': {
    id: 'plan-custom',
    name: 'Build Your Own Plan',
    badge: 'Interactive Builder',
    target: 'Custom business scale, chosen modules & tailored requirements.',
    monthlyPrice: 0,
    annualPrice: 0,
    effectiveMonthlyAnnual: 0,
    annualSavings: 0,
    savingsPercent: 20,
    includedOutlets: 1,
    includedStaff: 5,
    includedTerminals: 1,
    popular: false,
    features: [
      'Choose exact outlet & terminal count',
      'Select only the modules your kitchen uses',
      'Instant live pricing calculation',
      'Automated approval for standard setups',
      'Custom Quotations for franchise scale',
    ],
  },
};

export const calculatePlanSavings = (monthlyPrice, annualPrice) => {
  const m = Math.max(0, Number(monthlyPrice) || 0);
  const a = Math.max(0, Number(annualPrice) || 0);
  const annualWithoutDiscount = m * 12;
  const annualSavings = Math.max(0, annualWithoutDiscount - a);
  const savingsPercent = annualWithoutDiscount > 0 ? Math.round((annualSavings / annualWithoutDiscount) * 100) : 0;
  const effectiveMonthlyAnnual = a > 0 ? Math.round(a / 12) : 0;
  return { annualSavings, savingsPercent, effectiveMonthlyAnnual };
};

export const syncPricingEnginePlans = (plansList) => {
  if (!plansList) return BASE_PLANS;
  const list = Array.isArray(plansList) ? plansList : Object.values(plansList);
  list.forEach((p) => {
    if (!p || !p.id) return;
    const targetPlan = BASE_PLANS[p.id];
    const { annualSavings, savingsPercent, effectiveMonthlyAnnual } = calculatePlanSavings(
      p.monthlyPrice,
      p.annualPrice ?? (Number(p.monthlyPrice || 0) * 12 * 0.8)
    );
    if (targetPlan) {
      if (p.name !== undefined) targetPlan.name = p.name;
      if (p.badge !== undefined) targetPlan.badge = p.badge;
      if (p.monthlyPrice !== undefined) targetPlan.monthlyPrice = Number(p.monthlyPrice) || 0;
      if (p.annualPrice !== undefined) targetPlan.annualPrice = Number(p.annualPrice) || 0;
      targetPlan.annualSavings = annualSavings;
      targetPlan.savingsPercent = savingsPercent;
      targetPlan.effectiveMonthlyAnnual = effectiveMonthlyAnnual;
      if (p.description !== undefined) targetPlan.target = p.description;
      if (p.target !== undefined) targetPlan.target = p.target;
      if (p.status !== undefined) targetPlan.status = p.status;
      if (Array.isArray(p.features) && p.features.length > 0) {
        targetPlan.features = [...p.features];
      }
      if (p.limits) {
        if (p.limits.maxIngredients !== undefined) targetPlan.maxIngredients = Number(p.limits.maxIngredients) || targetPlan.maxIngredients;
        if (p.limits.maxStaff !== undefined) targetPlan.includedStaff = Number(p.limits.maxStaff) || targetPlan.includedStaff;
        if (p.limits.branches !== undefined) targetPlan.includedOutlets = Number(p.limits.branches) || targetPlan.includedOutlets;
        if (p.limits.support !== undefined) targetPlan.supportLevel = p.limits.support;
      }
    }
  });
  return BASE_PLANS;
};

// Configurable Add-On Modules and Unit Rates
export const MODULE_CATALOG = [
  {
    id: 'pos_billing',
    name: 'POS and Billing System',
    description: 'Fast cloud point-of-sale, touch cash register, KOT generation, and split billing.',
    monthlyPrice: 599,
    annualPrice: 5748, // ₹479/mo (20% discount)
    category: 'Core POS',
    isBaseModule: true,
    status: 'active',
  },
  {
    id: 'inventory_mgmt',
    name: 'Inventory Management',
    description: 'Real-time ingredient stock levels, low stock warnings, and consumption logging.',
    monthlyPrice: 499,
    annualPrice: 4788, // ₹399/mo (20% discount)
    category: 'Pantry & Kitchen',
    isBaseModule: false,
    status: 'active',
  },
  {
    id: 'expiry_fefo',
    name: 'Expiry Tracking and FEFO',
    description: 'First-Expired, First-Out queueing to ensure cooks consume oldest batches first.',
    monthlyPrice: 399,
    annualPrice: 3828, // ₹319/mo (20% discount)
    category: 'Pantry & Kitchen',
    isBaseModule: false,
    status: 'active',
  },
  {
    id: 'recipe_costing',
    name: 'Advanced Inventory & Recipe Costing',
    description: 'Standardized recipe BOMs, cost-per-dish calculation, and yield wastage analytics.',
    monthlyPrice: 600,
    annualPrice: 5760, // ₹480/mo (20% discount)
    category: 'Food Cost Optimization',
    isBaseModule: false,
    status: 'active',
  },
  {
    id: 'supplier_mgmt',
    name: 'Supplier Management & Invoicing',
    description: 'Supplier directory, credit note reconciliation, damage deductions, and payment ledgers.',
    monthlyPrice: 499,
    annualPrice: 4788,
    category: 'Procurement & Supply Chain',
    isBaseModule: false,
    status: 'active',
  },
  {
    id: 'po_goods_receiving',
    name: 'Purchase Orders & Goods Receiving (GRN)',
    description: 'Dockside physical count inspection, verified GRN generation, and invoice matching.',
    monthlyPrice: 499,
    annualPrice: 4788,
    category: 'Procurement & Supply Chain',
    isBaseModule: false,
    status: 'active',
  },
  {
    id: 'qr_batch_matrix',
    name: 'QR / Barcode Batch Tracking',
    description: 'Crisp SVG QR batch tags for lot traceability, scan-to-receive, and mobile camera audits.',
    monthlyPrice: 499,
    annualPrice: 4788,
    category: 'Pantry & Kitchen',
    isBaseModule: false,
    status: 'active',
  },
  {
    id: 'table_captain_ordering',
    name: 'Table and Captain Ordering',
    description: 'Handheld waitstaff ordering tablet interface, digital table layout, and instant KOT dispatch.',
    monthlyPrice: 300,
    annualPrice: 2880, // ₹240/mo (20% discount)
    category: 'Front of House',
    isBaseModule: false,
    status: 'active',
  },
  {
    id: 'multi_store_mgmt',
    name: 'Multi-Store Management & Transfers',
    description: 'Inter-outlet stock transfer workflows, centralized commissary, and unified financial reporting.',
    monthlyPrice: 800,
    annualPrice: 7680, // ₹640/mo (20% discount)
    category: 'Multi-Unit Governance',
    isBaseModule: false,
    status: 'active',
  },
  {
    id: 'aggregator_integration',
    name: 'Swiggy & Zomato Aggregator Sync',
    description: 'Direct menu pushing, unified online order injection, and automated mark-out-of-stock.',
    monthlyPrice: 400,
    annualPrice: 3840, // ₹320/mo (20% discount)
    category: 'Online Delivery Channels',
    isBaseModule: false,
    status: 'active',
  },
  {
    id: 'advanced_reports',
    name: 'Advanced Reports and Analytics',
    description: 'Predictive food cost trends, peak hour sales velocity, and CSV/PDF exportable ledgers.',
    monthlyPrice: 699,
    annualPrice: 6708,
    category: 'Business Intelligence',
    isBaseModule: false,
    status: 'active',
  },
  {
    id: 'custom_erp_connector',
    name: 'Custom ERP & Legacy POS Connector',
    description: 'Requires bespoke data pipeline engineering (SAP, Oracle Micros, or proprietary ERP).',
    monthlyPrice: 3499,
    annualPrice: 34990,
    category: 'Custom Engineering (Path C)',
    requiresCustomDev: true,
    status: 'active',
  },
  {
    id: 'on_premise_sla',
    name: 'Isolated VPC & Dedicated On-Premise SLA',
    description: 'Dedicated infrastructure, custom data residency compliance, and 99.95% uptime SLA.',
    monthlyPrice: 5999,
    annualPrice: 59990,
    category: 'Custom Infrastructure (Path C)',
    requiresCustomDev: true,
    status: 'active',
  },
];

// Ensure includedIn is populated for all modules based on BASE_PLANS
MODULE_CATALOG.forEach((mod) => {
  if (!mod.includedIn) {
    mod.includedIn = Object.keys(BASE_PLANS).filter((pId) =>
      BASE_PLANS[pId]?.includedModuleIds?.includes(mod.id)
    );
  }
});

// Re-export as FEATURE_ADDONS for backward compatibility with existing components
export const FEATURE_ADDONS = MODULE_CATALOG;

// Unit scaling rates
export const PRICING_UNIT_RATES = {
  additionalOutletMonthly: 499,       // per extra outlet per month
  additionalOutletAnnual: 4788,       // ~20% discount
  additionalTerminalMonthly: 250,     // per extra POS terminal per month
  additionalTerminalAnnual: 2400,     // ~20% discount
  additionalStaffMonthly: 99,         // per staff member per month
  additionalStaffAnnual: 948,         // ~20% discount
  gstRate: 0.18,                      // 18% statutory GST
  annualDiscountPercent: 20,          // 20% annual discount
  minimumPriceMarginFloorRatio: 0.70, // Margin guardrail
  minTerminals: 1,
  maxTerminals: 25,
  minOutlets: 1,
  maxOutlets: 50,
  minStaff: 1,
  maxStaff: 200,
};

/**
 * Synchronize custom module pricing & statuses with persistent store
 */
export const syncPricingEngineModules = (modulesList) => {
  if (!modulesList || !Array.isArray(modulesList)) return MODULE_CATALOG;
  modulesList.forEach((m) => {
    if (!m || !m.id) return;
    const existing = MODULE_CATALOG.find((mod) => mod.id === m.id);
    if (existing) {
      if (m.name !== undefined) existing.name = m.name;
      if (m.description !== undefined) existing.description = m.description;
      if (m.monthlyPrice !== undefined) existing.monthlyPrice = Math.max(0, Number(m.monthlyPrice) || 0);
      if (m.annualPrice !== undefined) {
        existing.annualPrice = Math.max(0, Number(m.annualPrice) || 0);
      } else if (m.monthlyPrice !== undefined) {
        existing.annualPrice = Math.round(Number(m.monthlyPrice) * 12 * 0.8);
      }
      if (m.status !== undefined) existing.status = m.status;
      if (m.category !== undefined) existing.category = m.category;
      if (m.isBaseModule !== undefined) existing.isBaseModule = m.isBaseModule;
      if (m.isRequired !== undefined) existing.isRequired = m.isRequired;
    } else {
      MODULE_CATALOG.push({
        ...m,
        status: m.status || 'active',
        monthlyPrice: Math.max(0, Number(m.monthlyPrice) || 0),
        annualPrice: m.annualPrice !== undefined && Number(m.annualPrice) > 0
          ? Number(m.annualPrice)
          : Math.round(Number(m.monthlyPrice || 0) * 12 * 0.8),
      });
    }
  });
  return MODULE_CATALOG;
};

/**
 * Synchronize unit scaling rates with persistent store
 */
export const syncPricingEngineUnitRates = (rates) => {
  if (!rates || typeof rates !== 'object') return PRICING_UNIT_RATES;
  Object.keys(rates).forEach((key) => {
    if (rates[key] !== undefined) {
      PRICING_UNIT_RATES[key] = typeof rates[key] === 'number' ? rates[key] : (Number(rates[key]) || rates[key]);
    }
  });
  return PRICING_UNIT_RATES;
};

export const getModuleCatalog = () => MODULE_CATALOG;
export const getPricingUnitRates = () => PRICING_UNIT_RATES;

// Threshold Limits for Automated Rules
export const AUTOMATION_LIMITS = {
  maxStandardOutlets: 10,             // <= 10 outlets can be auto-approved
  manualReviewOutletThreshold: 10,    // > 10 outlets requires "Talk to Sales / Custom Quote"
  standardMaxStaff: 50,               // Up to 50 staff accounts auto-approved
  enterpriseMaxStaff: 100,            // 51 to 100 staff auto-approved under enterprise volume tier
  manualReviewStaffThreshold: 100,    // > 100 staff triggers Path C
  maxAutomatedDiscountPercent: 20,    // Discounts > 20% require manual review
};

/**
 * Authoritative Centralized Pricing Calculator
 * Computes exact itemized price according to business rules.
 */
export const calculateCustomPlanPricing = ({
  basePlanId = 'plan-custom',
  outlets = 1,
  branches = 1, // alias for outlets
  staffCount = 5,
  posTerminals = 1,
  selectedModuleIds = [],
  selectedFeatureIds = [], // alias for selectedModuleIds
  billingCycle = 'annual', // 'monthly' | 'annual'
  discountCode = '',
  manualDiscountPercent = 0,
}) => {
  const isAnnual = billingCycle.toLowerCase() === 'annual' || billingCycle.toLowerCase() === 'yearly';
  const effectiveOutlets = Math.max(1, outlets || branches || 1);
  const effectiveStaff = Math.max(2, staffCount || 5);
  const effectiveTerminals = Math.max(1, posTerminals || 1);
  const activeModules = selectedModuleIds.length > 0 ? selectedModuleIds : selectedFeatureIds;

  // If standard archetype selected (Starter, Pro, Enterprise)
  const isStandardPlan = basePlanId && basePlanId !== 'plan-custom' && BASE_PLANS[basePlanId];
  const standardBase = isStandardPlan ? BASE_PLANS[basePlanId] : null;

  // 1. Base Subscription Cost
  let baseCost = 0;
  let includedOutlets = 1;
  let includedStaff = 5;
  let includedTerminals = 1;
  let includedModuleIds = ['pos_billing'];

  if (standardBase) {
    baseCost = isAnnual ? standardBase.annualPrice : standardBase.monthlyPrice;
    includedOutlets = standardBase.includedOutlets;
    includedStaff = standardBase.includedStaff;
    includedTerminals = standardBase.includedTerminals;
    includedModuleIds = standardBase.includedModuleIds || [];
  } else {
    // Custom plan base: starts with Base POS System
    const baseModule = MODULE_CATALOG.find((m) => m.id === 'pos_billing');
    baseCost = isAnnual ? (baseModule?.annualPrice || 5748) : (baseModule?.monthlyPrice || 599);
    includedOutlets = 1;
    includedStaff = 5;
    includedTerminals = 1;
    includedModuleIds = ['pos_billing'];
  }

  // 2. Extra Outlets Cost
  const extraOutlets = Math.max(0, effectiveOutlets - includedOutlets);
  const outletRate = isAnnual ? PRICING_UNIT_RATES.additionalOutletAnnual : PRICING_UNIT_RATES.additionalOutletMonthly;
  const outletsCost = extraOutlets * outletRate;

  // 3. Extra Staff Cost
  const extraStaff = Math.max(0, effectiveStaff - includedStaff);
  const staffRate = isAnnual ? PRICING_UNIT_RATES.additionalStaffAnnual : PRICING_UNIT_RATES.additionalStaffMonthly;
  const staffCost = extraStaff * staffRate;

  // 4. Extra Terminals Cost
  const extraTerminals = Math.max(0, effectiveTerminals - includedTerminals);
  const terminalRate = isAnnual ? PRICING_UNIT_RATES.additionalTerminalAnnual : PRICING_UNIT_RATES.additionalTerminalMonthly;
  const terminalsCost = extraTerminals * terminalRate;

  // 5. Modular Add-ons Cost (deduping included modules)
  let modulesCost = 0;
  const itemizedModules = [];

  activeModules.forEach((modId) => {
    const mod = MODULE_CATALOG.find((m) => m.id === modId);
    if (!mod) return;

    const isIncludedInBase = includedModuleIds.includes(modId);
    const unitPrice = isIncludedInBase ? 0 : isAnnual ? mod.annualPrice : mod.monthlyPrice;

    modulesCost += unitPrice;
    itemizedModules.push({
      id: mod.id,
      name: mod.name,
      price: unitPrice,
      isIncludedInBase,
      requiresCustomDev: mod.requiresCustomDev || false,
    });
  });

  // Gross Subtotal
  const grossSubtotal = baseCost + outletsCost + staffCost + terminalsCost + modulesCost;

  // 6. Volume Discounts for Outlets (Automated rule)
  let volumeDiscountPercent = 0;
  if (effectiveOutlets >= 11 && effectiveOutlets <= 25) {
    volumeDiscountPercent = 10;
  } else if (effectiveOutlets >= 6 && effectiveOutlets <= 10) {
    volumeDiscountPercent = 5;
  }

  const volumeDiscountAmount = Math.round(grossSubtotal * (volumeDiscountPercent / 100));

  // 7. Promo code discount
  let promoDiscountPercent = Math.min(25, Math.max(0, Number(manualDiscountPercent) || 0));
  const cleanCode = (discountCode || '').trim().toUpperCase();
  if (cleanCode === 'LAUNCH2026') {
    promoDiscountPercent = Math.max(promoDiscountPercent, 10);
  } else if (cleanCode === 'STOCKMATEVIP') {
    promoDiscountPercent = Math.max(promoDiscountPercent, 15);
  }

  const promoDiscountAmount = Math.round((grossSubtotal - volumeDiscountAmount) * (promoDiscountPercent / 100));
  const totalDiscountAmount = volumeDiscountAmount + promoDiscountAmount;

  // Net Pre-tax Amount
  const netPreTaxAmount = Math.max(0, grossSubtotal - totalDiscountAmount);

  // 8. 18% GST (Indian Statutory Tax)
  const gstAmount = Math.round(netPreTaxAmount * PRICING_UNIT_RATES.gstRate);
  const totalAmount = netPreTaxAmount + gstAmount;

  // Effective monthly equivalent (for annual comparison)
  const effectiveMonthlyAnnual = isAnnual ? Math.round(totalAmount / 12) : totalAmount;

  // Annual savings calculation
  // Monthly equivalent un-discounted * 12 vs Annual total
  const monthlyRunRateFullYear = isAnnual
    ? Math.round((grossSubtotal / (isAnnual ? 0.8 : 1)) * 1.18)
    : totalAmount * 12;
  const annualSavings = isAnnual ? Math.max(0, monthlyRunRateFullYear - totalAmount) : 0;

  // Margin Floor
  const minimumAcceptableFloor = Math.round(grossSubtotal * PRICING_UNIT_RATES.minimumPriceMarginFloorRatio * 1.18);

  return {
    basePlanId: standardBase ? standardBase.id : 'plan-custom',
    basePlanName: standardBase ? standardBase.name : 'Custom Plan',
    billingCycle: isAnnual ? 'annual' : 'monthly',
    isAnnual,
    outlets: effectiveOutlets,
    branches: effectiveOutlets,
    staffCount: effectiveStaff,
    posTerminals: effectiveTerminals,
    includedOutlets,
    extraOutlets,
    includedStaff,
    extraStaff,
    includedTerminals,
    extraTerminals,
    baseCost,
    outletsCost,
    branchesCost: outletsCost,
    staffCost,
    terminalsCost,
    modulesCost,
    featuresCost: modulesCost,
    grossSubtotal,
    volumeDiscountPercent,
    volumeDiscountAmount,
    promoDiscountPercent,
    promoDiscountAmount,
    totalDiscountAmount,
    netPreTaxAmount,
    gstRate: PRICING_UNIT_RATES.gstRate,
    gstAmount,
    totalAmount,
    monthlyPrice: isAnnual ? effectiveMonthlyAnnual : totalAmount,
    annualPrice: isAnnual ? totalAmount : totalAmount * 12,
    effectiveMonthlyAnnual,
    annualSavings,
    savingsPercentage: isAnnual ? 20 : 0,
    minimumAcceptableFloor,
    itemizedModules,
    itemizedFeatures: itemizedModules,
  };
};

/**
 * Rule-Based Approval Engine
 * Classifies configuration into Path A, Path B, or Path C.
 */
export const evaluateApprovalPath = (config, requestedCustomPrice = null) => {
  const outlets = config.outlets || config.branches || 1;
  const staffCount = config.staffCount || 5;
  const selectedModules = config.selectedModuleIds || config.selectedFeatureIds || [];
  const manualDiscountPercent = config.manualDiscountPercent || 0;
  const requestedCustomTerms = config.requestedCustomTerms || '';

  const pricing = calculateCustomPlanPricing(config);
  const manualReviewReasons = [];

  // Condition 1: Custom software development or non-standard integrations
  const hasCustomDev = selectedModules.some((id) => {
    const mod = MODULE_CATALOG.find((m) => m.id === id);
    return mod && mod.requiresCustomDev;
  });

  if (hasCustomDev) {
    const devNames = selectedModules
      .map((id) => MODULE_CATALOG.find((m) => m.id === id))
      .filter((m) => m && m.requiresCustomDev)
      .map((m) => m.name)
      .join(', ');
    manualReviewReasons.push(`Custom software development required: ${devNames}. Requires engineering feasibility scoping.`);
  }

  // Condition 2: Scale threshold (> 10 outlets as per prompt requirement 6)
  if (outlets > AUTOMATION_LIMITS.manualReviewOutletThreshold) {
    manualReviewReasons.push(
      `Outlet count (${outlets}) exceeds standard automated allowance of ${AUTOMATION_LIMITS.manualReviewOutletThreshold}. Dedicated franchise account scoping required.`
    );
  }

  if (staffCount > AUTOMATION_LIMITS.manualReviewStaffThreshold) {
    manualReviewReasons.push(
      `Staff accounts (${staffCount}) exceed automated limit of ${AUTOMATION_LIMITS.manualReviewStaffThreshold}. High-concurrency database allocation required.`
    );
  }

  // Condition 3: Commercial discount exceptions
  if (manualDiscountPercent > AUTOMATION_LIMITS.maxAutomatedDiscountPercent) {
    manualReviewReasons.push(
      `Requested discount (${manualDiscountPercent}%) exceeds automated maximum (${AUTOMATION_LIMITS.maxAutomatedDiscountPercent}%). Finance approval required.`
    );
  }

  if (requestedCustomPrice !== null && requestedCustomPrice < pricing.minimumAcceptableFloor) {
    manualReviewReasons.push(
      `Requested price (₹${Number(requestedCustomPrice).toLocaleString('en-IN')}) is below minimum margin floor (₹${pricing.minimumAcceptableFloor.toLocaleString('en-IN')}). Margin exception review required.`
    );
  }

  // Condition 4: Non-standard legal terms
  if (requestedCustomTerms && requestedCustomTerms.trim().length > 10) {
    manualReviewReasons.push(`Special commercial/legal terms requested: "${requestedCustomTerms.trim()}". Requires business approval.`);
  }

  // If any exception condition triggered -> PATH C (Manual Review / Talk to Sales)
  if (manualReviewReasons.length > 0) {
    return {
      path: 'PATH_C',
      pathName: 'Path C — Manual Review & Custom Quotation',
      status: 'pending_review',
      requiresManualReview: true,
      canCheckoutImmediately: false,
      reasons: manualReviewReasons,
      pricing,
    };
  }

  // Check if Path B (Automated Enterprise Volume Rule)
  const isPathB = outlets > 5 && outlets <= 10;
  if (isPathB) {
    return {
      path: 'PATH_B',
      pathName: 'Path B — Automated Enterprise Approval',
      status: 'auto_approved',
      requiresManualReview: false,
      canCheckoutImmediately: true,
      reasons: [
        `Predefined enterprise scaling rules accommodate ${outlets} outlets with an automated ${pricing.volumeDiscountPercent}% volume discount.`,
        'All selected modules are production-ready with zero custom development overhead.',
      ],
      pricing,
    };
  }

  // Path A: Standard Automatic Approval
  return {
    path: 'PATH_A',
    pathName: 'Path A — Standard Instant Approval',
    status: 'auto_approved',
    requiresManualReview: false,
    canCheckoutImmediately: true,
    reasons: [
      'Satisfies all standard self-serve business policies.',
      'Instant automated provisioning and gateway checkout enabled.',
    ],
    pricing,
  };
};

/**
 * Server/Authoritative Validation
 * Verifies submitted amount against authoritative calculation before checkout and activation.
 */
export const validateAndAuthorizePricing = (config, submittedAmount, userRole = 'restaurant_owner') => {
  const approvalEval = evaluateApprovalPath(config);
  const authoritativeTotal = approvalEval.pricing.totalAmount;

  if (Math.abs(authoritativeTotal - submittedAmount) > 1) {
    return {
      isValid: false,
      error: `Pricing verification failed: submitted ₹${submittedAmount} does not match authoritative calculation ₹${authoritativeTotal}.`,
      errorCode: 'PRICING_TAMPER_DETECTED',
    };
  }

  if (approvalEval.requiresManualReview && userRole !== 'super_admin') {
    return {
      isValid: false,
      error: 'This configuration requires Super Admin review before checkout.',
      errorCode: 'MANUAL_APPROVAL_REQUIRED',
      reasons: approvalEval.reasons,
    };
  }

  return {
    isValid: true,
    approvalEval,
    authoritativePricing: approvalEval.pricing,
  };
};
