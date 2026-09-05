export type EventType =
  | 'Corporate'
  | 'Cinema'
  | 'Concert'
  | 'Workshop'
  | 'Festival'
  | 'Gala'
  | 'Comedy'
  | 'Exhibition'
  | 'Private'
  | 'Talk'
  | 'Reading'
  | 'Podcast';

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
  endDate?: string;
  time: string;
  endTime: string;
  duration: string;
  venueId: string;
  venueLabel: string;
  address: string;
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
  ticketUrl?: string;
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

const SCHOEN = 'Schönhauser Allee 123, 10437 Berlin';
const GLEIM = 'Gleimstraße 33, 10437 Berlin';

const tiers = (p: number, opts?: { premium?: string; vip?: string }): TicketTier[] => [
  { id: 'standard', name: 'Standard', price: p },
  { id: 'premium', name: 'Premium', price: Math.round(p * 1.4), note: opts?.premium ?? 'Front rows, priority entry' },
  { id: 'vip', name: 'VIP', price: Math.round(p * 2), note: opts?.vip ?? 'Foyer lounge + welcome drink' },
];

/**
 * Programme sampled from colosseumberlin.com/event (September–October 2026).
 * Hall allocation, pricing and capacity are illustrative for this demo.
 */
export const EVENTS: EventItem[] = [
  {
    id: 'gysi-kaeser',
    title: 'Gysis Begegnungen mit … Joe Kaeser',
    type: 'Talk',
    date: '2026-09-06',
    time: '11:00',
    endTime: '13:00',
    duration: '120 min',
    venueId: 'saal1',
    venueLabel: 'Saal 1',
    address: SCHOEN,
    price: 24,
    image: IMG.saal1,
    featured: true,
    capacity: 525,
    sold: 447,
    seatedSelection: true,
    short: 'Gregor Gysi in conversation with the CEO, business leader and supervisory board chair.',
    description:
      'Gregor Gysi’s Sunday matinee interview series returns to the historic Saal 1. This edition welcomes Joe Kaeser — CEO, business manager and supervisory board chair — for a wide-ranging conversation on industry, politics and responsibility, followed by audience questions.',
    rules: ['Doors open 10:15', 'Numbered seating', 'German language', 'Foyer bar open before and after'],
    speakers: [
      { name: 'Joe Kaeser', role: 'CEO, business manager, supervisory board chair' },
      { name: 'Gregor Gysi', role: 'Host' },
    ],
    ticketUrl: 'https://www.colosseumberlin.com/details-registrierung/gysis-begegnungen-mit-joe-kaeser',
    tiers: tiers(24, { vip: 'Front rows + reception with the host' }),
  },
  {
    id: 'betreutes-singen',
    title: 'Das Betreute Singen — September',
    type: 'Concert',
    date: '2026-09-09',
    time: '19:00',
    endTime: '22:00',
    duration: '180 min',
    venueId: 'wagenhalle',
    venueLabel: 'Wagenhalle',
    address: GLEIM,
    price: 19,
    image: IMG.wagenhalle3,
    capacity: 600,
    sold: 512,
    short: 'You shout out your favourite hits, the band plays them — and everybody sings along.',
    description:
      'The city’s loudest singalong takes over the Wagenhalle. Call out your favourite hits, the live band plays them on request, and six hundred people sing them together. No talent required, bar open all night.',
    rules: ['Standing event', '18+', 'Requests taken from the floor', 'Bar open all night'],
    ticketUrl: 'https://www.colosseumberlin.com/details-registrierung/das-betreute-singen-september',
    tiers: tiers(19, { premium: 'Stage-side standing', vip: 'Balcony table + drinks' }),
  },
  {
    id: 'babywho-connect',
    title: 'babywho CONNECT — Familiensummit',
    type: 'Corporate',
    date: '2026-09-12',
    endDate: '2026-09-13',
    time: '11:00',
    endTime: '17:00',
    duration: '2 days',
    venueId: 'galerie',
    venueLabel: 'Galerie + Kinosäle',
    address: GLEIM,
    price: 75,
    image: IMG.galerie,
    featured: true,
    capacity: 800,
    sold: 486,
    short: 'A two-day family summit: expo on the Galerie, talks across the cinema halls.',
    description:
      'The babywho CONNECT family summit runs across two days and two levels: a partner expo and networking floor on the 800 m² Galerie, with parallel talk tracks in the cinema halls. Terraces open for breaks throughout.',
    rules: ['Two-day pass', 'Children welcome', 'Lunch included', 'Buggy parking at the entrance'],
    ticketUrl: 'https://babywho-connect.de/events/familiensummit/',
    tiers: [
      { id: 'standard', name: 'Two-day pass', price: 75 },
      { id: 'premium', name: 'Pass + workshops', price: 110, note: 'Reserved workshop seats' },
      { id: 'vip', name: 'Partner pass', price: 220, note: 'Expo stand + speaker lounge' },
    ],
  },
  {
    id: 'cornelia-funke',
    title: 'Cornelia Funke — »Emma glaubt nicht an Feen«',
    type: 'Reading',
    date: '2026-09-13',
    time: '15:30',
    endTime: '17:00',
    duration: '90 min',
    venueId: 'saal1',
    venueLabel: 'Saal 1',
    address: SCHOEN,
    price: 16,
    image: IMG.saal1Stage,
    capacity: 525,
    sold: 498,
    seatedSelection: true,
    short: 'Book premiere with the bestselling children’s author.',
    description:
      'Cornelia Funke presents the premiere of »Emma glaubt nicht an Feen« from the Saal 1 stage. A Sunday afternoon of reading, illustration and questions from younger readers, with a signing in the foyer afterwards.',
    rules: ['Family event, recommended age 6+', 'Signing in the foyer after the reading', 'German language'],
    speakers: [{ name: 'Cornelia Funke', role: 'Author' }],
    ticketUrl: 'https://www.colosseumberlin.com/details-registrierung/cornelia-funke',
    tiers: [
      { id: 'standard', name: 'Standard', price: 16 },
      { id: 'premium', name: 'Family (2+2)', price: 48, note: 'Two adults, two children' },
      { id: 'vip', name: 'Standard + signed book', price: 38, note: 'Signed hardback included' },
    ],
  },
  {
    id: 'haltung-ohne-hass',
    title: '»Haltung ohne Hass« — Premiere',
    type: 'Talk',
    date: '2026-09-15',
    time: '18:30',
    endTime: '19:30',
    duration: '60 min',
    venueId: 'kinosaele',
    venueLabel: 'Kinosaal 6',
    address: GLEIM,
    price: 14,
    image: IMG.kino,
    capacity: 360,
    sold: 301,
    seatedSelection: true,
    short: 'Premiere and panel with Ahmad Mansour and Güner Balcı.',
    description:
      'The premiere of »Haltung ohne Hass«, followed by a discussion with psychologist and author Ahmad Mansour and journalist Güner Balcı on extremism, integration and civil courage.',
    rules: ['Doors 18:00', 'Discussion follows the screening', 'German language'],
    speakers: [
      { name: 'Ahmad Mansour', role: 'Psychologist and author' },
      { name: 'Güner Balcı', role: 'Journalist and filmmaker' },
    ],
    ticketUrl: 'https://www.colosseumberlin.com/details-registrierung/haltung-ohne-hass-premiere-mit-ahmad-mansour-und-guner-balci',
    tiers: tiers(14),
  },
  {
    id: 'its-all-gonna-break',
    title: '„It’s All Gonna Break“ — Doku-Screening + Q&A',
    type: 'Cinema',
    date: '2026-09-18',
    time: '19:00',
    endTime: '21:00',
    duration: '120 min',
    venueId: 'saal1',
    venueLabel: 'Saal 1',
    address: SCHOEN,
    price: 15,
    image: IMG.saal1,
    featured: true,
    capacity: 525,
    sold: 470,
    seatedSelection: true,
    short: 'City Slang screens the new documentary, with a band Q&A afterwards.',
    description:
      'On the night before the final show of the European leg of the ALL THE FEELINGS TOUR — featuring Canada’s indie rock stalwarts METRIC, BROKEN SOCIAL SCENE and STARS — City Slang screens the new documentary It’s All Gonna Break, followed by a Q&A with band members in attendance.',
    rules: ['Original version', 'Q&A with band members after the film', 'Doors 18:15'],
    speakers: [{ name: 'Broken Social Scene / Metric / Stars', role: 'Band members in attendance' }],
    ticketUrl: 'https://www.colosseumberlin.com/details-registrierung/its-all-gonna-break-doku-screening-q-a',
    tiers: tiers(15, { vip: 'Reserved rows + after-show drink' }),
  },
  {
    id: 'mindseed-podcast',
    title: 'Mindseed Podcast — Live Tour',
    type: 'Podcast',
    date: '2026-09-19',
    time: '18:30',
    endTime: '21:30',
    duration: '180 min',
    venueId: 'kinosaele',
    venueLabel: 'Kinosaal 10',
    address: GLEIM,
    price: 29,
    image: IMG.kinoFoyer,
    capacity: 454,
    sold: 312,
    seatedSelection: true,
    short: 'The podcast recorded live on stage, with audience questions.',
    description:
      'Mindseed brings its live tour to the biggest of the cinema halls: a full episode recorded on stage in front of an audience, plus an open Q&A and a meet-and-greet in the foyer afterwards.',
    rules: ['Filmed and recorded — attendance implies consent', 'Doors 17:45', 'Merch stand in the foyer'],
    ticketUrl: 'https://www.colosseumberlin.com/details-registrierung/raum27-1-1',
    tiers: tiers(29, { vip: 'Meet & greet + signed poster' }),
  },
  {
    id: 'ueberdosis-crime',
    title: 'ÜBERDOSIS CRIME — LIVE 2026',
    type: 'Podcast',
    date: '2026-09-19',
    time: '19:00',
    endTime: '22:00',
    duration: '180 min',
    venueId: 'wagenhalle',
    venueLabel: 'Wagenhalle',
    address: GLEIM,
    price: 35,
    image: IMG.wagenhalle,
    capacity: 600,
    sold: 559,
    short: 'CONTRA CREATE presents the true-crime show live on stage.',
    description:
      'CONTRA CREATE präsentiert: the true-crime phenomenon ÜBERDOSIS CRIME live in the Wagenhalle. Three cases, one stage, and a room of six hundred amateur detectives.',
    rules: ['16+', 'Standing and seated areas', 'Content warning: descriptions of violence'],
    ticketUrl: 'https://shop.myticket.de/selection/event/seat?perfId=10229770503480',
    tiers: tiers(35, { premium: 'Seated block, rows 1–6', vip: 'Meet & greet after the show' }),
  },
  {
    id: 'fabian-roemer',
    title: 'Fabian Römer — Selbstgespräche',
    type: 'Concert',
    date: '2026-09-19',
    time: '20:30',
    endTime: '22:00',
    duration: '90 min',
    venueId: 'galerie',
    venueLabel: 'Galerie',
    address: GLEIM,
    price: 22,
    image: IMG.galerie2,
    capacity: 300,
    sold: 178,
    short: 'Album pre-listening — hear the new record before it comes out.',
    description:
      'In an intimate pre-listening session on the Galerie floor, Fabian Römer presents his new album before its release, playing songs live and talking through how they came together.',
    rules: ['Limited to 300 guests', 'Terraces open', 'Album pre-order available on site'],
    speakers: [{ name: 'Fabian Römer', role: 'Musician' }],
    ticketUrl: 'https://www.colosseumberlin.com/details-registrierung/fabian-romer-selbstgesprache',
    tiers: tiers(22, { vip: 'Listening session + signed vinyl' }),
  },
  {
    id: 'kalkofe-zeitreise',
    title: 'Kalkofes Zeitreise — »Die Abenteuer des Rabbi Jacob«',
    type: 'Cinema',
    date: '2026-09-20',
    time: '11:00',
    endTime: '13:30',
    duration: '150 min',
    venueId: 'kinosaele',
    venueLabel: 'Kinosaal 7',
    address: GLEIM,
    price: 12,
    image: IMG.kino,
    capacity: 360,
    sold: 214,
    seatedSelection: true,
    short: 'Sunday matinee classic with an introduction by Oliver Kalkofe.',
    description:
      'Oliver Kalkofe’s time-travel matinee series digs out »Die Abenteuer des Rabbi Jacob«. Expect a scene-setting introduction, the film itself, and a very opinionated debrief afterwards.',
    rules: ['Doors 10:30', 'Introduction before the film', 'Brunch counter open in the foyer'],
    speakers: [{ name: 'Oliver Kalkofe', role: 'Host' }],
    ticketUrl: 'https://www.colosseumberlin.com/details-registrierung/kalkofes-zeitreise-film-die-abenteuer-des-rabbi-jacob',
    tiers: tiers(12),
  },
  {
    id: 'becker-wittwer',
    title: 'Sebastian Becker & Tara-Louise Wittwer',
    type: 'Reading',
    date: '2026-09-25',
    time: '19:30',
    endTime: '21:30',
    duration: '120 min',
    venueId: 'kinosaele',
    venueLabel: 'Kinosaal 8',
    address: GLEIM,
    price: 18,
    image: IMG.kinoFoyer,
    capacity: 260,
    sold: 233,
    seatedSelection: true,
    short: 'Book premiere: »Und es wird trotzdem wieder Sommer werden«.',
    description:
      'Celebrate the book premiere of »Und es wird trotzdem wieder Sommer werden« — a conversation around a moving book about grief, hope, saying goodbye, and looking to the future after a loss.',
    rules: ['Doors 19:00', 'Signing afterwards', 'German language', 'Sensitive subject matter'],
    speakers: [
      { name: 'Sebastian Becker', role: 'Author' },
      { name: 'Tara-Louise Wittwer', role: 'Author and host' },
    ],
    ticketUrl: 'https://www.colosseumberlin.com/details-registrierung/sebastian-becker-und-tara-louise-wittwer',
    tiers: tiers(18, { vip: 'Reserved seat + signed copy' }),
  },
  {
    id: 'gysi-hochmair',
    title: 'Gysis Begegnungen mit … Philipp Hochmair',
    type: 'Talk',
    date: '2026-09-27',
    time: '11:00',
    endTime: '13:30',
    duration: '150 min',
    venueId: 'saal1',
    venueLabel: 'Saal 1',
    address: SCHOEN,
    price: 24,
    image: IMG.saal1Stage,
    capacity: 525,
    sold: 389,
    seatedSelection: true,
    short: 'The actor and author in conversation with Gregor Gysi.',
    description:
      'Another Sunday matinee in the Begegnungen series: actor and author Philipp Hochmair joins Gregor Gysi on the Saal 1 stage to talk about theatre, screen work and writing — with readings between the conversation.',
    rules: ['Doors 10:15', 'Numbered seating', 'German language'],
    speakers: [
      { name: 'Philipp Hochmair', role: 'Actor and author' },
      { name: 'Gregor Gysi', role: 'Host' },
    ],
    ticketUrl: 'https://www.colosseumberlin.com/details-registrierung/gysis-begegnungen-mit-philipp-hochmair',
    tiers: tiers(24, { vip: 'Front rows + reception with the host' }),
  },
  {
    id: 'irvine-welsh',
    title: 'Irvine Welsh live',
    type: 'Reading',
    date: '2026-09-27',
    time: '20:00',
    endTime: '22:30',
    duration: '150 min',
    venueId: 'saal1',
    venueLabel: 'Saal 1',
    address: SCHOEN,
    price: 28,
    image: IMG.saal1,
    featured: true,
    capacity: 525,
    sold: 501,
    seatedSelection: true,
    short: '„Trainspotting“ & „Men in Love“ — hosted by Thorsten Nagelschmidt.',
    description:
      'Irvine Welsh comes to Prenzlauer Berg for an evening around »Trainspotting« and his new novel »Men in Love«, moderated by Thorsten Nagelschmidt. Readings in English with German passages, then an open conversation.',
    rules: ['English and German', 'Doors 19:15', 'Signing in the foyer', '16+'],
    speakers: [
      { name: 'Irvine Welsh', role: 'Author' },
      { name: 'Thorsten Nagelschmidt', role: 'Host' },
    ],
    ticketUrl: 'https://www.colosseumberlin.com/details-registrierung/irvine-welsh-live',
    tiers: tiers(28, { vip: 'Front rows + signed copy of Men in Love' }),
  },
  {
    id: 'josh-solo',
    title: 'JOSH. Solo — »Wer singt dann Lieder für dich?«',
    type: 'Concert',
    date: '2026-09-29',
    time: '18:30',
    endTime: '21:30',
    duration: '180 min',
    venueId: 'wagenhalle',
    venueLabel: 'Wagenhalle',
    address: GLEIM,
    price: 32,
    image: IMG.bar,
    capacity: 600,
    sold: 421,
    short: 'A solo evening under the twelve-metre roof.',
    description:
      'JOSH. plays the Wagenhalle solo — just voice, guitar and six hundred people. An evening of new songs and old favourites in the brick-and-steel hall, with the bar open throughout.',
    rules: ['Standing event', 'Doors 18:00', 'Support act announced closer to the date'],
    speakers: [{ name: 'JOSH.', role: 'Musician' }],
    ticketUrl: 'https://www.colosseumberlin.com/details-registrierung/josh-solo-wer-singt-dann-lieder-fur-dich-2',
    tiers: tiers(32, { premium: 'Stage-side standing', vip: 'Balcony table + drinks' }),
  },
  {
    id: 'investment-kinoevent',
    title: 'Investment — „Wieder nur Lieder“ Kinoevents 2026',
    type: 'Cinema',
    date: '2026-09-30',
    time: '20:00',
    endTime: '22:00',
    duration: '120 min',
    venueId: 'kinosaele',
    venueLabel: 'Kinosaal 6',
    address: SCHOEN,
    price: 14,
    image: IMG.kino,
    capacity: 360,
    sold: 188,
    seatedSelection: true,
    short: 'Presented by „Der Internationale Frühschoppen“ Podcast & ByteFM.',
    description:
      'Part of the „Wieder nur Lieder“ cinema event series 2026, presented by the „Der Internationale Frühschoppen“ podcast together with ByteFM: a screening plus live commentary and music from the hosts.',
    rules: ['Doors 19:30', 'Live podcast segment after the film', 'German language'],
    ticketUrl: 'https://www.colosseumberlin.com/details-registrierung/investment',
    tiers: tiers(14),
  },
  {
    id: 'gysi-jaehn',
    title: 'Gysis Begegnungen mit … Felix Jaehn',
    type: 'Talk',
    date: '2026-10-04',
    time: '11:00',
    endTime: '13:30',
    duration: '150 min',
    venueId: 'saal1',
    venueLabel: 'Saal 1',
    address: SCHOEN,
    price: 24,
    image: IMG.saal1Stage,
    capacity: 525,
    sold: 356,
    seatedSelection: true,
    short: 'The DJ, producer and international artist meets Gregor Gysi.',
    description:
      'DJ, music producer and internationally successful artist Felix Jaehn joins Gregor Gysi for the Sunday matinee — on the road from a Northern German bedroom studio to the global charts, and what came after.',
    rules: ['Doors 10:15', 'Numbered seating', 'German language'],
    speakers: [
      { name: 'Felix Jaehn', role: 'DJ, music producer, artist' },
      { name: 'Gregor Gysi', role: 'Host' },
    ],
    ticketUrl: 'https://www.colosseumberlin.com/details-registrierung/gysis-begegnungen-mit-felix-jaehn',
    tiers: tiers(24, { vip: 'Front rows + reception with the host' }),
  },
  {
    id: 'christoph-kramer',
    title: 'Christoph Kramer — »Wolkenberührpunkt«',
    type: 'Reading',
    date: '2026-10-05',
    time: '19:30',
    endTime: '21:30',
    duration: '120 min',
    venueId: 'saal1',
    venueLabel: 'Saal 1',
    address: SCHOEN,
    price: 20,
    image: IMG.saal1,
    featured: true,
    capacity: 525,
    sold: 462,
    seatedSelection: true,
    short: 'Berlin premiere of the footballer and TV pundit’s second novel.',
    description:
      'Christoph Kramer is back. The footballer, TV pundit and author follows his debut »Das Leben fing im Sommer an« with the Berlin premiere of his next novel, »Wolkenberührpunkt«, in the historic Berlin cinema.',
    rules: ['Doors 18:45', 'Signing after the reading', 'German language'],
    speakers: [{ name: 'Christoph Kramer', role: 'Author, footballer and TV pundit' }],
    ticketUrl: 'https://www.colosseumberlin.com/details-registrierung/christoph-kramer',
    tiers: tiers(20, { vip: 'Front rows + signed hardback' }),
  },
  {
    id: 'annika-sala',
    title: 'Annika Sala — Interaktive Lesung',
    type: 'Reading',
    date: '2026-10-06',
    time: '19:00',
    endTime: '22:00',
    duration: '180 min',
    venueId: 'galerie',
    venueLabel: 'Galerie',
    address: GLEIM,
    price: 17,
    image: IMG.galerie,
    capacity: 300,
    sold: 121,
    short: '»Sei mutig und folge deinem Herzen« — an interactive reading.',
    description:
      'An interactive reading on the Galerie floor: Annika Sala reads, the audience decides where the evening goes next. Expect exercises, conversation and a lot of audience participation.',
    rules: ['Audience participation throughout', 'Doors 18:30', 'German language'],
    speakers: [{ name: 'Annika Sala', role: 'Author' }],
    ticketUrl: 'https://www.colosseumberlin.com/details-registrierung/annika-sala-interaktive-lesung',
    tiers: tiers(17, { vip: 'Reserved seat + signed book' }),
  },
];

export const EVENT_TYPES: EventType[] = [
  'Talk',
  'Reading',
  'Cinema',
  'Concert',
  'Podcast',
  'Corporate',
  'Comedy',
  'Festival',
  'Gala',
  'Workshop',
  'Exhibition',
  'Private',
];

export const eventById = (id: string) => EVENTS.find((e) => e.id === id);
