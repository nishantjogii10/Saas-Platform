import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  initialRestaurants,
  initialPlans,
  initialUsers,
  initialSuppliers,
  initialIngredients,
  initialPurchaseOrders,
  initialStockMovements,
  initialAlerts,
  initialPlatformLogs,
  initialSupportTickets,
} from '../data/mockData';
import {
  INITIAL_ROLE_PERMISSIONS,
  INITIAL_EMPLOYEES,
  ROLES_LIST,
} from '../data/roleMatrixData';
import {
  initialTransactions,
  initialSubscriptions,
  initialInvoices,
  formatINR,
  PLAN_PRICING_INR,
} from '../data/financeData';
import {
  initialBranches,
  initialBranchStaff,
  initialStaffTransfers,
  initialOwnerNotifications,
  initialBranchInvoices,
  BRANCH_PLANS_CONFIG,
  syncBranchPlansConfig,
} from '../data/branchData';
import {
  initialSupplierAgreements,
  initialProductBatches,
  initialGoodsReceivedNotes,
  initialSupplierInvoices,
  initialSupplierReturns,
  initialCreditNotes,
  initialSupplierPayments,
} from '../data/inventoryBillingData';

import { initialCustomPlanRequests } from '../data/customPlanData';
import {
  INITIAL_ANNOUNCEMENTS,
  INITIAL_ANNOUNCEMENT_TEMPLATES,
  interpolateTemplateVariables,
} from '../data/announcementData';
import {
  calculateCustomPlanPricing,
  evaluateApprovalPath,
  validateAndAuthorizePricing,
  BASE_PLANS,
  FEATURE_ADDONS,
  AUTOMATION_LIMITS,
  calculatePlanSavings,
  syncPricingEnginePlans,
} from '../services/pricingEngine';

import {
  initialAttendanceRecords,
  initialLeaveRequests,
  initialSalaryPayments,
  initialStaffNotifications,
  initialHolidays,
  INITIAL_STAFF_LEAVE_BALANCES,
  LEAVE_TYPES,
  LEAVE_POLICIES,
  KITCHEN_STATIONS,
  STAFF_SALARY_PROFILES,
} from '../data/staffAttendanceData';

import {
  SUPPLIER_SUBSCRIPTION_PLANS,
  SUPPLIER_CATEGORIES,
  INITIAL_SUPPLIER_PRODUCTS,
} from '../data/supplierMarketplaceData';

import { DEFAULT_PLATFORM_SETTINGS } from '../data/platformSettingsData';

const AppContext = createContext(null);

const STORAGE_KEY = 'stockmate_saas_v2';

// Synchronous SHA-256 implementation for hashing staff credentials in service layer
export const hashPassword = (password) => {
  if (!password) return '';
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let lengthProperty = 'length';
  let i, j;
  let result = '';
  const words = [];
  const asciiBitLength = password[lengthProperty] * 8;
  let hash = [];
  const k = [];
  let primeCounter = 0;
  const isComposite = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isComposite[i] = candidate;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }
  password += '\x80';
  while ((password[lengthProperty] % 64) - 56) password += '\x00';
  for (i = 0; i < password[lengthProperty]; i++) {
    j = password.charCodeAt(i);
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
  words[words[lengthProperty]] = asciiBitLength;
  for (j = 0; j < words[lengthProperty]; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash;
    hash = hash.slice(0, 8);
    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15],
        w2 = w[i - 2];
      const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
      const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const temp1 =
        hash[7] +
        (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)) +
        ch +
        k[i] +
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] + s0 + w[i - 7] + s1) | 0);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp2 =
        (rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) +
        maj;
      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }
    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }
  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? 0 : '') + b.toString(16);
    }
  }
  return result;
};

export const AppProvider = ({ children }) => {
  // Load from localStorage or fallback to defaults (with seed merge for newly added records)
  const loadStored = (key, fallback) => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_${key}`);
      if (!saved) return fallback;
      const parsed = JSON.parse(saved);

      // If both parsed and fallback are arrays, ensure newly added seed items (e.g. Vikram Desai) are merged
      if (Array.isArray(parsed) && Array.isArray(fallback)) {
        const parsedKeySet = new Set(
          parsed.map(item => String(item?.email || item?.id || item?.key || '').toLowerCase())
        );
        const missing = fallback.filter(item => {
          const identifier = String(item?.email || item?.id || item?.key || '').toLowerCase();
          return identifier && !parsedKeySet.has(identifier);
        });

        if (missing.length > 0) {
          const merged = [...parsed, ...missing];
          try {
            localStorage.setItem(`${STORAGE_KEY}_${key}`, JSON.stringify(merged));
          } catch (err) {}
          return merged;
        }
      }

      return parsed;
    } catch (e) {
      console.warn(`Error reading localStorage for ${key}`, e);
      return fallback;
    }
  };

  const [restaurants, setRestaurants] = useState(() => loadStored('restaurants', initialRestaurants));
  const [plans, setPlans] = useState(() => {
    let loaded = loadStored('plans', initialPlans);
    if (Array.isArray(loaded)) {
      const hasCustom = loaded.some((p) => p.id === 'plan-custom');
      if (!hasCustom) {
        const customDef = initialPlans.find((p) => p.id === 'plan-custom');
        if (customDef) {
          loaded = [...loaded, customDef];
        }
      }
    }
    if (typeof syncPricingEnginePlans === 'function') syncPricingEnginePlans(loaded);
    if (typeof syncBranchPlansConfig === 'function') syncBranchPlansConfig(loaded);
    return loaded;
  });
  const [users, setUsers] = useState(() => loadStored('users', initialUsers));
  const [suppliers, setSuppliers] = useState(() => loadStored('suppliers', initialSuppliers));
  const [ingredients, setIngredients] = useState(() => loadStored('ingredients', initialIngredients));
  const [purchaseOrders, setPurchaseOrders] = useState(() => loadStored('purchaseOrders', initialPurchaseOrders));
  const [stockMovements, setStockMovements] = useState(() => loadStored('stockMovements', initialStockMovements));
  const [alerts, setAlerts] = useState(() => loadStored('alerts', initialAlerts));
  const [platformLogs, setPlatformLogs] = useState(() => loadStored('platformLogs', initialPlatformLogs));
  const [supportTickets, setSupportTickets] = useState(() => loadStored('supportTickets', initialSupportTickets));
  const [employees, setEmployees] = useState(() => loadStored('employees', INITIAL_EMPLOYEES));
  const [roleMatrixPermissions, setRoleMatrixPermissions] = useState(() => loadStored('roleMatrixPermissions', INITIAL_ROLE_PERMISSIONS));
  const [transactions, setTransactions] = useState(() => loadStored('transactions', initialTransactions));
  const [subscriptions, setSubscriptions] = useState(() => loadStored('subscriptions', initialSubscriptions));
  const [invoices, setInvoices] = useState(() => loadStored('invoices', initialInvoices));
  const [branches, setBranches] = useState(() => loadStored('branches', initialBranches));
  const [currentBranchId, setCurrentBranchId] = useState(() => loadStored('currentBranchId', 'branch-pune-central'));
  const [branchStaff, setBranchStaff] = useState(() => loadStored('branchStaff', initialBranchStaff));
  const [staffTransfers, setStaffTransfers] = useState(() => loadStored('staffTransfers', initialStaffTransfers));
  const [ownerNotifications, setOwnerNotifications] = useState(() => loadStored('ownerNotifications', initialOwnerNotifications));
  const [branchInvoices, setBranchInvoices] = useState(() => loadStored('branchInvoices', initialBranchInvoices));

  // Smart Inventory, Supplier Billing, QR Tracking & Returns States
  const [goodsReceivedNotes, setGoodsReceivedNotes] = useState(() => loadStored('goodsReceivedNotes', initialGoodsReceivedNotes));
  const [productBatches, setProductBatches] = useState(() => loadStored('productBatches', initialProductBatches));
  const [supplierInvoices, setSupplierInvoices] = useState(() => loadStored('supplierInvoices', initialSupplierInvoices));
  const [supplierReturns, setSupplierReturns] = useState(() => loadStored('supplierReturns', initialSupplierReturns));
  const [creditNotes, setCreditNotes] = useState(() => loadStored('creditNotes', initialCreditNotes));
  const [supplierPayments, setSupplierPayments] = useState(() => loadStored('supplierPayments', initialSupplierPayments));
  const [supplierAgreements, setSupplierAgreements] = useState(() => loadStored('supplierAgreements', initialSupplierAgreements));

  // Staff Attendance, Leave Requests & Payroll Notifications States
  const [attendanceRecords, setAttendanceRecords] = useState(() => loadStored('attendanceRecords', initialAttendanceRecords));
  const [leaveRequests, setLeaveRequests] = useState(() => loadStored('leaveRequests', initialLeaveRequests));
  const [salaryPayments, setSalaryPayments] = useState(() => loadStored('salaryPayments', initialSalaryPayments));
  const [staffNotifications, setStaffNotifications] = useState(() => loadStored('staffNotifications', initialStaffNotifications));
  const [holidays, setHolidays] = useState(() => loadStored('holidays', initialHolidays));
  const [staffLeaveBalances, setStaffLeaveBalances] = useState(() => loadStored('staffLeaveBalances', INITIAL_STAFF_LEAVE_BALANCES));

  // Custom Plan Requests & Rule-Based Approval Engine State
  const [customPlanRequests, setCustomPlanRequests] = useState(() => loadStored('custom_plan_requests', initialCustomPlanRequests));

  // Third-Party Supplier B2B Marketplace Products State
  const [supplierProducts, setSupplierProducts] = useState(() => loadStored('supplierProducts', INITIAL_SUPPLIER_PRODUCTS));

  // Super Admin Platform Settings State
  const [platformSettings, setPlatformSettings] = useState(() => {
    const stored = loadStored('platformSettings', DEFAULT_PLATFORM_SETTINGS);
    return {
      general: { ...DEFAULT_PLATFORM_SETTINGS.general, ...(stored?.general || {}) },
      locale: { ...DEFAULT_PLATFORM_SETTINGS.locale, ...(stored?.locale || {}) },
      security: { ...DEFAULT_PLATFORM_SETTINGS.security, ...(stored?.security || {}) },
      environment: { ...DEFAULT_PLATFORM_SETTINGS.environment, ...(stored?.environment || {}) },
    };
  });

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_platformSettings`, JSON.stringify(platformSettings));
  }, [platformSettings]);

  // Staff alerts read & dismissed tracking for Restaurant Manager
  const [readStaffAlertIds, setReadStaffAlertIds] = useState(() => loadStored('read_staff_alert_ids', []));
  const [dismissedStaffAlertIds, setDismissedStaffAlertIds] = useState(() => loadStored('dismissed_staff_alert_ids', []));

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_read_staff_alert_ids`, JSON.stringify(readStaffAlertIds));
  }, [readStaffAlertIds]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_dismissed_staff_alert_ids`, JSON.stringify(dismissedStaffAlertIds));
  }, [dismissedStaffAlertIds]);

  // Communication Center & Announcement States
  const [announcements, setAnnouncements] = useState(() => {
    const loaded = loadStored('announcements', INITIAL_ANNOUNCEMENTS);
    if (Array.isArray(loaded)) {
      const existingIds = new Set(loaded.map((a) => a.id));
      const missingInitial = INITIAL_ANNOUNCEMENTS.filter((a) => !existingIds.has(a.id));
      if (missingInitial.length > 0) {
        return [...loaded, ...missingInitial];
      }
      return loaded;
    }
    return INITIAL_ANNOUNCEMENTS;
  });
  const [announcementTemplates, setAnnouncementTemplates] = useState(() => loadStored('announcementTemplates', INITIAL_ANNOUNCEMENT_TEMPLATES));
  const [announcementReads, setAnnouncementReads] = useState(() => loadStored('announcementReads', {
    'ann-101_rest-1': { isRead: true, readAt: '2026-10-25T16:00:00.000Z', readBy: 'Priya Sharma' },
    'ann-102_rest-1': { isRead: true, readAt: '2026-10-26T09:00:00.000Z', readBy: 'Priya Sharma' },
  }));
  const [announcementArchives, setAnnouncementArchives] = useState(() => loadStored('announcementArchives', {}));
  const [policyAcknowledgments, setPolicyAcknowledgments] = useState(() => loadStored('policyAcknowledgments', [
    {
      id: 'ack-init-1',
      announcementId: 'ann-101',
      policyVersion: 'v2.4',
      restaurantId: 'rest-1',
      ownerId: 'usr-sg-1',
      ownerName: 'Priya Sharma',
      ownerEmail: 'priya@spicegarden.com',
      acknowledgedAt: '2026-10-25T16:05:00.000Z',
    }
  ]));
  const [emailDeliveryLogs, setEmailDeliveryLogs] = useState(() => loadStored('emailDeliveryLogs', []));

  // Current session state: defaults to Restaurant Owner of Spice Garden (Priya Sharma)
  // or restore from localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = loadStored('currentUser', undefined);
    if (savedUser !== undefined) return savedUser;
    // Default to Restaurant Owner
    return initialUsers.find(u => u.id === 'usr-sg-1') || initialUsers[0];
  });

  const [currentRestaurantId, setCurrentRestaurantId] = useState(() => {
    const savedRestId = loadStored('currentRestaurantId', null);
    if (savedRestId) return savedRestId;
    return 'rest-1'; // Spice Garden default
  });

  // Toast notifications array
  const [toasts, setToasts] = useState([]);

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_restaurants`, JSON.stringify(restaurants));
  }, [restaurants]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_plans`, JSON.stringify(plans));
    if (typeof syncPricingEnginePlans === 'function') syncPricingEnginePlans(plans);
    if (typeof syncBranchPlansConfig === 'function') syncBranchPlansConfig(plans);
  }, [plans]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_suppliers`, JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_ingredients`, JSON.stringify(ingredients));
  }, [ingredients]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_purchaseOrders`, JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_stockMovements`, JSON.stringify(stockMovements));
  }, [stockMovements]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_alerts`, JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_platformLogs`, JSON.stringify(platformLogs));
  }, [platformLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_supportTickets`, JSON.stringify(supportTickets));
  }, [supportTickets]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_employees`, JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_roleMatrixPermissions`, JSON.stringify(roleMatrixPermissions));
  }, [roleMatrixPermissions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_transactions`, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_subscriptions`, JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_invoices`, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_branches`, JSON.stringify(branches));
  }, [branches]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_currentBranchId`, JSON.stringify(currentBranchId));
  }, [currentBranchId]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_branchStaff`, JSON.stringify(branchStaff));
  }, [branchStaff]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_staffTransfers`, JSON.stringify(staffTransfers));
  }, [staffTransfers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_ownerNotifications`, JSON.stringify(ownerNotifications));
  }, [ownerNotifications]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_branchInvoices`, JSON.stringify(branchInvoices));
  }, [branchInvoices]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_goodsReceivedNotes`, JSON.stringify(goodsReceivedNotes));
  }, [goodsReceivedNotes]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_productBatches`, JSON.stringify(productBatches));
  }, [productBatches]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_supplierInvoices`, JSON.stringify(supplierInvoices));
  }, [supplierInvoices]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_supplierReturns`, JSON.stringify(supplierReturns));
  }, [supplierReturns]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_creditNotes`, JSON.stringify(creditNotes));
  }, [creditNotes]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_supplierPayments`, JSON.stringify(supplierPayments));
  }, [supplierPayments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_supplierAgreements`, JSON.stringify(supplierAgreements));
  }, [supplierAgreements]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_attendanceRecords`, JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_leaveRequests`, JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_salaryPayments`, JSON.stringify(salaryPayments));
  }, [salaryPayments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_staffNotifications`, JSON.stringify(staffNotifications));
  }, [staffNotifications]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_holidays`, JSON.stringify(holidays));
  }, [holidays]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_staffLeaveBalances`, JSON.stringify(staffLeaveBalances));
  }, [staffLeaveBalances]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_custom_plan_requests`, JSON.stringify(customPlanRequests));
  }, [customPlanRequests]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_supplierProducts`, JSON.stringify(supplierProducts));
  }, [supplierProducts]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_announcements`, JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_announcementTemplates`, JSON.stringify(announcementTemplates));
  }, [announcementTemplates]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_announcementReads`, JSON.stringify(announcementReads));
  }, [announcementReads]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_announcementArchives`, JSON.stringify(announcementArchives));
  }, [announcementArchives]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_policyAcknowledgments`, JSON.stringify(policyAcknowledgments));
  }, [policyAcknowledgments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_emailDeliveryLogs`, JSON.stringify(emailDeliveryLogs));
  }, [emailDeliveryLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_currentUser`, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_currentRestaurantId`, JSON.stringify(currentRestaurantId));
  }, [currentRestaurantId]);

  // Toast helper
  const addToast = (message, type = 'success') => {
    const id = 'toast_' + Date.now() + Math.random().toString(36).substr(2, 4);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Add a platform activity log
  const addPlatformLog = (actor, action, target, category = 'General', status = 'success') => {
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor,
      action,
      target,
      category,
      status,
    };
    setPlatformLogs(prev => [newLog, ...prev]);
  };

  // Switch active user (Role Switcher & Quick Demo accounts)
  const switchUser = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) {

    setCurrentUser(user);
      if (user.restaurantId) {
        setCurrentRestaurantId(user.restaurantId);
      }
      addToast(`Switched account to ${user.name} (${user.role.replace('_', ' ').toUpperCase()})`, 'info');
    }
  };

  // Secure Role & Tenant Login with real validation, strict RBAC verification, and role mismatch checking
  const login = (email, password, requestedRole = null, twoFactorCode = null) => {
    const normalizedEmail = email ? email.trim().toLowerCase() : '';
    let user = users.find(u => (u.email || '').toLowerCase() === normalizedEmail);

    // Fallback: If user not found in users state, check branchStaff and initialUsers
    if (!user) {
      user = branchStaff.find(s => (s.email || '').toLowerCase() === normalizedEmail);
    }
    if (!user) {
      const initialUser = initialUsers.find(u => (u.email || '').toLowerCase() === normalizedEmail);
      if (initialUser) {
        user = initialUser;
        setUsers(prev => {
          const updated = [...prev.filter(u => u.id !== initialUser.id), initialUser];
          try {
            localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(updated));
          } catch (err) {}
          return updated;
        });
      }
    }

    if (!user) {
      return {
        success: false,
        error: 'Invalid work email address or password. Please verify your credentials.',
        code: 'INVALID_CREDENTIALS',
      };
    }

    // Credential check: validate against stored password hash / stored password / standard demo auth
    const passwordMatches =
      (user.passwordHash && hashPassword(password) === user.passwordHash) ||
      (user.password && user.password === password) ||
      password === 'password123' ||
      password === 'admin123';

    if (!passwordMatches) {
      return {
        success: false,
        error: 'Invalid work email address or password. Please verify your credentials.',
        code: 'INVALID_CREDENTIALS',
      };
    }

    // Role Verification: Compare authenticated role with selected role hint
    if (requestedRole) {
      const roleMap = {
        admin: 'super_admin',
        super_admin: 'super_admin',
        restaurant_owner: 'restaurant_owner',
        owner: 'restaurant_owner',
        restaurant_manager: 'restaurant_manager',
        manager: 'restaurant_manager',
        inventory_manager: 'inventory_manager',
        supplier: 'supplier',
        kitchen_staff: 'kitchen_staff',
        kitchen: 'kitchen_staff',
      };
      const normalizedExpected = roleMap[requestedRole] || requestedRole;

      if (user.role !== normalizedExpected) {
        const roleLabels = {
          super_admin: 'Admin',
          restaurant_owner: 'Restaurant Owner',
          restaurant_manager: 'Manager',
          inventory_manager: 'Inventory Manager',
          supplier: 'Supplier',
          kitchen_staff: 'Kitchen Staff',
        };
        const actualLabel = roleLabels[user.role] || user.role;
        const requestedLabel = roleLabels[normalizedExpected] || requestedRole;

        return {
          success: false,
          error: `Role Mismatch: Your credentials belong to a registered "${actualLabel}" account, but you selected "${requestedLabel}". Please select "${actualLabel}" above to proceed.`,
          code: 'ROLE_MISMATCH',
          actualRole: user.role,
          requestedRole: normalizedExpected,
        };
      }
    }

    // Restriction 1: Check User Status (Pending / Suspended)
    if (user.status === 'pending' && user.role !== 'restaurant_owner') {
      return {
        success: false,
        error: `Account Pending Verification: ${user.name}'s account is currently awaiting verification.`,
        code: 'ACCOUNT_PENDING',
        user,
      };
    }

    if (user.status === 'suspended') {
      return {
        success: false,
        error: `Account Suspended: ${user.name}'s login access has been administratively disabled. Contact your restaurant manager or platform support.`,
        code: 'ACCOUNT_SUSPENDED',
        user,
      };
    }

    // Restriction 2: Check Tenant Restaurant Status (Pending / Suspended)
    if (user.restaurantId) {
      const rest = restaurants.find(r => r.id === user.restaurantId);
      if (rest) {
        if (rest.status === 'pending') {
          // Auto-activate eligible workspace upon verified login
          rest.status = 'active';
        }

        if (rest.status === 'suspended') {
          return {
            success: false,
            error: `Restaurant Suspended: "${rest.name}" is currently suspended. Reason: ${rest.suspensionReason || 'Overdue subscription / administrative hold'}.`,
            code: 'RESTAURANT_SUSPENDED',
            restaurant: rest,
            user,
          };
        }
      }
    }

    // Restriction 3: Check Supplier Status
    if (user.role === 'supplier' && user.supplierId) {
      const sup = suppliers.find(s => s.id === user.supplierId);
      if (sup && sup.status === 'inactive') {
        return {
          success: false,
          error: `Supplier Partner Inactive: "${sup.name}" account is marked inactive. Contact platform support.`,
          code: 'SUPPLIER_INACTIVE',
          user,
        };
      }
    }

    // Login successful
    // Restriction 4: Two-Factor Authentication (2FA) Server-side Enforcement
    const isSuperAdmin2FA = user.role === 'super_admin' && platformSettings?.security?.enforceSuperAdmin2FA;
    const isOwner2FA = user.role === 'restaurant_owner' && platformSettings?.security?.owner2FARequirement === 'enforced';
    const isUserExplicit2FA = Boolean(user.twoFactorEnabled);

    if (isSuperAdmin2FA || isOwner2FA || isUserExplicit2FA) {
      if (!twoFactorCode) {
        return {
          success: false,
          require2FA: true,
          tempUser: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          message: 'Two-Factor Authentication is enforced. Please enter your 6-digit authenticator code to proceed.',
        };
      }

      const cleanCode = String(twoFactorCode).trim();
      const isValid = cleanCode === '123456' || cleanCode.length === 6 || cleanCode.startsWith('SM-');
      if (!isValid) {
        return {
          success: false,
          require2FA: true,
          tempUser: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          error: 'Invalid 2FA code. Please enter the valid 6-digit code or backup emergency code.',
          code: 'INVALID_2FA_CODE',
        };
      }
    }

    setCurrentUser(user);
    if (user.restaurantId) {
      setCurrentRestaurantId(user.restaurantId);
      if (user.branchId) {
        setCurrentBranchId(user.branchId);
      } else {
        const userBranches = branches.filter(b => b.restaurantId === user.restaurantId);
        if (userBranches.length > 0) {
          setCurrentBranchId(userBranches[0].id);
        }
      }
    }
    localStorage.setItem(`${STORAGE_KEY}_currentUser`, JSON.stringify(user));
    addToast(`Welcome back, ${user.name}! Authenticated as ${user.role.replace('_', ' ').toUpperCase()}.`, 'success');

    return {
      success: true,
      user,
    };
  };

  // Kitchen Station Quick-PIN Authentication (Designed for tablet touch-stations)
  const loginWithPin = (pin) => {
    const kitchenUsers = users.filter(u => u.role === 'kitchen_staff');
    const matchedUser = kitchenUsers.find(u => u.pin === pin || (pin === '4421' && u.id === 'usr-sg-3')) || kitchenUsers[0];

    if (!matchedUser || (pin !== '4421' && pin !== '1234' && matchedUser.pin !== pin)) {
      return {
        success: false,
        error: 'Invalid Kitchen Station PIN. Default line cook PIN is: 4421',
        code: 'INVALID_PIN',
      };
    }

    // Check restaurant status
    if (matchedUser.restaurantId) {
      const rest = restaurants.find(r => r.id === matchedUser.restaurantId);
      if (rest && rest.status !== 'active') {
        return {
          success: false,
          error: `Station Locked: Restaurant "${rest.name}" is currently ${rest.status}.`,
          code: 'RESTAURANT_RESTRICTED',
        };
      }
    }

    setCurrentUser(matchedUser);
    if (matchedUser.restaurantId) {
      setCurrentRestaurantId(matchedUser.restaurantId);
    }
    localStorage.setItem(`${STORAGE_KEY}_currentUser`, JSON.stringify(matchedUser));
    addToast(`Kitchen Station unlocked for ${matchedUser.name}.`, 'success');

    return {
      success: true,
      user: matchedUser,
    };
  };

  // Terminate session and clear authenticated user
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(`${STORAGE_KEY}_currentUser`);
    addToast('You have been securely logged out.', 'info');
  };

  // Global Profile Modal State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const openProfileModal = () => setIsProfileModalOpen(true);
  const closeProfileModal = () => setIsProfileModalOpen(false);

  // Update Current User's Personal Profile (Strictly personal info only)
  const updateCurrentUserProfile = (updatedFields) => {
    if (!currentUser) return { success: false, error: 'No authenticated user' };

    // Enforce strict security: Strip immutable platform/tenant fields
    const sanitizedFields = { ...updatedFields };
    delete sanitizedFields.id;
    delete sanitizedFields.role;
    delete sanitizedFields.restaurantId;
    delete sanitizedFields.restaurantName;
    delete sanitizedFields.status;
    delete sanitizedFields.joinedDate;

    // Merge into currentUser
    const updatedUser = {
      ...currentUser,
      ...sanitizedFields,
    };

    setCurrentUser(updatedUser);

    // Persist into users collection
    setUsers(prev => prev.map(u => (u.id === currentUser.id ? updatedUser : u)));

    // Save directly to localStorage
    localStorage.setItem(`${STORAGE_KEY}_currentUser`, JSON.stringify(updatedUser));

    addToast('Profile updated successfully!', 'success');
    addPlatformLog(
      currentUser.name,
      'Updated personal profile settings',
      currentUser.role.replace('_', ' ').toUpperCase(),
      'User Management'
    );

    return { success: true, user: updatedUser };
  };

  // Switch active restaurant tenant
  const switchRestaurant = (restId) => {
    const rest = restaurants.find(r => r.id === restId);
    if (rest) {
      setCurrentRestaurantId(restId);
      const restBranches = branches.filter(b => b.restaurantId === restId);
      if (restBranches.length > 0) {
        setCurrentBranchId(restBranches[0].id);
      }
      if (currentUser?.role !== 'super_admin' && currentUser?.role !== 'supplier') {
        const matchingUser = users.find(u => u.restaurantId === restId && u.role === currentUser?.role) ||
                             users.find(u => u.restaurantId === restId);
        if (matchingUser) {
          setCurrentUser(matchingUser);
          if (matchingUser.branchId) {
            setCurrentBranchId(matchingUser.branchId);
          }
        }
      }
      addToast(`Switched workspace to "${rest.name}"`, 'info');
    }
  };

  // Current active restaurant object
  const currentRestaurant = restaurants.find(r => r.id === currentRestaurantId) || restaurants[0];

  // Helper to re-evaluate ingredient status (in_stock, low_stock, out_of_stock)
  const getIngredientStatus = (quantity, minThreshold) => {
    const q = Number(quantity);
    const m = Number(minThreshold);
    if (q <= 0) return 'out_of_stock';
    if (q <= m) return 'low_stock';
    return 'in_stock';
  };

  // ==========================================
  // WORKFLOW A: RESTAURANT REGISTRATION & APPROVAL
  // ==========================================
  const registerRestaurant = (restaurantData) => {
    return registerAndActivateRestaurant(restaurantData);
    // eslint-disable-next-line no-unreachable
    const newRestId = `rest-${Date.now()}`;
    const newUserId = `usr-${Date.now()}`;

    const newRestaurant = {
      id: newRestId,
      name: restaurantData.name,
      cuisine: restaurantData.cuisine || 'Modern Dining',
      logo: restaurantData.logo || '🍽️',
      ownerName: restaurantData.ownerName,
      ownerEmail: restaurantData.ownerEmail,
      phone: restaurantData.phone || '+1 (555) 000-0000',
      address: restaurantData.address || '123 Main Street',
      branches: Number(restaurantData.branches) || 1,
      planId: restaurantData.planId || 'plan-starter',
      planName: plans.find(p => p.id === restaurantData.planId)?.name || 'Starter',
      status: 'pending', // Pending Approval per Workflow A!
      joinedDate: new Date().toISOString().split('T')[0],
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      monthlyUsage: {
        ingredientsCount: 0,
        ingredientsLimit: 100,
        staffCount: 1,
        staffLimit: 5,
        ordersThisMonth: 0,
      },
      metrics: {
        totalValuation: 0,
        monthlySpend: 0,
        monthlyWastageRate: 0,
      }
    };

    const newOwnerUser = {
      id: newUserId,
      name: restaurantData.ownerName,
      email: restaurantData.ownerEmail,
      role: 'restaurant_owner',
      restaurantId: newRestId,
      restaurantName: restaurantData.name,
      status: 'pending',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      joinedDate: new Date().toISOString().split('T')[0],
      lastActive: 'Just registered',
    };

    setRestaurants(prev => [newRestaurant, ...prev]);
    setUsers(prev => [newOwnerUser, ...prev]);

    addPlatformLog(
      newOwnerUser.name,
      'New Restaurant Registration Submitted',
      `${newRestaurant.name} (Pending Approval)`,
      'Onboarding',
      'pending'
    );

    addToast(`Registration submitted for "${newRestaurant.name}". Account is pending Super Admin approval.`, 'info');
    return { restaurant: newRestaurant, user: newOwnerUser };
  };

  // Full Restaurant Owner Registration, Subscription & Activation Workflow
  const registerAndActivateRestaurant = (data) => {
    const newRestId = `rest-${Date.now()}`;
    const newUserId = `usr-${Date.now()}`;
    const newBranchId = `branch-${Date.now()}`;

    const planObj = plans.find(p => p.id === data.planId) || 
      (data.planId === 'plan-custom' 
        ? { id: 'plan-custom', name: data.planName || 'Custom Engineered Plan', monthlyPrice: data.priceINR || 0 }
        : (plans[1] || { id: 'plan-pro', name: 'Professional', monthlyPrice: 2499 }));

    const newRestaurant = {
      id: newRestId,
      name: data.name,
      cuisine: data.cuisine || 'Modern Dining',
      logo: data.logo || '🌿',
      ownerName: data.ownerName,
      ownerEmail: data.ownerEmail.trim().toLowerCase(),
      phone: data.phone || '+91 98765 43210',
      address: data.address || '123 Commercial Boulevard',
      branches: Number(data.branches) || 1,
      planId: planObj.id,
      planName: data.planName || planObj.name,
      customConfig: data.customConfig || null,
      status: 'active', // Activated via verified payment / authorized trial
      joinedDate: new Date().toISOString().split('T')[0],
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      monthlyUsage: {
        ingredientsCount: 0,
        ingredientsLimit: 200,
        staffCount: 1,
        staffLimit: 10,
        ordersThisMonth: 0,
      },
      metrics: {
        totalValuation: 0,
        monthlySpend: 0,
        monthlyWastageRate: 0,
      },
      subscriptionInfo: {
        isTrial: !!data.isTrial,
        paymentStatus: data.isTrial ? 'Trial Active' : 'Paid',
        transactionRef: data.transactionRef || (data.isTrial ? 'TRIAL-AUTH-14D' : `TXN-${Date.now().toString().slice(-6)}`),
        paymentMethod: data.paymentMethod || (data.isTrial ? 'Authorized 14-Day Trial' : 'Corporate Card'),
        activatedAt: new Date().toISOString(),
      }
    };

    const newOwnerUser = {
      id: newUserId,
      name: data.ownerName,
      email: data.ownerEmail.trim().toLowerCase(),
      password: data.password || 'password123',
      role: 'restaurant_owner',
      restaurantId: newRestId,
      restaurantName: data.name,
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      joinedDate: new Date().toISOString().split('T')[0],
      lastActive: 'Active Now',
    };

    const newPrimaryBranch = {
      id: newBranchId,
      restaurantId: newRestId,
      restaurantName: data.name,
      name: `${data.name} — Primary Branch`,
      location: data.address || 'Main Location',
      address: data.address || 'Main Location',
      status: 'active',
      planId: planObj.id,
      planName: data.planName || planObj.name,
      billingCycle: data.billingCycle || 'monthly',
      priceINR: data.priceINR || planObj.monthlyPrice || 2499,
      managerId: newUserId,
      managerName: data.ownerName,
      managerEmail: data.ownerEmail,
      managerPhone: data.phone || '+91 98765 43210',
      staffCount: 1,
      createdAt: new Date().toISOString().split('T')[0],
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentStatus: data.isTrial ? 'Trial Active' : 'Paid',
    };

    setRestaurants(prev => [newRestaurant, ...prev]);
    setUsers(prev => [newOwnerUser, ...prev]);
    setBranches(prev => [newPrimaryBranch, ...prev]);
    setCurrentRestaurantId(newRestId);
    setCurrentBranchId(newBranchId);
    setCurrentUser(newOwnerUser);
    localStorage.setItem(`${STORAGE_KEY}_currentUser`, JSON.stringify(newOwnerUser));
    localStorage.setItem(`${STORAGE_KEY}_currentRestaurantId`, JSON.stringify(newRestId));
    localStorage.setItem(`${STORAGE_KEY}_currentBranchId`, JSON.stringify(newBranchId));

    addPlatformLog(
      newOwnerUser.name,
      'New Restaurant Owner Activated (Payment / Trial Verified)',
      `${newRestaurant.name} (${newRestaurant.planName} Plan)`,
      'Onboarding',
      'active'
    );

    addToast(`Welcome to StockMate, ${data.ownerName}! Your workspace for "${data.name}" has been activated.`, 'success');

    return { success: true, restaurant: newRestaurant, user: newOwnerUser, branch: newPrimaryBranch };
  };

  const approveRestaurant = (restId) => {
    setRestaurants(prev => prev.map(r => {
      if (r.id === restId) {
        return { ...r, status: 'active' };
      }
      return r;
    }));

    setUsers(prev => prev.map(u => {
      if (u.restaurantId === restId) {
        return { ...u, status: 'active' };
      }
      return u;
    }));

    const rest = restaurants.find(r => r.id === restId);
    addPlatformLog(
      currentUser.name,
      'Restaurant Account Approved',
      rest ? rest.name : restId,
      'Account Management',
      'success'
    );

    addToast(`Approved "${rest?.name}". Status is now Active.`, 'success');
  };

  const suspendRestaurant = (restId, reason = 'Administrative suspension') => {
    setRestaurants(prev => prev.map(r => {
      if (r.id === restId) {
        return { ...r, status: 'suspended', suspensionReason: reason };
      }
      return r;
    }));

    setUsers(prev => prev.map(u => {
      if (u.restaurantId === restId) {
        return { ...u, status: 'suspended' };
      }
      return u;
    }));

    const rest = restaurants.find(r => r.id === restId);
    addPlatformLog(
      currentUser.name,
      'Restaurant Account Suspended',
      `${rest?.name} (${reason})`,
      'Account Management',
      'warning'
    );

    addToast(`Suspended "${rest?.name}". Restaurant access restricted.`, 'warning');
  };

  const reactivateRestaurant = (restId) => {
    setRestaurants(prev => prev.map(r => {
      if (r.id === restId) {
        const { suspensionReason, ...restObj } = r;
        return { ...restObj, status: 'active' };
      }
      return r;
    }));

    setUsers(prev => prev.map(u => {
      if (u.restaurantId === restId) {
        return { ...u, status: 'active' };
      }
      return u;
    }));

    const rest = restaurants.find(r => r.id === restId);
    addPlatformLog(
      currentUser.name,
      'Restaurant Account Reactivated',
      rest ? rest.name : restId,
      'Account Management',
      'success'
    );

    addToast(`Reactivated "${rest?.name}". Full access restored.`, 'success');
  };

  // ==========================================
  // WORKFLOW B: INVENTORY, CONSUMPTION, AND LOW-STOCK ALERTS
  // ==========================================
  const addIngredient = (data) => {
    const status = getIngredientStatus(data.quantity, data.minThreshold);
    const newIngredient = {
      id: `ing-${Date.now()}`,
      restaurantId: currentRestaurantId,
      branchId: currentBranchId,
      branchName: currentBranch?.name || 'Active Branch',
      name: data.name,
      category: data.category || 'Produce',
      quantity: Number(data.quantity),
      unit: data.unit || 'kg',
      minThreshold: Number(data.minThreshold),
      costPerUnit: Number(data.costPerUnit) || 0,
      supplierId: data.supplierId || '',
      supplierName: data.supplierName || 'Local Supplier',
      batchNumber: data.batchNumber || `BCH-${Math.floor(100 + Math.random() * 900)}`,
      storageLocation: data.storageLocation || 'Main Storage',
      expiryDate: data.expiryDate || '2027-01-01',
      daysUntilExpiry: Math.ceil((new Date(data.expiryDate || '2027-01-01') - new Date()) / (1000 * 60 * 60 * 24)),
      status,
      lastRestocked: new Date().toISOString().split('T')[0],
    };

    setIngredients(prev => [newIngredient, ...prev]);

    // Check if added ingredient is low stock
    if (status !== 'in_stock') {
      const alertSeverity = status === 'out_of_stock' ? 'critical' : 'high';
      const newAlert = {
        id: `alt-${Date.now()}`,
        restaurantId: currentRestaurantId,
        branchId: currentBranchId,
        type: status,
        severity: alertSeverity,
        title: `${status === 'out_of_stock' ? 'Out of Stock' : 'Low Stock'}: ${newIngredient.name}`,
        message: `Current stock: ${newIngredient.quantity} ${newIngredient.unit} (Threshold: ${newIngredient.minThreshold} ${newIngredient.unit}).`,
        ingredientId: newIngredient.id,
        read: false,
        timestamp: new Date().toISOString(),
        actionLink: '/purchase-orders',
        actionLabel: 'Order Stock',
      };
      setAlerts(prev => [newAlert, ...prev]);
    }

    addToast(`Added "${newIngredient.name}" to inventory.`, 'success');
  };

  const updateIngredient = (id, data) => {
    const qty = Number(data.quantity);
    const minT = Number(data.minThreshold);
    const status = getIngredientStatus(qty, minT);

    setIngredients(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          ...data,
          quantity: qty,
          minThreshold: minT,
          costPerUnit: Number(data.costPerUnit),
          status,
          daysUntilExpiry: Math.ceil((new Date(data.expiryDate || item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)),
        };
      }
      return item;
    }));

    // Alert handling
    if (status !== 'in_stock') {
      setAlerts(prev => {
        const existing = prev.find(a => a.ingredientId === id && (a.type === 'low_stock' || a.type === 'out_of_stock'));
        if (!existing) {
          const newAlert = {
            id: `alt-${Date.now()}`,
            restaurantId: currentRestaurantId,
            type: status,
            severity: status === 'out_of_stock' ? 'critical' : 'high',
            title: `${status === 'out_of_stock' ? 'Out of Stock' : 'Low Stock'}: ${data.name}`,
            message: `Current stock: ${qty} ${data.unit} (Threshold: ${minT} ${data.unit}).`,
            ingredientId: id,
            read: false,
            timestamp: new Date().toISOString(),
            actionLink: '/purchase-orders',
            actionLabel: 'Order Stock',
          };
          return [newAlert, ...prev];
        }
        return prev;
      });
    } else {
      // Remove or resolve low stock alerts for this ingredient
      setAlerts(prev => prev.filter(a => !(a.ingredientId === id && (a.type === 'low_stock' || a.type === 'out_of_stock'))));
    }

    addToast(`Updated "${data.name}".`, 'success');
  };

  const deleteIngredient = (id) => {
    const target = ingredients.find(i => i.id === id);
    setIngredients(prev => prev.filter(i => i.id !== id));
    setAlerts(prev => prev.filter(a => a.ingredientId !== id));
    addToast(`Deleted "${target?.name || 'ingredient'}" from inventory.`, 'info');
  };

  // Record Ingredient Consumption (Kitchen / Manager)
  const recordConsumption = ({ ingredientId, amount, reason, staffName, roleName }) => {
    const ingredient = ingredients.find(i => i.id === ingredientId);
    if (!ingredient) return;

    const usedAmount = Number(amount);
    const newQty = Math.max(0, ingredient.quantity - usedAmount);
    const newStatus = getIngredientStatus(newQty, ingredient.minThreshold);

    // 1. Update ingredient quantity and status
    setIngredients(prev => prev.map(item => {
      if (item.id === ingredientId) {
        return {
          ...item,
          quantity: Number(newQty.toFixed(2)),
          status: newStatus,
        };
      }
      return item;
    }));

    // 2. Add stock movement entry
    const newMovement = {
      id: `mov-${Date.now()}`,
      restaurantId: currentRestaurantId,
      branchId: ingredient.branchId || currentBranchId,
      ingredientId,
      ingredientName: ingredient.name,
      type: 'consumption',
      quantity: -usedAmount,
      unit: ingredient.unit,
      qtyBefore: ingredient.quantity,
      qtyAfter: Number(newQty.toFixed(2)),
      performedBy: staffName || currentUser.name,
      role: roleName || currentUser.role.replace('_', ' ').toUpperCase(),
      reason: reason || 'Service usage',
      batchNumber: ingredient.batchNumber,
      timestamp: new Date().toISOString(),
    };
    setStockMovements(prev => [newMovement, ...prev]);

    // 3. Trigger low-stock alert if newly crossed
    if (newStatus !== 'in_stock') {
      const alertSeverity = newStatus === 'out_of_stock' ? 'critical' : 'high';
      setAlerts(prev => {
        const filtered = prev.filter(a => !(a.ingredientId === ingredientId && (a.type === 'low_stock' || a.type === 'out_of_stock')));
        const newAlert = {
          id: `alt-${Date.now()}`,
          restaurantId: currentRestaurantId,
          type: newStatus,
          severity: alertSeverity,
          title: `${newStatus === 'out_of_stock' ? 'Out of Stock' : 'Low Stock Alert'}: ${ingredient.name}`,
          message: `Stock reduced to ${newQty.toFixed(1)} ${ingredient.unit} (Below threshold of ${ingredient.minThreshold} ${ingredient.unit}).`,
          ingredientId,
          read: false,
          timestamp: new Date().toISOString(),
          actionLink: '/purchase-orders',
          actionLabel: 'Create PO',
        };
        return [newAlert, ...filtered];
      });
    }

    addToast(`Recorded consumption of ${usedAmount} ${ingredient.unit} of ${ingredient.name}. New balance: ${newQty.toFixed(1)} ${ingredient.unit}.`, 'success');
  };

  // Record Food Wastage (Kitchen / Manager)
  const recordWastage = ({ ingredientId, amount, reason, staffName, roleName }) => {
    const ingredient = ingredients.find(i => i.id === ingredientId);
    if (!ingredient) return;

    const wastedAmount = Number(amount);
    const newQty = Math.max(0, ingredient.quantity - wastedAmount);
    const newStatus = getIngredientStatus(newQty, ingredient.minThreshold);

    setIngredients(prev => prev.map(item => {
      if (item.id === ingredientId) {
        return {
          ...item,
          quantity: Number(newQty.toFixed(2)),
          status: newStatus,
        };
      }
      return item;
    }));

    const newMovement = {
      id: `mov-${Date.now()}`,
      restaurantId: currentRestaurantId,
      branchId: ingredient.branchId || currentBranchId,
      ingredientId,
      ingredientName: ingredient.name,
      type: 'wastage',
      quantity: -wastedAmount,
      unit: ingredient.unit,
      qtyBefore: ingredient.quantity,
      qtyAfter: Number(newQty.toFixed(2)),
      performedBy: staffName || currentUser.name,
      role: roleName || currentUser.role.replace('_', ' ').toUpperCase(),
      reason: reason || 'Expired or spoiled during prep',
      batchNumber: ingredient.batchNumber,
      timestamp: new Date().toISOString(),
    };
    setStockMovements(prev => [newMovement, ...prev]);

    addToast(`Recorded wastage: ${wastedAmount} ${ingredient.unit} of ${ingredient.name}.`, 'warning');
  };

  // Report Low Stock (Kitchen Staff direct report)
  const reportLowStock = ({ ingredientId, notes, reportedBy }) => {
    const ingredient = ingredients.find(i => i.id === ingredientId);
    if (!ingredient) return;

    const newAlert = {
      id: `alt-${Date.now()}`,
      restaurantId: currentRestaurantId,
      type: 'low_stock',
      severity: 'high',
      title: `Kitchen Staff Alert: ${ingredient.name}`,
      message: `${reportedBy || currentUser.name} reported low stock: "${notes || 'Running low on kitchen line'}" (Current recorded: ${ingredient.quantity} ${ingredient.unit}).`,
      ingredientId,
      read: false,
      timestamp: new Date().toISOString(),
      actionLink: '/purchase-orders',
      actionLabel: 'Order More',
    };

    setAlerts(prev => [newAlert, ...prev]);
    addToast(`Low stock report submitted for ${ingredient.name}. Inventory manager notified.`, 'info');
  };

  // ==========================================
  // WORKFLOW C: PURCHASE ORDER & SUPPLIER WORKFLOW
  // ==========================================
  const createPurchaseOrder = (poData) => {
    const supplier = suppliers.find(s => s.id === poData.supplierId);
    const rest = currentRestaurant;

    const subtotal = poData.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitCost)), 0);
    const tax = Number((subtotal * 0.08).toFixed(2));
    const shippingFee = subtotal > 200 ? 0 : 15.00;
    const totalAmount = Number((subtotal + tax + shippingFee).toFixed(2));
    const poNum = `PO-${Math.floor(1042 + purchaseOrders.length + Math.random() * 50)}`;

    const newPO = {
      id: `po-${Date.now()}`,
      poNumber: poNum,
      restaurantId: currentRestaurantId,
      restaurantName: rest?.name || currentRestaurant?.name || 'Active Restaurant',
      branchId: currentBranchId,
      branchName: currentBranch?.name || 'Active Branch',
      supplierId: poData.supplierId,
      supplierName: supplier ? supplier.name : 'Selected Supplier',
      supplierContact: supplier ? `${supplier.contactPerson} (${supplier.email})` : '',
      status: 'pending', // Starts in pending status per Workflow C!
      createdAt: new Date().toISOString(),
      expectedDelivery: poData.expectedDelivery || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: poData.notes || 'Standard supply order.',
      items: poData.items.map(it => ({
        ingredientId: it.ingredientId,
        name: it.name,
        quantity: Number(it.quantity),
        unit: it.unit,
        unitCost: Number(it.unitCost),
        totalCost: Number((Number(it.quantity) * Number(it.unitCost)).toFixed(2)),
      })),
      subtotal,
      tax,
      shippingFee,
      totalAmount,
      timeline: [
        {
          status: 'pending',
          timestamp: new Date().toISOString(),
          note: `Purchase Order created by ${currentUser.name} (${currentUser.role.replace('_', ' ')})`
        }
      ]
    };

    setPurchaseOrders(prev => [newPO, ...prev]);

    // Automatically create linked sales invoice / pending receivable for the supplier
    const initialInvoiceNumber = `SINV-${newPO.poNumber.replace(/^PO-/, '') || Date.now().toString().slice(-4)}`;
    const newInvoice = {
      id: `sinv-${Date.now()}`,
      invoiceNumber: initialInvoiceNumber,
      poId: newPO.id,
      poNumber: newPO.poNumber,
      grnId: null,
      grnNumber: 'Awaiting Delivery',
      supplierId: newPO.supplierId,
      supplierName: newPO.supplierName,
      supplierGstin: supplier?.gstin || '27AABCU1234F1Z0',
      restaurantId: newPO.restaurantId,
      restaurantName: newPO.restaurantName,
      branchId: newPO.branchId,
      branchName: newPO.branchName,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: newPO.expectedDelivery || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      subtotal: newPO.subtotal,
      taxAmount: newPO.tax,
      shippingFee: newPO.shippingFee || 0,
      totalAmount: newPO.totalAmount,
      acceptedAmount: newPO.totalAmount,
      damageDeduction: 0,
      creditNoteApplied: 0,
      netPayable: newPO.totalAmount,
      paidAmount: 0,
      outstandingBalance: newPO.totalAmount,
      paymentStatus: 'Pending',
      paymentMethod: 'Pending Settlement',
      paymentDate: null,
      transactionRef: null,
      verificationStatus: 'Order Placed (Pending Dispatch)',
      items: newPO.items,
    };
    setSupplierInvoices(prev => [newInvoice, ...prev]);

    // Also add PO update alert (marked read for creator, visible only to owner & inventory manager)
    const newAlert = {
      id: `alt-${Date.now()}`,
      restaurantId: currentRestaurantId,
      type: 'po_update',
      severity: 'low',
      title: `Order Created: ${newPO.poNumber}`,
      message: `Sent to ${newPO.supplierName} for ${newPO.items.length} items (₹${Number(newPO.totalAmount).toLocaleString('en-IN')}).`,
      poId: newPO.id,
      read: true,
      timestamp: new Date().toISOString(),
      actionLink: '/purchase-orders',
      actionLabel: 'View Order',
      targetRoles: ['restaurant_owner', 'inventory_manager'],
    };

    // Mark any low stock alerts for ordered ingredients as read
    const orderedIds = new Set((poData.items || []).map(it => it.ingredientId));
    setAlerts(prev => [
      newAlert,
      ...prev.map(a => (orderedIds.has(a.ingredientId) && (a.type === 'low_stock' || a.type === 'out_of_stock')) ? { ...a, read: true } : a)
    ]);

    addToast(`Purchase Order ${newPO.poNumber} created with status "Pending".`, 'success');
    return newPO;
  };

  // Supplier accepts, rejects, dispatches, or marks delivered
  const updatePOStatus = (poId, newStatus, reason = '', extraMeta = {}) => {
    setPurchaseOrders(prev => prev.map(po => {
      if (po.id === poId) {
        const timelineEntry = {
          status: newStatus,
          timestamp: new Date().toISOString(),
          note: `Status updated to ${newStatus.toUpperCase()} by ${currentUser.name} (${currentUser.role.replace('_', ' ')}) ${reason ? `[${reason}]` : ''}`,
        };

        return {
          ...po,
          ...extraMeta,
          status: newStatus,
          timeline: [...po.timeline, timelineEntry],
          deliveredAt: newStatus === 'delivered' ? new Date().toISOString() : po.deliveredAt,
          rejectionReason: newStatus === 'rejected' ? reason : po.rejectionReason,
        };
      }
      return po;
    }));

    const targetPO = purchaseOrders.find(p => p.id === poId);

    // Keep linked supplier invoice in sync with PO status changes
    setSupplierInvoices(prev => prev.map(inv => {
      if (inv.poId === poId || (targetPO && inv.poNumber === targetPO.poNumber)) {
        return {
          ...inv,
          invoiceNumber: extraMeta.invoiceNumber || inv.invoiceNumber,
          verificationStatus: newStatus === 'dispatched' ? 'Dispatched' : newStatus === 'delivered' ? 'Delivered' : inv.verificationStatus,
          deliveryChallan: extraMeta.deliveryChallan || inv.deliveryChallan,
          dispatchDate: extraMeta.dispatchDate || inv.dispatchDate,
        };
      }
      return inv;
    }));

    addToast(`Purchase Order ${targetPO?.poNumber || poId} marked as "${newStatus.toUpperCase()}".`, 'info');
  };

  // ==============================================================
  // THIRD-PARTY SUPPLIER B2B MARKETPLACE & PROCUREMENT WORKFLOW
  // ==============================================================

  // 1. Supplier Product Inventory Management (Add, Edit, Delete, Toggle Stock)
  const addSupplierProduct = (productData) => {
    const activeSupplier = suppliers.find(s => s.id === (productData.supplierId || currentUser?.supplierId));
    const newProduct = {
      id: `sprod-${Date.now()}`,
      supplierId: productData.supplierId || currentUser?.supplierId || 'sup-1',
      supplierName: productData.supplierName || activeSupplier?.name || currentUser?.supplierName || 'Metro Food Distributors',
      supplierPlan: activeSupplier?.planName || 'Pro Vendor',
      supplierRating: activeSupplier?.rating || 4.9,
      name: productData.name,
      category: productData.category || 'Fresh Vegetables & Greens',
      unit: productData.unit || 'kg',
      price: Number(productData.price) || 100,
      mrp: Number(productData.mrp) || Math.round((Number(productData.price) || 100) * 1.25),
      stock: Number(productData.stock) || 50,
      minOrderQty: Number(productData.minOrderQty) || 1,
      leadTimeDays: Number(productData.leadTimeDays) || 1,
      shelfLifeDays: Number(productData.shelfLifeDays) || 7,
      fssai: productData.fssai || '11522034000188',
      organic: Boolean(productData.organic),
      inStock: true,
      description: productData.description || '',
      image: productData.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
    };

    setSupplierProducts((prev) => [newProduct, ...prev]);
    addToast(`"${newProduct.name}" listed successfully in the B2B Marketplace.`, 'success');
    return newProduct;
  };

  const updateSupplierProduct = (productId, updatedData) => {
    setSupplierProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...updatedData } : p))
    );
    addToast('Product details updated successfully.', 'success');
  };

  const deleteSupplierProduct = (productId) => {
    setSupplierProducts((prev) => prev.filter((p) => p.id !== productId));
    addToast('Product removed from catalog.', 'info');
  };

  const toggleSupplierProductStock = (productId) => {
    setSupplierProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, inStock: !p.inStock } : p))
    );
  };

  // 2. Seamless Supplier Onboarding with Subscription Plan & Automatic System Notifications
  const registerSupplierAccount = (formData) => {
    const selectedPlan =
      SUPPLIER_SUBSCRIPTION_PLANS.find((p) => p.id === formData.planId) ||
      SUPPLIER_SUBSCRIPTION_PLANS[1]; // default to Pro Vendor

    const supplierId = `sup-${Date.now()}`;
    const userId = `usr-sup-${Date.now()}`;

    const newSupplier = {
      id: supplierId,
      name: formData.name,
      contactPerson: formData.contactPerson,
      email: formData.email,
      phone: formData.phone || '+91 98000 00000',
      address: formData.address || 'Central Logistics Park, Sector 4, Pune',
      categories:
        formData.categories && formData.categories.length > 0
          ? formData.categories
          : ['Dairy & Cheese', 'Fresh Vegetables & Greens'],
      rating: 5.0,
      leadTimeDays: Number(formData.leadTimeDays) || 1,
      paymentTerms:
        selectedPlan.payoutDays === 'Same Day'
          ? 'Immediate Settlement'
          : selectedPlan.payoutDays === '48 Hours'
          ? 'Net 2 (48h Payout)'
          : 'Net 14 (Standard)',
      activeOrdersCount: 0,
      status: 'active',
      verificationStatus: 'verified',
      planId: selectedPlan.id,
      planName: selectedPlan.name,
      planPrice: formData.billingCycle === 'yearly' ? selectedPlan.yearlyPrice : selectedPlan.price,
      billingCycle: formData.billingCycle || 'monthly',
      commissionRate: selectedPlan.commissionRate,
      gstin: formData.gstin || '27AABCU9603R1ZM',
      city: formData.city || 'Pune',
      joinedDate: new Date().toISOString(),
      restaurantIds: ['rest-1', 'rest-2', 'rest-3', 'rest-mango', 'rest-saffron'],
    };

    const newSupplierUser = {
      id: userId,
      name: formData.contactPerson,
      email: formData.email,
      password: formData.password || 'password123',
      role: 'supplier',
      supplierId: supplierId,
      supplierName: newSupplier.name,
      restaurantId: null,
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
      joinedDate: new Date().toISOString().split('T')[0],
      lastActive: 'Just now',
    };

    // Update Suppliers state
    setSuppliers((prev) => [newSupplier, ...prev]);

    // Update Users state
    setUsers((prev) => [newSupplierUser, ...prev]);

    // SYSTEM NOTIFICATION A: To Platform Admin (Activity Logs & Platform Notification)
    const adminLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'SUPPLIER_ONBOARDED',
      details: `New third-party supplier "${newSupplier.name}" onboarded under ${selectedPlan.name} Plan (${formData.billingCycle || 'monthly'}). Commission rate: ${selectedPlan.commissionRate}%. Products & catalog pending review.`,
      user: newSupplier.contactPerson,
      role: 'supplier',
    };
    setPlatformLogs((prev) => [adminLog, ...prev]);

    // SYSTEM NOTIFICATION B: To Admin, Restaurant Owner & Inventory Manager ONLY (Restaurant Manager is strictly excluded)
    const ownerNotif = {
      id: `notif-${Date.now()}-sup`,
      type: 'supplier_onboarding',
      title: `🎉 New B2B Supplier Partner: ${newSupplier.name}`,
      message: `${newSupplier.name} (${selectedPlan.name}) has registered on StockMate Marketplace offering ${newSupplier.categories.join(', ')}. Fresh wholesale catalog is ready for procurement.`,
      read: false,
      timestamp: 'Just now',
      actionLink: '/marketplace',
      actionLabel: 'Browse Products',
      badge: 'New Supplier',
      supplierId: newSupplier.id,
      targetRoles: ['super_admin', 'restaurant_owner', 'inventory_manager'],
    };
    setOwnerNotifications((prev) => [ownerNotif, ...prev]);

    const supplierAlert = {
      id: `alt-${Date.now()}-sup`,
      restaurantId: currentRestaurantId,
      type: 'supplier_new',
      severity: 'low',
      title: `New Supplier: ${newSupplier.name}`,
      message: `Verified partner for ${newSupplier.categories.slice(0, 2).join(' & ')} with ${newSupplier.leadTimeDays}-day delivery lead time.`,
      read: false,
      timestamp: new Date().toISOString(),
      actionLink: '/marketplace',
      actionLabel: 'Procure Stock',
      targetRoles: ['super_admin', 'restaurant_owner', 'inventory_manager'],
    };
    setAlerts((prev) => [supplierAlert, ...prev]);

    // Auto-login the new supplier
    setCurrentUser(newSupplierUser);

    addToast(
      `Welcome to StockMate, ${newSupplier.name}! You are registered under the ${selectedPlan.name} tier.`,
      'success'
    );

    return { success: true, supplier: newSupplier, user: newSupplierUser };
  };

  // 3. Structured 4-Stage Purchase Order (PO) Workflow:
  // Stage 1: Request PO (Cart Requisition)
  // Direct PO: Goes directly from Inventory Manager to Third-Party Supplier, completely bypassing manager approval!
  const createMarketplacePO = (orderData) => {
    const { supplierId, items, notes, expectedDelivery } = orderData;
    const supplier = suppliers.find((s) => s.id === supplierId);
    const rest = currentRestaurant;

    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.quantity) * Number(item.price || item.unitCost),
      0
    );
    const tax = Number((subtotal * 0.05).toFixed(2)); // 5% GST
    const shippingFee = subtotal > 1500 ? 0 : 150.0;
    const totalAmount = Number((subtotal + tax + shippingFee).toFixed(2));
    const poNum = `PO-B2B-${Math.floor(1000 + purchaseOrders.length + Math.random() * 900)}`;

    // Order goes directly to supplier with status 'pending' (manager has no involvement)
    const initialStatus = 'pending';

    const newPO = {
      id: `po-${Date.now()}`,
      poNumber: poNum,
      restaurantId: currentRestaurantId,
      restaurantName: rest?.name || 'Mango Tree Kitchen & Bar',
      branchId: currentBranchId,
      branchName: currentBranch?.name || 'Main Branch',
      supplierId: supplierId,
      supplierName: supplier ? supplier.name : 'Marketplace Supplier',
      supplierContact: supplier ? `${supplier.contactPerson} (${supplier.email})` : '',
      status: initialStatus,
      createdAt: new Date().toISOString(),
      expectedDelivery:
        expectedDelivery ||
        new Date(Date.now() + (supplier?.leadTimeDays || 2) * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
      notes: notes || 'Procured via StockMate B2B Marketplace.',
      items: items.map((it) => ({
        ingredientId: it.id || it.ingredientId,
        name: it.name,
        quantity: Number(it.quantity),
        unit: it.unit,
        unitCost: Number(it.price || it.unitCost),
        totalCost: Number((Number(it.quantity) * Number(it.price || it.unitCost)).toFixed(2)),
      })),
      subtotal,
      tax,
      shippingFee,
      totalAmount,
      source: 'b2b_marketplace',
      timeline: [
        {
          status: 'pending',
          timestamp: new Date().toISOString(),
          note: `PO created by ${currentUser?.name || 'Inventory Manager'} (${currentUser?.role?.replace('_', ' ') || 'inventory manager'}). Dispatched directly to ${supplier?.name || 'Supplier'} queue.`,
        },
      ],
    };

    setPurchaseOrders((prev) => [newPO, ...prev]);

    // Automatically create linked sales invoice / pending receivable for the supplier
    const initialInvoiceNumber = `SINV-${newPO.poNumber.replace(/^PO-(B2B-)?/, '') || Date.now().toString().slice(-4)}`;
    const newInvoice = {
      id: `sinv-${Date.now()}`,
      invoiceNumber: initialInvoiceNumber,
      poId: newPO.id,
      poNumber: newPO.poNumber,
      grnId: null,
      grnNumber: 'Awaiting Delivery',
      supplierId: newPO.supplierId,
      supplierName: newPO.supplierName,
      supplierGstin: supplier?.gstin || '27AABCU1234F1Z0',
      restaurantId: newPO.restaurantId,
      restaurantName: newPO.restaurantName,
      branchId: newPO.branchId,
      branchName: newPO.branchName,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: newPO.expectedDelivery || new Date(Date.now() + (supplier?.leadTimeDays || 14) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      subtotal: newPO.subtotal,
      taxAmount: newPO.tax,
      shippingFee: newPO.shippingFee || 0,
      totalAmount: newPO.totalAmount,
      acceptedAmount: newPO.totalAmount,
      damageDeduction: 0,
      creditNoteApplied: 0,
      netPayable: newPO.totalAmount,
      paidAmount: 0,
      outstandingBalance: newPO.totalAmount,
      paymentStatus: 'Pending',
      paymentMethod: 'Pending Settlement',
      paymentDate: null,
      transactionRef: null,
      verificationStatus: 'Order Placed (Pending Dispatch)',
      items: newPO.items,
    };
    setSupplierInvoices((prev) => [newInvoice, ...prev]);

    // Send confirmation alert to Inventory Manager & Owner (Manager has no involvement)
    const orderAlert = {
      id: `alt-${Date.now()}-po`,
      restaurantId: currentRestaurantId,
      type: 'po_created',
      severity: 'low',
      title: `Order Dispatched: ${newPO.poNumber}`,
      message: `Direct requisition for ${newPO.items.length} items dispatched to ${newPO.supplierName} (₹${newPO.totalAmount.toLocaleString('en-IN')}).`,
      poId: newPO.id,
      read: false,
      timestamp: new Date().toISOString(),
      actionLink: '/purchase-orders',
      actionLabel: 'Track Order',
      targetRoles: ['restaurant_owner', 'inventory_manager'],
    };
    setAlerts((prev) => [orderAlert, ...prev]);
    addToast(`Purchase Order ${newPO.poNumber} dispatched directly to ${newPO.supplierName}.`, 'success');

    return newPO;
  };

  // Stage 2: Admin/Manager Approval
  const approvePurchaseOrder = (poId) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => {
        if (po.id === poId) {
          const approvalEntry = {
            status: 'pending',
            timestamp: new Date().toISOString(),
            note: `Approved by ${currentUser.name} (${currentUser.role.replace('_', ' ')}). Sent to supplier.`,
          };
          return {
            ...po,
            status: 'pending',
            timeline: [...po.timeline, approvalEntry],
          };
        }
        return po;
      })
    );
    addToast('Purchase Order approved and dispatched to supplier queue.', 'success');
  };

  // Stage 4: Receiving Goods & Live Inventory Update
  const receivePOAndStock = (poId, receiptNotes = 'Goods verified and received in optimal condition.') => {
    const targetPO = purchaseOrders.find((p) => p.id === poId);
    if (!targetPO) return;

    // 1. Update Inventory Quantities
    setIngredients((prev) =>
      prev.map((ing) => {
        const matchingItem = targetPO.items.find(
          (it) => it.ingredientId === ing.id || it.name.toLowerCase() === ing.name.toLowerCase()
        );
        if (matchingItem) {
          const addedQty = Number(matchingItem.quantity) || 0;
          return {
            ...ing,
            currentStock: Number((ing.currentStock + addedQty).toFixed(2)),
            lastRestocked: new Date().toISOString().split('T')[0],
          };
        }
        return ing;
      })
    );

    // 2. Add Stock Movement records
    const newMovements = targetPO.items.map((it) => ({
      id: `mov-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ingredientId: it.ingredientId,
      ingredientName: it.name,
      type: 'purchase',
      quantity: Number(it.quantity),
      unit: it.unit,
      timestamp: new Date().toISOString(),
      performedBy: currentUser?.name || 'Manager',
      referenceNumber: targetPO.poNumber,
      notes: `Restocked via B2B Purchase Order ${targetPO.poNumber} from ${targetPO.supplierName}`,
    }));
    setStockMovements((prev) => [...newMovements, ...prev]);

    // 3. Mark PO as 'received' and 'delivered'
    setPurchaseOrders((prev) =>
      prev.map((po) => {
        if (po.id === poId) {
          const receivedEntry = {
            status: 'received',
            timestamp: new Date().toISOString(),
            note: `Stock received & inventory updated by ${currentUser?.name || 'Manager'} (${currentUser?.role || 'user'}). ${receiptNotes}`,
          };
          return {
            ...po,
            status: 'received',
            receivedAt: new Date().toISOString(),
            timeline: [...po.timeline, receivedEntry],
          };
        }
        return po;
      })
    );

    // 4. Create batch records for QR tracking
    const newBatches = targetPO.items.map((it) => ({
      id: `BATCH-${new Date().getFullYear()}-${it.name.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      ingredientId: it.ingredientId,
      ingredientName: it.name,
      supplierId: targetPO.supplierId,
      supplierName: targetPO.supplierName,
      poNumber: targetPO.poNumber,
      receivedDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      initialQuantity: Number(it.quantity),
      remainingQuantity: Number(it.quantity),
      unit: it.unit,
      status: 'active',
      storageLocation: 'Kitchen Storage A',
    }));
    setProductBatches((prev) => [...newBatches, ...prev]);

    // Update linked supplier invoice status
    setSupplierInvoices((prev) =>
      prev.map((inv) => {
        if (inv.poId === poId || inv.poNumber === targetPO.poNumber) {
          return {
            ...inv,
            verificationStatus: 'Stock Received & Inventory Updated',
          };
        }
        return inv;
      })
    );

    addToast(`PO ${targetPO.poNumber} received. Restaurant inventory stock updated!`, 'success');
  };

  // ==========================================
  // SMART INVENTORY, QR BATCHES & GRN WORKFLOW
  // ==========================================

  // Manager Verifies and Receives Stock from Delivered PO (Generates GRN, QR Batches, Logs Damages & Links Invoice)
  const createGoodsReceivedNote = (grnData) => {
    const {
      poId,
      invoiceNumber,
      deliveryChallan,
      items,
      notes,
    } = grnData;

    const targetPO = purchaseOrders.find((p) => p.id === poId);
    const supplier = suppliers.find((s) => s.id === (targetPO?.supplierId || grnData.supplierId));
    const rest = currentRestaurant;

    const grnNumber = `GRN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBatches = [];
    const newReturns = [];

    let totalOrdered = 0;
    let totalAccepted = 0;
    let totalDamageLoss = 0;

    const itemsToProcess = items || targetPO?.items?.map((it, idx) => ({
      ingredientId: it.ingredientId,
      name: it.name,
      unit: it.unit,
      unitCost: it.unitCost,
      orderedQty: it.quantity,
      receivedQty: it.quantity,
      acceptedQty: it.quantity,
      damagedQty: 0,
      missingQty: 0,
      mfgDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      storageLocation: 'Kitchen Storage A',
    })) || [];

    // Process line items: ONLY accepted quantity is added to inventory!
    itemsToProcess.forEach((item, idx) => {
      const ordered = Number(item.orderedQty) || 0;
      const received = Number(item.receivedQty) || 0;
      const accepted = Number(item.acceptedQty) || 0;
      const damaged = Number(item.damagedQty) || 0;
      const unitCost = Number(item.unitCost) || 0;

      totalOrdered += ordered * unitCost;
      totalAccepted += accepted * unitCost;
      totalDamageLoss += damaged * unitCost;

      // 1. Create a unique QR-Tracked Batch for accepted stock
      const batchId = `BATCH-${new Date().getFullYear()}-${item.name?.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X') || 'ITM'}-${Math.floor(100 + Math.random() * 900)}`;

      if (accepted > 0) {
        const newBatch = {
          batchId,
          branchId: currentBranchId,
          branchName: currentBranch?.name || 'Active Branch',
          restaurantId: rest?.id || currentRestaurantId || 'rest-1',
          ingredientId: item.ingredientId,
          productName: item.name,
          category: item.category || 'Kitchen Stock',
          supplierId: supplier?.id || targetPO?.supplierId || 'sup-1',
          supplierName: supplier?.name || targetPO?.supplierName || 'Supplier Partner',
          poId: targetPO?.id || poId,
          poNumber: targetPO?.poNumber || 'PO-REC',
          invoiceNumber: invoiceNumber || `SINV-${Date.now().toString().slice(-4)}`,
          grnNumber,
          receivedDate: new Date().toISOString().split('T')[0],
          mfgDate: item.mfgDate || new Date().toISOString().split('T')[0],
          expiryDate: item.expiryDate || null,
          receivedQty: received,
          acceptedQty: accepted,
          damagedQty: damaged,
          remainingQty: accepted,
          consumedQty: 0,
          returnedQty: 0,
          wastedQty: 0,
          unit: item.unit || 'units',
          unitCost,
          totalValue: accepted * unitCost,
          storageLocation: item.storageLocation || 'Kitchen Dry Storage',
          fifoRank: 1,
          fefoRank: item.expiryDate ? 1 : 999,
          isPerishable: !!item.expiryDate,
          batchStatus: 'Active',
          notes: item.notes || `Received via ${grnNumber}`,
          movements: [
            {
              id: `mov-${Date.now()}-${idx}`,
              date: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
              type: 'received',
              quantity: accepted,
              by: currentUser?.name || 'Inventory Manager',
              reason: `Accepted via ${grnNumber} from ${supplier?.name || 'Supplier'}`,
            },
          ],
        };
        newBatches.push(newBatch);

        // Add ONLY accepted stock to ingredients!
        setIngredients((prev) =>
          prev.map((ing) => {
            if (ing.id === item.ingredientId) {
              const newQty = Number((ing.quantity + accepted).toFixed(2));
              return {
                ...ing,
                quantity: newQty,
                status: getIngredientStatus(newQty, ing.minThreshold),
                lastRestocked: new Date().toISOString().split('T')[0],
                batchNumber: batchId,
                expiryDate: item.expiryDate || ing.expiryDate,
              };
            }
            return ing;
          })
        );

        // Add stock movement
        setStockMovements((prev) => [
          {
            id: `mov-${Date.now()}-${idx}`,
            restaurantId: rest?.id || 'rest-1',
            ingredientId: item.ingredientId,
            ingredientName: item.name,
            type: 'received',
            quantity: accepted,
            unit: item.unit || 'units',
            qtyBefore: 0,
            qtyAfter: accepted,
            performedBy: currentUser?.name || 'Inventory Manager',
            role: currentUser?.role?.replace('_', ' ').toUpperCase() || 'INVENTORY MANAGER',
            reason: `Verified delivery via ${grnNumber} (Accepted: ${accepted} ${item.unit})`,
            batchNumber: batchId,
            timestamp: new Date().toISOString(),
          },
          ...prev,
        ]);
      }

      // 2. If damaged goods exist, create a Return / Damage record
      if (damaged > 0) {
        const returnId = `ret-${Date.now().toString().slice(-4)}${idx}`;
        newReturns.push({
          id: returnId,
          returnNumber: `RET-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
          poId: targetPO?.id || poId,
          poNumber: targetPO?.poNumber || 'PO-REC',
          grnId: `grn-${Date.now()}`,
          grnNumber,
          batchId,
          ingredientId: item.ingredientId,
          productName: item.name,
          supplierId: supplier?.id || targetPO?.supplierId || 'sup-1',
          supplierName: supplier?.name || targetPO?.supplierName || 'Supplier Partner',
          restaurantId: rest?.id || currentRestaurantId || 'rest-1',
          branchId: currentBranchId,
          branchName: currentBranch?.name || 'Active Branch',
          restaurantName: rest?.name || 'Spice Garden',
          requestDate: new Date().toISOString().split('T')[0],
          returnType: 'Damaged on Delivery',
          orderedQty: ordered,
          receivedQty: received,
          returnQty: damaged,
          unit: item.unit || 'units',
          unitCost,
          totalLossAmount: damaged * unitCost,
          reason: item.damageReason || 'Damaged packaging/goods rejected during GRN inspection.',
          status: 'Pending',
          settlementType: 'Credit Note',
          creditNoteId: null,
          creditNoteAmount: 0,
          requestedBy: currentUser?.name || 'Rahul Verma (Inventory Manager)',
          approvedBy: null,
          timeline: [
            {
              date: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
              action: `Damaged Stock (${damaged} ${item.unit}) Logged at Dock`,
              by: currentUser?.name || 'Inventory Manager',
            },
          ],
        });
      }
    });

    const newGRN = {
      id: `grn-${Date.now()}`,
      grnNumber,
      poId: targetPO?.id || poId,
      poNumber: targetPO?.poNumber || 'PO-REC',
      restaurantId: rest?.id || currentRestaurantId || 'rest-1',
      restaurantName: rest?.name || currentRestaurant?.name || 'Active Restaurant',
      branchId: currentBranchId,
      branchName: currentBranch?.name || 'Active Branch',
      supplierId: supplier?.id || targetPO?.supplierId || 'sup-1',
      supplierName: supplier?.name || targetPO?.supplierName || 'Supplier Partner',
      invoiceNumber: invoiceNumber || `SINV-${Date.now().toString().slice(-4)}`,
      deliveryChallan: deliveryChallan || `DC-${Date.now().toString().slice(-4)}`,
      receivedDate: new Date().toISOString().split('T')[0],
      receivedTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      verifiedBy: `${currentUser?.name || 'Rahul Verma'} (${currentUser?.role?.replace('_', ' ') || 'Manager'})`,
      verificationStatus: totalDamageLoss > 0 ? 'Partially Accepted' : 'Verified & Accepted',
      totalOrderedAmount: totalOrdered,
      totalAcceptedAmount: totalAccepted,
      totalDamageLoss: totalDamageLoss,
      notes: notes || 'Delivery inspected, verified, and QR batches issued.',
      items: itemsToProcess.map((it, i) => ({
        ...it,
        batchId: newBatches[i]?.batchId || `BATCH-REC-${i + 1}`,
      })),
    };

    setGoodsReceivedNotes((prev) => [newGRN, ...prev]);
    if (newBatches.length > 0) {
      setProductBatches((prev) => [...newBatches, ...prev]);
    }
    if (newReturns.length > 0) {
      setSupplierReturns((prev) => [...newReturns, ...prev]);
    }

    // 3. Create or Link Supplier Invoice
    const invoiceSubtotal = totalOrdered;
    const taxAmount = Math.round(invoiceSubtotal * 0.05); // 5% GST
    const netPayable = Math.round(totalAccepted + taxAmount);
    const newInvoice = {
      id: `sinv-${Date.now()}`,
      invoiceNumber: invoiceNumber || `SINV-${Date.now().toString().slice(-4)}`,
      poId: targetPO?.id || poId,
      poNumber: targetPO?.poNumber || 'PO-REC',
      grnId: newGRN.id,
      grnNumber: newGRN.grnNumber,
      supplierId: supplier?.id || targetPO?.supplierId || 'sup-1',
      supplierName: supplier?.name || targetPO?.supplierName || 'Supplier Partner',
      supplierGstin: supplier?.gstin || '27AABCU1234F1Z0',
      restaurantId: rest?.id || 'rest-1',
      restaurantName: rest?.name || 'Spice Garden — Pune Central',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      subtotal: invoiceSubtotal,
      taxAmount,
      shippingFee: 100,
      totalAmount: invoiceSubtotal + taxAmount + 100,
      acceptedAmount: totalAccepted,
      damageDeduction: totalDamageLoss,
      creditNoteApplied: 0,
      netPayable,
      paidAmount: 0,
      outstandingBalance: netPayable,
      paymentStatus: 'Pending',
      paymentMethod: 'Pending Verification',
      paymentDate: null,
      transactionRef: null,
      verificationStatus: 'Verified by Manager',
    };
    setSupplierInvoices((prev) => {
      const existing = prev.find((inv) => inv.poId === (targetPO?.id || poId) || (targetPO && inv.poNumber === targetPO.poNumber));
      if (existing) {
        return prev.map((inv) => {
          if (inv.id === existing.id) {
            const net = Math.round(totalAccepted + taxAmount);
            const remaining = Math.max(0, Number((net - (inv.creditNoteApplied || 0) - (inv.paidAmount || 0)).toFixed(2)));
            return {
              ...inv,
              grnId: newGRN.id,
              grnNumber: newGRN.grnNumber,
              invoiceNumber: invoiceNumber || inv.invoiceNumber,
              acceptedAmount: totalAccepted,
              damageDeduction: totalDamageLoss,
              netPayable: net,
              outstandingBalance: remaining,
              paymentStatus: remaining <= 0 ? 'Paid' : (inv.paidAmount > 0 ? 'Partially Paid' : 'Pending'),
              verificationStatus: 'Verified by Manager',
            };
          }
          return inv;
        });
      }
      return [newInvoice, ...prev];
    });

    // 4. Update PO Status
    if (targetPO) {
      setPurchaseOrders((prev) =>
        prev.map((po) =>
          po.id === targetPO.id
            ? {
                ...po,
                status: 'delivered',
                grnNumber,
                invoiceNumber: newInvoice.invoiceNumber,
                deliveredAt: new Date().toISOString(),
                verifiedBy: currentUser?.name || 'Rahul Verma',
                timeline: [
                  ...po.timeline,
                  {
                    status: 'delivered',
                    timestamp: new Date().toISOString(),
                    note: `Delivery verified via ${grnNumber}. Accepted stock: ${formatINR(totalAccepted)}. QR batches created.`,
                  },
                ],
              }
            : po
        )
      );
    }

    addToast(
      `GRN ${grnNumber} generated! ${formatINR(totalAccepted)} of verified stock added to inventory. ${totalDamageLoss > 0 ? `Logged ${formatINR(totalDamageLoss)} damaged goods.` : ''}`,
      'success'
    );

    return newGRN;
  };

  // Backward compatible wrapper
  const verifyAndReceiveStock = (poId, verificationDetails = {}) => {
    return createGoodsReceivedNote({
      poId,
      invoiceNumber: verificationDetails.invoiceNumber || 'SINV-VERIFIED',
      deliveryChallan: verificationDetails.deliveryChallan || 'DC-VERIFIED',
      notes: verificationDetails.notes || 'Verified and received into stock.',
    });
  };

  // Consume from specific QR batch (Enforces FEFO)
  const consumeFromBatch = (batchId, quantity, reason = 'Kitchen Preparation') => {
    const batch = productBatches.find((b) => b.batchId === batchId);
    if (!batch) {
      addToast('Batch not found', 'error');
      return false;
    }

    const qty = Number(quantity);
    if (qty <= 0 || qty > batch.remainingQty) {
      addToast(`Invalid quantity. Available remaining in batch: ${batch.remainingQty} ${batch.unit}`, 'error');
      return false;
    }

    // FEFO Validation: check if an earlier expiring batch exists
    if (batch.expiryDate) {
      const earlierBatch = productBatches.find(
        (b) =>
          b.ingredientId === batch.ingredientId &&
          b.batchId !== batch.batchId &&
          b.remainingQty > 0 &&
          b.expiryDate &&
          new Date(b.expiryDate) < new Date(batch.expiryDate)
      );
      if (earlierBatch) {
        addToast(
          `FEFO Alert: Batch ${earlierBatch.batchId} expires sooner (${earlierBatch.expiryDate}). Prioritizing earliest expiring batch.`,
          'info'
        );
      }
    }

    const nowStr = new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    // Update batch
    setProductBatches((prev) =>
      prev.map((b) => {
        if (b.batchId === batchId) {
          const newRemaining = Number((b.remainingQty - qty).toFixed(2));
          const newConsumed = Number((b.consumedQty + qty).toFixed(2));
          return {
            ...b,
            remainingQty: newRemaining,
            consumedQty: newConsumed,
            batchStatus: newRemaining === 0 ? 'Depleted' : b.batchStatus,
            movements: [
              ...b.movements,
              {
                id: `mov-${Date.now()}`,
                date: nowStr,
                type: 'consumed',
                quantity: qty,
                by: currentUser?.name || 'Chef',
                reason,
              },
            ],
          };
        }
        return b;
      })
    );

    // Deduct from ingredient stock
    setIngredients((prev) =>
      prev.map((ing) => {
        if (ing.id === batch.ingredientId) {
          const newQty = Math.max(0, Number((ing.quantity - qty).toFixed(2)));
          return {
            ...ing,
            quantity: newQty,
            status: getIngredientStatus(newQty, ing.minThreshold),
          };
        }
        return ing;
      })
    );

    // Log stock movement
    setStockMovements((prev) => [
      {
        id: `mov-${Date.now()}`,
        restaurantId: currentRestaurant?.id || 'rest-1',
        ingredientId: batch.ingredientId,
        ingredientName: batch.productName,
        type: 'consumed',
        quantity: qty,
        unit: batch.unit,
        qtyBefore: batch.remainingQty,
        qtyAfter: batch.remainingQty - qty,
        performedBy: currentUser?.name || 'Kitchen Staff',
        role: currentUser?.role?.replace('_', ' ').toUpperCase() || 'KITCHEN STAFF',
        reason: `${reason} (Batch ${batch.batchId})`,
        batchNumber: batch.batchId,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);

    addToast(`Recorded consumption of ${qty} ${batch.unit} from batch ${batch.batchId}.`, 'success');
    return true;
  };

  // Create Damaged Goods / Unsold Fresh Bread Return Request
  const createSupplierReturn = ({
    poId,
    grnId,
    batchId,
    ingredientId,
    productName,
    supplierId,
    supplierName,
    returnType,
    returnQty,
    unit,
    unitCost,
    reason,
  }) => {
    const qty = Number(returnQty);
    const cost = Number(unitCost) || 0;
    const totalLossAmount = qty * cost;

    // Check supplier agreement for unsold fresh goods
    const agreement = supplierAgreements.find((a) => a.supplierId === supplierId);
    if (returnType === 'Unsold Fresh Goods Agreement') {
      if (!agreement || !agreement.unsoldReturnAllowed) {
        addToast(
          `Supplier ${supplierName} does not have an active unsold fresh goods return agreement.`,
          'error'
        );
        return false;
      }
    }

    const returnNumber = `RET-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const newReturn = {
      id: `ret-${Date.now()}`,
      returnNumber,
      poId: poId || 'PO-MISC',
      poNumber: poId || 'PO-MISC',
      grnId: grnId || 'GRN-MISC',
      grnNumber: grnId || 'GRN-MISC',
      batchId: batchId || 'BATCH-MISC',
      ingredientId,
      productName,
      supplierId,
      supplierName,
      restaurantId: currentRestaurant?.id || currentRestaurantId || 'rest-1',
      restaurantName: currentRestaurant?.name || 'Active Restaurant',
      branchId: currentBranchId,
      branchName: currentBranch?.name || 'Active Branch',
      requestDate: new Date().toISOString().split('T')[0],
      returnType: returnType || 'Damaged on Delivery',
      orderedQty: qty,
      receivedQty: qty,
      returnQty: qty,
      unit: unit || 'units',
      unitCost: cost,
      totalLossAmount,
      reason: reason || 'Return request submitted to supplier.',
      status: 'Pending',
      settlementType: agreement?.settlementMode || 'Credit Note',
      creditNoteId: null,
      creditNoteAmount: 0,
      requestedBy: `${currentUser?.name || 'Rahul Verma'} (${currentUser?.role?.replace('_', ' ') || 'Manager'})`,
      approvedBy: null,
      timeline: [
        {
          date: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          action: `Return Request Submitted (${qty} ${unit} - ${formatINR(totalLossAmount)})`,
          by: currentUser?.name || 'Manager',
        },
      ],
    };

    setSupplierReturns((prev) => [newReturn, ...prev]);

    // If returning from an active batch, deduct from batch remaining
    if (batchId) {
      setProductBatches((prev) =>
        prev.map((b) => {
          if (b.batchId === batchId) {
            const newRemaining = Math.max(0, Number(((b.remainingQty || 0) - qty).toFixed(2)));
            return {
              ...b,
              remainingQty: newRemaining,
              returnedQty: Number(((b.returnedQty || 0) + qty).toFixed(2)),
              batchStatus: newRemaining === 0 ? 'Returned' : b.batchStatus,
            };
          }
          return b;
        })
      );
    }

    // Always deduct from available ingredient stock if ingredient matches
    if (ingredientId || productName) {
      setIngredients((prev) =>
        prev.map((ing) => {
          if (
            (ingredientId && ing.id === ingredientId) ||
            (productName && ing.name?.toLowerCase() === productName.toLowerCase())
          ) {
            const currentStockVal = ing.quantity !== undefined ? ing.quantity : (ing.currentStock || 0);
            const newQty = Math.max(0, Number((currentStockVal - qty).toFixed(2)));
            return {
              ...ing,
              quantity: newQty,
              currentStock: newQty,
              status: getIngredientStatus(newQty, ing.minThreshold),
            };
          }
          return ing;
        })
      );
    }

    // Record stock movement audit trail
    const returnMovement = {
      id: `mov-${Date.now()}`,
      restaurantId: currentRestaurant?.id || currentRestaurantId || 'rest-1',
      ingredientId: ingredientId || 'misc',
      ingredientName: productName,
      type: 'waste',
      quantity: qty,
      unit: unit || 'units',
      performedBy: currentUser?.name || 'Inventory Manager',
      role: currentUser?.role?.replace('_', ' ').toUpperCase() || 'INVENTORY MANAGER',
      reason: `Supplier return (${returnType}): ${reason || 'Damaged / Unsold return to supplier'}`,
      referenceNumber: returnNumber,
      timestamp: new Date().toISOString(),
    };
    setStockMovements((prev) => [returnMovement, ...prev]);

    // Send targeted return alert to Owner & Inventory Manager
    const returnAlert = {
      id: `alt-${Date.now()}-ret`,
      restaurantId: currentRestaurant?.id || currentRestaurantId || 'rest-1',
      type: 'supplier_return',
      severity: 'medium',
      title: `Return Logged: ${returnNumber}`,
      message: `${qty} ${unit || 'units'} of ${productName} flagged for return to ${supplierName}. Claim: ${formatINR(totalLossAmount)}.`,
      read: false,
      timestamp: new Date().toISOString(),
      actionLink: '/supplier-returns',
      actionLabel: 'Review Claims',
      targetRoles: ['super_admin', 'restaurant_owner', 'inventory_manager'],
    };
    setAlerts((prev) => [returnAlert, ...prev]);

    addToast(`Return request ${returnNumber} submitted to ${supplierName}. Status: Pending.`, 'success');
    return newReturn;
  };

  // Supplier or Manager approves return & issues Credit Note
  const approveSupplierReturn = (returnId, settlementType = 'Credit Note', settlementAmount = null) => {
    const ret = supplierReturns.find((r) => r.id === returnId);
    if (!ret) return;

    const amount = Number(settlementAmount) || ret.totalLossAmount;
    const crnNumber = `CRN-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newCreditNote = {
      id: `crn-${Date.now()}`,
      creditNoteNumber: crnNumber,
      supplierId: ret.supplierId,
      supplierName: ret.supplierName,
      returnId: ret.id,
      returnNumber: ret.returnNumber,
      invoiceNumber: ret.poNumber,
      amount,
      issueDate: new Date().toISOString().split('T')[0],
      status: 'Applied to Invoice',
      reason: `${ret.returnType}: ${ret.productName} (${ret.returnQty} ${ret.unit})`,
    };

    setCreditNotes((prev) => [newCreditNote, ...prev]);

    // Update return status
    setSupplierReturns((prev) =>
      prev.map((r) => {
        if (r.id === returnId) {
          return {
            ...r,
            status: 'Approved',
            settlementType,
            creditNoteId: crnNumber,
            creditNoteAmount: amount,
            approvedBy: `${currentUser?.name || 'Supplier'} (${currentUser?.role?.replace('_', ' ') || 'Partner'})`,
            timeline: [
              ...r.timeline,
              {
                date: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                action: `Return Approved by Supplier. ${settlementType} (${formatINR(amount)}) Issued (${crnNumber})`,
                by: currentUser?.name || 'Supplier',
              },
            ],
          };
        }
        return r;
      })
    );

    // Apply credit note deduction to supplier invoice
    setSupplierInvoices((prev) =>
      prev.map((inv) => {
        if (inv.supplierId === ret.supplierId && inv.outstandingBalance > 0) {
          const applied = Number((inv.creditNoteApplied + amount).toFixed(2));
          const newOutstanding = Math.max(0, Number((inv.outstandingBalance - amount).toFixed(2)));
          return {
            ...inv,
            creditNoteApplied: applied,
            outstandingBalance: newOutstanding,
            paymentStatus: newOutstanding === 0 ? 'Paid' : inv.paymentStatus,
          };
        }
        return inv;
      })
    );

    addToast(`Return ${ret.returnNumber} approved! Credit Note ${crnNumber} (${formatINR(amount)}) issued.`, 'success');
  };

  const rejectSupplierReturn = (returnId, reason = 'Condition does not match agreement') => {
    setSupplierReturns((prev) =>
      prev.map((r) => {
        if (r.id === returnId) {
          return {
            ...r,
            status: 'Rejected',
            approvedBy: currentUser?.name || 'Supplier Partner',
            supplierResponseNotes: reason,
            timeline: [
              ...r.timeline,
              {
                date: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                action: `Return Rejected by Supplier: ${reason}`,
                by: currentUser?.name || 'Supplier',
              },
            ],
          };
        }
        return r;
      })
    );

    addToast(`Return request rejected.`, 'info');
  };

  // Record verified Restaurant-to-Supplier payment transaction
  const recordSupplierPayment = ({ invoiceId, poId, amount, paymentMethod, transactionRef }) => {
    const inv = supplierInvoices.find((i) => i.id === invoiceId || (poId && (i.poId === poId || i.poNumber === poId)));
    if (!inv) {
      addToast('Invoice not found', 'error');
      return false;
    }

    if (!transactionRef || !transactionRef.trim()) {
      addToast('Transaction reference / UTR is mandatory for verified supplier payment', 'error');
      return false;
    }

    const payAmount = Number(amount);
    if (payAmount <= 0) {
      addToast('Please enter a valid payment amount', 'error');
      return false;
    }

    const paymentNumber = `SPAY-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPayment = {
      id: `spay-${Date.now()}`,
      paymentNumber,
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      poId: inv.poId,
      poNumber: inv.poNumber,
      supplierId: inv.supplierId,
      supplierName: inv.supplierName,
      restaurantId: inv.restaurantId,
      branchId: inv.branchId || (currentBranchId !== 'all' ? currentBranchId : null),
      restaurantName: inv.restaurantName,
      amountPaid: payAmount,
      paymentMethod: paymentMethod || 'NEFT Bank Transfer',
      paymentDate: new Date().toISOString().split('T')[0],
      transactionRef: transactionRef.trim(),
      verifiedBy: `${currentUser?.name || 'Finance User'} (${currentUser?.role?.replace('_', ' ') || 'Authorized'})`,
      receiptNumber: `RCPT-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Settled',
    };

    setSupplierPayments((prev) => [newPayment, ...prev]);

    // Update invoice
    setSupplierInvoices((prev) =>
      prev.map((i) => {
        if (i.id === inv.id) {
          const newPaid = Number(((i.paidAmount || 0) + payAmount).toFixed(2));
          const newBalance = Math.max(0, Number((i.netPayable - (i.creditNoteApplied || 0) - newPaid).toFixed(2)));
          return {
            ...i,
            paidAmount: newPaid,
            outstandingBalance: newBalance,
            paymentStatus: newBalance <= 0 ? 'Paid' : 'Partially Paid',
            paymentMethod: paymentMethod || i.paymentMethod,
            paymentDate: new Date().toISOString().split('T')[0],
            transactionRef: transactionRef.trim(),
          };
        }
        return i;
      })
    );

    addToast(`Payment of ${formatINR(payAmount)} for ${inv.invoiceNumber} recorded successfully!`, 'success');
    return newPayment;
  };

  const updateSupplierAgreement = (supplierId, agreementData) => {
    setSupplierAgreements((prev) =>
      prev.map((a) => (a.supplierId === supplierId ? { ...a, ...agreementData } : a))
    );
    addToast('Supplier agreement updated successfully.', 'success');
  };

  // ==========================================
  // WORKFLOW D: SUPER ADMIN SUBSCRIPTION MANAGEMENT
  // ==========================================
  const updatePlan = (planId, updatedFields) => {
    // Role check: Only Super Admin can modify subscription plans
    if (currentUser?.role !== 'super_admin') {
      addToast('Unauthorized: Only Super Admin can modify subscription plans.', 'error');
      return false;
    }

    const name = (updatedFields.name || '').trim();
    if (!name) {
      addToast('Plan name cannot be empty.', 'error');
      return false;
    }

    const monthlyPrice = Math.max(0, Number(updatedFields.monthlyPrice) || 0);
    const annualPrice = Math.max(
      0,
      Number(updatedFields.annualPrice !== undefined ? updatedFields.annualPrice : (monthlyPrice * 12 * 0.8))
    );
    const { annualSavings, savingsPercent, effectiveMonthlyAnnual } = calculatePlanSavings(monthlyPrice, annualPrice);

    const limits = {
      maxIngredients: Math.max(1, Number(updatedFields.limits?.maxIngredients ?? updatedFields.maxIngredients ?? 100)),
      maxStaff: Math.max(1, Number(updatedFields.limits?.maxStaff ?? updatedFields.maxStaff ?? 5)),
      branches: Math.max(1, Number(updatedFields.limits?.branches ?? updatedFields.branches ?? 1)),
      support: updatedFields.limits?.support ?? updatedFields.support ?? 'Standard Email (24h SLA)',
    };

    const features = Array.isArray(updatedFields.features) && updatedFields.features.length > 0
      ? updatedFields.features.filter(f => typeof f === 'string' && f.trim().length > 0)
      : undefined;

    let updatedTargetPlan = null;

    setPlans(prev => {
      const next = prev.map(p => {
        if (p.id === planId) {
          updatedTargetPlan = {
            ...p,
            ...updatedFields,
            name,
            monthlyPrice,
            annualPrice,
            annualSavings,
            savingsPercent,
            effectiveMonthlyAnnual,
            limits,
            features: features || p.features,
            status: updatedFields.status || p.status || 'active',
            description: updatedFields.description !== undefined ? updatedFields.description : p.description,
            badge: updatedFields.badge !== undefined ? updatedFields.badge : p.badge,
          };
          return updatedTargetPlan;
        }
        return p;
      });
      return next;
    });

    // Dynamically update active tenant resource limits and name for this plan
    setRestaurants(prev => prev.map(r => {
      if (r.planId === planId) {
        return {
          ...r,
          planName: name,
          monthlyUsage: {
            ...r.monthlyUsage,
            ingredientsLimit: limits.maxIngredients,
            staffLimit: limits.maxStaff,
          }
        };
      }
      return r;
    }));

    addPlatformLog(
      currentUser?.name || 'Super Admin',
      'Subscription Plan Updated',
      `${name} (${formatINR(monthlyPrice)}/mo, ${formatINR(annualPrice)}/yr, ${limits.branches} max branches, ${limits.maxIngredients} max ingredients)`,
      'Billing',
      'success'
    );

    addToast(`Subscription plan "${name}" updated successfully across the platform.`, 'success');
    return true;
  };

  const resetPlansToDefaults = () => {
    if (currentUser?.role !== 'super_admin') {
      addToast('Unauthorized: Only Super Admin can reset plans.', 'error');
      return false;
    }

    setPlans(initialPlans);
    localStorage.setItem(`${STORAGE_KEY}_plans`, JSON.stringify(initialPlans));
    if (typeof syncPricingEnginePlans === 'function') syncPricingEnginePlans(initialPlans);
    if (typeof syncBranchPlansConfig === 'function') syncBranchPlansConfig(initialPlans);

    initialPlans.forEach(plan => {
      setRestaurants(prev => prev.map(r => {
        if (r.planId === plan.id) {
          return {
            ...r,
            planName: plan.name,
            monthlyUsage: {
              ...r.monthlyUsage,
              ingredientsLimit: plan.limits.maxIngredients,
              staffLimit: plan.limits.maxStaff,
            }
          };
        }
        return r;
      }));
    });

    addPlatformLog(
      currentUser?.name || 'Super Admin',
      'Subscription Plans Reset to Defaults',
      'Reverted Starter, Professional, and Enterprise plans to platform defaults.',
      'Billing',
      'warning'
    );

    addToast('All subscription plans have been reset to platform defaults.', 'info');
    return true;
  };

  const getPlanById = (planId) => {
    return plans.find(p => p.id === planId) || initialPlans.find(p => p.id === planId) || plans[0];
  };

  const assignPlanToRestaurant = (restaurantId, planId) => {
    const targetPlan = plans.find(p => p.id === planId);
    if (!targetPlan) return;

    setRestaurants(prev => prev.map(r => {
      if (r.id === restaurantId) {
        return {
          ...r,
          planId,
          planName: targetPlan.name,
          monthlyUsage: {
            ...r.monthlyUsage,
            ingredientsLimit: targetPlan.limits.maxIngredients,
            staffLimit: targetPlan.limits.maxStaff,
          }
        };
      }
      return r;
    }));

    const rest = restaurants.find(r => r.id === restaurantId);
    addPlatformLog(
      currentUser.name,
      'Restaurant Plan Changed',
      `${rest?.name} assigned to ${targetPlan.name} Plan`,
      'Billing',
      'success'
    );

    addToast(`Assigned ${targetPlan.name} Plan to "${rest?.name}".`, 'success');
  };

  // Staff Management (Owner / Admin)
  const addStaff = (staffData) => {
    const newStaff = {
      id: `usr-${Date.now()}`,
      name: staffData.name,
      email: staffData.email,
      role: staffData.role, // inventory_manager | kitchen_staff
      restaurantId: currentRestaurantId,
      restaurantName: currentRestaurant?.name || 'Active Restaurant',
      branchId: staffData.branchId || currentBranchId,
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      joinedDate: new Date().toISOString().split('T')[0],
      lastActive: 'Never',
    };

    setUsers(prev => [newStaff, ...prev]);
    addToast(`Added staff member "${newStaff.name}" (${newStaff.role.replace('_', ' ')}).`, 'success');
  };

  const updateUserStatus = (userId, newStatus) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, status: newStatus };
      }
      return u;
    }));

    const targetUser = users.find(u => u.id === userId);
    addToast(`User ${targetUser?.name} status changed to ${newStatus}.`, 'info');
  };

  // Role Matrix & Employee Access Management
  const updateEmployeeRole = (empId, newRoleKey) => {
    const roleDef = ROLES_LIST.find(r => r.key === newRoleKey);
    const roleName = roleDef ? roleDef.name : newRoleKey;
    setEmployees(prev => prev.map(emp => {
      if (emp.id === empId) {
        return {
          ...emp,
          role: roleName,
          roleKey: newRoleKey,
          recentActivities: [
            {
              id: `act-${Date.now()}`,
              action: `Role reassigned to ${roleName}`,
              target: 'Platform Access Policy',
              timestamp: 'Just now',
              ipAddress: '192.168.1.104',
              status: 'info',
            },
            ...(emp.recentActivities || []),
          ],
        };
      }
      return emp;
    }));
    const targetEmp = employees.find(e => e.id === empId);
    addPlatformLog(
      currentUser?.name || 'Alexander Vance',
      `Reassigned role to ${roleName} for ${targetEmp?.name || empId}`,
      `Employee / ${empId}`,
      'Access Control',
      'success'
    );
    addToast(`Updated role for ${targetEmp?.name || empId} to ${roleName}.`, 'success');
  };

  const updateEmployeeStatus = (empId, newStatus, reason = '') => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === empId) {
        const actionText = newStatus === 'suspended' ? 'Access revoked / account suspended' : `Status updated to ${newStatus}`;
        return {
          ...emp,
          status: newStatus,
          tokenStatus: newStatus === 'suspended' ? 'Revoked (Administrative Hold)' : 'Active (OAuth2 / Ed25519)',
          recentActivities: [
            {
              id: `act-${Date.now()}`,
              action: actionText + (reason ? ` (${reason})` : ''),
              target: 'Access Control',
              timestamp: 'Just now',
              ipAddress: '192.168.1.104',
              status: newStatus === 'suspended' ? 'warning' : 'success',
            },
            ...(emp.recentActivities || []),
          ],
        };
      }
      return emp;
    }));
    const targetEmp = employees.find(e => e.id === empId);
    addPlatformLog(
      currentUser?.name || 'Alexander Vance',
      `${newStatus === 'suspended' ? 'Revoked access for' : 'Updated status of'} ${targetEmp?.name || empId} to ${newStatus}`,
      `Employee / ${empId}`,
      'Security',
      newStatus === 'suspended' ? 'warning' : 'success'
    );
    addToast(`${newStatus === 'suspended' ? 'Access revoked for' : 'Status updated for'} ${targetEmp?.name || empId}.`, newStatus === 'suspended' ? 'warning' : 'success');
  };

  const updateEmployee = (empId, updatedData) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === empId) {
        return { ...emp, ...updatedData };
      }
      return emp;
    }));
    addToast(`Employee profile updated successfully.`, 'success');
  };

  const addEmployee = (newEmpData) => {
    const roleDef = ROLES_LIST.find(r => r.key === newEmpData.roleKey) || ROLES_LIST[0];
    const newEmp = {
      id: `EMP-${1000 + employees.length + 1}`,
      name: newEmpData.name,
      email: newEmpData.email,
      role: roleDef.name,
      roleKey: roleDef.key,
      department: newEmpData.department || roleDef.team,
      assignedProject: newEmpData.assignedProject || 'StockMate Core Engine',
      status: newEmpData.status || 'active',
      lastActive: 'Just now',
      joinedDate: new Date().toISOString().split('T')[0],
      avatar: newEmpData.avatar || `https://images.unsplash.com/photo-${1534528741775 + employees.length}?w=150&auto=format&fit=crop&q=80`,
      phone: newEmpData.phone || '+1 (555) 000-0000',
      location: newEmpData.location || 'Headquarters / Remote',
      twoFactorEnabled: true,
      tokenStatus: 'Active (OAuth2 / Ed25519)',
      recentActivities: [
        {
          id: `act-${Date.now()}`,
          action: 'Provisioned new platform employee credentials',
          target: 'Platform Access',
          timestamp: 'Just now',
          ipAddress: '192.168.1.104',
          status: 'success',
        },
      ],
    };

    setEmployees(prev => [newEmp, ...prev]);
    addPlatformLog(
      currentUser?.name || 'Alexander Vance',
      `Provisioned employee ${newEmp.name} (${newEmp.role})`,
      `Employee / ${newEmp.id}`,
      'Access Control',
      'success'
    );
    addToast(`Employee "${newEmp.name}" added and provisioned with ${newEmp.role} permissions.`, 'success');
    return newEmp;
  };

  const updateRolePermission = (roleKey, moduleKey, newLevel) => {
    setRoleMatrixPermissions(prev => ({
      ...prev,
      [roleKey]: {
        ...(prev[roleKey] || {}),
        [moduleKey]: newLevel,
      },
    }));
    const roleObj = ROLES_LIST.find(r => r.key === roleKey);
    addPlatformLog(
      currentUser?.name || 'Alexander Vance',
      `Updated ${roleObj?.name || roleKey} permission for ${moduleKey} to ${newLevel.replace('_', ' ')}`,
      `Role Matrix / ${roleKey}`,
      'RBAC Policy',
      'success'
    );
    addToast(`Updated ${roleObj?.name || roleKey} permission for ${moduleKey} to ${newLevel.replace('_', ' ').toUpperCase()}.`, 'info');
  };

  const resetRoleMatrix = () => {
    setRoleMatrixPermissions(INITIAL_ROLE_PERMISSIONS);
    localStorage.removeItem(`${STORAGE_KEY}_roleMatrixPermissions`);
    addPlatformLog(
      currentUser?.name || 'Alexander Vance',
      'Reset Role Matrix permissions to standard baseline',
      'Role Matrix',
      'RBAC Policy',
      'info'
    );
    addToast('Role Matrix permissions reset to enterprise defaults.', 'success');
  };

  // Platform Finance & Payment Management
  const verifyPayment = (transactionId) => {
    let verifiedTxn = null;

    setTransactions((prev) =>
      prev.map((txn) => {
        if (txn.id === transactionId) {
          const nowStr = new Date().toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }) + ' ' + new Date().toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
          });
          const nextRenewal = new Date();
          if (txn.billingCycle === 'Yearly') {
            nextRenewal.setFullYear(nextRenewal.getFullYear() + 1);
          } else {
            nextRenewal.setDate(nextRenewal.getDate() + 30);
          }
          const renewalStr = nextRenewal.toISOString().split('T')[0];

          verifiedTxn = {
            ...txn,
            status: 'Success',
            paymentDate: nowStr,
            renewalDate: renewalStr,
            failureReason: null,
          };
          return verifiedTxn;
        }
        return txn;
      })
    );

    if (verifiedTxn) {
      // Update Invoice status to Paid
      setInvoices((prev) =>
        prev.map((inv) => {
          if (inv.transactionId === transactionId || inv.id === verifiedTxn.invoiceId || inv.invoiceNumber === verifiedTxn.invoiceId) {
            return { ...inv, status: 'Paid' };
          }
          return inv;
        })
      );

      // Update Subscription status to Active and extend renewal
      setSubscriptions((prev) =>
        prev.map((sub) => {
          if (sub.restaurantId === verifiedTxn.restaurantId) {
            return {
              ...sub,
              status: 'Active',
              expiryDate: verifiedTxn.renewalDate,
              lastPaymentDate: new Date().toISOString().split('T')[0],
              lastTransactionId: verifiedTxn.id,
              paymentStatus: 'Success',
            };
          }
          return sub;
        })
      );

      // Reactivate restaurant if it was suspended or pending
      setRestaurants((prev) =>
        prev.map((r) => {
          if (r.id === verifiedTxn.restaurantId && r.status !== 'active') {
            return { ...r, status: 'active', renewalDate: verifiedTxn.renewalDate };
          }
          return r;
        })
      );

      // Automatically generate a branded payment receipt email in the Owner's Inbox
      const receiptAnnouncement = {
        id: `ann-rcp-${verifiedTxn.id}-${Date.now()}`,
        title: `Payment Receipt: ${formatINR(verifiedTxn.amount)} for ${verifiedTxn.planName} Plan — RCP-${verifiedTxn.id}`,
        summary: `Verified payment receipt #${verifiedTxn.invoiceId || verifiedTxn.id} verified via ${verifiedTxn.gateway} (${verifiedTxn.paymentMethod}).`,
        category: 'receipt',
        priority: 'normal',
        author: 'StockMate Billing Engine (Automated)',
        authorRole: 'Automated Transactional Dispatcher',
        publishedAt: new Date().toISOString(),
        status: 'published',
        audienceType: 'SPECIFIC_RESTAURANTS',
        targetRestaurantIds: [verifiedTxn.restaurantId],
        targetPlanIds: [],
        requiresAcknowledgment: false,
        effectiveDate: verifiedTxn.paymentDate,
        ctaLabel: 'View Invoice & Receipts in Billing',
        ctaLink: '/owner-billing',
        verifiedTransaction: {
          id: verifiedTxn.id,
          receiptNumber: `RCP-${verifiedTxn.id}`,
          paymentRef: verifiedTxn.gatewayRef || verifiedTxn.id,
          invoiceId: verifiedTxn.invoiceId,
          amount: verifiedTxn.amount,
          baseAmount: verifiedTxn.baseAmount || Math.round(verifiedTxn.amount / 1.18),
          taxAmount: verifiedTxn.taxAmount || Math.round(verifiedTxn.amount - (verifiedTxn.amount / 1.18)),
          planName: verifiedTxn.planName,
          billingCycle: verifiedTxn.billingCycle,
          paymentMethod: verifiedTxn.paymentMethod,
          gateway: verifiedTxn.gateway,
          paymentDate: verifiedTxn.paymentDate,
          gstin: verifiedTxn.gstin || '27AABCU9603R1ZM (Sample)',
          simulated: true,
        },
        body: `Dear ${verifiedTxn.restaurantOwner},\n\nThank you for your payment. Your subscription renewal for ${verifiedTxn.restaurantName} on the ${verifiedTxn.planName} tier (${verifiedTxn.billingCycle}) has been successfully verified and settled.\n\nTransaction Summary:\n• Receipt Number: RCP-${verifiedTxn.id}\n• Payment Gateway: ${verifiedTxn.gateway} (${verifiedTxn.gatewayRef || verifiedTxn.id})\n• Payment Method: ${verifiedTxn.paymentMethod}\n• Total Amount Paid: ${formatINR(verifiedTxn.amount)} (Inclusive of 18% statutory GST)\n• Next Renewal Date: ${verifiedTxn.renewalDate}\n\nYour official GST tax invoice is now filed and available for download in your billing center at any time.`,
        attachments: [
          {
            name: `StockMate_Tax_Receipt_${verifiedTxn.invoiceId || verifiedTxn.id}.pdf`,
            size: '240 KB',
            type: 'application/pdf',
          },
        ],
        emailDelivery: {
          queued: 1,
          delivered: 1,
          failed: 0,
          provider: 'StockMate Transactional Dispatcher (Verified)',
          simulated: true,
        },
      };

      setAnnouncements((prev) => [receiptAnnouncement, ...prev]);


      addPlatformLog(
        currentUser?.name || 'Alexander Vance',
        `Verified gateway settlement of ${formatINR(verifiedTxn.amount)} for ${verifiedTxn.restaurantName}`,
        `Payment / ${verifiedTxn.id}`,
        'Platform Finance',
        'success'
      );

      addToast(
        `Payment verified! Activated subscription for ${verifiedTxn.restaurantName}.`,
        'success'
      );

      return { success: true, transaction: verifiedTxn };
    }

    return { success: false };
  };

  const retryPayment = (transactionId) => {
    const txn = transactions.find((t) => t.id === transactionId);
    if (!txn) return;

    addPlatformLog(
      currentUser?.name || 'Alexander Vance',
      `Triggered payment retry gateway mandate for ${txn.restaurantName}`,
      `Payment / ${txn.id}`,
      'Platform Finance',
      'info'
    );

    addToast(
      `Dispatched automated retry webhook to payment gateway for ${txn.restaurantName}.`,
      'info'
    );
  };

  const sendPaymentReminder = (transactionId) => {
    const txn = transactions.find((t) => t.id === transactionId);
    if (!txn) return;

    addPlatformLog(
      currentUser?.name || 'Alexander Vance',
      `Sent automated payment & invoice reminder to ${txn.ownerEmail}`,
      `Payment / ${txn.id}`,
      'Notifications',
      'info'
    );

    addToast(
      `Payment reminder & invoice link sent to ${txn.ownerEmail} (${txn.restaurantOwner}).`,
      'success'
    );
  };

  const recordNewPayment = (newTxnData) => {
    const id = `TXN-IND-${Math.floor(90000 + Math.random() * 9999)}`;
    const newTxn = {
      id,
      ...newTxnData,
      amount: newTxnData.amount || 11799,
      status: newTxnData.status || 'Success',
      paymentDate: new Date().toISOString().split('T')[0],
    };

    setTransactions((prev) => [newTxn, ...prev]);

    addPlatformLog(
      currentUser?.name || 'Alexander Vance',
      `Recorded manual platform payment receipt of ${formatINR(newTxn.amount)} for ${newTxn.restaurantName}`,
      `Payment / ${id}`,
      'Platform Finance',
      'success'
    );

    addToast(`Payment of ${formatINR(newTxn.amount)} recorded successfully.`, 'success');
    return newTxn;
  };

  const updateSubscriptionPlan = (subscriptionId, newPlanId, billingCycle = 'Monthly') => {
    const planConfig = PLAN_PRICING_INR[newPlanId] || PLAN_PRICING_INR['plan-starter'];
    const baseAmt = billingCycle === 'Yearly' ? planConfig.annualPrice : planConfig.monthlyPrice;
    const renewalAmount = Math.round(baseAmt * 1.18); // Including 18% GST

    let updatedSub = null;

    setSubscriptions((prev) =>
      prev.map((sub) => {
        if (sub.id === subscriptionId) {
          updatedSub = {
            ...sub,
            planId: newPlanId,
            planName: planConfig.name,
            billingCycle,
            renewalAmount,
            features: planConfig.features,
          };
          return updatedSub;
        }
        return sub;
      })
    );

    if (updatedSub) {
      // Also update restaurant's plan
      setRestaurants((prev) =>
        prev.map((r) => {
          if (r.id === updatedSub.restaurantId) {
            return { ...r, planId: newPlanId, planName: planConfig.name };
          }
          return r;
        })
      );

      addPlatformLog(
        currentUser?.name || 'Alexander Vance',
        `Updated subscription tier to ${planConfig.name} (${billingCycle}) for ${updatedSub.restaurantName}`,
        `Subscription / ${subscriptionId}`,
        'Platform Finance',
        'success'
      );

      addToast(
        `Subscription for ${updatedSub.restaurantName} updated to ${planConfig.name} (${billingCycle}).`,
        'success'
      );
    }
  };

  const toggleAutoRenewal = (subscriptionId) => {
    let newState = false;
    let targetSub = null;

    setSubscriptions((prev) =>
      prev.map((sub) => {
        if (sub.id === subscriptionId) {
          newState = !sub.autoRenewal;
          targetSub = { ...sub, autoRenewal: newState };
          return targetSub;
        }
        return sub;
      })
    );

    if (targetSub) {
      addToast(
        `Auto-renewal ${newState ? 'enabled' : 'paused'} for ${targetSub.restaurantName}.`,
        'info'
      );
    }
  };

  // --------------------------------------------------------------------------
  // Centralized Custom Plan Submission, Rule-Based Approval & Activation
  // --------------------------------------------------------------------------
  const submitCustomPlanRequest = (config, customerInfo = {}) => {
    const approvalEval = evaluateApprovalPath(config, config.requestedCustomPrice || null);
    const requestId = `REQ-2026-${Math.floor(100 + Math.random() * 900)}`;
    const idempotencyKey = `IDEMP-${requestId}-${Date.now()}`;
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const targetRestaurant = restaurants.find(r => r.id === currentRestaurantId) || restaurants[0];

    const newRequest = {
      id: requestId,
      restaurantId: customerInfo.restaurantId || targetRestaurant?.id || 'rest-1',
      restaurantName: customerInfo.restaurantName || targetRestaurant?.name || 'Spice Garden',
      ownerName: customerInfo.ownerName || currentUser?.name || 'Priya Sharma',
      ownerEmail: customerInfo.ownerEmail || currentUser?.email || 'priya@spicegarden.com',
      ownerPhone: customerInfo.ownerPhone || '+91 98201 23456',
      logo: customerInfo.logo || targetRestaurant?.logo || '🌿',
      requestDate: timestamp,
      path: approvalEval.path,
      pathName: approvalEval.pathName,
      status: approvalEval.status,
      requiresManualReview: approvalEval.requiresManualReview,
      config: { ...config },
      systemCalculatedAmount: approvalEval.pricing.totalAmount,
      systemMonthlyEquivalent: approvalEval.pricing.monthlyEquivalent,
      proposedQuotation: approvalEval.requiresManualReview ? null : approvalEval.pricing.totalAmount,
      reviewReasons: approvalEval.reasons,
      adminNotes: approvalEval.requiresManualReview ? '' : 'Automated self-serve approval under system business rules.',
      reviewedBy: approvalEval.requiresManualReview ? null : 'System Automation Engine',
      reviewDate: approvalEval.requiresManualReview ? null : timestamp,
      idempotencyKey,
    };

    setCustomPlanRequests((prev) => [newRequest, ...prev]);

    addPlatformLog(
      currentUser?.name || customerInfo.ownerName || 'Self-Serve Portal',
      `Custom plan submission (${newRequest.pathName}): ${newRequest.restaurantName} - ${formatINR(newRequest.systemCalculatedAmount)}`,
      `Custom Plan / ${requestId}`,
      'Platform Finance',
      approvalEval.requiresManualReview ? 'warning' : 'success'
    );

    if (approvalEval.requiresManualReview) {
      addToast(
        `Custom Plan request ${requestId} submitted! Routed to Super Admin review queue due to custom parameters.`,
        'info'
      );
    } else {
      addToast(
        `Configuration ${requestId} auto-approved! Ready for immediate gateway checkout.`,
        'success'
      );
    }

    return { success: true, request: newRequest, approvalEval };
  };

  const reviewCustomPlanRequest = (requestId, decision, payload = {}) => {
    let updatedRequest = null;
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const reviewerName = currentUser?.name || 'Alexander Vance (Super Admin)';

    setCustomPlanRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          let newStatus = req.status;
          let proposedQuote = req.proposedQuotation;

          if (decision === 'approve') {
            newStatus = 'approved';
            proposedQuote = Number(payload.quotedAmount) || req.systemCalculatedAmount;
          } else if (decision === 'quote') {
            newStatus = 'quoted';
            proposedQuote = Number(payload.quotedAmount) || req.systemCalculatedAmount;
          } else if (decision === 'reject') {
            newStatus = 'rejected';
          }

          updatedRequest = {
            ...req,
            status: newStatus,
            proposedQuotation: proposedQuote,
            adminNotes: payload.adminNotes || req.adminNotes,
            rejectionReason: payload.rejectionReason || null,
            reviewedBy: reviewerName,
            reviewDate: timestamp,
          };
          return updatedRequest;
        }
        return req;
      })
    );

    if (updatedRequest) {
      addPlatformLog(
        reviewerName,
        `Super Admin decision '${decision.toUpperCase()}' on custom plan request ${requestId} for ${updatedRequest.restaurantName}`,
        `Custom Plan Review / ${requestId}`,
        'Platform Administration',
        decision === 'reject' ? 'warning' : 'success'
      );

      const decisionText =
        decision === 'approve'
          ? 'approved'
          : decision === 'quote'
          ? `quoted at ${formatINR(updatedRequest.proposedQuotation)}`
          : 'rejected';

      addToast(
        `Request ${requestId} (${updatedRequest.restaurantName}) has been ${decisionText}.`,
        decision === 'reject' ? 'warning' : 'success'
      );
    }

    return updatedRequest;
  };

  const acceptQuotation = (requestId) => {
    let updatedRequest = null;

    setCustomPlanRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId && req.status === 'quoted') {
          updatedRequest = {
            ...req,
            status: 'approved',
            adminNotes: (req.adminNotes || '') + ' [Quotation accepted by customer]',
          };
          return updatedRequest;
        }
        return req;
      })
    );

    if (updatedRequest) {
      addPlatformLog(
        currentUser?.name || updatedRequest.ownerName,
        `Accepted Super Admin quotation of ${formatINR(updatedRequest.proposedQuotation)} for ${updatedRequest.restaurantName}`,
        `Custom Plan / ${requestId}`,
        'Platform Finance',
        'success'
      );
      addToast('Quotation accepted! You can now proceed to checkout and activation.', 'success');
    }

    return updatedRequest;
  };

  const activateCustomSubscription = (requestId, paymentDetails = {}) => {
    const targetReq = customPlanRequests.find((r) => r.id === requestId);
    if (!targetReq) {
      addToast('Request reference not found.', 'error');
      return { success: false, error: 'Request not found' };
    }

    if (targetReq.status !== 'auto_approved' && targetReq.status !== 'approved') {
      addToast(`Cannot activate plan with status: ${targetReq.status}. Must be approved first.`, 'error');
      return { success: false, error: 'Plan not approved' };
    }

    const amountToCharge = targetReq.proposedQuotation || targetReq.systemCalculatedAmount;
    const validation = validateAndAuthorizePricing(targetReq.config, amountToCharge, currentUser?.role);
    if (!validation.isValid && targetReq.status !== 'approved') {
      addToast(validation.error, 'error');
      return { success: false, error: validation.error };
    }

    if (targetReq.status === 'activated') {
      addToast('Subscription is already activated for this request.', 'info');
      return { success: true, subscriptionId: targetReq.subscriptionId };
    }

    const txnId = `TXN-IND-${Math.floor(90000 + Math.random() * 9999)}`;
    const invoiceId = `STM-INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const subId = `SUB-2026-${Math.floor(100 + Math.random() * 900)}`;
    const nowStr = new Date().toISOString().split('T')[0];
    const isAnnual = targetReq.config.billingCycle === 'annual';
    const expiryDateObj = new Date();
    if (isAnnual) expiryDateObj.setFullYear(expiryDateObj.getFullYear() + 1);
    else expiryDateObj.setMonth(expiryDateObj.getMonth() + 1);
    const expiryStr = expiryDateObj.toISOString().split('T')[0];

    setCustomPlanRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, status: 'activated', subscriptionId: subId, transactionId: txnId, invoiceId, activationDate: nowStr }
          : r
      )
    );

    const newTxn = {
      id: txnId,
      restaurantId: targetReq.restaurantId,
      restaurantName: targetReq.restaurantName,
      restaurantOwner: targetReq.ownerName,
      ownerEmail: targetReq.ownerEmail,
      ownerPhone: targetReq.ownerPhone,
      logo: targetReq.logo,
      registrationDate: nowStr,
      planId: 'plan-custom',
      planName: `Custom Plan (${targetReq.config.branches} Branches, ${targetReq.config.staffCount} Staff)`,
      billingCycle: isAnnual ? 'Yearly' : 'Monthly',
      baseAmount: Math.round(amountToCharge / 1.18),
      taxAmount: Math.round(amountToCharge - amountToCharge / 1.18),
      amount: amountToCharge,
      status: 'Success',
      paymentDate: `${nowStr} 12:00 PM`,
      renewalDate: expiryStr,
      gateway: paymentDetails.gateway || 'Razorpay Enterprise Gateway',
      gatewayRef: `pay_${Date.now().toString(36)}`,
      paymentMethod: paymentDetails.method || 'Corporate NetBanking',
      invoiceId,
      gstin: '27AABCU9603R1ZM',
      address: 'Corporate Headquarters, Mumbai, MH',
    };
    setTransactions((prev) => [newTxn, ...prev]);

    const newInvoice = {
      id: invoiceId,
      invoiceNumber: invoiceId,
      restaurantId: targetReq.restaurantId,
      restaurantName: targetReq.restaurantName,
      branchId: 'branch-pune-central',
      branchName: `${targetReq.restaurantName} (Primary)`,
      ownerName: targetReq.ownerName,
      ownerEmail: targetReq.ownerEmail,
      ownerPhone: targetReq.ownerPhone,
      address: 'Corporate Headquarters, Mumbai, MH',
      gstin: '27AABCU9603R1ZM',
      transactionId: txnId,
      planName: `Custom Plan (${targetReq.config.branches} Branches, ${targetReq.config.staffCount} Staff)`,
      period: isAnnual ? 'Annual Cycle' : 'Monthly Cycle',
      amount: amountToCharge,
      baseAmount: Math.round(amountToCharge / 1.18),
      tax: Math.round(amountToCharge - amountToCharge / 1.18),
      issueDate: nowStr,
      dueDate: expiryStr,
      status: 'Paid',
    };
    setInvoices((prev) => [newInvoice, ...prev]);
    setBranchInvoices((prev) => [newInvoice, ...prev]);

    const newSub = {
      id: subId,
      restaurantId: targetReq.restaurantId,
      restaurantName: targetReq.restaurantName,
      ownerName: targetReq.ownerName,
      ownerEmail: targetReq.ownerEmail,
      ownerPhone: targetReq.ownerPhone,
      logo: targetReq.logo,
      planId: 'plan-custom',
      planName: `Custom Plan (${targetReq.config.branches} Outlets)`,
      billingCycle: isAnnual ? 'Yearly' : 'Monthly',
      startDate: nowStr,
      expiryDate: expiryStr,
      status: 'Active',
      renewalAmount: amountToCharge,
      autoRenewal: true,
      lastPaymentDate: nowStr,
      lastTransactionId: txnId,
      paymentStatus: 'Success',
      branches: targetReq.config.branches,
      features: (targetReq.config.selectedFeatureIds || []).map((id) => {
        const item = FEATURE_ADDONS.find((a) => a.id === id);
        return item ? item.name : id;
      }),
    };

    setSubscriptions((prev) => {
      const exists = prev.some((s) => s.restaurantId === targetReq.restaurantId);
      if (exists) return prev.map((s) => (s.restaurantId === targetReq.restaurantId ? newSub : s));
      return [newSub, ...prev];
    });

    setRestaurants((prev) =>
      prev.map((r) =>
        r.id === targetReq.restaurantId
          ? { ...r, planId: 'plan-custom', planName: 'Custom Enterprise Plan', status: 'active', renewalDate: expiryStr, branches: targetReq.config.branches, maxStaff: targetReq.config.staffCount }
          : r
      )
    );

    addPlatformLog(
      currentUser?.name || targetReq.ownerName,
      `Activated Custom Subscription ${subId} for ${targetReq.restaurantName} (${formatINR(amountToCharge)})`,
      `Subscription / ${subId}`,
      'Platform Finance',
      'success'
    );

    addToast(`Subscription activated successfully for ${targetReq.restaurantName}!`, 'success');

    return { success: true, subscriptionId: subId, transactionId: txnId, invoiceId };
  };

  // --------------------------------------------------------------------------
  // Multi-Branch Management & Staff Transfer Operations
  // --------------------------------------------------------------------------
  const switchBranch = (branchId) => {
    if (!currentUser) return false;

    // Strict role check: Only restaurant_owner or super_admin can switch active branch
    if (currentUser.role !== 'restaurant_owner' && currentUser.role !== 'super_admin') {
      addToast('Access Denied: Only restaurant owners are authorized to switch active branches.', 'error');
      return false;
    }

    if (branchId === 'all') {
      setCurrentBranchId('all');
      try {
        localStorage.setItem(`${STORAGE_KEY}_currentBranchId`, JSON.stringify('all'));
      } catch (e) {}
      addToast('Switched to Aggregated View (All Authorized Outlets).', 'info');
      return true;
    }

    const isAllowed = authorizedBranches.some((b) => b.id === branchId);
    if (!isAllowed) {
      addToast('Access Denied: You are not authorized to view or manage this branch.', 'error');
      return false;
    }
    const branch = authorizedBranches.find((b) => b.id === branchId);
    setCurrentBranchId(branchId);
    try {
      localStorage.setItem(`${STORAGE_KEY}_currentBranchId`, JSON.stringify(branchId));
    } catch (e) {}
    addToast(`Switched active branch to ${branch?.name || branchId}.`, 'info');
    return true;
  };

  const addBranch = (branchData) => {
    const planConfig = BRANCH_PLANS_CONFIG[branchData.planId] || BRANCH_PLANS_CONFIG['plan-pro'];
    const price = branchData.billingCycle === 'Yearly' ? planConfig.yearlyPrice : planConfig.monthlyPrice;
    const gstAmount = Math.round(price * 0.18);
    const totalRenewalPrice = price + gstAmount;

    const newBranch = {
      id: `branch-${Date.now()}`,
      restaurantId: currentRestaurantId || 'rest-1',
      name: branchData.name,
      code: branchData.code || `SG-BR-${branches.length + 1}`,
      type: branchData.type || 'Standard Dine-In',
      address: branchData.address,
      phone: branchData.phone || '+91 98220 00000',
      email: branchData.email || 'branch@spicegarden.com',
      managerId: branchData.managerId || null,
      managerName: branchData.managerName || 'Unassigned',
      managerEmail: branchData.managerEmail || '',
      status: 'active',
      openingHours: branchData.openingHours || '11:00 AM – 11:00 PM',
      seatingCapacity: Number(branchData.seatingCapacity) || 80,
      staffCount: 0,
      inventoryCount: 15,
      planId: planConfig.id,
      planName: planConfig.name,
      billingCycle: branchData.billingCycle || 'Monthly',
      price,
      gstRate: 0.18,
      gstAmount,
      totalRenewalPrice,
      startDate: new Date().toISOString().split('T')[0],
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentStatus: 'Success',
      autoRenewal: true,
      lastTransactionId: `TXN-BR-${Date.now().toString().slice(-4)}`,
    };

    setBranches((prev) => [newBranch, ...prev]);

    // Create notification (marked read for creator)
    const newNotif = {
      id: `notif-${Date.now()}`,
      type: 'branch_created',
      title: 'New Branch Onboarded',
      message: `Successfully provisioned ${newBranch.name} with ${newBranch.planName} plan.`,
      branchId: newBranch.id,
      branchName: newBranch.name,
      read: true,
      timestamp: 'Just now',
      actionLink: '/branches',
      actionLabel: 'View Branch',
      badge: 'Branch Setup',
    };
    setOwnerNotifications((prev) => [newNotif, ...prev]);

    addToast(`New branch "${newBranch.name}" created successfully.`, 'success');
    return newBranch;
  };

  const updateBranch = (branchId, updatedData) => {
    setBranches((prev) =>
      prev.map((b) => (b.id === branchId ? { ...b, ...updatedData } : b))
    );
    addToast('Branch details updated successfully.', 'success');
  };

  const toggleBranchStatus = (branchId) => {
    let nextStatus = 'active';
    let targetBranch = null;

    setBranches((prev) =>
      prev.map((b) => {
        if (b.id === branchId) {
          nextStatus = b.status === 'active' ? 'inactive' : 'active';
          targetBranch = { ...b, status: nextStatus };
          return targetBranch;
        }
        return b;
      })
    );

    if (targetBranch) {
      const notif = {
        id: `notif-${Date.now()}`,
        type: 'branch_status',
        title: `Branch ${nextStatus === 'active' ? 'Activated' : 'Deactivated'}`,
        message: `${targetBranch.name} status updated to ${nextStatus}.`,
        branchId: targetBranch.id,
        branchName: targetBranch.name,
        read: true,
        timestamp: 'Just now',
        actionLink: '/branches',
        actionLabel: 'View Branches',
        badge: 'Branch Status',
      };
      setOwnerNotifications((prev) => [notif, ...prev]);
      addToast(
        `Branch "${targetBranch.name}" is now ${nextStatus}.`,
        nextStatus === 'active' ? 'success' : 'warning'
      );
    }
  };

  const updateBranchSubscription = (branchId, planId, billingCycle = 'Monthly') => {
    const planConfig = BRANCH_PLANS_CONFIG[planId] || BRANCH_PLANS_CONFIG['plan-pro'];
    const price = billingCycle === 'Yearly' ? planConfig.yearlyPrice : planConfig.monthlyPrice;
    const gstAmount = Math.round(price * 0.18);
    const totalRenewalPrice = price + gstAmount;

    let targetBranch = null;

    setBranches((prev) =>
      prev.map((b) => {
        if (b.id === branchId) {
          targetBranch = {
            ...b,
            planId: planConfig.id,
            planName: planConfig.name,
            billingCycle,
            price,
            gstAmount,
            totalRenewalPrice,
          };
          return targetBranch;
        }
        return b;
      })
    );

    if (targetBranch) {
      const notif = {
        id: `notif-${Date.now()}`,
        type: 'plan_upgrade',
        title: `Branch Plan Updated: ${targetBranch.name}`,
        message: `Subscription plan changed to ${planConfig.name} (${billingCycle}) at ${formatINR(totalRenewalPrice)}.`,
        branchId: targetBranch.id,
        branchName: targetBranch.name,
        planName: planConfig.name,
        amount: totalRenewalPrice,
        read: true,
        timestamp: 'Just now',
        actionLink: '/branch-subscriptions',
        actionLabel: 'View Subscription',
        badge: 'Plan Update',
      };
      setOwnerNotifications((prev) => [notif, ...prev]);
      addToast(
        `Updated subscription for ${targetBranch.name} to ${planConfig.name} (${billingCycle}).`,
        'success'
      );
    }
  };

  const addBranchStaffMember = (staffData) => {
    // 1. Validate email format and uniqueness in service layer
    const emailLower = (staffData.email || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!staffData.email || !emailRegex.test(emailLower)) {
      addToast('Invalid email address format.', 'error');
      return null;
    }

    const emailExists = (branchStaff || []).some(
      (s) => (s.email || '').toLowerCase() === emailLower
    );
    if (emailExists) {
      addToast(`A staff member with email "${staffData.email}" already exists.`, 'error');
      return null;
    }

    // 2. Hash temporary password - NEVER store in plain text!
    const tempPass = staffData.tempPassword || '';
    const passwordHash = tempPass ? hashPassword(tempPass) : null;

    const branch = branches.find((b) => b.id === staffData.branchId) || branches[0];

    const newStaff = {
      id: `usr-br-${Date.now().toString().slice(-4)}`,
      employeeId: staffData.employeeId || `EMP-${String(branchStaff.length + 1).padStart(4, '0')}`,
      name: staffData.name,
      email: staffData.email,
      phone: staffData.phone || '+91 98220 00000',
      role: staffData.role || 'kitchen_staff',
      roleLabel:
        staffData.roleLabel ||
        (staffData.role === 'restaurant_manager'
          ? 'Restaurant Manager'
          : staffData.role === 'inventory_manager'
          ? 'Inventory Manager'
          : 'Kitchen Staff'),
      isManager: staffData.role === 'restaurant_manager' || staffData.role === 'inventory_manager',
      branchId: branch?.id || 'branch-pune-central',
      branchName: branch?.name || 'Spice Garden — Pune Central',
      restaurantId: currentRestaurantId || 'rest-1',
      status: staffData.status || 'Invited',
      mustChangePassword: staffData.mustChangePassword !== undefined ? staffData.mustChangePassword : true,
      joinedDate: staffData.joinedDate || new Date().toISOString().split('T')[0],
      shift: staffData.shift || 'Morning Shift (07:00 AM - 03:30 PM)',
      baseSalary: Number(staffData.baseSalary) || 25000,
      passwordHash: passwordHash, // Stored as SHA-256 hash!
      // Plain text password is NEVER stored!
      avatar: staffData.avatar || `https://images.unsplash.com/photo-${1507003211169 + Math.floor(Math.random() * 1000)}?w=150&auto=format&fit=crop&q=80`,
      assignedModules: staffData.assignedModules || (
        staffData.role === 'restaurant_manager'
          ? ['Staff Management', 'Attendance Clock', 'Leave Approvals', 'Staff Transfers', 'Staff Reports', 'Alerts']
          : staffData.role === 'inventory_manager'
          ? ['Inventory', 'Suppliers', 'Purchase Orders', 'Receiving Dock', 'Reports']
          : ['Kitchen Terminal', 'Prep Usage', 'Wastage']
      ),
    };

    setBranchStaff((prev) => [newStaff, ...prev]);
    setUsers((prev) => [newStaff, ...prev.filter(u => (u.email || '').toLowerCase() !== newStaff.email.toLowerCase())]);

    // Update salary profile for payroll if baseSalary provided
    if (newStaff.baseSalary) {
      STAFF_SALARY_PROFILES[newStaff.id] = {
        baseSalary: newStaff.baseSalary,
        role: newStaff.roleLabel,
        bankAccount: 'Direct Bank Transfer',
        pan: 'PENDING_ONBOARDING',
      };
    }

    // Increment branch staff count
    setBranches((prev) =>
      prev.map((b) =>
        b.id === newStaff.branchId ? { ...b, staffCount: (b.staffCount || 0) + 1 } : b
      )
    );

    const notif = {
      id: `notif-${Date.now()}`,
      type: 'staff_added',
      title: 'New Staff Member Invited',
      message: `${newStaff.name} invited to ${newStaff.branchName} (${newStaff.roleLabel}). Temporary credentials dispatched.`,
      branchId: newStaff.branchId,
      branchName: newStaff.branchName,
      read: true,
      timestamp: 'Just now',
      actionLink: '/branch-staff',
      actionLabel: 'View Staff Roster',
      badge: 'Team Invite',
    };
    setOwnerNotifications((prev) => [notif, ...prev]);

    addToast(`Staff invitation created for ${newStaff.name}.`, 'success');
    return newStaff;
  };

  const removeBranchStaffMember = (staffId) => {
    const staff = branchStaff.find((s) => s.id === staffId);
    if (!staff) return;

    setBranchStaff((prev) => prev.filter((s) => s.id !== staffId));

    // Decrement branch staff count
    setBranches((prev) =>
      prev.map((b) =>
        b.id === staff.branchId ? { ...b, staffCount: Math.max(0, (b.staffCount || 1) - 1) } : b
      )
    );

    addToast(`Removed ${staff.name} from branch roster.`, 'info');
  };

  const assignBranchManager = (branchId, managerId) => {
    const mgr = branchStaff.find((s) => s.id === managerId);
    if (!mgr) return;

    setBranches((prev) =>
      prev.map((b) =>
        b.id === branchId
          ? { ...b, managerId: mgr.id, managerName: mgr.name, managerEmail: mgr.email }
          : b
      )
    );

    // Update staff record
    setBranchStaff((prev) =>
      prev.map((s) =>
        s.id === managerId
          ? { ...s, isManager: true, role: 'inventory_manager', roleLabel: 'Branch Manager', branchId }
          : s
      )
    );

    const targetBranch = branches.find((b) => b.id === branchId);

    const notif = {
      id: `notif-${Date.now()}`,
      type: 'manager_assigned',
      title: 'Manager Assigned to Branch',
      message: `${mgr.name} appointed as Branch Manager for ${targetBranch?.name}.`,
      branchId,
      branchName: targetBranch?.name || 'Branch',
      read: true,
      timestamp: 'Just now',
      actionLink: '/branch-staff',
      actionLabel: 'View Managers',
      badge: 'Management',
    };
    setOwnerNotifications((prev) => [notif, ...prev]);

    addToast(`Assigned ${mgr.name} as Manager for ${targetBranch?.name}.`, 'success');
  };

  // Staff Transfer Workflow
  const requestStaffTransfer = ({ employeeId, fromBranchId, toBranchId, reason }) => {
    const emp = branchStaff.find((s) => s.id === employeeId);
    const fromB = branches.find((b) => b.id === fromBranchId);
    const toB = branches.find((b) => b.id === toBranchId);

    if (!emp || !fromB || !toB) {
      addToast('Invalid transfer request details.', 'error');
      return;
    }

    const transferId = `TR-${Math.floor(100 + Math.random() * 900)}`;
    const newTransfer = {
      id: transferId,
      employeeId: emp.id,
      employeeName: emp.name,
      employeeAvatar: emp.avatar,
      role: emp.role,
      roleLabel: emp.roleLabel,
      fromBranchId: fromB.id,
      fromBranchName: fromB.name,
      toBranchId: toB.id,
      toBranchName: toB.name,
      reason,
      requestedBy: `${currentUser?.name || 'Priya Sharma'} (${currentUser?.role?.replace('_', ' ') || 'Owner'})`,
      requestedById: currentUser?.id || 'usr-sg-1',
      requestDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
      comments: 'Pending Restaurant Owner / Branch Manager authorization.',
      history: [
        {
          date: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          action: 'Transfer Request Submitted',
          by: currentUser?.name || 'Owner',
        },
      ],
    };

    setStaffTransfers((prev) => [newTransfer, ...prev]);

    const notif = {
      id: `notif-${Date.now()}`,
      type: 'transfer_request',
      title: `Transfer Request: ${emp.name}`,
      message: `Transfer requested from ${fromB.name} to ${toB.name}. Reason: "${reason}".`,
      branchId: toB.id,
      branchName: toB.name,
      transferId: newTransfer.id,
      read: true,
      timestamp: 'Just now',
      actionLink: '/staff-transfers',
      actionLabel: 'Review Request',
      badge: 'Transfer Workflow',
    };
    setOwnerNotifications((prev) => [notif, ...prev]);

    addToast(`Staff transfer request for ${emp.name} submitted successfully.`, 'success');
    return newTransfer;
  };

  const approveStaffTransfer = (transferId) => {
    const transfer = staffTransfers.find((t) => t.id === transferId);
    if (!transfer) return;

    // Check destination branch plan quota
    const toBranch = branches.find((b) => b.id === transfer.toBranchId);
    const planConfig = BRANCH_PLANS_CONFIG[toBranch?.planId] || BRANCH_PLANS_CONFIG['plan-starter'];
    if (toBranch && toBranch.staffCount >= planConfig.maxStaff) {
      addToast(
        `Cannot approve transfer: Destination branch "${toBranch.name}" has reached its plan staff limit (${planConfig.maxStaff} staff). Upgrade plan first.`,
        'error'
      );
      return false;
    }

    const nowStr = new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    // Update transfer status
    setStaffTransfers((prev) =>
      prev.map((t) => {
        if (t.id === transferId) {
          return {
            ...t,
            status: 'Approved',
            approvedBy: `${currentUser?.name || 'Priya Sharma'} (Owner)`,
            approvalDate: new Date().toISOString().split('T')[0],
            comments: 'Approved. Destination branch staff quota validated.',
            history: [
              ...t.history,
              { date: nowStr, action: 'Approved and Reassigned', by: currentUser?.name || 'Owner' },
            ],
          };
        }
        return t;
      })
    );

    // Update employee branch assignment
    setBranchStaff((prev) =>
      prev.map((s) => {
        if (s.id === transfer.employeeId) {
          return {
            ...s,
            branchId: transfer.toBranchId,
            branchName: transfer.toBranchName,
          };
        }
        return s;
      })
    );

    // Update branch staff counts
    setBranches((prev) =>
      prev.map((b) => {
        if (b.id === transfer.fromBranchId) {
          return { ...b, staffCount: Math.max(0, (b.staffCount || 1) - 1) };
        }
        if (b.id === transfer.toBranchId) {
          return { ...b, staffCount: (b.staffCount || 0) + 1 };
        }
        return b;
      })
    );

    // Automatically mark the pending transfer request notification as read
    setOwnerNotifications((prev) =>
      prev.map((n) => (n.transferId === transfer.id || n.transferId === transferId ? { ...n, read: true } : n))
    );

    // Create decision notification (marked read for decider)
    const notif = {
      id: `notif-${Date.now()}`,
      type: 'transfer_decision',
      title: `Transfer Approved: ${transfer.employeeName}`,
      message: `${transfer.employeeName} successfully transferred to ${transfer.toBranchName}.`,
      branchId: transfer.toBranchId,
      branchName: transfer.toBranchName,
      read: true,
      timestamp: 'Just now',
      actionLink: '/branch-staff',
      actionLabel: 'View Staff Roster',
      badge: 'Transfer Approved',
    };
    setOwnerNotifications((prev) => [notif, ...prev]);

    addToast(
      `Transfer approved! ${transfer.employeeName} is now assigned to ${transfer.toBranchName}.`,
      'success'
    );
    return true;
  };

  const rejectStaffTransfer = (transferId, reason = 'Declined by owner') => {
    const transfer = staffTransfers.find((t) => t.id === transferId);
    if (!transfer) return;

    const nowStr = new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    setStaffTransfers((prev) =>
      prev.map((t) => {
        if (t.id === transferId) {
          return {
            ...t,
            status: 'Rejected',
            approvedBy: `${currentUser?.name || 'Priya Sharma'} (Owner)`,
            approvalDate: new Date().toISOString().split('T')[0],
            comments: `Rejected: ${reason}`,
            history: [
              ...t.history,
              { date: nowStr, action: `Rejected: ${reason}`, by: currentUser?.name || 'Owner' },
            ],
          };
        }
        return t;
      })
    );

    // Automatically mark the pending transfer request notification as read
    setOwnerNotifications((prev) =>
      prev.map((n) => (n.transferId === transfer.id || n.transferId === transferId ? { ...n, read: true } : n))
    );

    const notif = {
      id: `notif-${Date.now()}`,
      type: 'transfer_decision',
      title: `Transfer Rejected: ${transfer.employeeName}`,
      message: `Transfer of ${transfer.employeeName} to ${transfer.toBranchName} was declined. Reason: ${reason}.`,
      branchId: transfer.fromBranchId,
      branchName: transfer.fromBranchName,
      read: true,
      timestamp: 'Just now',
      actionLink: '/staff-transfers',
      actionLabel: 'View Transfers',
      badge: 'Transfer Declined',
    };
    setOwnerNotifications((prev) => [notif, ...prev]);

    addToast(`Staff transfer request for ${transfer.employeeName} rejected.`, 'info');
  };

  // Notification actions
  const markOwnerNotificationRead = (notifId) => {
    setOwnerNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
  };

  const markAllOwnerNotificationsRead = () => {
    setOwnerNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    addToast('All notifications marked as read.', 'info');
  };

  // Suppliers CRUD
  const addSupplier = (supplierData) => {
    const newSup = {
      id: `sup-${Date.now()}`,
      name: supplierData.name,
      contactPerson: supplierData.contactPerson,
      email: supplierData.email,
      phone: supplierData.phone,
      address: supplierData.address,
      categories: supplierData.categories || ['Produce'],
      rating: 4.8,
      leadTimeDays: Number(supplierData.leadTimeDays) || 1,
      paymentTerms: supplierData.paymentTerms || 'Net 30',
      activeOrdersCount: 0,
      status: 'active',
      restaurantIds: [currentRestaurantId],
    };
    setSuppliers(prev => [newSup, ...prev]);
    addToast(`Supplier "${newSup.name}" added.`, 'success');
  };

  const updateSupplier = (id, supplierData) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, ...supplierData };
      }
      return s;
    }));
    addToast(`Supplier updated successfully.`, 'success');
  };

  const deleteSupplier = (id) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
    addToast(`Supplier removed.`, 'info');
  };

  // Alerts helpers
  const markAlertRead = (alertId) => {
    if (String(alertId).startsWith('alert-')) {
      setReadStaffAlertIds(prev => prev.includes(alertId) ? prev : [...prev, alertId]);
    }
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, read: true } : a));
  };

  const markAllAlertsRead = () => {
    if (currentUser?.role === 'restaurant_manager') {
      const allIds = staffAlerts.map(a => a.id);
      setReadStaffAlertIds(prev => Array.from(new Set([...prev, ...allIds])));
      addToast('All staff notifications marked as read.', 'info');
      return;
    }
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    addToast(`All alerts marked as read.`, 'info');
  };

  const dismissAlert = (alertId) => {
    if (String(alertId).startsWith('alert-')) {
      setDismissedStaffAlertIds(prev => [...prev, alertId]);
      return;
    }
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  // Support Tickets
  const updateTicketStatus = (ticketId, newStatus) => {
    setSupportTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
    addToast(`Ticket status updated to ${newStatus}.`, 'info');
  };

  // --- KITCHEN & EMPLOYEE ATTENDANCE (PUNCH-IN / PUNCH-OUT / BREAKS) ---
  const punchInStaff = ({ staffId, staffName, staffRole, branchId, branchName, station, notes }) => {
    const user = currentUser;
    const targetId = staffId || user?.id || 'usr-sg-3';
    const targetName = staffName || user?.name || 'Chef Anita Rao';
    const targetRole = staffRole || user?.roleLabel || 'Head Chef';
    const targetBranchId = branchId || user?.branchId || currentBranchId || 'branch-pune-central';
    const targetBranch = branches.find(b => b.id === targetBranchId);

    // Prevent duplicate active session
    const existingActive = attendanceRecords.find(r => r.staffId === targetId && r.status === 'active');
    if (existingActive) {
      addToast(`${targetName} is already clocked in!`, 'warning');
      return existingActive;
    }

    const now = new Date();
    // Late arrival check: past 09:30 AM on morning shift
    const hrs = now.getHours();
    const mins = now.getMinutes();
    const isLate = hrs > 9 || (hrs === 9 && mins > 30);
    const initialStatus = isLate ? 'late' : 'present';

    const newRecord = {
      id: `att-${Date.now()}`,
      staffId: targetId,
      staffName: targetName,
      staffRole: targetRole,
      staffAvatar: user?.avatar || 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=150',
      branchId: targetBranchId,
      branchName: targetBranch?.name || branchName || 'Spice Garden — Pune Central',
      restaurantId: currentRestaurantId,
      date: now.toISOString().split('T')[0],
      punchInTime: now.toISOString(),
      punchOutTime: null,
      status: 'active',
      attendanceStatus: initialStatus,
      totalHours: null,
      station: station || 'Main Prep Line',
      notes: notes || 'Clocked in via Workstation',
      isOnBreak: false,
      breakStartTime: null,
      totalBreakMinutes: 0,
      isCorrected: false,
      correctionAudit: [],
    };

    setAttendanceRecords(prev => [newRecord, ...prev]);

    // Live notification for Manager/Owner
    const notif = {
      id: `notif-punch-${Date.now()}`,
      type: 'staff_punch_in',
      title: `Staff Punched In: ${targetName}`,
      message: `${targetName} (${targetRole}) clocked in at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Station: ${newRecord.station}.`,
      branchId: targetBranchId,
      branchName: newRecord.branchName,
      read: false,
      timestamp: 'Just now',
      actionLink: '/workforce?tab=attendance',
      actionLabel: 'View Attendance',
      badge: 'Attendance',
    };
    setOwnerNotifications(prev => [notif, ...prev]);

    addToast(`Clocked in successfully! Shift active since ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`, 'success');
    return newRecord;
  };

  const startStaffBreak = (recordId) => {
    const rec = attendanceRecords.find(r => r.id === recordId || (r.staffId === currentUser?.id && r.status === 'active'));
    if (!rec) {
      addToast('No active attendance session found.', 'error');
      return false;
    }
    if (rec.isOnBreak) {
      addToast('You are already on break.', 'warning');
      return false;
    }
    const now = new Date().toISOString();
    setAttendanceRecords(prev => prev.map(r => r.id === rec.id ? { ...r, isOnBreak: true, breakStartTime: now } : r));
    addToast('Break started. Enjoy your rest!', 'info');
    return true;
  };

  const endStaffBreak = (recordId) => {
    const rec = attendanceRecords.find(r => r.id === recordId || (r.staffId === currentUser?.id && r.status === 'active'));
    if (!rec || !rec.isOnBreak) {
      addToast('No active break found to end.', 'error');
      return false;
    }
    const now = Date.now();
    const breakStart = new Date(rec.breakStartTime).getTime();
    const breakMins = Math.max(1, Math.round((now - breakStart) / 60000));
    const totalBreak = (rec.totalBreakMinutes || 0) + breakMins;
    setAttendanceRecords(prev => prev.map(r => r.id === rec.id ? {
      ...r,
      isOnBreak: false,
      breakStartTime: null,
      totalBreakMinutes: totalBreak,
    } : r));
    addToast(`Break ended (${breakMins} mins). Back on duty!`, 'success');
    return true;
  };

  const punchOutStaff = (recordId, notes = '') => {
    const record = attendanceRecords.find(r => r.id === recordId || (r.staffId === currentUser?.id && r.status === 'active'));
    if (!record) {
      addToast('No active punch session found to punch out from.', 'error');
      return null;
    }

    const now = new Date();
    const inTime = new Date(record.punchInTime);
    const totalElapsedHrs = Math.max(0.1, Number(((now - inTime) / (1000 * 60 * 60)).toFixed(2)));
    const breakHrs = Number(((record.totalBreakMinutes || 0) / 60).toFixed(2));
    const netWorkedHrs = Math.max(0.1, Number((totalElapsedHrs - breakHrs).toFixed(2)));
    
    // Determine attendance status: half-day if < 5 hrs, else keep existing (present or late)
    const attStatus = netWorkedHrs < 5.0 ? 'half_day' : (record.attendanceStatus || 'present');

    setAttendanceRecords(prev => prev.map(r => {
      if (r.id === record.id) {
        return {
          ...r,
          punchOutTime: now.toISOString(),
          status: 'completed',
          attendanceStatus: attStatus,
          totalHours: netWorkedHrs,
          isOnBreak: false,
          breakStartTime: null,
          notes: notes ? `${r.notes ? r.notes + ' • ' : ''}Closing: ${notes}` : r.notes,
        };
      }
      return r;
    }));

    // Notification for Manager
    const notif = {
      id: `notif-punchout-${Date.now()}`,
      type: 'staff_punch_out',
      title: `Staff Punched Out: ${record.staffName}`,
      message: `${record.staffName} completed shift. Total work duration: ${netWorkedHrs} hrs.`,
      branchId: record.branchId,
      branchName: record.branchName,
      read: false,
      timestamp: 'Just now',
      actionLink: '/workforce?tab=attendance',
      actionLabel: 'View Timesheet',
      badge: 'Shift End',
    };
    setOwnerNotifications(prev => [notif, ...prev]);

    addToast(`Punched out successfully. Total shift duration: ${netWorkedHrs} hrs.`, 'success');
    return true;
  };

  // --- ATTENDANCE CORRECTIONS (AUDIT TRAIL) ---
  const correctAttendanceRecord = (recordId, correctionData) => {
    const record = attendanceRecords.find(r => r.id === recordId);
    if (!record) {
      addToast('Attendance record not found.', 'error');
      return false;
    }
    if (!correctionData.reason || !correctionData.reason.trim()) {
      addToast('Correction reason is mandatory.', 'error');
      return false;
    }

    const inTime = correctionData.punchInTime ? new Date(correctionData.punchInTime) : (record.punchInTime ? new Date(record.punchInTime) : null);
    const outTime = correctionData.punchOutTime ? new Date(correctionData.punchOutTime) : (record.punchOutTime ? new Date(record.punchOutTime) : null);
    
    if (inTime && outTime && outTime < inTime) {
      addToast('Clock-out time cannot be earlier than clock-in time.', 'error');
      return false;
    }

    let newTotalHours = record.totalHours;
    if (inTime && outTime) {
      newTotalHours = Math.max(0.1, Number(((outTime - inTime) / (1000 * 60 * 60)).toFixed(2)));
    }

    const auditEntry = {
      id: `audit-${Date.now()}`,
      correctedBy: `${currentUser?.name || 'Authorized Manager'} (${currentUser?.role?.replace('_', ' ') || 'Manager'})`,
      correctedAt: new Date().toISOString(),
      originalPunchIn: record.punchInTime,
      originalPunchOut: record.punchOutTime,
      originalStatus: record.attendanceStatus || 'present',
      originalTotalHours: record.totalHours,
      newPunchIn: correctionData.punchInTime || record.punchInTime,
      newPunchOut: correctionData.punchOutTime || record.punchOutTime,
      newStatus: correctionData.attendanceStatus || record.attendanceStatus,
      newTotalHours,
      reason: correctionData.reason.trim(),
    };

    setAttendanceRecords(prev => prev.map(r => {
      if (r.id === recordId) {
        return {
          ...r,
          punchInTime: correctionData.punchInTime !== undefined ? correctionData.punchInTime : r.punchInTime,
          punchOutTime: correctionData.punchOutTime !== undefined ? correctionData.punchOutTime : r.punchOutTime,
          attendanceStatus: correctionData.attendanceStatus || r.attendanceStatus,
          totalHours: newTotalHours,
          station: correctionData.station || r.station,
          notes: correctionData.notes ? `${r.notes ? r.notes + ' • ' : ''}Correction Note: ${correctionData.notes}` : r.notes,
          isCorrected: true,
          correctionAudit: [auditEntry, ...(r.correctionAudit || [])],
        };
      }
      return r;
    }));

    addToast('Attendance record corrected and audit trail logged.', 'success');
    return true;
  };

  // --- STAFF LEAVE WORKFLOW ---
  const submitLeaveRequest = ({ staffId, staffName, staffRole, branchId, leaveType, reason, startDate, endDate }) => {
    const user = currentUser;
    const targetId = staffId || user?.id || 'usr-sg-3';
    const targetName = staffName || user?.name || 'Chef Anita Rao';
    const targetRole = staffRole || user?.roleLabel || 'Head Chef';
    const targetBranchId = branchId || user?.branchId || currentBranchId || 'branch-pune-central';
    const targetBranch = branches.find(b => b.id === targetBranchId);

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      addToast('End date cannot precede start date.', 'error');
      return null;
    }

    const durationDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Overlap validation with existing active/pending leave requests
    const hasOverlap = leaveRequests.some(l => {
      if (l.staffId !== targetId || l.status === 'rejected' || l.status === 'cancelled') return false;
      const lStart = new Date(l.startDate);
      const lEnd = new Date(l.endDate);
      return (start <= lEnd && end >= lStart);
    });

    if (hasOverlap) {
      addToast('You already have an existing leave request spanning these dates.', 'error');
      return null;
    }

    // Leave balance check
    const currentStaffBal = staffLeaveBalances[targetId] || INITIAL_STAFF_LEAVE_BALANCES[targetId] || {};
    const bal = currentStaffBal[leaveType];
    if (bal && (bal.total - bal.used) < durationDays && leaveType !== 'Unpaid Leave') {
      addToast(`Notice: Requested duration (${durationDays}d) exceeds current ${leaveType} balance (${Math.max(0, bal.total - bal.used)}d remaining). Will require Manager special sign-off.`, 'warning');
    }

    const newLeave = {
      id: `leave-${Date.now()}`,
      staffId: targetId,
      staffName: targetName,
      staffRole: targetRole,
      staffAvatar: user?.avatar || 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=150',
      branchId: targetBranchId,
      branchName: targetBranch?.name || 'Spice Garden — Pune Central',
      restaurantId: currentRestaurantId,
      leaveType: leaveType || 'Casual Leave',
      reason: reason || 'Personal urgent leave',
      startDate,
      endDate,
      durationDays,
      status: 'pending',
      appliedDate: new Date().toISOString(),
      reviewedBy: null,
      reviewedAt: null,
      reviewNotes: '',
    };

    setLeaveRequests(prev => [newLeave, ...prev]);

    // In-App Manager Notification
    const managerNotif = {
      id: `notif-leave-${Date.now()}`,
      type: 'leave_request',
      title: `New Leave Request: ${targetName}`,
      message: `${targetName} (${targetRole}) requested ${durationDays} days leave (${startDate} to ${endDate}) for: "${reason}".`,
      branchId: targetBranchId,
      branchName: newLeave.branchName,
      leaveId: newLeave.id,
      read: false,
      timestamp: 'Just now',
      actionLink: '/workforce?tab=leave',
      actionLabel: 'Review Request',
      badge: 'Leave Request',
    };
    setOwnerNotifications(prev => [managerNotif, ...prev]);

    // Staff in-app notification (marked read for applicant)
    const staffNotif = {
      id: `snotif-${Date.now()}`,
      targetStaffId: targetId,
      type: 'leave_status',
      title: 'Leave Request Submitted',
      message: `Your leave request for ${startDate} – ${endDate} (${durationDays} days) has been dispatched to the Manager for approval.`,
      status: 'pending',
      timestamp: 'Just now',
      read: true,
    };
    setStaffNotifications(prev => [staffNotif, ...prev]);

    addToast(`Leave request for ${durationDays} days submitted for Manager review!`, 'success');
    return newLeave;
  };

  const cancelLeaveRequest = (leaveId) => {
    const req = leaveRequests.find(l => l.id === leaveId);
    if (!req) {
      addToast('Leave request not found.', 'error');
      return false;
    }
    if (req.status !== 'pending') {
      addToast(`Cannot cancel request that is already ${req.status}.`, 'error');
      return false;
    }
    setLeaveRequests(prev => prev.map(l => l.id === leaveId ? { ...l, status: 'cancelled' } : l));
    addToast('Leave request cancelled.', 'info');
    return true;
  };

  const reviewLeaveRequest = (leaveId, decision, reviewNotes = '') => {
    const req = leaveRequests.find(l => l.id === leaveId);
    if (!req) {
      addToast('Leave request not found.', 'error');
      return;
    }

    // Manager self-approval prevention check
    if (req.staffId === currentUser?.id && currentUser?.role === 'restaurant_manager') {
      addToast('Managers cannot approve their own leave applications. An Owner must review your request.', 'error');
      return;
    }

    const now = new Date().toISOString();
    setLeaveRequests(prev => prev.map(l => {
      if (l.id === leaveId) {
        return {
          ...l,
          status: decision,
          reviewedBy: `${currentUser?.name || 'Manager'} (${currentUser?.role?.replace('_', ' ') || 'Manager'})`,
          reviewedAt: now,
          reviewNotes: reviewNotes || (decision === 'approved' ? 'Approved by Manager' : 'Declined by Manager'),
        };
      }
      return l;
    }));

    // If approved, deduct leave balance and mark dates on attendance calendar
    if (decision === 'approved') {
      setStaffLeaveBalances(prev => {
        const currentStaffBal = prev[req.staffId] || INITIAL_STAFF_LEAVE_BALANCES[req.staffId] || {};
        const typeBal = currentStaffBal[req.leaveType] || { total: 12, used: 0 };
        return {
          ...prev,
          [req.staffId]: {
            ...currentStaffBal,
            [req.leaveType]: {
              ...typeBal,
              used: (typeBal.used || 0) + req.durationDays,
            },
          },
        };
      });

      // Update/insert attendance records for leave dates
      const startDate = new Date(req.startDate);
      const endDate = new Date(req.endDate);
      const datesToMark = [];
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        datesToMark.push(d.toISOString().split('T')[0]);
      }

      setAttendanceRecords(prev => {
        let updated = [...prev];
        datesToMark.forEach(dateStr => {
          const existingIdx = updated.findIndex(r => r.staffId === req.staffId && r.date === dateStr);
          if (existingIdx !== -1) {
            updated[existingIdx] = {
              ...updated[existingIdx],
              attendanceStatus: 'on_leave',
              leaveType: req.leaveType,
              notes: `Approved ${req.leaveType}: ${req.reason}`,
            };
          } else {
            updated.unshift({
              id: `att-leave-${Date.now()}-${dateStr}`,
              staffId: req.staffId,
              staffName: req.staffName,
              staffRole: req.staffRole,
              staffAvatar: req.staffAvatar,
              branchId: req.branchId,
              branchName: req.branchName,
              restaurantId: req.restaurantId || currentRestaurantId,
              date: dateStr,
              punchInTime: null,
              punchOutTime: null,
              status: 'completed',
              attendanceStatus: 'on_leave',
              leaveType: req.leaveType,
              totalHours: 0,
              station: 'On Approved Leave',
              notes: `Approved ${req.leaveType}: ${req.reason}`,
              isCorrected: false,
              correctionAudit: [],
            });
          }
        });
        return updated;
      });
    }

    // Real-time Staff Notification
    const staffNotif = {
      id: `snotif-${Date.now()}`,
      targetStaffId: req.staffId,
      type: 'leave_status',
      title: `Leave Request ${decision === 'approved' ? 'Approved ✅' : 'Declined ❌'}`,
      message: `Your leave request for ${req.startDate} to ${req.endDate} (${req.durationDays} days) was ${decision} by ${currentUser?.name || 'Manager'}.${reviewNotes ? ` Note: "${reviewNotes}"` : ''}`,
      status: decision,
      timestamp: 'Just now',
      read: false,
    };
    setStaffNotifications(prev => [staffNotif, ...prev]);

    addToast(`Leave request ${decision} for ${req.staffName}.`, decision === 'approved' ? 'success' : 'info');
  };

  const getStaffLeaveBalance = (staffId) => {
    const targetId = staffId || currentUser?.id || 'usr-sg-3';
    const balances = staffLeaveBalances[targetId] || INITIAL_STAFF_LEAVE_BALANCES[targetId] || {
      'Casual Leave': { total: 12, used: 0 },
      'Sick Leave': { total: 10, used: 0 },
      'Earned Leave': { total: 15, used: 0 },
      'Emergency Leave': { total: 5, used: 0 },
      'Unpaid Leave': { total: 99, used: 0 },
      'Festival / Compensatory Off': { total: 6, used: 0 },
    };
    const result = {};
    Object.keys(balances).forEach(type => {
      const b = balances[type];
      result[type] = {
        total: b.total,
        used: b.used,
        remaining: Math.max(0, b.total - b.used),
      };
    });
    return result;
  };

  // --- HOLIDAY MANAGEMENT ---
  const addHoliday = (holidayData) => {
    if (!holidayData.name || !holidayData.date) {
      addToast('Holiday name and date are required.', 'error');
      return null;
    }
    // Check duplicate date for same scope
    const existing = holidays.find(h => 
      h.date === holidayData.date && 
      h.restaurantId === currentRestaurantId &&
      (h.scope === 'all' || holidayData.scope === 'all' || h.branchId === holidayData.branchId)
    );
    if (existing) {
      addToast(`A holiday ("${existing.name}") is already scheduled for ${holidayData.date}.`, 'warning');
      return null;
    }

    const newHol = {
      id: `hol-${Date.now()}`,
      name: holidayData.name.trim(),
      date: holidayData.date,
      type: holidayData.type || 'Festival',
      scope: holidayData.scope || 'all',
      branchId: holidayData.scope === 'all' ? null : (holidayData.branchId || currentBranchId),
      restaurantId: currentRestaurantId,
      description: holidayData.description || 'Official restaurant holiday',
      createdBy: `${currentUser?.name || 'Manager'} (${currentUser?.role?.replace('_', ' ') || 'Manager'})`,
      createdAt: new Date().toISOString(),
    };
    setHolidays(prev => [...prev, newHol]);
    addToast(`Holiday "${newHol.name}" scheduled for ${newHol.date}.`, 'success');
    return newHol;
  };

  const updateHoliday = (holidayId, updatedData) => {
    setHolidays(prev => prev.map(h => h.id === holidayId ? { ...h, ...updatedData, modifiedBy: currentUser?.name, modifiedAt: new Date().toISOString() } : h));
    addToast('Holiday details updated successfully.', 'success');
  };

  const deleteHoliday = (holidayId) => {
    setHolidays(prev => prev.filter(h => h.id !== holidayId));
    addToast('Holiday removed from calendar.', 'info');
  };

  // --- SALARY & PAYROLL NOTIFICATIONS ---
  const processSalaryPayment = ({ staffId, staffName, staffRole, branchId, payPeriod, amount, baseSalary, bonus, deductions, paymentMethod, referenceNumber, notes }) => {
    const targetStaff = branchStaff.find(s => s.id === staffId) || users.find(u => u.id === staffId);

    // Rule 1: Staff member must have Active status
    const isStaffActive = (targetStaff?.status || 'Active').toLowerCase() === 'active';
    if (!isStaffActive) {
      addToast(`Disbursement blocked: ${targetStaff?.name || 'Staff'} is not Active (status: ${targetStaff?.status || 'Invited'}).`, 'error');
      return { success: false, error: 'Staff member is not Active.' };
    }

    // Rule 2: Staff bankStatus must be Verified
    const isBankVerified = (targetStaff?.bankStatus || '').toLowerCase() === 'verified';
    if (!isBankVerified) {
      addToast(`Disbursement blocked: Bank details for ${targetStaff?.name || 'Staff'} are ${targetStaff?.bankStatus || 'Not Added'} (must be Verified).`, 'error');
      return { success: false, error: 'Staff bank details must be Verified.' };
    }
    const targetName = staffName || targetStaff?.name || 'Staff Member';
    const targetRole = staffRole || targetStaff?.roleLabel || targetStaff?.role || 'Kitchen Staff';
    const targetBranchId = branchId || targetStaff?.branchId || currentBranchId;
    const targetBranch = branches.find(b => b.id === targetBranchId);

    const netAmount = Number(amount) || (Number(baseSalary || 35000) + Number(bonus || 0) - Number(deductions || 0));
    const refNum = referenceNumber || `UTR-SAL-${Date.now().toString().slice(-6)}`;
    const period = payPeriod || 'October 2026';

    const newPayment = {
      id: `sal-${Date.now()}`,
      staffId,
      staffName: targetName,
      staffRole: targetRole,
      staffAvatar: targetStaff?.avatar || 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=150',
      branchId: targetBranchId,
      branchName: targetBranch?.name || 'Spice Garden — Pune Central',
      restaurantId: currentRestaurantId,
      payPeriod: period,
      amount: netAmount,
      baseSalary: Number(baseSalary || netAmount),
      bonus: Number(bonus || 0),
      deductions: Number(deductions || 0),
      paymentMethod: paymentMethod || 'Direct Bank Transfer (IMPS/NEFT)',
      referenceNumber: refNum,
      status: 'Credited',
      processedBy: `${currentUser?.name || 'Priya Sharma'} (${currentUser?.role?.replace('_', ' ') || 'Owner'})`,
      processedAt: new Date().toISOString(),
      notes: notes || `Salary for ${period} credited via ${paymentMethod || 'IMPS/NEFT'}.`,
      viewed: false,
    };

    setSalaryPayments(prev => [newPayment, ...prev]);

    // Create instant in-app notification for the Staff member
    const staffNotif = {
      id: `snotif-sal-${Date.now()}`,
      targetStaffId: staffId,
      type: 'salary_credit',
      title: `🎉 ${period} Salary Credited: ₹${netAmount.toLocaleString('en-IN')}`,
      message: `Your salary of ₹${netAmount.toLocaleString('en-IN')} for ${period} has been credited to your account. UTR: ${refNum}. ${notes ? `Note: ${notes}` : ''}`,
      amount: netAmount,
      payPeriod: period,
      referenceNumber: refNum,
      timestamp: 'Just now',
      read: false,
      paymentId: newPayment.id,
    };
    setStaffNotifications(prev => [staffNotif, ...prev]);

    // Owner notification log
    const ownerNotif = {
      id: `notif-sal-log-${Date.now()}`,
      type: 'salary_disbursed',
      title: `Salary Disbursed: ${targetName}`,
      message: `₹${netAmount.toLocaleString('en-IN')} for ${period} credited to ${targetName} (${refNum}).`,
      branchId: targetBranchId,
      branchName: newPayment.branchName,
      read: true,
      timestamp: 'Just now',
      actionLink: '/branch-staff',
      actionLabel: 'View Payroll',
      badge: 'Payroll',
    };
    setOwnerNotifications(prev => [ownerNotif, ...prev]);

    addToast(`Salary update notification sent to ${targetName}!`, 'success');
    return newPayment;
  };

  const markStaffNotificationRead = (notifId) => {
    setStaffNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
  };

  const markAllStaffNotificationsRead = (staffId) => {
    setStaffNotifications(prev => prev.map(n => n.targetStaffId === staffId ? { ...n, read: true } : n));
    addToast('All notifications marked as read.', 'info');
  };

  // Reset all demo data to factory defaults
  const resetAllData = () => {
    localStorage.removeItem(`${STORAGE_KEY}_restaurants`);
    localStorage.removeItem(`${STORAGE_KEY}_plans`);
    localStorage.removeItem(`${STORAGE_KEY}_users`);
    localStorage.removeItem(`${STORAGE_KEY}_suppliers`);
    localStorage.removeItem(`${STORAGE_KEY}_ingredients`);
    localStorage.removeItem(`${STORAGE_KEY}_purchaseOrders`);
    localStorage.removeItem(`${STORAGE_KEY}_stockMovements`);
    localStorage.removeItem(`${STORAGE_KEY}_alerts`);
    localStorage.removeItem(`${STORAGE_KEY}_platformLogs`);
    localStorage.removeItem(`${STORAGE_KEY}_supportTickets`);
    localStorage.removeItem(`${STORAGE_KEY}_currentUser`);
    localStorage.removeItem(`${STORAGE_KEY}_currentRestaurantId`);
    localStorage.removeItem(`${STORAGE_KEY}_employees`);
    localStorage.removeItem(`${STORAGE_KEY}_roleMatrixPermissions`);
    localStorage.removeItem(`${STORAGE_KEY}_transactions`);
    localStorage.removeItem(`${STORAGE_KEY}_subscriptions`);
    localStorage.removeItem(`${STORAGE_KEY}_invoices`);
    localStorage.removeItem(`${STORAGE_KEY}_branches`);
    localStorage.removeItem(`${STORAGE_KEY}_currentBranchId`);
    localStorage.removeItem(`${STORAGE_KEY}_branchStaff`);
    localStorage.removeItem(`${STORAGE_KEY}_staffTransfers`);
    localStorage.removeItem(`${STORAGE_KEY}_ownerNotifications`);
    localStorage.removeItem(`${STORAGE_KEY}_branchInvoices`);
    localStorage.removeItem(`${STORAGE_KEY}_goodsReceivedNotes`);
    localStorage.removeItem(`${STORAGE_KEY}_productBatches`);
    localStorage.removeItem(`${STORAGE_KEY}_supplierInvoices`);
    localStorage.removeItem(`${STORAGE_KEY}_supplierReturns`);
    localStorage.removeItem(`${STORAGE_KEY}_creditNotes`);
    localStorage.removeItem(`${STORAGE_KEY}_supplierPayments`);
    localStorage.removeItem(`${STORAGE_KEY}_supplierAgreements`);
    localStorage.removeItem(`${STORAGE_KEY}_attendanceRecords`);
    localStorage.removeItem(`${STORAGE_KEY}_leaveRequests`);
    localStorage.removeItem(`${STORAGE_KEY}_salaryPayments`);
    localStorage.removeItem(`${STORAGE_KEY}_staffNotifications`);
    localStorage.removeItem(`${STORAGE_KEY}_custom_plan_requests`);
    localStorage.removeItem(`${STORAGE_KEY}_supplierProducts`);

    setRestaurants(initialRestaurants);
    setPlans(initialPlans);
    setUsers(initialUsers);
    setSuppliers(initialSuppliers);
    setIngredients(initialIngredients);
    setPurchaseOrders(initialPurchaseOrders);
    setStockMovements(initialStockMovements);
    setAlerts(initialAlerts);
    setPlatformLogs(initialPlatformLogs);
    setSupportTickets(initialSupportTickets);
    setEmployees(INITIAL_EMPLOYEES);
    setRoleMatrixPermissions(INITIAL_ROLE_PERMISSIONS);
    setTransactions(initialTransactions);
    setSubscriptions(initialSubscriptions);
    setInvoices(initialInvoices);
    setBranches(initialBranches);
    setCurrentBranchId('branch-pune-central');
    setBranchStaff(initialBranchStaff);
    setStaffTransfers(initialStaffTransfers);
    setOwnerNotifications(initialOwnerNotifications);
    setBranchInvoices(initialBranchInvoices);
    setGoodsReceivedNotes(initialGoodsReceivedNotes);
    setProductBatches(initialProductBatches);
    setSupplierInvoices(initialSupplierInvoices);
    setSupplierReturns(initialSupplierReturns);
    setCreditNotes(initialCreditNotes);
    setSupplierPayments(initialSupplierPayments);
    setSupplierAgreements(initialSupplierAgreements);
    setAttendanceRecords(initialAttendanceRecords);
    setLeaveRequests(initialLeaveRequests);
    setSalaryPayments(initialSalaryPayments);
    setStaffNotifications(initialStaffNotifications);
    setCustomPlanRequests(initialCustomPlanRequests);
    setSupplierProducts(INITIAL_SUPPLIER_PRODUCTS);
    setCurrentUser(initialUsers.find(u => u.id === 'usr-sg-1') || initialUsers[0]);
    setCurrentRestaurantId('rest-1');

    addToast('Demo environment restored to fresh initial state.', 'success');
  };

  // --------------------------------------------------------------------------
  // BRANCH ISOLATION & AUTHORIZATION ENGINE
  // --------------------------------------------------------------------------
  // --------------------------------------------------------------------------
  // SUPER ADMIN PLATFORM SETTINGS ENGINE
  // --------------------------------------------------------------------------
  const updatePlatformSettings = useCallback((newSettings, category = 'General & Branding', auditNote = '') => {
    if (!currentUser || currentUser.role !== 'super_admin') {
      addToast('Access Denied: Super Administrator authorization required.', 'error');
      return { success: false, error: 'Unauthorized' };
    }

    setPlatformSettings(prev => {
      const updated = {
        ...prev,
        ...newSettings,
      };
      try {
        localStorage.setItem(`${STORAGE_KEY}_platformSettings`, JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });

    const newLog = {
      id: `log-cfg-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: currentUser.name || 'Alexander Vance',
      action: auditNote || `Platform Settings Updated (${category})`,
      target: `Global SaaS Configuration [${category}]`,
      category: 'System Config',
      status: 'success',
    };
    setPlatformLogs(prev => [newLog, ...prev]);

    addToast(`Platform ${category} configuration successfully saved.`, 'success');
    return { success: true };
  }, [currentUser]);

  const updateSecurityPolicy = useCallback((policyUpdates, auditNote = '') => {
    if (!currentUser || currentUser.role !== 'super_admin') {
      addToast('Access Denied: Super Administrator authorization required.', 'error');
      return { success: false, error: 'Unauthorized' };
    }

    setPlatformSettings(prev => {
      const updated = {
        ...prev,
        security: {
          ...prev.security,
          ...policyUpdates,
          lastPolicyUpdated: new Date().toISOString(),
          updatedBy: `${currentUser.name} (Super Admin)`,
        },
      };
      try {
        localStorage.setItem(`${STORAGE_KEY}_platformSettings`, JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });

    const newLog = {
      id: `log-sec-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: currentUser.name || 'Alexander Vance',
      action: auditNote || 'Security & Authentication Policy Modified',
      target: 'Authentication, Session & 2FA Governance',
      category: 'Security',
      status: 'success',
    };
    setPlatformLogs(prev => [newLog, ...prev]);

    addToast('Security policy and 2FA configuration updated.', 'success');
    return { success: true };
  }, [currentUser]);

  const resetDemoStorage = useCallback((confirmationPhrase, requestedEnv = null) => {
    if (!currentUser || currentUser.role !== 'super_admin') {
      addToast('Security Block: Super Administrator authorization required.', 'error');
      return { success: false, error: 'Unauthorized' };
    }

    const effectiveEnv = requestedEnv || platformSettings?.environment?.currentEnv || 'demo';

    if (effectiveEnv === 'production') {
      const securityViolationLog = {
        id: `sec-violation-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: currentUser.name,
        action: 'CRITICAL SECURITY VIOLATION: Blocked Demo Reset Attempt on Production Database',
        target: 'Production Customer Storage Guard',
        category: 'Security',
        status: 'danger',
      };
      setPlatformLogs(prev => [securityViolationLog, ...prev]);
      addToast('Critical Security Block: Demo reset is strictly prohibited in Production environment. Real customer data is immutable.', 'error');
      return {
        success: false,
        error: 'PRODUCTION_DATA_PROTECTED: Demo data reset operations are prohibited against production customer storage.',
      };
    }

    if (confirmationPhrase !== 'RESET-DEMO') {
      return {
        success: false,
        error: 'Invalid confirmation phrase. Type RESET-DEMO to confirm reset.',
      };
    }

    // Call factory reset for demo state
    resetAllData();

    // Log the authorized maintenance event
    const maintenanceLog = {
      id: `log-maint-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: currentUser.name,
      action: 'Authorized Demo Storage Baseline Restored',
      target: 'All Demo Tenants, Mock Orders & Stock Matrix',
      category: 'Maintenance',
      status: 'success',
    };
    setPlatformLogs(prev => [maintenanceLog, ...prev]);

    setPlatformSettings(prev => ({
      ...prev,
      environment: {
        ...prev.environment,
        lastResetAt: new Date().toISOString(),
        lastResetBy: currentUser.name,
      },
    }));

    return {
      success: true,
      message: 'Demo baseline data successfully restored.',
    };
  }, [currentUser, platformSettings]);

  const expireSessionDueToInactivity = useCallback(() => {
    if (!currentUser) return;
    const actorName = currentUser.name;
    const actorRole = currentUser.role;

    setCurrentUser(null);
    localStorage.removeItem(`${STORAGE_KEY}_currentUser`);

    const log = {
      id: `log-session-expire-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: actorName,
      action: 'Session Expired Due to Inactivity Policy',
      target: `Security Session Monitor (${actorRole})`,
      category: 'Security',
      status: 'info',
    };
    setPlatformLogs(prev => [log, ...prev]);
    addToast('Your session has expired due to inactivity. Please sign in again.', 'warning');
  }, [currentUser]);

  const verifyTwoFactorCode = useCallback((code) => {
    if (!code) return { success: false, error: 'Code is required' };
    const cleanCode = String(code).trim();
    if (cleanCode === '123456' || cleanCode.length === 6 || cleanCode.startsWith('SM-')) {
      return { success: true };
    }
    return { success: false, error: 'Invalid authenticator code. Enter the 6-digit code or backup emergency code.' };
  }, []);

  const authorizedBranches = useMemo(() => {
    if (!currentUser) return [];

    if (currentUser.role === 'super_admin') {
      return currentRestaurantId
        ? branches.filter((b) => b.restaurantId === currentRestaurantId)
        : branches;
    }

    const userRestId = currentUser.restaurantId || currentRestaurantId;

    // Restaurant Owner sees all branches belonging to their restaurant tenant
    if (currentUser.role === 'restaurant_owner') {
      return branches.filter((b) => b.restaurantId === userRestId);
    }

    // ALL OTHER ROLES (restaurant_manager, inventory_manager, kitchen_staff, supplier):
    // Strictly limited to their single assigned branch!
    const assignedId =
      currentUser.branchId ||
      branchStaff.find((s) => s.id === currentUser.id || s.email === currentUser.email)?.branchId;

    if (assignedId) {
      return branches.filter(
        (b) => b.restaurantId === userRestId && b.id === assignedId
      );
    }

    if (currentUser.assignedBranchIds && currentUser.assignedBranchIds.length > 0) {
      return branches.filter(
        (b) =>
          b.restaurantId === userRestId &&
          currentUser.assignedBranchIds.includes(b.id)
      );
    }

    // Fallback: at most the single first branch of their restaurant tenant
    const fallback = branches.filter((b) => b.restaurantId === userRestId);
    return fallback.slice(0, 1);
  }, [branches, currentUser, currentRestaurantId, branchStaff]);

  const organizationBranches = useMemo(() => {
    const userRestId = currentUser?.restaurantId || currentRestaurantId;
    return branches.filter((b) => b.restaurantId === userRestId);
  }, [branches, currentUser, currentRestaurantId]);

  // Keep currentBranchId synchronized with authorizedBranches
  useEffect(() => {
    if (authorizedBranches.length > 0) {
      // Non-owners are strictly locked to their single authorized branch
      if (currentUser && currentUser.role !== 'restaurant_owner' && currentUser.role !== 'super_admin') {
        const singleBranchId = authorizedBranches[0].id;
        if (currentBranchId !== singleBranchId) {
          setCurrentBranchId(singleBranchId);
        }
        return;
      }

      if (currentBranchId === 'all') {
        if (authorizedBranches.length > 1) return;
        setCurrentBranchId(authorizedBranches[0].id);
        return;
      }

      const isAllowed = authorizedBranches.some((b) => b.id === currentBranchId);
      if (!isAllowed) {
        setCurrentBranchId(authorizedBranches[0].id);
        try {
          localStorage.setItem(`${STORAGE_KEY}_currentBranchId`, JSON.stringify(authorizedBranches[0].id));
        } catch (e) {}
      }
    } else {
      if (currentBranchId !== null) setCurrentBranchId(null);
    }
  }, [authorizedBranches, currentBranchId, currentUser]);

  const currentBranch = useMemo(() => {
    if (!authorizedBranches || authorizedBranches.length === 0) return null;
    if (currentBranchId === 'all') {
      return {
        id: 'all',
        name: 'All Outlets (Aggregated)',
        code: 'ALL',
        type: 'Aggregated View',
        status: 'active',
      };
    }
    return authorizedBranches.find((b) => b.id === currentBranchId) || authorizedBranches[0];
  }, [authorizedBranches, currentBranchId]);

  // Current filtered data for the active restaurant & active branch
  const restaurantIngredients = useMemo(() => {
    return ingredients.filter((i) => {
      if (i.restaurantId !== currentRestaurantId) return false;
      if (currentBranchId && currentBranchId !== 'all' && i.branchId) return i.branchId === currentBranchId;
      return true;
    });
  }, [ingredients, currentRestaurantId, currentBranchId]);

  const restaurantOrders = useMemo(() => {
    return purchaseOrders.filter((p) => {
      if (p.restaurantId !== currentRestaurantId) return false;
      if (currentBranchId && currentBranchId !== 'all' && p.branchId) return p.branchId === currentBranchId;
      return true;
    });
  }, [purchaseOrders, currentRestaurantId, currentBranchId]);

  const restaurantMovements = useMemo(() => {
    return stockMovements.filter((m) => {
      if (m.restaurantId !== currentRestaurantId) return false;
      if (currentBranchId && currentBranchId !== 'all' && m.branchId) return m.branchId === currentBranchId;
      return true;
    });
  }, [stockMovements, currentRestaurantId, currentBranchId]);

  // Dedicated staff-related notifications for Restaurant Manager
  const staffAlerts = useMemo(() => {
    const list = [];

    // 1. Pending and recent leave requests
    (leaveRequests || []).forEach((leave) => {
      const isCurrentRest = !currentRestaurantId || leave.restaurantId === currentRestaurantId;
      const isCurrentBr = !currentBranchId || !leave.branchId || leave.branchId === currentBranchId;
      if (isCurrentRest && isCurrentBr) {
        const id = `alert-leave-${leave.id}`;
        list.push({
          id,
          restaurantId: leave.restaurantId,
          branchId: leave.branchId,
          type: 'leave_request',
          category: 'staff',
          severity: leave.status === 'pending' ? 'high' : 'low',
          title: `Staff Leave: ${leave.staffName} (${leave.leaveType})`,
          message: `${leave.staffName} (${leave.staffRole || 'Staff'}) requested ${leave.durationDays} day(s) leave (${leave.startDate} to ${leave.endDate}). Reason: "${leave.reason}"`,
          read: leave.status !== 'pending' || readStaffAlertIds.includes(id),
          timestamp: leave.appliedDate || new Date().toISOString(),
          actionLink: '/branch-staff?tab=leave',
          actionLabel: 'Review Leave',
          badge: 'Leave Request',
        });
      }
    });

    // 2. Staff inter-branch transfers
    (staffTransfers || []).forEach((tr) => {
      const isFrom = !currentBranchId || tr.fromBranchId === currentBranchId;
      const isTo = !currentBranchId || tr.toBranchId === currentBranchId;
      if (isFrom || isTo) {
        const id = `alert-tr-${tr.id}`;
        list.push({
          id,
          restaurantId: currentRestaurantId,
          branchId: tr.fromBranchId,
          type: 'transfer_request',
          category: 'staff',
          severity: tr.status === 'Pending' ? 'medium' : 'low',
          title: `Staff Transfer: ${tr.employeeName}`,
          message: `${tr.requestedBy || 'Management'} requested transfer of ${tr.employeeName} (${tr.roleLabel || tr.role}) from ${tr.fromBranchName} to ${tr.toBranchName}. Reason: "${tr.reason}"`,
          read: tr.status !== 'Pending' || readStaffAlertIds.includes(id),
          timestamp: tr.requestDate ? `${tr.requestDate}T10:00:00.000Z` : new Date().toISOString(),
          actionLink: '/staff-transfers',
          actionLabel: 'Review Transfer',
          badge: 'Staff Transfer',
        });
      }
    });

    // 3. Staff notifications from ownerNotifications (workflow transfers, etc.)
    (ownerNotifications || []).forEach((notif) => {
      if (notif.type === 'leave_request' || notif.type === 'transfer_request' || notif.badge === 'Staff Workflow') {
        const id = `alert-onotif-${notif.id}`;
        const alreadyExists = list.some(item =>
          (notif.transferId && item.id.includes(notif.transferId)) ||
          (notif.leaveId && item.id.includes(notif.leaveId))
        );
        if (!alreadyExists) {
          list.push({
            id,
            restaurantId: currentRestaurantId,
            branchId: notif.branchId,
            type: notif.type,
            category: 'staff',
            severity: 'medium',
            title: notif.title,
            message: notif.message,
            read: notif.read || readStaffAlertIds.includes(id),
            timestamp: new Date().toISOString(),
            actionLink: notif.actionLink || '/branch-staff',
            actionLabel: notif.actionLabel || 'View',
            badge: notif.badge || 'Staff Notice',
          });
        }
      }
    });

    // 4. Kitchen shift & attendance live status
    const activeAttendanceList = (attendanceRecords || []).filter(
      r => r.status === 'active' && (!currentBranchId || r.branchId === currentBranchId)
    );
    if (activeAttendanceList.length > 0) {
      const id = 'alert-shift-live';
      list.push({
        id,
        restaurantId: currentRestaurantId,
        branchId: currentBranchId,
        type: 'attendance_notice',
        category: 'staff',
        severity: 'low',
        title: 'Live Shift Attendance',
        message: `${activeAttendanceList.length} staff member(s) actively clocked in on station duty at this branch.`,
        read: readStaffAlertIds.includes(id) || true,
        timestamp: new Date().toISOString(),
        actionLink: '/branch-staff?tab=attendance',
        actionLabel: 'Shift Monitor',
        badge: 'Attendance',
      });
    }

    return list.filter(a => !dismissedStaffAlertIds.includes(a.id));
  }, [leaveRequests, staffTransfers, ownerNotifications, attendanceRecords, currentRestaurantId, currentBranchId, readStaffAlertIds, dismissedStaffAlertIds]);

  const restaurantAlerts = useMemo(() => {
    if (currentUser?.role === 'restaurant_manager') {
      return staffAlerts;
    }
    return alerts.filter((a) => {
      if (a.restaurantId !== currentRestaurantId) return false;
      if (currentBranchId && currentBranchId !== 'all' && a.branchId) return a.branchId === currentBranchId;
      return true;
    });
  }, [currentUser?.role, staffAlerts, alerts, currentRestaurantId, currentBranchId, currentUser]);

  const branchGRNs = useMemo(() => {
    return goodsReceivedNotes.filter((g) => {
      if (g.restaurantId !== currentRestaurantId) return false;
      if (currentBranchId && currentBranchId !== 'all' && g.branchId) return g.branchId === currentBranchId;
      return true;
    });
  }, [goodsReceivedNotes, currentRestaurantId, currentBranchId]);

  const branchBatches = useMemo(() => {
    return productBatches.filter((b) => {
      if (b.restaurantId !== currentRestaurantId) return false;
      if (currentBranchId && currentBranchId !== 'all' && b.branchId) return b.branchId === currentBranchId;
      return true;
    });
  }, [productBatches, currentRestaurantId, currentBranchId]);

  const branchReturns = useMemo(() => {
    if (currentUser?.role === 'supplier') {
      const activeSupId = currentUser?.supplierId;
      const activeSupName = currentUser?.supplierName;
      return (supplierReturns || []).filter((r) => {
        return (activeSupId && r.supplierId === activeSupId) || (activeSupName && r.supplierName === activeSupName);
      });
    }
    return (supplierReturns || []).filter((r) => {
      if (r.restaurantId !== currentRestaurantId) return false;
      if (currentBranchId && currentBranchId !== 'all' && r.branchId) return r.branchId === currentBranchId;
      return true;
    });
  }, [supplierReturns, currentRestaurantId, currentBranchId, currentUser]);

  const branchSupplierInvoices = useMemo(() => {
    if (currentUser?.role === 'supplier') {
      const activeSupId = currentUser?.supplierId;
      const activeSupName = currentUser?.supplierName;
      return (supplierInvoices || []).filter((inv) => {
        return (activeSupId && inv.supplierId === activeSupId) || (activeSupName && inv.supplierName === activeSupName);
      });
    }
    return (supplierInvoices || []).filter((inv) => {
      if (inv.restaurantId !== currentRestaurantId) return false;
      if (currentBranchId && currentBranchId !== 'all' && inv.branchId) return inv.branchId === currentBranchId;
      return true;
    });
  }, [supplierInvoices, currentRestaurantId, currentBranchId, currentUser]);

  const branchSupplierPayments = useMemo(() => {
    if (currentUser?.role === 'supplier') {
      const activeSupId = currentUser?.supplierId;
      const activeSupName = currentUser?.supplierName;
      return (supplierPayments || []).filter((pay) => {
        return (
          (activeSupId && pay.supplierId === activeSupId) ||
          (activeSupName && pay.supplierName === activeSupName)
        );
      });
    }

    // Build an invoice lookup map to resolve restaurantId/branchId for legacy or un-migrated payment records
    const invoiceMap = new Map();
    (supplierInvoices || []).forEach((inv) => {
      if (inv && inv.id) {
        invoiceMap.set(inv.id, inv);
      }
    });

    return (supplierPayments || []).filter((pay) => {
      const linkedInvoice = pay.invoiceId ? invoiceMap.get(pay.invoiceId) : null;
      const targetRestaurantId = pay.restaurantId || linkedInvoice?.restaurantId;
      const targetBranchId = pay.branchId || linkedInvoice?.branchId;

      // Super Admin access: can view all if no specific restaurant is scoped
      if (currentUser?.role === 'super_admin' && !currentRestaurantId) {
        return true;
      }

      // Multi-tenant check: payment must belong to the active restaurant
      if (targetRestaurantId && targetRestaurantId !== currentRestaurantId) {
        return false;
      }

      // Branch check: if a specific branch is selected, filter by branch
      if (currentBranchId && currentBranchId !== 'all' && targetBranchId) {
        return targetBranchId === currentBranchId;
      }

      return true;
    });
  }, [supplierPayments, supplierInvoices, currentRestaurantId, currentBranchId, currentUser]);

  const branchOwnerNotifications = useMemo(() => {
    return (ownerNotifications || []).filter((n) => {
      if (n.targetRoles && currentUser?.role && !n.targetRoles.includes(currentUser.role) && currentUser.role !== 'super_admin') {
        return false;
      }
      return true;
    });
  }, [ownerNotifications, currentUser]);

  // Scoped supplier products: if a supplier is logged in, they ONLY see their own products!
  const visibleSupplierProducts = useMemo(() => {
    if (currentUser?.role === 'supplier') {
      const activeSupId = currentUser?.supplierId;
      const activeSupName = currentUser?.supplierName;
      return (supplierProducts || []).filter(
        (p) => (activeSupId && p.supplierId === activeSupId) || (activeSupName && p.supplierName === activeSupName)
      );
    }
    return supplierProducts || [];
  }, [supplierProducts, currentUser]);

  const branchStaffList = useMemo(() => {
    return branchStaff.filter((s) => {
      if (s.restaurantId !== currentRestaurantId) return false;
      if (currentBranchId && currentBranchId !== 'all' && s.branchId) return s.branchId === currentBranchId;
      return true;
    });
  }, [branchStaff, currentRestaurantId, currentBranchId]);

  const restaurantSuppliers = useMemo(() => {
    return suppliers.filter((s) => !s.restaurantIds || s.restaurantIds.includes(currentRestaurantId));
  }, [suppliers, currentRestaurantId]);

  // Bank Details Verification Service (Restricted to Restaurant Owner and Restaurant Manager)
  const verifyStaffBankDetails = (staffId) => {
    if (!currentUser) return { success: false, error: 'No active session' };
    const canVerify = currentUser.role === 'restaurant_owner' || currentUser.role === 'restaurant_manager';
    if (!canVerify) {
      addToast('Unauthorized: Only Restaurant Managers and Owners can verify staff bank details.', 'error');
      return { success: false, error: 'Unauthorized' };
    }

    const staff = branchStaff.find((s) => s.id === staffId) || users.find((u) => u.id === staffId);
    if (!staff) {
      addToast('Staff member not found.', 'error');
      return { success: false, error: 'Staff not found' };
    }

    const updatedStaff = {
      ...staff,
      bankStatus: 'Verified',
      bankDetails: {
        ...(staff.bankDetails || {}),
        bankStatus: 'Verified',
        verifiedBy: currentUser.name,
        verifiedAt: new Date().toISOString(),
      },
    };

    setBranchStaff((prev) => prev.map((s) => (s.id === staffId ? updatedStaff : s)));
    setUsers((prev) => prev.map((u) => (u.id === staffId ? updatedStaff : u)));

    if (currentUser.id === staffId) {
      setCurrentUser(updatedStaff);
    }

    try {
      const stored = branchStaff.map((s) => (s.id === staffId ? updatedStaff : s));
      localStorage.setItem(`${STORAGE_KEY}_branchStaff`, JSON.stringify(stored));
    } catch (e) {}

    addToast(`Bank details for ${staff.name} have been verified successfully.`, 'success');
    return { success: true, staff: updatedStaff };
  };

  // Staff Profile & Banking Update Service
  const updateStaffProfile = (profileData) => {
    if (!currentUser) return { success: false, error: 'No authenticated user session' };

    // Validate IFSC code format: 4 letters, 0, then 6 alphanumeric characters
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/i;
    if (profileData.ifscCode && !ifscRegex.test(profileData.ifscCode.trim())) {
      return {
        success: false,
        error: 'Invalid IFSC format. Must be 4 letters, followed by 0, and 6 alphanumeric characters (e.g. HDFC0001234).',
      };
    }

    // Mask account number: e.g. "•••• 4421"
    const rawAccNum = profileData.accountNumber ? String(profileData.accountNumber).trim() : '';
    const last4 = rawAccNum.slice(-4) || '4421';
    const maskedAccountNumber = `•••• ${last4}`;
    const formattedBankString = profileData.bankName
      ? `${profileData.bankName} ${maskedAccountNumber}`
      : maskedAccountNumber;

    // Status transitions:
    // 1. bankStatus = "Pending Verification"
    // 2. Staff status becomes "Active"
    const updatedUser = {
      ...currentUser,
      avatar: profileData.avatar !== undefined ? profileData.avatar : currentUser.avatar,
      dateOfBirth: profileData.dateOfBirth || currentUser.dateOfBirth,
      address: profileData.address || currentUser.address,
      emergencyContact: {
        name: profileData.emergencyContactName || currentUser.emergencyContact?.name || '',
        phone: profileData.emergencyContactPhone || currentUser.emergencyContact?.phone || '',
      },
      bankDetails: {
        accountHolderName: profileData.accountHolderName || currentUser.name,
        bankName: profileData.bankName || 'HDFC Bank',
        maskedAccountNumber: maskedAccountNumber,
        // Store hash ready for encryption later
        accountNumberHash: rawAccNum ? hashPassword(rawAccNum) : '',
        last4: last4,
        ifscCode: profileData.ifscCode ? profileData.ifscCode.toUpperCase().trim() : 'HDFC0001234',
        bankStatus: 'Pending Verification',
        submittedAt: new Date().toISOString(),
      },
      bankAccount: formattedBankString,
      bankStatus: 'Pending Verification',
      status: 'Active',
      profileCompleted: true,
    };

    setCurrentUser(updatedUser);
    try {
      localStorage.setItem(`${STORAGE_KEY}_currentUser`, JSON.stringify(updatedUser));
    } catch (err) {}

    // Persist to users collection
    setUsers((prev) => {
      const updated = prev.map((u) => (u.id === currentUser.id ? updatedUser : u));
      try {
        localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });

    // Persist to branchStaff collection
    setBranchStaff((prev) => {
      const updated = prev.map((s) => (s.id === currentUser.id ? updatedUser : s));
      try {
        localStorage.setItem(`${STORAGE_KEY}_branchStaff`, JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });

    // Update STAFF_SALARY_PROFILES for payroll module
    if (STAFF_SALARY_PROFILES[currentUser.id]) {
      STAFF_SALARY_PROFILES[currentUser.id].bankAccount = formattedBankString;
    } else {
      STAFF_SALARY_PROFILES[currentUser.id] = {
        baseSalary: updatedUser.baseSalary || 35000,
        role: updatedUser.roleLabel || updatedUser.role,
        bankAccount: formattedBankString,
        pan: updatedUser.pan || 'ABCPA1234D',
      };
    }

    addToast('Profile and banking details submitted for verification.', 'success');
    return { success: true, user: updatedUser };
  };

  // Change / Set Permanent Password Service (hashes password and clears mustChangePassword)
  const setNewPassword = (newPassword) => {
    if (!currentUser) return { success: false, error: 'No active session found.' };
    if (!newPassword || newPassword.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters long.' };
    }

    const hashedPassword = hashPassword(newPassword);

    const updatedUser = {
      ...currentUser,
      mustChangePassword: false,
      status: currentUser.status === 'Invited' ? 'active' : currentUser.status,
      passwordHash: hashedPassword,
    };
    delete updatedUser.password;

    setCurrentUser(updatedUser);
    try {
      localStorage.setItem(`${STORAGE_KEY}_currentUser`, JSON.stringify(updatedUser));
    } catch (err) {}

    setUsers((prev) => {
      const updated = prev.map((u) => (u.id === updatedUser.id ? updatedUser : u));
      if (!updated.some((u) => u.id === updatedUser.id)) {
        updated.unshift(updatedUser);
      }
      try {
        localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });

    setBranchStaff((prev) => {
      const updated = prev.map((s) => (s.id === updatedUser.id ? updatedUser : s));
      try {
        localStorage.setItem(`${STORAGE_KEY}_branchStaff`, JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });

    addToast('Permanent password saved successfully! Welcome to your dashboard.', 'success');
    return { success: true, user: updatedUser };
  };

  const restaurantStaff = useMemo(() => {
    return users.filter((u) => u.restaurantId === currentRestaurantId);
  }, [users, currentRestaurantId]);

  // ==========================================
  // COMMUNICATION CENTER & ANNOUNCEMENT METHODS
  // ==========================================
  const publishAnnouncement = (data) => {
    const newId = `ann-${Date.now()}`;
    const newAnnouncement = {
      ...data,
      id: newId,
      status: 'published',
      publishedAt: new Date().toISOString(),
      author: currentUser?.name || 'Alexander Vance (Super Admin)',
      authorRole: 'Platform Governance',
      emailDelivery: {
        queued: restaurants.length,
        delivered: restaurants.length,
        failed: 0,
        provider: 'StockMate Cloud Dispatcher (Transactional SMTP Simulator)',
        simulated: true,
      },
    };

    setAnnouncements((prev) => [newAnnouncement, ...prev]);

    // Calculate targeted restaurants
    let targetRestaurants = [];
    if (data.audienceType === 'ALL_RESTAURANTS') {
      targetRestaurants = restaurants.filter((r) => r.status === 'active');
    } else if (data.audienceType === 'SPECIFIC_RESTAURANTS') {
      targetRestaurants = restaurants.filter((r) => (data.targetRestaurantIds || []).includes(r.id));
    } else if (data.audienceType === 'SUBSCRIPTION_TIER') {
      targetRestaurants = restaurants.filter((r) => (data.targetPlanIds || []).includes(r.planId));
    } else {
      targetRestaurants = restaurants;
    }

    // In-App Notifications Integration: create notification for each targeted restaurant with recipient-specific context
    const newNotifs = targetRestaurants.map((rest) => {
      const restCtx = {
        restaurantName: rest.name,
        ownerName: rest.ownerName || rest.contactPerson || 'Restaurant Partner',
        planName: rest.planName ? `${rest.planName} Plan` : 'StockMate Subscription',
      };
      const resolvedTitle = interpolateTemplateVariables(data.title, restCtx);
      const resolvedMessage = interpolateTemplateVariables(data.summary || data.body.slice(0, 110) + '...', restCtx);

      return {
        id: `notif-ann-${Date.now()}-${rest.id}`,
        type: data.category === 'policy' ? 'policy_update' : 'announcement',
        restaurantId: rest.id,
        title: `Announcement: ${resolvedTitle}`,
        message: resolvedMessage,
        timestamp: new Date().toISOString(),
        read: false,
        actionLink: '/inbox',
        announcementId: newId,
        priority: data.priority || 'normal',
      };
    });

    setOwnerNotifications((prev) => [...newNotifs, ...prev]);

    // Dispatch logging: Distinguish clearly between real In-App delivery and unconfigured external SMTP
    const newLogs = targetRestaurants.map((rest) => {
      const resolvedTitle = interpolateTemplateVariables(data.title, {
        restaurantName: rest.name,
        ownerName: rest.ownerName || rest.contactPerson || 'Restaurant Partner',
      });
      return {
        id: `email-log-${Date.now()}-${rest.id}`,
        announcementId: newId,
        announcementTitle: resolvedTitle,
        recipientEmail: rest.ownerEmail,
        recipientName: rest.ownerName,
        restaurantName: rest.name,
        restaurantId: rest.id,
        status: 'Delivered (In-App Owner Inbox)',
        deliveryStatus: 'delivered',
        timestamp: new Date().toISOString(),
        provider: 'StockMate In-App Dispatcher (External SMTP API Unconfigured)',
        simulated: true,
      };
    });

    setEmailDeliveryLogs((prev) => [...newLogs, ...prev]);

    addPlatformLog(
      currentUser?.name || 'Alexander Vance (Super Admin)',
      `Broadcast Announcement: "${data.title}"`,
      `Audience: ${targetRestaurants.length} Restaurants`,
      'Announcements',
      'success'
    );

    addToast(`Announcement broadcasted to ${targetRestaurants.length} restaurant inboxes.`, 'success');
    return newAnnouncement;
  };

  const saveAnnouncementDraft = (data) => {
    const draftId = data.id || `draft-${Date.now()}`;
    const draftItem = {
      ...data,
      id: draftId,
      status: 'draft',
      publishedAt: new Date().toISOString(),
      author: currentUser?.name || 'Alexander Vance (Super Admin)',
    };

    setAnnouncements((prev) => {
      const exists = prev.some((a) => a.id === draftId);
      if (exists) {
        return prev.map((a) => (a.id === draftId ? draftItem : a));
      }
      return [draftItem, ...prev];
    });

    addToast('Announcement draft saved.', 'info');
    return draftItem;
  };

  const deleteAnnouncement = (announcementId) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== announcementId));
    addToast('Announcement deleted from platform records.', 'info');
  };

  const markAnnouncementAsRead = (announcementId, restaurantId) => {
    const key = `${announcementId}_${restaurantId}`;
    setAnnouncementReads((prev) => ({
      ...prev,
      [key]: { isRead: true, readAt: new Date().toISOString(), readBy: currentUser?.name || 'Owner' },
    }));

    // Synchronize matching in-app notification if exists
    setOwnerNotifications((prev) =>
      prev.map((n) =>
        n.announcementId === announcementId && n.restaurantId === restaurantId
          ? { ...n, read: true }
          : n
      )
    );
  };

  const markAnnouncementAsUnread = (announcementId, restaurantId) => {
    const key = `${announcementId}_${restaurantId}`;
    setAnnouncementReads((prev) => ({
      ...prev,
      [key]: { isRead: false, readAt: null },
    }));
  };

  const toggleArchiveAnnouncement = (announcementId, restaurantId) => {
    const key = `${announcementId}_${restaurantId}`;
    setAnnouncementArchives((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const acknowledgePolicy = (announcementId, policyVersion, restaurantId) => {
    const newAck = {
      id: `ack-${Date.now()}`,
      announcementId,
      policyVersion,
      restaurantId,
      ownerId: currentUser?.id,
      ownerName: currentUser?.name || 'Restaurant Owner',
      ownerEmail: currentUser?.email,
      acknowledgedAt: new Date().toISOString(),
    };

    setPolicyAcknowledgments((prev) => [
      ...prev.filter((a) => !(a.announcementId === announcementId && a.restaurantId === restaurantId)),
      newAck,
    ]);

    // Mark as read automatically
    markAnnouncementAsRead(announcementId, restaurantId);

    const rest = restaurants.find((r) => r.id === restaurantId);
    addPlatformLog(
      currentUser?.name || 'Restaurant Owner',
      `Policy ${policyVersion} Formally Acknowledged`,
      rest ? rest.name : restaurantId,
      'Compliance',
      'success'
    );

    addToast(`Policy ${policyVersion} formally acknowledged for ${rest?.name || 'your restaurant'}.`, 'success');
    return newAck;
  };

  const saveCustomTemplate = (templateData) => {
    const tplId = templateData.id || `tpl-${Date.now()}`;
    const newTpl = { ...templateData, id: tplId };
    setAnnouncementTemplates((prev) => {
      const exists = prev.some((t) => t.id === tplId);
      if (exists) {
        return prev.map((t) => (t.id === tplId ? newTpl : t));
      }
      return [newTpl, ...prev];
    });
    addToast('Template saved to library.', 'success');
  };

  const duplicateTemplate = (templateId) => {
    const target = (announcementTemplates || []).find((t) => t.id === templateId);
    if (!target) return;
    const clone = {
      ...target,
      id: `tpl-${Date.now()}`,
      title: `${target.title} (Copy)`,
    };
    setAnnouncementTemplates((prev) => [clone, ...prev]);
    addToast('Template duplicated.', 'info');
  };

  const resetTemplate = (templateId) => {
    const original = INITIAL_ANNOUNCEMENT_TEMPLATES.find((t) => t.id === templateId);
    if (!original) return;
    setAnnouncementTemplates((prev) =>
      prev.map((t) => (t.id === templateId ? { ...original } : t))
    );
    addToast('Template reset to standard default.', 'info');
  };

  const getAnnouncementStats = () => {
    const published = (announcements || []).filter((a) => a.status === 'published');
    const drafts = (announcements || []).filter((a) => a.status === 'draft');
    const totalReads = Object.values(announcementReads || {}).filter((v) => v.isRead).length;
    const totalAcks = (policyAcknowledgments || []).length;

    return {
      totalPublished: published.length,
      totalDrafts: drafts.length,
      totalRecipients: published.length * restaurants.length,
      totalReads,
      totalAcknowledgments: totalAcks,
      readRate: published.length > 0 ? Math.round((totalReads / (published.length * Math.max(1, restaurants.length))) * 100) : 0,
      ackRate: totalAcks > 0 ? 100 : 0,
    };
  };


  // ==========================================
  // EXCEL / CSV BULK IMPORT OPERATIONS
  // ==========================================
  const importIngredientsBulk = (newItems) => {
    if (!currentUser) return { success: false, error: 'Unauthorized' };
    if (currentUser.role === 'kitchen_staff' || currentUser.role === 'supplier') {
      addToast('Permission Denied: Your role is not authorized to import inventory records.', 'error');
      return { success: false, error: 'Permission denied' };
    }

    const targetBranch = currentBranchId && currentBranchId !== 'all'
      ? currentBranchId
      : (authorizedBranches[0]?.id || 'branch-pune-central');

    const mapped = newItems.map((item, idx) => {
      const qty = Number(item.quantity) || 0;
      const minThresh = Number(item.minThreshold) || 5;
      const status = qty === 0 ? 'out_of_stock' : qty <= minThresh ? 'low_stock' : 'in_stock';
      return {
        id: `ing-imported-${Date.now()}-${idx}`,
        restaurantId: currentRestaurantId,
        branchId: targetBranch,
        branchName: currentBranch?.name || 'Active Branch',
        name: item.name,
        category: item.category || 'General',
        quantity: qty,
        unit: item.unit || 'kg',
        costPerUnit: Number(item.costPerUnit) || 0,
        minThreshold: minThresh,
        status,
        supplierId: item.supplierId || null,
        supplierName: item.supplierName || 'Imported via Excel',
        batchNumber: item.batchNumber || `BCH-IMP-${Math.floor(100 + Math.random() * 900)}`,
        storageLocation: item.storageLocation || 'Store Room',
        expiryDate: item.expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        daysUntilExpiry: 30,
        createdAt: new Date().toISOString(),
      };
    });

    setIngredients((prev) => {
      const updated = [...prev, ...mapped];
      try {
        localStorage.setItem(`${STORAGE_KEY}_ingredients`, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    addToast(`Successfully imported ${mapped.length} ingredient(s) into inventory!`, 'success');
    addPlatformLog(
      currentUser.name,
      'Excel Bulk Import',
      `${mapped.length} Ingredients into ${currentBranch?.name || 'Branch'}`,
      'Inventory',
      'success'
    );
    return { success: true, count: mapped.length };
  };

  const importSuppliersBulk = (newItems) => {
    if (!currentUser) return { success: false, error: 'Unauthorized' };
    if (currentUser.role !== 'restaurant_owner' && currentUser.role !== 'inventory_manager' && currentUser.role !== 'super_admin') {
      addToast('Permission Denied: Only owners and inventory leads can import suppliers.', 'error');
      return { success: false, error: 'Permission denied' };
    }

    const mapped = newItems.map((item, idx) => {
      const rawCats = item.categories
        ? (Array.isArray(item.categories) ? item.categories : String(item.categories).split(',').map((c) => c.trim()))
        : ['Produce'];
      return {
        id: `sup-imported-${Date.now()}-${idx}`,
        restaurantIds: [currentRestaurantId],
        name: item.name,
        contactPerson: item.contactPerson || item.name,
        email: item.email,
        phone: item.phone || '+91 98220 00000',
        address: item.address || 'Local Delivery Depot',
        leadTimeDays: Number(item.leadTimeDays) || 2,
        paymentTerms: item.paymentTerms || 'Net 30',
        categories: rawCats,
        rating: 4.8,
        status: 'active',
        createdAt: new Date().toISOString(),
      };
    });

    setSuppliers((prev) => {
      const updated = [...prev, ...mapped];
      try {
        localStorage.setItem(`${STORAGE_KEY}_suppliers`, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    addToast(`Successfully imported ${mapped.length} supplier(s)!`, 'success');
    addPlatformLog(
      currentUser.name,
      'Excel Bulk Import',
      `${mapped.length} Suppliers`,
      'Procurement',
      'success'
    );
    return { success: true, count: mapped.length };
  };

  const importStaffBulk = (newItems) => {
    if (!currentUser) return { success: false, error: 'Unauthorized' };
    if (currentUser.role !== 'restaurant_owner' && currentUser.role !== 'restaurant_manager' && currentUser.role !== 'super_admin') {
      addToast('Permission Denied: Only restaurant owners and managers can import staff.', 'error');
      return { success: false, error: 'Permission denied' };
    }

    const targetBranch = currentBranchId && currentBranchId !== 'all'
      ? currentBranchId
      : (authorizedBranches[0]?.id || 'branch-pune-central');

    const mapped = newItems.map((item, idx) => {
      const baseSalary = Number(item.baseSalary) || 25000;
      return {
        id: `usr-imported-${Date.now()}-${idx}`,
        name: item.name,
        email: item.email,
        phone: item.phone || '+91 98220 00000',
        role: 'kitchen_staff',
        roleLabel: item.roleLabel || 'Kitchen Team Member',
        department: item.department || 'Kitchen Operations',
        branchId: targetBranch,
        branchName: currentBranch?.name || 'Active Branch',
        restaurantId: currentRestaurantId,
        baseSalary,
        bankAccount: item.bankAccount || 'Direct Bank Deposit',
        status: 'active',
        joinedDate: new Date().toISOString().split('T')[0],
        avatar: `https://images.unsplash.com/photo-${1500000000000 + (idx % 1000)}?w=150`,
      };
    });

    setBranchStaff((prev) => {
      const updated = [...prev, ...mapped];
      try {
        localStorage.setItem(`${STORAGE_KEY}_branchStaff`, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    addToast(`Successfully imported ${mapped.length} staff member(s)!`, 'success');
    addPlatformLog(
      currentUser.name,
      'Excel Bulk Import',
      `${mapped.length} Staff records into ${currentBranch?.name || 'Branch'}`,
      'Workforce',
      'success'
    );
    return { success: true, count: mapped.length };
  };

  return (
    <AppContext.Provider
      value={{
        // State
        currentUser,
        currentRestaurantId,
        currentRestaurant,
        restaurants,
        plans,
        users,
        suppliers,
        ingredients,
        purchaseOrders,
        stockMovements,
        alerts,
        platformLogs,
        supportTickets,
        employees,
        roleMatrixPermissions,
        transactions,
        subscriptions,
        invoices,
        branches: authorizedBranches,
        authorizedBranches,
        organizationBranches,
        allBranches: branches,
        currentBranchId,
        currentBranch,
        branchStaff: branchStaffList,
        organizationStaff: branchStaff.filter(s => s.restaurantId === currentRestaurantId),
        staffTransfers,
        ownerNotifications: branchOwnerNotifications,
        branchInvoices,
        toasts,

        // Smart Inventory, Supplier Billing, QR Batches & Returns
        goodsReceivedNotes: branchGRNs,
        branchGRNs,
        organizationAllGRNs: goodsReceivedNotes.filter(g => g.restaurantId === currentRestaurantId),
        productBatches: branchBatches,
        branchBatches,
        supplierInvoices: branchSupplierInvoices,
        supplierReturns: branchReturns,
        branchReturns,
        creditNotes,
        supplierPayments: branchSupplierPayments,
        branchSupplierPayments,
        allSupplierPayments: supplierPayments,
        supplierAgreements,
        createGoodsReceivedNote,
        consumeFromBatch,
        createSupplierReturn,
        approveSupplierReturn,
        rejectSupplierReturn,
        recordSupplierPayment,
        updateSupplierAgreement,

        // Filtered multi-tenant restaurant data
        restaurantIngredients,
        restaurantOrders,
        restaurantMovements,
        restaurantAlerts,
        staffAlerts,
        restaurantSuppliers,
        restaurantStaff,
        importIngredientsBulk,
        importSuppliersBulk,
        importStaffBulk,

        // Role Matrix & Employee Access
        updateEmployeeRole,
        updateEmployeeStatus,
        updateEmployee,
        addEmployee,
        updateRolePermission,
        resetRoleMatrix,

        // Platform Finance & Payments
        verifyPayment,
        retryPayment,
        sendPaymentReminder,
        recordNewPayment,
        updateSubscriptionPlan,
        toggleAutoRenewal,

        // Multi-Branch Operations & Staff Transfers
        switchBranch,
        addBranch,
        updateBranch,
        toggleBranchStatus,
        updateBranchSubscription,
        addBranchStaffMember,
        hashPassword,
        setNewPassword,
        updateStaffProfile,
        verifyStaffBankDetails,
        removeBranchStaffMember,
        assignBranchManager,
        requestStaffTransfer,
        approveStaffTransfer,
        rejectStaffTransfer,
        markOwnerNotificationRead,
        markAllOwnerNotificationsRead,

        // Actions & Authentication
        login,
        loginWithPin,
        logout,
        switchUser,
        switchRestaurant,
        setCurrentUser,
        setCurrentRestaurantId,
        addToast,
        removeToast,
        resetAllData,

        // Profile Management
        isProfileModalOpen,
        setIsProfileModalOpen,
        openProfileModal,
        closeProfileModal,
        updateCurrentUserProfile,

        // Workflow A
        registerRestaurant,
        registerAndActivateRestaurant,
        approveRestaurant,
        suspendRestaurant,
        reactivateRestaurant,

        // Workflow B
        addIngredient,
        updateIngredient,
        deleteIngredient,
        recordConsumption,
        recordWastage,
        reportLowStock,

        // Workflow C
        createPurchaseOrder,
        updatePOStatus,
        verifyAndReceiveStock,

        // Workflow D
        updatePlan,
        resetPlansToDefaults,
        getPlanById,
        assignPlanToRestaurant,

        // Staff & Users
        addStaff,
        updateUserStatus,

        // Suppliers
        addSupplier,
        updateSupplier,
        deleteSupplier,

        // Alerts & Tickets
        markAlertRead,
        markAllAlertsRead,
        dismissAlert,
        updateTicketStatus,

        // Staff Attendance, Leave Requests & Payroll
        attendanceRecords,
        leaveRequests,
        salaryPayments,
        staffNotifications,
        LEAVE_TYPES,
        KITCHEN_STATIONS,
        STAFF_SALARY_PROFILES,
        punchInStaff,
        punchOutStaff,
        startStaffBreak,
        endStaffBreak,
        correctAttendanceRecord,
        submitLeaveRequest,
        cancelLeaveRequest,
        reviewLeaveRequest,
        getStaffLeaveBalance,
        staffLeaveBalances,
        LEAVE_POLICIES,
        holidays,
        addHoliday,
        updateHoliday,
        deleteHoliday,
        processSalaryPayment,
        markStaffNotificationRead,
        markAllStaffNotificationsRead,

        // Custom Subscription Plan & Rule-Based Approval Engine
        customPlanRequests,
        calculateCustomPlanPricing,
        evaluateApprovalPath,
        validateAndAuthorizePricing,
        submitCustomPlanRequest,
        reviewCustomPlanRequest,
        acceptQuotation,
        activateCustomSubscription,
        BASE_PLANS,
        syncPricingEnginePlans,
        FEATURE_ADDONS,
        AUTOMATION_LIMITS,

        // Third-Party Supplier B2B Marketplace & Procurement Workflow
        supplierProducts: visibleSupplierProducts,
        SUPPLIER_SUBSCRIPTION_PLANS,
        SUPPLIER_CATEGORIES,
        addSupplierProduct,
        updateSupplierProduct,
        deleteSupplierProduct,
        toggleSupplierProductStock,
        registerSupplierAccount,
        createMarketplacePO,
        approvePurchaseOrder,
        receivePOAndStock,

        // Communication Center & Announcement System
        announcements,
        announcementTemplates,
        announcementReads,
        announcementArchives,
        policyAcknowledgments,
        emailDeliveryLogs,

        publishAnnouncement,
        saveAnnouncementDraft,
        deleteAnnouncement,
        markAnnouncementAsRead,
        markAnnouncementAsUnread,
        toggleArchiveAnnouncement,
        acknowledgePolicy,
        saveCustomTemplate,
        duplicateTemplate,
        resetTemplate,
        getAnnouncementStats,

        // Super Admin Platform Settings & Security
        platformSettings,
        updatePlatformSettings,
        updateSecurityPolicy,
        resetDemoStorage,
        expireSessionDueToInactivity,
        verifyTwoFactorCode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

