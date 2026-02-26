'use client';
import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id:      string;
  message: string;
  type:    ToastType;
}

interface UIState {
  // Panels
  leftPanelTab:   'elements' | 'templates' | 'uploads' | 'text' | 'shapes';
  showRightPanel: boolean;
  showLayerPanel: boolean;

  // Modals
  exportModalOpen:       boolean;
  newDesignModalOpen:    boolean;
  deleteConfirmId:       string | null;
  templatePreviewId:     string | null;

  // Toasts
  toasts: Toast[];

  // Actions
  setLeftPanelTab:       (tab: UIState['leftPanelTab']) => void;
  toggleRightPanel:      () => void;
  toggleLayerPanel:      () => void;
  openExportModal:       () => void;
  closeExportModal:      () => void;
  openNewDesignModal:    () => void;
  closeNewDesignModal:   () => void;
  setDeleteConfirmId:    (id: string | null) => void;
  setTemplatePreviewId:  (id: string | null) => void;
  addToast:              (message: string, type?: ToastType) => void;
  removeToast:           (id: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  leftPanelTab:       'elements',
  showRightPanel:     true,
  showLayerPanel:     false,
  exportModalOpen:    false,
  newDesignModalOpen: false,
  deleteConfirmId:    null,
  templatePreviewId:  null,
  toasts:             [],

  setLeftPanelTab:      (leftPanelTab)      => set({ leftPanelTab }),
  toggleRightPanel:     ()                  => set((s) => ({ showRightPanel: !s.showRightPanel })),
  toggleLayerPanel:     ()                  => set((s) => ({ showLayerPanel: !s.showLayerPanel })),
  openExportModal:      ()                  => set({ exportModalOpen: true }),
  closeExportModal:     ()                  => set({ exportModalOpen: false }),
  openNewDesignModal:   ()                  => set({ newDesignModalOpen: true }),
  closeNewDesignModal:  ()                  => set({ newDesignModalOpen: false }),
  setDeleteConfirmId:   (deleteConfirmId)   => set({ deleteConfirmId }),
  setTemplatePreviewId: (templatePreviewId) => set({ templatePreviewId }),

  addToast: (message, type = 'info') => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => get().removeToast(id), 4000);
  },

  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
