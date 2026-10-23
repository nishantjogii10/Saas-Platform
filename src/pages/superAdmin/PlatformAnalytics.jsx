import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  IndianRupee,
  Building2,
  Users,
  Calendar,
  Filter,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Analytics & Revenue Trends"
        subtitle="Aggregated multi-tenant performance metrics, registration velocity, and subscriber retention (Sample Data)"
        breadcrumbs={[
          { label: 'Admin', href: '#/admin/dashboard' },
          { label: 'Analytics' },
        ]}
        actions={
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
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

      {/* Charts Row 1: Revenue Curve and Monthly Registrations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <Card>
            <CardHeader
              title="Platform Gross Subscription Revenue Trend"
              subtitle="Monthly recurring revenue from restaurant SaaS tier subscriptions (Sample Data)"
              icon={TrendingUp}
            />
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={platformMonthlyRegistrations} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D5C3A" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#0D5C3A" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                    formatter={(val) => [`$${val.toLocaleString()}`, 'Monthly Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#0D5C3A"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#mrrGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-5">
          <Card>
            <CardHeader
              title="New Restaurant Onboarding Velocity"
              subtitle="Registered restaurants per month"
              icon={Building2}
            />
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformMonthlyRegistrations} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#10B981" radius={[6, 6, 0, 0]} name="New Restaurants" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* Charts Row 2: Plan Breakdown and Retention */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <Card>
            <CardHeader
              title="Active Tier Market Share"
              subtitle="Proportion of accounts on Starter, Pro, vs Enterprise"
              icon={BarChart3}
            />
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planDistributionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={45}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {planDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-6">
          <Card>
            <CardHeader
              title="Platform Infrastructure & API Health"
              subtitle="Real-time multi-tenant request volume and system metrics"
              icon={TrendingUp}
            />
            <div className="space-y-4 pt-1">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Server API Response Time</span>
                  <span className="text-emerald-700">42 ms (Healthy)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Cloud Database Storage Allocated</span>
                  <span>142 GB / 500 GB (28.4%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '28.4%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Daily Webhook Deliveries (Suppliers & ERP)</span>
                  <span className="text-emerald-700">99.94% Success</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '99.9%' }}></div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 leading-relaxed mt-4">
                <strong>Note:</strong> All analytics and financial metrics shown in this prototype are generated from realistic mock datasets to simulate enterprise SaaS observability without external API dependencies.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

