import React from 'react';
import { useNavigate, Link } from 'react-router';
import { Eye, EyeOff } from 'lucide-react';
import GradientCirclesBackground from '../components/GradientCirclesBackground';

const API_BASE = 'https://api.anchorkit.net';

function EyeIcon({ visible }: { visible: boolean }) {
  return visible ? <Eye size={16} /> : <EyeOff size={16} />;
}

export default function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [error, setError] = React.useState('');
  const [emailTaken, setEmailTaken] = React.useState<'verified' | 'unverified' | false>(false);
  const [resendStatus, setResendStatus] = React.useState<'idle' | 'loading' | 'sent'>('idle');

  const handleResendVerification = async () => {
    if (resendStatus !== 'idle') return;
    setResendStatus('loading');
    try {
      await fetch(`${API_BASE}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } catch (_) {
      // Silently ignore — always show success to avoid enumeration
    }
    setResendStatus('sent');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setStatus('error');
      return;
    }
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
        if (res.status === 409) {
          setEmailTaken(body.detail === 'unverified' ? 'unverified' : 'verified');
          setStatus('error');
          return;
        }
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
      <div className="relative h-screen overflow-hidden bg-[#030028] flex items-start justify-center px-4 pt-16 md:pt-24 lg:pt-32">
        <GradientCirclesBackground />
        <div className="relative z-10 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl">
          <div className="border border-white/[0.08] overflow-hidden bg-[#030028]">
            <div className="border-b border-white/[0.08] px-6 py-5 bg-white/[0.03]">
              <h1 className="font-['DM_Sans',sans-serif] font-bold text-xl text-white leading-tight">Check your email</h1>
              <p className="font-['DM_Sans',sans-serif] text-xs text-white/40 mt-0.5">{email}</p>
            </div>
            <div className="p-6">
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
    <div className="relative h-screen overflow-hidden bg-[#030028] flex items-start justify-center px-4 pt-16">
      <GradientCirclesBackground />
      <div className="relative z-10 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl">
        <div className="border border-white/[0.08] overflow-hidden bg-[#030028]">

          {/* Header */}
          <div className="border-b border-white/[0.08] px-6 py-5 bg-white/[0.03]">
            <h1 className="font-['DM_Sans',sans-serif] font-bold text-xl text-white leading-tight">Create account</h1>
            <p className="font-['DM_Sans',sans-serif] text-xs text-white/40 mt-0.5">Get your free AnchorKit API key</p>
          </div>

          {/* Body */}
          <div className="p-6">
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
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className={`${inputCls} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <EyeIcon visible={showPassword} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-['DM_Sans',sans-serif] text-xs text-white/50">Confirm password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className={`${inputCls} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    <EyeIcon visible={showConfirmPassword} />
                  </button>
                </div>
              </div>

              {status === 'error' && !emailTaken && (
                <p className="text-red-400 font-['DM_Sans',sans-serif] text-xs">{error}</p>
              )}
              {emailTaken && (
                <div className="flex flex-col gap-2">
                  <p className="text-red-400 font-['DM_Sans',sans-serif] text-xs">
                    {emailTaken === 'unverified'
                      ? 'This email is registered but not yet verified.'
                      : 'An account with this email already exists.'}
                  </p>
                  <div className="flex gap-2">
                    {emailTaken === 'unverified' ? (
                      resendStatus === 'sent' ? (
                        <span className="flex-1 text-center py-2 rounded-[6px] border border-white/[0.08]
                                         font-['DM_Sans',sans-serif] text-xs text-white/30">
                          Verification sent
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendVerification}
                          disabled={resendStatus === 'loading'}
                          className="flex-1 text-center py-2 rounded-[6px] border border-white/[0.08]
                                     font-['DM_Sans',sans-serif] text-xs text-white/50
                                     hover:text-white/80 hover:bg-white/[0.05] transition-colors
                                     cursor-pointer disabled:opacity-40"
                        >
                          {resendStatus === 'loading' ? 'Sending…' : 'Resend verification'}
                        </button>
                      )
                    ) : (
                      <>
                        <Link
                          to="/login"
                          state={{ email }}
                          className="flex-1 text-center py-2 rounded-[6px] border border-white/[0.08]
                                     font-['DM_Sans',sans-serif] text-xs text-white/50
                                     hover:text-white/80 hover:bg-white/[0.05] transition-colors"
                        >
                          Log in
                        </Link>
                        <Link
                          to="/forgot-password"
                          state={{ email }}
                          className="flex-1 text-center py-2 rounded-[6px] border border-white/[0.08]
                                     font-['DM_Sans',sans-serif] text-xs text-white/50
                                     hover:text-white/80 hover:bg-white/[0.05] transition-colors"
                        >
                          Reset password
                        </Link>
                      </>
                    )}
                  </div>
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
