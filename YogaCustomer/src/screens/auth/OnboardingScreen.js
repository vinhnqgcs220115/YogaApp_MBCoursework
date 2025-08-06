import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import { colors } from '../../utils/colors';
import { fonts } from '../../utils/fonts';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }) => {
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const buttonAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Entrance animation sequence
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.spring(slideUpAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(buttonAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGetStarted = () => {
    // Navigate to Sign In screen (default auth screen)
    console.log('Navigating to auth flow...');
    navigation.replace('Auth', { screen: 'SignIn' });
  };

  const handleSignUp = () => {
    // Navigate directly to Sign Up screen
    console.log('Navigating to sign up...');
    navigation.replace('Auth', { screen: 'SignUp' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.secondary[600]}
        translucent={false}
      />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }, { scale: scaleAnim }],
          },
        ]}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          {/* Main Illustration/Logo */}
          <View style={styles.illustrationContainer}>
            <Text style={styles.heroEmoji}>🧘‍♀️</Text>
            <View style={styles.rippleContainer}>
              <View style={[styles.ripple, styles.ripple1]} />
              <View style={[styles.ripple, styles.ripple2]} />
              <View style={[styles.ripple, styles.ripple3]} />
            </View>
          </View>

          {/* Welcome Text */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Welcome to</Text>
            <Text style={styles.appName}>ZenFlow</Text>
            <Text style={styles.tagline}>
              Find your inner peace through guided yoga sessions
            </Text>
          </View>

          {/* Features List */}
          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>🌟</Text>
              <Text style={styles.featureText}>Expert-led yoga classes</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>📅</Text>
              <Text style={styles.featureText}>Flexible scheduling</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>🏆</Text>
              <Text style={styles.featureText}>Track your progress</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <Animated.View
          style={[
            styles.actionContainer,
            {
              transform: [{ translateY: buttonAnim }],
            },
          ]}
        >
          {/* Primary CTA - Sign Up */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSignUp}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.primaryButtonText}>Get Started Free</Text>
              <Text style={styles.buttonArrow}>✨</Text>
            </View>
          </TouchableOpacity>

          {/* Secondary CTA - Sign In */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>
              Already have an account? Sign In
            </Text>
          </TouchableOpacity>

          {/* Terms Notice */}
          <Text style={styles.termsText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </Animated.View>
      </Animated.View>

      {/* Background Decorations */}
      <View style={styles.backgroundDecorations}>
        <View style={[styles.decoration, styles.decoration1]} />
        <View style={[styles.decoration, styles.decoration2]} />
        <View style={[styles.decoration, styles.decoration3]} />
        <View style={[styles.decoration, styles.decoration4]} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary[500],
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingBottom: 40,
  },
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  heroEmoji: {
    fontSize: 120,
    marginBottom: 20,
  },
  rippleContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -60 }, { translateY: -60 }],
  },
  ripple: {
    position: 'absolute',
    borderRadius: 60,
    borderWidth: 2,
    borderColor: colors.neutral[0],
    opacity: 0.3,
  },
  ripple1: {
    width: 120,
    height: 120,
  },
  ripple2: {
    width: 160,
    height: 160,
    top: -20,
    left: -20,
    opacity: 0.2,
  },
  ripple3: {
    width: 200,
    height: 200,
    top: -40,
    left: -40,
    opacity: 0.1,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  welcomeTitle: {
    ...fonts.textStyles.headlineLarge,
    color: colors.neutral[0],
    fontWeight: fonts.weights.light,
    marginBottom: 8,
    opacity: 0.9,
  },
  appName: {
    ...fonts.textStyles.displayMedium,
    color: colors.neutral[0],
    fontWeight: fonts.weights.bold,
    marginBottom: 16,
    letterSpacing: 1,
  },
  tagline: {
    ...fonts.textStyles.bodyLarge,
    color: colors.neutral[0],
    textAlign: 'center',
    lineHeight: 28,
    opacity: 0.9,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    alignItems: 'flex-start',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  featureText: {
    ...fonts.textStyles.bodyMedium,
    color: colors.neutral[0],
    fontWeight: fonts.weights.medium,
    opacity: 0.9,
  },
  actionContainer: {
    paddingTop: 20,
  },
  primaryButton: {
    backgroundColor: colors.neutral[0],
    borderRadius: 16,
    paddingVertical: 18,
    marginBottom: 16,
    shadowColor: colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    ...fonts.textStyles.buttonLarge,
    color: colors.secondary[600],
    fontWeight: fonts.weights.bold,
    marginRight: 8,
  },
  buttonArrow: {
    fontSize: 18,
    color: colors.secondary[600],
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: colors.neutral[0],
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    ...fonts.textStyles.buttonMedium,
    color: colors.neutral[0],
    textAlign: 'center',
    fontWeight: fonts.weights.semiBold,
  },
  termsText: {
    ...fonts.textStyles.caption,
    color: colors.neutral[0],
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  backgroundDecorations: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  decoration: {
    position: 'absolute',
    borderRadius: 20,
    opacity: 0.1,
    backgroundColor: colors.neutral[0],
  },
  decoration1: {
    width: 100,
    height: 100,
    top: '10%',
    right: '10%',
    transform: [{ rotate: '45deg' }],
  },
  decoration2: {
    width: 60,
    height: 60,
    top: '20%',
    left: '5%',
    transform: [{ rotate: '-30deg' }],
  },
  decoration3: {
    width: 80,
    height: 80,
    bottom: '15%',
    right: '5%',
    transform: [{ rotate: '15deg' }],
  },
  decoration4: {
    width: 40,
    height: 40,
    bottom: '25%',
    left: '10%',
    transform: [{ rotate: '-45deg' }],
  },
});

export default OnboardingScreen;
