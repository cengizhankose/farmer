/**
 * Centralized Color Palette
 *
 * This file contains all colors used throughout the application.
 * Use these constants instead of hardcoded color values for consistency.
 */

export const colors = {
  // Primary Brand Colors
  orange: {
    50: "#ff7d27", // Primary orange brand color
    100: "#ff7d27", // Orange hover states
    300: "#ff7d27", // Orange borders
    600: "#ff7d27", // Default orange button
    700: "#e06b20", // Orange button hover
  },

  // Emerald/Green (Success, Actions)
  emerald: {
    100: "#dcfce7", // Light emerald background
    300: "#86efac", // Emerald borders
    600: "#059669", // Primary emerald buttons
    700: "#047857", // Emerald hover states, links
  },

  // Zinc/Gray Scale
  zinc: {
    50: "#fafafa", // Lightest background
    100: "#f4f4f5", // Light background, secondary buttons
    200: "#e4e4e7", // Borders, dividers
    300: "#d4d4d8", // Input borders, outline borders
    400: "#a1a1aa", // Placeholder text
    500: "#71717a", // Muted text
    600: "#52525b", // Secondary text
    700: "#3f3f46", // Primary text, input text
    900: "#18181b", // Primary dark text, buttons
    950: "#09090b", // Footer background, darkest
  },

  // White/Transparent
  white: {
    DEFAULT: "#ffffff",
    dirty: "#f8f6f3", // Dirty white for View Details buttons
    10: "rgba(255, 255, 255, 0.1)", // Glass background
    15: "rgba(255, 255, 255, 0.15)", // Glass borders
    8: "rgba(255, 255, 255, 0.08)", // Subtle glass borders
    4: "rgba(255, 255, 255, 0.04)", // Very subtle borders (50% less opacity)
    60: "rgba(255, 255, 255, 0.6)", // Glass gradients
    70: "rgba(255, 255, 255, 0.7)", // Header background
    80: "rgba(255, 255, 255, 0.8)", // Text on dark
    90: "rgba(255, 255, 255, 0.9)", // High contrast text on dark
    opacity: {
      "073": "rgba(255, 255, 255, 0.073)", // CSS animation
    },
  },

  // Black/Dark
  black: {
    DEFAULT: "#000000",
    soft: "#0a0a0a", // Gradient backgrounds
    footer: "#09090b", // Footer background
  },

  // Amber (Warnings, Medium Risk)
  amber: {
    100: "#fef3c7", // Light amber background
    300: "#fcd34d", // Amber borders
    700: "#b45309", // Amber text
  },

  // Rose (Errors, High Risk)
  rose: {
    100: "#ffe4e6", // Light rose background
    300: "#fda4af", // Rose borders
    700: "#be123c", // Rose text
  },

  // Special Colors
  gradients: {
    sceneBg: "linear-gradient(to right, #e9e9e9, #1c1d1f)",
    orangeToBlack: "linear-gradient(to right, #ff7d27, #0a0a0a)",
    blackToAmber: "linear-gradient(to right, #0a0a0a, #e8de73)",
    brownToBlack: "linear-gradient(to right, #9a8068, #0a0a0a)",
    whiteToZinc:
      "linear-gradient(to b, rgba(255, 255, 255, 0.6), rgba(244, 244, 245, 0.6))",
  },

  // Radial gradients for effects
  radial: {
    orangeGlow:
      "radial-gradient(ellipse_at_center, rgba(255, 125, 39, 0.22), transparent_60%)",
    darkGlow:
      "radial-gradient(ellipse_at_center, rgba(15, 16, 18, 0.18), transparent_60%)",
    orangeIntense: {
      from: "rgba(255, 125, 39, 0.95)",
      to: "rgba(255, 125, 39, 0.5)",
    },
  },

  // Specific UI Elements
  ui: {
    navText: "#e9e9e9", // Navigation text
    dividerPolygon: "#0a0a0a", // SVG polygon fill
    shadow: "rgba(0, 0, 0, 0.06)", // Box shadows
    shadowDark: "rgba(0, 0, 0, 0.08)", // Dark shadows
  },
} as const;

// Risk-specific color schemes
export const riskColors = {
  Low: {
    bg: colors.emerald[100],
    text: colors.emerald[700],
    border: colors.emerald[300],
  },
  Medium: {
    bg: colors.amber[100],
    text: colors.amber[700],
    border: colors.amber[300],
  },
  High: {
    bg: colors.rose[100],
    text: colors.rose[700],
    border: colors.rose[300],
  },
} as const;

// Button variant color schemes
export const buttonColors = {
  default: {
    bg: colors.zinc[900],
    text: colors.white.DEFAULT,
    hover: colors.black.DEFAULT,
  },
  outline: {
    border: colors.zinc[300],
    bg: colors.white.DEFAULT,
    text: colors.zinc[700],
    hover: colors.zinc[50],
  },
  secondary: {
    bg: colors.zinc[100],
    text: colors.zinc[900],
    hover: colors.zinc[200],
  },
  primary: {
    bg: colors.orange[600],
    text: colors.white.DEFAULT,
    hover: colors.orange[700],
  },
  success: {
    bg: colors.emerald[600],
    text: colors.white.DEFAULT,
    hover: colors.emerald[700],
  },
} as const;

// Utility functions for dynamic color generation
export const withOpacity = (color: string, opacity: number) =>
  color.includes("rgba")
    ? color
    : color.replace("rgb(", "rgba(").replace(")", `, ${opacity})`);

export const getCSSVar = (variable: string) => `hsl(var(--${variable}))`;
