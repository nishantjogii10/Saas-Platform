/**
 * StockMate SaaS — Platform Settings Configuration & Reference Data
 * Authoritative single source of truth for Super Admin Platform Configuration
 */

export const DEFAULT_PLATFORM_SETTINGS = {
  general: {
    platformName: 'StockMate',
    platformTagline: 'Restaurant Inventory & Kitchen Operating System',
    platformLogoUrl: '', // empty defaults to built-in SVG icon
    officialDomain: 'stockmate.io',
    appUrl: 'https://app.stockmate.io',
    supportEmail: 'support@stockmate.io',
    supportPhone: '+91 80 4567 8900',
    supportHours: 'Monday – Saturday: 9:00 AM – 9:00 PM IST',
    companyLegalName: 'StockMate Technologies Private Limited',
    registeredAddress: 'Level 4, Tech Park Hub, Outer Ring Road, Bengaluru, KA 560103, India',
    privacyPolicyUrl: 'https://stockmate.io/privacy',
    termsOfServiceUrl: 'https://stockmate.io/terms',
    // Default branding for system-generated transactional emails
    emailSenderName: 'StockMate Cloud Notifications',
    emailSenderAddress: 'notifications@stockmate.io',
    emailFooterDisclaimer:
      'This is an official transactional message transmitted to authorized restaurant administrators for StockMate Multi-Tenant SaaS.',
    emailBrandColor: 'emerald', // emerald | teal | indigo | navy
    requireApprovalForNewTenants: true,
  },

  locale: {
    defaultBillingCurrency: 'INR', // Platform billing base: INR (₹)
    currencySymbol: '₹',
    numberFormat: 'en-IN', // 'en-IN' (Indian numbering: 1,00,000) | 'en-US' (100,000)
    dateFormat: 'DD/MM/YYYY', // 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD MMM YYYY'
    timeFormat: '12h', // '12h' | '24h'
    defaultTimeZone: 'Asia/Kolkata', // Asia/Kolkata (IST, UTC+5:30)
    supportedCurrencies: ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD'],
    multiCurrencyBillingEnabled: false, // Infrastructure status: single platform currency (INR) with multi-currency readiness
    allowBranchTimeZoneOverride: true, // Allow branch-level operational timezone overrides
  },

  security: {
    enforceSuperAdmin2FA: true,
    owner2FARequirement: 'recommended', // 'optional' | 'recommended' | 'enforced'
    sessionTimeoutMinutes: 30, // Inactivity timeout in minutes (15, 30, 60, 120, 0 = disabled)
    passwordPolicy: {
      minLength: 8,
      requireNumbers: true,
      requireSpecialChars: true,
      requireUppercase: true,
      expiryDays: 90,
    },
    maxConcurrentSessions: 3,
    maxLoginAttempts: 5,
    lockoutDurationMinutes: 15,
    restrictConcurrentSessions: true,
    requireAdminApprovalForRoleElevation: true,
    lastPolicyUpdated: '2026-10-25T10:00:00Z',
    updatedBy: 'Alexander Vance (Super Admin)',
  },

  environment: {
    currentEnv: 'demo', // 'demo' | 'staging' | 'production'
    allowDemoReset: true,
    lastResetAt: null,
    lastResetBy: null,
  },
};

export const AVAILABLE_CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳', isPlatformDefault: true },
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', flag: '🇦🇪' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬' },
];

export const AVAILABLE_TIMEZONES = [
  { id: 'Asia/Kolkata', label: 'Asia/Kolkata (IST, UTC+05:30)', offset: '+05:30', region: 'India' },
  { id: 'UTC', label: 'UTC (Coordinated Universal Time, UTC+00:00)', offset: '+00:00', region: 'Global' },
  { id: 'Asia/Dubai', label: 'Asia/Dubai (GST, UTC+04:00)', offset: '+04:00', region: 'Middle East' },
  { id: 'Asia/Singapore', label: 'Asia/Singapore (SGT, UTC+08:00)', offset: '+08:00', region: 'Asia Pacific' },
  { id: 'Europe/London', label: 'Europe/London (GMT/BST, UTC+00:00)', offset: '+00:00', region: 'Europe' },
  { id: 'America/New_York', label: 'America/New_York (EST/EDT, UTC-05:00)', offset: '-05:00', region: 'Americas' },
  { id: 'America/Los_Angeles', label: 'America/Los_Angeles (PST/PDT, UTC-08:00)', offset: '-08:00', region: 'Americas' },
];

export const AVAILABLE_DATE_FORMATS = [
  { id: 'DD/MM/YYYY', label: 'DD/MM/YYYY (29/10/2026 — Standard Indian / UK)', example: '29/10/2026' },
  { id: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2026-10-29 — ISO 8601 Database standard)', example: '2026-10-29' },
  { id: 'MM/DD/YYYY', label: 'MM/DD/YYYY (10/29/2026 — US Standard)', example: '10/29/2026' },
  { id: 'DD MMM YYYY', label: 'DD MMM YYYY (29 Oct 2026 — Human readable)', example: '29 Oct 2026' },
];

export const AVAILABLE_NUMBER_FORMATS = [
  { id: 'en-IN', label: 'Indian Format (1,00,000.00 — Lakhs & Crores)', example: '₹12,50,000.00' },
  { id: 'en-US', label: 'International Format (100,000.00 — Thousands & Millions)', example: '₹1,250,000.00' },
  { id: 'de-DE', label: 'European Format (100.000,00 — Dot separation)', example: '1.250.000,00' },
];

export const AVAILABLE_SESSION_TIMEOUTS = [
  { value: 15, label: '15 Minutes (Strict Banking / High Security)' },
  { value: 30, label: '30 Minutes (Recommended SaaS Default)' },
  { value: 60, label: '60 Minutes (Standard Operational Shift)' },
  { value: 120, label: '120 Minutes (Extended Working Session)' },
  { value: 0, label: 'Disabled (Never Expire — High Risk)' },
];

export const DEMO_BACKUP_RECOVERY_CODES = [
  'SM-8842-1092',
  'SM-3194-8201',
  'SM-6510-4428',
  'SM-9021-7734',
  'SM-1492-5633',
  'SM-7381-2905',
];

