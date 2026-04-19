/**
 * ServiceHub Color Palette
 * 
 * This file contains all the colors used throughout the app.
 * Use these colors instead of hardcoded hex values for consistency.
 */

export const colors = {
  // Primary Brand Colors
  primary: {
    teal: "#14B8A6",
    green: "#10B981",
    blue: "#3B82F6",
    // Gradient arrays for LinearGradient
    gradient: ["#14B8A6", "#10B981"],
    gradientStart: "#14B8A6",
    gradientEnd: "#10B981",
  },

  // Neutral Colors (Gray Scale)
  gray: {
    50: "#F9FAFB",
    100: "#F5F5F5",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
  },

  // Text Colors
  text: {
    primary: "#1F2937",
    secondary: "#6B7280",
    tertiary: "#9CA3AF",
    disabled: "#9CA3AF",
    inverse: "#FFFFFF",
    // Alternative naming
    dark: "#1F2937",
    medium: "#6B7280",
    light: "#9CA3AF",
  },

  // Background Colors
  background: {
    primary: "#FFFFFF",
    secondary: "#F9FAFB",
    tertiary: "#F5F5F5",
    dark: "#121212",
    light: "#F8FAFC",
  },

  // Border Colors
  border: {
    light: "#E5E7EB",
    medium: "#D1D5DB",
    dark: "#9CA3AF",
  },

  // Accent Colors
  accent: {
    coral: "#FF6B6B",
    purple: "#A78BFA",
    amber: "#F59E0B",
    red: "#EF4444",
    green: "#16A34A",
    blue: "#3B82F6",
    teal: "#14B8A6",
  },

  // Status Colors
  status: {
    success: "#10B981",
    successLight: "#16A34A",
    successBg: "#DCFCE7",
    warning: "#F59E0B",
    warningBg: "#FEF3C7",
    error: "#EF4444",
    errorBg: "#FEF2F2",
    errorLight: "#DC2626",
    info: "#3B82F6",
    infoLight: "#93C5FD",
  },

  // Semantic Colors
  semantic: {
    // Selection/Active states
    selected: "#FFE5E5",
    selectedBorder: "#FF6B6B",
    
    // Interactive elements
    link: "#3B82F6",
    linkHover: "#2563EB",
    
    // Rating/Stars
    star: "#F59E0B",
    
    // Priority levels
    priority: {
      low: "#6B7280",
      normal: "#10B981",
      medium: "#F59E0B",
      high: "#EF4444",
    },
  },

  // Onboarding specific colors
  onboarding: {
    coral: "#FF6B6B",
    lightPurple: "#A78BFA",
    lightGray: "#E5E7EB",
    darkGray: "#374151",
    lightBeige: "#F5F5DC",
  },

  // Dark Mode Colors
  dark: {
    background: "#121212",
    surface: "#1E1E1E",
    surfaceElevated: "#2D2D2D",
    text: "#FFFFFF",
    textSecondary: "#B3B3B3",
    textTertiary: "#8F8F8F",
    border: "#2D2D2D",
  },

  // Common UI Colors
  ui: {
    white: "#FFFFFF",
    black: "#000000",
    transparent: "transparent",
    overlay: "rgba(0, 0, 0, 0.5)",
    grid: "rgba(0, 0, 0, 0.03)",
  },
};

// Helper function to get gradient colors
export const getGradientColors = (type = "primary") => {
  switch (type) {
    case "primary":
      return colors.primary.gradient;
    default:
      return colors.primary.gradient;
  }
};

// Export default for convenience
export default colors;

