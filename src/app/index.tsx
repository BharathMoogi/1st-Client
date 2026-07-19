import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  withRepeat,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, G, Rect } from 'react-native-svg';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Luxury Design Tokens
const TEAL = '#009688';
const TEAL_LIGHT = '#80CBC4';
const TEAL_DARK = '#00796B';
const BG = '#FFFFFF';
const CARD_BG = '#FFFFFF';

// --- VECTOR ICONS FOR HOME SCREEN ---
const SearchIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="11" cy="11" r="8" />
    <Path d="m21 21-4.3-4.3" />
  </Svg>
);

const BellIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#80CBC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <Path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </Svg>
);

const CartIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#80CBC4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="8" cy="21" r="1" />
    <Circle cx="19" cy="21" r="1" />
    <Path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
  </Svg>
);

const PackageIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#80CBC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <Path d="M3.27 6.96 12 12.01l8.73-5.05" />
    <Path d="M12 22.08V12" />
  </Svg>
);

const HeartIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#80CBC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </Svg>
);

const ProfileIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#80CBC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <Circle cx="12" cy="7" r="4" />
  </Svg>
);

const LocationIcon = () => (
  <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#80CBC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <Circle cx="12" cy="10" r="3" />
  </Svg>
);

const StarIcon = () => (
  <Svg width="10" height="10" viewBox="0 0 24 24" fill="#80CBC4">
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </Svg>
);

// --- DATASETS ---
const BANNERS = [
  {
    id: 1,
    title: 'GOLD STANDARD WHEY',
    tagline: 'ULTIMATE PERFORMANCE',
    description: 'Fuel muscle growth and repair with premium quality micro-filtered whey isolate.',
    promo: '20% OFF TODAY',
    color: '#E0F7F4',
  },
  {
    id: 2,
    title: 'MICRONIZED CREATINE',
    tagline: 'MAXIMUM RAW POWER',
    description: 'Boost endurance, strength, and cellular ATP production with high-purity powder.',
    promo: 'BUY 1 GET 1',
    color: '#E8F5F4',
  },
  {
    id: 3,
    title: 'AURUM MULTIVITAMINS',
    tagline: 'DAILY VITALITY MATRIX',
    description: 'Essential chelated minerals and active vitamins supporting immunity & energy.',
    promo: 'SPECIAL PRICE',
    color: '#1E1B15',
  },
];

const CATEGORIES = [
  { id: 1, name: 'Whey Protein', iconText: 'WHEY' },
  { id: 2, name: 'Creatine', iconText: 'CRT' },
  { id: 3, name: 'Pre-Workout', iconText: 'P-WK' },
  { id: 4, name: 'Vitamins', iconText: 'VIT' },
  { id: 5, name: 'Fish Oil', iconText: 'OIL' },
  { id: 6, name: 'Amino Acids', iconText: 'BCAA' },
];

const FLASH_SALE_PRODUCTS = [
  {
    id: 10,
    name: 'Whey Isolate (1kg) - Dark Gold Series',
    rating: '4.9',
    originalPrice: '$89.00',
    salePrice: '$69.00',
    save: 'SAVE 22%',
    imageText: 'WHEY'
  },
  {
    id: 11,
    name: 'Pre-Workout Rush (30 Servings)',
    rating: '4.8',
    originalPrice: '$45.00',
    salePrice: '$32.00',
    save: 'SAVE 28%',
    imageText: 'RUSH'
  },
  {
    id: 12,
    name: 'Liquid Carnitine 3000 (450ml)',
    rating: '4.7',
    originalPrice: '$35.00',
    salePrice: '$24.99',
    save: 'SAVE 29%',
    imageText: 'LCAR'
  }
];

const BEST_SELLERS = [
  {
    id: 20,
    name: 'Advanced Whey Gold Blend (2kg)',
    rating: '4.9',
    price: '$110.00',
    imageText: 'WHEY'
  },
  {
    id: 21,
    name: 'Pure Micronized Glutamine (250g)',
    rating: '4.8',
    price: '$28.00',
    imageText: 'GLUT'
  },
  {
    id: 22,
    name: 'Premium Fish Oil (90 Softgels)',
    rating: '4.9',
    price: '$22.00',
    imageText: 'FISH'
  }
];

const BRANDS = [
  'AURUM LABS', 'OPTIMUM GOLD', 'MUSCLE LABS', 'NUTRITION LABS', 'WHEY CO.'
];

export default function HomeScreen() {
  const router = useRouter();

  const handleProductPress = (name: string, priceStr: string) => {
    const price = Number(priceStr.replace('$', '')) || 69.00;
    router.push({
      pathname: '/details',
      params: { name, price }
    });
  };

  const [activeBanner, setActiveBanner] = useState(0);
  const [countdown, setCountdown] = useState({ hours: 4, minutes: 12, seconds: 59 });

  // Reanimated shared values
  const proteinProgressWidth = useSharedValue(0);
  const bannerOpacity = useSharedValue(1);

  // Mount stagger animations
  const heroOpacity = useSharedValue(0);
  const heroTranslateY = useSharedValue(20);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(30);
  const flashOpacity = useSharedValue(0);
  const flashTranslateY = useSharedValue(40);

  useEffect(() => {
    // Stagger in sections
    heroOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) });
    heroTranslateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.quad) });
    contentOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    contentTranslateY.value = withDelay(200, withTiming(0, { duration: 600, easing: Easing.out(Easing.quad) }));
    flashOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    flashTranslateY.value = withDelay(400, withTiming(0, { duration: 600, easing: Easing.out(Easing.quad) }));
  }, []);

  // Auto-slide banners
  useEffect(() => {
    const timer = setInterval(() => {
      bannerOpacity.value = withTiming(0, { duration: 300 }, (finished) => {
        if (finished) {
          runOnJS(setActiveBanner)((activeBanner + 1) % BANNERS.length);
          bannerOpacity.value = withTiming(1, { duration: 400 });
        }
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [activeBanner]);

  // Flash sale countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 4, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Animate Protein Goal Tracker on mount
  useEffect(() => {
    proteinProgressWidth.value = withDelay(800, withTiming(0.68, {
      duration: 1800,
      easing: Easing.out(Easing.quad),
    }));
  }, []);

  const animatedBannerStyle = useAnimatedStyle(() => ({
    opacity: bannerOpacity.value,
  }));

  const animatedProteinStyle = useAnimatedStyle(() => ({
    width: `${proteinProgressWidth.value * 100}%`,
  }));

  const animatedHeroStyle = useAnimatedStyle(() => ({
    opacity: heroOpacity.value,
    transform: [{ translateY: heroTranslateY.value }],
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const animatedFlashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
    transform: [{ translateY: flashTranslateY.value }],
  }));

  const formatTime = (num: number) => (num < 10 ? `0${num}` : num);

  return (
    <ScrollView style={styles.container} bounces={false} showsVerticalScrollIndicator={false}>
      {/* Background Linear Gradients */}
      <LinearGradient
        colors={['#1A1A1A', '#0F0D0A', '#1A1A1A']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient gold glow */}
      <View style={styles.ambientGlow} />

      {/* --- TOP APP BAR --- */}
      <Animated.View style={[styles.topBar, animatedHeroStyle]}>
        <View style={styles.locationContainer}>
          <LocationIcon />
          <View style={styles.locationTextContainer}>
            <Text style={styles.locationHeader}>Deliver to</Text>
            <Text style={styles.locationValue}>Bandra West, Mumbai 400050</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.push('/orders')} style={styles.notificationButton} activeOpacity={0.7}>
            <PackageIcon />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/wishlist')} style={styles.notificationButton} activeOpacity={0.7}>
            <HeartIcon />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/cart')} style={styles.notificationButton} activeOpacity={0.7}>
            <CartIcon />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/profile')} style={styles.notificationButton} activeOpacity={0.7}>
            <ProfileIcon />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* --- SEARCH BAR --- */}
      <Animated.View style={[styles.searchSection, animatedHeroStyle]}>
        <TouchableOpacity onPress={() => router.push('/search')} style={styles.searchContainer} activeOpacity={0.9}>
          <SearchIcon />
          <Text style={styles.searchPlaceholderText}>
            Search premium supplements, vitamins...
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* --- PREMIUM BANNER CAROUSEL --- */}
      <Animated.View style={[styles.carouselContainer, animatedHeroStyle]}>
        <Animated.View style={[styles.bannerCard, animatedBannerStyle, { backgroundColor: BANNERS[activeBanner].color }]}>
          <LinearGradient
            colors={['rgba(212, 175, 55, 0.10)', 'rgba(0, 0, 0, 0.7)']}
            style={StyleSheet.absoluteFill}
          />
          {/* Gold border top line */}
          <View style={styles.bannerGoldLine} />
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTagline}>{BANNERS[activeBanner].tagline}</Text>
            <Text style={styles.bannerTitle}>{BANNERS[activeBanner].title}</Text>
            <Text style={styles.bannerDesc}>{BANNERS[activeBanner].description}</Text>
            <View style={styles.bannerBottomRow}>
              <View style={styles.bannerBadge}>
                <Text style={styles.bannerBadgeText}>{BANNERS[activeBanner].promo}</Text>
              </View>
              <TouchableOpacity activeOpacity={0.8} style={styles.bannerButton}>
                <LinearGradient
                  colors={['#009688', '#00796B']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.bannerButtonText}>BUY NOW</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Carousel indicators */}
        <View style={styles.carouselIndicators}>
          {BANNERS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicatorDot,
                index === activeBanner ? styles.indicatorDotActive : null,
              ]}
            />
          ))}
        </View>
      </Animated.View>

      {/* --- PROTEIN GOALS TRACKER --- */}
      <Animated.View style={[styles.sectionContainer, animatedContentStyle]}>
        <View style={styles.proteinGoalBox}>
          <LinearGradient
            colors={['rgba(212, 175, 55, 0.06)', 'rgba(255, 255, 255, 0.01)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.proteinHeader}>
            <View>
              <Text style={styles.proteinTitle}>Daily Protein Intake</Text>
              <Text style={styles.proteinSubtitle}>Keep building muscle mass</Text>
            </View>
            <Text style={styles.proteinIntakeText}>
              <Text style={styles.goldTextBold}>82g</Text> / 120g Goal
            </Text>
          </View>

          {/* Progress track */}
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, animatedProteinStyle]}>
              <LinearGradient
                colors={['#009688', '#80CBC4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </View>
          <View style={styles.proteinFooter}>
            <Text style={styles.proteinRemaining}>38g remaining to meet goal today</Text>
            <Text style={styles.proteinPercent}>68%</Text>
          </View>
        </View>
      </Animated.View>

      {/* --- CATEGORIES --- */}
      <Animated.View style={[styles.sectionContainer, animatedContentStyle]}>
        <Text style={styles.sectionTitle}>Shop by Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity key={cat.id} activeOpacity={0.8} style={styles.categoryItem}>
              <View style={styles.categoryCircle}>
                <LinearGradient
                  colors={['rgba(224, 176, 52, 0.15)', 'rgba(224, 176, 52, 0.02)']}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.categoryCircleText}>{cat.iconText}</Text>
              </View>
              <Text style={styles.categoryName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* --- FLASH SALE SECTION --- */}
      <Animated.View style={[styles.sectionContainer, styles.flashSaleBg, animatedFlashStyle]}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.flashHeaderLeft}>
            <Text style={styles.flashSaleTitle}>Flash Sale</Text>
            <View style={styles.countdownBadge}>
              <Text style={styles.countdownText}>
                {formatTime(countdown.hours)}:{formatTime(countdown.minutes)}:{formatTime(countdown.seconds)}
              </Text>
            </View>
          </View>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAllText}>SEE ALL</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productCardScroll}>
          {FLASH_SALE_PRODUCTS.map((prod) => (
            <TouchableOpacity onPress={() => handleProductPress(prod.name, prod.salePrice)} key={prod.id} style={styles.floatingProductCard} activeOpacity={0.95}>
              <LinearGradient
                colors={['rgba(0,150,136,0.05)', 'rgba(255,255,255,0.01)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.productImagePlaceholder}>
                <LinearGradient colors={['#1F1D1A', '#0D0D0E']} style={StyleSheet.absoluteFill} />
                <Text style={styles.productImageText}>{prod.imageText}</Text>
                <View style={styles.saveBadge}>
                  <Text style={styles.saveBadgeText}>{prod.save}</Text>
                </View>
              </View>

              <View style={styles.productDetails}>
                <View style={styles.ratingRow}>
                  <StarIcon />
                  <Text style={styles.ratingText}>{prod.rating}</Text>
                </View>
                <Text style={styles.productName} numberOfLines={2}>{prod.name}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.originalPrice}>{prod.originalPrice}</Text>
                  <Text style={styles.salePrice}>{prod.salePrice}</Text>
                </View>
              </View>

              <TouchableOpacity activeOpacity={0.85} style={styles.quickAddButton}>
                <LinearGradient colors={['#009688', '#00796B']} style={StyleSheet.absoluteFill} />
                <Text style={styles.quickAddButtonText}>QUICK ADD</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* --- BEST SELLERS --- */}
      <Animated.View style={[styles.sectionContainer, animatedFlashStyle]}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Best Sellers</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAllText}>VIEW ALL</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productCardScroll}>
          {BEST_SELLERS.map((prod) => (
            <TouchableOpacity onPress={() => handleProductPress(prod.name, prod.price)} key={prod.id} style={styles.floatingProductCard} activeOpacity={0.95}>
              <LinearGradient
                colors={['rgba(0,150,136,0.05)', 'rgba(255,255,255,0.01)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.productImagePlaceholder}>
                <LinearGradient colors={['#1A1B1D', '#090A0A']} style={StyleSheet.absoluteFill} />
                <Text style={styles.productImageText}>{prod.imageText}</Text>
              </View>

              <View style={styles.productDetails}>
                <View style={styles.ratingRow}>
                  <StarIcon />
                  <Text style={styles.ratingText}>{prod.rating}</Text>
                </View>
                <Text style={styles.productName} numberOfLines={2}>{prod.name}</Text>
                <Text style={styles.originalPriceText}>{prod.price}</Text>
              </View>

              <TouchableOpacity activeOpacity={0.85} style={styles.quickAddButton}>
                <LinearGradient colors={['#009688', '#00796B']} style={StyleSheet.absoluteFill} />
                <Text style={styles.quickAddButtonText}>ADD TO CART</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* --- SHOP BY BRAND --- */}
      <Animated.View style={[styles.sectionContainer, animatedFlashStyle]}>
        <Text style={styles.sectionTitle}>Shop by Brand</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.brandScroll}>
          {BRANDS.map((brand, i) => (
            <TouchableOpacity key={i} activeOpacity={0.8} style={styles.brandCard}>
              <LinearGradient
                colors={['rgba(224, 176, 52, 0.12)', 'rgba(224, 176, 52, 0.02)']}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.brandCardText}>{brand}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* --- RECOMMENDED FOR YOU --- */}
      <Animated.View style={[styles.sectionContainer, { marginBottom: 100 }, animatedFlashStyle]}>
        <Text style={styles.sectionTitle}>Recommended For You</Text>
        <View style={styles.gridContainer}>
          {FLASH_SALE_PRODUCTS.map((prod) => (
            <TouchableOpacity onPress={() => handleProductPress(prod.name, prod.salePrice)} key={`rec-${prod.id}`} style={styles.gridProductCard} activeOpacity={0.95}>
              <LinearGradient
                colors={['rgba(0,150,136,0.05)', 'rgba(255,255,255,0.01)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.gridImagePlaceholder}>
                <LinearGradient colors={['#1B1B1C', '#0C0C0D']} style={StyleSheet.absoluteFill} />
                <Text style={styles.gridImageText}>{prod.imageText}</Text>
              </View>

              <View style={styles.productDetails}>
                <View style={styles.ratingRow}>
                  <StarIcon />
                  <Text style={styles.ratingText}>{prod.rating}</Text>
                </View>
                <Text style={styles.gridProductName} numberOfLines={2}>{prod.name}</Text>
                <Text style={styles.gridPriceText}>{prod.salePrice}</Text>
              </View>

              <TouchableOpacity activeOpacity={0.85} style={styles.gridAddButton}>
                <LinearGradient colors={['#009688', '#00796B']} style={StyleSheet.absoluteFill} />
                <Text style={styles.quickAddButtonText}>QUICK ADD</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundcolor: '#1A1A1A',
  },
  ambientGlow: {
    position: 'absolute',
    top: -100,
    left: SCREEN_WIDTH / 2 - 150,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(212, 175, 55, 0.04)',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 60,
    height: 48,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationTextContainer: {
    gap: 2,
  },
  locationHeader: {
    fontSize: 9,
    fontWeight: '400',
    color: 'rgba(0,0,0,0.35)',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  locationValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.15)',
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EA4335',
    top: 10,
    right: 12,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginVertical: 16,
  },
  searchContainer: {
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.15)',
    backgroundColor: 'rgba(0,150,136,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    color: '#1A1A1A',
    fontSize: 13,
  },
  searchPlaceholderText: {
    flex: 1,
    color: 'rgba(255, 255, 255, 0.35)',
    fontSize: 13,
  },
  carouselContainer: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    marginVertical: 12,
  },
  bannerCard: {
    width: SCREEN_WIDTH - 40,
    height: 185,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    overflow: 'hidden',
    shadowColor: '#009688',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  bannerGoldLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(212, 175, 55, 0.4)',
  },
  bannerContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  bannerTagline: {
    fontSize: 9,
    fontWeight: '700',
    color: '#009688',
    letterSpacing: 2.5,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '300',
    color: '#1A1A1A',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  bannerDesc: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.5)',
    lineHeight: 16,
    fontWeight: '300',
    marginVertical: 6,
  },
  bannerBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(212,175,55,0.35)',
  },
  bannerBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#009688',
    letterSpacing: 1.2,
  },
  bannerButton: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerButtonText: {
    color: '#1A1A1A',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  carouselIndicators: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
  },
  indicatorDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  indicatorDotActive: {
    backgroundColor: '#009688',
    width: 20,
    borderRadius: 3,
  },
  sectionContainer: {
    marginVertical: 18,
    paddingHorizontal: 20,
  },
  flashSaleBg: {
    backgroundColor: 'rgba(255, 255, 255, 0.005)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '300',
    color: '#1A1A1A',
    letterSpacing: 1.2,
    marginBottom: 14,
  },
  categoryScroll: {
    gap: 16,
  },
  categoryItem: {
    alignItems: 'center',
    gap: 8,
    width: 72,
  },
  categoryCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
  },
  categoryCircleText: {
    fontSize: 11,
    color: '#009688',
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  categoryName: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '400',
    textAlign: 'center',
  },
  proteinGoalBox: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    padding: 16,
    gap: 12,
  },
  proteinHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  proteinTitle: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '400',
  },
  proteinSubtitle: {
    fontSize: 10,
    color: 'rgba(0,0,0,0.35)',
  },
  proteinIntakeText: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.6)',
  },
  goldTextBold: {
    color: '#80CBC4',
    fontWeight: '600',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  proteinFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  proteinRemaining: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.45)',
  },
  proteinPercent: {
    fontSize: 11,
    fontWeight: '600',
    color: '#80CBC4',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  flashHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flashSaleTitle: {
    fontSize: 18,
    fontWeight: '300',
    color: '#1A1A1A',
    letterSpacing: 1.2,
  },
  countdownBadge: {
    backgroundColor: '#009688',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  countdownText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 1,
  },
  seeAllText: {
    fontSize: 10,
    color: '#009688',
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  productCardScroll: {
    gap: 16,
    paddingBottom: 8,
  },
  floatingProductCard: {
    width: 165,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.12)',
    backgroundColor: 'rgba(23, 23, 23, 0.8)',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  productImagePlaceholder: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  productImageText: {
    fontSize: 20,
    fontWeight: '200',
    color: 'rgba(255,255,255,0.2)',
    letterSpacing: 2,
  },
  saveBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#009688',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  saveBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: 0.5,
  },
  productDetails: {
    padding: 12,
    gap: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#009688',
  },
  productName: {
    fontSize: 12,
    color: '#1A1A1A',
    lineHeight: 16,
    fontWeight: '400',
    height: 32,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  originalPrice: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.35)',
    textDecorationLine: 'underline',
  },
  salePrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#009688',
  },
  originalPriceText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  quickAddButton: {
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  quickAddButtonText: {
    color: '#1A1A1A',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  brandScroll: {
    gap: 12,
  },
  brandCard: {
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(212, 175, 55, 0.03)',
  },
  brandCardText: {
    fontSize: 11,
    color: '#009688',
    fontWeight: '700',
    letterSpacing: 2,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  gridProductCard: {
    width: (SCREEN_WIDTH - 56) / 2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.12)',
    overflow: 'hidden',
    backgroundColor: 'rgba(23, 23, 23, 0.8)',
  },
  gridImagePlaceholder: {
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridImageText: {
    fontSize: 16,
    fontWeight: '200',
    color: 'rgba(212, 175, 55, 0.2)',
    letterSpacing: 2,
  },
  gridProductName: {
    fontSize: 12,
    color: '#1A1A1A',
    lineHeight: 16,
    height: 32,
  },
  gridPriceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#009688',
  },
  gridAddButton: {
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
});
