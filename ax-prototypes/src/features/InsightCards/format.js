/** Number and series helpers shared by the card and the builder preview. */
import { SERIES } from './mockData';

export const fmt = (n, measure) => {
  const s = Math.round(n).toLocaleString('en-US');
  return measure === 'revenue' ? `€ ${s}` : s;
};

/* Per day up to 31 days, per week beyond (L3 decision 9). */
export const seriesFor = (period) => {
  if (period === 'season') return { unit: 'week', data: SERIES.weeks.map((v, i) => ({ x: `W${i + 1}`, v })) };
  const days = period === 'week' ? SERIES.days.slice(-7) : SERIES.days;
  return { unit: 'day', data: days.map((v, i) => ({ x: String(i + 1), v })) };
};
