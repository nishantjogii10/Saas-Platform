import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Menu,
  Bell,
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
    markAlertRead,
    markAllAlertsRead,
    logout,
    openProfileModal,
  } = useApp();

  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
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

  const unreadAlerts = restaurantAlerts.filter(a => !a.read);

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shrink-0">
      {/* Left: Mobile Menu Toggle & Workspace Info */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Branch Selector Dropdown for Restaurant Owner (Restaurant name removed from header) */}
        {currentUser?.role === 'restaurant_owner' && authorizedBranches && authorizedBranches.length > 0 ? (
          <div className="relative" ref={branchRef}>
                <button
                  type="button"
                  onClick={() => {
                    if (authorizedBranches.length > 1) {
                      setShowBranchDropdown(!showBranchDropdown);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                    authorizedBranches.length > 1
                      ? 'bg-slate-100/80 hover:bg-slate-200/70 border-slate-200/80 text-slate-800 cursor-pointer'
                      : 'bg-slate-50 border-slate-200 text-slate-700 cursor-default'
                  }`}
                  title={
                    authorizedBranches.length > 1
                      ? 'Switch Active Branch'
                      : `Assigned Branch: ${formatBranchName(currentBranch?.name) || 'Assigned Outlet'}`
                  }
                >
                  <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="max-w-[130px] sm:max-w-[190px] truncate">
                    {formatBranchName(currentBranch?.name) || 'Select Branch'}
                  </span>
                  {authorizedBranches.length > 1 ? (
                    <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                  ) : (
                    <Lock className="w-3 h-3 text-slate-400 shrink-0 ml-0.5" />
                  )}
                </button>

                {showBranchDropdown && authorizedBranches.length > 1 && (
                  <div className="absolute left-0 mt-2 w-72 sm:w-84 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 py-2 overflow-hidden">
                    <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                        Switch Active Branch
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {authorizedBranches.length} Authorized Outlets
                      </span>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 py-1">
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
                            className={`w-full text-left px-3.5 py-2.5 flex items-start justify-between gap-2 hover:bg-slate-50 transition-colors ${
                              isCurrent ? 'bg-emerald-50/60' : ''
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-xs truncate ${isCurrent ? 'font-bold text-emerald-950' : 'font-semibold text-slate-900'}`}>
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
                                  Manager: <span className="font-medium text-slate-700">{b.managerName}</span>
                                </div>
                              ) : null}
                            </div>

                            <div className="text-right shrink-0 flex flex-col items-end">
                              {(b.planName || currentRestaurant?.planName) && (
                                <span
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                    (b.planName || currentRestaurant?.planName) === 'Enterprise'
                                      ? 'bg-purple-100 text-purple-800'
                                      : (b.planName || currentRestaurant?.planName) === 'Professional'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  {b.planName || currentRestaurant?.planName}
                                </span>
                              )}
                              {(b.billingCycle || currentRestaurant?.billingCycle) && (
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  {b.billingCycle || currentRestaurant?.billingCycle}
                                </div>
                              )}
                              {isCurrent && (
                                <Check className="w-3.5 h-3.5 text-emerald-600 mt-1" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {currentUser?.role === 'restaurant_owner' && (
                      <div className="p-2 border-t border-slate-100 bg-slate-50/80 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            navigate('/branches');
                            setShowBranchDropdown(false);
                          }}
                          className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1.5 transition-colors"
                        >
                          <span>Manage Branches &amp; Outlets</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
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
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Notifications & Alerts"
            >
              <Bell className="w-5 h-5" />
              {unreadAlerts.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white"></span>
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200/90 shadow-xl z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/70">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">
                      {currentUser?.role === 'restaurant_manager' ? 'Staff Notifications' : 'Notifications'}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      {unreadAlerts.length} new
                    </span>
                  </div>
                  {unreadAlerts.length > 0 && (
                    <button
                      onClick={markAllAlertsRead}
                      className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {restaurantAlerts.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      {currentUser?.role === 'restaurant_manager'
                        ? 'No active staff notices. All shift rosters and leave requests are clear!'
                        : 'No alerts at this time. All stock levels healthy!'}
                    </div>
                  ) : (
                    restaurantAlerts.slice(0, 5).map((alt) => (
                      <div
                        key={alt.id}
                        onClick={() => {
                        markAlertRead(alt.id);
                        if (alt.actionLink) {
                          navigate(alt.actionLink);
                          setShowNotifications(false);
                        }
                      }}
                        className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer ${
                          !alt.read ? 'bg-emerald-50/20' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="shrink-0 mt-0.5">
                            {alt.type === 'leave_request' ? (
                              <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                                📋
                              </span>
                            ) : alt.type === 'transfer_request' ? (
                              <span className="w-5 h-5 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                                ⇄
                              </span>
                            ) : alt.type === 'attendance_notice' ? (
                              <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                                ⏱️
                              </span>
                            ) : alt.severity === 'critical' ? (
                              <AlertCircle className="w-4 h-4 text-rose-600" />
                            ) : alt.severity === 'high' ? (
                              <AlertTriangle className="w-4 h-4 text-amber-600" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-900 truncate">
                              {alt.title}
                            </p>
                            <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">
                              {alt.message}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(alt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-slate-100 p-2.5 bg-slate-50/50 text-center">
                  <Link
                    to={currentUser?.role === 'restaurant_manager' ? '/branch-staff' : '/alerts'}
                    onClick={() => setShowNotifications(false)}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1"
                  >
                    <span>
                      {currentUser?.role === 'restaurant_manager'
                        ? `Manage all ${restaurantAlerts.length} staff notices`
                        : `View all ${restaurantAlerts.length} alerts`}
                    </span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Profile Avatar Dropdown */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={currentUser?.name || 'User'}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-600/30"
            />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white border border-slate-200/90 shadow-xl z-50 py-2">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900">{currentUser?.name}</p>
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

