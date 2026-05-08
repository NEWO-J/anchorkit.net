import React from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { API_BASE, mapApiError, getCsrfToken, clearAuthAndRedirect } from './utils';
import { useToast } from './Toast';
import { ConfirmModal } from './ConfirmModal';

type Webhook = { webhook_id: string; url: string; enabled: boolean; created_at: number };
type Tab = 'keys' | 'webhooks' | 'audit';
type KeyData = {
  api_key: string;
  email: string;
  key_paused: boolean;
  batch_notifications: boolean;
  next_regenerate_after?: string | null;
};

const inputCls = `w-full bg-black/30 border border-white/[0.09] rounded-[8px] px-3 py-2.5
                  font-['DM_Sans',sans-serif] text-sm text-white/80 placeholder-white/20
                  focus:outline-none focus:border-white/[0.22] transition-colors`;

export default function DevelopersPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [tab, setTab] = React.useState<Tab>('keys');

  const [keyData, setKeyData] = React.useState<KeyData | null>(null);
  const [visible, setVisible] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [regenerating, setRegenerating] = React.useState(false);
  const [pauseLoading, setPauseLoading] = React.useState(false);
  const [keyError, setKeyError] = React.useState('');

  const [webhooks, setWebhooks] = React.useState<Webhook[]>([]);
  const [webhookUrl, setWebhookUrl] = React.useState('');
  const [webhookSecret, setWebhookSecret] = React.useState<string | null>(null);
  const [webhookError, setWebhookError] = React.useState('');
  const [webhookLoading, setWebhookLoading] = React.useState(false);
  const [webhooksFetched, setWebhooksFetched] = React.useState(false);
  const [deletingWebhook, setDeletingWebhook] = React.useState<string | null>(null);

  const [showRegenerateModal, setShowRegenerateModal] = React.useState(false);
  const [showPauseModal, setShowPauseModal] = React.useState(false);
  const [confirmDeleteWebhookId, setConfirmDeleteWebhookId] = React.useState<string | null>(null);

  const logout = () => { clearAuthAndRedirect(); navigate('/login'); };

  React.useEffect(() => {
    fetch(`${API_BASE}/api/v1/keys`, { credentials: 'include' })
      .then(async res => {
        if (res.status === 401) { logout(); return; }
        if (!res.ok) throw new Error(`Error ${res.status}`);
        setKeyData(await res.json());
      })
      .catch(err => setKeyError(err instanceof Error ? err.message : 'Failed to load key'));
  }, []);

  React.useEffect(() => {
    if (!webhookSecret) return;
    const t = setTimeout(() => setWebhookSecret(null), 30_000);
    return () => clearTimeout(t);
  }, [webhookSecret]);

  React.useEffect(() => {
    if (tab !== 'webhooks' || webhooksFetched) return;
    fetch(`${API_BASE}/api/v1/webhooks`, { credentials: 'include' })
      .then(async res => {
        if (res.status === 401) { logout(); return; }
        if (!res.ok) throw new Error(`Error ${res.status}`);
        setWebhooks(await res.json());
        setWebhooksFetched(true);
      })
      .catch(err => setWebhookError(err instanceof Error ? err.message : 'Failed to load webhooks'));
  }, [tab, webhooksFetched]);

  const handleCopy = () => {
    if (!keyData?.api_key) return;
    navigator.clipboard.writeText(keyData.api_key).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast(t('developers.toast.keyCopied'));
    });
  };

  const doRegenerate = async () => {
    setShowRegenerateModal(false);
    if (regenerating || !keyData) return;
    setRegenerating(true); setKeyError('');
    try {
      const res = await fetch(`${API_BASE}/api/v1/keys/regenerate`, {
        method: 'POST', credentials: 'include',
        headers: { 'X-CSRF-Token': getCsrfToken() },
      });
      if (res.status === 401) { logout(); return; }
      const data = await res.json();
      if (!res.ok) { setKeyError(mapApiError(res.status, data.detail)); return; }
      setKeyData(data); setVisible(true);
      showToast(t('developers.toast.keyRegenerated'));
    } catch (err) {
      setKeyError(err instanceof Error ? err.message : 'Failed to regenerate key');
    } finally { setRegenerating(false); }
  };

  const doPauseToggle = async () => {
    setShowPauseModal(false);
    if (pauseLoading || !keyData) return;
    const action = keyData.key_paused ? 'resume' : 'pause';
    setPauseLoading(true); setKeyError('');
    try {
      const res = await fetch(`${API_BASE}/api/v1/keys/${action}`, {
        method: 'POST', credentials: 'include',
        headers: { 'X-CSRF-Token': getCsrfToken() },
      });
      if (res.status === 401) { logout(); return; }
      const data = await res.json();
      if (!res.ok) { setKeyError(mapApiError(res.status, data.detail)); return; }
      setKeyData(data);
      showToast(action === 'pause' ? t('developers.toast.keyPaused') : t('developers.toast.keyResumed'));
    } catch (err) {
      setKeyError(err instanceof Error ? err.message : `Failed to ${action} key`);
    } finally { setPauseLoading(false); }
  };

  const handlePauseClick = () => {
    if (keyData?.key_paused) {
      doPauseToggle();
    } else {
      setShowPauseModal(true);
    }
  };

  const handleRegisterWebhook = async () => {
    if (webhookLoading || !webhookUrl) return;
    setWebhookLoading(true); setWebhookError(''); setWebhookSecret(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/webhooks`, {
        method: 'POST', credentials: 'include',
        headers: { 'X-CSRF-Token': getCsrfToken(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: webhookUrl }),
      });
      if (res.status === 401) { logout(); return; }
      const data = await res.json();
      if (!res.ok) { setWebhookError(mapApiError(res.status, data.detail)); return; }
      setWebhookSecret(data.secret);
      setWebhooks(prev => [...prev, { webhook_id: data.webhook_id, url: webhookUrl, enabled: true, created_at: Math.floor(Date.now() / 1000) }]);
      setWebhookUrl('');
      showToast(t('developers.toast.webhookRegistered'));
    } catch (err) {
      setWebhookError(err instanceof Error ? err.message : 'Failed to register webhook');
    } finally { setWebhookLoading(false); }
  };

  const doDeleteWebhook = async (id: string) => {
    setConfirmDeleteWebhookId(null);
    if (deletingWebhook) return;
    setDeletingWebhook(id); setWebhookError('');
    try {
      const res = await fetch(`${API_BASE}/api/v1/webhooks/${id}`, {
        method: 'DELETE', credentials: 'include',
        headers: { 'X-CSRF-Token': getCsrfToken() },
      });
      if (res.status === 401) { logout(); return; }
      if (res.status === 204 || res.ok) {
        setWebhooks(prev => prev.filter(w => w.webhook_id !== id));
        showToast(t('developers.toast.webhookRemoved'));
      } else {
        const data = await res.json();
        setWebhookError(data.detail ?? `Error ${res.status}`);
      }
    } catch (err) {
      setWebhookError(err instanceof Error ? err.message : 'Failed to delete webhook');
    } finally { setDeletingWebhook(null); }
  };

  const maskedKey = keyData?.api_key
    ? keyData.api_key.slice(0, 7) + '•'.repeat(keyData.api_key.length - 11) + keyData.api_key.slice(-4)
    : null;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'keys', label: t('developers.tabs.keys') },
    { id: 'webhooks', label: t('developers.tabs.webhooks') },
    { id: 'audit', label: t('developers.tabs.audit') },
  ];

  return (
    <div className="page-enter">
      {/* Page header */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '20px 24px' }}>
        <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 20, color: 'rgba(255,255,255,0.94)', lineHeight: 1.2 }}>{t('developers.title')}</h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.38)', marginTop: 3 }}>{t('developers.subtitle')}</p>
      </div>

      {/* Tab row — segmented control style */}
      <div style={{ padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.012)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', padding: 3, borderRadius: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {tabs.map((tabItem) => (
            <button
              key={tabItem.id}
              onClick={() => setTab(tabItem.id)}
              style={{
                padding: '5px 16px', borderRadius: 6, cursor: 'pointer', border: 'none',
                fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
                background: tab === tabItem.id ? 'rgba(255,255,255,0.10)' : 'transparent',
                color: tab === tabItem.id ? 'rgba(255,255,255,0.90)' : 'rgba(255,255,255,0.35)',
                transition: 'all 140ms ease',
              }}
              onMouseEnter={e => { if (tab !== tabItem.id) (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.58)'; }}
              onMouseLeave={e => { if (tab !== tabItem.id) (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.35)'; }}
            >
              {tabItem.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── API Keys ── */}
      {tab === 'keys' && (
        <div className="p-6">
          {keyError && <p className="font-['DM_Sans',sans-serif] text-sm mb-4" style={{ color: 'rgba(251,113,133,0.85)' }}>{keyError}</p>}
          {!keyData && !keyError && <p className="font-['DM_Sans',sans-serif] text-white/30 text-sm">{t('developers.keys.loading')}</p>}

          {keyData && (
            <>
              {keyData.key_paused && (
                <div className="mb-4 px-3 py-2.5 rounded-md" style={{ background: 'rgba(251,113,133,0.07)', border: '1px solid rgba(251,113,133,0.18)' }}>
                  <p className="font-['DM_Sans',sans-serif] text-xs" style={{ color: 'rgba(251,113,133,0.75)' }}>
                    {t('developers.keys.paused')}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 mb-4" style={{ maxWidth: '42rem' }}>
                <code
                  className="flex-1 break-all select-all font-mono text-sm"
                  style={{
                    padding: '12px 16px', borderRadius: 8,
                    background: 'rgba(0,0,0,0.30)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    color: keyData.key_paused ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.78)',
                    transition: 'color 140ms ease',
                  }}
                >
                  {visible ? keyData.api_key : maskedKey}
                </code>
                <button onClick={() => setVisible(v => !v)} title={visible ? t('developers.keys.hide') : t('developers.keys.reveal')}
                  className="shrink-0 cursor-pointer transition-colors"
                  style={{ padding: '11px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.45)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; }}
                >
                  {visible ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
                <button onClick={handleCopy} title={t('developers.keys.copy')}
                  className="shrink-0 cursor-pointer transition-colors"
                  style={{ padding: '11px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: copied ? 'rgba(52,211,153,0.80)' : 'rgba(255,255,255,0.45)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; }}
                >
                  {copied ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                  )}
                </button>
              </div>

              <p className="font-['DM_Sans',sans-serif] text-xs text-white/30 mb-6">
                {t('developers.keys.instruction')}
              </p>

              <div className="flex flex-col gap-3 pt-5 border-t border-white/[0.06]">
                <button onClick={handlePauseClick} disabled={pauseLoading}
                  className="font-['DM_Sans',sans-serif] text-sm text-white/40 hover:text-white/60 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-left">
                  {pauseLoading ? '…' : keyData.key_paused ? t('developers.keys.resumeKey') : t('developers.keys.pauseKey')}
                </button>
                {(() => {
                  const cooldownActive = keyData.next_regenerate_after && new Date() < new Date(keyData.next_regenerate_after);
                  const cooldownDate = keyData.next_regenerate_after
                    ? new Date(keyData.next_regenerate_after).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                    : null;
                  return (
                    <div className="flex flex-col gap-1">
                      <button onClick={() => setShowRegenerateModal(true)} disabled={regenerating || !!cooldownActive || keyData.key_paused}
                        className="font-['DM_Sans',sans-serif] text-sm text-white/40 hover:text-white/60 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-left">
                        {regenerating ? t('developers.keys.regenerating') : t('developers.keys.regenerateKey')}
                      </button>
                      <p className="font-['DM_Sans',sans-serif] text-xs text-white/20">
                        {cooldownActive && cooldownDate && !keyData.key_paused ? t('developers.keys.cooldownActive', { date: cooldownDate }) : t('developers.keys.cooldown')}
                      </p>
                    </div>
                  );
                })()}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Webhooks ── */}
      {tab === 'webhooks' && (
        <div className="p-6">
          {webhookError && <p className="font-['DM_Sans',sans-serif] text-sm mb-4" style={{ color: 'rgba(251,113,133,0.85)' }}>{webhookError}</p>}

          <div className="mb-6">
            <p className="font-['DM_Sans',sans-serif] text-sm text-white/70 mb-1">{t('developers.webhooks.registerLabel')}</p>
            <p className="font-['DM_Sans',sans-serif] text-xs text-white/30 mb-3">
              {t('developers.webhooks.description')}
            </p>
            <div className="flex gap-2" style={{ maxWidth: '42rem' }}>
              <input type="url" placeholder={t('developers.webhooks.placeholder')}
                value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)}
                className={inputCls} />
              <button onClick={handleRegisterWebhook} disabled={webhookLoading || !webhookUrl}
                className="shrink-0 font-['DM_Sans',sans-serif] text-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.62)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.10)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'; }}
              >
                {webhookLoading ? '…' : t('developers.webhooks.add')}
              </button>
            </div>
            {webhookSecret && (
              <div className="mt-3 px-3 py-2.5 rounded-md" style={{ background: 'rgba(0,0,0,0.28)', border: '1px solid rgba(255,255,255,0.09)' }}>
                <p className="font-['DM_Sans',sans-serif] text-xs text-white/40 mb-1">{t('developers.webhooks.signingSecret')}</p>
                <code className="font-mono text-sm text-white/80 break-all select-all">{webhookSecret}</code>
              </div>
            )}
          </div>

          <div className="border-t border-white/[0.06] mb-5" />

          {!webhooksFetched && <p className="font-['DM_Sans',sans-serif] text-white/30 text-sm">{t('developers.webhooks.loading')}</p>}
          {webhooksFetched && webhooks.length === 0 && (
            <p className="font-['DM_Sans',sans-serif] text-white/30 text-sm">{t('developers.webhooks.noWebhooks')}</p>
          )}
          {webhooks.map(wh => (
            <div key={wh.webhook_id} className="flex items-center justify-between gap-3 mb-3">
              <div className="min-w-0">
                <p className="font-mono text-sm text-white/70 truncate">{wh.url}</p>
                <p className="font-['DM_Sans',sans-serif] text-xs text-white/25 mt-0.5">
                  {new Date(wh.created_at * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  {!wh.enabled && ` · ${t('developers.webhooks.paused')}`}
                </p>
              </div>
              <button onClick={() => setConfirmDeleteWebhookId(wh.webhook_id)} disabled={deletingWebhook === wh.webhook_id}
                className="shrink-0 font-['DM_Sans',sans-serif] text-sm transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ color: 'rgba(251,113,133,0.40)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(251,113,133,0.72)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(251,113,133,0.40)'; }}
                {deletingWebhook === wh.webhook_id ? '…' : t('developers.webhooks.remove')}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Audit Log ── */}
      {tab === 'audit' && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="font-['DM_Sans',sans-serif] text-white/25 text-sm">{t('developers.audit.title')}</p>
          <p className="font-['DM_Sans',sans-serif] text-white/15 text-xs mt-1">
            {t('developers.audit.subtitle')}
          </p>
        </div>
      )}

      {showRegenerateModal && (
        <ConfirmModal
          title={t('developers.modal.regenerateTitle')}
          body={t('developers.modal.regenerateBody')}
          confirmLabel={t('developers.modal.regenerateConfirm')}
          onConfirm={doRegenerate}
          onCancel={() => setShowRegenerateModal(false)}
        />
      )}

      {showPauseModal && (
        <ConfirmModal
          title={t('developers.modal.pauseTitle')}
          body={t('developers.modal.pauseBody')}
          confirmLabel={t('developers.modal.pauseConfirm')}
          danger
          onConfirm={doPauseToggle}
          onCancel={() => setShowPauseModal(false)}
        />
      )}

      {confirmDeleteWebhookId && (
        <ConfirmModal
          title={t('developers.modal.webhookTitle')}
          body={t('developers.modal.webhookBody')}
          confirmLabel={t('developers.modal.webhookConfirm')}
          danger
          onConfirm={() => doDeleteWebhook(confirmDeleteWebhookId)}
          onCancel={() => setConfirmDeleteWebhookId(null)}
        />
      )}
    </div>
  );
}
