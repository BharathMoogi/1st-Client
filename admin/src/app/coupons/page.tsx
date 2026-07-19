"use client";
import React, { useEffect, useState } from "react";
import { Search, Plus, Trash2, Percent } from "lucide-react";
import { db } from "../../lib/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";

type Coupon = { id: string; code: string; discount: string; description: string; usages: number; status: string; expiry: string };

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ code: "", discount: "", description: "", expiry: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchCoupons(); }, []);

  async function fetchCoupons() {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "coupons"));
      setCoupons(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Coupon)));
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  }

  async function handleAdd() {
    if (!form.code || !form.discount) return;
    setSaving(true);
    await addDoc(collection(db, "coupons"), { ...form, code: form.code.toUpperCase(), usages: 0, status: "Active", createdAt: serverTimestamp() });
    setForm({ code: "", discount: "", description: "", expiry: "" });
    setModalOpen(false);
    fetchCoupons();
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await deleteDoc(doc(db, "coupons", id));
    setCoupons((c) => c.filter((x) => x.id !== id));
  }

  const filtered = coupons.filter((c) =>
    c.code?.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/6 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-wide text-white">COUPONS</h1>
          <p className="text-xs text-white/40 mt-1.5 uppercase tracking-wider">Live discount codes from Firestore</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8962D] text-[#070707] text-xs font-bold hover:from-[#FFE082] hover:to-[#D4AF37] transition-all shadow-lg shadow-[#D4AF37]/15">
          <Plus size={14}/>CREATE COUPON
        </button>
      </div>

      <div className="glass-panel p-5 shadow-xl shadow-black/40">
        <div className="relative w-80">
          <Search size={14} className="absolute left-4 top-3.5 text-white/30"/>
          <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search coupons by code…" className="w-full bg-white/4 border border-white/6 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#D4AF37]/50 focus:bg-white/6 transition-all" />
        </div>
      </div>

      <div className="glass-panel overflow-hidden shadow-2xl shadow-black/50">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-2 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
            <div className="text-white/30 text-xs tracking-wider">LOADING COUPONS…</div>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-red-400 text-xs tracking-wide">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-light">
              <thead>
                <tr className="border-b border-white/6 bg-white/[0.005] text-white/40 tracking-[0.12em] uppercase">
                  <th className="py-4 px-6 font-semibold">CODE</th>
                  <th className="py-4 px-6 font-semibold">DISCOUNT</th>
                  <th className="py-4 px-6 font-semibold">DESCRIPTION</th>
                  <th className="py-4 px-6 text-right font-semibold">USAGES</th>
                  <th className="py-4 px-6 font-semibold">EXPIRY</th>
                  <th className="py-4 px-6 font-semibold">STATUS</th>
                  <th className="py-4 px-6 text-right font-semibold">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? filtered.map((c) => (
                  <tr key={c.id} className="border-b border-white/4 hover:bg-white/[0.01] transition-colors duration-200">
                    <td className="py-4 px-6 font-mono font-semibold text-[#D4AF37] text-sm tracking-wide">{c.code}</td>
                    <td className="py-4 px-6">
                      <span className="flex items-center gap-1.5 font-semibold text-white">
                        <Percent size={12} className="text-[#D4AF37]"/>
                        {c.discount}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-white/60 font-medium">{c.description}</td>
                    <td className="py-4 px-6 text-right font-mono text-white font-medium">{c.usages??0}</td>
                    <td className="py-4 px-6 text-white/40 font-medium">{c.expiry||"—"}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold border ${
                        c.status==="Active" ? "bg-[#2ECC71]/10 text-[#2ECC71] border-[#2ECC71]/20"
                        : "bg-[#FF4D4F]/10 text-[#FF4D4F] border-[#FF4D4F]/20"
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button onClick={()=>handleDelete(c.id)} className="p-2 rounded-lg hover:bg-rose-500/10 text-white/20 hover:text-[#FF4D4F] transition-colors" title="Delete coupon">
                        <Trash2 size={13}/>
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-white/30 tracking-wider">No coupons in Firestore yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md border border-white/8 rounded-[24px] bg-[#0c0c0c] p-7 space-y-5 shadow-2xl shadow-black">
            <div>
              <h3 className="text-lg font-light text-[#D4AF37] tracking-wider uppercase">Create Coupon</h3>
              <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">Configure live discount parameter</p>
            </div>
            <div className="space-y-4">
              {(["code","discount","description","expiry"] as const).map((f)=>(
                <div key={f}>
                  <label className="text-[9px] text-white/40 tracking-widest block mb-1.5 uppercase font-bold">{f}</label>
                  <input value={form[f]} onChange={(e)=>setForm((p)=>({...p,[f]:e.target.value}))} placeholder={`Enter coupon ${f}`} className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/15 focus:outline-none focus:border-[#D4AF37]/50 focus:bg-white/6 transition-all" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={()=>setModalOpen(false)} className="flex-1 py-3 text-xs border border-white/10 rounded-xl hover:bg-white/4 font-semibold text-white/60 tracking-wider transition-all uppercase">CANCEL</button>
              <button onClick={handleAdd} disabled={saving} className="flex-1 py-3 text-xs rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8962D] text-[#070707] hover:from-[#FFE082] hover:to-[#D4AF37] font-bold disabled:opacity-50 tracking-wider transition-all uppercase shadow-lg shadow-[#D4AF37]/15">
                {saving?"SAVING…":"PUBLISH CODE"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
