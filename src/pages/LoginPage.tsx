import React from 'react';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router';

const API_BASE = 'https://api.anchorkit.net';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const justVerified = searchParams.get('verified') === '1';
  // Pre-fill email if redirected from signup with a known address
  const prefillEmail = (location.state as { email?: string } | null)?.email ?? '';

  const [email, setEmail] = React.useState(prefillEmail);
  const [password, setPassword] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { detail?: string };
        throw new Error(body.detail ?? `Error ${res.status}`);
      }
      const data = await res.json() as { token: string; email: string };
      localStorage.setItem('ak_token', data.token);
      localStorage.setItem('ak_email', data.email);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#030028] flex items-start justify-center px-4 pt-16">
      <div className="w-full max-w-sm">
        <h1 className="font-['DM_Sans',sans-serif] font-bold text-3xl text-white mb-1 text-center">
          Log in
        </h1>
        <p className="text-white/40 font-['DM_Sans',sans-serif] text-sm text-center mb-8">
          Access your AnchorKit Dashboard
        </p>

        {justVerified && (
          <div className="mb-6 px-4 py-3 rounded-[8px] bg-[rgba(174,167,255,0.08)] border border-[rgba(174,167,255,0.2)]">
            <p className="font-['DM_Sans',sans-serif] text-sm text-[rgba(174,167,255,0.8)] text-center">
              Email verified! Log in to see your API key.
            </p>
          </div>
        )}

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

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="font-['DM_Sans',sans-serif] text-sm text-white/60">Password</label>
              <Link
                to="/forgot-password"
                className="font-['DM_Sans',sans-serif] text-xs text-[rgba(174,167,255,0.55)] hover:text-[rgba(174,167,255,0.9)] transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Your password"
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
            {status === 'loading' ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="mt-6 text-center font-['DM_Sans',sans-serif] text-sm text-white/40">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-[rgba(174,167,255,0.7)] hover:text-[rgba(174,167,255,1)] transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
