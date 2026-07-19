import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, TextInput, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  Easing,
  withRepeat,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import FloatingInput from './FloatingInput';
import { auth } from '../api/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- INLINE SVG ICONS (Self-contained, ultra-reliable) ---
const MailIcon = ({ color }: { color: string }) => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M22 4H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
    <Path d="M22 6l-10 7L2 6" />
  </Svg>
);

const LockIcon = ({ color }: { color: string }) => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 11V7a5 5 0 0 1 10 0v4" />
    <Path d="M19 11H5a3 3 0 0 0-3 3v5a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-5a3 3 0 0 0-3-3z" />
    <Circle cx="12" cy="16" r="1.5" fill={color} />
  </Svg>
);

const UserIcon = ({ color }: { color: string }) => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Circle cx="12" cy="7" r="4" />
  </Svg>
);

const ShieldCheckIcon = ({ color }: { color: string }) => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <Path d="m9 11 2 2 4-4" />
  </Svg>
);

const GoogleLogo = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.22-.66-.35-1.36-.35-2.09z" fill="#FBBC05" />
    <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
  </Svg>
);

const AppleLogo = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="#FFFFFF">
    <Path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.82M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.57 2.95-1.39z" />
  </Svg>
);

interface AuthScreensProps {
  onSuccess: () => void;
}

export default function AuthScreens({ onSuccess }: AuthScreensProps) {
  const [viewState, setViewState] = useState<'login' | 'signup' | 'forgot'>('login');

  // Input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Firebase state
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Transition & visual shared values
  const cardOpacity = useSharedValue(1);
  const cardTranslateY = useSharedValue(0);
  const cardScale = useSharedValue(1);
  const shineX = useSharedValue(-200);

  // Background decoration shared values for parallex glass movement
  const blobX1 = useSharedValue(0);
  const blobY1 = useSharedValue(0);

  useEffect(() => {
    // Infinite loop for CTA button gold shine sweeps
    shineX.value = withRepeat(
      withTiming(200, { duration: 2500, easing: Easing.inOut(Easing.quad) }),
      -1,
      false
    );

    // Dynamic drifting background elements to enhance frosted glass depth
    blobX1.value = withRepeat(withTiming(25, { duration: 8000, easing: Easing.inOut(Easing.ease) }), -1, true);
    blobY1.value = withRepeat(withTiming(35, { duration: 6000, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, []);

  // Transition helper with spring bounce
  const navigateTo = (state: 'login' | 'signup' | 'forgot') => {
    setAuthError('');
    setResetSent(false);
    cardOpacity.value = withTiming(0, { duration: 200, easing: Easing.inOut(Easing.ease) }, (finished) => {
      if (finished) {
        runOnJS(setViewState)(state);
        cardOpacity.value = withTiming(1, { duration: 300 });
        cardTranslateY.value = withSequence(withTiming(15, { duration: 0 }), withSpring(0, { damping: 14 }));
      }
    });
  };

  const triggerSuccess = () => {
    cardScale.value = withTiming(0.9, { duration: 300 });
    cardOpacity.value = withTiming(0, { duration: 400 }, (finished) => {
      if (finished) runOnJS(onSuccess)();
    });
  };

  const friendlyError = (code: string) => {
    if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') return 'Incorrect password. Please try again.';
    if (code === 'auth/user-not-found') return 'No account found with this email.';
    if (code === 'auth/email-already-in-use') return 'An account with this email already exists.';
    if (code === 'auth/weak-password') return 'Password must be at least 6 characters.';
    if (code === 'auth/invalid-email') return 'Please enter a valid email address.';
    if (code === 'auth/too-many-requests') return 'Too many attempts. Please wait and try again.';
    return 'Something went wrong. Please try again.';
  };

  // ── FIREBASE HANDLERS ──
  const handleLoginSubmit = async () => {
    if (!email || !password) { setAuthError('Please enter your email and password.'); return; }
    setAuthLoading(true); setAuthError('');
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      triggerSuccess();
    } catch (err: any) {
      setAuthError(friendlyError(err?.code ?? ''));
    }
    setAuthLoading(false);
  };

  const handleSignupSubmit = async () => {
    if (!name || !email || !password) { setAuthError('Please fill in all fields.'); return; }
    if (password !== confirmPassword) { setAuthError('Passwords do not match.'); return; }
    if (password.length < 6) { setAuthError('Password must be at least 6 characters.'); return; }
    setAuthLoading(true); setAuthError('');
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      triggerSuccess();
    } catch (err: any) {
      setAuthError(friendlyError(err?.code ?? ''));
    }
    setAuthLoading(false);
  };

  const handleForgotSubmit = async () => {
    if (!email) { setAuthError('Please enter your email address.'); return; }
    setAuthLoading(true); setAuthError('');
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetSent(true);
    } catch (err: any) {
      setAuthError(friendlyError(err?.code ?? ''));
    }
    setAuthLoading(false);
  };

  const refs: (TextInput | null)[] = [];

  // Animated styles
  const animatedCardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardTranslateY.value }, { scale: cardScale.value }],
  }));

  const animatedShineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shineX.value }],
  }));

  const animatedBlob1Style = useAnimatedStyle(() => ({
    transform: [{ translateX: blobX1.value }, { translateY: blobY1.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Background Gradients */}
      <LinearGradient
        colors={['#070707', '#151310', '#070707']}
        locations={[0, 0.5, 1]}
        style={styles.background}
      />

      {/* --- Ambient Glowing Blobs Behind Glass Card --- */}
      <Animated.View style={[styles.glowBlob, styles.blobGold, animatedBlob1Style]} />
      <View style={[styles.glowBlob, styles.blobDarkGold]} />

      <View style={styles.header}>
        <Text style={styles.logoText}>A U R U M</Text>
      </View>

      {/* --- GLASSMORPHIC CARD --- */}
      <Animated.View style={[styles.glassCard, animatedCardStyle]}>
        {/* Semi-transparent white gradient layer to simulate glass shine */}
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.01)']}
          style={StyleSheet.absoluteFill}
        />

        {/* 1. LOGIN VIEW */}
        {viewState === 'login' && (
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Sign In</Text>
            <Text style={styles.cardSubtitle}>Enter your credentials to continue</Text>

            <FloatingInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              Icon={MailIcon}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <FloatingInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              Icon={LockIcon}
              isPassword
              autoCapitalize="none"
            />

            <TouchableOpacity
              onPress={() => navigateTo('forgot')}
              activeOpacity={0.7}
              style={styles.forgotLinkWrapper}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {!!authError && viewState === 'login' && (
              <Text style={styles.errorText}>{authError}</Text>
            )}

            <TouchableOpacity
              onPress={handleLoginSubmit}
              activeOpacity={0.85}
              style={styles.submitButton}
              disabled={authLoading}
            >
              <LinearGradient colors={['#D4AF37', '#B8962D']} style={StyleSheet.absoluteFill} />
              <Animated.View style={[styles.buttonShine, animatedShineStyle]}>
                <LinearGradient
                  colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
              {authLoading ? <ActivityIndicator color="#0A0A0A" /> : <Text style={styles.submitButtonText}>SIGN IN</Text>}
            </TouchableOpacity>

            {/* Separator */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR CONNECT WITH</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Logins */}
            <View style={styles.socialRow}>
              <TouchableOpacity activeOpacity={0.8} style={styles.socialButton}>
                <GoogleLogo />
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.8} style={styles.socialButton}>
                <AppleLogo />
                <Text style={styles.socialButtonText}>Apple</Text>
              </TouchableOpacity>
            </View>

            {/* Switch view link */}
            <View style={styles.switchViewRow}>
              <Text style={styles.switchViewNormal}>New to Aurum? </Text>
              <TouchableOpacity onPress={() => navigateTo('signup')} activeOpacity={0.7}>
                <Text style={styles.switchViewLink}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 2. SIGNUP VIEW */}
        {viewState === 'signup' && (
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Sign Up</Text>
            <Text style={styles.cardSubtitle}>Register for your luxury access</Text>

            <FloatingInput
              label="Full Name"
              value={name}
              onChangeText={setName}
              Icon={UserIcon}
              autoCapitalize="words"
            />
            <FloatingInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              Icon={MailIcon}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <FloatingInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              Icon={LockIcon}
              isPassword
              autoCapitalize="none"
            />
            <FloatingInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              Icon={LockIcon}
              isPassword
              autoCapitalize="none"
            />

            {!!authError && viewState === 'signup' && (
              <Text style={styles.errorText}>{authError}</Text>
            )}

            <TouchableOpacity
              onPress={handleSignupSubmit}
              activeOpacity={0.85}
              style={[styles.submitButton, { marginTop: 12 }]}
              disabled={authLoading}
            >
              <LinearGradient colors={['#D4AF37', '#B8962D']} style={StyleSheet.absoluteFill} />
              <Animated.View style={[styles.buttonShine, animatedShineStyle]}>
                <LinearGradient
                  colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
              {authLoading ? <ActivityIndicator color="#0A0A0A" /> : <Text style={styles.submitButtonText}>CREATE ACCOUNT</Text>}
            </TouchableOpacity>

            {/* Switch view link */}
            <View style={styles.switchViewRow}>
              <Text style={styles.switchViewNormal}>Already registered? </Text>
              <TouchableOpacity onPress={() => navigateTo('login')} activeOpacity={0.7}>
                <Text style={styles.switchViewLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 3. FORGOT PASSWORD VIEW */}
        {viewState === 'forgot' && (
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Reset Password</Text>
            <Text style={styles.cardSubtitle}>Receive a recovery code at your email</Text>

            <FloatingInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              Icon={MailIcon}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {!!authError && viewState === 'forgot' && (
              <Text style={styles.errorText}>{authError}</Text>
            )}
            {resetSent && (
              <Text style={styles.successText}>✓ Reset link sent to {email}</Text>
            )}

            <TouchableOpacity
              onPress={handleForgotSubmit}
              activeOpacity={0.85}
              style={[styles.submitButton, { marginTop: 24 }]}
              disabled={authLoading || resetSent}
            >
              <LinearGradient colors={['#D4AF37', '#B8962D']} style={StyleSheet.absoluteFill} />
              <Animated.View style={[styles.buttonShine, animatedShineStyle]}>
                <LinearGradient
                  colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
              {authLoading ? <ActivityIndicator color="#0A0A0A" /> : <Text style={styles.submitButtonText}>SEND RESET LINK</Text>}
            </TouchableOpacity>

            {/* Switch view link */}
            <View style={styles.switchViewRow}>
              <TouchableOpacity onPress={() => navigateTo('login')} activeOpacity={0.7} style={styles.backToLoginWrapper}>
                <Text style={styles.switchViewLink}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  background: {
    ...StyleSheet.absoluteFill,
  },
  header: {
    position: 'absolute',
    top: 60,
    width: '100%',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '300',
    color: '#FFE082',
    letterSpacing: 6,
  },
  glowBlob: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    opacity: 0.1,
  },
  blobGold: {
    top: '25%',
    left: '10%',
    backgroundColor: '#D4AF37',
  },
  blobDarkGold: {
    bottom: '25%',
    right: '10%',
    backgroundColor: '#B8962D',
  },
  glassCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.11)',
    backgroundColor: 'rgba(20, 19, 18, 0.55)',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  cardContent: {
    padding: 28,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    marginBottom: 4,
    fontFamily: 'System',
  },
  cardSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.45)',
    marginBottom: 20,
    fontWeight: '300',
  },
  forgotLinkWrapper: {
    alignSelf: 'flex-end',
    marginTop: 4,
    marginBottom: 16,
  },
  forgotText: {
    fontSize: 12,
    color: '#FFE082',
    fontWeight: '400',
  },
  submitButton: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginTop: 10,
    shadowColor: '#B8962D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonShine: {
    ...StyleSheet.absoluteFill,
    width: '80%',
  },
  submitButtonText: {
    color: '#0A0A0A',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  dividerText: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.3)',
    fontWeight: '600',
    marginHorizontal: 12,
    letterSpacing: 1.5,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  socialButton: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  socialButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '400',
  },
  switchViewRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  switchViewNormal: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.45)',
    fontWeight: '300',
  },
  switchViewLink: {
    fontSize: 12,
    color: '#FFE082',
    fontWeight: '500',
  },
  backToLoginWrapper: {
    marginVertical: 4,
  },
  errorText: {
    fontSize: 11,
    color: '#FF6B6B',
    backgroundColor: 'rgba(255,107,107,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.2)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    textAlign: 'center',
  },
  successText: {
    fontSize: 11,
    color: '#4CAF50',
    backgroundColor: 'rgba(76,175,80,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.2)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    textAlign: 'center',
  },
});
