import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Inbox,
  Mail,
  MailCheck,
  Archive,
  ArchiveRestore,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Clock,
  Sparkles,
  Megaphone,
  FileCheck2,
  CreditCard,
  Receipt,
  Wrench,
  ShieldAlert,
  Paperclip,
  Download,
  ExternalLink,
  Check,
  ChevronRight,
  ShieldCheck,
  Info,
  Calendar,
  Lock,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  ANNOUNCEMENT_CATEGORIES,
  PRIORITY_CONFIGS,
  interpolateTemplateVariables,
} from '../../data/announcementData';

export const OwnerInboxPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    currentUser,
    currentRestaurant,
    announcements,
    announcementReads,
    announcementArchives,
    policyAcknowledgments,
    markAnnouncementAsRead,
    markAnnouncementAsUnread,
    toggleArchiveAnnouncement,
    acknowledgePolicy,
    addToast,
  } = useApp();

  // Redirect Super Admin to Communication Center if visiting /inbox
  useEffect(() => {
    if (currentUser?.role === 'super_admin') {
      navigate('/admin/communication', { replace: true });
    }
  }, [currentUser, navigate]);

  // Active folder / category filter
  // 'all' | 'unread' | 'important' | 'policy' | 'subscription' | 'maintenance' | 'feature' | 'archived'
  const [activeFolder, setActiveFolder] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState(null);

  // Policy acknowledgment modal state
  const [showAckModal, setShowAckModal] = useState(false);
  const [isSubmittingAck, setIsSubmittingAck] = useState(false);

  // Auto-select announcement from URL ?id= parameter
  useEffect(() => {
    const idParam = searchParams.get('id');
    if (idParam) {
      setSelectedAnnouncementId(idParam);
      if (currentRestaurant) {
        markAnnouncementAsRead(idParam, currentRestaurant.id);
      }
    }
  }, [searchParams, currentRestaurant, markAnnouncementAsRead]);

  // Filter announcements for current restaurant organization (Strict Data Isolation)
  const tenantAnnouncements = useMemo(() => {
    if (!currentRestaurant) return [];

    return announcements
      .filter((ann) => {
        if (ann.status !== 'published') return false;
        // Tenant scope check:
        // 1. All restaurants broadcast
        if (ann.audienceType === 'ALL_RESTAURANTS') return true;
        // 2. Specific restaurant target
        if (
          ann.audienceType === 'SPECIFIC_RESTAURANTS' &&
          Array.isArray(ann.targetRestaurantIds) &&
          ann.targetRestaurantIds.includes(currentRestaurant.id)
        ) {
          return true;
        }
        // 3. Plan tier target
        if (
          ann.audienceType === 'SUBSCRIPTION_TIER' &&
          Array.isArray(ann.targetPlanIds) &&
          ann.targetPlanIds.includes(currentRestaurant.planId)
        ) {
          return true;
        }
        return false;
      })
      .map((ann) => {
        const readKey = `${ann.id}_${currentRestaurant.id}`;
        const isRead = !!announcementReads?.[readKey]?.isRead;
        const readAt = announcementReads?.[readKey]?.readAt || null;
        const isArchived = !!announcementArchives?.[readKey];
        const ack = (policyAcknowledgments || []).find(
          (a) => a.announcementId === ann.id && a.restaurantId === currentRestaurant.id
        );

        return {
          ...ann,
          isRead,
          readAt,
          isArchived,
          acknowledged: !!ack,
          acknowledgedAt: ack?.acknowledgedAt || null,
          acknowledgedBy: ack?.ownerName || null,
        };
      })
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }, [announcements, currentRestaurant, announcementReads, announcementArchives, policyAcknowledgments]);

  // Folder Counts
  const folderCounts = useMemo(() => {
    const unarchived = tenantAnnouncements.filter((a) => !a.isArchived);
    return {
      all: unarchived.length,
      unread: unarchived.filter((a) => !a.isRead).length,
      important: unarchived.filter((a) => a.priority === 'urgent' || a.priority === 'important').length,
      policy: unarchived.filter((a) => a.category === 'policy').length,
      subscription: unarchived.filter((a) => a.category === 'subscription' || a.category === 'billing').length,
      maintenance: unarchived.filter((a) => a.category === 'maintenance').length,
      feature: unarchived.filter((a) => a.category === 'feature').length,
      archived: tenantAnnouncements.filter((a) => a.isArchived).length,
    };
  }, [tenantAnnouncements]);

  // Filtered by selected folder and search query
  const filteredList = useMemo(() => {
    return tenantAnnouncements.filter((ann) => {
      // Archive handling
      if (activeFolder === 'archived') {
        if (!ann.isArchived) return false;
      } else {
        if (ann.isArchived) return false;
      }

      // Folder filters
      if (activeFolder === 'unread' && ann.isRead) return false;
      if (
        activeFolder === 'important' &&
        ann.priority !== 'urgent' &&
        ann.priority !== 'important'
      ) {
        return false;
      }
      if (activeFolder === 'policy' && ann.category !== 'policy') return false;
      if (
        activeFolder === 'subscription' &&
        ann.category !== 'subscription' &&
        ann.category !== 'billing'
      ) {
        return false;
      }
      if (activeFolder === 'maintenance' && ann.category !== 'maintenance') return false;
      if (activeFolder === 'feature' && ann.category !== 'feature') return false;

      // Search matching
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = ann.title?.toLowerCase().includes(query);
        const matchesSummary = ann.summary?.toLowerCase().includes(query);
        const matchesBody = ann.body?.toLowerCase().includes(query);
        return matchesTitle || matchesSummary || matchesBody;
      }

      return true;
    });
  }, [tenantAnnouncements, activeFolder, searchTerm]);

  // Active selected announcement
  const activeAnnouncement = useMemo(() => {
    if (!selectedAnnouncementId && filteredList.length > 0) {
      return filteredList[0];
    }
    return tenantAnnouncements.find((a) => a.id === selectedAnnouncementId) || filteredList[0] || null;
  }, [selectedAnnouncementId, filteredList, tenantAnnouncements]);

  // When clicking an announcement row
  const handleSelectAnnouncement = (ann) => {
    setSelectedAnnouncementId(ann.id);
    if (!ann.isRead) {
      markAnnouncementAsRead(ann.id, currentRestaurant.id);
    }
  };

  // Toggle Read / Unread
  const handleToggleRead = (ann) => {
    if (ann.isRead) {
      markAnnouncementAsUnread(ann.id, currentRestaurant.id);
      addToast('Marked as unread', 'info');
    } else {
      markAnnouncementAsRead(ann.id, currentRestaurant.id);
      addToast('Marked as read', 'success');
    }
  };

  // Toggle Archive
  const handleToggleArchive = (ann) => {
    toggleArchiveAnnouncement(ann.id, currentRestaurant.id);
    addToast(ann.isArchived ? 'Restored to inbox' : 'Archived announcement', 'info');
  };

  // Formal Policy Acknowledgment Execution
  const handleConfirmAcknowledgment = () => {
    if (!activeAnnouncement) return;
    setIsSubmittingAck(true);

    setTimeout(() => {
      acknowledgePolicy(
        activeAnnouncement.id,
        activeAnnouncement.policyVersion || 'v2.4',
        currentRestaurant.id
      );
      setIsSubmittingAck(false);
      setShowAckModal(false);
    }, 400);
  };

  // Interpolate body for reading pane
  const interpolatedBody = useMemo(() => {
    if (!activeAnnouncement) return '';
    const ctx = {
      restaurantName: currentRestaurant?.name || 'Your Restaurant',
      ownerName: currentUser?.name || 'Restaurant Partner',
      planName: currentRestaurant?.planName || 'Professional Plan',
      renewalDate: currentRestaurant?.renewalDate || 'Upcoming Cycle',
      effectiveDate: activeAnnouncement.effectiveDate || 'Immediately',
      platformLink: '#/dashboard',
    };
    return interpolateTemplateVariables(activeAnnouncement.body, ctx);
  }, [activeAnnouncement, currentRestaurant, currentUser]);

  const activeCategoryObj = activeAnnouncement
    ? ANNOUNCEMENT_CATEGORIES[activeAnnouncement.category] || ANNOUNCEMENT_CATEGORIES.general
    : null;

  const activePriorityObj = activeAnnouncement
    ? PRIORITY_CONFIGS[activeAnnouncement.priority] || PRIORITY_CONFIGS.normal
    : null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Inbox & Announcements"
        subtitle="Official platform bulletins, policy compliance updates, maintenance windows, and billing notices"
        badge={
          <Badge
            status="restaurant_owner"
            label={`${currentRestaurant?.name || 'Spice Garden'} Scope`}
          />
        }
        actions={
          <div className="flex items-center gap-2">
            {folderCounts.unread > 0 && (
              <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                <span>{folderCounts.unread} unread bulletins</span>
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              icon={ExternalLink}
              onClick={() => navigate('/notifications')}
            >
              System Activity Alerts
            </Button>
          </div>
        }
      />

      {/* Main 2-Column Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[680px]">
        {/* Left Sub-Sidebar / Navigation Folders (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
            {[
              { id: 'all', label: 'All Announcements', icon: Inbox, count: folderCounts.all },
              { id: 'unread', label: 'Unread Only', icon: Mail, count: folderCounts.unread, highlight: folderCounts.unread > 0 },
              { id: 'important', label: 'Urgent & Important', icon: AlertOctagon, count: folderCounts.important },
              { id: 'policy', label: 'Platform Policies', icon: FileCheck2, count: folderCounts.policy },
              { id: 'subscription', label: 'Subscription & Billing', icon: CreditCard, count: folderCounts.subscription },
              { id: 'maintenance', label: 'Maintenance Windows', icon: Wrench, count: folderCounts.maintenance },
              { id: 'feature', label: 'New Product Features', icon: Sparkles, count: folderCounts.feature },
              { id: 'archived', label: 'Archived Bulletins', icon: Archive, count: folderCounts.archived },
            ].map((folder) => {
              const Icon = folder.icon;
              const isActive = activeFolder === folder.id;

              return (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => {
                    setActiveFolder(folder.id);
                    setSelectedAnnouncementId(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-emerald-400' : 'text-slate-400'
                      }`}
                    />
                    <span>{folder.label}</span>
                  </div>
                  {folder.count > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-slate-800 text-slate-200'
                          : folder.highlight
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {folder.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Compliance & Safety Info Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md text-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Platform Channel</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              All messages in this inbox originate directly from authorized StockMate Platform Administrators.
            </p>
          </div>
        </div>

        {/* Middle: Message List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search in bulletins..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs"
            />
          </div>

          {/* List of Messages */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden divide-y divide-slate-100 max-h-[620px] overflow-y-auto">
            {filteredList.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-400">
                <Inbox className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="font-semibold text-slate-600">No announcements found</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Your inbox is up to date in this folder.
                </p>
              </div>
            ) : (
              filteredList.map((ann) => {
                const isSelected = activeAnnouncement?.id === ann.id;
                const cat =
                  ANNOUNCEMENT_CATEGORIES[ann.category] || ANNOUNCEMENT_CATEGORIES.general;
                const prio =
                  PRIORITY_CONFIGS[ann.priority] || PRIORITY_CONFIGS.normal;

                return (
                  <div
                    key={ann.id}
                    onClick={() => handleSelectAnnouncement(ann)}
                    className={`p-3.5 cursor-pointer transition-all border-l-4 ${
                      isSelected
                        ? 'bg-emerald-50/40 border-l-emerald-600'
                        : ann.priority === 'urgent'
                        ? 'border-l-rose-500 hover:bg-slate-50'
                        : !ann.isRead
                        ? 'border-l-emerald-400 bg-slate-50/50 hover:bg-slate-50'
                        : 'border-l-transparent hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 truncate">
                        {!ann.isRead && (
                          <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>
                        )}
                        <span className="text-[11px] font-bold text-slate-800 truncate">
                          StockMate Admin
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(ann.publishedAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <h4
                      className={`text-xs leading-snug line-clamp-1 ${
                        !ann.isRead ? 'font-black text-slate-900' : 'font-semibold text-slate-700'
                      }`}
                    >
                      {ann.title}
                    </h4>

                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {ann.summary || ann.body}
                    </p>

                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-md border font-semibold ${cat.badgeClass}`}>
                        {cat.label}
                      </span>
                      {ann.priority !== 'normal' && (
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-md border font-bold ${prio.badgeClass}`}>
                          {prio.label}
                        </span>
                      )}
                      {ann.requiresAcknowledgment && !ann.acknowledged && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-purple-100 text-purple-900 font-bold">
                          Ack Required
                        </span>
                      )}
                      {ann.requiresAcknowledgment && ann.acknowledged && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 font-bold flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" /> Acknowledged
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Message Details Reading Pane (5 cols) */}
        <div className="lg:col-span-5">
          {activeAnnouncement ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between min-h-[620px]">
              {/* Reading Header */}
              <div className="p-5 border-b border-slate-100 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${activeCategoryObj.badgeClass}`}>
                      {activeCategoryObj.label}
                    </span>
                    {activeAnnouncement.priority !== 'normal' && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${activePriorityObj.badgeClass}`}>
                        {activePriorityObj.label}
                      </span>
                    )}
                  </div>

                  {/* Actions: Mark read/unread & Archive */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleToggleRead(activeAnnouncement)}
                      className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                      title={activeAnnouncement.isRead ? 'Mark as Unread' : 'Mark as Read'}
                    >
                      {activeAnnouncement.isRead ? (
                        <MailCheck className="w-4 h-4 text-emerald-700" />
                      ) : (
                        <Mail className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleArchive(activeAnnouncement)}
                      className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                      title={activeAnnouncement.isArchived ? 'Restore to Inbox' : 'Archive Announcement'}
                    >
                      {activeAnnouncement.isArchived ? (
                        <ArchiveRestore className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Archive className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {activeAnnouncement.title}
                </h3>

                {/* Sender Details */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                      SM
                    </div>
                    <div>
                      <div className="flex items-center gap-1 font-bold text-slate-900">
                        <span>StockMate Platform Administration</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {activeAnnouncement.author || 'Platform Governance Lead'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(activeAnnouncement.publishedAt).toLocaleString([], {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
              </div>

              {/* Reading Content Body */}
              <div className="p-5 flex-1 space-y-4 overflow-y-auto max-h-[460px]">
                {/* Policy Compliance Banner */}
                {activeAnnouncement.requiresAcknowledgment && (
                  <div className="p-4 rounded-xl bg-purple-50 border border-purple-200/90 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-950">
                      <FileCheck2 className="w-4 h-4 text-purple-700" />
                      <span>
                        Policy Compliance Review Required (Version {activeAnnouncement.policyVersion || 'v2.4'})
                      </span>
                    </div>
                    <p className="text-[11px] text-purple-900/90 leading-relaxed">
                      This platform policy applies to all operations at {currentRestaurant?.name}. Formal review and acknowledgment must be submitted by the restaurant owner before the effective date ({activeAnnouncement.effectiveDate}).
                    </p>

                    {activeAnnouncement.acknowledged ? (
                      <div className="pt-2 border-t border-purple-200/60 flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>
                          Formally Acknowledged by {activeAnnouncement.acknowledgedBy} on{' '}
                          {new Date(activeAnnouncement.acknowledgedAt).toLocaleDateString()}
                        </span>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-purple-200/60 flex items-center justify-between gap-3">
                        <span className="text-[11px] font-semibold text-purple-800">
                          Status: Pending Owner Digital Acknowledgment
                        </span>
                        <Button
                          variant="brand"
                          size="xs"
                          icon={Check}
                          onClick={() => setShowAckModal(true)}
                        >
                          Review &amp; Formally Acknowledge
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Formatted Message Body */}
                <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                  {interpolatedBody}
                </div>

                {/* Attachments Section */}
                {activeAnnouncement.attachments && activeAnnouncement.attachments.length > 0 && (
                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Attached Documents ({activeAnnouncement.attachments.length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeAnnouncement.attachments.map((att, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 hover:bg-slate-100/70 transition-colors"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Paperclip className="w-4 h-4 text-slate-400 shrink-0" />
                            <div className="truncate">
                              <span className="font-semibold block truncate">{att.name}</span>
                              <span className="text-[10px] text-slate-400">{att.size}</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="xs"
                            icon={Download}
                            onClick={() => addToast(`Simulated download: "${att.name}"`, 'success')}
                            title="Download verified document"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Reading Footer / CTA */}
              {activeAnnouncement.ctaLabel && (
                <div className="p-4 border-t border-slate-100 bg-slate-50/70 rounded-b-2xl flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Target Route: <code className="font-mono text-emerald-800">{activeAnnouncement.ctaLink}</code>
                  </div>
                  <Button
                    variant="brand"
                    size="sm"
                    iconRight={ExternalLink}
                    onClick={() => navigate(activeAnnouncement.ctaLink)}
                  >
                    {activeAnnouncement.ctaLabel}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-12 text-center text-xs text-slate-400 min-h-[620px] flex flex-col items-center justify-center">
              <Mail className="w-12 h-12 text-slate-300 mb-3" />
              <h4 className="text-sm font-bold text-slate-700">Select an Announcement</h4>
              <p className="text-slate-400 max-w-xs mt-1">
                Choose a bulletin from the list to inspect full details, policy compliance guidelines, and documents.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* FORMAL POLICY ACKNOWLEDGMENT MODAL */}
      {/* ============================================================== */}
      <Modal
        isOpen={showAckModal}
        onClose={() => setShowAckModal(false)}
        title="Formal Policy Acknowledgment & Digital Signoff"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-950 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-purple-700" />
              <span>
                Policy Version {activeAnnouncement?.policyVersion || 'v2.4'} Signoff
              </span>
            </div>
            <p className="text-purple-900 leading-relaxed">
              By confirming, you formally verify that you have read, understood, and communicated the operational compliance terms of this policy to your management and culinary staff at <strong>{currentRestaurant?.name}</strong>.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Authorized Owner:</span>
              <span className="font-bold text-slate-900">{currentUser?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Restaurant Organization:</span>
              <span className="font-bold text-slate-900">{currentRestaurant?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Policy Version:</span>
              <span className="font-mono font-bold text-purple-800">
                {activeAnnouncement?.policyVersion || 'v2.4'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Effective Date:</span>
              <span className="font-semibold text-slate-800">
                {activeAnnouncement?.effectiveDate || 'Immediately'}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            A digital audit record containing your timestamp and owner credentials will be archived in the StockMate Platform Compliance Registry.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAckModal(false)}
              disabled={isSubmittingAck}
            >
              Cancel
            </Button>
            <Button
              variant="brand"
              size="sm"
              icon={Check}
              onClick={handleConfirmAcknowledgment}
              disabled={isSubmittingAck}
            >
              {isSubmittingAck ? 'Recording Signature...' : 'Confirm Formal Acknowledgment'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

