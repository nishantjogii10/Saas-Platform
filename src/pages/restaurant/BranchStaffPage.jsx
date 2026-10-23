import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { FormInput } from '../../components/common/FormInput';
import { BRANCH_PLANS_CONFIG } from '../../data/branchData';

export const BranchStaffPage = () => {
  const navigate = useNavigate();
  const {
    branches,
    currentBranchId,
    branchStaff,
    addBranchStaffMember,
    removeBranchStaffMember,
    assignBranchManager,
    addToast,
  } = useApp();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modals
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isAssignMgrOpen, setIsAssignMgrOpen] = useState(false);
  const [staffToRemove, setStaffToRemove] = useState(null);
  const [selectedStaffDetails, setSelectedStaffDetails] = useState(null);

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

  // KPI calculations
  const totalEmployees = branchStaff.length;
  const totalManagers = branchStaff.filter((s) => s.isManager).length;
  const kitchenStaffCount = branchStaff.filter((s) => s.role === 'kitchen_staff').length;

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
        (roleFilter === 'manager' && s.isManager) ||
        (roleFilter === 'kitchen' && s.role === 'kitchen_staff');

      return matchesSearch && matchesBranch && matchesRole;
    });
  }, [branchStaff, searchTerm, branchFilter, roleFilter]);

  // Handle Add Staff Submit
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!addForm.name || !addForm.email || !addForm.branchId) {
      addToast('Please complete required fields (Name, Email, Branch)', 'error');
      return;
    }

    // Check branch quota
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Branch Staff & Manager Roster"
        subtitle="Manage outlet-specific staff assignments, appoint general managers, and enforce role-based module security."
        action={
          <div className="flex items-center gap-2">
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
              variant="primary"
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
          subtitle="Across All 5 Branches"
          icon={Users}
          variant="default"
        />
        <StatCard
          title="Branch Managers"
          value={totalManagers}
          subtitle="Designated Leads"
          icon={UserCheck}
          variant="success"
        />
        <StatCard
          title="Kitchen & Line Staff"
          value={kitchenStaffCount}
          subtitle="Chefs, Prep & Cooks"
          icon={Store}
          variant="default"
        />
        <StatCard
          title="Active Capacity"
          value="Healthy"
          subtitle="All Quotas Satisfied"
          icon={ShieldCheck}
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
              placeholder="Search staff by name, title, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Branch Filter */}
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

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs font-medium py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">All Roles</option>
              <option value="manager">Managers Only</option>
              <option value="kitchen">Kitchen Staff Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Staff Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Role &amp; Responsibilities</th>
                <th className="py-3.5 px-4">Assigned Branch Outlet</th>
                <th className="py-3.5 px-4">Module Access</th>
                <th className="py-3.5 px-4">Contact &amp; PIN</th>
                <th className="py-3.5 px-4">Status</th>
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

                  return (
                    <tr key={staff.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Avatar */}
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

                      {/* Role & Title */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{staff.roleLabel}</div>
                        <div className="text-[10px] text-slate-400 capitalize">
                          {staff.role.replace('_', ' ')}
                        </div>
                      </td>

                      {/* Branch Assignment */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">
                          {staff.branchName || branchObj?.name || 'Unassigned'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {branchObj?.code}
                        </div>
                      </td>

                      {/* Modules Accessible */}
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

                      {/* Phone & PIN */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800">{staff.phone || '+91 98200 XXXXX'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          PIN: {staff.pin ? '••••' : 'N/A'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <Badge status={staff.status || 'active'} size="sm" />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => {
                              navigate('/staff-transfers');
                            }}
                            title="Request Branch Transfer"
                            className="text-emerald-700 hover:bg-emerald-50"
                          >
                            <ArrowLeftRight className="w-3.5 h-3.5 mr-1" />
                            Transfer
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

      {/* Add Staff Modal */}
      <Modal
        isOpen={isAddStaffOpen}
        onClose={() => setIsAddStaffOpen(false)}
        title="Add Staff Member to Branch"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Full Name *"
              placeholder="e.g. Chef Alok Kumar"
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              required
            />
            <FormInput
              label="Email Address *"
              type="email"
              placeholder="alok.k@spicegarden.com"
              value={addForm.email}
              onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Contact Phone"
              placeholder="+91 98200 XXXXX"
              value={addForm.phone}
              onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
            />
            <FormInput
              label="Terminal PIN (4 Digits)"
              type="password"
              maxLength={4}
              placeholder="e.g. 5566"
              value={addForm.pin}
              onChange={(e) => setAddForm({ ...addForm, pin: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Restaurant Branch *
              </label>
              <select
                value={addForm.branchId}
                onChange={(e) => setAddForm({ ...addForm, branchId: e.target.value })}
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {branches.map((b) => {
                  const staffCount = branchStaff.filter((s) => s.branchId === b.id).length;
                  const planConfig = BRANCH_PLANS_CONFIG[b.planId] || BRANCH_PLANS_CONFIG['plan-starter'];
                  return (
                    <option key={b.id} value={b.id}>
                      {b.name} ({staffCount}/{planConfig.maxStaff} staff)
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Staff Role
              </label>
              <select
                value={addForm.role}
                onChange={(e) => {
                  const val = e.target.value;
                  setAddForm({
                    ...addForm,
                    role: val,
                    roleLabel:
                      val === 'inventory_manager'
                        ? 'Assistant Branch Manager'
                        : val === 'kitchen_staff'
                        ? 'Kitchen Cook'
                        : 'Staff',
                  });
                }}
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="kitchen_staff">Kitchen Staff</option>
                <option value="inventory_manager">Branch Manager / Inventory Lead</option>
              </select>
            </div>
          </div>

          <FormInput
            label="Designation / Role Title"
            placeholder="e.g. Line Cook, Sous Chef, Pastry Chef"
            value={addForm.roleLabel}
            onChange={(e) => setAddForm({ ...addForm, roleLabel: e.target.value })}
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" size="sm" onClick={() => setIsAddStaffOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Staff Member
            </Button>
          </div>
        </form>
      </Modal>

      {/* Appoint Branch Manager Modal */}
      <Modal
        isOpen={isAssignMgrOpen}
        onClose={() => setIsAssignMgrOpen(false)}
        title="Appoint Branch General Manager"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAssignManagerSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Branch
            </label>
            <select
              value={assignMgrForm.branchId}
              onChange={(e) => setAssignMgrForm({ ...assignMgrForm, branchId: e.target.value })}
              className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800"
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
              Select Staff Member to Appoint as Manager
            </label>
            <select
              value={assignMgrForm.managerId}
              onChange={(e) => setAssignMgrForm({ ...assignMgrForm, managerId: e.target.value })}
              className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800"
              required
            >
              <option value="">Choose an employee...</option>
              {branchStaff.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.name} — {staff.roleLabel} ({staff.branchName?.split('—')[1] || 'Staff'})
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
            <strong>Note:</strong> Appointing a manager promotes this employee to Inventory Manager with access to stock purchases, wastage audits, and employee scheduling for that branch.
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" size="sm" onClick={() => setIsAssignMgrOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Appoint Manager
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
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <img
                src={selectedStaffDetails.avatar}
                alt={selectedStaffDetails.name}
                className="w-12 h-12 rounded-full object-cover border"
              />
              <div>
                <h4 className="font-bold text-slate-900">{selectedStaffDetails.name}</h4>
                <p className="text-xs text-slate-500">{selectedStaffDetails.roleLabel}</p>
                <div className="mt-1">
                  <Badge status={selectedStaffDetails.status} size="xs" />
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                <span className="text-slate-400 block text-[10px]">Assigned Branch</span>
                <strong className="text-slate-900">{selectedStaffDetails.branchName}</strong>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                <span className="text-slate-400 block text-[10px]">Email &amp; Phone</span>
                <div className="text-slate-800">{selectedStaffDetails.email}</div>
                <div className="text-slate-600">{selectedStaffDetails.phone}</div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                <span className="text-slate-400 block text-[10px]">Accessible Modules</span>
                <div className="flex flex-wrap gap-1 mt-1">
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
    </div>
  );
};

