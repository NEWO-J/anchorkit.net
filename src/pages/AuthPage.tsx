import React from 'react';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router';
import { Eye, EyeOff } from 'lucide-react';
import GradientCirclesBackground from '../components/GradientCirclesBackground';
import CaptchaWidget from '../components/CaptchaWidget';

const API_BASE = 'https://api.anchorkit.net';

function EyeIcon({ visible }: { visible: boolean }) {
  return visible ? <Eye size={16} /> : <EyeOff size={16} />;
}

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const tab: 'login' | 'signup' = location.pathname === '/signup' ? 'signup' : 'login';

  // ─── Login state ──────────────────────────────────────────────────────────────
  const justVerified = searchParams.get('verified') === '1';
  const prefillEmail = (location.state as { email?: string } | null)?.email ?? '';
  const [loginEmail, setLoginEmail] = React.useState(prefillEmail);
  const [loginPassword, setLoginPassword] = React.useState('');
  const [loginShowPassword, setLoginShowPassword] = React.useState(false);
  const [loginStatus, setLoginStatus] = React.useState<'idle' | 'loading' | 'error'>('idle');
  const [loginError, setLoginError] = React.useState('');
  const [loginCaptcha, setLoginCaptcha] = React.useState('');

  // ─── Signup state ─────────────────────────────────────────────────────────────
  const [signupEmail, setSignupEmail] = React.useState('');
  const [signupPassword, setSignupPassword] = React.useState('');
  const [signupConfirm, setSignupConfirm] = React.useState('');
  const [signupShowPassword, setSignupShowPassword] = React.useState(false);
  const [signupShowConfirm, setSignupShowConfirm] = React.useState(false);
  const [signupStatus, setSignupStatus] = React.useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [signupError, setSignupError] = React.useState('');
  const [signupEmailTaken, setSignupEmailTaken] = React.useState<'verified' | 'unverified' | false>(false);
  const [resendStatus, setResendStatus] = React.useState<'idle' | 'loading' | 'sent'>('idle');
  const [signupCaptcha, setSignupCaptcha] = React.useState('');

  const inputCls = `w-full bg-black/30 border border-white/[0.08] rounded-[6px] px-3 py-2.5
                    font-['DM_Sans',sans-serif] text-sm text-white/80 placeholder-white/20
                    focus:outline-none focus:border-white/20 transition-colors`;

  // ─── Login submit ─────────────────────────────────────────────────────────────
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginCaptcha) { setLoginError('Please complete the CAPTCHA verification.'); setLoginStatus('error'); return; }
    setLoginStatus('loading');
    setLoginError('');
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: loginEmail, password: loginPassword, cf_token: loginCaptcha }),
      });
      if (res.status === 429) throw new Error('Too many requests — please try again in a moment.');
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { detail?: string };
        throw new Error(body.detail ?? `Error ${res.status}`);
      }
      const data = await res.json().catch(() => ({})) as { email?: string };
      setLoginPassword('');
      sessionStorage.setItem('ak_token', data.email ?? '1');
      navigate('/dashboard');
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Something went wrong');
      setLoginStatus('error');
    }
  };

  // ─── Signup submit ────────────────────────────────────────────────────────────
  const handleResendVerification = async () => {
    if (resendStatus !== 'idle') return;
    setResendStatus('loading');
    try {
      await fetch(`${API_BASE}/api/v1/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signupEmail }),
      });
    } catch (_) {}
    setResendStatus('sent');
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword !== signupConfirm) { setSignupError('Passwords do not match'); setSignupStatus('error'); return; }
    if (!signupCaptcha) { setSignupError('Please complete the CAPTCHA verification.'); setSignupStatus('error'); return; }
    setSignupStatus('loading');
    setSignupError('');
    setSignupEmailTaken(false);
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signupEmail, password: signupPassword, cf_token: signupCaptcha }),
      });
      if (res.status === 429) throw new Error('Too many requests — please try again in a moment.');
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { detail?: string };
        if (res.status === 409) {
          setSignupEmailTaken(body.detail === 'unverified' ? 'unverified' : 'verified');
          setSignupStatus('error');
          return;
        }
        throw new Error(body.detail ?? `Error ${res.status}`);
      }
      setSignupPassword('');
      setSignupConfirm('');
      setSignupStatus('sent');
    } catch (err) {
      setSignupError(err instanceof Error ? err.message : 'Something went wrong');
      setSignupStatus('error');
    }
  };

  // ─── Signup success state ──────────────────────────────────────────────────────
  if (tab === 'signup' && signupStatus === 'sent') {
    return (
      <div className="relative h-screen overflow-hidden bg-[#030028] flex items-start justify-center px-4 pt-16 md:pt-24 lg:pt-32">
        <GradientCirclesBackground />
        <div className="relative z-10 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl">
          <div className="border border-white/[0.08] bg-[#030028]">
            <div className="border-b border-white/[0.08] px-6 py-5 bg-white/[0.03]">
              <h1 className="font-['DM_Sans',sans-serif] font-bold text-xl text-white leading-tight">Check your email</h1>
              <p className="font-['DM_Sans',sans-serif] text-xs text-white/40 mt-0.5">{signupEmail}</p>
            </div>
            <div className="p-6">
              <p className="font-['DM_Sans',sans-serif] text-sm text-white/50 leading-relaxed mb-5">
                We sent a verification link. Click it to activate your account and get your API key.
              </p>
              <Link to="/login" className="font-['DM_Sans',sans-serif] text-xs text-white/40 hover:text-white/70 transition-colors">
                Back to log in
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Combined card ─────────────────────────────────────────────────────────────
  return (
    <div className="relative h-screen overflow-hidden bg-[#030028] flex items-start justify-center px-4 pt-16">
      <GradientCirclesBackground />
      <div className="relative z-10 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl">
        <div className="border border-white/[0.08] bg-[#030028]">

          {/* Tab header */}
          <div className="border-b border-white/[0.08] flex">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className={`flex-1 px-6 py-5 text-left transition-colors cursor-pointer ${
                tab === 'login' ? 'bg-white/[0.06]' : 'hover:bg-white/[0.02]'
              }`}
            >
              <p className={`font-['DM_Sans',sans-serif] font-bold text-xl leading-tight transition-colors ${
                tab === 'login' ? 'text-white' : 'text-white/30'
              }`}>Log in</p>
              <p className={`font-['DM_Sans',sans-serif] text-xs mt-0.5 transition-colors ${
                tab === 'login' ? 'text-white/40' : 'text-white/15'
              }`}>Access your dashboard</p>
            </button>
            <div className="w-px bg-white/[0.08]" />
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className={`flex-1 px-6 py-5 text-left transition-colors cursor-pointer ${
                tab === 'signup' ? 'bg-white/[0.06]' : 'hover:bg-white/[0.02]'
              }`}
            >
              <p className={`font-['DM_Sans',sans-serif] font-bold text-xl leading-tight transition-colors ${
                tab === 'signup' ? 'text-white' : 'text-white/30'
              }`}>Sign up</p>
              <p className={`font-['DM_Sans',sans-serif] text-xs mt-0.5 transition-colors ${
                tab === 'signup' ? 'text-white/40' : 'text-white/15'
              }`}>Get your free API key</p>
            </button>
          </div>

          {/* Form body */}
          <div className="p-6">

            {tab === 'login' ? (
              <>
                {justVerified && (
                  <div className="mb-5 px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-[6px]">
                    <p className="font-['DM_Sans',sans-serif] text-xs text-white/60">
                      Email verified — log in to see your API key.
                    </p>
                  </div>
                )}
                <form onSubmit={handleLoginSubmit} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-['DM_Sans',sans-serif] text-xs text-white/50">Email</label>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={inputCls}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-['DM_Sans',sans-serif] text-xs text-white/50">Password</label>
                      <Link
                        to="/forgot-password"
                        className="font-['DM_Sans',sans-serif] text-xs text-gray-400 hover:text-gray-200 transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <input
                        type={loginShowPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        placeholder="Your password"
                        className={`${inputCls} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setLoginShowPassword(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                        aria-label={loginShowPassword ? 'Hide password' : 'Show password'}
                      >
                        <EyeIcon visible={loginShowPassword} />
                      </button>
                    </div>
                  </div>
                  <CaptchaWidget
                    onVerify={token => setLoginCaptcha(token)}
                    onExpire={() => setLoginCaptcha('')}
                  />
                  {loginStatus === 'error' && (
                    <p className="text-red-400 font-['DM_Sans',sans-serif] text-xs">{loginError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={loginStatus === 'loading' || !loginCaptcha}
                    className="mt-1 w-full py-2.5 rounded-[6px] bg-white/[0.06] border border-white/[0.08]
                               font-['DM_Sans',sans-serif] text-sm font-medium text-white/60
                               hover:text-white/80 hover:bg-white/[0.10] transition-colors cursor-pointer
                               disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {loginStatus === 'loading' ? 'Logging in…' : 'Log in'}
                  </button>
                </form>
                <p className="mt-5 font-['DM_Sans',sans-serif] text-xs text-white/30">
                  Don&apos;t have an account?{' '}
                  <Link to="/signup" className="text-white/50 hover:text-white/80 transition-colors">
                    Sign up
                  </Link>
                </p>
              </>
            ) : (
              <>
                <form onSubmit={handleSignupSubmit} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-['DM_Sans',sans-serif] text-xs text-white/50">Email</label>
                    <input
                      type="email"
                      required
                      value={signupEmail}
                      onChange={e => setSignupEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={inputCls}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-['DM_Sans',sans-serif] text-xs text-white/50">Password</label>
                    <div className="relative">
                      <input
                        type={signupShowPassword ? 'text' : 'password'}
                        required
                        minLength={12}
                        value={signupPassword}
                        onChange={e => setSignupPassword(e.target.value)}
                        placeholder="At least 12 characters"
                        className={`${inputCls} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setSignupShowPassword(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                        aria-label={signupShowPassword ? 'Hide password' : 'Show password'}
                      >
                        <EyeIcon visible={signupShowPassword} />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-['DM_Sans',sans-serif] text-xs text-white/50">Confirm password</label>
                    <div className="relative">
                      <input
                        type={signupShowConfirm ? 'text' : 'password'}
                        required
                        minLength={12}
                        value={signupConfirm}
                        onChange={e => setSignupConfirm(e.target.value)}
                        placeholder="Re-enter your password"
                        className={`${inputCls} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setSignupShowConfirm(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                        aria-label={signupShowConfirm ? 'Hide password' : 'Show password'}
                      >
                        <EyeIcon visible={signupShowConfirm} />
                      </button>
                    </div>
                  </div>
                  <CaptchaWidget
                    onVerify={token => setSignupCaptcha(token)}
                    onExpire={() => setSignupCaptcha('')}
                    appearance="always"
                  />
                  {signupStatus === 'error' && !signupEmailTaken && (
                    <p className="text-red-400 font-['DM_Sans',sans-serif] text-xs">{signupError}</p>
                  )}
                  {signupEmailTaken && (
                    <div className="flex flex-col gap-2">
                      <p className="text-red-400 font-['DM_Sans',sans-serif] text-xs">
                        {signupEmailTaken === 'unverified'
                          ? 'This email is registered but not yet verified.'
                          : 'An account with this email already exists.'}
                      </p>
                      <div className="flex gap-2">
                        {signupEmailTaken === 'unverified' ? (
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
                              state={{ email: signupEmail }}
                              className="flex-1 text-center py-2 rounded-[6px] border border-white/[0.08]
                                         font-['DM_Sans',sans-serif] text-xs text-white/50
                                         hover:text-white/80 hover:bg-white/[0.05] transition-colors"
                            >
                              Log in
                            </Link>
                            <Link
                              to="/forgot-password"
                              state={{ email: signupEmail }}
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
                    disabled={signupStatus === 'loading' || !signupCaptcha}
                    className="mt-1 w-full py-2.5 rounded-[6px] bg-white/[0.06] border border-white/[0.08]
                               font-['DM_Sans',sans-serif] text-sm font-medium text-white/60
                               hover:text-white/80 hover:bg-white/[0.10] transition-colors cursor-pointer
                               disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {signupStatus === 'loading' ? 'Creating account…' : 'Create account'}
                  </button>
                </form>
                <p className="mt-5 font-['DM_Sans',sans-serif] text-xs text-white/30">
                  Already have an account?{' '}
                  <Link to="/login" className="text-white/50 hover:text-white/80 transition-colors">
                    Log in
                  </Link>
                </p>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
