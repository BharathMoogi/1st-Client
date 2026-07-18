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
      <body className="h-full bg-[#050505] text-white flex flex-col md:flex-row antialiased overflow-hidden">
        {/* MOBILE NAVBAR */}
        <header className="md:hidden flex h-16 items-center justify-between border-b border-white/8 px-6 bg-[#090909] z-20">
          <div className="flex items-center gap-2">
            <span className="text-lg font-light tracking-widest text-[#E0B034]">AURUM</span>
            <span className="text-xs font-semibold text-white/40 tracking-wider">ADMIN</span>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1 rounded-md text-white/70 hover:text-white hover:bg-white/4">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* SIDEBAR */}
        <aside className={`fixed inset-y-0 left-0 transform md:relative md:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-200 ease-in-out z-30 w-64 border-r border-white/8 bg-[#090909] flex flex-col justify-between h-full`}>
          <div>
            {/* Brand */}
            <div className="hidden md:flex h-16 items-center px-6 border-b border-white/8 gap-2">
              <span className="text-lg font-light tracking-widest text-[#E0B034]">AURUM</span>
              <span className="text-xs font-semibold text-white/40 tracking-wider">ADMIN</span>
            </div>

            {/* Nav */}
            <nav className="p-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link key={item.name} href={item.href} onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-light tracking-wide transition-all ${
                      active
                        ? "bg-[#E0B034]/10 text-[#E0B034] border border-[#E0B034]/20"
                        : "text-white/60 hover:text-white hover:bg-white/4 border border-transparent"
                    }`}>
                    <Icon size={18} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Footer — Real Firebase User */}
          <div className="p-4 border-t border-white/8 bg-[#070707]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#E0B034] flex items-center justify-center text-[#0A0A0A] font-bold text-sm shadow-md shadow-[#E0B034]/25 shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold tracking-wide truncate">Admin Director</p>
                <p className="text-[10px] text-white/40 truncate">{user.email}</p>
              </div>
              <button onClick={handleSignOut} title="Sign out"
                className="p-1.5 rounded-lg hover:bg-rose-500/10 text-white/30 hover:text-rose-400 transition-colors shrink-0">
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile overlay */}
        {mobileMenuOpen && (
          <div onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 bg-black/60 z-10 md:hidden" />
        )}

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col min-h-0 overflow-y-auto relative p-6 md:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
