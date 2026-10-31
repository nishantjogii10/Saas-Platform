import React, { useState } from 'react';
import {
  Boxes,
  ClockAlert,
  Truck,
  Store,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

const ACCORDION_PANELS = [
  {
    id: 'smart-inventory',
    number: '01',
    category: 'Perpetual Tracking',
    title: 'Smart Inventory & Recipe Costing',
    shortTitle: 'Smart Inventory',
    icon: Boxes,
    image:
      'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&auto=format&fit=crop&q=80',
    description:
      'Continuous perpetual stock deductions driven by live POS tickets and sub-recipe BOMs. Eliminate midnight manual counts, pinpoint station waste, and forecast ingredient runout down to the gram.',
    stats: '99.8% Perpetual Precision',
    capabilities: [
      'Sub-recipe ingredient portion costing down to the gram',
      'QR lot barcode scanning with automated bin tracking',
      'Dynamic buffer alerts with one-tap supplier PO reorders',
    ],
    learnMoreHref: '#features',
    accentColor: 'from-emerald-500/20 to-teal-500/10',
    borderColor: 'border-emerald-500/50',
    tagColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/70',
  },
  {
    id: 'fefo-expiry',
    number: '02',
    category: 'Shelf-Life Triage',
    title: 'FEFO Expiry Management & Kitchen Queue',
    shortTitle: 'FEFO Expiry',
    icon: ClockAlert,
    image:
      'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=1200&auto=format&fit=crop&q=80',
    description:
      'Strict First-Expired, First-Out triage directs kitchen stations to prioritize ingredients nearing expiry first. Cut commercial food waste by up to 84% while maintaining strict food safety compliance.',
    stats: '84% Food Waste Reduction',
    capabilities: [
      'Visual countdown warnings on kitchen station display screens',
      'Automated prep recipe routing for nearing-expiry lots',
      'Tamper-evident audit compliance records for hygiene inspectors',
    ],
    learnMoreHref: '#features',
    accentColor: 'from-amber-500/20 to-rose-500/10',
    borderColor: 'border-amber-500/50',
    tagColor: 'text-amber-400 border-amber-500/30 bg-amber-950/70',
  },
  {
    id: 'supplier-mgmt',
    number: '03',
    category: 'Procurement & Ledger',
    title: 'Wholesale Supplier Portal & Dock GRN',
    shortTitle: 'Supplier Portal',
    icon: Truck,
    image:
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&auto=format&fit=crop&q=80',
    description:
      'Connect wholesale vendors into a transparent digital procurement network. Reconcile purchase orders against dock physical inspections, issue debit claims, and eliminate invoice overbilling.',
    stats: '100% 3-Way Match Verified',
    capabilities: [
      'Digital dock receiving with transit damage credit notes',
      'Automated 3-way invoice and GST purchase reconciliation',
      'Vendor price comparison index and inflation tracking',
    ],
    learnMoreHref: '#features',
    accentColor: 'from-teal-500/20 to-cyan-500/10',
    borderColor: 'border-teal-500/50',
    tagColor: 'text-teal-400 border-teal-500/30 bg-teal-950/70',
  },
  {
    id: 'multi-branch',
    number: '04',
    category: 'Enterprise Scale',
    title: 'Multi-Branch & Central Commissary',
    shortTitle: 'Multi-Branch Sync',
    icon: Store,
    image:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80',
    description:
      'Govern central commissary kitchens and satellite outlets with synchronized stock manifests. Track inter-branch transfers, compare regional consumption, and standardize menu margins.',
    stats: 'Unlimited Branches & Outlets',
    capabilities: [
      'Central bulk commissary prep & automated outlet replenishment',
      'Verified inter-branch stock transfers with dock sign-off',
      'Consolidated multi-unit margin and waste variance benchmarking',
    ],
    learnMoreHref: '#features',
    accentColor: 'from-indigo-500/20 to-purple-500/10',
    borderColor: 'border-indigo-500/50',
    tagColor: 'text-indigo-400 border-indigo-500/30 bg-indigo-950/70',
  },
  {
    id: 'analytics',
    number: '05',
    category: 'Margin Intelligence',
    title: 'Business Analytics & Variance Audits',
    shortTitle: 'Business Analytics',
    icon: BarChart3,
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
    description:
      'Turn pantry numbers into high-margin profitability. Compare theoretical versus actual ingredient usage, identify kitchen portion theft, track margin sensitivity, and forecast seasonal demand.',
    stats: 'Real-Time Food Cost Margins',
    capabilities: [
      'Theoretical vs. actual food cost variance reports',
      'Plate gross margin sensitivity against supplier inflation',
      'Predictive inventory consumption trends based on historical covers',
    ],
    learnMoreHref: '#features',
    accentColor: 'from-cyan-500/20 to-blue-500/10',
    borderColor: 'border-cyan-500/50',
    tagColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/70',
  },
];

export const ExpandingFeatureAccordion = () => {
  const [activePanelId, setActivePanelId] = useState('smart-inventory');

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="reveal-on-scroll text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-black uppercase tracking-wider mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Core Operational Pillars</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Five Pillars of Modern <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300">Kitchen Operations</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-300 mt-4 leading-relaxed">
          Hover or tap to expand each operational module. Engineered specifically for high-volume restaurant groups, fast-casual kitchens, and central commissaries.
        </p>
      </div>

      {/* Desktop Horizontal Accordion Container */}
      <div className="reveal-on-scroll hidden lg:flex gap-3 h-[520px] w-full max-w-7xl mx-auto">
        {ACCORDION_PANELS.map((panel) => {
          const isActive = activePanelId === panel.id;
          const Icon = panel.icon;

          return (
            <div
              key={panel.id}
              onMouseEnter={() => setActivePanelId(panel.id)}
              onClick={() => setActivePanelId(panel.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActivePanelId(panel.id);
                }
              }}
              tabIndex={0}
              role="button"
              aria-expanded={isActive}
              aria-label={`Expand ${panel.title} panel`}
              className={`relative rounded-3xl overflow-hidden cursor-pointer border transition-all duration-500 ease-out flex flex-col justify-between ${
                isActive
                  ? `flex-[3.5] border-white/25 shadow-2xl ring-1 ring-emerald-500/30`
                  : 'flex-1 border-white/10 hover:border-white/20 bg-slate-950/80 hover:bg-slate-900/90'
              }`}
            >
              {/* Background Imagery with High-Contrast Dark Gradient */}
              <div
                className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ${
                  isActive ? 'scale-105 opacity-40' : 'opacity-20 grayscale contrast-125'
                }`}
                style={{ backgroundImage: `url(${panel.image})` }}
              />
              <div
                className={`absolute inset-0 transition-opacity duration-500 ${
                  isActive
                    ? 'bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-950/60'
                    : 'bg-gradient-to-t from-slate-950 via-slate-950/90 to-slate-950/75'
                }`}
              />

              {/* Panel Content Overlay */}
              <div className="relative z-10 p-6 flex flex-col justify-between h-full">
                {/* Top Number & Category Tag */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-emerald-400 bg-slate-950/90 border border-white/10 px-2.5 py-1 rounded-lg">
                      {panel.number}
                    </span>
                    {isActive && (
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${panel.tagColor}`}>
                        {panel.category}
                      </span>
                    )}
                  </div>

                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                    isActive ? 'bg-emerald-500 text-slate-950 font-bold shadow-md' : 'bg-white/5 text-slate-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                {/* Bottom Body Details (Expanded vs Collapsed) */}
                <div>
                  {isActive ? (
                    <div className="space-y-4 animate-panel-switch">
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                          {panel.stats}
                        </span>
                        <h3 className="text-2xl font-black text-white tracking-tight leading-snug">
                          {panel.title}
                        </h3>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                        {panel.description}
                      </p>

                      {/* 3 Capability Bullet Chips */}
                      <div className="space-y-2 pt-1">
                        {panel.capabilities.map((cap, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-slate-200">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{cap}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 flex items-center gap-4">
                        <a
                          href={panel.learnMoreHref}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-md shadow-emerald-950/40 transition-all"
                        >
                          <span>Explore {panel.shortTitle}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ) : (
                    /* Collapsed Vertical Title on Inactive Panels */
                    <div className="flex flex-col items-center justify-center py-6">
                      <span className="font-bold text-slate-300 text-sm tracking-wide [writing-mode:vertical-rl] rotate-180 line-clamp-1 whitespace-nowrap">
                        {panel.shortTitle}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Stacked Accordion (< lg screens) */}
      <div className="reveal-on-scroll flex lg:hidden flex-col gap-3.5 max-w-2xl mx-auto">
        {ACCORDION_PANELS.map((panel) => {
          const isActive = activePanelId === panel.id;
          const Icon = panel.icon;

          return (
            <div
              key={panel.id}
              onClick={() => setActivePanelId(isActive ? '' : panel.id)}
              className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
                isActive
                  ? 'border-emerald-500/50 bg-slate-900/90 shadow-xl'
                  : 'border-white/10 bg-slate-950/80 hover:bg-slate-900/60'
              }`}
            >
              {/* Header Tab Bar */}
              <div className="p-4 flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-black text-emerald-400 bg-slate-950 px-2 py-1 rounded-md border border-white/10">
                    {panel.number}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{panel.title}</h3>
                    <span className="text-[11px] text-slate-400 block">{panel.stats}</span>
                  </div>
                </div>

                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform ${
                  isActive ? 'rotate-90 bg-emerald-500 text-slate-950' : 'bg-white/5 text-slate-400'
                }`}>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Expandable Body */}
              {isActive && (
                <div className="px-4 pb-5 pt-1 space-y-3 border-t border-white/10 animate-panel-switch">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {panel.description}
                  </p>

                  <div className="space-y-1.5 pt-1">
                    {panel.capabilities.map((cap, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <a
                      href={panel.learnMoreHref}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                    >
                      <span>Learn More</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

