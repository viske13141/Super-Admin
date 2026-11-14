import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  AccessPolicy,
  Announcement,
  AuditEvent,
  AuditEventType,
  Company,
  CompanyAccountStatus,
  DataRetentionPolicy,
  DateRangeSelection,
  FeatureFlag,
  GlobalConfig,
  HelpDocArticle,
  IndustryConfigItem,
  Invoice,
  MicroserviceHealth,
  ModuleKey,
  NotificationTemplate,
  PaymentTransaction,
  PlanAddon,
  PlanName,
  PlatformIntegration,
  PlatformNotification,
  PlatformUser,
  PricingPlan,
  RefundRecord,
  RoleDefinition,
  ServiceLogEntry,
  StatutoryRule,
  Subscription,
  SupportTicket,
  TicketPriority,
  TicketStatus,
  ToastItem,
} from '../types';
import {
  BASE_PAYROLL_TREND,
  MonthlyTrendPoint,
  SEED_ACCESS_POLICIES,
  SEED_ADDONS,
  SEED_ANNOUNCEMENTS,
  SEED_AUDIT_EVENTS,
  SEED_COMPANIES,
  SEED_DATA_RETENTION,
  SEED_FEATURE_FLAGS,
  SEED_GLOBAL_CONFIG,
  SEED_HELP_DOCS,
  SEED_INDUSTRY_CONFIG,
  SEED_INTEGRATIONS,
  SEED_INVOICES,
  SEED_NOTIFICATIONS,
  SEED_NOTIFICATION_TEMPLATES,
  SEED_PAYMENTS,
  SEED_PLATFORM_USERS,
  SEED_PRICING_PLANS,
  SEED_REFUNDS,
  SEED_ROLES,
  SEED_SERVICES_HEALTH,
  SEED_SERVICE_LOGS,
  SEED_STATUTORY_RULES,
  SEED_SUBSCRIPTIONS,
  SEED_SUPPORT_TICKETS,
} from '../mock-data/seedData';

interface PlatformContextValue {
  // Navigation & Shell State
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (val: boolean) => void;
  dateRange: DateRangeSelection;
  setDateRange: (range: DateRangeSelection) => void;
  toasts: ToastItem[];
  pushToast: (toast: Omit<ToastItem, 'id'>) => void;
  dismissToast: (id: string) => void;

  // Entities
  companies: Company[];
  subscriptions: Subscription[];
  pricingPlans: PricingPlan[];
  addons: PlanAddon[];
  invoices: Invoice[];
  payments: PaymentTransaction[];
  refunds: RefundRecord[];
  platformUsers: PlatformUser[];
  roles: RoleDefinition[];
  accessPolicies: AccessPolicy[];
  servicesHealth: MicroserviceHealth[];
  serviceLogs: ServiceLogEntry[];
  integrations: PlatformIntegration[];
  globalConfig: GlobalConfig;
  industries: IndustryConfigItem[];
  featureFlags: FeatureFlag[];
  notificationTemplates: NotificationTemplate[];
  statutoryRules: StatutoryRule[];
  dataRetention: DataRetentionPolicy[];
  supportTickets: SupportTicket[];
  announcements: Announcement[];
  helpDocs: HelpDocArticle[];
  auditEvents: AuditEvent[];
  notifications: PlatformNotification[];

  // Derived Dashboard Metrics
  dashboardMetrics: {
    totalCompanies: number;
    activeCompanies: number;
    totalEmployees: number;
    activeEmployees: number;
    payrollProcessedINR: number;
    companiesProcessingPayroll: number;
    activeSubscriptions: number;
    activeSubscriptionPercent: number;
    openTickets: number;
    criticalTickets: number;
    trendSeries: MonthlyTrendPoint[];
  };

  // Audit Logger
  recordAudit: (entry: {
    action: string;
    eventType: AuditEventType;
    module: string;
    resource: string;
    result?: 'Success' | 'Denied' | 'Failed';
    previousValue?: string;
    newValue?: string;
    details: string;
  }) => void;

  // Company Actions
  createCompany: (company: Omit<Company, 'id' | 'subscriptionId' | 'lastActive'>) => Company;
  updateCompany: (id: string, patch: Partial<Company>, auditLabel?: string) => void;
  setCompanyStatus: (id: string, status: CompanyAccountStatus, reason?: string) => void;
  softDeleteCompany: (id: string, reason: string) => { ok: boolean; error?: string };

  // Subscription Actions
  updateSubscription: (id: string, patch: Partial<Subscription>, changeNotes: string, changeType: Subscription['changeHistory'][0]['changeType']) => void;

  // Billing Actions
  savePricingPlan: (plan: PricingPlan) => void;
  duplicatePricingPlan: (id: string) => void;
  saveAddon: (addon: PlanAddon) => void;
  markInvoicePaid: (invoiceId: string, ref: string, notes: string) => void;
  voidInvoice: (invoiceId: string, reason: string) => void;
  reconcilePayment: (paymentId: string) => void;
  initiateRefund: (paymentId: string, amount: number, reason: string) => void;
  updateRefundStatus: (refundId: string, status: RefundRecord['status']) => void;

  // Platform Users & Roles Actions
  savePlatformUser: (user: PlatformUser) => void;
  toggleUserLock: (userId: string, lock: boolean) => void;
  toggleUserActive: (userId: string, active: boolean) => void;
  revokeUserSessions: (userId: string) => void;
  saveRole: (role: RoleDefinition) => void;
  deleteCustomRole: (roleId: string) => { ok: boolean; error?: string };
  toggleAccessPolicy: (policyId: string, enforcement: AccessPolicy['enforcement']) => void;

  // Operations & Settings Actions
  refreshHealthSnapshot: () => void;
  saveIntegration: (integration: PlatformIntegration) => void;
  testIntegrationConnection: (id: string) => void;
  updateGlobalConfig: (config: GlobalConfig) => void;
  toggleIndustry: (id: string) => void;
  toggleFeatureFlag: (id: string) => void;
  saveNotificationTemplate: (tpl: NotificationTemplate) => void;
  saveStatutoryRule: (rule: StatutoryRule) => void;
  transitionStatutoryRule: (id: string, status: StatutoryRule['approvalStatus']) => void;

  // Support, Announcements, Help Docs, Notifications
  updateTicket: (id: string, patch: Partial<SupportTicket>) => void;
  addTicketMessage: (ticketId: string, content: string, authorType: 'Support Agent' | 'Internal Note') => void;
  createTicket: (payload: { subject: string; companyId: string; category: SupportTicket['category']; priority: TicketPriority; message: string }) => void;
  saveAnnouncement: (ann: Announcement) => void;
  deleteDraftAnnouncement: (id: string) => void;
  saveHelpDoc: (doc: HelpDocArticle) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
}

const PlatformContext = createContext<PlatformContextValue | null>(null);

const SIDEBAR_STORAGE_KEY = 'payfuse_sidebar_collapsed';

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsedState] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const setSidebarCollapsed = useCallback((val: boolean) => {
    setSidebarCollapsedState(val);
    try {
      sessionStorage.setItem(SIDEBAR_STORAGE_KEY, String(val));
    } catch {
      // ignore storage failure
    }
  }, []);

  const [dateRange, setDateRange] = useState<DateRangeSelection>({
    preset: 'this_month',
    label: 'Jan 1, 2025 – Jan 31, 2025',
    startDate: '2025-01-01',
    endDate: '2025-01-31',
  });

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const pushToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // State Stores
  const [companies, setCompanies] = useState<Company[]>(SEED_COMPANIES);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(SEED_SUBSCRIPTIONS);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>(SEED_PRICING_PLANS);
  const [addons, setAddons] = useState<PlanAddon[]>(SEED_ADDONS);
  const [invoices, setInvoices] = useState<Invoice[]>(SEED_INVOICES);
  const [payments, setPayments] = useState<PaymentTransaction[]>(SEED_PAYMENTS);
  const [refunds, setRefunds] = useState<RefundRecord[]>(SEED_REFUNDS);
  const [platformUsers, setPlatformUsers] = useState<PlatformUser[]>(SEED_PLATFORM_USERS);
  const [roles, setRoles] = useState<RoleDefinition[]>(SEED_ROLES);
  const [accessPolicies, setAccessPolicies] = useState<AccessPolicy[]>(SEED_ACCESS_POLICIES);
  const [servicesHealth, setServicesHealth] = useState<MicroserviceHealth[]>(SEED_SERVICES_HEALTH);
  const [serviceLogs] = useState<ServiceLogEntry[]>(SEED_SERVICE_LOGS);
  const [integrations, setIntegrations] = useState<PlatformIntegration[]>(SEED_INTEGRATIONS);
  const [globalConfig, setGlobalConfig] = useState<GlobalConfig>(SEED_GLOBAL_CONFIG);
  const [industries, setIndustries] = useState<IndustryConfigItem[]>(SEED_INDUSTRY_CONFIG);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>(SEED_FEATURE_FLAGS);
  const [notificationTemplates, setNotificationTemplates] = useState<NotificationTemplate[]>(SEED_NOTIFICATION_TEMPLATES);
  const [statutoryRules, setStatutoryRules] = useState<StatutoryRule[]>(SEED_STATUTORY_RULES);
  const [dataRetention] = useState<DataRetentionPolicy[]>(SEED_DATA_RETENTION);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(SEED_SUPPORT_TICKETS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(SEED_ANNOUNCEMENTS);
  const [helpDocs, setHelpDocs] = useState<HelpDocArticle[]>(SEED_HELP_DOCS);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(SEED_AUDIT_EVENTS);
  const [notifications, setNotifications] = useState<PlatformNotification[]>(SEED_NOTIFICATIONS);

  const recordAudit: PlatformContextValue['recordAudit'] = useCallback((entry) => {
    const newEvt: AuditEvent = {
      id: `AUD-${Date.now()}`,
      eventId: `EVT-${Math.floor(90500 + Math.random() * 9000)}`,
      user: 'Vikramaditya Menon',
      role: 'Platform Super Admin',
      action: entry.action,
      eventType: entry.eventType,
      module: entry.module,
      resource: entry.resource,
      timestamp: new Date().toISOString(),
      ipAddress: '103.21.124.88',
      result: entry.result ?? 'Success',
      requestId: `req_${Math.random().toString(36).slice(2, 10)}`,
      previousValue: entry.previousValue,
      newValue: entry.newValue,
      details: entry.details,
    };
    setAuditEvents((prev) => [newEvt, ...prev]);
  }, []);

  // Derive dashboard metrics directly from live store state + dateRange scaling factor
  const dashboardMetrics = useMemo(() => {
    const visibleCompanies = companies.filter((c) => c.accountStatus !== 'Deactivated');
    const activeCompaniesList = visibleCompanies.filter((c) => c.accountStatus === 'Active');
    const totalEmployees = visibleCompanies.reduce((sum, c) => sum + c.employeeCount, 0);
    const activeEmployees = visibleCompanies.reduce((sum, c) => sum + c.activeEmployeeCount, 0);
    const baseMonthlyPayroll = activeCompaniesList.reduce((sum, c) => sum + c.monthlyPayrollINR, 0);

    // Date range adjustment multiplier for period-filtered analytics
    const presetFactorMap: Record<DateRangeSelection['preset'], number> = {
      today: 0.04,
      yesterday: 0.035,
      last_7_days: 0.25,
      last_30_days: 1,
      this_month: 1,
      last_month: 0.92,
      this_quarter: 2.85,
      this_year: 11.4,
      custom: 0.85,
    };
    const factor = presetFactorMap[dateRange.preset] ?? 1;
    const payrollProcessedINR = Math.round(baseMonthlyPayroll * factor);

    const activeSubs = subscriptions.filter((s) => s.status === 'Active' || s.status === 'Expiring Soon').length;
    const activeSubscriptionPercent =
      subscriptions.length > 0 ? Number(((activeSubs / subscriptions.length) * 100).toFixed(1)) : 0;

    const openTicketsList = supportTickets.filter(
      (t) => t.status === 'Open' || t.status === 'In Progress' || t.status === 'Waiting for Customer'
    );
    const criticalTickets = openTicketsList.filter((t) => t.priority === 'Critical').length;

    const latestPayrollCr = Number((baseMonthlyPayroll / 10000000).toFixed(2));
    const trendSeries = BASE_PAYROLL_TREND.map((pt, idx) =>
      idx === BASE_PAYROLL_TREND.length - 1
        ? {
            ...pt,
            amountCr: latestPayrollCr,
            employees: totalEmployees,
            companies: visibleCompanies.length,
          }
        : pt
    );

    return {
      totalCompanies: visibleCompanies.length,
      activeCompanies: activeCompaniesList.length,
      totalEmployees,
      activeEmployees,
      payrollProcessedINR,
      companiesProcessingPayroll: activeCompaniesList.length,
      activeSubscriptions: activeSubs,
      activeSubscriptionPercent,
      openTickets: openTicketsList.length,
      criticalTickets,
      trendSeries,
    };
  }, [companies, subscriptions, supportTickets, dateRange]);

  const createCompany: PlatformContextValue['createCompany'] = useCallback(
    (payload) => {
      const nextNum = 1001 + companies.length;
      const newCompanyId = `CMP-${nextNum}`;
      const newSubId = `SUB-${4001 + subscriptions.length}`;
      const created: Company = {
        ...payload,
        id: newCompanyId,
        subscriptionId: newSubId,
        lastActive: new Date().toISOString(),
      };
      setCompanies((prev) => [created, ...prev]);

      const plan = pricingPlans.find((p) => p.name === created.subscriptionPlan) || pricingPlans[0];
      const newSub: Subscription = {
        id: newSubId,
        companyId: newCompanyId,
        companyName: created.displayName,
        planName: created.subscriptionPlan,
        planVersion: plan.version,
        billingCycle: 'Monthly',
        startDate: created.registrationDate,
        endDate: '2025-02-28',
        renewalDate: '2025-02-28',
        nextBillingDate: '2025-02-28',
        employeeLimit: plan.employeeLimit,
        currentUsage: created.employeeCount,
        baseAmount: plan.monthlyPrice,
        discountPercent: 0,
        taxAmount: Math.round(plan.monthlyPrice * 0.18),
        amount: Math.round(plan.monthlyPrice * 1.18),
        status: created.accountStatus === 'Trial' ? 'Trial' : 'Active',
        enabledModules: created.enabledModules,
        autoRenew: true,
        changeHistory: [
          {
            id: `SCH-${Date.now()}`,
            date: created.registrationDate,
            actor: 'Vikramaditya Menon',
            changeType: 'Created',
            toPlan: created.subscriptionPlan,
            notes: 'Provisioned during company onboarding wizard.',
          },
        ],
      };
      setSubscriptions((prev) => [newSub, ...prev]);
      recordAudit({
        action: 'Created New Company',
        eventType: 'Create',
        module: 'Companies',
        resource: `${newCompanyId} (${created.displayName})`,
        newValue: `${created.subscriptionPlan} · ${created.accountStatus}`,
        details: `Onboarded ${created.legalName} under ${created.industry}.`,
      });
      pushToast({ type: 'success', title: 'Company created', message: `${created.displayName} (${newCompanyId}) added to PayFuse.` });
      return created;
    },
    [companies.length, subscriptions.length, pricingPlans, recordAudit, pushToast]
  );

  const updateCompany: PlatformContextValue['updateCompany'] = useCallback(
    (id, patch, auditLabel) => {
      setCompanies((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...patch, lastActive: new Date().toISOString() } : c))
      );
      recordAudit({
        action: auditLabel || 'Updated Company Profile',
        eventType: 'Edit',
        module: 'Companies',
        resource: id,
        details: `Updated fields: ${Object.keys(patch).join(', ')}`,
      });
      pushToast({ type: 'success', title: 'Company updated', message: `Changes saved for ${id}.` });
    },
    [recordAudit, pushToast]
  );

  const setCompanyStatus: PlatformContextValue['setCompanyStatus'] = useCallback(
    (id, status, reason) => {
      const target = companies.find((c) => c.id === id);
      if (!target) return;
      const prevStatus = target.accountStatus;
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                accountStatus: status,
                verificationStatus: status === 'Active' ? 'Verified' : c.verificationStatus,
                onboardingStage: status === 'Active' ? 'Go Live' : c.onboardingStage,
                internalNotes: reason ? `${c.internalNotes ? c.internalNotes + '\n' : ''}[${status}] ${reason}` : c.internalNotes,
              }
            : c
        )
      );
      recordAudit({
        action: status === 'Suspended' ? 'Suspended Company' : status === 'Active' ? 'Activated Company' : `Changed Company Status to ${status}`,
        eventType: status === 'Suspended' ? 'Suspend' : 'Activate',
        module: 'Companies',
        resource: `${id} (${target.displayName})`,
        previousValue: prevStatus,
        newValue: status,
        details: reason || `Status updated from ${prevStatus} to ${status}.`,
      });
      pushToast({
        type: status === 'Suspended' ? 'warning' : 'success',
        title: `Company ${status}`,
        message: `${target.displayName} is now ${status}.`,
      });
    },
    [companies, recordAudit, pushToast]
  );

  const softDeleteCompany: PlatformContextValue['softDeleteCompany'] = useCallback(
    (id, reason) => {
      const target = companies.find((c) => c.id === id);
      if (!target) return { ok: false, error: 'Company not found.' };
      if (target.legalHold) {
        return {
          ok: false,
          error: 'Company is under active statutory Legal Hold and cannot be deactivated.',
        };
      }
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                accountStatus: 'Deactivated',
                deletedAt: new Date().toISOString(),
                internalNotes: `${c.internalNotes ? c.internalNotes + '\n' : ''}[Soft-Deactivated] ${reason}`,
              }
            : c
        )
      );
      setSubscriptions((prev) =>
        prev.map((s) => (s.companyId === id ? { ...s, status: 'Cancelled', autoRenew: false } : s))
      );
      recordAudit({
        action: 'Soft-Deactivated Company (Retention Preserved)',
        eventType: 'Delete',
        module: 'Companies',
        resource: `${id} (${target.displayName})`,
        previousValue: target.accountStatus,
        newValue: 'Deactivated (Statutory Records Retained)',
        details: reason,
      });
      pushToast({
        type: 'info',
        title: 'Company deactivated',
        message: `${target.displayName} deactivated. Statutory & payroll ledgers retained per compliance policy.`,
      });
      return { ok: true };
    },
    [companies, recordAudit, pushToast]
  );

  const updateSubscription: PlatformContextValue['updateSubscription'] = useCallback(
    (id, patch, changeNotes, changeType) => {
      const existing = subscriptions.find((s) => s.id === id);
      if (!existing) return;
      const newRecord = {
        id: `SCH-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        actor: 'Vikramaditya Menon',
        changeType,
        fromPlan: existing.planName,
        toPlan: patch.planName || existing.planName,
        notes: changeNotes,
      };
      setSubscriptions((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                ...patch,
                changeHistory: [newRecord, ...s.changeHistory],
              }
            : s
        )
      );
      if (patch.planName || patch.enabledModules) {
        setCompanies((prev) =>
          prev.map((c) =>
            c.subscriptionId === id
              ? {
                  ...c,
                  subscriptionPlan: (patch.planName as PlanName) || c.subscriptionPlan,
                  enabledModules: (patch.enabledModules as ModuleKey[]) || c.enabledModules,
                }
              : c
          )
        );
      }
      recordAudit({
        action: `Subscription ${changeType}`,
        eventType: 'Edit',
        module: 'Subscriptions',
        resource: `${id} (${existing.companyName})`,
        previousValue: `${existing.planName} (${existing.status})`,
        newValue: `${patch.planName || existing.planName} (${patch.status || existing.status})`,
        details: changeNotes,
      });
      pushToast({ type: 'success', title: `Subscription ${changeType}`, message: `${existing.companyName} (${id}) updated.` });
    },
    [subscriptions, recordAudit, pushToast]
  );

  const savePricingPlan = useCallback(
    (plan: PricingPlan) => {
      const exists = pricingPlans.some((p) => p.id === plan.id);
      const nextVersion = exists ? bumpMinorVersion(plan.version) : plan.version || 'v1.0';
      const updatedPlan = { ...plan, version: nextVersion, updatedAt: new Date().toISOString().slice(0, 10) };
      setPricingPlans((prev) =>
        exists ? prev.map((p) => (p.id === plan.id ? updatedPlan : p)) : [updatedPlan, ...prev]
      );
      recordAudit({
        action: exists ? 'Published New Pricing Plan Version' : 'Created Pricing Plan',
        eventType: exists ? 'Edit' : 'Create',
        module: 'Plans & Billing',
        resource: `${updatedPlan.name} (${updatedPlan.version})`,
        details: 'Versioned plan saved. Existing customer entitlements preserved at their subscribed version.',
      });
      pushToast({
        type: 'success',
        title: exists ? 'Plan version saved' : 'Pricing plan created',
        message: `${updatedPlan.name} ${updatedPlan.version} published without altering legacy tenant entitlements.`,
      });
    },
    [pricingPlans, recordAudit, pushToast]
  );

  const duplicatePricingPlan = useCallback(
    (id: string) => {
      const src = pricingPlans.find((p) => p.id === id);
      if (!src) return;
      const copy: PricingPlan = {
        ...src,
        id: `PLN-${Date.now()}`,
        code: `${src.code}_COPY` as PricingPlan['code'],
        version: 'v1.0',
        status: 'Inactive',
        updatedAt: new Date().toISOString().slice(0, 10),
      };
      setPricingPlans((prev) => [copy, ...prev]);
      recordAudit({
        action: 'Duplicated Pricing Plan',
        eventType: 'Create',
        module: 'Plans & Billing',
        resource: `${copy.name} (${copy.code})`,
        details: `Cloned from ${src.name} (${src.version}).`,
      });
      pushToast({ type: 'info', title: 'Plan duplicated', message: `Created inactive draft copy of ${src.name}.` });
    },
    [pricingPlans, recordAudit, pushToast]
  );

  const saveAddon = useCallback(
    (addon: PlanAddon) => {
      setAddons((prev) => {
        const exists = prev.some((a) => a.id === addon.id);
        return exists ? prev.map((a) => (a.id === addon.id ? addon : a)) : [addon, ...prev];
      });
      recordAudit({
        action: 'Saved Plan Add-on',
        eventType: 'Edit',
        module: 'Plans & Billing',
        resource: addon.name,
        details: `Add-on pricing ${addon.price} (${addon.billingFrequency}), status ${addon.status}.`,
      });
      pushToast({ type: 'success', title: 'Add-on saved', message: `${addon.name} updated.` });
    },
    [recordAudit, pushToast]
  );

  const markInvoicePaid = useCallback(
    (invoiceId: string, ref: string, notes: string) => {
      const inv = invoices.find((i) => i.id === invoiceId);
      if (!inv) return;
      const now = new Date().toISOString().slice(0, 10);
      setInvoices((prev) =>
        prev.map((i) =>
          i.id === invoiceId
            ? { ...i, paymentStatus: 'Paid', reconciliationRef: ref, reconciliationNotes: notes, paidAt: now }
            : i
        )
      );
      const newTxn: PaymentTransaction = {
        id: `PAY-${Date.now()}`,
        transactionId: `TXN-${Math.floor(91000 + Math.random() * 8000)}`,
        companyId: inv.companyId,
        companyName: inv.companyName,
        invoiceNumber: inv.invoiceNumber,
        paymentGateway: 'NEFT/RTGS Manual',
        amount: inv.total,
        paymentDate: now,
        paymentMethod: 'Wire Transfer',
        status: 'Succeeded',
        gatewayReference: ref,
        reconciled: true,
        gatewayResponseSummary: `Manual reconciliation: ${notes || 'UTR verified'}`,
      };
      setPayments((prev) => [newTxn, ...prev]);
      recordAudit({
        action: 'Marked Invoice Paid with Reconciliation Evidence',
        eventType: 'Financial Action',
        module: 'Plans & Billing',
        resource: `${inv.invoiceNumber} (${inv.companyName})`,
        previousValue: inv.paymentStatus,
        newValue: `Paid (${ref})`,
        details: notes || 'Reconciliation reference recorded.',
      });
      pushToast({ type: 'success', title: 'Invoice reconciled', message: `${inv.invoiceNumber} marked Paid (Ref: ${ref}).` });
    },
    [invoices, recordAudit, pushToast]
  );

  const voidInvoice = useCallback(
    (invoiceId: string, reason: string) => {
      const inv = invoices.find((i) => i.id === invoiceId);
      if (!inv || inv.paymentStatus === 'Paid') return;
      setInvoices((prev) => prev.map((i) => (i.id === invoiceId ? { ...i, paymentStatus: 'Voided' } : i)));
      recordAudit({
        action: 'Voided Unpaid Invoice',
        eventType: 'Financial Action',
        module: 'Plans & Billing',
        resource: inv.invoiceNumber,
        previousValue: inv.paymentStatus,
        newValue: 'Voided',
        details: reason,
      });
      pushToast({ type: 'warning', title: 'Invoice voided', message: `${inv.invoiceNumber} has been voided.` });
    },
    [invoices, recordAudit, pushToast]
  );

  const reconcilePayment = useCallback(
    (paymentId: string) => {
      const txn = payments.find((p) => p.id === paymentId);
      if (!txn) return;
      setPayments((prev) => prev.map((p) => (p.id === paymentId ? { ...p, reconciled: true } : p)));
      recordAudit({
        action: 'Reconciled Gateway Transaction',
        eventType: 'Financial Action',
        module: 'Plans & Billing',
        resource: `${txn.transactionId} (${txn.gatewayReference})`,
        previousValue: 'Unreconciled',
        newValue: 'Reconciled',
        details: `Matched transaction for invoice ${txn.invoiceNumber}.`,
      });
      pushToast({ type: 'success', title: 'Transaction reconciled', message: `${txn.transactionId} matched with ledger.` });
    },
    [payments, recordAudit, pushToast]
  );

  const initiateRefund = useCallback(
    (paymentId: string, amount: number, reason: string) => {
      const txn = payments.find((p) => p.id === paymentId);
      if (!txn) return;
      const newRefund: RefundRecord = {
        id: `RFD-${Date.now()}`,
        refundId: `RF-2025-${Math.floor(100 + Math.random() * 899)}`,
        paymentId: txn.transactionId,
        companyId: txn.companyId,
        companyName: txn.companyName,
        requestedAmount: amount,
        approvedAmount: 0,
        reason,
        status: 'Pending Approval',
        initiatedDate: new Date().toISOString().slice(0, 10),
      };
      setRefunds((prev) => [newRefund, ...prev]);
      recordAudit({
        action: 'Initiated Refund Request',
        eventType: 'Financial Action',
        module: 'Plans & Billing',
        resource: `${newRefund.refundId} (${txn.companyName})`,
        newValue: `Pending Approval (₹${amount})`,
        details: reason,
      });
      pushToast({ type: 'info', title: 'Refund requested', message: `${newRefund.refundId} submitted for authorization.` });
    },
    [payments, recordAudit, pushToast]
  );

  const updateRefundStatus = useCallback(
    (refundId: string, status: RefundRecord['status']) => {
      const rfd = refunds.find((r) => r.id === refundId);
      if (!rfd) return;
      setRefunds((prev) =>
        prev.map((r) =>
          r.id === refundId
            ? {
                ...r,
                status,
                approvedAmount: status === 'Approved' || status === 'Processed' ? r.requestedAmount : 0,
                approvedBy: status !== 'Rejected' ? 'Vikramaditya Menon (Super Admin)' : undefined,
                completedDate: status === 'Processed' ? new Date().toISOString().slice(0, 10) : r.completedDate,
              }
            : r
        )
      );
      recordAudit({
        action: `Refund ${status}`,
        eventType: 'Financial Action',
        module: 'Plans & Billing',
        resource: `${rfd.refundId} (${rfd.companyName})`,
        previousValue: rfd.status,
        newValue: status,
        details: `Financial authorization completed for ₹${rfd.requestedAmount}.`,
      });
      pushToast({ type: status === 'Rejected' ? 'warning' : 'success', title: `Refund ${status}`, message: `${rfd.refundId} marked ${status}.` });
    },
    [refunds, recordAudit, pushToast]
  );

  const savePlatformUser = useCallback(
    (user: PlatformUser) => {
      const exists = platformUsers.some((u) => u.id === user.id);
      setPlatformUsers((prev) => (exists ? prev.map((u) => (u.id === user.id ? user : u)) : [user, ...prev]));
      recordAudit({
        action: exists ? 'Updated Platform User' : 'Created Platform User & Sent Invitation',
        eventType: exists ? 'Edit' : 'Create',
        module: 'Platform Users',
        resource: `${user.fullName} (${user.email})`,
        newValue: `${user.roleName} · ${user.status}`,
        details: `Department: ${user.department}`,
      });
      pushToast({ type: 'success', title: exists ? 'User updated' : 'Invitation sent', message: `${user.fullName} saved.` });
    },
    [platformUsers, recordAudit, pushToast]
  );

  const toggleUserLock = useCallback(
    (userId: string, lock: boolean) => {
      const target = platformUsers.find((u) => u.id === userId);
      if (!target) return;
      const nextStatus = lock ? 'Locked' : 'Active';
      setPlatformUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u)));
      recordAudit({
        action: lock ? 'Locked Platform User Account' : 'Unlocked Platform User Account',
        eventType: 'Security Event',
        module: 'Platform Users',
        resource: `${target.id} (${target.email})`,
        previousValue: target.status,
        newValue: nextStatus,
        details: `Privileged account status updated by Super Admin.`,
      });
      pushToast({ type: lock ? 'warning' : 'success', title: lock ? 'Account locked' : 'Account unlocked', message: `${target.fullName} is now ${nextStatus}.` });
    },
    [platformUsers, recordAudit, pushToast]
  );

  const toggleUserActive = useCallback(
    (userId: string, active: boolean) => {
      const target = platformUsers.find((u) => u.id === userId);
      if (!target) return;
      const activeSuperAdmins = platformUsers.filter((u) => u.roleName === 'Platform Super Admin' && u.status === 'Active');
      if (!active && target.roleName === 'Platform Super Admin' && activeSuperAdmins.length <= 1) {
        pushToast({ type: 'error', title: 'Action blocked', message: 'Cannot deactivate the last active Platform Super Admin.' });
        return;
      }
      const nextStatus = active ? 'Active' : 'Inactive';
      setPlatformUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u)));
      recordAudit({
        action: active ? 'Activated Platform User' : 'Deactivated Platform User',
        eventType: active ? 'Activate' : 'Suspend',
        module: 'Platform Users',
        resource: `${target.id} (${target.email})`,
        previousValue: target.status,
        newValue: nextStatus,
        details: 'Account lifecycle update.',
      });
      pushToast({ type: 'success', title: `User ${nextStatus}`, message: `${target.fullName} is now ${nextStatus}.` });
    },
    [platformUsers, recordAudit, pushToast]
  );

  const revokeUserSessions = useCallback(
    (userId: string) => {
      const target = platformUsers.find((u) => u.id === userId);
      if (!target) return;
      setPlatformUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, sessions: [] } : u)));
      recordAudit({
        action: 'Revoked Active Platform Sessions',
        eventType: 'Security Event',
        module: 'Platform Users',
        resource: `${target.id} (${target.email})`,
        details: 'All active browser and API sessions terminated.',
      });
      pushToast({ type: 'info', title: 'Sessions revoked', message: `Terminated active sessions for ${target.fullName}.` });
    },
    [platformUsers, recordAudit, pushToast]
  );

  const saveRole = useCallback(
    (role: RoleDefinition) => {
      const exists = roles.some((r) => r.id === role.id);
      setRoles((prev) => (exists ? prev.map((r) => (r.id === role.id ? role : r)) : [role, ...prev]));
      recordAudit({
        action: exists ? 'Updated Role Permissions' : 'Created Custom Role',
        eventType: 'Permission Change',
        module: 'Access & Roles',
        resource: `${role.name} (${role.code})`,
        details: `Permission matrix updated across ${Object.keys(role.permissions).length} modules.`,
      });
      pushToast({ type: 'success', title: exists ? 'Role updated' : 'Role created', message: `${role.name} saved.` });
    },
    [roles, recordAudit, pushToast]
  );

  const deleteCustomRole = useCallback(
    (roleId: string) => {
      const target = roles.find((r) => r.id === roleId);
      if (!target) return { ok: false, error: 'Role not found.' };
      if (target.isSystemRole) return { ok: false, error: 'System-critical roles cannot be deleted.' };
      const assignedCount = platformUsers.filter((u) => u.roleId === roleId).length;
      if (assignedCount > 0) return { ok: false, error: `${assignedCount} platform user(s) still assigned to this role.` };
      setRoles((prev) => prev.filter((r) => r.id !== roleId));
      recordAudit({
        action: 'Deleted Custom Role',
        eventType: 'Delete',
        module: 'Access & Roles',
        resource: `${target.name} (${target.code})`,
        details: 'Custom role removed.',
      });
      pushToast({ type: 'info', title: 'Role deleted', message: `${target.name} removed.` });
      return { ok: true };
    },
    [roles, platformUsers, recordAudit, pushToast]
  );

  const toggleAccessPolicy = useCallback(
    (policyId: string, enforcement: AccessPolicy['enforcement']) => {
      const target = accessPolicies.find((p) => p.id === policyId);
      if (!target) return;
      setAccessPolicies((prev) =>
        prev.map((p) =>
          p.id === policyId ? { ...p, enforcement, updatedAt: new Date().toISOString().slice(0, 10) } : p
        )
      );
      recordAudit({
        action: 'Updated Access Policy Enforcement',
        eventType: 'Configuration Change',
        module: 'Access & Roles',
        resource: target.name,
        previousValue: target.enforcement,
        newValue: enforcement,
        details: 'Security posture policy updated.',
      });
      pushToast({ type: 'success', title: 'Policy updated', message: `${target.name} set to ${enforcement}.` });
    },
    [accessPolicies, recordAudit, pushToast]
  );

  const refreshHealthSnapshot = useCallback(() => {
    setServicesHealth((prev) =>
      prev.map((svc) => ({
        ...svc,
        lastHealthCheck: new Date().toISOString(),
        responseTimeMs: Math.max(25, svc.responseTimeMs + Math.floor((Math.random() - 0.5) * 10)),
      }))
    );
    pushToast({ type: 'info', title: 'Demo telemetry refreshed', message: 'Updated simulated microservice check timestamps.' });
  }, [pushToast]);

  const saveIntegration = useCallback(
    (integration: PlatformIntegration) => {
      setIntegrations((prev) => {
        const exists = prev.some((i) => i.id === integration.id);
        return exists ? prev.map((i) => (i.id === integration.id ? integration : i)) : [integration, ...prev];
      });
      recordAudit({
        action: 'Updated Integration Configuration',
        eventType: 'Configuration Change',
        module: 'Integrations',
        resource: `${integration.name} (${integration.provider})`,
        details: `Scope: ${integration.scope}, Env: ${integration.environment}, Secret Ref: ${integration.secretReference}`,
      });
      pushToast({ type: 'success', title: 'Integration saved', message: `${integration.name} configuration updated securely.` });
    },
    [recordAudit, pushToast]
  );

  const testIntegrationConnection = useCallback(
    (id: string) => {
      const target = integrations.find((i) => i.id === id);
      if (!target) return;
      const simulatedSuccess = target.connectionStatus !== 'Disconnected';
      pushToast({
        type: simulatedSuccess ? 'success' : 'warning',
        title: simulatedSuccess ? 'Demo connection check passed' : 'Connection not configured',
        message: simulatedSuccess
          ? `Simulated handshake with ${target.provider} (${target.environment}) responded 200 OK.`
          : `${target.provider} requires credentials reference before testing.`,
      });
    },
    [integrations, pushToast]
  );

  const updateGlobalConfig = useCallback(
    (config: GlobalConfig) => {
      setGlobalConfig(config);
      recordAudit({
        action: 'Updated Global Platform Configuration',
        eventType: 'Configuration Change',
        module: 'Data & Settings',
        resource: 'Global Configuration',
        details: `Default currency: ${config.defaultCurrency}, TZ: ${config.timeZone}`,
      });
      pushToast({ type: 'success', title: 'Global settings saved', message: 'Platform configuration updated.' });
    },
    [recordAudit, pushToast]
  );

  const toggleIndustry = useCallback(
    (id: string) => {
      const target = industries.find((i) => i.id === id);
      if (!target) return;
      setIndustries((prev) => prev.map((i) => (i.id === id ? { ...i, enabled: !i.enabled } : i)));
      recordAudit({
        action: `${target.enabled ? 'Disabled' : 'Enabled'} Industry Classification`,
        eventType: 'Configuration Change',
        module: 'Data & Settings',
        resource: target.name,
        details: 'Industry classification visibility updated (single shared payroll engine unchanged).',
      });
      pushToast({ type: 'success', title: 'Industry updated', message: `${target.name} ${target.enabled ? 'disabled' : 'enabled'}.` });
    },
    [industries, recordAudit, pushToast]
  );

  const toggleFeatureFlag = useCallback(
    (id: string) => {
      const target = featureFlags.find((f) => f.id === id);
      if (!target) return;
      setFeatureFlags((prev) =>
        prev.map((f) => (f.id === id ? { ...f, enabledGlobally: !f.enabledGlobally } : f))
      );
      recordAudit({
        action: 'Toggled Feature Flag',
        eventType: 'Configuration Change',
        module: 'Data & Settings',
        resource: target.key,
        previousValue: String(target.enabledGlobally),
        newValue: String(!target.enabledGlobally),
        details: `Global rollout flag updated for ${target.name}.`,
      });
      pushToast({ type: 'info', title: 'Feature flag updated', message: `${target.name} toggled.` });
    },
    [featureFlags, recordAudit, pushToast]
  );

  const saveNotificationTemplate = useCallback(
    (tpl: NotificationTemplate) => {
      setNotificationTemplates((prev) => {
        const exists = prev.some((t) => t.id === tpl.id);
        return exists ? prev.map((t) => (t.id === tpl.id ? tpl : t)) : [tpl, ...prev];
      });
      recordAudit({
        action: 'Saved Notification Template',
        eventType: 'Configuration Change',
        module: 'Data & Settings',
        resource: `${tpl.name} (${tpl.channel})`,
        details: `Event: ${tpl.eventType}`,
      });
      pushToast({ type: 'success', title: 'Template saved', message: `${tpl.name} updated.` });
    },
    [recordAudit, pushToast]
  );

  const saveStatutoryRule = useCallback(
    (rule: StatutoryRule) => {
      setStatutoryRules((prev) => {
        const exists = prev.some((r) => r.id === rule.id);
        return exists ? prev.map((r) => (r.id === rule.id ? rule : r)) : [rule, ...prev];
      });
      recordAudit({
        action: 'Saved Statutory Rule Draft',
        eventType: 'Configuration Change',
        module: 'Data & Settings',
        resource: `${rule.name} (${rule.version})`,
        details: `Jurisdiction: ${rule.jurisdiction} (${rule.state})`,
      });
      pushToast({ type: 'success', title: 'Statutory draft saved', message: `${rule.name} (${rule.version}) stored.` });
    },
    [recordAudit, pushToast]
  );

  const transitionStatutoryRule = useCallback(
    (id: string, status: StatutoryRule['approvalStatus']) => {
      const target = statutoryRules.find((r) => r.id === id);
      if (!target) return;
      setStatutoryRules((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                approvalStatus: status,
                version: status === 'Published' ? r.version.replace('-draft', '') : r.version,
                lastReviewedDate: new Date().toISOString().slice(0, 10),
              }
            : r
        )
      );
      recordAudit({
        action: `Statutory Rule ${status}`,
        eventType: status === 'Published' ? 'Approve' : 'Configuration Change',
        module: 'Data & Settings',
        resource: `${target.name} (${target.version})`,
        previousValue: target.approvalStatus,
        newValue: status,
        details: 'Versioned statutory configuration workflow state transition.',
      });
      pushToast({ type: 'success', title: `Rule ${status}`, message: `${target.name} moved to ${status}.` });
    },
    [statutoryRules, recordAudit, pushToast]
  );

  const updateTicket = useCallback(
    (id: string, patch: Partial<SupportTicket>) => {
      const target = supportTickets.find((t) => t.id === id);
      if (!target) return;
      setSupportTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...patch, lastUpdated: new Date().toISOString() } : t))
      );
      recordAudit({
        action: 'Updated Support Ticket',
        eventType: 'Edit',
        module: 'Support & Tickets',
        resource: `${target.ticketId} (${target.companyName})`,
        details: `Updated: ${Object.keys(patch).join(', ')}`,
      });
      pushToast({ type: 'success', title: 'Ticket updated', message: `${target.ticketId} updated.` });
    },
    [supportTickets, recordAudit, pushToast]
  );

  const addTicketMessage = useCallback(
    (ticketId: string, content: string, authorType: 'Support Agent' | 'Internal Note') => {
      const target = supportTickets.find((t) => t.id === ticketId);
      if (!target) return;
      const msg = {
        id: `MSG-${Date.now()}`,
        author: 'Vikramaditya Menon (Super Admin)',
        authorType,
        timestamp: new Date().toISOString(),
        content,
      };
      setSupportTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? { ...t, messages: [...t.messages, msg], lastUpdated: new Date().toISOString() }
            : t
        )
      );
      pushToast({
        type: 'success',
        title: authorType === 'Internal Note' ? 'Internal note added' : 'Reply sent',
        message: `Updated ${target.ticketId}.`,
      });
    },
    [supportTickets, pushToast]
  );

  const createTicket = useCallback(
    (payload: { subject: string; companyId: string; category: SupportTicket['category']; priority: TicketPriority; message: string }) => {
      const comp = companies.find((c) => c.id === payload.companyId);
      const newTicket: SupportTicket = {
        id: `TKT-${Date.now()}`,
        ticketId: `PF-SUP-${2042 + supportTickets.length}`,
        subject: payload.subject,
        companyId: payload.companyId,
        companyName: comp?.displayName || payload.companyId,
        category: payload.category,
        priority: payload.priority,
        assignedAgent: 'Priya Sharma',
        createdDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        status: 'Open' as TicketStatus,
        requiresSensitiveDataAccess: false,
        attachments: [],
        messages: payload.message
          ? [
              {
                id: `M-${Date.now()}`,
                author: 'Vikramaditya Menon (Super Admin)',
                authorType: 'Support Agent',
                timestamp: new Date().toISOString(),
                content: payload.message,
              },
            ]
          : [],
      };
      setSupportTickets((prev) => [newTicket, ...prev]);
      recordAudit({
        action: 'Created Support Ticket',
        eventType: 'Create',
        module: 'Support & Tickets',
        resource: `${newTicket.ticketId} (${newTicket.companyName})`,
        details: payload.subject,
      });
      pushToast({ type: 'success', title: 'Ticket created', message: `${newTicket.ticketId} opened.` });
    },
    [companies, supportTickets.length, recordAudit, pushToast]
  );

  const saveAnnouncement = useCallback(
    (ann: Announcement) => {
      const exists = announcements.some((a) => a.id === ann.id);
      setAnnouncements((prev) => (exists ? prev.map((a) => (a.id === ann.id ? ann : a)) : [ann, ...prev]));
      recordAudit({
        action: `${ann.status} Announcement`,
        eventType: exists ? 'Edit' : 'Create',
        module: 'Announcements',
        resource: ann.title,
        newValue: ann.status,
        details: `Audience: ${ann.targetCompanies}`,
      });
      pushToast({ type: 'success', title: 'Announcement saved', message: `"${ann.title}" is ${ann.status}.` });
    },
    [announcements, recordAudit, pushToast]
  );

  const deleteDraftAnnouncement = useCallback(
    (id: string) => {
      const target = announcements.find((a) => a.id === id);
      if (!target || target.status !== 'Draft') return;
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      recordAudit({
        action: 'Deleted Draft Announcement',
        eventType: 'Delete',
        module: 'Announcements',
        resource: target.title,
        details: 'Unpublished draft removed.',
      });
      pushToast({ type: 'info', title: 'Draft deleted', message: `"${target.title}" removed.` });
    },
    [announcements, recordAudit, pushToast]
  );

  const saveHelpDoc = useCallback(
    (doc: HelpDocArticle) => {
      const exists = helpDocs.some((d) => d.id === doc.id);
      setHelpDocs((prev) => (exists ? prev.map((d) => (d.id === doc.id ? doc : d)) : [doc, ...prev]));
      recordAudit({
        action: exists ? 'Updated Documentation Article' : 'Created Documentation Article',
        eventType: exists ? 'Edit' : 'Create',
        module: 'Help & Docs',
        resource: doc.title,
        newValue: doc.status,
        details: `Category: ${doc.category}`,
      });
      pushToast({ type: 'success', title: 'Article saved', message: `${doc.title} (${doc.status}).` });
    },
    [helpDocs, recordAudit, pushToast]
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const value: PlatformContextValue = {
    sidebarCollapsed,
    setSidebarCollapsed,
    dateRange,
    setDateRange,
    toasts,
    pushToast,
    dismissToast,
    companies,
    subscriptions,
    pricingPlans,
    addons,
    invoices,
    payments,
    refunds,
    platformUsers,
    roles,
    accessPolicies,
    servicesHealth,
    serviceLogs,
    integrations,
    globalConfig,
    industries,
    featureFlags,
    notificationTemplates,
    statutoryRules,
    dataRetention,
    supportTickets,
    announcements,
    helpDocs,
    auditEvents,
    notifications,
    dashboardMetrics,
    recordAudit,
    createCompany,
    updateCompany,
    setCompanyStatus,
    softDeleteCompany,
    updateSubscription,
    savePricingPlan,
    duplicatePricingPlan,
    saveAddon,
    markInvoicePaid,
    voidInvoice,
    reconcilePayment,
    initiateRefund,
    updateRefundStatus,
    savePlatformUser,
    toggleUserLock,
    toggleUserActive,
    revokeUserSessions,
    saveRole,
    deleteCustomRole,
    toggleAccessPolicy,
    refreshHealthSnapshot,
    saveIntegration,
    testIntegrationConnection,
    updateGlobalConfig,
    toggleIndustry,
    toggleFeatureFlag,
    saveNotificationTemplate,
    saveStatutoryRule,
    transitionStatutoryRule,
    updateTicket,
    addTicketMessage,
    createTicket,
    saveAnnouncement,
    deleteDraftAnnouncement,
    saveHelpDoc,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
  };

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
};

export function usePlatformStore(): PlatformContextValue {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error('usePlatformStore must be used inside PlatformProvider');
  return ctx;
}

function bumpMinorVersion(ver: string): string {
  const match = ver.match(/^v(\d+)\.(\d+)$/);
  if (!match) return `${ver}.1`;
  return `v${match[1]}.${Number(match[2]) + 1}`;
}
