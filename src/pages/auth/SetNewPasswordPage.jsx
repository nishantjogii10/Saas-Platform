import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Lock,
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Shield,
  LogOut,
  Building2,
  Check,
} from 'lucide-react';
import { Button } from '../../components/common/Button';

// Utility helper to map roles to their standard dashboard route
export const getRoleDashboard = (role) => {
  switch (role) {
    case 'super_admin':
      return '/admin/dashboard';
    case 'restaurant_owner':
      return '/dashboard';
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

export const SetNewPasswordPage = () => {
  const { currentUser, setNewPassword, logout, addToast } = useApp();
  const navigate = useNavigate();

  const [newPassword, setNewPasswordInput] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If user is not authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If user does not need to change password, redirect directly to their dashboard
  if (!currentUser.mustChangePassword) {
    return <Navigate to={getRoleDashboard(currentUser.role)} replace />;
  }

  // Validation rules
  const hasMinLength = newPassword.length >= 8;
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (!hasMinLength) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match. Please re-enter both passwords.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // Call service layer to hash password and set mustChangePassword = false
      const result = setNewPassword(newPassword);
      setIsSubmitting(false);

      if (!result.success) {
        setError(result.error || 'Failed to update password.');
      } else {
        const dest = getRoleDashboard(result.user?.role || currentUser.role);
        navigate(dest, { replace: true });
      }
    }, 400);
  };

  const handleLogout = () => {
    logout();
    addToast('Signed out of temporary session.', 'info');
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-emerald-500 selection:text-white">
      {/* Background glow decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-600/15 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-md w-full mx-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white shadow-xl shadow-emerald-500/20 mb-3">
            <Key className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Set Permanent Password
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            First-Time Login Security Setup
          </p>
        </div>

        {/* User Session Info Card */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white">{currentUser.name}</span>
            <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-full">
              {currentUser.employeeId || 'New Staff Member'}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-1.5">
            <span>{currentUser.email}</span>
            <span className="capitalize">{currentUser.role?.replace('_', ' ')}</span>
          </div>
          {currentUser.branchName && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-0.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="truncate">{currentUser.branchName}</span>
            </div>
          )}
        </div>

        {/* Password Form Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" /> Choose a New Password
            </h3>
            <p className="text-xs text-slate-400">
              Your temporary password must be replaced with a secure password before entering the application.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                New Password *
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Enter new password (min. 8 characters)"
                  className="w-full bg-slate-950/70 border border-slate-700/80 text-white rounded-xl px-3.5 py-2.5 text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Confirm New Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  className="w-full bg-slate-950/70 border border-slate-700/80 text-white rounded-xl px-3.5 py-2.5 text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Requirement Checklist */}
            <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800 space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    hasMinLength
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  <Check className="w-2.5 h-2.5" />
                </div>
                <span className={hasMinLength ? 'text-emerald-400 font-medium' : 'text-slate-400'}>
                  At least 8 characters in length
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    passwordsMatch
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  <Check className="w-2.5 h-2.5" />
                </div>
                <span className={passwordsMatch ? 'text-emerald-400 font-medium' : 'text-slate-400'}>
                  Passwords match exactly
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full justify-center bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-emerald-600/20"
              disabled={isSubmitting || !hasMinLength || !passwordsMatch}
            >
              {isSubmitting ? (
                'Saving New Password...'
              ) : (
                <span className="flex items-center gap-2">
                  <span>Save Password &amp; Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Sign Out Action */}
          <div className="pt-2 border-t border-slate-800/80 text-center">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out and use a different account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

