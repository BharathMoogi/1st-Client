import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import GoldLogo from './GoldLogo';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PremiumSplashScreenProps {
  onFinish: () => void;
}

export default function PremiumSplashScreen({ onFinish }: PremiumSplashScreenProps) {
  // Shared values for intro animations
  const logoScale = useSharedValue(0.4);
  const logoOpacity = useSharedValue(0);
  const logoRotate = useSharedValue(-25); // Rotate entry
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);
  
  // Shared values for continuous luxury animations (breathing glow)
  const glowScale = useSharedValue(0.95);
  const glowOpacity = useSharedValue(0.2);
  const spinnerRotation = useSharedValue(0);
  
  // Shared value for exit transition
  const screenOpacity = useSharedValue(1);
  const contentScale = useSharedValue(1);

  useEffect(() => {
    // 1. Entry Animation for Logo
    logoScale.value = withSpring(1.0, { damping: 12, stiffness: 80 });
    logoOpacity.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.quad) });
    logoRotate.value = withSpring(0, { damping: 12, stiffness: 80 });

    // 2. Entry Animation for Brand Text (slight delay)
    textOpacity.value = withTiming(1, { duration: 1200, easing: Easing.out(Easing.quad) });
    textTranslateY.value = withSpring(0, { damping: 15, stiffness: 60 });

    // 3. Infinite breathing glow effect behind logo
    glowScale.value = withRepeat(
      withTiming(1.15, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
      -1, // infinite
      true // reverse
    );
    glowOpacity.value = withRepeat(
      withTiming(0.85, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // 4. Infinite loading spinner rotation
    spinnerRotation.value = withRepeat(
      withTiming(360, { duration: 1200, easing: Easing.linear }),
      -1,
      false
    );

    // 5. Exit Animation triggered after a loading period (e.g. 3.5 seconds)
    const timeout = setTimeout(() => {
      // Fade out and scale down splash content, then transition
      contentScale.value = withTiming(0.9, { duration: 800, easing: Easing.inOut(Easing.ease) });
      screenOpacity.value = withTiming(0, { duration: 800, easing: Easing.inOut(Easing.ease) }, (finished) => {
        if (finished) {
          runOnJS(onFinish)();
        }
      });
    }, 3800);

    return () => clearTimeout(timeout);
  }, []);

  // Animated styles
  const animatedLogoStyle = useAnimatedStyle(() => {
    return {
      opacity: logoOpacity.value,
      transform: [
        { scale: logoScale.value },
        { rotate: `${logoRotate.value}deg` }
      ],
    };
  });

  const animatedGlowStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      opacity: glowOpacity.value,
      transform: [{ scale: glowScale.value }],
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      opacity: textOpacity.value,
      transform: [{ translateY: textTranslateY.value }],
    };
  });

  const animatedSpinnerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${spinnerRotation.value}deg` }],
    };
  });

  const animatedScreenStyle = useAnimatedStyle(() => {
    return {
      opacity: screenOpacity.value,
      transform: [{ scale: contentScale.value }],
    };
  });

  return (
    <Animated.View style={[styles.container, animatedScreenStyle]}>
      {/* Premium Dark Gradient Background */}
      <LinearGradient
        colors={['#1A1A1A', '#141210', '#1A1A1A']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Background ambient lighting overlay */}
      <View style={styles.ambientOverlay} />

      <View style={styles.content}>
        {/* Logo and Glow Wrapper */}
        <View style={styles.logoWrapper}>
          {/* Glowing Aura (Behind) */}
          <Animated.View style={animatedGlowStyle}>
            <GoldLogo width={160} height={160} glow={true} />
          </Animated.View>

          {/* Sharp Foreground Logo */}
          <Animated.View style={animatedLogoStyle}>
            <GoldLogo width={130} height={130} />
          </Animated.View>
        </View>

        {/* Brand Information */}
        <Animated.View style={[styles.textContainer, animatedTextStyle]}>
          <Text style={styles.brandTitle}>A U R U M</Text>
          <Text style={styles.brandSubtitle}>THE LUXURY EXPERIENCE</Text>
        </Animated.View>

        {/* Premium Spinner */}
        <View style={styles.spinnerContainer}>
          <Animated.View style={[styles.spinner, animatedSpinnerStyle]} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    zIndex: 9999, // Ensure it overlays everything
  },
  ambientOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  logoWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 200,
    height: 200,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '300',
    color: '#D4A373',
    letterSpacing: 10,
    fontFamily: 'System', // Use default elegant sans/serif
    textShadowColor: 'rgba(212, 163, 115, 0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  spinnerContainer: {
    position: 'absolute',
    bottom: 80,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#DFAC6C',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    opacity: 0.8,
  },
});
