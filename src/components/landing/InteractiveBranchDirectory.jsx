import React, { useState } from 'react';
import {
  Store,
  MapPin,
  Truck,
  ArrowRight,
  Sparkles,
  Info,
  ChevronRight,
} from 'lucide-react';
import { formatINR } from '../../data/inventoryBillingData';

const BRANCH_DIRECTORY = [
  {
    id: 'pune_central',
    name: 'Pune Central (HQ & Commissary)',
    city: 'Pune, Maharashtra',
    type: 'Primary Central Kitchen & Commissary',
    roleTag: 'Central Commissary',
    address: 'Senapati Bapat Road & F.C. Road Logistics Hub, Pune 411016',
    valuation: 142850,
    activeStaff: 14,
    posStations: 3,
    todayConsumption: 38200,
    monthlyOrders: 12450,
    deliveryRadius: 'Central Commissary • Supplies 4 Outlets Daily',
    dispatchStatus: 'Active Dispatch • Routine FEFO Rotation',
    complianceScore: '99.4%',
    lowStockAlerts: 1,
    image:
      'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=900&auto=format&fit=crop&q=80',
    description:
      'The multi-unit flagship and central bakery commissary. Prepares bulk sub-recipes, controls primary cold-chain storage, and coordinates morning inventory transfers across Pune regional branches.',
  },
  {
    id: 'mumbai_west',
    name: 'Mumbai West Flagship Bistro',
    city: 'Mumbai, Maharashtra',
    type: 'High-Volume Flagship Bistro & Bar',
    roleTag: 'Dine-In Flagship',
    address: 'Linking Road & Bandra West Hospitality Precinct, Mumbai 400050',
    valuation: 218400,
    activeStaff: 22,
    posStations: 5,
    todayConsumption: 64800,
    monthlyOrders: 24800,
    deliveryRadius: 'Full Service Dine-In, Cocktail Bar & Private Dining',
    dispatchStatus: 'Peak Evening Service • Buffers Safe',
    complianceScore: '98.9%',
    lowStockAlerts: 2,
    image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&auto=format&fit=crop&q=80',
    description:
      'High-velocity dining location with 5 synchronized POS stations. Manages premium seafood lots, high-turnover bar spirits, and rapid table turnover with real-time captain ordering.',
  },
  {
    id: 'bangalore_south',
    name: 'Bangalore South Cloud Kitchen',
    city: 'Bengaluru, Karnataka',
    type: 'Tech Park Cloud Kitchen & Express',
    roleTag: 'Cloud Kitchen Hub',
    address: 'Koramangala 4th Block Delivery Hub, Bengaluru 560034',
    valuation: 98500,
    activeStaff: 9,
    posStations: 2,
    todayConsumption: 29400,
    monthlyOrders: 16200,
    deliveryRadius: 'Quick Commerce • 8 km Swiggy & Zomato Delivery Radius',
    dispatchStatus: 'Fast-Casual Velocity • 100% On-Time GRN',
    complianceScore: '99.1%',
    lowStockAlerts: 0,
    image:
      'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=900&auto=format&fit=crop&q=80',
    description:
      'Delivery-first compact facility optimized for high packaging turnover, standardized 8-minute ticket times, and automated direct order aggregator ingestion.',
  },
  {
    id: 'hyderabad_central',
    name: 'Hyderabad Central Multi-Floor',
    city: 'Hyderabad, Telangana',
    type: 'Multi-Floor Dining & Banquet Facility',
    roleTag: 'Luxury Dining & Banquets',
    address: 'Jubilee Hills Road No. 36 Dining Complex, Hyderabad 500033',
    valuation: 305200,
    activeStaff: 28,
    posStations: 6,
    todayConsumption: 82100,
    monthlyOrders: 29400,
    deliveryRadius: 'A La Carte Dining, Rooftop Lounge & 300-Cover Banquet',
    dispatchStatus: 'Large Event Prep • High Safety Stock Active',
    complianceScore: '99.6%',
    lowStockAlerts: 3,
    image:
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop&q=80',
    description:
      'Massive 3-floor luxury hospitality property with multiple kitchen sub-stations (Tandoor, Halwai, Continental, and Rooftop Bar). Enforces strict inter-departmental requisition slips.',
  },
  {
    id: 'delhi_ncr',
    name: 'Delhi NCR Regional Hub & Cafe',
    city: 'New Delhi / Gurugram',
    type: 'Regional Distribution Hub & Cafe',
    roleTag: 'Regional Hub',
    address: 'Cyber City Phase 2 Corporate Arcade, Gurugram 122002',
    valuation: 176300,
    activeStaff: 16,
    posStations: 4,
    todayConsumption: 47600,
    monthlyOrders: 18700,
    deliveryRadius: 'Supplying 3 Corporate Satellite Express Kiosks',
    dispatchStatus: 'Morning Commissary Delivery Cleared',
    complianceScore: '98.7%',
    lowStockAlerts: 1,
    image:
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=900&auto=format&fit=crop&q=80',
    description:
      'Regional procurement terminal and flagship cafe. Coordinates northern zone dairy and bakery replenishment while catering to fast corporate breakfast and lunch peak periods.',
  },
];

export const InteractiveBranchDirectory = () => {
  const [selectedBranchId, setSelectedBranchId] = useState('pune_central');

  const selectedBranch =
    BRANCH_DIRECTORY.find((b) => b.id === selectedBranchId) || BRANCH_DIRECTORY[0];

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="reveal-on-scroll text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-black uppercase tracking-wider mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Multi-Unit Architecture</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Consolidated <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300">Multi-Branch Network Directory</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-300 mt-4 leading-relaxed">
          Govern central commissaries, satellite cloud kitchens, and flagship dining rooms across cities. Select any branch to inspect live pantry valuation, active crew, POS stations, and daily food consumption.
        </p>

        {/* Illustrative Demonstration Disclaimer */}
        <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-white/10 text-[11px] text-slate-400">
          <Info className="w-3 h-3 text-emerald-400 shrink-0" />
          <span>Demonstration Multi-Branch Footprint • Illustrative Operational Preview</span>
        </div>
      </div>

      {/* 2-Column Responsive Layout: Branch Directory Roster (Left) & Command Terminal (Right) */}
      <div className="reveal-on-scroll grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto items-stretch">
        {/* Left Column: Branch Selection Roster (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-2.5">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 px-1 mb-1 flex items-center justify-between">
            <span>Connected Branch Network</span>
            <span className="text-emerald-400 font-mono font-bold">5 Active Hubs</span>
          </span>

          {BRANCH_DIRECTORY.map((branch) => {
            const isSelected = selectedBranch.id === branch.id;

            return (
              <div
                key={branch.id}
                onMouseEnter={() => setSelectedBranchId(branch.id)}
                onClick={() => setSelectedBranchId(branch.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedBranchId(branch.id);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-selected={isSelected}
                aria-label={`Select ${branch.name}`}
                className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 text-left ${
                  isSelected
                    ? 'bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border-emerald-500/60 shadow-xl ring-1 ring-emerald-500/30'
                    : 'bg-slate-900/70 hover:bg-slate-800/80 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Status Indicator Beacon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 border-emerald-300 font-bold shadow-md'
                      : 'bg-slate-950 text-slate-400 border-white/10'
                  }`}>
                    <Store className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-sm truncate">{branch.name}</h3>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">{branch.city}</span>
                      </span>
                      <span>&bull;</span>
                      <span className="text-slate-300 font-mono font-medium">{formatINR(branch.valuation)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md hidden sm:inline-block border ${
                    isSelected
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                      : 'bg-slate-950 text-slate-400 border-white/5'
                  }`}>
                    {branch.roleTag}
                  </span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${
                    isSelected ? 'text-emerald-400 translate-x-0.5' : 'text-slate-500'
                  }`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Dynamic Branch Command Terminal (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-white/15 bg-gradient-to-b from-slate-900/95 via-slate-950 to-slate-950 p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl flex flex-col justify-between">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          {/* Top Branch Hero Showcase with Image & Header */}
          <div className="relative z-10 space-y-4">
            {/* Header Identity Row */}
            <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-800">
                    {selectedBranch.roleTag}
                  </span>
                  <span className="text-[10px] font-bold text-slate-300 bg-white/5 px-2 py-0.5 rounded-full border border-white/10 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    <span>{selectedBranch.city}</span>
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1.5 tracking-tight">
                  {selectedBranch.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedBranch.address}</p>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Operational Status</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{selectedBranch.dispatchStatus}</span>
                </span>
              </div>
            </div>

            {/* Branch Photo with Overlay */}
            <div className="relative h-44 sm:h-52 rounded-2xl overflow-hidden border border-white/10">
              <img
                src={selectedBranch.image}
                alt={selectedBranch.name}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs">
                <span className="text-white font-medium drop-shadow-md">
                  {selectedBranch.type}
                </span>
                <span className="font-mono text-emerald-300 font-bold bg-slate-950/80 px-2.5 py-1 rounded-md border border-white/10">
                  FEFO Score: {selectedBranch.complianceScore}
                </span>
              </div>
            </div>

            {/* Branch Narrative Description */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {selectedBranch.description}
            </p>

            {/* 4 Frosted Operational KPI Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Pantry Valuation</span>
                <span className="font-mono font-black text-white text-base block mt-0.5">
                  {formatINR(selectedBranch.valuation)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Kitchen Staff</span>
                <span className="font-mono font-black text-emerald-400 text-base block mt-0.5">
                  {selectedBranch.activeStaff} Crew
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">POS Terminals</span>
                <span className="font-mono font-black text-teal-300 text-base block mt-0.5">
                  {selectedBranch.posStations} Stations
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Today's Consumption</span>
                <span className="font-mono font-black text-white text-base block mt-0.5">
                  {formatINR(selectedBranch.todayConsumption)}
                </span>
              </div>
            </div>

            {/* Logistics & Dispatch Summary Bar */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong className="text-white">Route Governance:</strong> {selectedBranch.deliveryRadius}
                </span>
              </div>
              <span className="text-emerald-400 font-bold shrink-0">
                Monthly Vol: {selectedBranch.monthlyOrders.toLocaleString('en-IN')} Orders
              </span>
            </div>
          </div>

          {/* Terminal Footer CTA */}
          <div className="relative z-10 pt-4 mt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="text-slate-400">
              Need multi-unit commissary sync for your restaurant brand?
            </span>
            <a
              href="#pricing"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-md shadow-emerald-950/40 transition-all shrink-0"
            >
              <span>Explore Multi-Branch Plans</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
