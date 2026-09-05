import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const bundle = path.join(root, 'node_modules', '.cache', 'fb-bundle.js');
execSync(`npx esbuild src/main.tsx --bundle --format=iife --jsx=automatic --define:process.env.NODE_ENV='"production"' --define:import.meta.env='{"VITE_PORTABLE":""}' --outfile=${bundle} --log-level=error`, { cwd: root });
const js = fs.readFileSync(bundle, 'utf8');
const html = fs.readFileSync(path.join(root, 'dist', 'index.html'), 'utf8').replace(/<script[^>]*><\/script>/g, '');

const dom = new JSDOM(html, { url: 'http://localhost/events', runScripts: 'outside-only', pretendToBeVisual: true });
const { window } = dom;
window.matchMedia = () => ({ matches: false, addEventListener(){}, removeEventListener(){} });
window.scrollTo = () => {};
window.eval(js);
await new Promise(r => setTimeout(r, 200));

const imgs = [...window.document.querySelectorAll('#root img')];
const remote = imgs.filter(i => (i.getAttribute('src')||'').includes('static.wixstatic.com'));
const local  = imgs.filter(i => (i.getAttribute('src')||'').startsWith('/img/'));
console.log(`total imgs=${imgs.length} remotePosters=${remote.length} localVenue(backdrops)=${local.length}`);
console.log('sample poster:', remote[0]?.getAttribute('src').slice(0, 78));

// simulate the CDN being unreachable: fire onerror on every remote image
remote.forEach(i => i.dispatchEvent(new window.Event('error')));
await new Promise(r => setTimeout(r, 200));

const after = [...window.document.querySelectorAll('#root img')];
const stillRemote = after.filter(i => (i.getAttribute('src')||'').includes('static.wixstatic.com')).length;
const nowLocal = after.filter(i => (i.getAttribute('src')||'').startsWith('/img/')).length;
console.log(`after CDN failure -> remote=${stillRemote} local=${nowLocal}`);
const text = window.document.getElementById('root').textContent;
const ok = stillRemote === 0 && nowLocal > 0 && text.includes('Irvine Welsh');
console.log(ok ? 'PASS: every poster fell back to a local venue photo, page intact' : 'FAIL');
process.exit(ok ? 0 : 1);
