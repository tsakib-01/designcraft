'use client';
import { useState, useRef, useEffect } from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import { cn } from '@/lib/utils/helpers';

interface ColorPickerProps {
  value:    string;
  onChange: (color: string) => void;
  label?:   string;
}

export default function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {label && <label className="block text-xs text-gray-400 mb-1">{label}</label>}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-200 border border-surface-500 hover:border-surface-400 transition-colors w-full"
      >
        <span
          className="w-5 h-5 rounded-md border border-white/20 flex-shrink-0"
          style={{ backgroundColor: value }}
        />
        <span className="text-sm text-gray-300 font-mono uppercase flex-1 text-left">{value}</span>
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 left-0 z-50 bg-surface-100 border border-surface-400 rounded-xl p-3 shadow-2xl animate-fade-in">
          <HexColorPicker color={value} onChange={onChange} className="!w-48" />
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-gray-500 font-mono">#</span>
            <HexColorInput
              color={value}
              onChange={onChange}
              className="flex-1 bg-surface-200 border border-surface-500 rounded px-2 py-1 text-sm text-white font-mono focus:outline-none focus:border-brand-500 uppercase"
            />
          </div>

          {/* Quick swatches */}
          <div className="mt-2 flex flex-wrap gap-1">
            {['#000000','#ffffff','#ef4444','#f97316','#eab308','#22c55e','#06b6d4','#6366f1','#ec4899','transparent'].map((c) => (
              <button
                key={c}
                onClick={() => onChange(c)}
                className={cn(
                  'w-5 h-5 rounded-md border border-white/20 hover:scale-110 transition-transform',
                  c === 'transparent' && 'bg-[repeating-conic-gradient(#666_0%_25%,transparent_0%_50%)] bg-[length:8px_8px]'
                )}
                style={{ backgroundColor: c !== 'transparent' ? c : undefined }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
