import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../utils/colors';
import { fonts } from '../../utils/fonts';

const ErrorMessage = ({
  // Content
  message,
  title = 'Oops! Something went wrong',
  description = null,

  // Actions
  onRetry = null,
  onDismiss = null,
  retryButtonText = 'Try Again',
  dismissButtonText = 'Dismiss',

  // Appearance
  variant = 'default', // default, inline, banner, card
  severity = 'error', // error, warning, info

  // Icons
  showIcon = true,
  customIcon = null,

  // Layout
  fullWidth = false,

  // Custom styles
  style,
  titleStyle,
  messageStyle,

  // Accessibility
  accessibilityLabel,

  ...props
}) => {
  // Get container styles based on variant
  const getContainerStyles = () => {
    const baseStyles = [styles.container];

    switch (variant) {
      case 'inline':
        baseStyles.push(styles.inline);
        break;
      case 'banner':
        baseStyles.push(styles.banner);
        break;
      case 'card':
        baseStyles.push(styles.card);
        break;
      default:
        baseStyles.push(styles.default);
        break;
    }

    // Severity styles
    switch (severity) {
      case 'warning':
        baseStyles.push(styles.warning);
        break;
      case 'info':
        baseStyles.push(styles.info);
        break;
      default:
        baseStyles.push(styles.error);
        break;
    }

    if (fullWidth) {
      baseStyles.push(styles.fullWidth);
    }

    if (style) {
      baseStyles.push(style);
    }

    return baseStyles;
  };

  // Get icon based on severity
  const getIcon = () => {
    if (customIcon) return customIcon;
    if (!showIcon) return null;

    // For now, we'll use text icons. In a real app, you'd use icon libraries
    switch (severity) {
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '❌';
    }
  };

  // Get colors based on severity
  const getSeverityColors = () => {
    switch (severity) {
      case 'warning':
        return {
          background: colors.warning[50],
          border: colors.warning[200],
          text: colors.warning[800],
          button: colors.warning[600],
        };
      case 'info':
        return {
          background: colors.primary[50],
          border: colors.primary[200],
          text: colors.primary[800],
          button: colors.primary[600],
        };
      default:
        return {
          background: colors.error[50],
          border: colors.error[200],
          text: colors.error[800],
          button: colors.error[600],
        };
    }
  };

  const severityColors = getSeverityColors();
  const icon = getIcon();

  return (
    <View
      style={getContainerStyles()}
      accessibilityLabel={accessibilityLabel || message || title}
      accessibilityRole="alert"
      {...props}
    >
      {/* Icon and Content Row */}
      <View style={styles.contentRow}>
        {icon && (
          <View style={styles.iconContainer}>
            {typeof icon === 'string' ? (
              <Text style={styles.iconText}>{icon}</Text>
            ) : (
              icon
            )}
          </View>
        )}

        <View style={styles.textContainer}>
          {/* Title */}
          {title && (
            <Text
              style={[styles.title, { color: severityColors.text }, titleStyle]}
            >
              {title}
            </Text>
          )}

          {/* Message */}
          {message && (
            <Text
              style={[
                styles.message,
                { color: severityColors.text },
                messageStyle,
              ]}
            >
              {message}
            </Text>
          )}

          {/* Description */}
          {description && (
            <Text style={[styles.description, { color: severityColors.text }]}>
              {description}
            </Text>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      {(onRetry || onDismiss) && (
        <View style={styles.actionContainer}>
          {onRetry && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.retryButton,
                { backgroundColor: severityColors.button },
              ]}
              onPress={onRetry}
              accessibilityRole="button"
              accessibilityLabel={retryButtonText}
            >
              <Text style={styles.actionButtonText}>{retryButtonText}</Text>
            </TouchableOpacity>
          )}

          {onDismiss && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.dismissButton,
                { borderColor: severityColors.button },
              ]}
              onPress={onDismiss}
              accessibilityRole="button"
              accessibilityLabel={dismissButtonText}
            >
              <Text
                style={[
                  styles.actionButtonText,
                  styles.dismissButtonText,
                  { color: severityColors.button },
                ]}
              >
                {dismissButtonText}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Base container
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginVertical: 8,
  },

  // Variant styles
  default: {
    backgroundColor: colors.error[50],
    borderColor: colors.error[200],
  },

  inline: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 8,
    marginVertical: 4,
  },

  banner: {
    borderRadius: 0,
    marginVertical: 0,
    paddingVertical: 12,
  },

  card: {
    backgroundColor: colors.background.primary,
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Severity styles (colors applied dynamically)
  error: {},
  warning: {},
  info: {},

  // Layout
  fullWidth: {
    width: '100%',
  },

  // Content layout
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },

  iconText: {
    fontSize: 20,
  },

  textContainer: {
    flex: 1,
  },

  // Text styles
  title: {
    fontFamily: fonts.families.primary,
    fontSize: fonts.sizes.base,
    fontWeight: fonts.weights.semiBold,
    lineHeight: fonts.sizes.base * fonts.lineHeights.tight,
    marginBottom: 4,
  },

  message: {
    fontFamily: fonts.families.primary,
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.medium,
    lineHeight: fonts.sizes.sm * fonts.lineHeights.normal,
    marginBottom: 2,
  },

  description: {
    fontFamily: fonts.families.primary,
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.normal,
    lineHeight: fonts.sizes.sm * fonts.lineHeights.normal,
    opacity: 0.8,
  },

  // Action buttons
  actionContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },

  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },

  retryButton: {
    // Background color applied dynamically
  },

  dismissButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    // Border color applied dynamically
  },

  actionButtonText: {
    fontFamily: fonts.families.primary,
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.semiBold,
    color: colors.neutral[0],
  },

  dismissButtonText: {
    // Color applied dynamically
  },
});

export default ErrorMessage;
