import React, { useEffect, useRef, useState } from 'react';

// ══ Geometry ════════════════════════════════════════════════════════════════════
const VW   = 980;
const VH   = 624;
const CX   = VW / 2; // 490

// Top boxes
const BW   = 310;
const BH   = 210;
const TY   = 20;
const OX   = 18;
const LX   = VW - OX - BW;     // 652
const LCX  = LX + BW / 2;      // 807
const TB   = TY + BH;          // 230
const TCY  = TY + BH / 2;      // 125

// RPC pill
const RPC_W = 202;
const RPC_H = 34;
const RPC_X = CX - RPC_W / 2;  // 389
const RPC_Y = 278;
const RPC_B = RPC_Y + RPC_H;   // 312

// Bottom boxes
const BBW   = 234;
const BBH   = 144;
const BBG   = 18;
const BBY   = 364;
const B_TOT = 3 * BBW + 2 * BBG; // 738
const B_SX  = (VW - B_TOT) / 2;  // 121
const B1X   = B_SX;
const B2X   = B1X + BBW + BBG;   // 373
const B3X   = B2X + BBW + BBG;   // 625
const B1CX  = B1X + BBW / 2;     // 238
const B2CX  = B2X + BBW / 2;     // 490
const B3CX  = B3X + BBW / 2;     // 742
const BBB   = BBY + BBH;          // 508

// H-bar & result
const HY    = 528;
const RES_W = 282;
const RES_H = 52;
const RES_X = CX - RES_W / 2;   // 349
const RES_Y = 548;

// ══ Palette ═════════════════════════════════════════════════════════════════════
const S      = 'rgba(255,255,255,0.65)';
const SD     = 'rgba(255,255,255,0.32)';
const T1     = 'rgba(255,255,255,0.90)';
const T2     = 'rgba(255,255,255,0.50)';
const TMONO  = 'rgba(255,255,255,0.75)';
const F_SAN  = "'DM Sans','Inter',sans-serif";
const F_MON  = "'DM Mono','Fira Mono',monospace";

// ══ Animation steps ══════════════════════════════════════════════════════════════
// 10 steps (0–9). Each spans 0.16 of progress, staggered by 0.09.
// Arrow steps come before the boxes they point to.
//
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

function stepP(i: number, progress: number): number {
  const start = i * 0.09;
  const end   = start + 0.16;
  return Math.max(0, Math.min(1, (progress - start) / (end - start)));
}

const DASH = 2000;

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
  d, step, progress, arrow, ax, ay, adir = 'down',
}: {
  d: string; step: number; progress: number;
  arrow?: boolean; ax?: number; ay?: number; adir?: 'down' | 'right';
}) {
  const p = stepP(step, progress);
  return (
    <>
      <path
        d={d}
        fill="none"
        stroke={SD}
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ strokeDasharray: DASH, strokeDashoffset: DASH * (1 - p) }}
      />
      {arrow && ax !== undefined && ay !== undefined && (
        <Arrowhead x={ax} y={ay} dir={adir} opacity={p} />
      )}
    </>
  );
}

// ══ Grow helper — scale from center of fill-box ═══════════════════════════════════
function growStyle(p: number): React.CSSProperties {
  const scale = 0.72 + p * 0.28; // 0.72 → 1.0
  return {
    opacity: Math.min(1, p * 2.5),
    transform: `scale(${scale})`,
    transformBox: 'fill-box' as React.CSSProperties['transformBox'],
    transformOrigin: 'center',
  };
}

// ══ Pill ══════════════════════════════════════════════════════════════════════════
function Pill({
  x, y, w, h, step, progress, children,
}: {
  x: number; y: number; w: number; h: number; step: number; progress: number;
  children?: React.ReactNode;
}) {
  return (
    <g style={growStyle(stepP(step, progress))}>
      <rect x={x} y={y} width={w} height={h} rx={h / 2}
        fill="none" stroke={S} strokeWidth={1} />
      {children}
    </g>
  );
}

// ══ Box ═══════════════════════════════════════════════════════════════════════════
const HDR = 28;

function Box({
  x, y, w, h, step, progress, title, subtitle, children,
}: {
  x: number; y: number; w: number; h: number; step: number; progress: number;
  title?: string; subtitle?: string; children?: React.ReactNode;
}) {
  return (
    <g style={growStyle(stepP(step, progress))}>
      <rect x={x} y={y} width={w} height={h} rx={8}
        fill="none" stroke={S} strokeWidth={1} />
      {title && (
        <>
          <text
            x={x + w / 2} y={y + HDR / 2}
            textAnchor="middle" dominantBaseline="middle"
            fill={T1} fontSize={14} fontWeight={600}
            fontFamily={F_SAN} letterSpacing="0.3"
          >{title}</text>
          <line
            x1={x + 1} y1={y + HDR} x2={x + w - 1} y2={y + HDR}
            stroke={S} strokeWidth={0.75} opacity={0.35}
          />
        </>
      )}
      {subtitle && (
        <text
          x={x + w / 2} y={y + HDR + 11}
          textAnchor="middle" dominantBaseline="middle"
          fill={T2} fontSize={10} fontFamily={F_SAN}
        >{subtitle}</text>
      )}
      {children}
    </g>
  );
}

// ══ Entry card content ════════════════════════════════════════════════════════════
function EntryContent({
  bx, by, root, date, postedAt,
}: {
  bx: number; by: number; root: string; date: string; postedAt: number;
}) {
  const y0 = by + HDR + 13;
  const LH = 14;
  const [r1, r2] = root.split(' ');
  const rowOffset = r2 ? 3.3 : 2.3;

  return (
    <>
      <text x={bx + 9} y={y0}
        fill={T2} fontSize={11} fontFamily={F_MON} dominantBaseline="middle"
      >Merkle_Root</text>
      <text x={bx + 9} y={y0 + LH}
        fill={TMONO} fontSize={10} fontFamily={F_MON} dominantBaseline="middle"
      >&quot;{r1}</text>
      {r2 && (
        <text x={bx + 9} y={y0 + LH * 2}
          fill={TMONO} fontSize={10} fontFamily={F_MON} dominantBaseline="middle"
        >{r2}&quot;</text>
      )}
      <text x={bx + 9} y={y0 + LH * rowOffset}
        fill={T2} fontSize={11} fontFamily={F_MON} dominantBaseline="middle"
      >date: &quot;{date}&quot;</text>
      <text x={bx + 9} y={y0 + LH * (rowOffset + 1)}
        fill={T2} fontSize={11} fontFamily={F_MON} dominantBaseline="middle"
      >posted_at: {postedAt}</text>
    </>
  );
}

// ══ Code block (Offline Proof) ════════════════════════════════════════════════════
const CODE_LINES = [
  '@Serializable data class PortableProof(',
  '  val schema_version: Int = 1,',
  '  val hash: String,',
  '  val day: String,',
  '  val timestamp: Long,',
  '  val hash_id: Int,',
  '  val merkle_proof: List<List<String>>,',
  '  val solana_program: String,',
  '  val solana_chunk_index: Int?,',
  '  val solana_tx: String?',
  ')',
];

// ══ Main export ═══════════════════════════════════════════════════════════════════
export default function DataFlowGraphic() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      // Start when element top reaches 50% down viewport; complete when near top
      const start = vh * 0.5;
      const p = Math.max(0, Math.min(1, (start - rect.top) / (start + vh * 0.1)));
      setProgress(p);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const ELBOW_Y = Math.round((TB + RPC_Y) / 2); // 254

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

  const CODE_TOP = TY + HDR + 8;
  const CODE_LH  = 12.5;

  const MR_LC  = '3a4b5c6d7e8f90a1b2c3d4e5f6071829 30313233...3e3f';
  const [mr1, mr2] = MR_LC.split(' ');

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VW} ${VH}`}
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto max-w-[640px]"
      style={{ marginTop: '-70px' }}
      role="img"
      aria-label="Photo provenance verification flow"
    >
      {/* step 0 ── Offline Proof (source node, no incoming arrow) */}
      <Box x={OX} y={TY} w={BW} h={BH} title="Offline Proof" step={0} progress={progress}>
        {CODE_LINES.map((line, i) => (
          <text key={i} x={OX + 10} y={CODE_TOP + i * CODE_LH}
            fill={TMONO} fontSize={10} fontFamily={F_MON}
          >{line}</text>
        ))}
      </Box>

      {/* step 1 ── edge: Offline Proof → Local Compute */}
      <Edge d={P_OL_LC} step={1} progress={progress} arrow ax={LX} ay={TCY} adir="right" />

      {/* step 2 ── Local Compute (grows when arrow arrives) */}
      <Box x={LX} y={TY} w={BW} h={BH}
        title="Local Compute"
        subtitle="convert merkle_proof into full merkle tree."
        step={2} progress={progress}
      >
        <rect x={LX + 10} y={TY + 56} width={BW - 20} height={54} rx={5}
          fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={0.75} />
        <text x={LX + 18} y={TY + 69}
          fill={T2} fontSize={11} fontFamily={F_MON} dominantBaseline="middle"
        >Merkle_Root</text>
        <text x={LX + 18} y={TY + 83}
          fill={TMONO} fontSize={10} fontFamily={F_MON} dominantBaseline="middle"
        >&quot;{mr1}</text>
        <text x={LX + 18} y={TY + 97}
          fill={TMONO} fontSize={10} fontFamily={F_MON} dominantBaseline="middle"
        >{mr2}&quot;</text>
      </Box>

      {/* step 3 ── edge: Local Compute → RPC */}
      <Edge d={P_LC_RPC} step={3} progress={progress} arrow ax={CX} ay={RPC_Y} adir="down" />

      {/* step 4 ── RPC pill (grows when arrow arrives) */}
      <Pill x={RPC_X} y={RPC_Y} w={RPC_W} h={RPC_H} step={4} progress={progress}>
        <text x={CX} y={RPC_Y + RPC_H / 2}
          textAnchor="middle" dominantBaseline="middle"
          fill={T1} fontSize={14} fontWeight={500} fontFamily={F_SAN}
        >Solana RPC Call</text>
      </Pill>

      {/* step 5 ── edge: RPC → middle entry */}
      <Edge d={P_RPC_MD} step={5} progress={progress} arrow ax={CX} ay={BBY} adir="down" />

      {/* step 6 ── Public Solana Entry boxes + H connectors (grow when arrow arrives) */}
      <Box x={B1X} y={BBY} w={BBW} h={BBH} title="Public Solana Entry" step={6} progress={progress}>
        <EntryContent bx={B1X} by={BBY}
          root="c651a781ae56037cb84a255add0f187 e8539a3g...c25e"
          date="2025-11-11" postedAt={1762819200} />
      </Box>
      <Box x={B2X} y={BBY} w={BBW} h={BBH} title="Public Solana Entry" step={6} progress={progress}>
        <EntryContent bx={B2X} by={BBY}
          root="3a4b5c6d7e8f90a1b2c3d4e5f6071829 30313233...3e3f"
          date="2025-11-12" postedAt={1762905600} />
      </Box>
      <Box x={B3X} y={BBY} w={BBW} h={BBH} title="Public Solana Entry" step={6} progress={progress}>
        <EntryContent bx={B3X} by={BBY}
          root="a15cf1586830788360a79904157153e c092545fc...f4fe"
          date="2025-11-13" postedAt={1762819200} />
      </Box>
      <Edge d={P_H1} step={6} progress={progress} />
      <Edge d={P_H2} step={6} progress={progress} />

      {/* step 7 ── collector edges */}
      <Edge d={P_D1} step={7} progress={progress} />
      <Edge d={P_D2} step={7} progress={progress} />
      <Edge d={P_D3} step={7} progress={progress} />
      <Edge d={P_HBAR} step={7} progress={progress} />

      {/* step 8 ── result edge */}
      <Edge d={P_RES} step={8} progress={progress} arrow ax={CX} ay={RES_Y} adir="down" />

      {/* step 9 ── Result pill (grows when arrow arrives) */}
      <Pill x={RES_X} y={RES_Y} w={RES_W} h={RES_H} step={9} progress={progress}>
        <text x={CX} y={RES_Y + RES_H / 2 - 9}
          textAnchor="middle" dominantBaseline="middle"
          fill={T1} fontSize={14} fontWeight={500} fontFamily={F_SAN}
        >
          Roots Match ={' '}
          <tspan fontWeight={700}>Valid</tspan>
        </text>
        <text x={CX} y={RES_Y + RES_H / 2 + 9}
          textAnchor="middle" dominantBaseline="middle"
          fill={T2} fontSize={12} fontFamily={F_SAN}
        >
          Else ={' '}
          <tspan fill="rgba(255,255,255,0.42)">Invalid</tspan>
        </text>
      </Pill>
    </svg>
  );
}
