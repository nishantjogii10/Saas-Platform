import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Boxes,
  ArrowLeftRight,
  Bell,
  AlertTriangle,
  ClockAlert,
  XCircle,
  IndianRupee,
  TrendingUp,
  Plus,
  Scale,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Layers,
  History,
  Store,
  Clock,
  CheckCircle2,
  UserCheck,
  Calendar,
  Users,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Card, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { restaurantConsumptionTrends, restaurantCategoryValuation } from '../../data/mockData';
import { formatINR } from '../../data/inventoryBillingData';

export const RestaurantDashboard = () => {
  const navigate = useNavigate();
  const {
    currentRestaurant,
    restaurantIngredients,
    restaurantOrders,
    restaurantMovements,
    restaurantAlerts,
    attendanceRecords,
    leaveRequests,
    reviewLeaveRequest,
    branchStaff,
    staffTransfers,
    currentBranch,
    currentUser,
  } = useApp();

  const activeStaffAttendance = attendanceRecords?.filter((r) => r.status === 'active') || [];
  const pendingLeaves = leaveRequests?.filter((l) => l.status === 'pending') || [];
  const totalStaffCount = branchStaff?.length || 0;
  const pendingTransfers = staffTransfers?.filter(
    (t) => t.status === 'Pending' && (!currentBranch?.id || t.fromBranchId === currentBranch.id || t.toBranchId === currentBranch.id)
  ) || [];

  // Metrics calculations for the current restaurant tenant
  const totalIngredients = restaurantIngredients.length;
  const lowStockItems = restaurantIngredients.filter(i => i.status === 'low_stock').length;
  const outOfStockItems = restaurantIngredients.filter(i => i.status === 'out_of_stock').length;
  const expiringSoonItems = restaurantIngredients.filter(i => i.daysUntilExpiry <= 3 && i.daysUntilExpiry >= 0).length;

  const totalValuation = restaurantIngredients.reduce((sum, item) => {
    return sum + (item.quantity * item.costPerUnit);
  }, 0);

  const activePendingOrders = restaurantOrders.filter(o => o.status === 'pending' || o.status === 'accepted' || o.status === 'dispatched');

  const CATEGORY_COLORS = ['#0E5C38', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'];

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          currentUser?.role === 'restaurant_manager'
            ? 'Operations & Staff Overview'
            : 'Inventory Overview'
        }
        subtitle={
          currentUser?.role === 'restaurant_manager'
            ? 'Real-time staff attendance, station shifts, leave approvals & operations tracking'
            : 'Real-time stock counts, active alerts, and consumption analytics'
        }
        badge={
          currentUser?.role === 'restaurant_owner' ? (
            <div className="flex items-center gap-2">
              {currentBranch && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                  <Store className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{currentBranch.name.replace(/^Spice Garden\s*[-–—]\s*/i, '')}</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span>{currentRestaurant?.logo || '🌿'}</span>
                <span>{currentRestaurant?.planName} Tier</span>
              </span>
            </div>
          ) : null
        }
        actions={
          currentUser?.role === 'restaurant_manager' ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={Users}
                onClick={() => navigate('/branch-staff')}
              >
                Staff Roster ({totalStaffCount})
              </Button>
              <Button
                variant="brand"
                size="sm"
                icon={Plus}
                onClick={() => navigate('/branch-staff?action=add')}
              >
                Add Staff Member
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={ShoppingBag}
                onClick={() => navigate('/purchase-orders')}
              >
                Purchase Orders ({activePendingOrders.length})
              </Button>
              <Button
                variant="brand"
                size="sm"
                icon={Plus}
                onClick={() => navigate('/inventory?action=add')}
              >
                Add Ingredient
              </Button>
            </div>
          )
        }
      />

      {/* Critical Stock Alert Banner if any out of stock or low stock items (hidden for restaurant manager) */}
      {currentUser?.role !== 'restaurant_manager' && (lowStockItems > 0 || outOfStockItems > 0) && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-950">
                Action Required: {outOfStockItems > 0 ? `${outOfStockItems} item(s) out of stock` : ''}
                {outOfStockItems > 0 && lowStockItems > 0 ? ' and ' : ''}
                {lowStockItems > 0 ? `${lowStockItems} ingredient(s) below reorder threshold` : ''}
              </h4>
              <p className="text-xs text-amber-800">
                Inventory levels require attention to avoid kitchen stockouts during upcoming service.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="xs"
              className="bg-white border-amber-300 text-amber-900"
              onClick={() => navigate('/alerts')}
            >
              View Alerts
            </Button>
            {currentUser?.role !== 'restaurant_manager' && (
              <Button
                variant="primary"
                size="xs"
                onClick={() => navigate('/purchase-orders?action=create')}
              >
                Reorder Stock (PO)
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Primary KPI Grid */}
      {currentUser?.role === 'restaurant_manager' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Kitchen Staff On Duty"
            value={activeStaffAttendance.length}
            change={`${activeStaffAttendance.length} Clocked In`}
            trend="up"
            subtext="Live kitchen station status"
            icon={Clock}
            accentColor="emerald"
            onClick={() => navigate('/branch-staff?tab=attendance')}
          />

          <StatCard
            title="Pending Leaves"
            value={pendingLeaves.length}
            change={pendingLeaves.length > 0 ? 'Requires Action' : 'All Clear'}
            trend={pendingLeaves.length > 0 ? 'down' : 'up'}
            subtext="Awaiting manager sign-off"
            icon={Calendar}
            accentColor={pendingLeaves.length > 0 ? 'amber' : 'emerald'}
            onClick={() => navigate('/branch-staff?tab=leave')}
          />

          <StatCard
            title="Total Branch Staff"
            value={totalStaffCount}
            change="Outlet Team Roster"
            trend="neutral"
            subtext="Active team members"
            icon={Users}
            accentColor="blue"
            onClick={() => navigate('/branch-staff')}
          />

          <StatCard
            title="Pending Transfers"
            value={pendingTransfers.length}
            change={pendingTransfers.length > 0 ? 'Requires Action' : 'All Clear'}
            trend={pendingTransfers.length > 0 ? 'down' : 'up'}
            subtext="Inter-branch requests"
            icon={ArrowLeftRight}
            accentColor={pendingTransfers.length > 0 ? 'purple' : 'emerald'}
            onClick={() => navigate('/staff-transfers')}
          />

          <StatCard
            title="Staff Notices"
            value={restaurantAlerts.filter((a) => !a.read).length}
            change="Staff Alerts"
            trend="neutral"
            subtext="Unread staff notices"
            icon={Bell}
            accentColor="teal"
            onClick={() => navigate('/alerts')}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Stock Value"
            value={formatINR(totalValuation)}
            change="+4.2%"
            trend="up"
            subtext="Current on-hand inventory"
            icon={IndianRupee}
            accentColor="emerald"
            onClick={() => navigate('/inventory')}
          />

          <StatCard
            title="Total Tracked Items"
            value={totalIngredients}
            change={`Limit: ${currentRestaurant?.monthlyUsage?.ingredientsLimit || 100}`}
            trend="neutral"
            subtext="Active SKU categories"
            icon={Boxes}
            accentColor="blue"
            onClick={() => navigate('/inventory')}
          />

          <StatCard
            title="Low Stock Items"
            value={lowStockItems}
            change={lowStockItems > 0 ? 'Urgent Reorder' : 'All Optimal'}
            trend={lowStockItems > 0 ? 'down' : 'up'}
            subtext="Below minimum threshold"
            icon={AlertTriangle}
            accentColor={lowStockItems > 0 ? 'amber' : 'emerald'}
            onClick={() => navigate('/inventory?filter=low_stock')}
          />

          <StatCard
            title="Out of Stock"
            value={outOfStockItems}
            change={outOfStockItems > 0 ? 'Depleted' : 'Zero items'}
            trend={outOfStockItems > 0 ? 'down' : 'up'}
            subtext="Requires instant restock"
            icon={XCircle}
            accentColor={outOfStockItems > 0 ? 'rose' : 'emerald'}
            onClick={() => navigate('/inventory?filter=out_of_stock')}
          />

          <StatCard
            title="Expiring <= 3 Days"
            value={expiringSoonItems}
            change={expiringSoonItems > 0 ? 'Monitor Shelf' : 'Fresh'}
            trend={expiringSoonItems > 0 ? 'down' : 'up'}
            subtext="FIFO rotation needed"
            icon={ClockAlert}
            accentColor={expiringSoonItems > 0 ? 'amber' : 'emerald'}
            onClick={() => navigate('/expiry-tracking')}
          />
        </div>
      )}

      {/* Pending Staff Leave Requests Approval Alert */}
      {currentUser?.role !== 'inventory_manager' && pendingLeaves.length > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Staff Leave Requests Awaiting Your Approval ({pendingLeaves.length})
                </h4>
                <p className="text-xs text-slate-600">
                  Review time-off applications from kitchen line staff and adjust shift scheduling.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="xs"
              onClick={() => navigate('/branch-staff?tab=leave')}
            >
              Open Leave Console →
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {pendingLeaves.map((leave) => (
              <div
                key={leave.id}
                className="p-3.5 rounded-xl bg-white border border-amber-200 shadow-2xs flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 text-xs">{leave.staffName}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      {leave.leaveType}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-emerald-800 mt-1">
                    📅 {leave.startDate} to {leave.endDate} ({leave.durationDays} days)
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 italic">
                    "{leave.reason}"
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="xs"
                    icon={XCircle}
                    onClick={() => reviewLeaveRequest(leave.id, 'rejected', 'Declined due to kitchen shift coverage requirements')}
                    className="text-rose-600 hover:bg-rose-50"
                  >
                    Reject
                  </Button>
                  <Button
                    variant="brand"
                    size="xs"
                    icon={CheckCircle2}
                    onClick={() => reviewLeaveRequest(leave.id, 'approved', 'Approved by Manager. Have a safe leave!')}
                  >
                    Accept / Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Kitchen Staff Attendance Widget for Managers */}
      {currentUser?.role !== 'inventory_manager' && (
      <Card padding={false} className="border border-emerald-100">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Live Kitchen Staff Attendance &amp; Shift Monitor
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                  {activeStaffAttendance.length} On Duty
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time punch clock status across stations for {currentRestaurant?.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="xs"
              icon={Users}
              onClick={() => navigate('/branch-staff')}
            >
              Full Staff Roster &amp; Timesheets →
            </Button>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {activeStaffAttendance.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-100">
              No staff members are currently punched in. Station time clocks are inactive.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeStaffAttendance.map((rec) => {
                const inTime = new Date(rec.punchInTime);
                const diffHrs = Math.max(0.1, Number(((Date.now() - inTime.getTime()) / (1000 * 60 * 60)).toFixed(1)));

                return (
                  <div
                    key={rec.id}
                    className="p-3.5 rounded-xl border border-emerald-200/80 bg-white hover:shadow-xs transition-all flex items-start gap-3"
                  >
                    <img
                      src={rec.staffAvatar || 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=150'}
                      alt={rec.staffName}
                      className="w-10 h-10 rounded-full object-cover border border-emerald-300 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {rec.staffName}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                          {diffHrs}h active
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{rec.staffRole}</div>
                      <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-emerald-800 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        <span>Station: {rec.station}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        Clocked in: {inTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
      )}

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Consumption vs Purchases */}
        <div className="lg:col-span-8">
          <Card>
            <CardHeader
              title="Daily Stock Usage vs Restocking"
              subtitle="Daily consumption volumes and incoming deliveries over the past 7 days (₹ value)"
              icon={TrendingUp}
              action={
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800">
                  This Week
                </span>
              }
            />
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={restaurantConsumptionTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                    formatter={(val) => [formatINR(val), '']}
                  />
                  <Bar dataKey="consumption" fill="#0E5C38" name="Kitchen Consumption" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="purchases" fill="#3B82F6" name="Stock Received" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="wastage" fill="#EF4444" name="Wastage" radius={[4, 4, 0, 0]} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Category Valuation Breakdown */}
        <div className="lg:col-span-4">
          <Card>
            <CardHeader
              title="Valuation by Category"
              subtitle="Rupee breakdown by ingredient category"
              icon={Boxes}
            />
            <div className="h-60 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={restaurantCategoryValuation}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {restaurantCategoryValuation.map((entry, index) => (
                      <Cell key={`cat-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                    formatter={(val) => [formatINR(val), 'Value']}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Top Category: <strong>Meat & Poultry (₹48,000)</strong></span>
              <button
                onClick={() => navigate('/reports')}
                className="text-emerald-800 font-semibold hover:underline"
              >
                Cost Reports →
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Two Columns: Low Stock Quick Table & Recent Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Needs Attention / Low Stock */}
        <div className="lg:col-span-6">
          <Card padding={false}>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 text-base">Ingredients Needing Attention</h3>
                <p className="text-xs text-slate-500 mt-0.5">Items currently below minimum safety stock levels</p>
              </div>
              <Button
                variant="ghost"
                size="xs"
                iconRight={ArrowRight}
                onClick={() => navigate('/inventory?filter=low_stock')}
              >
                View All
              </Button>
            </div>

            <div className="divide-y divide-slate-100">
              {restaurantIngredients
                .filter(i => i.status !== 'in_stock')
                .slice(0, 4)
                .map((ing) => (
                  <div key={ing.id} className="p-4 sm:px-6 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-sm">{ing.name}</span>
                        <Badge status={ing.status} size="xs" />
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Current: <span className="font-bold text-slate-800">{ing.quantity} {ing.unit}</span> (Min: {ing.minThreshold} {ing.unit}) • {ing.supplierName}
                      </div>
                    </div>
                    {currentUser?.role !== 'restaurant_manager' && (
                      <Button
                        variant="primary"
                        size="xs"
                        onClick={() => navigate('/purchase-orders?action=create')}
                      >
                        Reorder
                      </Button>
                    )}
                  </div>
                ))}
              {restaurantIngredients.filter(i => i.status !== 'in_stock').length === 0 && (
                <div className="p-6 text-center text-xs text-slate-500">
                  All ingredients are currently well above safety stock thresholds!
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Recent Stock Activities */}
        <div className="lg:col-span-6">
          <Card padding={false}>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 text-base">Recent Stock Movements</h3>
                <p className="text-xs text-slate-500 mt-0.5">Receipts, prep consumption, and wastage entries</p>
              </div>
              <Button
                variant="ghost"
                size="xs"
                iconRight={ArrowRight}
                onClick={() => navigate('/stock-movements')}
              >
                Movement Log
              </Button>
            </div>

            <div className="divide-y divide-slate-100">
              {restaurantMovements.slice(0, 4).map((mov) => (
                <div key={mov.id} className="p-4 sm:px-6 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                      <History className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-sm">{mov.ingredientName}</span>
                        <Badge status={mov.type} size="xs" />
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity} {mov.unit} • {mov.reason}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-xs text-slate-400 whitespace-nowrap">
                    <div>{mov.performedBy}</div>
                    <div className="text-[10px]">
                      {new Date(mov.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

