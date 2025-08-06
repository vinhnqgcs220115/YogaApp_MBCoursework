// YogaScreen.js
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { colors } from '../../utils/colors';
import { fonts } from '../../utils/fonts';

const YogaScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🧘‍♀️ Yoga</Text>
        <Text style={styles.subtitle}>Discover Classes</Text>
        <Text style={styles.description}>
          Browse available yoga classes and book your sessions
        </Text>
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
    fontFamily: fonts.families.secondary,
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.semiBold,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  description: {
    fontFamily: fonts.families.primary,
    fontSize: fonts.sizes.base,
    fontWeight: fonts.weights.normal,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});

export default YogaScreen;
