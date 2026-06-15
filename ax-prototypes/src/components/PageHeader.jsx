/**
 * AX Prototypes — PageHeader (the top banner every page shares)
 * One canonical shape: a full-width bar with an icon tile, the page title, a
 * one-line page DESCRIPTION (never an item count), and optional actions on the
 * right. Use this on every page so the banner looks identical everywhere.
 *
 *   <PageHeader
 *     icon={<Ico.User s={20} c={DS.actionPrimary} />}
 *     title="Contacts"
 *     description="Browse, segment and manage every contact in your CRM"
 *     actions={<Btn type="Primary" …>Add a contact</Btn>}
 *   />
 *
 * Props: icon (rendered node), title, description (page sentence — required for
 * consistency), actions.
 */
import React from 'react';
import { DS, TY } from '../utils/designSystem';

export function PageHeader({ icon, title, description, actions }) {
  return (
    <div style={{ background: DS.bgCard, borderBottom: `1px solid ${DS.borderDefault}`,
                  padding: '16px 24px', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
        {icon != null && (
          <span style={{ width: 40, height: 40, borderRadius: 8, background: DS.blue100,
                         display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {icon}
          </span>
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{ ...TY.h3, fontFamily: DS.ff, color: DS.textDefault }}>{title}</div>
          {description != null && (
            <div style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary, marginTop: 2 }}>
              {description}
            </div>
          )}
        </div>
      </div>
      {actions != null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>{actions}</div>
      )}
    </div>
  );
}

export default PageHeader;
