import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Eye,
  Headphones,
  Plus,
  ShieldAlert,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlatformStore } from '../../services/platformStore';
import { SupportTicket, TicketCategory, TicketPriority } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { KPIStatCard } from '../../components/common/KPIStatCard';
import { ColumnDef, DataTable } from '../../components/common/DataTable';
import { SearchInput } from '../../components/common/SearchInput';
import { StatusBadge } from '../../components/common/StatusBadge';
import { FormModal } from '../../components/common/FormModal';
import { formatDateTime } from '../../utils/format';

export const SupportTicketsPage: React.FC = () => {
  const navigate = useNavigate();
  const { supportTickets, companies, createTicket, updateTicket } = usePlatformStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  const [newForm, setNewForm] = useState({
    subject: '',
    companyId: companies[0]?.id || 'CMP-1001',
    category: 'Payroll' as TicketCategory,
    priority: 'Medium' as TicketPriority,
    message: '',
  });

  const kpis = useMemo(
    () => ({
      total: supportTickets.length,
      open: supportTickets.filter((t) => t.status === 'Open').length,
      inProgress: supportTickets.filter((t) => t.status === 'In Progress').length,
      waiting: supportTickets.filter((t) => t.status === 'Waiting for Customer').length,
      resolved: supportTickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length,
      critical: supportTickets.filter((t) => t.priority === 'Critical' && t.status !== 'Resolved' && t.status !== 'Closed').length,
    }),
    [supportTickets]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return supportTickets.filter((t) => {
      if (q && !t.ticketId.toLowerCase().includes(q) && !t.subject.toLowerCase().includes(q) && !t.companyName.toLowerCase().includes(q)) return false;
      if (statusFilter && t.status !== statusFilter) return false;
      if (priorityFilter && t.priority !== priorityFilter) return false;
      if (categoryFilter && t.category !== categoryFilter) return false;
      return true;
    });
  }, [supportTickets, search, statusFilter, priorityFilter, categoryFilter]);

  const columns: ColumnDef<SupportTicket>[] = [
    { key: 'id', header: 'Ticket ID', render: (t) => <span className="font-mono-code text-xs font-semibold text-[#5B3CE6]">{t.ticketId}</span> },
    { key: 'subject', header: 'Subject', render: (t) => <span className="font-semibold text-[#0F172A] line-clamp-1 max-w-xs">{t.subject}</span> },
    { key: 'company', header: 'Company', render: (t) => <span className="text-xs font-medium">{t.companyName}</span> },
    { key: 'cat', header: 'Category', render: (t) => <span className="text-xs text-[#64748B]">{t.category}</span> },
    { key: 'prio', header: 'Priority', render: (t) => <StatusBadge status={t.priority} /> },
    { key: 'agent', header: 'Assigned Agent', render: (t) => <span className="text-xs">{t.assignedAgent}</span> },
    { key: 'updated', header: 'Last Updated', render: (t) => <span className="text-xs tabular-nums text-[#64748B]">{formatDateTime(t.lastUpdated)}</span> },
    { key: 'status', header: 'Status', render: (t) => <StatusBadge status={t.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (t) => (
        <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button type="button" onClick={() => navigate(`/support-tickets/${t.id}`)} className="px-2.5 py-1 rounded-lg border border-[#E2E8F0] text-xs font-medium hover:bg-slate-50 inline-flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            <span>Open</span>
          </button>
          {t.status !== 'Resolved' && (
            <button type="button" onClick={() => updateTicket(t.id, { status: 'Resolved' })} className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-medium">
              Resolve
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Support & Tickets"
        subtitle="Tenant escalation desk. Sensitive payroll and employee personal identifiers remain masked unless explicitly authorized."
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Support & Tickets' }]}
        actions={
          <button type="button" onClick={() => setCreateOpen(true)} className="h-9 px-4 bg-[#7050F5] hover:bg-[#5E3DE6] text-white rounded-lg text-sm font-medium inline-flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            <span>New Ticket</span>
          </button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <KPIStatCard label="Total Tickets" value={kpis.total} icon={<Headphones className="w-5 h-5 text-[#7050F5]" />} iconBgClass="bg-[#EFEAFF]" onClick={() => setStatusFilter('')} />
        <KPIStatCard label="Open" value={kpis.open} icon={<Clock className="w-5 h-5 text-blue-600" />} iconBgClass="bg-blue-50" onClick={() => setStatusFilter('Open')} />
        <KPIStatCard label="In Progress" value={kpis.inProgress} icon={<Clock className="w-5 h-5 text-[#7050F5]" />} iconBgClass="bg-[#EFEAFF]" onClick={() => setStatusFilter('In Progress')} />
        <KPIStatCard label="Waiting" value={kpis.waiting} icon={<Clock className="w-5 h-5 text-amber-600" />} iconBgClass="bg-amber-50" onClick={() => setStatusFilter('Waiting for Customer')} />
        <KPIStatCard label="Resolved" value={kpis.resolved} icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />} iconBgClass="bg-emerald-50" onClick={() => setStatusFilter('Resolved')} />
        <KPIStatCard label="Critical" value={kpis.critical} icon={<ShieldAlert className="w-5 h-5 text-rose-600" />} iconBgClass="bg-rose-50" onClick={() => setPriorityFilter('Critical')} />
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        rowKey={(t) => t.id}
        onRowClick={(t) => navigate(`/support-tickets/${t.id}`)}
        toolbar={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <SearchInput value={search} onChange={setSearch} placeholder="Search ticket ID, subject, company..." className="w-full sm:max-w-sm" />
            <div className="flex items-center gap-2 flex-wrap">
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="h-9 px-2.5 text-xs border border-[#E2E8F0] rounded-lg bg-white">
                <option value="">All Categories</option>
                {['Payroll', 'Attendance', 'Subscription', 'Billing', 'Technical Issue', 'Account Access', 'Integration', 'Feature Request', 'Other'].map((c) => <option key={c}>{c}</option>)}
              </select>
              <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="h-9 px-2.5 text-xs border border-[#E2E8F0] rounded-lg bg-white">
                <option value="">All Priorities</option>
                <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 px-2.5 text-xs border border-[#E2E8F0] rounded-lg bg-white">
                <option value="">All Statuses</option>
                <option>Open</option><option>In Progress</option><option>Waiting for Customer</option><option>Resolved</option><option>Closed</option>
              </select>
            </div>
          </div>
        }
      />

      <FormModal
        open={createOpen}
        title="Create Support Ticket"
        onClose={() => setCreateOpen(false)}
        maxWidthClass="max-w-md"
        footer={
          <>
            <button type="button" onClick={() => setCreateOpen(false)} className="px-4 py-2 text-sm border border-[#E2E8F0] rounded-lg">Cancel</button>
            <button
              type="button"
              onClick={() => {
                if (!newForm.subject.trim()) return;
                createTicket(newForm);
                setCreateOpen(false);
                setNewForm({ ...newForm, subject: '', message: '' });
              }}
              className="px-4 py-2 text-sm bg-[#7050F5] text-white rounded-lg"
            >
              Create Ticket
            </button>
          </>
        }
      >
        <div className="space-y-3 text-sm">
          <div>
            <label className="block text-xs font-semibold mb-1">Company</label>
            <select value={newForm.companyId} onChange={(e) => setNewForm({ ...newForm, companyId: e.target.value })} className="w-full h-9 px-2.5 border border-[#E2E8F0] rounded-lg bg-white">
              {companies.map((c) => <option key={c.id} value={c.id}>{c.displayName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Subject *</label>
            <input value={newForm.subject} onChange={(e) => setNewForm({ ...newForm, subject: e.target.value })} className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Category</label>
              <select value={newForm.category} onChange={(e) => setNewForm({ ...newForm, category: e.target.value as TicketCategory })} className="w-full h-9 px-2 border border-[#E2E8F0] rounded-lg bg-white">
                {['Payroll', 'Attendance', 'Subscription', 'Billing', 'Technical Issue', 'Account Access', 'Integration', 'Feature Request', 'Other'].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Priority</label>
              <select value={newForm.priority} onChange={(e) => setNewForm({ ...newForm, priority: e.target.value as TicketPriority })} className="w-full h-9 px-2 border border-[#E2E8F0] rounded-lg bg-white">
                <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Description</label>
            <textarea rows={3} value={newForm.message} onChange={(e) => setNewForm({ ...newForm, message: e.target.value })} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg" />
          </div>
        </div>
      </FormModal>
    </div>
  );
};
