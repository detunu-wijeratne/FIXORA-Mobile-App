import { colors as baseColors, radius as baseRadius, spacing, typography as baseTypography } from "./index";

export const colors = {
  ...baseColors,
  primary: "#17334D",
  primaryPressed: "#10283D",
  primarySoft: "#EAF0F4",
  background: "#F5F6F8",
  textPrimary: "#142B40",
  textSecondary: "#637587",
  textMuted: "#7A8997",
  border: "#E4E9EE",
  borderStrong: "#CCD6DF",
  accent: "#F0C77A",
  accentSoft: "#FFF5E2",
};
export const radius = { ...baseRadius, lg: 18, xl: 24 };
export { spacing };
export const typography = {
  ...baseTypography,
  pageTitle: { ...baseTypography.pageTitle, color: colors.textPrimary, letterSpacing: -0.7 },
  secondary: { ...baseTypography.secondary, color: colors.textSecondary },
  caption: { ...baseTypography.caption, color: colors.textMuted },
  label: { ...baseTypography.label, color: colors.textPrimary },
};
