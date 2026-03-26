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
// Component-group prefix — matches GLB node names like "g_battery_00", "g_USB_0000"
const GROUP_PREFIX_RE = /^g_([a-zA-Z_]+?)_\d+$/;

// ---------------------------------------------------------------------------
// Per-group explode data
// ---------------------------------------------------------------------------
interface GroupInfo {
  group: THREE.Group;
  origPos: THREE.Vector3;
  explodePos: THREE.Vector3;
}

// ---------------------------------------------------------------------------
// Build per-material MeshStandardMaterial cache with real textures
// ---------------------------------------------------------------------------
interface MatConfig {
  map?: string;
  bumpMap?: string;
  color?: string;
  roughness: number;
  metalness: number;
  transparent?: boolean;
  opacity?: number;
}

const MAT_CONFIGS: Record<string, MatConfig> = {
  battery:      { map: '/ipx_batterydiffuse.jpg',           roughness: 0.55, metalness: 0.4 },
  board:        { map: '/ipx_PCB_diffuse.jpg',        bumpMap: '/ipx_PCB_bump.jpg',          roughness: 0.7, metalness: 0.15 },
  board2:       { map: '/ipx_PCBdark_diffuse.jpg',    bumpMap: '/ipx_PCB_bump.jpg',          roughness: 0.7, metalness: 0.15 },
  board3:       { map: '/ipx_PCB_diffuse_light.jpg',  bumpMap: '/ipx_PCB_bump.jpg',          roughness: 0.7, metalness: 0.15 },
  components:   { map: '/circuitboards_diffuse.JPG',                                          roughness: 0.65, metalness: 0.2 },
  flexPCB:      { map: '/ipx_PCB_diffuse.jpg',                                               roughness: 0.7, metalness: 0.1 },
  flexPCB2:     { map: '/ipx_PCBdark_diffuse.jpg',                                           roughness: 0.7, metalness: 0.1 },
  flexPCB3:     { map: '/ipx_PCB_diffuse_light.jpg',                                         roughness: 0.7, metalness: 0.1 },
  flexPCB4:     { map: '/ipx_PCB_diffuse.jpg',                                               roughness: 0.7, metalness: 0.1 },
  flexPCB5:     { map: '/ipx_PCBdark_diffuse.jpg',                                           roughness: 0.7, metalness: 0.1 },
  flexPCB6:     { map: '/ipx_PCB_diffuse_light.jpg',                                         roughness: 0.7, metalness: 0.1 },
  sheets:       { map: '/ipx_metalsheets_diffuse.jpg', bumpMap: '/ipx_metalsheets_bump.jpg', roughness: 0.35, metalness: 0.75 },
  internalmetal:{ map: '/ipx_metalscratch.jpg',                                               roughness: 0.3,  metalness: 0.8 },
  mesh:         { map: '/ipx_metalscratch.jpg',                                               roughness: 0.45, metalness: 0.6 },
  gold:         { map: '/ipx_metalscratch.jpg',         color: '#d4a820',                    roughness: 0.2,  metalness: 0.95 },
  spacersilver: { map: '/ipx_metalsheets_diffuse_dark.jpg',                                   roughness: 0.3,  metalness: 0.75 },
  camedge:      { map: '/ipx_metalscratch.jpg',         color: '#1a1a1a',                    roughness: 0.25, metalness: 0.85 },
  glasslens:    { map: '/ipx_lens.jpg',                                                       roughness: 0.05, metalness: 0.05, transparent: true, opacity: 0.75 },
  blue:         { map: '/ipx_lens_blue.jpg',                                                  roughness: 0.05, metalness: 0.05, transparent: true, opacity: 0.65 },
  sensor:       { map: '/ipx_lens.jpg',                 color: '#111111',                    roughness: 0.1,  metalness: 0.1 },
  flash:        { map: '/ipx_flash.jpg',                                                      roughness: 0.05, metalness: 0.0 },
  flashglass:   { map: '/ipx_flash.jpg',                                                      roughness: 0.05, metalness: 0.0, transparent: true, opacity: 0.85 },
  black:        { map: '/ipx_S1_diffuse.jpg',           bumpMap: '/ipx_bodybump.jpg',        roughness: 0.25, metalness: 0.05 },
  glassfront:   { map: '/ipx_S1_diffuse.jpg',                                                 roughness: 0.05, metalness: 0.0,  transparent: true, opacity: 0.45 },
  logos:        { map: '/ipx_S1rear_diffuse.jpg',                                             roughness: 0.3,  metalness: 0.1 },
};

function buildMaterialCache(): Map<string, THREE.MeshStandardMaterial> {
  const loader = new THREE.TextureLoader();

  // Load a colour (sRGB) texture
  const ct = (url: string) => {
    const tex = loader.load(url);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };
  // Load a linear (non-colour) texture — bump / roughness maps
  const lt = (url: string) => loader.load(url);

  const cache = new Map<string, THREE.MeshStandardMaterial>();

  Object.entries(MAT_CONFIGS).forEach(([name, cfg]) => {
    const mat = new THREE.MeshStandardMaterial({
      roughness:   cfg.roughness,
      metalness:   cfg.metalness,
      transparent: cfg.transparent ?? false,
      opacity:     cfg.opacity    ?? 1.0,
    });
    if (cfg.color)   mat.color.set(cfg.color);
    if (cfg.map)     mat.map     = ct(cfg.map);
    if (cfg.bumpMap) mat.bumpMap = lt(cfg.bumpMap);
    cache.set(name, mat);
  });

  return cache;
}

const DEFAULT_MAT = new THREE.MeshStandardMaterial({ color: '#9098a8', roughness: 0.5, metalness: 0.3 });

// ---------------------------------------------------------------------------
// Main 3-D scene component
// ---------------------------------------------------------------------------
// Shared blue-glow material for the processor — emissiveIntensity animated in useFrame
const PROCESSOR_MAT = new THREE.MeshStandardMaterial({
  color:            '#1a2a44',
  emissive:         new THREE.Color('#0055ff'),
  emissiveIntensity: 0,
  roughness:        0.25,
  metalness:        0.7,
});

function PhoneModel({ url }: { url: string }) {
  const pivotRef         = useRef<THREE.Group>(null);
  const processorMeshes  = useRef<THREE.Mesh[]>([]);
  const [groups, setGroups]                   = useState<GroupInfo[]>([]);
  const [containerGroup, setContainerGroup]   = useState<THREE.Group | null>(null);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        const root = gltf.scene;

        // Build texture-mapped material cache
        const matCache = buildMaterialCache();

        // Apply materials; processor meshes get the shared glow material
        const procMeshes: THREE.Mesh[] = [];
        root.traverse((child) => {
          if (!(child as THREE.Mesh).isMesh) return;
          const mesh = child as THREE.Mesh;
          if (mesh.parent?.name.match(/^g_processor_/)) {
            mesh.material = PROCESSOR_MAT;
            procMeshes.push(mesh);
            return;
          }
          const matName = (Array.isArray(mesh.material)
            ? (mesh.material[0] as THREE.MeshStandardMaterial)
            : (mesh.material as THREE.MeshStandardMaterial))?.name ?? '';
          mesh.material = matCache.get(matName) ?? DEFAULT_MAT;
        });
        processorMeshes.current = procMeshes;

        // ── Walk down single-child wrappers to find the flat mesh list ───
        // The GLB wraps meshes: scene → empty_1 (1 child) → empty_2 (4479 children)
        let meshParent: THREE.Object3D = root;
        while (meshParent.children.length === 1) {
          meshParent = meshParent.children[0];
        }

        // ── Group flat children by component-name prefix ──────────────────
        const prefixMap = new Map<string, THREE.Group>();

        // snapshot children array before we start reparenting
        const children = [...meshParent.children];

        children.forEach((child) => {
          const m = child.name.match(GROUP_PREFIX_RE);
          const prefix = m ? m[1] : '__other__';
          if (!prefixMap.has(prefix)) {
            const g = new THREE.Group();
            g.name = prefix;
            prefixMap.set(prefix, g);
          }
          prefixMap.get(prefix)!.add(child);  // reparents; local pos preserved
        });

        // Build a container group that holds all component groups
        const container = new THREE.Group();
        prefixMap.forEach((g) => container.add(g));

        // ── Measure in MODEL space (container still at identity here) ─────
        const overallBox = new THREE.Box3().setFromObject(container);
        if (overallBox.isEmpty()) return;

        const size = new THREE.Vector3();
        overallBox.getSize(size);
        const center = new THREE.Vector3();
        overallBox.getCenter(center);

        // ── Compute per-group explode directions IN MODEL SPACE ───────────
        // Normalise each axis by the model's half-extent along that axis so
        // that thin dimensions (Z ≈ 3.4 units) get equal visual weight to
        // tall dimensions (Y ≈ 105 units). Without this all motion is Y-only.
        const halfX = size.x / 2 || 1;
        const halfY = size.y / 2 || 1;
        const halfZ = size.z / 2 || 1;

        const dirMap = new Map<THREE.Group, THREE.Vector3>();
        prefixMap.forEach((compGroup) => {
          const gbox = new THREE.Box3().setFromObject(compGroup);
          if (gbox.isEmpty()) { dirMap.set(compGroup, new THREE.Vector3(0, 0, 1)); return; }

          const gCenter = new THREE.Vector3();
          gbox.getCenter(gCenter);

          // Horizontal-only explode: use X and Z, zero out Y so nothing moves up/down
          const dir = new THREE.Vector3(
            (gCenter.x - center.x) / halfX,
            0,
            (gCenter.z - center.z) / halfZ,
          );
          if (dir.lengthSq() < 1e-4) dir.set(0, 0, 1);
          dir.normalize();
          dirMap.set(compGroup, dir);
        });

        // ── Fit + centre (apply AFTER direction computation) ───────────────
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetSize = 3.5;
        const scale = maxDim > 0 ? targetSize / maxDim : 1;

        container.scale.setScalar(scale);
        const scaledBox = new THREE.Box3().setFromObject(container);
        const scaledCenter = new THREE.Vector3();
        scaledBox.getCenter(scaledCenter);
        container.position.sub(scaledCenter);

        // ── Build GroupInfo (explode distance in world space = targetSize * 0.7) ─
        const groupInfos: GroupInfo[] = [];
        const explodeDist = targetSize * 0.7;

        prefixMap.forEach((compGroup) => {
          const dir = dirMap.get(compGroup) ?? new THREE.Vector3(0, 0, 1);
          const origPos = compGroup.position.clone();
          // local-space offset = world-space distance / scale
          const explodePos = origPos.clone().add(dir.multiplyScalar(explodeDist / scale));
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
