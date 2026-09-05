/**
 * 360° virtual tour (nexpics / mediaglobe) of the Colosseum Filmtheater.
 *
 * The tour player accepts a deep-link hash selecting the panorama and the
 * starting camera angle, so each scene below can be opened directly:
 *   #media-name=<scene>&yaw=<deg>&pitch=<deg>&fov=<deg>
 *
 * `node` maps a scene onto the corresponding pin in `data/map.ts`, which lets
 * the Navigate tab offer "look inside" straight from the floor plan.
 */
export const TOUR_BASE = 'https://tours.nexpics.com/berlin-cuisine/colosseum-filmtheater/';

export type TourScene = {
  id: string;
  label: string;
  /** Value of the `media-name` parameter. */
  media: string;
  yaw: number;
  pitch: number;
  fov: number;
  /** Matching node id in the floor-plan graph, when there is one. */
  node?: string;
  blurb: string;
};

export const TOUR_SCENES: TourScene[] = [
  {
    id: 'entrance',
    label: 'Entrance',
    media: 'IMG_5050-A-EG-Außen_01',
    yaw: 0, pitch: 0, fov: 124,
    node: 'main-entrance',
    blurb: 'Street view of the main entrance and the historic brick façade.',
  },
  {
    id: 'entrance-schoenhauser',
    label: 'Entrance · Schönhauser Allee',
    media: 'IMG_5650-C-EG-Außen_01',
    yaw: -19.76, pitch: 0.1, fov: 124,
    node: 'main-entrance',
    blurb: 'The Schönhauser Allee side entrance serving the cinema halls.',
  },
  {
    id: 'schoenhauser-foyer',
    label: 'Schönhauser Foyer',
    media: 'IMG_5714-C-EG-Schoenhauser_Foyer_003',
    yaw: -10.82, pitch: -0.04, fov: 124,
    node: 'kinosaele',
    blurb: 'Box office, concessions and the way through to the cinema halls.',
  },
  {
    id: 'wagenhalle',
    label: 'Wagenhalle',
    media: 'IMG_5146-A-EG-Wagenhalle_005',
    yaw: 61.79, pitch: -2.04, fov: 124,
    node: 'wagenhalle',
    blurb: 'The 1,600 m² hall under its 18 m roof — fairs, dinners and concerts.',
  },
  {
    id: 'galerie',
    label: 'Galerie',
    media: 'IMG_5402-B-1OG-Galerie_001',
    yaw: 5.81, pitch: -0.07, fov: 124,
    node: 'galerie',
    blurb: 'First-floor gallery with its own entrance and two terraces.',
  },
  {
    id: 'kino1',
    label: 'Kino 1',
    media: 'IMG_6014-C-EG-Kino1_04',
    yaw: 38.4, pitch: -0.56, fov: 124,
    node: 'saal1',
    blurb: 'Saal 1 — 535 m², 525 seats, stage in front of the screen.',
  },
  {
    id: 'kino4',
    label: 'Kino 4',
    media: 'IMG_5338-A-EG-Kino4_01',
    yaw: -20.72, pitch: 0.88, fov: 124,
    node: 'saal4',
    blurb: 'A mid-size hall: 178 m², 147 seats.',
  },
  {
    id: 'kino10',
    label: 'Kino 10',
    media: 'IMG_5386-B-1OG-Kino10_02',
    yaw: 0.82, pitch: -0.49, fov: 124,
    node: 'saal10',
    blurb: 'The largest cinema hall — 490 m², 454 seats.',
  },
];

/** Full deep link for a scene, ready to drop into an iframe or a new tab. */
export function sceneUrl(s: TourScene): string {
  const hash = `media-name=${encodeURIComponent(s.media)}&yaw=${s.yaw.toFixed(2)}&pitch=${s.pitch.toFixed(2)}&fov=${s.fov.toFixed(2)}`;
  return `${TOUR_BASE}#${hash}`;
}

export const sceneById = (id: string) => TOUR_SCENES.find((s) => s.id === id);
/** The tour scene that shows a given floor-plan node, if one exists. */
export const sceneForNode = (nodeId: string) => TOUR_SCENES.find((s) => s.node === nodeId);
