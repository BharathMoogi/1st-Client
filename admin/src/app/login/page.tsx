"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { auth } from "../../lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "firebase/auth";

type Tab = "signin" | "signup" | "forgot";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) router.replace("/");
    });
    return () => unsub();
  }, [router]);

  const switchTab = (t: Tab) => {
    setTab(t);
    setError("");
    setSuccess("");
    setPassword("");
    setConfirmPassword("");
  };

  const friendlyError = (code: string) => {
    if (code === "auth/wrong-password" || code === "auth/invalid-credential") return "Incorrect password. Please try again.";
    if (code === "auth/user-not-found") return "No account found with this email.";
    if (code === "auth/email-already-in-use") return "An account with this email already exists.";
    if (code === "auth/weak-password") return "Password must be at least 6 characters.";
    if (code === "auth/invalid-email") return "Please enter a valid email address.";
    if (code === "auth/too-many-requests") return "Too many attempts. Please wait and try again.";
    return "Something went wrong. Please try again.";
  };

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/");
    } catch (err: any) {
      setError(friendlyError(err?.code ?? ""));
    }
    setLoading(false);
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setError(""); setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/");
    } catch (err: any) {
      setError(friendlyError(err?.code ?? ""));
    }
    setLoading(false);
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccess(`Reset link sent to ${email}`);
    } catch (err: any) {
      setError(friendlyError(err?.code ?? ""));
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#E0B034]/4 blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#E0B034] to-[#C08A18] flex items-center justify-center text-[#0A0A0A] font-bold text-lg shadow-lg shadow-[#E0B034]/30">
              A
            </div>
            <div className="text-left">
              <p className="text-xl font-light tracking-widest text-[#E0B034] leading-none">AURUM</p>
              <p className="text-[9px] tracking-[0.2em] text-white/30 font-semibold">WELLNESS</p>
            </div>
          </div>
          <p className="text-xs text-white/40 font-light">Premium supplements. Delivered.</p>
        </div>

        {/* Card */}
        <div className="border border-white/8 rounded-2xl bg-white/[0.02] backdrop-blur-sm overflow-hidden">

          {/* Tabs — Sign In / Create Account */}
          {tab !== "forgot" && (
            <div className="flex border-b border-white/8">
              <button
                onClick={() => switchTab("signin")}
                className={`flex-1 py-3.5 text-xs font-semibold tracking-widest uppercase transition-all ${
                  tab === "signin"
                    ? "text-[#E0B034] border-b-2 border-[#E0B034] bg-[#E0B034]/5"
                    : "text-white/30 hover:text-white/60"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => switchTab("signup")}
                className={`flex-1 py-3.5 text-xs font-semibold tracking-widest uppercase transition-all ${
                  tab === "signup"
                    ? "text-[#E0B034] border-b-2 border-[#E0B034] bg-[#E0B034]/5"
                    : "text-white/30 hover:text-white/60"
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          <div className="p-7 space-y-4">
            {/* SIGN IN */}
            {tab === "signin" && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="text-[10px] text-white/40 tracking-widest block mb-1.5 uppercase font-semibold">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    placeholder="you@email.com"
                    className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#E0B034]/50 transition-all" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[10px] text-white/40 tracking-widest uppercase font-semibold">Password</label>
                    <button type="button" onClick={() => switchTab("forgot")} className="text-[10px] text-[#E0B034]/70 hover:text-[#E0B034] transition-colors">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                      placeholder="Enter your password"
                      className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#E0B034]/50 transition-all" />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} tabIndex={-1}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-[#E0B034] transition-colors">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                {error && <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-xs text-red-400 text-center">{error}</div>}
                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#E0B034] to-[#C08A18] text-[#0A0A0A] text-xs font-bold tracking-[0.15em] hover:from-[#FFE082] hover:to-[#E0B034] transition-all disabled:opacity-50 shadow-lg shadow-[#E0B034]/20 mt-1">
                  {loading ? "SIGNING IN…" : "SIGN IN"}
                </button>
              </form>
            )}

            {/* CREATE ACCOUNT */}
            {tab === "signup" && (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label className="text-[10px] text-white/40 tracking-widest block mb-1.5 uppercase font-semibold">Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                    placeholder="Your full name"
                    className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#E0B034]/50 transition-all" />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 tracking-widest block mb-1.5 uppercase font-semibold">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    placeholder="you@email.com"
                    className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#E0B034]/50 transition-all" />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 tracking-widest block mb-1.5 uppercase font-semibold">Password</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                      placeholder="At least 6 characters"
                      className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#E0B034]/50 transition-all" />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} tabIndex={-1}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-[#E0B034] transition-colors">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-white/40 tracking-widest block mb-1.5 uppercase font-semibold">Confirm Password</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                    placeholder="Repeat your password"
                    className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#E0B034]/50 transition-all" />
                </div>
                {error && <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-xs text-red-400 text-center">{error}</div>}
                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#E0B034] to-[#C08A18] text-[#0A0A0A] text-xs font-bold tracking-[0.15em] hover:from-[#FFE082] hover:to-[#E0B034] transition-all disabled:opacity-50 shadow-lg shadow-[#E0B034]/20 mt-1">
                  {loading ? "CREATING…" : "CREATE ACCOUNT"}
                </button>
              </form>
            )}

            {/* FORGOT PASSWORD */}
            {tab === "forgot" && (
              <form onSubmit={handleForgot} className="space-y-4">
                <div>
                  <h3 className="text-base font-light text-white mb-1">Reset Password</h3>
                  <p className="text-xs text-white/40 mb-4">Enter your email and we'll send a reset link.</p>
                  <label className="text-[10px] text-white/40 tracking-widest block mb-1.5 uppercase font-semibold">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    placeholder="you@email.com"
                    className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#E0B034]/50 transition-all" />
                </div>
                {error && <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-xs text-red-400 text-center">{error}</div>}
                {success && <div className="rounded-lg border border-green-500/20 bg-green-500/5 px-4 py-2.5 text-xs text-green-400 text-center">✓ {success}</div>}
                <button type="submit" disabled={loading || !!success}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#E0B034] to-[#C08A18] text-[#0A0A0A] text-xs font-bold tracking-[0.15em] hover:from-[#FFE082] hover:to-[#E0B034] transition-all disabled:opacity-50 shadow-lg shadow-[#E0B034]/20">
                  {loading ? "SENDING…" : "SEND RESET LINK"}
                </button>
                <button type="button" onClick={() => switchTab("signin")} className="w-full py-2 text-xs text-white/40 hover:text-[#E0B034] transition-colors">
                  ← Back to Sign In
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-[10px] text-white/15 mt-5">
          Aurum Wellness · Powered by Firebase
        </p>
      </div>
    </div>
  );
}
