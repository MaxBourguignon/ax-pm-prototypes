/**
 * The three batches agreed with Maxence on 21 October 2026, as a feature list.
 *
 * The page shows the product as it stands after the chosen batch: a card,
 * a format or a control appears only when the feature it needs is in that
 * batch or an earlier one. The checklist panel lists the same features so
 * they can be ticked off.
 */

export const BATCHES = [
  { value: 1, label: 'Batch 1', sub: 'Profile cards on the segmentation engine' },
  { value: 2, label: 'Batch 2', sub: 'Transactions, more formats, manual entry' },
  { value: 3, label: 'Batch 3', sub: 'AI, drag-and-drop, card to segment' },
];

export const FEATURES = [
  { batch: 1, id: 'page', label: 'Insights page with tabs and a card grid' },
  { batch: 1, id: 'segLogic', label: 'Count profiles from one source, with that source\'s fields as conditions; a card instead of a list' },
  { batch: 1, id: 'number', label: 'Format: number with variation against the previous count' },
  { batch: 1, id: 'breakdown', label: 'Format: breakdown, top 5 plus "Other"' },
  { batch: 1, id: 'share', label: 'Format: share of all (same source, without the conditions), with a % bar (third format, to decide)' },
  { batch: 1, id: 'definition', label: 'The definition behind every card' },
  { batch: 1, id: 'refresh', label: 'Cards run on the data in our warehouse; no refresh time on the card (it depends on the import from the client)' },
  { batch: 2, id: 'tx', label: 'Count transactions or sum revenue, per source (tickets, subscriptions, orders, webshop)' },
  { batch: 2, id: 'perDay', label: 'Format: series per day (bar chart)' },
  { batch: 2, id: 'target', label: 'Format: progress bar towards a target the client sets' },
  { batch: 2, id: 'countdown', label: 'Source Events: countdown, days until an event' },
  { batch: 2, id: 'manualData', label: 'Manual entry, data: own values, added up, multiplied or divided' },
  { batch: 2, id: 'manualText', label: 'Manual entry, content: a card with plain text (to confirm)' },
  { batch: 3, id: 'ai', label: 'AI builder: describe a card in a sentence' },
  { batch: 3, id: 'dnd', label: 'Drag-and-drop: arrange cards on the page' },
  { batch: 3, id: 'compareChoice', label: 'Compare per card: choose nothing, the previous count, or the same day last year' },
  { batch: 3, id: 'segment', label: 'Card to segment: open a profile card in the segmentation engine' },
];

/** True when feature `id` is available in the product after `batch`. */
export const has = (batch, id) => (FEATURES.find((f) => f.id === id)?.batch ?? 1) <= batch;

/** The batch a feature lands in. */
export const batchOf = (id) => FEATURES.find((f) => f.id === id)?.batch ?? 1;
