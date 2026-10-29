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
  AlertCircle,
  Lock,
  Clock,
  IndianRupee,
  Receipt,
  CreditCard,
  XCircle,
  Eye,
  Send,
  Sparkles,
  Timer,
  Check,
  Copy,
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
import { SalarySlipModal } from '../../components/kitchen/SalarySlipModal';

// Auto-generate next Employee ID (e.g. EMP-0001, EMP-0002)
const generateNextEmployeeId = (allStaff = []) => {
  let maxId = 0;
  (allStaff || []).forEach((s) => {
    if (s.employeeId && typeof s.employeeId === 'string') {
      const match = s.employeeId.match(/EMP-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxId) maxId = num;
      }
    }
  });
  if (maxId === 0) {
    maxId = (allStaff || []).length;
  }
  const nextNum = maxId + 1;
  return `EMP-${String(nextNum).padStart(4, '0')}`;
};

// Auto-generate a random 6-character temporary password
const generateTempPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let pass = '';
  for (let i = 0; i < 6; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
};

export const BranchStaffPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    currentUser,
    branches,
    currentBranchId,
    branchStaff,
    addBranchStaffMember,
    removeBranchStaffMember,
    verifyStaffBankDetails,
    assignBranchManager,
    attendanceRecords,
    leaveRequests,
    reviewLeaveRequest,
    salaryPayments,
    STAFF_SALARY_PROFILES,
    addToast,
  } = useApp();

  // Active Tab from query param or default to roster
  const initialTab = searchParams.get('tab') || 'roster';
  const [activeTab, setActiveTab] = useState(initialTab); // 'roster' | 'attendance' | 'leave' | 'payroll'

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [leaveStatusFilter, setLeaveStatusFilter] = useState('all');

  // Modals
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isAssignMgrOpen, setIsAssignMgrOpen] = useState(false);
  const [staffToRemove, setStaffToRemove] = useState(null);
  const [selectedStaffDetails, setSelectedStaffDetails] = useState(null);

  // Salary & Slip Modals
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [salaryTargetStaff, setSalaryTargetStaff] = useState(null);
  const [viewingSalarySlip, setViewingSalarySlip] = useState(null);

  // Quick rejection review modal
  const [rejectingLeave, setRejectingLeave] = useState(null);
  const [rejectReason, setRejectReason] = useState('Kitchen line coverage constraint during peak rush');

  // Branch is auto-set to the manager's own branch (not editable)
  const managerBranchId = useMemo(() => {
    if (currentUser?.role === 'restaurant_manager') {
      return currentUser.branchId || 'branch-pune-central';
    }
    return currentBranchId || branches[0]?.id || 'branch-pune-central';
  }, [currentUser, currentBranchId, branches]);

  const managerBranch = useMemo(() => {
    return (
      branches.find((b) => b.id === managerBranchId) || {
        id: managerBranchId,
        name: 'Spice Garden — Pune Central',
      }
    );
  }, [branches, managerBranchId]);

  // Add Staff Form with required fields
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'kitchen_staff',
    roleLabel: 'Line Cook',
    joinedDate: new Date().toISOString().split('T')[0],
    shift: 'Morning Shift (07:00 AM - 03:30 PM)',
    baseSalary: '25000',
    isManager: false,
    assignedModules: ['Kitchen Terminal', 'Prep Usage'],
  });

  const [formErrors, setFormErrors] = useState({});
  const [invitedStaffSuccess, setInvitedStaffSuccess] = useState(null);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [verifyingStaff, setVerifyingStaff] = useState(null);

  // Helper: Manager sees the account number masked only; full number is visible only to Owner and self
  const getVisibleAccountDisplay = (staffMember, viewer) => {
    if (!staffMember) return { bankName: 'Bank', accountNumber: '•••• 4421', isMasked: true };
    const isOwner = viewer?.role === 'restaurant_owner';
    const isSelf = viewer?.id === staffMember.id;
    const isManager = viewer?.role === 'restaurant_manager';

    const bank = staffMember.bankDetails || {};
    const bankName = bank.bankName || (staffMember.bankAccount ? staffMember.bankAccount.split(' ••••')[0] : 'HDFC Bank');
    const masked = bank.maskedAccountNumber || (staffMember.bankAccount ? `•••• ${staffMember.bankAccount.slice(-4)}` : '•••• 4421');
    const full = bank.accountNumberFull || bank.accountNumber || (staffMember.bankAccount?.includes('••••') ? staffMember.bankAccount.replace('••••', '50100456') : staffMember.bankAccount) || '501004564421';

    if (isManager && !isSelf) {
      // Manager MUST see masked only!
      return {
        bankName,
        accountNumber: masked,
        isMasked: true,
      };
    }

    if (isOwner || isSelf) {
      // Owner and self can view full account number
      return {
        bankName,
        accountNumber: full,
        isMasked: false,
      };
    }

    return {
      bankName,
      accountNumber: masked,
      isMasked: true,
    };
  };

  // Assign Manager Form
  const [assignMgrForm, setAssignMgrForm] = useState({
    branchId: branches[0]?.id || '',
    managerId: '',
  });

  // Live active attendance
  const activeAttendance = attendanceRecords?.filter((r) => r.status === 'active') || [];
  const pendingLeaves = leaveRequests?.filter((l) => l.status === 'pending') || [];

  // KPI calculations
  const totalEmployees = branchStaff.length;
  const totalOnDuty = activeAttendance.length;
  const pendingLeavesCount = pendingLeaves.length;
  const totalMonthlyPayrollDisbursed = salaryPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  // Filtered staff
  const filteredStaff = useMemo(() => {
    return branchStaff.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.roleLabel.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesBranch = branchFilter === 'all' || s.branchId === branchFilter;
      const matchesRole =
        roleFilter === 'all' ||
        (roleFilter === 'restaurant_manager' && s.role === 'restaurant_manager') ||
        (roleFilter === 'inventory_manager' && s.role === 'inventory_manager') ||
        (roleFilter === 'manager' && (s.isManager || s.role === 'restaurant_manager' || s.role === 'inventory_manager')) ||
        (roleFilter === 'kitchen' && s.role === 'kitchen_staff');

      return matchesSearch && matchesBranch && matchesRole;
    });
  }, [branchStaff, searchTerm, branchFilter, roleFilter]);

  // Filtered leave requests
  const filteredLeaves = useMemo(() => {
    return leaveRequests.filter((l) => {
      const matchesStatus = leaveStatusFilter === 'all' || l.status === leaveStatusFilter;
      const matchesBranch = branchFilter === 'all' || l.branchId === branchFilter;
      return matchesStatus && matchesBranch;
    });
  }, [leaveRequests, leaveStatusFilter, branchFilter]);

  // Handle Add Staff Submit
  const handleAddSubmit = (e) => {
    e.preventDefault();
    const errors = {};

    // 1. Validate Name
    if (!addForm.name.trim()) {
      errors.name = 'Full name is required.';
    }

    // 2. Validate Email format and uniqueness
    const emailTrimmed = (addForm.email || '').trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailTrimmed) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(emailTrimmed)) {
      errors.email = 'Please enter a valid email format (e.g. name@company.com).';
    } else {
      const emailLower = emailTrimmed.toLowerCase();
      const duplicate = (branchStaff || []).some(
        (s) => s.email && s.email.trim().toLowerCase() === emailLower
      );
      if (duplicate) {
        errors.email = 'A staff member with this email address already exists.';
      }
    }

    // 3. Validate Role Label, Joining Date & Wage
    if (!addForm.roleLabel.trim()) {
      errors.roleLabel = 'Job title is required.';
    }
    if (!addForm.joinedDate) {
      errors.joinedDate = 'Joining date is required.';
    }
    if (!addForm.baseSalary || Number(addForm.baseSalary) <= 0) {
      errors.baseSalary = 'Please enter a valid base monthly wage.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      addToast('Please complete all required fields correctly.', 'error');
      return;
    }

    // Check branch quota
    const targetBranch = managerBranch;
    const planConfig = BRANCH_PLANS_CONFIG[targetBranch?.planId] || BRANCH_PLANS_CONFIG['plan-starter'];
    const currentStaffCount = branchStaff.filter((s) => s.branchId === managerBranchId).length;

    if (currentStaffCount >= planConfig.maxStaff) {
      addToast(
        `Staff quota reached for ${targetBranch?.name}. Plan allows maximum ${planConfig.maxStaff} staff. Please upgrade the branch plan.`,
        'error'
      );
      return;
    }

    // Auto-generate: Employee ID (e.g. EMP-0001) and random 6-character temporary password
    const employeeId = generateNextEmployeeId(branchStaff);
    const tempPassword = generateTempPassword();

    // Call service layer (temporary password will be hashed inside addBranchStaffMember; plain text is never stored)
    const newStaff = addBranchStaffMember({
      name: addForm.name.trim(),
      email: emailTrimmed,
      phone: addForm.phone.trim() || '+91 98200 XXXXX',
      role: addForm.role,
      roleLabel: addForm.roleLabel.trim(),
      branchId: managerBranchId,
      branchName: targetBranch?.name || 'Branch',
      joinedDate: addForm.joinedDate,
      shift: addForm.shift,
      baseSalary: Number(addForm.baseSalary),
      employeeId,
      tempPassword,
      status: 'Invited',
      mustChangePassword: true,
      isManager: addForm.role === 'restaurant_manager' || addForm.role === 'inventory_manager',
      assignedModules:
        addForm.role === 'restaurant_manager'
          ? ['Staff Management', 'Attendance Clock', 'Leave Approvals', 'Staff Transfers', 'Staff Reports', 'Alerts']
          : addForm.role === 'inventory_manager'
          ? ['Inventory', 'Suppliers', 'Purchase Orders', 'Receiving Dock', 'Reports']
          : ['Kitchen Terminal', 'Prep Usage', 'Wastage'],
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    });

    if (!newStaff) return;

    // Reset add form and close modal
    setIsAddStaffOpen(false);
    setFormErrors({});
    setAddForm({
      name: '',
      email: '',
      phone: '',
      role: 'kitchen_staff',
      roleLabel: 'Line Cook',
      joinedDate: new Date().toISOString().split('T')[0],
      shift: 'Morning Shift (07:00 AM - 03:30 PM)',
      baseSalary: '25000',
      isManager: false,
      assignedModules: ['Kitchen Terminal', 'Prep Usage'],
    });

    // Show temporary password once in a success dialog with a Copy button
    setInvitedStaffSuccess({
      staff: newStaff,
      tempPassword,
      employeeId,
    });
  };

  // Handle Assign Manager Submit
  const handleAssignManagerSubmit = (e) => {
    e.preventDefault();
    if (!assignMgrForm.branchId || !assignMgrForm.managerId) {
      addToast('Please select both Branch and Manager', 'error');
      return;
    }

    assignBranchManager(assignMgrForm.branchId, assignMgrForm.managerId);
    setIsAssignMgrOpen(false);
  };

  // Confirm delete staff
  const handleConfirmRemove = () => {
    if (staffToRemove) {
      removeBranchStaffMember(staffToRemove.id);
      setStaffToRemove(null);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Branch Staff, Attendance &amp; Payroll"
        subtitle="Manage outlet staff assignments, track live punch clock attendance, approve leave requests, and disburse salaries."
        actions={
          <div className="flex flex-wrap items-center gap-2">
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
              onClick={() => navigate('/staff-transfers')}
            >
              Transfer Staff
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={Star}
              onClick={() => setIsAssignMgrOpen(true)}
            >
              Appoint Manager
            </Button>
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Employees"
          value={totalEmployees}
          subtitle="Across All Outlets"
          icon={Users}
          variant="default"
        />
        <StatCard
          title="Live On Duty Now"
          value={totalOnDuty}
          subtitle="Punched In at Station"
          icon={Clock}
          variant={totalOnDuty > 0 ? 'success' : 'default'}
        />
        <StatCard
          title="Leave Requests"
          value={pendingLeavesCount}
          subtitle={pendingLeavesCount > 0 ? 'Requires Manager Review' : 'All Clear'}
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
          <button
            onClick={() => handleTabChange('roster')}
            className={`py-3 px-1 border-b-2 font-semibold text-xs flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'roster'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Staff Roster &amp; Outlets ({branchStaff.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('attendance')}
            className={`py-3 px-1 border-b-2 font-semibold text-xs flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'attendance'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Live Attendance &amp; Timesheets</span>
            {totalOnDuty > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                {totalOnDuty} On Duty
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabChange('leave')}
            className={`py-3 px-1 border-b-2 font-semibold text-xs flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'leave'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Leave Requests Management</span>
            {pendingLeavesCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-bold animate-pulse">
                {pendingLeavesCount} Pending
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabChange('payroll')}
            className={`py-3 px-1 border-b-2 font-semibold text-xs flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'payroll'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <IndianRupee className="w-4 h-4" />
            <span>Salary &amp; Payroll Management</span>
          </button>
        </nav>
      </div>

      {/* TAB 1: STAFF ROSTER & OUTLETS */}
      {activeTab === 'roster' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
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

          {/* Staff Roster Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Employee</th>
                    <th className="py-3.5 px-4">Role &amp; Title</th>
                    <th className="py-3.5 px-4">Assigned Outlet</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Bank Status</th>
                    <th className="py-3.5 px-4">Live Attendance Status</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-xs text-slate-500">
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
                                  {staff.status === 'Invited' && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                      Invited
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500 flex items-center gap-2">
                                  <span>{staff.email}</span>
                                  {staff.employeeId && (
                                    <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 rounded">
                                      {staff.employeeId}
                                    </span>
                                  )}
                                </div>
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

                          {/* Status Column: Invited / Active / Inactive */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                (staff.status || 'Active').toLowerCase() === 'active'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : staff.status === 'Invited'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {staff.status || 'Active'}
                            </span>
                          </td>

                          {/* Bank Status Badge & Masked/Full Account Display */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    (staff.bankStatus || 'Not Added') === 'Verified'
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      : staff.bankStatus === 'Pending Verification'
                                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                                  }`}
                                >
                                  {(staff.bankStatus || 'Not Added') === 'Verified' ? (
                                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                  ) : staff.bankStatus === 'Pending Verification' ? (
                                    <Clock className="w-2.5 h-2.5 text-amber-600" />
                                  ) : (
                                    <AlertCircle className="w-2.5 h-2.5 text-slate-400" />
                                  )}
                                  {staff.bankStatus || 'Not Added'}
                                </span>

                                {/* Verify Button for Restaurant Manager and Owner */}
                                {(currentUser?.role === 'restaurant_manager' || currentUser?.role === 'restaurant_owner') &&
                                  staff.bankStatus === 'Pending Verification' && (
                                    <button
                                      type="button"
                                      onClick={() => setVerifyingStaff(staff)}
                                      className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                                      title="Review and verify bank account details"
                                    >
                                      Verify
                                    </button>
                                  )}
                              </div>

                              {/* Account Number Display: Manager sees masked only; Owner and self see full number */}
                              {staff.bankStatus !== 'Not Added' && (
                                <div className="text-[11px] font-mono text-slate-600 flex items-center gap-1">
                                  <CreditCard className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span>{getVisibleAccountDisplay(staff, currentUser).accountNumber}</span>
                                  {getVisibleAccountDisplay(staff, currentUser).isMasked && (
                                    <span className="text-[9px] text-slate-400">(Masked)</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Live Attendance Status Column */}
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
                            <div className="text-slate-800">{staff.phone || '+91 98200 XXXXX'}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Auth: Configured & Encrypted
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
                                title="Disburse salary and send notification"
                                className="text-emerald-800 border-emerald-200 hover:bg-emerald-50"
                              >
                                <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
                                Pay
                              </Button>

                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => navigate('/staff-transfers')}
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
          {/* Live Station Board */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
                  Live On-Duty Station Attendance Board
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Currently active shifts clocked in via terminal time clocks across outlets.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                {activeAttendance.length} Staff Clocked In Right Now
              </span>
            </div>

            {activeAttendance.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                No staff members currently punched in.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeAttendance.map((rec) => {
                  const inTime = new Date(rec.punchInTime);
                  const diffHrs = Math.max(0.1, Number(((Date.now() - inTime.getTime()) / (1000 * 60 * 60)).toFixed(1)));

                  return (
                    <div
                      key={rec.id}
                      className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 flex items-start gap-3 shadow-2xs"
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

          {/* Complete Attendance Timesheets Ledger */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm">Historical Shift Attendance Logs</h4>
              <span className="text-xs text-slate-400">{attendanceRecords.length} Total Logs</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Outlet / Branch</th>
                    <th className="py-3 px-4">Station</th>
                    <th className="py-3 px-4">Punch In</th>
                    <th className="py-3 px-4">Punch Out</th>
                    <th className="py-3 px-4">Hours</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendanceRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-medium text-slate-800">{rec.date}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{rec.staffName}</span>
                        <span className="text-[10px] text-slate-400">{rec.staffRole}</span>
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
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {rec.totalHours ? `${rec.totalHours} hrs` : <span className="text-emerald-600">Active</span>}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            rec.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {rec.status === 'active' ? 'Active' : 'Completed'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-500 truncate max-w-xs">{rec.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LEAVE REQUESTS MANAGEMENT */}
      {activeTab === 'leave' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Staff Leave Requisitions &amp; Approvals</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Accept or reject employee leave applications. Approved dates will reflect in roster scheduling.
              </p>
            </div>

            <div className="flex items-center gap-2">
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
                            currentUser?.role === 'restaurant_owner' ? (
                              <span className="text-[11px] text-amber-600 font-medium italic">
                                Pending Manager Review
                              </span>
                            ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="outline"
                                size="xs"
                                onClick={() => reviewLeaveRequest(leave.id, 'rejected', 'Kitchen coverage constraints during service')}
                                className="text-rose-600 hover:bg-rose-50"
                              >
                                Reject
                              </Button>
                              <Button
                                variant="brand"
                                size="xs"
                                onClick={() => reviewLeaveRequest(leave.id, 'approved', 'Approved by Manager')}
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

      {/* TAB 4: SALARY & PAYROLL MANAGEMENT */}
      {activeTab === 'payroll' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Staff Payroll &amp; Remuneration Console
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Disburse monthly employee compensation, award performance bonuses, and dispatch instant salary credit alerts.
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
              Disburse Salary &amp; Send Alert
            </Button>
          </div>

          {/* Staff Pay Profiles Table */}
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
                    const isStaffActive = (staff.status || 'Active').toLowerCase() === 'active';
                    const isBankVerified = (staff.bankStatus || '').toLowerCase() === 'verified';
                    const canDisburse = isStaffActive && isBankVerified;

                    let disburseDisabledReason = '';
                    if (!isStaffActive && !isBankVerified) {
                      disburseDisabledReason = 'Cannot disburse: Staff is not Active and bank details are not Verified.';
                    } else if (!isStaffActive) {
                      disburseDisabledReason = `Cannot disburse: Staff status is "${staff.status || 'Invited'}" (must be Active).`;
                    } else if (!isBankVerified) {
                      disburseDisabledReason = `Cannot disburse: Bank status is "${staff.bankStatus || 'Not Added'}" (must be Verified).`;
                    }

                    return (
                      <tr key={staff.id} className="hover:bg-slate-50/70">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{staff.name}</span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                              isStaffActive ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {staff.status || 'Active'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500">{staff.roleLabel}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{staff.branchName || 'Pune Central'}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {formatINR(profile?.baseSalary || 35000)}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <div className="space-y-0.5">
                            <div className="font-medium text-slate-800">
                              {getVisibleAccountDisplay(staff, currentUser).accountNumber}
                            </div>
                            <span className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded font-bold ${
                              isBankVerified
                                ? 'bg-emerald-50 text-emerald-700'
                                : staff.bankStatus === 'Pending Verification'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {staff.bankStatus || 'Not Added'}
                            </span>
                          </div>
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
                          <div className="inline-block" title={!canDisburse ? disburseDisabledReason : 'Disburse compensation'}>
                            <Button
                              variant={canDisburse ? 'primary' : 'outline'}
                              size="xs"
                              icon={IndianRupee}
                              disabled={!canDisburse}
                              onClick={() => {
                                if (canDisburse) {
                                  setSalaryTargetStaff(staff);
                                  setIsSalaryModalOpen(true);
                                }
                              }}
                              className={!canDisburse ? 'opacity-50 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200' : ''}
                            >
                              Disburse
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Salary Settlement History */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm">Disbursed Salary Ledger History</h4>
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
                          View Slip
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

      {/* Disburse Salary Modal */}
      <ProcessSalaryModal
        isOpen={isSalaryModalOpen}
        onClose={() => {
          setIsSalaryModalOpen(false);
          setSalaryTargetStaff(null);
        }}
        selectedStaff={salaryTargetStaff}
      />

      {/* Salary Slip Detail Modal */}
      <SalarySlipModal
        isOpen={!!viewingSalarySlip}
        onClose={() => setViewingSalarySlip(null)}
        payment={viewingSalarySlip}
      />

      {/* Add Staff Member Modal */}
      <Modal
        isOpen={isAddStaffOpen}
        onClose={() => {
          setIsAddStaffOpen(false);
          setFormErrors({});
        }}
        title="Add Staff Member"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {/* Read-only Branch Notice - No Target Branch dropdown */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Assigned Branch</div>
                <div className="text-xs font-bold text-slate-900">{managerBranch.name}</div>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">
              Auto-assigned to your branch
            </span>
          </div>

          {/* Full Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FormInput
                label="Full Name *"
                placeholder="e.g. Chef Alok Kumar"
                value={addForm.name}
                onChange={(e) => {
                  setAddForm({ ...addForm, name: e.target.value });
                  if (formErrors.name) setFormErrors({ ...formErrors, name: null });
                }}
                required
              />
              {formErrors.name && (
                <p className="text-[11px] text-rose-600 mt-1">{formErrors.name}</p>
              )}
            </div>

            <div>
              <FormInput
                label="Email Address *"
                type="email"
                placeholder="alok.k@spicegarden.com"
                value={addForm.email}
                onChange={(e) => {
                  setAddForm({ ...addForm, email: e.target.value });
                  if (formErrors.email) setFormErrors({ ...formErrors, email: null });
                }}
                required
              />
              {formErrors.email && (
                <p className="text-[11px] text-rose-600 mt-1">{formErrors.email}</p>
              )}
            </div>
          </div>

          {/* Phone & Staff Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Contact Phone"
              placeholder="+91 98200 XXXXX"
              value={addForm.phone}
              onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Staff Role *
              </label>
              <select
                value={addForm.role}
                onChange={(e) => {
                  const val = e.target.value;
                  setAddForm({
                    ...addForm,
                    role: val,
                    roleLabel:
                      val === 'restaurant_manager'
                        ? 'General Restaurant Manager'
                        : val === 'inventory_manager'
                        ? 'Inventory / Store Manager'
                        : val === 'kitchen_staff'
                        ? 'Line Cook'
                        : 'Staff User',
                    isManager: val === 'restaurant_manager' || val === 'inventory_manager',
                  });
                }}
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="kitchen_staff">Kitchen Staff (Line Cook, Chef, Prep)</option>
                <option value="restaurant_manager">Restaurant Manager (Staff, Attendance & Operations)</option>
                <option value="inventory_manager">Inventory Manager (Stock, Purchasing & Dock)</option>
              </select>
            </div>
          </div>

          {/* Job Title & Joining Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FormInput
                label="Job Title *"
                placeholder="e.g. Head Pastry Chef, Senior Line Cook"
                value={addForm.roleLabel}
                onChange={(e) => {
                  setAddForm({ ...addForm, roleLabel: e.target.value });
                  if (formErrors.roleLabel) setFormErrors({ ...formErrors, roleLabel: null });
                }}
                required
              />
              {formErrors.roleLabel && (
                <p className="text-[11px] text-rose-600 mt-1">{formErrors.roleLabel}</p>
              )}
            </div>

            <div>
              <FormInput
                label="Joining Date *"
                type="date"
                value={addForm.joinedDate}
                onChange={(e) => {
                  setAddForm({ ...addForm, joinedDate: e.target.value });
                  if (formErrors.joinedDate) setFormErrors({ ...formErrors, joinedDate: null });
                }}
                required
              />
              {formErrors.joinedDate && (
                <p className="text-[11px] text-rose-600 mt-1">{formErrors.joinedDate}</p>
              )}
            </div>
          </div>

          {/* Shift Schedule & Base Monthly Wage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Shift Schedule *
              </label>
              <select
                value={addForm.shift}
                onChange={(e) => setAddForm({ ...addForm, shift: e.target.value })}
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="Morning Shift (07:00 AM - 03:30 PM)">Morning Shift (07:00 AM - 03:30 PM)</option>
                <option value="Evening Shift (03:00 PM - 11:30 PM)">Evening Shift (03:00 PM - 11:30 PM)</option>
                <option value="Night / Closing Shift (07:00 PM - 03:30 AM)">Night / Closing Shift (07:00 PM - 03:30 AM)</option>
                <option value="General Full-Day (09:00 AM - 06:00 PM)">General Full-Day (09:00 AM - 06:00 PM)</option>
              </select>
            </div>

            <div>
              <FormInput
                label="Base Monthly Wage (₹) *"
                type="number"
                min="0"
                placeholder="e.g. 28000"
                value={addForm.baseSalary}
                onChange={(e) => {
                  setAddForm({ ...addForm, baseSalary: e.target.value });
                  if (formErrors.baseSalary) setFormErrors({ ...formErrors, baseSalary: null });
                }}
                required
              />
              {formErrors.baseSalary && (
                <p className="text-[11px] text-rose-600 mt-1">{formErrors.baseSalary}</p>
              )}
            </div>
          </div>

          {/* Automated Onboarding Notice */}
          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
            <Key className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">Automated Credentials &amp; Onboarding</div>
              <p className="text-[11px] text-blue-700 mt-0.5">
                An Employee ID and a random 6-character temporary password will be auto-generated. The temporary password will be shown once for copying upon submission.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAddStaffOpen(false);
                setFormErrors({});
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Add Staff Member
            </Button>
          </div>
        </form>
      </Modal>

      {/* Success Dialog: Temporary Password Shown Once */}
      <Modal
        isOpen={!!invitedStaffSuccess}
        onClose={() => {
          setInvitedStaffSuccess(null);
          setCopiedPassword(false);
        }}
        title="Staff Invitation Created"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-1">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">
              {invitedStaffSuccess?.staff?.name} Invited Successfully
            </h4>
            <p className="text-xs text-slate-600">
              Assigned ID: <span className="font-mono font-bold text-emerald-800">{invitedStaffSuccess?.employeeId}</span>
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Email:</span>
              <span className="font-medium text-slate-800">{invitedStaffSuccess?.staff?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Role & Title:</span>
              <span className="font-medium text-slate-800">{invitedStaffSuccess?.staff?.roleLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Branch:</span>
              <span className="font-medium text-slate-800">{invitedStaffSuccess?.staff?.branchName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Joining Date:</span>
              <span className="font-medium text-slate-800">{invitedStaffSuccess?.staff?.joinedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Shift:</span>
              <span className="font-medium text-slate-800">{invitedStaffSuccess?.staff?.shift}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status:</span>
              <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full text-[10px] border border-blue-200">
                Invited (mustChangePassword = true)
              </span>
            </div>
          </div>

          {/* Temporary Password Box */}
          <div className="p-4 rounded-xl bg-amber-50/80 border-2 border-amber-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-700" /> Temporary Password
              </span>
              <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                Shown Once
              </span>
            </div>

            <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-amber-200 shadow-xs">
              <span className="font-mono text-xl font-extrabold tracking-widest text-slate-900 select-all">
                {invitedStaffSuccess?.tempPassword}
              </span>
              <Button
                variant={copiedPassword ? 'secondary' : 'primary'}
                size="xs"
                icon={copiedPassword ? Check : Copy}
                onClick={() => {
                  if (invitedStaffSuccess?.tempPassword) {
                    navigator.clipboard.writeText(invitedStaffSuccess.tempPassword);
                    setCopiedPassword(true);
                    addToast('Temporary password copied to clipboard!', 'success');
                    setTimeout(() => setCopiedPassword(false), 2500);
                  }
                }}
              >
                {copiedPassword ? 'Copied!' : 'Copy'}
              </Button>
            </div>

            <p className="text-[11px] text-amber-800 leading-relaxed">
              <strong>Security Policy:</strong> This temporary password will not be shown again and is stored as a secure cryptographic hash. The employee will be required to change it on their first login.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setInvitedStaffSuccess(null);
                setCopiedPassword(false);
              }}
            >
              Done
            </Button>
          </div>
        </div>
      </Modal>

      {/* Existing Assign Manager Modal */}
      <Modal
        isOpen={isAssignMgrOpen}
        onClose={() => setIsAssignMgrOpen(false)}
        title="Appoint Branch Manager"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAssignManagerSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Branch *
            </label>
            <select
              value={assignMgrForm.branchId}
              onChange={(e) => setAssignMgrForm({ ...assignMgrForm, branchId: e.target.value })}
              className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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
              Select Qualified Manager / Lead *
            </label>
            <select
              value={assignMgrForm.managerId}
              onChange={(e) => setAssignMgrForm({ ...assignMgrForm, managerId: e.target.value })}
              className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
            >
              <option value="">-- Choose Staff Member --</option>
              {branchStaff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.roleLabel} • {s.branchName})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" size="sm" onClick={() => setIsAssignMgrOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Confirm Appointment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Existing Staff Details Modal */}
      {selectedStaffDetails && (
        <Modal
          isOpen={!!selectedStaffDetails}
          onClose={() => setSelectedStaffDetails(null)}
          title="Staff Member Profile"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <img
                src={
                  selectedStaffDetails.avatar ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
                }
                alt={selectedStaffDetails.name}
                className="w-12 h-12 rounded-full object-cover border"
              />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{selectedStaffDetails.name}</h4>
                <p className="text-xs text-slate-500">{selectedStaffDetails.email}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <Badge status={selectedStaffDetails.role} size="xs" />
                  {selectedStaffDetails.isManager && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                      General Manager
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-slate-500">Assigned Branch:</span>
                <span className="font-semibold text-slate-900">{selectedStaffDetails.branchName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-slate-500">Phone:</span>
                <span className="font-semibold text-slate-900">{selectedStaffDetails.phone}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-slate-500">Access Credential:</span>
                <span className="font-mono text-slate-400">•••••••• (Encrypted)</span>
              </div>
              <div className="pt-2">
                <span className="text-slate-500 block mb-1.5">Assigned Modules:</span>
                <div className="flex flex-wrap gap-1">
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
      {/* Bank Details Verification Modal for Restaurant Manager and Owner */}
      <Modal
        isOpen={!!verifyingStaff}
        onClose={() => setVerifyingStaff(null)}
        title="Verify Staff Bank Account"
        maxWidth="max-w-md"
      >
        {verifyingStaff && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Staff Member:</span>
                <span className="font-bold text-slate-900">{verifyingStaff.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Role &amp; Title:</span>
                <span className="font-medium text-slate-800">{verifyingStaff.roleLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bank Name:</span>
                <span className="font-bold text-slate-900">
                  {verifyingStaff.bankDetails?.bankName || 'HDFC Bank'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Account Number:</span>
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-900">
                    {getVisibleAccountDisplay(verifyingStaff, currentUser).accountNumber}
                  </span>
                  {getVisibleAccountDisplay(verifyingStaff, currentUser).isMasked && (
                    <div className="text-[10px] text-slate-400">
                      Full number restricted to Restaurant Owner
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">IFSC Code:</span>
                <span className="font-mono font-bold text-emerald-800">
                  {verifyingStaff.bankDetails?.ifscCode || 'HDFC0001234'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Bank Status:</span>
                <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-[10px]">
                  {verifyingStaff.bankStatus || 'Pending Verification'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <span>
                Verifying certifies that the account holder name and IFSC match payroll bank records. Once verified, salary disbursements will be enabled.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setVerifyingStaff(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={CheckCircle2}
                onClick={() => {
                  verifyStaffBankDetails(verifyingStaff.id);
                  setVerifyingStaff(null);
                }}
              >
                Confirm &amp; Verify Bank Details
              </Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};
