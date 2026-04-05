import React from 'react';

// ── Geometry ─────────────────────────────────────────────────────────────────
const VW = 620;
const VH = 510;
const NS = 72;    // node square side
const NRX = 13;   // corner radius
const DOT_DIST = 58; // satellite dot distance from node centre
const DOT_COUNT = 5;

type Pt = [number, number];

const NODES: Pt[] = [
  [305,  55],   // 0 top-centre
  [ 68, 192],   // 1 left
  [248, 255],   // 2 centre
  [450, 165],   // 3 right-upper
  [562, 250],   // 4 far-right
  [110, 390],   // 5 bottom-left
  [410, 448],   // 6 bottom-right
];

// Per-node angular offset so the dot rings are all different
const DOT_OFFSET_DEG = [0, 36, 18, 54, 9, 45, 27];

function dotPositions(ni: number) {
  const [nx, ny] = NODES[ni];
  const base = DOT_OFFSET_DEG[ni];
  return Array.from({ length: DOT_COUNT }, (_, i) => {
    const a = ((i * 360) / DOT_COUNT + base) * (Math.PI / 180);
    return {
      cx:    nx + Math.cos(a) * DOT_DIST,
      cy:    ny + Math.sin(a) * DOT_DIST,
      delay: `${(i * 0.38 + ni * 0.12).toFixed(2)}s`,
      dur:   `${(1.8 + i * 0.15).toFixed(2)}s`,
    };
  });
}

// Quadratic-bezier arc — bend is the perpendicular offset of the control point
function arcPath(a: number, b: number, bend: number): string {
  const [x1, y1] = NODES[a];
  const [x2, y2] = NODES[b];
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const len = Math.hypot(x2 - x1, y2 - y1);
  const nx = -(y2 - y1) / len;
  const ny =  (x2 - x1) / len;
  const cx = mx + nx * bend;
  const cy = my + ny * bend;
  return `M${x1},${y1} Q${cx.toFixed(1)},${cy.toFixed(1)} ${x2},${y2}`;
}

function revArcPath(a: number, b: number, bend: number): string {
  // Same curve traversed end → start
  const [x1, y1] = NODES[a];
  const [x2, y2] = NODES[b];
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const len = Math.hypot(x2 - x1, y2 - y1);
  const nx = -(y2 - y1) / len;
  const ny =  (x2 - x1) / len;
  const cx = mx + nx * bend;
  const cy = my + ny * bend;
  return `M${x2},${y2} Q${cx.toFixed(1)},${cy.toFixed(1)} ${x1},${y1}`;
}

// [from, to, bend, fwd_dur_ms, fwd_delay_ms, rev? (also sends a packet back)]
type EdgeDef = [number, number, number, number, number, boolean?];

const EDGES: EdgeDef[] = [
  [0, 1,  -75, 2200,    0, true ],
  [0, 2,  -50, 2000,  800       ],
  [0, 3,  -55, 1800,  400, true ],
  [0, 4, -100, 2600,  200       ],
  [1, 2,   28, 1600,  300, true ],
  [1, 3,  -85, 3000, 1200       ],
  [1, 5,   32, 2400,  600, true ],
  [2, 3,  -38, 1900,  100       ],
  [2, 6,   42, 2100,  500, true ],
  [3, 4,   30, 1700,  700       ],
  [3, 6,   55, 2300,  200, true ],
  [4, 6,   68, 2500,  400       ],
  [5, 6,   50, 2800,  900       ],
];

// ── Sub-components ────────────────────────────────────────────────────────────
function ServerIcon({ cx, cy }: { cx: number; cy: number }) {
  const W = 42, RH = 11, GAP = 6, RRX = 3;
  const y1 = cy - GAP / 2 - RH;
  const y2 = cy + GAP / 2;
  return (
    <g>
      <rect x={cx - W / 2} y={y1} width={W} height={RH} rx={RRX}
        fill="rgba(255,255,255,0.18)" />
      <circle cx={cx + W / 2 - 8} cy={y1 + RH / 2} r={3} fill="#14F195" />
      <rect x={cx - W / 2} y={y2} width={W} height={RH} rx={RRX}
        fill="rgba(255,255,255,0.18)" />
      <circle cx={cx + W / 2 - 8} cy={y2 + RH / 2} r={3} fill="#14F195" />
    </g>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function DecentralizedNetworkGraphic() {
  const fwdPaths = EDGES.map(([a, b, bend]) => arcPath(a, b, bend));
  const revPaths = EDGES.map(([a, b, bend]) => revArcPath(a, b, bend));

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto max-w-[610px]"
      role="img"
      aria-label="Decentralised Solana validator network"
    >
      <defs>
        {/* Glow filter shared by packets and satellite dots */}
        <filter id="nw-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <style>{`
          @keyframes nw-dot-pulse {
            0%, 100% { opacity: 0.55; transform: scale(1);    }
            50%       { opacity: 1;    transform: scale(1.40); }
          }
          @keyframes nw-packet {
            from { offset-distance: 0%;   }
            to   { offset-distance: 100%; }
          }
          @keyframes nw-packet-rev {
            from { offset-distance: 100%; }
            to   { offset-distance: 0%;   }
          }
        `}</style>
      </defs>

      {/* ── Dashed arcs ── */}
      {fwdPaths.map((d, i) => (
        <path key={`arc-${i}`} d={d}
          fill="none"
          stroke="rgba(255,255,255,0.20)"
          strokeWidth={1.2}
          strokeDasharray="5 8"
        />
      ))}

      {/* ── Forward packets ── */}
      {fwdPaths.map((d, i) => (
        <circle key={`pkt-fwd-${i}`} r={3.5}
          fill="rgba(255,255,255,0.92)"
          filter="url(#nw-glow)"
          style={{
            offsetPath:   `path('${d}')`,
            offsetRotate: '0deg',
            animation:    `nw-packet ${EDGES[i][3]}ms linear ${EDGES[i][4]}ms infinite`,
          } as React.CSSProperties}
        />
      ))}

      {/* ── Reverse packets (bidirectional edges only) ── */}
      {EDGES.map(([, , , dur, delay, rev], i) =>
        rev ? (
          <circle key={`pkt-rev-${i}`} r={3.5}
            fill="rgba(255,255,255,0.92)"
            filter="url(#nw-glow)"
            style={{
              offsetPath:   `path('${revPaths[i]}')`,
              offsetRotate: '0deg',
              animation:    `nw-packet ${dur}ms linear ${(delay + dur / 2) % 3500}ms infinite`,
            } as React.CSSProperties}
          />
        ) : null
      )}

      {/* ── Nodes ── */}
      {NODES.map(([nx, ny], ni) => (
        <g key={`node-${ni}`}>
          {/* Satellite dots */}
          {dotPositions(ni).map((dot, di) => (
            <circle key={`dot-${ni}-${di}`}
              cx={dot.cx} cy={dot.cy} r={4.5}
              fill="#14F195"
              filter="url(#nw-glow)"
              style={{
                transformBox:    'fill-box',
                transformOrigin: 'center',
                animation: `nw-dot-pulse ${dot.dur} ease-in-out ${dot.delay} infinite`,
              } as React.CSSProperties}
            />
          ))}

          {/* Node box */}
          <rect
            x={nx - NS / 2} y={ny - NS / 2}
            width={NS} height={NS} rx={NRX}
            fill="#12103a"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth={1.5}
          />

          {/* Server icon */}
          <ServerIcon cx={nx} cy={ny} />
        </g>
      ))}
    </svg>
  );
}
