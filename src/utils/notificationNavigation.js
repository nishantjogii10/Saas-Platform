/**
 * Centralized Notification Navigation Engine for StockMate SaaS
 * Handles structured deep-linking, tab switching, record modal triggers,
 * role/branch permission guards, and uniform action resolution.
 */

/**
 * Extracts specific record identifiers from notification properties
 */
export const extractRecordIds = (item = {}) => {
  const text = `${item.id || ''} ${item.actionLink || ''} ${item.title || ''} ${item.message || ''} ${item.actionLabel || ''}`;
  const link = item.actionLink || '';

  const getQueryParam = (name) => {
    const match = link.match(new RegExp(`[?&]${name}=([^&#]+)`, 'i'));
    return match ? decodeURIComponent(match[1]) : '';
  };

  // 1. Leave Requisition ID
  let leaveId = item.leaveId || getQueryParam('leaveId') || '';
  if (!leaveId) {
    const leaveMatch = text.match(/leave-[0-9]+/i) || item.id?.match(/alert-leave-([0-9a-zA-Z-]+)/i);
    if (leaveMatch) leaveId = leaveMatch[0].replace('alert-leave-', '');
  }

  // 2. Holiday ID
  let holidayId = item.holidayId || getQueryParam('holidayId') || '';
  if (!holidayId) {
    const holMatch = text.match(/hol-[0-9a-zA-Z-]+/i);
    if (holMatch) holidayId = holMatch[0];
  }

  // 3. Purchase Order Number / ID
  let poId = item.poId || item.orderId || getQueryParam('poId') || getQueryParam('orderId') || '';
  if (!poId) {
    const poMatch = text.match(/PO-[A-Za-z0-9-]+/i) || text.match(/po-[A-Za-z0-9-]+/i);
    if (poMatch) poId = poMatch[0];
  }

  // 4. Return Claim Number / ID
  let returnId = item.returnId || item.claimId || getQueryParam('returnId') || getQueryParam('claimId') || '';
  if (!returnId) {
    const retMatch = text.match(/RET-[A-Za-z0-9-]+/i) || text.match(/ret-[A-Za-z0-9-]+/i);
    if (retMatch) returnId = retMatch[0];
  }

  // 5. Ingredient ID
  let ingredientId = item.ingredientId || getQueryParam('ingredientId') || '';
  if (!ingredientId) {
    const ingMatch = text.match(/ing-[A-Za-z0-9-]+/i);
    if (ingMatch) ingredientId = ingMatch[0];
  }

  // 6. Staff / Employee ID
  let staffId = item.targetStaffId || item.staffId || getQueryParam('staffId') || '';
  if (!staffId) {
    const staffMatch = text.match(/usr-[A-Za-z0-9-]+/i);
    if (staffMatch) staffId = staffMatch[0];
  }

  // 7. Attendance Record ID
  let attendanceId = item.attendanceId || item.recordId || getQueryParam('attendanceId') || '';
  if (!attendanceId) {
    const attMatch = text.match(/att-[A-Za-z0-9-]+/i);
    if (attMatch) attendanceId = attMatch[0];
  }

  // 8. Announcement ID
  let announcementId = item.announcementId || getQueryParam('announcementId') || '';
  if (!announcementId) {
    const annMatch = text.match(/ann-[A-Za-z0-9-]+/i);
    if (annMatch) announcementId = annMatch[0];
  }

  // 9. Invoice ID
  let invoiceId = item.invoiceId || getQueryParam('invoiceId') || '';
  if (!invoiceId) {
    const invMatch = text.match(/INV-[A-Za-z0-9-]+/i) || text.match(/STM-BR-[A-Za-z0-9-]+/i);
    if (invMatch) invoiceId = invMatch[0];
  }

  return {
    leaveId,
    holidayId,
    poId,
    returnId,
    ingredientId,
    staffId,
    attendanceId,
    announcementId,
    invoiceId,
  };
};

/**
 * Resolves exact URL destination, query params, and tab for any notification item
 * respecting user role and access control.
 */
export const resolveNotificationTarget = (item, currentUser, currentBranchId) => {
  if (!item) return '/dashboard';

  const role = currentUser?.role || 'restaurant_owner';
  const assignedBranchId = currentUser?.branchId || currentBranchId || 'branch-pune-central';

  // 1. Branch-based access guard for manager roles
  if (role === 'restaurant_manager' || role === 'inventory_manager') {
    if (item.branchId && item.branchId !== 'all' && item.branchId !== assignedBranchId) {
      return {
        error: 'unauthorized_branch',
        message: `Access Restricted: This notice belongs to ${item.branchName || 'another branch'} which your account is not authorized to manage.`,
      };
    }
  }

  const label = (item.actionLabel || '').toLowerCase();
  const badge = (item.badge || '').toLowerCase();
  const type = (item.type || '').toLowerCase();
  const title = (item.title || '').toLowerCase();
  const msg = (item.message || '').toLowerCase();
  const rawLink = item.actionLink || '';

  const {
    leaveId,
    holidayId,
    poId,
    returnId,
    ingredientId,
    staffId,
    attendanceId,
    announcementId,
    invoiceId,
  } = extractRecordIds(item);

  // A. Leave Requisitions
  if (
    type === 'leave_request' ||
    type === 'leave_status' ||
    label.includes('leave') ||
    badge.includes('leave') ||
    title.includes('leave request') ||
    title.includes('leave application') ||
    msg.includes('leave application')
  ) {
    if (role === 'restaurant_manager' || role === 'restaurant_owner' || role === 'super_admin') {
      return `/workforce?tab=leave${leaveId ? `&leaveId=${encodeURIComponent(leaveId)}` : ''}`;
    }
    return `/my-attendance?tab=leave`;
  }

  // B. Branch Holidays & Festival Calendar
  if (
    type.includes('holiday') ||
    badge.includes('holiday') ||
    label.includes('holiday') ||
    title.includes('holiday') ||
    msg.includes('holiday') ||
    type.includes('festival') ||
    badge.includes('festival') ||
    title.includes('festival')
  ) {
    if (role === 'kitchen_staff' || role === 'inventory_manager') {
      return `/my-attendance?tab=holidays${holidayId ? `&holidayId=${encodeURIComponent(holidayId)}` : ''}`;
    }
    return `/workforce?tab=holidays${holidayId ? `&holidayId=${encodeURIComponent(holidayId)}` : ''}`;
  }

  // C. Timesheets & Station Attendance
  if (
    type === 'staff_punch_in' ||
    type === 'staff_punch_out' ||
    type === 'attendance_notice' ||
    label.includes('timesheet') ||
    label.includes('attendance') ||
    badge.includes('shift end') ||
    badge.includes('attendance') ||
    title.includes('punched in') ||
    title.includes('punched out') ||
    title.includes('attendance')
  ) {
    if (role === 'restaurant_manager' || role === 'restaurant_owner' || role === 'super_admin') {
      const q = [];
      q.push('tab=attendance');
      if (staffId) q.push(`staffId=${encodeURIComponent(staffId)}`);
      if (attendanceId) q.push(`attendanceId=${encodeURIComponent(attendanceId)}`);
      return `/workforce?${q.join('&')}`;
    }
    return `/my-attendance?tab=history`;
  }

  // D. Staff Roster & Team Invites
  if (
    type === 'staff_added' ||
    type === 'manager_assigned' ||
    label.includes('roster') ||
    badge.includes('invite') ||
    badge.includes('management') ||
    title.includes('staff member invited') ||
    title.includes('roster')
  ) {
    if (role === 'restaurant_manager' || role === 'restaurant_owner' || role === 'super_admin') {
      return `/workforce?tab=roster${staffId ? `&staffId=${encodeURIComponent(staffId)}` : ''}`;
    }
    return `/kitchen`;
  }

  // E. Damaged Goods & Supplier Return Claims
  if (
    type.includes('return') ||
    type.includes('claim') ||
    type === 'credit_note' ||
    label.includes('return') ||
    label.includes('claim') ||
    badge.includes('return') ||
    title.includes('return claim') ||
    title.includes('damaged') ||
    title.includes('credit claim')
  ) {
    if (role === 'supplier') {
      return `/supplier/returns${returnId ? `?returnId=${encodeURIComponent(returnId)}` : ''}`;
    }
    if (role === 'restaurant_owner' || role === 'inventory_manager' || role === 'super_admin') {
      return `/supplier-returns${returnId ? `?returnId=${encodeURIComponent(returnId)}` : ''}`;
    }
    return `/alerts`;
  }

  // F. Purchase Orders & Procurement
  if (
    type.startsWith('po_') ||
    type === 'purchase_order' ||
    label.includes('check po') ||
    label.includes('track delivery') ||
    label.includes('track po') ||
    title.includes('purchase order') ||
    title.includes('po-') ||
    (poId && !type.includes('return'))
  ) {
    if (label.includes('reorder') && ingredientId) {
      if (role === 'restaurant_owner' || role === 'inventory_manager' || role === 'super_admin') {
        return `/inventory?ingredientId=${encodeURIComponent(ingredientId)}`;
      }
      return role === 'kitchen_staff' ? `/kitchen/report-stock` : `/alerts`;
    }

    if (role === 'supplier') {
      return `/supplier/orders${poId ? `?poId=${encodeURIComponent(poId)}` : ''}`;
    }
    if (role === 'restaurant_owner' || role === 'inventory_manager' || role === 'super_admin') {
      return `/purchase-orders${poId ? `?poId=${encodeURIComponent(poId)}` : ''}`;
    }
    if (role === 'kitchen_staff') return `/kitchen`;
    return `/alerts`;
  }

  // G. Inventory Stock Alerts & Expiry Warnings
  if (
    type === 'low_stock' ||
    type === 'out_of_stock' ||
    type === 'expiring_soon' ||
    type === 'expired' ||
    label.includes('reorder') ||
    label.includes('expiry') ||
    badge.includes('expiry') ||
    title.includes('low stock') ||
    title.includes('out of stock') ||
    title.includes('expiring')
  ) {
    if (type === 'expiring_soon' || type === 'expired' || label.includes('expiry') || title.includes('expir')) {
      if (role === 'restaurant_owner' || role === 'inventory_manager' || role === 'super_admin') {
        return `/expiry-tracking${ingredientId ? `?ingredientId=${encodeURIComponent(ingredientId)}` : ''}`;
      }
      return role === 'kitchen_staff' ? `/kitchen` : `/alerts`;
    }

    // Low stock / out of stock
    if (role === 'restaurant_owner' || role === 'inventory_manager' || role === 'super_admin') {
      return `/inventory${ingredientId ? `?ingredientId=${encodeURIComponent(ingredientId)}` : ''}`;
    }
    return role === 'kitchen_staff' ? `/kitchen/report-stock` : `/alerts`;
  }

  // H. Supplier Invoices & Payments
  if (
    type === 'supplier_invoice' ||
    type === 'supplier_payment' ||
    label.includes('supplier billing') ||
    badge.includes('supplier payment') ||
    title.includes('supplier invoice')
  ) {
    if (role === 'supplier') {
      return `/supplier/invoices${invoiceId ? `?invoiceId=${encodeURIComponent(invoiceId)}` : ''}`;
    }
    if (role === 'restaurant_owner' || role === 'inventory_manager' || role === 'super_admin') {
      return `/supplier-billing${invoiceId ? `?invoiceId=${encodeURIComponent(invoiceId)}` : ''}`;
    }
    return `/alerts`;
  }

  // I. Subscription Renewals, Billing & Plans
  if (
    type.includes('subscription') ||
    type.includes('renewal') ||
    type === 'plan_upgrade' ||
    type === 'payment_success' ||
    type === 'payment_pending'
  ) {
    if (role === 'restaurant_owner' || role === 'super_admin') {
      if (type === 'plan_upgrade' || label.includes('plan')) {
        return `/plans-billing?tab=comparison`;
      }
      if (type === 'payment_success' || type === 'payment_pending' || label.includes('receipt') || label.includes('invoice')) {
        return `/plans-billing?tab=invoices${invoiceId ? `&invoiceId=${encodeURIComponent(invoiceId)}` : ''}`;
      }
      return `/plans-billing?tab=subscriptions`;
    }
    return `/dashboard`;
  }

  // J. Platform Announcements & Inbox
  if (announcementId || rawLink === '/inbox' || type === 'announcement') {
    if (role === 'restaurant_owner' || role === 'super_admin') {
      return `/inbox${announcementId ? `?announcementId=${encodeURIComponent(announcementId)}` : ''}`;
    }
    return `/dashboard`;
  }

  // K. Salary & Payroll Credits
  if (type === 'salary_credit' || label.includes('salary') || label.includes('pay voucher')) {
    if (role === 'kitchen_staff' || role === 'inventory_manager') {
      return `/my-attendance?tab=payroll`;
    }
    return `/workforce?tab=payroll`;
  }

  // L. Explicit actionLink fallback with path sanitation & RBAC check
  if (rawLink) {
    let link = rawLink.replace('/branch-staff', '/workforce');
    if (link === '/billing') link = '/plans-billing?tab=invoices';
    if (link === '/branch-subscriptions') link = '/plans-billing?tab=subscriptions';
    if (link === '/branch-plans') link = '/plans-billing?tab=comparison';

    // If inventory_manager or kitchen_staff was given a /workforce link, reroute safely to /my-attendance
    if (role === 'inventory_manager' || role === 'kitchen_staff') {
      if (link.startsWith('/workforce')) {
        if (link.includes('holidays')) {
          return link.replace('/workforce', '/my-attendance');
        }
        if (link.includes('leave')) {
          return '/my-attendance?tab=leave';
        }
        if (link.includes('attendance') || link.includes('timesheet')) {
          return '/my-attendance?tab=history';
        }
        if (link.includes('payroll')) {
          return '/my-attendance?tab=payroll';
        }
        return '/my-attendance';
      }
    }

    // RBAC validation for explicit links
    if (role === 'restaurant_manager' && !['/workforce', '/alerts', '/reports', '/profile', '/my-attendance'].some((p) => link.startsWith(p))) {
      return '/alerts';
    }
    if (role === 'kitchen_staff' && !['/kitchen', '/my-attendance', '/profile'].some((p) => link.startsWith(p))) {
      return '/kitchen?tab=notifications';
    }
    if (role === 'supplier' && !link.startsWith('/supplier')) {
      return '/supplier';
    }

    return link;
  }

  // Final role-based fallback (never redirects to generic empty preview)
  switch (role) {
    case 'restaurant_manager':
      return '/alerts';
    case 'kitchen_staff':
      return '/kitchen?tab=notifications';
    case 'inventory_manager':
      return '/alerts';
    case 'supplier':
      return '/supplier';
    case 'super_admin':
      return '/admin/dashboard';
    case 'restaurant_owner':
    default:
      return '/dashboard';
  }
};

/**
 * Universal Action Handler to execute notification click with marking read & validation
 */
export const handleNotificationClick = ({
  notification,
  navigate,
  currentUser,
  currentBranchId,
  addToast,
  markAsRead,
  onOpenSalarySlip,
  onOpenHoliday,
}) => {
  if (!notification) return;

  // 1. Mark as read
  if (typeof markAsRead === 'function' && !notification.read) {
    markAsRead(notification.id);
  }

  // 2. Check for in-place modals (e.g. Salary Slip or Holiday Modal on Staff Hub)
  if (notification.type === 'salary_credit' && typeof onOpenSalarySlip === 'function') {
    onOpenSalarySlip(notification);
    return;
  }

  if (notification.type?.includes('holiday') && typeof onOpenHoliday === 'function' && notification.holidayId) {
    onOpenHoliday(notification);
    return;
  }

  // 3. Resolve destination route
  const target = resolveNotificationTarget(notification, currentUser, currentBranchId);

  // 4. Handle access restrictions
  if (typeof target === 'object' && target?.error) {
    if (typeof addToast === 'function') {
      addToast(target.message || 'Access restricted to this record.', 'error');
    }
    return;
  }

  if (typeof target === 'string' && target) {
    navigate(target);
  }
};
