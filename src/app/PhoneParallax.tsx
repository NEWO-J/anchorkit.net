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

type CardProps = {
  x: number; y: number; w: number; h: number;
  // vw/vh = original design dimensions used as viewBox (content scales to w×h)
  vw: number; vh: number;
  dur: number; phase: number; fid: string;
  children: React.ReactNode;
};

function FloatCard({ x, y, w, h, vw, vh, dur, phase, fid, children }: CardProps) {
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
      style={{ position: 'absolute', left: x, top: y, overflow: 'visible' }}
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
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    function updateParallax() {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const offset = (rect.top + rect.height / 2) - window.innerHeight / 2;
      setParallaxPx(Math.max(-60, Math.min(60, -offset * 0.18)));
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
          <div
            style={{
              position: 'absolute',
              left: '50%', top: '50%',
              width: '240px',
              aspectRatio: '9 / 19.5',
              backgroundColor: '#000a2d',
              borderRadius: '28px',
              boxShadow: [
                '0 0 0 1.5px #0f2060',
                '12px 28px 70px rgba(0,8,40,0.75)',
                '-6px -6px 24px rgba(20,50,180,0.07)',
                'inset 0 1px 0 rgba(255,255,255,0.06)',
              ].join(', '),
              transform: 'translate(-50%, -50%) perspective(1200px) rotateY(-12deg) rotateX(4deg)',
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
            </div>
            <div style={{ position: 'absolute', bottom: '1%', left: '50%', transform: 'translateX(-50%)', width: '27%', height: '0.5%', background: 'rgba(255,255,255,0.22)', borderRadius: '100px', zIndex: 4 }} />
          </div>

          {/* ── Floating Cards ── */}
          {showCards && (
            <>
              {/* Card 1 — Bootloader Check · top-left, overlapping phone top-left */}
              <FloatCard x={134} y={32} w={194} h={101} vw={162} vh={84} dur={3.2} phase={0} fid="sh1">
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
              <FloatCard x={110} y={218} w={209} h={158} vw={174} vh={132} dur={3.8} phase={1.4} fid="sh2">
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
              </FloatCard>

              {/* Card 3 — Capture Details · right-center, large, overlapping phone right */}
              <FloatCard x={382} y={100} w={228} h={173} vw={190} vh={144} dur={4.2} phase={2.1} fid="sh3">
                <text x="14" y="26" fontFamily={F} fontSize="10.5" fontWeight="600" fill={W}>Captured On</text>
                <text x="14" y="44" fontFamily={F} fontSize="8.5" fill={W}>Mar 1, 2026 at 7:53:43 PM PST</text>
                <text x="14" y="58" fontFamily={FM} fontSize="7.5" fill={DIM}>3f2a8b1e9c...d4c9f076</text>
                <line x1="14" y1="68" x2="176" y2="68" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <text x="14" y="82" fontFamily={F} fontSize="8.5" fontWeight="600" fill={DIM}>Hardware Attestation</text>
                <text x="14" y="98" fontFamily={FM} fontSize="7.5" fill={W}>Key: 346447e0e6bf4873...</text>
                <text x="14" y="115" fontFamily={F} fontSize="7.5" fill={DIM}>Cert: 1970-01-01 → 2048-01-01</text>
              </FloatCard>

              {/* Card 4 — Metadata · bottom-right, below card 3 */}
              <FloatCard x={427} y={300} w={182} h={96} vw={152} vh={80} dur={3.5} phase={0.8} fid="sh4">
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
