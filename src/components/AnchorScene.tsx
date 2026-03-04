import { useRef, useMemo, useState, useEffect, Component, ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer } from '@react-three/postprocessing';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ASCIIEffect } from '../lib/AsciiEffect';

// ---------------------------------------------------------------------------
// Error boundary — keeps a Canvas crash from unmounting the whole React tree
// ---------------------------------------------------------------------------
interface EBState { error: boolean }
class CanvasErrorBoundary extends Component<{ children: ReactNode }, EBState> {
  state: EBState = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  render() {
    if (this.state.error) return null;
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// Procedural anchor geometry (all useMemo at top level)
// ---------------------------------------------------------------------------
function AnchorMesh() {
  // White material maximises greyscale brightness for the ASCII shader.
  // The shader replaces colour with brand purple anyway.
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.3, metalness: 0.1 }),
    []
  );

  const ringGeo    = useMemo(() => new THREE.TorusGeometry(0.28, 0.08, 12, 32), []);
  const shackleGeo = useMemo(() => new THREE.CylinderGeometry(0.06, 0.06, 0.3, 8), []);
  const shaftGeo   = useMemo(() => new THREE.CylinderGeometry(0.1, 0.1, 2.8, 12), []);
  const crossGeo   = useMemo(() => new THREE.CylinderGeometry(0.07, 0.07, 2.2, 8), []);
  const capGeo     = useMemo(() => new THREE.SphereGeometry(0.12, 8, 8), []);
  const arcGeo     = useMemo(() => new THREE.TorusGeometry(0.9, 0.1, 8, 24, Math.PI), []);
  const flukeGeo   = useMemo(() => new THREE.CylinderGeometry(0.08, 0.05, 0.55, 6), []);

  return (
    <group>
      {/* Shackle ring */}
      <mesh geometry={ringGeo}    material={mat} position={[0, 1.75, 0]} />
      {/* Short shackle shaft */}
      <mesh geometry={shackleGeo} material={mat} position={[0, 1.46, 0]} />
      {/* Main shaft — shortened to 2.8 */}
      <mesh geometry={shaftGeo}   material={mat} position={[0, 0.06, 0]} />
      {/* Crossbar */}
      <mesh geometry={crossGeo}   material={mat} position={[0, 0.9, 0]} rotation={[0, 0, Math.PI / 2]} />
      {/* Crossbar caps */}
      <mesh geometry={capGeo}     material={mat} position={[ 1.1, 0.9, 0]} />
      <mesh geometry={capGeo}     material={mat} position={[-1.1, 0.9, 0]} />
      {/* Bottom arc (half torus, rotated π so it opens upward) */}
      <mesh geometry={arcGeo}     material={mat} position={[0, -1.35, 0]} rotation={[0, 0, Math.PI]} />
      {/* Left fluke */}
      <mesh geometry={flukeGeo}   material={mat} position={[-0.9, -1.35, 0]} rotation={[0, 0, -Math.PI * 0.6]} />
      {/* Right fluke */}
      <mesh geometry={flukeGeo}   material={mat} position={[ 0.9, -1.35, 0]} rotation={[0, 0,  Math.PI * 0.6]} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// GLB model loader — renders any user-supplied .glb with the same white mat
// ---------------------------------------------------------------------------
function GltfMesh({ url }: { url: string }) {
  const [scene, setScene] = useState<THREE.Group | null>(null);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load(url, (gltf) => {
      const whiteMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.3, metalness: 0.1 });
      gltf.scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          (child as THREE.Mesh).material = whiteMat;
        }
      });
      setScene(gltf.scene);
    });
  }, [url]);

  if (!scene) return null;
  return <primitive object={scene} scale={5} rotation={[0, Math.PI / 2, 0]} />;
}

// ---------------------------------------------------------------------------
// ASCII post-processing pass
// ---------------------------------------------------------------------------
function AsciiEffectPass() {
  const effect = useMemo(
    () =>
      new ASCIIEffect({
        characters: ".:--~==+$@#",
        fontSize: 54,
        cellSize: 12,
        color: '#fc6b03',
        invert: false,
      }),
    []
  );
  return <primitive object={effect} dispose={null} />;
}

// ---------------------------------------------------------------------------
// Scene — runs inside the R3F Canvas
// ---------------------------------------------------------------------------
function Scene({ targetRotY, targetRotX, modelUrl }: { targetRotY: number; targetRotX: number; modelUrl?: string }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.08);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.08);
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[-5, 3, 4]} intensity={10.0} />
      <directionalLight position={[2, 0, 2]} intensity={0.8} />

      {/* Scale 0.62 keeps the anchor comfortably inside the hero section;
          Y offset −0.2 nudges it slightly downward so the ring isn't clipped */}
      <group ref={groupRef} scale={[0.65, 0.65, 0.65]} position={[0, -2.8, 0]}>
        {modelUrl ? <GltfMesh url={modelUrl} /> : <AnchorMesh />}
      </group>

      <EffectComposer multisampling={0}>
        <AsciiEffectPass />
      </EffectComposer>
    </>
  );
}

// ---------------------------------------------------------------------------
// Public component — mouse-tracking lives here, outside the Canvas
// ---------------------------------------------------------------------------
export default function AnchorScene({ modelUrl }: { modelUrl?: string } = {}) {
  const [targetRotY, setTargetRotY] = useState(0);
  const [targetRotX, setTargetRotX] = useState(0);

  const isDragging = useRef(false);
  const dragStart  = useRef({ x: 0, y: 0 });
  const rotAtDragStart = useRef({ y: 0, x: 0 });
  // Keep a ref so the window listeners can read latest state without stale closure
  const rotRef = useRef({ y: 0, x: 0 });
  rotRef.current = { y: targetRotY, x: targetRotX };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (isDragging.current) {
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        // Clamp Y to ±60° so the anchor can't spin all the way around
        const newY = rotAtDragStart.current.y + dx * 0.006;
        setTargetRotY(Math.max(-1.05, Math.min(1.05, newY)));
        const newX = rotAtDragStart.current.x + dy * 0.004;
        setTargetRotX(Math.max(-0.44, Math.min(0.44, newX)));
      } else {
        // Hover tracks cursor across the full page width
        const x = e.clientX / window.innerWidth;
        setTargetRotY((x - 0.5) * Math.PI * 0.22);
      }
    };
    const onUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      setTargetRotX(0);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  function handleMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    rotAtDragStart.current = { y: rotRef.current.y, x: rotRef.current.x };
  }

  return (
    <div
      style={{ width: '100%', height: '100%', cursor: isDragging.current ? 'grabbing' : 'grab' }}
      onMouseDown={handleMouseDown}
    >
      <CanvasErrorBoundary>
        <Canvas
          gl={{ alpha: true, antialias: false }}
          camera={{ position: [0, 0, 7], fov: 45 }}
          onCreated={({ scene }) => { scene.background = null; }}
          style={{ background: 'transparent' }}
        >
          <Scene targetRotY={targetRotY} targetRotX={targetRotX} modelUrl={modelUrl} />
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}
