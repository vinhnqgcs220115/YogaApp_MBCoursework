import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { AuthDebugger } from '../../utils/authDebug';
import { colors } from '../../utils/colors';
import { fonts } from '../../utils/fonts';

const AuthTestScreen = ({ navigation }) => {
  const {
    user,
    userProfile,
    loading,
    error,
    isAuthenticated,
    logout,
    refreshUserData,
  } = useAuth();

  const handleClearOnboarding = async () => {
    await AuthDebugger.clearOnboardingFlag();
    Alert.alert(
      'Onboarding Cleared',
      'Restart the app to see onboarding screen again.'
    );
  };

  const handleCheckStorage = async () => {
    const data = await AuthDebugger.getAuthStorageData();
    Alert.alert('Storage Data', JSON.stringify(data, null, 2));
  };

  const handleLogout = async () => {
    try {
      await logout();
      console.log('✅ Logged out successfully');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  const handleRefreshData = async () => {
    try {
      await refreshUserData();
      Alert.alert('Success', 'User data refreshed!');
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>🔧 Auth Test Screen</Text>

        {/* Auth State Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Authentication State</Text>
          <Text style={styles.infoText}>Loading: {loading ? 'Yes' : 'No'}</Text>
          <Text style={styles.infoText}>
            Authenticated: {isAuthenticated ? 'Yes' : 'No'}
          </Text>
          <Text style={styles.infoText}>
            User: {user ? `${user.email} (${user.uid.slice(0, 8)}...)` : 'None'}
          </Text>
          <Text style={styles.infoText}>
            Profile:{' '}
            {userProfile ? `${userProfile.displayName || 'No name'}` : 'None'}
          </Text>
          {error && <Text style={styles.errorText}>Error: {error}</Text>}
        </View>

        {/* Test Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Actions</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={handleClearOnboarding}
          >
            <Text style={styles.buttonText}>Clear Onboarding Flag</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleCheckStorage}>
            <Text style={styles.buttonText}>Check Storage Data</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleRefreshData}>
            <Text style={styles.buttonText}>Refresh User Data</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => AuthDebugger.testAuthFlow()}
          >
            <Text style={styles.buttonText}>Log Test Info</Text>
          </TouchableOpacity>
        </View>

        {/* Navigation Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Navigation</Text>

          {isAuthenticated ? (
            <>
              <TouchableOpacity
                style={[styles.button, styles.logoutButton]}
                onPress={handleLogout}
              >
                <Text style={[styles.buttonText, styles.logoutButtonText]}>
                  Logout
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('Home')}
              >
                <Text style={styles.buttonText}>Go to Home</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('SignIn')}
              >
                <Text style={styles.buttonText}>Go to Sign In</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('SignUp')}
              >
                <Text style={styles.buttonText}>Go to Sign Up</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Debug Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Debug Info</Text>
          <Text style={styles.debugText}>
            This screen helps test authentication flow.
          </Text>
          <Text style={styles.debugText}>
            • Clear onboarding to see welcome screen again
          </Text>
          <Text style={styles.debugText}>
            • Check storage to see persisted data
          </Text>
          <Text style={styles.debugText}>
            • Watch console logs for detailed info
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    ...fonts.textStyles.headlineMedium,
    color: colors.text.primary,
    textAlign: 'center',
    marginVertical: 20,
    fontWeight: fonts.weights.bold,
  },
  section: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  sectionTitle: {
    ...fonts.textStyles.titleMedium,
    color: colors.text.primary,
    marginBottom: 12,
    fontWeight: fonts.weights.bold,
  },
  infoText: {
    ...fonts.textStyles.bodyMedium,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  errorText: {
    ...fonts.textStyles.bodyMedium,
    color: colors.error[600],
    marginBottom: 4,
    fontWeight: fonts.weights.medium,
  },
  debugText: {
    ...fonts.textStyles.bodySmall,
    color: colors.text.tertiary,
    marginBottom: 4,
    lineHeight: 18,
  },
  button: {
    backgroundColor: colors.secondary[500],
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  buttonText: {
    ...fonts.textStyles.buttonMedium,
    color: colors.neutral[0],
    fontWeight: fonts.weights.medium,
  },
  logoutButton: {
    backgroundColor: colors.error[500],
  },
  logoutButtonText: {
    color: colors.neutral[0],
  },
});

export default AuthTestScreen;
