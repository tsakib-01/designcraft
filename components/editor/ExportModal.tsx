'use client';
import { useState } from 'react';
import { Download, FileImage, FileText, ImageIcon } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useUIStore } from '@/store/useUIStore';
import { useExport } from '@/hooks/useExport';
import { ExportFormat } from '@/types/design.types';
import { cn } from '@/lib/utils/helpers';

const FORMATS: { value: ExportFormat; label: string; desc: string; icon: React.ElementType }[] = [
  { value: 'png', label: 'PNG',  desc: 'Lossless, supports transparency', icon: ImageIcon  },
  { value: 'jpg', label: 'JPG',  desc: 'Smaller file, no transparency',    icon: FileImage },
  { value: 'pdf', label: 'PDF',  desc: 'Print-ready document format',       icon: FileText  },
];

export default function ExportModal() {
  const { exportModalOpen, closeExportModal } = useUIStore();
  const { exportDesign } = useExport();

  const [format, setFormat]       = useState<ExportFormat>('png');
  const [quality, setQuality]     = useState(95);
  const [multiplier, setMultiplier] = useState(2);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    await exportDesign(format, quality / 100, multiplier);
    setExporting(false);
    closeExportModal();
  };

  return (
    <Modal open={exportModalOpen} onClose={closeExportModal} title="Export Design" size="md">
      <div className="space-y-5">
        {/* Format selection */}
        <div>
          <label className="panel-label">File Format</label>
          <div className="grid grid-cols-3 gap-2">
            {FORMATS.map(({ value, label, desc, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setFormat(value)}
                className={cn(
                  'flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-center',
                  format === value
                    ? 'border-brand-500 bg-brand-600/10 text-white'
                    : 'border-surface-500 text-gray-400 hover:border-surface-400 hover:text-white'
                )}
              >
                <Icon className="w-6 h-6" />
                <span className="text-sm font-semibold">{label}</span>
                <span className="text-xs opacity-60 leading-tight">{desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quality (only for JPG) */}
        {format === 'jpg' && (
          <div>
            <label className="panel-label">Quality: {quality}%</label>
            <input
              type="range" min={10} max={100}
              value={quality}
              onChange={(e) => setQuality(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Smaller file</span>
              <span>Better quality</span>
            </div>
          </div>
        )}

        {/* Scale (PNG/JPG only) */}
        {format !== 'pdf' && (
          <div>
            <label className="panel-label">Resolution Scale</label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((m) => (
                <button
                  key={m}
                  onClick={() => setMultiplier(m)}
                  className={cn(
                    'py-2 rounded-lg border text-sm font-medium transition-all',
                    multiplier === m
                      ? 'border-brand-500 bg-brand-600/10 text-white'
                      : 'border-surface-500 text-gray-400 hover:text-white'
                  )}
                >
                  {m}x {m === 1 ? '(Normal)' : m === 2 ? '(Retina)' : '(High)'}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" className="flex-1" onClick={closeExportModal}>Cancel</Button>
          <Button className="flex-1" onClick={handleExport} loading={exporting}>
            <Download className="w-4 h-4" />
            Export {format.toUpperCase()}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
