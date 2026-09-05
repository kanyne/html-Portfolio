export type PinKind = 'venue' | 'restroom' | 'gastronomy' | 'exit' | 'parking' | 'info' | 'elevator';

export type MapNode = {
  id: string;
  label: string;
  kind: PinKind;
  floor: FloorId;
  x: number;
  y: number;
  info?: string;
  accessible?: boolean;
};

export type FloorId = 'ground' | 'upper' | 'cinema';

export const FLOORS: { id: FloorId; label: string }[] = [
  { id: 'ground', label: 'Ground floor' },
  { id: 'upper', label: 'Upper · Galerie' },
  { id: 'cinema', label: 'Cinema level' },
];

export const VIEWBOX = '0 0 640 440';

export const SHAPES: Record<FloorId, { id?: string; label: string; d: string; fill: string }[]> = {
  ground: [
    { id: 'wagenhalle', label: 'Wagenhalle', d: 'M40 90 H250 V300 H40 Z', fill: 'rgba(227,28,28,0.16)' },
    { id: 'atrium', label: 'Atrium', d: 'M270 110 H430 V300 H270 Z', fill: 'rgba(245,166,35,0.14)' },
    { id: 'foyer', label: 'Foyer & Garderobe', d: 'M270 312 H470 V392 H270 Z', fill: 'rgba(255,255,255,0.08)' },
    { id: 'saal1', label: 'Saal 1', d: 'M452 90 H600 V290 H452 Z', fill: 'rgba(227,28,28,0.20)' },
  ],
  upper: [
    { id: 'galerie', label: 'Galerie', d: 'M90 110 H420 V310 H90 Z', fill: 'rgba(245,166,35,0.18)' },
    { label: 'Terrace West', d: 'M40 110 H82 V310 H40 Z', fill: 'rgba(45,95,111,0.30)' },
    { label: 'Terrace East', d: 'M430 110 H520 V210 H430 Z', fill: 'rgba(45,95,111,0.30)' },
  ],
  cinema: [
    // Halls are laid out in the two wings either side of the central foyer.
    // Box sizes are drawn roughly proportional to each hall's real floor area.
    { id: 'saal10', label: 'Saal 10 · 454', d: 'M40 80 H196 V210 H40 Z', fill: 'rgba(227,28,28,0.22)' },
    { id: 'saal6', label: 'Saal 6 · 360', d: 'M40 222 H166 V330 H40 Z', fill: 'rgba(227,28,28,0.18)' },
    { id: 'saal7', label: 'Saal 7 · 360', d: 'M178 222 H304 V330 H178 Z', fill: 'rgba(227,28,28,0.18)' },
    { id: 'saal8', label: 'Saal 8 · 260', d: 'M208 80 H310 V182 H208 Z', fill: 'rgba(45,95,111,0.30)' },
    { id: 'saal2', label: 'Saal 2 · 162', d: 'M404 80 H494 V158 H404 Z', fill: 'rgba(45,95,111,0.24)' },
    { id: 'saal4', label: 'Saal 4 · 147', d: 'M506 80 H596 V158 H506 Z', fill: 'rgba(45,95,111,0.24)' },
    { id: 'saal5', label: 'Saal 5 · 150', d: 'M404 170 H494 V248 H404 Z', fill: 'rgba(45,95,111,0.24)' },
    { id: 'saal3', label: 'Saal 3 · 137', d: 'M506 170 H596 V248 H506 Z', fill: 'rgba(45,95,111,0.20)' },
    { id: 'saal9', label: 'Saal 9 · 122', d: 'M404 260 H494 V332 H404 Z', fill: 'rgba(45,95,111,0.20)' },
    { label: 'Kino foyer', d: 'M322 80 H392 V392 H322 Z', fill: 'rgba(255,255,255,0.07)' },
  ],
};

export const NODES: MapNode[] = [
  { id: 'main-entrance', label: 'Main entrance', kind: 'exit', floor: 'ground', x: 320, y: 40, info: 'Schönhauser Allee 123 — box office and info desk inside. Saal 1 and the Galerie have their own entrances.', accessible: true },
  { id: 'info', label: 'Info desk', kind: 'info', floor: 'ground', x: 350, y: 150, info: 'Staffed from one hour before doors.' },
  { id: 'garderobe', label: 'Garderobe (coat check)', kind: 'info', floor: 'ground', x: 300, y: 350, info: 'QR check-in speeds this queue up considerably.' },
  { id: 'bar-ground', label: 'Bar & gastronomy', kind: 'gastronomy', floor: 'ground', x: 400, y: 120, info: 'Drinks, snacks, coffee. Card payment only.' },
  { id: 'wc-ground', label: 'Restrooms', kind: 'restroom', floor: 'ground', x: 440, y: 350, info: 'Accessible cabin available.', accessible: true },
  { id: 'wagenhalle', label: 'Wagenhalle', kind: 'venue', floor: 'ground', x: 145, y: 195, info: '1,400 m², 600 guests.' },
  { id: 'atrium', label: 'Atrium', kind: 'venue', floor: 'ground', x: 350, y: 230, info: 'Central hall connecting all spaces.' },
  { id: 'saal1', label: 'Saal 1', kind: 'venue', floor: 'ground', x: 526, y: 190, info: '525 seats, own entrance and foyer.' },
  { id: 'exit-east', label: 'Emergency exit East', kind: 'exit', floor: 'ground', x: 610, y: 330 },
  { id: 'exit-west', label: 'Emergency exit West', kind: 'exit', floor: 'ground', x: 30, y: 330 },
  { id: 'parking', label: 'Parking garage', kind: 'parking', floor: 'ground', x: 60, y: 45, info: '120 spaces, 4 accessible bays. 3 min walk to the main entrance.', accessible: true },
  { id: 'elevator-g', label: 'Elevator', kind: 'elevator', floor: 'ground', x: 240, y: 320, info: 'Serves ground, Galerie and cinema level.', accessible: true },

  { id: 'elevator-u', label: 'Elevator', kind: 'elevator', floor: 'upper', x: 100, y: 330, accessible: true },
  { id: 'galerie', label: 'Galerie', kind: 'venue', floor: 'upper', x: 255, y: 210, info: '800 m², 300 guests, two terraces.' },
  { id: 'bar-upper', label: 'Terrace bar', kind: 'gastronomy', floor: 'upper', x: 470, y: 160 },
  { id: 'wc-upper', label: 'Restrooms', kind: 'restroom', floor: 'upper', x: 430, y: 330, accessible: true },
  { id: 'exit-upper', label: 'Emergency stairs', kind: 'exit', floor: 'upper', x: 560, y: 330 },

  { id: 'elevator-c', label: 'Elevator', kind: 'elevator', floor: 'cinema', x: 357, y: 366, accessible: true },
  { id: 'kinosaele', label: 'Kinosäle foyer', kind: 'venue', floor: 'cinema', x: 357, y: 120, info: 'Central spine of the cinema level — all nine cinema halls open off this foyer.' },
  { id: 'saal10', label: 'Saal 10', kind: 'venue', floor: 'cinema', x: 118, y: 145, info: '490 m², 454 seats — the largest cinema hall in the house.' },
  { id: 'saal6', label: 'Saal 6', kind: 'venue', floor: 'cinema', x: 103, y: 276, info: '400 m², 360 seats.' },
  { id: 'saal7', label: 'Saal 7', kind: 'venue', floor: 'cinema', x: 241, y: 276, info: '400 m², 360 seats.' },
  { id: 'saal8', label: 'Saal 8', kind: 'venue', floor: 'cinema', x: 259, y: 131, info: '255 m², 260 seats.' },
  { id: 'saal2', label: 'Saal 2', kind: 'venue', floor: 'cinema', x: 449, y: 119, info: '203 m², 162 seats.' },
  { id: 'saal4', label: 'Saal 4', kind: 'venue', floor: 'cinema', x: 551, y: 119, info: '178 m², 147 seats.' },
  { id: 'saal5', label: 'Saal 5', kind: 'venue', floor: 'cinema', x: 449, y: 209, info: '178 m², 150 seats.' },
  { id: 'saal3', label: 'Saal 3', kind: 'venue', floor: 'cinema', x: 551, y: 209, info: '168 m², 137 seats.' },
  { id: 'saal9', label: 'Saal 9', kind: 'venue', floor: 'cinema', x: 449, y: 296, info: '168 m², 122 seats.' },
  { id: 'concessions', label: 'Concessions', kind: 'gastronomy', floor: 'cinema', x: 551, y: 300, info: 'Popcorn, drinks, cinema bar. Card payment only.' },
  { id: 'wc-cinema', label: 'Restrooms', kind: 'restroom', floor: 'cinema', x: 357, y: 300, info: 'WC Damen and WC Herren either side of the foyer, accessible cabin included.', accessible: true },
  { id: 'exit-cinema', label: 'Emergency exit', kind: 'exit', floor: 'cinema', x: 240, y: 405 },
];

// undirected corridor graph; `step` gives turn-by-turn wording
export const EDGES: [string, string][] = [
  ['parking', 'main-entrance'],
  ['main-entrance', 'info'],
  ['info', 'bar-ground'],
  ['info', 'atrium'],
  ['atrium', 'wagenhalle'],
  ['atrium', 'saal1'],
  ['atrium', 'garderobe'],
  ['garderobe', 'wc-ground'],
  ['garderobe', 'elevator-g'],
  ['wc-ground', 'exit-east'],
  ['wagenhalle', 'exit-west'],
  ['elevator-g', 'elevator-u'],
  ['elevator-g', 'elevator-c'],
  ['elevator-u', 'galerie'],
  ['galerie', 'bar-upper'],
  ['galerie', 'wc-upper'],
  ['wc-upper', 'exit-upper'],
  ['elevator-c', 'kinosaele'],
  ['elevator-c', 'wc-cinema'],
  ['kinosaele', 'wc-cinema'],
  ['kinosaele', 'concessions'],
  ['kinosaele', 'saal10'],
  ['kinosaele', 'saal8'],
  ['kinosaele', 'saal2'],
  ['kinosaele', 'saal4'],
  ['kinosaele', 'saal5'],
  ['kinosaele', 'saal3'],
  ['kinosaele', 'saal9'],
  ['saal10', 'saal6'],
  ['saal6', 'saal7'],
  ['saal7', 'exit-cinema'],
  ['saal6', 'exit-cinema'],
];

export const nodeById = (id: string) => NODES.find((n) => n.id === id);

export function planRoute(from: string, to: string): string[] {
  if (from === to) return [from];
  const adj: Record<string, string[]> = {};
  EDGES.forEach(([a, b]) => {
    (adj[a] ||= []).push(b);
    (adj[b] ||= []).push(a);
  });
  const queue = [from];
  const prev: Record<string, string | null> = { [from]: null };
  while (queue.length) {
    const cur = queue.shift()!;
    if (cur === to) break;
    for (const nb of adj[cur] || []) {
      if (!(nb in prev)) {
        prev[nb] = cur;
        queue.push(nb);
      }
    }
  }
  if (!(to in prev)) return [];
  const path: string[] = [];
  let cur: string | null = to;
  while (cur) {
    path.unshift(cur);
    cur = prev[cur];
  }
  return path;
}

export function routeSteps(path: string[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < path.length; i++) {
    const n = nodeById(path[i]);
    if (!n) continue;
    if (i === 0) out.push(`Start at ${n.label}.`);
    else if (i === path.length - 1) out.push(`Arrive at ${n.label}.`);
    else if (n.kind === 'elevator') out.push(`Take the ${n.label.toLowerCase()} to the next level.`);
    else out.push(`Continue past ${n.label}.`);
  }
  return out;
}
