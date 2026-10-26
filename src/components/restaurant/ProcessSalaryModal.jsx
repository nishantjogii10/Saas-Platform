import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  IndianRupee,
  CreditCard,
  Send,
  Building2,
  CheckCircle2,
  Sparkles,
  User,
  AlertCircle,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { FormInput } from '../common/FormInput';
import { formatINR } from '../../data/financeData';

export const ProcessSalaryModal = ({ isOpen, onClose, selectedStaff = null }) => {
  const {
    branchStaff,
    currentBranch,
    processSalaryPayment,
    STAFF_SALARY_PROFILES,
    addToast,
  } = useApp();

  const [staffId, setStaffId] = useState('');
  const [payPeriod, setPayPeriod] = useState('October 2026');
  const [baseSalary, setBaseSalary] = useState(35000);
  const [bonus, setBonus] = useState(0);
  const [deductions, setDeductions] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Direct Bank Transfer (IMPS/NEFT)');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Update defaults when modal opens or selectedStaff changes
  useEffect(() => {
    if (selectedStaff) {
      setStaffId(selectedStaff.id);
      const profile = STAFF_SALARY_PROFILES?.[selectedStaff.id];
      if (profile) {
        setBaseSalary(profile.baseSalary);
      } else {
        setBaseSalary(selectedStaff.role === 'inventory_manager' ? 45000 : 32000);
      }
    } else if (branchStaff.length > 0) {
      const firstKitchenStaff = branchStaff.find((s) => s.role === 'kitchen_staff') || branchStaff[0];
      setStaffId(firstKitchenStaff.id);
      const profile = STAFF_SALARY_PROFILES?.[firstKitchenStaff.id];
      setBaseSalary(profile?.baseSalary || 35000);
    }

    setReferenceNumber(`UTR-SAL-202610-${Math.floor(1000 + Math.random() * 9000)}`);
    setNotes('Monthly salary credited successfully. Thank you for your hard work!');
  }, [selectedStaff, isOpen, branchStaff, STAFF_SALARY_PROFILES]);

  const handleStaffChange = (e) => {
    const id = e.target.value;
    setStaffId(id);
    const profile = STAFF_SALARY_PROFILES?.[id];
    if (profile) {
      setBaseSalary(profile.baseSalary);
    } else {
      const s = branchStaff.find((st) => st.id === id);
      setBaseSalary(s?.role === 'inventory_manager' ? 45000 : 32000);
    }
  };

  const netPay = Math.max(0, Number(baseSalary) + Number(bonus) - Number(deductions));
  const currentStaffObj = branchStaff.find((s) => s.id === staffId);
  const profileInfo = STAFF_SALARY_PROFILES?.[staffId];

  const isStaffActive = (currentStaffObj?.status || 'Active').toLowerCase() === 'active';
  const isBankVerified = (currentStaffObj?.bankStatus || '').toLowerCase() === 'verified';
  const canDisburse = isStaffActive && isBankVerified;

  let disburseReason = '';
  if (!isStaffActive && !isBankVerified) {
    disburseReason = 'Cannot disburse: Staff is not Active and bank details are not Verified.';
  } else if (!isStaffActive) {
    disburseReason = `Cannot disburse: Staff status is "${currentStaffObj?.status || 'Invited'}" (must be Active).`;
  } else if (!isBankVerified) {
    disburseReason = `Cannot disburse: Bank status is "${currentStaffObj?.bankStatus || 'Not Added'}" (must be Verified).`;
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!staffId) {
      addToast('Please select a staff member to disburse salary.', 'error');
      return;
    }

    if (!canDisburse) {
      addToast(disburseReason, 'error');
      return;
    }

    processSalaryPayment({
      staffId,
      staffName: currentStaffObj?.name || 'Staff Member',
      staffRole: currentStaffObj?.roleLabel || currentStaffObj?.role || 'Staff',
      branchId: currentStaffObj?.branchId || currentBranch?.id,
      payPeriod,
      amount: netPay,
      baseSalary: Number(baseSalary),
      bonus: Number(bonus),
      deductions: Number(deductions),
      paymentMethod,
      referenceNumber,
      notes,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Disburse Staff Salary & Send Payment Notification"
      subtitle="Credit monthly remuneration and immediately push salary confirmation to employee portal."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Select Employee */}
        <div>
          <label className="font-semibold text-slate-700 block mb-1">
            Select Employee / Beneficiary <span className="text-rose-500">*</span>
          </label>
          <select
            value={staffId}
            onChange={handleStaffChange}
            className="w-full font-medium py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            required
          >
            {branchStaff.map((staff) => (
              <option key={staff.id} value={staff.id}>
                {staff.name} — {staff.roleLabel} ({staff.branchName || 'Pune Central'})
              </option>
            ))}
          </select>
        </div>

        {/* Bank Details Snippet */}
        {profileInfo && (
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-[11px] text-slate-600">
            <span>Bank Account: <strong>{profileInfo.bankAccount}</strong></span>
            <span>PAN: <strong className="font-mono">{profileInfo.pan}</strong></span>
          </div>
        )}

        {/* Pay Period & Payment Method */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Salary Pay Period <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={payPeriod}
              onChange={(e) => setPayPeriod(e.target.value)}
              placeholder="e.g. October 2026"
              className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Payment Method <span className="text-rose-500">*</span>
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="Direct Bank Transfer (IMPS/NEFT)">Direct Bank Transfer (IMPS/NEFT)</option>
              <option value="UPI AutoPay Settlement">UPI AutoPay Settlement</option>
              <option value="Company Cheque">Company Cheque</option>
              <option value="Direct Cash Voucher">Direct Cash Voucher</option>
            </select>
          </div>
        </div>

        {/* Earnings & Deductions Grid */}
        <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50/70 border border-slate-200 rounded-xl">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Basic Wage (₹)</label>
            <input
              type="number"
              min={0}
              value={baseSalary}
              onChange={(e) => setBaseSalary(Number(e.target.value))}
              className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Bonus / Allow. (₹)</label>
            <input
              type="number"
              min={0}
              value={bonus}
              onChange={(e) => setBonus(Number(e.target.value))}
              className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Deductions (₹)</label>
            <input
              type="number"
              min={0}
              value={deductions}
              onChange={(e) => setDeductions(Number(e.target.value))}
              className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {/* Net Pay Highlight Banner */}
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-950">
          <div>
            <span className="font-bold text-xs uppercase tracking-wider block">Net Take-Home Remuneration:</span>
            <span className="text-[11px] text-emerald-800/80">Will be dispatched and confirmed immediately</span>
          </div>
          <div className="text-xl font-black font-mono text-emerald-900">
            {formatINR(netPay)}
          </div>
        </div>

        {/* UTR / Bank Reference Number */}
        <div>
          <label className="font-semibold text-slate-700 block mb-1">
            Bank Transaction Reference / UTR Number
          </label>
          <input
            type="text"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            required
          />
        </div>

        {/* Remarks for Staff Member */}
        <div>
          <label className="font-semibold text-slate-700 block mb-1">
            Notification Remarks (Shown to Employee)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="brand" size="sm" icon={Send}>
            Confirm &amp; Dispatch Salary Notification
          </Button>
        </div>
      </form>
    </Modal>
  );
};

