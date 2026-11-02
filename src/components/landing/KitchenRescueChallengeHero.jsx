import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Sparkles,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  Thermometer,
  ChefHat,
  ShoppingBag,
  PackageCheck,
  TrendingUp,
  RotateCcw,
  ArrowRight,
  ChevronRight,
  Layers,
  DollarSign,
  X,
  ShieldCheck,
  Utensils,
  Check,
  Activity,
  FileText,
  Send,
  Boxes,
  Flame,
  Info,
} from 'lucide-react';

// ============================================================================
// GRACEFUL FOOD IMAGE COMPONENT WITH FALLBACK
// ============================================================================
const FoodImage = ({
  src,
  alt,
  className = '',
  fallbackIcon: FallbackIcon = Utensils,
  fallbackBg = 'from-emerald-950 to-slate-900',
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br ${fallbackBg} text-emerald-400 p-2 text-center select-none border border-emerald-500/20 ${className}`}
        title={alt}
      >
        <FallbackIcon className="w-5 h-5 mb-0.5 opacity-80" />
        <span className="text-[9px] font-bold text-slate-300 truncate max-w-full px-1">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setHasError(true)}
      className={`object-cover ${className}`}
    />
  );
};

// ============================================================================
// DEMO INGREDIENTS DATA (REPRESENTATIVE COMMERCIAL KITCHEN PANTRY)
// ============================================================================
export const INITIAL_INGREDIENTS = [
  {
    id: 'chicken',
    name: 'Prime Grilled Chicken Patty',
    shortName: 'Prime Patty',
    category: 'Poultry / Cold-Chain',
    stockQty: 14.2,
    unit: 'kg',
    minThreshold: 10.0,
    unitCost: 240,
    batch: 'LOT-CHK-550',
    expiry: 'Tonight (18h left)',
    isExpiring: true,
    status: 'expiring',
    statusLabel: 'FEFO Priority',
    storage: 'Chiller #1 • -1°C',
    supplier: 'Prime Poultry Cold Chain (#V-120)',
    wasteRisk: 1240,
    image:
      'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600&auto=format&fit=crop&q=80',
    description: 'Fresh pre-marinated prime cutlets. Batch nearing 48h shelf life.',
  },
  {
    id: 'cheese',
    name: 'Aged Swiss & Cheddar Cheese',
    shortName: 'Aged Cheese',
    category: 'Dairy Walk-In',
    stockQty: 4.2,
    unit: 'kg',
    minThreshold: 10.0,
    unitCost: 380,
    batch: 'LOT-CHS-740',
    expiry: '08 Nov 2026',
    isExpiring: false,
    status: 'low',
    statusLabel: 'Low Stock Alert',
    storage: 'Dairy Walk-In • 2°C',
    supplier: 'Dairy Direct Logistics (#V-105)',
    reorderQty: 15.0,
    reorderCost: 5700,
    image:
      'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&auto=format&fit=crop&q=80',
    description: 'Block cheese for melting & grating. Stock level below safety buffer.',
  },
  {
    id: 'buns',
    name: 'Artisan Brioche Burger Buns',
    shortName: 'Brioche Buns',
    category: 'Bakery Station',
    stockQty: 48,
    unit: 'pcs',
    minThreshold: 24,
    unitCost: 9.0,
    batch: 'LOT-BUN-104',
    expiry: '04 Nov 2026 (4d)',
    isExpiring: false,
    status: 'healthy',
    statusLabel: 'Optimal Stock',
    storage: 'Dry Bakery Shelf • 22°C',
    supplier: 'Golden Crust Bakery (#V-101)',
    image:
      'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80',
    description: 'Handcrafted brioche buns with glossy butter glaze.',
  },
  {
    id: 'tomato',
    name: 'Heirloom Vine Tomatoes',
    shortName: 'Vine Tomato',
    category: 'Fresh Produce',
    stockQty: 16.5,
    unit: 'kg',
    minThreshold: 8.0,
    unitCost: 42,
    batch: 'LOT-TOM-881',
    expiry: '05 Nov 2026 (5d)',
    isExpiring: false,
    status: 'healthy',
    statusLabel: 'Optimal Stock',
    storage: 'Crisper Bay 2 • 8°C',
    supplier: 'FarmFresh Agri Supplies (#V-102)',
    image:
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
    description: 'Crisp cluster tomatoes, certified grade-A freshness.',
  },
  {
    id: 'greens',
    name: 'Hydroponic Greens & Basil',
    shortName: 'Fresh Greens',
    category: 'Fresh Greens',
    stockQty: 8.4,
    unit: 'kg',
    minThreshold: 5.0,
    unitCost: 65,
    batch: 'LOT-LET-410',
    expiry: '03 Nov 2026 (3d)',
    isExpiring: false,
    status: 'healthy',
    statusLabel: 'Optimal Stock',
    storage: 'Produce Chiller • 4°C',
    supplier: 'GreenLeaf Hydroponics (#V-108)',
    image:
      'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=600&auto=format&fit=crop&q=80',
    description: 'Pesticide-free hydroponic butterhead & sweet Italian basil.',
  },
  {
    id: 'sauce',
    name: 'White Truffle Garlic Emulsion',
    shortName: 'Truffle Aioli',
    category: 'Cold Prepared Sauces',
    stockQty: 6.0,
    unit: 'L',
    minThreshold: 3.0,
    unitCost: 180,
    batch: 'LOT-SAU-309',
    expiry: '07 Nov 2026 (7d)',
    isExpiring: false,
    status: 'healthy',
    statusLabel: 'Optimal Stock',
    storage: 'Sauce Well • 3°C',
    supplier: 'Chef Commissary Central (#V-110)',
    image:
      'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&auto=format&fit=crop&q=80',
    description: 'Slow-emulsified roasted garlic with Piedmont white truffle oil.',
  },
  {
    id: 'mushroom',
    name: 'Wild Portobello Mushrooms',
    shortName: 'Portobello',
    category: 'Fresh Produce',
    stockQty: 6.2,
    unit: 'kg',
    minThreshold: 4.0,
    unitCost: 140,
    batch: 'LOT-MSH-404',
    expiry: '02 Nov 2026 (2d)',
    isExpiring: false,
    status: 'healthy',
    statusLabel: 'Optimal Stock',
    storage: 'Produce Chiller • 4°C',
    supplier: 'Highland Fungi Co (#V-114)',
    image:
      'https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=600&auto=format&fit=crop&q=80',
    description: 'Hand-picked earthy portobello & cremini caps for pasta and burger toppings.',
  },
  {
    id: 'pasta',
    name: 'Artisan Bronze-Cut Penne',
    shortName: 'Artisan Penne',
    category: 'Dry Pantry / Grains',
    stockQty: 28.0,
    unit: 'kg',
    minThreshold: 15.0,
    unitCost: 85,
    batch: 'LOT-PEN-901',
    expiry: '15 Jan 2027 (90d)',
    isExpiring: false,
    status: 'healthy',
    statusLabel: 'Optimal Stock',
    storage: 'Dry Dry-Storage #2 • 20°C',
    supplier: 'Pastificio Molino Italia (#V-118)',
    image:
      'https://images.unsplash.com/photo-1621996346565-e3d5d6281699?w=600&auto=format&fit=crop&q=80',
    description: 'Traditional semolina extruded bronze-cut penne with sauce-gripping ridges.',
  },
];

// ============================================================================
// SIGNATURE RECIPES WITH FOOD COST & SELLING MARGINS
// ============================================================================
export const SIGNATURE_DISHES = [
  {
    id: 'burger',
    name: 'Artisan Brioche Gourmet Burger',
    shortName: 'Brioche Burger',
    station: 'Station 1 • Hot Grill Line',
    prepTime: '8 mins',
    sellingPrice: 380.0,
    foodCost: 112.5,
    marginPercent: '70.4%',
    plateImage:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=85',
    requiredIngredientIds: ['buns', 'chicken', 'cheese', 'tomato', 'sauce', 'greens'],
    costBreakdown: [
      { name: 'Brioche Bun', spec: '1 pc', cost: 9.0 },
      { name: 'Prime Patty', spec: '160g', cost: 38.4 },
      { name: 'Aged Cheese', spec: '75g', cost: 28.5 },
      { name: 'Vine Tomato & Greens', spec: '80g', cost: 18.6 },
      { name: 'Truffle Emulsion', spec: '30ml', cost: 18.0 },
    ],
  },
  {
    id: 'pizza',
    name: 'Wood-Fired Margherita Pizza',
    shortName: 'Margherita Pizza',
    station: 'Station 2 • Wood Oven',
    prepTime: '10 mins',
    sellingPrice: 520.0,
    foodCost: 142.0,
    marginPercent: '72.7%',
    plateImage:
      'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800&auto=format&fit=crop&q=85',
    requiredIngredientIds: ['cheese', 'tomato', 'greens', 'sauce'],
    costBreakdown: [
      { name: 'Sourdough Crust Base', spec: '240g', cost: 22.0 },
      { name: 'San Marzano Sauce', spec: '90ml', cost: 28.0 },
      { name: 'Fresh Fior & Cheddar', spec: '160g', cost: 62.0 },
      { name: 'Heirloom Tomato & Basil', spec: '110g', cost: 30.0 },
    ],
  },
  {
    id: 'pasta',
    name: 'Truffle Wild Mushroom Penne',
    shortName: 'Truffle Penne',
    station: 'Station 3 • Sauté Line',
    prepTime: '9 mins',
    sellingPrice: 440.0,
    foodCost: 121.0,
    marginPercent: '72.5%',
    plateImage:
      'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&auto=format&fit=crop&q=85',
    requiredIngredientIds: ['pasta', 'mushroom', 'sauce', 'cheese', 'greens'],
    costBreakdown: [
      { name: 'Artisan Bronze Penne', spec: '150g', cost: 24.0 },
      { name: 'Truffle Cream Base', spec: '120ml', cost: 48.0 },
      { name: 'Sautéed Portobello', spec: '90g', cost: 29.0 },
      { name: 'Aged Grated Cheese', spec: '40g', cost: 20.0 },
    ],
  },
  {
    id: 'salad',
    name: 'Mediterranean Harvest Bowl',
    shortName: 'Harvest Bowl',
    station: 'Station 4 • Cold Larder',
    prepTime: '6 mins',
    sellingPrice: 340.0,
    foodCost: 92.0,
    marginPercent: '72.9%',
    plateImage:
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=85',
    requiredIngredientIds: ['greens', 'tomato', 'cheese', 'chicken', 'mushroom'],
    costBreakdown: [
      { name: 'Hydroponic Greens & Herbs', spec: '120g', cost: 26.0 },
      { name: 'Heirloom Vine Tomato', spec: '90g', cost: 18.0 },
      { name: 'Aged Crumbled Cheese', spec: '50g', cost: 22.0 },
      { name: 'Grilled Herb Protein', spec: '100g', cost: 26.0 },
    ],
  },
];

// ============================================================================
// MAIN COMPONENT: KITCHEN RESCUE CHALLENGE HERO
// ============================================================================
export const KitchenRescueChallengeHero = ({ className = '' }) => {
  // Scenario state: 'fefo' (Challenge 1) | 'reorder' (Challenge 2) | 'cost' (Challenge 3)
  const [activeScenario, setActiveScenario] = useState('fefo');
  const [selectedDishId, setSelectedDishId] = useState('burger');
  const [ingredients, setIngredients] = useState(INITIAL_INGREDIENTS);
  const [selectedIngredientId, setSelectedIngredientId] = useState('chicken');

  // Challenge interaction progress
  const [fefoApplied, setFefoApplied] = useState(false);
  const [fefoAnimating, setFefoAnimating] = useState(false);
  const [poModalOpen, setPoModalOpen] = useState(false);
  const [poConfirmed, setPoConfirmed] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Reduced motion preference
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mq.matches);
    const handler = (e) => setIsReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const currentDish = useMemo(() => {
    return (
      SIGNATURE_DISHES.find((d) => d.id === selectedDishId) ||
      SIGNATURE_DISHES[0]
    );
  }, [selectedDishId]);

  // Selected ingredient object
  const selectedIngredient = useMemo(() => {
    return (
      ingredients.find((i) => i.id === selectedIngredientId) ||
      ingredients[0]
    );
  }, [ingredients, selectedIngredientId]);

  // Synchronize active scenario with appropriate ingredient focus
  useEffect(() => {
    if (activeScenario === 'fefo') {
      setSelectedIngredientId('chicken');
    } else if (activeScenario === 'reorder') {
      setSelectedIngredientId('cheese');
    }
  }, [activeScenario]);

  // When dish changes, ensure selected ingredient belongs to the dish if possible
  const handleSelectDish = (dishId) => {
    setSelectedDishId(dishId);
    const dish = SIGNATURE_DISHES.find((d) => d.id === dishId);
    if (dish && !dish.requiredIngredientIds.includes(selectedIngredientId)) {
      setSelectedIngredientId(dish.requiredIngredientIds[0]);
    }
  };

  // Helper: Trigger toast
  const showToast = useCallback((msg, duration = 4000) => {
    setToastMessage(msg);
    const t = setTimeout(() => setToastMessage(null), duration);
    return () => clearTimeout(t);
  }, []);

  // --------------------------------------------------------------------------
  // SCENARIO 1: ENFORCE FEFO ROTATION
  // --------------------------------------------------------------------------
  const handleApplyFefo = () => {
    setFefoAnimating(true);
    setTimeout(() => {
      setFefoAnimating(false);
      setFefoApplied(true);
      setIngredients((prev) =>
        prev.map((ing) =>
          ing.id === 'chicken'
            ? {
                ...ing,
                isExpiring: false,
                status: 'healthy',
                statusLabel: 'FEFO Rotated',
                stockQty: Math.max(0, +(ing.stockQty - 3.2).toFixed(1)),
              }
            : ing
        )
      );
      showToast(
        '✅ FEFO Rule Enforced! Batch LOT-CHK-550 dispatched to dinner hot line. ₹1,240 food waste prevented.'
      );
    }, 500);
  };

  // --------------------------------------------------------------------------
  // SCENARIO 2: GENERATE PURCHASE ORDER (DEMO)
  // --------------------------------------------------------------------------
  const handleConfirmDemoPO = () => {
    setPoModalOpen(false);
    setPoConfirmed(true);
    setIngredients((prev) =>
      prev.map((ing) =>
        ing.id === 'cheese'
          ? {
              ...ing,
              status: 'healthy',
              statusLabel: 'Replenished (+15kg)',
              stockQty: +(ing.stockQty + ing.reorderQty).toFixed(1),
            }
          : ing
      )
    );
    showToast(
      '📦 Demo Purchase Order #PO-8841 Generated! Stock replenishment scheduled (Demo Simulation).'
    );
  };

  // --------------------------------------------------------------------------
  // RESET DEMO TO INITIAL STATE
  // --------------------------------------------------------------------------
  const handleResetDemo = () => {
    setIngredients(INITIAL_INGREDIENTS);
    setFefoApplied(false);
    setFefoAnimating(false);
    setPoConfirmed(false);
    setPoModalOpen(false);
    setSelectedDishId('burger');
    setSelectedIngredientId('chicken');
    setActiveScenario('fefo');
    showToast('↺ Demo Reset! Challenge conditions and inventory restored.');
  };

  // Visible ingredients for current dish vs full kitchen
  const displayedIngredients = useMemo(() => {
    return ingredients.filter((ing) =>
      currentDish.requiredIngredientIds.includes(ing.id)
    );
  }, [ingredients, currentDish]);

  return (
    <div
      className={`relative select-none outline-none flex flex-col items-center justify-center w-full mx-auto ${className}`}
      role="region"
      aria-label="StockMate Kitchen Inventory Simulation"
    >
      {/* Background Ambient Glow */}
      <div className="absolute -inset-4 sm:-inset-6 rounded-3xl bg-gradient-to-tr from-emerald-500/15 via-[#071F15]/30 to-teal-500/10 blur-[80px] pointer-events-none" />

      {/* ====================================================================
          1. TOP INVITATION & SCENARIO BAR
         ==================================================================== */}
      <div className="relative z-20 w-full mb-3 sm:mb-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 backdrop-blur-xl shadow-xl">
          {/* Headline & Station Status */}
          <div className="flex items-center gap-3 text-left w-full md:w-auto">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
              <ChefHat className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-live-beacon" />
                <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                  Kitchen Inventory Simulation
                </span>
                <span className="text-[9px] font-mono text-slate-400 bg-white/5 border border-white/10 px-1.5 py-0.2 rounded">
                  Demo Workbench
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-extrabold text-white leading-tight truncate">
                Interactive Restaurant Line: Expiry, FEFO &amp; Food Cost Control
              </h3>
            </div>
          </div>

          {/* Interactive Challenge Scenario Pills & Reset */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Challenge 1: FEFO Expiry */}
            <button
              type="button"
              onClick={() => setActiveScenario('fefo')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeScenario === 'fefo'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/30 font-black'
                  : fefoApplied
                  ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/80'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-white/10'
              }`}
            >
              {fefoApplied ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              )}
              <span>1. FEFO Expiry</span>
            </button>

            {/* Challenge 2: Low Stock PO */}
            <button
              type="button"
              onClick={() => setActiveScenario('reorder')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeScenario === 'reorder'
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md shadow-rose-500/30 font-black'
                  : poConfirmed
                  ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/80'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-white/10'
              }`}
            >
              {poConfirmed ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              )}
              <span>2. Low Stock PO</span>
            </button>

            {/* Challenge 3: Recipe Margin */}
            <button
              type="button"
              onClick={() => setActiveScenario('cost')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeScenario === 'cost'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/30 font-black'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-white/10'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>3. Recipe Margins</span>
            </button>

            {/* Reset Button */}
            <button
              type="button"
              onClick={handleResetDemo}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-400 hover:text-white border border-white/10 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
              title="Reset Demo Simulation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* ====================================================================
          2. THE MAIN INVENTORY WORKBENCH (COMMERCIAL KITCHEN CONSOLE)
         ==================================================================== */}
      <div className="relative z-10 w-full rounded-3xl p-4 sm:p-5 lg:p-6 bg-gradient-to-b from-[#0b2017] via-[#081812] to-[#040e0a] border-2 border-emerald-500/30 shadow-2xl backdrop-blur-2xl overflow-hidden">
        {/* Subtle Kitchen Steel Texture */}
        <div className="absolute inset-0 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        {/* Console Header: Station Spec & Recipe Switcher */}
        <div className="relative z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2 text-left">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300">
              {currentDish.station}
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              FEFO Dispatch &amp; Batch Yield Tracking
            </span>
          </div>

          {/* Dish / Recipe Selector Tabs */}
          <div className="flex items-center gap-1.5 bg-black/50 p-1 rounded-xl border border-white/10 overflow-x-auto no-scrollbar">
            {SIGNATURE_DISHES.map((dish) => {
              const isSelected = dish.id === selectedDishId;
              return (
                <button
                  key={dish.id}
                  type="button"
                  onClick={() => handleSelectDish(dish.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{dish.shortName}</span>
                  <span
                    className={`text-[10px] font-mono px-1 py-0.2 rounded ${
                      isSelected
                        ? 'bg-black/25 text-emerald-950 font-black'
                        : 'text-emerald-400 font-semibold'
                    }`}
                  >
                    ₹{dish.sellingPrice}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Workbench Body: Structured 3-Column Layout */}
        <div className="relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-stretch">
          {/* ----------------------------------------------------------------
              LEFT PREP GASTRONORM WELLS (Top 3 Ingredients)
             ---------------------------------------------------------------- */}
          <div className="lg:col-span-3 flex flex-col gap-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Pantry Ingredients (A)
              </span>
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 rounded">
                Click to Inspect
              </span>
            </div>

            {displayedIngredients.slice(0, 3).map((ing) => (
              <IngredientCard
                key={ing.id}
                ingredient={ing}
                isSelected={selectedIngredientId === ing.id}
                isExpiringScenario={activeScenario === 'fefo' && ing.id === 'chicken'}
                isLowStockScenario={activeScenario === 'reorder' && ing.id === 'cheese'}
                isAnimating={fefoAnimating && ing.id === 'chicken'}
                onClick={() => setSelectedIngredientId(ing.id)}
              />
            ))}
          </div>

          {/* ----------------------------------------------------------------
              CENTERPIECE: SIGNATURE PLATED DISH & SCENARIO CONSOLE
             ---------------------------------------------------------------- */}
          <div className="lg:col-span-6 flex flex-col items-center justify-between p-3 rounded-2xl bg-black/35 border border-white/10 text-center relative">
            {/* Dish Photo & Specs Badge */}
            <div className="relative w-full flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 my-auto py-2">
              {/* Plated Culinary Dish Photo */}
              <div className="relative w-40 sm:w-48 md:w-52 h-40 sm:h-48 md:h-52 rounded-2xl sm:rounded-3xl bg-slate-950 border-2 border-emerald-500/40 shadow-2xl overflow-hidden shrink-0 group">
                <FoodImage
                  src={currentDish.plateImage}
                  alt={currentDish.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-slate-950/80 border border-white/20 text-[10px] font-mono font-bold text-emerald-300 backdrop-blur-md">
                  {currentDish.prepTime} Prep
                </span>
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-mono font-black shadow-sm">
                  {currentDish.marginPercent} Margin
                </span>
              </div>

              {/* Dish Financial Economics & Specifications */}
              <div className="text-left flex-1 min-w-0 space-y-2.5">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-bold block">
                    Recipe Breakdown &amp; Yield
                  </span>
                  <h4 className="text-base sm:text-lg font-black text-white leading-tight">
                    {currentDish.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Automated portioning linked to live supplier GRNs and kitchen walk-in bins.
                  </p>
                </div>

                {/* 3 Metric Pills: Selling Price, Cost, Margin */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-xl bg-slate-900/90 border border-white/10">
                    <span className="text-[9px] text-slate-400 block uppercase">Selling Price</span>
                    <strong className="text-sm font-black text-white">
                      ₹{currentDish.sellingPrice.toFixed(2)}
                    </strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/90 border border-white/10">
                    <span className="text-[9px] text-slate-400 block uppercase">Recipe Food Cost</span>
                    <strong className="text-sm font-black text-amber-300">
                      ₹{currentDish.foodCost.toFixed(2)}
                    </strong>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-between text-xs font-mono">
                  <span className="text-emerald-300 text-[11px] font-bold">
                    Gross Margin per Portion:
                  </span>
                  <span className="text-emerald-400 font-black text-sm">
                    +₹{(currentDish.sellingPrice - currentDish.foodCost).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Active Scenario Action Banner beneath plate */}
            <div className="w-full mt-3 pt-3 border-t border-white/10 text-left">
              {activeScenario === 'fefo' && (
                <div className="p-3 rounded-xl bg-amber-950/70 border border-amber-500/50 backdrop-blur-xl animate-fade-in shadow-lg">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                      <strong className="text-xs font-bold text-amber-200 uppercase tracking-wide">
                        Scenario 1: Expiring FEFO Batch (LOT-CHK-550)
                      </strong>
                    </div>
                    <span className="text-[9px] font-mono text-amber-300 bg-amber-900/60 px-1.5 py-0.5 rounded border border-amber-500/30 font-bold">
                      Prevent ₹1,240 Spoilage
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug mb-2.5">
                    <strong>Prime Chicken Patty</strong> has 18 hours shelf life remaining. StockMate
                    automatically flags it as <span className="text-amber-300 font-semibold">First-Expired, First-Out (FEFO)</span> to
                    deplete it during tonight&apos;s dinner rush before newer batches.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={fefoApplied || fefoAnimating}
                      onClick={handleApplyFefo}
                      className={`flex-1 py-2 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                        fefoApplied
                          ? 'bg-emerald-600/60 text-emerald-200 border border-emerald-400/40 cursor-default'
                          : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/30 hover:scale-[1.01] active:scale-[0.98]'
                      }`}
                    >
                      {fefoApplied ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                          <span>FEFO Enforced • Batch Dispatched</span>
                        </>
                      ) : (
                        <>
                          <ChefHat className="w-4 h-4" />
                          <span>Enforce FEFO Rotation (Demo)</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                    {fefoApplied && (
                      <button
                        type="button"
                        onClick={() => setActiveScenario('reorder')}
                        className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1 border border-white/10 cursor-pointer"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {activeScenario === 'reorder' && (
                <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/50 backdrop-blur-xl animate-fade-in shadow-lg">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse shrink-0" />
                      <strong className="text-xs font-bold text-rose-200 uppercase tracking-wide">
                        Scenario 2: Low Stock Safety Buffer Breach
                      </strong>
                    </div>
                    <span className="text-[9px] font-mono text-rose-300 bg-rose-900/60 px-1.5 py-0.5 rounded border border-rose-500/30 font-bold">
                      Stockout Risk
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug mb-2.5">
                    <strong>Aged Swiss &amp; Cheddar</strong> is at 4.2 kg (Safety buffer: 10.0 kg). Peak rush
                    stockout risk anticipated in 90 minutes. StockMate auto-calculates replenishment PO.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={poConfirmed}
                      onClick={() => setPoModalOpen(true)}
                      className={`flex-1 py-2 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                        poConfirmed
                          ? 'bg-emerald-600/60 text-emerald-200 border border-emerald-400/40 cursor-default'
                          : 'bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white shadow-rose-500/30 hover:scale-[1.01] active:scale-[0.98]'
                      }`}
                    >
                      {poConfirmed ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                          <span>Demo PO Created • +15 kg Inbound</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          <span>Generate Purchase Order (Demo)</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                    {poConfirmed && (
                      <button
                        type="button"
                        onClick={() => setActiveScenario('cost')}
                        className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1 border border-white/10 cursor-pointer"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {activeScenario === 'cost' && (
                <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 backdrop-blur-xl animate-fade-in shadow-lg">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                      <strong className="text-xs font-bold text-emerald-200 uppercase tracking-wide">
                        Scenario 3: Recipe Yield &amp; Cost Control
                      </strong>
                    </div>
                    <span className="text-[9px] font-mono text-emerald-300 bg-emerald-900/60 px-1.5 py-0.5 rounded border border-emerald-500/30 font-bold">
                      {currentDish.marginPercent} Profit
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Every ingredient portion is linked to receiving dock GRNs. Real-time food cost is locked at{' '}
                    <strong className="text-white">₹{currentDish.foodCost.toFixed(2)}</strong> ({((currentDish.foodCost / currentDish.sellingPrice) * 100).toFixed(1)}% of price), preventing kitchen portion creep and inventory variance.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ----------------------------------------------------------------
              RIGHT PREP GASTRONORM WELLS (Next Ingredients)
             ---------------------------------------------------------------- */}
          <div className="lg:col-span-3 flex flex-col gap-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Pantry Ingredients (B)
              </span>
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 rounded">
                Click to Inspect
              </span>
            </div>

            {displayedIngredients.slice(3, 6).map((ing) => (
              <IngredientCard
                key={ing.id}
                ingredient={ing}
                isSelected={selectedIngredientId === ing.id}
                isExpiringScenario={activeScenario === 'fefo' && ing.id === 'chicken'}
                isLowStockScenario={activeScenario === 'reorder' && ing.id === 'cheese'}
                isAnimating={false}
                onClick={() => setSelectedIngredientId(ing.id)}
              />
            ))}
          </div>
        </div>

        {/* ====================================================================
            3. INTEGRATED INGREDIENT INTELLIGENCE DOCK (INLINE INSPECTION PANEL)
           ==================================================================== */}
        <div className="relative z-20 mt-4 p-3.5 sm:p-4 rounded-2xl bg-black/50 border border-emerald-500/30 text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Left: Selected Ingredient Summary */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-emerald-400/40 shrink-0">
                <FoodImage
                  src={selectedIngredient.image}
                  alt={selectedIngredient.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h5 className="text-xs sm:text-sm font-black text-white">
                    {selectedIngredient.name}
                  </h5>
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                      selectedIngredient.status === 'expiring'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : selectedIngredient.status === 'low'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {selectedIngredient.statusLabel}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>Category: {selectedIngredient.category}</span>
                  <span>•</span>
                  <span>Batch: <strong className="text-slate-200">{selectedIngredient.batch}</strong></span>
                  <span>•</span>
                  <span>Storage: {selectedIngredient.storage}</span>
                </div>
              </div>
            </div>

            {/* Middle: Live Stock & Unit Economics */}
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="p-2 rounded-xl bg-slate-900/90 border border-white/10 text-center min-w-[90px]">
                <span className="text-[9px] text-slate-400 block uppercase">Available</span>
                <strong className="text-white text-xs sm:text-sm font-black">
                  {selectedIngredient.stockQty} {selectedIngredient.unit}
                </strong>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/90 border border-white/10 text-center min-w-[90px]">
                <span className="text-[9px] text-slate-400 block uppercase">Min Buffer</span>
                <strong className="text-slate-300 text-xs sm:text-sm font-bold">
                  {selectedIngredient.minThreshold} {selectedIngredient.unit}
                </strong>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/90 border border-white/10 text-center min-w-[90px]">
                <span className="text-[9px] text-slate-400 block uppercase">Unit Cost</span>
                <strong className="text-emerald-400 text-xs sm:text-sm font-black">
                  ₹{selectedIngredient.unitCost} / {selectedIngredient.unit}
                </strong>
              </div>
            </div>

            {/* Right: Quick Action Demo Button */}
            <div className="shrink-0">
              {selectedIngredient.status === 'low' ? (
                <button
                  type="button"
                  onClick={() => setPoModalOpen(true)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-500/20 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Reorder Required • Create PO</span>
                </button>
              ) : selectedIngredient.status === 'expiring' ? (
                <button
                  type="button"
                  disabled={fefoApplied}
                  onClick={handleApplyFefo}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-60"
                >
                  <ChefHat className="w-3.5 h-3.5" />
                  <span>{fefoApplied ? 'FEFO Dispatched' : 'Enforce FEFO Rotation'}</span>
                </button>
              ) : (
                <div className="px-3 py-2 rounded-xl bg-slate-900/80 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Optimal Safety Stock</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Hint */}
        <div className="relative z-20 mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Interactive Kitchen Workbench • Click recipe tabs or ingredients to inspect stock</span>
          </div>
          <span className="text-slate-500 bg-white/5 px-2 py-0.5 rounded border border-white/10 text-[9px] sm:text-[10px]">
            Illustrative Demo Simulation • No Live Orders
          </span>
        </div>
      </div>

      {/* ====================================================================
          4. DEMO PURCHASE ORDER PREVIEW MODAL
         ==================================================================== */}
      {poModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg p-5 sm:p-6 rounded-3xl bg-slate-900 border-2 border-emerald-500/40 shadow-2xl text-left text-white">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-black">StockMate Purchase Order Preview</h4>
                  <span className="text-xs font-mono text-emerald-400">PO-2026-8841 (Demo Simulated PO)</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPoModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* PO Details */}
            <div className="my-4 space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 grid grid-cols-2 gap-2 font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">SUPPLIER VENDOR:</span>
                  <strong className="text-white">Dairy Direct Logistics (#V-105)</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">DELIVERY WINDOW:</span>
                  <strong className="text-emerald-400">Tomorrow 07:00 AM (Receiving Dock)</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">CURRENT INVENTORY:</span>
                  <strong className="text-amber-400">4.2 kg (Buffer Min: 10.0 kg)</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">ESTIMATED SHORTFALL:</span>
                  <strong className="text-rose-400">-5.8 kg by 09:30 PM Rush</strong>
                </div>
              </div>

              {/* Order Line Item */}
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-sm">Aged Swiss &amp; Cheddar Cheese Blocks</div>
                  <div className="text-[11px] text-slate-300 font-mono">
                    Auto-Calculated Replenishment: +15.0 kg @ ₹380.00 / kg
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-emerald-300 font-mono">₹5,700.00</div>
                  <span className="text-[9px] text-slate-400 font-mono">Dock GRN Auto-Match</span>
                </div>
              </div>

              {/* Simulation Disclaimer */}
              <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Frontend Demo Simulation:</strong> Confirming this action generates a simulated demo PO
                  and updates the local inventory state. No real supplier order is placed.
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setPoModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDemoPO}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Confirm Demo Purchase Order</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-emerald-950/95 border-2 border-emerald-400/80 text-emerald-200 text-xs font-mono shadow-2xl backdrop-blur-xl flex items-center gap-2 animate-fade-in max-w-md text-center">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// HELPER SUBCOMPONENT: INGREDIENT CARD WITH LARGE CLEAR IMAGES & STOCK
// ============================================================================
const IngredientCard = ({
  ingredient,
  isSelected,
  isExpiringScenario,
  isLowStockScenario,
  isAnimating,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className={`group relative p-2.5 sm:p-3 rounded-2xl transition-all duration-300 cursor-pointer backdrop-blur-xl border text-left ${
        isAnimating ? 'scale-95 opacity-50 translate-x-2' : 'hover:scale-[1.02]'
      } ${
        isSelected
          ? 'bg-slate-900 border-emerald-400 ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-950/60'
          : isExpiringScenario
          ? 'bg-amber-950/80 border-amber-500/80 shadow-md shadow-amber-500/20 ring-1 ring-amber-400'
          : isLowStockScenario
          ? 'bg-rose-950/80 border-rose-500/80 shadow-md shadow-rose-500/20 ring-1 ring-rose-400'
          : 'bg-slate-900/70 border-white/10 hover:border-emerald-500/40 hover:bg-slate-800/80'
      }`}
      title={`Click to inspect ${ingredient.name}`}
    >
      <div className="flex items-center gap-3">
        {/* Ingredient Photo Thumbnail with Fallback */}
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border border-white/15 shrink-0 group-hover:border-emerald-400/60 transition-colors shadow-inner">
          <FoodImage
            src={ingredient.image}
            alt={ingredient.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          {/* Status Indicator Dot */}
          <span
            className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full border border-slate-950 ${
              ingredient.status === 'expiring'
                ? 'bg-amber-400 animate-ping'
                : ingredient.status === 'low'
                ? 'bg-rose-500 animate-ping'
                : 'bg-emerald-400'
            }`}
          />
        </div>

        {/* Content Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <h5 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
              {ingredient.shortName}
            </h5>
            <span
              className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold shrink-0 ${
                ingredient.status === 'expiring'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : ingredient.status === 'low'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {ingredient.statusLabel}
            </span>
          </div>

          {/* Stock Meter & Batch */}
          <div className="flex items-center justify-between text-[11px] font-mono mt-1 text-slate-300">
            <span className="font-black text-white">
              {ingredient.stockQty} {ingredient.unit}
            </span>
            <span className="text-slate-400 text-[10px] truncate max-w-[100px]">
              {ingredient.expiry}
            </span>
          </div>

          {/* Progress Bar of Stock Buffer */}
          <div className="w-full h-1.5 rounded-full bg-black/50 overflow-hidden mt-1.5 border border-white/5">
            <div
              className={`h-full transition-all duration-500 ${
                ingredient.status === 'expiring'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                  : ingredient.status === 'low'
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-400'
              }`}
              style={{
                width: `${Math.min(
                  100,
                  Math.max(
                    15,
                    (ingredient.stockQty / (ingredient.minThreshold * 2)) * 100
                  )
                )}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitchenRescueChallengeHero;
