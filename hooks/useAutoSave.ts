'use client';
import { useEffect, useCallback, useRef } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';

const DEBOUNCE_MS = 2500;

export function useAutoSave() {
  const { designId, isDirty, designTitle, fabricCanvas, markSaved, setIsSaving } = useEditorStore();
  const accessToken = useAuthStore((s) => s.accessToken);
  const addToast    = useUIStore((s) => s.addToast);
  const timerRef    = useRef<NodeJS.Timeout | null>(null);

  const save = useCallback(async () => {
    if (!designId || !isDirty || !accessToken || !fabricCanvas) return;

    const canvas = fabricCanvas as fabric.Canvas;
    setIsSaving(true);

    try {
      const canvasData = canvas.toJSON(['id', 'name', 'locked', 'visible']);
      canvas.discardActiveObject();
      const thumbnail = canvas.toDataURL({ format: 'jpeg', quality: 0.4, multiplier: 0.25 });

      const res = await fetch(`/api/designs/${designId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ canvasData, thumbnail, title: designTitle }),
      });

      if (res.ok) markSaved();
    } catch {
      addToast('Auto-save failed', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [designId, isDirty, accessToken, fabricCanvas, designTitle, markSaved, setIsSaving, addToast]);

  useEffect(() => {
    if (!isDirty) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(save, DEBOUNCE_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isDirty, save]);

  return { save };
}
