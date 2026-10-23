import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  ChefHat,
  Scale,
  Trash2,
  AlertCircle,
  ClockAlert,
  Boxes,
  CheckCircle2,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const KitchenDashboard = () => {
  const navigate = useNavigate();
  const { currentRestaurant, restaurantIngredients, restaurantMovements, currentUser } = useApp();

  const expiringSoon = restaurantIngredients.filter(i => i.daysUntilExpiry <= 3 && i.daysUntilExpiry >= 0);
  const lowStock = restaurantIngredients.filter(i => i.status !== 'in_stock');
  const recentStaffMovements = restaurantMovements.filter(m => m.performedBy.includes(currentUser.name) || m.role === 'Kitchen Staff');

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Kitchen Station • ${currentRestaurant?.name}`}
        subtitle={`Welcome, ${currentUser.name} • Rapid inventory logging for prep cooks and line staff`}
        badge={<Badge status="kitchen_staff" label="Kitchen Line Scope" />}
      />

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => navigate('/kitchen/usage')}
          className="group cursor-pointer rounded-3xl p-5 bg-gradient-to-br from-emerald-800 to-teal-900 text-white shadow-md hover:shadow-lg transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-3">
            <Scale className="w-6 h-6 text-emerald-300" />
          </div>
          <h3 className="font-bold text-lg">Record Ingredient Usage</h3>
          <p className="text-xs text-emerald-100/80 mt-1">
            Log quantities used during recipe prep or service rush
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 mt-4 group-hover:translate-x-1 transition-transform">
            Open Usage Logger →
          </span>
        </div>

        <div
          onClick={() => navigate('/kitchen/wastage')}
          className="group cursor-pointer rounded-3xl p-5 bg-gradient-to-br from-rose-800 to-rose-950 text-white shadow-md hover:shadow-lg transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-3">
            <Trash2 className="w-6 h-6 text-rose-300" />
          </div>
          <h3 className="font-bold text-lg">Record Food Wastage</h3>
          <p className="text-xs text-rose-100/80 mt-1">
            Log spoiled ingredients, dropped containers, or trimming scraps
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-300 mt-4 group-hover:translate-x-1 transition-transform">
            Log Wastage →
          </span>
        </div>

        <div
          onClick={() => navigate('/kitchen/report-stock')}
          className="group cursor-pointer rounded-3xl p-5 bg-gradient-to-br from-amber-700 to-amber-900 text-white shadow-md hover:shadow-lg transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-3">
            <AlertCircle className="w-6 h-6 text-amber-300" />
          </div>
          <h3 className="font-bold text-lg">Report Low Stock</h3>
          <p className="text-xs text-amber-100/80 mt-1">
            Notify inventory manager of low items on the cooking line
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300 mt-4 group-hover:translate-x-1 transition-transform">
            Send Alert →
          </span>
        </div>

        <div
          onClick={() => navigate('/kitchen/ingredients')}
          className="group cursor-pointer rounded-3xl p-5 bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-md hover:shadow-lg transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-3">
            <Boxes className="w-6 h-6 text-slate-300" />
          </div>
          <h3 className="font-bold text-lg">Check Stock Levels</h3>
          <p className="text-xs text-slate-300/80 mt-1">
            Search on-hand quantities, locations, and batch numbers
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 mt-4 group-hover:translate-x-1 transition-transform">
            View Available Stock →
          </span>
        </div>
      </div>

      {/* Two Columns: Urgent Expiry Warnings & Recent Shift Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Urgent Shelf-Life Warnings */}
        <div className="lg:col-span-6">
          <Card padding={false}>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 text-base">Urgent Expiry Warnings</h3>
                <p className="text-xs text-slate-500 mt-0.5">Prioritize these batches first on prep stations</p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {expiringSoon.length} items
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {expiringSoon.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No batches expiring within the next 3 days!
                </div>
              ) : (
                expiringSoon.map((item) => (
                  <div key={item.id} className="p-4 sm:px-6 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{item.name}</span>
                        <Badge status="expiring_soon" label={`${item.daysUntilExpiry}d left`} size="xs" />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.quantity} {item.unit} remaining • Location: {item.storageLocation}
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="xs"
                      onClick={() => navigate('/kitchen/usage')}
                    >
                      Use in Prep
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Recent Kitchen Submissions */}
        <div className="lg:col-span-6">
          <Card padding={false}>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 text-base">Your Shift Activity</h3>
                <p className="text-xs text-slate-500 mt-0.5">Submitted usages, wastage reports, and adjustments</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {recentStaffMovements.slice(0, 5).map((mov) => (
                <div key={mov.id} className="p-4 sm:px-6 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm">{mov.ingredientName}</span>
                      <Badge status={mov.type} size="xs" />
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {mov.quantity} {mov.unit} • {mov.reason}
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">
                    {new Date(mov.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              {recentStaffMovements.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-500">
                  No usage or wastage submitted during this shift yet.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

