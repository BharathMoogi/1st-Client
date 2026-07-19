"use client";

import React, { useEffect, useState } from "react";
import { DollarSign, ShoppingBag, Users, Tag } from "lucide-react";
import { db } from "../lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

type Order = { id: string; total: number; status: string; customer: string; createdAt: string; product: string };
type Stats = { revenue: number; orders: number; members: number; coupons: number };

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ revenue: 0, orders: 0, members: 0, coupons: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const [ordersSnap, membersSnap, couponsSnap] = await Promise.all([
          getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(10))),
          getDocs(collection(db, "profiles")),
          getDocs(collection(db, "coupons")),
        ]);

        const orders = ordersSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as Order[];
        const revenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
        const activeCoupons = couponsSnap.docs.filter((d) => d.data().status === "Active").length;

        setStats({ revenue, orders: ordersSnap.size, members: membersSnap.size, coupons: activeCoupons });
        setRecentOrders(orders);
      } catch (err: any) {
        setError(err?.message ?? "Failed to load dashboard. Check Firestore rules.");
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  const statusColor = (s: string) => {
    if (s === "Delivered") return "bg-green-500/10 text-green-400 border-green-500/20";
    if (s === "Shipped") return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    if (s === "Pending") return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    return "bg-rose-500/10 text-rose-400 border-rose-500/20";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="w-10 h-10 border-2 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
        <div className="text-white/40 text-[10px] tracking-[0.2em] uppercase">Loading Dashboard Metrics…</div>
      </div>
    );
  }

  if (error) return <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-red-400 text-xs tracking-wide">{error}</div>;

  const statCards = [
    { label: "Total Revenue", value: `₹${stats.revenue.toLocaleString()}`, icon: DollarSign },
    { label: "Active Orders", value: stats.orders.toString(), icon: ShoppingBag },
    { label: "Members", value: stats.members.toString(), icon: Users },
    { label: "Active Coupons", value: stats.coupons.toString(), icon: Tag },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="border-b border-white/6 pb-6">
        <h1 className="text-3xl font-light tracking-wide text-white">DASHBOARD</h1>
        <p className="text-xs text-white/40 font-light mt-1.5 uppercase tracking-wider">Real-time store performance overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="glass-panel luxury-card p-6 space-y-4 shadow-xl shadow-black/40">
              <div className="flex justify-between items-start">
                <p className="text-[9px] tracking-[0.2em] text-white/40 uppercase font-bold">{card.label}</p>
                <div className="p-2 rounded-xl bg-[#D4AF37]/8"><Icon size={14} className="text-[#D4AF37]" /></div>
              </div>
              <p className="text-3xl font-light text-white tracking-wide">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="glass-panel overflow-hidden shadow-2xl shadow-black/50">
        <div className="border-b border-white/6 p-5 flex justify-between items-center bg-white/[0.01]">
          <h3 className="text-xs font-semibold text-[#D4AF37] tracking-[0.15em] uppercase">Recent Orders</h3>
          <span className="text-[9px] text-white/30 uppercase tracking-widest font-mono">Firebase Live</span>
        </div>
        {recentOrders.length === 0 ? (
          <div className="py-16 text-center text-white/30 text-xs tracking-wider">No orders found. Add data to your Firestore <code>orders</code> collection.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-light">
              <thead>
                <tr className="border-b border-white/6 text-white/40 tracking-[0.12em] bg-white/[0.005] uppercase">
                  <th className="py-4 px-6 font-semibold">ORDER ID</th>
                  <th className="py-4 px-6 font-semibold">CUSTOMER</th>
                  <th className="py-4 px-6 font-semibold">PRODUCT</th>
                  <th className="py-4 px-6 text-right font-semibold">TOTAL</th>
                  <th className="py-4 px-6 font-semibold">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-white/4 hover:bg-white/[0.01] transition-colors duration-200">
                    <td className="py-4 px-6 font-mono text-white/40">#{order.id.slice(-8).toUpperCase()}</td>
                    <td className="py-4 px-6 text-white font-medium">{order.customer || "—"}</td>
                    <td className="py-4 px-6 text-white/60">{order.product || "—"}</td>
                    <td className="py-4 px-6 text-right font-mono text-[#D4AF37] font-medium">₹{(Number(order.total) || 0).toFixed(2)}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold border ${statusColor(order.status)}`}>
                        {order.status || "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
