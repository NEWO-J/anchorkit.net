import React from 'react';
import { useNavigate, Link } from 'react-router';
import DitheredCirclesBg from '../components/DitheredCirclesBg';

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

  const inputCls = `w-full bg-black/30 border border-white/[0.08] rounded-[6px] px-3 py-2.5
                    font-['DM_Sans',sans-serif] text-sm text-white/80 placeholder-white/20
                    focus:outline-none focus:border-white/20 transition-colors`;

  if (status === 'sent') {
    return (
      <div className="relative min-h-screen bg-[#030028] flex items-start justify-center px-4 pt-16">
        <DitheredCirclesBg />
        <div className="relative z-10 w-full max-w-sm">
          <div className="border border-white/[0.08] overflow-hidden">
            <div className="border-b border-white/[0.08] px-6 py-5 bg-[#030028]">
              <h1 className="font-['DM_Sans',sans-serif] font-bold text-xl text-white leading-tight">Check your email</h1>
              <p className="font-['DM_Sans',sans-serif] text-xs text-white/40 mt-0.5">{email}</p>
            </div>
            <div className="p-6 bg-[#030028]">
              <p className="font-['DM_Sans',sans-serif] text-sm text-white/50 leading-relaxed mb-5">
                We sent a verification link. Click it to activate your account and get your API key.
              </p>
              <Link
                to="/login"
                className="font-['DM_Sans',sans-serif] text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                Back to log in
              </Link>
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
            <h1 className="font-['DM_Sans',sans-serif] font-bold text-xl text-white leading-tight">Create account</h1>
            <p className="font-['DM_Sans',sans-serif] text-xs text-white/40 mt-0.5">Get your free AnchorKit API key</p>
          </div>

          {/* Body */}
          <div className="p-6 bg-[#030028]">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="font-['DM_Sans',sans-serif] text-xs text-white/50">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputCls}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-['DM_Sans',sans-serif] text-xs text-white/50">Password</label>
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

              {status === 'error' && (
                <div className="flex flex-col gap-1">
                  <p className="text-red-400 font-['DM_Sans',sans-serif] text-xs">{error}</p>
                  {emailTaken && (
                    <p className="font-['DM_Sans',sans-serif] text-xs text-white/30">
                      <Link
                        to="/login"
                        state={{ email }}
                        className="text-white/50 hover:text-white/80 transition-colors"
                      >
                        Log in
                      </Link>
                      {' '}or{' '}
                      <Link
                        to="/forgot-password"
                        className="text-white/50 hover:text-white/80 transition-colors"
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
                className="mt-1 w-full py-2.5 rounded-[6px] bg-white/[0.06] border border-white/[0.08]
                           font-['DM_Sans',sans-serif] text-sm font-medium text-white/60
                           hover:text-white/80 hover:bg-white/[0.10] transition-colors cursor-pointer
                           disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Creating account…' : 'Create account'}
              </button>
            </form>

            <p className="mt-5 font-['DM_Sans',sans-serif] text-xs text-white/30">
              Already have an account?{' '}
              <Link to="/login" className="text-white/50 hover:text-white/80 transition-colors">
                Log in
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
