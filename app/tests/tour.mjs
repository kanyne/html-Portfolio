// Validates the 360° tour scene deep links and their mapping onto floor-plan nodes.
import { execSync } from 'node:child_process';
import path from 'node:path';
const root = process.cwd();
const out = path.join(root, 'node_modules', '.cache', 'tour');
execSync(`npx esbuild src/data/tour.ts src/data/map.ts --bundle --format=esm --outdir=${out} --log-level=error`, { cwd: root });
const { TOUR_SCENES, sceneUrl, sceneForNode, TOUR_BASE } = await import(path.join(out, 'tour.js'));
const { nodeById } = await import(path.join(out, 'map.js'));

let fail = 0;
const bad = (m) => { fail++; console.log('FAIL ' + m); };

if (TOUR_SCENES.length !== 8) bad(`expected 8 scenes, got ${TOUR_SCENES.length}`);

for (const s of TOUR_SCENES) {
  const u = sceneUrl(s);
  if (!u.startsWith(TOUR_BASE + '#media-name=')) bad(`${s.id}: bad prefix ${u}`);
  // every parameter the player needs must be present
  for (const k of ['media-name', 'yaw', 'pitch', 'fov']) {
    if (!u.includes(k + '=')) bad(`${s.id}: missing ${k}`);
  }
  // the media name must be percent-encoded (umlauts and spaces would break the hash)
  const media = decodeURIComponent(u.split('media-name=')[1].split('&')[0]);
  if (media !== s.media) bad(`${s.id}: media round-trip mismatch`);
  if (/[^\x20-\x7e]/.test(u)) bad(`${s.id}: unencoded non-ascii in url`);
  if (s.node && !nodeById(s.node)) bad(`${s.id}: node '${s.node}' is not on the floor plan`);
  if (!s.blurb || !s.label) bad(`${s.id}: missing label/blurb`);
}

// the umlaut scenes are the ones most likely to break — check explicitly
const ent = TOUR_SCENES.find(s => s.id === 'entrance');
if (!sceneUrl(ent).includes('Au%C3%9Fen')) bad('Außen not percent-encoded');

// key spaces should be reachable from the map
for (const n of ['wagenhalle', 'galerie', 'saal1', 'saal10', 'saal4', 'kinosaele', 'main-entrance']) {
  if (!sceneForNode(n)) bad(`no tour scene wired to node '${n}'`);
}
console.log(fail ? `${fail} FAILURES` : `All tour checks passed (${TOUR_SCENES.length} scenes, 7 nodes linked)`);
console.log('sample:', sceneUrl(ent));
process.exit(fail ? 1 : 0);
