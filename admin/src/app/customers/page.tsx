"use client";
import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { db } from "../../lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

type Customer = { id: string; name: string; email: string; tier: string; points: number; spend: number; orders: number };

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      try {
        const snap = await getDocs(collection(db, "profiles"));
        setCustomers(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Customer)));
      } catch (e: any) { setError(e.message); }
      setLoading(false);
    }
    fetch();
  }, []);

  const tierColor = (t: string) => {
    if (t === "VIP Platinum") return "bg-purple-500/10 text-purple-300 border-purple-500/20";
    if (t === "VIP Gold") return "bg-[#D4AF37]/10 text-[#FFE082] border-[#D4AF37]/20";
    return "bg-white/5 text-white/40 border-white/10";
  };

  const filtered = customers.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="border-b border-white/6 pb-6">
        <h1 className="text-3xl font-light tracking-wide text-white">CUSTOMERS</h1>
        <p className="text-xs text-white/40 mt-1.5 uppercase tracking-wider">Registered members from Firestore profiles</p>
      </div>

      <div className="glass-panel p-5 shadow-xl shadow-black/40">
        <div className="relative w-80">
          <Search size={14} className="absolute left-4 top-3.5 text-white/30"/>
          <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search members by name or email…" className="w-full bg-white/4 border border-white/6 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#D4AF37]/50 focus:bg-white/6 transition-all" />
        </div>
      </div>

      <div className="glass-panel overflow-hidden shadow-2xl shadow-black/50">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-2 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
            <div className="text-white/30 text-xs tracking-wider">LOADING MEMBERS…</div>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-red-400 text-xs tracking-wide">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-light">
              <thead>
                <tr className="border-b border-white/6 bg-white/[0.005] text-white/40 tracking-[0.12em] uppercase">
                  <th className="py-4 px-6 font-semibold">NAME</th>
                  <th className="py-4 px-6 font-semibold">EMAIL</th>
                  <th className="py-4 px-6 font-semibold">MEMBERSHIP</th>
                  <th className="py-4 px-6 text-right font-semibold">POINTS</th>
                  <th className="py-4 px-6 text-right font-semibold">TOTAL SPEND</th>
                  <th className="py-4 px-6 text-right font-semibold">ORDERS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? filtered.map((c) => (
                  <tr key={c.id} className="border-b border-white/4 hover:bg-white/[0.01] transition-colors duration-200">
                    <td className="py-4 px-6 font-medium text-white text-sm">{c.name||"—"}</td>
                    <td className="py-4 px-6 text-white/60">{c.email||"—"}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold border ${tierColor(c.tier)}`}>
                        {c.tier||"Member"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-[#D4AF37] font-medium">{(c.points||0).toLocaleString()}</td>
                    <td className="py-4 px-6 text-right font-mono text-white font-medium">₹{(c.spend||0).toFixed(2)}</td>
                    <td className="py-4 px-6 text-right font-mono text-white/40 font-medium">{c.orders??0}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-white/30 tracking-wider">No customers in Firestore yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
