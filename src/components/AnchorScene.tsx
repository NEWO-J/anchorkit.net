import { useRef, useMemo, useState, useEffect, Component, ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
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
// Camera fitting — adjusts fov + y-position so the model sits 10px inside
// the top/bottom edges of whatever container is passed in as containerHeight.
// ---------------------------------------------------------------------------
function CameraFit({
  groupRef,
  containerHeight,
  padding = 10,
  ready,
}: {
  groupRef: React.RefObject<THREE.Group>;
  containerHeight: number;
  padding?: number;
  ready?: React.RefObject<boolean>;
}) {
  const { camera } = useThree();
  const lastH = useRef(-1);

  useFrame(() => {
    if (!groupRef.current) return;
    if (ready && !ready.current) return;

    // Keep resetting until the model (children) has loaded.
    if (groupRef.current.children.length === 0) {
      lastH.current = -1;
      return;
    }

    if (containerHeight <= 0 || containerHeight === lastH.current) return;

    const bbox = new THREE.Box3().setFromObject(groupRef.current);
    if (bbox.isEmpty()) return;

    const modelH = bbox.max.y - bbox.min.y;
    const modelCY = (bbox.max.y + bbox.min.y) / 2;
    const camZ = camera.position.z;

    // fraction of canvas height the model should occupy
    const fill = Math.max(0.05, (containerHeight - 2 * padding) / containerHeight);
    const newFov = 2 * Math.atan(modelH / (2 * camZ * fill)) * (180 / Math.PI);

    (camera as THREE.PerspectiveCamera).fov = newFov;
    camera.position.y = modelCY;
    camera.updateProjectionMatrix();

    lastH.current = containerHeight;
  });

  return null;
}

// Ease-out quint: very fast start, sharp deceleration — used for both spin and grow
function easeOutQuint(t: number): number {
  return 1 - Math.pow(1 - t, 5);
}

const SPIN_DURATION = 1.8;  // seconds — total animation length
const GROW_DELAY    = 0.25; // seconds — spin runs solo before grow starts
const TARGET_SCALE  = 0.65;

// ---------------------------------------------------------------------------
// Scene — runs inside the R3F Canvas
// ---------------------------------------------------------------------------
function Scene({ targetRotY, targetRotX, modelUrl, containerHeight }: { targetRotY: number; targetRotX: number; modelUrl?: string; containerHeight: number }) {
  // outerRef: scale + rotation — its origin IS the spin axis
  const outerRef = useRef<THREE.Group>(null);
  // innerRef: translation-only offset so the model's centre of mass sits at outerRef's origin
  const innerRef = useRef<THREE.Group>(null);

  // 'idle' → wait for model load, 'spinning' → intro animation, 'done' → mouse lerp
  const spinPhase = useRef<'idle' | 'spinning' | 'done'>('idle');
  const spinStart = useRef(0);
  // CameraFit reads this — delays fitting until model is at full scale
  const spinDone = useRef(false);

  useFrame(({ clock }) => {
    if (!outerRef.current || !innerRef.current) return;

    if (spinPhase.current === 'idle') {
      if (outerRef.current.children.length === 0) return;

      // Measure bounding box at full scale so we can centre the inner group.
      // This all happens before the frame is rendered, so the user never sees scale=1.
      outerRef.current.scale.setScalar(TARGET_SCALE);
      outerRef.current.updateMatrixWorld(true);
      const bbox = new THREE.Box3().setFromObject(outerRef.current);
      if (bbox.isEmpty()) return;
      const center = new THREE.Vector3();
      bbox.getCenter(center);
      // Shift the inner group so the model's centre of mass is at outerRef's world origin.
      // center is in world space (with scale applied), so divide by scale to get local offset.
      // We subtract from the existing position rather than replacing it because the bbox
      // center was measured with innerRef already at its initial [0, -2.50, 0] offset.
      const p = innerRef.current.position;
      innerRef.current.position.set(
        p.x - center.x / TARGET_SCALE,
        p.y - center.y / TARGET_SCALE,
        p.z - center.z / TARGET_SCALE,
      );

      outerRef.current.scale.setScalar(0);
      spinPhase.current = 'spinning';
      spinStart.current = clock.getElapsedTime();
    }

    if (spinPhase.current === 'spinning') {
      const elapsed = clock.getElapsedTime() - spinStart.current;
      const spinT = Math.min(elapsed / SPIN_DURATION, 1);

      // Grow starts GROW_DELAY seconds after spin, compressed into the remaining time
      const growElapsed = Math.max(0, elapsed - GROW_DELAY);
      const growT = Math.min(growElapsed / (SPIN_DURATION - GROW_DELAY), 1);

      outerRef.current.rotation.y = easeOutQuint(spinT) * Math.PI * 2;
      outerRef.current.scale.setScalar(easeOutQuint(growT) * TARGET_SCALE);

      // Unlock CameraFit once grow is ~97% done so FOV is correct before the snap
      if (growT >= 0.75 && !spinDone.current) spinDone.current = true;

      if (spinT >= 1) {
        outerRef.current.rotation.y = 0;
        outerRef.current.scale.setScalar(TARGET_SCALE);
        spinPhase.current = 'done';
        spinDone.current = true;
      }
      return;
    }

    // Normal mouse-tracking lerp after spin
    outerRef.current.rotation.y = THREE.MathUtils.lerp(outerRef.current.rotation.y, targetRotY, 0.08);
    outerRef.current.rotation.x = THREE.MathUtils.lerp(outerRef.current.rotation.x, targetRotX, 0.08);
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[-5, 3, 4]} intensity={10.0} />
      <directionalLight position={[2, 0, 2]} intensity={0.8} />

      <group ref={outerRef} scale={[0, 0, 0]}>
        {/* innerRef centres the model's bounding-box midpoint on outerRef's origin */}
        <group ref={innerRef} position={[0, -2.50, 0]}>
          {modelUrl ? <GltfMesh url={modelUrl} /> : <AnchorMesh />}
        </group>
      </group>

      <CameraFit groupRef={outerRef} containerHeight={containerHeight} padding={30} ready={spinDone} />

      <EffectComposer multisampling={0}>
        <AsciiEffectPass />
      </EffectComposer>
    </>
  );
}

// ---------------------------------------------------------------------------
// Public component — mouse-tracking lives here, outside the Canvas
// ---------------------------------------------------------------------------
export default function AnchorScene({ modelUrl, containerHeight = 0 }: { modelUrl?: string; containerHeight?: number } = {}) {
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
          <Scene targetRotY={targetRotY} targetRotX={targetRotX} modelUrl={modelUrl} containerHeight={containerHeight} />
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}
