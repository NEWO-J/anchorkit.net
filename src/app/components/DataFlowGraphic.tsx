import React from 'react';

// ── Palette ────────────────────────────────────────────────────────────────────
const T1   = 'rgba(255,255,255,0.92)';   // primary text
const T2   = 'rgba(255,255,255,0.44)';   // secondary / muted
const TC   = '#93c5fd';                   // code – sky-300, readable on dark
const CB   = 'rgba(255,255,255,0.11)';   // subtle border
const CYAN = '#00f5ff';
const PURP = '#9945FF';                   // Solana purple
const SOL  = '#14F195';                   // Solana green
const GGRN = '#22c55e';                   // valid green
const REDC = '#f87171';                   // invalid red

// ── Geometry (viewBox 640 × 490) ───────────────────────────────────────────────
const VW = 640, VH = 490, CX = VW / 2;  // 320

// Top cards
const TY = 18, CH = 158, CW = 226, HDR = 30;
const OX  = 18;                           // Offline Proof left edge
const LX  = VW - 18 - CW;                // Local Compute left edge = 396
const OCX = OX + CW / 2;                 // OL center X = 131
const LCX = LX + CW / 2;                 // LC center X = 509
const ORX = OX + CW;                     // OL right edge = 244
const TCY = TY + CH / 2;                 // top card vertical centre = 97
const TBT = TY + CH;                     // top card bottom = 176

// Connector elbow + RPC pill
const ELY = 210;
const RY   = ELY + 16;  const RH = 30;  const RW = 196;  const RX = CX - RW / 2;  // 222

// Public Solana Entry card
const EY = RY + RH + 18;                 // 272
const EH = 140, EW = 230, EX = CX - EW / 2;  // 205
const EB  = EY + EH;                     // 412

// Result pill
const RESY = EB + 16;  const RESH = 48;  const RESW = 264;  const RESX = CX - RESW / 2;  // 188
// VH = RESY(428) + RESH(48) + 14 = 490 ✓

// ── SVG paths ──────────────────────────────────────────────────────────────────
const P_OL_LC  = `M ${ORX} ${TCY} L ${LX} ${TCY}`;
const P_LC_RPC = `M ${LCX} ${TBT} L ${LCX} ${ELY} L ${CX} ${ELY} L ${CX} ${RY}`;
const P_RPC_E  = `M ${CX} ${RY + RH} L ${CX} ${EY}`;
const P_E_RES  = `M ${CX} ${EB} L ${CX} ${RESY}`;

// ── Sub-components ─────────────────────────────────────────────────────────────
function Particle({ path, dur, begin, color, r = 2.8 }: {
  path: string; dur: number; begin: number; color: string; r?: number;
}) {
  return (
    <circle r={r} fill={color} filter="url(#p-glow)" opacity={0.95}>
      <animateMotion
        dur={`${dur}s`} begin={`${begin}s`}
        repeatCount="indefinite" path={path} calcMode="linear"
      />
    </circle>
  );
}

function Stream({ path, dur }: { path: string; dur: number }) {
  return (
    <>
      <Particle path={path} dur={dur} begin={0}             color={CYAN} r={3} />
      <Particle path={path} dur={dur} begin={dur / 3}       color="#ffffff" r={2.4} />
      <Particle path={path} dur={dur} begin={(dur * 2) / 3} color={PURP} r={2.8} />
    </>
  );
}

function Connector({ d, dashed }: { d: string; dashed?: boolean }) {
  return (
    <path d={d} fill="none" stroke={CB} strokeWidth={1.5}
      strokeLinecap="round" strokeDasharray={dashed ? '5 4' : undefined} />
  );
}

function ArrowDown({ x, y }: { x: number; y: number }) {
  return (
    <polygon
      points={`${x},${y} ${x - 5.5},${y - 10} ${x + 5.5},${y - 10}`}
      fill={CB} filter="url(#a-glow)"
    />
  );
}

// ── Main export ────────────────────────────────────────────────────────────────
export default function DataFlowGraphic() {
  // Merkle tree nodes (Local Compute card) – absolute coords
  const tRoot = { x: LCX,       y: TY + 68 };
  const tL1   = [{ x: LCX - 44, y: TY + 91 }, { x: LCX + 44, y: TY + 91 }];
  const tL2   = [
    { x: LCX - 66, y: TY + 114 }, { x: LCX - 22, y: TY + 114 },
    { x: LCX + 22, y: TY + 114 }, { x: LCX + 66, y: TY + 114 },
  ];

  // Entry card data rows
  const entryRows: [string, string][] = [
    ['root: "0x3ae8fb60…d55"', TC],
    ['date:  2025-11-12',      T2],
    ['block: 3b8f…d1',         TC],
    ['slot:  1760951629',       T2],
    ['posted: 1760951600',      T2],
  ];

  // Offline Proof code rows
  const codeRows: [string, string][] = [
    ['merkle_proof.txt',         T2],
    ['root: "0x4f8d3c…e7a"',    TC],
    ['leaf: "0xb2c1d…f4"',      TC],
    ['index: 142',               TC],
    ['siblings: ["0x91a…"]',    TC],
    ['signed_by: "3HnV…"',      T2],
  ];

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto max-w-[640px]"
      role="img"
      aria-label="Offline proof verification data flow"
    >
      {/* ── Shared definitions ──────────────────────────────────────────────── */}
      <defs>
        {/* Particle glow */}
        <filter id="p-glow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>

        {/* Arrow/accent glow */}
        <filter id="a-glow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>

        {/* Standard card gradient (top-to-bottom) */}
        <linearGradient id="card-g" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.08)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
        </linearGradient>

        {/* Solana entry card gradient */}
        <linearGradient id="sol-g" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="rgba(153,69,255,0.18)" />
          <stop offset="100%" stopColor="rgba(20,241,149,0.06)" />
        </linearGradient>

        {/* Solana entry card glow border */}
        <linearGradient id="sol-bdr" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor={PURP} stopOpacity="0.55" />
          <stop offset="100%" stopColor={SOL}  stopOpacity="0.30" />
        </linearGradient>

        {/* Horizontal holo gradient for OL→LC connector */}
        <linearGradient id="holo-h" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={CYAN}    stopOpacity="0.50" />
          <stop offset="50%"  stopColor="#ffffff"  stopOpacity="0.65" />
          <stop offset="100%" stopColor={PURP}    stopOpacity="0.50" />
        </linearGradient>

        {/* RPC pill gradient */}
        <linearGradient id="rpc-g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="rgba(153,69,255,0.22)" />
          <stop offset="100%" stopColor="rgba(0,245,255,0.10)" />
        </linearGradient>

        {/* Result pill gradient */}
        <linearGradient id="res-g" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="rgba(34,197,94,0.14)" />
          <stop offset="100%" stopColor="rgba(34,197,94,0.05)" />
        </linearGradient>
      </defs>

      {/* ════════════════════════════════════════════════════════════════════
           CARD 1 — Offline Proof
      ════════════════════════════════════════════════════════════════════ */}

      {/* Card body */}
      <rect x={OX} y={TY} width={CW} height={CH} rx={10}
        fill="url(#card-g)" stroke={CB} strokeWidth={1} />

      {/* Cyan top accent line */}
      <rect x={OX + 1} y={TY + 1} width={CW - 2} height={2.5} rx={1.25}
        fill={CYAN} opacity={0.45} />

      {/* macOS traffic-light dots */}
      <circle cx={OX + 13} cy={TY + 15} r={4}   fill="#ff5f57" />
      <circle cx={OX + 25} cy={TY + 15} r={4}   fill="#febc2e" />
      <circle cx={OX + 37} cy={TY + 15} r={4}   fill="#28c840" />

      {/* Card title – positioned in the space to the right of the dots */}
      <text
        x={OX + 140} y={TY + 15}
        textAnchor="middle" dominantBaseline="middle"
        fill={T1} fontSize={10} fontWeight={700}
        fontFamily="'DM Sans', sans-serif" letterSpacing="0.3"
      >
        Offline Proof
      </text>

      {/* Header separator */}
      <line x1={OX} y1={TY + HDR} x2={OX + CW} y2={TY + HDR}
        stroke={CB} strokeWidth={0.8} />

      {/* Code rows  – generous 13.5 px line height, starts well below separator */}
      {codeRows.map(([t, c], i) => (
        <text key={i}
          x={OX + 12} y={TY + HDR + 14 + i * 13.5}
          fill={c} fontSize={8.5} fontFamily="'DM Mono', monospace"
        >
          {t}
        </text>
      ))}

      {/* Bottom pill badge */}
      <rect x={OX + 12} y={TY + CH - 21} width={84} height={15} rx={7.5}
        fill="rgba(0,245,255,0.07)" stroke="rgba(0,245,255,0.28)" strokeWidth={0.8} />
      <text
        x={OX + 54} y={TY + CH - 13.5}
        textAnchor="middle" dominantBaseline="middle"
        fill={CYAN} fontSize={7.5} fontWeight={600}
        fontFamily="'DM Mono', monospace" opacity={0.85}
      >
        Merkle_Proof
      </text>

      {/* ════════════════════════════════════════════════════════════════════
           CARD 2 — Local Compute
      ════════════════════════════════════════════════════════════════════ */}

      <rect x={LX} y={TY} width={CW} height={CH} rx={10}
        fill="url(#card-g)" stroke={CB} strokeWidth={1} />

      {/* Purple top accent line */}
      <rect x={LX + 1} y={TY + 1} width={CW - 2} height={2.5} rx={1.25}
        fill={PURP} opacity={0.45} />

      {/* Traffic-light dots */}
      <circle cx={LX + 13} cy={TY + 15} r={4}   fill="#ff5f57" />
      <circle cx={LX + 25} cy={TY + 15} r={4}   fill="#febc2e" />
      <circle cx={LX + 37} cy={TY + 15} r={4}   fill="#28c840" />

      {/* Card title */}
      <text
        x={LX + 140} y={TY + 15}
        textAnchor="middle" dominantBaseline="middle"
        fill={T1} fontSize={10} fontWeight={700}
        fontFamily="'DM Sans', sans-serif" letterSpacing="0.3"
      >
        Local Compute
      </text>

      {/* Header separator */}
      <line x1={LX} y1={TY + HDR} x2={LX + CW} y2={TY + HDR}
        stroke={CB} strokeWidth={0.8} />

      {/* Subtitle */}
      <text
        x={LCX} y={TY + HDR + 13}
        textAnchor="middle" fill={T2} fontSize={8.5}
        fontFamily="'DM Sans', sans-serif"
      >
        reconstruct full merkle tree
      </text>

      {/* ── Mini Merkle Tree visualisation ── */}
      {/* Level 0 → Level 1 edges */}
      {tL1.map((n, i) => (
        <line key={i}
          x1={tRoot.x} y1={tRoot.y}
          x2={n.x} y2={n.y}
          stroke="rgba(255,255,255,0.14)" strokeWidth={1}
        />
      ))}
      {/* Level 1 → Level 2 edges */}
      {tL1.map((p, pi) =>
        tL2.slice(pi * 2, pi * 2 + 2).map((n, ni) => (
          <line key={`${pi}-${ni}`}
            x1={p.x} y1={p.y} x2={n.x} y2={n.y}
            stroke="rgba(255,255,255,0.10)" strokeWidth={1}
          />
        ))
      )}
      {/* Root node – glowing cyan */}
      <circle cx={tRoot.x} cy={tRoot.y} r={5.5}
        fill={CYAN} opacity={0.82} filter="url(#p-glow)" />
      {/* Level 1 nodes */}
      {tL1.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r={4.5}
          fill="rgba(255,255,255,0.38)" />
      ))}
      {/* Level 2 nodes */}
      {tL2.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r={3.5}
          fill="rgba(255,255,255,0.22)" />
      ))}

      {/* Bottom badge */}
      <rect x={LX + 12} y={TY + CH - 21} width={84} height={15} rx={7.5}
        fill="rgba(153,69,255,0.08)" stroke="rgba(153,69,255,0.28)" strokeWidth={0.8} />
      <text
        x={LX + 54} y={TY + CH - 13.5}
        textAnchor="middle" dominantBaseline="middle"
        fill={PURP} fontSize={7.5} fontWeight={600}
        fontFamily="'DM Mono', monospace" opacity={0.88}
      >
        Merkle_Proof
      </text>

      {/* ════════════════════════════════════════════════════════════════════
           CONNECTOR OL → LC  (horizontal dashed with holo overlay + arrow)
      ════════════════════════════════════════════════════════════════════ */}

      {/* Base dashed line */}
      <Connector d={P_OL_LC} dashed />
      {/* Holo colour wash */}
      <path d={P_OL_LC} fill="none" stroke="url(#holo-h)"
        strokeWidth={1.5} strokeLinecap="round"
        strokeDasharray="5 4" opacity={0.72} />
      {/* Arrowhead pointing right */}
      <polygon
        points={`${LX},${TCY} ${LX - 10},${TCY - 5.5} ${LX - 10},${TCY + 5.5}`}
        fill={CB} filter="url(#a-glow)"
      />
      <Stream path={P_OL_LC} dur={1.4} />

      {/* ════════════════════════════════════════════════════════════════════
           CONNECTOR LC → RPC  (elbow with arrowhead)
      ════════════════════════════════════════════════════════════════════ */}

      <Connector d={P_LC_RPC} />
      <ArrowDown x={CX} y={RY} />
      <Stream path={P_LC_RPC} dur={1.6} />

      {/* ════════════════════════════════════════════════════════════════════
           SOLANA RPC CALL pill
      ════════════════════════════════════════════════════════════════════ */}

      <rect x={RX} y={RY} width={RW} height={RH} rx={RH / 2}
        fill="url(#rpc-g)" stroke="rgba(153,69,255,0.32)" strokeWidth={1} />
      {/* Pulsing dot indicator */}
      <circle cx={RX + 18} cy={RY + RH / 2} r={3.5} fill={PURP} opacity={0.85}>
        <animate attributeName="opacity" values="0.85;0.35;0.85" dur="1.8s" repeatCount="indefinite" />
      </circle>
      <text
        x={CX + 8} y={RY + RH / 2}
        textAnchor="middle" dominantBaseline="middle"
        fill={T1} fontSize={10.5} fontWeight={650}
        fontFamily="'DM Sans', sans-serif" letterSpacing="0.2"
      >
        Solana RPC Call
      </text>

      {/* ════════════════════════════════════════════════════════════════════
           CONNECTOR RPC → ENTRY
      ════════════════════════════════════════════════════════════════════ */}

      <Connector d={P_RPC_E} />
      <ArrowDown x={CX} y={EY} />
      <Stream path={P_RPC_E} dur={0.9} />

      {/* ════════════════════════════════════════════════════════════════════
           PUBLIC SOLANA ENTRY card  (featured — most important element)
      ════════════════════════════════════════════════════════════════════ */}

      {/* Outer glow border */}
      <rect x={EX - 1} y={EY - 1} width={EW + 2} height={EH + 2} rx={11}
        fill="none" stroke="url(#sol-bdr)" strokeWidth={1.8} opacity={0.65} />

      {/* Card body */}
      <rect x={EX} y={EY} width={EW} height={EH} rx={10}
        fill="url(#sol-g)" stroke={CB} strokeWidth={0.8} />

      {/* Gradient top accent */}
      <rect x={EX + 1} y={EY + 1} width={EW - 2} height={2.5} rx={1.25}
        fill="url(#sol-bdr)" opacity={0.65} />

      {/* Card title */}
      <text
        x={CX} y={EY + 16}
        textAnchor="middle" dominantBaseline="middle"
        fill={T1} fontSize={11.5} fontWeight={700}
        fontFamily="'DM Sans', sans-serif" letterSpacing="0.3"
      >
        Public Solana Entry
      </text>

      {/* Live pulse ring (top-right) */}
      <circle cx={EX + EW - 18} cy={EY + 16} r={5}
        fill="none" stroke={SOL} strokeWidth={1.5} opacity={0.9}>
        <animate attributeName="r"       values="4;9;4"    dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.9;0;0.9" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* Header separator */}
      <line x1={EX} y1={EY + 28} x2={EX + EW} y2={EY + 28}
        stroke={CB} strokeWidth={0.8} />

      {/* Entry tag badge */}
      <rect x={EX + 12} y={EY + 34} width={84} height={15} rx={7.5}
        fill="rgba(153,69,255,0.10)" stroke="rgba(153,69,255,0.32)" strokeWidth={0.8} />
      <text
        x={EX + 54} y={EY + 41.5}
        textAnchor="middle" dominantBaseline="middle"
        fill={PURP} fontSize={7.5} fontWeight={600}
        fontFamily="'DM Mono', monospace" opacity={0.92}
      >
        Merkle_Proof
      </text>

      {/* Data rows */}
      {entryRows.map(([t, c], i) => (
        <text key={i}
          x={EX + 14} y={EY + 57 + i * 14}
          fill={c} fontSize={8.5} fontFamily="'DM Mono', monospace"
        >
          {t}
        </text>
      ))}

      {/* ════════════════════════════════════════════════════════════════════
           CONNECTOR ENTRY → RESULT
      ════════════════════════════════════════════════════════════════════ */}

      <Connector d={P_E_RES} />
      <ArrowDown x={CX} y={RESY} />
      <Stream path={P_E_RES} dur={0.8} />

      {/* ════════════════════════════════════════════════════════════════════
           RESULT pill
      ════════════════════════════════════════════════════════════════════ */}

      <rect x={RESX} y={RESY} width={RESW} height={RESH} rx={RESH / 2}
        fill="url(#res-g)" stroke="rgba(34,197,94,0.28)" strokeWidth={1} />

      {/* Pulsing green wash */}
      <rect x={RESX} y={RESY} width={RESW} height={RESH} rx={RESH / 2}
        fill={GGRN} opacity={0.07}>
        <animate attributeName="opacity" values="0.07;0.16;0.07" dur="2.2s" repeatCount="indefinite" />
      </rect>

      {/* Valid row */}
      <text
        x={CX} y={RESY + 17}
        textAnchor="middle" dominantBaseline="middle"
        fill={T1} fontSize={10.5} fontWeight={600}
        fontFamily="'DM Sans', sans-serif"
      >
        Roots Match{' '}
        <tspan fill={GGRN} fontWeight={700}>&#x2713; Valid</tspan>
      </text>

      {/* Invalid row */}
      <text
        x={CX} y={RESY + 34}
        textAnchor="middle" dominantBaseline="middle"
        fill={T2} fontSize={9.5}
        fontFamily="'DM Sans', sans-serif"
      >
        Otherwise{' '}
        <tspan fill={REDC}>&#x2717; Invalid</tspan>
      </text>
    </svg>
  );
}
