/**
 * Bundle the portable build into ONE self-contained .html file.
 *
 * Everything — JS, CSS, every photo and icon — is inlined as base64 data URIs,
 * so the result is a single file you can email, drop on a USB stick or open
 * straight off the desktop with no server and no sibling folders.
 *
 * Several portfolio photos are byte-identical copies of venue photos, so
 * images are deduplicated by content hash and each unique file is embedded
 * once, then referenced by every path that maps to it.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

const src = path.resolve('dist-portable');
const out = path.resolve('../colosseum-preview.html');
if (!fs.existsSync(src)) {
  console.error('dist-portable missing — run `npm run build:portable` first');
  process.exit(1);
}

const MIME = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.gif': 'image/gif',
  '.woff2': 'font/woff2', '.woff': 'font/woff',
};

// ---- collect every asset under dist-portable, deduplicated by content ----
const byHash = new Map();   // hash -> data URI
const uriFor = new Map();   // "/img/foo.jpg" -> data URI
let rawBytes = 0;

function walk(dir, base = '') {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    const rel = base + '/' + entry.name;
    if (entry.isDirectory()) { walk(abs, rel); continue; }
    const ext = path.extname(entry.name).toLowerCase();
    if (!MIME[ext]) continue;
    const buf = fs.readFileSync(abs);
    rawBytes += buf.length;
    const hash = crypto.createHash('sha1').update(buf).digest('hex');
    if (!byHash.has(hash)) byHash.set(hash, `data:${MIME[ext]};base64,${buf.toString('base64')}`);
    uriFor.set(rel, byHash.get(hash));
  }
}
walk(path.join(src, 'img'), '/img');
for (const f of ['icon.svg', 'icon-maskable.svg']) {
  const abs = path.join(src, f);
  if (!fs.existsSync(abs)) continue;
  const buf = fs.readFileSync(abs);
  rawBytes += buf.length;
  uriFor.set('/' + f, `data:${MIME['.svg']};base64,${buf.toString('base64')}`);
}

// Optional artwork that may not have been supplied yet. The export must never
// point outside itself, so any missing optional asset is swapped for a 1x1
// transparent pixel (the element stays, but shows nothing).
const OPTIONAL = ['/img/brand/colosseum-logo.png'];
const BLANK_PX =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

/** Replace every asset path in a blob of JS/CSS with its data URI. */
function inlineAssets(text) {
  let n = 0;
  // longest paths first so /img/portfolio/x.jpg wins over /img/
  const keys = [...uriFor.keys()].sort((a, b) => b.length - a.length);
  for (const key of keys) {
    // the portable build rewrote these to ../img/... and ./img/...
    for (const variant of ['../' + key.slice(1), './' + key.slice(1), key]) {
      if (!text.includes(variant)) continue;
      text = text.split(variant).join(uriFor.get(key));
      n++;
    }
  }
  for (const opt of OPTIONAL) {
    if (uriFor.has(opt)) continue; // it was supplied and is already inlined
    for (const variant of ['../' + opt.slice(1), './' + opt.slice(1), opt]) {
      if (text.includes(variant)) { text = text.split(variant).join(BLANK_PX); n++; }
    }
  }
  return [text, n];
}

const assetDir = path.join(src, 'assets');
const jsFile = fs.readdirSync(assetDir).find((f) => f.endsWith('.js'));
const cssFile = fs.readdirSync(assetDir).find((f) => f.endsWith('.css'));

// Chrome refuses to execute <script type="module"> from a file:// origin, so the
// ES-module chunk Vite emits is re-bundled to a classic IIFE for the single file.
const iifePath = path.join('node_modules', '.cache', 'singlefile.js');
fs.mkdirSync(path.dirname(iifePath), { recursive: true });
execSync(`npx esbuild ${JSON.stringify(path.join(assetDir, jsFile))} --bundle --format=iife --outfile=${JSON.stringify(iifePath)} --log-level=error`);

let [js, jsHits] = inlineAssets(fs.readFileSync(iifePath, 'utf8'));
let [css, cssHits] = inlineAssets(fs.readFileSync(path.join(assetDir, cssFile), 'utf8'));

// ---- assemble the document ----
let html = fs.readFileSync(path.join(src, 'index.html'), 'utf8');
html = html
  .replace(/<script[^>]*src="[^"]*"[^>]*><\/script>/g, '')
  .replace(/<link[^>]*rel="stylesheet"[^>]*>/g, '')
  .replace(/<link[^>]*rel="manifest"[^>]*>/g, '');       // no manifest file alongside

// icons referenced from <head>
for (const [key, uri] of uriFor) {
  for (const v of ['./' + key.slice(1), key]) html = html.split(`href="${v}"`).join(`href="${uri}"`);
}

// NB: a plain string replacement would interpret $& / $' / $1 inside the
// minified bundle as replacement patterns and silently corrupt the code, so
// insert via a function replacer. Also neutralise any literal </script>.
const safeJs = js.replaceAll('</script', '<\\/script');
html = html.replace('</head>', () => `  <style>\n${css}\n  </style>\n</head>`);
html = html.replace('</body>', () => `  <script>\n${safeJs}\n  </script>\n</body>`);

fs.writeFileSync(out, html);

// Asset paths assembled at runtime (e.g. `/img/x/${name}`) never appear as
// literals, so they silently escape inlining. Catch the tell-tale fragment.
const dynamic = (html.match(/["'`]\.\.\/img\/[a-z-]*\/?\$\{/g) || []).length;
if (dynamic) {
  console.error(`FAIL ${dynamic} image path(s) are built at runtime and cannot be inlined — use literal paths`);
  process.exit(1);
}

const leftovers = (html.match(/(src|href)="\.?\.?\/(img|icon|assets)/g) || []).length;
const mb = (b) => (b / 1024 / 1024).toFixed(2) + ' MB';
console.log(
  `single file: ${path.basename(out)} — ${mb(Buffer.byteLength(html))} ` +
  `(${byHash.size} unique assets from ${uriFor.size} paths, ${mb(rawBytes)} raw; ` +
  `${jsHits} js + ${cssHits} css refs inlined)`,
);
if (leftovers) { console.error(`FAIL ${leftovers} external reference(s) remain`); process.exit(1); }
