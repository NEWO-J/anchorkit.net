import React from 'react';

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

      // Circle layout — 4 circles centered
      const RADIUS = Math.min(Math.floor(W / 8.5), 110);
      const GAP = Math.floor(RADIUS * 0.12);
      const totalW = 4 * RADIUS * 2 + 3 * GAP;
      const startX = (W - totalW) / 2 + RADIUS;
      const centerY = H / 2;

      const spheres = [0, 1, 2, 3].map(i => ({
        cx: startX + i * (RADIUS * 2 + GAP),
        cy: centerY,
        r: RADIUS,
      }));

      // Halftone cell size
      const CELL = 7;
      const cols = Math.ceil(W / CELL);
      const rows = Math.ceil(H / CELL);

      for (let row = 0; row < rows; row++) {
        const py = (row + 0.5) * CELL;
        for (let col = 0; col < cols; col++) {
          const px = (col + 0.5) * CELL;

          let brightness = 0;

          for (const { cx, cy, r } of spheres) {
            const dx = px - cx;
            const dy = py - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist >= r) continue;

            // normY: 0 = top, 1 = bottom
            const normY = (dy / r + 1) / 2;
            // normDist: 0 = center, 1 = edge
            const normDist = dist / r;

            // Brighter toward center-bottom, darker at top and edges
            brightness = (1 - normDist * normDist) * (0.25 + 0.75 * normY);
            brightness = Math.max(0, Math.min(1, brightness));
            break;
          }

          if (brightness <= 0.01) continue;

          // Dot radius scales with brightness — halftone effect
          const dotR = (CELL / 2) * brightness;
          if (dotR < 0.4) continue;

          // Color: dark navy (#0d0b2e) → teal (#1a5060) interpolated by brightness
          const r = Math.round(13 + 13 * brightness);
          const g = Math.round(11 + 69 * brightness);
          const b = Math.round(46 + 50 * brightness);

          ctx.beginPath();
          ctx.arc(px, py, dotR, 0, Math.PI * 2);
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fill();
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
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
