import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  withDelay,
  interpolate,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// --- VECTOR ICONS FOR SEARCH SCREEN ---
const ChevronLeftIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#009688" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="m15 18-6-6 6-6" />
  </Svg>
);

const SearchIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="11" cy="11" r="8" />
    <Path d="m21 21-4.3-4.3" />
  </Svg>
);

const MicIcon = ({ color = '#009688' }: { color?: string }) => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <Path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
  </Svg>
);

const CloseIcon = ({ size = 12, color = 'rgba(0,0,0,0.5)' }: { size?: number, color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 6 6 18M6 6l12 12" />
  </Svg>
);

const FilterIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#009688" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
  </Svg>
);

const SUGGESTIONS = [
  'Gold Standard Whey Isolate',
  'Advanced Whey Blend 2kg',
  'Micronized Creatine Powder',
  'Active BCAA Recovery Matrix',
  'Pre-Workout Rush Ignite',
  'Essential Multivitamins Tabs',
  'Liquid Carnitine 3000',
  'Tritan Shaker Bottle 700ml'
];

export default function SearchScreen() {
  const router = useRouter();

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  
  // Search history state
  const [recentSearches, setRecentSearches] = useState([
    'Whey Isolate', 'Creatine 300g', 'Multivitamins'
  ]);
  const [popularSearches] = useState([
    'Creatine Monohydrate', 'Pre-Workout Ignite', 'Amino BCAA', 'Gold Whey'
  ]);

  // Filters state
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [selectedProtein, setSelectedProtein] = useState<string | null>(null);

  // Reanimated shared values
  const inputBorderGlow = useSharedValue(0);
  const micPulseScale = useSharedValue(1);
  const micPulseOpacity = useSharedValue(0.6);

  // Mount animation values
  const mountOpacity = useSharedValue(0);
  const mountTranslateY = useSharedValue(20);

  useEffect(() => {
    mountOpacity.value = withTiming(1, { duration: 600 });
    mountTranslateY.value = withSpring(0, { damping: 15 });
  }, []);

  const animatedMountStyle = useAnimatedStyle(() => ({
    opacity: mountOpacity.value,
    transform: [{ translateY: mountTranslateY.value }],
  }));

  // Auto focus input animate
  useEffect(() => {
    inputBorderGlow.value = withTiming(isFocused ? 1 : 0, { duration: 180 });
  }, [isFocused]);

  // Voice search mic pulse animation loop
  useEffect(() => {
    if (isListening) {
      micPulseScale.value = withRepeat(
        withTiming(2.2, { duration: 1200, easing: Easing.out(Easing.quad) }),
        -1,
        false
      );
      micPulseOpacity.value = withRepeat(
        withTiming(0, { duration: 1200, easing: Easing.out(Easing.quad) }),
        -1,
        false
      );
    } else {
      micPulseScale.value = 1;
      micPulseOpacity.value = 0;
    }
  }, [isListening]);

  // Handle autocomplete query filter
  const handleQueryChange = (text: string) => {
    setSearchQuery(text);
    if (text.length > 0) {
      const filtered = SUGGESTIONS.filter((s) =>
        s.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions([]);
    }
  };

  const handleSearchSubmit = (query: string) => {
    if (!query) return;
    
    // Add to history
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s !== query);
      return [query, ...filtered].slice(0, 5); // limit to 5
    });

    // Navigate to listing with search parameters
    router.push({
      pathname: '/products',
      params: { categoryTitle: 'Search Results', query }
    });
  };

  const handleDeleteRecent = (query: string) => {
    setRecentSearches((prev) => prev.filter((s) => s !== query));
  };

  const handleClearAllRecent = () => {
    setRecentSearches([]);
  };

  const startVoiceSearch = () => {
    setIsListening(true);
    // Simulate voice query capture after 2.5 seconds
    setTimeout(() => {
      setIsListening(false);
      setSearchQuery('Gold Standard Whey');
      handleQueryChange('Gold Standard Whey');
    }, 2500);
  };

  const applyFilters = () => {
    setFiltersOpen(false);
    // Execute filtered search
    router.push({
      pathname: '/products',
      params: {
        categoryTitle: 'Filtered Products',
        brand: selectedBrand || '',
        priceRange: selectedPrice || '',
        protein: selectedProtein || ''
      }
    });
  };

  const clearFilters = () => {
    setSelectedBrand(null);
    setSelectedPrice(null);
    setSelectedProtein(null);
  };

  // Reanimated style bindings
  const animatedInputStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      inputBorderGlow.value,
      [0, 1],
      ['rgba(255, 255, 255, 0.08)', 'rgba(212, 175, 55, 0.7)']
    );
    return { borderColor };
  });

  const animatedMicPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: micPulseScale.value }],
    opacity: micPulseOpacity.value,
  }));

  // Render suggestion matched highlighting
  const renderSuggestionText = (text: string) => {
    const queryIndex = text.toLowerCase().indexOf(searchQuery.toLowerCase());
    if (queryIndex === -1) return <Text style={styles.suggestionNormal}>{text}</Text>;
    
    const before = text.slice(0, queryIndex);
    const match = text.slice(queryIndex, queryIndex + searchQuery.length);
    const after = text.slice(queryIndex + searchQuery.length);

    return (
      <Text style={styles.suggestionNormal}>
        {before}
        <Text style={styles.suggestionMatch}>{match}</Text>
        {after}
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      {/* Background Gradients */}
      <LinearGradient
        colors={['#1A1A1A', '#121110', '#1A1A1A']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      {/* Ambient gold glow */}
      <View style={{ position: 'absolute', top: -100, left: SCREEN_WIDTH / 2 - 100, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(212,175,55,0.03)' }} />

      {/* --- TOP HEADER APP BAR --- */}
      <Animated.View style={[styles.header, animatedMountStyle]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.backButton}>
          <ChevronLeftIcon />
        </TouchableOpacity>

        {/* Input box */}
        <Animated.View style={[styles.searchBox, animatedInputStyle]}>
          <SearchIcon />
          <TextInput
            placeholder="Search supplements..."
            placeholderTextColor="rgba(255, 255, 255, 0.35)"
            value={searchQuery}
            onChangeText={handleQueryChange}
            onSubmitEditing={() => handleSearchSubmit(searchQuery)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={styles.searchInput}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleQueryChange('')} activeOpacity={0.7} style={styles.clearTextButton}>
              <CloseIcon size={10} color="#1A1A1A" />
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Mic voice search button */}
        <TouchableOpacity onPress={startVoiceSearch} activeOpacity={0.7} style={styles.micButton}>
          <MicIcon />
        </TouchableOpacity>
      </Animated.View>

      {/* --- CONDITIONAL VIEWS: AUTOCOMPLETE VS SEARCH SUGGESTIONS VS DEFAULT VIEWS --- */}
      {searchQuery.length > 0 ? (
        // Suggestions dropdown list
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={filteredSuggestions}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSearchSubmit(item)}
                activeOpacity={0.7}
                style={styles.suggestionItem}
              >
                {renderSuggestionText(item)}
                <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5">
                  <Path d="M5 12h14M12 5l7 7-7 7" />
                </Svg>
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptySuggestions}>
                <Text style={styles.emptySuggestionsText}>No suggestions found for "{searchQuery}"</Text>
              </View>
            )}
          />
        </View>
      ) : (
        // Default view: Search history, filters trigger, popular searches
        <Animated.ScrollView style={[styles.bodyScroll, animatedMountStyle]} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
          {/* Quick Filters Toggle */}
          <TouchableOpacity onPress={() => setFiltersOpen(true)} activeOpacity={0.8} style={styles.filtersToggleBtn}>
            <LinearGradient
              colors={['rgba(0,150,136,0.05)', 'rgba(255,255,255,0.01)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.filtersToggleLeft}>
              <FilterIcon />
              <Text style={styles.filtersToggleText}>Advanced Supplement Filters</Text>
            </View>
            <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#009688" strokeWidth="2.5">
              <Path d="m9 18 6-6-6-6" />
            </Svg>
          </TouchableOpacity>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Searches</Text>
                <TouchableOpacity onPress={handleClearAllRecent} activeOpacity={0.7}>
                  <Text style={styles.clearAllText}>Clear All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.tagsContainer}>
                {recentSearches.map((item) => (
                  <View key={item} style={styles.recentBadge}>
                    <TouchableOpacity onPress={() => handleSearchSubmit(item)} activeOpacity={0.7}>
                      <Text style={styles.badgeText}>{item}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteRecent(item)} activeOpacity={0.7} style={styles.deleteBadgeBtn}>
                      <CloseIcon size={8} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Popular Searches */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Popular Searches</Text>
            <View style={styles.tagsContainer}>
              {popularSearches.map((item) => (
                <TouchableOpacity
                  key={item}
                  onPress={() => handleSearchSubmit(item)}
                  activeOpacity={0.8}
                  style={styles.popularTag}
                >
                  <LinearGradient
                    colors={['rgba(212,175,55,0.08)', 'rgba(212,175,55,0.01)']}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={styles.popularTagText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.ScrollView>
      )}

      {/* --- VOICE SEARCH MODAL OVERLAY --- */}
      {isListening && (
        <View style={styles.voiceOverlay}>
          {/* Frosted backing */}
          <LinearGradient
            colors={['rgba(0,0,0,0.92)', 'rgba(10,10,10,0.97)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.voiceContent}>
            <Text style={styles.voiceHeader}>Listening</Text>
            <Text style={styles.voiceInstruction}>Speak search keywords clearly...</Text>

            {/* Pulse rings */}
            <View style={styles.pulseContainer}>
              <Animated.View style={[styles.pulseCircle, animatedMicPulseStyle]} />
              <View style={styles.voiceMicActiveCircle}>
                <MicIcon color="#050505" />
              </View>
            </View>

            <TouchableOpacity onPress={() => setIsListening(false)} activeOpacity={0.8} style={styles.closeVoiceBtn}>
              <Text style={styles.closeVoiceText}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* --- ADVANCED FILTERS PANEL (Drawer sheet layout) --- */}
      {filtersOpen && (
        <View style={styles.filtersOverlay}>
          <TouchableOpacity onPress={() => setFiltersOpen(false)} activeOpacity={1} style={styles.filtersBacking} />
          
          <View style={styles.filtersDrawer}>
            <LinearGradient
              colors={['#0F0E0D', '#1A1A1A']}
              style={StyleSheet.absoluteFill}
            />

            <View style={styles.filtersHeader}>
              <Text style={styles.filtersTitle}>Refine Supplement Search</Text>
              <TouchableOpacity onPress={clearFilters} activeOpacity={0.7}>
                <Text style={styles.clearAllText}>Reset All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filtersScroll} showsVerticalScrollIndicator={false}>
              {/* Brand Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>BRAND</Text>
                <View style={styles.filterBadgeRow}>
                  {['AURUM WELLNESS', 'OPTIMUM NUTRITION', 'MUSCLE LABS', 'MY PROTEIN'].map((b) => {
                    const active = selectedBrand === b;
                    return (
                      <TouchableOpacity
                        key={b}
                        onPress={() => setSelectedBrand(active ? null : b)}
                        style={[styles.filterBadge, active ? styles.filterBadgeActive : null]}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.filterBadgeText, active ? styles.filterBadgeTextActive : null]}>{b}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Price Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>PRICE RANGE</Text>
                <View style={styles.filterBadgeRow}>
                  {['Under $30', '$30 - $70', 'Over $70'].map((p) => {
                    const active = selectedPrice === p;
                    return (
                      <TouchableOpacity
                        key={p}
                        onPress={() => setSelectedPrice(active ? null : p)}
                        style={[styles.filterBadge, active ? styles.filterBadgeActive : null]}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.filterBadgeText, active ? styles.filterBadgeTextActive : null]}>{p}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Protein Content Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>PROTEIN CONTENT</Text>
                <View style={styles.filterBadgeRow}>
                  {['0g Protein', '5g Protein', '25g Protein', '27g Protein'].map((pr) => {
                    const active = selectedProtein === pr;
                    return (
                      <TouchableOpacity
                        key={pr}
                        onPress={() => setSelectedProtein(active ? null : pr)}
                        style={[styles.filterBadge, active ? styles.filterBadgeActive : null]}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.filterBadgeText, active ? styles.filterBadgeTextActive : null]}>{pr}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            {/* Apply Button */}
            <TouchableOpacity onPress={applyFilters} activeOpacity={0.85} style={styles.applyBtn}>
              <LinearGradient colors={['#009688', '#00796B']} style={StyleSheet.absoluteFill} />
              <Text style={styles.applyBtnText}>APPLY FILTERS</Text>
            </TouchableOpacity>
          </View>
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
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 60,
    height: 48,
    gap: 10,
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
  searchBox: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(0,150,136,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
    position: 'relative',
  },
  searchInput: {
    flex: 1,
    color: '#1A1A1A',
    fontSize: 13,
  },
  clearTextButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(224, 176, 52, 0.15)',
  },
  bodyScroll: {
    flex: 1,
  },
  bodyContent: {
    padding: 20,
    gap: 28,
  },
  filtersToggleBtn: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(224, 176, 52, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  filtersToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filtersToggleText: {
    fontSize: 12,
    color: '#009688',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  sectionContainer: {
    gap: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#1A1A1A',
    letterSpacing: 1.5,
  },
  clearAllText: {
    fontSize: 11,
    color: '#009688',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  recentBadge: {
    flexDirection: 'row',
    height: 34,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingLeft: 14,
    paddingRight: 6,
    gap: 8,
  },
  badgeText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '300',
  },
  deleteBadgeBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  popularTag: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(224, 176, 52, 0.15)',
    overflow: 'hidden',
  },
  popularTagText: {
    fontSize: 11,
    color: '#009688',
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // --- SUGGESTIONS LIST ---
  suggestionsContainer: {
    flex: 1,
  },
  suggestionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 52,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 20,
  },
  suggestionNormal: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.65)',
    fontWeight: '300',
  },
  suggestionMatch: {
    color: '#009688',
    fontWeight: '500',
  },
  emptySuggestions: {
    padding: 32,
    alignItems: 'center',
  },
  emptySuggestionsText: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.35)',
    textAlign: 'center',
  },

  // --- VOICE SEARCH MODAL OVERLAY ---
  voiceOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
  },
  voiceContent: {
    alignItems: 'center',
    gap: 12,
  },
  voiceHeader: {
    fontSize: 22,
    fontWeight: '300',
    color: '#1A1A1A',
    letterSpacing: 3,
  },
  voiceInstruction: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.45)',
    fontWeight: '300',
  },
  pulseContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginVertical: 40,
  },
  pulseCircle: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: '#009688',
    backgroundColor: 'rgba(224, 176, 52, 0.1)',
  },
  voiceMicActiveCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#009688',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#009688',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  closeVoiceBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  closeVoiceText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 1.5,
  },

  // --- ADVANCED FILTERS PANEL ---
  filtersOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
  },
  filtersBacking: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  filtersDrawer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: SCREEN_HEIGHT * 0.72,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(224, 176, 52, 0.2)',
    overflow: 'hidden',
    padding: 24,
    justifyContent: 'space-between',
    paddingBottom: 36, // safe area padding
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#1A1A1A',
    letterSpacing: 0.5,
  },
  filtersScroll: {
    flex: 1,
  },
  filterSection: {
    marginVertical: 14,
    gap: 12,
  },
  filterSectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 1.5,
  },
  filterBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterBadgeActive: {
    borderColor: '#009688',
    backgroundColor: 'rgba(224, 176, 52, 0.08)',
  },
  filterBadgeText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.65)',
    fontWeight: '400',
  },
  filterBadgeTextActive: {
    color: '#009688',
    fontWeight: '600',
  },
  applyBtn: {
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginTop: 16,
  },
  applyBtnText: {
    color: '#1A1A1A',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});
