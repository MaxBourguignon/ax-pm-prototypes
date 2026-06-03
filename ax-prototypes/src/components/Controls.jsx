/**
 * AX Design System — Select controls
 * Figma node 196:1311 — https://www.figma.com/design/NUOoC3GC7mB4U1AydRKIoy/AX-DESIGN-SYSTEM--NEW-?node-id=196-1311
 *
 * Exports:
 *   Checkbox  — 16×16, borderRadius 4
 *   Radio     — 16×16, borderRadius 50%
 *   Toggle    — 32×18, borderRadius 100
 *
 * All controls accept:
 *   checked / on  boolean
 *   onChange       (value: boolean) => void
 *   label          string | ReactNode
 *   disabled       boolean
 *
 * Usage:
 *   <Checkbox checked={v} onChange={setV} label="Double opt-in" />
 *   <Radio checked={v} onChange={setV} label="Email" />
 *   <Toggle on={v} onChange={setV} label="Activé" />
 */

import React from 'react';
import { DS, TY } from '../utils/designSystem';
import  Ico  from '../utils/icons';

// ─── Shared label wrapper ─────────────────────────────────────────────────────
function ControlLabel({ disabled, children }) {
  return (
    <label
      style={{
        display:    'inline-flex',
        alignItems: 'center',
        gap:        8,
        cursor:     disabled ? 'not-allowed' : 'pointer',
        opacity:    disabled ? 0.5 : 1,
        fontFamily: DS.ff,
        ...TY.b2,
        color:      DS.textDefault,
        userSelect: 'none',
      }}
    >
      {children}
    </label>
  );
}

// ─── Checkbox ─────────────────────────────────────────────────────────────────
// 16×16, borderRadius 4
// Default: bg bgCard, border textSecondary
// Checked: bg actionPrimary, border actionPrimary, white check icon
export function Checkbox({ checked = false, onChange, label, disabled = false }) {
  return (
    <ControlLabel disabled={disabled}>
      {/* Visual control */}
      <span
        style={{
          width:          16,
          height:         16,
          flexShrink:     0,
          borderRadius:   4,
          border:         `1px solid ${checked ? DS.actionPrimary : DS.textSecondary}`,
          background:     checked ? DS.actionPrimary : DS.bgCard,
          display:        'inline-flex',
          alignItems:     'center',
          justifyContent: 'center',
          transition:     'background 0.12s ease, border-color 0.12s ease',
        }}
      >
        {checked && <Ico.Check s={11} c={DS.textInverse} />}
      </span>

      {/* Hidden native input — keeps form semantics */}
      <input
        type="checkbox"
        checked={!!checked}
        disabled={disabled}
        onChange={(e) => !disabled && onChange && onChange(e.target.checked)}
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
      />

      {label}
    </ControlLabel>
  );
}

// ─── Radio ────────────────────────────────────────────────────────────────────
// 16×16, borderRadius 50%
// Default: bg bgCard, border textSecondary
// Checked: blue outer ring, white fill, blue 8×8 inner dot
export function Radio({ checked = false, onChange, label, disabled = false, name, value }) {
  return (
    <ControlLabel disabled={disabled}>
      {/* Visual control */}
      <span
        style={{
          width:          16,
          height:         16,
          flexShrink:     0,
          borderRadius:   '50%',
          border:         `1px solid ${checked ? DS.actionPrimary : DS.textSecondary}`,
          background:     DS.bgCard,
          display:        'inline-flex',
          alignItems:     'center',
          justifyContent: 'center',
          transition:     'border-color 0.12s ease',
        }}
      >
        {checked && (
          <span
            style={{
              width:        8,
              height:       8,
              borderRadius: '50%',
              background:   DS.actionPrimary,
            }}
          />
        )}
      </span>

      <input
        type="radio"
        name={name}
        value={value}
        checked={!!checked}
        disabled={disabled}
        onChange={(e) => !disabled && onChange && onChange(e.target.checked)}
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
      />

      {label}
    </ControlLabel>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
// 32×18 track, borderRadius 100
// Off: bg bgCard, border neutralLGrey, neutral dot
// On:  bg actionPrimary, border actionPrimary, white dot
export function Toggle({ on = false, onChange, label, disabled = false }) {
  return (
    <ControlLabel disabled={disabled}>
      {/* Track */}
      <span
        onClick={() => !disabled && onChange && onChange(!on)}
        style={{
          width:          32,
          height:         18,
          flexShrink:     0,
          borderRadius:   100,
          border:         `1px solid ${on ? DS.actionPrimary : DS.neutralLGrey}`,
          background:     on ? DS.actionPrimary : DS.bgCard,
          padding:        2,
          display:        'inline-flex',
          alignItems:     'center',
          justifyContent: on ? 'flex-end' : 'flex-start',
          boxSizing:      'border-box',
          transition:     'background 0.15s ease, border-color 0.15s ease',
          cursor:         disabled ? 'not-allowed' : 'pointer',
        }}
      >
        {/* Thumb */}
        <span
          style={{
            width:        12,
            height:       12,
            borderRadius: '50%',
            background:   on ? DS.textInverse : DS.textSecondary,
            transition:   'background 0.15s ease',
            flexShrink:   0,
          }}
        />
      </span>

      {label}
    </ControlLabel>
  );
}