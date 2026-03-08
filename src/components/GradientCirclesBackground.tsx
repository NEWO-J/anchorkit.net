import React from 'react';

const PIXEL = 5;
const BAYER_SIZE = 8;
const BAYER_MAX = 64;

const bayer = [
  [ 0,32, 8,40, 2,34,10,42],
  [48,16,56,24,50,18,58,26],
  [12,44, 4,36,14,46, 6,38],
  [60,28,52,20,62,30,54,22],
  [ 3,35,11,43, 1,33, 9,41],
  [51,19,59,27,49,17,57,25],
  [15,47, 7,39,13,45, 5,37],
  [63,31,55,23,61,29,53,21],
];

function distToSeg(
  px: number, py: number,
  ax: number, ay: number,
  bx: number, by: number,
): number {
  const dx = bx - ax, dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - ax, py - ay);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/** Returns true if (px,py) is inside the anchor silhouette for this circle */
function inAnchor(px: number, py: number, cx: number, cy: number, r: number): boolean {
  // Ring (the circle itself)
  if ((px - cx) ** 2 + (py - cy) ** 2 <= r * r) return true;

  // Shaft — thin vertical bar going down from ring
  const shaftW = r * 0.15;
  if (Math.abs(px - cx) <= shaftW && py >= cy - r * 0.1 && py <= cy + r * 2.5) return true;

  // Stock / crossbar — wide horizontal bar just below the ring
  const crossY1 = cy + r * 0.18;
  const crossY2 = cy + r * 0.46;
  if (Math.abs(px - cx) <= r * 0.92 && py >= crossY1 && py <= crossY2) return true;

  // Flukes — diagonal arms from shaft bottom up to the sides
  const flukeW = r * 0.21;
  const shaftBase = cy + r * 2.5;
  const flukeTipY = cy + r * 1.65;
  const flukeTipX = r * 1.05;
  if (distToSeg(px, py, cx, shaftBase, cx - flukeTipX, flukeTipY) <= flukeW) return true;
  if (distToSeg(px, py, cx, shaftBase, cx + flukeTipX, flukeTipY) <= flukeW) return true;

  // Bill tips — small circles at the ends of the flukes
  if (Math.hypot(px - (cx - flukeTipX), py - flukeTipY) <= flukeW * 1.1) return true;
  if (Math.hypot(px - (cx + flukeTipX), py - flukeTipY) <= flukeW * 1.1) return true;

  return false;
}

export default function GradientCirclesBackground() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function draw() {
      if (!canvas) return;
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      if (W === 0 || H === 0) return;
      canvas.width = W;
      canvas.height = H;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Background
      ctx.fillStyle = '#030028';
      ctx.fillRect(0, 0, W, H);

      // Circle / anchor layout — 4 centered + 1 partial on each side
      const RADIUS = Math.min(Math.floor(W / 8.5), 110);
      const GAP = Math.floor(RADIUS * 0.12);
      const totalW = 4 * RADIUS * 2 + 3 * GAP;
      const startX = (W - totalW) / 2 + RADIUS;
      const centerY = H / 2;
      const step = RADIUS * 2 + GAP;

      const anchors = [-1, 0, 1, 2, 3, 4].map(i => ({
        cx: startX + i * step,
        cy: centerY,
        r: RADIUS,
      }));

      const cols = Math.ceil(W / PIXEL);
      const rows = Math.ceil(H / PIXEL);
      // Dot field extends vertically: from above rings to below fluke tips
      const bandTop = centerY - RADIUS * 1.15;
      const bandBot = centerY + RADIUS * 2.8;
      const bandH = bandBot - bandTop;

      for (let row = 0; row < rows; row++) {
        const py = (row + 0.5) * PIXEL;

        // Vertical fade — full brightness in the middle of the band, fades at edges
        const vy = py - bandTop;
        if (vy < 0 || vy > bandH) continue;
        // Bright across most of the band, fade at very top and bottom
        const fadeT = vy / bandH;
        const vertFade = Math.min(1, Math.min(fadeT / 0.12, (1 - fadeT) / 0.1));
        const brightness = 0.74 * vertFade;
        if (brightness <= 0) continue;

        for (let col = 0; col < cols; col++) {
          const px = (col + 0.5) * PIXEL;

          // Anchor silhouette = dark negative space
          let skip = false;
          for (const { cx, cy: acy, r } of anchors) {
            if (inAnchor(px, py, cx, acy, r)) { skip = true; break; }
          }
          if (skip) continue;

          const threshold = (bayer[row % BAYER_SIZE][col % BAYER_SIZE] + 0.5) / BAYER_MAX;
          if (brightness <= threshold) continue;

          ctx.fillStyle = 'rgb(5,10,68)';
          ctx.fillRect(col * PIXEL, row * PIXEL, PIXEL, PIXEL);
        }
      }
    }

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        imageRendering: 'pixelated',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
