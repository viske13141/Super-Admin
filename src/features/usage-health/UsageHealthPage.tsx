import React, { useMemo } from 'react';
import {
  Activity,
  Cpu,
  Database,
  FileText,
  HardDrive,
  RefreshCw,
  Server,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlatformStore } from '../../services/platformStore';
import { PageHeader } from '../../components/common/PageHeader';
import { KPIStatCard } from '../../components/common/KPIStatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDateTime, formatNumberIN } from '../../utils/format';

export const UsageHealthPage: React.FC = () => {
  const navigate = useNavigate();
  const { servicesHealth, refreshHealthSnapshot } = usePlatformStore();

  const summary = useMemo(() => {
    const avgUptime = (
      servicesHealth.reduce((s, x) => s + x.uptimePercent, 0) / Math.max(1, servicesHealth.length)
    ).toFixed(2);
    const totalReq = servicesHealth.reduce((s, x) => s + x.requestsLastHour, 0);
    const avgLatency = Math.round(
      servicesHealth.reduce((s, x) => s + x.responseTimeMs, 0) / Math.max(1, servicesHealth.length)
    );
    const avgErr = (
      servicesHealth.reduce((s, x) => s + x.errorRatePercent, 0) / Math.max(1, servicesHealth.length)
    ).toFixed(2);
    return { avgUptime, totalReq, avgLatency, avgErr };
  }, [servicesHealth]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Usage & Health"
        subtitle="Platform operations monitoring across PayFuse microservices (demo telemetry until connected to Prometheus/Datadog APIs)."
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Usage & Health' }]}
        actions={
          <button
            type="button"
            onClick={refreshHealthSnapshot}
            className="h-9 px-3.5 bg-white border border-[#E2E8F0] rounded-lg text-sm font-medium text-[#0F172A] hover:bg-slate-50 inline-flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Refresh Demo Telemetry</span>
          </button>
        }
      />

      <div className="px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-800">
        <strong>Demo Monitoring Notice:</strong> Status indicators and latency figures below are simulated demonstration metrics. Read-only observability mode is enforced; no artificial restart or production intervention actions are exposed.
      </div>

      {/* 8 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPIStatCard label="Overall Uptime (Demo)" value={`${summary.avgUptime}%`} icon={<Activity className="w-5 h-5 text-emerald-600" />} iconBgClass="bg-emerald-50" />
        <KPIStatCard label="API Requests (1h)" value={formatNumberIN(summary.totalReq)} icon={<Zap className="w-5 h-5 text-[#7050F5]" />} iconBgClass="bg-[#EFEAFF]" />
        <KPIStatCard label="Avg Response Time" value={`${summary.avgLatency} ms`} icon={<Cpu className="w-5 h-5 text-[#478BFA]" />} iconBgClass="bg-[#EAF2FF]" />
        <KPIStatCard label="Error Rate" value={`${summary.avgErr}%`} icon={<Activity className="w-5 h-5 text-amber-600" />} iconBgClass="bg-amber-50" />
        <KPIStatCard label="Active Background Jobs" value="48" icon={<Server className="w-5 h-5 text-[#7050F5]" />} iconBgClass="bg-[#EFEAFF]" />
        <KPIStatCard label="Failed Jobs (24h)" value="2" icon={<Server className="w-5 h-5 text-rose-600" />} iconBgClass="bg-rose-50" />
        <KPIStatCard label="Database Utilisation" value="42%" icon={<Database className="w-5 h-5 text-indigo-600" />} iconBgClass="bg-indigo-50" />
        <KPIStatCard label="Storage Utilisation" value="3.16 TB" icon={<HardDrive className="w-5 h-5 text-teal-600" />} iconBgClass="bg-teal-50" />
      </div>

      {/* 12 Microservices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {servicesHealth.map((svc) => (
          <div
            key={svc.id}
            onClick={() => navigate(`/usage-health/${svc.id}`)}
            className="bg-white rounded-2xl border border-[#E8EBF4] p-5 hover:border-[#7050F5]/40 hover:shadow-[0_4px_14px_rgba(112,80,245,0.06)] cursor-pointer transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">{svc.name}</h3>
                <p className="text-[11px] font-mono-code text-[#64748B] mt-0.5">
                  {svc.version} · Deployed {svc.lastDeployment}
                </p>
              </div>
              <StatusBadge status={svc.status} />
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#F1F3F9] text-xs">
              <div>
                <span className="text-[#64748B] block">Latency</span>
                <strong className="tabular-nums text-[#0F172A]">{svc.responseTimeMs} ms</strong>
              </div>
              <div>
                <span className="text-[#64748B] block">Requests/hr</span>
                <strong className="tabular-nums text-[#0F172A]">{formatNumberIN(svc.requestsLastHour)}</strong>
              </div>
              <div>
                <span className="text-[#64748B] block">Error Rate</span>
                <strong className={`tabular-nums ${svc.errorRatePercent > 0.5 ? 'text-amber-600' : 'text-[#0F172A]'}`}>
                  {svc.errorRatePercent}%
                </strong>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-[#F1F3F9] flex items-center justify-between text-[11px] text-[#64748B]">
              <span className="tabular-nums">Checked {formatDateTime(svc.lastHealthCheck)}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/service-logs?service=${encodeURIComponent(svc.name)}`);
                }}
                className="text-[#7050F5] font-medium hover:underline inline-flex items-center gap-1"
              >
                <FileText className="w-3 h-3" />
                <span>View Logs</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
