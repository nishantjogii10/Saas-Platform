import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  CreditCard,
  Building2,
  Bell,
  Save,
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { formatINR } from '../../data/inventoryBillingData';

export const RestaurantSettingsPage = () => {
  const {
    currentRestaurant,
    restaurantIngredients,
    restaurantStaff,
    plans,
    assignPlanToRestaurant,
    addToast,
  } = useApp();

  const [restaurantProfile, setRestaurantProfile] = useState({
    name: currentRestaurant?.name || '',
    cuisine: currentRestaurant?.cuisine || '',
    phone: currentRestaurant?.phone || '',
    address: currentRestaurant?.address || '',
    branches: currentRestaurant?.branches || 1,
  });

  const [notifications, setNotifications] = useState({
    lowStockSms: true,
    poDispatchEmail: true,
    dailyExpiryDigest: true,
    criticalThresholdPush: true,
  });

  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const currentPlan = plans.find(p => p.id === currentRestaurant?.planId) || plans[0];
  const ingredientsUsed = restaurantIngredients.length;
  const ingredientsLimit = currentPlan.limits.maxIngredients;
  const staffUsed = restaurantStaff.length;
  const staffLimit = currentPlan.limits.maxStaff;

  const handleSaveProfile = (e) => {
    e.preventDefault();
    addToast('Restaurant profile details updated successfully.', 'success');
  };

  const handleSaveNotifications = (e) => {
    e.preventDefault();
    addToast('Kitchen notification preferences updated.', 'success');
  };

  const handleSelectUpgrade = (planId) => {
    assignPlanToRestaurant(currentRestaurant.id, planId);
    setUpgradeModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${currentRestaurant?.name} Settings & Subscription`}
        subtitle="Manage business credentials, multi-branch setup, notification webhooks, and subscription tier"
        breadcrumbs={[
          { label: 'Restaurant', href: '#/dashboard' },
          { label: 'Settings & Plan' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Profile & Notification Preferences */}
        <div className="lg:col-span-7 space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader
              title="Restaurant Profile"
              subtitle="Identity and contact information for purchase order invoices"
              icon={Building2}
            />
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Restaurant Name"
                  name="name"
                  value={restaurantProfile.name}
                  onChange={(e) => setRestaurantProfile({ ...restaurantProfile, name: e.target.value })}
                  required
                />

                <FormInput
                  label="Cuisine / Dining Concept"
                  name="cuisine"
                  value={restaurantProfile.cuisine}
                  onChange={(e) => setRestaurantProfile({ ...restaurantProfile, cuisine: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Contact Phone"
                  name="phone"
                  value={restaurantProfile.phone}
                  onChange={(e) => setRestaurantProfile({ ...restaurantProfile, phone: e.target.value })}
                />

                <FormInput
                  label="Active Locations / Branches"
                  name="branches"
                  type="number"
                  min="1"
                  max="10"
                  value={restaurantProfile.branches}
                  onChange={(e) => setRestaurantProfile({ ...restaurantProfile, branches: e.target.value })}
                />
              </div>

              <FormInput
                label="Physical Street Address"
                name="address"
                value={restaurantProfile.address}
                onChange={(e) => setRestaurantProfile({ ...restaurantProfile, address: e.target.value })}
              />

              <Button type="submit" variant="brand" size="sm" icon={Save}>
                Save Profile Changes
              </Button>
            </form>
          </Card>

          {/* Kitchen Notification Triggers */}
          <Card>
            <CardHeader
              title="Automated Alert Dispatches"
              subtitle="Configure SMS and email notices for line cooks and managers"
              icon={Bell}
            />
            <form onSubmit={handleSaveNotifications} className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-xs">
                <div>
                  <span className="font-semibold text-slate-800 block">Instant Low Stock Push Notice</span>
                  <span className="text-slate-500">Alert managers immediately when an ingredient hits threshold</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.lowStockSms}
                  onChange={(e) => setNotifications({ ...notifications, lowStockSms: e.target.checked })}
                  className="rounded text-emerald-800 h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-xs">
                <div>
                  <span className="font-semibold text-slate-800 block">Purchase Order Dispatch Confirmations</span>
                  <span className="text-slate-500">Receive copy when vendor marks order as dispatched</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.poDispatchEmail}
                  onChange={(e) => setNotifications({ ...notifications, poDispatchEmail: e.target.checked })}
                  className="rounded text-emerald-800 h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-xs">
                <div>
                  <span className="font-semibold text-slate-800 block">Daily Morning Expiry Digest</span>
                  <span className="text-slate-500">Summary of all batches expiring in next 72 hours</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.dailyExpiryDigest}
                  onChange={(e) => setNotifications({ ...notifications, dailyExpiryDigest: e.target.checked })}
                  className="rounded text-emerald-800 h-4 w-4"
                />
              </label>

              <Button type="submit" variant="outline" size="sm" icon={Save}>
                Update Notification Rules
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Column: Current Plan & Limits */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader
              title="Active Subscription Tier"
              subtitle="Plan details and resource allocation"
              icon={CreditCard}
              action={<Badge status="active" label="Paid Active" />}
            />

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 mb-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Current Plan</span>
                  <h3 className="text-2xl font-extrabold text-emerald-950 mt-0.5">{currentPlan.name} Tier</h3>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-950">${currentPlan.monthlyPrice}</span>
                  <span className="text-xs text-emerald-800 block">/ month</span>
                </div>
              </div>
              <p className="text-xs text-emerald-800 mt-2 leading-relaxed">
                {currentPlan.description}
              </p>
            </div>

            {/* Usage Progress Bars */}
            <div className="space-y-4 mb-6">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Resource Usage
              </span>

              {/* Ingredients Usage */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Tracked Ingredients</span>
                  <span className="font-bold text-slate-900">
                    {ingredientsUsed} / {ingredientsLimit > 1000 ? 'Unlimited' : ingredientsLimit}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{ width: `${Math.min(100, (ingredientsUsed / (ingredientsLimit || 100)) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Staff Accounts Usage */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Staff User Accounts</span>
                  <span className="font-bold text-slate-900">
                    {staffUsed} / {staffLimit > 1000 ? 'Unlimited' : staffLimit} seats
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-teal-600 rounded-full"
                    style={{ width: `${Math.min(100, (staffUsed / (staffLimit || 5)) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Renewal info */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex justify-between">
                <span>Renewal / Billing Date:</span>
                <span className="font-bold text-slate-800">{currentRestaurant?.renewalDate || '2026-11-14'}</span>
              </div>
            </div>

            <Button
              variant="brand"
              className="w-full"
              icon={Sparkles}
              onClick={() => setUpgradeModalOpen(true)}
            >
              Upgrade or Change Subscription
            </Button>
          </Card>
        </div>
      </div>

      {/* Upgrade Plan Modal */}
      <Modal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        title="Upgrade Restaurant Subscription"
        subtitle="Select a tier to instantly upgrade your ingredient quota and staff seat limits"
        maxWidth="max-w-3xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
          {plans.map((p) => {
            const isCurrent = p.id === currentRestaurant.planId;
            return (
              <div
                key={p.id}
                className={`rounded-2xl p-4 border flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 text-base">{p.name}</span>
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 my-2">
                    {formatINR(p.monthlyPrice)}<span className="text-xs text-slate-500 font-normal">/mo</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-4 line-clamp-2">{p.description}</p>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{p.limits.maxIngredients > 1000 ? 'Unlimited SKUs' : `Up to ${p.limits.maxIngredients} SKUs`}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{p.limits.maxStaff > 1000 ? 'Unlimited users' : `${p.limits.maxStaff} staff seats`}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{p.limits.branches} location branch</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <Button
                    variant={isCurrent ? 'secondary' : 'brand'}
                    size="sm"
                    className="w-full"
                    disabled={isCurrent}
                    onClick={() => handleSelectUpgrade(p.id)}
                  >
                    {isCurrent ? 'Current Tier' : `Select ${p.name}`}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
};

