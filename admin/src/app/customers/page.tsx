"use client";

import React, { useState } from "react";
import { Search, Users, Award, Mail, ArrowUpRight } from "lucide-react";

const INITIAL_CUSTOMERS = [
  { id: "cust-1", name: "Vikram Shah", email: "vikram@shah.com", tier: "VIP Gold", points: "2,450", spend: "$640.00", orders: 12 },
  { id: "cust-2", name: "Priya Kumar", email: "priya@kumar.com", tier: "VIP Platinum", points: "4,120", spend: "$1,120.00", orders: 18 },
  { id: "cust-3", name: "Rohan Mehta", email: "rohan@mehta.com", tier: "VIP Gold", points: "1,200", spend: "$280.00", orders: 6 },
  { id: "cust-4", name: "Deepika R.", email: "deepika@r.com", tier: "Silver Member", points: "450", spend: "$120.00", orders: 3 },
  { id: "cust-5", name: "Anand Sen", email: "anand@sen.com", tier: "Silver Member", points: "120", spend: "$69.00", orders: 1 }
];

export default function CustomersPage() {
  const [customers] = useState(INITIAL_CUSTOMERS);
  const [search, setSearch] = useState("");
  const [filterTier, setFilterTier] = useState("All");

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    if (filterTier === "All") return matchesSearch;
    return matchesSearch && c.tier === filterTier;
  });

  const getTierBadgeStyle = (tier: string) => {
    if (tier === "VIP Platinum") return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
    if (tier === "VIP Gold") return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex justify-between items-center border-b border-white/8 pb-4">
        <div>
          <h1 className="text-2xl font-light tracking-wide">Customers</h1>
          <p className="text-xs text-white/40 font-light mt-1">Manage user portfolios, VIP tier status and rewards balance</p>
        </div>
      </div>

      {/* Filter panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.01] border border-white/8 p-4 rounded-xl">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-3 text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search buyers by name, email..."
            className="w-full bg-white/4 border border-white/8 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#E0B034]/40"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-white/40 font-light">VIP Status:</span>
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="bg-white/4 border border-white/8 rounded-lg px-3 py-2 text-xs text-white/70 focus:outline-none focus:border-[#E0B034]/40"
          >
            <option value="All">All Tiers</option>
            <option value="VIP Platinum">VIP Platinum</option>
            <option value="VIP Gold">VIP Gold</option>
            <option value="Silver Member">Silver Member</option>
          </select>
        </div>
      </div>

      {/* Customer profiles list */}
      <div className="rounded-xl border border-white/8 bg-white/[0.01] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-light">
            <thead>
              <tr className="border-b border-white/6 bg-white/[0.01] text-white/40 tracking-wider">
                <th className="py-3.5 px-6">BUYER NAME</th>
                <th className="py-3.5 px-6">EMAIL</th>
                <th className="py-3.5 px-6">VIP CLUB TIER</th>
                <th className="py-3.5 px-6 text-right">REWARDS BALANCE</th>
                <th className="py-3.5 px-6 text-right">ORDERS COUNT</th>
                <th className="py-3.5 px-6 text-right">TOTAL SPEND</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="border-b border-white/4 hover:bg-white/[0.01] transition-colors">
                    <td className="py-4 px-6 font-medium text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/4 border border-white/8 flex items-center justify-center text-[10px] font-semibold text-[#FFE082]">
                        {c.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      {c.name}
                    </td>
                    <td className="py-4 px-6 text-white/60">
                      <span className="flex items-center gap-1.5">
                        <Mail size={12} className="text-white/30" />
                        {c.email}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold inline-flex items-center gap-1 ${getTierBadgeStyle(c.tier)}`}>
                        <Award size={10} />
                        {c.tier}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-medium text-[#FFE082]">{c.points} pts</td>
                    <td className="py-4 px-6 text-right font-mono text-white/50">{c.orders} checkout purchases</td>
                    <td className="py-4 px-6 text-right font-mono font-medium text-white">{c.spend}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-white/30 font-light">
                    No matching buyers found.
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
