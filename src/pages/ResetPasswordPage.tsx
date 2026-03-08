import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import DitheredCirclesBg from '../components/DitheredCirclesBg';

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

  const inputCls = `w-full bg-black/30 border border-white/[0.08] rounded-[6px] px-3 py-2.5
                    font-['DM_Sans',sans-serif] text-sm text-white/80 placeholder-white/20
                    focus:outline-none focus:border-white/20 transition-colors`;

  if (invalid) {
    return (
      <div className="relative min-h-screen bg-[#030028] flex items-start justify-center px-4 pt-16">
        <DitheredCirclesBg />
        <div className="relative z-10 w-full max-w-sm">
          <div className="border border-white/[0.08] overflow-hidden">
            <div className="border-b border-white/[0.08] px-6 py-5 bg-[#030028]">
              <h1 className="font-['DM_Sans',sans-serif] font-bold text-xl text-white leading-tight">Invalid link</h1>
              <p className="font-['DM_Sans',sans-serif] text-xs text-white/40 mt-0.5">This reset link is missing required parameters</p>
            </div>
            <div className="p-6 bg-[#030028]">
              <Link
                to="/forgot-password"
                className="font-['DM_Sans',sans-serif] text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                Request a new link
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="relative min-h-screen bg-[#030028] flex items-start justify-center px-4 pt-16">
        <DitheredCirclesBg />
        <div className="relative z-10 w-full max-w-sm">
          <div className="border border-white/[0.08] overflow-hidden">
            <div className="border-b border-white/[0.08] px-6 py-5 bg-[#030028]">
              <h1 className="font-['DM_Sans',sans-serif] font-bold text-xl text-white leading-tight">Password updated</h1>
              <p className="font-['DM_Sans',sans-serif] text-xs text-white/40 mt-0.5">Redirecting you to log in…</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#030028] flex items-start justify-center px-4 pt-16">
      <DitheredCirclesBg />
      <div className="relative z-10 w-full max-w-sm">
        <div className="border border-white/[0.08] overflow-hidden">

          {/* Header */}
          <div className="border-b border-white/[0.08] px-6 py-5 bg-[#030028]">
            <h1 className="font-['DM_Sans',sans-serif] font-bold text-xl text-white leading-tight">New password</h1>
            <p className="font-['DM_Sans',sans-serif] text-xs text-white/40 mt-0.5">{email}</p>
          </div>

          {/* Body */}
          <div className="p-6 bg-[#030028]">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="font-['DM_Sans',sans-serif] text-xs text-white/50">New password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className={inputCls}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-['DM_Sans',sans-serif] text-xs text-white/50">Confirm password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Same password again"
                  className={inputCls}
                />
              </div>

              {status === 'error' && (
                <div>
                  <p className="text-red-400 font-['DM_Sans',sans-serif] text-xs">{error}</p>
                  {error.toLowerCase().includes('expired') && (
                    <Link
                      to="/forgot-password"
                      className="font-['DM_Sans',sans-serif] text-xs text-white/40 hover:text-white/70 transition-colors mt-1 inline-block"
                    >
                      Request a new reset link →
                    </Link>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="mt-1 w-full py-2.5 rounded-[6px] bg-white/[0.06] border border-white/[0.08]
                           font-['DM_Sans',sans-serif] text-sm font-medium text-white/60
                           hover:text-white/80 hover:bg-white/[0.10] transition-colors cursor-pointer
                           disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Updating…' : 'Set new password'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
