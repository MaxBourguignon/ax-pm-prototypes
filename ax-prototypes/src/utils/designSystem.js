const _ff = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const DS = {
  // ---------- Neutrals ------------------------------------------
  white:        "#FFFFFF",
  neutral100:   "#F9FBFB",
  neutral200:   "#E2DDDD",
  neutral300:   "#CED4DA",
  neutral400:   "#ABBED1",
  neutral500:   "#9A9EA5",
  neutral600:   "#8993A0",
  neutral700:   "#717171",
  neutral800:   "#1F2937",
  neutral900:   "#212529",
  black:        "#000000",

  // ---------- Primary (Blue) ------------------------------------
  blue100:      "#EFF4FF",
  blue200:      "#C6E2FF",
  blue300:      "#96C2FE",
  blue500:      "#017BFE",
  blue600:      "#0D69D4",
  blue700:      "#0058B4",
  blueIos:      "#007AFF",

  // ---------- Secondary (Teal / Brand-mark green) ---------------
  green100:     "#DEF9F4",
  green200:     "#B4EBE2",
  green300:     "#7ECFC2",
  green400:     "#52B0A1",
  green500:     "#34B0A1",
  greenBrand:   "#2CB1A2",

  // ---------- Accent (from logo) --------------------------------
  orange:       "#FE9D55",
  coral:        "#EE5A4F",
  indigoBrand:  "#4E6FC7",
  indigoGrad:   "#5585B8",

  // ---------- Semantic ------------------------------------------
  success:      "#16A34A",
  danger:       "#DC2626",
  dangerBg:     "#FFEBE8",
  info:         "#017BFE",
  warning:      "#FE9D55",

  // ---------- Brand Gradients -----------------------------------
  brandGradient:  "linear-gradient(180deg, #2CB1A2 0%, #5585B8 100%)",
  brandGradientH: "linear-gradient(90deg, #5585B8 0%, #2CB1A2 100%)",

  // ---------- Semantic Surfaces ---------------------------------
  bg:           "#FFFFFF",
  bgCanvas:     "#F7F2F0",
  bgMuted:      "#F9FBFB",
  surfaceCard:  "#FFFFFF",
  surfaceHover: "#EFF4FF",
  border:       "#E2DDDD",
  borderStrong: "#CED4DA",
  divider:      "#D4D4D4",

  fg:           "#1F2937",
  fgStrong:     "#212529",
  fgMuted:      "#9A9EA5",
  fgOnPrimary:  "#FFFFFF",
  fgLink:       "#017BFE",

  // ---------- Typography ----------------------------------------
  ff: _ff,

  h1: `700 48px/64px ${_ff}`,
  h2: `600 28px/36px ${_ff}`,
  h3: `600 20px/28px ${_ff}`,
  h4: `600 16px/22px ${_ff}`,
  h5: `600 14px/18px ${_ff}`,

  bodyLead: `400 28px/40px ${_ff}`,
  body1:    `400 16px/22px ${_ff}`,
  body2:    `400 14px/18px ${_ff}`,
  body3:    `400 12px/16px ${_ff}`,

  labelLg:  `500 16px/24px ${_ff}`,
  labelMd:  `500 14px/20px ${_ff}`,
  labelSm:  `500 12px/16px ${_ff}`,

  // ---------- Spacing -------------------------------------------
  space1:  "4px",
  space2:  "8px",
  space3:  "12px",
  space4:  "16px",
  space5:  "20px",
  space6:  "24px",
  space7:  "28px",
  space8:  "32px",
  space10: "40px",
  space12: "48px",
  space16: "64px",

  // ---------- Radii ---------------------------------------------
  radiusButton: "4px",
  radiusField:  "4px",
  radiusTag:    "10px",
  radiusCard:   "8px",
  radiusCardLg: "10px",
  radiusPill:   "100px",

  // ---------- Elevation -----------------------------------------
  shadowSm:    "0 1px 2px 0 rgba(0,0,0,0.06)",
  shadowMd:    "0 2px 4px 0 rgba(0,0,0,0.25)",
  shadowLg:    "0 8px 24px 0 rgba(31,41,55,0.12)",
  shadowModal: "0 16px 48px -8px rgba(0,0,0,0.30)",

  // ---------- Borders -------------------------------------------
  borderThin:        "1px solid #E2DDDD",
  borderStrongSolid: "1px solid #CED4DA",
  borderFocus:       "1px solid #017BFE",

  // ---------- Motion --------------------------------------------
  ease:    "cubic-bezier(0.4, 0, 0.2, 1)",
  easeOut: "cubic-bezier(0, 0, 0.2, 1)",
  durFast: "120ms",
  durBase: "180ms",
  durSlow: "240ms",

  navy: "#180636",
};

export default DS;
