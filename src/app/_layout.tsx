import React, { useState, useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider, Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme, View, StyleSheet, Platform, StatusBar } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import PremiumSplashScreen from '@/components/PremiumSplashScreen';
import OnboardingScreen from '@/components/OnboardingScreen';
import AuthScreens from '@/components/AuthScreens';
import AppTabs from '@/components/app-tabs';

SplashScreen.preventAutoHideAsync();

// Evaluated once at module load — safe outside the component
const isWeb = Platform.OS === 'web';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // Mobile only: full onboarding flow
  const [flowState, setFlowState] = useState<'splash' | 'onboarding' | 'auth' | 'app'>('splash');

  const onboardingOpacity = useSharedValue(0);
  const authOpacity = useSharedValue(0);
  const appOpacity = useSharedValue(0);

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  const handleSplashFinish = () => {
    setFlowState('onboarding');
    onboardingOpacity.value = withTiming(1, { duration: 600 });
  };

  const handleOnboardingComplete = () => {
    onboardingOpacity.value = withTiming(0, { duration: 500 }, (finished) => {
      if (finished) {
        runOnJS(setFlowState)('auth');
        authOpacity.value = withTiming(1, { duration: 500 });
      }
    });
  };

  const handleAuthSuccess = () => {
    authOpacity.value = withTiming(0, { duration: 500 }, (finished) => {
      if (finished) {
        runOnJS(setFlowState)('app');
        appOpacity.value = withTiming(1, { duration: 500 });
      }
    });
  };

  const animatedOnboardingStyle = useAnimatedStyle(() => ({
    flex: 1,
    opacity: onboardingOpacity.value,
  }));

  const animatedAuthStyle = useAnimatedStyle(() => ({
    flex: 1,
    opacity: authOpacity.value,
  }));

  const animatedAppStyle = useAnimatedStyle(() => ({
    flex: 1,
    opacity: appOpacity.value,
  }));

  // ── WEB: render current route via <Slot /> inside centered phone frame ──
  if (isWeb) {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <View style={styles.webOuterContainer}>
          <LinearGradient
            colors={['#FFE4EC', '#FFF0F5', '#FFE4EC']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.glowBlob} />
          <View style={styles.phoneFrame}>
            {/* Notch pill */}
            <View style={styles.phoneSpeaker} />
            {/* Slot renders the matched route: index.tsx, explore.tsx, etc. */}
            <Slot />
          </View>
        </View>
      </ThemeProvider>
    );
  }

  // ── NATIVE: full splash → onboarding → auth → app flow ──
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={styles.container}>
        {flowState === 'splash' && (
          <PremiumSplashScreen onFinish={handleSplashFinish} />
        )}

        {flowState === 'onboarding' && (
          <Animated.View style={animatedOnboardingStyle}>
            <OnboardingScreen onComplete={handleOnboardingComplete} />
          </Animated.View>
        )}

        {flowState === 'auth' && (
          <Animated.View style={animatedAuthStyle}>
            <AuthScreens onSuccess={handleAuthSuccess} />
          </Animated.View>
        )}

        {flowState === 'app' && (
          <Animated.View style={animatedAppStyle}>
            <AppTabs />
          </Animated.View>
        )}
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  webOuterContainer: {
    flex: 1,
    backgroundColor: '#FFE4EC',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  glowBlob: {
    position: 'absolute',
    width: 600,
    height: 600,
    borderRadius: 300,
    backgroundColor: 'rgba(255, 100, 130, 0.06)',
  },
  phoneFrame: {
    width: 390,
    height: 844,
    maxHeight: '94%',
    borderRadius: 40,
    borderWidth: 10,
    borderColor: '#CCCCCC',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#009688',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 40,
    elevation: 10,
  },
  phoneSpeaker: {
    position: 'absolute',
    top: 0,
    left: '50%',
    marginLeft: -50,
    width: 100,
    height: 25,
    backgroundColor: '#E0E0E0',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    zIndex: 999999,
  },
});
