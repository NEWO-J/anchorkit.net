import React from 'react';
import { useNavigate } from 'react-router';
import { API_BASE, getCsrfToken, clearAuthAndRedirect } from './utils';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [batchNotifications, setBatchNotifications] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [fetched, setFetched] = React.useState(false);
  const [error, setError] = React.useState('');

  const logout = () => { clearAuthAndRedirect(); navigate('/login'); };

  React.useEffect(() => {
    fetch(`${API_BASE}/api/v1/keys`, { credentials: 'include' })
      .then(async res => {
        if (res.status === 401) { logout(); return; }
        if (!res.ok) return;
        const data = await res.json();
        setBatchNotifications(data.batch_notifications ?? true);
        setFetched(true);
      })
      .catch(() => setFetched(true));
  }, []);

  const handleToggle = async () => {
    if (loading) return;
    const next = !batchNotifications;
    setBatchNotifications(next);
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/v1/account/notifications`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'X-CSRF-Token': getCsrfToken(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: next }),
      });
      if (res.status === 401) { logout(); return; }
      const data = await res.json();
      if (!res.ok) {
        setBatchNotifications(!next);
        setError(data.detail ?? `Error ${res.status}`);
      }
    } catch (err) {
      setBatchNotifications(!next);
      setError(err instanceof Error ? err.message : 'Failed to update notifications');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h1 className="font-['DM_Sans',sans-serif] font-bold text-2xl text-white">Notifications</h1>
        <p className="font-['DM_Sans',sans-serif] text-sm text-white/30 mt-1">Control when and how you receive updates from AnchorKit.</p>
      </div>

      {error && <p className="text-red-400 font-['DM_Sans',sans-serif] text-sm mb-4">{error}</p>}

      <div className="border border-white/[0.08] rounded-[8px] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] bg-white/[0.02]">
          <p className="font-['DM_Sans',sans-serif] font-semibold text-sm text-white/70">Email notifications</p>
        </div>

        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="font-['DM_Sans',sans-serif] text-sm text-white/70">Batch anchor summaries</p>
            <p className="font-['DM_Sans',sans-serif] text-xs text-white/30 mt-0.5">
              Receive a daily email when a nightly batch is anchored to Solana
            </p>
          </div>
          {!fetched ? (
            <div className="w-10 h-5 rounded-full bg-white/[0.06]" />
          ) : (
            <button
              role="switch"
              aria-checked={batchNotifications}
              onClick={handleToggle}
              disabled={loading}
              className={`relative inline-flex h-[22px] w-[40px] shrink-0 items-center rounded-full transition-colors cursor-pointer disabled:opacity-50
                          ${batchNotifications ? 'bg-white/30' : 'bg-white/[0.10]'}`}
            >
              <span className={`inline-block h-[16px] w-[16px] rounded-full bg-white shadow transition-transform
                              ${batchNotifications ? 'translate-x-[20px]' : 'translate-x-[3px]'}`} />
            </button>
          )}
        </div>
      </div>

      <p className="font-['DM_Sans',sans-serif] text-xs text-white/20 mt-4">
        Notifications are sent to the email address associated with your account.
      </p>
    </div>
  );
}
