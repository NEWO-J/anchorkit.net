import React from 'react';
import { Link } from 'react-router';

const API_BASE = 'https://api.anchorkit.net';

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [error, setError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { detail?: string };
        throw new Error(body.detail ?? `Error ${res.status}`);
      }
      setStatus('sent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <div className="min-h-screen bg-[#030028] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-6 text-5xl">✉️</div>
          <h1 className="font-['DM_Sans',sans-serif] font-bold text-2xl text-white mb-3">
            Check your email
          </h1>
          <p className="text-white/50 font-['DM_Sans',sans-serif] text-base leading-relaxed mb-6">
            If <span className="text-white/80">{email}</span> is registered, we've sent a reset
            link. It expires in 1 hour.
          </p>
          <Link
            to="/login"
            className="font-['DM_Sans',sans-serif] text-sm text-[rgba(174,167,255,0.7)] hover:text-[rgba(174,167,255,1)] transition-colors"
          >
            Back to log in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030028] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-['DM_Sans',sans-serif] font-bold text-3xl text-white mb-1 text-center">
          Forgot password?
        </h1>
        <p className="text-white/40 font-['DM_Sans',sans-serif] text-sm text-center mb-8">
          Enter your email and we'll send a reset link
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-['DM_Sans',sans-serif] text-sm text-white/60">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="bg-white/[0.05] border border-white/[0.12] rounded-[8px] px-4 py-3
                         font-['DM_Sans',sans-serif] text-base text-white placeholder-white/20
                         outline-none focus:border-[rgba(174,167,255,0.5)] transition-colors"
            />
          </div>

          {status === 'error' && (
            <p className="text-red-400 font-['DM_Sans',sans-serif] text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="mt-1 bg-[rgba(174,167,255,0.15)] hover:bg-[rgba(174,167,255,0.22)]
                       border border-[rgba(174,167,255,0.35)] rounded-[8px] py-3
                       font-['DM_Sans',sans-serif] font-bold text-base text-[rgba(174,167,255,0.9)]
                       transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        <p className="mt-6 text-center font-['DM_Sans',sans-serif] text-sm text-white/40">
          Remembered it?{' '}
          <Link to="/login" className="text-[rgba(174,167,255,0.7)] hover:text-[rgba(174,167,255,1)] transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
