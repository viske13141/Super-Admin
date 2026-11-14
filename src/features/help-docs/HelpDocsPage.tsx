import React, { useMemo, useState } from 'react';
import { BookOpen, Edit, Eye, Plus } from 'lucide-react';
import { usePlatformStore } from '../../services/platformStore';
import { HelpDocArticle } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchInput } from '../../components/common/SearchInput';
import { StatusBadge } from '../../components/common/StatusBadge';
import { FormModal } from '../../components/common/FormModal';
import { formatDate } from '../../utils/format';

const DOC_CATEGORIES: HelpDocArticle['category'][] = [
  'Platform Guides',
  'Admin Guides',
  'API Documentation',
  'FAQs',
  'Troubleshooting',
  'Release Notes',
];

export const HelpDocsPage: React.FC = () => {
  const { helpDocs, saveHelpDoc } = usePlatformStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [editModal, setEditModal] = useState<HelpDocArticle | null>(null);
  const [viewDoc, setViewDoc] = useState<HelpDocArticle | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return helpDocs.filter((d) => {
      if (category !== 'All' && d.category !== category) return false;
      if (q && !d.title.toLowerCase().includes(q) && !d.summary.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [helpDocs, category, search]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Help & Docs"
        subtitle="Platform administration guides, API documentation references, troubleshooting runbooks, and release notes."
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Help & Docs' }]}
        actions={
          <button
            type="button"
            onClick={() =>
              setEditModal({
                id: `DOC-${Date.now()}`,
                title: '',
                category: 'Admin Guides',
                summary: '',
                content: '',
                author: 'Vikramaditya Menon',
                updatedAt: new Date().toISOString().slice(0, 10),
                status: 'Draft',
                readTime: '3 min read',
              })
            }
            className="h-9 px-4 bg-[#7050F5] hover:bg-[#5E3DE6] text-white rounded-lg text-sm font-medium inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Documentation</span>
          </button>
        }
      />

      <div className="bg-white rounded-2xl border border-[#E8EBF4] p-3.5 space-y-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search guides, FAQs, API docs, release notes..." className="max-w-md" />
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button type="button" onClick={() => setCategory('All')} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${category === 'All' ? 'bg-[#7050F5] text-white' : 'bg-[#F4F6FA] text-[#64748B]'}`}>All</button>
          {DOC_CATEGORIES.map((c) => (
            <button key={c} type="button" onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${category === c ? 'bg-[#7050F5] text-white' : 'bg-[#F4F6FA] text-[#64748B]'}`}>{c}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((doc) => (
          <div key={doc.id} className="bg-white rounded-2xl border border-[#E8EBF4] p-5 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-semibold text-[#7050F5] inline-flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" /> {doc.category}
                </span>
                <StatusBadge status={doc.status} />
              </div>
              <h3 className="text-sm font-bold text-[#0F172A] mt-2">{doc.title}</h3>
              <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">{doc.summary}</p>
            </div>

            <div className="pt-3 border-t border-[#F1F3F9] flex items-center justify-between text-xs">
              <span className="text-[#64748B] tabular-nums">{doc.readTime} · {formatDate(doc.updatedAt)}</span>
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={() => setViewDoc(doc)} className="px-2.5 py-1 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 inline-flex items-center gap-1"><Eye className="w-3.5 h-3.5" />Read</button>
                <button type="button" onClick={() => setEditModal(doc)} className="px-2.5 py-1 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 inline-flex items-center gap-1"><Edit className="w-3.5 h-3.5" />Edit</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {viewDoc && (
        <FormModal open title={viewDoc.title} subtitle={`${viewDoc.category} · Updated ${formatDate(viewDoc.updatedAt)} · ${viewDoc.author}`} onClose={() => setViewDoc(null)}>
          <div className="space-y-3 text-sm leading-relaxed text-[#0F172A]">
            <p className="font-medium text-[#64748B]">{viewDoc.summary}</p>
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E8EBF4] whitespace-pre-line">
              {viewDoc.content}
            </div>
          </div>
        </FormModal>
      )}

      {editModal && (
        <FormModal
          open
          title={editModal.title ? `Edit Article` : 'Create Documentation Article'}
          onClose={() => setEditModal(null)}
          footer={
            <>
              <button type="button" onClick={() => setEditModal(null)} className="px-4 py-2 text-sm border border-[#E2E8F0] rounded-lg">Cancel</button>
              <button
                type="button"
                onClick={() => {
                  if (!editModal.title.trim()) return;
                  saveHelpDoc({ ...editModal, status: 'Draft', updatedAt: new Date().toISOString().slice(0, 10) });
                  setEditModal(null);
                }}
                className="px-4 py-2 text-sm border border-[#E2E8F0] rounded-lg"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!editModal.title.trim()) return;
                  saveHelpDoc({ ...editModal, status: 'Published', updatedAt: new Date().toISOString().slice(0, 10) });
                  setEditModal(null);
                }}
                className="px-4 py-2 text-sm bg-[#7050F5] text-white rounded-lg"
              >
                Publish Article
              </button>
            </>
          }
        >
          <div className="space-y-3 text-sm">
            <div><label className="block text-xs font-semibold mb-1">Title *</label><input value={editModal.title} onChange={(e) => setEditModal({ ...editModal, title: e.target.value })} className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Category</label>
                <select value={editModal.category} onChange={(e) => setEditModal({ ...editModal, category: e.target.value as HelpDocArticle['category'] })} className="w-full h-9 px-2 border border-[#E2E8F0] rounded-lg bg-white">
                  {DOC_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Status</label>
                <select value={editModal.status} onChange={(e) => setEditModal({ ...editModal, status: e.target.value as HelpDocArticle['status'] })} className="w-full h-9 px-2 border border-[#E2E8F0] rounded-lg bg-white">
                  <option>Draft</option><option>Published</option><option>Archived</option>
                </select>
              </div>
            </div>
            <div><label className="block text-xs font-semibold mb-1">Summary</label><input value={editModal.summary} onChange={(e) => setEditModal({ ...editModal, summary: e.target.value })} className="w-full h-9 px-3 border border-[#E2E8F0] rounded-lg" /></div>
            <div><label className="block text-xs font-semibold mb-1">Article Content</label><textarea rows={5} value={editModal.content} onChange={(e) => setEditModal({ ...editModal, content: e.target.value })} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg" /></div>
          </div>
        </FormModal>
      )}
    </div>
  );
};
