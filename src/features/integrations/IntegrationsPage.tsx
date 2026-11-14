import React, { useMemo, useState } from 'react';
import { CheckCircle2, FileText, KeyRound, Plug, Plus, Settings, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlatformStore } from '../../services/platformStore';
import { IntegrationCategory, PlatformIntegration } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { FormModal } from '../../components/common/FormModal';
import { SearchInput } from '../../components/common/SearchInput';
import { formatDateTime } from '../../utils/format';

const CATEGORIES: IntegrationCategory[] = [
  'Payment Gateways',
  'Banking',
  'Email',
  'SMS',
  'WhatsApp',
  'Biometric Devices',
  'Accounting',
  'E-signature',
  'Document Services',
  'Government Portals',
  'Webhooks',
  'External APIs',
];

export const IntegrationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { integrations, saveIntegration, testIntegrationConnection } = usePlatformStore();

  const [category, setCategory] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [editModal, setEditModal] = useState<PlatformIntegration | null>(null);
  const [newSecretInput, setNewSecretInput] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return integrations.filter((i) => {
      if (category !== 'All' && i.category !== category) return false;
      if (q && !i.name.toLowerCase().includes(q) && !i.provider.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [integrations, category, search]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Integrations"
        subtitle="Manage platform-wide relays and tenant-isolated integration templates. Secrets remain masked in vault references."
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Integrations' }]}
        actions={
          <button
            type="button"
            onClick={() => {
              setNewSecretInput('');
              setEditModal({
                id: `INT-${Date.now()}`,
                name: '',
                provider: '',
                category: 'External APIs',
                scope: 'Platform-Wide',
                connectionStatus: 'Disconnected',
                configStatus: 'Pending Setup',
                lastSync: new Date().toISOString(),
                apiEndpoint: 'https://',
                authMethod: 'API Key + HMAC',
                secretReference: 'vault://prod/custom/pending',
                environment: 'Sandbox',
                webhookUrl: 'https://webhooks.payfuse.io/',
                retryPolicy: 'Exponential (3 retries)',
                enabled: false,
              });
            }}
            className="h-9 px-4 bg-[#7050F5] hover:bg-[#5E3DE6] text-white rounded-lg text-sm font-medium inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Integration</span>
          </button>
        }
      />

      {/* Category Filter Strip */}
      <div className="bg-white rounded-2xl border border-[#E8EBF4] p-3 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Search providers or connectors..." className="sm:max-w-xs" />
          <span className="text-xs text-[#64748B]">
            Showing <strong className="text-[#0F172A]">{filtered.length}</strong> integrations across 12 categories
          </span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setCategory('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              category === 'All' ? 'bg-[#7050F5] text-white' : 'bg-[#F4F6FA] text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                category === cat ? 'bg-[#7050F5] text-white' : 'bg-[#F4F6FA] text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border border-[#E8EBF4] p-5 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EFEAFF] text-[#7050F5] flex items-center justify-center shrink-0">
                    <Plug className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A]">{item.name}</h3>
                    <p className="text-xs text-[#64748B]">{item.provider} · {item.category}</p>
                  </div>
                </div>
                <StatusBadge status={item.connectionStatus} />
              </div>

              <div className="mt-4 pt-3 border-t border-[#F1F3F9] space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Credential Isolation</span>
                  <span className="font-medium text-[#0F172A]">{item.scope}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Secret Vault Ref</span>
                  <span className="font-mono-code text-[11px] text-[#475569] inline-flex items-center gap-1">
                    <KeyRound className="w-3 h-3" /> {item.secretReference}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Environment · Sync</span>
                  <span className="tabular-nums text-[#64748B]">{item.environment} · {formatDateTime(item.lastSync).split(',')[0]}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#F1F3F9] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setNewSecretInput('');
                    setEditModal(item);
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium hover:bg-slate-50 inline-flex items-center gap-1"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Configure</span>
                </button>
                <button
                  type="button"
                  onClick={() => testIntegrationConnection(item.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#F4F2FF] text-[#5B3CE6] text-xs font-medium inline-flex items-center gap-1"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Test</span>
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    saveIntegration({
                      ...item,
                      enabled: !item.enabled,
                      connectionStatus: !item.enabled ? 'Connected' : 'Disconnected',
                      configStatus: !item.enabled ? 'Configured' : 'Disabled',
                    })
                  }
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                    item.enabled ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  {item.enabled ? 'Disable' : 'Enable'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/service-logs?service=Integration+Service')}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                  aria-label="View integration logs"
                >
                  <FileText className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Configure Integration Modal */}
      {editModal && (
        <FormModal
          open
          title={editModal.name ? `Configure ${editModal.name}` : 'Add Integration'}
          subtitle="Raw API secrets are never displayed after saving. Provide a vault reference or rotate secret safely."
          onClose={() => setEditModal(null)}
          footer={
            <>
              <button type="button" onClick={() => setEditModal(null)} className="px-4 py-2 text-sm border border-[#E2E8F0] rounded-lg">Cancel</button>
              <button
                type="button"
                onClick={() => {
                  if (!editModal.name.trim() || !editModal.provider.trim()) return;
                  const maskedRef = newSecretInput.trim()
                    ? `vault://${editModal.environment.toLowerCase()}/${editModal.provider.toLowerCase().replace(/\s+/g, '_')}/****${newSecretInput.trim().slice(-4)}`
                    : editModal.secretReference;
                  saveIntegration({
                    ...editModal,
                    secretReference: maskedRef,
                    configStatus: 'Configured',
                    connectionStatus: editModal.enabled ? 'Connected' : 'Disconnected',
                    lastSync: new Date().toISOString(),
                  });
                  setEditModal(null);
                }}
                className="px-4 py-2 text-sm font-medium bg-[#7050F5] text-white rounded-lg inline-flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Configuration</span>
              </button>
            </>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <label className="block text-xs font-semibold mb-1">Integration Name *</label>
              <input value={editModal.name} onChange={(e) => setEditModal({ ...editModal, name: e.target.value })} className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Provider *</label>
              <input value={editModal.provider} onChange={(e) => setEditModal({ ...editModal, provider: e.target.value })} className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Category</label>
              <select value={editModal.category} onChange={(e) => setEditModal({ ...editModal, category: e.target.value as IntegrationCategory })} className="w-full h-9 px-2 border border-[#E2E8F0] rounded-lg bg-white">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Credential Scope</label>
              <select value={editModal.scope} onChange={(e) => setEditModal({ ...editModal, scope: e.target.value as PlatformIntegration['scope'] })} className="w-full h-9 px-2 border border-[#E2E8F0] rounded-lg bg-white">
                <option value="Platform-Wide">Platform-Wide</option>
                <option value="Tenant-Isolated Template">Tenant-Isolated Template</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1">API Endpoint</label>
              <input value={editModal.apiEndpoint} onChange={(e) => setEditModal({ ...editModal, apiEndpoint: e.target.value })} className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg font-mono-code text-xs" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Auth Method</label>
              <select value={editModal.authMethod} onChange={(e) => setEditModal({ ...editModal, authMethod: e.target.value as PlatformIntegration['authMethod'] })} className="w-full h-9 px-2 border border-[#E2E8F0] rounded-lg bg-white">
                <option>OAuth 2.0</option>
                <option>API Key + HMAC</option>
                <option>mTLS Certificate</option>
                <option>Bearer Token</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Environment</label>
              <select value={editModal.environment} onChange={(e) => setEditModal({ ...editModal, environment: e.target.value as 'Production' | 'Sandbox' })} className="w-full h-9 px-2 border border-[#E2E8F0] rounded-lg bg-white">
                <option>Production</option>
                <option>Sandbox</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1">Rotate Secret / Credentials (write-only, masked after save)</label>
              <input
                type="password"
                value={newSecretInput}
                onChange={(e) => setNewSecretInput(e.target.value)}
                placeholder={`Current vault ref: ${editModal.secretReference}`}
                className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Webhook URL</label>
              <input value={editModal.webhookUrl} onChange={(e) => setEditModal({ ...editModal, webhookUrl: e.target.value })} className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg text-xs" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Retry Policy</label>
              <input value={editModal.retryPolicy} onChange={(e) => setEditModal({ ...editModal, retryPolicy: e.target.value })} className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg text-xs" />
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
};
