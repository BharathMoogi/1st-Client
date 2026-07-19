import React, { useState, useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme, View, StyleSheet, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import PremiumSplashScreen from '@/components/PremiumSplashScreen';
import OnboardingScreen from '@/components/OnboardingScreen';
import AuthScreens from '@/components/AuthScreens';
import AppTabs from '@/components/app-tabs';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isWeb = Platform.OS === 'web';

  // On web: skip splash/onboarding/auth (avoids server/client hydration mismatch).
  // On mobile: full flow starting from splash.
  const [flowState, setFlowState] = useState<'splash' | 'onboarding' | 'auth' | 'app'>(
    isWeb ? 'app' : 'splash'
  );
  
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

  const content = (
    <View style={styles.appContainer}>
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
  );

  if (isWeb) {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <View style={styles.webOuterContainer}>
          {/* Ambient desktop background decoration */}
          <LinearGradient
            colors={['#070707', '#111111', '#070707']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.glowBlob} />
          
          <View style={styles.phoneFrame}>
            {/* Phone Notch/Status Bar Area */}
            <View style={styles.phoneSpeaker} />
            {content}
          </View>
        </View>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={styles.container}>
        {content}
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  appContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
  },
  webOuterContainer: {
    flex: 1,
    backgroundColor: '#070707',
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
    backgroundColor: 'rgba(212, 175, 55, 0.02)',
  },
  phoneFrame: {
    width: 390, // Standard modern mobile viewport width
    height: 844, // Standard modern mobile viewport height
    maxHeight: '94%',
    borderRadius: 40,
    borderWidth: 10,
    borderColor: '#1a1a1a',
    backgroundColor: '#000000',
    overflow: 'hidden',
    position: 'relative',
    
    // Premium drop shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 10,
  },
  phoneSpeaker: {
    position: 'absolute',
    top: 0,
    left: '50%',
    marginLeft: -50,
    width: 100,
    height: 25,
    backgroundColor: '#1a1a1a',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    zIndex: 999999,
  },
});


