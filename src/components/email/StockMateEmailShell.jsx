import React from 'react';
import {
  Boxes,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Calendar,
  Paperclip,
  Download,
  ExternalLink,
  Receipt,
  FileCheck2,
  AlertTriangle,
  AlertOctagon,
  Sparkles,
  CreditCard,
  Wrench,
  Megaphone,
  Smartphone,
  Monitor,
  Building,
  Check,
} from 'lucide-react';
import { formatINR } from '../../data/inventoryBillingData';
import { ANNOUNCEMENT_CATEGORIES, PRIORITY_CONFIGS } from '../../data/announcementData';

export const StockMateEmailShell = ({
  subject = 'StockMate Notification',
  summary = '',
  body = '',
  category = 'general',
  priority = 'normal',
  author = 'StockMate Platform Administration',
  authorRole = 'Platform Operations',
  publishedAt = new Date().toISOString(),
  recipient = {},
  ctaLabel = 'Open Platform Console',
  ctaLink = '/dashboard',
  onCtaClick = null,
  attachments = [],
  requiresAcknowledgment = false,
  policyVersion = null,
  isAcknowledged = false,
  acknowledgedBy = null,
  acknowledgedAt = null,
  onAcknowledge = null,
  verifiedTransaction = null,
  previewDevice = 'desktop', // 'desktop' | 'mobile'
  showDeviceToggle = false,
  onDeviceChange = null,
  simulated = true,
}) => {
  const catObj = ANNOUNCEMENT_CATEGORIES[category] || ANNOUNCEMENT_CATEGORIES.general;
  const prioObj = PRIORITY_CONFIGS[priority] || PRIORITY_CONFIGS.normal;

  const dateStr = new Date(publishedAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const ownerName = recipient.ownerName || 'Restaurant Partner';
  const restaurantName = recipient.restaurantName || 'Your Restaurant';
  const recipientEmail = recipient.ownerEmail || recipient.email || 'partner@stockmate.io';

  // Category Icon Resolver
  const getCategoryIcon = () => {
    switch (category) {
      case 'policy':
        return <FileCheck2 className="w-4 h-4 text-purple-600" />;
      case 'subscription':
        return <CreditCard className="w-4 h-4 text-blue-600" />;
      case 'billing':
        return <Receipt className="w-4 h-4 text-indigo-600" />;
      case 'maintenance':
        return <Wrench className="w-4 h-4 text-amber-600" />;
      case 'feature':
        return <Sparkles className="w-4 h-4 text-cyan-600" />;
      case 'security':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'urgent':
        return <AlertOctagon className="w-4 h-4 text-red-600" />;
      default:
        return <Megaphone className="w-4 h-4 text-emerald-600" />;
    }
  };

  // The Inner Email Canvas (shared between Desktop & Mobile)
  const emailContent = (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm text-left font-sans">
      {/* 1. BRANDED HEADER & SENDER IDENTITY */}
      <div className="bg-slate-900 text-white p-5 sm:p-6 border-b-4 border-emerald-500">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base sm:text-lg tracking-tight text-white">StockMate</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  SaaS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                Restaurant Inventory &amp; Kitchen Operating System
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${catObj.badgeClass}`}
            >
              {catObj.label}
            </span>
            {priority === 'urgent' && (
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                Urgent Notice
              </span>
            )}
          </div>
        </div>

        {/* Envelope Meta Bar */}
        <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-300 space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-1">
            <div>
              <span className="text-slate-400 font-semibold">From: </span>
              <strong className="text-white">StockMate Cloud Notifications</strong>{' '}
              <span className="text-slate-400">&lt;notifications@stockmate.io&gt;</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/80">
              <ShieldCheck className="w-3 h-3" />
              <span>DKIM &amp; SPF Verified</span>
            </div>
          </div>
          <div>
            <span className="text-slate-400 font-semibold">To: </span>
            <span className="text-white font-medium">{ownerName}</span> &lt;{recipientEmail}&gt; ({restaurantName})
          </div>
          <div className="text-[10px] text-slate-400">
            <span className="font-semibold">Sent: </span>
            {dateStr}
          </div>
        </div>
      </div>

      {/* 2. EMAIL BODY CONTAINER */}
      <div className="p-5 sm:p-7 space-y-5">
        {/* Subject Headline */}
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
            {subject}
          </h1>
          {summary && (
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed border-l-2 border-emerald-500 pl-2.5">
              {summary}
            </p>
          )}
        </div>

        {/* Formatted Message Body */}
        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-3 font-normal">
          {body}
        </div>

        {/* 3. VERIFIED TRANSACTION / RECEIPT CARD (if applicable) */}
        {verifiedTransaction && (
          <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/30 border border-emerald-200/90 p-4 sm:p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Official Payment Receipt</h4>
                  <span className="text-[10px] text-slate-500">Ref: {verifiedTransaction.receiptNumber || verifiedTransaction.id}</span>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <Check className="w-3 h-3 stroke-[3]" />
                Verified &amp; Paid
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Subscription Tier</span>
                <span className="font-bold text-slate-900">{verifiedTransaction.planName || 'Professional'} Plan</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Payment Method</span>
                <span className="font-semibold text-slate-800">{verifiedTransaction.paymentMethod || 'UPI / NetBanking'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Gateway Reference</span>
                <span className="font-mono text-[11px] text-slate-700">{verifiedTransaction.paymentRef || verifiedTransaction.id}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Invoice ID</span>
                <span className="font-mono text-[11px] text-slate-700">{verifiedTransaction.invoiceId || 'INV-2026-STM'}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500">Total Settled (incl. 18% GST):</span>
                <div className="text-lg font-black text-emerald-800">
                  {formatINR(verifiedTransaction.amount)}
                </div>
              </div>
              <div className="text-right text-[10px] text-slate-500">
                <span>GSTIN: {verifiedTransaction.gstin || '27AABCU9603R1ZM'}</span>
                <div className="text-emerald-700 font-semibold">Tax Invoice Generated</div>
              </div>
            </div>
          </div>
        )}

        {/* 4. POLICY ACKNOWLEDGMENT SECTION (if required) */}
        {requiresAcknowledgment && (
          <div className="rounded-2xl bg-purple-50/70 border border-purple-200 p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-950">
              <FileCheck2 className="w-4 h-4 text-purple-700" />
              <span>Mandatory Compliance Review (Version {policyVersion || 'v2.4'})</span>
            </div>
            <p className="text-[11px] text-purple-900/90 leading-relaxed">
              In accordance with hospitality governance standards, authorized restaurant leadership must review and acknowledge these guidelines.
            </p>

            {isAcknowledged ? (
              <div className="pt-2 border-t border-purple-200 flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50/60 p-2 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Formally acknowledged by {acknowledgedBy || ownerName} on{' '}
                  {acknowledgedAt ? new Date(acknowledgedAt).toLocaleDateString() : 'Recorded'}
                </span>
              </div>
            ) : (
              <div className="pt-2 border-t border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-purple-800">
                  Status: Pending Restaurant Owner Acknowledgment
                </span>
                {onAcknowledge && (
                  <button
                    type="button"
                    onClick={onAcknowledge}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Digitally Acknowledge Policy</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* 5. ATTACHMENTS LIST */}
        {attachments && attachments.length > 0 && (
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Official Attachments ({attachments.length})
            </span>
            <div className="space-y-1.5">
              {attachments.map((att, aIdx) => (
                <div
                  key={aIdx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Paperclip className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-xs font-semibold text-slate-800 truncate">{att.name}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">({att.size || 'PDF Document'})</span>
                  </div>
                  <a
                    href={`#/inbox`}
                    download={att.name}
                    onClick={(e) => {
                      e.preventDefault();
                      alert(`Mock attachment download initiated: ${att.name}`);
                    }}
                    className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors shrink-0"
                    title={`Download ${att.name}`}
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. PRIMARY CALL-TO-ACTION BUTTON */}
        {ctaLabel && (
          <div className="pt-2 text-center sm:text-left">
            {onCtaClick ? (
              <button
                type="button"
                onClick={onCtaClick}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm text-center shadow-md shadow-emerald-600/20 transition-all inline-flex items-center justify-center gap-2"
              >
                <span>{ctaLabel}</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            ) : (
              <a
                href={`#${ctaLink}`}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm text-center shadow-md shadow-emerald-600/20 transition-all inline-flex items-center justify-center gap-2"
              >
                <span>{ctaLabel}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* 7. OFFICIAL EMAIL FOOTER */}
      <div className="bg-slate-50 p-5 sm:p-6 border-t border-slate-200/80 text-[11px] text-slate-500 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">StockMate Platform Technologies Inc.</span>
            <span className="text-slate-300">&bull;</span>
            <span>Enterprise Multi-Tenant Infrastructure</span>
          </div>
          <div className="text-slate-400">
            Registered: Tech Park Hub, Bengaluru, KA 560103, India
          </div>
        </div>

        <p className="leading-relaxed text-[10px] text-slate-400">
          This is an official transactional message transmitted to authorized restaurant administrators for{' '}
          <strong className="text-slate-600">{restaurantName}</strong>. Notifications regarding platform policy updates,
          critical security advisories, and verified subscription payment receipts cannot be disabled.
        </p>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10px] text-slate-400">
          <div>
            Need assistance? <span className="text-emerald-700 font-semibold">support@stockmate.io</span> &bull; 24/7 Priority SLA
          </div>
          {simulated && (
            <div className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              ⚡ Simulated Dispatch &bull; Production requires AWS SES / SendGrid API
            </div>
          )}
          <div>&copy; 2026 StockMate Technologies Inc. All rights reserved.</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {/* Device Switcher (if requested) */}
      {showDeviceToggle && (
        <div className="flex items-center justify-between mb-3 bg-white p-2 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <span>Rendering Preview:</span>
            <span className="font-mono text-[11px] text-emerald-700 uppercase">
              {previewDevice === 'mobile' ? 'Mobile Viewport (375px)' : 'Desktop Canvas (640px)'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onDeviceChange && onDeviceChange('desktop')}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs flex items-center gap-1 transition-all ${
                previewDevice === 'desktop'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => onDeviceChange && onDeviceChange('mobile')}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs flex items-center gap-1 transition-all ${
                previewDevice === 'mobile'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile</span>
            </button>
          </div>
        </div>
      )}

      {/* Render Device View */}
      {previewDevice === 'mobile' ? (
        <div className="max-w-[380px] mx-auto">
          {/* Smartphone Bezel */}
          <div className="rounded-[40px] border-[6px] border-slate-900 bg-slate-900 p-2 shadow-2xl relative">
            {/* Speaker & Camera Island */}
            <div className="h-4 w-28 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950 mr-2"></div>
              <div className="w-8 h-1 rounded-full bg-slate-900"></div>
            </div>

            {/* Mobile Screen Area */}
            <div className="rounded-[28px] overflow-hidden max-h-[640px] overflow-y-auto bg-slate-100">
              {emailContent}
            </div>

            {/* Home Indicator */}
            <div className="w-24 h-1 bg-slate-700 rounded-full mx-auto mt-2.5 mb-1"></div>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">{emailContent}</div>
      )}
    </div>
  );
};
export default StockMateEmailShell;

