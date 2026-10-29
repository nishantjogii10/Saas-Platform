import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Globe,
  Coins,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Database,
  RotateCcw,
  Save,
  Check,
  Clock,
  Lock,
  AlertTriangle,
  CheckCircle2,
  Mail,
  QrCode,
  Key,
  Copy,
  Download,
  AlertCircle,
  Calendar,
  Server,
  FileText,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { FormInput } from '../../components/common/FormInput';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import {
  AVAILABLE_CURRENCIES,
  AVAILABLE_TIMEZONES,
  AVAILABLE_DATE_FORMATS,
  AVAILABLE_NUMBER_FORMATS,
  AVAILABLE_SESSION_TIMEOUTS,
  DEMO_BACKUP_RECOVERY_CODES,
  DEFAULT_PLATFORM_SETTINGS,
} from '../../data/platformSettingsData';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';

export const PlatformSettingsPage = () => {
  const {
    currentUser,
    platformSettings,
    updatePlatformSettings,
    updateSecurityPolicy,
    resetDemoStorage,
    verifyTwoFactorCode,
    platformLogs,
    addToast,
    restaurants,
    branches,
    ingredients,
    purchaseOrders,
    invoices,
    employees,
  } = useApp();

  // Active Tab: 'general' | 'locale' | 'security' | 'storage'
  const [activeTab, setActiveTab] = useState('general');
  const samplePreviewDate = useMemo(() => new Date('2026-10-29T14:30:00Z'), []);
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  // --------------------------------------------------------------------------
  // TAB 1: GENERAL & BRANDING LOCAL STATE
  // --------------------------------------------------------------------------
  const [generalForm, setGeneralForm] = useState(() => ({
    ...(platformSettings?.general || DEFAULT_PLATFORM_SETTINGS.general),
  }));
  const [generalErrors, setGeneralErrors] = useState({});
  const [isGeneralSaving, setIsGeneralSaving] = useState(false);

  // Sync when platformSettings updates from context
  useEffect(() => {
    if (platformSettings?.general) {
      setGeneralForm({ ...platformSettings.general });
    }
  }, [platformSettings?.general]);

  const isGeneralDirty = useMemo(() => {
    return JSON.stringify(generalForm) !== JSON.stringify(platformSettings?.general || DEFAULT_PLATFORM_SETTINGS.general);
  }, [generalForm, platformSettings?.general]);

  const validateGeneralForm = () => {
    const errs = {};
    if (!generalForm.platformName?.trim()) errs.platformName = 'Platform name is required';
    if (!generalForm.officialDomain?.trim()) errs.officialDomain = 'Official domain is required';
    if (!generalForm.supportEmail?.trim()) {
      errs.supportEmail = 'Support email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(generalForm.supportEmail.trim())) {
      errs.supportEmail = 'Invalid support email address';
    }
    if (!generalForm.emailSenderAddress?.trim()) {
      errs.emailSenderAddress = 'Sender email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(generalForm.emailSenderAddress.trim())) {
      errs.emailSenderAddress = 'Invalid sender email address';
    }
    setGeneralErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveGeneral = (e) => {
    if (e) e.preventDefault();
    if (!validateGeneralForm()) {
      addToast('Please correct validation errors before saving.', 'error');
      return;
    }
    setIsGeneralSaving(true);
    setTimeout(() => {
      updatePlatformSettings({ general: generalForm }, 'General & Branding', 'Platform Name & Global Branding Updated');
      setIsGeneralSaving(false);
    }, 400);
  };

  const handleResetGeneral = () => {
    setGeneralForm({ ...(platformSettings?.general || DEFAULT_PLATFORM_SETTINGS.general) });
    setGeneralErrors({});
    addToast('General & Branding edits reverted.', 'info');
  };

  // --------------------------------------------------------------------------
  // TAB 2: CURRENCY & LOCALE LOCAL STATE
  // --------------------------------------------------------------------------
  const [localeForm, setLocaleForm] = useState(() => ({
    ...(platformSettings?.locale || DEFAULT_PLATFORM_SETTINGS.locale),
  }));
  const [isLocaleSaving, setIsLocaleSaving] = useState(false);

  useEffect(() => {
    if (platformSettings?.locale) {
      setLocaleForm({ ...platformSettings.locale });
    }
  }, [platformSettings?.locale]);

  const isLocaleDirty = useMemo(() => {
    return JSON.stringify(localeForm) !== JSON.stringify(platformSettings?.locale || DEFAULT_PLATFORM_SETTINGS.locale);
  }, [localeForm, platformSettings?.locale]);

  const handleSaveLocale = (e) => {
    if (e) e.preventDefault();
    setIsLocaleSaving(true);
    setTimeout(() => {
      // Find matching currency symbol
      const currMatch = AVAILABLE_CURRENCIES.find((c) => c.code === localeForm.defaultBillingCurrency);
      const updatedLocale = {
        ...localeForm,
        currencySymbol: currMatch?.symbol || '₹',
      };
      updatePlatformSettings({ locale: updatedLocale }, 'Currency & Locale', `Billing Currency set to ${updatedLocale.defaultBillingCurrency}`);
      setIsLocaleSaving(false);
    }, 400);
  };

  const handleResetLocale = () => {
    setLocaleForm({ ...(platformSettings?.locale || DEFAULT_PLATFORM_SETTINGS.locale) });
    addToast('Currency & Locale changes reverted.', 'info');
  };

  // --------------------------------------------------------------------------
  // TAB 3: SECURITY & 2FA STATE
  // --------------------------------------------------------------------------
  const [securityForm, setSecurityForm] = useState(() => ({
    ...(platformSettings?.security || DEFAULT_PLATFORM_SETTINGS.security),
  }));
  const [isSecuritySaving, setIsSecuritySaving] = useState(false);
  const [show2FAToggleConfirm, setShow2FAToggleConfirm] = useState(false);
  const [pending2FAValue, setPending2FAValue] = useState(null);

  // 2FA Enrollment / Secret Modal State
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showBackupCodesModal, setShowBackupCodesModal] = useState(false);
  const [testTotpCode, setTestTotpCode] = useState('');
  const [testTotpResult, setTestTotpResult] = useState(null);
  const [copiedSecret, setCopiedSecret] = useState(false);

  useEffect(() => {
    if (platformSettings?.security) {
      setSecurityForm({ ...platformSettings.security });
    }
  }, [platformSettings?.security]);

  const isSecurityDirty = useMemo(() => {
    return JSON.stringify(securityForm) !== JSON.stringify(platformSettings?.security || DEFAULT_PLATFORM_SETTINGS.security);
  }, [securityForm, platformSettings?.security]);

  const handleToggleSuperAdmin2FA = (checked) => {
    setPending2FAValue(checked);
    setShow2FAToggleConfirm(true);
  };

  const confirmToggleSuperAdmin2FA = () => {
    const updated = {
      ...securityForm,
      enforceSuperAdmin2FA: pending2FAValue,
    };
    setSecurityForm(updated);
    updateSecurityPolicy(
      { enforceSuperAdmin2FA: pending2FAValue },
      pending2FAValue
        ? 'Enforced mandatory Two-Factor Authentication for all Super Admin accounts'
        : 'Relaxed Super Admin Two-Factor Authentication enforcement'
    );
    setShow2FAToggleConfirm(false);
  };

  const handleSaveSecurityPolicies = (e) => {
    if (e) e.preventDefault();
    setIsSecuritySaving(true);
    setTimeout(() => {
      updateSecurityPolicy(securityForm, 'Platform Security & Inactivity Session Policies Updated');
      setIsSecuritySaving(false);
    }, 400);
  };

  const handleResetSecurity = () => {
    setSecurityForm({ ...(platformSettings?.security || DEFAULT_PLATFORM_SETTINGS.security) });
    addToast('Security settings reverted.', 'info');
  };

  const handleTestInactivityTimeout = () => {
    // Dispatches test event with 15-second simulation
    window.dispatchEvent(
      new CustomEvent('stockmate:test-inactivity-timeout', {
        detail: { durationMs: 15000 },
      })
    );
    addToast('Simulating inactivity: 15 seconds remaining until session expiration warning.', 'info');
  };

  const handleVerifyTestCode = () => {
    if (!testTotpCode.trim()) {
      setTestTotpResult({ success: false, message: 'Please enter a 6-digit verification code.' });
      return;
    }
    const res = verifyTwoFactorCode(testTotpCode);
    if (res.success) {
      setTestTotpResult({ success: true, message: 'Code verified successfully! Authenticator TOTP is in sync.' });
    } else {
      setTestTotpResult({ success: false, message: res.error || 'Invalid code. Try entering 123456 or a valid TOTP.' });
    }
  };

  // Recent security logs
  const recentSecurityLogs = useMemo(() => {
    return (platformLogs || [])
      .filter((l) => l.category === 'Security' || l.action.toLowerCase().includes('2fa') || l.action.toLowerCase().includes('security') || l.action.toLowerCase().includes('session'))
      .slice(0, 5);
  }, [platformLogs]);

  // --------------------------------------------------------------------------
  // TAB 4: DEMO STORAGE CONTROL STATE
  // --------------------------------------------------------------------------
  const [currentEnv, setCurrentEnv] = useState(() => platformSettings?.environment?.currentEnv || 'demo');
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetStep, setResetStep] = useState(0);

  const RESET_STEPS = [
    'Verifying Super Administrator Authorization Credentials',
    'Purging Volatile Browser Local Storage & Cache',
    'Restoring Baseline Multi-Tenant Restaurant Data',
    'Re-indexing Raw Ingredients & GRN Batch Matrix',
    'Re-establishing RBAC Role Permissions & User Credentials',
    'Recording Platform Maintenance Audit Trail',
  ];

  const handleExecuteDemoReset = () => {
    if (resetConfirmText.trim() !== 'RESET-DEMO') {
      addToast('Please type RESET-DEMO in capital letters to confirm.', 'error');
      return;
    }

    if (currentEnv === 'production') {
      resetDemoStorage(resetConfirmText, 'production');
      setShowResetModal(false);
      return;
    }

    setIsResetting(true);
    setResetStep(1);

    const stepInterval = setInterval(() => {
      setResetStep((prev) => {
        if (prev < RESET_STEPS.length) {
          return prev + 1;
        } else {
          clearInterval(stepInterval);
          setTimeout(() => {
            const res = resetDemoStorage('RESET-DEMO', 'demo');
            setIsResetting(false);
            setShowResetModal(false);
            setResetConfirmText('');
            setResetStep(0);
            if (res.success) {
              addToast('All demo datasets successfully restored to initial factory state.', 'success');
            }
          }, 600);
          return prev;
        }
      });
    }, 450);
  };

  const handleToggleEnvironmentMode = (newEnv) => {
    setCurrentEnv(newEnv);
    updatePlatformSettings(
      {
        environment: {
          ...platformSettings.environment,
          currentEnv: newEnv,
          allowDemoReset: newEnv === 'demo',
        },
      },
      'Environment Mode',
      `Platform Environment mode changed to ${newEnv.toUpperCase()}`
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <PageHeader
        title="Platform Settings & Governance"
        subtitle="Manage global application identity, billing currency defaults, enterprise multi-factor authentication, and demo storage"
        breadcrumbs={[
          { label: 'Admin', href: '#/admin/dashboard' },
          { label: 'Platform Settings' },
        ]}
        action={
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                currentEnv === 'production'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  currentEnv === 'production' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
                }`}
              ></span>
              <span>{currentEnv === 'production' ? 'PRODUCTION ENVIRONMENT' : 'DEMO SANDBOX ENVIRONMENT'}</span>
            </span>
          </div>
        }
      />

      {/* Main Tabs Navigation */}
      <div className="border-b border-slate-200/90 bg-white/70 backdrop-blur-md rounded-2xl p-1.5 shadow-2xs">
        <nav className="flex flex-wrap gap-1 sm:gap-2" aria-label="Settings Tabs">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150 ${
              activeTab === 'general'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>General &amp; Branding</span>
            {isGeneralDirty && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Unsaved changes"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('locale')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150 ${
              activeTab === 'locale'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <Coins className="w-4 h-4 text-amber-400" />
            <span>Currency &amp; Locale</span>
            {isLocaleDirty && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Unsaved changes"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150 ${
              activeTab === 'security'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Security &amp; 2FA</span>
            {securityForm.enforceSuperAdmin2FA && (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-semibold">
                MFA ON
              </span>
            )}
            {isSecurityDirty && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Unsaved changes"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('storage')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150 ${
              activeTab === 'storage'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <Database className="w-4 h-4 text-cyan-400" />
            <span>Demo Storage Control</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                currentEnv === 'production'
                  ? 'bg-rose-500/20 text-rose-300'
                  : 'bg-emerald-500/20 text-emerald-300'
              }`}
            >
              {currentEnv}
            </span>
          </button>
        </nav>
      </div>

      {/* =========================================================================
          TAB 1: GENERAL & BRANDING
         ========================================================================= */}
      {activeTab === 'general' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Dirty state banner */}
          {isGeneralDirty && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>You have unsaved changes in General &amp; Branding configuration.</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="xs" onClick={handleResetGeneral}>
                  Discard
                </Button>
                <Button variant="brand" size="xs" onClick={handleSaveGeneral} loading={isGeneralSaving} icon={Save}>
                  Save Now
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 Cols: Form */}
            <div className="lg:col-span-8 space-y-6">
              <Card>
                <CardHeader
                  title="Platform Identity & Web Domains"
                  subtitle="Configure global application naming, public domain, and helpdesk endpoints"
                  icon={Globe}
                />
                <form onSubmit={handleSaveGeneral} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInput
                      label="Platform Application Name"
                      name="platformName"
                      value={generalForm.platformName}
                      onChange={(e) => setGeneralForm({ ...generalForm, platformName: e.target.value })}
                      error={generalErrors.platformName}
                      required
                      placeholder="e.g. StockMate Multi-Tenant SaaS"
                      helperText="Displayed across the platform navigation and official notices"
                    />

                    <FormInput
                      label="Platform Tagline / Subtitle"
                      name="platformTagline"
                      value={generalForm.platformTagline}
                      onChange={(e) => setGeneralForm({ ...generalForm, platformTagline: e.target.value })}
                      placeholder="e.g. Restaurant Inventory & Kitchen OS"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInput
                      label="Official Domain Name"
                      name="officialDomain"
                      value={generalForm.officialDomain}
                      onChange={(e) => setGeneralForm({ ...generalForm, officialDomain: e.target.value })}
                      error={generalErrors.officialDomain}
                      required
                      placeholder="stockmate.io"
                    />

                    <FormInput
                      label="Application Host URL"
                      name="appUrl"
                      value={generalForm.appUrl}
                      onChange={(e) => setGeneralForm({ ...generalForm, appUrl: e.target.value })}
                      placeholder="https://app.stockmate.io"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInput
                      label="Support Helpdesk Email"
                      name="supportEmail"
                      type="email"
                      value={generalForm.supportEmail}
                      onChange={(e) => setGeneralForm({ ...generalForm, supportEmail: e.target.value })}
                      error={generalErrors.supportEmail}
                      required
                      placeholder="support@stockmate.io"
                    />

                    <FormInput
                      label="Support Phone Contact"
                      name="supportPhone"
                      value={generalForm.supportPhone}
                      onChange={(e) => setGeneralForm({ ...generalForm, supportPhone: e.target.value })}
                      placeholder="+91 80 4567 8900"
                    />
                  </div>

                  <FormInput
                    label="Customer Support Operational Hours"
                    name="supportHours"
                    value={generalForm.supportHours}
                    onChange={(e) => setGeneralForm({ ...generalForm, supportHours: e.target.value })}
                    placeholder="Monday – Saturday: 9:00 AM – 9:00 PM IST"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    <FormInput
                      label="Legal Operating Entity"
                      name="companyLegalName"
                      value={generalForm.companyLegalName}
                      onChange={(e) => setGeneralForm({ ...generalForm, companyLegalName: e.target.value })}
                      placeholder="StockMate Technologies Private Limited"
                    />

                    <FormInput
                      label="Headquarters Registered Address"
                      name="registeredAddress"
                      value={generalForm.registeredAddress}
                      onChange={(e) => setGeneralForm({ ...generalForm, registeredAddress: e.target.value })}
                      placeholder="Level 4, Tech Park Hub, Bengaluru, KA"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInput
                      label="Privacy Policy URL"
                      name="privacyPolicyUrl"
                      value={generalForm.privacyPolicyUrl}
                      onChange={(e) => setGeneralForm({ ...generalForm, privacyPolicyUrl: e.target.value })}
                      placeholder="https://stockmate.io/privacy"
                    />

                    <FormInput
                      label="Terms of Service URL"
                      name="termsOfServiceUrl"
                      value={generalForm.termsOfServiceUrl}
                      onChange={(e) => setGeneralForm({ ...generalForm, termsOfServiceUrl: e.target.value })}
                      placeholder="https://stockmate.io/terms"
                    />
                  </div>

                  {/* Tenant Registration Approval Governance */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/90 mt-2">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Require Super Admin Approval for New Tenants
                      </span>
                      <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                        When enabled, self-service restaurant signups enter a Pending Verification queue until approved by Super Admin.
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={generalForm.requireApprovalForNewTenants}
                        onChange={(e) =>
                          setGeneralForm({ ...generalForm, requireApprovalForNewTenants: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </form>
              </Card>

              {/* System Transactional Email Defaults */}
              <Card>
                <CardHeader
                  title="System-Generated Transactional Email Branding"
                  subtitle="Configure sender headers and disclaimers applied to invoices, alerts, and platform broadcasts"
                  icon={Mail}
                />
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInput
                      label="Outgoing Email Sender Name"
                      name="emailSenderName"
                      value={generalForm.emailSenderName}
                      onChange={(e) => setGeneralForm({ ...generalForm, emailSenderName: e.target.value })}
                      placeholder="StockMate Cloud Notifications"
                    />

                    <FormInput
                      label="Outgoing Email Sender Address"
                      name="emailSenderAddress"
                      type="email"
                      value={generalForm.emailSenderAddress}
                      onChange={(e) => setGeneralForm({ ...generalForm, emailSenderAddress: e.target.value })}
                      error={generalErrors.emailSenderAddress}
                      placeholder="notifications@stockmate.io"
                    />
                  </div>

                  <FormInput
                    label="System Email Footer Legal Disclaimer"
                    name="emailFooterDisclaimer"
                    type="textarea"
                    rows={2}
                    value={generalForm.emailFooterDisclaimer}
                    onChange={(e) => setGeneralForm({ ...generalForm, emailFooterDisclaimer: e.target.value })}
                    placeholder="This is an official transactional message transmitted to authorized restaurant administrators."
                  />
                </div>
              </Card>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <Button variant="outline" size="sm" onClick={handleResetGeneral} disabled={!isGeneralDirty || isGeneralSaving}>
                  Discard Changes
                </Button>
                <Button
                  variant="brand"
                  size="md"
                  onClick={handleSaveGeneral}
                  loading={isGeneralSaving}
                  disabled={!isGeneralDirty}
                  icon={Save}
                >
                  Save General Settings
                </Button>
              </div>
            </div>

            {/* Right 4 Cols: Live Preview & Tenant Isolation Guard */}
            <div className="lg:col-span-4 space-y-6">
              {/* Tenant Isolation Guard Notice */}
              <Card className="bg-emerald-50/50 border-emerald-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                      Tenant Brand Isolation Guard
                    </h4>
                    <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                      Global platform branding configures the host SaaS shell, root domain, and administrative notices.
                      Individual restaurant tenants (e.g. <strong>Spice Garden</strong>, <strong>Mango Tree</strong>)
                      maintain strictly isolated restaurant names, kitchen menus, branch logos, and operational workflows.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Live Preview Card */}
              <Card>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Live Platform Branding Preview</span>
                  <Badge label="Preview" status="active" size="xs" />
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-4 shadow-inner">
                  {/* Sidebar mockup */}
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-bold shadow-md">
                      <BoxesIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm tracking-tight text-white">
                          {generalForm.platformName || 'StockMate'}
                        </span>
                        <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                          SaaS
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">{generalForm.platformTagline || 'Restaurant Inventory OS'}</p>
                    </div>
                  </div>

                  {/* Outgoing email header preview */}
                  <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 text-[11px] space-y-1">
                    <div className="text-slate-400">
                      From:{' '}
                      <strong className="text-white">
                        {generalForm.emailSenderName || 'StockMate Cloud Notifications'}
                      </strong>{' '}
                      &lt;{generalForm.emailSenderAddress || 'notifications@stockmate.io'}&gt;
                    </div>
                    <div className="text-slate-500 text-[10px] truncate">
                      Support: {generalForm.supportEmail || 'support@stockmate.io'} • {generalForm.officialDomain}
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 text-center">
                    &copy; {currentYear} {generalForm.companyLegalName || 'StockMate Technologies Inc.'}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: CURRENCY & LOCALE
         ========================================================================= */}
      {activeTab === 'locale' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Dirty state banner */}
          {isLocaleDirty && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>You have unsaved changes in Currency &amp; Locale defaults.</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="xs" onClick={handleResetLocale}>
                  Discard
                </Button>
                <Button variant="brand" size="xs" onClick={handleSaveLocale} loading={isLocaleSaving} icon={Save}>
                  Save Now
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 Cols: Locale Configuration */}
            <div className="lg:col-span-8 space-y-6">
              <Card>
                <CardHeader
                  title="Platform Billing Currency Defaults"
                  subtitle="Configure base subscription billing currency while preserving restaurant operational pricing"
                  icon={Coins}
                />
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Default Platform Billing Currency <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {AVAILABLE_CURRENCIES.map((curr) => {
                        const isSelected = localeForm.defaultBillingCurrency === curr.code;
                        return (
                          <button
                            key={curr.code}
                            type="button"
                            onClick={() => setLocaleForm({ ...localeForm, defaultBillingCurrency: curr.code })}
                            className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                              isSelected
                                ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/20 text-emerald-950 shadow-2xs'
                                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{curr.flag}</span>
                              <div>
                                <div className="text-xs font-bold">{curr.code} ({curr.symbol})</div>
                                <div className="text-[10px] text-slate-500">{curr.name}</div>
                              </div>
                            </div>
                            {curr.isPlatformDefault && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                Default
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Multi-Currency Infrastructure Readiness Notice */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-slate-900">
                        <Coins className="w-4 h-4 text-emerald-700" />
                        <span>Multi-Currency Payment Gateway Infrastructure</span>
                      </div>
                      <Badge
                        status={localeForm.multiCurrencyBillingEnabled ? 'delivered' : 'pending'}
                        label={localeForm.multiCurrencyBillingEnabled ? 'Multi-Currency Enabled' : 'Single Currency (INR Base)'}
                        size="xs"
                      />
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      The StockMate financial ledger and subscription engine natively process settlements in <strong>INR (₹)</strong> via Razorpay / Stripe India. Multi-currency invoice rendering is supported for international enterprise partner reviews without mutating historical transaction amounts.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Timezone, Date & Number Formatting */}
              <Card>
                <CardHeader
                  title="Time Zone & Localization Formats"
                  subtitle="Configure reporting period time zones, calendar date formatting, and numerical presentation"
                  icon={Calendar}
                />
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInput
                      label="Default Platform Time Zone"
                      name="defaultTimeZone"
                      type="select"
                      value={localeForm.defaultTimeZone}
                      onChange={(e) => setLocaleForm({ ...localeForm, defaultTimeZone: e.target.value })}
                      options={AVAILABLE_TIMEZONES.map((tz) => ({
                        value: tz.id,
                        label: `${tz.label}`,
                      }))}
                      helperText="Used as default for subscription renewals, billing cycles, and daily audits"
                    />

                    <FormInput
                      label="Calendar Date Format"
                      name="dateFormat"
                      type="select"
                      value={localeForm.dateFormat}
                      onChange={(e) => setLocaleForm({ ...localeForm, dateFormat: e.target.value })}
                      options={AVAILABLE_DATE_FORMATS.map((df) => ({
                        value: df.id,
                        label: df.label,
                      }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInput
                      label="Number & Currency Digit Grouping"
                      name="numberFormat"
                      type="select"
                      value={localeForm.numberFormat}
                      onChange={(e) => setLocaleForm({ ...localeForm, numberFormat: e.target.value })}
                      options={AVAILABLE_NUMBER_FORMATS.map((nf) => ({
                        value: nf.id,
                        label: nf.label,
                      }))}
                    />

                    <FormInput
                      label="Clock Time Format"
                      name="timeFormat"
                      type="select"
                      value={localeForm.timeFormat}
                      onChange={(e) => setLocaleForm({ ...localeForm, timeFormat: e.target.value })}
                      options={[
                        { value: '12h', label: '12-Hour Clock (02:30 PM)' },
                        { value: '24h', label: '24-Hour Military Clock (14:30)' },
                      ]}
                    />
                  </div>

                  {/* Branch Timezone Override Policy */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/90 mt-2">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Allow Branch-Specific Operational Time Zones
                      </span>
                      <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                        Permit individual multi-branch outlets (e.g. Pune Central, Dubai Marina) to operate in their regional timezone for shift schedules while platform billing stays centralized.
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={localeForm.allowBranchTimeZoneOverride}
                        onChange={(e) =>
                          setLocaleForm({ ...localeForm, allowBranchTimeZoneOverride: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>
              </Card>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <Button variant="outline" size="sm" onClick={handleResetLocale} disabled={!isLocaleDirty || isLocaleSaving}>
                  Discard Changes
                </Button>
                <Button
                  variant="brand"
                  size="md"
                  onClick={handleSaveLocale}
                  loading={isLocaleSaving}
                  disabled={!isLocaleDirty}
                  icon={Save}
                >
                  Save Locale Settings
                </Button>
              </div>
            </div>

            {/* Right 4 Cols: Live Formatting Sandbox & Integrity Safe-Harbor */}
            <div className="lg:col-span-4 space-y-6">
              {/* Financial Integrity Safe-Harbor Notice */}
              <Card className="bg-sky-50/60 border-sky-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-sky-100 text-sky-800 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-sky-950 uppercase tracking-wider">
                      Financial Record Integrity
                    </h4>
                    <p className="text-xs text-sky-800 mt-1 leading-relaxed">
                      Changes to the default billing currency only affect future quotes and prospective tenant signups.
                      Existing invoices, settled supplier payments, and historical accounting ledgers remain permanently immutable in their original currency.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Interactive Live Formatting Preview Card */}
              <Card>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Live Locale Formatter Preview</span>
                  <Badge label="Dynamic Output" status="accepted" size="xs" />
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Currency Representation (Large Amount)</span>
                    <div className="font-mono text-base font-black text-slate-900">
                      {formatCurrency(1250000, {
                        currency: localeForm.defaultBillingCurrency,
                        locale: localeForm.numberFormat,
                      })}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Standard Date Output</span>
                    <div className="font-mono text-sm font-bold text-slate-800">
                      {formatDate(samplePreviewDate, {
                        format: localeForm.dateFormat,
                        timeZone: localeForm.defaultTimeZone,
                      })}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Timestamp with Time Zone</span>
                    <div className="font-mono text-xs font-medium text-slate-700">
                      {formatDateTime(samplePreviewDate, {
                        timeZone: localeForm.defaultTimeZone,
                        hour12: localeForm.timeFormat === '12h',
                      })}{' '}
                      <span className="text-emerald-700 font-bold">({localeForm.defaultTimeZone.split('/')[1] || localeForm.defaultTimeZone})</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Quantity &amp; Small Decimal Format</span>
                    <div className="font-mono text-xs font-semibold text-slate-800">
                      {formatCurrency(24.5, {
                        currency: localeForm.defaultBillingCurrency,
                        locale: localeForm.numberFormat,
                      })}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: SECURITY & 2FA
         ========================================================================= */}
      {activeTab === 'security' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Dirty state banner */}
          {isSecurityDirty && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>You have unsaved changes in Security &amp; Session policies.</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="xs" onClick={handleResetSecurity}>
                  Discard
                </Button>
                <Button variant="brand" size="xs" onClick={handleSaveSecurityPolicies} loading={isSecuritySaving} icon={Save}>
                  Save Now
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 Cols: Two-Factor Authentication & Session Policies */}
            <div className="lg:col-span-8 space-y-6">
              {/* 2FA Enforcement Card */}
              <Card>
                <CardHeader
                  title="Multi-Factor Authentication (2FA) Governance"
                  subtitle="Configure mandatory time-based one-time password (TOTP) enforcement for privileged roles"
                  icon={ShieldCheck}
                />
                <div className="space-y-4">
                  {/* Super Admin 2FA Toggle */}
                  <div className="p-4 rounded-2xl border transition-colors flex items-start justify-between gap-4 bg-slate-50/70 border-slate-200">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          Enforce Two-Factor Authentication for Super Admin Accounts
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            securityForm.enforceSuperAdmin2FA
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {securityForm.enforceSuperAdmin2FA ? 'ENFORCED' : 'OPTIONAL'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        When enabled, all Super Administrator sign-ins strictly require an authenticator app TOTP code or emergency recovery code. Direct route access without 2FA verification is rejected.
                      </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                      <input
                        type="checkbox"
                        checked={securityForm.enforceSuperAdmin2FA}
                        onChange={(e) => handleToggleSuperAdmin2FA(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-12 h-6.5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-700"></div>
                    </label>
                  </div>

                  {/* Restaurant Owner 2FA Policy */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <FormInput
                      label="Restaurant Owner 2FA Policy"
                      name="owner2FARequirement"
                      type="select"
                      value={securityForm.owner2FARequirement}
                      onChange={(e) => setSecurityForm({ ...securityForm, owner2FARequirement: e.target.value })}
                      options={[
                        { value: 'optional', label: 'Optional (Configured per restaurant)' },
                        { value: 'recommended', label: 'Recommended (Prompt on onboarding)' },
                        { value: 'enforced', label: 'Strictly Enforced (Mandatory on login)' },
                      ]}
                      helperText="Controls 2FA requirements across tenant administrative logins"
                    />

                    {/* Inactive Session Expiration Policy */}
                    <FormInput
                      label="Inactive Session Expiration Timeout"
                      name="sessionTimeoutMinutes"
                      type="select"
                      value={securityForm.sessionTimeoutMinutes}
                      onChange={(e) => setSecurityForm({ ...securityForm, sessionTimeoutMinutes: Number(e.target.value) })}
                      options={AVAILABLE_SESSION_TIMEOUTS}
                      helperText="Sessions idle longer than this limit are gracefully terminated"
                    />
                  </div>

                  {/* Interactive Inactivity Test Trigger */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/90 text-xs">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                      <div>
                        <span className="font-bold text-amber-950 block">Verify Inactivity Expiration Behavior</span>
                        <span className="text-[11px] text-amber-800">Trigger a 15-second simulation to test the inactivity warning and graceful logout flow.</span>
                      </div>
                    </div>
                    <Button variant="outline" size="xs" onClick={handleTestInactivityTimeout} className="shrink-0 bg-white">
                      Test 15s Timeout
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Password & Access Governance */}
              <Card>
                <CardHeader
                  title="Password Complexity & Session Controls"
                  subtitle="Enterprise password strength requirements and concurrent login policies"
                  icon={Lock}
                />
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormInput
                      label="Min Password Length"
                      name="minLength"
                      type="number"
                      min={8}
                      max={24}
                      value={securityForm.passwordPolicy.minLength}
                      onChange={(e) =>
                        setSecurityForm({
                          ...securityForm,
                          passwordPolicy: { ...securityForm.passwordPolicy, minLength: Number(e.target.value) },
                        })
                      }
                    />

                    <FormInput
                      label="Password Expiry Rotation"
                      name="expiryDays"
                      type="select"
                      value={securityForm.passwordPolicy.expiryDays}
                      onChange={(e) =>
                        setSecurityForm({
                          ...securityForm,
                          passwordPolicy: { ...securityForm.passwordPolicy, expiryDays: Number(e.target.value) },
                        })
                      }
                      options={[
                        { value: 30, label: '30 Days (Strict)' },
                        { value: 60, label: '60 Days' },
                        { value: 90, label: '90 Days (Recommended)' },
                        { value: 180, label: '180 Days' },
                        { value: 0, label: 'Never Expire' },
                      ]}
                    />

                    <FormInput
                      label="Max Concurrent Sessions"
                      name="maxConcurrentSessions"
                      type="select"
                      value={securityForm.maxConcurrentSessions}
                      onChange={(e) =>
                        setSecurityForm({ ...securityForm, maxConcurrentSessions: Number(e.target.value) })
                      }
                      options={[
                        { value: 1, label: '1 Session Only' },
                        { value: 3, label: '3 Active Devices' },
                        { value: 5, label: '5 Active Devices' },
                        { value: 0, label: 'Unlimited' },
                      ]}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={securityForm.passwordPolicy.requireNumbers}
                        onChange={(e) =>
                          setSecurityForm({
                            ...securityForm,
                            passwordPolicy: { ...securityForm.passwordPolicy, requireNumbers: e.target.checked },
                          })
                        }
                        className="rounded text-emerald-800 h-4 w-4"
                      />
                      <span>Require Numbers (0-9)</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={securityForm.passwordPolicy.requireSpecialChars}
                        onChange={(e) =>
                          setSecurityForm({
                            ...securityForm,
                            passwordPolicy: { ...securityForm.passwordPolicy, requireSpecialChars: e.target.checked },
                          })
                        }
                        className="rounded text-emerald-800 h-4 w-4"
                      />
                      <span>Require Special Characters</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={securityForm.passwordPolicy.requireUppercase}
                        onChange={(e) =>
                          setSecurityForm({
                            ...securityForm,
                            passwordPolicy: { ...securityForm.passwordPolicy, requireUppercase: e.target.checked },
                          })
                        }
                        className="rounded text-emerald-800 h-4 w-4"
                      />
                      <span>Require Uppercase Letters</span>
                    </label>
                  </div>
                </div>
              </Card>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <Button variant="outline" size="sm" onClick={handleResetSecurity} disabled={!isSecurityDirty || isSecuritySaving}>
                  Discard Changes
                </Button>
                <Button
                  variant="brand"
                  size="md"
                  onClick={handleSaveSecurityPolicies}
                  loading={isSecuritySaving}
                  disabled={!isSecurityDirty}
                  icon={Save}
                >
                  Save Security Policies
                </Button>
              </div>
            </div>

            {/* Right 4 Cols: 2FA Enrollment & Security Audit Log */}
            <div className="lg:col-span-4 space-y-6">
              {/* Authenticator App Enrollment Card */}
              <Card>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Super Admin 2FA Token</span>
                  <Badge label="Enrolled" status="delivered" size="xs" />
                </div>

                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-slate-900 text-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 uppercase font-mono">Protected Account</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">
                        TOTP RFC 6238
                      </span>
                    </div>
                    <div className="font-bold text-xs truncate">{currentUser?.name || 'Alexander Vance'}</div>
                    <div className="text-[11px] text-slate-400 truncate">{currentUser?.email || 'admin@stockmate.io'}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShow2FAModal(true)} icon={QrCode}>
                      View QR &amp; Key
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowBackupCodesModal(true)} icon={Key}>
                      Backup Codes
                    </Button>
                  </div>

                  {/* Quick Code Test Tool */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Test Authenticator Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={12}
                        value={testTotpCode}
                        onChange={(e) => {
                          setTestTotpCode(e.target.value);
                          if (testTotpResult) setTestTotpResult(null);
                        }}
                        placeholder="e.g. 123456"
                        className="w-full font-mono text-center px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold tracking-widest focus:outline-hidden focus:border-emerald-600"
                      />
                      <Button variant="brand" size="xs" onClick={handleVerifyTestCode}>
                        Verify
                      </Button>
                    </div>
                    {testTotpResult && (
                      <div
                        className={`p-2 rounded-lg text-[11px] font-medium flex items-center gap-1.5 ${
                          testTotpResult.success
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {testTotpResult.success ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        )}
                        <span>{testTotpResult.message}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Security Policy Audit Log Card */}
              <Card>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Recent Security Audits</span>
                  <Shield className="w-4 h-4 text-slate-400" />
                </div>
                {recentSecurityLogs.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">No recent security events logged.</p>
                ) : (
                  <div className="space-y-3">
                    {recentSecurityLogs.map((log) => (
                      <div key={log.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span className="truncate pr-2">{log.action}</span>
                          <span className="text-[10px] text-slate-400 shrink-0 font-normal">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                          Actor: {log.actor} • {log.target}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Architecture & Backend Integration Notice */}
              <Card className="bg-slate-900 text-white border-slate-800">
                <div className="flex items-start gap-2.5">
                  <Server className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-white tracking-wide">
                      Production Auth Architecture Note
                    </h5>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      Two-factor verification and session limits are enforced by StockMate’s RBAC guard layer. For production cluster environments with external auth providers (Auth0, AWS Cognito), TOTP validation uses RFC 6238 HMAC-SHA1 secrets encrypted in AWS KMS with token revocation tracked via Redis session stores.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: DEMO STORAGE CONTROL
         ========================================================================= */}
      {activeTab === 'storage' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Environment Status & Simulation Switcher Card */}
          <Card className={currentEnv === 'production' ? 'bg-rose-50/40 border-rose-200' : 'bg-slate-50 border-slate-200'}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-2xl ${
                    currentEnv === 'production' ? 'bg-rose-600 text-white' : 'bg-emerald-700 text-white'
                  }`}
                >
                  {currentEnv === 'production' ? <Lock className="w-6 h-6" /> : <Database className="w-6 h-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      {currentEnv === 'production' ? 'Production Customer Database' : 'Demo Demonstration Sandbox'}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        currentEnv === 'production'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {currentEnv.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    {currentEnv === 'production'
                      ? 'Live customer records, invoices, orders, and subscriptions are strictly immutable.'
                      : 'Sandboxed environment for product demonstrations, workflow testing, and evaluation.'}
                  </p>
                </div>
              </div>

              {/* Environment Toggle for Demonstration Testing */}
              <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shrink-0">
                <span className="text-[11px] font-bold text-slate-500 pl-2">Mode:</span>
                <button
                  type="button"
                  onClick={() => handleToggleEnvironmentMode('demo')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    currentEnv === 'demo' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Demo Sandbox
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleEnvironmentMode('production')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    currentEnv === 'production'
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Production Lock
                </button>
              </div>
            </div>
          </Card>

          {/* Critical Production Protection Alert (Shown when Production is active) */}
          {currentEnv === 'production' ? (
            <Card className="bg-rose-950 text-white border-rose-800">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-rose-900 text-rose-300 shrink-0 mt-0.5">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-white tracking-wide">
                    CRITICAL DATA LOSS PREVENTION — RESTORATION LOCKED
                  </h4>
                  <p className="text-xs text-rose-200 leading-relaxed">
                    Demo storage reset operations are strictly blocked by the application security layer when the environment is set to <strong>Production</strong>. Tenant inventory movements, purchase orders, customer subscriptions, GST tax invoices, and employee attendance logs are immutable and protected against accidental truncation or mass deletion.
                  </p>
                  <div className="pt-2 flex items-center gap-2 text-[11px] text-rose-300">
                    <Lock className="w-4 h-4" />
                    <span>Reset endpoints return 403 Forbidden on production databases. Switch to Demo Sandbox above to evaluate data restoration workflows.</span>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            /* Demo Sandbox Storage Details */
            <div className="space-y-6">
              {/* Storage Inventory Breakdown Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Tenants</span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">{restaurants?.length || 4}</span>
                  <span className="text-[10px] text-slate-500">Spice Garden, Mango Tree...</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Outlets &amp; Branches</span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">{branches?.length || 12}</span>
                  <span className="text-[10px] text-slate-500">Pune, Mumbai, Bengaluru</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Inventory SKUs</span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">{ingredients?.length || 48}</span>
                  <span className="text-[10px] text-slate-500">Produce, Dairy, Spices</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Orders &amp; GRNs</span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">{purchaseOrders?.length || 24}</span>
                  <span className="text-[10px] text-slate-500">Verified deliveries</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Staff &amp; Workforce</span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">{employees?.length || 35}</span>
                  <span className="text-[10px] text-slate-500">Kitchen &amp; Manager staff</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Invoices &amp; Ledgers</span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">{invoices?.length || 52}</span>
                  <span className="text-[10px] text-slate-500">Tax invoices &amp; receipts</span>
                </div>
              </div>

              {/* Reset Action Card */}
              <Card>
                <CardHeader
                  title="Demo Baseline Dataset Restoration"
                  subtitle="Restore pristine seed data for customer trials and feature evaluations"
                  icon={RotateCcw}
                />
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                    <h5 className="font-bold text-slate-900">What will be restored:</h5>
                    <ul className="list-disc pl-5 space-y-1 text-slate-600">
                      <li>Clears test inventory items, purchase orders, and stock movements created during live trials.</li>
                      <li>Restores baseline catalog items (Paneer, Basmati, Spices, Dairy) with initial stock levels.</li>
                      <li>Rebuilds verified demo restaurants (Spice Garden, Mango Tree, Saffron Bistro) and their sample branches.</li>
                      <li>Resets employee shifts, attendance records, and leave requests back to factory seed dataset.</li>
                      <li>Logs an authorized maintenance entry in the Super Admin activity trail with your identity.</li>
                    </ul>
                  </div>

                  {platformSettings?.environment?.lastResetAt && (
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Last baseline reset: {new Date(platformSettings.environment.lastResetAt).toLocaleString()} by{' '}
                        <strong>{platformSettings.environment.lastResetBy || 'Super Admin'}</strong>
                      </span>
                    </div>
                  )}

                  <div className="pt-2">
                    <Button
                      variant="danger"
                      size="md"
                      onClick={() => setShowResetModal(true)}
                      icon={RotateCcw}
                    >
                      Restore Demo Baseline Dataset
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODALS & DIALOGS
         ========================================================================= */}

      {/* 1. 2FA Toggle Confirmation Modal */}
      <ConfirmModal
        isOpen={show2FAToggleConfirm}
        onClose={() => setShow2FAToggleConfirm(false)}
        onConfirm={confirmToggleSuperAdmin2FA}
        title={pending2FAValue ? 'Enforce Super Admin Two-Factor Authentication?' : 'Disable Super Admin Two-Factor Enforcement?'}
        message={
          pending2FAValue
            ? 'Enforcing 2FA will require all Super Administrator accounts to enter a 6-digit TOTP authenticator code upon signing in. Ensure you have your authenticator app or backup codes accessible.'
            : 'Relaxing 2FA policy allows Super Administrators to authenticate using only their password. This decreases protection against compromised credentials.'
        }
        confirmText={pending2FAValue ? 'Enforce 2FA' : 'Disable 2FA'}
        type={pending2FAValue ? 'warning' : 'danger'}
      />

      {/* 2. Super Admin 2FA QR Code & Secret Modal */}
      <Modal
        isOpen={show2FAModal}
        onClose={() => setShow2FAModal(false)}
        title="Super Admin Two-Factor Authenticator Setup"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-center">
          <p className="text-xs text-slate-500">
            Scan the QR code with your authenticator app (Google Authenticator, Authy, Microsoft Authenticator) or enter the secret key manually.
          </p>

          {/* Simulated QR Code Canvas */}
          <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl border-2 border-dashed border-emerald-500/60 shadow-inner flex flex-col items-center justify-center">
            <div className="grid grid-cols-6 gap-1 p-2 bg-slate-950 rounded-xl">
              {[...Array(36)].map((_, i) => (
                <div
                  key={i}
                  className={`w-3.5 h-3.5 rounded-xs ${
                    i % 2 === 0 || i % 7 === 0 || i % 5 === 0 ? 'bg-emerald-400' : 'bg-slate-900'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] font-mono text-slate-400 mt-2 font-bold uppercase">StockMate Authenticator</span>
          </div>

          <div className="text-left bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Manual Account Secret Key</span>
            <div className="flex items-center justify-between font-mono text-xs font-bold text-slate-800">
              <span>JBSW Y3DP EHPK 3PXP</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText('JBSWY3DPEHPK3PXP');
                  setCopiedSecret(true);
                  setTimeout(() => setCopiedSecret(false), 2000);
                }}
                className="text-emerald-700 hover:text-emerald-900 p-1"
                title="Copy Key"
              >
                {copiedSecret ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="text-left text-[11px] text-slate-500 space-y-1">
            <div>• Algorithm: <strong>HMAC-SHA1 (RFC 6238)</strong></div>
            <div>• Period: <strong>30 seconds</strong></div>
            <div>• Digits: <strong>6 digits</strong></div>
          </div>
        </div>
      </Modal>

      {/* 3. Backup Recovery Codes Modal */}
      <Modal
        isOpen={showBackupCodesModal}
        onClose={() => setShowBackupCodesModal(false)}
        title="Super Admin Backup Recovery Codes"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Store these emergency backup codes in a secure password manager. Each code can be used once if you lose access to your authenticator device.
          </p>

          <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs font-bold text-slate-800 text-center">
            {DEMO_BACKUP_RECOVERY_CODES.map((code, idx) => (
              <div key={idx} className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
                {code}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="xs"
              onClick={() => {
                navigator.clipboard.writeText(DEMO_BACKUP_RECOVERY_CODES.join('\n'));
                addToast('Emergency recovery codes copied to clipboard.', 'success');
              }}
              icon={Copy}
            >
              Copy All Codes
            </Button>
            <Button
              variant="secondary"
              size="xs"
              onClick={() => {
                const blob = new Blob([DEMO_BACKUP_RECOVERY_CODES.join('\n')], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `StockMate_Recovery_Codes_${Date.now()}.txt`;
                a.click();
                URL.revokeObjectURL(url);
                addToast('Recovery codes downloaded.', 'success');
              }}
              icon={Download}
            >
              Download (.txt)
            </Button>
          </div>
        </div>
      </Modal>

      {/* 4. Demo Reset Two-Step Confirmation Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => {
          if (!isResetting) setShowResetModal(false);
        }}
        title="Confirm Demo Baseline Dataset Restoration"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block">Important Confirmation Required</span>
              <p className="text-rose-800 leading-relaxed">
                This action will reset demo restaurants, ingredients catalog, purchase orders, and attendance records back to pristine factory baseline. Test modifications made during demonstration sessions will be replaced.
              </p>
            </div>
          </div>

          {isResetting ? (
            <div className="space-y-3 py-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Restoring Demo Environment...</span>
                <span className="font-mono text-emerald-700">
                  Step {resetStep} of {RESET_STEPS.length}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${(resetStep / RESET_STEPS.length) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-500 font-medium animate-pulse text-center pt-2">
                {RESET_STEPS[resetStep - 1] || 'Finalizing...'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Type <span className="font-mono text-rose-600 select-all font-black">RESET-DEMO</span> to confirm:
              </label>
              <input
                type="text"
                value={resetConfirmText}
                onChange={(e) => setResetConfirmText(e.target.value)}
                placeholder="RESET-DEMO"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-hidden focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20"
                autoFocus
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="secondary" size="sm" onClick={() => setShowResetModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleExecuteDemoReset}
                  disabled={resetConfirmText.trim() !== 'RESET-DEMO'}
                  icon={RotateCcw}
                >
                  Confirm &amp; Restore Baseline
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

// Simple Boxes Icon SVG for sidebar live preview
const BoxesIcon = ({ className = 'w-5 h-5' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
    <path d="m3.3 7 8.7 5 8.7-5"></path>
    <path d="M12 22V12"></path>
  </svg>
);
