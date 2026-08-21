/** @type {import('tailwindcss').Config} */
const tokens = require("../../packages/config/design-tokens");

module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: tokens.colors.brand,
        accent: tokens.colors.accent,
        gray: tokens.colors.gray,
        semantic: tokens.colors.semantic,
        condition: tokens.colors.condition,
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: tokens.typography.fontFamily.mono,
      },
      borderRadius: tokens.radius,
      boxShadow: tokens.shadows,
      aspectRatio: tokens.aspectRatio,
    },
  },
  plugins: [],
};
