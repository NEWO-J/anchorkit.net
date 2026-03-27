/**
 * Merges phone model geometry by group prefix, producing one Draco primitive
 * per material per group (~30-40 primitives total vs 4479 original).
 *
 * Pipeline:
 *   phone_final.glb (4479 Draco primitives)
 *   → decode Draco (prune forces decode)
 *   → restructure: one parent node per group, children = original nodes
 *   → join: merges geometry within each parent (same-material prims merged)
 *   → re-encode with Draco quantization
 *   → phone_v3.glb (~30 primitives, ~15 mesh nodes)
 *
 * Run: node scripts/merge-phone-groups.mjs
 */

import { NodeIO, Node } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune, join, draco } from '@gltf-transform/functions';
import draco3d from 'draco3d';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INPUT  = path.join(__dirname, '..', 'public', 'phone_final.glb');
const OUTPUT = path.join(__dirname, '..', 'public', 'phone_v3.glb');

// Must match GROUP_PREFIX_RE in PhoneExplodeScene.tsx
const PREFIX_RE = /^g[_ ]([a-zA-Z0-9_]+?)(?:_\d+)?$/;

const decoderModule = await draco3d.createDecoderModule();
const encoderModule = await draco3d.createEncoderModule();

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    'draco3d.decoder': decoderModule,
    'draco3d.encoder': encoderModule,
  });

console.log('Reading', INPUT, '...');
const document = await io.read(INPUT);
const root = document.getRoot();
const scene = root.listScenes()[0];

// --- Step 1: walk the scene, group nodes by prefix ---
const prefixNodes = new Map(); // prefix → Node[]

for (const node of root.listNodes()) {
  const name = node.getName() || '';
  const m = name.match(PREFIX_RE);
  if (!m) continue;
  const prefix = m[1];
  if (!prefixNodes.has(prefix)) prefixNodes.set(prefix, []);
  prefixNodes.get(prefix).push(node);
}

console.log('Groups found:', [...prefixNodes.keys()].sort().join(', '));

// --- Step 2: create one parent node per group; move group nodes under it ---
// This lets gltf-transform's `join` merge geometry within each parent.
const groupParents = [];

for (const [prefix, nodes] of prefixNodes) {
  const parent = document.createNode(prefix);
  scene.addChild(parent);

  for (const n of nodes) {
    // Detach from current parent then re-attach under the group parent
    const oldParent = n.getParentNode?.();
    if (oldParent) oldParent.removeChild(n);
    else {
      // It's a direct scene child — remove from scene
      scene.removeChild(n);
    }
    parent.addChild(n);
  }

  groupParents.push({ prefix, parent });
}

// --- Step 3: prune orphans, join geometry within each group, re-compress ---
console.log('Transforming (prune → join → draco)...');
await document.transform(
  prune(),
  join({ keepNamed: false }),        // merges same-material geometry within each parent
  prune(),                           // clean up again after join
  draco({
    quantizationVolume: 'scene',
    quantizePosition:   12,
    quantizeNormal:     8,
    quantizeTexcoord:   10,
    quantizeColor:      8,
  }),
);

// --- Report ---
const meshNodes = root.listNodes().filter(n => n.getMesh());
const totalPrims = meshNodes.reduce((s, n) => s + n.getMesh().listPrimitives().length, 0);
console.log('\nOutput:');
console.log('  Mesh nodes:', meshNodes.length);
console.log('  Total primitives (= Draco decode ops):', totalPrims);
console.log('  Groups:', meshNodes.map(n => `${n.getName()}(${n.getMesh().listPrimitives().length})`).join(', '));

await io.write(OUTPUT, document);

const { statSync } = await import('fs');
const inSize  = statSync(INPUT).size;
const outSize = statSync(OUTPUT).size;
console.log(`\n${path.basename(INPUT)} ${(inSize/1024/1024).toFixed(1)}MB → ${path.basename(OUTPUT)} ${(outSize/1024/1024).toFixed(1)}MB`);
