import React from 'react';
import { useNavigate } from 'react-router';
import { API_BASE, mapApiError, getCsrfToken, clearAuthAndRedirect } from './utils';
import dashboardBg from '../../assets/dashboard.png';

type Webhook = { webhook_id: string; url: string; enabled: boolean; created_at: number };
type Tab = 'keys' | 'webhooks' | 'audit';
type KeyData = {
  api_key: string;
  email: string;
  key_paused: boolean;
  batch_notifications: boolean;
  next_regenerate_after?: string | null;
};

const inputCls = `w-full bg-black/30 border border-white/[0.08] rounded-[6px] px-3 py-2.5
                  font-['DM_Sans',sans-serif] text-sm text-white/80 placeholder-white/20
                  focus:outline-none focus:border-white/20`;

export default function DevelopersPage() {
  const navigate = useNavigate();
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
    });
  };

  const handleRegenerate = async () => {
    if (regenerating || !keyData) return;
    if (!confirm('This will invalidate your current key immediately. Any SDK instances using it will stop working. Continue?')) return;
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
    } catch (err) {
      setKeyError(err instanceof Error ? err.message : 'Failed to regenerate key');
    } finally { setRegenerating(false); }
  };

  const handlePauseToggle = async () => {
    if (pauseLoading || !keyData) return;
    const action = keyData.key_paused ? 'resume' : 'pause';
    if (!keyData.key_paused && !confirm('This will immediately reject all requests using your API key until you resume it. Continue?')) return;
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
    } catch (err) {
      setKeyError(err instanceof Error ? err.message : `Failed to ${action} key`);
    } finally { setPauseLoading(false); }
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
    } catch (err) {
      setWebhookError(err instanceof Error ? err.message : 'Failed to register webhook');
    } finally { setWebhookLoading(false); }
  };

  const handleDeleteWebhook = async (id: string) => {
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
    { id: 'keys', label: 'API Keys' },
    { id: 'webhooks', label: 'Webhooks' },
    { id: 'audit', label: 'Audit Log' },
  ];

  return (
    <div>
      {/* Page header */}
      <div
        className="border-b border-white/[0.08] px-6 py-5 relative overflow-hidden"
        style={{ backgroundImage: `url(${dashboardBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-[#030028]/70" />
        <div className="relative">
          <h1 className="font-['DM_Sans',sans-serif] font-bold text-xl text-white leading-tight">Developers</h1>
          <p className="font-['DM_Sans',sans-serif] text-xs text-white/40 mt-0.5">API key, webhooks, and security events</p>
        </div>
      </div>

      {/* Tab row — connected grid, shared borders */}
      <div className="grid grid-cols-3 border-b border-white/[0.08]">
        {tabs.map((t, i) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`py-4 font-['DM_Sans',sans-serif] text-sm font-medium transition-colors cursor-pointer
                        ${i < tabs.length - 1 ? 'border-r border-white/[0.08]' : ''}
                        ${tab === t.id
                          ? 'text-white bg-white/[0.06]'
                          : 'text-white/35 hover:text-white/55 hover:bg-white/[0.02]'
                        }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── API Keys ── */}
      {tab === 'keys' && (
        <div className="p-6">
          {keyError && <p className="text-red-400 font-['DM_Sans',sans-serif] text-sm mb-4">{keyError}</p>}
          {!keyData && !keyError && <p className="font-['DM_Sans',sans-serif] text-white/30 text-sm">Loading…</p>}

          {keyData && (
            <>
              {keyData.key_paused && (
                <div className="mb-4 px-3 py-2 border border-white/[0.08] bg-white/[0.04]">
                  <p className="font-['DM_Sans',sans-serif] text-xs text-white/50">
                    Key is paused — all API requests are currently rejected.
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 mb-4">
                <code className={`flex-1 bg-black/30 border border-white/[0.08] px-4 py-3 font-mono text-sm break-all select-all transition-colors ${keyData.key_paused ? 'text-white/25' : 'text-white/80'}`}>
                  {visible ? keyData.api_key : maskedKey}
                </code>
                <button onClick={() => setVisible(v => !v)} title={visible ? 'Hide' : 'Reveal'}
                  className="shrink-0 px-3 py-3 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors cursor-pointer text-white/50 hover:text-white/80">
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
                <button onClick={handleCopy} title="Copy"
                  className="shrink-0 px-3 py-3 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors cursor-pointer text-white/50 hover:text-white/80">
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
                Pass as <code className="font-mono text-white/40">api_key</code> in your SDK configuration. Keep it secret.
              </p>

              <div className="flex items-start justify-between gap-4 pt-5 border-t border-white/[0.06]">
                {(() => {
                  const cooldownActive = keyData.next_regenerate_after && new Date() < new Date(keyData.next_regenerate_after);
                  const cooldownDate = keyData.next_regenerate_after
                    ? new Date(keyData.next_regenerate_after).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                    : null;
                  return (
                    <div className="flex flex-col gap-1">
                      <button onClick={handleRegenerate} disabled={regenerating || !!cooldownActive || keyData.key_paused}
                        className="font-['DM_Sans',sans-serif] text-sm text-white/40 hover:text-white/60 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-left">
                        {regenerating ? 'Regenerating…' : 'Regenerate key'}
                      </button>
                      <p className="font-['DM_Sans',sans-serif] text-xs text-white/20">
                        {cooldownActive && cooldownDate && !keyData.key_paused ? `Available again ${cooldownDate}` : 'Once every 14 days'}
                      </p>
                    </div>
                  );
                })()}
                <button onClick={handlePauseToggle} disabled={pauseLoading}
                  className="font-['DM_Sans',sans-serif] text-sm text-white/40 hover:text-white/60 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                  {pauseLoading ? '…' : keyData.key_paused ? 'Resume key' : 'Pause key'}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Webhooks ── */}
      {tab === 'webhooks' && (
        <div className="p-6">
          {webhookError && <p className="text-red-400 font-['DM_Sans',sans-serif] text-sm mb-4">{webhookError}</p>}

          <div className="mb-6">
            <p className="font-['DM_Sans',sans-serif] text-sm text-white/70 mb-1">Register endpoint</p>
            <p className="font-['DM_Sans',sans-serif] text-xs text-white/30 mb-3">
              Receive a POST whenever a nightly anchor is confirmed. The secret is shown once — store it to verify{' '}
              <code className="font-mono text-white/40">X-AnchorKit-Signature</code> headers.
            </p>
            <div className="flex gap-2">
              <input type="url" placeholder="https://your-server.com/webhook"
                value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)}
                className={inputCls} />
              <button onClick={handleRegisterWebhook} disabled={webhookLoading || !webhookUrl}
                className="shrink-0 px-4 py-2.5 bg-white/[0.06] border border-white/[0.08] font-['DM_Sans',sans-serif] text-sm text-white/60 hover:text-white/80 hover:bg-white/[0.10] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                {webhookLoading ? '…' : 'Add'}
              </button>
            </div>
            {webhookSecret && (
              <div className="mt-3 px-3 py-2.5 bg-black/30 border border-white/[0.08]">
                <p className="font-['DM_Sans',sans-serif] text-xs text-white/40 mb-1">Signing secret (shown once):</p>
                <code className="font-mono text-sm text-white/80 break-all select-all">{webhookSecret}</code>
              </div>
            )}
          </div>

          <div className="border-t border-white/[0.06] mb-5" />

          {!webhooksFetched && <p className="font-['DM_Sans',sans-serif] text-white/30 text-sm">Loading…</p>}
          {webhooksFetched && webhooks.length === 0 && (
            <p className="font-['DM_Sans',sans-serif] text-white/30 text-sm">No webhooks registered yet.</p>
          )}
          {webhooks.map(wh => (
            <div key={wh.webhook_id} className="flex items-center justify-between gap-3 mb-3">
              <div className="min-w-0">
                <p className="font-mono text-sm text-white/70 truncate">{wh.url}</p>
                <p className="font-['DM_Sans',sans-serif] text-xs text-white/25 mt-0.5">
                  {new Date(wh.created_at * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  {!wh.enabled && ' · paused'}
                </p>
              </div>
              <button onClick={() => handleDeleteWebhook(wh.webhook_id)} disabled={deletingWebhook === wh.webhook_id}
                className="shrink-0 font-['DM_Sans',sans-serif] text-sm text-red-400/40 hover:text-red-400/70 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
                {deletingWebhook === wh.webhook_id ? '…' : 'Remove'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Audit Log ── */}
      {tab === 'audit' && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="font-['DM_Sans',sans-serif] text-white/25 text-sm">Audit log coming soon.</p>
          <p className="font-['DM_Sans',sans-serif] text-white/15 text-xs mt-1">
            Key operations, login events, and webhook deliveries will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
