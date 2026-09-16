/**
 * AX Design System — Tab / Tabs
 *
 * Figma Molecules/Tab, documented on Section / Tab (node 465:94)
 *   https://www.figma.com/design/nIMtO7v8dDamI8b2vnMcRc/Arenametrix-DS--WIP-?node-id=465-94
 * Read with get_design_context 2026-09. Variants: Active=True (465:88) /
 * Active=False (465:91). Figma calls it "Onglet de navigation secondaire".
 *
 * Spec (both variants share the box):
 *   w 120 · h 48 · padding 14px 16px · content centred · gap 5
 *   Active    label Body/Medium/Bold (Inter SemiBold 14/20/600) in text/strong
 *             + 2px solid brand/primary bottom border
 *   Inactive  label Inter Medium 14/20/500 in text/muted · no border, no fill
 *
 * The DS node carries NO baseline rule under the strip (the section Body is
 * bare) — only the active tab is underlined. `divider` opts into a hairline
 * across the row for pages that need the tabs anchored to their content.
 *
 * ⚠ NOT in the DS, flagged rather than silently added:
 *   - hover state (the DS ships Active=True/False only) — inactive labels warm
 *     to text/secondary on hover, nothing else moves
 *   - `divider`, and `width` overriding the fixed 120 for long labels
 *
 * Usage:
 *   <Tabs value={tab} onChange={setTab} tabs={[
 *     { value: 'representation', label: 'Representations' },
 *     { value: 'event',          label: 'Events' },
 *   ]} />
 */
import React from 'react';
import { DS, TY } from '../utils/designSystem';

export function Tab({ label, active = false, onClick, width = 120 }) {
  const [hover, setHover] = React.useState(false);
  const color = active ? DS.textStrong : hover ? DS.textSecondary : DS.textMuted;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        // Box — identical across variants so switching never shifts the layout.
        width, height: 48, padding: '14px 16px', boxSizing: 'border-box',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
        background: 'transparent',
        border: 'none',
        borderBottom: `2px solid ${active ? DS.brandPrimary : 'transparent'}`,
        cursor: 'pointer',
        // Label — Body/Medium/Bold when active, Inter Medium 14/20 when not.
        fontFamily: DS.ff,
        ...(active ? TY.bodyMdBold : TY.labelLg),
        color,
        whiteSpace: 'nowrap',
        transition: `color ${DS.durFast} ${DS.ease}, border-color ${DS.durFast} ${DS.ease}`,
      }}
    >
      {label}
    </button>
  );
}

export function Tabs({ tabs = [], value, onChange, width, divider = false }) {
  return (
    <div
      role="tablist"
      style={{
        display: 'flex', alignItems: 'stretch',
        ...(divider ? { borderBottom: `1px solid ${DS.borderDivider}` } : null),
      }}
    >
      {tabs.map((t) => (
        <Tab
          key={t.value}
          label={t.label}
          active={t.value === value}
          width={t.width ?? width}
          onClick={() => onChange(t.value)}
        />
      ))}
    </div>
  );
}

export default Tabs;
