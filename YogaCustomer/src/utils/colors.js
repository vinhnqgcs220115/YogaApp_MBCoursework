// colors.js
export const colors = {
  // Primary Colors - Based on your Figma's dark theme (black buttons/nav)
  primary: {
    50: '#f8f9fa',
    100: '#f1f3f4',
    200: '#e8eaed',
    300: '#dadce0',
    400: '#9aa0a6',
    500: '#5f6368', // Main primary (medium gray)
    600: '#3c4043', // Darker gray
    700: '#202124', // Dark gray (like your active nav)
    800: '#1a1a1a', // Very dark (like your buttons)
    900: '#000000', // Pure black
  },

  // Secondary Colors - Soft, minimal accent
  secondary: {
    50: '#f8f9ff',
    100: '#f0f2ff',
    200: '#e6e8ff',
    300: '#d1d5ff',
    400: '#a8b0ff',
    500: '#7c85ff', // Soft purple accent
    600: '#6366f1',
    700: '#4f46e5',
    800: '#3730a3',
    900: '#312e81',
  },

  // Success Colors - Natural greens
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Main success
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  // Error Colors - Soft reds
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Main error
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Neutral Colors - Clean grays for text and backgrounds
  neutral: {
    0: '#ffffff',
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },

  // Semantic Colors (Direct usage)
  background: {
    primary: '#ffffff',
    secondary: '#fafafa',
    tertiary: '#f5f5f5',
    dark: '#171717',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  text: {
    primary: '#171717',
    secondary: '#525252',
    tertiary: '#737373',
    disabled: '#a3a3a3',
    inverse: '#ffffff',
    link: '#8b5cf6',
    placeholder: '#a3a3a3', // Added for input placeholders
  },

  border: {
    light: '#e5e5e5',
    medium: '#d4d4d4',
    dark: '#a3a3a3',
    focus: '#8b5cf6',
  },

  // Component-specific colors
  card: {
    background: '#ffffff',
    border: '#e5e5e5',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },

  input: {
    background: '#ffffff',
    border: '#d4d4d4',
    borderFocus: '#8b5cf6',
    placeholder: '#a3a3a3',
    disabled: '#f5f5f5',
  },

  button: {
    primary: '#8b5cf6',
    primaryHover: '#7c3aed',
    secondary: '#14b8a6',
    secondaryHover: '#0d9488',
    accent: '#f97316',
    accentHover: '#ea580c',
    disabled: '#d4d4d4',
    text: '#ffffff',
  },

  // Alert colors structure
  alerts: {
    error: {
      background: '#fef2f2',
      border: '#fecaca',
      text: '#dc2626',
    },
    success: {
      background: '#f0fdf4',
      border: '#bbf7d0',
      text: '#16a34a',
    },
    warning: {
      background: '#fffbeb',
      border: '#fed7aa',
      text: '#d97706',
    },
  },

  // Tab navigation colors
  tabActive: '#8b5cf6',
  tabInactive: '#9ca3af',
  tabBackground: '#ffffff',

  // Additional semantic colors
  black: '#000000',
  white: '#ffffff',

  // Border alias (used in TabNavigator)
  border: '#e5e5e5',
};

// Helper functions for color manipulation
export const colorHelpers = {
  // Convert hex to rgba
  hexToRgba: (hex, alpha = 1) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  },

  // Get color with opacity
  withOpacity: (color, opacity) => {
    if (color.startsWith('#')) {
      return colorHelpers.hexToRgba(color, opacity);
    }
    if (color.startsWith('rgb(')) {
      return color.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`);
    }
    return color;
  },
};

export default colors;
