// SignInScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../utils/colors';
import { fonts } from '../../utils/fonts';

const { width } = Dimensions.get('window');

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const { signIn, error, clearError } = useAuth();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const formAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(formAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(
        'Missing Information',
        'Please enter both email and password'
      );
      return;
    }

    if (!validateEmail(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      clearError();
      await signIn(email.trim(), password);
    } catch (error) {
      // Error is handled by AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const goToSignUp = () => {
    clearError();
    navigation.navigate('SignUp');
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Reset Password',
      'Password reset functionality will be available soon.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const getInputStyle = (isFocused, hasError = false) => [
    styles.input,
    isFocused && styles.inputFocused,
    hasError && styles.inputError,
  ];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Header Section */}
            <View style={styles.header}>
              <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeEmoji}>👋</Text>
                <Text style={styles.title}>Welcome back</Text>
              </View>
              <Text style={styles.subtitle}>
                Sign in to continue your yoga journey with UniversalYoga
              </Text>
            </View>

            {/* Decorative Element */}
            <View style={styles.decorativeContainer}>
              <View style={[styles.decorativeCircle, styles.circle1]} />
              <View style={[styles.decorativeCircle, styles.circle2]} />
              <View style={[styles.decorativeCircle, styles.circle3]} />
            </View>

            {/* Form Section */}
            <Animated.View
              style={[
                styles.formContainer,
                {
                  transform: [{ translateY: formAnim }],
                },
              ]}
            >
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email address</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>📧</Text>
                  <TextInput
                    style={getInputStyle(emailFocused)}
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.text.placeholder}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>🔒</Text>
                  <TextInput
                    style={getInputStyle(passwordFocused)}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.text.placeholder}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    returnKeyType="done"
                    onSubmitEditing={handleSignIn}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={styles.eyeIconText}>
                      {showPassword ? '🙈' : '👁️'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Error Message */}
              {error && (
                <Animated.View
                  style={styles.errorContainer}
                  entering={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Text style={styles.errorIcon}>⚠️</Text>
                  <Text style={styles.errorText}>{error}</Text>
                </Animated.View>
              )}

              {/* Forgot Password */}
              <TouchableOpacity
                style={styles.forgotPasswordContainer}
                onPress={handleForgotPassword}
              >
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>

              {/* Sign In Button */}
              <TouchableOpacity
                style={[
                  styles.signInButton,
                  isLoading && styles.signInButtonDisabled,
                ]}
                onPress={handleSignIn}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color={colors.neutral[0]} size="small" />
                    <Text style={styles.loadingText}>Signing in...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.signInButtonText}>Sign In</Text>
                    <Text style={styles.buttonArrow}>→</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Sign Up Link */}
              <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>Don't have an account? </Text>
                <TouchableOpacity onPress={goToSignUp}>
                  <Text style={styles.signUpLink}>Sign up here</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    minHeight: '100%',
  },
  header: {
    marginBottom: 32,
  },
  welcomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  welcomeEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  title: {
    ...fonts.textStyles.headlineMedium,
    color: colors.text.primary,
    fontWeight: fonts.weights.bold,
  },
  subtitle: {
    ...fonts.textStyles.bodyLarge,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  decorativeContainer: {
    position: 'relative',
    height: 60,
    marginBottom: 32,
    overflow: 'hidden',
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 20,
    opacity: 0.1,
  },
  circle1: {
    width: 80,
    height: 40,
    backgroundColor: colors.secondary[500],
    top: 0,
    left: '20%',
    transform: [{ rotate: '15deg' }],
  },
  circle2: {
    width: 60,
    height: 30,
    backgroundColor: colors.success[500],
    top: 20,
    right: '25%',
    transform: [{ rotate: '-10deg' }],
  },
  circle3: {
    width: 40,
    height: 20,
    backgroundColor: colors.error[400],
    top: 10,
    left: '60%',
    transform: [{ rotate: '25deg' }],
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    ...fonts.textStyles.labelMedium,
    color: colors.text.secondary,
    marginBottom: 8,
    fontWeight: fonts.weights.semiBold,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    fontSize: 16,
    zIndex: 1,
  },
  input: {
    flex: 1,
    backgroundColor: colors.input.background,
    borderWidth: 2,
    borderColor: colors.input.border,
    borderRadius: 16,
    paddingHorizontal: 48,
    paddingVertical: 16,
    ...fonts.textStyles.bodyMedium,
    color: colors.text.primary,
    shadowColor: colors.neutral[300],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputFocused: {
    borderColor: colors.secondary[500],
    backgroundColor: colors.secondary[50],
    shadowColor: colors.secondary[200],
    shadowOpacity: 0.3,
    elevation: 4,
  },
  inputError: {
    borderColor: colors.error[500],
    backgroundColor: colors.error[50],
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  eyeIconText: {
    fontSize: 18,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.alerts.error.background,
    borderWidth: 1,
    borderColor: colors.alerts.error.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  errorIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  errorText: {
    flex: 1,
    ...fonts.textStyles.bodySmall,
    color: colors.alerts.error.text,
    fontWeight: fonts.weights.medium,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 32,
  },
  forgotPasswordText: {
    ...fonts.textStyles.labelMedium,
    color: colors.secondary[600],
    fontWeight: fonts.weights.semiBold,
  },
  signInButton: {
    backgroundColor: colors.secondary[500],
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: colors.secondary[500],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  signInButtonDisabled: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signInButtonText: {
    ...fonts.textStyles.buttonLarge,
    color: colors.neutral[0],
    marginRight: 8,
  },
  buttonArrow: {
    color: colors.neutral[0],
    fontSize: 18,
    fontWeight: fonts.weights.bold,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    ...fonts.textStyles.buttonMedium,
    color: colors.neutral[0],
    marginLeft: 12,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.light,
  },
  dividerText: {
    ...fonts.textStyles.labelSmall,
    color: colors.text.tertiary,
    paddingHorizontal: 16,
    backgroundColor: colors.background.primary,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  signUpText: {
    ...fonts.textStyles.bodyMedium,
    color: colors.text.secondary,
  },
  signUpLink: {
    ...fonts.textStyles.bodyMedium,
    color: colors.secondary[600],
    fontWeight: fonts.weights.semiBold,
  },
});

export default SignInScreen;
