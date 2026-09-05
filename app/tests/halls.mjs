// Verifies the published hall figures and that every hall is routable on the map.
import { execSync } from 'node:child_process';
import path from 'node:path';
const root = process.cwd();
const out = path.join(root, 'node_modules', '.cache', 'halls');
execSync(`npx esbuild src/data/halls.ts src/data/map.ts src/data/portfolio.ts --bundle --format=esm --outdir=${out} --log-level=error`, { cwd: root });
const { HALLS, TOTAL_SEATS, TOTAL_HALL_AREA } = await import(path.join(out, 'halls.js'));
const { NODES, planRoute, nodeById } = await import(path.join(out, 'map.js'));
const { PORTFOLIO } = await import(path.join(out, 'portfolio.js'));

let fail = 0;
const eq = (a, b, m) => { if (a !== b) { fail++; console.log(`FAIL ${m}: ${a} !== ${b}`); } };

// published figures from colosseumberlin.com
eq(HALLS.length, 10, 'ten halls');
eq(TOTAL_SEATS, 2677, 'total seats');
eq(TOTAL_HALL_AREA, 2975, 'total area');
const spec = { saal1:[535,525], saal2:[203,162], saal3:[168,137], saal4:[178,147], saal5:[178,150],
               saal6:[400,360], saal7:[400,360], saal8:[255,260], saal9:[168,122], saal10:[490,454] };
for (const [id, [area, seats]] of Object.entries(spec)) {
  const h = HALLS.find(x => x.id === id);
  if (!h) { fail++; console.log('FAIL missing hall', id); continue; }
  eq(h.area, area, `${id} area`); eq(h.seats, seats, `${id} seats`);
}

// every hall must have a pin and be reachable from the street
for (const h of HALLS) {
  const n = nodeById(h.id);
  if (!n) { fail++; console.log('FAIL no map pin for', h.id); continue; }
  const p = planRoute('main-entrance', h.id);
  if (p.length < 2) { fail++; console.log('FAIL unreachable', h.id); }
}
// accessible route to the cinema level goes via elevators
const r = planRoute('parking', 'saal10');
if (!r.includes('elevator-c')) { fail++; console.log('FAIL saal10 route skips the elevator:', r.join('>')); }
console.log('route parking -> Saal 10:', r.join(' > '));

// portfolio integrity
eq(PORTFOLIO.length, 8, 'portfolio entries');
for (const p of PORTFOLIO) {
  if (!p.photo.startsWith('/img/portfolio/')) { fail++; console.log('FAIL photo path', p.id); }
  if (!p.highlights?.length || !p.spaces?.length) { fail++; console.log('FAIL empty fields', p.id); }
}
console.log(fail ? `${fail} FAILURES` : `All hall + portfolio checks passed (${HALLS.length} halls, ${TOTAL_SEATS} seats, ${PORTFOLIO.length} projects)`);
process.exit(fail ? 1 : 0);
