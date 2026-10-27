import React, { useState } from 'react';
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
    currentUser,
    addToast,
  } = useApp();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingHolidayId, setEditingHolidayId] = useState(null);

  // Form states
  const [holidayForm, setHolidayForm] = useState({
    name: '',
    date: '',
    type: 'Festival',
    scope: 'all',
    branchId: currentBranch?.id || 'branch-pune-central',
    description: '',
  });

  const HOLIDAY_PRESETS = [
    { name: 'Diwali (Laxmi Pujan)', type: 'Festival', desc: 'Festival of lights and family gatherings' },
    { name: 'Republic Day', type: 'National Holiday', desc: 'National celebration and parade' },
    { name: 'Independence Day', type: 'National Holiday', desc: 'Indian independence anniversary' },
    { name: 'Gandhi Jayanti', type: 'National Holiday', desc: 'Mahatma Gandhi birth anniversary' },
    { name: 'Ganesh Chaturthi', type: 'Festival', desc: 'Lord Ganesha arrival festival' },
    { name: 'Christmas Day', type: 'Public Holiday', desc: 'Christmas winter celebration' },
    { name: 'New Year Day', type: 'Public Holiday', desc: 'Global New Year celebration' },
    { name: 'Annual Restaurant Foundation Day', type: 'Company Off', desc: 'Restaurant anniversary & staff celebration' },
  ];

  const handlePresetSelect = (preset) => {
    setHolidayForm((prev) => ({
      ...prev,
      name: preset.name,
      type: preset.type,
      description: preset.desc,
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!holidayForm.name.trim() || !holidayForm.date) {
      addToast('Please provide both holiday name and scheduled date.', 'error');
      return;
    }

    if (editingHolidayId) {
      updateHoliday(editingHolidayId, holidayForm);
      setEditingHolidayId(null);
    } else {
      const added = addHoliday(holidayForm);
      if (!added) return;
    }

    setIsAddingNew(false);
    setHolidayForm({
      name: '',
      date: '',
      type: 'Festival',
      scope: 'all',
      branchId: currentBranch?.id || 'branch-pune-central',
      description: '',
    });
  };

  const handleEditClick = (hol) => {
    setEditingHolidayId(hol.id);
    setHolidayForm({
      name: hol.name,
      date: hol.date,
      type: hol.type || 'Festival',
      scope: hol.scope || 'all',
      branchId: hol.branchId || currentBranch?.id || 'branch-pune-central',
      description: hol.description || '',
    });
    setIsAddingNew(true);
  };

  const handleDelete = (holId, holName) => {
    if (window.confirm(`Are you sure you want to cancel the holiday "${holName}"?`)) {
      deleteHoliday(holId);
    }
  };

  // Sort holidays by date
  const sortedHolidays = [...(holidays || [])].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Restaurant Holiday Calendar Management"
      subtitle={`Configure official holidays and festival offs for ${currentRestaurant?.name || 'Restaurant'}`}
      size="lg"
    >
      <div className="space-y-5">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            Holidays display directly on the monthly staff attendance calendar and do not count as employee absences.
          </div>
          {!isAddingNew && (
            <Button
              variant="brand"
              size="sm"
              icon={Plus}
              onClick={() => {
                setEditingHolidayId(null);
                setHolidayForm({
                  name: '',
                  date: '',
                  type: 'Festival',
                  scope: 'all',
                  branchId: currentBranch?.id || 'branch-pune-central',
                  description: '',
                });
                setIsAddingNew(true);
              }}
            >
              Add New Holiday
            </Button>
          )}
        </div>

        {/* Add / Edit Holiday Form Accordion */}
        {isAddingNew && (
          <form
            onSubmit={handleFormSubmit}
            className="p-4 sm:p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 shadow-sm space-y-4 animate-in fade-in duration-200"
          >
            <div className="flex items-center justify-between pb-2 border-b border-emerald-200/70">
              <span className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                {editingHolidayId ? 'Edit Scheduled Holiday' : 'Create New Scheduled Holiday'}
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
                  Quick Festival Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {HOLIDAY_PRESETS.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handlePresetSelect(p)}
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition-colors shadow-2xs"
                    >
                      + {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Holiday Name *
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
                  Holiday Date *
                </label>
                <input
                  type="date"
                  value={holidayForm.date}
                  onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Holiday Classification
                </label>
                <select
                  value={holidayForm.type}
                  onChange={(e) => setHolidayForm({ ...holidayForm, type: e.target.value })}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="Festival">Festival Celebration</option>
                  <option value="National Holiday">National Holiday</option>
                  <option value="Public Holiday">Public Holiday</option>
                  <option value="Regional Holiday">Regional / State Holiday</option>
                  <option value="Company Off">Company Off / Foundation Day</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Applicable Branch Scope
                </label>
                <select
                  value={holidayForm.scope}
                  onChange={(e) => setHolidayForm({ ...holidayForm, scope: e.target.value })}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="all">All Outlets in Restaurant (Aggregated)</option>
                  <option value={currentBranch?.id || 'branch-pune-central'}>
                    Only {currentBranch?.name || 'Current Branch'}
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description / Staff Circular Notice
              </label>
              <textarea
                rows={2}
                placeholder="Optional details regarding kitchen operations, prep schedules, or festival greetings..."
                value={holidayForm.description}
                onChange={(e) => setHolidayForm({ ...holidayForm, description: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
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
              <Button variant="brand" size="sm" type="submit">
                {editingHolidayId ? 'Save Changes' : 'Schedule Holiday'}
              </Button>
            </div>
          </form>
        )}

        {/* Existing Holidays Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Scheduled Holidays ({sortedHolidays.length})
            </span>
            <span className="text-slate-400 font-mono text-[11px]">Calendar Year 2026</span>
          </div>

          <div className="overflow-x-auto max-h-[380px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px] sticky top-0 bg-white z-10">
                <tr>
                  <th className="py-2.5 px-3.5">Date</th>
                  <th className="py-2.5 px-3.5">Holiday Name</th>
                  <th className="py-2.5 px-3.5">Type</th>
                  <th className="py-2.5 px-3.5">Scope</th>
                  <th className="py-2.5 px-3.5">Scheduled By</th>
                  <th className="py-2.5 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedHolidays.map((hol) => (
                  <tr key={hol.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3.5 font-bold font-mono text-slate-900 whitespace-nowrap">
                      {new Date(hol.date).toLocaleDateString('en-US', {
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
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                        {hol.type || 'Holiday'}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 whitespace-nowrap">
                      {hol.scope === 'all' ? (
                        <span className="text-emerald-700 font-semibold text-[11px]">All Outlets</span>
                      ) : (
                        <span className="text-slate-700 text-[11px]">Branch Specific</span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-[11px] text-slate-500 whitespace-nowrap">
                      {hol.createdBy || 'Management'}
                    </td>
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="xs"
                          icon={Edit2}
                          onClick={() => handleEditClick(hol)}
                          title="Edit Holiday Details"
                        />
                        <Button
                          variant="ghost"
                          size="xs"
                          icon={Trash2}
                          className="text-rose-600 hover:bg-rose-50"
                          onClick={() => handleDelete(hol.id, hol.name)}
                          title="Cancel Holiday"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Close Footer */}
        <div className="flex items-center justify-end pt-2 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
