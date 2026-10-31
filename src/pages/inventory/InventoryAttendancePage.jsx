import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ClockAlert,
  FileSpreadsheet,
  Plus,
  Coffee,
  ShieldCheck,
  Send,
  Sparkles,
  Receipt,
  Download,
  Eye,
  CalendarDays,
  Palmtree,
  User,
  MapPin,
  Check,
} from 'lucide-react';
import { PunchClockWidget } from '../../components/kitchen/PunchClockWidget';
import { MonthlyAttendanceCalendar } from '../../components/attendance/MonthlyAttendanceCalendar';
import { HolidayDetailsModal } from '../../components/attendance/HolidayDetailsModal';
import { LeaveRequestModal } from '../../components/kitchen/LeaveRequestModal';
import { SalarySlipModal } from '../../components/kitchen/SalarySlipModal';
import { ColumnExportDialog } from '../../components/common/ColumnExportDialog';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const InventoryAttendancePage = () => {
  const {
    currentUser,
    currentBranch,
    currentRestaurant,
    attendanceRecords,
    leaveRequests,
    cancelLeaveRequest,
    getStaffLeaveBalance,
    holidays,
    salaryPayments,
    addToast,
  } = useApp();

  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'calendar');
  const [viewingHoliday, setViewingHoliday] = useState(null); // 'calendar' | 'leave' | 'holidays' | 'history' | 'payroll'
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedSalarySlip, setSelectedSalarySlip] = useState(null);

  // Sync search params
  useEffect(() => {
    const rawTab = searchParams.get('tab');
    if (rawTab && ['calendar', 'leave', 'holidays', 'history', 'payroll'].includes(rawTab)) {
      setActiveTab(rawTab);
    }
    const rawHolidayId = searchParams.get('holidayId');
    if (rawHolidayId) {
      const matchHol = (holidays || []).find((h) => String(h.id) === String(rawHolidayId));
      if (matchHol) {
        setViewingHoliday(matchHol);
        setActiveTab('holidays');
      }
    }
  }, [searchParams, holidays]);

  // Active attendance session
  const activeRecord = attendanceRecords.find(
    (r) => r.staffId === currentUser?.id && r.status === 'active'
  );

  // Leave data
  const myLeaves = leaveRequests.filter((l) => l.staffId === currentUser?.id);
  const myBalances = getStaffLeaveBalance ? getStaffLeaveBalance(currentUser?.id) : {};
  const myRecords = attendanceRecords.filter((r) => r.staffId === currentUser?.id);
  const mySalaries = (salaryPayments || []).filter((s) => s.staffId === currentUser?.id);

  // Applicable holidays
  const branchHolidays = (holidays || []).filter(
    (h) => !h.branchId || h.branchId === currentBranch?.id || h.branchId === 'all'
  ).sort((a, b) => new Date(a.date) - new Date(b.date));

  const pendingLeaves = myLeaves.filter((l) => l.status === 'pending');

  const handleCancelLeave = (leaveId) => {
    if (window.confirm('Are you sure you want to cancel this leave application?')) {
      cancelLeaveRequest(leaveId);
    }
  };

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Page Header Banner */}
      <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 text-white shadow-xl shadow-slate-900/10 relative overflow-hidden border border-teal-500/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-400/30 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-400" />
                Staff Attendance &amp; Shift Terminal
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-teal-200 font-medium">
                {currentRestaurant?.name} ({currentBranch?.name || 'Assigned Branch'})
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              My Attendance, Leaves &amp; Shifts
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Track your daily duty shifts, live clock-in hours, monthly attendance roster, leave balance requests, and official holiday schedules.
            </p>

            {/* Quick Status Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold shadow-xs ${
                  activeRecord?.isOnBreak
                    ? 'bg-amber-500 text-white animate-pulse'
                    : activeRecord
                    ? 'bg-emerald-500 text-white animate-pulse'
                    : 'bg-white/10 text-slate-300 border border-white/15'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${activeRecord ? 'bg-white' : 'bg-slate-400'}`} />
                {activeRecord?.isOnBreak
                  ? `On Break • ${activeRecord.station}`
                  : activeRecord
                  ? `On Duty • ${activeRecord.station}`
                  : 'Off Duty (Not Clocked In)'}
              </span>

              {pendingLeaves.length > 0 && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  <Calendar className="w-3.5 h-3.5" />
                  {pendingLeaves.length} Leave Application Pending Review
                </span>
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
              <Plus className="w-4 h-4 text-teal-300" />
              <span>Apply for Leave</span>
            </button>

            <button
              type="button"
              onClick={() => setIsExportOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-teal-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-slate-950" />
              <span>Export Timesheet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Punch Clock Terminal */}
      <PunchClockWidget />

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 scrollbar-thin">
        {[
          { id: 'calendar', label: 'Monthly Attendance Calendar', icon: CalendarDays },
          { id: 'leave', label: 'Leave Requisitions & Balances', icon: Palmtree, count: pendingLeaves.length },
          { id: 'holidays', label: 'Official Holidays List', icon: Calendar },
          { id: 'history', label: 'Shift Attendance Ledger', icon: Clock },
          ...(mySalaries.length > 0 ? [{ id: 'payroll', label: 'My Salary Slips', icon: Receipt }] : []),
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-white">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Monthly Attendance Calendar */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <MonthlyAttendanceCalendar staffId={currentUser?.id} />
        </div>
      )}

      {/* Tab 2: Leave Requisitions & Balances */}
      {activeTab === 'leave' && (
        <div className="space-y-6">
          {/* Leave Quota Balances Summary Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Your Annual Leave Quota</h3>
                <p className="text-xs text-slate-500">Track remaining days available under each category</p>
              </div>
              <Button size="sm" variant="brand" icon={Plus} onClick={() => setIsLeaveModalOpen(true)}>
                New Leave Application
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(myBalances).map(([type, b]) => {
                const percent = Math.round(((b.used || 0) / (b.total || 1)) * 100);
                return (
                  <div key={type} className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                    <span className="text-xs font-bold text-slate-700 block truncate">{type}</span>
                    <div className="flex items-baseline gap-1.5 mt-2">
                      <span className="text-2xl font-black text-slate-900 font-mono">{b.remaining}</span>
                      <span className="text-xs text-slate-400 font-medium">/ {b.total} days left</span>
                    </div>

                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Used: {b.used}d</span>
                        <span className="font-mono">{percent}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-teal-500"
                          style={{ width: `${Math.min(100, percent)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Leave Applications History */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Submitted Leave Requests</h4>
                <p className="text-xs text-slate-500">Applications dispatched for Restaurant Manager sign-off</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-mono">
                {myLeaves.length} Records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Leave Type</th>
                    <th className="py-3 px-4">Duration &amp; Dates</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Applied On</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Manager Review Notes</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No leave applications submitted yet.
                      </td>
                    </tr>
                  ) : (
                    myLeaves.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">{l.leaveType}</td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">
                            {l.startDate} → {l.endDate}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {l.durationDays} {l.durationDays === 1 ? 'day' : 'days'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{l.reason}</td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                          {l.appliedDate ? new Date(l.appliedDate).toLocaleDateString('en-IN') : '—'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                              l.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : l.status === 'pending'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : l.status === 'rejected'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {l.status === 'approved' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                            {l.status === 'pending' && <ClockAlert className="w-3 h-3 text-amber-600" />}
                            {l.status === 'rejected' && <XCircle className="w-3 h-3 text-rose-600" />}
                            {(l.status || 'PENDING').toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-[11px] italic">
                          {l.reviewNotes || (l.status === 'pending' ? 'Awaiting manager review' : '—')}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {l.status === 'pending' && (
                            <button
                              type="button"
                              onClick={() => handleCancelLeave(l.id)}
                              className="px-2.5 py-1 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
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

      {/* Tab 3: Official Holidays List */}
      {activeTab === 'holidays' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Scheduled Holidays (2026)</h4>
              <p className="text-xs text-slate-500">
                Official paid company holidays &amp; branch gazetted calendar
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 font-mono">
              {branchHolidays.length} Holidays
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Day</th>
                  <th className="py-3 px-4">Holiday Name</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4">Applicability</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {branchHolidays.map((h) => {
                  const d = new Date(h.date);
                  const dayName = isNaN(d) ? '' : d.toLocaleDateString('en-US', { weekday: 'long' });
                  const isUpcoming = d >= new Date();

                  return (
                    <tr key={h.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{h.date}</td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{dayName}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                        <span>{h.name}</span>
                        {isUpcoming && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-teal-100 text-teal-800">
                            Upcoming
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            h.type === 'National'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : h.type === 'Festival'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-purple-100 text-purple-800 border border-purple-200'
                          }`}
                        >
                          {h.type || 'Gazetted'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {h.branchId === 'all' || !h.branchId ? 'All Branches' : currentBranch?.name || 'Local Branch'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="xs"
                          variant="ghost"
                          icon={Eye}
                          onClick={() => setViewingHoliday(h)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Shift Attendance Ledger */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Personal Shift Timesheet Ledger</h4>
              <p className="text-xs text-slate-500">Every punch session logged from your station</p>
            </div>
            <Button size="sm" variant="outline" icon={Download} onClick={() => setIsExportOpen(true)}>
              Download CSV / Excel
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Station / Area</th>
                  <th className="py-3 px-4">Clock-In Time</th>
                  <th className="py-3 px-4">Clock-Out Time</th>
                  <th className="py-3 px-4">Break Taken</th>
                  <th className="py-3 px-4">Net Worked Hours</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No shift records logged yet.
                    </td>
                  </tr>
                ) : (
                  myRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{r.date}</td>
                      <td className="py-3 px-4 text-slate-700 font-medium">{r.station}</td>
                      <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">
                        {new Date(r.punchInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">
                        {r.punchOutTime
                          ? new Date(r.punchOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">
                        {r.breakMinutes ? `${r.breakMinutes} min` : '0 min'}
                      </td>
                      <td className="py-3 px-4 font-bold font-mono text-slate-900">
                        {r.totalHours ? `${r.totalHours} hrs` : <span className="text-teal-600">Active Shift</span>}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            r.status === 'active'
                              ? 'bg-teal-100 text-teal-800 border border-teal-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {r.status === 'active' ? 'Active' : 'Completed'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px] truncate max-w-xs">{r.notes || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: My Salary Slips */}
      {activeTab === 'payroll' && mySalaries.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Salary Disbursals &amp; Pay Vouchers</h4>
              <p className="text-xs text-slate-500">Official monthly payroll receipts</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-mono">
              {mySalaries.length} Slips
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Pay Period</th>
                  <th className="py-3 px-4">Disbursal Date</th>
                  <th className="py-3 px-4">Base Wage</th>
                  <th className="py-3 px-4">Incentives / Bonus</th>
                  <th className="py-3 px-4">Net Payout</th>
                  <th className="py-3 px-4">Transaction Ref</th>
                  <th className="py-3 px-4 text-right">View Payslip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mySalaries.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{s.monthYear}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{s.date}</td>
                    <td className="py-3 px-4 text-slate-700 font-mono">₹{s.baseSalary?.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-emerald-600 font-mono">
                      +₹{((s.bonus || 0) + (s.tipShare || 0)).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 font-mono text-sm">
                      ₹{s.netPay?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[10px]">{s.txHash || s.id}</td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="xs"
                        variant="ghost"
                        icon={Eye}
                        onClick={() => setSelectedSalarySlip(s)}
                      >
                        Payslip
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Holiday Details Modal */}
      {viewingHoliday && (
        <HolidayDetailsModal
          isOpen={!!viewingHoliday}
          onClose={() => {
            setViewingHoliday(null);
            setSearchParams((prev) => {
              const next = new URLSearchParams(prev);
              next.delete('holidayId');
              return next;
            });
          }}
          holiday={viewingHoliday}
        />
      )}

      {/* Leave Application Modal */}
      <LeaveRequestModal isOpen={isLeaveModalOpen} onClose={() => setIsLeaveModalOpen(false)} />

      {/* Salary Slip Modal */}
      {selectedSalarySlip && (
        <SalarySlipModal slip={selectedSalarySlip} onClose={() => setSelectedSalarySlip(null)} />
      )}

      {/* Timesheet Export Dialog */}
      <ColumnExportDialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        data={myRecords}
        reportTitle={`Personal Timesheet — ${currentUser?.name}`}
        availableColumns={[
          { key: 'date', header: 'Shift Date' },
          { key: 'station', header: 'Station / Area' },
          {
            key: 'punchInTime',
            header: 'Clock In',
            format: (val) => (val ? new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'),
          },
          {
            key: 'punchOutTime',
            header: 'Clock Out',
            format: (val) => (val ? new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'),
          },
          { key: 'breakMinutes', header: 'Break (Mins)', format: (val) => val || 0 },
          { key: 'totalHours', header: 'Total Worked Hours', format: (val) => (val ? `${val} hrs` : 'Active') },
          { key: 'status', header: 'Shift Status', format: (val) => (val || '').toUpperCase() },
          { key: 'notes', header: 'Notes' },
        ]}
      />
    </div>
  );
};

