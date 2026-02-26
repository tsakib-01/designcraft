'use client';
import { useEffect, useRef, useCallback } from 'react';
import { useEditorStore } from '@/store/useEditorStore';

export function useCanvas(containerId: string) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const {
    setFabricCanvas, setActiveObjectId, setSelectedIds,
    pushHistory, setLayers, fabricCanvas: storeCanvas,
  } = useEditorStore();

  const getCanvas = useCallback(() => storeCanvas as unknown as fabric.Canvas | null, [storeCanvas]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    import('fabric').then(({ fabric }) => {
      const canvasEl = document.getElementById(containerId) as HTMLCanvasElement;
      if (!canvasEl) return;

      const canvas = new fabric.Canvas(canvasEl, {
        preserveObjectStacking: true,
        stopContextMenu: true,
        fireRightClick: true,
        selection: true,
        backgroundColor: '#ffffff',
        enableRetinaScaling: true,
      });

      const syncLayers = () => {
        const objects = canvas.getObjects();
        const layers = objects.map((obj: any, i: number) => ({
          id:      (obj as Record<string, unknown>).id as string ?? `obj-${i}`,
          name:    (obj as Record<string, unknown>).name as string ?? `${obj.type ?? 'Object'} ${i + 1}`,
          type:    obj.type ?? 'object',
          visible: obj.visible ?? true,
          locked:  !(obj.selectable ?? true),
          zIndex:  i,
        })).reverse();
        setLayers(layers);
      };

      const captureHistory = () => {
        if (!canvas) return;
        try {
          const json = JSON.stringify(canvas.toObject(['id', 'name', 'locked', 'visible']));
          pushHistory(json);
          syncLayers();
        } catch (e) {
          console.warn('captureHistory failed', e);
        }
      };

      canvas.on('selection:created', (e: any) => {
        const objs = e.selected ?? [];
        setActiveObjectId(objs.length === 1 ? ((objs[0] as Record<string, unknown>).id as string ?? null) : null);
        setSelectedIds(objs.map((o: any) => (o as Record<string, unknown>).id as string ?? '').filter(Boolean));
      });
      canvas.on('selection:updated', (e: any) => {
        const objs = e.selected ?? [];
        setActiveObjectId(objs.length === 1 ? ((objs[0] as Record<string, unknown>).id as string ?? null) : null);
        setSelectedIds(objs.map((o: any) => (o as Record<string, unknown>).id as string ?? '').filter(Boolean));
      });
      canvas.on('selection:cleared', () => {
        setActiveObjectId(null);
        setSelectedIds([]);
      });

      canvas.on('object:added',    captureHistory);
      canvas.on('object:modified', captureHistory);
      canvas.on('object:removed',  captureHistory);

      setFabricCanvas(canvas);

      return () => {
        canvas.dispose();
        setFabricCanvas(null);
      };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerId]);

  return { getCanvas, canvasRef };
}