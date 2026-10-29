import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Clock,
  LogIn,
  LogOut,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Timer,
  ChevronDown,
  ChevronUp,
  MapPin,
  FileText,
  Activity,
  History,
  Sparkles,
  Flame,
  UtensilsCrossed,
  ShieldCheck,
  Check,
  RotateCcw,
  Coffee,
  PlayCircle,
  PauseCircle,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const PunchClockWidget = () => {
  const {
    currentUser,
    currentBranch,
    attendanceRecords,
    punchInStaff,
    punchOutStaff,
    startStaffBreak,
    endStaffBreak,
    KITCHEN_STATIONS,
  } = useApp();

  if (currentUser?.role === 'restaurant_owner') {
    return null;
  }

  // Wall clock state
  const [currentTime, setCurrentTime] = useState(new Date());

  // Determine stations based on role
  const availableStations =
    currentUser?.role === 'inventory_manager'
      ? ['Receiving Dock', 'Cold Storage Ledger', 'Dry Stores Inventory', 'Procurement Desk', 'Quality Audit']
      : currentUser?.role === 'restaurant_manager'
      ? ['Floor Operations', 'Staff Briefing & Admin', 'Billing & Dispatch', 'General Management']
      : (KITCHEN_STATIONS || ['Main Prep Line', 'Curries & Gravies', 'Tandoor & Grill', 'Bakery & Sweets', 'Salads & Cold Prep', 'Sanitation']);

  // Form states
  const [selectedStation, setSelectedStation] = useState(availableStations[0]);
  const [punchNote, setPunchNote] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [punchSuccessFeedback, setPunchSuccessFeedback] = useState(null); // 'in' | 'out' | 'break_start' | 'break_end' | null

  // Update wall clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Update default station if role changes
  useEffect(() => {
    if (!selectedStation || !availableStations.includes(selectedStation)) {
      setSelectedStation(availableStations[0]);
    }
  }, [currentUser?.role]);

  // Find active punch-in session for current user
  const activeRecord = attendanceRecords.find(
    (r) => r.staffId === currentUser?.id && r.status === 'active'
  );

  // Calculate live shift elapsed time
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!activeRecord) {
      setElapsedSeconds(0);
      return;
    }

    const calcElapsed = () => {
      const inTime = new Date(activeRecord.punchInTime);
      const diffSec = Math.max(0, Math.floor((Date.now() - inTime.getTime()) / 1000));
      setElapsedSeconds(diffSec);
    };

    calcElapsed();
    const interval = setInterval(calcElapsed, 1000);
    return () => clearInterval(interval);
  }, [activeRecord]);

  const formatElapsed = (totalSec) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return {
      hrs: hrs.toString().padStart(2, '0'),
      mins: mins.toString().padStart(2, '0'),
      secs: secs.toString().padStart(2, '0'),
    };
  };

  const elapsed = formatElapsed(elapsedSeconds);

  // Target 8 hour shift progress
  const shiftProgressPercent = Math.min(100, Math.round((elapsedSeconds / (8 * 3600)) * 100));

  // User's attendance records
  const userRecords = attendanceRecords.filter((r) => r.staffId === currentUser?.id);

  // Stats calculation
  const totalCompletedHours = userRecords
    .filter((r) => r.status === 'completed' && r.totalHours)
    .reduce((sum, r) => sum + Number(r.totalHours), 0);

  const shiftsCount = userRecords.length;

  const handlePunchIn = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      punchInStaff({
        staffId: currentUser?.id,
        staffName: currentUser?.name,
        staffRole: currentUser?.roleLabel || 'Staff Member',
        branchId: currentBranch?.id,
        station: selectedStation,
        notes: punchNote || 'Shift clocked in via Terminal',
      });
      setIsSubmitting(false);
      setPunchNote('');
      setPunchSuccessFeedback('in');
      setTimeout(() => setPunchSuccessFeedback(null), 3500);
    }, 300);
  };

  const handlePunchOut = () => {
    if (!activeRecord) return;
    setIsSubmitting(true);

    setTimeout(() => {
      punchOutStaff(activeRecord.id, punchNote || 'Shift ended cleanly');
      setIsSubmitting(false);
      setPunchNote('');
      setPunchSuccessFeedback('out');
      setTimeout(() => setPunchSuccessFeedback(null), 3500);
    }, 300);
  };

  const handleTakeBreak = () => {
    if (!activeRecord) return;
    setIsSubmitting(true);
    setTimeout(() => {
      startStaffBreak(activeRecord.id);
      setIsSubmitting(false);
      setPunchSuccessFeedback('break_start');
      setTimeout(() => setPunchSuccessFeedback(null), 3500);
    }, 200);
  };

  const handleResumeShift = () => {
    if (!activeRecord) return;
    setIsSubmitting(true);
    setTimeout(() => {
      endStaffBreak(activeRecord.id);
      setIsSubmitting(false);
      setPunchSuccessFeedback('break_end');
      setTimeout(() => setPunchSuccessFeedback(null), 3500);
    }, 200);
  };

  // Station Icons / Emojis
  const getStationIcon = (stationName) => {
    if (!stationName) return '📍';
    if (stationName.includes('Grill') || stationName.includes('Tandoor')) return '🔥';
    if (stationName.includes('Curries') || stationName.includes('Sauté')) return '🍲';
    if (stationName.includes('Bakery') || stationName.includes('Dessert')) return '🍰';
    if (stationName.includes('Pantry') || stationName.includes('Salads')) return '🥗';
    if (stationName.includes('Sanitation')) return '🧼';
    if (stationName.includes('Receiving') || stationName.includes('Dock')) return '📦';
    if (stationName.includes('Cold') || stationName.includes('Freeze')) return '❄️';
    if (stationName.includes('Dry') || stationName.includes('Inventory')) return '📊';
    if (stationName.includes('Procurement') || stationName.includes('Desk')) return '📋';
    if (stationName.includes('Floor')) return '🏢';
    if (stationName.includes('Billing')) return '🧾';
    if (stationName.includes('Briefing') || stationName.includes('Admin')) return '👔';
    if (stationName.includes('Management')) return '💼';
    return '⏱️';
  };

  return (
    <div className="relative rounded-3xl bg-white border border-slate-200/90 shadow-xl shadow-slate-900/5 overflow-hidden transition-all duration-300">
      {/* Decorative ambient background blur lights */}
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

      {/* Top Header Terminal Bar */}
      <div className="relative p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-slate-50/80 via-white to-emerald-50/30">
        <div className="flex items-center gap-3.5">
          {/* Animated Avatar / Duty Pulse */}
          <div className="relative">
            <img
              src={
                currentUser?.avatar ||
                'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=150&auto=format&fit=crop&q=80'
              }
              alt={currentUser?.name}
              className={`w-13 h-13 rounded-2xl object-cover ring-3 transition-all duration-300 ${
                activeRecord?.isOnBreak
                  ? 'ring-amber-500 shadow-md shadow-amber-500/30 animate-pulse'
                  : activeRecord
                  ? 'ring-emerald-500 shadow-md shadow-emerald-500/30 animate-pulse-glow'
                  : 'ring-slate-200'
              }`}
            />
            {/* Status Indicator Dot */}
            <span
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                activeRecord?.isOnBreak ? 'bg-amber-500' : activeRecord ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            >
              {activeRecord && (
                <span
                  className={`w-full h-full rounded-full ${
                    activeRecord.isOnBreak ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-radar'
                  }`}
                />
              )}
            </span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {currentUser?.name}
              </h2>
              {activeRecord?.isOnBreak ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-xs shadow-amber-500/40 animate-pulse">
                  <Coffee className="w-3.5 h-3.5" />
                  ON BREAK (PAUSED)
                </span>
              ) : activeRecord ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-xs shadow-emerald-500/40 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  ON DUTY (ACTIVE)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200/80">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  NOT CLOCKED IN
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
              <span className="font-semibold text-slate-700">{currentUser?.roleLabel || 'Staff Member'}</span>
              <span>•</span>
              <span className="text-emerald-800 font-medium">{currentBranch?.name || 'Spice Garden — Pune Central'}</span>
            </p>
          </div>
        </div>

        {/* Live Digital Wall Clock Capsule */}
        <div className="flex items-center gap-3 bg-slate-950/90 text-white px-4 py-2.5 rounded-2xl border border-slate-800 shadow-inner font-mono backdrop-blur-md">
          <Clock className="w-5 h-5 text-emerald-400 animate-pulse" />
          <div className="text-right">
            <div className="text-lg font-black tracking-wider text-emerald-400 leading-none">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">
              {currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* Success Feedback Flash */}
      {punchSuccessFeedback && (
        <div
          className={`mx-5 sm:mx-6 mt-4 p-3.5 rounded-2xl font-semibold text-xs flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2 duration-300 ${
            punchSuccessFeedback === 'break_start'
              ? 'bg-amber-500 text-white shadow-amber-500/30'
              : punchSuccessFeedback === 'break_end'
              ? 'bg-emerald-600 text-white shadow-emerald-600/30'
              : punchSuccessFeedback === 'in'
              ? 'bg-emerald-500 text-white shadow-emerald-500/30'
              : 'bg-slate-800 text-white shadow-slate-900/30'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-white/90" />
            <span>
              {punchSuccessFeedback === 'in' && '🎉 Successfully clocked in! Your shift timer is now active.'}
              {punchSuccessFeedback === 'out' && '✅ Shift completed and clocked out. Total working hours recorded.'}
              {punchSuccessFeedback === 'break_start' && '☕ Break session started. Shift timer paused.'}
              {punchSuccessFeedback === 'break_end' && '⚡ Shift resumed! Welcome back to active duty.'}
            </span>
          </div>
          <span className="text-[10px] opacity-80 uppercase tracking-wider font-mono">Live Sync</span>
        </div>
      )}

      {/* Main Interactive Work Panel */}
      <div className="p-5 sm:p-6">
        {activeRecord ? (
          /* ================= ON DUTY ACTIVE / ON BREAK VIEW ================= */
          <div
            className={`rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border transition-all duration-300 ${
              activeRecord.isOnBreak
                ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 border-amber-500/30'
                : 'bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 border-emerald-500/20'
            }`}
          >
            {/* Background pattern */}
            <div
              className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none ${
                activeRecord.isOnBreak ? 'bg-amber-500/10' : 'bg-emerald-500/10'
              }`}
            />

            <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Left Column: Live Time Counter */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                  {activeRecord.isOnBreak ? (
                    <span className="text-amber-400 flex items-center gap-1.5">
                      <Coffee className="w-4 h-4 animate-bounce" />
                      Shift Paused • Break in Progress
                    </span>
                  ) : (
                    <span className="text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      Live Shift Duration Counter
                    </span>
                  )}
                </div>

                {/* Big Digital Monospace Display */}
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-3 min-w-[72px]">
                    <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
                      {elapsed.hrs}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-1">Hours</span>
                  </div>
                  <span
                    className={`text-2xl font-black ${
                      activeRecord.isOnBreak ? 'text-amber-400' : 'text-emerald-400 animate-pulse'
                    }`}
                  >
                    :
                  </span>
                  <div className="flex flex-col items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-3 min-w-[72px]">
                    <span
                      className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${
                        activeRecord.isOnBreak ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {elapsed.mins}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-1">Mins</span>
                  </div>
                  <span
                    className={`text-2xl font-black ${
                      activeRecord.isOnBreak ? 'text-amber-400' : 'text-emerald-400 animate-pulse'
                    }`}
                  >
                    :
                  </span>
                  <div className="flex flex-col items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-3 min-w-[72px]">
                    <span
                      className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${
                        activeRecord.isOnBreak ? 'text-amber-300' : 'text-emerald-300'
                      }`}
                    >
                      {elapsed.secs}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-1">Secs</span>
                  </div>
                </div>

                {/* Meta Station & Time Info */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-300">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 border border-white/10 font-semibold text-emerald-300">
                    <span>{getStationIcon(activeRecord.station)}</span>
                    <span>{activeRecord.station}</span>
                  </span>
                  <span>•</span>
                  <span>
                    Clocked in at{' '}
                    <strong className="text-white font-mono">
                      {new Date(activeRecord.punchInTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </strong>
                  </span>
                  {activeRecord.breakMinutes > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-amber-300 font-semibold">
                        Break: {activeRecord.breakMinutes} mins recorded
                      </span>
                    </>
                  )}
                </div>

                {/* 8-Hour Target Progress Bar */}
                <div className="max-w-md space-y-1.5 pt-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Daily Shift Progress</span>
                    <span
                      className={`font-mono font-bold ${
                        activeRecord.isOnBreak ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {shiftProgressPercent}% (8h standard)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ease-out ${
                        activeRecord.isOnBreak
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      }`}
                      style={{ width: `${shiftProgressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Actions (Break / Resume / Punch Out) */}
              <div className="flex flex-col sm:items-end gap-3 shrink-0 lg:max-w-xs w-full">
                <div className="w-full">
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Shift Handover / Closing Note (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Completed inventory count, all stations clean..."
                    value={punchNote}
                    onChange={(e) => setPunchNote(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-white/15 bg-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400/40 transition-all"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
                  {/* Break Button (Take Break or Resume) */}
                  {activeRecord.isOnBreak ? (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleResumeShift}
                      className="w-full sm:flex-1 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                    >
                      <PlayCircle className="w-4 h-4 text-white" />
                      <span>Resume Shift</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleTakeBreak}
                      className="w-full sm:flex-1 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                    >
                      <Coffee className="w-4 h-4 text-amber-300" />
                      <span>Take Break</span>
                    </button>
                  )}

                  {/* Punch Out Action */}
                  <button
                    type="button"
                    disabled={isSubmitting || activeRecord.isOnBreak}
                    onClick={handlePunchOut}
                    title={activeRecord.isOnBreak ? 'Resume shift before clocking out' : 'Punch Out'}
                    className="w-full sm:flex-1 px-4 py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-700 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-bold text-xs shadow-xl shadow-rose-950/40 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-white/90" />
                    <span>Punch Out</span>
                  </button>
                </div>

                <span className="text-[10px] text-slate-400 text-center sm:text-right">
                  {activeRecord.isOnBreak
                    ? 'Break timer running. Resume shift before final clock out.'
                    : 'Calculates total working hours and updates the Live Attendance Board.'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* ================= OFF DUTY PUNCH-IN VIEW ================= */
          <form onSubmit={handlePunchIn} className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Select Work Station / Area &amp; Punch In
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select your assigned station or duty desk for today's shift.
                </p>
              </div>

              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Shift Status: Ready to Clock In
              </span>
            </div>

            {/* Station Selector Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {availableStations.map((station) => {
                const isSelected = selectedStation === station;
                const icon = getStationIcon(station);

                return (
                  <button
                    key={station}
                    type="button"
                    onClick={() => setSelectedStation(station)}
                    className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between gap-3 group relative cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 shadow-md shadow-emerald-600/10 ring-2 ring-emerald-500/20'
                        : 'border-slate-200/90 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-2xl">{icon}</span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-bold leading-tight block">{station}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Shift Note & Big Punch In CTA */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex-1 max-w-lg">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Shift Opening Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Starting shift, inventory checks, kitchen prep..."
                  value={punchNote}
                  onChange={(e) => setPunchNote(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-500 hover:to-teal-700 text-white font-black text-sm tracking-wide shadow-xl shadow-emerald-900/25 flex items-center justify-center gap-2.5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer shrink-0"
              >
                <LogIn className="w-5 h-5 text-emerald-200" />
                <span>PUNCH IN &amp; START SHIFT</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Quick Summary Metrics Row */}
      <div className="px-5 sm:px-6 py-4 bg-slate-50/70 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">Logged Hours</span>
          <span className="font-extrabold text-slate-900 text-base mt-0.5 block font-mono">
            {totalCompletedHours.toFixed(1)} hrs
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">Recorded Shifts</span>
          <span className="font-extrabold text-slate-900 text-base mt-0.5 block font-mono">
            {shiftsCount} shifts
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">Shift Duty Status</span>
          <span
            className={`font-bold text-sm mt-0.5 block ${
              activeRecord?.isOnBreak ? 'text-amber-600' : activeRecord ? 'text-emerald-700' : 'text-slate-600'
            }`}
          >
            {activeRecord?.isOnBreak ? '☕ On Break' : activeRecord ? '🟢 On Duty Now' : '⚪ Off Duty'}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">Shift Ledger</span>
            <span className="font-bold text-slate-900 text-xs mt-0.5 block">{userRecords.length} records</span>
          </div>
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>{showHistory ? 'Close' : 'Ledger'}</span>
            {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expandable Shift History Ledger */}
      {showHistory && (
        <div className="p-5 sm:p-6 border-t border-slate-200 bg-slate-50/50 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-4 h-4 text-emerald-600" />
              Your Recent Clock-In &amp; Shift History
            </h4>
            <span className="text-[11px] text-slate-500 font-mono">Verified Digital Attendance Logs</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Station</th>
                  <th className="py-3 px-4">Clock-In</th>
                  <th className="py-3 px-4">Clock-Out</th>
                  <th className="py-3 px-4">Break</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Shift Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {userRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-slate-400 text-xs">
                      No shift records logged yet.
                    </td>
                  </tr>
                ) : (
                  userRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{rec.date}</td>
                      <td className="py-3 px-4 text-slate-700">
                        <span className="mr-1">{getStationIcon(rec.station)}</span>
                        {rec.station}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        {new Date(rec.punchInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        {rec.punchOutTime
                          ? new Date(rec.punchOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        {rec.breakMinutes ? `${rec.breakMinutes} min` : '0 min'}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 font-mono">
                        {rec.totalHours ? `${rec.totalHours} hrs` : <span className="text-emerald-600">Active Shift</span>}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            rec.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {rec.status === 'active' ? 'Active Shift' : 'Completed'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px] truncate max-w-xs">
                        {rec.notes || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
