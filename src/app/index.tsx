import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions, Platform, Image, TextInput, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  Easing,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect, G, Line } from 'react-native-svg';

import { auth, db } from '../api/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Elixir Luxury Product Datasets
const ELIXIR_PRODUCTS = [
  {
    id: 1,
    name: 'ELIXIR WHEY PROTEIN',
    tagline: 'THE GOLD STANDARD OF PURITY',
    headline: 'Fuel Your Strength.\nTransform Your Future.',
    description: 'Premium whey protein crafted for athletes, professionals, and everyone committed to becoming their strongest self. Scientifically formulated for maximum bioavailability.',
    image: require('../../assets/images/elixir_whey_canister.png'),
    primaryColor: '#C87A5A',
    secondaryColor: '#A85D63',
    bgColor: '#FFF8F7',
    altBgColor: '#FFFFFF',
    glowColor: 'rgba(200, 122, 90, 0.15)',
    accentGradient: ['#C87A5A', '#A85D63'],
    ingredients: ['Native Whey Isolate', 'Grass-Fed Bio-Peptides', 'Natural Cacao Extract', 'Organic Vanilla Bean'],
    stats: [
      { label: 'Protein', value: '26g' },
      { label: 'BCAAs', value: '5.8g' },
      { label: 'Carbs', value: '1g' },
      { label: 'Servings', value: '30' }
    ]
  },
  {
    id: 2,
    name: 'ELIXIR CREATINE MATRIX',
    tagline: 'EXPLOSIVE POWER MATRIX',
    headline: 'Power Your Performance.\nRedefine Your Limits.',
    description: '100% pure micronized creatine monohydrate engineered for explosive muscle volume, rapid energy recovery, and ultimate power output during high-intensity training.',
    image: require('../../assets/images/elixir_creatine_canister.png'),
    primaryColor: '#5D8B63',
    secondaryColor: '#4A7050',
    bgColor: '#F4FAF6',
    altBgColor: '#FFFFFF',
    glowColor: 'rgba(93, 139, 99, 0.15)',
    accentGradient: ['#5D8B63', '#4A7050'],
    ingredients: ['Micronized Monohydrate', 'HPLC Tested Purity', 'Zero Additives', 'Zero Fillers'],
    stats: [
      { label: 'Creatine', value: '5000mg' },
      { label: 'Purity', value: '100%' },
      { label: 'Sugars', value: '0g' },
      { label: 'Servings', value: '60' }
    ]
  },
  {
    id: 3,
    name: 'ELIXIR PRE-WORKOUT',
    tagline: 'AMPLIFIED FOCUS & DRIVE',
    headline: 'Ignite Your Focus.\nSmash Every Single Set.',
    description: 'A premium, high-stimming formula designed to deliver clean, jitter-free energy surges, laser-like mental focus, and skin-splitting muscle pumps.',
    image: require('../../assets/images/elixir_preworkout_canister.png'),
    primaryColor: '#D89A7C',
    secondaryColor: '#C87A5A',
    bgColor: '#FFFBF9',
    altBgColor: '#FFFFFF',
    glowColor: 'rgba(216, 154, 124, 0.15)',
    accentGradient: ['#D89A7C', '#C87A5A'],
    ingredients: ['L-Citrulline Malate', 'Beta-Alanine', 'Natural Caffeine', 'L-Theanine Complex'],
    stats: [
      { label: 'Citrulline', value: '8000mg' },
      { label: 'Beta-Alanine', value: '3200mg' },
      { label: 'Caffeine', value: '300mg' },
      { label: 'Servings', value: '30' }
    ]
  }
];

// WebGL Background Shader
const WebGLShader = ({ activeProductIndex }: { activeProductIndex: number }) => {
  const canvasRef = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    const vs = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fs = `
      precision highp float;
      varying vec2 v_texCoord;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec3 u_color1;
      uniform vec3 u_color2;
      uniform vec3 u_color3;
      
      void main() {
          vec2 uv = v_texCoord;
          float noise = sin(uv.x * 2.5 + u_time * 0.1) * cos(uv.y * 1.5 + u_time * 0.15);
          float t = uv.y + noise * 0.08;
          
          vec3 finalColor = mix(u_color1, u_color2, smoothstep(0.0, 0.5, t));
          finalColor = mix(finalColor, u_color3, smoothstep(0.5, 1.0, t));
          
          // Subtle luxury shimmer
          float shimmer = pow(abs(sin(uv.x * 20.0 + u_time * 0.5) * cos(uv.y * 20.0 - u_time * 0.5)), 15.0);
          finalColor += shimmer * 0.02;
          
          gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    const cs = (type: any, src: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };

    const prog = gl.createProgram();
    const vsShader = cs(gl.VERTEX_SHADER, vs);
    const fsShader = cs(gl.FRAGMENT_SHADER, fs);
    if (!prog || !vsShader || !fsShader) return;

    gl.attachShader(prog, vsShader);
    gl.attachShader(prog, fsShader);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uColor1 = gl.getUniformLocation(prog, 'u_color1');
    const uColor2 = gl.getUniformLocation(prog, 'u_color2');
    const uColor3 = gl.getUniformLocation(prog, 'u_color3');

    // Soft color sets corresponding to products
    const colorSets = [
      // Whey: Blush Soft Pink
      { c1: [1.0, 0.97, 0.96], c2: [0.98, 0.93, 0.94], c3: [0.99, 0.96, 0.94] },
      // Creatine: Soft Sage/Mint
      { c1: [0.95, 0.98, 0.96], c2: [0.92, 0.96, 0.93], c3: [0.96, 0.98, 0.95] },
      // Preworkout: Soft Amber/Beige
      { c1: [1.0, 0.98, 0.97], c2: [0.99, 0.95, 0.92], c3: [1.0, 0.97, 0.95] }
    ];

    let currentColors = { ...colorSets[activeProductIndex] };
    let animationFrameId: number;

    const render = (t: number) => {
      const w = canvas.clientWidth || 1280;
      const h = canvas.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      // Linear interpolation to transition colors smoothly between product changes
      const target = colorSets[activeProductIndex];
      const rate = 0.05;
      for (let i = 0; i < 3; i++) {
        currentColors.c1[i] += (target.c1[i] - currentColors.c1[i]) * rate;
        currentColors.c2[i] += (target.c2[i] - currentColors.c2[i]) * rate;
        currentColors.c3[i] += (target.c3[i] - currentColors.c3[i]) * rate;
      }

      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      
      if (uColor1) gl.uniform3f(uColor1, currentColors.c1[0], currentColors.c1[1], currentColors.c1[2]);
      if (uColor2) gl.uniform3f(uColor2, currentColors.c2[0], currentColors.c2[1], currentColors.c2[2]);
      if (uColor3) gl.uniform3f(uColor3, currentColors.c3[0], currentColors.c3[1], currentColors.c3[2]);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animationFrameId = requestAnimationFrame(render);
    };

    render(0);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeProductIndex]);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const [activeIdx, setActiveIdx] = useState(0);
  const activeProduct = ELIXIR_PRODUCTS[activeIdx];

  // Reanimated values for product transitions
  const productScale = useSharedValue(1);
  const productOpacity = useSharedValue(1);
  const productRotation = useSharedValue(0);

  // Authentication & Verification state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authStep, setAuthStep] = useState<'login' | 'signup' | 'otp' | 'success'>('login');
  
  // Auth Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Verification & Feedback States
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [smsBanner, setSmsBanner] = useState<string | null>(null);

  const otpRefs = useRef<any[]>([]);

  // Monitor auth state changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return unsub;
  }, []);

  // Countdown timer for resend OTP
  useEffect(() => {
    let interval: any;
    if (authStep === 'otp' && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [authStep, countdown]);

  // Prefill remembered email if checked
  useEffect(() => {
    if (Platform.OS === 'web') {
      const savedEmail = localStorage.getItem('elixir_remembered_email');
      if (savedEmail) {
        setEmail(savedEmail);
      }
    }
  }, []);

  // Validation function for check phone verified
  const checkPhoneVerified = async (user: any) => {
    if (!user) return false;
    if (Platform.OS === 'web') {
      const cached = localStorage.getItem(`phone_verified_${user.uid}`);
      if (cached === 'true') return true;
    }
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists() && userDoc.data().phoneVerified) {
        if (Platform.OS === 'web') {
          localStorage.setItem(`phone_verified_${user.uid}`, 'true');
        }
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const handleGetStarted = async () => {
    const user = auth.currentUser;
    if (user) {
      const verified = await checkPhoneVerified(user);
      if (verified) {
        router.push('/shop');
        return;
      }
    }
    setAuthStep(user ? 'otp' : 'signup');
    setAuthError('');
    setShowAuthModal(true);
    if (user) {
      sendVerificationOtp();
    }
  };

  // Switch transitions
  const triggerSuccessState = () => {
    setAuthStep('success');
    setTimeout(() => {
      setShowAuthModal(false);
      router.push('/shop');
    }, 1600);
  };

  // Mock SMS Sender
  const sendVerificationOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setCountdown(60);
    setOtpArray(['', '', '', '', '', '']);
    setSmsBanner(`SMS Gateway: Your Elixir verification code is ${code}`);
    setTimeout(() => setSmsBanner(null), 10000);
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

  // Sign In submit
  const handleSignIn = async () => {
    if (!email || !password) {
      setAuthError('Please fill in all fields.');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = result.user;
      
      const isVerified = await checkPhoneVerified(user);
      if (isVerified) {
        if (rememberMe && Platform.OS === 'web') {
          localStorage.setItem('elixir_remembered_email', email.trim());
        } else if (Platform.OS === 'web') {
          localStorage.removeItem('elixir_remembered_email');
        }
        triggerSuccessState();
      } else {
        // If not verified yet, load phone number and send OTP
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userPhone = userDoc.exists() ? userDoc.data().phoneNumber : '+91';
        setPhone(userPhone);
        setAuthStep('otp');
        sendVerificationOtp();
      }
    } catch (err: any) {
      setAuthError(friendlyError(err?.code ?? ''));
    }
    setAuthLoading(false);
  };

  // Sign Up Submit
  const handleSignUp = async () => {
    if (!fullName || !email || !phone || !password) {
      setAuthError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    if (!acceptTerms) {
      setAuthError('You must accept the Terms and Privacy Policy.');
      return;
    }
    
    setAuthLoading(true);
    setAuthError('');
    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = result.user;

      // Save user profile details to firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        fullName,
        email: email.trim(),
        phoneNumber: phone.trim(),
        phoneVerified: false,
        createdAt: new Date().toISOString()
      });

      // Navigate to OTP Verification screen
      setAuthStep('otp');
      sendVerificationOtp();
    } catch (err: any) {
      setAuthError(friendlyError(err?.code ?? ''));
    }
    setAuthLoading(false);
  };

  // Verify OTP Code
  const handleVerifyOtp = async (fullOtp: string) => {
    setAuthLoading(true);
    setAuthError('');
    // Artificially wait for spinner animation
    await new Promise((res) => setTimeout(res, 1200));

    if (fullOtp === generatedOtp) {
      try {
        const user = auth.currentUser;
        if (user) {
          await setDoc(doc(db, 'users', user.uid), {
            phoneVerified: true
          }, { merge: true });
          
          if (Platform.OS === 'web') {
            localStorage.setItem(`phone_verified_${user.uid}`, 'true');
          }
        }
        triggerSuccessState();
      } catch (err) {
        setAuthError('Failed to save verification. Please try again.');
      }
    } else {
      setAuthError('Invalid verification code. Please check and try again.');
    }
    setAuthLoading(false);
  };

  const handleOtpBoxChange = (val: string, index: number) => {
    const updated = [...otpArray];
    updated[index] = val.slice(-1); // Take single digit
    setOtpArray(updated);

    // Focus next box automatically
    if (val && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    const fullOtp = updated.join('');
    if (fullOtp.length === 6) {
      handleVerifyOtp(fullOtp);
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otpArray[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // Load Tailwind CSS script
    const script = document.createElement('script');
    script.src = 'https://cdn.tailwindcss.com?plugins=forms,container-queries';
    script.id = 'tailwind-cdn';
    document.head.appendChild(script);

    // Load Google Fonts
    const fontLink1 = document.createElement('link');
    fontLink1.rel = 'stylesheet';
    fontLink1.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap';
    document.head.appendChild(fontLink1);

    // Load Custom Style Tag
    const style = document.createElement('style');
    style.id = 'elixir-custom-styles';
    style.innerHTML = `
      body { font-family: 'Inter', sans-serif; background-color: #FFF8F7; }
      .font-serif-luxury {
        font-family: 'Playfair Display', serif;
      }
      .glass-panel {
          background: rgba(255, 255, 255, 0.45);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.4);
      }
      .floating-canister {
          animation: floatCanister 4s ease-in-out infinite;
      }
      @keyframes floatCanister {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(1.5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
      }
      .reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .reveal.active {
          opacity: 1;
          transform: translateY(0);
      }
      .powder-glow {
          filter: drop-shadow(0 15px 30px var(--glow-color, rgba(200, 122, 90, 0.25)));
      }
      .powder-particle {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.2));
          animation: floatParticle 8s infinite linear;
          pointer-events: none;
      }
      @keyframes floatParticle {
          0% { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-100px) translateX(30px) rotate(360deg); opacity: 0; }
      }
      .modal-animate-fade {
          animation: modalFadeIn 0.3s ease-out forwards;
      }
      @keyframes modalFadeIn {
          from { opacity: 0; backdrop-filter: blur(0px); }
          to { opacity: 1; backdrop-filter: blur(12px); }
      }
      .sms-banner-animate {
          animation: slideDownBanner 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      @keyframes slideDownBanner {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    // Setup scroll observer for scroll reveals
    let observer: IntersectionObserver;
    const setupObserver = () => {
      observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      }, { threshold: 0.1 });

      document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    };

    setTimeout(setupObserver, 150);

    return () => {
      try {
        if (script.parentNode) document.head.removeChild(script);
        if (fontLink1.parentNode) document.head.removeChild(fontLink1);
        if (style.parentNode) document.head.removeChild(style);
      } catch (e) {}
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  const handleProductChange = (index: number) => {
    // Animate canister out
    productScale.value = withTiming(0.85, { duration: 300 });
    productOpacity.value = withTiming(0, { duration: 300 }, (finished) => {
      if (finished) {
        // Swap product index
        productScale.value = 0.85;
        productRotation.value = -10;
        
        // Animate canister in
        productScale.value = withSpring(1, { damping: 12 });
        productOpacity.value = withTiming(1, { duration: 400 });
        productRotation.value = withSpring(0, { damping: 12 });
      }
    });
    setActiveIdx(index);
  };

  // Reanimated style bindings for Mobile Native Cannister
  const animatedCanisterStyle = useAnimatedStyle(() => ({
    opacity: productOpacity.value,
    transform: [
      { scale: productScale.value },
      { rotate: `${productRotation.value}deg` }
    ],
  }));

  // ── WEB RENDER BLOCK ──
  if (Platform.OS === 'web') {
    return (
      <div 
        className="text-slate-800 min-h-screen flex flex-col font-sans select-none overflow-x-hidden transition-colors duration-1000"
        style={{ backgroundColor: activeProduct.bgColor }}
      >
        {/* Mock SMS Banner Gateway */}
        {smsBanner && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-md px-4 sms-banner-animate">
            <div className="bg-slate-900/95 backdrop-blur-md text-white border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center gap-3">
              <span className="text-xl">💬</span>
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-wider text-[#D89A7C] font-semibold">SMS GATEWAY ALERT</p>
                <p className="text-sm font-medium mt-0.5">{smsBanner}</p>
              </div>
              <button onClick={() => setSmsBanner(null)} className="text-white/60 hover:text-white text-lg">×</button>
            </div>
          </div>
        )}

        {/* Dynamic Background Shader */}
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
          <WebGLShader activeProductIndex={activeIdx} />
        </div>

        {/* Floating ingredients/powder particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
          <div className="powder-particle w-3 h-3 top-[35%] left-[25%]" style={{ animationDelay: '0s', animationDuration: '7s' }}></div>
          <div className="powder-particle w-2 h-2 top-[50%] left-[30%]" style={{ animationDelay: '2s', animationDuration: '9s' }}></div>
          <div className="powder-particle w-4 h-4 top-[25%] left-[65%]" style={{ animationDelay: '1s', animationDuration: '8s' }}></div>
          <div className="powder-particle w-3 h-3 top-[60%] left-[70%]" style={{ animationDelay: '3s', animationDuration: '6s' }}></div>
          <div className="powder-particle w-2.5 h-2.5 top-[40%] left-[75%]" style={{ animationDelay: '4s', animationDuration: '10s' }}></div>
        </div>

        {/* Top Header App Bar */}
        <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 md:px-16 h-24 bg-white/10 backdrop-blur-xl border-b border-[#F0E5E5]/40">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-[0.25em] text-[#2B2B2B]">ELIXIR PROTEIN</span>
          </div>
          <div className="hidden md:flex items-center space-x-12">
            <a className="text-[#2B2B2B] font-medium hover:opacity-75 transition-opacity cursor-pointer text-[13px] tracking-widest uppercase">Formula</a>
            <a className="text-[#2B2B2B] font-medium hover:opacity-75 transition-opacity cursor-pointer text-[13px] tracking-widest uppercase" onClick={() => router.push('/shop')}>Shop</a>
            <a className="text-[#2B2B2B] font-medium hover:opacity-75 transition-opacity cursor-pointer text-[13px] tracking-widest uppercase">Journal</a>
            <a className="text-[#2B2B2B] font-medium hover:opacity-75 transition-opacity cursor-pointer text-[13px] tracking-widest uppercase">Impact</a>
          </div>
          <div>
            <button 
              className="text-white text-[12px] font-bold tracking-[0.15em] px-8 py-3.5 rounded-full shadow-lg transition-all transform active:scale-95"
              style={{ backgroundColor: activeProduct.primaryColor, shadowColor: activeProduct.primaryColor }}
              onClick={handleGetStarted}
            >
              GET STARTED
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-44 pb-20 min-h-[92vh] flex items-center z-20">
          <div className="max-w-[1280px] mx-auto w-full px-6 md:px-16 relative">
            
            {/* Centerpiece Canister (Renders behind text layers in overlay stack) */}
            <div className="absolute inset-0 flex justify-center items-center pointer-events-none z-0">
              <div className="relative w-[340px] md:w-[460px] aspect-[1/1.2] flex justify-center items-center">
                {/* Glow ring */}
                <div 
                  className="absolute w-[360px] h-[360px] rounded-full filter blur-[80px] opacity-60 transition-colors duration-1000"
                  style={{ backgroundColor: activeProduct.primaryColor }}
                />
                
                {/* Active canister image with gentle floating float animation */}
                <img
                  key={activeProduct.id}
                  alt={activeProduct.name}
                  className="w-full h-full object-contain floating-canister powder-glow animate-fade-in transition-all duration-700"
                  style={{ '--glow-color': activeProduct.glowColor } as React.CSSProperties}
                  src={activeProduct.image}
                />
              </div>
            </div>

            {/* Content Container (Sits on top with high readability) */}
            <div className="relative z-10 text-center flex flex-col items-center">
              {/* Product selector buttons */}
              <div className="flex gap-4 mb-6 bg-white/30 backdrop-blur-md p-1.5 rounded-full border border-[#F0E5E5]/60 shadow-sm">
                {ELIXIR_PRODUCTS.map((prod, index) => (
                  <button
                    key={prod.id}
                    onClick={() => handleProductChange(index)}
                    className={`px-6 py-2.5 rounded-full text-[11px] font-bold tracking-[0.15em] transition-all ${
                      activeIdx === index 
                        ? 'text-white shadow-md' 
                        : 'text-[#6E6E6E] hover:text-[#2B2B2B]'
                    }`}
                    style={activeIdx === index ? { backgroundColor: activeProduct.primaryColor } : {}}
                  >
                    {prod.name.split(' ').slice(1).join(' ')}
                  </button>
                ))}
              </div>

              {/* Tagline */}
              <span className="text-[12px] md:text-[13px] font-semibold text-[#8B4A50] tracking-[0.3em] mb-4 uppercase transition-all duration-700">
                {activeProduct.tagline}
              </span>

              {/* Huge Cinematic Headline */}
              <h1 className="font-serif-luxury text-4xl md:text-7xl text-[#2B2B2B] font-semibold tracking-tight mb-8 leading-[1.1] max-w-4xl text-center select-text">
                {activeProduct.headline.split('\n')[0]} <br/>
                <span className="italic text-[#6E6E6E] font-normal font-serif-luxury">
                  {activeProduct.headline.split('\n')[1]}
                </span>
              </h1>

              {/* Centered Paragraph */}
              <p className="text-sm md:text-base text-[#6E6E6E] leading-relaxed max-w-2xl mb-12 select-text">
                {activeProduct.description}
              </p>

              {/* Hero Actions */}
              <div className="flex flex-wrap justify-center gap-5 mb-20">
                <button 
                  className="text-white px-9 py-4.5 rounded-full text-[12px] font-bold tracking-[0.18em] shadow-xl hover:opacity-90 transition-all transform hover:-translate-y-0.5 active:scale-95"
                  style={{ backgroundColor: activeProduct.primaryColor }}
                  onClick={handleGetStarted}
                >
                  EXPLORE COLLECTION
                </button>
                <button 
                  className="bg-transparent text-[#2B2B2B] border border-[#2B2B2B] px-9 py-4.5 rounded-full text-[12px] font-bold tracking-[0.18em] hover:bg-[#2B2B2B]/5 transition-all transform hover:-translate-y-0.5 active:scale-95"
                >
                  OUR SCIENCE
                </button>
              </div>

              {/* Product Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-12 w-full max-w-3xl pt-10 border-t border-[#F0E5E5]/80">
                {activeProduct.stats.map((stat, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <span className="text-3xl font-serif-luxury font-semibold text-[#2B2B2B]">{stat.value}</span>
                    <span className="text-[10px] text-[#6E6E6E] tracking-[0.2em] uppercase mt-2">{stat.label}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* Dynamic Detail Ingredients section */}
        <section className="py-32 bg-white relative z-20">
          <div className="max-w-[1280px] mx-auto px-6 md:px-16 grid lg:grid-cols-2 gap-16 items-center">
            <div className="reveal">
              <span className="text-[11px] font-bold text-[#A85D63] tracking-[0.25em] uppercase mb-4 block">Formulation Specs</span>
              <h2 className="text-3xl md:text-5xl font-serif-luxury font-semibold text-[#2B2B2B] leading-tight mb-8">
                Pure Bioavailability.{"\n"}Zero Compromise.
              </h2>
              <p className="text-[#6E6E6E] text-base leading-relaxed mb-10 max-w-lg">
                Every serving is cross-flow microfiltered to preserve key immunoglobulins and growth factors. We source exclusively from grass-fed family dairy farms to guarantee absolute cleanliness.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeProduct.ingredients.map((ing, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 rounded-2xl bg-[#FFF8F7] border border-[#F0E5E5]/60">
                    <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-sm" style={{ color: activeProduct.primaryColor }}>✓</span>
                    <span className="text-sm font-semibold text-[#2B2B2B]">{ing}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="reveal flex justify-center">
              <div className="relative p-6 bg-[#FFF8F7] rounded-[2.5rem] border border-[#F0E5E5] w-full max-w-lg shadow-xl">
                <img
                  className="rounded-3xl w-full h-[400px] object-cover shadow-inner"
                  alt="Pure protein powder macro render"
                  src={require('../../assets/images/elixir_shaker_opened_box.png')}
                />
                <div className="absolute -bottom-8 -right-6 glass-panel p-6 rounded-2xl shadow-xl max-w-[260px] border border-white">
                  <p className="text-xs text-[#2B2B2B] font-semibold italic mb-3">"The mixability and vanilla flavour profile feels exceptionally premium. Truly clean formulation."</p>
                  <span className="text-[10px] font-bold text-[#A85D63] tracking-widest uppercase">Dr. Sarah K. • Sports Dietitian</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- PREMIUM AUTHENTICATION GLASSMORPHIC MODAL --- */}
        {showAuthModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#FFF8F7]/40 backdrop-blur-2xl modal-animate-fade p-4">
            <div 
              className="glass-panel w-full max-w-[460px] p-8 rounded-[2.2rem] border border-white/60 shadow-2xl relative transition-all duration-500 overflow-hidden flex flex-col"
              style={{ minHeight: authStep === 'signup' ? '600px' : '450px' }}
            >
              {/* Close Button */}
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-6 right-6 text-[#2B2B2B]/60 hover:text-[#2B2B2B] text-xl transition-colors font-semibold"
              >
                ×
              </button>

              {/* SUCCESS ANIMATION VIEW */}
              {authStep === 'success' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12 animate-fade-in">
                  <div className="w-20 h-20 bg-green-500/10 border-2 border-green-500 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <span className="text-3xl text-green-500 font-bold">✓</span>
                  </div>
                  <h2 className="text-2xl font-serif-luxury text-[#2B2B2B] font-semibold tracking-tight">Verified Successfully!</h2>
                  <p className="text-sm text-[#6E6E6E] mt-3">Welcome to Elixir. Directing you to store collection...</p>
                  <ActivityIndicator color={activeProduct.primaryColor} style={{ marginTop: 24 }} />
                </div>
              )}

              {/* SIGN IN STATE VIEW */}
              {authStep === 'login' && (
                <div className="animate-fade-in flex flex-col h-full justify-between">
                  <div>
                    <h2 className="text-2xl font-serif-luxury text-[#2B2B2B] font-semibold tracking-tight mb-1">Sign In</h2>
                    <p className="text-xs text-[#6E6E6E] mb-6">Enter your registered email and password to log in.</p>

                    {authError && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-600 text-xs rounded-xl p-3 mb-4 text-center">
                        {authError}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] tracking-wider font-bold text-[#6E6E6E] uppercase block mb-1.5">Email Address</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-white/50 border border-[#F0E5E5] px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#C87A5A] transition-colors"
                          placeholder="yourname@domain.com"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] tracking-wider font-bold text-[#6E6E6E] uppercase block mb-1.5">Password</label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-white/50 border border-[#F0E5E5] px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#C87A5A] transition-colors"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="rounded text-[#C87A5A] focus:ring-[#C87A5A] border-[#F0E5E5] cursor-pointer"
                        />
                        <span className="text-[11px] font-medium text-[#6E6E6E]">Remember Me</span>
                      </label>
                      <button className="text-[11px] font-bold text-[#C87A5A] hover:underline">Forgot Password?</button>
                    </div>
                  </div>

                  <div className="mt-8">
                    <button
                      onClick={handleSignIn}
                      className="w-full text-white py-3.5 rounded-xl text-[12px] font-bold tracking-widest transition-opacity hover:opacity-95 shadow-md flex items-center justify-center gap-2"
                      style={{ backgroundColor: activeProduct.primaryColor }}
                      disabled={authLoading}
                    >
                      {authLoading ? <ActivityIndicator color="#FFFFFF" size="small" /> : 'SIGN IN TO ELIXIR'}
                    </button>

                    {/* Social Logins */}
                    <div className="flex items-center gap-2 my-5">
                      <div className="flex-1 h-[1px] bg-[#F0E5E5]"></div>
                      <span className="text-[9px] font-bold tracking-wider text-[#6E6E6E] uppercase">OR CONNECT WITH</span>
                      <div className="flex-1 h-[1px] bg-[#F0E5E5]"></div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <button className="border border-[#F0E5E5] bg-white/40 hover:bg-white/70 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2">
                        <span>Google</span>
                      </button>
                      <button className="border border-[#F0E5E5] bg-white/40 hover:bg-white/70 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2">
                        <span>Apple</span>
                      </button>
                    </div>

                    <p className="text-center text-xs text-[#6E6E6E]">
                      Don't have an account?{' '}
                      <button onClick={() => { setAuthStep('signup'); setAuthError(''); }} className="text-[#C87A5A] font-bold hover:underline">
                        Create Account
                      </button>
                    </p>
                  </div>
                </div>
              )}

              {/* SIGN UP STATE VIEW */}
              {authStep === 'signup' && (
                <div className="animate-fade-in flex flex-col h-full justify-between">
                  <div>
                    <h2 className="text-2xl font-serif-luxury text-[#2B2B2B] font-semibold tracking-tight mb-1">Create Account</h2>
                    <p className="text-xs text-[#6E6E6E] mb-6">Register below to secure your luxury access.</p>

                    {authError && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-600 text-xs rounded-xl p-3 mb-4 text-center">
                        {authError}
                      </div>
                    )}

                    <div className="space-y-3.5">
                      <div>
                        <label className="text-[10px] tracking-wider font-bold text-[#6E6E6E] uppercase block mb-1">Full Name</label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full bg-white/50 border border-[#F0E5E5] px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#C87A5A] transition-colors"
                          placeholder="Arjun Singh"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] tracking-wider font-bold text-[#6E6E6E] uppercase block mb-1">Email Address</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-white/50 border border-[#F0E5E5] px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#C87A5A] transition-colors"
                          placeholder="arjun.singh@gmail.com"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] tracking-wider font-bold text-[#6E6E6E] uppercase block mb-1">Phone Number</label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-white/50 border border-[#F0E5E5] px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#C87A5A] transition-colors"
                          placeholder="+91 9876543210"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] tracking-wider font-bold text-[#6E6E6E] uppercase block mb-1">Password</label>
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/50 border border-[#F0E5E5] px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#C87A5A] transition-colors"
                            placeholder="••••••"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] tracking-wider font-bold text-[#6E6E6E] uppercase block mb-1">Confirm Password</label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-white/50 border border-[#F0E5E5] px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#C87A5A] transition-colors"
                            placeholder="••••••"
                          />
                        </div>
                      </div>
                    </div>

                    <label className="flex items-start gap-2 mt-4 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="rounded text-[#C87A5A] focus:ring-[#C87A5A] border-[#F0E5E5] cursor-pointer mt-0.5"
                      />
                      <span className="text-[11px] leading-snug text-[#6E6E6E]">
                        I accept Elixir's <span className="text-[#C87A5A] font-bold">Terms of Service</span> and{' '}
                        <span className="text-[#C87A5A] font-bold">Privacy Policy</span>.
                      </span>
                    </label>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={handleSignUp}
                      className="w-full text-white py-3.5 rounded-xl text-[12px] font-bold tracking-widest transition-opacity hover:opacity-95 shadow-md flex items-center justify-center gap-2"
                      style={{ backgroundColor: activeProduct.primaryColor }}
                      disabled={authLoading}
                    >
                      {authLoading ? <ActivityIndicator color="#FFFFFF" size="small" /> : 'REGISTER & VERIFY PHONE'}
                    </button>

                    <p className="text-center text-xs text-[#6E6E6E] mt-4">
                      Already registered?{' '}
                      <button onClick={() => { setAuthStep('login'); setAuthError(''); }} className="text-[#C87A5A] font-bold hover:underline">
                        Sign In
                      </button>
                    </p>
                  </div>
                </div>
              )}

              {/* OTP STATE VIEW */}
              {authStep === 'otp' && (
                <div className="animate-fade-in flex flex-col h-full justify-between">
                  <div>
                    <h2 className="text-2xl font-serif-luxury text-[#2B2B2B] font-semibold tracking-tight mb-1">Verify Mobile</h2>
                    <p className="text-xs text-[#6E6E6E] mb-2">We sent a 6-digit OTP code to <span className="font-bold text-[#2B2B2B]">{phone}</span>.</p>
                    <button 
                      onClick={() => setAuthStep('signup')} 
                      className="text-xs text-[#C87A5A] hover:underline font-bold mb-6"
                    >
                      Change Phone Number
                    </button>

                    {authError && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-600 text-xs rounded-xl p-3 mb-4 text-center">
                        {authError}
                      </div>
                    )}

                    {/* Auto Shifting OTP Inputs */}
                    <div className="flex justify-between gap-2 mt-4">
                      {otpArray.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => (otpRefs.current[idx] = el)}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onKeyDown={(e) => handleOtpKeyPress(e, idx)}
                          onChange={(e) => handleOtpBoxChange(e.target.value, idx)}
                          className="w-12 h-12 bg-white/60 border border-[#F0E5E5] rounded-xl text-center text-lg font-bold focus:outline-none focus:border-[#C87A5A] transition-all transform focus:scale-105"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mt-12">
                    <button
                      onClick={() => handleVerifyOtp(otpArray.join(''))}
                      className="w-full text-white py-3.5 rounded-xl text-[12px] font-bold tracking-widest transition-opacity hover:opacity-95 shadow-md flex items-center justify-center gap-2"
                      style={{ backgroundColor: activeProduct.primaryColor }}
                      disabled={authLoading || otpArray.join('').length < 6}
                    >
                      {authLoading ? <ActivityIndicator color="#FFFFFF" size="small" /> : 'VERIFY CODE'}
                    </button>

                    <div className="text-center mt-6">
                      {countdown > 0 ? (
                        <p className="text-xs text-[#6E6E6E]">
                          Resend code in <span className="font-bold text-[#2B2B2B]">{countdown}s</span>
                        </p>
                      ) : (
                        <button 
                          onClick={sendVerificationOtp} 
                          className="text-xs text-[#C87A5A] font-bold hover:underline"
                        >
                          Resend OTP Code
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="w-full py-20 px-6 md:px-16 bg-[#FFF8F7] border-t border-[#F0E5E5]">
          <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="max-w-xs">
              <span className="text-lg font-bold tracking-[0.25em] text-[#2B2B2B] block mb-6">ELIXIR PROTEIN</span>
              <p className="text-sm text-[#6E6E6E] leading-relaxed">Redefining health, fitness, and cosmetic active nutrition with luxury packaging and certified purity standards.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
              <div>
                <h4 className="text-[11px] font-bold text-[#2B2B2B] uppercase tracking-widest mb-6">Explore</h4>
                <ul className="space-y-4 text-sm text-[#6E6E6E]">
                  <li><a className="hover:text-[#A85D63] transition-colors cursor-pointer" onClick={() => router.push('/shop')}>Shop Store</a></li>
                  <li><a className="hover:text-[#A85D63] transition-colors cursor-pointer">Science Hub</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-[11px] font-bold text-[#2B2B2B] uppercase tracking-widest mb-6">Company</h4>
                <ul className="space-y-4 text-sm text-[#6E6E6E]">
                  <li><a className="hover:text-[#A85D63] transition-colors cursor-pointer">About Elixir</a></li>
                  <li><a className="hover:text-[#A85D63] transition-colors cursor-pointer">Impact Journal</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-[11px] font-bold text-[#2B2B2B] uppercase tracking-widest mb-6">Support</h4>
                <ul className="space-y-4 text-sm text-[#6E6E6E]">
                  <li><a className="hover:text-[#A85D63] transition-colors cursor-pointer">Purity Reports</a></li>
                  <li><a className="hover:text-[#A85D63] transition-colors cursor-pointer">Contact Us</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="max-w-[1280px] mx-auto border-t border-[#F0E5E5] mt-16 pt-8 flex justify-between items-center text-xs text-[#6E6E6E]">
            <span>© 2026 Elixir Protein Co. All rights reserved.</span>
            <span>Made with ❤️ for athletes</span>
          </div>
        </footer>
      </div>
    );
  }

  // ── MOBILE NATIVE RENDER BLOCK ──
  return (
    <ScrollView style={[styles.container, { backgroundColor: activeProduct.bgColor }]} contentContainerStyle={styles.contentContainer}>
      <LinearGradient colors={[activeProduct.bgColor, '#FFFFFF']} style={StyleSheet.absoluteFillObject} />

      {/* Top Navbar */}
      <View style={styles.navBar}>
        <Text style={styles.logoText}>ELIXIR PROTEIN</Text>
        <TouchableOpacity 
          style={[styles.getStartedBtn, { backgroundColor: activeProduct.primaryColor }]}
          onPress={handleGetStarted}
        >
          <Text style={styles.getStartedText}>SHOP</Text>
        </TouchableOpacity>
      </View>

      {/* Active Canister Animating Frame */}
      <View style={styles.imageContainer}>
        <Animated.View style={[styles.canisterWrapper, animatedCanisterStyle]}>
          <Image
            source={activeProduct.image}
            style={styles.canisterImage}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      {/* Hero Content */}
      <View style={styles.heroSection}>
        {/* Product selector buttons */}
        <View style={styles.selectorRow}>
          {ELIXIR_PRODUCTS.map((prod, index) => (
            <TouchableOpacity
              key={prod.id}
              style={[
                styles.selectorBtn,
                activeIdx === index ? { backgroundColor: activeProduct.primaryColor } : {}
              ]}
              onPress={() => handleProductChange(index)}
            >
              <Text style={[styles.selectorBtnText, activeIdx === index ? { color: '#FFFFFF' } : {}]}>
                {prod.name.split(' ').slice(1).join(' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.heroTagline}>{activeProduct.tagline}</Text>
        <Text style={styles.heroTitle}>
          {activeProduct.headline.replace('\n', ' ')}
        </Text>
        <Text style={styles.heroDescription}>
          {activeProduct.description}
        </Text>

        <TouchableOpacity 
          style={[styles.primaryBtn, { backgroundColor: activeProduct.primaryColor }]} 
          onPress={handleGetStarted}
        >
          <Text style={styles.primaryBtnText}>EXPLORE COLLECTION</Text>
        </TouchableOpacity>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {activeProduct.stats.map((stat, i) => (
            <View key={i} style={styles.statBox}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Ingredients List */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionHeading}>Formula Specs</Text>
        {activeProduct.ingredients.map((ing, idx) => (
          <View key={idx} style={styles.featureItem}>
            <View style={[styles.checkCircle, { backgroundColor: activeProduct.bgColor }]}>
              <Text style={{ color: activeProduct.primaryColor, fontWeight: '700', fontSize: 12 }}>✓</Text>
            </View>
            <Text style={styles.featureText}>{ing}</Text>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerLogo}>ELIXIR PROTEIN</Text>
        <Text style={styles.footerCopyright}>© 2026 Elixir Protein Co. All rights reserved.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 60,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2B2B2B',
    letterSpacing: 2,
  },
  getStartedBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  getStartedText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 10,
    letterSpacing: 1,
  },
  imageContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  canisterWrapper: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  canisterImage: {
    width: '100%',
    height: '100%',
  },
  heroSection: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  selectorRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 25,
    padding: 4,
    borderWidth: 1,
    borderColor: '#F0E5E5',
    marginBottom: 20,
  },
  selectorBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  selectorBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6E6E6E',
    letterSpacing: 0.5,
  },
  heroTagline: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A85D63',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2B2B2B',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 16,
  },
  heroDescription: {
    fontSize: 13,
    color: '#6E6E6E',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  primaryBtn: {
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    width: '90%',
    marginBottom: 30,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 18,
    borderTopWidth: 1,
    borderColor: '#F0E5E5',
    marginBottom: 20,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2B2B2B',
  },
  statLabel: {
    fontSize: 9,
    color: '#6E6E6E',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
  featuresSection: {
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F0E5E5',
    gap: 16,
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2B2B2B',
    marginBottom: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2B2B2B',
  },
  footer: {
    paddingVertical: 30,
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#F0E5E5',
    marginHorizontal: 20,
  },
  footerLogo: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2B2B2B',
    letterSpacing: 2,
    marginBottom: 6,
  },
  footerCopyright: {
    fontSize: 10,
    color: '#6E6E6E',
  },
});
