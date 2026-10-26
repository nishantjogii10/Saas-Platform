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

      // Determine realistic baseline metrics per staff member scaled to timeframe
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

  // Present today: active records in attendanceRecords for this branch
  const presentTodayCount = useMemo(() => {
    const todayLogs = (attendanceRecords || []).filter((a) => {
      const isBranchMatch = !a.branchId || a.branchId === targetBranchId;
      const isToday =
        a.date === '2026-10-24' ||
        (a.punchInTime && a.punchInTime.startsWith('2026-10-24'));
      return isBranchMatch && isToday && a.status === 'active';
    });
    // Default to minimum 2 active kitchen staff if records exist
    return todayLogs.length > 0 ? todayLogs.length : Math.min(2, totalStaffCount);
  }, [attendanceRecords, targetBranchId, totalStaffCount]);

  const totalLateArrivals = useMemo(() => {
    return attendanceMetrics.reduce((acc, curr) => acc + curr.lateArrivals, 0);
  }, [attendanceMetrics]);

  const totalAbsent = useMemo(() => {
    return attendanceMetrics.reduce((acc, curr) => acc + curr.absent, 0);
  }, [attendanceMetrics]);

  // On leave today: check approved leaves that overlap with current date
  const onLeaveCount = useMemo(() => {
    const todayStr = '2026-10-24';
    return branchLeaves.filter(
      (l) => l.status === 'approved' && l.startDate <= todayStr && l.endDate >= todayStr
    ).length;
  }, [branchLeaves]);

  const pendingLeaveRequestsCount = useMemo(() => {
    return branchLeaves.filter((l) => l.status === 'pending').length;
  }, [branchLeaves]);

  // Trends Chart Data: Late Arrivals & Absences
  const trendsChartData = useMemo(() => {
    if (timeframe === 'week') {
      return [
        { period: 'Mon', late: 0, absent: 0 },
        { period: 'Tue', late: 0, absent: 0 },
        { period: 'Wed', late: 0, absent: 0 },
        { period: 'Thu', late: 1, absent: 0 },
        { period: 'Fri', late: 0, absent: 0 },
        { period: 'Sat', late: 0, absent: 0 },
        { period: 'Sun', late: 0, absent: 0 },
      ];
    } else if (timeframe === 'month') {
      return [
        { period: 'Week 1', late: 1, absent: 0 },
        { period: 'Week 2', late: 0, absent: 1 },
        { period: 'Week 3', late: 1, absent: 0 },
        { period: 'Week 4', late: 1, absent: 0 },
      ];
    } else {
      // quarter
      return [
        { period: 'Aug 2026', late: 2, absent: 1 },
        { period: 'Sep 2026', late: 3, absent: 2 },
        { period: 'Oct 2026', late: 3, absent: 1 },
      ];
    }
  }, [timeframe]);

  // Staff by Role Distribution
  const roleDistribution = useMemo(() => {
    const counts = {};
    branchStaffMembers.forEach((member) => {
      const roleKey = member.roleLabel || member.role || 'Staff';
      counts[roleKey] = (counts[roleKey] || 0) + 1;
    });

    return Object.entries(counts).map(([roleName, count]) => ({
      roleName,
      count,
      percentage: totalStaffCount > 0 ? Math.round((count / totalStaffCount) * 100) : 0,
    }));
  }, [branchStaffMembers, totalStaffCount]);

  // Staff Notices & Recent Transfers
  const noticesAndTransfers = useMemo(() => {
    const items = [];

    // Add branch transfers
    branchTransfers.forEach((tr) => {
      items.push({
        id: tr.id,
        type: 'transfer',
        title: `Transfer Request: ${tr.employeeName}`,
        detail: `${tr.fromBranchName} → ${tr.toBranchName} • "${tr.reason}"`,
        date: tr.requestDate || '2026-10-22',
        status: tr.status,
        author: tr.requestedBy,
      });
    });

    // Add recent staff notices / leave alerts
    (staffAlerts || []).slice(0, 3).forEach((alert) => {
      items.push({
        id: alert.id,
        type: 'notice',
        title: alert.title,
        detail: alert.message,
        date: '2026-10-24',
        status: alert.severity === 'high' ? 'High Priority' : 'Notice',
        author: 'Operations Desk',
      });
    });

    return items;
  }, [branchTransfers, staffAlerts]);

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

      // Section 2: Staff Leave Records
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

      // Section 3: Role Distribution
      rows.push(['--- BRANCH HEADCOUNT BY ROLE ---']);
      rows.push(['Role', 'Headcount', 'Percentage']);
      roleDistribution.forEach((r) => {
        rows.push([`"${r.roleName}"`, r.count, `${r.percentage}%`]);
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
          title="Staff Reports"
          subtitle="Attendance, leaves and staff activity for your branch."
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
                Export Report
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
              Export Staff Data
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

      {/* 2. Main Analytics Grid: Trends & Team Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Section c: Late and Absent Trends Chart */}
        <div className="lg:col-span-8">
          <Card padding={false} className="h-full flex flex-col justify-between">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-700" /> Late & Absent Trends
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Punctuality exceptions recorded across the selected {timeframe}
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                Period: {timeframe.toUpperCase()}
              </span>
            </div>

            <div className="p-5 h-72 w-full">
              {trendsChartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No trend data available for this period.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={trendsChartData}
                    margin={{ top: 15, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis
                      dataKey="period"
                      stroke="#94A3B8"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#94A3B8"
                      fontSize={11}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E2E8F0',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      iconType="circle"
                      wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
                    />
                    <Bar
                      name="Late Arrivals"
                      dataKey="late"
                      fill="#F59E0B"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={32}
                    />
                    <Bar
                      name="Absences"
                      dataKey="absent"
                      fill="#F43F5E"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
              <span>Shift standard: 9-hour operational block</span>
              <span className="font-medium text-emerald-800">
                Punctuality Index: {totalLateArrivals === 0 ? '100% On Time' : `${Math.max(88, 100 - totalLateArrivals * 3)}% Compliance`}
              </span>
            </div>
          </Card>
        </div>

        {/* Section d: Staff by Role */}
        <div className="lg:col-span-4">
          <Card padding={false} className="h-full flex flex-col justify-between">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-emerald-700" /> Staff by Role
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Headcount breakdown across branch stations
              </p>
            </div>

            <div className="p-5 space-y-4">
              {roleDistribution.length === 0 ? (
                <div className="text-xs text-slate-400 text-center py-8">
                  No staff registered for this branch.
                </div>
              ) : (
                roleDistribution.map((role) => (
                  <div key={role.roleName} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-800">
                        {role.roleName}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">
                          {role.count} {role.count === 1 ? 'member' : 'members'}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          ({role.percentage}%)
                        </span>
                      </div>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-700 h-full rounded-full transition-all duration-300"
                        style={{ width: `${role.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Total Assigned Headcount</span>
              <span className="font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                {totalStaffCount} Active Staff
              </span>
            </div>
          </Card>
        </div>
      </div>

      {/* Section a: Staff Attendance Summary Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-800" /> Attendance Summary
            </h3>
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
              No staff attendance data for this period.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
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
                  <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
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
            </table>
          )}
        </div>
      </div>

      {/* Grid: Leave Report & Notices / Transfers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Section b: Leave Report Table */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden h-full flex flex-col justify-between">
            <div>
              <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-800" /> Leave Records & Balances
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Time-off requests, approval status, and remaining quota
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800">
                  Annual Quota: 18 Days
                </span>
              </div>

              <div className="overflow-x-auto">
                {branchLeaves.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No staff data for this period.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
                        <th className="py-2.5 px-3">Staff Name</th>
                        <th className="py-2.5 px-3">Leave Type</th>
                        <th className="py-2.5 px-3">Duration</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                        <th className="py-2.5 px-3 text-right">Remaining Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {branchLeaves.map((leave) => {
                        const remainingDays = Math.max(
                          0,
                          18 - (leave.status === 'approved' ? leave.durationDays : 0)
                        );
                        return (
                          <tr key={leave.id} className="hover:bg-slate-50/60">
                            <td className="py-3 px-3">
                              <div className="font-bold text-slate-900">
                                {leave.staffName}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {leave.staffRole || 'Branch Staff'}
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-semibold text-slate-800">
                                {leave.leaveType}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-medium text-slate-700">
                                {leave.startDate} to {leave.endDate}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {leave.durationDays} day(s) requested
                              </div>
                            </td>
                            <td className="py-3 px-3 text-center">
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
                            <td className="py-3 px-3 text-right">
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
                  </table>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
              Paid casual leaves reset on annual financial year cycle.
            </div>
          </div>
        </div>

        {/* Section e: Staff Notices and Transfers */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden h-full flex flex-col justify-between">
            <div>
              <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <ArrowLeftRight className="w-4 h-4 text-emerald-800" /> Staff Notices & Transfers
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Recent inter-branch movements and operational notices
                  </p>
                </div>
                <span className="text-xs text-slate-500">
                  {noticesAndTransfers.length} Recent
                </span>
              </div>

              <div className="p-4 divide-y divide-slate-100">
                {noticesAndTransfers.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No staff data for this period.
                  </div>
                ) : (
                  noticesAndTransfers.map((item) => (
                    <div key={item.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                              item.type === 'transfer'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {item.type === 'transfer' ? (
                              <ArrowLeftRight className="w-3.5 h-3.5" />
                            ) : (
                              <Bell className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <span className="font-bold text-slate-900 text-xs">
                            {item.title}
                          </span>
                        </div>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                            item.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'Pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] pl-8">
                        {item.detail}
                      </p>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 pl-8 pt-0.5">
                        <span>Date: {item.date}</span>
                        <span>Source: {item.author}</span>
                      </div>
                    </div>
                  ))
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

