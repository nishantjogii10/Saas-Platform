import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Edit2,
  Coffee,
  User,
  History,
} from 'lucide-react';

export const AttendanceDayDetailModal = ({
  isOpen,
  onClose,
  record,
  date,
  employee,
  holiday,
  onOpenCorrection,
  canCorrect = false,
}) => {
  if (!isOpen) return null;

  const displayDate = date ? new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }) : 'Attendance Day Details';

  const statusColors = {
    present: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    late: 'bg-amber-100 text-amber-800 border-amber-200',
    half_day: 'bg-orange-100 text-orange-800 border-orange-200',
    on_leave: 'bg-blue-100 text-blue-800 border-blue-200',
    holiday: 'bg-purple-100 text-purple-800 border-purple-200',
    weekly_off: 'bg-slate-100 text-slate-700 border-slate-200',
    absent: 'bg-rose-100 text-rose-800 border-rose-200',
  };

  const statusLabel = {
    present: 'Present (Full Day)',
    late: 'Late Arrival',
    half_day: 'Half Day Shift',
    on_leave: 'On Approved Leave',
    holiday: 'Public / Festival Holiday',
    weekly_off: 'Weekly Roster Off',
    absent: 'Unexcused Absent',
  };

  const effectiveStatus = holiday
    ? 'holiday'
    : record?.attendanceStatus || (record?.status === 'active' ? 'present' : (record?.totalHours ? 'present' : 'absent'));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Attendance Day Details"
      subtitle={displayDate}
      size="md"
    >
      <div className="space-y-4">
        {/* Employee Summary Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-emerald-50/30 border border-slate-200/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={employee?.avatar || record?.staffAvatar || 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=150'}
              alt={employee?.name || record?.staffName}
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/20 shadow-xs"
            />
            <div>
              <div className="font-bold text-slate-900 text-sm">
                {employee?.name || record?.staffName || 'Employee'}
              </div>
              <div className="text-xs text-slate-500">
                {employee?.roleLabel || record?.staffRole || 'Staff Member'}
              </div>
              <div className="text-[11px] font-medium text-emerald-800 mt-0.5">
                {employee?.branchName || record?.branchName || 'Assigned Branch'}
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusColors[effectiveStatus] || statusColors.present}`}>
              <span className="w-2 h-2 rounded-full bg-current" />
              {statusLabel[effectiveStatus] || effectiveStatus.toUpperCase()}
            </span>
            {record?.isCorrected && (
              <div className="text-[10px] font-bold text-indigo-600 mt-1 flex items-center justify-end gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Audited Correction</span>
              </div>
            )}
          </div>
        </div>

        {/* Holiday Specific Information */}
        {holiday && (
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-950 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm flex items-center gap-2">
                🎉 {holiday.name}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-200 text-purple-900">
                {holiday.type || 'Holiday'}
              </span>
            </div>
            <p className="text-xs text-purple-800">
              {holiday.description || 'Public holiday scheduled for this date. No work shift scheduled.'}
            </p>
            <div className="text-[10px] text-purple-600">
              Scope: {holiday.scope === 'all' ? 'All Restaurant Branches' : 'Branch Specific'} • Scheduled by {holiday.createdBy || 'Management'}
            </div>
          </div>
        )}

        {/* Regular Shift Metrics Grid */}
        {record && !holiday && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
                Clock-In
              </span>
              <span className="text-sm font-bold font-mono text-slate-900">
                {record.punchInTime
                  ? new Date(record.punchInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '—'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
                Clock-Out
              </span>
              <span className="text-sm font-bold font-mono text-slate-900">
                {record.punchOutTime
                  ? new Date(record.punchOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : (record.status === 'active' ? <span className="text-emerald-600">On Duty</span> : '—')}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
                Worked Hours
              </span>
              <span className="text-sm font-bold font-mono text-emerald-800">
                {record.totalHours !== null && record.totalHours !== undefined
                  ? `${record.totalHours} hrs`
                  : (record.status === 'active' ? 'In Progress' : '0 hrs')}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
                Station
              </span>
              <span className="text-xs font-bold text-slate-800 truncate block">
                {record.station || 'Main Line'}
              </span>
            </div>
          </div>
        )}

        {/* Notes & Station Details */}
        {record?.notes && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-1">
            <span className="font-bold text-[11px] text-slate-900 block flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              Shift Notes &amp; Handover
            </span>
            <p className="text-slate-600 leading-relaxed italic">{record.notes}</p>
          </div>
        )}

        {/* Audit Trail History if Corrected */}
        {record?.isCorrected && record.correctionAudit && record.correctionAudit.length > 0 && (
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-3">
            <div className="flex items-center gap-2 text-indigo-950 font-bold text-xs">
              <History className="w-4 h-4 text-indigo-600" />
              <span>Correction Audit History ({record.correctionAudit.length})</span>
            </div>
            <div className="space-y-2">
              {record.correctionAudit.map((audit, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white border border-indigo-100 text-xs text-slate-700 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-indigo-900">{audit.correctedBy}</span>
                    <span className="text-slate-400 font-mono">
                      {new Date(audit.correctedAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    <strong>Reason:</strong> "{audit.reason}"
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-100 flex items-center gap-3">
                    <span>
                      Original In: {audit.originalPunchIn ? new Date(audit.originalPunchIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'None'}
                    </span>
                    <span>→</span>
                    <span>
                      Original Out: {audit.originalPunchOut ? new Date(audit.originalPunchOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'None'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          {canCorrect && record && !holiday && (
            <Button
              variant="brand"
              size="sm"
              icon={Edit2}
              onClick={() => {
                onClose();
                if (onOpenCorrection) onOpenCorrection(record);
              }}
            >
              Correct Record
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

