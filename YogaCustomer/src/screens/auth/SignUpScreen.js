// SignUpScreen.js
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

const SignUpScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const { signUp, error, clearError } = useAuth();

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

  const updateFormData = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear field-specific validation error
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Username validation
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.trim().length < 2) {
      errors.username = 'Username must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])/.test(formData.password)) {
      errors.password = 'Password must contain uppercase and lowercase letters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      clearError();
      console.log('Starting sign up...', {
        email: formData.email,
        username: formData.username,
      });

      await signUp(
        formData.email.trim(),
        formData.password,
        formData.username.trim()
      );

      console.log('Sign up successful');
    } catch (error) {
      console.log('Sign up error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const goToSignIn = () => {
    clearError();
    navigation.navigate('SignIn');
  };

  const getInputStyle = (fieldName) => [
    styles.input,
    focusedField === fieldName && styles.inputFocused,
    validationErrors[fieldName] && styles.inputError,
  ];

  const getPasswordStrength = (password) => {
    if (!password)
      return { strength: 0, label: '', color: colors.neutral[300] };

    let strength = 0;
    const checks = {
      length: password.length >= 6,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    strength = Object.values(checks).filter(Boolean).length;

    if (strength <= 2)
      return { strength, label: 'Weak', color: colors.error[500] };
    if (strength <= 3)
      return { strength, label: 'Fair', color: colors.error[400] };
    if (strength <= 4)
      return { strength, label: 'Good', color: colors.success[400] };
    return { strength, label: 'Strong', color: colors.success[500] };
  };

  const passwordStrength = getPasswordStrength(formData.password);

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
                <Text style={styles.welcomeEmoji}>✨</Text>
                <Text style={styles.title}>Create Account</Text>
              </View>
              <Text style={styles.subtitle}>
                Join UniversalYoga and start your journey to inner peace
              </Text>
            </View>

            {/* Decorative Element */}
            <View style={styles.decorativeContainer}>
              <View style={[styles.decorativeCircle, styles.circle1]} />
              <View style={[styles.decorativeCircle, styles.circle2]} />
              <View style={[styles.decorativeCircle, styles.circle3]} />
              <View style={[styles.decorativeCircle, styles.circle4]} />
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
              {/* Username Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Username</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>👤</Text>
                  <TextInput
                    style={getInputStyle('username')}
                    value={formData.username}
                    onChangeText={(value) => updateFormData('username', value)}
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Enter your username"
                    placeholderTextColor={colors.text.placeholder}
                    autoCapitalize="words"
                    autoCorrect={false}
                    returnKeyType="next"
                  />
                </View>
                {validationErrors.username && (
                  <Text style={styles.fieldError}>
                    {validationErrors.username}
                  </Text>
                )}
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email address</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>📧</Text>
                  <TextInput
                    style={getInputStyle('email')}
                    value={formData.email}
                    onChangeText={(value) => updateFormData('email', value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.text.placeholder}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                  />
                </View>
                {validationErrors.email && (
                  <Text style={styles.fieldError}>
                    {validationErrors.email}
                  </Text>
                )}
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>🔒</Text>
                  <TextInput
                    style={getInputStyle('password')}
                    value={formData.password}
                    onChangeText={(value) => updateFormData('password', value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Create a secure password"
                    placeholderTextColor={colors.text.placeholder}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    returnKeyType="next"
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

                {/* Password Strength Indicator */}
                {formData.password.length > 0 && (
                  <View style={styles.passwordStrengthContainer}>
                    <View style={styles.strengthBarContainer}>
                      {[1, 2, 3, 4, 5].map((level) => (
                        <View
                          key={level}
                          style={[
                            styles.strengthBar,
                            {
                              backgroundColor:
                                level <= passwordStrength.strength
                                  ? passwordStrength.color
                                  : colors.neutral[200],
                            },
                          ]}
                        />
                      ))}
                    </View>
                    <Text
                      style={[
                        styles.strengthLabel,
                        { color: passwordStrength.color },
                      ]}
                    >
                      {passwordStrength.label}
                    </Text>
                  </View>
                )}

                {validationErrors.password && (
                  <Text style={styles.fieldError}>
                    {validationErrors.password}
                  </Text>
                )}
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm password</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>🔐</Text>
                  <TextInput
                    style={getInputStyle('confirmPassword')}
                    value={formData.confirmPassword}
                    onChangeText={(value) =>
                      updateFormData('confirmPassword', value)
                    }
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Confirm your password"
                    placeholderTextColor={colors.text.placeholder}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    returnKeyType="done"
                    onSubmitEditing={handleSignUp}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Text style={styles.eyeIconText}>
                      {showConfirmPassword ? '🙈' : '👁️'}
                    </Text>
                  </TouchableOpacity>
                </View>
                {validationErrors.confirmPassword && (
                  <Text style={styles.fieldError}>
                    {validationErrors.confirmPassword}
                  </Text>
                )}
              </View>

              {/* Global Error Message */}
              {error && (
                <Animated.View style={styles.errorContainer}>
                  <Text style={styles.errorIcon}>⚠️</Text>
                  <Text style={styles.errorText}>{error}</Text>
                </Animated.View>
              )}

              {/* Terms and Privacy */}
              <View style={styles.termsContainer}>
                <Text style={styles.termsText}>
                  By creating an account, you agree to our{' '}
                  <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </View>

              {/* Sign Up Button */}
              <TouchableOpacity
                style={[
                  styles.signUpButton,
                  isLoading && styles.signUpButtonDisabled,
                ]}
                onPress={handleSignUp}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color={colors.neutral[0]} size="small" />
                    <Text style={styles.loadingText}>Creating account...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.signUpButtonText}>Create Account</Text>
                    <Text style={styles.buttonArrow}>✨</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Sign In Link */}
              <View style={styles.signInContainer}>
                <Text style={styles.signInText}>Already have an account? </Text>
                <TouchableOpacity onPress={goToSignIn}>
                  <Text style={styles.signInLink}>Sign in here</Text>
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
    borderRadius: 15,
    opacity: 0.1,
  },
  circle1: {
    width: 60,
    height: 30,
    backgroundColor: colors.secondary[500],
    top: 5,
    left: '15%',
    transform: [{ rotate: '20deg' }],
  },
  circle2: {
    width: 40,
    height: 20,
    backgroundColor: colors.success[500],
    top: 25,
    right: '30%',
    transform: [{ rotate: '-15deg' }],
  },
  circle3: {
    width: 50,
    height: 25,
    backgroundColor: colors.error[400],
    top: 0,
    right: '15%',
    transform: [{ rotate: '30deg' }],
  },
  circle4: {
    width: 35,
    height: 18,
    backgroundColor: colors.secondary[300],
    top: 35,
    left: '50%',
    transform: [{ rotate: '-25deg' }],
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
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
  fieldError: {
    ...fonts.textStyles.caption,
    color: colors.error[600],
    marginTop: 6,
    marginLeft: 4,
    fontWeight: fonts.weights.medium,
  },
  passwordStrengthContainer: {
    marginTop: 8,
    marginLeft: 4,
  },
  strengthBarContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  strengthBar: {
    flex: 1,
    height: 3,
    marginRight: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    ...fonts.textStyles.caption,
    fontWeight: fonts.weights.semiBold,
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
  termsContainer: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  termsText: {
    ...fonts.textStyles.bodySmall,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: colors.secondary[600],
    fontWeight: fonts.weights.semiBold,
  },
  signUpButton: {
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
  signUpButtonDisabled: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signUpButtonText: {
    ...fonts.textStyles.buttonLarge,
    color: colors.neutral[0],
    marginRight: 8,
  },
  buttonArrow: {
    color: colors.neutral[0],
    fontSize: 18,
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
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  signInText: {
    ...fonts.textStyles.bodyMedium,
    color: colors.text.secondary,
  },
  signInLink: {
    ...fonts.textStyles.bodyMedium,
    color: colors.secondary[600],
    fontWeight: fonts.weights.semiBold,
  },
});

export default SignUpScreen;
