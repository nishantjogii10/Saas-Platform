import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  TrendingDown,
  IndianRupee,
  PieChart as PieIcon,
  Download,
  Calendar,
  Layers,
  Sparkles,
  PackageCheck,
  RotateCcw,
  AlertTriangle,
  Receipt,
  CheckCircle2,
  Clock,
  History,
  FileText,
  Printer,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { formatINR } from '../../data/inventoryBillingData';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { restaurantConsumptionTrends, restaurantCategoryValuation } from '../../data/mockData';

export const ReportsPage = () => {
  const {
    currentRestaurant,
    restaurantIngredients,
    restaurantMovements,
    goodsReceivedNotes,
    supplierInvoices,
    supplierReturns,
    productBatches,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState('procurement_audit'); // 'procurement_audit' | 'inventory_analytics'
  const [timeframe, setTimeframe] = useState('month');

  // Dynamic calculations
  const totalValuation = restaurantIngredients.reduce((acc, i) => acc + (i.quantity * i.costPerUnit), 0);

  const totalWastedItems = restaurantMovements.filter(m => m.type === 'wastage');
  const estimatedWastageCost = totalWastedItems.reduce((acc, m) => acc + Math.abs(m.quantity * 5.5), 0);

  // Supplier Audit Metrics
  const totalPurchased = (supplierInvoices || []).reduce((acc, inv) => acc + (inv.totalAmount || 0), 0);
  const totalAcceptedAmount = (supplierInvoices || []).reduce((acc, inv) => acc + (inv.acceptedAmount || inv.totalAmount || 0), 0);
  const totalDamageLosses = (supplierInvoices || []).reduce((acc, inv) => acc + (inv.damageDeduction || 0), 0);
  const totalUnsoldReturns = (supplierReturns || [])
    .filter(r => r.returnType === 'Unsold Fresh Goods Agreement')
    .reduce((acc, r) => acc + (r.totalLossAmount || 0), 0);
  const totalOutstandingDues = (supplierInvoices || []).reduce((acc, inv) => acc + (inv.outstandingBalance || 0), 0);

  const CATEGORY_COLORS = ['#0E5C38', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'];

  const handleExportReport = () => {
    addToast('Comprehensive restaurant cost & inventory report exported (PDF/CSV).', 'success');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${currentRestaurant?.name} Analytics & Audits`}
        subtitle="Procurement verification, dock damage loss audits, fresh bread returns & inventory valuation"
        breadcrumbs={[
          { label: 'Restaurant', href: '#/dashboard' },
          { label: 'Reports & Audits' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
              {['week', 'month', 'quarter'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase transition-all ${
                    timeframe === t
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={handleExportReport}
            >
              Export Report
            </Button>
          </div>
        }
      />

      {/* Main Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('procurement_audit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'procurement_audit'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Receipt className="w-4 h-4" /> Supplier Procurement & Return Audits
        </button>

        <button
          onClick={() => setActiveTab('inventory_analytics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'inventory_analytics'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Kitchen Valuation & Spoilage Trends
        </button>
      </div>

      {activeTab === 'procurement_audit' ? (
        <div className="space-y-6">
          {/* Executive Supplier Procurement KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="Goods Purchased"
              value={formatINR(totalPurchased)}
              subtext="Gross billed PO total"
              icon={Receipt}
              accentColor="slate"
            />
            <StatCard
              title="Accepted into Stock"
              value={formatINR(totalAcceptedAmount)}
              subtext="GRN verified goods"
              icon={CheckCircle2}
              accentColor="emerald"
            />
            <StatCard
              title="Dock Damage Losses"
              value={formatINR(totalDamageLosses)}
              subtext="Rejected at loading bay"
              icon={AlertTriangle}
              accentColor="rose"
            />
            <StatCard
              title="Fresh Unsold Returns"
              value={formatINR(totalUnsoldReturns)}
              subtext="Pav / Dairy 24h SLA returns"
              icon={RotateCcw}
              accentColor="indigo"
            />
            <StatCard
              title="Outstanding Vendor Dues"
              value={formatINR(totalOutstandingDues)}
              subtext="Payable after deductions"
              icon={Clock}
              accentColor="amber"
            />
          </div>

          {/* Section 1: Goods Purchased vs Goods Accepted Breakdown Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Goods Purchased vs. Accepted Audit</h3>
                <p className="text-xs text-slate-500">
                  Verification status, dock damage write-offs, and net authorized amounts
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
                100% Stock Accuracy Policy
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
                    <th className="py-3 px-4">PO & GRN Ref</th>
                    <th className="py-3 px-4">Supplier Partner</th>
                    <th className="py-3 px-4 text-right">Billed Amount</th>
                    <th className="py-3 px-4 text-right">Accepted Stock</th>
                    <th className="py-3 px-4 text-right">Dock Damage Loss</th>
                    <th className="py-3 px-4 text-right">Net Payable</th>
                    <th className="py-3 px-4">Verification Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(supplierInvoices || []).map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{inv.poNumber}</div>
                        <div className="text-[11px] font-mono text-emerald-800">{inv.grnNumber}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{inv.supplierName}</div>
                        <div className="text-[11px] text-slate-400">Inv: {inv.invoiceNumber}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-800">
                        {formatINR(inv.totalAmount)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-700">
                        {formatINR(inv.acceptedAmount || inv.totalAmount)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {inv.damageDeduction > 0 ? (
                          <span className="font-bold text-rose-600">-{formatINR(inv.damageDeduction)}</span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">₹0</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {formatINR(inv.netPayable)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> {inv.verificationStatus || 'Verified by Manager'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Damage Losses & Fresh Bread Returns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Damage Losses by Supplier & Cause */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Dock Damage Loss Audit</h4>
                  <p className="text-xs text-slate-400">Damaged items rejected at dock before stock entry</p>
                </div>
              </div>

              <div className="space-y-3 mt-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900">Farm-Fresh Chicken Breast (2 kg)</span>
                    <div className="text-slate-500 text-[11px]">Metro Food Distributors • PO-1040</div>
                    <div className="text-rose-600 text-[11px] font-medium">Cause: Vacuum packaging breached & cold-chain break</div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-rose-600 text-sm">{formatINR(560)}</span>
                    <div className="text-[10px] text-emerald-700 font-bold">Credit Note Claimed</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900">Fresh Pav / Buns (5 packs)</span>
                    <div className="text-slate-500 text-[11px]">Golden Crust Artisan Bakery • PO-1041</div>
                    <div className="text-rose-600 text-[11px] font-medium">Cause: Crushed during offloading from van</div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-rose-600 text-sm">{formatINR(125)}</span>
                    <div className="text-[10px] text-emerald-700 font-bold">Credit Note Claimed</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900">Roma Vine Tomatoes (2 kg)</span>
                    <div className="text-slate-500 text-[11px]">FreshFarm Organics • PO-1038</div>
                    <div className="text-rose-600 text-[11px] font-medium">Cause: Crushed in bottom crate during transit</div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-rose-600 text-sm">{formatINR(90)}</span>
                    <div className="text-[10px] text-emerald-700 font-bold">Invoice Adjusted</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fresh Bread & Perishables Returned under SLA Agreements */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Unsold Fresh Bread & Dairy SLA Returns</h4>
                  <p className="text-xs text-slate-400">Returns executed under 24h & 36h contractual clauses</p>
                </div>
              </div>

              <div className="space-y-3 mt-3">
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-emerald-950">Golden Crust Artisan Bakery (24h Pav SLA)</span>
                    <span className="font-mono font-bold text-emerald-800 text-[11px]">CRN-2026-002</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    15 unsold daily pav packs returned before 9:00 PM cutoff (within 20% SLA allowance).
                  </p>
                  <div className="flex justify-between items-center pt-1 border-t border-emerald-200/60 text-[11px]">
                    <span className="text-slate-500">Return Date: 2026-10-23</span>
                    <span className="font-bold text-emerald-700">Credit Value: {formatINR(375)}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">Amrit Dairy Farms & Products (36h Paneer SLA)</span>
                    <span className="font-bold text-indigo-700 text-[11px]">Replacement Delivery</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Zero returns this cycle. 100% of delivered artisanal paneer utilized prior to 36h freshness threshold.
                  </p>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200 text-[11px]">
                    <span className="text-slate-500">Next Review: 2026-10-27</span>
                    <span className="font-bold text-slate-700">Utilization: 100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: QR Batch Movement Audit Log with Timestamps and User Attribution */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Batch Movements & Traceability Audit Log</h4>
                  <p className="text-xs text-slate-400">
                    Immutable event log with timestamps, user attribution, and physical action reasons
                  </p>
                </div>
              </div>
              <span className="text-xs text-slate-500">
                Tracking {(productBatches || []).length} Active Product Batches
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Batch ID & Product</th>
                    <th className="py-2.5 px-3">Action Type</th>
                    <th className="py-2.5 px-3 text-right">Quantity</th>
                    <th className="py-2.5 px-3">User Attribution</th>
                    <th className="py-2.5 px-3">Operational Purpose / Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(productBatches || []).flatMap(b => (b.movements || []).map(m => ({ ...m, batchId: b.batchId, productName: b.productName, unit: b.unit }))).map((mov, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{mov.date}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{mov.productName}</div>
                        <div className="font-mono text-[10px] text-slate-400">{mov.batchId}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          mov.type === 'received'
                            ? 'bg-emerald-100 text-emerald-800'
                            : mov.type === 'consumed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {mov.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        {mov.quantity} {mov.unit}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{mov.by}</td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px]">{mov.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Tab 2: Existing Inventory Valuation & Kitchen Trends */
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Stock Valuation"
              value={formatINR(totalValuation)}
              change="+4.8%"
              trend="up"
              subtext="Based on active lot costs"
              icon={IndianRupee}
              accentColor="emerald"
            />

            <StatCard
              title="Monthly Kitchen Wastage"
              value={formatINR(estimatedWastageCost)}
              change={`${currentRestaurant?.metrics?.monthlyWastageRate || 3.2}% of stock`}
              trend="down"
              subtext="Target goal: < 4.0%"
              icon={TrendingDown}
              accentColor="amber"
            />

            <StatCard
              title="Active Ingredient Lots"
              value={restaurantIngredients.length}
              subtext="Stocked and monitored"
              icon={Layers}
              accentColor="blue"
            />

            <StatCard
              title="Inventory Accuracy"
              value="99.4%"
              change="+0.8%"
              trend="up"
              subtext="Quarterly audit variance"
              icon={Sparkles}
              accentColor="purple"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <Card>
                <CardHeader
                  title="Daily Ingredient Consumption Trends"
                  subtitle="Volume of inventory used in prep across days (kg/units)"
                  icon={BarChart3}
                />
                <div className="h-72 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={restaurantConsumptionTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="consumptionGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0E5C38" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#0E5C38" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#E2E8F0',
                          borderRadius: '1rem',
                          fontSize: '12px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="consumed"
                        stroke="#0E5C38"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#consumptionGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-4">
              <Card>
                <CardHeader
                  title="Valuation by Category"
                  subtitle="Capital distribution across food groups"
                  icon={PieIcon}
                />
                <div className="h-64 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={restaurantCategoryValuation}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={4}
                      >
                        {restaurantCategoryValuation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-100 text-xs">
                  {restaurantCategoryValuation.map((item, idx) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                      ></span>
                      <span className="text-slate-600 truncate">{item.name}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
