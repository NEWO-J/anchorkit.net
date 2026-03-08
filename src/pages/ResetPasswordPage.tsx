import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';

const API_BASE = 'https://api.anchorkit.net';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = searchParams.get('email') ?? '';
  const token = searchParams.get('token') ?? '';
  const t = searchParams.get('t') ?? '';

  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = React.useState('');

  const invalid = !email || !token || !t;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); setStatus('error'); return; }
    setStatus('loading');
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, t: parseInt(t, 10), new_password: password }),
      });
      const body = await res.json().catch(() => ({})) as { detail?: string };
      if (!res.ok) throw new Error(body.detail ?? `Error ${res.status}`);
      setStatus('success');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('error');
    }
  };

  if (invalid) {
    return (
      <div className="min-h-screen bg-[#030028] flex items-start justify-center px-4 pt-16">
        <div className="w-full max-w-sm text-center">
          <p className="font-['DM_Sans',sans-serif] text-white/50 mb-4">
            This reset link is invalid or missing required parameters.
          </p>
          <Link
            to="/forgot-password"
            className="font-['DM_Sans',sans-serif] text-sm text-[rgba(174,167,255,0.7)] hover:text-[rgba(174,167,255,1)] transition-colors"
          >
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[#030028] flex items-start justify-center px-4 pt-16">
        <div className="w-full max-w-sm text-center">
          <h1 className="font-['DM_Sans',sans-serif] font-bold text-2xl text-white mb-3">
            Password updated
          </h1>
          <p className="text-white/50 font-['DM_Sans',sans-serif] text-sm">
            Redirecting you to log in…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030028] flex items-start justify-center px-4 pt-16">
      <div className="w-full max-w-sm">
        <h1 className="font-['DM_Sans',sans-serif] font-bold text-3xl text-white mb-1 text-center">
          New password
        </h1>
        <p className="text-white/40 font-['DM_Sans',sans-serif] text-sm text-center mb-8">
          Choose a new password for <span className="text-white/60">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-['DM_Sans',sans-serif] text-sm text-white/60">New password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="bg-white/[0.05] border border-white/[0.12] rounded-[8px] px-4 py-3
                         font-['DM_Sans',sans-serif] text-base text-white placeholder-white/20
                         outline-none focus:border-[rgba(174,167,255,0.5)] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-['DM_Sans',sans-serif] text-sm text-white/60">Confirm password</label>
            <input
              type="password"
              required
              minLength={8}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Same password again"
              className="bg-white/[0.05] border border-white/[0.12] rounded-[8px] px-4 py-3
                         font-['DM_Sans',sans-serif] text-base text-white placeholder-white/20
                         outline-none focus:border-[rgba(174,167,255,0.5)] transition-colors"
            />
          </div>

          {status === 'error' && (
            <div>
              <p className="text-red-400 font-['DM_Sans',sans-serif] text-sm">{error}</p>
              {error.toLowerCase().includes('expired') && (
                <Link
                  to="/forgot-password"
                  className="font-['DM_Sans',sans-serif] text-xs text-[rgba(174,167,255,0.7)] hover:text-[rgba(174,167,255,1)] transition-colors mt-1 inline-block"
                >
                  Request a new reset link →
                </Link>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="mt-1 bg-[rgba(174,167,255,0.15)] hover:bg-[rgba(174,167,255,0.22)]
                       border border-[rgba(174,167,255,0.35)] rounded-[8px] py-3
                       font-['DM_Sans',sans-serif] font-bold text-base text-[rgba(174,167,255,0.9)]
                       transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? 'Updating…' : 'Set new password'}
          </button>
        </form>
      </div>
    </div>
  );
}
