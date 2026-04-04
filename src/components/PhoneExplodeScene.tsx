import React, { useRef, useState, useEffect, Component, ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, SMAA } from '@react-three/postprocessing';
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
// Data stream line — curved animated line from processor → component
// ---------------------------------------------------------------------------
interface StreamData {
  line:        THREE.Line;
  material:    THREE.ShaderMaterial;
  targetGroup: THREE.Group;
  phase:       number;          // per-stream timing offset (radians)
  freq:        number;          // swirl oscillation frequency (Hz)
  targetMeshXY: THREE.Vector2; // actual XY center of target meshes in container local space
  heightBias:  number;         // extra Y added to first control point for tall arcing streams
  straightUp:  boolean;        // use S-curve vertical path instead of orbital swirl
  positions:   Float32Array;    // geometry position buffer (STREAM_SEGMENTS+1 × 3)
  _p0:         THREE.Vector3;   // control pts — mutated in-place each frame
  _p1:         THREE.Vector3;
  _p2:         THREE.Vector3;
  _p3:         THREE.Vector3;
  _dir:        THREE.Vector3;
  _pr1:        THREE.Vector3;
  _pr2:        THREE.Vector3;
  _curve:      THREE.CatmullRomCurve3;
  _samplePt:   THREE.Vector3;
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
  wirelesscoil: { color: '#7a7a82', roughness: 0.65, metalness: 0.5 },
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

// Wireless coil — same silver-gray as internalmetal but very high roughness so the
// fine spiral wire geometry doesn't produce sharp specular bands that alias against
// the pixel grid and cause a moiré pattern as the element moves.
const WIRELESS_COIL_MAT = new THREE.MeshStandardMaterial({ color: '#7a7a82', roughness: 0.92, metalness: 0.4 });

// ---------------------------------------------------------------------------
// Hologram shader for the processor — uniforms driven each frame in useFrame
// ---------------------------------------------------------------------------
const HOLOGRAM_UNIFORMS = {
  uTime:   { value: 0 },
  uFactor: { value: 0 },
};

// ---------------------------------------------------------------------------
// Data stream constants — blue animated splines from processor to each part
// ---------------------------------------------------------------------------

// Shared uniform VALUE objects — all stream ShaderMaterials hold a reference to
// these same objects, so a single assignment in useFrame updates every material.
const STREAM_SHARED_TIME   = { value: 0 };
const STREAM_SHARED_FACTOR = { value: 0 };

const STREAM_SEGMENTS = 24;   // vertices sampled along each spline

// Groups that receive a data stream originating from the processor.
// 'plastictop' appears twice: first is a normal arcing stream, second is the
// dedicated straight-up S-curve stream visible as a vertical path on the PCB face.
const STREAM_TARGETS = [
  'wirelesscoil','PCB2','PCB','doublecamera','camera',
  'battery','USB','sidebuttons1','sidebuttons2','bottom','plastictop','Display',
  'plastictop',
];

// Module-level scratch vectors — reused every frame to avoid GC pressure
const _streamWorldUp = new THREE.Vector3(0, 1, 0);
const _streamXAxis   = new THREE.Vector3(1, 0, 0);

const STREAM_VERT = /* glsl */`
  attribute float aT;
  varying  float vT;
  void main() {
    vT = aT;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const STREAM_FRAG = /* glsl */`
  uniform float uTime;
  uniform float uFactor;
  uniform float uPhase;
  varying float vT;
  void main() {
    // Bright pulse that travels from processor (vT=0) toward target (vT=1)
    float pulseT = mod(uTime * 0.13 + uPhase, 1.0);
    float pulse  = exp(-pow((vT - pulseT) * 7.0, 2.0));
    // Blue → cyan gradient along the line length
    vec3  base   = mix(vec3(0.05, 0.22, 1.0), vec3(0.08, 0.85, 1.0), vT);
    // HDR brightness — bright enough to trigger the bloom pass.
    // Baseline kept very low so bloom only fires near the pulse peak,
    // keeping each stream confined to a tight line rather than a wide glow.
    float bright = pulse * 5.0 + 0.04;
    // Fade in quadratically as the model explodes so streams appear gradually
    float alpha  = (pulse * 0.94 + 0.02) * uFactor * uFactor;
    gl_FragColor = vec4(base * bright, clamp(alpha, 0.0, 0.95));
  }
`;

const PROCESSOR_MAT = new THREE.ShaderMaterial({
  uniforms: HOLOGRAM_UNIFORMS,
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;
    void main() {
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPos.xyz;
      gl_Position = projectionMatrix * mvPos;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uFactor;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;
    void main() {
      vec3 normal  = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);

      // Fresnel — bright at grazing angles, dim face-on
      float fresnel = pow(1.0 - abs(dot(viewDir, normal)), 2.0);

      // Sweeping scanlines — horizontal bands moving upward
      float scan = sin(vWorldPosition.y * 28.0 - uTime * 1.6);
      scan = smoothstep(0.2, 1.0, scan) * 0.4;

      // Dense fine lines — static horizontal grid
      float fine = sin(vWorldPosition.y * 110.0) * 0.5 + 0.5;
      fine = pow(fine, 8.0) * 0.35;

      // Shimmer — fast subtle noise
      float shimmer = sin(uTime * 9.0 + vWorldPosition.y * 4.5) * 0.04 + 0.96;

      // Breathing pulse
      float pulse = sin(uTime * 1.3) * 0.08 + 0.92;

      // Color — deep blue core, cyan rim
      vec3 color = mix(vec3(0.05, 0.38, 1.0), vec3(0.15, 0.85, 1.0), fresnel);
      // Boost so bloom fires strongly on bright parts
      color *= 3.0;

      float alpha = (fresnel * 0.55 + scan + fine + 0.07) * shimmer * pulse * uFactor;
      gl_FragColor = vec4(color, clamp(alpha, 0.0, 0.95));
    }
  `,
  transparent: true,
  depthWrite:  false,
  side:        THREE.DoubleSide,
});

// ---------------------------------------------------------------------------
// Main 3-D scene component
// ---------------------------------------------------------------------------
function PhoneModel({ url, scrollFactorRef, mobileXShift, invalidateRef }: {
  url: string;
  scrollFactorRef: React.RefObject<number>;
  mobileXShift: number;
  invalidateRef: React.MutableRefObject<() => void>;
}) {
  const pivotRef             = useRef<THREE.Group>(null);
  const processorMeshes      = useRef<THREE.Mesh[]>([]);
  // useRef instead of useState so useFrame always reads current data (no stale closure)
  const groupsRef            = useRef<GroupInfo[]>([]);
  const smoothFactor         = useRef(0);
  const processorGroupRef    = useRef<THREE.Group | null>(null);
  const processorMeshXYRef   = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
  const streamDataRef        = useRef<StreamData[]>([]);
  const [containerGroup, setContainerGroup] = useState<THREE.Group | null>(null);
  const { invalidate } = useThree();
  // Expose invalidate so the scroll listener (outside the Canvas) can trigger frames
  useEffect(() => { invalidateRef.current = invalidate; }, [invalidate, invalidateRef]);

  useEffect(() => {
    gltfLoader.load(
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
        let depth = 0;
        while (meshParent.children.length === 1) {
          meshParent = meshParent.children[0];
          depth++;
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
              mesh.material      = PROCESSOR_MAT;
              mesh.castShadow    = true;
              mesh.receiveShadow = true;
              procMeshes.push(mesh);
              return;
            }

            // The wireless coil has fine spiral wire geometry that aliases against
            // the pixel grid (moiré) when the material is shiny. Force a very matte
            // material regardless of whatever GLTF material name the mesh carries.
            if (prefix === 'wirelesscoil') {
              mesh.material      = WIRELESS_COIL_MAT;
              mesh.castShadow    = true;
              mesh.receiveShadow = true;
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
        processorMeshes.current  = procMeshes;
        processorGroupRef.current = prefixMap.get('processor') ?? null;

        // Compute actual XY center of processor meshes in container local space
        // (compGroup.position is always (0,0,0); only child meshes carry GLTF positions)
        const procGroupForBbox = processorGroupRef.current;
        if (procGroupForBbox) {
          const procBbox = new THREE.Box3().setFromObject(procGroupForBbox);
          const procCenter = new THREE.Vector3();
          procBbox.getCenter(procCenter);
          processorMeshXYRef.current.set(procCenter.x, procCenter.y);
        }

        // Build container
        const container = new THREE.Group();
        prefixMap.forEach((g) => container.add(g));

        // Global opacity — applied after material assignment so it overrides
        // per-material values uniformly across the whole model
        container.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (!mesh.isMesh) return;
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((m) => {
            const mat = m as THREE.MeshStandardMaterial;
            mat.transparent = true;
            mat.opacity = 0.7;
            mat.needsUpdate = true;
          });
        });

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

        // These pieces must render in front of the stream lines (renderOrder 50).
        // depthTest:false is required because streams use AdditiveBlending+depthWrite:false,
        // so their glow is already in the framebuffer before these pieces render — without
        // disabling depthTest the glow bleeds through at the material's (1-opacity) level.
        // Display and phone_ must render over stream lines (renderOrder 50).
        // depthTest:false ensures they paint over the additive stream glow already
        // in the framebuffer. Opacity is raised to 0.96 so only ~4% bleeds through
        // (the global traverse set everything to 0.7, which let 30% through).
        const _forceOverStream = (obj: THREE.Object3D) => {
          obj.renderOrder = 55;
          const mesh = obj as THREE.Mesh;
          if (!mesh.isMesh) return;
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach(m => {
            const mat = m as THREE.MeshStandardMaterial;
            mat.depthTest = false;
            mat.opacity   = 0.96;
            mat.needsUpdate = true;
          });
        };
        prefixMap.get('Display')?.traverse(_forceOverStream);

        // ----- Build data streams (curved animated lines: processor → components) -----
        const streamsGroup = new THREE.Group();
        streamsGroup.name  = '__datastreams__';
        const streamList: StreamData[] = [];
        const seenPrefixes = new Set<string>();

        STREAM_TARGETS.forEach((prefix, idx) => {
          const targetGroup = prefixMap.get(prefix);
          if (!targetGroup) return;

          const isRepeat = seenPrefixes.has(prefix);
          seenPrefixes.add(prefix);

          // Compute the XY centre of this component's meshes in GLTF / container-local
          // units. setFromObject is called after container.scale has been set, so Three.js
          // bakes the scale factor into the worldMatrix and returns scaled coordinates.
          // Dividing by scale converts back to the same GLTF-unit space that
          // processorMeshXYRef uses (computed before the container existed, so unscaled).
          const targetBbox = new THREE.Box3().setFromObject(targetGroup);
          const targetCenter = new THREE.Vector3();
          targetBbox.getCenter(targetCenter);
          const targetMeshXY = new THREE.Vector2(targetCenter.x / scale, targetCenter.y / scale);

          // First plastictop: tall arc that crests above the rest.
          // Second plastictop (isRepeat): straight-up S-curve matching the vertical path.
          const straightUp  = isRepeat && prefix === 'plastictop';
          const heightBias  = (prefix === 'plastictop' && !isRepeat) ? 0.75 : 0;

          // Each stream gets a unique phase and frequency so pulses desync naturally
          const phase = (idx / STREAM_TARGETS.length) * Math.PI * 2;
          const freq  = 0.45 + (idx % 5) * 0.12;   // 0.45 – 0.93 Hz

          const positions = new Float32Array((STREAM_SEGMENTS + 1) * 3);
          const aT        = new Float32Array(STREAM_SEGMENTS + 1);
          for (let i = 0; i <= STREAM_SEGMENTS; i++) aT[i] = i / STREAM_SEGMENTS;

          const geo = new THREE.BufferGeometry();
          geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
          geo.setAttribute('aT',       new THREE.BufferAttribute(aT,        1));

          const mat = new THREE.ShaderMaterial({
            vertexShader:   STREAM_VERT,
            fragmentShader: STREAM_FRAG,
            uniforms: {
              uTime:   STREAM_SHARED_TIME,    // shared reference → one write updates all
              uFactor: STREAM_SHARED_FACTOR,
              uPhase:  { value: phase * 0.16 }, // small offset so pulses travel at slightly different rates
            },
            transparent: true,
            depthWrite:  false,
            blending:    THREE.AdditiveBlending,
          });

          const line = new THREE.Line(geo, mat);
          line.frustumCulled = false;  // positions update every frame; skip frustum check
          line.renderOrder   = 50;
          streamsGroup.add(line);

          // Control point Vector3s are stored in the curve AND in StreamData so
          // mutating them in useFrame automatically affects getPoint() results.
          const cp0 = new THREE.Vector3();
          const cp1 = new THREE.Vector3();
          const cp2 = new THREE.Vector3();
          const cp3 = new THREE.Vector3();

          streamList.push({
            line, material: mat, targetGroup, phase, freq, targetMeshXY, heightBias, straightUp, positions,
            _p0: cp0, _p1: cp1, _p2: cp2, _p3: cp3,
            _dir:      new THREE.Vector3(),
            _pr1:      new THREE.Vector3(),
            _pr2:      new THREE.Vector3(),
            _curve:    new THREE.CatmullRomCurve3([cp0, cp1, cp2, cp3], false, 'catmullrom', 0.5),
            _samplePt: new THREE.Vector3(),
          });
        });

        container.add(streamsGroup);
        streamDataRef.current = streamList;

        // Store in ref — no re-render needed, useFrame reads ref directly
        groupsRef.current = groupInfos;
        setContainerGroup(container);
      },
      undefined,
      (err) => console.error('[Phone] load error:', err),
    );
  }, [url]);

  useFrame((state) => {
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

    // Drive hologram + stream shader uniforms
    const elapsed = state.clock.getElapsedTime();
    HOLOGRAM_UNIFORMS.uTime.value   = elapsed;
    HOLOGRAM_UNIFORMS.uFactor.value = factor;
    STREAM_SHARED_TIME.value        = elapsed;
    STREAM_SHARED_FACTOR.value      = factor;

    // Update data stream spline geometry — runs every frame while exploded
    const procGroup  = processorGroupRef.current;
    const procMeshXY = processorMeshXYRef.current;
    if (procGroup && factor > 0.01) {
      streamDataRef.current.forEach((sd) => {
        const { _p0, _p1, _p2, _p3, _dir, _pr1, _pr2 } = sd;

        // Use actual mesh bounding-box XY so streams originate from the real
        // position of the processor chip and each component on the phone face
        // (all THREE.Group positions are at XY=0 since groups are created fresh;
        // only the child meshes carry the actual GLTF layout coordinates).
        _p0.set(procMeshXY.x, procMeshXY.y, procGroup.position.z);
        _p3.set(sd.targetMeshXY.x, sd.targetMeshXY.y, sd.targetGroup.position.z);

        // Clamp Z travel for the straight-up stream BEFORE computing direction/dist.
        // Without this, the full Z delta maps to horizontal movement after the -0.75 Y
        // rotation and the stream looks diagonal rather than vertical in screen space.
        if (sd.straightUp) {
          _p3.z = _p0.z + (sd.targetGroup.position.z - procGroup.position.z) * 0.15;
        }

        _dir.subVectors(_p3, _p0);
        const dist = _dir.length();
        if (dist < 0.001) return;
        _dir.normalize();

        if (sd.straightUp) {
          // S-curve path going nearly straight up along the phone face.
          // amp is scaled to the actual Y rise so the S-shape is always visible.
          const rise    = _p3.y - _p0.y;
          const zTravel = _p3.z - _p0.z;
          const amp     = Math.abs(rise) * 0.13 * factor;
          _p1.set(_p0.x - amp,       _p0.y + rise * 0.35, _p0.z + zTravel * 0.3);
          _p2.set(_p0.x + amp * 0.7, _p0.y + rise * 0.68, _p0.z + zTravel * 0.7);
        } else {
          // Build a perpendicular basis so the swirl orbits the straight path in 3-D
          _pr1.crossVectors(_dir, _streamWorldUp);
          if (_pr1.lengthSq() < 0.0001) _pr1.crossVectors(_dir, _streamXAxis);
          _pr1.normalize();
          _pr2.crossVectors(_dir, _pr1).normalize();

          // Reduced swirl radius keeps paths tight and straight — less fraying
          const swirlR = dist * 0.03 * factor;
          const t1     = elapsed * sd.freq * 0.2 + sd.phase;

          // Two intermediate control points that orbit the direct path like a helix.
          // heightBias lifts _p1 so streams like plastictop arc dramatically upward.
          _p1.lerpVectors(_p0, _p3, 0.35)
             .addScaledVector(_pr1, Math.cos(t1)        * swirlR)
             .addScaledVector(_pr2, Math.sin(t1)        * swirlR);
          _p1.y += sd.heightBias * factor;

          _p2.lerpVectors(_p0, _p3, 0.65)
             .addScaledVector(_pr1, Math.cos(t1 + 2.09) * swirlR * 0.75)
             .addScaledVector(_pr2, Math.sin(t1 + 2.09) * swirlR * 0.75);
        }

        // Sample the Catmull-Rom spline — control pt objects are held by reference
        // inside the curve, so mutating _p0–_p3 above is all that's needed
        for (let i = 0; i <= STREAM_SEGMENTS; i++) {
          sd._curve.getPoint(i / STREAM_SEGMENTS, sd._samplePt);
          const off = i * 3;
          sd.positions[off]     = sd._samplePt.x;
          sd.positions[off + 1] = sd._samplePt.y;
          sd.positions[off + 2] = sd._samplePt.z;
        }

        sd.line.geometry.attributes.position.needsUpdate = true;
        sd.line.geometry.computeBoundingSphere();
      });
    }

    // Keep rendering while lerp is converging or hologram is visible (factor > 0)
    if (Math.abs(smoothFactor.current - target) > 0.001 || factor > 0.01) {
      state.invalidate();
    }
  });

  if (!containerGroup) return null;

  return (
    <group ref={pivotRef} rotation={[-0.07, -0.75, 0]} position={[0.55 + mobileXShift, 0, 0]}>
      <primitive object={containerGroup} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Scene — IBL environment + three-point studio lighting
// ---------------------------------------------------------------------------
function Scene({ modelUrl, scrollFactorRef, mobileXShift, invalidateRef }: {
  modelUrl: string;
  scrollFactorRef: React.RefObject<number>;
  mobileXShift: number;
  invalidateRef: React.MutableRefObject<() => void>;
}) {
  const { gl, scene, invalidate } = useThree();

  // Build a RoomEnvironment IBL once and apply it as the scene environment.
  // Deferred one event-loop tick (setTimeout 0) so shader compilation doesn't
  // block the main thread during the scroll event that triggers canvas mount.
  useEffect(() => {
    let envTexture: THREE.Texture | null = null;
    const id = setTimeout(() => {
      const pmrem = new THREE.PMREMGenerator(gl);
      pmrem.compileEquirectangularShader();
      envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      (scene as THREE.Scene & { environmentIntensity?: number }).environmentIntensity = 0.08;
      scene.environment = envTexture;
      scene.background = null;
      pmrem.dispose();
      invalidate();
    }, 0);
    return () => {
      clearTimeout(id);
      if (envTexture) { envTexture.dispose(); scene.environment = null; }
    };
  }, [gl, scene, invalidate]);

  return (
    <>
      {/* Key light — warm, high from upper-right front */}
      <directionalLight position={[3, 6, 4]} intensity={2.2} color="#fff5e8" />
      {/* Weak cool fill — barely lifts shadows, preserves contrast */}
      <directionalLight position={[-4, 2, 2]} intensity={0.06} color="#c8d8ff" />
      {/* Thin rim — separates back edge from background */}
      <directionalLight position={[0, -3, -4]} intensity={0.15} color="#8899cc" />
      <PhoneModel url={modelUrl} scrollFactorRef={scrollFactorRef} mobileXShift={mobileXShift} invalidateRef={invalidateRef} />
      {/* Bloom post-process — only lights up emissive objects (processor glow).
          luminanceThreshold 0.4 means only pixels brighter than 40% fire the bloom,
          so normal PBR materials are unaffected but the blue emissive glows. */}
      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.4} luminanceSmoothing={0.3} intensity={4.5} radius={0.4} />
        {/* SMAA: image-space AA to smooth jagged edges on piece boundaries at low DPR */}
        <SMAA />
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
  // Ref filled by PhoneModel so the scroll listener can trigger demand frames
  const invalidateRef = useRef<() => void>(() => {});
  // Defer Canvas mount until the section is within 300px of the viewport
  // so Three.js/WebGL and the GLB don't load until the user actually scrolls near it.
  const [canvasReady, setCanvasReady] = useState(false);

  // On mobile (<1024px) shift the model right within 3D space instead of
  // translating the canvas (which would shrink the visible area).
  // 70px ≈ 0.85 Three.js units at fov=40, z=8, ~390px canvas width.
  const [mobileXShift, setMobileXShift] = useState(() => window.innerWidth < 1024 ? 0.61 : 0);
  useEffect(() => {
    const onResize = () => setMobileXShift(window.innerWidth < 1024 ? 0.61 : 0);
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setCanvasReady(true); io.disconnect(); } },
      { rootMargin: '800px' },
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
      // Only wake the canvas while the section is actually in the viewport.
      // When fully above or below, there is nothing to render.
      if (rect.bottom > 0 && rect.top < vh) {
        invalidateRef.current();
      }
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {canvasReady && (
        <CanvasErrorBoundary>
          <Canvas
            frameloop="demand"
            camera={{ position: [0, 0.5, 8], fov: 40 }}
            gl={{ alpha: true, antialias: false, powerPreference: 'low-power',
                 toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
            dpr={[1, Math.min(window.devicePixelRatio, 1.5)]}
            style={{ display: 'block', width: '100%', height: '100%', background: 'transparent' }}
          >
            <Scene modelUrl={modelUrl} scrollFactorRef={scrollFactorRef} mobileXShift={mobileXShift} invalidateRef={invalidateRef} />
          </Canvas>
        </CanvasErrorBoundary>
      )}
    </div>
  );
}
