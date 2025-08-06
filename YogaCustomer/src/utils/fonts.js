// fonts.js
export const fonts = {
  // Font Families - React Native compatible
  families: {
    // Primary font - System font (works on both iOS and Android)
    primary: 'System',

    // Secondary font - System font
    secondary: 'System',

    // Display font - System font (you can add custom fonts later)
    display: 'System',

    // Monospace for code/numbers
    mono: 'monospace',

    // System fallback
    system: 'System',
  },

  // Font Sizes
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
    '7xl': 72,
    '8xl': 96,
    '9xl': 128,
  },

  // Font Weights - React Native compatible
  weights: {
    thin: '100',
    extraLight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    extraBold: '800',
    black: '900',
  },

  // Line Heights (as multipliers for React Native)
  lineHeights: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter Spacing
  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.25,
    wider: 0.5,
    widest: 1,
  },

  // Predefined Text Styles for React Native Components
  textStyles: {
    // Display styles
    displayLarge: {
      fontFamily: 'System',
      fontSize: 72,
      fontWeight: '700',
      lineHeight: 72 * 1.1,
      letterSpacing: -0.5,
    },
    displayMedium: {
      fontFamily: 'System',
      fontSize: 60,
      fontWeight: '700',
      lineHeight: 60 * 1.15,
      letterSpacing: -0.25,
    },
    displaySmall: {
      fontFamily: 'System',
      fontSize: 48,
      fontWeight: '600',
      lineHeight: 48 * 1.2,
      letterSpacing: 0,
    },

    // Headline styles
    headlineLarge: {
      fontFamily: 'System',
      fontSize: 36,
      fontWeight: '600',
      lineHeight: 36 * 1.25,
      letterSpacing: 0,
    },
    headlineMedium: {
      fontFamily: 'System',
      fontSize: 30,
      fontWeight: '600',
      lineHeight: 30 * 1.3,
      letterSpacing: 0,
    },
    headlineSmall: {
      fontFamily: 'System',
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 24 * 1.35,
      letterSpacing: 0,
    },

    // Title styles
    titleLarge: {
      fontFamily: 'System',
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 20 * 1.4,
      letterSpacing: 0,
    },
    titleMedium: {
      fontFamily: 'System',
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 18 * 1.4,
      letterSpacing: 0,
    },
    titleSmall: {
      fontFamily: 'System',
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 16 * 1.4,
      letterSpacing: 0,
    },

    // Body text styles
    bodyLarge: {
      fontFamily: 'System',
      fontSize: 18,
      fontWeight: '400',
      lineHeight: 18 * 1.5,
      letterSpacing: 0,
    },
    bodyMedium: {
      fontFamily: 'System',
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 16 * 1.5,
      letterSpacing: 0,
    },
    bodySmall: {
      fontFamily: 'System',
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 14 * 1.5,
      letterSpacing: 0,
    },

    // Label styles
    labelLarge: {
      fontFamily: 'System',
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 16 * 1.4,
      letterSpacing: 0.25,
    },
    labelMedium: {
      fontFamily: 'System',
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 14 * 1.4,
      letterSpacing: 0.25,
    },
    labelSmall: {
      fontFamily: 'System',
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 12 * 1.4,
      letterSpacing: 0.5,
    },

    // Caption styles
    caption: {
      fontFamily: 'System',
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 12 * 1.4,
      letterSpacing: 0.25,
    },
    overline: {
      fontFamily: 'System',
      fontSize: 10,
      fontWeight: '500',
      lineHeight: 10 * 1.4,
      letterSpacing: 1,
    },

    // Button styles
    buttonLarge: {
      fontFamily: 'System',
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 18 * 1.2,
      letterSpacing: 0.25,
    },
    buttonMedium: {
      fontFamily: 'System',
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 16 * 1.2,
      letterSpacing: 0.25,
    },
    buttonSmall: {
      fontFamily: 'System',
      fontSize: 14,
      fontWeight: '600',
      lineHeight: 14 * 1.2,
      letterSpacing: 0.25,
    },

    // Special yoga-related styles
    yogaQuote: {
      fontFamily: 'System',
      fontSize: 20,
      fontWeight: '400',
      lineHeight: 20 * 1.6,
      letterSpacing: 0,
      fontStyle: 'italic',
    },
    mantra: {
      fontFamily: 'System',
      fontSize: 16,
      fontWeight: '300',
      lineHeight: 16 * 1.8,
      letterSpacing: 1,
    },
  },
};

// Helper functions for typography
export const typographyHelpers = {
  // Get responsive font size based on screen size
  getResponsiveFontSize: (baseSize, screenWidth) => {
    if (screenWidth < 360) return baseSize * 0.9;
    if (screenWidth < 768) return baseSize;
    if (screenWidth < 1024) return baseSize * 1.1;
    return baseSize * 1.2;
  },

  // Apply text style to React Native Text component
  applyTextStyle: (styleName, customStyles = {}) => ({
    ...fonts.textStyles[styleName],
    ...customStyles,
  }),

  // Get font family based on priority
  getFontFamily: (priority = 'primary') =>
    fonts.families[priority] || fonts.families.system,

  // Create text style with custom properties
  createTextStyle: (options = {}) => ({
    fontFamily: fonts.families[options.family] || fonts.families.primary,
    fontSize: fonts.sizes[options.size] || fonts.sizes.base,
    fontWeight: fonts.weights[options.weight] || fonts.weights.normal,
    lineHeight: options.lineHeight
      ? (fonts.sizes[options.size] || fonts.sizes.base) *
        (fonts.lineHeights[options.lineHeight] || fonts.lineHeights.normal)
      : undefined,
    letterSpacing:
      fonts.letterSpacing[options.letterSpacing] || fonts.letterSpacing.normal,
    ...options.custom,
  }),
};

// Common text style combinations for quick use
export const commonTextStyles = {
  // Hero text
  hero: fonts.textStyles.displayLarge,

  // Section headers
  sectionHeader: fonts.textStyles.headlineMedium,

  // Card titles
  cardTitle: fonts.textStyles.titleMedium,

  // Body text
  body: fonts.textStyles.bodyMedium,

  // Small text
  small: fonts.textStyles.bodySmall,

  // Button text
  button: fonts.textStyles.buttonMedium,

  // Form labels
  label: fonts.textStyles.labelMedium,

  // Captions
  caption: fonts.textStyles.caption,

  // Error text
  error: {
    ...fonts.textStyles.bodySmall,
    fontWeight: fonts.weights.medium,
  },

  // Success text
  success: {
    ...fonts.textStyles.bodySmall,
    fontWeight: fonts.weights.medium,
  },

  // Link text
  link: {
    ...fonts.textStyles.bodyMedium,
    fontWeight: fonts.weights.medium,
  },
};

export default fonts;
