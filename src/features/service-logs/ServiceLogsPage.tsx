import React, { useMemo, useState } from 'react';
import { Copy, Eye, Filter } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { usePlatformStore } from '../../services/platformStore';
import { LogLevel, ServiceLogEntry } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { ColumnDef, DataTable } from '../../components/common/DataTable';
import { SearchInput } from '../../components/common/SearchInput';
import { DetailDrawer } from '../../components/common/DetailDrawer';
import { ExportMenu } from '../../components/common/ExportMenu';
import { exportToCSV, formatDateTime } from '../../utils/format';

export const ServiceLogsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { serviceLogs, servicesHealth, pushToast } = usePlatformStore();

  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState(searchParams.get('service') || '');
  const [envFilter, setEnvFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [tenantFilter, setTenantFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState<ServiceLogEntry | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return serviceLogs.filter((l) => {
      if (
        q &&
        !l.message.toLowerCase().includes(q) &&
        !l.requestId.toLowerCase().includes(q) &&
        !l.traceId.toLowerCase().includes(q)
      ) {
        return false;
      }
      if (serviceFilter && l.service !== serviceFilter) return false;
      if (envFilter && l.environment !== envFilter) return false;
      if (levelFilter && l.level !== levelFilter) return false;
      if (tenantFilter && !l.tenantId.toLowerCase().includes(tenantFilter.toLowerCase())) return false;
      if (statusFilter && String(l.statusCode) !== statusFilter) return false;
      return true;
    });
  }, [serviceLogs, search, serviceFilter, envFilter, levelFilter, tenantFilter, statusFilter]);

  const copyText = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    pushToast({ type: 'info', title: `Copied ${label}`, message: text });
  };

  const levelStyle = (lvl: LogLevel) => {
    if (lvl === 'FATAL' || lvl === 'ERROR') return 'bg-rose-50 text-rose-700 border-rose-200';
    if (lvl === 'WARN') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (lvl === 'DEBUG') return 'bg-slate-100 text-slate-600 border-slate-200';
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  const columns: ColumnDef<ServiceLogEntry>[] = [
    { key: 'ts', header: 'Timestamp', sortable: true, sortValue: (l) => l.timestamp, render: (l) => <span className="font-mono-code text-xs tabular-nums whitespace-nowrap">{formatDateTime(l.timestamp)}</span> },
    { key: 'svc', header: 'Service', render: (l) => <span className="font-medium text-[#0F172A] whitespace-nowrap">{l.service}</span> },
    { key: 'env', header: 'Env', render: (l) => <span className="text-xs text-[#64748B]">{l.environment}</span> },
    {
      key: 'lvl',
      header: 'Level',
      render: (l) => (
        <span className={`px-2 py-0.5 rounded border text-[11px] font-mono-code font-semibold ${levelStyle(l.level)}`}>
          {l.level}
        </span>
      ),
    },
    { key: 'msg', header: 'Message', render: (l) => <span className="text-xs text-[#0F172A] line-clamp-1 max-w-md">{l.message}</span> },
    {
      key: 'req',
      header: 'Request ID',
      render: (l) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            copyText(l.requestId, 'Request ID');
          }}
          className="font-mono-code text-xs text-[#5B3CE6] hover:underline inline-flex items-center gap-1"
        >
          <span>{l.requestId}</span>
          <Copy className="w-3 h-3" />
        </button>
      ),
    },
    { key: 'dur', header: 'Duration', align: 'right', render: (l) => <span className="font-mono-code text-xs tabular-nums">{l.durationMs}ms</span> },
    { key: 'code', header: 'Status', align: 'right', render: (l) => <span className="font-mono-code text-xs tabular-nums font-semibold">{l.statusCode}</span> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (l) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedLog(l);
          }}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
          aria-label="Inspect log details"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Service Logs"
        subtitle="Centralized sanitized log stream across PayFuse microservices. Secrets, tokens, and personal identifiers are automatically masked."
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Service Logs' }]}
        actions={
          <ExportMenu
            onExportCSV={() => {
              exportToCSV('payfuse-service-logs.csv', filtered.map((l) => ({ Timestamp: l.timestamp, Service: l.service, Env: l.environment, Level: l.level, RequestID: l.requestId, TraceID: l.traceId, Tenant: l.tenantId, Status: l.statusCode, Message: l.message })));
              pushToast({ type: 'success', title: 'Logs exported' });
            }}
          />
        }
      />

      <DataTable
        data={filtered}
        columns={columns}
        rowKey={(l) => l.id}
        onRowClick={(l) => setSelectedLog(l)}
        toolbar={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
            <SearchInput value={search} onChange={setSearch} placeholder="Search message, req/trace ID..." className="lg:col-span-2" />
            <select value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)} className="h-9 px-2.5 text-xs border border-[#E2E8F0] rounded-lg bg-white">
              <option value="">All Services</option>
              {servicesHealth.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
            <select value={envFilter} onChange={(e) => setEnvFilter(e.target.value)} className="h-9 px-2.5 text-xs border border-[#E2E8F0] rounded-lg bg-white">
              <option value="">All Environments</option>
              <option value="production">production</option>
              <option value="staging">staging</option>
              <option value="sandbox">sandbox</option>
            </select>
            <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="h-9 px-2.5 text-xs border border-[#E2E8F0] rounded-lg bg-white">
              <option value="">All Levels</option>
              <option value="DEBUG">DEBUG</option>
              <option value="INFO">INFO</option>
              <option value="WARN">WARN</option>
              <option value="ERROR">ERROR</option>
              <option value="FATAL">FATAL</option>
            </select>
            <div className="flex gap-2">
              <input value={tenantFilter} onChange={(e) => setTenantFilter(e.target.value)} placeholder="Tenant ID" className="w-full h-9 px-2.5 text-xs border border-[#E2E8F0] rounded-lg" />
              <input value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} placeholder="HTTP" className="w-20 h-9 px-2 text-xs border border-[#E2E8F0] rounded-lg" />
            </div>
          </div>
        }
      />

      <DetailDrawer
        open={selectedLog !== null}
        onClose={() => setSelectedLog(null)}
        title={`Log Event · ${selectedLog?.service}`}
        subtitle={`${selectedLog?.level} · ${selectedLog?.environment}`}
      >
        {selectedLog && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E8EBF4]">
              <p className="font-semibold text-[#0F172A] mb-1">Full Message</p>
              <p className="text-[#0F172A] leading-relaxed">{selectedLog.message}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[#64748B]">Request ID</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <code className="font-semibold">{selectedLog.requestId}</code>
                  <button type="button" onClick={() => copyText(selectedLog.requestId, 'Request ID')} className="text-[#7050F5]"><Copy className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div>
                <span className="text-[#64748B]">Trace ID</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <code className="font-semibold">{selectedLog.traceId}</code>
                  <button type="button" onClick={() => copyText(selectedLog.traceId, 'Trace ID')} className="text-[#7050F5]"><Copy className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div><span className="text-[#64748B]">Tenant Scope</span><p className="font-mono-code font-semibold mt-0.5">{selectedLog.tenantId}</p></div>
              <div><span className="text-[#64748B]">Duration / HTTP</span><p className="font-mono-code font-semibold mt-0.5">{selectedLog.durationMs}ms · {selectedLog.statusCode}</p></div>
            </div>

            {selectedLog.stackTrace && (
              <div>
                <p className="font-semibold text-[#0F172A] mb-1">Sanitized Stack Trace</p>
                <pre className="p-3 rounded-xl bg-[#0B1230] text-slate-200 overflow-x-auto text-[11px] leading-relaxed">
                  {selectedLog.stackTrace}
                </pre>
              </div>
            )}

            <div>
              <p className="font-semibold text-[#0F172A] mb-1">Service Metadata</p>
              <pre className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E8EBF4] overflow-x-auto text-[11px]">
                {JSON.stringify(selectedLog.metadata, null, 2)}
              </pre>
            </div>

            <button
              type="button"
              onClick={() => {
                setServiceFilter(selectedLog.service);
                setSelectedLog(null);
              }}
              className="w-full h-9 rounded-lg border border-[#E2E8F0] font-medium hover:bg-slate-50 inline-flex items-center justify-center gap-1.5"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter All Logs for {selectedLog.service}</span>
            </button>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
};
