/**
 * Insight Cards: mock data (Lot 1 spec, section 6).
 *
 * Everything belongs to FC Demo, a fictional French club, so the prototype
 * resembles no real client. Values are fixed per period so the same card
 * always shows the same number on the same settings.
 */

export const ACCOUNT = { name: 'FC Demo' };

export const USERS = {
  camille: { name: 'Camille Martin', role: 'Marketing manager' },
  hugo: { name: 'Hugo Lefebvre', role: 'Ticketing manager' },
  sarah: { name: 'Sarah Benali', role: 'CRM officer' },
};

export const DATA_AS_OF = '09:00';

export const PERIODS = [
  { value: 'season', label: 'This season' },
  { value: 'month', label: 'This month' },
  { value: 'week', label: 'Last 7 days' },
];

export const COMPARISONS = [
  { value: 'lastSeason', label: 'Last season' },
  { value: 'lastYear', label: 'Same period last year' },
  { value: 'none', label: 'None' },
];

export const SOURCES = [
  { value: 'subscription', label: 'Subscriptions' },
  { value: 'ticket', label: 'Tickets' },
  { value: 'contact', label: 'Contacts' },
  { value: 'order', label: 'Orders' },
  { value: 'consumptions', label: 'Consumptions' },
];

export const MEASURES = [
  { value: 'people', label: 'Count people' },
  { value: 'tickets', label: 'Count tickets' },
  { value: 'revenue', label: 'Sum of revenue' },
];

export const FORMS = [
  { value: 'number', label: 'Number' },
  { value: 'breakdown', label: 'Ranked breakdown' },
  { value: 'perDay', label: 'Per day' },
];

export const CARD_COMPARISONS = [
  { value: 'page', label: 'Use page comparison' },
  { value: 'none', label: 'None' },
];

export const MAX_TABS = 10;
export const MAX_CARDS_PER_TAB = 12;
export const MAX_CONDITIONS = 6;

export const INITIAL_TABS = [
  { id: 'season', name: 'Season tickets', period: 'season', comparison: 'lastSeason' },
  { id: 'renewals', name: 'Renewals', period: 'season', comparison: 'lastSeason' },
  { id: 'matchday', name: 'Matchday', period: 'month', comparison: 'lastYear' },
  { id: 'partners', name: 'Partners', period: 'season', comparison: 'lastSeason' },
];

/* values: [current, previous] per period. A null previous means no history
   for the comparison (B6): the card shows "No comparison data". */
const SERIES_DAYS = [
  120, 95, 80, 0, 140, 210, 160, 130, 115, 90, 2480, 610, 380, 300, 260,
  240, 0, 220, 205, 190, 260, 310, 280, 250, 230, 410, 520, 470, 430, 395, 412,
];
const SERIES_DAYS_LAST_YEAR = SERIES_DAYS.map((v, i) => Math.round(v * (0.82 + ((i * 7) % 10) / 50)));
const SERIES_WEEKS = [1840, 2120, 1960, 2480, 6120, 3150, 2870, 2640, 2410, 2990, 3320, 2760];
const SERIES_WEEKS_LAST_YEAR = [1710, 1950, 2010, 2200, 5400, 2900, 2650, 2500, 2380, 2700, 3010, 2590];

export const SERIES = {
  days: SERIES_DAYS, daysLastYear: SERIES_DAYS_LAST_YEAR,
  weeks: SERIES_WEEKS, weeksLastYear: SERIES_WEEKS_LAST_YEAR,
};

export const BREAKDOWNS = {
  cities: [
    { label: 'Paris', value: 3480 }, { label: 'Lyon', value: 1310 }, { label: 'Lille', value: 980 },
    { label: 'Marseille', value: 640 }, { label: 'Bordeaux', value: 412 }, { label: 'Other', value: 1590 },
  ],
  categories: [
    { label: 'Tribune Nord', value: 5890 }, { label: 'Tribune Présidentielle', value: 1120 },
    { label: 'Virage Sud', value: 760 }, { label: 'Family zone', value: 410 },
    { label: 'Supporters des clubs partenaires, parcage visiteurs', value: 140 }, { label: 'Other', value: 92 },
  ],
  channels: [
    { label: 'Online', value: 8820 }, { label: 'Box office', value: 2410 },
    { label: 'Partner resale', value: 1180 }, { label: 'Mobile app', value: 640 },
    { label: 'Phone', value: 190 }, { label: 'Other', value: 60 },
  ],
};

let _id = 100;
export const newId = () => `c${_id++}`;

export const INITIAL_CARDS = [
  // Season tickets: the clean demo tab
  {
    id: 'c1', tab: 'season', title: 'Season ticket holders', form: 'number', measure: 'people', source: 'subscription',
    conditions: ['Season 25/26', 'Status is Active'], comparison: 'page',
    values: { season: [8412, 7935], month: [8412, 8290], week: [8412, 8398] },
    createdBy: 'camille', createdAt: '3 Sep',
  },
  {
    id: 'c2', tab: 'season', title: 'Not renewed yet', form: 'number', measure: 'people', source: 'subscription',
    conditions: ['Season 25/26', 'No 26/27 subscription'], comparison: 'page',
    values: { season: [1284, 1459], month: [1284, 1520], week: [1284, 1302] },
    createdBy: 'hugo', createdAt: '12 Sep',
  },
  {
    id: 'c3', tab: 'season', title: 'Where our season ticket holders live', form: 'breakdown', measure: 'people', source: 'subscription',
    conditions: ['Season 25/26', 'Status is Active'], comparison: 'none', breakdown: 'cities',
    createdBy: 'camille', createdAt: '3 Sep',
  },
  {
    id: 'c4', tab: 'season', title: 'Tickets sold per day', form: 'perDay', measure: 'tickets', source: 'ticket',
    conditions: ['All home matches'], comparison: 'page',
    values: { season: [32180, 29540], month: [7896, 7310], week: [2148, 1990] },
    createdBy: 'hugo', createdAt: '15 Sep',
  },
  {
    id: 'c5', tab: 'season', title: 'Revenue', form: 'number', measure: 'revenue', source: 'order',
    conditions: ['All orders'], comparison: 'page',
    values: { season: [1523000, 1464400], month: [348200, 331600], week: [96400, 89300] },
    createdBy: 'sarah', createdAt: '20 Sep',
  },
  {
    id: 'c6', tab: 'season', title: 'Sales by channel', form: 'breakdown', measure: 'tickets', source: 'ticket',
    conditions: ['All home matches'], comparison: 'none', breakdown: 'channels',
    createdBy: 'hugo', createdAt: '15 Sep',
  },

  // Renewals: trends and the no-history case
  {
    id: 'c7', tab: 'renewals', title: 'Renewed for 26/27', form: 'number', measure: 'people', source: 'subscription',
    conditions: ['Season 26/27', 'Status is Active'], comparison: 'page',
    values: { season: [7128, 6920], month: [2240, 2050], week: [610, 580] },
    createdBy: 'camille', createdAt: '1 Oct',
  },
  {
    id: 'c8', tab: 'renewals', title: 'Renewals from under-26s', form: 'number', measure: 'people', source: 'subscription',
    conditions: ['Season 26/27', 'Age under 26'], comparison: 'page',
    values: { season: [412, 665], month: [96, 154], week: [21, 34] },
    createdBy: 'sarah', createdAt: '2 Oct',
  },
  {
    id: 'c9', tab: 'renewals', title: 'Upgrades to Tribune Présidentielle', form: 'number', measure: 'people', source: 'subscription',
    conditions: ['Season 26/27', 'Category changed to Tribune Présidentielle'], comparison: 'page',
    values: { season: [0, 18], month: [0, 4], week: [0, 1] },
    createdBy: 'hugo', createdAt: '2 Oct',
  },
  {
    id: 'c10', tab: 'renewals', title: 'Family pass holders', form: 'number', measure: 'people', source: 'subscription',
    conditions: ['Plan name is Family pass', 'Season 26/27'], comparison: 'page',
    values: { season: [356, null], month: [88, null], week: [19, null] },
    createdBy: 'camille', createdAt: '4 Oct',
  },
];

/* Matchday sits at the 12-card cap and carries the remaining edge cases. */
const MATCHDAY = [
  ['Season ticket holders from Île-de-France who bought at least one away match ticket this season', 'people', 'contact', [742, 690]],
  ['All fans in the database', 'people', 'contact', [1234567, 1198300], { noHistory: false }],
  ['Away fans in the parcage', 'people', 'ticket', [380, 410], { noAccess: true }],
  ['Hospitality revenue', 'revenue', 'order', [212400, 198700], { loadError: true }],
  ['Tickets scanned at the gates', 'tickets', 'ticket', [28140, 27010]],
  ['First-time buyers', 'people', 'ticket', [1906, 1650]],
  ['Food and drink revenue', 'revenue', 'consumptions', [64380, 59100]],
  ['No-shows', 'tickets', 'ticket', [1120, 1340]],
  ['Kids tickets', 'tickets', 'ticket', [2310, 2190]],
  ['Resold on the partner platform', 'tickets', 'ticket', [540, 470]],
  ['Fans who opened the matchday email', 'people', 'contact', [9840, 9120]],
];
MATCHDAY.forEach(([title, measure, source, [v, p], flags = {}], i) => {
  INITIAL_CARDS.push({
    id: `m${i}`, tab: 'matchday', title, form: 'number', measure, source,
    conditions: ['Next home match: FC Demo vs. Olympique Exemple'], comparison: 'page',
    values: { season: [v, p], month: [v, p], week: [Math.round(v / 4), Math.round(p / 4)] },
    createdBy: ['camille', 'hugo', 'sarah'][i % 3], createdAt: '5 Oct', ...flags,
  });
});
INITIAL_CARDS.push({
  id: 'm-day', tab: 'matchday', title: 'Tickets sold per day for the derby', form: 'perDay', measure: 'tickets', source: 'ticket',
  conditions: ['Event: FC Demo vs. Olympique Exemple'], comparison: 'page',
  values: { season: [9480, 8120], month: [9480, 8120], week: [2148, 1990] },
  createdBy: 'hugo', createdAt: '6 Oct',
});

/* Scripted AI answers for the 7 demo prompts (spec, mock data: AI prompts).
   `match` is a list of keywords; the first prompt with any keyword wins. */
export const AI_SCRIPTS = [
  {
    id: 'renew', match: ['renew'],
    fill: {
      source: 'subscription', measure: 'people', form: 'number', comparison: 'page', title: 'Not renewed yet',
      conditions: [{ label: 'Season 25/26' }, { label: 'No 26/27 subscription', flagged: true }],
      value: 1284,
    },
  },
  {
    id: 'perday', match: ['per day', 'next home match', 'daily'],
    fill: {
      source: 'ticket', measure: 'tickets', form: 'perDay', comparison: 'page', title: 'Tickets sold per day, next home match',
      conditions: [{ label: 'Event: FC Demo vs. Olympique Exemple', flagged: true }],
      value: 9480,
    },
  },
  {
    id: 'live', match: ['live', 'cities', 'city', 'where'],
    fill: {
      source: 'subscription', measure: 'people', form: 'breakdown', comparison: 'none', title: 'Where our season ticket holders live',
      conditions: [{ label: 'Season 25/26' }, { label: 'Status is Active' }],
      breakdown: 'cities',
    },
  },
  {
    id: 'revenue', match: ['revenue', 'turnover'],
    fill: {
      source: 'order', measure: 'revenue', form: 'number', comparison: 'page', title: 'Revenue this season',
      conditions: [{ label: 'All orders' }],
      value: 1523000,
    },
  },
  {
    id: 'newfans', match: ['new fans', 'new contacts', 'this month'],
    fill: {
      source: 'contact', measure: 'people', form: 'number', comparison: 'page', title: 'New fans this month',
      conditions: [{ label: 'Created this month' }],
      value: 2380,
    },
  },
  {
    id: 'tv', match: ['tv', 'television', 'watched', 'instagram', 'weather'],
    refuse: {
      missing: 'Arenametrix holds no TV audience, social media or weather data, so this number cannot be built.',
      suggestion: { label: 'Tickets sold per match', prompt: 'tickets sold per day for the next home match' },
    },
  },
  {
    id: 'best', match: ['best fans', 'best'],
    ask: {
      question: 'Best by what?',
      options: [
        { label: 'Spending', fill: { title: 'Top spenders this season', conditions: [{ label: 'Spending this season at least € 500' }], value: 640 } },
        { label: 'Matches attended', fill: { title: 'Most loyal attendees', conditions: [{ label: 'Attended at least 15 home matches' }], value: 1120 } },
        { label: 'Season ticket years', fill: { title: 'Season ticket holders for 5+ years', conditions: [{ label: 'Season ticket for at least 5 seasons' }], value: 2210 } },
      ],
      base: { source: 'contact', measure: 'people', form: 'number', comparison: 'page' },
    },
  },
];

export const EXAMPLE_PROMPTS = [
  'season ticket holders who did not renew yet',
  'tickets sold per day for the next home match',
  'where do our season ticket holders live',
];

export const EXAMPLE_CARDS = [
  { title: 'Season ticket holders', prompt: 'season ticket holders who did not renew yet' },
  { title: 'Tickets sold per day', prompt: 'tickets sold per day for the next home match' },
  { title: 'Where fans live', prompt: 'where do our season ticket holders live' },
];
