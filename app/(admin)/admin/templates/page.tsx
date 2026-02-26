'use client';
import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit3, Eye, EyeOff, Search } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { ITemplate } from '@/types/design.types';
import { formatDate } from '@/lib/utils/helpers';

export default function AdminTemplatesPage() {
  const { accessToken } = useAuthStore();
  const { addToast }    = useUIStore();

  const [templates, setTemplates] = useState<ITemplate[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [createModal, setCreate]  = useState(false);
  const [editTarget, setEdit]     = useState<ITemplate | null>(null);
  const [deleteId, setDeleteId]   = useState<string | null>(null);
  const [form, setForm]           = useState({ title: '', description: '', thumbnail: '', tags: '' });
  const [saving, setSaving]       = useState(false);

  const fetchTemplates = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res  = await fetch(`/api/admin/templates?search=${encodeURIComponent(search)}`, { headers: { Authorization: `Bearer ${accessToken}` } });
      const data = await res.json();
      if (data.success) setTemplates(data.data.items);
    } finally { setLoading(false); }
  }, [accessToken, search]);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const handleSave = async () => {
    if (!accessToken || !form.title) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title, description: form.description,
        thumbnail: form.thumbnail || `https://placehold.co/400x400/1a1a27/6366f1?text=${encodeURIComponent(form.title)}`,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        canvasData: { version: '5.3.0', objects: [], background: '#ffffff' },
      };
      const url    = editTarget ? `/api/admin/templates/${editTarget._id}` : '/api/admin/templates';
      const method = editTarget ? 'PUT' : 'POST';
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` }, body: JSON.stringify(payload) });
      const data   = await res.json();
      if (data.success) {
        addToast(editTarget ? 'Template updated' : 'Template created', 'success');
        setCreate(false); setEdit(null); fetchTemplates();
      }
    } finally { setSaving(false); }
  };

  const toggleActive = async (template: ITemplate) => {
    if (!accessToken) return;
    await fetch(`/api/admin/templates/${template._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ isActive: !template.isActive }),
    });
    fetchTemplates();
  };

  const deleteTemplate = async (id: string) => {
    if (!accessToken) return;
    await fetch(`/api/admin/templates/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` } });
    setDeleteId(null); addToast('Template deleted', 'success'); fetchTemplates();
  };

  const openEdit = (t: ITemplate) => {
    setEdit(t);
    setForm({ title: t.title, description: t.description, thumbnail: t.thumbnail, tags: t.tags.join(', ') });
  };

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Templates</h1>
          <p className="text-gray-500 mt-1">{templates.length} total templates</p>
        </div>
        <Button onClick={() => { setForm({ title: '', description: '', thumbnail: '', tags: '' }); setCreate(true); }}>
          <Plus className="w-4 h-4" />
          Add Template
        </Button>
      </div>

      <div className="mb-6 max-w-md">
        <Input placeholder="Search templates..." value={search} onChange={(e) => setSearch(e.target.value)} leftIcon={<Search className="w-4 h-4" />} />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="aspect-square rounded-xl bg-surface-200 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {templates.map((t) => (
            <div key={t._id} className={`design-card group ${!t.isActive ? 'opacity-50' : ''}`}>
              <div className="aspect-square bg-surface-300 relative">
                {t.thumbnail && <img src={t.thumbnail} alt={t.title} className="w-full h-full object-cover" />}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => openEdit(t)} className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => toggleActive(t)} className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white">{t.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  <button onClick={() => setDeleteId(t._id)} className="p-2 rounded-lg bg-red-500/30 hover:bg-red-500/50 text-red-300"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-white truncate">{t.title}</p>
                <p className="text-xs text-gray-500">{t.usageCount} uses · {!t.isActive && <span className="text-red-400">Hidden</span>}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal open={createModal || !!editTarget} onClose={() => { setCreate(false); setEdit(null); }} title={editTarget ? 'Edit Template' : 'Create Template'}>
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Template title" />
          <Input label="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Brief description" />
          <Input label="Thumbnail URL" value={form.thumbnail} onChange={(e) => setForm((f) => ({ ...f, thumbnail: e.target.value }))} placeholder="https://..." />
          <Input label="Tags (comma separated)" value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} placeholder="social, instagram, marketing" />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => { setCreate(false); setEdit(null); }}>Cancel</Button>
            <Button className="flex-1" onClick={handleSave} loading={saving}>{editTarget ? 'Update' : 'Create'}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Template?" size="sm">
        <p className="text-gray-400 mb-6">This will permanently delete the template. Designs created from it won&apos;t be affected.</p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={() => deleteId && deleteTemplate(deleteId)}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
