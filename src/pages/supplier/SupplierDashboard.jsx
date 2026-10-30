import React, { useState } from 'react';
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
  Boxes,
  Store,
  ShieldCheck,
  Check,
  Zap,
  Eye,
  Printer,
  Globe,
  Handshake,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Card, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { formatINR } from '../../data/inventoryBillingData';
import { SUPPLIER_SUBSCRIPTION_PLANS } from '../../data/supplierMarketplaceData';

export const SupplierDashboard = () => {
  const navigate = useNavigate();
  const {
    purchaseOrders,
    currentUser,
    updatePOStatus,
    supplierInvoices,
    supplierReturns,
    supplierProducts,
    suppliers,
    supplierPlanPayments,
    switchSupplierPlan,
  } = useApp();

  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isPaymentHistoryModalOpen, setIsPaymentHistoryModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const currentSupplierId = currentUser?.supplierId;
  const mySupplier = suppliers.find((s) => s.id === currentSupplierId || s.name === currentUser?.supplierName) || {
    id: currentSupplierId,
    name: currentUser?.supplierName || currentUser?.name || 'Partner',
    supplierType: currentUser?.supplierType || (currentUser?.registeredVia === 'main_system' ? 'Tie-up Supplier' : 'Third-Party Supplier'),
    registeredVia: currentUser?.registeredVia || 'supplier_portal',
    planName: 'Pro Vendor',
    rating: 4.8,
  };

  const resolvedSupplierType =
    mySupplier.supplierType ||
    currentUser?.supplierType ||
    (mySupplier.registeredVia === 'main_system' || currentUser?.registeredVia === 'main_system' || mySupplier.id === 'sup-4' || mySupplier.id === 'sup-5'
      ? 'Tie-up Supplier'
      : 'Third-Party Supplier');
  const isTieUp = resolvedSupplierType === 'Tie-up Supplier';

  const myPlanPayments = (supplierPlanPayments || []).filter(
    (p) =>
      (currentSupplierId && p.supplierId === currentSupplierId) ||
      (mySupplier.name && p.supplierName?.toLowerCase() === mySupplier.name?.toLowerCase()) ||
      (currentUser?.supplierName && p.supplierName?.toLowerCase() === currentUser.supplierName?.toLowerCase())
  );

  const myPlan =
    SUPPLIER_SUBSCRIPTION_PLANS.find((p) => p.name === mySupplier.planName) ||
    SUPPLIER_SUBSCRIPTION_PLANS[1];

  const myProducts = (supplierProducts || []).filter(
    (p) => (currentSupplierId && p.supplierId === currentSupplierId) || (mySupplier.name && p.supplierName === mySupplier.name)
  );

  // Filter only orders assigned to this supplier!
  const myOrders = purchaseOrders.filter(
    (po) => (currentSupplierId && po.supplierId === currentSupplierId) || (mySupplier.name && po.supplierName === mySupplier.name)
  );

  const pendingOrders = myOrders.filter((po) => po.status === 'pending');
  const acceptedOrders = myOrders.filter((po) => po.status === 'accepted');
  const dispatchedOrders = myOrders.filter((po) => po.status === 'dispatched');
  const deliveredOrders = myOrders.filter((po) => po.status === 'delivered');

  const totalFulfillValue = myOrders
    .filter((po) => po.status !== 'rejected' && po.status !== 'cancelled')
    .reduce((sum, po) => sum + po.totalAmount, 0);

  // Supplier Invoices & Receivables
  const myInvoices = (supplierInvoices || []).filter(
    (inv) => inv.supplierId === currentSupplierId || inv.supplierName === currentUser?.supplierName
  );
  const displayInvoices = myInvoices;
  const totalReceivables = displayInvoices.reduce((sum, inv) => sum + (inv.outstandingBalance || 0), 0);
  const totalInvoiced = displayInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

  // Supplier Returns & Credit Claims
  const myReturns = (supplierReturns || []).filter(
    (ret) => ret.supplierId === currentSupplierId || ret.supplierName === currentUser?.supplierName
  );
  const displayReturns = myReturns;
  const pendingReturnClaims = displayReturns.filter((r) => r.status === 'Pending').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${currentUser.supplierName || 'Metro Food Distributors'} Vendor Portal`}
        subtitle={`Logged in as ${currentUser.name} • Dedicated supplier view with isolated assigned orders`}
        badge={<Badge status="supplier" label="Authorized Supplier Partner" />}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Boxes}
              onClick={() => navigate('/supplier/products')}
            >
              Manage Catalog ({myProducts.length} SKUs)
            </Button>
            <Button
              variant="brand"
              size="sm"
              icon={ShoppingBag}
              onClick={() => navigate('/supplier/orders')}
            >
              Review Orders ({pendingOrders.length} Pending)
            </Button>
          </div>
        }
      />

      {/* Third-Party Supplier Subscription Plan & Benefits Module */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white border border-slate-800 shadow-lg relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-5 border-b border-slate-800">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold border border-emerald-500/30 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white">
                  {myPlan.name} Subscription
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  {myPlan.badge}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  isTieUp
                    ? 'bg-teal-500/25 text-teal-300 border border-teal-500/40'
                    : 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/40'
                }`}>
                  {isTieUp ? <Handshake className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                  <span>{resolvedSupplierType}</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-semibold">
                  {mySupplier.billingCycle === 'yearly' ? 'Annual Plan' : 'Monthly Plan'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                {myPlan.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-stretch lg:self-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              icon={Receipt}
              className="border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white"
              onClick={() => setIsPaymentHistoryModalOpen(true)}
            >
              Payment History ({myPlanPayments.length})
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={Sparkles}
              className="border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white"
              onClick={() => setIsPlanModalOpen(true)}
            >
              Explore / Change Plan
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={Store}
              onClick={() => navigate('/supplier/marketplace')}
            >
              Marketplace View
            </Button>
            <Button
              variant="brand"
              size="sm"
              icon={Boxes}
              onClick={() => navigate('/supplier/products')}
            >
              + Add Products
            </Button>
          </div>
        </div>

        {/* Plan Entitlements & Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-5 relative z-10">
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Wholesale Platform Fee
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-black text-emerald-400">{myPlan.commissionRate}%</span>
              <span className="text-xs text-slate-400">per fulfilled order</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Tier-discounted commission rate</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Bank Settlement Window
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-black text-white">{myPlan.payoutDays}</span>
              <span className="text-xs text-slate-400">turnaround</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Automatic direct deposit</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Catalog SKU Limit
              </span>
              <span className="text-[11px] font-bold text-slate-300">
                {myProducts.length} / {myPlan.maxProducts}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, Math.round((myProducts.length / (myPlan.maxProducts || 1)) * 100))}%`,
                }}
              />
            </div>
            <span className="text-[11px] text-slate-400 mt-1.5 block">
              {myPlan.maxProducts - myProducts.length > 0
                ? `${myPlan.maxProducts - myProducts.length} listings remaining`
                : 'Limit reached'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Plan Rate & Term
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-black text-white">
                {myPlan.price === 0 ? 'FREE' : `₹${myPlan.price}`}
              </span>
              {myPlan.price > 0 && <span className="text-xs text-slate-400">/ month</span>}
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <Check className="w-3 h-3" /> Active & Compliant
            </span>
          </div>
        </div>

        {/* Feature List Preview */}
        <div className="mt-4 pt-4 border-t border-slate-800/60 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-300">
          {myPlan.features.slice(0, 4).map((feat, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </div>

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

      {/* Third-Party Supplier Subscription Plans Comparison Modal */}
      <Modal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        title="Third-Party Supplier Subscription & Service Plans"
        size="xl"
      >
        <div className="space-y-6">
          <p className="text-xs text-slate-500">
            Select a tailored wholesale tier to expand your restaurant market reach, unlock lower transaction commissions, and enjoy faster payout settlement cycles.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {SUPPLIER_SUBSCRIPTION_PLANS.map((plan) => {
              const isCurrent = (myPlan?.id === plan.id) || (myPlan?.name === plan.name);
              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                    isCurrent
                      ? 'bg-emerald-50/50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-slate-900">{plan.name}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          plan.popular
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {plan.badge}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1 my-3">
                      <span className="text-2xl font-black text-slate-900">
                        {plan.price === 0 ? '₹0' : `₹${plan.price}`}
                      </span>
                      <span className="text-xs text-slate-500">/ month</span>
                    </div>

                    <p className="text-xs text-slate-600 mb-4">{plan.description}</p>

                    <div className="space-y-2 py-3 border-y border-slate-100 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Commission Rate:</span>
                        <strong className="text-emerald-700">{plan.commissionRate}%</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Payout Cycle:</span>
                        <strong className="text-slate-800">{plan.payoutDays}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Listing Capacity:</span>
                        <strong className="text-slate-800">{plan.maxProducts} SKUs</strong>
                      </div>
                    </div>

                    <ul className="mt-4 space-y-2 text-xs text-slate-600">
                      {plan.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-3">
                    {isCurrent ? (
                      <div className="py-2 px-3 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold text-center">
                        ✓ Current Active Tier
                      </div>
                    ) : (
                      <Button
                        variant={plan.popular ? 'brand' : 'outline'}
                        className="w-full justify-center"
                        size="sm"
                        onClick={() => {
                          switchSupplierPlan(plan.id);
                          setIsPlanModalOpen(false);
                        }}
                      >
                        Switch to {plan.name}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Modal>

      {/* Third-Party Supplier Subscription Payment History Modal */}
      <Modal
        isOpen={isPaymentHistoryModalOpen}
        onClose={() => setIsPaymentHistoryModalOpen(false)}
        title="Subscription Payment History & Receipts"
        subtitle={`Track plan purchase receipts, UTR numbers, and renewal dates for ${mySupplier.name}`}
        size="lg"
        footer={
          <Button variant="secondary" size="sm" onClick={() => setIsPaymentHistoryModalOpen(false)}>
            Close
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
            <div>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                Active Tier Subscription
              </span>
              <div className="text-base font-extrabold">{myPlan.name} Plan</div>
              <div className="text-xs text-slate-300">
                {myPlan.price === 0 ? 'Free Starter Tier' : `₹${myPlan.price} / month`}
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active &amp; Compliant
              </span>
              <div className="text-xs text-slate-400 mt-1">
                Settlement SLA: <strong className="text-white">{myPlan.payoutDays}</strong>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 flex justify-between items-center">
              <span>B2B Subscription Payment Ledger</span>
              <span className="text-slate-400 font-medium">({myPlanPayments.length} Payments Recorded)</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/60 text-slate-600 font-bold">
                    <th className="py-2.5 px-3">Invoice #</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Plan Tier</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">UTR / Reference</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myPlanPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        {payment.invoiceNumber}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{payment.paymentDate}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">
                        {payment.planName}
                        <span className="text-[10px] text-slate-400 block capitalize">
                          {payment.billingCycle}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-emerald-800">
                        {payment.amount === 0 ? '₹0 (Free)' : formatINR(payment.amount)}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                        {payment.referenceNumber}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                          {payment.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <Button
                          variant="outline"
                          size="xs"
                          icon={Eye}
                          onClick={() => setSelectedReceipt(payment)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {myPlanPayments.length === 0 && (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400 italic">
                        No subscription plan payments recorded yet for this supplier.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Modal>

      {/* Individual Plan Invoice Receipt Modal */}
      <Modal
        isOpen={Boolean(selectedReceipt)}
        onClose={() => setSelectedReceipt(null)}
        title={`Tax Invoice: ${selectedReceipt?.invoiceNumber || ''}`}
        subtitle="Platform Subscription Tax Receipt"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              size="sm"
              icon={Printer}
              onClick={() => window.print()}
            >
              Print Receipt
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setSelectedReceipt(null)}>
              Close
            </Button>
          </div>
        }
      >
        {selectedReceipt && (
          <div className="space-y-4 p-1">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                  Official B2B Subscription Invoice
                </span>
                <h4 className="text-lg font-black">{selectedReceipt.planName}</h4>
                <div className="text-xs text-slate-300 mt-0.5">
                  Invoice Ref: {selectedReceipt.invoiceNumber}
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {selectedReceipt.status}
                </span>
                <div className="text-xl font-black mt-2">
                  {selectedReceipt.amount === 0 ? '₹0' : formatINR(selectedReceipt.amount)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-slate-500 block text-[11px]">Billed To:</span>
                <strong className="text-slate-800 text-sm">{selectedReceipt.supplierName}</strong>
                <div className="text-slate-500 mt-0.5">Supplier ID: {selectedReceipt.supplierId}</div>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Issued By:</span>
                <strong className="text-slate-800 text-sm">StockMate SaaS Procurement</strong>
                <div className="text-slate-500 mt-0.5">GSTIN: 27AABCU9603R1ZM</div>
              </div>
            </div>

            <div className="space-y-2 text-xs border border-slate-200 rounded-xl p-3">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Payment Date:</span>
                <span className="font-semibold text-slate-800">{selectedReceipt.paymentDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-mono text-slate-800">{selectedReceipt.transactionId || 'TXN-98214'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">UTR / Reference:</span>
                <span className="font-mono text-emerald-700 font-bold">{selectedReceipt.referenceNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Payment Mode:</span>
                <span className="font-semibold text-slate-800">{selectedReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Next Renewal Date:</span>
                <span className="font-semibold text-slate-800">{selectedReceipt.nextBillingDate || '2026-11-15'}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

