import React from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { API_BASE, clearAuthAndRedirect } from './utils';
import dashboardBg from '../../assets/dashboard.png';

type UsageData = { used: number; limit: number; resets_at: string };

export default function UsagePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [usage, setUsage] = React.useState<UsageData | null>(null);
  const [error, setError] = React.useState('');

  const logout = () => { clearAuthAndRedirect(); navigate('/login'); };

  React.useEffect(() => {
    fetch(`${API_BASE}/api/v1/submissions/usage`, { credentials: 'include' })
      .then(async res => {
        if (res.status === 401) { logout(); return; }
        if (!res.ok) throw new Error(`Error ${res.status}`);
        setUsage(await res.json());
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to load usage data');
      });
  }, []);

  const pct = usage ? Math.min(100, (usage.used / usage.limit) * 100) : 0;
  const remaining = usage ? Math.max(0, usage.limit - usage.used) : null;
  const atLimit = usage !== null && usage.used >= usage.limit;
  const resetLabel = usage
    ? new Date(usage.resets_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })
    : '—';

  return (
    <div>
      {/* Page header */}
      <div
        className="border-b border-white/[0.08] px-6 py-5 relative overflow-hidden"
        style={{ backgroundImage: `url(${dashboardBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-[#030028]/70" />
        <div className="relative">
          <h1 className="font-['DM_Sans',sans-serif] font-bold text-xl text-white leading-tight">{t('usage.title')}</h1>
          <p className="font-['DM_Sans',sans-serif] text-xs text-white/40 mt-0.5">{t('usage.subtitle')}</p>
        </div>
      </div>

      {error && (
        <div className="border-b border-white/[0.08] px-6 py-3">
          <p className="font-['DM_Sans',sans-serif] text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-white/[0.08]">
        <div className="px-6 py-5 border-b sm:border-b-0 sm:border-r border-white/[0.08]">
          <p className="font-['DM_Sans',sans-serif] text-xs text-white/30 uppercase tracking-wide mb-3">{t('usage.stats.usedThisMonth')}</p>
          {usage !== null
            ? <p className={`font-['DM_Sans',sans-serif] text-2xl font-bold leading-none ${atLimit ? 'text-red-400/80' : 'text-white'}`}>{usage.used}</p>
            : <span className="inline-block h-7 w-14 rounded bg-white/[0.07] animate-pulse" />
          }
          <p className="font-['DM_Sans',sans-serif] text-xs text-white/25 mt-1.5">
            {t('usage.stats.of')} {usage !== null ? usage.limit : <span className="inline-block h-3 w-8 rounded bg-white/[0.07] animate-pulse align-middle" />} {t('usage.stats.included')}
          </p>
        </div>
        <div className="px-6 py-5 border-b sm:border-b-0 sm:border-r border-white/[0.08]">
          <p className="font-['DM_Sans',sans-serif] text-xs text-white/30 uppercase tracking-wide mb-3">{t('usage.stats.remaining')}</p>
          {remaining !== null
            ? <p className="font-['DM_Sans',sans-serif] text-2xl font-bold text-white leading-none">{remaining}</p>
            : <span className="inline-block h-7 w-14 rounded bg-white/[0.07] animate-pulse" />
          }
          <p className="font-['DM_Sans',sans-serif] text-xs text-white/25 mt-1.5">{t('usage.stats.submissionsLeft')}</p>
        </div>
        <div className="px-6 py-5">
          <p className="font-['DM_Sans',sans-serif] text-xs text-white/30 uppercase tracking-wide mb-3">{t('usage.stats.resets')}</p>
          {usage !== null
            ? <p className="font-['DM_Sans',sans-serif] text-2xl font-bold text-white leading-none">{resetLabel}</p>
            : <span className="inline-block h-7 w-20 rounded bg-white/[0.07] animate-pulse" />
          }
          <p className="font-['DM_Sans',sans-serif] text-xs text-white/25 mt-1.5">{t('usage.stats.counterResets')}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="border-b border-white/[0.08] px-6 py-5">
        <div className="flex items-center justify-between mb-2.5">
          {usage !== null
            ? <p className="font-['DM_Sans',sans-serif] text-xs text-white/40">{t('usage.progress.used', { used: usage.used, limit: usage.limit })}</p>
            : <span className="inline-block h-3 w-36 rounded bg-white/[0.07] animate-pulse" />
          }
          {usage !== null && (
            <p className="font-['DM_Sans',sans-serif] text-xs text-white/30">{Math.round(pct)}%</p>
          )}
        </div>
        <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              pct >= 100 ? 'bg-red-400/70' : pct >= 80 ? 'bg-orange-400/60' : 'bg-[#a89fff]'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {atLimit && (
          <p className="font-['DM_Sans',sans-serif] text-xs text-red-400/70 mt-2.5">
            {t('usage.progress.atLimit', { date: resetLabel })}
          </p>
        )}
        {!atLimit && pct >= 80 && (
          <p className="font-['DM_Sans',sans-serif] text-xs text-orange-400/60 mt-2.5">
            {t('usage.progress.warning', { percent: Math.round(pct) })}
          </p>
        )}
      </div>

      {/* Plan details */}
      <div className="border-b border-white/[0.08] px-6 py-4 bg-white/[0.02]">
        <p className="font-['DM_Sans',sans-serif] font-semibold text-xs text-white/40 uppercase tracking-wide">{t('usage.plan.title')}</p>
      </div>
      <div className="border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
        <div>
          <p className="font-['DM_Sans',sans-serif] text-sm text-white/60">{t('usage.plan.free')}</p>
          <p className="font-['DM_Sans',sans-serif] text-xs text-white/25 mt-0.5">
            {usage !== null ? t('usage.plan.details', { limit: usage.limit }) : <span className="inline-block h-3 w-8 rounded bg-white/[0.07] animate-pulse align-middle" />}
          </p>
        </div>
        <span className="font-['DM_Sans',sans-serif] text-xs text-white/20 border border-white/[0.08] px-2 py-0.5">{t('usage.plan.current')}</span>
      </div>
    </div>
  );
}
