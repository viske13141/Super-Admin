import React, { useMemo, useState } from 'react';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CalendarPlus,
  CheckCircle2,
  Clock,
  Eye,
  Layers,
  PauseCircle,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePlatformStore } from '../../services/platformStore';
import { PlanName, Subscription } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { KPIStatCard } from '../../components/common/KPIStatCard';
import { ColumnDef, DataTable } from '../../components/common/DataTable';
import { SearchInput } from '../../components/common/SearchInput';
import { FilterPopover } from '../../components/common/FilterPopover';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ActionMenu } from '../../components/common/ActionMenu';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { FormModal } from '../../components/common/FormModal';
import { ExportMenu } from '../../components/common/ExportMenu';
import { exportToCSV, formatDate, formatINR, formatNumberIN } from '../../utils/format';

export const SubscriptionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { subscriptions, pricingPlans, updateSubscription, pushToast } = usePlatformStore();

  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState(searchParams.get('plan') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [cycleFilter, setCycleFilter] = useState('');
  const [minAmount, setMinAmount] = useState('');

  const [planChangeModal, setPlanChangeModal] = useState<{
    sub: Subscription;
    mode: 'upgrade' | 'downgrade' | 'edit';
  } | null>(null);
  const [selectedNewPlan, setSelectedNewPlan] = useState<PlanName>('Enterprise');
  const [selectedCycle, setSelectedCycle] = useState<'Monthly' | 'Annual'>('Monthly');
  const [changeReason, setChangeReason] = useState('');

  const [confirmAction, setConfirmAction] = useState<{
    sub: Subscription;
    action: 'extend_trial' | 'renew' | 'pause' | 'cancel' | 'reactivate';
  } | null>(null);

  const kpis = useMemo(
    () => ({
      total: subscriptions.length,
      active: subscriptions.filter((s) => s.status === 'Active').length,
      trial: subscriptions.filter((s) => s.status === 'Trial').length,
      expiring: subscriptions.filter((s) => s.status === 'Expiring Soon').length,
      expired: subscriptions.filter((s) => s.status === 'Expired').length,
      cancelled: subscriptions.filter((s) => s.status === 'Cancelled').length,
    }),
    [subscriptions]
  );

  const activeFilters = [planFilter, statusFilter, cycleFilter, minAmount].filter(Boolean).length;
  const clearFilters = () => {
    setPlanFilter('');
    setStatusFilter('');
    setCycleFilter('');
    setMinAmount('');
    setSearchParams({});
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return subscriptions.filter((s) => {
      if (
        q &&
        !s.id.toLowerCase().includes(q) &&
        !s.companyName.toLowerCase().includes(q) &&
        !s.planName.toLowerCase().includes(q)
      ) {
        return false;
      }
      if (planFilter && s.planName !== planFilter) return false;
      if (statusFilter && s.status !== statusFilter) return false;
      if (cycleFilter && s.billingCycle !== cycleFilter) return false;
      if (minAmount && s.amount < Number(minAmount)) return false;
      return true;
    });
  }, [subscriptions, search, planFilter, statusFilter, cycleFilter, minAmount]);

  const columns: ColumnDef<Subscription>[] = [
    {
      key: 'id',
      header: 'Subscription ID',
      sortable: true,
      sortValue: (s) => s.id,
      render: (s) => <span className="font-mono-code text-xs font-medium text-[#5B3CE6]">{s.id}</span>,
    },
    {
      key: 'company',
      header: 'Company',
      sortable: true,
      sortValue: (s) => s.companyName,
      render: (s) => <span className="font-semibold text-[#0F172A]">{s.companyName}</span>,
    },
    {
      key: 'plan',
      header: 'Plan',
      sortable: true,
      sortValue: (s) => s.planName,
      render: (s) => (
        <div>
          <span className="font-medium text-[#0F172A]">{s.planName}</span>
          <span className="text-[11px] text-[#64748B] ml-1.5">{s.planVersion}</span>
        </div>
      ),
    },
    {
      key: 'cycle',
      header: 'Billing Cycle',
      sortable: true,
      sortValue: (s) => s.billingCycle,
      render: (s) => <span className="text-[#64748B]">{s.billingCycle}</span>,
    },
    {
      key: 'start',
      header: 'Start Date',
      sortable: true,
      sortValue: (s) => s.startDate,
      render: (s) => <span className="text-[#64748B] tabular-nums whitespace-nowrap">{formatDate(s.startDate)}</span>,
    },
    {
      key: 'renewal',
      header: 'Renewal Date',
      sortable: true,
      sortValue: (s) => s.renewalDate,
      render: (s) => <span className="text-[#0F172A] tabular-nums whitespace-nowrap">{formatDate(s.renewalDate)}</span>,
    },
    {
      key: 'limit',
      header: 'Seat Usage / Limit',
      align: 'right',
      sortable: true,
      sortValue: (s) => s.currentUsage,
      render: (s) => (
        <span className="tabular-nums text-xs">
          <strong className="text-[#0F172A]">{formatNumberIN(s.currentUsage)}</strong> /{' '}
          <span className="text-[#64748B]">{formatNumberIN(s.employeeLimit)}</span>
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      sortable: true,
      sortValue: (s) => s.amount,
      render: (s) => <span className="font-semibold text-[#0F172A] tabular-nums">{formatINR(s.amount)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      sortValue: (s) => s.status,
      render: (s) => <StatusBadge status={s.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (s) => (
        <ActionMenu
          items={[
            {
              label: 'View Subscription',
              icon: <Eye className="w-4 h-4" />,
              onClick: () => navigate(`/subscriptions/${s.id}`),
            },
            {
              label: 'Upgrade / Edit Plan',
              icon: <ArrowUpCircle className="w-4 h-4 text-[#7050F5]" />,
              onClick: () => {
                setSelectedNewPlan(s.planName);
                setSelectedCycle(s.billingCycle);
                setChangeReason('');
                setPlanChangeModal({ sub: s, mode: 'upgrade' });
              },
            },
            {
              label: 'Downgrade Plan',
              icon: <ArrowDownCircle className="w-4 h-4 text-amber-600" />,
              onClick: () => {
                setSelectedNewPlan(s.planName);
                setSelectedCycle(s.billingCycle);
                setChangeReason('');
                setPlanChangeModal({ sub: s, mode: 'downgrade' });
              },
            },
            ...(s.status === 'Trial'
              ? [
                  {
                    label: 'Extend Trial (+14 Days)',
                    icon: <CalendarPlus className="w-4 h-4 text-indigo-600" />,
                    onClick: () => setConfirmAction({ sub: s, action: 'extend_trial' }),
                  },
                ]
              : []),
            {
              label: 'Renew Subscription',
              icon: <RefreshCw className="w-4 h-4 text-emerald-600" />,
              onClick: () => setConfirmAction({ sub: s, action: 'renew' }),
            },
            s.status === 'Paused' || s.status === 'Cancelled'
              ? {
                  label: 'Reactivate',
                  icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
                  onClick: () => setConfirmAction({ sub: s, action: 'reactivate' }),
                }
              : {
                  label: 'Pause Subscription',
                  icon: <PauseCircle className="w-4 h-4 text-amber-600" />,
                  onClick: () => setConfirmAction({ sub: s, action: 'pause' }),
                },
            ...(s.status !== 'Cancelled'
              ? [
                  {
                    label: 'Cancel Subscription',
                    icon: <XCircle className="w-4 h-4" />,
                    danger: true,
                    onClick: () => setConfirmAction({ sub: s, action: 'cancel' }),
                  },
                ]
              : []),
          ]}
        />
      ),
    },
  ];

  const applyPlanChange = () => {
    if (!planChangeModal) return;
    const plan = pricingPlans.find((p) => p.name === selectedNewPlan) || pricingPlans[0];
    const base = selectedCycle === 'Annual' ? plan.annualPrice : plan.monthlyPrice;
    const tax = Math.round(base * 0.18);
    const changeType =
      planChangeModal.mode === 'upgrade'
        ? 'Upgraded'
        : planChangeModal.mode === 'downgrade'
        ? 'Downgraded'
        : 'Edited';

    updateSubscription(
      planChangeModal.sub.id,
      {
        planName: selectedNewPlan,
        planVersion: plan.version,
        billingCycle: selectedCycle,
        employeeLimit: plan.employeeLimit,
        enabledModules: plan.enabledModules,
        baseAmount: base,
        taxAmount: tax,
        amount: base + tax,
      },
      changeReason || `${changeType} to ${selectedNewPlan} (${selectedCycle})`,
      changeType
    );
    setPlanChangeModal(null);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Subscriptions"
        subtitle="Manage tenant plan entitlements, renewals, trial extensions, and seat utilization."
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Subscriptions' }]}
        actions={
          <ExportMenu
            onExportCSV={() => {
              exportToCSV(
                'payfuse-subscriptions.csv',
                filtered.map((s) => ({
                  SubscriptionID: s.id,
                  Company: s.companyName,
                  Plan: s.planName,
                  Cycle: s.billingCycle,
                  Start: s.startDate,
                  Renewal: s.renewalDate,
                  Usage: s.currentUsage,
                  Limit: s.employeeLimit,
                  AmountINR: s.amount,
                  Status: s.status,
                }))
              );
              pushToast({ type: 'success', title: 'Exported subscriptions' });
            }}
          />
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <KPIStatCard label="Total" value={kpis.total} icon={<Layers className="w-5 h-5 text-[#7050F5]" />} iconBgClass="bg-[#EFEAFF]" onClick={clearFilters} />
        <KPIStatCard label="Active" value={kpis.active} icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />} iconBgClass="bg-emerald-50" onClick={() => setStatusFilter('Active')} />
        <KPIStatCard label="Trial" value={kpis.trial} icon={<Clock className="w-5 h-5 text-indigo-600" />} iconBgClass="bg-indigo-50" onClick={() => setStatusFilter('Trial')} />
        <KPIStatCard label="Expiring Soon" value={kpis.expiring} icon={<Clock className="w-5 h-5 text-amber-600" />} iconBgClass="bg-amber-50" onClick={() => setStatusFilter('Expiring Soon')} />
        <KPIStatCard label="Expired" value={kpis.expired} icon={<XCircle className="w-5 h-5 text-rose-600" />} iconBgClass="bg-rose-50" onClick={() => setStatusFilter('Expired')} />
        <KPIStatCard label="Cancelled" value={kpis.cancelled} icon={<PauseCircle className="w-5 h-5 text-slate-600" />} iconBgClass="bg-slate-100" onClick={() => setStatusFilter('Cancelled')} />
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        rowKey={(s) => s.id}
        onRowClick={(s) => navigate(`/subscriptions/${s.id}`)}
        toolbar={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search subscription ID, company, or plan..."
              className="w-full sm:max-w-sm"
            />
            <div className="flex items-center gap-2">
              {activeFilters > 0 && (
                <button type="button" onClick={clearFilters} className="text-xs font-medium text-[#7050F5] hover:underline">
                  Clear ({activeFilters})
                </button>
              )}
              <FilterPopover activeCount={activeFilters} onClear={clearFilters}>
                <div>
                  <label className="block text-xs font-medium text-[#64748B] mb-1">Plan</label>
                  <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} className="w-full h-9 px-2.5 text-sm border border-[#E2E8F0] rounded-lg bg-white">
                    <option value="">All Plans</option>
                    {pricingPlans.map((p) => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#64748B] mb-1">Status</label>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full h-9 px-2.5 text-sm border border-[#E2E8F0] rounded-lg bg-white">
                    <option value="">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Trial">Trial</option>
                    <option value="Expiring Soon">Expiring Soon</option>
                    <option value="Paused">Paused</option>
                    <option value="Expired">Expired</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#64748B] mb-1">Billing Cycle</label>
                  <select value={cycleFilter} onChange={(e) => setCycleFilter(e.target.value)} className="w-full h-9 px-2.5 text-sm border border-[#E2E8F0] rounded-lg bg-white">
                    <option value="">All Cycles</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Annual">Annual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#64748B] mb-1">Minimum Amount (₹)</label>
                  <input type="number" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} placeholder="e.g. 50000" className="w-full h-9 px-2.5 text-sm border border-[#E2E8F0] rounded-lg" />
                </div>
              </FilterPopover>
            </div>
          </div>
        }
      />

      {/* Plan Change Modal */}
      <FormModal
        open={planChangeModal !== null}
        title={`Change Plan — ${planChangeModal?.sub.companyName}`}
        subtitle={`Current: ${planChangeModal?.sub.planName} (${planChangeModal?.sub.billingCycle}). Recorded in audit trail.`}
        onClose={() => setPlanChangeModal(null)}
        maxWidthClass="max-w-md"
        footer={
          <>
            <button type="button" onClick={() => setPlanChangeModal(null)} className="px-4 py-2 text-sm border border-[#E2E8F0] rounded-lg">
              Cancel
            </button>
            <button type="button" onClick={applyPlanChange} className="px-4 py-2 text-sm font-medium bg-[#7050F5] hover:bg-[#5E3DE6] text-white rounded-lg">
              Confirm Plan Change
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">Target Plan</label>
            <select
              value={selectedNewPlan}
              onChange={(e) => setSelectedNewPlan(e.target.value as PlanName)}
              className="w-full h-9 px-2.5 text-sm border border-[#E2E8F0] rounded-lg bg-white"
            >
              {pricingPlans.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name} ({formatNumberIN(p.employeeLimit)} seats · {formatINR(p.monthlyPrice)}/mo)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">Billing Cycle</label>
            <select
              value={selectedCycle}
              onChange={(e) => setSelectedCycle(e.target.value as 'Monthly' | 'Annual')}
              className="w-full h-9 px-2.5 text-sm border border-[#E2E8F0] rounded-lg bg-white"
            >
              <option value="Monthly">Monthly</option>
              <option value="Annual">Annual</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">Change Justification</label>
            <textarea
              rows={2}
              value={changeReason}
              onChange={(e) => setChangeReason(e.target.value)}
              placeholder="Reason for plan change..."
              className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg"
            />
          </div>
        </div>
      </FormModal>

      {/* Lifecycle Confirmation */}
      <ConfirmationDialog
        open={confirmAction !== null}
        title={
          confirmAction?.action === 'extend_trial'
            ? `Extend trial for ${confirmAction.sub.companyName}?`
            : confirmAction?.action === 'renew'
            ? `Record simulated renewal for ${confirmAction.sub.companyName}?`
            : confirmAction?.action === 'pause'
            ? `Pause ${confirmAction.sub.companyName} subscription?`
            : confirmAction?.action === 'reactivate'
            ? `Reactivate ${confirmAction.sub.companyName} subscription?`
            : `Cancel ${confirmAction?.sub.companyName} subscription?`
        }
        description="Every subscription lifecycle change requires confirmation and creates an immutable audit record. Demo operations update local state only."
        variant={confirmAction?.action === 'cancel' ? 'danger' : confirmAction?.action === 'pause' ? 'warning' : 'primary'}
        requireReason={confirmAction?.action === 'cancel' || confirmAction?.action === 'pause'}
        onCancel={() => setConfirmAction(null)}
        onConfirm={(reason) => {
          if (!confirmAction) return;
          const { sub, action } = confirmAction;
          if (action === 'extend_trial') {
            updateSubscription(sub.id, { renewalDate: '2025-03-14', endDate: '2025-03-14' }, 'Extended trial by 14 days', 'Trial Extended');
          } else if (action === 'renew') {
            updateSubscription(sub.id, { status: 'Active', renewalDate: '2025-03-31', endDate: '2025-03-31' }, 'Demo renewal scheduled/recorded', 'Renewed');
          } else if (action === 'pause') {
            updateSubscription(sub.id, { status: 'Paused', autoRenew: false }, reason || 'Paused by admin', 'Paused');
          } else if (action === 'reactivate') {
            updateSubscription(sub.id, { status: 'Active', autoRenew: true }, 'Reactivated subscription', 'Reactivated');
          } else if (action === 'cancel') {
            updateSubscription(sub.id, { status: 'Cancelled', autoRenew: false }, reason || 'Cancelled by admin', 'Cancelled');
          }
          setConfirmAction(null);
        }}
      />
    </div>
  );
};
