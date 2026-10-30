import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
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
} from 'lucide-react';

// ============================================================================
// 1. DISH RECIPE DATASET WITH REALISTIC PORTION COSTS & SELLING PRICES
// ============================================================================
export const DISHES = [
  {
    id: 'burger',
    name: 'Signature Brioche Burger',
    category: 'Gourmet Specialty',
    sellingPrice: 380,
    recipeCost: 112.5,
    prepTime: '8 mins',
    description: 'Double grilled chicken patty with aged cheddar, caramelized red onions, vine tomatoes, and crisp hydroponic lettuce.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=700&auto=format&fit=crop&q=80',
    ingredients: [
      { id: 'tomatoes', portion: '60g', portionCost: 2.52 },
      { id: 'lettuce', portion: '35g', portionCost: 2.28 },
      { id: 'onions', portion: '40g', portionCost: 1.28 },
      { id: 'cheese', portion: '30g', portionCost: 11.4 },
      { id: 'chicken', portion: '150g', portionCost: 36.0 },
    ],
  },
  {
    id: 'pasta',
    name: 'Truffle & Herb Penne Pasta',
    category: 'Bistro Italian',
    sellingPrice: 450,
    recipeCost: 128.0,
    prepTime: '12 mins',
    description: 'Freshly tossed penne in garlic emulsion, blistered heirloom tomatoes, smoked chicken, shaved parmesan, and garden basil.',
    image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281699?w=700&auto=format&fit=crop&q=80',
    ingredients: [
      { id: 'herbs', portion: '25g', portionCost: 4.5 },
      { id: 'cheese', portion: '45g', portionCost: 17.1 },
      { id: 'tomatoes', portion: '80g', portionCost: 3.36 },
      { id: 'onions', portion: '30g', portionCost: 0.96 },
      { id: 'chicken', portion: '120g', portionCost: 28.8 },
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
      { id: 'herbs', portion: '20g', portionCost: 3.6 },
    ],
  },
  {
    id: 'pizza',
    name: 'Artisan Margherita Pizza',
    category: 'Wood-Fired Oven',
    sellingPrice: 520,
    recipeCost: 142.0,
    prepTime: '10 mins',
    description: 'Hand-stretched sourdough crust, crushed San Marzano tomato reduction, buffalo mozzarella, and aromatic sweet basil leaves.',
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=700&auto=format&fit=crop&q=80',
    ingredients: [
      { id: 'cheese', portion: '140g', portionCost: 53.2 },
      { id: 'tomatoes', portion: '120g', portionCost: 5.04 },
      { id: 'herbs', portion: '20g', portionCost: 3.6 },
      { id: 'onions', portion: '35g', portionCost: 1.12 },
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
      { id: 'herbs', portion: '15g', portionCost: 2.7 },
    ],
  },
];

// ============================================================================
// 2. INGREDIENT CATALOG WITH LIVE STOCK, BATCHES & TELEMETRY
// ============================================================================
export const INGREDIENTS = [
  {
    id: 'tomatoes',
    name: 'Fresh Tomatoes',
    category: 'Produce',
    stockQty: 14.5,
    unit: 'kg',
    minThreshold: 12.0,
    status: 'healthy', // healthy | low | critical
    unitCost: 42,
    supplier: 'FarmFresh Agri Supplies (#V-102)',
    batch: 'BATCH-2026-TOM-881',
    expiry: '5 Days (Nov 4, 2026)',
    storage: 'Crisper Bay 2 (8°C)',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop&q=80',
    suggestedReorder: 20.0,
    fefoRank: 'Safe Rotation',
  },
  {
    id: 'lettuce',
    name: 'Crisp Lettuce',
    category: 'Produce',
    stockQty: 4.2,
    unit: 'kg',
    minThreshold: 8.0,
    status: 'low',
    unitCost: 65,
    supplier: 'GreenLeaf Hydroponics (#V-108)',
    batch: 'BATCH-2026-LET-410',
    expiry: '3 Days (Nov 2, 2026)',
    storage: 'Chiller Unit A (4°C)',
    image: 'https://images.unsplash.com/photo-1556801712-76c8eb07bbc9?w=400&auto=format&fit=crop&q=80',
    suggestedReorder: 15.0,
    fefoRank: 'Priority FEFO Queue',
  },
  {
    id: 'onions',
    name: 'Culinary Onions',
    category: 'Produce',
    stockQty: 28.0,
    unit: 'kg',
    minThreshold: 15.0,
    status: 'healthy',
    unitCost: 32,
    supplier: 'Maha Agri Wholesale (#V-114)',
    batch: 'BATCH-2026-ONI-912',
    expiry: '25 Days (Nov 24, 2026)',
    storage: 'Dry Stores Pallet C',
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&auto=format&fit=crop&q=80',
    suggestedReorder: 25.0,
    fefoRank: 'Stable Stock',
  },
  {
    id: 'potatoes',
    name: 'Russet Potatoes',
    category: 'Dry Stores',
    stockQty: 2.5,
    unit: 'kg',
    minThreshold: 10.0,
    status: 'critical',
    unitCost: 28,
    supplier: 'Maha Agri Wholesale (#V-114)',
    batch: 'BATCH-2026-POT-301',
    expiry: '18 Days (Nov 17, 2026)',
    storage: 'Dry Ambient Bin 4',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&auto=format&fit=crop&q=80',
    suggestedReorder: 30.0,
    fefoRank: 'Immediate Reorder',
  },
  {
    id: 'cheese',
    name: 'Artisan Cheese',
    category: 'Dairy',
    stockQty: 6.8,
    unit: 'kg',
    minThreshold: 10.0,
    status: 'low',
    unitCost: 380,
    supplier: 'Dairy Direct Logistics (#V-105)',
    batch: 'BATCH-2026-CHS-740',
    expiry: '8 Days (Nov 7, 2026)',
    storage: 'Walk-In Dairy (2°C)',
    image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&auto=format&fit=crop&q=80',
    suggestedReorder: 12.0,
    fefoRank: 'Monitor Usage',
  },
  {
    id: 'chicken',
    name: 'Prime Chicken',
    category: 'Poultry',
    stockQty: 18.2,
    unit: 'kg',
    minThreshold: 12.0,
    status: 'healthy',
    unitCost: 240,
    supplier: 'Prime Poultry Cold Chain (#V-120)',
    batch: 'BATCH-2026-CHK-550',
    expiry: '2 Days (Nov 1, 2026)',
    storage: 'Meat Deep Chiller (-2°C)',
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&auto=format&fit=crop&q=80',
    suggestedReorder: 20.0,
    fefoRank: 'FEFO Urgent: Cook First',
  },
  {
    id: 'herbs',
    name: 'Fresh Herbs',
    category: 'Produce',
    stockQty: 0.8,
    unit: 'kg',
    minThreshold: 1.5,
    status: 'critical',
    unitCost: 180,
    supplier: 'GreenLeaf Hydroponics (#V-108)',
    batch: 'BATCH-2026-HRB-112',
    expiry: '48 Hours (Nov 1, 2026)',
    storage: 'Herb Humidity Chamber (6°C)',
    image: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=400&auto=format&fit=crop&q=80',
    suggestedReorder: 3.0,
    fefoRank: 'Critical FEFO Expiry',
  },
];

export const IngredientArcCarousel = () => {
  const [selectedDishId, setSelectedDishId] = useState('burger');
  const [selectedIngredientIndex, setSelectedIngredientIndex] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [poDispatched, setPoDispatched] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragDeltaX = useRef(0);
  const carouselContainerRef = useRef(null);

  const selectedDish = useMemo(
    () => DISHES.find((d) => d.id === selectedDishId) || DISHES[0],
    [selectedDishId]
  );

  const selectedIngredient = INGREDIENTS[selectedIngredientIndex] || INGREDIENTS[0];

  // Food cost calculations
  const grossProfit = selectedDish.sellingPrice - selectedDish.recipeCost;
  const foodCostPercentage = ((selectedDish.recipeCost / selectedDish.sellingPrice) * 100).toFixed(1);
  const grossMarginPercentage = (100 - parseFloat(foodCostPercentage)).toFixed(1);

  // Checks whether a given ingredient is an active component in the selected dish
  const isIngredientInSelectedDish = useCallback(
    (ingredientId) => {
      return selectedDish.ingredients.some((item) => item.id === ingredientId);
    },
    [selectedDish]
  );

  // Rotate carousel to target index
  const rotateTo = useCallback((index) => {
    const count = INGREDIENTS.length;
    const normalizedIndex = (index + count) % count;
    setSelectedIngredientIndex(normalizedIndex);
  }, []);

  const rotateNext = useCallback(() => {
    rotateTo(selectedIngredientIndex + 1);
  }, [rotateTo, selectedIngredientIndex]);

  const rotatePrev = useCallback(() => {
    rotateTo(selectedIngredientIndex - 1);
  }, [rotateTo, selectedIngredientIndex]);

  // Pointer / Mouse Drag & Touch Swipe handlers
  const handlePointerDown = (e) => {
    setIsDragging(true);
    dragStartX.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    dragDeltaX.current = 0;
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    dragDeltaX.current = currentX - dragStartX.current;
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragDeltaX.current > 40) {
      rotatePrev();
    } else if (dragDeltaX.current < -40) {
      rotateNext();
    }
    dragDeltaX.current = 0;
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      rotatePrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      rotateNext();
    }
  };

  // Auto-rotation effect (gentle ambient rotation when user is idle, pauses on hover)
  useEffect(() => {
    if (!isAutoRotating) return;
    const interval = setInterval(() => {
      rotateNext();
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoRotating, rotateNext]);

  // Auto-select ingredient when user picks a dish that uses it
  const handleSelectDish = (dishId) => {
    setSelectedDishId(dishId);
    const dish = DISHES.find((d) => d.id === dishId);
    if (dish && dish.ingredients.length > 0) {
      const firstIngId = dish.ingredients[0].id;
      const ingIdx = INGREDIENTS.findIndex((ing) => ing.id === firstIngId);
      if (ingIdx !== -1) {
        setSelectedIngredientIndex(ingIdx);
      }
    }
  };

  // Handle PO dispatch simulation
  const handleDispatchPo = () => {
    setPoDispatched(true);
    setTimeout(() => {
      setIsPoModalOpen(false);
      setPoDispatched(false);
    }, 1800);
  };

  return (
    <div
      id="recipe-arc"
      className="relative py-20 lg:py-28 overflow-hidden bg-slate-950 text-slate-100 scroll-mt-24 select-none"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Interactive 3D Food Ingredient Arc Carousel & Recipe Costing"
    >
      {/* Dynamic Background Ambient Reflections */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[750px] h-[550px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-[420px] h-[420px] bg-teal-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[420px] h-[420px] bg-indigo-500/8 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ==================================================================
            SECTION HEADER
           ================================================================== */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-4 shadow-inner backdrop-blur-md">
            <ChefHat className="w-4 h-4 text-emerald-400" />
            <span>Interactive 3D Recipe Costing &amp; Arc Carousel</span>
            <span className="w-1 h-1 rounded-full bg-emerald-400" />
            <span className="text-emerald-400 font-bold">Live Inventory Link</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight mb-4">
            From Prep Table to Gross Margin.{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
              Every Gram Counted.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Rotate through StockMate&apos;s 3D ingredient arc to inspect live warehouse stock, unit costs, and expiry dates. Choose a dish to watch recipe margins update dynamically in real time.
          </p>
        </div>

        {/* ==================================================================
            DISH SELECTOR TABS
           ================================================================== */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {DISHES.map((dish) => {
            const isCurrent = dish.id === selectedDishId;
            return (
              <button
                key={dish.id}
                type="button"
                onClick={() => handleSelectDish(dish.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isCurrent
                    ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 scale-105 border border-emerald-400/40'
                    : 'liquid-glass-card text-slate-300 hover:text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                <UtensilsCrossed className="w-3.5 h-3.5 shrink-0" />
                <span>{dish.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${isCurrent ? 'bg-black/25 text-white' : 'bg-white/10 text-emerald-400'}`}>
                  ₹{dish.sellingPrice}
                </span>
              </button>
            );
          })}
        </div>

        {/* ==================================================================
            3D ARC CAROUSEL STAGE & CENTRAL DISH VISUALIZATION
           ================================================================== */}
        <div
          ref={carouselContainerRef}
          className="relative min-h-[460px] sm:min-h-[520px] flex items-center justify-center my-6 touch-pan-y"
          onMouseEnter={() => setIsAutoRotating(false)}
          onMouseLeave={() => setIsAutoRotating(false)}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        >
          {/* Central Rotating Glow Halo */}
          <div className="absolute w-[360px] sm:w-[480px] h-[360px] sm:h-[480px] rounded-full bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-indigo-500/10 blur-2xl pointer-events-none" />

          {/* ================================================================
              CENTRAL DISH DISPLAY
             ================================================================ */}
          <div className="relative z-20 flex flex-col items-center text-center max-w-sm pointer-events-none">
            {/* Dish Plate Frame with Radiant Ring */}
            <div className="relative w-44 h-44 sm:w-60 sm:h-60 rounded-full p-2 bg-gradient-to-tr from-emerald-500/30 via-white/10 to-teal-500/30 shadow-2xl backdrop-blur-md">
              <img
                src={selectedDish.image}
                alt={selectedDish.name}
                className="w-full h-full rounded-full object-cover shadow-2xl transition-all duration-500 transform hover:scale-105"
              />
              {/* Badge Overlay */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-900/95 border border-emerald-500/40 text-[10px] sm:text-xs font-bold text-emerald-300 shadow-xl whitespace-nowrap flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{selectedDish.name}</span>
              </div>
            </div>

            {/* Dish Summary Info */}
            <div className="mt-5 space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
                {selectedDish.category} • Prep {selectedDish.prepTime}
              </span>
              <p className="text-xs text-slate-300 max-w-xs line-clamp-2 leading-relaxed">
                {selectedDish.description}
              </p>
            </div>
          </div>

          {/* ================================================================
              3D SEMI-CIRCLE ARC INGREDIENT CARDS
             ================================================================ */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {INGREDIENTS.map((ingredient, idx) => {
              const count = INGREDIENTS.length;
              const angleStep = (2 * Math.PI) / count;
              let theta = (idx - selectedIngredientIndex) * angleStep;

              // Normalize theta between -Math.PI and Math.PI
              while (theta > Math.PI) theta -= 2 * Math.PI;
              while (theta < -Math.PI) theta += 2 * Math.PI;

              // 3D cylindrical / elliptical projection coordinates
              const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
              const rx = isMobile ? 180 : 340;
              const rz = isMobile ? 120 : 190;

              const x = Math.sin(theta) * rx;
              const z = (Math.cos(theta) - 1) * rz;
              const y = (1 - Math.cos(theta)) * (isMobile ? 30 : 55);

              const isActive = idx === selectedIngredientIndex;
              const inRecipe = isIngredientInSelectedDish(ingredient.id);

              const scale = isActive ? 1.08 : 0.76 + 0.24 * Math.cos(theta);
              const opacity = 0.45 + 0.55 * Math.max(0, Math.cos(theta));
              const rotY = -theta * (180 / Math.PI) * 0.4;
              const zIndex = Math.round(100 + Math.cos(theta) * 60);

              // Status colors
              const statusColor =
                ingredient.status === 'healthy'
                  ? 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40'
                  : ingredient.status === 'low'
                  ? 'text-amber-400 bg-amber-500/20 border-amber-500/40'
                  : 'text-rose-400 bg-rose-500/20 border-rose-500/40';

              return (
                <div
                  key={ingredient.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    rotateTo(idx);
                  }}
                  style={{
                    transform: `translate3d(${x}px, ${y}px, ${z}px) rotateY(${rotY}deg) scale(${scale})`,
                    zIndex,
                    opacity,
                    transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease',
                  }}
                  className={`absolute w-36 sm:w-44 p-3 rounded-2xl liquid-glass-card border cursor-pointer pointer-events-auto transition-shadow duration-200 ${
                    isActive
                      ? 'border-emerald-400/80 shadow-2xl shadow-emerald-500/30 ring-2 ring-emerald-400/30'
                      : inRecipe
                      ? 'border-teal-500/40 hover:border-emerald-400/60'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                  title={`Click to inspect ${ingredient.name}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Ingredient: ${ingredient.name}, Stock: ${ingredient.stockQty} ${ingredient.unit}`}
                >
                  {/* Recipe Link Pin */}
                  {inRecipe && (
                    <div className="absolute -top-2.5 -right-2 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider shadow-md flex items-center gap-1 z-30">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>In Recipe</span>
                    </div>
                  )}

                  {/* Thumbnail Image */}
                  <div className="w-full h-20 sm:h-24 rounded-xl overflow-hidden mb-2 relative">
                    <img
                      src={ingredient.image}
                      alt={ingredient.name}
                      className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
                    <span className={`absolute bottom-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.2 rounded border backdrop-blur-xs ${statusColor}`}>
                      {ingredient.status === 'healthy' ? 'Optimal' : ingredient.status === 'low' ? 'Low Stock' : 'Critical'}
                    </span>
                  </div>

                  {/* Ingredient Title & Stock Quantity */}
                  <div className="space-y-0.5 text-left">
                    <h4 className="text-xs font-bold text-white truncate">
                      {ingredient.name}
                    </h4>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Stock:</span>
                      <span className="font-mono font-bold text-slate-200">
                        {ingredient.stockQty} {ingredient.unit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Rate:</span>
                      <span className="text-emerald-400 font-bold">₹{ingredient.unitCost}/{ingredient.unit}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Carousel Left / Right Navigation Controls */}
          <div className="absolute inset-x-2 sm:inset-x-8 top-1/2 -translate-y-1/2 flex items-center justify-between pointer-events-none z-30">
            <button
              type="button"
              onClick={rotatePrev}
              className="p-3 rounded-2xl liquid-glass-card hover:bg-slate-800 text-slate-200 hover:text-white border border-white/20 shadow-xl pointer-events-auto hover:scale-110 active:scale-95 transition-all cursor-pointer"
              title="Previous Ingredient (Left Arrow)"
              aria-label="Previous Ingredient"
            >
              <ChevronLeft className="w-5 h-5 text-emerald-400" />
            </button>
            <button
              type="button"
              onClick={rotateNext}
              className="p-3 rounded-2xl liquid-glass-card hover:bg-slate-800 text-slate-200 hover:text-white border border-white/20 shadow-xl pointer-events-auto hover:scale-110 active:scale-95 transition-all cursor-pointer"
              title="Next Ingredient (Right Arrow)"
              aria-label="Next Ingredient"
            >
              <ChevronRight className="w-5 h-5 text-emerald-400" />
            </button>
          </div>
        </div>

        {/* Carousel Quick Indicators */}
        <div className="flex items-center justify-center gap-1.5 my-4">
          {INGREDIENTS.map((ing, i) => (
            <button
              key={ing.id}
              type="button"
              onClick={() => rotateTo(i)}
              className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                i === selectedIngredientIndex
                  ? 'w-7 bg-emerald-400'
                  : 'w-2 bg-slate-700 hover:bg-slate-500'
              }`}
              title={`Switch to ${ing.name}`}
              aria-label={`Switch to ${ing.name}`}
            />
          ))}
        </div>

        {/* ==================================================================
            TWO-COLUMN INTELLIGENCE GRID: DOSSIER & FOOD COST CALCULATOR
           ================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8 sm:mt-12">
          {/* ----------------------------------------------------------------
              COLUMN 1: INVENTORY INTELLIGENCE DOSSIER (7 COLS)
             ---------------------------------------------------------------- */}
          <div className="lg:col-span-7 liquid-glass-card rounded-3xl p-6 border border-white/15 shadow-2xl relative overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl overflow-hidden border border-emerald-500/30 shadow-md shrink-0">
                  <img
                    src={selectedIngredient.image}
                    alt={selectedIngredient.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">{selectedIngredient.name}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        selectedIngredient.status === 'healthy'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : selectedIngredient.status === 'low'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {selectedIngredient.status === 'healthy'
                        ? 'Healthy Stock'
                        : selectedIngredient.status === 'low'
                        ? 'Low Stock Alert'
                        : 'Critical Depletion'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Category: <span className="text-slate-200 font-semibold">{selectedIngredient.category}</span> • Storage: <span className="text-slate-200">{selectedIngredient.storage}</span>
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-mono">Current Stock</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                  {selectedIngredient.stockQty}{' '}
                  <span className="text-sm font-semibold text-slate-400">{selectedIngredient.unit}</span>
                </span>
              </div>
            </div>

            {/* Live Inventory Telemetry Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Min Threshold</span>
                <span className="text-sm font-bold text-white font-mono mt-0.5 block">
                  {selectedIngredient.minThreshold} {selectedIngredient.unit}
                </span>
                <span className="text-[10px] text-slate-500">Buffer safety limit</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Unit Cost</span>
                <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5 block">
                  ₹{selectedIngredient.unitCost} / {selectedIngredient.unit}
                </span>
                <span className="text-[10px] text-slate-500">Contract price</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">FEFO Expiry</span>
                <span className="text-sm font-bold text-amber-300 font-mono mt-0.5 block truncate">
                  {selectedIngredient.expiry.split(' (')[0]}
                </span>
                <span className="text-[10px] text-slate-500 truncate block">{selectedIngredient.fefoRank}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Batch Lot</span>
                <span className="text-xs font-bold text-slate-300 font-mono mt-0.5 block truncate" title={selectedIngredient.batch}>
                  {selectedIngredient.batch}
                </span>
                <span className="text-[10px] text-slate-500">Dock verified</span>
              </div>
            </div>

            {/* Stock Level Relative Progress Bar */}
            <div className="space-y-1.5 mb-5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Inventory Level vs Safety Minimum</span>
                </span>
                <span className="text-slate-400 font-mono">
                  {Math.round((selectedIngredient.stockQty / selectedIngredient.minThreshold) * 100)}% of threshold
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    selectedIngredient.status === 'healthy'
                      ? 'bg-emerald-500'
                      : selectedIngredient.status === 'low'
                      ? 'bg-amber-400'
                      : 'bg-rose-500'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.round((selectedIngredient.stockQty / (selectedIngredient.minThreshold * 1.5)) * 100))}%`,
                  }}
                />
              </div>
            </div>

            {/* Supplier Information Banner */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs mb-4">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-300">
                  Assigned Supplier: <strong className="text-white">{selectedIngredient.supplier}</strong>
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Next PO Window: Today</span>
            </div>

            {/* Purchase Order Warning & CTA Interaction */}
            {selectedIngredient.status !== 'healthy' ? (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-amber-200">Low Stock — Reorder Required</h5>
                    <p className="text-[11px] text-amber-300/80">
                      Depleted below safety minimum ({selectedIngredient.stockQty} / {selectedIngredient.minThreshold} {selectedIngredient.unit}).
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPoModalOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Generate Purchase Order</span>
                </button>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between text-xs text-emerald-300">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Healthy Stock Level — Optimal operating buffer for 4+ days.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPoModalOpen(true)}
                  className="text-xs text-emerald-400 hover:text-emerald-200 font-bold underline cursor-pointer"
                >
                  Create Manual PO
                </button>
              </div>
            )}
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
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300">
                  {selectedDish.name}
                </span>
              </div>

              {/* Top Summary Metrics */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="p-3.5 rounded-2xl bg-slate-900/85 border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Menu Selling Price</span>
                  <span className="text-2xl font-black text-white font-mono mt-1 block">
                    ₹{selectedDish.sellingPrice}
                  </span>
                  <span className="text-[10px] text-slate-400">Customer bill price</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/85 border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Recipe Food Cost</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
                    ₹{selectedDish.recipeCost.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-emerald-400/80 font-bold">
                    {foodCostPercentage}% Food Cost
                  </span>
                </div>
              </div>

              {/* Profit & Margin Highlighting */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/70 via-slate-900/90 to-teal-950/70 border border-emerald-500/30 mb-5">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-200">Gross Margin per Plate</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30">
                    {grossMarginPercentage}% Margin
                  </span>
                </div>
                <div className="text-3xl font-black text-white font-mono mt-1">
                  +₹{grossProfit.toFixed(2)}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Healthy target: StockMate flags alerts if food cost rises above 32% threshold.
                </p>
              </div>

              {/* Recipe Ingredients Breakdown */}
              <div className="space-y-2 mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Recipe Portion Breakdown:
                </span>
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {selectedDish.ingredients.map((ingItem) => {
                    const ingMeta = INGREDIENTS.find((i) => i.id === ingItem.id);
                    const isInspected = ingItem.id === selectedIngredient.id;
                    return (
                      <div
                        key={ingItem.id}
                        onClick={() => {
                          const idx = INGREDIENTS.findIndex((i) => i.id === ingItem.id);
                          if (idx !== -1) rotateTo(idx);
                        }}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                          isInspected
                            ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-200'
                            : 'bg-white/5 hover:bg-white/10 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span className="font-semibold">{ingMeta?.name || ingItem.id}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({ingItem.portion})</span>
                        </div>
                        <span className="font-mono font-bold text-slate-200">₹{ingItem.portionCost.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Disclaimer */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span>Illustrative sample calculation</span>
              </span>
              <a
                href="#calculator"
                className="text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1 transition-colors"
              >
                <span>Full ROI Calculator</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          PURCHASE ORDER SIMULATION WORKFLOW MODAL
         ==================================================================== */}
      {isPoModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity animate-fade-in"
            onClick={() => setIsPoModalOpen(false)}
          />

          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <div
              className="relative w-full max-w-lg transform overflow-hidden rounded-3xl bg-slate-900 border border-white/20 p-6 text-left shadow-2xl backdrop-blur-2xl transition-all animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-4 border-b border-white/10 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Automated Purchase Order Dispatch</h4>
                    <p className="text-xs text-slate-400">PO #PO-2026-AUTODISPATCH-091 • Dock GRN Sync</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPoModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {poDispatched ? (
                <div className="py-10 text-center space-y-3 animate-fade-in">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-black text-white">Purchase Order Dispatched!</h4>
                  <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                    PO #PO-2026-AUTODISPATCH-091 for <strong>{selectedIngredient.suggestedReorder} {selectedIngredient.unit}</strong> of {selectedIngredient.name} has been routed to <strong>{selectedIngredient.supplier}</strong> via the Vendor Portal.
                  </p>
                  <span className="inline-block text-[10px] px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 font-mono">
                    Dock GRN Barcode Queue Triggered
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Item Details */}
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Ingredient:</span>
                      <strong className="text-white font-semibold">{selectedIngredient.name}</strong>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Vendor:</span>
                      <span className="text-slate-200">{selectedIngredient.supplier}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Current Stock:</span>
                      <span className="text-amber-400 font-mono font-bold">
                        {selectedIngredient.stockQty} {selectedIngredient.unit} (Below min {selectedIngredient.minThreshold} {selectedIngredient.unit})
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Order Quantity:</span>
                      <span className="text-emerald-400 font-mono font-bold">
                        {selectedIngredient.suggestedReorder} {selectedIngredient.unit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
                      <span className="text-slate-300 font-bold">Total Estimated Value (incl. 5% GST):</span>
                      <span className="text-base font-black text-emerald-400 font-mono">
                        ₹{(selectedIngredient.suggestedReorder * selectedIngredient.unitCost * 1.05).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    StockMate automatically alerts the supplier through their portal, locks contract prices, and queues an SVG barcode for your receiving dock.
                  </p>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsPoModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDispatchPo}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch PO to Supplier</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

