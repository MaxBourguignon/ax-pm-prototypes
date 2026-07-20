/**
 * AX Prototypes — SortHeader / SortArrow
 * Shared sortable table-header cell and its sort arrow, so every table sorts
 * with the same control. Extracted from the Contacts table.
 *
 *   <SortHeader label="Name" active={sortKey === 'name'} dir={sortDir}
 *               onClick={() => onSort('name')} align="left" />
 *
 * SortHeader props:
 *   label    string
 *   active   boolean   is this the current sort column
 *   dir      'asc' | 'desc'
 *   onClick  () => void
 *   align    'left' | 'right'   default 'left'
 *
 * SortArrow props: dir ('asc' | 'desc'), s (size), c (color).
 */
import React from 'react';
import { DS } from '../utils/designSystem';

const HAIRLINE = '#EEF0F3';

export function SortArrow({ dir, s = 15, c = DS.navy }) {
  if (dir === 'asc') {
    return (
      <svg width={s} height={s} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M9.48598 3.20385C9.77477 2.93205 10.2252 2.93205 10.514 3.20385L14.764 7.20385C15.0657 7.48774 15.08 7.96239 14.7962 8.26402C14.5123 8.56565 14.0376 8.58004 13.736 8.29615L10.75 5.48582L10.75 16.25C10.75 16.6642 10.4142 17 10 17C9.58579 17 9.25 16.6642 9.25 16.25L9.25 5.48582L6.26403 8.29615C5.9624 8.58004 5.48774 8.56565 5.20385 8.26402C4.91996 7.96239 4.93435 7.48774 5.23598 7.20385L9.48598 3.20385Z" fill={c} />
      </svg>
    );
  }
  return (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M10 3C10.4142 3 10.75 3.33579 10.75 3.75V14.5142L13.736 11.7038C14.0376 11.42 14.5123 11.4343 14.7962 11.736C15.08 12.0376 15.0657 12.5123 14.764 12.7962L10.514 16.7962C10.2252 17.068 9.77477 17.068 9.48598 16.7962L5.23598 12.7962C4.93435 12.5123 4.91996 12.0376 5.20385 11.736C5.48774 11.4343 5.9624 11.42 6.26403 11.7038L9.25 14.5142V3.75C9.25 3.33579 9.58579 3 10 3Z" fill={c} />
    </svg>
  );
}

export function SortHeader({ label, active, dir, onClick, align = 'left' }) {
  return (
    <th onClick={onClick}
      style={{ padding: '0 16px', height: 44, borderBottom: `1px solid ${HAIRLINE}`, cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', textAlign: align }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#3E4E65', fontFamily: DS.ff }}>{label}</span>
        {active && <span style={{ display: 'flex' }}><SortArrow dir={dir} /></span>}
      </div>
    </th>
  );
}

export default SortHeader;
