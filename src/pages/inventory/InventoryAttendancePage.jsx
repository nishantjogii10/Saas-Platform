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
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';

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
    <div className="space-y-5 w-full pb-12">
      {/* Page Header */}
      <PageHeader
        title="My Attendance, Leaves & Shifts"
        subtitle="Track your daily duty shifts, live clock-in hours, monthly attendance roster, leave balance requests, and official holiday schedules."
        breadcrumbs={[
          { label: 'Restaurant', href: '#/dashboard' },
          { label: 'Attendance', href: '#/my-attendance' },
          { label: 'Shift Terminal' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsExportOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all active:scale-[0.98] cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Timesheet</span>
            </button>
            <button
              type="button"
              onClick={() => setIsLeaveModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs hover:shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Apply for Leave</span>
            </button>
          </div>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Current Shift Status"
          value={activeRecord?.isOnBreak ? 'On Break' : activeRecord ? 'On Duty' : 'Off Duty'}
          subtitle={activeRecord ? `${activeRecord.station} • ${activeRecord.branchName || currentBranch?.name}` : 'Not Clocked In'}
          icon={Clock}
          variant={activeRecord?.isOnBreak ? 'warning' : activeRecord ? 'success' : 'default'}
        />
        <StatCard
          title="Pending Leave Requests"
          value={pendingLeaves.length}
          subtitle={pendingLeaves.length > 0 ? 'Awaiting Manager Sign-off' : 'All Clear / Approved'}
          icon={Calendar}
          variant={pendingLeaves.length > 0 ? 'warning' : 'default'}
          onClick={() => setActiveTab('leave')}
        />
        <StatCard
          title="Total Shifts Logged"
          value={myRecords.length}
          subtitle="Attendance record history"
          icon={CheckCircle2}
          variant="default"
          onClick={() => setActiveTab('history')}
        />
        <StatCard
          title="Upcoming Holidays"
          value={branchHolidays.filter((h) => (h.endDate || h.date) >= new Date().toISOString().split('T')[0]).length}
          subtitle="Declared branch holidays"
          icon={Palmtree}
          variant="emerald"
          onClick={() => setActiveTab('holidays')}
        />
      </div>

      {/* Main Interactive Punch Clock Terminal */}
      <PunchClockWidget />

      {/* Navigation Sub-Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-1.5 shadow-xs flex items-center gap-1.5 overflow-x-auto">
        {[
          { id: 'calendar', label: 'Monthly Attendance Calendar', icon: CalendarDays },
          { id: 'leave', label: 'Leave Requisitions & Balances', icon: Palmtree, count: pendingLeaves.length },
          { id: 'holidays', label: 'Official Holidays List', icon: Calendar, count: branchHolidays.length },
          { id: 'history', label: 'Shift Attendance Ledger', icon: Clock, count: myRecords.length },
          ...(mySalaries.length > 0 ? [{ id: 'payroll', label: 'My Salary Slips', icon: Receipt, count: mySalaries.length }] : []),
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-max py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700 font-bold'
                  }`}
                >
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
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
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
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
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
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
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
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
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

