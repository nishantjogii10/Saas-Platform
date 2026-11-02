import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ClockAlert,
  ShoppingBag,
  ExternalLink,
  Check,
  X,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { handleNotificationClick } from '../../utils/notificationNavigation';

export const AlertsPage = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    currentBranchId,
    restaurantAlerts,
    markAlertRead,
    markAllAlertsRead,
    dismissAlert,
    addToast,
  } = useApp();

  const isManager = currentUser?.role === 'restaurant_manager';
  const [filterMode, setFilterMode] = useState('all'); // all | unread | critical | expiry | leaves | shifts

  const roleFilteredAlerts = (restaurantAlerts || []).filter((a) => {
    if (a.targetRoles && currentUser?.role && !a.targetRoles.includes(currentUser.role) && currentUser.role !== 'super_admin') {
      return false;
    }
    return true;
  });

  const filteredAlerts = roleFilteredAlerts.filter((a) => {
    if (filterMode === 'unread') return !a.read;
    if (filterMode === 'holidays') {
      return a.badge === 'Holiday' || a.type?.includes('holiday') || (a.actionLabel || '').toLowerCase().includes('holiday');
    }
    if (isManager) {
      if (filterMode === 'leaves') return a.type === 'leave_request';
      if (filterMode === 'shifts') return a.type === 'attendance_notice';
      return true;
    }
    if (filterMode === 'critical') return a.severity === 'critical' || a.severity === 'high';
    if (filterMode === 'expiry') return a.type === 'expiring_soon' || a.type === 'expired';
    return true;
  });

  const unreadCount = roleFilteredAlerts.filter(a => !a.read).length;

    // Dispatches notification clicks with centralized RBAC and record resolution
  const onNotificationAction = (alt, e) => {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    handleNotificationClick({
      notification: alt,
      navigate,
      currentUser,
      currentBranchId,
      addToast,
      markAsRead: markAlertRead,
    });
  };


  return (
    <div className="space-y-5">
      <PageHeader
        title={isManager ? "Staff & Operations Notices" : "Kitchen & Stock Notifications"}
        subtitle={isManager ? "Real-time employee leave requests and station attendance alerts." : "Real-time threshold alerts, batch shelf-life warnings, and procurement updates."}
        breadcrumbs={[
          { label: 'Restaurant', href: '#/dashboard' },
          { label: 'Alerts' },
        ]}
        actions={
          unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAlertsRead}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all active:scale-[0.98] cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mark All as Read ({unreadCount})</span>
            </button>
          )
        }
      />

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          {(isManager
            ? [
                { id: 'all', label: 'All Staff Notices', count: roleFilteredAlerts.length },
                { id: 'unread', label: 'Unread Only', count: unreadCount },
                { id: 'holidays', label: 'Holiday Notices' },
                { id: 'leaves', label: 'Leave Requests' },
                { id: 'shifts', label: 'Shift Attendance' },
              ]
            : [
                { id: 'all', label: 'All Alerts', count: roleFilteredAlerts.length },
                { id: 'unread', label: 'Unread Only', count: unreadCount },
                { id: 'holidays', label: 'Holiday Notices' },
                { id: 'critical', label: 'Critical & High' },
                { id: 'expiry', label: 'Expiry Warnings' },
              ]
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterMode(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all select-none cursor-pointer ${
                filterMode === tab.id
                  ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${
                    filterMode === tab.id
                      ? 'bg-emerald-700 text-white'
                      : tab.id === 'unread'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-2xl border border-dashed border-slate-200">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">{isManager ? "No active staff notices" : "No active alerts"}</h3>
            <p className="text-xs text-slate-500 mt-1">
              {isManager ? "All staff leave requests and shift rosters are in good standing." : "Your kitchen stock thresholds and batch expiry dates are in good standing."}
            </p>
          </div>
        ) : (
          filteredAlerts.map((alt) => (
            <div
              key={alt.id}
              onClick={(e) => onNotificationAction(alt, e)}
              title="Click anywhere to open notice details"
              className={`p-4 sm:p-5 rounded-2xl border transition-all duration-150 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs cursor-pointer ${
                !alt.read
                  ? 'bg-white border-emerald-300/80 ring-1 ring-emerald-500/10 hover:border-emerald-400 hover:shadow-sm'
                  : 'bg-white/80 border-slate-200 opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1">
                <div className="mt-0.5 shrink-0">
                  {alt.badge === 'Holiday' || alt.type?.includes('holiday') ? (
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                  ) : alt.type === 'leave_request' ? (
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                      <Calendar className="w-5 h-5" />
                    </div>
                  ) : alt.type === 'attendance_notice' ? (
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                  ) : alt.severity === 'critical' ? (
                    <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                  ) : alt.severity === 'high' ? (
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                  ) : alt.type === 'expiring_soon' ? (
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                      <ClockAlert className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm">{alt.title}</span>
                    <Badge status={alt.severity} size="xs" />
                    {!alt.read && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="Unread"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{alt.message}</p>
                  <span className="text-[11px] text-slate-400 block">
                    {new Date(alt.timestamp).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                {alt.actionLink && (
                  <Button
                    variant="brand"
                    size="xs"
                    iconRight={ExternalLink}
                    onClick={(e) => {
                      e.stopPropagation();
                      onNotificationAction(alt, e);
                    }}
                  >
                    {alt.actionLabel || 'Take Action'}
                  </Button>
                )}

                {!alt.read ? (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      markAlertRead(alt.id);
                    }}
                    title="Mark as Read"
                    className="text-emerald-700 hover:bg-emerald-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </Button>
                ) : (
                  <span className="text-[11px] text-slate-400 font-medium px-1.5">Read</span>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissAlert(alt.id);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                  title="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

