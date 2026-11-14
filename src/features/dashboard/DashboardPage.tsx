import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Circle,
  Clock,
  Crown,
  Download,
  IndianRupee,
  Layers,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Ticket,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { usePlatformStore } from '../../services/platformStore';
import { KPIStatCard } from '../../components/common/KPIStatCard';
import { ChartCard } from '../../components/common/ChartCard';
import { DateRangePicker } from '../../components/common/DateRangePicker';
import { DetailDrawer } from '../../components/common/DetailDrawer';
import { exportToCSV, formatDateTime, formatINRCrore, formatNumberIN } from '../../utils/format';
import { IndustryCategory, OnboardingStage, PlanName, RegionCategory } from '../../types';

const INDUSTRY_COLORS: Record<string, string> = {
  'IT & Software': '#478BFA',
  'BPO / Call Centre': '#7050F5',
  Manufacturing: '#10B981',
  Construction: '#F59E0B',
  'Retail & Hospitality': '#EC4899',
  Healthcare: '#0EA5E9',
  Logistics: '#14B8A6',
  'Other Industries': '#CBD5E1',
};

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    companies,
    subscriptions,
    servicesHealth,
    auditEvents,
    dateRange,
    setDateRange,
    dashboardMetrics,
    pushToast,
  } = usePlatformStore();

  const [trendMetric, setTrendMetric] = useState<'amountCr' | 'employees' | 'companies'>('amountCr');
  const [refreshing, setRefreshing] = useState(false);
  const [onboardingFilter, setOnboardingFilter] = useState<'This month' | 'All time'>('All time');
  const [analyticsDrawer, setAnalyticsDrawer] = useState<'employees' | 'payroll' | null>(null);

  const activeCompanies = useMemo(
    () => companies.filter((c) => c.accountStatus !== 'Deactivated'),
    [companies]
  );

  // Industry distribution derived directly from companies
  const industryData = useMemo(() => {
    const counts: Record<string, number> = {};
    activeCompanies.forEach((c) => {
      counts[c.industry] = (counts[c.industry] || 0) + 1;
    });
    const total = activeCompanies.length || 1;
    return Object.entries(counts)
      .map(([name, count]) => ({
        name: name as IndustryCategory,
        count,
        percent: Number(((count / total) * 100).toFixed(1)),
        color: INDUSTRY_COLORS[name] || '#94A3B8',
      }))
      .sort((a, b) => b.count - a.count);
  }, [activeCompanies]);

  // Subscription plan distribution derived from subscriptions
  const planDistribution = useMemo(() => {
    const plans: PlanName[] = ['Enterprise', 'Business', 'Growth', 'Essential'];
    const total = subscriptions.length || 1;
    return plans.map((plan) => {
      const matching = subscriptions.filter((s) => s.planName === plan);
      const activeCount = matching.filter((s) => s.status === 'Active' || s.status === 'Expiring Soon').length;
      return {
        plan,
        count: matching.length,
        activeCount,
        percent: Number(((matching.length / total) * 100).toFixed(1)),
      };
    });
  }, [subscriptions]);

  // Onboarding funnel derived from companies
  const onboardingFunnel = useMemo(() => {
    const pool =
      onboardingFilter === 'This month'
        ? activeCompanies.filter((c) => c.registrationDate >= '2025-01-01')
        : activeCompanies;
    const stages: OnboardingStage[] = ['Sign Up', 'Verification', 'Configuration', 'Go Live'];
    // Cumulative funnel counts (companies that reached at least that stage)
    const stageIdx = (s: OnboardingStage) => stages.indexOf(s);
    const counts = stages.map((st, idx) => ({
      stage: st,
      count: pool.filter((c) => stageIdx(c.onboardingStage) >= idx).length,
      inStageCount: pool.filter((c) => c.onboardingStage === st).length,
    }));
    const pendingVerification = activeCompanies.filter(
      (c) => c.verificationStatus === 'Pending Review' || c.verificationStatus === 'Incomplete'
    ).length;
    const avgDays =
      activeCompanies.length > 0
        ? (
            activeCompanies.reduce((sum, c) => sum + c.onboardingDays, 0) / activeCompanies.length
          ).toFixed(1)
        : '0.0';
    const conversionRate =
      pool.length > 0
        ? Math.round((counts[3].count / Math.max(1, counts[0].count)) * 100)
        : 0;
    return { counts, pendingVerification, avgDays, conversionRate };
  }, [activeCompanies, onboardingFilter]);

  // Platform Health (first 8 core services per Part 4 D.2)
  const coreDashboardServices = useMemo(() => {
    const targetNames = [
      'Authentication Service',
      'Company Service',
      'Employee Service',
      'Attendance Service',
      'Payroll Service',
      'Compliance Service',
      'Reporting Service',
      'Integration Service',
    ];
    return servicesHealth.filter((s) => targetNames.includes(s.name));
  }, [servicesHealth]);

  const overallUptime = useMemo(() => {
    if (servicesHealth.length === 0) return '99.95';
    const avg =
      servicesHealth.reduce((sum, s) => sum + s.uptimePercent, 0) / servicesHealth.length;
    return avg.toFixed(2);
  }, [servicesHealth]);

  // Region distribution derived from companies
  const regionDistribution = useMemo(() => {
    const regions: { key: RegionCategory; label: string }[] = [
      { key: 'India', label: 'India (Primary)' },
      { key: 'Middle East', label: 'Middle East' },
      { key: 'APAC', label: 'APAC' },
      { key: 'Other', label: 'Other Regions' },
    ];
    const total = activeCompanies.length || 1;
    return regions.map((r) => {
      const count = activeCompanies.filter((c) => c.region === r.key).length;
      return {
        ...r,
        count,
        percent: Number(((count / total) * 100).toFixed(1)),
      };
    });
  }, [activeCompanies]);

  // Top Growing Companies
  const topGrowing = useMemo(() => {
    return [...activeCompanies]
      .sort((a, b) => b.growthMoM - a.growthMoM)
      .slice(0, 4);
  }, [activeCompanies]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      pushToast({
        type: 'info',
        title: 'Dashboard refreshed',
        message: 'Metrics synchronized with live demo repository.',
      });
    }, 350);
  };

  const handleExportDashboard = () => {
    exportToCSV(
      `payfuse-dashboard-summary-${dateRange.preset}.csv`,
      activeCompanies.map((c) => ({
        CompanyID: c.id,
        CompanyName: c.displayName,
        Industry: c.industry,
        Region: c.region,
        Employees: c.employeeCount,
        MonthlyPayrollINR: c.monthlyPayrollINR,
        Plan: c.subscriptionPlan,
        Status: c.accountStatus,
        MoMGrowthPercent: c.growthMoM,
      }))
    );
    pushToast({
      type: 'success',
      title: 'Dashboard exported',
      message: 'Downloaded CSV snapshot for selected date range.',
    });
  };

  const planBadgeIcon = (plan: PlanName) => {
    if (plan === 'Enterprise') return <Crown className="w-4 h-4 text-amber-500" />;
    if (plan === 'Business') return <ShieldCheck className="w-4 h-4 text-[#7050F5]" />;
    if (plan === 'Growth') return <TrendingUp className="w-4 h-4 text-[#478BFA]" />;
    return <Layers className="w-4 h-4 text-emerald-600" />;
  };

  const planBgClass = (plan: PlanName) => {
    if (plan === 'Enterprise') return 'bg-amber-50';
    if (plan === 'Business') return 'bg-[#EFEAFF]';
    if (plan === 'Growth') return 'bg-blue-50';
    return 'bg-emerald-50';
  };

  return (
    <div className="space-y-5">
      {/* A. Welcome Header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-[24px] sm:text-[26px] font-bold text-[#0F172A] tracking-tight">
              Good Morning, Super Admin
            </h1>
            <span className="text-xs font-medium text-[#64748B] px-2.5 py-0.5 rounded-md bg-white border border-[#E8EBF4]">
              Sample Demo Dataset
            </span>
          </div>
          <p className="text-sm text-[#64748B] mt-0.5">
            Here&apos;s what&apos;s happening across your payroll platform today.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <button
            type="button"
            onClick={handleRefresh}
            aria-label="Refresh dashboard data"
            className="h-9 px-3 bg-white border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0F172A] hover:bg-slate-50 inline-flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#64748B] ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            type="button"
            onClick={handleExportDashboard}
            className="h-9 px-3 bg-white border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0F172A] hover:bg-slate-50 inline-flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#64748B]" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* B. Row 1 — Five KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <KPIStatCard
          loading={refreshing}
          label="Total Companies"
          value={formatNumberIN(dashboardMetrics.totalCompanies)}
          icon={<Building2 className="w-5 h-5 text-[#7050F5]" />}
          iconBgClass="bg-[#EFEAFF]"
          deltaText="+12.4%"
          deltaDirection="up"
          deltaPositive
          subText="vs. previous period"
          onClick={() => navigate('/companies')}
        />
        <KPIStatCard
          loading={refreshing}
          label="Total Employees"
          value={formatNumberIN(dashboardMetrics.totalEmployees)}
          icon={<Users className="w-5 h-5 text-[#478BFA]" />}
          iconBgClass="bg-[#EAF2FF]"
          deltaText="+8.7%"
          deltaDirection="up"
          deltaPositive
          subText={`${formatNumberIN(dashboardMetrics.activeEmployees)} active`}
          onClick={() => setAnalyticsDrawer('employees')}
        />
        <KPIStatCard
          loading={refreshing}
          label="Payroll Processed"
          value={formatINRCrore(dashboardMetrics.payrollProcessedINR)}
          icon={<IndianRupee className="w-5 h-5 text-[#7050F5]" />}
          iconBgClass="bg-[#EFEAFF]"
          deltaText="+11.9%"
          deltaDirection="up"
          deltaPositive
          subText={`${dashboardMetrics.companiesProcessingPayroll} companies`}
          onClick={() => setAnalyticsDrawer('payroll')}
        />
        <KPIStatCard
          loading={refreshing}
          label="Active Subscriptions"
          value={formatNumberIN(dashboardMetrics.activeSubscriptions)}
          icon={<Layers className="w-5 h-5 text-[#7050F5]" />}
          iconBgClass="bg-[#EFEAFF]"
          deltaText="+10.2%"
          deltaDirection="up"
          deltaPositive
          subText={`(${dashboardMetrics.activeSubscriptionPercent}% of total)`}
          onClick={() => navigate('/subscriptions')}
        />
        <KPIStatCard
          loading={refreshing}
          label="Open Support Tickets"
          value={formatNumberIN(dashboardMetrics.openTickets)}
          icon={<Ticket className="w-5 h-5 text-rose-500" />}
          iconBgClass="bg-rose-50"
          deltaText="-14.3%"
          deltaDirection="down"
          deltaPositive
          subText={`${dashboardMetrics.criticalTickets} critical`}
          onClick={() => navigate('/support-tickets')}
        />
      </div>

      {/* C. Row 2 — Three-Column Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Widget 1: Payroll Volume Trend */}
        <ChartCard
          className="lg:col-span-5"
          title="Payroll Volume Trend"
          subtitle="Total payroll processed across all companies"
          action={
            <div className="inline-flex items-center p-1 rounded-xl bg-[#F4F5FA] border border-[#E8EBF4]">
              {(
                [
                  { key: 'amountCr', label: 'Amount (₹)' },
                  { key: 'employees', label: 'Employees' },
                  { key: 'companies', label: 'Companies' },
                ] as const
              ).map((seg) => (
                <button
                  key={seg.key}
                  type="button"
                  onClick={() => setTrendMetric(seg.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    trendMetric === seg.key
                      ? 'bg-[#7050F5] text-white shadow-sm'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  {seg.label}
                </button>
              ))}
            </div>
          }
        >
          <div className="h-[225px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dashboardMetrics.trendSeries}
                margin={{ top: 10, right: 10, left: -12, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="payfuseAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7050F5" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#7050F5" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F8" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    trendMetric === 'amountCr' ? `${v} Cr` : formatNumberIN(Number(v))
                  }
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const pt = payload[0].payload;
                    return (
                      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-lg px-3.5 py-2.5 text-xs">
                        <p className="font-semibold text-[#0F172A] mb-1">{pt.month}</p>
                        <p className="text-[#7050F5] font-semibold tabular-nums">
                          Payroll: ₹ {pt.amountCr} Cr
                        </p>
                        <p className="text-[#64748B] tabular-nums">
                          Employees: {formatNumberIN(pt.employees)}
                        </p>
                        <p className="text-[#64748B] tabular-nums">
                          Companies: {pt.companies}
                        </p>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={trendMetric}
                  stroke="#7050F5"
                  strokeWidth={2.5}
                  fill="url(#payfuseAreaGrad)"
                  dot={{ r: 3.5, fill: '#FFFFFF', stroke: '#7050F5', strokeWidth: 2 }}
                  activeDot={{ r: 5, fill: '#7050F5', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Widget 2: Companies by Industry */}
        <ChartCard
          className="lg:col-span-4"
          title="Companies by Industry"
          subtitle="Click a category to filter companies"
        >
          <div className="flex flex-col sm:flex-row items-center gap-4 h-full">
            <div className="relative w-[170px] h-[170px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={industryData}
                    dataKey="count"
                    nameKey="name"
                    innerRadius={52}
                    outerRadius={76}
                    paddingAngle={2}
                    onClick={(entry) =>
                      navigate(`/companies?industry=${encodeURIComponent(String(entry?.name ?? ''))}`)
                    }
                    className="cursor-pointer focus:outline-none"
                  >
                    {industryData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [`${val ?? 0} companies`, String(name ?? '')]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-bold text-[#0F172A] tabular-nums">
                  {activeCompanies.length}
                </span>
                <span className="text-[11px] text-[#64748B]">Companies</span>
              </div>
            </div>

            <div className="flex-1 w-full space-y-1.5 overflow-y-auto max-h-[205px] pr-1">
              {industryData.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() =>
                    navigate(`/companies?industry=${encodeURIComponent(item.name)}`)
                  }
                  className="w-full flex items-center justify-between gap-2 px-2 py-1 rounded-lg hover:bg-slate-50 text-xs transition-colors"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[#0F172A] truncate">{item.name}</span>
                  </span>
                  <span className="text-[#64748B] font-semibold tabular-nums shrink-0">
                    {item.count} · {item.percent}%
                  </span>
                </button>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* Widget 3: Subscription Overview */}
        <ChartCard
          className="lg:col-span-3"
          title="Subscription Overview"
          subtitle="Active plans distribution"
        >
          <div className="space-y-2.5">
            {planDistribution.map((item) => (
              <button
                key={item.plan}
                type="button"
                onClick={() => navigate(`/subscriptions?plan=${encodeURIComponent(item.plan)}`)}
                className="w-full text-left p-2.5 rounded-xl border border-[#EEF1F8] hover:border-[#7050F5]/40 hover:bg-[#FAF9FF] transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${planBgClass(
                        item.plan
                      )}`}
                    >
                      {planBadgeIcon(item.plan)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-[#0F172A] truncate">
                        {item.plan}
                      </p>
                      <p className="text-[11px] text-[#64748B] tabular-nums">
                        {item.count} companies · {item.activeCount} active
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#0F172A] tabular-nums shrink-0">
                    {item.percent}%
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-[#EEF1F8] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#7050F5]"
                    style={{ width: `${Math.max(6, item.percent)}%` }}
                  />
                </div>
              </button>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* D. Row 3 — Onboarding, Platform Health, Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Widget 1: Company Onboarding */}
        <ChartCard
          className="lg:col-span-4"
          title="Company Onboarding"
          subtitle={`Conversion: ${onboardingFunnel.conversionRate}% · Avg ${onboardingFunnel.avgDays} days`}
          action={
            <select
              aria-label="Onboarding timeframe"
              value={onboardingFilter}
              onChange={(e) => setOnboardingFilter(e.target.value as 'This month' | 'All time')}
              className="h-8 px-2.5 text-xs font-medium border border-[#E2E8F0] rounded-lg bg-white text-[#0F172A]"
            >
              <option value="All time">All time</option>
              <option value="This month">This month</option>
            </select>
          }
        >
          <div className="space-y-3">
            {onboardingFunnel.counts.map((st, idx) => {
              const icon =
                idx < 2 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : idx === 2 ? (
                  <Clock className="w-4 h-4 text-[#7050F5] shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                );
              return (
                <button
                  key={st.stage}
                  type="button"
                  onClick={() =>
                    navigate(`/companies?stage=${encodeURIComponent(st.stage)}`)
                  }
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-[#E8EBF4] transition-colors text-sm"
                >
                  <span className="flex items-center gap-2.5">
                    {icon}
                    <span className="font-medium text-[#0F172A]">{st.stage}</span>
                  </span>
                  <span className="font-bold text-[#0F172A] tabular-nums">{st.count}</span>
                </button>
              );
            })}

            <div className="pt-2 border-t border-[#E8EBF4] flex items-center justify-between text-xs text-[#64748B]">
              <span>
                Pending verification:{' '}
                <strong className="text-amber-700 tabular-nums">
                  {onboardingFunnel.pendingVerification}
                </strong>
              </span>
              <button
                type="button"
                onClick={() => navigate('/companies?status=Pending+Verification')}
                className="text-[#7050F5] font-medium hover:underline"
              >
                Review Queue →
              </button>
            </div>
          </div>
        </ChartCard>

        {/* Widget 2: Platform Health */}
        <ChartCard
          className="lg:col-span-4"
          title="Platform Health"
          subtitle="Demo telemetry — awaiting monitoring API"
          action={
            <button
              type="button"
              onClick={() => navigate('/usage-health')}
              className="text-xs font-medium text-[#7050F5] hover:underline inline-flex items-center gap-1"
            >
              <span>Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          }
        >
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Circular Uptime Ring */}
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#EEF1F8"
                  strokeWidth="9"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={`${Number(overallUptime) * 2.638} 264`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-base font-bold text-[#0F172A] tabular-nums">
                  {overallUptime}%
                </span>
                <span className="text-[11px] text-[#64748B]">Demo Uptime</span>
              </div>
            </div>

            <div className="flex-1 w-full space-y-1.5">
              {coreDashboardServices.map((svc) => (
                <button
                  key={svc.id}
                  type="button"
                  onClick={() => navigate(`/usage-health/${svc.id}`)}
                  className="w-full flex items-center justify-between gap-2 text-xs py-0.5 hover:bg-slate-50 rounded px-1 transition-colors"
                >
                  <span className="flex items-center gap-1.5 min-w-0">
                    {svc.status === 'Operational' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    )}
                    <span className="text-[#0F172A] truncate">{svc.name}</span>
                  </span>
                  <span
                    className={`font-medium shrink-0 ${
                      svc.status === 'Operational' ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  >
                    {svc.status}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* Widget 3: Recent Activities */}
        <ChartCard
          className="lg:col-span-4"
          title="Recent Activities"
          action={
            <button
              type="button"
              onClick={() => navigate('/audit-security')}
              className="text-xs font-medium text-[#7050F5] hover:underline inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          }
        >
          <div className="space-y-2.5">
            {auditEvents.slice(0, 4).map((evt) => (
              <button
                key={evt.id}
                type="button"
                onClick={() => navigate('/audit-security')}
                className="w-full flex items-start justify-between gap-3 p-2 rounded-xl hover:bg-[#F9FAFD] text-left transition-colors"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#F1EFFF] text-[#7050F5] flex items-center justify-center shrink-0 mt-0.5">
                    {evt.module === 'Companies' ? (
                      <Building2 className="w-4 h-4" />
                    ) : evt.module === 'Plans & Billing' ? (
                      <IndianRupee className="w-4 h-4" />
                    ) : evt.module === 'Subscriptions' ? (
                      <Layers className="w-4 h-4" />
                    ) : (
                      <Activity className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[#0F172A] truncate">
                      {evt.action}
                    </p>
                    <p className="text-xs text-[#64748B] truncate">{evt.resource}</p>
                  </div>
                </div>
                <span className="text-[11px] text-[#94A3B8] whitespace-nowrap shrink-0 tabular-nums">
                  {formatDateTime(evt.timestamp).split(',')[0]}
                </span>
              </button>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* E. Row 4 — Companies by Region & Top Growing Companies */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Widget 1: Companies by Region */}
        <ChartCard
          className="lg:col-span-6"
          title="Companies by Region"
          subtitle="Geographic tenant distribution"
        >
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Stylized clean regional map vector */}
            <div className="w-48 h-32 rounded-xl bg-[#F6F7FB] border border-[#EEF1F8] flex items-center justify-center shrink-0 p-3">
              <svg viewBox="0 0 220 120" className="w-full h-full" aria-hidden="true">
                <path
                  d="M25,35 Q45,20 70,32 L85,48 Q75,70 50,78 L30,65 Z"
                  fill="#E2E8F0"
                />
                <path
                  d="M95,28 Q125,22 145,42 L135,62 Q115,65 98,52 Z"
                  fill="#A594F9"
                />
                <path
                  d="M138,48 Q162,38 188,52 L176,84 Q152,88 136,70 Z"
                  fill="#7050F5"
                />
                <path
                  d="M175,85 Q195,82 205,96 L192,110 Q176,105 175,85 Z"
                  fill="#C4B5FD"
                />
                <circle cx="155" cy="64" r="4" fill="#FFFFFF" stroke="#7050F5" strokeWidth="2" />
              </svg>
            </div>

            <div className="flex-1 w-full space-y-3">
              {regionDistribution.map((reg) => (
                <button
                  key={reg.key}
                  type="button"
                  onClick={() => navigate(`/companies?region=${encodeURIComponent(reg.key)}`)}
                  className="w-full flex items-center gap-3 text-xs hover:bg-slate-50 px-2 py-1 rounded-lg transition-colors"
                >
                  <span className="w-28 text-left font-medium text-[#0F172A] truncate">
                    {reg.label}
                  </span>
                  <span className="w-8 text-right font-bold text-[#0F172A] tabular-nums">
                    {reg.count}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-[#EEF1F8] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#7050F5]"
                      style={{ width: `${Math.max(4, reg.percent)}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-[#64748B] font-medium tabular-nums">
                    {reg.percent}%
                  </span>
                </button>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* Widget 2: Top Growing Companies */}
        <ChartCard
          className="lg:col-span-6"
          title="Top Growing Companies"
          subtitle="(by employee count & MoM headcount growth)"
          action={
            <button
              type="button"
              onClick={() => navigate('/companies')}
              className="text-xs font-medium text-[#7050F5] hover:underline inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-[#E8EBF4] text-xs text-[#64748B] font-semibold">
                  <th className="py-2 pr-3">Company</th>
                  <th className="py-2 px-3">Industry</th>
                  <th className="py-2 px-3 text-right">Employees</th>
                  <th className="py-2 px-3 text-right">Growth (MoM)</th>
                  <th className="py-2 pl-3">Plan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F3F9]">
                {topGrowing.map((comp) => (
                  <tr
                    key={comp.id}
                    onClick={() => navigate(`/companies/${comp.id}`)}
                    className="hover:bg-[#F9FAFD] cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 pr-3 font-semibold text-[#0F172A] whitespace-nowrap">
                      {comp.displayName}
                    </td>
                    <td className="py-2.5 px-3 text-[#64748B] whitespace-nowrap">
                      {comp.industry}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-[#0F172A] tabular-nums">
                      {formatNumberIN(comp.employeeCount)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-emerald-600 tabular-nums whitespace-nowrap">
                      ↑ +{comp.growthMoM}%
                    </td>
                    <td className="py-2.5 pl-3 text-xs font-medium text-[#7050F5] whitespace-nowrap">
                      {comp.subscriptionPlan}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>

      {/* Aggregated Employee & Payroll Analytics Drawers (never exposes PII) */}
      <DetailDrawer
        open={analyticsDrawer !== null}
        onClose={() => setAnalyticsDrawer(null)}
        title={
          analyticsDrawer === 'employees'
            ? 'Aggregated Workforce Analytics'
            : 'Aggregated Payroll Volume Analytics'
        }
        subtitle="Tenant-level aggregates only · Individual employee PII is strictly masked in Super Admin"
      >
        {analyticsDrawer === 'employees' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E8EBF4]">
                <p className="text-xs text-[#64748B]">Total Enrolled Seats</p>
                <p className="text-xl font-bold text-[#0F172A] tabular-nums mt-1">
                  {formatNumberIN(dashboardMetrics.totalEmployees)}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E8EBF4]">
                <p className="text-xs text-[#64748B]">Active Employees</p>
                <p className="text-xl font-bold text-emerald-600 tabular-nums mt-1">
                  {formatNumberIN(dashboardMetrics.activeEmployees)}
                </p>
              </div>
            </div>
            <h4 className="text-sm font-semibold text-[#0F172A] pt-2">Headcount by Industry</h4>
            <div className="space-y-2.5">
              {industryData.map((ind) => {
                const empSum = activeCompanies
                  .filter((c) => c.industry === ind.name)
                  .reduce((s, c) => s + c.employeeCount, 0);
                return (
                  <div
                    key={ind.name}
                    className="flex items-center justify-between text-xs py-2 border-b border-[#F1F3F9]"
                  >
                    <span className="font-medium text-[#0F172A]">{ind.name}</span>
                    <span className="font-semibold text-[#0F172A] tabular-nums">
                      {formatNumberIN(empSum)} employees
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {analyticsDrawer === 'payroll' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#F4F2FF] border border-[#7050F5]/20">
              <p className="text-xs text-[#5B3CE6] font-medium">
                Period Payroll Volume ({dateRange.label})
              </p>
              <p className="text-2xl font-bold text-[#0F172A] tabular-nums mt-1">
                {formatINRCrore(dashboardMetrics.payrollProcessedINR)}
              </p>
              <p className="text-xs text-[#64748B] mt-1">
                Processed via Unified PayFuse Payroll Engine across{' '}
                {dashboardMetrics.companiesProcessingPayroll} active companies
              </p>
            </div>
            <h4 className="text-sm font-semibold text-[#0F172A] pt-2">
              Top Tenants by Monthly Payroll Volume
            </h4>
            <div className="space-y-2">
              {[...activeCompanies]
                .sort((a, b) => b.monthlyPayrollINR - a.monthlyPayrollINR)
                .slice(0, 8)
                .map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between text-xs py-2 border-b border-[#F1F3F9]"
                  >
                    <div>
                      <p className="font-semibold text-[#0F172A]">{c.displayName}</p>
                      <p className="text-[#64748B]">{c.industry}</p>
                    </div>
                    <span className="font-semibold text-[#0F172A] tabular-nums">
                      {formatINRCrore(c.monthlyPayrollINR)}
                    </span>
                  </div>
                ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setAnalyticsDrawer(null);
                navigate('/billing?tab=analytics');
              }}
              className="w-full h-9 rounded-xl bg-[#7050F5] hover:bg-[#5E3DE6] text-white text-xs font-medium inline-flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Open Full Revenue & Billing Analytics</span>
            </button>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
};
