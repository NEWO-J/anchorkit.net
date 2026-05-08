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
    <div className="fixed inset-0 z-50 flex items-center justify-center cmd-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div
        className="relative cmd-panel w-full mx-4"
        style={{
          maxWidth: 400,
          background: 'rgba(4,0,42,0.97)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 24px 56px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 15, color: 'rgba(255,255,255,0.92)', marginBottom: 8 }}>{title}</h2>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.50)', marginBottom: 24, lineHeight: 1.6 }}>{body}</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            style={{
              padding: '7px 16px', borderRadius: 8, cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", fontSize: 13,
              color: 'rgba(255,255,255,0.40)',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.09)',
              transition: 'all 140ms ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.65)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.40)'; }}
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '7px 16px', borderRadius: 8, cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
              background: danger ? 'rgba(251,113,133,0.10)' : 'rgba(255,255,255,0.08)',
              border: `1px solid ${danger ? 'rgba(251,113,133,0.24)' : 'rgba(255,255,255,0.12)'}`,
              color: danger ? 'rgba(251,113,133,0.85)' : 'rgba(255,255,255,0.80)',
              transition: 'all 140ms ease',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.background = danger ? 'rgba(251,113,133,0.18)' : 'rgba(255,255,255,0.13)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.background = danger ? 'rgba(251,113,133,0.10)' : 'rgba(255,255,255,0.08)';
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
