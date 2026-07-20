/**
 * AX Design System — Btn
 * Figma node 196:1229 — https://www.figma.com/design/NUOoC3GC7mB4U1AydRKIoy/AX-DESIGN-SYSTEM--NEW-?node-id=196-1229
 *
 * Props:
 *   type     "Primary" | "Secondary" | "Tertiary" | "TertiaryDanger" | "Danger"   default "Primary"
 *   size     "Medium" | "Small"                                         default "Medium"
 *   iconLeft  <Ico.* /> element — rendered left of the label
 *   iconRight <Ico.* /> element — rendered right of the label
 *   disabled  boolean
 *   onClick   () => void
 *   children  label text
 *
 * Design rules:
 *   - borderRadius 6 on all variants
 *   - Medium: height 40, TY.b2, icon 20px
 *   - Small:  height 32, TY.b3, icon 16px
 *   - gap: 8 when any icon present
 *   - Disabled: actionDisabledBg, actionDisabledText, opacity 0.45, no border
 *
 * Usage:
 *   <Btn type="Primary" iconLeft={<Ico.Plus />} onClick={…}>Créer</Btn>
 *   <Btn type="Secondary" size="Small" disabled>Exporter</Btn>
 */

import React from 'react';
import { DS, TY } from '../utils/designSystem';

// Per-variant colour tables
const VARIANTS = {
  Primary: {
    default: {
      background:  DS.actionPrimary,
      color:       DS.textInverse,
      border:      `1px solid ${DS.actionPrimary}`,
    },
    hover: {
      background:  DS.actionPrimaryHover,
      color:       DS.textInverse,
      border:      `1px solid ${DS.actionPrimaryHover}`,
    },
  },
  Secondary: {
    default: {
      background:  DS.bgCard,
      color:       DS.textDefault,
      border:      `1px solid ${DS.actionSecondaryBorder}`,
    },
    hover: {
      background:  DS.actionSecondaryHover,
      color:       DS.actionSecondaryTextHover,
      border:      `1px solid ${DS.actionSecondaryBorder}`,
    },
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
    },
  },
  TertiaryDanger: {
    default: {
      background:  'transparent',
      color:       DS.feedbackError,
      border:      '1px solid transparent',
    },
    hover: {
      background:  DS.feedbackErrorBg,
      color:       DS.feedbackError,
      border:      '1px solid transparent',
    },
  },
  Danger: {
    default: {
      background:  DS.feedbackError,
      color:       DS.textInverse,
      border:      `1px solid ${DS.feedbackError}`,
    },
    hover: {
      background:  DS.feedbackErrorText,
      color:       DS.textInverse,
      border:      `1px solid ${DS.feedbackErrorText}`,
    },
  },
};

const DISABLED = {
  background: DS.actionDisabledBg,
  color:      DS.actionDisabledText,
  border:     'none',
  opacity:    0.45,
  cursor:     'not-allowed',
};

export function Btn({
  type      = 'Primary',
  size      = 'Medium',
  iconLeft,
  iconRight,
  disabled  = false,
  onClick,
  children,
  style: styleProp,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);

  const isSmall   = size === 'Small';
  const typography = isSmall ? TY.b3 : TY.b2;
  const iconSize   = isSmall ? 14 : 16;
  const height     = isSmall ? 28  : 36;
  const hasIcon    = !!(iconLeft || iconRight);

  const v       = VARIANTS[type] ?? VARIANTS.Primary;
  const colours = disabled ? DISABLED : hover ? v.hover : v.default;

  // Clone icon with correct size and colour (inherits from button text colour)
  function cloneIcon(ico) {
    if (!ico) return null;
    return React.cloneElement(ico, {
      s: ico.props.s ?? iconSize,
      c: disabled ? DS.actionDisabledText : colours.color,
    });
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => !disabled && setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        // Layout
        display:        'inline-flex',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            hasIcon ? 8 : 0,
        height,
        padding:        '0 24px',
        // Shape
        borderRadius:   8,
        border:         colours.border,
        // Colour
        background:     colours.background,
        color:          colours.color,
        opacity:        disabled ? 0.45 : 1,
        // Typography
        fontFamily:     DS.ff,
        ...typography,
        whiteSpace:     'nowrap',
        // Interaction
        cursor:         disabled ? 'not-allowed' : 'pointer',
        userSelect:     'none',
        transition:     'background 0.15s ease, border-color 0.15s ease, color 0.15s ease',
        ...styleProp,
      }}
      {...rest}
    >
      {cloneIcon(iconLeft)}
      {children}
      {cloneIcon(iconRight)}
    </button>
  );
}

export default Btn;