import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  CalendarCheck,
  CreditCard,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Check,
  ExternalLink,
  Trash2,
  Building2,
  Receipt,
  MailCheck,
  RotateCcw,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { formatINR } from '../../data/branchData';
import { handleNotificationClick } from '../../utils/notificationNavigation';

export const OwnerNotificationsPage = () => {
  const navigate = useNavigate();
  const {
    ownerNotifications,
    markOwnerNotificationRead,
    markAllOwnerNotificationsRead,
    addToast,
    currentUser,
  } = useApp();

  const [filterType, setFilterType] = useState('all'); // 'all' | 'unread' | 'subscription' | 'payment'
  const [searchTerm, setSearchTerm] = useState('');

  // Unread count (filtered by role permissions)
  const unreadCount = ownerNotifications.filter((n) => {
    if (n.targetRoles && currentUser?.role && !n.targetRoles.includes(currentUser.role) && currentUser.role !== 'super_admin') {
      return false;
    }
    return !n.read;
  }).length;

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return ownerNotifications.filter((n) => {
      // Role-based visibility
      if (n.targetRoles && currentUser?.role && !n.targetRoles.includes(currentUser.role) && currentUser.role !== 'super_admin') {
        return false;
      }

      const matchesSearch =
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (n.branchName && n.branchName.toLowerCase().includes(searchTerm.toLowerCase()));

      let matchesType = true;
      if (filterType === 'unread') {
        matchesType = !n.read;
      } else if (filterType === 'subscription') {
        matchesType = n.type?.includes('subscription') || n.type?.includes('renewal');
      } else if (filterType === 'payment') {
        matchesType = n.type?.includes('payment') || n.type?.includes('invoice');
      } else if (filterType === 'holidays') {
        matchesType = n.type?.includes('holiday') || n.badge?.toLowerCase().includes('holiday') || n.title?.toLowerCase().includes('holiday');
      }

      return matchesSearch && matchesType;
    });
  }, [ownerNotifications, searchTerm, filterType, currentUser]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'subscription_renewal':
      case 'renewal_due':
        return <CalendarCheck className="w-5 h-5 text-amber-600" />;
      case 'payment_success':
      case 'payment_pending':
        return <Receipt className="w-5 h-5 text-emerald-600" />;
      case 'plan_upgrade':
      case 'holiday_created':
      case 'holiday_updated':
      case 'holiday_cancelled':
        return <Sparkles className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

    // Resolves notification actions to exact Workforce tabs and destinations
  const resolveNotificationActionLink = (notif) => {
    if (!notif) return '/workforce';
    const label = (notif.actionLabel || '').toLowerCase();
    const badge = (notif.badge || '').toLowerCase();
    const type = (notif.type || '').toLowerCase();

    // 1. Staff Roster / Team Invite
    if (label.includes('roster') || badge.includes('invite') || type === 'staff_added' || type === 'manager_assigned') {
      return '/workforce?tab=roster';
    }

    // 2. Timesheet / Shift End / Punched Out
    if (label.includes('timesheet') || badge.includes('shift end') || type === 'staff_punch_out') {
      return '/workforce?tab=attendance';
    }

    // 3. Attendance / Punched In
    if (label.includes('attendance') || badge.includes('attendance') || type === 'staff_punch_in') {
      return '/workforce?tab=attendance';
    }

    // 4. Leave Requisition Review
    if (label.includes('leave') || type === 'leave_request') {
      const leaveId = notif.leaveId ? `&leaveId=${notif.leaveId}` : '';
      return `/workforce?tab=leave${leaveId}`;
    }

    // Holiday Navigation
    if (label.includes('holiday') || type.includes('holiday') || badge.includes('holiday')) {
      const holidayId = notif.holidayId || '';
      return holidayId ? `/workforce?tab=holidays&holidayId=${holidayId}` : '/workforce?tab=holidays';
    }

    // 5. Existing explicit actionLink
    if (notif.actionLink) {
      let link = notif.actionLink.replace('/branch-staff', '/workforce');
      if (link === '/workforce') {
        if (label.includes('roster') || badge.includes('invite')) return '/workforce?tab=roster';
        if (label.includes('timesheet') || label.includes('attendance')) return '/workforce?tab=attendance';
      }
      return link;
    }

    return '/workforce';
  };

  const handleActionClick = (notif) => {
    markOwnerNotificationRead(notif.id);
    const targetUrl = resolveNotificationActionLink(notif);
    navigate(targetUrl);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <PageHeader
        title="Notifications & Operational Alerts"
        subtitle="Real-time alerts for subscription renewals, payments, and plan updates."
        breadcrumbs={[
          { label: 'Restaurant', href: '#/dashboard' },
          { label: 'Notifications' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllOwnerNotificationsRead}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all active:scale-[0.98] cursor-pointer"
              >
                <MailCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mark All as Read ({unreadCount})</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate('/branch-subscriptions')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs hover:shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Subscription Dashboard</span>
            </button>
          </div>
        }
      />

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="All Notifications"
          value={ownerNotifications.length}
          subtitle="System Alerts"
          icon={Bell}
          variant="default"
          onClick={() => setFilterType('all')}
          className={filterType === 'all' ? 'border-emerald-500 ring-2 ring-emerald-500/10' : ''}
        />
        <StatCard
          title="Unread Alerts"
          value={unreadCount}
          subtitle={unreadCount > 0 ? "Action Required" : "All Caught Up"}
          icon={AlertTriangle}
          variant={unreadCount > 0 ? "warning" : "default"}
          onClick={() => setFilterType('unread')}
          className={filterType === 'unread' ? 'border-amber-500 ring-2 ring-amber-500/10' : ''}
        />
        <StatCard
          title="Renewals & Billing"
          value={ownerNotifications.filter((n) => n.type?.includes('subscription') || n.type?.includes('payment')).length}
          subtitle="Billing Notices"
          icon={CreditCard}
          variant="info"
          onClick={() => setFilterType('subscription')}
          className={filterType === 'subscription' ? 'border-blue-500 ring-2 ring-blue-500/10' : ''}
        />
        <StatCard
          title="Holidays & Operations"
          value={ownerNotifications.filter((n) => n.type?.includes('holiday') || n.badge?.toLowerCase().includes('holiday')).length}
          subtitle="Branch Notices"
          icon={Sparkles}
          variant="success"
          onClick={() => setFilterType('holidays')}
          className={filterType === 'holidays' ? 'border-emerald-500 ring-2 ring-emerald-500/10' : ''}
        />
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search notifications by keyword, title, branch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/70 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                title="Clear search"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            {[
              { id: 'all', label: 'All Alerts', count: ownerNotifications.length },
              { id: 'unread', label: 'Unread', count: unreadCount },
              {
                id: 'subscription',
                label: 'Renewals & Plans',
                count: ownerNotifications.filter((n) => n.type?.includes('subscription') || n.type?.includes('renewal')).length,
              },
              {
                id: 'payment',
                label: 'Payments',
                count: ownerNotifications.filter((n) => n.type?.includes('payment')).length,
              },
              {
                id: 'holidays',
                label: 'Holidays',
                count: ownerNotifications.filter((n) => n.type?.includes('holiday') || n.badge?.toLowerCase().includes('holiday')).length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all select-none cursor-pointer ${
                  filterType === tab.id
                    ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${
                      filterType === tab.id
                        ? 'bg-emerald-700 text-white'
                        : tab.id === 'unread' && tab.count > 0
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

        {(searchTerm || filterType !== 'all') && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>
              Showing <strong className="text-slate-700">{filteredNotifications.length}</strong> of{' '}
              <strong className="text-slate-700">{ownerNotifications.length}</strong> notifications
            </span>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
              }}
              className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">All Caught Up!</h4>
            <p className="text-xs text-slate-500 mt-1">
              No notifications match your current filter settings.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const isUnread = !notif.read;

            return (
              <div
                key={notif.id}
                onClick={() => {
                  if (!notif.read) markOwnerNotificationRead(notif.id);
                }}
                title={isUnread ? 'Click anywhere on this notice to mark as read' : undefined}
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:shadow-sm cursor-pointer ${
                  isUnread
                    ? 'border-emerald-400/80 bg-emerald-50/10 ring-1 ring-emerald-500/20 hover:border-emerald-500'
                    : 'border-slate-200/90'
                }`}
              >
                {/* Left: Icon & Content */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isUnread ? 'bg-emerald-100/70' : 'bg-slate-100'
                    }`}
                  >
                    {getNotificationIcon(notif.type)}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200 animate-pulse" title="Unread" />
                      )}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                        {notif.badge || 'Alert'}
                      </span>
                      {notif.branchName && (
                        <span className="text-[10px] font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                          {notif.branchName}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-medium">
                        {notif.timestamp}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{notif.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>

                    {notif.amount && (
                      <div className="text-xs font-bold text-emerald-800 pt-0.5">
                        Amount: {formatINR(notif.amount)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div
                  className="flex items-center gap-2 shrink-0 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 w-full sm:w-auto justify-between sm:justify-end"
                  onClick={(e) => e.stopPropagation()}
                >
                  {notif.actionLabel && (
                    <Button
                      variant="primary"
                      size="xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActionClick(notif);
                      }}
                      className="text-xs bg-emerald-600 hover:bg-emerald-700"
                    >
                      {notif.actionLabel}
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  )}

                  {isUnread ? (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        markOwnerNotificationRead(notif.id);
                      }}
                      className="text-xs text-slate-500 hover:text-slate-800"
                    >
                      Mark as Read
                    </Button>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium px-2">Read</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

