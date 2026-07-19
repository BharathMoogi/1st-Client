"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, ShoppingBag, Package, Users,
  Tag, Star, Boxes, BarChart3,
  Settings as SettingsIcon, Menu, X, LogOut,
} from "lucide-react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import "./globals.css";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Products", href: "/products", icon: ShoppingBag },
  { name: "Orders", href: "/orders", icon: Package },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Coupons", href: "/coupons", icon: Tag },
  { name: "Reviews", href: "/reviews", icon: Star },
  { name: "Inventory", href: "/inventory", icon: Boxes },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: SettingsIcon },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
      if (!u) router.replace("/login");
    });
    return () => unsub();
  }, [router]);

  async function handleSignOut() {
    await signOut(auth);
    router.replace("/login");
  }

  // Get initials from email
  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "AD";

  // Show nothing while checking auth (avoid flash)
  if (authLoading) {
    return (
      <html lang="en" className="h-full">
        <body className="h-full bg-[#050505] flex items-center justify-center">
          <div className="text-[#E0B034] text-xs tracking-widest animate-pulse">AUTHENTICATING…</div>
        </body>
      </html>
    );
  }

  // If not logged in, render children (login page)
  if (!user) {
    return (
      <html lang="en" className="h-full">
        <body className="h-full bg-[#050505] text-white antialiased">{children}</body>
      </html>
    );
  }

  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-[#070707] text-white flex flex-col md:flex-row antialiased overflow-hidden">
        {/* MOBILE NAVBAR */}
        <header className="md:hidden flex h-16 items-center justify-between border-b border-white/6 px-6 bg-[#0c0c0c] z-20">
          <div className="flex items-center gap-2">
            <span className="text-lg font-light tracking-widest text-[#D4AF37]">AURUM</span>
            <span className="text-[10px] font-bold text-white/30 tracking-wider">ADMIN</span>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/4">
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        {/* SIDEBAR */}
        <aside className={`fixed inset-y-0 left-0 transform md:relative md:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-out z-30 w-64 p-4 flex flex-col justify-between h-full bg-[#070707] shrink-0`}>
          <div className="glass-panel h-full flex flex-col justify-between overflow-hidden shadow-2xl shadow-black/80">
            <div>
              {/* Brand Identity */}
              <div className="h-20 flex items-center px-6 border-b border-white/6 gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#B8962D] flex items-center justify-center text-[#070707] font-extrabold text-sm shadow-md shadow-[#D4AF37]/20">
                  A
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-light tracking-[0.25em] text-[#D4AF37] leading-none">AURUM</span>
                  <span className="text-[8px] font-bold text-white/30 tracking-[0.2em] mt-1">ADMIN PORTAL</span>
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-220px)]">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link key={item.name} href={item.href} onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium tracking-wider transition-all duration-300 ${
                        active
                          ? "bg-[#D4AF37]/8 text-[#D4AF37] border border-[#D4AF37]/20 shadow-[0_0_15px_rgba(212,175,55,0.05)]"
                          : "text-white/40 hover:text-white/80 hover:bg-white/[0.03] border border-transparent"
                      }`}>
                      <Icon size={16} className={active ? "text-[#D4AF37]" : "text-white/40"} />
                      {item.name.toUpperCase()}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Footer User Info */}
            <div className="p-4 border-t border-white/6 bg-white/[0.01]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8962D] flex items-center justify-center text-[#070707] font-bold text-xs shadow-md shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold tracking-wide text-white truncate">Admin Director</p>
                  <p className="text-[9px] text-white/40 truncate">{user.email}</p>
                </div>
                <button onClick={handleSignOut} title="Sign out"
                  className="p-1.5 rounded-lg hover:bg-rose-500/10 text-white/20 hover:text-rose-400 transition-colors shrink-0">
                  <LogOut size={14} />
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile menu overlay backdrop */}
        {mobileMenuOpen && (
          <div onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-10 md:hidden" />
        )}

        {/* MAIN PAGE VIEWPORT AREA */}
        <main className="flex-1 flex flex-col min-h-0 overflow-y-auto relative p-6 md:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
