// Boots the single-file export through a real file:// URL with NO sibling files on disk.
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const srcFile = path.resolve('../colosseum-preview.html');
if (!fs.existsSync(srcFile)) { console.error('FAIL colosseum-preview.html missing'); process.exit(1); }
let fail = 0;
const bad = (m) => { fail++; console.log('FAIL ' + m); };

const html = fs.readFileSync(srcFile, 'utf8');

// 1. it must be genuinely self-contained
if (/(src|href)=["']\.?\.?\/(img|assets|icon)/.test(html)) bad('external local reference remains');
if (/<script[^>]+src=/.test(html)) bad('external script tag remains');
if (/<link[^>]+rel=["']stylesheet/.test(html)) bad('external stylesheet remains');
if (/type=["']module["']/.test(html)) bad('module script — Chrome blocks these on file://');
if (!/data:image\/(jpeg|svg\+xml);base64,/.test(html)) bad('no inlined image data');

// 2. copy it ALONE into an empty dir, so any missing dependency really breaks
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sf-'));
const lone = path.join(tmp, 'colosseum-preview.html');
fs.copyFileSync(srcFile, lone);
if (fs.readdirSync(tmp).length !== 1) bad('test dir not isolated');

const dom = new JSDOM(fs.readFileSync(lone, 'utf8'), {
  url: pathToFileURL(lone).href, runScripts: 'dangerously', pretendToBeVisual: true,
  resources: undefined, // no external fetching whatsoever
});
const { window } = dom;
window.matchMedia = window.matchMedia || (() => ({ matches: false, addEventListener(){}, removeEventListener(){} }));
window.scrollTo = () => {};
await new Promise(r => setTimeout(r, 400));

const doc = window.document;
const root = doc.getElementById('root');
const text = root?.textContent ?? '';
if (text.length < 200) bad(`app did not render from a lone file (${text.length} chars)`);
else console.log(`rendered ${text.length} chars from an isolated file://`);

const nav = doc.querySelectorAll('nav a');
if (nav.length !== 5) bad(`expected 5 nav links, got ${nav.length}`);
if (![...nav].every(a => (a.getAttribute('href') || '').startsWith('#/'))) bad('nav is not hash-based');

// 3. images must all be data URIs, none pointing at the filesystem
const imgs = [...doc.querySelectorAll('#root img')];
const external = imgs.filter(i => {
  const s = i.getAttribute('src');
  if (s === null) return true;                       // <img> with no src at all
  return !s.startsWith('data:') && !s.startsWith('http');
});
if (external.length) {
  bad(`${external.length} image(s) not self-contained`);
  external.slice(0, 3).forEach(i => console.log(
    `     src=${JSON.stringify(i.getAttribute('src'))} class=${JSON.stringify(i.className)} alt=${JSON.stringify(i.getAttribute('alt'))}`));
}
console.log(`${imgs.length} images rendered, ${imgs.filter(i => (i.getAttribute('src')||'').startsWith('data:')).length} inlined as data URIs`);

// 4. deep pages must be fully self-contained too — portfolio photos were
//    previously built from a runtime template, so they never got inlined.
for (const [route, label] of [['#/portfolio', 'portfolio'], ['#/navigate', 'navigate']]) {
  window.location.hash = route;
  window.dispatchEvent(new window.HashChangeEvent('hashchange'));
  await new Promise(r => setTimeout(r, 300));
  const pageImgs = [...doc.querySelectorAll('#root img')];
  const notInlined = pageImgs.filter(i => !(i.getAttribute('src') || '').startsWith('data:'));
  if (notInlined.length) {
    bad(`${route}: ${notInlined.length} image(s) not inlined, e.g. ${notInlined[0].getAttribute('src')}`);
  } else {
    console.log(`${route}: ${pageImgs.length} images, all inlined`);
  }
  if (label === 'navigate') {
    // an https iframe cannot load from a file:// origin — must offer a launch link
    if (doc.querySelector('#root iframe')) bad('navigate embeds an iframe that cannot load from file://');
    const tourLinks = [...doc.querySelectorAll('#root a')]
      .filter(a => (a.getAttribute('href') || '').includes('tours.nexpics.com'));
    if (!tourLinks.length) bad('no launchable 360 tour link on the navigate page');
    else if (tourLinks.some(a => a.getAttribute('target') !== '_blank')) bad('tour link does not open in a new tab');
    else console.log(`${route}: 360 tour offered as ${tourLinks.length} launch link(s)`);
  }
}

// 5. hash navigation works
window.location.hash = '#/portfolio';
window.dispatchEvent(new window.HashChangeEvent('hashchange'));
await new Promise(r => setTimeout(r, 250));
if (!root.textContent.includes('Portfolio')) bad('hash navigation failed');
else console.log('hash navigation to #/portfolio OK');

fs.rmSync(tmp, { recursive: true, force: true });
console.log(fail ? `${fail} FAILURES` : 'All single-file checks passed');
process.exit(fail ? 1 : 0);
