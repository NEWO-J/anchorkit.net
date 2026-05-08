import React from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { API_BASE, getCsrfToken, clearAuthAndRedirect } from './utils';
import dashboardBg from '../../assets/dashboard.png';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/api/v1/account/notifications`, {
        method: 'PATCH', credentials: 'include',
        headers: { 'X-CSRF-Token': getCsrfToken(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: next }),
      });
      if (res.status === 401) { logout(); return; }
      const data = await res.json();
      if (!res.ok) { setBatchNotifications(!next); setError(data.detail ?? `Error ${res.status}`); }
    } catch (err) {
      setBatchNotifications(!next);
      setError(err instanceof Error ? err.message : 'Failed to update notifications');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div
        className="border-b border-white/[0.08] px-6 py-5 relative overflow-hidden"
        style={{ backgroundImage: `url(${dashboardBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-[#030028]/70" />
        <div className="relative">
          <h1 className="font-['DM_Sans',sans-serif] font-bold text-xl text-white leading-tight">{t('notifications.title')}</h1>
          <p className="font-['DM_Sans',sans-serif] text-xs text-white/40 mt-0.5">{t('notifications.subtitle')}</p>
        </div>
      </div>

      {error && (
        <div className="border-b border-white/[0.08] px-6 py-3">
          <p className="text-red-400 font-['DM_Sans',sans-serif] text-sm">{error}</p>
        </div>
      )}

      <div className="border-b border-white/[0.08] px-6 py-4 bg-white/[0.02]">
        <p className="font-['DM_Sans',sans-serif] font-semibold text-xs text-white/40 uppercase tracking-wide">{t('notifications.emailNotifications')}</p>
      </div>

      <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
        <div>
          <p className="font-['DM_Sans',sans-serif] text-sm text-white/70">{t('notifications.batchTitle')}</p>
          <p className="font-['DM_Sans',sans-serif] text-xs text-white/30 mt-0.5">
            {t('notifications.batchDescription')}
          </p>
        </div>
        {!fetched ? (
          <div className="w-10 h-5 bg-white/[0.06]" />
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

      <div className="px-6 py-4">
        <p className="font-['DM_Sans',sans-serif] text-xs text-white/20">
          {t('notifications.footer')}
        </p>
      </div>
    </div>
  );
}
