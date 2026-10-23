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
} from 'lucide-react';
import { Badge } from '../common/Badge';

export const TopNavbar = ({ onOpenMobile }) => {
  const {
    currentUser,
    restaurants,
    currentRestaurantId,
    currentRestaurant,
    switchRestaurant,
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

        {/* Restaurant selector for Restaurant-level roles */}
        {currentUser?.role !== 'super_admin' && currentUser?.role !== 'supplier' ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xl">{currentRestaurant?.logo || '🌿'}</span>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 tracking-tight">
                  {currentRestaurant?.name}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {currentRestaurant?.planName} Plan
                </span>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {currentRestaurant?.cuisine}
              </span>
            </div>

            {/* Branch Selector Dropdown for Restaurant Roles */}
            {branches && branches.length > 0 && (
              <div className="relative ml-1 sm:ml-2 pl-2 sm:pl-3 border-l border-slate-200" ref={branchRef}>
                <button
                  type="button"
                  onClick={() => setShowBranchDropdown(!showBranchDropdown)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200/80 text-xs font-semibold text-slate-800 transition-colors"
                  title="Switch Active Outlet"
                >
                  <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="max-w-[120px] sm:max-w-[170px] truncate">
                    {currentBranch?.name?.replace('Spice Garden — ', '') || 'Select Branch'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                </button>

                {showBranchDropdown && (
                  <div className="absolute left-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 py-2 overflow-hidden">
                    <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                        Switch Active Branch Outlet
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {branches.length} Outlets
                      </span>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 py-1">
                      {branches.map((b) => {
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
                              isCurrent ? 'bg-emerald-50/50' : ''
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs text-slate-900 truncate">
                                  {b.name}
                                </span>
                                {isCurrent && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                {b.code} • {b.type}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                                Manager: {b.managerName}
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                  b.planName === 'Enterprise'
                                    ? 'bg-purple-100 text-purple-800'
                                    : b.planName === 'Professional'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {b.planName}
                              </span>
                              <div className="text-[10px] text-slate-400 mt-1">
                                {b.billingCycle}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {currentUser?.role === 'restaurant_owner' && (
                      <div className="p-2 border-t border-slate-100 bg-slate-50/60 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            navigate('/branches');
                            setShowBranchDropdown(false);
                          }}
                          className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1"
                        >
                          <span>Manage All Branches &amp; Outlets</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    )}
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
        ) : (
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
        )}
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
                    <span className="text-sm font-semibold text-slate-900">Notifications</span>
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
                      No alerts at this time. All stock levels healthy!
                    </div>
                  ) : (
                    restaurantAlerts.slice(0, 5).map((alt) => (
                      <div
                        key={alt.id}
                        onClick={() => markAlertRead(alt.id)}
                        className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer ${
                          !alt.read ? 'bg-emerald-50/20' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="shrink-0 mt-0.5">
                            {alt.severity === 'critical' ? (
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
                    to="/alerts"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1"
                  >
                    <span>View all {restaurantAlerts.length} alerts</span>
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
                    openProfileModal();
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

