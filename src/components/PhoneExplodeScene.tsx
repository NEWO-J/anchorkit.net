import React, { useRef, useState, useEffect, Component, ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// Enable Three.js global cache so repeated loads of the same URL (e.g. circuitboards
// texture used by 6 flexPCB materials) share one HTTP request and one GPU upload.
THREE.Cache.enabled = true;

// Module-level loader singletons — set both decoders so the loader handles
// GLBs with KHR_draco_mesh_compression, EXT_meshopt_compression, or both.
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');
// Preload Draco WASM immediately — this runs when the JS bundle is first parsed,
// so the decoder is warm by the time the user scrolls to the phone section.
dracoLoader.preload();
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);
gltfLoader.setMeshoptDecoder(MeshoptDecoder);

// ---------------------------------------------------------------------------
// Error boundary
// ---------------------------------------------------------------------------
class CanvasErrorBoundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError(err: Error) { console.error('[Phone] CanvasErrorBoundary caught:', err); return { error: true }; }
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
// Component-group prefix — matches all formats:
//   Merged v3 GLB:  "battery", "phone_"          (direct group name)
//   Legacy GLB:     "g_battery_00", "g body_00"  (g prefix + index suffix)
const GROUP_PREFIX_RE = /^(?:g[_ ])?([a-zA-Z0-9_]+?)(?:_\d+)?$/;

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
  battery:      { map: '/ipx_batterydiffuse.webp',                                               roughness: 0.55, metalness: 0.2 },
  internalmetal:{ color: '#7a7a82',                                                               roughness: 0.15, metalness: 0.9 },
  board:        { color: '#b0b4bc',                                                               roughness: 0.08, metalness: 0.75 },  // back panel — light silver-aluminum
  sheets:       { map: '/ipx_metalsheets_diffuse.webp',                                          roughness: 0.25, metalness: 0.8 },
  mesh:         { color: '#1a1a1a',                                                               roughness: 0.55, metalness: 0.3 },
  black:        { color: '#2a2e36',                                                               roughness: 0.12, metalness: 0.2 },  // front display bezel — dark blue-gray
  components:   { color: '#2a3830',                                                               roughness: 0.45, metalness: 0.5 },
  glasslens:    { map: '/ipx_lens.webp',                 transparent: true, opacity: 0.82,       roughness: 0.06, metalness: 0.1 },
  sensor:       { color: '#14141e',                                                               roughness: 0.2,  metalness: 0.4 },
  flexPCB:      { map: '/circuitboards_diffuse.webp',                                            roughness: 0.65, metalness: 0.2 },
  gold:         { color: '#c8960c',                                                               roughness: 0.12, metalness: 0.92 },
  spacersilver: { color: '#b4b4be',                                                               roughness: 0.18, metalness: 0.88 },
  board3:       { map: '/ipx_PCBdark_diffuse.webp',                                              roughness: 0.7,  metalness: 0.15 },  // main PCB board
  flexPCB2:     { map: '/circuitboards_diffuse.webp',                                            roughness: 0.65, metalness: 0.2 },
  flexPCB3:     { map: '/circuitboards_diffuse.webp',                                            roughness: 0.65, metalness: 0.2 },
  flexPCB4:     { map: '/circuitboards_diffuse.webp',                                            roughness: 0.65, metalness: 0.2 },
  flexPCB5:     { map: '/circuitboards_diffuse.webp',                                            roughness: 0.65, metalness: 0.2 },
  flexPCB6:     { map: '/circuitboards_diffuse.webp',                                            roughness: 0.65, metalness: 0.2 },
  logos:        { color: '#d0d0d8',                                                               roughness: 0.08, metalness: 0.85 },
  flashglass:   { color: '#dde8f0',               transparent: true, opacity: 0.65,             roughness: 0.04, metalness: 0.05 },
  flash:        { map: '/ipx_flash.webp',                                                         roughness: 0.12, metalness: 0.3 },
  camedge:      { color: '#2a2a2e',                                                               roughness: 0.18, metalness: 0.75 },
  board2:       { map: '/ipx_PCBdark_diffuse.webp',                                              roughness: 0.7,  metalness: 0.15 },  // camera module board
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
  battery:      { map: '/ipx_batterydiffuse.webp', roughness: 0.55, metalness: 0.3 },
  camera:       { color: '#0a0a0a', roughness: 0.12, metalness: 0.7 },
  doublecamera: { color: '#111111', roughness: 0.12, metalness: 0.7 },
  PCB:          { map: '/ipx_PCBdark_diffuse.webp',                          roughness: 0.7, metalness: 0.15 },
  PCB2:         { map: '/ipx_PCBdark_diffuse.webp', roughness: 0.7, metalness: 0.15 },
  sidebuttons1: { color: '#636366', roughness: 0.2, metalness: 0.8 },
  sidebuttons2: { color: '#636366', roughness: 0.2, metalness: 0.8 },
  wirelesscoil: { map: '/ipx_metalsheets_diffuse.webp', roughness: 0.28, metalness: 0.85 },
};

// Z-offset: all components fly forward (toward viewer) out of the front of the phone.
// body (back panel) stays fixed at 0 as the base everything emerges from.
// Values are ordered by anatomical depth — innermost layers (near back) get low values,
// outermost (front glass) get the highest.
const GROUP_Z: Record<string, number> = {
  body:          0.0,   // back panel — stays still (shell)
  phone_:        0.0,   // front glass + frame — stays still (shell)
  wirelesscoil:  0.15,  // wireless coil — first layer above back panel
  PCB2:          0.25,  // secondary PCB
  PCB:           0.35,  // main PCB
  processor:     0.45,  // processor sits on PCB
  doublecamera:  0.52,  // dual camera module
  camera:        0.58,  // camera
  battery:       0.65,  // battery — large mid-layer
  USB:           0.70,  // USB/charging board
  sidebuttons1:  0.75,  // side buttons
  sidebuttons2:  0.75,
  bottom:        0.80,  // bottom edge trim
  plastictop:    0.85,  // top plastic trim
  Display:       0.95,  // display assembly — near front
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
  emissive:          new THREE.Color('#4488ff'),
  emissiveIntensity: 0,
  roughness:         0.25,
  metalness:         0.7,
});

// ---------------------------------------------------------------------------
// Main 3-D scene component
// ---------------------------------------------------------------------------
function PhoneModel({ url, scrollFactorRef }: {
  url: string;
  scrollFactorRef: React.RefObject<number>;
}) {
  const pivotRef        = useRef<THREE.Group>(null);
  const processorMeshes = useRef<THREE.Mesh[]>([]);
  // useRef instead of useState so useFrame always reads current data (no stale closure)
  const groupsRef       = useRef<GroupInfo[]>([]);
  const smoothFactor    = useRef(0);
  const [containerGroup, setContainerGroup] = useState<THREE.Group | null>(null);

  useEffect(() => {
    console.log('[Phone] load start:', url);
    gltfLoader.load(
      url,
      (gltf) => {
        console.log('[Phone] load success, scene children:', gltf.scene.children.length);
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
        let depth = 0;
        while (meshParent.children.length === 1) {
          meshParent = meshParent.children[0];
          depth++;
        }
        console.log('[Phone] meshParent after', depth, 'hops, children:', meshParent.children.length, 'name:', meshParent.name);

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
              mesh.material      = PROCESSOR_MAT;
              mesh.castShadow    = true;
              mesh.receiveShadow = true;
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
            mesh.castShadow    = true;
            mesh.receiveShadow = true;
          });
        });
        processorMeshes.current = procMeshes;

        console.log('[Phone] prefixMap groups:', [...prefixMap.keys()]);
        console.log('[Phone] procMeshes found:', procMeshes.length);

        // Build container
        const container = new THREE.Group();
        prefixMap.forEach((g) => container.add(g));

        // Fit + centre
        const overallBox = new THREE.Box3().setFromObject(container);
        if (overallBox.isEmpty()) { console.error('[Phone] bounding box is empty — no geometry found'); return; }
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
        console.log('[Phone] ready, groups:', groupInfos.length, 'scale:', scale.toFixed(3));
        setContainerGroup(container);
      },
      (xhr) => {
        if (xhr.total) console.log('[Phone] loading', Math.round(xhr.loaded/xhr.total*100) + '%');
      },
      (err) => console.error('[Phone] LOAD ERROR:', err),
    );
  }, [url]);

  useFrame(({ clock }) => {
    if (groupsRef.current.length === 0) return;

    // Smoothly lerp toward the scroll-driven target factor.
    // MAX_DELTA caps the per-frame step so a large initial gap (e.g. page loaded
    // while already scrolled) can't close in a few frames — full 0→1 takes ~1.5s.
    const target = scrollFactorRef.current ?? 0;
    const lerped = THREE.MathUtils.lerp(smoothFactor.current, target, 0.07);
    const delta  = lerped - smoothFactor.current;
    const MAX_DELTA = 0.010;
    smoothFactor.current += Math.sign(delta) * Math.min(Math.abs(delta), MAX_DELTA);
    const factor = easeInOutCubic(smoothFactor.current);

    groupsRef.current.forEach(({ group, origPos, explodePos }) => {
      group.position.lerpVectors(origPos, explodePos, factor);
    });

    // Blue glow on processor: multi-frequency breathing for organic variation
    if (processorMeshes.current.length > 0) {
      const t = clock.getElapsedTime();
      // Four incommensurate frequencies — never locks into a detectable repeat
      const pulse = 2.8
        + Math.sin(t * 1.3)  * 0.30
        + Math.sin(t * 4.1)  * 0.18
        + Math.sin(t * 9.7)  * 0.09
        + Math.sin(t * 23.1) * 0.04;
      // floor ~2.19, ceiling ~3.41 — high minimum, no dipping near zero
      PROCESSOR_MAT.emissiveIntensity = factor * pulse * 0.5;
    }
  });

  if (!containerGroup) return null;

  return (
    <group ref={pivotRef} rotation={[0, -0.75, 0]}>
      <primitive object={containerGroup} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Scene — IBL environment + three-point studio lighting
// ---------------------------------------------------------------------------
function Scene({ modelUrl, scrollFactorRef }: {
  modelUrl: string;
  scrollFactorRef: React.RefObject<number>;
}) {
  const { gl, scene } = useThree();

  // Build a RoomEnvironment IBL once and apply it as the scene environment.
  // This gives PBR materials (metalness, roughness, glass) accurate reflections
  // without needing an external HDR file.
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    pmrem.compileEquirectangularShader();
    const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    // Keep background transparent — only use env for PBR reflections.
    // Low intensity so IBL doesn't flatten the directional shadow contrast.
    (scene as THREE.Scene & { environmentIntensity?: number }).environmentIntensity = 0.08;
    scene.background = null;
    return () => { envTexture.dispose(); pmrem.dispose(); };
  }, [gl, scene]);

  return (
    <>
      {/* Key light — warm, high from upper-right front, casts hard shadows */}
      <directionalLight position={[3, 6, 4]} intensity={2.2} color="#fff5e8" castShadow
        shadow-mapSize-width={2048} shadow-mapSize-height={2048}
        shadow-camera-near={1} shadow-camera-far={20}
        shadow-camera-left={-3} shadow-camera-right={3}
        shadow-camera-top={3}   shadow-camera-bottom={-3}
        shadow-bias={-0.0003} />
      {/* Weak cool fill — barely lifts shadows, preserves contrast */}
      <directionalLight position={[-4, 2, 2]} intensity={0.06} color="#c8d8ff" />
      {/* Thin rim — separates back edge from background */}
      <directionalLight position={[0, -3, -4]} intensity={0.15} color="#8899cc" />
      <PhoneModel url={modelUrl} scrollFactorRef={scrollFactorRef} />
      {/* Bloom post-process — only lights up emissive objects (processor glow).
          luminanceThreshold 0.4 means only pixels brighter than 40% fire the bloom,
          so normal PBR materials are unaffected but the blue emissive glows. */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} intensity={1.47} radius={0.85} mipmapBlur />
      </EffectComposer>
    </>
  );
}

// ---------------------------------------------------------------------------
// Public export
// ---------------------------------------------------------------------------
export default function PhoneExplodeScene({ modelUrl }: { modelUrl: string }) {
  const containerRef    = useRef<HTMLDivElement>(null);
  const scrollFactorRef = useRef<number>(0);
  // Defer Canvas mount until the section is within 300px of the viewport
  // so Three.js/WebGL and the GLB don't load until the user actually scrolls near it.
  const [canvasReady, setCanvasReady] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { console.log('[Phone] IntersectionObserver:', entry.isIntersecting); if (entry.isIntersecting) { setCanvasReady(true); io.disconnect(); } },
      { rootMargin: '300px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const vh   = window.innerHeight;
      const raw  = (vh - rect.top) / (vh * 0.8);
      scrollFactorRef.current = Math.max(0, Math.min(1, raw));
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      {canvasReady && (
        <CanvasErrorBoundary>
          <Canvas
            camera={{ position: [0, 0.5, 8], fov: 40 }}
            shadows
            gl={{ alpha: true, antialias: true, powerPreference: 'low-power',
                 toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
            dpr={[1, Math.min(window.devicePixelRatio, 2)]}
            style={{ background: 'transparent' }}
          >
            <Scene modelUrl={modelUrl} scrollFactorRef={scrollFactorRef} />
          </Canvas>
        </CanvasErrorBoundary>
      )}
    </div>
  );
}
