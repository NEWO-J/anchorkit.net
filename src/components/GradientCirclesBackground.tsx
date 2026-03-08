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

      // Background: #030028
      ctx.fillStyle = '#030028';
      ctx.fillRect(0, 0, W, H);

      // Circle layout — 4 circles centered + 1 partial on each side
      const RADIUS = Math.min(Math.floor(W / 8.5), 110);
      const GAP = Math.floor(RADIUS * 0.12);
      const totalW = 4 * RADIUS * 2 + 3 * GAP;
      const startX = (W - totalW) / 2 + RADIUS;
      const centerY = H / 2;
      const step = RADIUS * 2 + GAP;

      const bigSpheres = [-1, 0, 1, 2, 3, 4].map(i => ({
        cx: startX + i * step,
        cy: centerY,
        r: RADIUS,
      }));

      // Small spheres nestled in the top gap between each adjacent pair, shifted up 10px
      const sr = RADIUS * 0.22;
      // Tangent to both neighbours: y = sqrt((R+sr)² - (step/2)²)
      const smallOffY = Math.sqrt(Math.max(0, (RADIUS + sr) ** 2 - (step / 2) ** 2));
      const smallSpheres = [-1, 0, 1, 2, 3].map(i => ({
        cx: startX + (i + 0.5) * step,
        cy: centerY - smallOffY - 13,
        r: sr,
      }));

      // Crossbars: short pill stubs that poke ~1/4 radius into each circle from the inner edge
      const barY = centerY - 15;
      const barHalfH = RADIUS * 0.09;
      // half-width = half-gap + 1/4 radius (stays within the inner quarter of each circle)
      const barHalfW = GAP / 2 + RADIUS * 0.25;
      const crossbars = bigSpheres.slice(0, -1).map((sL, i) => ({
        midX: (sL.cx + bigSpheres[i + 1].cx) / 2,
      }));

      /** Returns true if (px,py) is inside a pill centred at (midX, barY) */
      function inBar(px: number, py: number, midX: number): boolean {
        const ry = py - barY;
        if (Math.abs(ry) > barHalfH) return false;
        const rx = Math.abs(px - midX);
        if (rx <= barHalfW - barHalfH) return true;
        // rounded caps
        return rx <= barHalfW && Math.hypot(rx - (barHalfW - barHalfH), ry) <= barHalfH;
      }

      // --- Pass 1: big spheres at normal pixel size ---
      const cols = Math.ceil(W / PIXEL);
      const rows = Math.ceil(H / PIXEL);

      for (let row = 0; row < rows; row++) {
        const py = (row + 0.5) * PIXEL;
        for (let col = 0; col < cols; col++) {
          const px = (col + 0.5) * PIXEL;

          let brightness = 0;
          for (const { cx, cy, r } of bigSpheres) {
            const dx = px - cx;
            const dy = py - cy;
            if (dx * dx + dy * dy >= r * r) continue;
            brightness = (dy / r + 1) / 2;
            break;
          }
          if (brightness <= 0) continue;

          // Skip crossbar regions (leaves dark notch)
          if (crossbars.some(({ midX }) => inBar(px, py, midX))) continue;

          const threshold = (bayer[row % BAYER_SIZE][col % BAYER_SIZE] + 0.5) / BAYER_MAX;
          if (brightness <= threshold) continue;

          ctx.fillStyle = 'rgb(5,10,68)';
          ctx.fillRect(col * PIXEL, row * PIXEL, PIXEL, PIXEL);
        }
      }

      // --- Pass 2: small spheres at 30% finer pixel size ---
      const PS = Math.round(PIXEL * 0.7); // ≈ 3-4px dots
      const scols = Math.ceil(W / PS);
      const srows = Math.ceil(H / PS);

      for (let row = 0; row < srows; row++) {
        const py = (row + 0.5) * PS;
        for (let col = 0; col < scols; col++) {
          const px = (col + 0.5) * PS;

          let brightness = 0;
          for (const { cx, cy, r } of smallSpheres) {
            const dx = px - cx;
            const dy = py - cy;
            if (dx * dx + dy * dy >= r * r) continue;
            brightness = (dy / r + 1) / 2;
            break;
          }
          if (brightness <= 0) continue;

          const threshold = (bayer[row % BAYER_SIZE][col % BAYER_SIZE] + 0.5) / BAYER_MAX;
          if (brightness <= threshold) continue;

          ctx.fillStyle = 'rgb(5,10,68)';
          ctx.fillRect(col * PS, row * PS, PS, PS);
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
