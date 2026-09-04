export type Venue = {
  id: string;
  name: string;
  tagline: string;
  area: string;
  capacity: number;
  height?: string;
  floor: string;
  description: string;
  images: string[];
  specs: { label: string; value: string }[];
  amenities: string[];
  formats: string[];
  accessibility: string[];
  gastronomy: string;
  combinable: string;
  halls?: { name: string; area: number; seats: number }[];
  color: string;
};

const IMG = {
  atrium: '/img/hero-atrium.jpg',
  wagenhalle: '/img/wagenhalle.jpg',
  galerie: '/img/galerie.jpg',
  saal1: '/img/saal1.jpg',
  kino: '/img/kino6.jpg',
  foyer: '/img/foyer.jpg',
};

export const CINEMA_HALLS = [
  { name: 'Hall 2', area: 203, seats: 162 },
  { name: 'Hall 3', area: 168, seats: 137 },
  { name: 'Hall 4', area: 178, seats: 147 },
  { name: 'Hall 5', area: 178, seats: 150 },
  { name: 'Hall 6', area: 400, seats: 360 },
  { name: 'Hall 7', area: 400, seats: 360 },
  { name: 'Hall 8', area: 255, seats: 260 },
  { name: 'Hall 9', area: 168, seats: 122 },
  { name: 'Hall 10', area: 490, seats: 454 },
];

export const VENUES: Venue[] = [
  {
    id: 'wagenhalle',
    name: 'Wagenhalle',
    tagline: 'Industrial hall · 600 guests',
    area: '1,400 m²',
    capacity: 600,
    height: '12 m',
    floor: 'Ground floor',
    color: '#E31C1C',
    description:
      'A historic carriage hall of honest brick and steel — the largest open space of the house. Freely configurable for galas, product launches, markets, exhibitions and corporate gatherings, with gastronomy included.',
    images: [IMG.wagenhalle, IMG.atrium, IMG.foyer],
    specs: [
      { label: 'Area', value: '1,400 m²' },
      { label: 'Ceiling height', value: '12 m' },
      { label: 'Capacity', value: '600 guests' },
      { label: 'Setup', value: 'Freely configurable' },
    ],
    amenities: ['Gastronomy included', 'Stage & truss ready', 'Direct loading access', 'Sanitary facilities', 'Blackout capable', 'House Wi-Fi'],
    formats: ['Product Launch', 'Gala Dinner', 'MICE', 'Markets', 'Exhibitions', 'Parties', 'Weddings', 'Video Production'],
    accessibility: ['Step-free entrance', 'Accessible restrooms', 'Elevator to Galerie level', 'Reserved parking nearby'],
    gastronomy: 'Full in-house catering, mobile bars and a permanent counter along the north wall.',
    combinable: 'Combinable with Atrium and Galerie for events up to 1,500 guests.',
  },
  {
    id: 'galerie',
    name: 'Galerie',
    tagline: 'Upper floor · 2 outdoor areas',
    area: '800 m²',
    capacity: 300,
    floor: '2nd floor',
    color: '#F5A623',
    description:
      'An elegant upper-floor gallery with its own entrance, wheelchair-accessible elevator and two large outdoor terraces — ideal for receptions, dinners with a view and break-out spaces.',
    images: [IMG.galerie, IMG.atrium, IMG.foyer],
    specs: [
      { label: 'Area', value: '800 m²' },
      { label: 'Floor', value: '2nd floor' },
      { label: 'Capacity', value: '300 guests' },
      { label: 'Outdoor', value: '2 terraces' },
    ],
    amenities: ['Separate entrance', 'Two terraces', 'Elevator access', 'Gastronomy zones', 'Daylight', 'Sanitary facilities'],
    formats: ['Exhibitions', 'Corporate Events', 'Receptions', 'Workshops', 'B2B Meetings', 'Weddings'],
    accessibility: ['Elevator-accessible', 'Accessible restrooms on level', 'Step-free terraces'],
    gastronomy: 'Dedicated bar plus terrace service; seated dinners up to 200.',
    combinable: 'Frequently combined with Saal 1 for conference + plenary formats.',
  },
  {
    id: 'kinosaele',
    name: 'Kinosäle',
    tagline: '9 halls · 122–454 seats',
    area: '4,000 m²',
    capacity: 2075,
    floor: 'Stage 1',
    color: '#2D5F6F',
    description:
      'Nine additional screens from an intimate 122-seat room to the 454-seat Hall 10. All halls can be rented dressed (full cinema) or undressed for screenings, presentations, workshops and gaming events.',
    images: [IMG.kino, IMG.saal1, IMG.atrium],
    specs: [
      { label: 'Halls', value: '9 (Hall 2–10)' },
      { label: 'Total area', value: '≈ 4,000 m²' },
      { label: 'Seats', value: '122 – 454 per hall' },
      { label: 'Options', value: 'Dressed / undressed' },
    ],
    amenities: ['Dolby digital sound', 'Screens 8–19 m', 'Reserved seating', 'Projection & streaming', 'Lounge areas'],
    formats: ['Film Screenings', 'Presentations', 'Workshops', 'Gaming Events', 'Comedy Shows', 'Live Streaming'],
    accessibility: ['Wheelchair spaces in every hall', 'Elevator access', 'Induction hearing loops'],
    gastronomy: 'Concession counters on each level, catering to seat on request.',
    combinable: 'Halls can be booked in blocks for festivals and multi-track conferences.',
    halls: CINEMA_HALLS,
  },
  {
    id: 'saal1',
    name: 'Saal 1',
    tagline: 'Historic cinema · 525 seats',
    area: '535 m² + 500 m² foyer',
    capacity: 525,
    floor: 'Own entrance',
    color: '#E31C1C',
    description:
      'The flagship premiere cinema: 525 seats, a full stage, its own entrance and a ~500 m² foyer. Detached from the rest of the building, so it can run in parallel with — or entirely without — the other spaces.',
    images: [IMG.saal1, IMG.foyer, IMG.atrium],
    specs: [
      { label: 'Cinema', value: '535 m²' },
      { label: 'Foyer', value: '≈ 500 m²' },
      { label: 'Seats', value: '525' },
      { label: 'Stage', value: 'Full stage included' },
    ],
    amenities: ['Own entrance & foyer', 'Full stage', 'Premium sound & projection', 'Green rooms', 'Gastronomy zones'],
    formats: ['Film Premieres', 'Special Screenings', 'Theater', 'Concerts', 'Galas', 'Book Readings'],
    accessibility: ['Step-free entrance', 'Wheelchair seating rows', 'Accessible restrooms in foyer'],
    gastronomy: 'Foyer bar, sparkling reception service, seated dinner in the foyer up to 250.',
    combinable: 'Pairs with the Galerie for conferences (plenary + break-outs).',
  },
];

export const venueById = (id: string) => VENUES.find((v) => v.id === id);

export const CONTACT = {
  email: 'db@colosseumberlin.com',
  phone: '+49 30 921095624',
  address: 'Auguststraße 20, 10117 Berlin',
  website: 'https://colosseumberlin.com',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Augustra%C3%9Fe+20%2C+10117+Berlin',
  transit: 'U8 Weinmeisterstraße (5 min) · S-Bhf Oranienburger Straße (7 min) · Tram M1 Weinmeisterstraße',
};
