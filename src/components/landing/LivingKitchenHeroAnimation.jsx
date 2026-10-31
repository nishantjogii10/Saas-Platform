import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  Thermometer,
  Scale,
  ChefHat,
  Send,
  X,
  Play,
  Pause,
  UtensilsCrossed,
  ArrowRight,
  TrendingUp,
  Package,
  Layers,
  ChevronRight,
  Check,
  DollarSign,
} from 'lucide-react';

// ============================================================================
// 4 SIGNATURE DISHES & PREP INGREDIENTS FOR LIVING KITCHEN
// ============================================================================
export const LIVING_KITCHEN_DISHES = [
  {
    id: 'burger',
    name: 'Artisan Brioche Gourmet Burger',
    shortName: 'Brioche Burger',
    station: 'Hot Prep • Station 1',
    sellingPrice: 380,
    foodCost: 112.5,
    marginPercent: '70.4%',
    prepTime: '8 mins',
    tag: 'Recipe Assembled • 100% FEFO Yield',
    plateImage:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=85',
    ingredients: [
      {
        id: 'burger_buns',
        name: 'Artisan Brioche Buns',
        category: 'Bakery',
        stockQty: 48,
        unit: 'pcs',
        minThreshold: 24,
        unitCost: 9.0,
        status: 'healthy',
        statusLabel: 'In Stock',
        batch: 'LOT-BUN-104',
        expiry: '04 Nov 2026 (4 Days)',
        storage: 'Bakery Shelf B • 22°C',
        fefoTag: 'Fresh Stock',
        supplier: 'Golden Crust Bakery (#V-101)',
        image:
          'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&auto=format&fit=crop&q=80',
        initialAngle: 0,
      },
      {
        id: 'burger_patty',
        name: 'Prime Grilled Chicken Patty',
        category: 'Poultry',
        stockQty: 18.2,
        unit: 'kg',
        minThreshold: 12.0,
        unitCost: 240,
        status: 'healthy',
        statusLabel: 'FEFO Priority',
        batch: 'LOT-CHK-550',
        expiry: '02 Nov 2026 (48 Hours)',
        storage: 'Meat Deep Chiller • -2°C',
        fefoTag: 'FEFO Priority',
        supplier: 'Prime Poultry Cold Chain (#V-120)',
        image:
          'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&auto=format&fit=crop&q=80',
        initialAngle: 1.25,
      },
      {
        id: 'burger_cheese',
        name: 'Aged Cheddar & Swiss',
        category: 'Refrigerated Dairy',
        stockQty: 6.8,
        unit: 'kg',
        minThreshold: 10.0,
        unitCost: 380,
        status: 'low',
        statusLabel: 'Low Stock',
        batch: 'LOT-CHS-740',
        expiry: '08 Nov 2026 (8 Days)',
        storage: 'Walk-In Dairy • 2°C',
        fefoTag: 'Low Stock • Reorder Required',
        supplier: 'Dairy Direct Logistics (#V-105)',
        image:
          'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&auto=format&fit=crop&q=80',
        initialAngle: 2.5,
      },
      {
        id: 'burger_tomato',
        name: 'Vine-Ripened Heirloom Tomato',
        category: 'Fresh Produce',
        stockQty: 14.5,
        unit: 'kg',
        minThreshold: 10.0,
        unitCost: 42,
        status: 'healthy',
        statusLabel: 'In Stock',
        batch: 'LOT-TOM-881',
        expiry: '05 Nov 2026 (5 Days)',
        storage: 'Crisper Bay 2 • 8°C',
        fefoTag: 'Fresh Stock',
        supplier: 'FarmFresh Agri Supplies (#V-102)',
        image:
          'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop&q=80',
        initialAngle: 3.75,
      },
      {
        id: 'burger_lettuce',
        name: 'Crisp Hydroponic Lettuce',
        category: 'Fresh Greens',
        stockQty: 4.2,
        unit: 'kg',
        minThreshold: 8.0,
        unitCost: 65,
        status: 'low',
        statusLabel: 'Low Stock',
        batch: 'LOT-LET-410',
        expiry: '03 Nov 2026 (3 Days)',
        storage: 'Chiller Unit A • 4°C',
        fefoTag: 'Low Stock • Reorder Required',
        supplier: 'GreenLeaf Hydroponics (#V-108)',
        image:
          'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400&auto=format&fit=crop&q=80',
        initialAngle: 5.0,
      },
    ],
  },
  {
    id: 'pizza',
    name: 'Wood-Fired Margherita Pizza',
    shortName: 'Margherita Pizza',
    station: 'Wood-Fired Oven • Station 2',
    sellingPrice: 520,
    foodCost: 142.0,
    marginPercent: '72.7%',
    prepTime: '10 mins',
    tag: 'Recipe Assembled • 100% FEFO Yield',
    plateImage:
      'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800&auto=format&fit=crop&q=85',
    ingredients: [
      {
        id: 'pizza_dough',
        name: 'Hand-Stretched Sourdough Dough',
        category: 'Bakery',
        stockQty: 36,
        unit: 'balls',
        minThreshold: 20,
        unitCost: 18.0,
        status: 'healthy',
        statusLabel: 'In Stock',
        batch: 'LOT-DGH-302',
        expiry: '24 Hours (Nov 1)',
        storage: 'Proofing Drawer • 18°C',
        fefoTag: 'FEFO Priority',
        supplier: 'Golden Crust Bakery (#V-101)',
        image:
          'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80',
        initialAngle: 0,
      },
      {
        id: 'pizza_sauce',
        name: 'San Marzano Tomato Reduction',
        category: 'Prepared Sauce',
        stockQty: 16.0,
        unit: 'kg',
        minThreshold: 10.0,
        unitCost: 55,
        status: 'healthy',
        statusLabel: 'In Stock',
        batch: 'LOT-SAU-812',
        expiry: '07 Nov 2026 (7 Days)',
        storage: 'Walk-In Sauce Bay • 4°C',
        fefoTag: 'Fresh Stock',
        supplier: 'Italian Pantry Direct (#V-111)',
        image:
          'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop&q=80',
        initialAngle: 1.25,
      },
      {
        id: 'pizza_mozzarella',
        name: 'Fresh Buffalo Mozzarella',
        category: 'Refrigerated Dairy',
        stockQty: 8.5,
        unit: 'kg',
        minThreshold: 6.0,
        unitCost: 380,
        status: 'healthy',
        statusLabel: 'In Stock',
        batch: 'LOT-MOZ-220',
        expiry: '06 Nov 2026 (6 Days)',
        storage: 'Walk-In Dairy • 2°C',
        fefoTag: 'Fresh Stock',
        supplier: 'Dairy Direct Logistics (#V-105)',
        image:
          'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&auto=format&fit=crop&q=80',
        initialAngle: 2.5,
      },
      {
        id: 'pizza_basil',
        name: 'Sweet Italian Garden Basil',
        category: 'Herbs & Aromatics',
        stockQty: 0.8,
        unit: 'kg',
        minThreshold: 1.5,
        unitCost: 180,
        status: 'critical',
        statusLabel: 'Expiry Soon',
        batch: 'LOT-BAS-115',
        expiry: '36 Hours (Nov 1)',
        storage: 'Herb Chamber • 6°C',
        fefoTag: 'Critical • Reorder Required',
        supplier: 'GreenLeaf Hydroponics (#V-108)',
        image:
          'https://images.unsplash.com/photo-1618375569909-3c35b1266b39?w=400&auto=format&fit=crop&q=80',
        initialAngle: 3.75,
      },
      {
        id: 'pizza_oil',
        name: 'Cold-Pressed Extra Virgin Olive Oil',
        category: 'Dry Stores',
        stockQty: 12.0,
        unit: 'L',
        minThreshold: 8.0,
        unitCost: 450,
        status: 'healthy',
        statusLabel: 'In Stock',
        batch: 'LOT-OIL-091',
        expiry: '30 Dec 2026 (60 Days)',
        storage: 'Dry Pantry Bay C • 20°C',
        fefoTag: 'Stable Stock',
        supplier: 'Italian Pantry Direct (#V-111)',
        image:
          'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop&q=80',
        initialAngle: 5.0,
      },
    ],
  },
  {
    id: 'pasta',
    name: 'Truffle & Herb Durum Penne',
    shortName: 'Truffle Penne',
    station: 'Pasta Fresca • Station 3',
    sellingPrice: 440,
    foodCost: 128.0,
    marginPercent: '70.9%',
    prepTime: '12 mins',
    tag: 'Recipe Assembled • 100% FEFO Yield',
    plateImage:
      'https://images.unsplash.com/photo-1621996346565-e3d5d6281699?w=800&auto=format&fit=crop&q=85',
    ingredients: [
      {
        id: 'pasta_penne',
        name: 'Durum Wheat Penne Rigate',
        category: 'Dry Goods',
        stockQty: 35.0,
        unit: 'kg',
        minThreshold: 15.0,
        unitCost: 85,
        status: 'healthy',
        statusLabel: 'In Stock',
        batch: 'LOT-PST-940',
        expiry: '18 Dec 2026 (48 Days)',
        storage: 'Ambient Pantry B • 21°C',
        fefoTag: 'Stable Stock',
        supplier: 'Italian Pantry Direct (#V-111)',
        image:
          'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=400&auto=format&fit=crop&q=80',
        initialAngle: 0,
      },
      {
        id: 'pasta_parmesan',
        name: 'Aged Shaved Parmesan',
        category: 'Refrigerated Dairy',
        stockQty: 5.4,
        unit: 'kg',
        minThreshold: 8.0,
        unitCost: 520,
        status: 'low',
        statusLabel: 'Low Stock',
        batch: 'LOT-PRM-420',
        expiry: '14 Nov 2026 (14 Days)',
        storage: 'Walk-In Dairy • 2°C',
        fefoTag: 'Low Stock • Reorder Required',
        supplier: 'Dairy Direct Logistics (#V-105)',
        image:
          'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&auto=format&fit=crop&q=80',
        initialAngle: 1.25,
      },
      {
        id: 'pasta_chicken',
        name: 'Smoked Chicken Breast Strips',
        category: 'Poultry',
        stockQty: 18.2,
        unit: 'kg',
        minThreshold: 12.0,
        unitCost: 240,
        status: 'healthy',
        statusLabel: 'FEFO Priority',
        batch: 'LOT-CHK-550',
        expiry: '02 Nov 2026 (48 Hours)',
        storage: 'Meat Deep Chiller • -2°C',
        fefoTag: 'FEFO Priority',
        supplier: 'Prime Poultry Cold Chain (#V-120)',
        image:
          'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&auto=format&fit=crop&q=80',
        initialAngle: 2.5,
      },
      {
        id: 'pasta_tomatoes',
        name: 'Blistered Cherry Tomatoes',
        category: 'Fresh Produce',
        stockQty: 14.5,
        unit: 'kg',
        minThreshold: 10.0,
        unitCost: 42,
        status: 'healthy',
        statusLabel: 'In Stock',
        batch: 'LOT-TOM-881',
        expiry: '05 Nov 2026 (5 Days)',
        storage: 'Crisper Bay 2 • 8°C',
        fefoTag: 'Fresh Stock',
        supplier: 'FarmFresh Agri Supplies (#V-102)',
        image:
          'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop&q=80',
        initialAngle: 3.75,
      },
      {
        id: 'pasta_herbs',
        name: 'Herb & Garlic Truffle Emulsion',
        category: 'Herbs & Aromatics',
        stockQty: 1.2,
        unit: 'kg',
        minThreshold: 2.0,
        unitCost: 320,
        status: 'low',
        statusLabel: 'Low Stock',
        batch: 'LOT-TRF-110',
        expiry: '04 Nov 2026 (4 Days)',
        storage: 'Herb Chamber • 6°C',
        fefoTag: 'Low Stock • Reorder Required',
        supplier: 'GreenLeaf Hydroponics (#V-108)',
        image:
          'https://images.unsplash.com/photo-1618375569909-3c35b1266b39?w=400&auto=format&fit=crop&q=80',
        initialAngle: 5.0,
      },
    ],
  },
  {
    id: 'salad',
    name: "Chef's Mediterranean Harvest Bowl",
    shortName: 'Harvest Salad Bowl',
    station: 'Garde Manger • Station 4',
    sellingPrice: 350,
    foodCost: 95.0,
    marginPercent: '72.9%',
    prepTime: '6 mins',
    tag: 'Recipe Assembled • 100% FEFO Yield',
    plateImage:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=85',
    ingredients: [
      {
        id: 'salad_greens',
        name: 'Organic Baby Spinach & Arugula',
        category: 'Fresh Greens',
        stockQty: 6.2,
        unit: 'kg',
        minThreshold: 5.0,
        unitCost: 75,
        status: 'healthy',
        statusLabel: 'In Stock',
        batch: 'LOT-SPN-210',
        expiry: '03 Nov 2026 (3 Days)',
        storage: 'Crisper Unit A • 4°C',
        fefoTag: 'Fresh Stock',
        supplier: 'GreenLeaf Hydroponics (#V-108)',
        image:
          'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400&auto=format&fit=crop&q=80',
        initialAngle: 0,
      },
      {
        id: 'salad_feta',
        name: 'Greek Feta Cheese Crumbles',
        category: 'Refrigerated Dairy',
        stockQty: 7.0,
        unit: 'kg',
        minThreshold: 5.0,
        unitCost: 410,
        status: 'healthy',
        statusLabel: 'In Stock',
        batch: 'LOT-FTA-601',
        expiry: '12 Nov 2026 (12 Days)',
        storage: 'Walk-In Dairy • 2°C',
        fefoTag: 'Fresh Stock',
        supplier: 'Dairy Direct Logistics (#V-105)',
        image:
          'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&auto=format&fit=crop&q=80',
        initialAngle: 1.25,
      },
      {
        id: 'salad_olives',
        name: 'Kalamata Black Olives',
        category: 'Dry Goods',
        stockQty: 9.5,
        unit: 'kg',
        minThreshold: 5.0,
        unitCost: 260,
        status: 'healthy',
        statusLabel: 'In Stock',
        batch: 'LOT-OLV-442',
        expiry: '30 Nov 2026 (30 Days)',
        storage: 'Ambient Pantry D • 20°C',
        fefoTag: 'Stable Stock',
        supplier: 'Italian Pantry Direct (#V-111)',
        image:
          'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop&q=80',
        initialAngle: 2.5,
      },
      {
        id: 'salad_tomatoes',
        name: 'Heirloom Vine Tomatoes',
        category: 'Fresh Produce',
        stockQty: 14.5,
        unit: 'kg',
        minThreshold: 10.0,
        unitCost: 42,
        status: 'healthy',
        statusLabel: 'In Stock',
        batch: 'LOT-TOM-881',
        expiry: '05 Nov 2026 (5 Days)',
        storage: 'Crisper Bay 2 • 8°C',
        fefoTag: 'Fresh Stock',
        supplier: 'FarmFresh Agri Supplies (#V-102)',
        image:
          'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop&q=80',
        initialAngle: 3.75,
      },
      {
        id: 'salad_seeds',
        name: 'Roasted Pumpkin Seeds & Herbs',
        category: 'Dry Goods',
        stockQty: 8.0,
        unit: 'kg',
        minThreshold: 4.0,
        unitCost: 190,
        status: 'healthy',
        statusLabel: 'In Stock',
        batch: 'LOT-PMP-118',
        expiry: '30 Dec 2026 (60 Days)',
        storage: 'Dry Stores Pallet C',
        fefoTag: 'Stable Stock',
        supplier: 'Maha Agri Wholesale (#V-114)',
        image:
          'https://images.unsplash.com/photo-1618375569909-3c35b1266b39?w=400&auto=format&fit=crop&q=80',
        initialAngle: 5.0,
      },
    ],
  },
];

/**
 * LivingKitchenHeroAnimation
 *
 * Refined and enlarged 3D Food Animation:
 * - Substantial desktop visual presence (480–520px)
 * - Clear, high-res plated food dish in center (320–360px)
 * - 5 orbiting ingredients with SVG filaments and stock tags
 * - Integrated, clean horizontal dish selector row above
 * - Interactive ingredient selection displaying stock, expiry, and PO demo
 */
export const LivingKitchenHeroAnimation = ({ className = '' }) => {
  const [dishIndex, setDishIndex] = useState(0);
  const [cycleProgress, setCycleProgress] = useState(0);
  const cycleProgressRef = useRef(0);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [poDemoDispatched, setPoDemoDispatched] = useState(false);

  // Responsive width detection
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mq.matches);
    const handler = (e) => setIsReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Continuous animation timeline loop
  useEffect(() => {
    let animId;
    let lastTime = performance.now();
    const cycleDurationMs = 13500; // 13.5s per recipe lifecycle

    const animate = (currentTime) => {
      const delta = Math.min(currentTime - lastTime, 64);
      lastTime = currentTime;

      if (isPlaying && !isReducedMotion) {
        const speedMultiplier = isHovered ? 0.35 : 1.0;
        cycleProgressRef.current += (delta / cycleDurationMs) * speedMultiplier;

        if (cycleProgressRef.current >= 1.0) {
          cycleProgressRef.current = 0.0;
          setDishIndex((prev) => (prev + 1) % LIVING_KITCHEN_DISHES.length);
        }

        setCycleProgress(cycleProgressRef.current);
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isHovered, isReducedMotion]);

  const currentDish = LIVING_KITCHEN_DISHES[dishIndex] || LIVING_KITCHEN_DISHES[0];

  const handleSelectDish = (index) => {
    setDishIndex(index);
    cycleProgressRef.current = 0.0;
    setCycleProgress(0.0);
    setSelectedIngredient(null);
  };

  const handleTriggerPoDemo = () => {
    setPoDemoDispatched(true);
    setTimeout(() => {
      setPoDemoDispatched(false);
    }, 2800);
  };

  // Timeline progress (0.0 to 1.0)
  const t = cycleProgress;

  let assemblyFactor = 0;
  let isPlatedPhase = false;
  let platedOpacity = 0;

  if (t < 0.38) {
    assemblyFactor = 0;
    isPlatedPhase = false;
    platedOpacity = 0;
  } else if (t >= 0.38 && t < 0.62) {
    const sub = (t - 0.38) / 0.24;
    assemblyFactor = sub < 0.5 ? 4 * sub * sub * sub : 1 - Math.pow(-2 * sub + 2, 3) / 2;
    isPlatedPhase = false;
    platedOpacity = Math.max(0, (sub - 0.2) / 0.8);
  } else if (t >= 0.62 && t < 0.85) {
    assemblyFactor = 1;
    isPlatedPhase = true;
    platedOpacity = 1;
  } else {
    const sub = (t - 0.85) / 0.15;
    const easeOut = 1 - Math.pow(1 - sub, 3);
    assemblyFactor = 1 - easeOut;
    isPlatedPhase = false;
    platedOpacity = Math.max(0, 1 - sub * 2.2);
  }

  // Dimensions: Significantly enlarged for prominent hero focus
  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;
  const maxRadiusX = isMobile ? 125 : isTablet ? 165 : 205;
  const maxRadiusY = isMobile ? 70 : isTablet ? 90 : 115;

  return (
    <div
      className={`relative select-none outline-none flex flex-col items-center justify-center w-full ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="region"
      aria-label="StockMate Living Kitchen: Organic Recipe Assembly Animation"
    >
      {/* Dynamic Ambient Emerald Backlight */}
      <div className="absolute w-[520px] sm:w-[680px] lg:w-[760px] h-[520px] sm:h-[680px] rounded-full bg-gradient-to-tr from-emerald-500/18 via-[#071A13]/40 to-teal-500/12 blur-[140px] pointer-events-none" />

      {/* Ground Pedestal Floor Shadow */}
      <div className="absolute bottom-4 w-[420px] sm:w-[580px] lg:w-[680px] h-[36px] rounded-full bg-slate-950/90 blur-2xl pointer-events-none" />

      {/* ==================================================================
          1. CLEAN HORIZONTAL DISH SELECTOR ROW (ABOVE ANIMATION)
         ================================================================== */}
      <div className="relative z-30 mb-5 sm:mb-7 flex items-center justify-center w-full px-2">
        <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 backdrop-blur-xl shadow-xl max-w-full overflow-x-auto no-scrollbar">
          {LIVING_KITCHEN_DISHES.map((dish, idx) => {
            const isSelected = idx === dishIndex;
            return (
              <button
                key={dish.id}
                type="button"
                onClick={() => handleSelectDish(idx)}
                className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-600/30 ring-1 ring-emerald-400'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{dish.shortName}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isSelected ? 'bg-black/30 text-emerald-200' : 'text-emerald-400 bg-emerald-950/50'
                  }`}
                >
                  ₹{dish.sellingPrice}
                </span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-pulse shrink-0" />
                )}
              </button>
            );
          })}

          <div className="w-[1px] h-5 bg-white/10 mx-1 hidden sm:block" />

          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer shrink-0"
            title={isPlaying ? 'Pause Animation' : 'Resume Animation'}
            aria-label={isPlaying ? 'Pause' : 'Resume'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* ==================================================================
          2. THE PROMINENT LIVING KITCHEN 3D STAGE (480px – 520px VISUAL SIZE)
         ================================================================== */}
      <div className="relative w-[330px] sm:w-[440px] md:w-[480px] lg:w-[520px] h-[370px] sm:h-[420px] lg:h-[450px] flex items-center justify-center perspective-[1200px]">
        {/* Dynamic Curved SVG Filament Connector Lines */}
        <svg
          viewBox="-260 -225 520 450"
          className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="filamentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {currentDish.ingredients.map((ing) => {
            const angle = ing.initialAngle + t * Math.PI * 2;
            const currentR_X = maxRadiusX * (1 - assemblyFactor * 0.82);
            const currentR_Y = maxRadiusY * (1 - assemblyFactor * 0.82);

            const x = Math.sin(angle) * currentR_X;
            const y = Math.cos(angle) * currentR_Y;

            const controlX = x * 0.5 + Math.cos(angle) * 16;
            const controlY = y * 0.5 - Math.sin(angle) * 16;

            return (
              <path
                key={ing.id}
                d={`M 0 0 Q ${controlX} ${controlY} ${x} ${y}`}
                fill="none"
                stroke="url(#filamentGradient)"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                opacity={Math.max(0.2, 1 - assemblyFactor * 1.2)}
              />
            );
          })}
        </svg>

        {/* ----------------------------------------------------------------
            CENTERPIECE: LARGE CHEF CERAMIC PLATE & CRISP FOOD IMAGERY (320-360px)
           ---------------------------------------------------------------- */}
        <div className="relative z-10 flex items-center justify-center pointer-events-none">
          {/* Outer Radiant Ambient Halo */}
          <div
            className={`absolute rounded-full transition-all duration-700 ${
              isPlatedPhase
                ? 'w-[300px] sm:w-[370px] lg:w-[410px] h-[300px] sm:h-[370px] lg:h-[410px] bg-gradient-to-tr from-emerald-500/25 via-teal-400/20 to-amber-400/15 blur-2xl scale-105'
                : 'w-[250px] sm:w-[320px] lg:w-[350px] h-[250px] sm:h-[320px] lg:h-[350px] bg-emerald-500/10 blur-xl scale-95'
            }`}
          />

          {/* Large Chef Ceramic Prep Plate */}
          <div className="relative w-[210px] sm:w-[270px] md:w-[290px] lg:w-[310px] h-[210px] sm:h-[270px] md:h-[290px] lg:h-[310px] rounded-full bg-gradient-to-b from-slate-900 via-[#071A13] to-slate-950 border-2 border-emerald-500/40 shadow-2xl flex items-center justify-center overflow-hidden">
            {/* Concentric Kitchen Coordinates */}
            <div className="absolute inset-3 rounded-full border border-white/10" />
            <div className="absolute inset-8 rounded-full border border-dashed border-emerald-500/30" />
            <div className="absolute inset-14 rounded-full border border-white/5" />

            {/* Crisp Plated Restaurant Dish Visual */}
            <div
              className="absolute inset-4 rounded-full overflow-hidden transition-all duration-500 pointer-events-auto cursor-pointer shadow-inner"
              style={{
                opacity: platedOpacity,
                transform: `scale(${0.78 + platedOpacity * 0.22})`,
              }}
              title={`${currentDish.name} • Click to inspect recipe`}
            >
              <img
                src={currentDish.plateImage}
                alt={currentDish.name}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>

            {/* Assembling Prep State Display */}
            {!isPlatedPhase && platedOpacity < 0.35 && (
              <div className="relative z-10 flex flex-col items-center justify-center text-center p-4">
                <ChefHat className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400 animate-pulse mb-1.5" />
                <span className="text-sm sm:text-base font-black text-white leading-tight font-serif">
                  {currentDish.name}
                </span>
                <span className="text-[10px] sm:text-xs font-mono text-emerald-400 mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Assembling Live Recipe...</span>
                </span>
              </div>
            )}
          </div>

          {/* Plated Completion Margin Pulse Badge */}
          {isPlatedPhase && (
            <div className="absolute -bottom-5 sm:-bottom-6 z-20 flex flex-col items-center animate-fade-in pointer-events-auto">
              <div className="px-4 py-2 rounded-full bg-slate-950/95 border border-emerald-400/90 shadow-2xl backdrop-blur-xl flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-live-beacon" />
                <span className="text-xs sm:text-sm font-mono font-bold text-white">
                  Recipe Cost: ₹{currentDish.foodCost.toFixed(2)}
                </span>
                <span className="text-[11px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded shadow-xs">
                  {currentDish.marginPercent} Margin
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ----------------------------------------------------------------
            3. ORBITING INGREDIENTS WITH VISIBLE STOCK & STATUS TAGS
           ---------------------------------------------------------------- */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {currentDish.ingredients.map((ing, idx) => {
            const angle = ing.initialAngle + t * Math.PI * 2;
            const currentRadiusX = maxRadiusX * (1 - assemblyFactor * 0.82);
            const currentRadiusY = maxRadiusY * (1 - assemblyFactor * 0.82);

            const x = Math.sin(angle) * currentRadiusX;
            const y = Math.cos(angle) * currentRadiusY + Math.sin(t * Math.PI * 4 + idx) * 7;
            const z = (Math.cos(angle) - 1) * 70;

            const cosNorm = Math.cos(angle);
            const scale = (0.80 + 0.30 * Math.max(0, (cosNorm + 1) / 2)) * (1 - assemblyFactor * 0.32);
            const opacity = Math.max(0.3, 1 - assemblyFactor * 0.9);
            const zIndex = Math.round(100 + cosNorm * 50);

            const isSelected = selectedIngredient?.id === ing.id;

            return (
              <div
                key={ing.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIngredient(ing);
                }}
                className={`absolute pointer-events-auto cursor-pointer transition-shadow duration-300 ${
                  isSelected ? 'ring-2 ring-emerald-400 shadow-xl shadow-emerald-500/40' : ''
                }`}
                style={{
                  transform: `translate3d(${x}px, ${y}px, ${z}px) scale(${scale})`,
                  zIndex,
                  opacity,
                  transition: 'transform 0.12s ease-out, opacity 0.2s ease',
                }}
                title={`Click to inspect ${ing.name} inventory details`}
              >
                {/* Floating Ingredient Card */}
                <div
                  className={`flex items-center gap-2.5 p-1.5 pr-3.5 rounded-full backdrop-blur-xl border transition-all duration-300 group shadow-2xl ${
                    ing.status === 'critical'
                      ? 'bg-rose-950/85 border-rose-500/60 hover:border-rose-400'
                      : ing.status === 'low'
                      ? 'bg-amber-950/85 border-amber-500/60 hover:border-amber-400'
                      : 'bg-slate-900/90 border-white/20 hover:border-emerald-400/80'
                  }`}
                >
                  {/* Circular Food Photo */}
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-emerald-400/50 shadow-inner shrink-0">
                    <img
                      src={ing.image}
                      alt={ing.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${
                        ing.status === 'critical'
                          ? 'bg-rose-500'
                          : ing.status === 'low'
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                    />
                  </div>

                  {/* Concise Pill Information */}
                  <div className="text-left leading-tight">
                    <div className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1">
                      <span>{ing.name.split(' ')[0]}</span>
                    </div>
                    <div
                      className={`text-[10px] sm:text-[11px] font-mono font-semibold ${
                        ing.status === 'critical'
                          ? 'text-rose-400'
                          : ing.status === 'low'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {ing.stockQty} {ing.unit} • {ing.statusLabel}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ==================================================================
          4. INTERACTIVE INVENTORY DOSSIER (EXPANDED ON CLICK)
         ================================================================== */}
      {selectedIngredient && (
        <div className="relative z-40 mt-4 w-full max-w-[560px] px-2 animate-fade-in">
          <div
            className={`p-4 sm:p-5 rounded-3xl backdrop-blur-2xl border shadow-2xl ${
              selectedIngredient.status === 'critical'
                ? 'bg-rose-950/95 border-rose-500/60 shadow-rose-950/40'
                : selectedIngredient.status === 'low'
                ? 'bg-amber-950/95 border-amber-500/60 shadow-amber-950/40'
                : 'bg-slate-950/95 border-emerald-500/40 shadow-emerald-950/40'
            }`}
          >
            {/* Header with Close */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span
                  className={`w-3 h-3 rounded-full ${
                    selectedIngredient.status === 'critical'
                      ? 'bg-rose-500 animate-ping'
                      : selectedIngredient.status === 'low'
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-emerald-400'
                  }`}
                />
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white leading-tight">
                    {selectedIngredient.name}
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">
                    {selectedIngredient.category} • Supplier: {selectedIngredient.supplier}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedIngredient(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close Dossier"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3.5 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/10">
                <span className="text-[10px] text-slate-400 block">Available Stock:</span>
                <strong className="text-white text-sm font-bold">
                  {selectedIngredient.stockQty} {selectedIngredient.unit}
                </strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/10">
                <span className="text-[10px] text-slate-400 block">Min Threshold:</span>
                <strong className="text-slate-300 text-xs">
                  {selectedIngredient.minThreshold} {selectedIngredient.unit}
                </strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/10">
                <span className="text-[10px] text-slate-400 block">Batch Code:</span>
                <strong className="text-slate-300 text-[10px] block truncate">
                  {selectedIngredient.batch}
                </strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/10">
                <span className="text-[10px] text-slate-400 block">Expiry / FEFO:</span>
                <strong
                  className={`text-[10px] block truncate ${
                    selectedIngredient.status !== 'healthy' ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {selectedIngredient.expiry}
                </strong>
              </div>
            </div>

            {/* Low-Stock Reorder Action Button */}
            {selectedIngredient.status !== 'healthy' && (
              <div className="mt-3.5 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Stock level below minimum threshold. Reorder required.</span>
                </div>

                <button
                  type="button"
                  onClick={handleTriggerPoDemo}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Generate Purchase Order (Demo)</span>
                </button>
              </div>
            )}

            {/* Simulated PO Confirmation Toast */}
            {poDemoDispatched && (
              <div className="mt-3 p-2.5 rounded-xl bg-emerald-900/90 border border-emerald-400/50 text-xs text-emerald-200 font-mono flex items-center gap-2 animate-fade-in">
                <Check className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>
                  Demo PO #PO-8821 dispatched to {selectedIngredient.supplier} • Stock update simulated (Demo Data)
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LivingKitchenHeroAnimation;
