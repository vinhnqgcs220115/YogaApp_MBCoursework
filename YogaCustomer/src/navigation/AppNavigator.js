import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Animated,
  StatusBar,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

import TabNavigator from './TabNavigator';
import AuthNavigator from './AuthNavigator';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';

const Stack = createStackNavigator();

// Loading Screen Component
const LoadingScreen = () => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.loadingContainer}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.secondary[500]}
        translucent={false}
      />

      <Animated.View
        style={[
          styles.loadingContent,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* App Logo/Icon */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🧘‍♀️</Text>
          <Text style={styles.logoText}>UniversalYoga</Text>
        </View>

        {/* Loading Indicator */}
        <View style={styles.loadingIndicatorContainer}>
          <ActivityIndicator
            size="large"
            color={colors.neutral[0]}
            style={styles.spinner}
          />
          <Text style={styles.loadingText}>Preparing your space...</Text>
        </View>

        {/* Decorative Elements */}
        <View style={styles.decorativeElements}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>
      </Animated.View>
    </View>
  );
};

const AppNavigator = () => {
  const { user, loading: authLoading } = useAuth();
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  const [appInitialized, setAppInitialized] = useState(false);

  // Check if this is the first app launch
  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        console.log('Checking first launch status...');
        const hasLaunchedBefore = await AsyncStorage.getItem(
          '@app_has_launched'
        );

        if (hasLaunchedBefore === null) {
          console.log('First launch detected');
          setIsFirstLaunch(true);
          // Mark that the app has been launched
          await AsyncStorage.setItem('@app_has_launched', 'true');
        } else {
          console.log('Not first launch');
          setIsFirstLaunch(false);
        }
      } catch (error) {
        console.error('Error checking first launch:', error);
        // Default to not first launch if there's an error
        setIsFirstLaunch(false);
      } finally {
        setAppInitialized(true);
      }
    };

    checkFirstLaunch();
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('AppNavigator state:', {
      user: user ? `${user.email} (${user.uid})` : 'null',
      authLoading,
      isFirstLaunch,
      appInitialized,
      timestamp: new Date().toISOString(),
    });
  }, [user, authLoading, isFirstLaunch, appInitialized]);

  // Show loading screen while checking first launch or auth state
  if (!appInitialized || authLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: colors.background.primary },
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                ],
              },
            };
          },
        }}
      >
        {!user ? (
          // User is not authenticated
          <>
            {isFirstLaunch && (
              <Stack.Screen
                name="Onboarding"
                component={OnboardingScreen}
                options={{
                  animationEnabled: false, // No animation for onboarding
                }}
              />
            )}
            <Stack.Screen
              name="Auth"
              component={AuthNavigator}
              options={{
                animationEnabled: !isFirstLaunch, // Animate only if not coming from onboarding
              }}
            />
          </>
        ) : (
          // User is authenticated
          <Stack.Screen
            name="MainApp"
            component={TabNavigator}
            options={{
              animationEnabled: true,
              cardStyleInterpolator: ({ current }) => ({
                cardStyle: {
                  opacity: current.progress,
                },
              }),
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.secondary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  logoText: {
    ...fonts.textStyles.displaySmall,
    color: colors.neutral[0],
    fontWeight: fonts.weights.bold,
    letterSpacing: 1,
  },
  loadingIndicatorContainer: {
    alignItems: 'center',
  },
  spinner: {
    marginBottom: 20,
  },
  loadingText: {
    ...fonts.textStyles.bodyLarge,
    color: colors.neutral[0],
    fontWeight: fonts.weights.medium,
    opacity: 0.9,
  },
  decorativeElements: {
    flexDirection: 'row',
    marginTop: 40,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral[0],
    marginHorizontal: 4,
    opacity: 0.6,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
    transform: [{ scale: 1.2 }],
  },
  dot3: {
    opacity: 0.4,
  },
});

export default AppNavigator;
