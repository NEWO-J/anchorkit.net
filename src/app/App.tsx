import React from 'react';
import { Routes, Route, useNavigate } from 'react-router';
import svgPaths from "../imports/svg-grytdm8cz7";
import imgAnchorkitbanner1 from "../assets/44c633e04ba178901259076c57655a5d07e01cf3.png";
import imgOfflineproofPhotoroom1 from "../assets/8c426b4eb56fbf5e46cd27c396133e4d00bb25aa.png";
import imgCapture7Photoroom1 from "../assets/186e2d76a2975de6efee22972bbd66a1fe0c026d.png";
import AnchorScene from '../components/AnchorScene';
import VerifyPage from '../pages/VerifyPage';

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

function Nav() {
  const navigate = useNavigate();
  return (
    <nav className="flex gap-10 items-center font-['Inter:Bold',sans-serif] font-bold text-xl text-[rgba(174,167,255,0.7)]">
      <button
        onClick={() => alert('Opening Docs...')}
        className="capitalize hover:text-[rgba(174,167,255,1)] transition-colors cursor-pointer"
      >
        Docs
      </button>
      <button
        onClick={() => navigate('/verify')}
        className="capitalize hover:text-[rgba(174,167,255,1)] transition-colors cursor-pointer"
      >
        Verify
      </button>
      <button
        onClick={() => alert('Opening GitHub repository...')}
        className="capitalize hover:text-[rgba(174,167,255,1)] transition-colors cursor-pointer"
      >
        Github
      </button>
    </nav>
  );
}

function Header() {
  const navigate = useNavigate();
  return (
    <header className="w-full sticky top-0 z-50 bg-[#030028]/80 backdrop-blur-md border-b border-white/[0.06]">
      <div className="flex items-center justify-between px-16 py-6">
        <button onClick={() => navigate('/')} className="h-10 w-[189px] cursor-pointer">
          <img
            alt="AnchorKit Logo"
            className="w-full h-full object-contain"
            src={imgAnchorkitbanner1}
          />
        </button>
        <Nav />
      </div>
    </header>
  );
}

function PrimaryButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="overflow-hidden p-[2px] relative rounded-xl inline-flex">
      <div aria-hidden="true" style={spinnerStyle} />
      <button
        onClick={onClick}
        className="bg-[#030028] hover:bg-[#08083a] rounded-[10px] px-4 py-3 font-['Inter:Medium',sans-serif] font-medium text-lg text-[rgba(224,222,255,0.7)] hover:text-[rgba(224,222,255,0.9)] transition-all relative flex items-center gap-2"
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
      ? 'bg-[#ff7608] hover:bg-[#ff8a2e]'
      : variant === 'dark'
      ? 'bg-[#030028] hover:bg-[#08083a] border border-white/20'
      : 'bg-[#7b75be] hover:bg-[#948edf]';
  const textClass = variant === 'dark' ? 'text-[rgba(224,222,255,0.7)] hover:text-[rgba(224,222,255,0.9)]' : 'text-white';
  const btn = (
    <button
      onClick={onClick}
      className={`${colorClass} rounded-[10px] px-4 py-3 font-['Inter:Medium',sans-serif] font-medium text-lg ${textClass} transition-all relative${fullWidth ? ' w-full' : ''}`}
    >
      {children}
    </button>
  );
  if (animated) {
    return (
      <div className={`overflow-hidden p-[2px] relative rounded-xl inline-flex${fullWidth ? ' w-full' : ''}`}>
        <div aria-hidden="true" style={spinnerStyle} />
        {btn}
      </div>
    );
  }
  return btn;
}

function useIsZoomedIn() {
  const getBase = () => {
    const stored = parseFloat(sessionStorage.getItem('baseDPR') || '0');
    if (stored) return stored;
    const base = window.devicePixelRatio;
    sessionStorage.setItem('baseDPR', String(base));
    return base;
  };
  const [zoomedIn, setZoomedIn] = React.useState(() => window.devicePixelRatio / getBase() > 1.12);
  React.useEffect(() => {
    const base = getBase();
    const check = () => setZoomedIn(window.devicePixelRatio / base > 1.12);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return zoomedIn;
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
  const isZoomedIn = useIsZoomedIn();

  return (
    <section className="w-full h-[calc(100dvh-5rem)] bg-[rgba(0,0,0,0.2)] border border-black relative overflow-hidden">
      {/* Corner brackets */}
      <div aria-hidden="true" className="absolute bottom-[23px] left-[23px] w-12 h-12 border-b-[8px] border-l-[8px] border-[#ff6e00]" />
      <div aria-hidden="true" className="absolute top-[23px] right-[23px] w-12 h-12 border-t-[8px] border-r-[8px] border-[#ff6e00]" />
      {/* Inner border aligned to bracket corners */}
      <div aria-hidden="true" className="absolute inset-[23px] border border-white/[0.14] pointer-events-none" />

      {/* Two-column grid: text left, model right */}
      <div className="grid lg:grid-cols-[58%_42%] xl:grid-cols-2 h-full">
        {/* Left: Hero content */}
        <div className="flex flex-col justify-start px-16 pt-16 relative z-10">
          <h1 className="font-['Inter:Bold',sans-serif] font-bold text-5xl xl:text-[67px] 2xl:text-[77px] text-white mb-8 leading-tight">
            Prove What's <span className="text-[#ff6e00]">Real</span>
          </h1>
          <p className="font-['Inter:Regular',sans-serif] text-lg leading-relaxed text-white/55 max-w-md mb-8">
            AnchorKit cryptographically binds photos to the device that captured them. Proof is then anchored on Solana so authenticity can be verified without trusting a vendor.
          </p>
          <div className="flex flex-wrap gap-4">
            <PrimaryButton onClick={() => alert('Opening GitHub repository...')} />
            <SecondaryButton variant="orange" onClick={() => navigate('/verify')}>
              Verify a Photo
            </SecondaryButton>
          </div>
        </div>

        {/* Right: 3D model — clipped to the inner frame boundary so it never bleeds past the orange corner brackets */}
        <div className="hidden lg:block relative">
          {!isZoomedIn && (
            <div className="absolute overflow-hidden" style={{ top: '23px', bottom: '23px', left: '-60px', right: 0 }}>
              <AnchorScene modelUrl="/anchor.glb" />
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
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-sm text-white">
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

function FeatureSection() {
  const navigate = useNavigate();
  const ref1 = useScrollReveal();
  const ref2 = useScrollReveal();

  const cross = (extra: string) => (
    <span aria-hidden="true" className={`absolute z-10 text-white/20 text-sm font-mono select-none leading-none -translate-x-1/2 -translate-y-1/2 ${extra}`}>+</span>
  );

  return (
    <section className="w-full border-t border-white/[0.07]">
      <div className="max-w-[72rem] mx-auto border-x border-white/[0.07]">

        {/* Row 1: No Vendor Lock-In */}
        <div ref={ref1} className="scroll-reveal relative grid lg:grid-cols-2 border-b border-white/[0.07]">
          {cross('top-0 left-0')}
          {cross('top-0 left-1/2')}
          {cross('top-0 left-full')}
          {cross('top-full left-0')}
          {cross('top-full left-1/2')}
          {cross('top-full left-full')}

          <div className="flex items-center justify-center p-[30px] order-2 lg:order-1 lg:border-r border-white/[0.07]">
            <img
              alt="Offline proof verification"
              className="w-full h-auto max-w-[480px]"
              src={imgOfflineproofPhotoroom1}
            />
          </div>
          <div className="flex flex-col justify-center px-16 py-16 order-1 lg:order-2">
            <h2 className="font-['Inter:Bold',sans-serif] font-bold text-[2.55rem] text-white mb-8 leading-tight text-center lg:text-left">
              Photo-Provenance With No Vendor Lock-In
            </h2>
            <p className="font-['Inter:Medium',sans-serif] font-medium text-xl text-[#8e8c95] leading-relaxed">
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

        {/* Row 2: Seamless Integration */}
        <div ref={ref2} className="scroll-reveal relative grid lg:grid-cols-2 border-b border-white/[0.07]" style={{ animationDelay: '0.1s' }}>
          {cross('top-full left-0')}
          {cross('top-full left-1/2')}
          {cross('top-full left-full')}

          <div className="flex flex-col justify-start px-16 py-16 lg:border-r border-white/[0.07]">
            <h2 className="font-['Inter:Bold',sans-serif] font-bold text-[2.55rem] text-white mb-6 leading-tight">
              Integrates Into Your App
            </h2>
            <p className="font-['Inter:Medium',sans-serif] font-medium text-xl text-[#a2a0a4] leading-relaxed mb-8">
              Drop AnchorKit into your existing Android camera stack in minutes.
              The SDK hooks directly into CameraX and Camera2 pipelines — no rewrites required.
            </p>
            <div className="self-start">
              <SecondaryButton variant="orange" onClick={() => navigate('/verify')}>
                Try The Verifier
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
    <>
      <Hero />
      <FeatureSection />
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-[#030028] text-white">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/verify" element={<VerifyPage />} />
      </Routes>
    </div>
  );
}
