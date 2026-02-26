'use client';
import { useEffect, useState } from 'react';
import { Trash2, Lock, Unlock, Eye, EyeOff, FlipHorizontal, FlipVertical, AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic, Underline } from 'lucide-react';
import { useEditorStore } from '@/store/useEditorStore';
import ColorPicker from '@/components/ui/ColorPicker';
import { cn } from '@/lib/utils/helpers';

export default function PropertyPanel() {
  const { fabricCanvas, activeObjectId } = useEditorStore();
  const [props, setProps] = useState<Record<string, unknown>>({});
  const [refreshKey, setRefreshKey] = useState(0);

  const canvas = fabricCanvas as fabric.Canvas | null;

  const getActive = (): fabric.Object | null => {
    if (!canvas) return null;
    return canvas.getActiveObject() ?? null;
  };

  // Sync props from active object
  useEffect(() => {
    const obj = getActive();
    if (!obj) { setProps({}); return; }

    const p: Record<string, unknown> = {
      type:        obj.type,
      left:        Math.round(obj.left ?? 0),
      top:         Math.round(obj.top  ?? 0),
      width:       Math.round((obj.width  ?? 0) * (obj.scaleX ?? 1)),
      height:      Math.round((obj.height ?? 0) * (obj.scaleY ?? 1)),
      angle:       Math.round(obj.angle ?? 0),
      opacity:     Math.round((obj.opacity ?? 1) * 100),
      fill:        (obj.fill as string) ?? '#000000',
      stroke:      (obj.stroke as string) ?? 'transparent',
      strokeWidth: obj.strokeWidth ?? 0,
      visible:     obj.visible ?? true,
      locked:      !(obj.selectable ?? true),
    };

    if (obj.type === 'i-text' || obj.type === 'text') {
      const t = obj as fabric.IText;
      p.fontSize    = t.fontSize;
      p.fontFamily  = t.fontFamily;
      p.fontWeight  = t.fontWeight;
      p.fontStyle   = t.fontStyle;
      p.textAlign   = t.textAlign;
      p.underline   = t.underline;
      p.linethrough = t.linethrough;
    }

    setProps(p);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeObjectId, refreshKey]);

  const update = (key: string, value: unknown) => {
    const obj = getActive();
    if (!obj || !canvas) return;
    obj.set(key as keyof fabric.Object, value as never);
    canvas.renderAll();
    setRefreshKey((k) => k + 1);
  };

  const updateSize = (dim: 'width' | 'height', val: number) => {
    const obj = getActive();
    if (!obj || !canvas) return;
    const scale = dim === 'width'
      ? val / (obj.width ?? 1)
      : val / (obj.height ?? 1);
    obj.set(dim === 'width' ? 'scaleX' : 'scaleY', scale);
    canvas.renderAll();
    setRefreshKey((k) => k + 1);
  };

  const deleteObject = () => {
    const obj = getActive();
    if (!obj || !canvas) return;
    canvas.remove(obj);
    canvas.renderAll();
  };

  const toggleLock = () => {
    const obj = getActive();
    if (!obj || !canvas) return;
    const locked = obj.selectable === false;
    obj.set({ selectable: locked, evented: locked, lockMovementX: !locked, lockMovementY: !locked });
    canvas.renderAll();
    setRefreshKey((k) => k + 1);
  };

  const toggleVisible = () => {
    const obj = getActive();
    if (!obj || !canvas) return;
    obj.set('visible', !obj.visible);
    canvas.renderAll();
    setRefreshKey((k) => k + 1);
  };

  if (!activeObjectId || !Object.keys(props).length) {
    return (
      <div className="w-60 flex-shrink-0 bg-surface-100 border-l border-surface-300 flex flex-col">
        <div className="p-4 border-b border-surface-300">
          <h3 className="text-sm font-semibold text-gray-400">Properties</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-gray-600 text-center px-4">Select an element to edit its properties</p>
        </div>
      </div>
    );
  }

  const isText = props.type === 'i-text' || props.type === 'text';

  return (
    <div className="w-60 flex-shrink-0 bg-surface-100 border-l border-surface-300 flex flex-col overflow-hidden">
      <div className="p-3 border-b border-surface-300 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-400 capitalize">{String(props.type)} Properties</h3>
        <div className="flex items-center gap-1">
          <button onClick={toggleVisible} className="icon-btn" title={props.visible ? 'Hide' : 'Show'}>
            {props.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
          <button onClick={toggleLock} className="icon-btn" title={props.locked ? 'Unlock' : 'Lock'}>
            {props.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>
          <button onClick={deleteObject} className="icon-btn text-red-400 hover:text-red-300" title="Delete">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Position & Size */}
        <div className="panel-section">
          <p className="panel-label">Position & Size</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'left', label: 'X' }, { key: 'top', label: 'Y' },
              { key: 'width', label: 'W' }, { key: 'height', label: 'H' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                <input
                  type="number"
                  value={props[key] as number ?? 0}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    if (key === 'width' || key === 'height') updateSize(key, val);
                    else update(key, val);
                  }}
                  className="w-full bg-surface-200 border border-surface-500 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Rotation & Opacity */}
        <div className="panel-section">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Rotation (°)</label>
              <input
                type="number"
                value={props.angle as number ?? 0}
                onChange={(e) => update('angle', parseInt(e.target.value) || 0)}
                className="w-full bg-surface-200 border border-surface-500 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Opacity (%)</label>
              <input
                type="number"
                min={0} max={100}
                value={props.opacity as number ?? 100}
                onChange={(e) => update('opacity', (parseInt(e.target.value) || 0) / 100)}
                className="w-full bg-surface-200 border border-surface-500 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>
          </div>
          <div className="mt-2">
            <label className="text-xs text-gray-500 mb-1 block">Opacity</label>
            <input
              type="range" min={0} max={100}
              value={props.opacity as number ?? 100}
              onChange={(e) => update('opacity', parseInt(e.target.value) / 100)}
              className="w-full"
            />
          </div>
        </div>

        {/* Fill & Stroke */}
        {props.type !== 'image' && (
          <div className="panel-section space-y-3">
            <p className="panel-label">Style</p>
            <ColorPicker
              label="Fill"
              value={(props.fill as string) || '#000000'}
              onChange={(c) => update('fill', c)}
            />
            <ColorPicker
              label="Stroke"
              value={(props.stroke as string) || '#000000'}
              onChange={(c) => update('stroke', c)}
            />
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Stroke Width</label>
              <input
                type="range" min={0} max={20}
                value={props.strokeWidth as number ?? 0}
                onChange={(e) => update('strokeWidth', parseInt(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-gray-500 font-mono">{String(props.strokeWidth)}px</span>
            </div>
          </div>
        )}

        {/* Text properties */}
        {isText && (
          <div className="panel-section space-y-3">
            <p className="panel-label">Typography</p>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Font</label>
              <select
                value={String(props.fontFamily ?? 'serif')}
                onChange={(e) => update('fontFamily', e.target.value)}
                className="w-full bg-surface-200 border border-surface-500 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500"
              >
                {['Arial','Georgia','Times New Roman','Courier New','Verdana','Trebuchet MS','Impact','Comic Sans MS'].map((f) => (
                  <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Font Size</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={props.fontSize as number ?? 16}
                  onChange={(e) => update('fontSize', parseInt(e.target.value) || 16)}
                  className="w-full bg-surface-200 border border-surface-500 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                />
                <span className="text-xs text-gray-500">px</span>
              </div>
            </div>

            {/* Text format buttons */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Format</label>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => update('fontWeight', props.fontWeight === 'bold' ? 'normal' : 'bold')}
                  className={cn('icon-btn', props.fontWeight === 'bold' && 'icon-btn-active')}
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => update('fontStyle', props.fontStyle === 'italic' ? 'normal' : 'italic')}
                  className={cn('icon-btn', props.fontStyle === 'italic' && 'icon-btn-active')}
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => update('underline', !props.underline)}
                  className={cn('icon-btn', props.underline && 'icon-btn-active')}
                >
                  <Underline className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Text alignment */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Alignment</label>
              <div className="flex items-center gap-1">
                {[
                  { value: 'left',    icon: AlignLeft    },
                  { value: 'center',  icon: AlignCenter  },
                  { value: 'right',   icon: AlignRight   },
                  { value: 'justify', icon: AlignJustify },
                ].map(({ value, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => update('textAlign', value)}
                    className={cn('icon-btn', props.textAlign === value && 'icon-btn-active')}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            </div>

            <ColorPicker
              label="Text Color"
              value={(props.fill as string) || '#000000'}
              onChange={(c) => update('fill', c)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
