import React from 'react';

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
const S      = 'rgba(255,255,255,0.65)';  // box / pill outline
const SD     = 'rgba(255,255,255,0.32)';  // connector / arrow fill
const T1     = 'rgba(255,255,255,0.90)';  // primary text
const T2     = 'rgba(255,255,255,0.50)';  // secondary / muted text
const TMONO  = 'rgba(255,255,255,0.75)';  // code / monospace text
const F_SAN  = "'DM Sans','Inter',sans-serif";
const F_MON  = "'DM Mono','Fira Mono',monospace";

// ══ Animation CSS ════════════════════════════════════════════════════════════════
const ANIM_CSS = `
  .pg-fade { opacity:0; animation: pgFadeIn .45s ease forwards; }
  .pg-draw {
    stroke-dasharray: 2000;
    stroke-dashoffset: 2000;
    animation: pgDraw .6s ease forwards;
  }
  @keyframes pgFadeIn { to { opacity:1; } }
  @keyframes pgDraw   { to { stroke-dashoffset:0; } }
  .d0  { animation-delay: 0.00s; }
  .d1  { animation-delay: 0.35s; }
  .d2  { animation-delay: 0.70s; }
  .d3  { animation-delay: 1.05s; }
  .d4  { animation-delay: 1.40s; }
  .d5  { animation-delay: 1.75s; }
  .d6  { animation-delay: 2.10s; }
  .d7  { animation-delay: 2.45s; }
  .d8  { animation-delay: 2.80s; }
`;

// ══ Edge ═════════════════════════════════════════════════════════════════════════
function Arrowhead({
  x, y, dir = 'down', cls,
}: {
  x: number; y: number; dir?: 'down' | 'right'; cls: string;
}) {
  const pts =
    dir === 'down'
      ? `${x},${y} ${x - 5},${y - 9} ${x + 5},${y - 9}`
      : `${x},${y} ${x - 9},${y - 5} ${x - 9},${y + 5}`;
  return <polygon points={pts} fill={SD} className={`pg-fade ${cls}`} />;
}

function Edge({
  d, cls = 'd0', arrow, ax, ay, adir = 'down',
}: {
  d: string;
  cls?: string;
  arrow?: boolean;
  ax?: number;
  ay?: number;
  adir?: 'down' | 'right';
}) {
  return (
    <>
      <path
        d={d}
        fill="none"
        stroke={SD}
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`pg-draw ${cls}`}
      />
      {arrow && ax !== undefined && ay !== undefined && (
        <Arrowhead x={ax} y={ay} dir={adir} cls={cls} />
      )}
    </>
  );
}

// ══ Pill ══════════════════════════════════════════════════════════════════════════
function Pill({
  x, y, w, h, cls = 'd0', children,
}: {
  x: number; y: number; w: number; h: number; cls?: string;
  children?: React.ReactNode;
}) {
  return (
    <g className={`pg-fade ${cls}`}>
      <rect x={x} y={y} width={w} height={h} rx={h / 2}
        fill="none" stroke={S} strokeWidth={1} />
      {children}
    </g>
  );
}

// ══ Box ═══════════════════════════════════════════════════════════════════════════
const HDR = 28;

function Box({
  x, y, w, h, cls = 'd0', title, subtitle, children,
}: {
  x: number; y: number; w: number; h: number; cls?: string;
  title?: string; subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <g className={`pg-fade ${cls}`}>
      <rect x={x} y={y} width={w} height={h} rx={8}
        fill="none" stroke={S} strokeWidth={1} />
      {title && (
        <>
          <text
            x={x + w / 2} y={y + HDR / 2}
            textAnchor="middle" dominantBaseline="middle"
            fill={T1} fontSize={10} fontWeight={600}
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
          x={x + w / 2} y={y + HDR + 13}
          textAnchor="middle" dominantBaseline="middle"
          fill={T2} fontSize={8} fontFamily={F_SAN}
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
  const y0 = by + HDR + 12;
  const LH = 13.5;
  const [r1, r2] = root.split(' ');
  const rowOffset = r2 ? 3.3 : 2.3;

  return (
    <>
      <text x={bx + 9} y={y0}
        fill={T2} fontSize={7} fontFamily={F_MON} dominantBaseline="middle"
      >Merkle_Root</text>
      <text x={bx + 9} y={y0 + LH}
        fill={TMONO} fontSize={6.5} fontFamily={F_MON} dominantBaseline="middle"
      >&quot;{r1}</text>
      {r2 && (
        <text x={bx + 9} y={y0 + LH * 2}
          fill={TMONO} fontSize={6.5} fontFamily={F_MON} dominantBaseline="middle"
        >{r2}&quot;</text>
      )}
      <text x={bx + 9} y={y0 + LH * rowOffset}
        fill={T2} fontSize={7} fontFamily={F_MON} dominantBaseline="middle"
      >date: &quot;{date}&quot;</text>
      <text x={bx + 9} y={y0 + LH * (rowOffset + 1)}
        fill={T2} fontSize={7} fontFamily={F_MON} dominantBaseline="middle"
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
  const ELBOW_Y = Math.round((TB + RPC_Y) / 2); // 254

  // Edge paths
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

  const CODE_TOP = TY + HDR + 8;  // first code line baseline
  const CODE_LH  = 10.8;           // line height

  const MR_LC   = '3a4b5c6d7e8f90a1b2c3d4e5f6071829 30313233...3e3f';
  const [mr1, mr2] = MR_LC.split(' ');

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto max-w-[640px]"
      role="img"
      aria-label="Photo provenance verification flow"
    >
      <style>{ANIM_CSS}</style>

      {/* ──────────────────────────────────────────────────────────────────────────
          OFFLINE PROOF  (top-left)
      ────────────────────────────────────────────────────────────────────────── */}
      <Box x={OX} y={TY} w={BW} h={BH} title="Offline Proof" cls="d0">
        {CODE_LINES.map((line, i) => (
          <text
            key={i}
            x={OX + 10}
            y={CODE_TOP + i * CODE_LH}
            fill={TMONO}
            fontSize={7}
            fontFamily={F_MON}
          >{line}</text>
        ))}
      </Box>

      {/* ──────────────────────────────────────────────────────────────────────────
          LOCAL COMPUTE  (top-right)
      ────────────────────────────────────────────────────────────────────────── */}
      <Box
        x={LX} y={TY} w={BW} h={BH}
        title="Local Compute"
        subtitle="convert merkle_proof into full merkle tree."
        cls="d1"
      >
        {/* Merkle root inset */}
        <rect
          x={LX + 10} y={TY + 56} width={BW - 20} height={54} rx={5}
          fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={0.75}
        />
        <text x={LX + 18} y={TY + 69}
          fill={T2} fontSize={7} fontFamily={F_MON} dominantBaseline="middle"
        >Merkle_Root</text>
        <text x={LX + 18} y={TY + 83}
          fill={TMONO} fontSize={6.5} fontFamily={F_MON} dominantBaseline="middle"
        >&quot;{mr1}</text>
        <text x={LX + 18} y={TY + 97}
          fill={TMONO} fontSize={6.5} fontFamily={F_MON} dominantBaseline="middle"
        >{mr2}&quot;</text>
      </Box>

      {/* ──────────────────────────────────────────────────────────────────────────
          EDGES: top section
      ────────────────────────────────────────────────────────────────────────── */}

      {/* Offline Proof → Local Compute */}
      <Edge d={P_OL_LC} cls="d2" arrow ax={LX} ay={TCY} adir="right" />

      {/* Local Compute ↓ RPC */}
      <Edge d={P_LC_RPC} cls="d3" arrow ax={CX} ay={RPC_Y} adir="down" />

      {/* ──────────────────────────────────────────────────────────────────────────
          SOLANA RPC CALL  (middle pill)
      ────────────────────────────────────────────────────────────────────────── */}
      <Pill x={RPC_X} y={RPC_Y} w={RPC_W} h={RPC_H} cls="d4">
        <text
          x={CX} y={RPC_Y + RPC_H / 2}
          textAnchor="middle" dominantBaseline="middle"
          fill={T1} fontSize={10} fontWeight={500} fontFamily={F_SAN}
        >Solana RPC Call</text>
      </Pill>

      {/* RPC ↓ middle Public Solana Entry */}
      <Edge d={P_RPC_MD} cls="d4" arrow ax={CX} ay={BBY} adir="down" />

      {/* ──────────────────────────────────────────────────────────────────────────
          PUBLIC SOLANA ENTRIES  (bottom row)
      ────────────────────────────────────────────────────────────────────────── */}
      <Box x={B1X} y={BBY} w={BBW} h={BBH} title="Public Solana Entry" cls="d5">
        <EntryContent
          bx={B1X} by={BBY}
          root="c651a781ae56037cb84a255add0f187 e8539a3g...c25e"
          date="2025-11-11"
          postedAt={1762819200}
        />
      </Box>

      <Box x={B2X} y={BBY} w={BBW} h={BBH} title="Public Solana Entry" cls="d5">
        <EntryContent
          bx={B2X} by={BBY}
          root="3a4b5c6d7e8f90a1b2c3d4e5f6071829 30313233...3e3f"
          date="2025-11-12"
          postedAt={1762905600}
        />
      </Box>

      <Box x={B3X} y={BBY} w={BBW} h={BBH} title="Public Solana Entry" cls="d5">
        <EntryContent
          bx={B3X} by={BBY}
          root="a15cf1586830788360a79904157153e c092545fc...f4fe"
          date="2025-11-13"
          postedAt={1762819200}
        />
      </Box>

      {/* Horizontal connectors linking the 3 bottom boxes */}
      <Edge d={P_H1} cls="d5" />
      <Edge d={P_H2} cls="d5" />

      {/* ──────────────────────────────────────────────────────────────────────────
          COLLECTOR: boxes → h-bar → result
      ────────────────────────────────────────────────────────────────────────── */}
      <Edge d={P_D1} cls="d6" />
      <Edge d={P_D2} cls="d6" />
      <Edge d={P_D3} cls="d6" />
      <Edge d={P_HBAR} cls="d6" />

      <Edge d={P_RES} cls="d7" arrow ax={CX} ay={RES_Y} adir="down" />

      {/* ──────────────────────────────────────────────────────────────────────────
          RESULT  (bottom pill)
      ────────────────────────────────────────────────────────────────────────── */}
      <Pill x={RES_X} y={RES_Y} w={RES_W} h={RES_H} cls="d8">
        <text
          x={CX} y={RES_Y + RES_H / 2 - 9}
          textAnchor="middle" dominantBaseline="middle"
          fill={T1} fontSize={10} fontWeight={500} fontFamily={F_SAN}
        >
          Roots Match ={' '}
          <tspan fontWeight={700}>Valid</tspan>
        </text>
        <text
          x={CX} y={RES_Y + RES_H / 2 + 9}
          textAnchor="middle" dominantBaseline="middle"
          fill={T2} fontSize={9} fontFamily={F_SAN}
        >
          Else ={' '}
          <tspan fill="rgba(255,255,255,0.42)">Invalid</tspan>
        </text>
      </Pill>
    </svg>
  );
}
