/**
 * Reference portfolio — real productions that have taken place in the house.
 * Sourced from the venue's own event photography (see `photo`), each entry
 * records which space was used and how it was configured, so prospective
 * clients can match a format to a room.
 */
export type PortfolioItem = {
  id: string;
  title: string;
  client: string;
  /** Format tag used for the filter chips. */
  category: 'Corporate' | 'Gala & Dinner' | 'Trade fair' | 'Reading & Talk' | 'Gaming' | 'Award show';
  year: string;
  /** Which space(s) the production used — labels match the Venues tab. */
  spaces: string[];
  /** Headline capacity actually realised for this production. */
  guests: string;
  /** Seating / layout configuration used. */
  layout: string;
  photo: string;
  /** Short caption describing what the photo shows. */
  caption: string;
  /** Two or three concrete production details worth knowing. */
  highlights: string[];
};

export const PORTFOLIO: PortfolioItem[] = [
  {
    id: 'tiktok-newfronts',
    title: 'TikTok NewFronts',
    client: 'TikTok',
    category: 'Corporate',
    year: '2026',
    spaces: ['Atrium', 'Saal 1'],
    guests: '400 seated',
    layout: 'Theatre-style rows facing the grand staircase, stage built over the lower steps',
    photo: '/img/portfolio/tiktok-newfronts.jpg',
    caption: 'The atrium staircase dressed as a keynote stage, with the brand mark mounted above the landing.',
    highlights: [
      'Full-height branded backdrop hung over the staircase, plus four double-sided LED totems down the room',
      'Magenta uplighting on every column — the atrium takes colour extremely well',
      'Red carpet runner up the centre stairs for the press arrival',
    ],
  },
  {
    id: 'icon-legacy-awards',
    title: 'The ICON Legacy Series',
    client: 'ICON',
    category: 'Award show',
    year: '2026',
    spaces: ['Foyer', 'Atrium'],
    guests: '250 standing',
    layout: 'Press wall and red carpet in the foyer, reception flowing into the atrium',
    photo: '/img/portfolio/icon-legacy.jpg',
    caption: 'Winners interviewed on the red carpet in front of the step-and-repeat.',
    highlights: [
      'Custom-printed press wall roughly 9 m wide, lit by the existing track spots overhead',
      'Rope-and-post line to hold a photographer pit opposite the backdrop',
      'Foyer works as a self-contained press area without closing the rest of the house',
    ],
  },
  {
    id: 'weinmesse',
    title: 'Wine & Winemakers Fair',
    client: 'Regional wine growers’ association',
    category: 'Trade fair',
    year: '2026',
    spaces: ['Wagenhalle', 'Atrium', 'Galerie'],
    guests: '1,200 across the day',
    layout: 'Numbered exhibitor booths (rows A–B) along both halls, tasting counters at each stand',
    photo: '/img/portfolio/weinmesse-hall.jpg',
    caption: 'Exhibitor stands running the length of the Wagenhalle, with the box office desks at the entrance.',
    highlights: [
      'Around 40 booths on a lettered grid — A1, B20 and so on — signposted from the entrance',
      'Existing KASSE counters used as the ticket desks, no extra build needed',
      'Brick hall and 18 m ceiling absorb the crowd noise better than a flat exhibition floor',
    ],
  },
  {
    id: 'weinmesse-atrium',
    title: 'Tasting floor, upper atrium',
    client: 'Regional wine growers’ association',
    category: 'Trade fair',
    year: '2026',
    spaces: ['Atrium', 'Galerie'],
    guests: '400 concurrent',
    layout: 'Open tasting stands under the balconies, step-free throughout',
    photo: '/img/portfolio/weinmesse-atrium.jpg',
    caption: 'Tasting stands spread beneath the three-sided balconies of the atrium.',
    highlights: [
      'Three-sided balcony lets visitors read the whole floor from above before descending',
      'Fully step-free — wheelchair users circulated the entire fair without a lift transfer',
      'Roll-up banners and fridge units brought in by exhibitors; power drops along the columns',
    ],
  },
  {
    id: 'kotti-kapiteln',
    title: 'zwischen KOTTI und KAPITELN × Weisser Sommer',
    client: 'Literary podcast, live book premiere',
    category: 'Reading & Talk',
    year: '2026',
    spaces: ['Saal 1'],
    guests: '525 seated (sold out)',
    layout: 'Living-room set on the stage apron — two armchairs, rug, plants — cinema screen behind',
    photo: '/img/portfolio/kotti-kapiteln.jpg',
    caption: 'The set built out in front of the full cinema screen, audience raked back into the dark.',
    highlights: [
      'Cinema screen used as the scenic backdrop: artwork and book cover projected at full width',
      'Two floor-standing key lights either side gave a broadcast-quality look for the recording',
      'Raked cinema seating means clean sightlines to a low set from every row',
    ],
  },
  {
    id: 'gala-dinner',
    title: 'Gala dinner in the Wagenhalle',
    client: 'Private corporate client',
    category: 'Gala & Dinner',
    year: '2026',
    spaces: ['Wagenhalle'],
    guests: '300 at long tables',
    layout: 'Long banqueting rows with white linen, numbered tables, service from both ends',
    photo: '/img/portfolio/gala-dinner.jpg',
    caption: 'Long tables laid the length of the hall against the original brick façade.',
    highlights: [
      'Around 20 long tables with printed menus, florals and table numbers',
      'Warm amber wash on the brickwork, colour-shifted to magenta after the dinner service',
      'Escalators and staircases stay live, so guests can move up to the Galerie for the after-party',
    ],
  },
  {
    id: 'gala-daylight',
    title: 'Banquet set-up, daylight',
    client: 'Private corporate client',
    category: 'Gala & Dinner',
    year: '2026',
    spaces: ['Wagenhalle'],
    guests: '300',
    layout: 'Same banqueting layout photographed during build, before doors',
    photo: '/img/portfolio/gala-daylight.jpg',
    caption: 'The hall in daylight during set-up — glazed end wall, brick sides, signage to Kinos 6–10.',
    highlights: [
      'Glazed end wall floods the hall with daylight for daytime conferences and build days',
      'Vehicle-height access at the rear of the hall for staging and heavy load-in',
      'Wayfinding to the cinema halls stays visible throughout the build',
    ],
  },
  {
    id: 'gaming-convention',
    title: 'Gaming convention',
    client: 'Community tournament organiser',
    category: 'Gaming',
    year: '2026',
    spaces: ['Atrium', 'Kinosäle'],
    guests: '600 across the day',
    layout: 'Standing tables through the foyer, tournament play in the cinema halls',
    photo: '/img/portfolio/gaming-convention.jpg',
    caption: 'Attendees gathered at standing tables in the foyer between rounds.',
    highlights: [
      'Cinema halls used as tournament rooms — screens and tiered seating already in place',
      'Foyer works as the between-rounds social space, with bag storage at the Garderobe',
      'Restrooms directly off the foyer keep queues away from the playing halls',
    ],
  },
];

export const PORTFOLIO_CATEGORIES = [
  'Corporate',
  'Gala & Dinner',
  'Trade fair',
  'Reading & Talk',
  'Gaming',
  'Award show',
] as const;

export const portfolioById = (id: string) => PORTFOLIO.find((p) => p.id === id);
