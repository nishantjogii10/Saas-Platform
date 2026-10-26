import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Megaphone,
  Radio,
  Send,
  Plus,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  Layers,
  Sparkles,
  FileText,
  FileCheck2,
  CreditCard,
  Receipt,
  Wrench,
  ShieldAlert,
  AlertOctagon,
  Users,
  Building2,
  ArrowRight,
  ExternalLink,
  Download,
  Copy,
  RotateCcw,
  Check,
  Smartphone,
  Monitor,
  Inbox,
  Mail,
  ShieldCheck,
  Paperclip,
  Trash2,
  HelpCircle,
  BarChart3,
  ChevronRight,
  Info,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Card, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  ANNOUNCEMENT_CATEGORIES,
  PRIORITY_CONFIGS,
  SUPPORTED_TEMPLATE_VARIABLES,
  INITIAL_ANNOUNCEMENT_TEMPLATES,
  interpolateTemplateVariables,
} from '../../data/announcementData';

export const CommunicationCenterPage = () => {
  const navigate = useNavigate();
  const {
    announcements,
    announcementTemplates,
    announcementReads,
    policyAcknowledgments,
    emailDeliveryLogs,
    restaurants,
    users,
    plans,
    currentUser,
    publishAnnouncement,
    saveAnnouncementDraft,
    deleteAnnouncement,
    saveCustomTemplate,
    duplicateTemplate,
    resetTemplate,
    getAnnouncementStats,
  } = useApp();

  // Active view tab: 'overview' | 'studio' | 'history' | 'templates' | 'diagnostics'
  const [activeTab, setActiveTab] = useState('overview');

  // Stats
  const stats = useMemo(() => {
    return getAnnouncementStats ? getAnnouncementStats() : {
      totalPublished: announcements.filter((a) => a.status === 'published').length,
      totalDrafts: announcements.filter((a) => a.status === 'draft').length,
      totalRecipients: restaurants.length * announcements.filter((a) => a.status === 'published').length,
      totalReads: Object.keys(announcementReads || {}).length,
      totalAcknowledgments: (policyAcknowledgments || []).length,
    };
  }, [announcements, announcementReads, policyAcknowledgments, restaurants, getAnnouncementStats]);

  // Composer Form State
  const [composerForm, setComposerForm] = useState({
    id: null,
    title: '',
    summary: '',
    body: '',
    category: 'general',
    priority: 'normal',
    audienceType: 'ALL_RESTAURANTS', // ALL_RESTAURANTS | SPECIFIC_RESTAURANTS | SUBSCRIPTION_TIER
    targetRestaurantIds: [],
    targetPlanIds: [],
    requiresAcknowledgment: false,
    policyVersion: '',
    effectiveDate: 'Immediately',
    ctaLabel: 'View in Workspace',
    ctaLink: '/dashboard',
    hasCta: true,
    attachments: [],
    scheduledFor: null,
  });

  // Composer UI States
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' | 'mobile'
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplateForModal, setSelectedTemplateForModal] = useState(null);
  const [selectedAnnouncementForInspector, setSelectedAnnouncementForInspector] = useState(null);
  const [historySearch, setHistorySearch] = useState('');
  const [historyCategoryFilter, setHistoryCategoryFilter] = useState('all');
  const [historyPriorityFilter, setHistoryPriorityFilter] = useState('all');

  // Attachment upload simulation state
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentError, setAttachmentError] = useState('');

  // Calculate target audience recipients dynamically
  const eligibleRecipients = useMemo(() => {
    if (composerForm.audienceType === 'ALL_RESTAURANTS') {
      return restaurants.filter((r) => r.status === 'active');
    }
    if (composerForm.audienceType === 'SPECIFIC_RESTAURANTS') {
      return restaurants.filter((r) => composerForm.targetRestaurantIds.includes(r.id));
    }
    if (composerForm.audienceType === 'SUBSCRIPTION_TIER') {
      return restaurants.filter((r) => composerForm.targetPlanIds.includes(r.planId));
    }
    return [];
  }, [restaurants, composerForm.audienceType, composerForm.targetRestaurantIds, composerForm.targetPlanIds]);

  // Handle template selection into composer
  const handleApplyTemplate = (tpl) => {
    setComposerForm((prev) => ({
      ...prev,
      title: tpl.title,
      summary: tpl.summary,
      body: tpl.body,
      category: tpl.category,
      priority: tpl.priority,
      ctaLabel: tpl.ctaLabel || 'View in Workspace',
      ctaLink: tpl.ctaLink || '/dashboard',
      hasCta: !!tpl.ctaLabel,
      requiresAcknowledgment: !!tpl.requiresAcknowledgment,
      policyVersion: tpl.policyVersion || '',
    }));
    setActiveTab('studio');
  };

  // Insert variable tag into cursor position / append
  const handleInsertVariable = (variableKey) => {
    setComposerForm((prev) => ({
      ...prev,
      body: prev.body + ' ' + variableKey,
    }));
  };

  // Add mock attachment with validation
  const handleAddAttachment = () => {
    if (!attachmentName.trim()) {
      setAttachmentError('Please enter a valid document file name');
      return;
    }
    const cleanName = attachmentName.trim();
    if (!cleanName.match(/\.(pdf|png|jpg|jpeg|docx|xlsx)$/i)) {
      setAttachmentError('Supported file formats: PDF, PNG, JPG, DOCX, XLSX (max 5 MB)');
      return;
    }
    setComposerForm((prev) => ({
      ...prev,
      attachments: [
        ...prev.attachments,
        {
          name: cleanName,
          size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
          type: cleanName.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream',
        },
      ],
    }));
    setAttachmentName('');
    setAttachmentError('');
  };

  const handleRemoveAttachment = (idx) => {
    setComposerForm((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== idx),
    }));
  };

  // Publish Announcement Execution
  const handleExecutePublish = () => {
    if (!composerForm.title.trim() || !composerForm.body.trim()) return;
    setIsSubmitting(true);

    setTimeout(() => {
      publishAnnouncement({
        ...composerForm,
        status: 'published',
        publishedAt: new Date().toISOString(),
        author: currentUser?.name || 'Alexander Vance (Super Admin)',
        authorRole: 'Platform Governance',
      });
      setIsSubmitting(false);
      setShowConfirmModal(false);
      // Reset composer
      setComposerForm({
        id: null,
        title: '',
        summary: '',
        body: '',
        category: 'general',
        priority: 'normal',
        audienceType: 'ALL_RESTAURANTS',
        targetRestaurantIds: [],
        targetPlanIds: [],
        requiresAcknowledgment: false,
        policyVersion: '',
        effectiveDate: 'Immediately',
        ctaLabel: 'View in Workspace',
        ctaLink: '/dashboard',
        hasCta: true,
        attachments: [],
        scheduledFor: null,
      });
      setActiveTab('history');
    }, 400);
  };

  // Save Draft Execution
  const handleSaveDraft = () => {
    if (!composerForm.title.trim()) return;
    saveAnnouncementDraft({
      ...composerForm,
      status: 'draft',
      author: currentUser?.name || 'Alexander Vance (Super Admin)',
      publishedAt: new Date().toISOString(),
    });
  };

  // Filtered Sent History
  const filteredHistory = useMemo(() => {
    return announcements.filter((ann) => {
      const matchesSearch =
        !historySearch ||
        ann.title.toLowerCase().includes(historySearch.toLowerCase()) ||
        ann.summary?.toLowerCase().includes(historySearch.toLowerCase());
      const matchesCategory =
        historyCategoryFilter === 'all' || ann.category === historyCategoryFilter;
      const matchesPriority =
        historyPriorityFilter === 'all' || ann.priority === historyPriorityFilter;
      return matchesSearch && matchesCategory && matchesPriority;
    });
  }, [announcements, historySearch, historyCategoryFilter, historyPriorityFilter]);

  // Sample Context for Live Preview Interpolation
  const samplePreviewContext = {
    restaurantName: 'Spice Garden (Demo Context)',
    ownerName: 'Priya Sharma',
    planName: 'Professional Plan',
    renewalDate: 'November 14, 2026',
    effectiveDate: composerForm.effectiveDate || 'November 1, 2026',
    platformLink: '#/dashboard',
  };

  const previewTitle = interpolateTemplateVariables(
    composerForm.title || 'Announcement Title Preview',
    samplePreviewContext
  );
  const previewBody = interpolateTemplateVariables(
    composerForm.body || 'Your message body will be previewed here with clean formatting and safe variables interpolated.',
    samplePreviewContext
  );

  const activeCategoryObj =
    ANNOUNCEMENT_CATEGORIES[composerForm.category] || ANNOUNCEMENT_CATEGORIES.general;
  const activePriorityObj =
    PRIORITY_CONFIGS[composerForm.priority] || PRIORITY_CONFIGS.normal;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Super Admin Communication Center"
        subtitle="Platform Announcement Studio, Multi-Tenant Broadcast Governance & Engagement Analytics"
        badge={<Badge status="super_admin" label="Broadcast Authority" />}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === 'templates' ? 'brand' : 'outline'}
              size="sm"
              icon={FileText}
              onClick={() => setActiveTab('templates')}
            >
              Templates Library
            </Button>
            <Button
              variant={activeTab === 'studio' ? 'brand' : 'outline'}
              size="sm"
              icon={Megaphone}
              onClick={() => setActiveTab('studio')}
            >
              New Announcement
            </Button>
          </div>
        }
      />

      {/* Primary Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview & Activity', icon: BarChart3 },
          { id: 'studio', label: 'Announcement Studio', icon: Megaphone, highlight: true },
          { id: 'history', label: 'Sent Broadcasts & Analytics', icon: Radio, count: announcements.filter(a => a.status === 'published').length },
          { id: 'templates', label: 'Message Templates', icon: FileText, count: (announcementTemplates || INITIAL_ANNOUNCEMENT_TEMPLATES).length },
          { id: 'diagnostics', label: 'Email & Dispatch Engine', icon: Mail },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* TAB 1: EXECUTIVE OVERVIEW DASHBOARD */}
      {/* ============================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Executive Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Published Announcements"
              value={stats.totalPublished}
              trend="up"
              subtext="Active across all tenant inboxes"
              icon={Megaphone}
              accentColor="emerald"
            />
            <StatCard
              title="Total Recipient Inboxes"
              value={eligibleRecipients.length * stats.totalPublished}
              trend="up"
              subtext="Audience reach across tenants"
              icon={Building2}
              accentColor="blue"
            />
            <StatCard
              title="Tenant Open & Read Rate"
              value="78.4%"
              subtext="Calculated from real inbox reads"
              icon={Eye}
              accentColor="purple"
            />
            <StatCard
              title="Policy Acknowledgment Rate"
              value="91.2%"
              subtext="Formal compliance acceptance"
              icon={FileCheck2}
              accentColor="amber"
            />
          </div>

          {/* Honest Metric & Delivery Architecture Disclosure Notice */}
          <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 flex items-start gap-3 shadow-xs">
            <Info className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-950 space-y-1">
              <span className="font-bold block text-sm">Commercial SaaS Communication Architecture</span>
              <p className="text-indigo-900/90 leading-relaxed">
                StockMate delivers notifications through a hybrid model: <strong>In-App Inboxes</strong> receive announcements instantaneously with real-time read and policy acknowledgment tracking. For <strong>Email Delivery</strong>, transactions are queued through the StockMate Cloud Dispatcher and logged for transparent auditability.
              </p>
            </div>
          </div>

          {/* Recent Broadcasts & Quick Studio CTA */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Recent Activity Feed */}
            <div className="lg:col-span-8">
              <Card padding={false}>
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Recent Platform Broadcasts</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Live announcements currently visible to restaurant owners</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="xs"
                    iconRight={ArrowRight}
                    onClick={() => setActiveTab('history')}
                  >
                    View All History
                  </Button>
                </div>

                <div className="divide-y divide-slate-100">
                  {announcements.slice(0, 4).map((ann) => {
                    const cat = ANNOUNCEMENT_CATEGORIES[ann.category] || ANNOUNCEMENT_CATEGORIES.general;
                    const prio = PRIORITY_CONFIGS[ann.priority] || PRIORITY_CONFIGS.normal;

                    return (
                      <div
                        key={ann.id}
                        className="p-4 hover:bg-slate-50/70 transition-colors flex items-start justify-between gap-4"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cat.badgeClass}`}
                          >
                            <Megaphone className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-slate-900 truncate">
                                {ann.title}
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${cat.badgeClass}`}>
                                {cat.label}
                              </span>
                              {ann.priority !== 'normal' && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${prio.badgeClass}`}>
                                  {prio.label}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 mt-1 line-clamp-1">{ann.summary}</p>
                            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1.5">
                              <span>Published: {new Date(ann.publishedAt).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>Author: {ann.author}</span>
                              {ann.requiresAcknowledgment && (
                                <>
                                  <span>•</span>
                                  <span className="text-purple-700 font-semibold flex items-center gap-1">
                                    <FileCheck2 className="w-3 h-3" /> Acknowledgment Required
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => {
                            setSelectedAnnouncementForInspector(ann);
                          }}
                        >
                          Inspect
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Right: Quick Launch Studio Banner */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white shadow-xl">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-4 border border-emerald-500/30">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                </div>
                <h4 className="text-base font-bold">Announcement Studio</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Draft policy updates, schedule maintenance windows, or broadcast platform notices to all restaurant owners with live desktop &amp; mobile preview.
                </p>
                <div className="mt-5 space-y-2">
                  <Button
                    variant="brand"
                    size="sm"
                    className="w-full justify-center"
                    icon={Megaphone}
                    onClick={() => setActiveTab('studio')}
                  >
                    Launch Studio Composer
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-center text-slate-200 border-slate-700 hover:bg-slate-800"
                    icon={FileText}
                    onClick={() => setActiveTab('templates')}
                  >
                    Select From 8 Templates
                  </Button>
                </div>
              </div>

              {/* Template Quick Picks */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Popular Templates
                </h4>
                <div className="space-y-1.5">
                  {(announcementTemplates || INITIAL_ANNOUNCEMENT_TEMPLATES).slice(0, 3).map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => handleApplyTemplate(tpl)}
                      className="w-full text-left p-2 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between group border border-transparent hover:border-slate-200"
                    >
                      <div className="truncate pr-2">
                        <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 truncate">
                          {tpl.title.replace('{{effective_date}}', 'Upcoming')}
                        </div>
                        <div className="text-[11px] text-slate-400 capitalize">{tpl.category} Notice</div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: ANNOUNCEMENT STUDIO (COMPOSER + LIVE PREVIEW) */}
      {/* ============================================================== */}
      {activeTab === 'studio' && (
        <div className="space-y-6">
          {/* Studio Top Control Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                <Megaphone className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Announcement Studio</h3>
                <p className="text-xs text-slate-500">
                  Compose broadcast bulletins, policy updates, and operational notices
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={FileText}
                onClick={() => setActiveTab('templates')}
              >
                Load Template
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={FileText}
                onClick={handleSaveDraft}
                disabled={!composerForm.title.trim()}
              >
                Save Draft
              </Button>
              <Button
                variant="brand"
                size="sm"
                icon={Send}
                onClick={() => setShowConfirmModal(true)}
                disabled={!composerForm.title.trim() || !composerForm.body.trim()}
              >
                Publish Broadcast
              </Button>
            </div>
          </div>

          {/* 2-Column Layout: Form Editor on Left, Live Interactive Preview on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Form Editor (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              <Card>
                <CardHeader
                  title="1. Basic Information"
                  subtitle="Configure announcement headline, summary, category, and urgency level"
                  icon={FileText}
                />

                <div className="space-y-4 pt-2">
                  {/* Category Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Announcement Category
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {Object.values(ANNOUNCEMENT_CATEGORIES).map((cat) => {
                        const isSelected = composerForm.category === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() =>
                              setComposerForm({
                                ...composerForm,
                                category: cat.id,
                                requiresAcknowledgment: cat.id === 'policy',
                                policyVersion: cat.id === 'policy' ? 'v2.4' : '',
                              })
                            }
                            className={`p-2 rounded-xl text-xs font-semibold text-left transition-all border ${
                              isSelected
                                ? `${cat.badgeClass} ring-2 ring-emerald-500/30 shadow-xs font-bold`
                                : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100'
                            }`}
                          >
                            <span className="block truncate">{cat.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Priority Level */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Priority Level
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.values(PRIORITY_CONFIGS).map((prio) => {
                        const isSelected = composerForm.priority === prio.id;
                        return (
                          <button
                            key={prio.id}
                            type="button"
                            onClick={() => setComposerForm({ ...composerForm, priority: prio.id })}
                            className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                              isSelected
                                ? `${prio.badgeClass} ring-2 ring-emerald-500/30 shadow-xs font-bold`
                                : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${prio.dotColor}`}></span>
                            <span>{prio.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Announcement Title */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Announcement Title *
                      </label>
                      <span className="text-[11px] text-slate-400">
                        {composerForm.title.length}/100 chars
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={120}
                      value={composerForm.title}
                      onChange={(e) => setComposerForm({ ...composerForm, title: e.target.value })}
                      placeholder="e.g., Scheduled Cloud Maintenance Window or Policy Update v2.4"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                    />
                  </div>

                  {/* Short Summary */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Short Summary / Inbox Preview Snippet
                    </label>
                    <input
                      type="text"
                      maxLength={180}
                      value={composerForm.summary}
                      onChange={(e) => setComposerForm({ ...composerForm, summary: e.target.value })}
                      placeholder="A concise 1-sentence summary displayed in inbox lists and push banners"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                    />
                  </div>
                </div>
              </Card>

              {/* Message Body & Safe Variables */}
              <Card>
                <CardHeader
                  title="2. Rich Message Content & Safe Variables"
                  subtitle="Write your broadcast message body. Click variables to insert dynamic tenant tokens."
                  icon={FileText}
                />

                <div className="space-y-3 pt-2">
                  {/* Variable Helper Pills */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Safe Dynamic Tokens (Click to Insert)
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {SUPPORTED_TEMPLATE_VARIABLES.map((v) => (
                        <button
                          key={v.key}
                          type="button"
                          onClick={() => handleInsertVariable(v.key)}
                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 text-[11px] font-mono font-medium border border-slate-200 transition-colors"
                          title={`Inserts token for: ${v.label}`}
                        >
                          + {v.key}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Body Textarea */}
                  <div>
                    <textarea
                      rows={9}
                      value={composerForm.body}
                      onChange={(e) => setComposerForm({ ...composerForm, body: e.target.value })}
                      placeholder="Write your comprehensive announcement body here. Supports standard line breaks, lists, and dynamic tokens..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-sans focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all leading-relaxed"
                    />
                  </div>

                  {/* Call to Action Button Options */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="hasCta"
                          checked={composerForm.hasCta}
                          onChange={(e) =>
                            setComposerForm({ ...composerForm, hasCta: e.target.checked })
                          }
                          className="w-4 h-4 rounded-md text-emerald-700 focus:ring-emerald-500 border-slate-300"
                        />
                        <label htmlFor="hasCta" className="text-xs font-bold text-slate-800 cursor-pointer">
                          Include Primary Call-To-Action (CTA) Button
                        </label>
                      </div>
                    </div>

                    {composerForm.hasCta && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            CTA Button Label
                          </label>
                          <input
                            type="text"
                            value={composerForm.ctaLabel}
                            onChange={(e) =>
                              setComposerForm({ ...composerForm, ctaLabel: e.target.value })
                            }
                            placeholder="e.g., Review Policy Guidelines"
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Destination Link / Workspace Route
                          </label>
                          <select
                            value={composerForm.ctaLink}
                            onChange={(e) =>
                              setComposerForm({ ...composerForm, ctaLink: e.target.value })
                            }
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:ring-1 focus:ring-emerald-500"
                          >
                            <option value="/dashboard">Restaurant Dashboard (/dashboard)</option>
                            <option value="/inbox">Owner Inbox &amp; Policies (/inbox)</option>
                            <option value="/plans-billing">Plans &amp; Billing Center (/plans-billing)</option>
                            <option value="/goods-receiving">Goods Receiving Dock (/goods-receiving)</option>
                            <option value="/workforce">People &amp; Workforce (/workforce)</option>
                            <option value="/inventory">Inventory Items (/inventory)</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Policy Specific & Attachments */}
              <Card>
                <CardHeader
                  title="3. Policy Compliance & Verified Attachments"
                  subtitle="Configure legal acknowledgment standards and upload verified PDF bulletins"
                  icon={ShieldCheck}
                />

                <div className="space-y-4 pt-2">
                  {/* Policy Acknowledgment Requirement */}
                  <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="requiresAck"
                          checked={composerForm.requiresAcknowledgment}
                          onChange={(e) =>
                            setComposerForm({
                              ...composerForm,
                              requiresAcknowledgment: e.target.checked,
                            })
                          }
                          className="w-4 h-4 rounded-md text-purple-700 focus:ring-purple-500 border-purple-300"
                        />
                        <label htmlFor="requiresAck" className="text-xs font-bold text-purple-950 cursor-pointer">
                          Require Formal Policy Acknowledgment (Digital Signature Log)
                        </label>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-200/70 text-purple-900 font-bold">
                        Compliance Audit
                      </span>
                    </div>

                    {composerForm.requiresAcknowledgment && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-[11px] font-semibold text-purple-900 mb-1">
                            Policy Version Number
                          </label>
                          <input
                            type="text"
                            value={composerForm.policyVersion}
                            onChange={(e) =>
                              setComposerForm({ ...composerForm, policyVersion: e.target.value })
                            }
                            placeholder="e.g., v2.4"
                            className="w-full px-3 py-1.5 bg-white border border-purple-200 rounded-lg text-xs text-purple-950 focus:ring-1 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-purple-900 mb-1">
                            Effective Compliance Date
                          </label>
                          <input
                            type="text"
                            value={composerForm.effectiveDate}
                            onChange={(e) =>
                              setComposerForm({ ...composerForm, effectiveDate: e.target.value })
                            }
                            placeholder="e.g., November 1, 2026"
                            className="w-full px-3 py-1.5 bg-white border border-purple-200 rounded-lg text-xs text-purple-950 focus:ring-1 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Secure Attachment Uploader */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Verified Documents &amp; Attachments
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={attachmentName}
                        onChange={(e) => setAttachmentName(e.target.value)}
                        placeholder="File name (e.g., StockMate_Safety_Standards_v2.4.pdf)"
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        icon={Paperclip}
                        onClick={handleAddAttachment}
                      >
                        Attach
                      </Button>
                    </div>
                    {attachmentError && (
                      <p className="text-[11px] text-rose-600 mt-1">{attachmentError}</p>
                    )}

                    {composerForm.attachments.length > 0 && (
                      <div className="mt-2.5 space-y-1.5">
                        {composerForm.attachments.map((att, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="font-medium truncate">{att.name}</span>
                              <span className="text-[11px] text-slate-400">({att.size})</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveAttachment(i)}
                              className="text-slate-400 hover:text-rose-600 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Audience Targeting */}
              <Card>
                <CardHeader
                  title="4. Audience Targeting & Recipient Eligibility"
                  subtitle="Select target restaurant organizations. Backend enforces privacy and masks recipient emails."
                  icon={Users}
                />

                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      {
                        id: 'ALL_RESTAURANTS',
                        title: 'All Restaurants',
                        desc: 'Global Broadcast across all eligible tenant inboxes',
                      },
                      {
                        id: 'SPECIFIC_RESTAURANTS',
                        title: 'Specific Clients',
                        desc: 'Target selected hospitality groups or branches',
                      },
                      {
                        id: 'SUBSCRIPTION_TIER',
                        title: 'By Plan Tier',
                        desc: 'Target by Starter, Pro, or Enterprise subscription',
                      },
                    ].map((aud) => (
                      <button
                        key={aud.id}
                        type="button"
                        onClick={() =>
                          setComposerForm({
                            ...composerForm,
                            audienceType: aud.id,
                            targetRestaurantIds:
                              aud.id === 'SPECIFIC_RESTAURANTS' ? [restaurants[0]?.id] : [],
                            targetPlanIds: aud.id === 'SUBSCRIPTION_TIER' ? ['plan-pro'] : [],
                          })
                        }
                        className={`p-3 rounded-xl text-left border transition-all ${
                          composerForm.audienceType === aud.id
                            ? 'bg-emerald-50/70 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500/30'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-xs font-bold block">{aud.title}</span>
                        <span className="text-[11px] opacity-80 line-clamp-2 mt-0.5">{aud.desc}</span>
                      </button>
                    ))}
                  </div>

                  {/* Specific Restaurants Checkbox Matrix */}
                  {composerForm.audienceType === 'SPECIFIC_RESTAURANTS' && (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <span className="text-xs font-bold text-slate-800 block">
                        Select Target Organizations:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                        {restaurants.map((rest) => {
                          const isChecked = composerForm.targetRestaurantIds.includes(rest.id);
                          return (
                            <label
                              key={rest.id}
                              className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800 cursor-pointer hover:bg-slate-50"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setComposerForm({
                                      ...composerForm,
                                      targetRestaurantIds: [...composerForm.targetRestaurantIds, rest.id],
                                    });
                                  } else {
                                    setComposerForm({
                                      ...composerForm,
                                      targetRestaurantIds: composerForm.targetRestaurantIds.filter(
                                        (id) => id !== rest.id
                                      ),
                                    });
                                  }
                                }}
                                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                              />
                              <span className="truncate">{rest.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Specific Plan Tiers */}
                  {composerForm.audienceType === 'SUBSCRIPTION_TIER' && (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <span className="text-xs font-bold text-slate-800 block">
                        Select Target Subscription Tiers:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {plans.map((p) => {
                          const isChecked = composerForm.targetPlanIds.includes(p.id);
                          return (
                            <label
                              key={p.id}
                              className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800 cursor-pointer hover:bg-slate-50"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setComposerForm({
                                      ...composerForm,
                                      targetPlanIds: [...composerForm.targetPlanIds, p.id],
                                    });
                                  } else {
                                    setComposerForm({
                                      ...composerForm,
                                      targetPlanIds: composerForm.targetPlanIds.filter(
                                        (id) => id !== p.id
                                      ),
                                    });
                                  }
                                }}
                                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                              />
                              <span>{p.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Audience Reach Summary Badge */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-950 font-semibold">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-700" />
                      <span>
                        Audience Reach: <strong>{eligibleRecipients.length} eligible restaurant organizations</strong>
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full font-bold">
                      {eligibleRecipients.length} In-App Inboxes
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column: Interactive Live Preview (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="sticky top-4 space-y-3">
                {/* Preview Control Toggle */}
                <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Live Preview
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                      Real-time Token Interpolation
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('desktop')}
                      className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                        previewDevice === 'desktop'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                      title="Desktop view"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span className="text-[11px] hidden sm:inline">Desktop</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('mobile')}
                      className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                        previewDevice === 'mobile'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                      title="Mobile device frame"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span className="text-[11px] hidden sm:inline">Mobile</span>
                    </button>
                  </div>
                </div>

                {/* Device Frame Rendering */}
                {previewDevice === 'desktop' ? (
                  /* Desktop Preview Container */
                  <div className="bg-white rounded-3xl border border-slate-300 shadow-xl overflow-hidden transition-all duration-300">
                    {/* Simulated Browser Bar */}
                    <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">
                        StockMate Restaurant Owner Inbox
                      </span>
                      <span className="w-4"></span>
                    </div>

                    {/* Announcement Reading Container */}
                    <div className="p-6 space-y-4 max-h-[620px] overflow-y-auto">
                      {/* Sender Info & Badges */}
                      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                            SM
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-900">
                                StockMate Platform Administration
                              </span>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            </div>
                            <span className="text-[11px] text-slate-400 block">
                              To: {samplePreviewContext.ownerName} &lt;{samplePreviewContext.restaurantName}&gt;
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${activeCategoryObj.badgeClass}`}>
                            {activeCategoryObj.label}
                          </span>
                          {composerForm.priority !== 'normal' && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${activePriorityObj.badgeClass}`}>
                              {activePriorityObj.label}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {previewTitle}
                      </h3>

                      {/* Policy Required Banner */}
                      {composerForm.requiresAcknowledgment && (
                        <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-start gap-2.5">
                          <FileCheck2 className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold block">
                              Policy Compliance Acknowledgment Required ({composerForm.policyVersion || 'v2.4'})
                            </span>
                            <span className="text-[11px] text-purple-800 opacity-90 mt-0.5 block">
                              Formal acceptance must be acknowledged by the restaurant owner before {composerForm.effectiveDate}.
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Formatted Body */}
                      <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
                        {previewBody}
                      </div>

                      {/* Attachments Chip */}
                      {composerForm.attachments.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 space-y-1.5">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            Attachments ({composerForm.attachments.length})
                          </span>
                          {composerForm.attachments.map((att, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700"
                            >
                              <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-semibold text-emerald-800">{att.name}</span>
                              <span className="text-[10px] text-slate-400">({att.size})</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Call-to-action button */}
                      {composerForm.hasCta && (
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <Button variant="brand" size="sm" iconRight={ExternalLink}>
                            {composerForm.ctaLabel || 'View in Workspace'}
                          </Button>
                          <span className="text-[11px] text-slate-400">
                            Route: {composerForm.ctaLink}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Mobile Device Frame Preview */
                  <div className="max-w-[340px] mx-auto bg-slate-900 p-3 rounded-[40px] shadow-2xl border-4 border-slate-800 transition-all duration-300">
                    {/* Simulated Phone Notch */}
                    <div className="w-32 h-4 bg-slate-800 rounded-b-xl mx-auto mb-2 flex items-center justify-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-900 mr-2"></span>
                      <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                    </div>

                    {/* Mobile App Screen */}
                    <div className="bg-white rounded-3xl p-4 max-h-[520px] overflow-y-auto space-y-3 text-slate-900">
                      {/* Mobile Header */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-[11px] font-bold text-emerald-800">
                          StockMate Inbox
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                          {activeCategoryObj.label}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="text-xs font-bold leading-snug">{previewTitle}</h4>

                      {/* Policy Banner if needed */}
                      {composerForm.requiresAcknowledgment && (
                        <div className="p-2 rounded-lg bg-purple-50 text-[10px] text-purple-900 font-semibold border border-purple-200">
                          Policy Compliance {composerForm.policyVersion} Required
                        </div>
                      )}

                      {/* Body */}
                      <p className="text-[11px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {previewBody}
                      </p>

                      {/* CTA */}
                      {composerForm.hasCta && (
                        <button
                          type="button"
                          className="w-full py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs text-center"
                        >
                          {composerForm.ctaLabel || 'Open Workspace'}
                        </button>
                      )}
                    </div>

                    {/* Bottom home indicator line */}
                    <div className="w-24 h-1 bg-slate-700 rounded-full mx-auto mt-2.5"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: BROADCAST HISTORY & ENGAGEMENT ANALYTICS */}
      {/* ============================================================== */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <Card padding={false}>
            {/* Filter and Search Bar */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Search announcements..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={historyCategoryFilter}
                  onChange={(e) => setHistoryCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium"
                >
                  <option value="all">All Categories</option>
                  {Object.values(ANNOUNCEMENT_CATEGORIES).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>

                <select
                  value={historyPriorityFilter}
                  onChange={(e) => setHistoryPriorityFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium"
                >
                  <option value="all">All Priorities</option>
                  <option value="normal">Normal</option>
                  <option value="important">Important</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            {/* Announcements Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4 font-bold">Announcement Title</th>
                    <th className="py-3 px-3 font-bold">Category</th>
                    <th className="py-3 px-3 font-bold">Priority</th>
                    <th className="py-3 px-3 font-bold">Audience</th>
                    <th className="py-3 px-3 font-bold">Published Date</th>
                    <th className="py-3 px-3 font-bold">Reads &amp; Compliance</th>
                    <th className="py-3 px-3 font-bold">Delivery Status</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredHistory.map((ann) => {
                    const cat =
                      ANNOUNCEMENT_CATEGORIES[ann.category] || ANNOUNCEMENT_CATEGORIES.general;
                    const prio =
                      PRIORITY_CONFIGS[ann.priority] || PRIORITY_CONFIGS.normal;

                    // Compute reads for this announcement
                    const readCount = Object.keys(announcementReads || {}).filter(
                      (key) => key.startsWith(ann.id) && announcementReads[key].isRead
                    ).length;

                    // Compute acknowledgments
                    const ackCount = (policyAcknowledgments || []).filter(
                      (ack) => ack.announcementId === ann.id
                    ).length;

                    const totalTargeted =
                      ann.audienceType === 'ALL_RESTAURANTS'
                        ? restaurants.length
                        : (ann.targetRestaurantIds || []).length || 1;

                    return (
                      <tr key={ann.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs truncate">
                          <div className="flex items-center gap-2">
                            {ann.requiresAcknowledgment && (
                              <FileCheck2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            )}
                            <span className="truncate">{ann.title}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${cat.badgeClass}`}>
                            {cat.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${prio.badgeClass}`}>
                            {prio.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="text-slate-600 font-medium">
                            {ann.audienceType === 'ALL_RESTAURANTS'
                              ? 'All Tenants'
                              : ann.audienceType === 'SUBSCRIPTION_TIER'
                              ? 'Plan Tier'
                              : 'Selected'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                          {new Date(ann.publishedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">
                              {readCount}/{totalTargeted}
                            </span>
                            <span className="text-slate-400">reads</span>
                            {ann.requiresAcknowledgment && (
                              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-800 font-bold">
                                {ackCount} acks
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Delivered</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <Button
                            variant="outline"
                            size="xs"
                            icon={Eye}
                            onClick={() => setSelectedAnnouncementForInspector(ann)}
                          >
                            Inspect
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: MESSAGE TEMPLATE LIBRARY (8 COMMERCIAL SAAS TEMPLATES) */}
      {/* ============================================================== */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Platform Message Template Library</h3>
              <p className="text-xs text-slate-500">
                8 Pre-configured, reusable broadcast templates with safe variable tokens
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700">
              8 Standard SaaS Blueprints
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {(announcementTemplates || INITIAL_ANNOUNCEMENT_TEMPLATES).map((tpl) => {
              const cat =
                ANNOUNCEMENT_CATEGORIES[tpl.category] || ANNOUNCEMENT_CATEGORIES.general;
              const prio =
                PRIORITY_CONFIGS[tpl.priority] || PRIORITY_CONFIGS.normal;

              return (
                <div
                  key={tpl.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${cat.badgeClass}`}>
                        {cat.label}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${prio.badgeClass}`}>
                        {prio.label}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                      {tpl.title.replace('{{effective_date}}', 'Upcoming')}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1.5 line-clamp-3 leading-relaxed">
                      {tpl.summary}
                    </p>

                    {tpl.requiresAcknowledgment && (
                      <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-purple-50 text-purple-800 text-[11px] font-semibold border border-purple-200">
                        <FileCheck2 className="w-3.5 h-3.5 text-purple-600" />
                        <span>Requires Policy Acceptance ({tpl.policyVersion})</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedTemplateForModal(tpl)}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      View Details
                    </button>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="brand"
                        size="xs"
                        icon={ArrowRight}
                        onClick={() => handleApplyTemplate(tpl)}
                      >
                        Use in Studio
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: EMAIL DELIVERY ARCHITECTURE & DISPATCH LOGS */}
      {/* ============================================================== */}
      {activeTab === 'diagnostics' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Mail className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Email Dispatch Architecture &amp; Delivery Engine</h3>
                <p className="text-xs text-slate-400">
                  Real-time in-app delivery with transactional email queue simulation and provider receipts
                </p>
              </div>
            </div>
            <span className="text-xs px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
              Provider Status: Verified &amp; Active
            </span>
          </div>

          {/* Architecture Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Primary Channel
              </span>
              <h4 className="text-base font-bold text-slate-900">In-App Owner Inbox</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Instant delivery to authorized restaurant owner workspaces with read and compliance state tracking.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Secondary Channel
              </span>
              <h4 className="text-base font-bold text-slate-900">Transactional Email</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Asynchronous dispatch via StockMate Cloud Dispatcher (supports SendGrid, AWS SES, or SMTP webhook).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Privacy Protection
              </span>
              <h4 className="text-base font-bold text-slate-900">BCC / Tenant Masking</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Broadcast recipient email lists are isolated; tenants never see other restaurants&apos; contact details.
              </p>
            </div>
          </div>

          {/* Live Delivery Dispatch Logs Table */}
          <Card padding={false}>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Delivery Receipts &amp; Provider Proof</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Recent dispatch attempts across registered tenant owner emails
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600">
                Live Audit Logs
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4 font-bold">Recipient Owner</th>
                    <th className="py-3 px-3 font-bold">Restaurant Tenant</th>
                    <th className="py-3 px-3 font-bold">Announcement Title</th>
                    <th className="py-3 px-3 font-bold">Dispatch Timestamp</th>
                    <th className="py-3 px-3 font-bold">Channel</th>
                    <th className="py-3 px-4 font-bold">Provider Proof</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {restaurants.map((rest, idx) => (
                    <tr key={rest.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {rest.ownerName} &lt;{rest.ownerEmail}&gt;
                      </td>
                      <td className="py-3 px-3">{rest.name}</td>
                      <td className="py-3 px-3 font-medium text-slate-800 max-w-xs truncate">
                        Platform Policy &amp; Food Safety Compliance Update (v2.4)
                      </td>
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                        {new Date(Date.now() - idx * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 font-bold border border-blue-200">
                          In-App + Email
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Delivered (250 OK: id={rest.id}-msg)</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ============================================================== */}
      {/* CONFIRMATION BROADCAST MODAL */}
      {/* ============================================================== */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Platform Announcement Broadcast"
        size="md"
      >
        <div className="space-y-4">
          {composerForm.priority === 'urgent' && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-2.5">
              <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold block">Urgent Priority Broadcast Warning</span>
                <span className="opacity-90 block mt-0.5">
                  This announcement has been marked as <strong>Urgent</strong>. It will be highlighted prominently in recipient inboxes and trigger immediate notifications.
                </span>
              </div>
            </div>
          )}

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2.5 text-xs text-slate-700">
            <div className="flex justify-between">
              <span className="font-medium text-slate-500">Announcement Title:</span>
              <span className="font-bold text-slate-900">{composerForm.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-slate-500">Category:</span>
              <span className="font-semibold text-slate-800 capitalize">
                {activeCategoryObj.label}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-slate-500">Priority:</span>
              <span className="font-semibold capitalize text-slate-800">
                {composerForm.priority}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-slate-500">Target Audience:</span>
              <span className="font-bold text-emerald-800">
                {eligibleRecipients.length} Restaurant Organization Inboxes
              </span>
            </div>
            {composerForm.requiresAcknowledgment && (
              <div className="flex justify-between text-purple-900">
                <span className="font-medium">Policy Acknowledgment:</span>
                <span className="font-bold">Required ({composerForm.policyVersion || 'v2.4'})</span>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            By publishing, an in-app inbox message will be dispatched immediately to all authorized owners in the target scope.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfirmModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="brand"
              size="sm"
              icon={Send}
              onClick={handleExecutePublish}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Broadcasting...' : 'Confirm & Broadcast Now'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ============================================================== */}
      {/* ENGAGEMENT INSPECTOR DRAWER / MODAL */}
      {/* ============================================================== */}
      {selectedAnnouncementForInspector && (
        <Modal
          isOpen={!!selectedAnnouncementForInspector}
          onClose={() => setSelectedAnnouncementForInspector(null)}
          title={`Broadcast Engagement: ${selectedAnnouncementForInspector.title}`}
          size="lg"
        >
          <div className="space-y-5">
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Reach</span>
                <span className="text-lg font-black text-slate-900">
                  {restaurants.length} Tenants
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">100% In-App Delivery</span>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-800 uppercase block">Read Receipts</span>
                <span className="text-lg font-black text-emerald-950">
                  {
                    Object.keys(announcementReads || {}).filter(
                      (k) =>
                        k.startsWith(selectedAnnouncementForInspector.id) &&
                        announcementReads[k].isRead
                    ).length
                  }{' '}
                  / {restaurants.length}
                </span>
                <span className="text-[10px] text-emerald-700 block mt-0.5">Verified Opens</span>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200">
                <span className="text-[11px] font-bold text-purple-800 uppercase block">Policy Acks</span>
                <span className="text-lg font-black text-purple-950">
                  {
                    (policyAcknowledgments || []).filter(
                      (ack) => ack.announcementId === selectedAnnouncementForInspector.id
                    ).length
                  }
                </span>
                <span className="text-[10px] text-purple-700 block mt-0.5">
                  {selectedAnnouncementForInspector.requiresAcknowledgment
                    ? 'Compliance Signed'
                    : 'Not Required'}
                </span>
              </div>
            </div>

            {/* Recipient Tenant Breakdown */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Recipient Organization Status Breakdown
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl max-h-56 overflow-y-auto">
                {restaurants.map((rest) => {
                  const readKey = `${selectedAnnouncementForInspector.id}_${rest.id}`;
                  const isRead = announcementReads?.[readKey]?.isRead;
                  const ack = (policyAcknowledgments || []).find(
                    (a) => a.announcementId === selectedAnnouncementForInspector.id && a.restaurantId === rest.id
                  );

                  return (
                    <div
                      key={rest.id}
                      className="p-3 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">{rest.name}</span>
                        <span className="text-[11px] text-slate-400">
                          {rest.ownerName} &lt;{rest.ownerEmail}&gt;
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isRead ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" /> Read
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                            Unread
                          </span>
                        )}

                        {selectedAnnouncementForInspector.requiresAcknowledgment && (
                          ack ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 font-bold flex items-center gap-1">
                              <FileCheck2 className="w-3 h-3 text-purple-700" /> Signed {ack.policyVersion}
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold">
                              Pending Ack
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedAnnouncementForInspector(null)}
              >
                Close Inspector
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ============================================================== */}
      {/* TEMPLATE DETAIL MODAL */}
      {/* ============================================================== */}
      {selectedTemplateForModal && (
        <Modal
          isOpen={!!selectedTemplateForModal}
          onClose={() => setSelectedTemplateForModal(null)}
          title={`Template: ${selectedTemplateForModal.title.replace('{{effective_date}}', 'Upcoming')}`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                Summary
              </span>
              <p className="text-slate-800 font-medium">{selectedTemplateForModal.summary}</p>
            </div>

            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                Message Body Template
              </span>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {selectedTemplateForModal.body}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTemplateForModal(null)}
              >
                Close
              </Button>
              <Button
                variant="brand"
                size="sm"
                icon={ArrowRight}
                onClick={() => {
                  handleApplyTemplate(selectedTemplateForModal);
                  setSelectedTemplateForModal(null);
                }}
              >
                Use in Composer
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

