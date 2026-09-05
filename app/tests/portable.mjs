// Loads the portable build through a real file:// URL and checks it boots and routes.
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const dir = path.resolve('dist-portable');
if (!fs.existsSync(path.join(dir, 'index.html'))) {
  console.error('FAIL dist-portable not built'); process.exit(1);
}
let fail = 0;
const bad = (m) => { fail++; console.log('FAIL ' + m); };

const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
if (/(src|href)="\//.test(html)) bad('index.html still has root-absolute local refs');
if (/serviceWorker/.test(html)) bad('service worker registration not stripped');

const jsFile = fs.readdirSync(path.join(dir, 'assets')).find(f => f.endsWith('.js'));
const js = fs.readFileSync(path.join(dir, 'assets', jsFile), 'utf8');
// jsdom cannot execute an ES module, so re-bundle the shipped chunk to IIFE purely
// for the boot check. The static assertions above/below run on the real artifact.
const { execSync } = await import('node:child_process');
const iife = path.join(root_cache(), 'portable-boot.js');
execSync(`npx esbuild ${path.join(dir, 'assets', jsFile)} --bundle --format=iife --outfile=${iife} --log-level=error`);
const runnable = fs.readFileSync(iife, 'utf8');
function root_cache() {
  const d = path.resolve('node_modules/.cache'); fs.mkdirSync(d, { recursive: true }); return d;
}
if (/["'`]\/img\//.test(js)) bad('bundle still references root-absolute /img/');
if (!/\.\.\/img\//.test(js)) bad('bundle has no relative image paths');

// boot it from an actual file:// document URL
const fileUrl = pathToFileURL(path.join(dir, 'index.html')).href;
const dom = new JSDOM(html.replace(/<script[^>]*><\/script>/g, ''), {
  url: fileUrl, runScripts: 'outside-only', pretendToBeVisual: true,
});
const { window } = dom;
window.matchMedia = () => ({ matches: false, addEventListener(){}, removeEventListener(){} });
window.scrollTo = () => {};
try { window.eval(runnable); } catch (e) { bad('bundle threw on file://: ' + e.message); }
await new Promise(r => setTimeout(r, 250));

const root = window.document.getElementById('root');
const text = root?.textContent ?? '';
if (text.length < 100) bad(`app did not render (${text.length} chars)`);
if (window.document.querySelectorAll('nav a').length !== 6) bad('nav did not render');
console.log(`file:// boot OK — ${text.length} chars rendered`);

// hash routing must be in use, otherwise deep links break off a filesystem
const links = [...window.document.querySelectorAll('nav a')].map(a => a.getAttribute('href'));
if (!links.every(h => h.startsWith('#/'))) bad('nav links are not hash-based: ' + links.join(' '));
else console.log('hash routing active:', links.join(' '));

// navigate to the portfolio route the way a click would
window.location.hash = '#/portfolio';
window.dispatchEvent(new window.HashChangeEvent('hashchange'));
await new Promise(r => setTimeout(r, 250));
if (!root.textContent.includes('Portfolio')) bad('hash navigation to /portfolio failed');
else console.log('hash navigation to /portfolio OK');

// every referenced local image must exist on disk
const imgs = [...new Set((js.match(/\.\.\/img\/[a-z0-9/-]+\.jpg/g) || []))];
for (const rel of imgs) {
  const f = path.join(dir, rel.replace('../', ''));
  if (!fs.existsSync(f)) bad('missing image file: ' + rel);
}
console.log(`${imgs.length} bundled image paths all resolve on disk`);

console.log(fail ? `${fail} FAILURES` : 'All portable checks passed');
process.exit(fail ? 1 : 0);
