import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  ChefHat,
  Scale,
  Trash2,
  AlertCircle,
  ClockAlert,
  Boxes,
  CheckCircle2,
  ArrowRight,
  Flame,
  Calendar,
  IndianRupee,
  Receipt,
  Plus,
  Clock,
  XCircle,
  Bell,
  Sparkles,
  Eye,
  FileText,
  BadgeAlert,
  ShieldCheck,
  MapPin,
  TrendingUp,
  RotateCcw,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { PunchClockWidget } from '../../components/kitchen/PunchClockWidget';
import { LeaveRequestModal } from '../../components/kitchen/LeaveRequestModal';
import { SalarySlipModal } from '../../components/kitchen/SalarySlipModal';
import { StaffNotificationHub } from '../../components/kitchen/StaffNotificationHub';
import { formatINR } from '../../data/financeData';

export const KitchenDashboard = () => {
  const navigate = useNavigate();
  const {
    currentRestaurant,
    currentBranch,
    restaurantIngredients,
    restaurantMovements,
    currentUser,
    attendanceRecords,
    leaveRequests,
    salaryPayments,
    staffNotifications,
    markStaffNotificationRead,
  } = useApp();

  // Active Tab
  const [activeTab, setActiveTab] = useState('operations'); // 'operations' | 'leave' | 'notifications' | 'payroll'

  // Modals
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [selectedSalarySlip, setSelectedSalarySlip] = useState(null);

  // Filters for kitchen operations
  const expiringSoon = restaurantIngredients.filter((i) => i.daysUntilExpiry <= 3 && i.daysUntilExpiry >= 0);
  const recentStaffMovements = restaurantMovements.filter(
    (m) => m.performedBy.includes(currentUser.name) || m.role === 'Kitchen Staff'
  );

  // Active attendance check
  const activeRecord = attendanceRecords.find(
    (r) => r.staffId === currentUser?.id && r.status === 'active'
  );

  // Staff specific data
  const myLeaves = leaveRequests.filter((l) => l.staffId === currentUser?.id);
  const mySalaries = salaryPayments.filter((s) => s.staffId === currentUser?.id);
  const myNotifications = staffNotifications.filter((n) => n.targetStaffId === currentUser?.id);
  const unreadNotifsCount = myNotifications.filter((n) => !n.read).length;
  const unreadSalaryNotif = myNotifications.find((n) => n.type === 'salary_credit' && !n.read);

  // Leave stats
  const pendingLeavesCount = myLeaves.filter((l) => l.status === 'pending').length;
  const approvedLeavesCount = myLeaves.filter((l) => l.status === 'approved').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Dynamic Modern Page Header */}
      <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white shadow-xl shadow-slate-900/10 relative overflow-hidden border border-emerald-500/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
                <ChefHat className="w-3.5 h-3.5 text-emerald-400" />
                Kitchen Station Terminal
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-emerald-200 font-medium">
                {currentRestaurant?.name} ({currentBranch?.name || 'Pune Central'})
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Kitchen Operations &amp; Staff Hub
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time station punch clock, rapid ingredient prep logs, leave management, and official payroll vouchers.
            </p>

            {/* Quick Status Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold shadow-xs ${
                  activeRecord
                    ? 'bg-emerald-500 text-white animate-pulse'
                    : 'bg-white/10 text-slate-300 border border-white/15'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${activeRecord ? 'bg-white' : 'bg-slate-400'}`} />
                {activeRecord ? `On Duty • ${activeRecord.station}` : 'Off Duty'}
              </span>

              {pendingLeavesCount > 0 && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  <Calendar className="w-3.5 h-3.5" />
                  {pendingLeavesCount} Leave Pending
                </span>
              )}

              {unreadNotifsCount > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('notifications')}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 hover:bg-emerald-500/30 transition-colors cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5" />
                  {unreadNotifsCount} New Alert{unreadNotifsCount > 1 ? 's' : ''}
                </button>
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsLeaveModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/15 shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-emerald-300" />
              <span>Apply for Leave</span>
            </button>

            {mySalaries.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedSalarySlip(mySalaries[0])}
                className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 cursor-pointer"
              >
                <Receipt className="w-4 h-4 text-slate-950" />
                <span>Latest Pay Slip</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* High-Impact Salary Credited Notification Banner (if newly processed) */}
      {unreadSalaryNotif && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white shadow-xl border border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 font-bold shadow-lg shadow-emerald-500/30 mt-0.5">
              <IndianRupee className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base tracking-tight text-white">
                  {unreadSalaryNotif.title}
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-mono">
                  Settled
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 mt-1 max-w-2xl leading-relaxed">
                {unreadSalaryNotif.message}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {mySalaries[0] && (
              <button
                type="button"
                onClick={() => {
                  markStaffNotificationRead(unreadSalaryNotif.id);
                  setSelectedSalarySlip(mySalaries[0]);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs shadow-md shadow-emerald-400/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Receipt className="w-4 h-4" />
                <span>View Pay Voucher</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => markStaffNotificationRead(unreadSalaryNotif.id)}
              className="text-xs text-slate-400 hover:text-white px-3 py-2 transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Feature 1: Modern Punch-In / Punch-Out Attendance Widget */}
      <PunchClockWidget />

      {/* Navigation Tabs Bar */}
      <div className="p-1.5 rounded-2xl bg-slate-200/70 backdrop-blur-md flex flex-wrap gap-1 border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('operations')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all duration-200 cursor-pointer ${
            activeTab === 'operations'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <ChefHat className="w-4 h-4 text-emerald-600" />
          <span>Station Operations &amp; Prep</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('leave')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all duration-200 cursor-pointer ${
            activeTab === 'leave'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span>My Leave Applications</span>
          {pendingLeavesCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-bold">
              {pendingLeavesCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all duration-200 cursor-pointer ${
            activeTab === 'notifications'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Bell className="w-4 h-4 text-emerald-600" />
          <span>Notifications &amp; Alerts</span>
          {unreadNotifsCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-600 text-white font-bold animate-pulse">
              {unreadNotifsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('payroll')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all duration-200 cursor-pointer ${
            activeTab === 'payroll'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <IndianRupee className="w-4 h-4 text-emerald-600" />
          <span>Salary Receipts ({mySalaries.length})</span>
        </button>
      </div>

      {/* TAB 1: STATION OPERATIONS & QUICK INVENTORY */}
      {activeTab === 'operations' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Touch-Optimized Large Quick Action Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => navigate('/kitchen/usage')}
              className="group cursor-pointer rounded-3xl p-6 bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Scale className="w-6 h-6 text-emerald-300" />
              </div>
              <h3 className="font-bold text-lg text-white">Record Ingredient Usage</h3>
              <p className="text-xs text-emerald-100/80 mt-1">
                Log quantities used during recipe prep or service rush
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300 mt-4 group-hover:translate-x-1.5 transition-transform">
                Open Usage Logger →
              </span>
            </div>

            <div
              onClick={() => navigate('/kitchen/wastage')}
              className="group cursor-pointer rounded-3xl p-6 bg-gradient-to-br from-rose-800 via-rose-900 to-rose-950 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Trash2 className="w-6 h-6 text-rose-300" />
              </div>
              <h3 className="font-bold text-lg text-white">Record Food Wastage</h3>
              <p className="text-xs text-rose-100/80 mt-1">
                Log spoiled items, dropped prep containers, or trim scraps
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-300 mt-4 group-hover:translate-x-1.5 transition-transform">
                Log Wastage →
              </span>
            </div>

            <div
              onClick={() => navigate('/kitchen/report-stock')}
              className="group cursor-pointer rounded-3xl p-6 bg-gradient-to-br from-amber-700 via-amber-800 to-amber-950 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <AlertCircle className="w-6 h-6 text-amber-300" />
              </div>
              <h3 className="font-bold text-lg text-white">Report Low Stock</h3>
              <p className="text-xs text-amber-100/80 mt-1">
                Notify inventory manager of low supplies on the cooking line
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 mt-4 group-hover:translate-x-1.5 transition-transform">
                Send Stock Alert →
              </span>
            </div>

            <div
              onClick={() => navigate('/kitchen/ingredients')}
              className="group cursor-pointer rounded-3xl p-6 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Boxes className="w-6 h-6 text-slate-300" />
              </div>
              <h3 className="font-bold text-lg text-white">Check Stock Levels</h3>
              <p className="text-xs text-slate-300/80 mt-1">
                Search on-hand quantities, locations, and batch numbers
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-300 mt-4 group-hover:translate-x-1.5 transition-transform">
                Browse Storage Stock →
              </span>
            </div>
          </div>

          {/* Two Columns: Urgent Expiry Warnings & Shift Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Urgent Shelf-Life Warnings */}
            <div className="lg:col-span-6">
              <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-50/50 to-white">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                      <ClockAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Urgent Expiry Batches</h3>
                      <p className="text-[11px] text-slate-500">Prioritize these on cooking lines first</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                    {expiringSoon.length} items
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {expiringSoon.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No batches expiring within the next 3 days!
                    </div>
                  ) : (
                    expiringSoon.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 sm:px-6 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs sm:text-sm">{item.name}</span>
                            <Badge status="expiring_soon" label={`${item.daysUntilExpiry}d left`} size="xs" />
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {item.quantity} {item.unit} remaining • Location: {item.storageLocation}
                          </p>
                        </div>
                        <Button
                          variant="primary"
                          size="xs"
                          onClick={() => navigate('/kitchen/usage')}
                        >
                          Use in Prep
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Shift Movements */}
            <div className="lg:col-span-6">
              <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                      <Flame className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Your Shift Activity Log</h3>
                      <p className="text-[11px] text-slate-500">Submitted usages, wastage reports, and adjustments</p>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {recentStaffMovements.slice(0, 5).map((mov) => (
                    <div
                      key={mov.id}
                      className="p-4 sm:px-6 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm">{mov.ingredientName}</span>
                          <Badge status={mov.type} size="xs" />
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {mov.quantity} {mov.unit} • {mov.reason}
                        </p>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono whitespace-nowrap">
                        {new Date(mov.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                  {recentStaffMovements.length === 0 && (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No usage or wastage recorded during this shift yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STAFF LEAVE APPLICATION & TRACKING */}
      {activeTab === 'leave' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Staff Leave Requisitions &amp; Review Tracker
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Submit time-off requests for manager approval and view decisions in real time.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsLeaveModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-700/20 flex items-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Apply for New Leave</span>
            </button>
          </div>

          {/* Leave History Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Leave Category</th>
                    <th className="py-3.5 px-4">Dates &amp; Duration</th>
                    <th className="py-3.5 px-4">Reason for Request</th>
                    <th className="py-3.5 px-4">Submission Date</th>
                    <th className="py-3.5 px-4">Manager Review Status</th>
                    <th className="py-3.5 px-4">Reviewer Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-xs text-slate-400">
                        You have not submitted any leave applications yet.
                      </td>
                    </tr>
                  ) : (
                    myLeaves.map((leave) => (
                      <tr key={leave.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-4">
                          <span className="font-bold text-slate-900 block">{leave.leaveType}</span>
                          <span className="text-[10px] text-slate-400">{leave.branchName}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-semibold text-slate-900">
                            {leave.startDate} ➔ {leave.endDate}
                          </div>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                            {leave.durationDays} {leave.durationDays === 1 ? 'Day' : 'Days'} Total
                          </span>
                        </td>
                        <td className="py-4 px-4 max-w-xs text-slate-700 leading-relaxed">
                          {leave.reason}
                        </td>
                        <td className="py-4 px-4 text-slate-500 text-[11px] font-mono">
                          {new Date(leave.appliedDate).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-4 px-4">
                          {leave.status === 'pending' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              Pending Manager Review
                            </span>
                          ) : leave.status === 'approved' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Approved by Manager
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              Declined / Rejected
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-slate-600 text-[11px]">
                          {leave.reviewedBy ? (
                            <div>
                              <div className="font-medium text-slate-800">
                                {leave.reviewNotes || (leave.status === 'approved' ? 'Approved' : 'Declined')}
                              </div>
                              <span className="text-[10px] text-slate-400">
                                Reviewed by {leave.reviewedBy}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Awaiting review...</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: NOTIFICATIONS & ALERTS HUB */}
      {activeTab === 'notifications' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <StaffNotificationHub onOpenSalarySlip={(sal) => setSelectedSalarySlip(sal)} />
        </div>
      )}

      {/* TAB 4: SALARY & PAYROLL RECEIPTS */}
      {activeTab === 'payroll' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Salary Credits &amp; Remuneration Records
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                View credited monthly salaries, festive bonuses, and official downloadable pay vouchers.
              </p>
            </div>

            {mySalaries.length > 0 && (
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-3">
                <IndianRupee className="w-6 h-6 text-emerald-700" />
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">Latest Remuneration</span>
                  <span className="text-lg font-black text-emerald-950 font-mono">
                    {formatINR(mySalaries[0]?.amount)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Salary Records Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Pay Period</th>
                    <th className="py-3.5 px-4">Take-Home Amount</th>
                    <th className="py-3.5 px-4">Breakdown</th>
                    <th className="py-3.5 px-4">Bank UTR / Reference</th>
                    <th className="py-3.5 px-4">Payment Method</th>
                    <th className="py-3.5 px-4">Disbursed Date</th>
                    <th className="py-3.5 px-4 text-right">Pay Slip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mySalaries.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-xs text-slate-400">
                        No salary records available for this account yet.
                      </td>
                    </tr>
                  ) : (
                    mySalaries.map((sal) => (
                      <tr key={sal.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-4 font-bold text-slate-900">
                          {sal.payPeriod}
                        </td>
                        <td className="py-4 px-4 font-black font-mono text-emerald-800 text-sm">
                          {formatINR(sal.amount)}
                        </td>
                        <td className="py-4 px-4 text-slate-600">
                          <div>Basic: {formatINR(sal.baseSalary || sal.amount)}</div>
                          {Number(sal.bonus) > 0 && (
                            <span className="text-[10px] text-emerald-700 font-bold">
                              + {formatINR(sal.bonus)} Bonus
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 font-mono text-slate-800 text-[11px]">
                          {sal.referenceNumber}
                        </td>
                        <td className="py-4 px-4 text-slate-600">
                          {sal.paymentMethod}
                        </td>
                        <td className="py-4 px-4 text-slate-500 text-[11px]">
                          {new Date(sal.processedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedSalarySlip(sal)}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 text-emerald-800 font-bold text-xs transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Slip</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Leave Request Form Modal */}
      <LeaveRequestModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
      />

      {/* Salary Slip Detail Modal */}
      <SalarySlipModal
        isOpen={!!selectedSalarySlip}
        onClose={() => setSelectedSalarySlip(null)}
        payment={selectedSalarySlip}
      />
    </div>
  );
};
