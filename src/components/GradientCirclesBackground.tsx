export default function GradientCirclesBackground() {
  return (
    <>
      <img
        src="/photo-1765901177316-4aa8870c5e71.jpg"
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          zIndex: 0,
          pointerEvents: 'none',
          filter: 'blur(2px) brightness(0.35)',
          transform: 'scale(1.04)',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(3,0,40,0.55) 0%, rgba(3,0,40,0.3) 50%, rgba(3,0,40,0.7) 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
    </>
  );
}
