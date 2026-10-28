import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
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
  Bell,
  Users,
  Lock,
  Send,
  AlertTriangle,
  X,
  Check,
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
    monthlyPayrollRuns,
    addToast,
  } = useApp();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingHolidayId, setEditingHolidayId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null); // { holidayForm, affectedStaff }
  const [inspectingAffectedHoliday, setInspectingAffectedHoliday] = useState(null);

  // Form states
  const [holidayForm, setHolidayForm] = useState({
    name: '',
    date: '2026-10-29',
    endDate: '2026-10-29',
    isRange: false,
    type: 'Festival Holiday',
    scope: 'all', // 'all' | 'department' | 'employees'
    department: 'Kitchen',
    selectedEmployeeIds: [],
    payType: 'paid', // 'paid' | 'unpaid'
    notifyOption: 'immediate', // 'immediate' | 'scheduled_eve' | 'none'
    branchId: currentBranch?.id || 'branch-pune-central',
    description: '',
  });

  const HOLIDAY_PRESETS = [
    { name: 'Diwali (Laxmi Pujan)', type: 'Festival Holiday', payType: 'paid', desc: 'Main Diwali festival celebrations and evening sweets' },
    { name: 'Diwali (Naraka Chaturdashi)', type: 'Festival Holiday', payType: 'paid', desc: 'Choti Diwali festival and morning prep off' },
    { name: 'Deep Cleaning & Pest Control Closure', type: 'Restaurant Closure', payType: 'paid', desc: 'Full outlet kitchen sanitization and equipment maintenance' },
    { name: 'Republic Day', type: 'Public Holiday', payType: 'paid', desc: 'National celebration and parade' },
    { name: 'Independence Day', type: 'Public Holiday', payType: 'paid', desc: 'Indian independence anniversary' },
    { name: 'Kitchen Line Team Weekly Off', type: 'Weekly Off', payType: 'paid', desc: 'Scheduled weekly rotation off for kitchen crew' },
    { name: 'Annual Restaurant Foundation Day', type: 'Special Holiday', payType: 'paid', desc: 'Spice Garden anniversary & staff recognition banquet' },
  ];

  const handlePresetSelect = (preset) => {
    setHolidayForm((prev) => ({
      ...prev,
      name: preset.name,
      type: preset.type,
      payType: preset.payType || 'paid',
      description: preset.desc,
    }));
  };

  // Determine affected staff list for a given scope
  const getAffectedStaff = (formData) => {
    return (branchStaff || []).filter((s) => {
      if (s.status === 'Terminated') return false;
      if (formData.scope === 'all') return true;
      if (formData.scope === 'department') {
        const dept = (s.department || s.roleLabel || s.role || '').toLowerCase();
        return dept.includes((formData.department || '').toLowerCase());
      }
      if (formData.scope === 'employees') {
        return (formData.selectedEmployeeIds || []).includes(s.id);
      }
      return true;
    });
  };

  const currentAffectedStaff = useMemo(() => {
    return getAffectedStaff(holidayForm);
  }, [holidayForm, branchStaff]);

  // Handle pre-save validation & trigger confirmation dialog
  const handlePreSubmit = (e) => {
    e.preventDefault();

    if (!holidayForm.name.trim() || !holidayForm.date) {
      addToast('Please provide both holiday name and scheduled date.', 'error');
      return;
    }

    if (holidayForm.scope === 'employees' && (!holidayForm.selectedEmployeeIds || holidayForm.selectedEmployeeIds.length === 0)) {
      addToast('Please select at least one employee for employee-specific holiday scope.', 'error');
      return;
    }

    // Check duplicate conflict
    const existing = (holidays || []).find(
      (h) =>
        h.id !== editingHolidayId &&
        h.date === holidayForm.date &&
        (h.scope === 'all' || holidayForm.scope === 'all' || h.department === holidayForm.department)
    );

    if (existing) {
      addToast(`Conflict: Holiday "${existing.name}" is already scheduled on ${holidayForm.date}.`, 'warning');
      return;
    }

    // Open confirmation dialog with affected employee roster
    setConfirmDialog({
      formData: { ...holidayForm },
      affectedStaff: currentAffectedStaff,
    });
  };

  // Final confirmed save
  const handleConfirmSave = () => {
    if (!confirmDialog) return;
    const { formData } = confirmDialog;

    if (editingHolidayId) {
      const updated = updateHoliday(editingHolidayId, formData);
      if (updated) {
        setEditingHolidayId(null);
        setIsAddingNew(false);
      }
    } else {
      const added = addHoliday(formData);
      if (added) {
        setIsAddingNew(false);
      }
    }

    setConfirmDialog(null);
    setHolidayForm({
      name: '',
      date: '2026-10-29',
      endDate: '2026-10-29',
      isRange: false,
      type: 'Festival Holiday',
      scope: 'all',
      department: 'Kitchen',
      selectedEmployeeIds: [],
      payType: 'paid',
      notifyOption: 'immediate',
      branchId: currentBranch?.id || 'branch-pune-central',
      description: '',
    });
  };

  const handleEditClick = (hol) => {
    // Check if locked
    const monthKey = hol.date ? hol.date.slice(0, 7) : '';
    const isLocked = (monthlyPayrollRuns || []).some((r) => r.locked && r.monthKey === monthKey);
    if (isLocked) {
      addToast(`Holiday is locked: Payroll for ${monthKey} is already approved and locked.`, 'error');
      return;
    }

    setEditingHolidayId(hol.id);
    setHolidayForm({
      name: hol.name,
      date: hol.date,
      endDate: hol.endDate || hol.date,
      isRange: !!(hol.endDate && hol.endDate !== hol.date),
      type: hol.type || 'Festival Holiday',
      scope: hol.scope || 'all',
      department: hol.department || 'Kitchen',
      selectedEmployeeIds: hol.selectedEmployeeIds || [],
      payType: hol.payType || 'paid',
      notifyOption: hol.notifyOption || 'immediate',
      branchId: hol.branchId || currentBranch?.id || 'branch-pune-central',
      description: hol.description || '',
    });
    setIsAddingNew(true);
  };

  const handleDelete = (hol) => {
    const monthKey = hol.date ? hol.date.slice(0, 7) : '';
    const isLocked = (monthlyPayrollRuns || []).some((r) => r.locked && r.monthKey === monthKey);
    if (isLocked) {
      addToast(`Cannot cancel holiday: Payroll for ${monthKey} has been approved and locked.`, 'error');
      return;
    }

    if (window.confirm(`Are you sure you want to cancel the holiday "${hol.name}" for ${hol.date}? Affected staff will receive a cancellation notice.`)) {
      deleteHoliday(hol.id);
    }
  };

  const handleNotifyStaffNow = (hol) => {
    const affected = getAffectedStaff(hol);
    if (affected.length === 0) {
      addToast('No eligible staff members found for this holiday scope.', 'info');
      return;
    }

    updateHoliday(hol.id, {
      lastNotificationSentAt: new Date().toISOString(),
    });
    addToast(`Holiday alert pushed to ${affected.length} staff member(s)!`, 'success');
  };

  // Sort holidays by date
  const sortedHolidays = [...(holidays || [])].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Staff Holiday & Observance Manager"
        subtitle={`Schedule official holidays, department offs, and dispatch automatic staff notifications for ${currentRestaurant?.name || 'Spice Garden'}`}
        size="xl"
      >
        <div className="space-y-5">
          {/* Top Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80">
            <div>
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#075E4B]" />
                Official Restaurant Calendar &amp; Staff Holiday Rules
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Paid holidays do not count as employee absences and are automatically recognized by the Attendance Salary Calculator.
              </p>
            </div>
            {!isAddingNew && (
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => {
                  setEditingHolidayId(null);
                  setHolidayForm({
                    name: '',
                    date: '2026-10-29',
                    endDate: '2026-10-29',
                    isRange: false,
                    type: 'Festival Holiday',
                    scope: 'all',
                    department: 'Kitchen',
                    selectedEmployeeIds: [],
                    payType: 'paid',
                    notifyOption: 'immediate',
                    branchId: currentBranch?.id || 'branch-pune-central',
                    description: '',
                  });
                  setIsAddingNew(true);
                }}
              >
                Schedule Holiday
              </Button>
            )}
          </div>

          {/* Add / Edit Holiday Form Accordion */}
          {isAddingNew && (
            <form
              onSubmit={handlePreSubmit}
              className="p-5 rounded-2xl bg-white border border-[#075E4B]/30 shadow-md space-y-4 animate-in fade-in duration-200"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#DCE5EF]">
                <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#075E4B]" />
                  {editingHolidayId ? 'Edit Scheduled Holiday' : 'Create & Schedule Restaurant Holiday'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingHolidayId(null);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Cancel
                </button>
              </div>

              {/* Quick Presets */}
              {!editingHolidayId && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Quick Holiday &amp; Closure Presets:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {HOLIDAY_PRESETS.map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handlePresetSelect(p)}
                        className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-[#F7F9FC] hover:bg-[#E6F3F0] text-[#075E4B] border border-[#DCE5EF] transition-colors"
                      >
                        + {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Holiday / Closure Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Diwali (Laxmi Pujan)"
                    value={holidayForm.name}
                    onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
                    className="w-full text-xs py-2.5 px-3 rounded-xl border border-[#DCE5EF] bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#075E4B]/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Holiday Type Classification *
                  </label>
                  <select
                    value={holidayForm.type}
                    onChange={(e) => setHolidayForm({ ...holidayForm, type: e.target.value })}
                    className="w-full text-xs py-2.5 px-3 rounded-xl border border-[#DCE5EF] bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#075E4B]/20"
                  >
                    <option value="Public Holiday">Public Holiday</option>
                    <option value="Festival Holiday">Festival Holiday</option>
                    <option value="Weekly Off">Weekly Off / Scheduled Roster Off</option>
                    <option value="Restaurant Closure">Restaurant Closure (Deep Cleaning / Maintenance)</option>
                    <option value="Special Holiday">Special Holiday / Foundation Day</option>
                  </select>
                </div>
              </div>

              {/* Date & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {holidayForm.isRange ? 'Start Date *' : 'Holiday Date *'}
                  </label>
                  <input
                    type="date"
                    value={holidayForm.date}
                    onChange={(e) =>
                      setHolidayForm({
                        ...holidayForm,
                        date: e.target.value,
                        endDate: holidayForm.isRange ? holidayForm.endDate : e.target.value,
                      })
                    }
                    className="w-full text-xs py-2.5 px-3 rounded-xl border border-[#DCE5EF] bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#075E4B]/20 font-mono"
                    required
                  />
                </div>

                {holidayForm.isRange && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={holidayForm.endDate}
                      min={holidayForm.date}
                      onChange={(e) => setHolidayForm({ ...holidayForm, endDate: e.target.value })}
                      className="w-full text-xs py-2.5 px-3 rounded-xl border border-[#DCE5EF] bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#075E4B]/20 font-mono"
                      required
                    />
                  </div>
                )}

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer pb-2.5">
                    <input
                      type="checkbox"
                      checked={holidayForm.isRange}
                      onChange={(e) =>
                        setHolidayForm({
                          ...holidayForm,
                          isRange: e.target.checked,
                          endDate: e.target.checked ? holidayForm.endDate : holidayForm.date,
                        })
                      }
                      className="rounded text-[#075E4B] focus:ring-[#075E4B]"
                    />
                    <span>Multiple Days / Date Range</span>
                  </label>
                </div>
              </div>

              {/* Scope & Pay Classification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Applicable Staff Scope *
                  </label>
                  <select
                    value={holidayForm.scope}
                    onChange={(e) => setHolidayForm({ ...holidayForm, scope: e.target.value })}
                    className="w-full text-xs py-2.5 px-3 rounded-xl border border-[#DCE5EF] bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#075E4B]/20"
                  >
                    <option value="all">All Restaurant Staff (Outlet-wide)</option>
                    <option value="department">Specific Department Only</option>
                    <option value="employees">Selected Employees Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payroll Pay Classification *
                  </label>
                  <select
                    value={holidayForm.payType}
                    onChange={(e) => setHolidayForm({ ...holidayForm, payType: e.target.value })}
                    className="w-full text-xs py-2.5 px-3 rounded-xl border border-[#DCE5EF] bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#075E4B]/20"
                  >
                    <option value="paid">Paid Holiday (Payable day in salary calculation)</option>
                    <option value="unpaid">Unpaid Closure / Loss of Pay Off</option>
                  </select>
                </div>
              </div>

              {/* Department Selector */}
              {holidayForm.scope === 'department' && (
                <div className="p-3 bg-[#F7F9FC] rounded-xl border border-[#DCE5EF]">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Target Department
                  </label>
                  <select
                    value={holidayForm.department}
                    onChange={(e) => setHolidayForm({ ...holidayForm, department: e.target.value })}
                    className="w-full text-xs py-2 px-3 rounded-lg border border-[#DCE5EF] bg-white text-slate-800"
                  >
                    <option value="Kitchen">Kitchen Line &amp; Culinary Team</option>
                    <option value="Inventory">Inventory, Stock &amp; Receiving Dock</option>
                    <option value="Service">Dining Service &amp; Front of House</option>
                    <option value="Management">Branch Supervisors &amp; Leads</option>
                  </select>
                </div>
              )}

              {/* Employee Checklist Selector */}
              {holidayForm.scope === 'employees' && (
                <div className="p-3 bg-[#F7F9FC] rounded-xl border border-[#DCE5EF] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">Select Affected Employees:</span>
                    <button
                      type="button"
                      onClick={() =>
                        setHolidayForm({
                          ...holidayForm,
                          selectedEmployeeIds: branchStaff.map((s) => s.id),
                        })
                      }
                      className="text-[#075E4B] hover:underline font-bold text-[11px]"
                    >
                      Select All
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {branchStaff.map((staff) => {
                      const isSelected = (holidayForm.selectedEmployeeIds || []).includes(staff.id);
                      return (
                        <label
                          key={staff.id}
                          className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[#E6F3F0] border-[#075E4B]/40 text-[#075E4B] font-semibold'
                              : 'bg-white border-[#DCE5EF] text-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const curr = holidayForm.selectedEmployeeIds || [];
                              const updated = e.target.checked
                                ? [...curr, staff.id]
                                : curr.filter((id) => id !== staff.id);
                              setHolidayForm({ ...holidayForm, selectedEmployeeIds: updated });
                            }}
                            className="rounded text-[#075E4B]"
                          />
                          <span className="truncate">{staff.name} ({staff.roleLabel})</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Notification Option */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Staff Notification Mode
                  </label>
                  <select
                    value={holidayForm.notifyOption}
                    onChange={(e) => setHolidayForm({ ...holidayForm, notifyOption: e.target.value })}
                    className="w-full text-xs py-2.5 px-3 rounded-xl border border-[#DCE5EF] bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#075E4B]/20"
                  >
                    <option value="immediate">Dispatch Instant In-App Notification</option>
                    <option value="scheduled_eve">Schedule Notification for Eve Before Holiday</option>
                    <option value="none">No In-App Notification</option>
                  </select>
                </div>

                <div className="flex items-center text-xs text-slate-500 pt-5">
                  <span className="flex items-center gap-1.5 font-medium text-emerald-800">
                    <Users className="w-4 h-4 text-[#075E4B]" />
                    {currentAffectedStaff.length} employee(s) will be affected by this holiday.
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description / Staff Announcement Message
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. The restaurant will remain closed tomorrow. Please check the holiday calendar for details."
                  value={holidayForm.description}
                  onChange={(e) => setHolidayForm({ ...holidayForm, description: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#DCE5EF] bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#075E4B]/20"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCE5EF]">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingHolidayId(null);
                  }}
                >
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  {editingHolidayId ? 'Review & Save' : 'Review & Confirm Holiday'}
                </Button>
              </div>
            </form>
          )}

          {/* Existing Holidays Table */}
          <div className="bg-white rounded-2xl border border-[#DCE5EF] shadow-2xs overflow-hidden">
            <div className="p-3.5 bg-[#F7F9FC] border-b border-[#DCE5EF] flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Configured Holidays &amp; Closures ({sortedHolidays.length})
              </span>
              <span className="text-slate-500 font-mono text-[11px]">Calendar Year 2026</span>
            </div>

            <div className="overflow-x-auto max-h-[380px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#F7F9FC] border-b border-[#DCE5EF] text-slate-600 font-semibold uppercase tracking-wider text-[10px] sticky top-0 z-10">
                  <tr>
                    <th className="py-2.5 px-3.5">Date</th>
                    <th className="py-2.5 px-3.5">Holiday Name</th>
                    <th className="py-2.5 px-3.5">Classification</th>
                    <th className="py-2.5 px-3.5">Payroll Type</th>
                    <th className="py-2.5 px-3.5">Scope &amp; Coverage</th>
                    <th className="py-2.5 px-3.5">Notification Status</th>
                    <th className="py-2.5 px-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE5EF]">
                  {sortedHolidays.map((hol) => {
                    const monthKey = hol.date ? hol.date.slice(0, 7) : '';
                    const isLocked = (monthlyPayrollRuns || []).some((r) => r.locked && r.monthKey === monthKey);
                    const affectedStaffList = getAffectedStaff(hol);

                    return (
                      <tr key={hol.id} className="hover:bg-[#F7F9FC]/80 transition-colors">
                        <td className="py-3 px-3.5 font-bold font-mono text-slate-900 whitespace-nowrap">
                          {new Date(hol.date).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3 px-3.5">
                          <div className="font-bold text-slate-900 text-xs">{hol.name}</div>
                          {hol.description && (
                            <div className="text-[10px] text-slate-500 truncate max-w-xs">{hol.description}</div>
                          )}
                        </td>
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            {hol.type || 'Public Holiday'}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          {hol.payType === 'unpaid' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-[#D97706] border border-amber-200">
                              Unpaid Closure
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-[#15803D] border border-green-200">
                              Paid Holiday
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setInspectingAffectedHoliday(hol)}
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#F7F9FC] hover:bg-[#E6F3F0] text-slate-700 hover:text-[#075E4B] border border-[#DCE5EF] text-[11px] font-semibold transition-colors"
                            title="Click to view affected employees"
                          >
                            <Users className="w-3 h-3 text-[#075E4B]" />
                            <span>
                              {hol.scope === 'all'
                                ? `All Staff (${affectedStaffList.length})`
                                : hol.scope === 'department'
                                ? `${hol.department || 'Dept'} (${affectedStaffList.length})`
                                : `${affectedStaffList.length} Selected`}
                            </span>
                          </button>
                        </td>
                        <td className="py-3 px-3.5 whitespace-nowrap text-[11px] text-slate-600">
                          <span className="inline-flex items-center gap-1 text-emerald-800 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" />
                            In-app active
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="xs"
                              icon={Send}
                              onClick={() => handleNotifyStaffNow(hol)}
                              title="Send Reminder Notification to Affected Staff Now"
                            />
                            {isLocked ? (
                              <span title="Locked by Approved Monthly Payroll" className="p-1 text-slate-400">
                                <Lock className="w-3.5 h-3.5" />
                              </span>
                            ) : (
                              <>
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
                                  className="text-[#DC2626] hover:bg-red-50"
                                  onClick={() => handleDelete(hol)}
                                  title="Cancel Holiday"
                                />
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal Close Footer */}
          <div className="flex items-center justify-end pt-2 border-t border-[#DCE5EF]">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Dialog Before Saving */}
      {confirmDialog && (
        <Modal
          isOpen={!!confirmDialog}
          onClose={() => setConfirmDialog(null)}
          title="Confirm Holiday Scheduling & Staff Notification"
          subtitle="Please review affected staff members, dates, and payroll policies before finalizing."
          size="md"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#E6F3F0] border border-[#075E4B]/30 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">
                  {confirmDialog.formData.name}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#075E4B] border border-[#075E4B]/40">
                  {confirmDialog.formData.type}
                </span>
              </div>
              <div className="text-slate-700">
                <strong>Scheduled Date:</strong> {confirmDialog.formData.date}{' '}
                {confirmDialog.formData.isRange && ` to ${confirmDialog.formData.endDate}`}
              </div>
              <div className="text-slate-700">
                <strong>Payroll Status:</strong>{' '}
                {confirmDialog.formData.payType === 'paid' ? 'Paid Holiday (Counted in Payable Days)' : 'Unpaid Closure'}
              </div>
              <div className="text-slate-700">
                <strong>Notification Dispatch:</strong>{' '}
                {confirmDialog.formData.notifyOption === 'immediate'
                  ? 'Immediate in-app notification to all affected employees'
                  : confirmDialog.formData.notifyOption === 'scheduled_eve'
                  ? 'Scheduled for the evening before the holiday'
                  : 'None'}
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-800 block mb-1">
                Affected Employees ({confirmDialog.affectedStaff.length}):
              </span>
              <div className="border border-[#DCE5EF] rounded-xl max-h-44 overflow-y-auto divide-y divide-[#DCE5EF] text-xs">
                {confirmDialog.affectedStaff.map((staff) => (
                  <div key={staff.id} className="p-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">{staff.name}</span>
                      <span className="text-[10px] text-slate-500">{staff.roleLabel} • {staff.department || 'Kitchen'}</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-green-50 px-2 py-0.5 rounded-full">
                      Receiving Notice
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCE5EF]">
              <Button variant="outline" size="sm" onClick={() => setConfirmDialog(null)}>
                Go Back &amp; Edit
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmSave}>
                Confirm &amp; Schedule
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Inspect Affected Staff Modal */}
      {inspectingAffectedHoliday && (
        <Modal
          isOpen={!!inspectingAffectedHoliday}
          onClose={() => setInspectingAffectedHoliday(null)}
          title={`Affected Employees: ${inspectingAffectedHoliday.name}`}
          subtitle={`Scheduled for ${inspectingAffectedHoliday.date} • ${inspectingAffectedHoliday.payType === 'paid' ? 'Paid Holiday' : 'Unpaid Off'}`}
          size="md"
        >
          <div className="space-y-4">
            <div className="border border-[#DCE5EF] rounded-xl max-h-60 overflow-y-auto divide-y divide-[#DCE5EF] text-xs">
              {getAffectedStaff(inspectingAffectedHoliday).map((staff) => (
                <div key={staff.id} className="p-3 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">{staff.name}</span>
                    <span className="text-[10px] text-slate-500">{staff.roleLabel} • {staff.department || 'Kitchen'}</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                    Covered
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-[#DCE5EF]">
              <Button variant="outline" size="sm" onClick={() => setInspectingAffectedHoliday(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};


