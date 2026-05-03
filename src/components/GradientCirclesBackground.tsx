import verifyBg from '../assets/verifybg.png';

export default function GradientCirclesBackground() {
  return (
    <div
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}
    >
      <div style={{
        position: 'absolute',
        inset: '-24px',
        backgroundImage: `url(${verifyBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(12px) saturate(80%)',
      }} />
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(3,0,40,0.80)',
      }} />
    </div>
  );
}
