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

      const spheres = [-1, 0, 1, 2, 3, 4].map(i => ({
        cx: startX + i * step,
        cy: centerY,
        r: RADIUS,
      }));

      const cols = Math.ceil(W / PIXEL);
      const rows = Math.ceil(H / PIXEL);

      for (let row = 0; row < rows; row++) {
        const py = (row + 0.5) * PIXEL;
        for (let col = 0; col < cols; col++) {
          const px = (col + 0.5) * PIXEL;

          let brightness = 0;

          for (const { cx, cy, r } of spheres) {
            const dx = px - cx;
            const dy = py - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist >= r) continue;

            // Dark at top (normY=0), bright at bottom (normY=1)
            const normY = (dy / r + 1) / 2;
            brightness = normY;
            break;
          }

          if (brightness <= 0) continue;

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
