import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { colors } from '../../utils/colors';
import { fonts } from '../../utils/fonts';

const HomeScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🏠 Home</Text>
        <Text style={styles.subtitle}>Welcome to Universal Yoga</Text>
        <Text style={styles.description}>
          Your personalized yoga journey starts here
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    ...fonts.heading1,
    color: colors.textPrimary,
    marginBottom: 10,
  },
  subtitle: {
    ...fonts.heading3,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  description: {
    ...fonts.body,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});

export default HomeScreen;
