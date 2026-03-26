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
// Material colour palette keyed on GLTF material name
// ---------------------------------------------------------------------------
const MAT_COLORS: Record<string, string> = {
  battery:       '#f0c040',  // amber / yellow
  internalmetal: '#a8b0be',  // cool silver
  board:         '#2a6e2a',  // PCB green
  board2:        '#2a6e2a',
  board3:        '#2a6e2a',
  sheets:        '#c8ccd4',  // light silver
  mesh:          '#3a3a3a',  // dark mesh
  black:         '#1e1e22',  // near-black
  components:    '#b87333',  // copper
  glasslens:     '#1a2a44',  // dark blue glass
  sensor:        '#252528',  // very dark
  flexPCB:       '#c87c00',  // amber flex
  flexPCB2:      '#c87c00',
  flexPCB3:      '#c87c00',
  flexPCB4:      '#c87c00',
  flexPCB5:      '#c87c00',
  flexPCB6:      '#c87c00',
  gold:          '#e8c040',  // gold
  spacersilver:  '#c0c4cc',  // silver
  logos:         '#e0e0e8',  // near-white
  flashglass:    '#fffff0',  // warm white
  flash:         '#ffffff',  // white
  camedge:       '#202024',  // very dark
  blue:          '#1a4088',  // deep blue
  glassfront:    '#0d1828',  // very dark glass
};

const DEFAULT_MAT_COLOR = '#9098a8';

// ---------------------------------------------------------------------------
// Component-group prefix → logical section (used only for grouping, not for
// per-group colour — colour is driven by material name above)
// ---------------------------------------------------------------------------
const GROUP_PREFIX_RE = /^g\s+([a-zA-Z_]+?)(?:_\d+)?$/;

// ---------------------------------------------------------------------------
// Per-group explode data
// ---------------------------------------------------------------------------
interface GroupInfo {
  group: THREE.Group;
  origPos: THREE.Vector3;
  explodePos: THREE.Vector3;
}

// ---------------------------------------------------------------------------
// Build per-material MeshStandardMaterial cache
// ---------------------------------------------------------------------------
function buildMaterialCache(gltfMaterials: Array<{ name?: string }>): Map<string, THREE.MeshStandardMaterial> {
  const cache = new Map<string, THREE.MeshStandardMaterial>();
  gltfMaterials.forEach(({ name }) => {
    if (!name) return;
    const hex = MAT_COLORS[name] ?? DEFAULT_MAT_COLOR;
    cache.set(name, new THREE.MeshStandardMaterial({
      color: hex,
      roughness: 0.45,
      metalness: name === 'gold' || name === 'components' || name === 'internalmetal' || name === 'spacersilver' ? 0.8 : 0.3,
      transparent: name === 'glasslens' || name === 'glassfront' || name === 'flashglass',
      opacity: name === 'glasslens' || name === 'glassfront' ? 0.55 : 1.0,
    }));
  });
  return cache;
}

// ---------------------------------------------------------------------------
// Main 3-D scene component
// ---------------------------------------------------------------------------
function PhoneModel({ url }: { url: string }) {
  const pivotRef   = useRef<THREE.Group>(null);
  const [groups, setGroups]           = useState<GroupInfo[]>([]);
  const [containerGroup, setContainerGroup] = useState<THREE.Group | null>(null);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        const root = gltf.scene;

        // Build per-material colour cache
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const matCache = buildMaterialCache((gltf as any).parser?.json?.materials ?? []);

        // Apply materials to every mesh
        root.traverse((child) => {
          if (!(child as THREE.Mesh).isMesh) return;
          const mesh = child as THREE.Mesh;
          const matName = (Array.isArray(mesh.material)
            ? (mesh.material[0] as THREE.MeshStandardMaterial)
            : (mesh.material as THREE.MeshStandardMaterial))?.name ?? '';
          mesh.material = matCache.get(matName)
            ?? new THREE.MeshStandardMaterial({ color: DEFAULT_MAT_COLOR, roughness: 0.45, metalness: 0.3 });
        });

        // ── Group flat children by component-name prefix ──────────────────
        const prefixMap = new Map<string, THREE.Group>();
        const ungrouped = new THREE.Group();  // fallback

        // snapshot children array before we start reparenting
        const children = [...root.children];

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
        if (ungrouped.children.length) container.add(ungrouped);

        // ── Fit + centre ──────────────────────────────────────────────────
        const overallBox = new THREE.Box3().setFromObject(container);
        if (overallBox.isEmpty()) return;

        const size = new THREE.Vector3();
        overallBox.getSize(size);
        const center = new THREE.Vector3();
        overallBox.getCenter(center);

        const maxDim = Math.max(size.x, size.y, size.z);
        const targetSize = 3.5;
        const scale = maxDim > 0 ? targetSize / maxDim : 1;

        container.scale.setScalar(scale);
        // Re-measure after scale to get the scaled centre
        const scaledBox = new THREE.Box3().setFromObject(container);
        const scaledCenter = new THREE.Vector3();
        scaledBox.getCenter(scaledCenter);
        container.position.sub(scaledCenter);

        // ── Compute per-group explode directions ──────────────────────────
        const groupInfos: GroupInfo[] = [];
        const explodeDist = targetSize * 0.55;  // world-space spread distance

        prefixMap.forEach((compGroup) => {
          const gbox = new THREE.Box3().setFromObject(compGroup);
          if (gbox.isEmpty()) return;

          const gCenter = new THREE.Vector3();
          gbox.getCenter(gCenter);

          // World-space direction from overall model centre → component centre
          const dir = gCenter.clone().sub(scaledCenter.clone().add(container.position));
          if (dir.lengthSq() < 1e-6) dir.set(0, 1, 0);
          dir.normalize();

          const origPos = compGroup.position.clone();
          // Explode in world space: Δworld = dir * explodeDist
          // compGroup is child of container (scaled), so local Δ = Δworld / scale
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
    <CanvasErrorBoundary>
      <Canvas
        camera={{ position: [0, 0.5, 8], fov: 40 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
        dpr={[1, Math.min(window.devicePixelRatio, 2)]}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
      >
        <Scene modelUrl={modelUrl} />
      </Canvas>
    </CanvasErrorBoundary>
  );
}
