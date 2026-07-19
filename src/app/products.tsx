import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  Easing,
  withRepeat,
  runOnJS,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import SkeletonCard from '../components/SkeletonCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- VECTOR ICONS FOR PRODUCT LISTING ---
const ChevronLeftIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#80CBC4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="m15 18-6-6 6-6" />
  </Svg>
);

const GridViewIcon = ({ active }: { active: boolean }) => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? '#80CBC4' : 'rgba(0,0,0,0.35)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Rect x="3" y="3" width="7" height="7" />
    <Rect x="14" y="3" width="7" height="7" />
    <Rect x="14" y="14" width="7" height="7" />
    <Rect x="3" y="14" width="7" height="7" />
  </Svg>
);

const ListViewIcon = ({ active }: { active: boolean }) => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? '#80CBC4' : 'rgba(0,0,0,0.35)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 12h18M3 6h18M3 18h18" />
  </Svg>
);

const SortIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#80CBC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="m15 4 5 5m-5-5-5 5m5-5v16M9 20 4 15m5 5 5-5m-5 5V4" />
  </Svg>
);

const FilterIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#80CBC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
  </Svg>
);

const StarIcon = () => (
  <Svg width="10" height="10" viewBox="0 0 24 24" fill="#80CBC4">
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </Svg>
);

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? '#EA4335' : 'none'} stroke={filled ? '#EA4335' : 'rgba(0,0,0,0.6)'} strokeWidth="2">
    <Path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </Svg>
);

// --- MOCK PRODUCTS ---
const INITIAL_PRODUCTS = [
  {
    id: '1',
    brand: 'AURUM WELLNESS',
    name: 'Gold Standard Whey Isolate (1kg)',
    price: 69.00,
    originalPrice: 89.00,
    discount: 'SAVE 22%',
    rating: '4.9',
    proteinGrams: '25g',
    imageText: 'WHEY',
    category: 'protein'
  },
  {
    id: '2',
    brand: 'OPTIMUM NUTRITION',
    name: 'Micronized Creatine Powder (300g)',
    price: 32.00,
    originalPrice: 42.00,
    discount: 'SAVE 24%',
    rating: '4.8',
    proteinGrams: '0g',
    imageText: 'CREATINE',
    category: 'creatine'
  },
  {
    id: '3',
    brand: 'MUSCLE LABS',
    name: 'Hyper-Drive Pre-Workout (30 Serv)',
    price: 45.00,
    originalPrice: 58.00,
    discount: 'SAVE 22%',
    rating: '4.9',
    proteinGrams: '0g',
    imageText: 'PRE-WK',
    category: 'preworkout'
  },
  {
    id: '4',
    brand: 'AURUM WELLNESS',
    name: 'Hydrolyzed Whey Blend (2.2kg)',
    price: 119.00,
    originalPrice: 149.00,
    discount: 'SAVE 20%',
    rating: '4.9',
    proteinGrams: '27g',
    imageText: 'WHEY',
    category: 'protein'
  },
  {
    id: '5',
    brand: 'NUTRITION LABS',
    name: 'Essential Multivitamins (90 Tabs)',
    price: 24.00,
    originalPrice: 35.00,
    discount: 'SAVE 31%',
    rating: '4.7',
    proteinGrams: '0g',
    imageText: 'VITAMIN',
    category: 'vitamins'
  },
  {
    id: '6',
    brand: 'MY PROTEIN',
    name: 'Active BCAAs Recover Matrix (250g)',
    price: 29.00,
    originalPrice: 39.00,
    discount: 'SAVE 25%',
    rating: '4.8',
    proteinGrams: '5g',
    imageText: 'BCAA',
    category: 'bcaa'
  }
];

// --- INDIVIDUAL PRODUCT CARD COMPONENT (Handles local springs/wishlist/cart states) ---
function ProductCard({
  item,
  isList,
  onWishlistToggle,
  isWishlisted,
  onPress
}: {
  item: typeof INITIAL_PRODUCTS[0];
  isList: boolean;
  onWishlistToggle: () => void;
  isWishlisted: boolean;
  onPress: () => void;
}) {
  const heartScale = useSharedValue(1);
  const shineX = useSharedValue(-150);

  useEffect(() => {
    // Infinite loop for CTA button gold shine sweeps
    shineX.value = withRepeat(
      withTiming(150, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
      -1,
      false
    );
  }, []);

  const handleWishlistPress = () => {
    heartScale.value = withSequence(
      withSpring(1.5, { damping: 5 }),
      withSpring(1.0, { damping: 10 })
    );
    onWishlistToggle();
  };

  const animatedHeartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const animatedShineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shineX.value }],
  }));

  if (isList) {
    // List Card Layout (Horizontal)
    return (
      <TouchableOpacity onPress={onPress} style={styles.listCard} activeOpacity={0.95}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']}
          style={StyleSheet.absoluteFill}
        />
        
        {/* Product image block */}
        <View style={styles.listImageBlock}>
          <LinearGradient colors={['#18191B', '#090A0B']} style={StyleSheet.absoluteFill} />
          <Text style={styles.imageText}>{item.imageText}</Text>
          <View style={styles.listDiscountBadge}>
            <Text style={styles.discountText}>{item.discount}</Text>
          </View>
        </View>

        {/* Product details column */}
        <View style={styles.listDetails}>
          <View style={styles.listDetailsTop}>
            <View>
              <Text style={styles.brandText}>{item.brand}</Text>
              <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
            </View>
            <TouchableOpacity onPress={handleWishlistPress} activeOpacity={0.8} style={styles.listHeartBtn}>
              <Animated.View style={animatedHeartStyle}>
                <HeartIcon filled={isWishlisted} />
              </Animated.View>
            </TouchableOpacity>
          </View>

          <View style={styles.ratingRow}>
            <StarIcon />
            <Text style={styles.ratingText}>{item.rating}</Text>
            {item.proteinGrams !== '0g' && (
              <View style={styles.proteinTag}>
                <Text style={styles.proteinTagText}>{item.proteinGrams} Protein</Text>
              </View>
            )}
          </View>

          <View style={styles.listFooter}>
            <View style={styles.priceRow}>
              <Text style={styles.slashedPrice}>${item.originalPrice.toFixed(2)}</Text>
              <Text style={styles.currentPrice}>${item.price.toFixed(2)}</Text>
            </View>

            <TouchableOpacity activeOpacity={0.85} style={styles.listAddButton}>
              <LinearGradient colors={['#009688', '#00796B']} style={StyleSheet.absoluteFill} />
              <Animated.View style={[styles.buttonShine, animatedShineStyle]}>
                <LinearGradient
                  colors={['rgba(255,255,255,0)', 'rgba(0,0,0,0.35)', 'rgba(255,255,255,0)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
              <Text style={styles.addButtonText}>ADD</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Grid Card Layout (Vertical)
  return (
    <TouchableOpacity onPress={onPress} style={styles.gridCard} activeOpacity={0.95}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Product image block */}
      <View style={styles.gridImageBlock}>
        <LinearGradient colors={['#18191B', '#090A0B']} style={StyleSheet.absoluteFill} />
        <Text style={styles.imageText}>{item.imageText}</Text>
        <View style={styles.gridDiscountBadge}>
          <Text style={styles.discountText}>{item.discount}</Text>
        </View>

        <TouchableOpacity onPress={handleWishlistPress} activeOpacity={0.8} style={styles.gridHeartBtn}>
          <Animated.View style={animatedHeartStyle}>
            <HeartIcon filled={isWishlisted} />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Details */}
      <View style={styles.gridDetails}>
        <Text style={styles.brandText}>{item.brand}</Text>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>

        <View style={styles.ratingAndProteinRow}>
          <View style={styles.ratingRow}>
            <StarIcon />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          {item.proteinGrams !== '0g' && (
            <View style={styles.proteinTag}>
              <Text style={styles.proteinTagText}>{item.proteinGrams} Protein</Text>
            </View>
          )}
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.slashedPrice}>${item.originalPrice.toFixed(2)}</Text>
          <Text style={styles.currentPrice}>${item.price.toFixed(2)}</Text>
        </View>
      </View>

      {/* Add Button */}
      <TouchableOpacity activeOpacity={0.85} style={styles.gridAddButton}>
        <LinearGradient colors={['#009688', '#00796B']} style={StyleSheet.absoluteFill} />
        <Animated.View style={[styles.buttonShine, animatedShineStyle]}>
          <LinearGradient
            colors={['rgba(255,255,255,0)', 'rgba(0,0,0,0.35)', 'rgba(255,255,255,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        <Text style={styles.addButtonText}>ADD TO CART</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

// --- MAIN PRODUCT LISTING SCREEN ---
export default function ProductListingScreen() {
  const router = useRouter();

  const handleProductPress = (name: string, price: number) => {
    router.push({
      pathname: '/details',
      params: { name, price }
    });
  };

  const params = useLocalSearchParams();
  const categoryTitle = params.categoryTitle ? String(params.categoryTitle) : 'Products';

  const [loading, setLoading] = useState(true);
  const [isList, setIsList] = useState(false);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isEndLoading, setIsEndLoading] = useState(false);
  const [sortOption, setSortOption] = useState<'default' | 'priceAsc' | 'priceDesc'>('default');

  // Reanimated values for mount animation
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(20);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600 });
    headerTranslateY.value = withSpring(0, { damping: 15 });
    contentOpacity.value = withDelay(150, withTiming(1, { duration: 600 }));
    contentTranslateY.value = withDelay(150, withSpring(0, { damping: 15 }));
  }, []);

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  // Load state simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleBack = () => {
    router.back();
  };

  const toggleWishlist = (id: string) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Sort function
  const handleSort = () => {
    let nextSort: typeof sortOption = 'default';
    if (sortOption === 'default') nextSort = 'priceAsc';
    else if (sortOption === 'priceAsc') nextSort = 'priceDesc';
    else nextSort = 'default';

    setSortOption(nextSort);

    setLoading(true);
    setTimeout(() => {
      let sorted = [...INITIAL_PRODUCTS];
      if (nextSort === 'priceAsc') {
        sorted.sort((a, b) => a.price - b.price);
      } else if (nextSort === 'priceDesc') {
        sorted.sort((a, b) => b.price - a.price);
      }
      setProducts(sorted);
      setLoading(false);
    }, 800);
  };

  // Infinite scroll load more simulation
  const handleLoadMore = () => {
    if (isEndLoading) return;
    setIsEndLoading(true);

    setTimeout(() => {
      // Append duplicate products with fresh IDs to mock database scroll
      const more = INITIAL_PRODUCTS.map((p) => ({
        ...p,
        id: `${p.id}-extra-${Date.now()}`
      }));
      setProducts((prev) => [...prev, ...more]);
      setIsEndLoading(false);
    }, 1500);
  };

  return (
    <View style={styles.container}>
      {/* Background Linear Gradients */}
      <LinearGradient
        colors={['#1A1A1A', '#0F0D0A', '#1A1A1A']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      {/* Ambient gold glow top left */}
      <View style={{ position: 'absolute', top: -100, left: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(212,175,55,0.04)' }} />

      {/* --- TOP HEADER APP BAR --- */}
      <Animated.View style={animatedHeaderStyle}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} activeOpacity={0.7} style={styles.backButton}>
            <ChevronLeftIcon />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{categoryTitle.toUpperCase()}</Text>
          
          {/* Toggle view button */}
          <TouchableOpacity onPress={() => setIsList(!isList)} activeOpacity={0.7} style={styles.toggleButton}>
            {isList ? <GridViewIcon active={true} /> : <ListViewIcon active={true} />}
          </TouchableOpacity>
        </View>

        {/* --- FILTER & SORT ACTIONS BAR --- */}
        <View style={styles.actionsBar}>
          <TouchableOpacity onPress={handleSort} activeOpacity={0.7} style={styles.actionItem}>
            <SortIcon />
            <Text style={styles.actionText}>
              SORT{sortOption === 'priceAsc' ? ': LOW TO HIGH' : sortOption === 'priceDesc' ? ': HIGH TO LOW' : ''}
            </Text>
          </TouchableOpacity>
          <View style={styles.actionDivider} />
          <TouchableOpacity activeOpacity={0.7} style={styles.actionItem}>
            <FilterIcon />
            <Text style={styles.actionText}>FILTER</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* --- PRODUCT FLATLIST / SKELETON LOADER --- */}
      <Animated.View style={[{ flex: 1 }, animatedContentStyle]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            {/* Skeleton list matching active layout */}
            {isList ? (
              <View style={styles.skeletonColumn}>
                <SkeletonCard isList={true} />
                <SkeletonCard isList={true} />
                <SkeletonCard isList={true} />
              </View>
            ) : (
              <View style={styles.skeletonGrid}>
                <SkeletonCard isList={false} />
                <SkeletonCard isList={false} />
                <SkeletonCard isList={false} />
                <SkeletonCard isList={false} />
              </View>
            )}
          </View>
        ) : (
          <FlatList
            key={isList ? 'list' : 'grid'} // Force refresh grid column layouts
            data={products}
            numColumns={isList ? 1 : 2}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.listScrollContent,
              !isList ? styles.gridSpacing : null
            ]}
            columnWrapperStyle={!isList ? styles.gridColumnWrapper : undefined}
            renderItem={({ item }) => (
              <ProductCard
                item={item}
                isList={isList}
                isWishlisted={wishlist.includes(item.id)}
                onWishlistToggle={() => toggleWishlist(item.id)}
                onPress={() => handleProductPress(item.name, item.price)}
              />
            )}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.2}
            ListFooterComponent={() =>
              isEndLoading ? (
                <View style={styles.footerLoaderContainer}>
                  <ActivityIndicator size="small" color="#009688" />
                  <Text style={styles.footerLoaderText}>LAZY LOADING MORE...</Text>
                </View>
              ) : <View style={{ height: 60 }} />
            }
          />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
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
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '300',
    color: '#1A1A1A',
    letterSpacing: 2,
  },
  toggleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsBar: {
    flexDirection: 'row',
    height: 44,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(0,150,136,0.08)',
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  actionItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    fontSize: 11,
    color: '#009688',
    fontWeight: '600',
    letterSpacing: 1.2,
  },
  actionDivider: {
    width: 1,
    height: '60%',
    backgroundColor: 'rgba(0,150,136,0.08)',
    alignSelf: 'center',
  },
  loadingContainer: {
    flex: 1,
    padding: 16,
  },
  skeletonColumn: {
    gap: 16,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  listScrollContent: {
    padding: 16,
  },
  gridSpacing: {
    paddingHorizontal: 16,
  },
  gridColumnWrapper: {
    justifyContent: 'space-between',
  },
  
  // --- GRID PRODUCT CARD ---
  gridCard: {
    width: (SCREEN_WIDTH - 48) / 2, // 2 Column layout calculation
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    overflow: 'hidden',
    marginBottom: 16,
    height: 300,
    justifyContent: 'space-between',
  },
  gridImageBlock: {
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderBottomWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  imageText: {
    fontSize: 18,
    fontWeight: '200',
    color: 'rgba(255, 255, 255, 0.2)',
    letterSpacing: 2,
  },
  gridDiscountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#EA4335',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 0.5,
  },
  gridHeartBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridDetails: {
    padding: 12,
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  brandText: {
    fontSize: 8,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  productName: {
    fontSize: 12,
    color: '#1A1A1A',
    fontWeight: '400',
    lineHeight: 16,
    height: 32,
  },
  ratingAndProteinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#009688',
  },
  proteinTag: {
    backgroundColor: 'rgba(224, 176, 52, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  proteinTagText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#009688',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  slashedPrice: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.35)',
    textDecorationLine: 'line-through',
  },
  currentPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#009688',
  },
  gridAddButton: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  buttonShine: {
    ...StyleSheet.absoluteFill,
    width: '80%',
  },
  addButtonText: {
    color: '#1A1A1A',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },

  // --- LIST PRODUCT CARD ---
  listCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    marginBottom: 16,
    flexDirection: 'row',
    padding: 12,
    height: 136,
    gap: 14,
  },
  listImageBlock: {
    width: 100,
    height: '100%',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  listDiscountBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#EA4335',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  listDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  listDetailsTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  listHeartBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  listAddButton: {
    width: 76,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  
  // --- INFINITE LOADER FOOTER ---
  footerLoaderContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 24,
  },
  footerLoaderText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#009688',
    letterSpacing: 1.5,
  },
});
