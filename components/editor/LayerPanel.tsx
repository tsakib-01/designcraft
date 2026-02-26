'use client';
import { Eye, EyeOff, Lock, Unlock, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { useEditorStore, LayerItem } from '@/store/useEditorStore';
import { cn } from '@/lib/utils/helpers';

export default function LayerPanel() {
  const { layers, fabricCanvas, activeObjectId } = useEditorStore();

  const canvas = fabricCanvas as fabric.Canvas | null;

  const selectLayer = (layer: LayerItem) => {
    if (!canvas) return;
    const obj = canvas.getObjects().find((o) => (o as Record<string, unknown>).id === layer.id);
    if (obj) { canvas.setActiveObject(obj); canvas.renderAll(); }
  };

  const toggleVisible = (layer: LayerItem) => {
    if (!canvas) return;
    const obj = canvas.getObjects().find((o) => (o as Record<string, unknown>).id === layer.id);
    if (obj) { obj.set('visible', !obj.visible); canvas.renderAll(); }
  };

  const toggleLock = (layer: LayerItem) => {
    if (!canvas) return;
    const obj = canvas.getObjects().find((o) => (o as Record<string, unknown>).id === layer.id);
    if (obj) {
      const locked = !obj.selectable;
      obj.set({ selectable: locked, evented: locked });
      canvas.renderAll();
    }
  };

  const moveUp = (layer: LayerItem) => {
    if (!canvas) return;
    const obj = canvas.getObjects().find((o) => (o as Record<string, unknown>).id === layer.id);
    if (obj) { canvas.bringForward(obj); canvas.renderAll(); }
  };

  const moveDown = (layer: LayerItem) => {
    if (!canvas) return;
    const obj = canvas.getObjects().find((o) => (o as Record<string, unknown>).id === layer.id);
    if (obj) { canvas.sendBackward(obj); canvas.renderAll(); }
  };

  const deleteLayer = (layer: LayerItem) => {
    if (!canvas) return;
    const obj = canvas.getObjects().find((o) => (o as Record<string, unknown>).id === layer.id);
    if (obj) { canvas.remove(obj); canvas.renderAll(); }
  };

  return (
    <div className="w-56 bg-surface-100/90 backdrop-blur-md border border-surface-400 rounded-xl shadow-2xl overflow-hidden">
      <div className="px-3 py-2 border-b border-surface-300">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Layers</h3>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {layers.length === 0 ? (
          <p className="text-xs text-gray-600 text-center py-6">No layers yet</p>
        ) : (
          <ul className="py-1">
            {layers.map((layer) => {
              const isActive = activeObjectId === layer.id;
              return (
                <li
                  key={layer.id}
                  onClick={() => selectLayer(layer)}
                  className={cn(
                    'flex items-center gap-2 px-2 py-1.5 cursor-pointer transition-colors text-xs group',
                    isActive ? 'bg-brand-600/20 text-white' : 'text-gray-400 hover:bg-surface-300 hover:text-white'
                  )}
                >
                  <span className="flex-1 truncate capitalize">{layer.name}</span>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); moveUp(layer); }}    className="p-0.5 rounded hover:bg-surface-400"><ChevronUp   className="w-3 h-3" /></button>
                    <button onClick={(e) => { e.stopPropagation(); moveDown(layer); }}  className="p-0.5 rounded hover:bg-surface-400"><ChevronDown className="w-3 h-3" /></button>
                    <button onClick={(e) => { e.stopPropagation(); toggleVisible(layer); }} className="p-0.5 rounded hover:bg-surface-400">
                      {layer.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); toggleLock(layer); }} className="p-0.5 rounded hover:bg-surface-400">
                      {layer.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deleteLayer(layer); }} className="p-0.5 rounded hover:bg-red-500/20 hover:text-red-400">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
