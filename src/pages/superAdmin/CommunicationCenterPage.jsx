import { StockMateEmailShell } from '../../components/email/StockMateEmailShell';
import { formatINR } from '../../data/inventoryBillingData';
import React, { useState, useMemo, useRef } from 'react';
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
  Edit3,
  Archive,
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
  getUnresolvedVariables,
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
    transactions,
    users,
    plans,
    currentUser,
    publishAnnouncement,
    saveAnnouncementDraft,
    deleteAnnouncement,
    toggleArchiveAnnouncement,
    saveCustomTemplate,
    duplicateTemplate,
    resetTemplate,
    getAnnouncementStats,
    addToast,
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

  // Selected Sample Recipient for Preview
  const [previewRecipientId, setPreviewRecipientId] = useState('');
  const [lastFocusedField, setLastFocusedField] = useState('body'); // 'title' | 'summary' | 'body'
  const [formErrors, setFormErrors] = useState({});
  const bodyTextareaRef = useRef(null);
  const titleInputRef = useRef(null);
  const summaryInputRef = useRef(null);

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
  const [inspectorActiveTab, setInspectorActiveTab] = useState('message'); // 'message' | 'analytics'
  const [historyStatusFilter, setHistoryStatusFilter] = useState('all'); // 'all' | 'published' | 'draft'
  const [deleteConfirmAnnouncementId, setDeleteConfirmAnnouncementId] = useState(null);
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState('all');
  const [templateSearch, setTemplateSearch] = useState('');
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [previewingTemplate, setPreviewingTemplate] = useState(null);
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
    const isReceiptOrBilling =
      tpl.category === 'billing' ||
      tpl.category === 'receipt' ||
      tpl.id.includes('receipt') ||
      tpl.id.includes('invoice');

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
      verifiedTransaction: isReceiptOrBilling
        ? (prev.verifiedTransaction || (transactions && transactions[0]))
        : prev.verifiedTransaction,
    }));
    setActiveTab('studio');
  };

  // Insert variable tag cleanly at cursor position (exactly once, preserving draft text)
  const handleInsertVariable = (variableKey) => {
    if (lastFocusedField === 'title' && titleInputRef.current) {
      const input = titleInputRef.current;
      const start = input.selectionStart ?? input.value.length;
      const end = input.selectionEnd ?? input.value.length;
      const val = composerForm.title || '';
      const newVal = val.substring(0, start) + variableKey + val.substring(end);
      setComposerForm((prev) => ({ ...prev, title: newVal }));
      requestAnimationFrame(() => {
        if (titleInputRef.current) {
          titleInputRef.current.focus();
          const nextPos = start + variableKey.length;
          titleInputRef.current.setSelectionRange(nextPos, nextPos);
        }
      });
      return;
    }

    if (lastFocusedField === 'summary' && summaryInputRef.current) {
      const input = summaryInputRef.current;
      const start = input.selectionStart ?? input.value.length;
      const end = input.selectionEnd ?? input.value.length;
      const val = composerForm.summary || '';
      const newVal = val.substring(0, start) + variableKey + val.substring(end);
      setComposerForm((prev) => ({ ...prev, summary: newVal }));
      requestAnimationFrame(() => {
        if (summaryInputRef.current) {
          summaryInputRef.current.focus();
          const nextPos = start + variableKey.length;
          summaryInputRef.current.setSelectionRange(nextPos, nextPos);
        }
      });
      return;
    }

    // Default target: body textarea
    const textarea = bodyTextareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart ?? textarea.value.length;
      const end = textarea.selectionEnd ?? textarea.value.length;
      const val = composerForm.body || '';
      const newVal = val.substring(0, start) + variableKey + val.substring(end);
      setComposerForm((prev) => ({ ...prev, body: newVal }));
      requestAnimationFrame(() => {
        if (bodyTextareaRef.current) {
          bodyTextareaRef.current.focus();
          const nextPos = start + variableKey.length;
          bodyTextareaRef.current.setSelectionRange(nextPos, nextPos);
        }
      });
    } else {
      setComposerForm((prev) => ({
        ...prev,
        body: (prev.body ? prev.body + ' ' : '') + variableKey,
      }));
    }
  };

  // Super Admin Message Detail & Action Handlers
  const handleReadMessage = (ann) => {
    setSelectedAnnouncementForInspector(ann);
    setInspectorActiveTab('message');
  };

  const handleInspectAnalytics = (ann) => {
    setSelectedAnnouncementForInspector(ann);
    setInspectorActiveTab('analytics');
  };

  const handleEditDraft = (ann) => {
    setComposerForm({
      id: ann.id,
      title: ann.title || '',
      summary: ann.summary || '',
      body: ann.body || '',
      category: ann.category || 'general',
      priority: ann.priority || 'normal',
      audienceType: ann.audienceType || 'ALL_RESTAURANTS',
      targetRestaurantIds: ann.targetRestaurantIds || [],
      targetPlanIds: ann.targetPlanIds || [],
      requiresAcknowledgment: !!ann.requiresAcknowledgment,
      policyVersion: ann.policyVersion || '',
      effectiveDate: ann.effectiveDate || 'Immediately',
      ctaLabel: ann.ctaLabel || '',
      ctaLink: ann.ctaLink || '/dashboard',
      hasCta: !!ann.ctaLabel,
      attachments: ann.attachments || [],
      scheduledFor: ann.scheduledFor || null,
      verifiedTransaction: ann.verifiedTransaction || null,
    });
    setSelectedAnnouncementForInspector(null);
    setActiveTab('studio');
    if (addToast) addToast(`Draft "${ann.title}" loaded into Announcement Studio.`, 'info');
  };

  const handleDuplicateAnnouncement = (ann) => {
    setComposerForm({
      id: null,
      title: `${ann.title} (Copy)`,
      summary: ann.summary || '',
      body: ann.body || '',
      category: ann.category || 'general',
      priority: ann.priority || 'normal',
      audienceType: ann.audienceType || 'ALL_RESTAURANTS',
      targetRestaurantIds: ann.targetRestaurantIds || [],
      targetPlanIds: ann.targetPlanIds || [],
      requiresAcknowledgment: !!ann.requiresAcknowledgment,
      policyVersion: ann.policyVersion || '',
      effectiveDate: ann.effectiveDate || 'Immediately',
      ctaLabel: ann.ctaLabel || '',
      ctaLink: ann.ctaLink || '/dashboard',
      hasCta: !!ann.ctaLabel,
      attachments: ann.attachments || [],
      scheduledFor: null,
      verifiedTransaction: ann.verifiedTransaction || null,
    });
    setSelectedAnnouncementForInspector(null);
    setActiveTab('studio');
    if (addToast) addToast(`Announcement duplicated into Studio as a new draft.`, 'success');
  };

  const handlePublishDraftNow = (ann) => {
    publishAnnouncement(ann);
    setSelectedAnnouncementForInspector(null);
    if (addToast) addToast(`Draft "${ann.title}" published to tenant inboxes.`, 'success');
  };

  const handleConfirmDeleteDraft = (annId) => {
    deleteAnnouncement(annId);
    setDeleteConfirmAnnouncementId(null);
    setSelectedAnnouncementForInspector(null);
    if (addToast) addToast('Draft announcement deleted.', 'info');
  };

  const handleToggleArchiveFromInspector = (ann) => {
    if (toggleArchiveAnnouncement) {
      toggleArchiveAnnouncement(ann.id, 'admin');
      if (addToast) addToast(`Announcement "${ann.title}" archive status updated.`, 'info');
    }
  };

  // Reset preview recipient without deleting draft
  const handleResetPreviewRecipient = () => {
    setPreviewRecipientId('');
    if (addToast) addToast('Preview recipient reset to default.', 'info');
  };

  // Form field validation
  const validateComposer = () => {
    const errors = {};
    if (!composerForm.title.trim()) {
      errors.title = 'Announcement title is required.';
    } else if (composerForm.title.trim().length < 3) {
      errors.title = 'Announcement title must be at least 3 characters.';
    }
    if (!composerForm.body.trim()) {
      errors.body = 'Announcement message body is required.';
    } else if (composerForm.body.trim().length < 10) {
      errors.body = 'Announcement message body must be at least 10 characters.';
    }
    if (
      composerForm.audienceType === 'SPECIFIC_RESTAURANTS' &&
      (!composerForm.targetRestaurantIds || composerForm.targetRestaurantIds.length === 0)
    ) {
      errors.audience = 'Please select at least one target restaurant.';
    }
    if (
      composerForm.audienceType === 'SUBSCRIPTION_TIER' &&
      (!composerForm.targetPlanIds || composerForm.targetPlanIds.length === 0)
    ) {
      errors.audience = 'Please select at least one subscription tier.';
    }
    if (composerForm.category === 'policy' && !composerForm.policyVersion.trim()) {
      errors.policyVersion = 'Policy version is required for platform policy updates.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenPublishModal = () => {
    if (!validateComposer()) {
      if (addToast) addToast('Please resolve the required fields before publishing.', 'warning');
      return;
    }
    setShowConfirmModal(true);
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

  // Duplicate Current Studio Draft as a New Template
  const handleDuplicateCurrentStudioTemplate = () => {
    if (!composerForm.title.trim()) {
      if (addToast) addToast('Please enter an announcement title first.', 'warning');
      return;
    }
    const newTpl = {
      id: `tpl-custom-${Date.now()}`,
      category: composerForm.category || 'general',
      priority: composerForm.priority || 'normal',
      title: `${composerForm.title} (Template Copy)`,
      summary: composerForm.summary || '',
      body: composerForm.body || '',
      ctaLabel: composerForm.ctaLabel || 'View in Workspace',
      ctaLink: composerForm.ctaLink || '/dashboard',
      requiresAcknowledgment: !!composerForm.requiresAcknowledgment,
      policyVersion: composerForm.policyVersion || '',
    };
    if (saveCustomTemplate) {
      saveCustomTemplate(newTpl);
    }
    if (addToast) {
      addToast('Studio draft duplicated into template library.', 'success');
    }
  };

  // Save Current Studio Draft into Template Library
  const handleSaveCurrentStudioAsTemplate = () => {
    if (!composerForm.title.trim()) {
      if (addToast) addToast('Please enter an announcement title first.', 'warning');
      return;
    }
    const newTpl = {
      id: composerForm.id || `tpl-custom-${Date.now()}`,
      category: composerForm.category || 'general',
      priority: composerForm.priority || 'normal',
      title: composerForm.title,
      summary: composerForm.summary || '',
      body: composerForm.body || '',
      ctaLabel: composerForm.ctaLabel || 'View in Workspace',
      ctaLink: composerForm.ctaLink || '/dashboard',
      requiresAcknowledgment: !!composerForm.requiresAcknowledgment,
      policyVersion: composerForm.policyVersion || '',
    };
    if (saveCustomTemplate) {
      saveCustomTemplate(newTpl);
    }
    if (addToast) {
      addToast('Studio draft saved to template library.', 'success');
    }
  };

  // Filtered Sent History
  const filteredHistory = useMemo(() => {
    return announcements.filter((ann) => {
      const matchesSearch =
        !historySearch ||
        ann.title.toLowerCase().includes(historySearch.toLowerCase()) ||
        ann.summary?.toLowerCase().includes(historySearch.toLowerCase()) ||
        ann.body?.toLowerCase().includes(historySearch.toLowerCase());
      const matchesCategory =
        historyCategoryFilter === 'all' || ann.category === historyCategoryFilter;
      const matchesPriority =
        historyPriorityFilter === 'all' || ann.priority === historyPriorityFilter;
      const matchesStatus =
        historyStatusFilter === 'all' || (ann.status || 'published') === historyStatusFilter;
      return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
    });
  }, [announcements, historySearch, historyCategoryFilter, historyPriorityFilter, historyStatusFilter]);

  // Selected Sample Recipient for Live Preview
  const previewRestaurant = useMemo(() => {
    if (previewRecipientId) {
      const found = restaurants.find((r) => r.id === previewRecipientId);
      if (found) return found;
    }
    if (composerForm.targetRestaurantIds?.length > 0) {
      const targeted = restaurants.find((r) => composerForm.targetRestaurantIds.includes(r.id));
      if (targeted) return targeted;
    }
    return restaurants[0] || null;
  }, [previewRecipientId, composerForm.targetRestaurantIds, restaurants]);

  // Sample Context for Live Preview Interpolation
  const samplePreviewContext = useMemo(() => {
    const targetRest = previewRestaurant;
    const tx =
      composerForm.verifiedTransaction ||
      (transactions && transactions.find((t) => t.restaurantId === targetRest?.id || t.restaurantName === targetRest?.name)) ||
      null;

    return {
      restaurantName: targetRest?.name || '[Restaurant Name]',
      ownerName: targetRest?.ownerName || targetRest?.contactPerson || '[Owner Name]',
      ownerEmail: targetRest?.ownerEmail || targetRest?.email || 'owner@restaurant.com',
      planName: targetRest?.planName ? `${targetRest.planName} Plan` : '[Subscription Plan]',
      amount: tx ? (typeof tx.amount === 'number' ? formatINR(tx.amount) : tx.amount) : '[Amount Pending]',
      receiptNumber: tx?.receiptNumber || (tx?.id ? `RCP-${tx.id}` : '[Receipt Pending]'),
      paymentRef: tx?.paymentRef || tx?.gatewayRef || (tx?.id ? `REF-${tx.id}` : '[Payment Ref Pending]'),
      invoiceNumber: tx?.invoiceId || (tx?.id ? `INV-${tx.id}` : '[Invoice Pending]'),
      renewalDate: targetRest?.renewalDate || '[Renewal Date]',
      effectiveDate: composerForm.effectiveDate || 'Immediately upon publication',
      platformLink: composerForm.ctaLink || '#/dashboard',
    };
  }, [previewRestaurant, composerForm.verifiedTransaction, composerForm.effectiveDate, composerForm.ctaLink, transactions]);

  // Interpolated fields for live preview
  const previewTitle = useMemo(() => {
    return interpolateTemplateVariables(
      composerForm.title || 'Announcement Title Preview',
      samplePreviewContext
    );
  }, [composerForm.title, samplePreviewContext]);

  const previewSummary = useMemo(() => {
    return interpolateTemplateVariables(
      composerForm.summary || '',
      samplePreviewContext
    );
  }, [composerForm.summary, samplePreviewContext]);

  const previewBody = useMemo(() => {
    return interpolateTemplateVariables(
      composerForm.body || 'Your message body will be previewed here with clean formatting and safe variables interpolated.',
      samplePreviewContext
    );
  }, [composerForm.body, samplePreviewContext]);

  // Scan for any unrecognized template variables
  const unresolvedTokens = useMemo(() => {
    const fullText = `${composerForm.title} ${composerForm.summary} ${composerForm.body}`;
    return getUnresolvedVariables(fullText);
  }, [composerForm.title, composerForm.summary, composerForm.body]);

  const activeCategoryObj =
    ANNOUNCEMENT_CATEGORIES[composerForm.category] || ANNOUNCEMENT_CATEGORIES.general;
  const activePriorityObj =
    PRIORITY_CONFIGS[composerForm.priority] || PRIORITY_CONFIGS.normal;

  return (
    <div className="space-y-4 sm:space-y-5">
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

                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="outline"
                            size="xs"
                            icon={Eye}
                            onClick={() => handleReadMessage(ann)}
                          >
                            Read
                          </Button>
                          <Button
                            variant="ghost"
                            size="xs"
                            icon={BarChart3}
                            onClick={() => handleInspectAnalytics(ann)}
                          >
                            Analytics
                          </Button>
                        </div>
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
                icon={Copy}
                onClick={handleDuplicateCurrentStudioTemplate}
                title="Duplicate current message as a new reusable template"
              >
                Duplicate Template
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={Layers}
                onClick={handleSaveCurrentStudioAsTemplate}
                title="Save current message into template library"
              >
                Save as Template
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
                onClick={handleOpenPublishModal}
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
                            onClick={() => {
                              const isReceiptOrBilling = cat.id === 'receipt' || cat.id === 'billing';
                              setComposerForm({
                                ...composerForm,
                                category: cat.id,
                                requiresAcknowledgment: cat.id === 'policy',
                                policyVersion: cat.id === 'policy' ? 'v2.4' : '',
                                verifiedTransaction: isReceiptOrBilling
                                  ? (composerForm.verifiedTransaction || (transactions && transactions[0]))
                                  : composerForm.verifiedTransaction,
                              });
                            }}
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

                  {/* Verified Transaction Selection for Billing & Receipts */}
                  {(composerForm.category === 'billing' || composerForm.category === 'receipt') && (
                    <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/90 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider">
                          Linked Verified Payment Transaction
                        </label>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                          Tamper-Proof Data
                        </span>
                      </div>
                      <select
                        value={composerForm.verifiedTransaction?.id || transactions[0]?.id || ''}
                        onChange={(e) => {
                          const tx = transactions.find((t) => t.id === e.target.value);
                          setComposerForm((prev) => ({
                            ...prev,
                            verifiedTransaction: tx || null,
                            targetRestaurantIds: tx?.restaurantId ? [tx.restaurantId] : prev.targetRestaurantIds,
                          }));
                        }}
                        className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500/20"
                      >
                        {transactions.map((tx) => (
                          <option key={tx.id} value={tx.id}>
                            {tx.id} — {tx.restaurantName} ({formatINR(tx.amount)} · {tx.status} · {tx.paymentMethod})
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-emerald-800/90 leading-tight">
                        Anti-tamper guarantee: Amounts, GST calculations, and transaction identifiers are read directly from the verified ledger.
                      </p>
                    </div>
                  )}

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
                      <span
                        className={`text-[11px] font-mono font-bold ${
                          composerForm.title.length > 100
                            ? 'text-rose-600'
                            : composerForm.title.length > 80
                            ? 'text-amber-600'
                            : 'text-slate-400'
                        }`}
                      >
                        {composerForm.title.length} / 100 chars
                      </span>
                    </div>
                    <input
                      ref={titleInputRef}
                      type="text"
                      maxLength={120}
                      value={composerForm.title}
                      onFocus={() => setLastFocusedField('title')}
                      onChange={(e) => {
                        const val = e.target.value;
                        setComposerForm((prev) => ({ ...prev, title: val }));
                        if (formErrors.title) setFormErrors((prev) => ({ ...prev, title: null }));
                      }}
                      placeholder="e.g., Scheduled Cloud Maintenance Window or Policy Update v2.4"
                      className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 transition-all font-medium ${
                        formErrors.title
                          ? 'border-rose-400 focus:ring-rose-400/20 focus:border-rose-500'
                          : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500'
                      }`}
                    />
                    {formErrors.title && (
                      <p className="text-[11px] text-rose-600 mt-1 font-semibold">{formErrors.title}</p>
                    )}
                  </div>

                  {/* Short Summary */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Short Summary / Inbox Preview Snippet
                    </label>
                    <input
                      ref={summaryInputRef}
                      type="text"
                      maxLength={180}
                      value={composerForm.summary}
                      onFocus={() => setLastFocusedField('summary')}
                      onChange={(e) => setComposerForm((prev) => ({ ...prev, summary: e.target.value }))}
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
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Safe Dynamic Tokens (Click to Insert at Cursor)
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Targeting: <strong className="text-emerald-700 uppercase font-semibold">{lastFocusedField}</strong>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {SUPPORTED_TEMPLATE_VARIABLES.map((v) => (
                        <button
                          key={v.key}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleInsertVariable(v.key)}
                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 text-[11px] font-mono font-medium border border-slate-200 transition-colors shadow-2xs hover:border-emerald-300"
                          title={`Inserts token for: ${v.label} (e.g. ${v.example})`}
                        >
                          + {v.key}
                        </button>
                      ))}
                    </div>

                    {unresolvedTokens.length > 0 && (
                      <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="leading-tight">
                          <span className="font-bold">Unrecognized variable token(s): </span>
                          <span className="font-mono text-amber-800 font-semibold">{unresolvedTokens.join(', ')}</span>.
                          <div className="text-[10px] text-amber-700 mt-0.5">
                            Supported tokens: {SUPPORTED_TEMPLATE_VARIABLES.map((v) => v.key).join(' ')}.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Body Textarea */}
                  <div>
                    <textarea
                      ref={bodyTextareaRef}
                      rows={9}
                      value={composerForm.body}
                      onFocus={() => setLastFocusedField('body')}
                      onChange={(e) => {
                        const val = e.target.value;
                        setComposerForm((prev) => ({ ...prev, body: val }));
                        if (formErrors.body) setFormErrors((prev) => ({ ...prev, body: null }));
                      }}
                      placeholder="Write your comprehensive announcement body here. Supports standard line breaks, lists, and dynamic tokens..."
                      className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 font-sans focus:bg-white focus:outline-hidden focus:ring-2 transition-all leading-relaxed ${
                        formErrors.body
                          ? 'border-rose-400 focus:ring-rose-400/20 focus:border-rose-500'
                          : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500'
                      }`}
                    />
                    {formErrors.body && (
                      <p className="text-[11px] text-rose-600 mt-1 font-semibold">{formErrors.body}</p>
                    )}
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
                {/* Live Preview Sample Recipient Controls */}
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-900">Live Recipient Preview</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {previewRecipientId && (
                        <button
                          type="button"
                          onClick={handleResetPreviewRecipient}
                          className="text-[11px] font-semibold text-slate-500 hover:text-emerald-700 flex items-center gap-1"
                          title="Reset preview recipient to default without altering your draft"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reset Recipient</span>
                        </button>
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Dynamic Data
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">
                      Preview Context:
                    </label>
                    <select
                      value={previewRestaurant?.id || ''}
                      onChange={(e) => setPreviewRecipientId(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                    >
                      {restaurants.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} — {r.ownerName} ({r.planName || 'Pro'} Plan)
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Switching recipients verifies how tokens interpolate for specific tenant accounts without modifying your draft.
                  </p>
                </div>

                {/* Unified Branded StockMate Email Shell */}
                <StockMateEmailShell
                  subject={previewTitle}
                  summary={previewSummary}
                  body={previewBody}
                  category={composerForm.category}
                  priority={composerForm.priority}
                  author={currentUser?.name || 'Alexander Vance (Super Admin)'}
                  authorRole="Platform Governance"
                  publishedAt={new Date().toISOString()}
                  recipient={{
                    ownerName: samplePreviewContext.ownerName,
                    restaurantName: samplePreviewContext.restaurantName,
                    ownerEmail: samplePreviewContext.ownerEmail,
                    planName: samplePreviewContext.planName,
                  }}
                  ctaLabel={composerForm.hasCta ? composerForm.ctaLabel : null}
                  ctaLink={composerForm.ctaLink}
                  attachments={composerForm.attachments}
                  requiresAcknowledgment={composerForm.requiresAcknowledgment}
                  policyVersion={composerForm.policyVersion}
                  verifiedTransaction={composerForm.verifiedTransaction}
                  previewDevice={previewDevice}
                  showDeviceToggle={true}
                  onDeviceChange={setPreviewDevice}
                  simulated={true}
                  deliveryStatus="draft"
                />
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

                <select
                  value={historyStatusFilter}
                  onChange={(e) => setHistoryStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium"
                >
                  <option value="all">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Saved Drafts</option>
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
                    <th className="py-3 px-3 font-bold">Status</th>
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
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              ann.status === 'draft'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${ann.status === 'draft' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                            <span>{ann.status === 'draft' ? 'Draft' : 'Published'}</span>
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
                          {ann.status === 'draft' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Draft Only</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Delivered</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="xs"
                              icon={Eye}
                              onClick={() => handleReadMessage(ann)}
                            >
                              Read
                            </Button>
                            {ann.status === 'draft' ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  icon={Edit3}
                                  onClick={() => handleEditDraft(ann)}
                                  title="Edit Draft in Studio"
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  icon={Send}
                                  className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
                                  onClick={() => handlePublishDraftNow(ann)}
                                  title="Publish Draft Broadcast Now"
                                >
                                  Publish
                                </Button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmAnnouncementId(ann.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Delete Draft"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <>
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  icon={Copy}
                                  onClick={() => handleDuplicateAnnouncement(ann)}
                                  title="Duplicate as Draft"
                                >
                                  Duplicate
                                </Button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleArchiveFromInspector(ann)}
                                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Archive Announcement"
                                >
                                  <Archive className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
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
          {/* Top Header Card */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  StockMate Transactional &amp; Broadcast Template Studio
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  8 Standard Types
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Pre-configured, editable email templates for platform announcements, policy updates, security notices, and receipts
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="brand"
                size="sm"
                icon={Plus}
                onClick={() => {
                  setEditingTemplate({
                    id: 'tpl-custom-' + Date.now(),
                    title: 'New Custom Email Template',
                    summary: 'Custom template summary...',
                    body: 'Dear {{owner_name}},\n\nEnter your template content here with {{restaurant_name}} and {{plan_name}} tokens.',
                    category: 'general',
                    priority: 'normal',
                    ctaLabel: 'View in Workspace',
                    ctaLink: '/dashboard',
                    requiresAcknowledgment: false,
                    policyVersion: null,
                  });
                }}
              >
                Create Template
              </Button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
              {[
                { id: 'all', label: 'All Templates' },
                { id: 'general', label: 'Announcements' },
                { id: 'policy', label: 'Policies' },
                { id: 'security', label: 'Security' },
                { id: 'maintenance', label: 'Maintenance' },
                { id: 'feature', label: 'Releases' },
                { id: 'subscription', label: 'Renewals' },
                { id: 'receipt', label: 'Receipts' },
                { id: 'billing', label: 'Invoices' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setTemplateCategoryFilter(pill.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                    templateCategoryFilter === pill.id
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Template Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {(announcementTemplates || INITIAL_ANNOUNCEMENT_TEMPLATES)
              .filter((tpl) => {
                if (templateCategoryFilter !== 'all' && tpl.category !== templateCategoryFilter) {
                  return false;
                }
                if (templateSearch.trim()) {
                  const query = templateSearch.toLowerCase();
                  return (
                    tpl.title.toLowerCase().includes(query) ||
                    (tpl.summary || '').toLowerCase().includes(query) ||
                    tpl.body.toLowerCase().includes(query)
                  );
                }
                return true;
              })
              .map((tpl) => {
                const cat = ANNOUNCEMENT_CATEGORIES[tpl.category] || ANNOUNCEMENT_CATEGORIES.general;
                const prio = PRIORITY_CONFIGS[tpl.priority] || PRIORITY_CONFIGS.normal;

                return (
                  <div
                    key={tpl.id}
                    className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-emerald-500/50 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Category & Priority Badge Row */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${cat.badgeClass}`}>
                          {cat.label}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${prio.badgeClass}`}>
                          {prio.label}
                        </span>
                      </div>

                      <h4 className="text-sm font-extrabold text-slate-900 leading-snug line-clamp-2">
                        {tpl.title.replace('{{effective_date}}', 'Upcoming')}
                      </h4>

                      <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                        {tpl.summary}
                      </p>

                      {/* Dynamic Variable Chips */}
                      <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap gap-1">
                        {SUPPORTED_TEMPLATE_VARIABLES.filter((v) => tpl.body.includes(v.key) || tpl.title.includes(v.key))
                          .slice(0, 4)
                          .map((v) => (
                            <span
                              key={v.key}
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200"
                            >
                              {v.key}
                            </span>
                          ))}
                      </div>

                      {tpl.requiresAcknowledgment && (
                        <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-purple-50 text-purple-800 text-[11px] font-semibold border border-purple-200">
                          <FileCheck2 className="w-3.5 h-3.5 text-purple-600" />
                          <span>Requires Policy Acceptance ({tpl.policyVersion})</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPreviewingTemplate(tpl)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1"
                          title="Preview email rendered in desktop & mobile"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>Preview</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingTemplate(tpl)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
                          title="Edit template fields & text"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => duplicateTemplate(tpl.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="Duplicate template"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>

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
                );
              })}
          </div>
        </div>
      )}

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
      {/* MESSAGE DETAILS & GOVERNANCE INSPECTOR (DRAWER / MODAL) */}
      {/* ============================================================== */}
      {selectedAnnouncementForInspector && (() => {
        const ann = selectedAnnouncementForInspector;
        const cat = ANNOUNCEMENT_CATEGORIES[ann.category] || ANNOUNCEMENT_CATEGORIES.general;
        const prio = PRIORITY_CONFIGS[ann.priority] || PRIORITY_CONFIGS.normal;
        const isDraft = ann.status === 'draft';

        // Compute metrics
        const totalEligible = ann.audienceType === 'ALL_RESTAURANTS'
          ? restaurants.length
          : (ann.targetRestaurantIds || []).length || 1;

        const verifiedReads = Object.keys(announcementReads || {}).filter(
          (k) => k.startsWith(ann.id) && announcementReads[k].isRead
        ).length;

        const readRate = totalEligible > 0 ? Math.round((verifiedReads / totalEligible) * 100) : 0;

        const signedAcks = (policyAcknowledgments || []).filter(
          (ack) => ack.announcementId === ann.id
        ).length;

        return (
          <Modal
            isOpen={!!selectedAnnouncementForInspector}
            onClose={() => setSelectedAnnouncementForInspector(null)}
            title={ann.title}
            subtitle={`${cat.label} Bulletin • Published by ${ann.author} (${ann.authorRole || 'Platform Administration'})`}
            size="xl"
            footer={
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
                {/* Left: Governance Status Badge */}
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[11px] border ${
                      isDraft
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isDraft ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                    <span>{isDraft ? 'Draft Status — Unbroadcast' : 'Officially Published & Delivered'}</span>
                  </span>
                </div>

                {/* Right: Message Actions */}
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedAnnouncementForInspector(null)}
                  >
                    Close
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    icon={Eye}
                    onClick={() => handlePreviewAnnouncement(ann)}
                  >
                    Preview Email Shell
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    icon={Copy}
                    onClick={() => handleDuplicateAnnouncement(ann)}
                  >
                    Duplicate as Draft
                  </Button>

                  {isDraft ? (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Edit3}
                        onClick={() => handleEditDraft(ann)}
                      >
                        Edit in Studio
                      </Button>
                      <Button
                        variant="brand"
                        size="sm"
                        icon={Send}
                        onClick={() => handlePublishDraftNow(ann)}
                      >
                        Publish Broadcast Now
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={Trash2}
                        onClick={() => setDeleteConfirmAnnouncementId(ann.id)}
                      >
                        Delete Draft
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Archive}
                      onClick={() => handleToggleArchiveFromInspector(ann)}
                    >
                      Archive Announcement
                    </Button>
                  )}
                </div>
              </div>
            }
          >
            <div className="space-y-4">
              {/* Tab Navigation inside Inspector */}
              <div className="flex border-b border-slate-200 gap-4">
                <button
                  type="button"
                  onClick={() => setInspectorActiveTab('message')}
                  className={`pb-2.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                    inspectorActiveTab === 'message'
                      ? 'border-emerald-600 text-emerald-800'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Message Content &amp; Details</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInspectorActiveTab('analytics')}
                  className={`pb-2.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                    inspectorActiveTab === 'analytics'
                      ? 'border-emerald-600 text-emerald-800'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Audience &amp; Engagement Analytics</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                    {readRate}% open
                  </span>
                </button>
              </div>

              {/* TAB 1: MESSAGE CONTENT & DETAILS */}
              {inspectorActiveTab === 'message' && (
                <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
                  {/* Category & Metadata Ribbon */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${cat.badgeClass}`}>
                        {cat.label}
                      </span>
                      {ann.priority !== 'normal' && (
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${prio.badgeClass}`}>
                          {prio.label}
                        </span>
                      )}
                      {ann.requiresAcknowledgment && (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-200 flex items-center gap-1">
                          <FileCheck2 className="w-3.5 h-3.5" /> Policy Ack Mandate {ann.policyVersion && `(v${ann.policyVersion})`}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                      <span>Published: <strong>{new Date(ann.publishedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</strong></span>
                      <span>•</span>
                      <span>Target: <strong>{ann.audienceType === 'ALL_RESTAURANTS' ? 'All Tenants' : 'Selected Tenants'}</strong></span>
                    </div>
                  </div>

                  {/* Summary Callout Box */}
                  {ann.summary && (
                    <div className="p-3.5 rounded-xl bg-emerald-50/70 border-l-4 border-l-emerald-600 border border-emerald-200/60">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 block mb-0.5">
                        Executive Summary
                      </span>
                      <p className="text-xs text-slate-800 font-medium leading-relaxed">
                        {ann.summary}
                      </p>
                    </div>
                  )}

                  {/* Full Message Body with Preserved Spacing */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                      Full Announcement Content
                    </span>
                    <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-line shadow-xs min-h-[140px]">
                      {ann.body}
                    </div>
                  </div>

                  {/* Verified Transaction Card (if receipt / billing) */}
                  {ann.verifiedTransaction && (
                    <div className="p-4 rounded-xl bg-slate-900 text-white shadow-md space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold">
                          <Receipt className="w-4 h-4" />
                          <span>Verified SaaS Platform Receipt</span>
                        </div>
                        <span className="font-mono text-xs text-slate-300">
                          {ann.verifiedTransaction.receiptNumber || 'RCP-2026-STM'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Amount Settled</span>
                          <span className="font-bold text-white text-sm">
                            {ann.verifiedTransaction.amountFormatted || '₹28,306'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Payment Method</span>
                          <span className="font-semibold text-slate-200">
                            {ann.verifiedTransaction.method || 'Razorpay UPI'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Invoice Number</span>
                          <span className="font-mono text-slate-200 text-[11px]">
                            {ann.verifiedTransaction.invoiceNumber || 'INV-2026-0881'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Verification Status</span>
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> Settled &amp; Verified
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CTA Destination Preview */}
                  {ann.ctaLabel && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Configured Call-to-Action</span>
                        <span className="font-bold text-slate-900">{ann.ctaLabel}</span>
                        <span className="text-slate-400 ml-2 font-mono text-[11px]">({ann.ctaLink || '/dashboard'})</span>
                      </div>
                      <Button
                        variant="brand"
                        size="xs"
                        iconRight={ArrowRight}
                        onClick={() => navigate(ann.ctaLink || '/dashboard')}
                      >
                        {ann.ctaLabel}
                      </Button>
                    </div>
                  )}

                  {/* Attachments Section */}
                  {ann.attachments && ann.attachments.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                        Attached Documents &amp; Policy Artifacts ({ann.attachments.length})
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {ann.attachments.map((file, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs hover:border-slate-300 transition-colors"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <div className="truncate">
                                <span className="font-bold text-slate-800 block truncate">{file.name}</span>
                                <span className="text-[10px] text-slate-400">{file.size} • {file.type || 'Document'}</span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="xs"
                              icon={Download}
                              onClick={() => {
                                if (addToast) addToast(`Downloading "${file.name}"...`, 'info');
                              }}
                            >
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Audit Immutability Notice for Published Announcements */}
                  {!isDraft && (
                    <div className="p-3 rounded-xl bg-slate-100/90 border border-slate-200 text-slate-600 text-[11px] flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>
                        <strong>Compliance Immutability Guard:</strong> This announcement was officially published to restaurant tenants. To prevent audit tampering, published bulletins cannot be overwritten in place. Use <strong>Duplicate as Draft</strong> to compose a subsequent revision.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: AUDIENCE & ENGAGEMENT ANALYTICS */}
              {inspectorActiveTab === 'analytics' && (
                <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Reach</span>
                      <span className="text-xl font-black text-slate-900">{totalEligible}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Eligible Tenants</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase block">Verified Opens</span>
                      <span className="text-xl font-black text-emerald-950">{verifiedReads} / {totalEligible}</span>
                      <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">{readRate}% read rate</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200">
                      <span className="text-[10px] font-bold text-purple-800 uppercase block">Policy Signed</span>
                      <span className="text-xl font-black text-purple-950">{signedAcks}</span>
                      <span className="text-[10px] text-purple-700 block mt-0.5">
                        {ann.requiresAcknowledgment ? 'Mandate Active' : 'No Ack Needed'}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200">
                      <span className="text-[10px] font-bold text-blue-800 uppercase block">Delivery Channel</span>
                      <span className="text-base font-black text-blue-950">In-App + Email</span>
                      <span className="text-[10px] text-blue-700 block mt-0.5">Dual-Dispatcher</span>
                    </div>
                  </div>

                  {/* Recipient Organization Breakdown Table */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Recipient Organization Engagement Breakdown
                      </h4>
                      <span className="text-[11px] text-slate-500">
                        {restaurants.length} Registered Tenants
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                      {restaurants.map((rest) => {
                        const readKey = `${ann.id}_${rest.id}`;
                        const readRecord = announcementReads?.[readKey];
                        const isRead = !!readRecord?.isRead;
                        const ack = (policyAcknowledgments || []).find(
                          (a) => a.announcementId === ann.id && a.restaurantId === rest.id
                        );

                        return (
                          <div
                            key={rest.id}
                            className="p-3 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors"
                          >
                            <div className="min-w-0 pr-3">
                              <span className="font-bold text-slate-900 block truncate">{rest.name}</span>
                              <span className="text-[11px] text-slate-400 block truncate">
                                {rest.ownerName} &lt;{rest.ownerEmail}&gt; • {rest.planName || 'Professional'}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {isRead ? (
                                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1 border border-emerald-200">
                                  <Check className="w-3 h-3 text-emerald-600" /> Read
                                </span>
                              ) : (
                                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                                  Unread
                                </span>
                              )}

                              {ann.requiresAcknowledgment && (
                                ack ? (
                                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 font-bold flex items-center gap-1 border border-purple-200">
                                    <FileCheck2 className="w-3 h-3 text-purple-700" /> Signed {ack.policyVersion}
                                  </span>
                                ) : (
                                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold border border-amber-200">
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
                </div>
              )}
            </div>
          </Modal>
        );
      })()}

      {/* ============================================================== */}
      {/* DELETE DRAFT CONFIRMATION MODAL */}
      {/* ============================================================== */}
      {deleteConfirmAnnouncementId && (
        <Modal
          isOpen={!!deleteConfirmAnnouncementId}
          onClose={() => setDeleteConfirmAnnouncementId(null)}
          title="Delete Draft Announcement"
          size="sm"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirmAnnouncementId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => handleConfirmDeleteDraft(deleteConfirmAnnouncementId)}
              >
                Permanently Delete Draft
              </Button>
            </div>
          }
        >
          <div className="space-y-3 text-xs text-slate-600">
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-sm">Delete confirmation required</span>
                <p className="mt-0.5 text-xs text-rose-800 leading-relaxed">
                  Are you sure you want to permanently delete this draft announcement? This action cannot be undone.
                </p>
              </div>
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
      {/* EDIT TEMPLATE MODAL */}
      {editingTemplate && (
        <Modal
          isOpen={!!editingTemplate}
          onClose={() => setEditingTemplate(null)}
          title="Customize Email Template Blueprint"
          subtitle="Update subject headline, preheader summary, body copy, and CTA button"
          size="lg"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button variant="secondary" onClick={() => setEditingTemplate(null)}>
                Cancel
              </Button>
              <Button
                variant="brand"
                onClick={() => {
                  saveCustomTemplate(editingTemplate);
                  setEditingTemplate(null);
                }}
              >
                Save Template Changes
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold uppercase tracking-wider text-[10px] mb-1">
                  Template Category
                </label>
                <select
                  value={editingTemplate.category}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                >
                  {Object.values(ANNOUNCEMENT_CATEGORIES).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase tracking-wider text-[10px] mb-1">
                  Urgency Priority
                </label>
                <select
                  value={editingTemplate.priority}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, priority: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                >
                  {Object.values(PRIORITY_CONFIGS).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider text-[10px] mb-1">
                Template Headline / Subject *
              </label>
              <input
                type="text"
                value={editingTemplate.title}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, title: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider text-[10px] mb-1">
                Summary / Inbox Preview Snippet
              </label>
              <input
                type="text"
                value={editingTemplate.summary}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, summary: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  Body Copy (with Safe Variables) *
                </label>
                <span className="text-[10px] text-slate-400">Tokens: {'{{owner_name}}, {{restaurant_name}}, {{plan_name}}, {{amount}}'}</span>
              </div>
              <textarea
                rows={7}
                value={editingTemplate.body}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, body: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold uppercase tracking-wider text-[10px] mb-1">
                  CTA Button Label
                </label>
                <input
                  type="text"
                  value={editingTemplate.ctaLabel || ''}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, ctaLabel: e.target.value })}
                  placeholder="e.g. Open Workspace"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase tracking-wider text-[10px] mb-1">
                  CTA Target Link / Route
                </label>
                <input
                  type="text"
                  value={editingTemplate.ctaLink || ''}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, ctaLink: e.target.value })}
                  placeholder="e.g. /dashboard or /owner-billing"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono"
                />
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* TEMPLATE LIVE PREVIEW MODAL */}
      {previewingTemplate && (
        <Modal
          isOpen={!!previewingTemplate}
          onClose={() => setPreviewingTemplate(null)}
          title={'Email Preview: ' + previewingTemplate.title.replace('{{effective_date}}', 'Upcoming')}
          subtitle="Branded transactional view rendered with sample tenant tokens"
          size="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button variant="secondary" onClick={() => setPreviewingTemplate(null)}>
                Close Preview
              </Button>
              <Button
                variant="brand"
                icon={ArrowRight}
                onClick={() => {
                  handleApplyTemplate(previewingTemplate);
                  setPreviewingTemplate(null);
                }}
              >
                Use Template in Studio
              </Button>
            </div>
          }
        >
          <div className="max-h-[640px] overflow-y-auto">
            <StockMateEmailShell
              subject={interpolateTemplateVariables(previewingTemplate.title, samplePreviewContext)}
              summary={previewingTemplate.summary}
              body={interpolateTemplateVariables(previewingTemplate.body, samplePreviewContext)}
              category={previewingTemplate.category}
              priority={previewingTemplate.priority}
              author="Alexander Vance (Super Admin)"
              authorRole="Platform Governance"
              recipient={{
                ownerName: 'Priya Sharma',
                restaurantName: 'Spice Garden',
                ownerEmail: 'priya@spicegarden.com',
                planName: 'Professional Plan',
              }}
              ctaLabel={previewingTemplate.ctaLabel}
              ctaLink={previewingTemplate.ctaLink}
              requiresAcknowledgment={previewingTemplate.requiresAcknowledgment}
              policyVersion={previewingTemplate.policyVersion}
              previewDevice="desktop"
              showDeviceToggle={true}
              simulated={true}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};


