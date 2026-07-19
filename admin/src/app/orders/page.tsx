"use client";
import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { db } from "../../lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

type Order = { id: string; customer: string; product: string; total: number; status: string; date: string; payment: string; address: string };

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Order | null>(null);

  useEffect(() => {
    async function fetch() {
      try {
        const snap = await getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc")));
        setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order)));
      } catch (e: any) { setError(e.message); }
      setLoading(false);
    }
    fetch();
  }, []);

  const statusColor = (s: string) => {
    if (s === "Delivered") return "bg-green-500/10 text-green-400 border-green-500/20";
    if (s === "Shipped") return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    if (s === "Pending") return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    return "bg-rose-500/10 text-rose-400 border-rose-500/20";
  };

  const filtered = orders.filter((o) =>
    o.customer?.toLowerCase().includes(search.toLowerCase()) ||
    o.product?.toLowerCase().includes(search.toLowerCase()) ||
    o.id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="border-b border-white/6 pb-6">
        <h1 className="text-3xl font-light tracking-wide text-white">ORDERS</h1>
        <p className="text-xs text-white/40 mt-1.5 uppercase tracking-wider">Live orders from Firestore</p>
      </div>

      <div className="glass-panel p-5 shadow-xl shadow-black/40">
        <div className="relative w-80">
          <Search size={14} className="absolute left-4 top-3.5 text-white/30"/>
          <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search orders by ID or customer…" className="w-full bg-white/4 border border-white/6 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#D4AF37]/50 focus:bg-white/6 transition-all" />
        </div>
      </div>

      <div className="glass-panel overflow-hidden shadow-2xl shadow-black/50">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-2 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
            <div className="text-white/30 text-xs tracking-wider">LOADING ORDERS…</div>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-red-400 text-xs tracking-wide">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-light">
              <thead>
                <tr className="border-b border-white/6 bg-white/[0.005] text-white/40 tracking-[0.12em] uppercase">
                  <th className="py-4 px-6 font-semibold">ORDER ID</th>
                  <th className="py-4 px-6 font-semibold">CUSTOMER</th>
                  <th className="py-4 px-6 font-semibold">PRODUCT</th>
                  <th className="py-4 px-6 text-right font-semibold">TOTAL</th>
                  <th className="py-4 px-6 font-semibold">STATUS</th>
                  <th className="py-4 px-6 font-semibold">DATE</th>
                  <th className="py-4 px-6 text-right font-semibold">DETAILS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? filtered.map((o) => (
                  <tr key={o.id} className="border-b border-white/4 hover:bg-white/[0.01] transition-colors duration-200">
                    <td className="py-4 px-6 font-mono text-white/40">#{o.id.slice(-8).toUpperCase()}</td>
                    <td className="py-4 px-6 font-medium text-white">{o.customer||"—"}</td>
                    <td className="py-4 px-6 text-white/60">{o.product||"—"}</td>
                    <td className="py-4 px-6 text-right font-mono text-[#D4AF37] font-semibold text-sm">₹{(Number(o.total)||0).toFixed(2)}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold border ${statusColor(o.status)}`}>
                        {o.status||"—"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-white/40 font-medium">{o.date||"—"}</td>
                    <td className="py-4 px-6 text-right">
                      <button onClick={()=>setSelected(o)} className="px-3 py-1.5 bg-white/4 border border-white/8 rounded-xl text-[10px] font-semibold text-white/80 hover:bg-white/8 transition-all uppercase tracking-wider">
                        VIEW
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-white/30 tracking-wider">No orders in Firestore yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md border border-white/8 rounded-[24px] bg-[#0c0c0c] p-7 space-y-5 shadow-2xl shadow-black">
            <div>
              <h3 className="text-lg font-light text-[#D4AF37] tracking-wider uppercase">Order Details</h3>
              <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">Receipt & Delivery Metadata</p>
            </div>
            <div className="space-y-2 text-xs">
              {[
                ["Order ID", `#${selected.id.toUpperCase()}`],
                ["Customer", selected.customer],
                ["Product", selected.product],
                ["Total Amount", `₹${(Number(selected.total)||0).toFixed(2)}`],
                ["Status", selected.status],
                ["Payment Mode", selected.payment],
                ["Delivery Address", selected.address],
                ["Order Date", selected.date]
              ].map(([l,v])=>(
                <div key={l} className="flex justify-between border-b border-white/4 pb-2.5">
                  <span className="text-white/40 font-medium uppercase tracking-wider text-[9px]">{l}</span>
                  <span className="text-white font-semibold text-right max-w-xs">{v||"—"}</span>
                </div>
              ))}
            </div>
            <button onClick={()=>setSelected(null)} className="w-full py-3 text-xs border border-white/10 rounded-xl hover:bg-white/4 font-bold text-white/60 tracking-wider transition-all uppercase mt-2">
              CLOSE RECEIPT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
