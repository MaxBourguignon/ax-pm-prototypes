/**
 * AX Design System — IconBtn
 * Figma: Atoms › IconButton, component set 525:101
 * https://www.figma.com/design/nIMtO7v8dDamI8b2vnMcRc/AX-DESIGN-SYSTEM?node-id=525-101
 *
 * Verified with get_design_context 2026-09 (Md variants):
 *   Filled/Default   1466:103   Filled/Default/Hover  1631:121
 *   Outline/Default  1627:114   Outline/Default/Hover 1631:141
 *   Ghost/Default    525:85     Ghost/Default/Hover   1631:161
 *   Filled/Danger    1630:116   Outline/Danger        525:95
 *
 * Square, radius 6. Sizes: Sm 28 · Md 32 · Lg 36. Icon: 16 at Sm, 20 at Md/Lg.
 *
 *   Kind      Default bg              Hover bg                 Border
 *   Filled    action/primary/default  action/primary/hover     none
 *   Outline   surface/canvas          action/primary/subtle    1px border/default
 *   Ghost     surface/canvas          action/primary/subtle    none
 *
 * `Color=Danger` changes only the ICON for Outline and Ghost — their containers
 * are byte-identical to Color=Default. Only Filled/Danger changes the
 * background (to feedback/danger).
 *
 * ⚠ Two things the Figma export could not tell me, both marked INFERRED below:
 *   1. Icon fill. The variants embed the icon as a flattened <img>, so its
 *      colour isn't readable. Filled → text/on-brand; Outline/Ghost →
 *      text/strong (matching Btn Secondary); Danger → feedback/danger.
 *   2. The Danger hover states aren't in the file. They follow the Default
 *      pattern with danger tokens.
 * ⚠ "Ghost" is surface/canvas (white), NOT transparent — that is what the DS
 *   says, which makes it visually identical to Outline minus the border.
 *
 * Props:
 *   icon      <Ico.* /> element (required). Explicit s / c on the icon win.
 *   kind      "Filled" | "Outline" | "Ghost"        default "Outline"
 *   color     "Default" | "Danger"                  default "Default"
 *   size      "Sm" | "Md" | "Lg"                    default "Md"
 *   active    boolean — render the hover state persistently
 *   onClick, aria-label, title, style
 *
 * Legacy aliases (deprecated, kept so existing call sites keep working):
 *   type="Primary"|"Secondary"|"Tertiary"  →  kind Filled|Outline|Ghost
 *   size="Small"|"Medium"                  →  Sm|Md
 *
 * Usage:
 *   <IconBtn icon={<Ico.Eye />} kind="Outline" size="Sm" onClick={…} />
 *   <IconBtn icon={<Ico.Trash />} kind="Ghost" color="Danger" />
 */
import React from 'react';
import { DS } from '../utils/designSystem';

const KINDS = {
  Filled: {
    Default: {
      default: { background: DS.actionPrimary,       border: 'none', iconC: DS.textOnBrand },
      hover:   { background: DS.actionPrimaryHover,  border: 'none', iconC: DS.textOnBrand },
    },
    Danger: {
      default: { background: DS.feedbackDanger,      border: 'none', iconC: DS.textOnBrand },
      // INFERRED — Danger hover is not in the Figma file.
      hover:   { background: DS.actionDangerHover,   border: 'none', iconC: DS.textOnBrand },
    },
  },
  Outline: {
    Default: {
      default: { background: DS.surfaceCanvas,       border: `1px solid ${DS.borderDefault}`, iconC: DS.textStrong },
      hover:   { background: DS.actionPrimarySubtle, border: `1px solid ${DS.borderDefault}`, iconC: DS.textStrong },
    },
    Danger: {
      // Container identical to Color=Default — only the icon differs.
      default: { background: DS.surfaceCanvas,        border: `1px solid ${DS.borderDefault}`, iconC: DS.feedbackDanger },
      // INFERRED
      hover:   { background: DS.feedbackDangerSubtle, border: `1px solid ${DS.borderDefault}`, iconC: DS.feedbackDanger },
    },
  },
  Ghost: {
    Default: {
      default: { background: DS.surfaceCanvas,       border: 'none', iconC: DS.textStrong },
      hover:   { background: DS.actionPrimarySubtle, border: 'none', iconC: DS.textStrong },
    },
    Danger: {
      default: { background: DS.surfaceCanvas,        border: 'none', iconC: DS.feedbackDanger },
      // INFERRED
      hover:   { background: DS.feedbackDangerSubtle, border: 'none', iconC: DS.feedbackDanger },
    },
  },
};

const DIM  = { Sm: 28, Md: 32, Lg: 36 };
// Sm 16 and Md 20 are verified. Lg's icon size is not in the file — 20 carried
// over from Md rather than guessed upward.
const ICON = { Sm: 16, Md: 20, Lg: 20 };

const KIND_ALIAS = { Primary: 'Filled', Secondary: 'Outline', Tertiary: 'Ghost' };
const SIZE_ALIAS = { Small: 'Sm', Medium: 'Md', Large: 'Lg', sm: 'Sm', md: 'Md', lg: 'Lg' };

export function IconBtn({
  icon,
  kind,
  color    = 'Default',
  size     = 'Md',
  type,                       // deprecated
  active   = false,
  disabled = false,
  onClick,
  style: styleProp,
  'aria-label': ariaLabel,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);

  const k = KINDS[kind ?? KIND_ALIAS[type] ?? 'Outline'] ?? KINDS.Outline;
  const c = k[color] ?? k.Default;
  const sz = SIZE_ALIAS[size] ?? (DIM[size] ? size : 'Md');
  const dim = DIM[sz];

  const s = disabled
    ? { background: DS.actionDisabledBg, border: 'none', iconC: DS.textMuted }
    : (hover || active) ? c.hover : c.default;

  const clonedIcon = icon
    ? React.cloneElement(icon, {
        s: icon.props.s ?? ICON[sz],
        c: icon.props.c ?? s.iconC,
      })
    : null;

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => !disabled && setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: dim,
        height: dim,
        padding: 0,
        flexShrink: 0,
        boxSizing: 'border-box',
        borderRadius: DS.radiusMdPlus,
        border: s.border,
        background: s.background,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: `background ${DS.durFast} ${DS.ease}, border-color ${DS.durFast} ${DS.ease}`,
        ...styleProp,
      }}
      {...rest}
    >
      {clonedIcon}
    </button>
  );
}

export default IconBtn;
