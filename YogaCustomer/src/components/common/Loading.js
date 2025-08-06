import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { colors } from '../../utils/colors';
import { fonts } from '../../utils/fonts';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const Loading = ({
  // Content
  message = 'Loading...',
  submessage = null,

  // Appearance
  variant = 'default', // default, overlay, inline, minimal
  size = 'medium', // small, medium, large
  color = null,

  // Layout
  fullScreen = false,

  // Custom styles
  style,
  textStyle,

  // Animation
  animating = true,

  ...props
}) => {
  // Get loading size
  const getLoadingSize = () => {
    switch (size) {
      case 'small':
        return 'small';
      case 'large':
        return 'large';
      default:
        return 'small';
    }
  };

  // Get loading color
  const getLoadingColor = () => {
    if (color) return color;

    switch (variant) {
      case 'overlay':
        return colors.neutral[0];
      case 'minimal':
        return colors.primary[500];
      default:
        return colors.primary[500];
    }
  };

  // Get container styles
  const getContainerStyles = () => {
    const baseStyles = [styles.container];

    switch (variant) {
      case 'overlay':
        baseStyles.push(styles.overlay);
        if (fullScreen) {
          baseStyles.push(styles.fullScreen);
        }
        break;
      case 'inline':
        baseStyles.push(styles.inline);
        break;
      case 'minimal':
        baseStyles.push(styles.minimal);
        break;
      default:
        baseStyles.push(styles.default);
        break;
    }

    if (style) {
      baseStyles.push(style);
    }

    return baseStyles;
  };

  // Get text styles
  const getTextStyles = () => {
    const baseStyles = [styles.message];

    switch (variant) {
      case 'overlay':
        baseStyles.push(styles.overlayText);
        break;
      case 'minimal':
        baseStyles.push(styles.minimalText);
        break;
      default:
        baseStyles.push(styles.defaultText);
        break;
    }

    if (textStyle) {
      baseStyles.push(textStyle);
    }

    return baseStyles;
  };

  // Render yoga-themed loading animation (simple version)
  const renderYogaSpinner = () => (
    <View style={styles.yogaSpinner}>
      <ActivityIndicator
        size={getLoadingSize()}
        color={getLoadingColor()}
        animating={animating}
      />
    </View>
  );

  return (
    <View style={getContainerStyles()} {...props}>
      <View style={styles.content}>
        {renderYogaSpinner()}

        {message && <Text style={getTextStyles()}>{message}</Text>}

        {submessage && (
          <Text style={[getTextStyles(), styles.submessage]}>{submessage}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Base container
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Variant styles
  default: {
    padding: 20,
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    minWidth: 120,
    minHeight: 120,
  },

  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background.overlay,
    zIndex: 1000,
  },

  fullScreen: {
    width: screenWidth,
    height: screenHeight,
  },

  inline: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  minimal: {
    padding: 8,
  },

  // Content
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Yoga spinner
  yogaSpinner: {
    marginBottom: 16,
  },

  // Text styles
  message: {
    fontFamily: fonts.families.primary,
    fontSize: fonts.sizes.base,
    fontWeight: fonts.weights.medium,
    textAlign: 'center',
    marginBottom: 4,
  },

  submessage: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.normal,
    opacity: 0.8,
    marginTop: 8,
    marginBottom: 0,
  },

  // Text color variations
  defaultText: {
    color: colors.text.primary,
  },

  overlayText: {
    color: colors.text.inverse,
  },

  minimalText: {
    color: colors.text.secondary,
  },
});
