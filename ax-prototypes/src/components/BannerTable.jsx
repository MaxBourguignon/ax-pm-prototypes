/**
 * AX Prototypes — BannerTable
 * A list of entities rendered as free-standing "banner" rows aligned to a
 * shared CSS-grid, with a single table-style column header on top (instead of
 * per-row labels). One component for every prototype that lists entities this
 * way (Lists, Consents, …); each feature passes a `columns` config + a `cell`
 * renderer and keeps its own data mapping.
 *
 *   <BannerTable
 *     columns={[
 *       { key: 'name', label: 'Name', basis: 'minmax(200px, 2.4fr)' },
 *       { key: 'created', label: 'Created', basis: '120px' },
 *       { key: 'contacts', label: 'Contacts', basis: '110px', align: 'right' },
 *     ]}
 *     rows={data}
 *     rowId={(r) => r.id}
 *     sortKey={sortKey} sortDir={sortDir} onSort={onSort}   // omit for no sorting
 *     onRowClick={(r) => open(r)}
 *     dim={(r) => r.archived}
 *     cell={(r, key) => …}
 *     actions={(r) => <ActionMenu … />}                     // optional trailing column
 *   />
 *
 * Column: { key, label, basis (grid track, default '120px'), align 'left'|'right',
 *           sortable (default true when onSort is given) }
 */
import React from 'react';
import { DS, TY } from '../utils/designSystem';
import { SortArrow } from './SortHeader';

const HAIRLINE = '#EEF0F3';

/* Identity cell — the primary column (optional icon tile · title · badge · sub).
   Title typography matches the Contacts table (13 / 700 / navy). */
export function BannerIdentity({ icon, iconBg = DS.blue100, title, badge, description }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, width: '100%' }}>
      {icon != null && (
        <span style={{ width: 40, height: 40, borderRadius: 10, background: iconBg, flexShrink: 0,
                       display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
      )}
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, lineHeight: '18px', color: DS.navy, fontFamily: DS.ff,
                         overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
          {badge}
        </div>
        {description != null && (
          <div style={{ ...TY.b3, color: DS.textSecondary, fontFamily: DS.ff, marginTop: 2,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{description}</div>
        )}
      </div>
    </div>
  );
}

function HeadCell({ col, sortKey, sortDir, onSort }) {
  const sortable = col.sortable !== false && !!onSort;
  const active = sortKey === col.key;
  return (
    <div onClick={sortable ? () => onSort(col.key) : undefined}
      style={{ display: 'flex', alignItems: 'center', gap: 5, userSelect: 'none',
               cursor: sortable ? 'pointer' : 'default',
               justifyContent: col.align === 'right' ? 'flex-end' : 'flex-start' }}>
      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
                     color: '#3E4E65', fontFamily: DS.ff }}>{col.label}</span>
      {active && <span style={{ display: 'flex' }}><SortArrow dir={sortDir} /></span>}
    </div>
  );
}

export function BannerTable({ columns, rows, rowId, sortKey, sortDir, onSort, onRowClick, dim, cell, actions }) {
  const template = columns.map((c) => c.basis || '120px').join(' ') + (actions ? ' 44px' : '');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Column header — labels aligned to the shared grid. Padded 19px (18px row
          padding + 1px row border) so labels sit over the values below. */}
      <div style={{ display: 'grid', gridTemplateColumns: template, alignItems: 'center', gap: 16, padding: '0 19px', height: 34 }}>
        {columns.map((col) => (
          <HeadCell key={col.key} col={col} sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
        ))}
        {actions && <div />}
      </div>

      {/* One banner per row */}
      {rows.map((row) => {
        const isDim = dim ? dim(row) : false;
        return (
          <div key={rowId(row)} onClick={onRowClick ? () => onRowClick(row) : undefined}
            style={{
              display: 'grid', gridTemplateColumns: template, alignItems: 'center', gap: 16,
              padding: '13px 18px', borderRadius: 12, cursor: onRowClick ? 'pointer' : 'default',
              background: DS.bgCard, border: `1px solid ${HAIRLINE}`, boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
              opacity: isDim ? 0.6 : 1, transition: 'border-color .12s, box-shadow .12s, background .12s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = DS.actionPrimary; e.currentTarget.style.boxShadow = '0 4px 12px rgba(16,24,40,0.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = HAIRLINE; e.currentTarget.style.boxShadow = '0 1px 2px rgba(16,24,40,0.04)'; }}>
            {columns.map((col) => (
              <div key={col.key} style={{ minWidth: 0, display: 'flex', alignItems: 'center',
                                          justifyContent: col.align === 'right' ? 'flex-end' : 'flex-start',
                                          ...TY.b2, color: DS.textDefault, fontFamily: DS.ff }}>
                {cell(row, col.key)}
              </div>
            ))}
            {actions && (
              <div style={{ display: 'flex', justifyContent: 'center' }} onClick={(e) => e.stopPropagation()}>
                {actions(row)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default BannerTable;
