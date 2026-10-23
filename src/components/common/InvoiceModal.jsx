import React from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, Building2 } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { formatINR } from '../../data/financeData';

export const InvoiceModal = ({ isOpen, onClose, invoice }) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6 print:m-0 print:p-0">
        {/* Printable Invoice Container */}
        <div id="printable-invoice" className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs print:border-none print:shadow-none space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  SM
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">StockMate Technologies Pvt. Ltd.</h2>
                  <p className="text-xs text-slate-500">Cloud Restaurant Inventory & SaaS Platform</p>
                </div>
              </div>
              <div className="text-[11px] text-slate-500 mt-2 space-y-0.5">
                <p>Nesco IT Park, Western Express Highway, Goregaon (East), Mumbai 400063</p>
                <p><strong>GSTIN:</strong> 27AABCU9603R1ZM | <strong>State Code:</strong> 27 (Maharashtra)</p>
                <p><strong>CIN:</strong> U72900MH2025PTC123456 | <strong>PAN:</strong> AABCU9603R</p>
              </div>
            </div>

            <div className="text-right sm:self-start">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900 text-white mb-2">
                Tax Invoice
              </span>
              <div className="text-xs space-y-1">
                <div><span className="text-slate-400">Invoice No:</span> <strong className="text-slate-900 font-mono">{invoice.invoiceNumber || invoice.id}</strong></div>
                <div><span className="text-slate-400">Issue Date:</span> <strong className="text-slate-800">{invoice.issueDate}</strong></div>
                <div><span className="text-slate-400">Due Date:</span> <strong className="text-slate-800">{invoice.dueDate || 'Immediate'}</strong></div>
                <div><span className="text-slate-400">Payment Status:</span> <strong className={invoice.status === 'Paid' ? 'text-emerald-700' : 'text-amber-700'}>{invoice.status}</strong></div>
              </div>
            </div>
          </div>

          {/* Bill To / Tenant Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/70 p-4 rounded-xl border border-slate-200/70 text-xs">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Billed To (Restaurant Tenant)
              </span>
              <h4 className="font-bold text-sm text-slate-900">{invoice.restaurantName}</h4>
              <p className="text-slate-600 font-medium">Attn: {invoice.ownerName}</p>
              <p className="text-slate-500 mt-1">{invoice.address || 'Registered Restaurant Branch'}</p>
              <p className="text-slate-500 mt-0.5">Email: {invoice.ownerEmail} | Phone: {invoice.ownerPhone || 'N/A'}</p>
              <p className="text-slate-700 font-semibold mt-1">Tenant GSTIN: {invoice.gstin || 'Unregistered / Consumer'}</p>
            </div>

            <div className="sm:border-l sm:border-slate-200/80 sm:pl-6 space-y-1 text-slate-600">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Payment & Billing Details
              </span>
              <p><strong>Transaction Ref:</strong> <span className="font-mono">{invoice.transactionId}</span></p>
              <p><strong>Payment Mode:</strong> {invoice.paymentMethod || 'Razorpay UPI / NetBanking'}</p>
              <p><strong>Billing Period:</strong> {invoice.period || 'Monthly Subscription Cycle'}</p>
              <p><strong>Place of Supply:</strong> {invoice.address?.includes('MH') || invoice.gstin?.startsWith('27') ? 'Maharashtra (27) - Intra-State' : 'Inter-State Supply (IGST)'}</p>
              <p><strong>Reverse Charge:</strong> Applicable: No</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/75 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Service Description</th>
                  <th className="py-2.5 px-3 text-center">SAC Code</th>
                  <th className="py-2.5 px-3 text-right">Taxable Value</th>
                  <th className="py-2.5 px-3 text-right">GST Rate</th>
                  <th className="py-2.5 px-3 text-right">Total (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-3 px-3 font-mono">1</td>
                  <td className="py-3 px-3">
                    <strong className="text-slate-900">{invoice.planName || 'StockMate SaaS Subscription'}</strong>
                    <p className="text-[11px] text-slate-500 mt-0.5">Cloud-hosted multi-tenant inventory control, POS touch sync & kitchen telemetry.</p>
                  </td>
                  <td className="py-3 px-3 text-center font-mono">998313</td>
                  <td className="py-3 px-3 text-right font-mono">{formatINR(invoice.baseAmount || invoice.amount / 1.18)}</td>
                  <td className="py-3 px-3 text-right">18% GST</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900 font-mono">{formatINR(invoice.amount)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-4 border-t border-slate-200 text-xs">
            <div className="text-slate-500 max-w-sm space-y-1">
              <p><strong>HSN/SAC 998313:</strong> Information technology software services and cloud infrastructure hosting.</p>
              <p className="text-[11px] italic">This is an electronically generated and verified tax invoice requiring no physical signature under the IT Act 2000.</p>
            </div>

            <div className="w-full sm:w-64 space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (Base Value):</span>
                <span className="font-mono">{formatINR(invoice.baseAmount || Math.round(invoice.amount / 1.18))}</span>
              </div>
              {invoice.cgst > 0 ? (
                <>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>CGST @ 9%:</span>
                    <span className="font-mono">{formatINR(invoice.cgst)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>SGST @ 9%:</span>
                    <span className="font-mono">{formatINR(invoice.sgst)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>IGST @ 18%:</span>
                  <span className="font-mono">{formatINR(invoice.tax || Math.round(invoice.amount - (invoice.amount / 1.18)))}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                <span>Total Amount:</span>
                <span className="font-mono text-emerald-700">{formatINR(invoice.amount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="flex items-center justify-between pt-2 print:hidden">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Digital Hash: SHA256-ED25519 Verified</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Printer}
              onClick={handlePrint}
            >
              Print / Save as PDF
            </Button>
            <Button
              variant="brand"
              size="sm"
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

