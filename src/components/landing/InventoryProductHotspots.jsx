import React, { useState } from 'react';
import {
  Boxes,
  AlertTriangle,
  ClockAlert,
  PackageCheck,
  Receipt,
  Store,
  X,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Info,
} from 'lucide-react';

// 6 Core Operational Hotspots with realistic StockMate illustrative preview data
const HOTSPOTS_DATA = [
  {
    id: 'live_inventory',
    number: 1,
    title: 'Live Perpetual Inventory',
    category: 'Pantry Engine',
    badge: 'Optimal Stock',
    badgeVariant: 'emerald',
    icon: Boxes,
    // Desktop layout coordinates (% from top/left on the dashboard mockup)
    coords: { x: 26, y: 52 },
    shortExplanation:
      'Continuous automated stock counts updated in real time. Deductions occur automatically whenever kitchen tickets or POS orders are rung up.',
    productInfo: {
      itemName: 'Amul Salted Butter (Pasteurized)',
      sku: 'SKU-AMUL-01',
      storageLocation: 'Walk-In Chiller 2 (4°C)',
      currentQty: '32.0 kg',
      minThreshold: '10.0 kg',
      unitCost: '₹480 / kg',
      valuation: '₹15,360',
      supplier: 'Dairy Direct Logistics',
      status: 'Optimal (3.2x buffer safety)',
      reorderTrigger: 'Auto-dispatches at 10.0 kg',
    },
  },
  {
    id: 'low_stock_alerts',
    number: 2,
    title: 'Low Stock Auto-Alerts',
    category: 'Safety Buffers',
    badge: 'Alert Active',
    badgeVariant: 'amber',
    icon: AlertTriangle,
    coords: { x: 58, y: 44 },
    shortExplanation:
      'Proactive warnings triggered before ingredients run out. StockMate auto-drafts digital purchase orders directly into the supplier portal.',
    productInfo: {
      itemName: 'Fresh Pav / Buns (Daily Batch)',
      sku: 'SKU-PAV-1041',
      storageLocation: 'Dry Bakery Rack B-2',
      currentQty: '5 packs',
      minThreshold: '20 packs',
      unitCost: '₹25 / pack',
      valuation: '₹125',
      supplier: 'Golden Crust Artisan Bakery',
      status: 'Critical Alert (Below 20 packs)',
      reorderTrigger: 'PO #PO-1042 auto-drafted for 50 packs',
    },
  },
  {
    id: 'fefo_expiry',
    number: 3,
    title: 'FEFO Expiry Tracking',
    category: 'Zero-Waste Kitchen',
    badge: 'Priority 1 Dispatch',
    badgeVariant: 'rose',
    icon: ClockAlert,
    coords: { x: 82, y: 32 },
    shortExplanation:
      'Strict First-Expired, First-Out triage directs kitchen stations to utilize batches nearing shelf-life first, cutting kitchen wastage by up to 84%.',
    productInfo: {
      itemName: 'Fresh Malai Paneer (Vacuum Packed)',
      sku: 'BATCH-2026-MAL-089',
      storageLocation: 'Dairy Chiller 1 (2°C)',
      currentQty: '8.5 kg',
      minThreshold: '4.0 kg',
      unitCost: '₹360 / kg',
      valuation: '₹3,060',
      supplier: 'Dairy Direct Logistics',
      status: '2 Days Left (Expiry: Nov 01, 2026)',
      reorderTrigger: 'Station alert: Prioritize in Dinner Tikka & Gravy',
    },
  },
  {
    id: 'dock_grn',
    number: 4,
    title: 'Dock GRN & Discrepancy Claims',
    category: 'Receiving Dock',
    badge: 'Passed 95% • Claim Filed',
    badgeVariant: 'teal',
    icon: PackageCheck,
    coords: { x: 38, y: 78 },
    shortExplanation:
      'Store managers inspect inbound goods against purchase orders. Damaged or rejected quantities immediately generate digital debit credit claims.',
    productInfo: {
      itemName: 'Dock Inspection #GRN-2026-MTK-1041',
      sku: 'PO Ref: PO-1041',
      storageLocation: 'Receiving Bay 1 (09:15 AM)',
      currentQty: '95 packs accepted / 100 ordered',
      minThreshold: '5 packs damaged in transit',
      unitCost: '₹25 / pack',
      valuation: 'Debit Claim: -₹125 deducted',
      supplier: 'Golden Crust Artisan Bakery',
      status: 'Claim Dispatched to Vendor Portal',
      reorderTrigger: 'Supplier credit note verified automatically',
    },
  },
  {
    id: 'supplier_invoices',
    number: 5,
    title: 'Supplier 3-Way Invoice Matching',
    category: 'Financial Ledger',
    badge: 'Reconciled 100%',
    badgeVariant: 'blue',
    icon: Receipt,
    coords: { x: 74, y: 80 },
    shortExplanation:
      'Automatic cross-verification of Purchase Order, physical dock GRN, and vendor invoice. Eliminates overbilling, phantom deliveries, and manual ledger audits.',
    productInfo: {
      itemName: 'Invoice #SINV-GC-2026-891',
      sku: 'Vendor Code: SUP-GOLD-01',
      storageLocation: 'Automated AP Ledger',
      currentQty: '1 Verified Delivery',
      minThreshold: 'Statutory 18% GST Checked',
      unitCost: 'Net Payable: ₹2,375',
      valuation: 'Initial: ₹2,500 (-₹125 Claim)',
      supplier: 'Golden Crust Artisan Bakery',
      status: 'Reconciled & Cleared for Payment',
      reorderTrigger: 'Payment scheduled for Nov 14 (Net 15)',
    },
  },
  {
    id: 'multi_branch',
    number: 6,
    title: 'Multi-Branch Management',
    category: 'Enterprise Governance',
    badge: '4 Outlets Connected',
    badgeVariant: 'purple',
    icon: Store,
    coords: { x: 18, y: 18 },
    shortExplanation:
      'Unified multi-unit visibility across central commissaries and satellite outlets with inter-branch stock transfers and consolidated food margin reports.',
    productInfo: {
      itemName: 'Consolidated Network: Pune Central HQ',
      sku: 'Network ID: NET-PUNE-01',
      storageLocation: 'Supplying 4 Satellite Outlets',
      currentQty: '14 Kitchen Crew on Shift',
      minThreshold: '3 Connected POS Terminals',
      unitCost: 'Today Consumption: ₹38,200',
      valuation: 'Consolidated Pantry: ₹1,42,850',
      supplier: 'Central Kitchen & Commissary Hub',
      status: 'Active • Routine FEFO Rotation',
      reorderTrigger: 'Inter-branch dispatch route scheduled 11:30 AM',
    },
  },
];

export const InventoryProductHotspots = () => {
  const [activeHotspotId, setActiveHotspotId] = useState('live_inventory');
  const [hoveredHotspotId, setHoveredHotspotId] = useState(null);
  const [isPanelDismissed, setIsPanelDismissed] = useState(false);

  const activeHotspot =
    HOTSPOTS_DATA.find((h) => h.id === (hoveredHotspotId || activeHotspotId)) ||
    HOTSPOTS_DATA[0];

  const handleSelectHotspot = (id) => {
    setActiveHotspotId(id);
    setHoveredHotspotId(null);
    setIsPanelDismissed(false);
  };

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="reveal-on-scroll text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-black uppercase tracking-wider mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Interactive Platform Blueprint</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Explore StockMate's Live Engine with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300">Interactive Hotspots</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-300 mt-4 leading-relaxed">
          Hover or tap any pulsing hotspot marker to inspect perpetual stock deduction, automated low-stock warnings, FEFO expiry rotation, dock GRN receiving, 3-way invoice reconciliation, and multi-branch coordination.
        </p>

        {/* Illustrative Notice Pill */}
        <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-white/10 text-[11px] text-slate-400">
          <Info className="w-3 h-3 text-emerald-400 shrink-0" />
          <span>Interactive SaaS Blueprint • Illustrative Platform Preview</span>
        </div>
      </div>

      {/* Hotspots Quick Filter Pill Bar (Super accessible on mobile & desktop) */}
      <div className="reveal-on-scroll mb-6 flex flex-wrap items-center justify-center gap-2 max-w-5xl mx-auto">
        {HOTSPOTS_DATA.map((hotspot) => {
          const isSelected = (hoveredHotspotId || activeHotspotId) === hotspot.id;
          const Icon = hotspot.icon;
          return (
            <button
              key={hotspot.id}
              type="button"
              onClick={() => handleSelectHotspot(hotspot.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border shadow-xs ${
                isSelected
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white border-emerald-400/80 shadow-emerald-950/50 scale-[1.03]'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-white/10 hover:border-emerald-500/30'
              }`}
              aria-label={`Select ${hotspot.title} hotspot`}
            >
              <span className={`w-5 h-5 rounded-full text-[11px] font-black flex items-center justify-center shrink-0 ${
                isSelected ? 'bg-slate-950 text-emerald-300' : 'bg-slate-800 text-slate-400'
              }`}>
                {hotspot.number}
              </span>
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-emerald-400'}`} />
              <span>{hotspot.title}</span>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Dashboard Canvas with Hotspot Overlays */}
      <div className="reveal-on-scroll relative max-w-6xl mx-auto rounded-3xl border border-white/15 bg-gradient-to-b from-slate-900/95 via-slate-950 to-slate-950/98 p-4 sm:p-6 shadow-2xl overflow-hidden backdrop-blur-2xl">
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        {/* Dashboard Window Header Bar */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-white/10">
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

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 hidden sm:inline">Active Telemetry:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Perpetual FIFO/FEFO Sync</span>
            </span>
          </div>
        </div>

        {/* Realistic Dashboard Frame Container */}
        <div className="relative z-10 rounded-2xl bg-slate-950/90 border border-white/10 p-3 sm:p-5 overflow-hidden">
          {/* Top 4 KPI Metric Tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Live Pantry Valuation</span>
              <div className="text-xl sm:text-2xl font-black font-mono text-white mt-1">₹1,42,850</div>
              <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
                <TrendingUp className="w-3 h-3" /> +14.2% Food Cost Efficiency
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">FEFO Accuracy Score</span>
              <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400 mt-1">99.8%</div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Zero Expired Lots Served</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Verified Dock GRNs</span>
              <div className="text-xl sm:text-2xl font-black font-mono text-teal-300 mt-1">18 Cleared</div>
              <span className="text-[10px] text-teal-400 mt-0.5 block">Auto Debit Claims Reconciled</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Connected Outlets</span>
              <div className="text-xl sm:text-2xl font-black font-mono text-white mt-1">4 Branches</div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Central Commissary Network</span>
            </div>
          </div>

          {/* Realistic Inventory Table & Operational Mockup */}
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-900/60 mb-3">
            <table className="w-full text-left text-xs border-collapse min-w-[620px]">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider text-[10px] bg-slate-950/60">
                  <th className="py-2.5 px-3.5">Ingredient &amp; SKU</th>
                  <th className="py-2.5 px-3.5">Supplier Partner</th>
                  <th className="py-2.5 px-3.5">Storage Bay</th>
                  <th className="py-2.5 px-3.5 text-right">In Stock / Min</th>
                  <th className="py-2.5 px-3.5 text-right">Unit Rate</th>
                  <th className="py-2.5 px-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {/* Row 1: Butter (Live Inventory Hotspot Target) */}
                <tr className={`transition-colors ${(hoveredHotspotId || activeHotspotId) === 'live_inventory' ? 'bg-emerald-500/15' : 'hover:bg-white/5'}`}>
                  <td className="py-3 px-3.5">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>Amul Salted Butter (Pasteurized)</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">SKU-AMUL-01</span>
                  </td>
                  <td className="py-3 px-3.5 text-slate-300 font-medium">Dairy Direct Logistics</td>
                  <td className="py-3 px-3.5 text-slate-400 text-[11px]">Walk-In Chiller 2 (4°C)</td>
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-white">
                    32.0 kg <span className="text-slate-500 font-normal text-[10px]">/ 10.0 kg</span>
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-emerald-400">₹480</td>
                  <td className="py-3 px-3.5 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Optimal
                    </span>
                  </td>
                </tr>

                {/* Row 2: Pav (Low Stock Alert Target) */}
                <tr className={`transition-colors ${(hoveredHotspotId || activeHotspotId) === 'low_stock_alerts' ? 'bg-amber-500/15' : 'hover:bg-white/5'}`}>
                  <td className="py-3 px-3.5">
                    <div className="font-bold text-white">Fresh Pav / Buns (Daily Batch)</div>
                    <span className="text-[10px] font-mono text-slate-400">SKU-PAV-1041</span>
                  </td>
                  <td className="py-3 px-3.5 text-slate-300 font-medium">Golden Crust Bakery</td>
                  <td className="py-3 px-3.5 text-slate-400 text-[11px]">Dry Bakery Rack B-2</td>
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-amber-300">
                    5 packs <span className="text-slate-500 font-normal text-[10px]">/ 20 packs</span>
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-emerald-400">₹25</td>
                  <td className="py-3 px-3.5 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Low Stock
                    </span>
                  </td>
                </tr>

                {/* Row 3: Paneer (FEFO Expiry Target) */}
                <tr className={`transition-colors ${(hoveredHotspotId || activeHotspotId) === 'fefo_expiry' ? 'bg-rose-500/15' : 'hover:bg-white/5'}`}>
                  <td className="py-3 px-3.5">
                    <div className="font-bold text-white">Fresh Malai Paneer (Vacuum Packed)</div>
                    <span className="text-[10px] font-mono text-slate-400">BATCH-2026-MAL-089</span>
                  </td>
                  <td className="py-3 px-3.5 text-slate-300 font-medium">Dairy Direct Logistics</td>
                  <td className="py-3 px-3.5 text-slate-400 text-[11px]">Dairy Chiller 1 (2°C)</td>
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-white">
                    8.5 kg <span className="text-slate-500 font-normal text-[10px]">/ 4.0 kg</span>
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-emerald-400">₹360</td>
                  <td className="py-3 px-3.5 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> 2 Days Left (FEFO)
                    </span>
                  </td>
                </tr>

                {/* Row 4: Basmati Rice */}
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3.5">
                    <div className="font-bold text-white">Premium Aged Basmati Rice</div>
                    <span className="text-[10px] font-mono text-slate-400">SKU-BAS-101</span>
                  </td>
                  <td className="py-3 px-3.5 text-slate-300 font-medium">Metro Food Distributors</td>
                  <td className="py-3 px-3.5 text-slate-400 text-[11px]">Dry Pantry A-1 (Pallet)</td>
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-white">
                    48.0 kg <span className="text-slate-500 font-normal text-[10px]">/ 15.0 kg</span>
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-emerald-400">₹110</td>
                  <td className="py-3 px-3.5 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Optimal
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bottom Dock GRN & 3-Way Invoice Bar Mockup */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className={`p-3 rounded-xl border transition-colors ${
              (hoveredHotspotId || activeHotspotId) === 'dock_grn'
                ? 'bg-teal-950/60 border-teal-500/60 ring-1 ring-teal-500/40'
                : 'bg-white/5 border-white/10'
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-teal-300 flex items-center gap-1.5">
                  <PackageCheck className="w-4 h-4 text-teal-400" />
                  <span>Dock GRN #GRN-2026-MTK-1041</span>
                </span>
                <span className="font-mono text-[10px] text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30">
                  Damage Claim: -₹125
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Golden Crust Bakery: 95/100 accepted. 5 packets crushed in transit. Automatic credit claim filed.
              </p>
            </div>

            <div className={`p-3 rounded-xl border transition-colors ${
              (hoveredHotspotId || activeHotspotId) === 'supplier_invoices'
                ? 'bg-blue-950/60 border-blue-500/60 ring-1 ring-blue-500/40'
                : 'bg-white/5 border-white/10'
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-blue-300 flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-blue-400" />
                  <span>Invoice #SINV-GC-2026-891</span>
                </span>
                <span className="font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30 text-[10px]">
                  Net: ₹2,375 Reconciled
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Cross-verified against PO-1041 and Dock GRN. Net 15 terms scheduled with statutory GST compliance.
              </p>
            </div>
          </div>

          {/* 6 Clickable Hotspot Markers Placed Over Dashboard */}
          {HOTSPOTS_DATA.map((hotspot) => {
            const isSelected = (hoveredHotspotId || activeHotspotId) === hotspot.id;
            const Icon = hotspot.icon;

            return (
              <div
                key={hotspot.id}
                style={{
                  top: `${hotspot.coords.y}%`,
                  left: `${hotspot.coords.x}%`,
                }}
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                onMouseEnter={() => setHoveredHotspotId(hotspot.id)}
                onMouseLeave={() => setHoveredHotspotId(null)}
                onClick={() => handleSelectHotspot(hotspot.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelectHotspot(hotspot.id);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Hotspot ${hotspot.number}: ${hotspot.title}`}
              >
                {/* Pulsing Outer Ping Ring */}
                <div
                  className={`absolute -inset-2.5 rounded-full pointer-events-none transition-all duration-300 ${
                    isSelected
                      ? 'bg-emerald-400/30 animate-ping opacity-90'
                      : 'bg-emerald-400/20 animate-pulse opacity-60'
                  }`}
                />

                {/* Hotspot Button Center */}
                <div
                  className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-black text-xs shadow-xl transition-all duration-200 border ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 border-white scale-110 ring-4 ring-emerald-500/30'
                      : 'bg-slate-900/95 text-emerald-300 border-emerald-500/60 hover:scale-105 hover:border-emerald-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Information Panel for the Active Hotspot */}
        {!isPanelDismissed && activeHotspot ? (
          <div className="mt-5 rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-6 shadow-2xl relative animate-panel-switch">
            {/* Header with Title, Status & Close Button */}
            <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center justify-center shrink-0">
                  <activeHotspot.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                      Hotspot #{activeHotspot.number} &bull; {activeHotspot.category}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/15">
                      {activeHotspot.badge}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
                    {activeHotspot.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = HOTSPOTS_DATA.findIndex((h) => h.id === activeHotspot.id);
                    const nextIndex = (currentIndex + 1) % HOTSPOTS_DATA.length;
                    setActiveHotspotId(HOTSPOTS_DATA[nextIndex].id);
                  }}
                  title="Switch to next hotspot"
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors flex items-center gap-1"
                >
                  <span>Next Hotspot</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsPanelDismissed(true)}
                  title="Close panel"
                  aria-label="Close information panel"
                  className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white flex items-center justify-center border border-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Explanation Prose */}
            <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
              {activeHotspot.shortExplanation}
            </p>

            {/* Product & Operational Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 mt-4 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Demonstration Item / Focus</span>
                <strong className="text-white font-bold block mt-0.5 truncate">{activeHotspot.productInfo.itemName}</strong>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Identifier / SKU</span>
                <strong className="text-emerald-400 font-mono font-bold block mt-0.5">{activeHotspot.productInfo.sku}</strong>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Location / Channel</span>
                <strong className="text-slate-200 font-medium block mt-0.5 truncate">{activeHotspot.productInfo.storageLocation}</strong>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Live Metric / Value</span>
                <strong className="text-white font-mono font-bold block mt-0.5">{activeHotspot.productInfo.valuation}</strong>
              </div>
            </div>

            {/* Footer Actionable Workflow Hint */}
            <div className="mt-3.5 pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong className="text-white">Workflow Safeguard:</strong> {activeHotspot.productInfo.reorderTrigger}
                </span>
              </div>
              <a
                href="#how-it-works"
                className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 shrink-0 transition-colors"
              >
                <span>View Full Operational Flow</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ) : isPanelDismissed ? (
          <div className="mt-4 p-3.5 rounded-2xl border border-white/10 bg-slate-950/80 flex items-center justify-between gap-3 text-xs text-slate-400 animate-panel-switch">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Hotspot panel closed. Hover or click any pulsing marker above to inspect feature details.</span>
            </div>
            <button
              type="button"
              onClick={() => setIsPanelDismissed(false)}
              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0"
            >
              Reopen Hotspot Details
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};
