import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { colors } from '../../utils/colors';
import { fonts } from '../../utils/fonts';

const Button = ({
  // Content
  title,
  children,

  // Behavior
  onPress,
  disabled = false,
  loading = false,

  // Appearance
  variant = 'primary', // primary, secondary, accent, outline, ghost, link
  size = 'medium', // small, medium, large
  fullWidth = false,

  // Icons
  leftIcon = null,
  rightIcon = null,

  // Custom styles
  style,
  textStyle,

  // Accessibility
  accessibilityLabel,
  accessibilityHint,

  // Advanced
  activeOpacity = 0.8,
  ...props
}) => {
  // Get button styles based on variant and size
  const getButtonStyles = () => {
    const baseStyles = [styles.button];

    // Size styles
    switch (size) {
      case 'small':
        baseStyles.push(styles.buttonSmall);
        break;
      case 'large':
        baseStyles.push(styles.buttonLarge);
        break;
      default:
        baseStyles.push(styles.buttonMedium);
        break;
    }

    // Variant styles
    switch (variant) {
      case 'secondary':
        baseStyles.push(styles.buttonSecondary);
        break;
      case 'accent':
        baseStyles.push(styles.buttonAccent);
        break;
      case 'outline':
        baseStyles.push(styles.buttonOutline);
        break;
      case 'ghost':
        baseStyles.push(styles.buttonGhost);
        break;
      case 'link':
        baseStyles.push(styles.buttonLink);
        break;
      default:
        baseStyles.push(styles.buttonPrimary);
        break;
    }

    // State styles
    if (disabled) {
      baseStyles.push(styles.buttonDisabled);
    }

    // Full width
    if (fullWidth) {
      baseStyles.push(styles.buttonFullWidth);
    }

    // Custom styles
    if (style) {
      baseStyles.push(style);
    }

    return baseStyles;
  };

  // Get text styles based on variant and size
  const getTextStyles = () => {
    const baseStyles = [styles.buttonText];

    // Size text styles
    switch (size) {
      case 'small':
        baseStyles.push(styles.buttonTextSmall);
        break;
      case 'large':
        baseStyles.push(styles.buttonTextLarge);
        break;
      default:
        baseStyles.push(styles.buttonTextMedium);
        break;
    }

    // Variant text styles
    switch (variant) {
      case 'secondary':
        baseStyles.push(styles.buttonTextSecondary);
        break;
      case 'accent':
        baseStyles.push(styles.buttonTextAccent);
        break;
      case 'outline':
        baseStyles.push(styles.buttonTextOutline);
        break;
      case 'ghost':
        baseStyles.push(styles.buttonTextGhost);
        break;
      case 'link':
        baseStyles.push(styles.buttonTextLink);
        break;
      default:
        baseStyles.push(styles.buttonTextPrimary);
        break;
    }

    // Disabled text style
    if (disabled) {
      baseStyles.push(styles.buttonTextDisabled);
    }

    // Custom text styles
    if (textStyle) {
      baseStyles.push(textStyle);
    }

    return baseStyles;
  };

  // Render button content
  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="small"
            color={
              variant === 'outline' || variant === 'ghost' || variant === 'link'
                ? colors.primary[500]
                : colors.neutral[0]
            }
          />
          {title && (
            <Text style={[getTextStyles(), styles.loadingText]}>{title}</Text>
          )}
        </View>
      );
    }

    return (
      <View style={styles.contentContainer}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        {children || <Text style={getTextStyles()}>{title}</Text>}

        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={getButtonStyles()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={activeOpacity}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      accessibilityState={{
        disabled: disabled || loading,
        busy: loading,
      }}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Base button styles
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'transparent',
  },

  // Size variations
  buttonSmall: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36,
  },
  buttonMedium: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    minHeight: 48,
  },
  buttonLarge: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    minHeight: 56,
  },

  // Variant styles
  buttonPrimary: {
    backgroundColor: colors.primary[500],
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonSecondary: {
    backgroundColor: colors.secondary[500],
    shadowColor: colors.secondary[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonAccent: {
    backgroundColor: colors.accent[500],
    shadowColor: colors.accent[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderColor: colors.primary[500],
    borderWidth: 2,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  buttonLink: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 4,
    minHeight: 'auto',
  },

  // State styles
  buttonDisabled: {
    backgroundColor: colors.neutral[200],
    borderColor: colors.neutral[200],
    shadowOpacity: 0,
    elevation: 0,
  },

  // Layout styles
  buttonFullWidth: {
    width: '100%',
  },

  // Text styles
  buttonText: {
    fontFamily: fonts.families.primary,
    fontWeight: fonts.weights.semiBold,
    textAlign: 'center',
  },

  // Text size variations
  buttonTextSmall: {
    fontSize: fonts.sizes.sm,
    lineHeight: fonts.sizes.sm * fonts.lineHeights.tight,
  },
  buttonTextMedium: {
    fontSize: fonts.sizes.base,
    lineHeight: fonts.sizes.base * fonts.lineHeights.tight,
  },
  buttonTextLarge: {
    fontSize: fonts.sizes.lg,
    lineHeight: fonts.sizes.lg * fonts.lineHeights.tight,
  },

  // Text color variations
  buttonTextPrimary: {
    color: colors.neutral[0],
  },
  buttonTextSecondary: {
    color: colors.neutral[0],
  },
  buttonTextAccent: {
    color: colors.neutral[0],
  },
  buttonTextOutline: {
    color: colors.primary[500],
  },
  buttonTextGhost: {
    color: colors.primary[500],
  },
  buttonTextLink: {
    color: colors.primary[500],
    textDecorationLine: 'underline',
  },
  buttonTextDisabled: {
    color: colors.neutral[400],
  },

  // Content layout
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Icon styles
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },

  // Loading styles
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: 8,
    opacity: 0.8,
  },
});

export default Button;
