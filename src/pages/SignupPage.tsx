import React from 'react';
import { useNavigate, Link } from 'react-router';

const API_BASE = 'https://api.anchorkit.net';

export default function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [error, setError] = React.useState('');
  const [emailTaken, setEmailTaken] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError('');
    setEmailTaken(false);
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { detail?: string };
        if (res.status === 409) setEmailTaken(true);
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
      <div className="min-h-screen bg-[#030028] flex items-start justify-center px-4 pt-16">
        <div className="w-full max-w-md text-center">
          <div className="mb-6 text-5xl">✉️</div>
          <h1 className="font-['DM_Sans',sans-serif] font-bold text-2xl text-white mb-3">
            Check your email
          </h1>
          <p className="text-white/50 font-['DM_Sans',sans-serif] text-base leading-relaxed">
            We sent a verification link to <span className="text-white/80">{email}</span>.
            Click it to activate your account and get your API key.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030028] flex items-start justify-center px-4 pt-16">
      <div className="w-full max-w-sm">
        <h1 className="font-['DM_Sans',sans-serif] font-bold text-3xl text-white mb-1 text-center">
          Create account
        </h1>
        <p className="text-white/40 font-['DM_Sans',sans-serif] text-sm text-center mb-8">
          Get your free AnchorKit API key
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

          <div className="flex flex-col gap-1.5">
            <label className="font-['DM_Sans',sans-serif] text-sm text-white/60">Password</label>
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

          {status === 'error' && (
            <div className="flex flex-col gap-1.5">
              <p className="text-red-400 font-['DM_Sans',sans-serif] text-sm">{error}</p>
              {emailTaken && (
                <p className="font-['DM_Sans',sans-serif] text-xs text-white/40">
                  <Link
                    to="/login"
                    state={{ email }}
                    className="text-[rgba(174,167,255,0.7)] hover:text-[rgba(174,167,255,1)] transition-colors"
                  >
                    Log in
                  </Link>
                  {' '}or{' '}
                  <Link
                    to="/forgot-password"
                    className="text-[rgba(174,167,255,0.7)] hover:text-[rgba(174,167,255,1)] transition-colors"
                  >
                    reset your password
                  </Link>
                </p>
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
            {status === 'loading' ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center font-['DM_Sans',sans-serif] text-sm text-white/40">
          Already have an account?{' '}
          <Link to="/login" className="text-[rgba(174,167,255,0.7)] hover:text-[rgba(174,167,255,1)] transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
