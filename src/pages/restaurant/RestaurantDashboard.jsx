import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Boxes,
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
    currentUser,
  } = useApp();

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
        title={`${currentRestaurant?.name} Inventory Overview`}
        subtitle={`${currentRestaurant?.cuisine} • Real-time stock counts, active alerts, and consumption analytics`}
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span>{currentRestaurant?.logo || '🌿'}</span>
            <span>{currentRestaurant?.planName} Tier</span>
          </span>
        }
        actions={
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
        }
      />

      {/* Critical Stock Alert Banner if any out of stock or low stock items */}
      {(lowStockItems > 0 || outOfStockItems > 0) && (
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
            <Button
              variant="primary"
              size="xs"
              onClick={() => navigate('/purchase-orders?action=create')}
            >
              Reorder Stock (PO)
            </Button>
          </div>
        </div>
      )}

      {/* Primary KPI Grid */}
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
                    <Button
                      variant="primary"
                      size="xs"
                      onClick={() => navigate('/purchase-orders?action=create')}
                    >
                      Reorder
                    </Button>
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

