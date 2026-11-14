import React, { useState } from 'react';
import {
  Bell,
  Building2,
  Database,
  FileCheck2,
  Flag,
  Globe,
  Plus,
  Send,
  ShieldAlert,
} from 'lucide-react';
import { usePlatformStore } from '../../services/platformStore';
import { NotificationTemplate, StatutoryRule } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { FormModal } from '../../components/common/FormModal';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { formatDate, formatDateTime } from '../../utils/format';

type SettingsTab = 'global' | 'industries' | 'flags' | 'templates' | 'statutory' | 'data';

export const DataSettingsPage: React.FC = () => {
  const {
    globalConfig,
    industries,
    featureFlags,
    notificationTemplates,
    statutoryRules,
    dataRetention,
    updateGlobalConfig,
    toggleIndustry,
    toggleFeatureFlag,
    saveNotificationTemplate,
    saveStatutoryRule,
    transitionStatutoryRule,
    recordAudit,
    pushToast,
  } = usePlatformStore();

  const [tab, setTab] = useState<SettingsTab>('global');
  const [configDraft, setConfigDraft] = useState(globalConfig);
  const [tplModal, setTplModal] = useState<NotificationTemplate | null>(null);
  const [ruleModal, setRuleModal] = useState<StatutoryRule | null>(null);
  const [archiveConfirm, setArchiveConfirm] = useState<string | null>(null);

  const subNav: { key: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { key: 'global', label: 'Global Config', icon: <Globe className="w-4 h-4" /> },
    { key: 'industries', label: 'Industries', icon: <Building2 className="w-4 h-4" /> },
    { key: 'flags', label: 'Feature Flags', icon: <Flag className="w-4 h-4" /> },
    { key: 'templates', label: 'Notification Templates', icon: <Bell className="w-4 h-4" /> },
    { key: 'statutory', label: 'Statutory Rules', icon: <FileCheck2 className="w-4 h-4" /> },
    { key: 'data', label: 'Data & Retention', icon: <Database className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Data & Settings"
        subtitle="Global platform defaults, industry classifications, feature rollouts, templates, versioned statutory configs, and data retention."
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Data & Settings' }]}
      />

      <div className="bg-white rounded-2xl border border-[#E8EBF4] p-1.5 flex items-center gap-1 overflow-x-auto">
        {subNav.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap ${
              tab === item.key ? 'bg-[#7050F5] text-white' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* A. Global Config */}
      {tab === 'global' && (
        <div className="bg-white rounded-2xl border border-[#E8EBF4] p-6 max-w-3xl space-y-4">
          <h3 className="text-base font-semibold text-[#0F172A]">Global Platform Configuration</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-xs font-semibold mb-1">Platform Name</label>
              <input value={configDraft.platformName} onChange={(e) => setConfigDraft({ ...configDraft, platformName: e.target.value })} className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Tagline</label>
              <input value={configDraft.tagline} onChange={(e) => setConfigDraft({ ...configDraft, tagline: e.target.value })} className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Default Language</label>
              <input value={configDraft.defaultLanguage} onChange={(e) => setConfigDraft({ ...configDraft, defaultLanguage: e.target.value })} className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Default Currency</label>
              <input value={configDraft.defaultCurrency} onChange={(e) => setConfigDraft({ ...configDraft, defaultCurrency: e.target.value })} className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Time Zone</label>
              <input value={configDraft.timeZone} onChange={(e) => setConfigDraft({ ...configDraft, timeZone: e.target.value })} className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Date Format & Time Format</label>
              <div className="grid grid-cols-2 gap-2">
                <input value={configDraft.dateFormat} onChange={(e) => setConfigDraft({ ...configDraft, dateFormat: e.target.value })} className="h-9 px-2.5 border border-[#E2E8F0] rounded-lg" />
                <select value={configDraft.timeFormat} onChange={(e) => setConfigDraft({ ...configDraft, timeFormat: e.target.value as '12-hour' | '24-hour' })} className="h-9 px-2 border border-[#E2E8F0] rounded-lg bg-white">
                  <option value="12-hour">12-hour</option>
                  <option value="24-hour">24-hour</option>
                </select>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1">Regional Preferences</label>
              <input value={configDraft.regionalDefaults} onChange={(e) => setConfigDraft({ ...configDraft, regionalDefaults: e.target.value })} className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg" />
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <button type="button" onClick={() => updateGlobalConfig(configDraft)} className="px-4 py-2 bg-[#7050F5] text-white text-sm font-medium rounded-lg hover:bg-[#5E3DE6]">
              Save Global Configuration
            </button>
          </div>
        </div>
      )}

      {/* B. Industry Configuration */}
      {tab === 'industries' && (
        <div className="space-y-4">
          <div className="px-4 py-3 rounded-xl bg-[#F4F2FF] border border-[#7050F5]/20 text-xs text-[#5B3CE6]">
            <strong>Unified Payroll Engine Architecture:</strong> Industries serve strictly as tenant classification and policy template presets. All companies execute on the exact same shared payroll engine.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {industries.map((ind) => (
              <div key={ind.id} className="bg-white rounded-2xl border border-[#E8EBF4] p-4 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[#0F172A]">{ind.name}</h4>
                    <span className="font-mono-code text-[11px] text-[#64748B]">{ind.code}</span>
                  </div>
                  <p className="text-xs text-[#64748B] mt-1">{ind.subIndustries.join(' · ')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleIndustry(ind.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 ${
                    ind.enabled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {ind.enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* C. Feature Flags */}
      {tab === 'flags' && (
        <div className="space-y-3">
          {featureFlags.map((ff) => (
            <div key={ff.id} className="bg-white rounded-2xl border border-[#E8EBF4] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-[#0F172A]">{ff.name}</h4>
                  <code className="text-[11px] bg-slate-100 px-2 py-0.5 rounded">{ff.key}</code>
                  <span className="text-xs font-semibold text-[#7050F5]">{ff.stage} · {ff.rolloutPercent}% rollout</span>
                </div>
                <p className="text-xs text-[#64748B] mt-1">{ff.description}</p>
                <p className="text-[11px] text-[#64748B] mt-1">Eligible Plans: {ff.eligiblePlans.join(', ')}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleFeatureFlag(ff.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold shrink-0 ${
                  ff.enabledGlobally ? 'bg-[#7050F5] text-white' : 'bg-slate-100 text-[#0F172A]'
                }`}
              >
                {ff.enabledGlobally ? 'Enabled Globally' : 'Disabled'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* D. Notification Templates */}
      {tab === 'templates' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() =>
                setTplModal({
                  id: `TPL-${Date.now()}`,
                  name: '',
                  channel: 'Email',
                  eventType: '',
                  subject: '',
                  body: '',
                  variables: ['company_name'],
                  language: 'English',
                  status: 'Active',
                })
              }
              className="h-9 px-4 bg-[#7050F5] text-white rounded-lg text-sm font-medium inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Template</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notificationTemplates.map((tpl) => (
              <div key={tpl.id} className="bg-white rounded-2xl border border-[#E8EBF4] p-5 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-[#0F172A]">{tpl.name}</h4>
                      <p className="text-xs text-[#64748B]">{tpl.channel} · <code>{tpl.eventType}</code></p>
                    </div>
                    <StatusBadge status={tpl.status} />
                  </div>
                  <p className="text-xs font-medium text-[#0F172A] mt-3">{tpl.subject}</p>
                  <p className="text-xs text-[#64748B] mt-1 line-clamp-2">{tpl.body}</p>
                </div>
                <div className="pt-3 border-t border-[#F1F3F9] flex items-center justify-between">
                  <button type="button" onClick={() => setTplModal(tpl)} className="text-xs font-medium text-[#7050F5] hover:underline">
                    Edit Template
                  </button>
                  <button
                    type="button"
                    onClick={() => pushToast({ type: 'info', title: 'Test dispatch simulated', message: `Rendered ${tpl.channel} preview for ${tpl.name}.` })}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#0F172A] hover:text-[#7050F5]"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Test</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* E. Statutory Rule Configuration */}
      {tab === 'statutory' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-800">
            <span>
              <strong>Versioned Governance Notice:</strong> Administrative configuration area only (not a substitute for certified legal review). Published rules are immutable and never silently overwritten.
            </span>
            <button
              type="button"
              onClick={() =>
                setRuleModal({
                  id: `STAT-${Date.now()}`,
                  name: '',
                  jurisdiction: 'India (State)',
                  state: '',
                  category: 'Professional Tax',
                  effectiveDate: '2025-04-01',
                  version: 'v2025.1-draft',
                  approvalStatus: 'Draft',
                  sourceDocument: '',
                  lastReviewedDate: new Date().toISOString().slice(0, 10),
                  summary: '',
                })
              }
              className="h-8 px-3 bg-[#7050F5] text-white rounded-lg font-medium shrink-0 inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Rule Draft</span>
            </button>
          </div>

          <div className="space-y-3">
            {statutoryRules.map((rule) => (
              <div key={rule.id} className="bg-white rounded-2xl border border-[#E8EBF4] p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-[#0F172A]">{rule.name}</h4>
                    <code className="text-[11px] bg-slate-100 px-2 py-0.5 rounded">{rule.version}</code>
                    <StatusBadge status={rule.approvalStatus} />
                  </div>
                  <p className="text-xs text-[#64748B]">
                    {rule.jurisdiction} · {rule.state} · {rule.category} · Effective {formatDate(rule.effectiveDate)} · Source: {rule.sourceDocument}
                  </p>
                  <p className="text-xs text-[#0F172A] pt-1">{rule.summary}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {rule.approvalStatus === 'Draft' && (
                    <>
                      <button type="button" onClick={() => setRuleModal(rule)} className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium">Edit Draft</button>
                      <button type="button" onClick={() => transitionStatutoryRule(rule.id, 'Pending Approval')} className="px-3 py-1.5 rounded-lg bg-[#7050F5] text-white text-xs font-medium">Submit for Approval</button>
                    </>
                  )}
                  {rule.approvalStatus === 'Pending Approval' && (
                    <button type="button" onClick={() => transitionStatutoryRule(rule.id, 'Published')} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium">Approve & Publish</button>
                  )}
                  {rule.approvalStatus === 'Published' && (
                    <button type="button" onClick={() => transitionStatutoryRule(rule.id, 'Archived')} className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#64748B]">Archive Version</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* F. Data Management & Retention */}
      {tab === 'data' && (
        <div className="space-y-3">
          {dataRetention.map((pol) => (
            <div key={pol.id} className="bg-white rounded-2xl border border-[#E8EBF4] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-[#0F172A]">{pol.domain}</h4>
                  <StatusBadge status={pol.backupStatus} />
                </div>
                <p className="text-xs text-[#64748B] mt-1 tabular-nums">
                  Retention: <strong>{pol.retentionYears} years</strong> · Legal Hold Override: <strong>{pol.legalHoldOverride ? 'Protected' : 'Standard'}</strong> · Storage: <strong>{pol.storageUsedGB} GB</strong> · Last Backup: {formatDateTime(pol.lastBackupAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setArchiveConfirm(pol.domain)}
                className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium hover:bg-slate-50 inline-flex items-center gap-1.5 shrink-0"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                <span>Request Archive Export</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Notification Template Modal */}
      {tplModal && (
        <FormModal
          open
          title={tplModal.name ? `Edit Template: ${tplModal.name}` : 'Create Notification Template'}
          onClose={() => setTplModal(null)}
          footer={
            <>
              <button type="button" onClick={() => setTplModal(null)} className="px-4 py-2 text-sm border border-[#E2E8F0] rounded-lg">Cancel</button>
              <button
                type="button"
                onClick={() => {
                  if (!tplModal.name.trim()) return;
                  saveNotificationTemplate(tplModal);
                  setTplModal(null);
                }}
                className="px-4 py-2 text-sm bg-[#7050F5] text-white rounded-lg"
              >
                Save Template
              </button>
            </>
          }
        >
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-semibold mb-1">Template Name *</label><input value={tplModal.name} onChange={(e) => setTplModal({ ...tplModal, name: e.target.value })} className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg" /></div>
              <div>
                <label className="block text-xs font-semibold mb-1">Channel</label>
                <select value={tplModal.channel} onChange={(e) => setTplModal({ ...tplModal, channel: e.target.value as NotificationTemplate['channel'] })} className="w-full h-9 px-2 border border-[#E2E8F0] rounded-lg bg-white">
                  <option>Email</option><option>SMS</option><option>In-App</option><option>WhatsApp</option>
                </select>
              </div>
            </div>
            <div><label className="block text-xs font-semibold mb-1">Event Type</label><input value={tplModal.eventType} onChange={(e) => setTplModal({ ...tplModal, eventType: e.target.value })} className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg font-mono-code text-xs" /></div>
            <div><label className="block text-xs font-semibold mb-1">Subject</label><input value={tplModal.subject} onChange={(e) => setTplModal({ ...tplModal, subject: e.target.value })} className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg" /></div>
            <div><label className="block text-xs font-semibold mb-1">Message Body</label><textarea rows={3} value={tplModal.body} onChange={(e) => setTplModal({ ...tplModal, body: e.target.value })} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg" /></div>
          </div>
        </FormModal>
      )}

      {/* Statutory Rule Draft Modal */}
      {ruleModal && (
        <FormModal
          open
          title="Statutory Rule Configuration Draft"
          subtitle="Saved strictly as a draft until submitted and approved."
          onClose={() => setRuleModal(null)}
          footer={
            <>
              <button type="button" onClick={() => setRuleModal(null)} className="px-4 py-2 text-sm border border-[#E2E8F0] rounded-lg">Cancel</button>
              <button
                type="button"
                onClick={() => {
                  if (!ruleModal.name.trim()) return;
                  saveStatutoryRule(ruleModal);
                  setRuleModal(null);
                }}
                className="px-4 py-2 text-sm bg-[#7050F5] text-white rounded-lg"
              >
                Save Draft
              </button>
            </>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="sm:col-span-2"><label className="block text-xs font-semibold mb-1">Rule Name *</label><input value={ruleModal.name} onChange={(e) => setRuleModal({ ...ruleModal, name: e.target.value })} className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg" /></div>
            <div><label className="block text-xs font-semibold mb-1">Jurisdiction</label><input value={ruleModal.jurisdiction} onChange={(e) => setRuleModal({ ...ruleModal, jurisdiction: e.target.value })} className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg" /></div>
            <div><label className="block text-xs font-semibold mb-1">State</label><input value={ruleModal.state} onChange={(e) => setRuleModal({ ...ruleModal, state: e.target.value })} className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg" /></div>
            <div><label className="block text-xs font-semibold mb-1">Source Gazette / Circular</label><input value={ruleModal.sourceDocument} onChange={(e) => setRuleModal({ ...ruleModal, sourceDocument: e.target.value })} className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg" /></div>
            <div><label className="block text-xs font-semibold mb-1">Effective Date</label><input type="date" value={ruleModal.effectiveDate} onChange={(e) => setRuleModal({ ...ruleModal, effectiveDate: e.target.value })} className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg" /></div>
            <div className="sm:col-span-2"><label className="block text-xs font-semibold mb-1">Rule Summary</label><textarea rows={2} value={ruleModal.summary} onChange={(e) => setRuleModal({ ...ruleModal, summary: e.target.value })} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg" /></div>
          </div>
        </FormModal>
      )}

      <ConfirmationDialog
        open={archiveConfirm !== null}
        title="Authorize Data Archive / Export Request?"
        description={`Exporting or archiving "${archiveConfirm}" requires explicit Super Admin approval and logs a compliance audit record.`}
        variant="warning"
        requireReauth
        onCancel={() => setArchiveConfirm(null)}
        onConfirm={() => {
          recordAudit({
            action: 'Approved Data Archive Export Request',
            eventType: 'Approve',
            module: 'Data & Settings',
            resource: archiveConfirm || '',
            details: 'Compliance archive export queued with legal hold check.',
          });
          pushToast({ type: 'success', title: 'Archive export queued', message: 'Recorded in Audit & Security trail.' });
          setArchiveConfirm(null);
        }}
      />
    </div>
  );
};
