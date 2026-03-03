import React from 'react';
import svgPaths from "../imports/svg-grytdm8cz7";

const spinnerStyle: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '200%',
  height: '200%',
  background: 'conic-gradient(from 0deg, transparent 0%, rgba(200,200,200,0.5) 25%, rgba(255,255,255,0.9) 45%, rgba(200,200,200,0.5) 70%, transparent 90%)',
  animation: 'spin-border 12s linear infinite',
  pointerEvents: 'none',
};
import imgAnchorkitbanner1 from "../assets/44c633e04ba178901259076c57655a5d07e01cf3.png";
import imgPirated21 from "../assets/fcecdc189615c8d7c711c80a604684a9c65085b0.png";
import imgOfflineproofPhotoroom1 from "../assets/8c426b4eb56fbf5e46cd27c396133e4d00bb25aa.png";
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
        className="bg-[#030028] hover:bg-[#08083a] rounded-[10px] px-4 py-3 font-['Inter:Medium',sans-serif] font-medium text-lg text-[rgba(224,222,255,0.7)] hover:text-[rgba(224,222,255,0.9)] transition-all relative"
      >
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

function Hero() {
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
        <div className="absolute right-0 top-[-65px] w-[720px] h-[720px] pointer-events-none opacity-80">
          <img 
            alt="Illustration" 
            className="w-full h-full object-cover" 
            src={imgPirated21} 
          />
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-3xl">
          <h1 className="font-['Inter:Bold',sans-serif] font-bold text-6xl text-white mb-8 leading-tight">
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

  return (
    <section className="w-full py-20 px-16">
      <div className="max-w-7xl mx-auto">
        {/* No Vendor Lock-In Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
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
        <div className="grid lg:grid-cols-2 gap-16 items-center">
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
