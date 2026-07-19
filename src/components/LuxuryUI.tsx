import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

// --- CHEVRON LEFT ICON ---
const ChevronLeftIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D89A7C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="m15 18-6-6 6-6" />
  </Svg>
);

// --- STAR ICON ---
const StarIcon = ({ filled = true, size = 12 }: { filled?: boolean; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? '#D89A7C' : 'none'} stroke="#D89A7C" strokeWidth="1.5">
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </Svg>
);

// ==========================================
// 1. REUSABLE HEADER
// ==========================================
interface HeaderProps {
  title: string;
  rightAction?: React.ReactNode;
}

export function Header({ title, rightAction }: HeaderProps) {
  const router = useRouter();
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.headerBtn}>
        <ChevronLeftIcon />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title.toUpperCase()}</Text>
      {rightAction ? (
        <View>{rightAction}</View>
      ) : (
        <View style={{ width: 36 }} />
      )}
    </View>
  );
}

// ==========================================
// 2. REUSABLE GOLD BUTTON (SPRING ACTIVE SCALE)
// ==========================================
interface GoldButtonProps {
  text: string;
  onPress: () => void;
  style?: ViewStyle;
}

export function GoldButton({ text, onPress, style }: GoldButtonProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withTiming(0.95, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1.0, { damping: 10 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      style={[style]}
    >
      <Animated.View style={[styles.goldBtn, animatedStyle]}>
        <LinearGradient colors={['#A85D63', '#8B4A50']} style={StyleSheet.absoluteFill} />
        <Text style={styles.goldBtnText}>{text}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ==========================================
// 3. REUSABLE STAR RATING ROW
// ==========================================
interface StarRatingProps {
  rating: number;
  size?: number;
  gap?: number;
}

export function StarRating({ rating, size = 12, gap = 4 }: StarRatingProps) {
  return (
    <View style={[styles.starsRow, { gap }]}>
      {[1, 2, 3, 4, 5].map((s) => (
        <StarIcon key={s} filled={s <= rating} size={size} />
      ))}
    </View>
  );
}

// ==========================================
// 4. REUSABLE PULSING SKELETON CONTENT LOADER
// ==========================================
interface SkeletonLoaderProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonLoader({ width, height, borderRadius = 8, style }: SkeletonLoaderProps) {
  const opacity = useSharedValue(0.15);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.4, { duration: 800 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width: width as any, height, borderRadius },
        animatedStyle,
        style
      ]}
    />
  );
}

// ==========================================
// 5. REUSABLE ERROR FALLBACK COMPONENT
// ==========================================
interface ErrorFallbackProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorFallback({ message, onRetry }: ErrorFallbackProps) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>Oops! Something went wrong.</Text>
      <Text style={styles.errorSubtext}>{message}</Text>
      {onRetry && (
        <TouchableOpacity onPress={onRetry} activeOpacity={0.8} style={styles.retryBtn}>
          <Text style={styles.retryText}>TRY AGAIN</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 60,
    height: 48,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingBottom: 10,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#2B2B2B',
    letterSpacing: 2,
  },
  goldBtn: {
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    width: '100%',
  },
  goldBtnText: {
    color: '#0A0A0A',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeleton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    gap: 8,
  },
  errorText: {
    color: '#EA4335',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  errorSubtext: {
    color: '#6E6E6E',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 10,
  },
  retryBtn: {
    height: 36,
    paddingHorizontal: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryText: {
    color: '#2B2B2B',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
