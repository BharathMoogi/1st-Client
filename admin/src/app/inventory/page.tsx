"use client";

import React, { useEffect, useState } from "react";
import { Search, AlertTriangle } from "lucide-react";
import { supabase } from "../../lib/supabase";

type InventoryItem = { id: string; name: string; stock: number; reserved: number; min_threshold: number; status: string };

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchInventory(); }, []);

  async function fetchInventory() {
    const { data, error } = await supabase.from("inventory").select("*").order("name");
    if (error) { setError(error.message); } else { setItems(data || []); }
    setLoading(false);
  }

  async function handleStockChange(id: string, newStock: number) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const status = newStock === 0 ? "Out of Stock" : newStock <= item.min_threshold ? "Low Stock" : "In Stock";
    await supabase.from("inventory").update({ stock: newStock, status }).eq("id", id);
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, stock: newStock, status } : i));
  }

  const statusColor = (s: string) => {
    if (s === "In Stock") return "bg-green-500/10 text-green-400 border-green-500/20";
    if (s === "Low Stock") return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    return "bg-rose-500/10 text-rose-400 border-rose-500/20";
  };

  const filtered = items.filter((i) => i.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-white/8 pb-4">
        <h1 className="text-2xl font-light tracking-wide">Inventory</h1>
        <p className="text-xs text-white/40 font-light mt-1">Monitor warehouse stocks, reserved items and low-stock warnings</p>
      </div>

      <div className="bg-white/[0.01] border border-white/8 p-4 rounded-xl">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-3 text-white/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search warehouse stock…"
            className="w-full bg-white/4 border border-white/8 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#E0B034]/40" />
        </div>
      </div>

      <div className="rounded-xl border border-white/8 bg-white/[0.01] overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-white/30 text-xs animate-pulse">Loading inventory…</div>
        ) : error ? (
          <div className="py-12 text-center text-red-400 text-xs">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-light">
              <thead>
                <tr className="border-b border-white/6 bg-white/[0.01] text-white/40 tracking-wider">
                  <th className="py-3.5 px-6">PRODUCT</th>
                  <th className="py-3.5 px-6 text-right">STOCK</th>
                  <th className="py-3.5 px-6 text-right">RESERVED</th>
                  <th className="py-3.5 px-6 text-right">MIN SAFETY</th>
                  <th className="py-3.5 px-6">STATUS</th>
                  <th className="py-3.5 px-6 text-right">ADJUST</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? filtered.map((item) => (
                  <tr key={item.id} className="border-b border-white/4 hover:bg-white/[0.01] transition-colors">
                    <td className="py-4 px-6 font-medium text-white flex items-center gap-2">
                      {(item.stock || 0) <= (item.min_threshold || 0) && <AlertTriangle size={12} className="text-amber-400" />}
                      {item.name}
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-semibold text-white">{item.stock ?? 0} units</td>
                    <td className="py-4 px-6 text-right font-mono text-white/50">{item.reserved ?? 0} units</td>
                    <td className="py-4 px-6 text-right font-mono text-white/30">{item.min_threshold ?? 0} units</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold border ${statusColor(item.status)}`}>{item.status || "—"}</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <input type="number" defaultValue={item.stock ?? 0}
                          onBlur={(e) => handleStockChange(item.id, parseInt(e.target.value) || 0)}
                          className="w-16 bg-white/4 border border-white/8 rounded px-2 py-1 text-center font-mono text-xs text-white focus:outline-none focus:border-[#E0B034]/40" />
                        <span className="text-[10px] text-white/30">Auto Save</span>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="py-12 text-center text-white/30">No inventory items found in database.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
