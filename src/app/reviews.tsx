import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect, G, Line } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- VECTOR ICONS FOR REVIEWS ---
const ChevronLeftIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#80CBC4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="m15 18-6-6 6-6" />
  </Svg>
);

const StarIcon = ({ filled = true, size = 12 }: { filled?: boolean; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? '#80CBC4' : 'none'} stroke="#80CBC4" strokeWidth="1.5">
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </Svg>
);

const CheckIcon = () => (
  <Svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#80CBC4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 6 9 17l-5-5" />
  </Svg>
);

const PlayIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="#80CBC4">
    <Path d="m8 5 10 7-10 7V5z" />
  </Svg>
);

const CloseIcon = () => (
  <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 6 6 18M6 6l12 12" />
  </Svg>
);

// --- INITIAL REVIEWS FEED ---
const INITIAL_REVIEWS = [
  {
    id: 'rev-1',
    userName: 'Vikram S.',
    rating: 5,
    verified: true,
    date: 'July 15, 2026',
    comment: 'Mixes instantly without any clumping. The double rich chocolate taste is extremely premium and not overly sweet. Noticeable recovery improvements in my morning workout sessions.',
  },
  {
    id: 'rev-2',
    userName: 'Priya K.',
    rating: 5,
    verified: true,
    date: 'July 12, 2026',
    comment: 'Aurum Whey is definitely worth the luxury price tag. You get clean ingredients, no fillers, and transparent labels. Shipping was lightning fast to Mumbai, took only 36 hours.',
  },
  {
    id: 'rev-3',
    userName: 'Rohan M.',
    rating: 4,
    verified: true,
    date: 'July 08, 2026',
    comment: 'Top tier mixability and amino profile. However, the chocolate flavor is often out of stock. Switched to gourmet vanilla which is still very decent, but please stock more chocolates!',
  }
];

export default function ReviewsScreen() {
  const router = useRouter();

  // Reviews Feed states
  const [reviewsList, setReviewsList] = useState(INITIAL_REVIEWS);
  const [writeModalOpen, setWriteModalOpen] = useState(false);

  // Form states
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [userName, setUserName] = useState('');

  const handleSubmitReview = () => {
    if (!userComment.trim()) return;

    const newReview = {
      id: `rev-${Date.now()}`,
      userName: userName.trim() || 'Anonymous Buyer',
      rating: userRating,
      verified: true, // Verified since they are logged in members
      date: 'Today',
      comment: userComment,
    };

    setReviewsList((prev) => [newReview, ...prev]);
    
    // Clear inputs and close modal
    setUserName('');
    setUserComment('');
    setUserRating(5);
    setWriteModalOpen(false);
  };

  // Mount animations
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-14);
  const scrollOpacity = useSharedValue(0);
  const scrollTranslateY = useSharedValue(24);
  const footerTranslateY = useSharedValue(80);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 500 });
    headerTranslateY.value = withSpring(0, { damping: 16, stiffness: 100 });
    scrollOpacity.value = withDelay(150, withTiming(1, { duration: 500 }));
    scrollTranslateY.value = withDelay(150, withSpring(0, { damping: 14, stiffness: 90 }));
    footerTranslateY.value = withDelay(300, withSpring(0, { damping: 14, stiffness: 90 }));
  }, []);

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const animatedScrollStyle = useAnimatedStyle(() => ({
    opacity: scrollOpacity.value,
    transform: [{ translateY: scrollTranslateY.value }],
  }));

  const animatedFooterStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: footerTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Background Gradients */}
      <LinearGradient
        colors={['#1A1A1A', '#0F0D0A', '#1A1A1A']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* --- TOP HEADER APP BAR --- */}
      <Animated.View style={animatedHeaderStyle}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.headerBtn}>
            <ChevronLeftIcon />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>CUSTOMER REVIEWS</Text>
          <View style={{ width: 36 }} />
        </View>
      </Animated.View>

      <Animated.ScrollView style={[styles.scrollContainer, animatedScrollStyle]} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* --- RATINGS SUMMARY SECTION --- */}
        <View style={styles.summaryCard}>
          <LinearGradient
            colors={['rgba(0,150,136,0.05)', 'rgba(255,255,255,0.01)']}
            style={StyleSheet.absoluteFill}
          />
          {/* Left panel: Total rating score */}
          <View style={styles.summaryScoreLeft}>
            <Text style={styles.averageScoreText}>4.9</Text>
            <View style={styles.starsRowInline}>
              {[1, 2, 3, 4, 5].map((s) => <StarIcon key={s} size={14} />)}
            </View>
            <Text style={styles.totalReviewsCount}>2,450 Reviews</Text>
          </View>

          {/* Right panel: Distribution rows */}
          <View style={styles.summaryBarsRight}>
            {[
              { star: 5, pct: '80%' },
              { star: 4, pct: '15%' },
              { star: 3, pct: '3%' },
              { star: 2, pct: '1%' },
              { star: 1, pct: '1%' },
            ].map((row) => (
              <View key={row.star} style={styles.distributionRow}>
                <Text style={styles.rowStarLabel}>{row.star}★</Text>
                <View style={styles.barWrapper}>
                  <View style={styles.barBg} />
                  <View style={[styles.barActive, { width: row.pct as any }]} />
                </View>
                <Text style={styles.rowPctLabel}>{row.pct}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* --- PHOTOS & VIDEOS SLIDER --- */}
        <Text style={styles.sectionHeaderTitle}>MEDIA BY BUYERS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mediaSlider}>
          {/* Photo uploads */}
          <View style={styles.mediaBox}>
            <LinearGradient colors={['#17181A', '#090A0A']} style={StyleSheet.absoluteFill} />
            <Text style={styles.mediaLabelText}>PHOTO</Text>
          </View>
          <View style={styles.mediaBox}>
            <LinearGradient colors={['#17181A', '#090A0A']} style={StyleSheet.absoluteFill} />
            <Text style={styles.mediaLabelText}>PHOTO</Text>
          </View>
          
          {/* Video uploads (with play button) */}
          <View style={styles.mediaBox}>
            <LinearGradient colors={['#17181A', '#090A0A']} style={StyleSheet.absoluteFill} />
            <Text style={styles.mediaLabelText}>VIDEO</Text>
            <View style={styles.videoPlayOverlay}>
              <PlayIcon />
            </View>
          </View>
          <View style={styles.mediaBox}>
            <LinearGradient colors={['#17181A', '#090A0A']} style={StyleSheet.absoluteFill} />
            <Text style={styles.mediaLabelText}>VIDEO</Text>
            <View style={styles.videoPlayOverlay}>
              <PlayIcon />
            </View>
          </View>
        </ScrollView>

        {/* --- REVIEWS LIST FEED --- */}
        <Text style={styles.sectionHeaderTitle}>ALL REVIEWS ({reviewsList.length})</Text>
        <View style={styles.reviewsFeed}>
          {reviewsList.map((rev) => (
            <View key={rev.id} style={styles.reviewCard}>
              <LinearGradient
                colors={['rgba(255,255,255,0.02)', 'rgba(255,255,255,0.005)']}
                style={StyleSheet.absoluteFill}
              />
              {/* Header row: Star ratings and date */}
              <View style={styles.reviewCardHeader}>
                <View style={styles.reviewStars}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <StarIcon key={s} filled={s <= rev.rating} size={10} />
                  ))}
                </View>
                <Text style={styles.reviewDate}>{rev.date}</Text>
              </View>

              {/* Author name and verified badge */}
              <View style={styles.authorRow}>
                <Text style={styles.authorName}>{rev.userName}</Text>
                {rev.verified && (
                  <View style={styles.verifiedBadge}>
                    <CheckIcon />
                    <Text style={styles.verifiedText}>Verified Purchase</Text>
                  </View>
                )}
              </View>

              {/* Comment text */}
              <Text style={styles.reviewComment}>{rev.comment}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* --- STICKY WRITE REVIEW CTA --- */}
      <Animated.View style={[styles.stickyFooterBar, animatedFooterStyle]}>
        <TouchableOpacity onPress={() => setWriteModalOpen(true)} activeOpacity={0.85} style={styles.writeCtaBtn}>
          <LinearGradient colors={['#009688', '#00796B']} style={StyleSheet.absoluteFill} />
          <Text style={styles.writeCtaText}>WRITE REVIEW</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* --- WRITE REVIEW POPUP MODAL FORM --- */}
      <Modal visible={writeModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity onPress={() => setWriteModalOpen(false)} activeOpacity={1} style={styles.modalBacking} />
          
          <View style={styles.modalBox}>
            <LinearGradient colors={['#0F0E0D', '#1A1A1A']} style={StyleSheet.absoluteFill} />
            
            {/* Modal header */}
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Write Product Review</Text>
              <TouchableOpacity onPress={() => setWriteModalOpen(false)} activeOpacity={0.7} style={styles.modalCloseBtn}>
                <CloseIcon />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ width: '100%' }} contentContainerStyle={styles.modalScrollContent} keyboardShouldPersistTaps="handled">
              
              {/* Rating picker */}
              <Text style={styles.inputLabelText}>YOUR RATING</Text>
              <View style={styles.starPickerRow}>
                {[1, 2, 3, 4, 5].map((s) => {
                  const active = s <= userRating;
                  return (
                    <TouchableOpacity key={s} onPress={() => setUserRating(s)} activeOpacity={0.7} style={styles.starBtn}>
                      <StarIcon filled={active} size={28} />
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* User Name input */}
              <Text style={styles.inputLabelText}>YOUR NAME (OPTIONAL)</Text>
              <TextInput
                value={userName}
                onChangeText={setUserName}
                placeholder="Enter display name..."
                placeholderTextColor="rgba(255,255,255,0.2)"
                style={styles.textInputShort}
              />

              {/* Comment text area */}
              <Text style={styles.inputLabelText}>YOUR FEEDBACK</Text>
              <TextInput
                value={userComment}
                onChangeText={setUserComment}
                placeholder="Share details of mixability, taste, or results..."
                placeholderTextColor="rgba(255,255,255,0.2)"
                multiline
                numberOfLines={4}
                style={styles.textInputArea}
              />

              {/* Photo Simulator upload box */}
              <Text style={styles.inputLabelText}>ATTACH MEDIA</Text>
              <TouchableOpacity activeOpacity={0.7} style={styles.uploadSimulatorBox}>
                <Text style={styles.uploadSimulatorText}>+ Add Photo / Video</Text>
              </TouchableOpacity>

              {/* Submit CTA */}
              <TouchableOpacity onPress={handleSubmitReview} activeOpacity={0.85} style={styles.submitReviewBtn}>
                <LinearGradient colors={['#009688', '#00796B']} style={StyleSheet.absoluteFill} />
                <Text style={styles.submitReviewBtnText}>SUBMIT REVIEW</Text>
              </TouchableOpacity>

            </ScrollView>
          </View>
        </View>
      </Modal>
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
    fontSize: 14,
    fontWeight: '400',
    color: '#1A1A1A',
    letterSpacing: 2,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },

  // Summary Card
  summaryCard: {
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: 'rgba(0,150,136,0.10)',
    backgroundColor: 'rgba(255,255,255,0.01)',
    overflow: 'hidden',
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  summaryScoreLeft: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  averageScoreText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#009688',
  },
  starsRowInline: {
    flexDirection: 'row',
    gap: 2,
  },
  totalReviewsCount: {
    fontSize: 9,
    color: 'rgba(0,0,0,0.35)',
    fontWeight: '300',
  },
  summaryBarsRight: {
    flex: 1,
    gap: 6,
    justifyContent: 'center',
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowStarLabel: {
    fontSize: 10,
    color: 'rgba(0,0,0,0.5)',
    width: 18,
    textAlign: 'right',
  },
  barWrapper: {
    flex: 1,
    height: 4,
    position: 'relative',
    justifyContent: 'center',
  },
  barBg: {
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 2,
  },
  barActive: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#009688',
    borderRadius: 2,
  },
  rowPctLabel: {
    fontSize: 9,
    color: 'rgba(0,0,0,0.35)',
    width: 26,
    textAlign: 'left',
  },

  sectionHeaderTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 1.5,
    marginTop: 10,
    marginLeft: 6,
  },

  // Media Slider
  mediaSlider: {
    gap: 12,
    paddingLeft: 6,
  },
  mediaBox: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: 'rgba(0,150,136,0.10)',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mediaLabelText: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.15)',
    letterSpacing: 1,
  },
  videoPlayOverlay: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  // Reviews Feed
  reviewsFeed: {
    gap: 12,
  },
  reviewCard: {
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(0,150,136,0.08)',
    backgroundColor: 'rgba(255,255,255,0.005)',
    overflow: 'hidden',
    padding: 16,
    gap: 8,
  },
  reviewCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.35)',
    fontWeight: '300',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorName: {
    fontSize: 12,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(224,176,52,0.06)',
    borderWidth: 0.5,
    borderColor: 'rgba(224,176,52,0.25)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  verifiedText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#009688',
  },
  reviewComment: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    lineHeight: 18,
    fontWeight: '300',
  },

  // Sticky bottom bar
  stickyFooterBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 90,
    borderTopWidth: 0.5,
    borderColor: 'rgba(0,150,136,0.08)',
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  writeCtaBtn: {
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  writeCtaText: {
    color: '#1A1A1A',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  // Modal styling
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    zIndex: 99999,
  },
  modalBacking: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalBox: {
    height: 520,
    width: '100%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(224,176,52,0.2)',
    padding: 24,
    overflow: 'hidden',
    gap: 16,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderColor: 'rgba(0,150,136,0.08)',
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  modalCloseBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScrollContent: {
    paddingVertical: 10,
    gap: 12,
  },
  inputLabelText: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 1.5,
    marginTop: 6,
  },
  starPickerRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 4,
  },
  starBtn: {
    padding: 2,
  },
  textInputShort: {
    height: 42,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: 'rgba(0,150,136,0.10)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    color: '#1A1A1A',
    paddingHorizontal: 16,
    fontSize: 12,
  },
  textInputArea: {
    height: 90,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: 'rgba(0,150,136,0.10)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    color: '#1A1A1A',
    paddingHorizontal: 16,
    paddingTop: 12,
    fontSize: 12,
    textAlignVertical: 'top',
  },
  uploadSimulatorBox: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(224,176,52,0.3)',
    backgroundColor: 'rgba(224,176,52,0.02)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadSimulatorText: {
    fontSize: 11,
    color: '#009688',
    fontWeight: '500',
  },
  submitReviewBtn: {
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginTop: 12,
  },
  submitReviewBtnText: {
    color: '#1A1A1A',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
