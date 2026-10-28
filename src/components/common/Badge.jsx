import React from 'react';

const BADGE_STYLES = {
  // Stock Statuses (GoFrugal / StockMate System)
  in_stock: 'bg-green-50 text-[#15803D] border-green-200',
  low_stock: 'bg-amber-50 text-[#D97706] border-amber-200',
  out_of_stock: 'bg-red-50 text-[#DC2626] border-red-200',

  // Expiry Statuses
  safe: 'bg-green-50 text-[#15803D] border-green-200',
  expiring_soon: 'bg-amber-50 text-[#D97706] border-amber-200',
  expired: 'bg-red-50 text-[#DC2626] border-red-200',

  // Account / Restaurant Statuses
  active: 'bg-green-50 text-[#15803D] border-green-200',
  pending: 'bg-amber-50 text-[#D97706] border-amber-200',
  suspended: 'bg-red-50 text-[#DC2626] border-red-200',

  // Purchase Order Statuses
  accepted: 'bg-blue-50 text-blue-700 border-blue-200/80',
  dispatched: 'bg-purple-50 text-purple-700 border-purple-200/80',
  delivered: 'bg-green-50 text-[#15803D] border-green-200',
  cancelled: 'bg-slate-100 text-slate-600 border-[#DCE5EF]',
  rejected: 'bg-red-50 text-[#DC2626] border-red-200',

  // Movement Types
  received: 'bg-green-50 text-[#15803D] border-green-200',
  consumption: 'bg-blue-50 text-blue-700 border-blue-200/80',
  wastage: 'bg-red-50 text-[#DC2626] border-red-200',
  adjustment: 'bg-amber-50 text-[#D97706] border-amber-200',

  // Roles
  super_admin: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
  restaurant_owner: 'bg-[#E6F3F0] text-[#075E4B] border-[#C2E5D9]',
  restaurant_manager: 'bg-blue-50 text-blue-800 border-blue-200/80',
  inventory_manager: 'bg-[#E6F8FA] text-[#087F8C] border-[#BCECF4]',
  kitchen_staff: 'bg-amber-50 text-amber-800 border-amber-200/80',
  supplier: 'bg-sky-50 text-sky-700 border-sky-200/80',

  // Severities
  critical: 'bg-red-100 text-[#DC2626] border-red-300 font-bold',
  high: 'bg-amber-100 text-[#D97706] border-amber-300 font-bold',
  medium: 'bg-blue-100 text-blue-800 border-blue-200',
  low: 'bg-slate-100 text-slate-700 border-[#DCE5EF]',

  // Generic
  default: 'bg-slate-100 text-slate-700 border-[#DCE5EF]',
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
    ? 'text-[11px] px-2 py-0.5'
    : size === 'md'
    ? 'text-xs px-3 py-1'
    : 'text-xs px-2.5 py-0.5';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${sizeClass} ${styleClass} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
      {displayLabel}
    </span>
  );
};

