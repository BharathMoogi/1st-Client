import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  Easing,
  withRepeat,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect, G, Line } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Luxury Design Tokens
const TEAL = '#009688';
const TEAL_DARK = '#00796B';
const BG = '#1A1A1A';

// --- VECTOR ICONS FOR CART ---
const ChevronLeftIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#80CBC4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="m15 18-6-6 6-6" />
  </Svg>
);

const TrashIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </Svg>
);

const ShoppingBagIcon = () => (
  <Svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#80CBC4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" fill="rgba(224,176,52,0.1)" />
    <Path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
  </Svg>
);

const PlusIcon = () => (
  <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Line x1="12" y1="5" x2="12" y2="19" />
    <Line x1="5" y1="12" x2="19" y2="12" />
  </Svg>
);

const MinusIcon = () => (
  <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Line x1="5" y1="12" x2="19" y2="12" />
  </Svg>
);

const CheckIcon = () => (
  <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34A853" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 6 9 17l-5-5" />
  </Svg>
);

const PromoIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#80CBC4" strokeWidth="2">
    <Path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <Line x1="7" y1="7" x2="7.01" y2="7" strokeWidth="3" />
  </Svg>
);

// --- INITIAL CART STATE ---
const INITIAL_CART = [
  {
    id: 'cart-1',
    brand: 'AURUM WELLNESS',
    name: 'Gold Standard Whey Isolate (1kg)',
    price: 69.00,
    imageText: 'WHEY',
    qty: 1,
  },
  {
    id: 'cart-2',
    brand: 'AURUM WELLNESS',
    name: 'Tritan Shaker Bottle (700ml)',
    price: 12.00,
    imageText: 'SHAKER',
    qty: 2,
  }
];

export default function CartScreen() {
  const router = useRouter();

  // Cart list state
  const [cartItems, setCartItems] = useState(INITIAL_CART);
  
  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [appliedError, setAppliedError] = useState(false);

  // Reanimated shared values
  const emptyOpacity = useSharedValue(0);
  const checkoutShineX = useSharedValue(-200);

  // Mount animation
  const mountOpacity = useSharedValue(0);
  const mountTranslateY = useSharedValue(24);

  useEffect(() => {
    mountOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) });
    mountTranslateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) });
    // Infinite shine sweep for checkout button
    checkoutShineX.value = withRepeat(
      withTiming(200, { duration: 2500, easing: Easing.inOut(Easing.quad) }),
      -1,
      false
    );
  }, []);

  useEffect(() => {
    if (cartItems.length === 0) {
      emptyOpacity.value = withTiming(1, { duration: 500 });
    }
  }, [cartItems]);

  const handleQtyChange = (id: string, type: 'inc' | 'dec') => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = type === 'inc' ? item.qty + 1 : item.qty - 1;
            return { ...item, qty: nextQty };
          }
          return item;
        })
        .filter((item) => item.qty > 0) // Remove if quantity goes to 0
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAll = () => {
    setCartItems([]);
  };

  const handleApplyCoupon = () => {
    setAppliedError(false);
    if (couponInput.toUpperCase() === 'AURUM20') {
      setCouponApplied(true);
    } else {
      setAppliedError(true);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(false);
    setCouponInput('');
  };

  // Math calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const gst = subtotal * 0.18; // 18% GST
  const shippingFee = subtotal > 50 ? 0 : 10.00; // Free shipping over $50
  const couponDiscount = couponApplied ? subtotal * 0.20 : 0; // 20% discount
  const grandTotal = subtotal + gst + shippingFee - couponDiscount;

  // Reanimated style bindings
  const animatedCheckoutStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: checkoutShineX.value }],
  }));

  const animatedEmptyStyle = useAnimatedStyle(() => ({
    opacity: emptyOpacity.value,
  }));

  const animatedMountStyle = useAnimatedStyle(() => ({
    opacity: mountOpacity.value,
    transform: [{ translateY: mountTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Background Gradients */}
      <LinearGradient
        colors={['#1A1A1A', '#0F0D0A', '#1A1A1A']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      {/* Ambient gold glow */}
      <View style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(212,175,55,0.04)' }} />

      {/* --- TOP HEADER APP BAR --- */}
      <Animated.View style={[styles.header, animatedMountStyle]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.headerBtn}>
          <ChevronLeftIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MY CART</Text>
        {cartItems.length > 0 ? (
          <TouchableOpacity onPress={handleClearAll} activeOpacity={0.7} style={styles.clearAllBtn}>
            <Text style={styles.clearAllText}>Clear</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </Animated.View>

      {/* --- CONDITIONAL VIEW (Items vs Empty) --- */}
      {cartItems.length > 0 ? (
        <Animated.ScrollView style={[styles.scrollContainer, animatedMountStyle]} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Cart items list */}
          <View style={styles.itemsListContainer}>
            {cartItems.map((item) => (
              <View key={item.id} style={styles.cartCard}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']}
                  style={StyleSheet.absoluteFill}
                />
                
                {/* Image block */}
              <View style={styles.cardImage}>
                <LinearGradient colors={['#F5F5F5', '#1A1A1A']} style={StyleSheet.absoluteFill} />
                <Text style={styles.cardImageText}>{item.imageText}</Text>
              </View>

                {/* Details column */}
                <View style={styles.cardDetails}>
                  <View style={styles.cardHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardBrand}>{item.brand}</Text>
                      <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleRemoveItem(item.id)} activeOpacity={0.7} style={styles.trashBtn}>
                      <TrashIcon />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.cardFooterRow}>
                    <Text style={styles.cardPrice}>${(item.price * item.qty).toFixed(2)}</Text>
                    
                    {/* Quantity selectors */}
                    <View style={styles.qtyBox}>
                      <TouchableOpacity onPress={() => handleQtyChange(item.id, 'dec')} activeOpacity={0.7} style={styles.qtyBtn}>
                        <MinusIcon />
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{item.qty}</Text>
                      <TouchableOpacity onPress={() => handleQtyChange(item.id, 'inc')} activeOpacity={0.7} style={styles.qtyBtn}>
                        <PlusIcon />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Estimated Delivery Card */}
          <View style={styles.deliveryCard}>
            <LinearGradient
              colors={['rgba(224, 176, 52, 0.12)', 'rgba(224, 176, 52, 0.02)']}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.deliveryTitle}>ESTIMATED DELIVERY</Text>
            <Text style={styles.deliveryValue}>Express Shipping: Wednesday, July 22</Text>
          </View>

          {/* Promo code input */}
          <View style={styles.promoSection}>
            <Text style={styles.sectionTitle}>Apply Coupon Code</Text>
            {couponApplied ? (
              <View style={styles.promoSuccessBox}>
                <PromoIcon />
                <View style={{ flex: 1 }}>
                  <Text style={styles.promoSuccessTitle}>"AURUM20" Applied Successfully</Text>
                  <Text style={styles.promoSuccessSubtitle}>20% discount has been slashed off your subtotal</Text>
                </View>
                <TouchableOpacity onPress={handleRemoveCoupon} activeOpacity={0.7} style={styles.removePromoBtn}>
                  <Text style={styles.removePromoText}>REMOVE</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.promoInputRow}>
                <View style={styles.promoInputBox}>
                  <TextInput
                    placeholder="Enter Coupon (e.g. AURUM20)"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={couponInput}
                    onChangeText={setCouponInput}
                    autoCapitalize="characters"
                    style={styles.promoInput}
                  />
                </View>
                <TouchableOpacity onPress={handleApplyCoupon} activeOpacity={0.8} style={styles.promoApplyBtn}>
                  <LinearGradient colors={['#009688', '#00796B']} style={StyleSheet.absoluteFill} />
                  <Text style={styles.promoApplyText}>APPLY</Text>
                </TouchableOpacity>
              </View>
            )}
            {appliedError && (
              <Text style={styles.promoErrorText}>Invalid coupon code. Try entering "AURUM20"</Text>
            )}
          </View>

          {/* Price breakdown */}
          <View style={styles.breakdownSection}>
            <Text style={styles.sectionTitle}>Price Details</Text>
            <View style={styles.breakdownBox}>
              <LinearGradient
                colors={['rgba(0,150,136,0.05)', 'rgba(255,255,255,0.01)']}
                style={StyleSheet.absoluteFill}
              />
              
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Subtotal</Text>
                <Text style={styles.breakdownValue}>${subtotal.toFixed(2)}</Text>
              </View>

              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>GST / Taxes (18%)</Text>
                <Text style={styles.breakdownValue}>${gst.toFixed(2)}</Text>
              </View>

              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Shipping Fee</Text>
                <Text style={styles.breakdownValue}>
                  {shippingFee === 0 ? (
                    <Text style={styles.freeShippingText}>FREE <Text style={styles.slashedShippingText}>$10.00</Text></Text>
                  ) : `$${shippingFee.toFixed(2)}`}
                </Text>
              </View>

              {couponApplied && (
                <View style={styles.breakdownRow}>
                  <Text style={styles.promoDiscountLabel}>Coupon Discount (20%)</Text>
                  <Text style={styles.promoDiscountValue}>-${couponDiscount.toFixed(2)}</Text>
                </View>
              )}

              <View style={styles.breakdownTotalRow}>
                <Text style={styles.breakdownTotalLabel}>Grand Total</Text>
                <Text style={styles.breakdownTotalValue}>${grandTotal.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          <View style={{ height: 110 }} />
        </Animated.ScrollView>
      ) : (
        // Empty Cart View
        <Animated.View style={[styles.emptyContainer, animatedEmptyStyle]}>
          <ShoppingBagIcon />
          <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
          <Text style={styles.emptySubtitle}>Start adding luxury wellness essentials to your catalog</Text>
          <TouchableOpacity onPress={() => router.replace('/')} activeOpacity={0.8} style={styles.emptyExploreBtn}>
            <LinearGradient colors={['#009688', '#00796B']} style={StyleSheet.absoluteFill} />
            <Text style={styles.emptyExploreText}>START SHOPPING</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* --- STICKY BOTTOM CHECKOUT FOOTER BAR --- */}
      {cartItems.length > 0 && (
        <View style={styles.stickyFooter}>
          <LinearGradient
            colors={['#0F0E0D', '#1A1A1A']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.footerPriceCol}>
            <Text style={styles.footerPriceLabel}>Total Amount</Text>
            <Text style={styles.footerPriceValue}>${grandTotal.toFixed(2)}</Text>
          </View>

          <TouchableOpacity onPress={() => router.push('/checkout')} activeOpacity={0.85} style={styles.checkoutBtn}>
            <LinearGradient colors={['#009688', '#00796B']} style={StyleSheet.absoluteFill} />
            {/* Animated Shine sweep */}
            <Animated.View style={[styles.checkoutShine, animatedCheckoutStyle]}>
              <LinearGradient
                colors={['rgba(255,255,255,0)', 'rgba(0,0,0,0.35)', 'rgba(255,255,255,0)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
            <Text style={styles.checkoutBtnText}>PROCEED TO CHECKOUT</Text>
          </TouchableOpacity>
        </View>
      )}
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
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '300',
    color: '#1A1A1A',
    letterSpacing: 3,
  },
  clearAllBtn: {
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  clearAllText: {
    fontSize: 11,
    color: '#009688',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 20,
  },
  itemsListContainer: {
    gap: 16,
  },
  cartCard: {
    height: 100,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.1)',
    backgroundColor: 'rgba(23, 23, 23, 0.8)',
    overflow: 'hidden',
    flexDirection: 'row',
    padding: 12,
    gap: 14,
  },
  cardImage: {
    width: 72,
    height: '100%',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cardImageText: {
    fontSize: 10,
    fontWeight: '200',
    color: 'rgba(255, 255, 255, 0.25)',
    letterSpacing: 1.5,
  },
  cardDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  cardBrand: {
    fontSize: 8,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.35)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  cardName: {
    fontSize: 13,
    color: '#1A1A1A',
    fontWeight: '400',
  },
  trashBtn: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#80CBC4',
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,150,136,0.12)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  qtyBtn: {
    width: 28,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#80CBC4',
    borderRadius: 6,
  },
  qtyText: {
    color: '#1A1A1A',
    fontSize: 12,
    fontWeight: '600',
    width: 28,
    textAlign: 'center',
  },
  deliveryCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    padding: 16,
    overflow: 'hidden',
    gap: 4,
    backgroundColor: 'rgba(212, 175, 55, 0.03)',
  },
  deliveryTitle: {
    fontSize: 8,
    fontWeight: '700',
    color: '#80CBC4',
    letterSpacing: 1.5,
  },
  deliveryValue: {
    fontSize: 13,
    color: '#1A1A1A',
    fontWeight: '300',
  },
  promoSection: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '400',
    color: '#1A1A1A',
    letterSpacing: 1.5,
  },
  promoInputRow: {
    flexDirection: 'row',
    gap: 10,
    height: 46,
  },
  promoInputBox: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,150,136,0.10)',
    backgroundColor: 'rgba(0,150,136,0.05)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  promoInput: {
    color: '#1A1A1A',
    fontSize: 13,
  },
  promoApplyBtn: {
    width: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  promoApplyText: {
    color: '#1A1A1A',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  promoSuccessBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#34A853',
    backgroundColor: 'rgba(52, 168, 83, 0.05)',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  promoSuccessTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34A853',
  },
  promoSuccessSubtitle: {
    fontSize: 10,
    color: 'rgba(0,0,0,0.35)',
    fontWeight: '300',
    marginTop: 2,
  },
  removePromoBtn: {
    paddingHorizontal: 8,
  },
  removePromoText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EA4335',
    letterSpacing: 1,
  },
  promoErrorText: {
    fontSize: 11,
    color: '#EA4335',
    fontWeight: '400',
    marginTop: 2,
  },
  breakdownSection: {
    gap: 10,
  },
  breakdownBox: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,150,136,0.08)',
    padding: 18,
    gap: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(23, 23, 23, 0.5)',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '300',
  },
  breakdownValue: {
    fontSize: 12,
    color: '#1A1A1A',
    fontWeight: '400',
  },
  freeShippingText: {
    color: '#34A853',
    fontWeight: '500',
  },
  slashedShippingText: {
    color: 'rgba(255,255,255,0.3)',
    textDecorationLine: 'line-through',
    fontWeight: '300',
  },
  promoDiscountLabel: {
    fontSize: 12,
    color: '#34A853',
    fontWeight: '300',
  },
  promoDiscountValue: {
    fontSize: 12,
    color: '#34A853',
    fontWeight: '600',
  },
  breakdownTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderColor: 'rgba(0,150,136,0.10)',
    paddingTop: 12,
    marginTop: 4,
  },
  breakdownTotalLabel: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '400',
  },
  breakdownTotalValue: {
    fontSize: 20,
    color: '#009688',
    fontWeight: '600',
  },

  // --- EMPTY CART VIEW ---
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '300',
    color: '#1A1A1A',
    letterSpacing: 2,
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '300',
  },
  emptyExploreBtn: {
    height: 48,
    width: '70%',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginTop: 16,
  },
  emptyExploreText: {
    color: '#1A1A1A',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  // --- STICKY FOOTER ---
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 95,
    borderTopWidth: 0.5,
    borderColor: 'rgba(212, 175, 55, 0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  footerPriceCol: {
    gap: 4,
  },
  footerPriceLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '300',
  },
  footerPriceValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#009688',
  },
  checkoutBtn: {
    flex: 1,
    height: 46,
    marginLeft: 20,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  checkoutShine: {
    ...StyleSheet.absoluteFill,
    width: '80%',
  },
  checkoutBtnText: {
    color: '#1A1A1A',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
