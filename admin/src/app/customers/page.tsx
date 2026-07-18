"use client";

import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { supabase } from "../../lib/supabase";

type Customer = { id: string; name: string; email: string; tier: string; points: number; spend: number; orders: number };

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCustomers() {
      const { data, error } = await supabase.from("profiles").select("*").order("spend", { ascending: false });
      if (error) { setError(error.message); } else { setCustomers(data || []); }
      setLoading(false);
    }
    fetchCustomers();
  }, []);

  const tierColor = (tier: string) => {
    if (tier === "VIP Platinum") return "bg-purple-500/10 text-purple-300 border-purple-500/20";
    if (tier === "VIP Gold") return "bg-[#E0B034]/10 text-[#FFE082] border-[#E0B034]/20";
    return "bg-white/5 text-white/40 border-white/10";
  };

  const filtered = customers.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-white/8 pb-4">
        <h1 className="text-2xl font-light tracking-wide">Customers</h1>
        <p className="text-xs text-white/40 font-light mt-1">View all registered members and VIP tiers</p>
      </div>

      <div className="bg-white/[0.01] border border-white/8 p-4 rounded-xl">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-3 text-white/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers…"
            className="w-full bg-white/4 border border-white/8 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#E0B034]/40" />
        </div>
      </div>

      <div className="rounded-xl border border-white/8 bg-white/[0.01] overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-white/30 text-xs animate-pulse">Loading customers…</div>
        ) : error ? (
          <div className="py-12 text-center text-red-400 text-xs">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-light">
              <thead>
                <tr className="border-b border-white/6 bg-white/[0.01] text-white/40 tracking-wider">
                  <th className="py-3.5 px-6">NAME</th>
                  <th className="py-3.5 px-6">EMAIL</th>
                  <th className="py-3.5 px-6">MEMBERSHIP</th>
                  <th className="py-3.5 px-6 text-right">POINTS</th>
                  <th className="py-3.5 px-6 text-right">TOTAL SPEND</th>
                  <th className="py-3.5 px-6 text-right">ORDERS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? filtered.map((c) => (
                  <tr key={c.id} className="border-b border-white/4 hover:bg-white/[0.01] transition-colors">
                    <td className="py-4 px-6 font-medium text-white">{c.name || "—"}</td>
                    <td className="py-4 px-6 text-white/60">{c.email || "—"}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold border ${tierColor(c.tier)}`}>{c.tier || "Member"}</span>
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-[#FFE082]">{(c.points || 0).toLocaleString()}</td>
                    <td className="py-4 px-6 text-right font-mono text-white">${(c.spend || 0).toFixed(2)}</td>
                    <td className="py-4 px-6 text-right font-mono text-white/60">{c.orders ?? "—"}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="py-12 text-center text-white/30">No customers found in database.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
