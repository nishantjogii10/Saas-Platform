import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  Users,
  CreditCard,
  IndianRupee,
  TrendingUp,
  Activity,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Clock,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Card, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  ResponsiveContainer,
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
import { platformMonthlyRegistrations, planDistributionData } from '../../data/mockData';
import { formatINR } from '../../data/inventoryBillingData';

export const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { restaurants, users, plans, platformLogs, approveRestaurant } = useApp();

  const totalRestaurants = restaurants.length;
  const activeRestaurants = restaurants.filter(r => r.status === 'active').length;
  const pendingRestaurants = restaurants.filter(r => r.status === 'pending').length;
  const suspendedRestaurants = restaurants.filter(r => r.status === 'suspended').length;
  const totalUsers = users.length;

  // Calculate simulated monthly recurring revenue (MRR)
  const calculatedMRR = restaurants.reduce((acc, r) => {
    if (r.status !== 'active') return acc;
    const plan = plans.find(p => p.id === r.planId);
    return acc + (plan ? plan.monthlyPrice : 49);
  }, 0) + 41850; // Base sample platform baseline

  const COLORS = ['#3B82F6', '#10B981', '#8B5CF6'];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Super Admin Platform Dashboard"
        subtitle="Global tenant oversight, platform revenue metrics, and account approvals"
        badge={<Badge status="super_admin" label="Platform Owner Scope" />}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={ShieldCheck}
              onClick={() => navigate('/admin/role-matrix')}
            >
              Role Matrix
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={Activity}
              onClick={() => navigate('/admin/logs')}
            >
              System Logs
            </Button>
            <Button
              variant="brand"
              size="sm"
              icon={Building2}
              onClick={() => navigate('/admin/restaurants')}
            >
              Manage Restaurants
            </Button>
          </div>
        }
      />

      {/* Pending Approvals Alert Banner (Workflow A Highlight) */}
      {pendingRestaurants > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-950">
                {pendingRestaurants} Restaurant Application{pendingRestaurants > 1 ? 's' : ''} Awaiting Approval
              </h4>
              <p className="text-xs text-amber-800">
                New tenant workspaces submitted via Sign Up (Workflow A) require owner verification.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/admin/restaurants?filter=pending')}
          >
            Review Pending Accounts
          </Button>
        </div>
      )}

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Total Restaurants"
          value={totalRestaurants}
          change="+14.2%"
          trend="up"
          subtext={`${activeRestaurants} Active • ${pendingRestaurants} Pending`}
          icon={Building2}
          accentColor="emerald"
          onClick={() => navigate('/admin/restaurants')}
        />

        <StatCard
          title="Platform Users"
          value={totalUsers}
          change="+8.6%"
          trend="up"
          subtext="Across all tenants & suppliers"
          icon={Users}
          accentColor="blue"
          onClick={() => navigate('/admin/users')}
        />

        <StatCard
          title="Active Subscriptions"
          value={activeRestaurants}
          change="98.2% retention"
          trend="up"
          subtext="Starter, Pro & Enterprise"
          icon={CreditCard}
          accentColor="purple"
          onClick={() => navigate('/admin/plans')}
        />

        <StatCard
          title="Platform MRR (Sample)"
          value={formatINR(calculatedMRR)}
          change="+21.4% YoY"
          trend="up"
          subtext="Monthly Recurring Revenue"
          icon={IndianRupee}
          accentColor="emerald"
          onClick={() => navigate('/admin/analytics')}
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Monthly Growth & Revenue Chart */}
        <div className="lg:col-span-8">
          <Card>
            <CardHeader
              title="Platform Growth & Revenue Trends"
              subtitle="Monthly restaurant onboarding and gross subscription volume (Sample Data)"
              icon={TrendingUp}
              action={
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800">
                  Last 12 Months
                </span>
              }
            />
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={platformMonthlyRegistrations} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D5C3A" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#0D5C3A" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                    formatter={(val, name) => [name === 'revenue' ? formatINR(val) : val, name === 'revenue' ? 'Revenue' : 'Registrations']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#0D5C3A"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#revenueGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Right: Plan Distribution Donut Chart */}
        <div className="lg:col-span-4">
          <Card>
            <CardHeader
              title="Plan Distribution"
              subtitle="Active subscriber breakdown"
              icon={CreditCard}
            />
            <div className="h-60 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {planDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Enterprise Share: <strong>14%</strong></span>
              <button
                onClick={() => navigate('/admin/plans')}
                className="text-emerald-700 font-semibold hover:underline"
              >
                Configure Plans →
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Platform Activities Table */}
      <Card padding={false}>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 text-base">Recent Platform Activity</h3>
            <p className="text-xs text-slate-500 mt-0.5">Live events from account registrations, approvals, and plan modifications</p>
          </div>
          <Button
            variant="ghost"
            size="xs"
            iconRight={ArrowRight}
            onClick={() => navigate('/admin/logs')}
          >
            Full Activity Log
          </Button>
        </div>

        <div className="divide-y divide-slate-100">
          {platformLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">{log.action}</span>
                    <Badge status={log.status} size="xs" />
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Target: <span className="font-medium text-slate-800">{log.target}</span> • Actor: {log.actor}
                  </p>
                </div>
              </div>
              <span className="text-xs text-slate-400 whitespace-nowrap hidden sm:block">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

