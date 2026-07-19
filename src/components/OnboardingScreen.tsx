import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  withRepeat,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ONBOARDING_DATA = [
  {
    id: 1,
    title: 'Premium Protein',
    subtitle: 'ULTIMATE NUTRITION',
    description: 'Sourced from the finest grass-fed ingredients, designed to elevate your physical performance and muscle recovery.',
    goldAccent: 'Premium',
    lottieAsset: require('@/assets/lottie/protein.json'),
  },
  {
    id: 2,
    title: 'Verified Supplements',
    subtitle: 'TRUSTED SCIENCE',
    description: 'Every batch is independently tested and verified for pure quality, active potency, and absolute safety.',
    goldAccent: 'Verified',
    lottieAsset: require('@/assets/lottie/supplement.json'),
  },
  {
    id: 3,
    title: 'Fast Delivery',
    subtitle: 'EXPRESS LOGISTICS',
    description: 'Shipped directly to your doorstep with priority thermal tracking and signature luxury packaging.',
    goldAccent: 'Fast',
    lottieAsset: require('@/assets/lottie/delivery.json'),
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Animation values for slide transitions
  const contentFade = useSharedValue(1);
  const contentTranslateY = useSharedValue(0);

  // Button shine effect shared value
  const shineX = useSharedValue(-200);

  useEffect(() => {
    // Continuous loop for button shine sweep
    shineX.value = withRepeat(
      withTiming(200, { duration: 2500, easing: Easing.inOut(Easing.quad) }),
      -1, // loop indefinitely
      false
    );
  }, []);

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      // Transition out active content
      contentFade.value = withTiming(0, { duration: 300, easing: Easing.inOut(Easing.ease) }, () => {
        // Change index on JS thread
        contentTranslateY.value = 30; // reset slide-up position
      });

      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        // Transition back in
        contentFade.value = withTiming(1, { duration: 400 });
        contentTranslateY.value = withSpring(0, { damping: 12, stiffness: 90 });
      }, 350);
    } else {
      // Finished onboarding!
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  // Reanimated style for slide text content
  const animatedContentStyle = useAnimatedStyle(() => {
    return {
      opacity: contentFade.value,
      transform: [{ translateY: contentTranslateY.value }],
    };
  });

  // Reanimated style for the gold button shine sweep
  const animatedShineStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shineX.value }],
    };
  });

  const activeData = ONBOARDING_DATA[currentIndex];

  // Helper to split text for gold highlighting
  const renderHighlightedTitle = (title: string, highlight: string) => {
    const parts = title.split(highlight);
    return (
      <Text style={styles.titleText}>
        {parts[0]}
        <Text style={styles.goldText}>{highlight}</Text>
        {parts[1]}
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      {/* Background with deep dark tones and a gold radial tint at the bottom */}
      <LinearGradient
        colors={['#0F0F0F', '#181614', '#080808']}
        locations={[0, 0.7, 1]}
        style={styles.background}
      />

      {/* Top Header Row */}
      <View style={styles.header}>
        <Text style={styles.logoText}>A U R U M</Text>
        {currentIndex < ONBOARDING_DATA.length - 1 && (
          <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
            <Text style={styles.skipText}>SKIP</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Visual Accent Element (Lottie Animation) */}
      <View style={styles.visualContainer}>
        <LottieView
          key={`lottie-${currentIndex}`}
          source={activeData.lottieAsset}
          autoPlay
          loop
          style={styles.lottieAnimation}
        />
      </View>

      {/* Slide Content Box */}
      <Animated.View style={[styles.contentContainer, animatedContentStyle]}>
        <Text style={styles.subtitleText}>{activeData.subtitle}</Text>
        {renderHighlightedTitle(activeData.title, activeData.goldAccent)}
        <Text style={styles.descriptionText}>{activeData.description}</Text>
      </Animated.View>

      {/* Bottom Section: Page Indicators & Action Button */}
      <View style={styles.bottomSection}>
        {/* Pagination Dots */}
        <View style={styles.dotsContainer}>
          {ONBOARDING_DATA.map((_, index) => {
            const isActive = index === currentIndex;
            return (
              <View
                key={index}
                style={[
                  styles.dot,
                  isActive ? styles.dotActive : styles.dotInactive,
                ]}
              />
            );
          })}
        </View>

        {/* Premium Gold Button with Sweeping Shine Effect */}
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.9}
          style={styles.buttonContainer}
        >
          <LinearGradient
            colors={['#A85D63', '#8B4A50']}
            style={styles.buttonGradient}
          />
          
          {/* Animated Shine overlay */}
          <Animated.View style={[styles.buttonShine, animatedShineStyle]}>
            <LinearGradient
              colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.45)', 'rgba(255,255,255,0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shineGradient}
            />
          </Animated.View>

          <Text style={styles.buttonText}>
            {currentIndex === ONBOARDING_DATA.length - 1
              ? 'GET STARTED'
              : 'NEXT'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  background: {
    ...StyleSheet.absoluteFill,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 60,
    height: 40,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '300',
    color: '#D89A7C',
    letterSpacing: 4,
  },
  skipText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 1.5,
  },
  visualContainer: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottieAnimation: {
    width: 220,
    height: 220,
  },
  contentContainer: {
    flex: 0.8,
    justifyContent: 'center',
    gap: 16,
    paddingBottom: 20,
  },
  subtitleText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#D89A7C',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  titleText: {
    fontSize: 32,
    fontWeight: '300',
    color: '#2B2B2B',
    letterSpacing: 1,
    lineHeight: 40,
  },
  goldText: {
    fontWeight: '400',
    color: '#DFAC6C',
  },
  descriptionText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.55)',
    lineHeight: 22,
    fontWeight: '300',
  },
  bottomSection: {
    marginBottom: 60,
    gap: 32,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    height: 3,
    borderRadius: 2,
  },
  dotActive: {
    width: 24,
    backgroundColor: '#D89A7C',
  },
  dotInactive: {
    width: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  buttonContainer: {
    height: 56,
    width: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#8B4A50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    position: 'relative',
  },
  buttonGradient: {
    ...StyleSheet.absoluteFill,
  },
  buttonShine: {
    ...StyleSheet.absoluteFill,
    width: '80%',
  },
  shineGradient: {
    ...StyleSheet.absoluteFill,
  },
  buttonText: {
    color: '#0A0A0A',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
  },
});
