/** DriveET premium automotive design tokens */

export const colors = {
  primary: "#087F5B",
  dark: "#111111",
  background: "#F7F8F7",
  white: "#FFFFFF",
  secondary: "#6B7280",
  border: "#E5E7EB",
  muted: "#F3F4F6",
  error: "#B91C1C",

  // Aliases for existing screens
  accent: "#087F5B",
  accentHover: "#066649",
  charcoal: "#111111",
  surface: "#F7F8F7",
  black: "#111111",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray600: "#4B5563",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  page: 16,
  section: 28,
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 20,
  full: 999,
};

export const shadow = {
  soft: {
    shadowColor: "#111111",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  search: {
    shadowColor: "#111111",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  nav: {
    shadowColor: "#111111",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
};

export const typography = {
  hero: { fontSize: 32, fontWeight: "700" as const, lineHeight: 38 },
  section: { fontSize: 20, fontWeight: "700" as const },
  vehicleTitle: { fontSize: 17, fontWeight: "600" as const },
  price: { fontSize: 18, fontWeight: "700" as const },
  meta: { fontSize: 13, fontWeight: "400" as const },
  label: { fontSize: 12, fontWeight: "500" as const },
};

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000/api";

export const UPLOAD_URL =
  process.env.EXPO_PUBLIC_UPLOAD_URL ?? "http://localhost:4000";
