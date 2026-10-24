import React from 'react';
import {
  Receipt,
  Download,
  Printer,
  CheckCircle2,
  Building2,
  Calendar,
  CreditCard,
  ShieldCheck,
  User,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { formatINR } from '../../data/financeData';

export const SalarySlipModal = ({ isOpen, onClose, payment }) => {
  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official Salary Credit Voucher & Pay Slip"
      subtitle={`Payment Receipt #${payment.referenceNumber} • Disbursed via StockMate Payroll`}
      size="lg"
    >
      <div className="space-y-5 print:p-0">
        {/* Header Voucher Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 to-teal-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🌿</span>
              <span className="text-base font-extrabold tracking-tight">
                {payment.branchName || 'Spice Garden Restaurant'}
              </span>
            </div>
            <p className="text-xs text-emerald-200 mt-0.5">
              Monthly Employee Remuneration Slip • {payment.payPeriod}
            </p>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Direct Bank Settlement
            </span>
            <div className="text-[11px] font-mono text-emerald-300/80 mt-1">
              UTR: {payment.referenceNumber}
            </div>
          </div>
        </div>

        {/* Employee & Pay Period Details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Employee Name</span>
            <span className="font-bold text-slate-900 text-xs mt-0.5 block">{payment.staffName}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Role / Title</span>
            <span className="font-semibold text-slate-800 text-xs mt-0.5 block">{payment.staffRole}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Pay Period</span>
            <span className="font-semibold text-slate-800 text-xs mt-0.5 block">{payment.payPeriod}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Disbursed Date</span>
            <span className="font-semibold text-slate-800 text-xs mt-0.5 block">
              {new Date(payment.processedAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Salary Breakdown Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Earnings / Allowances</th>
                <th className="py-2.5 px-4 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2.5 px-4 text-slate-800">Basic Monthly Wage</td>
                <td className="py-2.5 px-4 text-right font-mono font-medium">
                  {formatINR(payment.baseSalary || payment.amount)}
                </td>
              </tr>
              {Number(payment.bonus) > 0 && (
                <tr className="bg-emerald-50/30">
                  <td className="py-2.5 px-4 text-emerald-900 font-medium">
                    Culinary / Performance Festive Bonus
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-700">
                    +{formatINR(payment.bonus)}
                  </td>
                </tr>
              )}
              {Number(payment.deductions) > 0 && (
                <tr className="bg-rose-50/30">
                  <td className="py-2.5 px-4 text-rose-900 font-medium">
                    Professional Tax / Deductions
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-rose-700">
                    -{formatINR(payment.deductions)}
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-emerald-50/70 border-t-2 border-emerald-600 font-bold">
              <tr>
                <td className="py-3 px-4 text-emerald-950 text-sm">
                  Total Net Take-Home Salary Credited
                </td>
                <td className="py-3 px-4 text-right text-emerald-900 font-mono text-base">
                  {formatINR(payment.amount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Bank & Manager Audit Trail */}
        <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Payment Mechanism:</span>
            <span className="font-semibold text-slate-800">{payment.paymentMethod}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Bank Transaction UTR:</span>
            <span className="font-mono font-bold text-slate-900">{payment.referenceNumber}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Authorized &amp; Released By:</span>
            <span className="font-semibold text-slate-800">{payment.processedBy}</span>
          </div>
          {payment.notes && (
            <div className="pt-2 border-t border-slate-200/80 text-slate-600 text-[11px]">
              <strong>Manager Remarks:</strong> {payment.notes}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-[11px] text-slate-400">
            System authenticated by StockMate SaaS • Document is digitally generated
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Printer}
              onClick={handlePrint}
            >
              Print Slip
            </Button>
            <Button
              type="button"
              variant="brand"
              size="sm"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

