import { useState, useRef, useEffect } from "react";
import { DS, TY } from "../utils/designSystem";
import Ico from "../utils/icons";
import { Btn } from "./Btn";

// Bigger drag handle — two columns of dots
const GripIcon = ({ s = 20, c = DS.textMuted }) => (
  <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
    <circle cx="7.5" cy="5"  r="1.6" fill={c} /><circle cx="12.5" cy="5"  r="1.6" fill={c} />
    <circle cx="7.5" cy="10" r="1.6" fill={c} /><circle cx="12.5" cy="10" r="1.6" fill={c} />
    <circle cx="7.5" cy="15" r="1.6" fill={c} /><circle cx="12.5" cy="15" r="1.6" fill={c} />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// COLUMN CUSTOMIZER — toggle visibility + reorder the table columns.
// Lives here (was features/Contacts/) because more than one feature now feeds it
// to the shared Table's `toolbar.columnConfig` slot.
// Controlled: `config` is an ordered [{ key, visible }] list, `onChange` returns
// the next config. `allColumns` provides the display labels by key.
//
// `label` overrides the trigger button's text — the Contacts table says
// "Configure columns"; a per-tab customiser can say which tab it configures.
//
// No DS node: the DS has a TableToolbar slot for a column-config button but no
// spec for the panel behind it. Panel chrome follows the DS menu surface
// (surfaceCanvas, borderSection, radiusLg) and the type scale; the drag-reorder
// interaction is codebase-only.
// ─────────────────────────────────────────────────────────────────────────────

export default function ColumnCustomizer({ config, allColumns, defaultConfig, onChange, label = "Configure columns" }) {
  // The DS `Btn / Configure columns` (1041:17990) carries the sliders glyph in
  // brand blue. Blue reads as ACTIVE here — the table is not showing its default
  // columns — so a standard config keeps the neutral icon and only a customised
  // one turns blue, which is what makes the state worth colouring at all.
  const customized = defaultConfig
    ? JSON.stringify(config) !== JSON.stringify(defaultConfig)
    : false;
  const [open,      setOpen]      = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const ref = useRef();

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const labelOf = (key) => allColumns.find((c) => c.key === key)?.label ?? key;
  const visibleCount = config.filter((c) => c.visible).length;

  const toggle = (key) =>
    onChange(config.map((c) => (c.key === key ? { ...c, visible: !c.visible } : c)));

  // Drag to reorder: dropping onto row `to` lands the item at that slot
  // (below it when dragging down, above it when dragging up).
  const reorder = (from, to) => {
    if (from == null || to == null || from === to) return;
    const next = [...config];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };
  const clearDrag = () => { setDragIndex(null); setOverIndex(null); };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <Btn
        type="Secondary"
        iconLeft={<Ico.Sliders s={16} c={customized ? DS.actionPrimary : DS.textSecondary} />}
        onClick={() => setOpen((o) => !o)}
      >
        {label}
      </Btn>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 9999,
          width: 300, background: DS.surfaceCanvas, border: `1px solid ${DS.borderSection}`,
          borderRadius: DS.radiusLg, boxShadow: "0 12px 32px rgba(15,23,42,.16)",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{ padding: "12px 14px", borderBottom: `1px solid ${DS.borderDivider}` }}>
            <p style={{ margin: 0, fontFamily: DS.ff, ...TY.bodySmBold, color: DS.textStrong }}>{label}</p>
            <p style={{ margin: "2px 0 0", fontFamily: DS.ff, ...TY.captionSm, color: DS.textMuted }}>Toggle visibility and reorder columns</p>
          </div>

          {/* List — drag rows to reorder */}
          <div style={{ maxHeight: 300, overflowY: "auto", padding: "6px 0" }}>
            {config.map((c, i) => {
              const dragging = dragIndex === i;
              const isOver   = overIndex === i && dragIndex !== null && dragIndex !== i;
              const dir      = dragIndex !== null ? (dragIndex < i ? "down" : "up") : null;
              return (
                <div key={c.key}
                  draggable
                  onDragStart={(e) => { setDragIndex(i); e.dataTransfer.effectAllowed = "move"; }}
                  onDragOver={(e) => { e.preventDefault(); setOverIndex(i); }}
                  onDrop={(e) => { e.preventDefault(); reorder(dragIndex, i); clearDrag(); }}
                  onDragEnd={clearDrag}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "0 12px", height: 36,
                    cursor: "grab", opacity: dragging ? 0.4 : 1,
                    background: dragging ? DS.surfaceSubtle : "transparent",
                    borderTop:    `2px solid ${isOver && dir === "up"   ? DS.actionPrimary : "transparent"}`,
                    borderBottom: `2px solid ${isOver && dir === "down" ? DS.actionPrimary : "transparent"}`,
                  }}>
                  {/* Drag handle */}
                  <span style={{ display: "flex", flexShrink: 0, cursor: "grab" }}>
                    <GripIcon s={20} c={DS.textMuted} />
                  </span>

                  {/* Visibility checkbox */}
                  <div onClick={() => toggle(c.key)}
                    style={{
                      width: 16, height: 16, borderRadius: DS.radiusSm, flexShrink: 0, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: `1.5px solid ${c.visible ? DS.actionPrimary : DS.borderDefault}`,
                      background: c.visible ? DS.actionPrimary : DS.surfaceCanvas,
                      boxSizing: "border-box",
                    }}>
                    {c.visible && <Ico.Check s={12} c={DS.textOnBrand} />}
                  </div>

                  <span style={{ flex: 1, fontFamily: DS.ff, ...TY.bodySm, color: c.visible ? DS.textStrong : DS.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {labelOf(c.key)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{ padding: "10px 14px", borderTop: `1px solid ${DS.borderDivider}`, background: DS.surfaceSubtle, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span
              onClick={() => onChange(defaultConfig.map((c) => ({ ...c })))}
              style={{ fontFamily: DS.ff, ...TY.labelMd, color: DS.actionPrimary, cursor: "pointer" }}>
              Reset to default
            </span>
            <span style={{ fontFamily: DS.ff, ...TY.captionSm, color: DS.textMuted }}>{visibleCount} shown</span>
          </div>
        </div>
      )}
    </div>
  );
}
