import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  ArrowLeftRight,
  UserCheck,
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Search,
  Filter,
  Check,
  X,
  History,
  FileText,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { FormInput } from '../../components/common/FormInput';
import { BRANCH_PLANS_CONFIG } from '../../data/branchData';

export const StaffTransfersPage = () => {
  const navigate = useNavigate();
  const {
    branches,
    branchStaff,
    staffTransfers,
    requestStaffTransfer,
    approveStaffTransfer,
    rejectStaffTransfer,
    addToast,
  } = useApp();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusTab, setStatusTab] = useState('all'); // 'all' | 'Pending' | 'Approved' | 'Rejected'

  // Modals
  const [isNewTransferOpen, setIsNewTransferOpen] = useState(false);
  const [selectedTransferForAudit, setSelectedTransferForAudit] = useState(null);
  const [rejectingTransfer, setRejectingTransfer] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // New Transfer Form State (Steps 1 to 5)
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [toBranchId, setToBranchId] = useState('');
  const [transferReason, setTransferReason] = useState('');

  // Selected staff object & their current branch
  const selectedStaff = branchStaff.find((s) => s.id === selectedStaffId);
  const currentBranch = branches.find((b) => b.id === selectedStaff?.branchId);

  // Destination branch details & quota preview
  const destinationBranch = branches.find((b) => b.id === toBranchId);
  const destPlanConfig = destinationBranch
    ? BRANCH_PLANS_CONFIG[destinationBranch.planId] || BRANCH_PLANS_CONFIG['plan-starter']
    : null;
  const destCurrentStaffCount = destinationBranch
    ? branchStaff.filter((s) => s.branchId === destinationBranch.id).length
    : 0;
  const isDestFull =
    destPlanConfig && destPlanConfig.maxStaff !== 999 && destCurrentStaffCount >= destPlanConfig.maxStaff;

  // KPI Calculations
  const totalTransfers = staffTransfers.length;
  const pendingCount = staffTransfers.filter((t) => t.status === 'Pending').length;
  const approvedCount = staffTransfers.filter((t) => t.status === 'Approved').length;
  const rejectedCount = staffTransfers.filter((t) => t.status === 'Rejected').length;

  // Filtered Transfers
  const filteredTransfers = useMemo(() => {
    return staffTransfers.filter((t) => {
      const matchesSearch =
        t.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.fromBranchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.toBranchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusTab === 'all' || t.status === statusTab;

      return matchesSearch && matchesStatus;
    });
  }, [staffTransfers, searchTerm, statusTab]);

  // Handle New Transfer Submit
  const handleNewTransferSubmit = (e) => {
    e.preventDefault();
    if (!selectedStaffId || !toBranchId || !transferReason.trim()) {
      addToast('Please select staff member, destination branch, and enter transfer reason', 'error');
      return;
    }

    if (selectedStaff?.branchId === toBranchId) {
      addToast('Destination branch cannot be the same as current branch', 'error');
      return;
    }

    // Call context method
    requestStaffTransfer({
      employeeId: selectedStaffId,
      fromBranchId: selectedStaff.branchId,
      toBranchId: toBranchId,
      reason: transferReason.trim(),
    });

    setIsNewTransferOpen(false);
    setSelectedStaffId('');
    setToBranchId('');
    setTransferReason('');
  };

  // Handle Approve
  const handleApprove = (transferId) => {
    approveStaffTransfer(transferId);
  };

  // Handle Reject Submit
  const handleRejectConfirm = (e) => {
    e.preventDefault();
    if (!rejectingTransfer) return;

    rejectStaffTransfer(rejectingTransfer.id, rejectionReason || 'Operational constraints');
    setRejectingTransfer(null);
    setRejectionReason('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Staff Transfer Workflow"
        subtitle="Submit cross-branch employee reassignments, validate destination branch plan limits, and log authorization history."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Building2}
              onClick={() => navigate('/branch-staff')}
            >
              Branch Staff Roster
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => {
                setSelectedStaffId(branchStaff[0]?.id || '');
                setIsNewTransferOpen(true);
              }}
            >
              Request Staff Transfer
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Transfer Requests"
          value={totalTransfers}
          subtitle="All Time Logs"
          icon={ArrowLeftRight}
          variant="default"
        />
        <StatCard
          title="Pending Authorization"
          value={pendingCount}
          subtitle={pendingCount > 0 ? "Requires Owner Decision" : "Zero Pending"}
          icon={Clock}
          variant={pendingCount > 0 ? "warning" : "default"}
        />
        <StatCard
          title="Approved Transfers"
          value={approvedCount}
          subtitle="Reassigned Successfully"
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title="Rejected / Cancelled"
          value={rejectedCount}
          subtitle="Quota or Schedule Mismatch"
          icon={XCircle}
          variant="default"
        />
      </div>

      {/* Filter Tabs & Search */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Transfers', count: totalTransfers },
              { id: 'Pending', label: 'Pending', count: pendingCount, highlight: pendingCount > 0 },
              { id: 'Approved', label: 'Approved', count: approvedCount },
              { id: 'Rejected', label: 'Rejected', count: rejectedCount },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  statusTab === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    statusTab === tab.id
                      ? 'bg-white/20 text-white'
                      : tab.highlight
                      ? 'bg-amber-200 text-amber-900 font-bold'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by staff, branch, or request ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Transfers Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Request ID</th>
                <th className="py-3.5 px-4">Staff Member</th>
                <th className="py-3.5 px-4">Source &rarr; Destination Branch</th>
                <th className="py-3.5 px-4">Reason / Notes</th>
                <th className="py-3.5 px-4">Requested By</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Workflow Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-xs text-slate-500">
                    No staff transfer requests match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredTransfers.map((req) => {
                  const isPending = req.status === 'Pending';
                  const isApproved = req.status === 'Approved';
                  const isRejected = req.status === 'Rejected';

                  return (
                    <tr
                      key={req.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isPending ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* Request ID */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {req.id}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1">{req.requestDate}</div>
                      </td>

                      {/* Staff Details */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={req.employeeAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                            alt={req.employeeName}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-900">{req.employeeName}</div>
                            <div className="text-[10px] text-slate-500">{req.roleLabel}</div>
                          </div>
                        </div>
                      </td>

                      {/* Branch Reassignment Flow */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                            {req.fromBranchName?.replace('Spice Garden — ', '')}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 text-[11px]">
                            {req.toBranchName?.replace('Spice Garden — ', '')}
                          </span>
                        </div>
                      </td>

                      {/* Reason */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-slate-800 line-clamp-2">{req.reason}</p>
                        {req.comments && (
                          <span className="text-[10px] text-slate-500 italic block mt-0.5">
                            Note: {req.comments}
                          </span>
                        )}
                      </td>

                      {/* Requested By */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-medium">{req.requestedBy}</div>
                        {req.approvedBy && (
                          <div className="text-[10px] text-emerald-700 mt-0.5 font-medium">
                            Approved by: {req.approvedBy}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isApproved
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : isPending
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {isApproved && <CheckCircle2 className="w-3 h-3" />}
                          {isPending && <Clock className="w-3 h-3" />}
                          {isRejected && <XCircle className="w-3 h-3" />}
                          <span>{req.status}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending ? (
                            <>
                              <Button
                                variant="primary"
                                size="xs"
                                onClick={() => handleApprove(req.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                              >
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="xs"
                                onClick={() => setRejectingTransfer(req)}
                                className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs"
                              >
                                Reject
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => setSelectedTransferForAudit(req)}
                              className="text-slate-600 hover:bg-slate-100 text-xs"
                            >
                              <History className="w-3.5 h-3.5 mr-1" />
                              Audit Log
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Transfer Request Modal (10-Step Workflow) */}
      <Modal
        isOpen={isNewTransferOpen}
        onClose={() => setIsNewTransferOpen(false)}
        title="Initiate Staff Branch Transfer"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleNewTransferSubmit} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <span className="font-bold text-slate-800 uppercase tracking-wider block text-[10px]">
              Transfer Approval Policy
            </span>
            <p>
              Once submitted, this request enters <strong>Pending</strong> state. Upon Owner approval, the staff member is automatically reassigned and quotas are updated.
            </p>
          </div>

          {/* Step 1: Select Staff Member */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              1. Select Employee to Transfer *
            </label>
            <select
              value={selectedStaffId}
              onChange={(e) => {
                setSelectedStaffId(e.target.value);
                setToBranchId('');
              }}
              className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
            >
              <option value="">Choose employee from roster...</option>
              {branchStaff.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.name} ({staff.roleLabel}) — Currently at {staff.branchName?.replace('Spice Garden — ', '')}
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Current Branch (Readonly) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              2. Current Origin Branch (Auto-detected)
            </label>
            <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 flex items-center justify-between">
              <span>{currentBranch?.name || 'Please select an employee above'}</span>
              <span className="font-mono text-[10px] text-slate-500">{currentBranch?.code}</span>
            </div>
          </div>

          {/* Step 3: Destination Branch */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              3. Target Destination Branch *
            </label>
            <select
              value={toBranchId}
              onChange={(e) => setToBranchId(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
              disabled={!selectedStaffId}
            >
              <option value="">Select destination outlet...</option>
              {branches
                .filter((b) => b.id !== currentBranch?.id)
                .map((b) => {
                  const staffCount = branchStaff.filter((s) => s.branchId === b.id).length;
                  const planCfg = BRANCH_PLANS_CONFIG[b.planId] || BRANCH_PLANS_CONFIG['plan-starter'];
                  return (
                    <option key={b.id} value={b.id}>
                      {b.name} ({staffCount}/{planCfg.maxStaff} staff - {b.planName} Plan)
                    </option>
                  );
                })}
            </select>
          </div>

          {/* Destination Quota Preview */}
          {destinationBranch && destPlanConfig && (
            <div
              className={`p-3 rounded-xl border text-xs space-y-1 ${
                isDestFull
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span>Destination Quota Check:</span>
                <span>
                  {destCurrentStaffCount} / {destPlanConfig.maxStaff === 999 ? 'Unlimited' : `${destPlanConfig.maxStaff} Max Staff`}
                </span>
              </div>
              <p className="text-[11px]">
                {isDestFull
                  ? 'Warning: Destination branch has reached its plan limit. Upgrading its plan will be required to approve.'
                  : `Plan: ${destinationBranch.planName}. Destination capacity verified.`}
              </p>
            </div>
          )}

          {/* Step 4: Transfer Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              4. Reason for Transfer Request *
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Urgent weekend chef support for peak IT park lunch rush, promotion to Head Chef, kitchen reorganization..."
              value={transferReason}
              onChange={(e) => setTransferReason(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" size="sm" onClick={() => setIsNewTransferOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Submit Transfer Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* Rejection Modal */}
      {rejectingTransfer && (
        <Modal
          isOpen={!!rejectingTransfer}
          onClose={() => setRejectingTransfer(null)}
          title={`Reject Transfer Request: ${rejectingTransfer.id}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleRejectConfirm} className="space-y-4">
            <p className="text-xs text-slate-600">
              Please state why the transfer of <strong>{rejectingTransfer.employeeName}</strong> to{' '}
              <strong>{rejectingTransfer.toBranchName}</strong> is being rejected.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Rejection Reason
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Staff quota full at destination, critical weekend coverage needed at origin..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white text-slate-800"
                required
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setRejectingTransfer(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" type="submit">
                Confirm Rejection
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Audit Log Modal */}
      {selectedTransferForAudit && (
        <Modal
          isOpen={!!selectedTransferForAudit}
          onClose={() => setSelectedTransferForAudit(null)}
          title={`Workflow Audit Log: ${selectedTransferForAudit.id}`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{selectedTransferForAudit.employeeName}</span>
                <Badge status={selectedTransferForAudit.status === 'Approved' ? 'active' : 'inactive'} size="xs" />
              </div>
              <div className="text-slate-500">
                {selectedTransferForAudit.fromBranchName} &rarr; {selectedTransferForAudit.toBranchName}
              </div>
              <div className="text-slate-700 pt-1">
                <strong>Reason:</strong> {selectedTransferForAudit.reason}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Chronological Audit History
              </h5>
              <div className="relative border-l border-slate-200 ml-3 space-y-4 pl-4 py-1">
                {selectedTransferForAudit.history?.map((step, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white" />
                    <p className="font-semibold text-slate-900">{step.action}</p>
                    <p className="text-[11px] text-slate-500">By: {step.by}</p>
                    <span className="text-[10px] text-slate-400 font-mono">{step.date}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <Button variant="primary" size="sm" onClick={() => setSelectedTransferForAudit(null)}>
                Close Audit
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

