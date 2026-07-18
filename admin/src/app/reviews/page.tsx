"use client";

import React, { useEffect, useState } from "react";
import { Search, Trash2, Star } from "lucide-react";
import { supabase } from "../../lib/supabase";

type Review = { id: string; product: string; user: string; rating: number; verified: boolean; comment: string; status: string };

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchReviews(); }, []);

  async function fetchReviews() {
    const { data, error } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
    if (error) { setError(error.message); } else { setReviews(data || []); }
    setLoading(false);
  }

  async function handleApprove(id: string) {
    await supabase.from("reviews").update({ status: "Approved" }).eq("id", id);
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, status: "Approved" } : r));
  }

  async function handleDelete(id: string) {
    await supabase.from("reviews").delete().eq("id", id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
  }

  const filtered = reviews.filter((r) =>
    r.product?.toLowerCase().includes(search.toLowerCase()) ||
    r.user?.toLowerCase().includes(search.toLowerCase()) ||
    r.comment?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-white/8 pb-4">
        <h1 className="text-2xl font-light tracking-wide">Reviews</h1>
        <p className="text-xs text-white/40 font-light mt-1">Moderate customer testimonials and product reviews</p>
      </div>

      <div className="bg-white/[0.01] border border-white/8 p-4 rounded-xl">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-3 text-white/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reviews…"
            className="w-full bg-white/4 border border-white/8 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#E0B034]/40" />
        </div>
      </div>

      <div className="rounded-xl border border-white/8 bg-white/[0.01] overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-white/30 text-xs animate-pulse">Loading reviews…</div>
        ) : error ? (
          <div className="py-12 text-center text-red-400 text-xs">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-light">
              <thead>
                <tr className="border-b border-white/6 bg-white/[0.01] text-white/40 tracking-wider">
                  <th className="py-3.5 px-6">PRODUCT</th>
                  <th className="py-3.5 px-6">REVIEWER</th>
                  <th className="py-3.5 px-6">RATING</th>
                  <th className="py-3.5 px-6">VERIFIED</th>
                  <th className="py-3.5 px-6">COMMENT</th>
                  <th className="py-3.5 px-6">STATUS</th>
                  <th className="py-3.5 px-6 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? filtered.map((r) => (
                  <tr key={r.id} className="border-b border-white/4 hover:bg-white/[0.01] transition-colors">
                    <td className="py-4 px-6 font-medium text-white">{r.product || "—"}</td>
                    <td className="py-4 px-6">{r.user || "—"}</td>
                    <td className="py-4 px-6">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map((s) => <Star key={s} size={10} fill={s <= (r.rating || 0) ? "#FFE082" : "none"} stroke="#FFE082" />)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {r.verified ? (
                        <span className="text-[10px] text-green-400 font-semibold bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">✔ Verified</span>
                      ) : <span className="text-white/30 text-[10px]">No</span>}
                    </td>
                    <td className="py-4 px-6 text-white/60 max-w-xs truncate">{r.comment || "—"}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border ${
                        r.status === "Approved" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>{r.status || "Pending"}</span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      {r.status !== "Approved" && (
                        <button onClick={() => handleApprove(r.id)} className="px-2.5 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded hover:bg-green-500/20 text-[10px] transition-colors">APPROVE</button>
                      )}
                      <button onClick={() => handleDelete(r.id)} className="p-1 rounded hover:bg-rose-500/10 text-rose-400/60 hover:text-rose-400 transition-colors inline-block align-middle">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={7} className="py-12 text-center text-white/30">No reviews found in database.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
