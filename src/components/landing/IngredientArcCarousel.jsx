import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  Package,
  Layers,
  ChefHat,
  ArrowRight,
  ShoppingCart,
  Send,
  X,
  RefreshCw,
  Scale,
  DollarSign,
  UtensilsCrossed,
  Info,
  Eye,
  Sliders,
} from 'lucide-react';

// ============================================================================
// 1. 8 CONTINUOUS FOOD DISHES WITH LIVE BOM & OPERATIONAL METRICS
// ============================================================================
export const DISHES = [
  {
    id: 'burger',
    name: 'Signature Brioche Burger',
    category: 'Gourmet Specialty',
    sellingPrice: 380,
    recipeCost: 112.5,
    prepTime: '8 mins',
    description: 'Double grilled prime chicken patty with aged cheddar, caramelized red onions, vine tomatoes, and crisp hydroponic lettuce.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=700&auto=format&fit=crop&q=80',
    ingredients: [
      { id: 'brioche_bun', portion: '2 pcs', portionCost: 18.0 },
      { id: 'chicken', portion: '150g', portionCost: 36.0 },
      { id: 'cheese', portion: '30g', portionCost: 11.4 },
      { id: 'tomatoes', portion: '60g', portionCost: 2.52 },
      { id: 'lettuce', portion: '35g', portionCost: 2.28 },
      { id: 'onions', portion: '40g', portionCost: 1.28 },
    ],
  },
  {
    id: 'pizza',
    name: 'Wood-Fired Margherita Pizza',
    category: 'Italian Oven',
    sellingPrice: 520,
    recipeCost: 142.0,
    prepTime: '10 mins',
    description: 'Hand-stretched sourdough crust, crushed San Marzano tomato reduction, buffalo mozzarella, and aromatic sweet basil leaves.',
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=700&auto=format&fit=crop&q=80',
    ingredients: [
      { id: 'mozzarella', portion: '140g', portionCost: 53.2 },
      { id: 'tomatoes', portion: '120g', portionCost: 5.04 },
      { id: 'basil', portion: '20g', portionCost: 3.6 },
      { id: 'onions', portion: '35g', portionCost: 1.12 },
    ],
  },
  {
    id: 'pasta',
    name: 'Truffle & Herb Penne Pasta',
    category: 'Pasta Fresca',
    sellingPrice: 440,
    recipeCost: 128.0,
    prepTime: '12 mins',
    description: 'Freshly tossed durum penne in garlic emulsion, blistered heirloom tomatoes, smoked chicken, shaved parmesan, and garden basil.',
    image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281699?w=700&auto=format&fit=crop&q=80',
    ingredients: [
      { id: 'pasta_penne', portion: '160g', portionCost: 18.5 },
      { id: 'chicken', portion: '120g', portionCost: 28.8 },
      { id: 'parmesan', portion: '45g', portionCost: 17.1 },
      { id: 'tomatoes', portion: '80g', portionCost: 3.36 },
      { id: 'basil', portion: '15g', portionCost: 2.7 },
    ],
  },
  {
    id: 'salad',
    name: 'Mediterranean Crisper Salad',
    category: 'Healthy & Prep Bar',
    sellingPrice: 320,
    recipeCost: 78.4,
    prepTime: '5 mins',
    description: 'Organic butterhead lettuce, heirloom cocktail tomatoes, feta crumbles, red onion rings, fresh dill, and cold-pressed dressing.',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=700&auto=format&fit=crop&q=80',
    ingredients: [
      { id: 'lettuce', portion: '120g', portionCost: 7.8 },
      { id: 'tomatoes', portion: '90g', portionCost: 3.78 },
      { id: 'onions', portion: '45g', portionCost: 1.44 },
      { id: 'cheese', portion: '40g', portionCost: 15.2 },
      { id: 'basil', portion: '20g', portionCost: 3.6 },
    ],
  },
  {
    id: 'sandwich',
    name: 'Smoked Chicken Artisan Club',
    category: 'Café & Bistro',
    sellingPrice: 360,
    recipeCost: 105.0,
    prepTime: '7 mins',
    description: 'Toasted sourdough panini, herb-roasted chicken breast, curly green lettuce, beefsteak tomato slices, and melted Swiss cheese.',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=700&auto=format&fit=crop&q=80',
    ingredients: [
      { id: 'chicken', portion: '140g', portionCost: 33.6 },
      { id: 'lettuce', portion: '30g', portionCost: 1.95 },
      { id: 'tomatoes', portion: '50g', portionCost: 2.1 },
      { id: 'cheese', portion: '35g', portionCost: 13.3 },
      { id: 'brioche_bun', portion: '2 pcs', portionCost: 18.0 },
    ],
  },
  {
    id: 'salmon',
    name: 'Pan-Seared Herb Salmon Bowl',
    category: 'Seafood & Grills',
    sellingPrice: 680,
    recipeCost: 210.0,
    prepTime: '14 mins',
    description: 'Fresh Atlantic salmon fillet pan-seared with dill emulsion, served over aged jasmine rice, steamed asparagus, and blistered tomatoes.',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700&auto=format&fit=crop&q=80',
    ingredients: [
      { id: 'salmon_fillet', portion: '180g', portionCost: 145.0 },
      { id: 'asparagus', portion: '60g', portionCost: 18.0 },
      { id: 'tomatoes', portion: '50g', portionCost: 2.1 },
      { id: 'basil', portion: '15g', portionCost: 2.7 },
    ],
  },
  {
    id: 'paneer',
    name: 'Claypot Paneer Tikka Masala',
    category: 'Royal Indian Kitchen',
    sellingPrice: 420,
    recipeCost: 118.0,
    prepTime: '11 mins',
    description: 'Char-grilled fresh malai paneer cubes simmered in spiced tomato makhani reduction, finished with kasuri methi and fresh dairy cream.',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=700&auto=format&fit=crop&q=80',
    ingredients: [
      { id: 'paneer_block', portion: '160g', portionCost: 42.0 },
      { id: 'tomatoes', portion: '120g', portionCost: 5.04 },
      { id: 'onions', portion: '60g', portionCost: 1.92 },
      { id: 'cheese', portion: '25g', portionCost: 9.5 },
    ],
  },
  {
    id: 'tacos',
    name: 'Crispy Avocado & Lime Tacos',
    category: 'Street Kitchen',
    sellingPrice: 340,
    recipeCost: 88.0,
    prepTime: '6 mins',
    description: 'Three stone-ground corn tortillas with crisp Hass avocado slices, charred sweet corn, cotija crumbles, and chipotle lime aioli.',
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=700&auto=format&fit=crop&q=80',
    ingredients: [
      { id: 'avocado', portion: '90g', portionCost: 34.0 },
      { id: 'tomatoes', portion: '50g', portionCost: 2.1 },
      { id: 'lettuce', portion: '35g', portionCost: 2.28 },
      { id: 'onions', portion: '30g', portionCost: 0.96 },
    ],
  },
];

// ============================================================================
// 2. LIVE INGREDIENT CATALOG (WAREHOUSE TELEMETRY & FEFO TRACKING)
// ============================================================================
export const INGREDIENT_CATALOG = {
  brioche_bun: {
    id: 'brioche_bun',
    name: 'Artisan Brioche Buns',
    category: 'Bakery',
    stockQty: 48,
    unit: 'pcs',
    minThreshold: 24,
    status: 'healthy',
    unitCost: 9.0,
    supplier: 'Golden Crust Bakery (#V-101)',
    batch: 'BATCH-2026-BUN-104',
    expiry: '4 Days (Nov 4, 2026)',
    storage: 'Bakery Shelf B (Ambient 22°C)',
    suggestedReorder: 60,
    fefoRank: 'Safe Rotation',
  },
  chicken: {
    id: 'chicken',
    name: 'Prime Chicken Breast',
    category: 'Poultry',
    stockQty: 18.2,
    unit: 'kg',
    minThreshold: 12.0,
    status: 'healthy',
    unitCost: 240,
    supplier: 'Prime Poultry Cold Chain (#V-120)',
    batch: 'BATCH-2026-CHK-550',
    expiry: '2 Days (Nov 2, 2026)',
    storage: 'Meat Deep Chiller (-2°C)',
    suggestedReorder: 20.0,
    fefoRank: 'Priority FEFO Queue',
  },
  cheese: {
    id: 'cheese',
    name: 'Aged Cheddar & Swiss',
    category: 'Dairy',
    stockQty: 6.8,
    unit: 'kg',
    minThreshold: 10.0,
    status: 'low',
    unitCost: 380,
    supplier: 'Dairy Direct Logistics (#V-105)',
    batch: 'BATCH-2026-CHS-740',
    expiry: '8 Days (Nov 8, 2026)',
    storage: 'Walk-In Dairy (2°C)',
    suggestedReorder: 12.0,
    fefoRank: 'Low Stock Alert',
  },
  tomatoes: {
    id: 'tomatoes',
    name: 'Fresh Heirloom Tomatoes',
    category: 'Produce',
    stockQty: 14.5,
    unit: 'kg',
    minThreshold: 12.0,
    status: 'healthy',
    unitCost: 42,
    supplier: 'FarmFresh Agri Supplies (#V-102)',
    batch: 'BATCH-2026-TOM-881',
    expiry: '5 Days (Nov 5, 2026)',
    storage: 'Crisper Bay 2 (8°C)',
    suggestedReorder: 20.0,
    fefoRank: 'Safe Rotation',
  },
  lettuce: {
    id: 'lettuce',
    name: 'Crisp Hydroponic Lettuce',
    category: 'Produce',
    stockQty: 4.2,
    unit: 'kg',
    minThreshold: 8.0,
    status: 'low',
    unitCost: 65,
    supplier: 'GreenLeaf Hydroponics (#V-108)',
    batch: 'BATCH-2026-LET-410',
    expiry: '3 Days (Nov 3, 2026)',
    storage: 'Chiller Unit A (4°C)',
    suggestedReorder: 15.0,
    fefoRank: 'Priority FEFO Queue',
  },
  onions: {
    id: 'onions',
    name: 'Culinary Red Onions',
    category: 'Produce',
    stockQty: 28.0,
    unit: 'kg',
    minThreshold: 15.0,
    status: 'healthy',
    unitCost: 32,
    supplier: 'Maha Agri Wholesale (#V-114)',
    batch: 'BATCH-2026-ONI-912',
    expiry: '25 Days (Nov 25, 2026)',
    storage: 'Dry Stores Pallet C',
    suggestedReorder: 25.0,
    fefoRank: 'Stable Stock',
  },
  mozzarella: {
    id: 'mozzarella',
    name: 'Fresh Buffalo Mozzarella',
    category: 'Dairy',
    stockQty: 8.5,
    unit: 'kg',
    minThreshold: 6.0,
    status: 'healthy',
    unitCost: 380,
    supplier: 'Dairy Direct Logistics (#V-105)',
    batch: 'BATCH-2026-MOZ-220',
    expiry: '6 Days (Nov 6, 2026)',
    storage: 'Walk-In Dairy (2°C)',
    suggestedReorder: 10.0,
    fefoRank: 'Safe Rotation',
  },
  basil: {
    id: 'basil',
    name: 'Fresh Sweet Basil & Herbs',
    category: 'Produce',
    stockQty: 0.8,
    unit: 'kg',
    minThreshold: 1.5,
    status: 'critical',
    unitCost: 180,
    supplier: 'GreenLeaf Hydroponics (#V-108)',
    batch: 'BATCH-2026-BAS-115',
    expiry: '36 Hours (Nov 1, 2026)',
    storage: 'Herb Chamber (6°C)',
    suggestedReorder: 3.0,
    fefoRank: 'Critical FEFO Expiry',
  },
  pasta_penne: {
    id: 'pasta_penne',
    name: 'Durum Wheat Penne Rigate',
    category: 'Dry Goods',
    stockQty: 35.0,
    unit: 'kg',
    minThreshold: 15.0,
    status: 'healthy',
    unitCost: 115,
    supplier: 'Metro Wholesale Imports (#V-130)',
    batch: 'BATCH-2026-PEN-701',
    expiry: '6 Months (Apr 2027)',
    storage: 'Dry Store Bay 1',
    suggestedReorder: 25.0,
    fefoRank: 'Stable Inventory',
  },
  parmesan: {
    id: 'parmesan',
    name: 'Aged Italian Parmesan',
    category: 'Dairy',
    stockQty: 3.2,
    unit: 'kg',
    minThreshold: 5.0,
    status: 'low',
    unitCost: 380,
    supplier: 'Dairy Direct Logistics (#V-105)',
    batch: 'BATCH-2026-PAR-812',
    expiry: '20 Days (Nov 20, 2026)',
    storage: 'Walk-In Dairy (2°C)',
    suggestedReorder: 8.0,
    fefoRank: 'Low Stock Alert',
  },
  salmon_fillet: {
    id: 'salmon_fillet',
    name: 'Atlantic Salmon Fillets',
    category: 'Seafood',
    stockQty: 6.5,
    unit: 'kg',
    minThreshold: 8.0,
    status: 'low',
    unitCost: 805,
    supplier: 'Oceanic Cold Harvest (#V-145)',
    batch: 'BATCH-2026-SAL-301',
    expiry: '48 Hours (Nov 2, 2026)',
    storage: 'Seafood Deep Chiller (-3°C)',
    suggestedReorder: 10.0,
    fefoRank: 'Priority FEFO Queue',
  },
  asparagus: {
    id: 'asparagus',
    name: 'Tender Green Asparagus',
    category: 'Produce',
    stockQty: 2.1,
    unit: 'kg',
    minThreshold: 3.5,
    status: 'low',
    unitCost: 300,
    supplier: 'GreenLeaf Hydroponics (#V-108)',
    batch: 'BATCH-2026-ASP-990',
    expiry: '3 Days (Nov 3, 2026)',
    storage: 'Produce Crisper (6°C)',
    suggestedReorder: 5.0,
    fefoRank: 'Priority FEFO Queue',
  },
  paneer_block: {
    id: 'paneer_block',
    name: 'Fresh Malai Paneer',
    category: 'Dairy',
    stockQty: 12.0,
    unit: 'kg',
    minThreshold: 10.0,
    status: 'healthy',
    unitCost: 262,
    supplier: 'Dairy Direct Logistics (#V-105)',
    batch: 'BATCH-2026-PAN-9021',
    expiry: '4 Days (Nov 4, 2026)',
    storage: 'Dairy Chiller (3°C)',
    suggestedReorder: 15.0,
    fefoRank: 'Safe Rotation',
  },
  avocado: {
    id: 'avocado',
    name: 'Fresh Hass Avocado',
    category: 'Produce',
    stockQty: 15,
    unit: 'pcs',
    minThreshold: 25,
    status: 'low',
    unitCost: 38,
    supplier: 'FarmFresh Agri Supplies (#V-102)',
    batch: 'BATCH-2026-AVO-440',
    expiry: '3 Days (Nov 3, 2026)',
    storage: 'Produce Crisper (8°C)',
    suggestedReorder: 30,
    fefoRank: 'Priority FEFO Queue',
  },
};

// ============================================================================
// 3. MAIN COMPONENT: AUTOMATIC FOOD CAROUSEL
// ============================================================================
export const IngredientArcCarousel = () => {
  // Active focused dish index (0 to 7)
  const [activeDishIndex, setActiveDishIndex] = useState(0);

  // Continuous rotation angle in radians (managed by requestAnimationFrame)
  const [rotationAngle, setRotationAngle] = useState(0);
  const rotationAngleRef = useRef(0);

  // Target angle for smooth interpolation when user clicks a card or clicks Next/Prev
  const targetAngleRef = useRef(null);

  // Hover & user control states
  const [isHovered, setIsHovered] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Drag / touch interaction tracking
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartAngleRef = useRef(0);

  // Window width tracking for responsive 3D radii
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  // Purchase Order modal simulation state
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [poTargetIngredient, setPoTargetIngredient] = useState(null);
  const [poDispatched, setPoDispatched] = useState(false);

  // Window resize listener
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reduced motion preference listener
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    const handler = (e) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // ==========================================================================
  // CONTINUOUS ANIMATION LOOP (requestAnimationFrame)
  // ==========================================================================
  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();

    const animate = (currentTime) => {
      const deltaMs = Math.min(currentTime - lastTime, 64);
      lastTime = currentTime;

      if (!isReducedMotion) {
        if (isDraggingRef.current) {
          // Direct manipulation via pointer / touch
        } else if (targetAngleRef.current !== null) {
          // Smoothly interpolate towards target angle (cubic spring-like lerp)
          const diff = targetAngleRef.current - rotationAngleRef.current;
          if (Math.abs(diff) < 0.001) {
            rotationAngleRef.current = targetAngleRef.current;
            targetAngleRef.current = null;
          } else {
            rotationAngleRef.current += diff * 0.12;
          }
        } else if (!isHovered) {
          // Continuous, slow, premium forward drift
          // 0.00032 rad/ms = ~19.6 seconds per full 360° revolution
          rotationAngleRef.current += 0.00032 * deltaMs;
        }

        // Normalize angle to [0, 2*PI)
        const twoPi = 2 * Math.PI;
        rotationAngleRef.current = ((rotationAngleRef.current % twoPi) + twoPi) % twoPi;

        // Determine which card is nearest to center front (normAngle closest to 0)
        const count = DISHES.length;
        const angleStep = twoPi / count;
        let minDiff = Infinity;
        let closestIdx = 0;

        for (let i = 0; i < count; i++) {
          let cardAngle = (rotationAngleRef.current + i * angleStep) % twoPi;
          let norm = cardAngle > Math.PI ? cardAngle - twoPi : cardAngle;
          const dist = Math.abs(norm);
          if (dist < minDiff) {
            minDiff = dist;
            closestIdx = i;
          }
        }

        // Update active dish index when nearest card shifts
        setActiveDishIndex((prev) => (prev !== closestIdx ? closestIdx : prev));
        setRotationAngle(rotationAngleRef.current);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isHovered, isReducedMotion]);

  // Rotate smoothly to center a specific dish card
  const rotateToDish = useCallback((targetIndex) => {
    const count = DISHES.length;
    const twoPi = 2 * Math.PI;
    const angleStep = twoPi / count;

    // Current angle of target card
    let cardAngle = (rotationAngleRef.current + targetIndex * angleStep) % twoPi;
    let norm = cardAngle > Math.PI ? cardAngle - twoPi : cardAngle;

    // To bring target card to center (norm = 0), subtract norm from rotationAngleRef
    targetAngleRef.current = rotationAngleRef.current - norm;
    setActiveDishIndex(targetIndex);
  }, []);

  const handleNextDish = useCallback(() => {
    const nextIdx = (activeDishIndex + 1) % DISHES.length;
    rotateToDish(nextIdx);
  }, [activeDishIndex, rotateToDish]);

  const handlePrevDish = useCallback(() => {
    const prevIdx = (activeDishIndex - 1 + DISHES.length) % DISHES.length;
    rotateToDish(prevIdx);
  }, [activeDishIndex, rotateToDish]);

  // Pointer / Touch drag handlers
  const handlePointerDown = (clientX) => {
    isDraggingRef.current = true;
    dragStartXRef.current = clientX;
    dragStartAngleRef.current = rotationAngleRef.current;
    targetAngleRef.current = null;
  };

  const handlePointerMove = (clientX) => {
    if (!isDraggingRef.current) return;
    const deltaX = clientX - dragStartXRef.current;
    // Map pixels to radians: 300px drag = 90° rotation
    const deltaAngle = (deltaX / 300) * (Math.PI / 2);
    rotationAngleRef.current = dragStartAngleRef.current + deltaAngle;
    setRotationAngle(rotationAngleRef.current);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrevDish();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNextDish();
    }
  };

  // Active dish calculations
  const activeDish = DISHES[activeDishIndex] || DISHES[0];
  const grossProfit = activeDish.sellingPrice - activeDish.recipeCost;
  const foodCostPercentage = ((activeDish.recipeCost / activeDish.sellingPrice) * 100).toFixed(1);
  const grossMarginPercentage = (100 - parseFloat(foodCostPercentage)).toFixed(1);

  // Check overall recipe stock health for active dish
  const recipeStockStatus = useMemo(() => {
    let hasCritical = false;
    let hasLow = false;
    for (const item of activeDish.ingredients) {
      const ing = INGREDIENT_CATALOG[item.id];
      if (ing) {
        if (ing.status === 'critical') hasCritical = true;
        if (ing.status === 'low') hasLow = true;
      }
    }
    if (hasCritical) return { level: 'critical', text: 'Critical Reorder Required', color: 'rose' };
    if (hasLow) return { level: 'low', text: 'Low Stock Alert Active', color: 'amber' };
    return { level: 'healthy', text: 'All Ingredients Optimal', color: 'emerald' };
  }, [activeDish]);

  // Purchase Order dispatch handler
  const handleTriggerPo = (ingredient) => {
    setPoTargetIngredient(ingredient);
    setIsPoModalOpen(true);
  };

  const handleConfirmPo = () => {
    setPoDispatched(true);
    setTimeout(() => {
      setIsPoModalOpen(false);
      setPoDispatched(false);
      setPoTargetIngredient(null);
    }, 1800);
  };

  // Responsive 3D Arc dimensions
  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;
  const radiusX = isMobile ? 180 : isTablet ? 290 : 410;
  const radiusZ = isMobile ? 95 : isTablet ? 145 : 190;
  const arcHeight = isMobile ? 14 : isTablet ? 24 : 32;

  return (
    <div
      className="relative select-none outline-none"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Automatic 3D Food Carousel & Live Recipe Intelligence"
    >
      {/* Dynamic Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] sm:w-[850px] h-[450px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-[380px] h-[380px] bg-teal-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[380px] h-[380px] bg-indigo-500/8 rounded-full blur-[130px] pointer-events-none" />

      {/* ==================================================================
          1. SECTION HEADER
         ================================================================== */}
      <div className="text-center max-w-3xl mx-auto mb-3 sm:mb-5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-4 shadow-inner backdrop-blur-md">
          <ChefHat className="w-4 h-4 text-emerald-400" />
          <span>Automatic 3D Food Carousel &amp; Recipe Costing</span>
          <span className="w-1 h-1 rounded-full bg-emerald-400" />
          <span className="text-emerald-400 font-bold">Continuous Motion</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight mb-4">
          From Prep Table to Gross Margin.{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
            Every Gram Counted.
          </span>
        </h2>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Watch StockMate&apos;s food carousel continuously glide along a 3D arc. Hover to pause, click any dish to focus, and inspect real-time recipe margins, portion bills of materials, and warehouse stock.
        </p>
      </div>

      {/* ==================================================================
          2. CONTINUOUS 3D CURVED ARC FOOD CAROUSEL STAGE
         ================================================================== */}
      <div
        className="relative h-[380px] sm:h-[440px] lg:h-[470px] flex items-center justify-center mt-1 mb-6 sm:mt-2 sm:mb-8 touch-pan-y cursor-grab active:cursor-grabbing perspective-[1200px] overflow-hidden sm:overflow-visible"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseDown={(e) => handlePointerDown(e.clientX)}
        onMouseMove={(e) => handlePointerMove(e.clientX)}
        onMouseUp={handlePointerUp}
        onTouchStart={(e) => handlePointerDown(e.touches[0].clientX)}
        onTouchMove={(e) => handlePointerMove(e.touches[0].clientX)}
        onTouchEnd={handlePointerUp}
      >
        {/* Central Ambient Glow Halo */}
        <div className="absolute w-[360px] sm:w-[500px] h-[360px] sm:h-[500px] rounded-full bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-indigo-500/10 blur-3xl pointer-events-none" />

        {/* Ambient Floor Shadow Ring */}
        <div className="absolute bottom-2 w-[400px] sm:w-[650px] h-[30px] rounded-full bg-slate-950/80 blur-xl pointer-events-none" />

        {/* 8 CONTINUOUS 3D FOOD CARDS */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {DISHES.map((dish, idx) => {
            const count = DISHES.length;
            const twoPi = 2 * Math.PI;
            const angleStep = twoPi / count;

            // Compute current card angle on the continuous loop
            let cardAngle = (rotationAngle + idx * angleStep) % twoPi;
            let normAngle = cardAngle > Math.PI ? cardAngle - twoPi : cardAngle;

            // 3D Elliptical Arc Projection Coordinates
            const x = Math.sin(normAngle) * radiusX;
            const z = (Math.cos(normAngle) - 1) * radiusZ;
            const y = (1 - Math.cos(normAngle)) * arcHeight;

            // Depth scaling, rotation, opacity, and layering
            const cosNorm = Math.cos(normAngle);
            const scale = 0.78 + 0.30 * Math.max(0, (cosNorm + 1) / 2);
            const opacity = 0.40 + 0.60 * Math.max(0, (cosNorm + 0.6) / 1.6);
            const rotY = -normAngle * (180 / Math.PI) * 0.32;
            const zIndex = Math.round(100 + cosNorm * 80);

            const isFocused = idx === activeDishIndex;
            const dishGrossProfit = dish.sellingPrice - dish.recipeCost;
            const dishMargin = ((dishGrossProfit / dish.sellingPrice) * 100).toFixed(0);

            return (
              <div
                key={dish.id}
                onClick={(e) => {
                  e.stopPropagation();
                  rotateToDish(idx);
                }}
                style={{
                  transform: `translate3d(${x}px, ${y}px, ${z}px) rotateY(${rotY}deg) scale(${scale})`,
                  zIndex,
                  opacity,
                  transition: isDraggingRef.current ? 'none' : 'box-shadow 0.25s ease, border-color 0.25s ease',
                }}
                className={`absolute w-[210px] sm:w-[250px] p-3 sm:p-3.5 rounded-2xl liquid-glass-card border cursor-pointer pointer-events-auto transition-all duration-200 group ${
                  isFocused
                    ? 'border-emerald-400/90 shadow-2xl shadow-emerald-500/40 ring-2 ring-emerald-400/40'
                    : 'border-white/15 hover:border-emerald-400/50 hover:shadow-xl hover:shadow-emerald-950/30'
                }`}
                title={`Click to center and inspect ${dish.name}`}
                role="button"
                tabIndex={0}
                aria-label={`Food Dish: ${dish.name}, Price: ₹${dish.sellingPrice}, Recipe Cost: ₹${dish.recipeCost}`}
              >
                {/* Active Spotlight Badge */}
                {isFocused && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-[9.5px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1 z-30 whitespace-nowrap">
                    <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                    <span>Active in Focus</span>
                  </div>
                )}

                {/* Food Dish Photo Thumbnail */}
                <div className="w-full h-28 sm:h-32 rounded-xl overflow-hidden mb-2.5 relative bg-slate-900">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                  
                  {/* Category Pill Tag */}
                  <span className="absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-950/80 border border-white/20 text-emerald-300 backdrop-blur-xs">
                    {dish.category}
                  </span>

                  {/* Prep Time Tag */}
                  <span className="absolute bottom-1.5 right-1.5 text-[9px] font-semibold px-1.5 py-0.5 rounded bg-black/60 text-slate-300 flex items-center gap-1 backdrop-blur-xs">
                    <Clock className="w-2.5 h-2.5 text-emerald-400" />
                    <span>{dish.prepTime}</span>
                  </span>
                </div>

                {/* Dish Information & Financial Breakdown */}
                <div className="space-y-1 text-left">
                  <h4 className="text-xs sm:text-sm font-black text-white truncate group-hover:text-emerald-300 transition-colors">
                    {dish.name}
                  </h4>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10">
                    <span className="text-slate-400">Selling Price:</span>
                    <span className="font-mono font-bold text-white">₹{dish.sellingPrice}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Food Cost:</span>
                    <span className="font-mono text-emerald-400 font-bold">₹{dish.recipeCost.toFixed(2)}</span>
                  </div>

                  {/* Profit Margin Pill */}
                  <div className="mt-2 pt-1 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">Gross Margin:</span>
                    <span className="text-[10.5px] font-black px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
                      {dishMargin}% (+₹{dishGrossProfit.toFixed(0)})
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ==================================================================
          4. TWO-COLUMN OPERATIONAL INTELLIGENCE GRID (UPDATES PER ACTIVE DISH)
         ================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8 sm:mt-12">
        {/* ----------------------------------------------------------------
            COLUMN 1: ACTIVE DISH INVENTORY BOM DOSSIER (7 COLS)
           ---------------------------------------------------------------- */}
        <div className="lg:col-span-7 liquid-glass-card rounded-3xl p-6 border border-white/15 shadow-2xl relative overflow-hidden">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-white/10 mb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border border-emerald-500/30 shadow-md shrink-0 bg-slate-900">
                <img
                  src={activeDish.image}
                  alt={activeDish.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white">{activeDish.name}</h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      recipeStockStatus.level === 'healthy'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : recipeStockStatus.level === 'low'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}
                  >
                    {recipeStockStatus.text}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Category: <span className="text-slate-200 font-semibold">{activeDish.category}</span> • Prep Time:{' '}
                  <span className="text-slate-200 font-semibold">{activeDish.prepTime}</span>
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block font-mono">Total Recipe Cost</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                ₹{activeDish.recipeCost.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Active Dish Ingredients Bill of Materials (BOM) */}
          <div className="space-y-2 mb-5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 pb-1">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Recipe Ingredients &amp; Live Warehouse Stock</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {activeDish.ingredients.length} Tracked Components
              </span>
            </div>

            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {activeDish.ingredients.map((ingItem) => {
                const ingMeta = INGREDIENT_CATALOG[ingItem.id];
                if (!ingMeta) return null;

                const stockPercentage = Math.round(
                  (ingMeta.stockQty / (ingMeta.minThreshold * 1.5)) * 100
                );

                return (
                  <div
                    key={ingItem.id}
                    className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-emerald-500/40 transition-colors space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            <span>{ingMeta.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono font-normal">
                              ({ingItem.portion} per serving)
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Storage: {ingMeta.storage} • Lot: {ingMeta.batch}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-xs font-mono font-bold text-slate-200">
                            {ingMeta.stockQty} {ingMeta.unit}{' '}
                            <span className="text-[10px] text-slate-400 font-normal">
                              / {ingMeta.minThreshold} {ingMeta.unit} min
                            </span>
                          </div>
                          <div className="text-[10px] text-emerald-400 font-mono">
                            Cost: ₹{ingItem.portionCost.toFixed(2)}
                          </div>
                        </div>

                        {ingMeta.status !== 'healthy' && (
                          <button
                            type="button"
                            onClick={() => handleTriggerPo(ingMeta)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold transition-colors cursor-pointer shrink-0"
                          >
                            Reorder PO
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Stock level bar */}
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          ingMeta.status === 'healthy'
                            ? 'bg-emerald-500'
                            : ingMeta.status === 'low'
                            ? 'bg-amber-400'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(12, stockPercentage))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Supplier Transparency Banner */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-300">
                Connected Suppliers:{' '}
                <strong className="text-white">Dairy Direct, GreenLeaf Hydroponics &amp; Metro Cold Chain</strong>
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 font-bold">100% Reconciled</span>
          </div>
        </div>

        {/* ----------------------------------------------------------------
            COLUMN 2: LIVE FOOD COST & PROFIT MARGIN CALCULATOR (5 COLS)
           ---------------------------------------------------------------- */}
        <div className="lg:col-span-5 liquid-glass-card rounded-3xl p-6 border border-white/15 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Live Food Cost Calculator</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-emerald-300">
                {activeDish.name}
              </span>
            </div>

            {/* Top Summary Metrics */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="p-3.5 rounded-2xl bg-slate-900/85 border border-white/10">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  Menu Selling Price
                </span>
                <span className="text-2xl font-black text-white font-mono mt-1 block">
                  ₹{activeDish.sellingPrice}
                </span>
                <span className="text-[10px] text-slate-400">Customer bill price</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/85 border border-white/10">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  Recipe Food Cost
                </span>
                <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
                  ₹{activeDish.recipeCost.toFixed(2)}
                </span>
                <span className="text-[10px] text-emerald-400/90 font-bold">
                  {foodCostPercentage}% Food Cost
                </span>
              </div>
            </div>

            {/* Profit & Margin Highlighting */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/70 via-slate-900/90 to-teal-950/70 border border-emerald-500/30 mb-5">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-slate-200">Gross Margin per Plate</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30 font-mono">
                  {grossMarginPercentage}% Margin
                </span>
              </div>
              <div className="text-3xl font-black text-white font-mono mt-1">
                +₹{grossProfit.toFixed(2)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Healthy target: StockMate flags immediate alerts if ingredient cost exceeds 32% threshold.
              </p>
            </div>

            {/* Recipe Portion Cost Breakdown Chart */}
            <div className="space-y-2 mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Recipe Portion Breakdown:
              </span>
              <div className="space-y-1.5">
                {activeDish.ingredients.map((item) => {
                  const ing = INGREDIENT_CATALOG[item.id];
                  const percentage = ((item.portionCost / activeDish.recipeCost) * 100).toFixed(0);
                  return (
                    <div key={item.id} className="p-2 rounded-xl bg-white/5 border border-white/5 text-xs space-y-1">
                      <div className="flex justify-between items-center text-slate-300">
                        <span>{ing ? ing.name : item.id}</span>
                        <span className="font-mono text-emerald-400 font-bold">
                          ₹{item.portionCost.toFixed(2)} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Simulation CTA */}
          <div className="pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                const firstLow = activeDish.ingredients.find(
                  (i) => INGREDIENT_CATALOG[i.id]?.status !== 'healthy'
                );
                const target = firstLow
                  ? INGREDIENT_CATALOG[firstLow.id]
                  : INGREDIENT_CATALOG[activeDish.ingredients[0].id];
                handleTriggerPo(target);
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs text-center transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Simulate Reorder for 50 Servings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================================
          5. SIMULATED PURCHASE ORDER DISPATCH MODAL
         ================================================================== */}
      {isPoModalOpen && poTargetIngredient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md liquid-glass-card rounded-3xl p-6 border border-emerald-500/40 shadow-2xl backdrop-blur-2xl">
            <button
              type="button"
              onClick={() => setIsPoModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Generate Purchase Order</h4>
                <p className="text-xs text-slate-400">StockMate Instant Supplier EDI</p>
              </div>
            </div>

            {poDispatched ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h5 className="text-base font-black text-white">Purchase Order Dispatched!</h5>
                <p className="text-xs text-slate-300 max-w-xs mx-auto">
                  PO #PO-2026-DISP sent to {poTargetIngredient.supplier}. Reconciled to ledger automatically.
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Item:</span>
                    <strong className="text-white">{poTargetIngredient.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Supplier:</span>
                    <strong className="text-emerald-400">{poTargetIngredient.supplier}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Suggested Quantity:</span>
                    <strong className="text-white font-mono">
                      {poTargetIngredient.suggestedReorder} {poTargetIngredient.unit}
                    </strong>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-white/10">
                    <span className="text-slate-300 font-bold">Estimated PO Total:</span>
                    <span className="text-emerald-400 font-mono font-black text-sm">
                      ₹{(poTargetIngredient.suggestedReorder * poTargetIngredient.unitCost).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPoModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmPo}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Confirm &amp; Dispatch</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IngredientArcCarousel;
