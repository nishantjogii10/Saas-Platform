import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  Store,
  Plus,
  Search,
  Filter,
  MapPin,
  Phone,
  Mail,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  PowerOff,
  Sparkles,
  Users,
  Boxes,
  MoreVertical,
  Check,
  X,
  Clock,
  ArrowRight,
  ShieldCheck,
  CalendarCheck,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { FormInput } from '../../components/common/FormInput';
import { formatINR, BRANCH_PLANS_CONFIG } from '../../data/branchData';

export const BranchesPage = () => {
  const navigate = useNavigate();
  const {
    branches,
    organizationBranches,
    currentUser,
    currentBranchId,
    switchBranch,
    addBranch,
    updateBranch,
    toggleBranchStatus,
    branchStaff,
    addToast,
  } = useApp();

  const branchList = currentUser?.role === 'restaurant_owner' || currentUser?.role === 'super_admin'
    ? (organizationBranches || branches)
    : branches;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [deactivatingBranch, setDeactivatingBranch] = useState(null);
  const [selectedBranchDetails, setSelectedBranchDetails] = useState(null);

  // Form State for Add Branch
  const [addForm, setAddForm] = useState({
    name: '',
    code: '',
    type: 'Dine-In Flagship',
    address: '',
    phone: '',
    email: '',
    managerId: '',
    openingHours: '11:00 AM – 11:30 PM',
    seatingCapacity: '80',
    planId: 'plan-pro',
    billingCycle: 'Monthly',
  });

  // Summary Metrics
  const totalBranches = branchList.length;
  const activeBranches = branchList.filter((b) => b.status === 'active').length;
  const inactiveBranches = totalBranches - activeBranches;
  const totalSeating = branchList.reduce((acc, b) => acc + (Number(b.seatingCapacity) || 0), 0);

  // Filtered branches
  const filteredBranches = useMemo(() => {
    return branchList.filter((b) => {
      const matchesSearch =
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.managerName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
      const matchesPlan = planFilter === 'all' || b.planId === planFilter;

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [branchList, searchTerm, statusFilter, planFilter]);

  // Open Edit Modal
  const handleOpenEdit = (branch) => {
    setEditingBranch(branch);
    setIsEditModalOpen(true);
  };

  // Submit Add Branch
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!addForm.name || !addForm.address || !addForm.phone) {
      addToast('Please fill in required fields (Name, Address, Phone)', 'error');
      return;
    }

    const assignedMgr = branchStaff.find((s) => s.id === addForm.managerId);

    const newBranch = addBranch({
      name: addForm.name,
      code: addForm.code || `SG-OUT-${branches.length + 1}`,
      type: addForm.type,
      address: addForm.address,
      phone: addForm.phone,
      email: addForm.email || 'outlet@spicegarden.com',
      managerId: assignedMgr?.id || 'usr-sg-2',
      managerName: assignedMgr?.name || 'Rahul Verma',
      managerEmail: assignedMgr?.email || 'rahul.v@spicegarden.com',
      openingHours: addForm.openingHours,
      seatingCapacity: Number(addForm.seatingCapacity) || 60,
      planId: addForm.planId,
      billingCycle: addForm.billingCycle,
    });

    setIsAddModalOpen(false);
    setAddForm({
      name: '',
      code: '',
      type: 'Dine-In Flagship',
      address: '',
      phone: '',
      email: '',
      managerId: '',
      openingHours: '11:00 AM – 11:30 PM',
      seatingCapacity: '80',
      planId: 'plan-pro',
      billingCycle: 'Monthly',
    });
  };

  // Submit Edit Branch
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingBranch) return;

    const assignedMgr = branchStaff.find((s) => s.id === editingBranch.managerId);

    updateBranch(editingBranch.id, {
      name: editingBranch.name,
      code: editingBranch.code,
      type: editingBranch.type,
      address: editingBranch.address,
      phone: editingBranch.phone,
      email: editingBranch.email,
      managerId: assignedMgr?.id || editingBranch.managerId,
      managerName: assignedMgr?.name || editingBranch.managerName,
      managerEmail: assignedMgr?.email || editingBranch.managerEmail,
      openingHours: editingBranch.openingHours,
      seatingCapacity: Number(editingBranch.seatingCapacity) || 60,
    });

    setIsEditModalOpen(false);
    setEditingBranch(null);
  };

  // Toggle Status Confirm
  const handleToggleStatus = () => {
    if (deactivatingBranch) {
      toggleBranchStatus(deactivatingBranch.id);
      setDeactivatingBranch(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Branches Management"
        subtitle="Configure physical restaurant outlets, locations, assigned branch managers, and operational state."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={CalendarCheck}
              onClick={() => navigate('/branch-subscriptions')}
            >
              Subscription Plans
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsAddModalOpen(true)}
            >
              Add New Branch
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Outlets"
          value={totalBranches}
          subtitle="Spice Garden Outlets"
          icon={Building2}
          variant="default"
        />
        <StatCard
          title="Active Outlets"
          value={activeBranches}
          subtitle="Receiving Orders"
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title="Deactivated"
          value={inactiveBranches}
          subtitle="Suspended Locations"
          icon={AlertTriangle}
          variant={inactiveBranches > 0 ? "warning" : "default"}
        />
        <StatCard
          title="Total Seating"
          value={totalSeating}
          subtitle="Dine-in Capacity"
          icon={Users}
          variant="default"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by branch name, code, city, address, or manager..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-medium py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            {/* Plan Filter */}
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="text-xs font-medium py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">All Plans</option>
              <option value="plan-starter">Starter Plan</option>
              <option value="plan-pro">Professional Plan</option>
              <option value="plan-enterprise">Enterprise Plan</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl border border-slate-200 p-0.5 bg-slate-50">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Cards
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Table
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBranches.map((branch) => {
            const isCurrent = branch.id === currentBranchId;
            const staffInBranch = branchStaff.filter((s) => s.branchId === branch.id);
            const planConfig = BRANCH_PLANS_CONFIG[branch.planId] || BRANCH_PLANS_CONFIG['plan-starter'];

            return (
              <div
                key={branch.id}
                className={`rounded-2xl border transition-all duration-200 bg-white overflow-hidden shadow-xs hover:shadow-md flex flex-col justify-between ${
                  isCurrent
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'border-slate-200/90'
                }`}
              >
                {/* Header */}
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800">
                          {branch.code}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            branch.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {branch.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {branch.planName}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 tracking-tight mt-1">
                        {branch.name}
                      </h4>
                      <p className="text-xs text-slate-500">{branch.type}</p>
                    </div>

                    {isCurrent ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                        Active View
                      </span>
                    ) : (
                      <button
                        onClick={() => switchBranch(branch.id)}
                        className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors"
                      >
                        Switch
                      </button>
                    )}
                  </div>

                  {/* Address & Contacts */}
                  <div className="space-y-1 text-xs text-slate-600 pt-1">
                    <p className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{branch.address}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{branch.phone}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{branch.openingHours}</span>
                    </p>
                  </div>
                </div>

                {/* Body Meta */}
                <div className="p-4 bg-slate-50/70 border-t border-b border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Assigned Manager:</span>
                    <strong className="text-slate-900">{branch.managerName}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Staff Count:</span>
                    <span className="font-semibold text-slate-800">
                      {staffInBranch.length} / {planConfig.maxStaff} limit
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Seating Capacity:</span>
                    <strong className="text-slate-900">{branch.seatingCapacity} guests</strong>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                    <span className="text-slate-500">Subscription:</span>
                    <strong className="text-emerald-700">
                      {formatINR(branch.price)} / {branch.billingCycle}
                    </strong>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-3 bg-white flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => setSelectedBranchDetails(branch)}
                      className="text-slate-600"
                    >
                      Details
                    </Button>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleOpenEdit(branch)}
                      className="text-slate-600"
                    >
                      <Edit2 className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setDeactivatingBranch(branch)}
                    className={
                      branch.status === 'active'
                        ? 'text-rose-600 hover:text-rose-700 hover:bg-rose-50'
                        : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                    }
                  >
                    {branch.status === 'active' ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Branch Details</th>
                  <th className="py-3.5 px-4">Manager</th>
                  <th className="py-3.5 px-4">Contact &amp; Hours</th>
                  <th className="py-3.5 px-4">Staff &amp; Seats</th>
                  <th className="py-3.5 px-4">Plan &amp; Billing</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBranches.map((branch) => {
                  const isCurrent = branch.id === currentBranchId;
                  const staffInBranch = branchStaff.filter((s) => s.branchId === branch.id);
                  const planConfig = BRANCH_PLANS_CONFIG[branch.planId] || BRANCH_PLANS_CONFIG['plan-starter'];

                  return (
                    <tr
                      key={branch.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isCurrent ? 'bg-emerald-50/30' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                            <Store className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">{branch.name}</span>
                              {isCurrent && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-600 text-white">
                                  Current
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {branch.code} • {branch.type}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900">{branch.managerName}</div>
                        <div className="text-[11px] text-slate-400">{branch.managerEmail}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800">{branch.phone}</div>
                        <div className="text-[11px] text-slate-400">{branch.openingHours}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div>
                          <strong>{staffInBranch.length}</strong> / {planConfig.maxStaff} staff
                        </div>
                        <div className="text-[11px] text-slate-500">{branch.seatingCapacity} seats</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900">{branch.planName}</span>
                        <div className="text-[11px] text-emerald-700 font-bold">
                          {formatINR(branch.price)} / {branch.billingCycle}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge status={branch.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isCurrent && (
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => switchBranch(branch.id)}
                              className="text-emerald-700 hover:bg-emerald-50"
                            >
                              Select
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleOpenEdit(branch)}
                            className="text-slate-600"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => setDeactivatingBranch(branch)}
                            className="text-rose-600 hover:bg-rose-50"
                          >
                            <PowerOff className="w-3.5 h-3.5" />
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
      )}

      {/* Add Branch Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Restaurant Branch"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Branch Name *"
              placeholder="e.g. Spice Garden — Kothrud"
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              required
            />
            <FormInput
              label="Branch Code"
              placeholder="e.g. SG-PUN-06"
              value={addForm.code}
              onChange={(e) => setAddForm({ ...addForm, code: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Branch Type
              </label>
              <select
                value={addForm.type}
                onChange={(e) => setAddForm({ ...addForm, type: e.target.value })}
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="Dine-In Flagship">Dine-In Flagship</option>
                <option value="Fine Dining & Banquet">Fine Dining & Banquet</option>
                <option value="IT Park Express & Delivery">IT Park Express & Delivery</option>
                <option value="Cloud Kitchen & Takeaway">Cloud Kitchen & Takeaway</option>
                <option value="Bistro & Cafe">Bistro & Cafe</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Assigned Branch Manager
              </label>
              <select
                value={addForm.managerId}
                onChange={(e) => setAddForm({ ...addForm, managerId: e.target.value })}
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">Select an existing staff/manager</option>
                {branchStaff.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name} ({staff.roleLabel} - {staff.branchName?.split('—')[1] || 'Staff'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <FormInput
            label="Street Address *"
            placeholder="Plot number, Street, Landmark, City, Postal Code"
            value={addForm.address}
            onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Contact Phone *"
              placeholder="+91 98220 XXXXX"
              value={addForm.phone}
              onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
              required
            />
            <FormInput
              label="Branch Email"
              type="email"
              placeholder="outlet@spicegarden.com"
              value={addForm.email}
              onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Opening Hours"
              placeholder="11:00 AM – 11:30 PM"
              value={addForm.openingHours}
              onChange={(e) => setAddForm({ ...addForm, openingHours: e.target.value })}
            />
            <FormInput
              label="Seating Capacity (Guests)"
              type="number"
              placeholder="e.g. 80"
              value={addForm.seatingCapacity}
              onChange={(e) => setAddForm({ ...addForm, seatingCapacity: e.target.value })}
            />
          </div>

          {/* Subscription Tier Assignment */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Branch Subscription Plan Assignment
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Plan Tier
                </label>
                <select
                  value={addForm.planId}
                  onChange={(e) => setAddForm({ ...addForm, planId: e.target.value })}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800"
                >
                  <option value="plan-starter">Starter (₹999/mo | Max 5 staff)</option>
                  <option value="plan-pro">Professional (₹2,499/mo | Max 15 staff)</option>
                  <option value="plan-enterprise">Enterprise (₹4,999/mo | Unlimited)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Billing Cycle
                </label>
                <select
                  value={addForm.billingCycle}
                  onChange={(e) => setAddForm({ ...addForm, billingCycle: e.target.value })}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800"
                >
                  <option value="Monthly">Monthly Billing</option>
                  <option value="Yearly">Yearly Billing (17% Discount)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Register Branch
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Branch Modal */}
      {editingBranch && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingBranch(null);
          }}
          title={`Edit Branch: ${editingBranch.name}`}
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <FormInput
              label="Branch Name *"
              value={editingBranch.name}
              onChange={(e) => setEditingBranch({ ...editingBranch, name: e.target.value })}
              required
            />
            <FormInput
              label="Branch Code"
              value={editingBranch.code}
              onChange={(e) => setEditingBranch({ ...editingBranch, code: e.target.value })}
            />
            <FormInput
              label="Street Address *"
              value={editingBranch.address}
              onChange={(e) => setEditingBranch({ ...editingBranch, address: e.target.value })}
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Contact Phone"
                value={editingBranch.phone}
                onChange={(e) => setEditingBranch({ ...editingBranch, phone: e.target.value })}
              />
              <FormInput
                label="Branch Email"
                value={editingBranch.email}
                onChange={(e) => setEditingBranch({ ...editingBranch, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Opening Hours"
                value={editingBranch.openingHours}
                onChange={(e) => setEditingBranch({ ...editingBranch, openingHours: e.target.value })}
              />
              <FormInput
                label="Seating Capacity"
                type="number"
                value={editingBranch.seatingCapacity}
                onChange={(e) => setEditingBranch({ ...editingBranch, seatingCapacity: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingBranch(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Deactivate/Reactivate Confirmation Modal */}
      {deactivatingBranch && (
        <ConfirmModal
          isOpen={!!deactivatingBranch}
          onClose={() => setDeactivatingBranch(null)}
          onConfirm={handleToggleStatus}
          title={deactivatingBranch.status === 'active' ? 'Deactivate Branch?' : 'Reactivate Branch?'}
          message={
            deactivatingBranch.status === 'active'
              ? `Are you sure you want to deactivate "${deactivatingBranch.name}"? Staff at this branch will be paused and kitchen operations will be frozen.`
              : `Reactivate "${deactivatingBranch.name}" to resume operations, inventory tracking, and staff allocations.`
          }
          confirmText={deactivatingBranch.status === 'active' ? 'Yes, Deactivate' : 'Yes, Reactivate'}
          type={deactivatingBranch.status === 'active' ? 'danger' : 'primary'}
        />
      )}

      {/* Branch Details Slide-over / Modal */}
      {selectedBranchDetails && (
        <Modal
          isOpen={!!selectedBranchDetails}
          onClose={() => setSelectedBranchDetails(null)}
          title={`Branch Profile: ${selectedBranchDetails.name}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border">
                  {selectedBranchDetails.code}
                </span>
                <Badge status={selectedBranchDetails.status} size="sm" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-2">{selectedBranchDetails.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{selectedBranchDetails.type}</p>
              <p className="text-xs text-slate-600 mt-2 flex items-start gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>{selectedBranchDetails.address}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Phone</span>
                <strong className="text-slate-800">{selectedBranchDetails.phone}</strong>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Email</span>
                <strong className="text-slate-800">{selectedBranchDetails.email}</strong>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Manager</span>
                <strong className="text-slate-800">{selectedBranchDetails.managerName}</strong>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Hours</span>
                <strong className="text-slate-800">{selectedBranchDetails.openingHours}</strong>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <Button variant="primary" size="sm" onClick={() => setSelectedBranchDetails(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

