'use client';
import { create } from 'zustand';
import { ToolType } from '@/types/canvas.types';

interface EditorState {
  // Canvas instance (not serializable - handle carefully)
  fabricCanvas:   unknown | null;

  // Design metadata
  designId:       string | null;
  designTitle:    string;
  dimensions:     { width: number; height: number };

  // Selection
  activeObjectId: string | null;
  selectedIds:    string[];

  // History
  history:        string[];
  historyIndex:   number;

  // Tools & view
  activeTool:     ToolType;
  zoom:           number;

  // State flags
  isDirty:        boolean;
  isSaving:       boolean;
  isLoading:      boolean;

  // Layer panel
  layers:         LayerItem[];

  // Actions
  setFabricCanvas:   (canvas: unknown) => void;
  setDesign:         (id: string, title: string, dims: { width: number; height: number }) => void;
  setDesignTitle:    (title: string) => void;
  setActiveObjectId: (id: string | null) => void;
  setSelectedIds:    (ids: string[]) => void;
  pushHistory:       (snapshot: string) => void;
  undo:              () => string | null;
  redo:              () => string | null;
  setActiveTool:     (tool: ToolType) => void;
  setZoom:           (zoom: number) => void;
  markDirty:         () => void;
  markSaved:         () => void;
  setIsSaving:       (saving: boolean) => void;
  setIsLoading:      (loading: boolean) => void;
  setLayers:         (layers: LayerItem[]) => void;
  reset:             () => void;
}

export interface LayerItem {
  id:      string;
  name:    string;
  type:    string;
  visible: boolean;
  locked:  boolean;
  zIndex:  number;
}

const MAX_HISTORY = 50;

export const useEditorStore = create<EditorState>((set, get) => ({
  fabricCanvas:   null,
  designId:       null,
  designTitle:    'Untitled Design',
  dimensions:     { width: 1080, height: 1080 },
  activeObjectId: null,
  selectedIds:    [],
  history:        [],
  historyIndex:   -1,
  activeTool:     'select',
  zoom:           1,
  isDirty:        false,
  isSaving:       false,
  isLoading:      false,
  layers:         [],

  setFabricCanvas: (canvas) => set({ fabricCanvas: canvas }),

  setDesign: (designId, designTitle, dimensions) =>
    set({ designId, designTitle, dimensions, isDirty: false, history: [], historyIndex: -1 }),

  setDesignTitle: (designTitle) => set({ designTitle, isDirty: true }),

  setActiveObjectId: (activeObjectId) => set({ activeObjectId }),
  setSelectedIds:    (selectedIds)    => set({ selectedIds }),

  pushHistory: (snapshot) => {
    const { history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(snapshot);
    if (newHistory.length > MAX_HISTORY) newHistory.shift();
    set({ history: newHistory, historyIndex: newHistory.length - 1, isDirty: true });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return null;
    const newIndex = historyIndex - 1;
    set({ historyIndex: newIndex, isDirty: true });
    return history[newIndex];
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return null;
    const newIndex = historyIndex + 1;
    set({ historyIndex: newIndex, isDirty: true });
    return history[newIndex];
  },

  setActiveTool: (activeTool) => set({ activeTool }),
  setZoom:       (zoom)       => set({ zoom }),
  markDirty:     ()           => set({ isDirty: true }),
  markSaved:     ()           => set({ isDirty: false, isSaving: false }),
  setIsSaving:   (isSaving)   => set({ isSaving }),
  setIsLoading:  (isLoading)  => set({ isLoading }),
  setLayers:     (layers)     => set({ layers }),

  reset: () => set({
    fabricCanvas: null, designId: null, designTitle: 'Untitled Design',
    activeObjectId: null, selectedIds: [], history: [], historyIndex: -1,
    activeTool: 'select', zoom: 1, isDirty: false, isSaving: false, layers: [],
  }),
}));
