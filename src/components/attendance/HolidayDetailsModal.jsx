import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import {
  Calendar,
  Sparkles,
  Building,
  Users,
  DollarSign,
  FileText,
  Clock,
  CheckCircle2,
  CalendarDays,
  ShieldCheck,
  Edit2,
} from 'lucide-react';

export const HolidayDetailsModal = ({
  isOpen,
  onClose,
  holiday,
  onEdit,
  canEdit = false,
}) => {
  if (!isOpen || !holiday) return null;

  const sDate = holiday.startDate || holiday.date;
  const eDate = holiday.endDate || holiday.date || sDate;
  const isMulti = sDate !== eDate;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d) ? dateStr : d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDayName = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d) ? '' : d.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const isPaid = holiday.isPaid !== false;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={holiday.name}
      subtitle={isMulti ? `${formatDate(sDate)} to ${formatDate(eDate)}` : formatDate(sDate)}
      size="md"
    >
      <div className="space-y-4">
        {/* Banner Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50/40 to-emerald-50/40 border border-purple-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-black text-slate-900 text-base sm:text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              {holiday.name}
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-200 text-purple-900">
              {holiday.type || 'Holiday'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold ${
              isPaid
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-slate-200 text-slate-700'
            }`}>
              <DollarSign className="w-3 h-3 text-emerald-600" />
              {isPaid ? 'Paid Holiday (Full Wage Credit)' : 'Unpaid Holiday'}
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-semibold text-[11px]">
              <Building className="w-3 h-3 text-indigo-600" />
              {holiday.scope === 'all' ? 'All Restaurant Outlets' : (holiday.branchName || 'Assigned Branch')}
            </span>
          </div>
        </div>

        {/* Schedule & Duration Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
              {isMulti ? 'Start Date' : 'Holiday Date'}
            </span>
            <span className="text-xs font-bold text-slate-900 font-mono block">
              {sDate}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              {getDayName(sDate)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
              {isMulti ? 'End Date' : 'Duration'}
            </span>
            <span className="text-xs font-bold text-slate-900 font-mono block">
              {isMulti ? eDate : 'Full Day Off'}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              {isMulti ? getDayName(eDate) : 'Exempt from Absent Status'}
            </span>
          </div>
        </div>

        {/* Coverage Rules */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs text-slate-700">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-[11px] uppercase tracking-wider">
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span>Eligible Staff Audience</span>
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            {holiday.applicableEmployeesType === 'departments' ? (
              <span>
                Applicable to selected departments: <strong>{(holiday.applicableDepartments || []).join(', ')}</strong>.
              </span>
            ) : holiday.applicableEmployeesType === 'employees' ? (
              <span>
                Applicable to <strong>{(holiday.applicableEmployeeIds || []).length} specifically designated employee(s)</strong>.
              </span>
            ) : (
              <span>
                Applicable to <strong>all eligible employees</strong> in {holiday.scope === 'all' ? 'all restaurant outlets' : (holiday.branchName || 'this branch')}.
              </span>
            )}
          </p>
        </div>

        {/* Description & Circular Notice */}
        {holiday.description && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[11px]">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Operational Notes &amp; Circular</span>
            </div>
            <p className="text-slate-600 italic leading-relaxed text-xs">
              "{holiday.description}"
            </p>
          </div>
        )}

        {/* Attendance & Leave Policy Note */}
        <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-[11px] text-emerald-900 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Attendance &amp; Quota Policy:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-emerald-800">
            <li>Employees covered by this holiday will not be marked as Absent.</li>
            <li>Leave requests spanning this date will not deduct from your annual leave quota.</li>
            <li>Duty shifts worked on this date will be credited as <strong>Holiday Worked</strong>.</li>
          </ul>
        </div>

        {/* Scheduled By Metadata */}
        <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
          <span>Scheduled by: {holiday.createdBy || 'Restaurant Management'}</span>
          {holiday.createdAt && (
            <span>Logged: {new Date(holiday.createdAt).toLocaleDateString()}</span>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          {canEdit && onEdit && (
            <Button
              variant="brand"
              size="sm"
              icon={Edit2}
              onClick={() => {
                onClose();
                onEdit(holiday);
              }}
            >
              Edit Holiday
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
