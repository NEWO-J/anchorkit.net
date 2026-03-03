import { useRef, useMemo, useState, Component, ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer } from '@react-three/postprocessing';
import * as THREE from 'three';
import { ASCIIEffect } from '../lib/AsciiEffect';

// ---------------------------------------------------------------------------
// Error boundary — keeps a Canvas crash from unmounting the whole React tree
// ---------------------------------------------------------------------------
interface EBState { error: boolean }
class CanvasErrorBoundary extends Component<{ children: ReactNode }, EBState> {
  state: EBState = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  render() {
    // If Canvas throws, render nothing rather than blanking the whole page
    if (this.state.error) return null;
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// Procedural anchor geometry
// All geometry + material created with useMemo at top level (no hooks in loops)
// ---------------------------------------------------------------------------
function AnchorMesh({ groupRef }: { groupRef: React.RefObject<THREE.Group | null> }) {
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#7b75be', roughness: 0.4, metalness: 0.6 }),
    []
  );

  const ringGeo    = useMemo(() => new THREE.TorusGeometry(0.28, 0.08, 12, 32), []);
  const shackleGeo = useMemo(() => new THREE.CylinderGeometry(0.06, 0.06, 0.3, 8), []);
  const shaftGeo   = useMemo(() => new THREE.CylinderGeometry(0.1, 0.1, 3.6, 12), []);
  const crossGeo   = useMemo(() => new THREE.CylinderGeometry(0.07, 0.07, 2.2, 8), []);
  const capGeo     = useMemo(() => new THREE.SphereGeometry(0.12, 8, 8), []);
  const arcGeo     = useMemo(() => new THREE.TorusGeometry(0.9, 0.1, 8, 24, Math.PI), []);
  const flukeGeo   = useMemo(() => new THREE.CylinderGeometry(0.08, 0.05, 0.55, 6), []);

  return (
    <group ref={groupRef}>
      <mesh geometry={ringGeo} material={mat} position={[0, 2.15, 0]} />
      <mesh geometry={shackleGeo} material={mat} position={[0, 1.8, 0]} />
      <mesh geometry={shaftGeo} material={mat} position={[0, 0, 0]} />
      <mesh geometry={crossGeo} material={mat} position={[0, 1.0, 0]} rotation={[0, 0, Math.PI / 2]} />
      <mesh geometry={capGeo} material={mat} position={[ 1.1, 1.0, 0]} />
      <mesh geometry={capGeo} material={mat} position={[-1.1, 1.0, 0]} />
      <mesh geometry={arcGeo} material={mat} position={[0, -1.5, 0]} rotation={[0, 0, Math.PI]} />
      <mesh geometry={flukeGeo} material={mat} position={[-0.9, -1.5, 0]} rotation={[0, 0, -Math.PI * 0.6]} />
      <mesh geometry={flukeGeo} material={mat} position={[0.9, -1.5, 0]} rotation={[0, 0, Math.PI * 0.6]} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// ASCII post-processing pass
// ---------------------------------------------------------------------------
function AsciiEffectPass() {
  const effect = useMemo(
    () =>
      new ASCIIEffect({
        characters: ' .:-=+*#%@',
        fontSize: 54,
        cellSize: 16,
        color: '#7b75be',
        invert: false,
      }),
    []
  );
  return <primitive object={effect} dispose={null} />;
}

// ---------------------------------------------------------------------------
// Scene — lives inside Canvas so R3F hooks are available
// ---------------------------------------------------------------------------
function Scene({ targetRotation }: { targetRotation: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotation,
      0.08
    );
  });

  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 5, 5]} intensity={2} />
      <directionalLight position={[-5, 0, 3]} intensity={0.8} />
      <AnchorMesh groupRef={groupRef} />
      <EffectComposer multisampling={0}>
        <AsciiEffectPass />
      </EffectComposer>
    </>
  );
}

// ---------------------------------------------------------------------------
// Public component — click handler lives here, outside the Canvas
// ---------------------------------------------------------------------------
export default function AnchorScene() {
  const [targetRotation, setTargetRotation] = useState(0);

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    setTargetRotation(r =>
      r + (e.clientX - left < width / 2 ? -Math.PI / 6 : Math.PI / 6)
    );
  }

  return (
    <div
      style={{ width: '100%', height: '100%', cursor: 'pointer' }}
      title="Click to rotate"
      onClick={handleClick}
    >
      <CanvasErrorBoundary>
        <Canvas
          gl={{ alpha: true, antialias: false }}
          camera={{ position: [0, 0, 7], fov: 45 }}
          onCreated={({ scene }) => { scene.background = null; }}
          style={{ background: 'transparent' }}
        >
          <Scene targetRotation={targetRotation} />
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}
