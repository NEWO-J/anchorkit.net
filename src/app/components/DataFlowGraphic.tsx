import React from 'react';

// ── Palette — flat colours only, no gradients ─────────────────────────────────
const CARD_BG    = 'rgba(255,255,255,0.04)';
const CARD_BDR   = 'rgba(255,255,255,0.10)';
const ENT_BDR    = 'rgba(153,69,255,0.38)';  // Solana Entry card only
const T1         = 'rgba(255,255,255,0.84)';  // primary text
const T2         = 'rgba(255,255,255,0.36)';  // muted / label text
const TC         = 'rgba(255,255,255,0.56)';  // monospace / code values
const SEP        = 'rgba(255,255,255,0.08)';  // internal separators
const CONN       = 'rgba(255,255,255,0.13)';  // connector lines + arrowheads
const VALID      = '#4ade80';
const INVALID    = '#f87171';

// ── Layout — viewBox 640 × 490 ────────────────────────────────────────────────
const VW = 640, VH = 490, CX = 320;

// Top cards
const TY = 18, CH = 158, CW = 226, HDR = 28;
const OX  = 18,           OX_CX = OX + CW / 2;   // 131
const LX  = VW - 18 - CW, LC_CX = LX + CW / 2;   // 396, 509
const ORX = OX + CW;      // 244 — right edge of Offline Proof
const TCY = TY + CH / 2;  // 97  — vertical centre of top cards
const TBT = TY + CH;      // 176 — bottom of top cards

// Elbow + RPC pill
const ELY   = 210;
const RPC_Y = ELY + 16,  RPC_H = 30,  RPC_W = 192,  RPC_X = CX - RPC_W / 2;  // 226

// Public Solana Entry
const ENT_Y = RPC_Y + RPC_H + 18;   // 274
const ENT_H = 136, ENT_W = 224, ENT_X = CX - ENT_W / 2;  // 208
const ENT_B = ENT_Y + ENT_H;        // 410

// Result
const RES_Y = ENT_B + 16;   // 426
const RES_H = 46, RES_W = 256, RES_X = CX - RES_W / 2;  // 192
// VH check: 426 + 46 + 18 = 490 ✓

// ── Paths ─────────────────────────────────────────────────────────────────────
const P_OL_LC  = `M ${ORX} ${TCY} L ${LX} ${TCY}`;
const P_LC_RPC = `M ${LC_CX} ${TBT} L ${LC_CX} ${ELY} L ${CX} ${ELY} L ${CX} ${RPC_Y}`;
const P_RPC_E  = `M ${CX} ${RPC_Y + RPC_H} L ${CX} ${ENT_Y}`;
const P_E_RES  = `M ${CX} ${ENT_B} L ${CX} ${RES_Y}`;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Single subtle dot that travels the given path to show data flow direction. */
function FlowDot({ path, dur }: { path: string; dur: number }) {
  return (
    <circle r={2} fill="rgba(255,255,255,0.45)">
      <animateMotion dur={`${dur}s`} repeatCount="indefinite" path={path} calcMode="linear" />
    </circle>
  );
}

/** Small filled arrowhead pointing downward. */
function ArrowDown({ x, y }: { x: number; y: number }) {
  return (
    <polygon points={`${x},${y} ${x - 5},${y - 9} ${x + 5},${y - 9}`} fill={CONN} />
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function DataFlowGraphic() {

  // Offline Proof — code file contents
  const codeLines: [string, string][] = [
    ['merkle_proof.txt',       T2],
    ['root: "0x4f8d3c…e7a"',  TC],
    ['leaf: "0xb2c1d…f4"',    TC],
    ['index: 142',             TC],
    ['siblings: ["0x91a…"]',  TC],
    ['signed_by: "3HnV…"',    T2],
  ];

  // Solana Entry — on-chain record
  const entryLines: [string, string][] = [
    ['root:      "0x3ae8fb60…d55"', TC],
    ['date:      2025-11-12',       T2],
    ['block:     3b8f…d1',          TC],
    ['slot:      1760951629',        T2],
    ['posted_at: 1760951600',        T2],
  ];

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto max-w-[640px]"
      role="img"
      aria-label="Offline proof verification data flow"
    >
      {/* ── OFFLINE PROOF ───────────────────────────────────────────────────── */}
      <rect x={OX} y={TY} width={CW} height={CH} rx={8}
        fill={CARD_BG} stroke={CARD_BDR} strokeWidth={1} />

      <text x={OX + CW / 2} y={TY + HDR / 2}
        textAnchor="middle" dominantBaseline="middle"
        fill={T1} fontSize={10} fontWeight={600}
        fontFamily="'DM Sans', sans-serif">
        Offline Proof
      </text>
      <line x1={OX} y1={TY + HDR} x2={OX + CW} y2={TY + HDR}
        stroke={SEP} strokeWidth={0.8} />

      {codeLines.map(([t, c], i) => (
        <text key={i}
          x={OX + 14} y={TY + HDR + 14 + i * 13.5}
          fill={c} fontSize={8.5} fontFamily="'DM Mono', monospace">
          {t}
        </text>
      ))}

      {/* type badge */}
      <rect x={OX + 14} y={TY + CH - 22} width={80} height={14} rx={7}
        fill="none" stroke={CARD_BDR} strokeWidth={0.8} />
      <text x={OX + 54} y={TY + CH - 15}
        textAnchor="middle" dominantBaseline="middle"
        fill={T2} fontSize={7.5} fontFamily="'DM Mono', monospace">
        Merkle_Proof
      </text>

      {/* ── LOCAL COMPUTE ───────────────────────────────────────────────────── */}
      <rect x={LX} y={TY} width={CW} height={CH} rx={8}
        fill={CARD_BG} stroke={CARD_BDR} strokeWidth={1} />

      <text x={LX + CW / 2} y={TY + HDR / 2}
        textAnchor="middle" dominantBaseline="middle"
        fill={T1} fontSize={10} fontWeight={600}
        fontFamily="'DM Sans', sans-serif">
        Local Compute
      </text>
      <line x1={LX} y1={TY + HDR} x2={LX + CW} y2={TY + HDR}
        stroke={SEP} strokeWidth={0.8} />

      {/* in / op / out rows */}
      {(
        [
          ['in',  'merkle_proof.txt',    TC, 0],
          ['op',  'expand siblings[ ]',  T2, 1],
          ['op',  'recompute hashes',    T2, 2],
        ] as [string, string, string, number][]
      ).map(([label, value, vc, i]) => (
        <React.Fragment key={i}>
          <text x={LX + 14} y={TY + HDR + 20 + i * 24}
            fill={T2} fontSize={8} fontFamily="'DM Sans', sans-serif" fontWeight={500}>
            {label}
          </text>
          <text x={LX + 48} y={TY + HDR + 20 + i * 24}
            fill={vc} fontSize={8.5} fontFamily="'DM Mono', monospace">
            {value}
          </text>
        </React.Fragment>
      ))}

      <line x1={LX + 14} y1={TY + HDR + 86} x2={LX + CW - 14} y2={TY + HDR + 86}
        stroke={SEP} strokeWidth={0.8} />

      <text x={LX + 14} y={TY + HDR + 102}
        fill={T2} fontSize={8} fontFamily="'DM Sans', sans-serif" fontWeight={500}>
        out
      </text>
      <text x={LX + 48} y={TY + HDR + 102}
        fill={TC} fontSize={8.5} fontFamily="'DM Mono', monospace">
        verified root hash
      </text>

      {/* ── CONNECTOR  OL → LC ──────────────────────────────────────────────── */}
      <line x1={ORX} y1={TCY} x2={LX} y2={TCY}
        stroke={CONN} strokeWidth={1} strokeDasharray="4 4" />
      {/* right-pointing arrowhead */}
      <polygon
        points={`${LX},${TCY} ${LX - 9},${TCY - 5} ${LX - 9},${TCY + 5}`}
        fill={CONN}
      />
      <FlowDot path={P_OL_LC} dur={1.4} />

      {/* ── CONNECTOR  LC → RPC  (elbow) ────────────────────────────────────── */}
      <path d={P_LC_RPC} fill="none"
        stroke={CONN} strokeWidth={1} strokeLinecap="square" />
      <ArrowDown x={CX} y={RPC_Y} />
      <FlowDot path={P_LC_RPC} dur={2.0} />

      {/* ── SOLANA RPC CALL ─────────────────────────────────────────────────── */}
      <rect x={RPC_X} y={RPC_Y} width={RPC_W} height={RPC_H} rx={RPC_H / 2}
        fill={CARD_BG} stroke={CARD_BDR} strokeWidth={1} />
      <text x={CX} y={RPC_Y + RPC_H / 2}
        textAnchor="middle" dominantBaseline="middle"
        fill={T1} fontSize={10} fontWeight={600}
        fontFamily="'DM Sans', sans-serif">
        Solana RPC Call
      </text>

      {/* ── CONNECTOR  RPC → ENTRY ──────────────────────────────────────────── */}
      <line x1={CX} y1={RPC_Y + RPC_H} x2={CX} y2={ENT_Y}
        stroke={CONN} strokeWidth={1} />
      <ArrowDown x={CX} y={ENT_Y} />
      <FlowDot path={P_RPC_E} dur={0.9} />

      {/* ── PUBLIC SOLANA ENTRY  (featured) ─────────────────────────────────── */}
      {/* Purple border is the only visual distinction — no gradients, no glow */}
      <rect x={ENT_X} y={ENT_Y} width={ENT_W} height={ENT_H} rx={8}
        fill={CARD_BG} stroke={ENT_BDR} strokeWidth={1} />

      <text x={CX} y={ENT_Y + HDR / 2}
        textAnchor="middle" dominantBaseline="middle"
        fill={T1} fontSize={10.5} fontWeight={600}
        fontFamily="'DM Sans', sans-serif">
        Public Solana Entry
      </text>

      {/* live pulse — signals the node is actively being queried */}
      <circle cx={ENT_X + ENT_W - 18} cy={ENT_Y + HDR / 2} r={3.5}
        fill="none" stroke={VALID} strokeWidth={1.2}>
        <animate attributeName="r"       values="3.5;7;3.5"  dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0;1"       dur="2s" repeatCount="indefinite" />
      </circle>

      <line x1={ENT_X} y1={ENT_Y + HDR} x2={ENT_X + ENT_W} y2={ENT_Y + HDR}
        stroke={SEP} strokeWidth={0.8} />

      {/* type badge */}
      <rect x={ENT_X + 14} y={ENT_Y + HDR + 8} width={80} height={14} rx={7}
        fill="none" stroke="rgba(153,69,255,0.28)" strokeWidth={0.8} />
      <text x={ENT_X + 54} y={ENT_Y + HDR + 15}
        textAnchor="middle" dominantBaseline="middle"
        fill="rgba(153,69,255,0.65)" fontSize={7.5} fontFamily="'DM Mono', monospace">
        Merkle_Proof
      </text>

      {/* on-chain data rows */}
      {entryLines.map(([t, c], i) => (
        <text key={i}
          x={ENT_X + 14} y={ENT_Y + HDR + 32 + i * 14}
          fill={c} fontSize={8.5} fontFamily="'DM Mono', monospace">
          {t}
        </text>
      ))}

      {/* ── CONNECTOR  ENTRY → RESULT ───────────────────────────────────────── */}
      <line x1={CX} y1={ENT_B} x2={CX} y2={RES_Y}
        stroke={CONN} strokeWidth={1} />
      <ArrowDown x={CX} y={RES_Y} />
      <FlowDot path={P_E_RES} dur={0.7} />

      {/* ── RESULT ──────────────────────────────────────────────────────────── */}
      <rect x={RES_X} y={RES_Y} width={RES_W} height={RES_H} rx={RES_H / 2}
        fill={CARD_BG} stroke={CARD_BDR} strokeWidth={1} />

      <text x={CX} y={RES_Y + 16}
        textAnchor="middle" dominantBaseline="middle"
        fill={T1} fontSize={10} fontWeight={600}
        fontFamily="'DM Sans', sans-serif">
        Roots Match{' '}
        <tspan fill={VALID} fontWeight={700}>&#x2713; Valid</tspan>
      </text>
      <text x={CX} y={RES_Y + 32}
        textAnchor="middle" dominantBaseline="middle"
        fill={T2} fontSize={9}
        fontFamily="'DM Sans', sans-serif">
        Otherwise{' '}
        <tspan fill={INVALID}>&#x2717; Invalid</tspan>
      </text>
    </svg>
  );
}
