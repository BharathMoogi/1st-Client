"use client";

import React, { useState } from "react";
import { Search, Trash2, CheckCircle, Star, MessageSquare } from "lucide-react";

const INITIAL_REVIEWS = [
  { id: "rev-1", product: "Gold Standard Whey Isolate (1kg)", user: "Vikram Shah", rating: 5, verified: true, comment: "Mixes instantly without any clumping. Premium chocolate taste.", status: "Approved" },
  { id: "rev-2", product: "Micronized Creatine Powder (300g)", user: "Priya Kumar", rating: 5, verified: true, comment: "Aurum Whey is definitely worth the luxury price. clean labels.", status: "Approved" },
  { id: "rev-3", product: "Active BCAAs Recover Matrix", user: "Rohan Mehta", rating: 4, verified: true, comment: "Mixes well but chocolate flavor is out of stock often. Stock more!", status: "Pending" }
];

export default function ReviewsPage() {
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [search, setSearch] = useState("");

  const handleApprove = (id: string) => {
    setReviews(reviews.map((r) => r.id === id ? { ...r, status: "Approved" } : r));
  };

  const handleDelete = (id: string) => {
    setReviews(reviews.filter((r) => r.id !== id));
  };

  const filteredReviews = reviews.filter((r) => {
    return r.product.toLowerCase().includes(search.toLowerCase()) || r.user.toLowerCase().includes(search.toLowerCase()) || r.comment.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex justify-between items-center border-b border-white/8 pb-4">
        <div>
          <h1 className="text-2xl font-light tracking-wide">Reviews</h1>
          <p className="text-xs text-white/40 font-light mt-1">Moderate customer testimonials and product reviews</p>
        </div>
      </div>

      {/* Filter panel */}
      <div className="flex bg-white/[0.01] border border-white/8 p-4 rounded-xl">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-3 text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviews by product, user, comment..."
            className="w-full bg-white/4 border border-white/8 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#E0B034]/40"
          />
        </div>
      </div>

      {/* Reviews Table */}
      <div className="rounded-xl border border-white/8 bg-white/[0.01] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-light">
            <thead>
              <tr className="border-b border-white/6 bg-white/[0.01] text-white/40 tracking-wider">
                <th className="py-3.5 px-6">PRODUCT</th>
                <th className="py-3.5 px-6">REVIEWER</th>
                <th className="py-3.5 px-6">RATING</th>
                <th className="py-3.5 px-6">VERIFIED BUYER</th>
                <th className="py-3.5 px-6">COMMENT</th>
                <th className="py-3.5 px-6">STATUS</th>
                <th className="py-3.5 px-6 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.length > 0 ? (
                filteredReviews.map((r) => (
                  <tr key={r.id} className="border-b border-white/4 hover:bg-white/[0.01] transition-colors">
                    <td className="py-4 px-6 font-medium text-white">{r.product}</td>
                    <td className="py-4 px-6">{r.user}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={10} fill={s <= r.rating ? "#FFE082" : "none"} stroke="#FFE082" />
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {r.verified ? (
                        <span className="text-[10px] text-green-400 font-semibold bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          ✔ Verified
                        </span>
                      ) : (
                        <span className="text-white/30 text-[10px]">No</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-white/60 max-w-xs truncate">{r.comment}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                        r.status === "Approved"
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      {r.status === "Pending" && (
                        <button
                          onClick={() => handleApprove(r.id)}
                          className="px-2.5 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded hover:bg-green-500/20 text-[10px] transition-colors"
                        >
                          APPROVE
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-1 rounded hover:bg-rose-500/10 text-rose-400/60 hover:text-rose-400 transition-colors inline-block align-middle"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-white/30 font-light">
                    No matching customer reviews found.
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
