import React from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AnchorEntry {
  date: string;
  hash_count: number | null;
  merkle_root: string | null;
  solana_tx: string | null;
  explorer_url: string | null;
  network: string;
  anchored_at: number | null;
}

type LoadState =
  | { phase: 'loading' }
  | { phase: 'loaded'; entries: AnchorEntry[] }
  | { phase: 'error'; message: string };

type SortKey = 'date' | 'hash_count' | 'network';
type SortDir = 'asc' | 'desc';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const API_BASE = 'https://api.anchorkit.net';

async function fetchAnchors(): Promise<AnchorEntry[]> {
  const res = await fetch(`${API_BASE}/api/anchors`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatAnchoredAt(ts: number): string {
  return new Date(ts * 1000).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

function sortEntries(entries: AnchorEntry[], key: SortKey, dir: SortDir): AnchorEntry[] {
  return [...entries].sort((a, b) => {
    let cmp = 0;
    if (key === 'date') {
      cmp = a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
    } else if (key === 'hash_count') {
      cmp = (a.hash_count ?? -1) - (b.hash_count ?? -1);
    } else if (key === 'network') {
      cmp = a.network.localeCompare(b.network);
    }
    return dir === 'asc' ? cmp : -cmp;
  });
}

// ─── Spinner ─────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex flex-col items-center gap-4 py-24">
      <svg
        className="animate-spin text-[#a89fff]"
        xmlns="http://www.w3.org/2000/svg"
        width="36"
        height="36"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      <p className="text-white/40 text-sm">Loading anchor history…</p>
    </div>
  );
}

// ─── Sort Icon ────────────────────────────────────────────────────────────────

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={`ml-1 shrink-0 transition-opacity ${active ? 'opacity-80' : 'opacity-25'}`}
    >
      {active && dir === 'asc' ? (
        <path d="M12 4l8 16H4L12 4z" />
      ) : (
        <path d="M12 20l-8-16h16L12 20z" />
      )}
    </svg>
  );
}

// ─── Network Badge ────────────────────────────────────────────────────────────

function NetworkBadge({ network }: { network: string }) {
  const isMainnet = network === 'mainnet';
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
        isMainnet
          ? 'bg-green-400/10 text-green-400 border border-green-400/20'
          : 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20'
      }`}
    >
      {isMainnet ? 'Mainnet' : network}
    </span>
  );
}

// ─── Anchor Row ───────────────────────────────────────────────────────────────

function AnchorRow({ entry, index }: { entry: AnchorEntry; index: number }) {
  const shortRoot = entry.merkle_root
    ? `${entry.merkle_root.slice(0, 10)}…${entry.merkle_root.slice(-6)}`
    : '—';
  const shortTx = entry.solana_tx
    ? `${entry.solana_tx.slice(0, 12)}…${entry.solana_tx.slice(-8)}`
    : null;

  return (
    <div
      className={`grid grid-cols-[1.5fr_5rem_1fr_1.2fr_auto] gap-x-6 items-center px-6 py-4 ${
        index % 2 === 0 ? 'bg-white/[0.015]' : ''
      } hover:bg-white/[0.04] transition-colors group`}
    >
      {/* Date */}
      <div>
        <p className="text-white/90 text-sm font-['Inter:Medium',sans-serif] font-medium">
          {formatDate(entry.date)}
        </p>
        {entry.anchored_at ? (
          <p className="text-white/30 text-xs mt-0.5">{formatAnchoredAt(entry.anchored_at)}</p>
        ) : null}
      </div>

      {/* Hash count */}
      <div className="text-right">
        {entry.hash_count != null ? (
          <span className="text-white/80 text-sm tabular-nums">
            {entry.hash_count.toLocaleString()}
          </span>
        ) : (
          <span className="text-white/25 text-sm">—</span>
        )}
      </div>

      {/* Merkle root */}
      <div>
        <code className="font-mono text-xs text-[#a89fff]/70">{shortRoot}</code>
      </div>

      {/* Solana TX */}
      <div>
        {shortTx && entry.explorer_url ? (
          <a
            href={entry.explorer_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-[#a89fff] hover:text-[#c8c4ff] underline underline-offset-2 transition-colors"
          >
            {shortTx}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-60 shrink-0"
              aria-hidden="true"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        ) : (
          <span className="text-white/25 text-xs font-mono">—</span>
        )}
      </div>

      {/* Network */}
      <div className="flex justify-end">
        <NetworkBadge network={entry.network} />
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AnchorLogPage() {
  const [state, setState] = React.useState<LoadState>({ phase: 'loading' });
  const [search, setSearch] = React.useState('');
  const [sortKey, setSortKey] = React.useState<SortKey>('date');
  const [sortDir, setSortDir] = React.useState<SortDir>('desc');

  React.useEffect(() => {
    fetchAnchors()
      .then((entries) => setState({ phase: 'loaded', entries }))
      .catch((err) =>
        setState({
          phase: 'error',
          message: err instanceof Error ? err.message : 'Failed to load anchor log.',
        })
      );
  }, []);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  const displayedEntries = React.useMemo(() => {
    if (state.phase !== 'loaded') return [];
    const query = search.trim().toLowerCase();
    const filtered = query
      ? state.entries.filter((e) => e.merkle_root?.toLowerCase().includes(query))
      : state.entries;
    return sortEntries(filtered, sortKey, sortDir);
  }, [state, search, sortKey, sortDir]);

  const totalHashes =
    state.phase === 'loaded'
      ? state.entries.reduce((sum, e) => sum + (e.hash_count ?? 0), 0)
      : null;

  return (
    <main className="min-h-[calc(100dvh-5rem)] flex flex-col items-center px-4 pt-16 pb-24">
      <div className="w-full max-w-4xl">

        {/* Heading */}
        <div className="mb-10 text-center">
          <h1 className="font-['Inter:Bold',sans-serif] font-bold text-4xl text-white mb-3">
            Blockchain Anchor Log
          </h1>
          <p className="text-white/40 text-base max-w-lg mx-auto">
            Every nightly batch anchored to Solana — an immutable, public record of AnchorKit's
            Merkle roots and their on-chain transactions.
          </p>
        </div>

        {/* Summary stats */}
        {state.phase === 'loaded' && state.entries.length > 0 && (
          <div className="grid grid-cols-3 border border-white/10 bg-white/[0.03] divide-x divide-white/10 mb-0">
            <div className="px-5 py-4 text-center">
              <p className="text-2xl font-['Inter:Bold',sans-serif] font-bold text-white">
                {state.entries.length}
              </p>
              <p className="text-xs text-white/40 mt-1 uppercase tracking-wide">Days Anchored</p>
            </div>
            <div className="px-5 py-4 text-center">
              <p className="text-2xl font-['Inter:Bold',sans-serif] font-bold text-white">
                {totalHashes != null ? totalHashes.toLocaleString() : '—'}
              </p>
              <p className="text-xs text-white/40 mt-1 uppercase tracking-wide">Total Hashes</p>
            </div>
            <div className="px-5 py-4 text-center">
              <p className="text-2xl font-['Inter:Bold',sans-serif] font-bold text-white">
                {state.entries.filter((e) => e.network === 'mainnet').length}
              </p>
              <p className="text-xs text-white/40 mt-1 uppercase tracking-wide">Mainnet Anchors</p>
            </div>
          </div>
        )}

        {/* Search bar + Table — connected block */}
        <div className="border border-white/10 bg-white/[0.02] overflow-hidden border-t-0">

          {/* Search bar */}
          {state.phase === 'loaded' && (
            <div className="relative border-b border-white/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Merkle root…"
                className="w-full bg-transparent border-0 pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:bg-white/[0.03] transition-colors font-mono"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  aria-label="Clear search"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Column headers */}
          <div className="grid grid-cols-[1.5fr_5rem_1fr_1.2fr_auto] gap-x-6 items-center px-6 py-3 border-b border-white/[0.07] bg-white/[0.02]">
            <button
              onClick={() => handleSort('date')}
              className="flex items-center text-xs text-white/30 uppercase tracking-wide hover:text-white/60 transition-colors w-fit"
            >
              Date
              <SortIcon active={sortKey === 'date'} dir={sortDir} />
            </button>
            <button
              onClick={() => handleSort('hash_count')}
              className="flex items-center justify-end text-xs text-white/30 uppercase tracking-wide hover:text-white/60 transition-colors w-full"
            >
              Hashes
              <SortIcon active={sortKey === 'hash_count'} dir={sortDir} />
            </button>
            <span className="text-xs text-white/30 uppercase tracking-wide">Merkle Root</span>
            <span className="text-xs text-white/30 uppercase tracking-wide">Solana Transaction</span>
            <button
              onClick={() => handleSort('network')}
              className="flex items-center justify-end text-xs text-white/30 uppercase tracking-wide hover:text-white/60 transition-colors"
            >
              Network
              <SortIcon active={sortKey === 'network'} dir={sortDir} />
            </button>
          </div>

          {state.phase === 'loading' && <Spinner />}

          {state.phase === 'error' && (
            <div className="flex items-center gap-3 px-6 py-8 text-red-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              <p className="text-sm">{state.message}</p>
            </div>
          )}

          {state.phase === 'loaded' && state.entries.length === 0 && (
            <p className="text-center text-white/30 text-sm py-16">No anchors found yet.</p>
          )}

          {state.phase === 'loaded' && state.entries.length > 0 && displayedEntries.length === 0 && (
            <p className="text-center text-white/30 text-sm py-16">
              No results for <code className="font-mono text-[#a89fff]/60">"{search}"</code>
            </p>
          )}

          {state.phase === 'loaded' &&
            displayedEntries.map((entry, i) => (
              <AnchorRow key={entry.date} entry={entry} index={i} />
            ))}
        </div>

        {state.phase === 'loaded' && search && displayedEntries.length > 0 && (
          <p className="text-xs text-white/25 text-center mt-3">
            {displayedEntries.length} of {state.entries.length} entries
          </p>
        )}

        <p className="text-xs text-white/20 text-center mt-6">
          All Merkle roots are posted to the Solana blockchain and can be independently verified
          via any public Solana RPC node.
        </p>
      </div>
    </main>
  );
}
