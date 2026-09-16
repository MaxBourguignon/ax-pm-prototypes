/**
 * AX Design System — PageHeader
 *
 * Figma Organisms/PageHeader (component set 2053:459), verified with
 * get_design_context 2026-09:
 *   Type=Default  466:150  — https://www.figma.com/design/nIMtO7v8dDamI8b2vnMcRc/Arenametrix-DS--WIP-?node-id=466-150
 *   Type=Contact  2053:449
 *
 * Shared shell (both types):
 *   border 1px borderSection · radius 12 · shadowSm · padding 24px 32px
 *   Actions right-aligned, gap 8, Secondary before Primary
 * Default:  bg surfaceCanvas, height 88
 *           title    headlineMd (Inter Bold 22/28) textStrong
 *           meta     captionSm  (Inter Regular 11/16) textMuted
 * Contact:  bg surfaceHeader (#EFF4FF), height auto
 *           Avatar XL 64 tone="brand" · gap 12
 *           title    headlineMd + optional status (6px dot + labelLg, feedbackSuccess)
 *           details  bodySm textSecondary, separated by 4px dots
 *
 * ⚠ THIS COMPONENT CONTRADICTS THREE STANDING PROJECT RULES. The DS is
 *   implemented here as the default because it is the design source of truth,
 *   but each conflict is left switchable rather than silently resolved:
 *   1. "Never a white banner — the PageHeader sits transparently on the page
 *      background." The DS Default is a white bordered card with a shadow.
 *      → pass variant="plain" for the previous transparent rendering.
 *   2. "Keep page headers compact — title 20px/600, subtitle ~13px."
 *      The DS is title 22px/700 in a fixed 88px shell.
 *      → variant="plain" also restores the compact type.
 *   3. "The subtitle is always a page DESCRIPTION, never an item count."
 *      The DS subtitle is literally "1 234 contacts · Mis à jour il y a 5 min".
 *      → `description` keeps the sentence semantics; `meta` is the opt-in slot
 *        for the DS count/freshness line. Neither is forced.
 *
 * Props
 *   type          'default' | 'contact'                     default 'default'
 *   variant       'card' | 'plain'   'plain' = pre-DS transparent style, NOT in the
 *                 DS. Ignored when type="contact" — that type has no plain form.
 *   title         string
 *   description   string  — the page sentence (rendered in the meta slot)
 *   meta          string  — DS-style count/freshness line; wins over `description`
 *   actions       node    — put Secondary before Primary
 *   // contact type only
 *   avatarName    string  — full name; initials are auto-computed
 *   status        string  — status text beside the title
 *   statusTone    DS colour token   default DS.feedbackSuccess
 *   details       string[] — dot-separated detail line (email · phone · address · …)
 *   icon          accepted and ignored (legacy callers)
 */
import React from 'react';
import { DS, TY } from '../utils/designSystem';
import { Avatar } from './Tag';

const SHELL = {
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  padding: '24px 32px',
  border: `1px solid ${DS.borderSection}`,
  borderRadius: DS.radiusXl,
  boxShadow: DS.shadowSm,
};

function Dot({ s = 4, c = DS.textMuted }) {
  return <span style={{ width: s, height: s, borderRadius: '50%', background: c, flexShrink: 0 }} />;
}

export function PageHeader({
  type = 'default',
  variant = 'card',
  title,
  description,
  meta,
  actions,
  avatarName,
  status,
  statusTone = DS.feedbackSuccess,
  details,
}) {
  const subLine = meta ?? description;

  /* ── Pre-DS transparent rendering (rules 1 + 2 above) ─────────────────────
     Only applies to the Default type. `plain` exists to honour the "never a
     white banner" rule for main pages; the Contact type is a distinct design
     with an avatar, status and details that this layout has no slots for, so
     type="contact" always renders the DS card. */
  if (variant === 'plain' && type !== 'contact') {
    return (
      <div style={{
        background: 'transparent', padding: '16px 32px 20px', display: 'flex',
        alignItems: 'flex-start', justifyContent: 'space-between', gap: 16,
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ ...TY.h3, fontFamily: DS.ff, color: DS.textStrong }}>{title}</div>
          {subLine != null && (
            <div style={{ ...TY.bodySm, fontFamily: DS.ff, color: DS.textSecondary, marginTop: 3 }}>
              {subLine}
            </div>
          )}
        </div>
        {actions != null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>{actions}</div>
        )}
      </div>
    );
  }

  /* ── Type=Contact ───────────────────────────────────────────────────────── */
  if (type === 'contact') {
    return (
      <div style={{ ...SHELL, background: DS.surfaceHeader }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: '1 0 0', minWidth: 0 }}>
          {avatarName != null && <Avatar name={avatarName} size={64} tone="brand" />}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <span style={{ ...TY.headlineMd, fontFamily: DS.ff, color: DS.textStrong, whiteSpace: 'nowrap' }}>
                {title}
              </span>
              {status != null && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <Dot s={6} c={statusTone} />
                  <span style={{ ...TY.labelLg, fontFamily: DS.ff, color: statusTone, whiteSpace: 'nowrap' }}>
                    {status}
                  </span>
                </span>
              )}
            </div>
            {Array.isArray(details) && details.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flexWrap: 'wrap' }}>
                {details.filter(Boolean).map((d, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <Dot />}
                    <span style={{ ...TY.bodySm, fontFamily: DS.ff, color: DS.textSecondary, whiteSpace: 'nowrap' }}>
                      {d}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
        {actions != null && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flexShrink: 0 }}>{actions}</div>
        )}
      </div>
    );
  }

  /* ── Type=Default ───────────────────────────────────────────────────────── */
  return (
    <div style={{ ...SHELL, background: DS.surfaceCanvas, height: 88 }}>
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 4,
        flex: '1 0 0', minWidth: 0, overflow: 'hidden',
      }}>
        <span style={{
          ...TY.headlineMd, fontFamily: DS.ff, color: DS.textStrong,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {title}
        </span>
        {subLine != null && (
          <span style={{
            ...TY.captionSm, fontFamily: DS.ff, color: DS.textMuted,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {subLine}
          </span>
        )}
      </div>
      {actions != null && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flexShrink: 0 }}>{actions}</div>
      )}
    </div>
  );
}

export default PageHeader;
