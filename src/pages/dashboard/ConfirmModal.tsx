import React from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  title: string;
  body: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({ title, body, confirmLabel = 'Confirm', danger = false, onConfirm, onCancel }: Props) {
  const { t } = useTranslation();
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-[#030028]/80 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-[#07003d] border border-white/[0.10] p-6 w-full max-w-sm mx-4 shadow-2xl">
        <h2 className="font-['DM_Sans',sans-serif] font-bold text-base text-white mb-2">{title}</h2>
        <p className="font-['DM_Sans',sans-serif] text-sm text-white/50 mb-6 leading-relaxed">{body}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 font-['DM_Sans',sans-serif] text-sm text-white/40 hover:text-white/70 border border-white/[0.08] hover:bg-white/[0.03] transition-colors cursor-pointer"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 font-['DM_Sans',sans-serif] text-sm border transition-colors cursor-pointer
              ${danger
                ? 'text-red-400/80 hover:text-red-400 border-red-500/20 hover:bg-red-500/[0.08]'
                : 'text-white/70 hover:text-white border-white/[0.08] bg-white/[0.06] hover:bg-white/[0.10]'
              }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
