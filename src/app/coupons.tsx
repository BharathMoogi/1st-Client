import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions, Clipboard } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect, G, Line } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- VECTOR ICONS FOR COUPONS ---
const ChevronLeftIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D89A7C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="m15 18-6-6 6-6" />
  </Svg>
);

const TagIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D89A7C" strokeWidth="2">
    <Path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" fill="rgba(224,176,52,0.06)" />
    <line x1="7" y1="7" x2="7.01" y2="7" stroke="#D89A7C" strokeWidth="3" />
  </Svg>
);

const CopyIcon = () => (
  <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <Path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Svg>
);

const CheckIcon = () => (
  <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34A853" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 6 9 17l-5-5" />
  </Svg>
);

// --- TICKET DOTTED DIVIDER SVG ---
const DottedDivider = () => (
  <Svg width="2" height="72" viewBox="0 0 2 72">
    <Line x1="1" y1="0" x2="1" y2="72" stroke="rgba(255,255,255,0.12)" strokeWidth="2" strokeDasharray="4,6" />
  </Svg>
);

// --- INITIAL MOCK DATA ---
const AVAILABLE_COUPONS = [
  {
    code: 'AURUM20',
    discount: '20% OFF',
    title: 'Protein Pack Special',
    description: 'Save 20% on all Whey Isolate purchases. Min order $50.',
    expiry: 'Expires Dec 31, 2026',
  },
  {
    code: 'GOLDSHAKE',
    discount: 'FREE GIFT',
    title: 'Aurum VIP Shaker',
    description: 'Unlock a free 700ml Tritan leakproof shaker. Min order $100.',
    expiry: 'Expires Nov 30, 2026',
  },
  {
    code: 'VITAFIT',
    discount: '15% OFF',
    title: 'Wellness Essentials',
    description: 'Save 15% on all vitamins and dietary tabs. No minimum.',
    expiry: 'Expires Aug 15, 2026',
  }
];

// --- INDIVIDUAL TICKET CARD COMPONENT (Handles local springs/copy clip status) ---
function CouponCard({
  item,
  onCopy
}: {
  item: typeof AVAILABLE_COUPONS[0];
  onCopy: (code: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const copyScale = useSharedValue(1);

  const handleCopyPress = () => {
    Clipboard.setString(item.code);
    setCopied(true);
    onCopy(item.code);

    // Spring scale pop feedback
    copyScale.value = withSequence(
      withSpring(1.3, { damping: 5 }),
      withSpring(1.0, { damping: 10 })
    );

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: copyScale.value }],
  }));

  return (
    <View style={styles.ticketCard}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Left Stub: Code details */}
      <View style={styles.leftStub}>
        <Text style={styles.discountValueText}>{item.discount}</Text>
        <View style={styles.codeTextBadge}>
          <Text style={styles.codeText}>{item.code}</Text>
        </View>
      </View>

      {/* Dotted Divider line */}
      <DottedDivider />

      {/* Right Stub: Terms details & action */}
      <View style={styles.rightStub}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.couponTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.couponDescription}>{item.description}</Text>
          <Text style={styles.couponExpiry}>{item.expiry}</Text>
        </View>

        {/* Copy trigger stub button */}
        <TouchableOpacity onPress={handleCopyPress} activeOpacity={0.85}>
          <Animated.View style={[styles.copyBtn, animatedButtonStyle]}>
            <LinearGradient colors={['#A85D63', '#8B4A50']} style={StyleSheet.absoluteFill} />
            {copied ? <Text style={styles.copyBtnText}>COPIED!</Text> : (
              <View style={styles.copyBtnInner}>
                <CopyIcon />
                <Text style={styles.copyBtnText}>COPY</Text>
              </View>
            )}
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Left & Right ticket border cutouts */}
      <View style={styles.cutoutLeft} />
      <View style={styles.cutoutRight} />
    </View>
  );
}

// --- MAIN COUPONS SCREEN ---
export default function CouponsScreen() {
  const router = useRouter();

  // Active coupon feedback state
  const [activeCoupon, setActiveCoupon] = useState<string | null>('AURUM20');

  // Mount animations
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-14);
  const scrollOpacity = useSharedValue(0);
  const scrollTranslateY = useSharedValue(24);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 500 });
    headerTranslateY.value = withSpring(0, { damping: 16, stiffness: 100 });
    scrollOpacity.value = withDelay(160, withTiming(1, { duration: 500 }));
    scrollTranslateY.value = withDelay(160, withSpring(0, { damping: 14, stiffness: 90 }));
  }, []);

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const animatedScrollStyle = useAnimatedStyle(() => ({
    opacity: scrollOpacity.value,
    transform: [{ translateY: scrollTranslateY.value }],
  }));

  const handleCopySuccess = (code: string) => {
    // Automatically apply coupon code as active if copied
    setActiveCoupon(code);
  };

  return (
    <View style={styles.container}>
      {/* Background Gradients */}
      <LinearGradient
        colors={['#FFF8F7', '#FFFFFF', '#FFF8F7']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* --- TOP HEADER APP BAR --- */}
      <Animated.View style={animatedHeaderStyle}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.headerBtn}>
            <ChevronLeftIcon />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>VIP COUPONS</Text>
          <View style={{ width: 36 }} />
        </View>
      </Animated.View>

      <Animated.ScrollView style={[styles.scrollContainer, animatedScrollStyle]} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* --- APPLIED COUPON SUMMARY CARD --- */}
        {activeCoupon && (
          <View style={styles.appliedSection}>
            <Text style={styles.sectionHeaderTitle}>CURRENTLY APPLIED</Text>
            <View style={styles.appliedCard}>
              <LinearGradient
                colors={['rgba(52, 168, 83, 0.12)', 'rgba(52, 168, 83, 0.02)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.appliedHeaderRow}>
                <View style={styles.appliedHeaderLeft}>
                  <CheckIcon />
                  <Text style={styles.appliedTitle}>Code "{activeCoupon}" Active</Text>
                </View>
                <TouchableOpacity onPress={() => setActiveCoupon(null)} activeOpacity={0.7} style={styles.removeBtn}>
                  <Text style={styles.removeText}>REMOVE</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.appliedDetails}>
                You will receive a 20% discount on all Whey Isolate purchases at Checkout.
              </Text>
            </View>
          </View>
        )}

        {/* --- LIST OF AVAILABLE COUPON TICKETS --- */}
        <Text style={styles.sectionHeaderTitle}>AVAILABLE VIP COUPONS</Text>
        <View style={styles.couponsFeed}>
          {AVAILABLE_COUPONS.map((coupon) => (
            <CouponCard
              key={coupon.code}
              item={coupon}
              onCopy={handleCopySuccess}
            />
          ))}
        </View>

        <View style={{ height: 60 }} />
      </Animated.ScrollView>
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
    borderColor: 'rgba(168, 93, 99,0.08)',
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 20,
  },
  sectionHeaderTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 1.5,
    marginBottom: 10,
    marginLeft: 6,
  },

  // Applied Coupon section
  appliedSection: {
    gap: 8,
  },
  appliedCard: {
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(52, 168, 83, 0.25)',
    padding: 16,
    overflow: 'hidden',
    gap: 6,
  },
  appliedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appliedHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appliedTitle: {
    fontSize: 13,
    color: '#34A853',
    fontWeight: '600',
  },
  removeBtn: {
    paddingHorizontal: 6,
  },
  removeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EA4335',
    letterSpacing: 0.5,
  },
  appliedDetails: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
    lineHeight: 16,
    fontWeight: '300',
  },

  // Available coupons feed
  couponsFeed: {
    gap: 16,
  },
  ticketCard: {
    height: 110,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(168, 93, 99,0.10)',
    backgroundColor: 'rgba(255,255,255,0.01)',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    position: 'relative',
  },
  leftStub: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginRight: 12,
  },
  discountValueText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#A85D63',
    letterSpacing: 0.5,
  },
  codeTextBadge: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(168, 93, 99,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  codeText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#2B2B2B',
    letterSpacing: 0.5,
  },
  rightStub: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 12,
  },
  couponTitle: {
    fontSize: 13,
    color: '#2B2B2B',
    fontWeight: '500',
  },
  couponDescription: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.45)',
    lineHeight: 14,
    fontWeight: '300',
  },
  couponExpiry: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.3)',
    fontWeight: '300',
  },
  copyBtn: {
    width: 56,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  copyBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  copyBtnText: {
    color: '#2B2B2B',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Ticket edge cutouts
  cutoutLeft: {
    position: 'absolute',
    left: -8,
    top: 51,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: 'rgba(168, 93, 99,0.10)',
  },
  cutoutRight: {
    position: 'absolute',
    right: -8,
    top: 51,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: 'rgba(168, 93, 99,0.10)',
  },
});
