"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Tag,
  Star,
  Boxes,
  BarChart3,
  Settings as SettingsIcon,
  Menu,
  X,
} from "lucide-react";
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-[#050505] text-white flex flex-col md:flex-row antialiased overflow-hidden">
        {/* --- MOBILE NAVBAR HEADER --- */}
        <header className="md:hidden flex h-16 items-center justify-between border-b border-white/8 px-6 bg-[#090909] z-20">
          <div className="flex items-center gap-2">
            <span className="text-lg font-light tracking-widest text-[#E0B034]">AURUM</span>
            <span className="text-xs font-semibold text-white/40 tracking-wider">ADMIN</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 rounded-md text-white/70 hover:text-white hover:bg-white/4 focus:outline-none"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* --- SIDEBAR NAV PANEL --- */}
        <aside
          className={`fixed inset-y-0 left-0 transform md:relative md:translate-x-0 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-200 ease-in-out z-30 w-64 border-r border-white/8 bg-[#090909] flex flex-col justify-between h-full`}
        >
          <div>
            {/* Header Identity */}
            <div className="hidden md:flex h-16 items-center px-6 border-b border-white/8 gap-2">
              <span className="text-lg font-light tracking-widest text-[#E0B034]">AURUM</span>
              <span className="text-xs font-semibold text-white/40 tracking-wider">ADMIN</span>
            </div>

            {/* Navigation Lists */}
            <nav className="p-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-light tracking-wide transition-all ${
                      active
                        ? "bg-[#E0B034]/10 text-[#E0B034] border border-[#E0B034]/20"
                        : "text-white/60 hover:text-white hover:bg-white/4 border border-transparent"
                    }`}
                  >
                    <Icon size={18} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Footer User Info */}
          <div className="p-4 border-t border-white/8 flex items-center gap-3 bg-[#070707]">
            <div className="w-9 h-9 rounded-full bg-[#E0B034] flex items-center justify-center text-[#0A0A0A] font-bold text-sm shadow-md shadow-[#E0B034]/25">
              AD
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wide">Admin Director</p>
              <p className="text-[10px] text-white/40">admin@aurumwellness.com</p>
            </div>
          </div>
        </aside>

        {/* Mobile menu overlay backdrop */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 z-10 md:hidden"
          />
        )}

        {/* --- MAIN PAGE VIEWPORT AREA --- */}
        <main className="flex-1 flex flex-col min-h-0 overflow-y-auto relative p-6 md:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
