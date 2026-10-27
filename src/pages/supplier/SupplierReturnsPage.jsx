import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  CreditCard,
  Printer,
  Eye,
  Calendar,
  Sparkles,
  PackageX,
  Building2,
  FileText,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { formatINR } from '../../data/inventoryBillingData';

export const SupplierReturnsPage = () => {
  const navigate = useNavigate();
  const {
    supplierReturns,
    approveSupplierReturn,
    rejectSupplierReturn,
    currentUser,
    addToast,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReturn, setSelectedReturn] = useState(null);

  // Modals for actions
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [targetReturn, setTargetReturn] = useState(null);
  const [settlementMode, setSettlementMode] = useState('Credit Note');
  const [settlementAmount, setSettlementAmount] = useState('');
  const [rejectionReason, setRejectionReason] = useState('Stock condition outside agreement window');

  // Supplier filter
  const currentSupplierId = currentUser?.supplierId;
  const myReturns = useMemo(() => {
    return (supplierReturns || []).filter(
      (ret) => ret.supplierId === currentSupplierId || ret.supplierName === currentUser?.supplierName
    );
  }, [supplierReturns, currentSupplierId, currentUser]);

  const displayReturns = myReturns;

  const pendingCount = displayReturns.filter((r) => r.status === 'Pending').length;
  const approvedCount = displayReturns.filter(
    (r) => r.status === 'Approved' || r.status === 'Completed'
  ).length;
  const totalReturnLoss = displayReturns.reduce((sum, r) => sum + (r.totalLossAmount || 0), 0);
  const totalCreditIssued = displayReturns
    .filter((r) => r.status === 'Approved' || r.status === 'Completed')
    .reduce((sum, r) => sum + (r.creditNoteAmount || r.totalLossAmount || 0), 0);

  const filteredReturns = displayReturns.filter((ret) => {
    const matchSearch =
      ret.returnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ret.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ret.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ret.poNumber && ret.poNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchStatus = statusFilter === 'all' || ret.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleOpenApprove = (ret) => {
    setTargetReturn(ret);
    setSettlementMode(ret.settlementType || 'Credit Note');
    setSettlementAmount((ret.totalLossAmount || 0).toString());
    setApproveModalOpen(true);
  };

  const handleConfirmApprove = (e) => {
    e.preventDefault();
    if (!targetReturn) return;

    const amount = Number(settlementAmount) || targetReturn.totalLossAmount;
    approveSupplierReturn(targetReturn.id, settlementMode, amount);
    setApproveModalOpen(false);
    setTargetReturn(null);
  };

  const handleOpenReject = (ret) => {
    setTargetReturn(ret);
    setRejectionReason('Reported past allowed SLA return cutoff time.');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = (e) => {
    e.preventDefault();
    if (!targetReturn) return;

    rejectSupplierReturn(targetReturn.id, rejectionReason);
    setRejectModalOpen(false);
    setTargetReturn(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <Badge status="success" label="Approved" />;
      case 'Completed':
        return <Badge status="info" label="Credit Settled" />;
      case 'Rejected':
        return <Badge status="error" label="Rejected" />;
      default:
        return <Badge status="warning" label="Pending Review" />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supplier Returns & Credit Claim Approvals"
        subtitle={`Review restaurant damage claims and fresh bread return requests for ${currentUser?.supplierName || 'Partner'}`}
        breadcrumbs={[
          { label: 'Supplier Portal', href: '#/supplier' },
          { label: 'Returns & Credit Notes' },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={Printer}
            onClick={() => window.print()}
          >
            Print Returns
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pending Claims"
          value={pendingCount}
          subtext="Awaiting credit decision"
          icon={Clock}
          accentColor="amber"
        />
        <StatCard
          title="Approved Claims"
          value={approvedCount}
          subtext="Credit notes granted"
          icon={CheckCircle2}
          accentColor="emerald"
        />
        <StatCard
          title="Total Claimed Value"
          value={formatINR(totalReturnLoss)}
          subtext="Gross returned value"
          icon={AlertTriangle}
          accentColor="rose"
        />
        <StatCard
          title="Credit Notes Authorized"
          value={formatINR(totalCreditIssued)}
          subtext="Net concessions issued"
          icon={CreditCard}
          accentColor="indigo"
        />
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Filters */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search return #, restaurant, product, or PO..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-emerald-700"
            >
              <option value="all">All Claims</option>
              <option value="Pending">Pending Review</option>
              <option value="Approved">Approved</option>
              <option value="Completed">Credit Settled</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Claim # & Date</th>
                <th className="py-3 px-4">Client Restaurant</th>
                <th className="py-3 px-4">Product & Batch</th>
                <th className="py-3 px-4">Category & Reason</th>
                <th className="py-3 px-4 text-right">Return Qty</th>
                <th className="py-3 px-4 text-right">Loss Claimed</th>
                <th className="py-3 px-4">Status & Settlement</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    No return claims found.
                  </td>
                </tr>
              ) : (
                filteredReturns.map((ret) => (
                  <tr key={ret.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{ret.returnNumber}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {ret.requestDate}
                      </div>
                      <div className="text-[11px] font-mono text-emerald-800">{ret.poNumber}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{ret.restaurantName}</div>
                      <div className="text-[11px] text-slate-400">By: {ret.requestedBy}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{ret.productName}</div>
                      <div className="text-[11px] font-mono text-slate-500">Batch: {ret.batchId}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800 block">{ret.returnType}</span>
                      <div className="text-[11px] text-slate-500 truncate max-w-[170px]" title={ret.reason}>
                        {ret.reason}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {ret.returnQty} {ret.unit}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="font-bold text-rose-600">{formatINR(ret.totalLossAmount)}</div>
                      {ret.creditNoteAmount && (
                        <div className="text-[11px] text-emerald-600 font-medium">
                          Credit: {formatINR(ret.creditNoteAmount)}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="mb-1">{getStatusBadge(ret.status)}</div>
                      {ret.creditNoteId && (
                        <div className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded inline-block">
                          {ret.creditNoteId}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="xs"
                          icon={Eye}
                          onClick={() => setSelectedReturn(ret)}
                        >
                          View
                        </Button>

                        {ret.status === 'Pending' && (
                          <>
                            <Button
                              variant="success"
                              size="xs"
                              icon={CheckCircle2}
                              onClick={() => handleOpenApprove(ret)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="xs"
                              className="text-rose-600 border-rose-200"
                              onClick={() => handleOpenReject(ret)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Approve & Issue Credit Note */}
      {approveModalOpen && targetReturn && (
        <Modal
          isOpen={approveModalOpen}
          onClose={() => setApproveModalOpen(false)}
          title={`Approve Return & Issue Credit Note — ${targetReturn.returnNumber}`}
          subtitle={`Authorize claim settlement for ${targetReturn.restaurantName}`}
          size="md"
        >
          <form onSubmit={handleConfirmApprove} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Product:</span>
                <span className="font-bold text-slate-800">{targetReturn.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Return Qty:</span>
                <span className="font-bold text-slate-900">
                  {targetReturn.returnQty} {targetReturn.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Calculated Loss:</span>
                <span className="font-bold text-rose-600">{formatINR(targetReturn.totalLossAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Client Reason:</span>
                <span className="font-medium text-slate-700">{targetReturn.reason}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Settlement Mechanism *
              </label>
              <select
                value={settlementMode}
                onChange={(e) => setSettlementMode(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
              >
                <option value="Credit Note">Credit Note (Offset against next invoice)</option>
                <option value="Replacement Goods">Replacement Goods Delivery</option>
                <option value="Invoice Adjustment">Invoice Deduction</option>
                <option value="Direct Refund">Bank Refund</option>
              </select>
            </div>

            <FormInput
              label="Approved Credit Amount in INR (₹) *"
              type="number"
              value={settlementAmount}
              onChange={(e) => setSettlementAmount(e.target.value)}
              required
            />

            <p className="text-[11px] text-slate-500">
              Approving will automatically issue a formal Credit Note and apply deductions to the restaurant's purchase billing statement.
            </p>

            <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setApproveModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="brand"
                size="sm"
                icon={CheckCircle2}
              >
                Authorize Credit Note
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Reject Claim */}
      {rejectModalOpen && targetReturn && (
        <Modal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          title={`Reject Claim ${targetReturn.returnNumber}`}
          subtitle="Notify client of claim rejection"
          size="md"
        >
          <form onSubmit={handleConfirmReject} className="space-y-4 text-xs">
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-900">
              <p className="font-bold">Notice regarding rejection:</p>
              <p className="text-[11px] mt-0.5">
                The restaurant will be notified that this return request has been rejected without credit note issuance.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Rejection Reason *
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                required
              />
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRejectModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="danger"
                size="sm"
                icon={XCircle}
              >
                Confirm Rejection
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* View Details Modal */}
      {selectedReturn && (
        <Modal
          isOpen={!!selectedReturn}
          onClose={() => setSelectedReturn(null)}
          title={`Return Claim Details — ${selectedReturn.returnNumber}`}
          subtitle="Audit log and settlement record"
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
              <div>
                <span className="text-slate-400 block text-[11px]">Claim ID</span>
                <span className="font-bold text-slate-900">{selectedReturn.returnNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[11px]">Status</span>
                <div className="mt-0.5">{getStatusBadge(selectedReturn.status)}</div>
              </div>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Client:</span>
                <span className="font-bold text-slate-800">{selectedReturn.restaurantName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Product:</span>
                <span className="font-bold text-slate-800">{selectedReturn.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Batch Ref:</span>
                <span className="font-mono text-slate-700">{selectedReturn.batchId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Return Qty:</span>
                <span className="font-bold text-slate-900">
                  {selectedReturn.returnQty} {selectedReturn.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Loss:</span>
                <span className="font-bold text-rose-600">{formatINR(selectedReturn.totalLossAmount)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500">Reported Reason:</span>
                <span className="font-medium text-slate-700 text-right max-w-xs">{selectedReturn.reason}</span>
              </div>
              {selectedReturn.creditNoteId && (
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-500">Credit Note ID:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {selectedReturn.creditNoteId} ({formatINR(selectedReturn.creditNoteAmount)})
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedReturn(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

