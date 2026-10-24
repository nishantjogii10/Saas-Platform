import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Boxes,
  Shield,
  Store,
  ChefHat,
  Truck,
  Building2,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { Button } from '../../components/common/Button';

export const LoginPage = () => {
  const { login } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect destination after authentication
  const redirectDestination = location.state?.from;

  // Form states
  const [email, setEmail] = useState('priya@spicegarden.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [authError, setAuthError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Quick-fill credentials for demo / evaluation testing
  const SAMPLE_ACCOUNTS = [
    { label: 'Restaurant Owner', email: 'priya@spicegarden.com', role: 'Owner', icon: Store },
    { label: 'Restaurant Manager', email: 'vikram.mgr@spicegarden.com', role: 'Rest. Manager', icon: Building2 },
    { label: 'Super Admin', email: 'admin@stockmate.io', role: 'Admin', icon: Shield },
    { label: 'Inventory Manager', email: 'rahul.v@spicegarden.com', role: 'Inventory', icon: Boxes },
    { label: 'Kitchen Staff', email: 'anita.chef@spicegarden.com', role: 'Kitchen', icon: ChefHat },
    { label: 'Supplier Partner', email: 'david@metrofoods.com', role: 'Supplier', icon: Truck },
  ];

  const fillSampleAccount = (accEmail) => {
    setEmail(accEmail);
    setPassword('password123');
    setFieldErrors({});
    setAuthError(null);
  };

  // Route to the role's authorized dashboard
  const routeToUserDashboard = (role) => {
    if (redirectDestination && redirectDestination !== '/dashboard') {
      navigate(redirectDestination);
      return;
    }
    switch (role) {
      case 'super_admin':
        navigate('/admin/dashboard');
        break;
      case 'supplier':
        navigate('/supplier');
        break;
      case 'kitchen_staff':
        navigate('/kitchen');
        break;
      case 'inventory_manager':
      case 'restaurant_manager':
      case 'restaurant_owner':
      default:
        navigate('/dashboard');
        break;
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Email address is required';
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
    setAuthError(null);

    if (!validateForm()) return;

    setIsLoading(true);

    setTimeout(() => {
      const result = login(email, password);
      setIsLoading(false);

      if (!result.success) {
        setAuthError(result);
      } else {
        routeToUserDashboard(result.user.role);
      }
    }, 250);
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
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
          <span className="text-[11px] font-mono text-slate-400">StockMate Auth Gate</span>
        </div>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white shadow-xl shadow-emerald-500/20 mb-3">
            <Boxes className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Sign In to StockMate</h1>
          <p className="text-slate-400 text-xs mt-1">
            Enter your credentials to access your authorized restaurant workspace
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8">
          {/* Authentication Error Banner */}
          {authError && (
            <div className="p-3.5 rounded-2xl mb-5 bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2.5 shadow-xs">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-white">Authentication Failed</span>
                <span className="opacity-90">{authError.error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: null });
                  }}
                  placeholder="name@restaurant.com"
                  className={`w-full pl-9 pr-3 py-2.5 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 ${
                    fieldErrors.email ? 'border-rose-500' : 'border-slate-800 focus:border-emerald-500'
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

            {/* Password Field with Visibility Toggle */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: null });
                  }}
                  placeholder="Enter your password"
                  className={`w-full pl-9 pr-10 py-2.5 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 ${
                    fieldErrors.password ? 'border-rose-500' : 'border-slate-800 focus:border-emerald-500'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
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
              iconRight={ArrowRight}
            >
              {isLoading ? 'Authenticating...' : 'Sign In to Workspace'}
            </Button>
          </form>

          {/* Quick Test Accounts Filler */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Fill Test Role Credentials:
            </span>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {SAMPLE_ACCOUNTS.map((acc) => {
                const Icon = acc.icon;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => fillSampleAccount(acc.email)}
                    className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 text-[11px] font-medium flex items-center gap-1.5 transition-colors truncate"
                    title={`Fill ${acc.label} credentials`}
                  >
                    <Icon className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate">{acc.role}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
              Clicking a role fills the email and default password (<code>password123</code>). Click <strong>Sign In</strong> to authenticate.
            </p>
          </div>

          {/* Registration CTA */}
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

        {/* Security & Production Architecture Note */}
        <div className="mt-4 p-3 bg-slate-900/60 rounded-2xl border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
          <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <span>
            <strong>Production Architecture Notice:</strong> In production deployments, authentication and role authorization must be enforced via backend APIs with HTTPS cookies/JWTs. Client-side checks handle routing and state orchestration.
          </span>
        </div>
      </div>
    </div>
  );
};
