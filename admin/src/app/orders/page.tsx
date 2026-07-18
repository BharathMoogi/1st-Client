"use client";

import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { supabase } from "../../lib/supabase";

type Order = { id: string; customer: string; product: string; total: number; status: string; date: string; payment: string; address: string };

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Order | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) { setError(error.message); } else { setOrders(data || []); }
      setLoading(false);
    }
    fetchOrders();
  }, []);

  const statusColor = (s: string) => {
    if (s === "Delivered") return "bg-green-500/10 text-green-400 border-green-500/20";
    if (s === "Shipped") return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    if (s === "Pending") return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    if (s === "Cancelled") return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    return "bg-white/5 text-white/40 border-white/10";
  };

  const filtered = orders.filter((o) =>
    o.customer?.toLowerCase().includes(search.toLowerCase()) ||
    o.product?.toLowerCase().includes(search.toLowerCase()) ||
    o.id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-white/8 pb-4">
        <h1 className="text-2xl font-light tracking-wide">Orders</h1>
        <p className="text-xs text-white/40 font-light mt-1">Track and manage all live customer orders</p>
      </div>

      <div className="bg-white/[0.01] border border-white/8 p-4 rounded-xl">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-3 text-white/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders…"
            className="w-full bg-white/4 border border-white/8 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#E0B034]/40" />
        </div>
      </div>

      <div className="rounded-xl border border-white/8 bg-white/[0.01] overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-white/30 text-xs animate-pulse">Loading orders…</div>
        ) : error ? (
          <div className="py-12 text-center text-red-400 text-xs">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-light">
              <thead>
                <tr className="border-b border-white/6 bg-white/[0.01] text-white/40 tracking-wider">
                  <th className="py-3.5 px-6">ORDER ID</th>
                  <th className="py-3.5 px-6">CUSTOMER</th>
                  <th className="py-3.5 px-6">PRODUCT</th>
                  <th className="py-3.5 px-6 text-right">TOTAL</th>
                  <th className="py-3.5 px-6">STATUS</th>
                  <th className="py-3.5 px-6">DATE</th>
                  <th className="py-3.5 px-6 text-right">DETAILS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? filtered.map((o) => (
                  <tr key={o.id} className="border-b border-white/4 hover:bg-white/[0.01] transition-colors">
                    <td className="py-4 px-6 font-mono text-white/50">#{o.id.slice(0, 8)}</td>
                    <td className="py-4 px-6 font-medium text-white">{o.customer || "—"}</td>
                    <td className="py-4 px-6 text-white/60">{o.product || "—"}</td>
                    <td className="py-4 px-6 text-right font-mono text-[#FFE082]">${(o.total || 0).toFixed(2)}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold border ${statusColor(o.status)}`}>{o.status || "—"}</span>
                    </td>
                    <td className="py-4 px-6 text-white/40">{o.date || "—"}</td>
                    <td className="py-4 px-6 text-right">
                      <button onClick={() => setSelected(o)} className="px-2.5 py-1 bg-white/4 border border-white/10 rounded text-[10px] hover:bg-white/8 transition-colors">VIEW</button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={7} className="py-12 text-center text-white/30">No orders found in database.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md border border-white/8 rounded-2xl bg-[#090909] p-6 space-y-4">
            <h3 className="text-lg font-light text-[#FFE082]">Order Details</h3>
            <div className="space-y-2 text-xs">
              {[
                ["Order ID", `#${selected.id.slice(0, 8)}`],
                ["Customer", selected.customer],
                ["Product", selected.product],
                ["Total", `$${(selected.total || 0).toFixed(2)}`],
                ["Status", selected.status],
                ["Payment", selected.payment],
                ["Address", selected.address],
                ["Date", selected.date],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-white/4 pb-2">
                  <span className="text-white/40">{label}</span>
                  <span className="text-white font-medium">{value || "—"}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setSelected(null)} className="w-full py-2 text-xs border border-white/10 rounded-lg hover:bg-white/4 font-semibold text-white/80 transition-colors">CLOSE</button>
          </div>
        </div>
      )}
    </div>
  );
}
