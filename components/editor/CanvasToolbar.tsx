'use client';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, MousePointer2, Type, Square, Circle,
  Triangle, Minus, Image, Hand, Undo2, Redo2,
  Download, Save, Layers, ZoomIn, ZoomOut, RotateCcw,
  Loader2, Check, AlertCircle
} from 'lucide-react';
import { useEditorStore } from '@/store/useEditorStore';
import { useUIStore } from '@/store/useUIStore';
import { useAutoSave } from '@/hooks/useAutoSave';
import { cn } from '@/lib/utils/helpers';
import { ToolType } from '@/types/canvas.types';
import { useState } from 'react';

const tools: { type: ToolType; icon: React.ElementType; label: string }[] = [
  { type: 'select',   icon: MousePointer2, label: 'Select (V)'  },
  { type: 'pan',      icon: Hand,          label: 'Pan (H)'     },
  { type: 'text',     icon: Type,          label: 'Text (T)'    },
  { type: 'rect',     icon: Square,        label: 'Rectangle (R)' },
  { type: 'circle',   icon: Circle,        label: 'Circle (C)'  },
  { type: 'triangle', icon: Triangle,      label: 'Triangle'    },
  { type: 'line',     icon: Minus,         label: 'Line (L)'    },
  { type: 'image',    icon: Image,         label: 'Image (I)'   },
];

export default function CanvasToolbar() {
  const {
    designTitle, setDesignTitle, activeTool, setActiveTool,
    zoom, setZoom, isSaving, isDirty,
    undo, redo, historyIndex, history, fabricCanvas,
  } = useEditorStore();
  const { openExportModal, toggleLayerPanel } = useUIStore();
  const { save } = useAutoSave();
  const router   = useRouter();
  const [editingTitle, setEditingTitle] = useState(false);

  const handleToolClick = (tool: ToolType) => {
    setActiveTool(tool);
    if (!fabricCanvas) return;
    const canvas = fabricCanvas as fabric.Canvas;

    if (tool === 'pan') {
      canvas.isDrawingMode = false;
      canvas.selection     = false;
      canvas.defaultCursor = 'grab';
    } else {
      canvas.isDrawingMode = false;
      canvas.selection     = true;
      canvas.defaultCursor = 'default';
    }
  };

  const handleUndo = () => {
    if (!fabricCanvas) return;
    const snapshot = undo();
    if (snapshot) {
      const canvas = fabricCanvas as fabric.Canvas;
      canvas.loadFromJSON(JSON.parse(snapshot), () => canvas.renderAll());
    }
  };

  const handleRedo = () => {
    if (!fabricCanvas) return;
    const snapshot = redo();
    if (snapshot) {
      const canvas = fabricCanvas as fabric.Canvas;
      canvas.loadFromJSON(JSON.parse(snapshot), () => canvas.renderAll());
    }
  };

  return (
    <div className="flex items-center h-14 bg-surface-100 border-b border-surface-300 px-3 gap-3 flex-shrink-0 z-10">
      {/* Back */}
      <button
        onClick={() => router.push('/dashboard')}
        className="icon-btn flex-shrink-0"
        title="Back to Dashboard"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-surface-400" />

      {/* Title */}
      <div className="flex items-center gap-2 min-w-0">
        {editingTitle ? (
          <input
            autoFocus
            value={designTitle}
            onChange={(e) => setDesignTitle(e.target.value)}
            onBlur={() => { setEditingTitle(false); save(); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { setEditingTitle(false); save(); } }}
            className="bg-surface-200 border border-brand-500 rounded px-2 py-1 text-sm text-white focus:outline-none font-medium max-w-[180px]"
          />
        ) : (
          <button
            onClick={() => setEditingTitle(true)}
            className="text-sm font-medium text-white hover:text-brand-300 transition-colors truncate max-w-[180px]"
            title="Click to rename"
          >
            {designTitle}
          </button>
        )}

        {/* Save status */}
        <span className="flex-shrink-0">
          {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-500" />}
          {!isSaving && !isDirty && <Check className="w-3.5 h-3.5 text-green-500" />}
          {!isSaving && isDirty && <AlertCircle className="w-3.5 h-3.5 text-amber-500" />}
        </span>
      </div>

      <div className="w-px h-6 bg-surface-400" />

      {/* Tools */}
      <div className="flex items-center gap-0.5">
        {tools.map(({ type, icon: Icon, label }) => (
          <button
            key={type}
            onClick={() => handleToolClick(type)}
            title={label}
            className={cn('icon-btn', activeTool === type && 'icon-btn-active')}
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-surface-400" />

      {/* Undo/Redo */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={handleUndo}
          disabled={historyIndex <= 0}
          title="Undo (Ctrl+Z)"
          className="icon-btn disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleRedo}
          disabled={historyIndex >= history.length - 1}
          title="Redo (Ctrl+Y)"
          className="icon-btn disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-6 bg-surface-400" />

      {/* Zoom */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
          className="icon-btn"
          title="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(1)}
          className="text-xs text-gray-400 hover:text-white transition-colors w-12 text-center font-mono"
          title="Reset zoom"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={() => setZoom(Math.min(5, zoom + 0.1))}
          className="icon-btn"
          title="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <button onClick={toggleLayerPanel} className="icon-btn" title="Toggle Layers">
          <Layers className="w-4 h-4" />
        </button>
        <button onClick={save} className="icon-btn" title="Save (Ctrl+S)">
          <Save className="w-4 h-4" />
        </button>
        <button
          onClick={openExportModal}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors shadow-glow-sm hover:shadow-glow-md"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>
    </div>
  );
}
