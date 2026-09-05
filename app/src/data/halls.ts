/**
 * The ten cinema halls, with the areas and seat counts published by
 * colosseumberlin.com (/kinosaele and /saal1). These are the real numbers —
 * they drive the Navigate floor plan, the hall picker and the portfolio.
 */
export type Hall = {
  id: string;
  /** Display name, e.g. "Kinosaal 6". */
  name: string;
  /** Short label used inside the floor plan where space is tight. */
  short: string;
  /** Floor area in m². */
  area: number;
  /** Seat count. */
  seats: number;
  /** Which level the hall sits on. */
  level: 'ground' | 'cinema';
  notes?: string;
};

export const HALLS: Hall[] = [
  { id: 'saal1', name: 'Saal 1', short: '1', area: 535, seats: 525, level: 'ground', notes: 'Stage, own entrance and a separate foyer of ca. 500 m². The house’s main auditorium for readings, premieres and concerts.' },
  { id: 'saal2', name: 'Kinosaal 2', short: '2', area: 203, seats: 162, level: 'cinema' },
  { id: 'saal3', name: 'Kinosaal 3', short: '3', area: 168, seats: 137, level: 'cinema' },
  { id: 'saal4', name: 'Kinosaal 4', short: '4', area: 178, seats: 147, level: 'cinema' },
  { id: 'saal5', name: 'Kinosaal 5', short: '5', area: 178, seats: 150, level: 'cinema' },
  { id: 'saal6', name: 'Kinosaal 6', short: '6', area: 400, seats: 360, level: 'cinema', notes: 'One of the two large halls — the usual home for documentary screenings with a panel afterwards.' },
  { id: 'saal7', name: 'Kinosaal 7', short: '7', area: 400, seats: 360, level: 'cinema', notes: 'Large hall, matinee programming.' },
  { id: 'saal8', name: 'Kinosaal 8', short: '8', area: 255, seats: 260, level: 'cinema' },
  { id: 'saal9', name: 'Kinosaal 9', short: '9', area: 168, seats: 122, level: 'cinema' },
  { id: 'saal10', name: 'Kinosaal 10', short: '10', area: 490, seats: 454, level: 'cinema', notes: 'The largest cinema hall in the house — live podcast recordings and big screenings.' },
];

export const hallById = (id: string) => HALLS.find((h) => h.id === id);

/** Total seats across all ten halls — the "2,600 seats" the venue advertises. */
export const TOTAL_SEATS = HALLS.reduce((n, h) => n + h.seats, 0);
export const TOTAL_HALL_AREA = HALLS.reduce((n, h) => n + h.area, 0);
