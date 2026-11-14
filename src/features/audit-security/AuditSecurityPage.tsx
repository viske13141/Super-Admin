import React, { useMemo, useState } from 'react';
import { Eye, Lock, ShieldAlert, ShieldCheck, UserCheck } from 'lucide-react';
import { usePlatformStore } from '../../services/platformStore';
import { AuditEvent } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { KPIStatCard } from '../../components/common/KPIStatCard';
import { ColumnDef, DataTable } from '../../components/common/DataTable';
import { SearchInput } from '../../components/common/SearchInput';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DetailDrawer } from '../../components/common/DetailDrawer';
import { ExportMenu } from '../../components/common/ExportMenu';
import { exportToCSV, formatDateTime } from '../../utils/format';

export const AuditSecurityPage: React.FC = () => {
  const { auditEvents, platformUsers, pushToast } = usePlatformStore();

  const [search, setSearch] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [resultFilter, setResultFilter] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);

  const securityStats = useMemo(() => {
    const lockedCount = platformUsers.filter((u) => u.status === 'Locked').length;
    const mfaEnabledCount = platformUsers.filter((u) => u.mfaEnabled).length;
    const activeSessions = platformUsers.reduce((s, u) => s + u.sessions.length, 0);
    const failedAuths = platformUsers.reduce(
      (s, u) => s + u.loginHistory.filter((l) => l.result === 'Failed').length,
      0
    );
    const deniedCount = auditEvents.filter((a) => a.result === 'Denied').length;
    return {
      lockedCount,
      mfaPercent: Math.round((mfaEnabledCount / Math.max(1, platformUsers.length)) * 100),
      activeSessions,
      failedAuths,
      deniedCount,
    };
  }, [platformUsers, auditEvents]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return auditEvents.filter((a) => {
      if (
        q &&
        !a.eventId.toLowerCase().includes(q) &&
        !a.user.toLowerCase().includes(q) &&
        !a.action.toLowerCase().includes(q) &&
        !a.resource.toLowerCase().includes(q)
      ) {
        return false;
      }
      if (eventTypeFilter && a.eventType !== eventTypeFilter) return false;
      if (moduleFilter && a.module !== moduleFilter) return false;
      if (resultFilter && a.result !== resultFilter) return false;
      return true;
    });
  }, [auditEvents, search, eventTypeFilter, moduleFilter, resultFilter]);

  const columns: ColumnDef<AuditEvent>[] = [
    { key: 'id', header: 'Event ID', render: (a) => <span className="font-mono-code text-xs font-semibold text-[#5B3CE6]">{a.eventId}</span> },
    { key: 'user', header: 'User', render: (a) => <span className="font-medium text-[#0F172A]">{a.user}</span> },
    { key: 'role', header: 'Role', render: (a) => <span className="text-xs text-[#64748B]">{a.role}</span> },
    { key: 'action', header: 'Action', render: (a) => <span className="font-medium text-[#0F172A]">{a.action}</span> },
    { key: 'mod', header: 'Module', render: (a) => <span className="text-xs text-[#64748B]">{a.module}</span> },
    { key: 'res', header: 'Resource', render: (a) => <span className="text-xs font-mono-code text-[#475569]">{a.resource}</span> },
    { key: 'ts', header: 'Timestamp', sortable: true, sortValue: (a) => a.timestamp, render: (a) => <span className="text-xs tabular-nums text-[#64748B] whitespace-nowrap">{formatDateTime(a.timestamp)}</span> },
    { key: 'ip', header: 'IP Address', render: (a) => <span className="font-mono-code text-xs text-[#64748B]">{a.ipAddress}</span> },
    { key: 'result', header: 'Result', render: (a) => <StatusBadge status={a.result} /> },
    {
      key: 'inspect',
      header: '',
      align: 'right',
      render: (a) => (
        <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedEvent(a); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600" aria-label="Inspect audit event">
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Audit & Security"
        subtitle="Security posture telemetry and immutable, append-only platform audit trail."
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Audit & Security' }]}
        actions={
          <ExportMenu
            onExportCSV={() => {
              exportToCSV('payfuse-audit-events.csv', filtered.map((a) => ({ EventID: a.eventId, User: a.user, Role: a.role, Action: a.action, Type: a.eventType, Module: a.module, Resource: a.resource, Timestamp: a.timestamp, IP: a.ipAddress, Result: a.result })));
              pushToast({ type: 'success', title: 'Audit log exported' });
            }}
          />
        }
      />

      {/* Security Dashboard KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPIStatCard label="Failed Login Attempts" value={securityStats.failedAuths} icon={<ShieldAlert className="w-5 h-5 text-rose-600" />} iconBgClass="bg-rose-50" />
        <KPIStatCard label="Locked Accounts" value={securityStats.lockedCount} icon={<Lock className="w-5 h-5 text-amber-600" />} iconBgClass="bg-amber-50" />
        <KPIStatCard label="Active Privileged Sessions" value={securityStats.activeSessions} icon={<UserCheck className="w-5 h-5 text-[#7050F5]" />} iconBgClass="bg-[#EFEAFF]" />
        <KPIStatCard label="MFA Coverage (Staff)" value={`${securityStats.mfaPercent}%`} icon={<ShieldCheck className="w-5 h-5 text-emerald-600" />} iconBgClass="bg-emerald-50" subText={`${securityStats.deniedCount} blocked PII attempts`} />
      </div>

      <div className="px-4 py-2.5 rounded-xl bg-[#F4F2FF] border border-[#7050F5]/20 text-xs text-[#5B3CE6]">
        <strong>Append-Only Audit Integrity:</strong> Audit records are immutable from the Super Admin UI. Edit and delete operations are permanently disabled.
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        rowKey={(a) => a.id}
        onRowClick={(a) => setSelectedEvent(a)}
        toolbar={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            <SearchInput value={search} onChange={setSearch} placeholder="Search event ID, actor, action, resource..." className="lg:col-span-2" />
            <select value={eventTypeFilter} onChange={(e) => setEventTypeFilter(e.target.value)} className="h-9 px-2.5 text-xs border border-[#E2E8F0] rounded-lg bg-white">
              <option value="">All Event Types</option>
              {['Login', 'Logout', 'Create', 'Edit', 'Delete', 'Approve', 'Suspend', 'Activate', 'Permission Change', 'Financial Action', 'Configuration Change', 'Security Event'].map((t) => <option key={t}>{t}</option>)}
            </select>
            <select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} className="h-9 px-2.5 text-xs border border-[#E2E8F0] rounded-lg bg-white">
              <option value="">All Modules</option>
              {Array.from(new Set(auditEvents.map((a) => a.module))).map((m) => <option key={m}>{m}</option>)}
            </select>
            <select value={resultFilter} onChange={(e) => setResultFilter(e.target.value)} className="h-9 px-2.5 text-xs border border-[#E2E8F0] rounded-lg bg-white">
              <option value="">All Results</option>
              <option value="Success">Success</option>
              <option value="Denied">Denied</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        }
      />

      <DetailDrawer
        open={selectedEvent !== null}
        onClose={() => setSelectedEvent(null)}
        title={`Audit Event ${selectedEvent?.eventId}`}
        subtitle={`${selectedEvent?.eventType} · ${selectedEvent?.module}`}
      >
        {selectedEvent && (
          <div className="space-y-4 text-xs">
            <StatusBadge status={selectedEvent.result} size="md" />
            <dl className="grid grid-cols-2 gap-3 pt-2">
              <div><dt className="text-[#64748B]">Actor</dt><dd className="font-semibold text-[#0F172A]">{selectedEvent.user}</dd></div>
              <div><dt className="text-[#64748B]">Role</dt><dd className="font-medium">{selectedEvent.role}</dd></div>
              <div><dt className="text-[#64748B]">Timestamp</dt><dd className="tabular-nums">{formatDateTime(selectedEvent.timestamp)}</dd></div>
              <div><dt className="text-[#64748B]">IP Address</dt><dd className="font-mono-code">{selectedEvent.ipAddress}</dd></div>
              <div><dt className="text-[#64748B]">Request ID</dt><dd className="font-mono-code">{selectedEvent.requestId}</dd></div>
              <div><dt className="text-[#64748B]">Resource</dt><dd className="font-mono-code">{selectedEvent.resource}</dd></div>
            </dl>
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E8EBF4]">
              <p className="font-semibold text-[#0F172A] mb-1">Details</p>
              <p className="text-[#0F172A] leading-relaxed">{selectedEvent.details}</p>
            </div>
            {(selectedEvent.previousValue || selectedEvent.newValue) && (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-[#E8EBF4]">
                  <p className="text-[#64748B] font-semibold mb-1">Previous Value</p>
                  <p className="font-mono-code text-[#0F172A]">{selectedEvent.previousValue || '—'}</p>
                </div>
                <div className="p-3 rounded-xl border border-[#E8EBF4] bg-[#F6F4FF]">
                  <p className="text-[#5B3CE6] font-semibold mb-1">New Value</p>
                  <p className="font-mono-code text-[#0F172A]">{selectedEvent.newValue || '—'}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </DetailDrawer>
    </div>
  );
};
