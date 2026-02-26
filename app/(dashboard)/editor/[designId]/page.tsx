'use client';
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useEditorStore } from '@/store/useEditorStore';
import CanvasToolbar from '@/components/editor/CanvasToolbar';
import ElementPanel from '@/components/editor/ElementPanel';
import PropertyPanel from '@/components/editor/PropertyPanel';
import LayerPanel from '@/components/editor/LayerPanel';
import Canvas from '@/components/editor/Canvas';
import ExportModal from '@/components/editor/ExportModal';
import { useUIStore } from '@/store/useUIStore';

export default function EditorPage() {
  const { designId } = useParams<{ designId: string }>();
  const { accessToken, user } = useAuthStore();
  const { setDesign, setIsLoading, reset } = useEditorStore();
  const { showLayerPanel } = useUIStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) { router.replace('/login'); return; }
    if (!accessToken || !designId) return;

    const loadDesign = async () => {
      setIsLoading(true);
      try {
        const res  = await fetch(`/api/designs/${designId}`, { headers: { Authorization: `Bearer ${accessToken}` } });
        const data = await res.json();
        if (!data.success) { router.replace('/dashboard'); return; }
        const design = data.data;
        setDesign(design._id, design.title, design.dimensions);
      } catch {
        router.replace('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadDesign();
    return () => reset();
  }, [designId, accessToken, user, router, setDesign, setIsLoading, reset]);

  return (
    <div className="flex flex-col h-screen bg-surface-0 overflow-hidden">
      <CanvasToolbar />
      <div className="flex flex-1 overflow-hidden">
        <ElementPanel />
        <div className="flex-1 relative overflow-hidden">
          <Canvas />
          {showLayerPanel && (
            <div className="absolute bottom-4 left-4 z-10">
              <LayerPanel />
            </div>
          )}
        </div>
        <PropertyPanel />
      </div>
      <ExportModal />
    </div>
  );
}
