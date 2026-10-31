import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useApp, isHolidayApplicableToStaff } from '../../context/AppContext';
import {
  Users,
  UserCheck,
  Building2,
  Store,
  Plus,
  Search,
  Filter,
  ShieldCheck,
  Edit2,
  Trash2,
  Star,
  CheckCircle2,
  Phone,
  Mail,
  Key,
  Calendar,
  AlertTriangle,
  Lock,
  Clock,
  IndianRupee,
  Receipt,
  XCircle,
  Eye,
  Send,
  Sparkles,
  Timer,
  Check,
  X,
  History,
  FileText,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { FormInput } from '../../components/common/FormInput';
import { BRANCH_PLANS_CONFIG } from '../../data/branchData';
import { formatINR } from '../../data/financeData';
import { ProcessSalaryModal } from '../../components/restaurant/ProcessSalaryModal';
import { MonthlyAttendanceCalendar } from '../../components/attendance/MonthlyAttendanceCalendar';
import { AttendanceCorrectionModal } from '../../components/attendance/AttendanceCorrectionModal';
import { HolidayManagerModal } from '../../components/attendance/HolidayManagerModal';
import { HolidayDetailsModal } from '../../components/attendance/HolidayDetailsModal';
import { LeaveRequestModal } from '../../components/kitchen/LeaveRequestModal';
import { PunchClockWidget } from '../../components/kitchen/PunchClockWidget';
import { CalendarDays, Palmtree, Coffee, ChevronLeft, ChevronRight } from 'lucide-react';
import { SalarySlipModal } from '../../components/kitchen/SalarySlipModal';
import { ColumnExportDialog } from '../../components/common/ColumnExportDialog';
import { ExcelImportDialog } from '../../components/common/ExcelImportDialog';
import { Download, UploadCloud } from 'lucide-react';

export const WorkforcePage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { leaveId: paramLeaveId } = useParams();
  const initialLeaveId = paramLeaveId || searchParams.get('leaveId') || null;
  const [reviewingLeaveId, setReviewingLeaveId] = useState(initialLeaveId);
  const [reviewNotes, setReviewNotes] = useState('');

  const {
    branches,
    currentBranchId,
    currentBranch,
    currentUser,
    branchStaff,
    addBranchStaffMember,
    removeBranchStaffMember,
    assignBranchManager,
    attendanceRecords,
    leaveRequests,
    reviewLeaveRequest,
    holidays,
    salaryPayments,
    STAFF_SALARY_PROFILES,
    importStaffBulk,
    addToast,
  } = useApp();

  const isManager = currentUser?.role === 'restaurant_manager';
  const assignedBranchId = currentUser?.branchId || currentBranchId || 'branch-pune-central';
  const ATTENDANCE_PER_PAGE = 8;

  const branchHolidays = useMemo(() => {
    return (holidays || []).filter((h) => {
      if (h.status === 'cancelled') return false;
      if (isManager && h.scope !== 'all' && h.branchId && h.branchId !== assignedBranchId) {
        return false;
      }
      return true;
    });
  }, [holidays, isManager, assignedBranchId]);
  const branchHolidaysCount = branchHolidays.length;
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [viewingHoliday, setViewingHoliday] = useState(null);
  const [correctingRecord, setCorrectingRecord] = useState(null);
  const [isManagerLeaveModalOpen, setIsManagerLeaveModalOpen] = useState(false);
  const [attendanceSearchTerm, setAttendanceSearchTerm] = useState('');
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState('all');
  const [attendanceDateFilter, setAttendanceDateFilter] = useState('');
  const [attendancePage, setAttendancePage] = useState(1);
  const [isAttendanceExportOpen, setIsAttendanceExportOpen] = useState(false);

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Tab Normalizer: supports 'roster', 'attendance'/'timesheet', 'calendar', 'leave', 'payroll'
  const normalizeTab = (t) => {
    if (!t) return 'roster';
    const lower = t.toLowerCase().trim();
    if (lower === 'timesheet' || lower === 'timesheets' || lower === 'attendance' || lower === 'shifts' || lower === 'punch') {
      return 'attendance';
    }
    if (lower === 'roster' || lower === 'staff' || lower === 'directory' || lower === 'employees') {
      return 'roster';
    }
    if (lower === 'calendar' || lower === 'monthly') {
      return 'calendar';
    }
    if (lower === 'leave' || lower === 'leaves' || lower === 'requisitions') {
      return 'leave';
    }
    if (lower === 'holiday' || lower === 'holidays' || lower === 'branch-holidays' || lower === 'festival') {
      return 'holidays';
    }
    if (lower === 'payroll' || lower === 'salaries' || lower === 'compensation') {
      return 'payroll';
    }
    return lower;
  };

  // Active Tab initialized from URL parameter and normalized
  const initialTab = normalizeTab(searchParams.get('tab'));
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync tab with URL search parameter on direct load, navigation, refresh, back/forward
  useEffect(() => {
    const rawTab = searchParams.get('tab');
    if (rawTab) {
      const parsed = normalizeTab(rawTab);
      if (parsed !== activeTab) {
        setActiveTab(parsed);
      }
    }
  }, [searchParams]);

  // Sync viewing holiday with URL parameters
  useEffect(() => {
    const rawHolidayId = searchParams.get('holidayId');
    if (rawHolidayId) {
      const matchHol = (holidays || []).find((h) => String(h.id) === String(rawHolidayId));
      if (matchHol) {
        setViewingHoliday(matchHol);
        setActiveTab('holidays');
      }
    }
  }, [searchParams, holidays]);

  // Sync reviewing leave requisition with URL parameters
  useEffect(() => {
    const lid = paramLeaveId || searchParams.get('leaveId');
    if (lid) {
      setReviewingLeaveId(lid);
      setActiveTab('leave');
    }
  }, [searchParams, paramLeaveId]);

  // Retrieve active selected leave record for review
  const reviewingLeave = useMemo(() => {
    if (!reviewingLeaveId) return null;
    return (leaveRequests || []).find((l) => String(l.id) === String(reviewingLeaveId)) || null;
  }, [reviewingLeaveId, leaveRequests]);

  const handleCloseReviewModal = () => {
    setReviewingLeaveId(null);
    setReviewNotes('');
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('leaveId');
      return next;
    });
  };

  const handleApproveLeave = (leaveId) => {
    reviewLeaveRequest(leaveId, 'approved', reviewNotes || 'Approved by Manager');
    addToast('Leave request approved successfully.', 'success');
    handleCloseReviewModal();
  };

  const handleRejectLeave = (leaveId) => {
    reviewLeaveRequest(leaveId, 'rejected', reviewNotes || 'Declined due to outlet shift constraints');
    addToast('Leave request declined.', 'info');
    handleCloseReviewModal();
  };

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [leaveStatusFilter, setLeaveStatusFilter] = useState('all');

  // Modals for Staff & Manager
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isAssignMgrOpen, setIsAssignMgrOpen] = useState(false);
  const [staffToRemove, setStaffToRemove] = useState(null);
  const [selectedStaffDetails, setSelectedStaffDetails] = useState(null);

  // Salary & Slip Modals
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [salaryTargetStaff, setSalaryTargetStaff] = useState(null);
  const [viewingSalarySlip, setViewingSalarySlip] = useState(null);


  // Add Staff Form
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'kitchen_staff',
    roleLabel: 'Line Cook',
    branchId: currentBranchId || (branches[0] ? branches[0].id : ''),
    pin: '1234',
    isManager: false,
    assignedModules: ['Kitchen Terminal', 'Prep Usage'],
  });

  // Assign Manager Form
  const [assignMgrForm, setAssignMgrForm] = useState({
    branchId: branches[0]?.id || '',
    managerId: '',
  });

  // Live calculations (scoped strictly by branch for manager)
  const filteredAttendanceRecords = useMemo(() => {
    let list = isManager
      ? (attendanceRecords || []).filter((r) => r.branchId === assignedBranchId)
      : (attendanceRecords || []);

    if (attendanceSearchTerm.trim()) {
      const q = attendanceSearchTerm.toLowerCase();
      list = list.filter((r) =>
        (r.staffName || '').toLowerCase().includes(q) ||
        (r.station || '').toLowerCase().includes(q) ||
        (r.staffRole || '').toLowerCase().includes(q) ||
        (r.notes || '').toLowerCase().includes(q)
      );
    }

    if (attendanceStatusFilter !== 'all') {
      if (attendanceStatusFilter === 'corrected') {
        list = list.filter((r) => r.isCorrected);
      } else {
        list = list.filter((r) => r.status === attendanceStatusFilter);
      }
    }

    if (attendanceDateFilter) {
      list = list.filter((r) => (r.date || '').startsWith(attendanceDateFilter));
    }

    return list;
  }, [attendanceRecords, isManager, assignedBranchId, attendanceSearchTerm, attendanceStatusFilter, attendanceDateFilter]);

  const totalAttendancePages = Math.max(1, Math.ceil(filteredAttendanceRecords.length / ATTENDANCE_PER_PAGE));
  const paginatedAttendance = useMemo(() => {
    const start = (attendancePage - 1) * ATTENDANCE_PER_PAGE;
    return filteredAttendanceRecords.slice(start, start + ATTENDANCE_PER_PAGE);
  }, [filteredAttendanceRecords, attendancePage]);

  const scopedStaff = isManager
    ? branchStaff.filter((s) => s.branchId === assignedBranchId)
    : branchStaff;
  const activeAttendance = isManager
    ? (attendanceRecords || []).filter((r) => r.branchId === assignedBranchId && r.status === 'active')
    : (attendanceRecords || []).filter((r) => r.status === 'active');
  const pendingLeaves = isManager
    ? (leaveRequests || []).filter((l) => (!l.branchId || l.branchId === assignedBranchId) && l.status === 'pending')
    : (leaveRequests || []).filter((l) => l.status === 'pending');
  const totalEmployees = scopedStaff.length;
  const totalOnDuty = activeAttendance.length;
  const pendingLeavesCount = pendingLeaves.length;

  const totalMonthlyPayrollDisbursed = salaryPayments
    .filter((p) => !isManager || p.branchId === assignedBranchId)
    .reduce((sum, p) => sum + Number(p.amount), 0);

  // Filtered staff
  const filteredStaff = useMemo(() => {
    return branchStaff.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.roleLabel.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesBranch = isManager
        ? s.branchId === assignedBranchId
        : (branchFilter === 'all' || s.branchId === branchFilter);

      const matchesRole =
        roleFilter === 'all' ||
        (roleFilter === 'restaurant_manager' && s.role === 'restaurant_manager') ||
        (roleFilter === 'inventory_manager' && s.role === 'inventory_manager') ||
        (roleFilter === 'manager' && (s.isManager || s.role === 'restaurant_manager' || s.role === 'inventory_manager')) ||
        (roleFilter === 'kitchen' && s.role === 'kitchen_staff');

      return matchesSearch && matchesBranch && matchesRole;
    });
  }, [branchStaff, searchTerm, branchFilter, roleFilter, isManager, assignedBranchId]);

  // Filtered leave requests
  const filteredLeaves = useMemo(() => {
    return leaveRequests.filter((l) => {
      const matchesStatus = leaveStatusFilter === 'all' || l.status === leaveStatusFilter;
      const matchesBranch = isManager
        ? (!l.branchId || l.branchId === assignedBranchId)
        : (branchFilter === 'all' || l.branchId === branchFilter);
      return matchesStatus && matchesBranch;
    });
  }, [leaveRequests, leaveStatusFilter, branchFilter, isManager, assignedBranchId]);

  
  // Tab change handler
  const handleTabChange = (tab) => {
    const normalized = normalizeTab(tab);
    setActiveTab(normalized);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', normalized);
      return next;
    });
  };

  // Add staff submit
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!addForm.name || !addForm.email || !addForm.branchId) {
      addToast('Please complete required fields (Name, Email, Branch)', 'error');
      return;
    }

    const targetBranch = branches.find((b) => b.id === addForm.branchId);
    const planConfig = BRANCH_PLANS_CONFIG[targetBranch?.planId] || BRANCH_PLANS_CONFIG['plan-starter'];
    const currentStaffCount = branchStaff.filter((s) => s.branchId === addForm.branchId).length;

    if (currentStaffCount >= planConfig.maxStaff) {
      addToast(
        `Staff quota reached for ${targetBranch?.name}. Plan allows maximum ${planConfig.maxStaff} staff. Please upgrade the branch plan.`,
        'error'
      );
      return;
    }

    addBranchStaffMember({
      name: addForm.name,
      email: addForm.email,
      phone: addForm.phone,
      role: addForm.role,
      roleLabel: addForm.roleLabel,
      branchId: addForm.branchId,
      branchName: targetBranch?.name || 'Branch',
      pin: addForm.pin,
      isManager: addForm.isManager,
      assignedModules: addForm.assignedModules,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    });

    setIsAddStaffOpen(false);
    setAddForm({
      name: '',
      email: '',
      phone: '',
      role: 'kitchen_staff',
      roleLabel: 'Line Cook',
      branchId: currentBranchId || branches[0]?.id || '',
      pin: '1234',
      isManager: false,
      assignedModules: ['Kitchen Terminal', 'Prep Usage'],
    });
  };

  // Assign manager submit
  const handleAssignManagerSubmit = (e) => {
    e.preventDefault();
    if (!assignMgrForm.branchId || !assignMgrForm.managerId) {
      addToast('Please select both Branch and Manager', 'error');
      return;
    }

    assignBranchManager(assignMgrForm.branchId, assignMgrForm.managerId);
    setIsAssignMgrOpen(false);
  };

  // Remove staff confirmation
  const handleConfirmRemove = () => {
    if (staffToRemove) {
      removeBranchStaffMember(staffToRemove.id);
      setStaffToRemove(null);
    }
  };

  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="People &amp; Workforce"
        subtitle="Unified team management: staff directory, live station clock-in, leave approvals, and payroll disbursements."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={() => setIsExportOpen(true)}
            >
              Export Roster
            </Button>
            {currentUser?.role !== 'kitchen_staff' && currentUser?.role !== 'supplier' && (
              <Button
                variant="outline"
                size="sm"
                icon={UploadCloud}
                onClick={() => setIsImportOpen(true)}
              >
                Import Staff
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              icon={IndianRupee}
              onClick={() => {
                setSalaryTargetStaff(null);
                setIsSalaryModalOpen(true);
              }}
            >
              Disburse Salary
            </Button>
            {currentUser?.role === 'restaurant_owner' && (
              <Button
                variant="outline"
                size="sm"
                icon={Star}
                onClick={() => setIsAssignMgrOpen(true)}
              >
                Appoint Manager
              </Button>
            )}
            <Button
              variant="brand"
              size="sm"
              icon={Plus}
              onClick={() => setIsAddStaffOpen(true)}
            >
              Add Staff Member
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Staff Directory"
          value={totalEmployees}
          subtitle="Across All Outlets"
          icon={Users}
          variant="default"
          onClick={() => handleTabChange('roster')}
        />
        <StatCard
          title="On Duty Now"
          value={totalOnDuty}
          subtitle="Active Clocked In"
          icon={Clock}
          variant={totalOnDuty > 0 ? 'success' : 'default'}
          onClick={() => handleTabChange('attendance')}
        />
        <StatCard
          title="Leave Requests"
          value={pendingLeavesCount}
          subtitle={pendingLeavesCount > 0 ? 'Requires Approval' : 'All Clear'}
          icon={Calendar}
          variant={pendingLeavesCount > 0 ? 'warning' : 'default'}
          onClick={() => handleTabChange('leave')}
        />
        <StatCard
          title="Payroll Disbursed"
          value={formatINR(totalMonthlyPayrollDisbursed)}
          subtitle="Recent Settlements"
          icon={IndianRupee}
          variant="default"
          onClick={() => handleTabChange('payroll')}
        />
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 overflow-x-auto">
          {/* Tab 1: Staff Directory */}
          <button
            onClick={() => handleTabChange('roster')}
            className={`py-3 px-1 border-b-2 font-semibold text-xs flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'roster'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Staff Directory ({branchStaff.length})</span>
          </button>

          {/* Tab 2: Attendance */}
          <button
            onClick={() => handleTabChange('attendance')}
            className={`py-3 px-1 border-b-2 font-semibold text-xs flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'attendance'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Attendance &amp; Timesheets</span>
            {totalOnDuty > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                {totalOnDuty} Active
              </span>
            )}
          </button>

          {/* Tab 2.5: Monthly Attendance Calendar */}
          <button
            onClick={() => handleTabChange('calendar')}
            className={`py-3 px-1 border-b-2 font-semibold text-xs flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Monthly Attendance Calendar</span>
          </button>

          {/* Tab 2.6: Branch Holidays */}
          <button
            onClick={() => handleTabChange('holidays')}
            className={`py-3 px-1 border-b-2 font-semibold text-xs flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'holidays'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Branch Holidays ({branchHolidaysCount})</span>
          </button>

          {/* Tab 3: Leave & Shifts */}
          <button
            onClick={() => handleTabChange('leave')}
            className={`py-3 px-1 border-b-2 font-semibold text-xs flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'leave'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Leave &amp; Shifts</span>
            {pendingLeavesCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-bold animate-pulse">
                {pendingLeavesCount} Pending
              </span>
            )}
          </button>

          {/* Tab 4: Payroll */}
          <button
            onClick={() => handleTabChange('payroll')}
            className={`py-3 px-1 border-b-2 font-semibold text-xs flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'payroll'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <IndianRupee className="w-4 h-4" />
            <span>Payroll</span>
          </button>

                  </nav>
      </div>

      {/* TAB 1: STAFF DIRECTORY */}
      {activeTab === 'roster' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search staff by name, title, email, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {!isManager ? (
                  <select
                    value={branchFilter}
                    onChange={(e) => setBranchFilter(e.target.value)}
                    className="text-xs font-medium py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="all">All Outlets ({branchStaff.length})</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="inline-flex items-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-semibold">
                    <Store className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{branches.find((b) => b.id === assignedBranchId)?.name || 'Assigned Branch'}</span>
                  </div>
                )}

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="text-xs font-medium py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="all">All Roles</option>
                  <option value="manager">All Managers</option>
                  <option value="restaurant_manager">Restaurant Managers</option>
                  <option value="inventory_manager">Inventory Managers</option>
                  <option value="kitchen">Kitchen Staff Only</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Employee</th>
                    <th className="py-3.5 px-4">Role &amp; Title</th>
                    <th className="py-3.5 px-4">Assigned Outlet</th>
                    <th className="py-3.5 px-4">Live Attendance Status</th>
                    <th className="py-3.5 px-4">Module Access</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs text-slate-500">
                        No staff members match the selected search or filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map((staff) => {
                      const branchObj = branches.find((b) => b.id === staff.branchId);
                      const activeShift = attendanceRecords.find(
                        (r) => r.staffId === staff.id && r.status === 'active'
                      );

                      return (
                        <tr key={staff.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={staff.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                                alt={staff.name}
                                className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                              />
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-slate-900">{staff.name}</span>
                                  {staff.isManager && (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                      <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                      Manager
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500">{staff.email}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900">{staff.roleLabel}</div>
                            <div className="text-[10px] text-slate-400 capitalize">
                              {staff.role.replace('_', ' ')}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-800">
                              {staff.branchName || branchObj?.name || 'Unassigned'}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {branchObj?.code}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            {activeShift ? (
                              <div>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                                  On Duty
                                </span>
                                <div className="text-[10px] text-slate-500 mt-0.5">
                                  {activeShift.station} • since{' '}
                                  {new Date(activeShift.punchInTime).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </div>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                Off Duty
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {staff.assignedModules?.map((mod, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                                >
                                  {mod}
                                </span>
                              ))}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="text-slate-800">{staff.phone || '+91 98200 XXXXX'}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Auth: Encrypted
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="outline"
                                size="xs"
                                onClick={() => {
                                  setSalaryTargetStaff(staff);
                                  setIsSalaryModalOpen(true);
                                }}
                                title="Disburse salary"
                                className="text-emerald-800 border-emerald-200 hover:bg-emerald-50"
                              >
                                <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
                                Pay
                              </Button>


                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => setSelectedStaffDetails(staff)}
                                className="text-slate-600 hover:bg-slate-100"
                              >
                                Details
                              </Button>

                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => setStaffToRemove(staff)}
                                className="text-rose-600 hover:bg-rose-50"
                                title="Remove staff"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE ATTENDANCE & TIMESHEETS */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Manager's Personal Shift Terminal & Punch Clock */}
          <PunchClockWidget />
          {/* Live Station Clock-In Board */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
                  Live Station Clock-In Board
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Currently active shifts clocked in via terminal time clocks across outlets.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="xs" variant="outline" icon={Calendar} onClick={() => setIsHolidayModalOpen(true)}>
                  Manage Holidays
                </Button>
                <Button size="xs" variant="outline" icon={Download} onClick={() => setIsAttendanceExportOpen(true)}>
                  Export Timesheet
                </Button>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  {activeAttendance.length} Staff On Duty Now
                </span>
              </div>
            </div>

            {activeAttendance.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
                No staff members currently clocked in.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeAttendance.map((rec) => {
                  const inTime = new Date(rec.punchInTime);
                  const diffHrs = Math.max(0.1, Number(((Date.now() - inTime.getTime()) / (1000 * 60 * 60)).toFixed(1)));

                  return (
                    <div
                      key={rec.id}
                      className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 flex items-start gap-3 shadow-2xs"
                    >
                      <img
                        src={rec.staffAvatar || 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=150'}
                        alt={rec.staffName}
                        className="w-10 h-10 rounded-full object-cover border border-emerald-300 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 truncate">
                            {rec.staffName}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                            {diffHrs}h elapsed
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">{rec.staffRole}</div>
                        <div className="text-[11px] font-semibold text-emerald-900 mt-1">
                          📍 {rec.station}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          In: {inTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {rec.branchName}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Historical Shift Attendance Logs with Search, Filter & Corrections */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
            {/* Table Header and Filters Bar */}
            <div className="p-5 border-b border-slate-100 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Historical Shift Attendance Logs</h4>
                  <p className="text-xs text-slate-500">
                    Audit punch records, inspect breaks, and record manager corrections with reason trail.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-mono">
                    {filteredAttendanceRecords.length} Filtered Records
                  </span>
                </div>
              </div>

              {/* Filter controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by staff, station, role..."
                    value={attendanceSearchTerm}
                    onChange={(e) => {
                      setAttendanceSearchTerm(e.target.value);
                      setAttendancePage(1);
                    }}
                    className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <select
                    value={attendanceStatusFilter}
                    onChange={(e) => {
                      setAttendanceStatusFilter(e.target.value);
                      setAttendancePage(1);
                    }}
                    className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="all">All Shift Statuses</option>
                    <option value="active">Active Shifts Only</option>
                    <option value="completed">Completed Shifts Only</option>
                    <option value="corrected">Audited / Corrected Only</option>
                  </select>
                </div>

                <div>
                  <input
                    type="date"
                    value={attendanceDateFilter}
                    onChange={(e) => {
                      setAttendanceDateFilter(e.target.value);
                      setAttendancePage(1);
                    }}
                    placeholder="Filter by date"
                    className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Attendance Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Outlet</th>
                    <th className="py-3 px-4">Station</th>
                    <th className="py-3 px-4">Punch In</th>
                    <th className="py-3 px-4">Punch Out</th>
                    <th className="py-3 px-4">Break</th>
                    <th className="py-3 px-4">Hours</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Notes / Audit</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-8 text-center text-xs text-slate-400">
                        No shift records found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedAttendance.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900 font-mono">{rec.date}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <img
                              src={rec.staffAvatar || 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=150'}
                              alt={rec.staffName}
                              className="w-7 h-7 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <span className="font-bold text-slate-900 block">{rec.staffName}</span>
                              <span className="text-[10px] text-slate-400">{rec.staffRole}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{rec.branchName}</td>
                        <td className="py-3 px-4 font-medium text-slate-800">{rec.station}</td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                          {new Date(rec.punchInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                          {rec.punchOutTime
                            ? new Date(rec.punchOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : '—'}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                          {rec.breakMinutes ? `${rec.breakMinutes}m` : '0m'}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 font-mono">
                          {rec.totalHours ? `${rec.totalHours} hrs` : <span className="text-emerald-600">Active</span>}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-block w-fit ${
                                rec.status === 'active'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {rec.status === 'active' ? 'Active' : 'Completed'}
                            </span>
                            {rec.isCorrected && (
                              <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded w-fit">
                                Audited
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[11px] text-slate-500 max-w-xs truncate">
                          {rec.correctionReason ? (
                            <span className="text-amber-800 font-medium" title={rec.correctionReason}>
                              ✏️ {rec.correctionReason}
                            </span>
                          ) : (
                            rec.notes || '—'
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            size="xs"
                            variant="ghost"
                            icon={Edit2}
                            onClick={() => setCorrectingRecord(rec)}
                            className="text-slate-600 hover:text-emerald-700 cursor-pointer"
                          >
                            Correct
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalAttendancePages > 1 && (
              <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
                <span>
                  Showing {(attendancePage - 1) * ATTENDANCE_PER_PAGE + 1} to{' '}
                  {Math.min(attendancePage * ATTENDANCE_PER_PAGE, filteredAttendanceRecords.length)} of{' '}
                  {filteredAttendanceRecords.length} records
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    size="xs"
                    variant="outline"
                    icon={ChevronLeft}
                    disabled={attendancePage === 1}
                    onClick={() => setAttendancePage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </Button>
                  <span className="px-2 font-mono font-bold text-slate-700">
                    Page {attendancePage} of {totalAttendancePages}
                  </span>
                  <Button
                    size="xs"
                    variant="outline"
                    icon={ChevronRight}
                    disabled={attendancePage === totalAttendancePages}
                    onClick={() => setAttendancePage((p) => Math.min(totalAttendancePages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2.5: MONTHLY ATTENDANCE CALENDAR */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <MonthlyAttendanceCalendar />
        </div>
      )}

      {/* TAB 2.6: BRANCH HOLIDAYS MANAGEMENT */}
      {activeTab === 'holidays' && (
        <div className="space-y-6">
          {/* Header & Action */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Branch Holiday Calendar &amp; Attendance Integration
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                Configure official branch holidays and festival periods for {currentBranch?.name || 'Assigned Branch'}. Covered employees are exempted from absence penalties, while worked shifts receive <strong className="text-indigo-800">Holiday Worked</strong> duty credits.
              </p>
            </div>
            {currentUser?.role !== 'inventory_manager' && currentUser?.role !== 'kitchen_staff' && (
              <Button
                variant="brand"
                size="sm"
                icon={Plus}
                onClick={() => setIsHolidayModalOpen(true)}
              >
                Schedule New Holiday
              </Button>
            )}
          </div>

          {/* KPI Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Scheduled Holidays"
              value={branchHolidays.length}
              subtext="Current calendar year"
              icon={Calendar}
              trend="up"
            />
            <StatCard
              title="Upcoming Holidays"
              value={branchHolidays.filter(h => (h.endDate || h.date) >= new Date().toISOString().split('T')[0]).length}
              subtext="Scheduled ahead"
              icon={Clock}
              trend="neutral"
            />
            <StatCard
              title="Festival Holidays"
              value={branchHolidays.filter(h => h.type === 'Festival Holiday' || h.type === 'Festival').length}
              subtext="Cultural celebrations"
              icon={Sparkles}
              trend="up"
            />
            <StatCard
              title="Paid Branch Offs"
              value={branchHolidays.filter(h => h.isPaid !== false).length}
              subtext="Full wage credited"
              icon={IndianRupee}
              trend="up"
            />
          </div>

          {/* Quick Trigger to open Manager Modal with Full Filters */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/60 to-indigo-50/60 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <CalendarDays className="w-5 h-5 text-emerald-700" />
              <div>
                <span className="font-bold text-slate-900">Advanced Holiday Management Console</span>
                <span className="text-slate-600 block text-[11px]">Filter by month, export staff coverage lists, or schedule multi-day festival periods.</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={Calendar}
              onClick={() => setIsHolidayModalOpen(true)}
            >
              Open Full Holiday Manager
            </Button>
          </div>

          {/* Branch Holidays Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Active Branch Holidays ({branchHolidays.length})
              </span>
              <span className="text-slate-500 font-medium text-[11px]">
                Showing holidays applicable to {currentBranch?.name || 'Assigned Branch'}
              </span>
            </div>

            <div className="overflow-x-auto">
              {branchHolidays.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-700 text-sm">No holidays scheduled for this branch yet.</p>
                  <p className="text-xs text-slate-500 mt-1">Click "Schedule New Holiday" above to declare your first branch holiday.</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Date / Duration</th>
                      <th className="py-3 px-4">Holiday Name &amp; Description</th>
                      <th className="py-3 px-4">Classification</th>
                      <th className="py-3 px-4">Pay Status</th>
                      <th className="py-3 px-4">Applicable Scope</th>
                      <th className="py-3 px-4">Scheduled By</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {branchHolidays.map((hol) => {
                      const sDate = hol.startDate || hol.date;
                      const eDate = hol.endDate || hol.date || sDate;
                      const isMulti = sDate !== eDate;
                      const isUpcoming = eDate >= new Date().toISOString().split('T')[0];
                      const coveredCount = (branchStaff || []).filter(s => isHolidayApplicableToStaff(hol, s)).length;

                      return (
                        <tr key={hol.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                            <div>
                              <span>
                                {new Date(sDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              {isMulti && (
                                <span className="block text-[11px] text-slate-500 font-normal">
                                  to {new Date(eDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                              )}
                              {isUpcoming && (
                                <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                                  Upcoming
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 block text-xs">{hol.name}</span>
                            {hol.description && (
                              <span className="text-[11px] text-slate-500 block truncate max-w-sm mt-0.5">
                                {hol.description}
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                              {hol.type || 'Holiday'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              hol.isPaid !== false ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {hol.isPaid !== false ? 'Paid Holiday' : 'Unpaid'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-semibold text-slate-700 text-[11px]">
                              {hol.scope === 'all' ? 'All Restaurant Outlets' : (hol.branchName || 'Assigned Branch')}
                            </div>
                            <span className="text-[10px] text-indigo-700 font-semibold block mt-0.5">
                              {coveredCount} Employees Eligible
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-[11px] text-slate-500 whitespace-nowrap">
                            {hol.createdBy || 'Management'}
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="outline"
                                size="xs"
                                icon={Eye}
                                onClick={() => setViewingHoliday(hol)}
                                title="View Holiday Details"
                              >
                                Details
                              </Button>
                              <Button
                                variant="ghost"
                                size="xs"
                                icon={Edit2}
                              onClick={() => setIsHolidayModalOpen(true)}
                              title="Manage & Edit in Holiday Console">
                                Manage
                              </Button>
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
        </div>
      )}

      {/* TAB 3: LEAVE & SHIFTS */}
      {activeTab === 'leave' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Staff Leave Requisitions &amp; Approvals</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Review and approve leave applications. Approved dates reflect directly on station coverage schedules.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="brand"
                icon={Plus}
                onClick={() => setIsManagerLeaveModalOpen(true)}
              >
                Apply for My Leave
              </Button>
              <select
                value={leaveStatusFilter}
                onChange={(e) => setLeaveStatusFilter(e.target.value)}
                className="text-xs font-semibold py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="all">All Applications ({leaveRequests.length})</option>
                <option value="pending">Pending Review ({pendingLeaves.length})</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Staff Member</th>
                    <th className="py-3.5 px-4">Category &amp; Outlet</th>
                    <th className="py-3.5 px-4">Leave Duration &amp; Dates</th>
                    <th className="py-3.5 px-4">Reason for Request</th>
                    <th className="py-3.5 px-4">Applied Date</th>
                    <th className="py-3.5 px-4">Current Status</th>
                    <th className="py-3.5 px-4 text-right">Manager Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs text-slate-400">
                        No leave requests found matching filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLeaves.map((leave) => (
                      <tr key={leave.id} className={`hover:bg-slate-50/80 transition-colors ${String(leave.id) === String(reviewingLeaveId) ? 'bg-emerald-50/80 ring-2 ring-emerald-500/50' : ''}`}>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={leave.staffAvatar || 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=150'}
                              alt={leave.staffName}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <span className="font-bold text-slate-900 block">{leave.staffName}</span>
                              <span className="text-[10px] text-slate-500">{leave.staffRole}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800 block">{leave.leaveType}</span>
                          <span className="text-[10px] text-slate-400">{leave.branchName}</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">
                            {leave.startDate} ➔ {leave.endDate}
                          </div>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {leave.durationDays} Days
                          </span>
                        </td>

                        <td className="py-3.5 px-4 max-w-xs text-slate-700">
                          {leave.reason}
                        </td>

                        <td className="py-3.5 px-4 text-slate-500 text-[11px] font-mono">
                          {new Date(leave.appliedDate).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>

                        <td className="py-3.5 px-4">
                          {leave.status === 'pending' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Pending Approval
                            </span>
                          ) : leave.status === 'approved' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              <XCircle className="w-3 h-3 text-rose-600" />
                              Rejected
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {leave.status === 'pending' ? (
                            leave.staffId === currentUser?.id && isManager ? (
                              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg inline-block" title="Managers cannot approve own leave. Owner approval required.">
                                Manager Self-Approval Prohibited
                              </span>
                            ) : (
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  icon={Eye}
                                  onClick={() => setReviewingLeaveId(leave.id)}
                                  title="Inspect full leave application"
                                  className="text-slate-600 hover:text-emerald-700 cursor-pointer"
                                >
                                  Review
                                </Button>
                                <Button
                                  variant="outline"
                                  size="xs"
                                  onClick={() => reviewLeaveRequest(leave.id, 'rejected', 'Shift coverage constraints at outlet')}
                                  className="text-rose-600 hover:bg-rose-50 cursor-pointer"
                                >
                                  Reject
                                </Button>
                                <Button
                                  variant="brand"
                                  size="xs"
                                  onClick={() => reviewLeaveRequest(leave.id, 'approved', 'Approved by Manager')}
                                  className="cursor-pointer"
                                >
                                  Accept
                                </Button>
                              </div>
                            )
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-[11px] text-slate-400 italic">
                                Reviewed by {leave.reviewedBy || 'Manager'}
                              </span>
                              <Button
                                variant="ghost"
                                size="xs"
                                icon={Eye}
                                onClick={() => setReviewingLeaveId(leave.id)}
                                title="Inspect leave requisition details"
                                className="text-slate-500 hover:text-emerald-700 cursor-pointer"
                              >
                                View
                              </Button>
                            </div>
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

      {/* TAB 4: PAYROLL */}
      {activeTab === 'payroll' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Staff Payroll &amp; Compensation Ledger
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Disburse monthly compensation, log bank transaction references, and dispatch salary credit notifications.
              </p>
            </div>
            <Button
              variant="brand"
              size="sm"
              icon={IndianRupee}
              onClick={() => {
                setSalaryTargetStaff(null);
                setIsSalaryModalOpen(true);
              }}
            >
              Disburse Salary
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm">Staff Compensation Roster</h4>
              <span className="text-xs text-slate-400">{branchStaff.length} Employees</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Outlet</th>
                    <th className="py-3 px-4">Base Wage</th>
                    <th className="py-3 px-4">Designated Bank Account</th>
                    <th className="py-3 px-4">Last Disbursed Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {branchStaff.map((staff) => {
                    const profile = STAFF_SALARY_PROFILES?.[staff.id];
                    const lastPayment = salaryPayments.find((p) => p.staffId === staff.id);

                    return (
                      <tr key={staff.id} className="hover:bg-slate-50/70">
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block">{staff.name}</span>
                          <span className="text-[10px] text-slate-500">{staff.roleLabel}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{staff.branchName || 'Pune Central'}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {formatINR(profile?.baseSalary || 35000)}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {profile?.bankAccount || 'HDFC Bank •••• 4421'}
                        </td>
                        <td className="py-3.5 px-4">
                          {lastPayment ? (
                            <div>
                              <span className="text-emerald-700 font-semibold">
                                {formatINR(lastPayment.amount)} for {lastPayment.payPeriod}
                              </span>
                              <div className="text-[10px] text-slate-400 font-mono">
                                UTR: {lastPayment.referenceNumber}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Not disbursed this month</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            variant="primary"
                            size="xs"
                            icon={IndianRupee}
                            onClick={() => {
                              setSalaryTargetStaff(staff);
                              setIsSalaryModalOpen(true);
                            }}
                          >
                            Disburse
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm">Disbursed Salary History</h4>
              <span className="text-xs text-slate-400">{salaryPayments.length} Transactions</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Pay Period</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Transaction UTR</th>
                    <th className="py-3 px-4">Disbursed Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Pay Slip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {salaryPayments.map((sal) => (
                    <tr key={sal.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{sal.staffName}</span>
                        <span className="text-[10px] text-slate-400">{sal.staffRole}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 font-medium">{sal.payPeriod}</td>
                      <td className="py-3.5 px-4 font-extrabold font-mono text-emerald-800">
                        {formatINR(sal.amount)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                        {sal.referenceNumber}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {new Date(sal.processedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {sal.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="outline"
                          size="xs"
                          icon={Eye}
                          onClick={() => setViewingSalarySlip(sal)}
                        >
                          Slip
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      <Modal
        isOpen={isAddStaffOpen}
        onClose={() => setIsAddStaffOpen(false)}
        title="Register New Restaurant Staff Member"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Full Name *"
              placeholder="e.g. Anand Shinde"
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              required
            />
            <FormInput
              label="Work Email *"
              type="email"
              placeholder="anand.s@spicegarden.com"
              value={addForm.email}
              onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Contact Phone"
              placeholder="+91 98220 XXXXX"
              value={addForm.phone}
              onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
            />
            <FormInput
              label="Quick PIN (Terminal Login) *"
              type="password"
              placeholder="4-digit PIN"
              value={addForm.pin}
              onChange={(e) => setAddForm({ ...addForm, pin: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Assign To Outlet Branch *
              </label>
              <select
                value={addForm.branchId}
                onChange={(e) => setAddForm({ ...addForm, branchId: e.target.value })}
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                required
              >
                {branches.map((b) => {
                  const staffCount = branchStaff.filter((s) => s.branchId === b.id).length;
                  const planCfg = BRANCH_PLANS_CONFIG[b.planId] || BRANCH_PLANS_CONFIG['plan-starter'];
                  return (
                    <option key={b.id} value={b.id}>
                      {b.name} ({staffCount}/{planCfg.maxStaff} staff)
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Role &amp; Permissions
              </label>
              <select
                value={addForm.role}
                onChange={(e) => {
                  const role = e.target.value;
                  let roleLabel = 'Line Cook';
                  let isManager = false;
                  if (role === 'restaurant_manager') {
                    roleLabel = 'Branch General Manager';
                    isManager = true;
                  } else if (role === 'inventory_manager') {
                    roleLabel = 'Head of Stock & Receiving';
                    isManager = true;
                  }
                  setAddForm({ ...addForm, role, roleLabel, isManager });
                }}
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="kitchen_staff">Kitchen Staff / Chef / Line Cook</option>
                <option value="restaurant_manager">Branch General Manager</option>
                <option value="inventory_manager">Inventory &amp; Stores Manager</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" size="sm" onClick={() => setIsAddStaffOpen(false)}>
              Cancel
            </Button>
            <Button variant="brand" size="sm" type="submit">
              Register Employee
            </Button>
          </div>
        </form>
      </Modal>

      {/* Appoint Manager Modal */}
      <Modal
        isOpen={isAssignMgrOpen}
        onClose={() => setIsAssignMgrOpen(false)}
        title="Appoint Branch General Manager"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAssignManagerSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Outlet Branch
            </label>
            <select
              value={assignMgrForm.branchId}
              onChange={(e) => setAssignMgrForm({ ...assignMgrForm, branchId: e.target.value })}
              className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800"
              required
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} (Current: {b.managerName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Designated Manager
            </label>
            <select
              value={assignMgrForm.managerId}
              onChange={(e) => setAssignMgrForm({ ...assignMgrForm, managerId: e.target.value })}
              className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800"
              required
            >
              <option value="">Select staff candidate...</option>
              {scopedStaff.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.name} ({staff.roleLabel} - {staff.branchName?.replace('Spice Garden — ', '')})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" size="sm" onClick={() => setIsAssignMgrOpen(false)}>
              Cancel
            </Button>
            <Button variant="brand" size="sm" type="submit">
              Authorize Manager
            </Button>
          </div>
        </form>
      </Modal>

      {/* Staff Details Modal */}
      {selectedStaffDetails && (
        <Modal
          isOpen={!!selectedStaffDetails}
          onClose={() => setSelectedStaffDetails(null)}
          title={`Staff Profile: ${selectedStaffDetails.name}`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <img
                src={selectedStaffDetails.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt={selectedStaffDetails.name}
                className="w-12 h-12 rounded-full object-cover border border-slate-300 shrink-0"
              />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{selectedStaffDetails.name}</h4>
                <p className="text-slate-500">{selectedStaffDetails.roleLabel}</p>
                <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-1">
                  Outlet: {selectedStaffDetails.branchName}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Email</span>
                <strong className="text-slate-800">{selectedStaffDetails.email}</strong>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Phone</span>
                <strong className="text-slate-800">{selectedStaffDetails.phone || 'N/A'}</strong>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Manager Status</span>
                <strong className="text-slate-800">
                  {selectedStaffDetails.isManager ? 'Authorised Manager' : 'General Staff'}
                </strong>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Terminal Auth</span>
                <strong className="text-slate-800">PIN Enabled</strong>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200">
              <span className="text-slate-400 block text-[11px] mb-1.5">Permitted Access Modules</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedStaffDetails.assignedModules?.map((mod, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-800 border"
                  >
                    {mod}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <Button variant="primary" size="sm" onClick={() => setSelectedStaffDetails(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Remove Confirm Modal */}
      {staffToRemove && (
        <ConfirmModal
          isOpen={!!staffToRemove}
          onClose={() => setStaffToRemove(null)}
          onConfirm={handleConfirmRemove}
          title="Remove Staff Member?"
          message={`Are you sure you want to remove ${staffToRemove.name} from ${staffToRemove.branchName}? They will no longer be able to log in or operate kitchen terminals.`}
          confirmText="Yes, Remove"
          type="danger"
        />
      )}

      {/* Attendance Correction Modal */}
      {correctingRecord && (
        <AttendanceCorrectionModal
          isOpen={!!correctingRecord}
          onClose={() => setCorrectingRecord(null)}
          record={correctingRecord}
        />
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
          canEdit={isManager || currentUser?.role === 'restaurant_owner'}
          onEdit={() => {
            setViewingHoliday(null);
            setIsHolidayModalOpen(true);
          }}
        />
      )}

      {/* Holiday Manager Modal */}
      <HolidayManagerModal
        isOpen={isHolidayModalOpen}
        onClose={() => setIsHolidayModalOpen(false)}
        branchId={isManager ? assignedBranchId : currentBranchId}
      />

      {/* Manager Personal Leave Modal */}
      <LeaveRequestModal
        isOpen={isManagerLeaveModalOpen}
        onClose={() => setIsManagerLeaveModalOpen(false)}
      />

      {/* Attendance Timesheet Export Dialog */}
      <ColumnExportDialog
        isOpen={isAttendanceExportOpen}
        onClose={() => setIsAttendanceExportOpen(false)}
        data={filteredAttendanceRecords}
        reportTitle={`Staff Shift Timesheet — ${currentBranch?.name || 'Active Branch'}`}
        fileNamePrefix="stockmate_attendance_timesheet"
        availableColumns={[
          { key: 'date', header: 'Shift Date' },
          { key: 'staffName', header: 'Staff Name' },
          { key: 'staffRole', header: 'Role / Designation' },
          { key: 'branchName', header: 'Outlet' },
          { key: 'station', header: 'Station / Line' },
          { key: 'punchInTime', header: 'Punch In', format: (v) => v ? new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—' },
          { key: 'punchOutTime', header: 'Punch Out', format: (v) => v ? new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—' },
          { key: 'breakMinutes', header: 'Break (Mins)', format: (v) => v || 0 },
          { key: 'totalHours', header: 'Worked Hours', format: (v) => v ? `${v} hrs` : 'Active' },
          { key: 'status', header: 'Status', format: (v) => (v || '').toUpperCase() },
          { key: 'notes', header: 'Notes' },
        ]}
      />

      {/* Salary Disbursement Modal */}
      <ProcessSalaryModal
        isOpen={isSalaryModalOpen}
        onClose={() => {
          setIsSalaryModalOpen(false);
          setSalaryTargetStaff(null);
        }}
        targetStaff={salaryTargetStaff}
      />

      {/* Salary Slip Inspection Modal */}
      <SalarySlipModal
        isOpen={!!viewingSalarySlip}
        onClose={() => setViewingSalarySlip(null)}
        paymentRecord={viewingSalarySlip}
      />

      {/* Export to Excel & Bulk Import Modals */}
      <ColumnExportDialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        data={branchStaff}
        availableColumns={[
          { key: 'name', header: 'Staff Full Name' },
          { key: 'email', header: 'Email Address' },
          { key: 'phone', header: 'Phone Number' },
          { key: 'roleLabel', header: 'Role / Designation' },
          { key: 'department', header: 'Department' },
          { key: 'branchName', header: 'Assigned Outlet' },
          { key: 'status', header: 'Employment Status' },
          { key: 'baseSalary', header: 'Base Salary (INR)', format: (val) => formatINR(val || 25000) },
          { key: 'bankAccount', header: 'Bank Account' },
          { key: 'joinedDate', header: 'Date Joined' },
        ]}
        reportTitle={`Workforce Roster — ${currentBranch?.name || 'Active Branch'}`}
        fileNamePrefix="stockmate_staff_roster"
        filtersSummary={{
          Branch: branchFilter !== 'all' ? branchFilter : 'All Branches',
          Role: roleFilter !== 'all' ? roleFilter : 'All Roles',
          Search: searchTerm || 'None',
        }}
      />

      <ExcelImportDialog
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        moduleType="staff"
        targetBranchName={currentBranch?.name || 'Active Branch'}
        existingRecords={branchStaff}
        onImportConfirm={importStaffBulk}
      />
      {/* Leave Request Review Modal */}
      {reviewingLeave && (
        <Modal
          isOpen={!!reviewingLeave}
          onClose={handleCloseReviewModal}
          title="Review Leave Requisition"
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-xs">
            {/* Header / Staff profile */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={
                    reviewingLeave.staffAvatar ||
                    'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=150'
                  }
                  alt={reviewingLeave.staffName}
                  className="w-12 h-12 rounded-full object-cover border border-slate-300 shrink-0"
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{reviewingLeave.staffName}</h4>
                  <p className="text-slate-500">{reviewingLeave.staffRole || 'Staff Member'}</p>
                  <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-1">
                    Outlet: {reviewingLeave.branchName || 'Assigned Branch'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block mb-1">Status</span>
                {reviewingLeave.status === 'pending' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    <Clock className="w-3 h-3 text-amber-600" />
                    Pending Approval
                  </span>
                ) : reviewingLeave.status === 'approved' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Approved
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                    <XCircle className="w-3 h-3 text-rose-600" />
                    Rejected
                  </span>
                )}
              </div>
            </div>

            {/* Leave Details Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-400 block text-[11px] mb-0.5">Leave Category</span>
                <strong className="text-slate-800 text-xs font-semibold">{reviewingLeave.leaveType}</strong>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-400 block text-[11px] mb-0.5">Duration</span>
                <strong className="text-emerald-700 text-xs font-semibold">
                  {reviewingLeave.durationDays} Day{reviewingLeave.durationDays > 1 ? 's' : ''}
                </strong>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 col-span-2">
                <span className="text-slate-400 block text-[11px] mb-0.5">Scheduled Dates</span>
                <strong className="text-slate-800 text-xs font-semibold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {reviewingLeave.startDate} &rarr; {reviewingLeave.endDate}
                </strong>
              </div>
            </div>

            {/* Reason Box */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200">
              <span className="text-slate-400 block text-[11px] mb-1 font-medium">Reason for Request</span>
              <p className="text-slate-700 text-xs leading-relaxed italic">
                "{reviewingLeave.reason}"
              </p>
            </div>

            {/* Application metadata */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>Applied: {new Date(reviewingLeave.appliedDate).toLocaleString()}</span>
              <span>Requisition ID: #{reviewingLeave.id}</span>
            </div>

            {/* Already reviewed info if not pending */}
            {reviewingLeave.status !== 'pending' && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="font-semibold text-slate-800">
                  Reviewed by {reviewingLeave.reviewedBy || 'Manager'}
                </div>
                {reviewingLeave.reviewNotes && (
                  <p className="text-slate-600 mt-1">Note: "{reviewingLeave.reviewNotes}"</p>
                )}
                {reviewingLeave.reviewedAt && (
                  <span className="text-[10px] text-slate-400 block mt-1">
                    On {new Date(reviewingLeave.reviewedAt).toLocaleString()}
                  </span>
                )}
              </div>
            )}

            {/* Manager review controls if pending */}
            {reviewingLeave.status === 'pending' && (
              <div className="space-y-3 pt-2">
                {isManager && reviewingLeave.staffId === currentUser?.id ? (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Manager Self-Approval Prohibited. Only the Restaurant Owner can approve or reject your leave application.</span>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Decision Note (Optional)
                      </label>
                      <textarea
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="e.g. Approved. Line coverage confirmed with sous chef..."
                        rows={2}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRejectLeave(reviewingLeave.id)}
                        className="text-rose-600 hover:bg-rose-50"
                      >
                        Decline Application
                      </Button>
                      <Button
                        variant="brand"
                        size="sm"
                        onClick={() => handleApproveLeave(reviewingLeave.id)}
                      >
                        Approve Leave
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {reviewingLeave.status !== 'pending' && (
              <div className="flex justify-end pt-2 border-t border-slate-100">
                <Button variant="outline" size="sm" onClick={handleCloseReviewModal}>
                  Close
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
export default WorkforcePage;

