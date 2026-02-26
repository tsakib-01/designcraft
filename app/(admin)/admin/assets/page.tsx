'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, Trash2, Search, Globe, Lock } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { IAsset } from '@/types/design.types';
import { formatBytes, formatDate } from '@/lib/utils/helpers';

export default function AdminAssetsPage() {
  const { accessToken } = useAuthStore();
  const { addToast }    = useUIStore();
  const fileInputRef    = useRef<HTMLInputElement>(null);

  const [assets, setAssets]       = useState<IAsset[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [type, setType]           = useState('');
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId]   = useState<string | null>(null);

  const fetchAssets = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, ...(type && { type }), limit: '100' });
      const res    = await fetch(`/api/assets?${params}`, { headers: { Authorization: `Bearer ${accessToken}` } });
      const data   = await res.json();
      if (data.success) setAssets(data.data.items);
    } finally { setLoading(false); }
  }, [accessToken, search, type]);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);

  const handleUpload = async (file: File) => {
    if (!accessToken) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name.replace(/\.[^/.]+$/, ''));
      formData.append('type', file.type.startsWith('image/') ? 'image' : 'icon');

      const res = await fetch('/api/assets/upload', { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` }, body: formData });
      if (res.ok) {
        addToast('Asset uploaded', 'success');
        fetchAssets();
      }
    } finally { setUploading(false); }
  };

  const togglePublic = async (asset: IAsset) => {
    if (!accessToken) return;
    // re-use assets delete/update via direct mongoose - simplified here
    addToast('Public status updated (implement via API)', 'info');
  };

  const deleteAsset = async (id: string) => {
    if (!accessToken) return;
    await fetch(`/api/assets/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` } });
    setDeleteId(null);
    addToast('Asset deleted', 'success');
    fetchAssets();
  };

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Assets</h1>
          <p className="text-gray-500 mt-1">{assets.length} total assets</p>
        </div>
        <div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ''; }} />
          <Button onClick={() => fileInputRef.current?.click()} loading={uploading}>
            <Upload className="w-4 h-4" />
            Upload Asset
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 max-w-md">
          <Input placeholder="Search assets..." value={search} onChange={(e) => setSearch(e.target.value)} leftIcon={<Search className="w-4 h-4" />} />
        </div>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="bg-surface-200 border border-surface-500 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
        >
          <option value="">All Types</option>
          <option value="image">Image</option>
          <option value="icon">Icon</option>
          <option value="shape">Shape</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {[...Array(16)].map((_, i) => <div key={i} className="aspect-square rounded-lg bg-surface-200 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {assets.map((asset) => (
            <div key={asset._id} className="group relative aspect-square rounded-lg bg-surface-200 border border-surface-400 overflow-hidden hover:border-brand-500/50 transition-all">
              {asset.mimeType?.startsWith('image/') ? (
                <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs text-center p-1">{asset.name}</div>
              )}
              {/* Hover actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                <span className="text-xs text-white font-medium truncate w-full text-center px-1">{asset.name}</span>
                <span className="text-xs text-gray-400">{formatBytes(asset.sizeBytes)}</span>
                <div className="flex gap-1 mt-1">
                  <button onClick={() => togglePublic(asset)} className="p-1 rounded bg-white/20 hover:bg-white/30 text-white" title={asset.isPublic ? 'Make private' : 'Make public'}>
                    {asset.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  </button>
                  <button onClick={() => setDeleteId(asset._id)} className="p-1 rounded bg-red-500/30 hover:bg-red-500/50 text-red-300">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
              {asset.isPublic && (
                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-400" title="Public" />
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Asset?" size="sm">
        <p className="text-gray-400 mb-6">This will permanently delete the asset file.</p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={() => deleteId && deleteAsset(deleteId)}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
