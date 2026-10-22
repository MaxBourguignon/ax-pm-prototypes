/**
 * Mock data for the all-batches Insights mockup.
 *
 * Everything belongs to FC Demo, a fictional club, so the mockup resembles no
 * real client. Card ideas come from the Fanalists Insights list (2,364 cards)
 * and the current Fanalists start page; the numbers are made up.
 */
import { has } from './batches';

export const ACCOUNT = { name: 'FC Demo' };

export const USERS = {
  camille: { name: 'Camille Martin', role: 'Marketing manager' },
  hugo: { name: 'Hugo Lefebvre', role: 'Ticketing manager' },
  sarah: { name: 'Sarah Benali', role: 'CRM officer' },
};

/* What a card's variation compares with. */
export const COMPARISONS = [
  { value: 'none', label: 'Nothing' },
  { value: 'yesterday', label: 'Previous count (yesterday)' },
  { value: 'lastYear', label: 'Same day last year' },
];

/* Before Batch 3 every card compares with the previous count (Batch 1 spec).
   From Batch 3 the card's own choice applies; there is no page-wide filter,
   so the page stays a set of cards rather than a dashboard. */
export const comparisonOf = (card, batch) => (batch >= 3 ? (card.compare ?? 'yesterday') : 'yesterday');
export const COMPARISON_SHORT = { yesterday: 'vs. yesterday', lastYear: 'vs. last year' };

/* Sources as in the segmentation engine (people) plus the transaction data of Batch 2. */
export const SOURCES = [
  { value: 'contact', label: 'Contacts', people: true },
  { value: 'subscription', label: 'Subscriptions', people: true },
  { value: 'ticket', label: 'Tickets', people: true },
  { value: 'order', label: 'Orders', people: false },
  { value: 'webshop', label: 'Webshop', people: false },
];

export const MEASURES = [
  { value: 'people', label: 'Count profiles' },
  { value: 'tickets', label: 'Count tickets' },
  { value: 'orders', label: 'Count orders' },
  { value: 'subscriptions', label: 'Count subscriptions sold' },
  { value: 'revenue', label: 'Sum of revenue' },
];

export const KINDS = [
  { value: 'number', label: 'Number' },
  { value: 'breakdown', label: 'Breakdown' },
  { value: 'share', label: 'Share of a base' },
  { value: 'perDay', label: 'Per day' },
  { value: 'target', label: 'Progress to a target' },
  { value: 'countdown', label: 'Countdown' },
];

export const SPLIT_FIELDS = [
  { value: 'gender', label: 'Gender' },
  { value: 'city', label: 'City' },
  { value: 'tribune', label: 'Tribune' },
  { value: 'channel', label: 'Sales channel' },
  { value: 'category', label: 'Product category' },
];

export const EVENTS = [
  { value: 'derby', label: 'FC Demo vs. Olympique Exemple', date: '2026-11-08' },
  { value: 'cup', label: 'Cup quarter-final', date: '2027-01-24' },
  { value: 'gala', label: 'Season gala', date: '2026-12-12' },
];

export const BREAKDOWNS = {
  gender: [
    { label: 'Male', value: 118240 }, { label: 'Female', value: 76410 }, { label: 'Unknown', value: 26859 },
  ],
  city: [
    { label: 'Paris', value: 64120 }, { label: 'Lyon', value: 21480 }, { label: 'Lille', value: 15310 },
    { label: 'Marseille', value: 11020 }, { label: 'Bordeaux', value: 8760 }, { label: 'Other', value: 100819 },
  ],
  tribune: [
    { label: 'Tribune Nord', value: 5890 }, { label: 'Tribune Présidentielle', value: 2120 },
    { label: 'Virage Sud', value: 2760 }, { label: 'Family zone', value: 1265 }, { label: 'Other', value: 412 },
  ],
  channel: [
    { label: 'Online', value: 15820 }, { label: 'Box office', value: 3410 },
    { label: 'Partner resale', value: 1980 }, { label: 'Mobile app', value: 1640 }, { label: 'Other', value: 290 },
  ],
  category: [
    { label: 'Match shirts', value: 14224 }, { label: 'Fan articles', value: 9489 },
    { label: 'Training wear', value: 7426 }, { label: 'Kids', value: 3120 }, { label: 'Other', value: 1840 },
  ],
};

export const SERIES = [
  120, 95, 80, 0, 140, 210, 160, 130, 115, 90, 2480, 610, 380, 300, 260,
  240, 0, 220, 205, 190, 260, 310, 280, 250, 230, 410, 520, 470, 430, 395, 412,
];

export const INITIAL_TABS = [
  { id: 'fanbase', name: 'Fanbase' },
  { id: 'season', name: 'Season tickets' },
  { id: 'matchday', name: 'Matchday' },
  { id: 'shop', name: 'Merchandise', needs: 'tx' },
  { id: 'notes', name: 'Notes', needs: 'manualText' },
];

let _id = 500;
export const newId = () => `a${_id++}`;

const ALL_FANS = { label: 'all fans', value: 221509 };

export const INITIAL_CARDS = [
  // Fanbase: Batch 1 profile cards
  { id: 'f1', tab: 'fanbase', kind: 'number', measure: 'people', source: 'contact',
    title: 'Fans in the database', subtitle: 'With a unique e-mail address',
    conditions: ['Has e-mail address'], value: 221509, prev: { yesterday: 221140, lastYear: 198300 },
    createdBy: 'camille', createdAt: '3 Sep' },
  { id: 'f2', tab: 'fanbase', kind: 'share', measure: 'people', source: 'contact',
    title: 'Fans with a commercial opt-in', subtitle: 'Can be approached commercially',
    conditions: ['Commercial opt-in is Yes'], value: 104762, base: ALL_FANS, prev: { yesterday: 104590, lastYear: 91200 },
    createdBy: 'sarah', createdAt: '3 Sep' },
  { id: 'f3', tab: 'fanbase', kind: 'share', measure: 'people', source: 'contact',
    title: 'Fans with complete contact details', subtitle: 'Known e-mail and phone number',
    conditions: ['Has e-mail address', 'Has phone number'], value: 117750, base: ALL_FANS, prev: { yesterday: 117610, lastYear: 104300 },
    createdBy: 'sarah', createdAt: '4 Sep' },
  { id: 'f4', tab: 'fanbase', kind: 'share', measure: 'people', source: 'contact',
    title: 'Fans with a complete address', subtitle: 'Known birth date, city, address and postcode',
    conditions: ['Has birth date', 'Has address', 'Has postcode'], value: 52028, base: ALL_FANS, prev: { yesterday: 51990, lastYear: 49870 },
    createdBy: 'sarah', createdAt: '4 Sep' },
  { id: 'f5', tab: 'fanbase', kind: 'breakdown', measure: 'people', source: 'contact', split: 'gender',
    title: 'Fans by gender', subtitle: 'Male, female and unknown',
    conditions: ['Has e-mail address'], createdBy: 'camille', createdAt: '5 Sep' },
  { id: 'f6', tab: 'fanbase', kind: 'breakdown', measure: 'people', source: 'contact', split: 'city',
    title: 'Where our fans live', subtitle: 'Top 5 cities',
    conditions: ['Has e-mail address'], createdBy: 'camille', createdAt: '5 Sep' },
  { id: 'f7', tab: 'fanbase', kind: 'perDay', measure: 'people', source: 'contact',
    title: 'New fans per day', subtitle: 'Last 31 days',
    conditions: ['Created in the last 31 days'], value: 7840, prev: { yesterday: 7428, lastYear: 6910 },
    createdBy: 'camille', createdAt: '6 Sep' },

  // Season tickets
  { id: 's1', tab: 'season', kind: 'number', measure: 'people', source: 'subscription',
    title: 'Season ticket holders 26/27', subtitle: 'Unique fans with an active season ticket',
    conditions: ['Season 26/27', 'Status is Active'], value: 12447, prev: { yesterday: 12401, lastYear: 11980 }, compare: 'lastYear',
    createdBy: 'hugo', createdAt: '1 Sep' },
  { id: 's2', tab: 'season', kind: 'number', measure: 'people', source: 'subscription',
    title: 'Not renewed yet', subtitle: 'Holders 25/26 without a 26/27 season ticket',
    conditions: ['Season 25/26', 'No 26/27 subscription'], value: 1284, prev: { yesterday: 1330, lastYear: 1459 },
    createdBy: 'hugo', createdAt: '12 Sep' },
  { id: 's3', tab: 'season', kind: 'breakdown', measure: 'people', source: 'subscription', split: 'tribune',
    title: 'Season ticket holders by tribune', subtitle: 'Season 26/27',
    conditions: ['Season 26/27', 'Status is Active'], createdBy: 'hugo', createdAt: '12 Sep' },
  { id: 's4', tab: 'season', kind: 'target', measure: 'subscriptions', source: 'order',
    title: 'Season tickets sold 26/27', subtitle: 'Regular and multi-year season tickets',
    conditions: ['Product is Season ticket', 'Season 26/27'], value: 12447, target: 14000, prev: { yesterday: 12401, lastYear: 11980 },
    createdBy: 'hugo', createdAt: '14 Sep' },
  { id: 's5', tab: 'season', kind: 'target', measure: 'revenue', source: 'order',
    title: 'Season ticket revenue 26/27', subtitle: 'Net, excluding VAT',
    conditions: ['Product is Season ticket', 'Season 26/27'], value: 2828570, target: 3250000, prev: { yesterday: 2818100, lastYear: 2651000 },
    createdBy: 'sarah', createdAt: '14 Sep' },
  { id: 's6', tab: 'season', kind: 'manualData', unit: 'eur', op: 'multiply',
    title: 'Revenue still to win from renewals', subtitle: 'Own estimate',
    entries: [
      { label: 'Holders not renewed yet', value: 1284 },
      { label: 'Average season ticket price (€)', value: 228 },
      { label: 'Expected renewal rate', value: 0.6 },
    ], createdBy: 'hugo', createdAt: '15 Oct' },
  { id: 's7', tab: 'season', kind: 'manualData', unit: 'eur', op: 'sum', target: 3600000,
    title: 'Season budget incl. partners', subtitle: 'Season tickets plus offline sales',
    entries: [
      { label: 'Season ticket revenue', value: 2828570 },
      { label: 'Partner packages (offline)', value: 410000 },
      { label: 'Hospitality boxes (offline)', value: 265000 },
    ], createdBy: 'sarah', createdAt: '16 Oct' },

  // Matchday
  { id: 'm1', tab: 'matchday', kind: 'countdown', event: 'derby',
    title: 'Days until the derby', subtitle: 'Next home match',
    createdBy: 'hugo', createdAt: '6 Oct' },
  { id: 'm2', tab: 'matchday', kind: 'target', measure: 'tickets', source: 'ticket',
    title: 'Tickets sold for the derby', subtitle: 'Against stadium capacity',
    conditions: ['Event: FC Demo vs. Olympique Exemple'], value: 23140, target: 28000, prev: { yesterday: 22610, lastYear: 21480 },
    createdBy: 'hugo', createdAt: '6 Oct' },
  { id: 'm3', tab: 'matchday', kind: 'target', measure: 'tickets', source: 'ticket',
    title: 'Virage Sud sold', subtitle: 'Against block capacity',
    conditions: ['Event: FC Demo vs. Olympique Exemple', 'Tribune is Virage Sud'], value: 1380, target: 4800, prev: { yesterday: 1302, lastYear: 2210 },
    createdBy: 'hugo', createdAt: '6 Oct' },
  { id: 'm4', tab: 'matchday', kind: 'perDay', measure: 'tickets', source: 'ticket',
    title: 'Tickets sold per day for the derby', subtitle: 'Last 31 days',
    conditions: ['Event: FC Demo vs. Olympique Exemple'], value: 9480, prev: { yesterday: 9068, lastYear: 8120 },
    createdBy: 'hugo', createdAt: '6 Oct' },
  { id: 'm5', tab: 'matchday', kind: 'number', measure: 'people', source: 'ticket',
    title: 'Unique buyers for the derby', subtitle: 'Fans with at least one ticket',
    conditions: ['Event: FC Demo vs. Olympique Exemple'], value: 9214, prev: { yesterday: 9050, lastYear: 8630 }, compare: 'none',
    createdBy: 'camille', createdAt: '7 Oct' },
  { id: 'm6', tab: 'matchday', kind: 'breakdown', measure: 'tickets', source: 'ticket', split: 'channel',
    title: 'Sales by channel', subtitle: 'Derby tickets',
    conditions: ['Event: FC Demo vs. Olympique Exemple'], createdBy: 'hugo', createdAt: '7 Oct' },

  // Merchandise: Batch 2
  { id: 'w1', tab: 'shop', kind: 'target', measure: 'revenue', source: 'webshop',
    title: 'Merchandise revenue this season', subtitle: 'Season 26/27',
    conditions: ['Season 26/27'], value: 450779, target: 410000, prev: { yesterday: 448200, lastYear: 391000 },
    createdBy: 'sarah', createdAt: '2 Oct' },
  { id: 'w2', tab: 'shop', kind: 'number', measure: 'orders', source: 'webshop',
    title: 'Webshop orders this season', subtitle: 'Season 26/27',
    conditions: ['Season 26/27'], value: 5762, prev: { yesterday: 5731, lastYear: 4980 }, compare: 'lastYear',
    createdBy: 'sarah', createdAt: '2 Oct' },
  { id: 'w3', tab: 'shop', kind: 'manualData', unit: 'eur', op: 'divide',
    title: 'Average order value', subtitle: 'Revenue divided by orders',
    entries: [
      { label: 'Merchandise revenue', value: 450779 },
      { label: 'Webshop orders', value: 5762 },
    ], createdBy: 'sarah', createdAt: '3 Oct' },
  { id: 'w4', tab: 'shop', kind: 'breakdown', measure: 'orders', source: 'webshop', split: 'category',
    title: 'Products sold per category', subtitle: 'Season 26/27',
    conditions: ['Season 26/27'], createdBy: 'sarah', createdAt: '3 Oct' },
  { id: 'w5', tab: 'shop', kind: 'perDay', measure: 'revenue', source: 'webshop',
    title: 'Webshop revenue per day', subtitle: 'Last 31 days',
    conditions: ['Last 31 days'], value: 61240, prev: { yesterday: 59980, lastYear: 52100 },
    createdBy: 'sarah', createdAt: '4 Oct' },

  // Notes: manual text cards (Batch 2, to confirm)
  { id: 'n1', tab: 'notes', kind: 'text',
    title: 'Kidsclub', subtitle: 'Improving and growing the kidsclub',
    text: 'Today members come in through imports and direct debit.\nForm on the new website, then automatically into the marketing platform and the fan profile.\nAn automation notifies the kidsclub team of every new member.',
    createdBy: 'camille', createdAt: '10 Oct' },
  { id: 'n2', tab: 'notes', kind: 'text',
    title: 'Personalisation of buyers', subtitle: 'Offline purchases and several tickets on one name',
    text: 'Fans with several season tickets on the same name.\nFans with several tickets for one match.\nOffline purchases in the fan shop: club card, barcode scan, QR code in the app.',
    createdBy: 'hugo', createdAt: '11 Oct' },
  { id: 'n3', tab: 'season', kind: 'text',
    title: 'Renewal campaign', subtitle: 'Key moments',
    text: 'Early-bird price ends 31 October.\nReminder e-mail to holders not renewed yet on 1 November.\nSeats released to the waiting list on 15 November.',
    createdBy: 'hugo', createdAt: '12 Oct' },
];

const TX = ['tickets', 'orders', 'subscriptions', 'revenue'];

/** The features a card needs before it can exist. */
export function needsOf(card) {
  const n = ['page'];
  if (card.kind === 'manualData') n.push('manualData');
  else if (card.kind === 'text') n.push('manualText');
  else if (card.kind === 'countdown') n.push('countdown');
  else n.push(card.kind);
  if (TX.includes(card.measure)) n.push('tx');
  return n;
}

export const cardAvailable = (card, batch) => needsOf(card).every((f) => has(batch, f));

/** Result of a manual data card: entries combined left to right. */
export function manualResult(card) {
  const vals = (card.entries ?? []).map((e) => Number(e.value) || 0);
  if (!vals.length) return 0;
  if (card.op === 'multiply') return vals.reduce((a, b) => a * b, 1);
  if (card.op === 'divide') return vals.slice(1).reduce((a, b) => (b === 0 ? NaN : a / b), vals[0]);
  return vals.reduce((a, b) => a + b, 0);
}

export const OPS = [
  { value: 'sum', label: 'Add up', sign: '+' },
  { value: 'multiply', label: 'Multiply', sign: '×' },
  { value: 'divide', label: 'Divide', sign: '÷' },
];

export const UNITS = [
  { value: 'eur', label: 'Amount (€)' },
  { value: 'number', label: 'Number' },
  { value: 'pct', label: 'Percentage' },
];

export const AI_PROMPTS = [
  'season ticket holders who did not renew yet',
  'tickets sold per day for the next home match',
  'where do our fans live',
];
