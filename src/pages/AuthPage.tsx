import React from 'react';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router';
import { Eye, EyeOff } from 'lucide-react';
import GradientCirclesBackground from '../components/GradientCirclesBackground';
import CaptchaWidget from '../components/CaptchaWidget';

const API_BASE = 'https://api.anchorkit.net';

function EyeIcon({ visible }: { visible: boolean }) {
  return visible ? <Eye size={16} /> : <EyeOff size={16} />;
}

function OAuthButtons() {
  return (
    <div className="flex flex-col gap-3 mt-5">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/[0.08]" />
        <span className="font-['DM_Sans',sans-serif] text-xs text-white/25">or continue with</span>
        <div className="flex-1 h-px bg-white/[0.08]" />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { window.location.href = `${API_BASE}/api/v1/auth/google`; }}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[6px]
                     border border-white/[0.08] bg-black/30 hover:bg-white/[0.06]
                     font-['DM_Sans',sans-serif] text-sm text-white/60 hover:text-white/80
                     transition-colors cursor-pointer"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>
        <button
          type="button"
          onClick={() => { window.location.href = `${API_BASE}/api/v1/auth/github`; }}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[6px]
                     border border-white/[0.08] bg-black/30 hover:bg-white/[0.06]
                     font-['DM_Sans',sans-serif] text-sm text-white/60 hover:text-white/80
                     transition-colors cursor-pointer"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          GitHub
        </button>
      </div>
    </div>
  );
}

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const tab: 'login' | 'signup' = location.pathname === '/signup' ? 'signup' : 'login';

  // ─── Login state ──────────────────────────────────────────────────────────────
  const justVerified = searchParams.get('verified') === '1';
  const oauthError = searchParams.get('oauth_error') === '1';
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
  const [signupNewsletter, setSignupNewsletter] = React.useState(false);

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
        body: JSON.stringify({ email: signupEmail, password: signupPassword, cf_token: signupCaptcha, newsletter: signupNewsletter }),
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
      <div className="relative h-screen overflow-hidden bg-[#030028] flex items-start justify-center px-4 pt-6">
        <GradientCirclesBackground />
        <div className="relative z-10 w-full max-w-sm md:max-w-md">
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
    <div className="relative h-screen overflow-hidden bg-[#030028] flex items-start justify-center px-4 pt-6">
      <GradientCirclesBackground />
      <div className="relative z-10 w-full max-w-sm md:max-w-md">
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
                {oauthError && (
                  <div className="mb-5 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-[6px]">
                    <p className="font-['DM_Sans',sans-serif] text-xs text-red-400/80">
                      Sign-in failed — please try again or use email and password.
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
                <OAuthButtons />
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
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={signupNewsletter}
                      onChange={e => setSignupNewsletter(e.target.checked)}
                      className="mt-[1px] shrink-0 w-3.5 h-3.5 rounded-sm border border-white/[0.2] bg-black/30 accent-white/60 cursor-pointer"
                    />
                    <span className="font-['DM_Sans',sans-serif] text-xs text-white/35 leading-relaxed select-none">
                      Keep me updated with the latest AnchorKit news
                    </span>
                  </label>
                  <p className="font-['DM_Sans',sans-serif] text-xs text-white/25 leading-relaxed">
                    By registering an account with AnchorKit, you agree to our{' '}
                    <Link to="/terms" className="text-white/40 hover:text-white/60 underline transition-colors">
                      Terms &amp; Conditions
                    </Link>
                    {' '}and acknowledge that you have read and understand our{' '}
                    <Link to="/privacy" className="text-white/40 hover:text-white/60 underline transition-colors">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                  <button
                    type="submit"
                    disabled={signupStatus === 'loading' || !signupCaptcha}
                    className="w-full py-2.5 rounded-[6px] bg-white/[0.06] border border-white/[0.08]
                               font-['DM_Sans',sans-serif] text-sm font-medium text-white/60
                               hover:text-white/80 hover:bg-white/[0.10] transition-colors cursor-pointer
                               disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {signupStatus === 'loading' ? 'Creating account…' : 'Create account'}
                  </button>
                </form>
                <OAuthButtons />
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
