import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Truck,
  ShoppingBag,
  PackageCheck,
  Clock,
  IndianRupee,
  TrendingUp,
  Building2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Receipt,
  RotateCcw,
  Sparkles,
  CreditCard,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Card, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { formatINR } from '../../data/inventoryBillingData';

export const SupplierDashboard = () => {
  const navigate = useNavigate();
  const { purchaseOrders, currentUser, updatePOStatus, supplierInvoices, supplierReturns } = useApp();

  // Filter only orders assigned to this supplier!
  const myOrders = purchaseOrders.filter(
    (po) => po.supplierId === (currentUser.supplierId || 'sup-1')
  );

  const pendingOrders = myOrders.filter((po) => po.status === 'pending');
  const acceptedOrders = myOrders.filter((po) => po.status === 'accepted');
  const dispatchedOrders = myOrders.filter((po) => po.status === 'dispatched');
  const deliveredOrders = myOrders.filter((po) => po.status === 'delivered');

  const totalFulfillValue = myOrders
    .filter((po) => po.status !== 'rejected' && po.status !== 'cancelled')
    .reduce((sum, po) => sum + po.totalAmount, 0);

  // Supplier Invoices & Receivables
  const currentSupplierId = currentUser?.supplierId || 'sup-1';
  const myInvoices = (supplierInvoices || []).filter(
    (inv) => inv.supplierId === currentSupplierId || inv.supplierName === currentUser?.supplierName
  );
  const displayInvoices = myInvoices.length > 0 ? myInvoices : supplierInvoices || [];
  const totalReceivables = displayInvoices.reduce((sum, inv) => sum + (inv.outstandingBalance || 0), 0);
  const totalInvoiced = displayInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

  // Supplier Returns & Credit Claims
  const myReturns = (supplierReturns || []).filter(
    (ret) => ret.supplierId === currentSupplierId || ret.supplierName === currentUser?.supplierName
  );
  const displayReturns = myReturns.length > 0 ? myReturns : supplierReturns || [];
  const pendingReturnClaims = displayReturns.filter((r) => r.status === 'Pending').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${currentUser.supplierName || 'Metro Food Distributors'} Vendor Portal`}
        subtitle={`Logged in as ${currentUser.name} • Dedicated supplier view with isolated assigned orders`}
        badge={<Badge status="supplier" label="Authorized Supplier Partner" />}
        actions={
          <Button
            variant="brand"
            size="sm"
            icon={ShoppingBag}
            onClick={() => navigate('/supplier/orders')}
          >
            Review Orders ({pendingOrders.length} Pending)
          </Button>
        }
      />

      {/* Pending Requisitions Banner (Workflow C Highlight) */}
      {pendingOrders.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-950">
                {pendingOrders.length} New Purchase Order{pendingOrders.length > 1 ? 's' : ''} Awaiting Acceptance
              </h4>
              <p className="text-xs text-amber-800">
                Restaurant clients have dispatched orders to your dispatch queue (Workflow C Step 6).
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/supplier/orders?filter=pending')}
          >
            Accept / Reject Orders
          </Button>
        </div>
      )}

      {/* Supplier KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pending Acceptance"
          value={pendingOrders.length}
          change={pendingOrders.length > 0 ? 'Action Needed' : 'Queue Clear'}
          trend={pendingOrders.length > 0 ? 'down' : 'up'}
          subtext="New restaurant purchase orders"
          icon={Clock}
          accentColor={pendingOrders.length > 0 ? 'amber' : 'emerald'}
          onClick={() => navigate('/supplier/orders?filter=pending')}
        />

        <StatCard
          title="Active in Fulfillment"
          value={acceptedOrders.length + dispatchedOrders.length}
          change="In Transit / Prep"
          trend="neutral"
          subtext="Accepted or Dispatched"
          icon={Truck}
          accentColor="blue"
          onClick={() => navigate('/supplier/orders')}
        />

        <StatCard
          title="Fulfilled & Delivered"
          value={deliveredOrders.length}
          change="100% On-Time"
          trend="up"
          subtext="Completed restaurant orders"
          icon={PackageCheck}
          accentColor="emerald"
          onClick={() => navigate('/supplier/history')}
        />

        <StatCard
          title="Pipeline Volume"
          value={formatINR(totalFulfillValue)}
          change="Gross Value"
          trend="up"
          subtext="Across all partner restaurants"
          icon={IndianRupee}
          accentColor="purple"
        />
      </div>

      {/* Active Requisitions Quick Action List */}
      <Card padding={false}>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 text-base">Assigned Restaurant Purchase Orders</h3>
            <p className="text-xs text-slate-500 mt-0.5">Orders assigned exclusively to {currentUser.supplierName}</p>
          </div>
          <Button
            variant="ghost"
            size="xs"
            iconRight={ArrowRight}
            onClick={() => navigate('/supplier/orders')}
          >
            All Assigned Orders
          </Button>
        </div>

        <div className="divide-y divide-slate-100">
          {myOrders.slice(0, 5).map((po) => (
            <div key={po.id} className="p-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{po.poNumber}</span>
                  <Badge status={po.status} size="xs" />
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {po.restaurantName}
                  </span>
                </div>
                <div className="text-xs text-slate-600">
                  {po.items.map(it => `${it.quantity} ${it.unit} ${it.name}`).join(', ')}
                </div>
                <div className="text-[11px] text-slate-400">
                  Delivery window: <strong>{po.expectedDelivery}</strong> • Value: <strong>{formatINR(po.totalAmount)}</strong>
                </div>
              </div>

              {/* Status Action Buttons for Workflow C */}
              <div className="flex items-center gap-2 shrink-0">
                {po.status === 'pending' && (
                  <>
                    <Button
                      variant="success"
                      size="xs"
                      onClick={() => updatePOStatus(po.id, 'accepted')}
                    >
                      Accept Order
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      className="text-rose-600 border-rose-200"
                      onClick={() => updatePOStatus(po.id, 'rejected', 'Out of stock at supplier warehouse')}
                    >
                      Reject
                    </Button>
                  </>
                )}

                {po.status === 'accepted' && (
                  <Button
                    variant="brand"
                    size="xs"
                    icon={Truck}
                    onClick={() => updatePOStatus(po.id, 'dispatched')}
                  >
                    Mark Dispatched
                  </Button>
                )}

                {po.status === 'dispatched' && (
                  <Button
                    variant="success"
                    size="xs"
                    icon={PackageCheck}
                    onClick={() => updatePOStatus(po.id, 'delivered')}
                  >
                    Mark Delivered
                  </Button>
                )}

                {po.status === 'delivered' && (
                  <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Delivered to Kitchen
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Supplier Billing, Receivables & Credit Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Invoices & Receivables Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Sales Invoices & Receivables</h4>
                  <p className="text-xs text-slate-400">Issued bills and verified restaurant settlements</p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                {displayInvoices.length} Invoices
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 my-4 p-3 bg-slate-50 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Total Billed:</span>
                <span className="font-bold text-slate-900 text-sm">{formatINR(totalInvoiced)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Outstanding Dues:</span>
                <span className="font-bold text-amber-700 text-sm">{formatINR(totalReceivables)}</span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full justify-center"
            iconRight={ArrowRight}
            onClick={() => navigate('/supplier/invoices')}
          >
            Manage Invoices & Payments
          </Button>
        </div>

        {/* Return Claims & Credit Notes Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Return Claims & Credit Notes</h4>
                  <p className="text-xs text-slate-400">Damaged stock and fresh bread returns</p>
                </div>
              </div>
              {pendingReturnClaims > 0 ? (
                <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-lg">
                  {pendingReturnClaims} Action Needed
                </span>
              ) : (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  All Clear
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 my-4">
              Review dock damage rejections and fresh unsold bread return requests under 24h SLA agreements. Issue verified Credit Notes to restaurant accounts.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            className="w-full justify-center"
            iconRight={ArrowRight}
            onClick={() => navigate('/supplier/returns')}
          >
            Review Claims & Issue Credit Notes ({pendingReturnClaims})
          </Button>
        </div>
      </div>
    </div>
  );
};

