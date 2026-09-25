/**
 * AX Design System — Field components
 * Figma: Molecules › FormField 464:107 · Atoms › Input 460:84
 * https://www.figma.com/design/nIMtO7v8dDamI8b2vnMcRc/AX-DESIGN-SYSTEM?node-id=464-107
 *
 * Verified with get_design_context 2026-09 (464:75 Required=false, 484:114
 * Required=true, 460:60 the bare Input):
 *
 *   FormField   flex-col · gap 4 · w 280
 *     Label row   h 16 · gap 4 · Label/Medium (12/16/500) in text/strong
 *                 + a "*" in feedback/danger when required
 *                 + an optional 14px info icon (showInfo)
 *     Input       h 36 · radius 8 · px 12 py 8 · surface/canvas fill
 *                 border/field border · placeholder text/muted · bodyMd
 *     Help text   12/16 regular in text/muted — a permanent slot, distinct
 *                 from the error message
 *
 * ⚠ RADIUS: the Figma Input renders at 4, but every input in this app is at 8
 *   on the PM's call — the Button is 8, so a 4px field sitting beside an 8px
 *   button read as two different systems. Applied consistently: Input, Textarea,
 *   SearchField, the Select trigger and the EntityPicker search box. `radiusLg`
 *   already carries 8, so no token was added; raise it with the designer if the
 *   Figma component should follow.
 *
 * ⚠ Only the Default state is read from Figma. Focus / Error / Disabled keep the
 *   pre-existing treatment rebased onto DS tokens (focus → border/focus, error →
 *   border/error + feedback/error-bg, disabled → surface/muted + border/subtle,
 *   mirroring the DS Select's verified disabled inversion). Those three are
 *   INFERRED — re-read 460:66 / 460:72 / 460:78 to confirm.
 * ⚠ The DS Input is radius 4 while the DS Select is radius 8, and Input is h36
 *   while Select is h44. That is a DS-side inconsistency: the two most common
 *   form controls will not align in the same row.
 *
 * Exports:
 *   Field       — FormField: label row + input + help/error
 *   SearchField — search input with a leading icon (no DS node; follows Input)
 *   TextArea    — multi-line field, same label/help structure
 *
 * Usage:
 *   <Field label="Last name" value={v} onChange={e => setV(e.target.value)} />
 *   <Field label="Email" required help="We'll only use this for receipts." />
 *   <Field label="Email" error="Invalid email address — check the format." />
 *   <Field label="Budget" showInfo onInfoClick={…} />
 */

import React from 'react';
import { DS, TY } from '../utils/designSystem';
import Ico from '../utils/icons';

const INPUT_H = 36;

// ─── Base input style ─────────────────────────────────────────────────────────
function inputStyle({ focused, error, disabled, value }) {
  let border, bg, color;

  if (disabled) {
    // INFERRED — mirrors the DS Select's verified disabled inversion.
    border = `1px solid ${DS.borderSubtle}`;
    bg     = DS.surfaceMuted;
    color  = DS.textDisabled;
  } else if (error) {
    border = `1px solid ${DS.borderError}`;
    bg     = DS.feedbackErrorBg;
    color  = DS.feedbackErrorText;
  } else if (focused) {
    border = `1px solid ${DS.borderFocus}`;
    bg     = DS.surfaceCanvas;
    color  = DS.textDefault;
  } else {
    border = `1px solid ${DS.borderField}`;
    bg     = DS.surfaceCanvas;
    color  = value ? DS.textDefault : DS.textMuted;
  }

  return {
    height:       INPUT_H,
    padding:      '8px 12px',
    borderRadius: DS.radiusLg,
    border,
    background:   bg,
    color,
    fontFamily:   DS.ff,
    ...TY.bodyMd,
    outline:      'none',
    width:        '100%',
    boxSizing:    'border-box',
    cursor:       disabled ? 'not-allowed' : 'text',
    transition:   `border-color ${DS.durFast} ${DS.ease}, background ${DS.durFast} ${DS.ease}`,
  };
}

// ─── Label row (h16, gap 4, labelMd in textStrong, * when required) ──────────
function LabelRow({ label, required, showInfo, onInfoClick }) {
  if (!label) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 16, width: '100%' }}>
      <span style={{ ...TY.labelMd, fontFamily: DS.ff, color: DS.textStrong, whiteSpace: 'nowrap' }}>
        {label}
      </span>
      {required && (
        <span style={{ ...TY.labelMd, fontFamily: DS.ff, color: DS.feedbackDanger }} aria-hidden="true">*</span>
      )}
      {showInfo && (
        <span
          onClick={onInfoClick}
          style={{ display: 'flex', flexShrink: 0, cursor: onInfoClick ? 'pointer' : 'default' }}
        >
          <Ico.Info s={14} c={DS.textMuted} />
        </span>
      )}
    </div>
  );
}

// ─── Help text / error message (12/16 in textMuted; error takes over) ────────
function HelpRow({ help, error, disabled }) {
  if (error && !disabled) {
    return (
      <span style={{ ...TY.labelMd, fontWeight: 400, fontFamily: DS.ff, color: DS.feedbackDanger, width: '100%' }}>
        {error}
      </span>
    );
  }
  if (help) {
    return (
      <span style={{ ...TY.labelMd, fontWeight: 400, fontFamily: DS.ff, color: DS.textMuted, width: '100%' }}>
        {help}
      </span>
    );
  }
  return null;
}

// ─── Field (Molecules/FormField) ─────────────────────────────────────────────
export function Field({
  label,
  value,
  onChange,
  placeholder = 'Enter a value…',
  type     = 'text',
  required = false,
  help,
  error,
  showInfo = false,
  onInfoClick,
  disabled = false,
  style: styleProp,
  ...rest
}) {
  const [focused, setFocused] = React.useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, ...styleProp }}>
      <LabelRow label={label} required={required} showInfo={showInfo} onInfoClick={onInfoClick} />
      <input
        type={type}
        value={value ?? ''}
        onChange={disabled ? undefined : onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        aria-invalid={error ? true : undefined}
        onFocus={() => !disabled && setFocused(true)}
        onBlur={() => setFocused(false)}
        style={inputStyle({ focused, error, disabled, value })}
        {...rest}
      />
      <HelpRow help={help} error={error} disabled={disabled} />
    </div>
  );
}

// ─── SearchField (Atoms/SearchInput 1041:17995) ──────────────────────────────
// Verified with get_design_context 2026-09. The single search input in the app:
//   shell   surface/canvas on 1px border/SUBTLE (#F4F5F5 — not border/field),
//           radius 8, padding 8px 12px, gap 6
//   icon    16px `fi-br-search`, FILLED, text/default — Ico.SearchFilled
//   text    Inter Regular 13/20, placeholder in text/muted
// ⚠ Two things the node does not document, kept as flagged local behaviour:
//   · a Focus state (border/focus), borrowed from Atoms/Input, which does have
//     one — a field that doesn't answer the caret is worse than one off-spec;
//   · the 13/20 type: TY.bodySm is 13/18, so the line-height is set explicitly.
// The height is pinned to 36 with border-box (rather than left to the padding)
// for the same reason as Btn: Figma draws the border inside the frame.
export function SearchField({
  value,
  onChange,
  placeholder = 'Quick search…',
  disabled    = false,
  style: styleProp,
  ...rest
}) {
  const [focused, setFocused] = React.useState(false);

  return (
    <div
      style={{
        height:       INPUT_H,
        padding:      '8px 12px',
        borderRadius: DS.radiusLg,
        border:       `1px solid ${!disabled && focused ? DS.borderFocus : DS.borderSubtle}`,
        background:   disabled ? DS.surfaceMuted : DS.surfaceCanvas,
        display:      'flex',
        alignItems:   'center',
        gap:          6,
        boxSizing:    'border-box',
        transition:   `border-color ${DS.durFast} ${DS.ease}`,
        ...styleProp,
      }}
    >
      <Ico.SearchFilled s={16} c={disabled ? DS.textDisabled : DS.textDefault} />
      <input
        value={value ?? ''}
        onChange={disabled ? undefined : onChange}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => !disabled && setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          flex:       1,
          minWidth:   0,
          border:     'none',
          background: 'transparent',
          outline:    'none',
          fontFamily: DS.ff,
          ...TY.bodySm,
          lineHeight: '20px',
          // The placeholder is text/muted and the typed value text/default;
          // an inline style cannot reach ::placeholder, so the input's own
          // colour stands in for it.
          color:      disabled ? DS.textDisabled : value ? DS.textDefault : DS.textMuted,
          cursor:     disabled ? 'not-allowed' : 'text',
        }}
        {...rest}
      />
    </div>
  );
}

// ─── TextArea (Molecules/Textarea 887:334) ───────────────────────────────────
export function TextArea({
  label,
  value,
  onChange,
  placeholder = 'Enter a value…',
  required = false,
  help,
  error,
  showInfo = false,
  onInfoClick,
  disabled = false,
  rows     = 4,
  style: styleProp,
  ...rest
}) {
  const [focused, setFocused] = React.useState(false);
  const base = inputStyle({ focused, error, disabled, value });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, ...styleProp }}>
      <LabelRow label={label} required={required} showInfo={showInfo} onInfoClick={onInfoClick} />
      <textarea
        rows={rows}
        value={value ?? ''}
        onChange={disabled ? undefined : onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        aria-invalid={error ? true : undefined}
        onFocus={() => !disabled && setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...base,
          height:    'auto',
          minHeight: 120,
          resize:    'vertical',
        }}
        {...rest}
      />
      <HelpRow help={help} error={error} disabled={disabled} />
    </div>
  );
}

export default Field;
