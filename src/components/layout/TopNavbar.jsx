import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Menu,
  Bell,
  Megaphone,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Building2,
  ChevronDown,
  User,
  ShieldCheck,
  LogOut,
  ExternalLink,
  Sparkles,
  Home,
  Store,
  Check,
  Lock,
  Layers,
} from 'lucide-react';
import { Badge } from '../common/Badge';

const formatBranchName = (name) => {
  if (!name) return '';
  return name.replace(/^Spice Garden\s*[-–—]\s*/i, '');
};

export const TopNavbar = ({ onOpenMobile }) => {
  const {
    currentUser,
    restaurants,
    currentRestaurantId,
    currentRestaurant,
    switchRestaurant,
    authorizedBranches,
    branches,
    currentBranchId,
    currentBranch,
    switchBranch,
    restaurantAlerts,
        markAnnouncementAsRead,
    markAlertRead,
    markAllAlertsRead,
    ownerNotifications,
    markOwnerNotificationRead,
    markAllOwnerNotificationsRead,
    staffNotifications,
    markStaffNotificationRead,
    markAllStaffNotificationsRead,
    logout,
    openProfileModal,
  } = useApp();

  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifTab, setNotifTab] = useState('all'); // 'all' | 'alerts' | 'notifications'
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);
  const branchRef = useRef(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
      if (branchRef.current && !branchRef.current.contains(e.target)) {
        setShowBranchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

const roleFilteredAlerts = React.useMemo(() => {
    return (restaurantAlerts || []).filter(a => {
      if (a.targetRoles && currentUser?.role && !a.targetRoles.includes(currentUser.role) && currentUser.role !== 'super_admin') {
        return false;
      }
      return true;
    });
  }, [restaurantAlerts, currentUser]);

  const isKitchenStaff =
    currentUser?.role === 'kitchen_staff' ||
    currentUser?.role === 'inventory_manager';

  // Combine alerts and role-specific notifications for the notification popover.
  const combinedNotifications = useMemo(() => {
    const alerts = (roleFilteredAlerts || []).map((a) => ({
      id: a.id,
      title: a.title,
      message: a.message,
      timestamp: a.timestamp,
      read: Boolean(a.read),
      type: a.type || 'alert',
      severity: a.severity,
      actionLink: a.actionLink,
      sourceType: 'alert',
      badge: 'Stock Alert',
      action: () => {
        markAlertRead(a.id);
        if (a.actionLink) {
          const managerRestricted =
            currentUser?.role === 'restaurant_manager' &&
            !['/workforce', '/alerts', '/reports', '/profile'].some((path) =>
              a.actionLink.startsWith(path)
            );
          navigate(managerRestricted ? '/alerts' : a.actionLink);
        }
        setShowNotifications(false);
      },
    }));

    const sourceNotifications = isKitchenStaff
      ? (staffNotifications || [])
      : (ownerNotifications || []);

    const notices = sourceNotifications.map((n) => ({
      ...n,
      id: n.id,
      title: n.title || 'Notification',
      message: n.message || '',
      timestamp: n.timestamp,
      read: Boolean(n.read),
      type: n.actionLink === '/inbox' ? 'announcement' : 'notification',
      severity: n.priority === 'urgent' ? 'critical' : (n.severity || 'normal'),
      actionLink: n.actionLink,
      sourceType: 'notification',
      badge: n.actionLink === '/inbox' ? 'Announcement' : (n.badge || 'Notice'),
      action: () => {
        if (isKitchenStaff) {
          markStaffNotificationRead(n.id);
        } else {
          markOwnerNotificationRead(n.id);
        }

        if (n.announcementId && currentRestaurant) {
          markAnnouncementAsRead(n.announcementId, currentRestaurant.id);
        }

        if (n.actionLink) {
          navigate(
            isKitchenStaff && !n.actionLink.startsWith('/kitchen')
              ? '/kitchen'
              : n.actionLink
          );
        }
        setShowNotifications(false);
      },
    }));

    return [...alerts, ...notices];
  }, [
    roleFilteredAlerts,
    staffNotifications,
    ownerNotifications,
    isKitchenStaff,
    currentUser,
    currentRestaurant,
    markAlertRead,
    markAnnouncementAsRead,
    markOwnerNotificationRead,
    markStaffNotificationRead,
    navigate,
  ]);

  const combinedItems = combinedNotifications.filter((item) => {
    if (notifTab === 'alerts') return item.sourceType === 'alert';
    if (notifTab === 'notifications') return item.sourceType === 'notification';
    return true;
  });

  const unreadAlerts = combinedNotifications.filter(
    (item) => item.sourceType === 'alert' && !item.read
  );

  const relevantNotifs = combinedNotifications.filter(
    (item) => item.sourceType === 'notification'
  );

  const relevantUnreadNotifs = relevantNotifs.filter((item) => !item.read);

  const totalUnreadCount = combinedNotifications.filter((item) => !item.read).length;

  const handleItemClick = (item) => {
    if (typeof item.action === 'function') {
      item.action();
      return;
    }

    if (item.sourceType === 'alert') {
      markAlertRead(item.id);
    } else if (isKitchenStaff) {
      markStaffNotificationRead(item.id);
    } else {
      markOwnerNotificationRead(item.id);
    }

    if (item.actionLink) {
      navigate(
        isKitchenStaff && !item.actionLink.startsWith('/kitchen')
          ? '/kitchen'
          : item.actionLink
      );
    }
    setShowNotifications(false);
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 transition-colors duration-200">
      {/* Left: Mobile Menu Toggle & Workspace Info */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Restaurant / Tenant Level Navigation */}
        {currentUser?.role !== 'super_admin' && currentUser?.role !== 'supplier' ? (
          <div className="flex items-center gap-2.5">
            {/* Only Restaurant Owner with MULTIPLE branches sees the branch switcher dropdown */}
            {currentUser?.role === 'restaurant_owner' && authorizedBranches && authorizedBranches.length > 1 ? (
              <div className="relative" ref={branchRef}>
                <button
                  type="button"
                  onClick={() => setShowBranchDropdown(!showBranchDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-50/90 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors shadow-2xs"
                  title="Switch Active Branch"
                >
                  <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="max-w-[140px] sm:max-w-[200px] truncate">
                    {currentBranchId === 'all'
                      ? 'All Outlets (Aggregated)'
                      : formatBranchName(currentBranch?.name) || 'Select Outlet'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${showBranchDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showBranchDropdown && (
                  <div className="absolute left-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl z-50 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Switch Active Outlet
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        {authorizedBranches.length} Outlets
                      </span>
                    </div>

                    {/* All Branches Aggregated Option */}
                    <div className="p-1 border-b border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          switchBranch('all');
                          setShowBranchDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                          currentBranchId === 'all' ? 'bg-emerald-50 dark:bg-emerald-950/50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <div className={`text-xs ${currentBranchId === 'all' ? 'font-bold text-emerald-950 dark:text-emerald-200' : 'font-semibold text-slate-800 dark:text-slate-200'}`}>
                              All Outlets (Aggregated)
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Combined multi-branch report &amp; stock view
                            </div>
                          </div>
                        </div>
                        {currentBranchId === 'all' && (
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        )}
                      </button>
                    </div>

                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 py-1">
                      {authorizedBranches.map((b) => {
                        const isCurrent = b.id === currentBranchId;
                        return (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => {
                              switchBranch(b.id);
                              setShowBranchDropdown(false);
                            }}
                            className={`w-full text-left px-3.5 py-2.5 flex items-start justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                              isCurrent ? 'bg-emerald-50/60 dark:bg-emerald-950/40' : ''
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-xs truncate ${isCurrent ? 'font-bold text-emerald-950 dark:text-emerald-200' : 'font-semibold text-slate-900 dark:text-slate-200'}`}>
                                  {formatBranchName(b.name)}
                                </span>
                                {isCurrent && (
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 ring-2 ring-emerald-200" />
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                {b.code || 'BR'} • {b.type || 'Standard'}
                              </div>
                              {b.managerName ? (
                                <div className="text-[10px] text-slate-500 truncate mt-0.5">
                                  Manager: <span className="font-medium text-slate-700 dark:text-slate-300">{b.managerName}</span>
                                </div>
                              ) : null}
                            </div>

                            <div className="text-right shrink-0 flex flex-col items-end">
                              {isCurrent && (
                                <Check className="w-3.5 h-3.5 text-emerald-600 mt-1" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          navigate('/branches');
                          setShowBranchDropdown(false);
                        }}
                        className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 inline-flex items-center gap-1.5 transition-colors"
                      >
                        <span>Manage Branches &amp; Outlets</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Non-owners OR single-branch restaurants: static non-clickable chip (hidden for restaurant manager) */
              currentBranch && currentUser?.role !== 'restaurant_manager' ? (
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                  title={`Assigned Outlet: ${formatBranchName(currentBranch.name)}`}
                >
                  <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="max-w-[150px] sm:max-w-[200px] truncate">
                    {formatBranchName(currentBranch.name)}
                  </span>
                </div>
              ) : null
            )}
          </div>
        ) : currentUser?.role === 'super_admin' ? (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
              SA
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900">
                Super Admin Console
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs text-slate-500">
                Multi-Tenant SaaS Control
              </span>
            </div>
          </div>
        ) : currentUser?.role === 'supplier' ? (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
              SP
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900">
                {currentUser?.supplierName}
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs text-slate-500">
                Vendor Portal
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Right: Notifications, Role Badge & User Profile Dropdown */}
      <div className="flex items-center gap-3">
        {/* Role Badge */}
        <Badge status={currentUser?.role || 'active'} size="md" className="hidden sm:inline-flex" />

        {/* Notifications Bell (for restaurant roles) */}
        {currentUser?.role !== 'super_admin' && currentUser?.role !== 'supplier' && (
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Notifications & Alerts"
            >
              <Bell className="w-5 h-5" />
{totalUnreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white shadow-xs">
                  {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl dark:shadow-2xl z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70">
                  <div className="flex items-center gap-2">
<span className="text-sm font-semibold text-slate-900">Notifications &amp; Alerts</span>
                    {totalUnreadCount > 0 ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold">
                        {totalUnreadCount} new
                      </span>
                    ) : (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                        All caught up
                      </span>
                    )}
                  </div>
                  {totalUnreadCount > 0 && (
                    <button
                      onClick={() => {
                        markAllAlertsRead();
                        if (isKitchenStaff) {
                          markAllStaffNotificationsRead(currentUser?.id);
                        } else {
                          markAllOwnerNotificationsRead();
                        }
                      }}
                      className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

{/* Sub-filter tabs */}
                <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-50/60 border-b border-slate-100 text-[11px]">
                  <button
                    onClick={() => setNotifTab('all')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                      notifTab === 'all'
                        ? 'bg-white shadow-xs text-slate-900 font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All ({totalUnreadCount})
                  </button>
                  <button
                    onClick={() => setNotifTab('alerts')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                      notifTab === 'alerts'
                        ? 'bg-white shadow-xs text-slate-900 font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Alerts ({unreadAlerts.length})
                  </button>
                  <button
                    onClick={() => setNotifTab('notifications')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                      notifTab === 'notifications'
                        ? 'bg-white shadow-xs text-slate-900 font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Notices ({relevantUnreadNotifs.length})
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {combinedItems.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      No notifications or alerts in this view.
                    </div>
                  ) : (
                    combinedItems.map((item) => (
                      <div
                        key={`${item.sourceType}-${item.id}`}
                        onClick={() => handleItemClick(item)}
                        className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer ${
                          !item.read ? 'bg-emerald-50/25' : 'opacity-85'
                        }`}
                        title={!item.read ? 'Click to mark as read' : undefined}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="shrink-0 mt-0.5">
{item.sourceType === 'alert' ? (
                              item.severity === 'critical' ? (
                                <AlertCircle className="w-4 h-4 text-rose-600" />
                              ) : item.severity === 'high' ? (
                                <AlertTriangle className="w-4 h-4 text-amber-600" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              )
                            ) : (
                              <Bell className="w-4 h-4 text-indigo-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
<div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-semibold text-slate-900 truncate">
                                {item.title}
                              </span>
                              {!item.read && (
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                              )}
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 ml-auto">
                                {item.sourceType === 'alert' ? 'Stock Alert' : item.badge || 'Notice'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">
                              {item.message}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {typeof item.timestamp === 'string' && item.timestamp.includes('T')
                                ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : item.timestamp}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

<div className="border-t border-slate-100 p-2.5 bg-slate-50/50 flex items-center justify-between text-xs font-semibold px-4">
                  <Link
                    to={currentUser?.role === 'restaurant_manager' ? '/branch-staff' : '/alerts'}
                    onClick={() => setShowNotifications(false)}
className="text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 transition-colors"
                  >
                    <span>All Alerts ({restaurantAlerts.length})</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                  <Link
                    to={isKitchenStaff ? '/kitchen' : '/notifications'}
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 transition-colors"
                  >
                    <span>All Notices ({relevantNotifs.length})</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                  {currentUser?.role === 'restaurant_owner' && (
                    <Link
                      to="/inbox"
                      onClick={() => setShowNotifications(false)}
                      className="font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1"
                    >
                      <span>Owner Inbox</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Profile Avatar Dropdown */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={currentUser?.name || 'User'}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-600/30"
            />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl dark:shadow-2xl z-50 py-2">
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">{currentUser?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                <div className="mt-1.5">
                  <Badge status={currentUser?.role || 'active'} size="xs" />
                </div>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    if (currentUser?.role === 'kitchen_staff' || currentUser?.role === 'inventory_manager') {
                      navigate('/profile');
                    } else {
                      openProfileModal();
                    }
                    setShowUserDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2 transition-colors border-b border-slate-100"
                >
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>My Profile &amp; Settings</span>
                </button>

                {currentUser?.role === 'restaurant_owner' && (
                  <button
                    onClick={() => {
                      navigate('/settings');
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Restaurant Settings & Plan</span>
                  </button>
                )}

                {currentUser?.role === 'super_admin' && (
                  <button
                    onClick={() => {
                      navigate('/admin/support');
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Platform Settings</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                    setShowUserDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Log Out / Terminate Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

