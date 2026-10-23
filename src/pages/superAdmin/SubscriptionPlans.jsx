import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CreditCard,
  Check,
  Edit3,
  Building2,
  Plus,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { formatINR } from '../../data/inventoryBillingData';

export const SubscriptionPlans = () => {
  const { plans, restaurants, updatePlan, assignPlanToRestaurant } = useApp();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Edit Plan Form State
  const [editFormData, setEditFormData] = useState({
    id: '',
    name: '',
    monthlyPrice: 0,
    description: '',
    maxIngredients: 0,
    maxStaff: 0,
    branches: 1,
  });

  // Assign Plan Form State
  const [assignFormData, setAssignFormData] = useState({
    restaurantId: restaurants[0]?.id || '',
    planId: plans[0]?.id || '',
  });

  const handleOpenEdit = (plan) => {
    setSelectedPlan(plan);
    setEditFormData({
      id: plan.id,
      name: plan.name,
      monthlyPrice: plan.monthlyPrice,
      description: plan.description,
      maxIngredients: plan.limits.maxIngredients,
      maxStaff: plan.limits.maxStaff,
      branches: plan.limits.branches,
    });
    setEditModalOpen(true);
  };

  const handleSavePlan = (e) => {
    e.preventDefault();
    updatePlan(editFormData.id, {
      name: editFormData.name,
      monthlyPrice: Number(editFormData.monthlyPrice),
      description: editFormData.description,
      limits: {
        maxIngredients: Number(editFormData.maxIngredients),
        maxStaff: Number(editFormData.maxStaff),
        branches: Number(editFormData.branches),
        support: selectedPlan?.limits?.support || 'Priority',
      },
    });
    setEditModalOpen(false);
  };

  const handleAssignPlan = (e) => {
    e.preventDefault();
    assignPlanToRestaurant(assignFormData.restaurantId, assignFormData.planId);
    setAssignModalOpen(false);
  };

  // Status breakdown
  const activeSubs = restaurants.filter(r => r.status === 'active').length;
  const trialSubs = 1;
  const expiredSubs = 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription Tier Management"
        subtitle="Configure pricing packages, tenant allowances, and reassign plans (Workflow D)"
        breadcrumbs={[
          { label: 'Admin', href: '#/admin/dashboard' },
          { label: 'Subscription Plans' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="brand"
              size="sm"
              icon={Building2}
              onClick={() => {
                setAssignFormData({
                  restaurantId: restaurants[0]?.id || '',
                  planId: plans[0]?.id || '',
                });
                setAssignModalOpen(true);
              }}
            >
              Assign Plan to Restaurant
            </Button>
          </div>
        }
      />

      {/* Subscription Metrics Quick Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Subscriptions</span>
          <div className="text-xl font-bold text-emerald-800 mt-1">{activeSubs} Accounts</div>
        </div>
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Trial Accounts</span>
          <div className="text-xl font-bold text-blue-700 mt-1">{trialSubs} Account</div>
        </div>
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg Plan ARPU</span>
          <div className="text-xl font-bold text-slate-800 mt-1">₹2,499 / mo</div>
        </div>
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Monthly Churn</span>
          <div className="text-xl font-bold text-slate-800 mt-1">0.8%</div>
        </div>
      </div>

      {/* Workflow D Helper Notice */}
      <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 flex items-start gap-3 text-xs text-indigo-950">
        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 font-bold text-[11px]">
          D
        </span>
        <div>
          <strong className="block font-semibold">Workflow D Interactive Flow:</strong>
          You can edit any plan's pricing or ingredient limits below, or click <strong>"Assign Plan to Restaurant"</strong> to reassign a demo restaurant (e.g. upgrade Spice Garden from Professional to Enterprise). Changes will immediately reflect in the restaurant's workspace!
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const assignedRestaurants = restaurants.filter(r => r.planId === plan.id);

          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-6 bg-white border transition-all duration-200 shadow-xs flex flex-col justify-between ${
                plan.popular
                  ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-md'
                  : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    plan.popular ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {plan.badge || plan.name}
                  </span>
                  <button
                    onClick={() => handleOpenEdit(plan)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-slate-100 transition-colors"
                    title="Edit Plan Pricing & Limits (Workflow D)"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                <p className="text-xs text-slate-500 mt-1 min-h-[36px] leading-relaxed">
                  {plan.description}
                </p>

                {/* Price Display */}
                <div className="my-5 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">
                    {formatINR(plan.monthlyPrice)}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">/ month billed monthly</span>
                </div>

                {/* Limits summary */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 mb-5 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tracked Ingredients:</span>
                    <span className="font-bold text-slate-800">
                      {plan.limits.maxIngredients > 1000 ? 'Unlimited' : `Up to ${plan.limits.maxIngredients}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Staff Accounts:</span>
                    <span className="font-bold text-slate-800">
                      {plan.limits.maxStaff > 1000 ? 'Unlimited' : `Up to ${plan.limits.maxStaff} users`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Branches Supported:</span>
                    <span className="font-bold text-slate-800">
                      {plan.limits.branches > 50 ? 'Unlimited' : `${plan.limits.branches} location`}
                    </span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2.5 mb-6">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Included Features
                  </span>
                  {plan.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-700">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assigned Restaurants list */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-slate-600">Assigned Restaurants:</span>
                  <span className="font-bold text-emerald-800">{assignedRestaurants.length}</span>
                </div>

                <div className="flex flex-wrap gap-1.5 min-h-[30px]">
                  {assignedRestaurants.length === 0 ? (
                    <span className="text-[11px] text-slate-400 italic">No restaurants currently on this tier</span>
                  ) : (
                    assignedRestaurants.map(r => (
                      <span
                        key={r.id}
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {r.name}
                      </span>
                    ))
                  )}
                </div>

                <div className="mt-4">
                  <Button
                    variant={plan.popular ? 'brand' : 'outline'}
                    size="sm"
                    className="w-full"
                    icon={Edit3}
                    onClick={() => handleOpenEdit(plan)}
                  >
                    Edit Plan Limits
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Plan Modal (Workflow D Step 4) */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit ${selectedPlan?.name} Plan`}
        subtitle="Modify subscription limits, monthly price, and description"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="brand" onClick={handleSavePlan}>
              Save Plan Changes
            </Button>
          </>
        }
      >
        <form onSubmit={handleSavePlan} className="space-y-4">
          <FormInput
            label="Plan Display Name"
            name="name"
            value={editFormData.name}
            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Monthly Price (₹ INR)"
              name="monthlyPrice"
              type="number"
              min="0"
              value={editFormData.monthlyPrice}
              onChange={(e) => setEditFormData({ ...editFormData, monthlyPrice: e.target.value })}
              required
            />

            <FormInput
              label="Max Tracked Ingredients"
              name="maxIngredients"
              type="number"
              min="10"
              value={editFormData.maxIngredients}
              onChange={(e) => setEditFormData({ ...editFormData, maxIngredients: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Max Staff User Accounts"
              name="maxStaff"
              type="number"
              min="1"
              value={editFormData.maxStaff}
              onChange={(e) => setEditFormData({ ...editFormData, maxStaff: e.target.value })}
              required
            />

            <FormInput
              label="Max Branches"
              name="branches"
              type="number"
              min="1"
              value={editFormData.branches}
              onChange={(e) => setEditFormData({ ...editFormData, branches: e.target.value })}
              required
            />
          </div>

          <FormInput
            label="Plan Description"
            name="description"
            type="textarea"
            rows={2}
            value={editFormData.description}
            onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
          />
        </form>
      </Modal>

      {/* Assign Plan to Restaurant Modal (Workflow D Step 5-6) */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Subscription Plan to Restaurant"
        subtitle="Upgrades or migrates a restaurant tenant to a different package"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="brand" onClick={handleAssignPlan}>
              Apply & Update Subscription
            </Button>
          </>
        }
      >
        <form onSubmit={handleAssignPlan} className="space-y-4">
          <FormInput
            label="Select Restaurant"
            name="restaurantId"
            type="select"
            value={assignFormData.restaurantId}
            onChange={(e) => setAssignFormData({ ...assignFormData, restaurantId: e.target.value })}
            options={restaurants.map(r => ({
              label: `${r.name} (Currently on ${r.planName})`,
              value: r.id,
            }))}
          />

          <FormInput
            label="Target Subscription Plan"
            name="planId"
            type="select"
            value={assignFormData.planId}
            onChange={(e) => setAssignFormData({ ...assignFormData, planId: e.target.value })}
            options={plans.map(p => ({
              label: `${p.name} (${formatINR(p.monthlyPrice)}/mo)`,
              value: p.id,
            }))}
          />

          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950">
            <strong>Instant Provisioning:</strong> The tenant's limits for ingredient counts and allowed staff seats will be automatically updated immediately upon confirmation.
          </div>
        </form>
      </Modal>
    </div>
  );
};

