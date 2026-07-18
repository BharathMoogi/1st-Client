"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Percent,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
} from "lucide-react";

// --- MOCK ORDERS DATA ---
const RECENT_ORDERS = [
  { id: "AW-98315", customer: "Vikram Shah", product: "Gold Standard Whey (1kg)", amount: "$69.00", status: "Shipped", date: "2 mins ago" },
  { id: "AW-98314", customer: "Priya Kumar", product: "Micronized Creatine (300g)", amount: "$32.00", status: "Delivered", date: "15 mins ago" },
  { id: "AW-98313", customer: "Rohan Mehta", product: "Active BCAAs Recover", amount: "$29.00", status: "Pending", date: "1 hour ago" },
  { id: "AW-98312", customer: "Deepika R.", product: "Gold Standard Whey (1kg)", amount: "$69.00", status: "Delivered", date: "4 hours ago" },
  { id: "AW-98311", customer: "Anand Sen", product: "Micronized Creatine (300g)", amount: "$32.00", status: "Cancelled", date: "1 day ago" },
];

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const filteredOrders = RECENT_ORDERS.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.toLowerCase().includes(search.toLowerCase()) ||
      order.product.toLowerCase().includes(search.toLowerCase());
    
    if (filterStatus === "All") return matchesSearch;
    return matchesSearch && order.status === filterStatus;
  });

  const getStatusStyle = (status: string) => {
    if (status === "Delivered") return "bg-green-500/10 text-green-400 border border-green-500/20";
    if (status === "Shipped") return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
    if (status === "Pending") return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
  };

  const getStatusIcon = (status: string) => {
    if (status === "Delivered") return <CheckCircle size={12} className="inline mr-1" />;
    if (status === "Shipped") return <Truck size={12} className="inline mr-1" />;
    if (status === "Pending") return <Clock size={12} className="inline mr-1" />;
    return <XCircle size={12} className="inline mr-1" />;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title */}
      <div className="flex items-center justify-between border-b border-white/8 pb-4">
        <div>
          <h1 className="text-2xl font-light tracking-wide">Dashboard</h1>
          <p className="text-xs text-white/40 font-light mt-1">Real-time store performance overview</p>
        </div>
        <div className="text-xs font-semibold bg-[#E0B034]/10 text-[#E0B034] border border-[#E0B034]/20 px-3 py-1.5 rounded-full tracking-wider uppercase">
          LIVE FEED ACTIVE
        </div>
      </div>

      {/* --- STAT CARDS GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="relative overflow-hidden rounded-xl border border-white/8 bg-white/[0.01] p-6 gap-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-white/40 tracking-wider font-light">TOTAL REVENUE</span>
            <div className="p-2 rounded-lg bg-[#E0B034]/10 border border-[#E0B034]/20 text-[#E0B034]">
              <DollarSign size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-extralight text-[#FFE082]">$142,500</h3>
            <p className="text-[10px] text-green-400 flex items-center gap-1 mt-1 font-light">
              <TrendingUp size={10} /> +12.5% from last month
            </p>
          </div>
        </div>

        {/* Active Orders */}
        <div className="relative overflow-hidden rounded-xl border border-white/8 bg-white/[0.01] p-6 gap-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-white/40 tracking-wider font-light">ACTIVE ORDERS</span>
            <div className="p-2 rounded-lg bg-[#E0B034]/10 border border-[#E0B034]/20 text-[#E0B034]">
              <ShoppingBag size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-extralight text-[#FFE082]">348</h3>
            <p className="text-[10px] text-green-400 flex items-center gap-1 mt-1 font-light">
              <TrendingUp size={10} /> +8.2% from last month
            </p>
          </div>
        </div>

        {/* Active Customers */}
        <div className="relative overflow-hidden rounded-xl border border-white/8 bg-white/[0.01] p-6 gap-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-white/40 tracking-wider font-light">VIP MEMBERS</span>
            <div className="p-2 rounded-lg bg-[#E0B034]/10 border border-[#E0B034]/20 text-[#E0B034]">
              <Users size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-extralight text-[#FFE082]">1,280</h3>
            <p className="text-[10px] text-green-400 flex items-center gap-1 mt-1 font-light">
              <TrendingUp size={10} /> +15% from last month
            </p>
          </div>
        </div>

        {/* Active Coupons */}
        <div className="relative overflow-hidden rounded-xl border border-white/8 bg-white/[0.01] p-6 gap-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-white/40 tracking-wider font-light">ACTIVE COUPONS</span>
            <div className="p-2 rounded-lg bg-[#E0B034]/10 border border-[#E0B034]/20 text-[#E0B034]">
              <Percent size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-extralight text-[#FFE082]">4 Active</h3>
            <p className="text-[10px] text-white/40 mt-1 font-light">
              2 promotional codes, 2 gift vouchers
            </p>
          </div>
        </div>
      </div>

      {/* --- CHARTS GRID (PREMIUM RESPONSIVE SVG GRAPH) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-white/8 bg-white/[0.01] p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-white/8 pb-3">
            <h3 className="text-sm font-semibold tracking-wide text-[#FFE082]">Monthly Revenue Trends</h3>
            <span className="text-[10px] text-white/40 font-light">LAST 6 MONTHS</span>
          </div>
          {/* Custom SVG Line Chart */}
          <div className="h-64 w-full flex items-end">
            <svg viewBox="0 0 500 200" className="w-full h-full">
              {/* Grid Lines */}
              <line x1="0" y1="50" x2="500" y2="50" stroke="rgba(255,255,255,0.04)" strokeDasharray="3,3" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(255,255,255,0.04)" strokeDasharray="3,3" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="rgba(255,255,255,0.04)" strokeDasharray="3,3" />
              <line x1="0" y1="190" x2="500" y2="190" stroke="rgba(255,255,255,0.08)" />

              {/* Gold Gradient Path fill */}
              <defs>
                <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E0B034" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#E0B034" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 10 190 Q 90 140 100 130 T 200 110 T 300 80 T 400 60 T 490 30 L 490 190 Z"
                fill="url(#chartGlow)"
              />

              {/* Line */}
              <path
                d="M 10 190 Q 90 140 100 130 T 200 110 T 300 80 T 400 60 T 490 30"
                fill="none"
                stroke="#E0B034"
                strokeWidth="2.5"
              />

              {/* Interactive nodes */}
              <circle cx="100" cy="130" r="4" fill="#FFE082" stroke="#050505" strokeWidth="1" />
              <circle cx="200" cy="110" r="4" fill="#FFE082" stroke="#050505" strokeWidth="1" />
              <circle cx="300" cy="80" r="4" fill="#FFE082" stroke="#050505" strokeWidth="1" />
              <circle cx="400" cy="60" r="4" fill="#FFE082" stroke="#050505" strokeWidth="1" />
              <circle cx="490" cy="30" r="4" fill="#FFE082" stroke="#050505" strokeWidth="1" />
            </svg>
          </div>
          {/* Label rows */}
          <div className="flex justify-between text-[9px] text-white/30 tracking-widest font-light px-2">
            <span>FEB</span>
            <span>MAR</span>
            <span>APR</span>
            <span>MAY</span>
            <span>JUN</span>
            <span>JUL</span>
          </div>
        </div>

        {/* Categories Share (custom SVG gauge pie) */}
        <div className="rounded-xl border border-white/8 bg-white/[0.01] p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-white/8 pb-3">
            <h3 className="text-sm font-semibold tracking-wide text-[#FFE082]">Category Performance</h3>
            <span className="text-[10px] text-white/40 font-light">WHEY LEADING</span>
          </div>

          <div className="flex justify-center items-center h-48 relative">
            <svg width="140" height="140" viewBox="0 0 36 36" className="transform -rotate-90">
              <circle cx="18" cy="18" r="15.91" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
              {/* Whey Share (65%) */}
              <circle cx="18" cy="18" r="15.91" fill="none" stroke="#E0B034" strokeWidth="3" strokeDasharray="65 100" strokeDashoffset="0" />
              {/* Creatine Share (20%) */}
              <circle cx="18" cy="18" r="15.91" fill="none" stroke="#FFE082" strokeWidth="3" strokeDasharray="20 100" strokeDashoffset="-65" />
              {/* Other Share (15%) */}
              <circle cx="18" cy="18" r="15.91" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" strokeDasharray="15 100" strokeDashoffset="-85" />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-light text-white">65%</span>
              <span className="text-[8px] text-white/40 uppercase tracking-widest">Whey Share</span>
            </div>
          </div>

          {/* Indicators list */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-light">
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#E0B034]" /> Whey Proteins</span>
              <span className="text-white/50">65%</span>
            </div>
            <div className="flex justify-between text-xs font-light">
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#FFE082]" /> Creatine & Amino</span>
              <span className="text-white/50">20%</span>
            </div>
            <div className="flex justify-between text-xs font-light">
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-white/20" /> Multivitamins</span>
              <span className="text-white/50">15%</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- RECENT ORDERS TABLES --- */}
      <div className="rounded-xl border border-white/8 bg-white/[0.01] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center border-b border-white/8 pb-4">
          <h3 className="text-sm font-semibold tracking-wide text-[#FFE082]">Recent Store Orders</h3>
          
          {/* Actions Search & Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:flex-none">
              <Search size={14} className="absolute left-3 top-3 text-white/40" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search orders..."
                className="w-full sm:w-48 bg-white/4 border border-white/8 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#E0B034]/40"
              />
            </div>
            {/* Filters */}
            <div className="flex items-center gap-2">
              <Filter size={12} className="text-white/40" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white/4 border border-white/8 rounded-lg px-2 py-1.5 text-xs text-white/70 focus:outline-none focus:border-[#E0B034]/40"
              >
                <option value="All">All Status</option>
                <option value="Delivered">Delivered</option>
                <option value="Shipped">Shipped</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Scrollable Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-light">
            <thead>
              <tr className="border-b border-white/6 text-white/40 tracking-wider">
                <th className="py-3 px-4">ORDER ID</th>
                <th className="py-3 px-4">CUSTOMER</th>
                <th className="py-3 px-4">Supplement Product</th>
                <th className="py-3 px-4 text-right">TOTAL</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">TIMING</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-white/4 hover:bg-white/[0.01] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-[#FFE082]">{order.id}</td>
                    <td className="py-3.5 px-4">{order.customer}</td>
                    <td className="py-3.5 px-4 text-white/70">{order.product}</td>
                    <td className="py-3.5 px-4 text-right font-medium">{order.amount}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold ${getStatusStyle(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-white/40">{order.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-white/30 font-light">
                    No matching sales orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
