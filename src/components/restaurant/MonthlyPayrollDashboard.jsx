import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardHeader } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { formatINR } from '../../data/financeData';
import { SalarySlipModal } from '../kitchen/SalarySlipModal';
import {
  IndianRupee,
  Calendar,
  CheckCircle2,
  Lock,
  Unlock,
  AlertTriangle,
  CreditCard,
  Send,
  Sliders,
  Sparkles,
  Eye,
  FileText,
  User,
  ShieldCheck,
  Building2,
  Clock,
  Printer,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Receipt,
  Download,
} from 'lucide-react';

export const MonthlyPayrollDashboard = () => {
  const {
    monthlyPayrollRuns,
    payrollConfig,
    updatePayrollConfig,
    calculateMonthlyPayroll,
    approveMonthlyPayroll,
    disburseMonthlyPayroll,
    reopenPayrollRun,
    branchStaff,
    currentBranch,
    salaryPayments,
    currentUser,
    addToast,
  } = useApp();

  const [selectedPeriod, setSelectedPeriod] = useState('October 2026');
  const [selectedStaffBreakdown, setSelectedStaffBreakdown] = useState(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [viewingSlipPayment, setViewingSlipPayment] = useState(null);

  // Temporary local config for modal
  const [localConfig, setLocalConfig] = useState({ ...payrollConfig });

  const PERIOD_OPTIONS = [
    { label: 'October 2026', key: '2026-10' },
    { label: 'September 2026', key: '2026-09' },
    { label: 'August 2026', key: '2026-08' },
  ];

  const activePeriodObj = PERIOD_OPTIONS.find((p) => p.label === selectedPeriod) || PERIOD_OPTIONS[0];

  // Active run for the selected period
  const activeRun = useMemo(() => {
    return (monthlyPayrollRuns || []).find((r) => r.monthKey === activePeriodObj.key) || null;
  }, [monthlyPayrollRuns, activePeriodObj.key]);

  // Handle calculate click
  const handleCalculate = () => {
    calculateMonthlyPayroll(selectedPeriod);
  };

  // Handle approve click
  const handleApprove = () => {
    if (!activeRun) {
      addToast('Please calculate payroll before approving.', 'error');
      return;
    }
    approveMonthlyPayroll(activeRun.monthKey);
  };

  // Handle batch disbursement
  const handleDisburseAll = () => {
    if (!activeRun) return;
    if (activeRun.status !== 'Approved' && activeRun.status !== 'Disbursed') {
      if (!window.confirm('This payroll period has not been marked as Approved. Do you want to approve and disburse now?')) {
        return;
      }
      approveMonthlyPayroll(activeRun.monthKey);
    }
    disburseMonthlyPayroll(activeRun.monthKey);
  };

  // Single staff disbursement
  const handleDisburseSingle = (staffId) => {
    if (!activeRun) return;
    disburseMonthlyPayroll(activeRun.monthKey, staffId);
  };

  // View Pay Slip
  const handleViewPaySlip = (entry) => {
    const existingPayment = (salaryPayments || []).find(
      (p) => p.staffId === entry.staffId && p.payPeriod === activeRun?.payPeriod
    );

    if (existingPayment) {
      setViewingSlipPayment(existingPayment);
    } else {
      // Mock temporary preview voucher
      setViewingSlipPayment({
        id: `prev-${entry.staffId}`,
        staffId: entry.staffId,
        staffName: entry.staffName,
        staffRole: entry.staffRole,
        branchName: currentBranch?.name || 'Spice Garden — Pune Central',
        payPeriod: activeRun?.payPeriod || selectedPeriod,
        amount: entry.netPayableSalary,
        baseSalary: entry.baseSalary,
        bonus: entry.overtimePay || 0,
        deductions: entry.deductions || 0,
        referenceNumber: entry.referenceNumber || `UTR-SAL-PREVIEW-${entry.staffId.slice(-4)}`,
        status: entry.status === 'Disbursed' ? 'Credited' : 'Calculated (Pending Disbursement)',
        processedAt: entry.disbursedAt || new Date().toISOString(),
      });
    }
  };

  // Save config
  const handleSaveConfig = (e) => {
    e.preventDefault();
    updatePayrollConfig(localConfig);
    setIsConfigModalOpen(false);
    // Auto re-calculate if run exists and is not locked
    if (activeRun && !activeRun.locked) {
      calculateMonthlyPayroll(selectedPeriod, localConfig);
    }
  };

  // Handle Reopen run
  const handleReopenRunConfirm = (e) => {
    e.preventDefault();
    if (!activeRun) return;
    reopenPayrollRun(activeRun.monthKey, reopenReason);
    setIsReopenModalOpen(false);
    setReopenReason('');
  };

  // Aggregated summary numbers
  const totalEmployees = activeRun?.entries?.length || branchStaff.length;
  const totalBaseSalary = activeRun?.totalBaseSalary || 0;
  const totalPayableSalary = activeRun?.totalPayable || 0;
  const disbursedEntriesCount = activeRun?.entries?.filter((e) => e.status === 'Disbursed').length || 0;

  const totalAttendedFullDays = activeRun?.entries?.reduce((s, e) => s + (e.attendedFullDays || 0), 0) || 0;
  const totalPaidHolidays = activeRun?.entries?.reduce((s, e) => s + (e.paidHolidayDays || 0), 0) || 0;
  const totalPaidLeaves = activeRun?.entries?.reduce((s, e) => s + (e.paidLeaveDays || 0), 0) || 0;
  const totalUnpaidLeaves = activeRun?.entries?.reduce((s, e) => s + (e.unpaidLeaveDays || 0), 0) || 0;
  const totalAbsences = activeRun?.entries?.reduce((s, e) => s + (e.absentDays || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Top Controls & Month Selector Header */}
      <div className="p-5 rounded-2xl bg-white border border-[#DCE5EF] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Monthly Attendance-Based Payroll Console
            </h3>
            {activeRun ? (
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  activeRun.status === 'Disbursed'
                    ? 'bg-green-50 text-[#15803D] border-green-200'
                    : activeRun.status === 'Approved'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-amber-50 text-[#D97706] border-amber-200'
                }`}
              >
                {activeRun.status === 'Disbursed'
                  ? 'All Disbursed'
                  : activeRun.status === 'Approved'
                  ? 'Approved & Locked'
                  : 'Calculated (Draft)'}
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-[#DCE5EF]">
                Uncalculated Period
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Automated payable days calculation connecting duty shifts, gazetted holidays, approved leaves, and verified bank records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period Dropdown */}
          <div className="flex items-center bg-[#F7F9FC] border border-[#DCE5EF] rounded-xl p-1 text-xs font-semibold">
            {PERIOD_OPTIONS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setSelectedPeriod(p.label)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedPeriod === p.label
                    ? 'bg-white text-slate-900 shadow-2xs font-bold border border-[#DCE5EF]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={Sliders}
            onClick={() => {
              setLocalConfig({ ...payrollConfig });
              setIsConfigModalOpen(true);
            }}
            title="Configure Payroll Divisor & Holiday Policies"
          >
            Policy Rules
          </Button>

          {activeRun?.locked ? (
            <Button
              variant="outline"
              size="sm"
              icon={Unlock}
              onClick={() => setIsReopenModalOpen(true)}
              title="Unlock period for adjustments"
            >
              Unlock Run
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              icon={Sparkles}
              onClick={handleCalculate}
              title="Auto-calculate from attendance records"
            >
              {activeRun ? 'Re-Calculate' : 'Auto-Calculate'}
            </Button>
          )}

          {activeRun && activeRun.status === 'Calculated' && (
            <Button
              variant="primary"
              size="sm"
              icon={Lock}
              onClick={handleApprove}
            >
              Approve Payroll
            </Button>
          )}

          {activeRun && activeRun.status !== 'Disbursed' && (
            <Button
              variant="primary"
              size="sm"
              icon={CreditCard}
              onClick={handleDisburseAll}
            >
              Disburse All ({activeRun.entries.filter((e) => e.status !== 'Disbursed').length})
            </Button>
          )}
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#DCE5EF] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Staff</span>
            <span className="p-1.5 rounded-lg bg-[#E6F3F0] text-[#075E4B]">
              <User className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{totalEmployees}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Active on branch roster</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#DCE5EF] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Gross Base Pay</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
              <IndianRupee className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono">
            {formatINR(totalBaseSalary)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Sum of monthly contracts</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#DCE5EF] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Payable Salary</span>
            <span className="p-1.5 rounded-lg bg-[#E6F3F0] text-[#075E4B]">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-[#075E4B] font-mono">
            {formatINR(totalPayableSalary)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Attendance &amp; holiday adjusted</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#DCE5EF] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Paid Days Tally</span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {totalAttendedFullDays + totalPaidHolidays + totalPaidLeaves}d
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {totalAttendedFullDays} Attended • {totalPaidHolidays} Hol • {totalPaidLeaves} Leave
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#DCE5EF] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Disbursement</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
              <Receipt className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {disbursedEntriesCount} / {totalEmployees}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {totalUnpaidLeaves + totalAbsences > 0 ? `${totalUnpaidLeaves + totalAbsences} unpaid days deducted` : 'All records in order'}
          </div>
        </div>
      </div>

      {/* Main Staff Salary Table */}
      <div className="bg-white rounded-2xl border border-[#DCE5EF] shadow-xs overflow-hidden">
        <div className="p-4 bg-[#F7F9FC] border-b border-[#DCE5EF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">
              Staff Salary Calculation Ledger — {selectedPeriod}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Configured Divisor: {activeRun?.divisorUsed || payrollConfig.payrollDivisor} days • Formula: Daily Rate × Payable Days + Overtime
            </p>
          </div>
          {activeRun && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">
                Calculated on: {new Date(activeRun.calculatedAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#F7F9FC] border-b border-[#DCE5EF] text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4 text-right">Base Salary</th>
                <th className="py-3 px-4 text-center">Attended Days</th>
                <th className="py-3 px-4 text-center">Paid Leave</th>
                <th className="py-3 px-4 text-center">Unpaid Leave</th>
                <th className="py-3 px-4 text-center">Paid Holidays</th>
                <th className="py-3 px-4 text-center">Payable Days</th>
                <th className="py-3 px-4 text-right">Overtime</th>
                <th className="py-3 px-4 text-right">Final Salary</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE5EF]">
              {!activeRun || activeRun.entries.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-slate-400">
                    <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700 text-sm">
                      No salary calculation generated for {selectedPeriod}.
                    </p>
                    <p className="text-xs text-slate-500 mt-1 mb-3">
                      Click the button below to auto-calculate salaries based on attendance and holidays.
                    </p>
                    <Button variant="primary" size="sm" icon={Sparkles} onClick={handleCalculate}>
                      Generate Attendance Salary Calculation
                    </Button>
                  </td>
                </tr>
              ) : (
                activeRun.entries.map((entry) => (
                  <tr key={entry.staffId} className="hover:bg-[#F7F9FC]/80 transition-colors">
                    {/* Employee */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={entry.avatar || 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=150'}
                          alt={entry.staffName}
                          className="w-8 h-8 rounded-full object-cover border border-[#DCE5EF]"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{entry.staffName}</span>
                          <span className="text-[10px] text-slate-500">
                            {entry.staffRole} • {entry.department}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Base Salary */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800 whitespace-nowrap">
                      {formatINR(entry.baseSalary)}
                    </td>

                    {/* Attended Days */}
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-800 whitespace-nowrap">
                      {entry.attendedDaysEquivalent}d
                    </td>

                    {/* Paid Leave */}
                    <td className="py-3.5 px-4 text-center text-slate-600 whitespace-nowrap">
                      {entry.paidLeaveDays > 0 ? (
                        <span className="text-[#15803D] font-bold">{entry.paidLeaveDays}d</span>
                      ) : (
                        '—'
                      )}
                    </td>

                    {/* Unpaid Leave */}
                    <td className="py-3.5 px-4 text-center text-slate-600 whitespace-nowrap">
                      {entry.unpaidLeaveDays > 0 ? (
                        <span className="text-[#DC2626] font-bold">{entry.unpaidLeaveDays}d</span>
                      ) : (
                        '0'
                      )}
                    </td>

                    {/* Paid Holidays */}
                    <td className="py-3.5 px-4 text-center text-slate-600 whitespace-nowrap">
                      {entry.paidHolidayDays > 0 ? (
                        <span className="text-[#075E4B] font-bold">{entry.paidHolidayDays}d</span>
                      ) : (
                        '—'
                      )}
                    </td>

                    {/* Payable Days */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full font-bold bg-[#E6F3F0] text-[#075E4B] border border-[#075E4B]/20">
                        {entry.payableDays} / {entry.divisor}d
                      </span>
                    </td>

                    {/* Overtime */}
                    <td className="py-3.5 px-4 text-right font-mono text-slate-700 whitespace-nowrap">
                      {entry.overtimePay > 0 ? (
                        <span className="text-[#15803D] font-semibold">+{formatINR(entry.overtimePay)}</span>
                      ) : (
                        '₹0'
                      )}
                    </td>

                    {/* Final Salary */}
                    <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900 text-sm whitespace-nowrap">
                      {formatINR(entry.netPayableSalary)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          entry.status === 'Disbursed'
                            ? 'bg-green-50 text-[#15803D] border-green-200'
                            : entry.status === 'Approved'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-[#D97706] border-amber-200'
                        }`}
                      >
                        {entry.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="xs"
                          icon={Eye}
                          onClick={() => setSelectedStaffBreakdown(entry)}
                          title="View step-by-step formula and day tally"
                        >
                          Breakdown
                        </Button>

                        {entry.status !== 'Disbursed' ? (
                          <Button
                            variant="primary"
                            size="xs"
                            icon={IndianRupee}
                            onClick={() => handleDisburseSingle(entry.staffId)}
                            title="Disburse Remuneration"
                          >
                            Disburse
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="xs"
                            icon={Receipt}
                            onClick={() => handleViewPaySlip(entry)}
                            title="View Official Salary Voucher"
                            className="text-[#075E4B]"
                          >
                            Slip
                          </Button>
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

      {/* Employee Salary Breakdown Drawer / Modal */}
      {selectedStaffBreakdown && (
        <Modal
          isOpen={!!selectedStaffBreakdown}
          onClose={() => setSelectedStaffBreakdown(null)}
          title={`Salary Calculation Breakdown: ${selectedStaffBreakdown.staffName}`}
          subtitle={`${selectedStaffBreakdown.staffRole} • ${selectedPeriod} • Divisor: ${selectedStaffBreakdown.divisor} Days`}
          size="lg"
        >
          <div className="space-y-4">
            {/* Employee Profile & Bank Badge */}
            <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#DCE5EF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={selectedStaffBreakdown.avatar || 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=150'}
                  alt={selectedStaffBreakdown.staffName}
                  className="w-10 h-10 rounded-full object-cover border border-[#DCE5EF]"
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{selectedStaffBreakdown.staffName}</h4>
                  <p className="text-slate-500">
                    Designation: <span className="font-semibold text-slate-700">{selectedStaffBreakdown.staffRole}</span> • Dept: <span className="font-semibold text-slate-700">{selectedStaffBreakdown.department}</span>
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-[#15803D] border border-green-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Bank Verified: {selectedStaffBreakdown.bankAccount}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  IFSC: {selectedStaffBreakdown.ifsc || 'HDFC0001244'} • PAN: {selectedStaffBreakdown.pan || 'ABCPA1234D'}
                </div>
              </div>
            </div>

            {/* Attendance Days Composition Breakdown */}
            <div className="border border-[#DCE5EF] rounded-xl p-4 bg-white space-y-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                1. Monthly Attendance &amp; Leave Composition ({selectedStaffBreakdown.daysInMonth} Calendar Days)
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-[#F7F9FC] border border-[#DCE5EF]">
                  <span className="text-slate-500 block text-[10px] font-semibold">Attended Days</span>
                  <span className="text-base font-bold text-slate-900 mt-0.5 block">
                    {selectedStaffBreakdown.attendedDaysEquivalent} days
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {selectedStaffBreakdown.attendedFullDays} full, {selectedStaffBreakdown.attendedHalfDays} half
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-green-50/70 border border-green-200">
                  <span className="text-[#15803D] block text-[10px] font-semibold">Paid Holidays</span>
                  <span className="text-base font-bold text-[#15803D] mt-0.5 block">
                    {selectedStaffBreakdown.paidHolidayDays} days
                  </span>
                  <span className="text-[10px] text-slate-500">Official gazetted days</span>
                </div>

                <div className="p-2.5 rounded-lg bg-teal-50/70 border border-teal-200">
                  <span className="text-[#087F8C] block text-[10px] font-semibold">Approved Paid Leave</span>
                  <span className="text-base font-bold text-[#087F8C] mt-0.5 block">
                    {selectedStaffBreakdown.paidLeaveDays} days
                  </span>
                  <span className="text-[10px] text-slate-500">Casual / Sick / Earned</span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#F7F9FC] border border-[#DCE5EF]">
                  <span className="text-slate-500 block text-[10px] font-semibold">Paid Weekly Offs</span>
                  <span className="text-base font-bold text-slate-900 mt-0.5 block">
                    {selectedStaffBreakdown.weeklyOffDays} days
                  </span>
                  <span className="text-[10px] text-slate-400">Scheduled Sundays</span>
                </div>
              </div>

              <div className="p-3 bg-[#E6F3F0] rounded-xl border border-[#075E4B]/20 text-xs flex items-center justify-between">
                <span className="font-semibold text-emerald-950">
                  Total Eligible Payable Days:
                </span>
                <span className="font-black text-sm text-[#075E4B]">
                  {selectedStaffBreakdown.payableDays} / {selectedStaffBreakdown.divisor} Days
                </span>
              </div>
            </div>

            {/* Salary Calculation Formula Box */}
            <div className="border border-[#DCE5EF] rounded-xl p-4 bg-white space-y-2 text-xs">
              <span className="font-bold text-slate-800 uppercase tracking-wider block text-[11px]">
                2. Salary Calculation Formula &amp; Math
              </span>

              <div className="p-3 rounded-lg bg-slate-50 font-mono text-xs space-y-1.5 border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-600">Monthly Contract Base Salary:</span>
                  <span className="font-bold text-slate-900">{formatINR(selectedStaffBreakdown.baseSalary)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Configured Divisor:</span>
                  <span className="text-slate-900">{selectedStaffBreakdown.divisor} Days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Calculated Daily Rate (Base ÷ Divisor):</span>
                  <span className="font-bold text-slate-900">{formatINR(selectedStaffBreakdown.dailyRate)} / day</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-600">
                    Attendance Pay ({selectedStaffBreakdown.payableDays}d × {formatINR(selectedStaffBreakdown.dailyRate)}):
                  </span>
                  <span className="font-bold text-slate-900">
                    {formatINR(Math.round(selectedStaffBreakdown.dailyRate * selectedStaffBreakdown.payableDays))}
                  </span>
                </div>
                {selectedStaffBreakdown.overtimeHours > 0 && (
                  <div className="flex justify-between text-[#15803D]">
                    <span>Overtime ({selectedStaffBreakdown.overtimeHours} hrs @ ₹150/hr):</span>
                    <span className="font-bold">+{formatINR(selectedStaffBreakdown.overtimePay)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1.5 border-t border-slate-300 font-bold text-slate-900 text-sm">
                  <span>Net Payable Remuneration:</span>
                  <span className="text-[#075E4B]">{formatINR(selectedStaffBreakdown.netPayableSalary)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCE5EF]">
              <Button variant="outline" size="sm" onClick={() => setSelectedStaffBreakdown(null)}>
                Close
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={Printer}
                onClick={() => handleViewPaySlip(selectedStaffBreakdown)}
              >
                Print Salary Voucher
              </Button>
              {selectedStaffBreakdown.status !== 'Disbursed' && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={CreditCard}
                  onClick={() => {
                    handleDisburseSingle(selectedStaffBreakdown.staffId);
                    setSelectedStaffBreakdown(null);
                  }}
                >
                  Disburse ₹{selectedStaffBreakdown.netPayableSalary.toLocaleString('en-IN')}
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Policy Rules Modal */}
      {isConfigModalOpen && (
        <Modal
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
          title="Restaurant Payroll Calculation Policy"
          subtitle="Configure default divisor, overtime rates, and payable day inclusion rules for attendance calculations."
          size="md"
        >
          <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Monthly Payroll Divisor *
              </label>
              <select
                value={localConfig.payrollDivisor}
                onChange={(e) =>
                  setLocalConfig({
                    ...localConfig,
                    payrollDivisor: e.target.value === 'actual_days' ? 'actual_days' : Number(e.target.value),
                  })
                }
                className="w-full py-2.5 px-3 rounded-xl border border-[#DCE5EF] bg-white text-slate-800"
              >
                <option value={30}>30 Standard Days (Commercial standard)</option>
                <option value={26}>26 Working Days (Excluding 4 Sundays)</option>
                <option value="actual_days">Actual Calendar Days in Month (e.g. 31 in Oct)</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Daily salary rate will be calculated as: Base Salary ÷ Divisor.
              </p>
            </div>

            <div className="space-y-2 p-3.5 bg-[#F7F9FC] rounded-xl border border-[#DCE5EF]">
              <span className="font-bold text-slate-800 block">Payable Days Eligibility Rules:</span>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.countPaidHolidays}
                  onChange={(e) => setLocalConfig({ ...localConfig, countPaidHolidays: e.target.checked })}
                  className="rounded text-[#075E4B]"
                />
                <span>Include Paid Gazetted Holidays in Payable Days</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.countWeeklyOffs}
                  onChange={(e) => setLocalConfig({ ...localConfig, countWeeklyOffs: e.target.checked })}
                  className="rounded text-[#075E4B]"
                />
                <span>Include Scheduled Weekly Offs (Sundays) in Payable Days</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.countApprovedPaidLeave}
                  onChange={(e) => setLocalConfig({ ...localConfig, countApprovedPaidLeave: e.target.checked })}
                  className="rounded text-[#075E4B]"
                />
                <span>Include Approved Paid Leave (Casual/Sick/Earned)</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Half-Day Pay Factor
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={localConfig.halfDayPayRate}
                  onChange={(e) => setLocalConfig({ ...localConfig, halfDayPayRate: Number(e.target.value) })}
                  className="w-full py-2 px-3 rounded-xl border border-[#DCE5EF] bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Overtime Hourly Rate (₹/hr)
                </label>
                <input
                  type="number"
                  min="0"
                  value={localConfig.overtimeHourlyRate}
                  onChange={(e) => setLocalConfig({ ...localConfig, overtimeHourlyRate: Number(e.target.value) })}
                  className="w-full py-2 px-3 rounded-xl border border-[#DCE5EF] bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCE5EF]">
              <Button variant="outline" size="sm" onClick={() => setIsConfigModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save &amp; Apply Policy
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Unlock / Reopen Run Modal */}
      {isReopenModalOpen && (
        <Modal
          isOpen={isReopenModalOpen}
          onClose={() => setIsReopenModalOpen(false)}
          title="Unlock Approved Payroll Run"
          subtitle="Unlocking permits modifying attendance entries or recalculating salaries. Please provide an audit reason."
          size="md"
        >
          <form onSubmit={handleReopenRunConfirm} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Audit Reason for Reopening *
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Correcting missing shift clock-in for Chef Anita Rao on Oct 14th..."
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#DCE5EF] bg-white text-slate-800"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCE5EF]">
              <Button variant="outline" size="sm" onClick={() => setIsReopenModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Unlock Run for Adjustments
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Salary Slip Inspection Modal */}
      {viewingSlipPayment && (
        <SalarySlipModal
          isOpen={!!viewingSlipPayment}
          onClose={() => setViewingSlipPayment(null)}
          payment={viewingSlipPayment}
        />
      )}
    </div>
  );
};
