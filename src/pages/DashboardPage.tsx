import React from 'react';
import { useNavigate } from 'react-router';
import GradientCirclesBackground from '../components/GradientCirclesBackground';

const API_BASE = 'https://api.anchorkit.net';

type Tab = 'key' | 'account';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [tab, setTab] = React.useState<Tab>('key');

  // Key data
  const [apiKey, setApiKey] = React.useState<string | null>(null);
  const [email, setEmail] = React.useState('');
  const [keyPaused, setKeyPaused] = React.useState(false);
  const [nextRegenAfter, setNextRegenAfter] = React.useState<string | null>(null);
  const [batchNotifications, setBatchNotifications] = React.useState(true);
  const [visible, setVisible] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [regenerating, setRegenerating] = React.useState(false);
  const [pauseLoading, setPauseLoading] = React.useState(false);
  const [keyError, setKeyError] = React.useState('');

  // Account section
  const [activeForm, setActiveForm] = React.useState<null | 'email' | 'delete'>(null);
  const [emailNew, setEmailNew] = React.useState('');
  const [emailPassword, setEmailPassword] = React.useState('');
  const [deletePassword, setDeletePassword] = React.useState('');
  const [notifLoading, setNotifLoading] = React.useState(false);
  const [accountLoading, setAccountLoading] = React.useState(false);
  const [accountError, setAccountError] = React.useState('');
  const [accountSuccess, setAccountSuccess] = React.useState('');

  const token = localStorage.getItem('ak_token');

  const applyKeyResponse = (data: {
    api_key: string; email: string;
    next_regenerate_after?: string | null;
    key_paused?: boolean;
    batch_notifications?: boolean;
  }) => {
    setApiKey(data.api_key);
    setEmail(data.email);
    setNextRegenAfter(data.next_regenerate_after ?? null);
    setKeyPaused(data.key_paused ?? false);
    setBatchNotifications(data.batch_notifications ?? true);
  };

  React.useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetch(`${API_BASE}/api/keys`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async res => {
        if (res.status === 401) { handleLogout(); return; }
        if (!res.ok) throw new Error(`Error ${res.status}`);
        applyKeyResponse(await res.json());
      })
      .catch(err => setKeyError(err instanceof Error ? err.message : 'Failed to load key'));
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('ak_token');
    localStorage.removeItem('ak_email');
    navigate('/login');
  };

  const handleCopy = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleRegenerate = async () => {
    if (!token || regenerating) return;
    if (!confirm('This will invalidate your current key immediately. Any SDK instances using it will stop working. Continue?')) return;
    setRegenerating(true);
    setKeyError('');
    try {
      const res = await fetch(`${API_BASE}/api/keys/regenerate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      if (!res.ok) { setKeyError(data.detail ?? `Error ${res.status}`); return; }
      applyKeyResponse(data);
      setVisible(true);
    } catch (err) {
      setKeyError(err instanceof Error ? err.message : 'Failed to regenerate key');
    } finally {
      setRegenerating(false);
    }
  };

  const handlePauseToggle = async () => {
    if (!token || pauseLoading) return;
    const action = keyPaused ? 'resume' : 'pause';
    if (!keyPaused && !confirm('This will immediately reject all requests using your API key until you resume it. Continue?')) return;
    setPauseLoading(true);
    setKeyError('');
    try {
      const res = await fetch(`${API_BASE}/api/keys/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      if (!res.ok) { setKeyError(data.detail ?? `Error ${res.status}`); return; }
      applyKeyResponse(data);
    } catch (err) {
      setKeyError(err instanceof Error ? err.message : `Failed to ${action} key`);
    } finally {
      setPauseLoading(false);
    }
  };

  const handleNotificationsToggle = async () => {
    if (!token || notifLoading) return;
    const next = !batchNotifications;
    // Optimistic update so the toggle feels instant
    setBatchNotifications(next);
    setNotifLoading(true);
    setAccountError('');
    try {
      const res = await fetch(`${API_BASE}/api/account/notifications`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: next }),
      });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      if (!res.ok) {
        // Revert on failure
        setBatchNotifications(!next);
        setAccountError(data.detail ?? `Error ${res.status}`);
        return;
      }
      applyKeyResponse(data);
    } catch (err) {
      setBatchNotifications(!next);
      setAccountError(err instanceof Error ? err.message : 'Failed to update notifications');
    } finally {
      setNotifLoading(false);
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || accountLoading) return;
    setAccountLoading(true);
    setAccountError('');
    setAccountSuccess('');
    try {
      const res = await fetch(`${API_BASE}/api/account/email`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_email: emailNew, password: emailPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setAccountError(data.detail ?? `Error ${res.status}`); return; }
      setAccountSuccess('Check your new inbox — click the verification link to confirm the change.');
      setEmailNew('');
      setEmailPassword('');
      setActiveForm(null);
    } catch (err) {
      setAccountError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setAccountLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || accountLoading) return;
    if (!confirm('This is permanent. Your account and API key will be deleted immediately. Continue?')) return;
    setAccountLoading(true);
    setAccountError('');
    try {
      const res = await fetch(`${API_BASE}/api/account`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json();
      if (!res.ok) { setAccountError(data.detail ?? `Error ${res.status}`); setAccountLoading(false); return; }
      handleLogout();
    } catch (err) {
      setAccountError(err instanceof Error ? err.message : 'Request failed');
      setAccountLoading(false);
    }
  };

  const toggleForm = (form: 'email' | 'delete') => {
    setActiveForm(prev => prev === form ? null : form);
    setAccountError('');
    setAccountSuccess('');
  };

  const maskedKey = apiKey
    ? apiKey.slice(0, 7) + '•'.repeat(apiKey.length - 11) + apiKey.slice(-4)
    : null;

  const inputCls = `w-full bg-black/30 border border-white/[0.08] rounded-[6px] px-3 py-2.5
                    font-['DM_Sans',sans-serif] text-sm text-white/80 placeholder-white/20
                    focus:outline-none focus:border-white/20`;
  const btnSecondaryCls = `w-full py-2.5 rounded-[6px] bg-white/[0.06] border border-white/[0.08]
                            font-['DM_Sans',sans-serif] text-sm text-white/60 hover:text-white/80
                            hover:bg-white/[0.10] transition-colors cursor-pointer
                            disabled:opacity-40 disabled:cursor-not-allowed`;

  return (
    <div className="relative min-h-screen bg-[#030028] flex items-start justify-center px-4 pt-16">
      <GradientCirclesBackground />
      <div className="relative z-10 w-full max-w-lg">

        {/* Connected rectangle grid card */}
        <div className="border border-white/[0.08] overflow-hidden">

          {/* Header row — full-width rectangle */}
          <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-5 bg-white/[0.03]">
            <div>
              <h1 className="font-['DM_Sans',sans-serif] font-bold text-xl text-white leading-tight">Dashboard</h1>
              {email && <p className="font-['DM_Sans',sans-serif] text-xs text-white/40 mt-0.5">{email}</p>}
            </div>
            <button
              onClick={handleLogout}
              className="font-['DM_Sans',sans-serif] text-sm text-white/40 hover:text-white/70 transition-colors cursor-pointer"
            >
              Log out
            </button>
          </div>

          {/* Tab grid — two equal squares sharing a border */}
          <div className="grid grid-cols-2 border-b border-white/[0.08]">
            {(['key', 'account'] as Tab[]).map((t, i) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`py-4 font-['DM_Sans',sans-serif] text-sm font-medium transition-colors cursor-pointer
                            ${i === 0 ? 'border-r border-white/[0.08]' : ''}
                            ${tab === t
                              ? 'text-white bg-white/[0.06]'
                              : 'text-white/35 hover:text-white/55 hover:bg-white/[0.02]'
                            }`}
              >
                {t === 'key' ? 'API Key' : 'Account'}
              </button>
            ))}
          </div>

          {/* ── API Key tab ─────────────────────────────────────────── */}
          {tab === 'key' && (
            <div className="p-6">
              {keyError && (
                <p className="text-red-400 font-['DM_Sans',sans-serif] text-sm mb-4">{keyError}</p>
              )}

              {!apiKey && !keyError && (
                <p className="font-['DM_Sans',sans-serif] text-white/30 text-sm">Loading…</p>
              )}

              {apiKey && (
                <>
                  {keyPaused && (
                    <div className="mb-4 px-3 py-2 rounded-[6px] bg-white/[0.04] border border-white/[0.08]">
                      <p className="font-['DM_Sans',sans-serif] text-xs text-white/50">
                        Key is paused — all API requests are currently rejected.
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-4">
                    <code className={`flex-1 bg-black/30 border border-white/[0.08] rounded-[6px] px-4 py-3
                                     font-mono text-sm break-all select-all transition-colors
                                     ${keyPaused ? 'text-white/25' : 'text-white/80'}`}>
                      {visible ? apiKey : maskedKey}
                    </code>
                    <button
                      onClick={() => setVisible(v => !v)}
                      title={visible ? 'Hide' : 'Reveal'}
                      className="shrink-0 px-3 py-3 rounded-[6px] bg-white/[0.04] border border-white/[0.08]
                                 hover:bg-white/[0.08] transition-colors cursor-pointer text-white/50 hover:text-white/80"
                    >
                      {visible ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={handleCopy}
                      title="Copy"
                      className="shrink-0 px-3 py-3 rounded-[6px] bg-white/[0.04] border border-white/[0.08]
                                 hover:bg-white/[0.08] transition-colors cursor-pointer text-white/50 hover:text-white/80"
                    >
                      {copied ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                      )}
                    </button>
                  </div>

                  <p className="font-['DM_Sans',sans-serif] text-xs text-white/30 mb-6">
                    Pass this as <code className="font-mono text-white/40">api_key</code> in your SDK configuration.
                    Keep it secret — it authenticates your submissions.
                  </p>

                  {/* Actions row */}
                  <div className="flex items-start justify-between gap-4">
                    {/* Regenerate */}
                    {(() => {
                      const cooldownActive = nextRegenAfter && new Date() < new Date(nextRegenAfter);
                      const cooldownDate = nextRegenAfter
                        ? new Date(nextRegenAfter).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                        : null;
                      return (
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={handleRegenerate}
                            disabled={regenerating || !!cooldownActive || keyPaused}
                            className="font-['DM_Sans',sans-serif] text-sm text-white/40 hover:text-white/60
                                       transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-left"
                          >
                            {regenerating ? 'Regenerating…' : 'Regenerate key'}
                          </button>
                          {cooldownActive && cooldownDate && !keyPaused ? (
                            <p className="font-['DM_Sans',sans-serif] text-xs text-white/25">
                              Available again {cooldownDate}
                            </p>
                          ) : (
                            <p className="font-['DM_Sans',sans-serif] text-xs text-white/20">
                              Once every 14 days
                            </p>
                          )}
                        </div>
                      );
                    })()}

                    {/* Pause / Resume */}
                    <button
                      onClick={handlePauseToggle}
                      disabled={pauseLoading}
                      className="font-['DM_Sans',sans-serif] text-sm text-white/40 hover:text-white/60
                                 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {pauseLoading ? '…' : keyPaused ? 'Resume key' : 'Pause key'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Account tab ─────────────────────────────────────────── */}
          {tab === 'account' && (
            <div className="p-6">
              {accountSuccess && (
                <p className="text-green-400/80 font-['DM_Sans',sans-serif] text-sm mb-5">{accountSuccess}</p>
              )}

              {/* Batch notifications toggle */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="font-['DM_Sans',sans-serif] text-sm text-white/70">Batch notifications</p>
                  <p className="font-['DM_Sans',sans-serif] text-xs text-white/30 mt-0.5">
                    Receive daily anchor summary emails
                  </p>
                </div>
                <button
                  role="switch"
                  aria-checked={batchNotifications}
                  onClick={handleNotificationsToggle}
                  className={`relative inline-flex h-[22px] w-[40px] shrink-0 items-center rounded-full
                              transition-colors cursor-pointer
                              ${batchNotifications ? 'bg-white/30' : 'bg-white/[0.10]'}`}
                >
                  <span
                    className={`inline-block h-[16px] w-[16px] rounded-full bg-white shadow transition-transform
                                ${batchNotifications ? 'translate-x-[20px]' : 'translate-x-[3px]'}`}
                  />
                </button>
              </div>

              <div className="border-t border-white/[0.06] mb-5" />

              {/* Update email */}
              <div className="mb-4">
                <button
                  onClick={() => toggleForm('email')}
                  className="font-['DM_Sans',sans-serif] text-sm text-white/60 hover:text-white/80 transition-colors cursor-pointer"
                >
                  Update email
                </button>
                {activeForm === 'email' && (
                  <form onSubmit={handleEmailChange} className="mt-3 space-y-2">
                    {accountError && (
                      <p className="text-red-400 font-['DM_Sans',sans-serif] text-xs">{accountError}</p>
                    )}
                    <input
                      type="email"
                      required
                      placeholder="New email address"
                      value={emailNew}
                      onChange={e => setEmailNew(e.target.value)}
                      className={inputCls}
                    />
                    <input
                      type="password"
                      required
                      placeholder="Current password to confirm"
                      value={emailPassword}
                      onChange={e => setEmailPassword(e.target.value)}
                      className={inputCls}
                    />
                    <button type="submit" disabled={accountLoading} className={btnSecondaryCls}>
                      {accountLoading ? 'Sending…' : 'Send verification email'}
                    </button>
                  </form>
                )}
              </div>

              <div className="border-t border-white/[0.06] mb-4" />

              {/* Delete account */}
              <div>
                <button
                  onClick={() => toggleForm('delete')}
                  className="font-['DM_Sans',sans-serif] text-sm text-red-400/50 hover:text-red-400/80 transition-colors cursor-pointer"
                >
                  Delete account
                </button>
                {activeForm === 'delete' && (
                  <form onSubmit={handleDeleteAccount} className="mt-3 space-y-2">
                    <p className="font-['DM_Sans',sans-serif] text-xs text-white/30">
                      This permanently deletes your account and revokes your API key. This cannot be undone.
                    </p>
                    {accountError && (
                      <p className="text-red-400 font-['DM_Sans',sans-serif] text-xs">{accountError}</p>
                    )}
                    <input
                      type="password"
                      required
                      placeholder="Enter your password to confirm"
                      value={deletePassword}
                      onChange={e => setDeletePassword(e.target.value)}
                      className={inputCls}
                    />
                    <button
                      type="submit"
                      disabled={accountLoading}
                      className={`${btnSecondaryCls} border-red-500/20 text-red-400/60 hover:text-red-400/90 hover:bg-red-500/[0.08]`}
                    >
                      {accountLoading ? 'Deleting…' : 'Permanently delete my account'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
