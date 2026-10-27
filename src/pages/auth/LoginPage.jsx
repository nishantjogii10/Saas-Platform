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
  Loader2,
  CheckCircle2,
  ChefHat,
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
    description: 'Branch Operations, Staff Shifts & Leaves',
    dashboard: '/dashboard',
  },
  {
    id: 'inventory_manager',
    label: 'Inventory Manager',
    icon: Boxes,
    placeholder: 'inventory@restaurant.com',
    description: 'Physical Goods Receiving, QR Batches & Dock',
    dashboard: '/goods-receiving',
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

  // Selected Role Hint (Default: Restaurant Owner)
  const [selectedRole, setSelectedRole] = useState('restaurant_owner');

  // Form states - empty defaults for security and privacy
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [authError, setAuthError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Active role metadata
  const currentRoleObj = ROLE_OPTIONS.find((r) => r.id === selectedRole) || ROLE_OPTIONS[1];

  // Route directly to the authenticated role's dashboard
  const routeToUserDashboard = (role) => {
    if (redirectDestination && redirectDestination !== '/dashboard') {
      navigate(redirectDestination);
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
        navigate('/dashboard');
        break;
      case 'inventory_manager':
        navigate('/goods-receiving');
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
      const result = login(email, password, selectedRole);
      setIsLoading(false);

      if (!result.success) {
        setAuthError(result);
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

          {/* Registration CTA (Strictly for Restaurant Owners) */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
            <span>New restaurant owner? </span>
            <Link
              to="/signup"
              className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Register &amp; Start Free Trial →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
