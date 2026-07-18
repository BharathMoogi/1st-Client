import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect, G, Line } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- VECTOR ICONS FOR NOTIFICATIONS ---
const ChevronLeftIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFE082" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="m15 18-6-6 6-6" />
  </Svg>
);

const TrashIcon = () => (
  <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </Svg>
);

const BellIcon = () => (
  <Svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#FFE082" strokeWidth="1.5">
    <Path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" fill="rgba(224,176,52,0.06)" />
    <Path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </Svg>
);

const CloseIcon = () => (
  <Svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 6 6 18M6 6l12 12" />
  </Svg>
);

// --- INITIAL MOCK DATA ---
const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    type: 'orders',
    title: 'Order Dispatched',
    message: 'Your Order #AW-98315 has been shipped. Click here to track your delivery status.',
    time: '2 hours ago',
  },
  {
    id: 'notif-2',
    type: 'offers',
    title: 'VIP Weekend Offer',
    message: 'Flat 20% Off on Gold Standard Isolate! Use promo code AURUM20 at checkout.',
    time: '5 hours ago',
  },
  {
    id: 'notif-3',
    type: 'restocks',
    title: 'Back in Stock Alert',
    message: 'Micronized Creatine Powder (300g) is restocked. Purchase now while stocks last!',
    time: '1 day ago',
  },
  {
    id: 'notif-4',
    type: 'promotions',
    title: 'Platinum Club Tier',
    message: 'Earn 550 more rewards points to upgrade your VIP status to Platinum benefits.',
    time: '2 days ago',
  }
];

// --- INDIVIDUAL NOTIFICATION CARD WITH EXIT ANIMATION ---
function NotificationCard({
  item,
  onDismiss
}: {
  item: typeof INITIAL_NOTIFICATIONS[0];
  onDismiss: (id: string) => void;
}) {
  const cardScale = useSharedValue(1);
  const cardTranslateX = useSharedValue(0);
  const cardOpacity = useSharedValue(1);

  const handleDismissPress = () => {
    cardScale.value = withTiming(0.7, { duration: 250 });
    cardTranslateX.value = withTiming(-SCREEN_WIDTH, { duration: 300 });
    cardOpacity.value = withTiming(0, { duration: 300 }, () => {
      runOnJS(onDismiss)(item.id);
    });
  };

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }, { translateX: cardTranslateX.value }],
    opacity: cardOpacity.value,
  }));

  const getTypeBadgeStyle = () => {
    if (item.type === 'orders') return styles.badgeOrders;
    if (item.type === 'offers') return styles.badgeOffers;
    if (item.type === 'restocks') return styles.badgeRestocks;
    return styles.badgePromotions;
  };

  return (
    <Animated.View style={[styles.card, animatedCardStyle]}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.cardHeaderRow}>
        <View style={getTypeBadgeStyle()}>
          <Text style={styles.badgeText}>{item.type.toUpperCase()}</Text>
        </View>
        <Text style={styles.cardTimeText}>{item.time}</Text>
      </View>

      <View style={styles.cardContentRow}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardMessage}>{item.message}</Text>
        </View>
        
        {/* Dismiss trigger */}
        <TouchableOpacity onPress={handleDismissPress} activeOpacity={0.7} style={styles.dismissBtn}>
          <CloseIcon />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

// --- MAIN NOTIFICATION CENTER ---
export default function NotificationCenterScreen() {
  const router = useRouter();

  // Tab filter states
  const [activeTab, setActiveTab] = useState<'all' | 'orders' | 'offers' | 'restocks'>('all');
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const handleDismiss = (id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  // Filter list data
  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === 'all') return true;
    return item.type === activeTab;
  });

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
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.headerBtn}>
          <ChevronLeftIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>NOTIFICATIONS</Text>
        {filteredNotifications.length > 0 ? (
          <TouchableOpacity onPress={handleClearAll} activeOpacity={0.7} style={styles.clearAllBtn}>
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      {/* --- FILTER TAB ROWS --- */}
      <View style={styles.tabSelectorRow}>
        {(['all', 'orders', 'offers', 'restocks'] as const).map((tab) => {
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

      {/* --- LIST FEED --- */}
      {filteredNotifications.length > 0 ? (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <NotificationCard item={item} onDismiss={handleDismiss} />
          )}
        />
      ) : (
        // Empty State visual
        <View style={styles.emptyContainer}>
          <BellIcon />
          <Text style={styles.emptyTitle}>You're All Caught Up</Text>
          <Text style={styles.emptySubtitle}>No new notifications found in this category.</Text>
          
          <TouchableOpacity onPress={() => router.replace('/')} activeOpacity={0.8} style={styles.exploreBtn}>
            <LinearGradient colors={['#E0B034', '#C08A18']} style={StyleSheet.absoluteFill} />
            <Text style={styles.exploreText}>RETURN TO HOME</Text>
          </TouchableOpacity>
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
    color: '#FFFFFF',
    letterSpacing: 2,
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
    color: '#FFE082',
    fontWeight: '600',
    letterSpacing: 0.5,
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
  listContent: {
    padding: 20,
    gap: 16,
  },
  
  // Card styles
  card: {
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.01)',
    overflow: 'hidden',
    padding: 16,
    gap: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeOrders: {
    backgroundColor: 'rgba(224, 176, 52, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(224, 176, 52, 0.3)',
  },
  badgeOffers: {
    backgroundColor: 'rgba(52, 168, 83, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(52, 168, 83, 0.3)',
  },
  badgeRestocks: {
    backgroundColor: 'rgba(66, 133, 244, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(66, 133, 244, 0.3)',
  },
  badgePromotions: {
    backgroundColor: 'rgba(234, 67, 53, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(234, 67, 53, 0.3)',
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#FFE082',
    letterSpacing: 0.5,
  },
  cardTimeText: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.35)',
    fontWeight: '300',
  },
  cardContentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  cardTitle: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  cardMessage: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    lineHeight: 16,
    fontWeight: '300',
  },
  dismissBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  emptySubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '300',
  },
  exploreBtn: {
    height: 48,
    width: '70%',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginTop: 16,
  },
  exploreText: {
    color: '#0A0A0A',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});
