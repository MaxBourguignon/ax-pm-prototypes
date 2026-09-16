import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

import {DS} from "../../utils/designSystem";
import Ico from "../../utils/icons";
import USE_CASES from "../../utils/useCases";

// ─── DATA OBJECTS ─────────────────────────────────────────────────────────────
const DATA_OBJECTS = [
    { id: "contact",       label: "Contacts",         description: "Filter contacts by their profile attributes",                          color: DS.actionPrimary,    bg: DS.blue100    },
    { id: "consumptions",  label: "Purchase summary",  description: "Filter by number of purchases or total spending, across all channels", color: DS.neutral500, bg: DS.neutral200 },
    { id: "ticket",        label: "Ticketing",         description: "Filter by tickets, representations or purchases — event, type or date",color: DS.purple600,  bg: DS.purple100  },
    { id: "order",         label: "E-commerce",        description: "Filter by individual products — item, category, or order status",      color: DS.teal500,    bg: DS.teal100    },
    { id: "subscription",  label: "Subscriptions",     description: "Filter contacts who have or had a subscription",                       color: DS.orange500,  bg: DS.orange100  },
    { id: "campaign",      label: "Campaigns",         description: "Filter contacts who received or interacted with a campaign",           color: DS.amber600,   bg: DS.amber100   },
    { id: "consent",       label: "Consents",          description: "Filter contacts by consent status",                                    color: DS.rose600,    bg: DS.rose100    },
    { id: "accessControl", label: "Access control",    description: "Filter contacts by event attendance",                                  color: DS.indigo800,  bg: DS.indigo100  },
];

const OBJECT_GROUPS = [
    { id: "profile",    label: null,         objects: ["contact"] },
    { id: "purchases",  label: "Purchases",  objects: ["consumptions", "ticket", "order", "subscription", "accessControl"] },
    { id: "engagement", label: "Engagement", objects: ["campaign", "consent"] },
];


// ─── ICON MAP ─────────────────────────────────────────────────────────────────
const ObjIcon = ({ id, s = 14, c }) => {
    const obj = DATA_OBJECTS.find(o => o.id === id);
    const col = c || obj?.color || DS.actionPrimary;
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
            <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.28)", zIndex: 2000 }} />

            <div style={{
                position: "fixed", top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 2001, width: 520, maxWidth: "94vw",
                background: DS.white,
                borderRadius: 12,
                boxShadow: "0 20px 60px rgba(15,23,42,.20)",
                overflow: "hidden", display: "flex", flexDirection: "column",
                maxHeight: "86vh",
            }}>

                {/* Header — white, navy title + subtitle */}
                <div style={{
                    display: "flex", alignItems: "flex-start", gap: 10,
                    padding: "14px 18px", borderBottom: `1px solid ${DS.neutral200}`,
                    flexShrink: 0,
                }}>
                    {step === "usecase" && (
                        <button onClick={handleBack} style={{
                            width: 26, height: 26, borderRadius: 6, background: DS.white,
                            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0, transition: "background .12s", border: "none",
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = DS.neutral100}
                            onMouseLeave={e => e.currentTarget.style.background = DS.white}
                        >
                            <Ico.ChevL s={13} c={DS.navy} />
                        </button>
                    )}

                    {step === "usecase" && currentObj && (
                        <div style={{
                            width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                            background: currentObj.bg,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <ObjIcon id={currentObj.id} s={14} c={currentObj.color} />
                        </div>
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontFamily: DS.ff, fontSize: 16, fontWeight: 700, lineHeight: "21px", color: DS.navy }}>
                            {step === "object" ? "Add a filter" : currentObj?.label}
                        </p>
                        <p style={{ margin: "2px 0 0", fontFamily: DS.ff, fontSize: 12, lineHeight: "16px", color: DS.neutral500 }}>
                            {step === "object" ? "Select an object to view available use cases" : step2Subtitle()}
                        </p>
                    </div>

                    <button onClick={onClose} style={{
                        width: 26, height: 26, borderRadius: 6, border: "none",
                        background: "transparent", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}
                        onMouseEnter={e => e.currentTarget.style.background = DS.neutral100}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                        <Ico.Cross s={16} c={DS.neutral700} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ overflowY: "auto", flex: 1, padding: "8px 0 12px" }}>

                    {/* Step 1 — object list */}
                    {step === "object" && OBJECT_GROUPS.map((group, gi) => {
                        const groupObjs = group.objects
                            .map(id => DATA_OBJECTS.find(o => o.id === id))
                            .filter(Boolean);
                        return (
                            <div key={group.id}>
                                {gi > 0 && (
                                    <div style={{ padding: "12px 18px 4px" }}>
                                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".07em", color: DS.neutral500, fontFamily: DS.ff, textTransform: "uppercase" }}>
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
                                                display: "flex", alignItems: "center", gap: 11,
                                                padding: "10px 18px",
                                                background: isHov ? DS.neutral100 : DS.white,
                                                cursor: "pointer", transition: "background .1s",
                                            }}
                                        >
                                            <div style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0, background: obj.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                <ObjIcon id={obj.id} s={16} c={obj.color} />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                                    <p style={{ margin: 0, fontFamily: DS.ff, fontSize: 13, fontWeight: 600, lineHeight: "17px", color: DS.navy }}>
                                                        {obj.label}
                                                    </p>
                                                    {isOverview && (
                                                        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".06em", color: DS.neutral500, background: DS.neutral200, padding: "1px 6px", borderRadius: 4, fontFamily: DS.ff, textTransform: "uppercase" }}>
                                                            All channels
                                                        </span>
                                                    )}
                                                </div>
                                                <p style={{ margin: "2px 0 0", fontFamily: DS.ff, fontSize: 12, fontWeight: 400, lineHeight: "16px", color: DS.neutral500 }}>
                                                    {obj.description}
                                                </p>
                                            </div>
                                            <Ico.ChevRight s={15} c={isHov ? DS.neutral700 : DS.neutral300} />
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
                                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                                    padding: "10px 18px",
                                    background: isHov ? DS.neutral100 : DS.white,
                                    cursor: "pointer", transition: "background .08s",
                                }}
                            >
                                <div style={{ minWidth: 0 }}>
                                    <p style={{ margin: 0, fontFamily: DS.ff, fontSize: 12, fontWeight: 500, lineHeight: "16px", color: DS.navy }}>
                                        {uc.label}
                                    </p>
                                    {uc.hint && (
                                        <p style={{ margin: "2px 0 0", fontFamily: DS.ff, fontSize: 10, lineHeight: "14px", color: DS.neutral500 }}>
                                            {uc.hint}
                                        </p>
                                    )}
                                </div>
                                <Ico.ChevRight s={15} c={isHov ? DS.neutral700 : DS.neutral300} />
                            </div>
                        );
                    })}
                </div>
            </div>
        </>,
        document.body
    );
}