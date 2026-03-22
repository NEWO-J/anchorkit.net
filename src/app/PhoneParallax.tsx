import React from 'react';
import beachImg from '../assets/beach.jpg';

const CARD = '#050a44';        // matches dither band blue: rgb(5,10,68)
const OUTLINE = '#030028';     // dark navy outline — matches site background
const W = '#fff';
const DIM = 'rgba(255,255,255,0.5)';
const ACCENT = '#D4713A';      // muted orange accent for small highlights
const F = "-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif";
const FM = "'SF Mono','Fira Code',Consolas,monospace";

// Design canvas size — cards are positioned for this width/height
const DESIGN_W = 700;
const DESIGN_H = 490;

function easeOutBack(t: number): number {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Returns 0→1 progress for a card given its startAt offset (window = 0.25)
function cardP(progress: number, startAt: number): number {
  return Math.max(0, Math.min(1, (progress - startAt) / 0.25));
}

type CardProps = {
  x: number; y: number; w: number; h: number;
  vw: number; vh: number;
  dur: number; phase: number; fid: string;
  py?: number; // parallax offset in px
  pop?: number; // 0→1 pop-in progress
  children: React.ReactNode;
};

function FloatCard({ x, y, w, h, vw, vh, dur, phase, fid, py = 0, pop = 1, children }: CardProps) {
  const ep = easeOutBack(pop);
  const sc = 0.45 + ep * 0.55;
  const op = Math.min(1, pop * 2.5);
  const anim = {
    attributeName: 'transform',
    type: 'translate',
    values: '0,0; 0,-8; 0,0',
    dur: `${dur}s`,
    begin: `-${phase}s`,
    repeatCount: 'indefinite',
    calcMode: 'spline',
    keyTimes: '0;0.5;1',
    keySplines: '0.45 0 0.55 1;0.45 0 0.55 1',
  } as React.SVGProps<SVGAnimateTransformElement>;

  return (
    <svg
      width={w} height={h}
      viewBox={`0 0 ${vw} ${vh}`}
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible', opacity: op, transform: `translateY(${py}px) scale(${sc})`, transformOrigin: 'center' }}
    >
      <g>
        <animateTransform {...anim} />
        <rect width={w} height={h} rx="13" fill={CARD} stroke={OUTLINE} strokeWidth="4.5" />
        {children}
      </g>
    </svg>
  );
}

export default function PhoneParallax() {
  const outerRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [parallaxPx, setParallaxPx] = React.useState(0);
  const [cardParallax, setCardParallax] = React.useState(0);
  const [scale, setScale] = React.useState(1);
  const [progress, setProgress] = React.useState(0);
  const [flashOp, setFlashOp] = React.useState(0);
  const [photoP, setPhotoP] = React.useState(0);
  const [showThumb, setShowThumb] = React.useState(false);
  const [capturePressed, setCapturePressed] = React.useState(false);

  React.useEffect(() => {
    function updateParallax() {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const offset = (rect.top + rect.height / 2) - window.innerHeight / 2;
      setParallaxPx(Math.max(-60, Math.min(60, -offset * 0.18)));
      // Cards are "closer" to viewer → move faster than the phone on scroll
      setCardParallax(Math.max(-20, Math.min(20, -offset * 0.45)));
    }

    function updateScale() {
      if (outerRef.current) {
        const w = outerRef.current.offsetWidth;
        setScale(Math.min(1, w / DESIGN_W));
      }
    }

    updateParallax();
    updateScale();

    const ro = new ResizeObserver(updateScale);
    if (outerRef.current) ro.observe(outerRef.current);

    window.addEventListener('scroll', updateParallax, { passive: true });
    window.addEventListener('resize', updateParallax, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateParallax);
      window.removeEventListener('resize', updateParallax);
      ro.disconnect();
    };
  }, []);

  const FLASH_IN  = 55;   // ms — near-instant white hit
  const FLASH_OUT = 520;  // ms — smooth realistic decay
  const PHOTO_DUR = 760;  // ms — photo fly animation

  // Shared flash → photo fly sequence (no card pop-ins — those only run on first load)
  const runFlashPhotoAnim = React.useCallback(() => {
    setPhotoP(0);
    const t0 = performance.now();
    const flashTick = (now: number) => {
      const elapsed = now - t0;
      if (elapsed < FLASH_IN) {
        setFlashOp(elapsed / FLASH_IN);
        requestAnimationFrame(flashTick);
      } else {
        const t = Math.min(1, (elapsed - FLASH_IN) / FLASH_OUT);
        setFlashOp(Math.pow(1 - t, 2.2));
        if (t < 1) {
          requestAnimationFrame(flashTick);
        } else {
          setFlashOp(0);
          const t2 = performance.now();
          const photoTick = (now2: number) => {
            const p = Math.min(1, (now2 - t2) / PHOTO_DUR);
            setPhotoP(p);
            if (p < 1) requestAnimationFrame(photoTick);
            else setShowThumb(true);
          };
          requestAnimationFrame(photoTick);
        }
      }
    };
    requestAnimationFrame(flashTick);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Button tap: shrink → release → trigger flash+photo
  const handleCapture = React.useCallback(() => {
    if (capturePressed) return;
    setCapturePressed(true);
    setTimeout(() => {
      setCapturePressed(false);
      runFlashPhotoAnim();
    }, 130);
  }, [capturePressed, runFlashPhotoAnim]);

  // Flash → photo fly → card pop-in sequence, triggered when phone is fully in frame
  React.useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const CARD_DUR = 2200;

    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();

      // Tap the shutter button visually to match the auto flash
      setCapturePressed(true);
      setTimeout(() => setCapturePressed(false), 130);

      // Phase 1+2: flash → photo fly
      runFlashPhotoAnim();

      // Phase 3: card pop-ins after photo lands (~flash + photo duration)
      setTimeout(() => {
        const t3 = performance.now();
        const tick = (now3: number) => {
          const p2 = Math.min(1, (now3 - t3) / CARD_DUR);
          setProgress(p2);
          if (p2 < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }, FLASH_IN + FLASH_OUT + PHOTO_DUR + 60);
    }, { threshold: 0.8 });

    observer.observe(el);
    return () => observer.disconnect();
  }, [runFlashPhotoAnim]);

  const showCards = scale >= 0.48;

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {/* Outer: measures available width */}
      <div
        ref={outerRef}
        style={{
          width: '100%',
          maxWidth: `${DESIGN_W}px`,
          height: `${(DESIGN_H - 50) * scale}px`,
          position: 'relative',
        }}
      >
        {/* Stage: fixed design size, scaled to fit */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${DESIGN_W}px`,
            height: `${DESIGN_H}px`,
            transformOrigin: 'top left',
            transform: `scale(${scale})`,
          }}
        >

          {/* Shift everything up 50px */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: 'translateY(-50px)' }}>

          {/* ── Phone ── */}
          {/* 3D wrapper — preserve-3d lets the right side face sit perpendicular to the front */}
          <div
            style={{
              position: 'absolute',
              left: '50%', top: '50%',
              width: '240px',
              aspectRatio: '9 / 19.5',
              transform: 'translate(-50%, -50%) perspective(1200px) rotateY(-12deg) rotateX(4deg)',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Right side face — navy blue phone thickness visible at the tilt angle */}
            <div style={{
              position: 'absolute',
              left: '100%', top: '5%',
              width: '100px', height: '90%',
              background: 'linear-gradient(to right, #0d1e55 0%, #090f35 55%, #050a1e 100%)',
              borderRadius: '0 4px 4px 0',
              transformOrigin: 'left center',
              transform: 'rotateY(90deg)',
              boxShadow: 'inset 0 1.5px 0 #0f2060, inset 0 -1.5px 0 #0f2060, inset -1.5px 0 0 #0f2060',
            }} />

            {/* Front face — all phone body styling and content */}
            <div
              style={{
                position: 'absolute', inset: 0,
                backgroundColor: '#000a2d',
                borderRadius: '28px',
                boxShadow: [
                  '0 0 0 1.5px #0f2060',
                  '12px 28px 70px rgba(0,8,40,0.75)',
                  '-6px -6px 24px rgba(20,50,180,0.07)',
                  'inset 0 1px 0 rgba(255,255,255,0.06)',
                ].join(', '),
              }}
            >
              <div style={{ position: 'absolute', left: '-5px', top: '19%', width: '3px', height: '6%', background: '#0b1845', borderRadius: '2px 0 0 2px' }} />
              <div style={{ position: 'absolute', left: '-5px', top: '27%', width: '3px', height: '6%', background: '#0b1845', borderRadius: '2px 0 0 2px' }} />
              <div style={{ position: 'absolute', right: '-5px', top: '24%', width: '3px', height: '11%', background: '#0b1845', borderRadius: '0 2px 2px 0' }} />
              <div style={{ position: 'absolute', top: '2.2%', left: '50%', transform: 'translateX(-50%)', width: '26%', height: '3.2%', background: '#00030a', borderRadius: '100px', zIndex: 4 }} />
              <div style={{ position: 'absolute', inset: '1.2%', borderRadius: '20px', overflow: 'hidden', background: '#000' }}>
                <img
                  src={beachImg} alt="" aria-hidden draggable={false}
                  style={{
                    width: '100%', height: '160%', objectFit: 'cover', objectPosition: 'center center',
                    transform: `translateY(calc(-15% + ${parallaxPx}px))`,
                    willChange: 'transform', userSelect: 'none', display: 'block',
                  }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 55%)', pointerEvents: 'none' }} />
                {flashOp > 0 && (
                  <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: flashOp, pointerEvents: 'none', zIndex: 10 }} />
                )}
              </div>
              <div style={{ position: 'absolute', bottom: '1%', left: '50%', transform: 'translateX(-50%)', width: '27%', height: '0.5%', background: 'rgba(255,255,255,0.22)', borderRadius: '100px', zIndex: 4 }} />

              {/* Capture button */}
              <div
                onClick={handleCapture}
                style={{
                  position: 'absolute',
                  bottom: '5.5%',
                  left: '50%',
                  transform: `translateX(-50%) scale(${capturePressed ? 0.80 : 1})`,
                  transition: capturePressed
                    ? 'transform 0.08s ease-in'
                    : 'transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  width: '44px', height: '44px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.70)',
                  boxShadow: '0 0 0 2px rgba(0,0,0,0.12), 0 0 0 5.5px rgba(255,255,255,0.70)',
                  cursor: 'pointer',
                  zIndex: 20,
                  userSelect: 'none',
                  WebkitTapHighlightColor: 'transparent',
                }}
              />
            </div>
          </div>

          {/* ── Flying Photo (flash → card thumbnail animation) ── */}
          {(() => {
            if (photoP <= 0 || photoP >= 1) return null;
            const FADE_IN_END   = 0.26; // 0→1 opacity during this range
            const FLIGHT_START  = 0.30; // start moving after fade-in settles
            const FADE_OUT_START = 0.80; // begin fading as it reaches the card

            let opacity: number;
            if (photoP <= FADE_IN_END) {
              opacity = photoP / FADE_IN_END;
            } else if (photoP >= FADE_OUT_START) {
              opacity = 1 - (photoP - FADE_OUT_START) / (1 - FADE_OUT_START);
            } else {
              opacity = 1;
            }

            // Start: portrait crop of phone screen (wrapper CSS coords)
            // Phone: 240px wide, centered at (350,245); screen inset ~3px each side
            const sx = 233, sy = -2, sw = 234, sh = 290;
            // End: portrait thumbnail in Card 3 "Captured On" (x=382,y=50,w=228,h=173,vw=190,vh=144)
            // SVG thumb at x=149,y=51,w=31,h=43 (portrait 20% bigger, centered) → scale=1.2 → CSS=(561,111,37,52)
            const ex = 561, ey = 111, ew = 37, eh = 52;

            let flightT = 0;
            if (photoP > FLIGHT_START) {
              flightT = easeInOutCubic((photoP - FLIGHT_START) / (1 - FLIGHT_START));
            }

            const x = sx + (ex - sx) * flightT;
            const y = sy + (ey - sy) * flightT;
            const w = sw + (ew - sw) * flightT;
            const h = sh + (eh - sh) * flightT;
            const r = 18 - 15 * flightT; // 18px → 3px border-radius
            const shadow = `0 ${6 * (1 - flightT)}px ${28 * (1 - flightT)}px rgba(0,0,0,0.45)`;

            return (
              <img
                src={beachImg}
                aria-hidden
                draggable={false}
                style={{
                  position: 'absolute',
                  left: x, top: y, width: w, height: h,
                  objectFit: 'cover', objectPosition: 'center 25%',
                  borderRadius: r,
                  opacity,
                  boxShadow: shadow,
                  pointerEvents: 'none',
                  zIndex: 20,
                  willChange: 'left, top, width, height, opacity',
                  userSelect: 'none',
                }}
              />
            );
          })()}

          {/* ── Floating Cards ── */}
          {showCards && (
            <>
              {/* Card 1 — Bootloader Check · top-left, overlapping phone top-left */}
              <FloatCard x={114} y={-8} w={194} h={101} vw={162} vh={84} dur={3.2} phase={0} fid="sh1" py={0} pop={cardP(progress, 0.66)}>
                <g transform="translate(132, 12) scale(0.65)">
                  <rect x="3" y="11" width="18" height="11" rx="2" fill="none" stroke={DIM} strokeWidth="1.8" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" fill="none" stroke={DIM} strokeWidth="1.8" />
                </g>
                <text x="14" y="28" fontFamily={F} fontSize="10.5" fontWeight="600" fill={W}>Bootloader Check</text>
                <text x="14" y="47" fontFamily={F} fontSize="9" fill={DIM}>Status</text>
                <circle cx="14" cy="62" r="3.5" fill={ACCENT} />
                <text x="24" y="66" fontFamily={F} fontSize="9.5" fill={W}>Locked</text>
              </FloatCard>

              {/* Card 2 — Anchor Status · left-center, overlapping phone left */}
              <FloatCard x={60} y={138} w={209} h={158} vw={174} vh={132} dur={3.8} phase={1.4} fid="sh2" py={0} pop={cardP(progress, 0.22)}>
                <text x="14" y="26" fontFamily={F} fontSize="10.5" fontWeight="600" fill={W}>Anchor Status</text>
                <text x="14" y="44" fontFamily={F} fontSize="8.5" fill={DIM}>Anchored on Solana at</text>
                <text x="14" y="58" fontFamily={F} fontSize="8.5" fill={W}>Mar 2, 2026 at 11:59 PM UTC</text>
                <text x="14" y="75" fontFamily={F} fontSize="8.5" fill={DIM}>Merkle Root:</text>
                <text x="14" y="89" fontFamily={FM} fontSize="8" fill={W}>9dfcd6a61f...</text>
                <text x="14" y="102" fontFamily={FM} fontSize="8" fill={DIM}>...1aa57f7</text>
                <g transform="translate(147, 108) scale(0.6)">
                  <circle cx="12" cy="5" r="3" fill="none" stroke={DIM} strokeWidth="2" />
                  <line x1="12" y1="8" x2="12" y2="19" stroke={DIM} strokeWidth="2" />
                  <line x1="7" y1="12" x2="17" y2="12" stroke={DIM} strokeWidth="2" />
                  <path d="M5 15H2a10 10 0 0 0 20 0h-3" fill="none" stroke={DIM} strokeWidth="2" />
                </g>

                {/* ── Sun glare from beach photo — right edge, fixed at cy=89 ── */}
                <defs>
                  <radialGradient id="sun-glow-2" cx="209" cy="89" r="115" gradientUnits="userSpaceOnUse">
                    <stop offset="0%"   stopColor="#ffb347" stopOpacity="0.52" />
                    <stop offset="42%"  stopColor="#ff8c00" stopOpacity="0.14" />
                    <stop offset="100%" stopColor="#ff8c00" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="sun-spec-2" cx="209" cy="89" r="36" gradientUnits="userSpaceOnUse">
                    <stop offset="0%"   stopColor="#ffd580"  stopOpacity="0.82" />
                    <stop offset="38%"  stopColor="#ffb347"  stopOpacity="0.24" />
                    <stop offset="100%" stopColor="#ffb347"  stopOpacity="0" />
                  </radialGradient>
                  {/* clipPath matches the actual card rect dimensions, not just the viewBox */}
                  <clipPath id="card2-glare-clip">
                    <rect width="209" height="158" rx="13" />
                  </clipPath>
                </defs>

                {/* Layer 1 — Ambient wash: slow irregular swell (19.1s)
                    Varied keySplines: some transitions brisk, others languid            */}
                <rect width="209" height="158" fill="url(#sun-glow-2)" clipPath="url(#card2-glare-clip)" pointerEvents="none">
                  <animate attributeName="opacity"
                    values="0.5;0.78;0.52;0.92;0.60;0.82;0.45;0.88;0.65;0.72;0.5"
                    keyTimes="0;0.09;0.19;0.31;0.42;0.54;0.65;0.75;0.84;0.93;1"
                    keySplines="0.3 0 0.7 1;0.7 0 0.3 1;0.1 0 0.6 1;0.7 0 0.5 1;0.3 0 0.7 1;0.8 0 0.4 1;0.1 0 0.5 1;0.6 0 0.4 1;0.4 0 0.6 1;0.5 0 0.5 1"
                    dur="19.1s" begin="-3.7s" repeatCount="indefinite" calcMode="spline"
                  />
                </rect>

                {/* Layer 2 — Specular flashes: grouped bursts with realistic curves (13.7s)
                    Onset:  0 1 0 1  → value jumps instantly (step-like)
                    Decay:  0 0 0.2 1 → fast drop then long exponential tail           */}
                <rect width="209" height="158" fill="url(#sun-spec-2)" clipPath="url(#card2-glare-clip)" pointerEvents="none">
                  <animate attributeName="opacity"
                    values="0;0;0.85;0.08;0;0;0.6;0.03;0;0.92;0.12;0.01;0;0;0.7;0.04;0;0;0.45;0.02;0"
                    keyTimes="0;0.06;0.08;0.12;0.16;0.21;0.23;0.27;0.32;0.37;0.40;0.43;0.48;0.54;0.57;0.60;0.65;0.71;0.74;0.78;1"
                    keySplines="0.4 0 0.6 1;0 1 0 1;0 0 0.2 1;0 0 0.4 1;0.4 0 0.6 1;0 1 0 1;0 0 0.2 1;0 0 0.5 1;0 1 0 1;0 0 0.15 1;0 0 0.4 1;0 0 0.6 1;0.4 0 0.6 1;0 1 0 1;0 0 0.2 1;0 0 0.5 1;0.4 0 0.6 1;0 1 0 1;0 0 0.2 1;0 0 0.6 1"
                    dur="13.7s" begin="-5.2s" repeatCount="indefinite" calcMode="spline"
                  />
                </rect>

                {/* Layer 3 — Glints: fast sharp spikes (4.3s)
                    All three periods are mutually prime-ish so combined pattern
                    takes ~112 000 s to repeat — effectively non-looping          */}
                <rect width="209" height="158" fill="url(#sun-spec-2)" clipPath="url(#card2-glare-clip)" pointerEvents="none">
                  <animate attributeName="opacity"
                    values="0;0;0.95;0.08;0;0;0.8;0.06;0;0.7;0.04;0"
                    keyTimes="0;0.13;0.15;0.19;0.24;0.47;0.49;0.53;0.61;0.74;0.77;1"
                    keySplines="0.4 0 0.6 1;0 1 0 1;0 0 0.15 1;0 0 0.5 1;0.4 0 0.6 1;0 1 0 1;0 0 0.2 1;0 0 0.5 1;0 1 0 1;0 0 0.2 1;0 0 0.5 1"
                    dur="4.3s" begin="-1.8s" repeatCount="indefinite" calcMode="spline"
                  />
                </rect>

                {/* Lens flare — trail of dots leftward from glare, synced to Layer 2 bursts.
                    Dot sizes vary (not monotone) to mimic real optical flare geometry.
                    fillOpacity per-dot creates the natural brightness falloff trail.    */}
                <g clipPath="url(#card2-glare-clip)" pointerEvents="none">
                  {/* faint horizontal streak tying the dots together */}
                  <rect x="60" y="88.2" width="149" height="1.6" fill="#ffd580" fillOpacity="0.10" rx="1" />
                  {/* dots: large near source, varying sizes further out */}
                  <circle cx="193" cy="89" r="3.4" fill="#ffd580" fillOpacity="1.00" />
                  <circle cx="174" cy="89" r="2.3" fill="#ffd580" fillOpacity="0.75" />
                  <circle cx="152" cy="89" r="2.9" fill="#ffe8a8" fillOpacity="0.55" />
                  <circle cx="127" cy="89" r="1.7" fill="#ffe8a8" fillOpacity="0.42" />
                  <circle cx="100" cy="89" r="2.2" fill="#fff0c8" fillOpacity="0.30" />
                  <circle cx="72"  cy="89" r="1.3" fill="#fff0c8" fillOpacity="0.20" />
                  <animate attributeName="opacity"
                    values="0;0;0.85;0.06;0;0;0.45;0.02;0;0.95;0.07;0;0;0;0.60;0.03;0;0;0.25;0.01;0"
                    keyTimes="0;0.06;0.08;0.12;0.16;0.21;0.23;0.27;0.32;0.37;0.40;0.43;0.48;0.54;0.57;0.60;0.65;0.71;0.74;0.78;1"
                    keySplines="0.4 0 0.6 1;0 1 0 1;0 0 0.2 1;0 0 0.4 1;0.4 0 0.6 1;0 1 0 1;0 0 0.2 1;0 0 0.5 1;0 1 0 1;0 0 0.15 1;0 0 0.4 1;0 0 0.6 1;0.4 0 0.6 1;0 1 0 1;0 0 0.2 1;0 0 0.5 1;0.4 0 0.6 1;0 1 0 1;0 0 0.2 1;0 0 0.6 1"
                    dur="13.7s" begin="-5.2s" repeatCount="indefinite" calcMode="spline"
                  />
                </g>

                {/* Lens flare — same dots also fire on the faster Layer 3 glints */}
                <g clipPath="url(#card2-glare-clip)" pointerEvents="none">
                  <rect x="60" y="88.2" width="149" height="1.6" fill="#ffd580" fillOpacity="0.10" rx="1" />
                  <circle cx="193" cy="89" r="3.4" fill="#ffd580" fillOpacity="1.00" />
                  <circle cx="174" cy="89" r="2.3" fill="#ffd580" fillOpacity="0.75" />
                  <circle cx="152" cy="89" r="2.9" fill="#ffe8a8" fillOpacity="0.55" />
                  <circle cx="127" cy="89" r="1.7" fill="#ffe8a8" fillOpacity="0.42" />
                  <circle cx="100" cy="89" r="2.2" fill="#fff0c8" fillOpacity="0.30" />
                  <circle cx="72"  cy="89" r="1.3" fill="#fff0c8" fillOpacity="0.20" />
                  <animate attributeName="opacity"
                    values="0;0;0.95;0.08;0;0;0.8;0.06;0;0.7;0.04;0"
                    keyTimes="0;0.13;0.15;0.19;0.24;0.47;0.49;0.53;0.61;0.74;0.77;1"
                    keySplines="0.4 0 0.6 1;0 1 0 1;0 0 0.15 1;0 0 0.5 1;0.4 0 0.6 1;0 1 0 1;0 0 0.2 1;0 0 0.5 1;0 1 0 1;0 0 0.2 1;0 0 0.5 1"
                    dur="4.3s" begin="-1.8s" repeatCount="indefinite" calcMode="spline"
                  />
                </g>
              </FloatCard>

              {/* Card 3 — Capture Details · right-center, large, overlapping phone right */}
              <FloatCard x={382} y={50} w={228} h={173} vw={190} vh={144} dur={4.2} phase={2.1} fid="sh3" py={0} pop={cardP(progress, 0)}>
                <text x="14" y="26" fontFamily={F} fontSize="10.5" fontWeight="600" fill={W}>Captured On</text>
                <text x="14" y="44" fontFamily={F} fontSize="8.5" fill={W}>Mar 1, 2026 at 7:53:43 PM PST</text>
                <text x="14" y="58" fontFamily={FM} fontSize="7.5" fill={DIM}>3f2a8b1e9c...d4c9f076</text>
                <line x1="14" y1="68" x2="140" y2="68" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <text x="14" y="82" fontFamily={F} fontSize="8.5" fontWeight="600" fill={DIM}>Hardware Attestation</text>
                <text x="14" y="98" fontFamily={FM} fontSize="7.5" fill={W}>Key: 346447e0e6bf4873...</text>
                <text x="14" y="115" fontFamily={F} fontSize="7.5" fill={DIM}>Cert: 1970-01-01 → 2048-01-01</text>
                {showThumb && (
                  <>
                    <defs>
                      <clipPath id="ph-thumb-clip">
                        {/* portrait, 20% bigger than original 36×26, centered in card vh=144 */}
                        <rect x="149" y="51" width="31" height="43" rx="3" />
                      </clipPath>
                    </defs>
                    <image href={beachImg} x="149" y="51" width="31" height="43" clipPath="url(#ph-thumb-clip)" preserveAspectRatio="xMidYMid slice" />
                    <rect x="149" y="51" width="31" height="43" rx="3" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
                  </>
                )}
              </FloatCard>

              {/* Card 4 — Metadata · bottom-right, below card 3 */}
              <FloatCard x={427} y={270} w={182} h={96} vw={152} vh={80} dur={3.5} phase={0.8} fid="sh4" py={0} pop={cardP(progress, 0.44)}>
                <g transform="translate(122, 12) scale(0.65)">
                  <polyline points="20 6 9 17 4 12" fill="none" stroke={ACCENT} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </g>
                <text x="14" y="27" fontFamily={F} fontSize="10.5" fontWeight="600" fill={W}>Metadata</text>
                <text x="14" y="46" fontFamily={F} fontSize="9" fill={W}>Google Pixel 9a</text>
                <text x="14" y="62" fontFamily={F} fontSize="9" fill={DIM}>4000 × 3000 px</text>
              </FloatCard>
            </>
          )}

          </div>{/* end translateY(-50px) wrapper */}
        </div>
      </div>
    </div>
  );
}
