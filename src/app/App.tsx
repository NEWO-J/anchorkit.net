import React, { Component, ReactNode } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router';
import svgPaths from "../imports/svg-grytdm8cz7";
import imgAnchorkitbanner1 from "../assets/44c633e04ba178901259076c57655a5d07e01cf3.png";
import wimVote from "../assets/whyitmatters_vote.png";
import wimArup from "../assets/whyitmatters634.png";
import wimExplosion from "../assets/whyitmatters_explosion.png";
import wimCar from "../assets/whyitmatters_car.png";
import DataFlowGraphic from './components/DataFlowGraphic';
import DecentralizedNetworkGraphic from './components/DecentralizedNetworkGraphic';
import AnchorScene from '../components/AnchorScene';

// Prevents a render error in any single section from unmounting the entire page.
class SectionErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}
const PhoneExplodeScene = React.lazy(() => import('../components/PhoneExplodeScene'));
const PhoneParallax = React.lazy(() => import('./PhoneParallax'));
import VerifyPage from '../pages/VerifyPage';
import AnchorLogPage from '../pages/AnchorLogPage';
import DocsPage from '../pages/DocsPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import DashboardPage from '../pages/DashboardPage';
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage';
import TermsOfServicePage from '../pages/TermsOfServicePage';
import img0 from "../assets/0.jpg";
import img1 from "../assets/1.jpg";
import img2 from "../assets/2.jpg";
import img3 from "../assets/3.jpg";
import img4 from "../assets/4.mp4";
import img5 from "../assets/5.jpg";
import img6 from "../assets/6.jpg";
import img7 from "../assets/7.jpg";
import img8 from "../assets/8.mp4";
import img9 from "../assets/9.jpg";
import img10 from "../assets/10.jpg";
const heroBg = '/background.mp4';
// ─── Demo carousel photos ─────────────────────────────────────────────────────
// src     = full-res original (fetched on "Verify Me" click to compute hash)
// preview = tiny WebP served from public/previews/ (displayed in carousel)
// To add photos: drop files in src/assets/, import them above, and append here.
// Run scripts/generate-previews.mjs to regenerate previews after adding photos.
const carouselPhotos: { src: string; preview?: string; alt: string; video?: boolean }[] = [
  { src: img0,  preview: '/previews/0.webp',  alt: "Demo photo 1" },
  { src: img1,  preview: '/previews/1.webp',  alt: "Demo photo 2" },
  { src: img2,  preview: '/previews/2.webp',  alt: "Demo photo 3" },
  { src: img3,  preview: '/previews/3.webp',  alt: "Demo photo 4" },
  { src: img4,                                alt: "Demo video 5", video: true },
  { src: img5,  preview: '/previews/5.webp',  alt: "Demo photo 6" },
  { src: img6,  preview: '/previews/6.webp',  alt: "Demo photo 7" },
  { src: img7,  preview: '/previews/7.webp',  alt: "Demo photo 8" },
  { src: img8,                                alt: "Demo video 9", video: true },
  { src: img9,  preview: '/previews/9.webp',  alt: "Demo photo 10" },
  { src: img10, preview: '/previews/10.webp', alt: "Demo photo 11" },
];

async function sha256Hex(buffer: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}


const spinnerStyle: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '200%',
  height: '200%',
  background: 'conic-gradient(from 0deg, transparent 0%, rgba(200,200,200,0.4) 25%, rgba(255,255,255,0.72) 45%, rgba(200,200,200,0.4) 70%, transparent 90%)',
  animation: 'spin-border 12s linear infinite',
  pointerEvents: 'none',
};

const NAV_ITEMS = [
  { label: 'Docs', path: '/docs' },
  { label: 'Verify', path: '/verify' },
  { label: 'Anchor Log', path: '/anchors' },
  { label: 'Github', path: null },
] as const;

// The ak_csrf cookie is non-HttpOnly (JavaScript can read it) and is set by
// the server at login / cleared at logout. Use it as a fallback signal on page
// refresh when sessionStorage has been cleared (sessionStorage does not survive
// a hard refresh or opening a new tab from history).
function hasCsrfCookie(): boolean {
  return document.cookie.split('; ').some(row => row.startsWith('ak_csrf='));
}

function isLoggedIn(): boolean {
  return !!sessionStorage.getItem('ak_token') || hasCsrfCookie();
}

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [loggedIn, setLoggedIn] = React.useState(isLoggedIn());

  // Recheck auth state on route change (covers login/logout navigations)
  React.useEffect(() => {
    setLoggedIn(isLoggedIn());
    setMenuOpen(false);
  }, [location.pathname]);

  const handleNav = (path: string | null) => {
    if (path === null) { window.open('https://github.com/NEWO-J/AnchorKit', '_blank', 'noopener,noreferrer'); return; }
    if (location.pathname === path) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate(path);
      window.scrollTo({ top: 0 });
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('ak_token');
    sessionStorage.removeItem('ak_email');
    setLoggedIn(false);
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <header className="w-full sticky top-0 z-50 bg-[#030028]/80 backdrop-blur-md border-b border-white/[0.06]">
      <div className="flex items-center justify-between px-8 sm:px-16 py-6">
        <button onClick={() => handleNav('/')} className="h-10 w-[189px] cursor-pointer shrink-0">
          <img
            alt="AnchorKit Logo"
            className="w-full h-full object-contain"
            src={imgAnchorkitbanner1}
          />
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-10 items-center font-['DM_Sans',sans-serif] font-bold text-xl text-[rgba(174,167,255,0.7)]">
          {NAV_ITEMS.map(({ label, path }) => (
            <button
              key={label}
              onClick={() => handleNav(path)}
              className="capitalize hover:text-[rgba(174,167,255,1)] transition-colors cursor-pointer"
            >
              {label}
            </button>
          ))}
          {loggedIn ? (
            <>
              <button
                onClick={() => handleNav('/dashboard')}
                className="hover:text-[rgba(174,167,255,1)] transition-colors cursor-pointer"
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="px-5 py-2 rounded-[7px] border border-[rgba(174,167,255,0.35)] text-[rgba(174,167,255,0.85)] hover:border-[rgba(174,167,255,0.7)] hover:text-[rgba(174,167,255,1)] transition-colors cursor-pointer text-base"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleNav('/login')}
                className="hover:text-[rgba(174,167,255,1)] transition-colors cursor-pointer"
              >
                Log In
              </button>
              <button
                onClick={() => handleNav('/signup')}
                className="px-5 py-2 rounded-[7px] border border-[rgba(174,167,255,0.35)] text-[rgba(174,167,255,0.85)] hover:border-[rgba(174,167,255,0.7)] hover:text-[rgba(174,167,255,1)] transition-colors cursor-pointer text-base"
              >
                Sign Up
              </button>
            </>
          )}
        </nav>

        {/* Hamburger button — mobile only */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="md:hidden flex flex-col justify-center gap-[5px] w-8 h-8 cursor-pointer"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span className={`block h-[2px] bg-[rgba(174,167,255,0.7)] rounded transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
          <span className={`block h-[2px] bg-[rgba(174,167,255,0.7)] rounded transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block h-[2px] bg-[rgba(174,167,255,0.7)] rounded transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <nav className="md:hidden flex flex-col border-t border-white/[0.06] font-['DM_Sans',sans-serif] font-bold text-xl text-[rgba(174,167,255,0.7)]">
          {NAV_ITEMS.map(({ label, path }) => (
            <button
              key={label}
              onClick={() => { handleNav(path); setMenuOpen(false); }}
              className="px-8 py-4 text-left capitalize hover:text-[rgba(174,167,255,1)] hover:bg-white/[0.03] transition-colors cursor-pointer"
            >
              {label}
            </button>
          ))}
          {loggedIn ? (
            <>
              <button
                onClick={() => { handleNav('/dashboard'); setMenuOpen(false); }}
                className="px-8 py-4 text-left hover:text-[rgba(174,167,255,1)] hover:bg-white/[0.03] transition-colors cursor-pointer"
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="px-8 py-4 text-left hover:text-[rgba(174,167,255,1)] hover:bg-white/[0.03] transition-colors cursor-pointer"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { handleNav('/login'); setMenuOpen(false); }}
                className="px-8 py-4 text-left hover:text-[rgba(174,167,255,1)] hover:bg-white/[0.03] transition-colors cursor-pointer"
              >
                Log In
              </button>
              <button
                onClick={() => { handleNav('/signup'); setMenuOpen(false); }}
                className="px-8 py-4 text-left hover:text-[rgba(174,167,255,1)] hover:bg-white/[0.03] transition-colors cursor-pointer"
              >
                Sign Up
              </button>
            </>
          )}
        </nav>
      )}
    </header>
  );
}

function PrimaryButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-transparent border border-white/30 hover:border-white/50 rounded-[7px] px-4 py-1.5 font-['DM_Sans',sans-serif] font-medium text-lg text-[rgba(224,222,255,0.7)] hover:text-[rgba(224,222,255,0.9)] transition-all flex items-center gap-2"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
      Github
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
    </button>
  );
}

function SecondaryButton({ children, onClick, animated = false, variant = 'purple', fullWidth = false, ghost = false }: { children: React.ReactNode; onClick: () => void; animated?: boolean; variant?: 'purple' | 'orange' | 'dark'; fullWidth?: boolean; ghost?: boolean }) {
  const colorClass = ghost
    ? variant === 'orange'
      ? 'bg-transparent border border-[#ff7608]/60 hover:border-[#ff7608]'
      : 'bg-transparent border border-white/30 hover:border-white/50'
    : variant === 'orange'
      ? 'bg-[#ff7608]/75 hover:bg-[#ff8a2e]/75'
      : variant === 'dark'
      ? 'bg-[#030028] hover:bg-[#08083a] border border-white/20'
      : 'bg-[#7b75be] hover:bg-[#948edf]';
  const textClass = ghost
    ? variant === 'orange'
      ? 'text-[#ff7608] hover:text-[#ff8a2e]'
      : 'text-[rgba(224,222,255,0.7)] hover:text-[rgba(224,222,255,0.9)]'
    : variant === 'dark'
      ? 'text-[rgba(224,222,255,0.7)] hover:text-[rgba(224,222,255,0.9)]'
      : variant === 'orange'
        ? 'text-[#030028]'
        : 'text-white';
  const btn = (
    <button
      onClick={onClick}
      className={`${colorClass} rounded-[7px] px-4 ${ghost ? 'py-1.5' : 'py-3'} font-['DM_Sans',sans-serif] font-medium text-lg ${textClass} transition-all relative flex items-center gap-2${fullWidth ? ' w-full' : ''}`}
    >
      {children}
    </button>
  );
  if (animated) {
    return (
      <div className={`overflow-hidden p-[2px] relative rounded-[9px] inline-flex${fullWidth ? ' w-full' : ''}`}>
        <div aria-hidden="true" style={spinnerStyle} />
        {btn}
      </div>
    );
  }
  return btn;
}

function useZoomState() {
  const getBase = () => {
    const stored = parseFloat(sessionStorage.getItem('baseDPR') || '0');
    if (stored) return stored;
    const base = window.devicePixelRatio;
    sessionStorage.setItem('baseDPR', String(base));
    return base;
  };
  const compute = () => {
    const base = getBase();
    const ratio = window.devicePixelRatio / base;
    return { ratio, isZoomedIn: ratio > 1.35 };
  };
  const [state, setState] = React.useState(compute);
  React.useEffect(() => {
    const update = () => setState(compute());
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return state;
}

function useInitialViewportWidth() {
  const [w] = React.useState(() => {
    const stored = sessionStorage.getItem('initVW');
    if (stored) return parseInt(stored, 10);
    const width = window.innerWidth;
    sessionStorage.setItem('initVW', String(width));
    return width;
  });
  return w;
}

function useScrollReveal() {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function Hero() {
  const navigate = useNavigate();
  const { ratio: zr, isZoomedIn } = useZoomState();

  const anchorContainerRef = React.useRef<HTMLDivElement>(null);
  const [anchorContainerH, setAnchorContainerH] = React.useState(0);
  const [isMobile, setIsMobile] = React.useState(() => window.innerWidth < 1024);
  // Text slides in when anchor animation reaches 3/4; on mobile show immediately
  const [textVisible, setTextVisible] = React.useState(() => window.innerWidth < 1024);

  const videoARef = React.useRef<HTMLVideoElement>(null);
  const videoBRef = React.useRef<HTMLVideoElement>(null);
  const playbackRafRef = React.useRef(0);

  // Set playbackRate on both videos (one may be mid-crossfade)
  const setAllPlaybackRate = React.useCallback((rate: number) => {
    if (videoARef.current) videoARef.current.playbackRate = rate;
    if (videoBRef.current) videoBRef.current.playbackRate = rate;
  }, []);

  const handleAnchorAnimationStart = React.useCallback(() => {
    const SPIN_DURATION = 1.8; // must match AnchorScene constant
    const startMs = performance.now();
    const tick = () => {
      const t = (performance.now() - startMs) / 1000;
      if (t >= SPIN_DURATION) { setAllPlaybackRate(0.5); return; }
      // Bell curve: 0.5 → 2.0 → 0.5 over the animation
      const s = Math.sin(Math.PI * t / SPIN_DURATION);
      setAllPlaybackRate(0.5 + 1.5 * s * s);
      playbackRafRef.current = requestAnimationFrame(tick);
    };
    cancelAnimationFrame(playbackRafRef.current);
    playbackRafRef.current = requestAnimationFrame(tick);
  }, [setAllPlaybackRate]);

  React.useEffect(() => () => cancelAnimationFrame(playbackRafRef.current), []);

  // On initial load: ramp from 4x down to 0.5x over 2.5s (ease-out)
  React.useEffect(() => {
    const RAMP_MS = 2500;
    const START_RATE = 4.0;
    const END_RATE = 0.5;
    let raf = 0;
    const startMs = performance.now();
    const tick = () => {
      const t = Math.min((performance.now() - startMs) / RAMP_MS, 1);
      const eased = 1 - Math.pow(1 - t, 2); // ease-out quad
      setAllPlaybackRate(START_RATE + (END_RATE - START_RATE) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Crossfade loop — swap between videoA and videoB near the end of each play
  React.useEffect(() => {
    const CROSSFADE_SECS = 2.5;
    const a = videoARef.current;
    const b = videoBRef.current;
    if (!a || !b) return;

    let fading = false;
    let current: HTMLVideoElement = a;   // currently visible
    let next: HTMLVideoElement = b;      // waiting to take over

    const fade = () => {
      if (fading) return;
      fading = true;
      next.currentTime = 0;
      next.playbackRate = current.playbackRate;
      next.play().catch(() => {});
      const dur = `${CROSSFADE_SECS}s`;
      current.style.transition = `opacity ${dur} ease-in-out`;
      next.style.transition    = `opacity ${dur} ease-in-out`;
      current.style.opacity = '0';
      next.style.opacity    = '1';
      setTimeout(() => {
        current.pause();
        current.currentTime = 0;
        current.style.transition = 'none';
        next.style.transition    = 'none';
        [current, next] = [next, current]; // swap roles
        fading = false;
      }, CROSSFADE_SECS * 1000);
    };

    const onTimeUpdate = () => {
      const d = current.duration;
      if (!isNaN(d) && current.currentTime >= d - CROSSFADE_SECS) fade();
    };

    // timeupdate fires on whichever element is "current" at that moment
    a.addEventListener('timeupdate', onTimeUpdate);
    b.addEventListener('timeupdate', onTimeUpdate);
    return () => {
      a.removeEventListener('timeupdate', onTimeUpdate);
      b.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, []);

  React.useEffect(() => {
    const el = anchorContainerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      setAnchorContainerH(entries[0].contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  React.useEffect(() => {
    const handler = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setTextVisible(true);
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return (
    <section data-hero className="w-full min-h-[calc(100svh-5rem)] relative overflow-x-hidden">
      {/* Video background — two elements crossfade at end of each loop */}
      <video ref={videoARef} autoPlay muted playsInline preload="auto" aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 1 }}>
        <source src={heroBg} type="video/mp4" />
      </video>
      <video ref={videoBRef} muted playsInline preload="none" aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0 }}>
        <source src={heroBg} type="video/mp4" />
      </video>
      {/* Blue overlay at 90% opacity */}
      <div aria-hidden="true" className="absolute inset-0 bg-[#030028]" style={{ opacity: 0.93 }} />

      {/* Two-column grid: text left, model right */}
      <div className="grid lg:grid-cols-[58%_42%] xl:grid-cols-2 min-h-[calc(100svh-5rem)]">
        {/* Left: Hero content */}
        <div
          className="flex flex-col justify-start px-16 relative z-10 pb-0 lg:pb-[23px] overflow-hidden"
          style={{ paddingTop: isMobile ? 'calc(23px + 10svh)' : 'calc(clamp(23px, 5svh, 40px) + 30px)' }}
        >
          {/* Heading — left mask reveal */}
          <div style={{
            overflow: 'hidden',
            marginBottom: isMobile
              ? `clamp(0.5rem, calc(max(3svh, 2.25vw) * ${zr}), 4rem)`
              : `clamp(0.5rem, calc(2vw * ${zr}), 3rem)`,
          }}>
            {/* Full-width slide wrapper so -105% == column width for all rows */}
            <div style={{
              transform: textVisible ? 'translateX(0)' : 'translateX(-105%)',
              transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            }}>
              <h1
                className="font-['DM_Sans',sans-serif] font-bold text-white"
                style={{
                  fontSize: isMobile
                    ? `clamp(1.5rem, calc(max(5.5svh, 5.3vw) * ${zr}), 12rem)`
                    : `clamp(1.75rem, calc(4vw * ${zr}), 5.5rem)`,
                  lineHeight: 1.05,
                }}
              >
                Prove What's <span className="text-[#ff6e00]">Real</span>
              </h1>
            </div>
          </div>

          {/* Body copy — left mask reveal, 120 ms stagger */}
          <div style={{
            overflow: 'hidden',
            marginBottom: isMobile
              ? `clamp(0.5rem, calc(max(3svh, 2.25vw) * ${zr}), 4rem)`
              : `clamp(0.5rem, calc(2vw * ${zr}), 3rem)`,
          }}>
            <div style={{
              transform: textVisible ? 'translateX(0)' : 'translateX(-105%)',
              transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
              transitionDelay: '0ms',
            }}>
              <p
                className="font-['DM_Sans',sans-serif] text-white/55"
                style={{
                  fontSize: isMobile
                    ? `clamp(0.85rem, calc(max(1.8svh, 1.35vw) * ${zr}), 2rem)`
                    : `clamp(0.85rem, calc(1.2vw * ${zr}), 1.5rem)`,
                  lineHeight: 1.65,
                  maxWidth: 'min(34rem, 90%)',
                }}
              >
                AnchorKit cryptographically binds photos to the device that captured them. Proof is then anchored on Solana so authenticity can be verified without trusting a vendor.
              </p>
            </div>
          </div>

          {/* Buttons — left mask reveal, 240 ms stagger */}
          <div style={{ overflow: 'hidden' }}>
            <div
              style={{
                transform: textVisible ? 'translateX(0)' : 'translateX(-105%)',
                transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                transitionDelay: '0ms',
              }}
            >
            <div
              className="flex flex-wrap gap-4"
            >
              <PrimaryButton onClick={() => window.open('https://github.com/NEWO-J/AnchorKit', '_blank', 'noopener,noreferrer')} />
              <SecondaryButton variant="orange" ghost onClick={() => navigate('/verify')}>
                Verify a Photo
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
              </SecondaryButton>
            </div>
            </div>
          </div>
        </div>

        {/* Right: 3D model — clipped to the inner frame boundary so it never bleeds past the orange corner brackets */}
        <div className="hidden lg:block relative">
          {!isZoomedIn && (
            <div
              ref={anchorContainerRef}
              className="absolute overflow-hidden"
              style={{ top: 'clamp(23px, 5svh, 40px)', bottom: 'clamp(23px, 5svh, 40px)', left: '-60px', right: 0 }}
            >
              <AnchorScene modelUrl="/anchor.glb" containerHeight={anchorContainerH} onReadyForText={() => setTextVisible(true)} onAnimationStart={handleAnchorAnimationStart} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative w-full bg-[#030028] border-t border-white/[0.06]">
      <div className="flex items-center justify-between px-16 py-12">
        <div className="flex flex-col gap-2">
          <p className="font-['DM_Sans',sans-serif] font-semibold text-sm text-white/70">
            AnchorKit 2026 - Created by Jonah Owen
          </p>
          <div className="flex gap-4">
            <a href="/privacy" className="font-['DM_Sans',sans-serif] text-xs text-white/40 hover:text-white/70 transition-colors">Privacy Policy</a>
            <a href="/terms" className="font-['DM_Sans',sans-serif] text-xs text-white/40 hover:text-white/70 transition-colors">Terms of Service</a>
          </div>
        </div>
        <div className="flex gap-5">
          {/* GitHub */}
          <a
            href="https://github.com/NEWO-J/AnchorKit"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-white/40 hover:text-white transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>
          {/* LinkedIn */}
          <a
            href="https://www.linkedin.com/in/jonah-owen-487060321/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="text-white/40 hover:text-white transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}

function DemoCarousel() {
  const navigate = useNavigate();
  const [hashing, setHashing] = React.useState<number | null>(null);
  const [paused, setPaused] = React.useState(false);

  if (carouselPhotos.length === 0) {
    return (
      <div className="flex items-center justify-center py-24 text-white/20 text-sm font-mono">
        no photos yet
      </div>
    );
  }

  const looped = [...carouselPhotos, ...carouselPhotos];

  const handleVerify = async (photoIndex: number) => {
    if (hashing !== null) return;
    setHashing(photoIndex);
    const photo = carouselPhotos[photoIndex];
    try {
      const res = await fetch(photo.src);
      const buf = await res.arrayBuffer();
      const hash = await sha256Hex(buf);
      navigate(`/verify?hash=${hash}`, { state: { previewUrl: photo.src, isVideo: !!photo.video } });
    } catch {
      setHashing(null);
    }
  };

  return (
    <div className="w-full overflow-hidden py-10">
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .carousel-track {
          animation: ticker ${carouselPhotos.length * 4}s linear infinite;
          will-change: transform;
          backface-visibility: hidden;
        }
      `}</style>
      <div className="carousel-track flex gap-4" style={{ width: 'max-content', animationPlayState: paused ? 'paused' : 'running' }}>
        {looped.map((photo, i) => {
          const photoIndex = i % carouselPhotos.length;
          const isHashing = hashing === photoIndex;
          return (
            <div key={i} className="flex-shrink-0 w-52 flex flex-col">
              <div className="relative">
                {photo.video ? (
                  <video
                    src={photo.src}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-40 object-cover block"
                  />
                ) : (
                  <img
                    src={photo.preview ?? photo.src}
                    alt={photo.alt}
                    className="w-full h-40 object-cover block"
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(10,18,80,0.45) 0%, transparent 55%)' }} />
              </div>
              {/* Bar */}
              <div className="flex items-center justify-center px-3 py-2 bg-[#211b54]">
                <button
                  onClick={() => handleVerify(photoIndex)}
                  disabled={isHashing}
                  className="bg-[#211b54] hover:bg-[#2e2570] border border-[#211b54] rounded-[7px] px-4 py-[7px] font-['DM_Sans',sans-serif] font-medium text-lg text-[rgba(224,222,255,0.7)] hover:text-[rgba(224,222,255,0.9)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isHashing ? 'Computing…' : 'Verify Me'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Pixel Horizon Background ────────────────────────────────────────────────

// center1:        absolute px from the top of the container where the entry band (dark→blue) is centered.
// center2:        absolute px from the top of the container where the exit band (blue→dark) is centered at the edges.
// exitCurveDepth: how many px the exit band rises at horizontal center (convex ∩ arch).
function PixelHorizon({
  center1 = 1350,
  center2 = 2400,
}: {
  center1?: number;
  center2?: number;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function draw() {
      if (!canvas) return;
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      if (W === 0 || H === 0) return;
      canvas.width = W;
      canvas.height = H;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const PIXEL = 5;
      const SPREAD_PX = 76;

      const bayer = [
        [ 0,32, 8,40, 2,34,10,42],
        [48,16,56,24,50,18,58,26],
        [12,44, 4,36,14,46, 6,38],
        [60,28,52,20,62,30,54,22],
        [ 3,35,11,43, 1,33, 9,41],
        [51,19,59,27,49,17,57,25],
        [15,47, 7,39,13,45, 5,37],
        [63,31,55,23,61,29,53,21],
      ];
      const BAYER_SIZE = 8;
      const BAYER_MAX = 64;

      const [dR, dG, dB] = [3, 0, 40];
      const [bR, bG, bB] = [5, 10, 68];

      const cols = Math.ceil(W / PIXEL);
      const rows = Math.ceil(H / PIXEL);

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const pixelY = (row + 0.5) * PIXEL;
          const pixelX = (col + 0.5) * PIXEL;

          // Entry: dark → blue (straight)
          const p1 = (pixelY - (center1 - SPREAD_PX / 2)) / SPREAD_PX;
          const c1 = Math.max(0, Math.min(1, p1));

          const threshold = (bayer[row % BAYER_SIZE][col % BAYER_SIZE] + 0.5) / BAYER_MAX;
          // Pixel is blue only when it has passed the entry band but not yet the hard exit cut
          const useBlue = c1 > threshold && pixelY < center2;
          ctx.fillStyle = useBlue ? `rgb(${bR},${bG},${bB})` : `rgb(${dR},${dG},${dB})`;
          ctx.fillRect(col * PIXEL, row * PIXEL, PIXEL, PIXEL);
        }
      }
    }

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(canvas);
    return () => { ro.disconnect(); };
  }, [center1, center2]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ imageRendering: 'pixelated' }}
      aria-hidden="true"
    />
  );
}

// ─── Recent Anchors ───────────────────────────────────────────────────────────

interface AnchorEntry {
  date: string;
  hash_count: number | null;
  merkle_root: string | null;
  solana_tx: string | null;
  explorer_url: string | null;
  network: string;
  anchored_at: number | null;
}

function formatAnchorDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

const incidents: { label: string; title: string; summary: string; img: string; href: string; linkText: string }[] = [
  { label: "AIID #573", img: wimVote, href: "https://incidentdatabase.ai/cite/573/", linkText: "View on AI Incident Database →", title: "Deepfake Audio of Opposition Leader \"Rigging\" Slovak Election Dropped Two Days Before Voting", summary: "An AI-forged audio clip of Slovak opposition leader Michal Šimečka discussing how to buy votes and rig the election was released during the legally mandated pre-election media silence period, when he could not publicly respond. He had led in polls. He lost. Widely cited as the first election potentially swung by a deepfake." },
  { label: "AIID #634", img: wimArup, href: "https://incidentdatabase.ai/cite/634/", linkText: "View on AI Incident Database →", title: "Deepfake Video Call Tricks Arup Employee Into Wiring $25 Million to Scammers", summary: "A finance worker at global engineering firm Arup joined a video call with people who looked and sounded exactly like his CFO and colleagues — all of whom were AI-generated deepfakes. He made 15 transfers totaling $25 million before discovering the fraud." },
  { label: "AIID #756", img: wimExplosion, href: "https://incidentdatabase.ai/cite/756/", linkText: "View on AI Incident Database →", title: "AI-Generated Image of Pentagon Explosion Went Viral, Briefly Moved Stock Markets", summary: "A fabricated image depicting an explosion near the Pentagon spread across Twitter/X and was picked up by news aggregators, causing a real dip in U.S. stock futures before being debunked — illustrating how synthetic images can trigger immediate economic harm." },
  { label: "Industry Report", img: wimCar, href: "https://www.insurancebusinessmag.com/uk/news/auto-motor/can-you-spot-the-fake-aigenerated-claims-images-are-already-fooling-insurers-564978.aspx", linkText: "View source →", title: "Insurers Report 300% Surge in AI-Generated Fake Car Damage Claims", summary: "Allianz and other major UK insurers documented a 300% rise in AI-manipulated vehicle damage images submitted as claims. In one case, fraudsters used generative AI to add a cracked bumper to a van photo pulled from social media, then filed a fake invoice. The FBI estimates AI image fraud now costs American households $400–700/year in inflated premiums." },
];

const TYPEWRITER_WORDS = [
  'Journalists',
  'Photographers',
  'Content Creators',
  'Lawyers',
  'Insurance Agents',
  'News Editors',
  'Court Reporters',
  'Brand Managers',
  'Forensic Analysts',
];

const TYPE_SPEED   = 68;   // ms per character typed
const DELETE_SPEED = 32;   // ms per character deleted
const PAUSE_AFTER  = 1800; // ms to hold the completed word

function TypewriterSection() {
  const [display, setDisplay] = React.useState('');
  const [wordIdx, setWordIdx] = React.useState(0);
  const [phase, setPhase]     = React.useState<'typing' | 'pausing' | 'deleting'>('typing');

  React.useEffect(() => {
    const word = TYPEWRITER_WORDS[wordIdx % TYPEWRITER_WORDS.length];

    if (phase === 'typing') {
      if (display.length < word.length) {
        const t = setTimeout(() => setDisplay(word.slice(0, display.length + 1)), TYPE_SPEED);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setPhase('pausing'), PAUSE_AFTER);
        return () => clearTimeout(t);
      }
    }

    if (phase === 'pausing') {
      setPhase('deleting');
      return;
    }

    if (phase === 'deleting') {
      if (display.length > 0) {
        const t = setTimeout(() => setDisplay(display.slice(0, -1)), DELETE_SPEED);
        return () => clearTimeout(t);
      } else {
        setWordIdx(i => i + 1);
        setPhase('typing');
      }
    }
  }, [display, phase, wordIdx]);

  return (
    <div
      className="flex flex-col items-center justify-center py-20 px-8 border-b border-white/[0.08]"
      style={{ position: 'relative', zIndex: 1 }}
    >
      <p
        className="tracking-widest text-xs uppercase mb-4 select-none"
        style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}
      >
        Built for
      </p>
      <div className="flex items-baseline select-none" style={{ minHeight: '1.2em', marginLeft: '14px' }}>
        <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 'clamp(2rem, 5vw, 3.75rem)', color: 'rgb(160,158,170)' }}>
          {display}
        </span>
        <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 'clamp(2rem, 5vw, 3.75rem)', color: '#ff6e00', animation: 'tw-blink 1s step-end infinite' }}>
          |
        </span>
      </div>
      <style>{`
        @keyframes tw-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}

function WhyItMatters() {
  return (
    <div className="flex flex-col w-full bg-white/[0.04] pb-[120px]">
      <div className="px-8 pt-8 pb-4">
        <h2 className="font-['DM_Sans',sans-serif] font-bold text-[1.725rem] text-white/90 text-center">Why It Matters</h2>
        <p className="text-white/50 text-sm text-center mt-2 max-w-2xl mx-auto">
          AI-generated and manipulated media is already causing real-world harm. These incidents are a sample of why cryptographic provenance isn't optional.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-px border-t border-white/[0.08]">
        {incidents.map((inc) => (
          <a key={inc.label} href={inc.href} target="_blank" rel="noopener noreferrer"
            className="group flex flex-row gap-4 px-6 py-6 border-b border-r border-white/[0.06] hover:bg-white/[0.04] transition-colors">
            <img src={inc.img} alt="" loading="lazy" decoding="async" className="w-48 h-48 rounded-lg object-cover flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="flex flex-col gap-1.5 min-w-0">
              <span className="text-white/25 text-xs font-mono">{inc.label}</span>
              <p className="text-white/80 text-sm font-semibold leading-snug group-hover:text-white transition-colors">{inc.title}</p>
              <p className="text-white/45 text-xs leading-relaxed">{inc.summary}</p>
              <span className="text-white/25 text-xs mt-auto pt-1 group-hover:text-white/40 transition-colors">{inc.linkText}</span>
            </div>
          </a>
        ))}
      </div>
      <p className="text-white/20 text-xs text-center px-8 py-4">
        Most incidents sourced from the{" "}
        <a href="https://incidentdatabase.ai" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/40 transition-colors">AI Incident Database</a>{" "}
        (incidentdatabase.ai), operated by the Responsible AI Collaborative.{" "}
        <a href="https://creativecommons.org/licenses/by-sa/2.0/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/40 transition-colors">CC BY-SA 2.0</a>.
      </p>
    </div>
  );
}

function RecentAnchors() {
  const navigate = useNavigate();
  const [entries, setEntries] = React.useState<AnchorEntry[] | null>(null);
  const [error, setError] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        fetch('https://api.anchorkit.net/api/anchors')
          .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
          .then((data: AnchorEntry[]) => setEntries(data.slice(0, 5)))
          .catch(() => setError(true));
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col w-full bg-white/[0.06]">
      <div className="px-8 pt-8 pb-4">
        <h2 className="font-['DM_Sans',sans-serif] font-bold text-[1.725rem] text-white/90 text-center">Latest Anchors</h2>
      </div>
      {/* Scrollable table area */}
      <div className="overflow-x-auto scrollbar-always">

      {/* Header row */}
      <div className="grid grid-cols-[minmax(0,1.5fr)_5rem_minmax(0,1fr)_minmax(0,1.2fr)_auto] gap-x-6 px-8 py-3 border-b border-white/[0.08] bg-white/[0.02] min-w-[580px]">
        <span className="text-xs text-white/30 uppercase tracking-wide">Date</span>
        <span className="text-xs text-white/30 uppercase tracking-wide">Hashes</span>
        <span className="text-xs text-white/30 uppercase tracking-wide">Merkle Root</span>
        <span className="text-xs text-white/30 uppercase tracking-wide">Solana Transaction</span>
        <span className="text-xs text-white/30 uppercase tracking-wide">Network</span>
      </div>

      {/* Rows */}
      {error && (
        <p className="text-center text-white/25 text-sm py-10">Failed to load anchor log.</p>
      )}
      {!error && entries === null && (
        <p className="text-center text-white/20 text-sm font-mono py-10">Loading…</p>
      )}
      {!error && entries !== null && entries.length === 0 && (
        <p className="text-center text-white/25 text-sm py-10">No anchors yet.</p>
      )}
      {!error && entries !== null && entries.map((entry, i) => {
        const shortRoot = entry.merkle_root
          ? `${entry.merkle_root.slice(0, 10)}…${entry.merkle_root.slice(-6)}`
          : '—';
        const shortTx = entry.solana_tx
          ? `${entry.solana_tx.slice(0, 12)}…${entry.solana_tx.slice(-8)}`
          : null;
        const isMainnet = entry.network === 'mainnet';
        return (
          <div
            key={entry.date}
            className={`grid grid-cols-[minmax(0,1.5fr)_5rem_minmax(0,1fr)_minmax(0,1.2fr)_auto] gap-x-6 items-center px-8 py-3 border-b border-white/[0.04] min-w-[580px] ${i % 2 === 0 ? 'bg-white/[0.015]' : ''}`}
          >
            <div>
              <p className="text-white/80 text-sm font-medium">{formatAnchorDate(entry.date)}</p>
            </div>
            <div>
              {entry.hash_count != null
                ? <span className="text-white/60 text-sm tabular-nums">{entry.hash_count.toLocaleString()}</span>
                : <span className="text-white/20 text-sm">—</span>}
            </div>
            <div>
              <code className="font-mono text-xs text-[#a89fff]/70">{shortRoot}</code>
            </div>
            <div>
              {shortTx && entry.explorer_url ? (
                <a
                  href={entry.explorer_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono text-xs text-[#a89fff] hover:text-[#c8c4ff] underline underline-offset-2 transition-colors"
                >
                  {shortTx}
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-60 shrink-0" aria-hidden="true">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              ) : (
                <span className="text-white/25 text-xs font-mono">—</span>
              )}
            </div>
            <div>
              <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium border ${isMainnet ? 'bg-green-400/10 text-green-400 border-green-400/20' : 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20'}`}>
                {isMainnet ? 'Mainnet' : entry.network}
              </span>
            </div>
          </div>
        );
      })}

      </div>{/* end overflow-x-auto */}

      {/* View More */}
      <button
        onClick={() => navigate('/anchors')}
        className="w-full py-3 text-sm text-white/40 hover:text-white/70 hover:bg-white/[0.03] transition-colors border-t border-white/[0.08] tracking-wide uppercase font-medium"
      >
        View Full Anchor Log →
      </button>
    </div>
  );
}

function FeatureSection({
  anchorsRef,
  featureInnerRef,
  pixelCenter1,
  pixelCenter2,
}: {
  anchorsRef?: React.RefObject<HTMLDivElement>;
  featureInnerRef?: React.RefObject<HTMLDivElement>;
  pixelCenter1?: number;
  pixelCenter2?: number;
}) {
  const navigate = useNavigate();
  const ref1 = useScrollReveal();
  const ref2 = useScrollReveal();
  const ref3 = useScrollReveal();
  const ref4 = useScrollReveal();
  const ref5 = useScrollReveal();
  const initVW = useInitialViewportWidth();
  const gridMaxW = initVW >= 1024 ? initVW - 200 : undefined;

  const cross = (extra: string) => (
    <span aria-hidden="true" className={`absolute z-10 text-white/20 text-sm font-mono select-none leading-none -translate-x-1/2 -translate-y-1/2 ${extra}`}>+</span>
  );

  return (
    <section className="w-full border-t border-white/[0.08] bg-[#030028]">
      <div ref={featureInnerRef} className="relative mx-auto border-x border-white/[0.08] bg-[#030028]" style={{ maxWidth: gridMaxW !== undefined ? gridMaxW : '72rem' }}>
        {pixelCenter1 !== undefined && pixelCenter2 !== undefined && (
          <PixelHorizon center1={pixelCenter1} center2={pixelCenter2} />
        )}

        {/* Row 0: Full-width "Verify Me" demo (carousel) */}
        <div ref={ref1} className="relative border-b border-white/[0.08]">
          {cross('top-0 left-0')}
          {cross('top-0 left-full')}
          {cross('top-full left-0')}
          {cross('top-full left-full')}
          <DemoCarousel />
          <p className="text-white/20 text-xs text-center px-8 pt-1 pb-4">
            Submit your best AnchorKit photos to{" "}
            <a href="mailto:submissions@anchorkit.net" className="underline hover:text-white/40 transition-colors">submissions@anchorkit.net</a>
            {" "}for a chance to be featured.
          </p>
        </div>

        {/* How It Works: data flow diagram */}
        <div ref={ref5} className="scroll-reveal relative grid lg:grid-cols-2 border-b border-white/[0.08]" style={{ animationDelay: '0.05s' }}>
          {cross('top-0 left-0')}
          {cross('top-0 left-1/2')}
          {cross('top-0 left-full')}
          {cross('top-full left-0')}
          {cross('top-full left-1/2')}
          {cross('top-full left-full')}

          <div className="flex items-center justify-center pt-[140px] pb-[100px] px-[30px] lg:pt-[110px] lg:pb-[30px] lg:px-[30px] order-2 lg:order-1 lg:border-r border-white/[0.08]">
            <SectionErrorBoundary>
              <DataFlowGraphic />
            </SectionErrorBoundary>
          </div>

          <div className="flex flex-col justify-start items-start px-16 pt-16 lg:pb-[176px] order-1 lg:order-2">
            <h2 className="font-['DM_Sans',sans-serif] font-bold text-white/90 mb-8 leading-tight text-left max-w-[52ch]" style={{ fontSize: 'clamp(1.5rem, 2vw, 3rem)' }}>
              <span className="text-white/60">How It </span>Works
            </h2>
            <p className="font-['DM_Sans',sans-serif] font-medium text-[#8e8c95] leading-relaxed text-left max-w-[52ch]" style={{ fontSize: 'clamp(1rem, 1.1vw, 1.75rem)' }}>
              <span className="text-[#7c7a87]">From capture to verification — every step is </span>
              <span className="text-[#d7d5df]">cryptographically enforced</span>
              <span className="text-[#8e8c95]">. No trust in AnchorKit or any third party is required at any point in the chain.</span>
            </p>
          </div>
        </div>

        {/* Hardware Level: exploded phone model */}
        <div ref={ref3} className="scroll-reveal relative grid lg:grid-cols-2 border-b border-white/[0.08]" style={{ animationDelay: '0.05s' }}>
          {cross('top-0 left-0')}
          {cross('top-0 left-1/2')}
          {cross('top-0 left-full')}
          {cross('top-full left-0')}
          {cross('top-full left-1/2')}
          {cross('top-full left-full')}

          <div className="flex flex-col justify-start items-start px-16 py-16 order-1 lg:border-r border-white/[0.08]">
            <h2 className="font-['DM_Sans',sans-serif] font-bold text-white/90 mb-8 leading-tight text-left max-w-[52ch]" style={{ fontSize: 'clamp(1.5rem, 2vw, 3rem)' }}>
              <span className="text-white/60">Starts at the </span>Hardware Level
            </h2>
            <p className="font-['DM_Sans',sans-serif] font-medium text-[#8e8c95] leading-relaxed text-left max-w-[52ch]" style={{ fontSize: 'clamp(1rem, 1.1vw, 1.75rem)' }}>
              <span className="text-[#7c7a87]">AnchorKit routes through the device's </span>
              <span className="text-[#d7d5df]">Trusted Execution Environment</span>
              <span className="text-[#8e8c95]"> and hardware-backed keystore to cryptographically sign each photo at capture — before it ever touches user-space code or leaves the chip.</span>
            </p>
          </div>

          <div className="order-2 relative" style={{ minHeight: '520px' }}>
            <div className="absolute inset-0">
              <React.Suspense fallback={null}>
                <PhoneExplodeScene modelUrl="/phone_v3.glb" />
              </React.Suspense>
            </div>

          </div>
        </div>

        {/* Row 1: No Vendor Lock-In */}
        <div ref={ref2} className="scroll-reveal relative grid lg:grid-cols-2 border-b border-white/[0.08]" style={{ animationDelay: '0.1s' }}>
          {cross('top-0 left-0')}
          {cross('top-0 left-1/2')}
          {cross('top-0 left-full')}
          {cross('top-full left-0')}
          {cross('top-full left-1/2')}
          {cross('top-full left-full')}

          <div className="flex items-center justify-center py-[60px] px-[30px] lg:py-[40px] lg:px-[30px] order-2 lg:order-1 lg:border-r border-white/[0.08]">
            <SectionErrorBoundary>
              <DecentralizedNetworkGraphic />
            </SectionErrorBoundary>
          </div>
          <div className="flex flex-col justify-center items-start px-16 pt-16 lg:pb-[176px] order-1 lg:order-2">
            <h2 className="font-['DM_Sans',sans-serif] font-bold text-white/90 mb-8 leading-tight text-left max-w-[52ch]" style={{ fontSize: 'clamp(1.5rem, 2vw, 3rem)' }}>
              <span className="text-white/60">Photo-Provenance With </span>No Vendor Lock-In
            </h2>
            <p className="font-['DM_Sans',sans-serif] font-medium text-[#8e8c95] leading-relaxed text-left max-w-[52ch]" style={{ fontSize: 'clamp(1rem, 1.1vw, 1.75rem)' }}>
              <span className="text-[#7c7a87]">After the initial submission, media verification requires </span>
              <span className="text-[#d7d5df]">zero trust </span>
              <span className="text-[#8e8c95]">in AnchorKit infrastructure, or any third party. All it takes is an offline proof-bundle and an RPC call to a public Solana node.</span>
            </p>
            <div className="mt-8">
              <SecondaryButton variant="dark" onClick={() => alert('Opening demo app...')}>
                Try The Demo App
              </SecondaryButton>
            </div>
          </div>
        </div>

        {/* Why It Matters */}
        <div className="relative border-b border-white/[0.08]">
          <WhyItMatters />
        </div>

        {/* Built for — typewriter audience section */}
        <TypewriterSection />

        {/* Row 2: Full-width Recent Anchor Log */}
        <div ref={anchorsRef}>
          <div className="relative border-b border-white/[0.08]">
            {cross('top-0 left-0')}
            {cross('top-0 left-full')}
            {cross('top-full left-0')}
            {cross('top-full left-full')}
            <RecentAnchors />
          </div>
        </div>

        {/* Row 3: Seamless Integration */}
        <div ref={ref4} className="scroll-reveal relative grid lg:grid-cols-2 border-b border-white/[0.08] lg:min-h-[580px]" style={{ animationDelay: '0.2s' }}>
          {cross('top-full left-0')}
          {cross('top-full left-1/2')}
          {cross('top-full left-full')}

          <div className="flex flex-col justify-start items-start px-16 py-16 lg:border-r border-white/[0.08]">
            <h2 className="font-['DM_Sans',sans-serif] font-bold text-white/90 mb-6 leading-tight text-left max-w-[52ch]" style={{ fontSize: 'clamp(1.5rem, 2vw, 3rem)' }}>
              <span className="text-white/60">Integrates Into </span>Your App
            </h2>
            <p className="font-['DM_Sans',sans-serif] font-medium text-[#a2a0a4] leading-relaxed mb-8 text-left max-w-[52ch]" style={{ fontSize: 'clamp(1rem, 1.1vw, 1.75rem)' }}>
              Drop AnchorKit into your existing Android camera stack in minutes.
              The SDK hooks directly into CameraX and Camera2 pipelines — no rewrites required.
            </p>
            <div className="self-start">
              <SecondaryButton variant="orange" onClick={() => { navigate('/docs'); setTimeout(() => { const el = document.getElementById('getting-started'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }, 100); }}>
                Get Started
              </SecondaryButton>
            </div>
          </div>
          <div className="flex items-center justify-center p-[30px]">
            <SectionErrorBoundary>
              <React.Suspense fallback={null}>
                <PhoneParallax />
              </React.Suspense>
            </SectionErrorBoundary>
          </div>
        </div>

      </div>
    </section>
  );
}

const FAQ_ITEMS = [
  {
    question: "I submitted my photo/video through AnchorKit, but it still says its \"not found\"",
    answer: "AnchorKit takes a hash (a mathematical representation) of your file and uploads this. If your photo is compressed, corrupted, or edited in any capacity AFTER your photo was uploaded, the updated photo's hash will not match the anchored hash.\n\nAnother reason your AnchorKit photo will be invalid is because of a jail-broken device, unlocked bootloader or lack of internet connection.\n\nIf you believe none of the above cases apply to your photo and suspect an issue, please contact support@anchorkit.net with a detailed description of your issue.",
  },
  {
    question: "Can't someone just take a picture of another screen displaying AI-generated or doctored content?",
    answer: "Yes, however, AnchorKit's core guarantee is that a piece of media was captured by a real device at a specific moment in time. This guarantee still technically holds even if the subject matter of the image itself is artificial.\n\nThis type of attack is relatively easy to perform with still images, but it becomes significantly harder with video. Furthermore, secondary analysis techniques can examine signals such as parallax, moiré patterns, screen glare, perspective shifts, and audio inconsistencies to determine whether the captured scene is a flat display or a real-world environment.\n\nBecause of this, AnchorKit is particularly powerful when used with video capture, where these signals provide additional evidence about the authenticity of the scene.",
  },
  {
    question: "Why use the blockchain?",
    answer: "AnchorKit uses blockchain technology to ensure its promise of zero-trust photo and video verification. By anchoring the proof to Solana, the record becomes public, permanent, and independently verifiable by anyone with access to a Solana RPC node. We can't alter it. You don't have to take our word for anything. In fact, you can verify a hash yourself without using AnchorKit's infrastructure at all.\n\nSeveral photo-provenance solutions in the past have attempted blockchain-based photo provenance but struggled with the high cost of scaling up as user submissions increased. The Merkle tree technique used by AnchorKit solves this issue and ensures that the on-chain cost is constant regardless of how many users submit that day: whether it's 10 or 10 million, it's one Solana transaction. AnchorKit has a very small daily cost for us that amounts to ~$0.15 USD a year.",
  },
  {
    question: "What happens to my media's proof if AnchorKit shuts down?",
    answer: "AnchorKit provides offline proof bundles available for download on every verified photo. These allow a complete reconstruction of the photo's verification without relying on AnchorKit infrastructure. All it takes is a Solana RPC call. The proof bundle contains the signed hash, Merkle inclusion proof, and the transaction reference required to verify the record on-chain. Because this data is recorded on a public blockchain, verification does not depend on AnchorKit servers remaining online.",
  },
  {
    question: "Is this legally admissible?",
    answer: "Blockchain timestamping is increasingly admissible as legal evidence, particularly to prove the existence and integrity of digital files at a specific time (anteriority). It is considered a secure method to establish chain of custody, with courts in jurisdictions like France, China, and Washington state recognizing blockchain records. However, it is best used alongside expert testimony or traditional legal protocols.",
  },
  {
    question: "When will iOS support come?",
    answer: "iOS support can be expected to launch in 2026, though this figure is subject to delays. It will also depend on the need and how many people request this.",
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="border-b border-white/[0.08] last:border-b-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-6 px-8 py-6 text-left group cursor-pointer"
        aria-expanded={open}
      >
        <span className="font-['DM_Sans',sans-serif] font-semibold text-lg text-white/80 group-hover:text-white transition-colors leading-snug">
          {question}
        </span>
        <span
          aria-hidden="true"
          className={`shrink-0 w-6 h-6 flex items-center justify-center text-[#a89fff]/60 group-hover:text-[#a89fff] transition-all duration-200 ${open ? 'rotate-45' : ''}`}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 3v12M3 9h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </span>
      </button>
      {open && (
        <div className="px-8 pb-6 space-y-3">
          {answer.split('\n\n').map((para, i) => (
            <p key={i} className="font-['DM_Sans',sans-serif] text-base text-white/50 leading-relaxed">
              {para}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function FAQSection() {
  const initVW = useInitialViewportWidth();
  const gridMaxW = initVW >= 1024 ? initVW - 200 : undefined;
  return (
    <section className="relative w-full border-t border-white/[0.08]">
      <div className="relative mx-auto border-x border-white/[0.08] px-0 pb-16" style={{ maxWidth: gridMaxW !== undefined ? gridMaxW : '72rem' }}>
        <div className="bg-white/[0.06] px-8 pt-8 pb-4">
          <h2 className="font-['DM_Sans',sans-serif] font-bold text-[1.725rem] text-white/90 text-center">
            Frequently Asked Questions
          </h2>
        </div>
        <div className="border-t border-white/[0.08]">
          {FAQ_ITEMS.map((item) => (
            <FAQItem key={item.question} question={item.question} answer={item.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}

function HomePage() {
  const anchorsRef = React.useRef<HTMLDivElement>(null);
  const featureInnerRef = React.useRef<HTMLDivElement>(null);
  const [anchorsTop, setAnchorsTop] = React.useState<number | null>(null);
  const [featureInnerTop, setFeatureInnerTop] = React.useState<number | null>(null);

  React.useEffect(() => {
    function measure() {
      if (anchorsRef.current) setAnchorsTop(anchorsRef.current.getBoundingClientRect().top + window.scrollY);
      if (featureInnerRef.current) setFeatureInnerTop(featureInnerRef.current.getBoundingClientRect().top + window.scrollY);
    }
    measure();
    window.addEventListener('load', measure);
    const ro = new ResizeObserver(measure);
    if (anchorsRef.current) ro.observe(anchorsRef.current);
    if (featureInnerRef.current) ro.observe(featureInnerRef.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('load', measure);
    };
  }, []);

  const pixelCenter1 = anchorsTop !== null && featureInnerTop !== null ? anchorsTop - featureInnerTop - 50 : undefined;
  const pixelCenter2 = featureInnerTop !== null ? 99999 : undefined;

  return (
    <div className="relative">
      <Hero />
      <FeatureSection
        anchorsRef={anchorsRef}
        featureInnerRef={featureInnerRef}
        pixelCenter1={pixelCenter1}
        pixelCenter2={pixelCenter2}
      />
      <FAQSection />
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-[#030028] text-white">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/anchors" element={<AnchorLogPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />
      </Routes>
    </div>
  );
}
