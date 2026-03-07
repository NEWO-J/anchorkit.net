import React from 'react';
import { useSearchParams, useNavigate } from 'react-router';

// ─── Types ───────────────────────────────────────────────────────────────────

interface VerificationResponse {
  hash: string;
  verified: boolean;
  pending_anchor?: boolean | null;
  attestation_verified?: boolean | null;
  cert_fingerprint?: string | null;
  cert_valid_from?: string | null;
  cert_valid_until?: string | null;
  day?: string | null;
  timestamp?: number | null;
  hash_id?: number | null;
  merkle_proof?: unknown[] | null;
  solana_tx?: string | null;
  explorer_url?: string | null;
  message?: string | null;
  metadata?: Record<string, string> | null;
}

type VerifyState =
  | { phase: 'idle' }
  | { phase: 'querying' }
  | { phase: 'result'; data: VerificationResponse }
  | { phase: 'error'; message: string };

// ─── Helpers ─────────────────────────────────────────────────────────────────

const API_BASE = 'https://api.anchorkit.net';

async function sha256Hex(buffer: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function verifyHash(hash: string): Promise<VerificationResponse> {
  const res = await fetch(`${API_BASE}/api/verify-hash/${hash}`);
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<VerificationResponse>;
}

function formatTimestamp(ts: number): string {
  return new Date(ts * 1000).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

// ─── Drop Zone ───────────────────────────────────────────────────────────────

function DropZone({ onFile }: { onFile: (file: File) => void }) {
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) onFile(file);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload a photo or video to verify"
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={[
        'flex flex-col items-center justify-center gap-5 rounded-2xl border-2 border-dashed',
        'py-20 px-8 cursor-pointer select-none transition-colors',
        dragging
          ? 'border-[#ff6e00] bg-[#ff6e00]/10'
          : 'border-white/20 bg-white/[0.03] hover:border-white/40 hover:bg-white/[0.06]',
      ].join(' ')}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = '';
        }}
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="56"
        height="56"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white"
        aria-hidden="true"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
      <div className="text-center">
        <p className="font-['DM_Sans',sans-serif] font-medium text-lg text-white/70">
          Drop a photo or video here, or{' '}
          <span className="text-[#a89fff] underline underline-offset-2">click to browse</span>
        </p>
        <p className="mt-1.5 text-sm text-white/30">JPEG, PNG, WebP, HEIC, MP4, 3GP…</p>
      </div>
      <p className="text-xs text-white/25 mt-2">
        Your file never leaves your device — only its SHA-256 hash is sent to the API.
      </p>
    </div>
  );
}

// ─── Spinner ─────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex flex-col items-center gap-4 py-16">
      <svg
        className="animate-spin text-[#a89fff]"
        xmlns="http://www.w3.org/2000/svg"
        width="40"
        height="40"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      <p className="text-white/40 text-sm">Querying blockchain…</p>
    </div>
  );
}

// ─── Result Card ─────────────────────────────────────────────────────────────

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 px-5 py-3.5">
      <span className="text-xs text-white/40 font-['DM_Sans',sans-serif] font-medium shrink-0 pt-0.5 uppercase tracking-wide">
        {label}
      </span>
      <div className="text-right min-w-0">{children}</div>
    </div>
  );
}

function ResultCard({ hash, data }: { hash: string; data: VerificationResponse }) {
  const isVerified = data.verified;
  const isPending = !data.verified && data.pending_anchor;

  const statusColor = isVerified
    ? 'text-green-400 border-green-400/30 bg-green-400/10'
    : isPending
    ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10'
    : 'text-red-400 border-red-400/30 bg-red-400/10';

  const statusIcon = isVerified ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
  ) : isPending ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
  );

  const statusLabel = isVerified
    ? 'Verified & Anchored on Solana'
    : isPending
    ? 'Recorded — Awaiting Blockchain Anchor'
    : 'Not Found';

  const statusDescription = isVerified
    ? "This file's hash exists in an immutable Merkle tree anchored on the Solana blockchain."
    : isPending
    ? data.message || 'This file has been recorded and hardware-verified. The blockchain anchor runs nightly at midnight UTC.'
    : 'This file has not been submitted to AnchorKit. It was not captured with the AnchorKit SDK.';

  return (
    <div className="flex flex-col gap-5">
      {/* Status badge */}
      <div className={`flex items-start gap-3.5 rounded-xl border px-5 py-4 ${statusColor}`}>
        <div className="shrink-0 mt-0.5">{statusIcon}</div>
        <div>
          <p className="font-['DM_Sans',sans-serif] font-semibold text-base">{statusLabel}</p>
          <p className="text-sm opacity-80 mt-1 leading-relaxed">{statusDescription}</p>
        </div>
      </div>

      {/* Details */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] divide-y divide-white/[0.07]">
        <DetailRow label="SHA-256 Hash">
          <code className="font-mono text-xs text-[#c8c4ff] break-all">{hash}</code>
        </DetailRow>
        {data.day && (
          <DetailRow label="Date Submitted">
            <span className="text-white/80 text-sm">{data.day}</span>
          </DetailRow>
        )}
        {data.timestamp && (
          <DetailRow label="Timestamp">
            <span className="text-white/80 text-sm">{formatTimestamp(data.timestamp)}</span>
          </DetailRow>
        )}
        {data.hash_id != null && (
          <DetailRow label="Position in Daily Batch">
            <span className="text-white/80 text-sm">#{data.hash_id}</span>
          </DetailRow>
        )}
        {data.attestation_verified != null && (
          <DetailRow label="Hardware Attestation">
            <span className={`text-sm font-medium ${data.attestation_verified ? 'text-green-400' : 'text-yellow-400'}`}>
              {data.attestation_verified ? 'Verified (Android Secure Enclave)' : 'Not verified'}
            </span>
          </DetailRow>
        )}
        {data.cert_fingerprint && (
          <DetailRow label="Device Cert Fingerprint">
            <code className="font-mono text-xs text-white/60 break-all">
              {data.cert_fingerprint.slice(0, 16)}…{data.cert_fingerprint.slice(-8)}
            </code>
          </DetailRow>
        )}
        {data.cert_valid_from && data.cert_valid_until && (
          <DetailRow label="Cert Validity">
            <span className="text-white/60 text-sm">
              {data.cert_valid_from.slice(0, 10)} → {data.cert_valid_until.slice(0, 10)}
            </span>
          </DetailRow>
        )}
        {data.merkle_proof && data.merkle_proof.length > 0 && (
          <DetailRow label="Merkle Proof">
            <span className="text-white/60 text-sm">{data.merkle_proof.length} sibling nodes</span>
          </DetailRow>
        )}
        {data.solana_tx && (
          <DetailRow label="Solana Transaction">
            {data.explorer_url ? (
              <a
                href={data.explorer_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-[#a89fff] hover:text-[#c8c4ff] underline underline-offset-2 break-all transition-colors"
              >
                {data.solana_tx.slice(0, 16)}…{data.solana_tx.slice(-8)}
              </a>
            ) : (
              <code className="font-mono text-xs text-white/60 break-all">{data.solana_tx}</code>
            )}
          </DetailRow>
        )}
        {data.metadata?.dimensions && (
          <DetailRow label="Dimensions">
            <span className="text-white/80 text-sm">
              {data.metadata.dimensions.replace('x', ' × ')} px
            </span>
          </DetailRow>
        )}
        {data.metadata?.platform && (
          <DetailRow label="Platform">
            <span className="text-white/60 text-sm capitalize">{data.metadata.platform}</span>
          </DetailRow>
        )}
      </div>

      {isVerified && (
        <p className="text-xs text-white/30 text-center">
          Zero trust required — verification only needs a public Solana RPC node.
        </p>
      )}
    </div>
  );
}

// ─── Hash Input ──────────────────────────────────────────────────────────────

function HashInput({ onHash }: { onHash: (hash: string) => void }) {
  const [value, setValue] = React.useState('');
  const isValid = /^[a-f0-9]{64}$/i.test(value.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) onHash(value.trim().toLowerCase());
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Paste a SHA-256 hash…"
        spellCheck={false}
        className="flex-1 min-w-0 font-mono text-xs rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-[#c8c4ff]/80 placeholder:text-white/20 outline-none focus:border-white/25 transition-colors"
      />
      <button
        type="submit"
        disabled={!isValid}
        className="shrink-0 px-4 py-3 rounded-xl text-sm font-medium border transition-colors
          disabled:opacity-30 disabled:cursor-not-allowed
          enabled:bg-[#a89fff]/10 enabled:border-[#a89fff]/30 enabled:text-[#a89fff] enabled:hover:bg-[#a89fff]/20"
      >
        Verify
      </button>
    </form>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function VerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hash = searchParams.get('hash')?.toLowerCase() ?? null;

  const [state, setState] = React.useState<VerifyState>({ phase: 'idle' });
  const [hashingFile, setHashingFile] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [previewIsVideo, setPreviewIsVideo] = React.useState(false);

  // Auto-query whenever the hash param changes
  React.useEffect(() => {
    if (!hash) {
      setState({ phase: 'idle' });
      return;
    }

    if (!/^[a-f0-9]{64}$/.test(hash)) {
      setState({ phase: 'error', message: 'Invalid hash in URL — expected a 64-character hex string.' });
      return;
    }

    setState({ phase: 'querying' });
    verifyHash(hash)
      .then((data) => setState({ phase: 'result', data }))
      .catch((err) => setState({
        phase: 'error',
        message: err instanceof Error ? err.message : 'Network error — please try again.',
      }));
  }, [hash]);

  const handleFile = async (file: File) => {
    setHashingFile(true);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setPreviewIsVideo(file.type.startsWith('video/'));
    try {
      const buf = await file.arrayBuffer();
      const computed = await sha256Hex(buf);
      navigate(`/verify?hash=${computed}`, { replace: false });
    } catch {
      URL.revokeObjectURL(url);
      setPreviewUrl(null);
      setState({ phase: 'error', message: 'Failed to compute hash. Please try another file.' });
    } finally {
      setHashingFile(false);
    }
  };

  const handleVerifyAnother = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setPreviewIsVideo(false);
    }
    navigate('/verify', { replace: true });
  };

  return (
    <main className="min-h-[calc(100dvh-5rem)] flex flex-col items-center justify-start px-6 pt-16 pb-24">
      <div className="w-full max-w-5xl">
        <div className="grid lg:grid-cols-2">

          {/* ── Left column: Verify ── */}
          <div className="flex flex-col items-center lg:items-start lg:border-r border-white/[0.07] lg:pr-12 pb-12 lg:pb-0">
            <div className="w-full max-w-lg mx-auto lg:mx-0">

              <div className="mb-10 text-center lg:text-left">
                <h1 className="font-['DM_Sans',sans-serif] font-bold text-4xl text-white mb-3">
                  Verify
                </h1>
                <p className="text-white/40 text-base">
                  {hash
                    ? 'Checking this photo or video against the AnchorKit blockchain record.'
                    : 'Upload a photo or video to check if it was captured and anchored with AnchorKit.'}
                </p>
              </div>

              {/* Photo preview (file upload) or hash pill (direct GET link) */}
              {hash && previewUrl ? (
                <div className="relative mb-6 rounded-2xl overflow-hidden border border-white/10">
                  {previewIsVideo ? (
                    <video
                      src={previewUrl}
                      controls
                      className="w-full max-h-72 bg-black"
                    />
                  ) : (
                    <img
                      src={previewUrl}
                      alt="Photo being verified"
                      className="w-full max-h-72 object-contain bg-white/[0.03]"
                    />
                  )}
                  <button
                    onClick={handleVerifyAnother}
                    aria-label="Clear file"
                    className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-full bg-black/60 text-white/60 hover:text-white hover:bg-black/80 transition-colors border border-white/10"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </div>
              ) : hash ? (
                <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/30 shrink-0" aria-hidden="true"><line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" /></svg>
                  <code className="font-mono text-xs text-[#c8c4ff]/70 break-all flex-1 min-w-0">{hash}</code>
                  <button
                    onClick={handleVerifyAnother}
                    className="text-xs text-white/30 hover:text-white/60 transition-colors shrink-0 px-2 py-1 rounded border border-white/10 hover:border-white/20"
                  >
                    Clear
                  </button>
                </div>
              ) : null}

              {/* Hashing indicator */}
              {hashingFile && (
                <div className="flex flex-col items-center gap-4 py-16">
                  <svg className="animate-spin text-[#a89fff]" xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  <p className="text-white/40 text-sm">Computing SHA-256 hash…</p>
                </div>
              )}

              {/* Querying */}
              {!hashingFile && state.phase === 'querying' && <Spinner />}

              {/* Error */}
              {!hashingFile && state.phase === 'error' && (
                <div className="flex flex-col gap-5">
                  <div className="flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-400/10 px-5 py-4 text-red-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5" aria-hidden="true"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    <p className="text-sm">{state.message}</p>
                  </div>
                  <button
                    onClick={handleVerifyAnother}
                    className="text-sm text-white/40 hover:text-white/70 transition-colors underline underline-offset-2 text-center"
                  >
                    Try a different photo or video
                  </button>
                </div>
              )}

              {/* Result */}
              {!hashingFile && state.phase === 'result' && hash && (
                <div className="flex flex-col gap-6">
                  <ResultCard hash={hash} data={state.data} />
                  <button
                    onClick={handleVerifyAnother}
                    className="text-sm text-white/40 hover:text-white/70 transition-colors underline underline-offset-2 text-center"
                  >
                    Verify a different photo or video
                  </button>
                </div>
              )}

              {/* Drop zone + hash input — only when idle and not currently hashing */}
              {!hashingFile && state.phase === 'idle' && !hash && (
                <>
                  <DropZone onFile={handleFile} />
                  <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-xs text-white/25 uppercase tracking-widest">or</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>
                  <HashInput onHash={(h) => navigate(`/verify?hash=${h}`)} />
                </>
              )}

            </div>
          </div>

          {/* ── Right column: Submit ── */}
          <div className="flex flex-col items-center lg:items-start border-t lg:border-t-0 border-white/[0.07] lg:pl-12 pt-12 lg:pt-0">
            <div className="w-full max-w-lg mx-auto lg:mx-0">

              <div className="mb-10 text-center lg:text-left">
                <h2 className="font-['DM_Sans',sans-serif] font-bold text-4xl text-white mb-3">
                  Submit
                </h2>
                <p className="text-white/40 text-base">
                  Capture photos and videos with AnchorKit to anchor them on-chain and enable trustless verification.
                </p>
              </div>

              <div className="flex flex-col gap-4">

                {/* Option 1: Demo App */}
                <button
                  onClick={() => alert('Opening demo app…')}
                  className="group flex items-center gap-5 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 px-6 py-5 text-left transition-colors"
                >
                  <div className="shrink-0 flex items-center justify-center w-11 h-11 rounded-xl bg-[#ff7608]/10 border border-[#ff7608]/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff7608" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                      <line x1="12" y1="18" x2="12.01" y2="18" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-['DM_Sans',sans-serif] font-semibold text-base text-white/90 mb-0.5">
                      Try the Demo App
                    </p>
                    <p className="text-sm text-white/40 leading-relaxed">
                      Capture and submit photos and videos instantly with our pre-built Android demo app.
                    </p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/20 group-hover:text-white/40 transition-colors shrink-0" aria-hidden="true">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>

                {/* Option 2: API Key */}
                <button
                  onClick={() => alert('Opening sign up…')}
                  className="group flex items-center gap-5 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 px-6 py-5 text-left transition-colors"
                >
                  <div className="shrink-0 flex items-center justify-center w-11 h-11 rounded-xl bg-[#a89fff]/10 border border-[#a89fff]/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a89fff" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-['DM_Sans',sans-serif] font-semibold text-base text-white/90 mb-0.5">
                      Sign Up / Login for a Free API Key
                    </p>
                    <p className="text-sm text-white/40 leading-relaxed">
                      Integrate AnchorKit into your own Android app. Start anchoring photos and videos in minutes.
                    </p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/20 group-hover:text-white/40 transition-colors shrink-0" aria-hidden="true">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>

              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
