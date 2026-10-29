// Bilingual mock values are { fr, en } objects — rendered through `tr()` from ./i18n.

export const LOYALTY_PROGRAM = {
  id: 'prog-001',
  name: 'RCSC Loyalty 2025–2026',
  status: 'active',
  eligible_segment: 'seg-saison',
  start_date: '2025-08-15',
  expiration_months: null,
};

export const SEGMENTS = [
  { value: 'seg-saison',     label: { fr: 'Supporters Saison 2025-2026', en: '2025-2026 Season supporters' } },
  { value: 'seg-all',        label: { fr: 'Tous les contacts',           en: 'All contacts' } },
  { value: 'seg-premium',    label: { fr: 'Abonnés Premium',             en: 'Premium subscribers' } },
  { value: 'seg-newsletter', label: { fr: 'Abonnés Newsletter',          en: 'Newsletter subscribers' } },
];

export const LOYALTY_TIERS = [
  { id: 't1', name: 'Bronze', min: 0,    max: 499,  color: '#CD7F32' },
  { id: 't2', name: 'Silver', min: 500,  max: 1499, color: '#A8A9AD' },
  { id: 't3', name: 'Gold',   min: 1500, max: 2999, color: '#FFD700' },
  { id: 't4', name: 'Legend', min: 3000, max: null,  color: '#C41E3A' },
];

// `config` holds what the action configuration modal edits. `pts` stays the
// value shown in the table for the Fixed mode.
export const LOYALTY_RULES = [
  { id: 'r1', action: 'TICKET_PURCHASED', pts: 10, active: true,
    label: { fr: 'Billet acheté', en: 'Ticket purchased' },
    description: { fr: 'Attribué pour chaque billet acheté', en: 'Awarded for each ticket purchased' },
    config: { category: 'ticketing', calc: { mode: 'fixed', pts: 10 } } },
  { id: 'r2', action: 'MATCH_ATTENDED', pts: 20, active: true,
    label: { fr: 'Match assisté', en: 'Match attended' },
    description: { fr: 'Attribué pour chaque présence confirmée en match', en: 'Awarded for each confirmed match attendance' },
    config: { category: 'attendance', calc: { mode: 'fixed', pts: 20 } } },
  { id: 'r3', action: 'EMAIL_CLICK', pts: 2, active: false,
    label: { fr: 'Clic email campagne', en: 'Campaign email click' },
    description: { fr: 'Attribué pour chaque clic dans une campagne email', en: 'Awarded for each click in an email campaign' },
    config: { category: 'email', calc: { mode: 'fixed', pts: 2 }, caps: { member: 10, per: 'day' } } },
  { id: 'r4', action: 'SEASON_SUBSCRIPTION', pts: 200, active: true,
    label: { fr: 'Abonnement saison', en: 'Season subscription' },
    description: { fr: 'Attribué pour un abonnement saison actif', en: 'Awarded for an active season subscription' },
    config: { category: 'subscription', calc: { mode: 'fixed', pts: 200 } } },
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
  { action: { fr: 'Match assisté',     en: 'Match attended' },      events: 4821, points: 96420 },
  { action: { fr: 'Billet acheté',     en: 'Ticket purchased' },    events: 3210, points: 32100 },
  { action: { fr: 'Abonnement saison', en: 'Season subscription' }, events: 203,  points: 40600 },
];

// ── Rewards (post-MVP exploration — out of the MVP spec scope) ───────────────
// distribution: 'email' | 'code' | 'manual' · minTier: tier id or null (all members)
export const REWARDS = [
  { id: 'rw1', status: 'active', cost: 500, minTier: null, distribution: 'code',
    name: { fr: '-15 % à la boutique', en: '15% off at the shop' },
    description: { fr: 'Code de réduction valable sur la boutique en ligne', en: 'Discount code valid on the online shop' },
    stock: null, perMember: 2, redeemed: 214, codeSource: 'shopify' },
  { id: 'rw2', status: 'active', cost: 1200, minTier: 't2', distribution: 'email',
    name: { fr: 'Place offerte — match au choix', en: 'Free seat — match of your choice' },
    description: { fr: 'Un billet tribune générale pour un match à domicile', en: 'One general stand ticket for a home match' },
    stock: 150, stockLeft: 38, perMember: 1, redeemed: 112 },
  { id: 'rw3', status: 'active', cost: 2500, minTier: 't3', distribution: 'manual',
    name: { fr: 'Maillot dédicacé', en: 'Signed jersey' },
    description: { fr: "Maillot officiel signé par l'équipe, remis au stade", en: 'Official jersey signed by the team, handed over at the stadium' },
    stock: 20, stockLeft: 4, perMember: 1, redeemed: 16 },
  { id: 'rw4', status: 'active', cost: 4000, minTier: 't4', distribution: 'manual',
    name: { fr: 'Accès bord terrain à l’échauffement', en: 'Pitch-side access at warm-up' },
    description: { fr: 'Deux personnes, sur un match à domicile choisi par le club', en: 'Two people, on a home match chosen by the club' },
    stock: 10, stockLeft: 7, perMember: 1, redeemed: 3 },
  { id: 'rw5', status: 'draft', cost: 300, minTier: null, distribution: 'code',
    name: { fr: 'Boisson offerte à la buvette', en: 'Free drink at the bar' },
    description: { fr: 'Code à présenter à la buvette du stade', en: 'Code to show at the stadium bar' },
    stock: 500, stockLeft: 500, perMember: null, redeemed: 0, codeSource: 'import' },
];

export const REWARD_STATS = { redeemed: 345, points_spent: 168400, points_awarded: 412500 };

