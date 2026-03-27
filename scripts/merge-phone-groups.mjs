/**
 * Merges phone model meshes by group prefix, then re-compresses with Draco.
 * Input:  public/phone_final.glb  (4479 Draco-compressed meshes)
 * Output: public/phone_v3.glb     (~15 merged meshes, one per animated group)
 *
 * Run: node scripts/merge-phone-groups.mjs
 */

import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { draco, prune, dedup } from '@gltf-transform/functions';
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

// --- Step 1: collect all meshes, group by prefix ---
const groups = new Map(); // prefix → { nodes: [], meshes: [] }

for (const node of root.listNodes()) {
  const name = node.getName() || '';
  const m = name.match(PREFIX_RE);
  const prefix = m ? m[1] : null;
  if (!prefix) continue;

  const mesh = node.getMesh();
  if (!mesh) continue;

  if (!groups.has(prefix)) groups.set(prefix, { nodes: [], meshes: [] });
  groups.get(prefix).nodes.push(node);
  groups.get(prefix).meshes.push(mesh);
}

console.log('Groups found:', [...groups.keys()].sort().join(', '));
console.log('Total nodes per group:', [...groups.entries()].map(([k,v]) => `${k}:${v.nodes.length}`).join(', '));

// --- Step 2: for each group, merge all primitives into a single mesh ---
const { Scene: GScene } = await import('@gltf-transform/core');

for (const [prefix, { nodes, meshes }] of groups) {
  // Collect all primitives across all meshes in this group
  const allPrims = meshes.flatMap(m => m.listPrimitives());
  if (allPrims.length === 0) continue;

  // Create one merged mesh with all primitives
  const mergedMesh = document.createMesh(prefix);
  for (const prim of allPrims) {
    mergedMesh.addPrimitive(prim);
  }

  // Keep the first node, point it at the merged mesh, remove the rest
  const keeper = nodes[0];
  keeper.setName(prefix);
  keeper.setMesh(mergedMesh);

  for (let i = 1; i < nodes.length; i++) {
    nodes[i].setMesh(null);
    nodes[i].dispose();
  }
}

// --- Step 3: prune orphaned meshes/accessors, re-compress with Draco ---
console.log('Pruning and re-compressing with Draco...');
await document.transform(
  prune(),
  draco({
    quantizationVolume: 'scene',
    quantizePosition:   12,
    quantizeNormal:     8,
    quantizeTexcoord:   10,
    quantizeColor:      8,
  }),
);

// Verify output
const finalNodes = root.listNodes().filter(n => n.getMesh());
console.log('Output meshes:', finalNodes.length, finalNodes.map(n => n.getName()).join(', '));

await io.write(OUTPUT, document);

const { statSync } = await import('fs');
const inSize  = statSync(INPUT).size;
const outSize = statSync(OUTPUT).size;
console.log(`\n${path.basename(INPUT)}  ${(inSize/1024/1024).toFixed(1)}MB → ${path.basename(OUTPUT)} ${(outSize/1024/1024).toFixed(1)}MB`);
