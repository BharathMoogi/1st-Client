import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions, Modal } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
  withRepeat,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { auth, db } from '../api/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import Svg, { Path, Circle, Rect, G, Line } from 'react-native-svg';
import { Platform } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- VECTOR ICONS FOR PROFILE ---
const ChevronLeftIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D89A7C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="m15 18-6-6 6-6" />
  </Svg>
);

const ChevronRightIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="m9 18 6-6-6-6" />
  </Svg>
);

const PackageIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D89A7C" strokeWidth="2">
    <Path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <Path d="M3.27 6.96 12 12.01l8.73-5.05" />
    <Path d="M12 22.08V12" />
  </Svg>
);

const HeartIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D89A7C" strokeWidth="2">
    <Path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </Svg>
);

const BellIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D89A7C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <Path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </Svg>
);

const AwardIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D89A7C" strokeWidth="2">
    <Circle cx="12" cy="8" r="6" />
    <Path d="M15.47 14L19 22l-7-3-7 3 3.53-8" />
  </Svg>
);

const TagIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D89A7C" strokeWidth="2">
    <Path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" stroke="#D89A7C" strokeWidth="2" />
  </Svg>
);

const PinIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D89A7C" strokeWidth="2">
    <Path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <Circle cx="12" cy="10" r="3" />
  </Svg>
);

const HelpIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D89A7C" strokeWidth="2">
    <Circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <Line x1="12" y1="17" x2="12.01" y2="17" stroke="#D89A7C" strokeWidth="2" />
  </Svg>
);

const SettingsIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D89A7C" strokeWidth="2">
    <Circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </Svg>
);

const LogoutIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EA4335" strokeWidth="2">
    <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </Svg>
);

export default function ProfileScreen() {
  const router = useRouter();

  const [userData, setUserData] = useState<{
    fullName: string;
    email: string;
    phone: string;
  } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const unsub = onAuthStateChanged(auth, async (user) => {
        if (!user) {
          setTimeout(() => {
            router.replace('/?triggerAuth=true');
          }, 100);
          return;
        }

        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData({
              fullName: data.fullName || user.displayName || 'Elixir Member',
              email: data.email || user.email || '',
              phone: data.phone || user.phoneNumber || ''
            });
          } else {
            setUserData({
              fullName: user.displayName || 'Elixir Member',
              email: user.email || '',
              phone: user.phoneNumber || ''
            });
          }
        } catch (e) {
          setUserData({
            fullName: user.displayName || 'Elixir Member',
            email: user.email || '',
            phone: user.phoneNumber || ''
          });
        }
      });
      return unsub;
    };
    let unsubPromise = checkAuth();
    return () => {
      unsubPromise.then(unsub => unsub());
    };
  }, []);

  // Modals state
  const [modalType, setModalType] = useState<'rewards' | 'coupons' | 'address' | 'help' | null>(null);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  // Animation breathing VIP badge
  const vipScale = useSharedValue(1);

  useEffect(() => {
    vipScale.value = withRepeat(
      withTiming(1.08, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, []);

  const handleLogout = async () => {
    setLogoutConfirmOpen(false);
    const user = auth.currentUser;
    if (user && Platform.OS === 'web') {
      localStorage.removeItem(`phone_verified_${user.uid}`);
    }
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
    router.replace('/');
  };

  // Reanimated style bindings
  const animatedVipStyle = useAnimatedStyle(() => ({
    transform: [{ scale: vipScale.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Background Gradients */}
      <LinearGradient
        colors={['#FFF8F7', '#FFFFFF', '#FFF8F7']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* --- TOP HEADER APP BAR --- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.headerBtn}>
          <ChevronLeftIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PROFILE</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* --- USER IDENTITY HEADER --- */}
        <View style={styles.profileHeaderSection}>
          {/* Glowing Monogram Avatar */}
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarBorderGlow} />
            <LinearGradient colors={['#A85D63', '#8B4A50']} style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userData?.fullName
                  ? userData.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                  : 'EX'}
              </Text>
            </LinearGradient>
          </View>

          <Text style={styles.userNameText}>{userData ? userData.fullName : 'Loading...'}</Text>
          <Text style={styles.userEmailText}>{userData ? userData.email : ''}</Text>
          {userData?.phone ? (
            <Text style={styles.userPhoneText}>{userData.phone}</Text>
          ) : null}

          <Animated.View style={[styles.vipBadge, animatedVipStyle]}>
            <LinearGradient colors={['#A85D63', '#8B4A50']} style={StyleSheet.absoluteFill} />
            <Text style={styles.vipBadgeText}>VIP GOLD CLUB</Text>
          </Animated.View>
        </View>

        {/* --- REWARDS STATUS CARD --- */}
        <TouchableOpacity onPress={() => router.push('/rewards')} style={styles.rewardsCard} activeOpacity={0.9}>
          <LinearGradient
            colors={['rgba(168, 93, 99,0.05)', 'rgba(255,255,255,0.01)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.rewardsTopRow}>
            <Text style={styles.rewardsPointsLabel}>Rewards Balance</Text>
            <Text style={styles.rewardsPointsValue}>2,450 Points</Text>
          </View>
          <View style={styles.progressBarWrapper}>
            <View style={styles.progressBarBackground} />
            <View style={[styles.progressBarActive, { width: '75%' }]} />
          </View>
          <Text style={styles.rewardsBottomText}>75% progress to Platinum Club tier</Text>
        </TouchableOpacity>

        {/* --- INTERACTIVE PROFILE MENU ITEMS --- */}
        <View style={styles.menuContainer}>
          {/* Navigation Links */}
          <TouchableOpacity onPress={() => router.push('/orders')} activeOpacity={0.8} style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <PackageIcon />
              <Text style={styles.menuItemText}>My Orders</Text>
            </View>
            <ChevronRightIcon />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/wishlist')} activeOpacity={0.8} style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <HeartIcon />
              <Text style={styles.menuItemText}>My Wishlist</Text>
            </View>
            <ChevronRightIcon />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/notifications')} activeOpacity={0.8} style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <BellIcon />
              <Text style={styles.menuItemText}>Notification Center</Text>
            </View>
            <ChevronRightIcon />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/rewards')} activeOpacity={0.8} style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <AwardIcon />
              <Text style={styles.menuItemText}>Rewards & Bonuses</Text>
            </View>
            <ChevronRightIcon />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/coupons')} activeOpacity={0.8} style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <TagIcon />
              <Text style={styles.menuItemText}>Active Coupons</Text>
            </View>
            <ChevronRightIcon />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setModalType('address')} activeOpacity={0.8} style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <PinIcon />
              <Text style={styles.menuItemText}>Saved Addresses</Text>
            </View>
            <ChevronRightIcon />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setModalType('help')} activeOpacity={0.8} style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <HelpIcon />
              <Text style={styles.menuItemText}>Help & Support</Text>
            </View>
            <ChevronRightIcon />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/settings')} activeOpacity={0.8} style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <SettingsIcon />
              <Text style={styles.menuItemText}>Settings & Privacy</Text>
            </View>
            <ChevronRightIcon />
          </TouchableOpacity>

          {/* Logout button */}
          <TouchableOpacity onPress={() => setLogoutConfirmOpen(true)} activeOpacity={0.8} style={[styles.menuItem, { marginTop: 24, borderBottomWidth: 0 }]}>
            <View style={styles.menuItemLeft}>
              <LogoutIcon />
              <Text style={[styles.menuItemText, { color: '#EA4335', fontWeight: '600' }]}>Logout Profile</Text>
            </View>
            <ChevronRightIcon />
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* --- INFO DIALOGS MODALS (Rewards / Coupons / Addresses / Help) --- */}
      <Modal visible={modalType !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity onPress={() => setModalType(null)} activeOpacity={1} style={styles.modalBacking} />
          
          <View style={styles.modalBox}>
            <LinearGradient colors={['#FFFFFF', '#FFF8F7']} style={StyleSheet.absoluteFill} />
            
            {modalType === 'rewards' && (
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Gold Club Rewards</Text>
                <Text style={styles.modalBodyText}>
                  Earn 10 points for every $1 spent. Points can be redeemed for cash discounts at checkout or exclusive Aurum shaker merch.
                </Text>
              </View>
            )}

            {modalType === 'coupons' && (
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>VIP Coupon Codes</Text>
                <View style={styles.couponBadge}>
                  <Text style={styles.couponCodeText}>AURUM20</Text>
                </View>
                <Text style={styles.modalBodyText}>
                  Use code AURUM20 to receive 20% off all whey protein products. Code is valid until Dec 31, 2026.
                </Text>
              </View>
            )}

            {modalType === 'address' && (
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Saved Addresses</Text>
                <Text style={styles.addressListTitle}>Home:</Text>
                <Text style={styles.addressListText}>Flat 302, Golden Heights, Bandra West, Mumbai 400050.</Text>
                <Text style={styles.addressListTitle}>Office:</Text>
                <Text style={styles.addressListText}>Aurum Corporate Hub BKC, Bandra East, Mumbai 400051.</Text>
              </View>
            )}

            {modalType === 'help' && (
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Support Center</Text>
                <Text style={styles.modalBodyText}>
                  Our concierge wellness desk is active 24/7.{"\n\n"}
                  Email: vip.care@aurumwellness.com{"\n"}
                  Phone: +1 (800) 555-GOLD
                </Text>
              </View>
            )}

            <TouchableOpacity onPress={() => setModalType(null)} activeOpacity={0.8} style={styles.modalCloseBtn}>
              <Text style={styles.modalCloseBtnText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- LOGOUT CONFIRMATION DRAWER --- */}
      {logoutConfirmOpen && (
        <View style={styles.logoutOverlay}>
          <TouchableOpacity onPress={() => setLogoutConfirmOpen(false)} activeOpacity={1} style={styles.logoutBacking} />
          <View style={styles.logoutDrawer}>
            <LinearGradient colors={['#FFFFFF', '#FFF8F7']} style={StyleSheet.absoluteFill} />
            <Text style={styles.logoutTitle}>Logout Profile?</Text>
            <Text style={styles.logoutSubtitle}>You will need to re-authenticate using your login credentials.</Text>
            
            <View style={styles.logoutBtnRow}>
              <TouchableOpacity onPress={() => setLogoutConfirmOpen(false)} activeOpacity={0.8} style={styles.logoutCancelBtn}>
                <Text style={styles.logoutCancelText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogout} activeOpacity={0.85} style={styles.logoutConfirmBtn}>
                <LinearGradient colors={['#EA4335', '#C53030']} style={StyleSheet.absoluteFill} />
                <Text style={styles.logoutConfirmText}>LOGOUT</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
    fontSize: 15,
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
  
  // Profile Header Avatar
  profileHeaderSection: {
    alignItems: 'center',
    gap: 8,
    marginVertical: 12,
  },
  avatarWrapper: {
    width: 80,
    height: 80,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBorderGlow: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1.5,
    borderColor: '#A85D63',
    opacity: 0.25,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#A85D63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  avatarText: {
    color: '#2B2B2B',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 1,
  },
  userNameText: {
    fontSize: 20,
    color: '#2B2B2B',
    fontWeight: '400',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  userEmailText: {
    fontSize: 12,
    color: '#6E6E6E',
    fontWeight: '300',
  },
  userPhoneText: {
    fontSize: 12,
    color: '#A85D63',
    fontWeight: '400',
    marginTop: 2,
    letterSpacing: 0.3,
  },
  vipBadge: {
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginTop: 6,
  },
  vipBadgeText: {
    color: '#2B2B2B',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  // Rewards card
  rewardsCard: {
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(168, 93, 99,0.10)',
    padding: 16,
    overflow: 'hidden',
    gap: 12,
  },
  rewardsTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardsPointsLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '300',
  },
  rewardsPointsValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A85D63',
  },
  progressBarWrapper: {
    height: 6,
    position: 'relative',
    justifyContent: 'center',
  },
  progressBarBackground: {
    height: '100%',
    backgroundColor: 'rgba(168, 93, 99,0.10)',
    borderRadius: 3,
    width: '100%',
  },
  progressBarActive: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#A85D63',
    borderRadius: 3,
  },
  rewardsBottomText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.35)',
    fontWeight: '300',
  },

  // Menu items list
  menuContainer: {
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: 'rgba(168, 93, 99,0.10)',
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 52,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(168, 93, 99,0.08)',
    paddingHorizontal: 12,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 13,
    color: '#2B2B2B',
    fontWeight: '300',
  },
  
  // Settings toggle
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  settingsHeaderText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 1.5,
  },
  settingToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 12,
  },
  settingToggleText: {
    fontSize: 13,
    color: '#2B2B2B',
    fontWeight: '300',
  },

  // Modal dialog
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
  },
  modalBacking: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalBox: {
    width: SCREEN_WIDTH - 64,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(224,176,52,0.25)',
    padding: 24,
    alignItems: 'center',
    overflow: 'hidden',
    gap: 16,
  },
  modalContent: {
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#A85D63',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  modalBodyText: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.6)',
    lineHeight: 18,
    textAlign: 'center',
    fontWeight: '300',
  },
  couponBadge: {
    borderWidth: 1.5,
    borderColor: '#34A853',
    backgroundColor: 'rgba(52, 168, 83, 0.08)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  couponCodeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#34A853',
    letterSpacing: 1,
  },
  addressListTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A85D63',
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  addressListText: {
    fontSize: 11,
    color: '#6E6E6E',
    alignSelf: 'flex-start',
    fontWeight: '300',
    lineHeight: 16,
  },
  modalCloseBtn: {
    width: '100%',
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2B2B2B',
    letterSpacing: 1,
  },

  // Logout confirm Drawer
  logoutOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 99999,
  },
  logoutBacking: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  logoutDrawer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 220,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(234, 67, 53, 0.25)',
    padding: 24,
    overflow: 'hidden',
    gap: 12,
  },
  logoutTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#2B2B2B',
  },
  logoutSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '300',
    lineHeight: 18,
  },
  logoutBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  logoutCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutCancelText: {
    color: '#2B2B2B',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  logoutConfirmBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logoutConfirmText: {
    color: '#2B2B2B',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
