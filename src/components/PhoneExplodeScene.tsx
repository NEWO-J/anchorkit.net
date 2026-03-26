import { useRef, useState, useEffect, Component, ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

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
// Component-group prefix — matches both formats:
//   GLB (glTF-Transform renamed):  "g_battery_00"  (underscore after g)
//   GLTF original:                 "g battery_00"  (space after g)
const GROUP_PREFIX_RE = /^g[_ ]([a-zA-Z0-9_]+?)(?:_\d+)?$/;

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
  board:        { color: '#b0b4bc',                                                               roughness: 0.08, metalness: 0.75 },  // back panel — light silver-aluminum
  sheets:       { map: '/ipx_metalsheets_diffuse.jpg', bumpMap: '/ipx_metalsheets_bump.jpg',    roughness: 0.25, metalness: 0.8 },
  mesh:         { color: '#1a1a1a',                                                               roughness: 0.55, metalness: 0.3 },
  black:        { color: '#2a2e36',                                                               roughness: 0.12, metalness: 0.2 },  // front display bezel — dark blue-gray
  components:   { color: '#2a3830',                                                               roughness: 0.45, metalness: 0.5 },
  glasslens:    { map: '/ipx_lens.jpg',                  transparent: true, opacity: 0.82,       roughness: 0.06, metalness: 0.1 },
  sensor:       { color: '#14141e',                                                               roughness: 0.2,  metalness: 0.4 },
  flexPCB:      { map: '/circuitboards_diffuse.JPG',                                             roughness: 0.65, metalness: 0.2 },
  gold:         { color: '#c8960c',                                                               roughness: 0.12, metalness: 0.92 },
  spacersilver: { color: '#b4b4be',                                                               roughness: 0.18, metalness: 0.88 },
  board3:       { map: '/ipx_PCBdark_diffuse.jpg',                                               roughness: 0.7,  metalness: 0.15 },  // main PCB board
  flexPCB2:     { map: '/circuitboards_diffuse.JPG',                                             roughness: 0.65, metalness: 0.2 },
  flexPCB3:     { map: '/circuitboards_diffuse.JPG',                                             roughness: 0.65, metalness: 0.2 },
  flexPCB4:     { map: '/circuitboards_diffuse.JPG',                                             roughness: 0.65, metalness: 0.2 },
  flexPCB5:     { map: '/circuitboards_diffuse.JPG',                                             roughness: 0.65, metalness: 0.2 },
  flexPCB6:     { map: '/circuitboards_diffuse.JPG',                                             roughness: 0.65, metalness: 0.2 },
  logos:        { color: '#d0d0d8',                                                               roughness: 0.08, metalness: 0.85 },
  flashglass:   { color: '#dde8f0',               transparent: true, opacity: 0.65,             roughness: 0.04, metalness: 0.05 },
  flash:        { map: '/ipx_flash.jpg',                                                          roughness: 0.12, metalness: 0.3 },
  camedge:      { color: '#2a2a2e',                                                               roughness: 0.18, metalness: 0.75 },
  board2:       { map: '/ipx_PCBdark_diffuse.jpg',                                               roughness: 0.7,  metalness: 0.15 },  // camera module board
  blue:         { color: '#d4d4d8',                                                               roughness: 0.04, metalness: 0.95 },  // outer shell — polished silver
  glassfront:   { color: '#1a2030',               transparent: true, opacity: 0.75,       roughness: 0.04, metalness: 0.1  },  // front screen glass — dark blue-tinted
};

// Fallback solid-color materials keyed by group prefix (used when GLTF material
// names are unavailable — e.g. GLB files where glTF-Transform strips them)
const GROUP_FALLBACK: Record<string, MatConfig> = {
  Display:      { color: '#0a0a14', roughness: 0.05, metalness: 0.05, transparent: true, opacity: 0.85 },
  phone_:       { color: '#1c1c1e', roughness: 0.12, metalness: 0.65 },
  body:         { color: '#2c2c2e', roughness: 0.18, metalness: 0.55 },
  plastictop:   { color: '#3a3a3c', roughness: 0.3,  metalness: 0.2 },
  bottom:       { color: '#8e8e93', roughness: 0.22, metalness: 0.8 },
  USB:          { color: '#636366', roughness: 0.28, metalness: 0.75 },
  battery:      { map: '/ipx_batterydiffuse.jpg', roughness: 0.55, metalness: 0.3 },
  camera:       { color: '#0a0a0a', roughness: 0.12, metalness: 0.7 },
  doublecamera: { color: '#111111', roughness: 0.12, metalness: 0.7 },
  PCB:          { map: '/ipx_PCB_diffuse.jpg', bumpMap: '/ipx_PCB_bump.jpg', roughness: 0.7, metalness: 0.15 },
  PCB2:         { map: '/ipx_PCBdark_diffuse.jpg', roughness: 0.7, metalness: 0.15 },
  sidebuttons1: { color: '#636366', roughness: 0.2, metalness: 0.8 },
  sidebuttons2: { color: '#636366', roughness: 0.2, metalness: 0.8 },
  wirelesscoil: { map: '/ipx_metalsheets_diffuse.jpg', roughness: 0.28, metalness: 0.85 },
};

// Z-offset: +1 = flies toward viewer (front), -1 = flies away (back)
// Phone opens like a clamshell: front panel forward, back panel backward
const GROUP_Z: Record<string, number> = {
  Display:       1.0,   // display assembly → furthest forward
  phone_:        0.85,  // front glass + frame → forward
  plastictop:    0.4,   // plastic top edge → slight forward
  bottom:        0.2,   // bottom edge → slight forward
  sidebuttons1:  0.1,   // side buttons → stay near shell
  sidebuttons2:  0.1,
  USB:          -0.1,   // USB port → slight backward
  battery:      -0.4,   // battery → backward
  camera:       -0.5,   // camera module → backward
  doublecamera: -0.6,   // dual camera → backward
  processor:    -0.7,   // processor → backward
  PCB:          -0.75,  // main PCB → backward
  PCB2:         -0.8,   // secondary PCB → backward
  wirelesscoil: -0.9,   // wireless coil → backward
  body:         -1.0,   // back panel/case → furthest backward
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
  // useRef instead of useState so useFrame always reads current data (no stale closure)
  const groupsRef       = useRef<GroupInfo[]>([]);
  const [containerGroup, setContainerGroup] = useState<THREE.Group | null>(null);

  useEffect(() => {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);
    loader.load(
      url,
      (gltf) => {
        const root = gltf.scene;

        // Per-GLTF-material-name cache (used when mesh has a named material)
        const matCache = new Map<string, THREE.MeshStandardMaterial>();
        Object.entries(MAT_CONFIGS).forEach(([name, cfg]) => {
          matCache.set(name, makeMat(cfg));
        });

        // Per-group-prefix fallback cache (used when material name is absent/unknown, e.g. GLB)
        const fallbackCache = new Map<string, THREE.MeshStandardMaterial>();
        Object.entries(GROUP_FALLBACK).forEach(([prefix, cfg]) => {
          fallbackCache.set(prefix, makeMat(cfg));
        });

        // Walk down single-child wrappers to find the flat mesh list
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

            // Try per-material-name config first (GLTF with named materials),
            // then fall back to group-prefix solid color (GLB, stripped names)
            const gltfMat = Array.isArray(mesh.material)
              ? (mesh.material[0] as THREE.Material)
              : (mesh.material as THREE.Material);
            const matName = gltfMat?.name ?? '';
            mesh.material = matCache.get(matName)
              ?? fallbackCache.get(prefix)
              ?? DEFAULT_MAT;
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

        // Z-only explode using anatomical layer offsets.
        // Also assign renderOrder so front layers always draw on top of rear ones
        // when they overlap during collapse — prevents clipping artefacts.
        const explodeDist = targetSize * 0.9;
        const groupInfos: GroupInfo[] = [];

        prefixMap.forEach((compGroup, prefix) => {
          const zNorm = GROUP_Z[prefix] ?? 0;

          // renderOrder: map zNorm [-1..1] → [0..20], front layers highest
          const ro = Math.round((zNorm + 1) * 10);
          compGroup.traverse((obj) => { obj.renderOrder = ro; });

          const origPos = compGroup.position.clone();
          const explodePos = origPos.clone();
          explodePos.z += (zNorm * explodeDist) / scale;
          groupInfos.push({ group: compGroup, origPos, explodePos });
        });

        // Store in ref — no re-render needed, useFrame reads ref directly
        groupsRef.current = groupInfos;
        setContainerGroup(container);
      },
      undefined,
      (err) => console.error('[Phone] LOAD ERROR:', err),
    );
  }, [url]);

  useFrame(({ clock }) => {
    if (!pivotRef.current || groupsRef.current.length === 0) return;

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

    groupsRef.current.forEach(({ group, origPos, explodePos }) => {
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
// Scene — IBL environment + three-point studio lighting
// ---------------------------------------------------------------------------
function Scene({ modelUrl }: { modelUrl: string }) {
  const { gl, scene } = useThree();

  // Build a RoomEnvironment IBL once and apply it as the scene environment.
  // This gives PBR materials (metalness, roughness, glass) accurate reflections
  // without needing an external HDR file.
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    pmrem.compileEquirectangularShader();
    const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    // Keep background transparent — only use env for reflections
    scene.background = null;
    return () => { envTexture.dispose(); pmrem.dispose(); };
  }, [gl, scene]);

  return (
    <>
      {/* Key light — warm, high from upper-right front */}
      <directionalLight position={[3, 6, 4]}   intensity={1.8} color="#fff5e8" castShadow
        shadow-mapSize={[1024, 1024]} shadow-bias={-0.0005} />
      {/* Fill light — cool, left side, soft */}
      <directionalLight position={[-4, 2, 2]}  intensity={0.5} color="#c8d8ff" />
      {/* Rim light — behind/below, separates edges from background */}
      <directionalLight position={[0, -3, -4]} intensity={0.4} color="#8899cc" />
      {/* Subtle warm under-bounce */}
      <pointLight       position={[0, -4, 2]}  intensity={0.3} color="#ffd0a0" distance={12} />
      <PhoneModel url={modelUrl} />
      {/* Bloom post-process — only lights up emissive objects (processor glow).
          luminanceThreshold 0.4 means only pixels brighter than 40% fire the bloom,
          so normal PBR materials are unaffected but the blue emissive glows. */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.4} luminanceSmoothing={0.85} intensity={1.8} mipmapBlur />
      </EffectComposer>
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
          gl={{ alpha: true, antialias: true, powerPreference: 'low-power',
               toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
          dpr={[1, Math.min(window.devicePixelRatio, 2)]}
          style={{ background: 'transparent' }}
        >
          <Scene modelUrl={modelUrl} />
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}
