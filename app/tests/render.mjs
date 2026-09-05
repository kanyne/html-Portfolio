import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const dist = new URL('../dist/', import.meta.url).pathname;
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
// bundle the app as a classic script so it can run inside jsdom
const bundlePath = path.join(dist, '..', 'node_modules', '.cache', 'test-bundle.js');
fs.mkdirSync(path.dirname(bundlePath), { recursive: true });
execSync(
  `npx esbuild src/main.tsx --bundle --format=iife --jsx=automatic --define:process.env.NODE_ENV='"production"' --outfile=${bundlePath} --log-level=error`,
  { cwd: path.join(dist, '..'), stdio: 'inherit' },
);
const js = fs.readFileSync(bundlePath, 'utf8');

const routes = ['/', '/events', '/events/irvine-welsh', '/venues', '/venues/wagenhalle',
  '/venues/kinosaele', '/cart', '/checkin', '/navigate', '/profile', '/nope'];

let fails = 0;
for (const route of routes) {
  const dom = new JSDOM(html.replace(/<script[^>]*><\/script>/g, ''), {
    url: 'http://localhost' + route, runScripts: 'outside-only', pretendToBeVisual: true,
  });
  const { window } = dom;
  window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  window.scrollTo = () => {};
  try {
    window.eval(js);
    await new Promise(r => setTimeout(r, 120));
    const root = window.document.getElementById('root');
    const text = (root.textContent || '').trim();
    const nav = root.querySelectorAll('nav a').length;
    const ok = text.length > 40 && nav === 5;
    if (!ok) fails++;
    console.log(`${ok ? 'OK  ' : 'FAIL'} ${route.padEnd(22)} chars=${String(text.length).padStart(5)} navlinks=${nav} :: ${text.slice(0, 55).replace(/\s+/g, ' ')}`);
  } catch (e) {
    fails++;
    console.log(`FAIL ${route} :: ${e.message.slice(0, 140)}`);
  }
  window.close();
}
console.log(fails ? `\n${fails} route(s) failed` : '\nAll routes rendered');
process.exit(fails ? 1 : 0);
