import React from 'react';
import { CheckCircle2, Download, ExternalLink, Calendar, CreditCard, ShieldCheck, ArrowRight, Printer } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { formatINR } from '../../data/financeData';

export const PaymentConfirmationModal = ({
  isOpen,
  onClose,
  transaction,
  onViewInvoice,
}) => {
  if (!transaction) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="max-w-lg"
    >
      <div className="space-y-6 text-center">
        {/* Animated Success Badge */}
        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 border-4 border-emerald-50 text-emerald-600 flex items-center justify-center shadow-md animate-bounce-short">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Verified Gateway Response
          </span>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Payment Successful!
          </h3>
          <p className="text-sm font-medium text-emerald-700 mt-1">
            Your subscription has been activated.
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Transaction verified through secure banking rails and recorded in platform ledger.
          </p>
        </div>

        {/* Transaction Details Box */}
        <div className="bg-slate-50/80 rounded-2xl border border-slate-200/90 p-4 text-left space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
            <span className="text-xs font-semibold text-slate-500">Paid Amount</span>
            <span className="text-2xl font-black text-slate-900 font-mono">
              {formatINR(transaction.amount)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px] font-medium">Transaction ID</span>
              <span className="font-mono font-semibold text-slate-800 break-all select-all">
                {transaction.id}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px] font-medium">Subscription Plan</span>
              <span className="font-semibold text-indigo-600">
                {transaction.planName} ({transaction.billingCycle || 'Monthly'})
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px] font-medium">Payment Date</span>
              <span className="font-medium text-slate-700 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                {transaction.paymentDate || 'Today'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px] font-medium">Next Renewal Date</span>
              <span className="font-semibold text-emerald-700">
                {transaction.renewalDate}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="text-base">{transaction.logo || '🌿'}</span>
              <strong>{transaction.restaurantName}</strong> ({transaction.restaurantOwner})
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Ref: {transaction.gatewayRef || 'pay_verified'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          {onViewInvoice && (
            <Button
              variant="outline"
              size="sm"
              icon={Printer}
              onClick={() => {
                onClose();
                onViewInvoice(transaction);
              }}
              className="w-full sm:w-auto"
            >
              View Official Tax Invoice
            </Button>
          )}

          <Button
            variant="brand"
            size="sm"
            onClick={onClose}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
          >
            Done & Return to Dashboard
          </Button>
        </div>
      </div>
    </Modal>
  );
};

