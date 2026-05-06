import React from 'react';
import { useNavigate } from 'react-router';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Label } from 'recharts';
import { API_BASE, clearAuthAndRedirect } from './utils';
import dashboardBg from '../../assets/dashboard.png';

type KeyData = { api_key: string; email: string; key_paused: boolean };
type Webhook = { webhook_id: string };
type SubmissionCounts = { total: number; anchored: number };
type Submission = { day: string; status: 'anchored' | 'pending' };
type UsageData = { used: number; limit: number; resets_at: string };
type Range = '7d' | '30d' | 'ytd';

function rangeDays(range: Range): number {
  if (range === '7d') return 7;
  if (range === '30d') return 30;
  const now = new Date();
  return Math.floor((now.getTime() - Date.UTC(now.getUTCFullYear(), 0, 1)) / 86400000) + 1;
}

function buildDailyChart(submissions: Submission[], range: Range): { date: string; label: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const s of submissions) {
    counts[s.day] = (counts[s.day] || 0) + 1;
  }
  const days = rangeDays(range);
  const result = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    result.push({ date: key, label, count: counts[key] || 0 });
  }
  return result;
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#050035] border border-white/[0.12] px-3 py-2 font-['DM_Sans',sans-serif]">
      <p className="text-xs text-white/50">{label}</p>
      <p className="text-sm font-bold text-white mt-0.5">
        {payload[0].value} submission{payload[0].value !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#050035] border border-white/[0.12] px-3 py-2 font-['DM_Sans',sans-serif]">
      <p className="text-xs text-white/50">{payload[0].name}</p>
      <p className="text-sm font-bold text-white mt-0.5">{payload[0].value}</p>
    </div>
  );
}

export default function OverviewPage() {
  const navigate = useNavigate();
  const [keyData, setKeyData] = React.useState<KeyData | null>(null);
  const [webhooks, setWebhooks] = React.useState<Webhook[] | null>(null);
  const [counts, setCounts] = React.useState<SubmissionCounts | null>(null);
  const [chartSubmissions, setChartSubmissions] = React.useState<Submission[] | null>(null);
  const [usageData, setUsageData] = React.useState<UsageData | null>(null);
  const [range, setRange] = React.useState<Range>('30d');
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

    fetch(`${API_BASE}/api/v1/submissions/count`, { credentials: 'include' })
      .then(async res => { if (res.ok) setCounts(await res.json()); })
      .catch(() => {});

    fetch(`${API_BASE}/api/v1/submissions?limit=200`, { credentials: 'include' })
      .then(async res => { if (res.ok) setChartSubmissions(await res.json()); })
      .catch(() => {});

    fetch(`${API_BASE}/api/v1/submissions/usage`, { credentials: 'include' })
      .then(async res => { if (res.ok) setUsageData(await res.json()); })
      .catch(() => {});
  }, []);

  const chartData = React.useMemo(
    () => chartSubmissions ? buildDailyChart(chartSubmissions, range) : null,
    [chartSubmissions, range],
  );

  const xAxisInterval = range === '7d' ? 0 : range === '30d' ? 5 : Math.floor(rangeDays('ytd') / 6);

  const stats = [
    {
      label: 'API Key',
      value: keyData ? (keyData.key_paused ? 'Paused' : 'Active') : '—',
      sub: keyData ? keyData.api_key.slice(0, 10) + '…' : undefined,
      path: '/dashboard/developers',
    },
    {
      label: 'Webhooks',
      value: webhooks !== null ? String(webhooks.length) : '—',
      sub: webhooks !== null ? (webhooks.length === 1 ? 'endpoint' : 'endpoints') : undefined,
      path: '/dashboard/developers',
    },
    {
      label: 'Submissions',
      value: counts !== null ? String(counts.total) : '—',
      sub: counts !== null ? (counts.total === 1 ? 'hash submitted' : 'hashes submitted') : undefined,
      path: '/dashboard/submissions',
    },
    {
      label: 'Anchored',
      value: counts !== null ? String(counts.anchored) : '—',
      sub: counts !== null ? (counts.anchored === 1 ? 'hash confirmed' : 'hashes confirmed') : undefined,
      path: '/dashboard/submissions',
    },
  ];

  const quickLinks = [
    { label: 'View your API key', sub: 'Reveal, copy, regenerate or pause your key', path: '/dashboard/developers' },
    { label: 'Manage webhooks', sub: 'Register endpoints to receive anchor notifications', path: '/dashboard/developers' },
    { label: 'Account settings', sub: 'Update email or delete your account', path: '/dashboard/settings' },
  ];

  return (
    <div className="border-b border-white/[0.08]">
      {/* Page header */}
      <div
        className="border-b border-white/[0.08] px-6 py-5 relative overflow-hidden"
        style={{ backgroundImage: `url(${dashboardBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-[#030028]/70" />
        <div className="relative">
          <h1 className="font-['DM_Sans',sans-serif] font-bold text-xl text-white leading-tight">Overview</h1>
          {keyData?.email && (
            <p className="font-['DM_Sans',sans-serif] text-xs text-white/40 mt-0.5">{keyData.email}</p>
          )}
        </div>
      </div>

      {error && (
        <div className="border-b border-white/[0.08] px-6 py-3">
          <p className="font-['DM_Sans',sans-serif] text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-white/[0.08]">
        {stats.map((s, i) => {
          const borderCls = [
            'border-white/[0.08] border-r border-b lg:border-b-0',
            'border-white/[0.08] border-b lg:border-b-0 lg:border-r',
            'border-white/[0.08] border-r',
            '',
          ][i] ?? '';
          return (
          <button
            key={s.label}
            onClick={() => navigate(s.path)}
            className={`px-6 py-5 text-left hover:bg-white/[0.03] transition-colors cursor-pointer group ${borderCls}`}
          >
            <p className="font-['DM_Sans',sans-serif] text-xs text-white/30 uppercase tracking-wide mb-3">{s.label}</p>
            <p className="font-['DM_Sans',sans-serif] text-2xl font-bold text-white leading-none group-hover:text-white/90">{s.value}</p>
            {s.sub && <p className="font-['DM_Sans',sans-serif] text-xs text-white/25 mt-1.5">{s.sub}</p>}
          </button>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="border-b border-white/[0.08] grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_240px]">
        {/* Bar chart */}
        <div className="border-b border-white/[0.08] md:border-b-0 md:border-r md:border-white/[0.08]">
          <div className="border-b border-white/[0.08] px-6 py-3 bg-white/[0.02] flex items-center justify-between">
            <p className="font-['DM_Sans',sans-serif] font-semibold text-sm text-white/60">Daily submissions</p>
            <div className="flex border border-white/[0.08]">
              {(['7d', '30d', 'ytd'] as Range[]).map((r, i) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-1 font-['DM_Sans',sans-serif] text-xs transition-colors cursor-pointer
                    ${i > 0 ? 'border-l border-white/[0.08]' : ''}
                    ${range === r ? 'bg-white/[0.08] text-white' : 'text-white/30 hover:text-white/60 hover:bg-white/[0.03]'}`}
                >
                  {r === 'ytd' ? 'YTD' : r === '7d' ? '7D' : '30D'}
                </button>
              ))}
            </div>
          </div>
          <div className="px-4 py-4">
            {chartData === null ? (
              <div className="h-[160px] flex items-center justify-center">
                <p className="font-['DM_Sans',sans-serif] text-xs text-white/25">Loading…</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={chartData} barCategoryGap="30%" margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10, fontFamily: 'DM Sans, sans-serif' }}
                    tickLine={false}
                    axisLine={false}
                    interval={xAxisInterval}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10, fontFamily: 'DM Sans, sans-serif' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="count" fill="#a89fff" radius={0} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Pie chart — monthly usage */}
        <div className="flex flex-col">
          <div className="border-b border-white/[0.08] px-4 py-3 bg-white/[0.02] flex items-center min-h-[50px]">
            <p className="font-['DM_Sans',sans-serif] font-semibold text-sm text-white/60">Usage</p>
          </div>
          <div className="flex flex-col items-center justify-center flex-1 py-3 gap-3">
            {usageData === null ? (
              <p className="font-['DM_Sans',sans-serif] text-xs text-white/25">Loading…</p>
            ) : (() => {
              const pct = Math.min(100, usageData.limit > 0 ? (usageData.used / usageData.limit) * 100 : 0);
              const remaining = Math.max(0, usageData.limit - usageData.used);
              const usedColor = pct >= 100 ? 'rgba(248,113,113,0.75)' : pct >= 80 ? 'rgba(251,146,60,0.65)' : '#a89fff';
              const labelColor = pct >= 100 ? 'rgba(248,113,113,0.85)' : pct >= 80 ? 'rgba(251,146,60,0.8)' : 'rgba(255,255,255,0.75)';
              return (
                <>
                  <PieChart width={170} height={150}>
                    <Pie
                      data={[
                        { name: 'Used', value: usageData.used || (pct === 0 ? 0 : usageData.used) },
                        { name: 'Remaining', value: remaining || (pct === 100 ? 0 : remaining) },
                      ]}
                      cx={85} cy={72}
                      innerRadius={44} outerRadius={62}
                      dataKey="value"
                      startAngle={90} endAngle={-270}
                      strokeWidth={0}
                    >
                      <Cell fill={usedColor} />
                      <Cell fill="rgba(255,255,255,0.08)" />
                      <Label
                        content={({ viewBox }: any) => {
                          const { cx, cy } = viewBox;
                          return (
                            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
                              style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', fontWeight: '700', fill: labelColor }}>
                              {Math.round(pct)}%
                            </text>
                          );
                        }}
                      />
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                  <div className="flex flex-col gap-1.5 w-full px-4">
                    {[
                      { label: 'Used', value: usageData.used, color: usedColor },
                      { label: 'Remaining', value: remaining, color: 'rgba(255,255,255,0.18)' },
                    ].map(d => (
                      <div key={d.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: d.color }} />
                          <span className="font-['DM_Sans',sans-serif] text-xs text-white/35">{d.label}</span>
                        </div>
                        <span className="font-['DM_Sans',sans-serif] text-xs text-white/55 font-medium">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
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
