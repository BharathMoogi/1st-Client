"use client";
import React, { useEffect, useState } from "react";
import { Search, AlertTriangle } from "lucide-react";
import { db } from "../../lib/firebase";
import { collection, getDocs, updateDoc, doc, query, orderBy } from "firebase/firestore";

type Item = { id: string; name: string; stock: number; reserved: number; min_threshold: number; status: string };

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      try {
        const snap = await getDocs(query(collection(db, "inventory"), orderBy("name")));
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Item)));
      } catch (e: any) { setError(e.message); }
      setLoading(false);
    }
    fetch();
  }, []);

  async function handleStockChange(id: string, newStock: number) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const status = newStock === 0 ? "Out of Stock" : newStock <= (item.min_threshold || 0) ? "Low Stock" : "In Stock";
    await updateDoc(doc(db, "inventory", id), { stock: newStock, status });
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, stock: newStock, status } : i));
  }

  const statusColor = (s: string) => {
    if (s === "In Stock") return "bg-[#2ECC71]/10 text-[#2ECC71] border-[#2ECC71]/20";
    if (s === "Low Stock") return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    return "bg-[#FF4D4F]/10 text-[#FF4D4F] border-[#FF4D4F]/20";
  };

  const filtered = items.filter((i) => i.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8 pb-12">
      <div className="border-b border-white/6 pb-6">
        <h1 className="text-3xl font-light tracking-wide text-white">INVENTORY</h1>
        <p className="text-xs text-white/40 mt-1.5 uppercase tracking-wider">Live warehouse data from Firestore</p>
      </div>

      <div className="glass-panel p-5 shadow-xl shadow-black/40">
        <div className="relative w-80">
          <Search size={14} className="absolute left-4 top-3.5 text-white/30"/>
          <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search inventory items…" className="w-full bg-white/4 border border-white/6 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#D4AF37]/50 focus:bg-white/6 transition-all" />
        </div>
      </div>

      <div className="glass-panel overflow-hidden shadow-2xl shadow-black/50">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-2 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
            <div className="text-white/30 text-xs tracking-wider">LOADING WAREHOUSE STOCK…</div>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-red-400 text-xs tracking-wide">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-light">
              <thead>
                <tr className="border-b border-white/6 bg-white/[0.005] text-white/40 tracking-[0.12em] uppercase">
                  <th className="py-4 px-6 font-semibold">PRODUCT</th>
                  <th className="py-4 px-6 text-right font-semibold">STOCK</th>
                  <th className="py-4 px-6 text-right font-semibold">RESERVED</th>
                  <th className="py-4 px-6 text-right font-semibold">MIN SAFETY</th>
                  <th className="py-4 px-6 font-semibold">STATUS</th>
                  <th className="py-4 px-6 text-right font-semibold">ADJUST</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? filtered.map((item) => (
                  <tr key={item.id} className="border-b border-white/4 hover:bg-white/[0.01] transition-colors duration-200">
                    <td className="py-4 px-6 font-medium text-white text-sm flex items-center gap-2">
                      {(item.stock||0)<=(item.min_threshold||0)&&<AlertTriangle size={12} className="text-[#D4AF37]"/>}
                      {item.name}
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-semibold text-white text-sm">{item.stock??0} units</td>
                    <td className="py-4 px-6 text-right font-mono text-white/50">{item.reserved??0} units</td>
                    <td className="py-4 px-6 text-right font-mono text-white/30">{item.min_threshold??0} units</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold border ${statusColor(item.status)}`}>
                        {item.status||"—"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <input type="number" defaultValue={item.stock??0} onBlur={(e)=>handleStockChange(item.id,parseInt(e.target.value)||0)} className="w-20 bg-white/4 border border-white/8 rounded-xl px-3 py-1.5 text-center font-mono text-xs text-white focus:outline-none focus:border-[#D4AF37]/50 focus:bg-white/6 transition-all"/>
                        <span className="text-[9px] text-[#D4AF37] uppercase tracking-wider font-semibold">Auto Save</span>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-white/30 tracking-wider">No inventory items in Firestore yet.</td>
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
