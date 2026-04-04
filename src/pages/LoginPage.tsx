import React from 'react';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router';
import { Eye, EyeOff } from 'lucide-react';
import GradientCirclesBackground from '../components/GradientCirclesBackground';

const API_BASE = 'https://api.anchorkit.net';

function EyeIcon({ visible }: { visible: boolean }) {
  return visible ? <Eye size={16} /> : <EyeOff size={16} />;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const justVerified = searchParams.get('verified') === '1';
  const prefillEmail = (location.state as { email?: string } | null)?.email ?? '';

  const [email, setEmail] = React.useState(prefillEmail);
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
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
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { detail?: string };
        throw new Error(body.detail ?? `Error ${res.status}`);
      }
      const data = await res.json().catch(() => ({})) as { email?: string };
      // Persist auth state so the Header component shows the correct nav links.
      // The actual session is in the HttpOnly ak_session cookie; this is just a
      // client-side signal for the header's loggedIn check.
      sessionStorage.setItem('ak_token', data.email ?? '1');
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('error');
    }
  };

  const inputCls = `w-full bg-black/30 border border-white/[0.08] rounded-[6px] px-3 py-2.5
                    font-['DM_Sans',sans-serif] text-sm text-white/80 placeholder-white/20
                    focus:outline-none focus:border-white/20 transition-colors`;

  return (
    <div className="relative h-screen overflow-hidden bg-[#030028] flex items-start justify-center px-4 pt-16">
      <GradientCirclesBackground />
      <div className="relative z-10 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl">
        <div className="border border-white/[0.08] overflow-hidden bg-[#030028]">

          {/* Header */}
          <div className="border-b border-white/[0.08] px-6 py-5 bg-white/[0.03]">
            <h1 className="font-['DM_Sans',sans-serif] font-bold text-xl text-white leading-tight">Log in</h1>
            <p className="font-['DM_Sans',sans-serif] text-xs text-white/40 mt-0.5">Access your AnchorKit Dashboard</p>
          </div>

          {/* Body */}
          <div className="p-6">
            {justVerified && (
              <div className="mb-5 px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-[6px]">
                <p className="font-['DM_Sans',sans-serif] text-xs text-white/60">
                  Email verified — log in to see your API key.
                </p>
              </div>
            )}

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
                <div className="flex items-center justify-between">
                  <label className="font-['DM_Sans',sans-serif] text-xs text-white/50">Password</label>
                  <Link
                    to="/forgot-password"
                    className="font-['DM_Sans',sans-serif] text-xs text-white/30 hover:text-white/60 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Your password"
                    className={`${inputCls} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <EyeIcon visible={showPassword} />
                  </button>
                </div>
              </div>

              {status === 'error' && (
                <p className="text-red-400 font-['DM_Sans',sans-serif] text-xs">{error}</p>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="mt-1 w-full py-2.5 rounded-[6px] bg-white/[0.06] border border-white/[0.08]
                           font-['DM_Sans',sans-serif] text-sm font-medium text-white/60
                           hover:text-white/80 hover:bg-white/[0.10] transition-colors cursor-pointer
                           disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Logging in…' : 'Log in'}
              </button>
            </form>

            <p className="mt-5 font-['DM_Sans',sans-serif] text-xs text-white/30">
              Don&apos;t have an account?{' '}
              <Link to="/signup" className="text-white/50 hover:text-white/80 transition-colors">
                Sign up
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
