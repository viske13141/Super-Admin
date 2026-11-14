import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePlatformStore } from '../../services/platformStore';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate, formatINR, formatNumberIN } from '../../utils/format';

type SubTab = 'overview' | 'billing' | 'plan' | 'usage' | 'renewals' | 'history';

export const SubscriptionDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { subscriptions, invoices, pricingPlans } = usePlatformStore();
  const sub = subscriptions.find((s) => s.id === id);
  const [tab, setTab] = useState<SubTab>('overview');

  if (!sub) {
    return (
      <div className="bg-white rounded-2xl border border-[#E8EBF4] p-8 text-center">
        <h2 className="text-lg font-semibold">Subscription not found</h2>
        <button type="button" onClick={() => navigate('/subscriptions')} className="mt-4 px-4 py-2 bg-[#7050F5] text-white text-sm rounded-lg">
          Back to Subscriptions
        </button>
      </div>
    );
  }

  const subInvoices = invoices.filter((i) => i.subscriptionId === sub.id);
  const planObj = pricingPlans.find((p) => p.name === sub.planName);

  const tabs: { key: SubTab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'billing', label: 'Billing History' },
    { key: 'plan', label: 'Plan Details' },
    { key: 'usage', label: 'Usage' },
    { key: 'renewals', label: 'Renewals' },
    { key: 'history', label: 'Changes History' },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title={`${sub.id} · ${sub.companyName}`}
        subtitle={`${sub.planName} (${sub.planVersion}) · ${sub.billingCycle} Billing`}
        breadcrumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Subscriptions', to: '/subscriptions' },
          { label: sub.id },
        ]}
        badge={<StatusBadge status={sub.status} size="md" />}
        actions={
          <button
            type="button"
            onClick={() => navigate(`/companies/${sub.companyId}`)}
            className="h-9 px-3.5 bg-white border border-[#E2E8F0] rounded-lg text-sm font-medium hover:bg-slate-50"
          >
            Open Company Profile
          </button>
        }
      />

      <div className="bg-white rounded-2xl border border-[#E8EBF4] overflow-hidden">
        <div className="flex items-center gap-1 px-4 pt-3 border-b border-[#E8EBF4] overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap ${
                tab === t.key ? 'border-[#7050F5] text-[#7050F5]' : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === 'overview' && (
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <DetailItem label="Subscription ID" value={sub.id} />
              <DetailItem label="Company" value={sub.companyName} />
              <DetailItem label="Selected Plan" value={`${sub.planName} (${sub.planVersion})`} />
              <DetailItem label="Billing Cycle" value={sub.billingCycle} />
              <DetailItem label="Start Date" value={formatDate(sub.startDate)} />
              <DetailItem label="End / Renewal Date" value={formatDate(sub.endDate)} />
              <DetailItem label="Next Billing Date" value={formatDate(sub.nextBillingDate)} />
              <DetailItem label="Employee Limit" value={formatNumberIN(sub.employeeLimit)} />
              <DetailItem label="Current Employee Usage" value={formatNumberIN(sub.currentUsage)} />
              <DetailItem label="Base Amount" value={formatINR(sub.baseAmount)} />
              <DetailItem label="Discount" value={`${sub.discountPercent}%`} />
              <DetailItem label="GST / Tax (18%)" value={formatINR(sub.taxAmount)} />
              <DetailItem label="Final Billed Amount" value={formatINR(sub.amount)} highlight />
              <div className="sm:col-span-2 lg:col-span-3">
                <dt className="text-xs text-[#64748B] mb-1.5">Enabled Modules</dt>
                <dd className="text-xs text-[#0F172A] leading-relaxed">
                  {sub.enabledModules.join(' · ')}
                </dd>
              </div>
            </dl>
          )}

          {tab === 'billing' && (
            <div className="space-y-2.5">
              {subInvoices.length === 0 ? (
                <p className="text-sm text-[#64748B]">No invoices issued yet for this subscription.</p>
              ) : (
                subInvoices.map((inv) => (
                  <div key={inv.id} className="p-3.5 rounded-xl border border-[#E8EBF4] flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-[#0F172A]">{inv.invoiceNumber}</p>
                      <p className="text-[#64748B]">Issued {formatDate(inv.invoiceDate)} · Due {formatDate(inv.dueDate)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold tabular-nums">{formatINR(inv.total)}</span>
                      <StatusBadge status={inv.paymentStatus} />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'plan' && planObj && (
            <div className="space-y-3 text-sm">
              <p className="font-semibold text-[#0F172A]">{planObj.name} ({planObj.code}) — {planObj.version}</p>
              <p className="text-[#64748B]">{planObj.description}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                <DetailItem label="Max Employees" value={formatNumberIN(planObj.employeeLimit)} />
                <DetailItem label="Max Branches" value={String(planObj.branchLimit)} />
                <DetailItem label="Storage Quota" value={`${planObj.storageLimitGB} GB`} />
                <DetailItem label="Support Tier" value={planObj.supportLevel} />
              </div>
            </div>
          )}

          {tab === 'usage' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-[#0F172A]">Active Seat Allocation</span>
                <span className="font-bold tabular-nums">
                  {formatNumberIN(sub.currentUsage)} / {formatNumberIN(sub.employeeLimit)} (
                  {Math.round((sub.currentUsage / sub.employeeLimit) * 100)}%)
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-[#EEF1F8] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#7050F5]"
                  style={{ width: `${Math.min(100, Math.round((sub.currentUsage / sub.employeeLimit) * 100))}%` }}
                />
              </div>
            </div>
          )}

          {tab === 'renewals' && (
            <div className="space-y-2 text-sm">
              <p>Auto-Renew Enabled: <strong>{sub.autoRenew ? 'Yes' : 'No'}</strong></p>
              <p>Next Renewal Date: <strong className="tabular-nums">{formatDate(sub.renewalDate)}</strong></p>
              <p>Expected Renewal Total: <strong className="tabular-nums">{formatINR(sub.amount)}</strong></p>
            </div>
          )}

          {tab === 'history' && (
            <div className="space-y-3">
              {sub.changeHistory.map((h) => (
                <div key={h.id} className="p-3.5 rounded-xl border border-[#E8EBF4] text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#0F172A]">{h.changeType}</span>
                    <span className="text-[#64748B] tabular-nums">{formatDate(h.date)}</span>
                  </div>
                  <p className="text-[#64748B] mt-1">{h.notes}</p>
                  <p className="text-[11px] text-slate-400 mt-1">Actor: {h.actor}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DetailItem: React.FC<{ label: string; value: string; highlight?: boolean }> = ({
  label,
  value,
  highlight,
}) => (
  <div>
    <dt className="text-xs text-[#64748B]">{label}</dt>
    <dd className={`mt-0.5 tabular-nums ${highlight ? 'text-base font-bold text-[#7050F5]' : 'font-medium text-[#0F172A]'}`}>
      {value}
    </dd>
  </div>
);
