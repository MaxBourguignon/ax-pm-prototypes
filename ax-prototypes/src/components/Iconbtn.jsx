/**
 * AX Design System — IconBtn
 * Figma node 66:944 — https://www.figma.com/design/NUOoC3GC7mB4U1AydRKIoy/AX-DESIGN-SYSTEM--NEW-?node-id=196-1229
 *
 * Props:
 *   icon     <Ico.* /> element (required)
 *   type     "Primary" | "Secondary"   default "Secondary"
 *   size     "Medium" | "Small"        default "Medium"
 *            Medium → 36×36px  |  Small → 28×28px
 *   active   boolean — keeps hover bg active (e.g. open dropdown)
 *   onClick  () => void
 *   aria-label string (required for accessibility)
 *
 * Design rules:
 *   - borderRadius 6, border 1px solid
 *   - Primary:   bg actionPrimary / hover actionPrimaryHover
 *   - Secondary: bg bgCard / hover actionSecondaryHover, border stays actionSecondaryBorder
 *
 * Usage:
 *   <IconBtn icon={<Ico.Dots />} aria-label="Options" onClick={open} />
 *   <IconBtn icon={<Ico.Filter />} type="Primary" size="Small" />
 */

import React from 'react';
import { DS } from '../utils/designSystem';

const VARIANTS = {
  Primary: {
    default: { background: DS.actionPrimary,      border: `1px solid ${DS.actionPrimary}`,      iconC: DS.textInverse },
    hover:   { background: DS.actionPrimaryHover,  border: `1px solid ${DS.actionPrimaryHover}`,  iconC: DS.textInverse },
  },
  Secondary: {
    default: { background: DS.bgCard,              border: `1px solid ${DS.actionSecondaryBorder}`, iconC: DS.actionPrimary },
    hover:   { background: DS.actionSecondaryHover, border: `1px solid ${DS.actionSecondaryBorder}`, iconC: DS.actionPrimary },
  },
  Tertiary: {
    default: {
      background:  'transparent',
      color:       DS.textDefault,
      border:      '1px solid transparent',
    },
    hover: {
      background:  DS.actionTertiaryHover,
      color:       DS.actionTertiaryTextHover,
      border:      '1px solid transparent',
    }
  }
};

export function IconBtn({
  icon,
  type     = 'Secondary',
  size     = 'Medium',
  active   = false,
  onClick,
  style: styleProp,
  'aria-label': ariaLabel,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);

  const dim = size === 'Small' ? 28 : 36;
  const v   = VARIANTS[type] ?? VARIANTS.Secondary;
  const s   = (hover || active) ? v.hover : v.default;

  const clonedIcon = icon
    ? React.cloneElement(icon, {
        s: icon.props.s ?? 18,
        c: icon.props.c ?? s.iconC,
      })
    : null;

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width:          dim,
        height:         dim,
        padding:        0,
        flexShrink:     0,
        // Shape
        borderRadius:   6,
        border:         s.border,
        // Colour
        background:     s.background,
        // Layout
        display:        'inline-flex',
        alignItems:     'center',
        justifyContent: 'center',
        // Interaction
        cursor:         'pointer',
        transition:     'background 0.15s ease',
        ...styleProp,
      }}
      {...rest}
    >
      {clonedIcon}
    </button>
  );
}

export default IconBtn;