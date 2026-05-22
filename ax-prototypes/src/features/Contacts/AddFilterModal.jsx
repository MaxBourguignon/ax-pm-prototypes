import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

import DS from "../../utils/designSystem";
import Ico from "../../utils/icons";
import USE_CASES from "../../utils/useCases";

// ─── DATA OBJECTS ─────────────────────────────────────────────────────────────
const DATA_OBJECTS = [
    { id: "contact",       label: "Contacts",         description: "Filter contacts by their profile attributes",                          color: DS.blue500,    bg: DS.blue100    },
    { id: "consumptions",  label: "Purchase summary",  description: "Filter by number of purchases or total spending, across all channels", color: DS.neutral600, bg: DS.neutral100 },
    { id: "ticket",        label: "Ticketing",         description: "Filter by tickets, representations or purchases — event, type or date",color: DS.indigoBrand,  bg: DS.blue100  },
    { id: "order",         label: "E-commerce",        description: "Filter by individual products — item, category, or order status",      color: DS.green500,    bg: DS.green100    },
    { id: "subscription",  label: "Subscriptions",     description: "Filter contacts who have or had a subscription",                       color: DS.orange,  bg: "#FFF1E0"  },
    { id: "campaign",      label: "Campaigns",         description: "Filter contacts who received or interacted with a campaign",           color: DS.indigoGrad,   bg: DS.blue200   },
    { id: "consent",       label: "Consents",          description: "Filter contacts by consent status",                                    color: DS.coral,    bg: DS.dangerBg    },
    { id: "accessControl", label: "Access control",    description: "Filter contacts by event attendance",                                  color: DS.greenBrand,  bg: DS.green200  },
];

const OBJECT_GROUPS = [
    { id: "profile",    label: null,         objects: ["contact"] },
    { id: "purchases",  label: "Purchases",  objects: ["consumptions", "ticket", "order", "subscription", "accessControl"] },
    { id: "engagement", label: "Engagement", objects: ["campaign", "consent"] },
];


// ─── ICON MAP ─────────────────────────────────────────────────────────────────
const ObjIcon = ({ id, s = 14, c }) => {
    const obj = DATA_OBJECTS.find(o => o.id === id);
    const col = c || obj?.color || DS.blue500;
    const map = {
        contact:       <Ico.User          s={s} c={col} />,
        ticket:        <Ico.Ticket        s={s} c={col} />,
        order:         <Ico.Cart          s={s} c={col} />,
        subscription:  <Ico.Subscriptions s={s} c={col} />,
        campaign:      <Ico.Mail          s={s} c={col} />,
        consumptions:  <Ico.Card          s={s} c={col} />,
        consent:       <Ico.Eye           s={s} c={col} />,
        accessControl: <Ico.AccessControl s={s} c={col} />,
    };
    return map[id] ?? <Ico.User s={s} c={col} />;
};

// ─── MODAL ────────────────────────────────────────────────────────────────────
export default function AddFilterModal({ open, onClose, onSelect }) {
    const [step,        setStep]        = useState("object");
    const [selectedObj, setSelectedObj] = useState(null);
    const [hoveredObj,  setHoveredObj]  = useState(null);
    const [hoveredCase, setHoveredCase] = useState(null);

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
        if (selectedObj === "consumptions") return "Counts purchases — use Ticketing or E-commerce to filter by specific items";
        if (selectedObj === "ticket")       return "Choose the level: representation, ticket, or purchase";
        if (selectedObj === "order")        return "Counts individual product lines — use Purchase summary to filter by number of purchases";
        return "The filter will be pre-configured — you can refine it afterwards";
    };

    return createPortal(
        <>
            <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.20)", zIndex: 2000 }} />

            <div style={{
                position: "fixed", top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 2001, width: 520,
                background: DS.white,
                border: `1px solid ${DS.neutral200}`,
                borderRadius: 8,
                boxShadow: "0 4px 16px rgba(15,23,42,.10)",
                overflow: "hidden", display: "flex", flexDirection: "column",
                maxHeight: "80vh",
            }}>

                {/* Header */}
                <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "12px 16px", borderBottom: `1px solid ${DS.neutral200}`,
                    flexShrink: 0,
                }}>
                    {step === "usecase" && (
                        <button onClick={handleBack} style={{
                            width: 28, height: 28, borderRadius: 4, background: DS.white,
                            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0, transition: "background .12s", border: "none",
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = DS.neutral100}
                            onMouseLeave={e => e.currentTarget.style.background = DS.white}
                        >
                            <Ico.ChevL s={13} c={DS.neutral900} />
                        </button>
                    )}

                    {step === "usecase" && currentObj && (
                        <div style={{
                            width: 28, height: 28, borderRadius: 5, flexShrink: 0,
                            background: currentObj.bg,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <ObjIcon id={currentObj.id} s={13} c={currentObj.color} />
                        </div>
                    )}

                    <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontFamily: DS.ff, fontSize: 14, fontWeight: 600, lineHeight: "18px", color: DS.neutral900 }}>
                            {step === "object" ? "Add a filter" : currentObj?.label}
                        </p>
                        <p style={{ margin: "1px 0 0", fontFamily: DS.ff, fontSize: 11, lineHeight: "14px", color: DS.neutral500 }}>
                            {step === "object" ? "Select an object to view available use cases" : step2Subtitle()}
                        </p>
                    </div>

                    <button onClick={onClose} style={{
                        width: 28, height: 28, borderRadius: 4, border: "none",
                        background: "transparent", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}
                        onMouseEnter={e => e.currentTarget.style.background = DS.neutral100}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                        <Ico.Cross s={16} c={DS.neutral500} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ overflowY: "auto", flex: 1, padding: "8px 0" }}>

                    {/* Step 1 — object list */}
                    {step === "object" && OBJECT_GROUPS.map((group, gi) => {
                        const groupObjs = group.objects
                            .map(id => DATA_OBJECTS.find(o => o.id === id))
                            .filter(Boolean);
                        return (
                            <div key={group.id}>
                                {gi > 0 && (
                                    <div style={{ padding: "10px 16px 4px" }}>
                                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", color: DS.neutral500, fontFamily: DS.ff, textTransform: "uppercase" }}>
                                            {group.label}
                                        </span>
                                    </div>
                                )}

                                {groupObjs.map((obj) => {
                                    const isHov      = hoveredObj === obj.id;
                                    const isOverview = obj.id === "consumptions";
                                    return (
                                        <div key={obj.id}
                                            onClick={() => handleSelectObj(obj.id)}
                                            onMouseEnter={() => setHoveredObj(obj.id)}
                                            onMouseLeave={() => setHoveredObj(null)}
                                            style={{
                                                display: "flex", alignItems: "center", gap: 12,
                                                minHeight: isOverview ? 56 : 48, padding: "0 16px",
                                                background: isHov ? DS.neutral100 : DS.white,
                                                cursor: "pointer", transition: "background .1s",
                                                borderBottom: isOverview ? `1px solid ${DS.neutral200}` : "none",
                                            }}
                                        >
                                            <div style={{ width: 32, height: 32, borderRadius: 6, flexShrink: 0, background: obj.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                <ObjIcon id={obj.id} s={15} c={obj.color} />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                    <p style={{ margin: 0, fontFamily: DS.ff, fontSize: 13, fontWeight: 500, lineHeight: "16px", color: DS.neutral800 }}>
                                                        {obj.label}
                                                    </p>
                                                    {isOverview && (
                                                        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".06em", color: DS.neutral500, background: DS.neutral200, padding: "1px 5px", borderRadius: 3, fontFamily: DS.ff, textTransform: "uppercase" }}>
                                                            All channels
                                                        </span>
                                                    )}
                                                </div>
                                                <p style={{ margin: "2px 0 0", fontFamily: DS.ff, fontSize: 11, fontWeight: 400, lineHeight: "14px", color: DS.neutral500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                    {obj.description}
                                                </p>
                                            </div>
                                            <Ico.ChevRight s={14} c={isHov ? DS.neutral900 : DS.neutral200} />
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}

                    {/* Step 2 — use case list */}
                    {step === "usecase" && useCases.map(uc => {
                        const isHov = hoveredCase === uc.id;
                        return (
                            <div key={uc.id}
                                onClick={() => handleSelectCase(uc)}
                                onMouseEnter={() => setHoveredCase(uc.id)}
                                onMouseLeave={() => setHoveredCase(null)}
                                style={{
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                    minHeight: 40, padding: uc.hint ? "8px 16px" : "0 16px",
                                    background: isHov ? DS.neutral100 : DS.white,
                                    cursor: "pointer", transition: "background .08s",
                                }}
                            >
                                <div>
                                    <p style={{ margin: 0, fontFamily: DS.ff, fontSize: 12, fontWeight: 400, lineHeight: "16px", color: DS.neutral800 }}>
                                        {uc.label}
                                    </p>
                                    {uc.hint && (
                                        <p style={{ margin: "2px 0 0", fontFamily: DS.ff, fontSize: 10, lineHeight: "13px", color: DS.neutral500 }}>
                                            {uc.hint}
                                        </p>
                                    )}
                                </div>
                                <Ico.ChevRight s={14} c={isHov ? DS.neutral900 : DS.neutral200} />
                            </div>
                        );
                    })}
                </div>
            </div>
        </>,
        document.body
    );
}