import React from 'react';

/**
 * Animated data flow diagram replacing the static offline-proof verification PNG.
 *
 * Shows:
 *  - Offline Proof card (left)
 *  - Local Compute box (right), connected by an animated dotted line
 *  - Solana RPC Call arrow
 *  - Three Public Solana Entry cards (bottom)
 *  - Roots Match = Valid / Else = Invalid result
 *
 * Particles travel along every connection path to convey live data flow.
 */

const PURPLE = '#a78bfa';
const PURPLE_DIM = '#6d28d9';
const GREEN = '#4ade80';
const CARD_BG = '#16141f';
const CARD_BORDER = '#2d2a3e';
const TEXT_MAIN = '#e0dde8';
const TEXT_DIM = '#7c7a8c';
const TEXT_CODE = '#9d8fcc';

// ── Path definitions (all in viewBox 576 × 420) ──────────────────────────────
// Offline Proof right edge → Local Compute left edge
const PATH_OL_TO_LC = 'M 220 105 C 258 105 272 72 305 72';
// Local Compute bottom → Solana RPC label
const PATH_LC_TO_RPC = 'M 440 125 L 440 168';
// Solana RPC → Left card top
const PATH_RPC_TO_LEFT = 'M 440 182 C 390 195 165 210 88 218';
// Solana RPC → Center card top
const PATH_RPC_TO_MID = 'M 440 182 L 288 218';
// Solana RPC → Right card top
const PATH_RPC_TO_RIGHT = 'M 440 182 C 465 195 487 210 488 218';
// Left card bottom → result
const PATH_LEFT_TO_RES = 'M 88 330 C 88 355 248 368 288 370';
// Center card bottom → result
const PATH_MID_TO_RES = 'M 288 330 L 288 370';
// Right card bottom → result
const PATH_RIGHT_TO_RES = 'M 488 330 C 488 355 328 368 288 370';

interface ParticleProps {
  path: string;
  dur: number;
  begin?: number;
  color?: string;
  r?: number;
  opacity?: number;
}

function Particle({ path, dur, begin = 0, color = PURPLE, r = 3, opacity = 0.9 }: ParticleProps) {
  const id = React.useId();
  return (
    <g>
      <defs>
        <filter id={`glow-${id}`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle r={r} fill={color} opacity={opacity} filter={`url(#glow-${id})`}>
        <animateMotion
          dur={`${dur}s`}
          begin={`${begin}s`}
          repeatCount="indefinite"
          path={path}
          calcMode="linear"
        />
      </circle>
    </g>
  );
}

interface AnimatedPathProps {
  d: string;
  dotted?: boolean;
  color?: string;
  opacity?: number;
  strokeWidth?: number;
}

function AnimatedPath({ d, dotted = false, color = CARD_BORDER, opacity = 1, strokeWidth = 1.5 }: AnimatedPathProps) {
  if (!dotted) {
    return (
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        opacity={opacity}
        strokeLinecap="round"
      />
    );
  }

  // Animated dashes: the dashoffset scrolls to simulate flow
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeDasharray="5 4"
      strokeLinecap="round"
      opacity={opacity}
    >
      <animate
        attributeName="stroke-dashoffset"
        from="0"
        to="-90"
        dur="1.8s"
        repeatCount="indefinite"
        calcMode="linear"
      />
    </path>
  );
}

// ── Small helper components ───────────────────────────────────────────────────

function CodeTag({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <>
      <rect x={x} y={y} width={82} height={16} rx={4} fill={PURPLE_DIM} opacity={0.35} />
      <text x={x + 41} y={y + 11} textAnchor="middle" fill={PURPLE} fontSize={8} fontWeight={600}>
        {label}
      </text>
    </>
  );
}

function ArrowHead({ x, y, pointing = 'down' }: { x: number; y: number; pointing?: 'down' | 'left' }) {
  if (pointing === 'down') {
    return (
      <polygon
        points={`${x},${y} ${x - 4},${y - 7} ${x + 4},${y - 7}`}
        fill={CARD_BORDER}
        opacity={0.8}
      />
    );
  }
  return (
    <polygon
      points={`${x},${y} ${x + 7},${y - 4} ${x + 7},${y + 4}`}
      fill={CARD_BORDER}
      opacity={0.8}
    />
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DataFlowGraphic() {
  return (
    <svg
      viewBox="0 0 576 420"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto max-w-[576px]"
      role="img"
      aria-label="Offline proof verification data flow"
    >
      {/* ── Background ──────────────────────────────────────────────────── */}
      <rect width={576} height={420} fill="transparent" />

      {/* ── Offline Proof card ──────────────────────────────────────────── */}
      <rect x={8} y={14} width={208} height={226} rx={10} fill={CARD_BG} stroke={CARD_BORDER} strokeWidth={1.2} />
      {/* Traffic-light dots */}
      <circle cx={24} cy={28} r={4} fill="#ff5f57" />
      <circle cx={36} cy={28} r={4} fill="#febc2e" />
      <circle cx={48} cy={28} r={4} fill="#28c840" />
      {/* Header */}
      <text x={112} y={30} textAnchor="middle" fill={TEXT_MAIN} fontSize={9} fontWeight={700} opacity={0.9}>
        Offline Proof
      </text>
      {/* Divider */}
      <line x1={8} y1={38} x2={216} y2={38} stroke={CARD_BORDER} strokeWidth={1} />
      {/* Code lines */}
      {[
        ['merkle_proof.txt', TEXT_DIM, 10],
        ['root:', TEXT_DIM, 10],
        ['"0x4f8d3c…e7a"', TEXT_CODE, 10],
        ['leaf_hash:', TEXT_DIM, 10],
        ['"0xb2c1d0…f4"', TEXT_CODE, 10],
        ['index: 142', TEXT_CODE, 10],
        ['siblings: [', TEXT_DIM, 10],
        ['  "0x91a…", "0xe4b…"', TEXT_CODE, 9],
        [']', TEXT_DIM, 10],
        ['created_at: "2025-11-12"', TEXT_DIM, 9],
        ['anchor_block: 1760…', TEXT_DIM, 9],
        ['signed_by: "3Hn…"', TEXT_DIM, 9],
      ].map(([text, color, size], i) => (
        <text key={i} x={18} y={56 + i * 14} fill={color as string} fontSize={size as number} fontFamily="'DM Mono', monospace">
          {text as string}
        </text>
      ))}
      {/* Tag */}
      <CodeTag x={18} y={218} label="Merkle_Proof" />

      {/* ── Local Compute box ───────────────────────────────────────────── */}
      <rect x={305} y={20} width={263} height={105} rx={12} fill={CARD_BG} stroke={CARD_BORDER} strokeWidth={1.2} />
      <text x={436} y={45} textAnchor="middle" fill={TEXT_MAIN} fontSize={11} fontWeight={700}>
        Local Compute
      </text>
      <text x={436} y={62} textAnchor="middle" fill={TEXT_DIM} fontSize={9}>
        convert merkle_proof into
      </text>
      <text x={436} y={74} textAnchor="middle" fill={TEXT_DIM} fontSize={9}>
        full merkle tree.
      </text>
      {/* Tag */}
      <CodeTag x={354} y={95} label="Merkle_Proof" />

      {/* ── Animated dotted connector: Offline Proof → Local Compute ─────── */}
      <AnimatedPath d={PATH_OL_TO_LC} dotted color={PURPLE} opacity={0.55} strokeWidth={1.5} />
      {/* Arrow head pointing right into Local Compute */}
      <polygon
        points="305,72 296,67 296,77"
        fill={PURPLE}
        opacity={0.7}
      />
      {/* Flowing particles */}
      <Particle path={PATH_OL_TO_LC} dur={1.6} begin={0} color={PURPLE} r={3} />
      <Particle path={PATH_OL_TO_LC} dur={1.6} begin={0.55} color={PURPLE} r={2.2} opacity={0.65} />
      <Particle path={PATH_OL_TO_LC} dur={1.6} begin={1.1} color={PURPLE} r={2.8} opacity={0.8} />

      {/* ── Solana RPC Call label ──────────────────────────────────────── */}
      <AnimatedPath d={PATH_LC_TO_RPC} color={CARD_BORDER} opacity={0.7} />
      <ArrowHead x={440} y={168} pointing="down" />
      <Particle path={PATH_LC_TO_RPC} dur={1.0} begin={0} color="#60a5fa" r={2.5} />
      <Particle path={PATH_LC_TO_RPC} dur={1.0} begin={0.5} color="#60a5fa" r={2} opacity={0.7} />

      <rect x={340} y={168} width={200} height={26} rx={6} fill={CARD_BG} stroke={CARD_BORDER} strokeWidth={1} />
      <text x={440} y={185} textAnchor="middle" fill={TEXT_MAIN} fontSize={10} fontWeight={600}>
        Solana RPC Call
      </text>

      {/* ── Fan-out: Solana RPC → three Public Solana Entry cards ─────── */}
      <AnimatedPath d={PATH_RPC_TO_LEFT} color={CARD_BORDER} opacity={0.6} />
      <AnimatedPath d={PATH_RPC_TO_MID} color={CARD_BORDER} opacity={0.6} />
      <AnimatedPath d={PATH_RPC_TO_RIGHT} color={CARD_BORDER} opacity={0.6} />
      <ArrowHead x={88} y={218} pointing="down" />
      <ArrowHead x={288} y={218} pointing="down" />
      <ArrowHead x={488} y={218} pointing="down" />

      {/* Fan-out particles */}
      <Particle path={PATH_RPC_TO_LEFT} dur={1.1} begin={0} color="#60a5fa" r={2.5} />
      <Particle path={PATH_RPC_TO_MID} dur={0.9} begin={0.1} color="#60a5fa" r={2.5} />
      <Particle path={PATH_RPC_TO_RIGHT} dur={1.1} begin={0.2} color="#60a5fa" r={2.5} />

      {/* ── Public Solana Entry cards ─────────────────────────────────── */}
      {[
        { x: 8, hash: '0x91a4…b7f3', date: '2025-11-12', block: 1760951600 },
        { x: 196, hash: '0xe4b2…d81a', date: '2025-11-12', block: 1760951629 },
        { x: 384, hash: '0x5f1c…a3e9', date: '2025-11-12', block: 1760951682 },
      ].map(({ x, hash, date, block }, i) => (
        <g key={i}>
          <rect x={x} y={218} width={172} height={112} rx={8} fill={CARD_BG} stroke={CARD_BORDER} strokeWidth={1.2} />
          <text x={x + 86} y={234} textAnchor="middle" fill={TEXT_MAIN} fontSize={8.5} fontWeight={700}>
            Public Solana Entry
          </text>
          <line x1={x} y1={240} x2={x + 172} y2={240} stroke={CARD_BORDER} strokeWidth={0.8} />
          <CodeTag x={x + 45} y={244} label="Merkle_Proof" />
          <text x={x + 10} y={272} fill={TEXT_DIM} fontSize={7.5} fontFamily="'DM Mono', monospace">
            root:
          </text>
          <text x={x + 10} y={283} fill={TEXT_CODE} fontSize={7} fontFamily="'DM Mono', monospace">
            {hash}
          </text>
          <text x={x + 10} y={296} fill={TEXT_DIM} fontSize={7.5} fontFamily="'DM Mono', monospace">
            date: {date}
          </text>
          <text x={x + 10} y={308} fill={TEXT_DIM} fontSize={7.5} fontFamily="'DM Mono', monospace">
            slot: {block}
          </text>
          {/* Pulsing ring when valid */}
          <circle cx={x + 155} cy={232} r={5} fill="none" stroke={GREEN} strokeWidth={1} opacity={0.7}>
            <animate attributeName="opacity" values="0.7;0.2;0.7" dur={`${1.8 + i * 0.3}s`} repeatCount="indefinite" />
            <animate attributeName="r" values="4;6;4" dur={`${1.8 + i * 0.3}s`} repeatCount="indefinite" />
          </circle>
        </g>
      ))}

      {/* ── Converge: three cards → Roots Match result ───────────────── */}
      <AnimatedPath d={PATH_LEFT_TO_RES} color={CARD_BORDER} opacity={0.5} />
      <AnimatedPath d={PATH_MID_TO_RES} color={CARD_BORDER} opacity={0.5} />
      <AnimatedPath d={PATH_RIGHT_TO_RES} color={CARD_BORDER} opacity={0.5} />
      <ArrowHead x={288} y={370} pointing="down" />

      <Particle path={PATH_LEFT_TO_RES} dur={1.0} begin={0.1} color={GREEN} r={2.2} />
      <Particle path={PATH_MID_TO_RES} dur={0.8} begin={0} color={GREEN} r={2.2} />
      <Particle path={PATH_RIGHT_TO_RES} dur={1.0} begin={0.2} color={GREEN} r={2.2} />

      {/* ── Result pill ──────────────────────────────────────────────── */}
      <rect x={168} y={372} width={240} height={36} rx={8} fill={CARD_BG} stroke={CARD_BORDER} strokeWidth={1.2} />
      {/* Subtle green glow behind the pill */}
      <rect x={168} y={372} width={240} height={36} rx={8} fill={GREEN} opacity={0.04}>
        <animate attributeName="opacity" values="0.04;0.10;0.04" dur="2.4s" repeatCount="indefinite" />
      </rect>
      <text x={288} y={386} textAnchor="middle" fill={TEXT_MAIN} fontSize={9} fontWeight={600}>
        Roots Match ={' '}
        <tspan fill={GREEN} fontWeight={700}>Valid</tspan>
      </text>
      <text x={288} y={400} textAnchor="middle" fill={TEXT_DIM} fontSize={8.5}>
        Else ={' '}
        <tspan fill="#f87171">Invalid</tspan>
      </text>
    </svg>
  );
}
