import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  IndianRupee,
  Building2,
  Users,
  Calendar,
  Filter,
  Table,
  Download,
  CheckCircle2,
  ArrowUpRight,
  ShieldCheck,
  Server,
  Layers,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { platformMonthlyRegistrations, planDistributionData } from '../../data/mockData';

export const PlatformAnalytics = () => {
  const [dateRange, setDateRange] = useState('12m');

  const COLORS = ['#3B82F6', '#10B981', '#8B5CF6'];

  // Filter registrations based on selected date range
  const filteredRegistrations = useMemo(() => {
    if (dateRange === '3m') return platformMonthlyRegistrations.slice(-3);
    if (dateRange === '6m') return platformMonthlyRegistrations.slice(-6);
    return platformMonthlyRegistrations;
  }, [dateRange]);

  // Compute cumulative count and MoM growth for each month
  const enrichedRegistrations = useMemo(() => {
    let cumulative = 0;
    return filteredRegistrations.map((item, idx, arr) => {
      cumulative += item.count;
      let momGrowth = '+0.0%';
      if (idx > 0) {
        const prev = arr[idx - 1];
        const growth = ((item.revenue - prev.revenue) / prev.revenue) * 100;
        momGrowth = `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
      }
      return {
        ...item,
        cumulative,
        momGrowth,
        uptime: '99.98%',
      };
    });
  }, [filteredRegistrations]);

  const totalNewRestaurants = useMemo(() => {
    return filteredRegistrations.reduce((acc, r) => acc + (r.count || 0), 0);
  }, [filteredRegistrations]);

  const totalGrossRevenue = useMemo(() => {
    return filteredRegistrations.reduce((acc, r) => acc + (r.revenue || 0), 0);
  }, [filteredRegistrations]);

  // Plan distribution enriched with pricing and revenue contributions
  const enrichedPlanDistribution = useMemo(() => {
    const totalSubscribers = planDistributionData.reduce((acc, p) => acc + (p.value || 0), 0);
    return planDistributionData.map((plan) => {
      const share = totalSubscribers > 0 ? ((plan.value / totalSubscribers) * 100).toFixed(1) : '0';
      let price = '₹3,999 / mo';
      let monthlyTotal = plan.value * 3999;
      let entitlements = 'Single Branch • 10 Staff • Core Inventory';

      if (plan.name.toLowerCase().includes('pro')) {
        price = '₹9,999 / mo';
        monthlyTotal = plan.value * 9999;
        entitlements = 'Up to 5 Branches • QR Batch Tracking • Supplier Portal';
      } else if (plan.name.toLowerCase().includes('enterprise')) {
        price = '₹24,999 / mo';
        monthlyTotal = plan.value * 24999;
        entitlements = 'Unlimited Branches • Dedicated Server • Custom ERP Webhooks';
      }

      return {
        ...plan,
        share,
        price,
        monthlyTotal,
        entitlements,
      };
    });
  }, []);

  const totalPlatformSubscribers = useMemo(() => {
    return planDistributionData.reduce((acc, p) => acc + (p.value || 0), 0);
  }, []);

  const totalPlatformMonthlyRunRate = useMemo(() => {
    return enrichedPlanDistribution.reduce((acc, p) => acc + p.monthlyTotal, 0);
  }, [enrichedPlanDistribution]);

  // CSV Export for Platform Analytics
  const handleExportCSV = () => {
    const rows = [];
    rows.push(['STOCKMATE SAAS - PLATFORM ANALYTICS & REGISTRATION VELOCITY REPORT']);
    rows.push(['Date Range:', dateRange.toUpperCase()]);
    rows.push(['Generated Date:', new Date().toLocaleDateString()]);
    rows.push([]);

    rows.push(['--- MONTHLY REGISTRATION & REVENUE VELOCITY ---']);
    rows.push(['Month', 'New Restaurants Registered', 'Cumulative Active', 'Monthly Revenue', 'MoM Growth', 'Uptime SLA']);
    enrichedRegistrations.forEach((r) => {
      rows.push([`"${r.month}"`, r.count, r.cumulative, r.revenue, `"${r.momGrowth}"`, `"${r.uptime}"`]);
    });
    rows.push([]);

    rows.push(['--- ACTIVE SUBSCRIPTION TIER BREAKDOWN ---']);
    rows.push(['Tier Name', 'Active Subscribers', 'Base Monthly Price', 'Monthly Contribution', 'Share (%)']);
    enrichedPlanDistribution.forEach((p) => {
      rows.push([`"${p.name}"`, p.value, `"${p.price}"`, p.monthlyTotal, `${p.share}%`]);
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      rows.map((e) => (Array.isArray(e) ? e.join(',') : e)).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StockMate_Platform_Analytics_${dateRange}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Analytics & Revenue Trends"
        subtitle="Aggregated multi-tenant performance metrics, registration velocity, and subscriber retention in easy-to-read tables"
        breadcrumbs={[
          { label: 'Admin', href: '#/admin/dashboard' },
          { label: 'Analytics' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
              {['3m', '6m', '12m', 'all'].map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase transition-all ${
                    dateRange === range
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

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

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Annual Run Rate (ARR)"
          value="₹3,48,50,000"
          change="+28.4% YoY"
          trend="up"
          subtext="Projected based on active tiers"
          icon={IndianRupee}
          accentColor="emerald"
        />

        <StatCard
          title="Avg Lifetime Value (LTV)"
          value="₹3,12,000"
          change="~24 months"
          trend="up"
          subtext="Per restaurant client"
          icon={TrendingUp}
          accentColor="blue"
        />

        <StatCard
          title="Customer Acq Cost (CAC)"
          value="₹25,400"
          change="-12% vs Q2"
          trend="down"
          subtext="Payback period: 2.4 months"
          icon={Building2}
          accentColor="purple"
        />

        <StatCard
          title="Platform Uptime"
          value="99.98%"
          change="SLA Met"
          trend="up"
          subtext="Multi-region cloud redundancy"
          icon={BarChart3}
          accentColor="emerald"
        />
      </div>

      {/* Table 1: Platform Monthly Growth & Registration Velocity Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Table className="w-4 h-4 text-emerald-800" />
              <h3 className="font-bold text-slate-900 text-sm">
                Monthly Registration & Subscription Revenue Velocity Table
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Multi-tenant customer acquisition velocity, cumulative active accounts, and monthly gross SaaS receipts
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
            Showing: {dateRange.toUpperCase()} Interval
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Reporting Month</th>
                <th className="py-3 px-4 text-center">New Restaurants Registered</th>
                <th className="py-3 px-4 text-center">Cumulative Active Tenants</th>
                <th className="py-3 px-4 text-right">Gross Monthly Revenue</th>
                <th className="py-3 px-4 text-center">MoM Growth Velocity</th>
                <th className="py-3 px-4 text-center">Platform Uptime SLA</th>
                <th className="py-3 px-4 text-center">System Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enrichedRegistrations.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {row.month}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-800">
                    +{row.count} restaurants
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-semibold text-blue-700">
                    {row.cumulative} active
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    ${row.revenue.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      <ArrowUpRight className="w-3 h-3" /> {row.momGrowth}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-slate-600">
                    {row.uptime}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> 100% Operational
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50/90 font-bold border-t border-slate-200 text-xs">
              <tr>
                <td className="py-3 px-4 text-slate-900 font-extrabold uppercase text-[11px]">
                  Period Total ({enrichedRegistrations.length} Months)
                </td>
                <td className="py-3 px-4 text-center font-extrabold text-emerald-800">
                  +{totalNewRestaurants} Restaurants
                </td>
                <td className="py-3 px-4 text-center font-extrabold text-blue-800 font-mono">
                  {enrichedRegistrations[enrichedRegistrations.length - 1]?.cumulative || 0} Total Active
                </td>
                <td className="py-3 px-4 text-right font-extrabold text-slate-900 font-mono">
                  ${totalGrossRevenue.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-center font-bold text-emerald-800">
                  Accelerating
                </td>
                <td colSpan={2} className="py-3 px-4 text-center text-emerald-800 text-[11px]">
                  High Availability Verified
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Table 2: Active Tier Market Share & Subscriber Distribution Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-800" />
              <h3 className="font-bold text-slate-900 text-sm">
                Subscription Tier Market Share & Monetization Table
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Account distribution, recurring MRR contributions, and feature entitlements by plan tier
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
            {totalPlatformSubscribers} Active Paid Tenants
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Subscription Tier</th>
                <th className="py-3 px-4 text-center">Active Accounts</th>
                <th className="py-3 px-4 text-right">Base Monthly Fee</th>
                <th className="py-3 px-4 text-right">Monthly Revenue Contribution</th>
                <th className="py-3 px-4 text-center">Subscriber Market Share</th>
                <th className="py-3 px-4">Core Feature Entitlements</th>
                <th className="py-3 px-4 text-center">Tier Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enrichedPlanDistribution.map((plan, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: plan.color || COLORS[idx % COLORS.length] }}
                      />
                      <span className="font-bold text-slate-900">{plan.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-900">
                    {plan.value} accounts
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-700">
                    {plan.price}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-800">
                    ₹{plan.monthlyTotal.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                      {plan.share}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 text-[11px]">
                    {plan.entitlements}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Growing
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50/90 font-bold border-t border-slate-200 text-xs">
              <tr>
                <td className="py-3 px-4 text-slate-900 font-extrabold uppercase text-[11px]">
                  Total Active Platform Subscribers
                </td>
                <td className="py-3 px-4 text-center font-extrabold text-slate-900">
                  {totalPlatformSubscribers} Accounts
                </td>
                <td className="py-3 px-4 text-right text-slate-500 font-normal text-[11px]">
                  Blended ARPU: ₹{(totalPlatformMonthlyRunRate / (totalPlatformSubscribers || 1)).toFixed(0)}
                </td>
                <td className="py-3 px-4 text-right font-extrabold text-emerald-800 font-mono">
                  ₹{totalPlatformMonthlyRunRate.toLocaleString()} / mo
                </td>
                <td className="py-3 px-4 text-center font-extrabold text-blue-800">
                  100.0%
                </td>
                <td colSpan={2} className="py-3 px-4 text-slate-500 font-normal text-[11px]">
                  98.6% Monthly Gross Revenue Retention
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
