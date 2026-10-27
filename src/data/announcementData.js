import { formatINR } from './inventoryBillingData.js';
/**
 * StockMate SaaS — Premium Communication Center & Announcement Data Architecture
 * Provides categories, priority configurations, template catalog, pre-seeded announcements,
 * and safe variable interpolation routines.
 */

export const ANNOUNCEMENT_CATEGORIES = {
  general: {
    id: 'general',
    label: 'General Announcement',
    color: 'emerald',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dotClass: 'bg-emerald-500',
    iconName: 'Megaphone',
    description: 'General platform updates, news, and hospitality community bulletins',
  },
  policy: {
    id: 'policy',
    label: 'Platform Policy',
    color: 'purple',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
    dotClass: 'bg-purple-500',
    iconName: 'FileCheck2',
    description: 'Terms of service, compliance standards, and food safety regulations requiring review',
  },
  subscription: {
    id: 'subscription',
    label: 'Subscription & Pricing',
    color: 'blue',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
    dotClass: 'bg-blue-500',
    iconName: 'CreditCard',
    description: 'Tier changes, renewals, annual discounts, and plan upgrade notifications',
  },
  billing: {
    id: 'billing',
    label: 'Billing & Payments',
    color: 'indigo',
    badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    dotClass: 'bg-indigo-500',
    iconName: 'Receipt',
    description: 'Invoices, auto-pay updates, tax ledger changes, and payment verification alerts',
  },
  receipt: {
    id: 'receipt',
    label: 'Payment Receipt',
    color: 'emerald',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dotClass: 'bg-emerald-500',
    iconName: 'Receipt',
    description: 'Official tax invoice and payment settlement receipts',
  },
  maintenance: {
    id: 'maintenance',
    label: 'Maintenance & Downtime',
    color: 'amber',
    badgeClass: 'bg-amber-50 text-amber-900 border-amber-200',
    dotClass: 'bg-amber-500',
    iconName: 'Wrench',
    description: 'Scheduled platform maintenance, infrastructure upgrades, and cloud failover windows',
  },
  feature: {
    id: 'feature',
    label: 'New Feature',
    color: 'cyan',
    badgeClass: 'bg-cyan-50 text-cyan-900 border-cyan-200',
    dotClass: 'bg-cyan-500',
    iconName: 'Sparkles',
    description: 'Product releases, kitchen touchscreen modules, QR scanning, and UI upgrades',
  },
  security: {
    id: 'security',
    label: 'Security Notice',
    color: 'rose',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
    dotClass: 'bg-rose-500',
    iconName: 'ShieldAlert',
    description: 'Account security advisories, multi-factor authentication, and terminal PIN guidelines',
  },
  urgent: {
    id: 'urgent',
    label: 'Urgent Platform Notice',
    color: 'red',
    badgeClass: 'bg-red-100 text-red-900 border-red-300 font-bold',
    dotClass: 'bg-red-600',
    iconName: 'AlertOctagon',
    description: 'High-priority alerts requiring immediate attention from restaurant leadership',
  },
};

export const PRIORITY_CONFIGS = {
  normal: {
    id: 'normal',
    label: 'Normal',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    dotColor: 'bg-slate-400',
    bannerClass: 'border-l-slate-400',
  },
  important: {
    id: 'important',
    label: 'Important',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 font-semibold',
    dotColor: 'bg-amber-500',
    bannerClass: 'border-l-amber-500 bg-amber-50/30',
  },
  urgent: {
    id: 'urgent',
    label: 'Urgent',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200 font-bold shadow-xs',
    dotColor: 'bg-rose-600 animate-pulse',
    bannerClass: 'border-l-rose-600 bg-rose-50/40',
  },
};

// Safe, predefined template variables
export const SUPPORTED_TEMPLATE_VARIABLES = [
  { key: '{{restaurant_name}}', label: 'Restaurant Name', example: 'Spice Garden' },
  { key: '{{owner_name}}', label: 'Owner Name', example: 'Priya Sharma' },
  { key: '{{plan_name}}', label: 'Subscription Plan', example: 'Professional Plan' },
  { key: '{{amount}}', label: 'Transaction Amount', example: '₹11,799' },
  { key: '{{invoice_number}}', label: 'Invoice Number', example: 'STM-INV-2026-1048' },
  { key: '{{receipt_number}}', label: 'Receipt Number', example: 'RCP-TXN-IND-90211' },
  { key: '{{payment_ref}}', label: 'Payment Gateway Ref', example: 'pay_PLm9812948' },
  { key: '{{renewal_date}}', label: 'Renewal Date', example: 'November 14, 2026' },
  { key: '{{effective_date}}', label: 'Effective Date', example: 'November 1, 2026' },
  { key: '{{platform_link}}', label: 'Platform Portal Link', example: 'https://app.stockmate.io' },
];

// Escape untrusted content to prevent HTML injection
export const escapeHtml = (str) => {
  if (typeof str !== 'string') return String(str || '');
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Extracts all {{variable_name}} tokens from a string.
 */
export const extractTemplateVariables = (text = '') => {
  if (!text || typeof text !== 'string') return [];
  const matches = text.match(/\{\{[a-zA-Z0-9_]+\}\}/g);
  return matches ? Array.from(new Set(matches)) : [];
};

/**
 * Detects any variables in text that are not part of the supported variables list.
 */
export const getUnresolvedVariables = (text = '', supportedKeys = null) => {
  const allowed = supportedKeys || SUPPORTED_TEMPLATE_VARIABLES.map((v) => v.key);
  const found = extractTemplateVariables(text);
  return found.filter((k) => !allowed.includes(k));
};

/**
 * Safely interpolates predefined variables without executing raw HTML or script tags.
 */
export const interpolateTemplateVariables = (text = '', context = {}, options = { escape: false }) => {
  if (!text || typeof text !== 'string') return '';
  let result = text;

  const sanitize = (val) => {
    if (val === undefined || val === null) return '';
    return options.escape ? escapeHtml(String(val)) : String(val);
  };

  const replacements = {
    '{{restaurant_name}}': context.restaurantName || '[Restaurant Name]',
    '{{owner_name}}': context.ownerName || '[Owner Name]',
    '{{plan_name}}': context.planName || '[Subscription Plan]',
    '{{amount}}': context.amount
      ? (typeof context.amount === 'number' ? formatINR(context.amount) : context.amount)
      : '[Amount]',
    '{{invoice_number}}': context.invoiceNumber || context.invoiceId || '[Invoice Number]',
    '{{receipt_number}}': context.receiptNumber || '[Receipt Number]',
    '{{payment_ref}}': context.paymentRef || context.gatewayRef || '[Payment Reference]',
    '{{renewal_date}}': context.renewalDate || '[Renewal Date]',
    '{{effective_date}}': context.effectiveDate || '[Effective Date]',
    '{{platform_link}}': context.platformLink || '#/dashboard',
  };

  Object.entries(replacements).forEach(([variable, value]) => {
    result = result.split(variable).join(sanitize(value));
  });

  return result;
};

// 8 Commercial SaaS Predefined Message Templates
export const INITIAL_ANNOUNCEMENT_TEMPLATES = [
  {
    id: 'tpl-general-01',
    category: 'general',
    priority: 'normal',
    title: 'Welcome to StockMate Platform Release {{effective_date}}',
    summary: 'Platform improvements, faster pantry sync, and general service reliability updates.',
    body: `Dear {{owner_name}},\n\nWe are pleased to share our monthly platform update for {{restaurant_name}}. Over the past month, our engineering team has deployed key performance enhancements across our multi-branch inventory sync engine.\n\nKey highlights include:\n• 40% faster goods receiving (GRN) verification.\n• Enhanced SVG barcode and QR label clarity for bulk kitchen prep.\n• Automated multi-outlet supplier ledger reconciliation.\n\nThank you for partnering with StockMate as your kitchen operating system. Feel free to reach out to our platform team if you have any feedback or workflow suggestions.`,
    ctaLabel: 'Explore Dashboard',
    ctaLink: '/dashboard',
    requiresAcknowledgment: false,
    policyVersion: null,
  },
  {
    id: 'tpl-policy-02',
    category: 'policy',
    priority: 'important',
    title: 'Platform Policy & Food Safety Compliance Update (v2.4)',
    summary: 'Updated FEFO inventory retention rules and mandatory kitchen temperature logging compliance.',
    body: `Attention {{owner_name}},\n\nStockMate is updating its Food Safety & Temperature Governance Policy (Version 2.4), effective {{effective_date}}.\n\nSummary of Changes:\n1. FEFO (First-Expired, First-Out) threshold alerts will now escalate to branch managers 48 hours prior to perishable ingredient expiry.\n2. Goods receiving dock temperature logging is now required for chilled dairy, poultry, and meat deliveries before GRN approval.\n3. Digital inspection audit trails must be preserved for 180 days in accordance with hospitality food safety standards.\n\nPlease review these guidelines with your head chef and inventory managers. Formal acknowledgment of this policy version is required by {{effective_date}}.`,
    ctaLabel: 'Review Policy Guidelines',
    ctaLink: '/inbox',
    requiresAcknowledgment: true,
    policyVersion: 'v2.4',
  },
  {
    id: 'tpl-sub-03',
    category: 'subscription',
    priority: 'important',
    title: 'Upcoming Subscription Renewal for {{restaurant_name}}',
    summary: 'Your {{plan_name}} subscription is scheduled for renewal on {{renewal_date}}.',
    body: `Hello {{owner_name}},\n\nThis is an advance notice that your {{plan_name}} subscription for {{restaurant_name}} will renew automatically on {{renewal_date}}.\n\nYour active benefits include:\n• Multi-branch inventory governance across all registered kitchen outlets.\n• Real-time FEFO wastage monitoring and dock delivery verification.\n• Automated purchase order dispatch and supplier credit notes.\n\nSave with Annual Billing:\nSwitch to annual billing anytime before {{renewal_date}} to receive 2 complimentary months (equivalent to a 20% discount on your current tier).`,
    ctaLabel: 'Manage Subscription & Invoices',
    ctaLink: '/plans-billing',
    requiresAcknowledgment: false,
    policyVersion: null,
  },
  {
    id: 'tpl-pricing-04',
    category: 'subscription',
    priority: 'normal',
    title: 'Important Notice: Transparent Pricing & Infrastructure Update',
    summary: 'Notice of upcoming adjustments to auxiliary add-ons and branch capacity tiers.',
    body: `Dear Restaurant Partner,\n\nAt StockMate, we are committed to transparent, value-driven pricing. Effective {{effective_date}}, we are introducing updated multi-outlet capacity allowances and expanded QR batch tracking limits.\n\nWhat this means for {{restaurant_name}}:\n• Existing active contracts remain locked at current rates until your next annual renewal date.\n• New kitchen touchscreen terminal add-ons will receive complimentary SLA monitoring.\n• High-volume supplier auto-reconciliation will be included in the {{plan_name}} at no additional cost.\n\nReview your current plan entitlements or consult our pricing calculator at any time.`,
    ctaLabel: 'View Pricing Calculator',
    ctaLink: '/plans-billing',
    requiresAcknowledgment: false,
    policyVersion: null,
  },
  {
    id: 'tpl-maint-05',
    category: 'maintenance',
    priority: 'important',
    title: 'Scheduled System Maintenance: Database & Cloud Optimization',
    summary: 'Scheduled 30-minute maintenance window on Sunday between 02:00 AM and 02:30 AM IST.',
    body: `Dear {{owner_name}},\n\nTo ensure peak performance during busy dinner rushes, StockMate has scheduled infrastructure maintenance on Sunday between 02:00 AM and 02:30 AM IST.\n\nExpected Impact:\n• The web console may experience intermittent 3-5 minute read-only periods during database reindexing.\n• Local touchscreen kitchen terminals running active cook sessions will continue offline without interruption.\n• Goods received during the window will sync automatically once cloud connectivity resumes.\n\nWe appreciate your understanding as we maintain our 99.9% platform availability guarantee.`,
    ctaLabel: 'View System Status',
    ctaLink: '/dashboard',
    requiresAcknowledgment: false,
    policyVersion: null,
  },
  {
    id: 'tpl-feature-06',
    category: 'feature',
    priority: 'normal',
    title: 'Now Live: Interactive GRN Dock Verification & Damage Claim Workflow',
    summary: 'Instant delivery dispute recording, damaged box photographic logs, and automated credit notes.',
    body: `Hello {{owner_name}},\n\nWe are excited to unveil our newly revamped Goods Receiving (GRN) Dock Verification console, available immediately in {{restaurant_name}}'s workspace!\n\nNew Capabilities:\n• Barcode & Lot Number Verification: Scan incoming deliveries against active Purchase Orders.\n• One-Click Damage Claims: Reject substandard produce at the loading dock and auto-issue supplier credit note deductions.\n• Supplier SLA Scorecard: Track on-time delivery percentages and rejection rates across all vendors.\n\nEmpower your inventory receiving staff with this tool today.`,
    ctaLabel: 'Try Goods Receiving Console',
    ctaLink: '/goods-receiving',
    requiresAcknowledgment: false,
    policyVersion: null,
  },
  {
    id: 'tpl-billing-07',
    category: 'billing',
    priority: 'normal',
    title: 'Monthly Subscription Invoice & Tax Ledger Statement Available',
    summary: 'Your latest tax invoice and GST ledger breakdown are ready for download.',
    body: `Dear {{owner_name}},\n\nYour monthly GST-compliant tax invoice for {{restaurant_name}} has been generated and filed in your account ledger.\n\nInvoice Overview:\n• Subscription Tier: {{plan_name}}\n• Billing Period: Current Month\n• Payment Status: Paid & Verified\n\nYou can view, download PDF copies, or update your registered GSTIN and corporate billing address directly from the Billing Center.`,
    ctaLabel: 'Download Tax Invoice',
    ctaLink: '/plans-billing',
    requiresAcknowledgment: false,
    policyVersion: null,
  },
  {
    id: 'tpl-sec-08',
    category: 'security',
    priority: 'urgent',
    title: 'Security Advisory: Mandatory Kitchen PIN & Terminal Session Review',
    summary: 'Recommended security best practices for tablet stations and branch staff account permissions.',
    body: `Urgent Security Advisory for {{owner_name}},\n\nAs part of our continuous hospitality security audits, we strongly advise all restaurant owners to review active staff terminal sessions and rotate line cook PINs.\n\nImmediate Recommendations:\n1. Audit active manager and inventory accounts under People & Workforce.\n2. Ensure tablets located in customer-facing zones are locked to Station Cook mode.\n3. Change any default staff passwords or station PINs that have been shared among team members.\n\nStockMate security engineers will never request your account password or payment PIN.`,
    ctaLabel: 'Review Workforce Security',
    ctaLink: '/workforce',
    requiresAcknowledgment: false,
    policyVersion: null,
  },,
  {
    id: 'tpl-receipt-07',
    category: 'receipt',
    priority: 'normal',
    title: 'Payment Receipt: {{amount}} for {{plan_name}} — {{receipt_number}}',
    summary: 'Your auto-renewal payment of {{amount}} has been successfully verified and settled.',
    body: `Dear {{owner_name}},\n\nThank you for your payment. Your subscription renewal for {{restaurant_name}} on the {{plan_name}} tier has been successfully verified and settled.\n\nTransaction Summary:\n• Receipt Number: {{receipt_number}}\n• Gateway Reference: {{payment_ref}}\n• Total Amount Paid: {{amount}} (Inclusive of 18% statutory GST)\n• Next Renewal Date: {{renewal_date}}\n\nYour official GST tax invoice is now filed and available for download in your billing center at any time.`,
    ctaLabel: 'View Billing & Receipts',
    ctaLink: '/owner-billing',
    requiresAcknowledgment: false,
    policyVersion: null,
  },
  {
    id: 'tpl-invoice-08',
    category: 'billing',
    priority: 'normal',
    title: 'Invoice Notification: Tax Invoice #{{invoice_number}} Available for Download',
    summary: 'Your monthly GST tax invoice and itemized ledger statement are ready for {{restaurant_name}}.',
    body: `Dear {{owner_name}},\n\nYour monthly GST-compliant tax invoice #{{invoice_number}} for {{restaurant_name}} has been generated and filed in your corporate ledger.\n\nInvoice Overview:\n• Subscription Tier: {{plan_name}}\n• Invoice Number: {{invoice_number}}\n• Payment Status: Paid & Verified\n• Total Settled: {{amount}}\n\nYou can view, download PDF copies, or update your registered GSTIN and corporate billing address directly from the Billing Center.`,
    ctaLabel: 'Download Tax Invoice',
    ctaLink: '/owner-billing',
    requiresAcknowledgment: false,
    policyVersion: null,
  },
];

// Initial published platform announcements
export const INITIAL_ANNOUNCEMENTS = [
  {
    id: 'ann-101',
    title: 'Platform Policy & Food Safety Compliance Update (v2.4)',
    summary: 'Updated FEFO inventory retention rules and mandatory kitchen temperature logging compliance.',
    category: 'policy',
    priority: 'important',
    author: 'Alexander Vance (Super Admin)',
    authorRole: 'Platform Governance Lead',
    publishedAt: '2026-10-25T14:30:00.000Z',
    status: 'published',
    audienceType: 'ALL_RESTAURANTS',
    targetRestaurantIds: [],
    targetPlanIds: [],
    requiresAcknowledgment: true,
    policyVersion: 'v2.4',
    effectiveDate: 'November 1, 2026',
    ctaLabel: 'Review & Acknowledge Policy',
    ctaLink: '/inbox',
    attachments: [
      {
        name: 'StockMate_Food_Safety_Standards_v2.4.pdf',
        size: '1.4 MB',
        type: 'application/pdf',
      },
    ],
    body: `Attention Restaurant Partners,\n\nStockMate is updating its Food Safety & Temperature Governance Policy (Version 2.4), effective November 1, 2026.\n\nSummary of Requirements:\n1. FEFO (First-Expired, First-Out) threshold alerts will now escalate to branch managers 48 hours prior to perishable ingredient expiry.\n2. Goods receiving dock temperature logging is now required for chilled dairy, poultry, and meat deliveries before GRN approval.\n3. Digital inspection audit trails must be preserved for 180 days in accordance with hospitality food safety standards.\n\nPlease review these guidelines with your head chef and inventory managers. Formal acknowledgment of this policy version is requested below.`,
    emailDelivery: {
      queued: 4,
      delivered: 4,
      failed: 0,
      provider: 'StockMate In-App Dispatcher (Verified Delivery)',
      simulated: true,
    },
  },
  {
    id: 'ann-102',
    title: 'Scheduled Cloud Infrastructure Maintenance Notice',
    summary: 'Brief 25-minute maintenance window on Sunday between 02:00 AM and 02:25 AM IST for database optimization.',
    category: 'maintenance',
    priority: 'normal',
    author: 'Alexander Vance (Super Admin)',
    authorRole: 'Infrastructure Ops',
    publishedAt: '2026-10-26T08:00:00.000Z',
    status: 'published',
    audienceType: 'ALL_RESTAURANTS',
    targetRestaurantIds: [],
    targetPlanIds: [],
    requiresAcknowledgment: false,
    policyVersion: null,
    effectiveDate: 'November 2, 2026',
    ctaLabel: 'View Operational Status',
    ctaLink: '/dashboard',
    attachments: [],
    body: `Dear Restaurant Partner,\n\nTo ensure peak performance during busy weekend dining services, StockMate has scheduled infrastructure maintenance on Sunday between 02:00 AM and 02:25 AM IST.\n\nExpected Impact:\n• The web console may experience intermittent 2-3 minute read-only intervals during database reindexing.\n• Local touchscreen kitchen terminals running active cook sessions will continue offline without interruption.\n• Goods received during the window will sync automatically once cloud connectivity resumes.\n\nWe appreciate your partnership as we maintain our 99.9% platform availability guarantee.`,
    emailDelivery: {
      queued: 4,
      delivered: 4,
      failed: 0,
      provider: 'StockMate In-App Dispatcher (Verified Delivery)',
      simulated: true,
    },
  },
  {
    id: 'ann-103',
    title: 'Now Live: Interactive GRN Dock Verification & Damage Claim Workflow',
    summary: 'Instant delivery dispute recording, damaged box photographic logs, and automated credit notes.',
    category: 'feature',
    priority: 'normal',
    author: 'Product Management Team',
    authorRole: 'Platform Feature Release',
    publishedAt: '2026-10-26T11:15:00.000Z',
    status: 'published',
    audienceType: 'ALL_RESTAURANTS',
    targetRestaurantIds: [],
    targetPlanIds: [],
    requiresAcknowledgment: false,
    policyVersion: null,
    effectiveDate: 'Immediately',
    ctaLabel: 'Open Goods Receiving Dock',
    ctaLink: '/goods-receiving',
    attachments: [
      {
        name: 'GRN_Dock_Verification_QuickGuide.pdf',
        size: '840 KB',
        type: 'application/pdf',
      },
    ],
    body: `Hello Team,\n\nWe are excited to unveil our newly revamped Goods Receiving (GRN) Dock Verification console, available immediately in your workspace!\n\nNew Capabilities:\n• Barcode & Lot Number Verification: Scan incoming deliveries against active Purchase Orders.\n• One-Click Damage Claims: Reject substandard produce at the loading dock and auto-issue supplier credit note deductions.\n• Supplier SLA Scorecard: Track on-time delivery percentages and rejection rates across all vendors.\n\nEmpower your inventory receiving staff with this tool today directly from the sidebar.`,
    emailDelivery: {
      queued: 4,
      delivered: 4,
      failed: 0,
      provider: 'StockMate In-App Dispatcher (Verified Delivery)',
      simulated: true,
    },
  },
  {
    id: 'ann-104',
    title: 'Security Advisory: Mandatory Kitchen PIN & Terminal Session Review',
    summary: 'Recommended security best practices for tablet stations and branch staff account permissions.',
    category: 'security',
    priority: 'urgent',
    author: 'Platform Security Operations',
    authorRole: 'InfoSec Team',
    publishedAt: '2026-10-26T16:45:00.000Z',
    status: 'published',
    audienceType: 'ALL_RESTAURANTS',
    targetRestaurantIds: [],
    targetPlanIds: [],
    requiresAcknowledgment: false,
    policyVersion: null,
    effectiveDate: 'Immediate Advisory',
    ctaLabel: 'Review Workforce Security',
    ctaLink: '/workforce',
    attachments: [],
    body: `Urgent Security Advisory for Restaurant Leadership,\n\nAs part of our continuous hospitality security audits, we advise all restaurant owners to review active staff terminal sessions and rotate line cook PINs.\n\nRecommended Immediate Actions:\n1. Audit active manager and inventory accounts under People & Workforce.\n2. Ensure tablets located in customer-facing zones are locked to Station Cook mode.\n3. Change any default staff passwords or station PINs that have been shared among team members.\n\nStockMate security engineers will never request your account password or payment PIN. If you observe any unrecognized device logins, contact security@stockmate.io immediately.`,
    emailDelivery: {
      queued: 4,
      delivered: 4,
      failed: 0,
      provider: 'StockMate In-App Dispatcher (Verified Delivery)',
      simulated: true,
    },
  },
  {
    id: 'ann-105',
    title: 'Payment Receipt: ₹11,799 for Professional Plan — RCP-TXN-IND-90211',
    summary: 'Verified payment receipt for Spice Garden subscription renewal (Ref: pay_PLm9812948).',
    category: 'receipt',
    priority: 'normal',
    author: 'StockMate Billing Engine (Automated)',
    authorRole: 'Automated Transactional Dispatcher',
    publishedAt: '2026-10-26T17:30:00.000Z',
    status: 'published',
    audienceType: 'SPECIFIC_RESTAURANTS',
    targetRestaurantIds: ['rest-1'],
    targetPlanIds: [],
    requiresAcknowledgment: false,
    effectiveDate: 'October 14, 2026 11:42 AM',
    ctaLabel: 'View Invoice & Receipts in Billing',
    ctaLink: '/owner-billing',
    verifiedTransaction: {
      id: 'TXN-IND-90211',
      receiptNumber: 'RCP-TXN-IND-90211',
      paymentRef: 'pay_PLm9812948',
      invoiceId: 'STM-INV-2026-1048',
      amount: 11799,
      baseAmount: 9999,
      taxAmount: 1799.82,
      planName: 'Professional',
      billingCycle: 'Monthly',
      paymentMethod: 'UPI - Google Pay',
      gateway: 'Razorpay',
      paymentDate: 'October 14, 2026 11:42 AM',
      gstin: '27AABCU9603R1ZM (Sample)',
      simulated: true,
      status: 'paid',
    },
    body: `Dear Priya Sharma,\n\nThank you for your payment. Your subscription renewal for Spice Garden on the Professional tier (Monthly) has been successfully verified and settled.\n\nTransaction Summary:\n• Receipt Number: RCP-TXN-IND-90211\n• Payment Gateway: Razorpay (pay_PLm9812948)\n• Payment Method: UPI - Google Pay\n• Total Amount Paid: ₹11,799 (Inclusive of 18% statutory GST)\n• Next Renewal Date: November 14, 2026\n\nYour official GST tax invoice is now filed and available for download in your billing center at any time.`,
    attachments: [
      {
        name: 'StockMate_Tax_Receipt_STM-INV-2026-1048.pdf',
        size: '240 KB',
        type: 'application/pdf',
      },
    ],
    emailDelivery: {
      queued: 1,
      delivered: 1,
      failed: 0,
      provider: 'StockMate In-App Dispatcher (Verified Delivery)',
      simulated: true,
    },
  },
  {
    id: 'ann-106',
    title: 'Upcoming Subscription Renewal & Annual Savings Opportunity',
    summary: 'Advance notice of upcoming cycle renewal and complimentary 2-month discount offer.',
    category: 'subscription',
    priority: 'normal',
    author: 'Platform Revenue Management',
    authorRole: 'Billing Operations',
    publishedAt: '2026-10-27T09:00:00.000Z',
    status: 'published',
    audienceType: 'ALL_RESTAURANTS',
    targetRestaurantIds: [],
    targetPlanIds: [],
    requiresAcknowledgment: false,
    effectiveDate: 'November 14, 2026',
    ctaLabel: 'Manage Subscription & Invoices',
    ctaLink: '/plans-billing',
    attachments: [],
    body: `Dear Restaurant Leadership,\n\nThis is an advance notice that your active StockMate tier will renew on your scheduled monthly renewal date.\n\nActive Entitlements:\n• Multi-branch inventory governance across all registered kitchen outlets.\n• Real-time FEFO wastage monitoring and loading dock delivery verification.\n• Automated purchase order dispatch and supplier credit notes.\n\nSave with Annual Billing:\nSwitch to annual billing anytime before your next cycle to receive 2 complimentary months (equivalent to a 20% discount on your current subscription plan).\n\nVisit your Billing & Subscription Center to update payment preferences or lock in annual savings.`,
    emailDelivery: {
      queued: 4,
      delivered: 4,
      failed: 0,
      provider: 'StockMate In-App Dispatcher (Verified Delivery)',
      simulated: true,
    },
  },
  {
    id: 'ann-draft-101',
    title: 'Draft: Q4 Kitchen Equipment Energy Efficiency Guidelines',
    summary: 'Operational guidelines for commercial induction stations and walk-in chiller temperature logs.',
    category: 'policy',
    priority: 'normal',
    author: 'Alexander Vance (Super Admin)',
    authorRole: 'Platform Governance',
    publishedAt: '2026-10-27T10:15:00.000Z',
    status: 'draft',
    audienceType: 'ALL_RESTAURANTS',
    targetRestaurantIds: [],
    targetPlanIds: [],
    requiresAcknowledgment: true,
    policyVersion: 'v2.5-draft',
    effectiveDate: 'December 1, 2026',
    ctaLabel: 'Review Draft Compliance Standards',
    ctaLink: '/inbox',
    attachments: [
      {
        name: 'Q4_Kitchen_Energy_Efficiency_Standards_v2.5.pdf',
        size: '1.1 MB',
        type: 'application/pdf',
      },
    ],
    body: `Dear Kitchen Operations Team,\n\nIn preparation for the upcoming peak holiday dining period, StockMate is proposing updated energy efficiency and equipment maintenance standards (v2.5).\n\nKey Focus Areas:\n1. Scheduled calibration of refrigeration compressor digital sensor probes.\n2. Standard operating procedures for overnight standby power on commercial combi-ovens.\n3. Daily automated logging of walk-in chiller temperatures at 08:00 AM and 08:00 PM.\n\nThis is an internal draft bulletin currently undergoing platform review prior to final broadcast publication.`,
    emailDelivery: {
      queued: 0,
      delivered: 0,
      failed: 0,
      provider: 'Unpublished Draft',
      simulated: true,
    },
  },
];

