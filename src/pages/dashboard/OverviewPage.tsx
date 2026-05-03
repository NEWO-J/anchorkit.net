import React from 'react';
import { useNavigate } from 'react-router';
import { API_BASE, clearAuthAndRedirect } from './utils';

type KeyData = { api_key: string; email: string; key_paused: boolean };
type Webhook = { webhook_id: string };

export default function OverviewPage() {
  const navigate = useNavigate();
  const [keyData, setKeyData] = React.useState<KeyData | null>(null);
  const [webhooks, setWebhooks] = React.useState<Webhook[] | null>(null);
  const [error, setError] = React.useState('');

  const logout = () => { clearAuthAndRedirect(); navigate('/login'); };

  React.useEffect(() => {
    fetch(`${API_BASE}/api/v1/keys`, { credentials: 'include' })
      .then(async res => {
        if (res.status === 401) { logout(); return; }
        if (!res.ok) throw new Error(`Error ${res.status}`);
        setKeyData(await res.json());
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load'));

    fetch(`${API_BASE}/api/v1/webhooks`, { credentials: 'include' })
      .then(async res => { if (res.ok) setWebhooks(await res.json()); })
      .catch(() => {});
  }, []);

  const stats = [
    {
      label: 'API Key',
      value: keyData ? (keyData.key_paused ? 'Paused' : 'Active') : '—',
      sub: keyData ? keyData.api_key.slice(0, 10) + '…' : undefined,
    },
    {
      label: 'Webhooks',
      value: webhooks !== null ? String(webhooks.length) : '—',
      sub: webhooks !== null ? (webhooks.length === 1 ? 'endpoint' : 'endpoints') : undefined,
    },
    { label: 'Submissions', value: '—', sub: 'Coming soon' },
    { label: 'Batches Anchored', value: '—', sub: 'Coming soon' },
  ];

  const quickLinks = [
    { label: 'View your API key', sub: 'Reveal, copy, regenerate or pause your key', path: '/dashboard/developers' },
    { label: 'Manage webhooks', sub: 'Register endpoints to receive anchor notifications', path: '/dashboard/developers' },
    { label: 'Browse submissions', sub: 'See all submitted hashes and their anchor status', path: '/dashboard/submissions' },
    { label: 'Account settings', sub: 'Update email or delete your account', path: '/dashboard/settings' },
  ];

  return (
    <div className="border-b border-white/[0.08]">
      {/* Page header */}
      <div className="border-b border-white/[0.08] px-6 py-5 bg-white/[0.03]">
        <h1 className="font-['DM_Sans',sans-serif] font-bold text-xl text-white leading-tight">Overview</h1>
        {keyData?.email && (
          <p className="font-['DM_Sans',sans-serif] text-xs text-white/40 mt-0.5">{keyData.email}</p>
        )}
      </div>

      {error && (
        <div className="border-b border-white/[0.08] px-6 py-3">
          <p className="font-['DM_Sans',sans-serif] text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Stat cards — connected grid, shared borders */}
      <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-white/[0.08]">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`px-6 py-5 ${i < stats.length - 1 ? 'border-r border-white/[0.08]' : ''}`}
          >
            <p className="font-['DM_Sans',sans-serif] text-xs text-white/30 uppercase tracking-wide mb-3">{s.label}</p>
            <p className="font-['DM_Sans',sans-serif] text-2xl font-bold text-white leading-none">{s.value}</p>
            {s.sub && <p className="font-['DM_Sans',sans-serif] text-xs text-white/25 mt-1.5">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div>
        <div className="border-b border-white/[0.08] px-6 py-4 bg-white/[0.02]">
          <p className="font-['DM_Sans',sans-serif] font-semibold text-sm text-white/60">Quick actions</p>
        </div>
        {quickLinks.map((item, i) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center justify-between px-6 py-4 hover:bg-white/[0.03] transition-colors cursor-pointer group ${i < quickLinks.length - 1 ? 'border-b border-white/[0.06]' : ''}`}
          >
            <div className="text-left">
              <p className="font-['DM_Sans',sans-serif] text-sm text-white/60 group-hover:text-white/80 transition-colors">{item.label}</p>
              <p className="font-['DM_Sans',sans-serif] text-xs text-white/25 mt-0.5">{item.sub}</p>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/20 group-hover:text-white/40 shrink-0 transition-colors">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
