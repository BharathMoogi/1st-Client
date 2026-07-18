"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../lib/firebase";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@aurumwellness.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect immediately
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

          <div>
            <label className="text-[10px] text-white/40 tracking-widest block mb-2 uppercase font-semibold">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#E0B034]/50 focus:bg-white/6 transition-all"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-400">
              {error}
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
