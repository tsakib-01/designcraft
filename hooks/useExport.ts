'use client';
import { useCallback } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { useUIStore } from '@/store/useUIStore';
import { ExportFormat } from '@/types/design.types';

export function useExport() {
  const { fabricCanvas, designTitle } = useEditorStore();
  const addToast = useUIStore((s) => s.addToast);

  const exportDesign = useCallback(async (format: ExportFormat, quality = 1, multiplier = 2) => {
    if (!fabricCanvas) return;
    const canvas = fabricCanvas as fabric.Canvas;

    try {
      const activeObj = canvas.getActiveObject();
      canvas.discardActiveObject();
      canvas.renderAll();

      const filename = designTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'design';

      if (format === 'png' || format === 'jpg') {
        const dataUrl = canvas.toDataURL({
          format: format === 'jpg' ? 'jpeg' : 'png',
          quality,
          multiplier,
        });
        downloadDataUrl(dataUrl, `${filename}.${format}`);
      }

      if (format === 'pdf') {
        const { jsPDF } = await import('jspdf');
        const width  = canvas.width  ?? 800;
        const height = canvas.height ?? 600;
        const isLandscape = width > height;
        const pdf = new jsPDF({
          orientation: isLandscape ? 'l' : 'p',
          unit: 'px',
          format: [width, height],
          hotfixes: ['px_scaling'],
        });
        const imgData = canvas.toDataURL({ format: 'jpeg', quality: 0.95, multiplier: 1 });
        pdf.addImage(imgData, 'JPEG', 0, 0, width, height);
        pdf.save(`${filename}.pdf`);
      }

      if (activeObj) canvas.setActiveObject(activeObj);
      addToast(`Exported as ${format.toUpperCase()} successfully!`, 'success');
    } catch (err) {
      console.error('[EXPORT]', err);
      addToast('Export failed. Please try again.', 'error');
    }
  }, [fabricCanvas, designTitle, addToast]);

  return { exportDesign };
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href     = dataUrl;
  link.download = filename;
  link.click();
}