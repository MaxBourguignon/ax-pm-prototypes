/**
 * Report Builder IA — mock data + semantic layer + scripted agent.
 *
 * PM: not specified · Fidelity: Clickable · Spec: "Report Builder IA" (Analytics / Dashboards)
 *
 * GDPR: nothing here is a real person. Every contact-level figure is a PRE-COMPUTED
 * AGGREGATE — the semantic layer deliberately exposes no nominative identifier to the
 * agent, exactly as the spec requires. City/tier/age counts are bucket totals, never rows.
 *
 * The agent is SCRIPTED, not an LLM call (spec: "comportements scriptés dans le
 * prototype, aucun appel LLM réel requis"). AGENT_SCRIPT below is the behaviour matrix
 * turned into keyword-triggered turns.
 */

/* ── Reference entities ─────────────────────────────────────────────────────── */

// 8 events — evt_448 has zero sales (empty-state widget), evt_401 is in the past
// (countdown goes negative), evt_442 is the default context everywhere.
export const EVENTS = [
  { id: 'evt_401', name: 'Stade Rennais – Olympique de Marseille', date: '2026-04-11', capacity: 29778, status: 'past',      ticketsSold: 28904 },
  { id: 'evt_442', name: 'Stade Rennais – Paris Saint-Germain',    date: '2026-10-04', capacity: 29778, status: 'on_sale',   ticketsSold: 24117 },
  { id: 'evt_443', name: 'Stade Rennais – LOSC Lille',             date: '2026-10-25', capacity: 29778, status: 'on_sale',   ticketsSold: 19340 },
  { id: 'evt_444', name: 'Stade Rennais – RC Lens',                date: '2026-11-08', capacity: 29778, status: 'on_sale',   ticketsSold: 15882 },
  { id: 'evt_445', name: 'Festival Les Transmusicales — Pass 3 jours', date: '2026-12-03', capacity: 12000, status: 'on_sale', ticketsSold: 9431 },
  { id: 'evt_446', name: 'Festival Les Transmusicales — Soirée d’ouverture', date: '2026-12-03', capacity: 4200, status: 'on_sale', ticketsSold: 3877 },
  { id: 'evt_447', name: 'Stade Rennais – Stade Brestois',         date: '2027-01-17', capacity: 29778, status: 'on_sale',   ticketsSold: 6204 },
  { id: 'evt_448', name: 'Rencontre Abonnés — Saison 2027/28',     date: '2027-06-20', capacity: 800,   status: 'announced', ticketsSold: 0 },
];

// 6 tribunes.
export const TRIBUNES = [
  { id: 'trb_1', name: 'Tribune Mordelles',    capacity: 8420 },
  { id: 'trb_2', name: 'Tribune Ville-Jean',   capacity: 7960 },
  { id: 'trb_3', name: 'Tribune Rennes Métropole', capacity: 6310 },
  { id: 'trb_4', name: 'Tribune Super U',      capacity: 4890 },
  { id: 'trb_5', name: 'Loges & Salons',       capacity: 1420 },
  { id: 'trb_6', name: 'Parcage Visiteurs',    capacity: 778 },
];

// 40 products — prd_18 carries a 78-character name to test label truncation.
export const PRODUCTS = [
  { id: 'prd_01', name: 'Place Match Simple', category: 'Billetterie unitaire', price: 28 },
  { id: 'prd_02', name: 'Place Match Simple Tarif Réduit', category: 'Billetterie unitaire', price: 19 },
  { id: 'prd_03', name: 'Place Match Simple Enfant', category: 'Billetterie unitaire', price: 12 },
  { id: 'prd_04', name: 'Abonnement Saison Complète', category: 'Abonnement', price: 420 },
  { id: 'prd_05', name: 'Abonnement Demi-Saison', category: 'Abonnement', price: 240 },
  { id: 'prd_06', name: 'Abonnement Jeune (-16 ans)', category: 'Abonnement', price: 95 },
  { id: 'prd_07', name: 'Pack 5 Matchs', category: 'Pack', price: 125 },
  { id: 'prd_08', name: 'Pack Famille (2 adultes + 2 enfants)', category: 'Pack', price: 68 },
  { id: 'prd_09', name: 'Loge Entreprise 10 places', category: 'Hospitalité', price: 2400 },
  { id: 'prd_10', name: 'Salon Présidentiel', category: 'Hospitalité', price: 310 },
  { id: 'prd_11', name: 'Visite du Stade', category: 'Expérience', price: 14 },
  { id: 'prd_12', name: 'Maillot Domicile 26/27', category: 'Boutique', price: 89 },
  { id: 'prd_13', name: 'Écharpe Collector', category: 'Boutique', price: 22 },
  { id: 'prd_14', name: 'Pass 3 Jours Transmusicales', category: 'Festival', price: 96 },
  { id: 'prd_15', name: 'Pass 1 Jour Transmusicales', category: 'Festival', price: 42 },
  { id: 'prd_16', name: 'Camping Festival', category: 'Festival', price: 24 },
  { id: 'prd_17', name: 'Navette Festival Aller-Retour', category: 'Festival', price: 8 },
  // ⬇ 78 characters — the long-label edge case.
  { id: 'prd_18', name: 'Abonnement Saison Complète Tribune Rennes Métropole Catégorie 1 Placement Garanti', category: 'Abonnement', price: 640 },
  { id: 'prd_19', name: 'Place Coupe de France', category: 'Billetterie unitaire', price: 24 },
  { id: 'prd_20', name: 'Place Match Européen', category: 'Billetterie unitaire', price: 45 },
];

// 15 campaigns.
export const CAMPAIGNS = [
  { id: 'cmp_01', name: 'Ouverture billetterie SRFC–PSG', sentAt: '2026-08-28', sent: 42180, opens: 19713, clicks: 4462 },
  { id: 'cmp_02', name: 'Relance abonnés 25/26', sentAt: '2026-09-02', sent: 11406, opens: 6844, clicks: 1972 },
  { id: 'cmp_03', name: 'Dernières places Mordelles', sentAt: '2026-09-08', sent: 18220, opens: 7288, clicks: 1604 },
  { id: 'cmp_04', name: 'Newsletter septembre', sentAt: '2026-09-01', sent: 51940, opens: 16102, clicks: 2338 },
  { id: 'cmp_05', name: 'Transmusicales — early bird', sentAt: '2026-06-14', sent: 28770, opens: 13809, clicks: 3684 },
  { id: 'cmp_06', name: 'Transmusicales — J-30', sentAt: '2026-11-03', sent: 30115, opens: 11743, clicks: 2409 },
  { id: 'cmp_07', name: 'Offre famille vacances Toussaint', sentAt: '2026-10-12', sent: 22450, opens: 8082, clicks: 1571 },
  { id: 'cmp_08', name: 'Réactivation acheteurs 2024', sentAt: '2026-07-19', sent: 16380, opens: 3931, clicks: 524 },
  { id: 'cmp_09', name: 'Boutique — nouveau maillot', sentAt: '2026-07-04', sent: 47100, opens: 20724, clicks: 6123 },
  { id: 'cmp_10', name: 'Invitation loges entreprises', sentAt: '2026-08-05', sent: 1240, opens: 806, clicks: 291 },
  { id: 'cmp_11', name: 'Enquête satisfaction saison', sentAt: '2026-06-28', sent: 38900, opens: 12837, clicks: 2723 },
  { id: 'cmp_12', name: 'SMS — J-1 SRFC–PSG', sentAt: '2026-10-03', sent: 9820, opens: 9231, clicks: 1178 },
  { id: 'cmp_13', name: 'Bienvenue nouveaux inscrits', sentAt: '2026-09-15', sent: 4310, opens: 2758, clicks: 861 },
  { id: 'cmp_14', name: 'Coupe de France — 32es', sentAt: '2026-11-21', sent: 26740, opens: 9359, clicks: 1738 },
  { id: 'cmp_15', name: 'Visite du stade — offre hiver', sentAt: '2026-12-18', sent: 19600, opens: 5684, clicks: 992 },
];

/* ── Pre-computed aggregates (50 000 contacts · 120 000 order lines) ────────── */

export const CONTACT_TOTALS = {
  contacts: 50000,
  optInCommercial: 31480,
  createdLast30d: 2164,
  // 204 distinct cities in the base — this is what trips the top-N auto-switch.
  distinctCities: 204,
};

export const ORDER_TOTALS = {
  lines: 120000,
  confirmed: 113472,
  cancelled: 6528, // the cancelled status that makes "tickets = confirmed" an assumption
  grossRevenue: 4187920,
};

/* ── Semantic layer — the only way the agent sees data ──────────────────────── */

export const MEASURES = [
  { id: 'tickets_sold',     label: 'Tickets sold',        agg: 'count',    unit: 'tickets', family: 'Ticketing' },
  { id: 'gross_revenue',    label: 'Gross revenue',       agg: 'sum',      unit: '€',       family: 'Ticketing' },
  { id: 'net_revenue',      label: 'Net revenue',         agg: 'sum',      unit: '€',       family: 'Ticketing' },
  { id: 'avg_basket',       label: 'Average basket',      agg: 'avg',      unit: '€',       family: 'Ticketing' },
  { id: 'orders_count',     label: 'Orders',              agg: 'count',    unit: 'orders',  family: 'Ticketing' },
  { id: 'cancelled_tickets',label: 'Cancelled tickets',   agg: 'count',    unit: 'tickets', family: 'Ticketing' },
  { id: 'refund_amount',    label: 'Refunded amount',     agg: 'sum',      unit: '€',       family: 'Ticketing' },
  { id: 'fill_rate',        label: 'Fill rate',           agg: 'ratio',    unit: '%',       family: 'Ticketing' },
  { id: 'seats_available',  label: 'Seats available',     agg: 'sum',      unit: 'seats',   family: 'Ticketing' },
  { id: 'contacts_count',   label: 'Contacts',            agg: 'count',    unit: 'contacts',family: 'CRM' },
  { id: 'new_contacts',     label: 'New contacts',        agg: 'count',    unit: 'contacts',family: 'CRM' },
  { id: 'optin_rate',       label: 'Commercial opt-in rate', agg: 'ratio', unit: '%',       family: 'CRM' },
  { id: 'emails_sent',      label: 'Emails sent',         agg: 'sum',      unit: 'emails',  family: 'Marketing' },
  { id: 'email_open_rate',  label: 'Email open rate',     agg: 'ratio',    unit: '%',       family: 'Marketing' },
  { id: 'email_click_rate', label: 'Email click rate',    agg: 'ratio',    unit: '%',       family: 'Marketing' },
];

export const DIMENSIONS = [
  { id: 'event',            label: 'Event',              cardinality: 8,   family: 'Ticketing' },
  { id: 'tribune',          label: 'Stand',              cardinality: 6,   family: 'Ticketing' },
  { id: 'product',          label: 'Product',            cardinality: 40,  family: 'Ticketing' },
  { id: 'product_category', label: 'Product category',   cardinality: 7,   family: 'Ticketing' },
  { id: 'order_status',     label: 'Order status',       cardinality: 4,   family: 'Ticketing' },
  { id: 'price_band',       label: 'Price band',         cardinality: 6,   family: 'Ticketing' },
  { id: 'ticket_type',      label: 'Ticket type',        cardinality: 5,   family: 'Ticketing' },
  { id: 'seat_zone',        label: 'Seat zone',          cardinality: 14,  family: 'Ticketing' },
  { id: 'order_date',       label: 'Order date',         cardinality: 730, family: 'Ticketing' },
  { id: 'city',             label: 'City',               cardinality: 204, family: 'CRM' },
  { id: 'country',          label: 'Country',            cardinality: 12,  family: 'CRM' },
  { id: 'gender',           label: 'Gender',             cardinality: 3,   family: 'CRM' },
  { id: 'age_bracket',      label: 'Age bracket',        cardinality: 6,   family: 'CRM' },
  { id: 'subscription_tier',label: 'Subscription tier',  cardinality: 4,   family: 'CRM' },
  { id: 'optin_status',     label: 'Opt-in status',      cardinality: 2,   family: 'CRM' },
  { id: 'acquisition_channel', label: 'Acquisition channel', cardinality: 9, family: 'CRM' },
  { id: 'contact_created_month', label: 'Signup month',  cardinality: 36,  family: 'CRM' },
  { id: 'campaign',         label: 'Campaign',           cardinality: 15,  family: 'Marketing' },
  { id: 'channel',          label: 'Channel',            cardinality: 4,   family: 'Marketing' },
  { id: 'day_of_week',      label: 'Day of week',        cardinality: 7,   family: 'Marketing' },
];

export const COHORTS = [
  { id: 'buyers_evt_442',  label: 'Buyers of SRFC–PSG', size: 18204 },
  { id: 'season_holders',  label: 'Season-ticket holders', size: 11406 },
  { id: 'lapsed_12m',      label: 'Lapsed for 12 months', size: 7742 },
  { id: 'first_time',      label: 'First-time buyers',  size: 9930 },
];

// The top-N auto-switch threshold. Open question — to be validated on real data.
export const TOPN_THRESHOLD = 30;

/* ── Pre-computed render series, one set per widget type ────────────────────── */

export const SERIES = {
  // category_bar — tickets by stand
  tickets_by_tribune: [
    { label: 'Tribune Mordelles', value: 7284 },
    { label: 'Tribune Ville-Jean', value: 6120 },
    { label: 'Tribune Rennes Métropole', value: 5033 },
    { label: 'Tribune Super U', value: 3871 },
    { label: 'Loges & Salons', value: 1149 },
    { label: 'Parcage Visiteurs', value: 660 },
  ],

  // topn — cities, capped at 10 with an "Other" bucket (204 distinct → auto top-N)
  contacts_by_city_top10: [
    { label: 'Rennes', value: 12840 },
    { label: 'Saint-Grégoire', value: 3105 },
    { label: 'Cesson-Sévigné', value: 2874 },
    { label: 'Bruz', value: 2210 },
    { label: 'Chantepie', value: 1988 },
    { label: 'Pacé', value: 1743 },
    { label: 'Betton', value: 1602 },
    { label: 'Vitré', value: 1455 },
    { label: 'Saint-Malo', value: 1321 },
    { label: 'Fougères', value: 1104 },
    { label: 'Other (194 cities)', value: 19758, isOther: true },
  ],

  // timeseries — daily revenue, 7-day window. 2026-09-14 and 09-15 are MISSING:
  // the spec asks for a series with a two-day gap.
  revenue_daily_7d: [
    { date: '2026-09-11', value: 48210 },
    { date: '2026-09-12', value: 61940 },
    { date: '2026-09-13', value: 57302 },
    { date: '2026-09-14', value: null },
    { date: '2026-09-15', value: null },
    { date: '2026-09-16', value: 44870 },
    { date: '2026-09-17', value: 52615 },
  ],

  // funnel — "Découverte" step is 0, per the spec's zero-stage requirement
  campaign_funnel: [
    { label: 'Sent', value: 42180 },
    { label: 'Opened', value: 19713 },
    { label: 'Clicked', value: 4462 },
    { label: 'In cart', value: 1284 },
    { label: 'Purchased', value: 0 },
  ],

  // overlap — what buyers of SRFC–PSG also bought
  overlap_psg_buyers: [
    { label: 'Stade Rennais – LOSC Lille', value: 6842, pct: 37.6 },
    { label: 'Stade Rennais – RC Lens', value: 4930, pct: 27.1 },
    { label: 'Transmusicales — Pass 3 jours', value: 2118, pct: 11.6 },
    { label: 'Boutique — Maillot Domicile', value: 1774, pct: 9.7 },
    { label: 'Visite du Stade', value: 903, pct: 5.0 },
  ],

  // segment_compare — business-defined segments, not a data field
  segment_revenue: [
    { label: 'Season-ticket holders', value: 1842300 },
    { label: 'Repeat buyers', value: 1104880 },
    { label: 'First-time buyers', value: 786440 },
    { label: 'Lapsed 12m reactivated', value: 454300 },
  ],

  // histogram — events attended per contact
  events_per_contact: [
    { label: '1', value: 21440 },
    { label: '2', value: 12380 },
    { label: '3', value: 7920 },
    { label: '4', value: 4310 },
    { label: '5', value: 2260 },
    { label: '6+', value: 1690 },
  ],

  // kpi
  tickets_total: { value: 24117, previous: 21880, unit: 'tickets' },
  revenue_total: { value: 4187920, previous: 3944100, unit: '€' },

  // ratio_gauge
  fill_rate_442: { numerator: 24117, denominator: 29778 },

  // countdown
  countdown_442: { targetDate: '2026-10-04', label: 'Stade Rennais – Paris Saint-Germain' },
  countdown_past: { targetDate: '2026-04-11', label: 'Stade Rennais – Olympique de Marseille' },

  // empty result set — evt_448 has sold nothing
  empty_evt_448: [],
};

/* ── Saved widgets (12) ─────────────────────────────────────────────────────── */
/* Every spec object here is the exact WidgetSpec shape the agent emits. */

export const SAVED_WIDGETS = [
  {
    id: 'wgt_01', dashboardId: 'dsh_1', size: 'third', updatedAt: '2026-09-18T06:10:00', refreshStatus: 'ok',
    spec: {
      id: 'wgt_01', type: 'kpi', title: 'Tickets sold — SRFC–PSG',
      measure: { id: 'tickets_sold', agg: 'count' }, dimension: null,
      time: { field: 'order_date', range: 'event_lifetime', relative: true },
      filters: [{ field: 'event_id', op: 'eq', value: 'evt_442' }],
      cohort: null, comparison: 'previous_period',
      format: { unit: 'tickets', decimals: 0 }, refresh: 'daily', confidence: 0.94,
      assumptions: ['Tickets = order lines with status "confirmed"'],
      dataKey: 'tickets_total',
    },
  },
  {
    id: 'wgt_02', dashboardId: 'dsh_1', size: 'third', updatedAt: '2026-09-18T06:10:00', refreshStatus: 'ok',
    spec: {
      id: 'wgt_02', type: 'ratio_gauge', title: 'Fill rate — SRFC–PSG',
      measure: { id: 'fill_rate', agg: 'ratio' }, dimension: null,
      numerator: 'tickets_sold', denominator: 'capacity',
      time: { field: 'order_date', range: 'event_lifetime', relative: true },
      filters: [{ field: 'event_id', op: 'eq', value: 'evt_442' }],
      cohort: null, format: { unit: '%', decimals: 1 }, refresh: 'daily', confidence: 0.91,
      assumptions: ['Capacity = declared stadium capacity, visitor stand included'],
      dataKey: 'fill_rate_442',
    },
  },
  {
    id: 'wgt_03', dashboardId: 'dsh_1', size: 'third', updatedAt: '2026-09-18T06:10:00', refreshStatus: 'ok',
    spec: {
      id: 'wgt_03', type: 'countdown', title: 'Days to kick-off',
      measure: null, dimension: null, targetDate: '2026-10-04',
      time: null, filters: [{ field: 'event_id', op: 'eq', value: 'evt_442' }],
      cohort: null, format: { unit: 'days', decimals: 0 }, refresh: 'daily', confidence: 1,
      assumptions: [], dataKey: 'countdown_442',
    },
  },
  {
    id: 'wgt_04', dashboardId: 'dsh_1', size: 'half', updatedAt: '2026-09-18T06:10:00', refreshStatus: 'ok',
    spec: {
      id: 'wgt_04', type: 'category_bar', title: 'Tickets sold by stand',
      measure: { id: 'tickets_sold', agg: 'count' },
      dimension: { id: 'tribune', limit: 10, sort: 'desc', other_bucket: true },
      time: { field: 'order_date', range: 'event_lifetime', relative: true },
      filters: [{ field: 'event_id', op: 'eq', value: 'evt_442' }],
      cohort: null, format: { unit: 'tickets', decimals: 0 }, refresh: 'daily', confidence: 0.86,
      assumptions: ['Tickets = order lines with status "confirmed"'],
      dataKey: 'tickets_by_tribune',
    },
  },
  {
    id: 'wgt_05', dashboardId: 'dsh_1', size: 'half', updatedAt: '2026-09-18T06:10:00', refreshStatus: 'ok',
    spec: {
      id: 'wgt_05', type: 'timeseries', title: 'Daily revenue — last 7 days',
      measure: { id: 'gross_revenue', agg: 'sum' },
      dimension: { id: 'order_date', grain: 'day' },
      time: { field: 'order_date', range: '7d', relative: true },
      filters: [], cohort: null, format: { unit: '€', decimals: 0 }, refresh: 'daily', confidence: 0.9,
      assumptions: ['Revenue is gross, VAT included', 'Days with no order are shown as a gap, not as zero'],
      dataKey: 'revenue_daily_7d',
    },
  },
  {
    id: 'wgt_06', dashboardId: 'dsh_1', size: 'half', updatedAt: '2026-09-16T06:10:00', refreshStatus: 'stale',
    lastSuccessAt: '2026-09-16T06:10:00', failureReason: 'Daily refresh job failed — ticketing connector timed out',
    spec: {
      id: 'wgt_06', type: 'topn', title: 'Top 10 cities by contacts',
      measure: { id: 'contacts_count', agg: 'count' },
      dimension: { id: 'city', limit: 10, sort: 'desc', other_bucket: true },
      time: { field: 'contact_created_at', range: 'all_time', relative: false },
      filters: [], cohort: null, format: { unit: 'contacts', decimals: 0 }, refresh: 'daily', confidence: 0.82,
      assumptions: ['204 distinct cities — switched to top 10 + "Other" automatically'],
      dataKey: 'contacts_by_city_top10',
    },
  },
  {
    id: 'wgt_07', dashboardId: 'dsh_2', size: 'half', updatedAt: '2026-09-18T06:10:00', refreshStatus: 'ok',
    spec: {
      id: 'wgt_07', type: 'funnel', title: 'Campaign funnel — Ouverture billetterie',
      measure: { id: 'emails_sent', agg: 'sum' }, dimension: null,
      stages: ['Sent', 'Opened', 'Clicked', 'In cart', 'Purchased'],
      time: { field: 'sent_at', range: '30d', relative: true },
      filters: [{ field: 'campaign_id', op: 'eq', value: 'cmp_01' }],
      cohort: null, format: { unit: 'contacts', decimals: 0 }, refresh: 'daily', confidence: 0.88,
      assumptions: ['Purchase attributed within 7 days of the click'],
      dataKey: 'campaign_funnel',
    },
  },
  {
    id: 'wgt_08', dashboardId: 'dsh_2', size: 'half', updatedAt: '2026-09-18T06:10:00', refreshStatus: 'ok',
    spec: {
      id: 'wgt_08', type: 'overlap', title: 'What SRFC–PSG buyers also bought',
      measure: { id: 'contacts_count', agg: 'count' },
      dimension: { id: 'event', limit: 5, sort: 'desc', other_bucket: false },
      cohort: { id: 'buyers_evt_442', label: 'Buyers of SRFC–PSG', size: 18204 },
      time: { field: 'order_date', range: 'all_time', relative: false },
      filters: [], format: { unit: 'contacts', decimals: 0 }, refresh: 'daily', confidence: 0.79,
      assumptions: ['Base cohort = 18 204 buyers of SRFC–PSG', 'Percentages are of the base cohort'],
      dataKey: 'overlap_psg_buyers',
    },
  },
  {
    id: 'wgt_09', dashboardId: 'dsh_2', size: 'half', updatedAt: '2026-09-18T06:10:00', refreshStatus: 'ok',
    spec: {
      id: 'wgt_09', type: 'segment_compare', title: 'Revenue by customer segment',
      measure: { id: 'gross_revenue', agg: 'sum' }, dimension: null,
      segments: ['Season-ticket holders', 'Repeat buyers', 'First-time buyers', 'Lapsed 12m reactivated'],
      time: { field: 'order_date', range: 'season', relative: true },
      filters: [], cohort: null, format: { unit: '€', decimals: 0 }, refresh: 'daily', confidence: 0.84,
      assumptions: ['Segments are business definitions, not a data field'],
      dataKey: 'segment_revenue',
    },
  },
  {
    id: 'wgt_10', dashboardId: 'dsh_2', size: 'half', updatedAt: '2026-09-18T06:10:00', refreshStatus: 'ok',
    spec: {
      id: 'wgt_10', type: 'histogram', title: 'Events attended per contact',
      measure: { id: 'contacts_count', agg: 'count' },
      dimension: { id: 'events_attended', buckets: 6 },
      time: { field: 'order_date', range: 'all_time', relative: false },
      filters: [], cohort: null, format: { unit: 'contacts', decimals: 0 }, refresh: 'daily', confidence: 0.87,
      assumptions: ['Last bucket groups 6 events and above'],
      dataKey: 'events_per_contact',
    },
  },
  {
    // Zero-row card — evt_448 has sold nothing yet. Saving it was allowed anyway.
    id: 'wgt_11', dashboardId: 'dsh_2', size: 'third', updatedAt: '2026-09-18T06:10:00', refreshStatus: 'ok',
    spec: {
      id: 'wgt_11', type: 'category_bar', title: 'Tickets by stand — Rencontre Abonnés',
      measure: { id: 'tickets_sold', agg: 'count' },
      dimension: { id: 'tribune', limit: 10, sort: 'desc', other_bucket: true },
      time: { field: 'order_date', range: 'event_lifetime', relative: true },
      filters: [{ field: 'event_id', op: 'eq', value: 'evt_448' }],
      cohort: null, format: { unit: 'tickets', decimals: 0 }, refresh: 'daily', confidence: 0.86,
      assumptions: ['Tickets = order lines with status "confirmed"'],
      dataKey: 'empty_evt_448',
    },
  },
  {
    // text_card — the non-metric escape hatch.
    id: 'wgt_12', dashboardId: 'dsh_2', size: 'third', updatedAt: '2026-09-17T09:42:00', refreshStatus: 'ok',
    spec: {
      id: 'wgt_12', type: 'text_card', title: 'Q4 roadmap note',
      measure: null, dimension: null, time: null, filters: [], cohort: null,
      body: 'Migrate the loyalty programme to the new tiers before the Lens fixture. '
          + 'Blocking item: the ticketing connector still sends the old tier codes.',
      format: null, refresh: 'daily', confidence: 1, assumptions: [],
    },
  },
];

/* ── Dashboards (3) ─────────────────────────────────────────────────────────── */

export const DASHBOARDS = [
  {
    id: 'dsh_1', name: 'Match-day performance',
    globalFilters: { period: '30d', eventId: 'evt_442' },
    cardOrder: ['wgt_01', 'wgt_02', 'wgt_03', 'wgt_04', 'wgt_05', 'wgt_06'],
  },
  {
    id: 'dsh_2', name: 'Audience & campaigns',
    globalFilters: { period: '90d', eventId: 'all' },
    cardOrder: ['wgt_07', 'wgt_08', 'wgt_09', 'wgt_10', 'wgt_11', 'wgt_12'],
  },
  {
    // Empty dashboard — story 5's empty state.
    id: 'dsh_3', name: 'Season ticket renewals',
    globalFilters: { period: '30d', eventId: 'all' },
    cardOrder: [],
  },
];

/* Widgets that also live on another dashboard — deleting one of these gets the
   reinforced confirmation (story 6). */
export const SHARED_WIDGETS = ['wgt_04', 'wgt_01'];

/* A field this widget depends on was pulled from the semantic layer. Opening it in
   the builder must degrade gracefully and propose a replacement (story 6, error). */
export const DEGRADED_WIDGET = {
  widgetId: 'wgt_09',
  missingField: { kind: 'measure', id: 'gross_revenue_incl_hospitality', label: 'Gross revenue incl. hospitality' },
  replacement: { kind: 'measure', id: 'gross_revenue', label: 'Gross revenue' },
};

/* Cards whose filters the global bar cannot override (incompatible dimension). */
export const GLOBAL_FILTER_INCOMPATIBLE = {
  // These widgets don't carry an event dimension, so an event filter can't apply.
  eventId: ['wgt_06', 'wgt_09', 'wgt_10', 'wgt_12'],
};

/* ── Scripted agent ─────────────────────────────────────────────────────────── */
/*
 * Each entry: keywords that trigger it, and the turn the agent plays.
 * kind:
 *   'widget'      → renders a WidgetSpec in the canvas
 *   'clarify'     → 2–3 interpretations as buttons, NOTHING rendered
 *   'field_miss'  → nearest semantic-layer fields as buttons, nothing rendered
 *   'refuse'      → out-of-catalogue request, offers a text_card instead
 *   'patch'       → patches the spec already in the canvas
 *   'incompatible'→ explains, offers the matching type change
 */
export const AGENT_SCRIPT = [
  {
    id: 'ambiguous_best_customers',
    keywords: ['best customer', 'best client', 'top customer', 'best buyers', 'meilleurs clients'],
    kind: 'clarify',
    message: '"Best customers" can mean three different things here, and they give different lists. Which one do you mean?',
    options: [
      { label: 'Highest lifetime spend', detail: 'Sum of gross revenue per contact, all time', resolves: 'seg_revenue' },
      { label: 'Most events attended', detail: 'Distinct events per contact', resolves: 'histogram' },
      { label: 'Most recent big spenders', detail: 'Gross revenue over the last 90 days', resolves: 'seg_revenue' },
    ],
  },
  {
    id: 'unknown_field_budget',
    keywords: ['budget', 'margin', 'profit', 'cost per acquisition', 'roi'],
    kind: 'field_miss',
    message: 'There is no "budget" field in the semantic layer, and I will not invent one. The closest published measures are below — pick one and I will build the report.',
    options: [
      { label: 'Gross revenue', detail: 'sum · € · Ticketing', resolves: 'kpi_revenue' },
      { label: 'Net revenue', detail: 'sum · € · Ticketing', resolves: 'kpi_revenue' },
      { label: 'Refunded amount', detail: 'sum · € · Ticketing', resolves: 'kpi_revenue' },
    ],
  },
  {
    id: 'non_metric',
    keywords: ['note', 'remind', 'roadmap', 'write down', 'memo', 'todo', 'to-do'],
    kind: 'refuse',
    message: 'That is not a measurable request, so I will not draw a chart for it — a chart would imply data that does not exist. I can store it as a text card on the dashboard instead.',
    resolves: 'text_card',
  },
  {
    id: 'by_city',
    keywords: ['by city', 'per city', 'cities', 'city'],
    kind: 'widget',
    // The cardinality guard fires here and is announced in the message.
    message: 'City has 204 distinct values — far past the 30-value threshold, so a full bar chart would be unreadable. I switched to a top 10 with an "Other" bucket. Say "top 15" if you want a longer list.',
    resolves: 'topn_city',
  },
  {
    id: 'by_tribune',
    keywords: ['tribune', 'stand', 'by stand', 'seating'],
    kind: 'widget',
    message: 'Here are tickets sold by stand for SRFC–PSG. I read "tickets" as order lines with status "confirmed" — cancelled lines are excluded. Change that below if it is wrong.',
    resolves: 'category_bar_tribune',
  },
  {
    id: 'revenue_over_time',
    keywords: ['revenue over time', 'daily revenue', 'last 7 days', 'over time', 'per day', 'trend'],
    kind: 'widget',
    message: 'Daily gross revenue over a rolling 7-day window. Two days have no orders at all — I show them as a gap rather than as zero, so the line is not misread.',
    resolves: 'timeseries_revenue',
  },
  {
    id: 'funnel',
    keywords: ['funnel', 'conversion path', 'journey', 'steps'],
    kind: 'widget',
    message: 'Campaign funnel for "Ouverture billetterie SRFC–PSG". The last step is 0 — no attributed purchase within the 7-day window. That is a real zero, not missing data.',
    resolves: 'funnel_campaign',
  },
  {
    id: 'countdown',
    keywords: ['countdown', 'days until', 'days to', 'how long until'],
    kind: 'widget',
    message: 'A countdown to the SRFC–PSG kick-off. It has no measure — it decrements against the event date every day.',
    resolves: 'countdown',
  },
  {
    id: 'fill_rate',
    keywords: ['fill rate', 'occupancy', 'percentage full', 'capacity', 'gauge'],
    kind: 'widget',
    message: 'Fill rate as a gauge — tickets sold over declared capacity. Capacity includes the visitor stand; tell me if you want it excluded.',
    resolves: 'ratio_gauge',
  },
  {
    id: 'segments',
    keywords: ['segment', 'compare segment', 'customer type', 'by segment'],
    kind: 'widget',
    message: 'Revenue across the four business segments. These are definitions we hold, not a column in the data — so changing them changes the numbers.',
    resolves: 'segment_compare',
  },
  {
    id: 'histogram',
    keywords: ['how many events', 'distribution', 'per contact', 'frequency', 'histogram'],
    kind: 'widget',
    message: 'Distribution of contacts by number of events attended. The last bucket groups 6 and above.',
    resolves: 'histogram',
  },
  {
    id: 'overlap',
    keywords: ['also bought', 'also attended', 'overlap', 'cross-sell', 'cross sell'],
    kind: 'widget',
    message: 'Overlap on the 18 204 buyers of SRFC–PSG. Percentages are shares of that base cohort, not of all contacts.',
    resolves: 'overlap',
  },
  {
    id: 'total_tickets',
    keywords: ['how many tickets', 'total tickets', 'tickets sold'],
    kind: 'widget',
    message: 'Total confirmed tickets for SRFC–PSG, compared with the previous period.',
    resolves: 'kpi_tickets',
  },
  {
    id: 'total_revenue',
    keywords: ['total revenue', 'how much revenue', 'turnover', 'sales total'],
    kind: 'widget',
    message: 'Total gross revenue, VAT included, compared with the previous period.',
    resolves: 'kpi_revenue',
  },
  {
    id: 'empty_event',
    keywords: ['rencontre abonn', 'evt_448', 'zero sales', 'no sales'],
    kind: 'widget',
    message: 'That event has not sold anything yet, so the report comes back with no rows. The widget is still valid and you can save it — it will fill in once sales open.',
    resolves: 'empty_widget',
  },
  /* ── Refinements: these PATCH the spec in the canvas, never regenerate it ── */
  {
    id: 'patch_top10',
    keywords: ['top 10', 'top ten'], kind: 'patch',
    patch: { dimension: { limit: 10 } },
    message: 'Limit set to 10. Everything else in the spec is untouched.',
  },
  {
    id: 'patch_top15',
    keywords: ['top 15', 'top fifteen'], kind: 'patch',
    patch: { dimension: { limit: 15 } },
    message: 'Limit set to 15 — the cap for this catalogue. Everything else is untouched.',
  },
  {
    id: 'patch_top5',
    keywords: ['top 5', 'top five'], kind: 'patch',
    patch: { dimension: { limit: 5 } },
    message: 'Limit set to 5.',
  },
  {
    id: 'patch_sort_desc',
    keywords: ['sort descending', 'descending', 'highest first', 'sort desc'], kind: 'patch',
    patch: { dimension: { sort: 'desc' } },
    message: 'Sorted descending.',
  },
  {
    id: 'patch_sort_asc',
    keywords: ['sort ascending', 'ascending', 'lowest first', 'sort asc'], kind: 'patch',
    patch: { dimension: { sort: 'asc' } },
    message: 'Sorted ascending.',
  },
  {
    id: 'patch_compare',
    keywords: ['compare to previous', 'previous period', 'vs last', 'versus last'], kind: 'patch',
    patch: { comparison: 'previous_period' },
    message: 'Added a comparison against the previous period of the same length.',
  },
  {
    id: 'patch_other_off',
    keywords: ['remove other', 'hide other', 'no other bucket'], kind: 'patch',
    patch: { dimension: { other_bucket: false } },
    message: '"Other" bucket removed. The chart now shows only the listed values, so the total no longer adds up to the full population.',
  },
  /* ── Out-of-catalogue type requests ── */
  {
    id: 'incompatible_type',
    keywords: ['pie chart', 'pie', 'donut chart', 'map', 'heatmap', 'scatter', 'treemap', 'word cloud'],
    kind: 'incompatible',
    message: 'That chart type is not in the catalogue, so I cannot build it — the catalogue is closed on purpose, so every saved report re-runs identically. For one measure split by one dimension, the nearest supported types are below.',
    options: [
      { label: 'Switch to a bar chart', detail: 'category_bar — one bar per dimension value', resolves: 'category_bar_tribune' },
      { label: 'Switch to a top-N', detail: 'topn — sorted, capped at 5 / 10 / 15', resolves: 'topn_city' },
      { label: 'Switch to a gauge', detail: 'ratio_gauge — a single percentage', resolves: 'ratio_gauge' },
    ],
  },
];

/* Specs the script resolves to. Keyed by the `resolves` value above. */
export const RESOLVED_SPECS = {
  category_bar_tribune: {
    id: 'wgt_new', type: 'category_bar', title: 'Tickets sold by stand',
    measure: { id: 'tickets_sold', agg: 'count' },
    dimension: { id: 'tribune', limit: 10, sort: 'desc', other_bucket: true },
    time: { field: 'order_date', range: 'event_lifetime', relative: true },
    filters: [{ field: 'event_id', op: 'eq', value: 'evt_442' }],
    cohort: null, format: { unit: 'tickets', decimals: 0 }, refresh: 'daily', confidence: 0.86,
    assumptions: ['Tickets = order lines with status "confirmed"', 'Scope = SRFC–PSG, the event you last looked at'],
    dataKey: 'tickets_by_tribune',
  },
  topn_city: {
    id: 'wgt_new', type: 'topn', title: 'Top 10 cities by contacts',
    measure: { id: 'contacts_count', agg: 'count' },
    dimension: { id: 'city', limit: 10, sort: 'desc', other_bucket: true },
    time: { field: 'contact_created_at', range: 'all_time', relative: false },
    filters: [], cohort: null, format: { unit: 'contacts', decimals: 0 }, refresh: 'daily', confidence: 0.82,
    assumptions: ['204 distinct cities — auto-switched to top 10 + "Other"', 'Contacts counted once, at their current city'],
    dataKey: 'contacts_by_city_top10',
  },
  timeseries_revenue: {
    id: 'wgt_new', type: 'timeseries', title: 'Daily revenue — last 7 days',
    measure: { id: 'gross_revenue', agg: 'sum' },
    dimension: { id: 'order_date', grain: 'day' },
    time: { field: 'order_date', range: '7d', relative: true },
    filters: [], cohort: null, format: { unit: '€', decimals: 0 }, refresh: 'daily', confidence: 0.9,
    assumptions: ['Revenue is gross, VAT included', 'Days with no order render as a gap, not as zero'],
    dataKey: 'revenue_daily_7d',
  },
  funnel_campaign: {
    id: 'wgt_new', type: 'funnel', title: 'Campaign funnel — Ouverture billetterie',
    measure: { id: 'emails_sent', agg: 'sum' }, dimension: null,
    stages: ['Sent', 'Opened', 'Clicked', 'In cart', 'Purchased'],
    time: { field: 'sent_at', range: '30d', relative: true },
    filters: [{ field: 'campaign_id', op: 'eq', value: 'cmp_01' }],
    cohort: null, format: { unit: 'contacts', decimals: 0 }, refresh: 'daily', confidence: 0.88,
    assumptions: ['Purchase attributed within 7 days of the click'],
    dataKey: 'campaign_funnel',
  },
  countdown: {
    id: 'wgt_new', type: 'countdown', title: 'Days to kick-off',
    measure: null, dimension: null, targetDate: '2026-10-04', time: null,
    filters: [{ field: 'event_id', op: 'eq', value: 'evt_442' }],
    cohort: null, format: { unit: 'days', decimals: 0 }, refresh: 'daily', confidence: 1,
    assumptions: ['Counts to the kick-off date, not to the gates opening'],
    dataKey: 'countdown_442',
  },
  ratio_gauge: {
    id: 'wgt_new', type: 'ratio_gauge', title: 'Fill rate — SRFC–PSG',
    measure: { id: 'fill_rate', agg: 'ratio' }, dimension: null,
    numerator: 'tickets_sold', denominator: 'capacity',
    time: { field: 'order_date', range: 'event_lifetime', relative: true },
    filters: [{ field: 'event_id', op: 'eq', value: 'evt_442' }],
    cohort: null, format: { unit: '%', decimals: 1 }, refresh: 'daily', confidence: 0.91,
    assumptions: ['Capacity = declared stadium capacity, visitor stand included'],
    dataKey: 'fill_rate_442',
  },
  segment_compare: {
    id: 'wgt_new', type: 'segment_compare', title: 'Revenue by customer segment',
    measure: { id: 'gross_revenue', agg: 'sum' }, dimension: null,
    segments: ['Season-ticket holders', 'Repeat buyers', 'First-time buyers', 'Lapsed 12m reactivated'],
    time: { field: 'order_date', range: 'season', relative: true },
    filters: [], cohort: null, format: { unit: '€', decimals: 0 }, refresh: 'daily', confidence: 0.84,
    assumptions: ['Segments are business definitions, not a data field'],
    dataKey: 'segment_revenue',
  },
  seg_revenue: {
    id: 'wgt_new', type: 'segment_compare', title: 'Revenue by customer segment',
    measure: { id: 'gross_revenue', agg: 'sum' }, dimension: null,
    segments: ['Season-ticket holders', 'Repeat buyers', 'First-time buyers', 'Lapsed 12m reactivated'],
    time: { field: 'order_date', range: 'all_time', relative: false },
    filters: [], cohort: null, format: { unit: '€', decimals: 0 }, refresh: 'daily', confidence: 0.88,
    assumptions: ['"Best" resolved as highest lifetime gross revenue', 'Segments are business definitions, not a data field'],
    dataKey: 'segment_revenue',
  },
  histogram: {
    id: 'wgt_new', type: 'histogram', title: 'Events attended per contact',
    measure: { id: 'contacts_count', agg: 'count' },
    dimension: { id: 'events_attended', buckets: 6 },
    time: { field: 'order_date', range: 'all_time', relative: false },
    filters: [], cohort: null, format: { unit: 'contacts', decimals: 0 }, refresh: 'daily', confidence: 0.87,
    assumptions: ['Last bucket groups 6 events and above'],
    dataKey: 'events_per_contact',
  },
  overlap: {
    id: 'wgt_new', type: 'overlap', title: 'What SRFC–PSG buyers also bought',
    measure: { id: 'contacts_count', agg: 'count' },
    dimension: { id: 'event', limit: 5, sort: 'desc', other_bucket: false },
    cohort: { id: 'buyers_evt_442', label: 'Buyers of SRFC–PSG', size: 18204 },
    time: { field: 'order_date', range: 'all_time', relative: false },
    filters: [], format: { unit: 'contacts', decimals: 0 }, refresh: 'daily', confidence: 0.79,
    assumptions: ['Base cohort = 18 204 buyers of SRFC–PSG', 'Percentages are of the base cohort'],
    dataKey: 'overlap_psg_buyers',
  },
  kpi_tickets: {
    id: 'wgt_new', type: 'kpi', title: 'Tickets sold — SRFC–PSG',
    measure: { id: 'tickets_sold', agg: 'count' }, dimension: null,
    time: { field: 'order_date', range: 'event_lifetime', relative: true },
    filters: [{ field: 'event_id', op: 'eq', value: 'evt_442' }],
    cohort: null, comparison: 'previous_period',
    format: { unit: 'tickets', decimals: 0 }, refresh: 'daily', confidence: 0.94,
    assumptions: ['Tickets = order lines with status "confirmed"'],
    dataKey: 'tickets_total',
  },
  kpi_revenue: {
    id: 'wgt_new', type: 'kpi', title: 'Gross revenue', measure: { id: 'gross_revenue', agg: 'sum' },
    dimension: null, time: { field: 'order_date', range: 'season', relative: true },
    filters: [], cohort: null, comparison: 'previous_period',
    format: { unit: '€', decimals: 0 }, refresh: 'daily', confidence: 0.93,
    assumptions: ['Revenue is gross, VAT included'],
    dataKey: 'revenue_total',
  },
  text_card: {
    id: 'wgt_new', type: 'text_card', title: 'Note',
    measure: null, dimension: null, time: null, filters: [], cohort: null,
    body: 'Type your note here. Text cards hold context that has no metric behind it — '
        + 'a roadmap item, a caveat on a number, a link to a document.',
    format: null, refresh: 'daily', confidence: 1, assumptions: [],
  },
  empty_widget: {
    id: 'wgt_new', type: 'category_bar', title: 'Tickets by stand — Rencontre Abonnés',
    measure: { id: 'tickets_sold', agg: 'count' },
    dimension: { id: 'tribune', limit: 10, sort: 'desc', other_bucket: true },
    time: { field: 'order_date', range: 'event_lifetime', relative: true },
    filters: [{ field: 'event_id', op: 'eq', value: 'evt_448' }],
    cohort: null, format: { unit: 'tickets', decimals: 0 }, refresh: 'daily', confidence: 0.86,
    assumptions: ['Tickets = order lines with status "confirmed"'],
    dataKey: 'empty_evt_448',
  },
};

/* Suggestion chips offered after a render, by widget type. */
export const SUGGESTIONS = {
  category_bar: ['Top 5 only', 'Sort ascending', 'Remove the "Other" bucket', 'Compare to previous period'],
  topn:         ['Top 15 instead', 'Top 5 only', 'Remove the "Other" bucket'],
  timeseries:   ['Compare to previous period', 'Show as a pie chart', 'Sort descending'],
  kpi:          ['Compare to previous period', 'Break it down by stand', 'Show as a gauge'],
  funnel:       ['Compare to previous period', 'Show as a bar chart'],
  ratio_gauge:  ['Break it down by stand', 'Compare to previous period'],
  overlap:      ['Top 5 only', 'Sort descending'],
  segment_compare: ['Sort descending', 'Compare to previous period'],
  histogram:    ['Sort descending', 'Show as a bar chart'],
  countdown:    ['Show tickets sold instead'],
  text_card:    [],
};

/* Starter questions on the empty canvas. */
export const STARTER_QUESTIONS = [
  'How many tickets did we sell by stand?',
  'Show me daily revenue over the last 7 days',
  'Who are my best customers?',
];

/* ── Helpers ────────────────────────────────────────────────────────────────── */

export const fmtNumber = (n) =>
  n == null ? '—' : new Intl.NumberFormat('en-GB').format(Math.round(n));

export function fmtValue(n, unit) {
  if (n == null) return '—';
  if (unit === '€') {
    return n >= 1000000
      ? `€${(n / 1000000).toFixed(2)}M`
      : n >= 10000 ? `€${(n / 1000).toFixed(0)}k` : `€${fmtNumber(n)}`;
  }
  if (unit === '%') return `${n.toFixed(1)}%`;
  return fmtNumber(n);
}

/** "Updated 4h ago" / "Updated 2d ago" — relative to the prototype's fixed now. */
export const NOW = new Date('2026-09-18T10:30:00');

export function freshness(iso) {
  const then = new Date(iso);
  const hours = Math.floor((NOW - then) / 3600000);
  if (hours < 1) return 'Updated just now';
  if (hours < 24) return `Updated ${hours}h ago`;
  return `Updated ${Math.floor(hours / 24)}d ago`;
}

export function daysUntil(iso) {
  const target = new Date(iso);
  return Math.ceil((target - NOW) / 86400000);
}

/** Match a free-typed question against the script. Loose keyword containment. */
export function matchScript(text) {
  const q = text.toLowerCase().trim();
  if (!q) return null;
  // Longest keyword wins, so "top 15" beats "top 1" style partials.
  let best = null; let bestLen = 0;
  for (const entry of AGENT_SCRIPT) {
    for (const k of entry.keywords) {
      if (q.includes(k) && k.length > bestLen) { best = entry; bestLen = k.length; }
    }
  }
  return best;
}

/** Deep-ish patch: merges one level into `dimension`, replaces scalars. */
export function applyPatch(spec, patch) {
  const next = { ...spec };
  for (const [k, v] of Object.entries(patch)) {
    next[k] = v && typeof v === 'object' && !Array.isArray(v)
      ? { ...(spec[k] || {}), ...v }
      : v;
  }
  return next;
}

export const measureById = (id) => MEASURES.find((m) => m.id === id);
export const dimensionById = (id) => DIMENSIONS.find((d) => d.id === id);
export const eventById = (id) => EVENTS.find((e) => e.id === id);
export const widgetById = (id) => SAVED_WIDGETS.find((w) => w.id === id);
