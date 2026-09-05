/**
 * Post-processing for the portable build.
 *
 * Image paths are authored as root-absolute ("/img/foo.jpg") which is correct for a
 * hosted site but resolves to the filesystem root under file://. Rewrite them to be
 * relative to the document, and drop the service worker registration (it cannot be
 * registered from file:// and would only log errors).
 */
import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve('dist-portable');
if (!fs.existsSync(dir)) {
  console.error('dist-portable missing — run the build first');
  process.exit(1);
}

let patched = 0;
let files = 0;
const assetDir = path.join(dir, 'assets');
for (const f of fs.readdirSync(assetDir)) {
  if (!/\.(js|css)$/.test(f)) continue;
  const p = path.join(assetDir, f);
  const before = fs.readFileSync(p, 'utf8');
  // assets/ sits one level below index.html, so step up before entering img/
  // paths appear in double quotes, single quotes and template literals
  const after = before
    .replaceAll('"/img/', '"../img/')
    .replaceAll("'/img/", "'../img/")
    .replaceAll('`/img/', '`../img/');
  if (after !== before) {
    patched += (before.match(/["'`]\/img\//g) || []).length;
    files++;
    fs.writeFileSync(p, after);
  }
}

const idx = path.join(dir, 'index.html');
let html = fs.readFileSync(idx, 'utf8');
html = html.replace(/<script>[\s\S]*?serviceWorker[\s\S]*?<\/script>/g, '');
html = html.replaceAll('"/img/', '"./img/');
fs.writeFileSync(idx, html);

const leftover = fs
  .readdirSync(assetDir)
  .filter((f) => /\.(js|css)$/.test(f))
  .flatMap((f) => fs.readFileSync(path.join(assetDir, f), 'utf8').match(/["'`]\/img\//g) || []);

console.log(
  `portable: rewrote ${patched} image paths across ${files} file(s); ${leftover.length} absolute refs left`,
);
process.exit(leftover.length ? 1 : 0);
