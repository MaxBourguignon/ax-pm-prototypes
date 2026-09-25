/**
 * AX Design System — token source of truth for ax-prototypes.
 *
 * Synced 2026-08-27 against Figma "AX DESIGN SYSTEM"
 *   file  nIMtO7v8dDamI8b2vnMcRc
 *   page  "🧪 Foundations" (node 10:4)
 *
 * LIGHT MODE ONLY. The Figma file documents a dark mode (elevation ladder
 * app-background < canvas < subtle < muted; brand/primary for fills only,
 * brand/on-surface for brand-coloured text) but the dark values are not
 * readable via the MCP variable API — they need a use_figma pass. Until then
 * do not add a dark theme here; it would be guesswork.
 *
 * Two layers, mirroring Figma:
 *   1. PRIMITIVES — the raw ramps. Only use when no semantic token fits.
 *   2. SEMANTIC   — what you should actually reach for.
 *
 * Figma name → key here: the slash path becomes camelCase.
 *   text/secondary        → textSecondary
 *   action/primary/hover  → actionPrimaryHover
 */

export const DS = {
  // ══ 1. PRIMITIVES ═══════════════════════════════════════════════════════
  // Exact ramps from Foundations › Colors – Primitives (node 26:9).

  // Neutral — chrome, borders, disabled states
  neutral0:    "#FFFFFF",
  neutral100:  "#F4F5F5",
  neutral200:  "#DEE0E3",
  neutral300:  "#AFB6C1",
  neutral500:  "#9A9EA5",

  // Slate — text and dark surfaces (carries dark mode when it lands)
  slate400:    "#94A3B8",
  slate500:    "#64748B",
  slate700:    "#3E4E65",
  slate900:    "#1F2937",
  slate950:    "#151B26",

  // Blue — note: brand/primary (#2575FC) is NOT part of this ramp
  blue100:     "#EFF4FF",
  blue200:     "#C6E2FF",
  blue300:     "#96C2FE",
  blue400:     "#2575FC", // ⚠ swatch FILL is #2575fc but its label reads #3F98FD — see note below
  blue500:     "#017BFE",
  blue550:     "#2575FC", // NOT on the Primitives section at all — surfaced only
                          // as a var reference inside the `Gradient/Brand` style.
  blue600:     "#0D69D4",

  // Teal (was named "green" in the old DS)
  teal100:     "#DEF9F4",
  teal200:     "#B4EBE2",
  teal300:     "#7ECFC2",
  teal500:     "#34B0A1",

  green600:    "#16A34A",
  green800:    "#14532D",

  orange100:   "#FCEDDE",
  orange400:   "#FE9D55",
  orange800:   "#78350F",

  red100:      "#FFEBE8",
  red400:      "#F87171",
  red600:      "#DC2626",
  red800:      "#991B1B",

  purple300:   "#A78BFA",
  purple400:   "#6B52FE",
  purple500:   "#4F32FE", // ⚠ label reads #4F32FE, swatch fill resolves #2575fc — see note below
  purple800:   "#3B2A7A",
  purple900:   "#180636",

  pink300:     "#D97BB0",
  pink600:     "#B93177",
  pink700:     "#A23192",

  coral500:    "#FF7C6D",
  yellow200:   "#FAEA87",
  mint400:     "#6FE8B8",

  black:       "#000000",

  // ── Unbound-swatch note ─────────────────────────────────────────────────
  // Blue/400, Purple/500, Purple/900, Coral/500, Pink/600, Yellow/200 and
  // Mint/400 are documented on Foundations as swatches but are NOT bound to
  // Figma variables, so `get_variable_defs` cannot see them — they must be read
  // via `get_design_context` on node 26:9. Two carry a fill/label conflict
  // (Blue/400, Purple/500); the values above take the swatch LABEL where it is
  // unambiguous and are flagged where it isn't. Confirm with the designer
  // before relying on those two.

  // ══ 2. SEMANTIC ═════════════════════════════════════════════════════════
  // Exact tokens from Foundations › Colors – Tokens (node 28:98).
  // 31 tokens; this is the complete published set.

  // ── Brand ──
  brandPrimary:      "#2575FC", // main CTA fill, active nav, pagination pip
  brandPrimarySubtle:"#EFF4FF", // tinted brand background
  brandAccent:       "#017BFE", // secondary brand blue (= Blue/500)
  brandOnSurface:    "#2575FC", // brand as text/icon/link on a neutral surface
  // ⚠ These two are the violet→magenta ENDPOINT TOKENS on the Tokens page. They
  //   are NOT the DS's `Gradient/Brand` paint style — see gradientBrand below.
  brandGradientFrom: "#4F32FE",
  brandGradientTo:   "#A23192",

  // The actual Figma paint style named `Gradient/Brand`, read off the Kanban
  // AccentRail (2071:40363) — the only place in the file that applies it:
  //   90deg, blue/550 #2575FC → blue/300 #96C2FE
  // A blue→light-blue ramp, unrelated to the violet/magenta pair above.
  gradientBrand: "linear-gradient(90deg, #2575FC 0%, #96C2FE 100%)",

  // ── Surface ──
  surfaceCanvas:  "#FFFFFF", // cards, panels, modals
  surfaceSubtle:  "#F4F5F5", // alt table rows, toolbars, secondary panels
  surfaceMuted:   "#DEE0E3", // one step darker than subtle
  surfaceAppBackground: "#F8FAFC", // page background
  surfaceHeader:  "#EFF4FF", // table header row — recovered from Table/Contacts (2052:38194)

  // ── Border ──
  borderSubtle:  "#F4F5F5", // hairline dividers
  borderStrong:  "#9A9EA5", // emphasised outlines
  borderSection: "#E2E8F0", // container outline (table/card shell)
  borderField:   "#CBD5E1", // input underline/outline — holds the 3:1 contrast floor
  // CORRECTED: the real `border/divider` token, read off MenuSection (558:2957).
  // I had #E7E8EA here, inferred from the raw hex the Table template uses for its
  // separators — that hex is a detached value, not this token.
  borderDivider: "#F1F5F9",
  borderTableSep: "#E7E8EA", // the Table template's literal separator value

  // ── Elevation ──
  shadowSm: "0 1px 2px rgba(0, 0, 0, 0.05)",  // Figma effect style `shadow/sm`
  // Figma effect style `shadow/md` — DROP_SHADOW #0000001F, offset (0,2), blur 6.
  // Read off Molecules/KPI Card (1887:33) 2026-09; it is the card elevation the
  // KPI Card uses on all three of its types.
  shadowMd: "0 2px 6px rgba(0, 0, 0, 0.12)",
  // The brand gradient as the KPI Card's 6px left rail: violet → magenta, top to
  // bottom. `gradientBrand` above is the blue `Gradient/Brand` paint style — a
  // different ramp; this one is the brand/gradient-from → brand/gradient-to pair.
  gradientBrandV: "linear-gradient(180deg, #4F32FE 0%, #A23192 100%)",

  // ── Radius observed in components but absent from the Foundations scale ──
  radiusXl: "12px", // table/card container shell
  radiusMdPlus: "6px", // search input, table-row icon button

  // ── Text ──
  textStrong:    "#073973", // headings — deep navy, not charcoal
  textMuted:     "#9A9EA5", // de-emphasised metadata
  textOnBrand:   "#FFFFFF", // text on a brand fill

  // ── Feedback (always use as a pair: fg + subtle bg) ──
  feedbackSuccessSubtle: "#DEF9F4",
  feedbackDanger:        "#DC2626",
  feedbackDangerSubtle:  "#FFEBE8",
  feedbackWarningSubtle: "#FCEDDE",
  feedbackInfoSubtle:    "#EFF4FF",

  // ── Action ──
  actionPrimaryDefault: "#2575FC",
  actionPrimaryActive:  "#0D69D4",
  actionPrimarySubtle:  "#EFF4FF",
  actionSecondaryDefault: "#1F2937", // action/secondary/default → Slate/900
  actionDanger:         "#DC2626",
  actionDangerHover:    "#991B1B",

  // ══ 3. SEMANTIC — established key names ═════════════════════════════════
  // Same tokens under the names already used across the app (900+ call sites),
  // so existing features keep compiling. Values are the NEW Figma values.

  textDefault:   "#073973", // ← was #1F2937. text/default is navy now.
  textSecondary: "#3E4E65", // ← was #9A9EA5. That old value is textMuted.
  textDisabled:  "#AFB6C1", // ← was #9A9EA5
  textInverse:   "#FFFFFF",
  textPlaceholder: "#AFB6C1", // ← was #ABBED1 (dropped from the DS)

  bgCard:    "#FFFFFF", // = surfaceCanvas
  bgSurface: "#F4F5F5", // ← was #F9FBFB. = surfaceSubtle
  bgIcons:   "#EFF4FF", // icon chip behind page-header / card icons

  // NOT IN THE NEW FIGMA DS. The dark-mode prose references a
  // `surface/app-background` token but it is not bound to any swatch, so there
  // is no published light value. Keeping the 2026 rebrand value; re-check when
  // the designer publishes it.
  bgPage: "#F4F9FF",

  borderDefault: "#DEE0E3", // ← was #E2DDDD
  borderFocus:   "#2575FC", // = brandPrimary
  borderError:   "#DC2626", // ← was #EF4444

  actionPrimary:            "#2575FC", // = action/primary/default
  actionPrimaryHover:       "#0D69D4", // ← was #0058B4
  // ⚠ These three hold the `action/secondary/*` Foundations values, which is
  //   faithful to the token page — but the DS **Button** does not use them. Its
  //   Secondary variant uses border/default (#DEE0E3) with surface/subtle
  //   (#F4F5F5) on hover, and the label stays text/strong (no colour change).
  //   Btn.jsx currently wires these in and renders a near-black border with a
  //   grey hover fill. The fix belongs in Btn.jsx, not in these values.
  actionSecondaryBorder:    "#1F2937",
  actionSecondaryHover:     "#9A9EA5",
  actionSecondaryTextHover: "#2575FC",
  actionTertiaryHover:      "#F4F5F5",
  actionTertiaryTextHover:  "#1F2937",
  actionDisabledBg:         "#DEE0E3", // ← was #E2DDDD
  actionDisabledText:       "#AFB6C1", // ← was #9A9EA5

  feedbackSuccess:   "#16A34A", // ← was #22C55E
  feedbackError:     "#DC2626", // ← was #EF4444
  feedbackWarning:   "#FE9D55", // ← was #F59E0B
  feedbackInfo:      "#017BFE", // ← was #2575FC
  feedbackSuccessBg: "#DEF9F4",
  feedbackErrorBg:   "#FFEBE8", // ← was #FFE4E6
  feedbackWarningBg: "#FCEDDE", // ← was #FEF3C7
  feedbackInfoBg:    "#EFF4FF",
  // The new DS has no `feedback/error-text`. Red/800 is the darkest red and
  // matches the old token's intent (readable on feedbackErrorBg).
  feedbackErrorText: "#991B1B",

  // Navigation. The new DS ships Sidebar/TopBar/SubNavBar as components rather
  // than nav colour tokens, so these are mapped onto the closest brand tokens.
  navText:          "#3E4E65", // ← was #717171
  navActiveTab:     "#2575FC", // ← was #4E6FC7
  navTabBarActive:  "#2575FC",
  navTabTextActive: "#2575FC",
  navGradientFrom:  "#4F32FE", // ← was #2575FC. = brandGradientFrom
  navGradientTo:    "#A23192", // ← was #4E6FC7. = brandGradientTo

  // ══ 4. TYPOGRAPHY FAMILIES ══════════════════════════════════════════════
  ff:  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  ffm: "'Roboto Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  // DEPRECATED — Poppins is not in the new DS. Migrate remaining uses to `ff`.
  ffn: "'Poppins', 'Century Gothic', 'Avenir Next', 'Segoe UI', Roboto, sans-serif",

  // ══ 5. SPACING ══════════════════════════════════════════════════════════
  // Foundations › Spacing (node 32:248) — 9 steps.
  space2xs: "2px",
  spaceXs:  "4px",
  spaceSm:  "8px",
  spaceMd:  "12px",
  spaceLg:  "16px",
  spaceXl:  "20px",
  space2xl: "24px",
  space3xl: "32px",
  space4xl: "48px",
  // Established aliases
  space1: "4px",
  space2: "8px",
  space3: "12px",
  space4: "16px",

  // ══ 6. RADIUS ═══════════════════════════════════════════════════════════
  // Foundations › Radius (node 32:292).
  radiusNone: "0px",
  radiusSm:   "2px",
  radiusMd:   "4px",
  radiusLg:   "8px",
  radiusPill: "999px",
  // Established aliases
  radiusCard:   "8px", // = radiusLg
  radiusButton: "4px", // ← was 6px, which no longer exists in the scale

  // ══ 7. MOTION ═══════════════════════════════════════════════════════════
  // Not specified in Figma — kept from the existing implementation.
  durFast: "120ms",
  durBase: "200ms",
  ease:    "ease",

  // ══ 8. LEGACY ALIASES ═══════════════════════════════════════════════════
  // Names the new DS dropped, or that were used in the app but never defined
  // here (those rendered as `undefined`). Each points at its nearest new
  // token. Migrate off these; do not add more.

  white:        "#FFFFFF", // → neutral0
  neutral400:   "#AFB6C1", // dropped ramp step → neutral300
  neutral700:   "#64748B", // dropped → slate500
  neutral800:   "#1F2937", // → slate900
  neutral900:   "#1F2937", // ← was #212529 → slate900
  neutralBlack: "#1F2937", // was UNDEFINED (13 uses) → slate900
  neutralGrey:  "#64748B", // → slate500
  neutralLGrey: "#AFB6C1", // ← was #CED4DA → neutral300

  blue700:  "#073973", // dropped → textStrong navy
  blue800:  "#073973", // was UNDEFINED (5 uses)
  blueIos:  "#017BFE", // dropped → blue500

  green100:   "#DEF9F4", // renamed → teal100
  green400:   "#7ECFC2", // dropped → teal300
  green500:   "#34B0A1", // renamed → teal500
  greenBrand: "#34B0A1", // dropped → teal500
  greenLight: "#DEF9F4", // was UNDEFINED → teal100
  success:    "#16A34A", // → green600

  orange:      "#FE9D55", // → orange400
  orange500:   "#FE9D55", // → orange400
  orangeLight: "#FCEDDE", // was UNDEFINED → orange100
  orangeDark:  "#78350F", // was UNDEFINED → orange800
  amber:       "#FE9D55", // was UNDEFINED → orange400
  amber100:    "#FCEDDE", // → orange100
  amber600:    "#FE9D55", // → orange400
  amberLight:  "#FCEDDE", // was UNDEFINED → orange100
  coral:       "#FF7C6D", // = Coral/500. ← was #EE5A4F (wrong; swatch is unbound
                          // so the variable API never surfaced it).

  rose100: "#FFEBE8", // → red100
  rose600: "#DC2626", // → red600

  purple:      "#6B52FE", // ← was #9333EA → purple400
  purple100:   "#A78BFA", // ← was #F3E8FF → purple300
  purple600:   "#6B52FE", // ← was #9333EA → purple400
  purpleLight: "#A78BFA", // ← was #F3E8FF → purple300
  indigo100:   "#A78BFA", // dropped → purple300
  indigo800:   "#3B2A7A", // ← was #3730A3 → purple800
  indigoLight: "#A78BFA", // was UNDEFINED → purple300
  indigoDark:  "#3B2A7A", // was UNDEFINED → purple800
  indigoBrand: "#6B52FE", // dropped → purple400
  indigoGrad:  "#A23192", // dropped → brandGradientTo
  navy:        "#180636", // = Purple/900. Original value was correct — do not "fix" it.

  // 2026 brand secondaries. brandViolet/brandMagenta now come straight from
  // the gradient tokens. Yellow/Mint/Coral swatches exist in Figma but are not
  // variable-bound — those four values are unchanged and unverified.
  brandViolet:    "#4F32FE", // = brandGradientFrom (and Purple/500's label)
  brandMagenta:   "#B93177", // = Pink/600. Original value was correct — do not "fix" it.
  brandYellow:    "#FAEA87", // = Yellow/200 ✓ verified against node 26:9
  brandMint:      "#6FE8B8", // = Mint/400  ✓ verified against node 26:9
  brandMintInk:   "#17B08F", // NOT in the DS — locally darkened for thin lines/text
  brandYellowInk: "#D9A400", // NOT in the DS — locally darkened for thin lines/text

  gradientBlueH:   "linear-gradient(180deg, #017BFE 0%, #34B0A1 100%)",
  gradientBlueV:   "linear-gradient(90deg, #017BFE 0%, #34B0A1 100%)",
  // DEPRECATED — I composed this from brandGradientFrom/To before finding the
  // real `Gradient/Brand` style. Use `gradientBrand` for anything DS-facing;
  // this stays only for the one legacy call site that expects violet→magenta.
  brandGradientH:  "linear-gradient(90deg, #4F32FE 0%, #A23192 100%)",
};

/**
 * Typography — Foundations › Typography (node 35:258).
 *
 * The eight named styles below are the complete Figma scale. Apply by spread:
 *   style={{ ...TY.bodyMd, color: DS.textDefault, fontFamily: DS.ff }}
 *
 * Always set fontSize + fontWeight + lineHeight together.
 */
export const TY = {
  // ── The Figma scale ──
  displayLg:  { fontSize: 40, fontWeight: 700, lineHeight: "48px" }, // Inter Bold
  headlineLg: { fontSize: 28, fontWeight: 600, lineHeight: "36px" },
  headlineMd: { fontSize: 22, fontWeight: 700, lineHeight: "28px" }, // Inter Bold — PageHeader title, Avatar XL initials
  titleMd:    { fontSize: 18, fontWeight: 600, lineHeight: "24px" },
  bodyMd:     { fontSize: 14, fontWeight: 400, lineHeight: "20px" }, // most used
  bodyMdBold: { fontSize: 14, fontWeight: 600, lineHeight: "20px" },
  bodySm:     { fontSize: 13, fontWeight: 400, lineHeight: "18px" },
  bodySmBold: { fontSize: 13, fontWeight: 600, lineHeight: "18px" }, // Cell TitleDescription title
  labelMd:    { fontSize: 12, fontWeight: 500, lineHeight: "16px" },
  labelLg:    { fontSize: 14, fontWeight: 500, lineHeight: "20px" }, // Button Md label
  labelXl:    { fontSize: 16, fontWeight: 500, lineHeight: "24px" }, // Button Lg label
  captionSm:  { fontSize: 11, fontWeight: 400, lineHeight: "16px" }, // PageHeader meta line — smallest size in the DS
  monoMd:     { fontSize: 12, fontWeight: 500, lineHeight: "16px" }, // pair with DS.ffm

  // ── Established aliases ──
  // CORRECTION (2026-09): the DS *does* have a 16px step — Label/XLarge
  // (16/24/500), above. An earlier note here claimed it didn't. The Foundations
  // Typography section (node 35:258) shows only 8 styles and Label/Large +
  // Label/XLarge are not variable-bound, so neither the section nor
  // get_variable_defs reveals them; they surface via get_design_context on a
  // component that uses them. Treat Foundations as incomplete, not authoritative.
  //   h4 (16/600) → no exact match: the DS 16px step is weight 500, not 600.
  //   b1 (16/400) → same; use labelXl (500) unless the design clearly shows 400.
  //   h3 (20/600) → 20px is still unconfirmed; no component read so far uses one.
  h1: { fontSize: 40, fontWeight: 700, lineHeight: "48px" }, // → displayLg
  h2: { fontSize: 28, fontWeight: 600, lineHeight: "36px" }, // → headlineLg
  h3: { fontSize: 20, fontWeight: 600, lineHeight: "28px" }, // ⚠ not in DS
  h4: { fontSize: 16, fontWeight: 600, lineHeight: "22px" }, // ⚠ not in DS
  h5: { fontSize: 14, fontWeight: 600, lineHeight: "20px" }, // → bodyMdBold (lh 18→20)
  b1: { fontSize: 16, fontWeight: 400, lineHeight: "22px" }, // ⚠ not in DS
  b2: { fontSize: 14, fontWeight: 400, lineHeight: "20px" }, // → bodyMd (lh 18→20)
  b3: { fontSize: 12, fontWeight: 500, lineHeight: "16px" }, // → labelMd (weight 400→500)

  weightRegular:  400,
  weightMedium:   500,
  weightSemiBold: 600,
  weightBold:     700, // Display/Large only
};

// ─────────────────────────────────────────────────────────────────────────────
// CHIPS — Nuancier catégoriel
//
// Figma `Chips · Nuancier catégoriel` (node 3020:45613), read with
// get_design_context 2026-09:
//   https://www.figma.com/design/nIMtO7v8dDamI8b2vnMcRc/Arenametrix-DS--WIP-?node-id=3020-45613
//
// Eight categorical identities, each a triplet — surface / border / text —
// for anything that is a CATEGORY rather than a state: tags, memberships,
// segments, interests, product categories, and the segmentation filter objects.
// Never use them for feedback (success/warning/danger own that) and never for
// the brand: `brand/primary` stays the CTA colour.
//
// ⚠ Two ramps here exist NOWHERE else in this file — Lime and Sky are new to
//   the code, introduced by this scale.
// ⚠ Do not reach for DS.purple100 / DS.amber100 expecting these values: those
//   legacy aliases hold #A78BFA and #FCEDDE, not Purple/100 #F0ECFE and
//   Amber/100 #FEF3C7. The nuancier is deliberately kept as its own scale
//   rather than re-pointing tokens other features already depend on.
//
// Usage:
//   import { CHIPS } from '../../utils/designSystem';
//   <span style={{ background: CHIPS.chip1.surface, border: `1px solid ${CHIPS.chip1.border}`, color: CHIPS.chip1.text }}>
// ─────────────────────────────────────────────────────────────────────────────
export const CHIPS = {
  chip1: { name: "Purple", surface: "#F0ECFE", border: "#A78BFA", text: "#3B2A7A" }, // Purple/100 · 300 · 800
  chip2: { name: "Teal",   surface: "#DEF9F4", border: "#7ECFC2", text: "#115E56" }, // Teal/100   · 300 · 800
  chip3: { name: "Amber",  surface: "#FEF3C7", border: "#FCD34D", text: "#78350F" }, // Amber/100  · 300 · Orange/800
  chip4: { name: "Pink",   surface: "#FCE7F3", border: "#D97BB0", text: "#9D174D" }, // Pink/100   · 300 · 800
  chip5: { name: "Lime",   surface: "#ECFCCB", border: "#A3E635", text: "#3F6212" }, // Lime/100   · 400 · 800
  chip6: { name: "Sky",    surface: "#E0F2FE", border: "#7DD3FC", text: "#075985" }, // Sky/100    · 300 · 800
  chip7: { name: "Coral",  surface: "#FFE4E0", border: "#FF7C6D", text: "#9A3412" }, // Coral/100  · 500 · 800
  chip8: { name: "Slate",  surface: "#F1F5F9", border: "#CBD5E1", text: "#3E4E65" }, // Slate/100  · 300 · 700
};
