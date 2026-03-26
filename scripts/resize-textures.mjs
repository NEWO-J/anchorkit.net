// Resizes all public textures actually used by the 3D scene to max 1024px,
// JPEG quality 80. Originals are backed up to public/textures_original/.
// Run once: node scripts/resize-textures.mjs

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');
const backupDir = path.join(publicDir, 'textures_original');

// Only the textures actually referenced in PhoneExplodeScene MAT_CONFIGS
const USED = [
  'ipx_batterydiffuse.jpg',
  'ipx_metalsheets_diffuse.jpg',
  'ipx_metalsheets_bump.jpg',
  'circuitboards_diffuse.JPG',
  'ipx_PCBdark_diffuse.jpg',
  'ipx_PCB_diffuse.jpg',
  'ipx_PCB_bump.jpg',
  'ipx_lens.jpg',
  'ipx_flash.jpg',
];

const MAX_PX = 1024;
const QUALITY = 80;

fs.mkdirSync(backupDir, { recursive: true });

let savedTotal = 0;

for (const file of USED) {
  const src = path.join(publicDir, file);
  if (!fs.existsSync(src)) { console.log(`SKIP (not found): ${file}`); continue; }

  const backup = path.join(backupDir, file);
  if (!fs.existsSync(backup)) fs.copyFileSync(src, backup);

  const before = fs.statSync(src).size;
  const img = sharp(src);
  const meta = await img.metadata();
  const needsResize = meta.width > MAX_PX || meta.height > MAX_PX;

  await img
    .resize(needsResize ? { width: MAX_PX, height: MAX_PX, fit: 'inside', withoutEnlargement: true } : undefined)
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(src + '.tmp');

  fs.renameSync(src + '.tmp', src);
  const after = fs.statSync(src).size;
  const saved = before - after;
  savedTotal += saved;
  console.log(`${file}: ${(before/1024/1024).toFixed(1)}MB → ${(after/1024/1024).toFixed(1)}MB  (-${(saved/1024/1024).toFixed(1)}MB)`);
}

console.log(`\nTotal saved: ${(savedTotal/1024/1024).toFixed(1)} MB`);
console.log(`Originals backed up to public/textures_original/`);
