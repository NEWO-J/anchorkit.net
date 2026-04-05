import React from 'react';

// ── Geometry ─────────────────────────────────────────────────────────────────
const VW = 620;
const VH = 570;   // extra 60px headroom so top node isn't clipped
const NS = 72;    // node square side
const NRX = 13;   // corner radius

type Pt = [number, number];

const NODES: Pt[] = [
  [305,  70],   // 0 top-centre
  [ 68, 207],   // 1 left
  [248, 270],   // 2 centre
  [450, 180],   // 3 right-upper
  [562, 265],   // 4 far-right
  [110, 405],   // 5 bottom-left
  [410, 463],   // 6 bottom-right
];

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
  [0, 1,  -75, 4400,    0, true ],
  [0, 2,  -50, 4000,  800       ],
  [0, 3,  -55, 3600,  400, true ],
  [0, 4, -100, 5200,  200       ],
  [1, 2,   28, 3200,  300, true ],
  [1, 3,  -85, 6000, 1200       ],
  [1, 5,   32, 4800,  600, true ],
  [2, 3,  -38, 3800,  100       ],
  [2, 6,   42, 4200,  500, true ],
  [3, 4,   30, 3400,  700       ],
  [3, 6,   55, 4600,  200, true ],
  [4, 6,   68, 5000,  400       ],
  [5, 6,   50, 5600,  900       ],
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
      <circle cx={cx + W / 2 - 8} cy={y1 + RH / 2} r={3} fill="#7b9ec0" />
      <rect x={cx - W / 2} y={y2} width={W} height={RH} rx={RRX}
        fill="rgba(255,255,255,0.18)" />
      <circle cx={cx + W / 2 - 8} cy={y2 + RH / 2} r={3} fill="#7b9ec0" />
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
