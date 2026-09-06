import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (options: { message: string; title?: string; type?: ToastType }) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ message, title, type = 'info' }: { message: string; title?: string; type?: ToastType }) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const newToast: Toast = { id, message, title, type };
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        removeToast(id);
      }, 4500);
    },
    [removeToast]
  );

  const success = useCallback((message: string, title?: string) => toast({ message, title, type: 'success' }), [toast]);
  const error = useCallback((message: string, title?: string) => toast({ message, title, type: 'error' }), [toast]);
  const info = useCallback((message: string, title?: string) => toast({ message, title, type: 'info' }), [toast]);
  const warning = useCallback((message: string, title?: string) => toast({ message, title, type: 'warning' }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-premium backdrop-blur-md transition-all duration-200 animate-in slide-in-from-bottom-5 ${
              t.type === 'success'
                ? 'bg-zinc-950 text-white border-zinc-800'
                : t.type === 'error'
                ? 'bg-zinc-950 text-rose-200 border-rose-900/50'
                : t.type === 'warning'
                ? 'bg-zinc-950 text-amber-200 border-amber-900/50'
                : 'bg-zinc-950 text-zinc-100 border-zinc-800'
            }`}
          >
            <div className="mt-0.5 flex-shrink-0">
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-zinc-400" />}
            </div>
            <div className="flex-1 text-sm">
              {t.title && <div className="font-semibold text-zinc-100 mb-0.5">{t.title}</div>}
              <div className="text-zinc-300 leading-relaxed">{t.message}</div>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-zinc-400 hover:text-white transition-colors p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
