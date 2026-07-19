"use client";
import React, { useEffect, useState } from "react";
import { Search, Trash2, Star } from "lucide-react";
import { db } from "../../lib/firebase";
import { collection, getDocs, deleteDoc, updateDoc, doc, query, orderBy } from "firebase/firestore";

type Review = { id: string; product: string; user: string; rating: number; verified: boolean; comment: string; status: string };

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      try {
        const snap = await getDocs(query(collection(db, "reviews"), orderBy("createdAt", "desc")));
        setReviews(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Review)));
      } catch (e: any) { setError(e.message); }
      setLoading(false);
    }
    fetch();
  }, []);

  async function handleApprove(id: string) {
    await updateDoc(doc(db, "reviews", id), { status: "Approved" });
    setReviews((r) => r.map((x) => x.id === id ? { ...x, status: "Approved" } : x));
  }

  async function handleDelete(id: string) {
    await deleteDoc(doc(db, "reviews", id));
    setReviews((r) => r.filter((x) => x.id !== id));
  }

  const filtered = reviews.filter((r) =>
    r.product?.toLowerCase().includes(search.toLowerCase()) ||
    r.user?.toLowerCase().includes(search.toLowerCase()) ||
    r.comment?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="border-b border-white/6 pb-6">
        <h1 className="text-3xl font-light tracking-wide text-white">REVIEWS</h1>
        <p className="text-xs text-white/40 mt-1.5 uppercase tracking-wider">Moderate customer testimonials from Firestore</p>
      </div>

      <div className="glass-panel p-5 shadow-xl shadow-black/40">
        <div className="relative w-80">
          <Search size={14} className="absolute left-4 top-3.5 text-white/30"/>
          <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search reviews by product or comment…" className="w-full bg-white/4 border border-white/6 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#D4AF37]/50 focus:bg-white/6 transition-all" />
        </div>
      </div>

      <div className="glass-panel overflow-hidden shadow-2xl shadow-black/50">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-2 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
            <div className="text-white/30 text-xs tracking-wider">LOADING REVIEWS…</div>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-red-400 text-xs tracking-wide">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-light">
              <thead>
                <tr className="border-b border-white/6 bg-white/[0.005] text-white/40 tracking-[0.12em] uppercase">
                  <th className="py-4 px-6 font-semibold">PRODUCT</th>
                  <th className="py-4 px-6 font-semibold">REVIEWER</th>
                  <th className="py-4 px-6 font-semibold">RATING</th>
                  <th className="py-4 px-6 font-semibold">VERIFIED</th>
                  <th className="py-4 px-6 font-semibold">COMMENT</th>
                  <th className="py-4 px-6 font-semibold">STATUS</th>
                  <th className="py-4 px-6 text-right font-semibold">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? filtered.map((r) => (
                  <tr key={r.id} className="border-b border-white/4 hover:bg-white/[0.01] transition-colors duration-200">
                    <td className="py-4.5 px-6 font-medium text-white text-sm">{r.product||"—"}</td>
                    <td className="py-4.5 px-6 text-white/60 font-medium">{r.user||"—"}</td>
                    <td className="py-4.5 px-6">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map((s)=>(
                          <Star key={s} size={10} fill={s<=(r.rating||0)?"#D4AF37":"none"} stroke="#D4AF37"/>
                        ))}
                      </div>
                    </td>
                    <td className="py-4.5 px-6">
                      {r.verified ? (
                        <span className="text-[9px] text-[#2ECC71] font-bold bg-[#2ECC71]/10 border border-[#2ECC71]/20 px-2 py-0.5 rounded-full uppercase tracking-wider">✔ Verified</span>
                      ) : (
                        <span className="text-white/20 text-[9px] uppercase tracking-wider font-bold">No</span>
                      )}
                    </td>
                    <td className="py-4.5 px-6 text-white/60 max-w-xs truncate font-medium">{r.comment||"—"}</td>
                    <td className="py-4.5 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold border ${
                        r.status==="Approved" ? "bg-[#2ECC71]/10 text-[#2ECC71] border-[#2ECC71]/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        {r.status||"Pending"}
                      </span>
                    </td>
                    <td className="py-4.5 px-6 text-right space-x-2">
                      {r.status!=="Approved"&& (
                        <button onClick={()=>handleApprove(r.id)} className="px-2.5 py-1.5 bg-[#2ECC71]/10 text-[#2ECC71] border border-[#2ECC71]/20 rounded-xl hover:bg-[#2ECC71]/20 text-[9px] font-bold tracking-wider transition-all uppercase">
                          APPROVE
                        </button>
                      )}
                      <button onClick={()=>handleDelete(r.id)} className="p-2 rounded-lg hover:bg-rose-500/10 text-white/20 hover:text-[#FF4D4F] transition-colors inline-block align-middle" title="Delete review">
                        <Trash2 size={13}/>
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-white/30 tracking-wider">No reviews in Firestore yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
