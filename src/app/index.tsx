import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions, Platform, Image, TextInput } from 'react-native';
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Bhratra Luxury Colors matching Stitch Design Tokens
const PRIMARY = '#004ac6';
const PRIMARY_CONTAINER = '#2563eb';
const BACKGROUND = '#f8f9ff';
const ON_SURFACE = '#0b1c30';
const ON_SURFACE_VARIANT = '#434655';
const SECONDARY = '#006c49';
const TERTIARY = '#8e3c00';
const OUTLINE_VARIANT = '#c3c6d7';

// WebGL Canvas Component for golden sunrise/blue gradient background shader
const WebGLShader = () => {
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
      
      void main() {
          vec2 uv = v_texCoord;
          vec3 color1 = vec3(0.08, 0.16, 0.35); // Deep blue
          vec3 color2 = vec3(0.15, 0.39, 0.92); // Primary blue
          vec3 color3 = vec3(1.0, 0.7, 0.3);  // Golden sunrise
          vec3 color4 = vec3(1.0, 0.45, 0.1); // Sunset orange
          
          float noise = sin(uv.x * 3.0 + u_time * 0.2) * cos(uv.y * 2.0 + u_time * 0.3);
          float t = uv.y + noise * 0.1;
          
          vec3 finalColor = mix(color1, color2, smoothstep(0.0, 0.4, t));
          finalColor = mix(finalColor, color3, smoothstep(0.4, 0.8, t));
          finalColor = mix(finalColor, color4, smoothstep(0.8, 1.2, t));
          
          float sparkle = pow(sin(uv.x * 40.0 + u_time) * cos(uv.y * 40.0 - u_time), 20.0);
          finalColor += sparkle * 0.1;
          
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

    let animationFrameId: number;

    const render = (t: number) => {
      const w = canvas.clientWidth || 1280;
      const h = canvas.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animationFrameId = requestAnimationFrame(render);
    };

    render(0);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  );
};

export default function HomeScreen() {
  const router = useRouter();

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
    fontLink1.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap';
    document.head.appendChild(fontLink1);

    const fontLink2 = document.createElement('link');
    fontLink2.rel = 'stylesheet';
    fontLink2.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    document.head.appendChild(fontLink2);

    // Load Custom Style Tag
    const style = document.createElement('style');
    style.id = 'stitch-custom-styles';
    style.innerHTML = `
      body { font-family: 'Inter', sans-serif; background-color: #f8f9ff; }
      .glass-panel {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.5);
      }
      .hero-gradient {
          background: linear-gradient(180deg, #FAFAFA 0%, #FFF5ED 50%, #EDF4FF 100%);
          position: relative;
          overflow: hidden;
      }
      .floating {
          animation: floating 3s ease-in-out infinite;
      }
      @keyframes floating {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
      }
      .reveal {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.8s ease-out;
      }
      .reveal.active {
          opacity: 1;
          transform: translateY(0);
      }
      .fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
      }
      @keyframes fadeInUp {
          from {
              opacity: 0;
              transform: translateY(30px);
          }
          to {
              opacity: 1;
              transform: translateY(0);
          }
      }
      .premium-glow {
          transition: all 0.3s ease;
      }
      .premium-glow:hover {
          box-shadow: 0 0 20px rgba(0, 74, 198, 0.4);
          transform: translateY(-2px) scale(1.02);
      }
      .connection-line {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: dash 3s ease-in-out forwards;
      }
      @keyframes dash {
          to {
              stroke-dashoffset: 0;
          }
      }
      .pulse-soft {
          animation: pulseSoft 2s infinite;
      }
      @keyframes pulseSoft {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
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

    // Parallax mouse movements
    const handleMouseMove = (e: MouseEvent) => {
      const moveX = (e.clientX - window.innerWidth / 2) / 100;
      const moveY = (e.clientY - window.innerHeight / 2) / 100;
      
      const parallaxImg = document.querySelector('.parallax-target') as HTMLElement;
      if (parallaxImg) {
        parallaxImg.style.transform = `translate(${moveX * 0.5}px, ${moveY * 0.5}px)`;
      }

      document.querySelectorAll('.floating').forEach((card, index) => {
        const depth = (index + 1) * 1.5;
        (card as HTMLElement).style.transform = `translate(${moveX * depth}px, ${moveY * depth}px)`;
      });
    };

    setTimeout(() => {
      setupObserver();
      window.addEventListener('mousemove', handleMouseMove);
    }, 100);

    return () => {
      try {
        if (script.parentNode) document.head.removeChild(script);
        if (fontLink1.parentNode) document.head.removeChild(fontLink1);
        if (fontLink2.parentNode) document.head.removeChild(fontLink2);
        if (style.parentNode) document.head.removeChild(style);
      } catch (e) {}
      window.removeEventListener('mousemove', handleMouseMove);
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  // ── WEB RENDER BLOCK ──
  if (Platform.OS === 'web') {
    return (
      <div className="text-slate-900 bg-slate-50 min-h-screen flex flex-col font-sans select-none overflow-x-hidden">
        {/* TopNavBar */}
        <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 md:px-12 h-20 bg-white/70 backdrop-blur-xl border-b border-black/5 shadow-sm shadow-indigo-500/5">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[#004ac6]">Bhratra</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a className="text-[#004ac6] font-bold border-b-2 border-[#004ac6] pb-1 cursor-pointer" href="#">Home</a>
            <a className="text-[#434655] hover:text-[#004ac6] transition-colors cursor-pointer" onClick={() => router.push('/shop')}>Discover Shop</a>
            <a className="text-[#434655] hover:text-[#004ac6] transition-colors cursor-pointer" href="#">How It Works</a>
            <a className="text-[#434655] hover:text-[#004ac6] transition-colors cursor-pointer" href="#">Safety</a>
            <a className="text-[#434655] hover:text-[#004ac6] transition-colors cursor-pointer" href="#">Community</a>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-[#434655] font-semibold px-4 py-2 hover:opacity-80 transition-opacity" onClick={() => router.push('/shop')}>Sign In</button>
            <button className="bg-[#004ac6] text-white font-semibold px-6 py-2.5 rounded-full shadow-md hover:bg-[#003ea8] transition-colors active:scale-95" onClick={() => router.push('/shop')}>Shop Now</button>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-32 pb-24 hero-gradient min-h-[95vh] flex items-center">
          {/* Animated sky backdrop */}
          <div className="absolute inset-0 z-0">
            <WebGLShader />
          </div>

          <div className="max-w-[1280px] mx-auto w-full px-6 md:px-12 grid lg:grid-cols-2 gap-12 items-center relative z-10">
            {/* Hero Content */}
            <div className="z-10 fade-in-up" style={{ animationDelay: '0.2s' }}>
              <h1 className="text-4xl md:text-6xl font-bold text-[#0b1c30] mb-6 leading-tight">
                Never Travel <br/><span className="text-[#004ac6]">Alone Again.</span>
              </h1>
              <div className="max-w-lg mb-10">
                <p className="text-lg text-[#0b1c30] mb-4 font-semibold italic">"I was just another dev in Bengaluru until I found my tribe."</p>
                <p className="text-base text-[#434655] leading-relaxed">
                  Arjun, a software engineer, dreamed of the Himalayas but had no one to ride with. Through Bhratra, he connected with 7 other verified enthusiasts. Together, they conquered the Khardung La pass, turning strangers into a lifelong brotherhood.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 mb-12">
                <button className="premium-glow bg-[#004ac6] text-white px-8 py-4 rounded-full font-semibold shadow-xl flex items-center gap-2" onClick={() => router.push('/shop')}>
                  Start Your Journey
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
                <button className="premium-glow bg-white text-[#004ac6] border border-[#c3c6d7] px-8 py-4 rounded-full font-semibold hover:bg-slate-50 transition-all" onClick={() => router.push('/shop')}>
                  Shop Supplements
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-[#c3c6d7]/30">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-[#004ac6]">25K+</span>
                  <span className="text-[11px] font-semibold text-[#434655] uppercase tracking-wider">Travelers</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-[#004ac6]">4.9★</span>
                  <span className="text-[11px] font-semibold text-[#434655] uppercase tracking-wider">Rating</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-[#004ac6]">5K+</span>
                  <span className="text-[11px] font-semibold text-[#434655] uppercase tracking-wider">Trips</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-[#004ac6]">100+</span>
                  <span className="text-[11px] font-semibold text-[#434655] uppercase tracking-wider">Countries</span>
                </div>
              </div>
            </div>

            {/* Cinematic Hero Image & Floating Cards */}
            <div className="relative flex justify-center items-center h-full">
              <div className="relative w-full max-w-2xl aspect-[4/3] group">
                <div className="parallax-target transition-transform duration-300 ease-out w-full h-full">
                  <img
                    alt="Bengaluru to Ladakh Motorcycle Expedition"
                    className="w-full h-full object-cover rounded-[2rem] shadow-2xl"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhCsdkQ9BFwbOWlfP4BLqPwUEgTYRRYBaTQjy6KpWuFRdq5ZcFvOlxj55Zdzom_vZY-ZBAMXK_p9MaBuK6cKIiRfPFN-PH4ZTj8IqeBdxBFfXF_xG5qANgFwqnp4-lTc1eKIKdpqahyJLxyq_SMwyC5lM357oD18duXTqC_ylVUISv3GflUH7sTDSUciZfgayzgOMLWNo1pNipzWRrEjMPBL1biEQX1KiqGVWbmJMU8ycfhwBQTK5VDgCGHtHK7yOZ42qt2LCeph5j"
                  />
                </div>
                {/* SVG connection lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" viewBox="0 0 800 600">
                  <path className="connection-line" d="M150,450 Q400,300 650,400" fill="none" stroke="rgba(255,255,255,0.7)" strokeDasharray="5,5" strokeWidth="2.5"></path>
                  <path className="connection-line" d="M150,450 Q300,500 500,450" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2"></path>
                </svg>

                {/* Floating Interactive Cards */}
                <div className="absolute top-10 -left-6 glass-panel p-4 rounded-2xl shadow-xl floating z-30" style={{ animationDelay: '0.5s' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🚀</span>
                    <div>
                      <p className="text-[13px] font-bold text-[#0b1c30]">Ladakh Expedition</p>
                      <p className="text-[11px] text-[#434655]">7 Riders Joined</p>
                    </div>
                  </div>
                </div>

                <div className="absolute top-1/4 -right-10 glass-panel p-4 rounded-2xl shadow-xl floating z-30" style={{ animationDelay: '0.8s' }}>
                  <div className="text-center">
                    <span className="text-lg">😊</span>
                    <p className="font-bold text-[#004ac6] text-sm">98% Match</p>
                    <p className="text-[10px] text-[#434655]">Photography, Adventure</p>
                  </div>
                </div>

                <div className="absolute bottom-20 -left-12 glass-panel p-3 rounded-2xl shadow-xl floating z-30" style={{ animationDelay: '1.1s' }}>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-600 text-sm">verified_user</span>
                    <span className="text-[11px] font-bold">8/8 Riders Verified</span>
                  </div>
                </div>

                <div className="absolute -bottom-6 right-10 glass-panel p-4 rounded-2xl shadow-xl floating z-30 max-w-[220px]" style={{ animationDelay: '1.4s' }}>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#004ac6] text-sm">forum</span>
                      <span className="text-[12px] font-semibold">Expedition Chat</span>
                    </div>
                    <div className="bg-slate-200/50 p-2 rounded-lg">
                      <p className="text-[10px] text-[#434655] italic">"Fuel stop at Manali?"</p>
                    </div>
                    <div className="bg-[#004ac6]/10 p-2 rounded-lg self-end">
                      <p className="text-[10px] text-[#004ac6] italic">"Let's camp near Pangong!"</p>
                    </div>
                  </div>
                </div>

                {/* Pulse Pin */}
                <div className="absolute bottom-[35%] left-[45%] z-20">
                  <div className="w-4 h-4 bg-[#004ac6] rounded-full pulse-soft border-2 border-white"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Indicators Strip */}
          <div className="max-w-[1280px] mx-auto w-full px-6 md:px-12 mt-20 relative z-10">
            <div className="flex flex-wrap justify-center gap-10 md:gap-20 py-8 bg-white/40 backdrop-blur-md rounded-3xl border border-white/50">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#004ac6] p-2 bg-[#004ac6]/10 rounded-xl">verified_user</span>
                <span className="text-sm font-semibold text-[#0b1c30]">Verified Travelers</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#004ac6] p-2 bg-[#004ac6]/10 rounded-xl">shield</span>
                <span className="text-sm font-semibold text-[#0b1c30]">Safe Community</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#004ac6] p-2 bg-[#004ac6]/10 rounded-xl">psychology</span>
                <span className="text-sm font-semibold text-[#0b1c30]">Smart Matching</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#004ac6] p-2 bg-[#004ac6]/10 rounded-xl">forum</span>
                <span className="text-sm font-semibold text-[#0b1c30]">Secure Chat</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid Section */}
        <section className="py-32 bg-[#f8f9ff]">
          <div className="max-w-[1280px] mx-auto px-6 md:px-12">
            <div className="text-center mb-20 reveal">
              <span className="text-[12px] font-bold text-[#004ac6] uppercase tracking-[0.2em] mb-4 block">Designed for Discovery</span>
              <h2 className="text-3xl md:text-5xl font-bold text-[#0b1c30]">Everything You Need for the Perfect Journey</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature Cards */}
              <div className="reveal group bg-white p-8 rounded-3xl border border-[#c3c6d7]/30 hover:border-[#004ac6]/20 hover:shadow-2xl hover:shadow-[#004ac6]/5 transition-all duration-500">
                <div className="w-14 h-14 bg-[#004ac6]/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[#004ac6] text-3xl">verified</span>
                </div>
                <h3 className="text-xl font-bold text-[#0b1c30] mb-3">Verified Travelers</h3>
                <p className="text-sm text-[#434655] leading-relaxed">Identity verification for every member to ensure a safe and trustworthy global network.</p>
              </div>

              <div className="reveal group bg-white p-8 rounded-3xl border border-[#c3c6d7]/30 hover:border-[#006c49]/20 hover:shadow-2xl hover:shadow-[#006c49]/5 transition-all duration-500" style={{ transitionDelay: '100ms' }}>
                <div className="w-14 h-14 bg-[#006c49]/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[#006c49] text-3xl">hub</span>
                </div>
                <h3 className="text-xl font-bold text-[#0b1c30] mb-3">Smart Matching</h3>
                <p className="text-sm text-[#434655] leading-relaxed">Our AI-powered algorithm connects you with people based on interests and travel style.</p>
              </div>

              <div className="reveal group bg-white p-8 rounded-3xl border border-[#c3c6d7]/30 hover:border-[#8e3c00]/20 hover:shadow-2xl hover:shadow-[#8e3c00]/5 transition-all duration-500" style={{ transitionDelay: '200ms' }}>
                <div className="w-14 h-14 bg-[#8e3c00]/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[#8e3c00] text-3xl">chat_bubble</span>
                </div>
                <h3 className="text-xl font-bold text-[#0b1c30] mb-3">Secure Chat</h3>
                <p className="text-sm text-[#434655] leading-relaxed">Encrypted messaging to coordinate plans, share photos, and get to know your companions.</p>
              </div>

              <div className="reveal group bg-white p-8 rounded-3xl border border-[#c3c6d7]/30 hover:border-[#004ac6]/20 hover:shadow-2xl hover:shadow-[#004ac6]/5 transition-all duration-500" style={{ transitionDelay: '300ms' }}>
                <div className="w-14 h-14 bg-[#004ac6]/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[#004ac6] text-3xl">auto_awesome</span>
                </div>
                <h3 className="text-xl font-bold text-[#0b1c30] mb-3">AI Trip Planner</h3>
                <p className="text-sm text-[#434655] leading-relaxed">Generate custom itineraries in seconds tailored to your group's unique preferences.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Itinerary Visual Section */}
        <section className="py-24 bg-white overflow-hidden">
          <div className="max-w-[1280px] mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-20 items-center">
            <div className="reveal">
              <h2 className="text-3xl md:text-5xl font-bold text-[#0b1c30] mb-8">Travel Smarter, Together.</h2>
              <div className="space-y-8 relative">
                <div className="absolute left-[26px] top-4 bottom-4 w-1 bg-[#006c49]/10 rounded-full"></div>
                
                <div className="flex gap-6 relative">
                  <div className="w-[52px] h-[52px] rounded-full bg-white shadow-lg flex items-center justify-center border-4 border-[#006c49]/20 z-10">
                    <span className="material-symbols-outlined text-[#006c49]">person_search</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-[#0b1c30]">Find Your Crew</h4>
                    <p className="text-sm text-[#434655] max-w-md mt-1">Browse trips or create your own. Filter by vibe, budget, and adventure level.</p>
                  </div>
                </div>

                <div className="flex gap-6 relative">
                  <div className="w-[52px] h-[52px] rounded-full bg-white shadow-lg flex items-center justify-center border-4 border-[#004ac6]/20 z-10">
                    <span className="material-symbols-outlined text-[#004ac6]">edit_calendar</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-[#0b1c30]">Co-Create the Plan</h4>
                    <p className="text-sm text-[#434655] max-w-md mt-1">Collaborative itineraries where everyone can vote on activities and stays.</p>
                  </div>
                </div>

                <div className="flex gap-6 relative">
                  <div className="w-[52px] h-[52px] rounded-full bg-white shadow-lg flex items-center justify-center border-4 border-[#8e3c00]/20 z-10">
                    <span className="material-symbols-outlined text-[#8e3c00]">rocket_launch</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-[#0b1c30]">Embark Securely</h4>
                    <p className="text-sm text-[#434655] max-w-md mt-1">Enjoy 24/7 support and built-in safety features throughout your journey.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="reveal lg:pl-10">
              <div className="relative bg-slate-100 p-4 rounded-[40px] shadow-2xl border border-[#c3c6d7]/20">
                <img
                  className="rounded-[30px] w-full h-[500px] object-cover"
                  alt="Testimonial background"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtjjhzgI8FQNPP6uBNUzEPKifO1JPBFnDS2PTQWwYN2Wwlx6Z2xBa-kqsktS0gVEVl8xeUzVPaJydPbMOnLBIDttVNnz8zc2iJ76lV_tUFZrj60I5IgOqIXh-88EE8k_6e29VtF64F1tYhcNIR3qHYiERck8zJ8fSV3uZvJ3FmUFNKW02mud42-CuleAy57zdmXT-BuOT09LfYYp1-lBITgXSUca78690TNMkyK5KS9T0_ChXViZu87gYLrv9c4yE0OmE6Up3kxhYA"
                />
                <div className="absolute bottom-10 right-[-30px] glass-panel p-6 rounded-3xl shadow-2xl max-w-[280px]">
                  <p className="text-sm text-[#0b1c30] font-semibold mb-3">"Found my best friends for life on a 2-week trek through Patagonia. Bhratra changed everything."</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                      <img
                        className="w-full h-full object-cover"
                        alt="Marc"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBT9sNwjxH_qY2i3OChomeqb7MlGhK5rR2FMpxm87mo2-L45Q2i1SiA4KsAaw92kNEvbNn60X_FqYYcSv-Vo88DKSylK6PEFpmXxSmezEXUO9TBufDbJIWWY1N6PMImmoN4fuzGIqBHidMfbhBjh0EWTrdlQQgrRuvm3lsQsg5EShlhoN2lue6UNHHsP14pwpS9Mv-64n2TfKJNSQQ2YP0vboX9WifdJ9zwzNAdG87QEpW9x77WzCue08CcMZ4zaNtSRuDcNDFS3_f5"
                      />
                    </div>
                    <span className="text-[11px] font-bold text-[#434655]">Marc J. • Patagonia 2023</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full py-20 px-6 md:px-12 bg-white border-t border-[#c3c6d7]">
          <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="max-w-sm">
              <span className="text-2xl font-black text-[#004ac6] block mb-6">Bhratra</span>
              <p className="text-sm text-[#434655]">Revolutionizing travel through community and trust. Connecting explorers to create memories that last a lifetime.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
              <div>
                <h4 className="text-[11px] font-bold text-[#0b1c30] uppercase mb-6">Company</h4>
                <ul className="space-y-4">
                  <li><a className="text-sm text-[#434655] hover:text-[#004ac6] transition-colors cursor-pointer">About Us</a></li>
                  <li><a className="text-sm text-[#434655] hover:text-[#004ac6] transition-colors cursor-pointer">Careers</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-[11px] font-bold text-[#0b1c30] uppercase mb-6">Resources</h4>
                <ul className="space-y-4">
                  <li><a className="text-sm text-[#434655] hover:text-[#004ac6] transition-colors cursor-pointer">Safety Guide</a></li>
                  <li><a className="text-sm text-[#434655] hover:text-[#004ac6] transition-colors cursor-pointer">Community Stories</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-[11px] font-bold text-[#0b1c30] uppercase mb-6">Support</h4>
                <ul className="space-y-4">
                  <li><a className="text-sm text-[#434655] hover:text-[#004ac6] transition-colors cursor-pointer" onClick={() => router.push('/shop')}>Shop Supplements</a></li>
                  <li><a className="text-sm text-[#434655] hover:text-[#004ac6] transition-colors cursor-pointer">Privacy Policy</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="max-w-[1280px] mx-auto border-t border-[#c3c6d7]/30 mt-16 pt-8 flex justify-between items-center text-[12px] text-[#434655]">
            <span>© 2024 Bhratra. All rights reserved.</span>
            <span>Made with ❤️ for explorers</span>
          </div>
        </footer>
      </div>
    );
  }

  // ── MOBILE NATIVE RENDER BLOCK ──
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <LinearGradient colors={['#FFF5ED', '#EDF4FF']} style={StyleSheet.absoluteFillObject} />

      {/* Top Navbar */}
      <View style={styles.navBar}>
        <Text style={styles.logoText}>Bhratra</Text>
        <TouchableOpacity style={styles.shopNowBtn} onPress={() => router.push('/shop')}>
          <Text style={styles.shopNowText}>Shop Now</Text>
        </TouchableOpacity>
      </View>

      {/* Hero section */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Never Travel {"\n"}<Text style={{ color: PRIMARY }}>Alone Again.</Text></Text>
        <Text style={styles.heroSubtitle}>"I was just another dev in Bengaluru until I found my tribe."</Text>
        <Text style={styles.heroDescription}>
          Arjun connected with 7 other verified enthusiasts to conquer the Khardung La pass.
        </Text>

        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/shop')}>
          <Text style={styles.primaryBtnText}>Explore Supplements Store</Text>
        </TouchableOpacity>

        {/* Float Cards simulation */}
        <View style={styles.floatGrid}>
          <View style={styles.floatCard}>
            <Text style={styles.floatEmoji}>🚀</Text>
            <View>
              <Text style={styles.floatTitle}>Ladakh Expedition</Text>
              <Text style={styles.floatSub}>7 Riders Joined</Text>
            </View>
          </View>

          <View style={styles.floatCard}>
            <Text style={styles.floatEmoji}>😊</Text>
            <View>
              <Text style={styles.floatTitle}>98% Match Score</Text>
              <Text style={styles.floatSub}>Adventure & Vibe Match</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Features List */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionHeading}>Key Features</Text>
        
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🛡️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.featureTitle}>Verified Travelers</Text>
            <Text style={styles.featureDesc}>Full verification for a secure and trusted community.</Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🧠</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.featureTitle}>Smart Matching</Text>
            <Text style={styles.featureDesc}>AI algorithm links travelers based on core preferences.</Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>💬</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.featureTitle}>Secure Group Chats</Text>
            <Text style={styles.featureDesc}>Coordinate itineraries, stays, and expenses in real-time.</Text>
          </View>
        </View>
      </View>

      {/* Testimonials */}
      <View style={styles.testimonialCard}>
        <Text style={styles.testimonialQuote}>"Found my best friends for life on a 2-week trek. Bhratra changed everything."</Text>
        <Text style={styles.testimonialAuthor}>Marc J. • Patagonia 2023</Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerLogo}>Bhratra</Text>
        <Text style={styles.footerCopyright}>© 2024 Bhratra. All rights reserved.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
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
    paddingBottom: 20,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: PRIMARY,
    letterSpacing: 0.5,
  },
  shopNowBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: PRIMARY,
    borderRadius: 20,
  },
  shopNowText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'stretch',
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: ON_SURFACE,
    lineHeight: 44,
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 15,
    fontStyle: 'italic',
    fontWeight: '600',
    color: PRIMARY,
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 14,
    color: ON_SURFACE_VARIANT,
    lineHeight: 22,
    marginBottom: 24,
  },
  primaryBtn: {
    height: 52,
    backgroundColor: PRIMARY,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  floatGrid: {
    gap: 12,
    marginBottom: 20,
  },
  floatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: OUTLINE_VARIANT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  floatEmoji: {
    fontSize: 22,
  },
  floatTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: ON_SURFACE,
  },
  floatSub: {
    fontSize: 11,
    color: ON_SURFACE_VARIANT,
    marginTop: 2,
  },
  featuresSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: '#F0E5E5',
    gap: 20,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: ON_SURFACE,
    marginBottom: 10,
  },
  featureItem: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  featureIcon: {
    fontSize: 24,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: ON_SURFACE,
  },
  featureDesc: {
    fontSize: 13,
    color: ON_SURFACE_VARIANT,
    lineHeight: 18,
    marginTop: 4,
  },
  testimonialCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#FFF8F7',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0E5E5',
  },
  testimonialQuote: {
    fontSize: 14,
    fontStyle: 'italic',
    color: ON_SURFACE,
    lineHeight: 20,
  },
  testimonialAuthor: {
    fontSize: 11,
    fontWeight: '700',
    color: PRIMARY,
    marginTop: 12,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#F0E5E5',
  },
  footerLogo: {
    fontSize: 18,
    fontWeight: '800',
    color: PRIMARY,
    marginBottom: 8,
  },
  footerCopyright: {
    fontSize: 11,
    color: ON_SURFACE_VARIANT,
  },
});
