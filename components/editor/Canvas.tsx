'use client';
import { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { useCanvas } from '@/hooks/useCanvas';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2 } from 'lucide-react';

export default function Canvas() {
  const { dimensions, designId, isLoading, fabricCanvas, zoom, setFabricCanvas } = useEditorStore();
  const { accessToken } = useAuthStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasReady, setCanvasReady] = useState(false);

  useCanvas('main-canvas');
  useAutoSave();

  // Load canvas data once fabric is initialized and design is set
  useEffect(() => {
    if (!fabricCanvas || !designId || !accessToken || canvasReady) return;

    const canvas = fabricCanvas as fabric.Canvas;

    canvas.setWidth(dimensions.width);
    canvas.setHeight(dimensions.height);

    const loadData = async () => {
      try {
        const res  = await fetch(`/api/designs/${designId}`, { headers: { Authorization: `Bearer ${accessToken}` } });
        const data = await res.json();
        if (data.success && data.data.canvasData) {
          canvas.loadFromJSON(data.data.canvasData, () => {
            canvas.renderAll();
            setCanvasReady(true);
          });
        } else {
          setCanvasReady(true);
        }
      } catch {
        setCanvasReady(true);
      }
    };

    loadData();
  }, [fabricCanvas, designId, accessToken, dimensions, canvasReady]);

  // Zoom
  useEffect(() => {
    if (!fabricCanvas) return;
    const canvas = fabricCanvas as fabric.Canvas;
    canvas.setZoom(zoom);
    canvas.setWidth(dimensions.width * zoom);
    canvas.setHeight(dimensions.height * zoom);
  }, [zoom, fabricCanvas, dimensions]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-auto flex items-center justify-center bg-surface-50 p-8 relative"
      style={{ backgroundImage: 'radial-gradient(#2d2d45 1px, transparent 1px)', backgroundSize: '24px 24px' }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-0/80 z-50">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
            <p className="text-gray-400 text-sm">Loading design...</p>
          </div>
        </div>
      )}

      <div
        className="relative shadow-2xl"
        style={{
          width:  dimensions.width  * zoom,
          height: dimensions.height * zoom,
        }}
      >
        <canvas id="main-canvas" />
      </div>
    </div>
  );
}