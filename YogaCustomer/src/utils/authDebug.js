import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Debug helper for authentication state
 */
export const AuthDebugger = {
  // Log authentication state changes
  logAuthStateChange: (user, loading, context = 'Unknown') => {
    const timestamp = new Date().toISOString();
    const logData = {
      context,
      timestamp,
      user: user
        ? {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            displayName: user.displayName,
          }
        : null,
      loading,
      isAuthenticated: !!user,
    };

    console.log(`🔐 [Auth State Change - ${context}]:`, logData);
    return logData;
  },

  // Clear onboarding flag for testing
  clearOnboardingFlag: async () => {
    try {
      await AsyncStorage.removeItem('@app_has_launched');
      console.log(
        '🔄 Onboarding flag cleared - app will show onboarding on next launch'
      );
    } catch (error) {
      console.error('❌ Error clearing onboarding flag:', error);
    }
  },

  // Check current onboarding status
  checkOnboardingStatus: async () => {
    try {
      const hasLaunched = await AsyncStorage.getItem('@app_has_launched');
      console.log(
        '📱 Onboarding status:',
        hasLaunched ? 'Completed' : 'Not completed'
      );
      return hasLaunched !== null;
    } catch (error) {
      console.error('❌ Error checking onboarding status:', error);
      return false;
    }
  },

  // Get all auth-related storage data
  getAuthStorageData: async () => {
    try {
      const data = {
        onboardingCompleted: await AsyncStorage.getItem('@app_has_launched'),
        // Add other auth-related storage keys here
      };
      console.log('💾 Auth storage data:', data);
      return data;
    } catch (error) {
      console.error('❌ Error getting auth storage data:', error);
      return {};
    }
  },

  // Clear all auth-related storage (for testing)
  clearAllAuthStorage: async () => {
    try {
      await AsyncStorage.removeItem('@app_has_launched');
      // Add other auth storage keys to clear
      console.log('🧹 All auth storage cleared');
    } catch (error) {
      console.error('❌ Error clearing auth storage:', error);
    }
  },

  // Test authentication flow
  testAuthFlow: () => {
    console.log('🧪 Testing Authentication Flow:');
    console.log('1. Check if user is authenticated');
    console.log('2. Check onboarding status');
    console.log('3. Navigate to appropriate screen');
    console.log('Use AuthDebugger methods to debug issues');
  },
};

// Development helper - only log in development
export const devLog = (message, data = {}) => {
  if (__DEV__) {
    console.log(`🔧 [Dev]: ${message}`, data);
  }
};

export default AuthDebugger;
