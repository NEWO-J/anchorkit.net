import React from 'react';

/**
 * Full-screen background with a horizontal row of dithered gradient circles,
 * matching the dark navy aesthetic of the AnchorKit auth pages.
 */
export default function GradientCirclesBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', inset: 0 }}
      >
        <defs>
          {/* Dithering noise filter */}
          <filter id="gc-dither" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix
              type="saturate"
              values="0"
              in="noise"
              result="greyNoise"
            />
            <feBlend
              in="SourceGraphic"
              in2="greyNoise"
              mode="overlay"
              result="blended"
            />
            <feComposite in="blended" in2="SourceGraphic" operator="in" />
          </filter>

          {/* Gradient for each circle: dark navy at top, slightly lighter teal-blue at bottom */}
          <radialGradient id="gc-grad-0" cx="50%" cy="65%" r="55%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#0d3040" stopOpacity="1" />
            <stop offset="45%"  stopColor="#081e30" stopOpacity="1" />
            <stop offset="100%" stopColor="#030028" stopOpacity="1" />
          </radialGradient>
          <radialGradient id="gc-grad-1" cx="50%" cy="65%" r="55%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#0b3540" stopOpacity="1" />
            <stop offset="45%"  stopColor="#071c2e" stopOpacity="1" />
            <stop offset="100%" stopColor="#030028" stopOpacity="1" />
          </radialGradient>
          <radialGradient id="gc-grad-2" cx="50%" cy="65%" r="55%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#0a3840" stopOpacity="1" />
            <stop offset="45%"  stopColor="#061a2c" stopOpacity="1" />
            <stop offset="100%" stopColor="#030028" stopOpacity="1" />
          </radialGradient>
          <radialGradient id="gc-grad-3" cx="50%" cy="65%" r="55%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#0a3a42" stopOpacity="1" />
            <stop offset="45%"  stopColor="#05192b" stopOpacity="1" />
            <stop offset="100%" stopColor="#030028" stopOpacity="1" />
          </radialGradient>
        </defs>

        {/*
          Four circles centered horizontally, placed in the upper-middle area.
          Using viewBox-relative positioning via <svg> foreignObject approach
          would need absolute pixel sizes, so instead we use percentage-based
          <circle> elements in a nested <svg> with a fixed viewBox.
        */}
        <svg
          viewBox="0 0 820 260"
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          style={{ position: 'absolute', top: '5%', left: 0 }}
        >
          {/* Circle 0 */}
          <circle cx="105" cy="130" r="100" fill="url(#gc-grad-0)" filter="url(#gc-dither)" />
          {/* Circle 1 */}
          <circle cx="315" cy="130" r="100" fill="url(#gc-grad-1)" filter="url(#gc-dither)" />
          {/* Circle 2 */}
          <circle cx="525" cy="130" r="100" fill="url(#gc-grad-2)" filter="url(#gc-dither)" />
          {/* Circle 3 */}
          <circle cx="715" cy="130" r="100" fill="url(#gc-grad-3)" filter="url(#gc-dither)" />
        </svg>
      </svg>
    </div>
  );
}
