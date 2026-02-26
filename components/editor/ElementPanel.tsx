'use client';
import { useState, useRef } from 'react';
import {
  Type, Square, Circle, Triangle, Minus, Image as ImageIcon,
  Star, Heart, Search, Upload, Layers, Smile
} from 'lucide-react';
import { useEditorStore } from '@/store/useEditorStore';
import { useUIStore } from '@/store/useUIStore';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils/helpers';

const PANEL_TABS = [
  { id: 'elements',  label: 'Elements', icon: Layers  },
  { id: 'text',      label: 'Text',     icon: Type    },
  { id: 'shapes',    label: 'Shapes',   icon: Square  },
  { id: 'uploads',   label: 'Uploads',  icon: Upload  },
] as const;

const TEXT_STYLES = [
  { label: 'Heading',    fontSize: 48, fontWeight: 'bold',   text: 'Add a heading' },
  { label: 'Subheading', fontSize: 32, fontWeight: '600',    text: 'Add a subheading' },
  { label: 'Body',       fontSize: 18, fontWeight: 'normal', text: 'Add body text' },
  { label: 'Caption',    fontSize: 13, fontWeight: 'normal', text: 'Add a caption' },
];

const SHAPES = [
  { type: 'rect',     icon: Square,   label: 'Rectangle' },
  { type: 'circle',   icon: Circle,   label: 'Circle'    },
  { type: 'triangle', icon: Triangle, label: 'Triangle'  },
  { type: 'line',     icon: Minus,    label: 'Line'      },
  { type: 'star',     icon: Star,     label: 'Star'      },
];

export default function ElementPanel() {
  const { fabricCanvas, setActiveTool } = useEditorStore();
  const { leftPanelTab, setLeftPanelTab } = useUIStore();
  const { accessToken } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [userImages, setUserImages] = useState<{ url: string; name: string }[]>([]);

  const getCanvas = () => fabricCanvas as fabric.Canvas | null;

  const addText = async (style: typeof TEXT_STYLES[number]) => {
    const canvas = getCanvas();
    if (!canvas) return;
    const { fabric } = await import('fabric');
    const id = Math.random().toString(36).slice(2);
    const text = new fabric.IText(style.text, {
      left: 100, top: 100,
      fontFamily: 'Georgia, serif',
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      fill: '#000000',
 const addText = async (style: typeof TEXT_STYLES[number]) => {
  const canvas = getCanvas();
  if (!canvas) return;
  const { fabric } = await import('fabric');
  const id = Math.random().toString(36).slice(2);
  const text = new fabric.IText(style.text, {
    left: 100, top: 100,
    fontFamily: 'Georgia, serif',
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    fill: '#000000',
  } as unknown as fabric.IText);
  (text as unknown as Record<string, unknown>).id   = id;
  (text as unknown as Record<string, unknown>).name = `Text`;
  canvas.add(text);
  canvas.setActiveObject(text);
  canvas.renderAll();
  setActiveTool('select');
};
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    setActiveTool('select');
  };

  const addShape = async (type: string) => {
    const canvas = getCanvas();
    if (!canvas) return;
    const { fabric } = await import('fabric');
    const id = Math.random().toString(36).slice(2);
    let shape: fabric.Object;

    const commonProps = {
      left: 150, top: 150,
      fill: '#6366f1',
      stroke: 'transparent',
      strokeWidth: 0,
    };

    if (type === 'rect')     shape = new fabric.Rect({ ...commonProps, width: 200, height: 150 });
    else if (type === 'circle') shape = new fabric.Ellipse({ ...commonProps, rx: 100, ry: 100 });
    else if (type === 'triangle') shape = new fabric.Triangle({ ...commonProps, width: 200, height: 180 });
    else if (type === 'line') {
      shape = new fabric.Line([50, 100, 350, 100], { stroke: '#6366f1', strokeWidth: 3, left: 150, top: 200 });
    } else {
      // Star shape using polygon
      const points = [];
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? 80 : 40;
        const a = (Math.PI / 5) * i - Math.PI / 2;
        points.push({ x: 100 + r * Math.cos(a), y: 100 + r * Math.sin(a) });
      }
      shape = new fabric.Polygon(points, { ...commonProps, left: 150, top: 150 });
    }

    (shape as Record<string, unknown>).id   = id;
    (shape as Record<string, unknown>).name = type.charAt(0).toUpperCase() + type.slice(1);
    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.renderAll();
    setActiveTool('select');
  };

  const handleImageUpload = async (file: File) => {
    if (!accessToken) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name);
      formData.append('type', 'image');

      const res  = await fetch('/api/assets/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setUserImages((prev) => [{ url: data.data.url, name: data.data.name }, ...prev]);
      }
    } finally { setUploading(false); }
  };

  const addImageToCanvas = async (url: string) => {
    const canvas = getCanvas();
    if (!canvas) return;
    const { fabric } = await import('fabric');
    const id = Math.random().toString(36).slice(2);
    const fullUrl = url.startsWith('/') ? `${window.location.origin}${url}` : url;
    fabric.Image.fromURL(fullUrl, (img: fabric.Image) => {
      img.scaleToWidth(Math.min(300, canvas.getWidth() / 2));
      (img as Record<string, unknown>).id   = id;
      (img as Record<string, unknown>).name = 'Image';
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    }, { crossOrigin: 'anonymous' } as Record<string, unknown>);
    setActiveTool('select');
  };

  return (
    <div className="w-64 flex-shrink-0 bg-surface-100 border-r border-surface-300 flex flex-col overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-surface-300 overflow-x-auto">
        {PANEL_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setLeftPanelTab(id)}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors border-b-2 min-w-0',
              leftPanelTab === id
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-gray-500 hover:text-white'
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* Text tab */}
        {leftPanelTab === 'text' && (
          <div className="space-y-2">
            <p className="panel-label">Text Styles</p>
            {TEXT_STYLES.map((style) => (
              <button
                key={style.label}
                onClick={() => addText(style)}
                className="w-full text-left px-3 py-3 rounded-xl bg-surface-200 hover:bg-surface-300 border border-surface-400 hover:border-surface-500 transition-all"
              >
                <span
                  className="block text-white"
                  style={{ fontSize: `${Math.min(style.fontSize, 24)}px`, fontWeight: style.fontWeight }}
                >
                  {style.label}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Shapes tab */}
        {leftPanelTab === 'shapes' && (
          <div>
            <p className="panel-label">Basic Shapes</p>
            <div className="grid grid-cols-3 gap-2">
              {SHAPES.map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => addShape(type)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-surface-200 hover:bg-surface-300 border border-surface-400 hover:border-brand-500/50 transition-all group"
                  title={label}
                >
                  <Icon className="w-5 h-5 text-gray-400 group-hover:text-brand-400 transition-colors" />
                  <span className="text-xs text-gray-500 group-hover:text-white">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Uploads tab */}
        {leftPanelTab === 'uploads' && (
          <div className="space-y-4">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                  e.target.value = '';
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed border-surface-500 hover:border-brand-500/50 hover:bg-surface-200 transition-all"
              >
                <Upload className="w-6 h-6 text-gray-500" />
                <span className="text-sm text-gray-400">{uploading ? 'Uploading...' : 'Click to upload image'}</span>
                <span className="text-xs text-gray-600">PNG, JPG, WebP up to 10MB</span>
              </button>
            </div>

            {userImages.length > 0 && (
              <div>
                <p className="panel-label">Your Uploads</p>
                <div className="grid grid-cols-2 gap-2">
                  {userImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => addImageToCanvas(img.url)}
                      className="aspect-square rounded-lg overflow-hidden bg-surface-300 hover:ring-2 hover:ring-brand-500 transition-all"
                    >
                      <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Elements tab */}
        {leftPanelTab === 'elements' && (
          <div className="space-y-4">
            <div>
              <p className="panel-label">Quick Add</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Text Box', action: () => addText(TEXT_STYLES[2]), icon: Type },
                  { label: 'Rectangle', action: () => addShape('rect'), icon: Square },
                  { label: 'Circle', action: () => addShape('circle'), icon: Circle },
                  { label: 'Triangle', action: () => addShape('triangle'), icon: Triangle },
                ].map(({ label, action, icon: Icon }) => (
                  <button
                    key={label}
                    onClick={action}
                    className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-200 hover:bg-surface-300 border border-surface-400 hover:border-brand-500/50 transition-all text-sm text-gray-400 hover:text-white"
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="panel-label text-xs">Colors</p>
              <div className="flex flex-wrap gap-2">
                {['#ef4444','#f97316','#eab308','#22c55e','#06b6d4','#6366f1','#ec4899','#8b5cf6','#000000','#ffffff'].map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      const canvas = getCanvas();
                      if (!canvas) return;
                      const active = canvas.getActiveObject();
                      if (active) { active.set('fill', color); canvas.renderAll(); }
                    }}
                    title={color}
                    className="w-7 h-7 rounded-full border-2 border-surface-500 hover:border-white hover:scale-110 transition-all"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
