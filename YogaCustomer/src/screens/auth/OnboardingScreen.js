import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { colors } from '../../utils/colors';
import { fonts } from '../../utils/fonts';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }) => {
  const handleGetStarted = () => {
    console.log('Navigating to Auth');
    navigation.navigate('Auth');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>🧘‍♀️</Text>
            <Text style={styles.appName}>ZenFlow</Text>
          </View>
        </View>

        {/* Illustration Area - inspired by your Figma design */}
        <View style={styles.illustrationContainer}>
          <View style={styles.waveContainer}>
            <View style={[styles.wave, styles.wave1]} />
            <View style={[styles.wave, styles.wave2]} />
            <View style={[styles.wave, styles.wave3]} />
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            Discover tranquility through yoga and meditation
          </Text>
          <Text style={styles.subtitle}>
            Unwind, recharge, and find your inner peace with our gentle and
            guided exercises.
          </Text>
        </View>

        {/* Action Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <Text style={styles.getStartedButtonText}>Get Started</Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 20,
    alignItems: 'flex-start',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    marginRight: 8,
  },
  appName: {
    ...fonts.heading2,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 40,
  },
  waveContainer: {
    width: width * 0.8,
    height: height * 0.3,
    position: 'relative',
  },
  wave: {
    position: 'absolute',
    width: '100%',
    height: 60,
    borderRadius: 30,
    opacity: 0.6,
  },
  wave1: {
    backgroundColor: '#E8F4FD',
    top: '20%',
    transform: [{ rotate: '-5deg' }],
  },
  wave2: {
    backgroundColor: '#D1E7DD',
    top: '40%',
    transform: [{ rotate: '3deg' }],
  },
  wave3: {
    backgroundColor: '#F8D7DA',
    top: '60%',
    transform: [{ rotate: '-2deg' }],
  },
  textContainer: {
    paddingBottom: 40,
  },
  title: {
    ...fonts.heading2,
    color: colors.textPrimary,
    textAlign: 'left',
    marginBottom: 16,
    lineHeight: 36,
  },
  subtitle: {
    ...fonts.body,
    color: colors.textSecondary,
    textAlign: 'left',
    lineHeight: 24,
  },
  buttonContainer: {
    paddingBottom: 40,
  },
  getStartedButton: {
    backgroundColor: colors.dark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  getStartedButtonText: {
    ...fonts.button,
    color: colors.white,
    marginRight: 8,
  },
  arrow: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '500',
  },
});

export default OnboardingScreen;
