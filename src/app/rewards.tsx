import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions, Clipboard } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect, G, Line } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- VECTOR ICONS FOR REWARDS ---
const ChevronLeftIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFE082" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="m15 18-6-6 6-6" />
  </Svg>
);

const LockIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Svg>
);

const CheckIcon = () => (
  <Svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 6 9 17l-5-5" />
  </Svg>
);

const CopyIcon = () => (
  <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <Path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Svg>
);

// --- ACHIEVEMENTS LIST ---
const ACHIEVEMENTS = [
  { id: 'ach-1', name: 'Welcome Gift', description: 'Unlock 500 bonus points upon signup', status: 'completed' },
  { id: 'ach-2', name: 'First Order', description: 'Completed first checkout purchase', status: 'completed' },
  { id: 'ach-3', name: 'Streak Buyer', description: 'Ordered supplements 3 months in a row', status: 'completed' },
  { id: 'ach-4', name: 'Platinum Champ', description: 'Reach 3,000 loyalty points', status: 'pending' },
];

export default function RewardsScreen() {
  const router = useRouter();

  // Referral code state
  const [referralCode] = useState('AURUM-VIP-BR98');
  const [copied, setCopied] = useState(false);

  // Reanimated values
  const progressWidth = useSharedValue(0);
  const copyScale = useSharedValue(1);

  // Mount animations
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-14);
  const scrollOpacity = useSharedValue(0);
  const scrollTranslateY = useSharedValue(28);

  useEffect(() => {
    // Animate progress bar fill on page mount (75%)
    progressWidth.value = withTiming(0.75, {
      duration: 1200,
      easing: Easing.out(Easing.quad)
    });
    // Mount entrance
    headerOpacity.value = withTiming(1, { duration: 500 });
    headerTranslateY.value = withSpring(0, { damping: 16, stiffness: 100 });
    scrollOpacity.value = withDelay(160, withTiming(1, { duration: 520 }));
    scrollTranslateY.value = withDelay(160, withSpring(0, { damping: 14, stiffness: 90 }));
  }, []);

  const handleCopyCode = () => {
    Clipboard.setString(referralCode);
    setCopied(true);
    
    // Copy button spring bounce feedback
    copyScale.value = withSequence(
      withSpring(1.3, { damping: 5 }),
      withSpring(1.0, { damping: 10 })
    );

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  // Reanimated style bindings
  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));

  const animatedCopyBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: copyScale.value }],
  }));

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const animatedScrollStyle = useAnimatedStyle(() => ({
    opacity: scrollOpacity.value,
    transform: [{ translateY: scrollTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Background Gradients */}
      <LinearGradient
        colors={['#070707', '#0F0D0A', '#070707']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* --- TOP HEADER APP BAR --- */}
      <Animated.View style={animatedHeaderStyle}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.headerBtn}>
            <ChevronLeftIcon />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>REWARDS & LEVEL</Text>
          <View style={{ width: 36 }} />
        </View>
      </Animated.View>

      <Animated.ScrollView style={[styles.scrollContainer, animatedScrollStyle]} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* --- REWARDS POINTS CARD & PROGRESS BAR --- */}
        <View style={styles.pointsCard}>
          <LinearGradient
            colors={['rgba(224, 176, 52, 0.15)', 'rgba(0, 0, 0, 0.5)']}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.pointsLabel}>REWARDS BALANCE</Text>
          <Text style={styles.pointsValue}>2,450</Text>
          <Text style={styles.pointsSubText}>Points</Text>

          {/* Animated progress bar details */}
          <View style={styles.progressSection}>
            <View style={styles.progressBarWrapper}>
              <View style={styles.progressBarBackground} />
              <Animated.View style={[styles.progressBarActive, animatedProgressStyle]} />
            </View>
            <View style={styles.progressLabelsRow}>
              <Text style={styles.progressLabelLeft}>VIP Gold Club (Active)</Text>
              <Text style={styles.progressLabelRight}>550 pts to Platinum</Text>
            </View>
          </View>
        </View>

        {/* --- MEMBERSHIP LEVELS SECTION --- */}
        <Text style={styles.sectionHeaderTitle}>MEMBERSHIP LEVELS</Text>
        <View style={styles.levelsGroup}>
          {/* Active Level */}
          <View style={[styles.levelRow, styles.levelRowActive]}>
            <LinearGradient
              colors={['rgba(224,176,52,0.08)', 'rgba(224,176,52,0.01)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.levelLeft}>
              <View style={styles.activeLevelCircle}>
                <CheckIcon />
              </View>
              <View>
                <Text style={styles.levelTitleActive}>VIP Gold Club</Text>
                <Text style={styles.levelSubtitle}>1.2x points multiplier + early access products</Text>
              </View>
            </View>
            <Text style={styles.levelStatusTextActive}>ACTIVE</Text>
          </View>

          {/* Locked Level */}
          <View style={styles.levelRow}>
            <LinearGradient
              colors={['rgba(255,255,255,0.01)', 'rgba(255,255,255,0.005)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.levelLeft}>
              <View style={styles.lockedLevelCircle}>
                <LockIcon />
              </View>
              <View>
                <Text style={styles.levelTitlePending}>VIP Platinum Club</Text>
                <Text style={styles.levelSubtitle}>1.5x points multiplier + FREE Priority Shipping</Text>
              </View>
            </View>
            <Text style={styles.levelStatusTextPending}>3,000 PTS</Text>
          </View>
        </View>

        {/* --- ACHIEVEMENTS MILESTONES --- */}
        <Text style={styles.sectionHeaderTitle}>ACHIEVEMENTS</Text>
        <View style={styles.achievementsGrid}>
          {ACHIEVEMENTS.map((ach) => {
            const completed = ach.status === 'completed';
            return (
              <View key={ach.id} style={[styles.achievementCard, !completed ? styles.achievementCardLocked : null]}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.03)', 'rgba(255,255,255,0.01)']}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.achievementHeaderRow}>
                  {completed ? (
                    <View style={styles.achievementCircleCompleted}>
                      <CheckIcon />
                    </View>
                  ) : (
                    <View style={styles.achievementCircleLocked}>
                      <LockIcon />
                    </View>
                  )}
                  <Text style={[styles.achievementStatusText, !completed ? styles.achievementStatusTextLocked : null]}>
                    {completed ? 'COMPLETED' : 'LOCKED'}
                  </Text>
                </View>
                <Text style={[styles.achievementName, !completed ? styles.achievementNameLocked : null]}>{ach.name}</Text>
                <Text style={styles.achievementDescription}>{ach.description}</Text>
              </View>
            );
          })}
        </View>

        {/* --- REFERRAL REWARDS --- */}
        <Text style={styles.sectionHeaderTitle}>REFERRAL PROGRAM</Text>
        <View style={styles.referralCard}>
          <LinearGradient
            colors={['rgba(224, 176, 52, 0.12)', 'rgba(224, 176, 52, 0.02)']}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.referralTitle}>Invite Friends, Earn Gold Points</Text>
          <Text style={styles.referralSubtitle}>
            Share your custom referral code. When they place their first wellness supplement order, they get 10% off and you earn 500 bonus points!
          </Text>

          {/* Copy code input row */}
          <View style={styles.copyCodeRow}>
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{referralCode}</Text>
            </View>
            <TouchableOpacity onPress={handleCopyCode} activeOpacity={0.85}>
              <Animated.View style={[styles.copyBtn, animatedCopyBtnStyle]}>
                <LinearGradient colors={['#D4AF37', '#B8962D']} style={StyleSheet.absoluteFill} />
                {copied ? <Text style={styles.copyBtnText}>COPIED!</Text> : (
                  <View style={styles.copyBtnInner}>
                    <CopyIcon />
                    <Text style={styles.copyBtnText}>COPY</Text>
                  </View>
                )}
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 60 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070707',
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  
  // Points Card
  pointsCard: {
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(224, 176, 52, 0.25)',
    padding: 24,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    gap: 4,
  },
  pointsLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#D4AF37',
    letterSpacing: 2,
  },
  pointsValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 1,
    marginTop: 6,
  },
  pointsSubText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '400',
    letterSpacing: 1.5,
  },
  progressSection: {
    width: '100%',
    gap: 8,
    marginTop: 18,
  },
  progressBarWrapper: {
    height: 8,
    position: 'relative',
    justifyContent: 'center',
  },
  progressBarBackground: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    width: '100%',
  },
  progressBarActive: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 4,
  },
  progressLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabelLeft: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  progressLabelRight: {
    fontSize: 10,
    color: '#D4AF37',
    fontWeight: '600',
  },

  sectionHeaderTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 1.5,
    marginTop: 10,
    marginLeft: 6,
  },

  // Levels list
  levelsGroup: {
    gap: 12,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.01)',
    overflow: 'hidden',
  },
  levelRowActive: {
    borderColor: 'rgba(224, 176, 52, 0.25)',
  },
  levelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  activeLevelCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedLevelCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  levelTitleActive: {
    fontSize: 13,
    color: '#D4AF37',
    fontWeight: '600',
  },
  levelTitlePending: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '400',
  },
  levelSubtitle: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.35)',
    lineHeight: 14,
    fontWeight: '300',
    marginTop: 2,
    paddingRight: 10,
  },
  levelStatusTextActive: {
    fontSize: 9,
    fontWeight: '700',
    color: '#D4AF37',
    letterSpacing: 0.5,
  },
  levelStatusTextPending: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 0.5,
  },

  // Achievements Grid
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  achievementCard: {
    width: (SCREEN_WIDTH - 52) / 2, // 2 column math
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.01)',
    overflow: 'hidden',
    padding: 12,
    gap: 8,
    height: 124,
  },
  achievementCardLocked: {
    borderColor: 'rgba(255,255,255,0.04)',
    backgroundColor: 'rgba(255,255,255,0.005)',
  },
  achievementHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  achievementCircleCompleted: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementCircleLocked: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  achievementStatusText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#D4AF37',
  },
  achievementStatusTextLocked: {
    color: 'rgba(255,255,255,0.35)',
  },
  achievementName: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  achievementNameLocked: {
    color: 'rgba(255,255,255,0.5)',
  },
  achievementDescription: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.35)',
    lineHeight: 12,
    fontWeight: '300',
  },

  // Referral Card
  referralCard: {
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: 'rgba(224, 176, 52, 0.2)',
    padding: 18,
    overflow: 'hidden',
    gap: 12,
  },
  referralTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  referralSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    lineHeight: 18,
    fontWeight: '300',
  },
  copyCodeRow: {
    flexDirection: 'row',
    gap: 10,
    height: 44,
    marginTop: 6,
  },
  codeBox: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(224, 176, 52, 0.3)',
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  codeText: {
    color: '#D4AF37',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
  },
  copyBtn: {
    width: 80,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    height: '100%',
  },
  copyBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  copyBtnText: {
    color: '#070707',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
