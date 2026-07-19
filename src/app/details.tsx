import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions, Share, TextInput } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  Easing,
  withSequence,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect, G, Line } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- VECTOR ICONS FOR PRODUCT DETAILS ---
const ChevronLeftIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#80CBC4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="m15 18-6-6 6-6" />
  </Svg>
);

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? '#EA4335' : 'none'} stroke={filled ? '#EA4335' : '#80CBC4'} strokeWidth="2">
    <Path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </Svg>
);

const ShareIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#80CBC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" />
  </Svg>
);

const StarIcon = () => (
  <Svg width="14" height="14" viewBox="0 0 24 24" fill="#80CBC4">
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </Svg>
);

const PlusIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Line x1="12" y1="5" x2="12" y2="19" />
    <Line x1="5" y1="12" x2="19" y2="12" />
  </Svg>
);

const MinusIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Line x1="5" y1="12" x2="19" y2="12" />
  </Svg>
);

const ChevronDownIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#80CBC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="m6 9 6 6 6-6" />
  </Svg>
);

const ChevronUpIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#80CBC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="m18 15-6-6-6 6" />
  </Svg>
);

// --- MOCK RELATED PRODUCTS ---
const RELATED_PRODUCTS = [
  { id: '101', name: 'Creatine Monohydrate 300g', price: '$32.00', imageText: 'CRT' },
  { id: '102', name: 'BCAA Amino Rush 250g', price: '$29.00', imageText: 'BCAA' },
  { id: '103', name: 'Pre-Workout Ignite 30 Serv', price: '$45.00', imageText: 'P-WK' },
];

export default function ProductDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const productName = params.name ? String(params.name) : 'Gold Standard Whey Isolate';
  const productPrice = params.price ? Number(params.price) : 69.00;

  // UI state
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<'360' | 'images'>('360');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // Frequently Bought Together states
  const [includeShaker, setIncludeShaker] = useState(false);
  const [includeCreatine, setIncludeCreatine] = useState(false);
  
  // Collapsible section states
  const [ingredientsOpen, setIngredientsOpen] = useState(false);
  const [benefitsOpen, setBenefitsOpen] = useState(false);

  // Reanimated shared values
  const heartScale = useSharedValue(1);
  const qtyScale = useSharedValue(1);
  const rotValue = useSharedValue(50); // 360 viewer slider progress (0 to 100)

  // Carousel indicator index tracking
  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / slideSize);
    setActiveImageIndex(index);
  };

  // Mount stagger animations
  const mountHeaderOpacity = useSharedValue(0);
  const mountHeaderTranslateY = useSharedValue(-20);
  const mountContentOpacity = useSharedValue(0);
  const mountContentTranslateY = useSharedValue(30);
  const mountFooterOpacity = useSharedValue(0);

  useEffect(() => {
    mountHeaderOpacity.value = withTiming(1, { duration: 500 });
    mountHeaderTranslateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) });
    mountContentOpacity.value = withDelay(150, withTiming(1, { duration: 600 }));
    mountContentTranslateY.value = withDelay(150, withTiming(0, { duration: 600, easing: Easing.out(Easing.quad) }));
    mountFooterOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out the ${productName} on Aurum Wellness!`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleWishlistToggle = () => {
    heartScale.value = withSequence(
      withSpring(1.5, { damping: 5 }),
      withSpring(1.0, { damping: 10 })
    );
    setWishlisted(!wishlisted);
  };

  const handleQtyAdjust = (type: 'inc' | 'dec') => {
    qtyScale.value = withSequence(
      withSpring(1.3, { damping: 6 }),
      withSpring(1.0, { damping: 12 })
    );
    if (type === 'inc') setQuantity((prev) => prev + 1);
    else if (type === 'dec' && quantity > 1) setQuantity((prev) => prev - 1);
  };

  // Bundle calculations
  const totalBundlePrice = productPrice + (includeShaker ? 12.00 : 0) + (includeCreatine ? 32.00 : 0);

  // Animated styles
  const animatedHeartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const animatedQtyStyle = useAnimatedStyle(() => ({
    transform: [{ scale: qtyScale.value }],
  }));

  const animatedMountHeaderStyle = useAnimatedStyle(() => ({
    opacity: mountHeaderOpacity.value,
    transform: [{ translateY: mountHeaderTranslateY.value }],
  }));

  const animatedMountContentStyle = useAnimatedStyle(() => ({
    opacity: mountContentOpacity.value,
    transform: [{ translateY: mountContentTranslateY.value }],
  }));

  const animatedMountFooterStyle = useAnimatedStyle(() => ({
    opacity: mountFooterOpacity.value,
  }));

  // 360 simulated container rotation style mapping
  const animatedStripeStyle1 = useAnimatedStyle(() => {
    const translateX = interpolate(rotValue.value, [0, 100], [-30, 30]);
    return { transform: [{ translateX }] };
  });

  const animatedStripeStyle2 = useAnimatedStyle(() => {
    const translateX = interpolate(rotValue.value, [0, 100], [-10, 50]);
    return { transform: [{ translateX }] };
  });

  const animatedLabelStyle = useAnimatedStyle(() => {
    const translateX = interpolate(rotValue.value, [0, 100], [-15, 15]);
    const scaleX = interpolate(rotValue.value, [0, 50, 100], [0.5, 1, 0.5]);
    return {
      transform: [{ translateX }, { scaleX }],
      opacity: interpolate(rotValue.value, [0, 20, 80, 100], [0, 1, 1, 0]),
    };
  });

  return (
    <View style={styles.container}>
      {/* Background Gradients */}
      <LinearGradient
        colors={['#FFFFFF', '#F9F9F9', '#FFFFFF']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      {/* Ambient gold glow at top */}
      <View style={{ position: 'absolute', top: -80, left: SCREEN_WIDTH / 2 - 120, width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(212,175,55,0.05)' }} />

      {/* --- TOP HEADER APP BAR --- */}
      <Animated.View style={[styles.header, animatedMountHeaderStyle]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.iconButton}>
          <ChevronLeftIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PRODUCT DETAIL</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleShare} activeOpacity={0.7} style={styles.iconButton}>
            <ShareIcon />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleWishlistToggle} activeOpacity={0.7} style={styles.iconButton}>
            <Animated.View style={animatedHeartStyle}>
              <HeartIcon filled={wishlisted} />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.ScrollView style={[styles.scrollContainer, animatedMountContentStyle]} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* --- VIEW SELECTOR (360 vs Images) --- */}
        <View style={styles.viewSelectorRow}>
          <TouchableOpacity
            onPress={() => setActiveTab('360')}
            style={[styles.selectorTab, activeTab === '360' ? styles.selectorTabActive : null]}
          >
            <Text style={[styles.selectorText, activeTab === '360' ? styles.selectorTextActive : null]}>360° VIEWER</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('images')}
            style={[styles.selectorTab, activeTab === 'images' ? styles.selectorTabActive : null]}
          >
            <Text style={[styles.selectorText, activeTab === 'images' ? styles.selectorTextActive : null]}>IMAGE GALLERY</Text>
          </TouchableOpacity>
        </View>

        {/* --- MAIN DISPLAY BOX (Simulated 360 rotation or images) --- */}
        <View style={styles.mediaContainer}>
          {activeTab === '360' ? (
            <View style={styles.viewer360}>
              <LinearGradient
                colors={['rgba(255,255,255,0.02)', 'rgba(255,255,255,0.005)']}
                style={StyleSheet.absoluteFill}
              />
              
              {/* Simulated 3D supplement tub container */}
              <View style={styles.tubContainer}>
                {/* Outer shadow ring */}
                <View style={styles.tubShadow} />
                
                {/* Lid */}
                <View style={styles.tubLid} />
                
                {/* Tub Body */}
                <View style={styles.tubBody}>
                  {/* Rotating vertical stripes */}
                  <Animated.View style={[styles.tubStripe, animatedStripeStyle1]} />
                  <Animated.View style={[styles.tubStripe, animatedStripeStyle2]} />
                  
                  {/* Rotating Monogram Label */}
                  <Animated.View style={[styles.tubLabel, animatedLabelStyle]}>
                    <Text style={styles.tubLabelBrand}>AURUM</Text>
                    <Text style={styles.tubLabelProduct}>WHEY</Text>
                  </Animated.View>
                </View>
              </View>

              {/* Slider for rotation control */}
              <View style={styles.sliderContainer}>
                <Text style={styles.sliderLabel}>DRAG SLIDER TO ROTATE 360°</Text>
                <View style={styles.sliderTrack}>
                  <View style={styles.sliderLine} />
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.sliderThumbWrapper}
                  >
                    {/* Reanimated binds directly to standard range inputs */}
                    <TextInput
                      keyboardType="number-pad"
                      maxLength={3}
                      value={String(Math.round(rotValue.value))}
                      onChangeText={(text: string) => {
                        const val = Math.min(100, Math.max(0, Number(text) || 0));
                        rotValue.value = withTiming(val, { duration: 100 });
                      }}
                      style={styles.hiddenSliderInput}
                    />
                    <View style={styles.sliderThumb} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.carouselWrapper}>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                style={styles.carousel}
              >
                <View style={styles.carouselSlide}>
                  <LinearGradient colors={['#FFFFFF', '#F5F5F5']} style={StyleSheet.absoluteFill} />
                  <Text style={styles.carouselImageText}>WHEY - FRONT</Text>
                </View>
                <View style={styles.carouselSlide}>
                  <LinearGradient colors={['#FFFFFF', '#F5F5F5']} style={StyleSheet.absoluteFill} />
                  <Text style={styles.carouselImageText}>WHEY - BACK (NUTRITION)</Text>
                </View>
                <View style={styles.carouselSlide}>
                  <LinearGradient colors={['#FFFFFF', '#F5F5F5']} style={StyleSheet.absoluteFill} />
                  <Text style={styles.carouselImageText}>WHEY - SCOOP DETAILS</Text>
                </View>
              </ScrollView>
              
              {/* Indicators */}
              <View style={styles.carouselIndicators}>
                {[0, 1, 2].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.carouselIndicatorDot,
                      i === activeImageIndex ? styles.carouselIndicatorDotActive : null,
                    ]}
                  />
                ))}
              </View>
            </View>
          )}
        </View>

        {/* --- PRODUCT IDENTITY --- */}
        <View style={styles.detailsSection}>
          <Text style={styles.brandText}>AURUM WELLNESS</Text>
          <Text style={styles.productNameText}>{productName}</Text>
          
          <View style={styles.ratingAndStatusRow}>
            <TouchableOpacity onPress={() => router.push('/reviews')} style={styles.ratingRow} activeOpacity={0.7}>
              {[1, 2, 3, 4, 5].map((s) => <StarIcon key={s} />)}
              <Text style={styles.ratingValueText}>4.9 (2,450 Reviews) &gt;</Text>
            </TouchableOpacity>
            <View style={styles.inStockBadge}>
              <Text style={styles.inStockBadgeText}>IN STOCK</Text>
            </View>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.originalPriceText}>${(productPrice * 1.25).toFixed(2)}</Text>
            <Text style={styles.priceValueText}>${productPrice.toFixed(2)}</Text>
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>20% OFF</Text>
            </View>
          </View>
        </View>

        {/* --- NUTRITION FACTS MATRIX --- */}
        <View style={styles.nutritionSection}>
          <Text style={styles.sectionTitle}>Nutrition Facts Matrix</Text>
          <View style={styles.nutritionGrid}>
            <View style={styles.nutritionCell}>
              <Text style={styles.nutritionCellValue}>25g</Text>
              <Text style={styles.nutritionCellLabel}>Protein</Text>
            </View>
            <View style={styles.nutritionCell}>
              <Text style={styles.nutritionCellValue}>5.5g</Text>
              <Text style={styles.nutritionCellLabel}>BCAAs</Text>
            </View>
            <View style={styles.nutritionCell}>
              <Text style={styles.nutritionCellValue}>120</Text>
              <Text style={styles.nutritionCellLabel}>Calories</Text>
            </View>
            <View style={styles.nutritionCell}>
              <Text style={styles.nutritionCellValue}>1.5g</Text>
              <Text style={styles.nutritionCellLabel}>Fat</Text>
            </View>
          </View>
        </View>

        {/* --- COLLAPSIBLE DETAILS (Ingredients / Benefits) --- */}
        <View style={styles.collapsibleContainer}>
          {/* Ingredients */}
          <TouchableOpacity
            onPress={() => setIngredientsOpen(!ingredientsOpen)}
            activeOpacity={0.8}
            style={styles.collapsibleHeader}
          >
            <Text style={styles.collapsibleTitle}>Ingredients</Text>
            {ingredientsOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </TouchableOpacity>
          {ingredientsOpen && (
            <View style={styles.collapsibleBody}>
              <Text style={styles.collapsibleText}>
                Whey Protein Isolate, Cocoa Powder (Processed with Alkali), Natural and Artificial Flavors, Soy Lecithin, Salt, Sucralose, Acesulfame Potassium.
              </Text>
            </View>
          )}

          {/* Benefits */}
          <TouchableOpacity
            onPress={() => setBenefitsOpen(!benefitsOpen)}
            activeOpacity={0.8}
            style={styles.collapsibleHeader}
          >
            <Text style={styles.collapsibleTitle}>Key Benefits</Text>
            {benefitsOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </TouchableOpacity>
          {benefitsOpen && (
            <View style={styles.collapsibleBody}>
              <Text style={styles.collapsibleText}>
                • Promotes rapid lean muscle synthesis and recovery.{"\n"}
                • High-purity micro-filtered isolate ensures minimal fat & carbs.{"\n"}
                • Enriched with fast-absorbing BCAAs for cellular repair.
              </Text>
            </View>
          )}
        </View>

        {/* --- BUNDLE BUILDER (Frequently bought together) --- */}
        <View style={styles.bundleSection}>
          <Text style={styles.sectionTitle}>Frequently Bought Together</Text>
          <View style={styles.bundleBox}>
            <LinearGradient
              colors={['rgba(0,150,136,0.05)', 'rgba(255,255,255,0.01)']}
              style={StyleSheet.absoluteFill}
            />

            {/* Checklist */}
            <View style={styles.bundleItemRow}>
              <View style={styles.checkboxChecked}>
                <View style={styles.checkboxCore} />
              </View>
              <View style={styles.bundleItemInfo}>
                <Text style={styles.bundleItemName}>This Product: {productName}</Text>
                <Text style={styles.bundleItemPrice}>${productPrice.toFixed(2)}</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setIncludeShaker(!includeShaker)}
              activeOpacity={0.8}
              style={styles.bundleItemRow}
            >
              <View style={includeShaker ? styles.checkboxChecked : styles.checkboxUnchecked}>
                {includeShaker && <View style={styles.checkboxCore} />}
              </View>
              <View style={styles.bundleItemInfo}>
                <Text style={styles.bundleItemName}>Premium Shaker Bottle (700ml)</Text>
                <Text style={styles.bundleItemPrice}>+$12.00</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIncludeCreatine(!includeCreatine)}
              activeOpacity={0.8}
              style={styles.bundleItemRow}
            >
              <View style={includeCreatine ? styles.checkboxChecked : styles.checkboxUnchecked}>
                {includeCreatine && <View style={styles.checkboxCore} />}
              </View>
              <View style={styles.bundleItemInfo}>
                <Text style={styles.bundleItemName}>Micronized Creatine (300g)</Text>
                <Text style={styles.bundleItemPrice}>+$32.00</Text>
              </View>
            </TouchableOpacity>

            {/* Total Row */}
            <View style={styles.bundleTotalRow}>
              <Text style={styles.bundleTotalLabel}>Bundle Price:</Text>
              <Text style={styles.bundleTotalValue}>${totalBundlePrice.toFixed(2)}</Text>
            </View>

            <TouchableOpacity activeOpacity={0.85} style={styles.bundleAddButton}>
              <LinearGradient colors={['#009688', '#00796B']} style={StyleSheet.absoluteFill} />
              <Text style={styles.bundleAddButtonText}>ADD BUNDLE TO CART</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* --- RELATED PRODUCTS --- */}
        <View style={styles.relatedSection}>
          <Text style={styles.sectionTitle}>Related Products</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedScroll}>
            {RELATED_PRODUCTS.map((prod) => (
              <View key={prod.id} style={styles.relatedCard}>
                <LinearGradient
                  colors={['rgba(0,150,136,0.05)', 'rgba(255,255,255,0.01)']}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.relatedImage}>
                  <LinearGradient colors={['#FFFFFF', '#F5F5F5']} style={StyleSheet.absoluteFill} />
                  <Text style={styles.relatedImageText}>{prod.imageText}</Text>
                </View>
                <Text style={styles.relatedName} numberOfLines={1}>{prod.name}</Text>
                <Text style={styles.relatedPrice}>{prod.price}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Space beneath content to clear sticky bar */}
        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>

      {/* --- STICKY BOTTOM ACTIONS BAR --- */}
      <Animated.View style={[styles.stickyBottomBar, animatedMountFooterStyle]}>
        <LinearGradient
          colors={['#FFFFFF', '#F5F5F5']}
          style={StyleSheet.absoluteFill}
        />

        {/* Quantity selector */}
        <View style={styles.qtyContainer}>
          <TouchableOpacity onPress={() => handleQtyAdjust('dec')} activeOpacity={0.7} style={styles.qtyButton}>
            <MinusIcon />
          </TouchableOpacity>
          <Animated.Text style={[styles.qtyText, animatedQtyStyle]}>{quantity}</Animated.Text>
          <TouchableOpacity onPress={() => handleQtyAdjust('inc')} activeOpacity={0.7} style={styles.qtyButton}>
            <PlusIcon />
          </TouchableOpacity>
        </View>

        {/* Buy CTAs */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity activeOpacity={0.8} style={styles.cartButton}>
            <Text style={styles.cartButtonText}>ADD TO CART</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.85} style={styles.buyButton}>
            <LinearGradient colors={['#009688', '#00796B']} style={StyleSheet.absoluteFill} />
            <Text style={styles.buyButtonText}>BUY NOW</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 60,
    height: 48,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(0,150,136,0.08)',
    paddingBottom: 10,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(212, 175, 55, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.15)',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#1A1A1A',
    letterSpacing: 2,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 10,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  viewSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  selectorTab: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,150,136,0.10)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  selectorTabActive: {
    borderColor: '#009688',
    backgroundColor: 'rgba(212, 175, 55, 0.06)',
  },
  selectorText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.5)',
    letterSpacing: 1,
  },
  selectorTextActive: {
    color: '#009688',
  },
  mediaContainer: {
    height: 280,
    width: SCREEN_WIDTH,
    alignItems: 'center',
  },
  viewer360: {
    width: SCREEN_WIDTH - 40,
    height: '100%',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,150,136,0.08)',
    backgroundColor: 'rgba(255,255,255,0.01)',
    overflow: 'hidden',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  tubContainer: {
    alignItems: 'center',
    width: 140,
    height: 160,
    justifyContent: 'center',
    position: 'relative',
    marginTop: 10,
  },
  tubShadow: {
    position: 'absolute',
    bottom: -5,
    width: 100,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(224, 176, 52, 0.07)',
  },
  tubLid: {
    width: 80,
    height: 18,
    borderRadius: 4,
    backgroundColor: '#0F0E0E',
    borderWidth: 1.5,
    borderColor: '#80CBC4',
  },
  tubBody: {
    width: 96,
    height: 110,
    backgroundColor: '#050505',
    borderWidth: 1.5,
    borderColor: '#80CBC4',
    borderTopWidth: 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tubStripe: {
    position: 'absolute',
    width: 2,
    height: '100%',
    backgroundColor: 'rgba(224, 176, 52, 0.15)',
  },
  tubLabel: {
    width: 60,
    height: 50,
    borderRadius: 6,
    backgroundColor: '#1E1B15',
    borderWidth: 1,
    borderColor: 'rgba(224, 176, 52, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tubLabelBrand: {
    fontSize: 8,
    fontWeight: '700',
    color: '#80CBC4',
    letterSpacing: 1,
  },
  tubLabelProduct: {
    fontSize: 9,
    fontWeight: '300',
    color: '#1A1A1A',
    letterSpacing: 0.5,
  },
  sliderContainer: {
    width: '80%',
    alignItems: 'center',
    gap: 6,
  },
  sliderLabel: {
    fontSize: 8,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.35)',
    letterSpacing: 1.5,
  },
  sliderTrack: {
    width: '100%',
    height: 18,
    justifyContent: 'center',
    position: 'relative',
  },
  sliderLine: {
    height: 2,
    backgroundColor: 'rgba(0,150,136,0.12)',
    width: '100%',
  },
  sliderThumbWrapper: {
    position: 'absolute',
    alignSelf: 'center',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderThumb: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#009688',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  hiddenSliderInput: {
    position: 'absolute',
    opacity: 0,
    width: '100%',
    height: '100%',
  },
  carouselWrapper: {
    width: SCREEN_WIDTH - 40,
    height: '100%',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,150,136,0.08)',
    backgroundColor: 'rgba(255,255,255,0.01)',
    overflow: 'hidden',
    position: 'relative',
  },
  carousel: {
    flex: 1,
  },
  carouselSlide: {
    width: SCREEN_WIDTH - 40,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselImageText: {
    fontSize: 16,
    fontWeight: '200',
    color: 'rgba(255,255,255,0.2)',
    letterSpacing: 1,
  },
  carouselIndicators: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    gap: 6,
  },
  carouselIndicatorDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  carouselIndicatorDotActive: {
    backgroundColor: '#80CBC4',
    width: 12,
  },
  detailsSection: {
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 8,
  },
  brandText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#80CBC4',
    letterSpacing: 2,
  },
  productNameText: {
    fontSize: 22,
    fontWeight: '300',
    color: '#1A1A1A',
    lineHeight: 28,
  },
  ratingAndStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingValueText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '400',
    marginLeft: 4,
  },
  inStockBadge: {
    backgroundColor: 'rgba(52, 168, 83, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(52, 168, 83, 0.3)',
  },
  inStockBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#34A853',
    letterSpacing: 0.5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  originalPriceText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.35)',
    textDecorationLine: 'line-through',
  },
  priceValueText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#80CBC4',
  },
  discountBadge: {
    backgroundColor: '#EA4335',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  discountBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  nutritionSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#1A1A1A',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  nutritionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  nutritionCell: {
    flex: 1,
    height: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,150,136,0.08)',
    backgroundColor: 'rgba(255,255,255,0.01)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  nutritionCellValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#80CBC4',
  },
  nutritionCellLabel: {
    fontSize: 9,
    color: 'rgba(0,0,0,0.35)',
    fontWeight: '400',
  },
  collapsibleContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 52,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(0,150,136,0.10)',
  },
  collapsibleTitle: {
    fontSize: 13,
    color: '#1A1A1A',
    fontWeight: '400',
  },
  collapsibleBody: {
    paddingVertical: 12,
  },
  collapsibleText: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.5)',
    lineHeight: 18,
    fontWeight: '300',
  },
  bundleSection: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
  bundleBox: {
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(224, 176, 52, 0.15)',
    overflow: 'hidden',
    padding: 16,
    gap: 14,
  },
  bundleItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkboxChecked: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#009688',
    backgroundColor: 'rgba(224, 176, 52, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxUnchecked: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'transparent',
  },
  checkboxCore: {
    width: 8,
    height: 8,
    borderRadius: 1,
    backgroundColor: '#80CBC4',
  },
  bundleItemInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bundleItemName: {
    fontSize: 12,
    color: '#1A1A1A',
    fontWeight: '300',
  },
  bundleItemPrice: {
    fontSize: 12,
    color: '#80CBC4',
    fontWeight: '500',
  },
  bundleTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderColor: 'rgba(0,150,136,0.10)',
    paddingTop: 12,
  },
  bundleTotalLabel: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.35)',
    fontWeight: '400',
  },
  bundleTotalValue: {
    fontSize: 16,
    color: '#80CBC4',
    fontWeight: '600',
  },
  bundleAddButton: {
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bundleAddButtonText: {
    color: '#1A1A1A',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  relatedSection: {
    marginTop: 28,
    paddingLeft: 20,
  },
  relatedScroll: {
    gap: 14,
    paddingRight: 20,
  },
  relatedCard: {
    width: 130,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,150,136,0.08)',
    padding: 10,
    gap: 6,
    overflow: 'hidden',
  },
  relatedImage: {
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  relatedImageText: {
    fontSize: 14,
    fontWeight: '200',
    color: 'rgba(255,255,255,0.2)',
  },
  relatedName: {
    fontSize: 11,
    color: '#1A1A1A',
    fontWeight: '300',
  },
  relatedPrice: {
    fontSize: 11,
    color: '#80CBC4',
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 120,
  },
  stickyBottomBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 90,
    borderTopWidth: 0.5,
    borderColor: 'rgba(0,150,136,0.10)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingBottom: 20, // Padding for safe area / home bar
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: 'rgba(0,150,136,0.12)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  qtyButton: {
    width: 32,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#80CBC4',
    borderRadius: 8,
  },
  qtyText: {
    color: '#1A1A1A',
    fontSize: 14,
    fontWeight: '600',
    width: 32,
    textAlign: 'center',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
    marginLeft: 12,
  },
  cartButton: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#009688',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartButtonText: {
    color: '#80CBC4',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
  },
  buyButton: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  buyButtonText: {
    color: '#1A1A1A',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
