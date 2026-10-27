import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  UserCheck,
  Clock,
  XCircle,
  Calendar,
  AlertTriangle,
  Download,
  ArrowLeftRight,
  ShieldCheck,
  ChefHat,
  Boxes,
  Building2,
  FileText,
  CheckCircle2,
  Bell,
  Search,
  Table,
  BarChart3,
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
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export const StaffReports = ({
  isEmbedded = false,
  externalTimeframe,
  onTimeframeChange,
}) => {
  const {
    currentUser,
    currentBranchId,
    branches,
    organizationStaff,
    attendanceRecords,
    leaveRequests,
    staffTransfers,
    staffAlerts,
    addToast,
  } = useApp();

  // Internal timeframe state if not provided externally
  const [internalTimeframe, setInternalTimeframe] = useState('month');
  const timeframe = externalTimeframe || internalTimeframe;
  const setTimeframe = onTimeframeChange || setInternalTimeframe;

  // Search filter for attendance summary
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [leaveSearch, setLeaveSearch] = useState('');

  // Enforce branch isolation rule:
  // Restaurant Manager can ONLY see their assigned branch.
  // Restaurant Owner sees the actively selected branch (or fallback to Pune Central).
  const targetBranchId = useMemo(() => {
    if (currentUser?.role === 'restaurant_manager') {
      return currentUser.branchId || 'branch-pune-central';
    }
    return currentBranchId || 'branch-pune-central';
  }, [currentUser, currentBranchId]);

  // Current branch details
  const activeBranch = useMemo(() => {
    return (
      (branches || []).find((b) => b.id === targetBranchId) || {
        id: targetBranchId,
        name: 'Pune Central',
      }
    );
  }, [branches, targetBranchId]);

  // Clean branch name without "Spice Garden - " prefix if present
  const branchDisplayName = (activeBranch.name || 'Branch')
    .replace(/^Spice Garden\s*[-—–]\s*/i, '')
    .trim();

  // Filter staff belonging to the active branch
  const branchStaffMembers = useMemo(() => {
    return (organizationStaff || []).filter((s) => s.branchId === targetBranchId);
  }, [organizationStaff, targetBranchId]);

  // Filter leave requests for this branch
  const branchLeaves = useMemo(() => {
    return (leaveRequests || []).filter(
      (l) => !l.branchId || l.branchId === targetBranchId
    );
  }, [leaveRequests, targetBranchId]);

  // Filter transfers involving this branch (either from or to)
  const branchTransfers = useMemo(() => {
    return (staffTransfers || []).filter(
      (t) => t.fromBranchId === targetBranchId || t.toBranchId === targetBranchId
    );
  }, [staffTransfers, targetBranchId]);

  // Attendance summary metrics tailored to the timeframe
  const attendanceMetrics = useMemo(() => {
    const totalWorkingDays = timeframe === 'week' ? 6 : timeframe === 'month' ? 24 : 72;

    return branchStaffMembers.map((staff) => {
      // Find actual logged records for this staff member
      const staffLogs = (attendanceRecords || []).filter(
        (a) => a.staffId === staff.id && (!a.branchId || a.branchId === targetBranchId)
      );

      let daysPresent = totalWorkingDays;
      let lateArrivals = 0;
      let absent = 0;
      let halfDays = 0;
      let avgHoursPerDay = 8.5;

      if (staff.role === 'restaurant_manager') {
        avgHoursPerDay = 9.0;
        if (timeframe === 'quarter') {
          lateArrivals = 1;
          absent = 1;
          daysPresent = totalWorkingDays - 1;
        }
      } else if (staff.role === 'inventory_manager') {
        avgHoursPerDay = 8.8;
        if (timeframe === 'quarter') {
          lateArrivals = 1;
          absent = 1;
          daysPresent = totalWorkingDays - 1;
        }
      } else if (staff.name?.includes('Anita')) {
        // Head Chef
        avgHoursPerDay = 8.7;
        lateArrivals = timeframe === 'week' ? 1 : timeframe === 'month' ? 2 : 4;
        absent = timeframe === 'quarter' ? 2 : 0;
        halfDays = timeframe === 'month' ? 1 : timeframe === 'quarter' ? 2 : 0;
        daysPresent = totalWorkingDays - absent;
      } else if (staff.name?.includes('Karan')) {
        // Sous Chef
        avgHoursPerDay = 8.3;
        lateArrivals = timeframe === 'week' ? 0 : timeframe === 'month' ? 1 : 2;
        absent = timeframe === 'week' ? 0 : timeframe === 'month' ? 1 : 3;
        halfDays = timeframe === 'week' ? 1 : timeframe === 'month' ? 1 : 2;
        daysPresent = totalWorkingDays - absent;
      } else {
        // Default calculation for other staff
        lateArrivals = timeframe === 'week' ? 0 : timeframe === 'month' ? 1 : 2;
        absent = timeframe === 'quarter' ? 1 : 0;
        daysPresent = totalWorkingDays - absent;
      }

      const totalHours = Number((daysPresent * avgHoursPerDay - halfDays * 4).toFixed(1));
      const scheduledDays = totalWorkingDays;
      const attendanceRate = Math.min(
        100,
        Math.max(0, Math.round(((daysPresent - halfDays * 0.5) / scheduledDays) * 100))
      );

      return {
        id: staff.id,
        name: staff.name,
        role: staff.roleLabel || staff.role,
        rawRole: staff.role,
        email: staff.email,
        avatar: staff.avatar,
        daysPresent,
        lateArrivals,
        absent,
        halfDays,
        totalHours,
        attendanceRate,
        logCount: staffLogs.length,
      };
    });
  }, [branchStaffMembers, attendanceRecords, targetBranchId, timeframe]);

  // Filtered attendance records based on search input
  const filteredAttendance = useMemo(() => {
    if (!attendanceSearch.trim()) return attendanceMetrics;
    const query = attendanceSearch.toLowerCase();
    return attendanceMetrics.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.role.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query)
    );
  }, [attendanceMetrics, attendanceSearch]);

  // Overall KPI Card Summary calculations
  const totalStaffCount = branchStaffMembers.length;

  const presentTodayCount = useMemo(() => {
    const todayLogs = (attendanceRecords || []).filter((a) => {
      const isBranchMatch = !a.branchId || a.branchId === targetBranchId;
      const isToday =
        a.date === '2026-10-24' ||
        (a.punchInTime && a.punchInTime.startsWith('2026-10-24'));
      return isBranchMatch && isToday && a.status === 'active';
    });
    return todayLogs.length > 0 ? todayLogs.length : Math.min(2, totalStaffCount);
  }, [attendanceRecords, targetBranchId, totalStaffCount]);

  const totalLateArrivals = useMemo(() => {
    return attendanceMetrics.reduce((acc, curr) => acc + curr.lateArrivals, 0);
  }, [attendanceMetrics]);

  const totalAbsent = useMemo(() => {
    return attendanceMetrics.reduce((acc, curr) => acc + curr.absent, 0);
  }, [attendanceMetrics]);

  const onLeaveCount = useMemo(() => {
    const todayStr = '2026-10-24';
    return branchLeaves.filter(
      (l) => l.status === 'approved' && l.startDate <= todayStr && l.endDate >= todayStr
    ).length;
  }, [branchLeaves]);

  const pendingLeaveRequestsCount = useMemo(() => {
    return branchLeaves.filter((l) => l.status === 'pending').length;
  }, [branchLeaves]);

  // Filtered Leave requests based on search input
  const filteredLeaves = useMemo(() => {
    if (!leaveSearch.trim()) return branchLeaves;
    const q = leaveSearch.toLowerCase();
    return branchLeaves.filter(
      (l) =>
        l.staffName?.toLowerCase().includes(q) ||
        l.leaveType?.toLowerCase().includes(q) ||
        l.status?.toLowerCase().includes(q)
    );
  }, [branchLeaves, leaveSearch]);

  // Trends Chart & Table Data: Late Arrivals & Absences
  const trendsData = useMemo(() => {
    let rawPeriods = [];
    if (timeframe === 'week') {
      rawPeriods = [
        { period: 'Monday', code: 'Mon', late: 0, absent: 0, scheduled: totalStaffCount },
        { period: 'Tuesday', code: 'Tue', late: 0, absent: 0, scheduled: totalStaffCount },
        { period: 'Wednesday', code: 'Wed', late: 0, absent: 0, scheduled: totalStaffCount },
        { period: 'Thursday', code: 'Thu', late: 1, absent: 0, scheduled: totalStaffCount },
        { period: 'Friday', code: 'Fri', late: 0, absent: 0, scheduled: totalStaffCount },
        { period: 'Saturday', code: 'Sat', late: 0, absent: 0, scheduled: totalStaffCount },
        { period: 'Sunday', code: 'Sun', late: 0, absent: 0, scheduled: totalStaffCount },
      ];
    } else if (timeframe === 'month') {
      rawPeriods = [
        { period: 'Week 1 (Oct 1 - Oct 7)', code: 'Week 1', late: 1, absent: 0, scheduled: totalStaffCount * 6 },
        { period: 'Week 2 (Oct 8 - Oct 14)', code: 'Week 2', late: 0, absent: 1, scheduled: totalStaffCount * 6 },
        { period: 'Week 3 (Oct 15 - Oct 21)', code: 'Week 3', late: 1, absent: 0, scheduled: totalStaffCount * 6 },
        { period: 'Week 4 (Oct 22 - Oct 28)', code: 'Week 4', late: 1, absent: 0, scheduled: totalStaffCount * 6 },
      ];
    } else {
      rawPeriods = [
        { period: 'August 2026', code: 'Aug 2026', late: 2, absent: 1, scheduled: totalStaffCount * 24 },
        { period: 'September 2026', code: 'Sep 2026', late: 3, absent: 2, scheduled: totalStaffCount * 24 },
        { period: 'October 2026', code: 'Oct 2026', late: 3, absent: 1, scheduled: totalStaffCount * 24 },
      ];
    }

    return rawPeriods.map((item) => {
      const onTime = Math.max(0, item.scheduled - item.late - item.absent);
      const compliance = item.scheduled > 0
        ? Math.round(((item.scheduled - item.absent - item.late * 0.5) / item.scheduled) * 100)
        : 100;

      let status = '100% On-Time';
      if (item.absent > 0) status = 'Absence Logged';
      else if (item.late > 0) status = 'Late Shift Delay';

      return {
        ...item,
        onTime,
        compliance,
        status,
      };
    });
  }, [timeframe, totalStaffCount]);

  // Staff by Role Distribution enriched with Station Info & Schedules
  const roleDistribution = useMemo(() => {
    const counts = {};
    branchStaffMembers.forEach((member) => {
      const roleKey = member.roleLabel || member.role || 'Staff';
      counts[roleKey] = (counts[roleKey] || 0) + 1;
    });

    return Object.entries(counts).map(([roleName, count]) => {
      const percentage = totalStaffCount > 0 ? Math.round((count / totalStaffCount) * 100) : 0;
      let shift = '09:00 AM – 06:00 PM';
      let station = 'General Kitchen Station';
      let staffingStatus = 'Fully Staffed';

      if (roleName.toLowerCase().includes('head chef')) {
        shift = '08:00 AM – 05:00 PM';
        station = 'Hot Line & Recipe Pass';
      } else if (roleName.toLowerCase().includes('sous chef')) {
        shift = '12:00 PM – 09:00 PM';
        station = 'Prep & Expediter Station';
      } else if (roleName.toLowerCase().includes('manager')) {
        shift = '09:00 AM – 06:30 PM';
        station = 'Branch Office & Floor Operations';
      } else if (roleName.toLowerCase().includes('inventory')) {
        shift = '07:30 AM – 04:30 PM';
        station = 'Receiving Dock & Cold Storage';
      } else {
        shift = '11:00 AM – 08:00 PM';
        station = 'Line Cooking & Station Prep';
      }

      return {
        roleName,
        count,
        percentage,
        shift,
        station,
        staffingStatus,
      };
    });
  }, [branchStaffMembers, totalStaffCount]);

  // Staff Notices & Recent Transfers
  const noticesAndTransfers = useMemo(() => {
    const items = [];

    // Add branch transfers
    branchTransfers.forEach((tr) => {
      items.push({
        id: tr.id,
        type: 'Transfer Request',
        title: tr.employeeName,
        route: `${tr.fromBranchName} → ${tr.toBranchName}`,
        detail: tr.reason || 'Operational branch staff balancing',
        date: tr.requestDate || '2026-10-22',
        status: tr.status || 'Pending',
        author: tr.requestedBy || 'Branch Manager',
      });
    });

    // Add recent staff notices / leave alerts
    (staffAlerts || []).slice(0, 4).forEach((alert) => {
      items.push({
        id: alert.id,
        type: 'Staff Notice',
        title: alert.title,
        route: activeBranch.name,
        detail: alert.message,
        date: '2026-10-24',
        status: alert.severity === 'high' ? 'High Priority' : 'Acknowledged',
        author: 'Operations Desk',
      });
    });

    return items;
  }, [branchTransfers, staffAlerts, activeBranch]);

  // Export Staff Report to CSV
  const handleExportCSV = () => {
    try {
      const periodLabel = timeframe.toUpperCase();
      const rows = [];

      // Metadata Header
      rows.push(['STOCKMATE SAAS - STAFF OPERATIONS & ATTENDANCE REPORT']);
      rows.push(['Branch:', activeBranch.name]);
      rows.push(['Reporting Period:', periodLabel]);
      rows.push(['Generated Date:', new Date().toLocaleDateString()]);
      rows.push([]);

      // Section 1: Staff Attendance Summary
      rows.push(['--- STAFF ATTENDANCE SUMMARY ---']);
      rows.push([
        'Staff Name',
        'Role',
        'Days Present',
        'Late Arrivals',
        'Absent',
        'Half Days',
        'Total Hours',
        'Attendance Rate (%)',
      ]);
      attendanceMetrics.forEach((m) => {
        rows.push([
          `"${m.name}"`,
          `"${m.role}"`,
          m.daysPresent,
          m.lateArrivals,
          m.absent,
          m.halfDays,
          m.totalHours,
          `${m.attendanceRate}%`,
        ]);
      });
      rows.push([]);

      // Section 2: Trends Summary
      rows.push(['--- PUNCTUALITY & ATTENDANCE TRENDS ---']);
      rows.push(['Period', 'Scheduled Shifts', 'On-Time Staff', 'Late Arrivals', 'Absences', 'Compliance (%)', 'Status']);
      trendsData.forEach((t) => {
        rows.push([`"${t.period}"`, t.scheduled, t.onTime, t.late, t.absent, `${t.compliance}%`, `"${t.status}"`]);
      });
      rows.push([]);

      // Section 3: Staff Leave Records
      rows.push(['--- STAFF LEAVE RECORDS & BALANCES ---']);
      rows.push([
        'Staff Name',
        'Leave Type',
        'From Date',
        'To Date',
        'Duration (Days)',
        'Status',
        'Remaining Balance',
      ]);
      branchLeaves.forEach((l) => {
        rows.push([
          `"${l.staffName}"`,
          `"${l.leaveType}"`,
          l.startDate,
          l.endDate,
          l.durationDays,
          l.status,
          '15 / 18 days left',
        ]);
      });
      rows.push([]);

      // Section 4: Role Distribution
      rows.push(['--- BRANCH HEADCOUNT BY ROLE & STATION ---']);
      rows.push(['Role', 'Headcount', 'Shift Standard', 'Assigned Station', 'Percentage']);
      roleDistribution.forEach((r) => {
        rows.push([`"${r.roleName}"`, r.count, `"${r.shift}"`, `"${r.station}"`, `${r.percentage}%`]);
      });

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        rows.map((e) => (Array.isArray(e) ? e.join(',') : e)).join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute(
        'download',
        `Staff_Report_${branchDisplayName.replace(/\s+/g, '_')}_${timeframe}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addToast('Staff reports exported to CSV successfully.', 'success');
    } catch (err) {
      console.error('CSV Export Error:', err);
      addToast('Failed to export CSV report.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Standalone Page Header for Restaurant Manager */}
      {!isEmbedded && (
        <PageHeader
          title="Staff Reports & Attendance Audits"
          subtitle="Tabular rosters, punctuality trends, leave balance tracking, and inter-branch movement logs"
          breadcrumbs={[
            { label: 'Restaurant', href: '#/dashboard' },
            { label: 'Staff Reports' },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                {['week', 'month', 'quarter'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeframe(t)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase transition-all ${
                      timeframe === t
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t}
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
      )}

      {/* Embedded Controls Header if viewed inside Owner's Tab */}
      {isEmbedded && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base">
                Staff Operations & Attendance Reports
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                {branchDisplayName} Branch
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Attendance records, leave balance tracking and roster compliance for {branchDisplayName}.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
              {['week', 'month', 'quarter'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase transition-all ${
                    timeframe === t
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={handleExportCSV}
            >
              Export Staff Data (CSV)
            </Button>
          </div>
        </div>
      )}

      {/* 1. Summary Cards (6 KPIs) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Total Staff"
          value={totalStaffCount}
          subtext="Branch team members"
          icon={Users}
          accentColor="blue"
        />
        <StatCard
          title="Present Today"
          value={presentTodayCount}
          subtext="Clocked in on duty"
          icon={UserCheck}
          accentColor="emerald"
        />
        <StatCard
          title="Late Arrivals"
          value={totalLateArrivals}
          subtext={`This ${timeframe}`}
          icon={Clock}
          accentColor="amber"
        />
        <StatCard
          title="Absent"
          value={totalAbsent}
          subtext={`This ${timeframe}`}
          icon={XCircle}
          accentColor="rose"
        />
        <StatCard
          title="On Leave"
          value={onLeaveCount}
          subtext="Approved off-duty today"
          icon={Calendar}
          accentColor="purple"
        />
        <StatCard
          title="Pending Leaves"
          value={pendingLeaveRequestsCount}
          subtext="Awaiting review"
          icon={AlertTriangle}
          accentColor="amber"
        />
      </div>

      {/* Table 1: Late & Absent Trends Audit Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Punctuality & Attendance Trends Table
              </h3>
              <p className="text-xs text-slate-500">
                Scheduled shifts, punctual arrivals, and exceptions logged across the {timeframe}
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-auto">
            Period: {timeframe.toUpperCase()}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Shift Period</th>
                <th className="py-3 px-4 text-center">Scheduled Shifts</th>
                <th className="py-3 px-4 text-center">On-Time Staff</th>
                <th className="py-3 px-4 text-center">Late Arrivals</th>
                <th className="py-3 px-4 text-center">Absences</th>
                <th className="py-3 px-4 text-center">Punctuality Compliance Rate</th>
                <th className="py-3 px-4 text-center">Shift Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {trendsData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {row.period}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-800">
                    {row.scheduled} shifts
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-700">
                    {row.onTime}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.late > 0 ? (
                      <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        {row.late}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono">0</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.absent > 0 ? (
                      <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                        {row.absent}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono">0</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        row.compliance >= 95
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : row.compliance >= 85
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" /> {row.compliance}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-[11px] text-slate-600 font-medium">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50/90 font-bold border-t border-slate-200 text-xs">
              <tr>
                <td className="py-3 px-4 text-slate-900 font-extrabold uppercase text-[11px]">
                  Total {timeframe.toUpperCase()} Shift Records
                </td>
                <td className="py-3 px-4 text-center font-extrabold text-slate-900">
                  {trendsData.reduce((acc, t) => acc + t.scheduled, 0)} Shifts
                </td>
                <td className="py-3 px-4 text-center font-extrabold text-emerald-700">
                  {trendsData.reduce((acc, t) => acc + t.onTime, 0)}
                </td>
                <td className="py-3 px-4 text-center font-extrabold text-amber-600">
                  {trendsData.reduce((acc, t) => acc + t.late, 0)}
                </td>
                <td className="py-3 px-4 text-center font-extrabold text-rose-600">
                  {trendsData.reduce((acc, t) => acc + t.absent, 0)}
                </td>
                <td className="py-3 px-4 text-center font-extrabold text-emerald-800">
                  {Math.round(
                    trendsData.reduce((acc, t) => acc + t.compliance, 0) / (trendsData.length || 1)
                  )}% Average
                </td>
                <td className="py-3 px-4 text-center text-emerald-800 text-[11px] font-bold">
                  SLA Compliance Maintained
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Table 2: Staff Headcount & Station Allocation Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <ChefHat className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Staff Headcount & Station Allocation Table
              </h3>
              <p className="text-xs text-slate-500">
                Assigned station coverage, standard operational shifts, and role distribution for {branchDisplayName}
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
            {totalStaffCount} Active Team Members
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Role Title / Designation</th>
                <th className="py-3 px-4 text-center">Active Headcount</th>
                <th className="py-3 px-4">Standard Shift Timing</th>
                <th className="py-3 px-4">Assigned Workstation</th>
                <th className="py-3 px-4 text-right">Headcount Share</th>
                <th className="py-3 px-4 text-center">Coverage Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {roleDistribution.map((role, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900">{role.roleName}</span>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-900">
                    {role.count} {role.count === 1 ? 'member' : 'members'}
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-mono text-[11px]">
                    {role.shift}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 text-[11px]">
                      {role.station}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-800">
                    {role.percentage}%
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> {role.staffingStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50/90 font-bold border-t border-slate-200 text-xs">
              <tr>
                <td className="py-3 px-4 text-slate-900 font-extrabold uppercase text-[11px]">
                  Total Assigned Team
                </td>
                <td className="py-3 px-4 text-center font-extrabold text-slate-900">
                  {totalStaffCount} Members
                </td>
                <td colSpan={2} className="py-3 px-4 text-slate-500 font-normal text-[11px]">
                  Full coverage across kitchen, receiving dock, and service floor
                </td>
                <td className="py-3 px-4 text-right font-extrabold text-emerald-800">
                  100%
                </td>
                <td className="py-3 px-4 text-center text-emerald-700 text-[11px]">
                  Optimal Manning
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Table 3: Staff Attendance Summary Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-800" />
              <h3 className="font-bold text-slate-900 text-sm">Staff Attendance Ledger Table</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Detailed punctuality, hours rendered, and attendance percentage for {branchDisplayName} ({timeframe})
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff name or role..."
              value={attendanceSearch}
              onChange={(e) => setAttendanceSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredAttendance.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No staff attendance data found matching your query.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4 text-center">Days Present</th>
                  <th className="py-3 px-4 text-center">Late</th>
                  <th className="py-3 px-4 text-center">Absent</th>
                  <th className="py-3 px-4 text-center">Half Days</th>
                  <th className="py-3 px-4 text-right">Total Hours</th>
                  <th className="py-3 px-4 text-right">Attendance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAttendance.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={m.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                          alt={m.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{m.name}</div>
                          <div className="text-[11px] text-slate-400">{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={m.rawRole}>{m.role}</Badge>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-800">
                      {m.daysPresent}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {m.lateArrivals > 0 ? (
                        <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          {m.lateArrivals}
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {m.absent > 0 ? (
                        <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                          {m.absent}
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-600 font-medium">
                      {m.halfDays}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {m.totalHours} hrs
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          m.attendanceRate >= 95
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : m.attendanceRate >= 85
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {m.attendanceRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50/90 font-bold border-t border-slate-200 text-xs">
                <tr>
                  <td colSpan={2} className="py-3 px-4 text-slate-900 font-extrabold uppercase text-[11px]">
                    Branch Roster Summary ({filteredAttendance.length} Staff)
                  </td>
                  <td className="py-3 px-4 text-center font-extrabold text-slate-900">
                    {filteredAttendance.reduce((acc, m) => acc + m.daysPresent, 0)} days
                  </td>
                  <td className="py-3 px-4 text-center font-extrabold text-amber-600">
                    {filteredAttendance.reduce((acc, m) => acc + m.lateArrivals, 0)}
                  </td>
                  <td className="py-3 px-4 text-center font-extrabold text-rose-600">
                    {filteredAttendance.reduce((acc, m) => acc + m.absent, 0)}
                  </td>
                  <td className="py-3 px-4 text-center font-extrabold text-slate-700">
                    {filteredAttendance.reduce((acc, m) => acc + m.halfDays, 0)}
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                    {filteredAttendance.reduce((acc, m) => acc + m.totalHours, 0).toFixed(1)} hrs
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold text-emerald-800">
                    {Math.round(
                      filteredAttendance.reduce((acc, m) => acc + m.attendanceRate, 0) /
                        (filteredAttendance.length || 1)
                    )}%
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>

      {/* Table 4 & Table 5 Grid: Leave Records Table & Staff Notices/Transfers Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table 4: Leave Report Table */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden h-full flex flex-col justify-between">
            <div>
              <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-800" />
                    <h3 className="font-bold text-slate-900 text-sm">Leave Records & Balance Quota Table</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Time-off requests, duration, and remaining annual balances
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 self-start sm:self-auto">
                  Annual Quota: 18 Days
                </span>
              </div>

              <div className="overflow-x-auto">
                {filteredLeaves.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No leave requests found for this period.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                        <th className="py-3 px-4">Staff Member</th>
                        <th className="py-3 px-4">Leave Type</th>
                        <th className="py-3 px-4">Duration & Window</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-right">Remaining Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredLeaves.map((leave) => {
                        const remainingDays = Math.max(
                          0,
                          18 - (leave.status === 'approved' ? leave.durationDays : 0)
                        );
                        return (
                          <tr key={leave.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900">
                                {leave.staffName}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {leave.staffRole || 'Branch Staff'}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-semibold text-slate-800">
                                {leave.leaveType}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-medium text-slate-700">
                                {leave.startDate} to {leave.endDate}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {leave.durationDays} day(s) requested
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  leave.status === 'approved'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : leave.status === 'pending'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {leave.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className="font-semibold text-slate-900">
                                {remainingDays} / 18 days
                              </span>
                              <div className="text-[10px] text-slate-400">
                                Balance left
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-slate-50/90 font-bold border-t border-slate-200 text-xs">
                      <tr>
                        <td colSpan={3} className="py-3 px-4 text-slate-900 uppercase text-[11px] font-extrabold">
                          Total {filteredLeaves.length} Requests Handled
                        </td>
                        <td className="py-3 px-4 text-center text-emerald-800 font-extrabold">
                          {filteredLeaves.filter(l => l.status === 'approved').length} Approved
                        </td>
                        <td className="py-3 px-4 text-right text-slate-500 font-normal text-[11px]">
                          Annual cycle resets April 1
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
              Paid casual and sick leaves reset on annual financial year cycle.
            </div>
          </div>
        </div>

        {/* Table 5: Staff Notices & Inter-Branch Transfers Table */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden h-full flex flex-col justify-between">
            <div>
              <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <ArrowLeftRight className="w-4 h-4 text-emerald-800" />
                    <h3 className="font-bold text-slate-900 text-sm">Staff Notices & Transfers Table</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Inter-branch relocations and operational shift notices
                  </p>
                </div>
                <span className="text-xs text-slate-500">
                  {noticesAndTransfers.length} Logged Events
                </span>
              </div>

              <div className="overflow-x-auto">
                {noticesAndTransfers.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No transfer or notice records logged.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                        <th className="py-3 px-4">Event Type</th>
                        <th className="py-3 px-4">Subject / Staff Member</th>
                        <th className="py-3 px-4">Transfer Route / Station</th>
                        <th className="py-3 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {noticesAndTransfers.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                item.type.includes('Transfer')
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {item.type.includes('Transfer') ? (
                                <ArrowLeftRight className="w-3 h-3" />
                              ) : (
                                <Bell className="w-3 h-3" />
                              )}
                              {item.type}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5 font-mono">{item.date}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{item.title}</div>
                            <div className="text-[11px] text-slate-500 max-w-xs">{item.detail}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-[11px] font-semibold text-slate-800">{item.route}</div>
                            <div className="text-[10px] text-slate-400">By: {item.author}</div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                item.status === 'Approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : item.status === 'Pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50/90 font-bold border-t border-slate-200 text-xs">
                      <tr>
                        <td colSpan={2} className="py-3 px-4 text-slate-900 uppercase text-[11px] font-extrabold">
                          Transfer Audits Logged
                        </td>
                        <td colSpan={2} className="py-3 px-4 text-right text-slate-500 font-normal text-[11px]">
                          Authorized by Restaurant Owner
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
              Inter-branch transfers require authorization from the Restaurant Owner.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
