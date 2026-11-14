import React, { useMemo, useState } from 'react';
import { FileText, RefreshCw } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useNavigate, useParams } from 'react-router-dom';
import { usePlatformStore } from '../../services/platformStore';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ChartCard } from '../../components/common/ChartCard';
import { ExportMenu } from '../../components/common/ExportMenu';
import { exportToCSV, formatDateTime, formatNumberIN } from '../../utils/format';

type ServiceTab = 'overview' | 'metrics' | 'errors' | 'dependencies' | 'deployments' | 'checks';

export const ServiceDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { servicesHealth, refreshHealthSnapshot, pushToast } = usePlatformStore();
  const svc = servicesHealth.find((s) => s.id === id);

  const [tab, setTab] = useState<ServiceTab>('overview');
  const [range, setRange] = useState<'1h' | '6h' | '24h'>('6h');

  const metricPoints = useMemo(() => {
    if (!svc) return [];
    const labels = range === '1h' ? ['09:10', '09:20', '09:30', '09:40', '09:50', '10:00'] : range === '6h' ? ['04:00', '05:00', '06:00', '07:00', '08:00', '09:00'] : ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];
    return labels.map((t, idx) => ({
      time: t,
      latency: Math.max(20, svc.responseTimeMs + ((idx % 3) - 1) * 9),
      rpm: Math.round((svc.requestsLastHour / 60) * (0.85 + idx * 0.05)),
      errorRate: Number((svc.errorRatePercent + (idx === 3 ? 0.02 : 0)).toFixed(2)),
      cpu: Math.min(95, svc.cpuPercent + ((idx % 2) * 4 - 2)),
      memory: Math.min(95, svc.memoryPercent + (idx % 3)),
    }));
  }, [svc, range]);

  if (!svc) {
    return (
      <div className="bg-white rounded-2xl border border-[#E8EBF4] p-8 text-center">
        <h2 className="text-lg font-semibold">Service not found</h2>
        <button type="button" onClick={() => navigate('/usage-health')} className="mt-4 px-4 py-2 bg-[#7050F5] text-white text-sm rounded-lg">
          Back to Usage & Health
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={svc.name}
        subtitle={`Version ${svc.version} · Demo observability view (read-only)`}
        breadcrumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Usage & Health', to: '/usage-health' },
          { label: svc.name },
        ]}
        badge={<StatusBadge status={svc.status} size="md" />}
        actions={
          <>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value as '1h' | '6h' | '24h')}
              className="h-9 px-3 text-xs border border-[#E2E8F0] rounded-lg bg-white"
            >
              <option value="1h">Last 1 hour</option>
              <option value="6h">Last 6 hours</option>
              <option value="24h">Last 24 hours</option>
            </select>
            <button
              type="button"
              onClick={refreshHealthSnapshot}
              className="h-9 px-3 bg-white border border-[#E2E8F0] rounded-lg text-xs font-medium inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
            <ExportMenu
              onExportCSV={() => {
                exportToCSV(`${svc.id}-metrics.csv`, metricPoints);
                pushToast({ type: 'success', title: 'Exported service metrics' });
              }}
            />
            <button
              type="button"
              onClick={() => navigate(`/service-logs?service=${encodeURIComponent(svc.name)}`)}
              className="h-9 px-3.5 bg-[#7050F5] text-white rounded-lg text-xs font-medium inline-flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>View Logs</span>
            </button>
          </>
        }
      />

      <div className="bg-white rounded-2xl border border-[#E8EBF4] overflow-hidden">
        <div className="flex items-center gap-1 px-4 pt-3 border-b border-[#E8EBF4] overflow-x-auto">
          {(
            [
              { key: 'overview', label: 'Overview' },
              { key: 'metrics', label: 'Metrics' },
              { key: 'errors', label: 'Error History' },
              { key: 'dependencies', label: 'Dependencies' },
              { key: 'deployments', label: 'Deployments' },
              { key: 'checks', label: 'Health Checks' },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap ${
                tab === t.key ? 'border-[#7050F5] text-[#7050F5]' : 'border-transparent text-[#64748B]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === 'overview' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div className="p-4 rounded-xl bg-[#F9FAFD] border border-[#E8EBF4]"><span className="text-xs text-[#64748B]">Uptime (Demo)</span><p className="text-xl font-bold tabular-nums mt-1">{svc.uptimePercent}%</p></div>
              <div className="p-4 rounded-xl bg-[#F9FAFD] border border-[#E8EBF4]"><span className="text-xs text-[#64748B]">Avg Latency</span><p className="text-xl font-bold tabular-nums mt-1">{svc.responseTimeMs} ms</p></div>
              <div className="p-4 rounded-xl bg-[#F9FAFD] border border-[#E8EBF4]"><span className="text-xs text-[#64748B]">Requests (1h)</span><p className="text-xl font-bold tabular-nums mt-1">{formatNumberIN(svc.requestsLastHour)}</p></div>
              <div className="p-4 rounded-xl bg-[#F9FAFD] border border-[#E8EBF4]"><span className="text-xs text-[#64748B]">CPU / Memory</span><p className="text-xl font-bold tabular-nums mt-1">{svc.cpuPercent}% / {svc.memoryPercent}%</p></div>
            </div>
          )}

          {tab === 'metrics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ChartCard title="Response Time (ms)" subtitle={`Window: ${range}`}>
                <div className="h-[210px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metricPoints}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F8" vertical={false} />
                      <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="latency" stroke="#7050F5" fill="#7050F5" fillOpacity={0.15} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
              <ChartCard title="Requests Per Minute & Error Rate" subtitle={`Window: ${range}`}>
                <div className="h-[210px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metricPoints}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F8" vertical={false} />
                      <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="rpm" stroke="#478BFA" strokeWidth={2} />
                      <Line type="monotone" dataKey="cpu" stroke="#10B981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </div>
          )}

          {tab === 'errors' && (
            svc.recentErrors.length === 0 ? (
              <p className="text-sm text-[#64748B]">No recent service errors in the selected monitoring window.</p>
            ) : (
              <div className="space-y-2">
                {svc.recentErrors.map((e) => (
                  <div key={e.id} className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 text-xs">
                    <div className="flex justify-between font-semibold text-[#0F172A]"><span>{e.code}</span><span className="tabular-nums">{formatDateTime(e.timestamp)}</span></div>
                    <p className="text-[#64748B] mt-1">{e.summary}</p>
                  </div>
                ))}
              </div>
            )
          )}

          {tab === 'dependencies' && (
            <div className="space-y-2">
              {svc.dependencies.map((d) => (
                <div key={d} className="p-3 rounded-xl border border-[#E8EBF4] flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#0F172A]">{d}</span>
                  <StatusBadge status="Operational" />
                </div>
              ))}
            </div>
          )}

          {tab === 'deployments' && (
            <div className="space-y-2">
              {svc.deployments.map((dep, i) => (
                <div key={i} className="p-3 rounded-xl border border-[#E8EBF4] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono-code font-semibold text-[#0F172A]">{dep.version}</span>
                    <p className="text-[#64748B]">{dep.deployedBy} · {dep.deployedAt}</p>
                  </div>
                  <StatusBadge status={dep.status} />
                </div>
              ))}
            </div>
          )}

          {tab === 'checks' && (
            <div className="text-xs space-y-2">
              <div className="p-3 rounded-xl border border-[#E8EBF4] flex justify-between"><span>HTTP /healthz Liveness Probe</span><StatusBadge status={svc.status} /></div>
              <div className="p-3 rounded-xl border border-[#E8EBF4] flex justify-between"><span>HTTP /readyz Dependency Probe</span><StatusBadge status="Operational" /></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
