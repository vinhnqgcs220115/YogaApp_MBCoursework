// ProfileScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../utils/colors';
import { fonts } from '../../utils/fonts';

const ProfileScreen = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>👤 Profile</Text>
        <Text style={styles.subtitle}>
          Welcome, {user?.displayName || user?.email}
        </Text>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontFamily: fonts.families.secondary,
    fontSize: fonts.sizes['4xl'],
    fontWeight: fonts.weights.bold,
    color: colors.text.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: fonts.families.primary,
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.medium,
    color: colors.text.secondary,
    marginBottom: 30,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: colors.error[500],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  logoutButtonText: {
    fontFamily: fonts.families.primary,
    fontSize: fonts.sizes.base,
    fontWeight: fonts.weights.semiBold,
    color: colors.neutral[0],
  },
});

export default ProfileScreen;
