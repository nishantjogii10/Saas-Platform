import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  IndianRupee,
  Receipt,
  Calendar,
  Check,
  ChevronRight,
  ShieldCheck,
  Megaphone,
} from 'lucide-react';
import { Button } from '../common/Button';
import { formatINR } from '../../data/financeData';

export const StaffNotificationHub = ({ onOpenSalarySlip }) => {
  const {
    currentUser,
    staffNotifications,
    salaryPayments,
    markStaffNotificationRead,
    markAllStaffNotificationsRead,
  } = useApp();

  const [filterType, setFilterType] = useState('all'); // 'all' | 'salary' | 'leave'

  // Notifications targeted at this staff member
  const myNotifications = staffNotifications.filter(
    (n) => n.targetStaffId === currentUser?.id
  );

  const unreadCount = myNotifications.filter((n) => !n.read).length;

  const filteredNotifs = myNotifications.filter((n) => {
    if (filterType === 'salary') return n.type === 'salary_credit';
    if (filterType === 'leave') return n.type === 'leave_status';
    return true;
  });

  return (
    <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50/70 via-white to-emerald-50/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-700/20">
            <Bell className="w-5 h-5 text-emerald-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base">
                Staff Notifications &amp; Payroll Hub
              </h3>
              {unreadCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pulse">
                  {unreadCount} New
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                  All Caught Up
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Official salary credits, leave review status updates, and kitchen line notices
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => markAllStaffNotificationsRead(currentUser?.id)}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark All As Read</span>
          </button>
        )}
      </div>

      {/* Filter Chips */}
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex flex-wrap gap-2 text-xs">
        <button
          type="button"
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
            filterType === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All Activity ({myNotifications.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterType('salary')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            filterType === 'salary'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <IndianRupee className="w-3.5 h-3.5" />
          <span>Salary Remittances</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterType('leave')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            filterType === 'leave'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Leave Updates</span>
        </button>
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-slate-100">
        {filteredNotifs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="font-medium text-slate-600">No notifications in this category.</p>
            <p className="text-[11px] text-slate-400">All announcements and salary updates will appear here.</p>
          </div>
        ) : (
          filteredNotifs.map((notif) => {
            const isSalary = notif.type === 'salary_credit';
            const isLeave = notif.type === 'leave_status';

            return (
              <div
                key={notif.id}
                onClick={() => markStaffNotificationRead(notif.id)}
                title={!notif.read ? 'Click anywhere on this notice to mark as read' : undefined}
                className={`p-4 sm:p-5 transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  !notif.read
                    ? 'bg-emerald-50/40 hover:bg-emerald-50/70 border-l-4 border-l-emerald-600'
                    : 'hover:bg-slate-50/80'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${
                      isSalary
                        ? 'bg-emerald-600 text-white'
                        : notif.status === 'approved'
                        ? 'bg-teal-600 text-white'
                        : notif.status === 'rejected'
                        ? 'bg-rose-600 text-white'
                        : 'bg-amber-500 text-white'
                    }`}
                  >
                    {isSalary ? (
                      <IndianRupee className="w-5 h-5" />
                    ) : isLeave ? (
                      <Calendar className="w-5 h-5" />
                    ) : (
                      <Megaphone className="w-5 h-5" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 tracking-tight">
                        {notif.title}
                      </h4>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {notif.timestamp}
                    </span>
                  </div>
                </div>

                {/* Optional CTA per Notification */}
                {isSalary && (
                  <div className="self-end sm:self-center shrink-0">
                    <Button
                      variant="outline"
                      size="xs"
                      icon={Receipt}
                      onClick={(e) => {
                        e.stopPropagation();
                        markStaffNotificationRead(notif.id);
                        const matchPay = salaryPayments.find((s) => s.id === notif.paymentId) || salaryPayments[0];
                        if (matchPay) onOpenSalarySlip(matchPay);
                      }}
                      className="bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-50 shadow-2xs"
                    >
                      Inspect Pay Voucher
                    </Button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

