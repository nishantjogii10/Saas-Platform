import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  Clock,
  Calendar,
  AlertTriangle,
  ShieldCheck,
  FileText,
  User,
  History,
  CheckCircle2,
} from 'lucide-react';

export const AttendanceCorrectionModal = ({ isOpen, onClose, record }) => {
  const { correctAttendanceRecord, KITCHEN_STATIONS, addToast } = useApp();

  const [punchIn, setPunchIn] = useState('');
  const [punchOut, setPunchOut] = useState('');
  const [status, setStatus] = useState('present');
  const [station, setStation] = useState(KITCHEN_STATIONS?.[0] || 'Main Prep Line');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (record) {
      if (record.punchInTime) {
        const dIn = new Date(record.punchInTime);
        const hrs = dIn.getHours().toString().padStart(2, '0');
        const mins = dIn.getMinutes().toString().padStart(2, '0');
        setPunchIn(`${hrs}:${mins}`);
      } else {
        setPunchIn('09:00');
      }

      if (record.punchOutTime) {
        const dOut = new Date(record.punchOutTime);
        const hrs = dOut.getHours().toString().padStart(2, '0');
        const mins = dOut.getMinutes().toString().padStart(2, '0');
        setPunchOut(`${hrs}:${mins}`);
      } else {
        setPunchOut('18:00');
      }

      setStatus(record.attendanceStatus || (record.status === 'active' ? 'present' : 'present'));
      setStation(record.station || KITCHEN_STATIONS?.[0] || 'Main Prep Line');
      setReason('');
      setNotes(record.notes || '');
    }
  }, [record, isOpen]);

  if (!record) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!reason.trim()) {
      addToast('A valid correction reason is mandatory for audit logging.', 'error');
      return;
    }

    const dateStr = record.date;
    const fullIn = punchIn ? `${dateStr}T${punchIn}:00.000Z` : record.punchInTime;
    const fullOut = punchOut ? `${dateStr}T${punchOut}:00.000Z` : record.punchOutTime;

    if (punchIn && punchOut && punchOut < punchIn) {
      addToast('Clock-out time cannot be earlier than clock-in time.', 'error');
      return;
    }

    setIsSubmitting(true);
    const success = correctAttendanceRecord(record.id, {
      punchInTime: fullIn,
      punchOutTime: fullOut,
      attendanceStatus: status,
      station,
      reason: reason.trim(),
      notes: notes.trim(),
    });

    setIsSubmitting(false);
    if (success) {
      onClose();
    }
  };

  const CORRECTION_REASONS = [
    'Bio-terminal offline / biometric failure',
    'Employee forgot to clock out at shift close',
    'Emergency line cover authorized by Manager',
    'CCTV & kitchen supervisor verified attendance',
    'Shift overtime approved after closing hours',
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Authorized Attendance Correction"
      subtitle="Modify shift clock times with mandatory audit reason logging"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Staff & Date Summary Card */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={record.staffAvatar || 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=150'}
              alt={record.staffName}
              className="w-10 h-10 rounded-full object-cover border border-slate-200"
            />
            <div>
              <div className="font-bold text-slate-900 text-xs sm:text-sm">{record.staffName}</div>
              <div className="text-[11px] text-slate-500">
                {record.staffRole} • {record.branchName}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-xs text-slate-800 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>{record.date}</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Record ID: {record.id}</div>
          </div>
        </div>

        {/* Current vs New Form Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Adjusted Clock-In Time
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="time"
                value={punchIn}
                onChange={(e) => setPunchIn(e.target.value)}
                className="w-full text-xs font-mono pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Adjusted Clock-Out Time
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="time"
                value={punchOut}
                onChange={(e) => setPunchOut(e.target.value)}
                className="w-full text-xs font-mono pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Attendance Status Classification *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 capitalize"
            >
              <option value="present">Present (Full Day)</option>
              <option value="late">Late Arrival</option>
              <option value="half_day">Half Day Shift</option>
              <option value="absent">Unexcused Absent</option>
              <option value="on_leave">On Approved Leave</option>
              <option value="weekly_off">Weekly Off / Rest Day</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Station / Floor Assignment
            </label>
            <select
              value={station}
              onChange={(e) => setStation(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {(KITCHEN_STATIONS || []).map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mandatory Reason for Correction */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700">
              Mandatory Reason for Correction *
            </label>
            <span className="text-[10px] text-rose-500 font-semibold">Audit Logged</span>
          </div>
          <textarea
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why this record is being modified (e.g. Employee forgot to punch out; verified with CCTV)..."
            className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 placeholder:text-slate-400"
            required
          />

          {/* Quick preset chips */}
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {CORRECTION_REASONS.map((r, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setReason(r)}
                className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                + {r}
              </button>
            ))}
          </div>
        </div>

        {/* Audit Trail Banner */}
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <strong>Immutable Audit Policy:</strong> This correction will be permanently logged with your name, role, timestamp, original vs new clock values, and justification.
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="brand" size="sm" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving Correction...' : 'Authorize & Save Correction'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
