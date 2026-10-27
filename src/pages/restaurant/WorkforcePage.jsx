import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Users,
  UserCheck,
  Building2,
  Store,
  Plus,
  Search,
  Filter,
  ShieldCheck,
  ArrowLeftRight,
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
    salaryPayments,
    STAFF_SALARY_PROFILES,
    staffTransfers,
    requestStaffTransfer,
    approveStaffTransfer,
    rejectStaffTransfer,
    importStaffBulk,
    addToast,
  } = useApp();

  const isManager = currentUser?.role === 'restaurant_manager';
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [correctingRecord, setCorrectingRecord] = useState(null);
  const [isManagerLeaveModalOpen, setIsManagerLeaveModalOpen] = useState(false);
  const [attendanceSearchTerm, setAttendanceSearchTerm] = useState('');
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState('all');
  const [attendanceDateFilter, setAttendanceDateFilter] = useState('');
  const [attendancePage, setAttendancePage] = useState(1);
  const [isAttendanceExportOpen, setIsAttendanceExportOpen] = useState(false);
  const ATTENDANCE_PER_PAGE = 8;
  const assignedBranchId = currentUser?.branchId || currentBranchId || 'branch-pune-central';

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Active Tab: 'roster' | 'attendance' | 'leave' | 'payroll' | 'transfers'
  const initialTab = searchParams.get('tab') || 'roster';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [leaveStatusFilter, setLeaveStatusFilter] = useState('all');
  const [transferStatusTab, setTransferStatusTab] = useState('all'); // 'all' | 'Pending' | 'Approved' | 'Rejected'

  // Modals for Staff & Manager
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isAssignMgrOpen, setIsAssignMgrOpen] = useState(false);
  const [staffToRemove, setStaffToRemove] = useState(null);
  const [selectedStaffDetails, setSelectedStaffDetails] = useState(null);

  // Salary & Slip Modals
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [salaryTargetStaff, setSalaryTargetStaff] = useState(null);
  const [viewingSalarySlip, setViewingSalarySlip] = useState(null);

  // Transfer Modals & State
  const [isNewTransferOpen, setIsNewTransferOpen] = useState(false);
  const [selectedTransferForAudit, setSelectedTransferForAudit] = useState(null);
  const [rejectingTransfer, setRejectingTransfer] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [toBranchId, setToBranchId] = useState('');
  const [transferReason, setTransferReason] = useState('');

  // Selected staff object & their current branch for transfers
  const selectedTransferStaff = branchStaff.find((s) => s.id === selectedStaffId);
  const currentTransferBranch = branches.find((b) => b.id === selectedTransferStaff?.branchId);
  const destinationBranch = branches.find((b) => b.id === toBranchId);
  const destPlanConfig = destinationBranch
    ? BRANCH_PLANS_CONFIG[destinationBranch.planId] || BRANCH_PLANS_CONFIG['plan-starter']
    : null;
  const destCurrentStaffCount = destinationBranch
    ? branchStaff.filter((s) => s.branchId === destinationBranch.id).length
    : 0;
  const isDestFull =
    destPlanConfig && destPlanConfig.maxStaff !== 999 && destCurrentStaffCount >= destPlanConfig.maxStaff;

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
  const pendingTransfers = isManager
    ? (staffTransfers || []).filter((t) => (t.fromBranchId === assignedBranchId || t.toBranchId === assignedBranchId) && t.status === 'Pending')
    : (staffTransfers || []).filter((t) => t.status === 'Pending');

  const totalEmployees = scopedStaff.length;
  const totalOnDuty = activeAttendance.length;
  const pendingLeavesCount = pendingLeaves.length;
  const pendingTransfersCount = pendingTransfers.length;
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

  // Filtered transfers
  const filteredTransfers = useMemo(() => {
    return staffTransfers.filter((t) => {
      const matchesSearch =
        t.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.fromBranchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.toBranchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = transferStatusTab === 'all' || t.status === transferStatusTab;
      const matchesBranch = !isManager || t.fromBranchId === assignedBranchId || t.toBranchId === assignedBranchId;
      return matchesSearch && matchesStatus && matchesBranch;
    });
  }, [staffTransfers, searchTerm, transferStatusTab, isManager, assignedBranchId]);

  // Tab change handler
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
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

  // Transfer submit
  const handleNewTransferSubmit = (e) => {
    e.preventDefault();
    if (!selectedStaffId || !toBranchId || !transferReason.trim()) {
      addToast('Please select staff member, destination branch, and enter transfer reason', 'error');
      return;
    }

    if (selectedTransferStaff?.branchId === toBranchId) {
      addToast('Destination branch cannot be the same as current branch', 'error');
      return;
    }

    requestStaffTransfer({
      employeeId: selectedStaffId,
      fromBranchId: selectedTransferStaff.branchId,
      toBranchId: toBranchId,
      reason: transferReason.trim(),
    });

    setIsNewTransferOpen(false);
    setSelectedStaffId('');
    setToBranchId('');
    setTransferReason('');
  };

  // Approve transfer
  const handleApproveTransfer = (transferId) => {
    approveStaffTransfer(transferId);
  };

  // Reject transfer
  const handleRejectTransferConfirm = (e) => {
    e.preventDefault();
    if (!rejectingTransfer) return;

    rejectStaffTransfer(rejectingTransfer.id, rejectionReason || 'Operational constraints');
    setRejectingTransfer(null);
    setRejectionReason('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="People &amp; Workforce"
        subtitle="Unified team management: staff directory, live station clock-in, leave approvals, payroll disbursements, and branch transfers."
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
            <Button
              variant="outline"
              size="sm"
              icon={ArrowLeftRight}
              onClick={() => {
                setSelectedStaffId(branchStaff[0]?.id || '');
                setIsNewTransferOpen(true);
              }}
            >
              Request Transfer
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
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
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
        <StatCard
          title="Transfers"
          value={pendingTransfersCount}
          subtitle={pendingTransfersCount > 0 ? 'Pending Authorization' : 'All Processed'}
          icon={ArrowLeftRight}
          variant={pendingTransfersCount > 0 ? 'warning' : 'default'}
          onClick={() => handleTabChange('transfers')}
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

          {/* Tab 5: Staff Transfers */}
          <button
            onClick={() => handleTabChange('transfers')}
            className={`py-3 px-1 border-b-2 font-semibold text-xs flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'transfers'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Staff Transfers</span>
            {pendingTransfersCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-bold">
                {pendingTransfersCount} Action
              </span>
            )}
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
                                onClick={() => {
                                  setSelectedStaffId(staff.id);
                                  setIsNewTransferOpen(true);
                                }}
                                title="Request Branch Transfer"
                                className="text-slate-600 hover:bg-slate-100"
                              >
                                <ArrowLeftRight className="w-3.5 h-3.5" />
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
                      <tr key={leave.id} className="hover:bg-slate-50/80 transition-colors">
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
                            <span className="text-[11px] text-slate-400 italic">
                              Reviewed by {leave.reviewedBy || 'Manager'}
                            </span>
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

      {/* TAB 5: STAFF TRANSFERS */}
      {activeTab === 'transfers' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: 'all', label: 'All Transfers', count: staffTransfers.length },
                  { id: 'Pending', label: 'Pending', count: pendingTransfersCount, highlight: pendingTransfersCount > 0 },
                  { id: 'Approved', label: 'Approved', count: staffTransfers.filter((t) => t.status === 'Approved').length },
                  { id: 'Rejected', label: 'Rejected', count: staffTransfers.filter((t) => t.status === 'Rejected').length },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setTransferStatusTab(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      transferStatusTab === tab.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        transferStatusTab === tab.id
                          ? 'bg-white/20 text-white'
                          : tab.highlight
                          ? 'bg-amber-200 text-amber-900 font-bold'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by staff, branch, or request ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Request ID</th>
                    <th className="py-3.5 px-4">Staff Member</th>
                    <th className="py-3.5 px-4">Source &rarr; Destination Branch</th>
                    <th className="py-3.5 px-4">Reason / Notes</th>
                    <th className="py-3.5 px-4">Requested By</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Workflow Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransfers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-xs text-slate-500">
                        No staff transfer requests match the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredTransfers.map((req) => {
                      const isPending = req.status === 'Pending';
                      const isApproved = req.status === 'Approved';
                      const isRejected = req.status === 'Rejected';

                      return (
                        <tr
                          key={req.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isPending ? 'bg-amber-50/20' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                              {req.id}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-1">{req.requestDate}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={req.employeeAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                                alt={req.employeeName}
                                className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                              />
                              <div>
                                <div className="font-bold text-slate-900">{req.employeeName}</div>
                                <div className="text-[10px] text-slate-500">{req.roleLabel}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                                {req.fromBranchName?.replace('Spice Garden — ', '')}
                              </span>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 text-[11px]">
                                {req.toBranchName?.replace('Spice Garden — ', '')}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 max-w-xs">
                            <p className="text-slate-800 line-clamp-2">{req.reason}</p>
                            {req.comments && (
                              <span className="text-[10px] text-slate-500 italic block mt-0.5">
                                Note: {req.comments}
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="text-slate-800 font-medium">{req.requestedBy}</div>
                            {req.approvedBy && (
                              <div className="text-[10px] text-emerald-700 mt-0.5 font-medium">
                                Approved by: {req.approvedBy}
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                isApproved
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : isPending
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-rose-100 text-rose-800 border border-rose-200'
                              }`}
                            >
                              {isApproved && <CheckCircle2 className="w-3 h-3" />}
                              {isPending && <Clock className="w-3 h-3" />}
                              {isRejected && <XCircle className="w-3 h-3" />}
                              <span>{req.status}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {isPending ? (
                                <>
                                  <Button
                                    variant="primary"
                                    size="xs"
                                    onClick={() => handleApproveTransfer(req.id)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="xs"
                                    onClick={() => setRejectingTransfer(req)}
                                    className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs"
                                  >
                                    Reject
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  onClick={() => setSelectedTransferForAudit(req)}
                                  className="text-slate-600 hover:bg-slate-100 text-xs"
                                >
                                  <History className="w-3.5 h-3.5 mr-1" />
                                  Audit Log
                                </Button>
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

      {/* New Transfer Modal */}
      <Modal
        isOpen={isNewTransferOpen}
        onClose={() => setIsNewTransferOpen(false)}
        title="Initiate Staff Branch Transfer"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleNewTransferSubmit} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <span className="font-bold text-slate-800 uppercase tracking-wider block text-[10px]">
              Transfer Approval Policy
            </span>
            <p>
              Once submitted, this request enters <strong>Pending</strong> state. Upon authorization, the employee is automatically reassigned and outlet quota counts update immediately.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              1. Select Employee to Transfer *
            </label>
            <select
              value={selectedStaffId}
              onChange={(e) => {
                setSelectedStaffId(e.target.value);
                setToBranchId('');
              }}
              className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
            >
              <option value="">Choose employee from roster...</option>
              {scopedStaff.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.name} ({staff.roleLabel}) — Currently at {staff.branchName?.replace('Spice Garden — ', '')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              2. Current Origin Branch (Auto-detected)
            </label>
            <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 flex items-center justify-between">
              <span>{currentTransferBranch?.name || 'Please select an employee above'}</span>
              <span className="font-mono text-[10px] text-slate-500">{currentTransferBranch?.code}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              3. Target Destination Branch *
            </label>
            <select
              value={toBranchId}
              onChange={(e) => setToBranchId(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
              disabled={!selectedStaffId}
            >
              <option value="">Select destination outlet...</option>
              {branches
                .filter((b) => b.id !== currentTransferBranch?.id)
                .map((b) => {
                  const staffCount = branchStaff.filter((s) => s.branchId === b.id).length;
                  const planCfg = BRANCH_PLANS_CONFIG[b.planId] || BRANCH_PLANS_CONFIG['plan-starter'];
                  return (
                    <option key={b.id} value={b.id}>
                      {b.name} ({staffCount}/{planCfg.maxStaff} staff - {b.planName} Plan)
                    </option>
                  );
                })}
            </select>
          </div>

          {destinationBranch && destPlanConfig && (
            <div
              className={`p-3 rounded-xl border text-xs space-y-1 ${
                isDestFull
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span>Destination Quota Check:</span>
                <span>
                  {destCurrentStaffCount} / {destPlanConfig.maxStaff === 999 ? 'Unlimited' : `${destPlanConfig.maxStaff} Max Staff`}
                </span>
              </div>
              <p className="text-[11px]">
                {isDestFull
                  ? 'Warning: Destination branch has reached its plan limit. Upgrading its plan will be required to approve.'
                  : `Plan: ${destinationBranch.planName}. Destination capacity verified.`}
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              4. Reason for Transfer Request *
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Urgent chef support for peak weekend dinner rush, cross-training, promotion..."
              value={transferReason}
              onChange={(e) => setTransferReason(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" size="sm" onClick={() => setIsNewTransferOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Submit Transfer Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reject Transfer Modal */}
      {rejectingTransfer && (
        <Modal
          isOpen={!!rejectingTransfer}
          onClose={() => setRejectingTransfer(null)}
          title={`Reject Transfer Request: ${rejectingTransfer.id}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleRejectTransferConfirm} className="space-y-4">
            <p className="text-xs text-slate-600">
              Please state why the transfer of <strong>{rejectingTransfer.employeeName}</strong> to{' '}
              <strong>{rejectingTransfer.toBranchName}</strong> is being rejected.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Rejection Reason
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Staff quota full at destination, critical weekend coverage needed at origin..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white text-slate-800"
                required
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setRejectingTransfer(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" type="submit">
                Confirm Rejection
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Audit Log Modal */}
      {selectedTransferForAudit && (
        <Modal
          isOpen={!!selectedTransferForAudit}
          onClose={() => setSelectedTransferForAudit(null)}
          title={`Workflow Audit Log: ${selectedTransferForAudit.id}`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{selectedTransferForAudit.employeeName}</span>
                <Badge status={selectedTransferForAudit.status === 'Approved' ? 'active' : 'inactive'} size="xs" />
              </div>
              <div className="text-slate-500">
                {selectedTransferForAudit.fromBranchName} &rarr; {selectedTransferForAudit.toBranchName}
              </div>
              <div className="text-slate-700 pt-1">
                <strong>Reason:</strong> {selectedTransferForAudit.reason}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Chronological Audit History
              </h5>
              <div className="relative border-l border-slate-200 ml-3 space-y-4 pl-4 py-1">
                {selectedTransferForAudit.history?.map((step, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white" />
                    <p className="font-semibold text-slate-900">{step.action}</p>
                    <p className="text-[11px] text-slate-500">By: {step.by}</p>
                    <span className="text-[10px] text-slate-400 font-mono">{step.date}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <Button variant="primary" size="sm" onClick={() => setSelectedTransferForAudit(null)}>
                Close Audit
              </Button>
            </div>
          </div>
        </Modal>
      )}

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
    </div>
  );
};
export default WorkforcePage;

