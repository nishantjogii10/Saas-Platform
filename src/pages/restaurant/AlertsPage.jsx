import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  IndianRupee,
  Receipt,
  Megaphone,
  Trash2,
  Sparkles,
  ArrowLeftRight,
  Zap,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { SalarySlipModal } from '../../components/kitchen/SalarySlipModal';

export const AlertsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab') || searchParams.get('filter');

  const {
    currentUser,
    restaurantAlerts,
    staffNotifications,
    ownerNotifications,
    salaryPayments,
    markAlertRead,
    markAllAlertsRead,
    markStaffNotificationRead,
    markAllStaffNotificationsRead,
    markOwnerNotificationRead,
    markAllOwnerNotificationsRead,
    dismissAlert,
    triggerAutomatedLowStockReorder,
  } = useApp();

  const isManager = currentUser?.role === 'restaurant_manager';
  const isKitchenStaff = currentUser?.role === 'kitchen_staff';

  const [filterMode, setFilterMode] = useState(urlTab || 'all');
  const [selectedSalarySlip, setSelectedSalarySlip] = useState(null);

  // Sync tab with URL search parameter
  useEffect(() => {
    if (urlTab) {
      setFilterMode(urlTab);
    }
  }, [urlTab]);

  // 1. Filtered stock/operational alerts for current user
  const roleFilteredAlerts = useMemo(() => {
    return (restaurantAlerts || [])
      .filter((a) => {
        if (
          a.targetRoles &&
          currentUser?.role &&
          !a.targetRoles.includes(currentUser.role) &&
          currentUser.role !== 'super_admin'
        ) {
          return false;
        }
        return true;
      })
      .map((a) => ({
        ...a,
        sourceType: 'alert',
        badgeLabel: a.badge || 'Stock Alert',
      }));
  }, [restaurantAlerts, currentUser]);

  // 2. Role-specific notifications (staff notices for kitchen staff, owner notices for owner/admin)
  const relevantNotifs = useMemo(() => {
    if (isKitchenStaff) {
      return (staffNotifications || [])
        .filter((n) => !n.targetStaffId || n.targetStaffId === currentUser?.id)
        .map((n) => ({
          ...n,
          sourceType: 'notification',
          badgeLabel:
            n.type === 'salary_credit'
              ? 'Payroll'
              : n.type === 'leave_status'
              ? 'Leave Update'
              : 'Kitchen Notice',
          severity: n.type === 'salary_credit' ? 'normal' : n.severity || 'low',
        }));
    }
    if (isManager) {
      return (ownerNotifications || [])
        .filter((n) => n.type === 'leave_request' || n.type === 'transfer_request')
        .map((n) => ({
          ...n,
          sourceType: 'notification',
          badgeLabel: n.badge || 'Staff Notice',
        }));
    }
    // Owner / Inventory Manager
    return (ownerNotifications || []).map((n) => ({
      ...n,
      sourceType: 'notification',
      badgeLabel: n.badge || 'Notice',
      severity: n.severity || 'normal',
    }));
  }, [isKitchenStaff, isManager, staffNotifications, ownerNotifications, currentUser]);

  // 3. Combined items sorted chronologically
  const allItems = useMemo(() => {
    if (isManager) {
      return roleFilteredAlerts;
    }
    const combined = [...roleFilteredAlerts, ...relevantNotifs];
    return combined.sort((a, b) => {
      const timeA = new Date(a.timestamp || 0).getTime() || 0;
      const timeB = new Date(b.timestamp || 0).getTime() || 0;
      return timeB - timeA;
    });
  }, [isManager, roleFilteredAlerts, relevantNotifs]);

  // 4. Filtered items based on active tab
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      if (filterMode === 'unread') return !item.read;
      if (filterMode === 'alerts') return item.sourceType === 'alert';
      if (filterMode === 'notifications' || filterMode === 'notices')
        return item.sourceType === 'notification';

      if (isManager) {
        if (filterMode === 'leaves') return item.type === 'leave_request';
        if (filterMode === 'transfers' || filterMode === 'shifts')
          return item.type === 'transfer_request' || item.type === 'attendance_notice';
        if (filterMode === 'holidays') {
          return item.badge === 'Holiday' || item.type?.includes('holiday') || (item.actionLabel || '').toLowerCase().includes('holiday');
        }
        return true;
      }

      if (filterMode === 'critical') return item.severity === 'critical' || item.severity === 'high';
      if (filterMode === 'expiry') return item.type === 'expiring_soon' || item.type === 'expired';
      if (filterMode === 'holidays') {
        return item.badge === 'Holiday' || item.type?.includes('holiday') || (item.actionLabel || '').toLowerCase().includes('holiday');
      }
      return true;
    });
  }, [allItems, filterMode, isManager]);

  const unreadCount = allItems.filter((a) => !a.read).length;

  const handleTabChange = (tabId) => {
    setFilterMode(tabId);
    setSearchParams({ tab: tabId });
  };

  const handleMarkItemRead = (item) => {
    if (item.sourceType === 'notification') {
      if (isKitchenStaff) {
        markStaffNotificationRead(item.id);
      } else {
        markOwnerNotificationRead(item.id);
      }
    } else {
      markAlertRead(item.id);
    }
  };

  const handleMarkAllRead = () => {
    markAllAlertsRead();
    if (isKitchenStaff) {
      markAllStaffNotificationsRead(currentUser?.id);
    } else if (!isManager) {
      markAllOwnerNotificationsRead();
    }
  };

  const handleDismiss = (item) => {
    if (item.sourceType === 'alert') {
      dismissAlert(item.id);
    } else {
      handleMarkItemRead(item);
    }
  };

  // Resolves and normalizes action links with exact requisition IDs and tabs
  const getAlertActionLink = (alert) => {
    if (!alert.actionLink && !alert.actionLabel) return null;
    const label = (alert.actionLabel || '').toLowerCase();
    const type = (alert.type || '').toLowerCase();
    const badge = (alert.badge || '').toLowerCase();

    if (label.includes('roster') || badge.includes('invite') || type === 'staff_added') {
      return '/workforce?tab=roster';
    }
    if (label.includes('timesheet') || badge.includes('shift end') || type === 'staff_punch_out') {
      return '/workforce?tab=attendance';
    }
    if (label.includes('attendance') || badge.includes('attendance') || type === 'staff_punch_in' || type === 'attendance_notice') {
      return '/workforce?tab=attendance';
    }
    if (label.includes('holiday') || type.includes('holiday') || badge.includes('holiday')) {
      const holidayId = alert.holidayId || '';
      return holidayId ? `/workforce?tab=holidays&holidayId=${holidayId}` : '/workforce?tab=holidays';
    }
    if (type === 'leave_request' || label.includes('leave')) {
      const leaveId = alert.leaveId || (alert.id?.startsWith('alert-leave-') ? alert.id.replace('alert-leave-', '') : '');
      if (leaveId) {
        return `/workforce?tab=leave&leaveId=${leaveId}`;
      }
      return '/workforce?tab=leave';
    }
    let link = alert.actionLink || '';
    return link.replace('/branch-staff', '/workforce');
  };

  const getSafeAction = (item) => {
    if (item.type === 'salary_credit') {
      const match =
        salaryPayments?.find(
          (p) =>
            p.referenceNumber === item.referenceNumber ||
            p.targetStaffId === currentUser?.id
        ) || {
          referenceNumber: item.referenceNumber || 'UTR-SAL-202610-8842',
          payPeriod: item.payPeriod || 'October 2026',
          netPayable: item.amount || 32000,
          staffName: currentUser?.name || 'Kitchen Staff',
          employeeCode: currentUser?.code || 'EMP-KITCHEN',
          status: 'Credited',
          paymentDate: '31 Oct 2026',
          branchName: 'Spice Garden - Pune Central',
        };
      return {
        label: 'View Pay Slip',
        onClick: () => {
          handleMarkItemRead(item);
          setSelectedSalarySlip(match);
        },
      };
    }

    if (!item.actionLink && !item.actionLabel) return null;

    let targetLink = item.actionLink || '';
    let targetLabel = item.actionLabel || 'Take Action';

    if (isKitchenStaff) {
      if (item.actionLink?.startsWith('/purchase-orders')) {
        targetLink = '/kitchen/report-stock';
        targetLabel = 'Report Stock';
      } else if (item.actionLink?.startsWith('/inventory')) {
        targetLink = '/kitchen/ingredients';
        targetLabel = 'Check Stock';
      } else if (item.actionLink?.startsWith('/expiry-tracking')) {
        targetLink = '/kitchen/ingredients';
        targetLabel = 'View Shelf-Life';
      } else if (
        !['/kitchen', '/alerts', '/my-attendance', '/profile'].some((p) =>
          item.actionLink?.startsWith(p)
        )
      ) {
        targetLink = '/kitchen';
        targetLabel = 'Kitchen Station';
      }
    } else if (isManager) {
      const normalized = getAlertActionLink(item);
      if (normalized) {
        targetLink = normalized;
      } else if (
        !['/workforce', '/branch-staff', '/staff-transfers', '/alerts', '/reports', '/my-attendance', '/profile'].some(
          (p) => item.actionLink?.startsWith(p)
        )
      ) {
        targetLink = '/alerts';
      }
    }

    if (!targetLink) return null;

    return {
      label: targetLabel,
      onClick: () => {
        handleMarkItemRead(item);
        navigate(targetLink);
      },
    };
  };

  const tabs = useMemo(() => {
    if (isKitchenStaff) {
      return [
        { id: 'all', label: 'All Activity', count: allItems.length },
        { id: 'alerts', label: 'Stock Alerts', count: roleFilteredAlerts.length },
        { id: 'notifications', label: 'Staff Notices & Payroll', count: relevantNotifs.length },
        { id: 'unread', label: 'Unread Only', count: unreadCount },
        { id: 'critical', label: 'Critical & High' },
        { id: 'expiry', label: 'Expiry Warnings' },
      ];
    }
    if (isManager) {
      return [
        { id: 'all', label: 'All Staff Notices', count: roleFilteredAlerts.length },
        { id: 'unread', label: 'Unread Only', count: unreadCount },
        { id: 'leaves', label: 'Leave Requests' },
        { id: 'transfers', label: 'Transfers & Shifts' },
      ];
    }
    return [
      { id: 'all', label: 'All Activity', count: allItems.length },
      { id: 'alerts', label: 'Stock Alerts', count: roleFilteredAlerts.length },
      { id: 'notifications', label: 'System Notices', count: relevantNotifs.length },
      { id: 'unread', label: 'Unread Only', count: unreadCount },
      { id: 'critical', label: 'Critical & High' },
      { id: 'expiry', label: 'Expiry Warnings' },
    ];
  }, [isKitchenStaff, isManager, allItems.length, roleFilteredAlerts.length, relevantNotifs.length, unreadCount]);

  const pageTitle = isManager
    ? 'Staff & Operations Notices'
    : isKitchenStaff
    ? 'Kitchen Station Alerts & Notifications'
    : 'Kitchen & Stock Notifications';

  const pageSubtitle = isManager
    ? 'Real-time employee leave requests, transfer approvals, and station attendance alerts'
    : isKitchenStaff
    ? 'Real-time threshold alerts, batch shelf-life warnings, salary credits, and kitchen notices'
    : 'Real-time threshold alerts, batch shelf-life warnings, and procurement updates';

  const breadcrumbs = isKitchenStaff
    ? [
        { label: 'Kitchen Station', href: '#/kitchen' },
        { label: 'Notifications & Alerts' },
      ]
    : [
        { label: 'Restaurant', href: '#/dashboard' },
        { label: 'Alerts' },
      ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={pageTitle}
        subtitle={pageSubtitle}
        breadcrumbs={breadcrumbs}
        actions={
          unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              icon={Check}
              onClick={handleMarkAllRead}
            >
              Mark All as Read ({unreadCount})
            </Button>
          )
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all select-none cursor-pointer ${
                filterMode === tab.id
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    tab.id === 'unread'
                      ? 'bg-rose-500 text-white'
                      : filterMode === tab.id
                      ? 'bg-emerald-900 text-emerald-100'
                      : 'bg-slate-300 text-slate-800'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-2xl border border-dashed border-slate-200">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">
              {isManager
                ? 'No active staff notices'
                : isKitchenStaff
                ? 'No active alerts or notices'
                : 'No active alerts'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {isManager
                ? 'All staff leave requests, transfer applications, and shift rosters are in good standing.'
                : isKitchenStaff
                ? 'Your station inventory thresholds, ingredient shelf-lives, and remuneration updates are all up to date.'
                : 'Your kitchen stock thresholds and batch expiry dates are in good standing.'}
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const action = getSafeAction(item);

            return (
              <div
                key={`${item.sourceType}-${item.id}`}
                onClick={() => {
                  if (!item.read) handleMarkItemRead(item);
                }}
                title={!item.read ? 'Click anywhere on this alert to mark as read' : undefined}
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-150 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs cursor-pointer ${
                  !item.read
                    ? 'bg-white border-emerald-300/80 ring-1 ring-emerald-500/10 hover:border-emerald-400 hover:shadow-sm'
                    : 'bg-white/80 border-slate-200 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1">
                  <div className="mt-0.5 shrink-0">
                    {item.type === 'salary_credit' ? (
                       <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                         <IndianRupee className="w-5 h-5" />
                       </div>
                    ) : item.type === 'leave_status' || item.type === 'leave_request' ? (
                       <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                         <Calendar className="w-5 h-5" />
                       </div>
                    ) : item.type === 'transfer_request' ? (
                       <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                         <ArrowLeftRight className="w-5 h-5" />
                       </div>
                    ) : item.type === 'attendance_notice' ? (
                       <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                         <Clock className="w-5 h-5" />
                       </div>
                    ) : item.severity === 'critical' ? (
                       <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                         <AlertCircle className="w-5 h-5" />
                       </div>
                    ) : item.severity === 'high' ? (
                       <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                         <AlertTriangle className="w-5 h-5" />
                       </div>
                    ) : item.type === 'expiring_soon' ? (
                       <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                         <ClockAlert className="w-5 h-5" />
                       </div>
                    ) : item.sourceType === 'notification' ? (
                       <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                         <Bell className="w-5 h-5" />
                       </div>
                    ) : (
                       <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                         <ShoppingBag className="w-5 h-5" />
                       </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">{item.title}</span>
                      {item.severity && <Badge status={item.severity} size="xs" />}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {item.badgeLabel}
                      </span>
                      {!item.read && (
                        <span
                          className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"
                          title="Unread"
                        />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                      {item.message}
                    </p>
                    <span className="text-[11px] text-slate-400 block">
                      {item.timestamp && item.timestamp.includes('T')
                        ? new Date(item.timestamp).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : item.timestamp}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div
                  className="flex items-center gap-2 shrink-0 self-end sm:self-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Quick Auto-Reorder Trigger for Low-Stock Items */}
                  {(item.type === 'low_stock' || item.type === 'out_of_stock') && item.ingredientId && !isKitchenStaff && !isManager && (
                    <Button
                      variant="outline"
                      size="xs"
                      icon={Zap}
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerAutomatedLowStockReorder({ ingredientId: item.ingredientId });
                      }}
                      title="Trigger automated low-stock reorder & supplier alert"
                    >
                      ⚡ Auto-Reorder
                    </Button>
                  )}

                  {action && (
                    <Button
                      variant="brand"
                      size="xs"
                      iconRight={ExternalLink}
                      onClick={(e) => {
                        e.stopPropagation();
                        action.onClick();
                      }}
                    >
                      {action.label}
                    </Button>
                  )}

                  {!item.read ? (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkItemRead(item);
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
                      handleDismiss(item);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                    title="Dismiss"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Salary Slip Modal */}
      {selectedSalarySlip && (
        <SalarySlipModal
          isOpen={Boolean(selectedSalarySlip)}
          onClose={() => setSelectedSalarySlip(null)}
          payment={selectedSalarySlip}
        />
      )}
    </div>
  );
};
