import React from 'react';
import { useNavigate } from 'react-router';
import { API_BASE, clearAuthAndRedirect } from './utils';
import dashboardBg from '../../assets/dashboard.png';

const MONTHLY_LIMIT = 300;

type Submission = { submitted_at: number };

function getMonthBounds() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return {
    startTs: Math.floor(start.getTime() / 1000),
    resetLabel: next.toLocaleDateString(undefined, { month: 'long', day: 'numeric' }),
  };
}

export default function UsagePage() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = React.useState<Submission[] | null>(null);
  const [error, setError] = React.useState('');

  const logout = () => { clearAuthAndRedirect(); navigate('/login'); };

  React.useEffect(() => {
    fetch(`${API_BASE}/api/v1/submissions?limit=400`, { credentials: 'include' })
      .then(async res => {
        if (res.status === 401) { logout(); return; }
        if (!res.ok) throw new Error(`Error ${res.status}`);
        setSubmissions(await res.json());
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to load usage data');
        setSubmissions([]);
      });
  }, []);

  const { startTs, resetLabel } = getMonthBounds();

  const usedThisMonth = submissions
    ? submissions.filter(s => s.submitted_at >= startTs).length
    : null;
  const remaining = usedThisMonth !== null ? Math.max(0, MONTHLY_LIMIT - usedThisMonth) : null;
  const pct = usedThisMonth !== null ? Math.min(100, (usedThisMonth / MONTHLY_LIMIT) * 100) : 0;
  const atLimit = usedThisMonth !== null && usedThisMonth >= MONTHLY_LIMIT;

  return (
    <div>
      {/* Page header */}
      <div
        className="border-b border-white/[0.08] px-6 py-5 relative overflow-hidden"
        style={{ backgroundImage: `url(${dashboardBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-[#030028]/70" />
        <div className="relative">
          <h1 className="font-['DM_Sans',sans-serif] font-bold text-xl text-white leading-tight">Usage</h1>
          <p className="font-['DM_Sans',sans-serif] text-xs text-white/40 mt-0.5">Submission volume and plan limits</p>
        </div>
      </div>

      {error && (
        <div className="border-b border-white/[0.08] px-6 py-3">
          <p className="font-['DM_Sans',sans-serif] text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 border-b border-white/[0.08]">
        <div className="px-6 py-5 border-r border-white/[0.08]">
          <p className="font-['DM_Sans',sans-serif] text-xs text-white/30 uppercase tracking-wide mb-3">Used this month</p>
          <p className={`font-['DM_Sans',sans-serif] text-2xl font-bold leading-none ${atLimit ? 'text-red-400/80' : 'text-white'}`}>
            {usedThisMonth !== null ? usedThisMonth : '—'}
          </p>
          <p className="font-['DM_Sans',sans-serif] text-xs text-white/25 mt-1.5">of {MONTHLY_LIMIT} included</p>
        </div>
        <div className="px-6 py-5 border-r border-white/[0.08]">
          <p className="font-['DM_Sans',sans-serif] text-xs text-white/30 uppercase tracking-wide mb-3">Remaining</p>
          <p className="font-['DM_Sans',sans-serif] text-2xl font-bold text-white leading-none">
            {remaining !== null ? remaining : '—'}
          </p>
          <p className="font-['DM_Sans',sans-serif] text-xs text-white/25 mt-1.5">submissions left</p>
        </div>
        <div className="px-6 py-5">
          <p className="font-['DM_Sans',sans-serif] text-xs text-white/30 uppercase tracking-wide mb-3">Resets</p>
          <p className="font-['DM_Sans',sans-serif] text-2xl font-bold text-white leading-none">
            {resetLabel}
          </p>
          <p className="font-['DM_Sans',sans-serif] text-xs text-white/25 mt-1.5">counter resets</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="border-b border-white/[0.08] px-6 py-5">
        <div className="flex items-center justify-between mb-2.5">
          <p className="font-['DM_Sans',sans-serif] text-xs text-white/40">
            {usedThisMonth !== null
              ? `${usedThisMonth} / ${MONTHLY_LIMIT} submissions used`
              : 'Loading…'}
          </p>
          {usedThisMonth !== null && (
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
            You've reached your monthly limit. New submissions will be rejected until {resetLabel}.
          </p>
        )}
        {!atLimit && pct >= 80 && (
          <p className="font-['DM_Sans',sans-serif] text-xs text-orange-400/60 mt-2.5">
            You're using {Math.round(pct)}% of your monthly limit.
          </p>
        )}
      </div>

      {/* Plan details */}
      <div className="border-b border-white/[0.08] px-6 py-4 bg-white/[0.02]">
        <p className="font-['DM_Sans',sans-serif] font-semibold text-xs text-white/40 uppercase tracking-wide">Plan</p>
      </div>
      <div className="border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
        <div>
          <p className="font-['DM_Sans',sans-serif] text-sm text-white/60">Free</p>
          <p className="font-['DM_Sans',sans-serif] text-xs text-white/25 mt-0.5">{MONTHLY_LIMIT} submissions / month</p>
        </div>
        <span className="font-['DM_Sans',sans-serif] text-xs text-white/20 border border-white/[0.08] px-2 py-0.5">Current plan</span>
      </div>
    </div>
  );
}
