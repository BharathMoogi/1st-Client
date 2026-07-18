import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface SkeletonCardProps {
  isList?: boolean;
}

export default function SkeletonCard({ isList = false }: SkeletonCardProps) {
  const shimmerOpacity = useSharedValue(0.3);

  useEffect(() => {
    shimmerOpacity.value = withRepeat(
      withTiming(0.75, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1, // Loop infinitely
      true // Reverse direction
    );
  }, []);

  const animatedShimmer = useAnimatedStyle(() => ({
    opacity: shimmerOpacity.value,
  }));

  if (isList) {
    // List layout skeleton row
    return (
      <View style={styles.listCard}>
        {/* Background Gradient */}
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']}
          style={StyleSheet.absoluteFill}
        />
        
        {/* Image block skeleton */}
        <Animated.View style={[styles.listImagePlaceholder, animatedShimmer]} />

        {/* Details column skeleton */}
        <View style={styles.listDetails}>
          <Animated.View style={[styles.shimmerLine, styles.brandLine, animatedShimmer]} />
          <Animated.View style={[styles.shimmerLine, styles.nameLine, animatedShimmer]} />
          <Animated.View style={[styles.shimmerLine, styles.proteinLine, animatedShimmer]} />
          
          <View style={styles.listBottom}>
            <Animated.View style={[styles.shimmerLine, styles.priceLine, animatedShimmer]} />
            <Animated.View style={[styles.shimmerButton, animatedShimmer]} />
          </View>
        </View>
      </View>
    );
  }

  // Grid layout skeleton card
  return (
    <View style={styles.gridCard}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']}
        style={StyleSheet.absoluteFill}
      />

      {/* Image block skeleton */}
      <Animated.View style={[styles.gridImagePlaceholder, animatedShimmer]} />

      {/* Details column skeleton */}
      <View style={styles.gridDetails}>
        <Animated.View style={[styles.shimmerLine, styles.brandLine, animatedShimmer]} />
        <Animated.View style={[styles.shimmerLine, styles.nameLine, animatedShimmer]} />
        <Animated.View style={[styles.shimmerLine, styles.proteinLine, animatedShimmer]} />
        <Animated.View style={[styles.shimmerLine, styles.priceLineGrid, animatedShimmer]} />
      </View>

      {/* Button skeleton */}
      <Animated.View style={[styles.gridButton, animatedShimmer]} />
    </View>
  );
}

const styles = StyleSheet.create({
  gridCard: {
    width: '47%', // 2 Column Grid taking gutter margins into account
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    overflow: 'hidden',
    marginBottom: 16,
    height: 270,
    justifyContent: 'space-between',
  },
  gridImagePlaceholder: {
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  gridDetails: {
    padding: 12,
    gap: 8,
    flex: 1,
  },
  shimmerLine: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  brandLine: {
    width: '40%',
    height: 8,
  },
  nameLine: {
    width: '90%',
    height: 12,
  },
  proteinLine: {
    width: '60%',
    height: 8,
  },
  priceLineGrid: {
    width: '50%',
    height: 12,
    marginTop: 6,
  },
  gridButton: {
    height: 38,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },

  // List styles
  listCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    overflow: 'hidden',
    marginBottom: 16,
    flexDirection: 'row',
    padding: 12,
    height: 130,
    gap: 16,
  },
  listImagePlaceholder: {
    width: 100,
    height: '100%',
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  listDetails: {
    flex: 1,
    gap: 6,
    justifyContent: 'center',
  },
  listBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  priceLine: {
    width: '35%',
    height: 12,
  },
  listButton: {
    width: 90,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  shimmerButton: {
    width: 90,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
});
