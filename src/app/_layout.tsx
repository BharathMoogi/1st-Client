import React, { useState, useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme, View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';

import PremiumSplashScreen from '@/components/PremiumSplashScreen';
import OnboardingScreen from '@/components/OnboardingScreen';
import AuthScreens from '@/components/AuthScreens';
import AppTabs from '@/components/app-tabs';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [flowState, setFlowState] = useState<'splash' | 'onboarding' | 'auth' | 'app'>('splash');
  
  // Animation values for transitions
  const onboardingOpacity = useSharedValue(0);
  const authOpacity = useSharedValue(0);
  const appOpacity = useSharedValue(0);

  useEffect(() => {
    // Hide the native splash screen since PremiumSplashScreen handles custom entry
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  const handleSplashFinish = () => {
    setFlowState('onboarding');
    onboardingOpacity.value = withTiming(1, { duration: 600 });
  };

  const handleOnboardingComplete = () => {
    // Fade out onboarding and fade in auth
    onboardingOpacity.value = withTiming(0, { duration: 500 }, (finished) => {
      if (finished) {
        runOnJS(setFlowState)('auth');
        authOpacity.value = withTiming(1, { duration: 500 });
      }
    });
  };

  const handleAuthSuccess = () => {
    // Fade out auth and fade in main app tabs
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
});


