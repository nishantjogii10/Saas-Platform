import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { AttendanceDayDetailModal } from './AttendanceDayDetailModal';
import { AttendanceCorrectionModal } from './AttendanceCorrectionModal';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  Coffee,
  XCircle,
  HelpCircle,
  Download,
  Filter,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export const MonthlyAttendanceCalendar = ({
  targetStaffId,
  showEmployeeSelector = false,
  availableStaff = [],
  onStaffChange,
  canCorrect = false,
}) => {
  const {
    currentUser,
    currentBranch,
    attendanceRecords,
    leaveRequests,
    holidays,
    branchStaff,
  } = useApp();

  // Active viewing staff member
  const [selectedStaffId, setSelectedStaffId] = useState(targetStaffId || currentUser?.id || 'usr-sg-3');
  const activeStaffId = targetStaffId || selectedStaffId;

  // Selected Month & Year (Default: October 2026, matching demo datasets)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(9); // 0-indexed: 9 = October

  // Day detail and correction modals
  const [selectedDayDetail, setSelectedDayDetail] = useState(null);
  const [correctionTargetRecord, setCorrectionTargetRecord] = useState(null);

  // Active staff object
  const activeStaff = useMemo(() => {
    return (
      (availableStaff.length > 0 ? availableStaff : branchStaff).find((s) => s.id === activeStaffId) ||
      (currentUser?.id === activeStaffId ? currentUser : null) || {
        id: activeStaffId,
        name: 'Staff Member',
        roleLabel: 'Line Cook',
        branchName: currentBranch?.name || 'Active Branch',
      }
    );
  }, [availableStaff, branchStaff, activeStaffId, currentUser, currentBranch]);

  // Handle month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    const today = new Date();
    // Default to Oct 2026 if today is in future or demo
    setCurrentYear(2026);
    setCurrentMonth(9);
  };

  // Month Name & Days count
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = monthNames[currentMonth];
  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // 1st Day of Month day-of-week (0=Sun, 1=Mon, ..., 6=Sat)
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  // We align with Monday as the first column (0=Mon ... 6=Sun)
  const startOffset = (firstDayOfWeek + 6) % 7;

  // Filter attendance records for this staff & month
  const staffRecords = useMemo(() => {
    return (attendanceRecords || []).filter((r) => {
      if (r.staffId !== activeStaffId) return false;
      const recDate = new Date(r.date);
      return recDate.getFullYear() === currentYear && recDate.getMonth() === currentMonth;
    });
  }, [attendanceRecords, activeStaffId, currentYear, currentMonth]);

  // Approved leaves for this staff overlapping this month
  const staffApprovedLeaves = useMemo(() => {
    return (leaveRequests || []).filter((l) => {
      if (l.staffId !== activeStaffId || l.status !== 'approved') return false;
      const lStart = new Date(l.startDate);
      const lEnd = new Date(l.endDate);
      const mStart = new Date(currentYear, currentMonth, 1);
      const mEnd = new Date(currentYear, currentMonth, totalDaysInMonth);
      return lStart <= mEnd && lEnd >= mStart;
    });
  }, [leaveRequests, activeStaffId, currentYear, currentMonth, totalDaysInMonth]);

  // Applicable holidays for this month & scope
  const monthHolidays = useMemo(() => {
    return (holidays || []).filter((h) => {
      const hDate = new Date(h.date);
      if (hDate.getFullYear() !== currentYear || hDate.getMonth() !== currentMonth) return false;
      if (h.scope === 'all') return true;
      if (activeStaff?.branchId && h.branchId) return h.branchId === activeStaff.branchId;
      return true;
    });
  }, [holidays, activeStaff, currentYear, currentMonth]);

  // Calendar Day Map: pre-calculate status for all 1..totalDaysInMonth
  const calendarDays = useMemo(() => {
    const days = [];
    const todayStr = '2026-10-24'; // Demo active today date

    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
      const dateObj = new Date(currentYear, currentMonth, d);
      const dayOfWeek = dateObj.getDay(); // 0 = Sun

      // 1. Holiday check
      const holiday = monthHolidays.find((h) => h.date === dateStr);

      // 2. Attendance record check
      const record = staffRecords.find((r) => r.date === dateStr);

      // 3. Approved leave check
      const approvedLeave = staffApprovedLeaves.find((l) => {
        return dateStr >= l.startDate && dateStr <= l.endDate;
      });

      // 4. Weekly off check (Default: Sunday = 0 or employee specified)
      const isWeeklyOff = dayOfWeek === 0;

      // Determine final status
      let status = 'absent';
      if (holiday) {
        status = holiday.payType === 'unpaid' ? 'unpaid_holiday' : 'holiday';
      } else if (approvedLeave) {
        status = 'on_leave';
      } else if (record) {
        status = record.attendanceStatus || (record.totalHours < 5 ? 'half_day' : 'present');
      } else if (isWeeklyOff) {
        status = 'weekly_off';
      } else {
        // If date is in the future compared to demo today
        if (dateStr > todayStr) {
          status = 'scheduled';
        } else {
          status = 'absent';
        }
      }

      days.push({
        dayNumber: d,
        dateStr,
        dayOfWeek,
        isToday: dateStr === todayStr,
        isFuture: dateStr > todayStr,
        holiday,
        record,
        approvedLeave,
        status,
      });
    }

    return days;
  }, [currentYear, currentMonth, totalDaysInMonth, monthHolidays, staffRecords, staffApprovedLeaves]);

  // Summary Metrics Calculation (without double counting)
  const monthlySummary = useMemo(() => {
    let presentCount = 0;
    let lateCount = 0;
    let halfDayCount = 0;
    let absentCount = 0;
    let leaveCount = 0;
    let holidayCount = 0;
    let weeklyOffCount = 0;
    let totalWorkedHours = 0;

    calendarDays.forEach((day) => {
      if (day.status === 'holiday') {
        holidayCount++;
      } else if (day.status === 'on_leave') {
        leaveCount++;
      } else if (day.status === 'weekly_off') {
        weeklyOffCount++;
      } else if (day.status === 'present') {
        presentCount++;
        totalWorkedHours += Number(day.record?.totalHours || 8.5);
      } else if (day.status === 'late') {
        lateCount++;
        totalWorkedHours += Number(day.record?.totalHours || 8.0);
      } else if (day.status === 'half_day') {
        halfDayCount++;
        totalWorkedHours += Number(day.record?.totalHours || 4.5);
      } else if (day.status === 'absent') {
        absentCount++;
      }
    });

    const scheduledWorkingDays = Math.max(0, totalDaysInMonth - weeklyOffCount - holidayCount);
    const pendingLeaves = (leaveRequests || []).filter(
      (l) => l.staffId === activeStaffId && l.status === 'pending'
    ).length;

    return {
      totalDaysInMonth,
      scheduledWorkingDays,
      presentCount,
      lateCount,
      halfDayCount,
      absentCount,
      leaveCount,
      holidayCount,
      weeklyOffCount,
      pendingLeaves,
      totalWorkedHours: totalWorkedHours.toFixed(1),
    };
  }, [calendarDays, totalDaysInMonth, leaveRequests, activeStaffId]);

  // Status Styling Badge Map
  const statusStyles = {
    present: {
      bg: 'bg-emerald-50 text-emerald-900 border-emerald-200/90 hover:bg-emerald-100',
      pill: 'bg-emerald-500 text-white',
      label: 'Present',
    },
    late: {
      bg: 'bg-amber-50 text-amber-900 border-amber-200/90 hover:bg-amber-100',
      pill: 'bg-amber-500 text-white',
      label: 'Late',
    },
    half_day: {
      bg: 'bg-orange-50 text-orange-900 border-orange-200/90 hover:bg-orange-100',
      pill: 'bg-orange-500 text-white',
      label: 'Half Day',
    },
    on_leave: {
      bg: 'bg-blue-50 text-blue-900 border-blue-200/90 hover:bg-blue-100',
      pill: 'bg-blue-500 text-white',
      label: 'On Leave',
    },
    holiday: {
      bg: 'bg-purple-50 text-purple-900 border-purple-200/90 hover:bg-purple-100',
      pill: 'bg-purple-600 text-white',
      label: 'Paid Holiday',
    },
    unpaid_holiday: {
      bg: 'bg-amber-50 text-amber-900 border-amber-200/90 hover:bg-amber-100',
      pill: 'bg-amber-600 text-white',
      label: 'Unpaid Closure',
    },
    weekly_off: {
      bg: 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100',
      pill: 'bg-slate-400 text-white',
      label: 'Weekly Off',
    },
    absent: {
      bg: 'bg-rose-50 text-rose-900 border-rose-200/90 hover:bg-rose-100',
      pill: 'bg-rose-500 text-white',
      label: 'Absent',
    },
    scheduled: {
      bg: 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50',
      pill: 'bg-slate-200 text-slate-500',
      label: 'Shift Scheduled',
    },
  };

  const handleDayClick = (day) => {
    setSelectedDayDetail({
      date: day.dateStr,
      record: day.record,
      holiday: day.holiday,
      employee: activeStaff,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Month Switcher, Legend, and Optional Staff Selector */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Month Navigation & Today Jump */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white transition-all cursor-pointer shadow-2xs"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-3 py-1 font-bold text-sm text-slate-900 flex items-center gap-1.5 min-w-[150px] justify-center">
                <CalendarIcon className="w-4 h-4 text-emerald-600" />
                <span>{monthName} {currentYear}</span>
              </div>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white transition-all cursor-pointer shadow-2xs"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleJumpToToday}
              className="px-3.5 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors cursor-pointer"
            >
              Current Month
            </button>
          </div>

          {/* Optional Staff Selector for Managers & Owners */}
          {showEmployeeSelector && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={activeStaffId}
                onChange={(e) => {
                  setSelectedStaffId(e.target.value);
                  if (onStaffChange) onStaffChange(e.target.value);
                }}
                className="text-xs font-semibold py-2 px-3 rounded-2xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
              >
                {(availableStaff.length > 0 ? availableStaff : branchStaff).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.roleLabel || s.role})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Monthly Summary KPI Cards Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 pt-1">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Working Days</span>
            <span className="text-base font-black text-slate-900 mt-0.5 block">{monthlySummary.scheduledWorkingDays}</span>
            <span className="text-[10px] text-slate-500 font-medium">{monthlySummary.totalDaysInMonth} total days</span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-center">
            <span className="text-[10px] font-bold uppercase text-emerald-700 block tracking-wider">Present</span>
            <span className="text-base font-black text-emerald-900 mt-0.5 block">{monthlySummary.presentCount}</span>
            <span className="text-[10px] text-emerald-600 font-medium">Full shifts</span>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-center">
            <span className="text-[10px] font-bold uppercase text-amber-700 block tracking-wider">Late</span>
            <span className="text-base font-black text-amber-900 mt-0.5 block">{monthlySummary.lateCount}</span>
            <span className="text-[10px] text-amber-600 font-medium">&gt; 30m delay</span>
          </div>

          <div className="p-3 rounded-2xl bg-orange-50 border border-orange-200/80 text-center">
            <span className="text-[10px] font-bold uppercase text-orange-700 block tracking-wider">Half Day</span>
            <span className="text-base font-black text-orange-900 mt-0.5 block">{monthlySummary.halfDayCount}</span>
            <span className="text-[10px] text-orange-600 font-medium">&lt; 5h shifts</span>
          </div>

          <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200/80 text-center">
            <span className="text-[10px] font-bold uppercase text-blue-700 block tracking-wider">On Leave</span>
            <span className="text-base font-black text-blue-900 mt-0.5 block">{monthlySummary.leaveCount}</span>
            <span className="text-[10px] text-blue-600 font-medium">Approved off</span>
          </div>

          <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200/80 text-center">
            <span className="text-[10px] font-bold uppercase text-purple-700 block tracking-wider">Holidays</span>
            <span className="text-base font-black text-purple-900 mt-0.5 block">{monthlySummary.holidayCount}</span>
            <span className="text-[10px] text-purple-600 font-medium">Public &amp; festive</span>
          </div>

          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200/80 text-center">
            <span className="text-[10px] font-bold uppercase text-rose-700 block tracking-wider">Absent</span>
            <span className="text-base font-black text-rose-900 mt-0.5 block">{monthlySummary.absentCount}</span>
            <span className="text-[10px] text-rose-600 font-medium">Unexcused</span>
          </div>

          <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200/80 text-center">
            <span className="text-[10px] font-bold uppercase text-teal-700 block tracking-wider">Worked Hrs</span>
            <span className="text-base font-black text-teal-900 mt-0.5 block">{monthlySummary.totalWorkedHours}</span>
            <span className="text-[10px] text-teal-600 font-medium">Total logged</span>
          </div>
        </div>

        {/* Visual Legend */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Status Legend:</span>
          {Object.entries(statusStyles).filter(([k]) => k !== 'scheduled').map(([key, style]) => (
            <div key={key} className="flex items-center gap-1.5 text-xs text-slate-700">
              <span className={`w-2.5 h-2.5 rounded-full ${style.pill}`} />
              <span className="font-medium text-[11px]">{style.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Interactive 7-Day Column Calendar Grid */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden p-4 sm:p-6">
        {/* Day-of-Week Column Headers (Mon to Sun) */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider py-1">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName, idx) => (
            <div key={idx} className={idx >= 5 ? 'text-amber-700 font-extrabold' : ''}>
              {dayName}
            </div>
          ))}
        </div>

        {/* Days Grid Cells */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty spacer slots for month alignment */}
          {Array.from({ length: startOffset }).map((_, idx) => (
            <div
              key={`empty-${idx}`}
              className="min-h-[90px] sm:min-h-[105px] rounded-2xl bg-slate-50/50 border border-dashed border-slate-150 opacity-40"
            />
          ))}

          {/* Actual Month Days */}
          {calendarDays.map((day) => {
            const style = statusStyles[day.status] || statusStyles.scheduled;

            return (
              <button
                key={day.dayNumber}
                type="button"
                onClick={() => handleDayClick(day)}
                className={`min-h-[90px] sm:min-h-[105px] p-2 sm:p-2.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between relative cursor-pointer group ${style.bg} ${
                  day.isToday ? 'ring-2 ring-emerald-500 ring-offset-2 shadow-md shadow-emerald-500/10' : 'shadow-2xs'
                }`}
              >
                {/* Header: Date number & Today tag */}
                <div className="flex items-center justify-between w-full">
                  <span className={`text-xs sm:text-sm font-black ${day.isToday ? 'text-emerald-700' : 'text-slate-800'}`}>
                    {day.dayNumber}
                  </span>

                  {day.isToday && (
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-emerald-600 text-white uppercase tracking-wider">
                      Today
                    </span>
                  )}

                  {day.record?.isCorrected && (
                    <span title="Audited correction on this record" className="text-indigo-600">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                {/* Body Content */}
                <div className="space-y-1 w-full my-auto">
                  {day.holiday ? (
                    <div
                      className={`text-[10px] font-bold truncate px-1.5 py-0.5 rounded-md ${
                        day.holiday.payType === 'unpaid'
                          ? 'text-amber-950 bg-amber-100 border border-amber-200'
                          : 'text-purple-900 bg-purple-100/90'
                      }`}
                      title={`${day.holiday.name} (${day.holiday.payType === 'unpaid' ? 'Unpaid Closure' : 'Paid Holiday'})`}
                    >
                      🎉 {day.holiday.name} {day.holiday.payType === 'unpaid' ? '(Unpaid)' : ''}
                    </div>
                  ) : day.approvedLeave ? (
                    <div className="text-[10px] font-bold text-blue-900 truncate bg-blue-100/90 px-1.5 py-0.5 rounded-md" title={day.approvedLeave.reason}>
                      🏖️ {day.approvedLeave.leaveType}
                    </div>
                  ) : day.record ? (
                    <div>
                      <div className="text-[10px] font-bold flex items-center justify-between">
                        <span className="truncate">{day.record.station}</span>
                      </div>
                      <div className="text-[11px] font-black font-mono mt-0.5">
                        {day.record.totalHours !== null ? `${day.record.totalHours}h` : (day.record.status === 'active' ? 'Active' : '—')}
                      </div>
                    </div>
                  ) : day.status === 'weekly_off' ? (
                    <div className="text-[10px] font-medium text-slate-500 italic">
                      Weekly Rest
                    </div>
                  ) : day.isFuture ? (
                    <div className="text-[10px] text-slate-400">
                      Scheduled
                    </div>
                  ) : (
                    <div className="text-[10px] font-bold text-rose-700">
                      No Clock-In
                    </div>
                  )}
                </div>

                {/* Footer Status Pill */}
                <div className="w-full flex items-center justify-between">
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${style.pill} truncate max-w-full`}>
                    {style.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Details Modal */}
      {selectedDayDetail && (
        <AttendanceDayDetailModal
          isOpen={Boolean(selectedDayDetail)}
          onClose={() => setSelectedDayDetail(null)}
          date={selectedDayDetail.date}
          record={selectedDayDetail.record}
          holiday={selectedDayDetail.holiday}
          employee={selectedDayDetail.employee}
          canCorrect={canCorrect}
          onOpenCorrection={(rec) => setCorrectionTargetRecord(rec)}
        />
      )}

      {/* Attendance Correction Modal */}
      {correctionTargetRecord && (
        <AttendanceCorrectionModal
          isOpen={Boolean(correctionTargetRecord)}
          onClose={() => setCorrectionTargetRecord(null)}
          record={correctionTargetRecord}
        />
      )}
    </div>
  );
};

