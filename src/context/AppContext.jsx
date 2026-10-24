import React, { createContext, useContext, useState, useEffect } from 'react';
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

import {
  initialAttendanceRecords,
  initialLeaveRequests,
  initialSalaryPayments,
  initialStaffNotifications,
  LEAVE_TYPES,
  KITCHEN_STATIONS,
  STAFF_SALARY_PROFILES,
} from '../data/staffAttendanceData';

const AppContext = createContext(null);

const STORAGE_KEY = 'stockmate_saas_v1';

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
  const [plans, setPlans] = useState(() => loadStored('plans', initialPlans));
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

  // Secure Role & Tenant Login with real validation and restriction policy
  const login = (email, password) => {
    const normalizedEmail = email ? email.trim().toLowerCase() : '';
    let user = users.find(u => (u.email || '').toLowerCase() === normalizedEmail);

    // Fallback: If user not found in state, check initialUsers (handles older localStorage snapshots)
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
        error: 'Invalid email address. No registered user account found for this email.',
        code: 'USER_NOT_FOUND',
      };
    }

    // Credential check: accept standard demo password 'password123' or user password
    const validPassword = user.password || 'password123';
    if (password !== validPassword && password !== 'password123' && password !== 'admin123') {
      return {
        success: false,
        error: 'Incorrect password entered. (Default demo password is: password123)',
        code: 'INVALID_PASSWORD',
      };
    }

    // Restriction 1: Check User Status (Pending / Suspended)
    if (user.status === 'pending') {
      return {
        success: false,
        error: `Account Pending Verification: ${user.name}'s account is currently awaiting Super Admin approval (Workflow A).`,
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
          return {
            success: false,
            error: `Restaurant Pending Verification: "${rest.name}" is awaiting verification by the Super Admin. You cannot access the workspace until the tenant account is approved.`,
            code: 'RESTAURANT_PENDING',
            restaurant: rest,
            user,
          };
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
    setCurrentUser(user);
    if (user.restaurantId) {
      setCurrentRestaurantId(user.restaurantId);
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
      // If current user is a restaurant role, switch to corresponding owner/staff if needed
      if (currentUser?.role !== 'super_admin' && currentUser?.role !== 'supplier') {
        const matchingUser = users.find(u => u.restaurantId === restId && u.role === currentUser?.role) ||
                             users.find(u => u.restaurantId === restId);
        if (matchingUser) {
          setCurrentUser(matchingUser);
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

    const planObj = plans.find(p => p.id === data.planId) || plans[1] || { id: 'plan-pro', name: 'Professional', monthlyPrice: 2499 };

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
      planName: planObj.name,
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
      planName: planObj.name,
      billingCycle: data.billingCycle || 'monthly',
      priceINR: planObj.monthlyPrice || 2499,
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
      restaurantName: rest.name,
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

    // Also add PO update alert
    const newAlert = {
      id: `alt-${Date.now()}`,
      restaurantId: currentRestaurantId,
      type: 'po_update',
      severity: 'low',
      title: `Order Created: ${newPO.poNumber}`,
      message: `Sent to ${newPO.supplierName} for ${newPO.items.length} items (₹${Number(newPO.totalAmount).toLocaleString('en-IN')}).`,
      poId: newPO.id,
      read: false,
      timestamp: new Date().toISOString(),
      actionLink: '/purchase-orders',
      actionLabel: 'View Order',
    };
    setAlerts(prev => [newAlert, ...prev]);

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
    addToast(`Purchase Order ${targetPO?.poNumber || poId} marked as "${newStatus.toUpperCase()}".`, 'info');
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
          restaurantId: rest?.id || 'rest-1',
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
      restaurantId: rest?.id || 'rest-1',
      restaurantName: rest?.name || 'Spice Garden — Pune Central',
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
    setSupplierInvoices((prev) => [newInvoice, ...prev]);

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
      restaurantId: currentRestaurant?.id || 'rest-1',
      restaurantName: currentRestaurant?.name || 'Spice Garden',
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

    // If returning from an active batch (e.g. unsold fresh pav), deduct from batch remaining
    if (batchId) {
      setProductBatches((prev) =>
        prev.map((b) => {
          if (b.batchId === batchId) {
            const newRemaining = Math.max(0, Number((b.remainingQty - qty).toFixed(2)));
            return {
              ...b,
              remainingQty: newRemaining,
              returnedQty: Number((b.returnedQty + qty).toFixed(2)),
              batchStatus: newRemaining === 0 ? 'Returned' : b.batchStatus,
            };
          }
          return b;
        })
      );

      // Deduct from available ingredient stock
      setIngredients((prev) =>
        prev.map((ing) => {
          if (ing.id === ingredientId) {
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
    }

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
  const recordSupplierPayment = ({ invoiceId, amount, paymentMethod, transactionRef }) => {
    const inv = supplierInvoices.find((i) => i.id === invoiceId);
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
      supplierId: inv.supplierId,
      supplierName: inv.supplierName,
      amountPaid: payAmount,
      paymentMethod: paymentMethod || 'NEFT Bank Transfer',
      paymentDate: new Date().toISOString().split('T')[0],
      transactionRef: transactionRef.trim(),
      verifiedBy: `${currentUser?.name || 'Priya Sharma'} (${currentUser?.role?.replace('_', ' ') || 'Owner'})`,
      receiptNumber: `RCPT-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Settled',
    };

    setSupplierPayments((prev) => [newPayment, ...prev]);

    // Update invoice
    setSupplierInvoices((prev) =>
      prev.map((i) => {
        if (i.id === invoiceId) {
          const newPaid = Number((i.paidAmount + payAmount).toFixed(2));
          const newBalance = Math.max(0, Number((i.netPayable - i.creditNoteApplied - newPaid).toFixed(2)));
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

    addToast(`Payment of ${formatINR(payAmount)} to ${inv.supplierName} verified and recorded!`, 'success');
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
    setPlans(prev => prev.map(p => {
      if (p.id === planId) {
        return { ...p, ...updatedFields };
      }
      return p;
    }));

    addPlatformLog(
      currentUser.name,
      'Subscription Plan Updated',
      `${updatedFields.name || planId} (Pricing / Limits modified)`,
      'Billing',
      'success'
    );

    addToast(`Subscription plan updated successfully.`, 'success');
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
      restaurantName: currentRestaurant.name,
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
  // Multi-Branch Management & Staff Transfer Operations
  // --------------------------------------------------------------------------
  const switchBranch = (branchId) => {
    const branch = branches.find((b) => b.id === branchId);
    if (branch) {
      setCurrentBranchId(branchId);
      addToast(`Switched active branch to ${branch.name}.`, 'info');
    }
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

    // Create notification
    const newNotif = {
      id: `notif-${Date.now()}`,
      type: 'branch_created',
      title: 'New Branch Onboarded',
      message: `Successfully provisioned ${newBranch.name} with ${newBranch.planName} plan.`,
      branchId: newBranch.id,
      branchName: newBranch.name,
      read: false,
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
        read: false,
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
        read: false,
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
    const branch = branches.find((b) => b.id === staffData.branchId) || branches[0];
    const newStaff = {
      id: `usr-br-${Date.now().toString().slice(-4)}`,
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
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0],
      pin: staffData.pin || '1234',
      avatar: staffData.avatar || `https://images.unsplash.com/photo-${1507003211169 + Math.floor(Math.random() * 1000)}?w=150&auto=format&fit=crop&q=80`,
      assignedModules: staffData.role === 'restaurant_manager' ? ['Staff Management', 'Attendance Clock', 'Leave Approvals', 'Staff Transfers', 'Operations Reports', 'Alerts'] : staffData.role === 'inventory_manager'
        ? ['Inventory', 'Suppliers', 'Purchase Orders', 'Receiving Dock', 'Reports']
        : ['Kitchen Terminal', 'Prep Usage', 'Wastage'],
    };

    setBranchStaff((prev) => [newStaff, ...prev]);

    // Increment branch staff count
    setBranches((prev) =>
      prev.map((b) =>
        b.id === newStaff.branchId ? { ...b, staffCount: (b.staffCount || 0) + 1 } : b
      )
    );

    const notif = {
      id: `notif-${Date.now()}`,
      type: 'staff_added',
      title: 'New Staff Member Onboarded',
      message: `${newStaff.name} assigned to ${newStaff.branchName} as ${newStaff.roleLabel}.`,
      branchId: newStaff.branchId,
      branchName: newStaff.branchName,
      read: false,
      timestamp: 'Just now',
      actionLink: '/branch-staff',
      actionLabel: 'View Staff Roster',
      badge: 'Team Update',
    };
    setOwnerNotifications((prev) => [notif, ...prev]);

    addToast(`Added ${newStaff.name} to ${newStaff.branchName}.`, 'success');
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
      read: false,
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
      read: false,
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

    // Create notification
    const notif = {
      id: `notif-${Date.now()}`,
      type: 'transfer_decision',
      title: `Transfer Approved: ${transfer.employeeName}`,
      message: `${transfer.employeeName} successfully transferred to ${transfer.toBranchName}.`,
      branchId: transfer.toBranchId,
      branchName: transfer.toBranchName,
      read: false,
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

    const notif = {
      id: `notif-${Date.now()}`,
      type: 'transfer_decision',
      title: `Transfer Rejected: ${transfer.employeeName}`,
      message: `Transfer of ${transfer.employeeName} to ${transfer.toBranchName} was declined. Reason: ${reason}.`,
      branchId: transfer.fromBranchId,
      branchName: transfer.fromBranchName,
      read: false,
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
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, read: true } : a));
  };

  const markAllAlertsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    addToast(`All alerts marked as read.`, 'info');
  };

  const dismissAlert = (alertId) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  // Support Tickets
  const updateTicketStatus = (ticketId, newStatus) => {
    setSupportTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
    addToast(`Ticket status updated to ${newStatus}.`, 'info');
  };

  // --- KITCHEN ATTENDANCE (PUNCH-IN / PUNCH-OUT) ---
  const punchInStaff = ({ staffId, staffName, staffRole, branchId, branchName, station, notes }) => {
    const user = currentUser;
    const targetId = staffId || user?.id || 'usr-sg-3';
    const targetName = staffName || user?.name || 'Chef Anita Rao';
    const targetRole = staffRole || user?.roleLabel || 'Head Chef';
    const targetBranchId = branchId || currentBranchId || 'branch-pune-central';
    const targetBranch = branches.find(b => b.id === targetBranchId);

    // Check if already active
    const existingActive = attendanceRecords.find(r => r.staffId === targetId && r.status === 'active');
    if (existingActive) {
      addToast(`${targetName} is already clocked in!`, 'warning');
      return existingActive;
    }

    const now = new Date();
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
      totalHours: null,
      station: station || 'Main Prep Line',
      notes: notes || 'Started station shift prep',
    };

    setAttendanceRecords(prev => [newRecord, ...prev]);

    // Live notification for Manager
    const notif = {
      id: `notif-punch-${Date.now()}`,
      type: 'staff_punch_in',
      title: `Staff Punched In: ${targetName}`,
      message: `${targetName} (${targetRole}) clocked in at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Station: ${newRecord.station}.`,
      branchId: targetBranchId,
      branchName: newRecord.branchName,
      read: false,
      timestamp: 'Just now',
      actionLink: '/branch-staff',
      actionLabel: 'View Attendance',
      badge: 'Attendance',
    };
    setOwnerNotifications(prev => [notif, ...prev]);

    addToast(`Punch-in recorded! Shift active since ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`, 'success');
    return newRecord;
  };

  const punchOutStaff = (recordId, notes = '') => {
    const record = attendanceRecords.find(r => r.id === recordId || (r.staffId === currentUser?.id && r.status === 'active'));
    if (!record) {
      addToast('No active punch session found to punch out from.', 'error');
      return null;
    }

    const now = new Date();
    const inTime = new Date(record.punchInTime);
    const diffHours = Math.max(0.1, Number(((now - inTime) / (1000 * 60 * 60)).toFixed(2)));

    setAttendanceRecords(prev => prev.map(r => {
      if (r.id === record.id) {
        return {
          ...r,
          punchOutTime: now.toISOString(),
          status: 'completed',
          totalHours: diffHours,
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
      message: `${record.staffName} completed shift. Total work duration: ${diffHours} hrs.`,
      branchId: record.branchId,
      branchName: record.branchName,
      read: false,
      timestamp: 'Just now',
      actionLink: '/branch-staff',
      actionLabel: 'View Timesheet',
      badge: 'Shift End',
    };
    setOwnerNotifications(prev => [notif, ...prev]);

    addToast(`Punched out successfully. Total shift duration: ${diffHours} hrs.`, 'success');
    return true;
  };

  // --- STAFF LEAVE WORKFLOW ---
  const submitLeaveRequest = ({ staffId, staffName, staffRole, branchId, leaveType, reason, startDate, endDate }) => {
    const user = currentUser;
    const targetId = staffId || user?.id || 'usr-sg-3';
    const targetName = staffName || user?.name || 'Chef Anita Rao';
    const targetRole = staffRole || user?.roleLabel || 'Head Chef';
    const targetBranchId = branchId || currentBranchId || 'branch-pune-central';
    const targetBranch = branches.find(b => b.id === targetBranchId);

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

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
      actionLink: '/branch-staff',
      actionLabel: 'Review Request',
      badge: 'Leave Request',
    };
    setOwnerNotifications(prev => [managerNotif, ...prev]);

    // Staff in-app notification
    const staffNotif = {
      id: `snotif-${Date.now()}`,
      targetStaffId: targetId,
      type: 'leave_status',
      title: 'Leave Request Submitted',
      message: `Your leave request for ${startDate} – ${endDate} (${durationDays} days) has been dispatched to the Manager for approval.`,
      status: 'pending',
      timestamp: 'Just now',
      read: false,
    };
    setStaffNotifications(prev => [staffNotif, ...prev]);

    addToast(`Leave request for ${durationDays} days submitted to Manager!`, 'success');
    return newLeave;
  };

  const reviewLeaveRequest = (leaveId, decision, reviewNotes = '') => {
    const req = leaveRequests.find(l => l.id === leaveId);
    if (!req) {
      addToast('Leave request not found.', 'error');
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

  // --- SALARY & PAYROLL NOTIFICATIONS ---
  const processSalaryPayment = ({ staffId, staffName, staffRole, branchId, payPeriod, amount, baseSalary, bonus, deductions, paymentMethod, referenceNumber, notes }) => {
    const targetStaff = branchStaff.find(s => s.id === staffId) || users.find(u => u.id === staffId);
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
    setCurrentUser(initialUsers.find(u => u.id === 'usr-sg-1') || initialUsers[0]);
    setCurrentRestaurantId('rest-1');

    addToast('Demo environment restored to fresh initial state.', 'success');
  };

  // Current filtered data for the active restaurant workspace
  const restaurantIngredients = ingredients.filter(i => i.restaurantId === currentRestaurantId);
  const restaurantOrders = purchaseOrders.filter(p => p.restaurantId === currentRestaurantId);
  const restaurantMovements = stockMovements.filter(m => m.restaurantId === currentRestaurantId);
  const restaurantAlerts = alerts.filter(a => a.restaurantId === currentRestaurantId);
  const restaurantSuppliers = suppliers.filter(s => !s.restaurantIds || s.restaurantIds.includes(currentRestaurantId));
  const restaurantStaff = users.filter(u => u.restaurantId === currentRestaurantId);

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
        branches,
        currentBranchId,
        currentBranch: branches.find(b => b.id === currentBranchId) || branches[0],
        branchStaff,
        staffTransfers,
        ownerNotifications,
        branchInvoices,
        toasts,

        // Smart Inventory, Supplier Billing, QR Batches & Returns
        goodsReceivedNotes,
        productBatches,
        supplierInvoices,
        supplierReturns,
        creditNotes,
        supplierPayments,
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
        restaurantSuppliers,
        restaurantStaff,

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
        submitLeaveRequest,
        reviewLeaveRequest,
        processSalaryPayment,
        markStaffNotificationRead,
        markAllStaffNotificationsRead,
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

