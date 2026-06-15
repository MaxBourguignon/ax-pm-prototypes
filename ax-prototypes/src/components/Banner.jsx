/**
 * AX Prototypes — Banner (full-width list row)
 * The DS "ComponentBanner" pattern (Figma 418:1399). One composable row used by
 * every prototype that lists entities as banners (lists, consents, …). Each
 * feature keeps a thin adapter that maps its data into these slots.
 *
 *   <Banner
 *     icon={<Ico.Mail s={20} c={DS.actionPrimary} />} iconBg={DS.blue100}
 *     title="Newsletter Public" badge={<StatusBadge status="inactive">Deactivated</StatusBadge>}
 *     description="Monthly editorial newsletter…"
 *     columns={[
 *       { label: 'CHANNEL', value: <>…</>, basis: '120px' },
 *       { label: 'CREATED', value: '2022-09-14', basis: '120px' },
 *     ]}
 *     trailing={<Sparkline … />}
 *     actions={<IconBtn … />}
 *     onClick={() => openDetail()}
 *   />
 *
 * Props: icon, iconBg, title, badge, description, columns[{label,value,basis}],
 * trailing, actions (clicks auto stop-propagation), onClick, dim.
 */
import React from 'react';
import { DS, TY } from '../utils/designSystem';

export function Banner({ icon, iconBg = DS.blue100, title, badge, description,
                        columns = [], trailing, actions, onClick, dim = false }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
         style={{ display: 'flex', alignItems: 'center', gap: 16, background: DS.bgCard,
                  border: `1px solid ${hover ? DS.borderFocus : DS.borderDefault}`, borderRadius: 10,
                  padding: '14px 16px', cursor: onClick ? 'pointer' : 'default',
                  transition: 'border-color .12s, box-shadow .12s',
                  boxShadow: hover ? '0 2px 12px rgba(0,0,0,0.07)' : 'none', opacity: dim ? 0.7 : 1 }}>
      {icon != null && (
        <span style={{ width: 44, height: 44, borderRadius: 10, background: iconBg, display: 'flex',
                       alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</span>
      )}

      <div style={{ flex: '2 1 200px', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ ...TY.h5, fontFamily: DS.ff, color: DS.textDefault, whiteSpace: 'nowrap',
                         overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 320 }}>{title}</span>
          {badge}
        </div>
        {description != null && (
          <div style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary, marginTop: 3,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 460 }}>
            {description}
          </div>
        )}
      </div>

      {columns.map((col, i) => (
        <div key={i} style={{ flex: `0 0 ${col.basis || '120px'}`, minWidth: 0 }}>
          <div style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary,
                        textTransform: 'uppercase', letterSpacing: '0.04em' }}>{col.label}</div>
          <div style={{ marginTop: 2, ...TY.b2, fontFamily: DS.ff, color: DS.textDefault,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{col.value}</div>
        </div>
      ))}

      {trailing != null && <div style={{ flex: '0 0 120px' }}>{trailing}</div>}

      {actions != null && (
        <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 'auto' }}
             onClick={(e) => e.stopPropagation()}>{actions}</div>
      )}
    </div>
  );
}

export default Banner;
