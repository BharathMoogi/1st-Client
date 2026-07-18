"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { auth } from "../../lib/firebase";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@aurumwellness.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) router.replace("/");
    });
    return () => unsub();
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/");
    } catch (err: any) {
      const code = err?.code ?? "";
      if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setError("Incorrect password. Please try again.");
      } else if (code === "auth/user-not-found") {
        setError("No account found for this email.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Please wait and try again.");
      } else {
        setError(err?.message ?? "Login failed.");
      }
    }
    setLoading(false);
  }

  async function handleForgotPassword() {
    if (!email) {
      setError("Enter your email address first, then click Forgot password.");
      return;
    }
    setResetLoading(true);
    setError("");
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (err: any) {
      setError(err?.message ?? "Failed to send reset email.");
    }
    setResetLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[#E0B034]/5 blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#E0B034] flex items-center justify-center text-[#0A0A0A] font-bold text-base shadow-lg shadow-[#E0B034]/30">
              A
            </div>
            <div>
              <p className="text-xl font-light tracking-widest text-[#E0B034]">AURUM</p>
              <p className="text-[10px] tracking-widest text-white/30 font-semibold -mt-0.5">ADMIN PORTAL</p>
            </div>
          </div>
          <p className="text-xs text-white/40 font-light">Sign in to manage your store</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="border border-white/8 rounded-2xl bg-white/[0.02] p-7 space-y-5 backdrop-blur-sm">
          {/* Email */}
          <div>
            <label className="text-[10px] text-white/40 tracking-widest block mb-2 uppercase font-semibold">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#E0B034]/50 focus:bg-white/6 transition-all"
              placeholder="admin@aurumwellness.com"
            />
          </div>

          {/* Password with show/hide toggle */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] text-white/40 tracking-widest uppercase font-semibold">Password</label>
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={resetLoading}
                className="text-[10px] text-[#E0B034]/70 hover:text-[#E0B034] tracking-wide transition-colors disabled:opacity-50"
              >
                {resetLoading ? "Sending…" : "Forgot password?"}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#E0B034]/50 focus:bg-white/6 transition-all"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-[#E0B034] transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-400">
              {error}
            </div>
          )}

          {/* Reset email sent confirmation */}
          {resetSent && (
            <div className="rounded-lg border border-green-500/20 bg-green-500/5 px-4 py-3 text-xs text-green-400">
              ✓ Password reset email sent to <strong>{email}</strong>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#E0B034] text-[#0A0A0A] text-sm font-bold tracking-wider hover:bg-[#FFE082] transition-colors disabled:opacity-50 shadow-lg shadow-[#E0B034]/20 mt-2"
          >
            {loading ? "SIGNING IN…" : "SIGN IN"}
          </button>
        </form>

        <p className="text-center text-[10px] text-white/20 mt-6">
          Peakfuel Admin · Firebase Auth
        </p>
      </div>
    </div>
  );
}
