import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router';
import svgPaths from "../imports/svg-grytdm8cz7";
import imgAnchorkitbanner1 from "../assets/44c633e04ba178901259076c57655a5d07e01cf3.png";
import imgOfflineproofPhotoroom1 from "../assets/8c426b4eb56fbf5e46cd27c396133e4d00bb25aa.png";
import imgCapture7Photoroom1 from "../assets/186e2d76a2975de6efee22972bbd66a1fe0c026d.png";
import AnchorScene from '../components/AnchorScene';
import VerifyPage from '../pages/VerifyPage';
import AnchorLogPage from '../pages/AnchorLogPage';
import DocsPage from '../pages/DocsPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import DashboardPage from '../pages/DashboardPage';
import img0 from "../assets/0.png";
import img1 from "../assets/1.png";
import img2 from "../assets/2.png";
import img3 from "../assets/3.png";
import img4 from "../assets/4.png";
import img5 from "../assets/5.png";
import img6 from "../assets/6.png";
import img7 from "../assets/7.png";
import img8 from "../assets/8.png";
import img9 from "../assets/9.png";
import img10 from "../assets/10.png";
// ─── Demo carousel photos ─────────────────────────────────────────────────────
// To add photos: drop files in src/assets/, import them above, and append here.
const carouselPhotos: { src: string; alt: string }[] = [
  { src: img0, alt: "Demo photo 1" },
  { src: img1, alt: "Demo photo 2" },
  { src: img2, alt: "Demo photo 3" },
  { src: img3, alt: "Demo photo 4" },
  { src: img4, alt: "Demo photo 5" },
  { src: img5, alt: "Demo photo 6" },
  { src: img6, alt: "Demo photo 7" },
  { src: img7, alt: "Demo photo 8" },
  { src: img8, alt: "Demo photo 9" },
  { src: img9, alt: "Demo photo 10" },
  { src: img10, alt: "Demo photo 11" },
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

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [loggedIn, setLoggedIn] = React.useState(!!localStorage.getItem('ak_token'));

  // Recheck auth state on route change (covers login/logout navigations)
  React.useEffect(() => {
    setLoggedIn(!!localStorage.getItem('ak_token'));
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
    localStorage.removeItem('ak_token');
    localStorage.removeItem('ak_email');
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
    <div className="overflow-hidden p-[2px] relative rounded-[9px] inline-flex">
      <div aria-hidden="true" style={spinnerStyle} />
      <button
        onClick={onClick}
        className="bg-[#030028] hover:bg-[#08083a] rounded-[7px] px-4 py-3 font-['DM_Sans',sans-serif] font-medium text-lg text-[rgba(224,222,255,0.7)] hover:text-[rgba(224,222,255,0.9)] transition-all relative flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
        Github
      </button>
    </div>
  );
}

function SecondaryButton({ children, onClick, animated = false, variant = 'purple', fullWidth = false }: { children: React.ReactNode; onClick: () => void; animated?: boolean; variant?: 'purple' | 'orange' | 'dark'; fullWidth?: boolean }) {
  const colorClass =
    variant === 'orange'
      ? 'bg-[#ff7608]/75 hover:bg-[#ff8a2e]/75'
      : variant === 'dark'
      ? 'bg-[#030028] hover:bg-[#08083a] border border-white/20'
      : 'bg-[#7b75be] hover:bg-[#948edf]';
  const textClass = variant === 'dark' ? 'text-[rgba(224,222,255,0.7)] hover:text-[rgba(224,222,255,0.9)]' : variant === 'orange' ? 'text-[#030028]' : 'text-white';
  const btn = (
    <button
      onClick={onClick}
      className={`${colorClass} rounded-[7px] px-4 py-3 font-['DM_Sans',sans-serif] font-medium text-lg ${textClass} transition-all relative${fullWidth ? ' w-full' : ''}`}
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

  React.useEffect(() => {
    const el = anchorContainerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      setAnchorContainerH(entries[0].contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <section className="w-full min-h-[calc(100svh-5rem)] bg-[rgba(0,0,0,0.2)] border border-black relative overflow-x-hidden">
      {/* Corner brackets */}
      <div aria-hidden="true" className="absolute bottom-[23px] left-[23px] w-12 h-12 border-b-[8px] border-l-[8px] border-[#ff6e00]" />
      <div aria-hidden="true" className="absolute top-[23px] right-[23px] w-12 h-12 border-t-[8px] border-r-[8px] border-[#ff6e00]" />
      {/* Inner border aligned to bracket corners */}
      <div aria-hidden="true" className="absolute inset-[23px] border border-white/[0.14] pointer-events-none" />

      {/* Two-column grid: text left, model right */}
      <div className="grid lg:grid-cols-[58%_42%] xl:grid-cols-2 min-h-[calc(100svh-5rem)]">
        {/* Left: Hero content */}
        <div
          className="flex flex-col justify-start px-16 relative z-10"
          style={{ paddingTop: 'clamp(1.5rem, 10svh, 6rem)', paddingBottom: 'clamp(2rem, 8svh, 5rem)' }}
        >
          <h1
            className="font-['DM_Sans',sans-serif] font-bold text-white"
            style={{
              fontSize: `clamp(2rem, calc(8svh * ${zr}), 9rem)`,
              lineHeight: 1.05,
              marginBottom: `clamp(0.5rem, calc(3.5svh * ${zr}), 3rem)`,
            }}
          >
            Prove What's <span className="text-[#ff6e00]">Real</span>
          </h1>
          <p
            className="font-['DM_Sans',sans-serif] text-white/55"
            style={{
              fontSize: `clamp(0.85rem, calc(2svh * ${zr}), 1.5rem)`,
              lineHeight: 1.65,
              maxWidth: 'min(28rem, 90%)',
              marginBottom: `clamp(0.5rem, calc(3.5svh * ${zr}), 3rem)`,
            }}
          >
            AnchorKit cryptographically binds photos to the device that captured them. Proof is then anchored on Solana so authenticity can be verified without trusting a vendor.
          </p>
          <div className="flex flex-wrap gap-4">
            <PrimaryButton onClick={() => window.open('https://github.com/NEWO-J/AnchorKit', '_blank', 'noopener,noreferrer')} />
            <SecondaryButton variant="orange" onClick={() => navigate('/verify')}>
              Verify a Photo
            </SecondaryButton>
          </div>
        </div>

        {/* Right: 3D model — clipped to the inner frame boundary so it never bleeds past the orange corner brackets */}
        <div className="hidden lg:block relative">
          {!isZoomedIn && (
            <div
              ref={anchorContainerRef}
              className="absolute overflow-hidden"
              style={{ top: '23px', bottom: '23px', left: '-60px', right: 0 }}
            >
              <AnchorScene modelUrl="/anchor.glb" containerHeight={anchorContainerH} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function SocialLink({ icon, label }: { icon: 'instagram' | 'linkedin' | 'x'; label: string }) {
  const renderIcon = () => {
    switch (icon) {
      case 'instagram':
        return (
          <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
            <path d={svgPaths.p3c382d72} fill="white" fillOpacity="0.7" />
          </svg>
        );
      case 'linkedin':
        return (
          <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
            <g>
              <path clipRule="evenodd" d={svgPaths.p1fcf5070} fill="white" fillOpacity="0.7" fillRule="evenodd" />
              <path d={svgPaths.pe7ea00} fill="white" />
              <path d={svgPaths.p1ab31680} fill="white" />
              <path d={svgPaths.p28c6df0} fill="white" />
            </g>
          </svg>
        );
      case 'x':
        return (
          <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
            <path d={svgPaths.pdaf0200} fill="white" fillOpacity="0.7" />
          </svg>
        );
    }
  };

  return (
    <button
      onClick={() => alert(`Opening ${label}...`)}
      className="w-6 h-6 hover:opacity-100 opacity-70 transition-opacity"
      aria-label={label}
    >
      {renderIcon()}
    </button>
  );
}

function Footer() {
  return (
    <footer className="w-full bg-black border-t border-[rgba(255,255,255,0.15)]">
      <div className="flex items-center justify-between px-16 py-12">
        <p className="font-['DM_Sans',sans-serif] font-semibold text-sm text-white">
          AnchorKit 2026 - Created by Jonah Owen
        </p>
        <div className="flex gap-6">
          <SocialLink icon="instagram" label="Instagram" />
          <SocialLink icon="linkedin" label="LinkedIn" />
          <SocialLink icon="x" label="X (Twitter)" />
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
      navigate(`/verify?hash=${hash}`);
    } catch {
      setHashing(null);
    }
  };

  return (
    <div className="w-full overflow-hidden py-10" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .carousel-track {
          animation: ticker ${carouselPhotos.length * 4}s linear infinite;
        }
      `}</style>
      <div className="carousel-track flex gap-4" style={{ width: 'max-content', animationPlayState: paused ? 'paused' : 'running' }}>
        {looped.map((photo, i) => {
          const photoIndex = i % carouselPhotos.length;
          const isHashing = hashing === photoIndex;
          return (
            <div key={i} className="flex-shrink-0 w-52 flex flex-col">
              <div className="relative">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-40 object-cover block"
                />
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(10,18,80,0.45) 0%, transparent 55%)' }} />
              </div>
              {/* Bar */}
              <div className="flex items-center justify-center px-3 py-2 bg-[#050a44]">
                <button
                  onClick={() => handleVerify(photoIndex)}
                  disabled={isHashing}
                  className="bg-[#050a44] hover:bg-[#0a1260] border border-white/20 rounded-[7px] px-4 py-[7px] font-['DM_Sans',sans-serif] font-medium text-lg text-[rgba(224,222,255,0.7)] hover:text-[rgba(224,222,255,0.9)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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

function PixelHorizon({ centerFraction = 0.5 }: { centerFraction?: number }) {
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
      const SPREAD_PX = 216;
      const centerPx = H * centerFraction;

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
          const progress = (pixelY - (centerPx - SPREAD_PX / 2)) / SPREAD_PX;
          const clamped = Math.max(0, Math.min(1, progress));
          const threshold = (bayer[row % BAYER_SIZE][col % BAYER_SIZE] + 0.5) / BAYER_MAX;
          const useBlue = clamped > threshold;
          ctx.fillStyle = useBlue ? `rgb(${bR},${bG},${bB})` : `rgb(${dR},${dG},${dB})`;
          ctx.fillRect(col * PIXEL, row * PIXEL, PIXEL, PIXEL);
        }
      }
    }

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [centerFraction]);

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

function RecentAnchors() {
  const navigate = useNavigate();
  const [entries, setEntries] = React.useState<AnchorEntry[] | null>(null);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    fetch('https://api.anchorkit.net/api/anchors')
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data: AnchorEntry[]) => setEntries(data.slice(0, 5)))
      .catch(() => setError(true));
  }, []);

  return (
    <div className="flex flex-col w-full bg-white/[0.06]">
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

function FeatureSection() {
  const navigate = useNavigate();
  const ref1 = useScrollReveal();
  const ref2 = useScrollReveal();
  const ref3 = useScrollReveal();
  const ref4 = useScrollReveal();

  const cross = (extra: string) => (
    <span aria-hidden="true" className={`absolute z-10 text-white/20 text-sm font-mono select-none leading-none -translate-x-1/2 -translate-y-1/2 ${extra}`}>+</span>
  );

  return (
    <section className="w-full border-t border-white/[0.08]">
      <div className="max-w-[72rem] mx-auto border-x border-white/[0.08]">

        {/* Row 0: Full-width "Verify Me" demo (carousel) */}
        <div ref={ref1} className="relative border-b border-white/[0.08]">
          {cross('top-0 left-0')}
          {cross('top-0 left-full')}
          {cross('top-full left-0')}
          {cross('top-full left-full')}
          <DemoCarousel />
        </div>

        {/* Row 1: No Vendor Lock-In */}
        <div ref={ref2} className="scroll-reveal relative grid lg:grid-cols-2 border-b border-white/[0.08]" style={{ animationDelay: '0.1s' }}>
          {cross('top-0 left-0')}
          {cross('top-0 left-1/2')}
          {cross('top-0 left-full')}
          {cross('top-full left-0')}
          {cross('top-full left-1/2')}
          {cross('top-full left-full')}

          <div className="flex items-center justify-center p-[30px] order-2 lg:order-1 lg:border-r border-white/[0.08]">
            <img
              alt="Offline proof verification"
              className="w-full h-auto max-w-[480px]"
              src={imgOfflineproofPhotoroom1}
            />
          </div>
          <div className="flex flex-col justify-center items-center lg:items-start px-16 py-16 order-1 lg:order-2">
            <h2 className="font-['DM_Sans',sans-serif] font-bold text-[1.725rem] text-white/90 mb-8 leading-tight text-center lg:text-left">
              <span className="text-white/60">Photo-Provenance With </span>No Vendor Lock-In
            </h2>
            <p className="font-['DM_Sans',sans-serif] font-medium text-xl text-[#8e8c95] leading-relaxed text-center lg:text-left">
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

        {/* Row 2: Full-width Recent Anchor Log */}
        <div ref={ref3} className="scroll-reveal relative border-b border-white/[0.08]" style={{ animationDelay: '0.15s' }}>
          {cross('top-0 left-0')}
          {cross('top-0 left-full')}
          {cross('top-full left-0')}
          {cross('top-full left-full')}
          <RecentAnchors />
        </div>

        {/* Row 3: Seamless Integration */}
        <div ref={ref4} className="scroll-reveal relative grid lg:grid-cols-2 border-b border-white/[0.08]" style={{ animationDelay: '0.2s' }}>
          {cross('top-full left-0')}
          {cross('top-full left-1/2')}
          {cross('top-full left-full')}

          <div className="flex flex-col justify-start items-center lg:items-start px-16 py-16 lg:border-r border-white/[0.08]">
            <h2 className="font-['DM_Sans',sans-serif] font-bold text-[1.725rem] text-white/90 mb-6 leading-tight text-center lg:text-left">
              <span className="text-white/60">Integrates Into </span>Your App
            </h2>
            <p className="font-['DM_Sans',sans-serif] font-medium text-xl text-[#a2a0a4] leading-relaxed mb-8 text-center lg:text-left">
              Drop AnchorKit into your existing Android camera stack in minutes.
              The SDK hooks directly into CameraX and Camera2 pipelines — no rewrites required.
            </p>
            <div className="self-center lg:self-start">
              <SecondaryButton variant="orange" onClick={() => { navigate('/docs'); setTimeout(() => { const el = document.getElementById('getting-started'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }, 100); }}>
                Get Started
              </SecondaryButton>
            </div>
          </div>
          <div className="flex items-center justify-center p-[30px]">
            <div className="relative w-full max-w-[408px]">
              <img
                alt="App integration demo"
                className="w-full h-auto"
                src={imgCapture7Photoroom1}
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

function HomePage() {
  return (
    <div className="relative">
      <PixelHorizon centerFraction={0.5} />
      <Hero />
      <FeatureSection />
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
      </Routes>
    </div>
  );
}
