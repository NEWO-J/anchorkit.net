import svgPaths from "./svg-grytdm8cz7";
import imgAnchorkitbanner1 from "figma:asset/44c633e04ba178901259076c57655a5d07e01cf3.png";
import imgPirated21 from "figma:asset/fcecdc189615c8d7c711c80a604684a9c65085b0.png";
import imgOfflineproofPhotoroom1 from "figma:asset/8c426b4eb56fbf5e46cd27c396133e4d00bb25aa.png";
import imgCapture7Photoroom1 from "figma:asset/186e2d76a2975de6efee22972bbd66a1fe0c026d.png";
import imgImage1 from "figma:asset/6b4796f351a419e80c653bf27859c2b44d7d08d5.png";

function Nav() {
  return (
    <nav className="capitalize content-stretch flex font-['Inter:Bold',sans-serif] font-bold gap-[40px] items-center leading-[0] not-italic relative shrink-0 text-[20px] text-[rgba(174,167,255,0.7)] text-center tracking-[-0.1px] whitespace-nowrap" data-name="Nav">
      <div className="flex flex-col justify-center relative shrink-0">
        <p className="leading-[1.45]">Docs</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0">
        <p className="leading-[1.45]">Verify</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0">
        <p className="leading-[1.45]">Github</p>
      </div>
    </nav>
  );
}

function Header() {
  return (
    <header className="relative shrink-0 w-full" data-name="Header 1">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[64px] py-[24px] relative w-full">
          <div className="h-[41px] relative shrink-0 w-[189px]" data-name="anchorkitbanner 1">
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgAnchorkitbanner1} />
          </div>
          <Nav />
        </div>
      </div>
    </header>
  );
}

function PrimaryButton() {
  return (
    <button className="bg-[rgba(255,255,255,0.1)] content-stretch flex items-center justify-center overflow-hidden px-[16px] py-[12px] relative rounded-[12px] shrink-0" data-name="Primary button">
      <div aria-hidden="true" className="rotating-border pointer-events-none" />
      <div aria-hidden="true" className="absolute inset-[2px] bg-[rgba(255,255,255,0.1)] pointer-events-none rounded-[10px]" />
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-[rgba(224,222,255,0.7)] text-center tracking-[-0.09px] whitespace-nowrap">
        <p className="leading-[1.45]">Github</p>
      </div>
    </button>
  );
}

function SecondaryButton() {
  return (
    <button className="bg-[rgba(174,167,255,0.7)] content-stretch flex items-center justify-center overflow-hidden px-[16px] py-[12px] relative rounded-[12px] shrink-0" data-name="Secondary button">
      <div aria-hidden="true" className="rotating-border pointer-events-none" />
      <div aria-hidden="true" className="absolute inset-[2px] bg-[rgba(174,167,255,0.7)] pointer-events-none rounded-[10px]" />
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-left text-white tracking-[-0.09px] whitespace-nowrap">
        <p className="leading-[1.45]">Verify a Photo</p>
      </div>
    </button>
  );
}

function Buttons() {
  return (
    <div className="absolute content-end cursor-pointer flex flex-wrap gap-[16px] items-end justify-center left-0 top-[139px]" data-name="Buttons">
      <PrimaryButton />
      <SecondaryButton />
    </div>
  );
}

function Text() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0)] h-[251px] left-[69px] top-[98px] w-[658px]" data-name="Text">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Bold',sans-serif] font-bold justify-center leading-[0] left-[-8px] not-italic right-[-74px] text-[64px] text-white top-[49px] tracking-[-1.28px] whitespace-pre-wrap">
        <h1 className="mb-0">
          <span className="leading-[1.1]">{`Throwing the `}</span>
          <span className="leading-[1.1] text-[#ff6e00]">Anchor</span>
          <span className="leading-[1.1]">{` `}</span>
        </h1>
        <h1 className="block leading-[1.1]">{`on Deepfakes & AI `}</h1>
      </div>
      <Buttons />
    </div>
  );
}

function Hero() {
  return (
    <section className="bg-[rgba(0,0,0,0.2)] h-[577px] relative shrink-0 w-[1274px]" data-name="Hero 1">
      <div className="content-stretch flex flex-col gap-[120px] items-center overflow-clip pt-[120px] px-[64px] relative rounded-[inherit] size-full">
        <div className="absolute left-[509px] size-[814px] top-[-68px]" data-name="pirated2 1">
          <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgPirated21} />
        </div>
        <Text />
      </div>
      <div aria-hidden="true" className="absolute border border-black border-solid inset-0 pointer-events-none" />
    </section>
  );
}

function SocialLink() {
  return (
    <button className="block relative shrink-0 size-[24px]" data-name="Social link 1">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g clipPath="url(#clip0_1_93)" id="Social link 1">
          <path d={svgPaths.p3c382d72} fill="var(--fill-0, black)" fillOpacity="0.45" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_1_93">
            <rect fill="white" height="24" width="24" />
          </clipPath>
        </defs>
      </svg>
    </button>
  );
}

function SocialLink1() {
  return (
    <button className="block relative shrink-0 size-[24px]" data-name="Social link 2">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g clipPath="url(#clip0_1_90)" id="Social link 2">
          <g id="Vector">
            <path clipRule="evenodd" d={svgPaths.p1fcf5070} fill="black" fillOpacity="0.45" fillRule="evenodd" />
            <path d={svgPaths.pe7ea00} fill="var(--fill-0, white)" />
            <path d={svgPaths.p1ab31680} fill="var(--fill-0, white)" />
            <path d={svgPaths.p28c6df0} fill="var(--fill-0, white)" />
          </g>
        </g>
        <defs>
          <clipPath id="clip0_1_90">
            <rect fill="white" height="24" width="24" />
          </clipPath>
        </defs>
      </svg>
    </button>
  );
}

function SocialLink2() {
  return (
    <button className="block relative shrink-0 size-[24px]" data-name="Social link 3">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Social link 3">
          <path d={svgPaths.pdaf0200} fill="var(--fill-0, black)" fillOpacity="0.45" id="Vector" />
        </g>
      </svg>
    </button>
  );
}

function SocialLinks() {
  return (
    <nav className="content-stretch cursor-pointer flex gap-[24px] items-center relative shrink-0" data-name="Social links">
      <SocialLink />
      <SocialLink1 />
      <SocialLink2 />
    </nav>
  );
}

function Footer() {
  return (
    <footer className="absolute bg-[#7b75be] h-[162px] left-0 top-[2135px] w-[1280px]" data-name="Footer 1">
      <div className="content-stretch flex items-center justify-between overflow-clip p-[64px] relative rounded-[inherit] size-full">
        <div className="flex flex-[1_0_0] flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] min-h-px min-w-px not-italic relative text-[24px] text-black tracking-[-0.48px]">
          <p className="leading-[1.2] whitespace-pre-wrap">AnchorKit 2026 - Created by Jonah Owen</p>
        </div>
        <SocialLinks />
      </div>
      <div aria-hidden="true" className="absolute border-[rgba(0,0,0,0.15)] border-solid border-t inset-0 pointer-events-none" />
    </footer>
  );
}

function SecondaryButton1() {
  return (
    <button className="absolute bg-[rgba(174,167,255,0.7)] content-stretch cursor-pointer flex items-center justify-center left-[83px] px-[16px] py-[12px] rounded-[12px] top-[1684px]" data-name="Secondary button">
      <div aria-hidden="true" className="absolute border-2 border-[rgba(255,255,255,0.5)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-left text-white tracking-[-0.09px] whitespace-nowrap">
        <p className="leading-[1.45]">Read The Docs</p>
      </div>
    </button>
  );
}

function SecondaryButton2() {
  return (
    <button className="absolute bg-[rgba(174,167,255,0.1)] content-stretch cursor-pointer flex items-center justify-center left-[785px] px-[16px] py-[12px] rounded-[12px] top-[1099px]" data-name="Secondary button">
      <div aria-hidden="true" className="absolute border-2 border-[rgba(255,255,255,0.5)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-left text-white tracking-[-0.09px] whitespace-nowrap">
        <p className="leading-[1.45]">Try The Demo App</p>
      </div>
    </button>
  );
}

export default function Desktop() {
  return (
    <div className="bg-[#030028] content-stretch flex flex-col items-center relative shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] size-full" data-name="Desktop">
      <Header />
      <Hero />
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[142px] justify-center leading-[0] left-[881px] not-italic text-[#8e8c95] text-[20px] text-center top-[976px] tracking-[-0.4px] w-[522px]">
        <p className="whitespace-pre-wrap">
          <span className="leading-[1.45] text-[#7c7a87]">{`After the initial submission, media verification requires `}</span>
          <span className="leading-[1.45] text-[#d7d5df]">{`zero trust `}</span>
          <span className="leading-[1.45]">in AnchorKit infrastructure, or any third party. All it takes is an offline proof-bundle and an RPC call to a public Solana node.</span>
        </p>
      </div>
      <div className="absolute h-[493px] left-[83px] top-[789px] w-[661px]" data-name="offlineproof-Photoroom 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgOfflineproofPhotoroom1} />
      </div>
      <Footer />
      <div className="absolute h-[574px] left-[647px] top-[1346px] w-[544px]" data-name="capture7-Photoroom 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgCapture7Photoroom1} />
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Bold',sans-serif] font-bold justify-center leading-[1.45] left-[83px] not-italic text-[#d1baff] text-[48px] top-[1427px] tracking-[-0.24px] whitespace-nowrap">
        <p className="mb-0">{`Integrates Seamlessly `}</p>
        <p>Into Your App</p>
      </div>
      <div className="absolute h-[94px] left-[923px] top-[1333px] w-[185px]" data-name="image 1">
        <img alt="" className="absolute block max-w-none size-full" height="94" src={imgImage1} width="185" />
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[1.45] left-[83px] not-italic text-[#a2a0a4] text-[20px] top-[1580px] tracking-[-0.1px] w-[460px] whitespace-pre-wrap">
        <p className="mb-0">{`Drop AnchorKit into your existing Android camera stack  in minutes. `}</p>
        <p className="mb-0">{`The SDK hooks directly into CameraX `}</p>
        <p>{`and Camera2 pipelines — no rewrites required. `}</p>
      </div>
      <SecondaryButton1 />
      <SecondaryButton2 />
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Bold',sans-serif] font-bold justify-center leading-[0] not-italic right-[399px] text-[#dccbff] text-[48px] text-center top-[835px] tracking-[-0.96px] translate-x-1/2 w-[740px]">
        <h1 className="block leading-[1.45] whitespace-pre-wrap">The First Photo-Provenance With No Vendor Lock-In</h1>
      </div>
    </div>
  );
}