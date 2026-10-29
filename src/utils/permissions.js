/**
 * Centralized Role-Based Access Control (RBAC) & Permissions Engine
 * StockMate SaaS Platform
 *
 * Single Source of Truth for:
 * - Role definitions
 * - Route access permissions
 * - Sidebar navigation visibility
 * - Feature capabilities (branch switching, PO management, staff management)
 */

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  RESTAURANT_OWNER: 'restaurant_owner',
  RESTAURANT_MANAGER: 'restaurant_manager',
  INVENTORY_MANAGER: 'inventory_manager',
  KITCHEN_STAFF: 'kitchen_staff',
  SUPPLIER: 'supplier',
};

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Administrator',
  [ROLES.RESTAURANT_OWNER]: 'Restaurant Owner',
  [ROLES.RESTAURANT_MANAGER]: 'Restaurant Manager',
  [ROLES.INVENTORY_MANAGER]: 'Inventory Manager',
  [ROLES.KITCHEN_STAFF]: 'Kitchen Staff',
  [ROLES.SUPPLIER]: 'Supplier Partner',
};

/**
 * Functional Capabilities / Permissions mapping
 */
export const PERMISSIONS = {
  // Navigation & Dashboards
  VIEW_OWNER_DASHBOARD: [ROLES.RESTAURANT_OWNER],
  VIEW_INVENTORY_DASHBOARD: [ROLES.RESTAURANT_OWNER, ROLES.INVENTORY_MANAGER],
  VIEW_KITCHEN_DASHBOARD: [ROLES.KITCHEN_STAFF],
  VIEW_SUPPLIER_DASHBOARD: [ROLES.SUPPLIER],
  VIEW_ADMIN_DASHBOARD: [ROLES.SUPER_ADMIN],

  // Staff Management (Restaurant Manager & Owner only)
  MANAGE_WORKFORCE: [ROLES.RESTAURANT_OWNER, ROLES.RESTAURANT_MANAGER],
  MANAGE_LEAVES: [ROLES.RESTAURANT_OWNER, ROLES.RESTAURANT_MANAGER],
  VIEW_STAFF_REPORTS: [ROLES.RESTAURANT_OWNER, ROLES.RESTAURANT_MANAGER],
  MANAGE_STAFF_TRANSFERS: [ROLES.RESTAURANT_OWNER, ROLES.RESTAURANT_MANAGER],

  // Attendance & Time Tracking
  ATTENDANCE_VIEW_SELF: [ROLES.RESTAURANT_OWNER, ROLES.RESTAURANT_MANAGER, ROLES.INVENTORY_MANAGER, ROLES.KITCHEN_STAFF],
  ATTENDANCE_VIEW_BRANCH: [ROLES.RESTAURANT_OWNER, ROLES.RESTAURANT_MANAGER],
  ATTENDANCE_CLOCK_IN: [ROLES.RESTAURANT_OWNER, ROLES.RESTAURANT_MANAGER, ROLES.INVENTORY_MANAGER, ROLES.KITCHEN_STAFF],
  ATTENDANCE_CLOCK_OUT: [ROLES.RESTAURANT_OWNER, ROLES.RESTAURANT_MANAGER, ROLES.INVENTORY_MANAGER, ROLES.KITCHEN_STAFF],
  ATTENDANCE_CORRECT: [ROLES.RESTAURANT_OWNER, ROLES.RESTAURANT_MANAGER],
  ATTENDANCE_EXPORT: [ROLES.RESTAURANT_OWNER, ROLES.RESTAURANT_MANAGER, ROLES.INVENTORY_MANAGER, ROLES.KITCHEN_STAFF],

  // Leave Management
  LEAVE_APPLY: [ROLES.RESTAURANT_OWNER, ROLES.RESTAURANT_MANAGER, ROLES.INVENTORY_MANAGER, ROLES.KITCHEN_STAFF],
  LEAVE_VIEW_SELF: [ROLES.RESTAURANT_OWNER, ROLES.RESTAURANT_MANAGER, ROLES.INVENTORY_MANAGER, ROLES.KITCHEN_STAFF],
  LEAVE_REVIEW: [ROLES.RESTAURANT_MANAGER],
  LEAVE_APPROVE: [ROLES.RESTAURANT_MANAGER],
  LEAVE_REJECT: [ROLES.RESTAURANT_MANAGER],

  // Holiday Management
  HOLIDAYS_VIEW: [ROLES.RESTAURANT_OWNER, ROLES.RESTAURANT_MANAGER, ROLES.INVENTORY_MANAGER, ROLES.KITCHEN_STAFF],
  HOLIDAYS_CREATE: [ROLES.RESTAURANT_OWNER, ROLES.RESTAURANT_MANAGER],
  HOLIDAYS_UPDATE: [ROLES.RESTAURANT_OWNER, ROLES.RESTAURANT_MANAGER],
  HOLIDAYS_DELETE: [ROLES.RESTAURANT_OWNER, ROLES.RESTAURANT_MANAGER],

  // Inventory & Stock Operations (Owner & Inventory Manager only - NEVER Restaurant Manager)
  VIEW_INVENTORY: [ROLES.RESTAURANT_OWNER, ROLES.INVENTORY_MANAGER],
  MANAGE_INVENTORY: [ROLES.INVENTORY_MANAGER],
  VIEW_STOCK_MOVEMENTS: [ROLES.RESTAURANT_OWNER, ROLES.INVENTORY_MANAGER],
  MANAGE_EXPIRY: [ROLES.RESTAURANT_OWNER, ROLES.INVENTORY_MANAGER],
  RECEIVE_GOODS_DOCK: [ROLES.RESTAURANT_OWNER, ROLES.INVENTORY_MANAGER],
  MANAGE_BATCH_QR: [ROLES.RESTAURANT_OWNER, ROLES.INVENTORY_MANAGER],
  MANAGE_SUPPLIER_RETURNS: [ROLES.RESTAURANT_OWNER, ROLES.INVENTORY_MANAGER],

  // Procurement & Purchase Orders
  VIEW_PURCHASE_ORDERS: [ROLES.RESTAURANT_OWNER, ROLES.INVENTORY_MANAGER],
  CREATE_PURCHASE_ORDERS: [ROLES.INVENTORY_MANAGER],
  VERIFY_PURCHASE_ORDERS: [ROLES.RESTAURANT_OWNER, ROLES.INVENTORY_MANAGER],
  DELETE_PURCHASE_ORDERS: [ROLES.RESTAURANT_OWNER], // Only Owner can delete POs
  MANAGE_SUPPLIERS: [ROLES.RESTAURANT_OWNER, ROLES.INVENTORY_MANAGER],
  VIEW_SUPPLIER_BILLING: [ROLES.RESTAURANT_OWNER, ROLES.INVENTORY_MANAGER],

  // Restaurant & Multi-branch Administration (Owner only)
  MANAGE_BRANCHES: [ROLES.RESTAURANT_OWNER],
  SWITCH_BRANCH_SELECTOR: [ROLES.RESTAURANT_OWNER, ROLES.SUPER_ADMIN],
  MANAGE_SUBSCRIPTION: [ROLES.RESTAURANT_OWNER],
  MANAGE_RESTAURANT_SETTINGS: [ROLES.RESTAURANT_OWNER],
  VIEW_OWNER_NOTIFICATIONS: [ROLES.RESTAURANT_OWNER],

  // Platform Administration (Super Admin only)
  PLATFORM_ADMIN: [ROLES.SUPER_ADMIN],
};

/**
 * Route level permission mapping
 */
export const ROUTE_PERMISSIONS = {
  // Common / Shared
  '/dashboard': [ROLES.RESTAURANT_OWNER, ROLES.INVENTORY_MANAGER],
  '/my-attendance': [
    ROLES.RESTAURANT_OWNER,
    ROLES.RESTAURANT_MANAGER,
    ROLES.INVENTORY_MANAGER,
    ROLES.KITCHEN_STAFF,
  ],
  '/profile': [
    ROLES.SUPER_ADMIN,
    ROLES.RESTAURANT_OWNER,
    ROLES.RESTAURANT_MANAGER,
    ROLES.INVENTORY_MANAGER,
    ROLES.KITCHEN_STAFF,
    ROLES.SUPPLIER,
  ],
  '/alerts': [ROLES.RESTAURANT_OWNER, ROLES.INVENTORY_MANAGER, ROLES.RESTAURANT_MANAGER],
  '/reports': [ROLES.RESTAURANT_OWNER, ROLES.INVENTORY_MANAGER, ROLES.RESTAURANT_MANAGER],

  // Restaurant Owner Only
  '/branches': [ROLES.RESTAURANT_OWNER],
  '/plans-billing': [ROLES.RESTAURANT_OWNER],
  '/settings': [ROLES.RESTAURANT_OWNER],
  '/notifications': [ROLES.RESTAURANT_OWNER],
  '/inbox': [ROLES.RESTAURANT_OWNER],
  '/staff-legacy': [ROLES.RESTAURANT_OWNER],

  // Staff Management (Owner & Restaurant Manager)
  '/workforce': [ROLES.RESTAURANT_OWNER, ROLES.RESTAURANT_MANAGER],
  '/branch-staff': [ROLES.RESTAURANT_OWNER, ROLES.RESTAURANT_MANAGER],
  '/staff-transfers': [ROLES.RESTAURANT_OWNER, ROLES.RESTAURANT_MANAGER],

  // Inventory & Procurement (Owner & Inventory Manager - EXPLICITLY NO Restaurant Manager)
  '/inventory': [ROLES.RESTAURANT_OWNER, ROLES.INVENTORY_MANAGER],
  '/expiry-tracking': [ROLES.RESTAURANT_OWNER, ROLES.INVENTORY_MANAGER],
  '/suppliers': [ROLES.RESTAURANT_OWNER, ROLES.INVENTORY_MANAGER],
  '/purchase-orders': [ROLES.RESTAURANT_OWNER, ROLES.INVENTORY_MANAGER],
  '/goods-receiving': [ROLES.RESTAURANT_OWNER, ROLES.INVENTORY_MANAGER],
  '/batch-tracking': [ROLES.RESTAURANT_OWNER, ROLES.INVENTORY_MANAGER],
  '/supplier-returns': [ROLES.RESTAURANT_OWNER, ROLES.INVENTORY_MANAGER],
  '/supplier-billing': [ROLES.RESTAURANT_OWNER, ROLES.INVENTORY_MANAGER],
  '/stock-movements': [ROLES.RESTAURANT_OWNER, ROLES.INVENTORY_MANAGER],

  // Kitchen Staff Module
  '/kitchen': [ROLES.KITCHEN_STAFF],
  '/kitchen/ingredients': [ROLES.KITCHEN_STAFF],
  '/kitchen/usage': [ROLES.KITCHEN_STAFF],
  '/kitchen/wastage': [ROLES.KITCHEN_STAFF],
  '/kitchen/report-stock': [ROLES.KITCHEN_STAFF],

  // Supplier Portal Module
  '/supplier': [ROLES.SUPPLIER],
  '/supplier/orders': [ROLES.SUPPLIER],
  '/supplier/invoices': [ROLES.SUPPLIER],
  '/supplier/returns': [ROLES.SUPPLIER],
  '/supplier/history': [ROLES.SUPPLIER],
  '/supplier/profile': [ROLES.SUPPLIER],

  // Super Admin Module
  '/admin/dashboard': [ROLES.SUPER_ADMIN],
  '/admin/settings': [ROLES.SUPER_ADMIN],
  '/admin/platform-settings': [ROLES.SUPER_ADMIN],
  '/admin/communication': [ROLES.SUPER_ADMIN],
  '/admin/restaurants': [ROLES.SUPER_ADMIN],
  '/admin/users': [ROLES.SUPER_ADMIN],
  '/admin/plans': [ROLES.SUPER_ADMIN],
  '/admin/analytics': [ROLES.SUPER_ADMIN],
  '/admin/logs': [ROLES.SUPER_ADMIN],
  '/admin/support': [ROLES.SUPER_ADMIN],
  '/admin/role-matrix': [ROLES.SUPER_ADMIN],
  '/admin/finance/payments': [ROLES.SUPER_ADMIN],
  '/admin/finance/subscriptions': [ROLES.SUPER_ADMIN],
  '/admin/custom-plan-requests': [ROLES.SUPER_ADMIN],
  '/admin/finance/invoices': [ROLES.SUPER_ADMIN],
  '/admin/finance/revenue': [ROLES.SUPER_ADMIN],
};

/**
 * Check if a role has a specific capability permission
 */
export const hasPermission = (role, permissionKey) => {
  if (!role) return false;
  const allowed = PERMISSIONS[permissionKey];
  return Array.isArray(allowed) && allowed.includes(role);
};

/**
 * Check if a role can access a given route
 */
export const canAccessRoute = (role, path) => {
  if (!role || !path) return false;
  
  // Clean query strings & hash
  const cleanPath = path.split('?')[0].split('#')[0];
  
  // Exact match
  if (ROUTE_PERMISSIONS[cleanPath]) {
    return ROUTE_PERMISSIONS[cleanPath].includes(role);
  }

  // Prefix matching for nested routes
  const matchingPrefix = Object.keys(ROUTE_PERMISSIONS).find(
    (route) => cleanPath.startsWith(route) && route !== '/'
  );

  if (matchingPrefix) {
    return ROUTE_PERMISSIONS[matchingPrefix].includes(role);
  }

  // Fallback for public routes
  return true;
};

/**
 * Get primary landing/home route for a role
 */
export const getRoleLandingRoute = (role) => {
  switch (role) {
    case ROLES.SUPER_ADMIN:
      return '/admin/dashboard';
    case ROLES.RESTAURANT_OWNER:
      return '/dashboard';
    case ROLES.RESTAURANT_MANAGER:
      return '/workforce'; // Staff Management only!
    case ROLES.INVENTORY_MANAGER:
      return '/dashboard'; // Overview Dashboard!
    case ROLES.KITCHEN_STAFF:
      return '/kitchen';
    case ROLES.SUPPLIER:
      return '/supplier';
    default:
      return '/dashboard';
  }
};

/**
 * Check if role is allowed to view or switch branch selector
 */
export const canSwitchBranch = (role) => {
  return role === ROLES.RESTAURANT_OWNER || role === ROLES.SUPER_ADMIN;
};

/**
 * Check if role is restricted to staff management only
 */
export const isStaffManagementOnly = (role) => {
  return role === ROLES.RESTAURANT_MANAGER;
};

