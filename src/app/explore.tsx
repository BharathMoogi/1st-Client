import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableWithoutFeedback, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- CUSTOM SVG GRAPHICS FOR CATEGORIES ---

// 1. Protein (Shaker Cup)
const ProteinSvg = () => (
  <Svg width="48" height="48" viewBox="0 0 24 24" fill="none">
    <G stroke="#FFE082" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Lid & Cap */}
      <Path d="M6 3h12v2H6z" />
      <Path d="M10 3V1h4v2" />
      {/* Cup Body */}
      <Path d="M7 5l1.5 16h7L17 5" />
      {/* Detail lines / Shaker grill */}
      <Path d="M9 9h6M9 13h6M9 17h6" />
    </G>
  </Svg>
);

// 2. Mass Gainer (Heavy Dumbbell / Weight Plates)
const GainerSvg = () => (
  <Svg width="48" height="48" viewBox="0 0 24 24" fill="none">
    <G stroke="#FFE082" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Center bar */}
      <Path d="M2 12h20" />
      {/* Weights Left */}
      <Rect x="5" y="6" width="3" height="12" rx="1.5" />
      <Rect x="9" y="8" width="2" height="8" rx="1" />
      {/* Weights Right */}
      <Rect x="16" y="6" width="3" height="12" rx="1.5" />
      <Rect x="13" y="8" width="2" height="8" rx="1" />
      {/* Collars */}
      <Circle cx="4" cy="12" r="1.5" fill="#FFE082" />
      <Circle cx="20" cy="12" r="1.5" fill="#FFE082" />
    </G>
  </Svg>
);

// 3. Creatine (Energetic Crystals / Molecules)
const CreatineSvg = () => (
  <Svg width="48" height="48" viewBox="0 0 24 24" fill="none">
    <G stroke="#FFE082" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Central Diamond Node */}
      <Path d="M12 2l3 6 6 3-6 3-3 6-3-6-6-3 6-3 3-6z" fill="rgba(224, 176, 52, 0.25)" />
      {/* Surrounding Sparkles */}
      <Circle cx="5" cy="5" r="1" fill="#FFE082" />
      <Circle cx="19" cy="19" r="1" fill="#FFE082" />
      <Circle cx="19" cy="5" r="1.5" fill="#FFE082" />
      <Circle cx="5" cy="19" r="1.5" fill="#FFE082" />
    </G>
  </Svg>
);

// 4. BCAA (Amino Acid Hexagon Links)
const BcaaSvg = () => (
  <Svg width="48" height="48" viewBox="0 0 24 24" fill="none">
    <G stroke="#FFE082" strokeWidth="1.5" strokeLinejoin="round">
      {/* Hexagon 1 */}
      <Path d="M12 5l4 2.5v5l-4 2.5-4-2.5v-5z" />
      {/* Hexagon 2 */}
      <Path d="M18 11.5l4 2.5v5l-4 2.5-4-2.5v-5z" />
      {/* Connection link dots */}
      <Circle cx="12" cy="12.5" r="2" fill="#FFE082" />
      <Circle cx="14" cy="7.5" r="1" fill="#FFE082" />
    </G>
  </Svg>
);

// 5. Pre Workout (Lightning Bolt Shield)
const PreWorkoutSvg = () => (
  <Svg width="48" height="48" viewBox="0 0 24 24" fill="none">
    <G stroke="#FFE082" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Shield border */}
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      {/* Lightning bolt */}
      <Path d="M13 6l-4 6h5l-2 6 4-6h-5z" fill="#FFE082" />
    </G>
  </Svg>
);

// 6. Vitamins (Essential Capsule / Sun)
const VitaminsSvg = () => (
  <Svg width="48" height="48" viewBox="0 0 24 24" fill="none">
    <G stroke="#FFE082" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Capsule */}
      <Path d="M7 11.5a4.5 4.5 0 0 1 9 0V15a4.5 4.5 0 0 1-9 0z" />
      {/* Diagonal dividing line */}
      <Path d="M7 13.5h9" />
      {/* Sun glow lines around */}
      <Path d="M12 2V1M22 12h-1M2 12h1M12 22v-1M5 5l1 1M18 18l1 1M18 5l-1 1M6 18l-1 1" />
    </G>
  </Svg>
);

// 7. Accessories (Duffle Bag / Gear)
const AccessoriesSvg = () => (
  <Svg width="48" height="48" viewBox="0 0 24 24" fill="none">
    <G stroke="#FFE082" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Cylinder duffle bag body */}
      <Rect x="4" y="8" width="16" height="10" rx="2" />
      {/* Left/Right caps */}
      <Path d="M4 10v6M20 10v6" />
      {/* Straps */}
      <Path d="M8 8V6a2 2 0 0 1 4 0v2M12 8V6a2 2 0 0 1 4 0v2" />
    </G>
  </Svg>
);

const CATEGORIES_DATA = [
  {
    id: 'protein',
    title: 'Whey Protein',
    tagline: 'BUILD & RECOVER',
    description: 'Gold Standard Whey Isolate & Hydrolyzed protein powders.',
    SvgIcon: ProteinSvg,
    color1: '#1F1C16',
    color2: '#0E0D0B',
  },
  {
    id: 'gainer',
    title: 'Mass Gainer',
    tagline: 'SIZE & BULK',
    description: 'High-calorie blends packed with premium complex carbs & BCAAs.',
    SvgIcon: GainerSvg,
    color1: '#131518',
    color2: '#090A0C',
  },
  {
    id: 'creatine',
    title: 'Pure Creatine',
    tagline: 'POWER & STRENGTH',
    description: 'Micronized monohydrate supporting quick ATP cellular recovery.',
    SvgIcon: CreatineSvg,
    color1: '#181518',
    color2: '#0B090C',
  },
  {
    id: 'bcaa',
    title: 'Active BCAAs',
    tagline: 'ENDURE & AMINO',
    description: 'Essential amino acids to reduce fatigue and speed up repair.',
    SvgIcon: BcaaSvg,
    color1: '#151816',
    color2: '#0A0C0B',
  },
  {
    id: 'preworkout',
    title: 'Pre Workout',
    tagline: 'ENERGY & SURGE',
    description: 'High-focus caffeine and L-Citrulline pumps for explosive drive.',
    SvgIcon: PreWorkoutSvg,
    color1: '#1E1616',
    color2: '#0D0909',
  },
  {
    id: 'vitamins',
    title: 'Multivitamins',
    tagline: 'HEALTH & CORE',
    description: 'Daily vital nutrition matrix loaded with chelated minerals.',
    SvgIcon: VitaminsSvg,
    color1: '#1B1B1C',
    color2: '#0C0C0D',
  },
  {
    id: 'accessories',
    title: 'Accessories',
    tagline: 'GEAR & APPAREL',
    description: 'Tritan leakproof shakers, training wraps, and duffle bags.',
    SvgIcon: AccessoriesSvg,
    color1: '#1D1C1B',
    color2: '#0F0E0E',
  },
];

// --- INDIVIDUAL ANIMATED CARD COMPONENT (Hover/Press state controller) ---
function AnimatedCategoryCard({ item, onPress }: { item: typeof CATEGORIES_DATA[0]; onPress: () => void }) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0.15); // Resting glow border opacity

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 10, stiffness: 120 });
    glow.value = withTiming(0.8, { duration: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1.0, { damping: 12, stiffness: 90 });
    glow.value = withTiming(0.15, { duration: 250 });
  };

  const animatedStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      glow.value,
      [0.15, 0.8],
      ['rgba(224, 176, 52, 0.18)', 'rgba(224, 176, 52, 0.8)']
    );

    return {
      transform: [{ scale: scale.value }],
      borderColor,
    };
  });

  const SvgIcon = item.SvgIcon;

  return (
    <TouchableWithoutFeedback onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress}>
      <Animated.View style={[styles.cardContainer, animatedStyle]}>
        {/* Background gradient */}
        <LinearGradient
          colors={[item.color1, item.color2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Vector Image/Illustration container */}
        <View style={styles.imageBox}>
          <LinearGradient
            colors={['rgba(255,255,255,0.02)', 'rgba(255,255,255,0.005)']}
            style={StyleSheet.absoluteFill}
          />
          <SvgIcon />
        </View>

        {/* Details and taglines */}
        <View style={styles.cardDetails}>
          <Text style={styles.cardTagline}>{item.tagline}</Text>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.description}
          </Text>
        </View>

        {/* CTA link arrow */}
        <View style={styles.cardFooter}>
          <Text style={styles.exploreText}>EXPLORE RANGE</Text>
          <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFE082" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M5 12h14M12 5l7 7-7 7" />
          </Svg>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

// --- MAIN CATEGORIES VIEW ---
export default function CategoriesScreen() {
  const router = useRouter();

  const handleCategoryPress = (title: string) => {
    router.push({
      pathname: '/products',
      params: { categoryTitle: title }
    });
  };

  return (
    <ScrollView style={styles.container} bounces={true} showsVerticalScrollIndicator={false}>
      {/* Background Linear Gradients */}
      <LinearGradient
        colors={['#070707', '#121110', '#070707']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header bar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CATEGORIES</Text>
        <Text style={styles.headerSubtitle}>SHOP LUXURY WELLNESS ESSENTIALS</Text>
      </View>

      {/* Grid wrapper */}
      <View style={styles.gridWrapper}>
        {CATEGORIES_DATA.map((item) => (
          <AnimatedCategoryCard
            key={item.id}
            item={item}
            onPress={() => handleCategoryPress(item.title)}
          />
        ))}
      </View>

      {/* Extra bottom padding to clear navigation tabs */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  header: {
    marginTop: 70,
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: 4,
    fontFamily: 'System',
  },
  headerSubtitle: {
    fontSize: 9,
    fontWeight: '400',
    color: '#FFE082',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  gridWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 16,
    justifyContent: 'space-between',
  },
  cardContainer: {
    width: (SCREEN_WIDTH - 48) / 2, // 2 Column Grid taking gutter margins into account
    borderRadius: 20,
    borderWidth: 1.2,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    position: 'relative',
    height: 240,
    justifyContent: 'space-between',
  },
  imageBox: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderBottomWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardDetails: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  cardTagline: {
    fontSize: 8,
    fontWeight: '600',
    color: '#FFE082',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  cardDescription: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    lineHeight: 14,
    fontWeight: '300',
  },
  cardFooter: {
    height: 40,
    borderTopWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  exploreText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFE082',
    letterSpacing: 1,
  },
  bottomPadding: {
    height: 100,
  },
});
