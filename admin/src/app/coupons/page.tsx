"use client";

import React, { useState } from "react";
import { Search, Plus, Trash2, Tag, Percent } from "lucide-react";

const INITIAL_COUPONS = [
  { code: "AURUM20", discount: "20% OFF", description: "20% discount on Whey Isolate products", usages: 342, status: "Active", expiry: "Dec 31, 2026" },
  { code: "GOLDSHAKE", discount: "FREE GIFT", description: "Free Tritan shaker on orders above $100", usages: 154, status: "Active", expiry: "Nov 30, 2026" },
  { code: "VITAFIT", discount: "15% OFF", description: "15% off vitamins and wellness tablets", usages: 88, status: "Active", expiry: "Aug 15, 2026" },
  { code: "WELCOME10", discount: "10% OFF", description: "10% off sign-up bonus code", usages: 580, status: "Expired", expiry: "Jan 01, 2026" }
];

export default function CouponsPage() {
  const [coupons, setCoupons] = useState(INITIAL_COUPONS);
  const [search, setSearch] = useState("");
  
  const [modalOpen, setModalOpen] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newDiscount, setNewDiscount] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newExpiry, setNewExpiry] = useState("Dec 31, 2026");

  const handleAddCoupon = () => {
    if (!newCode || !newDiscount) return;

    const newC = {
      code: newCode.toUpperCase(),
      discount: newDiscount,
      description: newDesc || "Custom promo coupon code",
      usages: 0,
      status: "Active",
      expiry: newExpiry,
    };

    setCoupons([newC, ...coupons]);
    setNewCode("");
    setNewDiscount("");
    setNewDesc("");
    setModalOpen(false);
  };

  const handleDelete = (code: string) => {
    setCoupons(coupons.filter((c) => c.code !== code));
  };

  const filteredCoupons = coupons.filter((c) => {
    return c.code.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/8 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-light tracking-wide">Coupons</h1>
          <p className="text-xs text-white/40 font-light mt-1">Manage active checkout promotion codes and discounts</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E0B034] text-[#0A0A0A] text-xs font-semibold hover:bg-[#FFE082] transition-colors"
        >
          <Plus size={14} />
          CREATE COUPON
        </button>
      </div>

      {/* Filter panel */}
      <div className="flex bg-white/[0.01] border border-white/8 p-4 rounded-xl">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-3 text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search coupon codes..."
            className="w-full bg-white/4 border border-white/8 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#E0B034]/40"
          />
        </div>
      </div>

      {/* Coupons Table */}
      <div className="rounded-xl border border-white/8 bg-white/[0.01] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-light">
            <thead>
              <tr className="border-b border-white/6 bg-white/[0.01] text-white/40 tracking-wider">
                <th className="py-3.5 px-6">COUPON CODE</th>
                <th className="py-3.5 px-6">DISCOUNT RATE</th>
                <th className="py-3.5 px-6">DESCRIPTION</th>
                <th className="py-3.5 px-6 text-right">USAGES RECORD</th>
                <th className="py-3.5 px-6">EXPIRY DATE</th>
                <th className="py-3.5 px-6">STATUS</th>
                <th className="py-3.5 px-6 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoupons.length > 0 ? (
                filteredCoupons.map((c) => (
                  <tr key={c.code} className="border-b border-white/4 hover:bg-white/[0.01] transition-colors">
                    <td className="py-4 px-6 font-mono font-semibold text-[#FFE082]">{c.code}</td>
                    <td className="py-4 px-6">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Percent size={12} className="text-[#E0B034]" />
                        {c.discount}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-white/60">{c.description}</td>
                    <td className="py-4 px-6 text-right font-mono font-medium">{c.usages} orders</td>
                    <td className="py-4 px-6 text-white/40">{c.expiry}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold ${
                        c.status === "Active"
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDelete(c.code)}
                        className="p-1 rounded hover:bg-rose-500/10 text-rose-400/60 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-white/30 font-light">
                    No matching coupons found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- CREATE COUPON MODAL --- */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md border border-white/8 rounded-2xl bg-[#090909] p-6 space-y-4">
            <h3 className="text-lg font-light text-[#FFE082] tracking-wide">Create New Coupon</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-white/40 tracking-wider block mb-1 uppercase font-semibold">Promo Code</label>
                <input
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="e.g. WHEY25"
                  className="w-full bg-white/4 border border-white/8 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#E0B034]/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-white/40 tracking-wider block mb-1 uppercase font-semibold">Discount</label>
                  <input
                    value={newDiscount}
                    onChange={(e) => setNewDiscount(e.target.value)}
                    placeholder="e.g. 25% OFF"
                    className="w-full bg-white/4 border border-white/8 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#E0B034]/40"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-white/40 tracking-wider block mb-1 uppercase font-semibold">Expiry Date</label>
                  <input
                    value={newExpiry}
                    onChange={(e) => setNewExpiry(e.target.value)}
                    placeholder="Dec 31, 2026"
                    className="w-full bg-white/4 border border-white/8 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#E0B034]/40"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-white/40 tracking-wider block mb-1 uppercase font-semibold">Description</label>
                <input
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. 25% discount on all supplements"
                  className="w-full bg-white/4 border border-white/8 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#E0B034]/40"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2 text-xs border border-white/10 rounded-lg hover:bg-white/4 font-semibold text-white/80 transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={handleAddCoupon}
                className="flex-1 py-2 text-xs rounded-lg bg-[#E0B034] text-[#0A0A0A] hover:bg-[#FFE082] font-semibold transition-colors"
              >
                PUBLISH PROMO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
