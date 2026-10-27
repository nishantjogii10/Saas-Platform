import React, { useState, useMemo } from 'react';
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
  Table,
  Filter,
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

  // Enriched Monthly Revenue Data with MoM growth calculations
  const enrichedMonthlyTrends = useMemo(() => {
    return monthlyRevenueTrends.map((curr, idx, arr) => {
      let momGrowth = '+0.0%';
      if (idx > 0) {
        const prev = arr[idx - 1];
        const growth = ((curr.revenue - prev.revenue) / prev.revenue) * 100;
        momGrowth = `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
      }
      return {
        ...curr,
        momGrowth,
      };
    });
  }, []);

  const totalStarterSum = useMemo(() => {
    return monthlyRevenueTrends.reduce((acc, m) => acc + (m.starter || 0), 0);
  }, []);

  const totalProSum = useMemo(() => {
    return monthlyRevenueTrends.reduce((acc, m) => acc + (m.pro || 0), 0);
  }, []);

  const totalEnterpriseSum = useMemo(() => {
    return monthlyRevenueTrends.reduce((acc, m) => acc + (m.enterprise || 0), 0);
  }, []);

  const totalGrossSum = useMemo(() => {
    return monthlyRevenueTrends.reduce((acc, m) => acc + (m.revenue || 0), 0);
  }, []);

  const totalSuccessfulPOs = useMemo(() => {
    return monthlyRevenueTrends.reduce((acc, m) => acc + (m.successful || 0), 0);
  }, []);

  const totalPendingPOs = useMemo(() => {
    return monthlyRevenueTrends.reduce((acc, m) => acc + (m.pending || 0), 0);
  }, []);

  const totalFailedPOs = useMemo(() => {
    return monthlyRevenueTrends.reduce((acc, m) => acc + (m.failed || 0), 0);
  }, []);

  const handleExportCSV = () => {
    const headers = [
      'Month',
      'Total Revenue (INR)',
      'Starter Tier',
      'Pro Tier',
      'Enterprise Tier',
      'Successful Transactions',
      'Pending Settlements',
      'Failed Transactions',
      'MoM Growth Rate',
    ];
    const rows = enrichedMonthlyTrends.map((m) => [
      `"${m.month}"`,
      m.revenue,
      m.starter,
      m.pro,
      m.enterprise,
      m.successful,
      m.pending,
      m.failed,
      `"${m.momGrowth}"`,
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
              Export Tabular Report (CSV)
            </Button>
          </div>
        }
      />

      {/* 6 Core KPI Summary Cards */}
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

      {/* Table 1: Monthly Tier-Wise Revenue Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Table className="w-4 h-4 text-emerald-800" />
              <h3 className="font-bold text-slate-900 text-sm">
                Monthly SaaS Revenue & Tier Performance Report Table
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Granular breakdown across Starter (₹3,999), Pro (₹9,999), Enterprise (₹24,999), and gateway status
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
            Current Oct Peak: ₹5.82 Lakh
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Billing Month</th>
                <th className="py-3 px-4 text-right">Starter Tier</th>
                <th className="py-3 px-4 text-right">Pro Tier</th>
                <th className="py-3 px-4 text-right">Enterprise Tier</th>
                <th className="py-3 px-4 text-right">Gross Total Revenue</th>
                <th className="py-3 px-4 text-center">Successful Orders</th>
                <th className="py-3 px-4 text-center">Pending / Failed</th>
                <th className="py-3 px-4 text-center">MoM Growth Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enrichedMonthlyTrends.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {row.month}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium text-blue-700">
                    {formatINR(row.starter)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium text-emerald-700">
                    {formatINR(row.pro)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium text-purple-700">
                    {formatINR(row.enterprise)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    {formatINR(row.revenue)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> {row.successful}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-600 font-mono">
                    <span className="text-amber-600 font-semibold">{row.pending} pend</span> /{' '}
                    <span className="text-rose-600 font-semibold">{row.failed} fail</span>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-700">
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] bg-emerald-100 text-emerald-800">
                      <ArrowUpRight className="w-3 h-3" /> {row.momGrowth}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50/90 font-bold border-t border-slate-200 text-xs">
              <tr>
                <td className="py-3 px-4 text-slate-900 font-extrabold uppercase text-[11px]">
                  Total Run Rate Summary ({enrichedMonthlyTrends.length} Months)
                </td>
                <td className="py-3 px-4 text-right text-blue-800 font-extrabold font-mono">
                  {formatINR(totalStarterSum)}
                </td>
                <td className="py-3 px-4 text-right text-emerald-800 font-extrabold font-mono">
                  {formatINR(totalProSum)}
                </td>
                <td className="py-3 px-4 text-right text-purple-800 font-extrabold font-mono">
                  {formatINR(totalEnterpriseSum)}
                </td>
                <td className="py-3 px-4 text-right text-slate-900 font-extrabold font-mono">
                  {formatINR(totalGrossSum)}
                </td>
                <td className="py-3 px-4 text-center font-extrabold text-emerald-800">
                  {totalSuccessfulPOs} Orders
                </td>
                <td className="py-3 px-4 text-center font-semibold text-slate-700 font-mono">
                  {totalPendingPOs} / {totalFailedPOs}
                </td>
                <td className="py-3 px-4 text-center text-emerald-800 font-extrabold">
                  +51.5% H1 Total
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Table 2: Billing Frequency & Subscription Plan Split Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-800" />
              <h3 className="font-bold text-slate-900 text-sm">
                Subscription Frequency & Billing Cycle Breakdown Table
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparison between Monthly flexible plans and Annual upfront prepaid agreements
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
            16% Annual Discount Applied
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Billing Plan Frequency</th>
                <th className="py-3 px-4 text-right">Normalized Monthly Value</th>
                <th className="py-3 px-4 text-right">Projected Annual Run-Rate</th>
                <th className="py-3 px-4 text-center">Revenue Platform Share</th>
                <th className="py-3 px-4">Contract Advantage & Incentive Terms</th>
                <th className="py-3 px-4 text-center">Renewal Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {revenueByCycleData.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-bold text-slate-900">{item.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    {formatINR(item.value)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-slate-800">
                    {formatINR(item.value * 12)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                      {item.percentage}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    {item.name.includes('Annual')
                      ? 'Prepaid 12 months • 2 months free equivalent • Zero churn lock'
                      : 'Month-to-month auto-debit • Flexible branch addition at will'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> {item.name.includes('Annual') ? '99.2% Retention' : '94.8% Retention'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50/90 font-bold border-t border-slate-200 text-xs">
              <tr>
                <td className="py-3 px-4 text-slate-900 font-extrabold uppercase text-[11px]">
                  Combined Platform Monetization
                </td>
                <td className="py-3 px-4 text-right font-extrabold text-slate-900 font-mono">
                  {formatINR(revenueByCycleData.reduce((acc, c) => acc + c.value, 0))}
                </td>
                <td className="py-3 px-4 text-right font-extrabold text-purple-800 font-mono">
                  {formatINR(revenueByCycleData.reduce((acc, c) => acc + c.value * 12, 0))}
                </td>
                <td className="py-3 px-4 text-center font-extrabold text-blue-800">
                  100.0%
                </td>
                <td colSpan={2} className="py-3 px-4 text-slate-500 font-normal text-[11px]">
                  Recurring subscription contracts automatically renew unless explicitly canceled
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Table 3: Payment Rails & Gateway Settlement Performance Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-800" />
              <h3 className="font-bold text-slate-900 text-sm">
                Payment Gateways & Settlement Rails Performance Table
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Settlement rail breakdown: UPI AutoPay, NetBanking, Corporate Cards, and Mandates
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 self-start sm:self-auto">
            Powered by Razorpay & Stripe India
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Payment Rail / Method</th>
                <th className="py-3 px-4">Primary Gateway Partner</th>
                <th className="py-3 px-4 text-right">Cleared Volume (₹)</th>
                <th className="py-3 px-4 text-center">Platform Share</th>
                <th className="py-3 px-4 text-center">Settlement Window / SLA</th>
                <th className="py-3 px-4 text-center">Gateway Success Rate</th>
                <th className="py-3 px-4 text-center">Operational Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paymentMethodsBreakdown.map((pm, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: pm.color }}
                      />
                      <span className="font-bold text-slate-900">{pm.method}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 text-[11px]">
                      {pm.method.includes('UPI')
                        ? 'NPCI / Razorpay AutoPay'
                        : pm.method.includes('Cards')
                        ? 'Stripe India & Visa/MC'
                        : pm.method.includes('NetBanking')
                        ? 'HDFC & ICICI Corporate Rails'
                        : 'e-NACH Mandate Engine'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    {formatINR(pm.amount)}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-800">
                    {pm.share}%
                  </td>
                  <td className="py-3 px-4 text-center text-slate-600 font-mono text-[11px]">
                    {pm.method.includes('UPI') ? 'Instant (T+0)' : 'T+1 Business Day'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {pm.method.includes('UPI') ? '99.8%' : pm.method.includes('Cards') ? '98.5%' : '99.1%'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Healthy (Active)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50/90 font-bold border-t border-slate-200 text-xs">
              <tr>
                <td colSpan={2} className="py-3 px-4 text-slate-900 font-extrabold uppercase text-[11px]">
                  Total Processed Receipts Across Banking Rails
                </td>
                <td className="py-3 px-4 text-right font-extrabold text-slate-900 font-mono">
                  {formatINR(paymentMethodsBreakdown.reduce((acc, pm) => acc + pm.amount, 0))}
                </td>
                <td className="py-3 px-4 text-center font-extrabold text-slate-900">
                  100%
                </td>
                <td colSpan={3} className="py-3 px-4 text-center text-emerald-800 text-[11px] font-bold">
                  Overall Platform Gateway Health: 99.4%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
