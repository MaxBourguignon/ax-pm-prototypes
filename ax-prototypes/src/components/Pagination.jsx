/**
 * AX Prototypes — Pagination
 * Numbered pager (matches the Contacts page): an optional "X–Y of Z" count on the
 * left and a windowed [‹][1][2]…[n][›] button row on the right. Reused everywhere.
 *
 *   <Pagination page={page} pages={pages} setPage={setPage} />                    // buttons only
 *   <Pagination page={page} pages={pages} setPage={setPage} total={n} pageSize={PER} />  // + count text
 *
 * Props:
 *   page      number   0-based current page
 *   pages     number   total page count
 *   setPage   (p) => void   receives the 0-based target page
 *   total     number|null   total item count — enables the "X–Y of Z" text
 *   pageSize  number|null   items per page — required for the count text
 *
 * Renders nothing when there is ≤1 page AND no count to show.
 */
import React from 'react';
import { DS } from '../utils/designSystem';
import Ico from '../utils/icons';

function PagBtn({ children, onClick, disabled, active }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        width: 30, height: 30, borderRadius: 4,
        border: `1px solid ${active ? DS.actionPrimary : DS.neutral200}`,
        background: active ? DS.actionPrimary : hovered ? DS.neutral100 : DS.white,
        color: active ? DS.white : DS.neutral900,
        fontSize: 12, fontWeight: active ? 600 : 400, fontFamily: DS.ff,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: disabled ? 0.4 : 1, transition: 'all .15s',
      }}>
      {children}
    </button>
  );
}

export function Pagination({ page, pages, setPage, total = null, pageSize = null }) {
  if (pages <= 1 && total == null) return null;

  // Windowed range (max 5), computed on 1-based page numbers like the Contacts page.
  const cur = page + 1;
  const span = Math.min(5, pages);
  const start = pages <= 5 ? 1 : cur <= 3 ? 1 : cur >= pages - 2 ? pages - 4 : cur - 2;
  const nums = Array.from({ length: span }, (_, i) => start + i);

  const hasCount = total != null;
  const countText = total === 0
    ? 'No results'
    : `${page * pageSize + 1}–${Math.min((page + 1) * pageSize, total)} of ${total}`;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: hasCount ? 'space-between' : 'flex-end', padding: '10px 16px' }}>
      {hasCount && (
        <span style={{ fontSize: 12, color: DS.neutral500, fontFamily: DS.ff }}>{countText}</span>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <PagBtn onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>
          <Ico.ChevL s={13} c={DS.neutral900} />
        </PagBtn>
        {nums.map((n) => (
          <PagBtn key={n} active={n === cur} onClick={() => setPage(n - 1)}>{n}</PagBtn>
        ))}
        <PagBtn onClick={() => setPage(Math.min(pages - 1, page + 1))} disabled={page >= pages - 1}>
          <Ico.ChevRight s={13} c={DS.neutral900} />
        </PagBtn>
      </div>
    </div>
  );
}

export default Pagination;
