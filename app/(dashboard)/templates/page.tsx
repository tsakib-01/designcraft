'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Star, Layers } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { ITemplate } from '@/types/design.types';

export default function TemplatesPage() {
  const { accessToken } = useAuthStore();
  const { addToast } = useUIStore();
  const router = useRouter();

  const [templates, setTemplates] = useState<ITemplate[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [using, setUsing]         = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/templates?search=${encodeURIComponent(search)}&limit=30`);
      const data = await res.json();
      if (data.success) setTemplates(data.data.items);
    } catch { addToast('Failed to load templates', 'error'); }
    finally  { setLoading(false); }
  }, [search, addToast]);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const useTemplate = async (templateId: string) => {
    if (!accessToken) return;
    setUsing(templateId);
    try {
      const res  = await fetch('/api/designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ title: 'New Design', templateId }),
      });
      const data = await res.json();
      if (data.success) router.push(`/editor/${data.data._id}`);
    } catch { addToast('Failed to use template', 'error'); }
    finally  { setUsing(null); }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white">Templates</h1>
        <p className="text-gray-500 mt-1">Start with a professional template</p>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="rounded-xl bg-surface-200 border border-surface-400 overflow-hidden animate-pulse">
              <div className="aspect-square bg-surface-300" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-surface-400 rounded w-3/4" />
                <div className="h-6 bg-surface-400 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-24">
          <Layers className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No templates yet</h3>
          <p className="text-gray-500">Templates will appear here once added by admins.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {templates.map((template) => (
            <div key={template._id} className="design-card group">
              <div className="aspect-square relative bg-surface-300">
                {template.thumbnail ? (
                  <img src={template.thumbnail} alt={template.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Layers className="w-8 h-8 text-gray-600" />
                  </div>
                )}
                {template.isPremium && (
                  <div className="absolute top-2 left-2 bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Pro
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium text-white truncate mb-2">{template.title}</h3>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => useTemplate(template._id)}
                  loading={using === template._id}
                >
                  Use Template
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
