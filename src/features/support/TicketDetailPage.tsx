import React, { useState } from 'react';
import { Lock, Paperclip, Send } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePlatformStore } from '../../services/platformStore';
import { TicketPriority, TicketStatus } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDateTime } from '../../utils/format';

export const TicketDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { supportTickets, platformUsers, updateTicket, addTicketMessage } = usePlatformStore();

  const ticket = supportTickets.find((t) => t.id === id);
  const [replyText, setReplyText] = useState('');
  const [replyMode, setReplyMode] = useState<'Support Agent' | 'Internal Note'>('Support Agent');

  if (!ticket) {
    return (
      <div className="bg-white rounded-2xl border border-[#E8EBF4] p-8 text-center">
        <h2 className="text-lg font-semibold">Ticket not found</h2>
        <button type="button" onClick={() => navigate('/support-tickets')} className="mt-4 px-4 py-2 bg-[#7050F5] text-white text-sm rounded-lg">
          Back to Support
        </button>
      </div>
    );
  }

  const agents = platformUsers.filter((u) => u.status === 'Active').map((u) => u.fullName);
  const related = supportTickets.filter((t) => t.companyId === ticket.companyId && t.id !== ticket.id);

  return (
    <div className="space-y-5">
      <PageHeader
        title={`${ticket.ticketId} · ${ticket.subject}`}
        subtitle={`${ticket.companyName} · Category: ${ticket.category} · Created ${formatDateTime(ticket.createdDate)}`}
        breadcrumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Support & Tickets', to: '/support-tickets' },
          { label: ticket.ticketId },
        ]}
        badge={
          <div className="flex items-center gap-2">
            <StatusBadge status={ticket.priority} size="md" />
            <StatusBadge status={ticket.status} size="md" />
          </div>
        }
      />

      {ticket.requiresSensitiveDataAccess && (
        <div className="px-4 py-3 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-800 flex items-center gap-2">
          <Lock className="w-4 h-4 shrink-0" />
          <span>
            <strong>Privacy Guard Active:</strong> Customer payroll and employee personal identifiers remain masked until explicit customer support elevation is authorized.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Conversation & Reply */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-[#E8EBF4] p-5 space-y-4">
            <h3 className="text-sm font-semibold text-[#0F172A]">Conversation & Internal Notes</h3>
            <div className="space-y-3">
              {ticket.messages.length === 0 ? (
                <p className="text-xs text-[#64748B]">No messages yet.</p>
              ) : (
                ticket.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3.5 rounded-xl border text-xs ${
                      m.authorType === 'Internal Note'
                        ? 'bg-amber-50/70 border-amber-200'
                        : m.authorType === 'Support Agent'
                        ? 'bg-[#F6F4FF] border-[#7050F5]/20'
                        : 'bg-[#F8FAFC] border-[#E8EBF4]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-semibold text-[#0F172A]">
                        {m.author} {m.authorType === 'Internal Note' && <span className="text-amber-700">(Internal Note)</span>}
                      </span>
                      <span className="text-[#64748B] tabular-nums">{formatDateTime(m.timestamp)}</span>
                    </div>
                    <p className="text-[#0F172A] leading-relaxed">{m.content}</p>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-[#E8EBF4] space-y-2.5">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setReplyMode('Support Agent')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${replyMode === 'Support Agent' ? 'bg-[#7050F5] text-white' : 'bg-slate-100 text-[#64748B]'}`}
                >
                  Public Reply
                </button>
                <button
                  type="button"
                  onClick={() => setReplyMode('Internal Note')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${replyMode === 'Internal Note' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-[#64748B]'}`}
                >
                  Internal Note
                </button>
              </div>
              <textarea
                rows={3}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={replyMode === 'Internal Note' ? 'Add internal note (hidden from tenant)...' : 'Reply to customer...'}
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-xl"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!replyText.trim()) return;
                    addTicketMessage(ticket.id, replyText.trim(), replyMode);
                    setReplyText('');
                  }}
                  className="px-4 py-2 bg-[#7050F5] hover:bg-[#5E3DE6] text-white rounded-lg text-xs font-medium inline-flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{replyMode === 'Internal Note' ? 'Save Internal Note' : 'Send Reply'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Metadata Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-[#E8EBF4] p-5 space-y-3 text-xs">
            <h3 className="text-sm font-semibold text-[#0F172A]">Ticket Controls</h3>
            <div>
              <label className="block text-[#64748B] mb-1">Status</label>
              <select
                value={ticket.status}
                onChange={(e) => updateTicket(ticket.id, { status: e.target.value as TicketStatus })}
                className="w-full h-9 px-2.5 border border-[#E2E8F0] rounded-lg bg-white text-sm"
              >
                <option>Open</option><option>In Progress</option><option>Waiting for Customer</option><option>Resolved</option><option>Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-[#64748B] mb-1">Priority</label>
              <select
                value={ticket.priority}
                onChange={(e) => updateTicket(ticket.id, { priority: e.target.value as TicketPriority })}
                className="w-full h-9 px-2.5 border border-[#E2E8F0] rounded-lg bg-white text-sm"
              >
                <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-[#64748B] mb-1">Assigned Agent</label>
              <select
                value={ticket.assignedAgent}
                onChange={(e) => updateTicket(ticket.id, { assignedAgent: e.target.value })}
                className="w-full h-9 px-2.5 border border-[#E2E8F0] rounded-lg bg-white text-sm"
              >
                {agents.map((a) => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div className="pt-2 border-t border-[#F1F3F9]">
              <button
                type="button"
                onClick={() => navigate(`/companies/${ticket.companyId}`)}
                className="text-[#7050F5] font-medium hover:underline"
              >
                View Tenant: {ticket.companyName} →
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8EBF4] p-5 space-y-2 text-xs">
            <h3 className="text-sm font-semibold text-[#0F172A]">Attachments ({ticket.attachments.length})</h3>
            {ticket.attachments.length === 0 ? (
              <p className="text-[#64748B]">No attachments.</p>
            ) : (
              ticket.attachments.map((att) => (
                <div key={att} className="flex items-center gap-2 text-[#0F172A]">
                  <Paperclip className="w-3.5 h-3.5 text-[#7050F5]" />
                  <span>{att}</span>
                </div>
              ))
            )}
            {related.length > 0 && (
              <div className="pt-3 mt-3 border-t border-[#F1F3F9]">
                <h4 className="font-semibold text-[#0F172A] mb-1.5">Related Tenant Tickets</h4>
                {related.map((r) => (
                  <button key={r.id} type="button" onClick={() => navigate(`/support-tickets/${r.id}`)} className="block text-left text-[#7050F5] hover:underline">
                    {r.ticketId}: {r.subject}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
