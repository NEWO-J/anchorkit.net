import React from 'react';
import svgPaths from "../imports/svg-grytdm8cz7";

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
import imgAnchorkitbanner1 from "../assets/44c633e04ba178901259076c57655a5d07e01cf3.png";
import imgOfflineproofPhotoroom1 from "../assets/8c426b4eb56fbf5e46cd27c396133e4d00bb25aa.png";
import AnchorScene from '../components/AnchorScene';
import imgCapture7Photoroom1 from "../assets/186e2d76a2975de6efee22972bbd66a1fe0c026d.png";
import imgImage1 from "../assets/6b4796f351a419e80c653bf27859c2b44d7d08d5.png";

function Nav() {
  const handleNavClick = (section: string) => {
    alert(`Navigate to ${section}`);
  };

  return (
    <nav className="flex gap-10 items-center font-['Inter:Bold',sans-serif] font-bold text-xl text-[rgba(174,167,255,0.7)]">
      <button 
        onClick={() => handleNavClick('Docs')}
        className="capitalize hover:text-[rgba(174,167,255,1)] transition-colors cursor-pointer"
      >
        Docs
      </button>
      <button 
        onClick={() => handleNavClick('Verify')}
        className="capitalize hover:text-[rgba(174,167,255,1)] transition-colors cursor-pointer"
      >
        Verify
      </button>
      <button 
        onClick={() => handleNavClick('Github')}
        className="capitalize hover:text-[rgba(174,167,255,1)] transition-colors cursor-pointer"
      >
        Github
      </button>
    </nav>
  );
}

function Header() {
  return (
    <header className="w-full">
      <div className="flex items-center justify-between px-16 py-6">
        <div className="h-10 w-[189px]">
          <img
            alt="AnchorKit Logo"
            className="w-full h-full object-contain"
            src={imgAnchorkitbanner1}
          />
        </div>
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

function SecondaryButton({ children, onClick, animated = false }: { children: React.ReactNode; onClick: () => void; animated?: boolean }) {
  const btn = (
    <button
      onClick={onClick}
      className="bg-[#7b75be] hover:bg-[#948edf] rounded-[10px] px-4 py-3 font-['Inter:Medium',sans-serif] font-medium text-lg text-white transition-all relative"
    >
      {children}
    </button>
  );
  if (animated) {
    return (
      <div className="overflow-hidden p-[2px] relative rounded-xl inline-flex">
        <div aria-hidden="true" style={spinnerStyle} />
        {btn}
      </div>
    );
  }
  return btn;
}

function useIsZoomedIn() {
  const baseDPR = React.useRef(window.devicePixelRatio);
  const [zoomedIn, setZoomedIn] = React.useState(
    () => window.devicePixelRatio / baseDPR.current > 1.1
  );
  React.useEffect(() => {
    const check = () => {
      setZoomedIn(window.devicePixelRatio / baseDPR.current > 1.1);
    };
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
  const isZoomedIn = useIsZoomedIn();
  const handleGithubClick = () => {
    alert('Opening GitHub repository...');
  };

  const handleVerifyClick = () => {
    alert('Opening photo verification...');
  };

  return (
    <section className="w-full bg-[rgba(0,0,0,0.2)] border border-black relative overflow-hidden">
      <div className="relative px-16 pt-16 pb-12 min-h-[560px]">
        {/* Background illustration */}
        {!isZoomedIn && (
          <div className="absolute right-0 top-[-65px] w-[720px] h-[720px]">
            <AnchorScene modelUrl="/anchor.glb" />
          </div>
        )}

        {/* Hero content */}
        <div className="relative z-10 max-w-3xl">
          <h1 className="font-['Inter:Bold',sans-serif] font-bold text-[77px] text-white mb-8 leading-tight">
            Throwing the <span className="text-[#ff6e00]">Anchor</span>{' '}
            <br />on Deepfakes & AI
          </h1>
          
          <div className="flex flex-wrap gap-4">
            <PrimaryButton onClick={handleGithubClick} />
            <SecondaryButton animated onClick={handleVerifyClick}>
              Verify a Photo
            </SecondaryButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function SocialLink({ icon, label }: { icon: 'instagram' | 'linkedin' | 'x'; label: string }) {
  const handleClick = () => {
    alert(`Opening ${label}...`);
  };

  const renderIcon = () => {
    switch (icon) {
      case 'instagram':
        return (
          <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
            <path d={svgPaths.p3c382d72} fill="black" fillOpacity="0.45" />
          </svg>
        );
      case 'linkedin':
        return (
          <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
            <g>
              <path clipRule="evenodd" d={svgPaths.p1fcf5070} fill="black" fillOpacity="0.45" fillRule="evenodd" />
              <path d={svgPaths.pe7ea00} fill="white" />
              <path d={svgPaths.p1ab31680} fill="white" />
              <path d={svgPaths.p28c6df0} fill="white" />
            </g>
          </svg>
        );
      case 'x':
        return (
          <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
            <path d={svgPaths.pdaf0200} fill="black" fillOpacity="0.45" />
          </svg>
        );
    }
  };

  return (
    <button 
      onClick={handleClick}
      className="w-6 h-6 hover:opacity-100 opacity-70 transition-opacity"
      aria-label={label}
    >
      {renderIcon()}
    </button>
  );
}

function Footer() {
  return (
    <footer className="w-full bg-[#7b75be] border-t border-[rgba(0,0,0,0.15)]">
      <div className="flex items-center justify-between px-16 py-12">
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-2xl text-black">
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
  const handleDemoClick = () => {
    alert('Opening demo app...');
  };
  const ref1 = useScrollReveal();
  const ref2 = useScrollReveal();

  return (
    <section className="w-full py-20 px-16">
      <div className="max-w-7xl mx-auto">
        {/* No Vendor Lock-In Section */}
        <div ref={ref1} className="scroll-reveal grid lg:grid-cols-2 gap-16 items-center mb-32">
          <div className="order-2 lg:order-1">
            <img 
              alt="Offline proof verification" 
              className="w-full h-auto" 
              src={imgOfflineproofPhotoroom1} 
            />
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="font-['Inter:Bold',sans-serif] font-bold text-5xl text-[#dccbff] mb-8 leading-tight text-center lg:text-left">
              The First Photo-Provenance With No Vendor Lock-In
            </h2>
            <p className="font-['Inter:Medium',sans-serif] font-medium text-xl text-[#8e8c95] leading-relaxed">
              <span className="text-[#7c7a87]">After the initial submission, media verification requires </span>
              <span className="text-[#d7d5df]">zero trust </span>
              <span className="text-[#8e8c95]">in AnchorKit infrastructure, or any third party. All it takes is an offline proof-bundle and an RPC call to a public Solana node.</span>
            </p>
            <div className="mt-8">
              <SecondaryButton onClick={handleDemoClick}>
                Try The Demo App
              </SecondaryButton>
            </div>
          </div>
        </div>

        {/* Seamless Integration Section */}
        <div ref={ref2} className="scroll-reveal grid lg:grid-cols-2 gap-16 items-center" style={{ animationDelay: '0.1s' }}>
          <div>
            <h2 className="font-['Inter:Bold',sans-serif] font-bold text-5xl text-[#d1baff] mb-6 leading-tight">
              Integrates Seamlessly <br />Into Your App
            </h2>
            <p className="font-['Inter:Medium',sans-serif] font-medium text-xl text-[#a2a0a4] leading-relaxed mb-8">
              Drop AnchorKit into your existing Android camera stack in minutes. 
              The SDK hooks directly into CameraX and Camera2 pipelines — no rewrites required.
            </p>
            <SecondaryButton onClick={() => alert('Opening documentation...')}>
              Read The Docs
            </SecondaryButton>
          </div>
          <div className="relative">
            <div className="absolute -top-12 right-0 w-[185px] h-[94px] z-10">
              <img 
                alt="AnchorKit badge" 
                className="w-full h-full" 
                src={imgImage1} 
              />
            </div>
            <img 
              alt="App integration demo" 
              className="w-full h-auto" 
              src={imgCapture7Photoroom1} 
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-[#030028] text-white">
      <Header />
      <Hero />
      <FeatureSection />
      <Footer />
    </div>
  );
}
