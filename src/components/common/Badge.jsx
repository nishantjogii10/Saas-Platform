import React from 'react';

const BADGE_STYLES = {
  // Stock Statuses
  in_stock: 'bg-emerald-50/90 text-emerald-800 border-emerald-200/90',
  low_stock: 'bg-amber-50/90 text-amber-800 border-amber-200/90',
  out_of_stock: 'bg-rose-50/90 text-rose-800 border-rose-200/90',

  // Expiry Statuses
  safe: 'bg-emerald-50/90 text-emerald-800 border-emerald-200/90',
  expiring_soon: 'bg-amber-50/90 text-amber-800 border-amber-200/90',
  expired: 'bg-rose-50/90 text-rose-800 border-rose-200/90',

  // Account / Restaurant Statuses
  active: 'bg-emerald-50/90 text-emerald-800 border-emerald-200/90',
  pending: 'bg-amber-50/90 text-amber-800 border-amber-200/90',
  suspended: 'bg-rose-50/90 text-rose-800 border-rose-200/90',

  // Purchase Order Statuses
  accepted: 'bg-blue-50/90 text-blue-800 border-blue-200/90',
  dispatched: 'bg-purple-50/90 text-purple-800 border-purple-200/90',
  delivered: 'bg-emerald-50/90 text-emerald-800 border-emerald-200/90',
  cancelled: 'bg-slate-100 text-slate-700 border-slate-200',
  rejected: 'bg-rose-50/90 text-rose-800 border-rose-200/90',

  // Movement Types
  received: 'bg-emerald-50/90 text-emerald-800 border-emerald-200/90',
  consumption: 'bg-blue-50/90 text-blue-800 border-blue-200/90',
  wastage: 'bg-rose-50/90 text-rose-800 border-rose-200/90',
  adjustment: 'bg-amber-50/90 text-amber-800 border-amber-200/90',

  // Roles
  super_admin: 'bg-indigo-50/90 text-indigo-800 border-indigo-200/90',
  restaurant_owner: 'bg-emerald-50/90 text-emerald-900 border-emerald-200/90',
  restaurant_manager: 'bg-blue-50/90 text-blue-900 border-blue-200/90',
  inventory_manager: 'bg-teal-50/90 text-teal-900 border-teal-200/90',
  kitchen_staff: 'bg-amber-50/90 text-amber-900 border-amber-200/90',
  supplier: 'bg-sky-50/90 text-sky-900 border-sky-200/90',

  // Severities
  critical: 'bg-rose-100 text-rose-900 border-rose-300 font-bold',
  high: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
  medium: 'bg-blue-100 text-blue-900 border-blue-200',
  low: 'bg-slate-100 text-slate-700 border-slate-200',

  // Generic
  default: 'bg-slate-100/90 text-slate-700 border-slate-200',
};

const FORMATTED_LABELS = {
  in_stock: 'In Stock',
  low_stock: 'Low Stock',
  out_of_stock: 'Out of Stock',
  safe: 'Good Condition',
  expiring_soon: 'Expiring Soon',
  expired: 'Expired',
  active: 'Active',
  pending: 'Pending',
  suspended: 'Suspended',
  accepted: 'Accepted',
  dispatched: 'Dispatched',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
  received: 'Stock Received',
  consumption: 'Usage',
  wastage: 'Wastage',
  adjustment: 'Adjustment',
  super_admin: 'Super Admin',
  restaurant_owner: 'Restaurant Owner',
  restaurant_manager: 'Restaurant Manager',
  inventory_manager: 'Inventory Manager',
  kitchen_staff: 'Kitchen Staff',
  supplier: 'Supplier Partner',
};

export const Badge = ({ status, label, size = 'sm', className = '' }) => {
  const normalizedKey = (status || '').toLowerCase().replace(/\s+/g, '_');
  const styleClass = BADGE_STYLES[normalizedKey] || BADGE_STYLES.default;
  const displayLabel = label || FORMATTED_LABELS[normalizedKey] || status;

  const sizeClass = size === 'xs'
    ? 'text-[10px] px-2 py-0.5'
    : size === 'md'
    ? 'text-xs px-3 py-1'
    : 'text-[11px] px-2.5 py-0.5';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border shadow-2xs ${sizeClass} ${styleClass} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 shrink-0"></span>
      <span>{displayLabel}</span>
    </span>
  );
};
