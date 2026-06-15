/**
 * AX Prototypes — Pagination
 * Prev / page-indicator / next control. Renders nothing when there's ≤1 page.
 *
 *   <Pagination page={page} pages={pages} setPage={setPage} />
 *   <Pagination page={p} pages={n} setPage={setP} prevLabel="Précédent" nextLabel="Suivant" />
 *
 * Props: page (0-based), pages (total), setPage, prevLabel, nextLabel,
 *        label (page, pages) => string.
 */
import React from 'react';
import { DS, TY } from '../utils/designSystem';
import Ico from '../utils/icons';
import Btn from './Btn';

export function Pagination({ page, pages, setPage, prevLabel = 'Previous', nextLabel = 'Next',
                            label = (p, n) => `Page ${p + 1} / ${n}` }) {
  if (pages <= 1) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, padding: '12px 16px' }}>
      <Btn type="Secondary" size="Small" disabled={page === 0} onClick={() => setPage(page - 1)}
           iconLeft={<Ico.ChevL s={14} />}>{prevLabel}</Btn>
      <span style={{ ...TY.b2, color: DS.textDefault, fontFamily: DS.ff }}>{label(page, pages)}</span>
      <Btn type="Secondary" size="Small" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}
           iconRight={<Ico.ChevRight s={14} />}>{nextLabel}</Btn>
    </div>
  );
}

export default Pagination;
