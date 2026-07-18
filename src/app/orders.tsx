import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect, G, Line } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- VECTOR ICONS FOR ORDERS ---
const ChevronLeftIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFE082" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="m15 18-6-6 6-6" />
  </Svg>
);

const PackageIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFE082" strokeWidth="2">
    <Path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <Line x1="12" y1="22.08" x2="12" y2="12" />
  </Svg>
);

const CheckIcon = ({ color = '#FFE082' }: { color?: string }) => (
  <Svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 6 9 17l-5-5" />
  </Svg>
);

// --- INITIAL MOCK DATA ---
const UPCOMING_ORDERS_MOCK = [
  {
    id: 'AW-98315',
    itemName: 'Gold Standard Whey Isolate (1kg)',
    price: '$69.00',
    status: 'Shipped',
    date: 'Ordered July 18, 2026',
    stage: 3, // Ordered (1) -> Packed (2) -> Shipped (3) -> Out (4) -> Del (5)
  }
];

const DELIVERED_ORDERS_MOCK = [
  {
    id: 'AW-97521',
    itemName: 'Micronized Creatine Powder (300g)',
    price: '$32.00',
    status: 'Delivered',
    date: 'Delivered July 10, 2026',
    returnStatus: null as string | null, // "Initiated" if user submits return
  }
];

const CANCELLED_ORDERS_MOCK = [
  {
    id: 'AW-96102',
    itemName: 'Essential Multivitamins (90 Tabs)',
    price: '$24.00',
    status: 'Cancelled',
    date: 'Cancelled July 2, 2026',
    refundStatus: 'Refund Processed',
  }
];

export default function OrdersScreen() {
  const router = useRouter();

  // Active Category tab
  const [activeTab, setActiveTab] = useState<'upcoming' | 'delivered' | 'cancelled'>('upcoming');

  // Interactive panels toggling
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnSuccess, setReturnSuccess] = useState(false);
  
  // Return Form inputs
  const [returnReason, setReturnReason] = useState<string | null>(null);
  const [returnComment, setReturnComment] = useState('');

  // Delivered items status mock controller
  const [deliveredList, setDeliveredList] = useState(DELIVERED_ORDERS_MOCK);

  // Stepper tracking animations
  const trackingProgressHeight = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.8);

  useEffect(() => {
    if (trackingOpen) {
      // Animate timeline vertical height fill (60% up to Shipped)
      trackingProgressHeight.value = withTiming(0.5, { duration: 800 });
      // Pulse animation loop at current status marker
      pulseScale.value = withRepeat(
        withTiming(2.0, { duration: 1000 }),
        -1,
        false
      );
      pulseOpacity.value = withRepeat(
        withTiming(0, { duration: 1000 }),
        -1,
        false
      );
    } else {
      trackingProgressHeight.value = 0;
      pulseScale.value = 1;
      pulseOpacity.value = 0;
    }
  }, [trackingOpen]);

  const handleReturnSubmit = () => {
    if (!returnReason) return;
    
    // Update state to register return status
    setDeliveredList((prev) =>
      prev.map((item) => ({ ...item, returnStatus: 'Return Initiated' }))
    );
    setReturnSuccess(true);

    setTimeout(() => {
      setReturnSuccess(false);
      setReturnModalOpen(false);
      clearReturnForm();
    }, 2000);
  };

  const clearReturnForm = () => {
    setReturnReason(null);
    setReturnComment('');
  };

  // Reanimated style bindings
  const animatedTimelineLineStyle = useAnimatedStyle(() => ({
    height: `${trackingProgressHeight.value * 100}%`,
  }));

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Background Gradients */}
      <LinearGradient
        colors={['#070707', '#131110', '#070707']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* --- TOP HEADER APP BAR --- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.backButton}>
          <ChevronLeftIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MY ORDERS</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* --- TAB SELECTOR --- */}
      <View style={styles.tabSelectorRow}>
        {(['upcoming', 'delivered', 'cancelled'] as const).map((tab) => {
          const active = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabItem, active ? styles.tabItemActive : null]}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, active ? styles.tabTextActive : null]}>{tab.toUpperCase()}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* --- LIST FEED VIEW --- */}
      <ScrollView style={styles.feedScroll} contentContainerStyle={styles.feedContent} showsVerticalScrollIndicator={false}>
        
        {/* UPCOMING ORDERS TAB */}
        {activeTab === 'upcoming' && (
          <View style={styles.tabContainer}>
            {UPCOMING_ORDERS_MOCK.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <PackageIcon />
                    <View>
                      <Text style={styles.cardOrderId}>Order ID: {order.id}</Text>
                      <Text style={styles.cardOrderDate}>{order.date}</Text>
                    </View>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>{order.status.toUpperCase()}</Text>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.cardItemName}>{order.itemName}</Text>
                  <Text style={styles.cardPriceText}>{order.price}</Text>
                </View>

                <TouchableOpacity
                  onPress={() => setTrackingOpen(!trackingOpen)}
                  activeOpacity={0.8}
                  style={styles.actionBtn}
                >
                  <Text style={styles.actionBtnText}>{trackingOpen ? 'HIDE TRACKING' : 'TRACK ORDER'}</Text>
                </TouchableOpacity>

                {/* ANIMATED TIMELINE VERTICAL TRACKER */}
                {trackingOpen && (
                  <View style={styles.timelineWrapper}>
                    <View style={styles.timelineLineBackground} />
                    <Animated.View style={[styles.timelineLineActive, animatedTimelineLineStyle]} />

                    {/* Step Stages */}
                    <View style={styles.timelineStagesColumn}>
                      {/* Stage 1: Ordered */}
                      <View style={styles.timelineStageRow}>
                        <View style={styles.stagePointCompleted}>
                          <CheckIcon color="#050505" />
                        </View>
                        <View style={styles.stageInfo}>
                          <Text style={styles.stageTitleCompleted}>Order Placed</Text>
                          <Text style={styles.stageDate}>July 18, 10:15 AM</Text>
                        </View>
                      </View>

                      {/* Stage 2: Packed */}
                      <View style={styles.timelineStageRow}>
                        <View style={styles.stagePointCompleted}>
                          <CheckIcon color="#050505" />
                        </View>
                        <View style={styles.stageInfo}>
                          <Text style={styles.stageTitleCompleted}>Packed & Confirmed</Text>
                          <Text style={styles.stageDate}>July 18, 02:40 PM</Text>
                        </View>
                      </View>

                      {/* Stage 3: Shipped (CURRENT ACTIVE STAGE with pulsing ring) */}
                      <View style={styles.timelineStageRow}>
                        <View style={styles.stagePointActive}>
                          <Animated.View style={[styles.pulseRing, animatedPulseStyle]} />
                          <View style={styles.activeDotInner} />
                        </View>
                        <View style={styles.stageInfo}>
                          <Text style={styles.stageTitleActive}>Shipped (In-Transit)</Text>
                          <Text style={styles.stageDate}>July 19, 08:30 AM</Text>
                        </View>
                      </View>

                      {/* Stage 4: Out for Delivery */}
                      <View style={styles.timelineStageRow}>
                        <View style={styles.stagePointPending} />
                        <View style={styles.stageInfo}>
                          <Text style={styles.stageTitlePending}>Out for Delivery</Text>
                          <Text style={styles.stageDate}>Estimated July 21</Text>
                        </View>
                      </View>

                      {/* Stage 5: Delivered */}
                      <View style={styles.timelineStageRow}>
                        <View style={styles.stagePointPending} />
                        <View style={styles.stageInfo}>
                          <Text style={styles.stageTitlePending}>Delivered</Text>
                          <Text style={styles.stageDate}>Estimated July 22</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* DELIVERED ORDERS TAB */}
        {activeTab === 'delivered' && (
          <View style={styles.tabContainer}>
            {deliveredList.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <PackageIcon />
                    <View>
                      <Text style={styles.cardOrderId}>Order ID: {order.id}</Text>
                      <Text style={styles.cardOrderDate}>{order.date}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: 'rgba(52, 168, 83, 0.12)', borderColor: 'rgba(52, 168, 83, 0.3)' }]}>
                    <Text style={[styles.statusBadgeText, { color: '#34A853' }]}>DELIVERED</Text>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.cardItemName}>{order.itemName}</Text>
                  <Text style={styles.cardPriceText}>{order.price}</Text>
                </View>

                {order.returnStatus ? (
                  <View style={styles.returnInitiatedBox}>
                    <Text style={styles.returnInitiatedText}>Return Initiated ({order.returnStatus})</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => setReturnModalOpen(true)}
                    activeOpacity={0.8}
                    style={[styles.actionBtn, { borderColor: '#EA4335' }]}
                  >
                    <Text style={[styles.actionBtnText, { color: '#EA4335' }]}>RETURN PRODUCT</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {/* CANCELLED ORDERS TAB */}
        {activeTab === 'cancelled' && (
          <View style={styles.tabContainer}>
            {CANCELLED_ORDERS_MOCK.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <PackageIcon />
                    <View>
                      <Text style={styles.cardOrderId}>Order ID: {order.id}</Text>
                      <Text style={styles.cardOrderDate}>{order.date}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: 'rgba(234, 67, 53, 0.12)', borderColor: 'rgba(234, 67, 53, 0.3)' }]}>
                    <Text style={[styles.statusBadgeText, { color: '#EA4335' }]}>CANCELLED</Text>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.cardItemName}>{order.itemName}</Text>
                  <Text style={styles.cardPriceText}>{order.price}</Text>
                </View>

                <View style={styles.refundTrackerBadge}>
                  <Text style={styles.refundTrackerText}>{order.refundStatus.toUpperCase()}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* --- RETURN PRODUCT OVERLAY MODAL --- */}
      {returnModalOpen && (
        <View style={styles.returnOverlay}>
          <TouchableOpacity onPress={() => setReturnModalOpen(false)} activeOpacity={1} style={styles.returnBacking} />
          <View style={styles.returnDrawer}>
            <LinearGradient
              colors={['#0F0E0D', '#070707']}
              style={StyleSheet.absoluteFill}
            />

            {returnSuccess ? (
              <View style={styles.returnSuccessContent}>
                <Text style={styles.successEmoji}>✔</Text>
                <Text style={styles.returnSuccessTitle}>Return Registered</Text>
                <Text style={styles.returnSuccessSubtitle}>Pickup will be scheduled within 24-48 hours</Text>
              </View>
            ) : (
              <View style={styles.returnFormContent}>
                <Text style={styles.returnDrawerTitle}>Return Supplement</Text>
                <Text style={styles.returnDrawerSubtitle}>Please state the return reason for approval verification</Text>

                {/* Reason choices */}
                <View style={styles.reasonBadgeContainer}>
                  {['Damaged Seal', 'Expired Product', 'Wrong Item Received'].map((reason) => {
                    const active = returnReason === reason;
                    return (
                      <TouchableOpacity
                        key={reason}
                        onPress={() => setReturnReason(reason)}
                        activeOpacity={0.8}
                        style={[styles.reasonBadge, active ? styles.reasonBadgeActive : null]}
                      >
                        <Text style={[styles.reasonBadgeText, active ? styles.reasonBadgeTextActive : null]}>{reason}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Comments box */}
                <TextInput
                  placeholder="Tell us more about the issues..."
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={returnComment}
                  onChangeText={setReturnComment}
                  multiline
                  style={styles.returnCommentsInput}
                />

                {/* Submit button */}
                <TouchableOpacity onPress={handleReturnSubmit} activeOpacity={0.85} style={styles.returnSubmitBtn}>
                  <LinearGradient colors={['#E0B034', '#C08A18']} style={StyleSheet.absoluteFill} />
                  <Text style={styles.returnSubmitBtnText}>CONFIRM RETURN REQUEST</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
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
  backButton: {
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
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  tabSelectorRow: {
    flexDirection: 'row',
    height: 42,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderColor: 'transparent',
  },
  tabItemActive: {
    borderColor: '#E0B034',
  },
  tabText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
  },
  tabTextActive: {
    color: '#FFE082',
  },
  feedScroll: {
    flex: 1,
  },
  feedContent: {
    padding: 20,
  },
  tabContainer: {
    gap: 16,
  },
  orderCard: {
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.01)',
    overflow: 'hidden',
    padding: 16,
    gap: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardOrderId: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  cardOrderDate: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '300',
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: 'rgba(224, 176, 52, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(224, 176, 52, 0.3)',
  },
  statusBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#FFE082',
    letterSpacing: 0.5,
  },
  cardBody: {
    gap: 4,
  },
  cardItemName: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '400',
  },
  cardPriceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFE082',
  },
  actionBtn: {
    height: 38,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: '#E0B034',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#FFE082',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  refundTrackerBadge: {
    height: 34,
    borderRadius: 8,
    backgroundColor: 'rgba(52, 168, 83, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(52, 168, 83, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refundTrackerText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#34A853',
    letterSpacing: 0.5,
  },
  returnInitiatedBox: {
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  returnInitiatedText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.5,
  },

  // --- VERTICAL TIMELINE ---
  timelineWrapper: {
    position: 'relative',
    marginTop: 10,
    paddingLeft: 24,
    paddingVertical: 10,
  },
  timelineLineBackground: {
    position: 'absolute',
    left: 7,
    top: 15,
    bottom: 15,
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  timelineLineActive: {
    position: 'absolute',
    left: 7,
    top: 15,
    width: 2,
    backgroundColor: '#E0B034',
  },
  timelineStagesColumn: {
    gap: 24,
  },
  timelineStageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    position: 'relative',
  },
  stagePointCompleted: {
    position: 'absolute',
    left: -24,
    top: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFE082',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stagePointActive: {
    position: 'absolute',
    left: -24,
    top: 2,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E0B034',
    backgroundColor: 'rgba(224, 176, 52, 0.15)',
  },
  activeDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFE082',
    zIndex: 2,
  },
  stagePointPending: {
    position: 'absolute',
    left: -24,
    top: 4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1E1B15',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  stageInfo: {
    gap: 2,
  },
  stageTitleCompleted: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '400',
  },
  stageTitleActive: {
    fontSize: 12,
    color: '#FFE082',
    fontWeight: '600',
  },
  stageTitlePending: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    fontWeight: '300',
  },
  stageDate: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.4)',
  },

  // --- RETURN PRODUCT DRAWER ---
  returnOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 99999,
  },
  returnBacking: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  returnDrawer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 380,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(224, 176, 52, 0.2)',
    overflow: 'hidden',
    padding: 24,
  },
  returnFormContent: {
    gap: 16,
  },
  returnDrawerTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  returnDrawerSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
    lineHeight: 16,
    fontWeight: '300',
  },
  reasonBadgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  reasonBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  reasonBadgeActive: {
    borderColor: '#E0B034',
    backgroundColor: 'rgba(224, 176, 52, 0.08)',
  },
  reasonBadgeText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '400',
  },
  reasonBadgeTextActive: {
    color: '#FFE082',
    fontWeight: '600',
  },
  returnCommentsInput: {
    height: 80,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 12,
    color: '#FFFFFF',
    fontSize: 12,
    textAlignVertical: 'top',
  },
  returnSubmitBtn: {
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  returnSubmitBtnText: {
    color: '#0A0A0A',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  returnSuccessContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  successEmoji: {
    fontSize: 32,
    color: '#FFE082',
  },
  returnSuccessTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  returnSuccessSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
  },
});
