import React from 'react';

// ── Palette ───────────────────────────────────────────────────────────────────
const CARD_BG     = 'rgba(255,255,255,0.04)';
const CARD_BORDER = 'rgba(255,255,255,0.13)';
const TEXT        = 'rgba(255,255,255,0.88)';
const TEXT_DIM    = 'rgba(255,255,255,0.42)';
const TEXT_CODE   = 'rgba(255,255,255,0.60)';
const VALID       = '#4ade80';
const INVALID     = '#f87171';

// Holographic stream colours (cycle: cyan → white → magenta)
const H_CYAN = '#00f5ff';
const H_WHITE = '#ffffff';
const H_MAGENTA = '#ee44ff';

// ── Layout constants (viewBox 560 × 420) ─────────────────────────────────────
const VW = 560;
const CX = VW / 2; // 280 — horizontal center

// Top row
const OL_X  = 15,  OL_W  = 205, OL_H  = 128, TOP_Y = 16;
const LC_X  = 340, LC_W  = 205, LC_H  = 128;
const TOP_CY = TOP_Y + OL_H / 2; // vertical centre of top cards = 80

// Derived top-card geometry
const OL_RIGHT  = OL_X + OL_W;   // 220
const LC_LEFT   = LC_X;           // 340
const LC_CX     = LC_X + LC_W / 2; // 442.5
const LC_BOTTOM = TOP_Y + LC_H;   // 144

// Elbow: LC centre-bottom → right-angle down+left → RPC pill top
const ELBOW_Y   = 183; // the horizontal part of the elbow
const RPC_Y     = ELBOW_Y + 16; // 199 — RPC pill top
const RPC_H     = 26;
const RPC_W     = 160;
const RPC_X     = CX - RPC_W / 2; // 200

// Center Solana entry card
const ENTRY_Y   = RPC_Y + RPC_H + 18; // 243
const ENTRY_W   = 188;
const ENTRY_H   = 118;
const ENTRY_X   = CX - ENTRY_W / 2;   // 186

// Result pill
const RES_Y     = ENTRY_Y + ENTRY_H + 18; // 379
const RES_H     = 36;
const RES_W     = 240;
const RES_X     = CX - RES_W / 2;          // 160

const VH = RES_Y + RES_H + 10; // 425

// ── Path strings ──────────────────────────────────────────────────────────────
// Horizontal dotted connector: Offline Proof right → Local Compute left
const PATH_OL_LC     = `M ${OL_RIGHT} ${TOP_CY} L ${LC_LEFT} ${TOP_CY}`;
// Elbow from LC bottom-centre → right-angle → RPC pill top-centre
const PATH_LC_RPC    = `M ${LC_CX} ${LC_BOTTOM} L ${LC_CX} ${ELBOW_Y} L ${CX} ${ELBOW_Y} L ${CX} ${RPC_Y}`;
// RPC pill bottom → entry card top
const PATH_RPC_ENTRY = `M ${CX} ${RPC_Y + RPC_H} L ${CX} ${ENTRY_Y}`;
// Entry card bottom → result pill top
const PATH_ENTRY_RES = `M ${CX} ${ENTRY_Y + ENTRY_H} L ${CX} ${RES_Y}`;

// ── Shared filter id ──────────────────────────────────────────────────────────
const GLOW_ID = 'holo-glow';

// ── HoloParticle: a glowing bead that travels the given path ─────────────────
interface HoloParticleProps {
  path: string;
  dur: number;
  begin: number;
  color: string;
  r?: number;
}
function HoloParticle({ path, dur, begin, color, r = 2.8 }: HoloParticleProps) {
  return (
    <circle r={r} fill={color} filter={`url(#${GLOW_ID})`} opacity={0.95}>
      <animateMotion
        dur={`${dur}s`}
        begin={`${begin}s`}
        repeatCount="indefinite"
        path={path}
        calcMode="linear"
      />
    </circle>
  );
}

// Emits three staggered holographic particles (cyan / white / magenta) on one path
function HoloStream({ path, dur }: { path: string; dur: number }) {
  return (
    <>
      <HoloParticle path={path} dur={dur} begin={0}           color={H_CYAN}    r={3} />
      <HoloParticle path={path} dur={dur} begin={dur / 3}     color={H_WHITE}   r={2.4} />
      <HoloParticle path={path} dur={dur} begin={(dur * 2) / 3} color={H_MAGENTA} r={2.8} />
    </>
  );
}

// ── AnimLine: static dashed/solid connector ───────────────────────────────────
function AnimLine({
  d,
  dashed = false,
}: {
  d: string;
  dashed?: boolean;
}) {
  return (
    <path
      d={d}
      fill="none"
      stroke={CARD_BORDER}
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeDasharray={dashed ? '5 5' : undefined}
    />
  );
}

// ── Arrowhead pointing downward ───────────────────────────────────────────────
function ArrowDown({ cx, cy }: { cx: number; cy: number }) {
  return (
    <polygon
      points={`${cx},${cy} ${cx - 4},${cy - 7} ${cx + 4},${cy - 7}`}
      fill={CARD_BORDER}
    />
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function DataFlowGraphic() {
  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto max-w-[576px]"
      role="img"
      aria-label="Offline proof verification data flow"
    >
      {/* ── Shared defs ──────────────────────────────────────────────────── */}
      <defs>
        {/* Holographic glow filter */}
        <filter id={GLOW_ID} x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Holographic gradient used for the dotted connector line tint */}
        <linearGradient id="holo-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={H_CYAN}    stopOpacity={0.6} />
          <stop offset="50%"  stopColor={H_WHITE}   stopOpacity={0.7} />
          <stop offset="100%" stopColor={H_MAGENTA} stopOpacity={0.6} />
        </linearGradient>
      </defs>

      {/* ── 1. Offline Proof card ─────────────────────────────────────────── */}
      <rect x={OL_X} y={TOP_Y} width={OL_W} height={OL_H} rx={9}
        fill={CARD_BG} stroke={CARD_BORDER} strokeWidth={1.2} />
      {/* Traffic-light dots */}
      <circle cx={OL_X + 14} cy={TOP_Y + 14} r={4} fill="#ff5f57" />
      <circle cx={OL_X + 26} cy={TOP_Y + 14} r={4} fill="#febc2e" />
      <circle cx={OL_X + 38} cy={TOP_Y + 14} r={4} fill="#28c840" />
      <text x={OL_X + OL_W / 2} y={TOP_Y + 15} textAnchor="middle" dominantBaseline="middle"
        fill={TEXT} fontSize={9} fontWeight={700}>
        Offline Proof
      </text>
      <line x1={OL_X} y1={TOP_Y + 26} x2={OL_X + OL_W} y2={TOP_Y + 26}
        stroke={CARD_BORDER} strokeWidth={0.9} />
      {/* Code content */}
      {([
        ['merkle_proof.txt', TEXT_DIM],
        ['root: "0x4f8d3c…e7a"', TEXT_CODE],
        ['leaf_hash: "0xb2c1d…f4"', TEXT_CODE],
        ['index: 142', TEXT_CODE],
        ['siblings: ["0x91a…","0xe4b…"]', TEXT_CODE],
        ['created_at: "2025-11-12"', TEXT_DIM],
        ['anchor_block: 176095…', TEXT_DIM],
        ['signed_by: "3HnV…"', TEXT_DIM],
      ] as [string, string][]).map(([t, c], i) => (
        <text key={i}
          x={OL_X + 10} y={TOP_Y + 38 + i * 11.5}
          fill={c} fontSize={7.5} fontFamily="'DM Mono', monospace">
          {t}
        </text>
      ))}
      {/* Merkle_Proof tag */}
      <rect x={OL_X + 10} y={TOP_Y + OL_H - 20} width={78} height={14} rx={4}
        fill="rgba(255,255,255,0.07)" stroke={CARD_BORDER} strokeWidth={0.8} />
      <text x={OL_X + 49} y={TOP_Y + OL_H - 13} textAnchor="middle"
        fill={TEXT_CODE} fontSize={7} fontWeight={600}>
        Merkle_Proof
      </text>

      {/* ── 2. Local Compute card ─────────────────────────────────────────── */}
      <rect x={LC_X} y={TOP_Y} width={LC_W} height={LC_H} rx={9}
        fill={CARD_BG} stroke={CARD_BORDER} strokeWidth={1.2} />
      <text x={LC_CX} y={TOP_Y + 42} textAnchor="middle"
        fill={TEXT} fontSize={11} fontWeight={700}>
        Local Compute
      </text>
      <text x={LC_CX} y={TOP_Y + 59} textAnchor="middle"
        fill={TEXT_DIM} fontSize={8.5}>
        convert merkle_proof into
      </text>
      <text x={LC_CX} y={TOP_Y + 71} textAnchor="middle"
        fill={TEXT_DIM} fontSize={8.5}>
        full merkle tree.
      </text>
      {/* Merkle_Proof tag */}
      <rect x={LC_CX - 39} y={TOP_Y + LC_H - 26} width={78} height={14} rx={4}
        fill="rgba(255,255,255,0.07)" stroke={CARD_BORDER} strokeWidth={0.8} />
      <text x={LC_CX} y={TOP_Y + LC_H - 19} textAnchor="middle"
        fill={TEXT_CODE} fontSize={7} fontWeight={600}>
        Merkle_Proof
      </text>

      {/* ── 3. Horizontal dotted connector (with holographic tint overlay) ─── */}
      {/* Base dashed line */}
      <AnimLine d={PATH_OL_LC} dashed />
      {/* Holographic colour wash over the dashes */}
      <path
        d={PATH_OL_LC}
        fill="none"
        stroke="url(#holo-grad)"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeDasharray="5 5"
        opacity={0.65}
      />
      {/* Arrowhead pointing right into Local Compute */}
      <polygon
        points={`${LC_LEFT},${TOP_CY} ${LC_LEFT - 8},${TOP_CY - 4} ${LC_LEFT - 8},${TOP_CY + 4}`}
        fill={CARD_BORDER}
      />
      {/* Holographic stream */}
      <HoloStream path={PATH_OL_LC} dur={1.4} />

      {/* ── 4. Elbow: LC → RPC pill ───────────────────────────────────────── */}
      <AnimLine d={PATH_LC_RPC} />
      <ArrowDown cx={CX} cy={RPC_Y} />
      <HoloStream path={PATH_LC_RPC} dur={1.6} />

      {/* ── 5. Solana RPC Call pill ───────────────────────────────────────── */}
      <rect x={RPC_X} y={RPC_Y} width={RPC_W} height={RPC_H} rx={7}
        fill={CARD_BG} stroke={CARD_BORDER} strokeWidth={1.1} />
      <text x={CX} y={RPC_Y + RPC_H / 2 + 1} textAnchor="middle" dominantBaseline="middle"
        fill={TEXT} fontSize={9.5} fontWeight={650}>
        Solana RPC Call
      </text>

      {/* ── 6. RPC → Entry card ───────────────────────────────────────────── */}
      <AnimLine d={PATH_RPC_ENTRY} />
      <ArrowDown cx={CX} cy={ENTRY_Y} />
      <HoloStream path={PATH_RPC_ENTRY} dur={0.9} />

      {/* ── 7. Center Public Solana Entry card ───────────────────────────── */}
      <rect x={ENTRY_X} y={ENTRY_Y} width={ENTRY_W} height={ENTRY_H} rx={9}
        fill={CARD_BG} stroke={CARD_BORDER} strokeWidth={1.2} />
      <text x={CX} y={ENTRY_Y + 18} textAnchor="middle"
        fill={TEXT} fontSize={9} fontWeight={700}>
        Public Solana Entry
      </text>
      <line x1={ENTRY_X} y1={ENTRY_Y + 27} x2={ENTRY_X + ENTRY_W} y2={ENTRY_Y + 27}
        stroke={CARD_BORDER} strokeWidth={0.9} />
      {/* Tag */}
      <rect x={CX - 39} y={ENTRY_Y + 32} width={78} height={14} rx={4}
        fill="rgba(255,255,255,0.07)" stroke={CARD_BORDER} strokeWidth={0.8} />
      <text x={CX} y={ENTRY_Y + 39} textAnchor="middle"
        fill={TEXT_CODE} fontSize={7} fontWeight={600}>
        Merkle_Proof
      </text>
      {/* Entry content */}
      {([
        ['root: "0x3ae8fb60…d55"', TEXT_CODE],
        ['date: 2025-11-12', TEXT_DIM],
        ['block: 3b8f…d1', TEXT_CODE],
        ['slot: 1760951629', TEXT_DIM],
        ['posted_at: 1760951600', TEXT_DIM],
      ] as [string, string][]).map(([t, c], i) => (
        <text key={i}
          x={ENTRY_X + 12} y={ENTRY_Y + 56 + i * 12}
          fill={c} fontSize={7.8} fontFamily="'DM Mono', monospace">
          {t}
        </text>
      ))}
      {/* Pulse ring */}
      <circle cx={ENTRY_X + ENTRY_W - 14} cy={ENTRY_Y + 16} r={5}
        fill="none" stroke={VALID} strokeWidth={1.2} opacity={0.75}>
        <animate attributeName="opacity" values="0.75;0.2;0.75" dur="2s" repeatCount="indefinite" />
        <animate attributeName="r" values="4;7;4" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* ── 8. Entry → Result ─────────────────────────────────────────────── */}
      <AnimLine d={PATH_ENTRY_RES} />
      <ArrowDown cx={CX} cy={RES_Y} />
      <HoloStream path={PATH_ENTRY_RES} dur={0.8} />

      {/* ── 9. Result pill ────────────────────────────────────────────────── */}
      <rect x={RES_X} y={RES_Y} width={RES_W} height={RES_H} rx={8}
        fill={CARD_BG} stroke={CARD_BORDER} strokeWidth={1.2} />
      {/* Subtle green glow that pulses */}
      <rect x={RES_X} y={RES_Y} width={RES_W} height={RES_H} rx={8}
        fill={VALID} opacity={0.05}>
        <animate attributeName="opacity" values="0.05;0.12;0.05" dur="2.2s" repeatCount="indefinite" />
      </rect>
      <text x={CX} y={RES_Y + 14} textAnchor="middle" dominantBaseline="middle"
        fill={TEXT} fontSize={9} fontWeight={600}>
        Roots Match ={' '}
        <tspan fill={VALID} fontWeight={700}>Valid</tspan>
      </text>
      <text x={CX} y={RES_Y + 26} textAnchor="middle" dominantBaseline="middle"
        fill={TEXT_DIM} fontSize={8.5}>
        Else ={' '}
        <tspan fill={INVALID}>Invalid</tspan>
      </text>
    </svg>
  );
}
