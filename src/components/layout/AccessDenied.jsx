import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, ArrowLeft, Home, LogOut, Lock } from 'lucide-react';
import { Button } from '../common/Button';

export const AccessDenied = ({ requiredRoles = [], currentRole }) => {
  const navigate = useNavigate();
  const { currentUser, logout } = useApp();

  const getHomeRoute = () => {
    if (!currentUser) return '/login';
    switch (currentUser.role) {
      case 'super_admin':
        return '/admin/dashboard';
      case 'supplier':
        return '/supplier';
      case 'kitchen_staff':
        return '/kitchen';
      case 'inventory_manager':
      case 'restaurant_owner':
      default:
        return '/dashboard';
    }
  };

  const formatRoleName = (roleStr) => {
    if (!roleStr) return 'User';
    return roleStr
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center bg-white border border-slate-200/90 rounded-3xl p-8 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          Your current active role (<span className="font-semibold text-slate-800">{formatRoleName(currentUser?.role)}</span>) does not have permission to access this protected module.
        </p>

        {requiredRoles.length > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span className="font-medium">Authorized Roles:</span>
            <span className="font-bold text-slate-800">
              {requiredRoles.map((r) => formatRoleName(r)).join(', ')}
            </span>
          </div>
        )}

        <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 text-left flex items-start gap-2">
          <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            Enterprise role-based security is enforced. If you require access to this module, please contact your Super Admin to update your account permissions.
          </span>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Home}
            onClick={() => navigate(getHomeRoute())}
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};
