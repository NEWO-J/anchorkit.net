import React from 'react';
import { useNavigate } from 'react-router';
import { API_BASE, clearAuthAndRedirect } from './utils';
import dashboardBg from '../../assets/dashboard.png';

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

function StatusBadge({ status }: { status: 'anchored' | 'pending' }) {
  return status === 'anchored' ? (
    <span className="inline-flex items-center gap-1.5 font-['DM_Sans',sans-serif] text-xs text-green-400/80">
      <span className="w-1.5 h-1.5 rounded-full bg-green-400/80 shrink-0" />
      Anchored
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 font-['DM_Sans',sans-serif] text-xs text-white/30">
      <span className="w-1.5 h-1.5 rounded-full bg-white/20 shrink-0" />
      Pending
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <button
      onClick={() => navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); })}
      title="Copy full hash"
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

export default function SubmissionsPage() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = React.useState<Submission[] | null>(null);
  const [error, setError] = React.useState('');

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

  return (
    <div>
      {/* Page header */}
      <div
        className="border-b border-white/[0.08] px-6 py-5 relative overflow-hidden"
        style={{ backgroundImage: `url(${dashboardBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-[#030028]/70" />
        <div className="relative">
          <h1 className="font-['DM_Sans',sans-serif] font-bold text-xl text-white leading-tight">Submissions</h1>
          <p className="font-['DM_Sans',sans-serif] text-xs text-white/40 mt-0.5">
            {submissions !== null ? `${submissions.length} submission${submissions.length !== 1 ? 's' : ''}` : 'All hashes submitted through your API key'}
          </p>
        </div>
      </div>

      {error && (
        <div className="border-b border-white/[0.08] px-6 py-3">
          <p className="font-['DM_Sans',sans-serif] text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Table header */}
      <div className="grid grid-cols-[minmax(0,1fr)_5rem_9rem_7rem] gap-x-4 px-6 py-3 border-b border-white/[0.08] bg-white/[0.02]">
        <span className="font-['DM_Sans',sans-serif] text-xs text-white/30 uppercase tracking-wide">Hash</span>
        <span className="font-['DM_Sans',sans-serif] text-xs text-white/30 uppercase tracking-wide">Type</span>
        <span className="font-['DM_Sans',sans-serif] text-xs text-white/30 uppercase tracking-wide">Submitted</span>
        <span className="font-['DM_Sans',sans-serif] text-xs text-white/30 uppercase tracking-wide">Status</span>
      </div>

      {/* Loading */}
      {submissions === null && !error && (
        <div className="px-6 py-5 border-b border-white/[0.08]">
          <p className="font-['DM_Sans',sans-serif] text-white/25 text-sm">Loading…</p>
        </div>
      )}

      {/* Empty state */}
      {submissions !== null && submissions.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-16 text-center border-b border-white/[0.08]">
          <p className="font-['DM_Sans',sans-serif] text-white/25 text-sm">No submissions yet.</p>
          <p className="font-['DM_Sans',sans-serif] text-white/15 text-xs mt-1">
            Hashes submitted through your API key will appear here.
          </p>
        </div>
      )}

      {/* Rows */}
      {submissions !== null && submissions.map((s, i) => {
        const shortHash = s.hash.slice(0, 12) + '…' + s.hash.slice(-6);
        const submittedDate = new Date(s.submitted_at * 1000).toLocaleDateString(undefined, {
          month: 'short', day: 'numeric', year: 'numeric',
        });
        return (
          <div
            key={s.hash}
            className={`grid grid-cols-[minmax(0,1fr)_5rem_9rem_7rem] gap-x-4 items-center px-6 py-3.5 border-b border-white/[0.04] ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}
          >
            {/* Hash */}
            <div className="flex items-center min-w-0">
              <code className="font-mono text-xs text-[#a89fff]/70 truncate">{shortHash}</code>
              <CopyButton text={s.hash} />
            </div>

            {/* Type */}
            <span className="font-['DM_Sans',sans-serif] text-xs text-white/40 capitalize">{s.media_type}</span>

            {/* Submitted */}
            <span className="font-['DM_Sans',sans-serif] text-xs text-white/40">{submittedDate}</span>

            {/* Status */}
            <div className="flex items-center gap-2">
              <StatusBadge status={s.status} />
              {s.status === 'anchored' && s.explorer_url && (
                <a
                  href={s.explorer_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View on Solana Explorer"
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
    </div>
  );
}
