import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  Users,
  Code2,
  CheckSquare,
  Cloud,
  Briefcase,
  UserCheck,
  UserX,
  Search,
  Filter,
  Plus,
  Edit3,
  Eye,
  Ban,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronUp,
  Download,
  RotateCcw,
  SlidersHorizontal,
  ExternalLink,
  Layers,
  Activity,
  FileText,
  KeyRound,
  Lock,
  Unlock,
  Check,
  X,
  Building2,
  Boxes,
  CreditCard,
  IndianRupee,
  Rocket,
  Database,
  LayoutDashboard,
  BarChart3,
  Settings,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { FormInput } from '../../components/common/FormInput';
import {
  ROLES_LIST,
  PERMISSION_LEVELS,
  MODULES_LIST,
  MODULE_CATEGORIES,
  INITIAL_PROJECTS,
  getAccessibleModulesForRole,
} from '../../data/roleMatrixData';

// Map icon string names to actual Lucide component
const ICON_COMPONENT_MAP = {
  LayoutDashboard,
  Building2,
  Boxes,
  CreditCard,
  IndianRupee,
  DollarSign: IndianRupee,
  Code2,
  CheckSquare,
  Cloud,
  Database,
  Rocket,
  BarChart3,
  Settings,
};

export const RoleMatrixPage = () => {
  const {
    employees,
    roleMatrixPermissions,
    updateEmployeeRole,
    updateEmployeeStatus,
    updateEmployee,
    addEmployee,
    updateRolePermission,
    resetRoleMatrix,
    platformLogs,
    addToast,
    currentUser,
  } = useApp();

  // Active top tab
  const [activeTab, setActiveTab] = useState('matrix'); // 'matrix' | 'employees' | 'roles' | 'audit'

  // Metric card quick-filter state
  const [quickRoleFilter, setQuickRoleFilter] = useState('all');

  // Matrix view controls
  const [matrixCategoryFilter, setMatrixCategoryFilter] = useState('All Modules');
  const [matrixSearch, setMatrixSearch] = useState('');
  const [selectedRoleForDetail, setSelectedRoleForDetail] = useState('super_admin');
  const [matrixViewMode, setMatrixViewMode] = useState('full_matrix'); // 'full_matrix' | 'role_inspector'

  // Cell permission selector modal
  const [cellEditModal, setCellEditModal] = useState({
    isOpen: false,
    roleKey: null,
    moduleKey: null,
  });

  // Employee table controls
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Employee Profile Drawer / Modal
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileActiveTab, setProfileActiveTab] = useState('permissions'); // 'permissions' | 'activity' | 'security'

  // Edit Employee Modal
  const [isEditEmployeeModalOpen, setIsEditEmployeeModalOpen] = useState(false);
  const [editEmployeeForm, setEditEmployeeForm] = useState({
    id: '',
    name: '',
    email: '',
    roleKey: 'frontend_developer',
    assignedProject: 'StockMate Core Engine',
    department: 'Engineering',
    status: 'active',
  });

  // Add Employee Modal
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [newEmployeeForm, setNewEmployeeForm] = useState({
    name: '',
    email: '',
    roleKey: 'frontend_developer',
    assignedProject: 'StockMate Core Engine',
    department: 'Engineering',
    status: 'active',
  });

  // Confirm Modals
  const [confirmRevokeModal, setConfirmRevokeModal] = useState({
    isOpen: false,
    employee: null,
  });
  const [isResetMatrixConfirmOpen, setIsResetMatrixConfirmOpen] = useState(false);

  // --------------------------------------------------------------------------
  // Summary Metric Calculations
  // --------------------------------------------------------------------------
  const totalEmployeesCount = employees.length;
  const developersCount = employees.filter(
    (e) => e.roleKey === 'frontend_developer' || e.roleKey === 'backend_developer'
  ).length;
  const testersCount = employees.filter((e) => e.roleKey === 'qa_tester').length;
  const devopsCount = employees.filter((e) => e.roleKey === 'devops_engineer').length;
  const pmCount = employees.filter((e) => e.roleKey === 'project_manager').length;
  const activeUsersCount = employees.filter((e) => e.status === 'active').length;

  // Handle clicking a metric card
  const handleSummaryCardClick = (filterKey) => {
    setActiveTab('employees');
    if (quickRoleFilter === filterKey) {
      setQuickRoleFilter('all');
      setRoleFilter('all');
      setStatusFilter('all');
    } else {
      setQuickRoleFilter(filterKey);
      if (filterKey === 'active_only') {
        setStatusFilter('active');
        setRoleFilter('all');
      } else if (filterKey === 'developers') {
        setRoleFilter('developers_all');
        setStatusFilter('all');
      } else {
        setRoleFilter(filterKey);
        setStatusFilter('all');
      }
    }
    setCurrentPage(1);
  };

  // --------------------------------------------------------------------------
  // Filtered Modules for Matrix View
  // --------------------------------------------------------------------------
  const filteredModules = useMemo(() => {
    return MODULES_LIST.filter((mod) => {
      const matchesCategory =
        matrixCategoryFilter === 'All Modules' || mod.category === matrixCategoryFilter;
      const matchesSearch =
        mod.name.toLowerCase().includes(matrixSearch.toLowerCase()) ||
        mod.description.toLowerCase().includes(matrixSearch.toLowerCase()) ||
        mod.category.toLowerCase().includes(matrixSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [matrixCategoryFilter, matrixSearch]);

  // --------------------------------------------------------------------------
  // Filtered & Sorted Employees for Table
  // --------------------------------------------------------------------------
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        emp.id.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        emp.email.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        emp.assignedProject.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        emp.role.toLowerCase().includes(employeeSearch.toLowerCase());

      let matchesRole = true;
      if (roleFilter === 'developers_all') {
        matchesRole =
          emp.roleKey === 'frontend_developer' || emp.roleKey === 'backend_developer';
      } else if (roleFilter !== 'all') {
        matchesRole = emp.roleKey === roleFilter;
      }

      const matchesProject =
        projectFilter === 'all' || emp.assignedProject === projectFilter;
      const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;

      return matchesSearch && matchesRole && matchesProject && matchesStatus;
    });
  }, [employees, employeeSearch, roleFilter, projectFilter, statusFilter]);

  const sortedEmployees = useMemo(() => {
    return [...filteredEmployees].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredEmployees, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedEmployees.length / pageSize) || 1;
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedEmployees.slice(start, start + pageSize);
  }, [sortedEmployees, currentPage, pageSize]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // --------------------------------------------------------------------------
  // Employee Profile Handlers
  // --------------------------------------------------------------------------
  const handleOpenProfile = (emp) => {
    setSelectedEmployee(emp);
    setProfileActiveTab('permissions');
    setIsProfileModalOpen(true);
  };

  const handleOpenEditEmployee = (emp, e) => {
    if (e) e.stopPropagation();
    setEditEmployeeForm({
      id: emp.id,
      name: emp.name,
      email: emp.email,
      roleKey: emp.roleKey,
      assignedProject: emp.assignedProject,
      department: emp.department,
      status: emp.status,
    });
    setIsEditEmployeeModalOpen(true);
  };

  const handleSaveEditEmployee = (e) => {
    e.preventDefault();
    if (!editEmployeeForm.name || !editEmployeeForm.email) {
      addToast('Please enter both name and email.', 'error');
      return;
    }
    const roleDef = ROLES_LIST.find((r) => r.key === editEmployeeForm.roleKey);
    updateEmployee(editEmployeeForm.id, {
      name: editEmployeeForm.name,
      email: editEmployeeForm.email,
      role: roleDef?.name || editEmployeeForm.roleKey,
      roleKey: editEmployeeForm.roleKey,
      assignedProject: editEmployeeForm.assignedProject,
      department: editEmployeeForm.department,
      status: editEmployeeForm.status,
    });
    // Update local selected employee if drawer is open
    if (selectedEmployee?.id === editEmployeeForm.id) {
      setSelectedEmployee((prev) => ({
        ...prev,
        ...editEmployeeForm,
        role: roleDef?.name || editEmployeeForm.roleKey,
      }));
    }
    setIsEditEmployeeModalOpen(false);
  };

  const handleOpenAddEmployee = () => {
    setNewEmployeeForm({
      name: '',
      email: '',
      roleKey: 'frontend_developer',
      assignedProject: INITIAL_PROJECTS[0],
      department: 'Engineering',
      status: 'active',
    });
    setIsAddEmployeeModalOpen(true);
  };

  const handleSaveAddEmployee = (e) => {
    e.preventDefault();
    if (!newEmployeeForm.name || !newEmployeeForm.email) {
      addToast('Please enter employee name and email.', 'error');
      return;
    }
    const created = addEmployee(newEmployeeForm);
    setIsAddEmployeeModalOpen(false);
    handleOpenProfile(created);
  };

  const handleInitiateRevoke = (emp, e) => {
    if (e) e.stopPropagation();
    setConfirmRevokeModal({
      isOpen: true,
      employee: emp,
    });
  };

  const handleConfirmRevoke = () => {
    if (confirmRevokeModal.employee) {
      updateEmployeeStatus(
        confirmRevokeModal.employee.id,
        'suspended',
        'Revoked by Super Admin'
      );
      if (selectedEmployee?.id === confirmRevokeModal.employee.id) {
        setSelectedEmployee((prev) => ({
          ...prev,
          status: 'suspended',
          tokenStatus: 'Revoked (Administrative Hold)',
        }));
      }
    }
  };

  const handleToggleStatus = (emp, e) => {
    if (e) e.stopPropagation();
    const nextStatus = emp.status === 'active' ? 'suspended' : 'active';
    updateEmployeeStatus(emp.id, nextStatus);
    if (selectedEmployee?.id === emp.id) {
      setSelectedEmployee((prev) => ({
        ...prev,
        status: nextStatus,
        tokenStatus:
          nextStatus === 'active'
            ? 'Active (OAuth2 / Ed25519)'
            : 'Revoked (Administrative Hold)',
      }));
    }
  };

  // --------------------------------------------------------------------------
  // Matrix Cell Edit Handlers
  // --------------------------------------------------------------------------
  const handleOpenCellEdit = (roleKey, moduleKey) => {
    setCellEditModal({
      isOpen: true,
      roleKey,
      moduleKey,
    });
  };

  const handleSelectCellPermission = (newLevel) => {
    if (cellEditModal.roleKey && cellEditModal.moduleKey) {
      updateRolePermission(cellEditModal.roleKey, cellEditModal.moduleKey, newLevel);
      setCellEditModal({ isOpen: false, roleKey: null, moduleKey: null });
    }
  };

  // Export Matrix to CSV
  const handleExportMatrixCSV = () => {
    const headers = ['Module', 'Category', ...ROLES_LIST.map((r) => r.name)];
    const rows = MODULES_LIST.map((mod) => {
      const rolePerms = ROLES_LIST.map((r) => {
        const pKey = roleMatrixPermissions[r.key]?.[mod.key] || 'no_access';
        return PERMISSION_LEVELS[pKey]?.label || pKey;
      });
      return [`"${mod.name}"`, `"${mod.category}"`, ...rolePerms.map((p) => `"${p}"`)].join(
        ','
      );
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StockMate_Role_Matrix_Policy_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Role Matrix policy exported to CSV successfully.', 'success');
  };

  // Export Employees to CSV
  const handleExportEmployeesCSV = () => {
    const headers = [
      'ID',
      'Name',
      'Email',
      'Role',
      'Department',
      'Assigned Project',
      'Status',
      'Last Active',
      'Accessible Modules Count',
    ];
    const rows = filteredEmployees.map((emp) => {
      const accessibleCount = getAccessibleModulesForRole(
        emp.roleKey,
        roleMatrixPermissions
      ).length;
      return [
        `"${emp.id}"`,
        `"${emp.name}"`,
        `"${emp.email}"`,
        `"${emp.role}"`,
        `"${emp.department}"`,
        `"${emp.assignedProject}"`,
        `"${emp.status}"`,
        `"${emp.lastActive}"`,
        `"${accessibleCount}"`,
      ].join(',');
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StockMate_Employees_Roster_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Employee access roster exported to CSV.', 'success');
  };

  // Helper for permission pill render
  const renderPermissionPill = (permKey, onClick, isInteractive = true) => {
    const config = PERMISSION_LEVELS[permKey] || PERMISSION_LEVELS.no_access;
    return (
      <button
        type="button"
        disabled={!isInteractive}
        onClick={onClick}
        title={isInteractive ? `Click to modify: ${config.label} (${config.description})` : config.label}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border transition-all ${
          config.badgeClass
        } ${
          isInteractive
            ? 'hover:shadow-xs hover:scale-102 cursor-pointer active:scale-98'
            : 'cursor-default'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
        <span className="font-medium whitespace-nowrap">{config.label}</span>
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Role Matrix & Access Management"
        subtitle="Enterprise RBAC permission matrix, platform team assignments, and granular module access control"
        badge={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            Platform Control / RBAC v2.8
          </span>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={
                activeTab === 'employees'
                  ? handleExportEmployeesCSV
                  : handleExportMatrixCSV
              }
            >
              Export {activeTab === 'employees' ? 'Roster' : 'Matrix'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={RotateCcw}
              onClick={() => setIsResetMatrixConfirmOpen(true)}
            >
              Reset Matrix
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={handleOpenAddEmployee}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
            >
              Add Employee
            </Button>
          </div>
        }
      />

      {/* Enterprise Architecture Notice Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 shadow-sm border border-indigo-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0 text-indigo-300">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-white">
                  Granular Enterprise RBAC & Security Boundary
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Enforced
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-400/20 text-indigo-200 border border-indigo-400/30">
                  Demo RBAC Simulator
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Super Admin governance console. In this interactive environment, live permission changes persist in local storage with automated audit logging. In production, permission matrices compile into cryptographically signed Ed25519 JWT scopes validated at the API Gateway and enforced via PostgreSQL Row-Level Security (RLS).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveTab('roles');
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-300" />
              Role Specs
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/60 hover:bg-indigo-600 text-white border border-indigo-500/50 transition-colors flex items-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5" />
              Live Audit Log
            </button>
          </div>
        </div>
      </div>

      {/* 6 Responsive Summary Metric KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <StatCard
          title="Total Employees"
          value={totalEmployeesCount}
          subtext="Full platform team"
          icon={Users}
          accentColor="blue"
          onClick={() => handleSummaryCardClick('all')}
          className={`cursor-pointer transition-all ${
            quickRoleFilter === 'all' && activeTab === 'employees'
              ? 'ring-2 ring-blue-500 shadow-md bg-blue-50/20'
              : ''
          }`}
        />

        <StatCard
          title="Developers"
          value={developersCount}
          subtext="FE & BE Engineering"
          icon={Code2}
          accentColor="emerald"
          onClick={() => handleSummaryCardClick('developers')}
          className={`cursor-pointer transition-all ${
            quickRoleFilter === 'developers' && activeTab === 'employees'
              ? 'ring-2 ring-emerald-500 shadow-md bg-emerald-50/20'
              : ''
          }`}
        />

        <StatCard
          title="QA Testers"
          value={testersCount}
          subtext="Quality & Automation"
          icon={CheckSquare}
          accentColor="purple"
          onClick={() => handleSummaryCardClick('qa_tester')}
          className={`cursor-pointer transition-all ${
            quickRoleFilter === 'qa_tester' && activeTab === 'employees'
              ? 'ring-2 ring-purple-500 shadow-md bg-purple-50/20'
              : ''
          }`}
        />

        <StatCard
          title="DevOps Engineers"
          value={devopsCount}
          subtext="Infra, Cloud & SRE"
          icon={Cloud}
          accentColor="indigo"
          onClick={() => handleSummaryCardClick('devops_engineer')}
          className={`cursor-pointer transition-all ${
            quickRoleFilter === 'devops_engineer' && activeTab === 'employees'
              ? 'ring-2 ring-indigo-500 shadow-md bg-indigo-50/20'
              : ''
          }`}
        />

        <StatCard
          title="Project Managers"
          value={pmCount}
          subtext="Product & Delivery"
          icon={Briefcase}
          accentColor="amber"
          onClick={() => handleSummaryCardClick('project_manager')}
          className={`cursor-pointer transition-all ${
            quickRoleFilter === 'project_manager' && activeTab === 'employees'
              ? 'ring-2 ring-amber-500 shadow-md bg-amber-50/20'
              : ''
          }`}
        />

        <StatCard
          title="Active Users"
          value={activeUsersCount}
          subtext="Online / Active status"
          icon={UserCheck}
          accentColor="rose"
          onClick={() => handleSummaryCardClick('active_only')}
          className={`cursor-pointer transition-all ${
            quickRoleFilter === 'active_only' && activeTab === 'employees'
              ? 'ring-2 ring-rose-500 shadow-md bg-rose-50/20'
              : ''
          }`}
        />
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-1 overflow-x-auto pb-px">
          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'matrix'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Permission Matrix</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">
              12 Modules
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('employees')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'employees'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Platform Employees & Access</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-50 text-indigo-700 font-bold">
              {employees.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('roles')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'roles'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Role Definitions & Specs</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">
              7 Roles
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'audit'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>RBAC Security Audit Trail</span>
          </button>
        </div>

        {activeTab === 'matrix' && (
          <div className="hidden sm:flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setMatrixViewMode('full_matrix')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                matrixViewMode === 'full_matrix'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Full Grid Matrix
            </button>
            <button
              type="button"
              onClick={() => setMatrixViewMode('role_inspector')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                matrixViewMode === 'role_inspector'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Role Inspector
            </button>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: PERMISSION MATRIX VIEW */}
      {/* ==================================================================== */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          {/* Controls Bar: Category Filters, Search, and Legend */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {MODULE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setMatrixCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    matrixCategoryFilter === cat
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Module + Legend */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-60">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search modules / endpoints..."
                  value={matrixSearch}
                  onChange={(e) => setMatrixSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                {matrixSearch && (
                  <button
                    type="button"
                    onClick={() => setMatrixSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Legend Badges */}
              <div className="hidden xl:flex items-center gap-1.5 pl-3 border-l border-slate-200">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
                  Legend:
                </span>
                {Object.values(PERMISSION_LEVELS).map((p) => (
                  <span
                    key={p.key}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] border ${p.badgeClass}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${p.dotClass}`} />
                    {p.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* View Mode 1: Full Grid Matrix */}
          {matrixViewMode === 'full_matrix' ? (
            <div className="w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[960px]">
                  <thead>
                    <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                      {/* Sticky First Column for Modules */}
                      <th className="py-4 px-4 sticky left-0 z-20 bg-slate-50/95 backdrop-blur-xs min-w-[240px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">
                        Platform Module ({filteredModules.length})
                      </th>
                      {ROLES_LIST.map((role) => (
                        <th key={role.key} className="py-4 px-3 text-center min-w-[130px]">
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-bold text-slate-800">{role.name}</span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${role.badgeClass}`}
                            >
                              {role.shortCode} • {role.team.split(' ')[0]}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredModules.map((mod) => {
                      const IconComp = ICON_COMPONENT_MAP[mod.icon] || Boxes;
                      return (
                        <tr
                          key={mod.key}
                          className="hover:bg-slate-50/70 transition-colors duration-100 group"
                        >
                          {/* Module info cell (sticky) */}
                          <td className="py-3.5 px-4 sticky left-0 z-10 bg-white group-hover:bg-slate-50/70 transition-colors shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                                <IconComp className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900 flex items-center gap-2">
                                  <span>{mod.name}</span>
                                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                    {mod.category}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                                  {mod.description}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Role cells */}
                          {ROLES_LIST.map((role) => {
                            const permKey =
                              roleMatrixPermissions[role.key]?.[mod.key] || 'no_access';
                            return (
                              <td
                                key={role.key}
                                className="py-3 px-2 text-center align-middle"
                              >
                                {renderPermissionPill(permKey, () =>
                                  handleOpenCellEdit(role.key, mod.key)
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Footer info */}
              <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Click any permission badge in the table to instantly modify the access tier.</span>
                </div>
                <div className="font-medium">
                  Showing {filteredModules.length} of {MODULES_LIST.length} platform modules
                </div>
              </div>
            </div>
          ) : (
            /* View Mode 2: Role Inspector Mode */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Role Selector List */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-2 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-3">
                  Select Role to Inspect
                </h4>
                {ROLES_LIST.map((role) => {
                  const isSelected = selectedRoleForDetail === role.key;
                  const membersCount = employees.filter(
                    (e) => e.roleKey === role.key
                  ).length;
                  return (
                    <button
                      key={role.key}
                      type="button"
                      onClick={() => setSelectedRoleForDetail(role.key)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                          : 'border-slate-200/80 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border ${role.badgeClass}`}
                        >
                          {role.shortCode}
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-slate-900">
                            {role.name}
                          </div>
                          <div className="text-[11px] text-slate-500">{role.team}</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
                        {membersCount} {membersCount === 1 ? 'user' : 'users'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Role Detail & Module Overrides */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-6 space-y-6 shadow-xs">
                {(() => {
                  const roleObj =
                    ROLES_LIST.find((r) => r.key === selectedRoleForDetail) ||
                    ROLES_LIST[0];
                  const accessibleMods = getAccessibleModulesForRole(
                    roleObj.key,
                    roleMatrixPermissions
                  );
                  return (
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <h3 className="text-lg font-bold text-slate-900">
                              {roleObj.name}
                            </h3>
                            <span
                              className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${roleObj.badgeClass}`}
                            >
                              {roleObj.team}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            {roleObj.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-600">
                            Accessible Modules:
                          </span>
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {accessibleMods.length} / 12
                          </span>
                        </div>
                      </div>

                      {/* Module-by-module list for selected role */}
                      <div className="space-y-3">
                        {MODULES_LIST.map((mod) => {
                          const IconComp = ICON_COMPONENT_MAP[mod.icon] || Boxes;
                          const currentPerm =
                            roleMatrixPermissions[roleObj.key]?.[mod.key] || 'no_access';
                          return (
                            <div
                              key={mod.key}
                              className="p-3.5 rounded-xl border border-slate-200/80 hover:border-slate-300 bg-slate-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                                  <IconComp className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-xs text-slate-900">
                                      {mod.name}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                      {mod.apiEndpoint}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    {mod.description}
                                  </p>
                                </div>
                              </div>

                              {/* Radio selector for permissions */}
                              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                                {Object.values(PERMISSION_LEVELS).map((level) => {
                                  const isActive = currentPerm === level.key;
                                  return (
                                    <button
                                      key={level.key}
                                      type="button"
                                      onClick={() =>
                                        updateRolePermission(
                                          roleObj.key,
                                          mod.key,
                                          level.key
                                        )
                                      }
                                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                                        isActive
                                          ? `${level.badgeClass} ring-2 ring-indigo-500/20 shadow-xs`
                                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'
                                      }`}
                                    >
                                      {level.shortLabel}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: PLATFORM EMPLOYEES & ACCESS ROSTER */}
      {/* ==================================================================== */}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          {/* Employee Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search employee by name, ID, email, role, or project..."
                value={employeeSearch}
                onChange={(e) => {
                  setEmployeeSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/60 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              {employeeSearch && (
                <button
                  type="button"
                  onClick={() => setEmployeeSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Role Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                  Role:
                </span>
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setQuickRoleFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="all">All Roles</option>
                  <option value="developers_all">All Developers (FE + BE)</option>
                  {ROLES_LIST.map((r) => (
                    <option key={r.key} value={r.key}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Project Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                  Project:
                </span>
                <select
                  value={projectFilter}
                  onChange={(e) => {
                    setProjectFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 max-w-[180px] truncate"
                >
                  <option value="all">All Projects</option>
                  {INITIAL_PROJECTS.map((proj) => (
                    <option key={proj} value={proj}>
                      {proj}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                  Status:
                </span>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="on_leave">On Leave</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              {(employeeSearch ||
                roleFilter !== 'all' ||
                projectFilter !== 'all' ||
                statusFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setEmployeeSearch('');
                    setRoleFilter('all');
                    setProjectFilter('all');
                    setStatusFilter('all');
                    setQuickRoleFilter('all');
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 font-semibold transition-colors"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Employee Table */}
          <div className="w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th
                      className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/80 select-none transition-colors"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Employee & ID</span>
                        {sortField === 'name' ? (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="w-3.5 h-3.5 text-indigo-600" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-indigo-600" />
                          )
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
                        )}
                      </div>
                    </th>

                    <th
                      className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/80 select-none transition-colors"
                      onClick={() => handleSort('role')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Role</span>
                        {sortField === 'role' && (
                          <ChevronUp
                            className={`w-3.5 h-3.5 text-indigo-600 ${
                              sortDirection === 'desc' ? 'rotate-180' : ''
                            }`}
                          />
                        )}
                      </div>
                    </th>

                    <th
                      className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/80 select-none transition-colors"
                      onClick={() => handleSort('assignedProject')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Assigned Project</span>
                        {sortField === 'assignedProject' && (
                          <ChevronUp
                            className={`w-3.5 h-3.5 text-indigo-600 ${
                              sortDirection === 'desc' ? 'rotate-180' : ''
                            }`}
                          />
                        )}
                      </div>
                    </th>

                    <th className="py-3.5 px-4">Accessible Modules</th>

                    <th
                      className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/80 select-none transition-colors"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Status</span>
                        {sortField === 'status' && (
                          <ChevronUp
                            className={`w-3.5 h-3.5 text-indigo-600 ${
                              sortDirection === 'desc' ? 'rotate-180' : ''
                            }`}
                          />
                        )}
                      </div>
                    </th>

                    <th
                      className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/80 select-none transition-colors"
                      onClick={() => handleSort('lastActive')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Last Active</span>
                        {sortField === 'lastActive' && (
                          <ChevronUp
                            className={`w-3.5 h-3.5 text-indigo-600 ${
                              sortDirection === 'desc' ? 'rotate-180' : ''
                            }`}
                          />
                        )}
                      </div>
                    </th>

                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-sm">
                  {paginatedEmployees.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-500">
                        <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <p className="font-semibold text-slate-700">No employees found</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Try adjusting your search criteria or role filters.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedEmployees.map((emp) => {
                      const roleDef =
                        ROLES_LIST.find((r) => r.key === emp.roleKey) || ROLES_LIST[0];
                      const accessibleMods = getAccessibleModulesForRole(
                        emp.roleKey,
                        roleMatrixPermissions
                      );

                      return (
                        <tr
                          key={emp.id}
                          onClick={() => handleOpenProfile(emp)}
                          className="hover:bg-slate-50/80 cursor-pointer transition-colors duration-100 group"
                        >
                          {/* Name, avatar, ID */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={emp.avatar}
                                alt={emp.name}
                                className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-indigo-400 transition-all shrink-0"
                              />
                              <div>
                                <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                                  <span>{emp.name}</span>
                                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                    {emp.id}
                                  </span>
                                </div>
                                <div className="text-xs text-slate-500">{emp.email}</div>
                              </div>
                            </div>
                          </td>

                          {/* Role badge */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleDef.badgeClass}`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                              {emp.role}
                            </span>
                          </td>

                          {/* Assigned Project */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-800">
                              <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[180px]">
                                {emp.assignedProject}
                              </span>
                            </div>
                          </td>

                          {/* Accessible Modules summary pill */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                {accessibleMods.length} / 12
                              </span>
                              <div className="hidden lg:flex items-center gap-1">
                                {accessibleMods.slice(0, 3).map((m) => (
                                  <span
                                    key={m.key}
                                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium"
                                  >
                                    {m.name}
                                  </span>
                                ))}
                                {accessibleMods.length > 3 && (
                                  <span className="text-[10px] text-slate-400 font-semibold">
                                    +{accessibleMods.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <Badge
                              status={emp.status}
                              label={
                                emp.status === 'active'
                                  ? 'Active'
                                  : emp.status === 'on_leave'
                                  ? 'On Leave'
                                  : 'Suspended'
                              }
                            />
                          </td>

                          {/* Last Active */}
                          <td className="py-3.5 px-4 text-xs text-slate-500">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{emp.lastActive}</span>
                            </div>
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3.5 px-4 text-right">
                            <div
                              className="flex items-center justify-end gap-1.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant="outline"
                                size="xs"
                                onClick={() => handleOpenProfile(emp)}
                                title="View Complete Profile & Permissions"
                              >
                                Profile
                              </Button>
                              <Button
                                variant="outline"
                                size="xs"
                                icon={Edit3}
                                onClick={(e) => handleOpenEditEmployee(emp, e)}
                                title="Edit Role or Project"
                              />
                              {emp.status === 'active' ? (
                                <button
                                  type="button"
                                  onClick={(e) => handleInitiateRevoke(emp, e)}
                                  title="Revoke Access (Suspend Account)"
                                  className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                                >
                                  <Ban className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => handleToggleStatus(emp, e)}
                                  title="Reactivate Account Access"
                                  className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
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

            {/* Pagination & Results Count Footer */}
            <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-3">
              <div className="flex items-center gap-3">
                <span>
                  Showing{' '}
                  <strong className="text-slate-700">
                    {filteredEmployees.length === 0
                      ? 0
                      : (currentPage - 1) * pageSize + 1}
                  </strong>{' '}
                  to{' '}
                  <strong className="text-slate-700">
                    {Math.min(currentPage * pageSize, filteredEmployees.length)}
                  </strong>{' '}
                  of{' '}
                  <strong className="text-slate-700">{filteredEmployees.length}</strong>{' '}
                  team members
                </span>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                </div>
              </div>

              {/* Page Controls */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="xs"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(
                    Math.max(0, currentPage - 3),
                    Math.min(totalPages, currentPage + 2)
                  )
                  .map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                        currentPage === pageNum
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
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
      )}

      {/* ==================================================================== */}
      {/* TAB 3: ROLE DEFINITIONS & CAPABILITIES */}
      {/* ==================================================================== */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ROLES_LIST.map((role) => {
              const assignedMembers = employees.filter((e) => e.roleKey === role.key);
              const accessibleModules = getAccessibleModulesForRole(
                role.key,
                roleMatrixPermissions
              );
              const fullCount = accessibleModules.filter(
                (m) => m.permission === 'full_access'
              ).length;
              const editCount = accessibleModules.filter(
                (m) => m.permission === 'edit'
              ).length;
              const readCount = accessibleModules.filter(
                (m) => m.permission === 'read_only'
              ).length;

              return (
                <div
                  key={role.key}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow group"
                >
                  <div className="space-y-3.5">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border shadow-xs ${role.badgeClass}`}
                        >
                          {role.shortCode}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {role.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {role.team}
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        {assignedMembers.length} users
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {role.description}
                    </p>

                    {/* Permissions breakdown */}
                    <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 space-y-2">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Module Authority Summary
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200/60 text-emerald-800">
                          <div className="font-bold">{fullCount}</div>
                          <div className="text-[10px] text-emerald-600 font-medium">
                            Full Access
                          </div>
                        </div>
                        <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-200/60 text-blue-800">
                          <div className="font-bold">{editCount}</div>
                          <div className="text-[10px] text-blue-600 font-medium">Edit</div>
                        </div>
                        <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200/60 text-amber-800">
                          <div className="font-bold">{readCount}</div>
                          <div className="text-[10px] text-amber-600 font-medium">
                            Read Only
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Key Responsibilities */}
                    <div className="text-xs text-slate-500">
                      <strong className="text-slate-700">Key Scope: </strong>
                      {role.responsibilities}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRoleForDetail(role.key);
                        setMatrixViewMode('role_inspector');
                        setActiveTab('matrix');
                      }}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <span>Configure Permissions</span>
                      <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setRoleFilter(role.key);
                        setActiveTab('employees');
                      }}
                      className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                    >
                      View Roster →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: RBAC SECURITY AUDIT TRAIL */}
      {/* ==================================================================== */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-semibold text-sm text-slate-900">
                  Access Management & Policy Mutation Audit Stream
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Immutable record of role changes, permission overrides, and security events.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Auditing
              </span>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {platformLogs
                .filter(
                  (l) =>
                    l.category === 'Access Control' ||
                    l.category === 'RBAC Policy' ||
                    l.category === 'Security' ||
                    l.category === 'System' ||
                    l.action.toLowerCase().includes('role') ||
                    l.action.toLowerCase().includes('permission') ||
                    l.action.toLowerCase().includes('access')
                )
                .slice(0, 15)
                .map((log) => (
                  <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                        <KeyRound className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-slate-900">
                          {log.action}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>
                            Actor: <strong>{log.actor}</strong>
                          </span>
                          <span>•</span>
                          <span>Target: {log.target}</span>
                          <span>•</span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">
                            {log.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-medium text-slate-600">
                        {new Date(log.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* EMPLOYEE PROFILE MODAL / DRAWER */}
      {/* ==================================================================== */}
      {selectedEmployee && (
        <Modal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          title=""
          maxWidth="max-w-3xl"
        >
          <div className="space-y-6">
            {/* Header Card with Gradient */}
            <div className="relative -mt-5 -mx-6 p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-t-2xl border-b border-indigo-800/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedEmployee.avatar}
                    alt={selectedEmployee.name}
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-white/20 shadow-md shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-bold text-white">
                        {selectedEmployee.name}
                      </h2>
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-white/10 text-indigo-200 border border-white/20">
                        {selectedEmployee.id}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          selectedEmployee.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : selectedEmployee.status === 'on_leave'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {selectedEmployee.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-indigo-200/80 mt-1.5">
                      <span className="font-semibold text-white">
                        {selectedEmployee.role}
                      </span>
                      <span>•</span>
                      <span>{selectedEmployee.department}</span>
                      <span>•</span>
                      <span>Joined {selectedEmployee.joinedDate}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Edit3}
                    onClick={() => handleOpenEditEmployee(selectedEmployee)}
                    className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                  >
                    Edit Role
                  </Button>
                </div>
              </div>

              {/* Sub-bar with contact details */}
              <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
                <div className="flex items-center gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate">{selectedEmployee.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate">{selectedEmployee.assignedProject}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{selectedEmployee.location || 'Headquarters'}</span>
                </div>
              </div>
            </div>

            {/* Profile Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200">
              <button
                type="button"
                onClick={() => setProfileActiveTab('permissions')}
                className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
                  profileActiveTab === 'permissions'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Module Permissions (12)
              </button>
              <button
                type="button"
                onClick={() => setProfileActiveTab('activity')}
                className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
                  profileActiveTab === 'activity'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Recent Activity & Audit Trail
              </button>
              <button
                type="button"
                onClick={() => setProfileActiveTab('security')}
                className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
                  profileActiveTab === 'security'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Security & Credentials
              </button>
            </div>

            {/* Sub-Tab 1: Assigned Module Permissions */}
            {profileActiveTab === 'permissions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Permissions inherited from <strong>{selectedEmployee.role}</strong>{' '}
                    policy matrix.
                  </span>
                  <span className="font-semibold text-indigo-600">
                    {
                      getAccessibleModulesForRole(
                        selectedEmployee.roleKey,
                        roleMatrixPermissions
                      ).length
                    }{' '}
                    Accessible Modules
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                  {MODULES_LIST.map((mod) => {
                    const IconComp = ICON_COMPONENT_MAP[mod.icon] || Boxes;
                    const permLevel =
                      roleMatrixPermissions[selectedEmployee.roleKey]?.[mod.key] ||
                      'no_access';
                    const permObj =
                      PERMISSION_LEVELS[permLevel] || PERMISSION_LEVELS.no_access;

                    return (
                      <div
                        key={mod.key}
                        className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-indigo-600 flex items-center justify-center shrink-0">
                            <IconComp className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-xs text-slate-900 truncate">
                              {mod.name}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {mod.category}
                            </div>
                          </div>
                        </div>

                        {renderPermissionPill(permLevel, null, false)}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sub-Tab 2: Recent Activity Timeline */}
            {profileActiveTab === 'activity' && (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {selectedEmployee.recentActivities &&
                selectedEmployee.recentActivities.length > 0 ? (
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {selectedEmployee.recentActivities.map((act) => (
                      <div key={act.id} className="relative">
                        <span
                          className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 border-white ring-2 ${
                            act.status === 'blocked'
                              ? 'bg-rose-500 ring-rose-200'
                              : act.status === 'warning'
                              ? 'bg-amber-500 ring-amber-200'
                              : 'bg-emerald-500 ring-emerald-200'
                          }`}
                        />
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-xs text-slate-900">
                              {act.action}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {act.timestamp}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                            <span>Target: {act.target}</span>
                            <span>•</span>
                            <span className="font-mono text-[10px]">
                              IP: {act.ipAddress}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    No recent activity logs recorded for this employee.
                  </div>
                )}
              </div>
            )}

            {/* Sub-Tab 3: Security & Credentials */}
            {profileActiveTab === 'security' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1.5">
                    <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-indigo-600" />
                      Two-Factor Authentication (2FA)
                    </div>
                    <div className="text-sm font-bold text-slate-900">
                      {selectedEmployee.twoFactorEnabled ? 'Enabled & Enforced' : 'Disabled'}
                    </div>
                    <p className="text-xs text-slate-500">
                      {selectedEmployee.twoFactorEnabled
                        ? 'Hardware FIDO2 YubiKey / TOTP Authenticator registered.'
                        : 'Account pending 2FA enrollment upon next login.'}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1.5">
                    <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                      API Token & Session Status
                    </div>
                    <div className="text-sm font-bold text-slate-900">
                      {selectedEmployee.tokenStatus || 'Active (OAuth2 / Ed25519)'}
                    </div>
                    <p className="text-xs text-slate-500">
                      JWT issued with cryptographic role claims. Expires every 8 hours.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/60 text-amber-900 text-xs flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold">Super Admin Security Override</strong>
                    <p className="mt-0.5 text-amber-800 leading-relaxed">
                      Revoking access will immediately revoke OAuth refresh tokens, invalidate Kubernetes service account tokens, and log the user out of all mobile and desktop sessions.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Actions Footer */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {selectedEmployee.status === 'active' ? (
                  <Button
                    variant="danger"
                    size="sm"
                    icon={Ban}
                    onClick={() => handleInitiateRevoke(selectedEmployee)}
                  >
                    Revoke Access
                  </Button>
                ) : (
                  <Button
                    variant="success"
                    size="sm"
                    icon={CheckCircle2}
                    onClick={() => handleToggleStatus(selectedEmployee)}
                  >
                    Restore Platform Access
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    addToast(
                      `Sent password reset & credential refresh email to ${selectedEmployee.email}`,
                      'info'
                    );
                  }}
                >
                  Send Reset Link
                </Button>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsProfileModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ==================================================================== */}
      {/* QUICK CELL EDIT PERMISSION SELECTOR MODAL */}
      {/* ==================================================================== */}
      <Modal
        isOpen={cellEditModal.isOpen}
        onClose={() =>
          setCellEditModal({ isOpen: false, roleKey: null, moduleKey: null })
        }
        title="Modify Module Permission"
        subtitle={
          cellEditModal.roleKey && cellEditModal.moduleKey
            ? `Select permission tier for ${
                ROLES_LIST.find((r) => r.key === cellEditModal.roleKey)?.name
              } on module "${
                MODULES_LIST.find((m) => m.key === cellEditModal.moduleKey)?.name
              }"`
            : ''
        }
        maxWidth="max-w-md"
      >
        <div className="space-y-3">
          {Object.values(PERMISSION_LEVELS).map((level) => {
            const currentLevel =
              cellEditModal.roleKey && cellEditModal.moduleKey
                ? roleMatrixPermissions[cellEditModal.roleKey]?.[
                    cellEditModal.moduleKey
                  ]
                : null;
            const isSelected = currentLevel === level.key;

            return (
              <button
                key={level.key}
                type="button"
                onClick={() => handleSelectCellPermission(level.key)}
                className={`w-full p-3.5 rounded-xl border text-left flex items-start justify-between gap-3 transition-all ${
                  isSelected
                    ? `${level.badgeClass} ring-2 ring-indigo-500/30`
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${level.dotClass}`} />
                    <span className="font-bold text-sm text-slate-900">
                      {level.label}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{level.description}</p>
                </div>
                {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />}
              </button>
            );
          })}
        </div>
      </Modal>

      {/* ==================================================================== */}
      {/* ADD EMPLOYEE MODAL */}
      {/* ==================================================================== */}
      <Modal
        isOpen={isAddEmployeeModalOpen}
        onClose={() => setIsAddEmployeeModalOpen(false)}
        title="Provision Platform Employee"
        subtitle="Onboard a new engineer, manager, or support specialist to the StockMate platform"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveAddEmployee} className="space-y-4">
          <FormInput
            label="Full Name"
            placeholder="e.g. Maya Patel"
            value={newEmployeeForm.name}
            onChange={(e) =>
              setNewEmployeeForm((prev) => ({ ...prev, name: e.target.value }))
            }
            required
          />

          <FormInput
            label="Corporate Email"
            type="email"
            placeholder="e.g. maya.p@stockmate.io"
            value={newEmployeeForm.email}
            onChange={(e) =>
              setNewEmployeeForm((prev) => ({ ...prev, email: e.target.value }))
            }
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Assigned Platform Role
            </label>
            <select
              value={newEmployeeForm.roleKey}
              onChange={(e) =>
                setNewEmployeeForm((prev) => ({ ...prev, roleKey: e.target.value }))
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {ROLES_LIST.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.name} ({r.team})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Assigned Project / Workstream
            </label>
            <select
              value={newEmployeeForm.assignedProject}
              onChange={(e) =>
                setNewEmployeeForm((prev) => ({
                  ...prev,
                  assignedProject: e.target.value,
                }))
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {INITIAL_PROJECTS.map((proj) => (
                <option key={proj} value={proj}>
                  {proj}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Department
              </label>
              <select
                value={newEmployeeForm.department}
                onChange={(e) =>
                  setNewEmployeeForm((prev) => ({
                    ...prev,
                    department: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="Engineering">Engineering</option>
                <option value="Infrastructure & SRE">Infrastructure & SRE</option>
                <option value="Product & Delivery">Product & Delivery</option>
                <option value="Quality Engineering">Quality Engineering</option>
                <option value="Customer Success">Customer Success</option>
                <option value="Executive & Governance">Executive & Governance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Initial Status
              </label>
              <select
                value={newEmployeeForm.status}
                onChange={(e) =>
                  setNewEmployeeForm((prev) => ({ ...prev, status: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="active">Active</option>
                <option value="on_leave">On Leave</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => setIsAddEmployeeModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Provision Employee
            </Button>
          </div>
        </form>
      </Modal>

      {/* ==================================================================== */}
      {/* EDIT EMPLOYEE MODAL */}
      {/* ==================================================================== */}
      <Modal
        isOpen={isEditEmployeeModalOpen}
        onClose={() => setIsEditEmployeeModalOpen(false)}
        title="Edit Employee Role & Project"
        subtitle={`Update assignment settings for ${editEmployeeForm.name} (${editEmployeeForm.id})`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveEditEmployee} className="space-y-4">
          <FormInput
            label="Full Name"
            value={editEmployeeForm.name}
            onChange={(e) =>
              setEditEmployeeForm((prev) => ({ ...prev, name: e.target.value }))
            }
            required
          />

          <FormInput
            label="Email Address"
            type="email"
            value={editEmployeeForm.email}
            onChange={(e) =>
              setEditEmployeeForm((prev) => ({ ...prev, email: e.target.value }))
            }
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Assigned Role
            </label>
            <select
              value={editEmployeeForm.roleKey}
              onChange={(e) =>
                setEditEmployeeForm((prev) => ({ ...prev, roleKey: e.target.value }))
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {ROLES_LIST.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.name} ({r.team})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Assigned Project
            </label>
            <select
              value={editEmployeeForm.assignedProject}
              onChange={(e) =>
                setEditEmployeeForm((prev) => ({
                  ...prev,
                  assignedProject: e.target.value,
                }))
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {INITIAL_PROJECTS.map((proj) => (
                <option key={proj} value={proj}>
                  {proj}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Department
              </label>
              <select
                value={editEmployeeForm.department}
                onChange={(e) =>
                  setEditEmployeeForm((prev) => ({
                    ...prev,
                    department: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="Engineering">Engineering</option>
                <option value="Infrastructure & SRE">Infrastructure & SRE</option>
                <option value="Product & Delivery">Product & Delivery</option>
                <option value="Quality Engineering">Quality Engineering</option>
                <option value="Customer Success">Customer Success</option>
                <option value="Executive & Governance">Executive & Governance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Status
              </label>
              <select
                value={editEmployeeForm.status}
                onChange={(e) =>
                  setEditEmployeeForm((prev) => ({ ...prev, status: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="active">Active</option>
                <option value="on_leave">On Leave</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => setIsEditEmployeeModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* ==================================================================== */}
      {/* CONFIRM REVOKE MODAL */}
      {/* ==================================================================== */}
      <ConfirmModal
        isOpen={confirmRevokeModal.isOpen}
        onClose={() => setConfirmRevokeModal({ isOpen: false, employee: null })}
        onConfirm={handleConfirmRevoke}
        title="Revoke Platform Access"
        message={
          confirmRevokeModal.employee
            ? `Are you sure you want to revoke access for ${confirmRevokeModal.employee.name} (${confirmRevokeModal.employee.id})? This will immediately terminate all active sessions, invalidate API tokens, and place their account on administrative suspension.`
            : ''
        }
        confirmText="Revoke Access"
        cancelText="Keep Active"
        type="danger"
      />

      {/* ==================================================================== */}
      {/* CONFIRM RESET MATRIX MODAL */}
      {/* ==================================================================== */}
      <ConfirmModal
        isOpen={isResetMatrixConfirmOpen}
        onClose={() => setIsResetMatrixConfirmOpen(false)}
        onConfirm={resetRoleMatrix}
        title="Reset Role Matrix to Enterprise Defaults"
        message="Are you sure you want to revert all custom module permissions for all 7 platform roles back to standard baseline policies? Any custom overrides will be reset."
        confirmText="Reset to Defaults"
        cancelText="Cancel"
        type="warning"
      />
    </div>
  );
};

