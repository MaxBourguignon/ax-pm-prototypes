import { DS, TY } from "../utils/designSystem";

// ─────────────────────────────────────────────────────────────────────────────
// ConfirmSummaryCard — a preview of the object a modal is about to create.
//
// Replaces the label/value "receipt" table on confirmation steps. Instead of
// re-listing form fields, it renders the thing itself the way it will appear
// once it exists: an identity icon tile, a name headline, a muted sub-line, an
// optional badge, one hero metric, and an optional footnote.
//
// Shared across the Contacts create/confirm modals so they speak one language.
//
// Props:
//   icon      {node}    — glyph shown in the tinted identity tile (already coloured)
//   accent    {object}  — { bg, fg } for the icon tile (defaults to the blue accent)
//   title       {string}  — the object's name (hero line)
//   subtitle    {node}    — muted line under the title (e.g. folder / path)
//   badge       {node}    — optional pill on the right of the title row (e.g. type)
//   description {string}  — optional free-text blurb shown under the identity row
//   metric      {object}  — optional hero figure { value, label }
//   note        {object}  — optional footnote { icon, text }
// ─────────────────────────────────────────────────────────────────────────────

export default function ConfirmSummaryCard({
  icon,
  accent = { bg: DS.blue100, fg: DS.actionPrimary },
  title,
  subtitle,
  badge,
  description,
  metric,
  note,
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{
        background: DS.bgCard,
        border: `1px solid ${DS.borderDefault}`,
        borderRadius: DS.radiusCard,
        padding: "18px 18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}>
        {/* Identity row — icon tile + name + badge */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 13 }}>
          {icon && (
            <div style={{
              width: 40, height: 40, borderRadius: 9, flexShrink: 0,
              background: accent.bg, display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {icon}
            </div>
          )}
          <div style={{ minWidth: 0, flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{
                ...TY.b1, fontWeight: 600, color: DS.textDefault, fontFamily: DS.ff,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0,
              }}>
                {title}
              </span>
              {badge && <div style={{ flexShrink: 0 }}>{badge}</div>}
            </div>
            {subtitle && (
              <span style={{ ...TY.b3, color: DS.textSecondary, fontFamily: DS.ff }}>
                {subtitle}
              </span>
            )}
          </div>
        </div>

        {/* Description — the user's own words about this object */}
        {description && (
          <p style={{
            ...TY.b2, color: DS.textDefault, fontFamily: DS.ff, margin: 0,
            lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word",
          }}>
            {description}
          </p>
        )}

        {/* Hero metric — the one number that matters */}
        {metric && (
          <div style={{
            borderTop: `1px solid ${DS.borderDefault}`, paddingTop: 14,
            display: "flex", alignItems: "baseline", gap: 8,
          }}>
            <span style={{ ...TY.h3, color: DS.textDefault, fontFamily: DS.ff, lineHeight: 1 }}>
              {metric.value}
            </span>
            <span style={{ ...TY.b3, color: DS.textSecondary, fontFamily: DS.ff }}>
              {metric.label}
            </span>
          </div>
        )}
      </div>

      {/* Footnote — plain-language consequence of the choice */}
      {note && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "0 2px" }}>
          {note.icon && <div style={{ flexShrink: 0, marginTop: 1 }}>{note.icon}</div>}
          <span style={{ ...TY.b3, color: DS.textSecondary, fontFamily: DS.ff, lineHeight: 1.45 }}>
            {note.text}
          </span>
        </div>
      )}
    </div>
  );
}
