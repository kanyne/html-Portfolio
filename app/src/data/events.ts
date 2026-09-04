export type EventType =
  | 'Corporate'
  | 'Cinema'
  | 'Concert'
  | 'Workshop'
  | 'Festival'
  | 'Gala'
  | 'Comedy'
  | 'Exhibition'
  | 'Private';

export type TicketTier = {
  id: string;
  name: string;
  price: number;
  note?: string;
};

export type EventItem = {
  id: string;
  title: string;
  type: EventType;
  date: string; // ISO date
  time: string;
  endTime: string;
  duration: string;
  venueId: string;
  venueLabel: string;
  price: number;
  image: string;
  featured?: boolean;
  capacity: number;
  sold: number;
  seatedSelection?: boolean;
  short: string;
  description: string;
  rules: string[];
  speakers?: { name: string; role: string }[];
  tiers: TicketTier[];
};

const IMG = {
  atrium: '/img/atrium.jpg',
  wagenhalle: '/img/wagenhalle.jpg',
  wagenhalle2: '/img/wagenhalle-2.jpg',
  wagenhalle3: '/img/wagenhalle-3.jpg',
  bar: '/img/bar.jpg',
  galerie: '/img/galerie.jpg',
  galerie2: '/img/galerie-2.jpg',
  saal1: '/img/saal1.jpg',
  saal1Stage: '/img/saal1-stage.jpg',
  kino: '/img/kino.jpg',
  kinoFoyer: '/img/kino-foyer.jpg',
  foyer: '/img/foyer.jpg',
};

const std = (p: number): TicketTier[] => [
  { id: 'standard', name: 'Standard', price: p },
  { id: 'premium', name: 'Premium', price: Math.round(p * 1.4), note: 'Front rows / priority entry' },
  { id: 'vip', name: 'VIP', price: Math.round(p * 2), note: 'Lounge access + welcome drink' },
];

export const EVENTS: EventItem[] = [
  {
    id: 'spectaris',
    title: 'Spectaris Annual Conference',
    type: 'Corporate',
    date: '2026-10-07',
    time: '09:00',
    endTime: '18:00',
    duration: 'Full day',
    venueId: 'wagenhalle',
    venueLabel: 'Wagenhalle',
    price: 45,
    image: IMG.wagenhalle,
    featured: true,
    capacity: 600,
    sold: 418,
    short: 'The German high-tech industry association meets for a full day of keynotes and expo.',
    description:
      'Spectaris brings together 600 decision makers from photonics, medical technology and analytical measurement. A full-day programme of keynotes, panel discussions and a partner expo in the Wagenhalle, closing with a networking dinner under the 12-metre roof.',
    rules: ['Badge required at all times', 'Photography allowed in expo area only', 'Doors open 08:15'],
    speakers: [
      { name: 'Dr. Katrin Mehler', role: 'President, Spectaris' },
      { name: 'Jonas Prien', role: 'CTO, Optikwerk Jena' },
      { name: 'Aisha Bakr', role: 'Partner, Nordwind Capital' },
    ],
    tiers: [
      { id: 'standard', name: 'Day pass', price: 45 },
      { id: 'premium', name: 'Day pass + dinner', price: 75, note: 'Includes networking dinner' },
      { id: 'vip', name: 'Executive', price: 120, note: 'Front table, speaker lounge' },
    ],
  },
  {
    id: 'dune-two',
    title: 'Dune: Part Two',
    type: 'Cinema',
    date: '2026-10-10',
    time: '19:30',
    endTime: '22:16',
    duration: '166 min',
    venueId: 'saal1',
    venueLabel: 'Saal 1',
    price: 12,
    image: IMG.saal1,
    featured: true,
    capacity: 525,
    sold: 389,
    seatedSelection: true,
    short: 'Denis Villeneuve’s epic in 4K on the biggest screen of the house.',
    description:
      'The historic Saal 1 with its 525 seats and full stage hosts a 4K presentation with Dolby sound. Original version with German subtitles. Foyer bar opens one hour before the screening.',
    rules: ['Numbered seating', 'No late entry after 15 min', 'Age rating: 12+'],
    tiers: [
      { id: 'standard', name: 'Standard', price: 12 },
      { id: 'premium', name: 'Premium row', price: 15, note: 'Rows 8–12, centre' },
      { id: 'vip', name: 'Loge + drink', price: 22, note: 'Balcony loge, welcome drink' },
    ],
  },
  {
    id: 'tech-summit',
    title: 'Tech Summit Berlin',
    type: 'Corporate',
    date: '2026-10-15',
    time: '09:30',
    endTime: '19:00',
    duration: 'Full day',
    venueId: 'galerie',
    venueLabel: 'Galerie + Saal 1',
    price: 75,
    image: IMG.galerie,
    featured: true,
    capacity: 800,
    sold: 512,
    short: 'Plenary in Saal 1, break-outs and expo on the Galerie floor.',
    description:
      'Two spaces, one conference: keynotes on the Saal 1 stage, twelve break-out tracks and the sponsor expo across the 800 m² Galerie with both terraces open for coffee breaks.',
    rules: ['Ticket transferable until 24 h before', 'Recording of plenary sessions', 'Lunch included'],
    speakers: [
      { name: 'Lena Fischbach', role: 'VP Engineering, Delivery Hero' },
      { name: 'Marc Oduya', role: 'Founder, Kestrel AI' },
    ],
    tiers: [
      { id: 'standard', name: 'Conference pass', price: 75 },
      { id: 'premium', name: 'Pass + workshops', price: 110, note: 'Reserved workshop seats' },
      { id: 'vip', name: 'Investor track', price: 190, note: 'Matchmaking + terrace dinner' },
    ],
  },
  {
    id: 'film-festival',
    title: 'Film Festival Opening Night',
    type: 'Festival',
    date: '2026-10-18',
    time: '18:00',
    endTime: '23:30',
    duration: '5.5 h',
    venueId: 'kinosaele',
    venueLabel: 'Multiple halls',
    price: 20,
    image: IMG.kino,
    featured: true,
    capacity: 1200,
    sold: 903,
    short: 'Six halls, six premieres, one red carpet in the Atrium.',
    description:
      'The opening night of the Berlin Independent Film Festival takes over halls 2, 5, 6, 7, 9 and 10. Your pass grants access to one screening slot plus the opening reception in the Atrium.',
    rules: ['Pass includes one screening slot', 'Red carpet 17:30', 'Dress code: smart'],
    tiers: [
      { id: 'standard', name: 'Festival pass', price: 20 },
      { id: 'premium', name: 'Pass + reception', price: 35, note: 'Atrium opening reception' },
      { id: 'vip', name: 'Jury circle', price: 65, note: 'Seated with the jury, after-party' },
    ],
  },
  {
    id: 'corporate-gala',
    title: 'Colosseum Corporate Gala',
    type: 'Gala',
    date: '2026-10-22',
    time: '19:00',
    endTime: '01:00',
    duration: '6 h',
    venueId: 'wagenhalle',
    venueLabel: 'Wagenhalle',
    price: 80,
    image: IMG.wagenhalle3,
    capacity: 600,
    sold: 341,
    short: 'Four-course dinner, live orchestra and dancing in the carriage hall.',
    description:
      'A black-tie evening in the Wagenhalle: aperitif in the Atrium, four-course seated dinner, live orchestra and a DJ until 01:00. Cloakroom and valet parking included.',
    rules: ['Black tie', 'Seating plan assigned on arrival', 'Cloakroom included'],
    tiers: [
      { id: 'standard', name: 'Seat', price: 80 },
      { id: 'premium', name: 'Premium table', price: 120, note: 'Stage-side table' },
      { id: 'vip', name: 'Patron', price: 220, note: 'Champagne reception, host table' },
    ],
  },
  {
    id: 'startup-pitch',
    title: 'Startup Pitch Day',
    type: 'Corporate',
    date: '2026-10-25',
    time: '13:00',
    endTime: '19:00',
    duration: '6 h',
    venueId: 'saal1',
    venueLabel: 'Saal 1',
    price: 35,
    image: IMG.saal1Stage,
    capacity: 525,
    sold: 187,
    seatedSelection: true,
    short: '20 teams, 5 minutes each, one stage and a room full of investors.',
    description:
      'Twenty pre-seed and seed teams pitch from the Saal 1 stage to a panel of investors. Networking in the premiere foyer afterwards with drinks and demo tables.',
    rules: ['Pitch decks shared after the event', 'Networking foyer open from 17:00'],
    speakers: [{ name: 'Sophie Grewe', role: 'Principal, Cherry Ventures' }],
    tiers: [
      { id: 'standard', name: 'Audience', price: 35 },
      { id: 'premium', name: 'Founder pass', price: 50, note: 'Demo table + mentoring slot' },
      { id: 'vip', name: 'Investor', price: 90, note: 'Front rows, matchmaking' },
    ],
  },
  {
    id: 'wedding-reception',
    title: 'Wedding Reception Showcase',
    type: 'Private',
    date: '2026-10-28',
    time: '16:00',
    endTime: '22:00',
    duration: '6 h',
    venueId: 'galerie',
    venueLabel: 'Galerie',
    price: 150,
    image: IMG.galerie2,
    capacity: 300,
    sold: 96,
    short: 'A live-styled wedding on the terraces — per person pricing.',
    description:
      'See the Galerie dressed for a wedding: ceremony on the west terrace, dinner for 120 inside and dancing until late. Menus, florists and the technical setup are on display for couples planning their own day.',
    rules: ['Per-person pricing', 'Includes tasting menu', 'Consultation slots bookable on site'],
    tiers: [
      { id: 'standard', name: 'Per person', price: 150 },
      { id: 'premium', name: 'Couple package', price: 280, note: 'Two seats + planning session' },
      { id: 'vip', name: 'Full-day hire preview', price: 380, note: 'Includes venue walkthrough' },
    ],
  },
  {
    id: 'winter-market',
    title: 'Winter Market Pop-Up',
    type: 'Exhibition',
    date: '2026-11-01',
    time: '11:00',
    endTime: '20:00',
    duration: '9 h',
    venueId: 'wagenhalle',
    venueLabel: 'Wagenhalle',
    price: 0,
    image: IMG.wagenhalle2,
    capacity: 900,
    sold: 402,
    short: 'Free entry · 60 makers, mulled wine and a brass band.',
    description:
      'Sixty Berlin makers fill the Wagenhalle with ceramics, print, textiles and food. Free entry, family friendly, with a brass band at 16:00 and a mulled wine bar in the Atrium.',
    rules: ['Free entry — ticket reserves your time slot', 'Dogs on leads welcome'],
    tiers: [{ id: 'standard', name: 'Free entry', price: 0 }],
  },
  {
    id: 'art-exhibition',
    title: 'Art Exhibition: Light & Concrete',
    type: 'Exhibition',
    date: '2026-11-03',
    time: '12:00',
    endTime: '20:00',
    duration: 'Ongoing',
    venueId: 'galerie',
    venueLabel: 'Galerie',
    price: 0,
    image: IMG.foyer,
    capacity: 300,
    sold: 121,
    short: 'Free · Ongoing installation across the gallery floor.',
    description:
      'An ongoing installation of light sculpture and cast concrete by twelve Berlin artists, spread across the Galerie and both terraces. Free entry, guided tours on Saturdays.',
    rules: ['Free entry', 'Guided tour Saturdays 15:00', 'No flash photography'],
    tiers: [{ id: 'standard', name: 'Free entry', price: 0 }],
  },
  {
    id: 'comedy-night',
    title: 'Comedy Night: Berlin Late Show',
    type: 'Comedy',
    date: '2026-11-05',
    time: '20:00',
    endTime: '22:00',
    duration: '120 min',
    venueId: 'kinosaele',
    venueLabel: 'Kinosaal 5',
    price: 25,
    image: IMG.kino,
    capacity: 150,
    sold: 132,
    seatedSelection: true,
    short: 'The capital’s sharpest stand-ups, filmed live.',
    description:
      'Five acts, one host and a live recording in Hall 5. Bar service to your seat, doors 19:15.',
    rules: ['16+', 'Filmed audience — attendance implies consent', 'Late entry between acts'],
    tiers: std(25),
  },
  {
    id: 'jazz-atrium',
    title: 'Jazz in the Atrium',
    type: 'Concert',
    date: '2026-11-12',
    time: '20:30',
    endTime: '22:00',
    duration: '90 min',
    venueId: 'wagenhalle',
    venueLabel: 'Atrium / Wagenhalle',
    price: 29,
    image: IMG.bar,
    capacity: 400,
    sold: 205,
    short: 'Standing concert beneath the glass roof.',
    description:
      'An intimate jazz night beneath the glass roof, with the interior balconies serving as the audience’s boxes. Bar open throughout.',
    rules: ['Standing event', 'Limited balcony seating first-come'],
    tiers: std(29),
  },
  {
    id: 'product-workshop',
    title: 'Product Design Workshop',
    type: 'Workshop',
    date: '2026-11-19',
    time: '10:00',
    endTime: '16:00',
    duration: '6 h',
    venueId: 'kinosaele',
    venueLabel: 'Kinosaal 3',
    price: 50,
    image: IMG.kinoFoyer,
    capacity: 137,
    sold: 44,
    short: 'Hands-on, small group, materials included.',
    description:
      'A hands-on day on discovery, prototyping and testing, run in the undressed Hall 3 with worktables instead of cinema seating. Materials and lunch included.',
    rules: ['Bring a laptop', 'Materials and lunch included', 'Max 40 participants'],
    tiers: [
      { id: 'standard', name: 'Seat', price: 50 },
      { id: 'premium', name: 'Seat + 1:1 review', price: 85, note: '30 min portfolio review' },
    ],
  },
];

export const EVENT_TYPES: EventType[] = [
  'Corporate',
  'Cinema',
  'Concert',
  'Workshop',
  'Festival',
  'Gala',
  'Comedy',
  'Exhibition',
  'Private',
];

export const eventById = (id: string) => EVENTS.find((e) => e.id === id);
