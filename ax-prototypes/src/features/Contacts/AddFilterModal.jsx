import { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import { Badge } from "../../components/Tag";

import {DS, TY} from "../../utils/designSystem";
import Ico from "../../utils/icons";
import USE_CASES from "../../utils/useCases";
// Single source of truth for the eight filter objects — the same catalog the
// segmentation builder reads, so the picker and the builder can never disagree
// on an object's identity or its colour.
import DATA_OBJECTS from "../../utils/dataObject";

const OBJECT_GROUPS = [
    { id: "profile",    label: null,         objects: ["contact"] },
    { id: "purchases",  label: "Purchases",  objects: ["consumptions", "ticket", "order", "registration", "subscription", "accessControl"] },
    { id: "engagement", label: "Engagement", objects: ["campaign", "consent"] },
];


// ─── ICON MAP ─────────────────────────────────────────────────────────────────
const ObjIcon = ({ id, s = 14, c }) => {
    const obj = DATA_OBJECTS.find(o => o.id === id);
    const col = c || obj?.text || DS.actionPrimary;
    const map = {
        contact:       <Ico.User          s={s} c={col} />,
        ticket:        <Ico.Ticket        s={s} c={col} />,
        order:         <Ico.Cart          s={s} c={col} />,
        subscription:  <Ico.Subscriptions s={s} c={col} />,
        registration:  <Ico.Calendar      s={s} c={col} />,
        campaign:      <Ico.Mail          s={s} c={col} />,
        consumptions:  <Ico.Card          s={s} c={col} />,
        consent:       <Ico.Eye           s={s} c={col} />,
        accessControl: <Ico.AccessControl s={s} c={col} />,
    };
    return map[id] ?? <Ico.User s={s} c={col} />;
};

// ─── ROWS ─────────────────────────────────────────────────────────────────────
// One clickable row per object or use case: navy title, secondary description,
// chevron on the right; hover lays the brand tint.
function Row({ icon, title, badge, description, onClick }) {
    const [hov, setHov] = useState(false);
    return (
        <button type="button" onClick={onClick}
            onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
            style={{
                width: "100%", boxSizing: "border-box", border: "none", textAlign: "left",
                display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                borderRadius: DS.radiusLg, cursor: "pointer", fontFamily: DS.ff,
                background: hov ? DS.brandPrimarySubtle : "transparent", transition: "background .12s",
            }}
        >
            {icon}
            <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ ...TY.bodyMdBold, color: DS.textStrong }}>{title}</span>
                    {badge}
                </span>
                {description && <span style={{ ...TY.bodySm, color: DS.textSecondary }}>{description}</span>}
            </span>
            <Ico.ArrowRightSmall s={16} c={hov ? DS.actionPrimary : DS.textDisabled} />
        </button>
    );
}

const SectionLabel = ({ children }) => (
    <div style={{ padding: "12px 12px 4px" }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", color: DS.textSecondary, fontFamily: DS.ff }}>
            {children}
        </span>
    </div>
);

const ObjTile = ({ obj }) => (
    <span style={{ width: 36, height: 36, flexShrink: 0, borderRadius: DS.radiusMd, background: obj.surface, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ObjIcon id={obj.id} s={18} c={obj.text} />
    </span>
);

// White chevron on the gradient header — same unframed treatment as the close
// cross (white wash on hover only).
function BackButton({ onClick }) {
    const [hov, setHov] = useState(false);
    return (
        <button type="button" aria-label="Back" onClick={onClick}
            onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
            style={{
                width: 32, height: 32, flexShrink: 0, borderRadius: DS.radiusLg, border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", marginLeft: -6,
                background: hov ? "rgba(255,255,255,0.2)" : "transparent", transition: "background .15s",
            }}
        >
            <Ico.ArrowLeftSmall s={18} c={DS.textInverse} />
        </button>
    );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
// The shared centre Modal: gradient header (title + subtitle + close), scrim,
// Escape. Step 2 swaps the title for the object, with a back chevron and the
// object tile leading the header.
export default function AddFilterModal({ open, onClose, onSelect }) {
    const [step,        setStep]        = useState("object");
    const [selectedObj, setSelectedObj] = useState(null);

    useEffect(() => {
        if (open) { setStep("object"); setSelectedObj(null); }
    }, [open]);

    if (!open) return null;

    const handleSelectObj  = (id) => { setSelectedObj(id); setStep("usecase"); };
    const handleBack       = ()   => { setStep("object"); setSelectedObj(null); };
    const handleSelectCase = (uc) => { onSelect(uc); onClose(); };

    const currentObj = DATA_OBJECTS.find(o => o.id === selectedObj);
    const useCases   = selectedObj ? (USE_CASES[selectedObj] ?? []) : [];

    const step2Subtitle = () => {
        if (selectedObj === "consumptions") return "Counts orders across all channels — use an activity to filter by specific items";
        if (selectedObj === "ticket")       return "Choose the level: representation, ticket, or purchase";
        if (selectedObj === "subscription") return "Choose the level: subscription or purchase — you can refine it afterwards";
        if (selectedObj === "registration") return "Choose the level: registration or activity — you can refine it afterwards";
        if (selectedObj === "order")        return "Counts individual product lines — use All purchases to filter by number of orders";
        return "The filter will be pre-configured — you can refine it afterwards";
    };

    return (
        <Modal open={open} onClose={onClose} variant="center" width={560}
            title={step === "object" ? "Add a filter" : currentObj?.label}
            subtitle={step === "object" ? "Select an object to view available use cases" : step2Subtitle()}
            headerLeading={step === "usecase" && currentObj ? (
                <>
                    <BackButton onClick={handleBack} />
                    <ObjTile obj={currentObj} />
                </>
            ) : null}
        >
            <div style={{ padding: "8px 8px 12px" }}>
                {/* Step 1 — object list */}
                {step === "object" && OBJECT_GROUPS.map((group) => (
                    <div key={group.id}>
                        {group.label && <SectionLabel>{group.label}</SectionLabel>}
                        {group.objects.map(id => DATA_OBJECTS.find(o => o.id === id)).filter(Boolean).map((obj) => (
                            <Row key={obj.id} onClick={() => handleSelectObj(obj.id)}
                                icon={<ObjTile obj={obj} />}
                                title={obj.label}
                                badge={obj.id === "consumptions" ? <Badge tone="neutral">All channels</Badge> : null}
                                description={obj.description}
                            />
                        ))}
                    </div>
                ))}

                {/* Step 2 — use case list */}
                {step === "usecase" && useCases.map(uc => (
                    <Row key={uc.id} onClick={() => handleSelectCase(uc)} title={uc.label} description={uc.hint} />
                ))}
            </div>
        </Modal>
    );
}
