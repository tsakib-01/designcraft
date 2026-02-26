'use client';
import { useUIStore } from '@/store/useUIStore';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

const icons = {
  success: CheckCircle,
  error:   XCircle,
  info:    Info,
  warning: AlertTriangle,
};

const colors = {
  success: 'border-green-500/50 bg-green-500/10 text-green-400',
  error:   'border-red-500/50   bg-red-500/10   text-red-400',
  info:    'border-blue-500/50  bg-blue-500/10  text-blue-400',
  warning: 'border-amber-500/50 bg-amber-500/10 text-amber-400',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md pointer-events-auto',
              'animate-slide-in-left shadow-xl max-w-sm',
              colors[toast.type]
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="flex-shrink-0 opacity-60 hover:opacity-100">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
