import React, { useState, useMemo } from 'react';
import { useApp, isHolidayApplicableToStaff, HOLIDAY_TYPES, HOLIDAY_DEPARTMENTS } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { hasPermission } from '../../utils/permissions';
import {
  Calendar,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Store,
  Info,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Users,
  Check,
  Clock,
  Building,
  UserCheck,
  DollarSign,
  Send,
  Eye,
  X,
} from 'lucide-react';

export const HolidayManagerModal = ({ isOpen, onClose }) => {
  const {
    holidays,
    addHoliday,
    updateHoliday,
    deleteHoliday,
    currentRestaurant,
    currentBranch,
    branches,
    branchStaff,
    currentUser,
    addToast,
  } = useApp();

  const userRole = currentUser?.role;
  const isManager = userRole === 'restaurant_manager';
  const isStaffOrInvMgr = userRole === 'inventory_manager' || userRole === 'kitchen_staff';
  const canCreate = hasPermission(userRole, 'HOLIDAYS_CREATE') && !isStaffOrInvMgr;
  const canUpdate = hasPermission(userRole, 'HOLIDAYS_UPDATE') && !isStaffOrInvMgr;
  const canDelete = hasPermission(userRole, 'HOLIDAYS_DELETE') && !isStaffOrInvMgr;

  const assignedBranchId = currentUser?.branchId || currentBranch?.id || 'branch-pune-central';

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingHolidayId, setEditingHolidayId] = useState(null);
  const [viewingAffectedHoliday, setViewingAffectedHoliday] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all'); // all | upcoming | past

  // Form states
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [holidayForm, setHolidayForm] = useState({
    name: '',
    startDate: tomorrow,
    endDate: tomorrow,
    type: 'Festival Holiday',
    scope: isManager ? 'branch' : 'all',
    branchId: assignedBranchId,
    isPaid: true,
    applicableEmployeesType: 'all', // all | departments | employees
    applicableDepartments: ['Kitchen', 'Inventory', 'Management', 'Service'],
    applicableEmployeeIds: [],
    description: '',
    notificationMessage: '',
  });

  const HOLIDAY_PRESETS = [
    { name: 'Diwali (Laxmi Pujan)', type: 'Festival Holiday', desc: 'Festival of lights and family celebrations', isPaid: true },
    { name: 'Republic Day', type: 'Public Holiday', desc: 'National Republic Day parade & celebration', isPaid: true },
    { name: 'Independence Day', type: 'Public Holiday', desc: 'Indian independence day celebration', isPaid: true },
    { name: 'Gandhi Jayanti', type: 'Public Holiday', desc: 'Mahatma Gandhi birth anniversary national tribute', isPaid: true },
    { name: 'Holi Festival', type: 'Festival Holiday', desc: 'Festival of colors and spring celebration', isPaid: true },
    { name: 'Ganesh Chaturthi', type: 'Festival Holiday', desc: 'Lord Ganesha arrival festival holiday', isPaid: true },
    { name: 'Christmas Day', type: 'Festival Holiday', desc: 'Christmas winter celebration and banquet feast', isPaid: true },
    { name: 'New Year Day', type: 'Public Holiday', desc: 'Global New Year celebration', isPaid: true },
    { name: 'Annual Restaurant Foundation Day', type: 'Company Holiday', desc: 'Restaurant anniversary & staff celebration party', isPaid: true },
  ];

  const handlePresetSelect = (preset) => {
    setHolidayForm((prev) => ({
      ...prev,
      name: preset.name,
      type: preset.type,
      description: preset.desc,
      isPaid: preset.isPaid !== undefined ? preset.isPaid : true,
    }));
  };

  const resetForm = () => {
    setIsAddingNew(false);
    setEditingHolidayId(null);
    setIsMultiDay(false);
    setHolidayForm({
      name: '',
      startDate: tomorrow,
      endDate: tomorrow,
      type: 'Festival Holiday',
      scope: isManager ? 'branch' : 'all',
      branchId: assignedBranchId,
      isPaid: true,
      applicableEmployeesType: 'all',
      applicableDepartments: ['Kitchen', 'Inventory', 'Management', 'Service'],
      applicableEmployeeIds: [],
      description: '',
      notificationMessage: '',
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!holidayForm.name.trim() || !holidayForm.startDate) {
      addToast('Please provide both holiday name and scheduled date.', 'error');
      return;
    }

    const start = holidayForm.startDate;
    const end = isMultiDay ? (holidayForm.endDate || holidayForm.startDate) : holidayForm.startDate;

    if (new Date(end) < new Date(start)) {
      addToast('End date cannot precede start date.', 'error');
      return;
    }

    const payload = {
      ...holidayForm,
      startDate: start,
      endDate: end,
      date: start,
      branchId: isManager ? assignedBranchId : (holidayForm.scope === 'all' ? null : holidayForm.branchId),
      scope: isManager ? 'branch' : holidayForm.scope,
    };

    if (editingHolidayId) {
      const updated = updateHoliday(editingHolidayId, payload);
      if (!updated) return;
    } else {
      const added = addHoliday(payload);
      if (!added) return;
    }

    resetForm();
  };

  const handleEditClick = (hol) => {
    if (!canUpdate) {
      addToast('You do not have permission to edit holidays.', 'error');
      return;
    }
    if (isManager && hol.branchId && hol.branchId !== assignedBranchId) {
      addToast('Restaurant Managers can only edit holidays for their assigned branch.', 'error');
      return;
    }

    const sDate = hol.startDate || hol.date;
    const eDate = hol.endDate || hol.date || sDate;
    const multi = sDate !== eDate;

    setEditingHolidayId(hol.id);
    setIsMultiDay(multi);
    setHolidayForm({
      name: hol.name,
      startDate: sDate,
      endDate: eDate,
      type: hol.type || 'Festival Holiday',
      scope: hol.scope || 'all',
      branchId: hol.branchId || assignedBranchId,
      isPaid: hol.isPaid !== undefined ? hol.isPaid : true,
      applicableEmployeesType: hol.applicableEmployeesType || 'all',
      applicableDepartments: hol.applicableDepartments || ['Kitchen', 'Inventory', 'Management', 'Service'],
      applicableEmployeeIds: hol.applicableEmployeeIds || [],
      description: hol.description || '',
      notificationMessage: hol.notificationMessage || '',
    });
    setIsAddingNew(true);
  };

  const handleDelete = (hol) => {
    if (!canDelete) {
      addToast('You do not have permission to cancel holidays.', 'error');
      return;
    }
    if (isManager && hol.branchId && hol.branchId !== assignedBranchId) {
      addToast('Restaurant Managers can only cancel holidays for their assigned branch.', 'error');
      return;
    }

    if (window.confirm(`Are you sure you want to cancel the holiday "${hol.name}"? Affected employees will be notified.`)) {
      deleteHoliday(hol.id);
    }
  };

  // Branch staff available for selection
  const relevantBranchStaff = useMemo(() => {
    const targetBranch = holidayForm.scope === 'all' ? null : holidayForm.branchId;
    return (branchStaff || []).filter(s => {
      if (!targetBranch) return true;
      return s.branchId === targetBranch;
    });
  }, [branchStaff, holidayForm.scope, holidayForm.branchId]);

  // Filtered holidays list
  const filteredHolidays = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];

    return (holidays || []).filter((h) => {
      if (h.status === 'cancelled') return false;

      // Scoping: If manager, only show holidays that apply to their branch (all or their branch)
      if (isManager && h.scope !== 'all' && h.branchId && h.branchId !== assignedBranchId) {
        return false;
      }

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (h.name || '').toLowerCase().includes(q);
        const matchDesc = (h.description || '').toLowerCase().includes(q);
        if (!matchName && !matchDesc) return false;
      }

      // Year filter
      const hDate = h.startDate || h.date;
      if (selectedYear !== 'all') {
        const y = new Date(hDate).getFullYear().toString();
        if (y !== selectedYear) return false;
      }

      // Month filter
      if (selectedMonth !== 'all') {
        const m = new Date(hDate).getMonth().toString();
        if (m !== selectedMonth) return false;
      }

      // Type filter
      if (selectedType !== 'all') {
        if (h.type !== selectedType) return false;
      }

      // Upcoming / Past filter
      const hEnd = h.endDate || h.date || hDate;
      if (timeFilter === 'upcoming') {
        if (hEnd < today) return false;
      } else if (timeFilter === 'past') {
        if (hEnd >= today) return false;
      }

      return true;
    }).sort((a, b) => new Date(a.startDate || a.date).getTime() - new Date(b.startDate || b.date).getTime());
  }, [holidays, searchQuery, selectedYear, selectedMonth, selectedType, timeFilter, isManager, assignedBranchId]);

  // Affected employees for modal inspection
  const affectedStaffForViewing = useMemo(() => {
    if (!viewingAffectedHoliday) return [];
    return (branchStaff || []).filter(s => isHolidayApplicableToStaff(viewingAffectedHoliday, s));
  }, [viewingAffectedHoliday, branchStaff]);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Branch Holiday & Festival Management"
        subtitle={`Configure official holidays, multi-day festival offs, and employee attendance exemptions for ${currentRestaurant?.name || 'Restaurant'}`}
        size="xl"
      >
        <div className="space-y-5">
          {/* Top Banner & Action */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-indigo-50 border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-xs sm:text-sm text-slate-900 block">
                  Branch Holiday Policy &amp; Attendance Synchronization
                </span>
                <span className="text-[11px] text-slate-600 block">
                  Declared holidays prevent employee absence penalties, deduct 0 leave quota days, and auto-credit worked hours as <strong className="text-indigo-800">Holiday Worked</strong>.
                </span>
              </div>
            </div>

            {canCreate && !isAddingNew && (
              <Button
                variant="brand"
                size="sm"
                icon={Plus}
                onClick={() => {
                  setEditingHolidayId(null);
                  setIsAddingNew(true);
                }}
                className="shrink-0"
              >
                + Schedule Holiday
              </Button>
            )}
          </div>

          {/* Add / Edit Form Accordion */}
          {isAddingNew && (
            <form
              onSubmit={handleFormSubmit}
              className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-emerald-500/30 shadow-md space-y-4 animate-in fade-in duration-200"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-sm text-slate-900">
                    {editingHolidayId ? 'Edit Scheduled Holiday' : 'Create New Scheduled Branch Holiday'}
                  </span>
                  {isManager && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Scoped to {currentBranch?.name || 'Assigned Branch'}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-slate-400 hover:text-slate-700 font-semibold"
                >
                  Cancel
                </button>
              </div>

              {/* Quick Presets */}
              {!editingHolidayId && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                    Quick Holiday &amp; Festival Presets:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {HOLIDAY_PRESETS.map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handlePresetSelect(p)}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-slate-200 hover:border-emerald-300 transition-colors shadow-2xs"
                      >
                        + {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Holiday Name & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Holiday Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Diwali (Laxmi Pujan)"
                    value={holidayForm.name}
                    onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
                    className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Holiday Classification <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={holidayForm.type}
                    onChange={(e) => setHolidayForm({ ...holidayForm, type: e.target.value })}
                    className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="Public Holiday">Public Holiday</option>
                    <option value="Festival Holiday">Festival Holiday</option>
                    <option value="Company Holiday">Company Holiday</option>
                    <option value="Branch Holiday">Branch Holiday</option>
                    <option value="Special Holiday">Special Holiday</option>
                  </select>
                </div>
              </div>

              {/* Multi-day toggle & Dates */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    Schedule Duration:
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-slate-600 flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isMultiDay}
                        onChange={(e) => {
                          setIsMultiDay(e.target.checked);
                          if (!e.target.checked) {
                            setHolidayForm(prev => ({ ...prev, endDate: prev.startDate }));
                          }
                        }}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Multi-day Holiday / Festival Period</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      {isMultiDay ? 'Start Date *' : 'Holiday Date *'}
                    </label>
                    <input
                      type="date"
                      value={holidayForm.startDate}
                      onChange={(e) => {
                        const val = e.target.value;
                        setHolidayForm(prev => ({
                          ...prev,
                          startDate: val,
                          endDate: isMultiDay ? prev.endDate : val,
                        }));
                      }}
                      className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
                      required
                    />
                  </div>

                  {isMultiDay && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        End Date *
                      </label>
                      <input
                        type="date"
                        min={holidayForm.startDate}
                        value={holidayForm.endDate}
                        onChange={(e) => setHolidayForm({ ...holidayForm, endDate: e.target.value })}
                        className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
                        required
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Branch Scope & Paid Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Applicable Outlet / Branch Scope
                  </label>
                  {isManager ? (
                    <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 flex items-center justify-between font-medium">
                      <span>{currentBranch?.name || 'Assigned Branch'}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        Assigned Branch
                      </span>
                    </div>
                  ) : (
                    <select
                      value={holidayForm.scope === 'all' ? 'all' : holidayForm.branchId}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'all') {
                          setHolidayForm({ ...holidayForm, scope: 'all', branchId: assignedBranchId });
                        } else {
                          setHolidayForm({ ...holidayForm, scope: 'branch', branchId: val });
                        }
                      }}
                      className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <option value="all">All Outlets in Restaurant (Aggregated)</option>
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Compensation Policy
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
                      holidayForm.isPaid ? 'border-emerald-500 bg-emerald-50/80 text-emerald-900 ring-1 ring-emerald-500' : 'border-slate-200 bg-white text-slate-600'
                    }`}>
                      <input
                        type="radio"
                        name="isPaid"
                        checked={holidayForm.isPaid}
                        onChange={() => setHolidayForm({ ...holidayForm, isPaid: true })}
                        className="hidden"
                      />
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Paid Holiday</span>
                    </label>

                    <label className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
                      !holidayForm.isPaid ? 'border-slate-500 bg-slate-100 text-slate-900 ring-1 ring-slate-500' : 'border-slate-200 bg-white text-slate-600'
                    }`}>
                      <input
                        type="radio"
                        name="isPaid"
                        checked={!holidayForm.isPaid}
                        onChange={() => setHolidayForm({ ...holidayForm, isPaid: false })}
                        className="hidden"
                      />
                      <span>Unpaid Holiday</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Applicable Employees Section */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Applicable Employees
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'all', label: 'All Branch Employees' },
                    { id: 'departments', label: 'Selected Departments' },
                    { id: 'employees', label: 'Selected Employees' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setHolidayForm({ ...holidayForm, applicableEmployeesType: opt.id })}
                      className={`p-2 rounded-xl text-xs font-bold text-center border transition-all ${
                        holidayForm.applicableEmployeesType === opt.id
                          ? 'border-emerald-600 bg-emerald-100/80 text-emerald-950 shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* If Departments chosen */}
                {holidayForm.applicableEmployeesType === 'departments' && (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 animate-in fade-in">
                    <span className="text-[11px] font-bold text-slate-600 block mb-1">
                      Select Covered Departments:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {['Kitchen', 'Inventory', 'Management', 'Service'].map(dept => {
                        const checked = holidayForm.applicableDepartments.includes(dept);
                        return (
                          <label key={dept} className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setHolidayForm({
                                    ...holidayForm,
                                    applicableDepartments: [...holidayForm.applicableDepartments, dept],
                                  });
                                } else {
                                  setHolidayForm({
                                    ...holidayForm,
                                    applicableDepartments: holidayForm.applicableDepartments.filter(d => d !== dept),
                                  });
                                }
                              }}
                              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>{dept}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* If Specific Employees chosen */}
                {holidayForm.applicableEmployeesType === 'employees' && (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 animate-in fade-in max-h-48 overflow-y-auto">
                    <span className="text-[11px] font-bold text-slate-600 block">
                      Select Eligible Staff Members ({holidayForm.applicableEmployeeIds.length} selected):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {relevantBranchStaff.map(st => {
                        const checked = holidayForm.applicableEmployeeIds.includes(st.id);
                        return (
                          <label key={st.id} className="p-1.5 rounded-lg border border-slate-200 flex items-center gap-2 hover:bg-slate-50 cursor-pointer text-xs">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setHolidayForm({
                                    ...holidayForm,
                                    applicableEmployeeIds: [...holidayForm.applicableEmployeeIds, st.id],
                                  });
                                } else {
                                  setHolidayForm({
                                    ...holidayForm,
                                    applicableEmployeeIds: holidayForm.applicableEmployeeIds.filter(id => id !== st.id),
                                  });
                                }
                              }}
                              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <img src={st.avatar} alt={st.name} className="w-5 h-5 rounded-full object-cover" />
                            <div className="truncate">
                              <span className="font-bold text-slate-800">{st.name}</span>
                              <span className="text-[10px] text-slate-400 block truncate">{st.roleLabel || st.role}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Description & Notification Message */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Internal Circular &amp; Operational Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Details regarding kitchen operations, prep adjustments, or festival greetings..."
                    value={holidayForm.description}
                    onChange={(e) => setHolidayForm({ ...holidayForm, description: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Optional In-App Staff Notification Message
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Custom broadcast message sent to affected employees' notice boards..."
                    value={holidayForm.notificationMessage}
                    onChange={(e) => setHolidayForm({ ...holidayForm, notificationMessage: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button variant="outline" size="sm" onClick={resetForm}>
                  Cancel
                </Button>
                <Button variant="brand" size="sm" type="submit">
                  {editingHolidayId ? 'Save Changes' : 'Schedule Holiday'}
                </Button>
              </div>
            </form>
          )}

          {/* Search & Filter Toolbar */}
          <div className="p-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search holiday name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              >
                <option value="all">All Years</option>
                <option value="2026">Year 2026</option>
                <option value="2027">Year 2027</option>
              </select>

              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              >
                <option value="all">All Months</option>
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, idx) => (
                  <option key={idx} value={idx.toString()}>{m}</option>
                ))}
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              >
                <option value="all">All Holiday Types</option>
                <option value="Public Holiday">Public Holiday</option>
                <option value="Festival Holiday">Festival Holiday</option>
                <option value="Company Holiday">Company Holiday</option>
                <option value="Branch Holiday">Branch Holiday</option>
                <option value="Special Holiday">Special Holiday</option>
              </select>
            </div>

            {/* Timeframe pill selector */}
            <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
              {[
                { id: 'all', label: 'All Holidays' },
                { id: 'upcoming', label: 'Upcoming Only' },
                { id: 'past', label: 'Past Holidays' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTimeFilter(t.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    timeFilter === t.id
                      ? 'bg-emerald-800 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scheduled Holidays Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Configured Branch Holidays ({filteredHolidays.length})
              </span>
              <span className="text-slate-400 font-mono text-[11px]">
                {selectedYear === 'all' ? 'All Calendars' : `Year ${selectedYear}`}
              </span>
            </div>

            <div className="overflow-x-auto max-h-[380px]">
              {filteredHolidays.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">No holidays found matching your filters.</p>
                  <p className="text-[11px] mt-0.5">Use the "+ Schedule Holiday" button above to add a new holiday.</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px] sticky top-0 bg-white z-10">
                    <tr>
                      <th className="py-2.5 px-3.5">Date / Duration</th>
                      <th className="py-2.5 px-3.5">Holiday Details</th>
                      <th className="py-2.5 px-3.5">Type &amp; Pay</th>
                      <th className="py-2.5 px-3.5">Coverage</th>
                      <th className="py-2.5 px-3.5">Scheduled By</th>
                      <th className="py-2.5 px-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredHolidays.map((hol) => {
                      const sDate = hol.startDate || hol.date;
                      const eDate = hol.endDate || hol.date || sDate;
                      const isMulti = sDate !== eDate;
                      const affectedCount = (branchStaff || []).filter(s => isHolidayApplicableToStaff(hol, s)).length;
                      const isUpcoming = eDate >= new Date().toISOString().split('T')[0];

                      return (
                        <tr key={hol.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3.5 font-bold font-mono text-slate-900 whitespace-nowrap">
                            {isMulti ? (
                              <div>
                                <span className="text-slate-900 block font-bold">
                                  {new Date(sDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(eDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                <span className="text-[10px] text-emerald-700 font-semibold">Multi-day Off</span>
                              </div>
                            ) : (
                              <div>
                                <span>
                                  {new Date(sDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                {isUpcoming && (
                                  <span className="block text-[10px] text-emerald-600 font-semibold">Upcoming</span>
                                )}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-3.5">
                            <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                              <span>{hol.name}</span>
                            </div>
                            {hol.description && (
                              <div className="text-[10px] text-slate-500 truncate max-w-xs">{hol.description}</div>
                            )}
                          </td>

                          <td className="py-3 px-3.5 whitespace-nowrap space-y-1">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 block w-fit">
                              {hol.type || 'Holiday'}
                            </span>
                            <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-semibold block w-fit ${
                              hol.isPaid !== false ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {hol.isPaid !== false ? 'Paid Off' : 'Unpaid'}
                            </span>
                          </td>

                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <div className="text-[11px] font-semibold text-slate-700">
                              {hol.scope === 'all' ? 'All Restaurant Outlets' : (hol.branchName || 'Assigned Branch')}
                            </div>
                            <button
                              type="button"
                              onClick={() => setViewingAffectedHoliday(hol)}
                              className="mt-1 text-[10px] font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 hover:underline"
                            >
                              <Users className="w-3 h-3 text-indigo-500" />
                              <span>{affectedCount} Employees Covered</span>
                            </button>
                          </td>

                          <td className="py-3 px-3.5 text-[11px] text-slate-500 whitespace-nowrap">
                            {hol.createdBy || 'Management'}
                          </td>

                          <td className="py-3 px-3.5 text-right whitespace-nowrap">
                            {canUpdate ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  icon={Edit2}
                                  onClick={() => handleEditClick(hol)}
                                  title="Edit Holiday"
                                />
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  icon={Trash2}
                                  className="text-rose-600 hover:bg-rose-50"
                                  onClick={() => handleDelete(hol)}
                                  title="Cancel Holiday"
                                />
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-medium italic">Read-only</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Modal Close Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-400">
            <span>StockMate Holiday Management System</span>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Sub-Modal: Affected Employees Inspector */}
      {viewingAffectedHoliday && (
        <Modal
          isOpen={Boolean(viewingAffectedHoliday)}
          onClose={() => setViewingAffectedHoliday(null)}
          title={`Covered Employees: ${viewingAffectedHoliday.name}`}
          subtitle={`Showing staff members entitled to holiday exemption on ${viewingAffectedHoliday.startDate || viewingAffectedHoliday.date}`}
          size="md"
        >
          <div className="space-y-4">
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900 flex items-center justify-between">
              <div>
                <span className="font-bold">{viewingAffectedHoliday.name}</span>
                <span className="block text-[11px] text-purple-700">
                  {viewingAffectedHoliday.type} • {viewingAffectedHoliday.isPaid !== false ? 'Paid Holiday' : 'Unpaid Holiday'}
                </span>
              </div>
              <span className="font-black text-sm px-2.5 py-0.5 rounded-full bg-purple-200 text-purple-900">
                {affectedStaffForViewing.length} Staff
              </span>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2">
              {affectedStaffForViewing.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No staff members currently match this holiday's filter criteria.
                </div>
              ) : (
                affectedStaffForViewing.map((st) => (
                  <div key={st.id} className="p-2.5 rounded-xl border border-slate-200 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <img src={st.avatar} alt={st.name} className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-200" />
                      <div>
                        <span className="font-bold text-xs text-slate-900 block">{st.name}</span>
                        <span className="text-[10px] text-slate-500 block">{st.roleLabel || st.role}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {st.branchName || 'Assigned Branch'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setViewingAffectedHoliday(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
