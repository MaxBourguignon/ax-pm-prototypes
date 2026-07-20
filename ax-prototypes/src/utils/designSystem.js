export const DS = {
  // ── Raw palette ───────────────────────────────────────────────────────────────
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

  blue100:      "#EFF4FF",
  blue200:      "#C6E2FF",
  blue300:      "#96C2FE",
  blue500:      "#2575fc",
  blue600:      "#0D69D4",
  blue700:      "#0058B4",
  blueIos:      "#007AFF",

  green100:     "#DEF9F4",
  green200:     "#B4EBE2",
  green300:     "#7ECFC2",
  green400:     "#52B0A1",
  green500:     "#34B0A1",
  greenBrand:   "#2CB1A2",

  orange:       "#FE9D55",
  coral:        "#EE5A4F",
  indigoBrand:  "#4E6FC7",
  indigoGrad:   "#5585B8",

  purple100:    "#F3E8FF",
  purple600:    "#9333EA",
  teal100:      "#CCFBF1",
  teal500:      "#14B8A6",
  orange100:    "#FFEDD5",
  orange500:    "#F97316",
  amber100:     "#FEF3C7",
  amber600:     "#D97706",
  rose100:      "#FFE4E6",
  rose600:      "#E11D48",
  indigo100:    "#E0E7FF",
  indigo800:    "#3730A3",
  navy:         "#180636",

  // ── 2026 brand secondary palette ──────────────────────────────────────────────
  // Straight from the brand guide. The pale mint/yellow read well as solid fills
  // (donut arcs, swatches); the *Ink variants are darkened for thin lines/text on white.
  brandViolet:    "#4F32FE",
  brandYellow:    "#FAEA87",
  brandMint:      "#6FE8B8",
  brandMagenta:   "#B93177",
  brandMintInk:   "#17B08F",
  brandYellowInk: "#D9A400",

  // ── Semantic tokens ───────────────────────────────────────────────────────────
  ff: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  ffn: "'Poppins', 'Century Gothic', 'Avenir Next', 'Segoe UI', Roboto, sans-serif",

  bgPage:    "#F4F9FF",
  bgCard:    "#FFFFFF",
  bgSurface: "#F9FBFB",
  bgIcons:   "#EFF4FF",

  borderDefault: "#E2DDDD",
  borderFocus:   "#2575fc",
  borderError:   "#EF4444",

  textDefault:     "#1F2937",
  textSecondary:   "#9A9EA5",
  textInverse:     "#FFFFFF",
  textPlaceholder: "#ABBED1",
  textDisabled:    "#9A9EA5",

  actionPrimary:            "#2575fc",
  actionPrimaryHover:       "#0058B4",
  actionSecondaryBorder:    "#2575fc",
  actionSecondaryHover:     "#EFF4FF",
  actionSecondaryTextHover: "#2575fc",
  actionTertiaryHover:      "#F9FBFB",
  actionTertiaryTextHover:  "#1F2937",
  actionDisabledBg:         "#E2DDDD",
  actionDisabledText:       "#9A9EA5",

  navTabBarActive:  "#007AFF",
  navTabTextActive: "#2575fc",
  navText:          "#717171",
  navActiveTab:     "#2575fc",
  navGradientFrom:  "#2575fc",
  navGradientTo:    "#4E6FC7",

  feedbackSuccess:   "#22C55E",
  feedbackError:     "#EF4444",
  feedbackWarning:   "#F59E0B",
  feedbackInfo:      "#2575fc",
  feedbackSuccessBg: "#DEF9F4",
  feedbackErrorBg:   "#FFE4E6",
  feedbackWarningBg: "#FEF3C7",
  feedbackInfoBg:    "#EFF4FF",
  feedbackErrorText: "#B91C1C",

  purple:      "#9333EA",
  purpleLight: "#F3E8FF",
  neutralLGrey:"#CED4DA",

  success:         "#22C55E",
  gradientBlueH:    "linear-gradient(180deg, #017BFE 0%, #34C9AE 100%)",
  gradientBlueV:    "linear-gradient(90deg, #017BFE 0%, #34C9AE 100%)",

  // ── Spacing ───────────────────────────────────────────────────────────────────
  space1: "4px",
  space2: "8px",
  space3: "12px",
  space4: "16px",

  // ── Border radius ─────────────────────────────────────────────────────────────
  radiusCard:   "8px",
  radiusButton: "6px",

  // ── Animation ─────────────────────────────────────────────────────────────────
  durFast: "120ms",
  durBase: "200ms",
  ease:    "ease",
};

export const TY = {
  h1: { fontSize: 36, fontWeight: 600, lineHeight: "44px" }, // hero numbers / landing titles
  h2: { fontSize: 28, fontWeight: 600, lineHeight: "36px" }, // page titles, headline metrics
  h3: { fontSize: 20, fontWeight: 600, lineHeight: "28px" },
  h4: { fontSize: 16, fontWeight: 600, lineHeight: "22px" },
  h5: { fontSize: 14, fontWeight: 600, lineHeight: "18px" },
  b1: { fontSize: 16, fontWeight: 400, lineHeight: "22px" },
  b2: { fontSize: 14, fontWeight: 400, lineHeight: "18px" },
  b3: { fontSize: 12, fontWeight: 400, lineHeight: "16px" },
  weightSemiBold: 600,
  weightMedium:   500,
};

