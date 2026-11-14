import React, { useState } from 'react';
import {
  Ban,
  Building2,
  CheckCircle2,
  KeyRound,
  Pencil,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePlatformStore } from '../../services/platformStore';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { MultiSelect } from '../../components/common/MultiSelect';
import { ActivityTimeline } from '../../components/common/ActivityTimeline';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { ALL_MODULES } from '../../mock-data/seedData';
import { formatDate, formatDateTime, formatINRCrore, formatNumberIN } from '../../utils/format';

type TabKey =
  | 'overview'
  | 'profile'
  | 'subscription'
  | 'usage'
  | 'branches'
  | 'contacts'
  | 'modules'
  | 'verification'
  | 'activity';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'profile', label: 'Company Profile' },
  { key: 'subscription', label: 'Subscription' },
  { key: 'usage', label: 'Usage' },
  { key: 'branches', label: 'Branches' },
  { key: 'contacts', label: 'Contacts' },
  { key: 'modules', label: 'Enabled Modules' },
  { key: 'verification', label: 'Verification' },
  { key: 'activity', label: 'Activity History' },
];

export const CompanyDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    companies,
    subscriptions,
    auditEvents,
    updateCompany,
    setCompanyStatus,
    softDeleteCompany,
    recordAudit,
    pushToast,
  } = usePlatformStore();

  const company = companies.find((c) => c.id === id);
  const subscription = subscriptions.find((s) => s.companyId === id);

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [confirmType, setConfirmType] = useState<'activate' | 'suspend' | 'delete' | 'reset' | null>(null);

  if (!company) {
    return (
      <div className="bg-white rounded-2xl border border-[#E8EBF4] p-8 text-center">
        <h2 className="text-lg font-semibold text-[#0F172A]">Company not found</h2>
        <p className="text-sm text-[#64748B] mt-1">No company record matches ID {id}.</p>
        <button
          type="button"
          onClick={() => navigate('/companies')}
          className="mt-4 px-4 py-2 bg-[#7050F5] text-white text-sm font-medium rounded-lg"
        >
          Back to Companies
        </button>
      </div>
    );
  }

  const companyAudit = auditEvents
    .filter((a) => a.resource.includes(company.id) || a.resource.includes(company.displayName))
    .map((a) => ({
      id: a.id,
      title: a.action,
      description: a.details,
      timestamp: a.timestamp,
      actor: `${a.user} (${a.role})`,
    }));

  return (
    <div className="space-y-5">
      <PageHeader
        title={company.displayName}
        subtitle={`${company.legalName} · ${company.id} · ${company.industry}`}
        breadcrumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Companies', to: '/companies' },
          { label: company.displayName },
        ]}
        badge={<StatusBadge status={company.accountStatus} size="md" />}
        actions={
          <>
            <button
              type="button"
              onClick={() => navigate(`/companies/${company.id}/edit`)}
              className="h-9 px-3.5 bg-white border border-[#E2E8F0] rounded-lg text-sm font-medium text-[#0F172A] hover:bg-slate-50 inline-flex items-center gap-1.5"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit Company</span>
            </button>
            {company.accountStatus !== 'Active' ? (
              <button
                type="button"
                onClick={() => setConfirmType('activate')}
                className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium inline-flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Activate</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmType('suspend')}
                className="h-9 px-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium inline-flex items-center gap-1.5"
              >
                <Ban className="w-4 h-4" />
                <span>Suspend</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setConfirmType('reset')}
              className="h-9 px-3.5 bg-white border border-[#E2E8F0] rounded-lg text-sm font-medium text-[#0F172A] hover:bg-slate-50 inline-flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Reset Access</span>
            </button>
            <button
              type="button"
              onClick={() => setConfirmType('delete')}
              className="h-9 px-3.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-sm font-medium inline-flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Deactivate</span>
            </button>
          </>
        }
      />

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-[#E8EBF4] overflow-hidden">
        <div className="flex items-center gap-1 px-4 pt-3 border-b border-[#E8EBF4] overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === t.key
                  ? 'border-[#7050F5] text-[#7050F5]'
                  : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-4 rounded-xl bg-[#F9FAFD] border border-[#E8EBF4] space-y-2">
                <p className="text-xs font-semibold text-[#64748B]">Workforce & Payroll</p>
                <p className="text-2xl font-bold text-[#0F172A] tabular-nums">
                  {formatNumberIN(company.employeeCount)} Employees
                </p>
                <p className="text-xs text-[#64748B] tabular-nums">
                  Active: {formatNumberIN(company.activeEmployeeCount)} · Monthly Payroll:{' '}
                  <strong className="text-[#0F172A]">{formatINRCrore(company.monthlyPayrollINR)}</strong>
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F9FAFD] border border-[#E8EBF4] space-y-2">
                <p className="text-xs font-semibold text-[#64748B]">Subscription</p>
                <p className="text-2xl font-bold text-[#7050F5]">{company.subscriptionPlan}</p>
                <p className="text-xs text-[#64748B]">
                  ID: {company.subscriptionId} ·{' '}
                  <button
                    type="button"
                    onClick={() => navigate(`/subscriptions/${company.subscriptionId}`)}
                    className="text-[#7050F5] hover:underline font-medium"
                  >
                    Manage Subscription →
                  </button>
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F9FAFD] border border-[#E8EBF4] space-y-2">
                <p className="text-xs font-semibold text-[#64748B]">Onboarding & KYC</p>
                <div className="flex items-center gap-2">
                  <StatusBadge status={company.verificationStatus} />
                  <span className="text-xs font-medium text-[#0F172A]">Stage: {company.onboardingStage}</span>
                </div>
                <p className="text-xs text-[#64748B] tabular-nums">
                  Registered {formatDate(company.registrationDate)} · Last active {formatDateTime(company.lastActive)}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <InfoField label="Legal Entity Name" value={company.legalName} />
              <InfoField label="Registration Number" value={company.registrationNumber} />
              <InfoField label="Business Type" value={company.businessType} />
              <InfoField label="Industry / Sub-Industry" value={`${company.industry} · ${company.subIndustry}`} />
              <InfoField label="Website" value={company.website || '—'} />
              <InfoField label="Official Email" value={company.email} />
              <InfoField label="Phone" value={company.phone} />
              <InfoField label="Registered Address" value={company.registeredAddress} />
              <InfoField label="Currency & Financial Year" value={`${company.currency} · ${company.financialYear}`} />
              <InfoField label="Time Zone" value={company.timeZone} />
            </dl>
          )}

          {activeTab === 'subscription' && subscription && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-[#0F172A]">
                    {subscription.planName} Plan ({subscription.planVersion})
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    {subscription.id} · {subscription.billingCycle} · Next renewal {formatDate(subscription.renewalDate)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/subscriptions/${subscription.id}`)}
                  className="px-4 py-2 rounded-lg bg-[#7050F5] text-white text-xs font-medium hover:bg-[#5E3DE6]"
                >
                  Change / Upgrade Subscription
                </button>
              </div>
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-[#E8EBF4]">
                <p className="text-xs text-[#64748B]">Seat Utilization</p>
                <p className="text-xl font-bold text-[#0F172A] tabular-nums mt-1">
                  {formatNumberIN(company.employeeCount)} / {formatNumberIN(subscription?.employeeLimit || 1000)}
                </p>
              </div>
              <div className="p-4 rounded-xl border border-[#E8EBF4]">
                <p className="text-xs text-[#64748B]">Configured Branches</p>
                <p className="text-xl font-bold text-[#0F172A] tabular-nums mt-1">{company.branchCount}</p>
              </div>
              <div className="p-4 rounded-xl border border-[#E8EBF4]">
                <p className="text-xs text-[#64748B]">Payroll Runs Completed</p>
                <p className="text-xl font-bold text-[#0F172A] tabular-nums mt-1">100% On-time</p>
              </div>
            </div>
          )}

          {activeTab === 'branches' && (
            <div className="space-y-2.5">
              {company.branches.map((b) => (
                <div key={b.id} className="p-3.5 rounded-xl border border-[#E8EBF4] flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-[#7050F5]" />
                    <div>
                      <p className="font-semibold text-[#0F172A]">
                        {b.name} {b.isHeadquarters && <span className="text-xs text-[#7050F5]">(HQ)</span>}
                      </p>
                      <p className="text-xs text-[#64748B]">{b.city}, {b.state}, {b.country}</p>
                    </div>
                  </div>
                  <span className="font-semibold tabular-nums">{formatNumberIN(b.employeeCount)} employees</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'contacts' && (
            <div className="space-y-2.5">
              {company.contacts.map((ct) => (
                <div key={ct.id} className="p-3.5 rounded-xl border border-[#E8EBF4] flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold text-[#0F172A]">
                      {ct.name} {ct.isPrimary && <span className="text-xs text-emerald-600">(Primary)</span>}
                    </p>
                    <p className="text-xs text-[#64748B]">{ct.designation} · {ct.email}</p>
                  </div>
                  <span className="text-xs font-medium text-[#0F172A] tabular-nums">{ct.phone}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'modules' && (
            <div className="space-y-3">
              <p className="text-xs text-[#64748B]">
                Enable or disable modules for {company.displayName}. All tenants run on the shared PayFuse payroll engine.
              </p>
              <MultiSelect
                options={ALL_MODULES}
                selected={company.enabledModules}
                onChange={(next) =>
                  updateCompany(company.id, { enabledModules: next }, 'Updated Tenant Module Entitlements')
                }
                columns={3}
              />
            </div>
          )}

          {activeTab === 'verification' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#7050F5]" />
                  <span className="text-sm font-semibold">KYC Verification Status:</span>
                  <StatusBadge status={company.verificationStatus} />
                </div>
                {company.verificationStatus !== 'Verified' && (
                  <button
                    type="button"
                    onClick={() => setCompanyStatus(company.id, 'Active', 'KYC verified on company detail view')}
                    className="px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700"
                  >
                    Approve Verification & Activate
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {company.documents.length === 0 ? (
                  <p className="text-sm text-[#64748B]">No KYC documents uploaded yet.</p>
                ) : (
                  company.documents.map((doc) => (
                    <div key={doc.id} className="p-3 rounded-xl border border-[#E8EBF4] flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-[#0F172A]">{doc.name}</p>
                        <p className="text-[#64748B]">Type: {doc.type} · Uploaded {formatDate(doc.uploadedAt)}</p>
                      </div>
                      <StatusBadge status={doc.status} />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'activity' && <ActivityTimeline items={companyAudit} />}
        </div>
      </div>

      <ConfirmationDialog
        open={confirmType !== null}
        title={
          confirmType === 'activate'
            ? `Activate ${company.displayName}?`
            : confirmType === 'suspend'
            ? `Suspend ${company.displayName}?`
            : confirmType === 'reset'
            ? `Reset Primary Admin Access for ${company.displayName}?`
            : `Soft-Deactivate ${company.displayName}?`
        }
        description={
          confirmType === 'reset'
            ? 'Sends a password/MFA recovery link to the verified primary company contact and logs an audit event.'
            : confirmType === 'delete'
            ? 'Controlled soft-deactivation disables workspace logins while preserving payroll and statutory records for legal retention.'
            : confirmType === 'suspend'
            ? 'Blocks tenant logins immediately until reactivated.'
            : 'Activates tenant workspace and marks verification complete.'
        }
        variant={confirmType === 'delete' ? 'danger' : confirmType === 'suspend' ? 'warning' : 'primary'}
        requireReason={confirmType === 'suspend' || confirmType === 'delete'}
        onCancel={() => setConfirmType(null)}
        onConfirm={(reason) => {
          if (confirmType === 'activate') {
            setCompanyStatus(company.id, 'Active', reason || 'Activated from detail page');
          } else if (confirmType === 'suspend') {
            setCompanyStatus(company.id, 'Suspended', reason);
          } else if (confirmType === 'delete') {
            const res = softDeleteCompany(company.id, reason || 'Controlled deactivation');
            if (res.ok) navigate('/companies');
            else pushToast({ type: 'error', title: 'Blocked', message: res.error });
          } else if (confirmType === 'reset') {
            recordAudit({
              action: 'Triggered Tenant Admin Access Reset',
              eventType: 'Security Event',
              module: 'Companies',
              resource: `${company.id} (${company.displayName})`,
              details: `Recovery link dispatched to ${company.contacts[0]?.email || company.email}.`,
            });
            pushToast({ type: 'success', title: 'Access reset triggered', message: 'Recovery email queued for primary contact.' });
          }
          setConfirmType(null);
        }}
      />
    </div>
  );
};

const InfoField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <dt className="text-xs text-[#64748B]">{label}</dt>
    <dd className="font-medium text-[#0F172A] mt-0.5">{value}</dd>
  </div>
);
