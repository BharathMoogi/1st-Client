"use client";

import React, { useEffect, useState } from "react";
import { DollarSign, ShoppingBag, Users, Tag } from "lucide-react";
import { supabase } from "../lib/supabase";

// ---- TYPES ----
type Order = { id: string; total: number; status: string; customer: string; created_at: string; product: string };
type Stats = { revenue: number; orders: number; members: number; coupons: number };

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ revenue: 0, orders: 0, members: 0, coupons: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const [ordersRes, membersRes, couponsRes] = await Promise.all([
          supabase.from("orders").select("id, total, status, customer, created_at, product").order("created_at", { ascending: false }).limit(10),
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("coupons").select("id", { count: "exact", head: true }).eq("status", "Active"),
        ]);

        if (ordersRes.error) throw ordersRes.error;

        const orders: Order[] = ordersRes.data || [];
        const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

        setStats({
          revenue,
          orders: orders.length,
          members: membersRes.count ?? 0,
          coupons: couponsRes.count ?? 0,
        });
        setRecentOrders(orders);
      } catch (err: any) {
        setError(err?.message ?? "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <div className="animate-pulse text-[#E0B034] text-sm tracking-widest">Loading dashboard…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-red-400 text-sm">
        {error}
      </div>
    );
  }

  const statCards = [
    { label: "Total Revenue", value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign },
    { label: "Active Orders", value: stats.orders.toString(), icon: ShoppingBag },
    { label: "Members", value: stats.members.toString(), icon: Users },
    { label: "Active Coupons", value: stats.coupons.toString(), icon: Tag },
  ];

  const statusColor = (s: string) => {
    if (s === "Delivered") return "text-green-400";
    if (s === "Shipped") return "text-blue-400";
    if (s === "Pending") return "text-amber-400";
    return "text-white/40";
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-white/8 pb-4">
        <h1 className="text-2xl font-light tracking-wide">Dashboard</h1>
        <p className="text-xs text-white/40 font-light mt-1">Real-time store performance overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-xl border border-white/8 bg-white/[0.01] p-5 space-y-3">
              <div className="flex justify-between items-start">
                <p className="text-[10px] tracking-widest text-white/40 uppercase font-semibold">{card.label}</p>
                <div className="p-2 rounded-lg bg-[#E0B034]/10">
                  <Icon size={14} className="text-[#E0B034]" />
                </div>
              </div>
              <p className="text-2xl font-light text-[#FFE082]">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Orders Table */}
      <div className="rounded-xl border border-white/8 bg-white/[0.01] overflow-hidden">
        <div className="border-b border-white/8 p-4 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-[#FFE082]">Recent Orders</h3>
          <span className="text-[10px] text-white/40 uppercase tracking-wider">Live Database</span>
        </div>
        {recentOrders.length === 0 ? (
          <div className="py-12 text-center text-white/30 text-xs">No orders found in your Supabase database.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-light">
              <thead>
                <tr className="border-b border-white/6 text-white/40 tracking-wider">
                  <th className="py-3 px-5">ORDER ID</th>
                  <th className="py-3 px-5">CUSTOMER</th>
                  <th className="py-3 px-5">PRODUCT</th>
                  <th className="py-3 px-5 text-right">TOTAL</th>
                  <th className="py-3 px-5">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-white/4 hover:bg-white/[0.01]">
                    <td className="py-3 px-5 font-mono text-white/50">#{order.id.slice(0, 8)}</td>
                    <td className="py-3 px-5 text-white">{order.customer || "—"}</td>
                    <td className="py-3 px-5 text-white/60">{order.product || "—"}</td>
                    <td className="py-3 px-5 text-right font-mono text-[#FFE082]">${(order.total || 0).toFixed(2)}</td>
                    <td className={`py-3 px-5 font-semibold ${statusColor(order.status)}`}>{order.status || "—"}</td>
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
