import React, { useState } from 'react';
import { Archive, Calendar, Eye, Megaphone, Pencil, Plus, Send, Trash2 } from 'lucide-react';
import { usePlatformStore } from '../../services/platformStore';
import { Announcement, PlanName, RegionCategory } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { ColumnDef, DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { FormModal } from '../../components/common/FormModal';
import { MultiSelect } from '../../components/common/MultiSelect';
import { formatDate } from '../../utils/format';

export const AnnouncementsPage: React.FC = () => {
  const { announcements, saveAnnouncement, deleteDraftAnnouncement } = usePlatformStore();
  const [modal, setModal] = useState<Announcement | null>(null);
  const [preview, setPreview] = useState<Announcement | null>(null);

  const columns: ColumnDef<Announcement>[] = [
    { key: 'title', header: 'Title', render: (a) => <div><p className="font-semibold text-[#0F172A]">{a.title}</p><p className="text-xs text-[#64748B] line-clamp-1">{a.description}</p></div> },
    { key: 'cat', header: 'Category', render: (a) => <span className="text-xs text-[#0F172A]">{a.category}</span> },
    { key: 'aud', header: 'Target Audience', render: (a) => <span className="text-xs text-[#64748B]">{a.targetCompanies}</span> },
    { key: 'by', header: 'Created By', render: (a) => <span className="text-xs">{a.createdBy}</span> },
    { key: 'pub', header: 'Publish Date', render: (a) => <span className="text-xs tabular-nums">{formatDate(a.publishDate)}</span> },
    { key: 'exp', header: 'Expiry Date', render: (a) => <span className="text-xs tabular-nums">{formatDate(a.expiryDate)}</span> },
    { key: 'status', header: 'Status', render: (a) => <StatusBadge status={a.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (a) => (
        <div className="inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button type="button" onClick={() => setPreview(a)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600" aria-label="Preview"><Eye className="w-4 h-4" /></button>
          <button type="button" onClick={() => setModal(a)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600" aria-label="Edit"><Pencil className="w-4 h-4" /></button>
          {a.status === 'Draft' && (
            <>
              <button type="button" onClick={() => saveAnnouncement({ ...a, status: 'Published' })} className="px-2 py-1 rounded-lg bg-[#7050F5] text-white text-xs font-medium inline-flex items-center gap-1"><Send className="w-3 h-3" />Publish</button>
              <button type="button" onClick={() => deleteDraftAnnouncement(a.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600" aria-label="Delete draft"><Trash2 className="w-4 h-4" /></button>
            </>
          )}
          {a.status === 'Published' && (
            <button type="button" onClick={() => saveAnnouncement({ ...a, status: 'Archived' })} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600" aria-label="Archive"><Archive className="w-4 h-4" /></button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Announcements"
        subtitle="Publish release notes, scheduled maintenance notices, and statutory advisories to targeted companies."
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Announcements' }]}
        actions={
          <button
            type="button"
            onClick={() =>
              setModal({
                id: `ANN-${Date.now()}`,
                title: '',
                description: '',
                content: '',
                category: 'Product Release',
                targetCompanies: 'All Active Companies',
                targetPlans: ['Essential', 'Growth', 'Business', 'Enterprise'],
                targetIndustries: ['IT & Software'],
                targetRegions: ['India'],
                createdBy: 'Vikramaditya Menon',
                publishDate: new Date().toISOString().slice(0, 10),
                expiryDate: '2025-03-31',
                priority: 'Normal',
                status: 'Draft',
              })
            }
            className="h-9 px-4 bg-[#7050F5] hover:bg-[#5E3DE6] text-white rounded-lg text-sm font-medium inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Announcement</span>
          </button>
        }
      />

      <DataTable data={announcements} columns={columns} rowKey={(a) => a.id} onRowClick={(a) => setPreview(a)} />

      {modal && (
        <FormModal
          open
          title={modal.title ? `Edit Announcement` : 'Create Announcement'}
          onClose={() => setModal(null)}
          footer={
            <>
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-sm border border-[#E2E8F0] rounded-lg">Cancel</button>
              <button
                type="button"
                onClick={() => {
                  if (!modal.title.trim()) return;
                  saveAnnouncement({ ...modal, status: 'Draft' });
                  setModal(null);
                }}
                className="px-4 py-2 text-sm border border-[#E2E8F0] rounded-lg"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!modal.title.trim()) return;
                  saveAnnouncement({ ...modal, status: 'Published' });
                  setModal(null);
                }}
                className="px-4 py-2 text-sm bg-[#7050F5] text-white rounded-lg"
              >
                Publish Now
              </button>
            </>
          }
        >
          <div className="space-y-3 text-sm">
            <div><label className="block text-xs font-semibold mb-1">Title *</label><input value={modal.title} onChange={(e) => setModal({ ...modal, title: e.target.value })} className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg" /></div>
            <div><label className="block text-xs font-semibold mb-1">Short Summary</label><input value={modal.description} onChange={(e) => setModal({ ...modal, description: e.target.value })} className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Category</label>
                <select value={modal.category} onChange={(e) => setModal({ ...modal, category: e.target.value as Announcement['category'] })} className="w-full h-9 px-2 border border-[#E2E8F0] rounded-lg bg-white">
                  <option>Product Release</option><option>Scheduled Maintenance</option><option>Statutory Advisory</option><option>Security Notice</option><option>Billing Update</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Priority</label>
                <select value={modal.priority} onChange={(e) => setModal({ ...modal, priority: e.target.value as Announcement['priority'] })} className="w-full h-9 px-2 border border-[#E2E8F0] rounded-lg bg-white">
                  <option>Normal</option><option>Important</option><option>Urgent</option>
                </select>
              </div>
              <div><label className="block text-xs font-semibold mb-1">Publish Date</label><input type="date" value={modal.publishDate} onChange={(e) => setModal({ ...modal, publishDate: e.target.value })} className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg" /></div>
              <div><label className="block text-xs font-semibold mb-1">Expiry Date</label><input type="date" value={modal.expiryDate} onChange={(e) => setModal({ ...modal, expiryDate: e.target.value })} className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg" /></div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Target Plans</label>
              <MultiSelect<PlanName>
                options={['Essential', 'Growth', 'Business', 'Enterprise']}
                selected={modal.targetPlans}
                onChange={(next) => setModal({ ...modal, targetPlans: next })}
                columns={2}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Target Regions</label>
              <MultiSelect<RegionCategory>
                options={['India', 'Middle East', 'APAC', 'Other']}
                selected={modal.targetRegions}
                onChange={(next) => setModal({ ...modal, targetRegions: next })}
                columns={2}
              />
            </div>
            <div><label className="block text-xs font-semibold mb-1">Announcement Content</label><textarea rows={4} value={modal.content} onChange={(e) => setModal({ ...modal, content: e.target.value })} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg" /></div>
          </div>
        </FormModal>
      )}

      {preview && (
        <FormModal open title="Announcement Preview" onClose={() => setPreview(null)} maxWidthClass="max-w-lg">
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7050F5]">
                <Megaphone className="w-4 h-4" /> {preview.category} · {preview.priority}
              </span>
              <StatusBadge status={preview.status} />
            </div>
            <h3 className="text-lg font-bold text-[#0F172A]">{preview.title}</h3>
            <p className="text-xs text-[#64748B] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> {formatDate(preview.publishDate)} – {formatDate(preview.expiryDate)} · Audience: {preview.targetCompanies}
            </p>
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E8EBF4] text-sm leading-relaxed text-[#0F172A]">
              {preview.content || preview.description}
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
};
