import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Boxes,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Building2,
  Layers,
  TrendingUp,
  Activity,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Key,
  Server,
  Users
} from 'lucide-react';

// ============================================================================
// 5 SUPER ADMIN PLATFORM OPERATIONS (Curved Arc Dataset)
// Authentic platform administrative modules — No fake claims or fake metrics
// ============================================================================
export const PLATFORM_OPERATIONS = [
  {
    id: 'network',
    title: 'Restaurant Network',
    icon: Building2,
    badge: 'Tenants & Branches',
    status: 'Multi-Tenant Isolation',
    description: 'Multi-tenant commissary routing, branch provisioning, catalog synchronization, and POS terminal management.',
    accentColor: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/50 text-emerald-300',
  },
  {
    id: 'subscriptions',
    title: 'Subscription Management',
    icon: Layers,
    badge: 'Plan Tier Engine',
    status: 'B2B SaaS Plans',
    description: 'Multi-tier subscription plans, custom module approvals, pricing engine rules, and billing intervals.',
    accentColor: 'from-teal-500/20 to-emerald-500/10 border-teal-500/50 text-teal-300',
  },
  {
    id: 'payments',
    title: 'Payment Monitoring',
    icon: TrendingUp,
    badge: 'Invoices & Ledgers',
    status: 'Settlement Gateway',
    description: 'Automated merchant payouts, dock GRN credit note offsets, invoice verification, and supplier ledger reconciliation.',
    accentColor: 'from-emerald-500/20 to-cyan-500/10 border-emerald-500/50 text-emerald-300',
  },
  {
    id: 'security',
    title: 'Platform Security',
    icon: ShieldCheck,
    badge: 'RBAC Governance',
    status: 'Role Matrix Enforced',
    description: 'Granular administrative role-based access control, session validation, user status, and immutable audit logs.',
    accentColor: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/50 text-emerald-300',
  },
  {
    id: 'health',
    title: 'System Health',
    icon: Activity,
    badge: 'Live Core Services',
    status: 'Platform Operational',
    description: 'Real-time database state replication, error boundaries, automated health probes, and activity log tracking.',
    accentColor: 'from-teal-500/20 to-emerald-500/10 border-teal-500/50 text-teal-300',
  },
];

export const SuperAdminLoginPage = ({ onSwitchToPublicLogin }) => {
  const { login } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Form states - empty defaults without hardcoded credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [authError, setAuthError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Two-Factor Authentication state
  const [twoFactorPending, setTwoFactorPending] = useState(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorError, setTwoFactorError] = useState(null);

  // 🌟 INTERACTIVE SUPER ADMIN ARC STATE 🌟
  const [activeCardIndex, setActiveCardIndex] = useState(2); // Center card (Payment Monitoring)
  const [isArcPlaying, setIsArcPlaying] = useState(true);
  const arcTimerRef = useRef(null);

  // Reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      if (mediaQuery.matches) setIsArcPlaying(false);
      const handler = (e) => {
        setPrefersReducedMotion(e.matches);
        if (e.matches) setIsArcPlaying(false);
      };
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, []);

  // Gentle automatic arc cycling
  useEffect(() => {
    if (!isArcPlaying || prefersReducedMotion) return;

    arcTimerRef.current = setInterval(() => {
      setActiveCardIndex((prev) => (prev + 1) % PLATFORM_OPERATIONS.length);
    }, 4500);

    return () => {
      if (arcTimerRef.current) clearInterval(arcTimerRef.current);
    };
  }, [isArcPlaying, prefersReducedMotion]);

  const handleSelectCard = (index) => {
    setActiveCardIndex(index);
    setIsArcPlaying(false);
    setTimeout(() => {
      if (!prefersReducedMotion) setIsArcPlaying(true);
    }, 12000);
  };

  const handlePrevCard = () => {
    setActiveCardIndex((prev) => (prev - 1 + PLATFORM_OPERATIONS.length) % PLATFORM_OPERATIONS.length);
  };

  const handleNextCard = () => {
    setActiveCardIndex((prev) => (prev + 1) % PLATFORM_OPERATIONS.length);
  };

  const activeOperation = PLATFORM_OPERATIONS[activeCardIndex];

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Administrator work email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid administrator email';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler: Authenticates strictly as Super Admin
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return;
    setAuthError(null);

    if (!validateForm()) return;

    setIsLoading(true);

    setTimeout(() => {
      // Pass requestedRole = 'super_admin' strictly to ensure zero-trust RBAC enforcement
      const result = login(email, password, 'super_admin', null, 'super_admin_console');
      setIsLoading(false);

      if (!result.success) {
        if (result.require2FA) {
          setTwoFactorPending(result.tempUser);
        } else if (result.code === 'ROLE_MISMATCH' || result.actualRole !== 'super_admin') {
          setAuthError({
            title: 'Access Restricted — Super Admin Only',
            message:
              'Access Denied: This console is strictly restricted to authorized platform Super Administrators. Your account credentials do not hold Super Admin privileges.',
          });
        } else {
          setAuthError({
            title: 'Authentication Failed',
            message: 'Invalid administrator credentials. Please verify your work email and password.',
          });
        }
      } else {
        if (result.user?.role !== 'super_admin') {
          setAuthError({
            title: 'Access Restricted',
            message: 'Access Denied: This console is strictly restricted to authorized platform Super Administrators.',
          });
          return;
        }

        if (result.user?.mustChangePassword) {
          navigate('/set-new-password');
        } else {
          navigate('/admin/dashboard', { replace: true });
        }
      }
    }, 350);
  };

  // Submit Handler for Two-Factor Verification
  const handleTwoFactorSubmit = (e) => {
    if (e) e.preventDefault();
    if (!twoFactorCode.trim()) {
      setTwoFactorError('Please enter your 6-digit verification code.');
      return;
    }
    setIsLoading(true);
    setTwoFactorError(null);

    setTimeout(() => {
      const result = login(email, password, 'super_admin', twoFactorCode, 'super_admin_console');
      setIsLoading(false);

      if (!result.success) {
        setTwoFactorError(result.error || 'Invalid authentication code. Please check and try again.');
      } else {
        if (result.user?.role !== 'super_admin') {
          setTwoFactorError('Account is not authorized for Super Admin Console.');
          return;
        }
        if (result.user?.mustChangePassword) {
          navigate('/set-new-password');
        } else {
          navigate('/admin/dashboard', { replace: true });
        }
      }
    }, 350);
  };

  return (
    <div className="min-h-screen bg-[#071510] text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 relative flex items-center justify-center p-3 sm:p-6 lg:p-8 overflow-hidden">
      {/* Ambient Forest-Green & Obsidian Lighting Background */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/6 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* 🌟 EDITORIAL FRAMED OUTER CONTAINER 🌟 */}
      <div className="relative w-full max-w-6xl rounded-[28px] sm:rounded-[36px] bg-[#071510] border border-[#1b382b]/80 shadow-2xl shadow-black/80 p-2 sm:p-3 overflow-hidden">
        {/* Inner Editorial Moss-Framed Canvas */}
        <div className="relative w-full rounded-[24px] sm:rounded-[30px] bg-gradient-to-b from-[#0b1d16] via-[#081711] to-[#071510] border border-[#1e4231]/60 p-5 sm:p-8 lg:p-10 shadow-inner">

          {/* Top Bar: Brand Identifier, Platform Mode & Navigation to Homepage */}
          <div className="flex items-center justify-between gap-3 pb-6 border-b border-[#1b382b]/70">
            {/* Left: Brand Mark & Console Name */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 shrink-0">
                <div className="w-full h-full bg-[#071510] rounded-[10px] flex items-center justify-center">
                  <Boxes className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-black tracking-tight text-white">
                    StockMate
                  </span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 tracking-wider">
                    SUPER ADMIN CONSOLE
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                  SaaS Platform Governance &amp; Multi-Tenant Control System
                </p>
              </div>
            </div>

            {/* Right: Switch to Public Login or Return to Home */}
            <div className="flex items-center gap-2.5">
              {onSwitchToPublicLogin && (
                <button
                  type="button"
                  onClick={onSwitchToPublicLogin}
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors bg-[#071510]/80 hover:bg-[#071510] px-3 py-1.5 rounded-xl border border-[#1b382b]"
                  title="Switch to Restaurant & Staff Login"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Restaurant &amp; Staff Login</span>
                </button>
              )}

              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors bg-[#071510]/80 hover:bg-[#071510] px-3 py-1.5 rounded-xl border border-[#1b382b]"
                title="Return to Public Homepage"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Return to Homepage</span>
              </Link>
            </div>
          </div>

          {/* Main Grid: Interactive Super Admin Arc (Left) & Admin Login Console (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-center mt-6 sm:mt-8">

            {/* 🌟 LEFT COLUMN (lg:col-span-6): INTERACTIVE SUPER ADMIN ARC 🌟 */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              {/* Arc Section Eyebrow */}
              <div className="flex items-center justify-between mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide">
                  <Server className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Platform Operations Arc</span>
                </div>

                {/* Arc Animation Controls */}
                <div className="flex items-center gap-1.5">
                  {!prefersReducedMotion && (
                    <button
                      onClick={() => setIsArcPlaying(!isArcPlaying)}
                      className="p-1.5 rounded-lg bg-[#071510] border border-[#1b382b] text-slate-400 hover:text-emerald-400 text-xs transition-colors"
                      title={isArcPlaying ? 'Pause Arc Drift' : 'Resume Arc Drift'}
                    >
                      {isArcPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    </button>
                  )}
                  <button
                    onClick={handlePrevCard}
                    className="p-1.5 rounded-lg bg-[#071510] border border-[#1b382b] text-slate-400 hover:text-emerald-400 text-xs transition-colors"
                    title="Previous Operation"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleNextCard}
                    className="p-1.5 rounded-lg bg-[#071510] border border-[#1b382b] text-slate-400 hover:text-emerald-400 text-xs transition-colors"
                    title="Next Operation"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 3D Arc Stage Container */}
              <div
                className="relative w-full h-[220px] sm:h-[250px] flex items-center justify-center overflow-visible my-2"
                style={{ perspective: '1000px' }}
              >
                {/* Curved Visual Guide Track */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[90%] h-[75%] rounded-full border border-emerald-500/15 border-dashed" />
                  <div className="w-40 h-40 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />
                </div>

                {/* 5 Floating Operations Cards Arranged in a 3D Arc */}
                {PLATFORM_OPERATIONS.map((op, idx) => {
                  const Icon = op.icon;
                  const offset = idx - activeCardIndex;
                  const isCenter = offset === 0;

                  // Curved 3D positioning along elliptical arc
                  const angle = offset * 24; // degrees
                  const translateX = offset * 92; // px offset horizontally
                  const translateZ = isCenter ? 40 : -Math.abs(offset) * 35; // depth
                  const scale = isCenter ? 1.08 : Math.max(0.78, 1 - Math.abs(offset) * 0.12);
                  const opacity = isCenter ? 1 : Math.max(0.4, 0.9 - Math.abs(offset) * 0.25);
                  const zIndex = isCenter ? 30 : 20 - Math.abs(offset);

                  return (
                    <div
                      key={op.id}
                      onClick={() => handleSelectCard(idx)}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelectCard(idx);
                        }
                      }}
                      className="absolute cursor-pointer transition-all duration-300 ease-out focus:outline-hidden group select-none"
                      style={{
                        transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${angle * 0.7}deg) scale(${scale})`,
                        opacity,
                        zIndex,
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      <div
                        className={`w-36 sm:w-44 p-3 rounded-2xl border transition-all duration-300 backdrop-blur-xl shadow-xl ${
                          isCenter
                            ? 'bg-[#0b1d16] border-emerald-400 ring-2 ring-emerald-500/40 shadow-emerald-950/80 shadow-2xl'
                            : 'bg-[#071510]/90 border-[#1b382b] hover:border-emerald-500/40 hover:bg-[#0b1d16]/80'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              isCenter
                                ? 'bg-emerald-500 text-slate-950 font-black'
                                : 'bg-[#071510] text-slate-400 border border-[#1b382b]'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span
                            className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded font-mono ${
                              isCenter
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-[#071510] text-slate-400 border border-[#1b382b]'
                            }`}
                          >
                            {op.badge}
                          </span>
                        </div>

                        <div className="text-xs font-bold text-white truncate leading-tight group-hover:text-emerald-300 transition-colors">
                          {op.title}
                        </div>

                        <div className="text-[10px] text-slate-400 truncate mt-1">
                          {op.status}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Active Operation Briefing Card (Focus Info Panel) */}
              <div className="mt-3 p-4 rounded-2xl bg-[#071510]/95 border border-[#1b382b] shadow-xl backdrop-blur-xl transition-all duration-300">
                <div className="flex items-start justify-between gap-3 pb-2 border-b border-[#1b382b]/70">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-black text-white uppercase tracking-wider">
                      {activeOperation.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                    {activeOperation.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mt-2.5">
                  {activeOperation.description}
                </p>
              </div>
            </div>

            {/* 🌟 RIGHT COLUMN (lg:col-span-6): SUPER ADMIN LOGIN FORM CONSOLE 🌟 */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <div className="rounded-3xl bg-[#071510]/95 border border-[#1b382b] shadow-2xl p-6 sm:p-8 relative backdrop-blur-xl">

                {/* Two-Factor Authentication Sub-Panel */}
                {twoFactorPending ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs shadow-inner">
                      <div className="flex items-center gap-2 mb-1.5 font-bold text-white text-sm">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        <span>Super Admin 2FA Enforced</span>
                      </div>
                      <p className="text-slate-300">
                        Admin: <strong className="text-white">{twoFactorPending.name}</strong> ({twoFactorPending.email})
                      </p>
                      <p className="text-slate-400 mt-1">
                        Enter your 6-digit authenticator code from your authentication app to verify platform administrative authorization.
                      </p>
                    </div>

                    {twoFactorError && (
                      <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center gap-2 animate-fadeIn">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{twoFactorError}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider font-mono">
                        6-Digit Authenticator Code
                      </label>
                      <input
                        type="text"
                        maxLength={12}
                        value={twoFactorCode}
                        onChange={(e) => {
                          setTwoFactorCode(e.target.value);
                          if (twoFactorError) setTwoFactorError(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleTwoFactorSubmit(e);
                        }}
                        placeholder="000 000"
                        className="w-full text-center font-mono tracking-widest text-xl font-black px-4 py-3 bg-[#0b1d16] border border-[#1e4231] rounded-xl text-white placeholder-slate-600 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        autoFocus
                      />
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                      <button
                        type="button"
                        onClick={handleTwoFactorSubmit}
                        disabled={isLoading}
                        className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                            <span>Verifying Credentials...</span>
                          </>
                        ) : (
                          <>
                            <Key className="w-4 h-4" />
                            <span>Verify &amp; Launch Admin Console</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setTwoFactorPending(null);
                          setTwoFactorCode('');
                          setTwoFactorError(null);
                        }}
                        className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                      >
                        Cancel &amp; Return
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Console Header */}
                    <div className="mb-6">
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#0b1d16] border border-[#1b382b] text-emerald-400 text-[10px] font-mono uppercase tracking-wider mb-2">
                        <Lock className="w-3 h-3 text-emerald-400" />
                        <span>Restricted Console</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        Super Admin Sign In
                      </h2>
                      <p className="text-slate-400 text-xs mt-1">
                        Authorized platform administrators only
                      </p>
                    </div>

                    {/* Authentication Error Banner */}
                    {authError && (
                      <div className="p-3.5 rounded-2xl mb-5 bg-rose-950/80 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2.5 shadow-md animate-fadeIn">
                        <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <strong className="block text-white font-bold">{authError.title}</strong>
                          <span className="block text-slate-300 mt-0.5 leading-relaxed">{authError.message}</span>
                        </div>
                      </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                      {/* Work Email Field */}
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider font-mono">
                          Administrator Work Email
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input
                            type="email"
                            value={email}
                            disabled={isLoading}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: null });
                            }}
                            placeholder="admin@stockmate.io"
                            className={`w-full pl-10 pr-3.5 py-2.5 bg-[#0b1d16] border rounded-xl text-xs text-white placeholder-slate-600 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 transition-all ${
                              fieldErrors.email
                                ? 'border-rose-500'
                                : 'border-[#1e4231] focus:border-emerald-500'
                            }`}
                            required
                          />
                        </div>
                        {fieldErrors.email && (
                          <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {fieldErrors.email}
                          </p>
                        )}
                      </div>

                      {/* Password Field with Show/Hide Toggle */}
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                            Password
                          </label>
                          <Link
                            to="/forgot-password"
                            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                          >
                            Forgot credentials?
                          </Link>
                        </div>
                        <div className="relative">
                          <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            disabled={isLoading}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: null });
                            }}
                            placeholder="Enter administrative password"
                            className={`w-full pl-10 pr-10 py-2.5 bg-[#0b1d16] border rounded-xl text-xs text-white placeholder-slate-600 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 transition-all ${
                              fieldErrors.password
                                ? 'border-rose-500'
                                : 'border-[#1e4231] focus:border-emerald-500'
                            }`}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                            tabIndex={-1}
                            title={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {fieldErrors.password && (
                          <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {fieldErrors.password}
                          </p>
                        )}
                      </div>

                      {/* Security Status Footnote */}
                      <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span className="flex items-center gap-1 text-slate-400">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          <span>Encrypted Session Authentication</span>
                        </span>
                        <span>Role-Based Access Control</span>
                      </div>

                      {/* Primary Submit Button */}
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-xl shadow-emerald-600/30 hover:shadow-emerald-600/40 active:scale-[0.99] flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                            <span>Authenticating Administrator...</span>
                          </div>
                        ) : (
                          <>
                            <Shield className="w-4 h-4" />
                            <span>Sign In to Admin Console</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Editorial Bottom Frame Bar: Platform Governance Info */}
          <div className="mt-8 pt-5 border-t border-[#1b382b]/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>StockMate SaaS Platform Governance System • Enterprise Administration</span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span>Audit Log: Active</span>
              <span>•</span>
              <Link to="/forgot-password" className="hover:text-emerald-400 transition-colors">
                Support &amp; Recovery
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

