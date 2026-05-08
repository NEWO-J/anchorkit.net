import React from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { API_BASE, clearAuthAndRedirect } from './utils';

type Submission = {
  hash: string;
  submitted_at: number;
  day: string;
  media_type: string;
  hash_id: number;
  status: 'anchored' | 'pending';
  solana_tx: string | null;
  explorer_url: string | null;
  anchored_at: number | null;
  network: string | null;
};

type DateRange = 'all' | '7d' | '30d' | '90d';
type StatusFilter = 'all' | 'anchored' | 'pending';
type SortOrder = 'newest' | 'oldest';

function StatusBadge({ status }: { status: 'anchored' | 'pending' }) {
  const { t } = useTranslation();
  return status === 'anchored' ? (
    <span className="inline-flex items-center gap-1.5 font-['DM_Sans',sans-serif] text-xs text-green-400/80">
      <span className="w-1.5 h-1.5 rounded-full bg-green-400/80 shrink-0" />
      {t('submissions.status.anchored')}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 font-['DM_Sans',sans-serif] text-xs text-white/30">
      <span className="w-1.5 h-1.5 rounded-full bg-white/20 shrink-0" />
      {t('submissions.status.pending')}
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);
  const { t } = useTranslation();
  return (
    <button
      onClick={() => navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); })}
      title={t('submissions.table.copyHash')}
      className="ml-2 text-white/20 hover:text-white/50 transition-colors cursor-pointer shrink-0"
    >
      {copied ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
      )}
    </button>
  );
}

function FilterGroup({
  label,
  options,
  value,
  onChange,
  labelMap,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  labelMap?: Record<string, string>;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-['DM_Sans',sans-serif] text-xs text-white/30">{label}</span>
      <div className="flex rounded overflow-hidden border border-white/[0.08]">
        {options.map((opt, i) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-2.5 py-1 font-['DM_Sans',sans-serif] text-xs transition-colors cursor-pointer capitalize
              ${i > 0 ? 'border-l border-white/[0.08]' : ''}
              ${value === opt ? 'bg-white/[0.08] text-white' : 'text-white/30 hover:text-white/60 hover:bg-white/[0.03]'}`}
          >
            {labelMap?.[opt] ?? opt}
          </button>
        ))}
      </div>
    </div>
  );
}

const PAGE_SIZE = 50;

export default function SubmissionsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [submissions, setSubmissions] = React.useState<Submission[] | null>(null);
  const [error, setError] = React.useState('');
  const [dateRange, setDateRange] = React.useState<DateRange>('all');
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('all');
  const [mediaFilter, setMediaFilter] = React.useState<string>('all');
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('newest');
  const [page, setPage] = React.useState(1);

  const logout = () => { clearAuthAndRedirect(); navigate('/login'); };

  React.useEffect(() => {
    fetch(`${API_BASE}/api/v1/submissions`, { credentials: 'include' })
      .then(async res => {
        if (res.status === 401) { logout(); return; }
        if (!res.ok) throw new Error(`Error ${res.status}`);
        setSubmissions(await res.json());
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to load submissions');
        setSubmissions([]);
      });
  }, []);

  const mediaTypes = React.useMemo(() => {
    if (!submissions) return [];
    return [...new Set(submissions.map(s => s.media_type))].sort();
  }, [submissions]);

  const filtered = React.useMemo(() => {
    if (!submissions) return null;
    let result = [...submissions];

    if (dateRange !== 'all') {
      const cutoff = Date.now() / 1000 - (dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90) * 86400;
      result = result.filter(s => s.submitted_at >= cutoff);
    }
    if (statusFilter !== 'all') result = result.filter(s => s.status === statusFilter);
    if (mediaFilter !== 'all') result = result.filter(s => s.media_type === mediaFilter);

    result.sort((a, b) => sortOrder === 'newest' ? b.submitted_at - a.submitted_at : a.submitted_at - b.submitted_at);
    return result;
  }, [submissions, dateRange, statusFilter, mediaFilter, sortOrder]);

  const isFiltered = dateRange !== 'all' || statusFilter !== 'all' || mediaFilter !== 'all';

  React.useEffect(() => { setPage(1); }, [dateRange, statusFilter, mediaFilter, sortOrder]);

  const totalPages = filtered ? Math.ceil(filtered.length / PAGE_SIZE) : 1;
  const paginated = filtered ? filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) : null;

  return (
    <div>
      {/* Page header */}
      <div className="border-b border-white/[0.08] px-6 py-5">
        <h1 className="font-['DM_Sans',sans-serif] font-bold text-xl text-white leading-tight">{t('submissions.title')}</h1>
        {submissions !== null && (
          <p className="font-['DM_Sans',sans-serif] text-xs text-white/40 mt-0.5">
            {isFiltered && filtered && filtered.length !== submissions.length
              ? t('submissions.countOf', { count: filtered.length, total: submissions.length })
              : t('submissions.count', { count: submissions.length })}
          </p>
        )}
      </div>

      {/* Filter bar */}
      <div className="border-b border-white/[0.08] px-6 py-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <FilterGroup
          label={t('submissions.filter.date')}
          options={['all', '7d', '30d', '90d']}
          value={dateRange}
          onChange={v => setDateRange(v as DateRange)}
          labelMap={{ all: t('submissions.filter.all'), '7d': '7D', '30d': '30D', '90d': '90D' }}
        />
        <FilterGroup
          label={t('submissions.filter.status')}
          options={['all', 'pending', 'anchored']}
          value={statusFilter}
          onChange={v => setStatusFilter(v as StatusFilter)}
          labelMap={{ all: t('submissions.filter.all'), pending: t('submissions.filter.pending'), anchored: t('submissions.filter.anchored') }}
        />
        {mediaTypes.length > 1 && (
          <FilterGroup
            label={t('submissions.filter.type')}
            options={['all', ...mediaTypes]}
            value={mediaFilter}
            onChange={setMediaFilter}
            labelMap={{ all: t('submissions.filter.all') }}
          />
        )}
        <div className="ml-auto">
          <FilterGroup
            label={t('submissions.filter.sort')}
            options={['newest', 'oldest']}
            value={sortOrder}
            onChange={v => setSortOrder(v as SortOrder)}
            labelMap={{ newest: t('submissions.filter.newest'), oldest: t('submissions.filter.oldest') }}
          />
        </div>
      </div>

      {error && (
        <div className="border-b border-white/[0.08] px-6 py-3">
          <p className="font-['DM_Sans',sans-serif] text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Table header */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,1fr)_5rem_15rem_7rem] gap-x-4 px-4 sm:px-6 py-3 border-b border-white/[0.08] bg-white/[0.02]">
        <span className="font-['DM_Sans',sans-serif] text-xs text-white/30 uppercase tracking-wide">{t('submissions.table.hash')}</span>
        <span className="hidden sm:block font-['DM_Sans',sans-serif] text-xs text-white/30 uppercase tracking-wide">{t('submissions.table.type')}</span>
        <span className="hidden sm:flex font-['DM_Sans',sans-serif] text-xs text-white/30 uppercase tracking-wide items-center gap-1">
          {t('submissions.table.submitted')}
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
            {sortOrder === 'newest'
              ? <path d="M12 19V5M5 12l7-7 7 7"/>
              : <path d="M12 5v14M5 12l7 7 7-7"/>
            }
          </svg>
        </span>
        <span className="font-['DM_Sans',sans-serif] text-xs text-white/30 uppercase tracking-wide">{t('submissions.table.status')}</span>
      </div>

      {/* Loading */}
      {submissions === null && !error && (
        <div className="px-6 py-5 border-b border-white/[0.08]">
          <p className="font-['DM_Sans',sans-serif] text-white/25 text-sm">{t('submissions.loading')}</p>
        </div>
      )}

      {/* No submissions at all */}
      {submissions !== null && submissions.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-16 text-center border-b border-white/[0.08]">
          <p className="font-['DM_Sans',sans-serif] text-white/25 text-sm">{t('submissions.noSubmissions')}</p>
          <p className="font-['DM_Sans',sans-serif] text-white/15 text-xs mt-1">
            {t('submissions.noSubmissionsSub')}
          </p>
        </div>
      )}

      {/* No results from active filters */}
      {filtered !== null && filtered.length === 0 && submissions !== null && submissions.length > 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center border-b border-white/[0.08]">
          <p className="font-['DM_Sans',sans-serif] text-white/25 text-sm">{t('submissions.noResults')}</p>
          <button
            onClick={() => { setDateRange('all'); setStatusFilter('all'); setMediaFilter('all'); }}
            className="font-['DM_Sans',sans-serif] text-xs text-white/20 hover:text-white/40 mt-2 cursor-pointer underline underline-offset-2 transition-colors"
          >
            {t('submissions.clearFilters')}
          </button>
        </div>
      )}

      {/* Rows */}
      {paginated !== null && paginated.map((s, i) => {
        const shortHash = s.hash.slice(0, 12) + '…' + s.hash.slice(-6);
        const submittedDate = new Date(s.submitted_at * 1000).toLocaleDateString(undefined, {
          month: 'short', day: 'numeric', year: 'numeric',
        });
        const submittedTime = new Date(s.submitted_at * 1000).toLocaleTimeString(undefined, {
          hour: '2-digit', minute: '2-digit', second: '2-digit',
        });
        return (
          <div
            key={s.hash}
            className={`grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,1fr)_5rem_15rem_7rem] gap-x-4 items-start sm:items-center px-4 sm:px-6 py-3.5 border-b border-white/[0.04] ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}
          >
            {/* Hash + mobile metadata */}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center min-w-0">
                <code className="font-mono text-xs text-[#a89fff]/70 truncate">{shortHash}</code>
                <CopyButton text={s.hash} />
                <button
                  onClick={() => window.open(`https://anchorkit.net/verify?hash=${s.hash}`, '_blank', 'noopener,noreferrer')}
                  title={t('submissions.table.lookupHash')}
                  className="ml-1 text-white/20 hover:text-white/50 transition-colors cursor-pointer shrink-0"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </button>
              </div>
              <p className="sm:hidden font-['DM_Sans',sans-serif] text-xs text-white/30 mt-0.5 capitalize">
                {s.media_type} · {submittedDate} {submittedTime}
              </p>
            </div>

            {/* Type — desktop only */}
            <span className="hidden sm:block font-['DM_Sans',sans-serif] text-xs text-white/40 capitalize">{s.media_type}</span>

            {/* Submitted — desktop only */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="font-['DM_Sans',sans-serif] text-xs text-white/40">{submittedDate}</span>
              <span className="font-['DM_Sans',sans-serif] text-xs text-white/25">{submittedTime}</span>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <StatusBadge status={s.status} />
              {s.status === 'anchored' && s.explorer_url && (
                <a
                  href={s.explorer_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={t('submissions.table.viewExplorer')}
                  className="text-white/15 hover:text-white/40 transition-colors"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                </a>
              )}
            </div>
          </div>
        );
      })}

      {/* Pagination */}
      {totalPages > 1 && filtered && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-white/[0.08]">
          <span className="font-['DM_Sans',sans-serif] text-xs text-white/30">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => p - 1)}
              disabled={page === 1}
              className="px-3 py-1 font-['DM_Sans',sans-serif] text-xs rounded border border-white/[0.08] text-white/30 hover:text-white/60 hover:bg-white/[0.03] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {t('submissions.pagination.prev')}
            </button>
            <span className="px-3 font-['DM_Sans',sans-serif] text-xs text-white/40">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page === totalPages}
              className="px-3 py-1 font-['DM_Sans',sans-serif] text-xs rounded border border-white/[0.08] text-white/30 hover:text-white/60 hover:bg-white/[0.03] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {t('submissions.pagination.next')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
