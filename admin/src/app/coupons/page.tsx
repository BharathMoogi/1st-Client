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
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/8 pb-4 gap-4">
        <div><h1 className="text-2xl font-light tracking-wide">Coupons</h1><p className="text-xs text-white/40 mt-1">Live discount codes from Firestore</p></div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E0B034] text-[#0A0A0A] text-xs font-semibold hover:bg-[#FFE082]"><Plus size={14}/>CREATE COUPON</button>
      </div>
      <div className="bg-white/[0.01] border border-white/8 p-4 rounded-xl">
        <div className="relative w-72"><Search size={14} className="absolute left-3 top-3 text-white/40"/>
          <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search coupons…" className="w-full bg-white/4 border border-white/8 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#E0B034]/40"/>
        </div>
      </div>
      <div className="rounded-xl border border-white/8 bg-white/[0.01] overflow-hidden">
        {loading ? <div className="py-12 text-center text-white/30 text-xs animate-pulse">Loading…</div>
          : error ? <div className="py-12 text-center text-red-400 text-xs">{error}</div>
          : <div className="overflow-x-auto"><table className="w-full text-left text-xs font-light">
              <thead><tr className="border-b border-white/6 bg-white/[0.01] text-white/40 tracking-wider">
                <th className="py-3.5 px-6">CODE</th><th className="py-3.5 px-6">DISCOUNT</th><th className="py-3.5 px-6">DESCRIPTION</th>
                <th className="py-3.5 px-6 text-right">USAGES</th><th className="py-3.5 px-6">EXPIRY</th><th className="py-3.5 px-6">STATUS</th><th className="py-3.5 px-6 text-right">ACTIONS</th>
              </tr></thead>
              <tbody>{filtered.length > 0 ? filtered.map((c) => (
                <tr key={c.id} className="border-b border-white/4 hover:bg-white/[0.01]">
                  <td className="py-4 px-6 font-mono font-semibold text-[#FFE082]">{c.code}</td>
                  <td className="py-4 px-6"><span className="flex items-center gap-1.5"><Percent size={12} className="text-[#E0B034]"/>{c.discount}</span></td>
                  <td className="py-4 px-6 text-white/60">{c.description}</td>
                  <td className="py-4 px-6 text-right font-mono">{c.usages??0}</td>
                  <td className="py-4 px-6 text-white/40">{c.expiry||"—"}</td>
                  <td className="py-4 px-6"><span className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold border ${c.status==="Active"?"bg-green-500/10 text-green-400 border-green-500/20":"bg-rose-500/10 text-rose-400 border-rose-500/20"}`}>{c.status}</span></td>
                  <td className="py-4 px-6 text-right"><button onClick={()=>handleDelete(c.id)} className="p-1 rounded hover:bg-rose-500/10 text-rose-400/60 hover:text-rose-400"><Trash2 size={14}/></button></td>
                </tr>)) : <tr><td colSpan={7} className="py-12 text-center text-white/30">No coupons in Firestore yet.</td></tr>}
              </tbody>
            </table></div>}
      </div>
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md border border-white/8 rounded-2xl bg-[#090909] p-6 space-y-4">
            <h3 className="text-lg font-light text-[#FFE082]">Create Coupon</h3>
            {(["code","discount","description","expiry"] as const).map((f)=>(
              <div key={f}><label className="text-[10px] text-white/40 tracking-wider block mb-1 uppercase font-semibold">{f}</label>
                <input value={form[f]} onChange={(e)=>setForm((p)=>({...p,[f]:e.target.value}))} placeholder={`Enter ${f}`} className="w-full bg-white/4 border border-white/8 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#E0B034]/40"/>
              </div>
            ))}
            <div className="flex gap-3">
              <button onClick={()=>setModalOpen(false)} className="flex-1 py-2 text-xs border border-white/10 rounded-lg hover:bg-white/4 font-semibold text-white/80">CANCEL</button>
              <button onClick={handleAdd} disabled={saving} className="flex-1 py-2 text-xs rounded-lg bg-[#E0B034] text-[#0A0A0A] hover:bg-[#FFE082] font-semibold disabled:opacity-50">{saving?"SAVING…":"PUBLISH"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
