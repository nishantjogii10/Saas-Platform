import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  Plus,
  FileText,
  User,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const LeaveRequestModal = ({ isOpen, onClose }) => {
  const {
    currentUser,
    currentBranch,
    submitLeaveRequest,
    getStaffLeaveBalance,
    LEAVE_TYPES,
    addToast,
  } = useApp();

  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [form, setForm] = useState({
    leaveType: LEAVE_TYPES?.[0] || 'Casual Leave',
    startDate: tomorrow,
    endDate: tomorrow,
    reason: '',
  });

  const staffBalances = getStaffLeaveBalance ? getStaffLeaveBalance(currentUser?.id) : {};
  const currentCategoryBal = staffBalances[form.leaveType] || { total: 0, used: 0, remaining: 0 };

  // Calculate duration in days
  const startD = new Date(form.startDate);
  const endD = new Date(form.endDate);
  const diffDays =
    !isNaN(startD) && !isNaN(endD) && endD >= startD
      ? Math.ceil(Math.abs(endD - startD) / (1000 * 60 * 60 * 24)) + 1
      : 0;

  const isOverQuota =
    form.leaveType !== 'Unpaid Leave' &&
    currentCategoryBal.remaining !== undefined &&
    diffDays > currentCategoryBal.remaining;

  const QUICK_REASONS = [
    'Family wedding / function',
    'Medical appointment & rest',
    'Personal emergency',
    'Festival celebration & travel',
    'Bereavement in family',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.startDate || !form.endDate) {
      addToast('Please choose both start date and end date.', 'error');
      return;
    }

    if (new Date(form.endDate) < new Date(form.startDate)) {
      addToast('End date cannot be prior to start date.', 'error');
      return;
    }

    if (!form.reason.trim()) {
      addToast('Please provide a reason for the leave application.', 'error');
      return;
    }

    const res = submitLeaveRequest({
      staffId: currentUser?.id,
      staffName: currentUser?.name,
      staffRole: currentUser?.roleLabel || 'Staff Member',
      branchId: currentBranch?.id,
      leaveType: form.leaveType,
      reason: form.reason.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
    });

    if (res) {
      onClose();
      setForm({
        leaveType: LEAVE_TYPES?.[0] || 'Casual Leave',
        startDate: tomorrow,
        endDate: tomorrow,
        reason: '',
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Apply for Staff Leave"
      subtitle="Submit an official leave request for Manager review and roster adjustment."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Applicant Summary */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600" />
            <div>
              <span className="font-bold text-slate-800">{currentUser?.name}</span>
              <span className="text-slate-500"> ({currentUser?.roleLabel || 'Staff Member'})</span>
            </div>
          </div>
          <span className="text-slate-500 font-medium">
            {currentBranch?.name || 'Assigned Branch'}
          </span>
        </div>

        {/* Live Leave Balances Overview */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Your Available Leave Balances (Annual Quota)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(staffBalances).map(([type, b]) => {
              const isSelected = form.leaveType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm({ ...form, leaveType: type })}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span className="text-[10px] text-slate-500 font-medium block truncate">
                    {type}
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-sm font-black text-slate-900 font-mono">
                      {b.remaining}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">/ {b.total}d</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Leave Category Selection */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Leave Category <span className="text-rose-500">*</span>
          </label>
          <select
            value={form.leaveType}
            onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
            className="w-full text-xs font-medium py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {LEAVE_TYPES?.map((t) => (
              <option key={t} value={t}>
                {t} ({staffBalances[t]?.remaining ?? 0} days remaining)
              </option>
            ))}
          </select>
        </div>

        {/* Date Pickers */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Start Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              End Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={form.endDate}
              min={form.startDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>
        </div>

        {/* Duration & Quota Status Banner */}
        <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
          <span className="font-semibold flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-600" />
            Total Leave Duration:
          </span>
          <span className="font-extrabold text-sm px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            {diffDays} {diffDays === 1 ? 'Day' : 'Days'}
          </span>
        </div>

        {/* Warning if over quota */}
        {isOverQuota && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/90 flex items-start gap-2.5 text-xs text-amber-800 animate-in fade-in">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Requested days exceed remaining {form.leaveType} balance ({currentCategoryBal.remaining}d left).</p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                The manager may review and adjust this as Unpaid Leave or approve with discretionary sign-off.
              </p>
            </div>
          </div>
        )}

        {/* Reason for Leave */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700">
              Reason for Leave <span className="text-rose-500">*</span>
            </label>
            <span className="text-[10px] text-slate-400">Be clear for speedy manager approval</span>
          </div>
          <textarea
            rows={3}
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            placeholder="Explain why you require leave and any shift coverage / handover arrangements..."
            className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
            required
          />

          {/* Quick Suggestions */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {QUICK_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setForm({ ...form, reason: r })}
                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                + {r}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="brand" size="sm" icon={Send}>
            Submit Leave Request
          </Button>
        </div>
      </form>
    </Modal>
  );
};
