import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  CalendarCheck,
  ArrowLeftRight,
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
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { formatINR } from '../../data/branchData';

export const OwnerNotificationsPage = () => {
  const navigate = useNavigate();
  const {
    ownerNotifications,
    markOwnerNotificationRead,
    markAllOwnerNotificationsRead,
    addToast,
  } = useApp();

  const [filterType, setFilterType] = useState('all'); // 'all' | 'unread' | 'subscription' | 'transfer' | 'payment'
  const [searchTerm, setSearchTerm] = useState('');

  // Unread count
  const unreadCount = ownerNotifications.filter((n) => !n.read).length;

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return ownerNotifications.filter((n) => {
      const matchesSearch =
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (n.branchName && n.branchName.toLowerCase().includes(searchTerm.toLowerCase()));

      let matchesType = true;
      if (filterType === 'unread') {
        matchesType = !n.read;
      } else if (filterType === 'subscription') {
        matchesType = n.type?.includes('subscription') || n.type?.includes('renewal');
      } else if (filterType === 'transfer') {
        matchesType = n.type?.includes('transfer');
      } else if (filterType === 'payment') {
        matchesType = n.type?.includes('payment') || n.type?.includes('invoice');
      }

      return matchesSearch && matchesType;
    });
  }, [ownerNotifications, searchTerm, filterType]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'subscription_renewal':
      case 'renewal_due':
        return <CalendarCheck className="w-5 h-5 text-amber-600" />;
      case 'transfer_request':
      case 'transfer_approved':
        return <ArrowLeftRight className="w-5 h-5 text-indigo-600" />;
      case 'payment_success':
      case 'payment_pending':
        return <Receipt className="w-5 h-5 text-emerald-600" />;
      case 'plan_upgrade':
        return <Sparkles className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  const handleActionClick = (notif) => {
    markOwnerNotificationRead(notif.id);
    if (notif.actionLink) {
      navigate(notif.actionLink);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Notifications & Operational Alerts"
        subtitle="Real-time alerts for subscription renewals, staff transfer requests, payments, and plan updates."
        action={
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                icon={MailCheck}
                onClick={markAllOwnerNotificationsRead}
              >
                Mark All as Read ({unreadCount})
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              icon={CalendarCheck}
              onClick={() => navigate('/branch-subscriptions')}
            >
              Subscription Dashboard
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="All Notifications"
          value={ownerNotifications.length}
          subtitle="System Alerts"
          icon={Bell}
          variant="default"
        />
        <StatCard
          title="Unread Alerts"
          value={unreadCount}
          subtitle={unreadCount > 0 ? "Action Required" : "All Caught Up"}
          icon={AlertTriangle}
          variant={unreadCount > 0 ? "warning" : "default"}
        />
        <StatCard
          title="Staff Transfers"
          value={ownerNotifications.filter((n) => n.type?.includes('transfer')).length}
          subtitle="Workflow Requests"
          icon={ArrowLeftRight}
          variant="default"
        />
        <StatCard
          title="Renewals & Payments"
          value={ownerNotifications.filter((n) => n.type?.includes('subscription') || n.type?.includes('payment')).length}
          subtitle="Billing Notices"
          icon={CreditCard}
          variant="default"
        />
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Alerts', count: ownerNotifications.length },
              { id: 'unread', label: 'Unread', count: unreadCount, highlight: unreadCount > 0 },
              {
                id: 'subscription',
                label: 'Renewals & Plans',
                count: ownerNotifications.filter((n) => n.type?.includes('subscription') || n.type?.includes('renewal')).length,
              },
              {
                id: 'transfer',
                label: 'Staff Transfers',
                count: ownerNotifications.filter((n) => n.type?.includes('transfer')).length,
              },
              {
                id: 'payment',
                label: 'Payments & Invoices',
                count: ownerNotifications.filter((n) => n.type?.includes('payment')).length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  filterType === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    filterType === tab.id
                      ? 'bg-white/20 text-white'
                      : tab.highlight
                      ? 'bg-amber-200 text-amber-900 font-bold'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>
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
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:shadow-sm ${
                  isUnread
                    ? 'border-emerald-400/80 bg-emerald-50/10 ring-1 ring-emerald-500/20'
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
                        <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
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
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 w-full sm:w-auto justify-between sm:justify-end">
                  {notif.actionLabel && (
                    <Button
                      variant="primary"
                      size="xs"
                      onClick={() => handleActionClick(notif)}
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
                      onClick={() => markOwnerNotificationRead(notif.id)}
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

