/**
 * AX Prototypes — PageHeader (the page-title block every page shares)
 * One canonical shape: the page title, a one-line page DESCRIPTION, and
 * optional actions on the right. It sits transparently on the page background
 * (no white card, no border) — the single sticky bar lives in <TopHeader/>.
 *
 *   <PageHeader
 *     title="Contacts"
 *     description="Browse, segment and manage every contact in your CRM"
 *     actions={<Btn type="Primary" …>Add a contact</Btn>}
 *   />
 *
 * Props: title, description (page sentence), actions. An `icon` prop may still
 * be passed by older callers — it is accepted and ignored (no longer rendered).
 */
import React from 'react';
import { DS, TY } from '../utils/designSystem';

export function PageHeader({ title, description, actions }) {
  return (
    <div style={{ background: 'transparent', padding: '16px 32px 20px',
                  display: 'flex', alignItems: 'flex-start',
                  justifyContent: 'space-between', gap: 16 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ ...TY.h3, fontFamily: DS.ff, color: DS.navy }}>{title}</div>
        {description != null && (
          <div style={{ fontSize: 13, fontWeight: 400, lineHeight: '18px',
                        fontFamily: DS.ff, color: '#54626F', marginTop: 3 }}>
            {description}
          </div>
        )}
      </div>
      {actions != null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>{actions}</div>
      )}
    </div>
  );
}

export default PageHeader;
