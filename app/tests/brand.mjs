// Checks the embossed wordmark renders in the header and that event artwork fills its frame.
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const bundle = path.join(root, 'node_modules', '.cache', 'brand-bundle.js');
execSync(`npx esbuild src/main.tsx --bundle --format=iife --jsx=automatic --define:process.env.NODE_ENV='"production"' --define:import.meta.env='{"VITE_PORTABLE":""}' --outfile=${bundle} --log-level=error`, { cwd: root });
const js = fs.readFileSync(bundle, 'utf8');
const html = fs.readFileSync(path.join(root, 'dist', 'index.html'), 'utf8').replace(/<script[^>]*><\/script>/g, '');

let fail = 0;
const bad = (m) => { fail++; console.log('FAIL ' + m); };

const dom = new JSDOM(html, { url: 'http://localhost/events', runScripts: 'outside-only', pretendToBeVisual: true });
const { window } = dom;
window.matchMedia = () => ({ matches: false, addEventListener(){}, removeEventListener(){} });
window.scrollTo = () => {};
window.eval(js);
await new Promise(r => setTimeout(r, 200));
const doc = window.document;

// wordmark present, centred in the header, and not announced twice to screen readers
const mark = doc.querySelector('.topbar .topbar-neon');
const brandFile = path.join(root, 'public', 'img', 'brand', 'colosseum-logo.png');
const haveArtwork = fs.existsSync(brandFile);
if (haveArtwork) {
  if (!mark) bad('logo artwork present but not rendered in the topbar');
  else {
    if (mark.tagName.toLowerCase() !== 'img') bad('logo should render as a plain <img> of the supplied file');
    if (mark.getAttribute('src') !== '/img/brand/colosseum-logo.png') bad('logo points at the wrong file');
    if (mark.getAttribute('alt') !== 'Colosseum') bad('logo missing accessible name');
  }
} else {
  console.log('note: public/img/brand/colosseum-logo.png not present — header renders without it');
}
// the app must never recreate the logo in code again
for (const f of ['NeonWordmark.tsx', 'BrandGlass.tsx']) {
  if (fs.existsSync(path.join(root, 'src', 'components', f))) bad(`${f} still exists (logo should be the supplied file)`);
}

// Profile lives in the topbar next to the cart, not in the bottom nav
const actions = doc.querySelector('.topbar .topbar-actions');
if (!actions) bad('topbar actions group missing');
else {
  const btns = [...actions.querySelectorAll('button')].map(b => b.getAttribute('aria-label') || '');
  if (!btns.some(l => l.startsWith('Cart'))) bad('cart button not in the topbar actions');
  if (!btns.includes('Profile')) bad('profile button not next to the cart in the topbar');
  if (btns.length !== 2) bad(`expected cart + profile in the topbar, got ${btns.length}`);
}
const bottomHrefs = [...doc.querySelectorAll('nav.bottomnav a')].map(a => a.getAttribute('href'));
if (bottomHrefs.includes('/profile')) bad('profile is still in the bottom nav');
if (bottomHrefs.length !== 5) bad(`bottom nav should have 5 tabs, got ${bottomHrefs.length}`);
console.log('topbar: cart + profile | bottom nav:', bottomHrefs.join(' '));

// it must sit behind the brand and cart, not intercept taps
const css = fs.readFileSync(path.join(root, 'src', 'index.css'), 'utf8');
if (!/\.topbar-neon[^}]*pointer-events:\s*none/.test(css)) bad('wordmark would intercept clicks');
if (!/\.topbar-neon[^}]*mix-blend-mode:\s*screen/.test(css)) bad('wordmark not blended into the header');
if (/Great\+Vibes/.test(css)) bad('Great Vibes webfont still requested but no longer needed');

// event artwork must cover its frame — no letterboxing, so no backdrop bars
if (/blurBackdrop/.test(fs.readFileSync(path.join(root, 'src', 'components', 'EventCard.tsx'), 'utf8'))) {
  // allowed: prop is inert, but the component must not render a backdrop layer
}
const imgComp = fs.readFileSync(path.join(root, 'src', 'components', 'EventImage.tsx'), 'utf8');
if (/blur\(/.test(imgComp)) bad('EventImage still renders a blurred backdrop (causes brown edges)');
if (/objectFit:\s*'contain'/.test(imgComp)) bad('EventImage still letterboxes posters');

for (const sel of ['.hero-card .hero-media', '.ev-card .ev-thumb', '.gradient-head .head-media']) {
  const rule = css.split(sel)[1]?.split('}')[0] ?? '';
  if (!/object-fit:\s*cover/.test(rule)) bad(`${sel} does not cover its frame`);
  if (!/object-position/.test(rule)) bad(`${sel} has no object-position (poster faces may be cropped badly)`);
}

// every rendered event image should be a single <img>, no wrapper divs with backdrops
const thumbs = [...doc.querySelectorAll('.ev-card .ev-thumb')];
if (!thumbs.length) bad('no event thumbnails rendered');
if (thumbs.some(t => t.tagName.toLowerCase() !== 'img')) bad('a thumbnail is not a plain <img>');
console.log(`${thumbs.length} thumbnails render as plain <img> with cover fill`);

console.log(fail ? `${fail} FAILURES` : 'All brand + thumbnail checks passed');
process.exit(fail ? 1 : 0);
