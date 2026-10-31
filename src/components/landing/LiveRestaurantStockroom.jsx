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
  Warehouse,
  Snowflake,
  Sun,
  ShieldAlert,
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
        <FallbackIcon className="w-6 h-6 mb-1 opacity-80" />
        <span className="text-[10px] font-bold text-slate-300 truncate max-w-full px-1">
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
// STOCKROOM INGREDIENT INVENTORY DATA
// ============================================================================
export const STOCKROOM_ITEMS = [
  {
    id: 'chicken',
    name: 'Prime Grilled Chicken Cutlets',
    shortName: 'Prime Chicken',
    zone: 'chiller',
    zoneLabel: 'Cold Chiller #1',
    zoneTemp: '-1°C',
    category: 'Poultry / Cold-Chain',
    stockQty: 14.2,
    unit: 'kg',
    minThreshold: 10.0,
    unitCost: 240,
    batch: 'LOT-CHK-550',
    expiryDate: 'Tonight (18h left)',
    expiryHours: 18,
    status: 'expiring',
    statusLabel: 'FEFO Priority (Use First)',
    condition: 'warning',
    supplier: 'Prime Poultry Cold Chain (#V-120)',
    wasteRisk: 1240,
    image:
      'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600&auto=format&fit=crop&q=80',
    fefoNotes:
      'Batch nearing 48h freshness threshold. FEFO rules recommend routing to tonight’s hot dinner line before newer batches.',
    description: 'Fresh pre-marinated prime cutlets stored in cold-chain bin A1.',
  },
  {
    id: 'cheese',
    name: 'Aged Swiss & Cheddar Cheese',
    shortName: 'Aged Cheese',
    zone: 'chiller',
    zoneLabel: 'Cold Chiller #1',
    zoneTemp: '2°C',
    category: 'Dairy Walk-In',
    stockQty: 4.2,
    unit: 'kg',
    minThreshold: 10.0,
    unitCost: 380,
    batch: 'LOT-CHS-740',
    expiryDate: '08 Nov 2026 (8d)',
    expiryHours: 192,
    status: 'low',
    statusLabel: 'Low Stock Alert',
    condition: 'critical',
    supplier: 'Dairy Direct Logistics (#V-105)',
    reorderQty: 15.0,
    reorderCost: 5700,
    image:
      'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&auto=format&fit=crop&q=80',
    fefoNotes:
      'Stock level is below the 10.0 kg safety buffer. Peak service stockout projected in 90 minutes unless replenishment PO is dispatched.',
    description: 'Artisan cheese blocks for burger melting, grating, and sauces.',
  },
  {
    id: 'tomato',
    name: 'Heirloom Vine-Ripened Tomatoes',
    shortName: 'Vine Tomatoes',
    zone: 'crisper',
    zoneLabel: 'Crisper Bay #2',
    zoneTemp: '6°C',
    category: 'Fresh Produce',
    stockQty: 16.5,
    unit: 'kg',
    minThreshold: 8.0,
    unitCost: 42,
    batch: 'LOT-TOM-881',
    expiryDate: '05 Nov 2026 (5d)',
    expiryHours: 120,
    status: 'healthy',
    statusLabel: 'Optimal Stock',
    condition: 'healthy',
    supplier: 'FarmFresh Agri Supplies (#V-102)',
    image:
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
    fefoNotes:
      'Optimal inventory level. Crisp cluster tomatoes certified grade-A freshness, 5 days safe buffer.',
    description: 'Crisp cluster tomatoes, perfect for salads, burgers, and sauces.',
  },
  {
    id: 'greens',
    name: 'Hydroponic Greens & Herbs',
    shortName: 'Fresh Greens',
    zone: 'crisper',
    zoneLabel: 'Crisper Bay #2',
    zoneTemp: '4°C',
    category: 'Fresh Produce',
    stockQty: 8.4,
    unit: 'kg',
    minThreshold: 5.0,
    unitCost: 65,
    batch: 'LOT-LET-410',
    expiryDate: '03 Nov 2026 (3d)',
    expiryHours: 72,
    status: 'healthy',
    statusLabel: 'Optimal Stock',
    condition: 'healthy',
    supplier: 'GreenLeaf Hydroponics (#V-108)',
    image:
      'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=600&auto=format&fit=crop&q=80',
    fefoNotes:
      'Pesticide-free hydroponic butterhead & sweet Italian basil. Batch rotation healthy.',
    description: 'Fresh hydroponic lettuce blend and sweet Italian basil.',
  },
  {
    id: 'mushroom',
    name: 'Wild Portobello Mushrooms',
    shortName: 'Portobello',
    zone: 'crisper',
    zoneLabel: 'Crisper Bay #2',
    zoneTemp: '4°C',
    category: 'Fresh Produce',
    stockQty: 5.8,
    unit: 'kg',
    minThreshold: 4.0,
    unitCost: 140,
    batch: 'LOT-MSH-404',
    expiryDate: '02 Nov 2026 (2d)',
    expiryHours: 48,
    status: 'expiring',
    statusLabel: 'FEFO Watch (48h)',
    condition: 'warning',
    supplier: 'Highland Fungi Co (#V-114)',
    wasteRisk: 812,
    image:
      'https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=600&auto=format&fit=crop&q=80',
    fefoNotes:
      'Earthy caps for sauté line and pasta specials. Scheduled for priority depletion over the next 48 hours.',
    description: 'Hand-picked portobello & cremini mushrooms.',
  },
  {
    id: 'buns',
    name: 'Artisan Brioche Burger Buns',
    shortName: 'Brioche Buns',
    zone: 'dry',
    zoneLabel: 'Dry Pantry #3',
    zoneTemp: '21°C',
    category: 'Bakery Station',
    stockQty: 48,
    unit: 'pcs',
    minThreshold: 24,
    unitCost: 9.0,
    batch: 'LOT-BUN-104',
    expiryDate: '04 Nov 2026 (4d)',
    expiryHours: 96,
    status: 'healthy',
    statusLabel: 'Optimal Stock',
    condition: 'healthy',
    supplier: 'Golden Crust Bakery (#V-101)',
    image:
      'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80',
    fefoNotes:
      'Fresh daily bake with glossy butter glaze. Stock level well above minimum buffer.',
    description: 'Handcrafted golden brioche burger buns.',
  },
  {
    id: 'sauce',
    name: 'White Truffle Garlic Emulsion',
    shortName: 'Truffle Aioli',
    zone: 'chiller',
    zoneLabel: 'Cold Chiller #1',
    zoneTemp: '3°C',
    category: 'Cold Prepared Sauces',
    stockQty: 6.0,
    unit: 'L',
    minThreshold: 3.0,
    unitCost: 180,
    batch: 'LOT-SAU-309',
    expiryDate: '07 Nov 2026 (7d)',
    expiryHours: 168,
    status: 'healthy',
    statusLabel: 'Optimal Stock',
    condition: 'healthy',
    supplier: 'Chef Commissary Central (#V-110)',
    image:
      'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&auto=format&fit=crop&q=80',
    fefoNotes:
      'House-emulsified roasted garlic with Piedmont white truffle oil. Batch verified.',
    description: 'Slow-emulsified truffle aioli in gastronorm wells.',
  },
  {
    id: 'pasta',
    name: 'Artisan Bronze-Cut Penne',
    shortName: 'Artisan Penne',
    zone: 'dry',
    zoneLabel: 'Dry Pantry #3',
    zoneTemp: '20°C',
    category: 'Dry Grains',
    stockQty: 28.0,
    unit: 'kg',
    minThreshold: 15.0,
    unitCost: 85,
    batch: 'LOT-PEN-901',
    expiryDate: '15 Jan 2027 (90d)',
    expiryHours: 2160,
    status: 'healthy',
    statusLabel: 'Optimal Stock',
    condition: 'healthy',
    supplier: 'Pastificio Molino Italia (#V-118)',
    image:
      'https://images.unsplash.com/photo-1621996346565-e3d5d6281699?w=600&auto=format&fit=crop&q=80',
    fefoNotes:
      'Traditional semolina extruded bronze-cut penne. Long shelf life, zero spoilage risk.',
    description: 'Sauce-gripping bronze extruded penne pasta.',
  },
];

// ============================================================================
// MAIN COMPONENT: INTERACTIVE LIVE RESTAURANT STOCKROOM
// ============================================================================
export const LiveRestaurantStockroom = ({ className = '' }) => {
  const [items, setItems] = useState(STOCKROOM_ITEMS);
  const [selectedId, setSelectedId] = useState('chicken');
  const [activeZone, setActiveZone] = useState('all');
  const [poModalOpen, setPoModalOpen] = useState(false);
  const [poConfirmed, setPoConfirmed] = useState(false);
  const [fefoApplied, setFefoApplied] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Active selected item object
  const selectedItem = useMemo(() => {
    return items.find((i) => i.id === selectedId) || items[0];
  }, [items, selectedId]);

  // Filtered crates by storage zone
  const displayedItems = useMemo(() => {
    if (activeZone === 'all') return items;
    return items.filter((i) => i.zone === activeZone);
  }, [items, activeZone]);

  // Toast trigger
  const showToast = useCallback((msg, duration = 4000) => {
    setToastMessage(msg);
    const t = setTimeout(() => setToastMessage(null), duration);
    return () => clearTimeout(t);
  }, []);

  // Action: Enforce FEFO Rotation
  const handleEnforceFefo = (itemId) => {
    setFefoApplied(true);
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? {
              ...i,
              status: 'healthy',
              condition: 'healthy',
              statusLabel: 'FEFO Rotated to Line',
              stockQty: Math.max(0, +(i.stockQty - 3.2).toFixed(1)),
              fefoNotes:
                'FEFO rule successfully enforced! Batch dispatched to tonight’s active dinner prep line. Spoilage risk eliminated.',
            }
          : i
      )
    );
    showToast(
      '✅ FEFO Rule Enforced! Batch dispatched to dinner prep line. ₹1,240 food waste prevented.'
    );
  };

  // Action: Generate Purchase Order
  const handleConfirmPO = () => {
    setPoModalOpen(false);
    setPoConfirmed(true);
    setItems((prev) =>
      prev.map((i) =>
        i.id === 'cheese'
          ? {
              ...i,
              status: 'healthy',
              condition: 'healthy',
              statusLabel: 'Replenished (+15kg)',
              stockQty: +(i.stockQty + i.reorderQty).toFixed(1),
              fefoNotes:
                'Purchase order confirmed! 15.0 kg inbound tomorrow morning at 07:00 AM dock receiving.',
            }
          : i
      )
    );
    showToast(
      '📦 Demo Purchase Order #PO-8841 Generated! Stock replenishment scheduled (Demo Simulation).'
    );
  };

  // Action: Reset Demo
  const handleReset = () => {
    setItems(STOCKROOM_ITEMS);
    setSelectedId('chicken');
    setActiveZone('all');
    setFefoApplied(false);
    setPoConfirmed(false);
    setPoModalOpen(false);
    showToast('↺ Stockroom reset to initial demo state.');
  };

  return (
    <div
      className={`relative select-none outline-none w-full ${className}`}
      role="region"
      aria-label="StockMate Interactive Live Restaurant Stockroom"
    >
      {/* Dynamic Ambient Forest-Green Glow */}
      <div className="absolute -inset-4 sm:-inset-6 rounded-3xl bg-gradient-to-tr from-emerald-600/15 via-[#0A261B]/40 to-teal-500/10 blur-[80px] pointer-events-none" />

      {/* Main Stockroom Cabinet Frame */}
      <div className="relative z-10 w-full rounded-3xl p-4 sm:p-5 lg:p-6 bg-gradient-to-b from-[#0b2017] via-[#071711] to-[#030c08] border-2 border-emerald-500/30 shadow-2xl backdrop-blur-2xl overflow-hidden text-left">
        {/* Subtle Brushed Stainless Steel / Wire Rack Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        {/* Ambient Top Light Beam Accent */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />

        {/* ==================================================================
            1. STOCKROOM HEADER & STORAGE ZONE TABS
           ================================================================== */}
        <div className="relative z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 mb-4 border-b border-white/10">
          {/* Station Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
              <Warehouse className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-live-beacon" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                  Live Restaurant Stockroom
                </span>
                <span className="text-[9px] font-mono text-slate-400 bg-white/5 border border-white/10 px-1.5 py-0.2 rounded">
                  Active Walk-In
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-white leading-tight">
                Walk-In Chiller &amp; Dry Storage Bays
              </h3>
            </div>
          </div>

          {/* Storage Zone Selector Tabs */}
          <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10 overflow-x-auto no-scrollbar shrink-0">
            <button
              type="button"
              onClick={() => setActiveZone('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeZone === 'all'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Storage ({items.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveZone('chiller')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                activeZone === 'chiller'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Snowflake className="w-3 h-3 text-cyan-400" />
              <span>Chiller (2°C)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveZone('crisper')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                activeZone === 'crisper'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3 h-3 text-emerald-400" />
              <span>Crisper (6°C)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveZone('dry')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                activeZone === 'dry'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sun className="w-3 h-3 text-amber-400" />
              <span>Dry Pantry</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="p-1 rounded-lg text-slate-500 hover:text-white transition-colors cursor-pointer ml-1"
              title="Reset Demo State"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ==================================================================
            2. THE STORAGE CRATES SHELVING GRID (LAYERED PERSPECTIVE)
           ================================================================== */}
        <div className="relative z-20 mb-4">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Storage Bins &amp; Ingredient Crates (Click to Inspect)
            </span>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Live FEFO Batch Telemetry</span>
            </span>
          </div>

          {/* Crates Grid: 4 columns on large screens, 2 on mobile/tablet */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {displayedItems.map((item) => {
              const isSelected = selectedId === item.id;
              const isCritical = item.condition === 'critical';
              const isWarning = item.condition === 'warning';

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedId(item.id)}
                  className={`group relative p-2 sm:p-2.5 rounded-2xl transition-all duration-300 cursor-pointer backdrop-blur-xl border text-left flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900/95 border-emerald-400 ring-2 ring-emerald-400/60 shadow-xl shadow-emerald-950/80 scale-[1.02]'
                      : isCritical
                      ? 'bg-rose-950/60 border-rose-500/60 hover:border-rose-400 hover:bg-rose-900/70 shadow-md shadow-rose-950/40'
                      : isWarning
                      ? 'bg-amber-950/60 border-amber-500/60 hover:border-amber-400 hover:bg-amber-900/70 shadow-md shadow-amber-950/40'
                      : 'bg-slate-900/70 border-white/10 hover:border-emerald-500/40 hover:bg-slate-800/80'
                  }`}
                  title={`Inspect ${item.name}`}
                >
                  {/* Top Crate Tag: Zone & Alert Indicator */}
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[9px] font-mono text-slate-400 truncate">
                      {item.zoneTemp}
                    </span>
                    <span
                      className={`text-[8px] font-mono font-extrabold uppercase px-1 py-0.2 rounded border shrink-0 ${
                        isCritical
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : isWarning
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {item.statusLabel.split(' ')[0]}
                    </span>
                  </div>

                  {/* Crate Visual Photo */}
                  <div className="relative w-full h-20 sm:h-24 rounded-xl overflow-hidden border border-white/10 shrink-0 mb-2 shadow-inner group-hover:border-emerald-400/50 transition-colors">
                    <FoodImage
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                    {/* Available Stock Tag Over Image */}
                    <div className="absolute bottom-1.5 inset-x-1.5 flex items-center justify-between text-[11px] font-mono font-black text-white drop-shadow-md">
                      <span>
                        {item.stockQty} {item.unit}
                      </span>
                      <span className="text-[9px] text-slate-300 font-normal">
                        Min: {item.minThreshold}
                      </span>
                    </div>

                    {/* Pulsing Alert Dot */}
                    {(isCritical || isWarning) && (
                      <span
                        className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${
                          isCritical ? 'bg-rose-400 animate-ping' : 'bg-amber-400 animate-ping'
                        }`}
                      />
                    )}
                  </div>

                  {/* Crate Label */}
                  <div>
                    <h5 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                      {item.shortName}
                    </h5>
                    <div className="text-[9px] font-mono text-slate-400 truncate mt-0.5">
                      {item.batch} • {item.expiryDate.split(' ')[0]}
                    </div>

                    {/* Stock Buffer Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-black/60 overflow-hidden mt-1.5 border border-white/5">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isCritical
                            ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                            : isWarning
                            ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(15, (item.stockQty / (item.minThreshold * 2)) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ==================================================================
            3. CENTRAL INVENTORY INSPECTION STATION (TELEMETRY & ACTIONS)
           ================================================================== */}
        <div className="relative z-20 p-4 sm:p-5 rounded-2xl bg-black/60 border border-emerald-500/40 text-left shadow-xl">
          {/* Header row of inspection panel */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-emerald-400/50 shrink-0 shadow-md">
                <FoodImage
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm sm:text-base font-black text-white truncate">
                    {selectedItem.name}
                  </h4>
                  <span
                    className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                      selectedItem.condition === 'critical'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : selectedItem.condition === 'warning'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {selectedItem.statusLabel}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span>Storage: <strong className="text-slate-200">{selectedItem.zoneLabel} ({selectedItem.zoneTemp})</strong></span>
                  <span>•</span>
                  <span>Batch: <strong className="text-slate-200">{selectedItem.batch}</strong></span>
                  <span>•</span>
                  <span>Supplier: <strong className="text-slate-200">{selectedItem.supplier}</strong></span>
                </div>
              </div>
            </div>

            {/* Quick action buttons on right */}
            <div className="shrink-0 flex items-center gap-2">
              {selectedItem.condition === 'critical' ? (
                <button
                  type="button"
                  onClick={() => setPoModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-500/30 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Reorder Required • Create PO</span>
                </button>
              ) : selectedItem.condition === 'warning' ? (
                <button
                  type="button"
                  disabled={fefoApplied && selectedItem.id === 'chicken'}
                  onClick={() => handleEnforceFefo(selectedItem.id)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/30 cursor-pointer disabled:opacity-60"
                >
                  <ChefHat className="w-3.5 h-3.5" />
                  <span>
                    {fefoApplied && selectedItem.id === 'chicken'
                      ? 'FEFO Dispatched to Hot Line'
                      : 'Enforce FEFO Rotation'}
                  </span>
                </button>
              ) : (
                <div className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Batch Rotation Compliant</span>
                </div>
              )}
            </div>
          </div>

          {/* Telemetry Metrics Grid: Available, Safety Min, Expiry, Unit Cost */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Available Stock
              </span>
              <strong className="text-sm sm:text-base font-black text-white">
                {selectedItem.stockQty} {selectedItem.unit}
              </strong>
              <span className="text-[9px] text-slate-400 block mt-0.5">
                Target Safety Buffer: {selectedItem.minThreshold} {selectedItem.unit}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Batch Expiry Date
              </span>
              <strong
                className={`text-xs sm:text-sm font-black block truncate ${
                  selectedItem.condition === 'warning'
                    ? 'text-amber-300'
                    : selectedItem.condition === 'critical'
                    ? 'text-rose-300'
                    : 'text-slate-200'
                }`}
              >
                {selectedItem.expiryDate}
              </strong>
              <span className="text-[9px] text-slate-400 block mt-0.5">
                {selectedItem.expiryHours <= 48
                  ? 'FEFO Priority Window Active'
                  : 'Stable Shelf Life'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Unit Valuation (GRN)
              </span>
              <strong className="text-sm sm:text-base font-black text-emerald-400">
                ₹{selectedItem.unitCost} / {selectedItem.unit}
              </strong>
              <span className="text-[9px] text-slate-400 block mt-0.5">
                Total Bin Value: ₹{(selectedItem.stockQty * selectedItem.unitCost).toFixed(0)}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Stock Condition
              </span>
              <strong
                className={`text-xs sm:text-sm font-black block truncate ${
                  selectedItem.condition === 'critical'
                    ? 'text-rose-400'
                    : selectedItem.condition === 'warning'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {selectedItem.condition === 'critical'
                  ? 'Reorder Required'
                  : selectedItem.condition === 'warning'
                  ? 'FEFO Action Required'
                  : 'Healthy Stock Level'}
              </strong>
              <span className="text-[9px] text-slate-400 block mt-0.5">
                Dock GRN Reconciled
              </span>
            </div>
          </div>

          {/* FEFO Diagnostic Note */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-slate-950/90 border border-white/10 flex items-start gap-2.5 text-[11px] text-slate-300">
            <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-white">Inventory Intelligence: </strong>
              {selectedItem.fefoNotes}
            </p>
          </div>
        </div>

        {/* Footer Hint */}
        <div className="relative z-20 mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Interactive Live Stockroom • Click any crate or storage zone to inspect</span>
          </div>
          <span className="text-slate-500 bg-white/5 px-2 py-0.5 rounded border border-white/10 text-[9px] sm:text-[10px]">
            Illustrative Demo Workbench • Simulated Inventory
          </span>
        </div>
      </div>

      {/* ==================================================================
          4. DEMO PURCHASE ORDER GENERATION MODAL
         ================================================================== */}
      {poModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in text-left">
          <div className="relative w-full max-w-lg p-5 sm:p-6 rounded-3xl bg-slate-900 border-2 border-emerald-500/40 shadow-2xl text-white">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-black">StockMate Purchase Order Preview</h4>
                  <span className="text-xs font-mono text-emerald-400">
                    PO-2026-8841 (Demo Simulated PO)
                  </span>
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
            <div className="my-4 space-y-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 grid grid-cols-2 gap-2">
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
                  <div className="font-bold text-white text-sm font-sans">
                    Aged Swiss &amp; Cheddar Cheese Blocks
                  </div>
                  <div className="text-[11px] text-slate-300 font-mono">
                    Auto-Calculated Replenishment: +15.0 kg @ ₹380.00 / kg
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-emerald-300">₹5,700.00</div>
                  <span className="text-[9px] text-slate-400">Dock GRN Auto-Match</span>
                </div>
              </div>

              {/* Simulation Disclaimer */}
              <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Frontend Demo Simulation:</strong> Confirming this action generates a
                  simulated demo PO and updates the stockroom crate state. No real supplier order is placed.
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
                onClick={handleConfirmPO}
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

export default LiveRestaurantStockroom;
