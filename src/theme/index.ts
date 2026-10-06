// Shared FIXORA design tokens. Keep this the single source of truth for
// colors, spacing, radius and typography instead of hardcoding values in screens.

export const colors = {
  primary: "#2563EB",
  primaryPressed: "#1D4ED8",
  primarySoft: "#EFF6FF",

  background: "#F8FAFC",
  surface: "#FFFFFF",

  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",

  border: "#E2E8F0",
  borderStrong: "#CBD5E1",

  success: "#16A34A",
  successLight: "#DCFCE7",
  warning: "#D97706",
  warningLight: "#FEF3C7",
  error: "#DC2626",
  errorLight: "#FEE2E2",

  white: "#FFFFFF",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const typography = {
  pageTitle: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "800" as const,
    color: colors.textPrimary,
  },
  sectionHeading: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700" as const,
    color: colors.textPrimary,
  },
  cardTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700" as const,
    color: colors.textPrimary,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "400" as const,
    color: colors.textPrimary,
  },
  secondary: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400" as const,
    color: colors.textSecondary,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600" as const,
    color: colors.textSecondary,
  },
  button: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "700" as const,
    color: colors.white,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500" as const,
    color: colors.textMuted,
  },
} as const;
