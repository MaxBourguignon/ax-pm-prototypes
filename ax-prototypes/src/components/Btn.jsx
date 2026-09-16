/**
 * AX Design System — Btn
 *
 * Figma Atoms/Button (component set 455:322), read from the variant board
 * 457:40 with get_design_context 2026-09 — 36 variants, Variant × Size × State:
 *   https://www.figma.com/design/nIMtO7v8dDamI8b2vnMcRc/Arenametrix-DS--WIP-?node-id=457-40
 *
 * The DS sizes a button by PADDING, not a fixed height. Every value below is
 * from the node, not inferred:
 *   Sm  px8  py6   gap 4  icon 14  Label/Medium  (12/16/500)  → 28 tall
 *   Md  px12 py8   gap 6  icon 16  Label/Large   (14/20/500)  → 36 tall
 *   Lg  px16 py10  gap 8  icon 20  Label/XLarge  (16/24/500)  → 44 tall
 *   Radius 8 on every size and variant.
 *
 *   Primary      bg brand/primary → action/primary/hover · label text/on-brand · no border
 *   Secondary    bg surface/canvas → surface/subtle · 1px border/default ·
 *                label text/strong, UNCHANGED on hover
 *   Ghost        no bg, no border · hover bg surface/subtle · label text/strong
 *   Destructive  bg action/danger/default → action/danger/hover · label text/on-brand
 *   Disabled     label text/muted with NO opacity change; background depends on
 *                the variant — surface/muted for Primary and Destructive,
 *                surface/subtle (keeping its border) for Secondary, nothing for Ghost
 *
 * Heights are set explicitly rather than left to the padding, because Figma
 * draws the Secondary border INSIDE the 28/36/44 frame. In CSS a 1px border adds
 * to a padding-derived box, so Secondary would stand 2px taller than Ghost;
 * an explicit height with border-box reproduces the frame exactly.
 *
 * ⚠ Two things in the node that are NOT reproduced, flagged rather than copied:
 *   1. Primary/Sm/Default carries gap 8 while every other Sm variant — including
 *      Primary/Sm/Hover — carries gap 4. Read as a slip in the file; all Sm
 *      buttons here use 4. A button that changes width on hover is a bug.
 *   2. `GhostDanger` has no DS node at all. The DS has no ghost-danger button;
 *      this one is local, kept because destructive row actions use it.
 *
 * Props
 *   type     "Primary" | "Secondary" | "Ghost" | "Destructive" | "GhostDanger"
 *            Aliases kept for existing call sites: Tertiary → Ghost,
 *            Danger → Destructive, TertiaryDanger → GhostDanger
 *   size     "Sm" | "Md" | "Lg"   (aliases: Small/Medium/Large, sm/md/lg)
 *   iconLeft / iconRight   <Ico.* /> — sized and coloured by the button
 *   disabled · onClick · children (the label)
 *
 * Usage
 *   <Btn type="Primary" iconLeft={<Ico.Plus />} onClick={…}>Create</Btn>
 *   <Btn type="Secondary" size="Sm" disabled>Export</Btn>
 */

import React from 'react';
import { DS, TY } from '../utils/designSystem';

const SIZES = {
  Sm: { height: 28, padX: 8,  gap: 4, icon: 14, type: TY.labelMd },
  Md: { height: 36, padX: 12, gap: 6, icon: 16, type: TY.labelLg },
  Lg: { height: 44, padX: 16, gap: 8, icon: 20, type: TY.labelXl },
};
const SIZE_ALIAS = {
  Small: 'Sm', Medium: 'Md', Large: 'Lg',
  sm: 'Sm', md: 'Md', lg: 'Lg',
};

const VARIANTS = {
  Primary: {
    default:  { bg: DS.brandPrimary,      fg: DS.textOnBrand, bd: 'transparent' },
    hover:    { bg: DS.actionPrimaryHover, fg: DS.textOnBrand, bd: 'transparent' },
    disabled: { bg: DS.surfaceMuted,      fg: DS.textMuted,   bd: 'transparent' },
  },
  Secondary: {
    default:  { bg: DS.surfaceCanvas, fg: DS.textStrong, bd: DS.borderDefault },
    hover:    { bg: DS.surfaceSubtle, fg: DS.textStrong, bd: DS.borderDefault },
    disabled: { bg: DS.surfaceSubtle, fg: DS.textMuted,  bd: DS.borderDefault },
  },
  Ghost: {
    default:  { bg: 'transparent',    fg: DS.textStrong, bd: 'transparent' },
    hover:    { bg: DS.surfaceSubtle, fg: DS.textStrong, bd: 'transparent' },
    disabled: { bg: 'transparent',    fg: DS.textMuted,  bd: 'transparent' },
  },
  Destructive: {
    default:  { bg: DS.actionDanger,      fg: DS.textOnBrand, bd: 'transparent' },
    hover:    { bg: DS.actionDangerHover, fg: DS.textOnBrand, bd: 'transparent' },
    disabled: { bg: DS.surfaceMuted,      fg: DS.textMuted,   bd: 'transparent' },
  },
  // Local extension — no DS node (see the header note).
  GhostDanger: {
    default:  { bg: 'transparent',        fg: DS.actionDanger, bd: 'transparent' },
    hover:    { bg: DS.feedbackDangerSubtle, fg: DS.actionDanger, bd: 'transparent' },
    disabled: { bg: 'transparent',        fg: DS.textMuted,    bd: 'transparent' },
  },
};
const TYPE_ALIAS = {
  Tertiary: 'Ghost',
  Danger: 'Destructive',
  TertiaryDanger: 'GhostDanger',
};

export function Btn({
  type      = 'Primary',
  size      = 'Md',
  iconLeft,
  iconRight,
  disabled  = false,
  onClick,
  children,
  style: styleProp,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);

  const s = SIZES[SIZE_ALIAS[size] ?? size] ?? SIZES.Md;
  const v = VARIANTS[TYPE_ALIAS[type] ?? type] ?? VARIANTS.Primary;
  const c = disabled ? v.disabled : hover ? v.hover : v.default;

  // Icons take the button's size and label colour unless the call site set them.
  function cloneIcon(ico) {
    if (!ico) return null;
    return React.cloneElement(ico, { s: ico.props.s ?? s.icon, c: ico.props.c ?? c.fg });
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => !disabled && setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: s.gap,
        height: s.height,
        padding: `0 ${s.padX}px`,
        boxSizing: 'border-box',
        borderRadius: DS.radiusLg,
        border: `1px solid ${c.bd}`,
        background: c.bg,
        color: c.fg,
        fontFamily: DS.ff,
        ...s.type,
        whiteSpace: 'nowrap',
        cursor: disabled ? 'not-allowed' : 'pointer',
        userSelect: 'none',
        transition: `background ${DS.durFast} ${DS.ease}, border-color ${DS.durFast} ${DS.ease}, color ${DS.durFast} ${DS.ease}`,
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
