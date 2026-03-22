import React from 'react';
import beachImg from '../assets/beach.jpg';

export default function PhoneParallax() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [parallaxPx, setParallaxPx] = React.useState(0);

  React.useEffect(() => {
    function update() {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const viewportCenter = window.innerHeight / 2;
      // How far the element center is from viewport center, normalized
      const offset = centerY - viewportCenter;
      // Shift image up (positive offset = element below center = early scroll)
      setParallaxPx(offset * 0.18);
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        minHeight: '460px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: '1200px',
      }}
    >
      {/* Phone shell */}
      <div
        style={{
          position: 'relative',
          width: 'clamp(120px, 16vw, 210px)',
          aspectRatio: '9 / 19.5',
          backgroundColor: '#000a2d',
          borderRadius: 'clamp(16px, 2vw, 28px)',
          boxShadow: [
            '0 0 0 1.5px #0f2060',
            '12px 28px 70px rgba(0,8,40,0.75)',
            '-6px -6px 24px rgba(20,50,180,0.07)',
            'inset 0 1px 0 rgba(255,255,255,0.06)',
          ].join(', '),
          transform: 'perspective(1200px) rotateY(-12deg) rotateX(4deg)',
          willChange: 'transform',
        }}
      >
        {/* Volume buttons (left) */}
        <div style={{ position: 'absolute', left: '-2.5px', top: '19%', width: '2.5px', height: '6%', background: '#0b1845', borderRadius: '2px 0 0 2px' }} />
        <div style={{ position: 'absolute', left: '-2.5px', top: '27%', width: '2.5px', height: '6%', background: '#0b1845', borderRadius: '2px 0 0 2px' }} />
        {/* Power button (right) */}
        <div style={{ position: 'absolute', right: '-2.5px', top: '24%', width: '2.5px', height: '11%', background: '#0b1845', borderRadius: '0 2px 2px 0' }} />

        {/* Dynamic island */}
        <div
          style={{
            position: 'absolute',
            top: '2.2%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '26%',
            height: '3.2%',
            background: '#00030a',
            borderRadius: '100px',
            zIndex: 4,
          }}
        />

        {/* Screen (clipping container) */}
        <div
          style={{
            position: 'absolute',
            inset: '1.2%',
            borderRadius: 'clamp(10px, 1.4vw, 20px)',
            overflow: 'hidden',
            background: '#000',
          }}
        >
          {/* Beach image — taller than the screen for parallax travel */}
          <img
            src={beachImg}
            alt=""
            aria-hidden
            draggable={false}
            style={{
              width: '100%',
              height: '160%',
              objectFit: 'cover',
              objectPosition: 'center center',
              transform: `translateY(calc(-15% + ${parallaxPx}px))`,
              willChange: 'transform',
              userSelect: 'none',
              display: 'block',
            }}
          />
          {/* Subtle screen glare overlay for depth */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 55%)',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Home indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: '1%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '27%',
            height: '0.5%',
            background: 'rgba(255,255,255,0.22)',
            borderRadius: '100px',
            zIndex: 4,
          }}
        />
      </div>
    </div>
  );
}
