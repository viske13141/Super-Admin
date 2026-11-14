import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  Copy,
  CreditCard,
  FileText,
  Layers,
  PackagePlus,
  Pencil,
  Plus,
  Receipt,
  RotateCcw,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useSearchParams } from 'react-router-dom';
import { usePlatformStore } from '../../services/platformStore';
import { ALL_MODULES } from '../../mock-data/seedData';
import { Invoice, ModuleKey, PaymentTransaction, PlanAddon, PlanCode, PlanName, PricingPlan, RefundRecord } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { ColumnDef, DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { FormModal } from '../../components/common/FormModal';
import { DetailDrawer } from '../../components/common/DetailDrawer';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { MultiSelect } from '../../components/common/MultiSelect';
import { ExportMenu } from '../../components/common/ExportMenu';
import { ChartCard } from '../../components/common/ChartCard';
import { exportToCSV, formatDate, formatINR, formatINRCrore } from '../../utils/format';

type BillingTab = 'plans' | 'addons' | 'invoices' | 'payments' | 'refunds' | 'analytics';

export const BillingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as BillingTab) || 'plans';
  const [tab, setTab] = useState<BillingTab>(initialTab);

  const {
    pricingPlans,
    addons,
    invoices,
    payments,
    refunds,
    subscriptions,
    companies,
    savePricingPlan,
    duplicatePricingPlan,
    saveAddon,
    markInvoicePaid,
    voidInvoice,
    reconcilePayment,
    initiateRefund,
    updateRefundStatus,
    pushToast,
  } = usePlatformStore();

  const switchTab = (next: BillingTab) => {
    setTab(next);
    setSearchParams({ tab: next });
  };

  // Plan Modal State
  const [planModal, setPlanModal] = useState<PricingPlan | null>(null);
  // Addon Modal State
  const [addonModal, setAddonModal] = useState<PlanAddon | null>(null);
  // Invoice Reconcile / Preview
  const [reconcileInv, setReconcileInv] = useState<Invoice | null>(null);
  const [reconcileRef, setReconcileRef] = useState('');
  const [reconcileNotes, setReconcileNotes] = useState('');
  const [previewInv, setPreviewInv] = useState<Invoice | null>(null);
  // Payment Gateway Drawer & Refund Request
  const [paymentDrawer, setPaymentDrawer] = useState<PaymentTransaction | null>(null);
  const [refundModalTxn, setRefundModalTxn] = useState<PaymentTransaction | null>(null);
  const [refundAmount, setRefundAmount] = useState(0);
  const [refundReason, setRefundReason] = useState('');
  // Financial Authorization Dialog
  const [refundConfirm, setRefundConfirm] = useState<{ refund: RefundRecord; nextStatus: RefundRecord['status'] } | null>(null);

  // Plan subscriber counts
  const planSubscribers = (name: PlanName) =>
    subscriptions.filter((s) => s.planName === name && s.status !== 'Cancelled').length;

  // Revenue Analytics Calculations
  const revenueMetrics = useMemo(() => {
    const mrr = subscriptions
      .filter((s) => s.status === 'Active' || s.status === 'Expiring Soon')
      .reduce((sum, s) => sum + (s.billingCycle === 'Annual' ? Math.round(s.amount / 12) : s.amount), 0);
    const arr = mrr * 12;
    const failedTotal = payments.filter((p) => p.status === 'Failed').reduce((s, p) => s + p.amount, 0);
    const outstandingTotal = invoices.filter((i) => i.paymentStatus === 'Pending' || i.paymentStatus === 'Overdue').reduce((s, i) => s + i.total, 0);

    const byPlan = (['Essential', 'Growth', 'Business', 'Enterprise'] as PlanName[]).map((p) => ({
      name: p,
      revenue: subscriptions
        .filter((s) => s.planName === p && s.status !== 'Cancelled')
        .reduce((sum, s) => sum + s.amount, 0),
    }));

    const byIndustryMap: Record<string, number> = {};
    subscriptions.forEach((s) => {
      const comp = companies.find((c) => c.id === s.companyId);
      const ind = comp?.industry || 'Other Industries';
      byIndustryMap[ind] = (byIndustryMap[ind] || 0) + s.amount;
    });
    const byIndustry = Object.entries(byIndustryMap).map(([name, value]) => ({ name, value }));

    return { mrr, arr, failedTotal, outstandingTotal, byPlan, byIndustry };
  }, [subscriptions, payments, invoices, companies]);

  const invoiceCols: ColumnDef<Invoice>[] = [
    { key: 'num', header: 'Invoice #', sortable: true, sortValue: (i) => i.invoiceNumber, render: (i) => <span className="font-mono-code text-xs font-semibold text-[#5B3CE6]">{i.invoiceNumber}</span> },
    { key: 'company', header: 'Company', sortable: true, sortValue: (i) => i.companyName, render: (i) => <span className="font-medium text-[#0F172A]">{i.companyName}</span> },
    { key: 'sub', header: 'Subscription', render: (i) => <span className="font-mono-code text-xs text-[#64748B]">{i.subscriptionId}</span> },
    { key: 'date', header: 'Invoice Date', sortable: true, sortValue: (i) => i.invoiceDate, render: (i) => <span className="tabular-nums text-[#64748B]">{formatDate(i.invoiceDate)}</span> },
    { key: 'due', header: 'Due Date', sortable: true, sortValue: (i) => i.dueDate, render: (i) => <span className="tabular-nums text-[#64748B]">{formatDate(i.dueDate)}</span> },
    { key: 'amount', header: 'Subtotal', align: 'right', render: (i) => <span className="tabular-nums">{formatINR(i.subtotal)}</span> },
    { key: 'tax', header: 'Tax (18%)', align: 'right', render: (i) => <span className="tabular-nums text-[#64748B]">{formatINR(i.tax)}</span> },
    { key: 'total', header: 'Total', align: 'right', sortable: true, sortValue: (i) => i.total, render: (i) => <span className="font-semibold tabular-nums">{formatINR(i.total)}</span> },
    { key: 'status', header: 'Status', render: (i) => <StatusBadge status={i.paymentStatus} /> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (i) => (
        <div className="inline-flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPreviewInv(i)}
            className="px-2.5 py-1 rounded-lg border border-[#E2E8F0] text-xs font-medium hover:bg-slate-50"
          >
            View / PDF
          </button>
          {(i.paymentStatus === 'Pending' || i.paymentStatus === 'Overdue') && (
            <button
              type="button"
              onClick={() => {
                setReconcileInv(i);
                setReconcileRef('');
                setReconcileNotes('');
              }}
              className="px-2.5 py-1 rounded-lg bg-[#7050F5] text-white text-xs font-medium hover:bg-[#5E3DE6]"
            >
              Mark Paid
            </button>
          )}
        </div>
      ),
    },
  ];

  const paymentCols: ColumnDef<PaymentTransaction>[] = [
    { key: 'txn', header: 'Transaction ID', render: (p) => <span className="font-mono-code text-xs font-semibold">{p.transactionId}</span> },
    { key: 'company', header: 'Company', render: (p) => <span className="font-medium">{p.companyName}</span> },
    { key: 'inv', header: 'Invoice', render: (p) => <span className="font-mono-code text-xs text-[#5B3CE6]">{p.invoiceNumber}</span> },
    { key: 'gw', header: 'Gateway', render: (p) => p.paymentGateway },
    { key: 'method', header: 'Method', render: (p) => p.paymentMethod },
    { key: 'amount', header: 'Amount', align: 'right', render: (p) => <span className="font-semibold tabular-nums">{formatINR(p.amount)}</span> },
    { key: 'date', header: 'Date', render: (p) => <span className="tabular-nums text-[#64748B]">{formatDate(p.paymentDate)}</span> },
    { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (p) => (
        <div className="inline-flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPaymentDrawer(p)}
            className="px-2.5 py-1 rounded-lg border border-[#E2E8F0] text-xs font-medium hover:bg-slate-50"
          >
            Response
          </button>
          {!p.reconciled && p.status === 'Succeeded' && (
            <button
              type="button"
              onClick={() => reconcilePayment(p.id)}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700"
            >
              Reconcile
            </button>
          )}
          {p.status === 'Succeeded' && (
            <button
              type="button"
              onClick={() => {
                setRefundModalTxn(p);
                setRefundAmount(p.amount);
                setRefundReason('');
              }}
              className="px-2.5 py-1 rounded-lg border border-rose-200 text-rose-600 text-xs font-medium hover:bg-rose-50"
            >
              Refund
            </button>
          )}
        </div>
      ),
    },
  ];

  const refundCols: ColumnDef<RefundRecord>[] = [
    { key: 'id', header: 'Refund ID', render: (r) => <span className="font-mono-code text-xs font-semibold">{r.refundId}</span> },
    { key: 'pay', header: 'Payment ID', render: (r) => <span className="font-mono-code text-xs text-[#64748B]">{r.paymentId}</span> },
    { key: 'company', header: 'Company', render: (r) => <span className="font-medium">{r.companyName}</span> },
    { key: 'req', header: 'Requested', align: 'right', render: (r) => <span className="tabular-nums">{formatINR(r.requestedAmount)}</span> },
    { key: 'app', header: 'Approved', align: 'right', render: (r) => <span className="tabular-nums font-semibold">{formatINR(r.approvedAmount)}</span> },
    { key: 'reason', header: 'Reason', render: (r) => <span className="text-xs text-[#64748B] line-clamp-1 max-w-[220px]">{r.reason}</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions',
      header: 'Authorization',
      align: 'right',
      render: (r) => (
        <div className="inline-flex items-center gap-1.5">
          {r.status === 'Pending Approval' && (
            <>
              <button
                type="button"
                onClick={() => setRefundConfirm({ refund: r, nextStatus: 'Approved' })}
                className="px-2.5 py-1 rounded-lg bg-[#7050F5] text-white text-xs font-medium"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => setRefundConfirm({ refund: r, nextStatus: 'Rejected' })}
                className="px-2.5 py-1 rounded-lg border border-rose-200 text-rose-600 text-xs font-medium"
              >
                Reject
              </button>
            </>
          )}
          {r.status === 'Approved' && (
            <button
              type="button"
              onClick={() => setRefundConfirm({ refund: r, nextStatus: 'Processed' })}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-medium"
            >
              Process Refund
            </button>
          )}
        </div>
      ),
    },
  ];

  const subNav: { key: BillingTab; label: string; icon: React.ReactNode }[] = [
    { key: 'plans', label: 'Pricing Plans', icon: <Layers className="w-4 h-4" /> },
    { key: 'addons', label: 'Add-ons', icon: <PackagePlus className="w-4 h-4" /> },
    { key: 'invoices', label: 'Invoices', icon: <FileText className="w-4 h-4" /> },
    { key: 'payments', label: 'Payments', icon: <CreditCard className="w-4 h-4" /> },
    { key: 'refunds', label: 'Refunds', icon: <RotateCcw className="w-4 h-4" /> },
    { key: 'analytics', label: 'Revenue Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Plans & Billing"
        subtitle="Versioned pricing catalog, add-ons, invoice reconciliation, payment gateways, refunds, and revenue analytics."
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Plans & Billing' }]}
        actions={
          tab === 'plans' ? (
            <button
              type="button"
              onClick={() =>
                setPlanModal({
                  id: `PLN-${Date.now()}`,
                  name: 'Growth',
                  code: 'CUSTOM_PLAN' as PlanCode,
                  version: 'v1.0',
                  description: '',
                  monthlyPrice: 49999,
                  annualPrice: 499990,
                  trialDays: 14,
                  employeeLimit: 1500,
                  branchLimit: 20,
                  storageLimitGB: 150,
                  apiLimitPerDay: 50000,
                  enabledModules: ['Employee Management', 'Attendance', 'Leave', 'Payroll', 'Compliance'],
                  supportLevel: 'Priority Business',
                  status: 'Active',
                  updatedAt: new Date().toISOString().slice(0, 10),
                })
              }
              className="h-9 px-4 bg-[#7050F5] hover:bg-[#5E3DE6] text-white rounded-lg text-sm font-medium inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Plan</span>
            </button>
          ) : tab === 'addons' ? (
            <button
              type="button"
              onClick={() =>
                setAddonModal({
                  id: `ADD-${Date.now()}`,
                  name: '',
                  description: '',
                  price: 5000,
                  billingFrequency: 'Monthly',
                  eligibility: 'All Plans',
                  status: 'Active',
                })
              }
              className="h-9 px-4 bg-[#7050F5] hover:bg-[#5E3DE6] text-white rounded-lg text-sm font-medium inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Add-on</span>
            </button>
          ) : tab === 'analytics' ? (
            <ExportMenu
              onExportCSV={() => {
                exportToCSV('payfuse-revenue-analytics.csv', revenueMetrics.byPlan);
                pushToast({ type: 'success', title: 'Exported revenue CSV' });
              }}
              onExportPrintPDF={() => window.print()}
            />
          ) : undefined
        }
      />

      {/* Sub-navigation */}
      <div className="bg-white rounded-2xl border border-[#E8EBF4] p-1.5 flex items-center gap-1 overflow-x-auto">
        {subNav.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => switchTab(item.key)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap ${
              tab === item.key
                ? 'bg-[#7050F5] text-white'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* 1. Pricing Plans */}
      {tab === 'plans' && (
        <div className="space-y-4">
          <div className="px-4 py-3 rounded-xl bg-[#F4F2FF] border border-[#7050F5]/20 text-xs text-[#5B3CE6]">
            <strong>Versioned Plan Policy:</strong> Editing a plan publishes a new version snapshot. Existing customer entitlements remain locked to their subscribed version until explicit upgrade/migration.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {pricingPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-2xl border border-[#E8EBF4] p-5 flex flex-col justify-between shadow-[0_1px_3px_rgba(15,23,42,0.03)]"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-[#0F172A]">{plan.name}</h3>
                      <p className="text-[11px] font-mono-code text-[#64748B]">
                        {plan.code} · {plan.version}
                      </p>
                    </div>
                    <StatusBadge status={plan.status} />
                  </div>
                  <p className="mt-2.5 text-xs text-[#64748B] leading-relaxed">{plan.description}</p>
                  <div className="mt-4 pt-3 border-t border-[#F1F3F9] space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Monthly</span>
                      <strong className="tabular-nums text-[#0F172A]">{formatINR(plan.monthlyPrice)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Annual</span>
                      <strong className="tabular-nums text-[#0F172A]">{formatINR(plan.annualPrice)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Employee Limit</span>
                      <strong className="tabular-nums">{plan.employeeLimit.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Modules Included</span>
                      <strong className="tabular-nums">{plan.enabledModules.length} / {ALL_MODULES.length}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Active Subscribers</span>
                      <strong className="tabular-nums text-[#7050F5]">{planSubscribers(plan.name)}</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#F1F3F9] flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPlanModal(plan)}
                    className="flex-1 h-8 rounded-lg border border-[#E2E8F0] text-xs font-medium hover:bg-slate-50 inline-flex items-center justify-center gap-1.5"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit Version</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => duplicatePricingPlan(plan.id)}
                    aria-label={`Duplicate ${plan.name}`}
                    className="h-8 px-2.5 rounded-lg border border-[#E2E8F0] text-xs hover:bg-slate-50"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Add-ons */}
      {tab === 'addons' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {addons.map((a) => (
            <div key={a.id} className="bg-white rounded-2xl border border-[#E8EBF4] p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-[#0F172A]">{a.name}</h3>
                  <StatusBadge status={a.status} />
                </div>
                <p className="text-xs text-[#64748B] mt-2">{a.description}</p>
                <div className="mt-3 pt-3 border-t border-[#F1F3F9] space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-[#64748B]">Price</span><strong className="tabular-nums">{formatINR(a.price)} ({a.billingFrequency})</strong></div>
                  <div className="flex justify-between"><span className="text-[#64748B]">Eligibility</span><span>{a.eligibility}</span></div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => setAddonModal(a)} className="flex-1 h-8 rounded-lg border border-[#E2E8F0] text-xs font-medium hover:bg-slate-50">Edit</button>
                <button
                  type="button"
                  onClick={() => saveAddon({ ...a, status: a.status === 'Active' ? 'Inactive' : 'Active' })}
                  className="h-8 px-3 rounded-lg bg-[#F4F2FF] text-[#5B3CE6] text-xs font-medium"
                >
                  {a.status === 'Active' ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Invoices */}
      {tab === 'invoices' && (
        <DataTable data={invoices} columns={invoiceCols} rowKey={(i) => i.id} />
      )}

      {/* 4. Payments */}
      {tab === 'payments' && (
        <DataTable data={payments} columns={paymentCols} rowKey={(p) => p.id} />
      )}

      {/* 5. Refunds */}
      {tab === 'refunds' && (
        <DataTable data={refunds} columns={refundCols} rowKey={(r) => r.id} />
      )}

      {/* 6. Revenue Analytics */}
      {tab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-[#E8EBF4] p-4">
              <p className="text-xs text-[#64748B]">Monthly Recurring Revenue (MRR)</p>
              <p className="text-2xl font-bold text-[#0F172A] tabular-nums mt-1">{formatINR(revenueMetrics.mrr)}</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#E8EBF4] p-4">
              <p className="text-xs text-[#64748B]">Annual Run Rate (ARR)</p>
              <p className="text-2xl font-bold text-[#7050F5] tabular-nums mt-1">{formatINRCrore(revenueMetrics.arr)}</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#E8EBF4] p-4">
              <p className="text-xs text-[#64748B]">Outstanding Invoices</p>
              <p className="text-2xl font-bold text-amber-600 tabular-nums mt-1">{formatINR(revenueMetrics.outstandingTotal)}</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#E8EBF4] p-4">
              <p className="text-xs text-[#64748B]">Failed Payments</p>
              <p className="text-2xl font-bold text-rose-600 tabular-nums mt-1">{formatINR(revenueMetrics.failedTotal)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Revenue by Subscription Plan" subtitle="Active subscription contract value">
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueMetrics.byPlan}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F8" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${Math.round(v / 100000)}L`} />
                    <Tooltip formatter={(val) => formatINR(Number(val ?? 0))} />
                    <Bar dataKey="revenue" fill="#7050F5" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard title="Revenue by Industry" subtitle="Share of recurring billing across industries">
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={revenueMetrics.byIndustry} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {revenueMetrics.byIndustry.map((_, idx) => (
                        <Cell key={idx} fill={['#7050F5', '#478BFA', '#10B981', '#F59E0B', '#EC4899', '#0EA5E9', '#14B8A6'][idx % 7]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val) => formatINR(Number(val ?? 0))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>
        </div>
      )}

      {/* Plan Create/Edit Modal */}
      {planModal && (
        <FormModal
          open
          title={`Configure Plan: ${planModal.name}`}
          subtitle="Saves as a versioned configuration without overwriting active customer contracts."
          onClose={() => setPlanModal(null)}
          footer={
            <>
              <button type="button" onClick={() => setPlanModal(null)} className="px-4 py-2 text-sm border border-[#E2E8F0] rounded-lg">Cancel</button>
              <button
                type="button"
                onClick={() => {
                  savePricingPlan(planModal);
                  setPlanModal(null);
                }}
                className="px-4 py-2 text-sm font-medium bg-[#7050F5] text-white rounded-lg"
              >
                Publish Plan Version
              </button>
            </>
          }
        >
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Plan Name</label>
                <input value={planModal.name} onChange={(e) => setPlanModal({ ...planModal, name: e.target.value as PlanName })} className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Plan Code</label>
                <input value={planModal.code} onChange={(e) => setPlanModal({ ...planModal, code: e.target.value as PlanCode })} className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Monthly Price (₹)</label>
                <input type="number" value={planModal.monthlyPrice} onChange={(e) => setPlanModal({ ...planModal, monthlyPrice: Number(e.target.value) })} className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Annual Price (₹)</label>
                <input type="number" value={planModal.annualPrice} onChange={(e) => setPlanModal({ ...planModal, annualPrice: Number(e.target.value) })} className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Employee Limit</label>
                <input type="number" value={planModal.employeeLimit} onChange={(e) => setPlanModal({ ...planModal, employeeLimit: Number(e.target.value) })} className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Status</label>
                <select value={planModal.status} onChange={(e) => setPlanModal({ ...planModal, status: e.target.value as PricingPlan['status'] })} className="w-full h-9 px-2 border border-[#E2E8F0] rounded-lg bg-white">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">Included Modules</label>
              <MultiSelect
                options={ALL_MODULES}
                selected={planModal.enabledModules}
                onChange={(next: ModuleKey[]) => setPlanModal({ ...planModal, enabledModules: next })}
                columns={3}
              />
            </div>
          </div>
        </FormModal>
      )}

      {/* Add-on Modal */}
      {addonModal && (
        <FormModal
          open
          title={addonModal.name ? `Edit Add-on: ${addonModal.name}` : 'Create Plan Add-on'}
          onClose={() => setAddonModal(null)}
          maxWidthClass="max-w-md"
          footer={
            <>
              <button type="button" onClick={() => setAddonModal(null)} className="px-4 py-2 text-sm border border-[#E2E8F0] rounded-lg">Cancel</button>
              <button
                type="button"
                onClick={() => {
                  if (!addonModal.name.trim()) return;
                  saveAddon(addonModal);
                  setAddonModal(null);
                }}
                className="px-4 py-2 text-sm font-medium bg-[#7050F5] text-white rounded-lg"
              >
                Save Add-on
              </button>
            </>
          }
        >
          <div className="space-y-3 text-sm">
            <div>
              <label className="block text-xs font-semibold mb-1">Add-on Name *</label>
              <input value={addonModal.name} onChange={(e) => setAddonModal({ ...addonModal, name: e.target.value })} className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Description</label>
              <textarea rows={2} value={addonModal.description} onChange={(e) => setAddonModal({ ...addonModal, description: e.target.value })} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Price (₹)</label>
                <input type="number" value={addonModal.price} onChange={(e) => setAddonModal({ ...addonModal, price: Number(e.target.value) })} className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Frequency</label>
                <select value={addonModal.billingFrequency} onChange={(e) => setAddonModal({ ...addonModal, billingFrequency: e.target.value as PlanAddon['billingFrequency'] })} className="w-full h-9 px-2 border border-[#E2E8F0] rounded-lg bg-white">
                  <option>Monthly</option>
                  <option>Annual</option>
                  <option>One-Time</option>
                  <option>Per Employee / Month</option>
                </select>
              </div>
            </div>
          </div>
        </FormModal>
      )}

      {/* Invoice Reconciliation Modal */}
      <FormModal
        open={reconcileInv !== null}
        title={`Mark Invoice ${reconcileInv?.invoiceNumber} as Paid`}
        subtitle="Provide bank UTR / gateway reconciliation reference before updating invoice state."
        onClose={() => setReconcileInv(null)}
        maxWidthClass="max-w-md"
        footer={
          <>
            <button type="button" onClick={() => setReconcileInv(null)} className="px-4 py-2 text-sm border border-[#E2E8F0] rounded-lg">Cancel</button>
            <button
              type="button"
              onClick={() => {
                if (!reconcileInv || !reconcileRef.trim()) {
                  pushToast({ type: 'error', title: 'Reference required', message: 'Enter UTR or Gateway Reference ID.' });
                  return;
                }
                markInvoicePaid(reconcileInv.id, reconcileRef.trim(), reconcileNotes.trim());
                setReconcileInv(null);
              }}
              className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg"
            >
              Confirm Reconciliation
            </button>
          </>
        }
      >
        <div className="space-y-3 text-sm">
          <p className="text-xs text-[#64748B]">
            Amount due: <strong className="text-[#0F172A]">{reconcileInv ? formatINR(reconcileInv.total) : ''}</strong>
          </p>
          <div>
            <label className="block text-xs font-semibold mb-1">Reconciliation Reference (UTR / Gateway ID) *</label>
            <input value={reconcileRef} onChange={(e) => setReconcileRef(e.target.value)} placeholder="e.g. HDFC_UTR_892104" className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Evidence Notes</label>
            <textarea rows={2} value={reconcileNotes} onChange={(e) => setReconcileNotes(e.target.value)} placeholder="Verified against corporate bank statement..." className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg" />
          </div>
        </div>
      </FormModal>

      {/* Invoice PDF Preview Modal */}
      <FormModal
        open={previewInv !== null}
        title={`Tax Invoice ${previewInv?.invoiceNumber}`}
        subtitle={`Issued to ${previewInv?.companyName}`}
        onClose={() => setPreviewInv(null)}
        footer={
          <>
            {previewInv && (previewInv.paymentStatus === 'Pending' || previewInv.paymentStatus === 'Overdue') && (
              <button
                type="button"
                onClick={() => {
                  voidInvoice(previewInv.id, 'Voided by Super Admin');
                  setPreviewInv(null);
                }}
                className="px-4 py-2 text-sm text-rose-600 border border-rose-200 rounded-lg"
              >
                Void Invoice
              </button>
            )}
            <button type="button" onClick={() => window.print()} className="px-4 py-2 text-sm bg-[#7050F5] text-white rounded-lg inline-flex items-center gap-1.5">
              <Receipt className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
          </>
        }
      >
        {previewInv && (
          <div className="space-y-4 text-sm border border-[#E8EBF4] rounded-xl p-5 bg-[#FDFDFE]">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-lg font-bold text-[#0F172A]">PayFuse Technologies Pvt Ltd</h4>
                <p className="text-xs text-[#64748B]">GSTIN: 29AABCP9912K1Z4 · Bengaluru, India</p>
              </div>
              <StatusBadge status={previewInv.paymentStatus} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-[#E8EBF4]">
              <div><span className="text-[#64748B]">Bill To:</span> <strong className="block text-[#0F172A]">{previewInv.companyName}</strong></div>
              <div><span className="text-[#64748B]">Invoice Date / Due:</span> <strong className="block tabular-nums">{formatDate(previewInv.invoiceDate)} / {formatDate(previewInv.dueDate)}</strong></div>
            </div>
            <div className="pt-3 border-t border-[#E8EBF4] space-y-1.5 text-xs">
              <div className="flex justify-between"><span>Subscription Plan ({previewInv.subscriptionId})</span><span className="tabular-nums">{formatINR(previewInv.subtotal)}</span></div>
              <div className="flex justify-between text-[#64748B]"><span>IGST (18%)</span><span className="tabular-nums">{formatINR(previewInv.tax)}</span></div>
              <div className="flex justify-between font-bold text-sm pt-2 border-t border-[#E8EBF4]"><span>Total</span><span className="tabular-nums text-[#7050F5]">{formatINR(previewInv.total)}</span></div>
            </div>
          </div>
        )}
      </FormModal>

      {/* Payment Gateway Response Drawer */}
      <DetailDrawer
        open={paymentDrawer !== null}
        onClose={() => setPaymentDrawer(null)}
        title={`Payment ${paymentDrawer?.transactionId}`}
        subtitle={`${paymentDrawer?.paymentGateway} · ${paymentDrawer?.gatewayReference}`}
      >
        {paymentDrawer && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-2">
              <StatusBadge status={paymentDrawer.status} size="md" />
              {paymentDrawer.reconciled && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" /> Ledger Reconciled
                </span>
              )}
            </div>
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E8EBF4] space-y-1 text-xs">
              <p className="font-semibold text-[#0F172A]">Gateway Response Summary</p>
              <p className="font-mono-code text-[#475569]">{paymentDrawer.gatewayResponseSummary}</p>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-xs">
              <div><dt className="text-[#64748B]">Company</dt><dd className="font-semibold">{paymentDrawer.companyName}</dd></div>
              <div><dt className="text-[#64748B]">Invoice</dt><dd className="font-mono-code">{paymentDrawer.invoiceNumber}</dd></div>
              <div><dt className="text-[#64748B]">Amount</dt><dd className="font-semibold tabular-nums">{formatINR(paymentDrawer.amount)}</dd></div>
              <div><dt className="text-[#64748B]">Method</dt><dd>{paymentDrawer.paymentMethod}</dd></div>
            </dl>
          </div>
        )}
      </DetailDrawer>

      {/* Initiate Refund Modal */}
      <FormModal
        open={refundModalTxn !== null}
        title={`Initiate Refund for ${refundModalTxn?.transactionId}`}
        subtitle={`Original amount: ${refundModalTxn ? formatINR(refundModalTxn.amount) : ''}. Requires Super Admin authorization.`}
        onClose={() => setRefundModalTxn(null)}
        maxWidthClass="max-w-md"
        footer={
          <>
            <button type="button" onClick={() => setRefundModalTxn(null)} className="px-4 py-2 text-sm border border-[#E2E8F0] rounded-lg">Cancel</button>
            <button
              type="button"
              onClick={() => {
                if (!refundModalTxn || refundAmount <= 0 || !refundReason.trim()) return;
                initiateRefund(refundModalTxn.id, refundAmount, refundReason.trim());
                setRefundModalTxn(null);
                switchTab('refunds');
              }}
              className="px-4 py-2 text-sm font-medium bg-rose-600 text-white rounded-lg"
            >
              Submit Refund Request
            </button>
          </>
        }
      >
        <div className="space-y-3 text-sm">
          <div>
            <label className="block text-xs font-semibold mb-1">Refund Amount (₹)</label>
            <input type="number" max={refundModalTxn?.amount} value={refundAmount} onChange={(e) => setRefundAmount(Number(e.target.value))} className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Refund Justification *</label>
            <textarea rows={2} value={refundReason} onChange={(e) => setRefundReason(e.target.value)} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg" />
          </div>
        </div>
      </FormModal>

      {/* Financial Authorization Dialog for Refunds */}
      <ConfirmationDialog
        open={refundConfirm !== null}
        title={`${refundConfirm?.nextStatus} Refund ${refundConfirm?.refund.refundId}?`}
        description={`Financial authorization required to mark refund for ${refundConfirm?.refund.companyName} (${refundConfirm ? formatINR(refundConfirm.refund.requestedAmount) : ''}) as ${refundConfirm?.nextStatus}.`}
        variant={refundConfirm?.nextStatus === 'Rejected' ? 'danger' : 'primary'}
        requireReauth
        onCancel={() => setRefundConfirm(null)}
        onConfirm={() => {
          if (refundConfirm) {
            updateRefundStatus(refundConfirm.refund.id, refundConfirm.nextStatus);
          }
          setRefundConfirm(null);
        }}
      />
    </div>
  );
};
