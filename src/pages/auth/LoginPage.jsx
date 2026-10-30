import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Boxes,
  Shield,
  Store,
  UserCheck,
  Truck,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  ChefHat,
  Handshake,
  Globe,
} from 'lucide-react';
import { Button } from '../../components/common/Button';

// 5 Designated Role Options for RBAC
const ROLE_OPTIONS = [
  {
    id: 'super_admin',
    label: 'Admin',
    icon: Shield,
    placeholder: 'admin@stockmate.io',
    description: 'SaaS Platform Governance & Plan Review',
    dashboard: '/admin/dashboard',
  },
  {
    id: 'restaurant_owner',
    label: 'Restaurant Owner',
    icon: Store,
    placeholder: 'owner@restaurant.com',
    description: 'Multi-Branch Operations & Subscription',
    dashboard: '/dashboard',
  },
  {
    id: 'restaurant_manager',
    label: 'Manager',
    icon: UserCheck,
    placeholder: 'manager@restaurant.com',
    description: 'Staff Roster, Station Shifts & Leave Management',
    dashboard: '/workforce',
  },
  {
    id: 'inventory_manager',
    label: 'Inventory Manager',
    icon: Boxes,
    placeholder: 'inventory@restaurant.com',
    description: 'Inventory Valuation, Stock Alerts & Purchase Orders',
    dashboard: '/dashboard',
  },
  {
    id: 'kitchen_staff',
    label: 'Kitchen Staff',
    icon: ChefHat,
    placeholder: 'kitchen@restaurant.com',
    description: 'Kitchen Terminal, Stock Usage & Wastage',
    dashboard: '/kitchen',
  },
  {
    id: 'supplier',
    label: 'Supplier',
    icon: Truck,
    placeholder: 'orders@supplier.com',
    description: 'Supplier Portal, PO Orders & Invoicing',
    dashboard: '/supplier',
  },
];

export const LoginPage = () => {
  const { login } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect destination after authentication
  const redirectDestination = location.state?.from;

  // Selected Role Hint (Default: Restaurant Owner, auto-detects from query/state/from)
  const [selectedRole, setSelectedRole] = useState(() => {
    const searchParams = new URLSearchParams(location.search);
    const queryRole = searchParams.get('role');
    if (queryRole && ROLE_OPTIONS.some((r) => r.id === queryRole)) {
      return queryRole;
    }
    if (location.state?.role && ROLE_OPTIONS.some((r) => r.id === location.state.role)) {
      return location.state.role;
    }
    if (location.state?.from && location.state.from.startsWith('/supplier')) {
      return 'supplier';
    }
    if (location.state?.from && location.state.from.startsWith('/kitchen')) {
      return 'kitchen_staff';
    }
    if (location.state?.from && location.state.from.startsWith('/admin')) {
      return 'super_admin';
    }
    return 'restaurant_owner';
  });

  // Form states - empty defaults for security and privacy
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [authError, setAuthError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [twoFactorPending, setTwoFactorPending] = useState(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorError, setTwoFactorError] = useState(null);

  // Active role metadata
  const currentRoleObj = ROLE_OPTIONS.find((r) => r.id === selectedRole) || ROLE_OPTIONS[1];

  // Route directly to the authenticated role's dashboard
  const routeToUserDashboard = (role) => {
    const getRoleDashboard = (r) => {
      switch (r) {
        case 'super_admin':
          return '/admin/dashboard';
        case 'restaurant_owner':
        case 'restaurant_manager':
          return '/dashboard';
        case 'inventory_manager':
          return '/goods-receiving';
        case 'supplier':
          return '/supplier';
        case 'kitchen_staff':
          return '/kitchen';
        default:
          return '/dashboard';
      }
    };

    const targetDashboard = getRoleDashboard(role);

    // If logging in as manager, staff, or operational roles, ALWAYS redirect directly to their dashboard.
    // Also prevent redirecting to /notifications, /login, or invalid paths to avoid Access Denied loops.
    if (
      role === 'restaurant_manager' ||
      role === 'kitchen_staff' ||
      role === 'inventory_manager' ||
      role === 'supplier' ||
      !redirectDestination ||
      redirectDestination === '/notifications' ||
      redirectDestination === '/dashboard' ||
      redirectDestination === '/login' ||
      redirectDestination === '/'
    ) {
      navigate(targetDashboard, { replace: true });
      return;
    }
    switch (role) {
      case 'super_admin':
        navigate('/admin/dashboard');
        break;
      case 'restaurant_owner':
        navigate('/dashboard');
        break;
      case 'restaurant_manager':
        navigate('/workforce');
        break;
      case 'inventory_manager':
        navigate('/dashboard');
        break;
      case 'supplier':
        navigate('/supplier');
        break;
      case 'kitchen_staff':
        navigate('/kitchen');
        break;
      default:
        navigate('/dashboard');
        break;
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Work email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return; // Prevent duplicate submissions while in progress
    setAuthError(null);

    if (!validateForm()) return;

    setIsLoading(true);

    setTimeout(() => {
      // Pass selectedRole to login engine for strict RBAC verification
      const result = login(email, password, selectedRole, null, 'main_system');
      setIsLoading(false);

      if (!result.success) {
        if (result.require2FA) {
          setTwoFactorPending(result.tempUser);
        } else {
          setAuthError(result);
        }
      } else {
        if (result.user?.mustChangePassword) {
          navigate('/set-new-password');
        } else {
          routeToUserDashboard(result.user.role);
        }
      }
    }, 300);
  };

  // Quick switch role when role mismatch occurs
  const handleTwoFactorSubmit = (e) => {
    if (e) e.preventDefault();
    if (!twoFactorCode.trim()) {
      setTwoFactorError('Please enter your 6-digit verification code.');
      return;
    }
    setIsLoading(true);
    setTwoFactorError(null);

    setTimeout(() => {
      const result = login(email, password, selectedRole, twoFactorCode, 'main_system');
      setIsLoading(false);

      if (!result.success) {
        setTwoFactorError(result.error || 'Invalid authentication code. Please check and try again.');
      } else {
        if (result.user?.mustChangePassword) {
          navigate('/set-new-password');
        } else {
          routeToUserDashboard(result.user.role);
        }
      }
    }, 300);
  };

  const handleQuickSwitchRole = (actualRole) => {
    if (actualRole) {
      setSelectedRole(actualRole);
      setAuthError(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-emerald-500 selection:text-white">
      {/* Background glow decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-600/15 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-md w-full mx-auto">
        {/* Navigation Link to Home */}
        <div className="mb-4 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors bg-slate-900/90 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-800 shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
          <span className="text-[11px] font-mono text-slate-500">StockMate Auth v2.4</span>
        </div>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white shadow-xl shadow-emerald-500/20 mb-3">
            <Boxes className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Sign In to StockMate</h1>
          <p className="text-slate-400 text-xs mt-1">
            Choose your role and enter your credentials to access your authorized workspace
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8">
          {twoFactorPending ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-950/70 border border-indigo-700/60 text-indigo-200 text-xs">
                <div className="flex items-center gap-2 mb-1.5 font-bold text-white text-sm">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  <span>Two-Factor Authentication Enforced</span>
                </div>
                <p className="text-slate-300">
                  Account: <strong className="text-white">{twoFactorPending.name}</strong> ({twoFactorPending.email})
                </p>
                <p className="text-slate-400 mt-1">
                  Enter the 6-digit verification code from your authenticator app (e.g. Google Authenticator) or an emergency backup code.
                </p>
              </div>

              {twoFactorError && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{twoFactorError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  6-Digit Authenticator Code
                </label>
                <input
                  type="text"
                  maxLength={14}
                  value={twoFactorCode}
                  onChange={(e) => {
                    setTwoFactorCode(e.target.value);
                    if (twoFactorError) setTwoFactorError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTwoFactorSubmit(e);
                  }}
                  placeholder="e.g. 123456 or SM-XXXX-XXXX"
                  className="w-full text-center font-mono tracking-widest text-lg font-bold px-3 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  autoFocus
                />
                <p className="text-[11px] text-slate-500 mt-1.5 text-center">
                  Demo hint: enter <span className="font-mono text-emerald-400 font-semibold">123456</span> or any 6-digit TOTP
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  variant="brand"
                  size="md"
                  className="w-full justify-center"
                  loading={isLoading}
                  onClick={handleTwoFactorSubmit}
                >
                  Verify &amp; Access Dashboard
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center text-slate-400 hover:text-white"
                  onClick={() => {
                    setTwoFactorPending(null);
                    setTwoFactorCode('');
                    setTwoFactorError(null);
                  }}
                >
                  Cancel &amp; Return to Sign In
                </Button>
              </div>
            </div>
          ) : (
            <>
          {/* 1. Compact Role Selection Section ("Sign in as") */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Sign in as
              </label>
              <span className="text-[10px] text-slate-400 font-medium">
                {currentRoleObj.label} selected
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {ROLE_OPTIONS.map((opt) => {
                const isSelected = selectedRole === opt.id;
                const Icon = opt.icon;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSelectedRole(opt.id);
                      if (authError?.code === 'ROLE_MISMATCH') {
                        setAuthError(null);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 text-left border ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/80 shadow-xs shadow-emerald-500/20 ring-1 ring-emerald-400/40'
                        : 'bg-slate-950/70 text-slate-400 border-slate-800/80 hover:text-slate-200 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isSelected ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    />
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Requirement 2: Tie-up Supplier Helper Banner */}
          {selectedRole === 'supplier' && (
            <div className="mb-4 p-3 rounded-xl bg-teal-950/60 border border-teal-800/80 text-xs text-teal-200 flex flex-col gap-1.5 shadow-xs animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5 font-bold text-teal-300">
                <Handshake className="w-3.5 h-3.5 text-teal-400" />
                <span>Tie-up Supplier Login (Main System Role)</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Logging in here assigns you the <strong>Tie-up Supplier</strong> type with direct restaurant procurement terms.
              </p>
              <div className="pt-1 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-medium">Demo Accounts:</span>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('karan@goldencrustbakery.com');
                    setPassword('password123');
                  }}
                  className="px-2 py-0.5 rounded bg-teal-900/80 hover:bg-teal-800 text-teal-200 text-[10px] font-bold border border-teal-700/60 transition-colors"
                >
                  Karan (Golden Crust Bakery)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('sunil@amritdairy.com');
                    setPassword('password123');
                  }}
                  className="px-2 py-0.5 rounded bg-teal-900/80 hover:bg-teal-800 text-teal-200 text-[10px] font-bold border border-teal-700/60 transition-colors"
                >
                  Sunil (Amrit Dairy)
                </button>
              </div>
            </div>
          )}

          {/* Authentication Error Banner */}
          {authError && (
            <div className="p-3.5 rounded-2xl mb-4 bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-start gap-2.5 shadow-xs animate-in fade-in duration-200">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block text-white">
                  {authError.code === 'ROLE_MISMATCH'
                    ? 'Role Verification Failed'
                    : 'Authentication Failed'}
                </span>
                <span className="opacity-90 block mt-0.5">{authError.error}</span>

                {authError.code === 'ROLE_MISMATCH' && authError.actualRole && (
                  <button
                    type="button"
                    onClick={() => handleQuickSwitchRole(authError.actualRole)}
                    className="mt-2 text-[11px] font-bold text-emerald-300 hover:text-emerald-200 underline flex items-center gap-1"
                  >
                    <span>Click here to switch role to {authError.actualRole.replace('_', ' ').toUpperCase()}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Work Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  disabled={isLoading}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: null });
                  }}
                  placeholder={currentRoleObj.placeholder}
                  className={`w-full pl-9 pr-3 py-2.5 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 transition-all ${
                    fieldErrors.email
                      ? 'border-rose-500'
                      : 'border-slate-800 focus:border-emerald-500'
                  }`}
                  required
                />
              </div>
              {fieldErrors.email && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password Field with Toggle & Forgot Password Link */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  disabled={isLoading}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: null });
                  }}
                  placeholder="Enter your password"
                  className={`w-full pl-9 pr-10 py-2.5 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 transition-all ${
                    fieldErrors.password
                      ? 'border-rose-500'
                      : 'border-slate-800 focus:border-emerald-500'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                  tabIndex={-1}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="brand"
              className="w-full justify-center py-2.5 text-xs font-bold mt-2"
              disabled={isLoading}
              iconRight={isLoading ? null : ArrowRight}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                `Sign In as ${currentRoleObj.label}`
              )}
            </Button>
          </form>
          </>
          )}

          {/* Registration CTA (Strictly for Restaurant Owners) */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400 space-y-2">
            <div>
              <span>New restaurant owner? </span>
              <Link
                to="/signup"
                className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Register &amp; Start Free Trial →
              </Link>
            </div>
            <div>
              <span>Wholesale supplier or producer? </span>
              <Link
                to="/supplier-portal"
                className="font-bold text-teal-400 hover:text-teal-300 transition-colors"
              >
                Supplier Portal Login →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
