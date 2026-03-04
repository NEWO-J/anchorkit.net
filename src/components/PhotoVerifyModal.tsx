import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';

// ─── Types ──────────────────────────────────────────────────────────────────

type VerifyState =
  | { phase: 'idle' }
  | { phase: 'hashing' }
  | { phase: 'querying'; hash: string }
  | { phase: 'result'; hash: string; data: VerificationResponse }
  | { phase: 'error'; message: string };

interface VerificationResponse {
  hash: string;
  verified: boolean;
  pending_anchor?: boolean | null;
  attestation_verified?: boolean | null;
  day?: string | null;
  timestamp?: number | null;
  hash_id?: number | null;
  merkle_proof?: unknown[] | null;
  message?: string | null;
}

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

function truncateHash(h: string): string {
  return `${h.slice(0, 8)}…${h.slice(-8)}`;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function DropZone({
  onFile,
  disabled,
}: {
  onFile: (file: File) => void;
  disabled: boolean;
}) {
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) onFile(file);
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Upload a photo to verify"
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => !disabled && (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={[
        'relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed',
        'py-12 px-6 cursor-pointer select-none transition-colors',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
        dragging
          ? 'border-[#ff6e00] bg-[#ff6e00]/10'
          : 'border-white/20 bg-white/[0.03] hover:border-white/40 hover:bg-white/[0.06]',
      ].join(' ')}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = '';
        }}
      />
      {/* Upload icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white/30"
        aria-hidden="true"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
      <div className="text-center">
        <p className="font-['Inter:Medium',sans-serif] font-medium text-base text-white/70">
          Drop a photo here, or <span className="text-[#a89fff] underline underline-offset-2">click to browse</span>
        </p>
        <p className="mt-1 text-sm text-white/30">JPEG, PNG, WebP, HEIC…</p>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin text-[#a89fff]"
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

function ResultCard({ hash, data }: { hash: string; data: VerificationResponse }) {
  const isVerified = data.verified;
  const isPending = !data.verified && data.pending_anchor;
  const isNotFound = !data.verified && !data.pending_anchor;

  const statusColor = isVerified
    ? 'text-green-400 border-green-400/30 bg-green-400/10'
    : isPending
    ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10'
    : 'text-red-400 border-red-400/30 bg-red-400/10';

  const statusIcon = isVerified ? (
    // Check mark
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
  ) : isPending ? (
    // Clock
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
  ) : (
    // X mark
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
  );

  const statusLabel = isVerified
    ? 'Verified & Anchored on Solana'
    : isPending
    ? 'Recorded — Awaiting Blockchain Anchor'
    : 'Not Found';

  const statusDescription = isVerified
    ? 'This photo\'s hash exists in an immutable Merkle tree anchored on the Solana blockchain.'
    : isPending
    ? data.message || 'This photo has been recorded and hardware-verified. The blockchain anchor runs nightly at midnight UTC.'
    : 'This photo has not been submitted to AnchorKit. It was not captured with the AnchorKit SDK.';

  return (
    <div className="flex flex-col gap-4">
      {/* Status badge */}
      <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${statusColor}`}>
        {statusIcon}
        <div>
          <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-sm">{statusLabel}</p>
          <p className="text-xs opacity-80 mt-0.5">{statusDescription}</p>
        </div>
      </div>

      {/* Details grid */}
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

        {data.merkle_proof && data.merkle_proof.length > 0 && (
          <DetailRow label="Merkle Proof">
            <span className="text-white/60 text-sm">{data.merkle_proof.length} sibling nodes</span>
          </DetailRow>
        )}
      </div>

      {/* Offline proof hint */}
      {isVerified && (
        <p className="text-xs text-white/40 text-center">
          Zero trust required — verification only needs a public Solana RPC node.
        </p>
      )}
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3">
      <span className="text-xs text-white/40 font-['Inter:Medium',sans-serif] font-medium shrink-0 pt-0.5">{label}</span>
      <div className="text-right min-w-0">{children}</div>
    </div>
  );
}

// ─── Main Modal ──────────────────────────────────────────────────────────────

interface PhotoVerifyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PhotoVerifyModal({ open, onOpenChange }: PhotoVerifyModalProps) {
  const [state, setState] = React.useState<VerifyState>({ phase: 'idle' });
  const [preview, setPreview] = React.useState<string | null>(null);

  // Reset when modal closes
  React.useEffect(() => {
    if (!open) {
      setState({ phase: 'idle' });
      setPreview(null);
    }
  }, [open]);

  const handleFile = React.useCallback(async (file: File) => {
    // Show preview
    const url = URL.createObjectURL(file);
    setPreview(url);

    // Step 1: hash
    setState({ phase: 'hashing' });
    let hash: string;
    try {
      const buf = await file.arrayBuffer();
      hash = await sha256Hex(buf);
    } catch {
      setState({ phase: 'error', message: 'Failed to compute hash. Please try another file.' });
      return;
    }

    // Step 2: query API
    setState({ phase: 'querying', hash });
    try {
      const data = await verifyHash(hash);
      setState({ phase: 'result', hash, data });
    } catch (err) {
      setState({
        phase: 'error',
        message: err instanceof Error ? err.message : 'Network error — please try again.',
      });
    }
  }, []);

  const reset = () => {
    setState({ phase: 'idle' });
    setPreview(null);
  };

  const isLoading = state.phase === 'hashing' || state.phase === 'querying';

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-[fade-in_0.15s_ease-out]" />

        {/* Panel */}
        <Dialog.Content
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          aria-describedby="verify-modal-desc"
        >
          <div className="relative w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-2xl bg-[#0a0933] border border-white/10 shadow-2xl flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <div>
                <Dialog.Title className="font-['Inter:Bold',sans-serif] font-bold text-lg text-white">
                  Verify a Photo
                </Dialog.Title>
                <Dialog.Description id="verify-modal-desc" className="text-sm text-white/40 mt-0.5">
                  Upload any photo to check if it was captured and anchored with AnchorKit.
                </Dialog.Description>
              </div>
              <Dialog.Close
                className="text-white/40 hover:text-white/80 transition-colors rounded-lg p-1.5 -mr-1"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </Dialog.Close>
            </div>

            {/* Body */}
            <div className="flex flex-col gap-5 p-6">

              {/* Preview strip */}
              {preview && (
                <div className="relative flex items-center gap-4 rounded-xl bg-white/[0.04] border border-white/10 p-3">
                  <img
                    src={preview}
                    alt="Photo preview"
                    className="w-16 h-16 object-cover rounded-lg shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    {state.phase === 'hashing' && (
                      <p className="text-sm text-white/60">Computing SHA-256 hash…</p>
                    )}
                    {state.phase === 'querying' && (
                      <>
                        <p className="text-sm text-white/60 mb-1">Querying blockchain…</p>
                        <code className="font-mono text-xs text-[#c8c4ff]/60 break-all">
                          {truncateHash(state.hash)}
                        </code>
                      </>
                    )}
                    {(state.phase === 'result' || state.phase === 'error') && (
                      <code className="font-mono text-xs text-[#c8c4ff]/60 break-all">
                        {state.phase === 'result' ? truncateHash(state.hash) : ''}
                      </code>
                    )}
                  </div>
                  {isLoading && <Spinner />}
                  {(state.phase === 'result' || state.phase === 'error') && (
                    <button
                      onClick={reset}
                      className="text-xs text-white/40 hover:text-white/70 transition-colors px-2 py-1 rounded border border-white/10 hover:border-white/20"
                    >
                      Try another
                    </button>
                  )}
                </div>
              )}

              {/* Drop zone (only when idle or error) */}
              {(state.phase === 'idle' || state.phase === 'error') && !preview && (
                <DropZone onFile={handleFile} disabled={false} />
              )}

              {/* Error */}
              {state.phase === 'error' && (
                <div className="flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-red-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5" aria-hidden="true"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  <p className="text-sm">{state.message}</p>
                </div>
              )}

              {/* Result */}
              {state.phase === 'result' && (
                <ResultCard hash={state.hash} data={state.data} />
              )}

              {/* How it works */}
              {state.phase === 'idle' && (
                <p className="text-xs text-white/30 text-center">
                  Your photo never leaves your device — only its SHA-256 hash is sent to the API.
                </p>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
