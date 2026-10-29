import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Store,
  Building2,
  Users,
  CalendarCheck,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  UserCheck,
  Boxes,
  ArrowRight,
  ShieldCheck,
  ArrowLeftRight,
  Sparkles,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { formatINR, BRANCH_PLANS_CONFIG } from '../../data/branchData';

export const BranchOverviewPage = () => {
  const navigate = useNavigate();
  const {
    branches,
    currentBranchId,
    switchBranch,
    branchStaff,
    staffTransfers,
    ownerNotifications,
    currentUser,
    addToast,
  } = useApp();
  const isOwner = currentUser?.role === 'restaurant_owner';

  const [selectedBranchForInfo, setSelectedBranchForInfo] = useState(null);

  // Compute metrics
  const totalBranches = branches.length;
  const activeBranches = branches.filter((b) => b.status === 'active').length;
  const totalStaff = branchStaff.length;
  const totalManagers = branchStaff.filter((s) => s.isManager).length;
  const pendingTransfers = staffTransfers.filter((t) => t.status === 'Pending').length;

  // Monthly subscription run rate
  const monthlyRunRate = branches.reduce((acc, b) => {
    if (b.status !== 'active') return acc;
    if (b.billingCycle === 'Yearly') {
      return acc + Math.round(b.price / 12);
    }
    return acc + b.price;
  }, 0);

  const activeBranch = branches.find((b) => b.id === currentBranchId) || branches[0];

  const handleSwitchBranch = (branchId, branchName) => {
    switchBranch(branchId);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Multi-Branch Management & Overview"
        subtitle="Manage all 5 Spice Garden outlets, operational records, manager assignments, and branch subscription plans."
        action={
          <div className="flex flex-wrap items-center gap-2">
            {!isOwner && (
              <Button
                variant="outline"
                size="sm"
                icon={ArrowLeftRight}
                onClick={() => navigate('/staff-transfers')}
              >
                Transfer Staff {pendingTransfers > 0 && `(${pendingTransfers})`}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              icon={CalendarCheck}
              onClick={() => navigate('/branch-subscriptions')}
            >
              Branch Subscriptions
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => navigate('/branches')}
            >
              Manage Branches
            </Button>
          </div>
        }
      />

      {/* Active Branch Callout Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ACTIVE WORKSPACE OUTLET
              </span>
              <span className="text-xs text-slate-400 font-mono">{activeBranch?.code}</span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
              {activeBranch?.name}
            </h2>
            <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{activeBranch?.address}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-center border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
          <div className="text-left md:text-right">
            <div className="text-xs text-slate-400">Assigned Plan</div>
            <div className="text-sm font-bold text-emerald-400">
              {activeBranch?.planName} ({activeBranch?.billingCycle})
            </div>
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="text-xs bg-white/10 hover:bg-white/20 text-white border-white/20"
            onClick={() => navigate('/branch-plans')}
          >
            Upgrade Plan
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          title="Total Branches"
          value={totalBranches}
          subtitle={`${activeBranches} Active Outlets`}
          icon={Store}
          variant="default"
        />
        <StatCard
          title="Total Branch Staff"
          value={totalStaff}
          subtitle={`${totalManagers} Branch Managers`}
          icon={Users}
          variant="default"
        />
        <StatCard
          title="Monthly Run-Rate"
          value={formatINR(monthlyRunRate)}
          subtitle="Normalized Subscription Cost"
          icon={TrendingUp}
          variant="success"
        />
        {!isOwner && (
          <StatCard
            title="Pending Transfers"
            value={pendingTransfers}
            subtitle={pendingTransfers > 0 ? "Action Required" : "All Processed"}
            icon={ArrowLeftRight}
            variant={pendingTransfers > 0 ? "warning" : "default"}
          />
        )}
        <StatCard
          title="Plan Tiers"
          value="3 Active"
          subtitle="Starter, Pro, Enterprise"
          icon={Sparkles}
          variant="default"
        />
      </div>

      {/* Branches Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Restaurant Outlets &amp; Operational Roster
            </h3>
            <p className="text-xs text-slate-500">
              Each branch operates with individual inventory, manager, staff quota, and subscription plan.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            {branches.length} Registered Locations
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map((branch) => {
            const isCurrent = branch.id === currentBranchId;
            const planConfig = BRANCH_PLANS_CONFIG[branch.planId] || BRANCH_PLANS_CONFIG['plan-starter'];
            const staffInBranch = branchStaff.filter((s) => s.branchId === branch.id);
            const manager = branchStaff.find((s) => s.id === branch.managerId) || {
              name: branch.managerName,
              email: branch.managerEmail,
            };

            return (
              <div
                key={branch.id}
                className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                  isCurrent
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                {/* Branch Card Header */}
                <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {branch.code}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            branch.planName === 'Enterprise'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : branch.planName === 'Professional'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {branch.planName}
                        </span>
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                          {branch.billingCycle}
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight mt-1.5">
                        {branch.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">{branch.type}</p>
                    </div>

                    {isCurrent ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-xs">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSwitchBranch(branch.id, branch.name)}
                        className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 transition-colors"
                        title="Switch current view to this branch"
                      >
                        Select
                      </button>
                    )}
                  </div>

                  {/* Branch Address */}
                  <div className="text-xs text-slate-600 flex items-start gap-1.5 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2 leading-relaxed">{branch.address}</span>
                  </div>
                </div>

                {/* Manager & Stats */}
                <div className="p-4 sm:p-5 bg-slate-50/50 space-y-3 text-xs">
                  {/* Manager Row */}
                  <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-slate-200/80">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-xs">
                        {manager?.name?.charAt(0) || 'M'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{manager?.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">Branch General Manager</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="xs"
                      className="text-[11px] text-indigo-600 hover:text-indigo-800"
                      onClick={() => navigate('/branch-staff')}
                    >
                      Change
                    </Button>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-white border border-slate-200/70">
                      <span className="text-[10px] text-slate-500 block">Staff</span>
                      <strong className="text-xs font-bold text-slate-900">
                        {staffInBranch.length} <span className="text-[10px] text-slate-400 font-normal">/ {planConfig.maxStaff}</span>
                      </strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-slate-200/70">
                      <span className="text-[10px] text-slate-500 block">Inventory</span>
                      <strong className="text-xs font-bold text-slate-900">
                        {branch.inventoryCount} items
                      </strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-slate-200/70">
                      <span className="text-[10px] text-slate-500 block">Seats</span>
                      <strong className="text-xs font-bold text-slate-900">
                        {branch.seatingCapacity}
                      </strong>
                    </div>
                  </div>

                  {/* Subscription details */}
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200">
                    <div className="text-slate-500">
                      Renewal: <strong className="text-slate-700">{branch.renewalDate}</strong>
                    </div>
                    <div className="font-bold text-slate-900">
                      {formatINR(branch.price)}
                      <span className="text-[10px] font-normal text-slate-500">
                        /{branch.billingCycle === 'Yearly' ? 'yr' : 'mo'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between gap-2">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setSelectedBranchForInfo(branch)}
                    className="text-xs text-slate-600"
                  >
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => navigate('/branch-subscriptions')}
                    className="text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                  >
                    Manage Plan
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Navigation Cards */}
      {!isOwner && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div
          onClick={() => navigate('/branch-staff')}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mt-3">Staff &amp; Managers</h4>
          <p className="text-xs text-slate-500 mt-1">
            Assign branch managers, set PINs, view active rosters, and manage cross-branch teams.
          </p>
        </div>

        <div
          onClick={() => navigate('/staff-transfers')}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mt-3">Staff Transfers</h4>
          <p className="text-xs text-slate-500 mt-1">
            Transfer cooks, chefs, and managers between Pune and Mumbai outlets with quota verification.
          </p>
        </div>

        <div
          onClick={() => navigate('/billing')}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mt-3">Billing &amp; Tax Invoices</h4>
          <p className="text-xs text-slate-500 mt-1">
            View GST-compliant tax invoices, download PDF receipts, and track annual/monthly renewals.
          </p>
        </div>
      </div>
      )}

      {/* Branch Info Modal */}
      {selectedBranchForInfo && (
        <Modal
          isOpen={!!selectedBranchForInfo}
          onClose={() => setSelectedBranchForInfo(null)}
          title={`Branch Details: ${selectedBranchForInfo.name}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold bg-white px-2 py-0.5 rounded border text-slate-700">
                  {selectedBranchForInfo.code}
                </span>
                <Badge status={selectedBranchForInfo.status} size="sm" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{selectedBranchForInfo.name}</h3>
              <p className="text-xs text-slate-600 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{selectedBranchForInfo.address}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                <h5 className="font-bold text-slate-800">Operational Contacts</h5>
                <p className="text-slate-600 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedBranchForInfo.phone}</span>
                </p>
                <p className="text-slate-600 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedBranchForInfo.email}</span>
                </p>
                <p className="text-slate-600">
                  <strong>Hours:</strong> {selectedBranchForInfo.openingHours}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                <h5 className="font-bold text-slate-800">Branch Manager</h5>
                <p className="text-slate-900 font-semibold">{selectedBranchForInfo.managerName}</p>
                <p className="text-slate-500">{selectedBranchForInfo.managerEmail}</p>
                <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium">
                  Authorised Signatory
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-emerald-950">Subscription &amp; Billing</h5>
                <span className="font-bold text-emerald-700 text-sm">
                  {formatINR(selectedBranchForInfo.price)} / {selectedBranchForInfo.billingCycle}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div>
                  <span className="text-slate-500">Plan:</span>{' '}
                  <strong>{selectedBranchForInfo.planName}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Renewal Date:</span>{' '}
                  <strong>{selectedBranchForInfo.renewalDate}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Auto-Renewal:</span>{' '}
                  <strong>{selectedBranchForInfo.autoRenewal ? 'Enabled' : 'Disabled'}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Last Txn:</span>{' '}
                  <strong className="font-mono">{selectedBranchForInfo.lastTransactionId}</strong>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setSelectedBranchForInfo(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  switchBranch(selectedBranchForInfo.id);
                  setSelectedBranchForInfo(null);
                }}
              >
                Set as Active Branch
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

