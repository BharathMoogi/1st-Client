import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, G } from 'react-native-svg';

interface GoldLogoProps {
  width?: number;
  height?: number;
  glow?: boolean;
}

export default function GoldLogo({ width = 120, height = 120, glow = false }: GoldLogoProps) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 120 120"
      fill="none"
    >
      <Defs>
        {/* Primary Gold Gradient */}
        <LinearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFE082" />
          <Stop offset="20%" stopColor="#D4AF37" />
          <Stop offset="45%" stopColor="#B8962D" />
          <Stop offset="60%" stopColor="#F5D061" />
          <Stop offset="80%" stopColor="#9B6B0E" />
          <Stop offset="100%" stopColor="#FFE082" />
        </LinearGradient>

        {/* Secondary Light Gold Gradient for 3D/Cresting effect */}
        <LinearGradient id="goldGradLight" x1="100%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.8} />
          <Stop offset="30%" stopColor="#FFE082" />
          <Stop offset="70%" stopColor="#B8962D" />
          <Stop offset="100%" stopColor="#5E3E04" />
        </LinearGradient>

        {/* Dark Gold Shadow/Stroke Gradient */}
        <LinearGradient id="goldGradDark" x1="0%" y1="100%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#4A3000" />
          <Stop offset="50%" stopColor="#875E0F" />
          <Stop offset="100%" stopColor="#D9AA3C" />
        </LinearGradient>

        {/* Glow Filter / Gradient */}
        <LinearGradient id="radialGlow" x1="50%" y1="50%" x2="100%" y2="50%">
          <Stop offset="0%" stopColor="#D4AF37" stopOpacity={0.4} />
          <Stop offset="60%" stopColor="#B8962D" stopOpacity={0.1} />
          <Stop offset="100%" stopColor="#000000" stopOpacity={0} />
        </LinearGradient>
      </Defs>

      {/* Decorative Radial Glow behind logo (if enabled) */}
      {glow && (
        <Circle cx="60" cy="60" r="50" fill="url(#radialGlow)" />
      )}

      <G>
        {/* Outer Elegant Ring */}
        <Circle
          cx="60"
          cy="60"
          r="48"
          stroke="url(#goldGrad)"
          strokeWidth="1.5"
          strokeDasharray="4 2"
          opacity="0.6"
        />
        <Circle
          cx="60"
          cy="60"
          r="44"
          stroke="url(#goldGradLight)"
          strokeWidth="0.75"
          opacity="0.8"
        />

        {/* --- PREMIUM GEOMETRIC CROWN / CREST --- */}
        
        {/* Left Crown Wing */}
        <Path
          d="M38 72 L46 45 L58 64 L48 76 Z"
          fill="url(#goldGrad)"
        />
        {/* Left Crown Wing Inner Shading */}
        <Path
          d="M38 72 L46 45 L50 55 L43 72 Z"
          fill="url(#goldGradDark)"
          opacity="0.3"
        />

        {/* Right Crown Wing */}
        <Path
          d="M82 72 L74 45 L62 64 L72 76 Z"
          fill="url(#goldGrad)"
        />
        {/* Right Crown Wing Inner Shading */}
        <Path
          d="M82 72 L74 45 L70 55 L77 72 Z"
          fill="url(#goldGradDark)"
          opacity="0.3"
        />

        {/* Center Peak */}
        <Path
          d="M60 35 L68 58 L60 65 L52 58 Z"
          fill="url(#goldGradLight)"
        />
        {/* Center Peak Side facets for 3D look */}
        <Path
          d="M60 35 L60 65 L52 58 Z"
          fill="url(#goldGradDark)"
          opacity="0.25"
        />

        {/* Base Diamond / Pedestal */}
        <Path
          d="M48 78 L72 78 L60 88 Z"
          fill="url(#goldGrad)"
        />
        
        {/* Tiny Jewel Highlights */}
        {/* Center Jewel */}
        <Path
          d="M60 27 L63 31 L60 35 L57 31 Z"
          fill="url(#goldGradLight)"
        />
        {/* Left Jewel */}
        <Path
          d="M46 37 L49 41 L46 45 L43 41 Z"
          fill="url(#goldGradLight)"
        />
        {/* Right Jewel */}
        <Path
          d="M74 37 L77 41 L74 45 L71 41 Z"
          fill="url(#goldGradLight)"
        />

        {/* Intersecting Chevron at the bottom */}
        <Path
          d="M40 82 L60 96 L80 82 L77 80 L60 92 L43 80 Z"
          fill="url(#goldGrad)"
          opacity="0.9"
        />
      </G>
    </Svg>
  );
}
