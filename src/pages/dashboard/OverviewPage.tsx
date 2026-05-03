import React from 'react';
import { useNavigate } from 'react-router';
import { API_BASE, clearAuthAndRedirect } from './utils';

type KeyData = {
  api_key: string;
  email: string;
  key_paused: boolean;
  batch_notifications: boolean;
};

type Webhook = { webhook_id: string; url: string; enabled: boolean };

function StatCard({ label, value, sub, accent }: { label: string; value: React.ReactNode; sub?: string; accent?: boolean }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-[8px] px-5 py-5">
      <p className="font-['DM_Sans',sans-serif] text-xs text-white/30 uppercase tracking-wide mb-2">{label}</p>
      <p className={`font-['DM_Sans',sans-serif] text-2xl font-bold leading-none ${accent ? 'text-[#ff7608]' : 'text-white'}`}>
        {value}
      </p>
      {sub && <p className="font-['DM_Sans',sans-serif] text-xs text-white/25 mt-1.5">{sub}</p>}
    </div>
  );
}

export default function OverviewPage() {
  const navigate = useNavigate();
  const [keyData, setKeyData] = React.useState<KeyData | null>(null);
  const [webhooks, setWebhooks] = React.useState<Webhook[] | null>(null);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    fetch(`${API_BASE}/api/v1/keys`, { credentials: 'include' })
      .then(async res => {
        if (res.status === 401) { clearAuthAndRedirect(); navigate('/login'); return; }
        if (!res.ok) throw new Error(`Error ${res.status}`);
        setKeyData(await res.json());
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load data'));

    fetch(`${API_BASE}/api/v1/webhooks`, { credentials: 'include' })
      .then(async res => {
        if (!res.ok) return;
        setWebhooks(await res.json());
      })
      .catch(() => {});
  }, []);

  const keyStatus = keyData
    ? keyData.key_paused ? 'Paused' : 'Active'
    : '—';

  const maskedKey = keyData?.api_key
    ? keyData.api_key.slice(0, 10) + '…'
    : null;

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="font-['DM_Sans',sans-serif] font-bold text-2xl text-white">Overview</h1>
        {keyData?.email && (
          <p className="font-['DM_Sans',sans-serif] text-sm text-white/30 mt-1">{keyData.email}</p>
        )}
      </div>

      {error && (
        <p className="font-['DM_Sans',sans-serif] text-sm text-red-400 mb-6">{error}</p>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          label="API Key"
          value={keyStatus}
          sub={maskedKey ?? undefined}
          accent={keyData?.key_paused === false}
        />
        <StatCard
          label="Webhooks"
          value={webhooks !== null ? webhooks.length : '—'}
          sub={webhooks !== null ? (webhooks.length === 1 ? 'endpoint registered' : 'endpoints registered') : undefined}
        />
        <StatCard
          label="Submissions"
          value="—"
          sub="Coming soon"
        />
        <StatCard
          label="Batches Anchored"
          value="—"
          sub="Coming soon"
        />
      </div>

      {/* Quick links */}
      <div className="border border-white/[0.08] rounded-[8px] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] bg-white/[0.02]">
          <h2 className="font-['DM_Sans',sans-serif] font-semibold text-sm text-white/70">Quick actions</h2>
        </div>
        <div className="divide-y divide-white/[0.06]">
          {[
            { label: 'View your API key', sub: 'Reveal, copy, regenerate or pause your key', path: '/dashboard/developers' },
            { label: 'Manage webhooks', sub: 'Register endpoints to receive anchor notifications', path: '/dashboard/developers' },
            { label: 'Browse submissions', sub: 'See all submitted hashes and their anchor status', path: '/dashboard/submissions' },
            { label: 'Account settings', sub: 'Update email or delete your account', path: '/dashboard/settings' },
          ].map(item => (
            <button
              key={item.path + item.label}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.03] transition-colors cursor-pointer group"
            >
              <div className="text-left">
                <p className="font-['DM_Sans',sans-serif] text-sm text-white/70 group-hover:text-white/90 transition-colors">{item.label}</p>
                <p className="font-['DM_Sans',sans-serif] text-xs text-white/25 mt-0.5">{item.sub}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/20 group-hover:text-white/50 shrink-0 transition-colors">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
