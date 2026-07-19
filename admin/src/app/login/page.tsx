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
    <div className="min-h-screen bg-[#070707] flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#D4AF37]/3 blur-[120px]" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3.5 mb-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8962D] flex items-center justify-center text-[#070707] font-extrabold text-lg shadow-lg shadow-[#D4AF37]/15">
              A
            </div>
            <div className="text-left">
              <p className="text-xl font-light tracking-[0.25em] text-[#D4AF37] leading-none">AURUM</p>
              <p className="text-[8px] tracking-[0.2em] text-white/30 font-bold mt-1.5">WELLNESS</p>
            </div>
          </div>
          <p className="text-xs text-white/40 font-light tracking-wide">Premium supplements. Tailored performance.</p>
        </div>

        {/* Card */}
        <div className="border border-white/6 rounded-[24px] bg-[#111111]/45 backdrop-blur-md overflow-hidden shadow-2xl shadow-black/80">

          {/* Tabs — Sign In / Create Account */}
          {tab !== "forgot" && (
            <div className="flex border-b border-white/6 bg-white/[0.005]">
              <button
                onClick={() => switchTab("signin")}
                className={`flex-1 py-4 text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-350 ${
                  tab === "signin"
                    ? "text-[#D4AF37] border-b-2 border-[#D4AF37] bg-[#D4AF37]/5"
                    : "text-white/30 hover:text-white/60"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => switchTab("signup")}
                className={`flex-1 py-4 text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-350 ${
                  tab === "signup"
                    ? "text-[#D4AF37] border-b-2 border-[#D4AF37] bg-[#D4AF37]/5"
                    : "text-white/30 hover:text-white/60"
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          <div className="p-8 space-y-4">
            {/* SIGN IN */}
            {tab === "signin" && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="text-[9px] text-white/40 tracking-widest block mb-1.5 uppercase font-bold">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    placeholder="you@email.com"
                    className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-white/15 focus:outline-none focus:border-[#D4AF37]/50 focus:bg-white/6 transition-all" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[9px] text-white/40 tracking-widest uppercase font-bold">Password</label>
                    <button type="button" onClick={() => switchTab("forgot")} className="text-[9px] font-semibold text-[#D4AF37]/75 hover:text-[#FFE082] transition-colors tracking-wide">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                      placeholder="Enter your password"
                      className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-white/15 focus:outline-none focus:border-[#D4AF37]/50 focus:bg-white/6 transition-all" />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} tabIndex={-1}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-[#D4AF37] transition-colors">
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                {error && <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-400 text-center tracking-wide">{error}</div>}
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8962D] text-[#070707] text-xs font-bold tracking-[0.2em] hover:from-[#FFE082] hover:to-[#D4AF37] transition-all disabled:opacity-50 shadow-lg shadow-[#D4AF37]/15 mt-2 uppercase">
                  {loading ? "SIGNING IN…" : "SIGN IN"}
                </button>
              </form>
            )}

            {/* CREATE ACCOUNT */}
            {tab === "signup" && (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label className="text-[9px] text-white/40 tracking-widest block mb-1.5 uppercase font-bold">Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                    placeholder="Your full name"
                    className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-white/15 focus:outline-none focus:border-[#D4AF37]/50 focus:bg-white/6 transition-all" />
                </div>
                <div>
                  <label className="text-[9px] text-white/40 tracking-widest block mb-1.5 uppercase font-bold">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    placeholder="you@email.com"
                    className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-white/15 focus:outline-none focus:border-[#D4AF37]/50 focus:bg-white/6 transition-all" />
                </div>
                <div>
                  <label className="text-[9px] text-white/40 tracking-widest block mb-1.5 uppercase font-bold">Password</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                      placeholder="At least 6 characters"
                      className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-white/15 focus:outline-none focus:border-[#D4AF37]/50 focus:bg-white/6 transition-all" />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} tabIndex={-1}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-[#D4AF37] transition-colors">
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-[9px] text-white/40 tracking-widest block mb-1.5 uppercase font-bold">Confirm Password</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                    placeholder="Repeat your password"
                    className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-white/15 focus:outline-none focus:border-[#D4AF37]/50 focus:bg-white/6 transition-all" />
                </div>
                {error && <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-400 text-center tracking-wide">{error}</div>}
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8962D] text-[#070707] text-xs font-bold tracking-[0.2em] hover:from-[#FFE082] hover:to-[#D4AF37] transition-all disabled:opacity-50 shadow-lg shadow-[#D4AF37]/15 mt-2 uppercase">
                  {loading ? "CREATING…" : "CREATE ACCOUNT"}
                </button>
              </form>
            )}

            {/* FORGOT PASSWORD */}
            {tab === "forgot" && (
              <form onSubmit={handleForgot} className="space-y-4">
                <div>
                  <h3 className="text-base font-light text-[#D4AF37] uppercase tracking-wider mb-1">Reset Password</h3>
                  <p className="text-[10px] text-white/40 mb-5 uppercase tracking-widest leading-relaxed">Enter your email and we'll dispatch a secure recovery link.</p>
                  <label className="text-[9px] text-white/40 tracking-widest block mb-1.5 uppercase font-bold">Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    placeholder="you@email.com"
                    className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-white/15 focus:outline-none focus:border-[#D4AF37]/50 focus:bg-white/6 transition-all" />
                </div>
                {error && <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-400 text-center tracking-wide">{error}</div>}
                {success && <div className="rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3 text-xs text-green-400 text-center tracking-wide">✓ {success}</div>}
                <button type="submit" disabled={loading || !!success}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8962D] text-[#070707] text-xs font-bold tracking-[0.2em] hover:from-[#FFE082] hover:to-[#D4AF37] transition-all disabled:opacity-50 shadow-lg shadow-[#D4AF37]/15 uppercase">
                  {loading ? "SENDING…" : "SEND RESET LINK"}
                </button>
                <button type="button" onClick={() => switchTab("signin")} className="w-full py-2 text-[10px] font-bold text-white/30 hover:text-[#D4AF37] transition-colors uppercase tracking-wider">
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
