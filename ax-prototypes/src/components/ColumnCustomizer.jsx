import { useState, useRef, useEffect } from "react";
import { DS, TY } from "../utils/designSystem";
import Ico from "../utils/icons";
import { Btn } from "./Btn";
import { ModalHeader } from "./Modal";

// Drag handle — two bars, as on the official column-configuration panel.
const GripIcon = ({ s = 20, c = DS.textMuted }) => (
  <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
    <rect x="3" y="6.5" width="14" height="2" rx="1" fill={c} />
    <rect x="3" y="11.5" width="14" height="2" rx="1" fill={c} />
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
// Panel: the official modal header (ModalHeader — Gradient/Brand, title +
// subtitle, framed close) in its compact size, then one 36px row per column split by hairlines
// (grip · checkbox · label), and a footer with Reset + the shown count.
// A column flagged `locked` in allColumns (the identity column) stays shown
// and in place: greyed checkbox, no drag.
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
    const k = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", h);
    document.addEventListener("keydown", k);
    return () => { document.removeEventListener("mousedown", h); document.removeEventListener("keydown", k); };
  }, [open]);

  const labelOf = (key) => allColumns.find((c) => c.key === key)?.label ?? key;
  const visibleCount = config.filter((c) => c.visible).length;

  const isLocked = (key) => !!allColumns.find((c) => c.key === key)?.locked;
  const toggle = (key) => {
    if (isLocked(key)) return;
    onChange(config.map((c) => (c.key === key ? { ...c, visible: !c.visible } : c)));
  };

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
          width: 272, background: DS.surfaceCanvas, borderRadius: DS.radiusLg,
          boxShadow: "0 18px 50px rgba(15,23,42,.22)",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}>
          <ModalHeader compact title={label} subtitle="Show, hide and reorder columns" onClose={() => setOpen(false)} />

          {/* List — drag rows to reorder */}
          <div style={{ maxHeight: 288, overflowY: "auto" }}>
            {config.map((c, i) => {
              const locked   = isLocked(c.key);
              const dragging = dragIndex === i;
              const isOver   = overIndex === i && dragIndex !== null && dragIndex !== i;
              const dir      = dragIndex !== null ? (dragIndex < i ? "down" : "up") : null;
              return (
                <div key={c.key}
                  draggable={!locked}
                  onDragStart={(e) => { setDragIndex(i); e.dataTransfer.effectAllowed = "move"; }}
                  onDragOver={(e) => { if (!locked) { e.preventDefault(); setOverIndex(i); } }}
                  onDrop={(e) => { e.preventDefault(); reorder(dragIndex, i); clearDrag(); }}
                  onDragEnd={clearDrag}
                  onClick={() => toggle(c.key)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "0 14px", height: 36,
                    boxSizing: "border-box", cursor: locked ? "default" : "pointer",
                    opacity: dragging ? 0.4 : 1,
                    background: dragging ? DS.surfaceSubtle : "transparent",
                    borderTop: i === 0 ? "none" : `1px solid ${isOver && dir === "up" ? DS.actionPrimary : DS.borderDivider}`,
                    boxShadow: isOver && dir === "down" ? `inset 0 -2px 0 ${DS.actionPrimary}` : "none",
                  }}>
                  {/* Drag handle */}
                  <span style={{ display: "flex", flexShrink: 0, cursor: locked ? "default" : "grab" }}>
                    <GripIcon s={16} c={locked ? DS.borderDefault : DS.textMuted} />
                  </span>

                  {/* Visibility checkbox */}
                  <span style={{
                    width: 16, height: 16, borderRadius: DS.radiusMd, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box",
                    border: `1.5px solid ${locked ? DS.borderDefault : c.visible ? DS.actionPrimary : DS.borderDefault}`,
                    background: locked ? DS.surfaceSubtle : c.visible ? DS.actionPrimary : DS.surfaceCanvas,
                  }}>
                    {c.visible && <Ico.Check s={12} c={locked ? DS.textMuted : DS.textOnBrand} />}
                  </span>

                  <span style={{ flex: 1, fontFamily: DS.ff, ...TY.bodySm, color: locked ? DS.textMuted : DS.textDefault, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {labelOf(c.key)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{ padding: "10px 14px", borderTop: `1px solid ${DS.borderDivider}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <button type="button"
              onClick={() => onChange(defaultConfig.map((c) => ({ ...c })))}
              style={{ border: "none", background: "transparent", padding: 0, cursor: "pointer", fontFamily: DS.ff, ...TY.labelMd, fontWeight: 600, color: DS.actionPrimary }}>
              Reset
            </button>
            <span style={{ fontFamily: DS.ff, ...TY.labelMd, fontWeight: 400, color: DS.textMuted }}>{visibleCount} shown</span>
          </div>
        </div>
      )}
    </div>
  );
}
