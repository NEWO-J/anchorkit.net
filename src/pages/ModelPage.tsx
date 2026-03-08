import { useRef, useMemo, useState, useEffect, Component, ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer } from '@react-three/postprocessing';
import * as THREE from 'three';
import { ASCIIEffect } from '../lib/AsciiEffect';

// ---------------------------------------------------------------------------
// Error boundary
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
// Procedural anchor mesh (white material for ASCII shader)
// ---------------------------------------------------------------------------
function AnchorMesh() {
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
      <mesh geometry={ringGeo}    material={mat} position={[0, 1.75, 0]} />
      <mesh geometry={shackleGeo} material={mat} position={[0, 1.46, 0]} />
      <mesh geometry={shaftGeo}   material={mat} position={[0, 0.06, 0]} />
      <mesh geometry={crossGeo}   material={mat} position={[0, 0.9, 0]} rotation={[0, 0, Math.PI / 2]} />
      <mesh geometry={capGeo}     material={mat} position={[ 1.1, 0.9, 0]} />
      <mesh geometry={capGeo}     material={mat} position={[-1.1, 0.9, 0]} />
      <mesh geometry={arcGeo}     material={mat} position={[0, -1.35, 0]} rotation={[0, 0, Math.PI]} />
      <mesh geometry={flukeGeo}   material={mat} position={[-0.9, -1.35, 0]} rotation={[0, 0, -Math.PI * 0.6]} />
      <mesh geometry={flukeGeo}   material={mat} position={[ 0.9, -1.35, 0]} rotation={[0, 0,  Math.PI * 0.6]} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Blue ASCII effect pass
// ---------------------------------------------------------------------------
function BlueAsciiPass() {
  const effect = useMemo(
    () =>
      new ASCIIEffect({
        characters: ".:--~==+$@#",
        fontSize: 54,
        cellSize: 12,
        color: '#4488ff',
        invert: false,
      }),
    []
  );
  return <primitive object={effect} dispose={null} />;
}

// ---------------------------------------------------------------------------
// Camera auto-fit
// ---------------------------------------------------------------------------
function CameraFit({ groupRef }: { groupRef: React.RefObject<THREE.Group> }) {
  const { camera } = useThree();
  const fitted = useRef(false);

  useFrame(() => {
    if (fitted.current || !groupRef.current) return;
    if (groupRef.current.children.length === 0) return;

    const bbox = new THREE.Box3().setFromObject(groupRef.current);
    if (bbox.isEmpty()) return;

    const modelH = bbox.max.y - bbox.min.y;
    const modelCY = (bbox.max.y + bbox.min.y) / 2;
    const camZ = camera.position.z;
    const fill = 0.72;
    const newFov = 2 * Math.atan(modelH / (2 * camZ * fill)) * (180 / Math.PI);

    (camera as THREE.PerspectiveCamera).fov = newFov;
    camera.position.y = modelCY;
    camera.updateProjectionMatrix();
    fitted.current = true;
  });

  return null;
}

// ---------------------------------------------------------------------------
// Scene — applies smooth lerp toward target rotation
// ---------------------------------------------------------------------------
function Scene({ rotY, rotX }: { rotY: number; rotX: number }) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, rotY, 0.1);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, rotX, 0.1);
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[-5, 3, 4]} intensity={10.0} />
      <directionalLight position={[2, 0, 2]} intensity={0.8} />

      <group ref={groupRef} scale={[0.65, 0.65, 0.65]} position={[0, -2.50, 0]}>
        <AnchorMesh />
      </group>

      <CameraFit groupRef={groupRef} />

      <EffectComposer multisampling={0}>
        <BlueAsciiPass />
      </EffectComposer>
    </>
  );
}

// ---------------------------------------------------------------------------
// Page — free drag rotation, no clamping
// ---------------------------------------------------------------------------
export default function ModelPage() {
  const [rotY, setRotY] = useState(0);
  const [rotX, setRotX] = useState(0);

  const isDragging   = useRef(false);
  const dragStart    = useRef({ x: 0, y: 0 });
  const rotAtDragStart = useRef({ y: 0, x: 0 });
  const rotRef       = useRef({ y: 0, x: 0 });
  rotRef.current = { y: rotY, x: rotX };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setRotY(rotAtDragStart.current.y + dx * 0.008);
      setRotX(rotAtDragStart.current.x + dy * 0.006);
    };
    const onUp = () => { isDragging.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    rotAtDragStart.current = { y: rotRef.current.y, x: rotRef.current.x };
  };

  return (
    <div className="min-h-screen bg-[#030028] flex flex-col">

      {/* Header */}
      <div className="border-b border-white/[0.08] px-6 py-5 bg-white/[0.03] flex items-center justify-between shrink-0">
        <div>
          <h1 className="font-['DM_Sans',sans-serif] font-bold text-xl text-white leading-tight">Model</h1>
          <p className="font-['DM_Sans',sans-serif] text-xs text-white/40 mt-0.5">Drag to freely pose the anchor</p>
        </div>
        <p className="font-['DM_Sans',sans-serif] text-xs text-white/20">
          {Math.round((rotY * 180) / Math.PI)}°  {Math.round((rotX * 180) / Math.PI)}°
        </p>
      </div>

      {/* Canvas */}
      <div
        className="flex-1"
        style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
        onMouseDown={onMouseDown}
      >
        <CanvasErrorBoundary>
          <Canvas
            gl={{ alpha: true, antialias: false }}
            camera={{ position: [0, 0, 7], fov: 45 }}
            onCreated={({ scene }) => { scene.background = null; }}
            style={{ width: '100%', height: '100%', background: 'transparent' }}
          >
            <Scene rotY={rotY} rotX={rotX} />
          </Canvas>
        </CanvasErrorBoundary>
      </div>

    </div>
  );
}
