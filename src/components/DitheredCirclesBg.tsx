import { useEffect, useRef } from 'react';

// 8×8 Bayer ordered dithering matrix (values 0–63)
const B8: number[][] = [
  [ 0, 32,  8, 40,  2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44,  4, 36, 14, 46,  6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [ 3, 35, 11, 43,  1, 33,  9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47,  7, 39, 13, 45,  5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

export default function DitheredCirclesBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      canvas.width  = W;
      canvas.height = H;

      const ctx = canvas.getContext('2d')!;
      const img = ctx.createImageData(W, H);
      const d   = img.data;

      // Background: #030028
      const bgR = 3,  bgG = 0,  bgB = 40;
      // Circle "on" pixel colour — slate blue
      const fgR = 42, fgG = 74, fgB = 132;

      const N      = 4;
      const radius = H * 0.55;         // large — partially cropped at top
      const cy     = 0;                // centers sit right at the top edge
      // evenly space the 4 circle centres across the full width
      const slotW  = W / N;
      const cxArr  = [slotW * 0.5, slotW * 1.5, slotW * 2.5, slotW * 3.5];
      const R2     = radius * radius;

      for (let y = 0; y < H; y++) {
        const row = y * W * 4;
        for (let x = 0; x < W; x++) {
          // bayer threshold for this pixel (0 … <1)
          const thresh = B8[y & 7][x & 7] / 64;

          let maxA = 0;
          for (let c = 0; c < N; c++) {
            const dx = x - cxArr[c];
            const dy = y - cy;
            const d2 = dx * dx + dy * dy;
            if (d2 >= R2) continue;

            const t = Math.sqrt(d2) / radius; // 0 at centre → 1 at edge
            // sin gives: 0 at centre, peaks at t=0.5, 0 at edge
            // → dark top cap, bright mid-ring, dithered out at edge
            const a = Math.sin(t * Math.PI) * 0.92;
            if (a > maxA) maxA = a;
          }

          const i = row + x * 4;
          if (maxA > thresh) {
            d[i]   = fgR;
            d[i+1] = fgG;
            d[i+2] = fgB;
          } else {
            d[i]   = bgR;
            d[i+1] = bgG;
            d[i+2] = bgB;
          }
          d[i+3] = 255;
        }
      }

      ctx.putImageData(img, 0, 0);
    };

    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
