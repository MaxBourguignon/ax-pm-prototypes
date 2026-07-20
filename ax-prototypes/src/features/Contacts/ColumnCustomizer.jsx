import { useState, useRef, useEffect } from "react";
import { DS } from "../../utils/designSystem";
import Ico from "../../utils/icons";
import { Btn } from "../../components/Btn";

// Bigger drag handle — two columns of dots
const GripIcon = ({ s = 20, c = DS.neutral500 }) => (
  <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
    <circle cx="7.5" cy="5"  r="1.6" fill={c} /><circle cx="12.5" cy="5"  r="1.6" fill={c} />
    <circle cx="7.5" cy="10" r="1.6" fill={c} /><circle cx="12.5" cy="10" r="1.6" fill={c} />
    <circle cx="7.5" cy="15" r="1.6" fill={c} /><circle cx="12.5" cy="15" r="1.6" fill={c} />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// COLUMN CUSTOMIZER — toggle visibility + reorder the table columns.
// Controlled: `config` is an ordered [{ key, visible }] list, `onChange` returns
// the next config. `allColumns` provides the display labels by key.
// ─────────────────────────────────────────────────────────────────────────────

export default function ColumnCustomizer({ config, allColumns, defaultConfig, onChange }) {
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
      <Btn type="Secondary" iconLeft={<Ico.Settings />} onClick={() => setOpen((o) => !o)}>
        Configure columns
      </Btn>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 9999,
          width: 300, background: DS.white, border: `1px solid ${DS.neutral200}`,
          borderRadius: 8, boxShadow: "0 12px 32px rgba(15,23,42,.16)",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{ padding: "12px 14px", borderBottom: `1px solid ${DS.neutral200}` }}>
            <p style={{ margin: 0, fontFamily: DS.ff, fontSize: 13, fontWeight: 600, color: DS.neutral900 }}>Configure columns</p>
            <p style={{ margin: "2px 0 0", fontFamily: DS.ff, fontSize: 11, color: DS.neutral500 }}>Toggle visibility and reorder columns</p>
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
                    background: dragging ? DS.neutral100 : "transparent",
                    borderTop:    `2px solid ${isOver && dir === "up"   ? DS.blue500 : "transparent"}`,
                    borderBottom: `2px solid ${isOver && dir === "down" ? DS.blue500 : "transparent"}`,
                  }}>
                  {/* Drag handle */}
                  <span style={{ display: "flex", flexShrink: 0, cursor: "grab" }}>
                    <GripIcon s={20} c={DS.neutral500} />
                  </span>

                  {/* Visibility checkbox */}
                  <div onClick={() => toggle(c.key)}
                    style={{
                      width: 16, height: 16, borderRadius: 4, flexShrink: 0, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: `1px solid ${c.visible ? DS.blue500 : DS.neutral500}`,
                      background: c.visible ? DS.blue500 : DS.white,
                    }}>
                    {c.visible && <Ico.Check s={10} c={DS.white} />}
                  </div>

                  <span style={{ flex: 1, fontFamily: DS.ff, fontSize: 13, color: c.visible ? DS.neutral900 : DS.neutral500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {labelOf(c.key)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{ padding: "10px 14px", borderTop: `1px solid ${DS.neutral200}`, background: DS.neutral100, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span
              onClick={() => onChange(defaultConfig.map((c) => ({ ...c })))}
              style={{ fontFamily: DS.ff, fontSize: 12, fontWeight: 500, color: DS.blue500, cursor: "pointer" }}>
              Reset to default
            </span>
            <span style={{ fontFamily: DS.ff, fontSize: 11, color: DS.neutral500 }}>{visibleCount} shown</span>
          </div>
        </div>
      )}
    </div>
  );
}
