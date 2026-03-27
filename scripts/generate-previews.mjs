/**
 * Generates small WebP carousel previews from full-res source assets.
 * Photos → 320px wide WebP q=65  (displayed at w-52/h-40 = 208×160px)
 * Videos → uses the first JPEG frame embedded in the mp4 container if available,
 *           otherwise skips (poster will be a grey placeholder in code).
 *
 * Run: node scripts/generate-previews.mjs
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir  = path.join(__dirname, '..', 'src', 'assets');
const previewDir = path.join(__dirname, '..', 'public', 'previews');

fs.mkdirSync(previewDir, { recursive: true });

const photos = ['0','1','2','3','5','6','7','9','10'];
let savedTotal = 0;

for (const name of photos) {
  const src = path.join(assetsDir, `${name}.jpg`);
  const out = path.join(previewDir, `${name}.webp`);
  if (!fs.existsSync(src)) { console.log(`SKIP: ${name}.jpg not found`); continue; }

  const before = fs.statSync(src).size;
  await sharp(src)
    .resize({ width: 320, height: 220, fit: 'cover' })
    .webp({ quality: 65, effort: 6 })
    .toFile(out);
  const after = fs.statSync(out).size;
  savedTotal += before - after;
  console.log(`${name}.jpg  ${(before/1024).toFixed(0)}KB → ${name}.webp ${(after/1024).toFixed(0)}KB`);
}

console.log(`\nTotal saved: ${(savedTotal/1024/1024).toFixed(1)} MB`);
console.log('Previews written to public/previews/');
console.log('\nNOTE: For video posters (4.mp4, 8.mp4), extract a frame manually:');
console.log('  ffmpeg -i src/assets/4.mp4 -vframes 1 -q:v 2 public/previews/4.jpg');
console.log('  ffmpeg -i src/assets/8.mp4 -vframes 1 -q:v 2 public/previews/8.jpg');
