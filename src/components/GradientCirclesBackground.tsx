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

      const circles = [0, 1, 2, 3].map(i => ({
        cx: startX + i * (RADIUS * 2 + GAP),
        cy: centerY,
        r: RADIUS,
      }));

      for (const { cx, cy, r } of circles) {
        ctx.save();

        // Clip to circle
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.clip();

        // Linear gradient: dark navy at top → dark teal at bottom
        const grad = ctx.createLinearGradient(cx, cy - r, cx, cy + r);
        grad.addColorStop(0, '#0d0b2e');
        grad.addColorStop(0.5, '#0f2a40');
        grad.addColorStop(1, '#1a5060');

        ctx.fillStyle = grad;
        ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

        // Subtle radial darkening at edges for 3D depth
        const radial = ctx.createRadialGradient(cx, cy - r * 0.1, r * 0.1, cx, cy, r);
        radial.addColorStop(0, 'rgba(255,255,255,0)');
        radial.addColorStop(0.7, 'rgba(0,0,0,0)');
        radial.addColorStop(1, 'rgba(0,0,0,0.45)');

        ctx.fillStyle = radial;
        ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

        ctx.restore();
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
