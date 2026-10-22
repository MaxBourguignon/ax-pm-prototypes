/**
 * Mock data for the all-batches Insights mockup.
 *
 * Everything belongs to a fictional demo organisation, so the mockup resembles
 * no real client. Field names and values are kept generic on purpose: clients
 * are football clubs, but also cycling teams with a fan peloton, events and
 * venues; the real field list comes from Joost. Card ideas come from the Fanalists Insights list (2,364 cards)
 * and the current Fanalists start page; the numbers are made up.
 */
import { has } from './batches';

export const ACCOUNT = { name: 'Demo organisation' };

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

/* A card starts from one source. Everything after that comes from the same
   source: what you can count (measures), what you can filter on (fields), what
   you can split by and which date a series runs on (Joost, 22 October).

   The sources are the four shops: Ticketing, Subscriptions, Registrations and
   E-commerce. There is no Contacts dataset in the new set-up (Joost, 22
   October). Fields per shop are illustrative; the real list comes from the AX
   segmentation engine (nobody knows it in full yet).

   Measures: "Count profiles" is Batch 1 (the segmentation engine counts
   profiles on any shop); counting transactions or summing revenue is Batch 2
   ('tx'). Days until an event sits on Ticketing, Batch 2 ('countdown'). */
export const SOURCES = [
  {
    value: 'ticket', label: 'Ticketing', noun: 'tickets', dateField: 'Sale date',
    measures: [
      { value: 'people', label: 'Count buyers (profiles)', needs: 'segLogic' },
      { value: 'tickets', label: 'Count tickets', needs: 'tx' },
      { value: 'revenue', label: 'Sum of revenue', needs: 'tx' },
      { value: 'days', label: 'Days until the event', needs: 'countdown' },
    ],
    fields: [
      { field: 'Event', values: ['Main event, 8 November', 'Final, 24 January', 'All events'] },
      { field: 'Season', values: ['25/26', '26/27'] },
      { field: 'Ticket type', values: ['Single event', 'Kids', 'VIP', 'Hospitality', 'Invitation'] },
      { field: 'Section', values: ['Section A', 'Section B', 'Main stand', 'Family zone'] },
      { field: 'Sales channel', values: ['Online', 'Box office', 'Partner resale', 'Mobile app'] },
      { field: 'Scanned at entry', values: ['Yes', 'No'] },
    ],
  },
  {
    value: 'subscription', label: 'Subscriptions', noun: 'subscriptions', dateField: 'Purchase date',
    measures: [
      { value: 'people', label: 'Count holders (profiles)', needs: 'segLogic' },
      { value: 'subscriptions', label: 'Count subscriptions', needs: 'tx' },
      { value: 'revenue', label: 'Sum of revenue', needs: 'tx' },
    ],
    fields: [
      { field: 'Season', values: ['24/25', '25/26', '26/27'] },
      { field: 'Status', values: ['Active', 'Expired', 'Cancelled'] },
      { field: 'Product', values: ['Season pass', 'Multi-year pass', 'Membership', 'Supporters club'] },
      { field: 'Section', values: ['Section A', 'Section B', 'Main stand', 'Family zone'] },
      { field: 'Renewed for next season', values: ['Yes', 'No'] },
    ],
  },
  {
    value: 'registration', label: 'Registrations', noun: 'registrations', dateField: 'Registration date',
    measures: [
      { value: 'people', label: 'Count registrants (profiles)', needs: 'segLogic' },
      { value: 'registrations', label: 'Count registrations', needs: 'tx' },
    ],
    fields: [
      { field: 'Registration type', values: ['Kidsclub', 'Newsletter', 'Open day', 'Season gala'] },
      { field: 'Season', values: ['25/26', '26/27'] },
      { field: 'Status', values: ['Confirmed', 'Cancelled'] },
      { field: 'Attended', values: ['Yes', 'No'] },
    ],
  },
  {
    value: 'ecommerce', label: 'E-commerce', noun: 'orders', dateField: 'Order date',
    measures: [
      { value: 'people', label: 'Count buyers (profiles)', needs: 'segLogic' },
      { value: 'orders', label: 'Count orders', needs: 'tx' },
      { value: 'items', label: 'Count products sold', needs: 'tx' },
      { value: 'revenue', label: 'Sum of revenue', needs: 'tx' },
    ],
    fields: [
      { field: 'Season', values: ['25/26', '26/27'] },
      { field: 'Product category', values: ['Jerseys', 'Fan articles', 'Clothing', 'Kids'] },
      { field: 'Order status', values: ['Paid', 'Refunded'] },
      { field: 'Discount code used', values: ['Yes', 'No'] },
    ],
  },
];

export const sourceOf = (v) => SOURCES.find((s) => s.value === v);
export const measureOf = (source, m) => sourceOf(source)?.measures.find((x) => x.value === m);

/* How a card shows its number. Which formats a measure allows follows from
   the measure; the batch decides which are available. */
export const KINDS = [
  { value: 'number', label: 'Number' },
  { value: 'breakdown', label: 'Breakdown (split by a field)' },
  { value: 'share', label: 'Share of all' },
  { value: 'perDay', label: 'Per day' },
  { value: 'target', label: 'Progress to a target' },
];
export const kindsFor = (measure) => (measure === 'days'
  ? [{ value: 'countdown', label: 'Countdown' }]
  : KINDS.filter((k) => !(k.value === 'share' && measure === 'revenue')));

export const EVENTS = [
  { value: 'main', label: 'Main event, 8 November', date: '2026-11-08' },
  { value: 'final', label: 'Final, 24 January', date: '2027-01-24' },
  { value: 'gala', label: 'Season gala', date: '2026-12-12' },
];

/* Breakdown rows per field; fields without fixed rows get rows made from their values. */
export const BREAKDOWNS = {
  'Registration type': [
    { label: 'Newsletter', value: 18420 }, { label: 'Kidsclub', value: 1860 },
    { label: 'Open day', value: 1240 }, { label: 'Season gala', value: 610 },
  ],
  Section: [
    { label: 'Section A', value: 5890 }, { label: 'Section B', value: 2760 },
    { label: 'Main stand', value: 2120 }, { label: 'Family zone', value: 1265 }, { label: 'Other', value: 412 },
  ],
  'Sales channel': [
    { label: 'Online', value: 15820 }, { label: 'Box office', value: 3410 },
    { label: 'Partner resale', value: 1980 }, { label: 'Mobile app', value: 1640 }, { label: 'Other', value: 290 },
  ],
  'Product category': [
    { label: 'Jerseys', value: 14224 }, { label: 'Fan articles', value: 9489 },
    { label: 'Clothing', value: 7426 }, { label: 'Kids', value: 3120 }, { label: 'Other', value: 1840 },
  ],
};

export const rowsFor = (source, field) => BREAKDOWNS[field]
  ?? (sourceOf(source)?.fields.find((f) => f.field === field)?.values ?? ['A', 'B', 'C'])
    .map((label, i) => ({ label, value: Math.round(4200 / (i + 1.4)) }));

export const SERIES = [
  120, 95, 80, 0, 140, 210, 160, 130, 115, 90, 2480, 610, 380, 300, 260,
  240, 0, 220, 205, 190, 260, 310, 280, 250, 230, 410, 520, 470, 430, 395, 412,
];

export const INITIAL_TABS = [
  { id: 'season', name: 'Subscriptions' },
  { id: 'matchday', name: 'Events' },
  { id: 'registrations', name: 'Registrations' },
  { id: 'shop', name: 'Merchandise', needs: 'tx' },
  { id: 'notes', name: 'Notes', needs: 'manualText' },
];

let _id = 500;
export const newId = () => `a${_id++}`;

export const INITIAL_CARDS = [
  // Subscriptions
  { id: 's1', tab: 'season', kind: 'number', measure: 'people', source: 'subscription',
    title: 'Subscribers 26/27', subtitle: 'Unique fans with an active subscription',
    conditions: ['Season is 26/27', 'Status is Active'], value: 12447, prev: { yesterday: 12401, lastYear: 11980 }, compare: 'lastYear',
    createdBy: 'hugo', createdAt: '1 Sep' },
  { id: 's2', tab: 'season', kind: 'number', measure: 'people', source: 'subscription',
    title: 'Not renewed yet', subtitle: 'Holders 25/26 without a 26/27 subscription',
    conditions: ['Season is 25/26', 'Renewed for next season is No'], value: 1284, prev: { yesterday: 1330, lastYear: 1459 },
    createdBy: 'hugo', createdAt: '12 Sep' },
  { id: 's3', tab: 'season', kind: 'breakdown', measure: 'people', source: 'subscription', split: 'Section',
    title: 'Subscribers by section', subtitle: 'Season 26/27',
    conditions: ['Season is 26/27', 'Status is Active'], createdBy: 'hugo', createdAt: '12 Sep' },
  { id: 's4', tab: 'season', kind: 'target', measure: 'subscriptions', source: 'subscription',
    title: 'Subscriptions sold 26/27', subtitle: 'All active subscriptions',
    conditions: ['Season is 26/27', 'Status is Active'], value: 12447, target: 14000, prev: { yesterday: 12401, lastYear: 11980 },
    createdBy: 'hugo', createdAt: '14 Sep' },
  { id: 's5', tab: 'season', kind: 'target', measure: 'revenue', source: 'subscription',
    title: 'Subscription revenue 26/27', subtitle: 'Net, excluding VAT',
    conditions: ['Season is 26/27', 'Status is Active'], value: 2828570, target: 3250000, prev: { yesterday: 2818100, lastYear: 2651000 },
    createdBy: 'sarah', createdAt: '14 Sep' },
  { id: 's6', tab: 'season', kind: 'manualData', unit: 'eur', op: 'multiply',
    title: 'Revenue still to win from renewals', subtitle: 'Own estimate',
    entries: [
      { label: 'Holders not renewed yet', value: 1284 },
      { label: 'Average subscription price (€)', value: 228 },
      { label: 'Expected renewal rate', value: 0.6 },
    ], createdBy: 'hugo', createdAt: '15 Oct' },
  { id: 's7', tab: 'season', kind: 'manualData', unit: 'eur', op: 'sum', target: 3600000,
    title: 'Season budget incl. partners', subtitle: 'Subscriptions plus offline sales',
    entries: [
      { label: 'Subscription revenue', value: 2828570 },
      { label: 'Partner packages (offline)', value: 410000 },
      { label: 'Hospitality boxes (offline)', value: 265000 },
    ], createdBy: 'sarah', createdAt: '16 Oct' },

  // Events
  { id: 'm1', tab: 'matchday', kind: 'countdown', event: 'main', source: 'ticket', measure: 'days',
    conditions: ['Event is Main event, 8 November'],
    title: 'Days until the main event', subtitle: 'Next event',
    createdBy: 'hugo', createdAt: '6 Oct' },
  { id: 'm2', tab: 'matchday', kind: 'target', measure: 'tickets', source: 'ticket',
    title: 'Tickets sold for the main event', subtitle: 'Against venue capacity',
    conditions: ['Event is Main event, 8 November'], value: 23140, target: 28000, prev: { yesterday: 22610, lastYear: 21480 },
    createdBy: 'hugo', createdAt: '6 Oct' },
  { id: 'm3', tab: 'matchday', kind: 'target', measure: 'tickets', source: 'ticket',
    title: 'Section B sold', subtitle: 'Against section capacity',
    conditions: ['Event is Main event, 8 November', 'Section is Section B'], value: 1380, target: 4800, prev: { yesterday: 1302, lastYear: 2210 },
    createdBy: 'hugo', createdAt: '6 Oct' },
  { id: 'm4', tab: 'matchday', kind: 'perDay', measure: 'tickets', source: 'ticket',
    title: 'Tickets sold per day, main event', subtitle: 'Last 31 days',
    conditions: ['Event is Main event, 8 November'], value: 9480, prev: { yesterday: 9068, lastYear: 8120 },
    createdBy: 'hugo', createdAt: '6 Oct' },
  { id: 'm5', tab: 'matchday', kind: 'number', measure: 'people', source: 'ticket',
    title: 'Unique buyers, main event', subtitle: 'Fans with at least one ticket',
    conditions: ['Event is Main event, 8 November'], value: 9214, prev: { yesterday: 9050, lastYear: 8630 }, compare: 'none',
    createdBy: 'camille', createdAt: '7 Oct' },
  { id: 'm6', tab: 'matchday', kind: 'breakdown', measure: 'tickets', source: 'ticket', split: 'Sales channel',
    title: 'Sales by channel', subtitle: 'Main event tickets',
    conditions: ['Event is Main event, 8 November'], createdBy: 'hugo', createdAt: '7 Oct' },

  // Registrations
  { id: 'r1', tab: 'registrations', kind: 'number', measure: 'people', source: 'registration',
    title: 'Kidsclub members 26/27', subtitle: 'Unique registrants, confirmed',
    conditions: ['Registration type is Kidsclub', 'Season is 26/27', 'Status is Confirmed'], value: 1860, prev: { yesterday: 1852, lastYear: 1610 },
    createdBy: 'camille', createdAt: '10 Oct' },
  { id: 'r2', tab: 'registrations', kind: 'breakdown', measure: 'people', source: 'registration', split: 'Registration type',
    title: 'Registrants by type', subtitle: 'Season 26/27',
    conditions: ['Season is 26/27'], createdBy: 'camille', createdAt: '10 Oct' },
  { id: 'r3', tab: 'registrations', kind: 'share', measure: 'people', source: 'registration',
    title: 'Open day: showed up', subtitle: 'Share of all registrants',
    conditions: ['Registration type is Open day', 'Attended is Yes'], value: 868, base: { label: 'registrations', value: 1240 }, prev: { yesterday: 868, lastYear: 790 },
    createdBy: 'camille', createdAt: '11 Oct' },
  { id: 'r4', tab: 'registrations', kind: 'perDay', measure: 'registrations', source: 'registration',
    title: 'Season gala registrations per day', subtitle: 'Last 31 days',
    conditions: ['Registration type is Season gala'], value: 610, prev: { yesterday: 596, lastYear: 540 },
    createdBy: 'sarah', createdAt: '12 Oct' },

  // Merchandise: Batch 2
  { id: 'w1', tab: 'shop', kind: 'target', measure: 'revenue', source: 'ecommerce',
    title: 'Merchandise revenue this season', subtitle: 'Season 26/27',
    conditions: ['Season is 26/27'], value: 450779, target: 410000, prev: { yesterday: 448200, lastYear: 391000 },
    createdBy: 'sarah', createdAt: '2 Oct' },
  { id: 'w2', tab: 'shop', kind: 'number', measure: 'orders', source: 'ecommerce',
    title: 'Webshop orders this season', subtitle: 'Season 26/27',
    conditions: ['Season is 26/27'], value: 5762, prev: { yesterday: 5731, lastYear: 4980 }, compare: 'lastYear',
    createdBy: 'sarah', createdAt: '2 Oct' },
  { id: 'w3', tab: 'shop', kind: 'manualData', unit: 'eur', op: 'divide',
    title: 'Average order value', subtitle: 'Revenue divided by orders',
    entries: [
      { label: 'Merchandise revenue', value: 450779 },
      { label: 'Webshop orders', value: 5762 },
    ], createdBy: 'sarah', createdAt: '3 Oct' },
  { id: 'w4', tab: 'shop', kind: 'breakdown', measure: 'items', source: 'ecommerce', split: 'Product category',
    title: 'Products sold per category', subtitle: 'Season 26/27',
    conditions: ['Season is 26/27'], createdBy: 'sarah', createdAt: '3 Oct' },
  { id: 'w5', tab: 'shop', kind: 'perDay', measure: 'revenue', source: 'ecommerce',
    title: 'Webshop revenue per day', subtitle: 'Last 31 days',
    conditions: ['Order status is Paid'], value: 61240, prev: { yesterday: 59980, lastYear: 52100 },
    createdBy: 'sarah', createdAt: '4 Oct' },

  // Notes: manual text cards (Batch 2, to confirm)
  { id: 'n1', tab: 'notes', kind: 'text',
    title: 'Kidsclub', subtitle: 'Improving and growing the kidsclub',
    text: 'Today members come in through imports and direct debit.\nForm on the new website, then automatically into the marketing platform and the fan profile.\nAn automation notifies the kidsclub team of every new member.',
    createdBy: 'camille', createdAt: '10 Oct' },
  { id: 'n2', tab: 'notes', kind: 'text',
    title: 'Personalisation of buyers', subtitle: 'Offline purchases and several tickets on one name',
    text: 'Fans with several subscriptions on the same name.\nFans with several tickets for one event.\nOffline purchases in the fan shop: club card, barcode scan, QR code in the app.',
    createdBy: 'hugo', createdAt: '11 Oct' },
  { id: 'n3', tab: 'season', kind: 'text',
    title: 'Renewal campaign', subtitle: 'Key moments',
    text: 'Early-bird price ends 31 October.\nReminder e-mail to holders not renewed yet on 1 November.\nSeats released to the waiting list on 15 November.',
    createdBy: 'hugo', createdAt: '12 Oct' },
];

/** The features a card needs before it can exist. */
export function needsOf(card) {
  const n = ['page'];
  if (card.kind === 'manualData') return [...n, 'manualData'];
  if (card.kind === 'text') return [...n, 'manualText'];
  n.push(card.kind);
  const m = measureOf(card.source, card.measure);
  if (m) n.push(m.needs);
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
  'subscribers who did not renew yet',
  'tickets sold per day for the next event',
  'kidsclub members this season',
];

/* Scripted stand-in for the AI (Batch 3): it fills the same steps a person
   fills by hand, from one source, with "field is value" conditions. */
export const AI_SCRIPTS_ALL = [
  { match: ['renew'], fill: {
    source: 'subscription', measure: 'people', kind: 'number', title: 'Not renewed yet', value: 1284,
    conditions: [{ label: 'Season is 25/26' }, { label: 'Renewed for next season is No', flagged: true }] } },
  { match: ['per day', 'next event', 'daily'], fill: {
    source: 'ticket', measure: 'tickets', kind: 'perDay', title: 'Tickets sold per day, next event', value: 9480,
    conditions: [{ label: 'Event is Main event, 8 November', flagged: true }] } },
  { match: ['kidsclub', 'members', 'registr'], fill: {
    source: 'registration', measure: 'people', kind: 'number', title: 'Kidsclub members this season', value: 1860,
    conditions: [{ label: 'Registration type is Kidsclub' }, { label: 'Season is 26/27', flagged: true }] } },
  { match: ['revenue', 'turnover'], fill: {
    source: 'ecommerce', measure: 'revenue', kind: 'number', title: 'Merchandise revenue this season', value: 1523000,
    conditions: [{ label: 'Season is 26/27' }] } },
  { match: ['instagram', 'likes', 'tv', 'weather'],
    refuse: 'Arenametrix holds no social media, TV or weather data, so this card cannot be built. Try: tickets sold per day for the next event.' },
];
