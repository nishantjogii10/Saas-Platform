import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { getRoleLandingRoute } from '../../utils/permissions';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Megaphone,
  Inbox,
  Building2,
  Users,
  User,
  CreditCard,
  BarChart3,
  FileText,
  LifeBuoy,
  Boxes,
  ClockAlert,
  Truck,
  ShoppingBag,
  History,
  Bell,
  Settings,
  ChefHat,
  Scale,
  Trash2,
  AlertCircle,
  PackageCheck,
  Building,
  Store,
  Shield,
  ShieldCheck,
  CalendarCheck,
  Receipt,
  TrendingUp,
  ArrowLeftRight,
  GitBranch,
  Layers,
  Sparkles,
  QrCode,
  RotateCcw,
  FileCheck,
  Sliders,
  Clock,
} from 'lucide-react';

export const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const location = useLocation();
  const {
    currentUser,
    currentRestaurant,
    restaurantAlerts,
    branches,
    currentBranchId,
    currentBranch,
    switchBranch,
    ownerNotifications,
    customPlanRequests,
    announcements,
    announcementReads,
  } = useApp();

  const getHomeRoute = () => {
    return getRoleLandingRoute(currentUser?.role);
  };

  const unreadAlertsCount = restaurantAlerts.filter(a => !a.read).length;
  const unreadOwnerNotifs = (ownerNotifications || []).filter(n => !n.read).length;
  const pendingCustomPlanReviews = (customPlanRequests || []).filter(r => (r.path === 'PATH_C' || r.requiresManualReview) && r.status === 'pending_review').length;
  const unreadAnnouncementsCount = (announcements || []).filter(ann => {
    if (ann.status !== 'published') return false;
    if (ann.audienceType === 'SPECIFIC_RESTAURANTS' && currentRestaurant && !ann.targetRestaurantIds?.includes(currentRestaurant.id)) return false;
    if (ann.audienceType === 'SUBSCRIPTION_TIER' && currentRestaurant && !ann.targetPlanIds?.includes(currentRestaurant.planId)) return false;
    const readKey = `${ann.id}_${currentRestaurant?.id || 'rest-1'}`;
    return !announcementReads?.[readKey]?.isRead;
  }).length;

  // Define nav links by role
  const getNavLinks = () => {
    switch (currentUser?.role) {
      case 'super_admin':
        return [
          {
            section: 'Platform Administration',
            items: [
              { to: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
              { to: '/admin/communication', label: 'Communication Center', icon: Megaphone },
              { to: '/admin/restaurants', label: 'Restaurants', icon: Building2 },
              { to: '/admin/users', label: 'Platform Users', icon: Users },
              { to: '/admin/plans', label: 'Subscription Plans', icon: CreditCard },
              { to: '/admin/analytics', label: 'Platform Analytics', icon: BarChart3 },
              { to: '/admin/logs', label: 'Activity Logs', icon: FileText },
              { to: '/admin/support', label: 'Support & Settings', icon: LifeBuoy },
            ],
          },
          {
            section: 'Platform Control',
            items: [
              { to: '/admin/role-matrix', label: 'Role Matrix', icon: ShieldCheck, badge: 'RBAC' },
            ],
          },
          {
            section: 'Platform Finance',
            items: [
              { to: '/admin/finance/payments', label: 'Payments', icon: CreditCard, badge: '₹' },
              { to: '/admin/finance/subscriptions', label: 'Subscriptions', icon: CalendarCheck },
              { to: '/admin/custom-plan-requests', label: 'Plan Review Queue', icon: FileCheck, badge: pendingCustomPlanReviews > 0 ? pendingCustomPlanReviews : null },
              { to: '/admin/finance/invoices', label: 'Invoices & Receipts', icon: Receipt },
              { to: '/admin/finance/revenue', label: 'Revenue Reports', icon: TrendingUp },
            ],
          },
        ];

      case 'restaurant_owner':
        return [
          {
            section: 'Kitchen & Operations',
            items: [
              { to: '/dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
              { to: '/inbox', label: 'Inbox & Announcements', icon: Inbox, badge: unreadAnnouncementsCount > 0 ? unreadAnnouncementsCount : null },
              { to: '/inventory', label: 'Inventory Items', icon: Boxes },
              { to: '/expiry-tracking', label: 'Expiry Tracking', icon: ClockAlert },
              { to: '/goods-receiving', label: 'Receiving Dock (GRN)', icon: PackageCheck },
              { to: '/batch-tracking', label: 'QR & Batch Matrix', icon: QrCode },
              { to: '/supplier-returns', label: 'Damaged & Returns', icon: RotateCcw },
              { to: '/suppliers', label: 'Suppliers Catalog', icon: Truck },
              { to: '/purchase-orders', label: 'Purchase Orders', icon: ShoppingBag },
              { to: '/stock-movements', label: 'Stock Movements', icon: History },
              {
                to: '/alerts',
                label: 'Alerts & Notices',
                icon: Bell,
                badge: unreadAlertsCount > 0 ? unreadAlertsCount : null,
              },
            ],
          },
          {
            section: 'Branch & Plan Management',
            items: [
              { to: '/branches', label: 'Branch Overview & Outlets', icon: Store },
              { to: '/plans-billing', label: 'Plans & Billing', icon: Sparkles },
              { to: '/workforce', label: 'People & Workforce', icon: Users },
              {
                to: '/notifications',
                label: 'Notifications',
                icon: Bell,
                badge: unreadOwnerNotifs > 0 ? unreadOwnerNotifs : null,
              },
            ],
          },
          {
            section: 'Business & Finance',
            items: [
              { to: '/reports', label: 'Reports & Audits', icon: BarChart3 },
{ to: '/profile', label: 'My Profile', icon: User },
              { to: '/supplier-billing', label: 'Supplier Billing', icon: Receipt, badge: '₹' },
              { to: '/settings', label: 'Restaurant Settings', icon: Settings },
            ],
          },
        ];

      case 'inventory_manager':
        return [
          {
            section: 'Inventory & Receiving Control',
            items: [
              { to: '/dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
              { to: '/inventory', label: 'Inventory Items', icon: Boxes },
              { to: '/expiry-tracking', label: 'Expiry & FEFO', icon: ClockAlert },
              { to: '/goods-receiving', label: 'Receiving Dock (GRN)', icon: PackageCheck },
              { to: '/batch-tracking', label: 'QR & Batch Matrix', icon: QrCode },
              { to: '/supplier-returns', label: 'Damaged & Returns', icon: RotateCcw },
              { to: '/supplier-billing', label: 'Supplier Invoices', icon: Receipt },
              { to: '/suppliers', label: 'Suppliers Catalog', icon: Truck },
              { to: '/purchase-orders', label: 'Purchase Orders', icon: ShoppingBag },
              { to: '/stock-movements', label: 'Stock Movements', icon: History },
              {
                to: '/alerts',
                label: 'Alerts & Notices',
                icon: Bell,
                badge: unreadAlertsCount > 0 ? unreadAlertsCount : null,
              },
              { to: '/reports', label: 'Reports & Audits', icon: BarChart3 },
            ],
          },
          {
            section: 'Personal Attendance & Duty',
            items: [
              { to: '/my-attendance', label: 'My Attendance & Shifts', icon: Clock },
              { to: '/profile', label: 'My Profile', icon: User },
            ],
          },
        ];

      case 'restaurant_manager':
        return [
          {
            section: 'Staff Management',
            items: [
              { to: '/workforce', label: 'People & Workforce', icon: Users },
              { to: '/staff-transfers', label: 'Staff Transfers', icon: ArrowLeftRight },
              { to: '/reports', label: 'Staff Reports', icon: BarChart3 },
              {
                to: '/alerts',
                label: 'Staff Notices',
                icon: Bell,
                badge: unreadAlertsCount > 0 ? unreadAlertsCount : null,
              },
              { to: '/profile', label: 'My Profile', icon: User },
            ],
          },
        ];

      case 'kitchen_staff':
        return [
          {
            section: 'Kitchen Station',
            items: [
              { to: '/kitchen', label: 'Staff Dashboard', icon: LayoutDashboard },
              { to: '/kitchen/ingredients', label: 'Available Stock', icon: Boxes },
              { to: '/kitchen/usage', label: 'Record Ingredient Usage', icon: Scale },
              { to: '/kitchen/wastage', label: 'Record Food Wastage', icon: Trash2 },
              { to: '/kitchen/report-stock', label: 'Report Low Stock', icon: AlertCircle },
              { to: '/profile', label: 'My Profile', icon: User },
            ],
          },
        ];

      case 'supplier':
        return [
          {
            section: 'Supplier Portal',
            items: [
              { to: '/supplier', label: 'Supplier Dashboard', icon: LayoutDashboard },
              { to: '/supplier/orders', label: 'Assigned Orders', icon: ShoppingBag },
              { to: '/supplier/invoices', label: 'Invoices & Receivables', icon: Receipt },
              { to: '/supplier/returns', label: 'Returns & Credit Claims', icon: RotateCcw },
              { to: '/supplier/history', label: 'Order History', icon: PackageCheck },
              { to: '/supplier/profile', label: 'Supplier Profile', icon: Building },
            ],
          },
        ];

      default:
        return [];
    }
  };

  const navSections = getNavLinks();
  const allNavItems = navSections.flatMap((sec) => sec.items);

  // Exact & Hierarchical Route Active Resolution:
  // 1. Exact match takes highest priority.
  // 2. If another menu item matches the current URL exactly, this item is NOT active
  //    (preventing parent routes like "/branches" from activating when on "/branches/overview").
  // 3. For nested sub-pages not explicitly listed in the sidebar (e.g. "/branches/123"),
  //    the closest parent prefix match is highlighted.
  const isRouteActive = (itemTo, currentPath, currentSearch = '') => {
    if (!currentPath || !itemTo) return false;

    // Handle tab-specific active states for workforce vs transfers
    if (itemTo === '/staff-transfers') {
      return (
        currentPath === '/staff-transfers' ||
        (currentPath === '/workforce' && currentSearch.includes('tab=transfers'))
      );
    }
    if (itemTo === '/workforce') {
      return (
        (currentPath === '/workforce' && !currentSearch.includes('tab=transfers')) ||
        currentPath === '/branch-staff'
      );
    }
    if (!currentPath || !itemTo) return false;

    const cleanCurrent = currentPath.length > 1 && currentPath.endsWith('/')
      ? currentPath.slice(0, -1)
      : currentPath;
    const cleanTo = itemTo.length > 1 && itemTo.endsWith('/')
      ? itemTo.slice(0, -1)
      : itemTo;

    // 1. Exact match
    if (cleanCurrent === cleanTo) {
      return true;
    }

    // Direct alias mappings (e.g. /branch-overview -> /branches/overview, /branch -> /branches)
    if (cleanTo === '/branches/overview' && cleanCurrent === '/branch-overview') {
      return true;
    }
    if (cleanTo === '/branches' && cleanCurrent === '/branch') {
      return true;
    }

    // 2. If another sidebar item matches the current location exactly, do not match as prefix
    const hasExactMatchElsewhere = allNavItems.some((other) => {
      const otherClean = other.to.length > 1 && other.to.endsWith('/')
        ? other.to.slice(0, -1)
        : other.to;
      return (
        otherClean === cleanCurrent ||
        (otherClean === '/branches/overview' && cleanCurrent === '/branch-overview') ||
        (otherClean === '/branches' && cleanCurrent === '/branch')
      );
    });

    if (hasExactMatchElsewhere) {
      return false;
    }

    // 3. For nested / child routes without their own sidebar entry (e.g. /branches/123 or /inventory/new)
    if (cleanCurrent.startsWith(cleanTo + '/')) {
      const candidateMatches = allNavItems.filter((other) => {
        const otherClean = other.to.length > 1 && other.to.endsWith('/')
          ? other.to.slice(0, -1)
          : other.to;
        return cleanCurrent.startsWith(otherClean + '/');
      });

      const bestCandidate = candidateMatches.reduce((best, curr) => {
        return curr.to.length > (best?.to?.length || 0) ? curr : best;
      }, null);

      return bestCandidate?.to === itemTo;
    }

    return false;
  };

  // Role-specific active link styling
  const getActiveNavClass = (isActive) => {
    if (!isActive) return 'text-slate-300 hover:bg-slate-800/70 hover:text-white';
    switch (currentUser?.role) {
      case 'super_admin':
        return 'bg-indigo-600 text-white shadow-xs font-semibold';
      case 'supplier':
        return 'bg-sky-600 text-white shadow-xs font-semibold';
      case 'kitchen_staff':
        return 'bg-amber-600 text-white shadow-xs font-semibold';
      case 'inventory_manager':
        return 'bg-teal-700 text-white shadow-xs font-semibold';
      case 'restaurant_manager':
        return 'bg-blue-600 text-white shadow-xs font-semibold';
      case 'restaurant_owner':
      default:
        return 'bg-emerald-700 text-white shadow-xs font-semibold';
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Dynamic Role Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full transition-transform duration-200 ease-in-out lg:static lg:h-full lg:translate-x-0 shrink-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo + Scope Context Header */}
        <div className="shrink-0">
          <Link
            to={getHomeRoute()}
            title="StockMate Workspace"
            className="h-16 flex items-center px-5 border-b border-slate-800 gap-3 hover:bg-slate-800/50 transition-colors group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-900/40 group-hover:scale-105 transition-transform">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                  StockMate
                </span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                  SaaS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-none mt-0.5">
                Restaurant Inventory
              </p>
            </div>
          </Link>

          {/* Context Badge (Current Restaurant or Admin/Supplier scope) */}
          <div className="px-3 py-3 border-b border-slate-800/80">
            {currentUser?.role === 'super_admin' ? (
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-indigo-950/60 border border-indigo-800/40 text-indigo-200">
                <Shield className="w-4 h-4 text-indigo-400 shrink-0" />
                <div className="truncate">
                  <div className="text-xs font-semibold text-white">All Restaurants Scope</div>
                </div>
              </div>
            ) : currentUser?.role === 'supplier' ? (
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-sky-950/60 border border-sky-800/40 text-sky-200">
                <Truck className="w-4 h-4 text-sky-400 shrink-0" />
                <div className="truncate">
                  <div className="text-xs font-semibold text-white truncate">{currentUser?.supplierName || 'Supplier Partner'}</div>
                </div>
              </div>
            ) : currentUser?.role === 'kitchen_staff' ? (
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-amber-950/50 border border-amber-800/40 text-amber-200">
                <ChefHat className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="truncate">
                  <div className="text-xs font-semibold text-white truncate">{currentRestaurant?.name}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-emerald-950/40 border border-emerald-800/30 text-emerald-200">
                <span className="text-lg">{currentRestaurant?.logo || '🌿'}</span>
                <div className="truncate">
                  <div className="text-xs font-semibold text-white truncate">{currentRestaurant?.name}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Navigation Items */}
        <nav className="flex-1 p-3 space-y-4 overflow-y-auto min-h-0">
          {navSections.map((sec, secIdx) => (
            <div key={secIdx}>
              <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {sec.section}
              </div>
              <div className="space-y-0.5">
                {sec.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  const isActive = isRouteActive(item.to, location.pathname, location.search);

                  return (
                    <NavLink
                      key={itemIdx}
                      to={item.to}
                      end
                      onClick={onCloseMobile}
                      aria-current={isActive ? 'page' : undefined}
                      className={() =>
                        `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${getActiveNavClass(
                          isActive
                        )}`
                      }
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive
                              ? 'text-white'
                              : 'text-slate-400 group-hover:text-white'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>


      </aside>
    </>
  );
};

