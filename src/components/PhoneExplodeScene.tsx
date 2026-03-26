import { useRef, useState, useEffect, Component, ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// ---------------------------------------------------------------------------
// Error boundary
// ---------------------------------------------------------------------------
class CanvasErrorBoundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  render() {
    if (this.state.error) return null;
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// Easing
// ---------------------------------------------------------------------------
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ---------------------------------------------------------------------------
// Animation timing (seconds)
// ---------------------------------------------------------------------------
const HOLD_ASSEMBLED   = 1.5;
const EXPLODE_DURATION = 1.6;
const HOLD_EXPLODED    = 2.4;
const COLLAPSE_DURATION = 1.4;
const CYCLE = HOLD_ASSEMBLED + EXPLODE_DURATION + HOLD_EXPLODED + COLLAPSE_DURATION;

// ---------------------------------------------------------------------------
// Component-group prefix — matches GLTF node names like "g battery_00", "g Display_00"
// GLTF preserves original names with space after "g"
const GROUP_PREFIX_RE = /^g ([a-zA-Z_]+?)(?:_\d+)?$/;

// ---------------------------------------------------------------------------
// Per-group explode data
// ---------------------------------------------------------------------------
interface GroupInfo {
  group: THREE.Group;
  origPos: THREE.Vector3;
  explodePos: THREE.Vector3;
}

// ---------------------------------------------------------------------------
// Material config — keyed by GLTF material name (25 named materials preserved)
// ---------------------------------------------------------------------------
interface MatConfig {
  map?: string;
  bumpMap?: string;
  roughnessMap?: string;
  color?: string;
  roughness: number;
  metalness: number;
  transparent?: boolean;
  opacity?: number;
}

// Maps each GLTF material name → PBR config + optional textures
const MAT_CONFIGS: Record<string, MatConfig> = {
  battery:      { map: '/ipx_batterydiffuse.jpg',                                                roughness: 0.55, metalness: 0.2 },
  internalmetal:{ color: '#7a7a82',                                                               roughness: 0.15, metalness: 0.9 },
  board:        { map: '/ipx_PCB_diffuse.jpg',  bumpMap: '/ipx_PCB_bump.jpg',                   roughness: 0.7,  metalness: 0.15 },
  sheets:       { map: '/ipx_metalsheets_diffuse.jpg', bumpMap: '/ipx_metalsheets_bump.jpg',    roughness: 0.25, metalness: 0.8 },
  mesh:         { color: '#1a1a1a',                                                               roughness: 0.55, metalness: 0.3 },
  black:        { color: '#0f0f0f',                                                               roughness: 0.25, metalness: 0.15 },
  components:   { color: '#2a3830',                                                               roughness: 0.45, metalness: 0.5 },
  glasslens:    { map: '/ipx_lens.jpg',                  transparent: true, opacity: 0.82,       roughness: 0.06, metalness: 0.1 },
  sensor:       { color: '#14141e',                                                               roughness: 0.2,  metalness: 0.4 },
  flexPCB:      { map: '/circuitboards_diffuse.JPG',                                             roughness: 0.65, metalness: 0.2 },
  gold:         { color: '#c8960c',                                                               roughness: 0.12, metalness: 0.92 },
  spacersilver: { color: '#b4b4be',                                                               roughness: 0.18, metalness: 0.88 },
  board3:       { map: '/ipx_PCBdark_diffuse.jpg',                                               roughness: 0.7,  metalness: 0.15 },
  flexPCB2:     { map: '/circuitboards_diffuse.JPG',                                             roughness: 0.65, metalness: 0.2 },
  flexPCB3:     { map: '/circuitboards_diffuse.JPG',                                             roughness: 0.65, metalness: 0.2 },
  flexPCB4:     { map: '/circuitboards_diffuse.JPG',                                             roughness: 0.65, metalness: 0.2 },
  flexPCB5:     { map: '/circuitboards_diffuse.JPG',                                             roughness: 0.65, metalness: 0.2 },
  flexPCB6:     { map: '/circuitboards_diffuse.JPG',                                             roughness: 0.65, metalness: 0.2 },
  logos:        { color: '#d0d0d8',                                                               roughness: 0.08, metalness: 0.85 },
  flashglass:   { color: '#dde8f0',               transparent: true, opacity: 0.65,             roughness: 0.04, metalness: 0.05 },
  flash:        { map: '/ipx_flash.jpg',                                                          roughness: 0.12, metalness: 0.3 },
  camedge:      { color: '#2a2a2e',                                                               roughness: 0.18, metalness: 0.75 },
  board2:       { map: '/ipx_PCBdark_diffuse.jpg',                                               roughness: 0.7,  metalness: 0.15 },
  blue:         { map: '/ipx_lens_blue.jpg',             transparent: true, opacity: 0.88,       roughness: 0.08, metalness: 0.15 },
  glassfront:   { map: '/ipx_S1_diffuse.jpg',            transparent: true, opacity: 0.85,       roughness: 0.05, metalness: 0.05 },
};

// Z-offset controls front↔back explode layering (-1 = back, +1 = front)
const GROUP_Z: Record<string, number> = {
  Display:      1.0,
  phone_:       0.7,
  body:         0.4,
  plastictop:   0.25,
  bottom:       0.1,
  USB:         -0.1,
  battery:     -0.3,
  camera:      -0.5,
  doublecamera:-0.6,
  processor:   -0.7,
  PCB:         -0.8,
  wirelesscoil:-1.0,
};

function makeMat(cfg: MatConfig): THREE.MeshStandardMaterial {
  const loader = new THREE.TextureLoader();
  const ct = (url: string) => { const t = loader.load(url); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const lt = (url: string) => loader.load(url);
  const mat = new THREE.MeshStandardMaterial({
    roughness: cfg.roughness,
    metalness: cfg.metalness,
    transparent: cfg.transparent ?? false,
    opacity: cfg.opacity ?? 1,
    depthWrite: !(cfg.transparent ?? false),
  });
  if (cfg.color)       mat.color.set(cfg.color);
  if (cfg.map)         mat.map         = ct(cfg.map);
  if (cfg.bumpMap)     mat.bumpMap     = lt(cfg.bumpMap);
  if (cfg.roughnessMap)mat.roughnessMap = lt(cfg.roughnessMap);
  return mat;
}

const DEFAULT_MAT = new THREE.MeshStandardMaterial({ color: '#9098a8', roughness: 0.5, metalness: 0.3 });

// ---------------------------------------------------------------------------
// Shared blue-glow material for the processor — emissiveIntensity animated in useFrame
// ---------------------------------------------------------------------------
const PROCESSOR_MAT = new THREE.MeshStandardMaterial({
  color:             '#1a2a44',
  emissive:          new THREE.Color('#0055ff'),
  emissiveIntensity: 0,
  roughness:         0.25,
  metalness:         0.7,
});

// ---------------------------------------------------------------------------
// Main 3-D scene component
// ---------------------------------------------------------------------------
function PhoneModel({ url }: { url: string }) {
  const pivotRef        = useRef<THREE.Group>(null);
  const processorMeshes = useRef<THREE.Mesh[]>([]);
  const [groups, setGroups]                 = useState<GroupInfo[]>([]);
  const [containerGroup, setContainerGroup] = useState<THREE.Group | null>(null);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        const root = gltf.scene;

        // Build per-GLTF-material-name material cache
        const matCache = new Map<string, THREE.MeshStandardMaterial>();
        Object.entries(MAT_CONFIGS).forEach(([name, cfg]) => {
          matCache.set(name, makeMat(cfg));
        });

        // Walk down single-child wrappers to find the flat mesh list
        // GLTF: scene(empty_1) → empty_2(4479 children)
        let meshParent: THREE.Object3D = root;
        while (meshParent.children.length === 1) {
          meshParent = meshParent.children[0];
        }

        // Group flat children by node-name prefix
        const prefixMap = new Map<string, THREE.Group>();
        const children = [...meshParent.children];
        const procMeshes: THREE.Mesh[] = [];

        children.forEach((child) => {
          const m = child.name.match(GROUP_PREFIX_RE);
          const prefix = m ? m[1] : '__other__';
          if (!prefixMap.has(prefix)) {
            const g = new THREE.Group();
            g.name = prefix;
            prefixMap.set(prefix, g);
          }
          prefixMap.get(prefix)!.add(child);
        });

        // Assign materials per mesh using GLTF material name
        prefixMap.forEach((compGroup, prefix) => {
          compGroup.traverse((child) => {
            const mesh = child as THREE.Mesh;
            if (!mesh.isMesh) return;

            if (prefix === 'processor') {
              // Special emissive glow for processor
              mesh.material = PROCESSOR_MAT;
              procMeshes.push(mesh);
              return;
            }

            // Read GLTF material name assigned by the loader
            const gltfMat = Array.isArray(mesh.material)
              ? (mesh.material[0] as THREE.Material)
              : (mesh.material as THREE.Material);
            const matName = gltfMat?.name ?? '';
            mesh.material = matCache.get(matName) ?? DEFAULT_MAT;
          });
        });
        processorMeshes.current = procMeshes;

        // Build container
        const container = new THREE.Group();
        prefixMap.forEach((g) => container.add(g));

        // Fit + centre
        const overallBox = new THREE.Box3().setFromObject(container);
        if (overallBox.isEmpty()) return;
        const size = new THREE.Vector3();
        overallBox.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetSize = 3.5;
        const scale = maxDim > 0 ? targetSize / maxDim : 1;

        container.scale.setScalar(scale);
        const scaledBox = new THREE.Box3().setFromObject(container);
        const scaledCenter = new THREE.Vector3();
        scaledBox.getCenter(scaledCenter);
        container.position.sub(scaledCenter);

        // Z-only explode using anatomical layer offsets
        const explodeDist = targetSize * 0.9;
        const groupInfos: GroupInfo[] = [];

        prefixMap.forEach((compGroup, prefix) => {
          const zNorm = GROUP_Z[prefix] ?? 0;
          const origPos = compGroup.position.clone();
          const explodePos = origPos.clone();
          explodePos.z += (zNorm * explodeDist) / scale;
          groupInfos.push({ group: compGroup, origPos, explodePos });
        });

        setGroups(groupInfos);
        setContainerGroup(container);
      },
      undefined,
      (err) => console.warn('[PhoneExplodeScene] load error:', err),
    );
  }, [url]);

  useFrame(({ clock }) => {
    if (!pivotRef.current || groups.length === 0) return;

    // Slow Y rotation
    pivotRef.current.rotation.y = clock.getElapsedTime() * 0.28;

    // Explode / collapse cycle
    const t = clock.getElapsedTime() % CYCLE;
    let factor = 0;

    if (t < HOLD_ASSEMBLED) {
      factor = 0;
    } else if (t < HOLD_ASSEMBLED + EXPLODE_DURATION) {
      factor = easeInOutCubic((t - HOLD_ASSEMBLED) / EXPLODE_DURATION);
    } else if (t < HOLD_ASSEMBLED + EXPLODE_DURATION + HOLD_EXPLODED) {
      factor = 1;
    } else {
      factor = 1 - easeInOutCubic(
        (t - HOLD_ASSEMBLED - EXPLODE_DURATION - HOLD_EXPLODED) / COLLAPSE_DURATION,
      );
    }

    groups.forEach(({ group, origPos, explodePos }) => {
      group.position.lerpVectors(origPos, explodePos, factor);
    });

    // Blue glow on processor: fades in with explode, pulses when fully out
    if (processorMeshes.current.length > 0) {
      const pulse = 1.5 + Math.sin(clock.getElapsedTime() * 3) * 0.5;
      PROCESSOR_MAT.emissiveIntensity = factor * pulse;
    }
  });

  if (!containerGroup) return null;

  return (
    <group ref={pivotRef}>
      <primitive object={containerGroup} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Lights
// ---------------------------------------------------------------------------
function Scene({ modelUrl }: { modelUrl: string }) {
  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[4, 7, 5]}   intensity={2.8} />
      <directionalLight position={[-4, 2, -3]} intensity={0.7} color="#8090cc" />
      <pointLight      position={[0, -3, 3]}   intensity={0.6} color="#ff9050" />
      <PhoneModel url={modelUrl} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Public export
// ---------------------------------------------------------------------------
export default function PhoneExplodeScene({ modelUrl }: { modelUrl: string }) {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <CanvasErrorBoundary>
        <Canvas
          camera={{ position: [0, 0.5, 8], fov: 40 }}
          gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
          dpr={[1, Math.min(window.devicePixelRatio, 2)]}
          style={{ background: 'transparent' }}
        >
          <Scene modelUrl={modelUrl} />
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}
