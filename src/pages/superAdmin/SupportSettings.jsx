import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Bell,
  CheckCircle2,
  Clock,
  Save,
  Building2,
  Sliders,
  ArrowRight,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { FormInput } from '../../components/common/FormInput';

export const SupportSettings = () => {
  const { supportTickets, updateTicketStatus, addToast, platformSettings, updatePlatformSettings } = useApp();
  const navigate = useNavigate();

  const [platformConfig, setPlatformConfig] = useState({
    platformName: platformSettings?.general?.platformName || 'StockMate',
    supportEmail: platformSettings?.general?.supportEmail || 'support@stockmate.io',
    requireApprovalForNewTenants: Boolean(platformSettings?.general?.requireApprovalForNewTenants),
  });

  useEffect(() => {
    if (platformSettings?.general) {
      setPlatformConfig({
        platformName: platformSettings.general.platformName,
        supportEmail: platformSettings.general.supportEmail,
        requireApprovalForNewTenants: Boolean(platformSettings.general.requireApprovalForNewTenants),
      });
    }
  }, [platformSettings?.general]);

  const [notifications, setNotifications] = useState({
    emailOnNewRegistration: true,
    emailOnPlanChange: true,
    weeklyDigest: false,
    urgentSupportEscalation: true,
  });

  const handleSavePlatformSettings = (e) => {
    e.preventDefault();
    updatePlatformSettings(
      {
        general: {
          ...platformSettings.general,
          platformName: platformConfig.platformName,
          supportEmail: platformConfig.supportEmail,
          requireApprovalForNewTenants: platformConfig.requireApprovalForNewTenants,
        },
      },
      'Support & Platform Sync',
      'Platform Variables Updated via Support Desk'
    );
  };

  const handleSaveNotifications = (e) => {
    e.preventDefault();
    addToast('Notification preferences updated.', 'success');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support Helpdesk & Inquiries"
        subtitle="Manage client assistance inquiries, merchant support tickets, and alert dispatch preferences"
        breadcrumbs={[
          { label: 'Admin', href: '#/admin/dashboard' },
          { label: 'Support Inquiries' },
        ]}
        action={
          <Button
            variant="brand"
            size="sm"
            onClick={() => navigate('/admin/settings')}
            icon={Sliders}
            iconRight={ArrowRight}
          >
            Open Unified Platform Settings
          </Button>
        }
      />

      {/* Cross-Link Banner to Platform Settings */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-800/60 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Looking for Platform Settings?</h4>
            <p className="text-xs text-slate-300 mt-0.5">
              General Branding, Billing Currency &amp; Locale, 2FA Security, and Demo Storage are in the unified Platform Settings module.
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          size="xs"
          onClick={() => navigate('/admin/settings')}
          className="shrink-0 bg-emerald-700 hover:bg-emerald-600"
        >
          Manage Platform Settings →
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Support Tickets Queue */}
        <div className="lg:col-span-7 space-y-6">
          <Card padding={false}>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 text-base">Client Support Inquiries</h3>
                <p className="text-xs text-slate-500 mt-0.5">Tickets filed by restaurant owners and kitchen managers</p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {supportTickets.length} Total
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {supportTickets.map((tkt) => (
                <div key={tkt.id} className="p-5 hover:bg-slate-50/70 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">#{tkt.id}</span>
                        <Badge
                          status={tkt.status === 'open' ? 'pending' : tkt.status === 'in_progress' ? 'accepted' : 'delivered'}
                          label={tkt.status.replace('_', ' ').toUpperCase()}
                          size="xs"
                        />
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.2 rounded-md ${
                          tkt.priority === 'high' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {tkt.priority} priority
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900 mt-1">{tkt.subject}</h4>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {tkt.status !== 'resolved' ? (
                        <Button
                          variant="success"
                          size="xs"
                          icon={CheckCircle2}
                          onClick={() => updateTicketStatus(tkt.id, 'resolved')}
                        >
                          Resolve
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="xs"
                          icon={Clock}
                          onClick={() => updateTicketStatus(tkt.id, 'open')}
                        >
                          Reopen
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 font-medium text-slate-700">
                      <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{tkt.restaurantName}</span>
                      <span className="text-slate-400">• {tkt.submittedBy}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>{tkt.category}</span>
                      <span>•</span>
                      <span>{new Date(tkt.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Platform Configuration & Notifications */}
        <div className="lg:col-span-5 space-y-6">
          {/* Global Platform Variables */}
          <Card>
            <CardHeader
              title="Quick Platform Defaults"
              subtitle="Synced with authoritative Platform Settings"
              icon={Settings}
            />
            <form onSubmit={handleSavePlatformSettings} className="space-y-4">
              <FormInput
                label="Application Name"
                name="platformName"
                value={platformConfig.platformName}
                onChange={(e) => setPlatformConfig({ ...platformConfig, platformName: e.target.value })}
              />

              <FormInput
                label="Primary Support Contact"
                name="supportEmail"
                type="email"
                value={platformConfig.supportEmail}
                onChange={(e) => setPlatformConfig({ ...platformConfig, supportEmail: e.target.value })}
              />

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">Require Super Admin Approval</span>
                  <span className="text-[11px] text-slate-500">Hold new signups as Pending until approved</span>
                </div>
                <input
                  type="checkbox"
                  checked={platformConfig.requireApprovalForNewTenants}
                  onChange={(e) => setPlatformConfig({ ...platformConfig, requireApprovalForNewTenants: e.target.checked })}
                  className="rounded text-emerald-800 h-4 w-4"
                />
              </div>

              <Button type="submit" variant="brand" size="sm" className="w-full" icon={Save}>
                Save Quick Settings
              </Button>
            </form>
          </Card>

          {/* Super Admin Notification Preferences */}
          <Card>
            <CardHeader
              title="Super Admin Notification Preferences"
              subtitle="System event notification triggers"
              icon={Bell}
            />
            <form onSubmit={handleSaveNotifications} className="space-y-3">
              <label className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-xs">
                <span className="text-slate-700 font-medium">Email on New Restaurant Signup</span>
                <input
                  type="checkbox"
                  checked={notifications.emailOnNewRegistration}
                  onChange={(e) => setNotifications({ ...notifications, emailOnNewRegistration: e.target.checked })}
                  className="rounded text-emerald-800 h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-xs">
                <span className="text-slate-700 font-medium">Email on Subscription Plan Upgrades</span>
                <input
                  type="checkbox"
                  checked={notifications.emailOnPlanChange}
                  onChange={(e) => setNotifications({ ...notifications, emailOnPlanChange: e.target.checked })}
                  className="rounded text-emerald-800 h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-xs">
                <span className="text-slate-700 font-medium">Urgent Support Ticket Escalations</span>
                <input
                  type="checkbox"
                  checked={notifications.urgentSupportEscalation}
                  onChange={(e) => setNotifications({ ...notifications, urgentSupportEscalation: e.target.checked })}
                  className="rounded text-emerald-800 h-4 w-4"
                />
              </label>

              <Button type="submit" variant="outline" size="sm" className="w-full" icon={Save}>
                Update Notification Rules
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
