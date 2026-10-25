import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileCheck,
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Filter,
  Check,
  X,
  CreditCard,
  Edit3,
  TrendingUp,
  Receipt,
  Download,
  IndianRupee,
  ShieldCheck,
  Send,
  Sliders,
  Sparkles,
  ArrowRight,
  Eye,
  Calendar,
  Phone,
  Mail,
  User,
  Zap,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { DataTable } from '../../components/common/DataTable';
import { formatINR } from '../../data/inventoryBillingData';
import { FEATURE_ADDONS } from '../../services/pricingEngine';

export const PlanReviewQueuePage = () => {
  const {
    customPlanRequests,
    reviewCustomPlanRequest,
    addToast,
  } = useApp();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending_review' | 'quoted' | 'approved' | 'rejected'

  // Modal Review State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState('quote'); // 'quote' | 'approve' | 'reject'
  const [quotePrice, setQuotePrice] = useState(0);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('Configuration exceeds current platform engineering scope');

  // Filter to ONLY requests requiring manual review (Path C)
  // Path A and Path B automated approvals bypass this queue as required
  const manualReviewRequests = useMemo(() => {
    return (customPlanRequests || []).filter(
      (r) => r.path === 'PATH_C' || r.requiresManualReview === true
    );
  }, [customPlanRequests]);

  // Summary Metrics
  const pendingCount = manualReviewRequests.filter((r) => r.status === 'pending_review').length;
  const quotedCount = manualReviewRequests.filter((r) => r.status === 'quoted').length;
  const approvedCount = manualReviewRequests.filter((r) => r.status === 'approved' || r.status === 'activated').length;
  const rejectedCount = manualReviewRequests.filter((r) => r.status === 'rejected').length;

  // Filtered dataset
  const filteredRequests = useMemo(() => {
    return manualReviewRequests.filter((r) => {
      const matchesSearch =
        r.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [manualReviewRequests, searchTerm, statusFilter]);

  // Open Review Drawer
  const handleOpenReview = (request, action = 'quote') => {
    setSelectedRequest(request);
    setReviewAction(action);
    setQuotePrice(request.proposedQuotation || request.systemCalculatedAmount);
    setAdminNotes(request.adminNotes || '');
    setIsReviewModalOpen(true);
  };

  // Submit Review Decision
  const handleSaveDecision = (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    reviewCustomPlanRequest(selectedRequest.id, reviewAction, {
      quotedAmount: Number(quotePrice),
      adminNotes,
      rejectionReason: reviewAction === 'reject' ? rejectionReason : null,
    });

    setIsReviewModalOpen(false);
  };

  // Table Columns
  const columns = [
    {
      header: 'Reference & Restaurant',
      accessor: 'id',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl shrink-0 border border-slate-200">
            {row.logo || '🏢'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">{row.restaurantName}</span>
              <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                {row.id}
              </span>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
              <span>{row.ownerName}</span>
              <span>•</span>
              <span>{row.ownerEmail}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Requested Scale & Specs',
      accessor: 'config',
      render: (row) => (
        <div className="text-xs space-y-1">
          <div className="font-bold text-slate-800">
            {row.config?.branches || 1} Branches • {row.config?.staffCount || 5} Staff Seats
          </div>
          <div className="text-[11px] text-slate-500 capitalize">
            Billing: {row.config?.billingCycle || 'Annual'} Cycle
          </div>
          {row.config?.selectedFeatureIds?.length > 0 && (
            <div className="flex gap-1 flex-wrap mt-1">
              {row.config.selectedFeatureIds.slice(0, 3).map((fId) => {
                const item = FEATURE_ADDONS.find((a) => a.id === fId);
                return (
                  <span
                    key={fId}
                    className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                      item?.requiresCustomDev
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item?.name?.split(' ')[0] || fId}
                  </span>
                );
              })}
              {row.config.selectedFeatureIds.length > 3 && (
                <span className="text-[10px] text-slate-400 font-semibold">
                  +{row.config.selectedFeatureIds.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Review Trigger Reason',
      accessor: 'reviewReasons',
      render: (row) => (
        <div className="max-w-xs text-xs space-y-1">
          {(row.reviewReasons || []).slice(0, 2).map((reason, i) => (
            <div
              key={i}
              className="p-1.5 rounded-lg bg-amber-50/80 border border-amber-200/90 text-[11px] text-amber-900 leading-tight"
            >
              ⚠️ {reason}
            </div>
          ))}
          {(row.reviewReasons || []).length > 2 && (
            <span className="text-[10px] text-slate-400 font-semibold block">
              +{row.reviewReasons.length - 2} additional policy triggers
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Pricing & Quotation',
      accessor: 'systemCalculatedAmount',
      sortable: true,
      render: (row) => (
        <div className="text-xs">
          <div className="text-slate-400 text-[11px]">Calculated:</div>
          <div className="font-mono font-bold text-slate-800">
            {formatINR(row.systemCalculatedAmount)}
          </div>
          {row.proposedQuotation ? (
            <div className="mt-1">
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 block w-fit">
                Quoted: {formatINR(row.proposedQuotation)}
              </span>
            </div>
          ) : (
            <span className="text-[10px] text-slate-400 italic">No quote issued</span>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (row) => {
        let badgeVariant = 'default';
        let label = row.status;

        if (row.status === 'pending_review') {
          badgeVariant = 'warning';
          label = 'Pending Review';
        } else if (row.status === 'quoted') {
          badgeVariant = 'brand';
          label = 'Quotation Sent';
        } else if (row.status === 'approved' || row.status === 'activated') {
          badgeVariant = 'success';
          label = row.status === 'activated' ? 'Active Subscription' : 'Approved';
        } else if (row.status === 'rejected') {
          badgeVariant = 'danger';
          label = 'Rejected';
        }

        return (
          <div className="space-y-1">
            <Badge variant={badgeVariant}>{label}</Badge>
            <div className="text-[10px] text-slate-400 font-mono">{row.requestDate?.split(' ')[0]}</div>
          </div>
        );
      },
    },
    {
      header: 'Action',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="xs"
            icon={Eye}
            onClick={() => handleOpenReview(row, row.status === 'pending_review' ? 'quote' : 'approve')}
          >
            Review
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Custom Plan Manual Review Queue"
        subtitle="Review exception-based custom subscription requests requiring software engineering scoping, volume discounts, or non-standard SLAs."
        badge={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Exception-Based Queue (Path C)
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Sliders}
              onClick={() => {
                setStatusFilter('pending_review');
                addToast('Filtered to pending requests.', 'info');
              }}
            >
              Needs Review ({pendingCount})
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Pending Manual Review"
          value={`${pendingCount} Requests`}
          subtitle="Exceptions Awaiting Action"
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="Quotations Issued"
          value={`${quotedCount} Quotes`}
          subtitle="Awaiting Customer Payment"
          icon={Send}
          variant="default"
        />
        <StatCard
          title="Approved Exceptions"
          value={`${approvedCount} Plans`}
          subtitle="Processed & Active"
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title="Automation Efficiency"
          value="94.8%"
          subtitle="Bypassed Super Admin (Paths A & B)"
          icon={Zap}
          variant="default"
        />
      </div>

      {/* Automation Architecture Note */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 flex items-start gap-3.5 text-xs text-indigo-950 shadow-xs">
        <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 font-black text-xs">
          ⚙️
        </div>
        <div>
          <strong className="font-bold text-indigo-900 block">
            Three-Path High-Scale Architecture Active:
          </strong>
          <span className="text-indigo-800 leading-relaxed block mt-0.5">
            Standard self-serve requests (<strong>Path A</strong>) and standard multi-unit enterprise requests (<strong>Path B</strong>) are approved automatically and never appear in this queue. Only requests requiring custom engineering, legacy POS connectors, or margin floor exceptions (<strong>Path C</strong>) are routed here.
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by restaurant, owner, email, or request ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs overflow-x-auto">
          {[
            { id: 'all', label: `All (${manualReviewRequests.length})` },
            { id: 'pending_review', label: `Pending (${pendingCount})` },
            { id: 'quoted', label: `Quoted (${quotedCount})` },
            { id: 'approved', label: `Approved (${approvedCount})` },
            { id: 'rejected', label: `Rejected (${rejectedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Table */}
      <DataTable
        columns={columns}
        data={filteredRequests}
        pageSize={6}
        emptyTitle="No Review Requests Found"
        emptyDescription="There are currently no custom plan requests matching your filter."
      />

      {/* Review & Quotation Modal */}
      {selectedRequest && (
        <Modal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          title={`Review Custom Plan Exception • ${selectedRequest.id}`}
          subtitle={`Requested by ${selectedRequest.restaurantName} (${selectedRequest.ownerName})`}
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleSaveDecision} className="space-y-5">
            {/* Customer & Scale Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Branches</span>
                <span className="font-bold text-slate-900 text-sm">{selectedRequest.config?.branches} Outlets</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Staff Seats</span>
                <span className="font-bold text-slate-900 text-sm">{selectedRequest.config?.staffCount} Users</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Billing Interval</span>
                <span className="font-bold text-slate-900 text-sm capitalize">{selectedRequest.config?.billingCycle}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">System Calculated</span>
                <span className="font-bold text-emerald-800 text-sm font-mono">
                  {formatINR(selectedRequest.systemCalculatedAmount)}
                </span>
              </div>
            </div>

            {/* Why was it routed to Super Admin? */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/90 text-xs space-y-2">
              <h4 className="font-bold text-amber-950 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span>Reasons Triggering Manual Review (Path C):</span>
              </h4>
              <ul className="list-disc pl-5 text-amber-900 space-y-1">
                {selectedRequest.reviewReasons?.map((reason, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {reason}
                  </li>
                ))}
              </ul>
            </div>

            {/* Custom Notes / Requirements from Customer */}
            {selectedRequest.config?.requestedCustomTerms && (
              <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-xs space-y-1">
                <span className="font-bold text-slate-700 block">Customer's Custom Requirements:</span>
                <p className="text-slate-600 italic leading-relaxed">
                  "{selectedRequest.config.requestedCustomTerms}"
                </p>
              </div>
            )}

            {/* Super Admin Decision Selector */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <label className="text-xs font-bold text-slate-800 block">
                Select Super Admin Action:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setReviewAction('quote')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                    reviewAction === 'quote'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <Send className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                  <span>Issue Quotation</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReviewAction('approve')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                    reviewAction === 'approve'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                  <span>Approve Request</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReviewAction('reject')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                    reviewAction === 'reject'
                      ? 'border-rose-600 bg-rose-50 text-rose-900 ring-2 ring-rose-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <XCircle className="w-4 h-4 mx-auto mb-1 text-rose-600" />
                  <span>Reject Request</span>
                </button>
              </div>
            </div>

            {/* Dynamic Inputs based on Action */}
            {reviewAction !== 'reject' ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Proposed Quotation Amount ({selectedRequest.config?.billingCycle} cycle, INR):
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">₹</span>
                    <input
                      type="number"
                      value={quotePrice}
                      onChange={(e) => setQuotePrice(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 text-sm font-mono font-bold rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-1">
                    System baseline: {formatINR(selectedRequest.systemCalculatedAmount)}
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Quotation Terms / Engineering Notes (Sent to Customer):
                  </label>
                  <textarea
                    rows={3}
                    placeholder="E.g., Approved customized rate including custom SAP ERP connector with 2-week implementation timeline..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-rose-800 block mb-1">
                    Reason for Rejection:
                  </label>
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Internal Governance Note:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Add internal explanation for audit compliance..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsReviewModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant={reviewAction === 'reject' ? 'danger' : 'brand'}
                size="sm"
                type="submit"
                icon={reviewAction === 'reject' ? X : Check}
              >
                {reviewAction === 'quote'
                  ? `Dispatch Quotation (${formatINR(quotePrice)})`
                  : reviewAction === 'approve'
                  ? 'Confirm Approval'
                  : 'Confirm Rejection'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

