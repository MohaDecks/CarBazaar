/**
 * Premium automotive design tokens
 * Accent: Racing emerald green on charcoal/black
 */
module.exports = {
  colors: {
    brand: {
      black: "#0A0A0A",
      charcoal: "#141414",
      dark: "#1A1A1A",
      muted: "#2A2A2A",
      border: "#2E2E2E",
      surface: "#F7F7F5",
      white: "#FFFFFF",
    },
    accent: {
      DEFAULT: "#0D7A4F",
      hover: "#0A6340",
      light: "#E8F5EF",
      muted: "#A8D5C0",
    },
    gray: {
      50: "#FAFAF9",
      100: "#F5F5F4",
      200: "#E7E5E4",
      300: "#D6D3D1",
      400: "#A8A29E",
      500: "#78716C",
      600: "#57534E",
      700: "#44403C",
      800: "#292524",
      900: "#1C1917",
    },
    semantic: {
      success: "#0D7A4F",
      warning: "#B45309",
      error: "#B91C1C",
      info: "#1D4ED8",
    },
    condition: {
      new: "#0D7A4F",
      used: "#57534E",
      certified: "#1D4ED8",
    },
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
    "3xl": "4rem",
    "4xl": "6rem",
  },
  radius: {
    none: "0",
    sm: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    full: "9999px",
  },
  typography: {
    fontFamily: {
      display: ['"Syne"', "system-ui", "sans-serif"],
      body: ['"DM Sans"', "system-ui", "sans-serif"],
      mono: ['"JetBrains Mono"', "monospace"],
    },
    fontSize: {
      xs: ["0.75rem", { lineHeight: "1rem" }],
      sm: ["0.875rem", { lineHeight: "1.25rem" }],
      base: ["1rem", { lineHeight: "1.5rem" }],
      lg: ["1.125rem", { lineHeight: "1.75rem" }],
      xl: ["1.25rem", { lineHeight: "1.75rem" }],
      "2xl": ["1.5rem", { lineHeight: "2rem" }],
      "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
      "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
      "5xl": ["3rem", { lineHeight: "1.15" }],
      "6xl": ["3.75rem", { lineHeight: "1.1" }],
    },
  },
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.04)",
    md: "0 4px 12px -2px rgb(0 0 0 / 0.06)",
    lg: "0 12px 24px -4px rgb(0 0 0 / 0.08)",
    none: "none",
  },
  aspectRatio: {
    vehicle: "16 / 10",
    square: "1 / 1",
    hero: "21 / 9",
    thumb: "4 / 3",
  },
};
