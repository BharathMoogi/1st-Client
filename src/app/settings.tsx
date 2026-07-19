import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Switch, Dimensions, Modal } from 'react-native';
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

// --- VECTOR ICONS FOR SETTINGS ---
const ChevronLeftIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4A373" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="m15 18-6-6 6-6" />
  </Svg>
);

const ChevronRightIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="m9 18 6-6-6-6" />
  </Svg>
);

const ChevronDownIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4A373" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="m6 9 6 6 6-6" />
  </Svg>
);

const ChevronUpIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4A373" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="m18 15-6-6-6 6" />
  </Svg>
);

export default function SettingsScreen() {
  const router = useRouter();

  // Settings states
  const [darkMode, setDarkMode] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState('English (US)');

  // Modal / Collapsible states
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  
  // Danger zone states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

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

  const handleDeleteAccount = () => {
    setDeleteConfirmOpen(false);
    // Route back to Splash/Login states
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      {/* Background Gradients */}
      <LinearGradient
        colors={['#FFF7F8', '#FFFFFF', '#FFF7F8']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* --- TOP HEADER APP BAR --- */}
      <Animated.View style={animatedHeaderStyle}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.headerBtn}>
            <ChevronLeftIcon />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>SETTINGS</Text>
          <View style={{ width: 36 }} />
        </View>
      </Animated.View>

      <Animated.ScrollView style={[styles.scrollContainer, animatedScrollStyle]} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* --- SECTION 1: GENERAL --- */}
        <Text style={styles.sectionHeaderTitle}>GENERAL CONFIGURATIONS</Text>
        <View style={styles.settingsGroup}>
          <LinearGradient
            colors={['rgba(255,255,255,0.02)', 'rgba(255,255,255,0.005)']}
            style={StyleSheet.absoluteFill}
          />
          
          {/* Dark Mode toggle */}
          <View style={styles.settingRow}>
            <Text style={styles.settingLabelText}>Dark Mode Focus</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: 'rgba(139, 30, 63,0.12)', true: '#8B1E3F' }}
              thumbColor={darkMode ? '#1A1A1A' : '#777777'}
            />
          </View>

          {/* Language selector */}
          <TouchableOpacity onPress={() => setLanguageModalOpen(true)} activeOpacity={0.8} style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.settingLabelText}>Language</Text>
            <View style={styles.settingRowRight}>
              <Text style={styles.settingValueText}>{activeLanguage}</Text>
              <ChevronRightIcon />
            </View>
          </TouchableOpacity>
        </View>

        {/* --- SECTION 2: NOTIFICATIONS --- */}
        <Text style={styles.sectionHeaderTitle}>NOTIFICATION PREFERENCES</Text>
        <View style={styles.settingsGroup}>
          <LinearGradient
            colors={['rgba(255,255,255,0.02)', 'rgba(255,255,255,0.005)']}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.settingRow}>
            <Text style={styles.settingLabelText}>Push Notifications</Text>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: 'rgba(139, 30, 63,0.12)', true: '#8B1E3F' }}
              thumbColor={pushNotifications ? '#1A1A1A' : '#777777'}
            />
          </View>

          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.settingLabelText}>Email Alerts & Promo</Text>
            <Switch
              value={emailAlerts}
              onValueChange={setEmailAlerts}
              trackColor={{ false: 'rgba(139, 30, 63,0.12)', true: '#8B1E3F' }}
              thumbColor={emailAlerts ? '#1A1A1A' : '#777777'}
            />
          </View>
        </View>

        {/* --- SECTION 3: LEGAL & PRIVACY --- */}
        <Text style={styles.sectionHeaderTitle}>LEGAL & PRIVACY</Text>
        <View style={styles.settingsGroup}>
          <LinearGradient
            colors={['rgba(255,255,255,0.02)', 'rgba(255,255,255,0.005)']}
            style={StyleSheet.absoluteFill}
          />

          {/* Privacy Policy */}
          <TouchableOpacity onPress={() => setPrivacyOpen(!privacyOpen)} activeOpacity={0.8} style={styles.collapsibleHeader}>
            <Text style={styles.settingLabelText}>Privacy Policy</Text>
            {privacyOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </TouchableOpacity>
          {privacyOpen && (
            <View style={styles.collapsibleBody}>
              <Text style={styles.collapsibleText}>
                We collect personal information to customize and improve your supplement shopping experience. 
                Your data is stored securely and is never sold to third-party marketing companies. 
                Full security audits are conducted quarterly.
              </Text>
            </View>
          )}

          {/* Terms & Conditions */}
          <TouchableOpacity onPress={() => setTermsOpen(!termsOpen)} activeOpacity={0.8} style={[styles.collapsibleHeader, { borderBottomWidth: 0 }]}>
            <Text style={styles.settingLabelText}>Terms & Conditions</Text>
            {termsOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </TouchableOpacity>
          {termsOpen && (
            <View style={styles.collapsibleBody}>
              <Text style={styles.collapsibleText}>
                By purchasing from Aurum Wellness, you agree that our products (Whey Protein, Creatine, Multivitamins) 
                should not replace a balanced diet. Consult a healthcare professional before starting any intensive dietary supplement routines.
              </Text>
            </View>
          )}
        </View>

        {/* --- SECTION 4: DANGER ZONE --- */}
        <Text style={[styles.sectionHeaderTitle, { color: '#EA4335' }]}>DANGER ZONE</Text>
        <View style={[styles.settingsGroup, { borderColor: 'rgba(234, 67, 53, 0.2)' }]}>
          <LinearGradient
            colors={['rgba(234, 67, 53, 0.03)', 'rgba(234, 67, 53, 0.005)']}
            style={StyleSheet.absoluteFill}
          />
          
          <TouchableOpacity onPress={() => setDeleteConfirmOpen(true)} activeOpacity={0.8} style={styles.deleteAccountBtn}>
            <Text style={styles.deleteAccountText}>Delete Account Permanently</Text>
            <ChevronRightIcon />
          </TouchableOpacity>
        </View>

        <View style={{ height: 60 }} />
      </Animated.ScrollView>

      {/* --- LANGUAGE MODAL LIST SELECTOR --- */}
      <Modal visible={languageModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity onPress={() => setLanguageModalOpen(false)} activeOpacity={1} style={styles.modalBacking} />
          
          <View style={styles.modalBox}>
            <LinearGradient colors={['#FFFFFF', '#FFF7F8']} style={StyleSheet.absoluteFill} />
            <Text style={styles.modalTitle}>Select App Language</Text>

            <View style={styles.languageOptionsList}>
              {['English (US)', 'Hindi (IN)', 'Spanish (ES)', 'French (FR)'].map((lang) => {
                const active = activeLanguage === lang;
                return (
                  <TouchableOpacity
                    key={lang}
                    onPress={() => {
                      setActiveLanguage(lang);
                      setLanguageModalOpen(false);
                    }}
                    style={[styles.languageItem, active ? styles.languageItemActive : null]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.languageItemText, active ? styles.languageItemTextActive : null]}>{lang}</Text>
                    {active && <Text style={styles.checkIcon}>✔</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* --- DELETE ACCOUNT CONFIRMATION DRAWER --- */}
      {deleteConfirmOpen && (
        <View style={styles.deleteOverlay}>
          <TouchableOpacity onPress={() => setDeleteConfirmOpen(false)} activeOpacity={1} style={styles.deleteBacking} />
          
          <View style={styles.deleteDrawer}>
            <LinearGradient colors={['#FFFFFF', '#FFF7F8']} style={StyleSheet.absoluteFill} />
            <Text style={styles.deleteTitle}>Delete Account Permanently?</Text>
            <Text style={styles.deleteSubtitle}>
              Warning: This action is irreversible. All VIP club progress, rewards points (2,450 points), and order logs will be wiped from our database permanently.
            </Text>

            <View style={styles.btnRow}>
              <TouchableOpacity onPress={() => setDeleteConfirmOpen(false)} activeOpacity={0.8} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeleteAccount} activeOpacity={0.8} style={styles.confirmBtn}>
                <LinearGradient colors={['#EA4335', '#C53030']} style={StyleSheet.absoluteFill} />
                <Text style={styles.confirmBtnText}>DELETE</Text>
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
    borderColor: 'rgba(139, 30, 63,0.08)',
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
    color: '#1F2937',
    letterSpacing: 2,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  sectionHeaderTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 1.5,
    marginTop: 10,
    marginLeft: 6,
  },
  settingsGroup: {
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: 'rgba(139, 30, 63,0.10)',
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.01)',
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 52,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(139, 30, 63,0.08)',
    paddingHorizontal: 12,
  },
  settingRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingLabelText: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '300',
  },
  settingValueText: {
    fontSize: 12,
    color: '#8B1E3F',
    fontWeight: '400',
  },
  
  // Collapsible legal details
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 52,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(139, 30, 63,0.08)',
    paddingHorizontal: 12,
  },
  collapsibleBody: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  collapsibleText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
    lineHeight: 16,
    fontWeight: '300',
  },
  
  // Danger zone
  deleteAccountBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 12,
  },
  deleteAccountText: {
    fontSize: 13,
    color: '#EA4335',
    fontWeight: '500',
  },

  // Modal overlay
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
    overflow: 'hidden',
    gap: 16,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8B1E3F',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 8,
  },
  languageOptionsList: {
    gap: 10,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(139, 30, 63,0.10)',
    backgroundColor: 'rgba(139, 30, 63,0.05)',
    paddingHorizontal: 16,
  },
  languageItemActive: {
    borderColor: '#8B1E3F',
    backgroundColor: 'rgba(224,176,52,0.06)',
  },
  languageItemText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '300',
  },
  languageItemTextActive: {
    color: '#8B1E3F',
    fontWeight: '600',
  },
  checkIcon: {
    fontSize: 12,
    color: '#8B1E3F',
  },

  // Delete drawer
  deleteOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 99999,
  },
  deleteBacking: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  deleteDrawer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 250,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(234, 67, 53, 0.25)',
    padding: 24,
    overflow: 'hidden',
    gap: 12,
  },
  deleteTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1F2937',
  },
  deleteSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '300',
    lineHeight: 18,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#1F2937',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  confirmBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  confirmBtnText: {
    color: '#1F2937',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
