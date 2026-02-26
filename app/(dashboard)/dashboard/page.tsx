'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Grid, List, Trash2, Copy, Clock, Edit3 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { DesignListItem, DesignDimensions } from '@/types/design.types';
import { formatDate } from '@/lib/utils/helpers';

const PRESETS: { name: string; dims: DesignDimensions }[] = [
  { name: 'Social Post (1:1)',      dims: { width: 1080, height: 1080 } },
  { name: 'Story (9:16)',           dims: { width: 1080, height: 1920 } },
  { name: 'Landscape (16:9)',       dims: { width: 1920, height: 1080 } },
  { name: 'Presentation (4:3)',     dims: { width: 1280, height: 960  } },
  { name: 'A4 Document',            dims: { width: 794,  height: 1123 } },
  { name: 'Custom',                 dims: { width: 1080, height: 1080 } },
];

export default function DashboardPage() {
  const { user, accessToken } = useAuthStore();
  const { addToast } = useUIStore();
  const router = useRouter();

  const [designs, setDesigns]       = useState<DesignListItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [viewMode, setViewMode]     = useState<'grid' | 'list'>('grid');
  const [newModal, setNewModal]     = useState(false);
  const [deleteId, setDeleteId]     = useState<string | null>(null);
  const [newTitle, setNewTitle]     = useState('My Design');
  const [selectedPreset, setPreset] = useState(0);
  const [customDims, setCustomDims] = useState({ width: 1080, height: 1080 });
  const [creating, setCreating]     = useState(false);

  const fetchDesigns = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res  = await fetch(`/api/designs?search=${encodeURIComponent(search)}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (data.success) setDesigns(data.data.items);
    } catch { addToast('Failed to load designs', 'error'); }
    finally  { setLoading(false); }
  }, [accessToken, search, addToast]);

  useEffect(() => { fetchDesigns(); }, [fetchDesigns]);

  const createDesign = async () => {
    if (!accessToken) return;
    setCreating(true);
    try {
      const dims = selectedPreset === 5 ? customDims : PRESETS[selectedPreset].dims;
      const res  = await fetch('/api/designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ title: newTitle, dimensions: dims }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/editor/${data.data._id}`);
      }
    } catch { addToast('Failed to create design', 'error'); }
    finally  { setCreating(false); }
  };

  const deleteDesign = async (id: string) => {
    if (!accessToken) return;
    try {
      await fetch(`/api/designs/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` } });
      setDesigns((d) => d.filter((x) => x._id !== id));
      setDeleteId(null);
      addToast('Design deleted', 'success');
    } catch { addToast('Failed to delete', 'error'); }
  };

  const duplicateDesign = async (id: string) => {
    if (!accessToken) return;
    try {
      const res  = await fetch(`/api/designs/${id}/duplicate`, { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` } });
      const data = await res.json();
      if (data.success) { fetchDesigns(); addToast('Design duplicated', 'success'); }
    } catch { addToast('Failed to duplicate', 'error'); }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">My Designs</h1>
          <p className="text-gray-500 mt-1">Welcome back, <span className="text-brand-400">{user?.username}</span></p>
        </div>
        <Button onClick={() => setNewModal(true)} size="lg">
          <Plus className="w-4 h-4" />
          New Design
        </Button>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search designs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="flex items-center gap-1 bg-surface-200 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-surface-400 text-white' : 'text-gray-500 hover:text-white'}`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-surface-400 text-white' : 'text-gray-500 hover:text-white'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-gray-500">{designs.length} designs</p>
      </div>

      {/* Design Grid */}
      {loading ? (
        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-xl bg-surface-200 border border-surface-400 overflow-hidden animate-pulse">
              <div className="aspect-square bg-surface-300" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-surface-400 rounded w-3/4" />
                <div className="h-2 bg-surface-400 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : designs.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-surface-200 border border-surface-400 flex items-center justify-center mx-auto mb-4">
            <Edit3 className="w-7 h-7 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">{search ? 'No designs found' : 'No designs yet'}</h3>
          <p className="text-gray-500 mb-6">{search ? 'Try a different search term' : 'Create your first design to get started'}</p>
          {!search && <Button onClick={() => setNewModal(true)}><Plus className="w-4 h-4" />Create Design</Button>}
        </div>
      ) : (
        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
          {designs.map((design) => (
            <div key={design._id} className="design-card">
              {/* Thumbnail */}
              <div
                className={`${viewMode === 'grid' ? 'aspect-square' : 'aspect-video'} relative bg-surface-300 cursor-pointer`}
                onClick={() => router.push(`/editor/${design._id}`)}
              >
                {design.thumbnail ? (
                  <img src={design.thumbnail} alt={design.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Edit3 className="w-8 h-8 text-gray-600" />
                  </div>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm font-medium">Open in Editor</span>
                </div>
                {/* Size badge */}
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-md px-1.5 py-0.5 text-xs text-gray-300 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                  {design.dimensions.width}×{design.dimensions.height}
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <h3 className="text-sm font-medium text-white truncate mb-1">{design.title}</h3>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {formatDate(design.updatedAt)}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); duplicateDesign(design._id); }}
                      className="p-1 rounded hover:bg-surface-500 text-gray-400 hover:text-white transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteId(design._id); }}
                      className="p-1 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Design Modal */}
      <Modal open={newModal} onClose={() => setNewModal(false)} title="New Design" size="md">
        <div className="space-y-5">
          <Input
            label="Design Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="My Awesome Design"
          />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Canvas Size</label>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((preset, i) => (
                <button
                  key={i}
                  onClick={() => setPreset(i)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedPreset === i
                      ? 'border-brand-500 bg-brand-600/10 text-white'
                      : 'border-surface-500 text-gray-400 hover:border-surface-400 hover:text-white'
                  }`}
                >
                  <p className="text-sm font-medium">{preset.name}</p>
                  {i < 5 && <p className="text-xs opacity-60 font-mono mt-0.5">{preset.dims.width}×{preset.dims.height}</p>}
                </button>
              ))}
            </div>
          </div>

          {selectedPreset === 5 && (
            <div className="flex gap-3">
              <Input
                label="Width (px)"
                type="number"
                value={customDims.width}
                onChange={(e) => setCustomDims((d) => ({ ...d, width: parseInt(e.target.value) || 1080 }))}
              />
              <Input
                label="Height (px)"
                type="number"
                value={customDims.height}
                onChange={(e) => setCustomDims((d) => ({ ...d, height: parseInt(e.target.value) || 1080 }))}
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setNewModal(false)}>Cancel</Button>
            <Button className="flex-1" onClick={createDesign} loading={creating}>
              Create Design
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Design?" size="sm">
        <p className="text-gray-400 mb-6">This action cannot be undone. The design will be permanently deleted.</p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={() => deleteId && deleteDesign(deleteId)}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
