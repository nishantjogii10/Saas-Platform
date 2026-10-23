import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CreditCard,
  Building2,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calendar,
  Search,
  Filter,
  Download,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Send,
  Printer,
  ChevronDown,
  ChevronUp,
  Receipt,
  Eye,
  RefreshCw,
  Plus,
  AlertCircle,
  TrendingUp,
  IndianRupee,
  Layers,
  X,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { PaymentConfirmationModal } from '../../components/common/PaymentConfirmationModal';
import { InvoiceModal } from '../../components/common/InvoiceModal';
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
} from '../../data/financeData';

export const PaymentsDashboard = () => {
  const {
    restaurants,
    users,
    transactions,
    subscriptions,
    invoices,
    verifyPayment,
    retryPayment,
    sendPaymentReminder,
    recordNewPayment,
    addToast,
  } = useApp();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [restaurantFilter, setRestaurantFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cycleFilter, setCycleFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');

  // Sorting & Pagination
  const [sortField, setSortField] = useState('paymentDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Selected Transaction for Right-Side Slide-Over Panel
  const [selectedTxn, setSelectedTxn] = useState(null);

  // Confirmation & Invoice Modals
  const [verifiedTxnForModal, setVerifiedTxnForModal] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [invoiceModalData, setInvoiceModalData] = useState({
    isOpen: false,
    invoice: null,
  });

  // Manual payment entry simulation modal
  const [isSimulatePaymentModalOpen, setIsSimulatePaymentModalOpen] = useState(false);
  const [simulateForm, setSimulateForm] = useState({
    restaurantId: restaurants[0]?.id || 'rest-1',
    planId: 'plan-pro',
    billingCycle: 'Monthly',
    paymentMethod: 'UPI - Google Pay',
  });

  // --------------------------------------------------------------------------
  // Summary Metric Calculations (9 Explicit Requirements)
  // --------------------------------------------------------------------------
  const totalRegisteredRestaurants = restaurants.length;
  const activeRestaurants = restaurants.filter((r) => r.status === 'active').length;
  const pendingRegistrations = restaurants.filter((r) => r.status === 'pending').length;
  const totalRegisteredUsers = users.length;

  const totalPaymentsReceived = transactions
    .filter((t) => t.status === 'Success')
    .reduce((acc, t) => acc + (t.amount || 0), 0);

  const pendingPayments = transactions
    .filter((t) => t.status === 'Pending')
    .reduce((acc, t) => acc + (t.amount || 0), 0);

  const failedPayments = transactions
    .filter((t) => t.status === 'Failed' || t.status === 'Overdue')
    .reduce((acc, t) => acc + (t.amount || 0), 0);

  const activeSubscriptions = subscriptions.filter((s) => s.status === 'Active').length;

  const subscriptionsExpiringSoon = subscriptions.filter(
    (s) => s.status === 'Expiring Soon'
  ).length;

  // --------------------------------------------------------------------------
  // Filtered & Sorted Transactions
  // --------------------------------------------------------------------------
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        t.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.restaurantOwner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.gatewayRef && t.gatewayRef.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesRest =
        restaurantFilter === 'all' || t.restaurantId === restaurantFilter;

      const matchesPlan = planFilter === 'all' || t.planId === planFilter;

      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;

      const matchesCycle = cycleFilter === 'all' || t.billingCycle === cycleFilter;

      return matchesSearch && matchesRest && matchesPlan && matchesStatus && matchesCycle;
    });
  }, [
    transactions,
    searchTerm,
    restaurantFilter,
    planFilter,
    statusFilter,
    cycleFilter,
  ]);

  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'amount') {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      } else {
        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredTransactions, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedTransactions.length / pageSize) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedTransactions.slice(start, start + pageSize);
  }, [sortedTransactions, currentPage, pageSize]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // --------------------------------------------------------------------------
  // Verification, Retry, and Reminder Actions
  // --------------------------------------------------------------------------
  const handleVerify = (txn, e) => {
    if (e) e.stopPropagation();
    const result = verifyPayment(txn.id);
    if (result.success) {
      setVerifiedTxnForModal(result.transaction);
      setIsConfirmModalOpen(true);
      if (selectedTxn?.id === txn.id) {
        setSelectedTxn(result.transaction);
      }
    }
  };

  const handleRetry = (txn, e) => {
    if (e) e.stopPropagation();
    retryPayment(txn.id);
  };

  const handleSendReminder = (txn, e) => {
    if (e) e.stopPropagation();
    sendPaymentReminder(txn.id);
  };

  const handleViewInvoiceForTxn = (txn, e) => {
    if (e) e.stopPropagation();
    const matchedInv =
      invoices.find(
        (inv) =>
          inv.transactionId === txn.id ||
          inv.id === txn.invoiceId ||
          inv.invoiceNumber === txn.invoiceId
      ) || {
        invoiceNumber: txn.invoiceId || `STM-INV-${txn.id}`,
        restaurantName: txn.restaurantName,
        ownerName: txn.restaurantOwner,
        ownerEmail: txn.ownerEmail,
        ownerPhone: txn.ownerPhone,
        address: txn.address,
        gstin: txn.gstin,
        transactionId: txn.id,
        planName: `${txn.planName} Plan (${txn.billingCycle})`,
        amount: txn.amount,
        baseAmount: txn.baseAmount,
        tax: txn.taxAmount,
        issueDate: txn.paymentDate?.split(' ')[0] || '2026-10-14',
        dueDate: txn.renewalDate,
        status: txn.status === 'Success' ? 'Paid' : txn.status,
        paymentMethod: txn.paymentMethod,
      };

    setInvoiceModalData({
      isOpen: true,
      invoice: matchedInv,
    });
  };

  const handleExportCSV = () => {
    const headers = [
      'Transaction ID',
      'Restaurant Name',
      'Owner',
      'Registration Date',
      'Plan',
      'Billing Cycle',
      'Amount (INR)',
      'Status',
      'Payment Date',
      'Next Renewal',
      'Gateway Ref',
      'Method',
    ];
    const rows = filteredTransactions.map((t) => [
      `"${t.id}"`,
      `"${t.restaurantName}"`,
      `"${t.restaurantOwner}"`,
      `"${t.registrationDate}"`,
      `"${t.planName}"`,
      `"${t.billingCycle}"`,
      `"${t.amount}"`,
      `"${t.status}"`,
      `"${t.paymentDate}"`,
      `"${t.renewalDate}"`,
      `"${t.gatewayRef || ''}"`,
      `"${t.paymentMethod}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StockMate_Transactions_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Payment transactions exported to CSV.', 'success');
  };

  // Helper for status badge styling
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Success':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Success
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pending
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Failed
          </span>
        );
      case 'Overdue':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
            Overdue
          </span>
        );
      case 'Refunded':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Refunded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Payment & Billing Dashboard"
        subtitle="Global platform financial overview, multi-tenant billing ledgers, and automated payment gateway reconciliations"
        badge={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            Platform Finance • INR (₹)
          </span>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>
            <Button
              variant="brand"
              size="sm"
              icon={Plus}
              onClick={() => setIsSimulatePaymentModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
            >
              Simulate Gateway Payment
            </Button>
          </div>
        }
      />

      {/* 9 Summary Metric KPI Cards in Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
        <StatCard
          title="Total Registered Restaurants"
          value={totalRegisteredRestaurants}
          subtext="Onboarded tenants"
          icon={Building2}
          accentColor="blue"
        />

        <StatCard
          title="Active Restaurants"
          value={activeRestaurants}
          subtext="Healthy & operational"
          icon={CheckCircle2}
          accentColor="emerald"
        />

        <StatCard
          title="Pending Registrations"
          value={pendingRegistrations}
          subtext="Awaiting verification"
          icon={Clock}
          accentColor="amber"
        />

        <StatCard
          title="Total Registered Users"
          value={totalRegisteredUsers}
          subtext="Tenant & staff logins"
          icon={Users}
          accentColor="purple"
        />

        <StatCard
          title="Active Subscriptions"
          value={activeSubscriptions}
          subtext="Recurring revenue base"
          icon={Layers}
          accentColor="emerald"
        />

        <StatCard
          title="Total Payments Received (₹)"
          value={formatINR(totalPaymentsReceived)}
          subtext="Cleared through banking rails"
          icon={IndianRupee}
          accentColor="emerald"
          className="xl:col-span-1"
        />

        <StatCard
          title="Pending Payments (₹)"
          value={formatINR(pendingPayments)}
          subtext="In settlement pipeline"
          icon={Clock}
          accentColor="amber"
        />

        <StatCard
          title="Failed / Overdue (₹)"
          value={formatINR(failedPayments)}
          subtext="Action required / retries"
          icon={AlertTriangle}
          accentColor="rose"
        />

        <StatCard
          title="Subscriptions Expiring Soon"
          value={subscriptionsExpiringSoon}
          subtext="Next 7–14 days renewal"
          icon={Calendar}
          accentColor="amber"
          className="xl:col-span-2 sm:col-span-2"
        />
      </div>

      {/* Payment Trends Charts (Middle Section) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Monthly Revenue Growth Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Monthly Revenue Trend (May – Oct 2026)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Gross transaction volumes in INR (₹) across Starter, Pro, and Enterprise tiers
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 self-start sm:self-center">
              +14.8% MoM Growth
            </span>
          </div>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyRevenueTrends}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="month"
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val) => [formatINR(val), 'Total Revenue']}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#1E293B',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 mt-2">
            <span>May: ₹3.84 Lakh</span>
            <span>Jun: ₹4.12 Lakh</span>
            <span>Jul: ₹4.48 Lakh</span>
            <span>Aug: ₹4.92 Lakh</span>
            <span>Sep: ₹5.24 Lakh</span>
            <span className="font-bold text-slate-900">Oct: ₹5.82 Lakh</span>
          </div>
        </div>

        {/* Payment Success vs. Pending vs. Failed Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">
              Payment Gateway Health & Statuses
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Settlement ratio across Razorpay, Stripe, and UPI
            </p>
          </div>

          <div className="h-48 mt-2 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'Success', count: 49, fill: '#10B981' },
                  { name: 'Pending', count: 3, fill: '#F59E0B' },
                  { name: 'Failed', count: 2, fill: '#EF4444' },
                ]}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(val) => [`${val} Transactions`, 'Volume']}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Successful Settlements
              </span>
              <strong className="text-slate-900 font-mono">92.4%</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Pending Mandates
              </span>
              <strong className="text-slate-900 font-mono">4.8%</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Declined / Overdue
              </span>
              <strong className="text-slate-900 font-mono">2.8%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table + Right-Side Detail Panel Container */}
      <div className="relative flex flex-col xl:flex-row items-start gap-5">
        {/* Left / Main: Search, Filters & Transactions Table */}
        <div className={`w-full transition-all duration-300 ${selectedTxn ? 'xl:w-2/3' : 'w-full'} space-y-4`}>
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by restaurant, owner, or TXN-ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/60 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Restaurant Filter */}
              <select
                value={restaurantFilter}
                onChange={(e) => {
                  setRestaurantFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 max-w-[150px] truncate"
              >
                <option value="all">All Restaurants</option>
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>

              {/* Plan Filter */}
              <select
                value={planFilter}
                onChange={(e) => {
                  setPlanFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="all">All Plans</option>
                <option value="plan-starter">Starter</option>
                <option value="plan-pro">Professional</option>
                <option value="plan-enterprise">Enterprise</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="all">All Statuses</option>
                <option value="Success">Success</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
                <option value="Overdue">Overdue</option>
                <option value="Refunded">Refunded</option>
              </select>

              {/* Billing Cycle Filter */}
              <select
                value={cycleFilter}
                onChange={(e) => {
                  setCycleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="all">All Cycles</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>

              {(searchTerm ||
                restaurantFilter !== 'all' ||
                planFilter !== 'all' ||
                statusFilter !== 'all' ||
                cycleFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setRestaurantFilter('all');
                    setPlanFilter('all');
                    setStatusFilter('all');
                    setCycleFilter('all');
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1.5 rounded-xl text-xs text-rose-600 hover:bg-rose-50 font-semibold"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Transactions Table */}
          <div className="w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[840px]">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th
                      className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/80 select-none transition-colors"
                      onClick={() => handleSort('restaurantName')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Restaurant & Owner</span>
                        {sortField === 'restaurantName' && (
                          <ChevronUp
                            className={`w-3.5 h-3.5 text-blue-600 ${
                              sortDirection === 'desc' ? 'rotate-180' : ''
                            }`}
                          />
                        )}
                      </div>
                    </th>

                    <th className="py-3.5 px-3">Plan & Cycle</th>

                    <th
                      className="py-3.5 px-3 cursor-pointer hover:bg-slate-100/80 select-none transition-colors"
                      onClick={() => handleSort('amount')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Amount (INR ₹)</span>
                        {sortField === 'amount' && (
                          <ChevronUp
                            className={`w-3.5 h-3.5 text-blue-600 ${
                              sortDirection === 'desc' ? 'rotate-180' : ''
                            }`}
                          />
                        )}
                      </div>
                    </th>

                    <th
                      className="py-3.5 px-3 cursor-pointer hover:bg-slate-100/80 select-none transition-colors"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Status</span>
                        {sortField === 'status' && (
                          <ChevronUp
                            className={`w-3.5 h-3.5 text-blue-600 ${
                              sortDirection === 'desc' ? 'rotate-180' : ''
                            }`}
                          />
                        )}
                      </div>
                    </th>

                    <th
                      className="py-3.5 px-3 cursor-pointer hover:bg-slate-100/80 select-none transition-colors"
                      onClick={() => handleSort('paymentDate')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Payment Date</span>
                        {sortField === 'paymentDate' && (
                          <ChevronUp
                            className={`w-3.5 h-3.5 text-blue-600 ${
                              sortDirection === 'desc' ? 'rotate-180' : ''
                            }`}
                          />
                        )}
                      </div>
                    </th>

                    <th className="py-3.5 px-3">Next Renewal</th>
                    <th className="py-3.5 px-3">Transaction ID</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-sm">
                  {paginatedTransactions.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-slate-500">
                        <CreditCard className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <p className="font-semibold text-slate-700">No payment transactions found</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Try resetting your filters or search terms.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedTransactions.map((txn) => {
                      const isSelected = selectedTxn?.id === txn.id;
                      return (
                        <tr
                          key={txn.id}
                          onClick={() => setSelectedTxn(txn)}
                          className={`hover:bg-blue-50/40 cursor-pointer transition-colors duration-100 group ${
                            isSelected ? 'bg-blue-50/70 border-l-4 border-blue-600' : ''
                          }`}
                        >
                          {/* Restaurant Name & Owner */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xl shrink-0">{txn.logo || '🌿'}</span>
                              <div>
                                <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                                  {txn.restaurantName}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {txn.restaurantOwner}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Plan & Cycle */}
                          <td className="py-3 px-3">
                            <div className="text-xs">
                              <span className="font-semibold text-slate-800">
                                {txn.planName}
                              </span>
                              <div className="text-[10px] text-slate-500">
                                <span
                                  className={`px-1.5 py-0.2 rounded font-medium ${
                                    txn.billingCycle === 'Yearly'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {txn.billingCycle}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Amount INR */}
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900 font-mono text-sm">
                              {formatINR(txn.amount)}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              (Incl. 18% GST)
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3">
                            {renderStatusBadge(txn.status)}
                          </td>

                          {/* Payment Date */}
                          <td className="py-3 px-3 text-xs text-slate-600">
                            <div>{txn.paymentDate?.split(' ')[0] || 'Pending'}</div>
                            <div className="text-[10px] text-slate-400">
                              {txn.paymentDate?.split(' ')[1] || ''}
                            </div>
                          </td>

                          {/* Next Renewal Date */}
                          <td className="py-3 px-3 text-xs text-slate-700 font-medium">
                            {txn.renewalDate}
                          </td>

                          {/* Transaction ID */}
                          <td className="py-3 px-3">
                            <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                              {txn.id}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div
                              className="flex items-center justify-end gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant="outline"
                                size="xs"
                                onClick={() => setSelectedTxn(txn)}
                                title="View Details in Side Panel"
                              >
                                View
                              </Button>

                              <Button
                                variant="outline"
                                size="xs"
                                icon={Receipt}
                                onClick={(e) => handleViewInvoiceForTxn(txn, e)}
                                title="View Official GST Tax Invoice"
                              />

                              {txn.status === 'Pending' && (
                                <Button
                                  variant="brand"
                                  size="xs"
                                  onClick={(e) => handleVerify(txn, e)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                  title="Verify & Settle Payment"
                                >
                                  Verify
                                </Button>
                              )}

                              {(txn.status === 'Failed' || txn.status === 'Overdue') && (
                                <Button
                                  variant="outline"
                                  size="xs"
                                  icon={RotateCcw}
                                  onClick={(e) => handleRetry(txn, e)}
                                  className="text-rose-600 hover:bg-rose-50"
                                  title="Retry Payment Gateway Mandate"
                                />
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-3">
              <div className="flex items-center gap-3">
                <span>
                  Showing{' '}
                  <strong className="text-slate-700">
                    {filteredTransactions.length === 0
                      ? 0
                      : (currentPage - 1) * pageSize + 1}
                  </strong>{' '}
                  to{' '}
                  <strong className="text-slate-700">
                    {Math.min(currentPage * pageSize, filteredTransactions.length)}
                  </strong>{' '}
                  of{' '}
                  <strong className="text-slate-700">{filteredTransactions.length}</strong>{' '}
                  transactions
                </span>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Rows:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-0.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="xs"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCurrentPage(num)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                      currentPage === num
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {num}
                  </button>
                ))}
                <Button
                  variant="outline"
                  size="xs"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right-Side Panel: Selected Restaurant Payment Details */}
        {selectedTxn && (
          <div className="w-full xl:w-1/3 bg-white rounded-2xl border border-slate-200/90 shadow-md p-5 space-y-5 shrink-0 animate-fade-in">
            {/* Header with Close */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 rounded-xl bg-slate-50 border border-slate-100">
                  {selectedTxn.logo || '🌿'}
                </span>
                <div>
                  <h3 className="font-bold text-base text-slate-900 leading-tight">
                    {selectedTxn.restaurantName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Owner: {selectedTxn.restaurantOwner}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTxn(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Payment Summary Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Payment Status</span>
                {renderStatusBadge(selectedTxn.status)}
              </div>

              <div className="flex items-baseline justify-between pt-2 border-t border-slate-200/60">
                <span className="text-xs font-semibold text-slate-600">Total Billed:</span>
                <span className="text-2xl font-black text-slate-900 font-mono">
                  {formatINR(selectedTxn.amount)}
                </span>
              </div>

              <div className="text-[11px] text-slate-500 space-y-1 pt-1">
                <div className="flex justify-between">
                  <span>Base Plan Fee:</span>
                  <span className="font-mono text-slate-700">
                    {formatINR(selectedTxn.baseAmount || Math.round(selectedTxn.amount / 1.18))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>18% GST (Tax):</span>
                  <span className="font-mono text-slate-700">
                    {formatINR(selectedTxn.taxAmount || Math.round(selectedTxn.amount - selectedTxn.amount / 1.18))}
                  </span>
                </div>
              </div>
            </div>

            {/* Transaction Specific Metadata */}
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
                  <span className="text-[10px] text-slate-400 font-medium block">
                    Subscription Tier
                  </span>
                  <strong className="text-indigo-600">
                    {selectedTxn.planName}
                  </strong>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
                  <span className="text-[10px] text-slate-400 font-medium block">
                    Billing Frequency
                  </span>
                  <strong className="text-slate-800">
                    {selectedTxn.billingCycle} Cycle
                  </strong>
                </div>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Transaction ID:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {selectedTxn.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Gateway Ref:</span>
                  <span className="font-mono text-slate-600">
                    {selectedTxn.gatewayRef || 'pay_test_01928'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Gateway:</span>
                  <span className="text-slate-700 font-medium">
                    {selectedTxn.gateway} (Secured)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Instrument:</span>
                  <span className="text-slate-700 font-medium">
                    {selectedTxn.paymentMethod}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Date:</span>
                  <span className="text-slate-700 font-medium">
                    {selectedTxn.paymentDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Next Scheduled Renewal:</span>
                  <span className="text-emerald-700 font-bold">
                    {selectedTxn.renewalDate}
                  </span>
                </div>
              </div>

              {selectedTxn.failureReason && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    Payment Failure Cause:
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {selectedTxn.failureReason}
                  </p>
                </div>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              {selectedTxn.status === 'Pending' && (
                <Button
                  variant="brand"
                  size="sm"
                  icon={CheckCircle2}
                  onClick={(e) => handleVerify(selectedTxn, e)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Verify & Settle Payment (Activate Tenant)
                </Button>
              )}

              {(selectedTxn.status === 'Failed' || selectedTxn.status === 'Overdue') && (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="brand"
                    size="sm"
                    icon={RefreshCw}
                    onClick={(e) => handleRetry(selectedTxn, e)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Retry Mandate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Send}
                    onClick={(e) => handleSendReminder(selectedTxn, e)}
                  >
                    Send Reminder
                  </Button>
                </div>
              )}

              {selectedTxn.status === 'Success' && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={Printer}
                  onClick={(e) => handleViewInvoiceForTxn(selectedTxn, e)}
                  className="w-full"
                >
                  View Official Tax Invoice
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Payment Confirmation Modal (Requirement 4) */}
      <PaymentConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        transaction={verifiedTxnForModal}
        onViewInvoice={(txn) => handleViewInvoiceForTxn(txn)}
      />

      {/* Invoice Viewer Modal (Requirement 6) */}
      <InvoiceModal
        isOpen={invoiceModalData.isOpen}
        onClose={() => setInvoiceModalData({ isOpen: false, invoice: null })}
        invoice={invoiceModalData.invoice}
      />
    </div>
  );
};

