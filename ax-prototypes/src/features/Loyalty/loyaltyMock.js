export const LOYALTY_PROGRAM = {
  id: 'prog-001',
  name: 'Fidélité RCSC 2025–2026',
  status: 'active',
  eligible_segment: 'seg-saison',
  start_date: '2025-08-15',
  expiration_months: null,
};

export const SEGMENTS = [
  { value: 'seg-saison',     label: 'Supporters Saison 2025-2026' },
  { value: 'seg-all',        label: 'Tous les contacts' },
  { value: 'seg-premium',    label: 'Abonnés Premium' },
  { value: 'seg-newsletter', label: 'Abonnés Newsletter' },
];

export const LOYALTY_TIERS = [
  { id: 't1', name: 'Bronze', min: 0,    max: 499,  color: '#CD7F32' },
  { id: 't2', name: 'Silver', min: 500,  max: 1499, color: '#A8A9AD' },
  { id: 't3', name: 'Gold',   min: 1500, max: 2999, color: '#FFD700' },
  { id: 't4', name: 'Legend', min: 3000, max: null,  color: '#C41E3A' },
];

export const LOYALTY_RULES = [
  { id: 'r1', action: 'TICKET_PURCHASED',   label: 'Billet acheté',         pts: 10,  active: true,  description: 'Attribué pour chaque billet acheté' },
  { id: 'r2', action: 'MATCH_ATTENDED',     label: 'Match assisté',          pts: 20,  active: true,  description: 'Attribué pour chaque présence confirmée en match' },
  { id: 'r3', action: 'EMAIL_CLICK',        label: 'Clic email campagne',    pts: 2,   active: false, description: 'Attribué pour chaque clic dans une campagne email' },
  { id: 'r4', action: 'SEASON_SUBSCRIPTION',label: 'Abonnement saison',      pts: 200, active: true,  description: 'Attribué pour un abonnement saison actif' },
];

export const SNAPSHOT_STATS = {
  fans_enrolled: 1842,
  pct_eligible:  73,
  points_awarded:     { '30d': 48200,  '90d': 142600, '12m': 387000, season: 412500 },
  manual_adjustments: { '30d': 12,     '90d': 34,     '12m': 89,     season: 94     },
};

export const TIER_DISTRIBUTION = [
  { tier: 'Bronze', count: 820, color: '#CD7F32' },
  { tier: 'Silver', count: 610, color: '#A8A9AD' },
  { tier: 'Gold',   count: 312, color: '#FFD700' },
  { tier: 'Legend', count: 100, color: '#C41E3A' },
];

export const TOP_ACTIONS = [
  { action: 'Match assisté',      events: 4821, points: 96420 },
  { action: 'Billet acheté',      events: 3210, points: 32100 },
  { action: 'Abonnement saison',  events: 203,  points: 40600 },
];
