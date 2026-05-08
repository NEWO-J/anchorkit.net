import React from 'react';

type ToastType = 'success' | 'error';
type ToastItem = { id: number; message: string; type: ToastType };
type ToastContextValue = { showToast: (message: string, type?: ToastType) => void };

const ToastContext = React.createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() { return React.useContext(ToastContext); }

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const counter = React.useRef(0);

  const showToast = React.useCallback((message: string, type: ToastType = 'success') => {
    const id = ++counter.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`flex items-center gap-2.5 px-4 py-3 border shadow-2xl pointer-events-auto
              ${t.type === 'success'
                ? 'bg-[#06003a] border-white/[0.12] text-white/80'
                : 'bg-[#06003a] border-red-500/30 text-red-400/80'}`}
          >
            {t.type === 'success' ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-400/70 shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400/70 shrink-0">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            )}
            <span className="font-['DM_Sans',sans-serif] text-sm">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
