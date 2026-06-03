/**
 * AX Design System — Field components
 * Figma node 196:1333 — https://www.figma.com/design/NUOoC3GC7mB4U1AydRKIoy/AX-DESIGN-SYSTEM--NEW-?node-id=196-1333
 *
 * Exports:
 *   Field       — labelled text input (FieldInput pattern), all states
 *   SearchField — search input with leading search icon
 *   TextArea    — multi-line field (same states as Field)
 *
 * Field design rules:
 *   - Base: bg bgSurface, border 1px solid borderDefault, borderRadius 6
 *   - height 40 for all states — no layout shift
 *   - TY.b2, fontFamily DS.ff
 *   - Label: TY.b2, color textSecondary, gap 8 above input
 *   - Error message below: TY.b3, color feedbackError, marginTop 4
 *
 * State table:
 *   Default   → border borderDefault,  bg bgSurface,      text textPlaceholder
 *   Focus     → border borderFocus,    bg bgSurface,      text textDefault
 *   Filled    → border borderDefault,  bg bgSurface,      text textDefault
 *   Error     → border borderError,    bg feedbackErrorBg, text feedbackError
 *   Disabled  → border borderDefault,  bg actionDisabledBg, text textDisabled, cursor not-allowed
 *
 * Usage:
 *   <Field label="Nom" value={v} onChange={e => setV(e.target.value)} placeholder="Jean Dupont" />
 *   <Field label="Email" error="Format invalide" value={v} onChange={…} />
 *   <SearchField value={q} onChange={e => setQ(e.target.value)} />
 *   <TextArea label="Description" value={t} onChange={…} />
 */

import React from 'react';
import { DS, TY } from '../utils/designSystem';
import Ico from '../utils/icons';

// ─── Base input style builder ─────────────────────────────────────────────────
function inputStyle({ focused, error, disabled, value }) {
  let border, bg, color;

  if (disabled) {
    border = `1px solid ${DS.borderDefault}`;
    bg     = DS.actionDisabledBg;
    color  = DS.textDisabled;
  } else if (error) {
    border = `1px solid ${DS.borderError}`;
    bg     = DS.feedbackErrorBg;
    color  = DS.feedbackError;
  } else if (focused) {
    border = `1px solid ${DS.borderFocus}`;
    bg     = DS.bgSurface;
    color  = DS.textDefault;
  } else {
    border = `1px solid ${DS.borderDefault}`;
    bg     = DS.bgSurface;
    color  = value ? DS.textDefault : DS.textPlaceholder;
  }

  return {
    height:      40,
    padding:     '0 12px',
    borderRadius: 6,
    border,
    background:  bg,
    color,
    fontFamily:  DS.ff,
    ...TY.b2,
    outline:     'none',
    width:       '100%',
    boxSizing:   'border-box',
    cursor:      disabled ? 'not-allowed' : 'text',
    transition:  'border-color 0.15s ease, background 0.15s ease',
  };
}

// ─── Field (FieldInput — label + input) ──────────────────────────────────────
export function Field({
  label,
  value,
  onChange,
  placeholder,
  type     = 'text',
  error,
  disabled = false,
  style: styleProp,
  ...rest
}) {
  const [focused, setFocused] = React.useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, ...styleProp }}>
      {/* Label — TY.b2, textSecondary */}
      {label && (
        <span style={{ fontFamily: DS.ff, ...TY.b2, color: DS.textSecondary }}>
          {label}
        </span>
      )}

      {/* Input */}
      <input
        type={type}
        value={value ?? ''}
        onChange={disabled ? undefined : onChange}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => !disabled && setFocused(true)}
        onBlur={() => setFocused(false)}
        style={inputStyle({ focused, error, disabled, value })}
        {...rest}
      />

      {/* Error message — TY.b3, feedbackError */}
      {error && !disabled && (
        <span style={{ fontFamily: DS.ff, ...TY.b3, color: DS.feedbackError, marginTop: -4 }}>
          {error}
        </span>
      )}
    </div>
  );
}

// ─── SearchField ─────────────────────────────────────────────────────────────
export function SearchField({
  value,
  onChange,
  placeholder = 'Rechercher…',
  disabled    = false,
  style: styleProp,
  ...rest
}) {
  const [focused, setFocused] = React.useState(false);

  const border = focused
    ? `1px solid ${DS.borderFocus}`
    : `1px solid ${DS.borderDefault}`;

  return (
    <div
      style={{
        height:       40,
        padding:      '0 12px',
        borderRadius: 6,
        border,
        background:   disabled ? DS.actionDisabledBg : DS.bgSurface,
        display:      'flex',
        alignItems:   'center',
        gap:          8,
        transition:   'border-color 0.15s ease',
        ...styleProp,
      }}
    >
      {/* Leading search icon — textSecondary */}
      <Ico.Search s={16} c={focused ? DS.actionPrimary : DS.textSecondary} />

      <input
        value={value ?? ''}
        onChange={disabled ? undefined : onChange}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => !disabled && setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          flex:       1,
          border:     'none',
          background: 'transparent',
          outline:    'none',
          fontFamily: DS.ff,
          ...TY.b2,
          color:      value ? DS.textDefault : DS.textPlaceholder,
          cursor:     disabled ? 'not-allowed' : 'text',
        }}
        {...rest}
      />
    </div>
  );
}

// ─── TextArea ─────────────────────────────────────────────────────────────────
export function TextArea({
  label,
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  rows     = 4,
  style: styleProp,
  ...rest
}) {
  const [focused, setFocused] = React.useState(false);

  // Reuse the same colour logic but override height
  const base = inputStyle({ focused, error, disabled, value });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, ...styleProp }}>
      {label && (
        <span style={{ fontFamily: DS.ff, ...TY.b2, color: DS.textSecondary }}>
          {label}
        </span>
      )}

      <textarea
        rows={rows}
        value={value ?? ''}
        onChange={disabled ? undefined : onChange}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => !disabled && setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...base,
          height:   'auto',     // override fixed height
          minHeight: 120,
          padding:  '8px 12px',
          resize:   'vertical',
        }}
        {...rest}
      />

      {error && !disabled && (
        <span style={{ fontFamily: DS.ff, ...TY.b3, color: DS.feedbackError, marginTop: -4 }}>
          {error}
        </span>
      )}
    </div>
  );
}

export default Field;