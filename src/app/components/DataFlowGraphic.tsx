import React, { useEffect, useRef, useState } from 'react';

// ══ Geometry ════════════════════════════════════════════════════════════════════
const VW   = 1060;
const VH   = 830;
const CX   = VW / 2; // 530

// Top boxes  (×1.2 vs previous)
const BW   = 418;
const BH   = 276;
const TY   = 20;
const OX   = 18;
const LX   = VW - OX - BW;     // 624
const LCX  = LX + BW / 2;      // 833
const TB   = TY + BH;          // 296
const TCY  = TY + BH / 2;      // 158

// RPC pill  (×1.2 vs previous)
const RPC_W = 252;
const RPC_H = 46;
const RPC_X = CX - RPC_W / 2;  // 404
const RPC_Y = 340;
const RPC_B = RPC_Y + RPC_H;   // 386

// Bottom boxes  (×1.2 vs previous; VW widened to 1060 to keep them fitting)
const BBW   = 322;
const BBH   = 185;
const BBG   = 18;
const BBY   = 436;
const B_TOT = 3 * BBW + 2 * BBG; // 1002
const B_SX  = (VW - B_TOT) / 2;  // 29
const B1X   = B_SX;              // 29
const B2X   = B1X + BBW + BBG;   // 369
const B3X   = B2X + BBW + BBG;   // 709
const B1CX  = B1X + BBW / 2;     // 190
const B2CX  = B2X + BBW / 2;     // 530
const B3CX  = B3X + BBW / 2;     // 870
const BBB   = BBY + BBH;          // 621

// H-bar & result  (HY/RES_Y spaced for consistent dot speed)
const HY    = 700;
const RES_W = 348;
const RES_H = 70;
const RES_X = CX - RES_W / 2;   // 356
const RES_Y = 740;

// ══ Palette ═════════════════════════════════════════════════════════════════════
const S      = '#382e8c';
const SD     = 'rgba(255,255,255,0.32)';
const T1     = 'rgba(255,255,255,0.90)';
const T2     = 'rgba(255,255,255,0.50)';
const TMONO  = 'rgba(255,255,255,0.75)';
const F_SAN  = "'DM Sans','Inter',sans-serif";
const F_MON  = "'DM Mono','Fira Mono',monospace";

// ══ Animation steps ══════════════════════════════════════════════════════════════
//  0 – Offline Proof box      (source, no incoming arrow)
//  1 – edge OL → LC
//  2 – Local Compute box      (arrow arrives from OL)
//  3 – edge LC → RPC
//  4 – RPC pill               (arrow arrives from LC)
//  5 – edge RPC → entries
//  6 – Public Solana Entry boxes + H connectors  (arrow arrives from RPC)
//  7 – collector edges (D1/D2/D3 + hbar)
//  8 – result edge
//  9 – Result pill            (arrow arrives)

function stepEnd(i: number) { return i * 0.09 + 0.16; }

function stepP(i: number, progress: number, startAt?: number): number {
  const start = startAt ?? i * 0.09;
  const end   = start + 0.16;
  return Math.max(0, Math.min(1, (progress - start) / (end - start)));
}

const DASH = 2000;

// ══ Orange tip helpers ════════════════════════════════════════════════════════════
// Returns opacity for the moving tip: fades in fast, holds, fades out near p=1
function tipAlpha(p: number): number {
  if (p <= 0) return 0;
  const fadeIn  = Math.min(p / 0.12, 1);
  const fadeOut = p > 0.78 ? Math.max(0, 1 - (p - 0.78) / 0.22) : 1;
  return fadeIn * fadeOut;
}

// Total arc-length of a polyline
function polyLen(pts: [number, number][]): number {
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i][0] - pts[i - 1][0];
    const dy = pts[i][1] - pts[i - 1][1];
    total += Math.sqrt(dx * dx + dy * dy);
  }
  return total;
}

// Interpolate position along a polyline at t ∈ [0,1] by arc-length
function lerpPoly(pts: [number, number][], t: number): [number, number] {
  let total = 0;
  const lens: number[] = [];
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i][0] - pts[i - 1][0];
    const dy = pts[i][1] - pts[i - 1][1];
    const l  = Math.sqrt(dx * dx + dy * dy);
    lens.push(l);
    total += l;
  }
  const target = t * total;
  let acc = 0;
  for (let i = 0; i < lens.length; i++) {
    if (acc + lens[i] >= target) {
      const s = lens[i] === 0 ? 0 : (target - acc) / lens[i];
      return [
        pts[i][0] + s * (pts[i + 1][0] - pts[i][0]),
        pts[i][1] + s * (pts[i + 1][1] - pts[i][1]),
      ];
    }
    acc += lens[i];
  }
  return pts[pts.length - 1];
}

// ══ Edge ═════════════════════════════════════════════════════════════════════════
function Arrowhead({
  x, y, dir = 'down', opacity,
}: {
  x: number; y: number; dir?: 'down' | 'right'; opacity: number;
}) {
  const pts =
    dir === 'down'
      ? `${x},${y} ${x - 5},${y - 9} ${x + 5},${y - 9}`
      : `${x},${y} ${x - 9},${y - 5} ${x - 9},${y + 5}`;
  return <polygon points={pts} fill={SD} style={{ opacity }} />;
}

function Edge({
  d, pts, step, progress, arrow, ax, ay, adir = 'down', startAt, endAt, skipFade,
}: {
  d: string;
  pts?: [number, number][];
  step: number;
  progress: number;
  arrow?: boolean;
  ax?: number;
  ay?: number;
  adir?: 'down' | 'right';
  startAt?: number;
  endAt?: number;
  skipFade?: boolean;
}) {
  const _s       = startAt ?? step * 0.09;
  const _e       = endAt   ?? (_s + 0.16);
  const p        = Math.max(0, Math.min(1, (progress - _s) / (_e - _s)));
  const ta       = tipAlpha(p);
  const dash     = pts ? polyLen(pts) : DASH;
  const trailLen = dash * 0.22;
  const [tx, ty] = pts && ta > 0 ? lerpPoly(pts, p) : [ax ?? 0, ay ?? 0];
  // Fast grow-in: full opacity by ~25% of the animation, easeOutQuart curve
  // skipFade: continuation edges (visually connected to a prior edge) skip the fade
  const fadeP    = Math.min(1, p / 0.25);
  const entryOp  = skipFade ? 1 : 1 - Math.pow(1 - fadeP, 4);

  return (
    <g style={{ opacity: entryOp }}>
      <path
        d={d}
        fill="none"
        stroke={SD}
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ strokeDasharray: dash, strokeDashoffset: dash * (1 - p) }}
      />
      {/* Glowing trail behind the dot */}
      {pts && ta > 0 && (
        <path
          d={d}
          fill="none"
          stroke="#2596be"
          strokeWidth={2}
          strokeLinecap="round"
          filter="url(#og)"
          style={{
            strokeDasharray: `${trailLen} 99999`,
            strokeDashoffset: trailLen - p * dash,
            opacity: ta * 0.85,
          }}
        />
      )}
      {arrow && ax !== undefined && ay !== undefined && p >= 1 && (
        <Arrowhead x={ax} y={ay} dir={adir} opacity={1} />
      )}
      {/* Glowing dot at tip */}
      {pts && ta > 0 && (
        <circle
          cx={tx} cy={ty} r={4}
          fill="#2596be"
          filter="url(#og)"
          style={{ opacity: ta }}
        />
      )}
    </g>
  );
}

// ══ Grow helper — scale from center of fill-box ═══════════════════════════════════
function easeOutBack(t: number): number {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

// Fast-start, smooth-landing easing for the Solana node carousel
function easeOutExpo(t: number): number {
  return 1 - Math.pow(1 - t, 4); // easeOutQuart — gradual deceleration to rest
}

// ══ Solana logo — official 3-bar mark (viewBox 397.7×311.7), scaled to fit ═══
function SolanaLogo({ x, y, size = 22 }: { x: number; y: number; size?: number }) {
  const s = size / 397.7;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* Top bar */}
      <path fill="url(#solGrad)"
        d="M64.6,3.8C67.1,1.4,70.4,0,73.8,0h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7
           c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,3.8z" />
      {/* Middle bar (reversed slant) */}
      <path fill="url(#solGrad)"
        d="M333.1,120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8,0-8.7,7-4.6,11.1l62.7,62.7
           c2.4,2.4,5.7,3.8,9.2,3.8h317.4c5.8,0,8.7-7,4.6-11.1L333.1,120.1z" />
      {/* Bottom bar */}
      <path fill="url(#solGrad)"
        d="M64.6,237.9c2.4-2.4,5.7-3.8,9.2-3.8h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7
           c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,237.9z" />
    </g>
  );
}

function growStyle(p: number): React.CSSProperties {
  const ep    = easeOutBack(p);
  const scale = 0.45 + ep * 0.55;
  return {
    opacity: Math.min(1, p * 2.5),
    transform: `scale(${scale})`,
    transformBox: 'fill-box' as React.CSSProperties['transformBox'],
    transformOrigin: 'center',
  };
}

// ══ Pill ══════════════════════════════════════════════════════════════════════════
function Pill({
  x, y, w, h, step, progress, startAt, endAt, flashOp = 0, children,
}: {
  x: number; y: number; w: number; h: number; step: number; progress: number;
  startAt?: number; endAt?: number; flashOp?: number; children?: React.ReactNode;
}) {
  const _s     = startAt ?? step * 0.09;
  const _e     = endAt   ?? (_s + 0.16);
  const p      = Math.max(0, Math.min(1, (progress - _s) / (_e - _s)));
  const popIn  = Math.max(0, 1 - p * 1.2);
  return (
    <g style={growStyle(p)}>
      <rect x={x} y={y} width={w} height={h} rx={h / 2} fill="#1a1542" />
      {children}
      {popIn > 0 && (
        <rect x={x} y={y} width={w} height={h} rx={h / 2}
          fill="#2596be" style={{ opacity: popIn * 0.22 }} />
      )}
      {flashOp > 0 && (
        <rect x={x} y={y} width={w} height={h} rx={h / 2}
          fill="#2596be" style={{ opacity: flashOp * 0.22 }} />
      )}
    </g>
  );
}

// ══ Box ═══════════════════════════════════════════════════════════════════════════
const HDR = 52;

function Box({
  x, y, w, h, step, progress, startAt, flashOp = 0, title, subtitle, children, customStyle, solanaTitle,
}: {
  x: number; y: number; w: number; h: number; step: number; progress: number;
  startAt?: number; flashOp?: number; title?: string; subtitle?: string; children?: React.ReactNode;
  customStyle?: React.CSSProperties; solanaTitle?: boolean;
}) {
  const p     = stepP(step, progress, startAt);
  // Suppress popIn glow when a custom slide style is active
  const popIn = customStyle ? 0 : Math.max(0, 1 - p * 1.2);
  return (
    <g style={customStyle ?? growStyle(p)}>
      <rect x={x} y={y} width={w} height={h} rx={8} fill="#1a1542" />
      {title && (
        <>
          {solanaTitle ? (
            <>
              <text
                x={x + w / 2 - 18} y={y + HDR / 2}
                textAnchor="middle" dominantBaseline="middle"
                fill={T1} fontSize={22} fontWeight={600}
                fontFamily={F_SAN} letterSpacing="0.3"
              >{title}</text>
              <SolanaLogo x={x + w / 2 + 100} y={y + HDR / 2 - 9} />
            </>
          ) : (
            <text
              x={x + w / 2} y={y + HDR / 2}
              textAnchor="middle" dominantBaseline="middle"
              fill={T1} fontSize={29} fontWeight={600}
              fontFamily={F_SAN} letterSpacing="0.3"
            >{title}</text>
          )}
          <line
            x1={x + 1} y1={y + HDR} x2={x + w - 1} y2={y + HDR}
            stroke="rgba(255,255,255,0.12)" strokeWidth={0.75}
          />
        </>
      )}
      {subtitle && (
        <text
          x={x + w / 2} y={y + HDR + 16}
          textAnchor="middle" dominantBaseline="middle"
          fill={T2} fontSize={13} fontFamily={F_SAN}
        >{subtitle}</text>
      )}
      {children}
      {popIn > 0 && (
        <rect x={x} y={y} width={w} height={h} rx={8}
          fill="#2596be" style={{ opacity: popIn * 0.22 }} />
      )}
      {flashOp > 0 && (
        <rect x={x} y={y} width={w} height={h} rx={8}
          fill="#2596be" style={{ opacity: flashOp * 0.22 }} />
      )}
    </g>
  );
}

// ══ Entry card content ════════════════════════════════════════════════════════════
function EntryContent({
  bx, by, root, date, postedAt,
}: {
  bx: number; by: number; root: string; date: string; postedAt: number;
}) {
  const y0 = by + HDR + 16;
  const LH = 16;
  const [r1, r2] = root.split(' ');
  const rowOffset = r2 ? 3.3 : 2.3;

  return (
    <>
      <text x={bx + 10} y={y0}
        fill={T2} fontSize={14} fontFamily={F_MON} dominantBaseline="middle"
      >Merkle_Root</text>
      <text x={bx + 10} y={y0 + LH}
        fill={TMONO} fontSize={13} fontFamily={F_MON} dominantBaseline="middle"
      >&quot;{r1}</text>
      {r2 && (
        <text x={bx + 10} y={y0 + LH * 2}
          fill={TMONO} fontSize={13} fontFamily={F_MON} dominantBaseline="middle"
        >{r2}&quot;</text>
      )}
      <text x={bx + 10} y={y0 + LH * rowOffset}
        fill={T2} fontSize={14} fontFamily={F_MON} dominantBaseline="middle"
      >date: &quot;{date}&quot;</text>
      <text x={bx + 10} y={y0 + LH * (rowOffset + 1)}
        fill={T2} fontSize={14} fontFamily={F_MON} dominantBaseline="middle"
      >posted_at: {postedAt}</text>
    </>
  );
}


// ══ Main export ═══════════════════════════════════════════════════════════════════
export default function DataFlowGraphic() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [progress, setProgress] = useState(0);
  const [flashOp, setFlashOp]   = useState(0);
  const [idleOn,  setIdleOn]    = useState(false);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;

    const ANIM_DURATION  = 4800; // ms for 0→1 progress
    const FLASH_DURATION =  900; // ms for completion flash

    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();

      // Time-based progress animation
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / ANIM_DURATION);
        setProgress(p);
        if (p < 1) {
          requestAnimationFrame(tick);
        } else {
          // Completion flash once animation finishes
          setIdleOn(true);
          const f0 = performance.now();
          const flash = (now2: number) => {
            const t = Math.min(1, (now2 - f0) / FLASH_DURATION);
            const f = Math.pow(1 - t, 2);
            setFlashOp(f);
            if (f > 0) requestAnimationFrame(flash);
          };
          requestAnimationFrame(flash);
        }
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.25 });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const ELBOW_Y = Math.round((TB + RPC_Y) / 2); // 260

  // ── Step 6: Solana node carousel slide-in ──────────────────────────────────
  // Wider window: progress 0.54 → 0.84 gives 0.30 * 4800ms = 1440ms for the carousel
  const p6raw    = Math.max(0, Math.min(1, (progress - 0.47) / 0.20));
  const p6pos    = easeOutExpo(p6raw);
  const SLIDE    = 1300; // px to travel from right (larger = more dramatic entry)
  const slideX   = SLIDE * (1 - p6pos);
  // Slight motion blur — speed is derivative of easeOutQuart: 4*(1-t)^3
  const spd6  = p6raw > 0 && p6raw < 1 ? 4 * Math.pow(1 - p6raw, 3) : 0;
  const blur6 = Math.min(2, spd6 * 1.2); // subtle horizontal motion blur, max 2px
  // Side nodes (B1, B3) + ghost cards: ease-in fade so they hold opaque then sweep away
  const rawFade  = p6raw > 0.72 ? Math.min(1, (p6raw - 0.72) / 0.28) : 0;
  const sideFade    = 1 - (rawFade * rawFade * rawFade); // easeInCubic — ghost cards fade to 0
  const sideBoxFade = 1 - (rawFade * rawFade * rawFade) * 0.7; // B1/B3 settle at 0.3 opacity
  const opIn        = Math.min(1, p6raw * 8); // fast fade-in of the whole unified group
  // Group-level grow: spans the full slide duration so it's visibly small on entry
  const carouselScale = 0.15 + easeOutBack(p6raw) * 0.85;
  // Box styles inside the unified group — group owns the transform; boxes only set opacity
  const boxStyleB2:   React.CSSProperties = { opacity: 1 };
  const boxStyleSide: React.CSSProperties = { opacity: sideBoxFade };

  // Edge path strings
  const P_OL_LC  = `M ${OX + BW} ${TCY} L ${LX} ${TCY}`;
  const P_LC_RPC = `M ${LCX} ${TB} L ${LCX} ${ELBOW_Y} L ${CX} ${ELBOW_Y} L ${CX} ${RPC_Y}`;
  const P_RPC_MD = `M ${CX} ${RPC_B} L ${CX} ${BBY}`;
  const P_H1     = `M ${B1X + BBW} ${BBY + BBH / 2} L ${B2X} ${BBY + BBH / 2}`;
  const P_H2     = `M ${B2X + BBW} ${BBY + BBH / 2} L ${B3X} ${BBY + BBH / 2}`;
  const P_D1     = `M ${B1CX} ${BBB} L ${B1CX} ${HY}`;
  const P_D2     = `M ${B2CX} ${BBB} L ${B2CX} ${HY}`;
  const P_D3     = `M ${B3CX} ${BBB} L ${B3CX} ${HY}`;
  const P_HBAR   = `M ${B1CX} ${HY} L ${B3CX} ${HY}`;
  const P_RES    = `M ${CX} ${HY} L ${CX} ${RES_Y}`;

  // Polyline points for orange glow tip on arrow edges
  const PTS_OL_LC:  [number, number][] = [[OX + BW, TCY], [LX, TCY]];
  const PTS_LC_RPC: [number, number][] = [[LCX, TB], [LCX, ELBOW_Y], [CX, ELBOW_Y], [CX, RPC_Y]];
  const PTS_RPC_MD: [number, number][] = [[CX, RPC_B], [CX, BBY]];
  const PTS_D2:     [number, number][] = [[B2CX, BBB], [B2CX, HY]];
  const PTS_RES:    [number, number][] = [[CX, HY], [CX, RES_Y]];

  const MR_LC  = '3a4b5c6d7e8f90a1b2c3d4e5f6071829 30313233...3e3f';
  const [mr1, mr2] = MR_LC.split(' ');

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VW} ${VH}`}
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto max-w-[640px] -mt-[30px] lg:-mt-[100px]"
      role="img"
      aria-label="Photo provenance verification flow"
    >
      <defs>
        {/* Glow filter — userSpaceOnUse so zero-height horizontal paths aren't clipped */}
        <filter id="og" filterUnits="userSpaceOnUse" x="-20" y="-20" width={VW + 40} height={VH + 40}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Horizontal-only motion blur — stdDeviation="X 0" blurs only on X axis */}
        {blur6 > 0.1 && (
          <filter id="mblur" x="-5%" y="0%" width="110%" height="100%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={`${blur6.toFixed(2)} 0`} />
          </filter>
        )}
        <linearGradient id="solGrad" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#9945FF" />
          <stop offset="100%" stopColor="#14F195" />
        </linearGradient>
        <style>{`
          @keyframes dfg-dash {
            from { stroke-dashoffset: 74; }
            to   { stroke-dashoffset:  0; }
          }
          @keyframes dfg-fadein {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
        `}</style>
      </defs>

      {/* step 0 ── Offline Proof (source node) */}
      <Box x={OX} y={TY} w={BW} h={BH} title="Offline Proof" step={0} progress={progress} flashOp={flashOp} idleOn={idleOn}>
        {(() => {
          const cx = OX + BW / 2;                       // 227
          const cy = TY + BH / 2;                        // 158 — centred on full box
          const dw = 86, dh = 113, fold = 25;
          const dx = cx - dw / 2, dy = cy - dh / 2;
          return (
            <g opacity={0.75}>
              <path
                d={`M ${dx},${dy} L ${dx+dw-fold},${dy} L ${dx+dw},${dy+fold} L ${dx+dw},${dy+dh} L ${dx},${dy+dh} Z`}
                fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth={2.5}
              />
              <path
                d={`M ${dx+dw-fold},${dy} L ${dx+dw-fold},${dy+fold} L ${dx+dw},${dy+fold}`}
                fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth={2.5}
              />
              <line x1={dx+13} y1={dy+fold+19} x2={dx+dw-12} y2={dy+fold+19} stroke={T2} strokeWidth={2} strokeLinecap="round" />
              <line x1={dx+13} y1={dy+fold+35} x2={dx+dw-12} y2={dy+fold+35} stroke={T2} strokeWidth={2} strokeLinecap="round" />
              <line x1={dx+13} y1={dy+fold+50} x2={dx+dw-24} y2={dy+fold+50} stroke={T2} strokeWidth={2} strokeLinecap="round" />
              <line x1={dx+13} y1={dy+fold+66} x2={dx+dw-24} y2={dy+fold+66} stroke={T2} strokeWidth={2} strokeLinecap="round" />
            </g>
          );
        })()}
      </Box>

      {/* step 1 ── edge: Offline Proof → Local Compute */}
      <Edge d={P_OL_LC} pts={PTS_OL_LC} step={1} progress={progress}
        arrow ax={LX} ay={TCY} adir="right" startAt={0.09} endAt={0.17} />

      {/* step 2 ── Local Compute (starts growing before arrow arrives) */}
      <Box x={LX} y={TY} w={BW} h={BH}
        title="Local Compute"
        subtitle="convert merkle_proof into full merkle tree."
        step={2} startAt={0.14} progress={progress} flashOp={flashOp}      >
        {/* CPU chip icon — centred between subtitle and merkle section */}
        {(([cx, cy]) => {
          const h = 24, ih = 9, pl = 11;
          const pins = [-12, 0, 12];
          return (
            <g strokeLinecap="round" fill="none">
              <rect x={cx-h} y={cy-h} width={h*2} height={h*2} rx={4}
                stroke="rgba(255,255,255,0.50)" strokeWidth={1.75} />
              <rect x={cx-ih} y={cy-ih} width={ih*2} height={ih*2} rx={2}
                stroke="rgba(255,255,255,0.28)" strokeWidth={1.25} />
              {pins.map(o => <line key={'l'+o} x1={cx-h}    y1={cy+o} x2={cx-h-pl} y2={cy+o}   stroke="rgba(255,255,255,0.36)" strokeWidth={1.5}/>)}
              {pins.map(o => <line key={'r'+o} x1={cx+h}    y1={cy+o} x2={cx+h+pl} y2={cy+o}   stroke="rgba(255,255,255,0.36)" strokeWidth={1.5}/>)}
              {pins.map(o => <line key={'t'+o} x1={cx+o} y1={cy-h}    x2={cx+o} y2={cy-h-pl}   stroke="rgba(255,255,255,0.36)" strokeWidth={1.5}/>)}
              {pins.map(o => <line key={'b'+o} x1={cx+o} y1={cy+h}    x2={cx+o} y2={cy+h+pl}   stroke="rgba(255,255,255,0.36)" strokeWidth={1.5}/>)}
            </g>
          );
        })([LCX, TY + 134])}

        {/* Merkle root — pushed below CPU icon */}
        <rect x={LX + 10} y={TY + 190} width={BW - 20} height={72} rx={5}
          fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={0.75} />
        <text x={LX + 18} y={TY + 206}
          fill={T2} fontSize={14} fontFamily={F_MON} dominantBaseline="middle"
        >Merkle_Root</text>
        <text x={LX + 18} y={TY + 222}
          fill={TMONO} fontSize={13} fontFamily={F_MON} dominantBaseline="middle"
        >&quot;{mr1}</text>
        <text x={LX + 18} y={TY + 238}
          fill={TMONO} fontSize={13} fontFamily={F_MON} dominantBaseline="middle"
        >{mr2}&quot;</text>
      </Box>

      {/* step 3 ── edge: Local Compute → RPC */}
      <Edge d={P_LC_RPC} pts={PTS_LC_RPC} step={3} progress={progress}
        arrow ax={CX} ay={RPC_Y} adir="down" startAt={0.27} endAt={0.35} />

      {/* step 4 ── RPC pill (starts growing before arrow arrives) */}
      <Pill x={RPC_X} y={RPC_Y} w={RPC_W} h={RPC_H} step={4} startAt={0.32} progress={progress} flashOp={flashOp} idleOn={idleOn}>
        <text x={CX} y={RPC_Y + RPC_H / 2}
          textAnchor="middle" dominantBaseline="middle"
          fill={T1} fontSize={23} fontWeight={500} fontFamily={F_SAN}
        >Solana RPC Call</text>
      </Pill>

      {/* step 5 ── edge: RPC → middle entry (fast: 384ms) */}
      <Edge d={P_RPC_MD} pts={PTS_RPC_MD} step={5} progress={progress}
        arrow ax={CX} ay={BBY} adir="down" startAt={0.51} endAt={0.59} />

      {/* step 6 ── Single unified carousel group: ghost cards + B1/B2/B3 translate together.
           Ghost cards sit at negative x (already in viewport at start) and scroll off left
           during the fast phase. B1/B2/B3 enter from the right. One transform = one motion. */}
      {p6raw > 0 && (
        <g style={{
          transform: `scale(${carouselScale})`,
          transformOrigin: `${CX}px ${BBY + BBH / 2}px`,
        }}>
        <g transform={`translate(${slideX} 0)`}
           style={{ opacity: opIn }}
           filter={blur6 > 0.1 ? 'url(#mblur)' : undefined}>

          {/* Ghost pass-by cards — positioned to the left of B1 in group-space so they
              appear on-screen at the start and exit left during the fast phase.
              sideFade ensures they fully disappear before the carousel settles */}
          <g style={{ opacity: sideFade }}>
            {([
              { i: -3, date: '2025-11-08', postedAt: 1762560000, root: '7d1a9b2e5c8f04936b7e2a58d6c3741 41424344...1a0b' },
              { i: -2, date: '2025-11-09', postedAt: 1762646400, root: '92e8c3f64d1b7a5e80c2f31749e8512 56473839...2b1c' },
              { i: -1, date: '2025-11-10', postedAt: 1762732800, root: 'b542d870fd45926ba93b144322ef076 72281b2a...5f4d' },
            ]).map(({ i, date, postedAt, root }) => {
              const bx = B1X + i * (BBW + BBG);
              return (
                <g key={`ghost${i}`}>
                  <rect x={bx} y={BBY} width={BBW} height={BBH} rx={8} fill="#1a1542" />
                  <text x={bx + BBW / 2 - 18} y={BBY + HDR / 2} textAnchor="middle" dominantBaseline="middle"
                    fill={T1} fontSize={22} fontWeight={600} fontFamily={F_SAN} letterSpacing="0.3"
                  >Public Solana Entry</text>
                  <SolanaLogo x={bx + BBW / 2 + 100} y={BBY + HDR / 2 - 9} />
                  <line x1={bx + 1} y1={BBY + HDR} x2={bx + BBW - 1} y2={BBY + HDR}
                    stroke="rgba(255,255,255,0.12)" strokeWidth={0.75} />
                  <EntryContent bx={bx} by={BBY} root={root} date={date} postedAt={postedAt} />
                </g>
              );
            })}
          </g>

          {/* B1 — fades out after landing */}
          <Box x={B1X} y={BBY} w={BBW} h={BBH} title="Public Solana Entry" step={6} startAt={0.59} progress={progress} flashOp={0} customStyle={boxStyleSide} solanaTitle>
            <EntryContent bx={B1X} by={BBY}
              root="c651a781ae56037cb84a255add0f187 e8539a3g...c25e"
              date="2025-11-11" postedAt={1762819200} />
          </Box>

          {/* B2 — the correct node, stays */}
          <Box x={B2X} y={BBY} w={BBW} h={BBH} title="Public Solana Entry" step={6} progress={progress} flashOp={flashOp} customStyle={boxStyleB2} solanaTitle>
            <EntryContent bx={B2X} by={BBY}
              root="3a4b5c6d7e8f90a1b2c3d4e5f6071829 30313233...3e3f"
              date="2025-11-12" postedAt={1762905600} />
          </Box>

          {/* B3 — fades out after landing */}
          <Box x={B3X} y={BBY} w={BBW} h={BBH} title="Public Solana Entry" step={6} startAt={0.59} progress={progress} flashOp={0} customStyle={boxStyleSide} solanaTitle>
            <EntryContent bx={B3X} by={BBY}
              root="a15cf1586830788360a79904157153e c092545fc...f4fe"
              date="2025-11-13" postedAt={1762992000} />
          </Box>

          {/* H connectors between boxes — fade with B1/B3 */}
          <g style={{ opacity: sideFade }}>
            <Edge d={P_H1} step={6} progress={progress} startAt={0.47} endAt={0.61} />
            <Edge d={P_H2} step={6} progress={progress} startAt={0.47} endAt={0.61} />
          </g>
        </g>
        </g>
      )}

      {/* step 7 ── collector: starts after carousel lands (progress 0.67) */}
      <Edge d={P_D2} pts={PTS_D2} step={7} progress={progress} startAt={0.67} endAt={0.715} />

      {/* step 9 ── Result pill (rendered before edge so arrow draws on top) */}
      <Pill x={RES_X} y={RES_Y} w={RES_W} h={RES_H} step={9} progress={progress} flashOp={flashOp} startAt={0.745} endAt={0.94} idleOn={idleOn}>
        <text x={CX} y={RES_Y + RES_H / 2 - 13}
          textAnchor="middle" dominantBaseline="middle"
          fill={T1} fontSize={23} fontWeight={500} fontFamily={F_SAN}
        >
          Roots Match ={' '}
          <tspan fontWeight={700}>Valid</tspan>
        </text>
        <text x={CX} y={RES_Y + RES_H / 2 + 13}
          textAnchor="middle" dominantBaseline="middle"
          fill={T2} fontSize={21} fontFamily={F_SAN}
        >
          Else ={' '}
          <tspan fill="rgba(255,255,255,0.42)">Invalid</tspan>
        </text>
      </Pill>

      {/* step 8 ── result edge (continuation from P_D2 — no fade-in, no gap; rendered after Pill so line stays on top) */}
      <Edge d={P_RES} pts={PTS_RES} step={8} progress={progress}
        arrow ax={CX} ay={RES_Y} adir="down" startAt={0.715} endAt={0.765} skipFade />

      {/* Idle data-flow dashes — appear after the completion flash */}
      {idleOn && (() => {
        const anim = (delay: number): React.CSSProperties => ({
          strokeDasharray: '14 60',
          animation: `dfg-dash 0.5s linear ${delay}s infinite`,
        });
        return (
          <g fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={1.5} strokeLinecap="butt"
            style={{ animation: 'dfg-fadein 900ms ease-out forwards' }}>
            <path d={P_OL_LC}  style={anim(0)}     />
            <path d={P_LC_RPC} style={anim(-0.12)}  />
            <path d={P_RPC_MD} style={anim(-0.05)}  />
            <path d={P_D2}     style={anim(-0.08)}  />
            <path d={P_RES}    style={anim(-0.2)}   />
          </g>
        );
      })()}
    </svg>
  );
}
