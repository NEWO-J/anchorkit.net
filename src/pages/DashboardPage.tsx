import React from 'react';
import { useNavigate } from 'react-router';

const API_BASE = 'https://api.anchorkit.net';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = React.useState<string | null>(null);
  const [email, setEmail] = React.useState('');
  const [nextRegenAfter, setNextRegenAfter] = React.useState<string | null>(null);
  const [visible, setVisible] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [regenerating, setRegenerating] = React.useState(false);
  const [error, setError] = React.useState('');

  const token = localStorage.getItem('ak_token');

  React.useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetch(`${API_BASE}/api/keys`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async res => {
        if (res.status === 401) { handleLogout(); return; }
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json() as { api_key: string; email: string; next_regenerate_after?: string | null };
        setApiKey(data.api_key);
        setEmail(data.email);
        setNextRegenAfter(data.next_regenerate_after ?? null);
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load key'));
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
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/keys/regenerate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { handleLogout(); return; }
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json() as { api_key: string; email: string; next_regenerate_after?: string | null };
      setApiKey(data.api_key);
      setNextRegenAfter(data.next_regenerate_after ?? null);
      setVisible(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate key');
    } finally {
      setRegenerating(false);
    }
  };

  const maskedKey = apiKey
    ? apiKey.slice(0, 7) + '•'.repeat(apiKey.length - 11) + apiKey.slice(-4)
    : null;

  return (
    <div className="min-h-screen bg-[#030028] flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-['DM_Sans',sans-serif] font-bold text-2xl text-white">Dashboard</h1>
            {email && <p className="font-['DM_Sans',sans-serif] text-sm text-white/40 mt-0.5">{email}</p>}
          </div>
          <button
            onClick={handleLogout}
            className="font-['DM_Sans',sans-serif] text-sm text-white/40 hover:text-white/70 transition-colors cursor-pointer"
          >
            Log out
          </button>
        </div>

        <div className="bg-white/[0.04] border border-white/[0.08] rounded-[12px] p-6">
          <p className="font-['DM_Sans',sans-serif] font-bold text-sm text-white/50 uppercase tracking-wider mb-4">
            API Key
          </p>

          {error && (
            <p className="text-red-400 font-['DM_Sans',sans-serif] text-sm mb-4">{error}</p>
          )}

          {!apiKey && !error && (
            <p className="font-['DM_Sans',sans-serif] text-white/30 text-sm">Loading…</p>
          )}

          {apiKey && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <code className="flex-1 bg-black/30 border border-white/[0.08] rounded-[6px] px-4 py-3
                                 font-mono text-sm text-white/80 break-all select-all">
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

              {(() => {
                const cooldownActive = nextRegenAfter && new Date() < new Date(nextRegenAfter);
                const cooldownDate = nextRegenAfter
                  ? new Date(nextRegenAfter).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                  : null;
                return (
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={handleRegenerate}
                      disabled={regenerating || !!cooldownActive}
                      className="font-['DM_Sans',sans-serif] text-sm text-white/40 hover:text-white/60
                                 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-left"
                    >
                      {regenerating ? 'Regenerating…' : 'Regenerate key'}
                    </button>
                    {cooldownActive && cooldownDate && (
                      <p className="font-['DM_Sans',sans-serif] text-xs text-white/25">
                        Available again {cooldownDate}
                      </p>
                    )}
                  </div>
                );
              })()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
