import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  IndianRupee,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  RotateCcw,
  ShieldCheck,
  Building2,
  Users,
  CreditCard,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  formatINR,
  formatINRCompact,
  monthlyRevenueTrends,
  revenueByCycleData,
  paymentMethodsBreakdown,
} from '../../data/financeData';

export const RevenueReportsPage = () => {
  const { transactions, subscriptions, addToast } = useApp();

  const [dateRange, setDateRange] = useState('year_to_date'); // 'last_30' | 'last_90' | 'year_to_date' | 'all'

  // Calculations
  const totalRevenue = transactions
    .filter((t) => t.status === 'Success')
    .reduce((acc, t) => acc + (t.amount || 0), 0);

  const monthlyMRR = subscriptions.reduce((acc, s) => {
    if (s.status !== 'Active') return acc;
    if (s.billingCycle === 'Yearly') {
      return acc + Math.round(s.renewalAmount / 12);
    }
    return acc + s.renewalAmount;
  }, 0);

  const yearlyARR = monthlyMRR * 12;

  const pendingDues = transactions
    .filter((t) => t.status === 'Pending')
    .reduce((acc, t) => acc + (t.amount || 0), 0);

  const totalRefunds = transactions
    .filter((t) => t.status === 'Refunded')
    .reduce((acc, t) => acc + (t.amount || 0), 0);

  const totalTxnCount = transactions.length || 1;
  const successTxnCount = transactions.filter((t) => t.status === 'Success').length;
  const paymentSuccessRate = ((successTxnCount / totalTxnCount) * 100).toFixed(1);

  const handleExportCSV = () => {
    const headers = ['Month', 'Total Revenue (INR)', 'Starter Tier', 'Pro Tier', 'Enterprise Tier', 'Successful POs', 'Pending POs', 'Failed POs'];
    const rows = monthlyRevenueTrends.map((m) => [
      `"${m.month}"`,
      `"${m.revenue}"`,
      `"${m.starter}"`,
      `"${m.pro}"`,
      `"${m.enterprise}"`,
      `"${m.successful}"`,
      `"${m.pending}"`,
      `"${m.failed}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StockMate_Revenue_Financial_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Revenue analytics report exported to CSV.', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Revenue & Financial Reports"
        subtitle="Platform monetization velocity, Monthly Recurring Revenue (MRR), ARR run-rate, and tax collections"
        badge={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            Executive Financial Analytics
          </span>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Date Filter */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="last_30">Last 30 Days</option>
              <option value="last_90">Last 90 Days</option>
              <option value="year_to_date">Year to Date (2026)</option>
              <option value="all">All Time (Platform History)</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              icon={Printer}
              onClick={handlePrint}
            >
              Print Report
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>
          </div>
        }
      />

      {/* 6 Core KPI Summary Cards (Explicit Requirements) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <StatCard
          title="Total Revenue (₹)"
          value={formatINR(totalRevenue)}
          subtext="Net cleared receipts"
          icon={IndianRupee}
          accentColor="emerald"
        />

        <StatCard
          title="Monthly Revenue (MRR)"
          value={formatINR(monthlyMRR)}
          subtext="Normalized monthly recurring"
          icon={TrendingUp}
          accentColor="blue"
        />

        <StatCard
          title="Yearly Revenue (ARR)"
          value={formatINR(yearlyARR)}
          subtext="Annualized run rate"
          icon={Calendar}
          accentColor="purple"
        />

        <StatCard
          title="Pending Dues (₹)"
          value={formatINR(pendingDues)}
          subtext="Awaiting settlement"
          icon={Clock}
          accentColor="amber"
        />

        <StatCard
          title="Refunds Issued (₹)"
          value={formatINR(totalRefunds)}
          subtext="Reversed charges"
          icon={RotateCcw}
          accentColor="rose"
        />

        <StatCard
          title="Payment Success Rate"
          value={`${paymentSuccessRate}%`}
          subtext="Banking gateway health"
          icon={CheckCircle2}
          accentColor="emerald"
        />
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Tier-Wise Revenue Stacked Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Monthly Revenue Tier Breakdown (May – Oct 2026)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Stacked gross revenue contributions: Starter (₹3,999), Pro (₹9,999), Enterprise (₹24,999)
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" /> Starter
              </span>
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Pro
              </span>
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-sm bg-purple-500" /> Enterprise
              </span>
            </div>
          </div>

          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyRevenueTrends}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val, name) => [formatINR(val), name.toUpperCase()]}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="starter" stackId="a" fill="#3B82F6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="pro" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="enterprise" stackId="a" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>May Peak: ₹3.84 Lakh</span>
            <span className="font-bold text-slate-900">Current October Peak: ₹5.82 Lakh (All-Time High)</span>
          </div>
        </div>

        {/* Revenue by Billing Frequency Pie */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">
              Billing Frequency Split
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Monthly subscribers vs. Annual prepaid advance
            </p>
          </div>

          <div className="h-52 flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueByCycleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {revenueByCycleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [formatINR(val), 'Revenue']}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
            {revenueByCycleData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-900">{formatINR(item.value)}</span>
                  <span className="text-[10px] text-slate-400 ml-1.5">({item.percentage})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Gateway Distribution & Performance */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Payment Gateway & Method Distribution
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Settlement rail breakdown: UPI AutoPay, NetBanking, and Corporate Cards
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Powered by Razorpay & Stripe India
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {paymentMethodsBreakdown.map((pm, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">{pm.method}</span>
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: pm.color }}
                />
              </div>

              <div className="text-xl font-bold font-mono text-slate-900">
                {formatINR(pm.amount)}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-200/60">
                <span>Platform Share:</span>
                <strong className="text-slate-800">{pm.share}%</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

