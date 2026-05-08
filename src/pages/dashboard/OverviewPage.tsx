import React from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Label } from 'recharts';
import { ArrowUpRight } from 'lucide-react';
import { API_BASE, clearAuthAndRedirect } from './utils';

type KeyData   = { api_key: string; email: string; key_paused: boolean };
type Webhook   = { webhook_id: string };
type SubmissionCounts = { total: number; anchored: number };
type Submission = { day: string; status: 'anchored' | 'pending'; submitted_at: number };
type UsageData = { used: number; limit: number; resets_at: string };
type Range     = '24h' | '7d' | '30d' | 'ytd';

function rangeDays(range: Exclude<Range, '24h'>): number {
  if (range === '7d') return 7;
  if (range === '30d') return 30;
  const now = new Date();
  return Math.floor((now.getTime() - Date.UTC(now.getUTCFullYear(), 0, 1)) / 86400000) + 1;
}

function build24hChart(submissions: Submission[]): { label: string; count: number }[] {
  const now = Date.now();
  const slotMs = 3600000;
  const currentSlot = Math.floor(now / slotMs) * slotMs;
  const result = [];
  for (let i = 23; i >= 0; i--) {
    const slotStart = currentSlot - i * slotMs;
    const slotEnd   = slotStart + slotMs;
    const count = submissions.filter(s => {
      const ms = s.submitted_at * 1000;
      return ms >= slotStart && ms < slotEnd;
    }).length;
    const label = new Date(slotStart).toLocaleTimeString(undefined, { hour: 'numeric', hour12: true });
    result.push({ label, count });
  }
  return result;
}

function buildDailyChart(submissions: Submission[], range: Exclude<Range, '24h'>): { date: string; label: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const s of submissions) {
    counts[s.day] = (counts[s.day] || 0) + 1;
  }
  const days  = rangeDays(range);
  const result = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const key   = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    result.push({ date: key, label, count: counts[key] || 0 });
  }
  return result;
}

function Sparkline({ data, color = '#a89fff', width = 72, height = 32, id }: {
  data: number[]; color?: string; width?: number; height?: number; id: string;
}) {
  if (data.length < 2) return null;
  const max  = Math.max(...data, 1);
  const min  = Math.min(...data);
  const span = max - min || 1;
  const pts  = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((v - min) / span) * (height - 4) - 2,
  }));
  const linePts  = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPath = [
    `M ${pts[0].x.toFixed(1)},${height}`,
    ...pts.map(p => `L ${p.x.toFixed(1)},${p.y.toFixed(1)}`),
    `L ${pts[pts.length - 1].x.toFixed(1)},${height}`,
    'Z',
  ].join(' ');
  return (
    <svg width={width} height={height} style={{ overflow: 'visible', display: 'block' }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity={0.22} />
          <stop offset="100%" stopColor={color} stopOpacity={0.01} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${id})`} />
      <polyline points={linePts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  const { t } = useTranslation();
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(4,0,42,0.97)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 8,
      padding: '8px 12px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 3 }}>{label}</p>
      <p style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>
        {t('overview.chart.submission', { count: payload[0].value })}
      </p>
    </div>
  );
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(4,0,42,0.97)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 8,
      padding: '8px 12px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 3 }}>{payload[0].name}</p>
      <p style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{payload[0].value}</p>
    </div>
  );
}

/* Per-card static accent colors for the top 1px highlight line */
const CARD_ACCENTS: string[] = ['#ff7608', '#a89fff', '#a89fff', '#34d399'];

export default function OverviewPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [keyData,          setKeyData]          = React.useState<KeyData | null>(null);
  const [webhooks,         setWebhooks]         = React.useState<Webhook[] | null>(null);
  const [counts,           setCounts]           = React.useState<SubmissionCounts | null>(null);
  const [chartSubmissions, setChartSubmissions] = React.useState<Submission[] | null>(null);
  const [usageData,        setUsageData]        = React.useState<UsageData | null>(null);
  const [range,            setRange]            = React.useState<Range>('30d');
  const [error,            setError]            = React.useState('');
  const [rightWidth,       setRightWidth]       = React.useState(190);

  const logout = () => { clearAuthAndRedirect(); navigate('/login'); };

  const onHandleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX     = e.clientX;
    const startWidth = rightWidth;
    const onMove = (ev: MouseEvent) => {
      setRightWidth(Math.max(150, Math.min(340, startWidth - (ev.clientX - startX))));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
  };

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
    () => chartSubmissions
      ? range === '24h'
        ? build24hChart(chartSubmissions)
        : buildDailyChart(chartSubmissions, range)
      : null,
    [chartSubmissions, range],
  );

  const sparkline7d = React.useMemo(() => {
    if (!chartSubmissions) return null;
    const today = new Date();
    const total: number[] = [];
    const anchored: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setUTCDate(d.getUTCDate() - i);
      const key = d.toISOString().slice(0, 10);
      total.push(chartSubmissions.filter(s => s.day === key).length);
      anchored.push(chartSubmissions.filter(s => s.day === key && s.status === 'anchored').length);
    }
    return { total, anchored };
  }, [chartSubmissions]);

  const xAxisInterval = range === '24h' ? 3 : range === '7d' ? 0 : range === '30d' ? 5 : Math.floor(rangeDays('ytd') / 6);
  const pieScale  = Math.min(rightWidth / 190, 1.6);
  const pieW      = Math.round(130 * pieScale);
  const pieH      = Math.round(110 * pieScale);
  const pieCx     = Math.round(65  * pieScale);
  const pieCy     = Math.round(52  * pieScale);
  const pieInner  = Math.round(34  * pieScale);
  const pieOuter  = Math.round(48  * pieScale);
  const rowHeight = 51 + 24 + pieH + 12 + 38;

  const stats = [
    {
      label:      t('overview.stats.apiKey'),
      value:      keyData ? (keyData.key_paused ? t('overview.stats.paused') : t('overview.stats.active')) : null,
      sub:        keyData ? keyData.api_key.slice(0, 10) + '…' : undefined,
      path:       '/dashboard/developers',
      mono:       false,
      valueColor: keyData ? (keyData.key_paused ? 'rgba(251,113,133,0.90)' : '#34d399') : undefined,
      sparkline:  null as number[] | null,
    },
    {
      label:      t('overview.stats.webhooks'),
      value:      webhooks !== null ? String(webhooks.length) : null,
      sub:        webhooks !== null ? t('overview.stats.endpoint', { count: webhooks.length }) : undefined,
      path:       '/dashboard/developers',
      mono:       true,
      valueColor: undefined as string | undefined,
      sparkline:  null as number[] | null,
    },
    {
      label:      t('overview.stats.submissions'),
      value:      counts !== null ? String(counts.total) : null,
      sub:        counts !== null ? t('overview.stats.hashSubmitted', { count: counts.total }) : undefined,
      path:       '/dashboard/submissions',
      mono:       true,
      valueColor: undefined as string | undefined,
      sparkline:  sparkline7d?.total ?? null,
    },
    {
      label:      t('overview.stats.anchored'),
      value:      counts !== null ? String(counts.anchored) : null,
      sub:        counts !== null ? t('overview.stats.hashConfirmed', { count: counts.anchored }) : undefined,
      path:       '/dashboard/submissions',
      mono:       true,
      valueColor: '#34d399' as string | undefined,
      sparkline:  sparkline7d?.anchored ?? null,
    },
  ];

  const quickLinks = [
    { label: t('overview.quickActions.viewApiKey'),     sub: t('overview.quickActions.viewApiKeySub'),     path: '/dashboard/developers' },
    { label: t('overview.quickActions.manageWebhooks'), sub: t('overview.quickActions.manageWebhooksSub'), path: '/dashboard/developers' },
    { label: t('overview.quickActions.accountSettings'),sub: t('overview.quickActions.accountSettingsSub'),path: '/dashboard/settings'   },
  ];

  return (
    <div className="page-enter border-b border-white/[0.08]">

      {/* Page header */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '20px 24px' }}>
        <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 20, color: 'rgba(255,255,255,0.94)', lineHeight: 1.2 }}>
          {t('overview.title')}
        </h1>
        {keyData?.email && (
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.38)', marginTop: 3 }}>
            {keyData.email}
          </p>
        )}
      </div>

      {error && (
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '12px 24px' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(251,113,133,0.85)' }}>{error}</p>
        </div>
      )}

      {/* ── Stat cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {stats.map((s, i) => {
          const borderCls = [
            'border-r border-b lg:border-b-0 border-white/[0.08]',
            'border-b lg:border-b-0 lg:border-r border-white/[0.08]',
            'border-r border-white/[0.08]',
            '',
          ][i] ?? '';
          const accent = CARD_ACCENTS[i];
          return (
            <button
              key={s.label}
              onClick={() => navigate(s.path)}
              className={`relative text-left group cursor-pointer transition-colors hover:bg-white/[0.025] overflow-hidden ${borderCls}`}
              style={{ padding: '20px 24px' }}
            >
              {/* Top accent line — 1px gradient from accent color */}
              <div
                aria-hidden
                style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                  background: `linear-gradient(90deg, ${accent}99 0%, ${accent}00 65%)`,
                  pointerEvents: 'none',
                }}
              />
              {/* Subtle interior highlight */}
              <div
                aria-hidden
                style={{
                  position: 'absolute', inset: 0,
                  background: `linear-gradient(160deg, ${accent}08 0%, transparent 45%)`,
                  pointerEvents: 'none',
                  transition: 'opacity 180ms ease',
                }}
                className="opacity-0 group-hover:opacity-100"
              />

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.40)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {s.label}
                </p>
                {s.sparkline && s.sparkline.length > 1 && (
                  <div style={{ opacity: 0.45, flexShrink: 0, marginLeft: 8, transition: 'opacity 180ms ease' }} className="group-hover:opacity-80">
                    <Sparkline data={s.sparkline} color={s.valueColor ?? '#a89fff'} id={`spark-${i}`} />
                  </div>
                )}
              </div>

              {s.value === null
                ? <div className="skeleton" style={{ height: 28, width: 56, marginBottom: 6 }} />
                : <p
                    style={{
                      fontFamily: s.mono ? "'DM Mono', monospace" : "'DM Sans', sans-serif",
                      fontSize: 26, fontWeight: 700, lineHeight: 1,
                      color: s.valueColor ?? 'rgba(255,255,255,0.94)',
                      letterSpacing: s.mono ? '-0.02em' : '-0.01em',
                      transition: 'opacity 180ms ease',
                    }}
                    className="group-hover:opacity-90"
                  >
                    {s.value}
                  </p>
              }
              {s.sub !== undefined && (
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.32)', marginTop: 6 }}>
                  {s.sub}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Charts row ───────────────────────────────────────────── */}
      <div
        className="flex flex-col md:flex-row"
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          ...(window.innerWidth >= 768 ? { height: rowHeight } : {}),
        }}
      >
        {/* Bar chart panel */}
        <div className="flex flex-col min-w-0 md:flex-1 border-b border-white/[0.08] md:border-b-0">
          <div
            className="flex items-center justify-between"
            style={{
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              padding: '10px 24px',
              background: 'rgba(255,255,255,0.015)',
            }}
          >
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
              {t('overview.chart.title')}
            </p>
            {/* Segmented range control */}
            <div style={{
              display: 'flex', alignItems: 'center', padding: 3,
              borderRadius: 8,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}>
              {(['24h', '7d', '30d', 'ytd'] as Range[]).map(r => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  style={{
                    padding: '3px 10px',
                    borderRadius: 5,
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 11, fontWeight: 500,
                    cursor: 'pointer', border: 'none',
                    background: range === r ? 'rgba(255,255,255,0.10)' : 'transparent',
                    color: range === r ? 'rgba(255,255,255,0.90)' : 'rgba(255,255,255,0.30)',
                    transition: 'all 140ms ease',
                  }}
                  onMouseEnter={e => { if (range !== r) (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.55)'; }}
                  onMouseLeave={e => { if (range !== r) (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.30)'; }}
                >
                  {r === 'ytd' ? 'YTD' : r === '7d' ? '7D' : r === '30d' ? '30D' : '24H'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: '16px 16px 16px 8px', flex: 1, minHeight: 0 }}>
            {chartData === null ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.22)' }}>
                  {t('overview.chart.loading')}
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barCategoryGap="32%" margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#a89fff" stopOpacity={0.85} />
                      <stop offset="100%" stopColor="#a89fff" stopOpacity={0.30} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="label"
                    tick={{ fill: 'rgba(255,255,255,0.22)', fontSize: 10, fontFamily: 'DM Sans, sans-serif' }}
                    tickLine={false} axisLine={false}
                    interval={xAxisInterval}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: 'rgba(255,255,255,0.22)', fontSize: 10, fontFamily: 'DM Sans, sans-serif' }}
                    tickLine={false} axisLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.035)' }} />
                  <Bar dataKey="count" fill="url(#barGrad)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Resize handle — desktop only */}
        <div
          onMouseDown={onHandleMouseDown}
          className="hidden md:flex items-center justify-center select-none cursor-col-resize"
          style={{
            width: 10, flexShrink: 0,
            borderLeft:  '1px solid rgba(255,255,255,0.08)',
            borderRight: '1px solid rgba(255,255,255,0.08)',
            background: 'transparent',
            transition: 'background 140ms ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {[0, 1, 2].map(n => (
              <span key={n} style={{ width: 3, height: 3, borderRadius: 9999, background: 'rgba(255,255,255,0.22)', display: 'block' }} />
            ))}
          </div>
        </div>

        {/* Donut chart — usage */}
        <div className="flex flex-col shrink-0" style={{ width: rightWidth }}>
          <div
            className="flex items-center"
            style={{
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              padding: '10px 16px',
              background: 'rgba(255,255,255,0.015)',
              minHeight: 50,
            }}
          >
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
              {t('overview.usage.title')}
            </p>
            <button
              onClick={() => navigate('/dashboard/usage')}
              style={{ marginLeft: 6, padding: 2, color: 'rgba(255,255,255,0.25)', cursor: 'pointer', background: 'none', border: 'none', lineHeight: 0, transition: 'color 140ms ease' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.55)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.25)'; }}
              title={t('overview.usage.goToUsage')}
            >
              <ArrowUpRight size={14} strokeWidth={2} />
            </button>
          </div>

          <div className="flex flex-col items-center justify-center flex-1 py-3 gap-3">
            {usageData === null ? (
              <div className="flex flex-col items-center gap-3 w-full px-4">
                <div className="skeleton rounded-full" style={{ width: Math.round(96 * pieScale), height: Math.round(96 * pieScale) }} />
                <div className="flex flex-col gap-1.5 w-full">
                  {[10, 14].map(w => (
                    <div key={w} className="flex items-center justify-between">
                      <div className="skeleton" style={{ height: 10, width: `${w * 4}px` }} />
                      <div className="skeleton" style={{ height: 10, width: 20 }} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (() => {
              const pct       = Math.min(100, usageData.limit > 0 ? (usageData.used / usageData.limit) * 100 : 0);
              const remaining = Math.max(0, usageData.limit - usageData.used);
              const usedColor  = pct >= 100 ? 'rgba(251,113,133,0.80)' : pct >= 80 ? 'rgba(251,191,36,0.70)' : '#a89fff';
              const labelColor = pct >= 100 ? 'rgba(251,113,133,0.90)' : pct >= 80 ? 'rgba(251,191,36,0.85)' : 'rgba(255,255,255,0.80)';
              return (
                <>
                  <PieChart width={pieW} height={pieH}>
                    <Pie
                      data={[
                        { name: t('overview.usage.used'),      value: usageData.used  || 0 },
                        { name: t('overview.usage.remaining'), value: remaining        || 0 },
                      ]}
                      cx={pieCx} cy={pieCy}
                      innerRadius={pieInner} outerRadius={pieOuter}
                      dataKey="value"
                      startAngle={90} endAngle={-270}
                      strokeWidth={0}
                    >
                      <Cell fill={usedColor} />
                      <Cell fill="rgba(255,255,255,0.07)" />
                      <Label
                        content={({ viewBox }: any) => {
                          const { cx, cy } = viewBox;
                          return (
                            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
                              style={{
                                fontFamily: 'DM Sans, sans-serif',
                                fontSize: `${Math.round(13 * pieScale)}px`,
                                fontWeight: '700',
                                fill: labelColor,
                              }}>
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
                      { label: t('overview.usage.used'),      value: usageData.used, color: usedColor },
                      { label: t('overview.usage.remaining'), value: remaining,       color: 'rgba(255,255,255,0.18)' },
                    ].map(d => (
                      <div key={d.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ width: 6, height: 6, borderRadius: 9999, background: d.color, flexShrink: 0 }} />
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{d.label}</span>
                        </div>
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.55)' }}>{d.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* ── Quick actions ─────────────────────────────────────────── */}
      <div>
        <div style={{
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '10px 24px',
          background: 'rgba(255,255,255,0.015)',
        }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
            {t('overview.quickActions.title')}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-5">
          {quickLinks.map(item => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="text-left group cursor-pointer"
              style={{
                padding: '16px 18px',
                borderRadius: 10,
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.07)',
                transition: 'all 160ms ease',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.background = 'rgba(255,255,255,0.045)';
                el.style.borderColor = 'rgba(255,255,255,0.12)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.background = 'rgba(255,255,255,0.025)';
                el.style.borderColor = 'rgba(255,255,255,0.07)';
              }}
            >
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 4, transition: 'color 140ms ease' }}
                className="group-hover:!text-white/85">
                {item.label}
              </p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.28)' }}>
                {item.sub}
              </p>
              <ArrowUpRight
                size={12} strokeWidth={2}
                style={{ marginTop: 10, color: 'rgba(255,255,255,0.18)', transition: 'color 140ms ease' }}
                className="group-hover:!text-[#ff7608]/50"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
