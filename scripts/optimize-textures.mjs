// Aggressively optimizes phone model textures: 512px max, WebP q=80.
// Originals backed up to public/textures_original/.
// Run once: node scripts/optimize-textures.mjs

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');
const backupDir = path.join(publicDir, 'textures_original');

// Textures actually used by PhoneExplodeScene — grouped by quality tier
const TEXTURES = [
  // Most visible textures → 768px
  { src: 'circuitboards_diffuse.JPG',       out: 'circuitboards_diffuse.webp',      max: 768 },
  { src: 'ipx_metalsheets_diffuse.jpg',     out: 'ipx_metalsheets_diffuse.webp',    max: 768 },
  { src: 'ipx_PCBdark_diffuse.jpg',         out: 'ipx_PCBdark_diffuse.webp',        max: 768 },
  { src: 'ipx_PCB_diffuse.jpg',             out: 'ipx_PCB_diffuse.webp',            max: 768 },
  // Less visible → 512px
  { src: 'ipx_batterydiffuse.jpg',          out: 'ipx_batterydiffuse.webp',         max: 512 },
  { src: 'ipx_lens.jpg',                    out: 'ipx_lens.webp',                   max: 512 },
  { src: 'ipx_flash.jpg',                   out: 'ipx_flash.webp',                  max: 512 },
  // Bump maps at 512px (used for normal detail, doesn't need high res)
  { src: 'ipx_metalsheets_bump.jpg',        out: 'ipx_metalsheets_bump.webp',       max: 512 },
  { src: 'ipx_PCB_bump.jpg',               out: 'ipx_PCB_bump.webp',               max: 512 },
];

const QUALITY = 82;

fs.mkdirSync(backupDir, { recursive: true });

let savedTotal = 0;

for (const { src, out, max } of TEXTURES) {
  const srcPath = path.join(publicDir, src);
  const outPath = path.join(publicDir, out);

  if (!fs.existsSync(srcPath)) { console.log(`SKIP (not found): ${src}`); continue; }

  // Backup original if not already backed up
  const backupPath = path.join(backupDir, src);
  if (!fs.existsSync(backupPath)) fs.copyFileSync(srcPath, backupPath);

  const beforeSrc = fs.statSync(srcPath).size;
  const beforeOut = fs.existsSync(outPath) ? fs.statSync(outPath).size : 0;

  const meta = await sharp(srcPath).metadata();
  const needsResize = meta.width > max || meta.height > max;

  await sharp(srcPath)
    .resize(needsResize ? { width: max, height: max, fit: 'inside', withoutEnlargement: true } : undefined)
    .webp({ quality: QUALITY, effort: 6 })
    .toFile(outPath + '.tmp');

  fs.renameSync(outPath + '.tmp', outPath);
  const after = fs.statSync(outPath).size;
  const saved = beforeSrc - after;
  savedTotal += saved;
  console.log(`${src} → ${out}: ${(beforeSrc/1024/1024).toFixed(1)}MB → ${(after/1024).toFixed(0)}KB  (-${(saved/1024/1024).toFixed(1)}MB)`);
}

console.log(`\nTotal saved: ${(savedTotal/1024/1024).toFixed(1)} MB`);
console.log(`Originals backed up to public/textures_original/`);
